from httpx import AsyncClient


async def test_profile_favorites_put_preflight_is_allowed(client: AsyncClient) -> None:
    response = await client.options(
        "/api/v1/profile/favorites",
        headers={
            "Access-Control-Request-Headers": "authorization,content-type",
            "Access-Control-Request-Method": "PUT",
            "Origin": "http://localhost:3000",
        },
    )

    assert response.status_code == 200
    assert "PUT" in response.headers["access-control-allow-methods"]
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"


async def test_place_image_put_and_delete_preflight_are_allowed(client: AsyncClient) -> None:
    for method in ("PUT", "DELETE"):
        response = await client.options(
            "/api/v1/places/place-id/image",
            headers={
                "Access-Control-Request-Headers": "authorization,content-type",
                "Access-Control-Request-Method": method,
                "Origin": "http://localhost:3000",
            },
        )

        assert response.status_code == 200
        assert method in response.headers["access-control-allow-methods"]
        assert response.headers["access-control-allow-origin"] == "http://localhost:3000"


async def test_wishlist_post_and_delete_preflight_are_allowed(client: AsyncClient) -> None:
    routes = [
        ("POST", "/api/v1/wishlist/places"),
        ("DELETE", "/api/v1/wishlist/places/place-id"),
    ]

    for method, route in routes:
        response = await client.options(
            route,
            headers={
                "Access-Control-Request-Headers": "authorization,content-type",
                "Access-Control-Request-Method": method,
                "Origin": "http://localhost:3000",
            },
        )

        assert response.status_code == 200
        assert method in response.headers["access-control-allow-methods"]
        assert response.headers["access-control-allow-origin"] == "http://localhost:3000"
