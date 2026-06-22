from collections import defaultdict, deque
from time import monotonic
from typing import Any

from fastapi import Request, status

from app.core.config import get_settings
from app.core.errors import api_error

# In-memory fallback used only when REDIS_URL is not configured (local dev and
# tests). Production configures Redis so the limit is shared across instances and
# survives restarts and deployments.
_requests: dict[str, deque[float]] = defaultdict(deque)
_redis_client: Any = None


def _client_key(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        client = forwarded_for.split(",", 1)[0].strip()
    else:
        client = request.client.host if request.client else "unknown"
    return f"{client}:{request.url.path}"


def _rate_limited() -> None:
    api_error(
        status.HTTP_429_TOO_MANY_REQUESTS,
        "RATE_LIMITED",
        "Too many authentication requests. Try again later.",
    )


def _get_redis_client() -> Any:
    global _redis_client
    settings = get_settings()
    if not settings.redis_url:
        return None
    if _redis_client is None:
        import redis.asyncio as redis_asyncio

        _redis_client = redis_asyncio.from_url(
            settings.redis_url,
            encoding="utf-8",
            decode_responses=True,
        )
    return _redis_client


async def _enforce_with_redis(client: Any, request: Request) -> None:
    settings = get_settings()
    key = f"auth-rate-limit:{_client_key(request)}"
    # Fixed-window counter: shared across instances and persisted by Redis.
    count = int(await client.incr(key))
    if count == 1:
        await client.expire(key, settings.auth_rate_limit_window_seconds)
    if count > settings.auth_rate_limit_requests:
        _rate_limited()


def _enforce_in_memory(request: Request) -> None:
    settings = get_settings()
    now = monotonic()
    window_start = now - settings.auth_rate_limit_window_seconds
    bucket = _requests[_client_key(request)]

    while bucket and bucket[0] < window_start:
        bucket.popleft()

    if len(bucket) >= settings.auth_rate_limit_requests:
        _rate_limited()

    bucket.append(now)


async def enforce_auth_rate_limit(request: Request) -> None:
    client = _get_redis_client()
    if client is not None:
        await _enforce_with_redis(client, request)
        return
    _enforce_in_memory(request)


def reset_rate_limits() -> None:
    _requests.clear()
