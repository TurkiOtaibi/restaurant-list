# PLACE-019 Test Cases

Feature: `PLACE-019 - Add current place to one owned list`

Source: `docs/user-stories/PLACE_DETAILS_USER_STORIES.md`

Supporting Sources:

- `docs/feature-map/FEATURE_TRACEABILITY.md`
- `docs/user-stories/LISTS_USER_STORIES.md`
- `docs/user-stories/PUBLIC_LISTS_USER_STORIES.md`
- `docs/user-stories/RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`

Scope: All user stories under `PLACE-019`.

## QA Execution Standards

- Test cases validate documented requirements only. Undefined add-to-list behavior must be captured as Requirement Clarification, Manual Verification, or Traceability Verification.
- `PLACE-019` owns opening the Add To List flow from Place Detail, showing owned list choices, adding the current place to exactly one owned list, duplicate add behavior where documented, owner-only targeting, rated-place add behavior, add loading/error feedback, mobile usability, and accessibility.
- `PLACE-019` does not own list creation, list rename, list deletion, visibility management, public-list browsing, full list-detail behavior, rating save validation, or profile/archive behavior.
- Supporting `LIST-*` requirements define owned-list response envelope, owner-only list access, one-list/one-place add scope, idempotent duplicate add, `201 Created` for new membership, `200 OK` for existing membership, and unique `(list_id, place_id)` membership.
- Primary route: `/places/{id}`.
- Add endpoint from traceability: `POST /api/v1/lists/{id}/items` with Bearer authentication.
- Owned list choices may be sourced from `GET /api/v1/lists` with Bearer authentication.
- Add payload contract: selected owned list ID in the route and current place ID in request body as `placeId`. If the implementation uses a different request field, the requirements must be updated before execution.
- Successful new add response must be `201 Created`; successful idempotent duplicate add response must be `200 OK`.
- Add success payloads must return the documented membership item for the selected list and current place; executable schema tests verify selected list identity, current place identity, required membership fields defined by the ListItem contract, and absence of private/internal fields.
- Guest add attempts must return `401 Unauthorized`.
- Not-found behavior is executable for nonexistent place IDs because LIST-008 documents not-found add behavior; exact status for non-owned list denial remains a clarification unless explicitly documented.
- Public-list routes and public-list browsing remain `PUBLIC-*` ownership. PLACE-019 tests may verify public-list routes are not used as add targets.
- Executable responsive tests cite `RESP-001-US-011`, `RESP-001-US-012`, `RESP-002-US-001`, `RESP-002-US-002`, `RESP-002-US-005`, `RESP-002-US-010`, `RESP-002-US-011`, `RESP-002-US-012`, `RESP-002-US-016`, `RESP-002-US-017`, `RESP-002-US-018`, `RESP-003-US-001`, `RESP-003-US-008`, and `RESP-003-US-017` where applicable.
- Executable accessibility tests cite `PLACE-019-US-010` and `A11Y-001` dialog/sheet requirements where applicable.
- Automation cadence values used in Notes: Smoke, Regression, Nightly, Manual Review.

## PLACE-019-US-001 - Open add-to-list flow

User Story Summary: As a user, I want to open Add To List from place detail so that I can save the current place to a collection.

Related Feature ID: `PLACE-019`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-019-US-001-TC-001 | Open Add To List flow from place detail | UI, Positive, Regression | Critical | Authenticated user exists; place `p_add_001` exists. | `/places/p_add_001`; action label `أضف إلى قائمة`. | 1. Sign in. 2. Open `/places/p_add_001`. 3. Activate `أضف إلى قائمة`. | Add-to-list flow opens for `p_add_001`; the flow remains associated with the current place ID. | PLACE-019-US-001 | Yes | UI E2E | Smoke cadence. |
| PLACE-019-US-001-TC-002 | Add To List action is absent while place detail is unresolved | UI, Loading, Security | High | Authenticated session exists; place-detail request is delayed. | `/places/p_add_loading`. | 1. Open place detail with delayed `GET /api/v1/places/{id}`. 2. Inspect initial loading state. | Add-to-list action is not actionable until the current place detail context is resolved. | PLACE-019-US-001 | Yes | UI E2E | Regression cadence. |
| PLACE-019-US-001-TC-003 | Add flow does not open for wrong place after rapid navigation | UI, Data Integrity, Regression | High | Authenticated user exists; places `p_a` and `p_b` exist. | Navigate `/places/p_a` then `/places/p_b`. | 1. Open `/places/p_a`. 2. Navigate to `/places/p_b` before opening add flow. 3. Activate Add To List after `p_b` loads. | Add-to-list flow context is `p_b`; no request or UI text targets `p_a`. | PLACE-019-US-001 | Yes | UI E2E | Regression cadence. |
| PLACE-019-US-001-TC-004 | Direct URL place detail supports add flow | UI, Routing, Integration | High | Authenticated user exists; place exists; user owns one list. | Direct URL `/places/p_direct_add`. | 1. Open direct place detail URL. 2. Activate Add To List. | Add-to-list flow opens for `p_direct_add`. | PLACE-019-US-001 | Yes | UI E2E | Regression cadence. |
| PLACE-019-US-001-TC-005 | Add flow trigger has current-place accessible name | Accessibility, UI | High | Authenticated user exists; place detail loaded. | Place name `Burger House`; action `أضف إلى قائمة`. | 1. Open place detail. 2. Inspect the Add To List trigger accessibility name. | Trigger accessible name communicates adding the current place to a list and is not empty or generic. | PLACE-019-US-001 | Yes | Accessibility | Regression cadence. |
| PLACE-019-US-001-TC-006 | Browser history behavior after opening add flow requires clarification | Requirement Clarification, Manual | Medium | Requirements review is being performed. | Add flow as dialog, sheet, or route. | 1. Review PLACE-019 and information architecture requirements. 2. Confirm whether opening/closing add flow must affect browser history. | No executable browser-history assertion is made for opening the add flow until documented. | PLACE-019-US-001 | No | Manual | Manual Review cadence. |

## PLACE-019-US-002 - Show owned list choices

User Story Summary: As a user, I want to see my owned lists so that I can choose where to add the place.

Related Feature ID: `PLACE-019`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-019-US-002-TC-001 | Show one owned list choice | UI, Positive | Critical | Authenticated user owns list `Dinner`; place detail is open. | Owned list `Dinner`. | 1. Open Add To List flow. 2. Inspect list choices. | `Dinner` is available as a selectable list choice. | PLACE-019-US-002 | Yes | UI E2E | Smoke cadence. |
| PLACE-019-US-002-TC-002 | Show many owned list choices | UI, Positive, Boundary | High | Authenticated user owns 25 lists. | Lists `List 01` through `List 25`. | 1. Open Add To List flow. 2. Inspect available choices. | All returned owned lists are reachable through the flow without selecting more than one list at a time. | PLACE-019-US-002 | Yes | UI E2E | Regression cadence. |
| PLACE-019-US-002-TC-003 | Owned list choices API uses collection envelope | API, Contract | Critical | Authenticated user owns at least one list. | `GET /api/v1/lists` with Bearer token. | 1. Open Add To List flow or call owned-list endpoint directly. 2. Inspect response. | Response status is `200 OK`; response shape is `{ data: ListResponse[], meta: { limit, offset, total, sort } }`. | PLACE-019-US-002 | Yes | API | Smoke cadence. Source: LIST-001-US-003. |
| PLACE-019-US-002-TC-004 | Owned list choices include private and public owned lists | UI, Privacy, Positive | High | Authenticated user owns one private list and one public list. | `Private Picks`, `Public Picks`. | 1. Open Add To List flow. 2. Inspect choices. | Both owned lists are available as choices; public-list browsing route data is not shown. | PLACE-019-US-002 | Yes | UI E2E | Regression cadence. |
| PLACE-019-US-002-TC-005 | Other users' lists are excluded from choices | API, UI, Privacy, Security | Critical | Current user owns `My List`; another user owns `Other Private` and `Other Public`. | `GET /api/v1/lists` as current user. | 1. Open Add To List flow. 2. Inspect visible choices and owned-list response. | Response status is `200 OK`; only current user's owned lists appear; `Other Private` and `Other Public` are absent from response, DOM, and accessibility tree. | PLACE-019-US-002 | Yes | Security | Smoke cadence. |
| PLACE-019-US-002-TC-006 | Duplicate owned list names remain distinguishable | UI, Data Integrity | High | Authenticated user owns two lists named `برجر` with different IDs and metadata. | `list_a.name=برجر`, `list_b.name=برجر`. | 1. Open Add To List flow. 2. Inspect both duplicate choices. | Both duplicate-name lists are available as separate targets; the selected target maps to its own list ID. | PLACE-019-US-002 | Yes | UI E2E | Regression cadence. Source: LIST-011. |
| PLACE-019-US-002-TC-007 | List choice response excludes forbidden private fields | API, Privacy, Security | High | Authenticated user owns lists. | `GET /api/v1/lists`. | 1. Send authenticated request. 2. Inspect response JSON. | Response status is `200 OK`; list choices include list metadata required by LIST rules and exclude owner email, internal owner ID, tokens, cookies, private notes, public owner metadata, and debug fields. | PLACE-019-US-002 | Yes | API | Regression cadence. |
| PLACE-019-US-002-TC-008 | Owned list search inside add flow requires clarification | Requirement Clarification, Manual | Medium | Requirements review is being performed. | User owns many lists. | 1. Review PLACE-019 open questions. 2. Confirm whether owned-list search is required in Add To List flow. | No executable assertion is made for searching/filtering owned list choices until documented. | PLACE-019-US-002 | No | Manual | Manual Review cadence. |

## PLACE-019-US-003 - Add to one list

User Story Summary: As a user, I want one add action to target one list so that the action is clear and controlled.

Related Feature ID: `PLACE-019`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-019-US-003-TC-001 | Add current place to one selected owned list | API, Positive, Contract | Critical | Authenticated user owns list `list_target`; place `p_target` exists and is not in the list. | `POST /api/v1/lists/list_target/items` body `{ "placeId": "p_target" }`. | 1. Send authenticated request. 2. Inspect status and response. 3. Query list detail as owner. | Response status is `201 Created`; returned membership item identifies `list_target` and `p_target`; list detail shows `p_target` exactly once. | PLACE-019-US-003 | Yes | API | Smoke cadence. Source: LIST-008-US-015 and LIST-009-US-002. |
| PLACE-019-US-003-TC-002 | UI sends selected list ID and current place ID only | UI, API Integration, Data Integrity | Critical | Authenticated user owns lists `A` and `B`; current place is `p_one_list`. | Select list `A`. | 1. Open Add To List flow from `/places/p_one_list`. 2. Select list `A`. 3. Confirm add. 4. Inspect outgoing request and response. | Exactly one `POST /api/v1/lists/{id}/items` request is sent; route ID is `A`; body contains `placeId=p_one_list`; response status is `201 Created`; no request is sent for list `B`. | PLACE-019-US-003 | Yes | UI E2E | Smoke cadence. |
| PLACE-019-US-003-TC-003 | Add to empty list succeeds | Integration, Positive | High | Authenticated user owns empty list `Empty List`; place exists. | `placeCount=0`. | 1. Add current place to `Empty List`. 2. Inspect API status. 3. Refresh owned list detail. | Add response status is `201 Created`; the place appears once in `Empty List`. | PLACE-019-US-003 | Yes | UI E2E | Regression cadence. |
| PLACE-019-US-003-TC-004 | Add to populated list succeeds without replacing existing items | Integration, Data Integrity | High | Authenticated user owns list with existing place `p_existing`; current place is `p_new`. | List `list_populated`. | 1. Add `p_new` to `list_populated`. 2. Refresh list detail. | Add response status is `201 Created`; both `p_existing` and `p_new` are present once. | PLACE-019-US-003 | Yes | UI E2E | Regression cadence. |
| PLACE-019-US-003-TC-005 | Missing placeId payload is rejected | API, Validation, Negative | High | Authenticated user owns list `list_missing_payload`. | `POST /api/v1/lists/list_missing_payload/items` with `{}`. | 1. Send authenticated request without `placeId`. 2. Inspect status and list contents. | Response status is `422 Validation Error`; no list item is created. | PLACE-019-US-003 | Yes | API | Regression cadence. Source: LIST-008-US-012. |
| PLACE-019-US-003-TC-006 | Nonexistent place ID is rejected | API, Validation, Negative | High | Authenticated user owns list. | `placeId=p_missing_404`. | 1. Send authenticated add request with nonexistent place ID. 2. Inspect status and list contents. | Response status is `404 Not Found`; no list item is created. | PLACE-019-US-003 | Yes | API | Regression cadence. Source: LIST-008-US-013. |
| PLACE-019-US-003-TC-007 | New membership success response schema is deterministic | API, Contract | Critical | Authenticated user owns list `list_schema`; place `p_schema` exists and is not in the list. | `POST /api/v1/lists/list_schema/items` body `{ "placeId": "p_schema" }`. | 1. Send authenticated request. 2. Inspect response JSON. | Response status is `201 Created`; payload is one membership item using the documented ListItem response contract; payload includes selected list identity and current place identity and does not use a collection envelope. | PLACE-019-US-003 | Yes | API | Smoke cadence. Source: FEATURE_TRACEABILITY ListItem and LIST-009-US-002. |
| PLACE-019-US-003-TC-008 | New membership success response excludes forbidden fields | API, Security, Privacy | Critical | Authenticated user owns list; place is not in list. | New add request. | 1. Send authenticated add request. 2. Inspect response JSON recursively. | Response status is `201 Created`; response contains no owner email, internal owner ID, session token, cookie, private notes, other users' private membership data, internal moderation fields, stack traces, or debug fields. | PLACE-019-US-003 | Yes | Security | Smoke cadence. Source: LIST-008-US-002, LIST-009-US-002, privacy rules. |
| PLACE-019-US-003-TC-009 | Add after removal restores one membership | API, Integration, Data Integrity | High | Authenticated user owns list `list_readd`; place `p_readd` exists; user can remove owned-list membership through LIST-010. | `POST /api/v1/lists/list_readd/items`; `DELETE /api/v1/lists/list_readd/items/p_readd`. | 1. Add `p_readd` to `list_readd` and verify `201 Created`. 2. Remove `p_readd` from `list_readd` and verify removal succeeds with documented LIST-010 response. 3. Add `p_readd` to `list_readd` again. 4. Query membership state. | Final add returns `201 Created`; exactly one membership exists for `(list_readd, p_readd)`; `p_readd` appears once in the list. | PLACE-019-US-003 | Yes | API | Regression cadence. Source: PLACE-019-US-003, LIST-010-US-001, LIST-010-US-008, LIST-009-US-001. |
| PLACE-019-US-003-TC-010 | Multi-select add behavior requires clarification | Requirement Clarification, Manual | Medium | Requirements review is being performed. | Add flow with multiple owned lists. | 1. Review PLACE-019 one-list target requirement. 2. Confirm whether UI must prevent selecting multiple lists or allow only one selected state. | Executable tests assert one request to one list; exact multi-select prevention UI pattern is not asserted until documented. | PLACE-019-US-003 | No | Manual | Manual Review cadence. |

## PLACE-019-US-004 - No owned lists empty state

User Story Summary: As a user without lists, I want a clear state so that I understand why I cannot add yet.

Related Feature ID: `PLACE-019`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-019-US-004-TC-001 | Add flow shows no-owned-lists empty state | UI, Empty State, Positive | Medium | Authenticated user owns zero lists; place detail is open. | `GET /api/v1/lists` returns `200 OK` with `data=[]`, `meta.total=0`. | 1. Open Add To List flow. 2. Inspect visible content, selectable choices, and outgoing network calls. | Empty-state text is visible and exposed to assistive technology; zero selectable list choices are rendered; no `POST /api/v1/lists/{id}/items` request is sent on open. | PLACE-019-US-004 | Yes | UI E2E | Smoke cadence. |
| PLACE-019-US-004-TC-002 | No add request is possible without a selected owned list | UI, Validation, Negative | High | Authenticated user owns zero lists. | Empty owned-list response. | 1. Open Add To List flow. 2. Attempt to confirm add without a list choice. | No `POST /api/v1/lists/{id}/items` request is sent. | PLACE-019-US-004 | Yes | UI E2E | Regression cadence. |
| PLACE-019-US-004-TC-003 | Empty state does not expose create-list behavior as PLACE-019 requirement | Traceability Verification, Manual | Medium | Requirements review is being performed. | PLACE-019-US-004; LIST-003. | 1. Review whether no-list state requires a create-list CTA. 2. Confirm list creation remains LIST-003 scope. | PLACE-019 may show an empty state or clear next step; create-list mechanics are not executable PLACE-019 assertions. | PLACE-019-US-004 | No | Manual | Manual Review cadence. |
| PLACE-019-US-004-TC-004 | Empty state is accessible | Accessibility, Empty State | Medium | Authenticated user owns zero lists. | No-owned-lists state. | 1. Open Add To List flow. 2. Inspect accessibility tree and keyboard order. | Empty-state message is exposed to assistive technology; close/cancel control remains keyboard reachable. | PLACE-019-US-004 | Yes | Accessibility | Regression cadence. Source: PLACE-019-US-010 and A11Y-001. |

## PLACE-019-US-005 - Duplicate membership prevention

User Story Summary: As the system, I want duplicate list memberships prevented so that the same place is not stored twice in one list.

Related Feature ID: `PLACE-019`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-019-US-005-TC-001 | Duplicate add creates no second membership row | API, Data Integrity, Negative | Critical | `(list_id=list_dup, place_id=p_dup)` already exists. | `POST /api/v1/lists/list_dup/items` body `{ "placeId": "p_dup" }`. | 1. Send duplicate add request. 2. Query list detail or database-backed API state. | Response status is `200 OK`; exactly one membership exists for `(list_dup, p_dup)`. | PLACE-019-US-005 | Yes | API | Smoke cadence. Source: LIST-009-US-001 and LIST-009-US-003. |
| PLACE-019-US-005-TC-002 | Duplicate add through UI does not duplicate visible row | UI, Data Integrity, Regression | High | Place already belongs to selected owned list. | List `Favorites`; place `p_dup_ui`. | 1. Open Add To List flow. 2. Select `Favorites`. 3. Confirm add. 4. Refresh list detail. | Add request returns `200 OK`; list detail shows `p_dup_ui` exactly once; no second visible row for the same place appears. | PLACE-019-US-005 | Yes | UI E2E | Regression cadence. |
| PLACE-019-US-005-TC-003 | Concurrent duplicate add creates one membership | API, Concurrency, Data Integrity | Critical | Authenticated user owns list; place is not initially in list. | Two concurrent `POST /api/v1/lists/{id}/items` requests for same place. | 1. Send two authenticated add requests concurrently. 2. Inspect both responses. 3. Query membership state. | One request returns `201 Created`; the other returns `200 OK` idempotent success; exactly one membership exists. | PLACE-019-US-005 | Yes | API | Nightly cadence. Source: LIST-009-US-004 and LIST-009-US-005. |
| PLACE-019-US-005-TC-004 | Repeated submit is deduplicated | UI, Regression, Data Integrity | High | Authenticated user owns list; place not initially in list. | Rapid double click/tap on confirm. | 1. Open Add To List flow. 2. Select owned list. 3. Rapidly activate confirm twice. 4. Inspect requests and list detail. | The list contains the place once; duplicate membership is not created. | PLACE-019-US-005 | Yes | UI E2E | Regression cadence. |
| PLACE-019-US-005-TC-005 | Duplicate membership database uniqueness traceability | Traceability Verification, Manual | Medium | QA traceability review is being performed. | `list_items` unique `(list_id, place_id)`. | 1. Review `FEATURE_TRACEABILITY.md` database traceability. 2. Confirm duplicate prevention is backed by the `list_items` uniqueness rule. | Traceability links duplicate prevention to `ListItem` and unique `(list_id, place_id)`. | PLACE-019-US-005 | No | Manual | Manual Review cadence. |

## PLACE-019-US-006 - Idempotent duplicate add success

User Story Summary: As a user, I want repeat add actions to succeed harmlessly so that accidental taps do not create errors.

Related Feature ID: `PLACE-019`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-019-US-006-TC-001 | Existing membership returns 200 OK | API, Positive, Contract | High | `(list_id=list_existing, place_id=p_existing)` already exists. | Duplicate add request. | 1. Send authenticated duplicate add request. 2. Inspect status and body. | Response status is `200 OK`; payload is the existing membership item for `list_existing` and `p_existing`. | PLACE-019-US-006 | Yes | API | Smoke cadence. Source: LIST-009-US-003. |
| PLACE-019-US-006-TC-002 | Duplicate add does not show blocking duplicate error | UI, UX, Regression | Medium | Place already belongs to selected owned list. | List `Already Added`. | 1. Open Add To List flow. 2. Select `Already Added`. 3. Confirm add. | Add request returns `200 OK`; UI renders a non-error completion state and does not render an error role, retry control, or blocking duplicate validation state. | PLACE-019-US-006 | Yes | UI E2E | Regression cadence. Source: LIST-009-US-009. |
| PLACE-019-US-006-TC-003 | Duplicate add leaves place count unchanged | Integration, Data Integrity | High | Place already belongs to selected owned list with `placeCount=N`. | Existing membership. | 1. Record list `placeCount`. 2. Submit duplicate add. 3. Refresh list metadata. | Duplicate add response is `200 OK`; `placeCount` remains `N`. | PLACE-019-US-006 | Yes | API | Regression cadence. Source: LIST-009-US-007. |
| PLACE-019-US-006-TC-004 | Duplicate add success message copy requires clarification | Requirement Clarification, Manual | Low | Requirements review is being performed. | Duplicate add UI state. | 1. Review PLACE-019 and LIST-009. 2. Confirm exact success/already-added copy. | No executable assertion is made for exact duplicate-add success copy until documented. | PLACE-019-US-006 | No | Manual | Manual Review cadence. |
| PLACE-019-US-006-TC-005 | Existing membership response schema is deterministic | API, Contract | High | `(list_id=list_existing_schema, place_id=p_existing_schema)` already exists. | Duplicate add request. | 1. Send authenticated duplicate add request. 2. Inspect response JSON. | Response status is `200 OK`; payload is one membership item using the documented ListItem response contract; payload identifies `list_existing_schema` and `p_existing_schema`; count metadata is not inflated. | PLACE-019-US-006 | Yes | API | Regression cadence. Source: LIST-009-US-003 and LIST-009-US-007. |
| PLACE-019-US-006-TC-006 | Existing membership response excludes forbidden fields | API, Privacy, Security | High | Existing membership belongs to current user's owned list. | Duplicate add request. | 1. Send authenticated duplicate add request. 2. Inspect response JSON recursively. | Response status is `200 OK`; response contains no owner email, internal owner ID, auth/session fields, private notes, other users' private membership data, internal moderation fields, stack traces, or debug fields. | PLACE-019-US-006 | Yes | Security | Regression cadence. |

## PLACE-019-US-007 - Owner-only list target

User Story Summary: As the system, I want users to add places only to lists they own so that users cannot modify others' lists.

Related Feature ID: `PLACE-019`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-019-US-007-TC-001 | Guest cannot add place to list | API, Authentication, Negative | Critical | No valid session exists; list and place exist. | `POST /api/v1/lists/list_any/items` with `{ "placeId": "p_any" }`. | 1. Send request without Bearer token. 2. Inspect status and body. | Response status is `401 Unauthorized`; no list item is created; response contains no private list data. | PLACE-019-US-007 | Yes | API | Smoke cadence. |
| PLACE-019-US-007-TC-002 | Expired session cannot add place to list | API, Authentication, Negative | Critical | Expired/invalid token exists; list and place exist. | Add request with expired token. | 1. Send request with expired token. 2. Inspect status and body. | Response status is `401 Unauthorized`; no list item is created; response contains no private list data. | PLACE-019-US-007 | Yes | API | Regression cadence. |
| PLACE-019-US-007-TC-003 | Non-owned list is not offered as a choice | UI, Security, Privacy | Critical | Current user and another user exist; another user owns `Other List`. | Add flow for current user. | 1. Sign in as current user. 2. Open Add To List flow. 3. Inspect list choices, DOM, and accessibility tree. | `Other List` is absent from choices, DOM text, hidden text, and accessibility tree. | PLACE-019-US-007 | Yes | Security | Smoke cadence. |
| PLACE-019-US-007-TC-004 | Direct API add to non-owned list is denied before idempotency | Security, Privacy, Feature Ownership | Critical | Another user owns list containing or not containing the place. | `POST /api/v1/lists/other_user_list/items`. | 1. Send authenticated request as non-owner. 2. Inspect denial response and body. 3. Verify other user's list contents as owner. | Request is denied without returning membership data; other user's list remains unchanged; response body contains no private list name, owner metadata, or place membership data. | PLACE-019-US-007 | Yes | Security | Smoke cadence. Exact denial status remains clarification-only in `PLACE-019-US-007-TC-005`. |
| PLACE-019-US-007-TC-005 | Exact non-owned add denial status requires clarification | Requirement Clarification, Manual | High | Requirements review is being performed. | Non-owned `POST /api/v1/lists/{id}/items`. | 1. Review LIST-008-US-002 and security requirements. 2. Confirm exact status code for non-owned add denial. | No executable exact status assertion is made for non-owned list denial until documented; privacy-safe denial remains executable. | PLACE-019-US-007 | No | Manual | Manual Review cadence. |
| PLACE-019-US-007-TC-006 | Public-list route cannot be used as add target | Security, Feature Ownership, Negative | High | Public list exists; current user is not owner. | `/lists/public/{id}` and add endpoint. | 1. Open Add To List flow from place detail. 2. Inspect choices and outgoing add route. | Public-list route IDs are not offered as add targets; add requests use owned-list endpoint `POST /api/v1/lists/{id}/items` only. | PLACE-019-US-007 | Yes | Security | Regression cadence. Public browsing remains PUBLIC-* scope. |
| PLACE-019-US-007-TC-007 | Guest auth resolution does not expose owned-list names | UI, Security, Privacy | Critical | No valid session exists; browser has no authenticated app state. | Direct URL `/places/p_guest_add`; protected owned list name `Private Dinner`. | 1. Open `/places/p_guest_add` as guest. 2. Observe UI from first paint until denial/redirect state completes. 3. Inspect DOM and accessibility tree snapshots. | No owned-list name, list choice, add target ID, or protected list metadata appears in visible UI, DOM, or accessibility tree before or after guest denial. | PLACE-019-US-007 | Yes | Security | Smoke cadence. Source: auth rules and PLACE-019-US-007. |
| PLACE-019-US-007-TC-008 | Expired session clears protected add-to-list state | UI, Security, Privacy | Critical | User previously had an authenticated session with owned list `Expired Private`; token expires before Add To List flow opens. | Expired token; `/places/p_expired_add`. | 1. Load place detail with expired session. 2. Attempt to open Add To List flow or trigger auth revalidation. 3. Inspect visible UI, DOM, accessibility tree, and network. | Protected owned-list choices are not rendered; stale list names are absent from DOM and accessibility tree; add request returns `401 Unauthorized` if attempted; no private list data remains visible. | PLACE-019-US-007 | Yes | Security | Regression cadence. |
| PLACE-019-US-007-TC-009 | Auth resolution blocks protected choices until session is valid | UI, Loading, Security | High | Auth state is unresolved; user may or may not have a valid session. | Delayed auth/session resolution and delayed `GET /api/v1/lists`. | 1. Open place detail while auth state is pending. 2. Attempt to inspect or open Add To List before auth resolves. 3. Complete auth resolution. | Before valid auth resolution, no owned-list choices are rendered and no `GET /api/v1/lists` success data is shown; after valid auth resolution, choices render only from authenticated `200 OK` owned-list response. | PLACE-019-US-007 | Yes | UI E2E | Regression cadence. |

## PLACE-019-US-008 - Add rated place later

User Story Summary: As a user, I want to add a rated place back to a list so that rating history does not prevent organization.

Related Feature ID: `PLACE-019`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-019-US-008-TC-001 | Add rated place to owned list succeeds | Integration, Positive | High | Authenticated user has rated place `p_rated_001`; user owns list `Rated Later`; place is not in that list. | Existing rating for `p_rated_001`. | 1. Open place detail for `p_rated_001`. 2. Add current place to `Rated Later`. 3. Inspect add response and list detail. | Add response status is `201 Created`; `p_rated_001` appears once in `Rated Later`. | PLACE-019-US-008 | Yes | UI E2E | Regression cadence. |
| PLACE-019-US-008-TC-002 | Add rated place does not create or modify rating | API, Integration, Data Integrity | High | Current user has existing rating for place; user owns target list. | Rating value `8.5`; target list `Tried`. | 1. Record current rating ID/value/note presence. 2. Add place to target list. 3. Re-fetch rating context. | Add response status is `201 Created`; existing rating ID/value/note presence remains unchanged; no additional rating record is created. | PLACE-019-US-008 | Yes | API | Regression cadence. Source: PLACE-019-US-008 and LIST-009-US-008. |
| PLACE-019-US-008-TC-003 | Duplicate add of rated place keeps rating unchanged | Integration, Data Integrity | High | Rated place already belongs to selected list. | Existing membership and rating. | 1. Submit duplicate add. 2. Re-fetch list detail and rating context. | Duplicate add response is `200 OK`; list membership remains one row; rating context is unchanged. | PLACE-019-US-008 | Yes | API | Regression cadence. |
| PLACE-019-US-008-TC-004 | Rating value validation remains Ratings module scope | Traceability Verification, Manual | Medium | QA traceability review is being performed. | RATING-* requirements. | 1. Review PLACE-019 and Ratings requirements. 2. Confirm rating value/note validation belongs to RATING-* test packages. | PLACE-019 tests verify add does not mutate ratings; they do not duplicate rating save validation. | PLACE-019-US-008 | No | Manual | Manual Review cadence. |
| PLACE-019-US-008-TC-005 | Add rated place again after removal preserves rating state | API, Integration, Data Integrity | High | Authenticated user rated place `p_rated_readd`; place was previously removed from owned list `list_rated_readd` through LIST-010. | Existing rating value `8.5`; no current membership. | 1. Confirm rating context exists for `p_rated_readd`. 2. Add `p_rated_readd` to `list_rated_readd`. 3. Re-fetch list membership and rating context. | Add response status is `201 Created`; exactly one membership exists; existing rating value and rating state remain unchanged; no new rating record is created. | PLACE-019-US-008 | Yes | API | Regression cadence. Source: PLACE-019-US-008, LIST-010-US-006, LIST-010-US-007. |

## PLACE-019-US-009 - Add-to-list loading and error states

User Story Summary: As a user, I want clear loading and error states while adding so that I know whether the action completed.

Related Feature ID: `PLACE-019`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-019-US-009-TC-001 | Submit loading state blocks duplicate submission | UI, Loading, Regression | High | Authenticated user owns target list; add request is delayed. | Delayed `POST /api/v1/lists/{id}/items`. | 1. Open Add To List flow. 2. Select list. 3. Confirm add. 4. Attempt to confirm again while request is pending. | Pending state is visible; no second add request is sent while the first request is pending. | PLACE-019-US-009 | Yes | UI E2E | Smoke cadence. |
| PLACE-019-US-009-TC-002 | Successful add shows confirmation and no false error | UI, Positive, UX | High | Authenticated user owns target list; place not in list. | New add. | 1. Add current place to selected list. 2. Inspect post-submit state. | Add response status is `201 Created`; a visible or programmatic completion status is present; no error role, retry control, or false failure state is rendered; membership exists once. | PLACE-019-US-009 | Yes | UI E2E | Regression cadence. |
| PLACE-019-US-009-TC-003 | Network failure shows retry without false success | UI, Error Handling, Regression | High | Authenticated user owns target list; network failure is simulated for add request. | Failed `POST /api/v1/lists/{id}/items`. | 1. Open Add To List flow. 2. Select list. 3. Submit while network fails. | Error feedback appears; no success confirmation is shown; selected list and current place context remain available for retry. | PLACE-019-US-009 | Yes | UI E2E | Regression cadence. |
| PLACE-019-US-009-TC-004 | Retry after failed new add returns created state | UI, Error Handling, Regression | Medium | First add attempt fails before membership is created; second attempt succeeds. | Same selected list and place; no membership after failed attempt. | 1. Submit add and simulate network failure before server-side creation. 2. Verify no membership exists. 3. Activate retry. 4. Allow retry to succeed. | First request shows error; retry sends one new add request; retry response is `201 Created`; error state is removed; membership exists once. | PLACE-019-US-009 | Yes | UI E2E | Regression cadence. |
| PLACE-019-US-009-TC-005 | List choices loading state shows no fake choices | UI, Loading | Medium | Owned list request is delayed. | Delayed `GET /api/v1/lists`. | 1. Open Add To List flow. 2. Inspect loading state before lists return. | Loading state appears and no fake or stale list choices are presented as selectable final data. | PLACE-019-US-009 | Yes | UI E2E | Regression cadence. |
| PLACE-019-US-009-TC-006 | Owned list load failure is recoverable | UI, Error Handling | High | `GET /api/v1/lists` fails with network or 5xx error. | Owned-list load failure. | 1. Open Add To List flow. 2. Simulate owned-list load failure. 3. Inspect state. | Error feedback appears with a retry path; no add request can be submitted until owned list choices are available. | PLACE-019-US-009 | Yes | UI E2E | Regression cadence. |
| PLACE-019-US-009-TC-007 | Exact success/error message copy requires clarification | Requirement Clarification, Manual | Low | Requirements review is being performed. | Success and failure UI copy. | 1. Review PLACE-019-US-009. 2. Confirm exact Arabic success/error copy. | No executable assertion is made for exact message copy until documented. | PLACE-019-US-009 | No | Manual | Manual Review cadence. |
| PLACE-019-US-009-TC-008 | Retry after server-created membership returns idempotent state | UI, Error Handling, Regression | Medium | First add attempt creates membership but client receives network failure before response. | Same selected list and place; membership exists before retry. | 1. Submit add and simulate dropped client response after server creates membership. 2. Verify membership exists once through API setup/fixture. 3. Activate retry. | Retry sends one new add request; retry response is `200 OK`; error state is removed; membership remains exactly one row. | PLACE-019-US-009 | Yes | UI E2E | Regression cadence. Source: LIST-009-US-003 and LIST-009-US-007. |

## PLACE-019-US-010 - Accessible add-to-list flow

User Story Summary: As a keyboard or screen-reader user, I want the add-to-list flow accessible so that I can add the place without a pointer.

Related Feature ID: `PLACE-019`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-019-US-010-TC-001 | Add flow exposes dialog or sheet semantics | Accessibility, Semantics | High | Authenticated user owns at least one list. | Add To List flow. | 1. Open Add To List flow. 2. Inspect accessibility tree. | Flow exposes modal dialog or bottom-sheet semantics with an accessible name. | PLACE-019-US-010 | Yes | Accessibility | Smoke cadence. Source: A11Y-001-US-001 or A11Y-001-US-002. |
| PLACE-019-US-010-TC-002 | Initial focus is placed inside add flow | Accessibility, Keyboard | High | Add flow can be opened from place detail. | Add flow trigger. | 1. Focus Add To List trigger. 2. Activate it. 3. Inspect active element. | Initial focus moves to a meaningful element inside the add flow, such as title, first list choice, or first safe control. | PLACE-019-US-010 | Yes | Accessibility | Regression cadence. Source: A11Y-001-US-003. |
| PLACE-019-US-010-TC-003 | Keyboard can select list and confirm add | Accessibility, Keyboard, Positive | Critical | Authenticated user owns one target list. | List `Keyboard List`. | 1. Open add flow. 2. Use keyboard only to reach list choice. 3. Select it. 4. Confirm add. | Add request is sent for the selected list and current place; response is `201 Created` for new membership. | PLACE-019-US-010 | Yes | Accessibility | Smoke cadence. |
| PLACE-019-US-010-TC-004 | Focus-visible is shown on list choices and actions | Accessibility, Keyboard, UI | High | Add flow is open. | Keyboard navigation. | 1. Press Tab/Shift+Tab through choices and controls. 2. Inspect focus indicator. | Each focused list choice, confirm control, retry control, and close/cancel control has visible focus. | PLACE-019-US-010 | Yes | Accessibility | Regression cadence. |
| PLACE-019-US-010-TC-005 | Focus is trapped inside modal add flow | Accessibility, Keyboard | High | Add flow is modal dialog or sheet. | Open add flow. | 1. Open flow. 2. Press Tab and Shift+Tab repeatedly. | Focus remains inside the add flow until it is closed. | PLACE-019-US-010 | Yes | Accessibility | Regression cadence. Source: A11Y-001-US-004 or A11Y-001-US-005. |
| PLACE-019-US-010-TC-006 | Focus restores to trigger after close | Accessibility, Keyboard | High | Add flow is opened from Add To List trigger. | Close/cancel flow. | 1. Focus trigger. 2. Open flow. 3. Close it without mutation. | Focus returns to the Add To List trigger or documented fallback if the trigger unmounts. | PLACE-019-US-010 | Yes | Accessibility | Regression cadence. Source: A11Y-001-US-006 and A11Y-001-US-007. |
| PLACE-019-US-010-TC-007 | Loading state is announced accessibly | Accessibility, Loading | Medium | Add request is delayed. | Pending add request. | 1. Submit add. 2. Inspect accessibility tree and status output. | Pending state is communicated via `aria-busy`, status text, or equivalent accessible status without relying only on animation. | PLACE-019-US-010 | Yes | Accessibility | Regression cadence. Source: A11Y-001-US-016. |
| PLACE-019-US-010-TC-008 | Error state is announced accessibly | Accessibility, Error Handling | High | Add request fails. | Failed add request. | 1. Submit add with simulated failure. 2. Inspect accessibility tree/status. | Error feedback is programmatically available to assistive technology and retry control is keyboard reachable. | PLACE-019-US-010 | Yes | Accessibility | Regression cadence. |
| PLACE-019-US-010-TC-009 | Close control has accessible Arabic name | Accessibility, Screen Reader | Medium | Add flow is open and close control is visible. | Close label `إغلاق` or equivalent. | 1. Open add flow. 2. Inspect close control accessible name. | Close control has a clear accessible Arabic name such as `إغلاق` or approved equivalent. | PLACE-019-US-010 | Yes | Accessibility | Regression cadence. Source: A11Y-001-US-009. |
| PLACE-019-US-010-TC-010 | Escape closes dismissible add flow | Accessibility, Keyboard | Medium | Add flow is open and no pending request blocks dismissal. | Press Escape. | 1. Open add flow. 2. Press Escape. | Flow closes and focus restoration behavior is applied. | PLACE-019-US-010 | Yes | Accessibility | Regression cadence. Source: A11Y-001-US-008. |
| PLACE-019-US-010-TC-011 | Live-region success announcement requires clarification | Requirement Clarification, Manual | Medium | Requirements review is being performed. | Add success announcement. | 1. Review PLACE-019 and A11Y requirements. 2. Confirm whether successful add requires a dedicated live-region announcement. | General accessible status is tested; exact live-region success announcement is not executable until documented. | PLACE-019-US-010 | No | Manual | Manual Review cadence. |
| PLACE-019-US-010-TC-012 | Background is inert while add flow is open | Accessibility, Keyboard, Security | High | Add flow is rendered as modal dialog or sheet. | Background place detail content. | 1. Open Add To List flow. 2. Attempt keyboard, pointer, and screen-reader navigation to background page controls. | Background page controls are not reachable or actionable while the modal add flow is open; focus remains within the active modal surface. | PLACE-019-US-010 | Yes | Accessibility | Regression cadence. Source: A11Y-001-US-010. |
| PLACE-019-US-010-TC-013 | Long add flow content scrolls internally | Accessibility, Responsive | High | User owns enough lists for modal/sheet content to exceed viewport height. | 40 owned lists at `320x568`. | 1. Open Add To List flow. 2. Navigate to first and last list choice and final action. 3. Inspect page and modal scroll behavior. | Add flow content scrolls internally; close/cancel and confirm controls remain reachable; background page does not scroll behind the modal. | PLACE-019-US-010 | Yes | Accessibility | Regression cadence. Source: A11Y-001-US-011 and A11Y-001-US-012. |

## PLACE-019-US-011 - Mobile add-to-list UX

User Story Summary: As a mobile user, I want add-to-list usable in a compact sheet/dialog so that I can complete it one-handed.

Related Feature ID: `PLACE-019`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-019-US-011-TC-001 | Add flow fits at 320x568 | Responsive, Mobile | High | Authenticated user owns multiple lists. | Viewport `320x568`. | 1. Set viewport to `320x568`. 2. Open Add To List flow. 3. Inspect layout. | Title, choices, close/cancel, and confirm action are visible or reachable through internal flow scrolling; `document.documentElement.scrollWidth <= window.innerWidth`. | PLACE-019-US-011 | Yes | UI E2E | Smoke cadence. Source: RESP-002-US-001, RESP-002-US-002, RESP-002-US-011. |
| PLACE-019-US-011-TC-002 | Add flow fits at 390x844 | Responsive, Mobile | High | Authenticated user owns multiple lists. | Viewport `390x844`. | 1. Set viewport to `390x844`. 2. Open Add To List flow. 3. Inspect layout. | Add flow content and actions remain reachable; `document.documentElement.scrollWidth <= window.innerWidth`. | PLACE-019-US-011 | Yes | UI E2E | Regression cadence. |
| PLACE-019-US-011-TC-003 | Add flow fits at 430x932 | Responsive, Mobile | High | Authenticated user owns multiple lists. | Viewport `430x932`. | 1. Set viewport to `430x932`. 2. Open Add To List flow. 3. Inspect layout. | Add flow content and actions remain reachable; `document.documentElement.scrollWidth <= window.innerWidth`. | PLACE-019-US-011 | Yes | UI E2E | Regression cadence. |
| PLACE-019-US-011-TC-004 | Add flow supports phone landscape | Responsive, Mobile, Landscape | High | Authenticated user owns several lists. | Landscape viewport `844x390`. | 1. Set landscape viewport. 2. Open Add To List flow. 3. Inspect layout and controls. | Close/cancel, list choices, and confirm control are visible or reachable through internal flow scrolling; fixed navigation or sheet bounds do not obscure critical controls; `document.documentElement.scrollWidth <= window.innerWidth`. | PLACE-019-US-011 | Yes | UI E2E | Regression cadence. Source: RESP-002-US-012. |
| PLACE-019-US-011-TC-005 | Add flow supports 200% zoom | Responsive, Accessibility, Low Vision | High | Authenticated user owns at least one list. | Browser zoom `200%`. | 1. Set browser zoom to `200%`. 2. Open Add To List flow. 3. Navigate choices and confirm control. | List choices, confirm, retry if present, and close/cancel controls remain keyboard reachable; `document.documentElement.scrollWidth <= window.innerWidth`; every interactive control remains at least `44x44` CSS pixels. | PLACE-019-US-011 | Yes | Accessibility | Regression cadence. Source: RESP-003-US-001, RESP-003-US-008, and A11Y-001-US-019. |
| PLACE-019-US-011-TC-006 | Add flow respects safe areas and bottom navigation | Responsive, Mobile | High | Mobile viewport with fixed bottom navigation or safe-area inset. | `320x568` with safe-area simulation. | 1. Open Add To List flow. 2. Scroll to final action if needed. | Final action and close/cancel controls are not obscured by bottom navigation, browser UI, or safe-area padding. | PLACE-019-US-011 | Yes | UI E2E | Regression cadence. Source: RESP-001-US-011, RESP-001-US-012, RESP-002-US-005. |
| PLACE-019-US-011-TC-007 | Add flow controls meet touch target size | Accessibility, Mobile, Touch | High | Add flow is open on mobile. | Viewport `320x568`. | 1. Measure list choices, confirm, retry, and close/cancel hit areas. | Every interactive control has at least `44x44` CSS pixel hit area. | PLACE-019-US-011 | Yes | Accessibility | Regression cadence. Source: RESP-003-US-008 and global touch-target baseline. |
| PLACE-019-US-011-TC-008 | Long list names fit in add flow | Responsive, Arabic, RTL | High | User owns Arabic, English, and mixed-language long list names. | `أفضل أماكن القهوة المختصة`, `Best Late Night Dessert Spots`, `Riyadh قهوة 2026`. | 1. Open Add To List flow at `320x568`. 2. Inspect list choices. | Long Arabic, English, and mixed names wrap or clamp without overlapping actions and without horizontal overflow. | PLACE-019-US-011 | Yes | UI E2E | Regression cadence. Source: RESP-002-US-016, RESP-002-US-017, RESP-002-US-018. |
| PLACE-019-US-011-TC-009 | Virtual keyboard behavior requires clarification | Requirement Clarification, Manual | Medium | Requirements review is being performed. | Add flow with optional search not currently documented. | 1. Review PLACE-019 and responsive requirements. 2. Confirm whether Add To List includes a text input that can trigger virtual keyboard. | No executable virtual-keyboard assertion is made for PLACE-019 until an add-flow text input is documented. | PLACE-019-US-011 | No | Manual | Manual Review cadence. |
| PLACE-019-US-011-TC-010 | Add flow remains distinguishable in forced-colors mode | Accessibility, Responsive | Medium | Add flow is open; forced-colors/high-contrast mode is active. | One selected list choice and one unselected list choice. | 1. Enable forced-colors mode. 2. Open Add To List flow. 3. Inspect text, focus indicators, selected state, and action controls. | Text, selected list state, focus indicators, confirm, retry if present, and close/cancel controls remain distinguishable without color-only meaning. | PLACE-019-US-011 | Yes | Accessibility | Regression cadence. Source: RESP-003 forced-colors baseline. |
| PLACE-019-US-011-TC-011 | Add flow honors reduced motion | Accessibility, Responsive | Medium | Add flow has opening, loading, or row transitions; reduced-motion preference is active. | `prefers-reduced-motion: reduce`. | 1. Enable reduced motion. 2. Open Add To List flow. 3. Trigger loading and error states. | Nonessential sheet, row, loading, and status animations are removed or minimized; all controls remain reachable. | PLACE-019-US-011 | Yes | Accessibility | Regression cadence. Source: RESP-003-US-017. |

## Final Summary

1. User stories processed: 11
2. Total executable test cases: 74
3. Clarification / Manual / Traceability cases: 11
4. Test count per user story:
   - `PLACE-019-US-001`: 6
   - `PLACE-019-US-002`: 8
   - `PLACE-019-US-003`: 10
   - `PLACE-019-US-004`: 4
   - `PLACE-019-US-005`: 5
   - `PLACE-019-US-006`: 6
   - `PLACE-019-US-007`: 9
   - `PLACE-019-US-008`: 5
   - `PLACE-019-US-009`: 8
   - `PLACE-019-US-010`: 13
   - `PLACE-019-US-011`: 11
5. Count by test type:
   - API: 18
   - API Integration: 1
   - UI: 28
   - UX: 2
   - Accessibility: 18
   - Responsive: 10
   - Security: 12
   - Privacy: 9
   - Integration: 9
   - Data Integrity: 13
   - Error Handling: 5
   - Loading: 5
   - Validation: 3
   - Regression: 9
   - Contract: 5
   - Authentication: 2
   - Boundary: 1
   - Concurrency: 1
   - Empty State: 2
   - Feature Ownership: 2
   - Keyboard: 7
   - Landscape: 1
   - Low Vision: 1
   - Mobile: 6
   - Negative: 7
   - Positive: 11
   - Routing: 1
   - Screen Reader: 1
   - Semantics: 1
   - Touch: 1
   - Arabic: 1
   - RTL: 1
   - Requirement Clarification: 8
   - Traceability Verification: 3
   - Manual: 11
6. Count by priority:
   - Critical: 17
   - High: 47
   - Medium: 19
   - Low: 2
7. Count by automation layer:
   - API: 17
   - UI E2E: 31
   - Accessibility: 18
   - Security: 8
   - Manual: 11
8. Top automation candidates:
   - `PLACE-019-US-003-TC-001` - Add current place to one selected owned list
   - `PLACE-019-US-003-TC-007` - New membership success response schema is deterministic
   - `PLACE-019-US-003-TC-008` - New membership success response excludes forbidden fields
   - `PLACE-019-US-003-TC-009` - Add after removal restores one membership
   - `PLACE-019-US-005-TC-001` - Duplicate add creates no second membership row
   - `PLACE-019-US-005-TC-003` - Concurrent duplicate add creates one membership
   - `PLACE-019-US-007-TC-001` - Guest cannot add place to list
   - `PLACE-019-US-007-TC-007` - Guest auth resolution does not expose owned-list names
   - `PLACE-019-US-007-TC-004` - Direct API add to non-owned list is denied before idempotency
   - `PLACE-019-US-010-TC-003` - Keyboard can select list and confirm add
   - `PLACE-019-US-011-TC-001` - Add flow fits at 320x568

## Validation

- Duplicate Test IDs = 0
- Invalid Story References = 0
- Missing User Stories = 0
- Encoding/Mojibake = 0
- API Tests Missing Status Codes = 0
- Requirement Fidelity Violations = 0
- Feature Ownership Violations = 0
