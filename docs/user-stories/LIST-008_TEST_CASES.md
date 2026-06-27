# LIST-008 Test Cases

Feature: `LIST-008 - Search and add existing place`

Primary Source: `docs/user-stories/LISTS_USER_STORIES.md`

Supporting Sources:

- `docs/user-stories/PLACES_USER_STORIES.md`
- `docs/feature-map/FEATURE_TRACEABILITY.md`
- `docs/user-stories/LIST-007_TEST_CASES.md`
- `docs/user-stories/RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`

Endpoints Under Test:

- `GET /api/v1/places?q={query}`
- `POST /api/v1/lists/{id}/items`

Traceability:

- `FEATURE_TRACEABILITY.md` maps `GET /api/v1/places` to place browse/search/filter/sort, bearer authentication, `PlaceLibraryPage.tsx`, `AddPlaceDialog.tsx`, `list_place_summaries`, and `backend/tests/api/test_places_and_lists.py`.
- `FEATURE_TRACEABILITY.md` maps `POST /api/v1/lists/{id}/items` to add place to list, bearer authentication, `AddPlaceDialog.tsx`, `PlaceDetailPage.tsx`, `add_place_to_list`, `ListItem`, and `backend/tests/api/test_places_and_lists.py`.

## QA Execution Standards

- Executable tests validate documented `LIST-008` requirements, explicitly linked Places search/list response requirements, `FEATURE_TRACEABILITY.md` endpoint ownership, or approved global responsive/accessibility requirements.
- Undefined behavior is captured as Requirement Clarification, Manual Verification, or Traceability Verification.
- `LIST-008` owns searching existing places from the add-to-list flow, selecting an existing place, adding the selected place to the current owned list, no-results create-place navigation, and the add-place dialog's accessibility/mobile behavior.
- `LIST-008` does not own place creation, place editing/deletion, rating behavior, full place-detail rendering, public place browsing outside the add-place flow, or duplicate add idempotency beyond UI indication. Duplicate mutation idempotency and race handling remain `LIST-009` owned.
- API executable tests assert exact status codes only where documented by the provided sources or explicitly required by this package input.
- Automation cadence values used in Notes: Smoke, Regression, Nightly, Manual Review.

## Deterministic Fixtures

| Fixture ID | User State | List State | Places Catalog | Expected Baseline |
|---|---|---|---|---|
| FX-LIST-008-A | Authenticated owner `user-001` | `list-owned-001`, name `Weekend Food`, owner `user-001`, visibility `private`, existing placeIds [`place-001`] | `place-001` name `مطعم الرياض`, type `restaurant`, subtype `burger`; `place-002` name `قهوة المساء`, type `cafe`, subtype `specialty`; `place-003` name `آيس كريم الحي`, type `ice_cream`, subtype omitted; `place-004` name `Burger House`, type `restaurant`, subtype `burger` | Add-place flow opens for `list-owned-001`; search query `قهوة` returns exactly `place-002`; `place-002` is not already in the list. |
| FX-LIST-008-B | Authenticated owner `user-001` | `list-empty-001`, name `Empty Saves`, owner `user-001`, visibility `private`, existing placeIds [] | Same catalog as FX-LIST-008-A | Add succeeds into an empty list and creates one membership. |
| FX-LIST-008-C | Authenticated owner `user-001` | `list-populated-001`, name `Riyadh Tour`, owner `user-001`, visibility `private`, existing placeIds [`place-001`, `place-004`] | Same catalog as FX-LIST-008-A | Add succeeds into a populated list and preserves existing memberships. |
| FX-LIST-008-D | Authenticated owner `user-001` | `list-owned-001` existing placeIds [`place-001`] | 35 matching places for query `برجر`, including `place-004`, plus Places response `meta.limit=20`, `meta.offset=0`, `meta.total=35`, `meta.sort` present | Search uses paginated Places envelope and bounded page size. |
| FX-LIST-008-E | Authenticated owner `user-001` | `list-owned-001` existing placeIds [`place-001`] | No place matches query `Saffron Moon 999` | No-results fallback is shown with no fake rows. |
| FX-LIST-008-F | Authenticated owner `user-001` | `list-owned-001` existing placeIds [`place-001`] | `place-001` is already in the list and appears in search results for `مطعم` | Already-added state is indicated for `place-001`; duplicate mutation details remain LIST-009 owned. |
| FX-LIST-008-G | Authenticated non-owner `user-002` | Target `list-owned-001` belongs to `user-001` and contains private membership data | Same catalog as FX-LIST-008-A | Non-owner cannot add and receives privacy-preserving denial. |
| FX-LIST-008-H | Guest session | Target `list-owned-001` exists for `user-001` | Same catalog as FX-LIST-008-A | No bearer token is supplied; protected list context must not render. |
| FX-LIST-008-I | Expired session for `user-001` | Browser may contain cached add-place state for `list-owned-001` | Same catalog as FX-LIST-008-A | Expired token is denied; cached protected context is cleared or blocked before rendering. |
| FX-LIST-008-J | Authenticated owner `user-001` | `list-owned-001` existing placeIds [`place-001`] | Long Arabic, English, and mixed names: `مطعم الإفطار العائلي الطويل جدا`, `Very Long Burger House Name`, `Best برجر 2026` | Used for RTL/responsive containment and 200% zoom checks. |

## LIST-008-US-001 - Open add-place flow

User Story Summary: As a list owner, I want to open add place so that I can add an existing place to my list.

Related Feature ID: `LIST-008`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-008-US-001-TC-001 | Owner opens add-place dialog for current list | UI, Accessibility, Positive | Critical | FX-LIST-008-A is loaded; `user-001` is authenticated on `/lists/list-owned-001`. | Trigger `Add place`; current list ID `list-owned-001`. | 1. Open `/lists/list-owned-001`. 2. Activate the add-place trigger. 3. Inspect dialog/sheet title, hidden state, and current-list context. | One modal dialog or bottom sheet opens for `list-owned-001`; it has a visible title, a search input, close/cancel control, and no controls targeting `list-empty-001` or another list. | LIST-008-US-001 | Yes | UI E2E | Smoke cadence. |
| LIST-008-US-001-TC-002 | Add-place modal exposes approved dialog semantics | Accessibility | Critical | FX-LIST-008-A is loaded; add-place flow is open. | `A11Y-001-US-001`, `A11Y-001-US-002`, `A11Y-001-US-003`. | 1. Open the add-place dialog/sheet. 2. Inspect accessibility tree. 3. Inspect active element after open. | Dialog has `role="dialog"` or equivalent modal sheet semantics, `aria-modal="true"` where applicable, accessible name matching the visible title, and initial focus on the search input or safe initial focus target. | LIST-008-US-001 | Yes | Accessibility | Regression cadence. Source: A11Y-001-US-001 through A11Y-001-US-003. |
| LIST-008-US-001-TC-003 | Add-place flow does not render protected data before auth resolution | UI, Security, Privacy | Critical | FX-LIST-008-I is loaded; cached add-place search state exists locally; auth state is unresolved. | Cached query `قهوة`, cached result `قهوة المساء`. | 1. Open `/lists/list-owned-001` with auth pending. 2. Capture first paint, DOM, and accessibility tree. 3. Resolve auth as denied. | Before valid authorization, visible UI, DOM, and accessibility tree contain no owned list names, list item names, private notes, owner identifiers, visibility state, or mutation controls. | LIST-008-US-001 | Yes | Security | Smoke cadence. |
| LIST-008-US-001-TC-004 | Closing add-place dialog restores focus to trigger | Accessibility | High | FX-LIST-008-A is loaded; dialog opened from the add-place trigger. | `A11Y-001-US-006`, close control. | 1. Open add-place dialog. 2. Close it with the close/cancel control. 3. Inspect active element. | Dialog closes and keyboard focus returns to the add-place trigger or documented safe fallback if the trigger unmounts. | LIST-008-US-001 | Yes | Accessibility | Regression cadence. Source: A11Y-001-US-006, A11Y-001-US-007. |
| LIST-008-US-001-TC-005 | Feature ownership boundary remains traceable | Traceability Verification | Medium | QA traceability review is being performed. | LIST-008, LIST-009, PLACE create/edit/delete/rating requirements. | 1. Review executable cases. 2. Confirm out-of-scope behavior is not asserted as LIST-008 behavior. | LIST-008 executable tests cover add-place search, selection, mutation handoff, create-place fallback navigation, and dialog accessibility only; place creation/edit/delete/rating and duplicate idempotency remain covered by their owning features. | LIST-008-US-001 | No | Traceability Verification | Manual Review cadence. |

## LIST-008-US-002 - Require owner to add

User Story Summary: As the system, I want users adding only to owned lists so that others' lists cannot be modified.

Related Feature ID: `LIST-008`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-008-US-002-TC-001 | Non-owner add request is denied without private list data | API, Security, Privacy, Negative | Critical | FX-LIST-008-G is loaded; `user-002` is authenticated. | `POST /api/v1/lists/list-owned-001/items`; payload `{ "placeId": "place-002" }`. | 1. Send add request as `user-002`. 2. Inspect response recursively. 3. Query owner list as `user-001` to confirm membership state. | Request is denied using the documented privacy-preserving denial behavior; response contains no `Weekend Food`, no existing `place-001` membership, no `placeCount`, no owner identity, no private notes, no audit/debug fields; owner list still contains only `place-001`. | LIST-008-US-002 | Yes | Security | Smoke cadence. Exact non-owner status remains clarified in LIST-008-XC-001 if not documented. |
| LIST-008-US-002-TC-002 | Non-owner UI cannot open actionable add controls for another user's list | UI, Security, Privacy | Critical | FX-LIST-008-G is loaded; `user-002` attempts to access or act on `list-owned-001`. | `/lists/list-owned-001` or intercepted add-place route. | 1. Open target list context as `user-002`. 2. Inspect visible UI, DOM, and accessibility tree. 3. Attempt to find add-place mutation controls. | No add-place dialog, search input tied to `list-owned-001`, list item names, private metadata, or mutation controls for the other user's list appear in visible UI, DOM, or accessibility tree. | LIST-008-US-002 | Yes | UI E2E | Smoke cadence. |
| LIST-008-US-002-TC-003 | Guest add request returns 401 and no protected payload | API, Security, Privacy, Negative | Critical | FX-LIST-008-H is loaded; no bearer token is supplied. | `POST /api/v1/lists/list-owned-001/items`; payload `{ "placeId": "place-002" }`. | 1. Send request without authentication. 2. Inspect status and body. | Response status is `401 Unauthorized`; response contains no list name, no list items, no place membership data, no owner identity, no private notes, no token, no stack trace, and no debug field. | LIST-008-US-002 | Yes | API | Smoke cadence. |
| LIST-008-US-002-TC-004 | Expired session add request exposes no protected data | API, Security, Privacy | High | FX-LIST-008-I is loaded; expired bearer token is sent. | `POST /api/v1/lists/list-owned-001/items`; payload `{ "placeId": "place-002" }`. | 1. Send add request with expired token. 2. Inspect response recursively. 3. Verify no membership was created. | Request is denied; response contains no list fields, membership rows, private notes, owner metadata, stack trace, SQL details, or debug field; `place-002` is not added. | LIST-008-US-002 | Yes | Security | Regression cadence. |

## LIST-008-US-003 - Search server-side catalog

User Story Summary: As a user, I want search to query the full catalog so that places outside the current page can be found.

Related Feature ID: `LIST-008`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-008-US-003-TC-001 | Arabic search sends server-side query and returns exact fixture | API, Search, Positive | Critical | FX-LIST-008-A is loaded; `user-001` is authenticated. | `GET /api/v1/places?q=قهوة`. | 1. Open add-place dialog. 2. Type `قهوة`. 3. Intercept/search request. 4. Inspect response. | A `GET /api/v1/places?q=%D9%82%D9%87%D9%88%D8%A9` server request is sent; response status is `200 OK`; `data` contains exactly `place-002`; response uses `{ data, meta }`. | LIST-008-US-003 | Yes | API | Smoke cadence. Source: LIST-008-US-003 and Places response envelope. |
| LIST-008-US-003-TC-002 | Search finds place not loaded in current list detail | UI, Search, Integration | Critical | FX-LIST-008-A is loaded; current list detail initially contains only `place-001`. | Query `قهوة`; expected result `place-002`. | 1. Open `/lists/list-owned-001`. 2. Open add-place dialog. 3. Search `قهوة`. 4. Inspect rendered results. | Result list shows `قهوة المساء` for `place-002` even though `place-002` was not in the current list detail; no client-only filtering of already-loaded rows is used. | LIST-008-US-003 | Yes | UI E2E | Smoke cadence. |
| LIST-008-US-003-TC-003 | English search sends exact query parameter | API, Search | High | FX-LIST-008-A is loaded. | `GET /api/v1/places?q=Burger`; expected `place-004`. | 1. Open add-place dialog. 2. Type `Burger`. 3. Inspect request URL and response. | Request contains `q=Burger`; response status is `200 OK`; `data` includes `place-004` with `name="Burger House"` and does not include private list membership fields. | LIST-008-US-003 | Yes | API | Regression cadence. |
| LIST-008-US-003-TC-004 | Mixed-language search remains server-side | API, Search, Localization | High | FX-LIST-008-J is loaded. | `GET /api/v1/places?q=Best%20برجر%202026`; expected `Best برجر 2026`. | 1. Open add-place dialog. 2. Type `Best برجر 2026`. 3. Inspect request and response. | Request is sent to `GET /api/v1/places` with the mixed-language query value; response status is `200 OK`; matching row text preserves Arabic/English order and no mojibake appears. | LIST-008-US-003 | Yes | API | Regression cadence. |

## LIST-008-US-004 - Use paginated search results

User Story Summary: As a user with a large catalog, I want add-place search to remain complete and performant.

Related Feature ID: `LIST-008`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-008-US-004-TC-001 | Many-result search returns Places collection envelope | API, Contract, Search | Critical | FX-LIST-008-D is loaded; `user-001` is authenticated. | `GET /api/v1/places?q=برجر&limit=20&offset=0`. | 1. Send search request. 2. Validate status and JSON shape. | Response status is `200 OK`; response has `data` array and `meta`; `meta.limit=20`, `meta.offset=0`, `meta.total=35`, `meta.sort` is present; `data.length <= 20`. | LIST-008-US-004 | Yes | API | Smoke cadence. Source: LIST-008-US-004 and PLACES response envelope. |
| LIST-008-US-004-TC-002 | Result rows include required safe place fields | API, Contract, Privacy | Critical | FX-LIST-008-D is loaded. | First page for query `برجر`. | 1. Send search request. 2. Inspect each returned item. | Response status is `200 OK`; each `data` item includes required safe fields needed for add-place selection: `id`, `name`, `type`; no item includes private notes, creator identity, private list membership, internal moderation fields, tokens, stack traces, SQL, or debug fields. | LIST-008-US-004 | Yes | Security | Smoke cadence. Source: PLACES private-field exclusion. |
| LIST-008-US-004-TC-003 | UI renders first bounded search page without fake continuation rows | UI, Search, Performance | High | FX-LIST-008-D is loaded. | 35 matches; first page has at most 20 results. | 1. Open add-place dialog. 2. Search `برجر`. 3. Count visible/logical result rows after first response. | UI renders no more than the bounded first-page result count from the API and does not invent placeholder place rows to represent remaining matches. | LIST-008-US-004 | Yes | UI E2E | Regression cadence. |
| LIST-008-US-004-TC-004 | Search pagination behavior beyond envelope requires clarification | Requirement Clarification | Medium | LIST-008 requires paginated envelope but does not define infinite scroll or next-page controls inside add-place search. | Pagination interaction beyond `limit`, `offset`, `total`. | 1. Review product/API requirements. 2. Confirm whether add-place dialog loads additional pages and by which interaction. | No executable LIST-008 test asserts a next-page, infinite-scroll, or continuous-scroll interaction for search results until documented. | LIST-008-US-004 | No | Requirement Clarification | Manual Review cadence. |

## LIST-008-US-005 - Preserve active search query while loading

User Story Summary: As a user, I want to understand what search result is loading.

Related Feature ID: `LIST-008`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-008-US-005-TC-001 | Loading state is tied to active Arabic query | UI, Loading, Search | High | FX-LIST-008-A is loaded; search request can be delayed. | Query `قهوة`; delayed `GET /api/v1/places?q=قهوة`. | 1. Open add-place dialog. 2. Type `قهوة`. 3. Hold search response pending. 4. Inspect loading state. | Search input value remains `قهوة`; visible or accessible loading state references the pending search state; stale prior results are not presented as final results. | LIST-008-US-005 | Yes | UI E2E | Regression cadence. |
| LIST-008-US-005-TC-002 | Earlier stale search response is not rendered as final result | UI, Search, Regression | High | Search harness can resolve responses out of order. | First query `بر`, second query `قهوة`; resolve `بر` after `قهوة`. | 1. Type `بر`. 2. Immediately replace with `قهوة`. 3. Resolve `قهوة` response with `place-002`. 4. Resolve stale `بر` response later. | Final result list remains tied to `قهوة` and shows `place-002`; stale `بر` results do not replace the active query results. | LIST-008-US-005 | Yes | UI E2E | Regression cadence. |
| LIST-008-US-005-TC-003 | Search loading state is announced accessibly | Accessibility, Loading | Medium | Add-place dialog is open and search request is pending. | `A11Y-001-US-016`. | 1. Type `قهوة`. 2. Hold response pending. 3. Inspect accessibility tree/status output. | Pending search is conveyed through visible status text, `aria-busy`, `role=status`, or equivalent; it does not rely only on animation. | LIST-008-US-005 | Yes | Accessibility | Regression cadence. Source: A11Y-001-US-016. |

## LIST-008-US-006 - Show no search results

User Story Summary: As a user, I want clear feedback when no matching place exists.

Related Feature ID: `LIST-008`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-008-US-006-TC-001 | Zero-result search renders concise empty state | UI, Empty State, Search | High | FX-LIST-008-E is loaded. | Query `Saffron Moon 999`; response `{ data: [], meta: { limit: 20, offset: 0, total: 0 } }`. | 1. Open add-place dialog. 2. Search `Saffron Moon 999`. 3. Inspect UI, DOM, and accessibility tree. | No place result rows render; UI shows a concise no-results state; DOM/accessibility tree contain no fake place row, no copied previous result, and no placeholder place ID. | LIST-008-US-006 | Yes | UI E2E | Regression cadence. |
| LIST-008-US-006-TC-002 | No-results state preserves typed query | UI, UX | Medium | FX-LIST-008-E is loaded. | Query `Saffron Moon 999`. | 1. Search the zero-result query. 2. Wait for empty response. 3. Inspect search input. | Search input still contains `Saffron Moon 999`; no-results state remains associated with that query. | LIST-008-US-006 | Yes | UI E2E | Regression cadence. |

## LIST-008-US-007 - Handle search API error

User Story Summary: As a user, I want search failures recoverable.

Related Feature ID: `LIST-008`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-008-US-007-TC-001 | Search failure keeps query and exposes retry | UI, Error Handling | High | FX-LIST-008-A is loaded; first search request fails with network error. | Query `قهوة`. | 1. Open add-place dialog. 2. Type `قهوة`. 3. Simulate network failure for search. 4. Inspect UI. | Search input still contains `قهوة`; error state is visible; retry action is visible; no item is added; no stale final result is shown. | LIST-008-US-007 | Yes | UI E2E | Regression cadence. |
| LIST-008-US-007-TC-002 | Retry reissues active search query | UI, Error Handling, Search | High | First search fails; second search succeeds with FX-LIST-008-A. | Query `قهوة`; second response includes `place-002`. | 1. Trigger failed search. 2. Activate retry. 3. Intercept retried request. 4. Resolve with `place-002`. | Retry sends `GET /api/v1/places?q=قهوة`; error state is removed; result list shows exactly `قهوة المساء`. | LIST-008-US-007 | Yes | UI E2E | Regression cadence. |
| LIST-008-US-007-TC-003 | Search error payload exposes no sensitive fields | API, Security, Error Handling | High | Test harness returns `500 Internal Server Error` for Places search. | `GET /api/v1/places?q=قهوة`. | 1. Send search request with forced server error. 2. Inspect response body. | Response status is `500 Internal Server Error`; error payload uses deterministic error envelope and contains no private notes, private list membership, creator identity, token, stack trace, SQL, raw exception, or debug field. | LIST-008-US-007 | Yes | Security | Regression cadence. |

## LIST-008-US-008 - Handle blank search query

User Story Summary: As a user, I want blank search behavior predictable.

Related Feature ID: `LIST-008`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-008-US-008-TC-001 | Empty query does not send unbounded catalog request | UI, Negative, Performance | High | FX-LIST-008-A is loaded. | Empty input `""`. | 1. Open add-place dialog. 2. Leave search input empty. 3. Observe network requests. | UI either shows an initial bounded catalog page or asks for search input; no request is sent without bounded `limit` behavior; no unbounded full-catalog response is accepted. | LIST-008-US-008 | Yes | UI E2E | Regression cadence. Source: LIST-008-US-008 and PLACE-001-US-006. |
| LIST-008-US-008-TC-002 | Whitespace-only query follows blank-query rule | UI, Validation, Negative | Medium | FX-LIST-008-A is loaded. | Input `"   "`. | 1. Open add-place dialog. 2. Enter three spaces. 3. Trigger search. 4. Inspect network and UI. | Whitespace-only input is treated as blank; UI does not show fake results and does not send an unbounded catalog request. | LIST-008-US-008 | Yes | UI E2E | Regression cadence. |
| LIST-008-US-008-TC-003 | Exact blank-query UX alternative requires implementation decision | Requirement Clarification | Medium | Source allows either bounded initial catalog page or ask-for-search-input state. | Blank input behavior. | 1. Review product decision. 2. Confirm which supported alternative is implemented. | Executable tests assert only the shared invariant: no unbounded catalog request. Product-specific copy or initial-page behavior is not asserted until chosen. | LIST-008-US-008 | No | Requirement Clarification | Manual Review cadence. |

## LIST-008-US-009 - Enforce place search length

User Story Summary: As the system, I want long search text bounded.

Related Feature ID: `LIST-008`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-008-US-009-TC-001 | Search query longer than 120 returns 422 | API, Validation, Negative | Critical | `user-001` is authenticated. | `GET /api/v1/places?q=` plus 121 `a` characters. | 1. Send request. 2. Inspect status and body. | Response status is `422 Validation Error`; response uses structured validation error payload; no `data` rows are returned. | LIST-008-US-009 | Yes | API | Smoke cadence. Source: LIST-008-US-009 and PLACE-006-US-019. |
| LIST-008-US-009-TC-002 | Long-query validation is shown in add-place dialog | UI, Validation, Accessibility | High | Add-place dialog is open. | 121-character query. | 1. Enter 121-character query. 2. Trigger search. 3. Inspect UI and accessibility tree. | Dialog shows validation/error state tied to the search input; no place is added; error exposes no private list data, token, stack trace, SQL, or debug field. | LIST-008-US-009 | Yes | Accessibility | Regression cadence. Source: A11Y-001-US-014. |
| LIST-008-US-009-TC-003 | Maximum valid 120-character search does not trigger length 422 | API, Boundary | Medium | `user-001` is authenticated. | `GET /api/v1/places?q=` plus 120 `a` characters. | 1. Send request. 2. Inspect response status. | Response status is `200 OK`; response uses the Places `{ data, meta }` envelope and is not rejected for exceeding the 120-character limit. | LIST-008-US-009 | Yes | API | Nightly cadence. |

## LIST-008-US-010 - Support special-character search safely

User Story Summary: As the system, I want search characters handled safely.

Related Feature ID: `LIST-008`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-008-US-010-TC-001 | Percent and underscore search characters are handled safely | API, Security, Search | High | `user-001` is authenticated. | `GET /api/v1/places?q=%25_%5C`. | 1. Send search query containing `%`, `_`, and backslash. 2. Inspect status and body. | Response status is `200 OK`; response uses the Places `{ data, meta }` envelope; it does not return stack trace, SQL, raw exception, token, or debug field. | LIST-008-US-010 | Yes | Security | Regression cadence. |
| LIST-008-US-010-TC-002 | Arabic special-character search remains contained in UI | UI, Security, Localization | High | FX-LIST-008-J is loaded. | Query `قهوة_%`. | 1. Open add-place dialog. 2. Enter query. 3. Inspect visible UI width and rendered text. | Search input and result/error text render without mojibake, script execution, layout break, or horizontal overflow. | LIST-008-US-010 | Yes | UI E2E | Regression cadence. |
| LIST-008-US-010-TC-003 | Mixed-language result text preserves bidi order | UI, Localization, Accessibility | Medium | FX-LIST-008-J is loaded. | Query `Best برجر`; result `Best برجر 2026`. | 1. Search mixed-language query. 2. Inspect visible row and accessible name. | Result row displays `Best برجر 2026` without character corruption; accessible name contains the same visible place name. | LIST-008-US-010 | Yes | Accessibility | Nightly cadence. |

## LIST-008-US-011 - Select exactly one place

User Story Summary: As Product, I want one add action to target one place and one list so that scope stays simple.

Related Feature ID: `LIST-008`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-008-US-011-TC-001 | Add request payload contains only selected place and current list | API, Contract, Positive | Critical | FX-LIST-008-A is loaded; search result `place-002` is rendered. | `POST /api/v1/lists/list-owned-001/items`; payload `{ "placeId": "place-002" }`. | 1. Search `قهوة`. 2. Click add for `place-002`. 3. Intercept add request payload and response. | Request URL targets only `list-owned-001`; JSON payload is exactly `{ "placeId": "place-002" }`; response status is `201 Created`; request does not include other result IDs, list name, owner ID, visibility, rating data, private notes, or client-generated membership IDs. | LIST-008-US-011 | Yes | API | Smoke cadence. |
| LIST-008-US-011-TC-002 | UI exposes one add action per result row | UI, UX | High | FX-LIST-008-D is loaded; many results render. | First-page search results for `برجر`. | 1. Search `برجر`. 2. Inspect each visible result row. | Each actionable result row has one add control associated with that row's place ID; activating a row add control does not select multiple places. | LIST-008-US-011 | Yes | UI E2E | Regression cadence. |
| LIST-008-US-011-TC-003 | Multi-select add behavior remains out of scope | Traceability Verification | Low | Product scope says one add action targets one place and one list. | Bulk add or multi-select behavior. | 1. Review LIST-008 tests. 2. Confirm no executable bulk-add assertion exists. | No LIST-008 executable test asserts bulk add, multi-select, or adding one place to multiple lists. | LIST-008-US-011 | No | Traceability Verification | Manual Review cadence. |

## LIST-008-US-012 - Reject missing place ID

User Story Summary: As the system, I want invalid add payloads rejected.

Related Feature ID: `LIST-008`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-008-US-012-TC-001 | Missing placeId add payload is rejected | API, Validation, Negative | High | FX-LIST-008-A is loaded; `user-001` is authenticated. | `POST /api/v1/lists/list-owned-001/items`; payload `{}`. | 1. Send request. 2. Inspect response. 3. Query list detail. | API returns validation error; no list item is created; `list-owned-001` still contains only `place-001`; response contains no stack trace, SQL, token, or debug field. | LIST-008-US-012 | Yes | API | Regression cadence. |
| LIST-008-US-012-TC-002 | Empty placeId add payload is rejected | API, Validation, Negative | High | FX-LIST-008-A is loaded. | `POST /api/v1/lists/list-owned-001/items`; payload `{ "placeId": "" }`. | 1. Send request. 2. Inspect response and list detail. | API returns validation error; no list item is created; `place-002` is absent from `list-owned-001`. | LIST-008-US-012 | Yes | API | Regression cadence. |
| LIST-008-US-012-TC-003 | Missing-placeId validation is announced in dialog | UI, Validation, Accessibility | Medium | Add-place dialog is open; test harness can submit malformed payload. | Payload with missing `placeId`. | 1. Trigger malformed add submission. 2. Inspect dialog UI and accessibility tree. | Validation/error state is visible; error is associated with the action or result row and announced through accessible error text or live region; no optimistic row is added. | LIST-008-US-012 | Yes | Accessibility | Nightly cadence. Source: A11Y-001-US-014. |

## LIST-008-US-013 - Reject nonexistent place ID

User Story Summary: As the system, I want adding nonexistent places rejected.

Related Feature ID: `LIST-008`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-008-US-013-TC-001 | Nonexistent placeId returns not found and creates no item | API, Negative, Data Integrity | High | FX-LIST-008-A is loaded; `place-missing-999` does not exist. | `POST /api/v1/lists/list-owned-001/items`; payload `{ "placeId": "place-missing-999" }`. | 1. Send request. 2. Inspect response. 3. Query list detail. | API returns not found; no list item is created; `list-owned-001` still contains only `place-001`; error payload contains no private list data, stack trace, SQL, or debug field. | LIST-008-US-013 | Yes | API | Regression cadence. |
| LIST-008-US-013-TC-002 | Deleted place cannot be added if search result is stale | UI, API, Negative | High | `place-005` appeared in search response but is deleted before add. | `POST /api/v1/lists/list-owned-001/items`; payload `{ "placeId": "place-005" }`. | 1. Render stale result for `place-005`. 2. Delete fixture place before add. 3. Activate add. 4. Inspect response and UI. | Add request returns not found; dialog shows an error state; stale place is not added and no optimistic membership remains. | LIST-008-US-013 | Yes | UI E2E | Regression cadence. Deleted-place add is an add-endpoint integrity scenario, not place deletion ownership. |
| LIST-008-US-013-TC-003 | Exact not-found status for nonexistent place requires contract confirmation if unspecified | Requirement Clarification | Medium | Source says API returns not found but does not state exact numeric status in LIST-008 row. | Candidate `404 Not Found`. | 1. Review API contract. 2. Confirm exact numeric status for nonexistent `placeId`. | Executable tests assert not-found semantics and no item creation; exact `404` is asserted only if API contract documents it. | LIST-008-US-013 | No | Requirement Clarification | Manual Review cadence. |

## LIST-008-US-014 - Mark already-added places

User Story Summary: As a user, I want to know if a result is already in the list so that I do not repeat work.

Related Feature ID: `LIST-008`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-008-US-014-TC-001 | Already-added search result is marked in UI | UI, Data Integrity | High | FX-LIST-008-F is loaded. | Search `مطعم`; result `place-001` is already in `list-owned-001`. | 1. Open add-place dialog. 2. Search `مطعم`. 3. Inspect row for `place-001`. | Row for `مطعم الرياض` visibly indicates already-added state or has duplicate add action disabled; it remains associated with `place-001`. | LIST-008-US-014 | Yes | UI E2E | Regression cadence. |
| LIST-008-US-014-TC-002 | Already-added state is exposed accessibly | Accessibility, UI | High | FX-LIST-008-F is loaded. | Result row `place-001`. | 1. Search `مطعم`. 2. Inspect row accessible name/state. | Assistive technology can determine that `مطعم الرياض` is already in the current list, either through accessible text or disabled state on the add control. | LIST-008-US-014 | Yes | Accessibility | Regression cadence. |
| LIST-008-US-014-TC-003 | Duplicate add mutation idempotency remains LIST-009-owned | Traceability Verification | High | LIST-009 defines duplicate add statuses, database uniqueness, races, and count stability. | LIST-009-US-001 through LIST-009-US-010. | 1. Review LIST-008 duplicate UI rows. 2. Review LIST-009 idempotency tests. | LIST-008 validates already-added indication in the add-place flow; executable assertions for repeat-add `200`, race recovery, database uniqueness, and count stability remain LIST-009-owned. | LIST-008-US-014 | No | Traceability Verification | Manual Review cadence. |

## LIST-008-US-015 - Add selected place successfully

User Story Summary: As a user, I want to add a selected place so that the list gains that item.

Related Feature ID: `LIST-008`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-008-US-015-TC-001 | Successful add returns 201 and created membership | API, Positive, Contract | Critical | FX-LIST-008-A is loaded; `place-002` is not in `list-owned-001`. | `POST /api/v1/lists/list-owned-001/items`; payload `{ "placeId": "place-002" }`. | 1. Send request as `user-001`. 2. Inspect status and response JSON. 3. Query list detail. | Response status is `201 Created`; returned item identifies `list-owned-001` and `place-002`; list detail now contains exactly `place-001` and `place-002` with no duplicate row. | LIST-008-US-015 | Yes | API | Smoke cadence. Source: LIST-008-US-015 and LIST-009-US-002. |
| LIST-008-US-015-TC-002 | Successful add response excludes forbidden fields | API, Security, Privacy | Critical | FX-LIST-008-A is loaded. | Add `place-002` to `list-owned-001`. | 1. Send successful add request. 2. Recursively inspect response JSON. | Response status is `201 Created`; response contains no private notes, other users' list memberships, creator identity, owner email, internal auth IDs, session tokens, audit/debug fields, moderation fields, stack traces, or SQL details. | LIST-008-US-015 | Yes | Security | Smoke cadence. |
| LIST-008-US-015-TC-003 | UI add success updates list detail row count once | UI, Integration, Data Integrity | Critical | FX-LIST-008-A is loaded; LIST-007 detail baseline has one item. | Search `قهوة`; add `place-002`. | 1. Open `/lists/list-owned-001`. 2. Open add-place dialog. 3. Search `قهوة`. 4. Add `place-002`. 5. Inspect list detail after refresh. | Add succeeds; dialog closes or confirms success per UI design; list detail shows exactly two rows: `مطعم الرياض` and `قهوة المساء`; `قهوة المساء` appears once. | LIST-008-US-015 | Yes | UI E2E | Smoke cadence. Integration references LIST-007 row rendering. |
| LIST-008-US-015-TC-004 | Add succeeds into empty list | API, UI, Boundary | High | FX-LIST-008-B is loaded; `list-empty-001` has no items. | Add `place-002` with payload `{ "placeId": "place-002" }`. | 1. Open `/lists/list-empty-001`. 2. Search `قهوة`. 3. Add `place-002`. 4. Inspect API and detail UI. | API returns `201 Created`; list detail place count changes from `0` to `1`; exactly one row `قهوة المساء` is present. | LIST-008-US-015 | Yes | UI E2E | Regression cadence. |
| LIST-008-US-015-TC-005 | Add succeeds into populated list without removing existing items | API, UI, Data Integrity | High | FX-LIST-008-C is loaded; `list-populated-001` contains `place-001` and `place-004`. | Add `place-002`. | 1. Open `/lists/list-populated-001`. 2. Search `قهوة`. 3. Add `place-002`. 4. Inspect refreshed detail. | API returns `201 Created`; detail contains `place-001`, `place-004`, and `place-002`; existing rows remain and `place-002` appears once. | LIST-008-US-015 | Yes | UI E2E | Regression cadence. |

## LIST-008-US-016 - Preserve dialog state after add failure

User Story Summary: As a user, I want to retry add failures without repeating search.

Related Feature ID: `LIST-008`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-008-US-016-TC-001 | Add network failure preserves query and result list | UI, Error Handling | High | FX-LIST-008-A is loaded; search `قهوة` succeeded; add request fails with network error. | Query `قهوة`, result `place-002`. | 1. Search `قهوة`. 2. Activate add for `place-002`. 3. Fail add request. 4. Inspect dialog state. | Dialog remains usable; input still contains `قهوة`; result row `قهوة المساء` remains visible; error state is shown; no optimistic list row is added. | LIST-008-US-016 | Yes | UI E2E | Regression cadence. |
| LIST-008-US-016-TC-002 | Add 5xx failure exposes privacy-safe error payload | API, Security, Error Handling | High | Test harness forces `500 Internal Server Error` for add endpoint. | `POST /api/v1/lists/list-owned-001/items`; payload `{ "placeId": "place-002" }`. | 1. Send add request. 2. Inspect response body. 3. Query list detail. | Response status is `500 Internal Server Error`; error payload follows deterministic error envelope; it contains no membership data, private notes, owner identity, token, SQL, stack trace, or debug field; list membership is unchanged. | LIST-008-US-016 | Yes | Security | Regression cadence. |
| LIST-008-US-016-TC-003 | Retry after add failure reuses selected place and current list | UI, Error Handling, Regression | Medium | First add request fails; second add request succeeds. | Query `قهوة`; selected `place-002`; list `list-owned-001`. | 1. Search `قهوة`. 2. Trigger failed add. 3. Activate retry/add again. 4. Intercept second request. | Second request targets `POST /api/v1/lists/list-owned-001/items` with payload `{ "placeId": "place-002" }`; on success, list detail contains `place-002` once. | LIST-008-US-016 | Yes | UI E2E | Regression cadence. |

## LIST-008-US-017 - Offer create-place fallback on no results

User Story Summary: As a user, I want to add a new place when search cannot find it so that I can continue my task.

Related Feature ID: `LIST-008`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-008-US-017-TC-001 | No-results state shows exact Arabic fallback copy and action | UI, Empty State, Localization | High | FX-LIST-008-E is loaded. | Query `Saffron Moon 999`. | 1. Search zero-result query. 2. Inspect no-results region. | No-results region shows exact text `لم تجد المكان؟` and one action labeled `إضافة مكان جديد`; no fake place rows render. | LIST-008-US-017 | Yes | UI E2E | Regression cadence. |
| LIST-008-US-017-TC-002 | Create-place fallback action is separate from search results | UI, UX, Feature Ownership | High | FX-LIST-008-E is loaded. | Zero-result response. | 1. Search zero-result query. 2. Inspect semantic structure. | The `إضافة مكان جديد` action is rendered as a separate fallback action, not as a result row with a fake `placeId`. | LIST-008-US-017 | Yes | UI E2E | Regression cadence. |
| LIST-008-US-017-TC-003 | No-results fallback is keyboard reachable | Accessibility, Empty State | Medium | FX-LIST-008-E is loaded; no-results state visible. | `A11Y-001-US-004`, `RESP-003-US-003`. | 1. Navigate inside the dialog with keyboard. 2. Reach no-results fallback. 3. Inspect focus-visible state. | The fallback action is reachable by keyboard, has visible focus, and can be activated with Enter or Space where applicable. | LIST-008-US-017 | Yes | Accessibility | Regression cadence. |

## LIST-008-US-018 - Prefill create-place from search where appropriate

User Story Summary: As a user, I want my search text reused so that creating the missing place is faster.

Related Feature ID: `LIST-008`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-008-US-018-TC-001 | Create-place fallback opens create flow with valid draft query | UI, Navigation, Integration | Medium | FX-LIST-008-E is loaded; query is valid as a place-name draft. | Query `Saffron Moon 999`. | 1. Search `Saffron Moon 999`. 2. Activate `إضافة مكان جديد`. 3. Inspect navigation target and initial create-place state. | User is handed off to the Create Place flow; the draft name value is `Saffron Moon 999` where the supported prefill integration is enabled; LIST-008 does not assert save behavior. | LIST-008-US-018 | Yes | UI E2E | Nightly cadence. |
| LIST-008-US-018-TC-002 | Create-place save behavior remains PLACE-owned | Traceability Verification | High | Create-place fallback can navigate to Place creation. | PLACE-009, PLACE-010, PLACE-011 creation requirements. | 1. Review LIST-008 create-place fallback tests. 2. Review PLACE creation test packages. | LIST-008 validates only fallback navigation and optional draft handoff; creating, validating, saving, duplicate detection, and post-save place detail routing remain PLACE-owned. | LIST-008-US-018 | No | Traceability Verification | Manual Review cadence. |
| LIST-008-US-018-TC-003 | Invalid draft prefill handling requires clarification | Requirement Clarification | Medium | Source says prefill where query is valid as a place-name draft but does not define all invalid-draft cases. | Query with only special characters `%_%`. | 1. Review create-place draft validation requirements. 2. Confirm whether invalid search query is passed, sanitized, or omitted. | No executable LIST-008 test asserts invalid draft prefill behavior until documented. | LIST-008-US-018 | No | Requirement Clarification | Manual Review cadence. |

## LIST-008-US-019 - Keep no-results fallback honest

User Story Summary: As Product, I want no fake search results so that catalog trust is preserved.

Related Feature ID: `LIST-008`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-008-US-019-TC-001 | Zero-result response renders no fake or placeholder place rows | UI, Empty State, Data Integrity | High | FX-LIST-008-E is loaded. | Response `{ data: [], meta: { total: 0 } }`. | 1. Search `Saffron Moon 999`. 2. Inspect result list, DOM, and accessibility tree. | Result list contains zero place rows; DOM/accessibility tree contain no placeholder `placeId`, fake place name, copied previous result, or selectable result row. | LIST-008-US-019 | Yes | UI E2E | Regression cadence. |
| LIST-008-US-019-TC-002 | No-results state does not call add endpoint | UI, Negative, Data Integrity | High | FX-LIST-008-E is loaded. | Zero-result search state. | 1. Search `Saffron Moon 999`. 2. Observe network while no-results state renders. 3. Do not activate create-place fallback. | No `POST /api/v1/lists/list-owned-001/items` request is sent from the no-results state itself. | LIST-008-US-019 | Yes | UI E2E | Regression cadence. |
| LIST-008-US-019-TC-003 | No-results fallback exposes no private or hidden metadata | Security, Privacy, UI | Medium | FX-LIST-008-E is loaded. | Zero-result state. | 1. Render no-results state. 2. Inspect UI, DOM, and accessibility tree. | No-results state contains no private notes, private list membership, owner identity, internal IDs, hidden moderation fields, audit/debug data, token, stack trace, or SQL details. | LIST-008-US-019 | Yes | Security | Nightly cadence. |

## LIST-008-US-020 - Keep add-place dialog accessible and mobile-safe

User Story Summary: As a mobile keyboard or screen-reader user, I want add-place usable.

Related Feature ID: `LIST-008`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-008-US-020-TC-001 | Search input has explicit accessible label | Accessibility | Critical | FX-LIST-008-A is loaded; add-place dialog is open. | Search input. | 1. Inspect visible label and accessibility tree. | Search input has an accessible name matching its visible purpose to search existing places; label is not empty and does not rely only on placeholder text. | LIST-008-US-020 | Yes | Accessibility | Smoke cadence. |
| LIST-008-US-020-TC-002 | Result list uses semantic list structure | Accessibility | High | FX-LIST-008-A is loaded; search `قهوة` returns `place-002`. | Result list with one row. | 1. Search `قهوة`. 2. Inspect accessibility tree. | Results are exposed as a list/listbox or equivalent semantic collection; result `قهوة المساء` has an accessible name and its add control is associated with that row. | LIST-008-US-020 | Yes | Accessibility | Regression cadence. |
| LIST-008-US-020-TC-003 | Keyboard user can search and add selected result | Accessibility, UI | Critical | FX-LIST-008-A is loaded. | Query `قهوة`; result `place-002`. | 1. Open dialog. 2. Tab to search input. 3. Type query. 4. Tab to `place-002` add control. 5. Activate with Enter or Space. | Keyboard path completes add request for `place-002`; focus-visible appears on each focused control; resulting list detail contains `place-002` once. | LIST-008-US-020 | Yes | Accessibility | Smoke cadence. Source: RESP-003-US-003. |
| LIST-008-US-020-TC-004 | Search result and error announcements use live/status semantics | Accessibility, Loading, Error Handling | High | Add-place dialog can render loading, results, empty, and error states. | `A11Y-001-US-014`, `A11Y-001-US-016`. | 1. Trigger loading search. 2. Resolve with one result. 3. Trigger failed search. 4. Inspect live/status behavior. | Loading, result count, no-results, validation, and error states are announced through visible status text, `role=status`, `role=alert`, `aria-live`, `aria-busy`, or equivalent accessible pattern. | LIST-008-US-020 | Yes | Accessibility | Regression cadence. |
| LIST-008-US-020-TC-005 | Add-place dialog fits required mobile viewport matrix | Responsive, Mobile | Critical | FX-LIST-008-A is loaded; add-place dialog opens. | Viewports `320x568`, `390x844`, `430x932`; query `قهوة`. | 1. Set each viewport. 2. Open dialog. 3. Search `قهوة`. 4. Inspect width and action reachability. | At each viewport, `document.documentElement.scrollWidth <= window.innerWidth`; search input, result row, add button, close/cancel, and fallback/error states are visible or reachable without horizontal scrolling. | LIST-008-US-020 | Yes | UI E2E | Smoke cadence. Source: RESP-002-US-001, RESP-002-US-002, RESP-002-US-010, RESP-002-US-011. |
| LIST-008-US-020-TC-006 | Add-place dialog remains usable in phone landscape | Responsive, Mobile | High | FX-LIST-008-A is loaded. | Landscape phone viewport; query `قهوة`. | 1. Set landscape viewport. 2. Open dialog. 3. Search. 4. Inspect modal bounds and controls. | No horizontal overflow occurs; dialog/sheet content scrolls internally if needed; search input, result row, close/cancel, and add controls remain reachable. | LIST-008-US-020 | Yes | UI E2E | Regression cadence. Source: RESP-002-US-012. |
| LIST-008-US-020-TC-007 | Add-place dialog works at 200% zoom | Responsive, Accessibility | High | FX-LIST-008-J is loaded. | 200% browser zoom; long Arabic and mixed result names. | 1. Set 200% zoom. 2. Open dialog. 3. Search long/mixed fixture. 4. Inspect scroll width and controls. | `document.documentElement.scrollWidth <= window.innerWidth`; search, result rows, close/cancel, and add controls remain operable; long Arabic/mixed names are contained without overlapping actions. | LIST-008-US-020 | Yes | Accessibility | Regression cadence. Source: RESP-003-US-001, RESP-003-US-002, RESP-003-US-005, RESP-003-US-007, RESP-003-US-009. |
| LIST-008-US-020-TC-008 | Touch targets meet global minimum | Accessibility, Mobile | High | FX-LIST-008-A is loaded at `390x844`. | Add-place trigger, close/cancel, result add controls, fallback action. | 1. Open dialog. 2. Search `قهوة`. 3. Measure interactive target boxes. | Each add-place dialog control has at least a `44x44` CSS pixel hit target or equivalent effective target area. | LIST-008-US-020 | Yes | Accessibility | Regression cadence. Source: RESP-003-US-008 and Touch Targets section. |
| LIST-008-US-020-TC-009 | Forced colors preserve controls and focus | Accessibility, Responsive | Medium | FX-LIST-008-A is loaded; forced-colors mode active. | Dialog with search results and error state. | 1. Enable forced colors. 2. Open dialog. 3. Search, focus controls, and show error. | Text, input border, selected/already-added state, buttons, error text, and focus indicator remain distinguishable. | LIST-008-US-020 | Yes | Accessibility | Nightly cadence. Source: RESP-003-US-014, RESP-003-US-015. |
| LIST-008-US-020-TC-010 | Reduced motion preserves add-place functionality | Accessibility, UX | Medium | FX-LIST-008-A is loaded; `prefers-reduced-motion` active. | Search `قهوة`; add `place-002`. | 1. Enable reduced motion. 2. Open dialog. 3. Search and add. | Flow completes without relying on nonessential animation; loading/result/error states remain understandable through text/status, not motion alone. | LIST-008-US-020 | Yes | Accessibility | Nightly cadence. Source: RESP-003-US-016, RESP-003-US-017. |

## Cross-Feature Clarification and Traceability Cases

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-008-XC-001 | Exact non-owner add status requires API contract confirmation | Requirement Clarification | High | LIST-008 requires denial without private list data but does not state one numeric status for non-owner add. | Candidate `403` or privacy-preserving `404`. | 1. Review API contract and backend route policy. 2. Document exact status. | No executable LIST-008 test asserts `403` or `404` for non-owner add until the exact status is documented. | LIST-008-US-002 | No | Requirement Clarification | Manual Review cadence. |
| LIST-008-XC-002 | Search ranking remains Places-owned unless explicitly linked | Traceability Verification | Medium | Add-place search uses `GET /api/v1/places`; ranking behavior is owned by Places search requirements. | PLACE-006 search ranking requirements. | 1. Review LIST-008 search tests. 2. Review PLACE-006 ranking tests. | LIST-008 validates server-side search, envelope, safe query handling, and expected fixture presence; custom ranking order is not asserted here unless linked by Places requirements. | LIST-008-US-003 | No | Traceability Verification | Manual Review cadence. |
| LIST-008-XC-003 | Add-after-removal scenario belongs to remove/idempotency integration | Traceability Verification | Medium | Add after removal depends on LIST-010 removal and LIST-009 idempotency semantics. | Place removed from list, then added again. | 1. Review LIST-010 remove behavior. 2. Review LIST-009 idempotency. 3. Confirm whether LIST-008 needs a documented integration case. | LIST-008 does not assert remove behavior; add-after-removal may be covered as integration only after LIST-010 removes the membership and LIST-008 receives a normal not-already-added result. | LIST-008-US-015 | No | Traceability Verification | Manual Review cadence. |

## Final Summary

1. User stories processed: 20
2. Total executable test cases: 65
3. Clarification / Manual / Traceability cases: 11
4. Total test cases: 76
5. Test count per user story:
   - LIST-008-US-001: 5
   - LIST-008-US-002: 5
   - LIST-008-US-003: 5
   - LIST-008-US-004: 4
   - LIST-008-US-005: 3
   - LIST-008-US-006: 2
   - LIST-008-US-007: 3
   - LIST-008-US-008: 3
   - LIST-008-US-009: 3
   - LIST-008-US-010: 3
   - LIST-008-US-011: 3
   - LIST-008-US-012: 3
   - LIST-008-US-013: 3
   - LIST-008-US-014: 3
   - LIST-008-US-015: 6
   - LIST-008-US-016: 3
   - LIST-008-US-017: 3
   - LIST-008-US-018: 3
   - LIST-008-US-019: 3
   - LIST-008-US-020: 10
6. Count by test type:
   - Accessibility: 17
   - API: 22
   - Boundary: 2
   - Contract: 4
   - Data Integrity: 6
   - Empty State: 4
   - Error Handling: 7
   - Feature Ownership: 1
   - Integration: 3
   - Localization: 4
   - Loading: 3
   - Mobile: 3
   - Navigation: 1
   - Negative: 10
   - Performance: 2
   - Positive: 4
   - Privacy: 8
   - Regression: 2
   - Requirement Clarification: 5
   - Responsive: 4
   - Search: 11
   - Security: 11
   - Traceability Verification: 6
   - UI: 33
   - UX: 4
   - Validation: 6
7. Count by priority:
   - Critical: 18
   - High: 38
   - Medium: 19
   - Low: 1
8. Count by automation layer:
   - Accessibility: 16
   - API: 12
   - Requirement Clarification: 5
   - Security: 9
   - Traceability Verification: 6
   - UI E2E: 28
9. Top automation candidates:
   - API contract tests for `GET /api/v1/places?q=...` envelope, required fields, validation, and privacy exclusions.
   - API contract tests for `POST /api/v1/lists/{id}/items` payload shape, `201 Created`, auth denial, validation, not-found, and forbidden fields.
   - UI E2E happy path: open dialog, search `قهوة`, add `place-002`, refresh list detail to exactly two rows.
   - Accessibility automation for modal semantics, search input label, focus trap/restoration, live announcements, keyboard selection, and touch targets.
   - Responsive automation for 320px, 390px, 430px, landscape, 200% zoom, safe areas, and no horizontal overflow.

## Validation

- Duplicate Test IDs = 0
- Invalid Story References = 0
- Missing User Stories = 0
- Encoding/Mojibake = 0
- API Tests Missing Status Codes = 0
- Requirement Fidelity Violations = 0
- Feature Ownership Violations = 0
