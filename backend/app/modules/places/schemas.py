from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

PlaceType = Literal["restaurant", "cafe", "ice_cream"]
RestaurantSubtype = Literal[
    "burger",
    "italian",
    "american",
    "steak",
    "grill",
    "shawarma",
    "saudi",
    "gulf",
    "indian",
    "asian",
    "seafood",
    "breakfast",
    "healthy",
    "other",
]
CafeSubtype = Literal["coffee", "tea"]
PlaceSubtype = RestaurantSubtype | CafeSubtype

RESTAURANT_SUBTYPES: set[str] = {
    "burger",
    "italian",
    "american",
    "steak",
    "grill",
    "shawarma",
    "saudi",
    "gulf",
    "indian",
    "asian",
    "seafood",
    "breakfast",
    "healthy",
    "other",
}
CAFE_SUBTYPES: set[str] = {"coffee", "tea"}


class PlaceCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    type: PlaceType
    subtype: PlaceSubtype | None = None
    description: str | None = Field(default=None, max_length=1000)

    @model_validator(mode="after")
    def validate_subtype_for_type(self) -> "PlaceCreateRequest":
        if self.type == "restaurant" and self.subtype not in RESTAURANT_SUBTYPES:
            raise ValueError("Restaurant subtype is required and must be valid.")

        if self.type == "cafe" and self.subtype not in CAFE_SUBTYPES:
            raise ValueError("Cafe subtype is required and must be valid.")

        if self.type == "ice_cream" and self.subtype is not None:
            raise ValueError("Ice cream places must not include a subtype.")

        return self


class PlaceResponse(BaseModel):
    id: str
    name: str
    type: PlaceType
    subtype: PlaceSubtype | None
    description: str | None
    image_url: str | None = Field(serialization_alias="imageUrl")
    created_by_user_id: str = Field(serialization_alias="createdByUserId")
    created_at: datetime = Field(serialization_alias="createdAt")
    updated_at: datetime = Field(serialization_alias="updatedAt")
    average_rating: float | None = Field(serialization_alias="averageRating")
    rating_count: int = Field(serialization_alias="ratingCount")
    current_user_rating: float | None = Field(serialization_alias="currentUserRating")
    current_user_list_ids: list[str] = Field(serialization_alias="currentUserListIds")
    current_user_list_names: list[str] = Field(serialization_alias="currentUserListNames")
    current_user_list_count: int = Field(serialization_alias="currentUserListCount")
    current_user_is_creator: bool = Field(serialization_alias="currentUserIsCreator")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class PlaceCollectionResponse(BaseModel):
    id: str
    name: str
    type: PlaceType
    subtype: PlaceSubtype | None
    description: str | None
    image_url: str | None = Field(serialization_alias="imageUrl")
    created_at: datetime = Field(serialization_alias="createdAt")
    updated_at: datetime = Field(serialization_alias="updatedAt")
    average_rating: float | None = Field(serialization_alias="averageRating")
    rating_count: int = Field(serialization_alias="ratingCount")
    current_user_rating: float | None = Field(serialization_alias="currentUserRating")
    current_user_list_count: int = Field(serialization_alias="currentUserListCount")
    current_user_is_creator: bool = Field(serialization_alias="currentUserIsCreator")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class PublicPlaceDetailResponse(PlaceCollectionResponse):
    current_user_list_ids: list[str] = Field(serialization_alias="currentUserListIds")
    current_user_list_names: list[str] = Field(serialization_alias="currentUserListNames")
