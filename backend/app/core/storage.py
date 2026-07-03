import asyncio
from abc import ABC, abstractmethod
from pathlib import Path

from app.core.config import Settings


class StorageBackend(ABC):
    @abstractmethod
    async def put(self, key: str, content: bytes, content_type: str) -> str:
        """Store content at key and return a public URL."""

    @abstractmethod
    async def delete(self, key: str) -> None:
        """Delete key if it exists."""

    @abstractmethod
    def key_from_url(self, url: str) -> str | None:
        """Return an object key for URLs owned by this backend."""

    async def delete_url(self, url: str | None) -> None:
        if not url:
            return
        key = self.key_from_url(url)
        if key is not None:
            await self.delete(key)


class LocalDiskStorageBackend(StorageBackend):
    def __init__(self, root_dir: str, public_base_url: str = "/local-place-images") -> None:
        self.root_dir = Path(root_dir)
        self.public_base_url = public_base_url.rstrip("/")

    async def put(self, key: str, content: bytes, content_type: str) -> str:
        del content_type
        target = self._path_for_key(key)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(content)
        return f"{self.public_base_url}/{key}"

    async def delete(self, key: str) -> None:
        path = self._path_for_key(key)
        try:
            path.unlink()
        except FileNotFoundError:
            return

    def key_from_url(self, url: str) -> str | None:
        prefix = f"{self.public_base_url}/"
        if not url.startswith(prefix):
            return None
        return url.removeprefix(prefix)

    def _path_for_key(self, key: str) -> Path:
        path = (self.root_dir / key).resolve()
        root = self.root_dir.resolve()
        if root != path and root not in path.parents:
            raise ValueError("Storage key resolved outside local storage root.")
        return path


class S3StorageBackend(StorageBackend):
    def __init__(
        self,
        *,
        access_key_id: str,
        bucket: str,
        endpoint_url: str,
        public_base_url: str,
        secret_access_key: str,
    ) -> None:
        self.bucket = bucket
        self.public_base_url = public_base_url.rstrip("/")
        import boto3

        self.client = boto3.client(
            "s3",
            aws_access_key_id=access_key_id,
            aws_secret_access_key=secret_access_key,
            endpoint_url=endpoint_url,
        )

    async def put(self, key: str, content: bytes, content_type: str) -> str:
        await asyncio.to_thread(
            self.client.put_object,
            Bucket=self.bucket,
            Key=key,
            Body=content,
            ContentType=content_type,
        )
        return f"{self.public_base_url}/{key}"

    async def delete(self, key: str) -> None:
        await asyncio.to_thread(self.client.delete_object, Bucket=self.bucket, Key=key)

    def key_from_url(self, url: str) -> str | None:
        prefix = f"{self.public_base_url}/"
        if not url.startswith(prefix):
            return None
        return url.removeprefix(prefix)


def get_storage_backend(settings: Settings) -> StorageBackend | None:
    s3_values = (
        settings.storage_endpoint_url,
        settings.storage_bucket,
        settings.storage_access_key_id,
        settings.storage_secret_access_key,
        settings.storage_public_base_url,
    )
    if all(s3_values):
        return S3StorageBackend(
            access_key_id=settings.storage_access_key_id or "",
            bucket=settings.storage_bucket or "",
            endpoint_url=settings.storage_endpoint_url or "",
            public_base_url=settings.storage_public_base_url or "",
            secret_access_key=settings.storage_secret_access_key or "",
        )

    if settings.app_env.lower() == "production":
        return None

    return LocalDiskStorageBackend(settings.storage_local_dir)
