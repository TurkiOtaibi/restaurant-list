from dataclasses import dataclass
from typing import cast

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.sql import Select

from app.core.errors import internal_error, not_found
from app.modules.auth.models import User
from app.modules.lists.models import ListItem, UserList
from app.modules.lists.schemas import (
    ListCreateRequest,
    ListDetailResponse,
    ListItemResponse,
    ListResponse,
    ListUpdateRequest,
    ListVisibility,
    ListVisibilityUpdateRequest,
    PublicListDetailResponse,
    PublicListResponse,
)
from app.modules.places.models import Place
from app.modules.places.schemas import PlaceCollectionResponse
from app.modules.places.services import get_place_summaries_by_id


@dataclass(frozen=True)
class ListCollectionResult:
    items: list[ListResponse]
    total: int


@dataclass(frozen=True)
class PublicListCollectionResult:
    items: list[PublicListResponse]
    total: int


async def get_owned_list(db: AsyncSession, *, list_id: str, user_id: str) -> UserList:
    result = await db.scalar(
        select(UserList)
        .where(UserList.id == list_id, UserList.user_id == user_id)
        .options(
            selectinload(UserList.user),
            selectinload(UserList.items).selectinload(ListItem.place),
        )
    )
    if result is None:
        not_found("List")
    return result


async def get_public_user_list(db: AsyncSession, *, list_id: str) -> UserList:
    result = await db.scalar(
        select(UserList)
        .where(UserList.id == list_id, UserList.visibility == "public")
        .options(
            selectinload(UserList.user),
            selectinload(UserList.items).selectinload(ListItem.place),
        )
    )
    if result is None:
        not_found("List")
    return result


async def list_owned_lists(
    db: AsyncSession,
    *,
    user_id: str,
    limit: int,
    offset: int,
) -> ListCollectionResult:
    result = await _list_summary_rows(
        db,
        select(UserList).where(UserList.user_id == user_id),
        limit=limit,
        offset=offset,
    )
    return ListCollectionResult(
        items=[
            _list_response(user_list, int(place_count))
            for user_list, place_count, _owner_display_name in result.items
        ],
        total=result.total,
    )


async def list_public_lists(
    db: AsyncSession,
    *,
    limit: int,
    offset: int,
) -> PublicListCollectionResult:
    result = await _list_summary_rows(
        db,
        select(UserList).where(UserList.visibility == "public"),
        limit=limit,
        offset=offset,
    )
    return PublicListCollectionResult(
        items=[
            _public_list_response(user_list, int(place_count), owner_display_name)
            for user_list, place_count, owner_display_name in result.items
        ],
        total=result.total,
    )


async def create_list_for_user(
    db: AsyncSession,
    *,
    payload: ListCreateRequest,
    user_id: str,
) -> ListResponse:
    user_list = UserList(
        user_id=user_id,
        name=payload.name.strip(),
        visibility=payload.visibility,
    )
    db.add(user_list)
    await db.commit()
    await db.refresh(user_list)
    return _list_response(user_list, 0)


async def update_owned_list_name(
    db: AsyncSession,
    *,
    list_id: str,
    payload: ListUpdateRequest,
    user_id: str,
) -> ListResponse:
    user_list = await get_owned_list(db, list_id=list_id, user_id=user_id)
    user_list.name = payload.name.strip()
    await db.commit()
    await db.refresh(user_list)
    return _list_response(user_list, len(user_list.items))


async def update_owned_list_visibility(
    db: AsyncSession,
    *,
    list_id: str,
    payload: ListVisibilityUpdateRequest,
    user_id: str,
) -> ListResponse:
    user_list = await get_owned_list(db, list_id=list_id, user_id=user_id)
    user_list.visibility = payload.visibility
    await db.commit()
    await db.refresh(user_list)
    return _list_response(user_list, len(user_list.items))


async def delete_owned_list(
    db: AsyncSession,
    *,
    list_id: str,
    user_id: str,
) -> None:
    user_list = await get_owned_list(db, list_id=list_id, user_id=user_id)
    await db.delete(user_list)
    await db.commit()


async def delete_place_from_owned_list(
    db: AsyncSession,
    *,
    list_id: str,
    place_id: str,
    user_id: str,
) -> None:
    user_list = await get_owned_list(db, list_id=list_id, user_id=user_id)
    item = next(
        (candidate for candidate in user_list.items if candidate.place_id == place_id), None
    )
    if item is None:
        not_found("List item")
    await db.delete(item)
    await db.commit()


@dataclass(frozen=True)
class _ListSummaryRows:
    items: list[tuple[UserList, int, str]]
    total: int


async def _list_summary_rows(
    db: AsyncSession,
    base_statement: Select[tuple[UserList]],
    *,
    limit: int,
    offset: int,
) -> _ListSummaryRows:
    item_count = (
        select(func.count(ListItem.id))
        .where(ListItem.list_id == UserList.id)
        .correlate(UserList)
        .scalar_subquery()
    )
    total_statement = select(func.count()).select_from(base_statement.subquery())
    rows = await db.execute(
        base_statement.join(User, User.id == UserList.user_id)
        .with_only_columns(UserList, item_count.label("place_count"), User.display_name)
        .order_by(UserList.created_at.desc(), UserList.id.desc())
        .offset(offset)
        .limit(limit)
    )
    total = int(await db.scalar(total_statement) or 0)
    return _ListSummaryRows(
        items=[
            (user_list, int(place_count), owner_display_name)
            for user_list, place_count, owner_display_name in rows.tuples().all()
        ],
        total=total,
    )


async def list_detail_response(
    db: AsyncSession,
    *,
    user_list: UserList,
    current_user_id: str,
) -> ListDetailResponse:
    place_by_id = await get_place_summaries_by_id(
        db,
        current_user_id,
        [item.place_id for item in user_list.items],
    )
    return ListDetailResponse(
        id=user_list.id,
        name=user_list.name,
        visibility=cast(ListVisibility, user_list.visibility),
        place_count=len(user_list.items),
        created_at=user_list.created_at,
        updated_at=user_list.updated_at,
        items=[
            ListItemResponse(
                id=item.id,
                list_id=item.list_id,
                place_id=item.place_id,
                place=PlaceCollectionResponse.model_validate(place_by_id[item.place_id]),
                created_at=item.created_at,
            )
            for item in user_list.items
        ],
    )


async def public_list_detail_response(
    db: AsyncSession,
    *,
    user_list: UserList,
    current_user_id: str,
) -> PublicListDetailResponse:
    place_by_id = await get_place_summaries_by_id(
        db,
        current_user_id,
        [item.place_id for item in user_list.items],
    )
    return PublicListDetailResponse(
        id=user_list.id,
        name=user_list.name,
        visibility=cast(ListVisibility, user_list.visibility),
        owner_display_name=user_list.user.display_name,
        place_count=len(user_list.items),
        created_at=user_list.created_at,
        updated_at=user_list.updated_at,
        items=[
            ListItemResponse(
                id=item.id,
                list_id=item.list_id,
                place_id=item.place_id,
                place=PlaceCollectionResponse.model_validate(place_by_id[item.place_id]),
                created_at=item.created_at,
            )
            for item in user_list.items
        ],
    )


async def list_item_response(
    db: AsyncSession,
    *,
    item: ListItem,
    current_user_id: str,
) -> ListItemResponse:
    place_by_id = await get_place_summaries_by_id(db, current_user_id, [item.place_id])
    return ListItemResponse(
        id=item.id,
        list_id=item.list_id,
        place_id=item.place_id,
        place=PlaceCollectionResponse.model_validate(place_by_id[item.place_id]),
        created_at=item.created_at,
    )


async def add_place_to_list(
    db: AsyncSession,
    *,
    list_id: str,
    place_id: str,
    current_user_id: str,
) -> tuple[ListItem, bool]:
    await get_owned_list(db, list_id=list_id, user_id=current_user_id)
    place = await db.get(Place, place_id)
    if place is None:
        not_found("Place")

    existing_item = await db.scalar(
        select(ListItem).where(ListItem.list_id == list_id, ListItem.place_id == place_id)
    )
    if existing_item is not None:
        return existing_item, False

    item = ListItem(list_id=list_id, place_id=place_id)
    db.add(item)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        existing_after_race = await db.scalar(
            select(ListItem).where(ListItem.list_id == list_id, ListItem.place_id == place_id)
        )
        if existing_after_race is not None:
            return existing_after_race, False
        internal_error()

    result = await db.scalar(select(ListItem).where(ListItem.id == item.id))
    if result is None:
        internal_error()
    return result, True


def _list_response(user_list: UserList, place_count: int) -> ListResponse:
    return ListResponse(
        id=user_list.id,
        name=user_list.name,
        visibility=cast(ListVisibility, user_list.visibility),
        place_count=place_count,
        created_at=user_list.created_at,
        updated_at=user_list.updated_at,
    )


def _public_list_response(
    user_list: UserList, place_count: int, owner_display_name: str
) -> PublicListResponse:
    return PublicListResponse(
        id=user_list.id,
        name=user_list.name,
        visibility=cast(ListVisibility, user_list.visibility),
        owner_display_name=owner_display_name,
        place_count=place_count,
        created_at=user_list.created_at,
        updated_at=user_list.updated_at,
    )
