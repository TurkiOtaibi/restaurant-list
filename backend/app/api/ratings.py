from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.modules.auth.dependencies import get_current_user
from app.modules.auth.models import User
from app.modules.ratings.models import Rating
from app.modules.ratings.schemas import RatingCreateRequest, RatingResponse, RatingUpdateRequest
from app.modules.ratings.services import create_or_update_rating, update_existing_rating

router = APIRouter(prefix="/ratings", tags=["ratings"])
CurrentUser = Annotated[User, Depends(get_current_user)]
DatabaseSession = Annotated[AsyncSession, Depends(get_db)]


@router.post("", response_model=RatingResponse, status_code=status.HTTP_201_CREATED)
async def create_rating(
    payload: RatingCreateRequest,
    response: Response,
    current_user: CurrentUser,
    db: DatabaseSession,
) -> Rating:
    rating, created = await create_or_update_rating(db, payload=payload, user_id=current_user.id)
    if not created:
        response.status_code = status.HTTP_200_OK
    return rating


@router.patch("/{place_id}", response_model=RatingResponse)
async def update_rating(
    place_id: str,
    payload: RatingUpdateRequest,
    current_user: CurrentUser,
    db: DatabaseSession,
) -> Rating:
    return await update_existing_rating(
        db,
        place_id=place_id,
        payload=payload,
        user_id=current_user.id,
    )
