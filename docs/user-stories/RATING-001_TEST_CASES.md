# RATING-001 Test Cases

Feature: `RATING-001 - Create rating`

Feature Description: Authenticated users can create a rating for a place from the rating dialog/page.

Primary Source: `docs/user-stories/RATINGS_USER_STORIES.md`

Supporting Sources:

- `docs/feature-map/FEATURE_TRACEABILITY.md`
- `docs/user-stories/PLACE_DETAILS_USER_STORIES.md`
- `docs/user-stories/RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`

## QA Execution Standards

- Executable tests validate only `RATING-001`, `FEATURE_TRACEABILITY.md`, or approved global `RESP-*` / `A11Y-*` requirements.
- `RATING-001` executable ownership is limited to creating ratings, required validation, persistence, successful creation response, privacy-safe creation, and documented create-flow UI behavior.
- Editing ratings, replacing existing ratings, aggregate calculation, first-rating list cleanup mechanics, rating history, and rating deletion are not executable RATING-001 ownership unless listed as traceability verification.
- Current source requirements define `POST /api/v1/ratings` as the create endpoint and `RatingResponse` as the single-rating response contract.
- `RatingResponse` fields are exactly `id`, `userId`, `placeId`, `rating`, `notes`, `createdAt`, and `updatedAt`.
- Documented error statuses for RATING-001 are `401 Unauthorized`, `404 Not Found`, and `422 Validation Error`.
- Forbidden fields in RATING-001 responses and DOM include other users' private notes, hidden metadata, audit/debug fields, stack traces, SQL details, tokens, undocumented internal identifiers, aggregate-only fields, deletion history, and rating history.

## Deterministic Fixture Matrix

| Fixture ID | User / Session | Database State | UI Context | Expected Baseline |
|---|---|---|---|---|
| FX-R001-A | `user-001` authenticated | Place `place-001` exists with name `مطعم الرياض`, type `restaurant`, subtype `burger`; no rating exists for `(user-001, place-001)`; `user-001` has owned lists `list-001` and `list-002` containing `place-001`; `user-002` has list `list-201` containing `place-001`. | Place Detail route `/places/place-001`; rating action label `قيم المكان`. | Create rating flow is available; no persisted current-user rating is preselected. |
| FX-R001-B | Guest with no access token | Same place exists; no authenticated user context. | Place Detail/rating entry attempted by guest. | UI blocks or prompts sign-in; protected rating POST returns `401 Unauthorized`. |
| FX-R001-C | `user-001` authenticated | Same as FX-R001-A; API error injection enabled for `POST /api/v1/ratings`. | Create rating dialog open with selected value and note draft. | Failed save keeps draft visible and creates no false success state. |
| FX-R001-D | `user-001` authenticated | Place `place-404` does not exist; no rating exists for `place-404`. | API validation context. | Missing referenced place is rejected with `404 Not Found`. |
| FX-R001-E | `user-001` authenticated | Place `place-002` exists with name `قهوة المساء`, type `cafe`, subtype `specialty`; no rating exists for `(user-001, place-002)`. | API note/privacy context. | Rating notes are owner-private and stored only on the current user's rating. |

## API Contract Expectations

Successful create response body is the documented single `RatingResponse` object:

```json
{
  "id": "rating-001",
  "userId": "user-001",
  "placeId": "place-001",
  "rating": 8,
  "notes": null,
  "createdAt": "2026-06-26T10:00:00Z",
  "updatedAt": "2026-06-26T10:00:00Z"
}
```

Validation, auth, and not-found error responses must follow the documented structured error behavior from the approved API/error requirements: correct HTTP status, safe field-level details where applicable, and no stack traces, SQL details, private notes, tokens, or debug metadata.

## RATING-001-US-001 - Open create rating flow

User Story ID: `RATING-001-US-001`

User Story Title: Open create rating flow

User Story Summary: As an authenticated user, I want to open the rating flow from a place so that I can log my experience.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-001-US-001-TC-001 | Open create flow for an unrated place | UI, Integration | Critical | FX-R001-A is loaded. | Place `place-001`; action `قيم المكان`. | 1. Open `/places/place-001` as `user-001`. 2. Activate `قيم المكان`. 3. Inspect dialog/sheet fields and network log before save. | Create rating flow opens for `place-001`; no `POST /api/v1/ratings` request is sent; no persisted rating value is selected; note field value is empty; save control is unavailable until a valid rating is selected. | RATING-001-US-001 | Yes | UI E2E | Smoke. Source: RATING-001-US-001, PLACE-020-US-001. |
| RATING-001-US-001-TC-002 | Create flow carries the correct place context | UI, Integration | Critical | FX-R001-A is loaded. | Place name `مطعم الرياض`, `placeId=place-001`. | 1. Open rating flow from `/places/place-001`. 2. Select rating `8`. 3. Save and capture the outbound request. | The only outbound create request is `POST /api/v1/ratings` with payload `{ "placeId": "place-001", "rating": 8 }`; no request contains `placeName` as the identifier. | RATING-001-US-001 | Yes | UI E2E | Regression. Source: RATING-001-US-001, FEATURE_TRACEABILITY ratings endpoint. |

## RATING-001-US-002 - Require authentication to create rating

User Story ID: `RATING-001-US-002`

User Story Title: Require authentication to create rating

User Story Summary: As the system, I want ratings tied to authenticated users so that logs have an owner.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-001-US-002-TC-001 | Guest create POST is rejected | API, Negative, Security | Critical | FX-R001-B is loaded. | `POST /api/v1/ratings` body `{ "placeId": "place-001", "rating": 8 }` with no bearer token. | 1. Send the request. 2. Inspect status and structured error. 3. Query ratings for `(user-001, place-001)` with test harness. | Response status is `401 Unauthorized`; no rating row is created; error payload contains no private notes, hidden metadata, stack trace, SQL details, token value, or debug fields. | RATING-001-US-002 | Yes | API | Smoke. Source: RATING-001-US-002. |
| RATING-001-US-002-TC-002 | Guest UI does not expose rating form data before denial | UI, Security, Privacy | Critical | FX-R001-B is loaded. | Guest opens `/places/place-001` and attempts `قيم المكان`. | 1. Open `/places/place-001` as guest. 2. Activate rating entry. 3. Inspect DOM and accessibility tree. | UI presents sign-in prompt or denial state; rating note field and save action are not rendered; DOM and accessibility tree contain no owner-only rating notes, user IDs, list names, tokens, or hidden rating data. | RATING-001-US-002 | Yes | Security | Regression. Source: RATING-001-US-002, PLACE-020-US-004. |
| RATING-001-US-002-TC-003 | Expired session blocks create without stale private-data flash | UI, Security, Privacy | High | User session token is expired after Place Detail shell starts loading. | Attempt to open create rating for `place-001`. | 1. Start authenticated Place Detail load. 2. Expire access token before rating action resolves. 3. Activate rating action. 4. Inspect rendered UI, DOM, and network log. | No `POST /api/v1/ratings` succeeds; UI resolves to sign-in/denial state; no private rating note, rating draft, list membership, or token value is present in DOM or accessibility tree before denial. | RATING-001-US-002 | Yes | Security | Nightly. Source: RATING-001-US-002 plus auth privacy requirement. |

## RATING-001-US-003 - Require valid place ID

User Story ID: `RATING-001-US-003`

User Story Title: Require valid place ID

User Story Summary: As the system, I want rating creation tied to an existing place so that orphan ratings are impossible.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-001-US-003-TC-001 | Missing placeId is rejected | API, Validation, Negative | Critical | FX-R001-A is loaded. | `POST /api/v1/ratings` body `{ "rating": 8 }`. | 1. Send the request as `user-001`. 2. Inspect HTTP status and error details. 3. Query ratings table for new rows created by this request. | Response status is `422 Validation Error`; error details identify `placeId`; no rating row is created; error payload contains no private notes or debug/internal fields. | RATING-001-US-003 | Yes | API | Smoke. Source: RATING-001-US-003. |
| RATING-001-US-003-TC-002 | Empty placeId is rejected | API, Validation, Negative | Critical | FX-R001-A is loaded. | `POST /api/v1/ratings` body `{ "placeId": "", "rating": 8 }`. | 1. Send the request as `user-001`. 2. Inspect HTTP status and error details. 3. Query ratings table for new rows created by this request. | Response status is `422 Validation Error`; error details identify `placeId`; no rating row is created; error payload contains no private notes or debug/internal fields. | RATING-001-US-003 | Yes | API | Regression. Source: RATING-001-US-003. |

## RATING-001-US-004 - Reject nonexistent place

User Story ID: `RATING-001-US-004`

User Story Title: Reject nonexistent place

User Story Summary: As the system, I want nonexistent places rejected so that ratings cannot reference invalid catalog records.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-001-US-004-TC-001 | Nonexistent place returns 404 | API, Validation, Negative | Critical | FX-R001-D is loaded. | `POST /api/v1/ratings` body `{ "placeId": "place-404", "rating": 8 }`. | 1. Send the request as `user-001`. 2. Inspect HTTP status and structured error. 3. Query ratings for `place-404`. | Response status is `404 Not Found`; no rating row exists for `place-404`; error payload contains no private notes, stack trace, SQL details, or debug fields. | RATING-001-US-004 | Yes | API | Smoke. Source: RATING-001-US-004. |

## RATING-001-US-005 - Require rating value

User Story ID: `RATING-001-US-005`

User Story Title: Require rating value

User Story Summary: As the system, I want a rating value required so that empty ratings are not stored.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-001-US-005-TC-001 | Missing rating is rejected | API, Validation, Negative | Critical | FX-R001-A is loaded. | `POST /api/v1/ratings` body `{ "placeId": "place-001" }`. | 1. Send the request as `user-001`. 2. Inspect HTTP status and error details. 3. Query ratings for `(user-001, place-001)`. | Response status is `422 Validation Error`; error details identify `rating`; no rating row is created; no first-rating side-effect is asserted in this RATING-001 case. | RATING-001-US-005 | Yes | API | Smoke. Source: RATING-001-US-005. |
| RATING-001-US-005-TC-002 | Null rating is rejected | API, Validation, Negative | Critical | FX-R001-A is loaded. | `POST /api/v1/ratings` body `{ "placeId": "place-001", "rating": null }`. | 1. Send the request as `user-001`. 2. Inspect HTTP status and error details. 3. Query ratings for `(user-001, place-001)`. | Response status is `422 Validation Error`; error details identify `rating`; no rating row is created; error payload contains no note content, stack trace, SQL details, or debug fields. | RATING-001-US-005 | Yes | API | Regression. Source: RATING-001-US-005. |
| RATING-001-US-005-TC-003 | Save without rating focuses rating validation | UI, Accessibility, Validation | High | FX-R001-A is loaded and create dialog is open with no selected rating. | Empty rating control; note draft `زيارة جيدة`. | 1. Enter note `زيارة جيدة`. 2. Activate Save without selecting rating. 3. Inspect visible validation and active element. | No `POST /api/v1/ratings` request is sent; validation text is associated with the rating control; focus moves to the rating control or error summary that targets it; note draft remains `زيارة جيدة`. | RATING-001-US-005 | Yes | Accessibility | Regression. Source: RATING-001-US-005, A11Y-001-US-014, A11Y-001-US-015, A11Y-002-US-014. |

## RATING-001-US-006 - Create rating successfully

User Story ID: `RATING-001-US-006`

User Story Title: Create rating successfully

User Story Summary: As an authenticated user, I want to save a rating so that the place is recorded in my archive.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-001-US-006-TC-001 | Create first rating with integer value | API, Data Integrity | Critical | FX-R001-A is loaded. | `POST /api/v1/ratings` body `{ "placeId": "place-001", "rating": 8 }`. | 1. Send the request as `user-001`. 2. Inspect status and response body. 3. Query ratings for `(user-001, place-001)`. | Response status is `201 Created`; response is a `RatingResponse` with `userId="user-001"`, `placeId="place-001"`, `rating=8`, `notes=null`; exactly one rating row exists for `(user-001, place-001)`. | RATING-001-US-006 | Yes | API | Smoke. Source: RATING-001-US-006. |
| RATING-001-US-006-TC-002 | Create first rating with valid half-step value | API, Data Integrity | Critical | FX-R001-A is loaded. | `POST /api/v1/ratings` body `{ "placeId": "place-001", "rating": 8.5 }`. | 1. Send the request as `user-001`. 2. Inspect status and response body. 3. Query ratings for `(user-001, place-001)`. | Response status is `201 Created`; response `rating` equals numeric `8.5`; exactly one rating row exists for `(user-001, place-001)`. | RATING-001-US-006 | Yes | API | Regression. Rating scale source: shared ratings rule and RATING-003 traceability. |
| RATING-001-US-006-TC-003 | Clarify unknown client-supplied system fields | Requirement Clarification | High | FX-R001-A is loaded. | Potential payload `{ "placeId": "place-001", "rating": 8, "id": "attacker-rating", "userId": "user-999", "createdAt": "2000-01-01T00:00:00Z" }`. | 1. Review source requirements for unknown or forbidden request fields. 2. Reconcile whether server rejects unknown fields with validation or ignores them. 3. Add executable coverage only after the contract is documented. | Requirement clarification records the expected handling of unknown client-supplied system fields; no executable RATING-001 assertion is made for reject-vs-ignore behavior until documented. | RATING-001-US-006 | No | Requirement Clarification | Prevents inventing request-shape behavior while preserving the security gap. |

## RATING-001-US-007 - Return RatingResponse on create

User Story ID: `RATING-001-US-007`

User Story Title: Return RatingResponse on create

User Story Summary: As an API consumer, I want the created rating response complete so that the UI can refresh state.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-001-US-007-TC-001 | Created rating response has exact documented fields | API, Contract | Critical | FX-R001-A is loaded. | `POST /api/v1/ratings` body `{ "placeId": "place-001", "rating": 8, "notes": "برجر ممتاز" }`. | 1. Send the request as `user-001`. 2. Recursively inspect response keys and values. | Response status is `201 Created`; response has exactly keys `id`, `userId`, `placeId`, `rating`, `notes`, `createdAt`, `updatedAt`; values are `userId="user-001"`, `placeId="place-001"`, `rating=8`, `notes="برجر ممتاز"`; no `averageRating`, `ratingCount`, `removedFromListCount`, `history`, `debug`, or `metadata` fields are present. | RATING-001-US-007 | Yes | API | Smoke. Source: RATING-001-US-007. |
| RATING-001-US-007-TC-002 | Validation error uses safe structured error contract | API, Contract, Security | High | FX-R001-A is loaded. | `POST /api/v1/ratings` body `{ "placeId": "place-001", "rating": null, "notes": "private draft" }`. | 1. Send the request as `user-001`. 2. Inspect HTTP status and error body. | Response status is `422 Validation Error`; error body contains a structured validation error for `rating`; error body does not contain `private draft`, stack traces, SQL details, tokens, hidden metadata, or audit/debug fields. | RATING-001-US-007 | Yes | API | Regression. Source: RATING-001-US-007 plus validation/error privacy rules. |

## RATING-001-US-008 - Create rating with optional note

User Story ID: `RATING-001-US-008`

User Story Title: Create rating with optional note

User Story Summary: As a user, I want to add an optional private note while rating so that I can remember context.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-001-US-008-TC-001 | Trim and save valid private note | API, Data Integrity, Privacy | High | FX-R001-E is loaded. | `POST /api/v1/ratings` body `{ "placeId": "place-002", "rating": 9, "notes": "  قهوة ممتازة  " }`. | 1. Send the request as `user-001`. 2. Inspect response body. 3. Query rating row for `(user-001, place-002)`. | Response status is `201 Created`; response `notes` equals `قهوة ممتازة`; persisted `notes` equals `قهوة ممتازة`; surrounding spaces are absent; note appears only on `user-001` rating response. | RATING-001-US-008 | Yes | API | Smoke. Source: RATING-001-US-008. |
| RATING-001-US-008-TC-002 | Save note at documented maximum length | API, Boundary, Data Integrity | High | FX-R001-E is loaded. | `POST /api/v1/ratings` body has `placeId="place-002"`, `rating=9`, and `notes` with exactly 1000 characters after trim. | 1. Send the request as `user-001`. 2. Inspect response and persisted row. | Response status is `201 Created`; returned `notes` length is exactly 1000 characters; exactly one rating row exists for `(user-001, place-002)`. | RATING-001-US-008 | Yes | API | Nightly. Source: RATING-001-US-008 and shared note rule. |
| RATING-001-US-008-TC-003 | Preserve mixed-language note content as plain private text | API, Localization, Privacy | Medium | FX-R001-E is loaded. | `POST /api/v1/ratings` body `{ "placeId": "place-002", "rating": 9.5, "notes": "قهوة 9/10 - cozy!" }`. | 1. Send the request as `user-001`. 2. Inspect response and persisted row. | Response status is `201 Created`; returned `notes` equals `قهوة 9/10 - cozy!`; persisted note text equals `قهوة 9/10 - cozy!`; response is plain JSON text and contains no HTML-rendered markup field, hidden metadata, or debug fields. | RATING-001-US-008 | Yes | API | Regression. Source: RATING-001-US-008; broad note-surface privacy remains RATING-004 traceability. |

## RATING-001-US-009 - Create rating without note

User Story ID: `RATING-001-US-009`

User Story Title: Create rating without note

User Story Summary: As a user, I want to rate without writing a note so that logging remains fast.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-001-US-009-TC-001 | Omitted note returns null | API, Data Integrity | High | FX-R001-A is loaded. | `POST /api/v1/ratings` body `{ "placeId": "place-001", "rating": 8 }`. | 1. Send the request as `user-001`. 2. Inspect response body and persisted row. | Response status is `201 Created`; response `notes` is `null`; persisted `notes` is `null`; exactly one rating row exists for `(user-001, place-001)`. | RATING-001-US-009 | Yes | API | Smoke. Source: RATING-001-US-009. |
| RATING-001-US-009-TC-002 | Empty note returns null | API, Data Integrity | Medium | FX-R001-A is loaded. | `POST /api/v1/ratings` body `{ "placeId": "place-001", "rating": 8, "notes": "" }`. | 1. Send the request as `user-001`. 2. Inspect response body and persisted row. | Response status is `201 Created`; response `notes` is `null`; persisted `notes` is `null`; exactly one rating row exists for `(user-001, place-001)`. | RATING-001-US-009 | Yes | API | Regression. Source: shared notes rule. |
| RATING-001-US-009-TC-003 | Whitespace-only note returns null | API, Data Integrity | Medium | FX-R001-A is loaded. | `POST /api/v1/ratings` body `{ "placeId": "place-001", "rating": 8, "notes": "   " }`. | 1. Send the request as `user-001`. 2. Inspect response body and persisted row. | Response status is `201 Created`; response `notes` is `null`; persisted `notes` is `null`; no whitespace-only note text is stored. | RATING-001-US-009 | Yes | API | Regression. Source: shared notes rule. |

## RATING-001-US-010 - Show first-rating consequence before save

User Story ID: `RATING-001-US-010`

User Story Title: Show first-rating consequence before save

User Story Summary: As a user, I want to know rating will not change my lists so that list organization remains predictable.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-001-US-010-TC-001 | First-rating consequence copy is visible before save | UI, UX | High | FX-R001-A is loaded and `user-001` has no rating for `place-001`. | Place `place-001` appears in `user-001` owned lists `list-001` and `list-002`. | 1. Open create rating flow for `place-001`. 2. Inspect visible explanatory text before selecting Save. 3. Inspect network log. | The flow displays copy stating that saving the first rating records only the rating and does not add or remove the place from the user's lists; no `POST /api/v1/ratings` request is sent by rendering the copy. | RATING-001-US-010 | Yes | UI E2E | Regression. Source: RATING-001-US-010. Rating/list independence belongs to RATING-006. |

## RATING-001-US-011 - Prevent duplicate submit during create

User Story ID: `RATING-001-US-011`

User Story Title: Prevent duplicate submit during create

User Story Summary: As a user, I want save protected during submission so that duplicate requests are not sent by repeated taps.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-001-US-011-TC-001 | Repeated save click sends one client submission | UI, Data Integrity | High | FX-R001-A is loaded; network response for `POST /api/v1/ratings` is delayed for 3 seconds. | Rating value `8`; note `برجر ممتاز`. | 1. Open create rating flow. 2. Select rating `8`. 3. Type note `برجر ممتاز`. 4. Double-click Save or press Enter twice while request is pending. 5. Inspect network log and button state. | Exactly one `POST /api/v1/ratings` request is sent; save control exposes disabled or busy state while pending; no second client submission is sent before the first request resolves. | RATING-001-US-011 | Yes | UI E2E | Smoke. Source: RATING-001-US-011, A11Y-002-US-015. |

## RATING-001-US-012 - Preserve input after create failure

User Story ID: `RATING-001-US-012`

User Story Title: Preserve input after create failure

User Story Summary: As a user, I want to retry after save failure without re-entering data.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-001-US-012-TC-001 | Network failure preserves rating and note draft | UI, Error Handling | High | FX-R001-C is loaded and `POST /api/v1/ratings` is forced to network failure. | Rating value `8.5`; note `قهوة ممتازة`. | 1. Open create rating flow. 2. Select `8.5`. 3. Enter note `قهوة ممتازة`. 4. Save. 5. Inspect visible state after failure. | Selected rating remains `8.5`; note field remains `قهوة ممتازة`; flow stays open; no success state appears; no navigation back to Place Detail occurs. | RATING-001-US-012 | Yes | UI E2E | Regression. Source: RATING-001-US-012. |
| RATING-001-US-012-TC-002 | Server 5xx failure creates no false persisted state | UI, Error Handling, Data Integrity | High | FX-R001-C is loaded and `POST /api/v1/ratings` returns `500`. | Rating value `8`; note `مطعم جيد`. | 1. Open create flow. 2. Select `8`. 3. Enter note `مطعم جيد`. 4. Save. 5. Query ratings table with test harness after response. | No rating row exists for `(user-001, place-001)`; selected rating and note draft remain visible; error UI contains no stack trace, SQL details, note content echo, or debug fields. | RATING-001-US-012 | Yes | UI E2E | Nightly. Source: RATING-001-US-012 plus safe error requirements. |

## RATING-001-US-013 - Navigate back after create success

User Story ID: `RATING-001-US-013`

User Story Title: Navigate back after create success

User Story Summary: As a user, I want to return to Place Detail after rating so that I can see updated context.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-001-US-013-TC-001 | Successful create returns to related Place Detail | UI, Integration | Critical | FX-R001-A is loaded. | `POST /api/v1/ratings` body `{ "placeId": "place-001", "rating": 8, "notes": null }`. | 1. Open create rating flow from `/places/place-001`. 2. Select `8`. 3. Save and allow `201 Created`. 4. Inspect final route and place context reload evidence. | App returns to `/places/place-001`; rating flow is closed; current-user context shows the user has rated `place-001`; place context reload occurs after success. | RATING-001-US-013 | Yes | UI E2E | Smoke. Source: RATING-001-US-013, PLACE-020-US-005, PLACE-020-US-006. Aggregate math belongs to RATING-008. |

## RATING-001-US-014 - Cancel create without mutation

User Story ID: `RATING-001-US-014`

User Story Title: Cancel create without mutation

User Story Summary: As a user, I want to cancel rating creation without saving.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-001-US-014-TC-001 | Cancel create sends no POST | UI, Data Integrity | Medium | FX-R001-A is loaded and create rating flow is open. | Selected rating `8.5`; note draft `آيس كريم ممتاز`. | 1. Select rating `8.5`. 2. Enter note `آيس كريم ممتاز`. 3. Activate Cancel. 4. Inspect network log and ratings table. | Rating flow closes; no `POST /api/v1/ratings` request is sent; no rating row exists for `(user-001, place-001)`; focus returns to the rating trigger if it remains mounted. | RATING-001-US-014 | Yes | UI E2E | Regression. Source: RATING-001-US-014, A11Y-001-US-006. |

## RATING-001-US-015 - Keep create dialog accessible

User Story ID: `RATING-001-US-015`

User Story Title: Keep create dialog accessible

User Story Summary: As a keyboard or screen-reader user, I want the create rating flow accessible.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-001-US-015-TC-001 | Rating dialog exposes modal semantics and initial focus | Accessibility, UI | High | FX-R001-A is loaded. | Create flow opened from `قيم المكان`. | 1. Open create rating flow. 2. Inspect accessibility tree. 3. Inspect active element. | Dialog/sheet exposes modal dialog semantics with accessible name; focus moves into the dialog/sheet on open; background is not reachable through Tab while open. | RATING-001-US-015 | Yes | Accessibility | Smoke. Source: RATING-001-US-015, A11Y-001-US-001, A11Y-001-US-003, A11Y-001-US-004, A11Y-001-US-010. |
| RATING-001-US-015-TC-002 | Rating control is keyboard operable and announced | Accessibility, UI | High | FX-R001-A is loaded and create flow is open. | Select rating `8.5` by keyboard. | 1. Tab to rating control. 2. Use documented keyboard command to select `8.5`. 3. Inspect visible focus and accessibility properties. | Rating control receives visible focus; selected value is `8.5`; accessible label includes value and scale context such as `8.5 من 10`; selected state is semantic and not color-only. | RATING-001-US-015 | Yes | Accessibility | Regression. Source: A11Y-002-US-001, A11Y-002-US-003, A11Y-002-US-006, A11Y-002-US-007, A11Y-002-US-008, A11Y-002-US-009. |
| RATING-001-US-015-TC-003 | Escape and Cancel close flow and restore focus | Accessibility, UI | High | FX-R001-A is loaded and create flow is open from `قيم المكان`. | No saved rating. | 1. Press Escape. 2. Reopen flow. 3. Activate Cancel. 4. Inspect focus after each close. | Flow closes without sending `POST /api/v1/ratings`; focus returns to the `قيم المكان` trigger after Escape and after Cancel. | RATING-001-US-015 | Yes | Accessibility | Regression. Source: RATING-001-US-015, A11Y-001-US-006, A11Y-001-US-008. |
| RATING-001-US-015-TC-004 | Pending save is announced accessibly | Accessibility, UI | Medium | FX-R001-A is loaded and `POST /api/v1/ratings` is delayed. | Rating `8`; note `مطعم`. | 1. Select rating `8`. 2. Save. 3. Inspect accessibility tree while request is pending. | Pending state is exposed with `aria-busy` or equivalent status; Save is disabled or busy; screen-reader-visible status communicates saving without relying only on animation. | RATING-001-US-015 | Yes | Accessibility | Nightly. Source: A11Y-001-US-016, A11Y-002-US-015. |

## RATING-001-US-016 - Keep mobile create flow usable

User Story ID: `RATING-001-US-016`

User Story Title: Keep mobile create flow usable

User Story Summary: As a mobile user, I want rating creation usable on small screens.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-001-US-016-TC-001 | Create flow is usable at 320px and 390px | Responsive, Accessibility, UI | High | FX-R001-A is loaded. | Viewports `320x568` and `390x844`; create flow open. | 1. Set viewport to `320x568`, open flow, inspect layout. 2. Set viewport to `390x844`, open flow, inspect layout. | At both viewports, `document.documentElement.scrollWidth <= window.innerWidth`; rating controls, note field, Save, and Cancel are visible or reachable without horizontal scrolling; final action is not obscured by bottom navigation or safe-area padding. | RATING-001-US-016 | Yes | Accessibility | Smoke. Source: RATING-001-US-016, RESP-001-US-011, RESP-002-US-001, RESP-002-US-002, RESP-002-US-005, A11Y-002-US-011. |
| RATING-001-US-016-TC-002 | Virtual keyboard does not hide note field actions | Responsive, Mobile, UI | High | FX-R001-A is loaded at `390x844`. | Note field focused; virtual keyboard emulation enabled. | 1. Open create flow. 2. Focus note field. 3. Type `قهوة ممتازة`. 4. Inspect viewport and final actions. | Focused note field remains visible; Save and Cancel are reachable by scrolling inside the dialog/sheet; no horizontal overflow occurs. | RATING-001-US-016 | Yes | UI E2E | Regression. Source: RESP-002-US-009, RESP-002-US-010, RESP-002-US-011. |
| RATING-001-US-016-TC-003 | Rating touch targets meet mobile minimum | Accessibility, Mobile, UI | High | FX-R001-A is loaded at `320x568`. | Rating options visible. | 1. Open create flow. 2. Measure each rating option's hit area. | Each interactive rating target has at least `44x44` CSS pixel hit area; target layout does not create horizontal overflow. | RATING-001-US-016 | Yes | Accessibility | Regression. Source: A11Y-002-US-010, RESP-003-US-008. |

## RATING-001-US-017 - Support 200% zoom on create

User Story ID: `RATING-001-US-017`

User Story Title: Support 200% zoom on create

User Story Summary: As a low-vision user, I want rating creation usable at high zoom.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-001-US-017-TC-001 | Create flow works at 200% zoom | Responsive, Accessibility, UI | High | FX-R001-A is loaded. | Browser zoom `200%`; create flow open. | 1. Set browser zoom to `200%`. 2. Open create rating flow. 3. Navigate through controls by keyboard. | Rating controls, note field, Save, and Cancel reflow without clipping; focused control is not hidden behind fixed navigation; no horizontal overflow occurs. | RATING-001-US-017 | Yes | Accessibility | Smoke. Source: RATING-001-US-017, RESP-003-US-001, RESP-003-US-002, RESP-003-US-003, A11Y-001-US-019, A11Y-002-US-012. |
| RATING-001-US-017-TC-002 | Rating numeric labels remain LTR-safe at zoom | Responsive, Localization, Accessibility | Medium | FX-R001-A is loaded at `200%` zoom in RTL UI. | Rating values including `8.5/10`. | 1. Open create flow. 2. Inspect visible rating labels and accessibility labels. | Rating numeric fragments use Western digits and period decimal separator; `8.5/10` is LTR-isolated and does not reorder adjacent Arabic text. | RATING-001-US-017 | Yes | Accessibility | Regression. Source: RESP-004-US-003, RESP-004-US-004, RESP-004-US-009, A11Y-002-US-013. |

## RATING-001-US-018 - Respect reduced motion

User Story ID: `RATING-001-US-018`

User Story Title: Respect reduced motion

User Story Summary: As a motion-sensitive user, I want rating feedback not to cause discomfort.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-001-US-018-TC-001 | Reduced motion preserves rating state feedback | Accessibility, UI | Medium | FX-R001-A is loaded with `prefers-reduced-motion: reduce`. | Select rating `8.5` and save. | 1. Enable reduced motion. 2. Open create flow. 3. Select `8.5`. 4. Save. | Nonessential rating animation is removed or minimized; selected state remains visible and semantic; save pending/success/error feedback remains available without relying on motion. | RATING-001-US-018 | Yes | Accessibility | Regression. Source: RATING-001-US-018, RESP-003-US-016, RESP-003-US-017, A11Y-002-US-016. |
| RATING-001-US-018-TC-002 | Forced colors preserves rating state visibility | Accessibility, UI | Medium | FX-R001-A is loaded with forced-colors mode enabled. | Select rating `8.5`. | 1. Enable forced-colors mode. 2. Open create flow. 3. Select `8.5`. 4. Inspect selected, disabled, error, and focus states. | Rating values, selected state, disabled/busy state, validation error, and focus indicator remain distinguishable in forced-colors mode. | RATING-001-US-018 | Yes | Accessibility | Nightly. Source: RESP-003-US-014, RESP-003-US-015, A11Y-002-US-017. |

## Supplemental Requirement-Supported Coverage

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-001-SEC-TC-001 | Created rating response excludes forbidden fields | Security, Privacy, API | Critical | FX-R001-A is loaded. | `POST /api/v1/ratings` body `{ "placeId": "place-001", "rating": 8, "notes": "private note" }`. | 1. Send request as `user-001`. 2. Recursively inspect response JSON. 3. Inspect rendered DOM after success. | Response status is `201 Created`; response and DOM contain no other users' private notes, hidden metadata, audit/debug fields, stack traces, SQL details, tokens, aggregate-only fields, rating history, or deletion metadata; owner note appears only in the owner-only rating context. | RATING-001-US-007 | Yes | Security | Smoke. Source: RatingResponse and note privacy rules. |
| RATING-001-VAL-TC-001 | Invalid rating scale values are covered by owning feature | Traceability Verification | High | RATING-001 uses shared rating validation, but scale matrix is owned by RATING-003. | Values `0`, `0.5`, `10.5`, `8.25`, `8.3`, string rating, nonnumeric rating. | 1. Confirm RATING-003 test package contains executable validation matrix for these values. 2. Confirm RATING-001 references only missing/null rating as its owned validation. | Traceability exists from RATING-001 create validation to RATING-003 scale validation; RATING-001 does not duplicate the full scale matrix as executable ownership. | RATING-001-US-006 | No | Traceability Verification | Source: RATING-003 shared scale rules. |
| RATING-001-NOTE-TC-001 | Detailed note privacy surfaces are covered by owning feature | Traceability Verification | High | RATING-001 owns create with optional private note; broad note visibility is owned by RATING-004. | Places list, Place Detail non-owner, Public Lists, other users' profile/public data, aggregate responses, logs, error payloads. | 1. Confirm RATING-004 package contains privacy tests for all non-owner and public surfaces. 2. Confirm RATING-001 only asserts safe create response/error behavior. | Traceability exists from RATING-001 optional note creation to RATING-004 private-note visibility; RATING-001 has no executable public-surface note tests beyond create response/error privacy. | RATING-001-US-008 | No | Traceability Verification | Source: RATING-004 note privacy rules. |
| RATING-001-CLEANUP-TC-001 | First-rating list cleanup execution is owned by RATING-006 | Traceability Verification | High | FX-R001-A includes lists so the warning can be shown. | Owned lists `list-001`, `list-002`; other user's list `list-201`. | 1. Confirm RATING-006 package contains executable cleanup, transaction, and race tests. 2. Confirm RATING-001 executable case asserts only pre-save warning copy. | RATING-001 keeps executable scope to consequence communication; cleanup mutation, atomicity, and other-user list preservation are covered by RATING-006. | RATING-001-US-010 | No | Traceability Verification | Source: RATING-006 cleanup rules. |
| RATING-001-AGG-TC-001 | Aggregate calculation after create is owned by RATING-008 | Traceability Verification | High | Create success returns to Place Detail and reloads context. | Place Detail aggregate context after a new rating. | 1. Confirm RATING-008 package contains executable average/count calculation and formatting tests. 2. Confirm RATING-001 asserts navigation/context refresh but not aggregate arithmetic. | RATING-001 covers successful return and refresh trigger; aggregate arithmetic, precision, and display formatting remain RATING-008 executable ownership. | RATING-001-US-013 | No | Traceability Verification | Source: RATING-008 aggregate rules. |
| RATING-001-API-TC-001 | Single-resource response envelope clarification | Requirement Clarification | Medium | Current RATING source defines `RatingResponse`; collection envelopes are documented separately. | `POST /api/v1/ratings` success response. | 1. Review current source requirements. 2. Compare API docs for any older endpoint/envelope wording. 3. File product/API clarification if conflicting docs remain. | Requirement clarification records that RATING-001 executable tests assert the current `RatingResponse` object exactly; no undocumented `data/meta` wrapper is made executable for this single-resource POST. | RATING-001-US-007 | No | Requirement Clarification | Prevents response-envelope overreach. |
| RATING-001-UPsert-TC-001 | Existing-rating POST update belongs to RATING-009 | Traceability Verification | Medium | Existing rating already exists for `(user-001, place-001)`. | Repeated `POST /api/v1/ratings` body `{ "placeId": "place-001", "rating": 9 }`. | 1. Confirm RATING-009 package covers `200 OK` update/upsert path and one-row guarantee. 2. Confirm RATING-001 executable tests use no-existing-rating fixtures for create. | RATING-001 remains scoped to new rating creation; POST update/upsert safety remains RATING-009 executable ownership. | RATING-001-US-006 | No | Traceability Verification | Source: RATING-009 upsert rules. |

## Final Summary

- User Stories Processed: 18
- Executable Test Cases: 39
- Clarification Cases: 2
- Manual Cases: 0
- Traceability Cases: 5
- Total Test Cases: 46

### Count By Test Type

- API: 17
- Accessibility: 12
- Boundary: 1
- Contract: 2
- Data Integrity: 10
- Error Handling: 2
- Integration: 3
- Localization: 2
- Mobile: 2
- Negative: 6
- Privacy: 5
- Requirement Clarification: 2
- Responsive: 4
- Security: 5
- Traceability Verification: 5
- UI: 21
- UX: 1
- Validation: 6

### Count By Priority

- Critical: 14
- High: 22
- Medium: 10

### Count By Automation Layer

- API: 16
- Accessibility: 11
- Security: 3
- Traceability Verification: 5
- Requirement Clarification: 2
- UI E2E: 9

### Top Automation Candidates

- Create success smoke for first-time rating persistence.
- Exact `RatingResponse` contract verification.
- Duplicate-submit prevention during pending save.
- Return to Place Detail after successful create.
- Keyboard-operable rating control and selected-state announcement.
- Responsive and 200% zoom release gates.

## Validation

- Duplicate Test IDs = 0
- Invalid Story References = 0
- Missing User Stories = 0
- Encoding/Mojibake = 0
- API Tests Missing Status Codes = 0
- Requirement Fidelity Violations = 0
- Feature Ownership Violations = 0
- Generic Executable Wording = 0
