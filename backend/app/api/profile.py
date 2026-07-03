from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.modules.auth.dependencies import get_current_user
from app.modules.auth.models import User
from app.modules.profile.schemas import (
    ProfileFavoritesUpdateRequest,
    ProfileResponse,
    ProfileUpdateRequest,
)
from app.modules.profile.services import (
    get_profile_for_user,
    update_favorite_places_for_user,
    update_profile_for_user,
)

router = APIRouter(prefix="/profile", tags=["profile"])
CurrentUser = Annotated[User, Depends(get_current_user)]
DatabaseSession = Annotated[AsyncSession, Depends(get_db)]


@router.get("", response_model=ProfileResponse)
async def get_profile(
    current_user: CurrentUser,
    db: DatabaseSession,
) -> ProfileResponse:
    return await get_profile_for_user(db, current_user)


@router.patch("", response_model=ProfileResponse)
async def update_profile(
    payload: ProfileUpdateRequest,
    current_user: CurrentUser,
    db: DatabaseSession,
) -> ProfileResponse:
    return await update_profile_for_user(db, current_user, payload)


@router.put("/favorites", response_model=ProfileResponse)
async def update_profile_favorites(
    payload: ProfileFavoritesUpdateRequest,
    current_user: CurrentUser,
    db: DatabaseSession,
) -> ProfileResponse:
    return await update_favorite_places_for_user(db, current_user, payload)
