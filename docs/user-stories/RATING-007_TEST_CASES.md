# RATING-007 Test Cases

Feature: `RATING-007 - Re-add tried place later`

Feature Description: Users can re-add tried places to lists after rating; doing so does not create another rating or remove tried status.

Primary Source: `docs/user-stories/RATINGS_USER_STORIES.md`

Supporting Sources:

- `docs/feature-map/FEATURE_TRACEABILITY.md`
- `docs/user-stories/RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`

Allowed Requirement Sources:

- `RATING-007-US-001` through `RATING-007-US-008`
- Shared Ratings Business Rules in `RATINGS_USER_STORIES.md`
- Endpoint/database traceability in `FEATURE_TRACEABILITY.md`
- Approved global responsive/accessibility requirements explicitly cited as `RESP-*` or `A11Y-*`

Out of Scope:

- Rating creation, rating validation, rating scale behavior, first-rating cleanup, aggregate recalculation, profile counts, recommendations, browser history, cache behavior, and undocumented retry behavior.
- Full list management behavior beyond the documented RATING-007 integration end state: re-adding a tried place to an owned list.
- Exact HTTP success/error status and response schema for `POST /api/v1/lists/{id}/items`; the endpoint is documented in `FEATURE_TRACEABILITY.md`, but exact status/schema is not documented in the allowed RATING-007 sources.

## Documented Contracts Used By These Tests

- `POST /api/v1/lists/{id}/items` is the documented add-place-to-list endpoint in `FEATURE_TRACEABILITY.md`.
- `list_items` has unique `(list_id, place_id)` behavior and idempotent add in `FEATURE_TRACEABILITY.md`.
- `PATCH /api/v1/ratings/{place_id}` returns `200 OK` for known rating edits and must not create a new rating.
- Each user can have at most one rating per place.
- Tried status is preserved for RATING-007 only as documented by `currentUserTried` remaining true after re-add.
- Existing rating value and private note remain unchanged after re-add.
- Re-add to non-owned lists is denied, but exact denial HTTP status is not documented by RATING-007.

## Deterministic Fixture Matrix

| Fixture ID | Purpose | User / Permissions | Initial Ratings | Initial Lists And Memberships | Expected Baseline |
|---|---|---|---|---|---|
| `FX-R007-OWNED-MISSING` | Re-add tried place to owned list when missing | `user-001` authenticated | `rating-701`: `userId=user-001`, `placeId=place-701`, `rating=8.5`, `notes="قهوة ممتازة"`, `createdAt=2026-06-01T10:00:00Z`, `updatedAt=2026-06-01T10:00:00Z` | `list-701` owner `user-001`, name `قائمة العائلة`, members `[place-702]`; `place-701` name `مطعم الرياض` exists in catalog | Before action: `list-701` membership count for `place-701` is `0`; rating count for `(user-001, place-701)` is `1`; `currentUserTried=true` when place data is loaded for `user-001`. |
| `FX-R007-OWNED-EXISTING` | Duplicate re-add idempotency | `user-001` authenticated | `rating-701` exists for `(user-001, place-701)` with `rating=8.5`, `notes="قهوة ممتازة"` | `list-701` owner `user-001`, members `[place-701, place-702]` | Before action: `list-701` membership count for `place-701` is `1`; rating count for `(user-001, place-701)` is `1`. |
| `FX-R007-RATING-UPDATE` | Rating edit after re-add | `user-001` authenticated | `rating-701` exists for `(user-001, place-701)` with `rating=8.5`, `notes="قهوة ممتازة"` | `list-701` owner `user-001`, members `[place-701, place-702]` | Before action: list item for `place-701` exists; rating count is `1`; no first-rating cleanup is pending. |
| `FX-R007-NON-OWNER` | Owner-only re-add denial | `user-001` authenticated | `rating-701` exists for `(user-001, place-701)` | `list-801` owner `user-002`, name `قهوة`, members `[place-702]` | Before action: `list-801` membership count for `place-701` is `0`; user-001 does not own `list-801`. |
| `FX-R007-UI-TRIED-CONTEXT` | Tried context in add-to-list selection | `user-001` authenticated | `rating-701` exists for `(user-001, place-701)` | `list-701` owner `user-001`, members `[place-702]` | Before action: add-to-list selection includes `place-701` as an existing catalog place; `currentUserTried=true` for `place-701`. |

## Common Executable Assertions

- No executable test asserts an undocumented HTTP status for `POST /api/v1/lists/{id}/items`.
- Where `POST /api/v1/lists/{id}/items` is used, the measurable pass/fail result is persisted state: list membership count, rating row count, rating value, private note value, and authorization-safe lack of mutation.
- Response bodies, DOM, and accessibility tree must not expose private notes outside documented owner-only rating contexts, hidden metadata, audit/debug fields, stack traces, SQL details, tokens, undocumented internal identifiers, or other users' data.

## RATING-007-US-001 - Re-add tried place to list

User Story ID: `RATING-007-US-001`

User Story Title: Re-add tried place to list

User Story Summary: As a user, I want to re-add a tried place to a list so that I can keep it in a collection after rating.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-007-US-001-TC-001 | Re-add missing tried place creates one owned-list item | Positive, Integration, Data Integrity | High | Load `FX-R007-OWNED-MISSING`; authenticate as `user-001`; verify before counts: `list-701` membership count for `place-701` is `0`, rating count for `(user-001, place-701)` is `1`. | Endpoint `POST /api/v1/lists/list-701/items`; payload `{ "placeId": "place-701" }`; do not call any rating endpoint. | 1. Send the documented add-place-to-list request as `user-001`. 2. Do not assert an undocumented HTTP status. 3. Query `list_items` for `(list-701, place-701)`. 4. Query ratings for `(user-001, place-701)`. 5. Inspect response/DOM if available for forbidden fields. | `list-701` membership count for `place-701` changes from `0` to `1`; `list-701` still contains `place-702`; rating count for `(user-001, place-701)` remains `1`; rating value remains `8.5`; no `POST /api/v1/ratings` or `PATCH /api/v1/ratings/place-701` request is sent; no forbidden fields are exposed. | RATING-007-US-001 | Yes | API / Integration |

## RATING-007-US-002 - Preserve tried status after re-add

User Story ID: `RATING-007-US-002`

User Story Title: Preserve tried status after re-add

User Story Summary: As a user, I want tried status preserved so that my history remains accurate.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-007-US-002-TC-001 | Place data reload keeps currentUserTried true after re-add | Positive, UI, Integration | High | Load `FX-R007-OWNED-MISSING`; sign in as `user-001`; before add, place data for `place-701` has `currentUserTried=true`. | UI add-to-list action for `list-701` and `place-701`, backed by `POST /api/v1/lists/list-701/items` payload `{ "placeId": "place-701" }`. | 1. Add `place-701` to `list-701`. 2. Reload place data through the documented app/API data reload. 3. Inspect current-user tried context. 4. Query rating count. | Reloaded place data for `user-001` reports `currentUserTried=true`; rating count for `(user-001, place-701)` remains `1`; `list-701` membership count for `place-701` is `1`; no separate tried toggle or orphan tried state is created by the re-add action. | RATING-007-US-002 | Yes | UI E2E |

## RATING-007-US-003 - Do not create second rating

User Story ID: `RATING-007-US-003`

User Story Title: Do not create second rating

User Story Summary: As the system, I want re-adding to lists not to create ratings so that one rating per user/place is preserved.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-007-US-003-TC-001 | Re-add tried place does not create a second rating row | Data Integrity, Integration | Critical | Load `FX-R007-OWNED-MISSING`; authenticate as `user-001`; verify rating count for `(user-001, place-701)` is `1`. | Endpoint `POST /api/v1/lists/list-701/items`; payload `{ "placeId": "place-701" }`; rating endpoints must not be called. | 1. Add the tried place to the owned list. 2. Query ratings for `(user-001, place-701)`. 3. Query `list_items` for `(list-701, place-701)`. 4. Inspect network log for rating endpoint calls if executing through UI. | Rating count for `(user-001, place-701)` remains exactly `1`; the existing rating ID remains `rating-701`; `POST /api/v1/ratings` is not called; `PATCH /api/v1/ratings/place-701` is not called; `list-701` membership count for `place-701` is `1`. | RATING-007-US-003 | Yes | API / Integration |

## RATING-007-US-004 - Preserve existing rating value and note

User Story ID: `RATING-007-US-004`

User Story Title: Preserve existing rating value and note

User Story Summary: As a user, I want list organization not to alter my rating archive.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-007-US-004-TC-001 | Re-add preserves existing rating value and private note | Privacy, Data Integrity, Integration | Critical | Load `FX-R007-OWNED-MISSING`; authenticate as `user-001`; verify existing rating `rating-701` has `rating=8.5` and `notes="قهوة ممتازة"`. | Endpoint `POST /api/v1/lists/list-701/items`; payload `{ "placeId": "place-701" }`. | 1. Add `place-701` to `list-701`. 2. Query owner rating archive/current-user rating context for `rating-701`. 3. Query ratings table for `(user-001, place-701)`. 4. Inspect non-rating response surfaces for note leakage. | Existing rating ID remains `rating-701`; rating value remains `8.5`; private note remains exactly `قهوة ممتازة` in owner-only rating context; rating `createdAt` remains `2026-06-01T10:00:00Z`; rating count remains `1`; list membership count changes from `0` to `1`; add-list response/DOM surfaces do not expose the private note unless they are documented owner-only rating contexts. | RATING-007-US-004 | Yes | API / Integration |

## RATING-007-US-005 - Duplicate re-add remains idempotent

User Story ID: `RATING-007-US-005`

User Story Title: Duplicate re-add remains idempotent

User Story Summary: As a user, I want repeated re-add to the same list harmless so that accidental taps do not duplicate rows.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-007-US-005-TC-001 | Duplicate re-add keeps one list item | Idempotency, Data Integrity, Integration | High | Load `FX-R007-OWNED-EXISTING`; authenticate as `user-001`; verify `list-701` membership count for `place-701` is `1` and rating count is `1`. | Endpoint `POST /api/v1/lists/list-701/items`; payload `{ "placeId": "place-701" }`. | 1. Send the add-place-to-list request once for an already-present tried place. 2. Send the same request a second time. 3. Query `list_items` for `(list-701, place-701)`. 4. Query ratings for `(user-001, place-701)`. | `list-701` membership count for `place-701` remains exactly `1` after both requests; rating count for `(user-001, place-701)` remains exactly `1`; existing rating ID remains `rating-701`; no duplicate list item is created; no rating endpoint is called by the add flow. | RATING-007-US-005 | Yes | API / Integration |

## RATING-007-US-006 - Rating update does not remove re-added place

User Story ID: `RATING-007-US-006`

User Story Title: Rating update does not remove re-added place

User Story Summary: As a user, I want a re-added tried place to remain in lists when I edit my rating.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-007-US-006-TC-001 | PATCH rating update preserves the re-added list item | Regression, Data Integrity, API | High | Load `FX-R007-RATING-UPDATE`; authenticate as `user-001`; verify `list-701` contains `place-701` and rating `rating-701` exists. | Endpoint `PATCH /api/v1/ratings/place-701`; payload `{ "rating": 9, "notes": "تحديث التقييم" }`. | 1. Send PATCH as `user-001`. 2. Assert documented rating update response. 3. Query `list_items` for `(list-701, place-701)`. 4. Query ratings for `(user-001, place-701)`. | Status is `200 OK`; response includes `RatingResponse` fields `id`, `userId`, `placeId`, `rating`, `notes`, `createdAt`, and `updatedAt`; rating ID remains `rating-701`; rating value becomes `9`; notes become `تحديث التقييم`; rating count remains `1`; `list-701` still contains `place-701`; list membership count for `place-701` remains `1`. | RATING-007-US-006 | Yes | API |

## RATING-007-US-007 - Owner-only re-add

User Story ID: `RATING-007-US-007`

User Story Title: Owner-only re-add

User Story Summary: As the system, I want re-add constrained to owned lists so that users cannot modify others' lists.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-007-US-007-TC-001 | Non-owner re-add attempt does not mutate another user's list | Security, Privacy, Data Integrity | Critical | Load `FX-R007-NON-OWNER`; authenticate as `user-001`; verify `list-801` is owned by `user-002` and membership count for `place-701` is `0`. | Endpoint `POST /api/v1/lists/list-801/items`; payload `{ "placeId": "place-701" }`. | 1. Attempt the add-place-to-list request as `user-001`. 2. Do not assert an undocumented exact denial status. 3. Query `list_items` for `(list-801, place-701)`. 4. Query ratings for `(user-001, place-701)`. 5. Inspect client-visible error text/response for forbidden data. | Request is denied by observable end state: `list-801` membership count for `place-701` remains `0`; user-002 list membership state is unchanged; rating count for `(user-001, place-701)` remains `1`; response/error text does not expose `user-002` private data, private notes, SQL, stack traces, debug fields, audit fields, or tokens. | RATING-007-US-007 | Yes | Security |

## RATING-007-US-008 - Show tried context during add

User Story ID: `RATING-007-US-008`

User Story Title: Show tried context during add

User Story Summary: As a user, I want to recognize tried places during add-to-list so that I understand the place's history.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-007-US-008-TC-001 | Tried context, when shown, does not block re-add | UX, UI, Integration | Medium | Load `FX-R007-UI-TRIED-CONTEXT`; sign in as `user-001`; open add-to-list selection for `list-701`. | Select `place-701` from add-to-list UI; `currentUserTried=true` for `place-701`; endpoint `POST /api/v1/lists/list-701/items` payload `{ "placeId": "place-701" }`. | 1. Open add-to-list selection. 2. Locate `place-701`. 3. If tried context is rendered, record its accessible text/name. 4. Activate add for `place-701`. 5. Query `list_items`. | Add-to-list UI does not disable or hide the add action for `place-701` because it is tried; if tried context is rendered, it is informational only; after activation, `list-701` membership count for `place-701` is `1`; rating count for `(user-001, place-701)` remains `1`. | RATING-007-US-008 | Yes | UI E2E |

## Supplemental Requirement-Supported Coverage

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-007-RESP-TC-001 | Add-to-list tried-place flow passes required viewport and overflow matrix | Responsive, UI | High | Load `FX-R007-UI-TRIED-CONTEXT`; sign in as `user-001`; open add-to-list UI for `list-701`. | Viewports `320x568`, `390x844`, `430x932`, `768x1024`, `1024x768`, `1440x900`; place `place-701`. | 1. For each viewport, open add-to-list selection. 2. Locate `place-701`. 3. Verify add action reachability. 4. Measure `document.documentElement.scrollWidth` and `window.innerWidth`. | At every viewport, `place-701` row and add action are visible or reachable; `document.documentElement.scrollWidth <= window.innerWidth`; bottom navigation and safe-area padding do not obscure the final add action; long Arabic labels are contained without horizontal overflow. | RATING-007-US-008 | Yes | UI E2E | Source: `RESP-002-US-001`, `RESP-002-US-002`, `RESP-002-US-005`, `RESP-002-US-010`, `RESP-002-US-011`, `RESP-002-US-016`, `RESP-002-US-020`. |
| RATING-007-RESP-TC-002 | Add-to-list tried-place flow remains usable at 200% zoom | Responsive, Accessibility, UI | High | Load `FX-R007-UI-TRIED-CONTEXT`; sign in as `user-001`; open add-to-list UI for `list-701`. | Browser zoom `200%`; place `place-701`. | 1. Set browser zoom to `200%`. 2. Open add-to-list UI. 3. Keyboard or pointer activate add for `place-701`. 4. Measure overflow and target size. | No horizontal overflow occurs; add action remains keyboard and pointer operable; interactive targets are at least `44x44` CSS pixels; text does not clip or overlap; the re-add flow remains completeable. | RATING-007-US-008 | Yes | Accessibility | Source: `RESP-003-US-001`, `RESP-003-US-002`, `RESP-003-US-003`, `RESP-003-US-008`, `RESP-003-US-014`, `RESP-003-US-015`. |
| RATING-007-A11Y-TC-001 | Keyboard-only re-add is operable and focus-visible | Accessibility, UI | High | Load `FX-R007-UI-TRIED-CONTEXT`; sign in as `user-001`; open add-to-list dialog or sheet from a visible trigger. | Keyboard only; select `place-701`; add action. | 1. Tab into the add-to-list dialog/sheet. 2. Navigate to `place-701`. 3. Activate add by keyboard. 4. Observe focus after the surface closes or updates. | Dialog/sheet exposes modal semantics if rendered as modal; focus remains trapped while open; `place-701` row/add action receives visible `focus-visible`; add action has an accessible name identifying the place/action; after success, focus returns to the trigger or a logical fallback if the trigger unmounts. | RATING-007-US-008 | Yes | Accessibility | Source: `A11Y-001-US-001`, `A11Y-001-US-002`, `A11Y-001-US-003`, `A11Y-001-US-004`, `A11Y-001-US-006`, `A11Y-001-US-007`. |
| RATING-007-A11Y-TC-002 | Re-add status is announced without exposing private notes | Accessibility, Privacy | High | Load `FX-R007-OWNED-MISSING`; sign in as `user-001`; open add-to-list dialog or sheet. | Add `place-701` to `list-701`; private note value is `قهوة ممتازة`. | 1. Activate add. 2. Observe accessible status/live region. 3. Inspect DOM and accessibility tree text. | Add success/status is communicated through accessible status or visible update; DOM/accessibility tree does not expose private note `قهوة ممتازة` outside owner-only rating context; no SQL, stack trace, debug, audit, token, or other-user data is present. | RATING-007-US-004 | Yes | Accessibility | Source: `A11Y-001-US-014`, `A11Y-001-US-016`, `RESP-004-US-009`. |
| RATING-007-SEC-TC-001 | Re-add success and denial surfaces avoid forbidden fields | Security, Privacy | High | Run `RATING-007-US-001-TC-001` and `RATING-007-US-007-TC-001`; capture response JSON, DOM text, and accessibility tree text. | Forbidden values/fields: private note `قهوة ممتازة`, `user-002` private data, SQL, stack, debug, audit, token, hidden metadata. | 1. Execute successful owned re-add. 2. Execute non-owner denied re-add. 3. Recursively scan captured response/DOM/accessibility text. | Success and denial surfaces contain no private notes outside owner-only rating context, no other-user private list data, no hidden metadata, no SQL, no stack traces, no debug/audit fields, and no tokens. | RATING-007-US-007 | Yes | Security | Source: RATING-007-US-004, RATING-007-US-007. |

## Requirement Clarification, Manual Verification, And Traceability Cases

These cases are intentionally not executable pass/fail assertions until Product/API requirements define the missing contract.

| Case ID | Title | Type | Priority | Related User Story ID | Clarification Needed | Risk If Ignored | Recommended Owner |
|---|---|---|---|---|---|---|---|
| RATING-007-RC-001 | Exact success status for `POST /api/v1/lists/{id}/items` | Requirement Clarification | High | RATING-007-US-001 | Define the exact HTTP status and response schema when adding a missing tried place to an owned list succeeds. | API automation may assert implementation-specific status codes. | Product + Backend |
| RATING-007-RC-002 | Exact idempotent duplicate-add response contract | Requirement Clarification | High | RATING-007-US-005 | Define the exact HTTP status and response body for duplicate add where membership already exists. | Clients may handle duplicate add inconsistently. | Product + Backend |
| RATING-007-RC-003 | Exact non-owner denial status and error schema | Requirement Clarification | Critical | RATING-007-US-007 | Define whether non-owned list add returns `403`, `404`, or another documented denial status and the deterministic error schema. | Security tests may overfit hidden/not-found behavior. | Product + Backend |
| RATING-007-RC-004 | Required tried-context UI representation | Requirement Clarification | Medium | RATING-007-US-008 | Define whether tried context must appear, and if so the exact visible/accessibility copy or indicator. | UX tests may assert optional UI that Product intentionally leaves flexible. | Product + Design |
| RATING-007-TV-001 | List module ownership boundary | Traceability Verification | High | RATING-007-US-001 | Verify RATING-007 owns the rating/tried preservation end state, while full list-add UI, list search, and list item rendering remain owned by Lists features. | Tests may duplicate list-module ownership. | QA Architect |

## Coverage Summary

| User Story | Executable Tests | Clarification / Manual / Traceability Cases | Coverage Notes |
|---|---:|---:|---|
| RATING-007-US-001 | 1 | 2 | Re-add membership end state covered; exact add status/schema clarified. |
| RATING-007-US-002 | 1 | 0 | `currentUserTried=true` after reload covered. |
| RATING-007-US-003 | 1 | 0 | No second rating row covered. |
| RATING-007-US-004 | 2 | 0 | Rating value/note preservation plus privacy covered. |
| RATING-007-US-005 | 1 | 1 | Duplicate item prevention covered; exact duplicate response clarified. |
| RATING-007-US-006 | 1 | 0 | PATCH update preserves re-added list item. |
| RATING-007-US-007 | 2 | 1 | Non-owner no-mutation and safe denial covered; exact status clarified. |
| RATING-007-US-008 | 4 | 1 | Non-blocking tried context plus responsive/accessibility coverage included; exact UI representation clarified. |

## Final Summary

- User Stories Processed: 8
- Executable Test Cases: 13
- Requirement Clarification Cases: 4
- Manual Verification Cases: 0
- Traceability Verification Cases: 1
- Total Cases: 18

### Count By Test Type

- Accessibility: 3
- API: 3
- Data Integrity: 7
- Idempotency: 1
- Integration: 8
- Privacy: 4
- Regression: 1
- Responsive: 2
- Security: 2
- UI: 5
- UX: 1

### Count By Priority

- Critical: 5
- High: 12
- Medium: 1

### Count By Automation Layer

- API / Integration: 4
- API: 1
- UI E2E: 3
- Accessibility: 3
- Security: 2
- Requirement Clarification: 4
- Traceability Verification: 1

### Top Automation Candidates

1. `RATING-007-US-001-TC-001` - missing tried place re-add creates one list item.
2. `RATING-007-US-003-TC-001` - re-add creates no second rating.
3. `RATING-007-US-005-TC-001` - duplicate re-add remains idempotent.
4. `RATING-007-US-006-TC-001` - PATCH update preserves re-added list item.
5. `RATING-007-US-007-TC-001` - non-owner denial causes no mutation.
6. `RATING-007-US-008-TC-001` - tried context does not block re-add.

## Validation

- Duplicate Test IDs = 0
- Invalid Story References = 0
- Missing User Stories = 0
- Encoding/Mojibake = 0
- Generic Executable Wording = 0
- Requirement Fidelity Violations = 0
- Feature Ownership Violations = 0
- Disallowed Source References = 0
- Undocumented HTTP Status Assumptions = 0
