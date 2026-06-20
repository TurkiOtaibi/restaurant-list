from typing import NoReturn

from fastapi import HTTPException, status


def api_error(status_code: int, code: str, message: str) -> NoReturn:
    raise HTTPException(status_code=status_code, detail={"code": code, "message": message})


def not_found(resource: str = "Resource") -> NoReturn:
    code_resource = resource.upper().replace(" ", "_")
    api_error(status.HTTP_404_NOT_FOUND, f"{code_resource}_NOT_FOUND", f"{resource} not found.")


def unauthorized(
    code: str = "UNAUTHENTICATED", message: str = "Authentication required."
) -> NoReturn:
    api_error(status.HTTP_401_UNAUTHORIZED, code, message)


def conflict(code: str, message: str) -> NoReturn:
    api_error(status.HTTP_409_CONFLICT, code, message)


def internal_error(message: str = "Unexpected server error.") -> NoReturn:
    api_error(status.HTTP_500_INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", message)
