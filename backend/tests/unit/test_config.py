import pytest
from pydantic import ValidationError

from app.core.config import Settings, sync_database_url


def test_production_rejects_default_jwt_secrets() -> None:
    with pytest.raises(ValidationError):
        Settings(APP_ENV="production")


def test_production_accepts_configured_jwt_secrets() -> None:
    settings = Settings(
        APP_ENV="production",
        JWT_ACCESS_SECRET="production-access-secret",
        JWT_REFRESH_SECRET="production-refresh-secret",
    )

    assert settings.app_env == "production"


def test_render_postgres_url_is_normalized_for_async_runtime() -> None:
    settings = Settings(DATABASE_URL="postgresql://user:pass@host:5432/app")

    assert settings.database_url == "postgresql+asyncpg://user:pass@host:5432/app"


def test_sync_database_url_uses_psycopg_for_alembic() -> None:
    assert (
        sync_database_url("postgresql+asyncpg://user:pass@host:5432/app")
        == "postgresql+psycopg://user:pass@host:5432/app"
    )
