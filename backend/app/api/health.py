from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.errors import api_error
from app.db.session import get_db

router = APIRouter(tags=["health"])
DatabaseSession = Annotated[AsyncSession, Depends(get_db)]


@router.get("/health/live")
def live() -> dict[str, str]:
    return {"status": "ok", "service": get_settings().app_name}


@router.get("/health/ready")
async def ready(db: DatabaseSession) -> dict[str, object]:
    try:
        await db.execute(text("SELECT 1"))
    except SQLAlchemyError:
        api_error(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "DATABASE_UNAVAILABLE",
            "Database readiness check failed.",
        )

    return {
        "status": "ok",
        "checks": {
            "api": "ok",
            "database": "ok",
        },
    }
