import pytest
from pydantic import ValidationError

from app.core.config import Settings


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
