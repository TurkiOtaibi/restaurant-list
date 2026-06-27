# PLACE-018 Test Cases

Feature: `PLACE-018 - Show lists containing this place`

Source: `docs/user-stories/PLACE_DETAILS_USER_STORIES.md`

Supporting Sources:

- `docs/feature-map/FEATURE_TRACEABILITY.md`
- `docs/user-stories/LISTS_USER_STORIES.md`
- `docs/user-stories/PUBLIC_LISTS_USER_STORIES.md`
- `docs/user-stories/RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`

Scope: All user stories under `PLACE-018`.

## QA Execution Standards

- Test cases validate documented requirements only. Undefined containing-list behavior must be captured as Requirement Clarification, Manual Verification, or Traceability Verification.
- `PLACE-018` owns only displaying the current user's owned lists that contain the current place, visibility according to documented rules, rendering list information, and navigation from place detail to an owned list.
- `PLACE-018` does not own list creation, list editing, list deletion, visibility management, add-to-list mutation mechanics, remove-from-list mutation mechanics, or public-list browsing.
- Mutation setup may use `LIST-*` and `PLACE-019` behavior as preconditions, but executable `PLACE-018` assertions must verify only post-refresh place-detail list context.
- Primary route: `/places/{id}`.
- Related owned-list destination route: `/lists/{id}`.
- Backend endpoint from traceability: `GET /api/v1/places/{id}` with Bearer authentication for place detail/current-user context.
- Related endpoint from traceability: `GET /api/v1/lists` with Bearer authentication where owned-list context is needed by Place Detail.
- PLACE-018 API contract tests use `containingLists: Array<{ id, name }>` as the required current-user containing-list context inside the place-detail response. If the API contract uses a different field name, the requirements must be updated before execution.
- `containingLists` is an empty array when the current user has no owned lists containing the place.
- `containingLists[].id` is the owned-list route target for `/lists/{id}`; `containingLists[].name` is the visible list label.
- PLACE-018 does not require list visibility, owner identity, place count, public-route metadata, or mutation controls in containing-list context.
- Owned list context must not expose another user's private list names, public list names, owner identity, private notes, tokens, cookies, debug fields, audit fields, or internal moderation fields.
- Duplicate list names are allowed by `LIST-011`; executable PLACE-018 tests must verify duplicate names are not collapsed into one visible/navigation target.
- Empty containing-list state is documented as hidden section, not an empty-state message.
- The Arabic section label must render as valid Arabic text such as `موجود في` or an equivalent localized label with no mojibake.
- Executable responsive tests cite `RESP-001-US-011`, `RESP-001-US-012`, `RESP-002-US-001`, `RESP-002-US-002`, `RESP-002-US-005`, `RESP-002-US-012`, `RESP-002-US-016`, `RESP-002-US-017`, `RESP-002-US-018`, and `RESP-003-US-001` where applicable.
- Executable accessibility tests cite the global accessibility baseline, `RESP-003-US-008` touch-target requirements, and PLACE-018-US-008 where applicable.
- Automation cadence values used in Notes: Smoke, Regression, Nightly, Manual Review.

## PLACE-018-US-001 - Show containing lists

User Story Summary: As a user, I want to see which of my lists contain this place so that I understand my saved context.

Related Feature ID: `PLACE-018`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-018-US-001-TC-001 | Show one owned private containing list | UI, Positive, Regression | High | Authenticated user owns private list `Riyadh Burgers`; place `p_burger_001` belongs to that list. | `/places/p_burger_001`; list name `Riyadh Burgers`. | 1. Sign in as the list owner. 2. Open `/places/p_burger_001`. 3. Wait for detail content to finish loading. | The containing-lists section is visible; it has a label equivalent to `موجود في`; `Riyadh Burgers` is visible exactly as an owned containing list name. | PLACE-018-US-001 | Yes | UI E2E | Smoke cadence. |
| PLACE-018-US-001-TC-002 | Show one owned public containing list through owned context | UI, Positive, Regression | High | Authenticated user owns public list `Coffee Walk`; place `p_cafe_001` belongs to that list. | `/places/p_cafe_001`; list visibility `public`. | 1. Sign in as owner. 2. Open `/places/p_cafe_001`. 3. Inspect the containing-lists section. | `Coffee Walk` is visible as current-user owned context; no public-list owner metadata or public browsing controls appear in this section. | PLACE-018-US-001 | Yes | UI E2E | Regression cadence. |
| PLACE-018-US-001-TC-003 | Place detail API returns current-user containing list context | API, Contract, Positive | Critical | Authenticated user owns list `Weekend Picks`; place `p_place_001` belongs to that list. | `GET /api/v1/places/p_place_001` with Bearer token. | 1. Send authenticated request. 2. Inspect status and response body. | Response status is `200 OK`; response includes `containingLists`; `containingLists` contains one item with `id` equal to the owned list ID and `name` equal to `Weekend Picks`. | PLACE-018-US-001 | Yes | API | Smoke cadence. Source: FEATURE_TRACEABILITY `GET /api/v1/places/{id}` current-user context. |
| PLACE-018-US-001-TC-004 | Place detail containing-list fields are minimal and safe | API, Contract, Privacy | High | Authenticated user owns one list containing the place. | `GET /api/v1/places/{id}`. | 1. Send authenticated request. 2. Inspect `containingLists` and full response JSON. | Response status is `200 OK`; each `containingLists` item includes exactly display/navigation fields `id` and `name`; response contains no owner email, internal owner id, `ownerDisplayName`, `visibility`, `placeCount`, tokens, cookies, password fields, private notes, private membership records, audit fields, debug fields, or internal moderation fields. | PLACE-018-US-001 | Yes | API | Regression cadence. |
| PLACE-018-US-001-TC-005 | Containing list name opens owned list detail | UI, Navigation, Integration | High | Authenticated user owns list `Date Night`; place `p_place_002` belongs to that list. | `/places/p_place_002`; list route `/lists/list_date_night`. | 1. Open place detail. 2. Activate `Date Night` in the containing-lists section. | The app opens `/lists/list_date_night`; destination is the owned-list route, not `/lists/public/{id}`. | PLACE-018-US-001 | Yes | UI E2E | Regression cadence. Navigation from place to list is in PLACE-018 scope; owned list detail behavior is LIST-007 scope. |
| PLACE-018-US-001-TC-006 | Containing list section does not expose unsupported inline actions | UI, Negative, Feature Ownership | Medium | Authenticated user owns a list containing the place. | `/places/{id}`. | 1. Open place detail. 2. Inspect controls inside the containing-lists section. | The containing-lists section shows list context/navigation only; it does not expose create, rename, delete, visibility-change, add-place, or remove-place controls inside this section. | PLACE-018-US-001 | Yes | UI E2E | Regression cadence. Prevents ownership drift into LIST-* features. |
| PLACE-018-US-001-TC-007 | Containing-list label has valid Arabic text | Localization, Arabic, UI | Medium | Authenticated user owns a list containing the place. | Expected label `موجود في` or equivalent. | 1. Open place detail. 2. Inspect the containing-lists section label. | The label is valid Arabic or approved localized equivalent; it contains no mojibake sequences such as `ظ` or `ط` corruption. | PLACE-018-US-001 | Yes | UI E2E | Regression cadence. |
| PLACE-018-US-001-TC-008 | Place-detail list context traceability review | Traceability Verification, Manual | Medium | QA traceability review is being performed. | `PLACE-018`, `GET /api/v1/places/{id}`, `GET /api/v1/lists`. | 1. Review `FEATURE_TRACEABILITY.md`. 2. Confirm Place Detail consumes current-user context and owned-list evidence. | Traceability links Place Detail to `GET /api/v1/places/{id}` and owned-list context evidence without assigning list mutation behavior to PLACE-018. | PLACE-018-US-001 | No | Manual | Manual Review cadence. |
| PLACE-018-US-001-TC-009 | Containing-list route target uses list ID | UI, Navigation, Data Integrity | High | Authenticated user owns list `Same Name` with ID `list_001`; another owned list has a different ID. | `/places/{id}` with `containingLists[0].id=list_001`. | 1. Open place detail. 2. Activate the containing-list target for `Same Name`. 3. Inspect destination URL. | The app opens `/lists/list_001`; navigation is based on list ID, not list name or display order. | PLACE-018-US-001 | Yes | UI E2E | Regression cadence. |
| PLACE-018-US-001-TC-010 | Browser back and forward containing-list behavior requires clarification | Requirement Clarification, Manual | Medium | Requirements review is being performed. | `/places/{id}` and `/lists/{id}`. | 1. Review PLACE-018 and global navigation requirements. 2. Confirm whether browser Back/Forward from owned list detail must restore the same containing-list section state. | No executable assertion is made for browser Back/Forward restored containing-list state until documented. | PLACE-018-US-001 | No | Manual | Manual Review cadence. |
| PLACE-018-US-001-TC-011 | Place detail response envelope includes containing-list context | API, Contract | Critical | Authenticated user owns one list containing place `p_envelope_001`. | `GET /api/v1/places/p_envelope_001` with Bearer token. | 1. Send authenticated request. 2. Inspect top-level response structure. | Response status is `200 OK`; response contains one place-detail resource envelope with `containingLists` as an array on that resource; response does not return containing-list context as a separate unrelated top-level collection. | PLACE-018-US-001 | Yes | API | Smoke cadence. |

## PLACE-018-US-002 - Hide containing-lists section when empty

User Story Summary: As a user, I do not want empty personal-context sections so that detail stays concise.

Related Feature ID: `PLACE-018`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-018-US-002-TC-001 | Hide section when place is in no owned lists | UI, Positive, Empty State | Medium | Authenticated user owns no list containing place `p_unlisted_001`. | `/places/p_unlisted_001`. | 1. Sign in. 2. Open `/places/p_unlisted_001`. 3. Wait for detail content. | The containing-lists section is not rendered; no empty placeholder for this section appears. | PLACE-018-US-002 | Yes | UI E2E | Smoke cadence. |
| PLACE-018-US-002-TC-002 | Hide section when API returns empty containing-list context | UI, API Integration, Empty State | Critical | Authenticated detail response for `p_unlisted_002` has no current-user containing lists. | `GET /api/v1/places/p_unlisted_002` returns `200 OK` with `containingLists: []`. | 1. Load place detail. 2. Inspect rendered personal-context sections. | API response status is `200 OK`; `containingLists` is an empty array; the containing-lists section is hidden after loading completes. | PLACE-018-US-002 | Yes | UI E2E | Regression cadence. |
| PLACE-018-US-002-TC-003 | Empty state does not show fake list data | UI, Negative, Privacy | Medium | Authenticated user owns no containing lists for the place. | `/places/{id}` with zero containing lists. | 1. Open detail. 2. Search visible text for list-like placeholders. | No fake list names, sample list names, other-user list names, or stale previous list names appear. | PLACE-018-US-002 | Yes | UI E2E | Regression cadence. |
| PLACE-018-US-002-TC-004 | Empty copy for containing-list section requires clarification | Requirement Clarification, Manual | Low | Requirements review is being performed. | PLACE-018-US-002. | 1. Review PLACE-018 empty-state requirement. 2. Confirm whether product wants hidden section only or visible empty copy in the future. | Current executable expectation remains hidden section only; visible empty copy is not asserted until documented. | PLACE-018-US-002 | No | Manual | Manual Review cadence. |
| PLACE-018-US-002-TC-005 | Place-detail loading and error ownership traceability | Traceability Verification, Manual | Medium | QA traceability review is being performed. | PLACE-017 loading/error stories; PLACE-018 empty section story. | 1. Review Place Detail stories. 2. Confirm generic loading/error states are owned by PLACE-017. | PLACE-018 tests do not duplicate generic place-detail loading or error behavior except where it affects containing-list rendering after successful detail load. | PLACE-018-US-002 | No | Manual | Manual Review cadence. |
| PLACE-018-US-002-TC-006 | Empty API containing-list contract | API, Contract, Empty State | High | Authenticated user owns no list containing place `p_unlisted_003`. | `GET /api/v1/places/p_unlisted_003` with Bearer token. | 1. Send authenticated request. 2. Inspect response body. | Response status is `200 OK`; response includes `containingLists: []`; response does not omit `containingLists` and does not return `null` for the collection. | PLACE-018-US-002 | Yes | API | Regression cadence. |

## PLACE-018-US-003 - Show multiple list names

User Story Summary: As a user, I want all relevant containing lists shown so that I know every collection using the place.

Related Feature ID: `PLACE-018`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-018-US-003-TC-001 | Show all returned owned containing lists | UI, Positive | Medium | Authenticated user owns lists `Lunch`, `Favorites`, and `Try Again`; place `p_multi_001` belongs to all three. | `/places/p_multi_001`; `containingLists` includes exactly those three IDs and names. | 1. Open place detail. 2. Inspect containing-lists section. | The section exposes `Lunch`, `Favorites`, and `Try Again` as three distinct containing-list entries or three distinct entries inside the documented summary control. | PLACE-018-US-003 | Yes | UI E2E | Regression cadence. |
| PLACE-018-US-003-TC-002 | Multiple list names are represented in the accessibility tree | Accessibility, Screen Reader, UI | Medium | Authenticated user owns at least two containing lists. | Lists `قهوة الرياض` and `Weekend Coffee`. | 1. Open place detail. 2. Inspect the accessibility tree for the containing-lists section. | Assistive technology can identify the section label and each returned list name, or can identify an accessible summary that exposes each returned list name. | PLACE-018-US-003 | Yes | Accessibility | Regression cadence. |
| PLACE-018-US-003-TC-003 | Duplicate owned list names are not collapsed | Integration, Data Integrity, UI | High | Authenticated user owns two different lists named `برجر`; both contain the same place; list IDs differ. | `list_a.name=برجر`, `list_b.name=برجر`. | 1. Open place detail. 2. Inspect containing-list entries. 3. Activate each duplicate entry if both are exposed as links. | Both owned lists are represented as separate containing-list targets; activating each target opens its own `/lists/{id}` route. | PLACE-018-US-003 | Yes | UI E2E | Regression cadence. Source: LIST-011 duplicate names allowed; list identity is ID. |
| PLACE-018-US-003-TC-004 | Containing-list ordering requires clarification | Requirement Clarification, Manual | Medium | Requirements review is being performed. | Multiple containing lists with different created/updated dates. | 1. Review PLACE-018 and LIST ordering requirements. 2. Confirm whether containing-list display order is defined. | No executable assertion is made for containing-list ordering until documented for PLACE-018 or inherited explicitly. | PLACE-018-US-003 | No | Manual | Manual Review cadence. |
| PLACE-018-US-003-TC-005 | Renamed containing list is reflected after detail refresh | Integration, Regression | High | Authenticated user owns list `Old Name` containing the place; rename mechanics are validated under LIST-004. | Rename result `New Name`. | 1. Complete or seed a successful LIST-004 rename from `Old Name` to `New Name`. 2. Refresh place detail. 3. Inspect containing-lists section. | `New Name` appears in the containing-lists section; `Old Name` does not appear after refresh completes. | PLACE-018-US-003 | Yes | UI E2E | Regression cadence. Tests PLACE-018 display refresh only; rename mutation remains LIST-004 scope. |
| PLACE-018-US-003-TC-006 | Deleted containing list is absent after detail refresh | Integration, Regression | High | Authenticated user owns list `Temporary List` containing the place; delete mechanics are validated under LIST-006. | Deleted list ID `list_temp`. | 1. Complete or seed a successful LIST-006 delete for `list_temp`. 2. Refresh place detail. 3. Inspect containing-lists section. | `Temporary List` is absent from containing-lists context after refresh completes. | PLACE-018-US-003 | Yes | UI E2E | Regression cadence. Deletion mechanics remain LIST-006 scope. |
| PLACE-018-US-003-TC-007 | Summary threshold for many containing lists requires clarification | Requirement Clarification, Manual | Medium | Requirements review is being performed. | Place contained in more than five owned lists. | 1. Review PLACE-018 requirement for "displayed or summarized clearly." 2. Confirm threshold and expansion behavior if summarization is required. | No executable threshold assertion is made until Product defines the many-list summarization contract. | PLACE-018-US-003 | No | Manual | Manual Review cadence. |

## PLACE-018-US-004 - Preserve list privacy

User Story Summary: As the system, I want only the current user's list memberships shown so that other users' private lists are not exposed.

Related Feature ID: `PLACE-018`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-018-US-004-TC-001 | Other user's private containing list is hidden | Security, Privacy, UI | Critical | User A owns private list `A Private Picks` containing place `p_shared_001`; User B is authenticated. | User B opens `/places/p_shared_001`. | 1. Sign in as User B. 2. Open place detail for `p_shared_001`. 3. Inspect visible and accessible text. | `A Private Picks` is not visible and is not present in the accessibility tree for User B. | PLACE-018-US-004 | Yes | Security | Smoke cadence. |
| PLACE-018-US-004-TC-002 | Other user's public containing list is hidden from owned context | Security, Privacy, UI | Critical | User A owns public list `A Public Picks` containing the place; User B does not own that list. | User B opens `/places/{id}`. | 1. Sign in as User B. 2. Open place detail. 3. Inspect containing-lists section. | `A Public Picks` is not shown in PLACE-018 owned-list context; public-list discovery remains PUBLIC-* scope. | PLACE-018-US-004 | Yes | Security | Regression cadence. |
| PLACE-018-US-004-TC-003 | API excludes other-user list memberships | API, Privacy, Security | Critical | Another user owns private and public lists containing the place; current user owns no list containing it. | `GET /api/v1/places/{id}` as current user. | 1. Send authenticated request. 2. Inspect full response JSON. | Response status is `200 OK`; response contains no other-user list IDs, list names, owner names, owner display names, visibility values, place counts, or membership records. | PLACE-018-US-004 | Yes | API | Smoke cadence. |
| PLACE-018-US-004-TC-004 | Guest place detail request returns no list membership data | API, Authentication, Privacy | Critical | Place exists and appears in at least one list. | Unauthenticated `GET /api/v1/places/{id}`. | 1. Send request without Bearer token. 2. Inspect status and body. | Response status is `401 Unauthorized`; response contains no place data, containing-list data, private list names, or ownership metadata. | PLACE-018-US-004 | Yes | API | Smoke cadence. |
| PLACE-018-US-004-TC-005 | Expired session returns no list membership data | API, Authentication, Privacy | Critical | Expired/invalid Bearer token is available; place exists in lists. | `GET /api/v1/places/{id}` with expired token. | 1. Send request with expired token. 2. Inspect status and body. | Response status is `401 Unauthorized`; response contains no containing-list data and no private context. | PLACE-018-US-004 | Yes | API | Regression cadence. |
| PLACE-018-US-004-TC-006 | Not-found place response leaks no list context | API, Error Handling, Privacy | High | Authenticated user exists; place ID does not exist. | `GET /api/v1/places/p_missing_404`. | 1. Send authenticated request. 2. Inspect status and body. | Response status is `404 Not Found`; body contains `detail`; body contains no `containingLists`, list names, list IDs, owner metadata, private notes, stack traces, or debug fields. | PLACE-018-US-004 | Yes | API | Regression cadence. |
| PLACE-018-US-004-TC-007 | Public-list browsing privacy is not duplicated in PLACE-018 | Traceability Verification, Manual | Medium | QA traceability review is being performed. | PUBLIC-001 through PUBLIC-004. | 1. Review Public Lists requirements. 2. Confirm public browsing and public detail tests remain under PUBLIC-* test packages. | PLACE-018 privacy tests cover owned current-user context only and do not duplicate public-list browsing behavior. | PLACE-018-US-004 | No | Manual | Manual Review cadence. |
| PLACE-018-US-004-TC-008 | Containing-list UI exposes no creator identity | Privacy, UI, Negative | High | Authenticated user owns a list containing the place. | List has owner profile/display name data in database. | 1. Open place detail. 2. Inspect containing-lists section. | The section displays list context without creator identity, owner email, internal owner ID, or account metadata. | PLACE-018-US-004 | Yes | Security | Regression cadence. |
| PLACE-018-US-004-TC-009 | Containing-list context exposes no private notes | Privacy, Security, Regression | High | Place has private rating notes from current user and another user; place belongs to one owned list. | `/places/{id}`. | 1. Open place detail as current user. 2. Inspect rendered containing-list section and place-detail response. | No private note content appears in containing-list UI, response fields, error fields, or accessible names. | PLACE-018-US-004 | Yes | Security | Regression cadence. |
| PLACE-018-US-004-TC-010 | Guest UI does not flash protected containing-list context | UI, Security, Privacy, Authentication | Critical | No valid session exists; place belongs to private and public lists. | Direct URL `/places/p_private_context`. | 1. Open the direct place URL as a guest with network throttling enabled. 2. Observe DOM text and accessibility tree from initial render through denial state. | Before and after auth resolution, no place data, list names, `containingLists` content, private membership data, or owner metadata is rendered in the DOM or accessibility tree; guest denial state is shown instead. | PLACE-018-US-004 | Yes | Security | Smoke cadence. |
| PLACE-018-US-004-TC-011 | Expired-session UI clears protected containing-list context | UI, Security, Privacy, Authentication | Critical | User previously viewed a place with containing-list context; session is expired before refresh or revalidation. | `/places/{id}` with previously visible list `Session List`. | 1. Load detail while authenticated. 2. Expire the session. 3. Refresh or force place-detail revalidation. 4. Inspect DOM and accessibility tree. | After the expired-session response, protected place detail and `Session List` containing-list context are not rendered; the UI transitions to the documented auth-denial state without private-data flash. | PLACE-018-US-004 | Yes | Security | Regression cadence. |
| PLACE-018-US-004-TC-012 | 401 error schema is deterministic and private-safe | API, Contract, Security | High | No valid session exists. | Unauthenticated `GET /api/v1/places/{id}`. | 1. Send unauthenticated request. 2. Inspect response body keys and values. | Response status is `401 Unauthorized`; body contains `detail`; body contains no `containingLists`, place data, list IDs, list names, private notes, tokens, cookies, stack traces, or debug fields. | PLACE-018-US-004 | Yes | API | Regression cadence. |
| PLACE-018-US-004-TC-013 | Refresh and restored-history containing-list behavior requires clarification | Requirement Clarification, Manual | Medium | Requirements review is being performed. | Browser refresh/restored history for `/places/{id}`. | 1. Review PLACE-018, PLACE-017, and global navigation requirements. 2. Confirm whether refresh/restored-history must preserve, re-fetch, or clear containing-list context. | No executable assertion is made for refresh/restored-history containing-list behavior beyond documented auth/privacy and post-refresh add/remove requirements. | PLACE-018-US-004 | No | Manual | Manual Review cadence. |

## PLACE-018-US-005 - Update after add to list

User Story Summary: As a user, I want containing lists to update after adding a place so that the detail page reflects the latest state.

Related Feature ID: `PLACE-018`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-018-US-005-TC-001 | Newly added list appears after detail refresh | Integration, Positive, Regression | High | Authenticated user owns list `To Try`; place is not initially in that list; add mechanics are validated under PLACE-019/LIST-008. | Place `p_add_001`; list `To Try`. | 1. Add `p_add_001` to `To Try` through the documented add flow or seeded API state. 2. Refresh `/places/p_add_001`. 3. Inspect containing-lists section. | `To Try` appears in the containing-lists section after detail refresh completes. | PLACE-018-US-005 | Yes | UI E2E | Regression cadence. |
| PLACE-018-US-005-TC-002 | Added target list appears without adding unrelated lists | Integration, Data Integrity | High | User owns lists `A` and `B`; place is added only to list `A`. | Place `p_add_002`; lists `A`, `B`. | 1. Seed or complete successful add of place to list `A` only. 2. Refresh detail. 3. Inspect containing-lists section. | List `A` appears; list `B` does not appear unless it also contains the place. | PLACE-018-US-005 | Yes | UI E2E | Regression cadence. |
| PLACE-018-US-005-TC-003 | Idempotent duplicate add does not duplicate containing-list entry | Integration, Data Integrity | High | Place already belongs to owned list `Favorites`; LIST-009 idempotency is available. | Repeated add to same `(list_id, place_id)`. | 1. Trigger or seed a duplicate add for the same list and place. 2. Refresh place detail. 3. Count `Favorites` entries in containing-lists section. | `Favorites` appears once in the containing-lists section. | PLACE-018-US-005 | Yes | UI E2E | Regression cadence. |
| PLACE-018-US-005-TC-004 | Detail refresh clears stale no-list state after add | Integration, Regression | High | Place detail was previously loaded with no containing lists; add succeeds in another tab/session. | Place `p_add_003`; list `New Picks`. | 1. Load place detail and confirm containing-lists section is hidden. 2. Add the place to `New Picks` in another authenticated context. 3. Refresh the original detail page. | The containing-lists section becomes visible and shows `New Picks`; the stale hidden state is not retained after refresh. | PLACE-018-US-005 | Yes | UI E2E | Regression cadence. |
| PLACE-018-US-005-TC-005 | Add-to-list mutation mechanics remain outside PLACE-018 | Traceability Verification, Manual | Medium | QA traceability review is being performed. | PLACE-019, LIST-008, LIST-009. | 1. Review add-to-list ownership requirements. 2. Confirm tests for selecting a list, duplicate add API status, and add errors are not owned by PLACE-018. | PLACE-018 only verifies post-refresh containing-list display after add; mutation mechanics remain traceable to PLACE-019/LIST-008/LIST-009. | PLACE-018-US-005 | No | Manual | Manual Review cadence. |
| PLACE-018-US-005-TC-006 | Add failure display behavior belongs to add flow | Traceability Verification, Manual | Medium | Requirements review is being performed. | PLACE-019-US-009, LIST-008-US-016. | 1. Review add-flow failure requirements. 2. Confirm PLACE-018 does not define add failure UI. | Failed add request behavior is tested under add-flow/list modules; PLACE-018 does not assert containing-list update unless add succeeds and detail refreshes. | PLACE-018-US-005 | No | Manual | Manual Review cadence. |

## PLACE-018-US-006 - Update after remove from list

User Story Summary: As a user, I want containing lists to update after removal so that stale memberships are not shown.

Related Feature ID: `PLACE-018`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-018-US-006-TC-001 | Removed list disappears after detail refresh | Integration, Positive, Regression | High | Authenticated user owns list `Remove Me`; place belongs to that list; remove mechanics are validated under LIST-010. | Place `p_remove_001`; list `Remove Me`. | 1. Remove `p_remove_001` from `Remove Me` through documented remove flow or seeded API state. 2. Refresh place detail. 3. Inspect containing-lists section. | `Remove Me` no longer appears after detail refresh completes. | PLACE-018-US-006 | Yes | UI E2E | Regression cadence. |
| PLACE-018-US-006-TC-002 | Removing from one list leaves other containing lists visible | Integration, Data Integrity | High | Place belongs to owned lists `Keep` and `Remove`; removal succeeds only for `Remove`. | Place `p_remove_002`. | 1. Remove the place from `Remove`. 2. Refresh place detail. 3. Inspect containing-lists section. | `Remove` is absent; `Keep` remains visible. | PLACE-018-US-006 | Yes | UI E2E | Regression cadence. |
| PLACE-018-US-006-TC-003 | Last removal hides containing-list section | UI, Integration, Empty State | High | Place belongs to exactly one owned list. | Place `p_remove_last`; list `Only List`. | 1. Remove the place from `Only List`. 2. Refresh detail. 3. Inspect personal-context area. | The containing-lists section is hidden because no owned list contains the place. | PLACE-018-US-006 | Yes | UI E2E | Regression cadence. |
| PLACE-018-US-006-TC-004 | Removal failure behavior remains LIST-010 scope | Traceability Verification, Manual | Medium | QA traceability review is being performed. | LIST-010-US-010. | 1. Review remove-place failure requirements. 2. Confirm failure/optimistic restore behavior is covered by LIST-010. | PLACE-018 does not assert removal failure UI; it verifies display only after successful removal and detail refresh. | PLACE-018-US-006 | No | Manual | Manual Review cadence. |
| PLACE-018-US-006-TC-005 | Undo removal behavior remains LIST-010 scope | Traceability Verification, Manual | Medium | QA traceability review is being performed. | LIST-010-US-011 through LIST-010-US-013. | 1. Review undo requirements. 2. Confirm undo toast, expiry, and undo failure are LIST-010 tests. | PLACE-018 does not duplicate undo mechanics; it may verify containing-list state after final refreshed membership state. | PLACE-018-US-006 | No | Manual | Manual Review cadence. |
| PLACE-018-US-006-TC-006 | Deleted containing list disappears after detail refresh | Integration, Regression | High | Authenticated user owns list `Deleted Collection` containing the place; list delete mechanics are validated under LIST-006. | Deleted list ID `list_deleted_collection`. | 1. Complete or seed successful deletion of the containing list. 2. Refresh place detail. 3. Inspect containing-lists section. | `Deleted Collection` no longer appears; no stale deleted-list navigation target remains. | PLACE-018-US-006 | Yes | UI E2E | Regression cadence. |

## PLACE-018-US-007 - Long list names fit

User Story Summary: As a mobile user, I want long list names to fit so that saved context remains readable.

Related Feature ID: `PLACE-018`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-018-US-007-TC-001 | Long Arabic list name fits at 320px | Responsive, Mobile, Arabic | High | Authenticated user owns a containing list with a long Arabic name. | `أفضل أماكن القهوة المختصة في شمال الرياض للعائلة والأصدقاء`. | 1. Set viewport width to `320px`. 2. Open place detail. 3. Inspect containing-lists section. | The Arabic list name wraps or clamps within the viewport; there is no horizontal overflow. | PLACE-018-US-007 | Yes | UI E2E | Regression cadence. |
| PLACE-018-US-007-TC-002 | Long English list name fits at 390px | Responsive, Mobile | High | Authenticated user owns a containing list with a long English name. | `Best Late Night Coffee and Dessert Spots Around Riyadh`. | 1. Set viewport width to `390px`. 2. Open place detail. 3. Inspect containing-lists section. | The English list name wraps or clamps within the viewport; there is no horizontal overflow. | PLACE-018-US-007 | Yes | UI E2E | Regression cadence. |
| PLACE-018-US-007-TC-003 | Mixed Arabic and English list name is bidi-safe | Responsive, RTL, Localization | High | Authenticated user owns a containing list with mixed-language name. | `Riyadh قهوة Specialty 2026`. | 1. Set mobile viewport. 2. Open place detail. 3. Inspect text direction and containment. | Mixed-language text remains contained in the section; Arabic and English fragments do not collide, reorder into unrelated controls, or render offscreen. | PLACE-018-US-007 | Yes | UI E2E | Regression cadence. |
| PLACE-018-US-007-TC-004 | Duplicate long names do not overlap | Responsive, UI, Regression | Medium | Authenticated user owns two containing lists with the same long name and different IDs. | Two long duplicate list names. | 1. Open place detail on a mobile viewport. 2. Inspect containing-list entries. | Both duplicate-name entries remain readable or accessible as separate entries; text does not overlap adjacent entries or controls. | PLACE-018-US-007 | Yes | UI E2E | Regression cadence. |
| PLACE-018-US-007-TC-005 | Containing-list section fits at 200% zoom | Responsive, Accessibility, Low Vision | High | Authenticated user owns at least one containing list with long name. | Browser zoom `200%`. | 1. Set browser zoom to `200%`. 2. Open place detail. 3. Inspect containing-lists section. | Section label and list name remain readable and reachable without horizontal scrolling. | PLACE-018-US-007 | Yes | Accessibility | Regression cadence. |
| PLACE-018-US-007-TC-006 | Bottom navigation and safe areas do not hide containing lists | Responsive, Mobile, UI | High | Mobile viewport with fixed bottom navigation; authenticated user owns multiple containing lists. | 320px and 430px viewports. | 1. Open place detail at `320px`. 2. Scroll to containing-lists section if needed. 3. Repeat at `430px`. | All containing-list entries can be reached; final visible entry is not covered by bottom navigation or safe-area inset. | PLACE-018-US-007 | Yes | UI E2E | Regression cadence. |
| PLACE-018-US-007-TC-007 | Containing-list section fits at 430px | Responsive, Mobile | High | Authenticated user owns containing lists with Arabic, English, and mixed-language names. | Viewport `430x932`. | 1. Set viewport to `430x932`. 2. Open place detail. 3. Inspect containing-lists section and page width. | Every containing-list entry remains contained; `document.documentElement.scrollWidth <= window.innerWidth`. | PLACE-018-US-007 | Yes | UI E2E | Regression cadence. Source: RESP-002-US-001 and RESP-002-US-002. |
| PLACE-018-US-007-TC-008 | Containing-list section fits in phone landscape | Responsive, Mobile, Landscape | High | Authenticated user owns a containing list with a long mixed-language name. | Landscape phone viewport such as `844x390`. | 1. Set phone landscape viewport. 2. Open place detail. 3. Inspect containing-lists section and page width. | The containing-list section remains usable; no list entry overlaps adjacent content; `document.documentElement.scrollWidth <= window.innerWidth`. | PLACE-018-US-007 | Yes | UI E2E | Regression cadence. Source: RESP-002-US-012. |
| PLACE-018-US-007-TC-009 | No horizontal overflow assertion for containing-list section | Responsive, Regression | Critical | Authenticated user owns multiple containing lists with long Arabic, English, and mixed names. | Viewports `320x568`, `390x844`, `430x932`, `768x1024`, `1024x768`, `1440x900`. | 1. Run the viewport matrix. 2. Open place detail at each viewport. 3. Evaluate `document.documentElement.scrollWidth <= window.innerWidth`. | The assertion passes at every viewport in the matrix. | PLACE-018-US-007 | Yes | UI E2E | Smoke cadence. Source: RESP-002-US-001 and RESP-002-US-002. |

## PLACE-018-US-008 - Accessible list context

User Story Summary: As a screen-reader user, I want the containing-lists section announced clearly.

Related Feature ID: `PLACE-018`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-018-US-008-TC-001 | Containing-lists section has accessible label | Accessibility, Screen Reader | High | Authenticated user owns one containing list. | Section label `موجود في` or equivalent. | 1. Open place detail. 2. Inspect accessibility tree. | The containing-lists section has an accessible label equivalent to "containing lists" or `موجود في`. | PLACE-018-US-008 | Yes | Accessibility | Smoke cadence. |
| PLACE-018-US-008-TC-002 | List names are announced as related to the section | Accessibility, Screen Reader | High | Authenticated user owns multiple containing lists. | Lists `قهوة`, `برجر`. | 1. Open place detail. 2. Traverse the section with screen-reader semantics. | Assistive technology can associate each list name with the containing-lists section. | PLACE-018-US-008 | Yes | Accessibility | Regression cadence. |
| PLACE-018-US-008-TC-003 | Containing list links are keyboard reachable | Accessibility, Keyboard | High | Authenticated user owns a containing list. | `/places/{id}`. | 1. Open detail. 2. Use Tab and Shift+Tab to navigate to containing-list entries. | Each interactive containing-list target is reachable in logical order by keyboard. | PLACE-018-US-008 | Yes | Accessibility | Regression cadence. |
| PLACE-018-US-008-TC-004 | Enter activates containing list link | Accessibility, Keyboard, Navigation | High | A containing-list target is focused. | Focused list target for `/lists/list_001`. | 1. Focus the containing-list target using keyboard. 2. Press Enter. | The app opens `/lists/list_001`. | PLACE-018-US-008 | Yes | UI E2E | Regression cadence. |
| PLACE-018-US-008-TC-005 | Focus-visible is present on containing-list targets | Accessibility, Keyboard, UI | Medium | Authenticated user owns at least one containing list. | Keyboard focus on a list target. | 1. Open detail. 2. Navigate to a containing-list target using keyboard. 3. Inspect focus indicator. | The focused target has a visible focus indicator that is not hidden by clipping or overlap. | PLACE-018-US-008 | Yes | Accessibility | Regression cadence. |
| PLACE-018-US-008-TC-006 | Dynamic containing-list appearance is announced after refresh | Accessibility, Integration | Medium | Place detail is refreshed after a successful add makes containing-list section visible. | Added list `New Context`. | 1. Start with detail where section is hidden. 2. Seed successful add. 3. Refresh or revalidate detail. 4. Inspect the accessibility tree after load completion. | The containing-lists section is present with an accessible section label and `New Context` is exposed as a list target after refresh completes. | PLACE-018-US-008 | Yes | Accessibility | Nightly cadence. |
| PLACE-018-US-008-TC-007 | Accessibility tree does not expose hidden private list names | Privacy, Accessibility, Security | Critical | Another user owns a private list containing the same place. | Private list name `Secret Picks`. | 1. Sign in as a different user. 2. Open place detail. 3. Inspect accessibility tree and DOM text. | `Secret Picks` is absent from visible UI, hidden text, accessible names, labels, descriptions, and live-region output. | PLACE-018-US-008 | Yes | Security | Smoke cadence. |
| PLACE-018-US-008-TC-008 | Retry control accessibility remains PLACE-017 scope unless section-specific retry is defined | Traceability Verification, Manual | Medium | Requirements review is being performed. | PLACE-017 loading/error requirements; PLACE-018 accessible list context. | 1. Review whether PLACE-018 defines a section-specific retry control. 2. Confirm generic Place Detail retry remains PLACE-017 scope. | No PLACE-018 executable retry-accessibility assertion is made unless a containing-list-specific retry control is documented. | PLACE-018-US-008 | No | Manual | Manual Review cadence. |
| PLACE-018-US-008-TC-009 | Containing-list entries use semantic list structure | Accessibility, Semantics | High | Authenticated user owns at least two containing lists for the place. | Lists `قهوة`, `برجر`. | 1. Open place detail. 2. Inspect role/name structure in the accessibility tree. | The containing-lists section exposes the group as a semantic list or equivalent grouped structure; each containing-list entry is exposed as an item or link with its visible list name. | PLACE-018-US-008 | Yes | Accessibility | Regression cadence. Source: PLACE-018-US-008 and global accessibility baseline. |
| PLACE-018-US-008-TC-010 | Containing-list link touch targets meet minimum size | Accessibility, Mobile, Touch | Medium | Authenticated user owns at least one containing list. | Mobile viewport `320x568`. | 1. Open place detail at `320x568`. 2. Measure each interactive containing-list target hit area. | Every interactive containing-list target has a hit area of at least `44x44` CSS pixels. | PLACE-018-US-008 | Yes | Accessibility | Regression cadence. Source: RESP-003-US-008. |
| PLACE-018-US-008-TC-011 | Live-region behavior for containing-list updates requires clarification | Requirement Clarification, Manual | Medium | Requirements review is being performed. | PLACE-018-US-008 and global live/status requirements. | 1. Review PLACE-018 and global accessibility requirements for dynamic containing-list updates. 2. Confirm whether a live region is required for containing-list changes after refresh. | No executable live-region-specific assertion is made for containing-list updates until explicitly documented. | PLACE-018-US-008 | No | Manual | Manual Review cadence. |

## Final Summary

1. User stories processed: 8
2. Total executable test cases: 55
3. Clarification / Manual / Traceability cases: 14
4. Test count per user story:
   - `PLACE-018-US-001`: 11
   - `PLACE-018-US-002`: 6
   - `PLACE-018-US-003`: 7
   - `PLACE-018-US-004`: 13
   - `PLACE-018-US-005`: 6
   - `PLACE-018-US-006`: 6
   - `PLACE-018-US-007`: 9
   - `PLACE-018-US-008`: 11
5. Count by test type:
   - UI: 21
   - API: 9
   - Integration: 13
   - Accessibility: 11
   - Responsive: 9
   - Security: 8
   - Privacy: 13
   - Data Integrity: 5
   - Contract: 5
   - Authentication: 4
   - Empty State: 4
   - Keyboard: 3
   - Navigation: 3
   - Negative: 3
   - Positive: 7
   - Regression: 11
   - Requirement Clarification: 6
   - Traceability Verification: 8
   - Manual: 14
6. Count by priority:
   - Critical: 12
   - High: 33
   - Medium: 23
   - Low: 1
7. Count by automation layer:
   - API: 9
   - UI E2E: 30
   - Accessibility: 9
   - Security: 7
   - Manual: 14
8. Top automation candidates:
   - `PLACE-018-US-004-TC-001` - Other user's private containing list is hidden
   - `PLACE-018-US-004-TC-003` - API excludes other-user list memberships
   - `PLACE-018-US-004-TC-004` - Guest place detail request returns no list membership data
   - `PLACE-018-US-001-TC-003` - Place detail API returns current-user containing list context
   - `PLACE-018-US-005-TC-003` - Idempotent duplicate add does not duplicate containing-list entry
   - `PLACE-018-US-006-TC-003` - Last removal hides containing-list section
   - `PLACE-018-US-008-TC-007` - Accessibility tree does not expose hidden private list names

## Validation

- Duplicate Test IDs = 0
- Invalid Story References = 0
- Missing User Stories = 0
- Encoding/Mojibake = 0
- API Tests Missing Status Codes = 0
- Requirement Fidelity Violations = 0
- Feature Ownership Violations = 0
