from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.modules.auth.dependencies import get_current_user
from app.modules.auth.models import User
from app.modules.profile.schemas import ProfileResponse
from app.modules.profile.services import get_profile_for_user

router = APIRouter(prefix="/profile", tags=["profile"])
CurrentUser = Annotated[User, Depends(get_current_user)]
DatabaseSession = Annotated[AsyncSession, Depends(get_db)]


@router.get("", response_model=ProfileResponse)
async def get_profile(
    current_user: CurrentUser,
    db: DatabaseSession,
) -> ProfileResponse:
    return await get_profile_for_user(db, current_user)
