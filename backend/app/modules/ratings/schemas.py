from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class RatingCreateRequest(BaseModel):
    place_id: str = Field(alias="placeId", min_length=1)
    rating: float = Field(ge=1, le=10, multiple_of=0.5)
    notes: str | None = Field(default=None, max_length=1000)

    model_config = ConfigDict(populate_by_name=True)


class RatingUpdateRequest(BaseModel):
    rating: float = Field(ge=1, le=10, multiple_of=0.5)
    notes: str | None = Field(default=None, max_length=1000)


class RatingResponse(BaseModel):
    id: str
    user_id: str = Field(serialization_alias="userId")
    place_id: str = Field(serialization_alias="placeId")
    rating: float
    notes: str | None
    created_at: datetime = Field(serialization_alias="createdAt")
    updated_at: datetime = Field(serialization_alias="updatedAt")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
