# PLACE-004 Fix Report

## 1. Root Causes Fixed

### Root Cause 1: Generic subtype validation ran before PLACE-004 validation

Invalid cafe subtype query values were rejected by framework/Pydantic literal validation before the PLACE-004 validator could return the documented `INVALID_PLACE_SUBTYPE_FILTER` code.

Fixed by accepting the raw `subtype` query value as a string in `GET /api/v1/places`, then validating it with the existing PLACE-004 subtype compatibility rules before passing it to the Places service.

### Root Cause 2: Duplicate subtype query parameters were accepted

Requests such as:

```text
GET /api/v1/places?type=cafe&subtype=coffee&subtype=tea
```

were accepted and one subtype value was used silently.

Fixed by adding duplicate `subtype` query-parameter validation using the same single-value guard pattern already used for `type`, while returning the PLACE-004-specific error code.

## 2. Failed Test Cases Addressed

- `PLACE-004-US-006-TC-003`
- `PLACE-004-US-006-TC-004`
- `PLACE-004-US-006-TC-005`
- `PLACE-004-US-006-TC-006`
- `PLACE-004-US-006-TC-007`
- `PLACE-004-US-006-TC-008`
- `PLACE-004-US-006-TC-009`
- `PLACE-004-US-006-TC-010`

## 3. Files Changed

- `backend/app/api/places.py`
- `docs/qa-execution/place-004/PLACE-004_FIX_REPORT.md`

## 4. Validation Behavior Before/After

| Scenario | Before | After |
| --- | --- | --- |
| `subtype=matcha` | `422 VALIDATION_ERROR` | `422 INVALID_PLACE_SUBTYPE_FILTER` |
| `subtype=espresso` | `422 VALIDATION_ERROR` | `422 INVALID_PLACE_SUBTYPE_FILTER` |
| `subtype=` | `422 VALIDATION_ERROR` | `422 INVALID_PLACE_SUBTYPE_FILTER` |
| malformed encoded subtype | `422 VALIDATION_ERROR` | `422 INVALID_PLACE_SUBTYPE_FILTER` |
| `subtype=coffee%27%20OR%201=1` | `422 VALIDATION_ERROR` | `422 INVALID_PLACE_SUBTYPE_FILTER` |
| `subtype=%20coffee%20` | `422 VALIDATION_ERROR` | `422 INVALID_PLACE_SUBTYPE_FILTER` |
| `subtype=Coffee` | `422 VALIDATION_ERROR` | `422 INVALID_PLACE_SUBTYPE_FILTER` |
| `subtype=coffee&subtype=tea` | `200` with data | `422 INVALID_PLACE_SUBTYPE_FILTER` |
| valid `subtype=coffee` | `200` | `200` |
| valid `subtype=tea` | `200` | `200` |

## 5. Commands/Tests Run

| Command | Result |
| --- | --- |
| `python -m pytest tests/api/test_places_and_lists.py::test_place_taxonomy_validation_and_filtering -q` | PASS, 1 passed |
| `python -m pytest tests/api/test_places_and_lists.py -q` | PASS, 12 passed |
| Inline PLACE-004 API probe for all eight failed cases plus valid coffee/tea requests | PASS |
| `python -m ruff check .` | PASS |
| `python -m mypy app tests` | PASS |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `npm run test:e2e -- tests/e2e/auth-gating.spec.ts -g "places library prompts unauthenticated users to sign in"` | PASS, 1 passed |
| `npm run test:e2e -- tests/e2e/responsive-layout.spec.ts` | PASS, 5 passed |

## 6. Quality Gate Results

- PLACE-004 targeted API validation: PASS
- Full Places API tests: PASS
- Inline PLACE-004 API probe: PASS
- Backend lint: PASS
- Backend typecheck: PASS
- Frontend lint: PASS
- Frontend typecheck: PASS
- Frontend build: PASS
- Places guest E2E: PASS
- Places responsive/UI E2E: PASS

## 7. Remaining Known Risks

- The focused `sprint3-real` PLACE-004 UI E2E remains a QA/test-harness issue because it expects `/lists` after registration while the synchronized app redirects to `/places`.
- Manual assistive-technology verification remains QA-owned.

## 8. Remaining Blockers

- No developer-owned PLACE-004 blockers remain from the eight confirmed failed test cases.
- Remaining blocked PLACE-004 items are QA-owned execution, fixture, or assistive-technology validation blockers documented in the QA cycle.

## 9. No Unrelated Feature Changes

This fix is limited to backend Places query validation for PLACE-004 subtype filtering. It does not modify user stories, test cases, RTM, EDRs, frontend behavior, database schema, migrations, or unrelated feature modules.
