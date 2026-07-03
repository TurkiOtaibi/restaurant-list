# EDR-012: Place Images Contract

Date: 2026-07-03

Status: Approved

## Context

Places need optional real images across listing, detail, profile, list, and favorite surfaces. Favorites should become poster-like cards when a curated place has an image. The app runs on Render where local disks are ephemeral, so production image storage cannot depend on the application filesystem.

## Decision

Places support one optional image managed only by the place creator.

The backend stores image objects in external S3-compatible object storage in production. Cloudflare R2 is the target storage provider. Configuration is environment-variable driven:

- `STORAGE_ENDPOINT_URL`
- `STORAGE_BUCKET`
- `STORAGE_ACCESS_KEY_ID`
- `STORAGE_SECRET_ACCESS_KEY`
- `STORAGE_PUBLIC_BASE_URL`

No secret values are stored in code, tests, or documentation.

If production storage is not configured, upload and delete image endpoints return HTTP 503 with EDR-001 code `STORAGE_NOT_CONFIGURED`. Read APIs continue working and return `imageUrl: null` where no image exists.

Development and tests may use the local-disk storage backend. Production must not use local disk for place images.

## API Contract

Additive fields:

- `PlaceResponse.imageUrl: string | null`
- `PlaceResponse.currentUserIsCreator: boolean`
- `PlaceCollectionResponse.imageUrl: string | null`
- `PlaceCollectionResponse.currentUserIsCreator: boolean`
- `ProfileResponse.favoritePlaces[].imageUrl: string | null`

Existing fields and legacy aliases remain unchanged.

New endpoints:

- `PUT /api/v1/places/{place_id}/image`
  - Multipart upload field: `file`
  - Auth required.
  - Only the place creator may upload or replace.
  - Returns the updated `PlaceResponse`.
- `DELETE /api/v1/places/{place_id}/image`
  - Auth required.
  - Only the place creator may remove.
  - Returns the updated `PlaceResponse`.

Validation and authorization errors:

- 401 unauthenticated: `UNAUTHENTICATED`
- 404 unknown place: `PLACE_NOT_FOUND`
- 403 non-creator: `PLACE_IMAGE_FORBIDDEN`
- 413 upload larger than 5MB: `PLACE_IMAGE_TOO_LARGE`
- 422 unsupported content type: `PLACE_IMAGE_UNSUPPORTED_FORMAT`
- 422 image decode failure: `PLACE_IMAGE_INVALID`
- 503 storage missing in production: `STORAGE_NOT_CONFIGURED`

## Processing

The server normalizes uploads before storage:

- Accepts JPEG, PNG, and WebP only.
- Applies EXIF orientation.
- Converts to WebP.
- Caps the long edge at 1200px.
- Uses WebP quality around 80.
- Strips metadata by writing a fresh WebP.

Object keys include a content hash:

- `places/{place_id}/{content_hash}.webp`

On replace, the new object is stored and the database is updated first. After a successful replace, the previous object is deleted. This keeps image URLs immutable and avoids stale cache serving.

## UI Impact

Frontend place surfaces render through one shared `PlaceImage` component. The component displays `imageUrl` when present and falls back to the existing `PlaceTypeIcon` tile when `imageUrl` is null or when the image fails to load.

Place images are decorative because the visible place name is adjacent.

Creator-only image management appears on the place detail page:

- `أضف صورة`
- `تغيير الصورة`
- `إزالة الصورة`

Upload uses a dialog with file selection, client-side 5MB validation, preview, loading state, and server error display.

## CORS

The image endpoints require browser `PUT` and `DELETE`. `backend/app/main.py` must allow both methods in the CORS method allowlist. Tests pin preflight behavior for the profile favorites PUT route and the place image PUT/DELETE routes.

## Consequences

The product gains real place images without changing ratings, lists, favorites logic, profile identity, auth/session behavior, or place ownership. The feature is dormant in production until the required storage environment variables are configured.
