from collections.abc import Sequence
from dataclasses import dataclass
from typing import Any, cast

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import conflict
from app.modules.lists.models import ListItem, UserList
from app.modules.places.models import Place
from app.modules.places.schemas import PlaceCreateRequest, PlaceResponse, PlaceSubtype, PlaceType
from app.modules.ratings.models import Rating


@dataclass(frozen=True)
class PlaceListResult:
    items: list[PlaceResponse]
    total: int


@dataclass(frozen=True)
class UserPlaceRelationship:
    list_ids: list[str]
    list_names: list[str]


def canonical_place_name(name: str) -> str:
    return " ".join(name.strip().split())


def normalized_place_name(name: str) -> str:
    return canonical_place_name(name).lower()


def _place_response(
    place: Place,
    average_rating: float | None,
    rating_count: int,
    current_user_rating: float | None,
    relationship: UserPlaceRelationship | None = None,
) -> PlaceResponse:
    current_relationship = relationship or UserPlaceRelationship(list_ids=[], list_names=[])
    return PlaceResponse(
        id=place.id,
        name=place.name,
        type=cast(PlaceType, place.type),
        subtype=cast(PlaceSubtype | None, place.subtype),
        description=place.description,
        created_by_user_id=place.created_by_user_id,
        created_at=place.created_at,
        updated_at=place.updated_at,
        average_rating=round(float(average_rating), 1) if average_rating is not None else None,
        rating_count=rating_count,
        current_user_rating=current_user_rating,
        current_user_list_ids=current_relationship.list_ids,
        current_user_list_names=current_relationship.list_names,
        current_user_list_count=len(current_relationship.list_ids),
    )


def _place_summary_statement(current_user_id: str) -> Any:
    current_rating = (
        select(Rating.rating)
        .where(Rating.place_id == Place.id, Rating.user_id == current_user_id)
        .correlate(Place)
        .scalar_subquery()
    )

    return (
        select(
            Place,
            func.avg(Rating.rating).label("average_rating"),
            func.count(Rating.id).label("rating_count"),
            current_rating.label("current_user_rating"),
        )
        .outerjoin(Rating, Rating.place_id == Place.id)
        .group_by(Place.id)
    )


def _normalize_search_query(query: str | None) -> str | None:
    if query is None:
        return None

    normalized = " ".join(query.strip().split()).lower()
    return normalized or None


def _escape_like(value: str) -> str:
    return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


async def list_place_summaries(
    db: AsyncSession,
    current_user_id: str,
    query: str | None = None,
    place_type: PlaceType | None = None,
    place_subtype: PlaceSubtype | None = None,
    limit: int = 100,
    offset: int = 0,
) -> PlaceListResult:
    statement = _place_summary_statement(current_user_id)
    count_statement = select(func.count(Place.id))
    if place_type is not None:
        statement = statement.where(Place.type == place_type)
        count_statement = count_statement.where(Place.type == place_type)

    if place_subtype is not None:
        statement = statement.where(Place.subtype == place_subtype)
        count_statement = count_statement.where(Place.subtype == place_subtype)

    normalized_query = _normalize_search_query(query)
    if normalized_query is not None:
        search_filter = Place.normalized_name.like(
            f"%{_escape_like(normalized_query)}%",
            escape="\\",
        )
        statement = statement.where(search_filter)
        count_statement = count_statement.where(search_filter)

    rows = await db.execute(
        statement.order_by(
            func.avg(Rating.rating).desc().nulls_last(),
            func.count(Rating.id).desc(),
            Place.normalized_name.asc(),
        )
        .offset(offset)
        .limit(limit)
    )
    row_items = rows.all()
    relationships = await get_user_place_relationships(
        db,
        current_user_id,
        [place.id for place, *_ in row_items],
    )
    total = int(await db.scalar(count_statement) or 0)
    return PlaceListResult(
        items=[_place_response_from_summary_row(row, relationships) for row in row_items],
        total=total,
    )


async def get_place_summary(
    db: AsyncSession,
    current_user_id: str,
    place_id: str,
) -> PlaceResponse | None:
    row = (
        await db.execute(_place_summary_statement(current_user_id).where(Place.id == place_id))
    ).one_or_none()
    if row is None:
        return None

    place, average_rating, rating_count, current_user_rating = row
    relationships = await get_user_place_relationships(db, current_user_id, [place.id])
    return _place_response_from_summary_row(row, relationships)


async def get_place_summaries_by_id(
    db: AsyncSession,
    current_user_id: str,
    place_ids: Sequence[str],
) -> dict[str, PlaceResponse]:
    if not place_ids:
        return {}

    rows = await db.execute(
        _place_summary_statement(current_user_id).where(Place.id.in_(place_ids))
    )
    row_items = rows.all()
    relationships = await get_user_place_relationships(db, current_user_id, place_ids)
    return {
        cast(Place, row[0]).id: _place_response_from_summary_row(row, relationships)
        for row in row_items
    }


def _place_response_from_summary_row(
    row: Any,
    relationships: dict[str, UserPlaceRelationship],
) -> PlaceResponse:
    place, average_rating, rating_count, current_user_rating = row
    return _place_response(
        place,
        average_rating,
        int(rating_count),
        current_user_rating,
        relationships.get(place.id),
    )


async def get_user_place_relationships(
    db: AsyncSession,
    current_user_id: str,
    place_ids: Sequence[str],
) -> dict[str, UserPlaceRelationship]:
    if not place_ids:
        return {}

    rows = await db.execute(
        select(ListItem.place_id, UserList.id, UserList.name)
        .join(UserList, UserList.id == ListItem.list_id)
        .where(UserList.user_id == current_user_id, ListItem.place_id.in_(place_ids))
        .order_by(UserList.created_at.desc())
    )

    relationships: dict[str, UserPlaceRelationship] = {}
    for place_id, list_id, list_name in rows.all():
        existing = relationships.get(place_id) or UserPlaceRelationship(list_ids=[], list_names=[])
        relationships[place_id] = UserPlaceRelationship(
            list_ids=[*existing.list_ids, list_id],
            list_names=[*existing.list_names, list_name],
        )
    return relationships


async def create_place_for_user(
    db: AsyncSession,
    *,
    payload: PlaceCreateRequest,
    user_id: str,
) -> Place:
    name = canonical_place_name(payload.name)
    normalized_name = normalized_place_name(name)
    place = Place(
        name=name,
        normalized_name=normalized_name,
        type=payload.type,
        subtype=payload.subtype,
        description=payload.description.strip() if payload.description else None,
        created_by_user_id=user_id,
    )
    db.add(place)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        conflict("DUPLICATE_PLACE_NAME", "Place name already exists.")

    await db.refresh(place)
    return place
