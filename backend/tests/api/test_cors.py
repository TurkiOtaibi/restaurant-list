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
