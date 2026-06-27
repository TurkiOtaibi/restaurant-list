# RATING-002 Test Cases

Feature: `RATING-002 - Update existing rating`

Feature Description: Rating owners can update an existing rating using `PATCH /api/v1/ratings/{place_id}`.

Primary Source: `docs/user-stories/RATINGS_USER_STORIES.md`

Supporting Sources:

- `docs/feature-map/FEATURE_TRACEABILITY.md`
- `docs/user-stories/RATING-001_TEST_CASES.md`
- `docs/user-stories/RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`

## QA Execution Standards

- Executable tests validate only `RATING-002`, `FEATURE_TRACEABILITY.md`, or approved global `RESP-*` / `A11Y-*` requirements.
- `RATING-002` executable ownership is limited to updating existing current-user ratings, update validation, update authorization, update response, and privacy-safe update behavior.
- Creating ratings is owned by `RATING-001`; POST upsert safety is owned by `RATING-009`; aggregate arithmetic and formatting are owned by `RATING-008`; first-rating list cleanup is owned by `RATING-006`; broad private-note visibility across non-owner surfaces is owned by `RATING-004`.
- Current source requirements define `PATCH /api/v1/ratings/{place_id}` as the edit endpoint when an existing current-user rating is known.
- `PATCH /api/v1/ratings/{place_id}` returns `200 OK` when it updates an existing current-user rating and must never create a new rating.
- Documented update error statuses are `401 Unauthorized`, `403 Forbidden` where distinguishable from not-found behavior, `404 Not Found` for missing referenced place or missing existing current-user rating, and `422 Validation Error`.
- `RatingResponse` fields are exactly `id`, `userId`, `placeId`, `rating`, `notes`, `createdAt`, and `updatedAt`.
- Forbidden fields in RATING-002 responses and DOM include other users' private notes, hidden metadata, audit/debug fields, stack traces, SQL details, tokens, undocumented internal identifiers, aggregate-only fields, deletion history, rating history, and recommendation data.

## Deterministic Fixture Matrix

| Fixture ID | User / Session | Database State | UI Context | Expected Baseline |
|---|---|---|---|---|
| FX-R002-A | `user-001` authenticated | Place `place-001` exists with name `مطعم الرياض`, type `restaurant`, subtype `burger`; existing rating `rating-001` has `userId=user-001`, `placeId=place-001`, `rating=6`, `notes="برجر جيد"`, `createdAt=2026-06-01T10:00:00Z`, `updatedAt=2026-06-01T10:00:00Z`. | Place Detail route `/places/place-001`; rating action opens edit flow. | Edit flow can load `rating=6` and private note `برجر جيد` for `user-001` only. |
| FX-R002-B | Guest with no access token | Same place and rating exist. | Guest attempts edit route/action or direct PATCH. | Protected edit data is blocked; no rating mutation occurs. |
| FX-R002-C | `user-002` authenticated | Place `place-001` exists; `rating-001` belongs to `user-001`; no rating exists for `(user-002, place-001)`. | `user-002` attempts `PATCH /api/v1/ratings/place-001`. | `user-002` cannot update `user-001` rating or see `user-001` private note. |
| FX-R002-D | `user-001` authenticated | Place `place-002` exists with name `قهوة المساء`, type `cafe`, subtype `specialty`; no rating exists for `(user-001, place-002)`. | Direct PATCH for missing current-user rating. | PATCH must not create a rating row. |
| FX-R002-E | `user-001` authenticated | Same as FX-R002-A; API error injection enabled for `PATCH /api/v1/ratings/place-001`. | Edit flow open with unsaved changes. | Failed update keeps attempted rating/note visible and leaves persisted row unchanged. |
| FX-R002-F | `user-001` authenticated | Place `place-404` does not exist; no rating exists for `(user-001, place-404)`. | Direct PATCH for missing place. | Missing referenced place is rejected without mutation. |

## API Contract Expectations

Successful update response body is the documented single `RatingResponse` object:

```json
{
  "id": "rating-001",
  "userId": "user-001",
  "placeId": "place-001",
  "rating": 9,
  "notes": "قهوة ممتازة",
  "createdAt": "2026-06-01T10:00:00Z",
  "updatedAt": "2026-06-26T11:00:00Z"
}
```

Validation, auth, forbidden, and not-found errors must use the documented structured error behavior: correct HTTP status, field-level details where applicable, and no stack traces, SQL details, private notes, tokens, or debug metadata.

## RATING-002-US-001 - Open edit rating flow

User Story ID: `RATING-002-US-001`

User Story Title: Open edit rating flow

User Story Summary: As a rating owner, I want to open my existing rating so that I can update it.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-002-US-001-TC-001 | Open edit flow with existing rating loaded | UI, Integration | Critical | FX-R002-A is loaded. | Existing `rating-001`: rating `6`, notes `برجر جيد`. | 1. Open `/places/place-001` as `user-001`. 2. Activate the rating action for an already-rated place. 3. Inspect edit dialog/sheet fields before saving. | Edit flow opens for `place-001`; selected rating is `6`; note field value is `برجر جيد`; no `PATCH /api/v1/ratings/place-001` request is sent before Save. | RATING-002-US-001 | Yes | UI E2E | Smoke. Source: RATING-002-US-001. |
| RATING-002-US-001-TC-002 | Edit flow exposes only current user's private note | UI, Privacy | Critical | FX-R002-A is loaded with another user's rating note seeded for the same place. | `user-002` note value `private competitor note` exists outside current-user context. | 1. Open edit flow as `user-001`. 2. Inspect visible form fields, DOM text, and accessibility tree. | Edit form contains only `user-001` note `برجر جيد`; `private competitor note`, other user IDs, hidden metadata, and debug fields are absent from DOM and accessibility tree. | RATING-002-US-001 | Yes | Security | Regression. Source: RATING-002-US-001 and shared note privacy rules. |

## RATING-002-US-002 - Prefer PATCH for known edits

User Story ID: `RATING-002-US-002`

User Story Title: Prefer PATCH for known edits

User Story Summary: As Product, I want edit flows to use PATCH so that create and edit semantics stay clear.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-002-US-002-TC-001 | Known edit flow submits PATCH rather than POST | UI, API, Integration | Critical | FX-R002-A is loaded and edit flow is open. | New rating `9`; new note `قهوة ممتازة`. | 1. Select rating `9`. 2. Enter note `قهوة ممتازة`. 3. Save. 4. Capture network requests. | Exactly one write request is sent: `PATCH /api/v1/ratings/place-001` with payload `{ "rating": 9, "notes": "قهوة ممتازة" }`; response status is `200 OK`; no `POST /api/v1/ratings` request is sent. | RATING-002-US-002 | Yes | UI E2E | Smoke. Source: RATING-002-US-002. |
| RATING-002-US-002-TC-002 | Direct PATCH update succeeds for existing current-user rating | API, Data Integrity | Critical | FX-R002-A is loaded. | `PATCH /api/v1/ratings/place-001` body `{ "rating": 9, "notes": "قهوة ممتازة" }`. | 1. Send the request as `user-001`. 2. Inspect status and response. 3. Query rating row by `rating-001`. | Response status is `200 OK`; persisted `rating-001` remains the same row; `rating=9`; `notes="قهوة ممتازة"`; `userId="user-001"`; `placeId="place-001"`; exactly one rating row exists for `(user-001, place-001)`. | RATING-002-US-002 | Yes | API | Regression. Source: RATING-002-US-002, RATING-002-US-006. |

## RATING-002-US-003 - Require authentication to edit

User Story ID: `RATING-002-US-003`

User Story Title: Require authentication to edit

User Story Summary: As the system, I want only authenticated users editing ratings.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-002-US-003-TC-001 | Guest PATCH is rejected | API, Negative, Security | Critical | FX-R002-B is loaded. | `PATCH /api/v1/ratings/place-001` body `{ "rating": 9, "notes": "edited" }` with no bearer token. | 1. Send the request. 2. Inspect status and structured error. 3. Query `rating-001`. | Response status is `401 Unauthorized`; `rating-001` remains `rating=6`, `notes="برجر جيد"`, `updatedAt=2026-06-01T10:00:00Z`; error payload contains no private note, stack trace, SQL details, token value, hidden metadata, or debug fields. | RATING-002-US-003 | Yes | API | Smoke. Source: RATING-002-US-003. |
| RATING-002-US-003-TC-002 | Expired session blocks edit without private-data flash | UI, Security, Privacy | Critical | FX-R002-A starts loading, then access token expires before edit context resolves. | Attempt to open and save edit for `place-001`. | 1. Open `/places/place-001` as `user-001`. 2. Expire the session before rating action resolves. 3. Activate rating action. 4. Inspect UI, DOM, accessibility tree, and network log. | UI resolves to sign-in/denial state; no PATCH succeeds; `برجر جيد`, other private notes, rating IDs, tokens, and hidden user data are absent from DOM and accessibility tree before denial. | RATING-002-US-003 | Yes | Security | Regression. Source: RATING-002-US-003 and auth privacy rules. |

## RATING-002-US-004 - Owner-only edit

User Story ID: `RATING-002-US-004`

User Story Title: Owner-only edit

User Story Summary: As the system, I want only the rating owner to edit a rating so that users cannot change others' logs.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-002-US-004-TC-001 | Non-owner PATCH cannot update another user's rating | API, Security, Privacy | Critical | FX-R002-C is loaded. | `PATCH /api/v1/ratings/place-001` body `{ "rating": 9, "notes": "غير مصرح" }` as `user-002`. | 1. Send the request as `user-002`. 2. Inspect HTTP status and error payload. 3. Query `rating-001` as test harness. | Response status is `404 Not Found`; `rating-001` remains owned by `user-001` with `rating=6`, `notes="برجر جيد"`, and unchanged timestamps; error payload does not expose `user-001`, `rating-001`, `برجر جيد`, stack traces, SQL details, or debug fields. | RATING-002-US-004 | Yes | API | Smoke. Source: RATING-002-US-004 and RATING-002-US-005 privacy-preserving not-found path. |
| RATING-002-US-004-TC-002 | Clarify distinguishable 403 versus privacy-preserving 404 policy | Requirement Clarification | Medium | Source allows `403` where distinguishable from not-found and privacy-preserving not-found behavior. | Non-owner update attempt. | 1. Review implementation/API contract. 2. Confirm whether PATCH by `place_id` always uses privacy-preserving `404` for non-owner/no-current-user rating. 3. Update executable status expectation if product selects `403`. | Requirement clarification records the status-policy decision; current executable coverage uses deterministic `404 Not Found` for the PATCH-by-place current-user-rating contract. | RATING-002-US-004 | No | Requirement Clarification | Prevents nondeterministic “403 or 404” executable wording. |

## RATING-002-US-005 - PATCH missing existing rating

User Story ID: `RATING-002-US-005`

User Story Title: PATCH missing existing rating

User Story Summary: As an API consumer, I want PATCH to fail if no current-user rating exists so that edits never create rows.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-002-US-005-TC-001 | PATCH missing current-user rating returns 404 and creates no row | API, Validation, Negative | Critical | FX-R002-D is loaded. | `PATCH /api/v1/ratings/place-002` body `{ "rating": 8, "notes": "new note" }`. | 1. Send the request as `user-001`. 2. Inspect status and error payload. 3. Query ratings for `(user-001, place-002)`. | Response status is `404 Not Found`; no rating row exists for `(user-001, place-002)` after the request; error payload contains no private note content, stack trace, SQL details, or debug fields. | RATING-002-US-005 | Yes | API | Smoke. Source: RATING-002-US-005. |
| RATING-002-US-005-TC-002 | PATCH missing place returns 404 and creates no row | API, Validation, Negative | High | FX-R002-F is loaded. | `PATCH /api/v1/ratings/place-404` body `{ "rating": 8, "notes": "new note" }`. | 1. Send the request as `user-001`. 2. Inspect status and error payload. 3. Query ratings for `place-404`. | Response status is `404 Not Found`; no rating row exists for `place-404`; error payload contains no private note content, stack trace, SQL details, or debug fields. | RATING-002-US-005 | Yes | API | Regression. Source: shared missing-place rule and RATING-002-US-005 no-create rule. |

## RATING-002-US-006 - Update rating value

User Story ID: `RATING-002-US-006`

User Story Title: Update rating value

User Story Summary: As a rating owner, I want to change my rating so that it reflects my current opinion.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-002-US-006-TC-001 | Update existing rating from 6 to 9 | API, Data Integrity | Critical | FX-R002-A is loaded. | `PATCH /api/v1/ratings/place-001` body `{ "rating": 9, "notes": "قهوة ممتازة" }`. | 1. Send the request as `user-001`. 2. Inspect status and response. 3. Query `rating-001`. | Response status is `200 OK`; row `rating-001` remains the only rating for `(user-001, place-001)`; stored `rating=9`; stored `notes="قهوة ممتازة"`; `userId` and `placeId` are unchanged. | RATING-002-US-006 | Yes | API | Smoke. Source: RATING-002-US-006. |
| RATING-002-US-006-TC-002 | Update to minimum valid rating succeeds | API, Boundary, Data Integrity | High | FX-R002-A is loaded. | `PATCH /api/v1/ratings/place-001` body `{ "rating": 1, "notes": "أقل تقييم" }`. | 1. Send the request as `user-001`. 2. Inspect response and persisted row. | Response status is `200 OK`; stored `rating=1`; stored `notes="أقل تقييم"`; exactly one rating row exists for `(user-001, place-001)`. | RATING-002-US-006 | Yes | API | Regression. Source: shared scale rule, RATING-003 traceability. |
| RATING-002-US-006-TC-003 | Update to maximum valid rating succeeds | API, Boundary, Data Integrity | High | FX-R002-A is loaded. | `PATCH /api/v1/ratings/place-001` body `{ "rating": 10, "notes": "أفضل تجربة" }`. | 1. Send the request as `user-001`. 2. Inspect response and persisted row. | Response status is `200 OK`; stored `rating=10`; stored `notes="أفضل تجربة"`; exactly one rating row exists for `(user-001, place-001)`. | RATING-002-US-006 | Yes | API | Regression. Source: shared scale rule, RATING-003 traceability. |
| RATING-002-US-006-TC-004 | Invalid non-half-step rating is rejected | API, Validation, Negative | Critical | FX-R002-A is loaded. | `PATCH /api/v1/ratings/place-001` body `{ "rating": 8.25, "notes": "invalid" }`. | 1. Send the request as `user-001`. 2. Inspect status and error details. 3. Query `rating-001`. | Response status is `422 Validation Error`; error details identify `rating`; persisted `rating-001` remains `rating=6`, `notes="برجر جيد"`, and `updatedAt=2026-06-01T10:00:00Z`; no second rating row is created. | RATING-002-US-006 | Yes | API | Smoke. Source: RATING-002 update validation plus RATING-003 scale rule. |
| RATING-002-US-006-TC-005 | Invalid out-of-range rating is rejected | API, Validation, Negative | Critical | FX-R002-A is loaded. | `PATCH /api/v1/ratings/place-001` body `{ "rating": 10.5, "notes": "invalid" }`. | 1. Send the request as `user-001`. 2. Inspect status and error details. 3. Query `rating-001`. | Response status is `422 Validation Error`; error details identify `rating`; persisted `rating-001` remains `rating=6`, `notes="برجر جيد"`, and `updatedAt=2026-06-01T10:00:00Z`; no second rating row is created. | RATING-002-US-006 | Yes | API | Regression. Source: RATING-002 update validation plus RATING-003 scale rule. |

## RATING-002-US-007 - Return RatingResponse on update

User Story ID: `RATING-002-US-007`

User Story Title: Return RatingResponse on update

User Story Summary: As an API consumer, I want the update response complete so that UI state is consistent.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-002-US-007-TC-001 | Update response has exact RatingResponse fields | API, Contract | Critical | FX-R002-A is loaded. | `PATCH /api/v1/ratings/place-001` body `{ "rating": 9, "notes": "قهوة ممتازة" }`. | 1. Send the request as `user-001`. 2. Recursively inspect response keys and values. | Response status is `200 OK`; response has exactly keys `id`, `userId`, `placeId`, `rating`, `notes`, `createdAt`, `updatedAt`; values include `id="rating-001"`, `userId="user-001"`, `placeId="place-001"`, `rating=9`, `notes="قهوة ممتازة"`; no `averageRating`, `ratingCount`, `removedFromListCount`, `history`, `debug`, `metadata`, or recommendation fields are present. | RATING-002-US-007 | Yes | API | Smoke. Source: RATING-002-US-007. |
| RATING-002-US-007-TC-002 | Validation error uses safe deterministic schema | API, Contract, Security | High | FX-R002-A is loaded. | `PATCH /api/v1/ratings/place-001` body `{ "rating": null, "notes": "private edit draft" }`. | 1. Send the request as `user-001`. 2. Inspect status and structured error body. | Response status is `422 Validation Error`; error body identifies `rating`; error body does not contain `private edit draft`, `برجر جيد`, stack traces, SQL details, tokens, hidden metadata, or audit/debug fields. | RATING-002-US-007 | Yes | API | Regression. Source: RATING-002-US-007, shared validation/error privacy rules. |

## RATING-002-US-008 - Preserve createdAt on edit

User Story ID: `RATING-002-US-008`

User Story Title: Preserve createdAt on edit

User Story Summary: As the system, I want original rating creation history preserved.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-002-US-008-TC-001 | Update preserves createdAt and row ID | API, Data Integrity | High | FX-R002-A is loaded. | `PATCH /api/v1/ratings/place-001` body `{ "rating": 9, "notes": "قهوة ممتازة" }`; test clock `2026-06-26T11:00:00Z`. | 1. Send the request as `user-001`. 2. Inspect response timestamps. 3. Query `rating-001`. | Response status is `200 OK`; response `id="rating-001"`; response `createdAt="2026-06-01T10:00:00Z"`; persisted row ID remains `rating-001`; no new rating row is created. | RATING-002-US-008 | Yes | API | Smoke. Source: RATING-002-US-008. |

## RATING-002-US-009 - Update updatedAt on edit

User Story ID: `RATING-002-US-009`

User Story Title: Update updatedAt on edit

User Story Summary: As the system, I want rating update history visible.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-002-US-009-TC-001 | Update changes updatedAt to edit timestamp | API, Data Integrity | High | FX-R002-A is loaded with test clock frozen at `2026-06-26T11:00:00Z`. | `PATCH /api/v1/ratings/place-001` body `{ "rating": 9, "notes": "قهوة ممتازة" }`. | 1. Send the request as `user-001`. 2. Inspect response timestamps. 3. Query `rating-001`. | Response status is `200 OK`; response `updatedAt="2026-06-26T11:00:00Z"`; persisted `updatedAt="2026-06-26T11:00:00Z"`; response `createdAt` remains `2026-06-01T10:00:00Z`. | RATING-002-US-009 | Yes | API | Smoke. Source: RATING-002-US-009. |

## RATING-002-US-010 - Update note

User Story ID: `RATING-002-US-010`

User Story Title: Update note

User Story Summary: As a rating owner, I want to edit my private note so that the archive stays accurate.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-002-US-010-TC-001 | Trim and save updated note | API, Data Integrity, Privacy | High | FX-R002-A is loaded. | `PATCH /api/v1/ratings/place-001` body `{ "rating": 8.5, "notes": "  قهوة ممتازة  " }`. | 1. Send the request as `user-001`. 2. Inspect response and persisted row. | Response status is `200 OK`; returned `notes="قهوة ممتازة"`; persisted `notes="قهوة ممتازة"`; surrounding spaces are absent; `rating=8.5`. | RATING-002-US-010 | Yes | API | Smoke. Source: RATING-002-US-010. |
| RATING-002-US-010-TC-002 | Save updated note at maximum documented length | API, Boundary, Data Integrity | High | FX-R002-A is loaded. | `PATCH /api/v1/ratings/place-001` body has `rating=8.5` and `notes` with exactly 1000 characters after trim. | 1. Send the request as `user-001`. 2. Inspect response and persisted row. | Response status is `200 OK`; returned `notes` length is exactly 1000 characters; persisted `notes` length is exactly 1000 characters; `rating-001` remains the only row for `(user-001, place-001)`. | RATING-002-US-010 | Yes | API | Regression. Source: RATING-002-US-010 and shared note rule. |
| RATING-002-US-010-TC-003 | Reject overlong updated note | API, Validation, Negative | High | FX-R002-A is loaded. | `PATCH /api/v1/ratings/place-001` body has `rating=8.5` and `notes` with 1001 characters after trim. | 1. Send the request as `user-001`. 2. Inspect status and error details. 3. Query `rating-001`. | Response status is `422 Validation Error`; error details identify `notes`; persisted `rating-001` remains `rating=6`, `notes="برجر جيد"`, and `updatedAt=2026-06-01T10:00:00Z`. | RATING-002-US-010 | Yes | API | Regression. Source: RATING-002-US-010 and RATING-004 note length rule. |

## RATING-002-US-011 - Clear note

User Story ID: `RATING-002-US-011`

User Story Title: Clear note

User Story Summary: As a rating owner, I want to remove my note so that blank notes are not stored as text.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-002-US-011-TC-001 | Whitespace-only note clears to null | API, Data Integrity | High | FX-R002-A is loaded. | `PATCH /api/v1/ratings/place-001` body `{ "rating": 6, "notes": "   " }`. | 1. Send the request as `user-001`. 2. Inspect response and persisted row. | Response status is `200 OK`; returned `notes=null`; persisted `notes=null`; no blank note text remains in `rating-001`. | RATING-002-US-011 | Yes | API | Smoke. Source: RATING-002-US-011. |
| RATING-002-US-011-TC-002 | Empty note clears to null | API, Data Integrity | Medium | FX-R002-A is loaded. | `PATCH /api/v1/ratings/place-001` body `{ "rating": 6, "notes": "" }`. | 1. Send the request as `user-001`. 2. Inspect response and persisted row. | Response status is `200 OK`; returned `notes=null`; persisted `notes=null`; no empty string is stored as note content. | RATING-002-US-011 | Yes | API | Regression. Source: shared notes rule. |

## RATING-002-US-012 - Prevent duplicate submit during edit

User Story ID: `RATING-002-US-012`

User Story Title: Prevent duplicate submit during edit

User Story Summary: As a user, I want edit save protected during submission.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-002-US-012-TC-001 | Repeated save during pending edit sends one PATCH | UI, Data Integrity | Medium | FX-R002-A is loaded and `PATCH /api/v1/ratings/place-001` response is delayed for 3 seconds. | New rating `9`; note `قهوة ممتازة`. | 1. Open edit flow. 2. Select rating `9`. 3. Enter note `قهوة ممتازة`. 4. Double-click Save or press Enter twice while request is pending. 5. Inspect network log and Save state. | Exactly one `PATCH /api/v1/ratings/place-001` request is sent; Save exposes disabled or busy state while pending; no second client submission is sent before the first request resolves. | RATING-002-US-012 | Yes | UI E2E | Smoke. Source: RATING-002-US-012, A11Y-002-US-015. |

## RATING-002-US-013 - Preserve input after edit failure

User Story ID: `RATING-002-US-013`

User Story Title: Preserve input after edit failure

User Story Summary: As a user, I want update failures recoverable without losing changes.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-002-US-013-TC-001 | Network failure preserves attempted edit draft | UI, Error Handling | High | FX-R002-E is loaded and PATCH fails with network error. | Attempted rating `9`; attempted note `قهوة ممتازة`. | 1. Open edit flow. 2. Select `9`. 3. Enter `قهوة ممتازة`. 4. Save. 5. Inspect visible state after failure. | Edit flow remains open; selected value remains `9`; note field remains `قهوة ممتازة`; persisted displayed data is not falsely changed to success state; no navigation back occurs. | RATING-002-US-013 | Yes | UI E2E | Smoke. Source: RATING-002-US-013. |
| RATING-002-US-013-TC-002 | 5xx edit failure leaves persisted row unchanged | UI, Error Handling, Data Integrity | High | FX-R002-E is loaded and PATCH returns `500`. | Attempted rating `9`; attempted note `قهوة ممتازة`. | 1. Open edit flow. 2. Select `9`. 3. Enter `قهوة ممتازة`. 4. Save. 5. Query `rating-001` after response. | Persisted `rating-001` remains `rating=6`, `notes="برجر جيد"`, and `updatedAt=2026-06-01T10:00:00Z`; error UI contains no stack trace, SQL details, note content echo, or debug fields. | RATING-002-US-013 | Yes | UI E2E | Regression. Source: RATING-002-US-013 and safe error requirements. |

## RATING-002-US-014 - Navigate back after edit success

User Story ID: `RATING-002-US-014`

User Story Title: Navigate back after edit success

User Story Summary: As a user, I want to return to Place Detail after editing so that I can see updated context.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-002-US-014-TC-001 | Successful edit returns to related Place Detail | UI, Integration | Critical | FX-R002-A is loaded. | PATCH payload `{ "rating": 9, "notes": "قهوة ممتازة" }`. | 1. Open edit flow from `/places/place-001`. 2. Update rating to `9` and note to `قهوة ممتازة`. 3. Save and allow `200 OK`. 4. Inspect final route and current-user context. | App returns to `/places/place-001`; edit flow is closed; current-user context on Place Detail reflects `rating=9`; place context refresh occurs after success. | RATING-002-US-014 | Yes | UI E2E | Smoke. Source: RATING-002-US-014 and PLACE-020-US-005/006. Aggregate arithmetic belongs to RATING-008. |
| RATING-002-US-014-TC-002 | Aggregate update after edit remains RATING-008 ownership | Traceability Verification | High | RATING-002 success returns to Place Detail. | Existing rating edited from `6` to `9`. | 1. Confirm RATING-008 package contains executable aggregate-after-edit tests. 2. Confirm RATING-002 checks return/refresh without average math. | Traceability exists from RATING-002 edit success to RATING-008 aggregate update coverage; this file does not assert average/rating-count arithmetic as RATING-002 executable ownership. | RATING-002-US-014 | No | Traceability Verification | Prevents aggregate ownership drift. |

## RATING-002-US-015 - Cancel edit without mutation

User Story ID: `RATING-002-US-015`

User Story Title: Cancel edit without mutation

User Story Summary: As a user, I want to cancel edit without saving.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-002-US-015-TC-001 | Cancel edit sends no PATCH and preserves persisted row | UI, Data Integrity | Medium | FX-R002-A is loaded and edit flow is open. | Unsaved rating `9`; unsaved note `قهوة ممتازة`. | 1. Select rating `9`. 2. Enter note `قهوة ممتازة`. 3. Activate Cancel. 4. Inspect network log and query `rating-001`. | Edit flow closes; no `PATCH /api/v1/ratings/place-001` request is sent; persisted `rating-001` remains `rating=6`, `notes="برجر جيد"`, and `updatedAt=2026-06-01T10:00:00Z`; focus returns to the rating trigger if it remains mounted. | RATING-002-US-015 | Yes | UI E2E | Smoke. Source: RATING-002-US-015, A11Y-001-US-006. |

## RATING-002-US-016 - Keep edit flow accessible and mobile-safe

User Story ID: `RATING-002-US-016`

User Story Title: Keep edit flow accessible and mobile-safe

User Story Summary: As a keyboard, screen-reader, or mobile user, I want edit rating usable.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-002-US-016-TC-001 | Edit dialog exposes modal semantics and initial focus | Accessibility, UI | High | FX-R002-A is loaded. | Edit flow opened from already-rated Place Detail action. | 1. Open edit flow. 2. Inspect accessibility tree. 3. Inspect active element. | Dialog/sheet exposes modal dialog semantics with accessible name; focus moves into the dialog/sheet; background content is not reachable through Tab while open. | RATING-002-US-016 | Yes | Accessibility | Smoke. Source: RATING-002-US-016, A11Y-001-US-001, A11Y-001-US-003, A11Y-001-US-004, A11Y-001-US-010. |
| RATING-002-US-016-TC-002 | Keyboard-only user updates rating | Accessibility, UI | High | FX-R002-A is loaded and edit flow is open. | Select rating `8.5` by keyboard and save. | 1. Tab to rating control. 2. Use documented keyboard command to select `8.5`. 3. Tab to Save and activate by keyboard. 4. Inspect network request and focus state. | Rating control receives visible `focus-visible`; selected value is `8.5`; exactly one `PATCH /api/v1/ratings/place-001` request is sent with `rating=8.5`; selected state is conveyed semantically and not color-only. | RATING-002-US-016 | Yes | Accessibility | Regression. Source: A11Y-002-US-001, A11Y-002-US-003, A11Y-002-US-006, A11Y-002-US-008, A11Y-002-US-009. |
| RATING-002-US-016-TC-003 | Validation error is announced and focuses invalid control | Accessibility, Validation, UI | High | FX-R002-A is loaded and edit flow is open. | Clear rating selection if UI permits; otherwise inject invalid client state before Save. | 1. Attempt Save with missing/invalid rating. 2. Inspect active element and accessibility tree. | No PATCH request is sent for client-side invalid state; validation error is associated with rating control; focus moves to the rating control or error summary targeting it; error is available through accessible text/live region. | RATING-002-US-016 | Yes | Accessibility | Regression. Source: A11Y-001-US-014, A11Y-001-US-015, A11Y-002-US-014. |
| RATING-002-US-016-TC-004 | Edit flow works at 320px and 390px | Responsive, Accessibility, UI | High | FX-R002-A is loaded. | Viewports `320x568` and `390x844`; edit flow open. | 1. Set viewport to `320x568`, open flow, inspect layout. 2. Set viewport to `390x844`, open flow, inspect layout. | At both viewports, `document.documentElement.scrollWidth <= window.innerWidth`; rating controls, note field, Save, and Cancel are visible or reachable; final action is not obscured by bottom navigation or safe-area padding. | RATING-002-US-016 | Yes | Accessibility | Smoke. Source: RATING-002-US-016, RESP-001-US-011, RESP-002-US-001, RESP-002-US-002, RESP-002-US-005, A11Y-002-US-011. |
| RATING-002-US-016-TC-005 | Edit flow works at 200% zoom | Responsive, Accessibility, UI | High | FX-R002-A is loaded. | Browser zoom `200%`; edit flow open. | 1. Set browser zoom to `200%`. 2. Open edit flow. 3. Navigate through controls by keyboard. | Rating controls, note field, Save, and Cancel reflow without clipping; focused control is not hidden behind fixed navigation; no horizontal overflow occurs. | RATING-002-US-016 | Yes | Accessibility | Smoke. Source: RATING-002-US-016, RESP-003-US-001, RESP-003-US-002, RESP-003-US-003, RESP-003-US-009, A11Y-002-US-012. |
| RATING-002-US-016-TC-006 | Edit note remains reachable with virtual keyboard | Responsive, Mobile, UI | High | FX-R002-A is loaded at `390x844`. | Note field focused; virtual keyboard emulation enabled. | 1. Open edit flow. 2. Focus note field. 3. Type `قهوة ممتازة`. 4. Inspect viewport and actions. | Focused note field remains visible; Save and Cancel are reachable through dialog/sheet scrolling; no horizontal overflow occurs. | RATING-002-US-016 | Yes | UI E2E | Regression. Source: RESP-002-US-009, RESP-002-US-010, RESP-002-US-011. |
| RATING-002-US-016-TC-007 | Edit flow supports reduced motion and forced colors | Accessibility, UI | Medium | FX-R002-A is loaded. | `prefers-reduced-motion: reduce`; forced-colors mode enabled in separate run. | 1. Enable reduced motion and open edit flow. 2. Select rating `8.5`. 3. Enable forced colors and inspect selected, disabled, error, and focus states. | Nonessential rating animation is reduced without removing state feedback; forced-colors mode keeps text, selected rating, disabled/busy state, validation error, and focus indicator distinguishable. | RATING-002-US-016 | Yes | Accessibility | Nightly. Source: RESP-003-US-014, RESP-003-US-015, RESP-003-US-016, RESP-003-US-017, A11Y-002-US-016, A11Y-002-US-017. |

## Supplemental Requirement-Supported Coverage

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-002-SEC-TC-001 | Updated rating responses exclude forbidden fields | Security, Privacy, API | Critical | FX-R002-A is loaded. | `PATCH /api/v1/ratings/place-001` body `{ "rating": 9, "notes": "قهوة ممتازة" }`. | 1. Send request as `user-001`. 2. Recursively inspect response JSON. 3. Inspect rendered DOM after success. | Response status is `200 OK`; response and DOM contain no other users' private notes, hidden metadata, audit/debug fields, stack traces, SQL details, tokens, aggregate-only fields, rating history, deletion metadata, or recommendation data; owner note appears only in the owner-only rating context. | RATING-002-US-007 | Yes | Security | Smoke. Source: RatingResponse and note privacy rules. |
| RATING-002-VAL-TC-001 | Full rating scale matrix remains RATING-003 ownership | Traceability Verification | High | RATING-002 update path uses shared rating validation. | Values `0`, `0.5`, `10.5`, `8.25`, `8.3`, string rating, nonnumeric rating. | 1. Confirm RATING-003 package contains executable validation matrix for valid and invalid values. 2. Confirm this file includes representative PATCH update enforcement without duplicating the full matrix. | Traceability exists from RATING-002 update validation to RATING-003 scale validation; RATING-002 includes representative PATCH enforcement only. | RATING-002-US-006 | No | Traceability Verification | Source: RATING-003 shared scale rules. |
| RATING-002-NOTE-TC-001 | Detailed note privacy surfaces remain RATING-004 ownership | Traceability Verification | High | RATING-002 updates private notes. | Places list, Place Detail non-owner, Public Lists, other users' profile/public data, aggregate responses, logs, error payloads. | 1. Confirm RATING-004 package contains non-owner and public-surface note privacy tests. 2. Confirm RATING-002 asserts safe update response/error behavior and current-owner edit context. | Traceability exists from RATING-002 note update to RATING-004 private-note visibility; this file does not duplicate all public-surface privacy tests. | RATING-002-US-010 | No | Traceability Verification | Source: RATING-004 note privacy rules. |
| RATING-002-CLEANUP-TC-001 | Update does not repeat first-rating cleanup remains RATING-006 ownership | Traceability Verification | High | Existing rating is updated after place was re-added to a list. | Re-added list membership for `place-001`. | 1. Confirm RATING-006 package contains executable tests for no cleanup on rating update. 2. Confirm RATING-002 does not assert list-membership cleanup mechanics. | Traceability exists from RATING-002 update to RATING-006 no-repeat-cleanup coverage; this file keeps executable scope to PATCH update behavior. | RATING-002-US-006 | No | Traceability Verification | Source: RATING-006-US-009. |
| RATING-002-POST-TC-001 | POST upsert update remains RATING-009 ownership | Traceability Verification | Medium | Existing rating exists for `(user-001, place-001)`. | Repeated `POST /api/v1/ratings` with valid payload. | 1. Confirm RATING-009 package covers POST update/upsert path and one-row guarantee. 2. Confirm RATING-002 edit-flow executable cases use PATCH. | Traceability exists from edit semantics to RATING-009 upsert safety; RATING-002 executable cases do not use POST for known edits. | RATING-002-US-002 | No | Traceability Verification | Source: RATING-009 upsert rules. |

## Final Summary

- User Stories Processed: 16
- Executable Test Cases: 36
- Clarification Cases: 1
- Manual Cases: 0
- Traceability Cases: 5
- Total Test Cases: 42

### Count By Test Type

- API: 21
- Accessibility: 6
- Boundary: 3
- Contract: 2
- Data Integrity: 13
- Error Handling: 2
- Integration: 3
- Mobile: 1
- Negative: 6
- Privacy: 5
- Requirement Clarification: 1
- Responsive: 3
- Security: 5
- Traceability Verification: 5
- UI: 16
- Validation: 6

### Count By Priority

- Critical: 14
- High: 22
- Medium: 6

### Count By Automation Layer

- API: 19
- Accessibility: 6
- Requirement Clarification: 1
- Security: 3
- Traceability Verification: 5
- UI E2E: 8

### Top Automation Candidates

- PATCH endpoint contract and exact `RatingResponse` fields.
- Valid update from `6` to `9` with one-row guarantee.
- Non-owner privacy-preserving denial.
- Missing current-user rating does not create a row.
- Duplicate-submit prevention while PATCH is pending.
- Edit failure preserves draft and persisted row.
- Keyboard-only edit and 320px/390px/200% responsive gates.

## Validation

- Duplicate Test IDs = 0
- Invalid Story References = 0
- Missing User Stories = 0
- Encoding/Mojibake = 0
- API Tests Missing Status Codes = 0
- Requirement Fidelity Violations = 0
- Feature Ownership Violations = 0
- Generic Executable Wording = 0
