# RATING-003 Test Cases

Feature: `RATING-003 - Support 1-10 in 0.5 increments`

Feature Description: Ratings support numeric values from `1` through `10` inclusive in `0.5` increments across UI, API, and database validation.

Primary Source: `docs/user-stories/RATINGS_USER_STORIES.md`

Supporting Sources:

- `docs/feature-map/FEATURE_TRACEABILITY.md`
- `docs/user-stories/RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`

## QA Execution Standards

- Executable tests validate only `RATING-003`, `FEATURE_TRACEABILITY.md`, or approved global `RESP-*` / `A11Y-*` requirements.
- Rating deletion, aggregate recalculation, browser history, cache behavior, synchronization timing, recommendation behavior, and rating history are out of scope for this feature.
- Accepted values are classified as Positive; rejected values are classified as Negative.
- The documented success response is the single `RatingResponse` object with exactly `id`, `userId`, `placeId`, `rating`, `notes`, `createdAt`, and `updatedAt`.
- Documented statuses used by this file are `201 Created` for new `POST /api/v1/ratings`, `200 OK` for `PATCH /api/v1/ratings/{place_id}`, and `422 Validation Error` for invalid rating values.
- Forbidden response fields include hidden metadata, audit/debug fields, stack traces, SQL details, tokens, aggregate-only fields, rating history, and other users' data.

## Deterministic Fixtures

| Fixture ID | User / Permissions | Database State | API / UI Context | Expected Baseline |
|---|---|---|---|---|
| FX-R003-A | `user-001` authenticated | `place-001`, name `مطعم الرياض`, type `restaurant`; no rating exists for `(user-001, place-001)`. | Create via `POST /api/v1/ratings`; rating UI opened from `place-001`. | New rating creation path is available; no persisted value is selected. |
| FX-R003-B | `user-001` authenticated | Existing `rating-001`: `userId=user-001`, `placeId=place-001`, `rating=6`, `notes=null`, `createdAt=2026-06-01T10:00:00Z`, `updatedAt=2026-06-01T10:00:00Z`. | Edit via `PATCH /api/v1/ratings/place-001`; rating UI opened with current value `6/10`. | Exactly one current-user rating row exists before each update case. |
| FX-R003-C | DB integration harness | Valid `users` and `places` rows exist for `user-001` and `place-001`; transactions are isolated per attempted insert/update. | Direct database persistence bypasses API validators. | The `ratings` table constraint is the system under test. |
| FX-R003-D | `user-001` authenticated | Same as FX-R003-A; Arabic UI direction is RTL. | Rating control rendered for `place-001`. | Control is keyboard reachable and exposes the rating scale to assistive technology. |

## Response Contract

Successful API responses are the documented single `RatingResponse` object:

```json
{
  "id": "rating-generated-id",
  "userId": "user-001",
  "placeId": "place-001",
  "rating": 8.5,
  "notes": null,
  "createdAt": "2026-06-26T10:00:00Z",
  "updatedAt": "2026-06-26T10:00:00Z"
}
```

Executable tests assert those exact top-level fields for success responses. Error tests assert the documented status, that the error identifies `rating`, no rating row changes, and no forbidden field or private note content is returned.

## RATING-003-US-001 - Accept rating 1

User Story ID: `RATING-003-US-001`

User Story Title: Accept rating 1

User Story Summary: As a user, I want to choose the minimum valid rating so that low experiences can be logged.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-003-US-001-TC-001 | POST accepts minimum rating 1 | API, Validation, Positive | Critical | FX-R003-A is loaded. | `POST /api/v1/ratings` body `{ "placeId": "place-001", "rating": 1 }`. | 1. Send request as `user-001`. 2. Inspect status and response JSON. 3. Query ratings for `(user-001, place-001)`. | Response status is `201 Created`; response has exactly the `RatingResponse` fields; `response.rating` is numeric `1`; exactly one rating row exists with `rating=1`; forbidden fields are absent. | RATING-003-US-001 | Yes | API | Smoke. |

## RATING-003-US-002 - Accept rating 1.5

User Story ID: `RATING-003-US-002`

User Story Title: Accept rating 1.5

User Story Summary: As a user, I want to choose low half-step ratings.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-003-US-002-TC-001 | POST accepts half-step rating 1.5 | API, Validation, Positive | Critical | FX-R003-A is loaded. | `POST /api/v1/ratings` body `{ "placeId": "place-001", "rating": 1.5 }`. | 1. Send request as `user-001`. 2. Inspect status and response JSON. 3. Query ratings for `(user-001, place-001)`. | Response status is `201 Created`; response has exactly the `RatingResponse` fields; `response.rating` is numeric `1.5`; exactly one rating row exists with `rating=1.5`; forbidden fields are absent. | RATING-003-US-002 | Yes | API | Smoke. |

## RATING-003-US-003 - Accept rating 8.5

User Story ID: `RATING-003-US-003`

User Story Title: Accept rating 8.5

User Story Summary: As a user, I want to choose common half-step ratings.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-003-US-003-TC-001 | POST accepts common half-step rating 8.5 | API, Validation, Positive | Critical | FX-R003-A is loaded. | `POST /api/v1/ratings` body `{ "placeId": "place-001", "rating": 8.5 }`. | 1. Send request as `user-001`. 2. Inspect status and response JSON. 3. Query ratings for `(user-001, place-001)`. | Response status is `201 Created`; response has exactly the `RatingResponse` fields; `response.rating` is numeric `8.5`; exactly one rating row exists with `rating=8.5`; forbidden fields are absent. | RATING-003-US-003 | Yes | API | Smoke. |
| RATING-003-US-003-TC-002 | UI displays selected 8.5 as 8.5/10 | UI, Accessibility, Positive | Critical | FX-R003-D is loaded. | Select rating value `8.5` in the rating control. | 1. Open the rating UI for `place-001`. 2. Select `8.5`. 3. Inspect visible text, selected state, and accessibility tree. | Visible rating text is `8.5/10` using Western digits and period decimal separator; the numeric run is LTR-isolated in RTL layout; the selected value is exposed as `8.5/10` to assistive technology. | RATING-003-US-003 | Yes | Accessibility | Source: RATING-003-US-003, RATING-003-US-014, A11Y-002-US-006, A11Y-002-US-013, RESP-004-US-003, RESP-004-US-004. |

## RATING-003-US-004 - Accept rating 10

User Story ID: `RATING-003-US-004`

User Story Title: Accept rating 10

User Story Summary: As a user, I want to choose the maximum valid rating.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-003-US-004-TC-001 | POST accepts maximum rating 10 | API, Validation, Positive | Critical | FX-R003-A is loaded. | `POST /api/v1/ratings` body `{ "placeId": "place-001", "rating": 10 }`. | 1. Send request as `user-001`. 2. Inspect status and response JSON. 3. Query ratings for `(user-001, place-001)`. | Response status is `201 Created`; response has exactly the `RatingResponse` fields; `response.rating` is numeric `10`; exactly one rating row exists with `rating=10`; forbidden fields are absent. | RATING-003-US-004 | Yes | API | Smoke. |

## Complete Valid Rating Matrix

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-003-MATRIX-TC-001 | POST accepts every valid rating value | API, Validation, Positive, Boundary | Critical | For each iteration, reset FX-R003-A so no rating exists for `(user-001, place-001)`. | Parameterized values: `1.0`, `1.5`, `2.0`, `2.5`, `3.0`, `3.5`, `4.0`, `4.5`, `5.0`, `5.5`, `6.0`, `6.5`, `7.0`, `7.5`, `8.0`, `8.5`, `9.0`, `9.5`, `10.0`; request body `{ "placeId": "place-001", "rating": <value> }`. | 1. Send one `POST /api/v1/ratings` request per value as `user-001`. 2. Inspect status and response JSON for each iteration. 3. Query the persisted row after each request. 4. Reset the rating row before the next value. | Every listed value returns `201 Created`; each response has exactly the `RatingResponse` fields; `response.rating` equals the submitted numeric value; exactly one row exists for `(user-001, place-001)` after each iteration; forbidden fields are absent. | RATING-003-US-001; RATING-003-US-002; RATING-003-US-003; RATING-003-US-004 | Yes | API | Nightly parameterized matrix. Covers the complete valid scale, not only representative values. |
| RATING-003-MATRIX-TC-002 | PATCH accepts every valid rating value | API, Validation, Positive, Boundary | Critical | For each iteration, reset FX-R003-B with `rating-001` already present at `rating=6`. | Parameterized values: `1.0`, `1.5`, `2.0`, `2.5`, `3.0`, `3.5`, `4.0`, `4.5`, `5.0`, `5.5`, `6.0`, `6.5`, `7.0`, `7.5`, `8.0`, `8.5`, `9.0`, `9.5`, `10.0`; request body `{ "rating": <value>, "notes": null }`. | 1. Send one `PATCH /api/v1/ratings/place-001` request per value as `user-001`. 2. Inspect status and response JSON for each iteration. 3. Query `rating-001` after each request. 4. Reset `rating-001.rating=6` before the next value. | Every listed value returns `200 OK`; each response has exactly the `RatingResponse` fields; `response.id` remains `rating-001`; `response.rating` equals the submitted numeric value; exactly one row exists for `(user-001, place-001)`; forbidden fields are absent. | RATING-003-US-001; RATING-003-US-002; RATING-003-US-003; RATING-003-US-004 | Yes | API | Nightly parameterized matrix. Confirms edit path uses the same scale. |

## RATING-003-US-005 - Reject rating 0

User Story ID: `RATING-003-US-005`

User Story Title: Reject rating 0

User Story Summary: As the system, I want ratings below range rejected.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-003-US-005-TC-001 | PATCH rejects rating 0 | API, Validation, Negative, Boundary | Critical | FX-R003-B is loaded with `rating-001.rating=6`. | `PATCH /api/v1/ratings/place-001` body `{ "rating": 0, "notes": null }`. | 1. Send request as `user-001`. 2. Inspect status and error body. 3. Query `rating-001`. | Response status is `422 Validation Error`; error details identify `rating`; `rating-001.rating` remains `6`; no new rating row is created; error body contains no private notes, stack trace, SQL details, tokens, hidden metadata, or audit/debug fields. | RATING-003-US-005 | Yes | API | Smoke. |

## RATING-003-US-006 - Reject rating 0.5

User Story ID: `RATING-003-US-006`

User Story Title: Reject rating 0.5

User Story Summary: As the system, I want below-min half-step ratings rejected.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-003-US-006-TC-001 | POST rejects rating 0.5 | API, Validation, Negative, Boundary | Critical | FX-R003-A is loaded. | `POST /api/v1/ratings` body `{ "placeId": "place-001", "rating": 0.5 }`. | 1. Send request as `user-001`. 2. Inspect status and error body. 3. Query ratings for `(user-001, place-001)`. | Response status is `422 Validation Error`; error details identify `rating`; zero rating rows exist for `(user-001, place-001)`; error body contains no private notes, stack trace, SQL details, tokens, hidden metadata, or audit/debug fields. | RATING-003-US-006 | Yes | API | Smoke. |

## RATING-003-US-007 - Reject rating 10.5

User Story ID: `RATING-003-US-007`

User Story Title: Reject rating 10.5

User Story Summary: As the system, I want ratings above range rejected.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-003-US-007-TC-001 | POST rejects rating 10.5 | API, Validation, Negative, Boundary | Critical | FX-R003-A is loaded. | `POST /api/v1/ratings` body `{ "placeId": "place-001", "rating": 10.5 }`. | 1. Send request as `user-001`. 2. Inspect status and error body. 3. Query ratings for `(user-001, place-001)`. | Response status is `422 Validation Error`; error details identify `rating`; zero rating rows exist for `(user-001, place-001)`; error body contains no private notes, stack trace, SQL details, tokens, hidden metadata, or audit/debug fields. | RATING-003-US-007 | Yes | API | Smoke. |

## RATING-003-US-008 - Reject rating 8.25

User Story ID: `RATING-003-US-008`

User Story Title: Reject rating 8.25

User Story Summary: As the system, I want quarter-step values rejected.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-003-US-008-TC-001 | POST rejects quarter-step rating 8.25 | API, Validation, Negative | Critical | FX-R003-A is loaded. | `POST /api/v1/ratings` body `{ "placeId": "place-001", "rating": 8.25 }`. | 1. Send request as `user-001`. 2. Inspect status and error body. 3. Query ratings for `(user-001, place-001)`. | Response status is `422 Validation Error`; error details identify `rating`; zero rating rows exist for `(user-001, place-001)`; error body contains no private notes, stack trace, SQL details, tokens, hidden metadata, or audit/debug fields. | RATING-003-US-008 | Yes | API | Smoke. |

## RATING-003-US-009 - Reject rating 8.3

User Story ID: `RATING-003-US-009`

User Story Title: Reject rating 8.3

User Story Summary: As the system, I want non-half decimal values rejected.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-003-US-009-TC-001 | POST rejects non-half decimal rating 8.3 | API, Validation, Negative | Critical | FX-R003-A is loaded. | `POST /api/v1/ratings` body `{ "placeId": "place-001", "rating": 8.3 }`. | 1. Send request as `user-001`. 2. Inspect status and error body. 3. Query ratings for `(user-001, place-001)`. | Response status is `422 Validation Error`; error details identify `rating`; zero rating rows exist for `(user-001, place-001)`; error body contains no private notes, stack trace, SQL details, tokens, hidden metadata, or audit/debug fields. | RATING-003-US-009 | Yes | API | Smoke. |

## RATING-003-US-010 - Reject null rating

User Story ID: `RATING-003-US-010`

User Story Title: Reject null rating

User Story Summary: As the system, I want null ratings rejected.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-003-US-010-TC-001 | POST rejects null rating | API, Validation, Negative | Critical | FX-R003-A is loaded. | `POST /api/v1/ratings` body `{ "placeId": "place-001", "rating": null }`. | 1. Send request as `user-001`. 2. Inspect status and error body. 3. Query ratings for `(user-001, place-001)`. | Response status is `422 Validation Error`; error details identify `rating`; zero rating rows exist for `(user-001, place-001)`; error body contains no private notes, stack trace, SQL details, tokens, hidden metadata, or audit/debug fields. | RATING-003-US-010 | Yes | API | Smoke. |

## RATING-003-US-011 - Reject string rating

User Story ID: `RATING-003-US-011`

User Story Title: Reject string rating

User Story Summary: As the system, I want string ratings rejected.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-003-US-011-TC-001 | POST rejects string rating 8.5 | API, Validation, Negative | Critical | FX-R003-A is loaded. | `POST /api/v1/ratings` body `{ "placeId": "place-001", "rating": "8.5" }`. | 1. Send request as `user-001`. 2. Inspect status and error body. 3. Query ratings for `(user-001, place-001)`. | Response status is `422 Validation Error`; error details identify `rating`; zero rating rows exist for `(user-001, place-001)`; accepted payloads remain numeric only; error body contains no private notes, stack trace, SQL details, tokens, hidden metadata, or audit/debug fields. | RATING-003-US-011 | Yes | API | Smoke. Source requires numeric accepted payloads. |

## RATING-003-US-012 - Reject nonnumeric rating

User Story ID: `RATING-003-US-012`

User Story Title: Reject nonnumeric rating

User Story Summary: As the system, I want nonnumeric ratings rejected.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-003-US-012-TC-001 | POST rejects nonnumeric JSON values | API, Validation, Negative | Critical | FX-R003-A is loaded and reset before each iteration. | Parameterized request bodies: `{ "placeId": "place-001", "rating": "bad" }`, `{ "placeId": "place-001", "rating": {} }`, `{ "placeId": "place-001", "rating": [] }`. | 1. Send each request as `user-001`. 2. Inspect status and error body. 3. Query ratings for `(user-001, place-001)` after each request. | Each request returns `422 Validation Error`; error details identify `rating`; zero rating rows exist for `(user-001, place-001)` after each iteration; error body contains no private notes, stack trace, SQL details, tokens, hidden metadata, or audit/debug fields. | RATING-003-US-012 | Yes | API | Smoke. Uses JSON-representable nonnumeric values. |

## Invalid Rating Matrix

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-003-MATRIX-TC-003 | POST rejects complete invalid rating matrix | API, Validation, Negative, Boundary | Critical | FX-R003-A is loaded and reset before each iteration. | Parameterized values: `0`, `0.5`, `10.5`, `8.25`, `8.3`, `-1`, `11`, `null`, `"8.5"`, `"bad"`, `{}`, `[]`; request body `{ "placeId": "place-001", "rating": <value> }`. | 1. Send one `POST /api/v1/ratings` request per value as `user-001`. 2. Inspect status and error body for each iteration. 3. Query ratings for `(user-001, place-001)`. | Every listed value returns `422 Validation Error`; error details identify `rating`; zero rating rows exist for `(user-001, place-001)` after each iteration; error bodies contain no private notes, stack traces, SQL details, tokens, hidden metadata, or audit/debug fields. | RATING-003-US-005; RATING-003-US-006; RATING-003-US-007; RATING-003-US-008; RATING-003-US-009; RATING-003-US-010; RATING-003-US-011; RATING-003-US-012 | Yes | API | Nightly parameterized matrix. |
| RATING-003-MATRIX-TC-004 | PATCH rejects complete invalid rating matrix without changing existing row | API, Validation, Negative, Boundary | Critical | FX-R003-B is loaded and reset to `rating-001.rating=6` before each iteration. | Parameterized values: `0`, `0.5`, `10.5`, `8.25`, `8.3`, `-1`, `11`, `null`, `"8.5"`, `"bad"`, `{}`, `[]`; request body `{ "rating": <value>, "notes": null }`. | 1. Send one `PATCH /api/v1/ratings/place-001` request per value as `user-001`. 2. Inspect status and error body for each iteration. 3. Query `rating-001`. | Every listed value returns `422 Validation Error`; error details identify `rating`; `rating-001.rating` remains `6` after each iteration; exactly one rating row exists for `(user-001, place-001)`; error bodies contain no private notes, stack traces, SQL details, tokens, hidden metadata, or audit/debug fields. | RATING-003-US-005; RATING-003-US-006; RATING-003-US-007; RATING-003-US-008; RATING-003-US-009; RATING-003-US-010; RATING-003-US-011; RATING-003-US-012 | Yes | API | Nightly parameterized matrix. |

## RATING-003-US-013 - Enforce database rating constraint

User Story ID: `RATING-003-US-013`

User Story Title: Enforce database rating constraint

User Story Summary: As the system, I want DB constraints to match API validation.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-003-US-013-TC-001 | Direct persistence rejects invalid scale values | Data Integrity, Validation, Negative, Integration | Critical | FX-R003-C is loaded; each attempted write runs in an isolated transaction. | Direct insert/update attempts into `ratings.rating`: `0`, `0.5`, `10.5`, `8.25`, `8.3`, `-1`, `11`. | 1. Bypass API and attempt to persist each value directly through the DB integration harness. 2. Capture database constraint result. 3. Roll back each failed transaction. 4. Query ratings table for invalid rows. | Each direct persistence attempt is rejected by the database constraint; no row with an invalid `rating` value exists after rollback; valid existing rows remain unchanged. | RATING-003-US-013 | Yes | DB Integration | Smoke. Source: FEATURE_TRACEABILITY `ratings` constraint. |
| RATING-003-US-013-TC-002 | Direct persistence accepts representative valid scale values | Data Integrity, Validation, Positive, Integration | High | FX-R003-C is loaded; each attempted write runs in an isolated transaction. | Direct insert/update attempts into `ratings.rating`: `1`, `1.5`, `8.5`, `10`. | 1. Bypass API and attempt to persist each value directly through the DB integration harness. 2. Query the written row inside the transaction. 3. Roll back transaction before the next value. | Each representative valid value is accepted by the database constraint; queried row has the submitted numeric value; rollback leaves fixture state unchanged. | RATING-003-US-013 | Yes | DB Integration | Regression. |

## RATING-003-US-014 - Display ratings consistently

User Story ID: `RATING-003-US-014`

User Story Title: Display ratings consistently

User Story Summary: As a user, I want ratings formatted consistently in RTL UI.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-003-US-014-TC-001 | RTL UI formats decimal rating with Western digits and LTR isolation | UI, Accessibility, Localization, RTL | High | FX-R003-D is loaded and `8.5` is selected or returned by API. | Visible rating value `8.5/10`; Arabic place name `مطعم الرياض`. | 1. Render the rating control in RTL UI. 2. Inspect visible text. 3. Inspect computed direction or bidi isolation wrapper for the numeric text. 4. Inspect accessibility tree. | The visible string is `8.5/10`; digits are Western `0-9`; decimal separator is `.`; numeric value is LTR-isolated so Arabic text order remains stable; accessible name includes value and total scale. | RATING-003-US-014 | Yes | UI E2E | Source: RATING-003-US-014, RESP-004-US-003, RESP-004-US-004, RESP-004-US-009, A11Y-002-US-013. |

## RATING-003-US-015 - Keyboard rating selection

User Story ID: `RATING-003-US-015`

User Story Title: Keyboard rating selection

User Story Summary: As a keyboard user, I want to select valid rating values without a mouse.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-003-US-015-TC-001 | Keyboard reaches every supported half-step and excludes invalid values | Accessibility, UI, Validation | High | FX-R003-D is loaded; rating control has focus-visible support. | Valid values `1.0` through `10.0` in `0.5` increments; invalid values `0`, `0.5`, `8.25`, `8.3`, `10.5`. | 1. Tab to the rating control. 2. Use the documented keyboard model for the implemented pattern. 3. Traverse the full scale. 4. Attempt to reach values between half steps. | Focus reaches the rating control with visible focus; keyboard traversal reaches exactly 19 selectable values from `1.0` through `10.0` in `0.5` increments; `0`, `0.5`, `8.25`, `8.3`, and `10.5` are not selectable. | RATING-003-US-015 | Yes | Accessibility | Source: A11Y-002-US-001 through A11Y-002-US-005. |

## RATING-003-US-016 - Announce selected rating state

User Story ID: `RATING-003-US-016`

User Story Title: Announce selected rating state

User Story Summary: As a screen-reader user, I want selected rating state announced.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-003-US-016-TC-001 | Screen reader exposes selected rating and total scale | Accessibility, UI | High | FX-R003-D is loaded. | Select value `8.5`. | 1. Select `8.5` using the rating control. 2. Move focus to the selected value/control. 3. Inspect accessibility snapshot and screen-reader announcement checklist. | Assistive technology can determine the selected value as `8.5/10`; selected state is conveyed semantically and not only by color; accessible label includes value and scale context such as `8.5 من 10`. | RATING-003-US-016 | Yes | Accessibility | Source: A11Y-002-US-006, A11Y-002-US-007, A11Y-002-US-008. |

## RATING-003-US-017 - Maintain touch target size

User Story ID: `RATING-003-US-017`

User Story Title: Maintain touch target size

User Story Summary: As a mobile user, I want rating controls easy to tap.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-003-US-017-TC-001 | Rating targets meet mobile hit-area and no-overflow requirements | Accessibility, Responsive, Mobile, UI | High | FX-R003-D is loaded. | Viewports `320x568`, `390x844`, `430x932`; rating control values `1.0` through `10.0`. | 1. Render rating UI at each viewport. 2. Measure each interactive rating target. 3. Check page overflow. 4. Tap representative values `1`, `8.5`, and `10`. | Every interactive rating target has at least a `44x44` CSS pixel hit area; `document.documentElement.scrollWidth <= window.innerWidth`; values remain tappable at `320x568`, `390x844`, and `430x932`. | RATING-003-US-017 | Yes | Accessibility | Source: RATING-003-US-017, RESP-002-US-001, RESP-002-US-002, A11Y-002-US-010, A11Y-002-US-011. |

## Supplemental Production Coverage

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-003-API-TC-001 | Success response contract excludes extra fields | API, Contract, Security | High | FX-R003-A is loaded. | `POST /api/v1/ratings` body `{ "placeId": "place-001", "rating": 8.5 }`. | 1. Send request as `user-001`. 2. Recursively inspect response JSON. | Response status is `201 Created`; top-level fields are exactly `id`, `userId`, `placeId`, `rating`, `notes`, `createdAt`, `updatedAt`; `rating=8.5`; response contains no aggregate fields, rating history, hidden metadata, audit/debug fields, stack trace, SQL details, token, or other users' data. | RATING-003-US-003 | Yes | API | Regression. Source: RatingResponse contract. |
| RATING-003-A11Y-TC-001 | Validation error is announced for invalid rating | Accessibility, UI, Validation, Negative | High | FX-R003-D is loaded. | Submit invalid value `8.25` through an injected UI state or API-backed validation path. | 1. Trigger rating validation failure for `8.25`. 2. Inspect active element, error association, and live/status region. | No save success state is shown; validation text is associated with the rating control; focus moves to the rating control or an error summary that targets it; screen reader can announce the rating validation error. | RATING-003-US-008 | Yes | Accessibility | Source: RATING-003-US-008, A11Y-001-US-014, A11Y-001-US-015, A11Y-002-US-014. |
| RATING-003-RESP-TC-001 | Rating control remains usable at 200% zoom and forced-colors/reduced-motion modes | Accessibility, Responsive, UI | High | FX-R003-D is loaded. | 200% browser zoom; `prefers-reduced-motion: reduce`; forced-colors mode. | 1. Enable each mode. 2. Render the rating UI. 3. Select `8.5` by keyboard and pointer. 4. Inspect overflow and selected/focus state visibility. | At 200% zoom, rating control remains keyboard and pointer operable; no values are clipped; `document.documentElement.scrollWidth <= window.innerWidth`; reduced-motion mode keeps state feedback available; forced-colors mode keeps rating values, selected state, focus, and disabled state distinguishable. | RATING-003-US-015 | Yes | Accessibility | Source: RESP-003-US-001, RESP-003-US-002, RESP-003-US-003, A11Y-002-US-012, A11Y-002-US-016, A11Y-002-US-017. |
| RATING-003-CLAR-TC-001 | Clarify raw NaN and infinity transport behavior | Requirement Clarification | Medium | API schema and JSON parser behavior are under review. | Raw JSON-invalid tokens such as `NaN`, `Infinity`, and `-Infinity`. | 1. Review API/parser documentation. 2. Decide whether malformed JSON returns parser-level error or validation-level `422`. 3. Add executable transport tests only after the status and schema are documented. | Clarification records that JSON-representable nonnumeric values are executable in RATING-003-US-012; raw non-JSON numeric tokens remain non-executable until their transport-level status is documented. | RATING-003-US-012 | No | Requirement Clarification | Preserves requirement fidelity. |
| RATING-003-CLAR-TC-002 | Clarify single-resource response envelope terminology | Requirement Clarification | Medium | Current source defines `RatingResponse` exactly. | Potential wording conflict: `response envelope` versus single `RatingResponse`. | 1. Review current Ratings source and API docs. 2. Confirm whether any wrapper is planned for single-rating responses. 3. Update tests only if source requirements change. | Clarification records that current executable tests assert the exact `RatingResponse` object and do not invent a `{ data, meta }` wrapper for rating create/update responses. | RATING-003-US-003 | No | Requirement Clarification | Aligns with RATING-001/RATING-002 response contract. |

## Final Summary

- User Stories Processed: 17
- Executable Test Cases: 26
- Clarification Cases: 2
- Manual Cases: 0
- Traceability Cases: 0
- Total Test Cases: 28

### Count By Test Type

- Accessibility: 8
- API: 17
- Boundary: 7
- Contract: 1
- Data Integrity: 2
- DB Integration: 2
- Integration: 2
- Localization: 1
- Mobile: 1
- Negative: 12
- Positive: 8
- Requirement Clarification: 2
- Responsive: 2
- RTL: 1
- Security: 1
- UI: 7
- Validation: 20

### Count By Priority

- Critical: 18
- High: 8
- Medium: 2

### Count By Automation Layer

- Accessibility: 6
- API: 17
- DB Integration: 2
- Requirement Clarification: 2
- UI E2E: 1

### Top Automation Candidates

- Complete POST valid rating matrix.
- Complete PATCH valid rating matrix.
- Complete POST/PATCH invalid rating matrix.
- Direct DB constraint validation for invalid rating values.
- Keyboard and screen-reader rating control certification.
- 320px / 390px / 430px / 200% zoom rating-control responsive certification.

## Validation

- Duplicate Test IDs = 0
- Invalid Story References = 0
- Missing User Stories = 0
- Encoding/Mojibake = 0
- API Tests Missing Status Codes = 0
- Requirement Fidelity Violations = 0
- Feature Ownership Violations = 0
- Generic Executable Wording = 0
