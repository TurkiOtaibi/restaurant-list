import asyncio
from typing import Any, cast

from httpx import AsyncClient, Response

from tests.api.test_auth import auth_header, register_user


def collection_data(response: Response) -> list[dict[str, Any]]:
    body = response.json()
    return cast(list[dict[str, Any]], body["data"])


async def _token(client: AsyncClient, email: str = "user@example.com") -> str:
    return str((await register_user(client, email=email))["accessToken"])


async def _create_place(
    client: AsyncClient,
    token: str,
    *,
    name: str = "Nara Cafe",
    place_type: str = "cafe",
    subtype: str | None = None,
) -> dict[str, Any]:
    if subtype is None and place_type == "cafe":
        subtype = "coffee"
    elif subtype is None and place_type == "restaurant":
        subtype = "other"

    payload: dict[str, Any] = {"name": name, "type": place_type}
    if subtype is not None:
        payload["subtype"] = subtype

    response = await client.post(
        "/api/v1/places",
        json=payload,
        headers=auth_header(token),
    )
    assert response.status_code == 201
    return cast(dict[str, Any], response.json())


async def _create_list(
    client: AsyncClient,
    token: str,
    *,
    name: str = "Weekend picks",
) -> dict[str, Any]:
    response = await client.post(
        "/api/v1/lists",
        json={"name": name},
        headers=auth_header(token),
    )
    assert response.status_code == 201
    return cast(dict[str, Any], response.json())


async def test_places_require_authentication(client: AsyncClient) -> None:
    response = await client.get("/api/v1/places")

    assert response.status_code == 401
    assert response.json()["detail"]["code"] == "UNAUTHENTICATED"


async def test_create_place_and_reject_duplicate_name(client: AsyncClient) -> None:
    token = await _token(client)

    place = await _create_place(client, token, name="  Nara   Cafe  ")

    assert place["name"] == "Nara Cafe"
    assert place["type"] == "cafe"
    assert place["subtype"] == "coffee"

    duplicate = await client.post(
        "/api/v1/places",
        json={"name": "nara cafe", "type": "restaurant", "subtype": "burger"},
        headers=auth_header(token),
    )

    assert duplicate.status_code == 409
    assert duplicate.json()["detail"]["code"] == "DUPLICATE_PLACE_NAME"


async def test_concurrent_normalized_duplicate_place_creation(client: AsyncClient) -> None:
    token = await _token(client)

    first, second = await asyncio.gather(
        client.post(
            "/api/v1/places",
            json={"name": "Nara Cafe", "type": "cafe", "subtype": "coffee"},
            headers=auth_header(token),
        ),
        client.post(
            "/api/v1/places",
            json={"name": "  nara   cafe  ", "type": "restaurant", "subtype": "burger"},
            headers=auth_header(token),
        ),
    )

    statuses = sorted([first.status_code, second.status_code])
    assert statuses == [201, 409]
    rejected = first if first.status_code == 409 else second
    assert rejected.json()["detail"]["code"] == "DUPLICATE_PLACE_NAME"


async def test_places_search_by_name_only(client: AsyncClient) -> None:
    token = await _token(client)
    await _create_place(client, token, name="Nara Cafe", place_type="cafe")
    await _create_place(client, token, name="بيت الورد", place_type="restaurant")
    await _create_place(client, token, name="Quiet Table", place_type="restaurant")

    english_match = await client.get("/api/v1/places?q=nara", headers=auth_header(token))
    assert english_match.status_code == 200
    assert {place["name"] for place in collection_data(english_match)} == {"Nara Cafe"}

    arabic_match = await client.get("/api/v1/places?q=الورد", headers=auth_header(token))
    assert arabic_match.status_code == 200
    assert {place["name"] for place in collection_data(arabic_match)} == {"بيت الورد"}

    type_query = await client.get("/api/v1/places?q=restaurant", headers=auth_header(token))
    assert type_query.status_code == 200
    assert collection_data(type_query) == []

    blank_query = await client.get("/api/v1/places?q=%20%20", headers=auth_header(token))
    assert blank_query.status_code == 200
    assert {place["name"] for place in collection_data(blank_query)} == {
        "Nara Cafe",
        "بيت الورد",
        "Quiet Table",
    }


async def test_places_listing_is_bounded_and_offset_paginated(client: AsyncClient) -> None:
    token = await _token(client)
    await _create_place(client, token, name="First Table", place_type="restaurant")
    await _create_place(client, token, name="Second Table", place_type="restaurant")
    await _create_place(client, token, name="Third Table", place_type="restaurant")

    first_page = await client.get("/api/v1/places?limit=2", headers=auth_header(token))
    second_page = await client.get("/api/v1/places?limit=2&offset=2", headers=auth_header(token))
    invalid_limit = await client.get("/api/v1/places?limit=101", headers=auth_header(token))

    assert first_page.status_code == 200
    assert len(collection_data(first_page)) == 2
    assert first_page.json()["meta"] == {
        "limit": 2,
        "offset": 0,
        "total": 3,
        "sort": "created_at_desc",
    }
    assert second_page.status_code == 200
    assert len(collection_data(second_page)) == 1
    assert second_page.json()["meta"]["offset"] == 2
    assert invalid_limit.status_code == 422


async def test_create_list_and_add_place_to_list(client: AsyncClient) -> None:
    token = await _token(client)
    place = await _create_place(client, token)
    user_list = await _create_list(client, token)

    response = await client.post(
        f"/api/v1/lists/{user_list['id']}/items",
        json={"placeId": place["id"]},
        headers=auth_header(token),
    )

    assert response.status_code == 201
    assert response.json()["place"]["id"] == place["id"]

    detail = await client.get(f"/api/v1/lists/{user_list['id']}", headers=auth_header(token))
    assert detail.status_code == 200
    assert detail.json()["items"][0]["place"]["name"] == "Nara Cafe"


async def test_duplicate_list_item_returns_idempotent_success(client: AsyncClient) -> None:
    token = await _token(client)
    place = await _create_place(client, token)
    user_list = await _create_list(client, token)

    first = await client.post(
        f"/api/v1/lists/{user_list['id']}/items",
        json={"placeId": place["id"]},
        headers=auth_header(token),
    )
    duplicate = await client.post(
        f"/api/v1/lists/{user_list['id']}/items",
        json={"placeId": place["id"]},
        headers=auth_header(token),
    )
    detail = await client.get(f"/api/v1/lists/{user_list['id']}", headers=auth_header(token))

    assert first.status_code == 201
    assert duplicate.status_code == 200
    assert duplicate.json()["place"]["id"] == place["id"]
    assert len(detail.json()["items"]) == 1


async def test_users_cannot_access_other_users_lists(client: AsyncClient) -> None:
    owner_token = await _token(client, email="owner@example.com")
    other_token = await _token(client, email="other@example.com")
    user_list = await _create_list(client, owner_token)

    read_response = await client.get(
        f"/api/v1/lists/{user_list['id']}",
        headers=auth_header(other_token),
    )
    patch_response = await client.patch(
        f"/api/v1/lists/{user_list['id']}",
        json={"name": "Renamed"},
        headers=auth_header(other_token),
    )
    delete_response = await client.delete(
        f"/api/v1/lists/{user_list['id']}",
        headers=auth_header(other_token),
    )

    assert read_response.status_code == 404
    assert patch_response.status_code == 404
    assert delete_response.status_code == 404


async def test_lists_collection_uses_envelope_and_summary_counts(client: AsyncClient) -> None:
    token = await _token(client)
    place = await _create_place(client, token)
    user_list = await _create_list(client, token)
    await client.post(
        f"/api/v1/lists/{user_list['id']}/items",
        json={"placeId": place["id"]},
        headers=auth_header(token),
    )

    response = await client.get("/api/v1/lists?limit=10", headers=auth_header(token))

    assert response.status_code == 200
    assert response.json()["meta"] == {
        "limit": 10,
        "offset": 0,
        "total": 1,
        "sort": "created_at_desc",
    }
    assert collection_data(response)[0]["placeCount"] == 1


async def test_delete_place_from_list(client: AsyncClient) -> None:
    token = await _token(client)
    place = await _create_place(client, token)
    user_list = await _create_list(client, token)

    add_response = await client.post(
        f"/api/v1/lists/{user_list['id']}/items",
        json={"placeId": place["id"]},
        headers=auth_header(token),
    )
    delete_response = await client.delete(
        f"/api/v1/lists/{user_list['id']}/items/{place['id']}",
        headers=auth_header(token),
    )

    assert add_response.status_code == 201
    assert delete_response.status_code == 200
    assert delete_response.json() == {"deleted": True}


async def test_place_taxonomy_validation_and_filtering(client: AsyncClient) -> None:
    token = await _token(client)
    restaurant = await _create_place(
        client,
        token,
        name="Burger House",
        place_type="restaurant",
        subtype="burger",
    )
    cafe = await _create_place(client, token, name="Tea Room", place_type="cafe", subtype="tea")
    ice_cream = await _create_place(
        client,
        token,
        name="Cold Scoop",
        place_type="ice_cream",
        subtype=None,
    )

    missing_restaurant_subtype = await client.post(
        "/api/v1/places",
        json={"name": "No Subtype Grill", "type": "restaurant"},
        headers=auth_header(token),
    )
    missing_cafe_subtype = await client.post(
        "/api/v1/places",
        json={"name": "No Subtype Cafe", "type": "cafe"},
        headers=auth_header(token),
    )
    invalid_ice_cream_subtype = await client.post(
        "/api/v1/places",
        json={"name": "Subtype Ice Cream", "type": "ice_cream", "subtype": "coffee"},
        headers=auth_header(token),
    )
    restaurant_filter = await client.get(
        "/api/v1/places?type=restaurant",
        headers=auth_header(token),
    )
    ice_cream_filter = await client.get(
        "/api/v1/places?type=ice_cream",
        headers=auth_header(token),
    )

    assert restaurant["subtype"] == "burger"
    assert cafe["subtype"] == "tea"
    assert ice_cream["subtype"] is None
    assert missing_restaurant_subtype.status_code == 422
    assert missing_cafe_subtype.status_code == 422
    assert invalid_ice_cream_subtype.status_code == 422
    assert {place["id"] for place in collection_data(restaurant_filter)} == {restaurant["id"]}
    assert {place["id"] for place in collection_data(ice_cream_filter)} == {ice_cream["id"]}
