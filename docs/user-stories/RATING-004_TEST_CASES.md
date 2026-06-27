# RATING-004 Test Cases

Feature: `RATING-004 - Add/view own private note`

Feature Description: Users can add and view their own private rating notes; notes are never exposed to other users or non-private surfaces.

Primary Source: `docs/user-stories/RATINGS_USER_STORIES.md`

Supporting Sources:

- `docs/feature-map/FEATURE_TRACEABILITY.md`
- `docs/user-stories/RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`

## QA Execution Standards

- Executable tests validate only `RATING-004`, `FEATURE_TRACEABILITY.md`, or approved global `RESP-*` / `A11Y-*` requirements.
- RATING-004 owns private rating note persistence, normalization, privacy, owner-only viewing, note UI copy, multiline plain-text notes, and long-note usability.
- Rating value scale validation, create/edit flow ownership, aggregate calculation, list cleanup, retry behavior, browser history, cache behavior, and synchronization timing are outside RATING-004 unless a RATING-004 privacy assertion explicitly references the resulting surface.
- The documented success response for rating create/update is the single `RatingResponse` object with exactly `id`, `userId`, `placeId`, `rating`, `notes`, `createdAt`, and `updatedAt`.
- Documented statuses used by executable API tests are `201 Created` for a new `POST /api/v1/ratings`, `200 OK` for `PATCH /api/v1/ratings/{place_id}`, and `422 Validation Error` for note validation failures.
- Forbidden fields/content include other users' private rating data, private notes outside owner-only contexts, hidden metadata, audit/debug fields, stack traces, SQL details, tokens, undocumented internal identifiers, and raw exception text.

## Deterministic Fixtures

| Fixture ID | User / Permissions | Database State | API / UI Context | Expected Baseline |
|---|---|---|---|---|
| FX-R004-A | `user-001` authenticated | `place-001`, name `مطعم الرياض`, type `restaurant`; no rating exists for `(user-001, place-001)`. | Create rating note with `POST /api/v1/ratings`. | New rating create path is available. |
| FX-R004-B | `user-001` authenticated | Existing `rating-001`: `userId=user-001`, `placeId=place-001`, `rating=8.5`, `notes="مطعم هادئ\nبرجر جيد"`, `createdAt=2026-06-01T10:00:00Z`, `updatedAt=2026-06-01T10:00:00Z`. | Edit rating note with `PATCH /api/v1/ratings/place-001`; owner-only edit/profile views. | Owner can view the private note in owner-only rating contexts. |
| FX-R004-C | `user-002` authenticated non-owner | `rating-001` belongs to `user-001`; note value is `PRIVATE-NOTE-R004-DO-NOT-LEAK`. | Non-owner Places, Place Detail, Public Lists, other-user public/profile, and aggregate surfaces. | Non-owner surfaces must not expose the note field or note content. |
| FX-R004-D | `user-001` authenticated | Existing `rating-002`: `placeId=place-002`, `rating=7`, `notes="original private note"`. | Validation failure and error privacy tests. | Existing note and rating remain unchanged after invalid note submissions. |
| FX-R004-E | `user-001` authenticated | Rating note dialog/sheet is open for `place-001`; Arabic RTL UI. | Note field, privacy copy, keyboard, responsive, forced-colors, and reduced-motion tests. | Note field is visible and editable; rating value is valid and selected by prerequisite. |

## Response Contract

Successful note create/update responses are the documented single `RatingResponse` object:

```json
{
  "id": "rating-generated-id",
  "userId": "user-001",
  "placeId": "place-001",
  "rating": 8.5,
  "notes": "مطعم هادئ\nبرجر جيد",
  "createdAt": "2026-06-26T10:00:00Z",
  "updatedAt": "2026-06-26T10:00:00Z"
}
```

Executable success tests assert exactly those top-level fields. Error tests assert status `422`, that validation identifies `notes`, that persisted rating/note state is unchanged, and that the error payload does not echo private note content.

## RATING-004-US-001 - Add private note

User Story ID: `RATING-004-US-001`

User Story Title: Add private note

User Story Summary: As a rating owner, I want to add a private note so that I can remember context.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-004-US-001-TC-001 | POST stores owner private note with new rating | API, Privacy, Positive | High | FX-R004-A is loaded. | `POST /api/v1/ratings` body `{ "placeId": "place-001", "rating": 8.5, "notes": "مطعم هادئ" }`. | 1. Send request as `user-001`. 2. Inspect status and response body. 3. Query rating row for `(user-001, place-001)`. 4. Recursively inspect response for forbidden fields. | Response status is `201 Created`; response has exactly `id`, `userId`, `placeId`, `rating`, `notes`, `createdAt`, `updatedAt`; `userId="user-001"`; `placeId="place-001"`; `rating=8.5`; `notes="مطعم هادئ"`; persisted row has the same note; no forbidden fields are present. | RATING-004-US-001 | Yes | API | Smoke. Source: RATING-004-US-001 and RatingResponse contract. |
| RATING-004-US-001-TC-002 | PATCH stores owner private note on existing rating | API, Privacy, Positive | High | FX-R004-D is loaded with `rating-002.notes="original private note"`. | `PATCH /api/v1/ratings/place-002` body `{ "rating": 7, "notes": "قهوة المساء" }`. | 1. Send request as `user-001`. 2. Inspect status and response body. 3. Query `rating-002`. 4. Recursively inspect response for forbidden fields. | Response status is `200 OK`; response has exactly the `RatingResponse` fields; `response.id="rating-002"`; `response.notes="قهوة المساء"`; persisted `rating-002.notes="قهوة المساء"`; no forbidden fields are present. | RATING-004-US-001 | Yes | API | Regression. Uses shared PATCH endpoint documented for rating updates. |

## RATING-004-US-002 - Trim nonblank note

User Story ID: `RATING-004-US-002`

User Story Title: Trim nonblank note

User Story Summary: As a user, I want accidental spaces removed from notes.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-004-US-002-TC-001 | POST trims surrounding spaces from nonblank note | API, Data Integrity, Positive | High | FX-R004-A is loaded. | `POST /api/v1/ratings` body `{ "placeId": "place-001", "rating": 8.5, "notes": "  good visit  " }`. | 1. Send request as `user-001`. 2. Inspect response. 3. Query persisted row. | Response status is `201 Created`; `response.notes="good visit"`; persisted `notes="good visit"`; the response does not contain leading or trailing spaces in `notes`. | RATING-004-US-002 | Yes | API | Smoke. |
| RATING-004-US-002-TC-002 | PATCH trims surrounding spaces from nonblank note | API, Data Integrity, Positive | High | FX-R004-D is loaded. | `PATCH /api/v1/ratings/place-002` body `{ "rating": 7, "notes": "  برجر جيد  " }`. | 1. Send request as `user-001`. 2. Inspect response. 3. Query `rating-002`. | Response status is `200 OK`; `response.notes="برجر جيد"`; persisted `rating-002.notes="برجر جيد"`; `rating-002.rating` remains `7`. | RATING-004-US-002 | Yes | API | Regression. |

## RATING-004-US-003 - Store omitted note as null

User Story ID: `RATING-004-US-003`

User Story Title: Store omitted note as null

User Story Summary: As the system, I want omitted notes normalized.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-004-US-003-TC-001 | POST omitted notes returns notes null | API, Data Integrity, Positive | High | FX-R004-A is loaded. | `POST /api/v1/ratings` body `{ "placeId": "place-001", "rating": 8.5 }`. | 1. Send request as `user-001`. 2. Inspect response. 3. Query persisted row. | Response status is `201 Created`; `response.notes` is `null`; persisted `notes` is `null`; exactly one rating row exists for `(user-001, place-001)`. | RATING-004-US-003 | Yes | API | Smoke. |

## RATING-004-US-004 - Store empty note as null

User Story ID: `RATING-004-US-004`

User Story Title: Store empty note as null

User Story Summary: As the system, I want empty strings not stored as note content.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-004-US-004-TC-001 | POST empty note returns notes null | API, Data Integrity, Positive | High | FX-R004-A is loaded. | `POST /api/v1/ratings` body `{ "placeId": "place-001", "rating": 8.5, "notes": "" }`. | 1. Send request as `user-001`. 2. Inspect response. 3. Query persisted row. | Response status is `201 Created`; `response.notes` is `null`; persisted `notes` is `null`; no empty string is stored in the rating row. | RATING-004-US-004 | Yes | API | Smoke. |

## RATING-004-US-005 - Store whitespace-only note as null

User Story ID: `RATING-004-US-005`

User Story Title: Store whitespace-only note as null

User Story Summary: As the system, I want whitespace-only notes normalized.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-004-US-005-TC-001 | POST whitespace-only note returns notes null | API, Data Integrity, Positive | High | FX-R004-A is loaded. | `POST /api/v1/ratings` body `{ "placeId": "place-001", "rating": 8.5, "notes": "   \\n\\t  " }`. | 1. Send request as `user-001`. 2. Inspect response. 3. Query persisted row. | Response status is `201 Created`; `response.notes` is `null`; persisted `notes` is `null`; no whitespace-only note text is stored. | RATING-004-US-005 | Yes | API | Smoke. |
| RATING-004-US-005-TC-002 | PATCH whitespace-only note clears existing private note | API, Data Integrity, Positive | High | FX-R004-D is loaded with `rating-002.notes="original private note"`. | `PATCH /api/v1/ratings/place-002` body `{ "rating": 7, "notes": "     " }`. | 1. Send request as `user-001`. 2. Inspect response. 3. Query `rating-002`. | Response status is `200 OK`; `response.notes` is `null`; persisted `rating-002.notes` is `null`; `rating-002.rating` remains `7`. | RATING-004-US-005 | Yes | API | Regression. |

## RATING-004-US-006 - Enforce note length

User Story ID: `RATING-004-US-006`

User Story Title: Enforce note length

User Story Summary: As the system, I want note length constrained so that oversized private payloads are rejected.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-004-US-006-TC-001 | POST accepts trimmed note exactly 1000 characters | API, Boundary, Validation, Positive | Critical | FX-R004-A is loaded. | `notes` is exactly 1000 `a` characters; body `{ "placeId": "place-001", "rating": 8.5, "notes": "<1000 a characters>" }`. | 1. Send request as `user-001`. 2. Inspect response status and `notes` length. 3. Query persisted row. | Response status is `201 Created`; `response.notes.length=1000`; persisted `notes.length=1000`; response has exactly the `RatingResponse` fields. | RATING-004-US-006 | Yes | API | Boundary smoke. |
| RATING-004-US-006-TC-002 | POST rejects trimmed note exceeding 1000 characters | API, Boundary, Validation, Negative | Critical | FX-R004-A is loaded. | `notes` is 1001 `a` characters; body `{ "placeId": "place-001", "rating": 8.5, "notes": "<1001 a characters>" }`. | 1. Send request as `user-001`. 2. Inspect status and error body. 3. Query ratings for `(user-001, place-001)`. | Response status is `422 Validation Error`; error identifies `notes`; zero rating rows exist for `(user-001, place-001)`; error body does not echo the submitted note and contains no forbidden fields. | RATING-004-US-006 | Yes | API | Boundary smoke. |
| RATING-004-US-006-TC-003 | PATCH rejects over-limit note without changing existing rating | API, Boundary, Validation, Negative, Data Integrity | Critical | FX-R004-D is loaded with `rating-002.notes="original private note"` and `rating-002.rating=7`. | `PATCH /api/v1/ratings/place-002` body `{ "rating": 7, "notes": "<1001 a characters>" }`. | 1. Send request as `user-001`. 2. Inspect status and error body. 3. Query `rating-002`. | Response status is `422 Validation Error`; error identifies `notes`; persisted `rating-002.notes` remains `"original private note"`; persisted `rating-002.rating` remains `7`; error body does not echo the submitted note and contains no forbidden fields. | RATING-004-US-006 | Yes | API | Regression. |
| RATING-004-US-006-TC-004 | POST trims before applying 1000-character limit | API, Boundary, Validation, Positive | Critical | FX-R004-A is loaded. | `notes` is two leading spaces + 1000 `b` characters + two trailing spaces. | 1. Send `POST /api/v1/ratings` as `user-001`. 2. Inspect response. 3. Query persisted row. | Response status is `201 Created`; returned and persisted note contains exactly 1000 `b` characters; leading/trailing spaces are absent. | RATING-004-US-006 | Yes | API | Confirms trimmed length rule. |

## RATING-004-US-007 - View own note in profile archive

User Story ID: `RATING-004-US-007`

User Story Title: View own note in profile archive

User Story Summary: As a rating owner, I want to view my note in my profile archive so that I can review it later.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-004-US-007-TC-001 | Owner profile archive displays own saved note | UI, API, Privacy, Positive | High | FX-R004-B is loaded. | Owner session `user-001`; expected note `مطعم هادئ\nبرجر جيد`. | 1. Open the profile archive as `user-001`. 2. Inspect the profile response for `rating-001`. 3. Inspect visible archive row/details. 4. Inspect DOM for forbidden fields. | Owner profile archive shows `مطعم هادئ` and `برجر جيد` for `rating-001`; response/DOM does not include other users' private rating data, hidden metadata, audit/debug fields, stack traces, SQL details, or tokens. | RATING-004-US-007 | Yes | UI E2E | Source: RATING-004-US-007 and `GET /api/v1/profile` traceability. |

## RATING-004-US-008 - View own note in rating edit

User Story ID: `RATING-004-US-008`

User Story Title: View own note in rating edit

User Story Summary: As a rating owner, I want my existing note loaded when editing so that I can update it.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-004-US-008-TC-001 | Rating edit flow preloads owner private note | UI, Privacy, Positive | High | FX-R004-B is loaded. | Existing rating `rating-001`, selected rating `8.5`, note `مطعم هادئ\nبرجر جيد`. | 1. Open edit rating flow for `place-001` as `user-001`. 2. Inspect rating control selected value. 3. Inspect note field value. 4. Inspect accessibility tree for the note field. | Edit flow opens for `place-001`; selected rating is `8.5`; note field value is exactly `مطعم هادئ\nبرجر جيد`; note field has an accessible name; no other user's rating data appears. | RATING-004-US-008 | Yes | UI E2E | Source: RATING-004-US-008, A11Y-001-US-002, A11Y-002-US-018. |

## RATING-004-US-009 - Never expose notes in Places list

User Story ID: `RATING-004-US-009`

User Story Title: Never expose notes in Places list

User Story Summary: As the system, I want notes private from catalog browsing.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-004-US-009-TC-001 | Places list response and DOM exclude private notes | API, UI, Privacy, Security, Negative | Critical | FX-R004-C is loaded; private note content is `PRIVATE-NOTE-R004-DO-NOT-LEAK`. | User session `user-002`; Places list surface containing `place-001`. | 1. Open the Places list as `user-002`. 2. Capture the data response backing the Places list. 3. Recursively inspect response JSON and rendered DOM. | Places list response and DOM contain no `notes` field, no `PRIVATE-NOTE-R004-DO-NOT-LEAK`, no other users' private rating data, no hidden metadata, and no audit/debug fields. | RATING-004-US-009 | Yes | Security | Smoke. |

## RATING-004-US-010 - Never expose notes in Place Detail for non-owner

User Story ID: `RATING-004-US-010`

User Story Title: Never expose notes in Place Detail for non-owner

User Story Summary: As the system, I want other users unable to see private notes on details.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-004-US-010-TC-001 | Non-owner Place Detail excludes owner private note | API, UI, Privacy, Security, Negative | Critical | FX-R004-C is loaded; private note content is `PRIVATE-NOTE-R004-DO-NOT-LEAK`. | User session `user-002`; Place Detail for `place-001`. | 1. Open Place Detail for `place-001` as `user-002`. 2. Capture the Place Detail data response. 3. Recursively inspect response JSON, DOM, and accessibility tree. | Place Detail response, DOM, and accessibility tree contain no `notes` field for `user-001`, no `PRIVATE-NOTE-R004-DO-NOT-LEAK`, no other users' private rating data, and no hidden metadata. | RATING-004-US-010 | Yes | Security | Smoke. |
| RATING-004-US-010-TC-002 | Protected note does not flash before non-owner detail resolves | UI, Privacy, Security, Negative | Critical | FX-R004-C is loaded. | User session `user-002`; throttled Place Detail data response. | 1. Open Place Detail for `place-001` as `user-002` with throttled response. 2. Inspect DOM and accessibility tree during loading, after data response, and after idle. | At no point do DOM or accessibility tree contain `PRIVATE-NOTE-R004-DO-NOT-LEAK` or any `user-001` note content. | RATING-004-US-010 | Yes | UI E2E | No-private-data-flash privacy check. |

## RATING-004-US-011 - Never expose notes in Public Lists

User Story ID: `RATING-004-US-011`

User Story Title: Never expose notes in Public Lists

User Story Summary: As the system, I want public lists safe for private note data.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-004-US-011-TC-001 | Public list containing rated place excludes note content | API, UI, Privacy, Security, Negative | Critical | FX-R004-C is loaded; public list includes `place-001`; private note content is `PRIVATE-NOTE-R004-DO-NOT-LEAK`. | User session `user-002`; Public Lists surface and public list detail containing `place-001`. | 1. Open Public Lists as `user-002`. 2. Open the public list containing `place-001`. 3. Recursively inspect list responses, DOM, and accessibility tree. | Public list index/detail responses, DOM, and accessibility tree contain no `notes` field, no `PRIVATE-NOTE-R004-DO-NOT-LEAK`, no other users' private rating data, and no hidden metadata. | RATING-004-US-011 | Yes | Security | Smoke. |

## RATING-004-US-012 - Never expose notes in other users' profile/public data

User Story ID: `RATING-004-US-012`

User Story Title: Never expose notes in other users' profile/public data

User Story Summary: As the system, I want user profile/public data not to leak notes.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-004-US-012-TC-001 | Other-user public/profile data excludes private note | API, UI, Privacy, Security, Negative | Critical | FX-R004-C is loaded; private note content is `PRIVATE-NOTE-R004-DO-NOT-LEAK`. | User session `user-002`; public/profile-facing data for `user-001`. | 1. Open the public/profile-facing data for `user-001` as `user-002`. 2. Capture backing responses. 3. Recursively inspect response JSON, DOM, and accessibility tree. | Other-user public/profile-facing responses, DOM, and accessibility tree contain no `notes` field, no `PRIVATE-NOTE-R004-DO-NOT-LEAK`, no other users' private rating data, and no hidden metadata. | RATING-004-US-012 | Yes | Security | Regression. |

## RATING-004-US-013 - Never expose notes in aggregates

User Story ID: `RATING-004-US-013`

User Story Title: Never expose notes in aggregates

User Story Summary: As the system, I want aggregate responses free of private note content.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-004-US-013-TC-001 | Aggregate rating data excludes note fields and note content | API, Privacy, Security, Negative | Critical | FX-R004-C is loaded; aggregate data exists for `place-001`; private note content is `PRIVATE-NOTE-R004-DO-NOT-LEAK`. | Aggregate-bearing Place Detail/List data for `place-001`. | 1. Request a surface that returns average rating or rating count for `place-001`. 2. Recursively inspect response JSON. | Aggregate-bearing response contains average/count fields only for rating context; it contains no `notes` field, no `PRIVATE-NOTE-R004-DO-NOT-LEAK`, no note-derived field, and no hidden metadata. | RATING-004-US-013 | Yes | Security | Regression. |

## RATING-004-US-014 - Never expose notes in logs

User Story ID: `RATING-004-US-014`

User Story Title: Never expose notes in logs

User Story Summary: As the system, I want private notes excluded from operational logs.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-004-US-014-TC-001 | Operational logs redact private note on success and failure | Manual Verification, Privacy, Security | Critical | Controlled test environment can access request/application logs. | Success request note `PRIVATE-LOG-R004-SUCCESS`; invalid over-limit note prefixed with `PRIVATE-LOG-R004-FAILURE`. | 1. Submit a valid note request. 2. Submit an over-limit note request that returns `422`. 3. Inspect request, application, error, and access logs for both note strings. 4. Attach log-search evidence. | Logs contain neither `PRIVATE-LOG-R004-SUCCESS` nor `PRIVATE-LOG-R004-FAILURE`; logs contain no raw private note content, stack traces with note content, SQL with note content, tokens, or hidden metadata. | RATING-004-US-014 | No | Manual | Manual because operational log access is environment-dependent. |

## RATING-004-US-015 - Never expose notes in error payloads

User Story ID: `RATING-004-US-015`

User Story Title: Never expose notes in error payloads

User Story Summary: As the system, I want validation and server errors not to leak note content.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-004-US-015-TC-001 | Validation error does not echo private note content | API, Privacy, Security, Negative | Critical | FX-R004-A is loaded. | `POST /api/v1/ratings` body `{ "placeId": "place-001", "rating": 8.5, "notes": "PRIVATE-ERROR-R004-" + 1001 "x" characters }`. | 1. Send request as `user-001`. 2. Inspect status and error body. 3. Query ratings for `(user-001, place-001)`. | Response status is `422 Validation Error`; error identifies `notes`; error body does not contain `PRIVATE-ERROR-R004`; zero rating rows exist for `(user-001, place-001)`; error body contains no stack trace, SQL details, token, hidden metadata, or audit/debug field. | RATING-004-US-015 | Yes | API | Smoke. |
| RATING-004-US-015-TC-002 | Server-error note redaction requires controlled fault injection | Manual Verification, Privacy, Security | Critical | Controlled environment can induce a server error after request receipt. | Valid rating payload with note `PRIVATE-ERROR-R004-SERVER`. | 1. Enable controlled server-error path. 2. Submit request containing `PRIVATE-ERROR-R004-SERVER`. 3. Inspect response body and logs. | Response body and logs do not contain `PRIVATE-ERROR-R004-SERVER`, raw note text, stack trace containing note content, SQL with note content, token, hidden metadata, or audit/debug field. | RATING-004-US-015 | No | Manual | Manual/fault-injection path because server-error triggering is not a product behavior. |

## RATING-004-US-016 - Show private-note copy

User Story ID: `RATING-004-US-016`

User Story Title: Show private-note copy

User Story Summary: As a user, I want the UI to state that my note is private so that I understand visibility.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-004-US-016-TC-001 | Note field shows private-note copy | UI, Accessibility, Privacy, Positive | Medium | FX-R004-E is loaded. | Arabic privacy copy `ملاحظتك خاصة` or equivalent text conveying that the note is private. | 1. Open create/edit rating note UI. 2. Inspect visible note-field helper text. 3. Inspect accessibility tree for note field description. | The note field area visibly communicates `ملاحظتك خاصة` or equivalent private-note copy; the note field accessible description includes the same privacy meaning; copy is available before save. | RATING-004-US-016 | Yes | Accessibility | Source: RATING-004-US-016, A11Y-001-US-002. |

## RATING-004-US-017 - Support multiline plain text notes

User Story ID: `RATING-004-US-017`

User Story Title: Support multiline plain text notes

User Story Summary: As a user, I want simple private notes without rich-text risk.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-004-US-017-TC-001 | POST stores multiline note as plain text | API, Security, Data Integrity, Positive | Medium | FX-R004-A is loaded. | `POST /api/v1/ratings` body `{ "placeId": "place-001", "rating": 8.5, "notes": "السطر الأول\\n<script>alert(1)</script>\\nبرجر جيد" }`. | 1. Send request as `user-001`. 2. Inspect response body. 3. Query persisted row. | Response status is `201 Created`; `response.notes` exactly equals `السطر الأول\n<script>alert(1)</script>\nبرجر جيد`; persisted note stores the same plain text; no executable markup metadata or hidden fields are added. | RATING-004-US-017 | Yes | API | Smoke. |
| RATING-004-US-017-TC-002 | Owner UI renders multiline note as non-executable text | UI, Security, Positive | Medium | Result from RATING-004-US-017-TC-001 exists. | Saved note contains literal `<script>alert(1)</script>`. | 1. Open owner profile archive or rating edit view for the saved note. 2. Inspect rendered DOM. 3. Monitor for script execution side effect. | The literal text `<script>alert(1)</script>` appears as text or escaped content; no script node is created from the note; no alert or executable behavior occurs; line breaks remain understandable to the owner. | RATING-004-US-017 | Yes | UI E2E | Regression. |

## RATING-004-US-018 - Keep long-note UI usable

User Story ID: `RATING-004-US-018`

User Story Title: Keep long-note UI usable

User Story Summary: As a mobile user, I want long note entry manageable.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-004-US-018-TC-001 | Long note remains usable at 320px and 390px | UI, Responsive, Accessibility, Positive | Medium | FX-R004-E is loaded. | Note draft of 995 characters; viewports `320x568` and `390x844`. | 1. Set viewport to `320x568`. 2. Enter the 995-character note. 3. Verify note field, validation/help text, save, and cancel are reachable. 4. Repeat at `390x844`. | At both viewports, `document.documentElement.scrollWidth <= window.innerWidth`; note field text remains editable; privacy copy/help or validation text is readable; save/cancel remain reachable; no fixed navigation or safe area obscures the final action. | RATING-004-US-018 | Yes | Accessibility | Source: RATING-004-US-018, RESP-002-US-001, RESP-002-US-002, RESP-002-US-005, RESP-002-US-009. |
| RATING-004-US-018-TC-002 | Long-note validation appears before or at submit | UI, Validation, Accessibility, Negative | Medium | FX-R004-E is loaded. | Note draft of 1001 characters. | 1. Enter the 1001-character note. 2. Attempt save. 3. Inspect validation text, focus, and network requests. | The UI shows note-length validation before submit or after submit response; final state has no false success; if a request is sent, response status is `422 Validation Error`; focus moves to the note field or linked error summary; screen reader can announce the note-length error. | RATING-004-US-018 | Yes | Accessibility | Source: RATING-004-US-018, A11Y-001-US-014, A11Y-001-US-015. |

## Supplemental Production Coverage

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-004-API-TC-001 | RatingResponse note contract excludes extra fields | API, Contract, Privacy, Security | High | FX-R004-A is loaded. | `POST /api/v1/ratings` body `{ "placeId": "place-001", "rating": 8.5, "notes": "قهوة المساء" }`. | 1. Send request as `user-001`. 2. Recursively inspect response JSON. | Response status is `201 Created`; top-level fields are exactly `id`, `userId`, `placeId`, `rating`, `notes`, `createdAt`, `updatedAt`; `notes="قهوة المساء"`; no aggregate fields, rating history, hidden metadata, audit/debug fields, stack trace, SQL details, token, or other users' data are present. | RATING-004-US-001 | Yes | API | Contract regression. |
| RATING-004-A11Y-TC-001 | Note field supports keyboard, focus-visible, status, reduced motion, and forced colors | Accessibility, UI | High | FX-R004-E is loaded. | Keyboard-only path; `prefers-reduced-motion: reduce`; forced-colors mode. | 1. Open rating note UI. 2. Navigate to note field and actions using keyboard only. 3. Enter `مطعم هادئ`. 4. Trigger save pending and validation states. 5. Repeat forced-colors and reduced-motion checks. | Note field and actions are keyboard reachable; visible `focus-visible` appears; pending state uses accessible status or `aria-busy`; reduced-motion mode preserves state feedback without nonessential animation; forced-colors mode keeps text, borders, focus, and selected/disabled states distinguishable. | RATING-004-US-016 | Yes | Accessibility | Source: A11Y-001-US-002, A11Y-001-US-014, A11Y-001-US-016, RESP-003-US-014, RESP-003-US-015, RESP-003-US-016, RESP-003-US-017. |
| RATING-004-RESP-TC-001 | Rating note UI passes full responsive certification matrix | Responsive, Accessibility, UI | High | FX-R004-E is loaded. | Viewports `320x568`, `390x844`, `430x932`, phone landscape, `768x1024`, `1024x768`, `1440x900`; 200% zoom. | 1. Render note UI at each viewport. 2. Enter a 995-character note. 3. Inspect overflow, safe areas, touch targets, and reachability of final actions. 4. Repeat at 200% zoom. | At every viewport and at 200% zoom, `document.documentElement.scrollWidth <= window.innerWidth`; note field, validation/help text, save/cancel, and close controls remain reachable; interactive controls have at least `44x44` CSS pixel hit area; safe areas do not obscure final actions. | RATING-004-US-018 | Yes | Accessibility | Source: RESP-002-US-001, RESP-002-US-002, RESP-002-US-005, RESP-002-US-010, RESP-002-US-011, RESP-002-US-012, RESP-003-US-001, RESP-003-US-002, RESP-003-US-008, RESP-003-US-009, RESP-003-US-010. |
| RATING-004-SEC-TC-001 | Guest/non-owner note data never appears before auth or privacy resolution | UI, Privacy, Security, Negative | Critical | FX-R004-C is loaded. | Guest session and `user-002` session; throttled profile/detail/public-list responses. | 1. Open note-bearing surfaces as guest and as `user-002`. 2. Inspect DOM and accessibility tree during loading, after response, and after idle. | DOM and accessibility tree never contain `PRIVATE-NOTE-R004-DO-NOT-LEAK`, owner-only `notes`, or other users' private rating data before, during, or after auth/privacy resolution. | RATING-004-US-010 | Yes | UI E2E | No-private-data-flash regression. |
| RATING-004-TRACE-TC-001 | Required rating/place validation remains owned by other rating features | Traceability Verification | Medium | RATING-004 API tests use valid `placeId` and valid `rating` except where note validation is the subject. | Missing `placeId`, invalid `rating`, nonexistent place. | 1. Confirm RATING-004 executable tests do not duplicate create/rating-scale validation. 2. Confirm RATING-001 and RATING-003 own those executable cases. | RATING-004 remains scoped to note behavior; required non-note field validation is covered by the owning rating features or flagged there, not duplicated here. | RATING-004-US-001 | No | Traceability Verification | Feature ownership guardrail. |
| RATING-004-CLAR-TC-001 | Clarify exact server-error induction method for automated log/privacy tests | Requirement Clarification | Medium | No source requirement defines how QA should induce server errors. | Fault injection method for rating save errors. | 1. Review test-environment controls. 2. Define a supported fault-injection method. 3. Convert server-error redaction from manual to automated only after the method is documented. | Clarification records that server-error privacy is required, while the mechanism for deterministic automated server-error induction is not currently specified. | RATING-004-US-015 | No | Requirement Clarification | Prevents inventing server behavior. |
| RATING-004-CLAR-TC-002 | Clarify malformed non-string notes payload handling | Requirement Clarification | Medium | Current RATING-004 source defines omitted, empty, whitespace, nonblank text, multiline plain text, and length rules. | Potential payloads: `{ "notes": 123 }`, `{ "notes": {} }`, `{ "notes": [] }`. | 1. Review source requirements for non-string `notes` payloads. 2. Document whether these are rejected, coerced, or ignored. 3. Add executable tests only after the contract is documented. | Clarification records that malformed non-string note payload behavior is not executable from current RATING-004 requirements; no status code or coercion behavior is invented. | RATING-004-US-006 | No | Requirement Clarification | Covers malformed-payload audit item without overreach. |

## Final Summary

- User Stories Processed: 18
- Executable Test Cases: 30
- Clarification Cases: 2
- Manual Cases: 2
- Traceability Cases: 1
- Total Test Cases: 35

### Count By Test Type

- Accessibility: 5
- API: 21
- Boundary: 4
- Contract: 1
- Data Integrity: 8
- Manual Verification: 2
- Negative: 11
- Positive: 16
- Privacy: 16
- Requirement Clarification: 2
- Responsive: 2
- Security: 13
- Traceability Verification: 1
- UI: 14
- Validation: 5

### Count By Priority

- Critical: 14
- High: 13
- Medium: 8

### Count By Automation Layer

- Accessibility: 5
- API: 15
- Manual: 2
- Requirement Clarification: 2
- Security: 7
- Traceability Verification: 1
- UI E2E: 5

### Top Automation Candidates

- POST/PATCH private note success, trim, null, and length-boundary API tests.
- Error-payload note redaction on `422`.
- Places, Place Detail, Public Lists, profile/public data, and aggregate note-leak checks.
- Note field accessibility and responsive certification.
- No-private-data-flash DOM/accessibility-tree checks.

## Validation

- Duplicate Test IDs = 0
- Invalid Story References = 0
- Missing User Stories = 0
- Encoding/Mojibake = 0
- Generic Executable Wording = 0
- Requirement Fidelity Violations = 0
- Feature Ownership Violations = 0
