import pytest
from pydantic import ValidationError

from app.core.config import Settings, sync_database_url


def test_production_rejects_default_jwt_secrets() -> None:
    with pytest.raises(ValidationError):
        Settings(APP_ENV="production")


def test_production_accepts_configured_jwt_secrets() -> None:
    settings = Settings(
        APP_ENV="production",
        JWT_ACCESS_SECRET="a" * 32,
        JWT_REFRESH_SECRET="r" * 32,
        CORS_ORIGINS=["https://app.example.com"],
    )

    assert settings.app_env == "production"


@pytest.mark.parametrize("secret_name", ["JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"])
def test_production_rejects_short_non_default_jwt_secrets(secret_name: str) -> None:
    secrets = {"JWT_ACCESS_SECRET": "a" * 32, "JWT_REFRESH_SECRET": "r" * 32}
    secrets[secret_name] = "x" * 31

    with pytest.raises(ValidationError, match=secret_name):
        Settings(
            APP_ENV="production",
            JWT_ACCESS_SECRET=secrets["JWT_ACCESS_SECRET"],
            JWT_REFRESH_SECRET=secrets["JWT_REFRESH_SECRET"],
            CORS_ORIGINS=["https://app.example.com"],
        )


def test_production_counts_utf8_bytes_for_jwt_secret_length() -> None:
    with pytest.raises(ValidationError, match="JWT_ACCESS_SECRET"):
        Settings(
            APP_ENV="production",
            JWT_ACCESS_SECRET="\u00e9" * 15,
            JWT_REFRESH_SECRET="r" * 32,
            CORS_ORIGINS=["https://app.example.com"],
        )

    settings = Settings(
        APP_ENV="production",
        JWT_ACCESS_SECRET="\u00e9" * 16,
        JWT_REFRESH_SECRET="r" * 32,
        CORS_ORIGINS=["https://app.example.com"],
    )

    assert settings.app_env == "production"


def test_production_rejects_equal_jwt_secrets() -> None:
    with pytest.raises(ValidationError, match="JWT_ACCESS_SECRET.*JWT_REFRESH_SECRET"):
        Settings(
            APP_ENV="production",
            JWT_ACCESS_SECRET="x" * 32,
            JWT_REFRESH_SECRET="x" * 32,
            CORS_ORIGINS=["https://app.example.com"],
        )


def test_production_accepts_distinct_boundary_jwt_secrets() -> None:
    settings = Settings(
        APP_ENV="production",
        JWT_ACCESS_SECRET="a" * 32,
        JWT_REFRESH_SECRET="r" * 32,
        CORS_ORIGINS=["https://app.example.com"],
    )

    assert settings.app_env == "production"


@pytest.mark.parametrize("app_env", ["development", "e2e"])
def test_non_production_accepts_explicit_short_secrets_and_local_cors(app_env: str) -> None:
    settings = Settings(
        APP_ENV=app_env,
        JWT_ACCESS_SECRET="test-" + "access-placeholder",
        JWT_REFRESH_SECRET="test-" + "refresh-placeholder",
        REFRESH_COOKIE_SECURE=False,
        CORS_ORIGINS=["http://127.0.0.1:3000"],
        CORS_ALLOW_ORIGIN_REGEX=r"http://(localhost|127\.0\.0\.1):3000",
    )

    assert settings.app_env == app_env


def test_production_accepts_explicit_https_cors_origin() -> None:
    settings = Settings(
        APP_ENV="production",
        JWT_ACCESS_SECRET="a" * 32,
        JWT_REFRESH_SECRET="r" * 32,
        CORS_ORIGINS=["https://app.example.com"],
    )

    assert settings.cors_origins == ["https://app.example.com"]


@pytest.mark.parametrize(
    ("origins", "regex"),
    [
        (["*"], None),
        (["https://app.example.com"], ".*"),
        (["http://app.example.com"], None),
        ([" https://app.example.com"], None),
        (["https://app.example.com "], None),
        (["https://localhost"], None),
        (["https://api.localhost"], None),
        (["https://api.localhost."], None),
        (["https://127.0.0.1"], None),
        (["https://[::1]"], None),
        (["https://[::ffff:127.0.0.1]"], None),
        (["https://app.example.com?"], None),
        (["https://app.example.com#"], None),
        (["https://app.example.com/path"], None),
        (["https://user:password@app.example.com"], None),
        (["https://[invalid"], None),
        ([], None),
    ],
)
def test_production_rejects_unsafe_cors_configuration(
    origins: list[str], regex: str | None
) -> None:
    with pytest.raises(ValidationError, match="CORS"):
        Settings(
            APP_ENV="production",
            JWT_ACCESS_SECRET="a" * 32,
            JWT_REFRESH_SECRET="r" * 32,
            CORS_ORIGINS=origins,
            CORS_ALLOW_ORIGIN_REGEX=regex,
        )


def test_render_postgres_url_is_normalized_for_async_runtime() -> None:
    settings = Settings(DATABASE_URL="postgresql://user:pass@host:5432/app")

    assert settings.database_url == "postgresql+asyncpg://user:pass@host:5432/app"


def test_sync_database_url_uses_psycopg_for_alembic() -> None:
    assert (
        sync_database_url("postgresql+asyncpg://user:pass@host:5432/app")
        == "postgresql+psycopg://user:pass@host:5432/app"
    )
