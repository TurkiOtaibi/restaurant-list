from typing import Any, cast

from httpx import AsyncClient

from tests.api.test_auth import auth_header, register_user
from tests.api.test_places_and_lists import _create_list, _create_place, collection_data


async def _token(client: AsyncClient, email: str) -> str:
    return str((await register_user(client, email=email))["accessToken"])


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
    rating: int,
    notes: str | None = None,
) -> dict[str, Any]:
    response = await client.post(
        "/api/v1/ratings",
        json={"placeId": place_id, "rating": rating, "notes": notes},
        headers=auth_header(token),
    )
    assert response.status_code == 201
    return cast(dict[str, Any], response.json())


async def test_rating_creates_tried_status_and_removes_place_from_all_user_lists(
    client: AsyncClient,
) -> None:
    token = await _token(client, "owner@example.com")
    place = await _create_place(client, token, name="Nara Cafe", place_type="cafe")
    first_list = await _create_list(client, token, name="First")
    second_list = await _create_list(client, token, name="Second")
    await _add_place_to_list(client, token, first_list["id"], place["id"])
    await _add_place_to_list(client, token, second_list["id"], place["id"])

    rating = await _rate_place(client, token, place["id"], 8, "  private notes  ")

    assert rating["rating"] == 8
    assert rating["notes"] == "private notes"

    place_detail = await client.get(f"/api/v1/places/{place['id']}", headers=auth_header(token))
    assert place_detail.status_code == 200
    place_body = place_detail.json()
    assert place_body["currentUserTried"] is True
    assert place_body["currentUserRating"] == 8
    assert place_body["averageRating"] == 8.0
    assert place_body["ratingCount"] == 1

    first_detail = await client.get(f"/api/v1/lists/{first_list['id']}", headers=auth_header(token))
    second_detail = await client.get(
        f"/api/v1/lists/{second_list['id']}", headers=auth_header(token)
    )
    assert first_detail.json()["items"] == []
    assert second_detail.json()["items"] == []


async def test_tried_place_can_be_readded_without_creating_second_rating(
    client: AsyncClient,
) -> None:
    token = await _token(client, "owner@example.com")
    place = await _create_place(client, token, name="Nara Cafe", place_type="cafe")
    user_list = await _create_list(client, token)
    await _add_place_to_list(client, token, user_list["id"], place["id"])
    await _rate_place(client, token, place["id"], 7)

    readded_item = await _add_place_to_list(client, token, user_list["id"], place["id"])
    profile = await client.get("/api/v1/profile", headers=auth_header(token))

    assert readded_item["place"]["currentUserTried"] is True
    assert readded_item["place"]["currentUserRating"] == 7
    assert profile.status_code == 200
    assert profile.json()["ratingsCreatedCount"] == 1


async def test_rating_upsert_and_patch_update_existing_rating(client: AsyncClient) -> None:
    token = await _token(client, "owner@example.com")
    place = await _create_place(client, token, name="Nara Cafe", place_type="cafe")

    created = await _rate_place(client, token, place["id"], 6, "")
    upserted = await _rate_place(client, token, place["id"], 9, "updated")
    patched = await client.patch(
        f"/api/v1/ratings/{place['id']}",
        json={"rating": 7, "notes": "   "},
        headers=auth_header(token),
    )
    profile = await client.get("/api/v1/profile", headers=auth_header(token))
    place_detail = await client.get(f"/api/v1/places/{place['id']}", headers=auth_header(token))

    assert created["notes"] is None
    assert upserted["id"] == created["id"]
    assert upserted["rating"] == 9
    assert patched.status_code == 200
    assert patched.json()["rating"] == 7
    assert patched.json()["notes"] is None
    assert profile.json()["ratingsCreatedCount"] == 1
    assert place_detail.json()["averageRating"] == 7.0
    assert place_detail.json()["ratingCount"] == 1


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


async def test_public_private_list_visibility_and_guest_denial(client: AsyncClient) -> None:
    owner_token = await _token(client, "owner@example.com")
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
    assert guest_collection.status_code == 401
    assert visibility.status_code == 200
    assert visibility.json()["visibility"] == "public"
    assert public_collection.status_code == 200
    assert collection_data(public_collection)[0]["id"] == owner_list["id"]
    assert public_detail.status_code == 200
    assert public_detail.json()["id"] == owner_list["id"]
    assert private_again.status_code == 200
    assert private_again.json()["visibility"] == "private"
    assert private_again_detail.status_code == 404


async def test_profile_statistics_are_calculated_from_user_data(client: AsyncClient) -> None:
    token = await _token(client, "owner@example.com")
    restaurant = await _create_place(client, token, name="Nara Grill", place_type="restaurant")
    cafe = await _create_place(client, token, name="Nara Cafe", place_type="cafe")
    await _create_list(client, token, name="First")
    await _create_list(client, token, name="Second")
    await _rate_place(client, token, restaurant["id"], 9, "great")
    await _rate_place(client, token, cafe["id"], 8, "calm")

    response = await client.get("/api/v1/profile", headers=auth_header(token))

    assert response.status_code == 200
    body = response.json()
    assert body["listCount"] == 2
    assert body["triedRestaurantCount"] == 1
    assert body["triedCafeCount"] == 1
    assert body["ratingsCreatedCount"] == 2
    assert len(body["userRatings"]) == 2
    assert len(body["triedPlaces"]) == 2


async def test_rating_validation_rejects_out_of_range_values(client: AsyncClient) -> None:
    token = await _token(client, "owner@example.com")
    place = await _create_place(client, token, name="Nara Cafe", place_type="cafe")

    response = await client.post(
        "/api/v1/ratings",
        json={"placeId": place["id"], "rating": 11},
        headers=auth_header(token),
    )

    assert response.status_code == 422
