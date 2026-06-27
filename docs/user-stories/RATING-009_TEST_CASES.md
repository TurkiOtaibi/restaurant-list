# RATING-009 Test Cases

Feature: `RATING-009 - Repeated POST updates existing rating`

Feature Description: `POST /api/v1/ratings` behaves as create-or-update API safety. A new current-user/place rating returns `201 Created`; an existing current-user/place rating updates the existing row and returns `200 OK`.

Primary Source: `docs/user-stories/RATINGS_USER_STORIES.md`

Supporting Sources:

- `docs/feature-map/FEATURE_TRACEABILITY.md`
- `docs/user-stories/RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`

## Documented Contract

- Endpoint under test: `POST /api/v1/ratings`.
- Endpoint traceability: `POST /api/v1/ratings` maps to `create_or_update_rating` and the `Rating` model.
- Table constraint traceability: `ratings` has unique `(user_id, place_id)`.
- `RatingResponse` fields are exactly `id`, `userId`, `placeId`, `rating`, `notes`, `createdAt`, and `updatedAt`.
- `POST /api/v1/ratings` returns `201 Created` when it creates a new rating.
- `POST /api/v1/ratings` returns `200 OK` when it updates an existing rating through upsert.
- Missing authentication returns `401`.
- Validation failures return `422`.
- Missing referenced place returns `404`.
- A duplicate race that cannot be resolved as update may return a structured conflict such as `DUPLICATE_RATING` without database internals.
- Blank notes are stored and returned as `notes: null`; nonblank notes are trimmed and saved privately.
- Invalid rating values on the POST update path return `422` and leave the existing rating unchanged.
- POST update of an existing rating must not repeat first-rating list cleanup.
- Frontend create flow uses POST only when no current-user rating exists; frontend edit flow uses PATCH when an existing rating is known.
- After POST update success, place context, current-user context, and aggregate data refresh.

## Deterministic Fixture Matrix

| Fixture ID | User / Permissions | Initial Database State | Request / UI Context | Expected Baseline |
|---|---|---|---|---|
| FX-009-CREATE | `user-001` authenticated | `place-001` exists; no row exists in `ratings` for `(user-001, place-001)`; `ratings` has unrelated row `rating-201` for `(user-002, place-001)`; `list_items` for `user-001` contain `place-001` in `list-001` and `list-002` | `POST /api/v1/ratings` body `{ "placeId": "place-001", "rating": 8.5, "notes": "  Weekend dinner  " }` | Create path is valid; current-user rating count for `(user-001, place-001)` is `0`; unrelated user rating count is `1`; owned list membership count for `place-001` is `2`. |
| FX-009-UPDATE | `user-001` authenticated | Existing row `rating-001` for `(user-001, place-001)` has `rating=6.0`, `notes="old note"`, `createdAt=2026-06-01T10:00:00Z`, `updatedAt=2026-06-01T10:00:00Z`; unrelated row `rating-201` for `(user-002, place-001)` has `rating=9.0`, `notes="other private note"`; `list_items` has re-added membership `list-003/place-001` for `user-001` | `POST /api/v1/ratings` body `{ "placeId": "place-001", "rating": 9.0, "notes": " updated note " }` | Update path is valid; current-user rating count for `(user-001, place-001)` is `1`; unrelated user row is present; owned list membership count for `place-001` is `1`. |
| FX-009-REPEAT | `user-001` authenticated | No current-user rating exists for `(user-001, place-002)`; `place-002` exists | Two sequential `POST /api/v1/ratings` requests: first `{ "placeId": "place-002", "rating": 7.0, "notes": null }`, second `{ "placeId": "place-002", "rating": 8.0, "notes": null }` | Repeated create attempts target the same `(userId, placeId)` pair. |
| FX-009-CONCURRENT-CREATE | `user-001` authenticated | No current-user rating exists for `(user-001, place-003)`; `place-003` exists | Two simultaneous `POST /api/v1/ratings` requests with identical body `{ "placeId": "place-003", "rating": 8.5, "notes": null }` | Concurrent create race targets one user/place pair with no starting row. |
| FX-009-CONCURRENT-UPDATE | `user-001` authenticated | Existing row `rating-003` for `(user-001, place-003)` has `rating=5.5`, `notes=null`; row count for pair is `1` | Two simultaneous `POST /api/v1/ratings` requests: A `{ "placeId": "place-003", "rating": 7.0, "notes": "A" }`, B `{ "placeId": "place-003", "rating": 9.0, "notes": "B" }` | Concurrent update race starts with exactly one row; final winner value is not documented. |
| FX-009-INVALID | `user-001` authenticated | Existing row `rating-004` for `(user-001, place-004)` has `rating=6.5`, `notes="stable"` | Invalid POST body `{ "placeId": "place-004", "rating": 8.25, "notes": "should not save" }` | Invalid rating payload targets an existing row and must not mutate it. |
| FX-009-AUTH | Guest / no valid session | `place-001` exists; no authenticated user context | `POST /api/v1/ratings` body `{ "placeId": "place-001", "rating": 8.5, "notes": null }` | Protected endpoint has no current-user identity. |
| FX-009-MISSING-PLACE | `user-001` authenticated | No place exists with id `place-missing-001`; no rating row exists for that missing place | `POST /api/v1/ratings` body `{ "placeId": "place-missing-001", "rating": 8.5, "notes": null }` | Missing referenced place is deterministic. |
| FX-009-UI-CREATE | `user-001` authenticated | Place Detail state says no current-user rating exists for `place-001` | User opens create rating flow and saves `rating=8.5`, `notes=null` | Frontend must send POST for create flow. |
| FX-009-UI-EDIT | `user-001` authenticated | Place Detail state includes current-user rating `rating-001` for `place-001` | User opens edit rating flow and saves `rating=9.0`, `notes="updated"` | Frontend must send PATCH for known edit flow; POST upsert is API safety only. |
| FX-009-UI-REFRESH | `user-001` authenticated | Existing row `rating-001` for `place-001`; visible Place Detail context shows rating `6.0` before request | API safety POST updates rating to `9.0` and returns `200 OK` | On success, place context, current-user context, and aggregate data are reloaded from committed state. |

## Test Cases

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-009-US-001-TC-001 | POST creates new rating when no current-user row exists | API, Data Integrity, Positive | Critical | FX-009-CREATE is loaded. | Endpoint `POST /api/v1/ratings`; payload `{ "placeId": "place-001", "rating": 8.5, "notes": "  Weekend dinner  " }`. | 1. Send request as `user-001`. 2. Assert HTTP status. 3. Assert JSON fields and values. 4. Query `ratings` for `(user-001, place-001)`. 5. Query unrelated row `rating-201`. | Status is `201 Created`; response has exactly `id`, `userId`, `placeId`, `rating`, `notes`, `createdAt`, `updatedAt`; `userId=user-001`; `placeId=place-001`; `rating=8.5`; `notes="Weekend dinner"`; exactly one row exists for `(user-001, place-001)`; unrelated `rating-201` remains unchanged; response excludes hidden metadata, audit/debug fields, SQL details, stack traces, tokens, and other users' data. | RATING-009-US-001 | Yes | API |
| RATING-009-US-002-TC-001 | POST updates existing current-user row | API, Data Integrity, Positive | Critical | FX-009-UPDATE is loaded. | Endpoint `POST /api/v1/ratings`; payload `{ "placeId": "place-001", "rating": 9.0, "notes": " updated note " }`. | 1. Send request as `user-001`. 2. Assert HTTP status. 3. Assert JSON fields and values. 4. Query `ratings` for `(user-001, place-001)`. 5. Query unrelated row `rating-201`. | Status is `200 OK`; response has exactly `id`, `userId`, `placeId`, `rating`, `notes`, `createdAt`, `updatedAt`; response `id=rating-001`; `userId=user-001`; `placeId=place-001`; `rating=9.0`; `notes="updated note"`; `createdAt=2026-06-01T10:00:00Z`; exactly one row exists for `(user-001, place-001)`; unrelated `rating-201` remains `rating=9.0`, `notes="other private note"`; forbidden fields are absent. | RATING-009-US-002 | Yes | API |
| RATING-009-US-003-TC-001 | Sequential POST attempts preserve one row per user/place | API, Data Integrity, Regression | Critical | FX-009-REPEAT is loaded. | Request 1 payload `{ "placeId": "place-002", "rating": 7.0, "notes": null }`; Request 2 payload `{ "placeId": "place-002", "rating": 8.0, "notes": null }`. | 1. Send Request 1 as `user-001`. 2. Send Request 2 as `user-001`. 3. Query `ratings` for `(user-001, place-002)`. | Request 1 status is `201 Created`; Request 2 status is `200 OK`; exactly one row exists for `(user-001, place-002)`; persisted row has `rating=8.0`, `notes=null`; no second rating ID exists for that pair. | RATING-009-US-003 | Yes | API |
| RATING-009-US-004-TC-001 | Database uniqueness prevents duplicate rows for same user/place | Data Integrity, Security | Critical | Database integration harness has FX-009-UPDATE loaded and permits direct persistence setup. | Direct persistence attempt inserts second `Rating` row with `user_id=user-001`, `place_id=place-001`, `rating=8.0`, `notes=null` while `rating-001` already exists. | 1. Attempt duplicate row insertion outside the API service. 2. Capture persistence result. 3. Query rows for `(user-001, place-001)`. | Duplicate insert is rejected by the documented unique `(user_id, place_id)` constraint; exactly one row remains for `(user-001, place-001)`; retained row is `rating-001`; no private notes, SQL details, stack traces, or database constraint internals are exposed to API clients. | RATING-009-US-004 | Yes | Data Integrity |
| RATING-009-US-005-TC-001 | Concurrent POST create race leaves one row and safe responses | API, Concurrency, Security, Privacy | Critical | FX-009-CONCURRENT-CREATE is loaded. | Two simultaneous requests with body `{ "placeId": "place-003", "rating": 8.5, "notes": null }`. | 1. Start both requests for `user-001` in the same test barrier. 2. Wait for both responses. 3. Query `ratings` for `(user-001, place-003)`. 4. Recursively inspect both response bodies. | After both responses complete, exactly one row exists for `(user-001, place-003)`; no response contains private notes beyond the owner response, hidden metadata, SQL details, stack traces, audit/debug fields, tokens, or other users' data; any success response uses `RatingResponse` fields only. | RATING-009-US-005 | Yes | API |
| RATING-009-US-005-TC-002 | Concurrent POST update race preserves one row | API, Concurrency, Data Integrity | Critical | FX-009-CONCURRENT-UPDATE is loaded. | Request A `{ "placeId": "place-003", "rating": 7.0, "notes": "A" }`; Request B `{ "placeId": "place-003", "rating": 9.0, "notes": "B" }`. | 1. Start Request A and Request B in the same test barrier. 2. Wait for both responses. 3. Query `ratings` for `(user-001, place-003)`. 4. Inspect both response bodies. | Both responses return `200 OK`; final row count for `(user-001, place-003)` is `1`; no duplicate row exists; final row remains owned by `user-001`; response bodies use `RatingResponse` fields only and exclude hidden metadata, SQL details, stack traces, audit/debug fields, tokens, and other users' data. | RATING-009-US-005 | Yes | API |
| RATING-009-US-006-TC-001 | Safe duplicate-race conflict response has deterministic public error shape | Security, Privacy, Negative | High | Duplicate race fallback is forced so service cannot resolve one request as update. | Forced fallback response for `POST /api/v1/ratings`. | 1. Force the duplicate-race fallback using the API test harness. 2. Inspect the fallback response body. 3. Query final row count. | Fallback response body has public error code `DUPLICATE_RATING`; response body contains no SQL details, stack traces, constraint names, hidden metadata, audit/debug fields, tokens, private notes, or other users' data; final row count for the user/place pair remains `1`. | RATING-009-US-006 | Yes | Security |
| RATING-009-US-006-RC-001 | Clarify exact HTTP status for unresolved duplicate race | Requirement Clarification | Medium | RATING-009-US-006 allows a structured conflict but does not mandate an exact HTTP status. | Candidate statuses include only statuses approved by product/API documentation. | 1. Confirm the exact unresolved-race HTTP status with product/API owner. 2. Update executable conflict-status assertions after documentation is amended. | Non-executable clarification remains open until the exact HTTP status is documented; no executable test asserts a specific conflict status. | RATING-009-US-006 | No | Requirement Clarification |
| RATING-009-US-007-TC-001 | Repeated POST with blank note stores notes as null | API, Privacy, Positive | High | FX-009-UPDATE is loaded. | Endpoint `POST /api/v1/ratings`; payload `{ "placeId": "place-001", "rating": 9.0, "notes": "   " }`. | 1. Send request as `user-001`. 2. Assert status and response. 3. Query row `rating-001`. | Status is `200 OK`; response `id=rating-001`; `rating=9.0`; `notes=null`; persisted row `rating-001` has `notes=null`; row count for `(user-001, place-001)` remains `1`; unrelated `rating-201.notes` remains `"other private note"`. | RATING-009-US-007 | Yes | API |
| RATING-009-US-007-TC-002 | Repeated POST trims valid note and keeps it private | API, Privacy, Security | High | FX-009-UPDATE is loaded. | Endpoint `POST /api/v1/ratings`; payload `{ "placeId": "place-001", "rating": 9.0, "notes": "  updated note  " }`. | 1. Send request as `user-001`. 2. Inspect owner response. 3. Inspect non-owner/public-safe response surfaces available in this feature harness. | Status is `200 OK`; owner `RatingResponse.notes="updated note"`; persisted `rating-001.notes="updated note"`; non-owner/public-safe payloads and error/log capture contain no `"updated note"` text. | RATING-009-US-007 | Yes | Security |
| RATING-009-US-008-TC-001 | POST update path rejects invalid half-step rating | API, Validation, Negative | Critical | FX-009-INVALID is loaded. | Endpoint `POST /api/v1/ratings`; payload `{ "placeId": "place-004", "rating": 8.25, "notes": "should not save" }`. | 1. Send request as `user-001`. 2. Assert status and error schema. 3. Query row `rating-004`. | Status is `422`; error response uses deterministic public error schema; error payload does not echo `"should not save"`; row `rating-004` remains `rating=6.5`, `notes="stable"`; row count for `(user-001, place-004)` remains `1`; no hidden metadata, audit/debug fields, SQL details, stack traces, or tokens appear. | RATING-009-US-008 | Yes | API |
| RATING-009-US-008-TC-002 | POST update path rejects missing rating value | API, Validation, Negative | Critical | FX-009-UPDATE is loaded. | Endpoint `POST /api/v1/ratings`; payload `{ "placeId": "place-001", "notes": "missing rating" }`. | 1. Send request as `user-001`. 2. Assert status and error schema. 3. Query row `rating-001`. | Status is `422`; error identifies `rating` as invalid or required; row `rating-001` remains `rating=6.0`, `notes="old note"`; row count remains `1`; error payload contains no private note text, stack trace, SQL detail, or internal debug field. | RATING-009-US-008 | Yes | API |
| RATING-009-US-008-TC-003 | POST update path rejects oversized note | API, Validation, Privacy, Negative | Critical | FX-009-UPDATE is loaded. | Endpoint `POST /api/v1/ratings`; payload has `placeId="place-001"`, `rating=9.0`, and `notes` containing exactly 1001 `A` characters. | 1. Send request as `user-001`. 2. Assert status and error schema. 3. Query row `rating-001`. | Status is `422`; error identifies `notes` as invalid; oversized note text is not echoed; row `rating-001` remains `rating=6.0`, `notes="old note"`; row count remains `1`. | RATING-009-US-008 | Yes | API |
| RATING-009-US-009-TC-001 | POST update does not repeat first-rating list cleanup | API, Data Integrity, Regression | Critical | FX-009-UPDATE is loaded; before request, `list-003/place-001` exists for `user-001`; owned list membership count for `place-001` is `1`. | Endpoint `POST /api/v1/ratings`; payload `{ "placeId": "place-001", "rating": 9.0, "notes": "updated note" }`. | 1. Send request as `user-001`. 2. Assert status. 3. Query `ratings` for `(user-001, place-001)`. 4. Query owned `list_items` for `place-001`. | Status is `200 OK`; row `rating-001` is updated to `rating=9.0`; row count for `(user-001, place-001)` remains `1`; `list-003/place-001` still exists; owned list membership count for `place-001` remains `1`; no cleanup event removes the re-added membership. | RATING-009-US-009 | Yes | API |
| RATING-009-US-010-TC-001 | Frontend create flow sends POST when no current-user rating exists | UI, Integration | High | FX-009-UI-CREATE is loaded. | User selects `8.5` and leaves notes empty in create rating flow. | 1. Open rating flow from Place Detail for `place-001`. 2. Select `8.5`. 3. Submit. 4. Capture network calls. | Exactly one rating save request is sent; request method is `POST`; path is `/api/v1/ratings`; payload is `{ "placeId": "place-001", "rating": 8.5, "notes": null }`; no `PATCH /api/v1/ratings/place-001` request is sent from this create flow. | RATING-009-US-010 | Yes | UI E2E |
| RATING-009-US-010-TC-002 | Frontend known edit flow sends PATCH instead of relying on POST upsert | UI, Integration | High | FX-009-UI-EDIT is loaded. | User changes existing rating from `6.0` to `9.0` with notes `"updated"`. | 1. Open edit rating flow from Place Detail for `place-001`. 2. Change rating and notes. 3. Submit. 4. Capture network calls. | Exactly one rating save request is sent; request method is `PATCH`; path is `/api/v1/ratings/place-001`; payload is `{ "rating": 9.0, "notes": "updated" }`; no `POST /api/v1/ratings` request is sent from this known edit flow. | RATING-009-US-010 | Yes | UI E2E |
| RATING-009-US-011-TC-001 | POST update success refreshes documented frontend contexts | UI, Integration, Data Integrity | High | FX-009-UI-REFRESH is loaded. | API safety update succeeds with status `200 OK` and `RatingResponse.rating=9.0`. | 1. Trigger the documented POST safety update. 2. Resolve success response. 3. Capture follow-up context reloads or state refresh calls. 4. Inspect visible current-user rating. | After success, visible current-user rating for `place-001` is `9.0`; place context reload is requested once; current-user context reload is requested once; aggregate context reload is requested once; no stale `6.0` value remains visible after refresh completes. | RATING-009-US-011 | Yes | UI E2E |
| RATING-009-US-012-TC-001 | Status codes distinguish create and update paths | API, Data Integrity | High | FX-009-CREATE and FX-009-UPDATE are loaded in isolated test transactions. | Create payload `{ "placeId": "place-001", "rating": 8.5, "notes": null }`; update payload `{ "placeId": "place-001", "rating": 9.0, "notes": null }`. | 1. In create transaction, send create payload where no current-user row exists. 2. In update transaction, send update payload where `rating-001` exists. 3. Query each transaction's row count. | Create transaction returns `201 Created` and creates exactly one current-user row; update transaction returns `200 OK` and keeps exactly one current-user row; both responses contain exactly `RatingResponse` fields. | RATING-009-US-012 | Yes | API |
| RATING-009-AUTH-TC-001 | POST upsert requires authentication | API, Security, Negative | Critical | FX-009-AUTH is loaded. | Endpoint `POST /api/v1/ratings`; payload `{ "placeId": "place-001", "rating": 8.5, "notes": null }`; no bearer token. | 1. Send request without authentication. 2. Inspect status and response. 3. Query `ratings` for any anonymous-created rows. | Status is `401`; no rating row is created or updated; error payload contains no private notes, hidden metadata, audit/debug fields, SQL details, stack traces, tokens, or user identifiers. | RATING-009-US-001 | Yes | API |
| RATING-009-404-TC-001 | POST upsert rejects missing referenced place | API, Negative | Critical | FX-009-MISSING-PLACE is loaded. | Endpoint `POST /api/v1/ratings`; payload `{ "placeId": "place-missing-001", "rating": 8.5, "notes": null }`. | 1. Send request as `user-001`. 2. Inspect status and response. 3. Query `ratings` for `place-missing-001`. | Status is `404`; no rating row is created for `place-missing-001`; error payload uses deterministic public error schema and excludes stack traces, SQL details, audit/debug fields, tokens, hidden metadata, and private notes. | RATING-009-US-001 | Yes | API |
| RATING-009-SEC-TC-001 | POST upsert response excludes forbidden fields on success and failure | Security, Privacy, API | High | Execute `RATING-009-US-001-TC-001`, `RATING-009-US-002-TC-001`, `RATING-009-US-008-TC-001`, and `RATING-009-AUTH-TC-001`. | Captured JSON responses and rendered DOM after each case. | 1. Recursively inspect all JSON response keys and string values. 2. Inspect rendered DOM and accessibility tree after each response. | No response, DOM node, or accessibility node contains hidden metadata, audit/debug fields, SQL details, stack traces, tokens, private notes outside the owner-only rating response, or other users' data; owner-only note text appears only in the authenticated owner success response. | RATING-009-US-005 | Yes | Security |
| RATING-009-A11Y-TC-001 | Rating upsert UI supports keyboard and screen-reader operation | Accessibility, UI | High | FX-009-UI-CREATE and FX-009-UI-EDIT are loaded in separate UI runs. | Keyboard-only navigation; rating values `8.5` and `9.0`; note inputs `null` and `"updated"`. | 1. Open create flow and edit flow. 2. Navigate with keyboard only. 3. Select rating values using documented rating-control keyboard model. 4. Submit each flow. 5. Inspect accessibility tree. | Rating control receives visible `focus-visible`; valid half-step values are keyboard reachable; selected value is exposed as `8.5/10` or `9.0/10`; save action has an accessible name; loading state exposes accessible busy/status; validation errors are announced when `RATING-009-US-008-TC-001` is reproduced in UI. | RATING-009-US-010 | Yes | Accessibility |
| RATING-009-RESP-TC-001 | Rating upsert UI passes required responsive and zoom matrix | Responsive, Accessibility, UI | High | FX-009-UI-CREATE and FX-009-UI-EDIT are loaded. | Viewports `320x568`, `390x844`, `430x932`, `768x1024`, `1024x768`, `1440x900`; `200%` zoom. | 1. Open create and edit rating flows at each viewport. 2. Select a rating and focus notes/save controls. 3. Measure overflow and target sizes. | `document.documentElement.scrollWidth <= window.innerWidth` at every viewport and at `200%` zoom; rating values, notes field, primary action, secondary action, and close/cancel controls remain reachable; interactive rating targets are at least `44x44` CSS pixels; safe-area/bottom navigation does not obscure final action. | RATING-009-US-010 | Yes | Accessibility |

## Manual / Clarification / Traceability Cases

| Case ID | Case Type | Priority | Trigger | Verification Required | Expected Classification Result | Related User Story ID |
|---|---|---|---|---|---|---|
| RATING-009-MANUAL-TC-001 | Manual Verification | Medium | Operational log inspection for POST upsert validation and conflict failures. | Review server logs for a failed invalid-rating request and a forced duplicate-race conflict. | Logs omit private note content, tokens, SQL details, stack traces, and raw payloads containing private notes. | RATING-009-US-006 |
| RATING-009-TRACE-TC-001 | Traceability Verification | High | RATING-009 uses cross-feature documented validation and note rules from the shared Ratings rules in `RATINGS_USER_STORIES.md`. | Confirm RATING-009 validation and note cases cite shared Ratings rules and RATING-009-US-007/US-008, not previous test-case files. | Traceability remains within allowed sources; no previous Rating test file is used as source of truth. | RATING-009-US-007 |
| RATING-009-TRACE-TC-002 | Traceability Verification | High | RATING-009-US-009 references side-effect distinction. | Confirm executable coverage asserts only documented update end state: cleanup does not repeat on `200 OK` POST update. | Test does not validate full first-rating cleanup implementation; it verifies only the documented non-repeat behavior for POST update. | RATING-009-US-009 |
| RATING-009-RC-TC-001 | Requirement Clarification | Medium | Concurrent update final winner rule is not documented. | Ask product/API owner whether last-writer-wins, first-writer-wins, or another deterministic rule is required. | Until documented, executable concurrency tests assert row count and allowed response safety only, not final winner value. | RATING-009-US-005 |
| RATING-009-RC-TC-002 | Requirement Clarification | Medium | Context refresh timing is not documented. | Ask product/API owner whether refresh must be immediate, after navigation, or eventually after success. | Until documented, executable UI test asserts refresh calls and final visible state after refresh completion only, not timing. | RATING-009-US-011 |

## Coverage Summary

- User Stories Processed: 12
- Executable Test Cases: 22
- Clarification Cases: 3
- Manual Cases: 1
- Traceability Cases: 2
- Total Test Cases: 28

### Count By Test Type

- API: 15
- Accessibility: 2
- Concurrency: 2
- Data Integrity: 8
- Integration: 3
- Manual Verification: 1
- Negative: 6
- Positive: 3
- Privacy: 6
- Requirement Clarification: 3
- Responsive: 1
- Regression: 2
- Security: 6
- Traceability Verification: 2
- UI: 5
- Validation: 3

### Count By Priority

- Critical: 12
- High: 12
- Medium: 4

### Count By Automation Layer

- API: 13
- Accessibility: 2
- Data Integrity: 1
- Manual: 1
- Requirement Clarification: 3
- Security: 2
- Traceability Verification: 2
- UI E2E: 3

## Validation

- Duplicate Test IDs = 0
- Invalid Story References = 0
- Missing User Stories = 0
- Encoding/Mojibake = 0
- API Tests Missing Status Codes = 0
- Generic Executable Wording = 0
- Contradictory Expected Results = 0
- Requirement Fidelity Violations = 0
- Feature Ownership Violations = 0
- Invalid Source References = 0
- Upsert Contract Coverage Gaps = 0
