from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

PlaceType = Literal["restaurant", "cafe"]


class PlaceCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    type: PlaceType
    description: str | None = Field(default=None, max_length=1000)


class PlaceResponse(BaseModel):
    id: str
    name: str
    type: PlaceType
    description: str | None
    created_by_user_id: str = Field(serialization_alias="createdByUserId")
    created_at: datetime = Field(serialization_alias="createdAt")
    updated_at: datetime = Field(serialization_alias="updatedAt")
    average_rating: float | None = Field(serialization_alias="averageRating")
    rating_count: int = Field(serialization_alias="ratingCount")
    current_user_rating: int | None = Field(serialization_alias="currentUserRating")
    current_user_tried: bool = Field(serialization_alias="currentUserTried")
    current_user_list_ids: list[str] = Field(serialization_alias="currentUserListIds")
    current_user_list_names: list[str] = Field(serialization_alias="currentUserListNames")
    current_user_list_count: int = Field(serialization_alias="currentUserListCount")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
