from types import SimpleNamespace
from typing import Any, cast

import pytest
from httpx import AsyncClient, Response
from pydantic import ValidationError
from sqlalchemy import delete
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.api import lists as lists_api
from app.api import places as places_api
from app.core import rate_limit
from app.core.config import Settings
from app.modules.places.models import Place
from tests.api.test_auth import auth_header, register_user
from tests.api.test_places_and_lists import _create_list, _create_place, collection_data


async def _token(client: AsyncClient, email: str) -> str:
    return str((await register_user(client, email=email))["accessToken"])


async def _token_with_display_name(client: AsyncClient, email: str, display_name: str) -> str:
    return str(
        (
            await register_user(
                client,
                email=email,
                display_name=display_name,
            )
        )["accessToken"]
    )


async def _add_place_to_list(
    client: AsyncClient,
    token: str,
    list_id: str,
    place_id: str,
) -> dict[str, Any]:
    response = await client.post(
        f"/api/v1/lists/{list_id}/items",
        json={"placeId": place_id},
        headers=auth_header(token),
    )
    assert response.status_code == 201
    return cast(dict[str, Any], response.json())


async def _rate_place(
    client: AsyncClient,
    token: str,
    place_id: str,
    rating: float,
    notes: str | None = None,
) -> dict[str, Any]:
    response = await client.post(
        "/api/v1/ratings",
        json={"placeId": place_id, "rating": rating, "notes": notes},
        headers=auth_header(token),
    )
    assert response.status_code == 201
    return cast(dict[str, Any], response.json())


async def _post_rating(
    client: AsyncClient,
    token: str,
    place_id: str,
    rating: float,
    notes: str | None = None,
) -> Response:
    return await client.post(
        "/api/v1/ratings",
        json={"placeId": place_id, "rating": rating, "notes": notes},
        headers=auth_header(token),
    )


async def _set_profile_favorites(
    client: AsyncClient,
    token: str,
    place_ids: list[str],
) -> Response:
    return await client.put(
        "/api/v1/profile/favorites",
        json={"placeIds": place_ids},
        headers=auth_header(token),
    )


async def test_rating_a_listed_place_keeps_it_in_all_user_lists(
    client: AsyncClient,
) -> None:
    token = await _token(client, "owner@example.com")
    place = await _create_place(client, token, name="Nara Cafe", place_type="cafe")
    first_list = await _create_list(client, token, name="First")
    second_list = await _create_list(client, token, name="Second")
    await _add_place_to_list(client, token, first_list["id"], place["id"])
    await _add_place_to_list(client, token, second_list["id"], place["id"])

    rating = await _rate_place(client, token, place["id"], 8.5, "  private notes  ")

    assert rating["rating"] == 8.5
    assert rating["notes"] == "private notes"

    place_detail = await client.get(f"/api/v1/places/{place['id']}", headers=auth_header(token))
    assert place_detail.status_code == 200
    place_body = place_detail.json()
    assert "currentUserTried" not in place_body
    assert place_body["currentUserRating"] == 8.5
    assert place_body["averageRating"] == 8.5
    assert place_body["ratingCount"] == 1

    first_detail = await client.get(f"/api/v1/lists/{first_list['id']}", headers=auth_header(token))
    second_detail = await client.get(
        f"/api/v1/lists/{second_list['id']}", headers=auth_header(token)
    )
    assert [item["place"]["id"] for item in first_detail.json()["items"]] == [place["id"]]
    assert [item["place"]["id"] for item in second_detail.json()["items"]] == [place["id"]]


async def test_rating_an_unlisted_place_creates_no_list_membership(
    client: AsyncClient,
) -> None:
    token = await _token(client, "owner@example.com")
    place = await _create_place(client, token, name="Nara Cafe", place_type="cafe")
    user_list = await _create_list(client, token)
    await _rate_place(client, token, place["id"], 7)

    list_detail = await client.get(f"/api/v1/lists/{user_list['id']}", headers=auth_header(token))
    profile = await client.get("/api/v1/profile", headers=auth_header(token))

    assert list_detail.status_code == 200
    assert list_detail.json()["items"] == []
    assert profile.status_code == 200
    assert profile.json()["ratingsCreatedCount"] == 1


async def test_rated_place_can_be_added_to_a_list_without_creating_second_rating(
    client: AsyncClient,
) -> None:
    token = await _token(client, "owner@example.com")
    place = await _create_place(client, token, name="Nara Cafe", place_type="cafe")
    user_list = await _create_list(client, token)
    await _rate_place(client, token, place["id"], 7)

    added_item = await _add_place_to_list(client, token, user_list["id"], place["id"])
    profile = await client.get("/api/v1/profile", headers=auth_header(token))

    assert added_item["place"]["currentUserRating"] == 7
    assert "currentUserTried" not in added_item["place"]
    assert profile.status_code == 200
    assert profile.json()["ratingsCreatedCount"] == 1


async def test_rating_upsert_and_patch_update_existing_rating(client: AsyncClient) -> None:
    token = await _token(client, "owner@example.com")
    place = await _create_place(client, token, name="Nara Cafe", place_type="cafe")
    user_list = await _create_list(client, token)

    created = await _rate_place(client, token, place["id"], 6, "")
    await _add_place_to_list(client, token, user_list["id"], place["id"])
    upsert_response = await _post_rating(client, token, place["id"], 9, "updated")
    upserted = upsert_response.json()
    patched = await client.patch(
        f"/api/v1/ratings/{place['id']}",
        json={"rating": 7, "notes": "   "},
        headers=auth_header(token),
    )
    profile = await client.get("/api/v1/profile", headers=auth_header(token))
    place_detail = await client.get(f"/api/v1/places/{place['id']}", headers=auth_header(token))
    list_detail = await client.get(f"/api/v1/lists/{user_list['id']}", headers=auth_header(token))

    assert created["notes"] is None
    assert upsert_response.status_code == 200
    assert upserted["id"] == created["id"]
    assert upserted["rating"] == 9
    assert patched.status_code == 200
    assert patched.json()["rating"] == 7
    assert patched.json()["notes"] is None
    assert profile.json()["ratingsCreatedCount"] == 1
    assert place_detail.json()["averageRating"] == 7.0
    assert place_detail.json()["ratingCount"] == 1
    assert [item["place"]["id"] for item in list_detail.json()["items"]] == [place["id"]]


async def test_notes_privacy_and_community_rating_aggregates(client: AsyncClient) -> None:
    owner_token = await _token(client, "owner@example.com")
    other_token = await _token(client, "other@example.com")
    place = await _create_place(client, owner_token, name="Nara Cafe", place_type="cafe")
    public_list = await _create_list(client, owner_token, name="Public picks")
    await _rate_place(client, owner_token, place["id"], 10, "owner private note")
    await _add_place_to_list(client, owner_token, public_list["id"], place["id"])
    visibility = await client.patch(
        f"/api/v1/lists/{public_list['id']}/visibility",
        json={"visibility": "public"},
        headers=auth_header(owner_token),
    )
    await _rate_place(client, other_token, place["id"], 6, "other private note")

    other_place_detail = await client.get(
        f"/api/v1/places/{place['id']}",
        headers=auth_header(other_token),
    )
    other_public_detail = await client.get(
        f"/api/v1/lists/public/{public_list['id']}",
        headers=auth_header(other_token),
    )
    owner_profile = await client.get("/api/v1/profile", headers=auth_header(owner_token))
    other_profile = await client.get("/api/v1/profile", headers=auth_header(other_token))

    assert visibility.status_code == 200
    assert other_place_detail.json()["averageRating"] == 8.0
    assert other_place_detail.json()["ratingCount"] == 2
    assert other_place_detail.json()["currentUserRating"] == 6
    assert "owner private note" not in str(other_place_detail.json())
    assert "owner private note" not in str(other_public_detail.json())
    assert "owner private note" in str(owner_profile.json())
    assert "owner private note" not in str(other_profile.json())
    assert "other private note" in str(other_profile.json())


async def test_public_private_list_visibility_and_guest_discovery(client: AsyncClient) -> None:
    owner_token = await _token_with_display_name(client, "owner@example.com", "تركي")
    other_token = await _token(client, "other@example.com")
    owner_list = await _create_list(client, owner_token, name="Owner list")

    private_collection = await client.get("/api/v1/lists/public", headers=auth_header(other_token))
    private_detail = await client.get(
        f"/api/v1/lists/public/{owner_list['id']}",
        headers=auth_header(other_token),
    )
    guest_collection = await client.get("/api/v1/lists/public")
    visibility = await client.patch(
        f"/api/v1/lists/{owner_list['id']}/visibility",
        json={"visibility": "public"},
        headers=auth_header(owner_token),
    )
    public_collection = await client.get("/api/v1/lists/public", headers=auth_header(other_token))
    public_detail = await client.get(
        f"/api/v1/lists/public/{owner_list['id']}",
        headers=auth_header(other_token),
    )
    guest_public_detail = await client.get(f"/api/v1/lists/public/{owner_list['id']}")
    private_again = await client.patch(
        f"/api/v1/lists/{owner_list['id']}/visibility",
        json={"visibility": "private"},
        headers=auth_header(owner_token),
    )
    private_again_detail = await client.get(
        f"/api/v1/lists/public/{owner_list['id']}",
        headers=auth_header(other_token),
    )

    assert private_collection.status_code == 200
    assert collection_data(private_collection) == []
    assert private_detail.status_code == 404
    assert guest_collection.status_code == 200
    assert collection_data(guest_collection) == []
    assert visibility.status_code == 200
    visibility_data = visibility.json()["data"]
    assert visibility_data["id"] == owner_list["id"]
    assert visibility_data["name"] == "Owner list"
    assert visibility_data["visibility"] == "public"
    assert visibility_data["placeCount"] == 0
    assert public_collection.status_code == 200
    public_summary = collection_data(public_collection)[0]
    assert public_summary["id"] == owner_list["id"]
    assert public_summary["ownerDisplayName"] == "تركي"
    assert "userId" not in public_summary
    assert "owner@example.com" not in str(public_summary)
    assert public_detail.status_code == 200
    assert public_detail.json()["id"] == owner_list["id"]
    assert public_detail.json()["ownerDisplayName"] == "تركي"
    assert "userId" not in public_detail.json()
    assert "owner@example.com" not in str(public_detail.json())
    assert guest_public_detail.status_code == 200
    assert guest_public_detail.json()["id"] == owner_list["id"]
    assert (
        guest_public_detail.json()["ownerDisplayName"] == public_detail.json()["ownerDisplayName"]
    )
    assert "userId" not in guest_public_detail.json()
    assert "owner@example.com" not in str(guest_public_detail.json())
    assert private_again.status_code == 200
    private_again_data = private_again.json()["data"]
    assert private_again_data["id"] == owner_list["id"]
    assert private_again_data["name"] == "Owner list"
    assert private_again_data["visibility"] == "private"
    assert private_again_data["placeCount"] == 0
    assert private_again_detail.status_code == 404


async def test_guest_personal_actions_remain_authenticated(client: AsyncClient) -> None:
    token = await _token(client, "guest-boundary@example.com")
    place = await _create_place(client, token, name="Protected Action Cafe")

    guest_create_list = await client.post(
        "/api/v1/lists",
        json={"name": "Guest list", "visibility": "private"},
    )
    guest_rating = await client.post(
        "/api/v1/ratings",
        json={"placeId": place["id"], "rating": 8},
    )
    guest_profile = await client.get("/api/v1/profile")

    for response in (guest_create_list, guest_rating, guest_profile):
        assert response.status_code == 401
        assert response.json()["error"]["code"] == "UNAUTHENTICATED"


async def test_anonymous_public_reads_are_rate_limited_without_charging_authenticated_reads(
    client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    token = await _token(client, "public-rate-limit@example.com")
    first_place = await _create_place(client, token, name="First Public Rate Place")
    second_place = await _create_place(client, token, name="Second Public Rate Place")
    settings = SimpleNamespace(
        redis_url=None,
        auth_rate_limit_requests=10,
        auth_rate_limit_window_seconds=60,
        public_read_rate_limit_requests=1,
        public_read_rate_limit_window_seconds=60,
    )
    clock = [10_000.0]
    monkeypatch.setattr(rate_limit, "get_settings", lambda: settings)
    monkeypatch.setattr(rate_limit, "monotonic", lambda: clock[0])
    monkeypatch.setattr(places_api, "get_settings", lambda: settings)
    monkeypatch.setattr(lists_api, "get_settings", lambda: settings)

    first_guest_read = await client.get(
        f"/api/v1/places/{first_place['id']}",
        headers={"X-Forwarded-For": "198.51.100.10"},
    )
    second_guest_read = await client.get(
        f"/api/v1/places/{second_place['id']}",
        headers={"X-Forwarded-For": "203.0.113.20"},
    )
    clock[0] += 61
    recovered_guest_read = await client.get(
        f"/api/v1/places/{second_place['id']}",
        headers={"X-Forwarded-For": "192.0.2.30"},
    )
    authenticated_read = await client.get(
        f"/api/v1/places/{second_place['id']}",
        headers=auth_header(token),
    )

    assert first_guest_read.status_code == 200
    assert second_guest_read.status_code == 429
    assert second_guest_read.json()["error"]["code"] == "RATE_LIMITED"
    assert recovered_guest_read.status_code == 200
    assert authenticated_read.status_code == 200


def test_public_read_rate_settings_are_bounded_positive() -> None:
    with pytest.raises(ValidationError):
        Settings(PUBLIC_READ_RATE_LIMIT_REQUESTS=0)
    with pytest.raises(ValidationError):
        Settings(PUBLIC_READ_RATE_LIMIT_REQUESTS=1001)
    with pytest.raises(ValidationError):
        Settings(PUBLIC_READ_RATE_LIMIT_WINDOW_SECONDS=0)
    with pytest.raises(ValidationError):
        Settings(PUBLIC_READ_RATE_LIMIT_WINDOW_SECONDS=86401)


async def test_profile_statistics_are_calculated_from_user_data(client: AsyncClient) -> None:
    token = await _token_with_display_name(client, "owner@example.com", "تركي العتيبي")
    restaurant = await _create_place(client, token, name="Nara Grill", place_type="restaurant")
    cafe = await _create_place(client, token, name="Nara Cafe", place_type="cafe")
    await _create_list(client, token, name="First")
    await _create_list(client, token, name="Second")
    await _rate_place(client, token, restaurant["id"], 10, "great")
    await _rate_place(client, token, cafe["id"], 8, "calm")

    response = await client.get("/api/v1/profile", headers=auth_header(token))

    assert response.status_code == 200
    body = response.json()
    assert body["displayName"] == "تركي العتيبي"
    assert body["bio"] is None
    assert body["averageRating"] == 9.0
    assert body["listsCount"] == 2
    assert body["listCount"] == 2
    assert body["ratedRestaurantCount"] == 1
    assert body["ratedCafeCount"] == 1
    assert "triedRestaurantCount" not in body
    assert "triedCafeCount" not in body
    assert "triedIceCreamCount" not in body
    assert body["ratingsCreatedCount"] == 2
    assert len(body["userRatings"]) == 2
    assert "triedPlaces" not in body


async def test_profile_average_rating_is_null_when_user_has_no_ratings(
    client: AsyncClient,
) -> None:
    token = await _token(client, "empty-average@example.com")

    response = await client.get("/api/v1/profile", headers=auth_header(token))

    assert response.status_code == 200
    body = response.json()
    assert body["averageRating"] is None
    assert body["ratingsCount"] == 0


async def test_profile_patch_updates_display_name_and_bio(client: AsyncClient) -> None:
    token = await _token(client, "profile-edit@example.com")

    name_only = await client.patch(
        "/api/v1/profile",
        json={"displayName": "  تركي   العتيبي  "},
        headers=auth_header(token),
    )
    bio_only = await client.patch(
        "/api/v1/profile",
        json={"bio": "  أرتب الأماكن التي تستحق الرجوع.  "},
        headers=auth_header(token),
    )
    both = await client.patch(
        "/api/v1/profile",
        json={"displayName": "سجل جديد", "bio": "سطر قصير"},
        headers=auth_header(token),
    )

    assert name_only.status_code == 200
    assert name_only.json()["displayName"] == "تركي العتيبي"
    assert name_only.json()["bio"] is None
    assert bio_only.status_code == 200
    assert bio_only.json()["displayName"] == "تركي العتيبي"
    assert bio_only.json()["bio"] == "أرتب الأماكن التي تستحق الرجوع."
    assert both.status_code == 200
    assert both.json()["displayName"] == "سجل جديد"
    assert both.json()["bio"] == "سطر قصير"


async def test_profile_patch_empty_bio_is_stored_as_null(client: AsyncClient) -> None:
    token = await _token(client, "profile-empty-bio@example.com")

    response = await client.patch(
        "/api/v1/profile",
        json={"bio": "   "},
        headers=auth_header(token),
    )

    assert response.status_code == 200
    assert response.json()["bio"] is None


async def test_profile_patch_requires_authentication(client: AsyncClient) -> None:
    response = await client.patch("/api/v1/profile", json={"displayName": "تركي"})

    assert response.status_code == 401
    assert response.json()["error"]["code"] == "UNAUTHENTICATED"


async def test_profile_patch_validates_identity_limits(client: AsyncClient) -> None:
    token = await _token(client, "profile-limits@example.com")

    empty_name = await client.patch(
        "/api/v1/profile",
        json={"displayName": "   "},
        headers=auth_header(token),
    )
    long_name = await client.patch(
        "/api/v1/profile",
        json={"displayName": "س" * 81},
        headers=auth_header(token),
    )
    long_bio = await client.patch(
        "/api/v1/profile",
        json={"bio": "x" * 281},
        headers=auth_header(token),
    )

    assert empty_name.status_code == 422
    assert empty_name.json()["error"]["code"] == "PROFILE_DISPLAY_NAME_REQUIRED"
    assert long_name.status_code == 422
    assert long_name.json()["error"]["code"] == "PROFILE_DISPLAY_NAME_TOO_LONG"
    assert long_bio.status_code == 422
    assert long_bio.json()["error"]["code"] == "PROFILE_BIO_TOO_LONG"


async def test_profile_favorites_set_replace_reorder_and_clear(client: AsyncClient) -> None:
    token = await _token(client, "favorites@example.com")
    places = [
        await _create_place(client, token, name=f"Favorite {index}", place_type="restaurant")
        for index in range(1, 5)
    ]
    for index, place in enumerate(places, start=1):
        await _rate_place(client, token, place["id"], float(index + 5))

    initial = await _set_profile_favorites(client, token, [places[1]["id"], places[0]["id"]])
    replaced = await _set_profile_favorites(client, token, [places[2]["id"], places[0]["id"]])
    reordered = await _set_profile_favorites(client, token, [places[0]["id"], places[2]["id"]])
    cleared = await _set_profile_favorites(client, token, [])

    assert initial.status_code == 200
    assert [favorite["id"] for favorite in initial.json()["favoritePlaces"]] == [
        places[1]["id"],
        places[0]["id"],
    ]
    assert [favorite["rating"] for favorite in initial.json()["favoritePlaces"]] == [7.0, 6.0]
    assert replaced.status_code == 200
    assert [favorite["id"] for favorite in replaced.json()["favoritePlaces"]] == [
        places[2]["id"],
        places[0]["id"],
    ]
    assert reordered.status_code == 200
    assert [favorite["id"] for favorite in reordered.json()["favoritePlaces"]] == [
        places[0]["id"],
        places[2]["id"],
    ]
    assert cleared.status_code == 200
    assert cleared.json()["favoritePlaces"] == []


async def test_profile_favorites_accepts_four_rated_places(client: AsyncClient) -> None:
    token = await _token(client, "favorites-four@example.com")
    places = [
        await _create_place(client, token, name=f"Top {index}", place_type="restaurant")
        for index in range(1, 5)
    ]
    for place in places:
        await _rate_place(client, token, place["id"], 8)

    response = await _set_profile_favorites(client, token, [place["id"] for place in places])

    assert response.status_code == 200
    assert [favorite["id"] for favorite in response.json()["favoritePlaces"]] == [
        place["id"] for place in places
    ]


async def test_profile_favorites_validation_errors(client: AsyncClient) -> None:
    token = await _token(client, "favorites-validation@example.com")
    places = [
        await _create_place(client, token, name=f"Validation {index}", place_type="restaurant")
        for index in range(1, 6)
    ]
    for place in places:
        await _rate_place(client, token, place["id"], 8)
    unrated = await _create_place(client, token, name="Unrated favorite", place_type="cafe")

    too_many = await _set_profile_favorites(client, token, [place["id"] for place in places])
    duplicate = await _set_profile_favorites(client, token, [places[0]["id"], places[0]["id"]])
    unknown = await _set_profile_favorites(client, token, ["missing-place-id"])
    unrated_response = await _set_profile_favorites(client, token, [unrated["id"]])

    assert too_many.status_code == 422
    assert too_many.json()["error"]["code"] == "PROFILE_FAVORITES_LIMIT_EXCEEDED"
    assert duplicate.status_code == 422
    assert duplicate.json()["error"]["code"] == "PROFILE_FAVORITES_DUPLICATE_PLACE"
    assert unknown.status_code == 422
    assert unknown.json()["error"]["code"] == "PROFILE_FAVORITE_PLACE_NOT_FOUND"
    assert unrated_response.status_code == 422
    assert unrated_response.json()["error"]["code"] == "PROFILE_FAVORITE_PLACE_NOT_RATED"


async def test_profile_favorites_requires_authentication(client: AsyncClient) -> None:
    response = await client.put("/api/v1/profile/favorites", json={"placeIds": []})

    assert response.status_code == 401
    assert response.json()["error"]["code"] == "UNAUTHENTICATED"


async def test_profile_favorite_restricts_place_deletion(
    client: AsyncClient,
    session_factory: async_sessionmaker[AsyncSession],
) -> None:
    token = await _token(client, "favorites-restrict@example.com")
    place = await _create_place(client, token, name="Restrict Favorite", place_type="restaurant")
    await _rate_place(client, token, place["id"], 8)
    response = await _set_profile_favorites(client, token, [place["id"]])
    assert response.status_code == 200

    async with session_factory() as session:
        with pytest.raises(IntegrityError):
            await session.execute(delete(Place).where(Place.id == place["id"]))


async def test_profile_counts_ice_cream_places(client: AsyncClient) -> None:
    token = await _token(client, "icecream@example.com")
    gelato = await _create_place(client, token, name="Gelato Bar", place_type="ice_cream")
    await _rate_place(client, token, gelato["id"], 9)

    response = await client.get("/api/v1/profile", headers=auth_header(token))

    assert response.status_code == 200
    body = response.json()
    assert body["ratedIceCreamCount"] == 1
    assert body["ratedRestaurantCount"] == 0
    assert body["ratedCafeCount"] == 0
    assert "triedIceCreamCount" not in body
    assert "triedRestaurantCount" not in body
    assert "triedCafeCount" not in body
    assert body["ratingsCreatedCount"] == 1


async def test_rating_rejects_overlong_notes(client: AsyncClient) -> None:
    token = await _token(client, "notes@example.com")
    place = await _create_place(client, token, name="Nara Cafe", place_type="cafe")

    response = await client.post(
        "/api/v1/ratings",
        json={"placeId": place["id"], "rating": 8, "notes": "x" * 1001},
        headers=auth_header(token),
    )

    assert response.status_code == 422


async def test_rating_validation_rejects_out_of_range_values(client: AsyncClient) -> None:
    token = await _token(client, "owner@example.com")
    place = await _create_place(client, token, name="Nara Cafe", place_type="cafe")

    response = await client.post(
        "/api/v1/ratings",
        json={"placeId": place["id"], "rating": 11},
        headers=auth_header(token),
    )

    assert response.status_code == 422


async def test_rating_validation_rejects_non_half_step_values(client: AsyncClient) -> None:
    token = await _token(client, "owner@example.com")
    place = await _create_place(client, token, name="Nara Cafe", place_type="cafe")

    response = await client.post(
        "/api/v1/ratings",
        json={"placeId": place["id"], "rating": 7.25},
        headers=auth_header(token),
    )

    assert response.status_code == 422
