# CORS PUT Hotfix Report

## Root Cause

Production profile favorites save failed from the browser because the backend CORS allowlist did not include `PUT`.

The deployed endpoint itself was healthy: direct API calls to `PUT /api/v1/profile/favorites` succeeded with HTTP 200 when authenticated, and unauthenticated calls returned the expected HTTP 401 envelope. Browser requests failed earlier at CORS with `net::ERR_FAILED`.

## File Changed

- `backend/app/main.py`
- `backend/tests/api/test_cors.py`

## Why Direct API Worked but Browser Failed

Direct API clients are not subject to browser CORS preflight enforcement. The production browser request used `PUT`, which triggers a CORS preflight. The backend CORS middleware allowed `GET`, `POST`, `PATCH`, `DELETE`, and `OPTIONS`, but not `PUT`, so the browser blocked the request before the application endpoint could handle it.

## Exact CORS Method Added

Added only:

- `PUT`

Preserved all existing allowed methods:

- `GET`
- `POST`
- `PATCH`
- `DELETE`
- `OPTIONS`

No origins, headers, credentials policy, product logic, frontend behavior, database schema, or migrations were changed.

## Tests Run

- `python -m ruff format --check .`: PASS
- `python -m ruff check .`: PASS
- `python -m mypy app tests`: PASS
- `python -m pytest -q`: PASS, `65 passed, 1 skipped`
- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run build`: PASS
- `npm run test:e2e`: PASS, `47 passed`

Focused test added:

- `backend/tests/api/test_cors.py::test_profile_favorites_put_preflight_is_allowed`

## Remaining Risk

Production verification is still required after merge and checksPass deployment:

- Browser save from `تعديل المفضلة` should be re-tested against production.
- The prior failed smoke path should be rerun to confirm the PUT preflight now succeeds.
