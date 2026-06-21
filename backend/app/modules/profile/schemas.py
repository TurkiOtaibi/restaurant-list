from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.modules.places.schemas import PlaceResponse


class ProfileRatingResponse(BaseModel):
    id: str
    place: PlaceResponse
    rating: float
    notes: str | None
    created_at: datetime = Field(serialization_alias="createdAt")
    updated_at: datetime = Field(serialization_alias="updatedAt")

    model_config = ConfigDict(populate_by_name=True)


class ProfileResponse(BaseModel):
    list_count: int = Field(serialization_alias="listCount")
    tried_restaurant_count: int = Field(serialization_alias="triedRestaurantCount")
    tried_cafe_count: int = Field(serialization_alias="triedCafeCount")
    ratings_created_count: int = Field(serialization_alias="ratingsCreatedCount")
    user_ratings: list[ProfileRatingResponse] = Field(serialization_alias="userRatings")
    tried_places: list[PlaceResponse] = Field(serialization_alias="triedPlaces")

    model_config = ConfigDict(populate_by_name=True)
