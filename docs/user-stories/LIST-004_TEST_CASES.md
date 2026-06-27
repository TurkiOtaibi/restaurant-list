# LIST-004 Test Cases

Feature: `LIST-004 - Rename owned list`

Source: `docs/user-stories/LISTS_USER_STORIES.md`

Supporting Sources:

- `docs/feature-map/FEATURE_TRACEABILITY.md`
- `docs/user-stories/RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`

Scope: All user stories under `LIST-004`.

## QA Execution Standards

- Test cases validate documented requirements only. Undefined behavior is captured as Requirement Clarification, Manual Verification, or Traceability Verification.
- `LIST-004` owns renaming an owned list, rename validation, rename response, rename UI flow, failed-rename preservation, cancel without mutation, and privacy-safe rename integration.
- `LIST-004` does not own list creation, deletion, visibility changes, adding/removing places, public-list browsing, full profile behavior, or full place-detail containing-list behavior.
- Rename endpoint from traceability: `PATCH /api/v1/lists/{id}` with Bearer authentication, frontend consumer `EditListDialog.tsx`, backend service `update_owned_list_name`.
- List name is required, trimmed before persistence, and limited to 80 characters.
- Duplicate list names are allowed for the same user and across users, including rename.
- Privacy-preserving non-owner denial status is not specified; executable tests assert denial, no mutation, and no private data leakage, while exact non-owner status remains a clarification until specified.
- Executable responsive/accessibility tests cite exact approved global requirements where applicable.
- Automation cadence values used in Notes: Smoke, Regression, Nightly, Manual Review.

## Deterministic Rename Fixtures

| Fixture ID | User Context | Existing List State | Request / UI Input | Expected Result |
|---|---|---|---|---|
| Fixture A | `u_owner` authenticated | `list_rename_1`, name `Weekend Food`, visibility `private`, owner `u_owner`, `updatedAt=2026-06-24T10:00:00Z` | `PATCH /api/v1/lists/list_rename_1` body `{ "name": "Family Favorites" }` | `200 OK`; response `id=list_rename_1`, `name="Family Favorites"`, `updatedAt` differs from previous value; list ID, owner access, visibility, and memberships remain unchanged. |
| Fixture B | `u_owner` authenticated | `list_rename_2`, name `قائمة العائلة`, visibility `private` | `PATCH /api/v1/lists/list_rename_2` body `{ "name": "  قهوة مختصة  " }` | `200 OK`; persisted/displayed `name="قهوة مختصة"` with no leading or trailing spaces. |
| Fixture C | `u_owner` authenticated | `list_rename_3`, name `Current Name` | `PATCH /api/v1/lists/list_rename_3` body `{ "name": "Current Name" }` | `200 OK`; name remains `Current Name`; no duplicate-name error appears. |
| Fixture D | `u_owner` authenticated | `list_rename_4`, name `Original` | `PATCH /api/v1/lists/list_rename_4` body `{ "name": "A" }` | `200 OK`; one-character trimmed name is accepted. |
| Fixture E | `u_owner` authenticated | `list_rename_5`, name `Original` | `PATCH /api/v1/lists/list_rename_5` body `{ "name": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" }` | `200 OK`; 80-character trimmed name is accepted. |
| Fixture F | `u_owner` authenticated | `list_rename_6`, name `Original` | `PATCH /api/v1/lists/list_rename_6` body `{ "name": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" }` | `422 Validation Error`; old name remains `Original`. |
| Fixture G | `u_owner` authenticated | `list_rename_7`, name `Original` | `PATCH /api/v1/lists/list_rename_7` body `{}` | `422 Validation Error`; old name remains `Original`. |
| Fixture H | `u_owner` authenticated | `list_rename_8`, name `Original` | `PATCH /api/v1/lists/list_rename_8` body `{ "name": "" }` | `422 Validation Error`; old name remains `Original`. |
| Fixture I | `u_owner` authenticated | `list_rename_9`, name `Original` | `PATCH /api/v1/lists/list_rename_9` body `{ "name": "     " }` | `422 Validation Error`; old name remains `Original`. |
| Fixture J | `u_owner` authenticated | `list_rename_10`, name `Original`; another owned list `list_duplicate_target`, name `Family Favorites` | `PATCH /api/v1/lists/list_rename_10` body `{ "name": "Family Favorites" }` | `200 OK`; selected list ID updates; duplicate names coexist. |
| Fixture K | `u_other` authenticated | `list_private_owner` belongs to `u_owner`, name `Private Plans` | `PATCH /api/v1/lists/list_private_owner` body `{ "name": "Attack" }` | Access is denied without exposing private list data; old name remains `Private Plans`. |
| Fixture L | `u_owner` authenticated | `list_deleted` was deleted before save | `PATCH /api/v1/lists/list_deleted` body `{ "name": "Recovered Name" }` | `404 Not Found`; no false success appears. |
| Fixture M | no authenticated session | `list_rename_1` exists | `PATCH /api/v1/lists/list_rename_1` body `{ "name": "Guest Rename" }` | `401 Unauthorized`; old name remains unchanged. |
| Fixture N | `u_owner` authenticated | `list_rename_11`, name `Original` | `PATCH /api/v1/lists/list_rename_11` body `{ "name": "  Coffee & Tea - 2026!  " }` | `200 OK`; persisted/displayed `name="Coffee & Tea - 2026!"`. |
| Fixture O | `u_owner` authenticated | `list_rename_12`, name `Original` | `PATCH /api/v1/lists/list_rename_12` body `{ "name": "  Riyadh قهوة 2026  " }` | `200 OK`; persisted/displayed `name="Riyadh قهوة 2026"`. |

## LIST-004-US-001 - Open rename flow

User Story Summary: As a list owner, I want to open edit list so that I can rename a list.

Related Feature ID: `LIST-004`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-004-US-001-TC-001 | Owner opens rename dialog with current name prefilled | UI, Positive | High | `u_owner` owns Fixture A list; list detail or owned-list row edit action is visible. | Existing name `Weekend Food`. | 1. Sign in as `u_owner`. 2. Open the owned list surface that exposes edit. 3. Activate edit/rename. 4. Inspect the dialog/sheet. | Rename dialog/sheet opens; name field value is exactly `Weekend Food`; save and cancel/close controls are present; zero `PATCH /api/v1/lists/list_rename_1` requests are sent before save. | LIST-004-US-001 | Yes | UI E2E | Smoke cadence. |
| LIST-004-US-001-TC-002 | Rename dialog exposes modal accessibility semantics | Accessibility, UI | Critical | Rename dialog is open. | Dialog/sheet UI. | 1. Inspect accessibility tree. 2. Inspect focus. 3. Inspect background interaction. | Dialog/sheet has `role="dialog"` or approved sheet-equivalent modal semantics, `aria-modal="true"`, and an accessible name matching the visible title; initial focus moves inside the dialog; background is inert to keyboard and pointer interaction. | LIST-004-US-001 | Yes | Accessibility | Smoke cadence. Source: A11Y-001-US-001, A11Y-001-US-002, A11Y-001-US-003, A11Y-001-US-010. |
| LIST-004-US-001-TC-003 | Rename field has explicit accessible label | Accessibility, UI | Critical | Rename dialog is open. | Name field. | 1. Inspect name input visible label. 2. Inspect accessible name. 3. Inspect placeholder text. | Name field has a visible or programmatic label identifying it as the list name; placeholder text is not the only label; the accessible name contains no owner email, internal owner ID, private notes, or hidden metadata. | LIST-004-US-001 | Yes | Accessibility | Smoke cadence. Source: LIST-004-US-013, A11Y-001-US-001. |
| LIST-004-US-001-TC-004 | Rename flow does not expose stale private data during auth resolution | UI, Security, Privacy | Critical | Auth state is unresolved or expired; previous session cached private list data. | Cached name `Other Private List`; target page reload. | 1. Open rename entry point while auth is unresolved. 2. Capture first paint, DOM, and accessibility tree. 3. Resolve auth as denied. | Before valid authorization, DOM and accessibility tree contain zero rename dialogs, private list names, list IDs, visibility values, owner identifiers, private notes, or mutation controls. | LIST-004-US-001 | Yes | Security | Smoke cadence. |
| LIST-004-US-001-TC-005 | Feature ownership boundary is traceable | Traceability Verification, Manual | Medium | QA traceability review is being performed. | LIST-004, LIST-005, LIST-006, LIST-007, PUBLIC-*, PROFILE-*. | 1. Review LIST-004 scope. 2. Map rename, delete, visibility, public browsing, profile, and place membership ownership. 3. Confirm out-of-scope behavior is covered elsewhere. | LIST-004 executable tests stay inside rename flow, validation, response, failure preservation, cancel, and privacy-safe rename integration. Creation, deletion, visibility changes, public browsing, adding/removing places, and profile rendering remain separate feature packages. | LIST-004-US-001 | No | Manual | Manual Review cadence. |

## LIST-004-US-002 - Require owner to rename

User Story Summary: As the system, I want only owners to rename lists so that users cannot modify others' collections.

Related Feature ID: `LIST-004`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-004-US-002-TC-001 | Guest rename request returns 401 | API, Authentication, Security, Negative | Critical | No Bearer token is supplied. | Fixture M request. | 1. Send `PATCH /api/v1/lists/list_rename_1` without authentication. 2. Inspect status and payload. 3. Fetch list as `u_owner`. | Response status is `401 Unauthorized`; error payload contains deterministic fields `error.code` and `error.message`; response contains no list name, list ID, owner identity, visibility, private notes, tokens, stack trace, SQL details, or debug fields; owner fetch still shows `Weekend Food`. | LIST-004-US-002 | Yes | API | Smoke cadence. |
| LIST-004-US-002-TC-002 | Expired session blocks rename without private-data flash | UI, Authentication, Privacy, Security | Critical | Browser has expired token; rename dialog may have stale draft. | Expired token; draft name `Expired Rename`. | 1. Open rename surface with expired token. 2. Capture first paint, DOM, accessibility tree, and network. 3. Attempt rename only if controls render. | Protected rename data and controls are absent before auth denial; protected request returns `401 Unauthorized`; zero successful `PATCH` responses occur; stale draft and private list data are absent after denial. | LIST-004-US-002 | Yes | Security | Smoke cadence. |
| LIST-004-US-002-TC-003 | Non-owner rename is denied without exposing private list data | Privacy, Security, Negative | Critical | `u_other` is authenticated; `list_private_owner` belongs to `u_owner`. | Fixture K request. | 1. Send rename request as `u_other`. 2. Inspect response recursively. 3. Fetch original list as `u_owner`. | Access is denied; owner fetch still shows `Private Plans`; response contains no `Private Plans`, owner email, internal owner ID, visibility, place count, private notes, stack trace, SQL details, audit fields, moderation fields, or debug fields. | LIST-004-US-002 | Yes | Security | Smoke cadence. Exact non-owner status remains LIST-004-US-002-TC-004 clarification. |
| LIST-004-US-002-TC-004 | Exact non-owner denial status requires API contract clarification | Requirement Clarification, Manual | Medium | API status contract review is being performed. | Non-owner rename request for private list. | 1. Review LIST-004 Missing Assumptions. 2. Confirm whether non-owner denial must be `404 Not Found`, `403 Forbidden`, or another privacy-preserving denial. | LIST-004 executable tests assert denial, no mutation, and no private data leakage. Exact non-owner status is not asserted until the contract is documented. | LIST-004-US-002 | No | Manual | Manual Review cadence. |
| LIST-004-US-002-TC-005 | Auth recovery allows fresh rename after valid sign-in | UI, Authentication, Integration | High | User starts denied, then signs in as `u_owner`. | Fixture A request through UI. | 1. Open rename surface without valid auth and confirm denial. 2. Sign in as `u_owner`. 3. Open rename for `list_rename_1`. 4. Submit `Family Favorites`. | Fresh rename dialog opens with owner data; `PATCH /api/v1/lists/list_rename_1` returns `200 OK`; response `name="Family Favorites"`; no denied or guest state remains visible. | LIST-004-US-002 | Yes | UI E2E | Regression cadence. |

## LIST-004-US-003 - Rename with valid name

User Story Summary: As a list owner, I want to rename a list so that its title stays accurate.

Related Feature ID: `LIST-004`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-004-US-003-TC-001 | API renames owned list with valid name | API, Positive, Contract | Critical | `u_owner` owns Fixture A list. | Fixture A request. | 1. Send authenticated `PATCH /api/v1/lists/list_rename_1`. 2. Inspect response. 3. Fetch list again through owned route. | Response status is `200 OK`; response body contains `id="list_rename_1"`, `name="Family Favorites"`, and `updatedAt` not equal to `2026-06-24T10:00:00Z`; subsequent owned fetch shows `Family Favorites`. | LIST-004-US-003 | Yes | API | Smoke cadence. |
| LIST-004-US-003-TC-002 | Rename response schema excludes forbidden fields | API, Privacy, Security, Contract | Critical | `u_owner` owns Fixture A list. | Fixture A request. | 1. Send rename request. 2. Recursively inspect response JSON and rendered success state. | Response status is `200 OK`; response includes documented rename fields `id`, `name`, and changed `updatedAt`; response and UI contain no owner email, internal user ID, tokens, private notes, list item rows, moderation fields, audit fields, stack traces, raw SQL, or debug fields. | LIST-004-US-003 | Yes | Security | Smoke cadence. |
| LIST-004-US-003-TC-003 | Rename updates visible name in current owned UI | UI, Integration, Data Integrity | High | `u_owner` is viewing `list_rename_1`; Fixture A succeeds. | Old name `Weekend Food`, new name `Family Favorites`. | 1. Open rename dialog. 2. Submit Fixture A. 3. Inspect current page after success. | Visible list title on the current owned surface is exactly `Family Favorites`; old title `Weekend Food` is absent from the current title region; no duplicate list row is created. | LIST-004-US-003 | Yes | UI E2E | Regression cadence. |
| LIST-004-US-003-TC-004 | Rename preserves list identity and owner access | API, Data Integrity, Regression | High | `u_owner` owns `list_rename_1`; `u_other` does not own it. | Fixture A request. | 1. Send valid rename request as `u_owner`. 2. Fetch `list_rename_1` as `u_owner`. 3. Attempt access as `u_other`. | Rename response status is `200 OK`; owner fetch returns `id="list_rename_1"` and `name="Family Favorites"`; non-owner still cannot mutate the same list ID; no new list ID is returned. | LIST-004-US-003 | Yes | API | Regression cadence. |

## LIST-004-US-004 - Reject empty rename

User Story Summary: As the system, I want empty rename values rejected so that list metadata remains valid.

Related Feature ID: `LIST-004`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-004-US-004-TC-001 | Missing name rename returns 422 and old name remains | API, Validation, Negative | Critical | `u_owner` owns Fixture G list. | Fixture G request. | 1. Send authenticated request without `name`. 2. Inspect response. 3. Fetch list as owner. | Response status is `422 Validation Error`; error payload contains deterministic fields `error.code`, `error.message`, and `error.field="name"`; fetched list name remains `Original`; no partial rename response is returned. | LIST-004-US-004 | Yes | API | Smoke cadence. |
| LIST-004-US-004-TC-002 | Empty name rename returns 422 and old name remains | API, Validation, Negative | Critical | `u_owner` owns Fixture H list. | Fixture H request. | 1. Send authenticated request with `name=""`. 2. Inspect response and fetch old list. | Response status is `422 Validation Error`; error payload identifies `name`; fetched list name remains `Original`; payload contains no stack trace, SQL details, debug fields, tokens, or owner internals. | LIST-004-US-004 | Yes | API | Smoke cadence. |
| LIST-004-US-004-TC-003 | UI empty rename submits deterministic validation state | UI, Validation, Accessibility, Negative | Critical | Rename dialog is open for `list_rename_7`. | Clear the name field. | 1. Clear name field. 2. Activate save. 3. Inspect focus, validation text, network, and persisted title. | One validation error for the name field is visible and programmatically associated with the field; focus moves to the first invalid field or linked error summary; zero successful `PATCH` responses occur; old displayed persisted name remains `Original`. | LIST-004-US-004 | Yes | Accessibility | Smoke cadence. Source: A11Y-001-US-014, A11Y-001-US-015. |

## LIST-004-US-005 - Reject whitespace-only rename

User Story Summary: As the system, I want whitespace-only rename values rejected.

Related Feature ID: `LIST-004`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-004-US-005-TC-001 | Whitespace-only rename returns 422 and old name remains | API, Validation, Negative | Critical | `u_owner` owns Fixture I list. | Fixture I request. | 1. Send authenticated request with five spaces. 2. Inspect response and fetch list. | Response status is `422 Validation Error`; error payload identifies `name`; fetched list name remains `Original`; no blank-looking list name is persisted. | LIST-004-US-005 | Yes | API | Smoke cadence. |
| LIST-004-US-005-TC-002 | UI rejects whitespace-only rename after trimming | UI, Validation, Accessibility, Negative | Critical | Rename dialog is open for `list_rename_9`. | Name field contains five spaces. | 1. Replace current name with five spaces. 2. Activate save. 3. Inspect validation state, focus, network, and persisted title. | One validation error is visible and programmatically associated with name field; focus moves to the first invalid field or linked error summary; zero successful `PATCH` responses occur; old persisted title remains `Original`. | LIST-004-US-005 | Yes | Accessibility | Smoke cadence. Source: A11Y-001-US-014, A11Y-001-US-015. |
| LIST-004-US-005-TC-003 | Validation message exposes numeric limits with Western digits | Accessibility, Localization, Validation | Medium | Name validation error is visible and includes length limit. | Invalid rename error that mentions `80`. | 1. Trigger name validation. 2. Inspect visible and accessible error text. | Numeric limit is displayed with Western digits `80`; Arabic-Indic digits are absent; accessible error text includes context that `80` is the list-name character limit. | LIST-004-US-005 | Yes | Accessibility | Regression cadence. Source: RESP-004-US-001, RESP-004-US-007, RESP-004-US-009. |

## LIST-004-US-006 - Trim rename value

User Story Summary: As a user, I want accidental spacing cleaned when renaming.

Related Feature ID: `LIST-004`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-004-US-006-TC-001 | Arabic rename value is trimmed before persistence | API, Positive, Localization, Arabic | High | `u_owner` owns Fixture B list. | Fixture B request. | 1. Send authenticated rename request. 2. Inspect response. 3. Fetch and render the list. | Response status is `200 OK`; response and rendered title are exactly `قهوة مختصة`; leading/trailing spaces are absent; Arabic text is valid UTF-8 with no mojibake or replacement characters. | LIST-004-US-006 | Yes | API | Smoke cadence. |
| LIST-004-US-006-TC-002 | English rename value is trimmed before persistence | API, Positive | High | `u_owner` owns list named `Original`. | `PATCH /api/v1/lists/list_rename_13` body `{ "name": "  Weekend Food  " }`. | 1. Send authenticated rename request. 2. Inspect response and rendered title. | Response status is `200 OK`; response `name="Weekend Food"`; no leading/trailing spaces appear in response, DOM, or accessibility tree. | LIST-004-US-006 | Yes | API | Regression cadence. |
| LIST-004-US-006-TC-003 | Mixed Arabic/English rename preserves interior text after edge trimming | API, UI, Localization, RTL | High | `u_owner` owns Fixture O list. | Fixture O request. | 1. Send authenticated rename request. 2. Inspect response. 3. Inspect rendered title at owner route. | Response status is `200 OK`; persisted name is exactly `Riyadh قهوة 2026`; interior spaces and mixed-language order are preserved; rendered title has no mojibake; `document.documentElement.scrollWidth <= window.innerWidth`. | LIST-004-US-006 | Yes | UI E2E | Regression cadence. Source: RESP-002-US-018. |
| LIST-004-US-006-TC-004 | Punctuation rename is preserved after edge trimming | API, Positive | Medium | `u_owner` owns Fixture N list. | Fixture N request. | 1. Send authenticated rename request. 2. Inspect response. | Response status is `200 OK`; response `name="Coffee & Tea - 2026!"`; only leading and trailing spaces are removed. | LIST-004-US-006 | Yes | API | Regression cadence. |
| LIST-004-US-006-TC-005 | Emoji rename behavior requires explicit product decision | Requirement Clarification, Manual | Medium | QA requirements review is being performed. | Example rename `Weekend 🍦`. | 1. Review LIST-004 name validation requirements. 2. Confirm whether emoji are accepted, rejected, sanitized, or normalized. | No executable emoji rename assertion is added until accepted/rejected emoji behavior is documented. | LIST-004-US-006 | No | Manual | Manual Review cadence. |

## LIST-004-US-007 - Enforce rename max length

User Story Summary: As the system, I want renamed list names bounded.

Related Feature ID: `LIST-004`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-004-US-007-TC-001 | Exactly 80-character rename is accepted | API, Boundary, Positive | Critical | `u_owner` owns Fixture E list. | Fixture E request. | 1. Send authenticated rename with trimmed length exactly `80`. 2. Inspect response. | Response status is `200 OK`; response `name` is exactly `AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`; response name length is `80`; response `updatedAt` changes; list ID remains `list_rename_5`. | LIST-004-US-007 | Yes | API | Smoke cadence. |
| LIST-004-US-007-TC-002 | 81-character rename returns 422 and old name remains | API, Boundary, Validation, Negative | Critical | `u_owner` owns Fixture F list. | Fixture F request. | 1. Send authenticated rename with trimmed length exactly `81`. 2. Inspect response and fetch list. | Response status is `422 Validation Error`; error payload contains deterministic fields `error.code`, `error.message`, and `error.field="name"`; old name remains `Original`; no partial rename response is returned. | LIST-004-US-007 | Yes | API | Smoke cadence. |
| LIST-004-US-007-TC-003 | UI over-max rename preserves attempted input for correction | UI, Boundary, Validation, Accessibility | Critical | Rename dialog is open for `list_rename_6`. | Fixture F 81-character name. | 1. Enter exact Fixture F value. 2. Activate save. 3. Inspect field value, validation text, focus, and persisted title. | One validation error is visible and associated with the name field; field value remains the exact 81-character attempted name; old persisted title remains `Original`; focus moves to first invalid field or linked error summary. | LIST-004-US-007 | Yes | Accessibility | Regression cadence. Source: A11Y-001-US-014, A11Y-001-US-015. |
| LIST-004-US-007-TC-004 | Edge spaces do not count when trimmed rename is 80 characters | API, Boundary, Positive | High | `u_owner` owns list named `Original`. | Body `{ "name": " AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA " }`. | 1. Send authenticated rename request. 2. Inspect response name and length. | Response status is `200 OK`; persisted name excludes the two edge spaces and has length exactly `80`. | LIST-004-US-007 | Yes | API | Regression cadence. |

## LIST-004-US-008 - Allow rename to duplicate name

User Story Summary: As a user, I want duplicate names allowed during rename.

Related Feature ID: `LIST-004`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-004-US-008-TC-001 | Same owner can rename selected list to duplicate name | API, Data Integrity, Positive | High | Fixture J exists. | Fixture J request. | 1. Send authenticated rename request. 2. Inspect response. 3. Fetch owned lists. | Response status is `200 OK`; response `id="list_rename_10"`; response `name="Family Favorites"`; owned lists contain both `list_rename_10` and `list_duplicate_target` as distinct IDs with the same name. | LIST-004-US-008 | Yes | API | Smoke cadence. |
| LIST-004-US-008-TC-002 | Duplicate-name rename updates selected list only | UI, Data Integrity, Regression | Medium | User owns two lists; one target duplicate name already exists. | Rename selected list `list_rename_10`. | 1. Open edit for `list_rename_10`. 2. Enter `Family Favorites`. 3. Save. 4. Inspect both list rows or detail headers. | Selected list `list_rename_10` displays `Family Favorites`; existing `list_duplicate_target` remains a distinct list ID; no duplicate-name error appears. | LIST-004-US-008 | Yes | UI E2E | Regression cadence. |
| LIST-004-US-008-TC-003 | Duplicate-name conflict status remains disallowed by requirements | Traceability Verification, Manual | Medium | QA contract review is being performed. | Duplicate-name rename scenario. | 1. Review LIST-004-US-008 and duplicate-name business rule. 2. Review API status expectations. | Duplicate list names are allowed during rename; LIST-004 executable tests must not expect `409 Conflict` for duplicate names unless requirements change. | LIST-004-US-008 | No | Manual | Manual Review cadence. |

## LIST-004-US-009 - Save unchanged name harmlessly

User Story Summary: As a user, I want accidental saves to be harmless.

Related Feature ID: `LIST-004`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-004-US-009-TC-001 | Saving unchanged current name succeeds without duplicate error | API, Positive, Regression | Low | `u_owner` owns Fixture C list. | Fixture C request. | 1. Send authenticated rename with current valid name. 2. Inspect response and errors. | Response status is `200 OK`; response `id="list_rename_3"` and `name="Current Name"`; no duplicate-name error appears; list remains accessible through the same ID. | LIST-004-US-009 | Yes | API | Regression cadence. |
| LIST-004-US-009-TC-002 | UI unchanged save keeps stable persisted title | UI, UX | Low | Rename dialog is open with current name `Current Name`. | Save without editing. | 1. Open rename dialog. 2. Do not modify name. 3. Activate save. 4. Inspect title, error area, and network. | The save request returns `200 OK`; no duplicate-name validation error appears; current title remains exactly `Current Name`; no extra duplicate row appears in owned-list collection. | LIST-004-US-009 | Yes | UI E2E | Regression cadence. |

## LIST-004-US-010 - Handle stale deleted list

User Story Summary: As a user, I want clear recovery if the list was deleted elsewhere.

Related Feature ID: `LIST-004`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-004-US-010-TC-001 | Stale deleted list rename returns 404 | API, Error Handling, Negative | High | `list_deleted` existed when dialog opened but is deleted before save. | Fixture L request. | 1. Open rename dialog for `list_deleted`. 2. Delete list through test setup. 3. Send rename request. 4. Inspect response. | Response status is `404 Not Found`; error payload contains deterministic fields `error.code` and `error.message`; no renamed list is created; payload contains no owner internals, stack traces, SQL details, audit fields, moderation fields, or debug fields. | LIST-004-US-010 | Yes | API | Smoke cadence. |
| LIST-004-US-010-TC-002 | UI shows recoverable stale-delete error without false success | UI, Error Handling, Privacy | High | Rename dialog is open for a list that is deleted elsewhere before save. | Attempted name `Recovered Name`. | 1. Submit rename after test setup deletes target. 2. Inspect UI, route, and persisted title. | Recoverable error text is visible; success text is absent; dialog/surface does not display `Recovered Name` as persisted; no stack trace, raw SQL, owner internals, audit fields, or debug fields render. | LIST-004-US-010 | Yes | UI E2E | Regression cadence. |
| LIST-004-US-010-TC-003 | Delete behavior remains LIST-006-owned | Traceability Verification, Manual | Medium | QA traceability review is being performed. | LIST-006 delete requirements and LIST-004 stale rename requirement. | 1. Review LIST-006 deletion tests. 2. Review LIST-004 stale-delete rename tests. | LIST-004 validates rename handling after a stale delete; delete confirmation, delete response, membership deletion, and rollback remain LIST-006-owned. | LIST-004-US-010 | No | Manual | Manual Review cadence. |

## LIST-004-US-011 - Preserve input after rename failure

User Story Summary: As a user, I want retry without retyping.

Related Feature ID: `LIST-004`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-004-US-011-TC-001 | Network failure preserves attempted rename and old persisted name | UI, Error Handling, Loading | Medium | Rename dialog is open for `list_rename_1`; network failure is simulated. | Attempted name `Retry Rename`; old persisted name `Weekend Food`. | 1. Enter `Retry Rename`. 2. Save. 3. Fail `PATCH /api/v1/lists/list_rename_1` with network error. 4. Inspect form and page title. | Dialog remains open; name field still contains `Retry Rename`; old persisted page title remains `Weekend Food`; no success text appears. | LIST-004-US-011 | Yes | UI E2E | Regression cadence. |
| LIST-004-US-011-TC-002 | 5xx failure preserves attempted input and old persisted name | UI, Error Handling, Negative | Medium | Rename dialog is open; API returns server error. | Attempted name `Server Retry`; `500 Internal Server Error`. | 1. Submit attempted name. 2. Return `500 Internal Server Error`. 3. Inspect UI state and response. | Dialog remains open; name field value is exactly `Server Retry`; old persisted title remains `Weekend Food`; visible error text contains no private or internal data. | LIST-004-US-011 | Yes | UI E2E | Regression cadence. |
| LIST-004-US-011-TC-003 | Retry after transient failure sends same attempted name once | UI, Error Handling, Regression | Medium | First rename request fails; second succeeds. | Attempted name `Retry Rename`; second response `200 OK`. | 1. Submit rename and fail first request. 2. Activate retry/save once. 3. Capture second request and response. | Second request body is exactly `{ "name": "Retry Rename" }`; exactly one retry `PATCH` is sent for the second activation; second response status is `200 OK`; persisted title becomes `Retry Rename`. | LIST-004-US-011 | Yes | UI E2E | Regression cadence. |
| LIST-004-US-011-TC-004 | Pending rename announces loading and prevents duplicate submit | UI, Loading, Accessibility, Data Integrity | High | Rename dialog is open; API request is delayed. | Attempted name `Pending Rename`. | 1. Submit rename. 2. Hold request pending. 3. Activate save again while pending. 4. Inspect network and accessibility state. | Visible pending status is present; `aria-busy="true"` or an element with `role="status"` communicates loading; exactly one `PATCH` is sent while pending; attempted name remains `Pending Rename`. | LIST-004-US-011 | Yes | Accessibility | Regression cadence. Source: A11Y-001-US-016. |
| LIST-004-US-011-TC-005 | Failed rename error does not expose internals | API, Error Handling, Security, Privacy | High | API returns 500 during rename. | Attempted valid rename. | 1. Submit rename request. 2. Inspect error response and rendered UI. | Response status is `500 Internal Server Error`; error payload contains deterministic fields `error.code` and `error.message`; response and UI error contain no owner email, internal user ID, tokens, list table names, stack traces, raw SQL, moderation fields, audit fields, or debug fields. | LIST-004-US-011 | Yes | Security | Regression cadence. |

## LIST-004-US-012 - Cancel rename without mutation

User Story Summary: As a user, I want cancel to discard unsaved rename changes.

Related Feature ID: `LIST-004`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-004-US-012-TC-001 | Cancel rename sends no PATCH and keeps old title | UI, Positive | Medium | Rename dialog is open for `list_rename_1`. | Old title `Weekend Food`; unsaved input `Unsaved Rename`. | 1. Change name field to `Unsaved Rename`. 2. Activate cancel/close. 3. Inspect network and title. | Dialog closes; zero `PATCH /api/v1/lists/list_rename_1` requests are sent; displayed persisted title remains `Weekend Food`. | LIST-004-US-012 | Yes | UI E2E | Regression cadence. |
| LIST-004-US-012-TC-002 | Escape closes dismissible rename dialog and restores focus | Accessibility, Keyboard | Medium | Rename dialog is open with no unsaved input; edit trigger remains mounted. | Escape key. | 1. Open rename dialog from edit trigger. 2. Press Escape. 3. Inspect focus and network. | Dialog closes; focus returns to the same edit trigger; zero `PATCH` requests are sent. | LIST-004-US-012 | Yes | Accessibility | Regression cadence. Source: A11Y-001-US-006, A11Y-001-US-008. |
| LIST-004-US-012-TC-003 | Unsaved-change confirmation behavior requires product decision | Requirement Clarification, Manual | Low | Rename dialog has unsaved input. | Attempted close with unsaved name. | 1. Review LIST-004-US-012 and global modal requirements. 2. Confirm whether unsaved rename requires confirmation or closes immediately. | LIST-004 executable tests assert no mutation on cancel. Whether a discard confirmation appears remains clarification until documented. | LIST-004-US-012 | No | Manual | Manual Review cadence. |

## LIST-004-US-013 - Keep rename dialog accessible

User Story Summary: As a keyboard or screen-reader user, I want rename accessible.

Related Feature ID: `LIST-004`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-004-US-013-TC-001 | Keyboard-only user can complete rename | Accessibility, Keyboard, Positive | High | Edit trigger is keyboard reachable; Fixture A is valid. | Keyboard-only path. | 1. Tab to edit trigger and press Enter. 2. Replace name with `Family Favorites`. 3. Activate save by keyboard. | Focus remains trapped in dialog until save; request returns `200 OK`; persisted title becomes `Family Favorites`; no pointer action is required. | LIST-004-US-013 | Yes | Accessibility | Smoke cadence. Source: LIST-004-US-013, A11Y-001-US-004. |
| LIST-004-US-013-TC-002 | First invalid field receives focus and error announcement | Accessibility, Validation, Negative | High | Rename dialog is open. | Empty name submission. | 1. Clear name field. 2. Activate save. 3. Inspect focus and accessibility tree. | Focus moves to name field or linked error summary; error text is programmatically associated with the name field and announced through accessible error text or live region; focus remains inside dialog. | LIST-004-US-013 | Yes | Accessibility | Smoke cadence. Source: A11Y-001-US-014, A11Y-001-US-015. |
| LIST-004-US-013-TC-003 | Rename dialog focus trap works with Tab and Shift+Tab | Accessibility, Keyboard | High | Rename dialog is open. | Name field, save, cancel, close controls. | 1. Press Tab through all controls. 2. Press Shift+Tab backward through all controls. 3. Inspect focused element each time. | Focus cycles within the rename dialog/sheet; background page controls are not reachable while modal is open. | LIST-004-US-013 | Yes | Accessibility | Regression cadence. Source: A11Y-001-US-004, A11Y-001-US-005, A11Y-001-US-010. |
| LIST-004-US-013-TC-004 | Rename dialog fits 320x568 with virtual keyboard pressure | Responsive, Mobile, Accessibility | High | Mobile viewport `320x568`; rename dialog/sheet is open; name field focused. | Current name `Weekend Food`. | 1. Set viewport to `320x568`. 2. Open rename dialog. 3. Focus name field and simulate virtual keyboard pressure. 4. Inspect controls and page width. | Name field, save, cancel, and close controls remain visible or reachable through internal modal scrolling; `document.documentElement.scrollWidth <= window.innerWidth`; actions are not hidden by bottom navigation or safe-area padding. | LIST-004-US-013 | Yes | UI E2E | Smoke cadence. Source: LIST-004-US-013, RESP-002-US-009, RESP-002-US-011. |
| LIST-004-US-013-TC-005 | Rename dialog fits 390px and 430px mobile widths | Responsive, Mobile | High | Rename dialog/sheet is open. | Viewports `390x844` and `430x932`. | 1. Open rename dialog at `390x844`. 2. Inspect all controls. 3. Repeat at `430x932`. | At both widths, name field, error area, save, cancel, and close controls are readable and reachable; `document.documentElement.scrollWidth <= window.innerWidth`. | LIST-004-US-013 | Yes | UI E2E | Regression cadence. Source: RESP-002-US-001, RESP-002-US-002, RESP-002-US-011. |
| LIST-004-US-013-TC-006 | Rename dialog supports phone landscape | Responsive, Mobile, Landscape | High | Phone landscape viewport is active. | Viewport `844x390`. | 1. Open rename dialog. 2. Inspect internal scrolling and controls. | Dialog/sheet content scrolls internally as needed; name, save, cancel, and close controls remain reachable; `document.documentElement.scrollWidth <= window.innerWidth`. | LIST-004-US-013 | Yes | UI E2E | Regression cadence. Source: RESP-002-US-012. |
| LIST-004-US-013-TC-007 | Rename dialog supports 200% zoom and touch targets | Responsive, Accessibility, Low Vision | High | Browser zoom is `200%`; rename dialog is open. | Valid rename input. | 1. Set zoom to `200%`. 2. Open rename dialog. 3. Inspect controls. 4. Complete valid rename. | `document.documentElement.scrollWidth <= window.innerWidth`; form controls remain reachable; save can be activated; save, cancel, close, and name field targets are at least `44x44` CSS pixels where applicable. | LIST-004-US-013 | Yes | Accessibility | Regression cadence. Source: RESP-003-US-001, RESP-003-US-002, RESP-003-US-008, A11Y-001-US-019. |
| LIST-004-US-013-TC-008 | Rename dialog forced-colors mode keeps form state visible | Accessibility, Responsive | Medium | Forced-colors mode is active; rename dialog is open. | Name field, error, focus, buttons. | 1. Enable forced-colors mode. 2. Open rename dialog. 3. Trigger validation error. 4. Inspect visual states. | Name text, label, error text, button borders, disabled/pending state, and focus indicators remain distinguishable; no required text disappears. | LIST-004-US-013 | Yes | Accessibility | Nightly cadence. Source: RESP-003-US-014, RESP-003-US-015. |
| LIST-004-US-013-TC-009 | Rename dialog reduced motion remains functional | Accessibility, Responsive | Medium | Reduced motion is active; rename dialog has loading and close transitions. | `prefers-reduced-motion: reduce`; valid rename. | 1. Enable reduced motion. 2. Open rename dialog. 3. Submit valid rename. 4. Inspect loading and success. | No critical information relies on animation; loading is conveyed through accessible status; rename returns `200 OK` and persisted title updates to submitted valid value. | LIST-004-US-013 | Yes | Accessibility | Nightly cadence. Source: RESP-003-US-016, RESP-003-US-017. |

## Cross-Feature Traceability Cases

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-004-TRACE-TC-001 | Owned-list index rename rendering remains LIST-001-owned | Traceability Verification, Manual | Medium | Rename succeeded. | LIST-001 and LIST-004 requirements. | 1. Review LIST-004 rename response tests. 2. Review LIST-001 owned-list rendering tests. | LIST-004 validates rename response and current owned surface update; full owned-list index row rendering remains LIST-001-owned. | LIST-004-US-003 | No | Manual | Manual Review cadence. |
| LIST-004-TRACE-TC-002 | Profile consistency remains PROFILE-owned | Traceability Verification, Manual | Medium | Rename succeeded. | PROFILE requirements and LIST-004. | 1. Review profile surfaces for list names or counts. 2. Confirm profile package owns profile rendering assertions. | LIST-004 does not duplicate profile summary or archive rendering; any profile display consistency is PROFILE-owned unless directly linked in LIST-004 requirements. | LIST-004-US-003 | No | Manual | Manual Review cadence. |
| LIST-004-TRACE-TC-003 | Public-list consistency remains PUBLIC-owned | Traceability Verification, Manual | Medium | Public list rename succeeded through owned route. | PUBLIC-LISTS requirements and LIST-004. | 1. Review public index/detail rename visibility requirements. 2. Confirm public packages cover public rendering and privacy. | LIST-004 validates owned rename response; public-list index/detail freshness, ordering, owner identity, and read-only browsing remain PUBLIC-owned unless explicitly linked. | LIST-004-US-003 | No | Manual | Manual Review cadence. |
| LIST-004-TRACE-TC-004 | Place Detail containing-list rename display remains PLACE-owned | Traceability Verification, Manual | Medium | List containing current place was renamed. | PLACE-018 requirements if available outside this package. | 1. Review LIST-004 rename scope. 2. Review Place Detail containing-list requirements. | LIST-004 does not duplicate Place Detail containing-list rendering; any containing-list rename display is PLACE-owned unless a LIST-004 requirement explicitly adds it. | LIST-004-US-003 | No | Manual | Manual Review cadence. |
| LIST-004-TRACE-TC-005 | Visibility changes remain LIST-005-owned | Traceability Verification, Manual | Medium | Rename dialog and edit dialog may share UI components. | LIST-005 visibility requirements. | 1. Review LIST-004 rename tests. 2. Review LIST-005 visibility tests. | LIST-004 validates name updates only; changing public/private visibility after creation remains LIST-005-owned. | LIST-004-US-003 | No | Manual | Manual Review cadence. |

## Final Summary

1. User stories processed: 13
2. Total executable test cases: 48
3. Clarification / Manual / Traceability cases: 11
4. Total test cases: 59
5. Test count per user story:
   - LIST-004-US-001: 5
   - LIST-004-US-002: 5
   - LIST-004-US-003: 9
   - LIST-004-US-004: 3
   - LIST-004-US-005: 3
   - LIST-004-US-006: 5
   - LIST-004-US-007: 4
   - LIST-004-US-008: 3
   - LIST-004-US-009: 2
   - LIST-004-US-010: 3
   - LIST-004-US-011: 5
   - LIST-004-US-012: 3
   - LIST-004-US-013: 9
6. Count by test type:
   - API: 18
   - Accessibility: 15
   - Arabic: 1
   - Authentication: 3
   - Boundary: 4
   - Contract: 2
   - Data Integrity: 5
   - Error Handling: 6
   - Integration: 2
   - Keyboard: 3
   - Landscape: 1
   - Loading: 2
   - Localization: 3
   - Low Vision: 1
   - Manual: 11
   - Mobile: 3
   - Negative: 11
   - Positive: 11
   - Privacy: 6
   - Regression: 4
   - Requirement Clarification: 3
   - Responsive: 6
   - RTL: 1
   - Security: 6
   - Traceability Verification: 8
   - UI: 19
   - UX: 1
   - Validation: 9
7. Count by priority:
   - Critical: 16
   - High: 20
   - Medium: 20
   - Low: 3
8. Count by automation layer:
   - API: 15
   - Accessibility: 14
   - Security: 5
   - UI E2E: 14
   - Manual: 11
9. Top automation candidates:
   - `PATCH /api/v1/lists/{id}` `200 OK`, `401 Unauthorized`, `404 Not Found`, `422 Validation Error`, deterministic error schema, required fields, and forbidden-field tests.
   - API validation matrix for missing, empty, whitespace-only, minimum, maximum, over-maximum, trimmed Arabic/English/mixed-language, punctuation, duplicate-name, unchanged-name, stale deleted list, and non-owner denial scenarios.
   - UI E2E for opening rename dialog, prefilled current name, valid rename, failure preservation, retry, cancel without mutation, and current surface update.
   - Security automation for guest/expired-session denial, non-owner privacy-safe denial, no private-data flash, and sensitive error redaction.
   - Accessibility automation for dialog semantics, labels, focus trap, first invalid field focus, error/live announcements, keyboard-only rename, touch targets, forced colors, reduced motion, and 200% zoom.

## Validation

- Duplicate Test IDs = 0
- Invalid Story References = 0
- Missing User Stories = 0
- Encoding/Mojibake = 0
- API Tests Missing Status Codes = 0
- Requirement Fidelity Violations = 0
- Feature Ownership Violations = 0
