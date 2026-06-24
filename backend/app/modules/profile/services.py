from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.auth.models import User
from app.modules.lists.models import UserList
from app.modules.places.models import Place
from app.modules.places.services import get_place_summaries_by_id
from app.modules.profile.schemas import ProfileRatingResponse, ProfileResponse
from app.modules.ratings.models import Rating

# Upper bound on how many rating rows the archive materializes per request, so a
# heavy user's profile cannot load thousands of rows. Headline statistics are
# computed with COUNT aggregates and are unaffected by this cap.
ARCHIVE_PAGE_SIZE = 100


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
            .order_by(Rating.updated_at.desc())
            .limit(ARCHIVE_PAGE_SIZE)
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

    return ProfileResponse(
        list_count=int(list_count or 0),
        tried_restaurant_count=counts_by_type.get("restaurant", 0),
        tried_cafe_count=counts_by_type.get("cafe", 0),
        tried_ice_cream_count=counts_by_type.get("ice_cream", 0),
        ratings_created_count=ratings_created_count,
        user_ratings=user_ratings,
    )
