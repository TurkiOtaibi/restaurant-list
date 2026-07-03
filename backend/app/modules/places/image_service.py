from hashlib import sha256
from io import BytesIO

from fastapi import UploadFile, status
from PIL import Image, ImageOps, UnidentifiedImageError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.errors import api_error, not_found
from app.core.storage import StorageBackend, get_storage_backend
from app.modules.auth.models import User
from app.modules.places.models import Place
from app.modules.places.schemas import PlaceResponse
from app.modules.places.services import get_place_summary

MAX_PLACE_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024
MAX_PLACE_IMAGE_LONG_EDGE = 1200
PLACE_IMAGE_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}
WEBP_CONTENT_TYPE = "image/webp"


async def upload_place_image(
    db: AsyncSession,
    *,
    current_user: User,
    file: UploadFile,
    place_id: str,
) -> PlaceResponse:
    place = await _get_place_for_image_update(db, place_id)
    _authorize_place_image_update(place, current_user)
    storage = _configured_storage()
    processed = await _processed_upload(file)
    key = f"places/{place.id}/{sha256(processed).hexdigest()}.webp"

    old_url = place.image_url
    new_url = await storage.put(key, processed, WEBP_CONTENT_TYPE)
    place.image_url = new_url
    try:
        await db.commit()
    except Exception:
        await db.rollback()
        await storage.delete(key)
        raise

    await storage.delete_url(old_url)
    return await _updated_place_response(db, current_user, place.id)


async def delete_place_image(
    db: AsyncSession,
    *,
    current_user: User,
    place_id: str,
) -> PlaceResponse:
    place = await _get_place_for_image_update(db, place_id)
    _authorize_place_image_update(place, current_user)
    storage = _configured_storage()

    old_url = place.image_url
    place.image_url = None
    await db.commit()
    await storage.delete_url(old_url)
    return await _updated_place_response(db, current_user, place.id)


async def _get_place_for_image_update(db: AsyncSession, place_id: str) -> Place:
    place = await db.get(Place, place_id)
    if place is None:
        not_found("Place")
    return place


def _authorize_place_image_update(place: Place, current_user: User) -> None:
    if place.created_by_user_id != current_user.id:
        api_error(
            status.HTTP_403_FORBIDDEN,
            "PLACE_IMAGE_FORBIDDEN",
            "Only the place creator can manage its image.",
        )


def _configured_storage() -> StorageBackend:
    storage = get_storage_backend(get_settings())
    if storage is None:
        api_error(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "STORAGE_NOT_CONFIGURED",
            "Place image storage is not configured.",
        )
    return storage


async def _processed_upload(file: UploadFile) -> bytes:
    if file.content_type not in PLACE_IMAGE_CONTENT_TYPES:
        api_error(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            "PLACE_IMAGE_UNSUPPORTED_FORMAT",
            "Place image must be JPEG, PNG, or WebP.",
        )

    raw = await file.read(MAX_PLACE_IMAGE_UPLOAD_BYTES + 1)
    if len(raw) > MAX_PLACE_IMAGE_UPLOAD_BYTES:
        api_error(
            status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            "PLACE_IMAGE_TOO_LARGE",
            "Place image must be 5MB or smaller.",
        )

    try:
        with Image.open(BytesIO(raw)) as source:
            image = ImageOps.exif_transpose(source)
            image.load()
            normalized = image.convert("RGB")
    except (OSError, UnidentifiedImageError):
        api_error(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            "PLACE_IMAGE_INVALID",
            "Place image could not be decoded.",
        )

    normalized.thumbnail(
        (MAX_PLACE_IMAGE_LONG_EDGE, MAX_PLACE_IMAGE_LONG_EDGE),
        Image.Resampling.LANCZOS,
    )
    output = BytesIO()
    normalized.save(output, format="WEBP", quality=80, method=6)
    return output.getvalue()


async def _updated_place_response(
    db: AsyncSession,
    current_user: User,
    place_id: str,
) -> PlaceResponse:
    place_response = await get_place_summary(db, current_user.id, place_id)
    if place_response is None:
        not_found("Place")
    return place_response
