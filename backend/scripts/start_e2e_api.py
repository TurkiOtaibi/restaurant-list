from __future__ import annotations

import asyncio
import os
import sys
from pathlib import Path

import uvicorn

BACKEND_ROOT = Path(__file__).resolve().parents[1]
E2E_DIR = BACKEND_ROOT / ".e2e"
E2E_DIR.mkdir(exist_ok=True)
E2E_FRONTEND_PORT = os.environ.get("E2E_FRONTEND_PORT", os.environ.get("PLAYWRIGHT_PORT", "3000"))
E2E_API_PORT = int(os.environ.get("E2E_API_PORT", "8000"))

os.environ.setdefault(
    "DATABASE_URL",
    f"sqlite+aiosqlite:///{(E2E_DIR / 'api.db').as_posix()}",
)
os.environ.setdefault("JWT_ACCESS_SECRET", "e2e-access-secret")
os.environ.setdefault("JWT_REFRESH_SECRET", "e2e-refresh-secret")
os.environ.setdefault("APP_ENV", "e2e")
os.environ.setdefault("REFRESH_COOKIE_SECURE", "false")
os.environ.setdefault("AUTH_RATE_LIMIT_REQUESTS", "200")
os.environ.setdefault("AUTH_RATE_LIMIT_WINDOW_SECONDS", "60")
os.environ.setdefault(
    "CORS_ORIGINS",
    f'["http://127.0.0.1:{E2E_FRONTEND_PORT}","http://localhost:{E2E_FRONTEND_PORT}"]',
)
os.environ.setdefault(
    "CORS_ALLOW_ORIGIN_REGEX",
    rf"http://(localhost|127\.0\.0\.1):{E2E_FRONTEND_PORT}",
)

sys.path.insert(0, str(BACKEND_ROOT))

from app.db.base import Base  # noqa: E402
from app.db.session import engine  # noqa: E402


async def prepare_database() -> None:
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.drop_all)
        await connection.run_sync(Base.metadata.create_all)


if __name__ == "__main__":
    asyncio.run(prepare_database())
    uvicorn.run(
        "app.main:app",
        host=os.environ.get("E2E_API_HOST", "localhost"),
        port=E2E_API_PORT,
        log_level="warning",
    )
