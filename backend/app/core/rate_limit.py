from collections import defaultdict, deque
from time import monotonic

from fastapi import Request, status

from app.core.config import get_settings
from app.core.errors import api_error

_requests: dict[str, deque[float]] = defaultdict(deque)


def _client_key(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        client = forwarded_for.split(",", 1)[0].strip()
    else:
        client = request.client.host if request.client else "unknown"
    return f"{client}:{request.url.path}"


async def enforce_auth_rate_limit(request: Request) -> None:
    settings = get_settings()
    now = monotonic()
    window_start = now - settings.auth_rate_limit_window_seconds
    bucket = _requests[_client_key(request)]

    while bucket and bucket[0] < window_start:
        bucket.popleft()

    if len(bucket) >= settings.auth_rate_limit_requests:
        api_error(
            status.HTTP_429_TOO_MANY_REQUESTS,
            "RATE_LIMITED",
            "Too many authentication requests. Try again later.",
        )

    bucket.append(now)


def reset_rate_limits() -> None:
    _requests.clear()
