import asyncio
from typing import Any, cast

import pytest
from fastapi import HTTPException, Response
from httpx import AsyncClient
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.core.config import get_settings
from app.core.security import decode_token
from app.modules.auth.models import RefreshToken
from app.modules.auth.schemas import RefreshResponse
from app.modules.auth.services import rotate_refresh_token


async def register_user(
    client: AsyncClient,
    email: str = "user@example.com",
    display_name: str | None = None,
) -> dict[str, Any]:
    payload: dict[str, Any] = {"email": email, "password": "password123"}
    if display_name is not None:
        payload["displayName"] = display_name

    response = await client.post(
        "/api/v1/auth/register",
        json=payload,
    )
    assert response.status_code == 201
    return cast(dict[str, Any], response.json())


def auth_header(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


async def test_register_login_refresh_and_logout(client: AsyncClient) -> None:
    refresh_cookie_name = get_settings().refresh_cookie_name

    registered = await register_user(client)
    assert registered["user"]["email"] == "user@example.com"
    assert registered["user"]["displayName"] == "مستخدم سجل"
    assert registered["accessToken"]
    assert "refreshToken" not in registered
    assert client.cookies.get(refresh_cookie_name)

    login = await client.post(
        "/api/v1/auth/login",
        json={"email": "user@example.com", "password": "password123"},
    )
    assert login.status_code == 200
    assert login.json()["accessToken"]
    assert "refreshToken" not in login.json()
    assert login.json()["user"]["displayName"] == "مستخدم سجل"
    set_cookie = login.headers["set-cookie"]
    assert refresh_cookie_name in set_cookie
    assert "HttpOnly" in set_cookie
    assert "Secure" in set_cookie
    assert "SameSite=lax" in set_cookie
    first_refresh_token = client.cookies.get(refresh_cookie_name)
    assert first_refresh_token

    refresh = await client.post("/api/v1/auth/refresh")
    assert refresh.status_code == 200
    assert refresh.json()["accessToken"]
    assert "refreshToken" not in refresh.json()
    rotated_refresh_token = client.cookies.get(refresh_cookie_name)
    assert rotated_refresh_token
    assert rotated_refresh_token != first_refresh_token

    client.cookies.clear()
    client.cookies.set(refresh_cookie_name, first_refresh_token, path="/api/v1/auth")
    old_refresh = await client.post("/api/v1/auth/refresh")
    assert old_refresh.status_code == 401
    assert old_refresh.json()["error"]["code"] == "REFRESH_TOKEN_REVOKED"

    client.cookies.clear()
    client.cookies.set(refresh_cookie_name, rotated_refresh_token, path="/api/v1/auth")
    logout = await client.post("/api/v1/auth/logout")
    assert logout.status_code == 200
    assert logout.json() == {"revoked": True}

    revoked_refresh = await client.post("/api/v1/auth/refresh")
    assert revoked_refresh.status_code == 401
    assert revoked_refresh.json()["error"]["code"] in {
        "MISSING_REFRESH_TOKEN",
        "REFRESH_TOKEN_REVOKED",
    }


async def test_register_rejects_weak_password(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/auth/register",
        json={"email": "weak@example.com", "password": "short"},
    )
    assert response.status_code == 422


async def test_register_accepts_public_safe_display_name(client: AsyncClient) -> None:
    registered = await register_user(client, email="named@example.com", display_name="  تركي  ")

    assert registered["user"]["displayName"] == "تركي"


async def test_register_rejects_overlong_password(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/auth/register",
        json={"email": "long@example.com", "password": "a" * 73},
    )
    assert response.status_code == 422


async def test_refresh_reuse_revokes_token_family(client: AsyncClient) -> None:
    refresh_cookie_name = get_settings().refresh_cookie_name
    await register_user(client, email="reuse@example.com")
    stolen = client.cookies.get(refresh_cookie_name)
    assert stolen

    rotate = await client.post("/api/v1/auth/refresh")
    assert rotate.status_code == 200
    rotated = client.cookies.get(refresh_cookie_name)
    assert rotated and rotated != stolen

    # Replaying the old, already-rotated token signals theft.
    client.cookies.clear()
    client.cookies.set(refresh_cookie_name, stolen, path="/api/v1/auth")
    reused = await client.post("/api/v1/auth/refresh")
    assert reused.status_code == 401
    assert reused.json()["error"]["code"] == "REFRESH_TOKEN_REVOKED"

    # The most recent token of the family must now be dead too.
    client.cookies.clear()
    client.cookies.set(refresh_cookie_name, rotated, path="/api/v1/auth")
    after = await client.post("/api/v1/auth/refresh")
    assert after.status_code == 401
    assert after.json()["error"]["code"] == "REFRESH_TOKEN_REVOKED"


async def test_concurrent_refresh_rotation_is_single_use(
    client: AsyncClient,
    session_factory: async_sessionmaker[AsyncSession],
) -> None:
    refresh_cookie_name = get_settings().refresh_cookie_name
    await register_user(client, email="concurrent@example.com")
    refresh_token = client.cookies.get(refresh_cookie_name)
    assert refresh_token

    token_payload = decode_token(refresh_token, token_type="refresh")
    user_id = token_payload.get("sub")
    token_id = token_payload.get("jti")
    assert isinstance(user_id, str)
    assert isinstance(token_id, str)

    async def wait_for_lock_wait(session: AsyncSession, pid: int) -> None:
        activity_query = text(
            """
            SELECT wait_event_type
            FROM pg_stat_activity
            WHERE pid = :pid
            """
        )
        async with asyncio.timeout(10):
            while True:
                activity = (
                    (await session.execute(activity_query, {"pid": pid})).mappings().one_or_none()
                )
                if activity is not None and activity["wait_event_type"] == "Lock":
                    return
                await asyncio.sleep(0.01)

    async with session_factory() as first_session, session_factory() as second_session:
        dialect_name = first_session.get_bind().dialect.name
        if dialect_name != "postgresql":
            pytest.skip(
                "PostgreSQL is required for row-lock concurrency coverage; "
                f"bound dialect is {dialect_name}."
            )

        locked_original = await first_session.scalar(
            select(RefreshToken)
            .where(RefreshToken.id == token_id, RefreshToken.user_id == user_id)
            .with_for_update()
        )
        assert locked_original is not None

        second_pid_value = await second_session.scalar(text("SELECT pg_backend_pid()"))
        assert isinstance(second_pid_value, int)

        first_response = Response()
        second_response = Response()
        second_task = asyncio.create_task(
            rotate_refresh_token(
                second_session,
                refresh_token=refresh_token,
                response=second_response,
            )
        )
        try:
            await wait_for_lock_wait(first_session, second_pid_value)
            first_result: object = await rotate_refresh_token(
                first_session,
                refresh_token=refresh_token,
                response=first_response,
            )
        finally:
            if not second_task.done():
                await first_session.rollback()
            second_result = (await asyncio.gather(second_task, return_exceptions=True))[0]

    results = [first_result, second_result]
    assert sum(isinstance(result, RefreshResponse) for result in results) == 1
    assert isinstance(first_result, RefreshResponse)
    assert isinstance(second_result, HTTPException)
    assert second_result.status_code == 401
    assert isinstance(second_result.detail, dict)
    assert second_result.detail["code"] == "REFRESH_TOKEN_REVOKED"

    async with session_factory() as verification_session:
        stored_tokens = list(
            (
                await verification_session.scalars(
                    select(RefreshToken).where(RefreshToken.user_id == user_id)
                )
            ).all()
        )

    active_successors = [
        token for token in stored_tokens if token.id != token_id and token.revoked_at is None
    ]
    assert len(stored_tokens) == 2
    # Reuse detection revokes the family, so the single issued successor is inactive.
    assert len(active_successors) == 0


async def test_duplicate_email_rejected(client: AsyncClient) -> None:
    await register_user(client)
    response = await client.post(
        "/api/v1/auth/register",
        json={"email": "USER@example.com", "password": "password123"},
    )

    assert response.status_code == 409
    assert response.json()["error"]["code"] == "EMAIL_ALREADY_EXISTS"


async def test_login_rejects_bad_password(client: AsyncClient) -> None:
    await register_user(client)
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "user@example.com", "password": "wrong"},
    )

    assert response.status_code == 401


async def test_auth_rate_limit_returns_429(client: AsyncClient) -> None:
    last_response = None
    for _ in range(get_settings().auth_rate_limit_requests + 1):
        last_response = await client.post(
            "/api/v1/auth/login",
            json={"email": "missing@example.com", "password": "wrong"},
        )

    assert last_response is not None
    assert last_response.status_code == 429
    assert last_response.json()["error"]["code"] == "RATE_LIMITED"


async def test_logout_rejects_invalid_refresh_token(client: AsyncClient) -> None:
    client.cookies.set(
        get_settings().refresh_cookie_name,
        "not-a-valid-refresh-token",
        path="/api/v1/auth",
    )
    response = await client.post("/api/v1/auth/logout")

    assert response.status_code == 401
    assert response.json()["error"]["code"] == "INVALID_TOKEN"
