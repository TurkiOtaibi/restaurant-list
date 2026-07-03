from io import BytesIO
from pathlib import Path
from typing import Any, cast

import pytest
from httpx import AsyncClient
from PIL import Image

from tests.api.test_auth import auth_header, register_user
from tests.api.test_places_and_lists import _create_place, _rate_place, collection_data


async def _token(client: AsyncClient, email: str) -> str:
    return str((await register_user(client, email=email))["accessToken"])


def _image_bytes(
    *,
    image_format: str = "JPEG",
    size: tuple[int, int] = (1600, 900),
) -> bytes:
    output = BytesIO()
    Image.new("RGB", size, color=(24, 120, 80)).save(output, format=image_format)
    return output.getvalue()


def _upload_file(
    content: bytes,
    *,
    content_type: str = "image/jpeg",
    filename: str = "place.jpg",
) -> dict[str, tuple[str, bytes, str]]:
    return {"file": (filename, content, content_type)}


def _local_image_path(image_url: str) -> Path:
    key = image_url.removeprefix("/local-place-images/")
    return Path(".local-storage/place-images") / key


async def _upload_image(
    client: AsyncClient,
    token: str,
    place_id: str,
    *,
    content: bytes | None = None,
) -> dict[str, Any]:
    response = await client.put(
        f"/api/v1/places/{place_id}/image",
        files=_upload_file(content or _image_bytes()),
        headers=auth_header(token),
    )
    assert response.status_code == 200
    return cast(dict[str, Any], response.json())


async def test_place_image_upload_replace_and_remove(client: AsyncClient) -> None:
    token = await _token(client, "image-owner@example.com")
    place = await _create_place(client, token, name="Image Burger", place_type="restaurant")

    uploaded = await _upload_image(client, token, place["id"])
    first_url = uploaded["imageUrl"]
    first_path = _local_image_path(first_url)
    assert uploaded["currentUserIsCreator"] is True
    assert first_url.endswith(".webp")
    assert first_path.exists()
    with Image.open(first_path) as stored:
        assert stored.format == "WEBP"
        assert max(stored.size) <= 1200

    replaced = await _upload_image(
        client,
        token,
        place["id"],
        content=_image_bytes(image_format="PNG", size=(900, 1600)),
    )
    second_url = replaced["imageUrl"]
    second_path = _local_image_path(second_url)
    assert second_url != first_url
    assert not first_path.exists()
    assert second_path.exists()
    with Image.open(second_path) as stored:
        assert stored.format == "WEBP"
        assert max(stored.size) <= 1200

    removed = await client.delete(
        f"/api/v1/places/{place['id']}/image",
        headers=auth_header(token),
    )
    assert removed.status_code == 200
    assert removed.json()["imageUrl"] is None
    assert not second_path.exists()


async def test_place_image_permissions_and_not_found(client: AsyncClient) -> None:
    owner_token = await _token(client, "image-owner-2@example.com")
    other_token = await _token(client, "image-other@example.com")
    place = await _create_place(client, owner_token, name="Owner Only", place_type="restaurant")

    unauthenticated = await client.put(
        f"/api/v1/places/{place['id']}/image",
        files=_upload_file(_image_bytes()),
    )
    assert unauthenticated.status_code == 401

    forbidden = await client.put(
        f"/api/v1/places/{place['id']}/image",
        files=_upload_file(_image_bytes()),
        headers=auth_header(other_token),
    )
    assert forbidden.status_code == 403
    assert forbidden.json()["detail"]["code"] == "PLACE_IMAGE_FORBIDDEN"

    missing = await client.put(
        "/api/v1/places/missing-place/image",
        files=_upload_file(_image_bytes()),
        headers=auth_header(owner_token),
    )
    assert missing.status_code == 404
    assert missing.json()["detail"]["code"] == "PLACE_NOT_FOUND"


async def test_place_image_validation_errors(client: AsyncClient) -> None:
    token = await _token(client, "image-validation@example.com")
    place = await _create_place(client, token, name="Validation Burger", place_type="restaurant")

    unsupported = await client.put(
        f"/api/v1/places/{place['id']}/image",
        files=_upload_file(b"not an image", content_type="image/gif", filename="place.gif"),
        headers=auth_header(token),
    )
    assert unsupported.status_code == 422
    assert unsupported.json()["detail"]["code"] == "PLACE_IMAGE_UNSUPPORTED_FORMAT"

    corrupt = await client.put(
        f"/api/v1/places/{place['id']}/image",
        files=_upload_file(b"not an image", content_type="image/png", filename="place.png"),
        headers=auth_header(token),
    )
    assert corrupt.status_code == 422
    assert corrupt.json()["detail"]["code"] == "PLACE_IMAGE_INVALID"

    too_large = await client.put(
        f"/api/v1/places/{place['id']}/image",
        files=_upload_file(b"0" * (5 * 1024 * 1024 + 1), content_type="image/png"),
        headers=auth_header(token),
    )
    assert too_large.status_code == 413
    assert too_large.json()["detail"]["code"] == "PLACE_IMAGE_TOO_LARGE"


async def test_place_image_storage_unconfigured_returns_503(
    client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    token = await _token(client, "image-unconfigured@example.com")
    place = await _create_place(client, token, name="No Storage", place_type="restaurant")
    monkeypatch.setattr(
        "app.modules.places.image_service.get_storage_backend",
        lambda settings: None,
    )

    response = await client.put(
        f"/api/v1/places/{place['id']}/image",
        files=_upload_file(_image_bytes()),
        headers=auth_header(token),
    )

    assert response.status_code == 503
    assert response.json()["detail"]["code"] == "STORAGE_NOT_CONFIGURED"


async def test_place_image_url_flows_through_places_lists_and_profile(
    client: AsyncClient,
) -> None:
    token = await _token(client, "image-contract@example.com")
    place = await _create_place(client, token, name="Image Contract", place_type="restaurant")
    uploaded = await _upload_image(client, token, place["id"])
    await _rate_place(client, token, place_id=place["id"], rating=9.0)

    listing = await client.get("/api/v1/places", headers=auth_header(token))
    detail = await client.get(f"/api/v1/places/{place['id']}", headers=auth_header(token))
    favorites = await client.put(
        "/api/v1/profile/favorites",
        json={"placeIds": [place["id"]]},
        headers=auth_header(token),
    )

    assert listing.status_code == 200
    assert detail.status_code == 200
    assert favorites.status_code == 200
    listed_place = next(item for item in collection_data(listing) if item["id"] == place["id"])
    assert listed_place["imageUrl"] == uploaded["imageUrl"]
    assert listed_place["currentUserIsCreator"] is True
    assert detail.json()["imageUrl"] == uploaded["imageUrl"]
    assert detail.json()["currentUserIsCreator"] is True
    assert favorites.json()["favoritePlaces"][0]["imageUrl"] == uploaded["imageUrl"]
