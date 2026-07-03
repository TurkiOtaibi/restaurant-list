from dataclasses import dataclass

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.errors import api_error
from app.core.text import collapse_whitespace
from app.modules.auth.models import User, normalize_display_name
from app.modules.lists.models import ListItem, UserList
from app.modules.places.models import Place
from app.modules.places.services import get_place_summaries_by_id
from app.modules.profile.models import UserFavoritePlace
from app.modules.profile.schemas import (
    ProfileFavoritePlaceResponse,
    ProfileFavoritesUpdateRequest,
    ProfilePublicListSummaryResponse,
    ProfileRatingResponse,
    ProfileResponse,
    ProfileUpdateRequest,
    ProfileWishlistResponse,
)
from app.modules.ratings.models import Rating

MAX_PROFILE_DISPLAY_NAME_LENGTH = 80
MAX_PROFILE_BIO_LENGTH = 280
MAX_PROFILE_FAVORITES = 4
VALIDATION_STATUS_CODE = 422


@dataclass(frozen=True)
class _ProfileRatingCounts:
    rated_restaurant_count: int
    rated_cafe_count: int
    rated_ice_cream_count: int
    ratings_created_count: int


async def get_profile_for_user(db: AsyncSession, user: User) -> ProfileResponse:
    list_count = await _list_count_for_user(db, user)
    counts = await _rating_counts_for_user(db, user)
    ratings = await _ratings_for_user(db, user)
    user_ratings = await _profile_rating_responses(db, user, ratings)
    favorite_places = await _favorite_place_responses(db, user)
    wishlist = await _wishlist_summary_for_user(db, user)
    public_lists_summary = await _public_lists_summary_for_user(db, user)

    return _profile_response(
        counts=counts,
        favorite_places=favorite_places,
        list_count=list_count,
        public_lists_summary=public_lists_summary,
        user_ratings=user_ratings,
        user=user,
        wishlist=wishlist,
    )


async def update_profile_for_user(
    db: AsyncSession,
    user: User,
    payload: ProfileUpdateRequest,
) -> ProfileResponse:
    updated = False

    if "display_name" in payload.model_fields_set:
        user.display_name = _validated_display_name(payload.display_name)
        updated = True

    if "bio" in payload.model_fields_set:
        user.bio = _validated_bio(payload.bio)
        updated = True

    if updated:
        await db.commit()
        await db.refresh(user)

    return await get_profile_for_user(db, user)


async def update_favorite_places_for_user(
    db: AsyncSession,
    user: User,
    payload: ProfileFavoritesUpdateRequest,
) -> ProfileResponse:
    place_ids = payload.place_ids
    await _validate_favorite_place_ids(db, user, place_ids)

    await db.execute(delete(UserFavoritePlace).where(UserFavoritePlace.user_id == user.id))
    for index, place_id in enumerate(place_ids, start=1):
        db.add(UserFavoritePlace(user_id=user.id, place_id=place_id, position=index))

    await db.commit()
    return await get_profile_for_user(db, user)


async def _list_count_for_user(db: AsyncSession, user: User) -> int:
    list_count: int | None = await db.scalar(
        select(func.count(UserList.id)).where(UserList.user_id == user.id)
    )
    return int(list_count or 0)


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


async def _favorite_place_responses(
    db: AsyncSession,
    user: User,
) -> list[ProfileFavoritePlaceResponse]:
    rows = await db.execute(
        select(UserFavoritePlace, Place, Rating.rating)
        .join(Place, Place.id == UserFavoritePlace.place_id)
        .join(
            Rating,
            (Rating.place_id == UserFavoritePlace.place_id) & (Rating.user_id == user.id),
        )
        .where(UserFavoritePlace.user_id == user.id)
        .order_by(UserFavoritePlace.position.asc())
    )

    return [
        ProfileFavoritePlaceResponse(
            id=place.id,
            name=place.name,
            type=place.type,
            subtype=place.subtype,
            image_url=place.image_url,
            rating=float(rating),
        )
        for _favorite, place, rating in rows.tuples().all()
    ]


async def _wishlist_summary_for_user(
    db: AsyncSession,
    user: User,
) -> ProfileWishlistResponse | None:
    item_count = (
        select(func.count(ListItem.id))
        .where(ListItem.list_id == UserList.id)
        .correlate(UserList)
        .scalar_subquery()
    )
    row = await db.execute(
        select(UserList.id, item_count.label("place_count")).where(
            UserList.user_id == user.id,
            UserList.is_system.is_(True),
        )
    )
    result = row.one_or_none()
    if result is None:
        return None

    list_id, place_count = result
    return ProfileWishlistResponse(id=list_id, place_count=int(place_count))


async def _validate_favorite_place_ids(
    db: AsyncSession,
    user: User,
    place_ids: list[str],
) -> None:
    if len(place_ids) > MAX_PROFILE_FAVORITES:
        api_error(
            VALIDATION_STATUS_CODE,
            "PROFILE_FAVORITES_LIMIT_EXCEEDED",
            "Profile favorites are limited to four places.",
        )

    if len(set(place_ids)) != len(place_ids):
        api_error(
            VALIDATION_STATUS_CODE,
            "PROFILE_FAVORITES_DUPLICATE_PLACE",
            "Profile favorites must not include duplicate places.",
        )

    if not place_ids:
        return

    existing_place_ids = set(await db.scalars(select(Place.id).where(Place.id.in_(place_ids))))
    if len(existing_place_ids) != len(place_ids):
        api_error(
            VALIDATION_STATUS_CODE,
            "PROFILE_FAVORITE_PLACE_NOT_FOUND",
            "One or more favorite places do not exist.",
        )

    rated_place_ids = set(
        await db.scalars(
            select(Rating.place_id).where(
                Rating.user_id == user.id,
                Rating.place_id.in_(place_ids),
            )
        )
    )
    if len(rated_place_ids) != len(place_ids):
        api_error(
            VALIDATION_STATUS_CODE,
            "PROFILE_FAVORITE_PLACE_NOT_RATED",
            "Favorite places must be rated by the user.",
        )


def _profile_response(
    *,
    counts: _ProfileRatingCounts,
    favorite_places: list[ProfileFavoritePlaceResponse],
    list_count: int,
    public_lists_summary: list[ProfilePublicListSummaryResponse],
    user_ratings: list[ProfileRatingResponse],
    user: User,
    wishlist: ProfileWishlistResponse | None,
) -> ProfileResponse:

    return ProfileResponse(
        display_name=user.display_name,
        bio=user.bio,
        average_rating=_average_rating(user_ratings),
        lists_count=list_count,
        list_count=list_count,
        rated_restaurant_count=counts.rated_restaurant_count,
        rated_cafe_count=counts.rated_cafe_count,
        rated_ice_cream_count=counts.rated_ice_cream_count,
        ratings_count=counts.ratings_created_count,
        ratings_created_count=counts.ratings_created_count,
        favorite_places=favorite_places,
        wishlist=wishlist,
        user_ratings=user_ratings,
        public_lists_summary=public_lists_summary,
    )


def _average_rating(user_ratings: list[ProfileRatingResponse]) -> float | None:
    if not user_ratings:
        return None

    return round(sum(rating.rating for rating in user_ratings) / len(user_ratings), 1)


def _validated_display_name(display_name: str | None) -> str:
    normalized_input = collapse_whitespace(display_name or "")
    if not normalized_input:
        api_error(
            VALIDATION_STATUS_CODE,
            "PROFILE_DISPLAY_NAME_REQUIRED",
            "Display name is required.",
        )

    normalized = normalize_display_name(normalized_input)
    if len(normalized) > MAX_PROFILE_DISPLAY_NAME_LENGTH:
        api_error(
            VALIDATION_STATUS_CODE,
            "PROFILE_DISPLAY_NAME_TOO_LONG",
            "Display name must be 80 characters or fewer.",
        )

    return normalized


def _validated_bio(bio: str | None) -> str | None:
    if bio is None:
        return None

    normalized = bio.strip()
    if not normalized:
        return None

    if len(normalized) > MAX_PROFILE_BIO_LENGTH:
        api_error(
            VALIDATION_STATUS_CODE,
            "PROFILE_BIO_TOO_LONG",
            "Bio must be 280 characters or fewer.",
        )

    return normalized


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
