import ipaddress
from functools import lru_cache
from urllib.parse import urlsplit

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

DEFAULT_JWT_ACCESS_SECRET = "dev-only-access-secret-placeholder-32-bytes"
DEFAULT_JWT_REFRESH_SECRET = "dev-only-refresh-secret-placeholder-32-bytes"
LOOPBACK_HOSTS = {"localhost", "127.0.0.1", "::1"}


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
    jwt_access_secret: str = Field(default=DEFAULT_JWT_ACCESS_SECRET, alias="JWT_ACCESS_SECRET")
    jwt_refresh_secret: str = Field(default=DEFAULT_JWT_REFRESH_SECRET, alias="JWT_REFRESH_SECRET")
    access_token_expire_minutes: int = Field(default=15, alias="ACCESS_TOKEN_EXPIRE_MINUTES")
    refresh_token_expire_days: int = Field(default=30, alias="REFRESH_TOKEN_EXPIRE_DAYS")
    refresh_cookie_name: str = Field(
        default="restaurant_refresh_token", alias="REFRESH_COOKIE_NAME"
    )
    refresh_cookie_secure: bool = Field(default=True, alias="REFRESH_COOKIE_SECURE")
    refresh_cookie_samesite: str = Field(default="lax", alias="REFRESH_COOKIE_SAMESITE")
    auth_rate_limit_requests: int = Field(default=10, alias="AUTH_RATE_LIMIT_REQUESTS")
    auth_rate_limit_window_seconds: int = Field(default=60, alias="AUTH_RATE_LIMIT_WINDOW_SECONDS")
    public_read_rate_limit_requests: int = Field(
        default=60,
        gt=0,
        le=1000,
        alias="PUBLIC_READ_RATE_LIMIT_REQUESTS",
    )
    public_read_rate_limit_window_seconds: int = Field(
        default=60,
        gt=0,
        le=86400,
        alias="PUBLIC_READ_RATE_LIMIT_WINDOW_SECONDS",
    )
    enable_api_docs: bool = Field(default=False, alias="ENABLE_API_DOCS")
    cors_origins: list[str] = Field(
        default_factory=lambda: ["http://localhost:3000", "http://127.0.0.1:3000"],
        alias="CORS_ORIGINS",
    )
    cors_allow_origin_regex: str | None = Field(default=None, alias="CORS_ALLOW_ORIGIN_REGEX")
    redis_url: str | None = Field(default=None, alias="REDIS_URL")
    storage_endpoint_url: str | None = Field(default=None, alias="STORAGE_ENDPOINT_URL")
    storage_bucket: str | None = Field(default=None, alias="STORAGE_BUCKET")
    storage_access_key_id: str | None = Field(default=None, alias="STORAGE_ACCESS_KEY_ID")
    storage_secret_access_key: str | None = Field(default=None, alias="STORAGE_SECRET_ACCESS_KEY")
    storage_public_base_url: str | None = Field(default=None, alias="STORAGE_PUBLIC_BASE_URL")
    storage_local_dir: str = Field(
        default=".local-storage/place-images",
        alias="STORAGE_LOCAL_DIR",
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

        if len(self.jwt_access_secret.encode("utf-8")) < 32:
            raise ValueError("JWT_ACCESS_SECRET must be at least 32 UTF-8 bytes in production.")
        if len(self.jwt_refresh_secret.encode("utf-8")) < 32:
            raise ValueError("JWT_REFRESH_SECRET must be at least 32 UTF-8 bytes in production.")
        if self.jwt_access_secret == DEFAULT_JWT_ACCESS_SECRET:
            raise ValueError(
                "JWT_ACCESS_SECRET must not use the development default in production."
            )
        if self.jwt_refresh_secret == DEFAULT_JWT_REFRESH_SECRET:
            raise ValueError(
                "JWT_REFRESH_SECRET must not use the development default in production."
            )
        if self.jwt_access_secret == self.jwt_refresh_secret:
            raise ValueError(
                "JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different in production."
            )

        if not self.refresh_cookie_secure:
            raise ValueError("Production refresh cookies must be Secure.")

        if self.refresh_cookie_samesite.lower() not in {"lax", "strict", "none"}:
            raise ValueError("REFRESH_COOKIE_SAMESITE must be lax, strict, or none.")

        if not self.cors_origins:
            raise ValueError(
                "CORS_ORIGINS must contain at least one explicit origin in production."
            )
        if self.cors_allow_origin_regex is not None:
            raise ValueError("CORS_ALLOW_ORIGIN_REGEX is not permitted in production.")

        for origin in self.cors_origins:
            if origin != origin.strip():
                raise ValueError("CORS_ORIGINS must not contain surrounding whitespace.")
            if "*" in origin:
                raise ValueError("CORS_ORIGINS must not contain wildcard origins in production.")
            try:
                parsed_origin = urlsplit(origin)
                hostname = parsed_origin.hostname
                _ = parsed_origin.port
            except ValueError as exc:
                raise ValueError(
                    "CORS_ORIGINS must contain valid HTTPS origins in production."
                ) from exc

            if (
                parsed_origin.scheme.lower() != "https"
                or not parsed_origin.netloc
                or hostname is None
                or parsed_origin.username is not None
                or parsed_origin.password is not None
                or parsed_origin.path
                or "?" in origin
                or "#" in origin
            ):
                raise ValueError(
                    "CORS_ORIGINS must contain HTTPS origins without paths or credentials."
                )

            normalized_hostname = hostname.lower().rstrip(".")
            is_loopback_ip = False
            try:
                parsed_ip = ipaddress.ip_address(hostname)
                is_loopback_ip = parsed_ip.is_loopback
                if parsed_ip.version == 6 and parsed_ip.ipv4_mapped is not None:
                    is_loopback_ip = is_loopback_ip or parsed_ip.ipv4_mapped.is_loopback
            except ValueError:
                pass
            if (
                normalized_hostname in LOOPBACK_HOSTS
                or normalized_hostname.endswith(".localhost")
                or is_loopback_ip
            ):
                raise ValueError("CORS_ORIGINS must not contain loopback or localhost origins.")

        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
