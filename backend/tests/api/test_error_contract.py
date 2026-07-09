import json
import logging
import secrets
from typing import Any, cast

from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient

from tests.api.test_auth import auth_header, register_user


def _request_log_records(caplog: Any, path: str) -> list[tuple[Any, dict[str, Any]]]:
    return [
        (record, json.loads(record.message))
        for record in caplog.records
        if record.name == "app.request"
        and isinstance(record.message, str)
        and json.loads(record.message).get("path") == path
    ]


async def test_domain_errors_have_only_the_canonical_envelope(client: AsyncClient) -> None:
    response = await client.get("/api/v1/places/missing-place")

    assert response.status_code == 404
    assert set(response.json()) == {"error"}
    assert response.json()["error"]["code"] == "PLACE_NOT_FOUND"


async def test_validation_errors_are_safe_and_exclude_submitted_values(
    client: AsyncClient,
) -> None:
    canary = secrets.token_hex(16)
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": f"{canary}@",
            "password": f"{canary}" * 10,
        },
    )

    assert response.status_code == 422
    assert canary not in response.text
    body = response.json()
    assert set(body) == {"error"}
    for error in body["error"]["details"]["errors"]:
        assert set(error).issubset({"type", "loc", "msg", "ctx"})
        assert "input" not in error


async def test_unknown_routes_and_unsupported_versions_are_not_found(
    client: AsyncClient,
) -> None:
    for path in ("/does-not-exist", "/api/v2/places"):
        response = await client.get(path)

        assert response.status_code == 404
        assert set(response.json()) == {"error"}
        assert response.json()["error"]["code"] == "NOT_FOUND"
        assert response.headers["X-Request-ID"] == response.json()["error"]["requestId"]


async def test_unhandled_errors_are_safe_and_keep_operational_headers(
    client: AsyncClient,
) -> None:
    marker = f"unhandled-{secrets.token_hex(16)}"
    transport = cast(ASGITransport, client._transport)
    app = cast(FastAPI, transport.app)

    async def raise_error() -> None:
        raise RuntimeError(marker)

    app.add_api_route("/test/unhandled", raise_error)
    async with AsyncClient(
        transport=ASGITransport(app=app, raise_app_exceptions=False),
        base_url="https://testserver",
    ) as test_client:
        response = await test_client.get(
            "/test/unhandled",
            headers={"Origin": "http://localhost:3000"},
        )

    assert response.status_code == 500
    assert marker not in response.text
    assert "Traceback" not in response.text
    assert set(response.json()) == {"error"}
    assert response.json()["error"]["code"] == "INTERNAL_ERROR"
    assert response.headers["X-Request-ID"] == response.json()["error"]["requestId"]
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["X-Frame-Options"] == "DENY"
    assert response.headers["Access-Control-Allow-Origin"] == "http://localhost:3000"


async def test_caller_request_id_is_reused_in_error_response(client: AsyncClient) -> None:
    request_id = f"request-{secrets.token_hex(16)}"
    response = await client.get(
        "/does-not-exist",
        headers={"X-Request-ID": request_id},
    )

    assert response.status_code == 404
    assert response.headers["X-Request-ID"] == request_id
    assert response.json()["error"]["requestId"] == request_id


async def test_request_logs_have_truthful_severity_and_required_fields(
    client: AsyncClient,
    caplog: Any,
) -> None:
    caplog.set_level(logging.INFO, logger="app.request")
    health = await client.get("/health/live")
    missing = await client.get("/does-not-exist")

    expected = {
        "/health/live": (health, "INFO", logging.INFO),
        "/does-not-exist": (missing, "WARNING", logging.WARNING),
    }
    required_fields = {
        "timestamp",
        "level",
        "requestId",
        "userId",
        "path",
        "method",
        "status",
        "durationMs",
        "errorCode",
    }
    for path, (response, level, logger_level) in expected.items():
        records = _request_log_records(caplog, path)
        assert len(records) == 1
        record, payload = records[0]
        assert set(payload) == required_fields
        assert payload["requestId"] == response.headers["X-Request-ID"]
        assert payload["level"] == level
        assert record.levelno == logger_level


async def test_request_logs_use_error_for_unhandled_failures(
    client: AsyncClient,
    caplog: Any,
) -> None:
    caplog.set_level(logging.INFO, logger="app.request")
    transport = cast(ASGITransport, client._transport)
    app = cast(FastAPI, transport.app)

    async def raise_error() -> None:
        raise RuntimeError("server-only failure")

    app.add_api_route("/test/log-unhandled", raise_error)
    async with AsyncClient(
        transport=ASGITransport(app=app, raise_app_exceptions=False),
        base_url="https://testserver",
    ) as test_client:
        response = await test_client.get("/test/log-unhandled")

    assert response.status_code == 500
    records = _request_log_records(caplog, "/test/log-unhandled")
    assert len(records) == 1
    record, payload = records[0]
    assert record.levelno == logging.ERROR
    assert payload["level"] == "ERROR"
    assert payload["status"] == 500


async def test_request_logs_identify_authenticated_and_anonymous_callers(
    client: AsyncClient,
    caplog: Any,
) -> None:
    caplog.set_level(logging.INFO, logger="app.request")
    anonymous = await client.get("/api/v1/places")
    registered = await register_user(client, email="log-user@example.com")
    authenticated = await client.get(
        "/api/v1/places",
        headers=auth_header(registered["accessToken"]),
    )

    anonymous_records = _request_log_records(caplog, "/api/v1/places")
    assert len(anonymous_records) == 2
    anonymous_payload = next(
        payload
        for _, payload in anonymous_records
        if payload["requestId"] == anonymous.headers["X-Request-ID"]
    )
    authenticated_payload = next(
        payload
        for _, payload in anonymous_records
        if payload["requestId"] == authenticated.headers["X-Request-ID"]
    )
    assert anonymous_payload["userId"] is None
    assert authenticated_payload["userId"] == registered["user"]["id"]
