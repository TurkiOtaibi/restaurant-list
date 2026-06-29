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


async def get_profile_for_user(db: AsyncSession, user: User) -> ProfileResponse:
    list_count = await db.scalar(select(func.count(UserList.id)).where(UserList.user_id == user.id))

    type_counts_rows = await db.execute(
        select(Place.type, func.count(Rating.id))
        .join(Rating, Rating.place_id == Place.id)
        .where(Rating.user_id == user.id)
        .group_by(Place.type)
    )
    counts_by_type = {place_type: int(count) for place_type, count in type_counts_rows.all()}
    ratings_created_count = sum(counts_by_type.values())

    ratings = list(
        await db.scalars(
            select(Rating)
            .where(Rating.user_id == user.id)
            .options(selectinload(Rating.place))
            .join(Place, Place.id == Rating.place_id)
            .order_by(Rating.updated_at.desc(), Rating.created_at.desc(), Place.name.asc())
        )
    )
    place_ids = [rating.place_id for rating in ratings]
    place_by_id = await get_place_summaries_by_id(db, user.id, place_ids)

    user_ratings = [
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
    public_lists_summary = await _public_lists_summary_for_user(db, user)

    return ProfileResponse(
        lists_count=int(list_count or 0),
        list_count=int(list_count or 0),
        tried_restaurant_count=counts_by_type.get("restaurant", 0),
        tried_cafe_count=counts_by_type.get("cafe", 0),
        tried_ice_cream_count=counts_by_type.get("ice_cream", 0),
        ratings_count=ratings_created_count,
        ratings_created_count=ratings_created_count,
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
