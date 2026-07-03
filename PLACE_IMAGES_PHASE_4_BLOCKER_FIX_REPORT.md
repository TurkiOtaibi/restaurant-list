# Place Images Phase 4 Blocker Fix Report

## Executive Summary

This focused pass resolves the blocking findings from `PLACE_IMAGES_PHASE_4_PR_REVIEW.md` for PR #14. The fixes preserve the approved Phase 4 product model: creator-only image management, S3-compatible production storage, local storage only for dev/tests, server-side WebP normalization, and mandatory frontend fallback to PlaceTypeIcon.

## Blocking Findings Fixed

| Finding | Root Cause | Fix Implemented | Test Evidence |
| --- | --- | --- | --- |
| F-1: identical replacement can delete active object | Replacement keys are content-hash based, but old-object cleanup did not skip when old and new keys matched. | Compare old key/URL with new key/URL. Skip active-object deletion when they match. Rollback cleanup deletes the uploaded object only when it is not the active old object. Post-commit cleanup is best-effort and logged. | `backend/tests/api/test_place_images.py::test_place_image_upload_replace_and_remove` now replaces with identical content and asserts the active object remains. |
| F-2: spoofed content_type bypass | Server trusted multipart `content_type` before decoding. | Decode with Pillow and validate actual `source.format`; only JPEG, PNG, WEBP are allowed. Unsupported decoded formats return `PLACE_IMAGE_UNSUPPORTED_FORMAT`; corrupt/non-image files return `PLACE_IMAGE_INVALID`. | Validation test uploads GIF bytes with `Content-Type: image/png` and receives `PLACE_IMAGE_UNSUPPORTED_FORMAT`. |
| F-3: decompression-bomb risk | Byte size limit existed, but decoded pixel expansion was not explicitly bounded. | Set explicit Pillow pixel limit, convert `DecompressionBombWarning` to an exception, and reject bomb-style images with `PLACE_IMAGE_INVALID`. Raw upload size remains enforced before decode. | Validation test uploads a small compressed high-pixel PNG and receives `PLACE_IMAGE_INVALID`. |
| F-4: CSP blocks external R2 images | Frontend CSP `img-src` allowed only `self` and `data:`. | Add `NEXT_PUBLIC_PLACE_IMAGE_BASE_URL`, derive its origin, and include it narrowly in `img-src`. Preserve `self`, `data:`, and add `blob:` for local upload previews. | `sprint3-real.spec.ts` asserts CSP includes `img-src 'self' data: blob:`; EDR-012 documents the frontend env requirement. |

## Files Changed

- `backend/app/modules/places/image_service.py`
- `backend/tests/api/test_place_images.py`
- `docs/engineering-decisions/EDR-012_PLACE_IMAGES.md`
- `frontend/next.config.ts`
- `frontend/src/components/ui/PlaceImage.tsx`
- `frontend/src/features/places/PlaceDetailPage.tsx`
- `frontend/tests/e2e/place-images.spec.ts`
- `frontend/tests/e2e/sprint3-real.spec.ts`
- `PLACE_IMAGES_PHASE_4_REPORT.md`
- `PLACE_IMAGES_PHASE_4_BLOCKER_FIX_REPORT.md`

## Security Impact

- Upload validation no longer trusts client MIME or filename metadata.
- Unsupported decoded formats cannot bypass the JPEG/PNG/WebP allowlist.
- Raw uploads over 5MB are rejected before decode.
- High-pixel decompression-bomb style uploads are rejected safely.
- Original uploads are still not persisted; only normalized WebP output is stored.
- EXIF/metadata remains stripped by writing a fresh WebP.
- Creator-only authorization remains unchanged.
- No secrets were added to code, docs, or tests.

## CSP Impact

The frontend CSP remains restrictive. It now allows:

- `self`
- `data:`
- `blob:`
- the origin derived from `NEXT_PUBLIC_PLACE_IMAGE_BASE_URL`, when configured

This avoids wildcard image permissions while allowing the configured R2/public storage origin. `NEXT_PUBLIC_PLACE_IMAGE_BASE_URL` should match the public origin of backend `STORAGE_PUBLIC_BASE_URL`.

## Tests Added / Updated

Backend:

- Identical replacement keeps the active object.
- Different replacement still changes `imageUrl` and deletes the old object.
- Spoofed `content_type` with unsupported decoded GIF is rejected.
- Decompression-bomb style high-pixel image is rejected.
- Existing corrupt image, raw >5MB, remove image, storage missing, auth, permission, and contract propagation coverage remain passing.

Frontend/E2E:

- Remove-image flow now verifies the UI updates back to PlaceTypeIcon fallback.
- CSP test now verifies `img-src` preserves `self`, `data:`, and `blob:`.
- Native `<img>` usage has focused inline lint exceptions explaining deploy-time storage URLs and required `onError` fallback.

## Quality Gate Results

- `python -m ruff format --check .`: PASS
- `python -m ruff check .`: PASS
- `python -m mypy app tests`: PASS
- `python -m pytest -q`: PASS, 71 passed, 1 skipped
- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run build`: PASS
- `npm run test:e2e`: PASS, 49 passed
- Focused backend image/CORS tests: PASS, 7 passed
- Focused image/CSP E2E tests: PASS, 3 passed

## Remaining Risks

- Production uploads remain dormant until backend storage env vars and frontend CSP image-origin env var are configured.
- Post-commit old-object cleanup is best-effort and logs failures; this avoids false user-facing failures but may require manual storage cleanup if a delete operation fails.
- No moderation system exists in this phase by approved product decision.

## Re-review Recommendation

Ready for PR #14 re-review.
