from typing import Any, cast

from httpx import AsyncClient

from app.core.config import get_settings


async def register_user(
    client: AsyncClient,
    email: str = "user@example.com",
) -> dict[str, Any]:
    response = await client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "password123"},
    )
    assert response.status_code == 201
    return cast(dict[str, Any], response.json())


def auth_header(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


async def test_register_login_refresh_and_logout(client: AsyncClient) -> None:
    refresh_cookie_name = get_settings().refresh_cookie_name

    registered = await register_user(client)
    assert registered["user"]["email"] == "user@example.com"
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
    assert old_refresh.json()["detail"]["code"] == "REFRESH_TOKEN_REVOKED"

    client.cookies.clear()
    client.cookies.set(refresh_cookie_name, rotated_refresh_token, path="/api/v1/auth")
    logout = await client.post("/api/v1/auth/logout")
    assert logout.status_code == 200
    assert logout.json() == {"revoked": True}

    revoked_refresh = await client.post("/api/v1/auth/refresh")
    assert revoked_refresh.status_code == 401
    assert revoked_refresh.json()["detail"]["code"] in {
        "MISSING_REFRESH_TOKEN",
        "REFRESH_TOKEN_REVOKED",
    }


async def test_register_rejects_weak_password(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/auth/register",
        json={"email": "weak@example.com", "password": "short"},
    )
    assert response.status_code == 422


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
    assert reused.json()["detail"]["code"] == "REFRESH_TOKEN_REVOKED"

    # The most recent token of the family must now be dead too.
    client.cookies.clear()
    client.cookies.set(refresh_cookie_name, rotated, path="/api/v1/auth")
    after = await client.post("/api/v1/auth/refresh")
    assert after.status_code == 401
    assert after.json()["detail"]["code"] == "REFRESH_TOKEN_REVOKED"


async def test_duplicate_email_rejected(client: AsyncClient) -> None:
    await register_user(client)
    response = await client.post(
        "/api/v1/auth/register",
        json={"email": "USER@example.com", "password": "password123"},
    )

    assert response.status_code == 409
    assert response.json()["detail"]["code"] == "EMAIL_ALREADY_EXISTS"


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
    assert last_response.json()["detail"]["code"] == "RATE_LIMITED"


async def test_logout_rejects_invalid_refresh_token(client: AsyncClient) -> None:
    client.cookies.set(
        get_settings().refresh_cookie_name,
        "not-a-valid-refresh-token",
        path="/api/v1/auth",
    )
    response = await client.post("/api/v1/auth/logout")

    assert response.status_code == 401
    assert response.json()["detail"]["code"] == "INVALID_TOKEN"
