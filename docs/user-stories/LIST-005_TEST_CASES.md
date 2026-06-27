# LIST-005 Test Cases

Feature: `LIST-005 - Change public/private visibility`

Source: `docs/user-stories/LISTS_USER_STORIES.md`

Supporting Sources:

- `docs/feature-map/FEATURE_TRACEABILITY.md`
- `docs/user-stories/PUBLIC_LISTS_USER_STORIES.md`
- `docs/user-stories/PROFILE_USER_STORIES.md`
- `docs/user-stories/PLACE_DETAILS_USER_STORIES.md`
- `docs/user-stories/RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`

Scope: All user stories under `LIST-005`.

## QA Execution Standards

- Test cases validate documented requirements only. Undefined behavior is captured as Requirement Clarification, Manual Verification, or Traceability Verification.
- `LIST-005` owns changing an owned list's visibility, visibility validation, visibility response, visibility persistence, privacy-safe visibility state, and direct public-list eligibility effects documented in LIST-005.
- `LIST-005` does not own list creation, rename, delete, public-list page rendering, profile rendering, place-detail containing-list rendering, search indexing, browser history, or cache invalidation timing.
- Visibility endpoint from traceability: `PATCH /api/v1/lists/{id}/visibility` with Bearer authentication, frontend consumer `EditListDialog.tsx`, backend service `update_owned_list_visibility`.
- Approved visibility values are exactly `private` and `public`.
- Public visibility makes a list eligible for public-list endpoints; private visibility removes that eligibility.
- Public responses may expose `ownerDisplayName` only and must not expose owner email, refresh-token data, or private account data.
- Privacy-preserving non-owner denial status is not specified by LIST-005; executable tests assert denial, no mutation, and no private data leakage, while exact `403 Forbidden` versus `404 Not Found` remains a clarification.
- Executable responsive/accessibility tests cite exact approved global requirements.
- Automation cadence values used in Notes: Smoke, Regression, Nightly, Manual Review.

## Deterministic Visibility Fixtures

| Fixture ID | User Context | Existing List State | Request / UI Input | Expected Result |
|---|---|---|---|---|
| Fixture A | `user-001` authenticated owner | `list-private-001`, name `Weekend Food`, visibility `private`, owner `user-001`, placeCount `3`, updatedAt `2026-06-24T10:00:00Z` | `PATCH /api/v1/lists/list-private-001/visibility` body `{ "visibility": "public" }` | `200 OK`; response `data.id="list-private-001"`, `data.name="Weekend Food"`, `data.visibility="public"`, `data.placeCount=3`, `data.updatedAt` changes; no private notes/debug fields returned. |
| Fixture B | `user-001` authenticated owner | `list-public-001`, name `Riyadh Cafes`, visibility `public`, owner `user-001`, placeCount `5`, updatedAt `2026-06-24T11:00:00Z` | `PATCH /api/v1/lists/list-public-001/visibility` body `{ "visibility": "private" }` | `200 OK`; response `data.id="list-public-001"`, `data.name="Riyadh Cafes"`, `data.visibility="private"`, `data.placeCount=5`, `data.updatedAt` changes; no private notes/debug fields returned. |
| Fixture C | `user-001` authenticated owner | `list-public-002`, name `Already Public`, visibility `public`, owner `user-001`, placeCount `1` | `PATCH /api/v1/lists/list-public-002/visibility` body `{ "visibility": "public" }` | Same-visibility save behavior is not documented and must remain clarification until product defines expected status and mutation semantics. |
| Fixture D | `user-001` authenticated owner | `list-private-002`, name `Invalid Visibility`, visibility `private`, owner `user-001`, placeCount `2` | `PATCH /api/v1/lists/list-private-002/visibility` body `{ "visibility": "team" }` | `422 Validation Error`; existing visibility remains `private`. |
| Fixture E | no authenticated session | `list-private-001` exists | `PATCH /api/v1/lists/list-private-001/visibility` body `{ "visibility": "public" }` | `401 Unauthorized`; no list data returned; existing visibility remains unchanged. |
| Fixture F | expired session for `user-001` | Cached owned list `list-private-001` may exist client-side | Attempt to change visibility to `public` | `401 Unauthorized`; protected UI clears before showing signed-out state; no private-data flash. |
| Fixture G | `user-002` authenticated non-owner | `list-private-owner-001` belongs to `user-001`, name `Owner Private`, visibility `private`, placeCount `4` | `PATCH /api/v1/lists/list-private-owner-001/visibility` body `{ "visibility": "public" }` | Access denied; status exactness requires clarification; no mutation; no private list data exposed. |
| Fixture H | `user-002` authenticated public viewer | `list-public-001` exists before privacy change | Fresh `GET /api/v1/lists/public` and `GET /api/v1/lists/public/list-public-001` after Fixture B succeeds | Index excludes `list-public-001`; detail returns `404 Not Found` with safe error shape. |
| Fixture I | `user-002` authenticated public viewer | `list-private-001` exists before public change | Fresh `GET /api/v1/lists/public` and `GET /api/v1/lists/public/list-private-001` after Fixture A succeeds | Public detail returns `200 OK`; public-safe response includes `ownerDisplayName` only for owner identity. |
| Fixture J | `user-001` authenticated owner | `list-flaky-001`, name `Retry Privacy`, visibility `private`, placeCount `2` | UI selects `public`; API returns network error or `500 Internal Server Error` | Persisted visibility remains `private`; attempted selection `public` remains visible for retry. |
| Fixture K | `user-001` authenticated owner | `list-private-003`, name `Cancel Privacy`, visibility `private`, placeCount `2` | UI selects `public`, then cancels | Zero `PATCH /api/v1/lists/list-private-003/visibility` requests; persisted visibility remains `private`. |

## LIST-005-US-001 - Show current visibility

User Story Summary: As a list owner, I want to see current visibility so that I know who can view the list.

Related Feature ID: `LIST-005`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-005-US-001-TC-001 | Edit flow shows current private visibility selected | UI, Positive, Accessibility | High | `user-001` owns Fixture A list. | `list-private-001`, visibility `private`. | 1. Sign in as `user-001`. 2. Open edit dialog/sheet for `list-private-001`. 3. Inspect visible state and accessibility tree. | Visibility control shows `private` as the selected value; `public` is not selected; accessible selected state announces `private`; zero `PATCH /api/v1/lists/list-private-001/visibility` requests are sent before save. | LIST-005-US-001 | Yes | UI E2E | Smoke cadence. Source: LIST-005-US-001, LIST-005-US-012. |
| LIST-005-US-001-TC-002 | Edit flow shows current public visibility selected | UI, Positive, Accessibility | High | `user-001` owns Fixture B list. | `list-public-001`, visibility `public`. | 1. Sign in as `user-001`. 2. Open edit dialog/sheet for `list-public-001`. 3. Inspect visible state and accessibility tree. | Visibility control shows `public` as the selected value; `private` is not selected; accessible selected state announces `public`; zero `PATCH /api/v1/lists/list-public-001/visibility` requests are sent before save. | LIST-005-US-001 | Yes | UI E2E | Smoke cadence. Source: LIST-005-US-001, LIST-005-US-012. |
| LIST-005-US-001-TC-003 | Current visibility label contains no private metadata | UI, Security, Privacy | Critical | `user-001` owns Fixture A list and edit dialog is open. | Visibility selector labels. | 1. Inspect DOM text. 2. Inspect accessibility tree. 3. Inspect initial API response used by edit flow. | Visibility label and selected-state text contain only `private` or `public`; they contain no owner email, internal user ID, refresh token, session token, private notes, moderation fields, audit fields, or debug fields. | LIST-005-US-001 | Yes | Security | Smoke cadence. |
| LIST-005-US-001-TC-004 | No private data flash during auth resolution | UI, Security, Privacy | Critical | Auth state is pending or expired and previously cached private list data exists. | Cached list `Owner Private`; pending auth resolution. | 1. Open LIST-005 UI entry point with auth unresolved. 2. Capture first paint, DOM, and accessibility tree. 3. Resolve auth as denied. | Before valid authorization, DOM and accessibility tree contain zero owned list names, item names, private notes, owner identifiers, visibility values, or mutation controls. | LIST-005-US-001 | Yes | Security | Smoke cadence. |
| LIST-005-US-001-TC-005 | Same-visibility save behavior requires product decision | Requirement Clarification, Manual | Medium | `user-001` owns Fixture C list. | Fixture C request. | 1. Review LIST-005 requirements. 2. Confirm whether saving the already selected visibility sends a request, returns `200 OK`, is disabled, or is treated as no-op. | No executable same-visibility assertion is added until expected product behavior is documented. | LIST-005-US-001 | No | Manual | Manual Review cadence. |
| LIST-005-US-001-TC-006 | Feature ownership boundary is traceable | Traceability Verification, Manual | Medium | QA traceability review is being performed. | LIST-005, PUBLIC-*, PROFILE-*, PLACE-018. | 1. Review LIST-005 scope. 2. Map visibility, public browsing, profile rendering, and place-detail ownership. 3. Confirm out-of-scope behavior is covered elsewhere. | LIST-005 executable tests stay inside visibility mutation, validation, response, persistence, privacy-safe state, and directly documented public eligibility effects. Public page rendering, profile rendering, place-detail containing-list display, cache timing, and search/indexing remain separate packages or clarification. | LIST-005-US-001 | No | Manual | Manual Review cadence. |

## LIST-005-US-002 - Require owner for visibility change

User Story Summary: As the system, I want only owners changing visibility so that privacy cannot be bypassed.

Related Feature ID: `LIST-005`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-005-US-002-TC-001 | Guest visibility update returns 401 | API, Authentication, Security, Negative | Critical | No Bearer token is supplied. | Fixture E request. | 1. Send `PATCH /api/v1/lists/list-private-001/visibility` without authentication. 2. Inspect status and payload. 3. Fetch list as `user-001`. | Response status is `401 Unauthorized`; error payload contains deterministic fields `error.code` and `error.message`; response contains no list ID, list name, owner identity, visibility, place count, private notes, stack trace, SQL details, audit fields, or debug fields; owner fetch still shows visibility `private`. | LIST-005-US-002 | Yes | API | Smoke cadence. |
| LIST-005-US-002-TC-002 | Expired session blocks visibility change without private-data flash | UI, Authentication, Privacy, Security | Critical | Browser has expired token and may have cached edit state for Fixture A. | Fixture F. | 1. Open edit flow with expired token. 2. Capture DOM, accessibility tree, and network. 3. Attempt save only if controls render. | Protected list data and mutation controls are absent before auth denial; any protected request returns `401 Unauthorized`; zero successful visibility updates occur; cached private list context is cleared from DOM and accessibility tree after denial. | LIST-005-US-002 | Yes | Security | Smoke cadence. |
| LIST-005-US-002-TC-003 | Non-owner visibility update is denied without exposing private list data | Privacy, Security, Negative | Critical | `user-002` is authenticated and does not own Fixture G list. | Fixture G request. | 1. Send visibility request as `user-002`. 2. Inspect response recursively. 3. Fetch original list as `user-001`. | Access is denied; owner fetch still shows `visibility="private"` and name `Owner Private`; response contains no `Owner Private`, owner email, internal owner ID, visibility, place count, private notes, stack trace, SQL details, audit fields, moderation fields, or debug fields. | LIST-005-US-002 | Yes | Security | Smoke cadence. Exact non-owner status remains LIST-005-US-002-TC-004 clarification. |
| LIST-005-US-002-TC-004 | Exact non-owner denial status requires API contract clarification | Requirement Clarification, Manual | Medium | API status contract review is being performed. | Non-owner visibility request for private list. | 1. Review LIST-005 and API contract. 2. Confirm whether non-owner denial must be `404 Not Found`, `403 Forbidden`, or another privacy-preserving denial. | LIST-005 executable tests assert denial, no mutation, and no private data leakage. Exact non-owner status is not asserted until documented. | LIST-005-US-002 | No | Manual | Manual Review cadence. |
| LIST-005-US-002-TC-005 | Non-owner cannot change public owned list visibility | Security, Privacy, Negative | Critical | `user-002` is authenticated; `list-public-001` belongs to `user-001`. | `PATCH /api/v1/lists/list-public-001/visibility` body `{ "visibility": "private" }`. | 1. Submit request as `user-002`. 2. Fetch list as `user-001`. 3. Inspect public detail as authenticated viewer. | Request is denied without mutation; owner fetch still shows `visibility="public"`; public route eligibility is unchanged; response exposes no owner email, internal owner ID, private notes, tokens, audit fields, or debug fields. | LIST-005-US-002 | Yes | Security | Regression cadence. |
| LIST-005-US-002-TC-006 | Auth recovery allows owner visibility change after valid sign-in | UI, Authentication, Integration | High | User starts denied, then signs in as `user-001`. | Fixture A through UI. | 1. Open visibility edit without valid auth and confirm denial. 2. Sign in as `user-001`. 3. Open edit for `list-private-001`. 4. Select `public` and save. | Fresh edit flow opens with owner data; `PATCH /api/v1/lists/list-private-001/visibility` returns `200 OK`; response `data.visibility="public"`; no denied/guest state remains visible. | LIST-005-US-002 | Yes | UI E2E | Regression cadence. |
| LIST-005-US-002-TC-007 | Denial error schema is deterministic and privacy-safe | API, Security, Privacy | High | Guest request and non-owner request are available. | Fixture E and Fixture G requests. | 1. Submit guest request. 2. Submit non-owner request. 3. Inspect both error payloads recursively. | Guest response status is `401 Unauthorized`; non-owner response status is not asserted until documented; both error payloads contain deterministic safe fields and contain no list name, place count, owner email, internal user ID, visibility, tokens, audit fields, moderation fields, SQL details, or stack traces. | LIST-005-US-002 | Yes | Security | Regression cadence. |

## LIST-005-US-003 - Change private to public

User Story Summary: As a list owner, I want to make a list public so that authenticated users can view it through public routes.

Related Feature ID: `LIST-005`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-005-US-003-TC-001 | API changes private list to public | API, Positive, Contract | Critical | `user-001` owns Fixture A list. | Fixture A request. | 1. Send authenticated PATCH request. 2. Inspect response. 3. Fetch owned list as `user-001`. | Response status is `200 OK`; response envelope contains `data`; `data.id="list-private-001"`, `data.name="Weekend Food"`, `data.visibility="public"`, `data.placeCount=3`; `data.updatedAt` differs from `2026-06-24T10:00:00Z`; owner fetch shows `visibility="public"`. | LIST-005-US-003 | Yes | API | Smoke cadence. |
| LIST-005-US-003-TC-002 | Private-to-public response excludes forbidden fields | API, Security, Privacy, Contract | Critical | Fixture A succeeds. | Fixture A request. | 1. Send visibility request. 2. Recursively inspect response JSON and rendered success state. | Response status is `200 OK`; response and UI contain no private notes, owner email, internal owner ID, refresh token, session token, moderation fields, audit fields, raw SQL, stack traces, or debug fields. | LIST-005-US-003 | Yes | Security | Smoke cadence. |
| LIST-005-US-003-TC-003 | UI updates displayed visibility to public after save | UI, Positive | Critical | Edit dialog is open for `list-private-001`, selected value `private`. | Select `public`; save. | 1. Select `public`. 2. Activate save. 3. Inspect network and current owned surface. | Save button sends exactly one `PATCH /api/v1/lists/list-private-001/visibility` with body `{ "visibility": "public" }`; response status is `200 OK`; current owned UI displays visibility `public`; list name remains `Weekend Food`; place count remains `3`. | LIST-005-US-003 | Yes | UI E2E | Smoke cadence. |
| LIST-005-US-003-TC-004 | Public detail becomes eligible after explicit fresh request | API, Integration, Privacy | High | Fixture A has changed to public successfully. | Fixture I public detail request. | 1. Request `GET /api/v1/lists/public/list-private-001` as `user-002`. 2. Inspect response. | Response status is `200 OK`; response includes public-safe list id, list name, visibility `public`, place count, and `ownerDisplayName`; response contains no owner email, internal owner ID, private notes, tokens, private account metadata, audit fields, or debug fields. | LIST-005-US-003 | Yes | API | Regression cadence. Source: LIST-005-US-003, LIST-005-US-008, LIST-005-US-009, PUBLIC-002-US-005. |
| LIST-005-US-003-TC-005 | Public index eligibility after explicit fresh request | API, Integration | High | Fixture A has changed to public successfully. | Fixture I public index request. | 1. Request `GET /api/v1/lists/public` as `user-002`. 2. Search returned `items` for `list-private-001`. | Response status is `200 OK`; returned `items` contains at most one item with `id="list-private-001"`; if present, its `visibility` is `public` and owner identity field is `ownerDisplayName` only. | LIST-005-US-003 | Yes | API | Regression cadence. Source: LIST-005-US-003, LIST-005-US-008. |
| LIST-005-US-003-TC-006 | Public-warning requirement is not part of LIST-005 scope | Requirement Clarification, Manual | Low | Product review is being performed. | Private-to-public save flow. | 1. Review LIST-005 Missing Assumptions. 2. Confirm whether extra warning/confirmation is required before making a list public. | Current LIST-005 scope does not require an extra warning before public visibility; no executable warning assertion is added unless product documents it. | LIST-005-US-003 | No | Manual | Manual Review cadence. |

## LIST-005-US-004 - Change public to private

User Story Summary: As a list owner, I want to make a list private so that non-owners can no longer view it.

Related Feature ID: `LIST-005`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-005-US-004-TC-001 | API changes public list to private | API, Positive, Contract | Critical | `user-001` owns Fixture B list. | Fixture B request. | 1. Send authenticated PATCH request. 2. Inspect response. 3. Fetch owned list as `user-001`. | Response status is `200 OK`; response envelope contains `data`; `data.id="list-public-001"`, `data.name="Riyadh Cafes"`, `data.visibility="private"`, `data.placeCount=5`; `data.updatedAt` differs from `2026-06-24T11:00:00Z`; owner fetch shows `visibility="private"`. | LIST-005-US-004 | Yes | API | Smoke cadence. |
| LIST-005-US-004-TC-002 | Public-to-private response excludes forbidden fields | API, Security, Privacy, Contract | Critical | Fixture B succeeds. | Fixture B request. | 1. Send visibility request. 2. Recursively inspect response JSON and rendered success state. | Response status is `200 OK`; response and UI contain no private notes, owner email, internal owner ID, refresh token, session token, moderation fields, audit fields, raw SQL, stack traces, or debug fields. | LIST-005-US-004 | Yes | Security | Smoke cadence. |
| LIST-005-US-004-TC-003 | UI updates displayed visibility to private after save | UI, Privacy | Critical | Edit dialog is open for `list-public-001`, selected value `public`. | Select `private`; save. | 1. Select `private`. 2. Activate save. 3. Inspect network and current owned surface. | Save button sends exactly one `PATCH /api/v1/lists/list-public-001/visibility` with body `{ "visibility": "private" }`; response status is `200 OK`; current owned UI displays visibility `private`; list name remains `Riyadh Cafes`; place count remains `5`. | LIST-005-US-004 | Yes | UI E2E | Smoke cadence. |
| LIST-005-US-004-TC-004 | Public detail is removed after explicit fresh request | API, Integration, Privacy | Critical | Fixture B has changed to private successfully. | Fixture H public detail request. | 1. Request `GET /api/v1/lists/public/list-public-001` as `user-002`. 2. Inspect response. | Response status is `404 Not Found`; response contains no list name, owner display name, owner email, internal owner ID, place count, places, visibility, private notes, tokens, audit fields, or debug fields. | LIST-005-US-004 | Yes | API | Regression cadence. Source: LIST-005-US-004, LIST-005-US-007, PUBLIC-002-US-004, PUBLIC-003-US-002, PUBLIC-003-US-003. |
| LIST-005-US-004-TC-005 | Public index excludes list after explicit fresh request | API, Integration, Privacy | Critical | Fixture B has changed to private successfully. | Fixture H public index request. | 1. Request `GET /api/v1/lists/public` as `user-002`. 2. Search returned `items` for `list-public-001`. | Response status is `200 OK`; returned `items` contains zero items with `id="list-public-001"`; response contains no stale row for `Riyadh Cafes`. | LIST-005-US-004 | Yes | API | Regression cadence. Source: LIST-005-US-004, LIST-005-US-007. |
| LIST-005-US-004-TC-006 | Public-route cache timing remains PUBLIC-owned | Traceability Verification, Manual | Medium | Public index/detail cache behavior is being reviewed. | PUBLIC-LISTS requirements. | 1. Review LIST-005 visibility mutation tests. 2. Review PUBLIC stale visibility/cache tests. | LIST-005 tests explicit fresh requests after visibility mutation; cache revalidation, browser history, and stale public page behavior remain PUBLIC-owned unless directly required by LIST-005. | LIST-005-US-004 | No | Manual | Manual Review cadence. |

## LIST-005-US-005 - Reject invalid visibility update

User Story Summary: As the system, I want only valid visibility values accepted.

Related Feature ID: `LIST-005`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-005-US-005-TC-001 | Invalid visibility `team` returns 422 and preserves old value | API, Validation, Negative | Critical | `user-001` owns Fixture D list. | Fixture D request. | 1. Send authenticated request with `visibility="team"`. 2. Inspect response. 3. Fetch owned list as `user-001`. | Response status is `422 Validation Error`; error payload contains deterministic fields `error.code`, `error.message`, and `error.field="visibility"`; owner fetch still shows `visibility="private"` and name `Invalid Visibility`. | LIST-005-US-005 | Yes | API | Smoke cadence. |
| LIST-005-US-005-TC-002 | Missing visibility returns 422 and preserves old value | API, Validation, Negative | Critical | `user-001` owns `list-private-002`, visibility `private`. | `PATCH /api/v1/lists/list-private-002/visibility` body `{}`. | 1. Send authenticated request without `visibility`. 2. Inspect response. 3. Fetch owned list. | Response status is `422 Validation Error`; error payload identifies `visibility`; owner fetch still shows `visibility="private"`; no partial success response is returned. | LIST-005-US-005 | Yes | API | Smoke cadence. |
| LIST-005-US-005-TC-003 | Invalid visibility error payload is privacy-safe | API, Security, Privacy, Validation | Critical | Fixture D invalid request is available. | Fixture D request. | 1. Submit invalid visibility. 2. Recursively inspect error payload and rendered validation state. | Response status is `422 Validation Error`; response and UI contain no private list contents, owner email, internal owner ID, tokens, stack traces, raw SQL, audit fields, moderation fields, or debug fields. | LIST-005-US-005 | Yes | Security | Smoke cadence. |
| LIST-005-US-005-TC-004 | UI invalid visibility state cannot be submitted silently | UI, Validation, Security | High | Test harness forces invalid selector value `team` before save. | Invalid UI state `team`. | 1. Force invalid control value in test harness. 2. Activate save. 3. Inspect network, validation, and persisted visibility. | If request is sent, payload is `{ "visibility": "team" }` and response is `422 Validation Error`; persisted UI returns to or displays current valid value `private`; no success state appears. | LIST-005-US-005 | Yes | UI E2E | Regression cadence. |
| LIST-005-US-005-TC-005 | Approved visibility set remains exactly private/public | Traceability Verification, Manual | Medium | Requirements review is being performed. | LISTS_USER_STORIES.md global rules. | 1. Review approved visibility values. 2. Confirm no extra values such as `shared`, `team`, or `unlisted` are documented. | Executable tests assert only `private` and `public` as valid. Extra visibility values remain invalid unless requirements change. | LIST-005-US-005 | No | Manual | Manual Review cadence. |

## LIST-005-US-006 - Preserve owner access after private change

User Story Summary: As a list owner, I want to keep managing my list after making it private.

Related Feature ID: `LIST-005`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-005-US-006-TC-001 | Owner can open owned detail after public-to-private change | UI, Privacy, Integration | Critical | Fixture B has changed to private successfully. | `/lists/list-public-001` as `user-001`. | 1. Open owned list detail `/lists/list-public-001`. 2. Inspect rendered controls and metadata. | Owned detail loads for `user-001`; list name `Riyadh Cafes` is visible; visibility displays `private`; owner manage controls remain available; no public-read-only state is shown. | LIST-005-US-006 | Yes | UI E2E | Smoke cadence. Source: LIST-005-US-006. |
| LIST-005-US-006-TC-002 | Owner GET detail remains available after private change | API, Privacy, Integration | Critical | Fixture B has changed to private successfully. | `GET /api/v1/lists/list-public-001` as `user-001`. | 1. Request owned detail. 2. Inspect response. | Response status is `200 OK`; response `id="list-public-001"`, `name="Riyadh Cafes"`, `visibility="private"`, `placeCount=5`; response contains no owner email, tokens, audit fields, moderation fields, stack traces, or debug fields. | LIST-005-US-006 | Yes | API | Smoke cadence. Source: LIST-005-US-006, LIST-007-US-001. |
| LIST-005-US-006-TC-003 | Owner can reopen edit flow after private change | UI, Regression | High | Fixture B has changed to private successfully. | Edit action for `list-public-001`. | 1. Open owned detail as `user-001`. 2. Activate edit. 3. Inspect visibility control. | Edit dialog/sheet opens; visibility control selected value is `private`; owner can select `public` again; zero visibility PATCH requests are sent before save. | LIST-005-US-006 | Yes | UI E2E | Regression cadence. |
| LIST-005-US-006-TC-004 | Place-detail containing-list display remains PLACE-owned | Traceability Verification, Manual | Medium | A list containing a place changes visibility. | PLACE-018 requirements. | 1. Review LIST-005 visibility tests. 2. Review PLACE-018 containing-list visibility/privacy tests. | LIST-005 validates owned visibility mutation and public eligibility effects; Place Detail containing-list rendering and hidden/visible membership display remain PLACE-owned unless directly linked. | LIST-005-US-006 | No | Manual | Manual Review cadence. |

## LIST-005-US-007 - Remove public discoverability after private change

User Story Summary: As a user, I want privacy changes to take effect immediately.

Related Feature ID: `LIST-005`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-005-US-007-TC-001 | Public index excludes private list after explicit fresh request | API, Integration, Privacy | Critical | Fixture B changed `list-public-001` from public to private. | `GET /api/v1/lists/public` as `user-002`. | 1. Send fresh public index request. 2. Inspect `items`. | Response status is `200 OK`; no item has `id="list-public-001"`; no item has name `Riyadh Cafes` for that ID; response contains no private row data for the changed list. | LIST-005-US-007 | Yes | API | Smoke cadence. |
| LIST-005-US-007-TC-002 | Public detail returns 404 after private change | API, Integration, Privacy | Critical | Fixture B changed `list-public-001` from public to private. | `GET /api/v1/lists/public/list-public-001` as `user-002`. | 1. Send fresh public detail request. 2. Inspect status and payload. | Response status is `404 Not Found`; payload contains deterministic fields `error.code` and `error.message`; payload contains no list name, place count, owner display name, owner email, internal owner ID, visibility, places, private notes, audit fields, or debug fields. | LIST-005-US-007 | Yes | API | Smoke cadence. Source: PUBLIC-002-US-004, PUBLIC-003-US-002, PUBLIC-003-US-003. |
| LIST-005-US-007-TC-003 | Guest public detail denial does not reveal private status | API, Security, Privacy | High | Fixture B changed to private. | `GET /api/v1/lists/public/list-public-001` without auth. | 1. Send request as guest. 2. Inspect status and payload. | Response status is `401 Unauthorized`; payload does not reveal whether `list-public-001` exists, is private, or was changed; no list fields are returned. | LIST-005-US-007 | Yes | Security | Regression cadence. Source: PUBLIC-003-US-008. |
| LIST-005-US-007-TC-004 | Public stale-cache behavior remains PUBLIC-owned | Traceability Verification, Manual | Medium | Cached public index or detail exists before visibility change. | PUBLIC stale visibility requirements. | 1. Review LIST-005 explicit fresh request tests. 2. Review PUBLIC stale index/detail recovery tests. | LIST-005 does not assert cache invalidation timing, browser back behavior, or revalidation mechanics. Those remain PUBLIC-owned unless LIST-005 requirements add them. | LIST-005-US-007 | No | Manual | Manual Review cadence. |
| LIST-005-US-007-TC-005 | Search/indexing visibility timing requires product decision | Requirement Clarification, Manual | Low | Search or discovery indexing is discussed. | Public/private visibility transition. | 1. Review current LIST and PUBLIC requirements. 2. Confirm whether search indexing or external discovery timing is in scope. | No executable search/indexing visibility timing test is added because LIST-005 does not document search indexing behavior. | LIST-005-US-007 | No | Manual | Manual Review cadence. |

## LIST-005-US-008 - Add public discoverability after public change

User Story Summary: As a user, I want published lists discoverable by authenticated users.

Related Feature ID: `LIST-005`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-005-US-008-TC-001 | Public detail returns public-safe list after public change | API, Integration, Privacy | High | Fixture A changed `list-private-001` from private to public. | `GET /api/v1/lists/public/list-private-001` as `user-002`. | 1. Send fresh public detail request. 2. Inspect response. | Response status is `200 OK`; response includes `id="list-private-001"`, `name="Weekend Food"`, `visibility="public"`, `placeCount=3`, and `ownerDisplayName`; response excludes owner email, internal owner ID, refresh token data, private account data, private notes, audit fields, and debug fields. | LIST-005-US-008 | Yes | API | Smoke cadence. |
| LIST-005-US-008-TC-002 | Public index can include newly public list with safe owner identity | API, Integration, Privacy | High | Fixture A changed `list-private-001` from private to public. | `GET /api/v1/lists/public` as `user-002`. | 1. Send fresh public index request. 2. Inspect matching item if returned. | Response status is `200 OK`; if `items` contains `id="list-private-001"`, that item has `visibility="public"` and `ownerDisplayName`; matching item contains no owner email, internal owner ID, private notes, tokens, audit fields, or debug fields. | LIST-005-US-008 | Yes | API | Regression cadence. |
| LIST-005-US-008-TC-003 | Owner public route remains read-only and PUBLIC-owned | Traceability Verification, Manual | Medium | Owner opens a public list through public route. | PUBLIC read-only route requirements. | 1. Review LIST-005 public eligibility tests. 2. Review PUBLIC owner-read-only route tests. | LIST-005 validates that public visibility makes the list eligible for public endpoints. Public route read-only UI, redirect behavior, and owner public browsing behavior remain PUBLIC-owned. | LIST-005-US-008 | No | Manual | Manual Review cadence. |
| LIST-005-US-008-TC-004 | Profile public summary integration is traceability-only here | Traceability Verification, Manual | Medium | A list changes from private to public. | PROFILE-004 requirements. | 1. Review PROFILE public summary requirements. 2. Confirm LIST-005 avoids duplicating profile rendering. | PROFILE owns rendering and refresh of `publicListsSummary`; LIST-005 may rely on profile tests for summary display and does not assert profile synchronization timing. | LIST-005-US-008 | No | Manual | Manual Review cadence. |
| LIST-005-US-008-TC-005 | Repeated public/private toggle preserves final visibility | API, Regression, Data Integrity | High | `user-001` owns `list-private-001`, initially private. | PATCH public, then PATCH private, then PATCH public. | 1. Send Fixture A request. 2. Send `{ "visibility": "private" }` for same ID. 3. Send `{ "visibility": "public" }` for same ID. 4. Fetch owned list. | Each PATCH returns `200 OK`; final owned fetch returns `id="list-private-001"` and `visibility="public"`; list name remains `Weekend Food`; placeCount remains `3`; no duplicate list is created. | LIST-005-US-008 | Yes | API | Regression cadence. |

## LIST-005-US-009 - Avoid exposing sensitive owner data

User Story Summary: As the system, I want public visibility to expose only public-safe owner metadata.

Related Feature ID: `LIST-005`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-005-US-009-TC-001 | Public detail owner identity is allowlisted after public change | API, Security, Privacy | Critical | Fixture A changed to public. | Public detail response for `list-private-001`. | 1. Request public detail as `user-002`. 2. Recursively inspect response. | Response status is `200 OK`; the only owner identity field is `ownerDisplayName`; response contains no owner email, internal owner ID, auth/session data, refresh token data, private account metadata, audit fields, moderation fields, or debug fields. | LIST-005-US-009 | Yes | Security | Smoke cadence. Source: PUBLIC-004-US-003. |
| LIST-005-US-009-TC-002 | Public index owner identity is allowlisted after public change | API, Security, Privacy | Critical | Fixture A changed to public and appears in public index response. | Public index response item for `list-private-001`. | 1. Request public index as `user-002`. 2. Inspect matching item. | Response status is `200 OK`; matching item has `ownerDisplayName`; matching item contains no owner email, internal owner ID, auth/session data, refresh token data, private account metadata, audit fields, moderation fields, or debug fields. | LIST-005-US-009 | Yes | Security | Smoke cadence. Source: PUBLIC-004-US-003. |
| LIST-005-US-009-TC-003 | Visibility PATCH response does not expose public owner metadata | API, Security, Privacy | High | `user-001` owns Fixture A list. | Fixture A request. | 1. Send visibility update. 2. Inspect PATCH response. | Response status is `200 OK`; PATCH response does not expose owner email, internal owner ID, refresh token data, private account metadata, or `ownerDisplayName`; public owner identity is exposed only by public endpoints. | LIST-005-US-009 | Yes | Security | Regression cadence. |
| LIST-005-US-009-TC-004 | Sensitive owner data in errors is never exposed | API, Security, Privacy | High | Invalid visibility and server-error simulations are available. | Fixture D and synthetic 500. | 1. Submit invalid visibility. 2. Simulate 500 on visibility update. 3. Inspect error payloads and UI. | `422 Validation Error` and `500 Internal Server Error` payloads/UI contain no owner email, internal owner ID, refresh token data, private account metadata, raw SQL, stack traces, audit fields, moderation fields, or debug fields. | LIST-005-US-009 | Yes | Security | Regression cadence. |

## LIST-005-US-010 - Preserve selection after visibility failure

User Story Summary: As a user, I want to retry visibility changes without confusion.

Related Feature ID: `LIST-005`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-005-US-010-TC-001 | Network failure preserves attempted public selection and old persisted visibility | UI, Error Handling, Loading | Medium | Edit dialog is open for Fixture J list. | Select `public`; network failure. | 1. Select `public`. 2. Save. 3. Fail `PATCH /api/v1/lists/list-flaky-001/visibility` with network error. 4. Inspect form and current owned surface. | Edit dialog remains open; attempted selection remains `public`; old persisted visibility on current surface remains `private`; no success state appears. | LIST-005-US-010 | Yes | UI E2E | Regression cadence. |
| LIST-005-US-010-TC-002 | 5xx failure preserves attempted selection and old persisted visibility | UI, Error Handling, Negative | Medium | Edit dialog is open for Fixture J list. | Select `public`; API returns `500 Internal Server Error`. | 1. Select `public`. 2. Save. 3. Return `500 Internal Server Error`. 4. Inspect UI state and response. | Dialog remains open; selected attempted value remains `public`; old persisted visibility remains `private`; visible error text contains no private or internal data. | LIST-005-US-010 | Yes | UI E2E | Regression cadence. |
| LIST-005-US-010-TC-003 | Retry after transient failure sends same attempted visibility once | UI, Error Handling, Regression | Medium | First visibility request fails; second succeeds. | Attempted visibility `public`; second response `200 OK`. | 1. Submit visibility change and fail first request. 2. Activate retry/save once. 3. Capture second request and response. | Second request body is exactly `{ "visibility": "public" }`; exactly one retry PATCH is sent for the second activation; second response status is `200 OK`; persisted visibility becomes `public`. | LIST-005-US-010 | Yes | UI E2E | Regression cadence. |
| LIST-005-US-010-TC-004 | Pending visibility save announces loading and prevents duplicate submit | UI, Loading, Accessibility, Data Integrity | High | Edit dialog is open; API request is delayed. | Attempted visibility `public`. | 1. Select `public`. 2. Submit save. 3. Hold request pending. 4. Activate save again while pending. 5. Inspect network and accessibility state. | Visible pending status is present; `aria-busy="true"` or an element with `role="status"` communicates loading; exactly one PATCH is sent while pending; attempted selection remains `public`. | LIST-005-US-010 | Yes | Accessibility | Regression cadence. Source: A11Y-001-US-016. |
| LIST-005-US-010-TC-005 | Failure error payload is deterministic and privacy-safe | API, Error Handling, Security, Privacy | High | API returns 500 during visibility update. | Attempted visibility `public`. | 1. Submit visibility request. 2. Inspect error response and rendered UI. | Response status is `500 Internal Server Error`; error payload contains deterministic fields `error.code` and `error.message`; response and UI error contain no owner email, internal user ID, tokens, list table names, stack traces, raw SQL, moderation fields, audit fields, or debug fields. | LIST-005-US-010 | Yes | Security | Regression cadence. |

## LIST-005-US-011 - Cancel visibility edit without mutation

User Story Summary: As a user, I want cancel to leave privacy unchanged.

Related Feature ID: `LIST-005`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-005-US-011-TC-001 | Cancel visibility edit sends no PATCH and keeps private | UI, Positive, Privacy | Medium | Edit dialog is open for Fixture K list. | Select `public`, then cancel. | 1. Select `public`. 2. Activate cancel/close. 3. Inspect network and current owned surface. | Dialog closes; zero `PATCH /api/v1/lists/list-private-003/visibility` requests are sent; displayed persisted visibility remains `private`. | LIST-005-US-011 | Yes | UI E2E | Regression cadence. |
| LIST-005-US-011-TC-002 | Escape closes unchanged visibility dialog and restores focus | Accessibility, Keyboard | Medium | Edit dialog is open with no unsaved visibility change; edit trigger remains mounted. | Escape key. | 1. Open edit dialog from edit trigger. 2. Press Escape. 3. Inspect focus and network. | Dialog closes; focus returns to the same edit trigger; zero visibility PATCH requests are sent. | LIST-005-US-011 | Yes | Accessibility | Regression cadence. Source: A11Y-001-US-006, A11Y-001-US-008. |
| LIST-005-US-011-TC-003 | Unsaved visibility discard confirmation requires product decision | Requirement Clarification, Manual | Low | Edit dialog has unsaved visibility change. | Attempted close after selecting `public`. | 1. Review LIST-005-US-011 and global modal requirements. 2. Confirm whether unsaved visibility change requires confirmation or closes immediately. | LIST-005 executable tests assert no mutation on cancel. Whether a discard confirmation appears remains clarification until documented. | LIST-005-US-011 | No | Manual | Manual Review cadence. |
| LIST-005-US-011-TC-004 | Cancel after failed save keeps attempted selection only inside dialog | UI, Error Handling, Privacy | Medium | Visibility save failed and dialog remains open with attempted selection `public`. | Cancel after failure. | 1. Fail save. 2. Activate cancel. 3. Inspect persisted surface and network. | Dialog closes; no additional PATCH is sent; persisted surface displays old visibility `private`; attempted selection `public` is not displayed as persisted. | LIST-005-US-011 | Yes | UI E2E | Regression cadence. |

## LIST-005-US-012 - Make visibility control accessible

User Story Summary: As a keyboard or screen-reader user, I want private/public controls understandable.

Related Feature ID: `LIST-005`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-005-US-012-TC-001 | Visibility control has label and selected state semantics | Accessibility, UI | High | Edit dialog is open for Fixture A list. | Visibility selector with `private` selected. | 1. Inspect visible labels. 2. Inspect accessibility tree. 3. Inspect selected state. | Control has accessible name that identifies visibility/privacy; `private` and `public` options have accessible names; selected option exposes semantic selected/checked state; selected state is not communicated by color alone. | LIST-005-US-012 | Yes | Accessibility | Smoke cadence. Source: LIST-005-US-012, RESP-003-US-015. |
| LIST-005-US-012-TC-002 | Keyboard-only user can change private to public | Accessibility, Keyboard, Positive | High | Edit trigger and visibility control are keyboard reachable; Fixture A is valid. | Keyboard-only path. | 1. Tab to edit trigger and press Enter. 2. Move to visibility control. 3. Select `public` using keyboard. 4. Activate save by keyboard. | Focus remains inside dialog/sheet until save; focus-visible indicator appears on focused controls; request returns `200 OK`; persisted visibility becomes `public`; no pointer action is required. | LIST-005-US-012 | Yes | Accessibility | Smoke cadence. Source: LIST-005-US-012, A11Y-001-US-004, A11Y-001-US-005. |
| LIST-005-US-012-TC-003 | Visibility change announces saved state | Accessibility, UI | High | Edit dialog is open for Fixture A list. | Select `public`; save. | 1. Save visibility change. 2. Inspect status/live region and accessibility tree. | After `200 OK`, visible status text or live region announces that visibility is `public`; status contains no private metadata; focus remains in a logical post-save location inside the active UI. | LIST-005-US-012 | Yes | Accessibility | Regression cadence. Source: A11Y-001-US-016. |
| LIST-005-US-012-TC-004 | Visibility validation error announces invalid value | Accessibility, Validation, Negative | High | Test harness forces invalid selector value `team`. | Invalid visibility `team`. | 1. Submit invalid value. 2. Inspect focus and accessibility tree. | `422 Validation Error` is represented by visible error text; error is programmatically associated with visibility control or an error summary; focus remains inside dialog/sheet. | LIST-005-US-012 | Yes | Accessibility | Regression cadence. Source: A11Y-001-US-014, A11Y-001-US-015. |
| LIST-005-US-012-TC-005 | Visibility edit fits mobile and 200% zoom matrix | Responsive, Mobile, Accessibility | High | Edit dialog/sheet is open for Fixture A list. | Viewports `320x568`, `390x844`, `430x932`; `200%` zoom. | 1. Open edit UI at each viewport. 2. Repeat at `200%` zoom. 3. Inspect scroll width, controls, and touch targets. | For every tested viewport, `document.documentElement.scrollWidth <= window.innerWidth`; private/public options, save, cancel, and close controls remain reachable; final action is not obscured by bottom navigation or safe-area padding; touch targets are at least `44x44` CSS pixels. | LIST-005-US-012 | Yes | Accessibility | Regression cadence. Source: RESP-001-US-011, RESP-002-US-001, RESP-002-US-002, RESP-002-US-009, RESP-002-US-011, RESP-003-US-001, RESP-003-US-008. |
| LIST-005-US-012-TC-006 | Visibility control supports forced colors and reduced motion | Accessibility, Responsive | Medium | Forced-colors and reduced-motion modes are available. | Visibility control in edit dialog. | 1. Enable forced-colors mode. 2. Inspect selected/private/public states. 3. Enable reduced motion. 4. Submit visibility change. | Option text, selected state, focus indicator, button borders, disabled/pending state, and error text remain distinguishable in forced colors; reduced motion does not hide critical state changes; visibility change still returns `200 OK`. | LIST-005-US-012 | Yes | Accessibility | Nightly cadence. Source: RESP-003-US-014, RESP-003-US-015, RESP-003-US-016, RESP-003-US-017. |

## Final Summary

1. User stories processed: 12
2. Total executable test cases: 51
3. Clarification / Manual / Traceability cases: 12
4. Total test cases: 63
5. Test count per user story:
   - LIST-005-US-001: 6
   - LIST-005-US-002: 7
   - LIST-005-US-003: 6
   - LIST-005-US-004: 6
   - LIST-005-US-005: 5
   - LIST-005-US-006: 4
   - LIST-005-US-007: 5
   - LIST-005-US-008: 5
   - LIST-005-US-009: 4
   - LIST-005-US-010: 5
   - LIST-005-US-011: 4
   - LIST-005-US-012: 6
6. Count by test type:
   - API: 25
   - Accessibility: 10
   - Authentication: 3
   - Contract: 4
   - Data Integrity: 2
   - Error Handling: 5
   - Integration: 11
   - Keyboard: 2
   - Loading: 2
   - Manual: 12
   - Mobile: 1
   - Negative: 7
   - Positive: 7
   - Privacy: 27
   - Regression: 3
   - Requirement Clarification: 5
   - Responsive: 2
   - Security: 17
   - Traceability Verification: 7
   - UI: 19
   - Validation: 5
7. Count by priority:
   - Critical: 23
   - High: 21
   - Medium: 16
   - Low: 3
8. Count by automation layer:
   - API: 15
   - Accessibility: 8
   - Manual: 12
   - Security: 15
   - UI E2E: 13
9. Top automation candidates:
   - `PATCH /api/v1/lists/{id}/visibility` `200 OK`, `401 Unauthorized`, `422 Validation Error`, deterministic error schema, success response envelope, required fields, and forbidden-field tests.
   - Private-to-public and public-to-private API/UI happy paths with exact payloads and post-save visibility assertions.
   - Public endpoint eligibility checks after explicit fresh requests: public index/detail inclusion and removal.
   - Security automation for guest, expired session, non-owner denial, no-private-data flash, owner metadata allowlist, and sensitive error redaction.
   - Accessibility automation for selector label, semantic selected state, keyboard-only visibility change, status/error announcements, touch targets, forced colors, reduced motion, and 200% zoom.

## Validation

- Duplicate Test IDs = 0
- Invalid Story References = 0
- Missing User Stories = 0
- Encoding/Mojibake = 0
- API Tests Missing Status Codes = 0
- Requirement Fidelity Violations = 0
- Feature Ownership Violations = 0
