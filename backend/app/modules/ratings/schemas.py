from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class RatingCreateRequest(BaseModel):
    place_id: str = Field(alias="placeId", min_length=1)
    rating: int = Field(ge=1, le=10)
    notes: str | None = None

    model_config = ConfigDict(populate_by_name=True)


class RatingUpdateRequest(BaseModel):
    rating: int = Field(ge=1, le=10)
    notes: str | None = None


class RatingResponse(BaseModel):
    id: str
    user_id: str = Field(serialization_alias="userId")
    place_id: str = Field(serialization_alias="placeId")
    rating: int
    notes: str | None
    created_at: datetime = Field(serialization_alias="createdAt")
    updated_at: datetime = Field(serialization_alias="updatedAt")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
