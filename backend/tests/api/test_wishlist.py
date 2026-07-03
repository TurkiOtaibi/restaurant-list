import asyncio
from typing import Any, cast

from httpx import AsyncClient

from tests.api.test_auth import auth_header, register_user
from tests.api.test_places_and_lists import _create_list, _create_place, collection_data


async def _token(client: AsyncClient, email: str) -> str:
    return str((await register_user(client, email=email))["accessToken"])


async def _add_wishlist_place(client: AsyncClient, token: str, place_id: str) -> dict[str, Any]:
    response = await client.post(
        "/api/v1/wishlist/places",
        json={"placeId": place_id},
        headers=auth_header(token),
    )
    assert response.status_code == 200
    return cast(dict[str, Any], response.json())


async def test_wishlist_is_created_lazily_once_and_adds_idempotently(
    client: AsyncClient,
) -> None:
    token = await _token(client, "wishlist@example.com")
    place = await _create_place(client, token, name="Wishlist Burger", place_type="restaurant")

    before_profile = await client.get("/api/v1/profile", headers=auth_header(token))
    first, second = await asyncio.gather(
        client.post(
            "/api/v1/wishlist/places",
            json={"placeId": place["id"]},
            headers=auth_header(token),
        ),
        client.post(
            "/api/v1/wishlist/places",
            json={"placeId": place["id"]},
            headers=auth_header(token),
        ),
    )
    lists = await client.get("/api/v1/lists", headers=auth_header(token))
    after_profile = await client.get("/api/v1/profile", headers=auth_header(token))

    assert before_profile.status_code == 200
    assert before_profile.json()["wishlist"] is None
    assert first.status_code == 200
    assert second.status_code == 200
    assert first.json()["id"] == second.json()["id"]
    assert first.json()["name"] == "رغباتي"
    assert first.json()["visibility"] == "private"
    assert first.json()["isSystem"] is True
    assert len(first.json()["items"]) == 1
    assert collection_data(lists) == [
        {
            "id": first.json()["id"],
            "name": "رغباتي",
            "visibility": "private",
            "isSystem": True,
            "placeCount": 1,
            "createdAt": first.json()["createdAt"],
            "updatedAt": first.json()["updatedAt"],
        }
    ]
    assert after_profile.json()["wishlist"] == {"id": first.json()["id"], "placeCount": 1}


async def test_wishlist_remove_and_missing_item_errors(client: AsyncClient) -> None:
    token = await _token(client, "wishlist-remove@example.com")
    place = await _create_place(client, token, name="Remove Burger", place_type="restaurant")
    wishlist = await _add_wishlist_place(client, token, place["id"])

    removed = await client.delete(
        f"/api/v1/wishlist/places/{place['id']}",
        headers=auth_header(token),
    )
    duplicate_remove = await client.delete(
        f"/api/v1/wishlist/places/{place['id']}",
        headers=auth_header(token),
    )
    missing_wishlist = await client.delete(
        "/api/v1/wishlist/places/missing-place",
        headers=auth_header(await _token(client, "wishlist-empty-remove@example.com")),
    )

    assert wishlist["placeCount"] == 1
    assert removed.status_code == 200
    assert removed.json()["items"] == []
    assert removed.json()["placeCount"] == 0
    assert duplicate_remove.status_code == 404
    assert missing_wishlist.status_code == 404


async def test_wishlist_validation_and_authentication(client: AsyncClient) -> None:
    token = await _token(client, "wishlist-validation@example.com")

    unauthenticated = await client.post("/api/v1/wishlist/places", json={"placeId": "x"})
    unknown_place = await client.post(
        "/api/v1/wishlist/places",
        json={"placeId": "missing-place"},
        headers=auth_header(token),
    )

    assert unauthenticated.status_code == 401
    assert unauthenticated.json()["error"]["code"] == "UNAUTHENTICATED"
    assert unknown_place.status_code == 404
    assert unknown_place.json()["error"]["code"] == "PLACE_NOT_FOUND"


async def test_system_list_cannot_be_renamed_or_deleted_but_visibility_can_change(
    client: AsyncClient,
) -> None:
    token = await _token(client, "wishlist-protected@example.com")
    place = await _create_place(client, token, name="Protected Burger", place_type="restaurant")
    wishlist = await _add_wishlist_place(client, token, place["id"])

    rename = await client.patch(
        f"/api/v1/lists/{wishlist['id']}",
        json={"name": "Renamed"},
        headers=auth_header(token),
    )
    visibility = await client.patch(
        f"/api/v1/lists/{wishlist['id']}/visibility",
        json={"visibility": "public"},
        headers=auth_header(token),
    )
    public_detail = await client.get(
        f"/api/v1/lists/public/{wishlist['id']}",
        headers=auth_header(token),
    )
    delete = await client.delete(
        f"/api/v1/lists/{wishlist['id']}",
        headers=auth_header(token),
    )

    assert rename.status_code == 422
    assert rename.json()["error"]["code"] == "SYSTEM_LIST_PROTECTED"
    assert visibility.status_code == 200
    assert visibility.json()["data"]["visibility"] == "public"
    assert visibility.json()["data"]["isSystem"] is True
    assert public_detail.status_code == 200
    assert public_detail.json()["isSystem"] is True
    assert delete.status_code == 422
    assert delete.json()["error"]["code"] == "SYSTEM_LIST_PROTECTED"


async def test_user_created_lists_cannot_force_system_flag_and_remain_mutable(
    client: AsyncClient,
) -> None:
    token = await _token(client, "normal-list@example.com")

    forced = await client.post(
        "/api/v1/lists",
        json={"name": "Normal", "visibility": "private", "isSystem": True},
        headers=auth_header(token),
    )
    renamed = await client.patch(
        f"/api/v1/lists/{forced.json()['id']}",
        json={"name": "Renamed"},
        headers=auth_header(token),
    )
    deleted = await client.delete(
        f"/api/v1/lists/{forced.json()['id']}",
        headers=auth_header(token),
    )
    normal = await _create_list(client, token, name="Another normal")

    assert forced.status_code == 201
    assert forced.json()["isSystem"] is False
    assert renamed.status_code == 200
    assert renamed.json()["name"] == "Renamed"
    assert renamed.json()["isSystem"] is False
    assert deleted.status_code == 200
    assert normal["isSystem"] is False


async def test_place_membership_indicators_include_wishlist(client: AsyncClient) -> None:
    token = await _token(client, "wishlist-membership@example.com")
    place = await _create_place(client, token, name="Membership Burger", place_type="restaurant")
    wishlist = await _add_wishlist_place(client, token, place["id"])

    detail = await client.get(f"/api/v1/places/{place['id']}", headers=auth_header(token))

    assert detail.status_code == 200
    assert wishlist["id"] in detail.json()["currentUserListIds"]
    assert "رغباتي" in detail.json()["currentUserListNames"]
