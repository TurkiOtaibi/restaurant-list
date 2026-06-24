from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.modules.places.schemas import PlaceResponse

ListVisibility = Literal["public", "private"]


class ListCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    visibility: ListVisibility = "private"


class ListUpdateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=80)


class ListVisibilityUpdateRequest(BaseModel):
    visibility: ListVisibility


class ListItemCreateRequest(BaseModel):
    place_id: str = Field(alias="placeId", min_length=1)

    model_config = ConfigDict(populate_by_name=True)


class ListItemResponse(BaseModel):
    id: str
    place: PlaceResponse
    created_at: datetime = Field(serialization_alias="createdAt")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class ListBaseResponse(BaseModel):
    id: str
    name: str
    visibility: ListVisibility
    owner_display_name: str = Field(serialization_alias="ownerDisplayName")
    place_count: int = Field(default=0, serialization_alias="placeCount")
    created_at: datetime = Field(serialization_alias="createdAt")
    updated_at: datetime = Field(serialization_alias="updatedAt")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class ListResponse(ListBaseResponse):
    user_id: str = Field(serialization_alias="userId")


class PublicListResponse(ListBaseResponse):
    pass


class ListDetailResponse(ListResponse):
    items: list[ListItemResponse]


class PublicListDetailResponse(PublicListResponse):
    items: list[ListItemResponse]
