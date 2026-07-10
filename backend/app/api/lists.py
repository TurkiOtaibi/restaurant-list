from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.rate_limit import enforce_rate_limit
from app.core.schemas import CollectionResponse, DeleteResponse, collection_response
from app.db.session import get_db
from app.modules.auth.dependencies import get_current_user, get_optional_current_user
from app.modules.auth.models import User
from app.modules.lists.schemas import (
    ListCreateRequest,
    ListDataResponse,
    ListDetailResponse,
    ListItemCreateRequest,
    ListItemResponse,
    ListResponse,
    ListUpdateRequest,
    ListVisibilityUpdateRequest,
    PublicListDetailResponse,
    PublicListResponse,
)
from app.modules.lists.services import (
    add_place_to_list,
    create_list_for_user,
    delete_owned_list,
    delete_place_from_owned_list,
    get_owned_list,
    get_public_user_list,
    list_detail_response,
    list_item_response,
    list_owned_lists,
    public_list_detail_response,
    update_owned_list_name,
    update_owned_list_visibility,
)
from app.modules.lists.services import (
    list_public_lists as list_public_list_summaries,
)

router = APIRouter(prefix="/lists", tags=["lists"])
CurrentUser = Annotated[User, Depends(get_current_user)]
OptionalCurrentUser = Annotated[User | None, Depends(get_optional_current_user)]
DatabaseSession = Annotated[AsyncSession, Depends(get_db)]


def _anonymous_client_identity(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",", 1)[0].strip() or "unknown"
    return request.client.host if request.client else "unknown"


async def _enforce_public_read_rate_limit(
    request: Request,
    current_user: User | None,
    *,
    scope: str,
) -> None:
    if current_user is not None:
        return

    settings = get_settings()
    await enforce_rate_limit(
        scope=scope,
        subject=_anonymous_client_identity(request),
        request_count=settings.public_read_rate_limit_requests,
        window_seconds=settings.public_read_rate_limit_window_seconds,
    )


@router.get("", response_model=CollectionResponse[ListResponse])
async def list_lists(
    current_user: CurrentUser,
    db: DatabaseSession,
    limit: Annotated[int, Query(ge=1, le=100)] = 100,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> CollectionResponse[ListResponse]:
    result = await list_owned_lists(db, user_id=current_user.id, limit=limit, offset=offset)
    return collection_response(
        result.items,
        limit=limit,
        offset=offset,
        total=result.total,
        sort="created_at_desc",
    )


@router.get("/public", response_model=CollectionResponse[PublicListResponse])
async def list_public_lists(
    request: Request,
    current_user: OptionalCurrentUser,
    db: DatabaseSession,
    limit: Annotated[int, Query(ge=1, le=100)] = 100,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> CollectionResponse[PublicListResponse]:
    await _enforce_public_read_rate_limit(
        request,
        current_user,
        scope="public-read-lists-collection",
    )
    result = await list_public_list_summaries(db, limit=limit, offset=offset)
    return collection_response(
        result.items,
        limit=limit,
        offset=offset,
        total=result.total,
        sort="created_at_desc",
    )


@router.get("/public/{list_id}", response_model=PublicListDetailResponse)
async def get_public_list(
    list_id: str,
    request: Request,
    current_user: OptionalCurrentUser,
    db: DatabaseSession,
) -> PublicListDetailResponse:
    await _enforce_public_read_rate_limit(
        request,
        current_user,
        scope="public-read-lists-detail",
    )
    user_list = await get_public_user_list(db, list_id=list_id)
    return await public_list_detail_response(
        db,
        user_list=user_list,
        current_user_id=current_user.id if current_user else None,
    )


@router.get("/{list_id}", response_model=ListDetailResponse)
async def get_list(
    list_id: str,
    current_user: CurrentUser,
    db: DatabaseSession,
) -> ListDetailResponse:
    user_list = await get_owned_list(db, list_id=list_id, user_id=current_user.id)
    return await list_detail_response(db, user_list=user_list, current_user_id=current_user.id)


@router.post("", response_model=ListResponse, status_code=status.HTTP_201_CREATED)
async def create_list(
    payload: ListCreateRequest,
    current_user: CurrentUser,
    db: DatabaseSession,
) -> ListResponse:
    return await create_list_for_user(db, payload=payload, user_id=current_user.id)


@router.patch("/{list_id}", response_model=ListResponse)
async def update_list(
    list_id: str,
    payload: ListUpdateRequest,
    current_user: CurrentUser,
    db: DatabaseSession,
) -> ListResponse:
    return await update_owned_list_name(
        db,
        list_id=list_id,
        payload=payload,
        user_id=current_user.id,
    )


@router.patch("/{list_id}/visibility", response_model=ListDataResponse)
async def update_list_visibility(
    list_id: str,
    payload: ListVisibilityUpdateRequest,
    current_user: CurrentUser,
    db: DatabaseSession,
) -> ListDataResponse:
    updated = await update_owned_list_visibility(
        db,
        list_id=list_id,
        payload=payload,
        user_id=current_user.id,
    )
    return ListDataResponse(data=updated)


@router.delete("/{list_id}")
async def delete_list(
    list_id: str,
    current_user: CurrentUser,
    db: DatabaseSession,
) -> DeleteResponse:
    await delete_owned_list(db, list_id=list_id, user_id=current_user.id)
    return DeleteResponse()


@router.post(
    "/{list_id}/items",
    response_model=ListItemResponse,
    status_code=status.HTTP_201_CREATED,
)
async def add_list_item(
    list_id: str,
    payload: ListItemCreateRequest,
    response: Response,
    current_user: CurrentUser,
    db: DatabaseSession,
) -> ListItemResponse:
    item, created = await add_place_to_list(
        db,
        list_id=list_id,
        place_id=payload.place_id,
        current_user_id=current_user.id,
    )
    if not created:
        response.status_code = status.HTTP_200_OK
    return await list_item_response(db, item=item, current_user_id=current_user.id)


@router.delete("/{list_id}/items/{place_id}")
async def delete_list_item(
    list_id: str,
    place_id: str,
    current_user: CurrentUser,
    db: DatabaseSession,
) -> DeleteResponse:
    await delete_place_from_owned_list(
        db,
        list_id=list_id,
        place_id=place_id,
        user_id=current_user.id,
    )
    return DeleteResponse()
