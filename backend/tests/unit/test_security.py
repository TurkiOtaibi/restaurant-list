import pytest
from fastapi import HTTPException

from app.core.security import create_access_token, create_refresh_token, decode_token


def test_access_token_decodes_subject() -> None:
    token = create_access_token("user-1")

    payload = decode_token(token, token_type="access")

    assert payload["sub"] == "user-1"
    assert payload["type"] == "access"


def test_refresh_token_decodes_subject() -> None:
    token = create_refresh_token("user-1")

    payload = decode_token(token, token_type="refresh")

    assert payload["sub"] == "user-1"
    assert payload["type"] == "refresh"


def test_wrong_token_type_is_rejected() -> None:
    token = create_access_token("user-1")

    with pytest.raises(HTTPException) as exc_info:
        decode_token(token, token_type="refresh")

    assert exc_info.value.status_code == 401
