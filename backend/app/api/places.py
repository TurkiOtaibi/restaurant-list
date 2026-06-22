from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import internal_error, not_found
from app.core.schemas import CollectionResponse, collection_response
from app.db.session import get_db
from app.modules.auth.dependencies import get_current_user
from app.modules.auth.models import User
from app.modules.places.schemas import (
    CAFE_SUBTYPES,
    RESTAURANT_SUBTYPES,
    PlaceCreateRequest,
    PlaceResponse,
    PlaceSubtype,
    PlaceType,
)
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
    subtype: PlaceSubtype | None = None,
    sort: Literal["rating_desc"] = "rating_desc",
    limit: Annotated[int, Query(ge=1, le=100)] = 100,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> CollectionResponse[PlaceResponse]:
    validate_place_filter(type, subtype)
    result = await list_place_summaries(
        db,
        current_user.id,
        query=q,
        place_type=type,
        place_subtype=subtype,
        limit=limit,
        offset=offset,
    )
    return collection_response(
        result.items,
        limit=limit,
        offset=offset,
        total=result.total,
        sort=sort,
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


def validate_place_filter(place_type: PlaceType | None, subtype: PlaceSubtype | None) -> None:
    if subtype is None:
        return

    if place_type is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail={
                "code": "PLACE_TYPE_REQUIRED_FOR_SUBTYPE_FILTER",
                "message": "Place type is required when filtering by subtype.",
            },
        )

    if place_type == "restaurant" and subtype in RESTAURANT_SUBTYPES:
        return

    if place_type == "cafe" and subtype in CAFE_SUBTYPES:
        return

    raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        detail={
            "code": "INVALID_PLACE_SUBTYPE_FILTER",
            "message": "Subtype filter is not valid for the selected place type.",
        },
    )
