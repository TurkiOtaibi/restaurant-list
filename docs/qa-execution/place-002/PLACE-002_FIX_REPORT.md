# PLACE-002 Fix Report

## Scope

Fixed only the confirmed developer-owned PLACE-002 failures:

- `PLACE-002-US-001-TC-006`
- `PLACE-002-US-001-TC-010`
- `PLACE-002-US-002-TC-007`
- `PLACE-002-US-003-TC-007`
- `PLACE-002-US-007-TC-009`

## Root Causes Fixed

1. Filtered Places collection responses exposed `createdByUserId`.
   - Root cause: `GET /api/v1/places` reused `PlaceResponse`, which serializes creator identity.
   - Fix: Added `PlaceCollectionResponse` for collection rows and changed `GET /api/v1/places` to return that public collection DTO.

2. Repeated `type` query parameters were accepted.
   - Root cause: FastAPI parsed repeated `type` values and the endpoint accepted one value instead of rejecting ambiguity.
   - Fix: Added explicit query validation for `type` so `GET /api/v1/places?type=restaurant&type=cafe` returns `422 VALIDATION_ERROR` and no catalog `data`.

## Files Changed

- `backend/app/api/places.py`
- `backend/app/modules/places/schemas.py`
- `docs/qa-execution/place-002/PLACE-002_FIX_REPORT.md`

## Tests Executed

| Command | Result |
| --- | --- |
| `python -m pytest tests/api/test_places_and_lists.py::test_place_taxonomy_validation_and_filtering tests/api/test_places_and_lists.py::test_places_require_authentication -q` | PASS, 2 passed |
| Inline PLACE-002 API contract probe using a temporary SQLite database | PASS, `createdByUserId` absent for restaurant/cafe/ice_cream filtered collections and repeated `type` returns `422` |
| `python -m ruff check .` | PASS |
| `python -m mypy app tests` | PASS |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `npm run test:e2e -- tests/e2e/auth-gating.spec.ts -g "places library prompts unauthenticated users to sign in"` | PASS, 1 passed |
| `npm run test:e2e -- tests/e2e/responsive-layout.spec.ts` | PASS, 5 passed |
| `python -m pytest tests/api/test_places_and_lists.py -q` | PASS, 12 passed |

## Quality Gate Results

All requested PLACE-002 implementation quality gates passed.

## Remaining Known Risks

- `PlaceCollectionResponse` intentionally applies only to `GET /api/v1/places` collection rows. Place detail and nested place contexts still use their existing contracts.
- Existing frontend static type `Place` is broader than the collection DTO. Runtime collection behavior no longer includes `createdByUserId`; current frontend collection rendering does not depend on that field.

## Remaining Blockers

QA-owned PLACE-002 blockers from the execution report remain out of scope:

- UI timing/failure injection fixtures
- Manual screen-reader verification
- Browser-history restoration fixtures
- Focused authenticated filter interaction harness gaps

