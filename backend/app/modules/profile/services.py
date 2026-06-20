from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.auth.models import User
from app.modules.lists.models import UserList
from app.modules.places.services import get_place_summaries_by_id
from app.modules.profile.schemas import ProfileRatingResponse, ProfileResponse
from app.modules.ratings.models import Rating


async def get_profile_for_user(db: AsyncSession, user: User) -> ProfileResponse:
    list_count = await db.scalar(select(func.count(UserList.id)).where(UserList.user_id == user.id))
    ratings = list(
        await db.scalars(
            select(Rating)
            .where(Rating.user_id == user.id)
            .options(selectinload(Rating.place))
            .order_by(Rating.updated_at.desc())
        )
    )
    place_ids = [rating.place_id for rating in ratings]
    place_by_id = await get_place_summaries_by_id(db, user.id, place_ids)

    tried_restaurant_count = sum(1 for rating in ratings if rating.place.type == "restaurant")
    tried_cafe_count = sum(1 for rating in ratings if rating.place.type == "cafe")

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
        tried_restaurant_count=tried_restaurant_count,
        tried_cafe_count=tried_cafe_count,
        ratings_created_count=len(ratings),
        user_ratings=user_ratings,
        tried_places=[place_by_id[place_id] for place_id in place_ids],
    )
