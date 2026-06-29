from datetime import UTC, datetime, timedelta

import pytest
from httpx import AsyncClient

from tests.api.test_auth import auth_header, register_user
from tests.support.auth_qa_infrastructure import (
    DeterministicTimeControlHarness,
    PasswordHashInstrumentationHarness,
    RateLimiterTestHarness,
)


async def test_auth_002_password_byte_limit_is_rejected_before_hashing(
    client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    hash_harness = PasswordHashInstrumentationHarness(monkeypatch).install()

    valid = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "password-byte-valid@example.com",
            "password": "A" * 72,
        },
    )

    assert valid.status_code == 201
    assert hash_harness.evidence() == {
        "hashInvocationCount": 1,
        "passwordByteLengths": [72],
    }

    hash_harness.reset()
    invalid = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "password-byte-invalid@example.com",
            "password": "B" * 73,
        },
    )

    assert invalid.status_code == 422
    assert "accessToken" not in invalid.text
    assert "password_hash" not in invalid.text
    assert hash_harness.evidence() == {
        "hashInvocationCount": 0,
        "passwordByteLengths": [],
    }


async def test_auth_004_access_token_expires_after_configured_default_lifetime(
    client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    clock = DeterministicTimeControlHarness(
        monkeypatch,
        datetime(2026, 6, 26, 0, 0, 0, tzinfo=UTC),
    ).install(access_token_minutes=15)

    registered = await register_user(client, email="access-expiry@example.com")
    access_token = registered["accessToken"]

    clock.fast_forward(timedelta(minutes=16))
    expired = await client.get("/api/v1/places", headers=auth_header(access_token))

    assert expired.status_code == 401
    assert expired.json()["detail"]["code"] == "INVALID_TOKEN"
    assert "accessToken" not in expired.text
    assert "refresh" not in expired.text.lower()


async def test_auth_004_refresh_token_expires_after_configured_default_lifetime(
    client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    clock = DeterministicTimeControlHarness(
        monkeypatch,
        datetime(2026, 6, 26, 0, 0, 0, tzinfo=UTC),
    ).install(refresh_token_days=30)

    await register_user(client, email="refresh-expiry@example.com")

    clock.fast_forward(timedelta(days=30, seconds=1))
    expired = await client.post("/api/v1/auth/refresh")

    assert expired.status_code == 401
    assert "accessToken" not in expired.text
    assert "refreshToken" not in expired.text


async def test_auth_007_rate_limit_request_override_blocks_request_four(
    client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    RateLimiterTestHarness(monkeypatch, requests=3, window_seconds=60).install()

    statuses = []
    for _ in range(4):
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": "missing@example.com", "password": "wrong"},
            headers={"x-forwarded-for": "client-override-requests-001"},
        )
        statuses.append(response.status_code)

    assert statuses[:3] == [401, 401, 401]
    assert statuses[3] == 429


async def test_auth_007_rate_limit_window_override_recovers_after_30_seconds(
    client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    limiter = RateLimiterTestHarness(monkeypatch, requests=10, window_seconds=30).install()

    headers = {"x-forwarded-for": "client-override-window-001"}
    for _ in range(10):
        allowed = await client.post(
            "/api/v1/auth/login",
            json={"email": "missing@example.com", "password": "wrong"},
            headers=headers,
        )
        assert allowed.status_code == 401

    blocked = await client.post(
        "/api/v1/auth/login",
        json={"email": "missing@example.com", "password": "wrong"},
        headers=headers,
    )
    assert blocked.status_code == 429

    limiter.advance(31)
    recovered = await client.post(
        "/api/v1/auth/login",
        json={"email": "missing@example.com", "password": "wrong"},
        headers=headers,
    )
    assert recovered.status_code == 401
