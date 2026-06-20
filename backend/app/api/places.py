from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import internal_error, not_found
from app.core.schemas import CollectionResponse, collection_response
from app.db.session import get_db
from app.modules.auth.dependencies import get_current_user
from app.modules.auth.models import User
from app.modules.places.schemas import PlaceCreateRequest, PlaceResponse, PlaceType
from app.modules.places.services import (
    create_place_for_user,
    get_place_summary,
    list_place_summaries,
)

router = APIRouter(prefix="/places", tags=["places"])
CurrentUser = Annotated[User, Depends(get_current_user)]
DatabaseSession = Annotated[AsyncSession, Depends(get_db)]


@router.get("", response_model=CollectionResponse[PlaceResponse])
async def list_places(
    current_user: CurrentUser,
    db: DatabaseSession,
    q: Annotated[str | None, Query(max_length=120)] = None,
    type: PlaceType | None = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 100,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> CollectionResponse[PlaceResponse]:
    result = await list_place_summaries(
        db,
        current_user.id,
        query=q,
        place_type=type,
        limit=limit,
        offset=offset,
    )
    return collection_response(
        result.items,
        limit=limit,
        offset=offset,
        total=result.total,
        sort="created_at_desc",
    )


@router.get("/{place_id}", response_model=PlaceResponse)
async def get_place(
    place_id: str,
    current_user: CurrentUser,
    db: DatabaseSession,
) -> PlaceResponse:
    place = await get_place_summary(db, current_user.id, place_id)
    if place is None:
        not_found("Place")
    return place


@router.post("", response_model=PlaceResponse, status_code=status.HTTP_201_CREATED)
async def create_place(
    payload: PlaceCreateRequest,
    current_user: CurrentUser,
    db: DatabaseSession,
) -> PlaceResponse:
    place = await create_place_for_user(db, payload=payload, user_id=current_user.id)
    place_response = await get_place_summary(db, current_user.id, place.id)
    if place_response is None:
        internal_error()
    return place_response
