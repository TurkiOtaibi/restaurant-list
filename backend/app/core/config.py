from functools import lru_cache

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def async_database_url(value: str) -> str:
    if value.startswith("postgresql://"):
        return value.replace("postgresql://", "postgresql+asyncpg://", 1)
    if value.startswith("postgres://"):
        return value.replace("postgres://", "postgresql+asyncpg://", 1)
    if value.startswith("postgresql+psycopg://"):
        return value.replace("postgresql+psycopg://", "postgresql+asyncpg://", 1)
    if value.startswith("postgresql+psycopg2://"):
        return value.replace("postgresql+psycopg2://", "postgresql+asyncpg://", 1)
    return value


def sync_database_url(value: str) -> str:
    normalized = async_database_url(value)
    if normalized.startswith("postgresql+asyncpg://"):
        return normalized.replace("postgresql+asyncpg://", "postgresql+psycopg://", 1)
    return normalized


class Settings(BaseSettings):
    app_name: str = Field(default="Restaurant Wishlist API", alias="APP_NAME")
    app_env: str = Field(default="development", alias="APP_ENV")
    database_url: str = Field(
        default="postgresql+asyncpg://restaurant_user:restaurant_password@localhost:5432/restaurant_wishlist",
        alias="DATABASE_URL",
    )
    jwt_access_secret: str = Field(default="change-me-access-secret", alias="JWT_ACCESS_SECRET")
    jwt_refresh_secret: str = Field(default="change-me-refresh-secret", alias="JWT_REFRESH_SECRET")
    access_token_expire_minutes: int = Field(default=15, alias="ACCESS_TOKEN_EXPIRE_MINUTES")
    refresh_token_expire_days: int = Field(default=30, alias="REFRESH_TOKEN_EXPIRE_DAYS")
    refresh_cookie_name: str = Field(
        default="restaurant_refresh_token", alias="REFRESH_COOKIE_NAME"
    )
    refresh_cookie_secure: bool = Field(default=True, alias="REFRESH_COOKIE_SECURE")
    refresh_cookie_samesite: str = Field(default="lax", alias="REFRESH_COOKIE_SAMESITE")
    auth_rate_limit_requests: int = Field(default=100, alias="AUTH_RATE_LIMIT_REQUESTS")
    auth_rate_limit_window_seconds: int = Field(default=60, alias="AUTH_RATE_LIMIT_WINDOW_SECONDS")
    enable_api_docs: bool = Field(default=False, alias="ENABLE_API_DOCS")
    cors_origins: list[str] = Field(
        default_factory=lambda: ["http://localhost:3000", "http://127.0.0.1:3000"],
        alias="CORS_ORIGINS",
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        populate_by_name=True,
    )

    @field_validator("database_url", mode="before")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        return async_database_url(value)

    @model_validator(mode="after")
    def reject_default_production_secrets(self) -> "Settings":
        if self.app_env.lower() != "production":
            return self

        default_access_secret = "change-me-access-secret"
        default_refresh_secret = "change-me-refresh-secret"
        if (
            self.jwt_access_secret == default_access_secret
            or self.jwt_refresh_secret == default_refresh_secret
            or self.jwt_access_secret == self.jwt_refresh_secret
        ):
            raise ValueError("Production JWT secrets must be unique and explicitly configured.")

        if not self.refresh_cookie_secure:
            raise ValueError("Production refresh cookies must be Secure.")

        if self.refresh_cookie_samesite.lower() not in {"lax", "strict", "none"}:
            raise ValueError("REFRESH_COOKIE_SAMESITE must be lax, strict, or none.")

        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
