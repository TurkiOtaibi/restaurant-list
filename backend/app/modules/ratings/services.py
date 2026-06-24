from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import conflict, not_found
from app.modules.lists.models import ListItem, UserList
from app.modules.places.models import Place
from app.modules.ratings.models import Rating
from app.modules.ratings.schemas import RatingCreateRequest, RatingUpdateRequest


def normalize_notes(notes: str | None) -> str | None:
    if notes is None:
        return None
    normalized = notes.strip()
    return normalized if normalized else None


async def remove_place_from_user_lists(
    db: AsyncSession,
    *,
    user_id: str,
    place_id: str,
) -> None:
    owned_list_ids = select(UserList.id).where(UserList.user_id == user_id)
    await db.execute(
        delete(ListItem).where(
            ListItem.place_id == place_id,
            ListItem.list_id.in_(owned_list_ids),
        )
    )


async def create_or_update_rating(
    db: AsyncSession,
    *,
    payload: RatingCreateRequest,
    user_id: str,
) -> tuple[Rating, bool]:
    place = await db.get(Place, payload.place_id)
    if place is None:
        not_found("Place")

    existing = await db.scalar(
        select(Rating).where(Rating.user_id == user_id, Rating.place_id == payload.place_id)
    )
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
    await remove_place_from_user_lists(db, user_id=user_id, place_id=payload.place_id)

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
    rating = await db.scalar(
        select(Rating).where(Rating.user_id == user_id, Rating.place_id == place_id)
    )
    if rating is None:
        not_found("Rating")

    rating.rating = payload.rating
    rating.notes = normalize_notes(payload.notes)
    await db.commit()
    await db.refresh(rating)
    return rating
