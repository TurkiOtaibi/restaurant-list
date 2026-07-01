from dataclasses import dataclass

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.auth.models import User
from app.modules.lists.models import ListItem, UserList
from app.modules.places.models import Place
from app.modules.places.services import get_place_summaries_by_id
from app.modules.profile.schemas import (
    ProfilePublicListSummaryResponse,
    ProfileRatingResponse,
    ProfileResponse,
)
from app.modules.ratings.models import Rating


@dataclass(frozen=True)
class _ProfileRatingCounts:
    rated_restaurant_count: int
    rated_cafe_count: int
    rated_ice_cream_count: int
    ratings_created_count: int


async def get_profile_for_user(db: AsyncSession, user: User) -> ProfileResponse:
    list_count = await db.scalar(select(func.count(UserList.id)).where(UserList.user_id == user.id))
    counts = await _rating_counts_for_user(db, user)
    ratings = await _ratings_for_user(db, user)
    user_ratings = await _profile_rating_responses(db, user, ratings)
    public_lists_summary = await _public_lists_summary_for_user(db, user)

    return _profile_response(
        counts=counts,
        list_count=int(list_count or 0),
        public_lists_summary=public_lists_summary,
        user_ratings=user_ratings,
    )


async def _rating_counts_for_user(db: AsyncSession, user: User) -> _ProfileRatingCounts:
    type_counts_rows = await db.execute(
        select(Place.type, func.count(Rating.id))
        .join(Rating, Rating.place_id == Place.id)
        .where(Rating.user_id == user.id)
        .group_by(Place.type)
    )
    counts_by_type = {place_type: int(count) for place_type, count in type_counts_rows.all()}

    return _ProfileRatingCounts(
        rated_restaurant_count=counts_by_type.get("restaurant", 0),
        rated_cafe_count=counts_by_type.get("cafe", 0),
        rated_ice_cream_count=counts_by_type.get("ice_cream", 0),
        ratings_created_count=sum(counts_by_type.values()),
    )


async def _ratings_for_user(db: AsyncSession, user: User) -> list[Rating]:
    return list(
        await db.scalars(
            select(Rating)
            .where(Rating.user_id == user.id)
            .options(selectinload(Rating.place))
            .join(Place, Place.id == Rating.place_id)
            .order_by(Rating.updated_at.desc(), Rating.created_at.desc(), Place.name.asc())
        )
    )


async def _profile_rating_responses(
    db: AsyncSession,
    user: User,
    ratings: list[Rating],
) -> list[ProfileRatingResponse]:
    place_ids = [rating.place_id for rating in ratings]
    place_by_id = await get_place_summaries_by_id(db, user.id, place_ids)

    return [
        ProfileRatingResponse(
            id=rating.id,
            place=place_by_id[rating.place_id],
            rating=rating.rating,
            notes=rating.notes,
            created_at=rating.created_at,
            updated_at=rating.updated_at,
        )
        for rating in ratings
    ]


def _profile_response(
    *,
    counts: _ProfileRatingCounts,
    list_count: int,
    public_lists_summary: list[ProfilePublicListSummaryResponse],
    user_ratings: list[ProfileRatingResponse],
) -> ProfileResponse:

    return ProfileResponse(
        lists_count=list_count,
        list_count=list_count,
        rated_restaurant_count=counts.rated_restaurant_count,
        rated_cafe_count=counts.rated_cafe_count,
        rated_ice_cream_count=counts.rated_ice_cream_count,
        ratings_count=counts.ratings_created_count,
        ratings_created_count=counts.ratings_created_count,
        user_ratings=user_ratings,
        public_lists_summary=public_lists_summary,
    )


async def _public_lists_summary_for_user(
    db: AsyncSession, user: User
) -> list[ProfilePublicListSummaryResponse]:
    item_count = (
        select(func.count(ListItem.id))
        .where(ListItem.list_id == UserList.id)
        .correlate(UserList)
        .scalar_subquery()
    )
    rows = await db.execute(
        select(UserList, item_count.label("place_count"))
        .where(UserList.user_id == user.id, UserList.visibility == "public")
        .order_by(UserList.created_at.desc(), UserList.id.desc())
    )
    return [
        ProfilePublicListSummaryResponse(
            id=user_list.id,
            name=user_list.name,
            owner_display_name=user.display_name,
            place_count=int(place_count),
            created_at=user_list.created_at,
            updated_at=user_list.updated_at,
        )
        for user_list, place_count in rows.tuples().all()
    ]
