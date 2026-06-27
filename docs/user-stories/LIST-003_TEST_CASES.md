# LIST-003 Test Cases

Feature: `LIST-003 - Create list with visibility`

Source: `docs/user-stories/LISTS_USER_STORIES.md`

Supporting Sources:

- `docs/feature-map/FEATURE_TRACEABILITY.md`
- `docs/user-stories/LIST-001_TEST_CASES.md`
- `docs/user-stories/RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`
- `docs/user-stories/PUBLIC_LISTS_USER_STORIES.md`
- `docs/user-stories/PROFILE_USER_STORIES.md`

Scope: All user stories under `LIST-003`.

## QA Execution Standards

- Test cases validate documented requirements only. Undefined behavior is captured as Requirement Clarification, Manual Verification, or Traceability Verification.
- `LIST-003` owns opening the create-list flow, initial visibility selection, name validation, creation request/response, failure retry state, cancel without mutation, and navigation to the new owned list detail.
- `LIST-003` does not own list rename, list delete, visibility changes after creation, public-list browsing, profile count rendering, place membership, or owned-list index behavior outside direct post-create integration.
- Create endpoint from traceability: `POST /api/v1/lists` with Bearer authentication and `CreateListDialog.tsx` frontend consumer.
- Documented visibility values are exactly `private` and `public`.
- List name is required, trimmed before persistence, and limited to 80 characters.
- Duplicate list names are allowed for the same user and across users.
- New lists default to `private` when visibility is omitted.
- New list creation returns `201 Created` and navigates directly to `/lists/{newListId}`.
- Executable responsive/accessibility tests cite approved global requirements and do not invent LIST-003-specific behavior.
- Automation cadence values used in Notes: Smoke, Regression, Nightly, Manual Review.

## Deterministic Creation Fixtures

| Fixture ID | User Context | Request Payload / UI Input | Expected Result |
|---|---|---|---|
| Fixture A | `u_owner` authenticated, owns 2 lists before create | `POST /api/v1/lists` body `{ "name": "Weekend Food", "visibility": "private" }` | `201 Created`; response `name="Weekend Food"`, `visibility="private"`, `placeCount=0`; new list ID is unique; owned list count becomes previous `2 + 1 = 3`. |
| Fixture B | `u_owner` authenticated | `{ "name": "Cafe Tour", "visibility": "public" }` | `201 Created`; response `visibility="public"`; owner can manage the list through owned route; public browsing behavior remains PUBLIC-owned. |
| Fixture C | `u_owner` authenticated | `{ "name": "  برجر الرياض  ", "visibility": "private" }` | `201 Created`; persisted/displayed `name="برجر الرياض"`. |
| Fixture D | `u_owner` authenticated | `{ "name": "A", "visibility": "private" }` | `201 Created`; one-character trimmed name is accepted. |
| Fixture E | `u_owner` authenticated | `{ "name": "LLLL...LLLL", "visibility": "private" }` where trimmed length is exactly `80` | `201 Created`; 80-character trimmed name is accepted. |
| Fixture F | `u_owner` authenticated | `{ "name": "LLLL...LLLLL", "visibility": "private" }` where trimmed length is exactly `81` | `422 Validation Error`; no list is created. |
| Fixture G | `u_owner` authenticated | `{ "name": "", "visibility": "private" }` | `422 Validation Error`; no list is created. |
| Fixture H | `u_owner` authenticated | `{ "name": "     ", "visibility": "private" }` | `422 Validation Error`; no list is created after trimming. |
| Fixture I | `u_owner` authenticated, already owns `dup_existing` named `Weekend Food` | `{ "name": "Weekend Food", "visibility": "private" }` | `201 Created`; new list ID differs from `dup_existing`. |
| Fixture J | no authenticated session | `{ "name": "Guest List", "visibility": "private" }` | `401 Unauthorized`; no list is created. |

## LIST-003-US-001 - Open create list flow

User Story Summary: As an authenticated user, I want to open create list so that I can start a collection.

Related Feature ID: `LIST-003`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-003-US-001-TC-001 | Authenticated user opens create-list dialog from Lists page | UI, Positive, Accessibility | Critical | `u_owner` is authenticated and can access `/lists`. | Create-list trigger on `/lists`. | 1. Sign in as `u_owner`. 2. Open `/lists`. 3. Activate the create-list trigger. 4. Inspect the modal/sheet. | A create-list dialog or mobile sheet opens; it contains one list-name input, private/public visibility controls, a save action, and a cancel/close action; no `POST /api/v1/lists` request is sent before save. | LIST-003-US-001 | Yes | UI E2E | Smoke cadence. |
| LIST-003-US-001-TC-002 | Create-list modal exposes required dialog semantics | Accessibility, UI | Critical | Create-list dialog is open. | Dialog/sheet UI. | 1. Inspect accessibility tree. 2. Inspect initial focus. 3. Inspect background interactivity. | Modal has `role="dialog"` or equivalent sheet dialog semantics, `aria-modal="true"`, and an accessible name matching the visible title; initial focus moves inside the modal; background content is inert to keyboard and pointer interaction. | LIST-003-US-001 | Yes | Accessibility | Smoke cadence. Source: A11Y-001-US-001, A11Y-001-US-002, A11Y-001-US-003, A11Y-001-US-010. |
| LIST-003-US-001-TC-003 | Create-list form fields have explicit labels | Accessibility, UI | Critical | Create-list dialog is open. | Name input and visibility controls. | 1. Inspect the name input. 2. Inspect private and public controls. 3. Inspect accessible names. | Name input has a programmatic label that is not only placeholder text; private and public visibility controls have accessible names matching visible purpose; both visibility options expose their selected state programmatically. | LIST-003-US-001 | Yes | Accessibility | Smoke cadence. |
| LIST-003-US-001-TC-004 | Open create flow does not expose stale private list data | UI, Security, Privacy | Critical | Auth state is valid for `u_owner`; previous session cache contains another user's private list name. | Cached name `Other Private List`; create dialog. | 1. Sign in as `u_owner`. 2. Open create-list flow. 3. Inspect visible UI, DOM, and accessibility tree. | Create dialog contains only blank/default create fields; it does not render another user's list name, list ID, private notes, owner identifier, hidden metadata, or mutation state. | LIST-003-US-001 | Yes | Security | Smoke cadence. |
| LIST-003-US-001-TC-005 | Feature ownership boundary is traceable | Traceability Verification, Manual | Medium | QA traceability review is being performed. | LIST-003, LIST-004, LIST-005, LIST-006, PUBLIC-*, PROFILE-*. | 1. Review LIST-003 scope. 2. Map create, rename, delete, visibility-change, public browse, and profile count ownership. 3. Confirm out-of-scope behavior is covered elsewhere. | LIST-003 executable tests stay inside create flow, initial visibility, validation, create response, failure retry, cancel, and post-create navigation; rename/delete/post-create visibility changes/public browsing/profile counts remain traceability or their own feature packages. | LIST-003-US-001 | No | Manual | Manual Review cadence. |

## LIST-003-US-002 - Require authentication to create

User Story Summary: As the system, I want only authenticated users creating lists so that ownership is valid.

Related Feature ID: `LIST-003`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-003-US-002-TC-001 | Guest API create request returns 401 | API, Authentication, Security, Negative | Critical | No Bearer token is supplied. | Fixture J payload. | 1. Send `POST /api/v1/lists` without authentication. 2. Inspect response status and body. 3. Query owned lists as an authenticated admin/test observer if available. | Response status is `401 Unauthorized`; response contains no created list ID, list name, visibility, owner data, tokens, stack trace, SQL details, or debug fields; no `Guest List` row is created. | LIST-003-US-002 | Yes | API | Smoke cadence. |
| LIST-003-US-002-TC-002 | Guest UI cannot submit create mutation | UI, Authentication, Security | Critical | No valid session exists. | `/lists` create entry point. | 1. Clear auth state. 2. Open `/lists`. 3. Inspect visible UI, DOM, accessibility tree, and network while attempting to reach create flow. | Authentication prompt or denial state is shown; create-list mutation controls are not available to the guest; no `POST /api/v1/lists` request is sent. | LIST-003-US-002 | Yes | Security | Smoke cadence. |
| LIST-003-US-002-TC-003 | Expired session blocks create without private-data flash | UI, Authentication, Privacy, Security | Critical | Browser has expired token and stale private create state. | Expired token; stale typed name `Private Draft`. | 1. Open `/lists` with expired token. 2. Attempt to open or submit create flow. 3. Inspect first paint, final denial state, DOM, accessibility tree, and network. | `POST /api/v1/lists` is not accepted and any protected request returns `401 Unauthorized`; stale name `Private Draft`, owned-list data, owner IDs, and mutation controls do not appear before or after denial. | LIST-003-US-002 | Yes | Security | Regression cadence. |
| LIST-003-US-002-TC-004 | Auth recovery allows fresh create after valid sign-in | UI, Authentication, Integration | High | User starts as guest, then signs in as `u_owner`. | Fixture A UI input. | 1. Open `/lists` unauthenticated and confirm denial. 2. Sign in as `u_owner`. 3. Open create flow. 4. Enter Fixture A input and save. | After sign-in, create dialog opens with blank/default fields; saving Fixture A sends authenticated `POST /api/v1/lists`; response is `201 Created`; no guest-state error remains visible. | LIST-003-US-002 | Yes | UI E2E | Regression cadence. |

## LIST-003-US-003 - Require list name

User Story Summary: As the system, I want list name required so that lists have usable metadata.

Related Feature ID: `LIST-003`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-003-US-003-TC-001 | Missing name API request returns 422 | API, Validation, Negative | Critical | `u_owner` is authenticated. | `POST /api/v1/lists` body `{ "visibility": "private" }`. | 1. Send authenticated request without `name`. 2. Inspect response and list collection. | Response status is `422 Validation Error`; no new list is created; error payload identifies `name` and contains no tokens, stack traces, SQL details, or debug fields. | LIST-003-US-003 | Yes | API | Smoke cadence. |
| LIST-003-US-003-TC-002 | Empty name API request returns 422 | API, Validation, Negative | Critical | `u_owner` is authenticated. | Fixture G payload. | 1. Send authenticated request with `name=""`. 2. Inspect response and owned-list collection. | Response status is `422 Validation Error`; no list with empty name is created; error payload identifies `name`. | LIST-003-US-003 | Yes | API | Smoke cadence. |
| LIST-003-US-003-TC-003 | UI prevents save with empty name and focuses name field | UI, Validation, Accessibility, Negative | Critical | Create-list dialog is open. | Empty name input; visibility `private`. | 1. Leave name empty. 2. Activate save. 3. Inspect focus, validation text, DOM, and network. | No `POST /api/v1/lists` request is sent; focus is on the name field or error summary linked to it; visible and programmatic error identifies the name field. | LIST-003-US-003 | Yes | Accessibility | Smoke cadence. Source: A11Y-001-US-014, A11Y-001-US-015. |
| LIST-003-US-003-TC-004 | Minimum valid one-character name creates list | API, Boundary, Positive | High | `u_owner` is authenticated. | Fixture D payload. | 1. Send authenticated request with `name="A"`. 2. Inspect response. | Response status is `201 Created`; response `name="A"`; response `visibility="private"`; response `placeCount=0`; new list ID is present and unique. | LIST-003-US-003 | Yes | API | Regression cadence. |

## LIST-003-US-004 - Reject whitespace-only name

User Story Summary: As the system, I want whitespace-only names rejected so that blank-looking lists are impossible.

Related Feature ID: `LIST-003`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-003-US-004-TC-001 | Whitespace-only name API request returns 422 | API, Validation, Negative | Critical | `u_owner` is authenticated. | Fixture H payload. | 1. Send authenticated request with five spaces as `name`. 2. Inspect response and owned-list collection. | Response status is `422 Validation Error`; no list is created; error payload identifies `name`; no blank-looking row appears in `GET /api/v1/lists`. | LIST-003-US-004 | Yes | API | Smoke cadence. |
| LIST-003-US-004-TC-002 | UI rejects whitespace-only name after trimming | UI, Validation, Accessibility, Negative | Critical | Create-list dialog is open. | Name input contains five spaces; visibility `private`. | 1. Enter five spaces in name field. 2. Activate save. 3. Inspect validation state and network. | No `POST /api/v1/lists` request is sent; visible error is associated with the name field; focus moves to the name field or linked error summary. | LIST-003-US-004 | Yes | Accessibility | Smoke cadence. |
| LIST-003-US-004-TC-003 | Validation message uses Western digit limit text when length is referenced | Accessibility, Localization, Validation | Medium | Name validation error is visible and includes numeric limit text. | Invalid name error surface. | 1. Trigger name validation. 2. Inspect visible text and accessibility tree. | Any numeric limit in validation text uses Western digits such as `80`; Arabic-Indic digits are absent; numeric fragment is announced with context. | LIST-003-US-004 | Yes | Accessibility | Regression cadence. Source: RESP-004-US-001, RESP-004-US-007, RESP-004-US-009. |

## LIST-003-US-005 - Trim list name on create

User Story Summary: As a user, I want accidental spacing cleaned so that list names look intentional.

Related Feature ID: `LIST-003`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-003-US-005-TC-001 | Arabic name is trimmed before persistence | API, Positive, Localization, Arabic | High | `u_owner` is authenticated. | Fixture C payload. | 1. Send authenticated create request. 2. Inspect response body. 3. Request owned lists and inspect the new row. | Create response status is `201 Created`; response `name="برجر الرياض"` without leading/trailing spaces; owned-list row for the new ID also displays `برجر الرياض`. | LIST-003-US-005 | Yes | API | Smoke cadence. |
| LIST-003-US-005-TC-002 | English name is trimmed before persistence | API, Positive | High | `u_owner` is authenticated. | Body `{ "name": "  Weekend Food  ", "visibility": "private" }`. | 1. Send authenticated request. 2. Inspect response and owned-list row. | Response status is `201 Created`; response `name="Weekend Food"`; no leading/trailing spaces appear in response, DOM, or accessibility tree. | LIST-003-US-005 | Yes | API | Regression cadence. |
| LIST-003-US-005-TC-003 | Mixed Arabic/English name is preserved after edge trimming | API, UI, Localization, RTL | High | `u_owner` is authenticated. | Body `{ "name": "  Riyadh برجر 2026  ", "visibility": "private" }`. | 1. Send authenticated request. 2. Open new list detail route. 3. Inspect rendered name. | Response status is `201 Created`; persisted name is exactly `Riyadh برجر 2026`; interior spaces and mixed-language text are preserved; rendered name is not mojibake. | LIST-003-US-005 | Yes | UI E2E | Regression cadence. Source: RESP-002-US-018. |
| LIST-003-US-005-TC-004 | Punctuation in valid name is preserved after trimming | API, Positive | Medium | `u_owner` is authenticated. | Body `{ "name": "  Burger & Fries - 2026!  ", "visibility": "private" }`. | 1. Send authenticated request. 2. Inspect response name. | Response status is `201 Created`; response `name="Burger & Fries - 2026!"`; only leading and trailing spaces are removed. | LIST-003-US-005 | Yes | API | Regression cadence. |
| LIST-003-US-005-TC-005 | Emoji name handling requires explicit product decision | Requirement Clarification, Manual | Medium | QA requirements review is being performed. | Example name `Weekend 🍔`. | 1. Review LIST-003 name validation requirements. 2. Confirm whether emoji are accepted, rejected, sanitized, or normalized. | No executable emoji assertion is added until accepted/rejected emoji behavior is documented. | LIST-003-US-005 | No | Manual | Manual Review cadence. |

## LIST-003-US-006 - Enforce list name max length

User Story Summary: As the system, I want list names bounded so that UI and storage remain safe.

Related Feature ID: `LIST-003`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-003-US-006-TC-001 | Exactly 80-character trimmed name is accepted | API, Boundary, Positive | Critical | `u_owner` is authenticated. | Fixture E payload. | 1. Send authenticated request with trimmed name length exactly `80`. 2. Inspect status and response. | Response status is `201 Created`; response name length is exactly `80`; `visibility="private"`; `placeCount=0`. | LIST-003-US-006 | Yes | API | Smoke cadence. |
| LIST-003-US-006-TC-002 | 81-character trimmed name is rejected | API, Boundary, Validation, Negative | Critical | `u_owner` is authenticated. | Fixture F payload. | 1. Send authenticated request with trimmed name length exactly `81`. 2. Inspect response and owned-list collection. | Response status is `422 Validation Error`; no list is created; error payload identifies `name`; no partial `ListResponse` is returned. | LIST-003-US-006 | Yes | API | Smoke cadence. |
| LIST-003-US-006-TC-003 | UI blocks over-80 name and preserves entered value for correction | UI, Boundary, Validation, Accessibility | Critical | Create-list dialog is open. | Name length `81`; visibility `private`. | 1. Enter 81-character name. 2. Activate save. 3. Inspect validation state, focus, and field value. | Validation error is visible and programmatically associated with name field; focus moves to name field or linked error summary; original 81-character value remains available for editing; no successful list row is created. | LIST-003-US-006 | Yes | Accessibility | Regression cadence. Source: A11Y-001-US-014, A11Y-001-US-015. |
| LIST-003-US-006-TC-004 | Leading/trailing spaces do not count after trim when final name is 80 characters | API, Boundary, Positive | High | `u_owner` is authenticated. | Body has one leading and one trailing space around an 80-character name. | 1. Send authenticated request. 2. Inspect response name and length. | Response status is `201 Created`; persisted name excludes the two edge spaces and has length exactly `80`. | LIST-003-US-006 | Yes | API | Regression cadence. |

## LIST-003-US-007 - Default new list to private

User Story Summary: As a user, I want safe privacy defaults so that a list is not accidentally public.

Related Feature ID: `LIST-003`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-003-US-007-TC-001 | Omitted visibility defaults to private in API response | API, Privacy, Security | Critical | `u_owner` is authenticated. | Body `{ "name": "Default Private" }`. | 1. Send authenticated request without `visibility`. 2. Inspect response. | Response status is `201 Created`; response `name="Default Private"`; response `visibility="private"`; `placeCount=0`; no public-list owner metadata is returned. | LIST-003-US-007 | Yes | API | Smoke cadence. |
| LIST-003-US-007-TC-002 | Save without changing visibility creates private list | UI, Privacy, Security | Critical | Create-list dialog is open with default controls. | Name `Default UI Private`; leave visibility unchanged. | 1. Enter list name. 2. Save without selecting public. 3. Inspect request payload and response. | `POST /api/v1/lists` either omits `visibility` or sends `visibility="private"`; response status is `201 Created`; response `visibility="private"`; new detail route represents an owned private list. | LIST-003-US-007 | Yes | UI E2E | Smoke cadence. |
| LIST-003-US-007-TC-003 | Default-private list is not exposed through public browsing as LIST-003 integration trace | Traceability Verification, Manual | Medium | A list was created by omitted visibility. | PUBLIC-* requirements and LIST-003 default-private rule. | 1. Review PUBLIC-003 private-list exclusion requirements. 2. Confirm public browse tests cover private-list absence. | LIST-003 verifies creation response `visibility="private"`; public route exclusion remains PUBLIC-003-owned and traceable. | LIST-003-US-007 | No | Manual | Manual Review cadence. |

## LIST-003-US-008 - Create private list

User Story Summary: As a user, I want to create a private list so that only I can access it through owned routes.

Related Feature ID: `LIST-003`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-003-US-008-TC-001 | Create private list returns documented ListResponse | API, Contract, Privacy, Security | Critical | `u_owner` is authenticated; Fixture A name is unique for user. | Fixture A payload. | 1. Send authenticated `POST /api/v1/lists`. 2. Inspect status and response fields. | Response status is `201 Created`; response includes `id`, `name="Weekend Food"`, `visibility="private"`, and `placeCount=0`; `id` is non-empty and differs from existing list IDs. | LIST-003-US-008 | Yes | API | Smoke cadence. |
| LIST-003-US-008-TC-002 | Create response excludes forbidden fields | API, Contract, Privacy, Security | Critical | `u_owner` is authenticated. | Fixture A payload. | 1. Send create request. 2. Recursively inspect response JSON and rendered success state. | Response status is `201 Created`; response and success UI contain no owner email, internal user ID, refresh token, session token, private notes, list membership items, moderation fields, audit fields, stack traces, raw SQL, or debug fields. | LIST-003-US-008 | Yes | Security | Smoke cadence. |
| LIST-003-US-008-TC-003 | Private list creation increments owned-list count after refresh | UI, Integration, Data Integrity | High | `u_owner` owns 2 lists before create; LIST-002 count integration applies. | Fixture A payload; expected count `3`. | 1. Capture current owned-list count `2`. 2. Create Fixture A list. 3. Refresh owned-list data. | `POST /api/v1/lists` returns `201 Created`; after refresh, owned-list count is exactly `3`; new list appears once with `visibility="private"` and `placeCount=0`. | LIST-003-US-008 | Yes | UI E2E | Regression cadence. Source: LIST-002-US-004 integration. |
| LIST-003-US-008-TC-004 | Private creation does not create duplicate row on single submit | API, Data Integrity | High | `u_owner` is authenticated; Fixture A name is unique. | One save activation for Fixture A. | 1. Submit Fixture A exactly once. 2. Request `GET /api/v1/lists`. 3. Count rows with returned new ID. | Create response status is `201 Created`; owned-list collection contains exactly one row with the new list ID; no duplicate row is created from one submit. | LIST-003-US-008 | Yes | API | Regression cadence. |

## LIST-003-US-009 - Create public list

User Story Summary: As a user, I want to create a public list so that authenticated users can view it through public-list routes.

Related Feature ID: `LIST-003`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-003-US-009-TC-001 | Create public list returns visibility public | API, Contract, Privacy | High | `u_owner` is authenticated; Fixture B name is unique. | Fixture B payload. | 1. Send authenticated `POST /api/v1/lists`. 2. Inspect response fields. | Response status is `201 Created`; response `name="Cafe Tour"`; response `visibility="public"`; response `placeCount=0`; no private owner fields are returned. | LIST-003-US-009 | Yes | API | Smoke cadence. |
| LIST-003-US-009-TC-002 | Public visibility selection is reflected in request payload | UI, Privacy | High | Create-list dialog is open. | Name `Cafe Tour UI`; select public. | 1. Enter name. 2. Select public visibility. 3. Save. 4. Inspect network request and response. | `POST /api/v1/lists` request body includes `visibility="public"`; response status is `201 Created`; response `visibility="public"`. | LIST-003-US-009 | Yes | UI E2E | Regression cadence. |
| LIST-003-US-009-TC-003 | Public-list browsing eligibility remains PUBLIC-owned | Traceability Verification, Manual | Medium | Public list was created successfully. | LIST-003-US-009 and PUBLIC-* requirements. | 1. Review LIST-003 create public acceptance. 2. Review PUBLIC-001/PUBLIC-002 public browse/detail requirements. | LIST-003 validates creation response `visibility="public"` and owner management eligibility; public index/detail discoverability, ordering, read-only behavior, and public owner display remain PUBLIC-owned. | LIST-003-US-009 | No | Manual | Manual Review cadence. |

## LIST-003-US-010 - Reject invalid visibility

User Story Summary: As the system, I want only approved visibility values so that privacy cannot drift.

Related Feature ID: `LIST-003`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-003-US-010-TC-001 | Unsupported visibility string returns 422 | API, Validation, Privacy, Security, Negative | Critical | `u_owner` is authenticated. | Body `{ "name": "Bad Visibility", "visibility": "friends" }`. | 1. Send authenticated request. 2. Inspect response and owned-list collection. | Response status is `422 Validation Error`; no list is created; error payload identifies `visibility`; no partial `ListResponse` is returned. | LIST-003-US-010 | Yes | API | Smoke cadence. |
| LIST-003-US-010-TC-002 | Blank visibility string returns 422 | API, Validation, Privacy, Negative | Critical | `u_owner` is authenticated. | Body `{ "name": "Blank Visibility", "visibility": "" }`. | 1. Send authenticated request. 2. Inspect response. | Response status is `422 Validation Error`; no list is created; error payload identifies `visibility`. | LIST-003-US-010 | Yes | API | Smoke cadence. |
| LIST-003-US-010-TC-003 | Wrong-case visibility is rejected | API, Validation, Privacy, Negative | High | `u_owner` is authenticated. | Body `{ "name": "Wrong Case", "visibility": "Private" }`. | 1. Send authenticated request. 2. Inspect response. | Response status is `422 Validation Error`; no list is created; only exact values `private` and `public` are accepted. | LIST-003-US-010 | Yes | API | Regression cadence. |
| LIST-003-US-010-TC-004 | Injected visibility value is rejected without leaking internals | API, Security, Validation, Negative | Critical | `u_owner` is authenticated. | Body `{ "name": "Injected Visibility", "visibility": "public<script>" }`. | 1. Send authenticated request. 2. Inspect error response recursively. | Response status is `422 Validation Error`; no list is created; error payload contains no script echo in executable context, stack trace, raw SQL, debug fields, tokens, or owner metadata. | LIST-003-US-010 | Yes | Security | Smoke cadence. |
| LIST-003-US-010-TC-005 | `null` visibility behavior requires schema clarification | Requirement Clarification, Manual | Medium | API schema review is being performed. | Body `{ "name": "Null Visibility", "visibility": null }`. | 1. Review API schema and source requirements. 2. Confirm whether explicit `null` is treated as omitted or invalid. | No executable assertion is made for explicit `null` visibility until request-shape behavior is documented; omitted visibility remains executable as private default. | LIST-003-US-010 | No | Manual | Manual Review cadence. |

## LIST-003-US-011 - Allow duplicate list names

User Story Summary: As a user, I want duplicate list names allowed so that I can organize flexibly.

Related Feature ID: `LIST-003`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-003-US-011-TC-001 | Same owner can create duplicate list name | API, Data Integrity, Positive | High | `u_owner` already owns `dup_existing` named `Weekend Food`. | Fixture I payload. | 1. Send authenticated create request with duplicate name. 2. Inspect response. 3. Query owned lists. | Response status is `201 Created`; response `name="Weekend Food"`; returned `id` differs from `dup_existing`; owned lists contain both IDs. | LIST-003-US-011 | Yes | API | Smoke cadence. |
| LIST-003-US-011-TC-002 | Duplicate names across users are independent | API, Data Integrity, Privacy | Medium | `u_other` owns list named `Weekend Food`; `u_owner` has no list with that name. | `u_owner` creates `{ "name": "Weekend Food", "visibility": "private" }`. | 1. Send create request as `u_owner`. 2. Inspect response and owned-list collection. | Response status is `201 Created`; new list belongs to `u_owner`; response does not expose `u_other` list ID, owner identity, visibility, or metadata. | LIST-003-US-011 | Yes | API | Regression cadence. |
| LIST-003-US-011-TC-003 | Duplicate-name UI does not show conflict error | UI, Data Integrity, Regression | Medium | `u_owner` already owns a list named `Weekend Food`. | Create another `Weekend Food` private list. | 1. Open create dialog. 2. Enter duplicate name. 3. Save. 4. Inspect success/navigation state. | No duplicate-name validation error appears; `POST /api/v1/lists` returns `201 Created`; app navigates to `/lists/{newListId}` for the new ID. | LIST-003-US-011 | Yes | UI E2E | Regression cadence. |
| LIST-003-US-011-TC-004 | Duplicate-name conflict status remains disallowed by requirements | Traceability Verification, Manual | Medium | QA contract review is being performed. | Duplicate-name create scenario. | 1. Review LIST-003-US-011 and duplicate-name business rule. 2. Review API tests. | Duplicate list names are allowed; LIST-003 executable tests must not expect `409 Conflict` for same-user or cross-user duplicate names unless requirements change. | LIST-003-US-011 | No | Manual | Manual Review cadence. |

## LIST-003-US-012 - Navigate to new list detail after create

User Story Summary: As a user, I want to land in the new list immediately so that I can add places next.

Related Feature ID: `LIST-003`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-003-US-012-TC-001 | Successful create closes dialog and opens new list detail route | UI, Navigation, Positive | Critical | Create dialog is open; Fixture A is submitted successfully. | Response includes `id="list_new_123"`. | 1. Submit Fixture A through UI. 2. Wait for `201 Created`. 3. Inspect dialog state and route. | Dialog/sheet is closed; current route is `/lists/list_new_123`; route ID matches the ID returned by `POST /api/v1/lists`; app does not remain in the dialog and does not navigate to `/lists` only. | LIST-003-US-012 | Yes | UI E2E | Smoke cadence. |
| LIST-003-US-012-TC-002 | Navigation uses list ID, not list name | UI, Navigation, Data Integrity | High | Create response returns `id="list_id_456"` and `name="Weekend Food"`. | Fixture A response. | 1. Create list through UI. 2. Inspect final URL. | Final URL is `/lists/list_id_456`; URL does not use `Weekend Food` as identity. | LIST-003-US-012 | Yes | UI E2E | Regression cadence. Source: list identity is the list ID, not name. |
| LIST-003-US-012-TC-003 | Focus after create navigation lands on logical destination | Accessibility, Navigation | High | Create succeeds and trigger unmounts due to route change. | New list detail route. | 1. Submit Fixture A. 2. Wait for route change. 3. Inspect focused element. | Focus is not lost to `body`; focus moves to a logical fallback such as new page heading, first meaningful detail control, or configured route focus target. | LIST-003-US-012 | Yes | Accessibility | Regression cadence. Source: A11Y-001-US-007. |
| LIST-003-US-012-TC-004 | List detail content assertions remain LIST-007-owned | Traceability Verification, Manual | Medium | New detail route opens after create. | LIST-007 owned list detail requirements. | 1. Review LIST-003 navigation handoff. 2. Review LIST-007 detail content coverage. | LIST-003 validates route handoff to `/lists/{newListId}` only; detail metadata, membership rows, and detail authorization remain LIST-007-owned. | LIST-003-US-012 | No | Manual | Manual Review cadence. |

## LIST-003-US-013 - Preserve input after create failure

User Story Summary: As a user, I want to retry after failure without retyping.

Related Feature ID: `LIST-003`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-003-US-013-TC-001 | Network failure preserves name and visibility selection | UI, Error Handling, Loading | High | Create dialog is open; network failure is simulated. | Name `Retry List`; visibility `public`. | 1. Enter name and select public. 2. Submit. 3. Fail `POST /api/v1/lists` with network error. 4. Inspect dialog fields. | Dialog remains open; name field still contains `Retry List`; public visibility remains selected; no new list ID is present; error state is visible with retry path. | LIST-003-US-013 | Yes | UI E2E | Regression cadence. |
| LIST-003-US-013-TC-002 | 5xx failure preserves input and does not navigate | UI, Error Handling, Negative | High | Create dialog is open; API returns server error. | Name `Server Error Retry`; visibility `private`; `500 Internal Server Error`. | 1. Submit valid input. 2. Return `500 Internal Server Error` from `POST /api/v1/lists`. 3. Inspect route and fields. | Dialog remains open; route does not change; name and private selection remain; no list detail route opens; error text is visible and privacy-safe. | LIST-003-US-013 | Yes | UI E2E | Regression cadence. |
| LIST-003-US-013-TC-003 | Retry after transient failure sends same corrected payload once | UI, Error Handling, Regression | High | First create request fails; second request succeeds. | Name `Retry List`; visibility `public`; first failure, second `201 Created`. | 1. Submit valid input and fail first request. 2. Activate retry/save again. 3. Capture second request body and response. | Second request body is `{ "name": "Retry List", "visibility": "public" }`; only one retry request is sent per activation; second response status is `201 Created`; app navigates to returned `/lists/{newListId}`. | LIST-003-US-013 | Yes | UI E2E | Regression cadence. |
| LIST-003-US-013-TC-004 | Pending create announces loading and prevents duplicate submit | UI, Loading, Accessibility, Data Integrity | Critical | Create dialog is open; API request is delayed. | Fixture A payload with delayed response. | 1. Submit Fixture A. 2. Hold request pending. 3. Try activating save again. 4. Inspect loading/accessibility state and network. | Pending state is communicated with visible status, `aria-busy`, or equivalent accessible status; duplicate save activation does not send a second `POST /api/v1/lists`; fields are not cleared while pending. | LIST-003-US-013 | Yes | Accessibility | Smoke cadence. Source: A11Y-001-US-016. |
| LIST-003-US-013-TC-005 | Error payload and rendered error do not expose internals | API, Error Handling, Security, Privacy | High | `u_owner` is authenticated; server returns 500 during create. | Fixture A payload; `500 Internal Server Error`. | 1. Submit create request. 2. Inspect error response and rendered UI. | Response status is `500 Internal Server Error`; response and UI error contain no owner email, internal user ID, tokens, list table names, stack traces, raw SQL, moderation fields, audit fields, or debug fields. | LIST-003-US-013 | Yes | Security | Regression cadence. |

## LIST-003-US-014 - Cancel create without mutation

User Story Summary: As a user, I want cancel to leave data unchanged.

Related Feature ID: `LIST-003`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-003-US-014-TC-001 | Cancel empty create dialog sends no mutation | UI, Positive | Medium | Create dialog is open with no typed input. | Empty form. | 1. Open create dialog. 2. Activate cancel/close. 3. Inspect network requests. | Dialog closes; focus returns to create trigger; zero `POST /api/v1/lists` requests are sent. | LIST-003-US-014 | Yes | UI E2E | Regression cadence. Source: A11Y-001-US-006. |
| LIST-003-US-014-TC-002 | Cancel with unsaved input and confirmation closes without mutation | UI, UX, Accessibility | Medium | Create dialog is open with unsaved name. | Name `Unsaved Draft`; visibility `private`; unsaved-change guard appears. | 1. Enter `Unsaved Draft`. 2. Activate cancel. 3. Confirm discard in the guard. 4. Inspect network. | Guard is keyboard-operable and screen-reader understandable; after discard confirmation, dialog closes; zero `POST /api/v1/lists` requests are sent. | LIST-003-US-014 | Yes | Accessibility | Regression cadence. Source: A11Y-001-US-017. |
| LIST-003-US-014-TC-003 | Unsaved-change guard absence remains allowed by source wording | Requirement Clarification, Manual | Low | Requirements review is being performed. | Source says confirm any unsaved-change guard if shown. | 1. Review LIST-003-US-014. 2. Confirm whether unsaved-change guard is required or optional. | LIST-003 executable tests must not fail solely because no unsaved-change guard appears unless product requirements make the guard mandatory. | LIST-003-US-014 | No | Manual | Manual Review cadence. |

## LIST-003-US-015 - Announce create validation errors

User Story Summary: As a screen-reader user, I want validation errors announced so that I can fix the form.

Related Feature ID: `LIST-003`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-003-US-015-TC-001 | First invalid field receives focus on missing name | Accessibility, Validation, Negative | High | Create dialog is open. | Missing name; visibility `private`. | 1. Activate save with empty name. 2. Inspect focus and accessibility tree. | Focus moves to name field or an error summary linked to name; error text is programmatically associated with the name field; focus remains inside dialog/sheet. | LIST-003-US-015 | Yes | Accessibility | Smoke cadence. Source: A11Y-001-US-014, A11Y-001-US-015. |
| LIST-003-US-015-TC-002 | Invalid visibility error is announced | Accessibility, Validation, Negative | High | API returns invalid visibility validation error. | Body with `visibility="friends"`. | 1. Submit invalid visibility request through controlled UI/API harness. 2. Inspect rendered error and accessibility tree. | Error associated with visibility control is exposed through accessible error text or live region; focus remains inside dialog/sheet; invalid value is not persisted. | LIST-003-US-015 | Yes | Accessibility | Regression cadence. Source: A11Y-001-US-014. |
| LIST-003-US-015-TC-003 | Keyboard-only user can complete valid creation | Accessibility, Keyboard, Positive | High | Create trigger is reachable by keyboard; Fixture A is valid. | Keyboard-only path; Fixture A input. | 1. Tab to create trigger and press Enter. 2. Type name. 3. Select private visibility using keyboard. 4. Activate save by keyboard. | Focus-visible indicator appears on each focused control; all controls are reachable without pointer input; `POST /api/v1/lists` returns `201 Created`; route opens `/lists/{newListId}`. | LIST-003-US-015 | Yes | Accessibility | Smoke cadence. Source: RESP-001-US-007, RESP-001-US-008, A11Y-001-US-004. |
| LIST-003-US-015-TC-004 | Escape closes dismissible create dialog and restores focus | Accessibility, Keyboard | Medium | Create dialog is open with no unsaved input. | Escape key. | 1. Open create dialog from trigger. 2. Press Escape. 3. Inspect focus. | Dialog closes; focus returns to create trigger; no `POST /api/v1/lists` request is sent. | LIST-003-US-015 | Yes | Accessibility | Regression cadence. Source: A11Y-001-US-006, A11Y-001-US-008. |
| LIST-003-US-015-TC-005 | Forced-colors keeps form state visible | Accessibility, Responsive | Medium | Forced-colors mode is active; create dialog is open. | Name field, visibility selected state, focus, validation error. | 1. Enable forced-colors mode. 2. Open create dialog. 3. Trigger validation error. 4. Inspect visual states. | Name text, labels, selected visibility state, error text, button borders, and focus indicators remain distinguishable; no required form text disappears. | LIST-003-US-015 | Yes | Accessibility | Nightly cadence. Source: RESP-003-US-014, RESP-003-US-015. |

## LIST-003-US-016 - Keep create flow mobile-safe

User Story Summary: As a mobile user, I want list creation usable without zooming.

Related Feature ID: `LIST-003`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-003-US-016-TC-001 | Create sheet fits 320x568 with virtual keyboard pressure | Responsive, Mobile, Accessibility | High | Mobile viewport `320x568`; create sheet is open; virtual keyboard pressure is simulated. | Name field focused. | 1. Set viewport to `320x568`. 2. Open create flow. 3. Focus name field. 4. Inspect layout and action reachability. | Name field, visibility controls, save, cancel, and close controls remain visible or reachable through internal sheet scrolling; `document.documentElement.scrollWidth <= window.innerWidth`; no action is hidden behind bottom navigation or safe-area padding. | LIST-003-US-016 | Yes | UI E2E | Smoke cadence. Source: LIST-003-US-016, RESP-002-US-009, RESP-002-US-011. |
| LIST-003-US-016-TC-002 | Create dialog fits 390x844 and 430x932 | Responsive, Mobile | High | Create flow is open. | Viewports `390x844` and `430x932`. | 1. Open create flow at `390x844`. 2. Inspect all controls. 3. Repeat at `430x932`. | At both widths, name, visibility, save, cancel, and close controls are readable and reachable; no horizontal overflow occurs. | LIST-003-US-016 | Yes | UI E2E | Regression cadence. Source: RESP-002-US-001, RESP-002-US-002, RESP-002-US-011. |
| LIST-003-US-016-TC-003 | Create flow supports phone landscape | Responsive, Mobile, Landscape | High | Phone landscape viewport is active. | Viewport `844x390`; create dialog/sheet. | 1. Set viewport to phone landscape. 2. Open create flow. 3. Inspect dialog/sheet and controls. | Dialog/sheet content scrolls internally as needed; name, visibility, save, cancel, and close controls remain reachable; no horizontal overflow occurs. | LIST-003-US-016 | Yes | UI E2E | Regression cadence. Source: RESP-002-US-012. |
| LIST-003-US-016-TC-004 | Create flow supports 200% zoom | Responsive, Accessibility, Low Vision | High | Browser zoom is `200%`; create flow is open. | Fixture A input. | 1. Set zoom to `200%`. 2. Open create flow. 3. Complete Fixture A input. 4. Inspect layout and submit. | `document.documentElement.scrollWidth <= window.innerWidth`; form controls remain reachable; save can be activated; touch/click targets are at least `44x44` CSS pixels where applicable. | LIST-003-US-016 | Yes | Accessibility | Regression cadence. Source: RESP-003-US-001, RESP-003-US-002, RESP-003-US-008, A11Y-001-US-019. |
| LIST-003-US-016-TC-005 | Long 80-character name remains contained in create field | Responsive, Boundary | High | Create flow is open at `320x568`. | Fixture E name. | 1. Enter 80-character name. 2. Inspect input, validation area, and actions. | Name input content does not cause page-level horizontal overflow; save/cancel remain reachable; validation area does not overlap controls. | LIST-003-US-016 | Yes | UI E2E | Regression cadence. Source: RESP-002-US-016, RESP-002-US-017, RESP-002-US-018. |
| LIST-003-US-016-TC-006 | Reduced motion keeps create flow functional | Accessibility, Responsive | Medium | Reduced motion is active; create flow has loading and navigation transition. | `prefers-reduced-motion: reduce`; Fixture A. | 1. Enable reduced motion. 2. Open create flow. 3. Submit Fixture A. 4. Inspect loading and navigation. | No critical information relies on animation; loading is conveyed through accessible status; creation still returns `201 Created` and opens `/lists/{newListId}`. | LIST-003-US-016 | Yes | Accessibility | Nightly cadence. Source: RESP-003-US-016, RESP-003-US-017. |

## Cross-Feature Traceability Cases

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-003-TRACE-TC-001 | Profile list-count update remains PROFILE-owned | Traceability Verification, Manual | Medium | A new list has been created successfully. | PROFILE-001 list-count requirements and LIST-003 create requirements. | 1. Review LIST-003 creation response. 2. Review PROFILE list-count requirements. 3. Confirm profile package owns profile summary assertions. | LIST-003 validates creation and direct navigation; profile `listsCount` update and profile UI rendering remain PROFILE-owned. | LIST-003-US-012 | No | Manual | Manual Review cadence. |
| LIST-003-TRACE-TC-002 | Post-create owned-list index rendering remains LIST-001/LIST-002-owned | Traceability Verification, Manual | Medium | New list was created successfully. | LIST-001 and LIST-002 requirements. | 1. Review list index and count packages. 2. Confirm row rendering and count refresh tests exist outside LIST-003. | LIST-003 validates create response and destination route; owned-list index row rendering and count summary remain LIST-001/LIST-002-owned except direct integration checks cited here. | LIST-003-US-012 | No | Manual | Manual Review cadence. |

## Final Summary

1. User stories processed: 16
2. Total executable test cases: 59
3. Clarification / Manual / Traceability cases: 10
4. Test count per user story:
   - LIST-003-US-001: 5
   - LIST-003-US-002: 4
   - LIST-003-US-003: 4
   - LIST-003-US-004: 3
   - LIST-003-US-005: 5
   - LIST-003-US-006: 4
   - LIST-003-US-007: 3
   - LIST-003-US-008: 4
   - LIST-003-US-009: 3
   - LIST-003-US-010: 5
   - LIST-003-US-011: 4
   - LIST-003-US-012: 6
   - LIST-003-US-013: 5
   - LIST-003-US-014: 3
   - LIST-003-US-015: 5
   - LIST-003-US-016: 6
5. Count by test type:
   - API: 24
   - Accessibility: 18
   - Arabic: 1
   - Authentication: 4
   - Boundary: 6
   - Contract: 3
   - Data Integrity: 7
   - Error Handling: 4
   - Integration: 2
   - Keyboard: 2
   - Landscape: 1
   - Loading: 2
   - Localization: 3
   - Low Vision: 1
   - Manual: 10
   - Mobile: 3
   - Navigation: 3
   - Negative: 14
   - Positive: 11
   - Privacy: 13
   - Regression: 2
   - Requirement Clarification: 3
   - Responsive: 7
   - RTL: 1
   - Security: 11
   - Traceability Verification: 7
   - UI: 23
   - UX: 1
   - Validation: 14
6. Count by priority:
   - Critical: 24
   - High: 26
   - Medium: 18
   - Low: 1
7. Count by automation layer:
   - API: 20
   - Accessibility: 16
   - Security: 6
   - UI E2E: 17
   - Manual: 10
8. Top automation candidates:
   - `POST /api/v1/lists` `201 Created`, `401 Unauthorized`, and `422 Validation Error` contract tests with exact request payloads.
   - API validation matrix for missing, empty, whitespace-only, minimum, maximum, over-maximum, trimmed, duplicate, private, public, and invalid visibility payloads.
   - UI E2E for create dialog/sheet open, visibility selection, submit loading, retry preservation, cancel without mutation, and post-create navigation to `/lists/{newListId}`.
   - Security automation for guest/expired-session denial, forbidden-field checks, no private-data flash, and internal error redaction.
   - Accessibility automation for dialog semantics, labels, focus trap, first invalid field focus, error/live announcements, keyboard-only creation, touch targets, forced colors, reduced motion, and 200% zoom.

## Validation

- Duplicate Test IDs = 0
- Invalid Story References = 0
- Missing User Stories = 0
- Encoding/Mojibake = 0
- API Tests Missing Status Codes = 0
- Requirement Fidelity Violations = 0
- Feature Ownership Violations = 0
