from pydantic import BaseModel


class CollectionMeta(BaseModel):
    limit: int
    offset: int
    total: int
    sort: str


class CollectionResponse[T](BaseModel):
    data: list[T]
    meta: CollectionMeta


def collection_response[T](
    data: list[T],
    *,
    limit: int,
    offset: int,
    total: int,
    sort: str,
) -> CollectionResponse[T]:
    return CollectionResponse(
        data=data,
        meta=CollectionMeta(limit=limit, offset=offset, total=total, sort=sort),
    )


class DeleteResponse(BaseModel):
    deleted: bool = True


class LogoutResponse(BaseModel):
    revoked: bool = True
