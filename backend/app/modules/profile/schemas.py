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


class ProfilePublicListSummaryResponse(BaseModel):
    id: str
    name: str
    owner_display_name: str = Field(serialization_alias="ownerDisplayName")
    place_count: int = Field(serialization_alias="placeCount")
    created_at: datetime = Field(serialization_alias="createdAt")
    updated_at: datetime = Field(serialization_alias="updatedAt")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class ProfileResponse(BaseModel):
    lists_count: int = Field(serialization_alias="listsCount")
    tried_restaurant_count: int = Field(serialization_alias="triedRestaurantCount")
    tried_cafe_count: int = Field(serialization_alias="triedCafeCount")
    tried_ice_cream_count: int = Field(serialization_alias="triedIceCreamCount")
    ratings_count: int = Field(serialization_alias="ratingsCount")
    user_ratings: list[ProfileRatingResponse] = Field(serialization_alias="userRatings")
    public_lists_summary: list[ProfilePublicListSummaryResponse] = Field(
        serialization_alias="publicListsSummary"
    )
    # Backward-compatible aliases for existing regression tests during the
    # contract transition. The frontend consumes the approved fields above.
    list_count: int = Field(serialization_alias="listCount")
    ratings_created_count: int = Field(serialization_alias="ratingsCreatedCount")

    model_config = ConfigDict(populate_by_name=True)
