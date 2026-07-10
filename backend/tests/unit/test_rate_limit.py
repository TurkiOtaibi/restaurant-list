from types import SimpleNamespace
from typing import Any

import pytest
from fastapi import HTTPException
from redis.exceptions import ConnectionError
from starlette.requests import Request

import app.core.rate_limit as rate_limit


def _settings(*, request_count: int = 2, window_seconds: int = 60) -> Any:
    return SimpleNamespace(
        redis_url="configured-for-test",
        auth_rate_limit_requests=request_count,
        auth_rate_limit_window_seconds=window_seconds,
    )


def _request(*, client: str = "client", path: str = "/api/v1/auth/login") -> Request:
    return Request(
        {
            "type": "http",
            "method": "POST",
            "path": path,
            "headers": [(b"x-forwarded-for", client.encode())],
            "client": (client, 1234),
            "scheme": "https",
            "server": ("testserver", 443),
        }
    )


class FakeRedis:
    def __init__(self, result: Any = 1) -> None:
        self.result = result
        self.calls: list[tuple[Any, ...]] = []

    async def eval(self, *args: Any) -> Any:
        self.calls.append(args)
        return self.result


class FailingRedis:
    async def eval(self, *_args: Any) -> Any:
        raise ConnectionError("redis outage payload must not be logged")


class BuggyRedis:
    async def eval(self, *_args: Any) -> Any:
        raise TypeError("programming failure")


def test_storage_key_isolated_by_scope_subject_and_path() -> None:
    first = rate_limit._storage_key("auth", "client-a:/api/v1/auth/login")

    assert first != rate_limit._storage_key("places", "client-a:/api/v1/auth/login")
    assert first != rate_limit._storage_key("auth", "client-b:/api/v1/auth/login")
    assert first != rate_limit._storage_key("auth", "client-a:/api/v1/auth/register")
    assert "client-a" not in first
    assert "/api/v1/auth/login" not in first


@pytest.mark.asyncio
async def test_redis_atomic_eval_includes_expiry_window(monkeypatch: pytest.MonkeyPatch) -> None:
    fake = FakeRedis(result="1")
    monkeypatch.setattr(rate_limit, "get_settings", lambda: _settings(window_seconds=37))
    monkeypatch.setattr(rate_limit, "_get_redis_client", lambda: fake)

    await rate_limit.enforce_rate_limit(
        scope="auth",
        subject="client-a:/api/v1/auth/login",
        request_count=2,
        window_seconds=37,
    )

    assert len(fake.calls) == 1
    script, key_count, key, expiry = fake.calls[0]
    assert key_count == 1
    assert key.startswith("rate-limit:")
    assert expiry == 37
    assert "INCR" in script
    assert "EXPIRE" in script


def test_redis_client_uses_short_timeouts(monkeypatch: pytest.MonkeyPatch) -> None:
    captured: dict[str, Any] = {}

    def fake_from_url(*args: Any, **kwargs: Any) -> object:
        captured["args"] = args
        captured["kwargs"] = kwargs
        return object()

    import redis.asyncio as redis_asyncio

    monkeypatch.setattr(rate_limit, "get_settings", lambda: _settings())
    monkeypatch.setattr(redis_asyncio, "from_url", fake_from_url)
    rate_limit.reset_rate_limits()

    rate_limit._get_redis_client()

    assert captured["kwargs"]["socket_connect_timeout"] == 1.0
    assert captured["kwargs"]["socket_timeout"] == 1.0


@pytest.mark.asyncio
async def test_redis_outage_falls_back_and_remains_restrictive(
    monkeypatch: pytest.MonkeyPatch,
    caplog: pytest.LogCaptureFixture,
) -> None:
    now = 10_000.0
    settings = _settings(request_count=2, window_seconds=30)
    monkeypatch.setattr(rate_limit, "get_settings", lambda: settings)
    monkeypatch.setattr(rate_limit, "_get_redis_client", lambda: FailingRedis())
    monkeypatch.setattr(rate_limit, "monotonic", lambda: now)

    for _ in range(2):
        await rate_limit.enforce_rate_limit(
            scope="auth",
            subject="client-outage:/api/v1/auth/login",
            request_count=2,
            window_seconds=30,
        )

    with pytest.raises(HTTPException) as blocked:
        await rate_limit.enforce_rate_limit(
            scope="auth",
            subject="client-outage:/api/v1/auth/login",
            request_count=2,
            window_seconds=30,
        )

    assert blocked.value.status_code == 429
    assert "redis outage payload" not in caplog.text
    assert "client-outage" not in caplog.text


@pytest.mark.asyncio
async def test_redis_outage_fallback_recovers_after_window(monkeypatch: pytest.MonkeyPatch) -> None:
    current = 10_000.0
    monkeypatch.setattr(rate_limit, "get_settings", lambda: _settings(request_count=1))
    monkeypatch.setattr(rate_limit, "_get_redis_client", lambda: FailingRedis())
    monkeypatch.setattr(rate_limit, "monotonic", lambda: current)

    await rate_limit.enforce_rate_limit(
        scope="auth",
        subject="client-recovery:/api/v1/auth/login",
        request_count=1,
        window_seconds=60,
    )
    with pytest.raises(HTTPException):
        await rate_limit.enforce_rate_limit(
            scope="auth",
            subject="client-recovery:/api/v1/auth/login",
            request_count=1,
            window_seconds=60,
        )

    current += 61
    await rate_limit.enforce_rate_limit(
        scope="auth",
        subject="client-recovery:/api/v1/auth/login",
        request_count=1,
        window_seconds=60,
    )


@pytest.mark.asyncio
async def test_non_redis_exception_is_not_converted_to_fallback(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(rate_limit, "get_settings", lambda: _settings())
    monkeypatch.setattr(rate_limit, "_get_redis_client", lambda: BuggyRedis())

    with pytest.raises(TypeError, match="programming failure"):
        await rate_limit.enforce_rate_limit(
            scope="auth",
            subject="client-bug:/api/v1/auth/login",
            request_count=2,
            window_seconds=60,
        )


def test_reset_clears_memory_and_cached_client(monkeypatch: pytest.MonkeyPatch) -> None:
    rate_limit._requests["test-key"].append(1.0)
    monkeypatch.setattr(rate_limit, "_redis_client", FakeRedis())

    rate_limit.reset_rate_limits()

    assert not rate_limit._requests
    assert rate_limit._redis_client is None
