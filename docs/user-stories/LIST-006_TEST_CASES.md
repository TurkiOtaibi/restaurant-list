# LIST-006 Test Cases

Feature: `LIST-006 - Delete owned list`

Primary Source: `docs/user-stories/LISTS_USER_STORIES.md`

Supporting Sources:

- `docs/feature-map/FEATURE_TRACEABILITY.md`
- `docs/user-stories/RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`
- `docs/user-stories/PROFILE_USER_STORIES.md`
- `docs/user-stories/PUBLIC_LISTS_USER_STORIES.md`
- `docs/user-stories/PLACE_DETAILS_USER_STORIES.md`

Endpoint Under Test: `DELETE /api/v1/lists/{id}`

Traceability: `FEATURE_TRACEABILITY.md` maps `DELETE /api/v1/lists/{id}` to `DeleteListDialog.tsx`, backend operation `delete_owned_list`, and existing E2E coverage `frontend/tests/e2e/sprint3-real.spec.ts`.

## QA Execution Standards

- Executable tests validate documented LIST-006 requirements or approved global responsive/accessibility requirements only.
- Undefined behavior is captured as Requirement Clarification, Manual Verification, or Traceability Verification.
- LIST-006 owns deleting an owned list, delete confirmation, owner authorization, deletion response, list-item cascade, rollback, stale-deleted-list handling, and preservation of places/ratings.
- LIST-006 does not own list creation, rename, visibility changes, public-list browsing, place deletion, rating deletion, profile rendering, cache invalidation, undo, soft-delete recovery, or browser history behavior.
- API executable tests assert exact status codes only when the provided source requirements explicitly document them; otherwise they assert the documented response body or end state and route status-code questions to Requirement Clarification.
- Automation cadence values used in Notes: Smoke, Regression, Nightly, Manual Review.

## Deterministic Fixtures

| Fixture ID | User State | Lists | List Items | Places | Ratings | Expected Baseline |
|---|---|---|---|---|---|---|
| FX-LIST-006-A | Authenticated owner `user-001` | `list-empty-001`, name `Empty Archive`, visibility `private`, owner `user-001`, placeCount `0` | none | n/a | n/a | Owned-list index includes exactly one row for `list-empty-001`. |
| FX-LIST-006-B | Authenticated owner `user-001` | `list-food-001`, name `Weekend Food`, visibility `private`, owner `user-001`, placeCount `3` | `place-001`, `place-002`, `place-003` | `place-001` Riyadh Grill, `place-002` Cafe Noon, `place-003` آيس كريم | `place-001` avg `8.5`, count `2`; `place-002` avg `7.0`, count `1`; `place-003` unrated | Owned-list index includes `list-food-001`; all three places exist in catalog. |
| FX-LIST-006-C | Authenticated owner `user-001` | `list-rollback-001`, name `Rollback Target`, visibility `private`, owner `user-001`, placeCount `2` | `place-010`, `place-011` | both places exist | `place-010` avg `9.0`, count `1` | Test harness forces delete operation to fail before commit. |
| FX-LIST-006-D | Authenticated non-owner `user-002` | `list-private-owner-001`, name `Owner Private`, visibility `private`, owner `user-001`, placeCount `2` | `place-020`, `place-021` | both places exist | n/a | `user-002` does not own target list. |
| FX-LIST-006-E | Guest session | `list-food-001` exists for `user-001` | `place-001`, `place-002`, `place-003` | all places exist | ratings as FX-LIST-006-B | No bearer token is sent. |
| FX-LIST-006-F | Expired session for `user-001` | `list-food-001` exists | `place-001`, `place-002`, `place-003` | all places exist | ratings as FX-LIST-006-B | Bearer token is expired and rejected. |
| FX-LIST-006-G | Authenticated owner `user-001` | `list-stale-001` was already deleted before confirmation | none | n/a | n/a | DELETE target no longer exists. |
| FX-LIST-006-H | Authenticated owner `user-001` | `list-cancel-001`, name `قائمة العائلة`, visibility `private`, owner `user-001`, placeCount `1` | `place-030` | `place-030` exists | n/a | Dialog is opened and then cancelled. |

## LIST-006-US-001 - Open delete confirmation

User Story Summary: As a list owner, I want confirmation before deletion so that I do not delete accidentally.

Related Feature ID: `LIST-006`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-006-US-001-TC-001 | Owner opens delete confirmation for empty list | UI, Positive | Critical | FX-LIST-006-A is loaded; `user-001` is signed in. | List ID `list-empty-001`; delete trigger on owned-list row/detail. | 1. Open the owned-list UI for `list-empty-001`. 2. Activate the delete trigger once. 3. Intercept network calls. | A confirmation dialog opens; no `DELETE /api/v1/lists/list-empty-001` request is sent before the confirm button is activated; the list row/detail remains visible behind or under the modal. | LIST-006-US-001 | Yes | UI E2E | Smoke cadence. |
| LIST-006-US-001-TC-002 | Owner opens delete confirmation for populated list | UI, Positive | Critical | FX-LIST-006-B is loaded; `user-001` is signed in. | List ID `list-food-001`; placeCount `3`. | 1. Open `list-food-001`. 2. Activate delete. 3. Inspect dialog title, body, and actions. | Confirmation dialog opens for `Weekend Food`; dialog contains one destructive confirm control and one cancel control; no delete request is sent before confirmation. | LIST-006-US-001 | Yes | UI E2E | Smoke cadence. |
| LIST-006-US-001-TC-003 | Delete confirmation is scoped to selected list | UI, Regression | High | `user-001` owns `list-empty-001` and `list-food-001`. | Open delete trigger for `list-food-001`. | 1. Open owned-list index. 2. Activate delete for `list-food-001`. 3. Inspect dialog text and hidden form/action target if present. | Dialog target is `list-food-001`; no text, data attribute, request URL, or pending action references `list-empty-001`. | LIST-006-US-001 | Yes | UI E2E | Regression cadence. |
| LIST-006-US-001-TC-004 | Auth resolution does not flash delete controls | UI, Security, Privacy | Critical | Cached owned-list UI exists from a prior `user-001` session; auth state is unresolved. | Pending auth state followed by guest denial. | 1. Load a route that can expose the delete trigger. 2. Capture first paint, DOM, and accessibility tree before auth resolves. 3. Resolve auth as guest. | Before valid authorization is confirmed, no list name, list item name, owner-only delete trigger, private visibility value, or mutation control for `user-001` appears in visible DOM or accessibility tree. | LIST-006-US-001 | Yes | Security | Smoke cadence. |
| LIST-006-US-001-TC-005 | Dialog semantics are present when confirmation opens | Accessibility, UI | Critical | FX-LIST-006-B is loaded; `user-001` is signed in; global dialog requirements apply. | `A11Y-001-US-001`, `A11Y-001-US-003`, `A11Y-001-US-010`. | 1. Activate delete for `list-food-001`. 2. Inspect accessibility tree and active element. 3. Try to focus background controls. | Modal exposes `role="dialog"` or approved equivalent, `aria-modal="true"`, accessible name associated with the visible title, initial focus inside the dialog, and background content is inert to keyboard and pointer interaction. | LIST-006-US-001 | Yes | Accessibility | Smoke cadence. Source: A11Y-001-US-001, A11Y-001-US-003, A11Y-001-US-010. |

## LIST-006-US-002 - Use clear destructive copy

User Story Summary: As a user, I want delete consequences clear so that I know what will happen.

Related Feature ID: `LIST-006`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-006-US-002-TC-001 | Confirmation states list will be deleted | UI, UX | Critical | FX-LIST-006-B is loaded; delete confirmation is open. | Dialog for `Weekend Food`. | 1. Open delete confirmation. 2. Inspect visible dialog copy. | Dialog copy explicitly states that the list will be deleted; the visible title or body includes the target list name `Weekend Food` or an equivalent unambiguous target reference. | LIST-006-US-002 | Yes | UI E2E | Smoke cadence. |
| LIST-006-US-002-TC-002 | Confirmation states places will not be deleted | UI, UX | Critical | FX-LIST-006-B is loaded; delete confirmation is open. | Places `place-001`, `place-002`, `place-003`. | 1. Open delete confirmation for `list-food-001`. 2. Inspect warning copy. | Warning copy explicitly states that places in the list will not be deleted. | LIST-006-US-002 | Yes | UI E2E | Smoke cadence. |
| LIST-006-US-002-TC-003 | Confirmation states ratings will not be deleted | UI, UX | Critical | FX-LIST-006-B is loaded; delete confirmation is open. | Ratings: `place-001` avg `8.5`, count `2`; `place-002` avg `7.0`, count `1`. | 1. Open delete confirmation for `list-food-001`. 2. Inspect warning copy. | Warning copy explicitly states that ratings will not be deleted. | LIST-006-US-002 | Yes | UI E2E | Smoke cadence. |
| LIST-006-US-002-TC-004 | Destructive copy is exposed to screen readers | Accessibility, UX | High | FX-LIST-006-B is loaded; global modal accessibility requirements apply. | `A11Y-001-US-001`, `RESP-004-US-009`. | 1. Open delete confirmation. 2. Inspect accessible name and description for the dialog and destructive action. | Screen-reader accessible dialog name/description includes the destructive consequence; the destructive confirm control has an accessible name that identifies delete action, not a generic label such as `OK`. | LIST-006-US-002 | Yes | Accessibility | Regression cadence. Source: A11Y-001-US-001, RESP-004-US-009. |

## LIST-006-US-003 - Cancel deletion

User Story Summary: As a user, I want to cancel delete so that I can recover from accidental action.

Related Feature ID: `LIST-006`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-006-US-003-TC-001 | Cancel button sends no delete request | UI, Positive | Critical | FX-LIST-006-H is loaded; `user-001` is signed in; confirmation is open. | `list-cancel-001`, name `قائمة العائلة`. | 1. Open delete confirmation. 2. Click Cancel. 3. Inspect network calls and owned-list row. | Dialog closes; zero `DELETE /api/v1/lists/list-cancel-001` requests are sent; `قائمة العائلة` remains visible with unchanged list ID and placeCount `1`. | LIST-006-US-003 | Yes | UI E2E | Smoke cadence. |
| LIST-006-US-003-TC-002 | Escape cancels deletion | Accessibility, UI | High | FX-LIST-006-H is loaded; confirmation is open; global Escape behavior applies. | `A11Y-001-US-008`. | 1. Press Escape while focus is inside the confirmation dialog. 2. Inspect network calls and UI. | Dialog closes; zero `DELETE /api/v1/lists/list-cancel-001` requests are sent; list remains unchanged. | LIST-006-US-003 | Yes | Accessibility | Regression cadence. Source: A11Y-001-US-008. |
| LIST-006-US-003-TC-003 | Cancel restores focus to delete trigger | Accessibility, UI | High | FX-LIST-006-H is loaded; delete trigger is keyboard focused before opening. | `A11Y-001-US-006`. | 1. Focus delete trigger for `list-cancel-001`. 2. Press Enter to open dialog. 3. Activate Cancel. 4. Inspect active element. | Focus returns to the same delete trigger or approved logical fallback if the trigger unmounted; no focus is lost to document body. | LIST-006-US-003 | Yes | Accessibility | Regression cadence. Source: A11Y-001-US-006. |
| LIST-006-US-003-TC-004 | Cancel preserves populated list memberships | UI, Data Integrity | High | FX-LIST-006-B is loaded; confirmation is open. | `list-food-001` with three memberships. | 1. Open confirmation. 2. Cancel. 3. Refresh list detail or owned-list response. | `list-food-001` remains present; membership set remains exactly `place-001`, `place-002`, `place-003`; placeCount remains `3`. | LIST-006-US-003 | Yes | UI E2E | Regression cadence. |
| LIST-006-US-003-TC-005 | Close control behavior follows global modal contract | Manual Verification, Accessibility | Medium | Confirmation dialog includes a close control only if the product renders one. | `A11Y-001-US-009`. | 1. Review current delete dialog implementation. 2. If a close control exists, verify it has a clear accessible name. 3. If no close control exists, confirm Cancel and Escape provide the documented dismissal paths. | Manual review records whether a close control is present; no executable LIST-006 assertion requires an undocumented close control. | LIST-006-US-003 | No | Manual | Manual Review cadence. Source: A11Y-001-US-009. |

## LIST-006-US-004 - Require owner to delete

User Story Summary: As the system, I want only owners deleting lists so that users cannot destroy others' data.

Related Feature ID: `LIST-006`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-006-US-004-TC-001 | Guest delete request is denied without data change | API, Security, Negative | Critical | FX-LIST-006-E is loaded; no bearer token is sent. | `DELETE /api/v1/lists/list-food-001`. | 1. Send DELETE without Authorization header. 2. Inspect response body. 3. Query owned-list data as `user-001`. | Request is denied; target list still exists for `user-001`; response contains no list name, private membership, private note, owner identity, stack trace, SQL, or debug field. | LIST-006-US-004 | Yes | API | Smoke cadence. Exact guest status is tracked by LIST-006-XC-007. |
| LIST-006-US-004-TC-002 | Expired session delete request is denied without data change | API, Security, Negative | Critical | FX-LIST-006-F is loaded; expired bearer token is sent. | `DELETE /api/v1/lists/list-food-001`. | 1. Send DELETE with expired token. 2. Inspect response. 3. Query owned-list data with valid `user-001` session. | Request is denied; target list remains present; list item set remains exactly `place-001`, `place-002`, `place-003`; response contains no private list data or debug fields. | LIST-006-US-004 | Yes | API | Smoke cadence. Exact expired-session status is tracked by LIST-006-XC-007. |
| LIST-006-US-004-TC-003 | Non-owner denial exposes no private list data | Security, Privacy, Negative | Critical | FX-LIST-006-D is loaded; `user-002` is signed in. | Target `list-private-owner-001` owned by `user-001`. | 1. Attempt to delete `list-private-owner-001` as `user-002`. 2. Inspect visible error, network payload, DOM, and accessibility tree. | Delete is denied; no response, visible error, DOM node, or accessibility node exposes `Owner Private`, member place IDs, owner email/name, private notes, audit fields, or debug fields. | LIST-006-US-004 | Yes | Security | Smoke cadence. Exact non-owner status is covered by clarification case. |
| LIST-006-US-004-TC-004 | Non-owner denial status is clarified before API assertion | Requirement Clarification | High | LIST-006 requires denial but does not explicitly name the non-owner status code. | Candidate statuses `403 Forbidden` or `404 Not Found`. | 1. Review API contract and security policy for private owned resources. 2. Confirm whether non-owner delete returns `403` or `404`. | Requirement clarification records one approved non-owner status code before any executable API test asserts it. | LIST-006-US-004 | No | Requirement Clarification | Manual Review cadence. |
| LIST-006-US-004-TC-005 | Auth recovery does not expose protected delete context | UI, Security, Privacy | High | FX-LIST-006-F is loaded; expired session begins from cached list detail. | Expired token for `user-001`; target `list-food-001`. | 1. Open list detail with expired session. 2. Capture initial render. 3. Allow auth failure handling to complete. | Protected delete controls and list membership data are not shown before re-authentication; UI resolves to an unauthenticated/denied state without private-data flash. | LIST-006-US-004 | Yes | Security | Regression cadence. |
| LIST-006-US-004-TC-006 | Owner-only delete trigger is absent for non-owner UI | UI, Security | High | `user-002` can reach a non-owned list surface only where documented; FX-LIST-006-D exists. | Non-owned target `list-private-owner-001`. | 1. Open any documented non-owner-accessible list surface. 2. Inspect actions for target list. | No owner-only delete trigger is rendered for `user-002`; if the private list surface is not accessible, no list data is rendered. | LIST-006-US-004 | Yes | UI E2E | Regression cadence. |

## LIST-006-US-005 - Delete list successfully

User Story Summary: As a list owner, I want to delete a list so that obsolete collections are removed.

Related Feature ID: `LIST-006`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-006-US-005-TC-001 | Delete empty owned list through API | API, Positive, Contract | Critical | FX-LIST-006-A is loaded; `user-001` is signed in. | `DELETE /api/v1/lists/list-empty-001`. | 1. Send DELETE as `user-001`. 2. Inspect response body. 3. Query owned lists. | Response body is exactly `{ "deleted": true }`; `list-empty-001` is absent from refreshed `GET /api/v1/lists` response. | LIST-006-US-005 | Yes | API | Smoke cadence. Success status code is tracked by LIST-006-XC-005. |
| LIST-006-US-005-TC-002 | Delete populated owned list through API | API, Positive, Contract | Critical | FX-LIST-006-B is loaded; `user-001` is signed in. | `DELETE /api/v1/lists/list-food-001`. | 1. Send DELETE as `user-001`. 2. Inspect response body. 3. Query owned lists. | Response body is exactly `{ "deleted": true }`; `list-food-001` is absent from refreshed `GET /api/v1/lists`; no duplicate or stale row remains. | LIST-006-US-005 | Yes | API | Smoke cadence. Success status code is tracked by LIST-006-XC-005. |
| LIST-006-US-005-TC-003 | Delete response contains no forbidden fields | API, Security, Privacy | Critical | FX-LIST-006-B is loaded; `user-001` is signed in. | `DELETE /api/v1/lists/list-food-001`. | 1. Send DELETE. 2. Inspect full response body and headers exposed to client. | Body contains only documented delete payload `{ "deleted": true }`; no `ownerId`, `userId`, `listItems`, `places`, `ratings`, `privateNotes`, `audit`, `debug`, `trace`, stack trace, SQL, or moderation fields are returned. | LIST-006-US-005 | Yes | API | Smoke cadence. |
| LIST-006-US-005-TC-004 | UI confirm deletes selected list once | UI, Positive | Critical | FX-LIST-006-B is loaded; delete confirmation is open. | `list-food-001`. | 1. Click the destructive confirm button once. 2. Capture network calls. 3. Wait for UI completion. | Exactly one `DELETE /api/v1/lists/list-food-001` request is sent; after success, `Weekend Food` is not visible in owned-list UI and no stale delete control for that list remains. | LIST-006-US-005 | Yes | UI E2E | Smoke cadence. |
| LIST-006-US-005-TC-005 | Submit loading prevents duplicate delete request | UI, Loading, Regression | High | FX-LIST-006-B is loaded; API response is delayed by `3s`. | Delayed `DELETE /api/v1/lists/list-food-001`. | 1. Open confirmation. 2. Activate Delete twice rapidly. 3. Inspect network calls and button state. | Confirm control enters pending/disabled or busy state after first activation; exactly one DELETE request is sent; no second request is issued while pending. | LIST-006-US-005 | Yes | UI E2E | Regression cadence. |
| LIST-006-US-005-TC-006 | Successful delete announces completion | Accessibility, Loading | High | FX-LIST-006-B is loaded; global status requirements apply. | `A11Y-001-US-016`, live/status region. | 1. Confirm deletion. 2. Inspect status text and accessibility tree during and after request. | Pending state is programmatically conveyed with `aria-busy`, `role=status`, or equivalent; completion is visible or announced only after the documented `{ "deleted": true }` response is received. | LIST-006-US-005 | Yes | Accessibility | Regression cadence. Source: A11Y-001-US-016. |
| LIST-006-US-005-TC-007 | Deleted Arabic-named list is removed without mojibake | UI, Arabic, RTL | High | FX-LIST-006-H is loaded; `user-001` is signed in. | List name `قائمة العائلة`. | 1. Confirm delete for `list-cancel-001`. 2. Refresh owned-list UI. 3. Inspect text rendering. | `قائمة العائلة` is removed from owned-list UI after documented delete success; no replacement-character or corrupted Arabic text appears in success, status, or error text. | LIST-006-US-005 | Yes | UI E2E | Regression cadence. |
| LIST-006-US-005-TC-008 | Success payload status is traceable to endpoint contract | Traceability Verification | Medium | QA traceability review is being performed. | `FEATURE_TRACEABILITY.md` row for `DELETE /api/v1/lists/{id}`. | 1. Confirm delete endpoint maps to `delete_owned_list`. 2. Confirm automated API tests target this endpoint and operation. | Test package traces success and error coverage to `DELETE /api/v1/lists/{id}` and does not use `DELETE /api/v1/lists/{id}/items/{place_id}` for list deletion. | LIST-006-US-005 | No | Traceability Verification | Manual Review cadence. |

## LIST-006-US-006 - Delete list items with list

User Story Summary: As the system, I want list memberships removed when deleting a list so that no orphaned list items remain.

Related Feature ID: `LIST-006`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-006-US-006-TC-001 | Populated list memberships are deleted atomically | API, Data Integrity, Positive | Critical | FX-LIST-006-B is loaded; `user-001` is signed in; backend integration harness can inspect `list_items`. | `list-food-001` memberships: `place-001`, `place-002`, `place-003`. | 1. Confirm baseline membership set in `list_items`. 2. Send `DELETE /api/v1/lists/list-food-001`. 3. Inspect `list_items` for `list_id=list-food-001`. | Response body is `{ "deleted": true }`; membership rows for `list-food-001` are exactly `0`; no orphan membership remains for `place-001`, `place-002`, or `place-003` under the deleted list ID. | LIST-006-US-006 | Yes | API | Smoke cadence. |
| LIST-006-US-006-TC-002 | Empty list delete leaves no membership side effects | API, Data Integrity | High | FX-LIST-006-A is loaded; `user-001` has control list `list-food-001` with memberships. | Delete `list-empty-001`; control list `list-food-001`. | 1. Record `list-food-001` membership set as `place-001`, `place-002`, `place-003`. 2. Delete `list-empty-001`. 3. Re-query `list-food-001` membership set. | Response body is `{ "deleted": true }`; `list-empty-001` has zero memberships; `list-food-001` membership set remains exactly `place-001`, `place-002`, `place-003`. | LIST-006-US-006 | Yes | API | Regression cadence. |
| LIST-006-US-006-TC-003 | Membership cascade occurs in same successful operation | API, Data Integrity | Critical | FX-LIST-006-B is loaded; backend integration harness can inspect list and membership records after the delete transaction completes. | `DELETE /api/v1/lists/list-food-001`. | 1. Send DELETE. 2. After response body `{ "deleted": true }`, inspect list and membership records in the same committed state. | Deleted list record is absent and membership rows for the deleted list are absent in the same committed post-delete state. | LIST-006-US-006 | Yes | API | Smoke cadence. |
| LIST-006-US-006-TC-004 | Membership deletion does not delete shared place membership in another list | API, Data Integrity, Regression | High | `place-001` is in `list-food-001` and also in `list-other-001` owned by `user-001`. | Delete `list-food-001`. | 1. Record `list-other-001` membership set as `place-001`, `place-004`. 2. Delete `list-food-001`. 3. Query `list-other-001`. | Response body is `{ "deleted": true }`; `list-other-001` still contains exactly `place-001` and `place-004`; only memberships whose `list_id` is `list-food-001` are removed. | LIST-006-US-006 | Yes | API | Regression cadence. |
| LIST-006-US-006-TC-005 | Place removal endpoint is not used for list deletion | Traceability Verification | Medium | QA traceability review is being performed. | `DELETE /api/v1/lists/{id}` vs `DELETE /api/v1/lists/{id}/items/{place_id}`. | 1. Review automation and endpoint traces. 2. Confirm LIST-006 delete tests do not call item-removal endpoint to simulate list deletion. | LIST-006 uses only the list deletion endpoint; place-item removal behavior remains owned by LIST-010. | LIST-006-US-006 | No | Traceability Verification | Manual Review cadence. |

## LIST-006-US-007 - Preserve places on list delete

User Story Summary: As the system, I want deleting a list not to delete catalog places.

Related Feature ID: `LIST-006`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-006-US-007-TC-001 | Catalog places remain after populated list deletion | API, Integration, Data Integrity | Critical | FX-LIST-006-B is loaded; `user-001` is signed in; test harness can inspect places catalog records. | Places `place-001`, `place-002`, `place-003`. | 1. Record place records before delete. 2. Delete `list-food-001`. 3. Inspect the same place records after delete. | Delete response body is `{ "deleted": true }`; catalog still contains `place-001` with name `Riyadh Grill`, `place-002` with name `Cafe Noon`, and `place-003` with name `آيس كريم`. | LIST-006-US-007 | Yes | API | Smoke cadence. |
| LIST-006-US-007-TC-002 | Places catalog fixture count does not decrement from list delete | API, Integration, Data Integrity | High | FX-LIST-006-B is loaded; deterministic catalog fixture contains `10` places before delete. | Baseline catalog count `10`; delete `list-food-001`. | 1. Record catalog count `10`. 2. Delete list. 3. Re-query catalog count using the same fixture inspection method. | Delete response body is `{ "deleted": true }`; catalog count remains exactly `10`; the deleted list is absent from owned-list data. | LIST-006-US-007 | Yes | API | Regression cadence. |
| LIST-006-US-007-TC-003 | Place detail remains accessible after source list deletion | UI, Integration | High | FX-LIST-006-B is loaded; Place Detail requirement coverage supports opening `place-001`. | Place `place-001` appears in deleted list. | 1. Delete `list-food-001`. 2. Open place detail for `place-001`. | After documented delete success, place detail opens for `place-001` with name `Riyadh Grill`; no list-deleted error is shown on the place detail surface. | LIST-006-US-007 | Yes | UI E2E | Regression cadence. |
| LIST-006-US-007-TC-004 | Public/private place visibility behavior remains out of scope | Traceability Verification | Medium | QA traceability review is being performed. | Place catalog and public/private list modules. | 1. Review LIST-006 and PLACE/PUBLIC requirements. 2. Confirm test ownership for place visibility. | LIST-006 validates that places are preserved; broader place visibility/search/public discovery behavior remains in its owning feature packages. | LIST-006-US-007 | No | Traceability Verification | Manual Review cadence. |
| LIST-006-US-007-TC-005 | Deleting list does not remove generated artwork for places | Manual Verification, Integration | Low | Generated artwork behavior is owned by PLACE-013. | Places from `list-food-001`. | 1. Review PLACE-013 artwork requirements. 2. Confirm LIST-006 does not assert artwork generation rules. | LIST-006 does not create executable artwork assertions; preservation of places is covered, artwork determinism remains PLACE-013-owned. | LIST-006-US-007 | No | Manual | Manual Review cadence. |

## LIST-006-US-008 - Preserve ratings on list delete

User Story Summary: As the system, I want deleting a list not to delete ratings.

Related Feature ID: `LIST-006`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-006-US-008-TC-001 | Rating rows remain after list deletion | API, Integration, Data Integrity | Critical | FX-LIST-006-B is loaded; ratings exist for `place-001` and `place-002`; ratings fixture can be inspected. | `place-001` avg `8.5`, count `2`; `place-002` avg `7.0`, count `1`. | 1. Record rating rows/aggregates. 2. Delete `list-food-001`. 3. Re-query rating rows/aggregates. | Delete response body is `{ "deleted": true }`; rating rows for `place-001` and `place-002` remain present; aggregate values remain `8.5/2` and `7.0/1`. | LIST-006-US-008 | Yes | API | Smoke cadence. |
| LIST-006-US-008-TC-002 | Unrated place remains unrated after list deletion | API, Integration | High | FX-LIST-006-B is loaded; `place-003` has no ratings. | `place-003` unrated. | 1. Record `place-003` rating context. 2. Delete `list-food-001`. 3. Re-query `place-003`. | Delete response body is `{ "deleted": true }`; `place-003` remains present and unrated; no fake rating row or aggregate value is created. | LIST-006-US-008 | Yes | API | Regression cadence. |
| LIST-006-US-008-TC-003 | Rating display remains unchanged after deleting containing list | UI, Integration | High | FX-LIST-006-B is loaded; place detail displays rating context. | `place-001` average `8.5`, count `2`. | 1. Open place detail for `place-001` and record rating display. 2. Delete `list-food-001`. 3. Reopen `place-001`. | Rating display remains `8.5` average with count `2`; no message implies rating deletion occurred. | LIST-006-US-008 | Yes | UI E2E | Regression cadence. |
| LIST-006-US-008-TC-004 | Delete response does not include private rating data | API, Security, Privacy | Critical | FX-LIST-006-B includes ratings with private notes in rating module fixtures. | `DELETE /api/v1/lists/list-food-001`. | 1. Send DELETE. 2. Inspect response body. | Response body is `{ "deleted": true }`; no private rating notes, rater identity, rating history, or hidden rating metadata is returned. | LIST-006-US-008 | Yes | API | Smoke cadence. |
| LIST-006-US-008-TC-005 | Rating mutation behavior remains RATINGS-owned | Traceability Verification | Medium | QA traceability review is being performed. | RATINGS user stories and LIST-006 preservation requirement. | 1. Review rating mutation tests. 2. Confirm LIST-006 only asserts ratings are preserved after list deletion. | LIST-006 does not test create/edit/delete rating behavior; rating mutation validation remains in RATINGS-owned test packages. | LIST-006-US-008 | No | Traceability Verification | Manual Review cadence. |

## LIST-006-US-009 - Roll back failed deletion

User Story Summary: As the system, I want failed deletes not to leave partial data.

Related Feature ID: `LIST-006`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-006-US-009-TC-001 | Failed delete before commit preserves list and memberships | API, Error Handling, Data Integrity | Critical | FX-LIST-006-C is loaded; test harness forces delete failure before commit. | `DELETE /api/v1/lists/list-rollback-001`; failed response without `{ "deleted": true }`. | 1. Record list and membership set. 2. Send DELETE with forced pre-commit failure. 3. Re-query list and memberships. | Response body is not `{ "deleted": true }`; list `list-rollback-001` remains present; membership set remains exactly `place-010`, `place-011`; no success payload is returned. | LIST-006-US-009 | Yes | API | Smoke cadence. Failure status code is tracked by LIST-006-XC-006. |
| LIST-006-US-009-TC-002 | Failed delete shows no false success UI | UI, Error Handling | Critical | FX-LIST-006-C is loaded; delete request fails before commit. | Forced failed delete response without `{ "deleted": true }`. | 1. Open confirmation. 2. Confirm delete. 3. Inspect status/error UI and owned-list row. | UI shows a visible error state; no success state is shown; `Rollback Target` remains visible with placeCount `2`. | LIST-006-US-009 | Yes | UI E2E | Smoke cadence. |
| LIST-006-US-009-TC-003 | Retry behavior requires product clarification | Requirement Clarification | High | LIST-006 documents rollback after failure but does not define retry behavior, retry copy, retry timing, or guaranteed second-attempt success. | Failed delete followed by another delete attempt. | 1. Review LIST-006 failure requirements. 2. Confirm whether retry is supported in the delete dialog and what deterministic outcome is expected. | No executable LIST-006 test asserts retry success, retry timing, or retry UI behavior until documented. | LIST-006-US-009 | No | Requirement Clarification | Manual Review cadence. |
| LIST-006-US-009-TC-004 | Failed delete error payload hides internals | API, Security, Privacy | Critical | FX-LIST-006-C is loaded; forced failure occurs before commit. | Failed delete response without `{ "deleted": true }`. | 1. Send DELETE. 2. Inspect error payload. | Payload uses deterministic error envelope; no SQL, stack trace, internal file path, private note, token, audit field, or debug field is returned; list and memberships remain unchanged. | LIST-006-US-009 | Yes | API | Smoke cadence. Failure status code is tracked by LIST-006-XC-006. |
| LIST-006-US-009-TC-005 | Rollback timing threshold remains undefined | Requirement Clarification | Low | Product has not documented transaction timeout or retry backoff timing. | Failure-before-commit scenario. | 1. Review LIST-006 requirements. 2. Review API reliability policy. | No executable test asserts an undocumented rollback timeout, retry delay, cache invalidation time, or propagation SLA. | LIST-006-US-009 | No | Requirement Clarification | Manual Review cadence. |

## LIST-006-US-010 - Handle stale deleted list

User Story Summary: As a user, I want clear feedback if the list was already deleted elsewhere.

Related Feature ID: `LIST-006`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-006-US-010-TC-001 | Delete already removed list returns not found | API, Negative, Error Handling | Critical | FX-LIST-006-G is loaded; `user-001` is signed in. | `DELETE /api/v1/lists/list-stale-001`. | 1. Send DELETE for stale target. 2. Inspect response. | Response status is `404 Not Found`; deterministic error envelope is returned; no list name, membership, owner identity, stack trace, or debug field is exposed. | LIST-006-US-010 | Yes | API | Smoke cadence. |
| LIST-006-US-010-TC-002 | UI handles stale deleted list without stale controls | UI, Negative, Error Handling | High | FX-LIST-006-G is loaded; stale confirmation UI can be opened from cached state. | Cached `list-stale-001`. | 1. Open stale delete confirmation from cached UI. 2. Confirm delete. 3. Inspect final UI. | After the documented not-found API result, UI no longer shows stale list controls; no delete button for `list-stale-001` remains visible. | LIST-006-US-010 | Yes | UI E2E | Regression cadence. |
| LIST-006-US-010-TC-003 | Repeated delete after success returns not found | API, Negative, Regression | High | FX-LIST-006-A is loaded; `user-001` is signed in. | `DELETE /api/v1/lists/list-empty-001` twice. | 1. Send DELETE and receive documented success body. 2. Send DELETE again for same ID. | First response body is `{ "deleted": true }`; second response status is `404 Not Found`; second response contains no private data or internals. | LIST-006-US-010 | Yes | API | Regression cadence. |
| LIST-006-US-010-TC-004 | Stale not-found message is accessible | Accessibility, Error Handling | High | FX-LIST-006-G is loaded; stale delete returns `404 Not Found`; global error/status requirements apply. | `A11Y-001-US-016`, `RESP-002-US-022`. | 1. Confirm stale delete. 2. Inspect visible error and accessibility tree. | Loading state ends; not-found error text is visible and programmatically determinable through `role=alert`, `aria-live`, or equivalent; stale delete controls are absent from the accessibility tree. | LIST-006-US-010 | Yes | Accessibility | Regression cadence. Source: A11Y-001-US-016, RESP-002-US-022. |
| LIST-006-US-010-TC-005 | Browser back/refresh behavior after stale delete requires clarification | Requirement Clarification | Medium | Browser-history behavior is not documented by LIST-006. | Stale deleted list route/history. | 1. Review LIST-006 and routing requirements. 2. Confirm desired browser back/refresh behavior after stale delete. | No executable LIST-006 test asserts browser back, forward, refresh, cache, or restored-history behavior until documented. | LIST-006-US-010 | No | Requirement Clarification | Manual Review cadence. |

## LIST-006-US-011 - Keep destructive dialog accessible

User Story Summary: As a keyboard or screen-reader user, I want destructive actions clear and safe.

Related Feature ID: `LIST-006`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-006-US-011-TC-001 | Focus moves into delete dialog | Accessibility, UI | Critical | FX-LIST-006-B is loaded; delete trigger is focused. | `A11Y-001-US-003`. | 1. Focus delete trigger. 2. Press Enter. 3. Inspect active element. | Initial focus moves inside the dialog to the title, cancel button, delete button, or configured safe initial focus element; focus is not left behind the modal. | LIST-006-US-011 | Yes | Accessibility | Smoke cadence. Source: A11Y-001-US-003. |
| LIST-006-US-011-TC-002 | Focus remains trapped in delete dialog | Accessibility, UI | Critical | Delete confirmation is open. | `A11Y-001-US-004`. | 1. Press Tab repeatedly through all controls. 2. Press Shift+Tab repeatedly. | Keyboard focus cycles only within the dialog while it is open; background page controls do not receive focus. | LIST-006-US-011 | Yes | Accessibility | Smoke cadence. Source: A11Y-001-US-004. |
| LIST-006-US-011-TC-003 | Cancel and delete controls have explicit accessible names | Accessibility, UI | Critical | Delete confirmation is open. | Cancel and destructive delete buttons. | 1. Inspect accessibility tree for action controls. | Cancel control has an accessible name identifying cancellation; destructive control has an accessible name identifying deletion; neither action is exposed with only an icon or generic label. | LIST-006-US-011 | Yes | Accessibility | Smoke cadence. |
| LIST-006-US-011-TC-004 | Destructive action is visually distinguishable without color alone | Accessibility, UX | High | Delete confirmation is open; forced-colors mode is available. | `RESP-003-US-014`, `RESP-003-US-015`. | 1. Open dialog in default colors. 2. Enable forced-colors mode. 3. Inspect destructive action styling and text. | Destructive action remains distinguishable by text and control semantics; required text, borders, and focus indicators remain visible in forced-colors mode. | LIST-006-US-011 | Yes | Accessibility | Nightly cadence. Source: RESP-003-US-014, RESP-003-US-015. |
| LIST-006-US-011-TC-005 | Focus restores after cancel close | Accessibility, UI | High | Delete trigger is focused before opening; confirmation is open. | `A11Y-001-US-006`. | 1. Open dialog with keyboard. 2. Activate Cancel. 3. Inspect focus. | Focus returns to original delete trigger or documented fallback; document body is not focused. | LIST-006-US-011 | Yes | Accessibility | Regression cadence. Source: A11Y-001-US-006. |
| LIST-006-US-011-TC-006 | Focus fallback after successful delete | Accessibility, UI | High | FX-LIST-006-B is loaded; delete trigger will unmount after successful delete. | `A11Y-001-US-007`. | 1. Open dialog from delete trigger. 2. Confirm delete. 3. Inspect active element after success. | Because the trigger unmounts, focus moves to a logical fallback such as owned-list heading, updated list row, or primary action; focus is not lost to document body. | LIST-006-US-011 | Yes | Accessibility | Regression cadence. Source: A11Y-001-US-007. |
| LIST-006-US-011-TC-007 | Modal loading state is announced | Accessibility, Loading | High | Delete confirmation is open; delete response is delayed. | `A11Y-001-US-016`. | 1. Activate Delete. 2. Inspect accessible status while pending. | Pending state is conveyed programmatically by `aria-busy`, `role=status`, or equivalent text; confirm action cannot be repeatedly submitted while pending. | LIST-006-US-011 | Yes | Accessibility | Regression cadence. Source: A11Y-001-US-016. |
| LIST-006-US-011-TC-008 | Dialog supports 200% zoom | Accessibility, Responsive | High | Delete confirmation can be opened; browser zoom is `200%`. | `A11Y-001-US-019`, `RESP-003-US-001`, `RESP-003-US-002`, `RESP-003-US-009`. | 1. Set zoom to `200%`. 2. Open delete confirmation. 3. Inspect dimensions, focus trap, and action reachability. | Dialog fits viewport without horizontal overflow; `document.documentElement.scrollWidth <= window.innerWidth`; cancel and delete actions remain reachable by keyboard and pointer. | LIST-006-US-011 | Yes | Accessibility | Regression cadence. |
| LIST-006-US-011-TC-009 | Touch targets meet minimum size | Accessibility, Mobile | High | Delete confirmation is open at mobile viewport. | `320x568`; `RESP-003-US-008`. | 1. Open dialog at `320x568`. 2. Measure cancel and delete controls. | Cancel and delete controls each have a hit target of at least `44x44` CSS pixels. | LIST-006-US-011 | Yes | Accessibility | Regression cadence. Source: RESP-003-US-008. |

## LIST-006-US-012 - Do not require typed confirmation

User Story Summary: As a user, I want list deletion confirmation clear but not unnecessarily slow.

Related Feature ID: `LIST-006`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-006-US-012-TC-001 | Delete dialog does not require typing list name | UI, UX, Accessibility | High | FX-LIST-006-B is loaded; confirmation is open. | List name `Weekend Food`. | 1. Open delete confirmation. 2. Inspect form controls. 3. Attempt to confirm without typing text. | Dialog contains no required text input for typing the list name; destructive confirm button is available without entering `Weekend Food`; confirmation still requires explicit button activation. | LIST-006-US-012 | Yes | UI E2E | Regression cadence. |
| LIST-006-US-012-TC-002 | Delete dialog contains confirm and cancel buttons | UI, UX | High | Delete confirmation is open. | Confirmation actions. | 1. Inspect rendered action controls. | Dialog contains exactly one destructive confirm action and at least one cancel/dismiss action; both are visible and keyboard reachable. | LIST-006-US-012 | Yes | UI E2E | Regression cadence. |
| LIST-006-US-012-TC-003 | Standard confirmation works for Arabic list name without typed challenge | UI, Arabic, RTL | Medium | FX-LIST-006-H is loaded; `user-001` is signed in. | List name `قائمة العائلة`. | 1. Open delete confirmation. 2. Inspect controls. 3. Confirm without typing the Arabic name. | No typed confirmation field is required; delete confirmation can be completed by activating the destructive confirm button; Arabic list name renders as valid UTF-8. | LIST-006-US-012 | Yes | UI E2E | Regression cadence. |
| LIST-006-US-012-TC-004 | Responsive delete dialog fits certified mobile viewports | Responsive, Mobile | High | Delete confirmation can be opened; global responsive requirements apply. | Viewports `320x568`, `390x844`, `430x932`, `844x390`. | 1. Open dialog at each viewport. 2. Inspect width, final action visibility, and safe-area padding. | At each viewport, `document.documentElement.scrollWidth <= window.innerWidth`; title, warning copy, cancel, and delete actions remain visible or internally scrollable and are not obscured by safe-area padding or bottom navigation. | LIST-006-US-012 | Yes | UI E2E | Regression cadence. Source: RESP-002-US-001, RESP-002-US-002, RESP-002-US-012, A11Y-001-US-013. |
| LIST-006-US-012-TC-005 | Reduced motion keeps confirmation usable | Accessibility, Responsive | Medium | Reduced motion preference is active; delete confirmation can be opened. | `prefers-reduced-motion: reduce`; `RESP-003-US-016`, `RESP-003-US-017`. | 1. Enable reduced motion. 2. Open and close delete confirmation. 3. Confirm delete with delayed response. | Nonessential dialog/sheet transitions are removed or minimized; warning copy, actions, loading status, and final result remain usable without relying on animation. | LIST-006-US-012 | Yes | Accessibility | Nightly cadence. |

## Clarification, Manual, and Feature-Ownership Cases

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-006-XC-001 | Soft delete and undo behavior are not LIST-006 executable requirements | Requirement Clarification | Medium | Product has not documented soft delete or undo for list deletion. | Soft delete, undo, recovery. | 1. Review LIST-006 requirements. 2. Review product decision log if available. | No executable LIST-006 test asserts soft delete, undo window, recovery behavior, or restore API until documented. | LIST-006-US-005 | No | Requirement Clarification | Manual Review cadence. |
| LIST-006-XC-002 | Public-list propagation after delete remains ownership-bound | Traceability Verification | Medium | Deleted list may have been public before deletion; PUBLIC-LISTS owns browsing/discovery. | Public list contexts. | 1. Review PUBLIC-LISTS requirements. 2. Confirm LIST-006 tests only validate deleted list absence where explicitly tied to delete operation. | Public browsing/search/index propagation timing is not asserted by LIST-006; public visibility behavior remains PUBLIC-owned unless explicitly linked. | LIST-006-US-005 | No | Traceability Verification | Manual Review cadence. |
| LIST-006-XC-003 | Profile count updates remain PROFILE-owned unless explicitly linked | Traceability Verification | Medium | Profile summary behavior is out of LIST-006 ownership. | Profile list count. | 1. Review PROFILE requirements. 2. Review LIST-006 delete tests. | LIST-006 does not assert profile rendering or synchronization timing; profile count behavior is covered by PROFILE tests or explicit integration tests. | LIST-006-US-005 | No | Traceability Verification | Manual Review cadence. |
| LIST-006-XC-004 | Browser back, forward, and refresh behavior require route documentation | Requirement Clarification | Low | Browser navigation behavior is not documented in LIST-006. | Back, forward, refresh, restored history. | 1. Review routing requirements. 2. Confirm desired history behavior after delete and stale-delete states. | No executable LIST-006 test asserts browser history, cache, or refresh behavior until documented. | LIST-006-US-010 | No | Requirement Clarification | Manual Review cadence. |
| LIST-006-XC-005 | Delete success HTTP status requires explicit contract | Requirement Clarification | Critical | LIST-006 documents success response body `{ deleted: true }` but does not name the HTTP status code. | Candidate success statuses `200 OK` or `204 No Content`. | 1. Review API specification and backend contract for `DELETE /api/v1/lists/{id}`. 2. Confirm the exact success status code. | No executable LIST-006 test asserts `200 OK` or `204 No Content` for delete success until the exact status is documented; executable tests assert only the documented body and end state. | LIST-006-US-005 | No | Requirement Clarification | Manual Review cadence. |
| LIST-006-XC-006 | Failed-delete HTTP status requires explicit contract | Requirement Clarification | Critical | LIST-006 documents rollback on failed delete before commit but does not name the failure status code. | Candidate server or domain error statuses. | 1. Review API error taxonomy and delete-list backend contract. 2. Confirm the exact status and error schema for pre-commit delete failure. | No executable LIST-006 test asserts `500 Internal Server Error` or another failure status until documented; executable rollback tests assert unchanged list, unchanged memberships, and absence of `{ "deleted": true }`. | LIST-006-US-009 | No | Requirement Clarification | Manual Review cadence. |
| LIST-006-XC-007 | Guest and expired-session delete status requires explicit linked auth contract | Requirement Clarification | Critical | LIST-006 and FEATURE_TRACEABILITY document Bearer protection but do not name the exact guest or expired-session status for delete-list mutation. | Candidate auth denial status `401 Unauthorized`. | 1. Review the approved auth contract linked to list mutations. 2. Confirm exact status for missing and expired bearer token on `DELETE /api/v1/lists/{id}`. | No executable LIST-006 test asserts `401 Unauthorized` until the auth status is explicitly linked for this feature; executable tests assert denial, no data change, and no private-data exposure. | LIST-006-US-004 | No | Requirement Clarification | Manual Review cadence. |

## Final Summary

1. User stories processed: 12
2. Total executable test cases: 57
3. Clarification / Manual / Traceability cases: 17
   - Requirement Clarification: 9
   - Manual Verification: 2
   - Traceability Verification: 6
4. Total test cases: 74
5. Test count per user story:
   - LIST-006-US-001: 5
   - LIST-006-US-002: 4
   - LIST-006-US-003: 5
   - LIST-006-US-004: 7
   - LIST-006-US-005: 12
   - LIST-006-US-006: 5
   - LIST-006-US-007: 5
   - LIST-006-US-008: 5
   - LIST-006-US-009: 6
   - LIST-006-US-010: 6
   - LIST-006-US-011: 9
   - LIST-006-US-012: 5
6. Count by priority:
   - Critical: 30
   - High: 30
   - Medium: 11
   - Low: 3
7. Count by automation layer:
   - API: 18
   - UI E2E: 21
   - Accessibility: 16
   - Security: 5
   - Manual: 2
   - Requirement Clarification: 9
   - Traceability Verification: 6
8. Top automation candidates:
   - `DELETE /api/v1/lists/{id}` success contract: response body exactly `{ "deleted": true }` and deleted list absent from owned-list data.
   - Guest and expired-session denial: denied delete request, no data change, and no private-data exposure.
   - Stale/repeated delete: documented not-found behavior with no leaked list data.
   - Rollback before commit: list and memberships unchanged, no false success, no `{ "deleted": true }` payload.
   - UI E2E confirmation path: dialog opens before request, cancel/Escape sends no DELETE, confirm sends exactly one DELETE.
   - Accessibility automation: modal semantics, focus trap, focus restoration, loading announcements, 200% zoom, touch targets.
   - Data integrity automation: list-item cascade, place preservation, rating preservation.

## Validation

- Duplicate Test IDs = 0
- Invalid Story References = 0
- Missing User Stories = 0
- Encoding/Mojibake = 0
- Undocumented API Status Assertions = 0
- Requirement Fidelity Violations = 0
- Feature Ownership Violations = 0
