# LIST-001 Test Cases

Feature: `LIST-001 - View owned lists`

Source: `docs/user-stories/LISTS_USER_STORIES.md`

Supporting Sources:

- `docs/feature-map/FEATURE_TRACEABILITY.md`
- `docs/user-stories/PROFILE_USER_STORIES.md`
- `docs/user-stories/PUBLIC_LISTS_USER_STORIES.md`
- `docs/user-stories/RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`

Scope: All user stories under `LIST-001`.

## QA Execution Standards

- Test cases validate documented requirements only. Undefined owned-list index behavior must be captured as Requirement Clarification, Manual Verification, or Traceability Verification.
- `LIST-001` owns viewing the authenticated user's owned list collection, rendering owned list rows, collection envelope behavior, pagination, sorting, empty/loading/error states, and opening owned list detail from an index row.
- `LIST-001` does not own list creation, rename, deletion, visibility editing, add-place, remove-place, owned list detail content, profile summaries, place-detail list context, or public-list browsing. Those remain in `LIST-003+`, `LIST-007+`, `PROFILE-*`, `PLACE-*`, or `PUBLIC-*`.
- Owned list index endpoint from traceability: `GET /api/v1/lists` with Bearer authentication.
- Owned list detail endpoint from traceability is referenced only for row-navigation handoff: `GET /api/v1/lists/{id}`.
- Executable responsive tests cite `RESP-001-US-011`, `RESP-001-US-012`, `RESP-002-US-001`, `RESP-002-US-002`, `RESP-002-US-005`, `RESP-002-US-012`, `RESP-002-US-016`, `RESP-002-US-017`, `RESP-002-US-018`, `RESP-002-US-020`, `RESP-002-US-021`, `RESP-002-US-022`, `RESP-003-US-001`, `RESP-003-US-002`, `RESP-003-US-008`, `RESP-003-US-014`, `RESP-003-US-015`, `RESP-003-US-016`, and `RESP-003-US-017`.
- Executable accessibility tests cite global accessibility requirements only where they apply to active screens, keyboard navigation, focus-visible state, status/error announcements, or touch targets. Semantic owned-list collection structure is tied to LIST-001 row-navigation and global QA certification for screen-reader labels/heading order; no unrelated modal or rating A11Y requirement is reused.
- Automation cadence values used in Notes: Smoke, Regression, Nightly, Manual Review.

## LIST-001-US-001 - View owned lists

User Story Summary: As an authenticated user, I want to view my owned lists so that I can access my collections.

Related Feature ID: `LIST-001`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-001-US-001-TC-001 | Authenticated user sees only owned lists | UI, API, Positive, Privacy, Security | Critical | User `u_owner` owns lists `owned_a` and `owned_b`; user `u_other` owns `other_private` and `other_public`. | `GET /api/v1/lists` as `u_owner`; `/lists`. | 1. Sign in as `u_owner`. 2. Open `/lists`. 3. Inspect network response and rendered rows. | Response status is `200 OK`; response `data` contains `owned_a` and `owned_b` only; rendered rows contain `owned_a` and `owned_b` only; `other_private` and `other_public` are absent from response, DOM, and accessibility tree. | LIST-001-US-001 | Yes | Security | Smoke cadence. |
| LIST-001-US-001-TC-002 | Owned list index requests documented endpoint once on initial load | UI, API, Integration | High | Authenticated user has at least one owned list. | `/lists`; expected endpoint `GET /api/v1/lists`. | 1. Open `/lists`. 2. Inspect network requests during initial load. | The frontend sends `GET /api/v1/lists` for the owned-list collection; the request receives `200 OK`; it does not call public-list endpoints to populate the owned index. | LIST-001-US-001 | Yes | UI E2E | Smoke cadence. Source: FEATURE_TRACEABILITY. |
| LIST-001-US-001-TC-003 | One owned list renders as one row | UI, Positive | High | Authenticated user owns exactly one list. | List `list_one`, name `قهوة`, visibility `private`, `placeCount=3`. | 1. Sign in. 2. Open `/lists`. 3. Count rendered list rows. | Exactly one owned-list row renders; the row is associated with `list_one` and no placeholder or duplicate row is present. | LIST-001-US-001 | Yes | UI E2E | Regression cadence. |
| LIST-001-US-001-TC-004 | Many owned lists render without losing rows from response | UI, Boundary, Regression | High | Authenticated user owns 100 lists returned by the first page. | API response with `data.length=100`, `meta.total=100`. | 1. Open `/lists`. 2. Wait for list load. 3. Scroll through the loaded collection if needed. 4. Compare rendered row identities with response `data` identities. | Each list ID in response `data` is represented exactly once in the owned-list collection during the inspection pass; no response list ID is missing or duplicated. | LIST-001-US-001 | Yes | UI E2E | Regression cadence. |
| LIST-001-US-001-TC-005 | Other users' public lists do not leak into owned index | API, Privacy, Security | Critical | `u_other` owns a public list; `u_owner` owns a private list. | `GET /api/v1/lists` as `u_owner`. | 1. Send authenticated request as `u_owner`. 2. Inspect response JSON recursively. | Response status is `200 OK`; public lists owned by `u_other` are absent from `data`; public-list browse behavior remains owned by `PUBLIC-*`. | LIST-001-US-001 | Yes | Security | Smoke cadence. |
| LIST-001-US-001-TC-006 | Deleted-list freshness is traceable to delete feature | Traceability Verification, Manual | Medium | QA traceability review is being performed. | LIST-006 deletion requirements and LIST-001 view requirements. | 1. Review LIST-001 and LIST-006. 2. Confirm deletion mutation coverage is owned by LIST-006. 3. Confirm LIST-001 covers rendering the current `GET /api/v1/lists` response. | LIST-001 executable coverage validates the current owned-list response; deletion mutation and rollback behavior remain in LIST-006 test packages. | LIST-001-US-001 | No | Manual | Manual Review cadence. |
| LIST-001-US-001-TC-007 | Renamed-list freshness is traceable to rename feature | Traceability Verification, Manual | Medium | QA traceability review is being performed. | LIST-004 rename requirements and LIST-001 view requirements. | 1. Review LIST-001 and LIST-004. 2. Confirm rename mutation coverage is owned by LIST-004. 3. Confirm LIST-001 covers rendering names returned by current list response. | LIST-001 executable coverage validates rendering returned list names; rename mutation, stale rename recovery, and update semantics remain in LIST-004. | LIST-001-US-001 | No | Manual | Manual Review cadence. |
| LIST-001-US-001-TC-008 | Cross-surface consistency remains traceable without duplicate ownership | Traceability Verification, Manual | Medium | QA traceability review is being performed. | LIST-001, LIST-002, PLACE-018, PROFILE-* and PUBLIC-* requirements. | 1. Review feature ownership boundaries. 2. Map `GET /api/v1/lists` consumers from FEATURE_TRACEABILITY. 3. Confirm consistency tests are owned by their consumer feature packages. | LIST-001 owns the owned-list index response and rendering; Profile counts, Place Detail list context, and Public Lists browse behavior are not duplicated as executable LIST-001 tests. | LIST-001-US-001 | No | Manual | Manual Review cadence. |
| LIST-001-US-001-TC-009 | Profile list-count consistency remains profile-owned | Traceability Verification, Manual | Medium | QA traceability review is being performed. | `PROFILE-001-US-005`, `PROFILE-001-US-006`, `GET /api/v1/lists`. | 1. Review LIST-001 owned-list response scope. 2. Review profile `listsCount` requirements. 3. Confirm profile count assertions remain in PROFILE tests. | LIST-001 validates owned-list collection data; profile summary `listsCount`, deletion count refresh, and profile UI consistency remain owned by PROFILE-* test packages. | LIST-001-US-001 | No | Manual | Manual Review cadence. |
| LIST-001-US-001-TC-010 | Public-list separation remains public-feature-owned | Traceability Verification, Manual | Medium | QA traceability review is being performed. | `PUBLIC-001-US-005`, `PUBLIC-002-US-005`, `PUBLIC-001-US-018`, `PUBLIC-002-US-009`. | 1. Review LIST-001 owned-list route. 2. Review public-list visibility and privacy requirements. 3. Confirm public index/detail tests cover public-list behavior. | LIST-001 validates that owned index excludes other users' lists; public-list eligibility, read-only detail, public owner display, and public note privacy remain owned by PUBLIC-* tests. | LIST-001-US-001 | No | Manual | Manual Review cadence. |

## LIST-001-US-002 - Reject guest access

User Story Summary: As the system, I want guests blocked from owned list data so that private collections are protected.

Related Feature ID: `LIST-001`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-001-US-002-TC-001 | Guest opening `/lists` sees authentication prompt | UI, Authentication, Security, Negative | Critical | No valid session exists. | `/lists`. | 1. Clear auth state. 2. Open `/lists`. 3. Inspect visible UI, DOM, and accessibility tree. | Authentication prompt or denial state renders; no owned list names, IDs, visibility values, or place counts appear in visible UI, DOM, or accessibility tree. | LIST-001-US-002 | Yes | Security | Smoke cadence. |
| LIST-001-US-002-TC-002 | Guest API request returns 401 | API, Authentication, Security, Negative | Critical | No Bearer token is supplied. | `GET /api/v1/lists`. | 1. Send request without authentication. 2. Inspect status and response payload. | Response status is `401 Unauthorized`; no `data` array, list row, `userId`, list name, visibility, or `placeCount` is returned. | LIST-001-US-002 | Yes | API | Smoke cadence. |
| LIST-001-US-002-TC-003 | Unauthorized error schema is deterministic and privacy-safe | API, Contract, Privacy, Security | Critical | No Bearer token is supplied. | `GET /api/v1/lists`. | 1. Send unauthenticated request. 2. Inspect response body recursively. | Response status is `401 Unauthorized`; error payload follows the documented error schema and contains no list fields, private names, owner identifiers, tokens, cookies, stack traces, raw SQL, or debug fields. | LIST-001-US-002 | Yes | API | Smoke cadence. |
| LIST-001-US-002-TC-004 | Expired session does not expose owned-list data | UI, Authentication, Security, Privacy | Critical | Browser has expired token; previous user owned lists with private names. | Expired session; private list name `Private Burger Notes`. | 1. Open `/lists` with expired token. 2. Observe first paint through final auth state. 3. Inspect DOM and accessibility snapshots. | No owned list row, private list name, list ID, visibility, or `placeCount` appears before or after auth denial; API requiring auth returns `401 Unauthorized`. | LIST-001-US-002 | Yes | Security | Regression cadence. |
| LIST-001-US-002-TC-005 | Auth resolution does not flash previous user's lists | UI, Privacy, Security | Critical | Auth state is unresolved; previous session cache contains owned-list data. | Cached list name `Old Private List`; delayed auth resolution. | 1. Load `/lists` while auth state is unresolved. 2. Observe initial render and DOM snapshots. 3. Complete auth denial. | Before valid auth resolution, previous user's list data is not rendered in visible UI, DOM, or accessibility tree. | LIST-001-US-002 | Yes | Security | Smoke cadence. |
| LIST-001-US-002-TC-006 | Auth recovery behavior requires clarification | Requirement Clarification, Manual | Low | Requirements review is being performed. | Guest opens `/lists`, then signs in. | 1. Review LIST-001 and authentication requirements. 2. Confirm whether the app must return to `/lists` automatically after sign-in. | No executable post-login redirect assertion is made for LIST-001 until auth recovery routing is documented. | LIST-001-US-002 | No | Manual | Manual Review cadence. |
| LIST-001-US-002-TC-007 | Guest cannot access owned list data through public-list routes | Traceability Verification, Manual | Medium | QA traceability review is being performed. | PUBLIC-* and LIST-001 requirements. | 1. Review PUBLIC-* ownership. 2. Confirm public-list browse tests cover public endpoints. 3. Confirm owned-list data is not expected through public endpoints. | LIST-001 guest-denial tests remain scoped to `/lists` and `GET /api/v1/lists`; public-list guest/public behavior is not duplicated here. | LIST-001-US-002 | No | Manual | Manual Review cadence. |
| LIST-001-US-002-TC-008 | Expired bearer token API request returns 401 without owned data | API, Authentication, Security, Negative | Critical | Expired Bearer token is available; user previously owned private lists. | `GET /api/v1/lists` with expired Bearer token. | 1. Send request with expired token. 2. Inspect status and response payload recursively. | Response status is `401 Unauthorized`; response payload contains no `data` array, list IDs, list names, visibility values, `placeCount`, owner identifiers, tokens, stack traces, or debug fields. | LIST-001-US-002 | Yes | Security | Smoke cadence. |

## LIST-001-US-003 - Return collection envelope

User Story Summary: As an API consumer, I want owned lists returned in an envelope so that pagination is reliable.

Related Feature ID: `LIST-001`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-001-US-003-TC-001 | Owned lists API returns collection envelope | API, Contract, Positive | Critical | Authenticated user exists. | `GET /api/v1/lists`. | 1. Send authenticated request. 2. Inspect top-level JSON shape. | Response status is `200 OK`; response has top-level `data` array and `meta` object; `meta` contains `limit`, `offset`, `total`, and `sort`. | LIST-001-US-003 | Yes | API | Smoke cadence. |
| LIST-001-US-003-TC-002 | List item schema includes documented safe fields | API, Contract | Critical | Authenticated user owns at least one list. | List `list_schema`. | 1. Send authenticated request. 2. Inspect first item in `data`. | Response status is `200 OK`; each list item contains documented owned-index fields `id`, `name`, `visibility`, and `placeCount`; each `visibility` value is exactly `private` or `public`. | LIST-001-US-003 | Yes | API | Smoke cadence. |
| LIST-001-US-003-TC-003 | List collection excludes forbidden fields | API, Privacy, Security | Critical | Authenticated user owns lists; another user exists. | `GET /api/v1/lists`. | 1. Send authenticated request. 2. Inspect response JSON recursively. | Response status is `200 OK`; response contains no other users' private lists, private notes, owner email, owner display name, `userId`, password hash, refresh token, session token, hidden metadata, internal audit fields, moderation fields, stack traces, raw SQL, or debug fields. | LIST-001-US-003 | Yes | Security | Smoke cadence. |
| LIST-001-US-003-TC-004 | Empty collection preserves envelope shape | API, Contract, Empty State | High | Authenticated user owns no lists. | `GET /api/v1/lists`. | 1. Send authenticated request. 2. Inspect response JSON. | Response status is `200 OK`; `data` is an empty array; `meta.total` is `0`; `meta.limit`, `meta.offset`, and `meta.sort` are present. | LIST-001-US-003 | Yes | API | Regression cadence. |
| LIST-001-US-003-TC-005 | Meta values match request parameters | API, Contract, Data Integrity | High | Authenticated user owns at least three lists. | `GET /api/v1/lists?limit=2&offset=1`. | 1. Send authenticated request. 2. Inspect response metadata. | Response status is `200 OK`; `meta.limit` is `2`; `meta.offset` is `1`; `meta.total` equals the user's total owned-list count; `data.length <= 2`. | LIST-001-US-003 | Yes | API | Regression cadence. |
| LIST-001-US-003-TC-006 | Collection response is not a public-list schema substitute | Traceability Verification, Manual | Medium | QA traceability review is being performed. | PUBLIC-* requirements and `GET /api/v1/lists/public`. | 1. Review LIST-001 and PUBLIC-* response ownership. 2. Compare owned and public endpoint consumers in FEATURE_TRACEABILITY. | LIST-001 validates the owned-list collection envelope only; public-list collection and read-only public metadata remain owned by PUBLIC-* tests. | LIST-001-US-003 | No | Manual | Manual Review cadence. |
| LIST-001-US-003-TC-007 | Undocumented timestamp fields are not required by LIST-001 | Traceability Verification, Manual | Medium | QA contract review is being performed. | LIST-001 schema requirements and sorting requirements. | 1. Review LIST-001-US-003 and LIST-001-US-006. 2. Confirm whether `createdAt` or `updatedAt` are part of `ListResponse` in source contracts outside LIST-001. | LIST-001 executable schema tests do not require undocumented timestamp fields; if another source documents timestamps, that source must be cited before making them required. | LIST-001-US-003 | No | Manual | Manual Review cadence. |

## LIST-001-US-004 - Enforce pagination bounds

User Story Summary: As the system, I want bounded list queries so that large accounts do not overload the client.

Related Feature ID: `LIST-001`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-001-US-004-TC-001 | Reject limit below minimum | API, Validation, Negative | Critical | Authenticated user exists. | `GET /api/v1/lists?limit=0`. | 1. Send authenticated request with `limit=0`. 2. Inspect status and payload. | Response status is `422 Validation Error`; no partial list `data` array is returned. | LIST-001-US-004 | Yes | API | Smoke cadence. |
| LIST-001-US-004-TC-002 | Reject limit above maximum | API, Validation, Boundary, Negative | Critical | Authenticated user exists. | `GET /api/v1/lists?limit=101`. | 1. Send authenticated request with `limit=101`. 2. Inspect status and payload. | Response status is `422 Validation Error`; no partial list `data` array is returned. | LIST-001-US-004 | Yes | API | Smoke cadence. |
| LIST-001-US-004-TC-003 | Reject negative offset | API, Validation, Negative | Critical | Authenticated user exists. | `GET /api/v1/lists?offset=-1`. | 1. Send authenticated request with `offset=-1`. 2. Inspect status and payload. | Response status is `422 Validation Error`; no partial list `data` array is returned. | LIST-001-US-004 | Yes | API | Smoke cadence. |
| LIST-001-US-004-TC-004 | Accept minimum valid limit and offset | API, Boundary, Positive | High | Authenticated user owns at least one list. | `GET /api/v1/lists?limit=1&offset=0`. | 1. Send authenticated request. 2. Inspect response. | Response status is `200 OK`; `meta.limit=1`; `meta.offset=0`; `data.length <= 1`. | LIST-001-US-004 | Yes | API | Regression cadence. |
| LIST-001-US-004-TC-005 | Accept maximum valid limit | API, Boundary, Positive | High | Authenticated user exists. | `GET /api/v1/lists?limit=100`. | 1. Send authenticated request. 2. Inspect response. | Response status is `200 OK`; `meta.limit=100`; `data.length <= 100`; response remains within owned-list scope. | LIST-001-US-004 | Yes | API | Regression cadence. |
| LIST-001-US-004-TC-006 | Validation error payload excludes private list data | API, Validation, Privacy, Security | High | Authenticated user owns private lists. | `GET /api/v1/lists?limit=101&offset=-1`. | 1. Send invalid authenticated request. 2. Inspect error payload recursively. | Response status is `422 Validation Error`; error payload contains no owned list names, list IDs, `userId`, owner metadata, stack traces, raw SQL, or debug fields. | LIST-001-US-004 | Yes | Security | Regression cadence. |

## LIST-001-US-005 - Support paginated owned lists

User Story Summary: As a user with many lists, I want additional lists available without loading everything at once.

Related Feature ID: `LIST-001`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-001-US-005-TC-001 | First page returns requested slice | API, Positive, Boundary | High | Authenticated user owns five lists. | `GET /api/v1/lists?limit=2&offset=0`. | 1. Send request. 2. Inspect `data` and `meta`. | Response status is `200 OK`; `data.length=2`; `meta.limit=2`; `meta.offset=0`; `meta.total=5`. | LIST-001-US-005 | Yes | API | Regression cadence. |
| LIST-001-US-005-TC-002 | Second page returns next owned slice | API, Data Integrity | High | Authenticated user owns five lists. | Page 1 `limit=2&offset=0`; page 2 `limit=2&offset=2`. | 1. Request page 1. 2. Request page 2. 3. Compare returned IDs. | Both responses return `200 OK`; no list ID appears in both page slices; page 2 `meta.offset=2`. | LIST-001-US-005 | Yes | API | Regression cadence. |
| LIST-001-US-005-TC-003 | Offset beyond total returns empty slice with total | API, Boundary, Empty State | Medium | Authenticated user owns three lists. | `GET /api/v1/lists?limit=10&offset=50`. | 1. Send request. 2. Inspect response. | Response status is `200 OK`; `data` is an empty array; `meta.total=3`; `meta.offset=50`. | LIST-001-US-005 | Yes | API | Regression cadence. |
| LIST-001-US-005-TC-004 | UI pagination mechanism requires documentation before execution | Requirement Clarification, Manual | Medium | Requirements review is being performed. | LIST-001-US-005 and frontend UX design. | 1. Review current UX requirements. 2. Confirm whether owned-list pagination uses load more, infinite scroll, explicit pages, virtualization, or another mechanism. | No executable UI pagination-mechanism assertion is made for LIST-001 until the mechanism is documented; API pagination remains executable in LIST-001-US-005-TC-001 through TC-003. | LIST-001-US-005 | No | Manual | Manual Review cadence. |
| LIST-001-US-005-TC-005 | Incremental loading failure behavior requires documentation before execution | Requirement Clarification, Manual | Medium | Requirements review is being performed. | Initial page success followed by a next-page failure. | 1. Review LIST-001-US-005 and LIST-001-US-010. 2. Confirm whether failures after a partially loaded page use inline retry, full-page retry, retained rows, or another documented state. | No executable incremental-load failure assertion is made for LIST-001 until the UI pagination and partial-failure behavior are documented. | LIST-001-US-005 | No | Manual | Manual Review cadence. |
| LIST-001-US-005-TC-006 | Pagination UI mechanism requires clarification if absent | Requirement Clarification, Manual | Low | Requirements review is being performed. | LIST-001-US-005 and frontend UX design. | 1. Review current UX requirements. 2. Confirm whether owned-list pagination uses infinite scroll, load-more, virtualized windowing, or another exposed mechanism. | API pagination is executable; exact UI pagination mechanism is not asserted until documented. | LIST-001-US-005 | No | Manual | Manual Review cadence. |

## LIST-001-US-006 - Sort owned lists consistently

User Story Summary: As a user, I want my newest lists first so that recent work is easy to access.

Related Feature ID: `LIST-001`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-001-US-006-TC-001 | API sorts owned lists by created date descending | API, Data Integrity, Regression | High | Authenticated user owns lists with distinct `createdAt` values. | Lists A newest, B middle, C oldest. | 1. Send `GET /api/v1/lists`. 2. Inspect ordered `data` IDs. | Response status is `200 OK`; `data` is ordered by `createdAt` descending. | LIST-001-US-006 | Yes | API | Smoke cadence. Source: LIST-001 shared rule. |
| LIST-001-US-006-TC-002 | API uses id descending tie-break for identical created timestamps | API, Data Integrity, Boundary | High | Authenticated user owns two lists with identical `createdAt` values and deterministic IDs. | `list_z`, `list_a` with same `createdAt`. | 1. Send `GET /api/v1/lists`. 2. Inspect tied rows. | Response status is `200 OK`; tied rows with the same `createdAt` are ordered by `id` descending. | LIST-001-US-006 | Yes | API | Regression cadence. |
| LIST-001-US-006-TC-003 | Sort metadata is created_at_desc | API, Contract | High | Authenticated user owns at least one list. | `GET /api/v1/lists`. | 1. Send request. 2. Inspect `meta.sort`. | Response status is `200 OK`; `meta.sort` equals `created_at_desc`. | LIST-001-US-006 | Yes | API | Smoke cadence. |
| LIST-001-US-006-TC-004 | UI preserves API ordering | UI, Data Integrity, Regression | High | API returns three owned lists in known order. | API ordered IDs `[list_new, list_mid, list_old]`. | 1. Open `/lists`. 2. Capture rendered row order. | Rendered owned-list rows appear in the same order as API `data`: `list_new`, `list_mid`, `list_old`. | LIST-001-US-006 | Yes | UI E2E | Regression cadence. |
| LIST-001-US-006-TC-005 | Alternative sort controls require clarification | Requirement Clarification, Manual | Low | Requirements review is being performed. | Possible sort controls. | 1. Review LIST-001 and API traceability. 2. Confirm whether users can select alternative sorting. | No executable alternative-sort UI assertion is made for LIST-001 because only `created_at_desc` is documented. | LIST-001-US-006 | No | Manual | Manual Review cadence. |

## LIST-001-US-007 - Render owned list row data

User Story Summary: As a user, I want each list row to show useful metadata so that I can scan quickly.

Related Feature ID: `LIST-001`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-001-US-007-TC-001 | Row renders list name, place count, and visibility | UI, Positive | High | Authenticated user owns one private list. | `name=قائمة القهوة`, `placeCount=4`, `visibility=private`. | 1. Open `/lists`. 2. Inspect row content. | Row displays the list name, place count `4`, and private visibility state for the returned list. | LIST-001-US-007 | Yes | UI E2E | Smoke cadence. |
| LIST-001-US-007-TC-002 | Public owned list renders public visibility | UI, Positive | High | Authenticated user owns a public list. | `name=أماكن العائلة`, `visibility=public`, `placeCount=2`. | 1. Open `/lists`. 2. Inspect row content. | Row displays the list name, place count `2`, and public visibility state; management controls are not tested in LIST-001. | LIST-001-US-007 | Yes | UI E2E | Regression cadence. |
| LIST-001-US-007-TC-003 | Duplicate list names remain distinguishable by documented metadata and route identity | UI, UX, Regression | Medium | Authenticated user owns two lists with the same name. | Row A named `برجر`, ID `list_dup_a`, `placeCount=1`, `visibility=private`; row B named `برجر`, ID `list_dup_b`, `placeCount=3`, `visibility=public`. | 1. Open `/lists`. 2. Inspect duplicate-name rows and row links. | Two separate rows named `برجر` render; one row shows `placeCount=1` and `private`; the other shows `placeCount=3` and `public`; row route targets are `/lists/list_dup_a` and `/lists/list_dup_b`. | LIST-001-US-007 | Yes | UI E2E | Regression cadence. Source: LIST-011 duplicate-name rule. |
| LIST-001-US-007-TC-004 | Long Arabic list name is contained | UI, Responsive, Arabic, RTL | High | Authenticated user owns a list with a long Arabic name. | `مطاعم الإفطار العائلية الطويلة جدا في شمال الرياض`. | 1. Set viewport to `320x568`. 2. Open `/lists`. 3. Inspect row layout. | Long Arabic name wraps or truncates within the row; `document.documentElement.scrollWidth <= window.innerWidth`; place count and visibility remain readable. | LIST-001-US-007 | Yes | UI E2E | Regression cadence. Source: RESP-002-US-016, RESP-002-US-020. |
| LIST-001-US-007-TC-005 | Long English list name is contained | UI, Responsive | High | Authenticated user owns a list with long English text. | `VeryLongBurgerCollectionNameWithoutNaturalBreaksForTesting`. | 1. Set viewport to `320x568`. 2. Open `/lists`. 3. Inspect row layout. | Long English name wraps, clamps, or truncates within its text column; no overlap with place count, visibility, or row action occurs. | LIST-001-US-007 | Yes | UI E2E | Regression cadence. Source: RESP-002-US-017, RESP-002-US-020. |
| LIST-001-US-007-TC-006 | Mixed Arabic and English list name preserves readable bidi order | UI, Localization, Arabic, RTL | Medium | Authenticated user owns mixed-language list. | `Best برجر 2026`. | 1. Open `/lists` in RTL locale. 2. Inspect row text order and containment. | Mixed name remains readable in logical order; numeric and English fragments do not reorder the Arabic label or create horizontal overflow. | LIST-001-US-007 | Yes | UI E2E | Regression cadence. Source: RESP-002-US-018. |
| LIST-001-US-007-TC-007 | Row excludes private account data and hidden metadata | UI, Privacy, Security | Critical | Authenticated user owns lists; response includes only documented row fields. | `/lists`. | 1. Open `/lists`. 2. Inspect visible UI, DOM attributes, and accessibility tree. | Rows expose no owner email, session identifiers, refresh tokens, hidden moderation fields, raw audit metadata, or other users' private list data. | LIST-001-US-007 | Yes | Security | Smoke cadence. |
| LIST-001-US-007-TC-008 | Place count displays zero without fake memberships | UI, Data Integrity | High | Authenticated user owns an empty list. | `placeCount=0`. | 1. Open `/lists`. 2. Inspect empty-list row metadata. | Row displays place count `0`; it does not show fake place names or placeholder memberships on the index row. | LIST-001-US-007 | Yes | UI E2E | Regression cadence. |
| LIST-001-US-007-TC-009 | Row data does not include list detail items | Feature Ownership, Traceability Verification, Manual | Medium | QA traceability review is being performed. | LIST-001 and LIST-007 requirements. | 1. Review row-data requirements. 2. Confirm item rendering belongs to owned list detail. | LIST-001 rows show list summary metadata only; place item rows and list detail rendering are covered by LIST-007. | LIST-001-US-007 | No | Manual | Manual Review cadence. |
| LIST-001-US-007-TC-010 | placeCount reflects list membership count | API, UI, Data Integrity | High | Authenticated user owns two lists; the same place is saved in both lists. | `list_a.placeCount=1`, `list_b.placeCount=1`; same `place_id` appears in both memberships. | 1. Send `GET /api/v1/lists`. 2. Open `/lists`. 3. Inspect API `placeCount` and rendered row counts. | Response status is `200 OK`; `list_a` has `placeCount=1`; `list_b` has `placeCount=1`; rendered rows show `1` for both lists and do not collapse counts across lists. | LIST-001-US-007 | Yes | UI E2E | Regression cadence. Source: LISTS shared rule `placeCount` is membership count. |
| LIST-001-US-007-TC-011 | Owned-list collection exposes semantic row grouping | Accessibility, UI | High | Authenticated user owns at least two lists. | `/lists` with rows `list_sem_a`, `list_sem_b`. | 1. Open `/lists`. 2. Inspect accessibility tree. 3. Inspect keyboard focus order through rows. | Owned-list rows are exposed as a single named collection with one programmatically determinable item/link per returned list; each row/link accessible name includes the list name and excludes hidden private data; keyboard focus follows the same order as the rendered rows. | LIST-001-US-007 | Yes | Accessibility | Regression cadence. Source: LIST-001-US-007, LIST-001-US-011, RESPONSIVE_ACCESSIBILITY global screen-reader labels and focus-order certification. |

## LIST-001-US-008 - Show empty owned-list state

User Story Summary: As a new user, I want a clear empty state so that I know how to start.

Related Feature ID: `LIST-001`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-001-US-008-TC-001 | Empty owned-list response renders empty state | UI, Empty State, Positive | High | Authenticated user owns no lists. | API response `data=[]`, `meta.total=0`. | 1. Open `/lists`. 2. Wait for successful response. 3. Inspect page content. | Empty state renders with Arabic copy `لا توجد قوائم`; no list rows or fake list placeholders remain visible. | LIST-001-US-008 | Yes | UI E2E | Smoke cadence. |
| LIST-001-US-008-TC-002 | Empty API response preserves meta total zero | API, Empty State, Contract | High | Authenticated user owns no lists. | `GET /api/v1/lists`. | 1. Send authenticated request. 2. Inspect response. | Response status is `200 OK`; `data=[]`; `meta.total=0`; `meta.sort=created_at_desc`. | LIST-001-US-008 | Yes | API | Regression cadence. |
| LIST-001-US-008-TC-003 | Empty state exposes one create-list action without opening creation flow | UI, UX, Feature Ownership | Medium | Authenticated user owns no lists. | Empty state. | 1. Open `/lists`. 2. Inspect empty-state actions without activating them. | Exactly one create-list entry action is visible and keyboard reachable; create-list dialog behavior is not executed in this LIST-001 test. | LIST-001-US-008 | Yes | UI E2E | Regression cadence. Create behavior belongs to LIST-003. |
| LIST-001-US-008-TC-004 | Empty state is announced accessibly | Accessibility, Empty State | Medium | Authenticated user owns no lists. | Empty state. | 1. Open `/lists`. 2. Inspect heading/region semantics and screen-reader output. | Empty state text and create-list action are programmatically determinable; focus order reaches the create-list action after the empty-state text. | LIST-001-US-008 | Yes | Accessibility | Regression cadence. |
| LIST-001-US-008-TC-005 | Empty state fits mobile viewports | Responsive, Mobile, Empty State | High | Authenticated user owns no lists. | Viewports `320x568`, `390x844`, `430x932`. | 1. Open `/lists` at each viewport. 2. Inspect empty-state copy and action. | Empty state copy and action fit without horizontal overflow; final action is not covered by bottom navigation or safe-area padding. | LIST-001-US-008 | Yes | UI E2E | Regression cadence. Source: RESP-001-US-011, RESP-001-US-012, RESP-002-US-001, RESP-002-US-002. |
| LIST-001-US-008-TC-006 | Empty-state create flow remains LIST-003 scope | Traceability Verification, Manual | Medium | QA traceability review is being performed. | LIST-003 create-list requirements. | 1. Review LIST-001 empty-state action and LIST-003 create-flow requirements. 2. Confirm create dialog tests exist under LIST-003. | LIST-001 validates the empty-state CTA presence only; creating a list, validation, default visibility, and navigation after create remain in LIST-003. | LIST-001-US-008 | No | Manual | Manual Review cadence. |
| LIST-001-US-008-TC-007 | Empty state transition is announced through live status | Accessibility, Empty State | Medium | Authenticated user owns no lists; request starts pending then returns `meta.total=0`. | Delayed `GET /api/v1/lists` response with `data=[]`. | 1. Open `/lists`. 2. Inspect accessible status while loading. 3. Release empty response. 4. Inspect accessible status after resolution. | Loading status is removed; `role=status`, `aria-live=polite`, or visible status text announces the empty state text `لا توجد قوائم`; no fake row is announced. | LIST-001-US-008 | Yes | Accessibility | Regression cadence. Source: RESPONSIVE_ACCESSIBILITY global loading/error/live status certification. |

## LIST-001-US-009 - Show loading state

User Story Summary: As a user, I want layout feedback while lists load so that the screen does not look broken.

Related Feature ID: `LIST-001`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-001-US-009-TC-001 | Pending request shows compact list-row skeletons | UI, Loading | Medium | Authenticated user session exists; list request is delayed. | Delayed `GET /api/v1/lists`. | 1. Open `/lists`. 2. Hold API response pending. 3. Inspect loading UI. | Compact list-row skeletons render during pending state; no fake list name, fake owner, fake count, or stale previous-user row is shown. | LIST-001-US-009 | Yes | UI E2E | Regression cadence. |
| LIST-001-US-009-TC-002 | Loading state matches final row dimensions enough to avoid overflow | Responsive, Loading | Medium | API request is pending at required mobile viewport. | Viewport `320x568`; delayed response. | 1. Set viewport to `320x568`. 2. Open `/lists`. 3. Inspect skeleton layout. | Loading placeholders do not create horizontal overflow; `document.documentElement.scrollWidth <= window.innerWidth`. | LIST-001-US-009 | Yes | UI E2E | Regression cadence. Source: RESP-002-US-021. |
| LIST-001-US-009-TC-003 | Loading state is announced to assistive technology | Accessibility, Loading | Medium | Authenticated user opens `/lists`; request is pending. | Delayed response. | 1. Open `/lists`. 2. Inspect accessibility tree/status output while pending. | Loading state is programmatically available through visible status text, `aria-busy=true`, or `role=status`; it does not rely only on shimmer animation. | LIST-001-US-009 | Yes | Accessibility | Regression cadence. Source: RESPONSIVE_ACCESSIBILITY global loading/status certification. |
| LIST-001-US-009-TC-004 | Loading resolves to response rows without stale state | UI, Loading, Data Integrity | High | Request starts pending and then returns two owned lists. | Lists `list_a`, `list_b`. | 1. Open `/lists` with delayed response. 2. Release successful response. 3. Inspect final rows. | Loading placeholders are removed; exactly the returned owned lists `list_a` and `list_b` render once each. | LIST-001-US-009 | Yes | UI E2E | Regression cadence. |
| LIST-001-US-009-TC-005 | Loading state honors reduced motion | Accessibility, Responsive, Loading | Medium | Reduced motion preference is active; request is pending. | `prefers-reduced-motion: reduce`. | 1. Enable reduced motion. 2. Open `/lists` with delayed response. 3. Inspect loading feedback. | Nonessential loading animation is removed or minimized; loading status remains understandable through text, skeleton shape, or accessible status. | LIST-001-US-009 | Yes | Accessibility | Nightly cadence. Source: RESP-003-US-016, RESP-003-US-017. |
| LIST-001-US-009-TC-006 | Loading completion announces returned row count | Accessibility, Loading | Medium | Authenticated user owns two lists; request starts pending. | Delayed response with `data.length=2`. | 1. Open `/lists`. 2. Inspect accessible loading status. 3. Release successful response. 4. Inspect status/live-region output. | Loading status is cleared; `role=status`, `aria-live=polite`, or visible status text announces that two lists are available; each returned list is announced once in row navigation. | LIST-001-US-009 | Yes | Accessibility | Regression cadence. Source: RESPONSIVE_ACCESSIBILITY global loading/live status certification. |

## LIST-001-US-010 - Show recoverable error state

User Story Summary: As a user, I want a recovery action when lists fail to load so that I can retry.

Related Feature ID: `LIST-001`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-001-US-010-TC-001 | Network failure shows recoverable error without false data | UI, Error Handling, Negative | High | Authenticated user exists; list request fails due to network error. | `/lists`. | 1. Open `/lists`. 2. Simulate network failure for `GET /api/v1/lists`. 3. Inspect UI. | A concise error state and retry action render; no fake owned list rows or stale private list data are shown. | LIST-001-US-010 | Yes | UI E2E | Regression cadence. |
| LIST-001-US-010-TC-002 | 5xx response shows recoverable error without false data | UI, Error Handling, Negative | High | Authenticated user exists; API returns server error. | `GET /api/v1/lists` returns `500`. | 1. Open `/lists`. 2. Simulate 5xx response. 3. Inspect UI. | Error state and retry action render; no list row is created from the failed response. | LIST-001-US-010 | Yes | UI E2E | Regression cadence. |
| LIST-001-US-010-TC-003 | Retry reloads owned-list collection | UI, Error Handling, Regression | High | First request fails; second request succeeds. | Failure followed by `data=[list_retry]`. | 1. Open `/lists` with failed request. 2. Activate retry. 3. Allow second request to succeed. | Retry sends `GET /api/v1/lists` again; error state is removed; returned row `list_retry` renders once. | LIST-001-US-010 | Yes | UI E2E | Regression cadence. |
| LIST-001-US-010-TC-004 | Error state is accessible | Accessibility, Error Handling | High | API request fails. | Error state with retry. | 1. Open `/lists` with failed request. 2. Inspect screen-reader output and keyboard order. | Error text is programmatically determinable; retry action is keyboard reachable and has an accessible name. | LIST-001-US-010 | Yes | Accessibility | Regression cadence. Source: RESP-002-US-022. |
| LIST-001-US-010-TC-005 | Error state fits mobile and safe area | Responsive, Mobile, Error Handling | Medium | API request fails at mobile viewport. | Viewport `320x568`. | 1. Set viewport to `320x568`. 2. Open `/lists` with failed request. 3. Inspect error and retry action. | Error text and retry action fit without horizontal overflow; retry action is not obscured by bottom navigation or safe-area padding. | LIST-001-US-010 | Yes | UI E2E | Regression cadence. Source: RESP-001-US-011, RESP-002-US-022. |
| LIST-001-US-010-TC-006 | Error payload privacy is verified for failed API responses | API, Error Handling, Privacy, Security | High | Authenticated user owns private lists; API returns server error. | `GET /api/v1/lists` returns `500 Internal Server Error`. | 1. Trigger failed owned-list request. 2. Inspect response body and logged client error payload if exposed to UI. | Response status is `500 Internal Server Error`; rendered error and response payload contain no owned list names, list IDs, owner emails, tokens, stack traces, raw SQL, or debug fields. | LIST-001-US-010 | Yes | Security | Regression cadence. |
| LIST-001-US-010-TC-007 | Error state is announced through live status | Accessibility, Error Handling | High | Authenticated user exists; API request fails after loading state. | Network failure for `GET /api/v1/lists`. | 1. Open `/lists`. 2. Simulate network failure. 3. Inspect live/status output and keyboard focus. | Loading status is cleared; error text is exposed through visible status text, `role=alert`, or `aria-live=assertive`; retry action has an accessible name and is reachable by Tab. | LIST-001-US-010 | Yes | Accessibility | Regression cadence. Source: RESP-002-US-022 and RESPONSIVE_ACCESSIBILITY global error/live status certification. |

## LIST-001-US-011 - Open list detail from row

User Story Summary: As a user, I want to open a list from the index so that I can view its places.

Related Feature ID: `LIST-001`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-001-US-011-TC-001 | Pointer activation opens correct list detail route | UI, Navigation, Positive | Critical | Authenticated user owns list `list_open_pointer`. | `/lists`; row for `list_open_pointer`. | 1. Open `/lists`. 2. Click the row or primary row link for `list_open_pointer`. | App navigates to `/lists/list_open_pointer`; no different list ID is used. | LIST-001-US-011 | Yes | UI E2E | Smoke cadence. |
| LIST-001-US-011-TC-002 | Keyboard Enter opens correct list detail route | Accessibility, Keyboard, Navigation | Critical | Authenticated user owns list `list_open_keyboard`. | Keyboard-only navigation. | 1. Open `/lists`. 2. Tab to row/link for `list_open_keyboard`. 3. Press Enter. | Focus reaches the row/link with visible focus; Enter opens `/lists/list_open_keyboard`. | LIST-001-US-011 | Yes | Accessibility | Smoke cadence. |
| LIST-001-US-011-TC-003 | Row accessible name identifies the list | Accessibility, Screen Reader | High | Authenticated user owns named list. | List name `قائمة العائلة`, `placeCount=5`. | 1. Open `/lists`. 2. Inspect row/link accessible name. | Row/link accessible name includes the list name and does not include another row's name or hidden private data. | LIST-001-US-011 | Yes | Accessibility | Regression cadence. |
| LIST-001-US-011-TC-004 | Duplicate-name row navigation targets selected ID | UI, Navigation, Data Integrity | High | Authenticated user owns two lists with the same name and different IDs. | `list_dup_a`, `list_dup_b`, both named `برجر`. | 1. Open `/lists`. 2. Activate the row for `list_dup_b`. 3. Inspect destination route. | App opens `/lists/list_dup_b`; route does not use list name as identity. | LIST-001-US-011 | Yes | UI E2E | Regression cadence. |
| LIST-001-US-011-TC-005 | Detail content rendering remains LIST-007 scope | Traceability Verification, Manual | Medium | QA traceability review is being performed. | LIST-007 owned list detail requirements. | 1. Review LIST-001-US-011 and LIST-007. 2. Confirm list detail content tests are covered in LIST-007. | LIST-001 validates navigation handoff to `/lists/{id}` only; list detail metadata, item rows, and detail authorization are not duplicated here. | LIST-001-US-011 | No | Manual | Manual Review cadence. |
| LIST-001-US-011-TC-006 | Browser history behavior after opening detail requires clarification | Requirement Clarification, Manual | Low | Requirements review is being performed. | Browser Back/Forward from `/lists/{id}` to `/lists`. | 1. Review LIST-001 and navigation requirements. 2. Confirm expected browser Back/Forward behavior after opening list detail. | No executable browser history assertion is made for LIST-001 until documented. | LIST-001-US-011 | No | Manual | Manual Review cadence. |
| LIST-001-US-011-TC-007 | Deleted or invalid detail destination remains LIST-007 scope | Traceability Verification, Manual | Medium | QA traceability review is being performed. | Deleted list or stale row destination. | 1. Review LIST-001 row-navigation and LIST-007 detail error requirements. 2. Confirm stale detail route handling is covered by LIST-007. | LIST-001 validates correct ID handoff from the index; deleted/nonexistent list detail errors are covered by LIST-007. | LIST-001-US-011 | No | Manual | Manual Review cadence. |

## LIST-001-US-012 - Keep mobile list index usable

User Story Summary: As a mobile user, I want list rows to fit naturally so that I do not zoom out.

Related Feature ID: `LIST-001`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-001-US-012-TC-001 | List index fits 320x568 viewport | Responsive, Mobile | High | Authenticated user owns multiple lists. | Viewport `320x568`. | 1. Set viewport to `320x568`. 2. Open `/lists`. 3. Inspect page width and final row. | `document.documentElement.scrollWidth <= window.innerWidth`; final visible row/action is not obscured by bottom navigation, safe-area padding, or browser UI. | LIST-001-US-012 | Yes | UI E2E | Smoke cadence. Source: RESP-001-US-011, RESP-001-US-012, RESP-002-US-001, RESP-002-US-002. |
| LIST-001-US-012-TC-002 | List index fits 390x844 viewport | Responsive, Mobile | High | Authenticated user owns multiple lists. | Viewport `390x844`. | 1. Set viewport to `390x844`. 2. Open `/lists`. 3. Inspect rows and final interactive element. | `document.documentElement.scrollWidth <= window.innerWidth`; final visible row/action is not obscured by bottom navigation, safe-area padding, or browser UI. | LIST-001-US-012 | Yes | UI E2E | Regression cadence. Source: RESP-001-US-011, RESP-002-US-001, RESP-002-US-002. |
| LIST-001-US-012-TC-003 | List index fits 430x932 viewport | Responsive, Mobile | High | Authenticated user owns multiple lists. | Viewport `430x932`. | 1. Set viewport to `430x932`. 2. Open `/lists`. 3. Inspect row layout and final interactive element. | `document.documentElement.scrollWidth <= window.innerWidth`; row text, place count, and visibility metadata remain contained; final visible row/action is not obscured by bottom navigation. | LIST-001-US-012 | Yes | UI E2E | Regression cadence. Source: RESP-001-US-011, RESP-002-US-001, RESP-002-US-002. |
| LIST-001-US-012-TC-004 | List index supports phone landscape | Responsive, Mobile, Landscape | High | Authenticated user owns lists. | Viewport `844x390`. | 1. Set phone landscape viewport. 2. Open `/lists`. 3. Inspect rows and bottom navigation. | `document.documentElement.scrollWidth <= window.innerWidth`; fixed navigation does not hide critical row content or the final interactive element. | LIST-001-US-012 | Yes | UI E2E | Regression cadence. Source: RESP-002-US-012. |
| LIST-001-US-012-TC-005 | List index supports 200% zoom | Responsive, Accessibility, Low Vision | High | Authenticated user owns lists. | Browser zoom `200%`. | 1. Set browser zoom to `200%`. 2. Open `/lists`. 3. Inspect row layout and touch targets. | `document.documentElement.scrollWidth <= window.innerWidth`; row links and navigation controls remain reachable; interactive targets are at least `44x44` CSS pixels. | LIST-001-US-012 | Yes | Accessibility | Regression cadence. Source: RESP-003-US-001, RESP-003-US-002, RESP-003-US-008. |
| LIST-001-US-012-TC-006 | List index respects safe-area bottom padding | Responsive, Mobile | High | Safe-area viewport and bottom navigation are active. | `320x568` safe-area simulation. | 1. Open `/lists`. 2. Scroll to the end. 3. Inspect final row and bottom padding. | Final row/link remains fully visible and activatable above bottom navigation and `env(safe-area-inset-bottom)` padding. | LIST-001-US-012 | Yes | UI E2E | Regression cadence. Source: RESP-001-US-012, RESP-002-US-005. |
| LIST-001-US-012-TC-007 | Forced-colors mode keeps row text and focus visible | Accessibility, Responsive | Medium | Forced-colors/high-contrast mode is active. | `/lists` with rows. | 1. Enable forced-colors mode. 2. Open `/lists`. 3. Tab through row links and navigation. | Row text, visibility state, focus indicators, and navigation controls remain distinguishable without color-only meaning. | LIST-001-US-012 | Yes | Accessibility | Nightly cadence. Source: RESP-003-US-014, RESP-003-US-015. |
| LIST-001-US-012-TC-008 | Reduced motion keeps list index functional | Accessibility, Responsive | Medium | Reduced motion preference is active. | `/lists` with rows; retry state created by failed `GET /api/v1/lists`. | 1. Enable `prefers-reduced-motion: reduce`. 2. Open `/lists`. 3. Navigate row links by keyboard. 4. Force error state and activate retry. | Nonessential row/loading animations are removed or minimized; row navigation and retry control remain operable. | LIST-001-US-012 | Yes | Accessibility | Nightly cadence. Source: RESP-003-US-016, RESP-003-US-017. |

## Final Summary

1. User stories processed: 12
2. Total executable test cases: 70
3. Clarification / Manual / Traceability cases: 18
4. Test count per user story:
   - LIST-001-US-001: 10
   - LIST-001-US-002: 8
   - LIST-001-US-003: 7
   - LIST-001-US-004: 6
   - LIST-001-US-005: 6
   - LIST-001-US-006: 5
   - LIST-001-US-007: 11
   - LIST-001-US-008: 7
   - LIST-001-US-009: 6
   - LIST-001-US-010: 7
   - LIST-001-US-011: 7
   - LIST-001-US-012: 8
5. Count by test type:
   - API: 26
   - Accessibility: 13
   - Arabic: 2
   - Authentication: 4
   - Boundary: 7
   - Contract: 7
   - Data Integrity: 9
   - Empty State: 7
   - Error Handling: 7
   - Feature Ownership: 2
   - Integration: 1
   - Keyboard: 1
   - Landscape: 1
   - Loading: 6
   - Localization: 1
   - Low Vision: 1
   - Manual: 18
   - Mobile: 7
   - Navigation: 3
   - Negative: 8
   - Positive: 10
   - Privacy: 9
   - Regression: 5
   - Requirement Clarification: 6
   - Responsive: 14
   - RTL: 2
   - Screen Reader: 1
   - Security: 12
   - Traceability Verification: 12
   - UI: 27
   - UX: 2
   - Validation: 4
6. Count by priority:
   - Critical: 17
   - High: 39
   - Medium: 28
   - Low: 4
7. Count by automation layer:
   - API: 18
   - Accessibility: 13
   - Security: 10
   - UI E2E: 29
   - Manual: 18
8. Top automation candidates:
   - `GET /api/v1/lists` authenticated success, envelope, documented safe schema, forbidden fields, owner isolation, pagination, sorting, and 401/422 contract tests.
   - UI E2E smoke for owned-list rendering, empty state, retry, and row navigation to `/lists/{id}`.
   - Security automation for no other-user list leakage, no creator identity leakage, no private-data flash, and forbidden-field checks.
   - Accessibility automation for semantic owned-list grouping, keyboard navigation, focus-visible, live/status loading-empty-error announcements, and touch target checks.
   - Responsive automation for `320px`, `390px`, `430px`, landscape, `200%` zoom, safe-area, and no-horizontal-overflow checks.

## Validation

- Duplicate Test IDs = 0
- Invalid Story References = 0
- Missing User Stories = 0
- Encoding/Mojibake = 0
- API Tests Missing Status Codes = 0
- Requirement Fidelity Violations = 0
- Feature Ownership Violations = 0
