from datetime import UTC, datetime, timedelta
from typing import Literal, NoReturn, cast

from fastapi import Response, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.errors import api_error, conflict
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    hash_token,
    verify_password,
)
from app.db.utils import new_id, utc_now
from app.modules.auth.models import (
    RefreshToken,
    User,
    email_filter,
    normalize_display_name,
    normalize_email,
)
from app.modules.auth.schemas import (
    LoginRequest,
    RefreshResponse,
    RegisterRequest,
    TokenPairResponse,
    UserResponse,
)


def refresh_cookie_max_age() -> int:
    return get_settings().refresh_token_expire_days * 24 * 60 * 60


def refresh_cookie_samesite() -> Literal["lax", "strict", "none"]:
    return cast(Literal["lax", "strict", "none"], get_settings().refresh_cookie_samesite)


def set_refresh_cookie(response: Response, refresh_token: str) -> None:
    settings = get_settings()
    response.set_cookie(
        settings.refresh_cookie_name,
        refresh_token,
        max_age=refresh_cookie_max_age(),
        httponly=True,
        secure=settings.refresh_cookie_secure,
        samesite=refresh_cookie_samesite(),
        path="/api/v1/auth",
    )


def clear_refresh_cookie(response: Response) -> None:
    settings = get_settings()
    response.delete_cookie(
        settings.refresh_cookie_name,
        httponly=True,
        secure=settings.refresh_cookie_secure,
        samesite=refresh_cookie_samesite(),
        path="/api/v1/auth",
    )


def _as_aware_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)


def _refresh_expiry() -> datetime:
    return datetime.now(UTC) + timedelta(days=get_settings().refresh_token_expire_days)


def refresh_token_error(
    code: str = "INVALID_REFRESH_TOKEN",
    message: str = "Refresh token is invalid or revoked.",
) -> NoReturn:
    api_error(status.HTTP_401_UNAUTHORIZED, code, message)


def new_refresh_token_record(user: User) -> tuple[str, RefreshToken]:
    token_id = new_id()
    refresh_token = create_refresh_token(user.id, extra_claims={"jti": token_id})
    token_record = RefreshToken(
        id=token_id,
        user_id=user.id,
        token_hash=hash_token(refresh_token),
        expires_at=_refresh_expiry(),
    )
    return refresh_token, token_record


async def issue_token_pair(
    db: AsyncSession,
    *,
    user: User,
    response: Response,
) -> TokenPairResponse:
    refresh_token, token_record = new_refresh_token_record(user)
    db.add(token_record)
    await db.commit()
    set_refresh_cookie(response, refresh_token)
    return TokenPairResponse(
        user=UserResponse.model_validate(user),
        access_token=create_access_token(user.id),
    )


async def register_user_account(
    db: AsyncSession,
    *,
    payload: RegisterRequest,
    response: Response,
) -> TokenPairResponse:
    email = normalize_email(payload.email)
    existing_user = await db.scalar(select(User).where(email_filter(email)))
    if existing_user is not None:
        conflict("EMAIL_ALREADY_EXISTS", "Email already registered.")

    user = User(
        email=email,
        display_name=normalize_display_name(payload.display_name),
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return await issue_token_pair(db, user=user, response=response)


async def login_user_account(
    db: AsyncSession,
    *,
    payload: LoginRequest,
    response: Response,
) -> TokenPairResponse:
    user = await db.scalar(select(User).where(email_filter(payload.email)))
    if user is None or not verify_password(payload.password, user.password_hash):
        api_error(status.HTTP_401_UNAUTHORIZED, "INVALID_CREDENTIALS", "Invalid email or password.")
    return await issue_token_pair(db, user=user, response=response)


async def rotate_refresh_token(
    db: AsyncSession,
    *,
    refresh_token: str | None,
    response: Response,
) -> RefreshResponse:
    if not refresh_token:
        refresh_token_error()

    stored_token, user = await stored_refresh_token(db, refresh_token)
    stored_token.revoked_at = utc_now()
    stored_token.updated_at = utc_now()
    new_refresh_token, token_record = new_refresh_token_record(user)
    db.add(token_record)
    await db.commit()
    set_refresh_cookie(response, new_refresh_token)
    return RefreshResponse(access_token=create_access_token(user.id))


async def revoke_refresh_token(
    db: AsyncSession,
    *,
    refresh_token: str | None,
    response: Response,
) -> None:
    clear_refresh_cookie(response)
    if not refresh_token:
        return

    token_payload = decode_token(refresh_token, token_type="refresh")
    user_id = token_payload.get("sub")
    token_id = token_payload.get("jti")
    if not isinstance(user_id, str) or not isinstance(token_id, str):
        refresh_token_error("INVALID_TOKEN", "Token subject or id is invalid.")

    stored_token = await db.scalar(
        select(RefreshToken).where(
            RefreshToken.id == token_id,
            RefreshToken.token_hash == hash_token(refresh_token),
        )
    )
    if (
        stored_token is None
        or stored_token.user_id != user_id
        or stored_token.revoked_at is not None
    ):
        return

    stored_token.revoked_at = utc_now()
    stored_token.updated_at = utc_now()
    await db.commit()


async def revoke_all_user_refresh_tokens(db: AsyncSession, *, user_id: str) -> None:
    await db.execute(
        update(RefreshToken)
        .where(RefreshToken.user_id == user_id, RefreshToken.revoked_at.is_(None))
        .values(revoked_at=utc_now(), updated_at=utc_now())
    )
    await db.commit()


async def stored_refresh_token(
    db: AsyncSession,
    token: str,
) -> tuple[RefreshToken, User]:
    token_payload = decode_token(token, token_type="refresh")
    user_id = token_payload.get("sub")
    token_id = token_payload.get("jti")
    if not isinstance(user_id, str) or not isinstance(token_id, str):
        refresh_token_error("INVALID_TOKEN", "Token subject or id is invalid.")

    stored_token = await db.scalar(
        select(RefreshToken).where(
            RefreshToken.id == token_id,
            RefreshToken.token_hash == hash_token(token),
        )
    )
    if stored_token is None or stored_token.user_id != user_id:
        refresh_token_error()

    if stored_token.revoked_at is not None:
        # A revoked token being presented again signals reuse (likely theft after
        # rotation). Revoke the entire token family so a stolen token cannot be used.
        await revoke_all_user_refresh_tokens(db, user_id=user_id)
        refresh_token_error("REFRESH_TOKEN_REVOKED", "Refresh token has been revoked.")

    if _as_aware_utc(stored_token.expires_at) <= datetime.now(UTC):
        refresh_token_error("REFRESH_TOKEN_EXPIRED", "Refresh token has expired.")

    user = await db.get(User, user_id)
    if user is None:
        refresh_token_error("USER_NOT_FOUND", "User no longer exists.")

    return stored_token, user
