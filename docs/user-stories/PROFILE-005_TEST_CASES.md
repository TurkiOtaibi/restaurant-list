# PROFILE-005 Test Cases - Separate `triedPlaces` collection deprecated

## Source Requirements

- Feature: `PROFILE-005 - Separate triedPlaces collection deprecated`
- Sources: `PROFILE_USER_STORIES.md`, `FEATURE_TRACEABILITY.md`, `RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`
- Endpoint under test: `GET /api/v1/profile`
- Documented statuses: `200 OK`, `401 Unauthorized`, `500 Error`
- User stories processed: `PROFILE-005-US-001` through `PROFILE-005-US-010`

## Deterministic Fixtures

### Fixture PROFILE-005-A - Canonical Profile Response

- User: `user-canonical-001`
- Authenticated state: valid bearer session `bearer-canonical-001`
- Request: `GET /api/v1/profile`
- Payload: none
- Initial database state:
  - Ratings: `rating-001` for restaurant `مطعم الرياض`, `rating-002` for cafe `قهوة المساء`, `rating-003` for ice cream `آيس كريم الحي`
  - No separate tried-places archive is configured
- Expected `200 OK` response assertions:
  - `ratingsCount=3`
  - `ratedRestaurantCount=1`
  - `ratedCafeCount=1`
  - `ratedIceCreamCount=1`
  - `Array.isArray(userRatings)=true`
  - `userRatings.length=3`
  - `Array.isArray(publicListsSummary)=true`
- Forbidden response field at any level: `triedPlaces`.
- Nested `userRatings` row schema is not asserted by PROFILE-005; this feature asserts that `userRatings` is the canonical archive source and `triedPlaces` is absent.
- Expected UI state: exactly one archive section named `تقييماتك`; no separate tried-places section, tab, card, row group, or heading.

### Fixture PROFILE-005-B - Accidental Legacy Field In Mocked Response

- User: `user-canonical-001`
- Authenticated state: valid bearer session `bearer-canonical-001`
- Mocked response extends Fixture PROFILE-005-A with accidental `triedPlaces=[{"placeId":"place-legacy-001","placeName":"Legacy Place"}]`
- Expected UI state: `Legacy Place` is not rendered; no second tried archive appears; `تقييماتك` remains driven by `userRatings`.

## Executable Test Cases

| Test Case ID | Test Title | Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| PROFILE-005-TC-001 | Profile UI has no separate tried-places archive | Regression, UI | Critical | Fixture PROFILE-005-A is active. | Request `GET /api/v1/profile`; payload none; expected `200 OK`. | Open `/profile` and inspect landmarks/headings/tabs/cards. | API status is `200 OK`; UI contains exactly one archive section `تقييماتك`; no section, tab, card, heading, or row group named `triedPlaces`, `Tried Places`, or `الأماكن المجربة` appears. | PROFILE-005-US-001 | Yes | UI E2E |
| PROFILE-005-TC-002 | Profile API does not return `triedPlaces` anywhere | API, Contract | Critical | Fixture PROFILE-005-A is active. | Request `GET /api/v1/profile`; payload none. | Request endpoint and recursively inspect JSON keys. | API status is `200 OK`; no top-level or nested key equals `triedPlaces`; `userRatings` is present as an array. | PROFILE-005-US-002, PROFILE-005-US-005 | Yes | API |
| PROFILE-005-TC-003 | Archive rendering uses `userRatings` and ignores absent legacy collection | API, UI | Critical | Fixture PROFILE-005-A is active. | Request `GET /api/v1/profile`; payload none; `userRatings` contains `rating-001`; `triedPlaces` absent. | Open `/profile`. | API status is `200 OK`; UI renders row `مطعم الرياض` from `userRatings`; no request or DOM dependency on `triedPlaces` is observed. | PROFILE-005-US-003 | Yes | UI E2E |
| PROFILE-005-TC-004 | Accidental legacy `triedPlaces` field does not create duplicate UI | Regression, UI | High | Fixture PROFILE-005-B is active in frontend contract test. | Mock `GET /api/v1/profile` response is `200 OK` and includes `triedPlaces` with `Legacy Place`. | Render `/profile` with the mocked response. | Mocked API status is `200 OK`; UI does not render `Legacy Place`; archive row count equals `userRatings.length`; no second tried archive appears. | PROFILE-005-US-004, PROFILE-005-US-006 | Yes | UI E2E |
| PROFILE-005-TC-005 | Rated counts remain visible while archive remains canonical | Positive, UI | High | Fixture PROFILE-005-A is active. | Request `GET /api/v1/profile`; payload none; expected `200 OK`; rated counts: restaurant `1`, cafe `1`, ice cream `1`; archive from `userRatings`. | Open `/profile`. | API status is `200 OK`; summary shows counts `1`, `1`, `1`; only `تقييماتك` archive is present; counts do not create a tried-places row group. | PROFILE-005-US-007 | Yes | UI E2E |
| PROFILE-005-TC-006 | Profile refresh preserves canonical `userRatings` archive model | Regression, UI | Medium | First response and refreshed response both use Fixture PROFILE-005-A shape with changed rating order. | Two `GET /api/v1/profile` responses, both `200 OK` and without `triedPlaces`. | Load `/profile`, then refresh profile data. | Both API responses have status `200 OK`; both renders use only `userRatings`; no separate tried archive appears after refresh. | PROFILE-005-US-010 | Yes | UI E2E |
| PROFILE-005-TC-007 | Unauthorized profile response does not expose deprecated tried collection | Negative, API, Security | Critical | Fixture PROFILE-005-A data exists but no valid session is present. | Request `GET /api/v1/profile`; payload none. | Request endpoint as guest and inspect response/UI. | API status is `401 Unauthorized`; response contains no `triedPlaces`, `userRatings`, rated counts, profile counts, place names, or rating rows; UI renders signed-out state without a tried archive. | PROFILE-005-US-002 | Yes | API, Security |

## Requirement Clarification, Manual, and Traceability Cases

| Test Case ID | Case Type | Priority | Title | Verification |
|---|---|---|---|---|
| PROFILE-005-TC-008 | Traceability Verification | Medium | Documentation marks `triedPlaces` legacy | `PROFILE-005-US-008`: review `PROFILE-005` source and traceability matrix to confirm separate `triedPlaces` is deprecated and `userRatings` is canonical. |
| PROFILE-005-TC-009 | Traceability Verification | Low | No migration or backfill required | `PROFILE-005-US-009`: confirm no PROFILE-005 executable case creates migration, backfill, or new UI work for `triedPlaces`; this remains a scope statement. |
| PROFILE-005-TC-010 | Manual Verification | High | Contract test fails on `triedPlaces` regression in CI | Confirm API contract tests include a recursive forbidden-key assertion for `triedPlaces`; CI wiring itself is verified manually if not visible from this test package. |

## Summary

- Executable test cases: 7
- Requirement Clarification cases: 0
- Manual cases: 1
- Traceability Verification cases: 2
- Total test cases: 10
- Priority counts: Critical 4, High 3, Medium 2, Low 1
- Automation layer counts: API 2, UI E2E 5, Accessibility 0, Security 1, Manual 1, Traceability Verification 2, Requirement Clarification 0

## Validation

- Duplicate Test IDs: 0
- Invalid Story References: 0
- Missing User Stories: 0
- Encoding/Mojibake: 0
- API Tests Missing Status Codes: 0
- Requirement Fidelity Violations: 0
- Feature Ownership Violations: 0
- Generic Executable Wording: 0
