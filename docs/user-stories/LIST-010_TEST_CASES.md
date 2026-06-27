# LIST-010 Test Cases

Feature: `LIST-010 - Remove place from owned list`

Primary Source: `docs/user-stories/LISTS_USER_STORIES.md`

Supporting Sources:

- `docs/feature-map/FEATURE_TRACEABILITY.md`
- `docs/user-stories/LIST-007_TEST_CASES.md`
- `docs/user-stories/LIST-008_TEST_CASES.md`
- `docs/user-stories/LIST-009_TEST_CASES.md`
- `docs/user-stories/RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`

Endpoint Under Test: `DELETE /api/v1/lists/{id}/items/{place_id}`

Traceability:

- `FEATURE_TRACEABILITY.md` maps `DELETE /api/v1/lists/{id}/items/{place_id}` to remove place from list, bearer authentication, frontend route `frontend/app/lists/[id]/page.tsx`, backend operation `delete_place_from_owned_list`, and existing backend coverage `backend/tests/api/test_places_and_lists.py`.
- `LISTS_USER_STORIES.md` defines `placeCount` as list membership count, not unique-place count across all lists.
- `LIST-007` owns owned-list detail rendering; `LIST-008` owns search/add flow; `LIST-009` owns duplicate add idempotency. LIST-010 validates only the documented remove-side integration outcomes.

## QA Execution Standards

- Executable tests validate documented `LIST-010` requirements, `FEATURE_TRACEABILITY.md` endpoint ownership, explicitly linked LIST integration requirements, or approved global responsive/accessibility requirements.
- Undefined behavior is captured as Requirement Clarification, Manual Verification, or Traceability Verification.
- LIST-010 owns removing one place membership from an owned list, removal authorization, success response body, count/detail refresh, undo, and preservation of list/place/rating data.
- LIST-010 does not own deleting places, deleting lists, rating deletion, place creation, search ranking, add idempotency implementation, cache behavior, browser-history behavior, or database locking strategy.
- API executable tests assert exact numeric status codes only where documented by the provided sources or explicitly covered by endpoint/authentication contract. The documented success body is `{ "deleted": true }`.
- Automation cadence values used in Notes: Smoke, Regression, Nightly, Manual Review.

## Deterministic Fixtures

| Fixture ID | User State | List State | Place / Rating / Membership State | Expected Baseline |
|---|---|---|---|---|
| FX-LIST-010-A | Authenticated owner `user-001` | `list-001`, name `Weekend Food`, owner `user-001`, visibility `private`, `placeCount=3` | Memberships: `place-001`, `place-002`, `place-003`; `place-001` name `مطعم الرياض`, rating `8.5`, ratingCount `2`; `place-002` name `قهوة المساء`, rating `7.0`, ratingCount `1`; `place-003` name `آيس كريم الحي`, rating `null`, ratingCount `0` | Removing `place-002` leaves `place-001` and `place-003`; `placeCount=2`; list and all places still exist. |
| FX-LIST-010-B | Authenticated owner `user-001` | `list-last-001`, name `Solo Remove`, owner `user-001`, visibility `private`, `placeCount=1` | Memberships: `place-010`; place name `Cafe One` | Removing `place-010` leaves no memberships and empty-list state. |
| FX-LIST-010-C | Authenticated non-owner `user-002` | Target `list-001` belongs to `user-001` and contains `place-002` | `user-002` has no ownership over `list-001` | Removal is denied before private list data is returned. |
| FX-LIST-010-D | Guest session | Target `list-001` exists for `user-001` | No bearer token supplied | Removal is denied and no protected list/item data is returned. |
| FX-LIST-010-E | Expired session for `user-001` | Browser may have cached `list-001` detail | Cached private list and item names may exist locally | Protected list data is not rendered before valid auth resolution. |
| FX-LIST-010-F | Authenticated owner `user-001` | Missing list ID `list-missing-404` does not exist for current user | `place-002` exists | Removal returns `404 Not Found` and no data changes. |
| FX-LIST-010-G | Authenticated owner `user-001` | `list-absent-001`, owner `user-001`, `placeCount=2` | Memberships: `place-001`, `place-003`; `place-002` exists but is not in the list | Removing absent `place-002` returns `404 Not Found`; unrelated memberships remain. |
| FX-LIST-010-H | Authenticated owner `user-001` | `list-rated-001`, owner `user-001`, `placeCount=1` | Membership: `place-rated-001`; rating aggregate average `8.5`, ratingCount `2`; current-user rating note exists outside list item response | Removal does not change rating rows, tried state, or aggregates. |
| FX-LIST-010-I | Authenticated owner `user-001` | `list-failure-001`, owner `user-001`, `placeCount=2` | Memberships: `place-001`, `place-002`; remove request fails due network or 5xx before commit | UI shows failure and current membership remains visible or is restored according to the implemented optimistic mode. |
| FX-LIST-010-J | Authenticated owner `user-001` | `list-undo-001`, owner `user-001`, `placeCount=2` | Memberships: `place-001`, `place-002`; undo is available after successful removal | Undo re-adds the same `(list, place)` pair if ownership still permits it. |
| FX-LIST-010-K | Authenticated owner `user-001` | `list-concurrent-001`, owner `user-001`, `placeCount=1` | Membership: `place-020` | Concurrent or repeated remove leaves zero memberships and no unrelated mutation. |
| FX-LIST-010-L | Authenticated owner `user-001` | `list-readd-remove-001`, owner `user-001`, `placeCount=1` after LIST-009 duplicate add remains stable | Membership: `place-030` exists exactly once | Remove after duplicate add removes the single membership only. |
| FX-LIST-010-M | Authenticated owner `user-001` | `list-mobile-001`, owner `user-001`, `placeCount=3` | Rows include Arabic, English, and mixed Arabic/English names | Used for responsive and accessibility certification. |

## LIST-010-US-001 - Remove place membership immediately

User Story Summary: As a list owner, I want to remove a place quickly so that collection maintenance stays lightweight.

Related Feature ID: `LIST-010`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-010-US-001-TC-001 | Owner removes existing membership without confirmation | API, UI, Positive | Critical | FX-LIST-010-A is loaded; `user-001` is authenticated on `/lists/list-001`. | Remove row `place-002`; endpoint `DELETE /api/v1/lists/list-001/items/place-002`; request body none. | 1. Click the remove action for `قهوة المساء`. 2. Intercept network calls. 3. Inspect visible UI before request dispatch. | No confirmation dialog appears; exactly one `DELETE /api/v1/lists/list-001/items/place-002` request is sent with no JSON body; no delete-place or delete-list endpoint is called. | LIST-010-US-001 | Yes | UI E2E | Smoke cadence. Source: LIST-010-US-001 and FEATURE_TRACEABILITY. |
| LIST-010-US-001-TC-002 | Remove action targets selected list and selected place only | API, Data Integrity | Critical | FX-LIST-010-A is loaded. | Target `(list-001, place-002)`. | 1. Send documented DELETE request. 2. Query `list-001` detail. 3. Query memberships for `place-002` in any other list fixture if present. | Membership `(list-001, place-002)` is absent; memberships `(list-001, place-001)` and `(list-001, place-003)` remain; no unrelated list membership is removed. | LIST-010-US-001 | Yes | API | Smoke cadence. |
| LIST-010-US-001-TC-003 | Feature ownership boundary is traceable | Traceability Verification | Medium | QA traceability review is being performed. | LIST-007, LIST-008, LIST-009, place/rating/list deletion requirements. | 1. Review executable LIST-010 cases. 2. Confirm out-of-scope behaviors are not asserted as LIST-010-owned behavior. | LIST-010 executable tests cover removal, authorization, response body, integrity, undo, and documented refresh outcomes only; place deletion, list deletion, rating deletion, search, and duplicate-add implementation remain outside LIST-010 executable ownership. | LIST-010-US-001 | No | Traceability Verification | Manual Review cadence. |

## LIST-010-US-002 - Require owner to remove

User Story Summary: As the system, I want only owners removing list items so that other users cannot modify lists.

Related Feature ID: `LIST-010`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-010-US-002-TC-001 | Non-owner removal is denied without private list data | API, Security, Privacy, Negative | Critical | FX-LIST-010-C is loaded; `user-002` is authenticated. | `DELETE /api/v1/lists/list-001/items/place-002`. | 1. Send remove request as `user-002`. 2. Recursively inspect response payload. 3. Query `list-001` as `user-001`. | Request is denied; response contains no `Weekend Food`, no item names, no `placeCount`, no owner identity, no private notes, no token, no stack trace, no SQL, and no debug field; owner list still contains `place-002`. | LIST-010-US-002 | Yes | Security | Smoke cadence. Exact non-owner status is tracked by LIST-010-XC-002. |
| LIST-010-US-002-TC-002 | Guest removal returns 401 and no protected payload | API, Security, Privacy, Negative | Critical | FX-LIST-010-D is loaded; no bearer token is supplied. | `DELETE /api/v1/lists/list-001/items/place-002`. | 1. Send remove request without token. 2. Inspect status and body. 3. Query owner list as `user-001`. | Response status is `401 Unauthorized`; response contains no list name, item name, `placeCount`, owner identity, private note, token, stack trace, SQL, or debug field; owner list still contains `place-002`. | LIST-010-US-002 | Yes | API | Smoke cadence. Source: list endpoints require bearer auth. |
| LIST-010-US-002-TC-003 | Expired session does not flash protected remove context | UI, Security, Privacy | Critical | FX-LIST-010-E is loaded; cached list detail may exist from prior valid session. | Expired token; route `/lists/list-001`. | 1. Open list detail with expired session. 2. Capture first paint, DOM, and accessibility tree. 3. Resolve auth as denied. | `Weekend Food`, item names, visibility, `placeCount`, remove controls, private notes, and owner identifiers are absent from visible UI, DOM, and accessibility tree before valid authorization is confirmed. | LIST-010-US-002 | Yes | Security | Smoke cadence. |

## LIST-010-US-003 - Reject removal from nonexistent list

User Story Summary: As the system, I want invalid list removals handled predictably.

Related Feature ID: `LIST-010`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-010-US-003-TC-001 | Missing list removal returns 404 with no mutation | API, Negative, Data Integrity | High | FX-LIST-010-F is loaded; `user-001` is authenticated. | `DELETE /api/v1/lists/list-missing-404/items/place-002`. | 1. Capture baseline memberships for `user-001`. 2. Send remove request. 3. Query owned lists and place catalog. | Response status is `404 Not Found`; no owned list, list item, place, or rating row changes; response contains no private list data, stack trace, SQL, or debug field. | LIST-010-US-003 | Yes | API | Regression cadence. Source: LIST-010-US-003 not-found behavior. |
| LIST-010-US-003-TC-002 | Missing list UI shows no false success | UI, Error Handling | High | FX-LIST-010-F is loaded; UI has stale remove control for missing list. | Stale target `list-missing-404`, `place-002`. | 1. Activate stale remove control. 2. Return not-found result. 3. Inspect UI. | UI shows a recoverable not-found/error state; no success toast is shown; no row is reported removed from a real list. | LIST-010-US-003 | Yes | UI E2E | Regression cadence. |

## LIST-010-US-004 - Reject removal of absent item

User Story Summary: As the system, I want repeated or invalid removals handled clearly.

Related Feature ID: `LIST-010`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-010-US-004-TC-001 | Absent item removal returns 404 and preserves unrelated memberships | API, Negative, Data Integrity | High | FX-LIST-010-G is loaded; `user-001` is authenticated. | `DELETE /api/v1/lists/list-absent-001/items/place-002`; `place-002` exists but is absent from list. | 1. Capture `placeCount=2` and memberships `place-001`, `place-003`. 2. Send remove request. 3. Query list detail. | Response status is `404 Not Found`; `placeCount` remains `2`; `place-001` and `place-003` remain; no membership for `place-002` is created or removed elsewhere. | LIST-010-US-004 | Yes | API | Regression cadence. Source: LIST-010-US-004 not-found behavior. |
| LIST-010-US-004-TC-002 | Repeated remove after successful removal returns 404 | API, Regression, Data Integrity | High | FX-LIST-010-A is loaded; `user-001` is authenticated. | Two sequential `DELETE /api/v1/lists/list-001/items/place-002` requests. | 1. Send first remove request. 2. Verify documented success body. 3. Send same DELETE again. 4. Query list detail. | First response body includes `{ "deleted": true }`; second response status is `404 Not Found`; final list has `place-001` and `place-003` only, `placeCount=2`, and no duplicate or unrelated mutation. | LIST-010-US-004 | Yes | API | Regression cadence. |
| LIST-010-US-004-TC-003 | Rapid repeated UI activation removes membership once | UI, Regression, Data Integrity | High | FX-LIST-010-K is loaded; remove action for `place-020` is visible. | Five rapid activations of remove action. | 1. Activate remove action five times rapidly by pointer or test automation. 2. Wait for all observable requests to settle. 3. Query list detail. | Final detail has `items=[]` and `placeCount=0`; at most one success state is rendered; no stale duplicate row remains visible or accessible. | LIST-010-US-004 | Yes | UI E2E | Regression cadence. |

## LIST-010-US-005 - Return delete response on success

User Story Summary: As an API consumer, I want a predictable removal response.

Related Feature ID: `LIST-010`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-010-US-005-TC-001 | Successful remove response body is deterministic | API, Contract | Critical | FX-LIST-010-A is loaded; `user-001` is authenticated. | `DELETE /api/v1/lists/list-001/items/place-002`; request body none. | 1. Send documented DELETE request. 2. Inspect response JSON. 3. Recursively inspect fields. | Response body contains documented delete result `{ "deleted": true }` either as the full JSON body or inside the documented response envelope; payload contains no list items, place details, private notes, owner email, internal auth IDs, tokens, audit/debug fields, stack traces, SQL details, or transaction diagnostics. | LIST-010-US-005 | Yes | API | Smoke cadence. Numeric success status is tracked by LIST-010-XC-001. |
| LIST-010-US-005-TC-002 | Successful remove response does not expose private membership data | API, Security, Privacy | Critical | FX-LIST-010-A plus another user's private list are loaded. | Successful remove response for `place-002`. | 1. Send remove request. 2. Inspect response body, response headers exposed to app code, and UI error/success payload. | Response exposes only documented deletion confirmation; it does not expose other users' private lists, private notes, creator identity, hidden metadata, audit/debug fields, stack traces, SQL details, or raw membership table rows. | LIST-010-US-005 | Yes | Security | Smoke cadence. |

## LIST-010-US-006 - Preserve place record

User Story Summary: As the system, I want removing from a list not to delete the place.

Related Feature ID: `LIST-010`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-010-US-006-TC-001 | Removed place still exists in catalog after membership removal | API, Data Integrity, Integration | Critical | FX-LIST-010-A is loaded. | Remove `place-002` from `list-001`; then query place `place-002` through documented place catalog/detail mechanism. | 1. Capture `place-002` baseline name `قهوة المساء`. 2. Remove membership. 3. Query place data. | `place-002` still exists with id `place-002` and name `قهوة المساء`; only membership `(list-001, place-002)` is absent. | LIST-010-US-006 | Yes | API | Smoke cadence. |
| LIST-010-US-006-TC-002 | Remove does not call delete-place endpoint | UI, Security, Data Integrity | Critical | FX-LIST-010-A is loaded and network interception is enabled. | Remove `place-002`. | 1. Activate remove action. 2. Capture all mutation requests. | The only remove mutation is `DELETE /api/v1/lists/list-001/items/place-002`; no `DELETE /api/v1/places/place-002` or equivalent place-deletion request is sent. | LIST-010-US-006 | Yes | UI E2E | Smoke cadence. |

## LIST-010-US-007 - Preserve ratings

User Story Summary: As the system, I want removing from a list not to delete ratings.

Related Feature ID: `LIST-010`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-010-US-007-TC-001 | Removing rated place preserves rating aggregate | API, Data Integrity, Integration | High | FX-LIST-010-H is loaded. | `place-rated-001` average `8.5`, ratingCount `2`; remove from `list-rated-001`. | 1. Capture rating aggregate and current-user rating context. 2. Remove membership. 3. Query rating context or place detail again. | Average rating remains `8.5`; ratingCount remains `2`; current-user rating/tried state remains unchanged; no rating row is created, edited, or deleted by removal. | LIST-010-US-007 | Yes | API | Regression cadence. |
| LIST-010-US-007-TC-002 | Remove response excludes private rating notes | API, Privacy, Security | High | FX-LIST-010-H is loaded and current-user rating note exists. | Remove `place-rated-001`. | 1. Send DELETE request. 2. Inspect response body and UI success state. | Delete response and success UI do not expose private rating note content, other users' rating data, internal rating IDs, stack traces, SQL details, or debug fields. | LIST-010-US-007 | Yes | Security | Regression cadence. |

## LIST-010-US-008 - Update list detail after removal

User Story Summary: As a user, I want removed places gone from the current list.

Related Feature ID: `LIST-010`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-010-US-008-TC-001 | Detail refresh removes row and decrements placeCount by one | UI, Data Integrity, Integration | Critical | FX-LIST-010-A is loaded on `/lists/list-001`. | Before: rows `place-001`, `place-002`, `place-003`, `placeCount=3`; remove `place-002`. | 1. Capture visible/logical row count `3`. 2. Remove `place-002`. 3. Refresh or re-request list detail. | Refreshed detail has exactly two rows: `place-001` and `place-003`; `place-002` is absent from visible DOM and accessibility tree; displayed `placeCount` is `2`. | LIST-010-US-008 | Yes | UI E2E | Smoke cadence. Source: LIST-007 and LIST-010-US-008. |
| LIST-010-US-008-TC-002 | LIST-002 count integration decrements total membership count | Integration, Data Integrity | High | FX-LIST-010-A is represented in LIST-002 summary; total owned membership count baseline includes `list-001.placeCount=3`. | Remove `place-002` from `list-001`. | 1. Capture LIST-002 visible total membership count. 2. Complete documented remove success. 3. Refresh owned-list data. | `list-001.placeCount` changes from `3` to `2`; total owned place membership count decreases by exactly `1`; list count remains unchanged. | LIST-010-US-008 | Yes | UI E2E | Regression cadence. Source: LIST-002-US-008. |
| LIST-010-US-008-TC-003 | Remove after duplicate add removes the single membership | API, Data Integrity, Integration | High | FX-LIST-010-L is loaded after LIST-009 duplicate add kept one membership for `(list-readd-remove-001, place-030)`. | `DELETE /api/v1/lists/list-readd-remove-001/items/place-030`. | 1. Confirm baseline membership count for pair is `1`. 2. Send remove request. 3. Query list detail. | Final membership count for `(list-readd-remove-001, place-030)` is `0`; list detail has `items=[]` and `placeCount=0`; no duplicate membership remains. | LIST-010-US-008 | Yes | API | Regression cadence. Source: LIST-009 and LIST-010-US-008. |
| LIST-010-US-008-TC-004 | Remove after refresh keeps deterministic state | UI, Regression | Medium | FX-LIST-010-A is loaded; page is refreshed before removal. | Route `/lists/list-001`; remove `place-002`. | 1. Open list detail. 2. Refresh page. 3. Remove `place-002`. 4. Refresh detail again. | After final refresh, `place-002` is absent, `place-001` and `place-003` remain, and `placeCount=2`. | LIST-010-US-008 | Yes | UI E2E | Regression cadence. |

## LIST-010-US-009 - Show empty state after last removal

User Story Summary: As a user, I want the list state clear after removing the final item.

Related Feature ID: `LIST-010`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-010-US-009-TC-001 | Removing final membership renders empty list state | UI, Empty State, Data Integrity | High | FX-LIST-010-B is loaded on `/lists/list-last-001`. | Before: one row `place-010`, `placeCount=1`; remove `place-010`. | 1. Remove the only membership. 2. Refresh list detail. 3. Inspect visible UI and accessibility tree. | Detail has `items=[]`; displayed `placeCount` is `0`; no stale `Cafe One` row remains visible or accessible; empty-list state appears. | LIST-010-US-009 | Yes | UI E2E | Regression cadence. |
| LIST-010-US-009-TC-002 | Empty state after final removal contains no fake item data | UI, Privacy, Data Integrity | Medium | FX-LIST-010-B is loaded and final remove succeeded. | Empty detail for `list-last-001`. | 1. Inspect DOM and accessibility tree. 2. Search for removed item fixture text and placeholder rows. | DOM and accessibility tree contain no `Cafe One`, no fake place row, no hidden removed membership, no private notes, and no debug metadata. | LIST-010-US-009 | Yes | UI E2E | Regression cadence. |

## LIST-010-US-010 - Recover from removal failure

User Story Summary: As a user, I want failed removals not to silently change the list.

Related Feature ID: `LIST-010`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-010-US-010-TC-001 | Network failure leaves item visible when no optimistic removal is used | UI, Error Handling, Data Integrity | High | FX-LIST-010-I is loaded; implementation keeps row until success. | Failed `DELETE /api/v1/lists/list-failure-001/items/place-002`. | 1. Trigger remove. 2. Simulate network failure before commit. 3. Inspect UI and list detail. | Error state is visible; `place-002` remains visible and accessible; `placeCount` remains `2`; no success toast or undo toast is shown. | LIST-010-US-010 | Yes | UI E2E | Regression cadence. Deterministic variant for non-optimistic UI. |
| LIST-010-US-010-TC-002 | 5xx failure restores item after optimistic removal | UI, Error Handling, Data Integrity | High | FX-LIST-010-I is loaded; implementation optimistically removes row before response. | Server returns 5xx before commit for `place-002`. | 1. Trigger remove. 2. Observe optimistic row removal. 3. Return 5xx. 4. Inspect final UI. | Error state is visible; `place-002` is restored to the list; `placeCount` returns to `2`; no false success or undo-restored state is shown. | LIST-010-US-010 | Yes | UI E2E | Regression cadence. Deterministic variant for optimistic UI. |
| LIST-010-US-010-TC-003 | Failed remove error payload hides internals | API, Security, Privacy | High | FX-LIST-010-I is loaded; test harness forces failed deletion before commit. | Failed delete response for `place-002`. | 1. Send remove request. 2. Inspect error payload. 3. Query list detail. | Error payload uses deterministic application error envelope; it contains no SQL, stack trace, file path, token, private note, audit/debug field, or partial membership data; membership remains unchanged. | LIST-010-US-010 | Yes | API | Regression cadence. Exact failure status is tracked by LIST-010-XC-004. |

## LIST-010-US-011 - Show undo after removal

User Story Summary: As a user, I want quick recovery after removing a place so that accidental removals are reversible.

Related Feature ID: `LIST-010`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-010-US-011-TC-001 | Successful removal shows undo control and re-adds same membership | UI, Data Integrity, Positive | High | FX-LIST-010-J is loaded; `user-001` owns `list-undo-001`. | Remove and undo `place-002`. | 1. Remove `place-002`. 2. Inspect undo toast/snackbar. 3. Activate undo before expiration. 4. Refresh list detail. | Undo toast/snackbar appears after successful removal; activating undo restores exactly one `(list-undo-001, place-002)` membership; `placeCount` returns to `2`; no duplicate row is created. | LIST-010-US-011 | Yes | UI E2E | Smoke cadence. |
| LIST-010-US-011-TC-002 | Undo re-add uses same list and same place context | API, Integration, Data Integrity | High | FX-LIST-010-J is loaded and removal succeeded. | Undo action for `(list-undo-001, place-002)`. | 1. Capture undo-triggered mutation request. 2. Activate undo. 3. Query list detail. | Undo targets `list-undo-001` and `place-002`; final list has `place-001` and `place-002`; no other list receives `place-002`. | LIST-010-US-011 | Yes | API | Regression cadence. Add mechanics remain LIST-008/LIST-009-owned; LIST-010 validates undo context only. |
| LIST-010-US-011-TC-003 | Undo availability is announced accessibly | Accessibility, UI | High | FX-LIST-010-J is loaded; remove succeeds. | Undo toast/snackbar. | 1. Remove `place-002`. 2. Inspect live region and accessibility tree. | Undo availability is announced through visible status text and `role=status`, `aria-live=polite`, or equivalent; the undo control has an accessible name that communicates restoring the removed place. | LIST-010-US-011 | Yes | Accessibility | Regression cadence. Source: LIST-010-US-014 and global live/status requirements. |

## LIST-010-US-012 - Expire undo safely

User Story Summary: As the system, I want undo to be time-limited so that state remains predictable.

Related Feature ID: `LIST-010`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-010-US-012-TC-001 | Expired undo leaves removal final | UI, Data Integrity, Regression | Medium | FX-LIST-010-J is loaded; removal succeeds and undo toast appears. | Remove `place-002`; do not activate undo. | 1. Remove `place-002`. 2. Wait until the product-defined undo window expires. 3. Refresh list detail. | After undo expires, `place-002` remains absent; `placeCount=1`; no automatic re-add request is sent. | LIST-010-US-012 | Yes | UI E2E | Regression cadence. The exact duration is tracked by LIST-010-XC-005. |
| LIST-010-US-012-TC-002 | Expired undo control cannot restore removed item | UI, Error Handling | Medium | FX-LIST-010-J is loaded; undo window has expired. | Expired undo control if still visible or stale activation event. | 1. Attempt to activate undo after expiration through UI or stale event. 2. Query list detail. | No membership is restored; `place-002` remains absent; UI does not show false restored state. | LIST-010-US-012 | Yes | UI E2E | Nightly cadence. |

## LIST-010-US-013 - Handle undo failure

User Story Summary: As a user, I want undo failures explained so that recovery state is clear.

Related Feature ID: `LIST-010`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-010-US-013-TC-001 | Undo network failure shows error and no false restored state | UI, Error Handling, Data Integrity | Medium | FX-LIST-010-J is loaded; removal succeeded; undo action is available. | Undo request fails due network. | 1. Activate undo. 2. Simulate network failure before re-add commit. 3. Inspect UI and refreshed list detail. | Error state is visible; `place-002` remains absent after refresh; UI does not show restored row or restored `placeCount`. | LIST-010-US-013 | Yes | UI E2E | Regression cadence. |
| LIST-010-US-013-TC-002 | Undo authorization failure does not expose private list data | API, Security, Privacy | Medium | FX-LIST-010-J is loaded; session expires after removal before undo. | Undo action after auth expiry. | 1. Remove `place-002`. 2. Expire session. 3. Activate undo. 4. Inspect response/UI. | Undo fails with auth/denial state; response and UI contain no private list data, private notes, owner identity, token, SQL, stack trace, or debug fields; `place-002` remains absent. | LIST-010-US-013 | Yes | Security | Regression cadence. |
| LIST-010-US-013-TC-003 | Undo missing place or list failure shows no false restored state | UI, Error Handling | Medium | FX-LIST-010-J is loaded; after removal, target place or list becomes unavailable before undo. | Undo for missing target. | 1. Remove `place-002`. 2. Simulate missing list/place before undo. 3. Activate undo. 4. Refresh list context if available. | UI shows an error; no restored row or restored count is displayed; no unrelated membership is created. | LIST-010-US-013 | Yes | UI E2E | Nightly cadence. |

## LIST-010-US-014 - Keep remove action accessible and non-destructive-looking

User Story Summary: As a keyboard or screen-reader user, I want removal understandable.

Related Feature ID: `LIST-010`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-010-US-014-TC-001 | Remove button has exact accessible name and non-place-delete wording | Accessibility, UI | High | FX-LIST-010-M is loaded with at least one removable row. | Remove action for `place-002`. | 1. Inspect visible text and accessibility tree for the remove action. 2. Compare accessible name. | Remove action accessible name is `إزالة من القائمة` or documented equivalent; visible/accessibility text does not say or imply deleting the place record. | LIST-010-US-014 | Yes | Accessibility | Smoke cadence. Source: LIST-010-US-014. |
| LIST-010-US-014-TC-002 | Keyboard-only removal is operable | Accessibility, UI | High | FX-LIST-010-M is loaded. | Keyboard path to remove `place-002`. | 1. Use Tab/Shift+Tab to reach the row action. 2. Verify focus indicator. 3. Activate with Enter or Space. | Remove action is keyboard reachable; visible `focus-visible` appears; Enter or Space triggers the documented remove request for selected row only. | LIST-010-US-014 | Yes | Accessibility | Regression cadence. Source: RESP-003-US-003. |
| LIST-010-US-014-TC-003 | Focus moves to logical fallback after removed row unmounts | Accessibility, UI | High | FX-LIST-010-A is loaded; keyboard focus is on remove button for `place-002`. | Remove `place-002` by keyboard. | 1. Focus remove button. 2. Activate removal. 3. Wait for successful row removal. 4. Inspect active element. | Focus does not move to `body`; focus lands on the undo control, next logical row, list heading, or documented safe fallback. | LIST-010-US-014 | Yes | Accessibility | Regression cadence. Source: A11Y-001-US-007. |
| LIST-010-US-014-TC-004 | Remove and undo controls meet touch target minimum | Accessibility, Mobile | Medium | FX-LIST-010-M is loaded at mobile viewport. | Remove button and undo control. | 1. Set viewport `390x844`. 2. Measure remove and undo interactive bounds. | Each remove and undo interactive target is at least `44x44` CSS pixels and remains reachable. | LIST-010-US-014 | Yes | Accessibility | Regression cadence. Source: RESP-001-US-010, RESP-003-US-008. |
| LIST-010-US-014-TC-005 | Reduced motion preserves remove and undo function | Accessibility, Reduced Motion | Medium | FX-LIST-010-M is loaded; `prefers-reduced-motion` active. | Remove and undo flow. | 1. Enable reduced motion. 2. Remove `place-002`. 3. Activate undo. | Removal, status feedback, and undo are completeable without relying on animation; no required information is conveyed only through motion. | LIST-010-US-014 | Yes | Accessibility | Nightly cadence. Source: RESP-003-US-016, RESP-003-US-017. |
| LIST-010-US-014-TC-006 | Forced colors preserve remove, focus, error, and undo visibility | Accessibility, Forced Colors | Medium | FX-LIST-010-M is loaded; forced-colors mode active. | Remove button, focus state, undo toast, error state. | 1. Enable forced colors. 2. Tab to remove action. 3. Trigger success and failure variants. | Remove control, focus indicator, success/undo status, and error text remain distinguishable; required text does not disappear. | LIST-010-US-014 | Yes | Accessibility | Nightly cadence. Source: RESP-003-US-014, RESP-003-US-015. |

## Concurrency and Regression Coverage

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-010-REG-TC-001 | Concurrent remove requests leave one final removal and no unrelated mutation | API, Concurrency, Data Integrity | Critical | FX-LIST-010-K is loaded; membership `(list-concurrent-001, place-020)` exists once. | Two simultaneous `DELETE /api/v1/lists/list-concurrent-001/items/place-020` requests. | 1. Start both DELETE requests concurrently. 2. Wait for both responses. 3. Query list detail and place catalog. | Final list has `items=[]` and `placeCount=0`; `place-020` still exists; no unrelated memberships are removed; at most one response includes `{ "deleted": true }`; any response after the membership is absent is `404 Not Found` with privacy-safe error payload. | LIST-010-US-004 | Yes | API | Smoke cadence. Observable behavior only; no lock strategy asserted. |
| LIST-010-REG-TC-002 | Remove from one list leaves same place in another owned list | API, Data Integrity, Integration | High | `user-001` owns `list-001` and `list-002`; both contain `place-002`. | Remove `place-002` from `list-001` only. | 1. Remove from `list-001`. 2. Query `list-001` and `list-002`. | `place-002` is absent from `list-001`; `place-002` remains in `list-002`; `list-001.placeCount` decrements by `1`; `list-002.placeCount` is unchanged. | LIST-010-US-001 | Yes | API | Regression cadence. |
| LIST-010-REG-TC-003 | Browser refresh after removal shows persisted removed state | UI, Regression | Medium | FX-LIST-010-A is loaded; removal of `place-002` succeeds. | Refresh `/lists/list-001`. | 1. Remove `place-002`. 2. Refresh browser. 3. Inspect detail. | Refreshed detail has rows `place-001` and `place-003` only; `place-002` is absent; `placeCount=2`. | LIST-010-US-008 | Yes | UI E2E | Regression cadence. Refresh verifies persisted documented state, not browser-history behavior. |

## Responsive Certification

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-010-RESP-TC-001 | Remove flow fits required mobile viewports | Responsive, Mobile, UI | High | FX-LIST-010-M is loaded; list detail has removable rows. | Viewports `320x568`, `390x844`, `430x932`. | 1. Set each viewport. 2. Open `/lists/list-mobile-001`. 3. Remove one row and inspect final content. | At each viewport, `document.documentElement.scrollWidth <= window.innerWidth`; remove controls, undo status, and final row are visible or reachable; bottom navigation/safe-area padding does not obscure final interactive element. | LIST-010-US-014 | Yes | UI E2E | Regression cadence. Source: RESP-001-US-011, RESP-002-US-001, RESP-002-US-002, RESP-002-US-005. |
| LIST-010-RESP-TC-002 | Remove flow works in landscape and tablet/desktop matrix | Responsive, UI | Medium | FX-LIST-010-M is loaded. | Viewports `1024x768`, `768x1024`, `1440x900`, phone landscape. | 1. Render list detail at each viewport. 2. Remove `place-002`. 3. Inspect layout. | Rows, remove controls, count, error/success state, and undo control remain readable and operable; no horizontal overflow occurs. | LIST-010-US-014 | Yes | UI E2E | Nightly cadence. Source: RESP-002-US-001, RESP-002-US-012, RESP-002-US-013, RESP-002-US-014, RESP-002-US-015. |
| LIST-010-RESP-TC-003 | Remove flow remains usable at 200% zoom | Responsive, Accessibility | High | FX-LIST-010-M is loaded; 200% browser zoom active. | Remove row and undo flow. | 1. Enable 200% zoom. 2. Open list detail. 3. Remove row and inspect undo. | `document.documentElement.scrollWidth <= window.innerWidth`; remove action, undo action, count, and error/success text remain visible and operable. | LIST-010-US-014 | Yes | Accessibility | Regression cadence. Source: RESP-003-US-001, RESP-003-US-002, RESP-003-US-003, RESP-003-US-008. |

## Clarification and Traceability Cases

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-010-XC-001 | Remove success numeric HTTP status requires explicit contract | Requirement Clarification | Critical | LIST-010 source documents endpoint and `{ "deleted": true }` body but not exact numeric success status. | Candidate success status such as `200 OK` or `204 No Content`. | 1. Review API contract and implementation spec. 2. Confirm exact numeric status for `DELETE /api/v1/lists/{id}/items/{place_id}` success. | Executable tests assert documented body and end-state only; no numeric success status is asserted until documented. | LIST-010-US-005 | No | Requirement Clarification | Manual Review cadence. |
| LIST-010-XC-002 | Non-owner denial numeric status requires explicit contract | Requirement Clarification | High | LIST-010 requires denial without exposing private list data but does not specify exact authenticated non-owner status. | Candidate statuses `403 Forbidden` or privacy-preserving `404 Not Found`. | 1. Review API error taxonomy. 2. Confirm exact status for authenticated non-owner removal attempt. | Executable tests assert denial, no mutation, and no data leakage; exact numeric status is not asserted until documented. | LIST-010-US-002 | No | Requirement Clarification | Manual Review cadence. |
| LIST-010-XC-003 | Stale remove-item API spec path mismatch requires alignment | Requirement Clarification | High | LIST-010 and FEATURE_TRACEABILITY use `/items/{place_id}` and absent item/list returns `404 Not Found`; older API spec mentions `/places/{placeId}` and idempotent absent success. | Current endpoint path and absent-member behavior. | 1. Review source requirements, API spec, and endpoint map. 2. Align API specification with LIST-010 source. | LIST-010 executable tests follow current user stories and feature traceability: `/items/{place_id}` and `404 Not Found` for nonexistent list or absent item; stale spec differences are tracked for documentation correction. | LIST-010-US-003 | No | Requirement Clarification | Manual Review cadence. |
| LIST-010-XC-004 | Failure status taxonomy requires explicit contract | Requirement Clarification | Medium | LIST-010-US-010 defines network/5xx failure recovery but not exact domain error codes for every failure mode. | Network error, 5xx, pre-commit failure. | 1. Review API error taxonomy. 2. Confirm status/error codes for failure categories. | Executable tests assert unchanged/restored UI state and privacy-safe error payload; exact numeric failure status is not asserted unless documented. | LIST-010-US-010 | No | Requirement Clarification | Manual Review cadence. |
| LIST-010-XC-005 | Undo window duration requires explicit product value | Requirement Clarification | Medium | LIST-010-US-012 says undo appears for a short period but does not define duration. | Undo duration. | 1. Review product interaction spec. 2. Confirm exact undo duration or acceptable range. | Executable expiry tests use the product-defined undo duration once documented; no arbitrary timeout is invented by QA. | LIST-010-US-012 | No | Requirement Clarification | Manual Review cadence. |
| LIST-010-XC-006 | Add implementation for undo remains LIST-008/LIST-009-owned | Traceability Verification | Medium | Undo re-adds same place to same list if ownership permits. | LIST-008 add endpoint and LIST-009 duplicate handling. | 1. Review undo tests. 2. Review LIST-008 and LIST-009 packages. | LIST-010 validates undo context and restored membership outcome; add payload validation, search, and duplicate add idempotency remain LIST-008/LIST-009-owned. | LIST-010-US-011 | No | Traceability Verification | Manual Review cadence. |
| LIST-010-XC-007 | Database locking strategy remains implementation detail | Requirement Clarification | Low | Concurrent remove is tested by observable final state. | Locking, isolation level, retry count. | 1. Review concurrency tests. 2. Confirm no lock internals are asserted. | LIST-010 validates final membership state and privacy-safe responses only; lock type, isolation level, and retry strategy are not executable QA expectations. | LIST-010-US-004 | No | Requirement Clarification | Manual Review cadence. |

## Final Summary

1. User stories processed: 14
2. Total executable test cases: 45
3. Clarification / Manual / Traceability cases: 8
4. Total test cases: 53
5. Test count per user story:
   - LIST-010-US-001: 4
   - LIST-010-US-002: 4
   - LIST-010-US-003: 4
   - LIST-010-US-004: 5
   - LIST-010-US-005: 3
   - LIST-010-US-006: 2
   - LIST-010-US-007: 2
   - LIST-010-US-008: 5
   - LIST-010-US-009: 2
   - LIST-010-US-010: 4
   - LIST-010-US-011: 4
   - LIST-010-US-012: 3
   - LIST-010-US-013: 3
   - LIST-010-US-014: 9
6. Count by test type:
   - Accessibility: 10
   - API: 18
   - Concurrency: 1
   - Contract: 1
   - Data Integrity: 21
   - Empty State: 1
   - Error Handling: 6
   - Forced Colors: 1
   - Integration: 7
   - Mobile: 2
   - Negative: 4
   - Positive: 2
   - Privacy: 8
   - Reduced Motion: 1
   - Regression: 5
   - Requirement Clarification: 6
   - Responsive: 3
   - Security: 8
   - Traceability Verification: 2
   - UI: 23
7. Count by priority:
   - Critical: 12
   - High: 24
   - Medium: 16
   - Low: 1
8. Count by automation layer:
   - API: 13
   - Accessibility: 8
   - Security: 5
   - Traceability Verification: 2
   - Requirement Clarification: 6
   - UI E2E: 19
9. Top automation candidates:
   - `DELETE /api/v1/lists/{id}/items/{place_id}` membership removal, denial, not-found, and privacy-safe response checks.
   - UI E2E for no-confirmation removal, row disappearance, updated `placeCount`, empty state, failure recovery, and undo.
   - Data-integrity automation for list/place/rating preservation and unrelated membership preservation.
   - Concurrency automation for repeated and simultaneous remove requests.
   - Accessibility automation for Arabic accessible name, keyboard removal, focus fallback, live-region undo announcement, touch targets, reduced motion, and forced colors.

## Validation

- Duplicate Test IDs = 0
- Invalid Story References = 0
- Missing User Stories = 0
- Encoding/Mojibake = 0
- API Tests Missing Status Codes = 0 for documented numeric status assertions; undocumented numeric statuses are isolated as Requirement Clarification
- Requirement Fidelity Violations = 0
- Feature Ownership Violations = 0
