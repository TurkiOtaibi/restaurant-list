import logging
from collections import defaultdict, deque
from hashlib import sha256
from time import monotonic
from typing import Any

from fastapi import Request, status
from redis.exceptions import AuthenticationError, AuthorizationError, ConnectionError, TimeoutError

from app.core.config import get_settings
from app.core.errors import api_error

logger = logging.getLogger(__name__)

_ATOMIC_INCREMENT_SCRIPT = """
local count = redis.call('INCR', KEYS[1])
if count == 1 then
    redis.call('EXPIRE', KEYS[1], ARGV[1])
end
return count
"""
_REDIS_CONNECT_TIMEOUT_SECONDS = 1.0
_REDIS_SOCKET_TIMEOUT_SECONDS = 1.0

# In-memory fallback used only when REDIS_URL is not configured or Redis is
# temporarily unavailable. Production normally shares the Redis counter.
_requests: dict[str, deque[float]] = defaultdict(deque)
_redis_client: Any = None


def _normalize_scope(scope: str) -> str:
    normalized = "".join(
        character if character.isascii() and (character.isalnum() or character in "_-") else "_"
        for character in scope.strip().lower()
    )
    return normalized[:32] or "unknown"


def _storage_key(scope: str, subject: str) -> str:
    normalized_scope = _normalize_scope(scope)
    digest = sha256(f"{normalized_scope}\0{subject}".encode()).hexdigest()
    return f"rate-limit:{digest}"


def _client_subject(request: Request) -> str:
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
            socket_connect_timeout=_REDIS_CONNECT_TIMEOUT_SECONDS,
            socket_timeout=_REDIS_SOCKET_TIMEOUT_SECONDS,
        )
    return _redis_client


async def _enforce_with_redis(
    client: Any,
    *,
    key: str,
    request_count: int,
    window_seconds: int,
) -> None:
    result = await client.eval(
        _ATOMIC_INCREMENT_SCRIPT,
        1,
        key,
        window_seconds,
    )
    count = int(result)
    if count < 0:
        raise ValueError("Redis rate-limit counter must not be negative")
    if count > request_count:
        _rate_limited()


def _enforce_in_memory(key: str, request_count: int, window_seconds: int) -> None:
    now = monotonic()
    window_start = now - window_seconds
    bucket = _requests[key]

    while bucket and bucket[0] < window_start:
        bucket.popleft()

    if len(bucket) >= request_count:
        _rate_limited()

    bucket.append(now)


async def enforce_rate_limit(
    *,
    scope: str,
    subject: str,
    request_count: int,
    window_seconds: int,
) -> None:
    normalized_scope = _normalize_scope(scope)
    key = _storage_key(normalized_scope, subject)
    client = _get_redis_client()
    if client is not None:
        try:
            await _enforce_with_redis(
                client,
                key=key,
                request_count=request_count,
                window_seconds=window_seconds,
            )
        except (AuthenticationError, AuthorizationError):
            raise
        except (ConnectionError, TimeoutError):
            logger.warning(
                "Redis rate limiter unavailable; using process-local fallback (scope=%s)",
                normalized_scope,
            )
            _enforce_in_memory(key, request_count, window_seconds)
        return
    _enforce_in_memory(key, request_count, window_seconds)


async def enforce_auth_rate_limit(request: Request) -> None:
    settings = get_settings()
    await enforce_rate_limit(
        scope="auth",
        subject=_client_subject(request),
        request_count=settings.auth_rate_limit_requests,
        window_seconds=settings.auth_rate_limit_window_seconds,
    )


def reset_rate_limits() -> None:
    global _redis_client
    _requests.clear()
    _redis_client = None
