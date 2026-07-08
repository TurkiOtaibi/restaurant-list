from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import unauthorized
from app.core.security import decode_token
from app.db.session import get_db
from app.modules.auth.models import User

bearer_scheme = HTTPBearer(auto_error=False)
BearerCredentials = Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)]
DatabaseSession = Annotated[AsyncSession, Depends(get_db)]


async def get_current_user(
    credentials: BearerCredentials,
    db: DatabaseSession,
) -> User:
    if credentials is None:
        unauthorized()

    payload = decode_token(credentials.credentials, token_type="access")
    user_id = payload.get("sub")
    if not isinstance(user_id, str):
        unauthorized("INVALID_TOKEN", "Token subject is invalid.")

    user = await db.get(User, user_id)
    if user is None:
        unauthorized("USER_NOT_FOUND", "User no longer exists.")

    return user


async def get_optional_current_user(
    credentials: BearerCredentials,
    db: DatabaseSession,
) -> User | None:
    if credentials is None:
        return None

    payload = decode_token(credentials.credentials, token_type="access")
    user_id = payload.get("sub")
    if not isinstance(user_id, str):
        unauthorized("INVALID_TOKEN", "Token subject is invalid.")

    user = await db.get(User, user_id)
    if user is None:
        unauthorized("USER_NOT_FOUND", "User no longer exists.")

    return user
