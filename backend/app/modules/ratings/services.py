from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import conflict, not_found
from app.modules.places.models import Place
from app.modules.ratings.models import Rating
from app.modules.ratings.schemas import RatingCreateRequest, RatingUpdateRequest


def normalize_notes(notes: str | None) -> str | None:
    if notes is None:
        return None
    normalized = notes.strip()
    return normalized if normalized else None


async def get_user_rating(
    db: AsyncSession,
    *,
    user_id: str,
    place_id: str,
) -> Rating | None:
    rating: Rating | None = await db.scalar(
        select(Rating).where(Rating.user_id == user_id, Rating.place_id == place_id)
    )
    return rating


async def create_or_update_rating(
    db: AsyncSession,
    *,
    payload: RatingCreateRequest,
    user_id: str,
) -> tuple[Rating, bool]:
    place = await db.get(Place, payload.place_id)
    if place is None:
        not_found("Place")

    existing = await get_user_rating(db, user_id=user_id, place_id=payload.place_id)
    if existing is not None:
        existing.rating = payload.rating
        existing.notes = normalize_notes(payload.notes)
        await db.commit()
        await db.refresh(existing)
        return existing, False

    rating = Rating(
        user_id=user_id,
        place_id=payload.place_id,
        rating=payload.rating,
        notes=normalize_notes(payload.notes),
    )
    db.add(rating)

    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        conflict("DUPLICATE_RATING", "Rating already exists.")

    await db.refresh(rating)
    return rating, True


async def update_existing_rating(
    db: AsyncSession,
    *,
    place_id: str,
    payload: RatingUpdateRequest,
    user_id: str,
) -> Rating:
    rating = await get_user_rating(db, user_id=user_id, place_id=place_id)
    if rating is None:
        not_found("Rating")

    rating.rating = payload.rating
    rating.notes = normalize_notes(payload.notes)
    await db.commit()
    await db.refresh(rating)
    return rating
