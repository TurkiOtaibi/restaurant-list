import json
import logging
from collections.abc import Awaitable, Callable, Sequence
from datetime import UTC, datetime
from time import perf_counter
from typing import Any
from uuid import uuid4

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from app.api.auth import router as auth_router
from app.api.health import router as health_router
from app.api.lists import router as lists_router
from app.api.places import router as places_router
from app.api.profile import router as profile_router
from app.api.ratings import router as ratings_router
from app.api.wishlist import router as wishlist_router
from app.core.config import get_settings

request_logger = logging.getLogger("app.request")
exception_logger = logging.getLogger("app.exception")


def serializable_validation_errors(errors: Sequence[Any]) -> list[dict[str, Any]]:
    normalized_errors: list[dict[str, Any]] = []
    for error in errors:
        if not isinstance(error, dict):
            normalized_errors.append({"type": "validation_error", "msg": "Invalid value."})
            continue

        normalized_error: dict[str, Any] = {}
        for key in ("type", "loc", "msg"):
            value = error.get(key)
            if key == "loc" and isinstance(value, (list, tuple)):
                normalized_error[key] = [str(item) for item in value]
            elif isinstance(value, (str, int, float, bool)) or value is None:
                normalized_error[key] = value

        ctx = error.get("ctx")
        if isinstance(ctx, dict):
            normalized_error["ctx"] = {
                str(key): str(value)
                for key, value in ctx.items()
                if isinstance(value, (str, int, float, bool)) or value is None
            }
        normalized_errors.append(normalized_error)
    return normalized_errors


def build_error_content(
    request: Request,
    code: str,
    message: str,
    details: dict[str, Any] | None = None,
) -> dict[str, Any]:
    request_id = (
        getattr(request.state, "request_id", None)
        or request.headers.get("X-Request-ID")
        or str(uuid4())
    )
    request.state.error_code = code
    error: dict[str, Any] = {
        "code": code,
        "message": message,
        "requestId": request_id,
    }
    if details is not None:
        error["details"] = details

    return {"error": error}


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.app_name,
        version="0.1.0",
        docs_url="/docs" if settings.enable_api_docs else None,
        redoc_url="/redoc" if settings.enable_api_docs else None,
    )

    @app.middleware("http")
    async def add_operational_headers(
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        request_id = request.headers.get("X-Request-ID") or str(uuid4())
        request.state.request_id = request_id
        started_at = perf_counter()
        try:
            response = await call_next(request)
        except Exception as exc:
            response = await unhandled_exception_handler(request, exc)
        duration_ms = round((perf_counter() - started_at) * 1000, 2)
        response.headers["X-Request-ID"] = request_id
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        response.headers.setdefault(
            "Strict-Transport-Security",
            "max-age=63072000; includeSubDomains; preload",
        )
        response.headers.setdefault(
            "Content-Security-Policy",
            "default-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
        )
        if response.status_code >= 500:
            log_method = request_logger.error
            level = "ERROR"
        elif response.status_code >= 400:
            log_method = request_logger.warning
            level = "WARNING"
        else:
            log_method = request_logger.info
            level = "INFO"

        log_method(
            json.dumps(
                {
                    "timestamp": datetime.now(UTC).isoformat(),
                    "level": level,
                    "requestId": request_id,
                    "userId": getattr(request.state, "user_id", None),
                    "path": request.url.path,
                    "method": request.method,
                    "status": response.status_code,
                    "durationMs": duration_ms,
                    "errorCode": getattr(request.state, "error_code", None),
                },
                ensure_ascii=False,
                separators=(",", ":"),
            )
        )
        return response

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        if isinstance(exc.detail, dict) and {"code", "message"}.issubset(exc.detail):
            code = str(exc.detail["code"])
            message = str(exc.detail["message"])
        elif exc.status_code == 404:
            code = "NOT_FOUND"
            message = "Resource not found."
        else:
            code = "HTTP_ERROR"
            message = "Request could not be completed."
        return JSONResponse(
            status_code=exc.status_code,
            content=build_error_content(request, code, message),
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        exception_logger.exception(
            "Unhandled exception requestId=%s",
            getattr(request.state, "request_id", request.headers.get("X-Request-ID")),
        )
        return JSONResponse(
            status_code=500,
            content=build_error_content(
                request,
                "INTERNAL_ERROR",
                "An unexpected error occurred.",
            ),
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request,
        exc: RequestValidationError,
    ) -> JSONResponse:
        return JSONResponse(
            status_code=422,
            content=build_error_content(
                request,
                "VALIDATION_ERROR",
                "Request validation failed.",
                {"errors": serializable_validation_errors(exc.errors())},
            ),
        )

    # Register CORS last so it becomes the outermost middleware and answers
    # preflight requests before the operational-headers middleware runs.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_origin_regex=settings.cors_allow_origin_regex,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
    )

    app.include_router(health_router)
    app.include_router(auth_router, prefix="/api/v1")
    app.include_router(places_router, prefix="/api/v1")
    app.include_router(lists_router, prefix="/api/v1")
    app.include_router(ratings_router, prefix="/api/v1")
    app.include_router(profile_router, prefix="/api/v1")
    app.include_router(wishlist_router, prefix="/api/v1")

    return app


app = create_app()
