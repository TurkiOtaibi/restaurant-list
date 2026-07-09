from __future__ import annotations

import asyncio
import ipaddress
import os
import sys
from collections.abc import Mapping
from pathlib import Path
from typing import Any

from sqlalchemy.engine import URL, make_url
from sqlalchemy.exc import ArgumentError

BACKEND_ROOT = Path(__file__).resolve().parents[1]
E2E_DIR = BACKEND_ROOT / ".e2e"
E2E_FRONTEND_PORT = os.environ.get("E2E_FRONTEND_PORT", os.environ.get("PLAYWRIGHT_PORT", "3000"))
E2E_API_PORT = int(os.environ.get("E2E_API_PORT", "8000"))
LOOPBACK_HOSTS = {"localhost", "127.0.0.1", "::1"}


def default_e2e_database_url() -> str:
    database_path = E2E_DIR / "api.db"
    return f"sqlite+aiosqlite:///{database_path.as_posix()}"


def resolve_e2e_database_url(environ: Mapping[str, str] | None = None) -> str:
    environment = os.environ if environ is None else environ
    raw_url = environment.get("E2E_DATABASE_URL") or default_e2e_database_url()

    try:
        url = make_url(raw_url)
    except ArgumentError as exc:
        raise ValueError("E2E_DATABASE_URL is not a valid database URL.") from exc

    if url.get_backend_name() == "sqlite":
        return _validate_sqlite_url(url)
    if url.get_backend_name() == "postgresql":
        return _validate_postgresql_url(url)

    raise ValueError(
        f"E2E_DATABASE_URL uses unsupported dialect {url.get_backend_name()!r}; "
        "only SQLite and local PostgreSQL test databases are allowed."
    )


def _validate_sqlite_url(url: URL) -> str:
    database = url.database
    if not database or database == ":memory:":
        raise ValueError("E2E_DATABASE_URL must point to a SQLite file, not an in-memory database.")

    database_path = Path(database)
    if not database_path.is_absolute():
        database_path = BACKEND_ROOT / database_path
    resolved_path = database_path.resolve()
    resolved_e2e_dir = E2E_DIR.resolve()
    try:
        resolved_path.relative_to(resolved_e2e_dir)
    except ValueError as exc:
        raise ValueError(
            f"SQLite E2E database must be inside {resolved_e2e_dir}; got {resolved_path}."
        ) from exc

    if resolved_path == resolved_e2e_dir:
        raise ValueError("E2E_DATABASE_URL must point to a file inside the .e2e directory.")

    return url.set(database=resolved_path.as_posix()).render_as_string(hide_password=False)


def _validate_postgresql_url(url: URL) -> str:
    host = (url.host or "").lower()
    is_loopback_ip = False
    try:
        is_loopback_ip = ipaddress.ip_address(host).is_loopback
    except ValueError:
        pass
    if host not in LOOPBACK_HOSTS and not is_loopback_ip:
        raise ValueError(
            "E2E_DATABASE_URL PostgreSQL host must be localhost or a loopback address."
        )

    database = url.database or ""
    if not (database.endswith("_test") or database.endswith("_e2e")):
        raise ValueError(
            "E2E_DATABASE_URL PostgreSQL database name must end with '_test' or '_e2e'."
        )

    return url.render_as_string(hide_password=False)


def _configure_runtime_environment(database_url: str) -> None:
    os.environ["APP_ENV"] = "e2e"
    os.environ["DATABASE_URL"] = database_url
    os.environ.setdefault("JWT_ACCESS_SECRET", "e2e-access-secret")
    os.environ.setdefault("JWT_REFRESH_SECRET", "e2e-refresh-secret")
    os.environ.setdefault("REFRESH_COOKIE_SECURE", "false")
    os.environ.setdefault("AUTH_RATE_LIMIT_REQUESTS", "200")
    os.environ.setdefault("AUTH_RATE_LIMIT_WINDOW_SECONDS", "60")
    os.environ.setdefault(
        "CORS_ORIGINS",
        f'["http://127.0.0.1:{E2E_FRONTEND_PORT}","http://localhost:{E2E_FRONTEND_PORT}"]',
    )
    os.environ.setdefault(
        "CORS_ALLOW_ORIGIN_REGEX",
        rf"http://(localhost|127\.0\.0\.1):{E2E_FRONTEND_PORT}",
    )


async def prepare_database(database_engine: Any, base: Any) -> None:
    async with database_engine.begin() as connection:
        await connection.run_sync(base.metadata.drop_all)
        await connection.run_sync(base.metadata.create_all)


def main() -> None:
    database_url = resolve_e2e_database_url()
    _configure_runtime_environment(database_url)
    parsed_url = make_url(database_url)
    if parsed_url.get_backend_name() == "sqlite":
        database_path = parsed_url.database
        if database_path is None:
            raise ValueError("E2E_DATABASE_URL must point to a SQLite file.")
        Path(database_path).parent.mkdir(parents=True, exist_ok=True)

    sys.path.insert(0, str(BACKEND_ROOT))
    import uvicorn

    from app.db.base import Base
    from app.db.session import engine

    asyncio.run(prepare_database(engine, Base))
    uvicorn.run(
        "app.main:app",
        host=os.environ.get("E2E_API_HOST", "localhost"),
        port=E2E_API_PORT,
        log_level="warning",
    )


if __name__ == "__main__":
    main()
