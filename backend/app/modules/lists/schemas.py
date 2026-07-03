from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.text import strip_if_string
from app.modules.places.schemas import PlaceCollectionResponse

ListVisibility = Literal["public", "private"]


class ListCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    visibility: ListVisibility = "private"

    @field_validator("name", mode="before")
    @classmethod
    def normalize_name(cls, value: object) -> object:
        return strip_if_string(value)


class ListUpdateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=80)

    @field_validator("name", mode="before")
    @classmethod
    def normalize_name(cls, value: object) -> object:
        return strip_if_string(value)


class ListVisibilityUpdateRequest(BaseModel):
    visibility: ListVisibility


class ListItemCreateRequest(BaseModel):
    place_id: str = Field(alias="placeId", min_length=1)

    model_config = ConfigDict(populate_by_name=True)


class ListItemResponse(BaseModel):
    id: str
    list_id: str = Field(serialization_alias="listId")
    place_id: str = Field(serialization_alias="placeId")
    place: PlaceCollectionResponse
    created_at: datetime = Field(serialization_alias="createdAt")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class ListResponse(BaseModel):
    id: str
    name: str
    visibility: ListVisibility
    is_system: bool = Field(default=False, serialization_alias="isSystem")
    place_count: int = Field(default=0, serialization_alias="placeCount")
    created_at: datetime = Field(serialization_alias="createdAt")
    updated_at: datetime = Field(serialization_alias="updatedAt")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class ListDataResponse(BaseModel):
    data: ListResponse


class PublicListResponse(ListResponse):
    owner_display_name: str = Field(serialization_alias="ownerDisplayName")


class ListDetailResponse(ListResponse):
    items: list[ListItemResponse]


class PublicListDetailResponse(PublicListResponse):
    items: list[ListItemResponse]
