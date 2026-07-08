from datetime import UTC, datetime, timedelta, tzinfo
from typing import Any

import pytest

from app.core.config import get_settings
from app.core.rate_limit import reset_rate_limits


class _FrozenDateTime(datetime):
    _current = datetime(2026, 6, 26, 0, 0, 0, tzinfo=UTC)

    @classmethod
    def set(cls, value: datetime) -> None:
        cls._current = _aware_utc(value)

    @classmethod
    def now(cls, tz: tzinfo | None = None) -> "_FrozenDateTime":
        value = cls._current.replace(tzinfo=None) if tz is None else cls._current.astimezone(tz)
        return cls(
            value.year,
            value.month,
            value.day,
            value.hour,
            value.minute,
            value.second,
            value.microsecond,
            tzinfo=value.tzinfo,
            fold=value.fold,
        )

    @classmethod
    def utcnow(cls) -> "_FrozenDateTime":
        value = cls._current.replace(tzinfo=None)
        return cls(
            value.year,
            value.month,
            value.day,
            value.hour,
            value.minute,
            value.second,
            value.microsecond,
            fold=value.fold,
        )


def _aware_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)


class DeterministicTimeControlHarness:
    def __init__(self, monkeypatch: pytest.MonkeyPatch, initial_time: datetime) -> None:
        self.monkeypatch = monkeypatch
        self.current_time = _aware_utc(initial_time)

    def install(
        self,
        *,
        access_token_minutes: int | None = None,
        refresh_token_days: int | None = None,
    ) -> "DeterministicTimeControlHarness":
        import app.core.security as security
        import app.db.utils as db_utils
        import app.modules.auth.services as auth_services

        _FrozenDateTime.set(self.current_time)
        self.monkeypatch.setattr(security, "datetime", _FrozenDateTime)
        self.monkeypatch.setattr(auth_services, "datetime", _FrozenDateTime)
        self.monkeypatch.setattr(db_utils, "datetime", _FrozenDateTime)
        self.monkeypatch.setattr(auth_services, "utc_now", self.now)

        if access_token_minutes is not None or refresh_token_days is not None:
            settings = get_settings()
            override = settings.model_copy(
                update={
                    "access_token_expire_minutes": (
                        access_token_minutes
                        if access_token_minutes is not None
                        else settings.access_token_expire_minutes
                    ),
                    "refresh_token_expire_days": (
                        refresh_token_days
                        if refresh_token_days is not None
                        else settings.refresh_token_expire_days
                    ),
                }
            )
            self.monkeypatch.setattr(security, "get_settings", lambda: override)
            self.monkeypatch.setattr(auth_services, "get_settings", lambda: override)

        return self

    def now(self) -> datetime:
        return self.current_time

    def freeze(self, value: datetime) -> None:
        self.current_time = _aware_utc(value)
        _FrozenDateTime.set(self.current_time)

    def fast_forward(self, delta: timedelta) -> None:
        self.freeze(self.current_time + delta)


class RateLimiterTestHarness:
    def __init__(
        self,
        monkeypatch: pytest.MonkeyPatch,
        *,
        requests: int,
        window_seconds: int,
        initial_monotonic: float = 10_000.0,
    ) -> None:
        self.monkeypatch = monkeypatch
        self.current_monotonic = initial_monotonic
        self.requests = requests
        self.window_seconds = window_seconds

    def install(self) -> "RateLimiterTestHarness":
        import app.core.rate_limit as rate_limit

        settings = get_settings().model_copy(
            update={
                "auth_rate_limit_requests": self.requests,
                "auth_rate_limit_window_seconds": self.window_seconds,
                "redis_url": None,
            }
        )
        reset_rate_limits()
        self.monkeypatch.setattr(rate_limit, "get_settings", lambda: settings)
        self.monkeypatch.setattr(rate_limit, "monotonic", lambda: self.current_monotonic)
        return self

    def reset(self) -> None:
        reset_rate_limits()

    def advance(self, seconds: float) -> None:
        self.current_monotonic += seconds


class PasswordHashInstrumentationHarness:
    def __init__(self, monkeypatch: pytest.MonkeyPatch) -> None:
        self.monkeypatch = monkeypatch
        self.invocation_count = 0
        self.passwords: list[str] = []

    def install(self) -> "PasswordHashInstrumentationHarness":
        import app.modules.auth.services as auth_services
        from app.core.security import hash_password as original_hash_password

        def counted_hash_password(password: str) -> str:
            self.invocation_count += 1
            self.passwords.append(password)
            return original_hash_password(password)

        self.monkeypatch.setattr(auth_services, "hash_password", counted_hash_password)
        return self

    def reset(self) -> None:
        self.invocation_count = 0
        self.passwords.clear()

    def evidence(self) -> dict[str, Any]:
        return {
            "hashInvocationCount": self.invocation_count,
            "passwordByteLengths": [len(password.encode("utf-8")) for password in self.passwords],
        }
