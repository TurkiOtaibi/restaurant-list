from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

# bcrypt silently truncates input beyond 72 bytes, so reject longer secrets
# rather than hash a truncated password.
MAX_PASSWORD_BYTES = 72


class UserResponse(BaseModel):
    id: str
    email: EmailStr

    model_config = ConfigDict(from_attributes=True)


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def reject_overlong_password(cls, value: str) -> str:
        if len(value.encode("utf-8")) > MAX_PASSWORD_BYTES:
            raise ValueError(f"Password must not exceed {MAX_PASSWORD_BYTES} bytes.")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class TokenPairResponse(BaseModel):
    user: UserResponse
    access_token: str = Field(serialization_alias="accessToken")

    model_config = ConfigDict(populate_by_name=True)


class RefreshResponse(BaseModel):
    access_token: str = Field(serialization_alias="accessToken")

    model_config = ConfigDict(populate_by_name=True)
