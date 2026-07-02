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


class ProfileFavoritePlaceResponse(BaseModel):
    id: str
    name: str
    type: str
    subtype: str | None
    rating: float


class ProfileResponse(BaseModel):
    display_name: str = Field(serialization_alias="displayName")
    bio: str | None
    average_rating: float | None = Field(serialization_alias="averageRating")
    lists_count: int = Field(serialization_alias="listsCount")
    rated_restaurant_count: int = Field(serialization_alias="ratedRestaurantCount")
    rated_cafe_count: int = Field(serialization_alias="ratedCafeCount")
    rated_ice_cream_count: int = Field(serialization_alias="ratedIceCreamCount")
    ratings_count: int = Field(serialization_alias="ratingsCount")
    favorite_places: list[ProfileFavoritePlaceResponse] = Field(
        serialization_alias="favoritePlaces"
    )
    user_ratings: list[ProfileRatingResponse] = Field(serialization_alias="userRatings")
    public_lists_summary: list[ProfilePublicListSummaryResponse] = Field(
        serialization_alias="publicListsSummary"
    )
    # Backward-compatible aliases for existing regression tests during the
    # contract transition. The frontend consumes the approved fields above.
    list_count: int = Field(serialization_alias="listCount")
    ratings_created_count: int = Field(serialization_alias="ratingsCreatedCount")

    model_config = ConfigDict(populate_by_name=True)


class ProfileUpdateRequest(BaseModel):
    display_name: str | None = Field(default=None, alias="displayName")
    bio: str | None = None

    model_config = ConfigDict(populate_by_name=True)


class ProfileFavoritesUpdateRequest(BaseModel):
    place_ids: list[str] = Field(alias="placeIds")

    model_config = ConfigDict(populate_by_name=True)
