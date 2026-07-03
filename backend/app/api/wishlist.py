from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.modules.auth.dependencies import get_current_user
from app.modules.auth.models import User
from app.modules.lists.schemas import ListDetailResponse, ListItemCreateRequest
from app.modules.lists.services import (
    add_place_to_list,
    delete_place_from_owned_list,
    get_or_create_wishlist_for_user,
    get_wishlist_for_user,
    list_detail_response,
)

router = APIRouter(prefix="/wishlist", tags=["wishlist"])
CurrentUser = Annotated[User, Depends(get_current_user)]
DatabaseSession = Annotated[AsyncSession, Depends(get_db)]


@router.post("/places", response_model=ListDetailResponse)
async def add_wishlist_place(
    payload: ListItemCreateRequest,
    current_user: CurrentUser,
    db: DatabaseSession,
) -> ListDetailResponse:
    current_user_id = current_user.id
    wishlist = await get_or_create_wishlist_for_user(db, user_id=current_user_id)
    await add_place_to_list(
        db,
        list_id=wishlist.id,
        place_id=payload.place_id,
        current_user_id=current_user_id,
    )
    refreshed = await get_wishlist_for_user(db, user_id=current_user_id)
    return await list_detail_response(db, user_list=refreshed, current_user_id=current_user_id)


@router.delete("/places/{place_id}", response_model=ListDetailResponse)
async def delete_wishlist_place(
    place_id: str,
    current_user: CurrentUser,
    db: DatabaseSession,
) -> ListDetailResponse:
    current_user_id = current_user.id
    wishlist = await get_wishlist_for_user(db, user_id=current_user_id)
    await delete_place_from_owned_list(
        db,
        list_id=wishlist.id,
        place_id=place_id,
        user_id=current_user_id,
    )
    refreshed = await get_wishlist_for_user(db, user_id=current_user_id)
    return await list_detail_response(db, user_list=refreshed, current_user_id=current_user_id)
