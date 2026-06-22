import os
from collections.abc import AsyncGenerator
from pathlib import Path

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import event
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from app.core.config import async_database_url
from app.core.rate_limit import reset_rate_limits
from app.db.base import Base
from app.db.session import get_db
from app.main import create_app


def _test_database_url(tmp_path: Path) -> str:
    """Resolve the database URL for the test session.

    Uses PostgreSQL when ``POSTGRES_TEST_DATABASE_URL`` is provided (CI and any
    Postgres-backed local run) so foreign keys, cascades, and CHECK constraints are
    exercised on the production engine. Falls back to a throwaway SQLite file
    otherwise. ``DATABASE_URL`` is deliberately NOT used as a fallback to avoid
    dropping tables in a real environment.
    """
    raw = os.getenv("POSTGRES_TEST_DATABASE_URL")
    if raw:
        normalized = async_database_url(raw)
        if normalized.startswith("postgresql+asyncpg://"):
            return normalized
    database_path = tmp_path / "test.db"
    return f"sqlite+aiosqlite:///{database_path.as_posix()}"


@pytest.fixture(autouse=True)
def reset_auth_rate_limits() -> None:
    reset_rate_limits()


@pytest.fixture()
async def session_factory(
    tmp_path: Path,
) -> AsyncGenerator[async_sessionmaker[AsyncSession], None]:
    url = _test_database_url(tmp_path)

    if url.startswith("sqlite"):
        engine = create_async_engine(
            url,
            connect_args={"check_same_thread": False},
            poolclass=NullPool,
        )

        @event.listens_for(engine.sync_engine, "connect")
        def _enable_sqlite_foreign_keys(dbapi_connection: object, _: object) -> None:
            cursor = dbapi_connection.cursor()  # type: ignore[attr-defined]
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()

    else:
        engine = create_async_engine(url, poolclass=NullPool)

    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.drop_all)
        await connection.run_sync(Base.metadata.create_all)

    try:
        yield async_sessionmaker(engine, expire_on_commit=False)
    finally:
        async with engine.begin() as connection:
            await connection.run_sync(Base.metadata.drop_all)
        await engine.dispose()


@pytest.fixture()
async def client(
    session_factory: async_sessionmaker[AsyncSession],
) -> AsyncGenerator[AsyncClient, None]:
    app = create_app()

    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        async with session_factory() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="https://testserver",
    ) as test_client:
        yield test_client

    app.dependency_overrides.clear()
