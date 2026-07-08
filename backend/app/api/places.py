from typing import Annotated, Literal, cast

from fastapi import APIRouter, Depends, File, HTTPException, Query, Request, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import internal_error, not_found
from app.core.schemas import CollectionResponse, collection_response
from app.db.session import get_db
from app.modules.auth.dependencies import get_current_user, get_optional_current_user
from app.modules.auth.models import User
from app.modules.places.image_service import delete_place_image, upload_place_image
from app.modules.places.schemas import (
    CAFE_SUBTYPES,
    RESTAURANT_SUBTYPES,
    PlaceCollectionResponse,
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
OptionalCurrentUser = Annotated[User | None, Depends(get_optional_current_user)]
DatabaseSession = Annotated[AsyncSession, Depends(get_db)]
PlaceImageUpload = Annotated[UploadFile, File(...)]
PLACE_SUBTYPES_BY_TYPE: dict[PlaceType, set[str]] = {
    "cafe": CAFE_SUBTYPES,
    "ice_cream": set(),
    "restaurant": RESTAURANT_SUBTYPES,
}


@router.get("", response_model=CollectionResponse[PlaceCollectionResponse])
async def list_places(
    request: Request,
    current_user: OptionalCurrentUser,
    db: DatabaseSession,
    q: Annotated[str | None, Query(max_length=120)] = None,
    type: PlaceType | None = None,
    subtype: Annotated[str | None, Query(max_length=64)] = None,
    sort: Literal["rating_desc"] = "rating_desc",
    limit: Annotated[int, Query(ge=1, le=100)] = 100,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> CollectionResponse[PlaceCollectionResponse]:
    validate_single_query_value(request, "type")
    validate_single_query_value(
        request,
        "subtype",
        code="INVALID_PLACE_SUBTYPE_FILTER",
        message="Subtype filter is not valid for the selected place type.",
    )
    validated_subtype = validate_place_filter(type, subtype)
    result = await list_place_summaries(
        db,
        current_user.id if current_user else None,
        query=q,
        place_type=type,
        place_subtype=validated_subtype,
        limit=limit,
        offset=offset,
    )
    return collection_response(
        [PlaceCollectionResponse.model_validate(item) for item in result.items],
        limit=limit,
        offset=offset,
        total=result.total,
        sort=sort,
    )


@router.get("/{place_id}", response_model=PlaceResponse)
async def get_place(
    place_id: str,
    current_user: OptionalCurrentUser,
    db: DatabaseSession,
) -> PlaceResponse:
    place = await get_place_summary(db, current_user.id if current_user else None, place_id)
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


@router.put("/{place_id}/image", response_model=PlaceResponse)
async def upload_image(
    place_id: str,
    current_user: CurrentUser,
    db: DatabaseSession,
    file: PlaceImageUpload,
) -> PlaceResponse:
    return await upload_place_image(
        db,
        current_user=current_user,
        file=file,
        place_id=place_id,
    )


@router.delete("/{place_id}/image", response_model=PlaceResponse)
async def delete_image(
    place_id: str,
    current_user: CurrentUser,
    db: DatabaseSession,
) -> PlaceResponse:
    return await delete_place_image(db, current_user=current_user, place_id=place_id)


def validate_place_filter(place_type: PlaceType | None, subtype: str | None) -> PlaceSubtype | None:
    if subtype is None:
        return None

    if place_type is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail={
                "code": "PLACE_TYPE_REQUIRED_FOR_SUBTYPE_FILTER",
                "message": "Place type is required when filtering by subtype.",
            },
        )

    if subtype in PLACE_SUBTYPES_BY_TYPE[place_type]:
        return cast(PlaceSubtype, subtype)

    raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        detail={
            "code": "INVALID_PLACE_SUBTYPE_FILTER",
            "message": "Subtype filter is not valid for the selected place type.",
        },
    )


def validate_single_query_value(
    request: Request,
    name: str,
    *,
    code: str = "VALIDATION_ERROR",
    message: str | None = None,
) -> None:
    if len(request.query_params.getlist(name)) <= 1:
        return

    error_message = message or f"Query parameter '{name}' must be provided at most once."
    raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        detail={
            "code": code,
            "message": error_message,
        },
    )
