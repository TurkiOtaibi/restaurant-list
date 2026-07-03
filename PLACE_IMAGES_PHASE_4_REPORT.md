# Place Images Phase 4 Report

## Executive Summary

Phase 4 adds optional real images for places while preserving the existing PlaceTypeIcon fallback everywhere. Image management is creator-only, storage is abstracted behind environment-configured S3-compatible storage for production, and local disk storage is available only for development/tests. The feature is additive: existing place, list, rating, profile, and favorites behavior is preserved.

## Product Decision

- Places may have one optional image.
- Only the place creator may upload, replace, or remove that place image.
- Images are normalized server-side to WebP, stripped of metadata, and capped to a 1200px long edge.
- Favorites now render as true poster cards when imageUrl exists, with mandatory fallback to PlaceTypeIcon.
- No user avatar upload, moderation, social features, wishlist, histogram, or tried concept was introduced.

## Contract Changes

EDR-012 documents the additive contract change.

- `PlaceResponse.imageUrl: string | null`
- `PlaceCollectionResponse.imageUrl: string | null`
- `ProfileResponse.favoritePlaces[].imageUrl: string | null`
- `PlaceResponse.currentUserIsCreator: boolean`
- `PlaceCollectionResponse.currentUserIsCreator: boolean`

Existing fields and legacy aliases remain unchanged.

## Backend Changes

- Added storage abstraction with S3-compatible and local-disk implementations.
- Added `places.image_url` nullable migration.
- Added creator-only image upload and removal endpoints:
  - `PUT /api/v1/places/{place_id}/image`
  - `DELETE /api/v1/places/{place_id}/image`
- Added image validation for upload size, decoded format, decompression-bomb rejection, WebP processing, and stale-object cleanup.
- Added CORS preflight coverage for PUT/DELETE image routes.
- Added focused backend tests for upload, replace, remove, auth, permissions, invalid uploads, unconfigured storage, and response propagation.

## Frontend Changes

- Added shared `PlaceImage` component with onError fallback.
- Applied image/fallback rendering to:
  - place rows/cards
  - place detail hero
  - profile favorites
  - profile rating archive
  - list add-place dialog rows
- Added creator-only image actions on place detail through the existing ActionMenu.
- Added ResponsiveDialog upload flow with file picker, client 5MB check, preview, loading state, and StatusMessage error/success handling.
- Updated E2E mocks for the additive place/profile contract fields.
- Added focused E2E coverage for image render, null fallback, broken-image fallback, creator upload, and non-creator visibility.

## Operations Note

Production image storage requires these Render environment variables:

- `STORAGE_ENDPOINT_URL`
- `STORAGE_BUCKET`
- `STORAGE_ACCESS_KEY_ID`
- `STORAGE_SECRET_ACCESS_KEY`
- `STORAGE_PUBLIC_BASE_URL`

The frontend CSP must also be configured with:

- `NEXT_PUBLIC_PLACE_IMAGE_BASE_URL`

This public frontend value should use the same origin as `STORAGE_PUBLIC_BASE_URL`. No secret values are stored in code, tests, or docs. Until production storage is configured, upload/remove image endpoints return `503 STORAGE_NOT_CONFIGURED`; the rest of the app continues to work and existing places return `imageUrl: null`.

## Database Status

- Migration added: `20260703_0012_place_images`
- Schema change: nullable `places.image_url`
- No destructive migration.
- No local-disk production storage.

## Quality Gate Results

- `python -m ruff format --check .`: PASS
- `python -m ruff check .`: PASS
- `python -m mypy app tests`: PASS
- `python -m pytest -q`: PASS, 71 passed, 1 skipped
- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run build`: PASS
- `npm run test:e2e`: PASS, 49 passed
- Focused `npx playwright test tests/e2e/place-images.spec.ts`: PASS, 2 passed

Native `<img>` usage is intentionally documented inline because environment-configured object storage URLs and mandatory `onError` fallback behavior are required for this feature.

## Evidence Table

| Area | Implementation | Evidence | Risk |
| --- | --- | --- | --- |
| Storage | S3-compatible production backend plus local test/dev backend | `backend/app/core/storage.py` | Medium: production env vars must be configured |
| Migration | Added nullable `places.image_url` | `backend/migrations/versions/20260703_0012_place_images.py` | Low |
| Upload API | Creator-only multipart PUT with WebP normalization | `backend/app/modules/places/image_service.py`, `backend/app/api/places.py` | Medium: depends on storage availability |
| Remove API | Creator-only DELETE clears URL and removes object | `backend/app/modules/places/image_service.py` | Low |
| CORS | PUT/DELETE preflight pinned | `backend/tests/api/test_cors.py` | Low |
| Contract | imageUrl and currentUserIsCreator added | `docs/engineering-decisions/EDR-012_PLACE_IMAGES.md` | Low, additive |
| Place UI | Shared image with fallback | `frontend/src/components/ui/PlaceImage.tsx` | Low |
| Favorites | Poster cards use imageUrl fallback | `frontend/src/features/profile/ProfileArchivePage.tsx` | Low |
| Upload UI | Creator-only ActionMenu + ResponsiveDialog flow | `frontend/src/features/places/PlaceDetailPage.tsx` | Medium: real storage must be configured |
| Tests | Backend and E2E coverage added | `backend/tests/api/test_place_images.py`, `frontend/tests/e2e/place-images.spec.ts` | Low |

## Remaining Risks

- Production uploads remain dormant until Render storage env vars are configured.
- The frontend uses native `<img>` to support environment-configured storage origins and reliable `onError` fallback; focused inline lint exceptions document this.
- No image moderation exists in this phase by approved product decision.

## Release Recommendation

Ready for PR review. Do not merge or deploy until review approval and release gates pass on the PR branch.
