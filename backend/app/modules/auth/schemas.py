from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserResponse(BaseModel):
    id: str
    email: EmailStr

    model_config = ConfigDict(from_attributes=True)


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


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
