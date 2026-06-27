# LIST-007 Test Cases

Feature: `LIST-007 - View owned list detail`

Primary Source: `docs/user-stories/LISTS_USER_STORIES.md`

Supporting Sources:

- `docs/feature-map/FEATURE_TRACEABILITY.md`
- `docs/user-stories/PLACE_DETAILS_USER_STORIES.md`
- `docs/user-stories/PUBLIC_LISTS_USER_STORIES.md`
- `docs/user-stories/PROFILE_USER_STORIES.md`
- `docs/user-stories/RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`

Endpoint Under Test: `GET /api/v1/lists/{id}`

Traceability: `FEATURE_TRACEABILITY.md` maps `GET /api/v1/lists/{id}` to owned list detail, bearer authentication, frontend route `frontend/app/lists/[id]/page.tsx`, backend operations `get_owned_list` and `list_detail_response`, and existing backend coverage `backend/tests/api/test_places_and_lists.py`.

## QA Execution Standards

- Executable tests validate documented LIST-007 requirements, FEATURE_TRACEABILITY endpoint ownership, explicitly linked integration requirements, or approved global responsive/accessibility requirements.
- Undefined behavior is captured as Requirement Clarification, Manual Verification, or Traceability Verification.
- LIST-007 owns viewing owned list detail, owned-list metadata, privacy-safe owner-only access, contained place row rendering, place-row navigation handoff, detail loading/error/empty states, count consistency, virtualization behavior, and mobile containment.
- LIST-007 does not own list creation, rename, deletion, visibility mutation, adding/removing places, rating creation, full place-detail rendering, public-list browsing, profile rendering, browser history, cache behavior, or cross-feature synchronization timing.
- API executable tests assert exact status codes only when documented by the provided sources or explicitly required by this package input.
- Automation cadence values used in Notes: Smoke, Regression, Nightly, Manual Review.

## Deterministic Fixtures

| Fixture ID | User State | List | Items | Expected Baseline |
|---|---|---|---|---|
| FX-LIST-007-A | Authenticated owner `user-001` | `list-owned-001`, name `Weekend Food`, visibility `private`, owner `user-001`, placeCount `3` | `place-001` name `مطعم الرياض`, type `restaurant`, subtype `burger`, rating `8.5`, ratingCount `2`; `place-002` name `قهوة المساء`, type `cafe`, subtype `specialty`, rating `7.0`, ratingCount `1`; `place-003` name `آيس كريم الحي`, type `ice_cream`, subtype omitted, rating `null`, ratingCount `0` | Owner detail response has exactly three items and no other-user data. |
| FX-LIST-007-B | Authenticated owner `user-001` | `list-empty-001`, name `Empty Saves`, visibility `private`, owner `user-001`, placeCount `0` | empty `[]` | Detail renders empty state and owner add-place action. |
| FX-LIST-007-C | Authenticated owner `user-001` | `list-one-001`, name `Solo Pick`, visibility `public`, owner `user-001`, placeCount `1` | `place-010` name `Cafe One`, type `cafe`, subtype `specialty`, rating `9.0`, ratingCount `4` | Detail renders exactly one place row. |
| FX-LIST-007-D | Authenticated owner `user-001` | `list-large-001`, name `Big Riyadh Tour`, visibility `private`, owner `user-001`, placeCount `120` | `place-1000` through `place-1119`; first `place-1000`, middle `place-1060`, last `place-1119` have deterministic names and types | Large detail uses continuous virtualized list behavior. |
| FX-LIST-007-E | Authenticated owner `user-001` | `list-duplicate-names-001`, name `Duplicate Names`, visibility `private`, owner `user-001`, placeCount `2` | `place-020` name `برجر`, type `restaurant`; `place-021` name `برجر`, type `restaurant` | Duplicate place names remain separate rows by place ID. |
| FX-LIST-007-F | Authenticated non-owner `user-002` | `list-private-owner-001`, name `Owner Private`, visibility `private`, owner `user-001`, placeCount `2` | private items `place-030`, `place-031` | Non-owner must not see any list data. |
| FX-LIST-007-G | Guest session | Target `list-owned-001` exists for `user-001` | same items as FX-LIST-007-A | No bearer token is supplied. |
| FX-LIST-007-H | Expired session for `user-001` | Cached `list-owned-001` detail may exist locally | same items as FX-LIST-007-A | Expired token is rejected and cached protected content is not rendered. |
| FX-LIST-007-I | Authenticated owner `user-001` | `list-long-text-001`, name `مطاعم الإفطار العائلية الطويلة جدا في شمال الرياض`, visibility `private`, owner `user-001`, placeCount `2` | Arabic long place name and mixed `Best برجر 2026` place name | Used for RTL/responsive containment. |

## LIST-007-US-001 - View owned list detail

User Story Summary: As a list owner, I want to view list detail so that I can see places in a collection.

Related Feature ID: `LIST-007`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-007-US-001-TC-001 | Owned list detail API returns deterministic response envelope | API, Contract, Positive | Critical | FX-LIST-007-A is loaded; `user-001` is authenticated. | `GET /api/v1/lists/list-owned-001` with bearer token for `user-001`. | 1. Send request. 2. Inspect status and response JSON. 3. Validate list and item fields. | Response status is `200 OK`; response contains one list detail object for `list-owned-001` with `name="Weekend Food"`, `visibility="private"`, `placeCount=3`, and `items.length=3`; items contain exactly `place-001`, `place-002`, `place-003`. | LIST-007-US-001 | Yes | API | Smoke cadence. Source: FEATURE_TRACEABILITY and LIST-007-US-001. |
| LIST-007-US-001-TC-002 | Owned list detail API includes required list fields | API, Contract | Critical | FX-LIST-007-A is loaded; `user-001` is authenticated. | `GET /api/v1/lists/list-owned-001`. | 1. Send request. 2. Validate top-level list fields. | Response status is `200 OK`; list detail includes required fields `id`, `name`, `visibility`, `placeCount`, and `items`; `id=list-owned-001`; required fields are not `null`. | LIST-007-US-001 | Yes | API | Smoke cadence. |
| LIST-007-US-001-TC-003 | Owned list detail API includes required item fields | API, Contract | Critical | FX-LIST-007-A is loaded; `user-001` is authenticated. | Expected items `place-001`, `place-002`, `place-003`. | 1. Send owned-detail request. 2. Validate each item object. | Response status is `200 OK`; each item includes `id`, `name`, `type`, rating context, and optional `subtype`; `place-003` has omitted or `null` subtype according to source place data and no fake rating value. | LIST-007-US-001 | Yes | API | Smoke cadence. |
| LIST-007-US-001-TC-004 | Owned list detail UI renders exact metadata | UI, Positive | Critical | FX-LIST-007-A is loaded; `user-001` is authenticated. | Route `/lists/list-owned-001`. | 1. Open route. 2. Wait for detail response. 3. Inspect visible metadata. | UI shows list name `Weekend Food`, visibility `private`, place count `3`, and exactly three visible/logically represented item rows for the response. | LIST-007-US-001 | Yes | UI E2E | Smoke cadence. |
| LIST-007-US-001-TC-005 | Detail request targets selected list ID only | UI, API, Regression | High | `user-001` owns `list-owned-001` and `list-empty-001`. | Open `/lists/list-owned-001`. | 1. Intercept network calls. 2. Open selected detail route. 3. Inspect requested URL and rendered list. | Exactly one detail request is made for `GET /api/v1/lists/list-owned-001`; no request for `list-empty-001` is used to render `Weekend Food`. | LIST-007-US-001 | Yes | UI E2E | Regression cadence. |
| LIST-007-US-001-TC-006 | Owned list detail excludes forbidden fields | API, Security, Privacy | Critical | FX-LIST-007-A and another user's private list exist. | `GET /api/v1/lists/list-owned-001`. | 1. Send request as `user-001`. 2. Recursively inspect response JSON. | Response status is `200 OK`; response contains no owner email, internal auth user record, session token, refresh token, private notes, other users' private lists, audit/debug fields, moderation fields, stack traces, or SQL details. | LIST-007-US-001 | Yes | Security | Smoke cadence. |

## LIST-007-US-002 - Deny non-owner detail

User Story Summary: As the system, I want owned detail routes protected so that private collections are not exposed.

Related Feature ID: `LIST-007`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-007-US-002-TC-001 | Non-owner API denial exposes no private list data | API, Security, Privacy, Negative | Critical | FX-LIST-007-F is loaded; `user-002` is authenticated. | `GET /api/v1/lists/list-private-owner-001` as `user-002`. | 1. Send request. 2. Inspect response payload recursively. | Request is denied with not-found or equivalent privacy-preserving denial; payload contains no `Owner Private`, no `place-030`, no `place-031`, no `placeCount`, no owner identity, and no hidden metadata. | LIST-007-US-002 | Yes | Security | Smoke cadence. Exact status is clarified in LIST-007-XC-001. |
| LIST-007-US-002-TC-002 | Non-owner UI renders no private detail | UI, Security, Privacy | Critical | FX-LIST-007-F is loaded; `user-002` is authenticated. | `/lists/list-private-owner-001`. | 1. Open route. 2. Inspect visible UI, DOM, and accessibility tree. | No private list name, item name, visibility value, place count, owner controls, or private metadata from `list-private-owner-001` appears in visible UI, DOM, or accessibility tree. | LIST-007-US-002 | Yes | UI E2E | Smoke cadence. |
| LIST-007-US-002-TC-003 | Non-owner denial uses deterministic error schema | API, Contract, Security | High | FX-LIST-007-F is loaded; `user-002` is authenticated. | `GET /api/v1/lists/list-private-owner-001`. | 1. Send request. 2. Validate denial payload shape. | Error payload uses the documented application error envelope; it contains no list fields, no item array, no owner identifiers, no stack trace, no SQL, and no debug fields. | LIST-007-US-002 | Yes | API | Regression cadence. |
| LIST-007-US-002-TC-004 | Non-owner exact denial status requires clarification | Requirement Clarification | High | LIST-007 source says not found or equivalent privacy-preserving denial, but does not require one exact status. | Candidate statuses `404 Not Found` or another privacy-preserving denial. | 1. Review API contract. 2. Confirm exact status for authenticated non-owner owned-detail access. | No executable LIST-007 test asserts `403` or `404` for non-owner access until the exact status is documented. | LIST-007-US-002 | No | Requirement Clarification | Manual Review cadence. |

## LIST-007-US-003 - Reject guest detail access

User Story Summary: As the system, I want guests denied from owned list detail.

Related Feature ID: `LIST-007`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-007-US-003-TC-001 | Guest API request returns 401 and no list data | API, Security, Privacy, Negative | Critical | FX-LIST-007-G is loaded; no bearer token is supplied. | `GET /api/v1/lists/list-owned-001`. | 1. Send request without token. 2. Inspect status and body. | Response status is `401 Unauthorized`; response contains no list name, no visibility, no placeCount, no items, no private note, no token, no stack trace, and no debug field. | LIST-007-US-003 | Yes | API | Smoke cadence. |
| LIST-007-US-003-TC-002 | Guest UI shows auth prompt without protected data | UI, Security, Privacy | Critical | FX-LIST-007-G is loaded; user is unauthenticated. | `/lists/list-owned-001`. | 1. Open route as guest. 2. Inspect first stable UI, DOM, and accessibility tree. | Authentication prompt or denied state is shown; `Weekend Food`, item names, visibility, placeCount, and owner controls are absent from visible UI, DOM, and accessibility tree. | LIST-007-US-003 | Yes | UI E2E | Smoke cadence. |
| LIST-007-US-003-TC-003 | Expired session does not flash cached list detail | UI, Security, Privacy | Critical | FX-LIST-007-H is loaded; browser has cached `Weekend Food` detail from a prior valid session. | Expired token; route `/lists/list-owned-001`. | 1. Open route with expired session. 2. Capture first paint through auth denial. 3. Inspect DOM/accessibility tree. | Cached protected list detail is never rendered before auth resolution; UI clears protected context and shows auth/denied state. | LIST-007-US-003 | Yes | Security | Smoke cadence. |
| LIST-007-US-003-TC-004 | Expired session API denial has no protected payload | API, Security, Privacy | High | FX-LIST-007-H is loaded; expired bearer token is sent. | `GET /api/v1/lists/list-owned-001`. | 1. Send request with expired token. 2. Inspect response recursively. | Request is denied; response contains no list fields, item rows, owner metadata, private notes, stack trace, SQL, or debug field. | LIST-007-US-003 | Yes | API | Regression cadence. Exact expired-session status is covered by auth contract outside LIST-007. |

## LIST-007-US-004 - Show private list metadata

User Story Summary: As a list owner, I want private state visible so that I understand the list's privacy.

Related Feature ID: `LIST-007`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-007-US-004-TC-001 | Private owned list shows private visibility | UI, Privacy | High | FX-LIST-007-A is loaded; `user-001` is authenticated. | `/lists/list-owned-001`. | 1. Open route. 2. Inspect metadata region. | Metadata region shows list name `Weekend Food`, visibility value `private`, and place count `3`; it does not show read-only public-list context. | LIST-007-US-004 | Yes | UI E2E | Regression cadence. |
| LIST-007-US-004-TC-002 | Private visibility is returned in owner API | API, Contract | High | FX-LIST-007-A is loaded. | `GET /api/v1/lists/list-owned-001`. | 1. Send request. 2. Inspect `visibility`. | Response status is `200 OK`; `visibility` equals `private`; `placeCount` equals `3`; `items.length` equals `3`. | LIST-007-US-004 | Yes | API | Regression cadence. |
| LIST-007-US-004-TC-003 | Private metadata accessible label is explicit | Accessibility, Privacy | Medium | FX-LIST-007-A is loaded; global numeric context applies. | `RESP-004-US-009`. | 1. Open route. 2. Inspect accessibility tree for metadata region. | Assistive technology can identify list name, visibility `private`, and place count context; count `3` is not exposed without label context. | LIST-007-US-004 | Yes | Accessibility | Nightly cadence. Source: RESP-004-US-009. |

## LIST-007-US-005 - Show public list metadata for owner

User Story Summary: As a list owner, I want public state visible while retaining management controls.

Related Feature ID: `LIST-007`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-007-US-005-TC-001 | Public owned list shows public visibility | UI, Privacy | High | FX-LIST-007-C is loaded; `user-001` is authenticated. | `/lists/list-one-001`. | 1. Open route. 2. Inspect metadata and controls. | Metadata shows visibility `public`; owner controls for edit/delete/add/remove are present because the current user owns the list. | LIST-007-US-005 | Yes | UI E2E | Regression cadence. |
| LIST-007-US-005-TC-002 | Public owned list API preserves owner detail fields | API, Contract | High | FX-LIST-007-C is loaded; `user-001` is authenticated. | `GET /api/v1/lists/list-one-001`. | 1. Send request. 2. Inspect fields. | Response status is `200 OK`; `id=list-one-001`; `visibility=public`; `placeCount=1`; `items.length=1`; response does not change to public read-only schema. | LIST-007-US-005 | Yes | API | Regression cadence. |
| LIST-007-US-005-TC-003 | Public-list browsing behavior remains PUBLIC-owned | Traceability Verification | Medium | QA traceability review is being performed. | PUBLIC-LISTS requirements and LIST-007 owned route. | 1. Review LIST-007 owned route tests. 2. Review PUBLIC-002 public detail tests. | LIST-007 validates owner view of a public list only on `/lists/{id}`; public browsing and `/lists/public/{id}` behavior remain PUBLIC-owned. | LIST-007-US-005 | No | Traceability Verification | Manual Review cadence. |

## LIST-007-US-006 - Show list item rows

User Story Summary: As a user, I want places in the list visible and scannable.

Related Feature ID: `LIST-007`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-007-US-006-TC-001 | Populated list renders exact place rows | UI, Positive | High | FX-LIST-007-A is loaded; `user-001` is authenticated. | Three-item list. | 1. Open `/lists/list-owned-001`. 2. Inspect item rows. | Exactly three place rows render or are represented in the virtualized list; rows show `مطعم الرياض`, `قهوة المساء`, and `آيس كريم الحي`. | LIST-007-US-006 | Yes | UI E2E | Smoke cadence. |
| LIST-007-US-006-TC-002 | Place row fields match API response | API, UI, Contract | High | FX-LIST-007-A is loaded. | `place-001`, `place-002`, `place-003`. | 1. Request detail API. 2. Open UI. 3. Compare row text to response items. | UI row names, types, subtypes where present, rating values where present, and unrated state for `place-003` match response items exactly. | LIST-007-US-006 | Yes | UI E2E | Regression cadence. |
| LIST-007-US-006-TC-003 | One-place list renders exactly one row | UI, Boundary | High | FX-LIST-007-C is loaded. | `list-one-001` with `place-010`. | 1. Open `/lists/list-one-001`. 2. Count rendered/logical place rows. | Exactly one place row is present; row name is `Cafe One`; placeCount displays `1`. | LIST-007-US-006 | Yes | UI E2E | Regression cadence. |
| LIST-007-US-006-TC-004 | Duplicate place names remain separate rows by ID | UI, Data Integrity, Edge Case | High | FX-LIST-007-E is loaded. | `place-020` and `place-021` both named `برجر`. | 1. Open `/lists/list-duplicate-names-001`. 2. Inspect row identities and links. | Two separate rows render; both display `برجر`; first row links to `/places/place-020`, second row links to `/places/place-021`; placeCount is `2`. | LIST-007-US-006 | Yes | UI E2E | Regression cadence. |
| LIST-007-US-006-TC-005 | No fake missing data appears for unrated item | UI, Data Integrity | Medium | FX-LIST-007-A is loaded; `place-003` is unrated. | `place-003` rating `null`, ratingCount `0`. | 1. Open detail. 2. Inspect `place-003` row. | `place-003` row shows `آيس كريم الحي`, type `ice_cream`, and an unrated/empty rating state; it does not show fabricated rating such as `0.0`, `10`, or copied rating from another row. | LIST-007-US-006 | Yes | UI E2E | Regression cadence. |
| LIST-007-US-006-TC-006 | Place ordering requires clarification if not source-defined | Requirement Clarification | Medium | LIST-007 does not define sort order for list item rows. | Item order in `items` response versus UI order. | 1. Review product/API contract. 2. Confirm whether UI must preserve response order or apply a documented sort. | No executable LIST-007 test asserts a custom item ordering rule until documented; executable rendering tests compare expected fixture order only where response order is fixed by fixture. | LIST-007-US-006 | No | Requirement Clarification | Manual Review cadence. |

## LIST-007-US-007 - Open place from list item

User Story Summary: As a user, I want list items to open place detail.

Related Feature ID: `LIST-007`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-007-US-007-TC-001 | Pointer activation opens correct place URL | UI, Navigation | High | FX-LIST-007-A is loaded; `user-001` is authenticated. | Row `place-001`. | 1. Open `/lists/list-owned-001`. 2. Click `مطعم الرياض` row. | Browser navigates to `/places/place-001`; LIST-007 does not assert full place-detail rendering beyond correct destination handoff. | LIST-007-US-007 | Yes | UI E2E | Regression cadence. |
| LIST-007-US-007-TC-002 | Keyboard activation opens correct place URL | Accessibility, Navigation | High | FX-LIST-007-A is loaded; keyboard focus can reach row links. | Row `place-002`. | 1. Tab to `قهوة المساء` row/link. 2. Press Enter. | Browser navigates to `/places/place-002`; focus-visible indicator is present before activation. | LIST-007-US-007 | Yes | Accessibility | Regression cadence. Source: RESP-003-US-003. |
| LIST-007-US-007-TC-003 | Place row accessible name includes destination purpose | Accessibility, UI | High | FX-LIST-007-A is loaded. | Row `place-003`. | 1. Inspect accessibility tree for row/link. | Row/link accessible name includes place name `آيس كريم الحي` and communicates activation purpose to open place detail. | LIST-007-US-007 | Yes | Accessibility | Regression cadence. |
| LIST-007-US-007-TC-004 | Full place-detail rendering remains PLACE-owned | Traceability Verification | Medium | QA traceability review is being performed. | PLACE_DETAILS user stories and LIST-007 row navigation. | 1. Review row navigation tests. 2. Review PLACE detail tests. | LIST-007 validates only navigation handoff to `/places/{id}`; place metadata/rating rendering remains PLACE_DETAILS-owned. | LIST-007-US-007 | No | Traceability Verification | Manual Review cadence. |

## LIST-007-US-008 - Show empty list state

User Story Summary: As a user, I want a clear empty state when a list has no places.

Related Feature ID: `LIST-007`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-007-US-008-TC-001 | Empty list API response has zero items | API, Empty State, Contract | High | FX-LIST-007-B is loaded; `user-001` is authenticated. | `GET /api/v1/lists/list-empty-001`. | 1. Send request. 2. Inspect response. | Response status is `200 OK`; `id=list-empty-001`; `placeCount=0`; `items=[]`. | LIST-007-US-008 | Yes | API | Regression cadence. |
| LIST-007-US-008-TC-002 | Empty list UI shows concise empty state | UI, Empty State | High | FX-LIST-007-B is loaded. | `/lists/list-empty-001`. | 1. Open route. 2. Inspect content area. | UI shows list name `Empty Saves`, visibility `private`, place count `0`, no place rows, and one owner add-place action. | LIST-007-US-008 | Yes | UI E2E | Regression cadence. |
| LIST-007-US-008-TC-003 | Empty state contains no fake item data | UI, Privacy, Data Integrity | High | FX-LIST-007-B is loaded. | Empty `items=[]`. | 1. Open route. 2. Search DOM and accessibility tree for fixture place names. | DOM and accessibility tree contain no `مطعم الرياض`, `قهوة المساء`, `آيس كريم الحي`, placeholder fake item, or stale item row. | LIST-007-US-008 | Yes | UI E2E | Regression cadence. |
| LIST-007-US-008-TC-004 | Add-place action ownership remains LIST-008/LIST-019 traceability | Traceability Verification | Medium | Empty state includes add-place action for owner per LIST-007-US-008. | LIST-008 and PLACE-019 ownership. | 1. Verify action is present in empty state. 2. Confirm mutation behavior is covered elsewhere. | LIST-007 validates action presence only; add-place/add-current-place mutation behavior remains owned by LIST-008 and PLACE-019. | LIST-007-US-008 | No | Traceability Verification | Manual Review cadence. |

## LIST-007-US-009 - Show detail loading state

User Story Summary: As a user, I want feedback while list detail loads.

Related Feature ID: `LIST-007`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-007-US-009-TC-001 | Pending detail request shows compact skeleton rows | UI, Loading | Medium | FX-LIST-007-A is loaded; API response is delayed. | Delayed `GET /api/v1/lists/list-owned-001`. | 1. Open route. 2. Hold API response pending. 3. Inspect loading state. | Compact skeleton/loading rows appear; `Weekend Food` item names are not rendered before response; no fake place item is shown. | LIST-007-US-009 | Yes | UI E2E | Nightly cadence. |
| LIST-007-US-009-TC-002 | Loading skeleton does not create overflow | Responsive, Loading | Medium | Detail request is pending at mobile viewport. | Viewport `320x568`; `RESP-002-US-021`. | 1. Set viewport. 2. Open route with delayed response. 3. Inspect width. | Loading state satisfies `document.documentElement.scrollWidth <= window.innerWidth`; skeleton rows fit final row width. | LIST-007-US-009 | Yes | UI E2E | Regression cadence. Source: RESP-002-US-021. |
| LIST-007-US-009-TC-003 | Loading state is announced accessibly | Accessibility, Loading | Medium | Detail request is pending. | Global status requirements. | 1. Open route with delayed response. 2. Inspect accessibility tree. | Pending state is exposed through visible status text, `role=status`, `aria-busy`, or equivalent; no fake row is announced as real list content. | LIST-007-US-009 | Yes | Accessibility | Regression cadence. Source: RESPONSIVE_ACCESSIBILITY status guidance. |

## LIST-007-US-010 - Show detail API error with retry

User Story Summary: As a user, I want a recovery path when detail fails.

Related Feature ID: `LIST-007`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-007-US-010-TC-001 | Network failure shows error and retry without false data | UI, Error Handling | High | FX-LIST-007-A exists; first detail request fails with network error. | `/lists/list-owned-001`. | 1. Open route. 2. Simulate network failure. 3. Inspect error state. | Error state is visible; retry action is visible; no list name, place rows, or placeCount from a stale response is rendered as current data. | LIST-007-US-010 | Yes | UI E2E | Regression cadence. |
| LIST-007-US-010-TC-002 | 5xx detail failure uses privacy-safe error payload | API, Error Handling, Security | High | Test harness forces server failure for owned detail. | `GET /api/v1/lists/list-owned-001`. | 1. Send request. 2. Inspect error payload. | Error payload follows deterministic error envelope; it contains no list items, private notes, owner identity, SQL, stack trace, debug field, or token. | LIST-007-US-010 | Yes | API | Regression cadence. Status code taxonomy remains outside LIST-007 unless documented. |
| LIST-007-US-010-TC-003 | Retry replaces error with deterministic data | UI, Error Handling | Medium | First request fails; second request returns FX-LIST-007-A. | `/lists/list-owned-001`. | 1. Open route and receive error. 2. Activate retry. 3. Resolve second request with fixture A. | Retry sends a new `GET /api/v1/lists/list-owned-001`; error state is removed; UI shows `Weekend Food`, placeCount `3`, and three item rows. | LIST-007-US-010 | Yes | UI E2E | Regression cadence. Source: LIST-007-US-010 retry action. |
| LIST-007-US-010-TC-004 | Error state is accessible | Accessibility, Error Handling | High | Detail request fails. | `RESP-002-US-022`. | 1. Open route with failed detail response. 2. Inspect screen-reader output and keyboard order. | Error text is programmatically determinable through alert/status semantics; retry action is keyboard reachable and has an accessible name. | LIST-007-US-010 | Yes | Accessibility | Regression cadence. Source: RESP-002-US-022. |

## LIST-007-US-011 - Keep detail counts accurate

User Story Summary: As a user, I want `placeCount` to match visible memberships.

Related Feature ID: `LIST-007`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-007-US-011-TC-001 | Place count matches three response items | API, UI, Data Integrity | High | FX-LIST-007-A is loaded. | `placeCount=3`, `items.length=3`. | 1. Request detail API. 2. Open UI. 3. Count rows represented by response. | API has `placeCount=3` and `items.length=3`; UI displays count `3` using Western digit and represents exactly three items. | LIST-007-US-011 | Yes | UI E2E | Regression cadence. Source: RESP-004-US-001. |
| LIST-007-US-011-TC-002 | Place count matches empty response | API, UI, Empty State | High | FX-LIST-007-B is loaded. | `placeCount=0`, `items=[]`. | 1. Request detail API. 2. Open UI. | API has `placeCount=0` and `items=[]`; UI displays count `0` and no place rows. | LIST-007-US-011 | Yes | UI E2E | Regression cadence. |
| LIST-007-US-011-TC-003 | Place count matches duplicate-name memberships | UI, Data Integrity | Medium | FX-LIST-007-E is loaded. | Two items both named `برجر`. | 1. Open detail. 2. Count rows and count text. | UI displays place count `2`; two rows are present despite duplicate names; count is based on memberships, not unique display names. | LIST-007-US-011 | Yes | UI E2E | Regression cadence. |
| LIST-007-US-011-TC-004 | Count announcement has screen-reader context | Accessibility, Localization | Medium | FX-LIST-007-A is loaded. | `RESP-004-US-009`. | 1. Inspect accessibility tree for count display. | Count `3` is announced with context such as place count/list item count; numeric text uses Western digit `3`. | LIST-007-US-011 | Yes | Accessibility | Nightly cadence. Source: RESP-004-US-001, RESP-004-US-009. |

## LIST-007-US-012 - Virtualize large list detail

User Story Summary: As a user with many saved places, I want list detail to behave like a continuous archive without pagination friction.

Related Feature ID: `LIST-007`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-007-US-012-TC-001 | Large list renders as one continuous virtualized list | UI, Performance, Positive | Critical | FX-LIST-007-D is loaded; viewport is `390x844`. | `list-large-001`, placeCount `120`. | 1. Open detail. 2. Inspect first viewport. 3. Scroll near middle and end. | UI shows one continuous list experience with no pagination control; first item `place-1000`, middle item `place-1060`, and final item `place-1119` become reachable by scrolling. | LIST-007-US-012 | Yes | UI E2E | Smoke cadence. |
| LIST-007-US-012-TC-002 | Virtualized list limits rendered row count | UI, Performance | High | FX-LIST-007-D is loaded; viewport is `390x844`. | 120-item list. | 1. Open detail. 2. Count DOM row elements after initial render. 3. Scroll to middle and count again. | Rendered physical row elements are fewer than total `120` while list remains scrollable and reachable; represented place count remains `120`. | LIST-007-US-012 | Yes | UI E2E | Regression cadence. Source: LISTS_USER_STORIES large-list virtualization preference. |
| LIST-007-US-012-TC-003 | Virtualized list preserves row content while scrolling | UI, Performance, Data Integrity | High | FX-LIST-007-D is loaded. | First `place-1000`, middle `place-1060`, last `place-1119`. | 1. Open detail. 2. Scroll to middle item. 3. Scroll to last item. 4. Scroll back to first item. | Each checkpoint displays the correct place name and link for its ID; no row shows stale content from a recycled row. | LIST-007-US-012 | Yes | UI E2E | Regression cadence. |
| LIST-007-US-012-TC-004 | Large list has no pagination friction | UI, UX | Medium | FX-LIST-007-D is loaded. | `list-large-001`. | 1. Open detail. 2. Inspect controls before and after scrolling. | No manual page number, next-page button, or separate page route is required to reach items in the 120-item list. | LIST-007-US-012 | Yes | UI E2E | Regression cadence. |

## LIST-007-US-013 - Preserve behavior under virtualization

User Story Summary: As a user, I want large and small lists to behave consistently.

Related Feature ID: `LIST-007`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-007-US-013-TC-001 | Virtualized keyboard navigation reaches rows | Accessibility, UI | High | FX-LIST-007-D is loaded. | 120-item virtualized list. | 1. Open detail. 2. Navigate rows by keyboard and scroll. 3. Inspect focus-visible state. | Focusable row/link controls remain keyboard reachable as rows enter viewport; visible focus indicator appears on focused row/link. | LIST-007-US-013 | Yes | Accessibility | Regression cadence. Source: RESP-003-US-003. |
| LIST-007-US-013-TC-002 | Virtualized row activation opens correct place | UI, Navigation, Regression | High | FX-LIST-007-D is loaded. | Middle row `place-1060`. | 1. Scroll to `place-1060`. 2. Activate row by keyboard. | Browser navigates to `/places/place-1060`; no stale recycled row ID is used. | LIST-007-US-013 | Yes | UI E2E | Regression cadence. |
| LIST-007-US-013-TC-003 | Virtualized count remains stable while scrolling | UI, Data Integrity | High | FX-LIST-007-D is loaded. | placeCount `120`. | 1. Open detail. 2. Scroll from top to middle to end. 3. Inspect count. | Visible/accessibility count remains `120` at all scroll checkpoints; count is not reduced to currently rendered DOM rows. | LIST-007-US-013 | Yes | UI E2E | Regression cadence. |
| LIST-007-US-013-TC-004 | Remove-item behavior remains LIST-010-owned | Traceability Verification | High | LIST-007-US-013 mentions remove behavior, but removal mutation is LIST-010-owned. | LIST-010 requirements. | 1. Review LIST-007 virtualization tests. 2. Review LIST-010 removal tests. | LIST-007 validates virtualization remains coherent for rendered rows; actual remove mutation and post-remove refresh are covered by LIST-010. | LIST-007-US-013 | No | Traceability Verification | Manual Review cadence. |
| LIST-007-US-013-TC-005 | Return-from-place history behavior requires clarification | Requirement Clarification | Medium | LIST-007 mentions return from detail but does not define browser history or scroll restoration contract. | Return from `/places/{id}` to `/lists/{id}`. | 1. Review route/history requirements. 2. Confirm whether scroll position restoration is required. | No executable LIST-007 test asserts browser history, cache, or scroll restoration until documented. | LIST-007-US-013 | No | Requirement Clarification | Manual Review cadence. |

## LIST-007-US-014 - Keep list detail mobile-safe

User Story Summary: As a mobile user, I want detail usable without zooming.

Related Feature ID: `LIST-007`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-007-US-014-TC-001 | Detail fits 320px viewport | Responsive, Mobile | High | FX-LIST-007-A is loaded. | Viewport `320x568`; `RESP-002-US-001`, `RESP-002-US-002`. | 1. Set viewport. 2. Open detail. 3. Inspect row/content width. | `document.documentElement.scrollWidth <= window.innerWidth`; metadata, rows, and owner controls do not overlap or require horizontal scrolling. | LIST-007-US-014 | Yes | UI E2E | Smoke cadence. |
| LIST-007-US-014-TC-002 | Detail fits 390px and 430px viewports | Responsive, Mobile | High | FX-LIST-007-A is loaded. | Viewports `390x844`, `430x932`. | 1. Open detail at `390x844`. 2. Repeat at `430x932`. | At both widths, list metadata and rows remain contained; no horizontal overflow occurs; final visible control is not covered by bottom navigation. | LIST-007-US-014 | Yes | UI E2E | Regression cadence. Source: RESP-002-US-001, RESP-002-US-002, RESP-002-US-005. |
| LIST-007-US-014-TC-003 | Detail supports phone landscape | Responsive, Mobile, Landscape | High | FX-LIST-007-A is loaded. | Viewport `844x390`; `RESP-002-US-012`. | 1. Set landscape viewport. 2. Open detail. 3. Inspect rows and controls. | No horizontal overflow occurs; fixed navigation and safe-area padding do not hide metadata, rows, or primary controls. | LIST-007-US-014 | Yes | UI E2E | Regression cadence. |
| LIST-007-US-014-TC-004 | Detail supports 200% zoom | Responsive, Accessibility | High | FX-LIST-007-A is loaded. | Browser zoom `200%`; `RESP-003-US-001`, `RESP-003-US-002`, `RESP-003-US-003`. | 1. Set 200% zoom. 2. Open detail. 3. Inspect overflow and operability. | `document.documentElement.scrollWidth <= window.innerWidth`; rows and owner controls remain reachable and operable. | LIST-007-US-014 | Yes | Accessibility | Regression cadence. |
| LIST-007-US-014-TC-005 | Long Arabic and mixed names are contained | Responsive, Arabic, RTL | High | FX-LIST-007-I is loaded. | Long list name and mixed place name `Best برجر 2026`; `RESP-002-US-016`, `RESP-002-US-018`. | 1. Set viewport `320x568`. 2. Open `/lists/list-long-text-001`. 3. Inspect text bounding boxes. | Long Arabic and mixed-language names wrap or clamp within their containers; no row text collides with count, metadata, or actions; no horizontal overflow occurs. | LIST-007-US-014 | Yes | UI E2E | Regression cadence. |
| LIST-007-US-014-TC-006 | Detail respects safe-area bottom padding | Responsive, Mobile | High | FX-LIST-007-D is loaded; safe-area simulation is active. | `320x568` with bottom navigation; `RESP-002-US-005`. | 1. Open large list detail. 2. Scroll to final item. 3. Inspect final row and controls. | Final reachable row/control is fully visible above bottom navigation and safe-area padding. | LIST-007-US-014 | Yes | UI E2E | Regression cadence. |
| LIST-007-US-014-TC-007 | Touch targets meet minimum size | Accessibility, Mobile | High | FX-LIST-007-A is loaded. | `RESP-003-US-008`. | 1. Open detail at mobile viewport. 2. Measure row links and owner action controls. | Interactive row links and owner action controls have hit targets at least `44x44` CSS pixels. | LIST-007-US-014 | Yes | Accessibility | Regression cadence. |
| LIST-007-US-014-TC-008 | Forced colors keeps text and focus visible | Accessibility, Responsive | Medium | FX-LIST-007-A is loaded; forced-colors mode active. | `RESP-003-US-014`, `RESP-003-US-015`. | 1. Enable forced colors. 2. Open detail. 3. Tab through row links and controls. | List name, metadata, row text, selected/focus states, and controls remain distinguishable; focus indicators remain visible. | LIST-007-US-014 | Yes | Accessibility | Nightly cadence. |
| LIST-007-US-014-TC-009 | Reduced motion preserves list-detail function | Accessibility, Responsive | Medium | FX-LIST-007-D is loaded; reduced motion active. | `RESP-003-US-016`, `RESP-003-US-017`. | 1. Enable reduced motion. 2. Open large list detail. 3. Scroll and activate a row. | Nonessential animations are removed or minimized; scrolling, row activation, loading, and error states remain functional. | LIST-007-US-014 | Yes | Accessibility | Nightly cadence. |

## Clarification, Manual, and Feature-Ownership Cases

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-007-XC-001 | Deleted place reference behavior requires requirement decision | Requirement Clarification | Medium | A list item references a place that was deleted or unavailable; LIST-007 does not define this state. | Deleted place reference. | 1. Review place deletion/unavailability requirements. 2. Confirm whether row is hidden, replaced by an unavailable placeholder, or blocked by data integrity. | No executable LIST-007 test asserts deleted-place-reference behavior until the source requirements define it. | LIST-007-US-006 | No | Requirement Clarification | Manual Review cadence. |
| LIST-007-XC-002 | Renamed place propagation timing remains outside LIST-007 | Traceability Verification | Medium | Place rename/correction is owned outside LIST-007. | Renamed place shown in list detail. | 1. Review place correction/admin ownership. 2. Confirm LIST-007 only renders the received item name. | LIST-007 validates rendering of the current response; place rename propagation timing remains in the owning place/admin feature. | LIST-007-US-006 | No | Traceability Verification | Manual Review cadence. |
| LIST-007-XC-003 | Profile integration remains PROFILE-owned | Traceability Verification | Medium | PROFILE counts and archive are outside LIST-007 ownership. | Profile list count and recent activity. | 1. Review PROFILE requirements. 2. Review LIST-007 detail coverage. | LIST-007 does not assert profile summary updates or profile navigation; PROFILE-owned behavior remains in PROFILE tests. | LIST-007-US-001 | No | Traceability Verification | Manual Review cadence. |
| LIST-007-XC-004 | Browser history behavior requires route contract | Requirement Clarification | Low | LIST-007 does not document browser back, forward, refresh, or restored-history behavior. | Browser navigation from `/lists/{id}`. | 1. Review routing requirements. 2. Confirm expected history and refresh behavior. | No executable LIST-007 test asserts browser history, cache, refresh, or restored scroll behavior until documented. | LIST-007-US-007 | No | Requirement Clarification | Manual Review cadence. |

## Final Summary

1. User stories processed: 14
2. Total executable test cases: 56
3. Clarification / Manual / Traceability cases: 11
   - Requirement Clarification: 5
   - Traceability Verification: 6
4. Total test cases: 67
5. Test count per user story:
   - LIST-007-US-001: 7
   - LIST-007-US-002: 4
   - LIST-007-US-003: 4
   - LIST-007-US-004: 3
   - LIST-007-US-005: 3
   - LIST-007-US-006: 8
   - LIST-007-US-007: 5
   - LIST-007-US-008: 4
   - LIST-007-US-009: 3
   - LIST-007-US-010: 4
   - LIST-007-US-011: 4
   - LIST-007-US-012: 4
   - LIST-007-US-013: 5
   - LIST-007-US-014: 9
6. Count by priority:
   - Critical: 11
   - High: 36
   - Medium: 19
   - Low: 1
7. Count by automation layer:
   - API: 10
   - UI E2E: 32
   - Accessibility: 11
   - Security: 3
   - Requirement Clarification: 5
   - Traceability Verification: 6
8. Top automation candidates:
   - `GET /api/v1/lists/{id}` owner success schema and forbidden-field checks.
   - Non-owner, guest, and expired-session privacy gates.
   - Empty, one-place, populated, duplicate-name, and large-list rendering.
   - Virtualization row recycling, continuous scrolling, count stability, and correct row navigation.
   - Accessibility checks for semantic rows, keyboard navigation, accessible names, count context, touch targets, 200% zoom, forced colors, and reduced motion.

## Validation

- Duplicate Test IDs = 0
- Invalid Story References = 0
- Missing User Stories = 0
- Encoding/Mojibake = 0
- Undocumented API Status Assertions = 0
- Requirement Fidelity Violations = 0
- Feature Ownership Violations = 0
