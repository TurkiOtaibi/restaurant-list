from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.rate_limit import enforce_auth_rate_limit
from app.core.schemas import LogoutResponse
from app.db.session import get_db
from app.modules.auth.schemas import (
    LoginRequest,
    RefreshResponse,
    RegisterRequest,
    TokenPairResponse,
)
from app.modules.auth.services import (
    login_user_account,
    register_user_account,
    revoke_refresh_token,
    rotate_refresh_token,
)

router = APIRouter(prefix="/auth", tags=["auth"])
DatabaseSession = Annotated[AsyncSession, Depends(get_db)]
RefreshCookie = Annotated[str | None, Cookie(alias=get_settings().refresh_cookie_name)]
RateLimit = Annotated[None, Depends(enforce_auth_rate_limit)]


@router.post(
    "/register",
    response_model=TokenPairResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(
    payload: RegisterRequest,
    db: DatabaseSession,
    response: Response,
    _: RateLimit,
) -> TokenPairResponse:
    return await register_user_account(db, payload=payload, response=response)


@router.post("/login", response_model=TokenPairResponse)
async def login(
    payload: LoginRequest,
    db: DatabaseSession,
    response: Response,
    _: RateLimit,
) -> TokenPairResponse:
    return await login_user_account(db, payload=payload, response=response)


@router.post("/refresh", response_model=RefreshResponse)
async def refresh_token(
    db: DatabaseSession,
    response: Response,
    _: RateLimit,
    refresh_token_cookie: RefreshCookie = None,
) -> RefreshResponse:
    return await rotate_refresh_token(db, refresh_token=refresh_token_cookie, response=response)


@router.post("/logout", response_model=LogoutResponse)
async def logout(
    db: DatabaseSession,
    response: Response,
    _: RateLimit,
    refresh_token_cookie: RefreshCookie = None,
) -> LogoutResponse:
    await revoke_refresh_token(db, refresh_token=refresh_token_cookie, response=response)
    return LogoutResponse()
