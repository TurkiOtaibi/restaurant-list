# LIST-011 Test Cases

Feature: `LIST-011 - Duplicate list names allowed`

Primary Source: `docs/user-stories/LISTS_USER_STORIES.md`

Supporting Sources:

- `docs/feature-map/FEATURE_TRACEABILITY.md`
- `docs/user-stories/LIST-001_TEST_CASES.md`
- `docs/user-stories/LIST-003_TEST_CASES.md`
- `docs/user-stories/LIST-004_TEST_CASES.md`
- `docs/user-stories/RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`

Endpoint Traceability:

- `POST /api/v1/lists` creates lists and is owned by LIST-003; LIST-011 verifies only duplicate-name allowance and ID uniqueness during create.
- `PATCH /api/v1/lists/{id}` renames lists and is owned by LIST-004; LIST-011 verifies only duplicate-name allowance and selected-list ID preservation during rename.
- `GET /api/v1/lists` renders owned lists and is owned by LIST-001; LIST-011 verifies only duplicate-name rendering, route identity, and privacy-safe disambiguation.

## QA Execution Standards

- Executable tests validate documented LIST-011 requirements, explicitly linked LIST-001/LIST-003/LIST-004 integration contracts, `FEATURE_TRACEABILITY.md`, or approved global responsive/accessibility requirements.
- Undefined behavior is captured as Requirement Clarification, Manual Verification, or Traceability Verification.
- LIST-011 owns duplicate list-name allowance, ID-based list identity, no false duplicate-name validation, duplicate-name rendering, and privacy-safe duplicate-name disambiguation.
- LIST-011 does not own full create flow validation, full rename flow validation, list deletion, visibility changes, place membership behavior, public-list browsing mechanics, sorting beyond documented LIST-001 ordering, cache behavior, browser history, or name normalization policy.
- Executable API tests use exact status codes only where documented by linked source requirements: duplicate create returns `201 Created`; duplicate rename returns `200 OK`.
- Automation cadence values used in Notes: Smoke, Regression, Nightly, Manual Review.

## Deterministic Fixtures

| Fixture ID | User State | List State | Request / UI Context | Expected Baseline |
|---|---|---|---|---|
| FX-LIST-011-A | `user-001` authenticated | Existing owned list `list-burger-a`, name `برجر`, visibility `private`, `placeCount=1` | `POST /api/v1/lists` body `{ "name": "برجر", "visibility": "private" }` | Create succeeds with `201 Created`; returned ID is not `list-burger-a`; both lists have name `برجر`. |
| FX-LIST-011-B | `user-001` authenticated; `user-002` authenticated separately | `user-002` owns `list-other-coffee`, name `قهوة`, visibility `private` | `user-001` sends `POST /api/v1/lists` body `{ "name": "قهوة", "visibility": "private" }` | Create succeeds for `user-001`; response does not expose `user-002` list data. |
| FX-LIST-011-C | `user-001` authenticated | `list-family-a`, name `قائمة العائلة`; `list-family-b`, name `عطلة نهاية الأسبوع`; both owned by `user-001` | `PATCH /api/v1/lists/list-family-a` body `{ "name": "عطلة نهاية الأسبوع" }` | Rename succeeds with `200 OK`; `list-family-a` and `list-family-b` now share the same name but keep distinct IDs. |
| FX-LIST-011-D | `user-001` authenticated | `list-dup-a`, name `Weekend Food`, visibility `private`, `placeCount=1`; `list-dup-b`, name `Weekend Food`, visibility `public`, `placeCount=3` | Owned-list index and row navigation | Both rows render; route targets are `/lists/list-dup-a` and `/lists/list-dup-b`. |
| FX-LIST-011-E | `user-001` authenticated | `list-mixed-a`, name `Best برجر 2026`; `list-mixed-b`, name `Best برجر 2026` | RTL owned-list row rendering | Mixed Arabic/English duplicate names remain readable and route-distinct. |
| FX-LIST-011-F | Public viewer allowed by public-list feature context | `public-list-a`, name `مطاعم الرياض`, owner display name `سارة`; `public-list-b`, name `مطاعم الرياض`, owner display name `خالد` | Public duplicate-name UI integration | Public duplicate names are distinguishable by owner display name and route identity without exposing email or internal user ID. |
| FX-LIST-011-G | `user-001` authenticated | `list-action-a`, name `آيس كريم`, `placeCount=1`; `list-action-b`, name `آيس كريم`, `placeCount=4` | Open/edit/delete/add/remove entry points | Operations use selected list ID; duplicate visible names do not merge or overwrite rows. |
| FX-LIST-011-H | `user-001` authenticated | `list-responsive-a`, name `قائمة العائلة`; `list-responsive-b`, name `قائمة العائلة`; long mixed row `Best برجر 2026 في الرياض` | Responsive/accessibility certification | Duplicate rows, metadata, and route identity remain operable at required viewports and 200% zoom. |

## LIST-011-US-001 - Allow duplicate owned list names on create

User Story Summary: As a user, I want duplicate list names allowed so that I can organize flexibly.

Related Feature ID: `LIST-011`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-011-US-001-TC-001 | Same owner duplicate Arabic create returns unique ID | API, Data Integrity, Positive | Critical | FX-LIST-011-A is loaded; `user-001` has a valid session. | `POST /api/v1/lists`; body `{ "name": "برجر", "visibility": "private" }`. | 1. Send authenticated create request. 2. Inspect response status and fields. 3. Request `GET /api/v1/lists`. | Response status is `201 Created`; response `name="برجر"`; response `visibility="private"`; returned `id` is non-empty and not `list-burger-a`; owned-list collection contains both IDs with identical name `برجر`. | LIST-011-US-001 | Yes | API | Smoke cadence. Source: LIST-011-US-001 and LIST-003-US-011. |
| LIST-011-US-001-TC-002 | Duplicate create response schema excludes forbidden fields | API, Contract, Privacy, Security | Critical | FX-LIST-011-A is loaded. | Duplicate create response. | 1. Send duplicate-name create request. 2. Recursively inspect response JSON. | Response status is `201 Created`; response includes documented `ListResponse` fields `id`, `name`, `visibility`, and `placeCount=0`; response contains no owner email, internal user ID, other users' lists, private notes, tokens, audit/debug fields, stack traces, SQL details, or moderation fields. | LIST-011-US-001 | Yes | Security | Smoke cadence. |
| LIST-011-US-001-TC-003 | Duplicate create does not return conflict error | API, Negative, Validation | High | FX-LIST-011-A is loaded. | Duplicate create for `برجر`. | 1. Send duplicate-name create request. 2. Inspect status and error area. | Response status is `201 Created`; no `409 Conflict`, duplicate-name validation error, or duplicate-name error code is returned. | LIST-011-US-001 | Yes | API | Regression cadence. |
| LIST-011-US-001-TC-004 | Duplicate created list opens by returned ID | UI, Navigation, Data Integrity | High | FX-LIST-011-A is loaded and duplicate create succeeds with returned ID `list-burger-b`. | Route after create. | 1. Create duplicate list through UI. 2. Capture returned ID. 3. Inspect route after success. | App navigates to `/lists/list-burger-b`; it does not open `/lists/list-burger-a`; duplicate visible name does not determine route identity. | LIST-011-US-001 | Yes | UI E2E | Regression cadence. Create flow mechanics remain LIST-003-owned. |
| LIST-011-US-001-TC-005 | Arabic duplicate fixture has valid UTF-8 text | Localization, Arabic, Data Integrity | Medium | FX-LIST-011-A is loaded. | Arabic name `برجر`. | 1. Inspect API response, DOM, and accessibility tree for the duplicate row. | Name is exactly `برجر` in response, DOM, and accessibility tree; no mojibake, replacement character, question marks, or escaped Unicode text appears. | LIST-011-US-001 | Yes | UI E2E | Regression cadence. |

## LIST-011-US-002 - Allow duplicate names across users

User Story Summary: As the system, I want list-name uniqueness not enforced globally.

Related Feature ID: `LIST-011`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-011-US-002-TC-001 | Cross-owner duplicate name create succeeds | API, Data Integrity, Privacy | Critical | FX-LIST-011-B is loaded; `user-001` is authenticated. | `POST /api/v1/lists`; body `{ "name": "قهوة", "visibility": "private" }`. | 1. Send create request as `user-001`. 2. Inspect response. 3. Request owned lists as `user-001`. | Response status is `201 Created`; response `name="قهوة"`; returned list belongs to `user-001`; `GET /api/v1/lists` for `user-001` contains the new list and does not contain `list-other-coffee`. | LIST-011-US-002 | Yes | API | Smoke cadence. |
| LIST-011-US-002-TC-002 | Cross-owner duplicate response does not expose other user data | API, Security, Privacy | Critical | FX-LIST-011-B is loaded. | `user-002` owns same-name private list. | 1. Send create request as `user-001`. 2. Recursively inspect response and rendered success state. | Response status is `201 Created`; response and UI expose no `user-002` list ID, owner identity, owner email, visibility, placeCount, private notes, hidden metadata, tokens, stack trace, SQL, or debug fields. | LIST-011-US-002 | Yes | Security | Smoke cadence. |
| LIST-011-US-002-TC-003 | Global uniqueness is not enforced for public/private duplicates | API, Data Integrity | High | `user-002` owns public list name `قهوة`; `user-001` owns no list with that name. | `user-001` creates private list `{ "name": "قهوة", "visibility": "private" }`. | 1. Send create request as `user-001`. 2. Inspect response and owner index. | Response status is `201 Created`; new private list for `user-001` is created; no global duplicate-name error is returned. | LIST-011-US-002 | Yes | API | Regression cadence. |

## LIST-011-US-003 - Allow rename to duplicate owned name

User Story Summary: As a user, I want to rename a list to an existing name so that naming stays flexible.

Related Feature ID: `LIST-011`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-011-US-003-TC-001 | Rename selected list to duplicate owned name returns 200 | API, Data Integrity, Positive | Critical | FX-LIST-011-C is loaded; `user-001` owns both lists. | `PATCH /api/v1/lists/list-family-a`; body `{ "name": "عطلة نهاية الأسبوع" }`. | 1. Send authenticated rename request. 2. Inspect response. 3. Request owned list collection. | Response status is `200 OK`; response `id="list-family-a"`; response `name="عطلة نهاية الأسبوع"`; `list-family-b` remains a separate list with same name; both IDs exist after refresh. | LIST-011-US-003 | Yes | API | Smoke cadence. Source: LIST-011-US-003 and LIST-004-US-008. |
| LIST-011-US-003-TC-002 | Rename-to-duplicate response schema excludes forbidden fields | API, Contract, Privacy, Security | Critical | FX-LIST-011-C is loaded. | Rename response for `list-family-a`. | 1. Send duplicate-name rename request. 2. Recursively inspect response JSON. | Response status is `200 OK`; response includes documented rename fields including `id` and `name`; response contains no owner email, internal user ID, other users' lists, private notes, tokens, moderation fields, audit/debug fields, stack traces, or SQL details. | LIST-011-US-003 | Yes | Security | Smoke cadence. |
| LIST-011-US-003-TC-003 | Rename to duplicate does not return conflict error | API, Negative, Validation | High | FX-LIST-011-C is loaded. | Duplicate rename payload `{ "name": "عطلة نهاية الأسبوع" }`. | 1. Send rename request. 2. Inspect status and validation payload. | Response status is `200 OK`; no `409 Conflict`, duplicate-name validation error, or duplicate-name error code is returned. | LIST-011-US-003 | Yes | API | Regression cadence. |
| LIST-011-US-003-TC-004 | Rename affects selected list ID only | API, Data Integrity | High | FX-LIST-011-C is loaded. | Rename `list-family-a` to `عطلة نهاية الأسبوع`. | 1. Capture names and IDs for both lists. 2. Rename `list-family-a`. 3. Fetch both lists by ID. | `list-family-a.name="عطلة نهاية الأسبوع"`; `list-family-b.name="عطلة نهاية الأسبوع"`; both IDs remain distinct; `list-family-b` metadata and memberships are unchanged. | LIST-011-US-003 | Yes | API | Regression cadence. |
| LIST-011-US-003-TC-005 | Duplicate rename UI shows success without duplicate-name error | UI, Data Integrity | Medium | FX-LIST-011-C is loaded; rename dialog can open for `list-family-a`. | Rename input `عطلة نهاية الأسبوع`. | 1. Open rename for `list-family-a`. 2. Enter duplicate target name. 3. Save. 4. Inspect visible UI. | No duplicate-name validation error appears; save completes; visible row/detail for `list-family-a` shows `عطلة نهاية الأسبوع`; `list-family-b` remains present as a separate row. | LIST-011-US-003 | Yes | UI E2E | Regression cadence. Full rename validation remains LIST-004-owned. |

## LIST-011-US-004 - Distinguish duplicate lists by ID

User Story Summary: As the system, I want duplicate names distinguished by ID so that actions target the correct list.

Related Feature ID: `LIST-011`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-011-US-004-TC-001 | Owned index renders duplicate rows as separate IDs | UI, Data Integrity | Critical | FX-LIST-011-D is loaded. | `/lists`; duplicate rows `Weekend Food`. | 1. Sign in as `user-001`. 2. Open `/lists`. 3. Inspect rendered rows and row links. | Exactly two rows named `Weekend Food` render; one row targets `/lists/list-dup-a` and shows `placeCount=1`, `private`; the other targets `/lists/list-dup-b` and shows `placeCount=3`, `public`. | LIST-011-US-004 | Yes | UI E2E | Smoke cadence. Source: LIST-001-US-007 and LIST-011-US-004. |
| LIST-011-US-004-TC-002 | Opening duplicate-name row uses selected ID | UI, Navigation, Data Integrity | Critical | FX-LIST-011-D is loaded. | Select row `list-dup-b`. | 1. Open `/lists`. 2. Activate the row/link for `list-dup-b`. 3. Inspect route and detail request. | App navigates to `/lists/list-dup-b`; detail request targets `GET /api/v1/lists/list-dup-b`; `list-dup-a` is not opened. | LIST-011-US-004 | Yes | UI E2E | Smoke cadence. |
| LIST-011-US-004-TC-003 | Duplicate names never merge rows after API retrieval | API, Data Integrity | Critical | FX-LIST-011-D is loaded. | `GET /api/v1/lists`. | 1. Request owned-list collection. 2. Filter response by `name="Weekend Food"`. | Response status is `200 OK`; exactly two records with name `Weekend Food` are returned; IDs are `list-dup-a` and `list-dup-b`; records are not merged or overwritten. | LIST-011-US-004 | Yes | API | Smoke cadence. |
| LIST-011-US-004-TC-004 | Duplicate names survive page refresh and data reload | UI, Regression, Data Integrity | High | FX-LIST-011-D is loaded. | Refresh `/lists`. | 1. Open `/lists`. 2. Refresh the page. 3. Re-request owned lists. 4. Inspect rows. | Both duplicate rows remain after reload; `list-dup-a` and `list-dup-b` still appear once each; row route targets remain ID-specific. | LIST-011-US-004 | Yes | UI E2E | Regression cadence. |
| LIST-011-US-004-TC-005 | Edit action targets selected duplicate-list ID only | UI, Integration, Data Integrity | High | FX-LIST-011-G is loaded; edit controls are available. | Select edit for `list-action-b`, name `آيس كريم`. | 1. Open duplicate-name rows. 2. Activate edit for `list-action-b`. 3. Inspect outgoing PATCH target without completing full rename validation. | Edit flow targets `PATCH /api/v1/lists/list-action-b`; it does not target `list-action-a`. | LIST-011-US-004 | Yes | UI E2E | Regression cadence. Integration only; full edit behavior remains LIST-004-owned. |
| LIST-011-US-004-TC-006 | Delete action targets selected duplicate-list ID only | UI, Integration, Data Integrity | High | FX-LIST-011-G is loaded; delete controls are available. | Select delete for `list-action-b`. | 1. Open duplicate-name rows. 2. Activate delete for `list-action-b`. 3. Inspect confirmation/action target without validating full delete flow. | Delete flow target is `list-action-b`; `list-action-a` remains visible and unchanged before any confirmed mutation. | LIST-011-US-004 | Yes | UI E2E | Regression cadence. Integration only; full delete behavior remains LIST-006-owned. |
| LIST-011-US-004-TC-007 | Add and remove entry points preserve selected duplicate-list ID | UI, Integration, Data Integrity | High | FX-LIST-011-G is loaded; add/remove controls are available for both duplicate rows/details. | Selected list `list-action-b`. | 1. Open or select `list-action-b`. 2. Trigger add-place and remove-place entry points without validating full mutation behavior. 3. Inspect list ID used by the entry point. | Add/remove entry points use `list-action-b`; they do not use `list-action-a` because names match. | LIST-011-US-004 | Yes | UI E2E | Regression cadence. Integration only; full add/remove behavior remains LIST-008/LIST-010-owned. |

## LIST-011-US-005 - Avoid duplicate-name validation error

User Story Summary: As a user, I do not want false duplicate-name errors.

Related Feature ID: `LIST-011`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-011-US-005-TC-001 | Create duplicate shows no duplicate-name validation message | UI, Validation, Negative | High | FX-LIST-011-A is loaded; create dialog is open. | Name `برجر`, visibility `private`. | 1. Enter duplicate name. 2. Save. 3. Inspect validation region and network. | No duplicate-name validation message appears; `POST /api/v1/lists` returns `201 Created`; app opens the new list ID returned by the response. | LIST-011-US-005 | Yes | UI E2E | Regression cadence. |
| LIST-011-US-005-TC-002 | Rename duplicate shows no duplicate-name validation message | UI, Validation, Negative | High | FX-LIST-011-C is loaded; rename dialog is open for `list-family-a`. | Name `عطلة نهاية الأسبوع`. | 1. Enter duplicate target name. 2. Save. 3. Inspect validation region and network. | No duplicate-name validation message appears; `PATCH /api/v1/lists/list-family-a` returns `200 OK`; selected list is renamed. | LIST-011-US-005 | Yes | UI E2E | Regression cadence. |
| LIST-011-US-005-TC-003 | Duplicate-name error code is absent from create and rename responses | API, Validation, Negative | High | FX-LIST-011-A and FX-LIST-011-C are loaded. | Duplicate create and duplicate rename requests. | 1. Send duplicate create. 2. Send duplicate rename. 3. Inspect both responses. | Create response is `201 Created`; rename response is `200 OK`; neither response includes `409`, `DUPLICATE_LIST_NAME`, `duplicate_name`, or field error for `name`. | LIST-011-US-005 | Yes | API | Regression cadence. |
| LIST-011-US-005-TC-004 | Other validation errors remain separate from duplicate-name allowance | Traceability Verification | Medium | LIST-003 and LIST-004 own required-name and max-length validation. | Empty, whitespace-only, and over-80-character names. | 1. Review validation packages. 2. Confirm LIST-011 does not weaken documented invalid-name checks. | LIST-011 only says valid duplicate names must succeed; invalid name behavior remains covered by LIST-003 and LIST-004 validation tests. | LIST-011-US-005 | No | Traceability Verification | Manual Review cadence. |

## LIST-011-US-006 - Provide visual disambiguation for duplicates

User Story Summary: As a user, I want duplicate names still understandable in the UI.

Related Feature ID: `LIST-011`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-011-US-006-TC-001 | Duplicate owned rows are visually distinguishable by metadata | UI, UX, Data Integrity | High | FX-LIST-011-D is loaded. | Duplicate rows named `Weekend Food`. | 1. Open `/lists`. 2. Inspect duplicate-name row metadata. | Each duplicate row displays the same name plus distinguishing metadata: different `placeCount`, visibility, and route identity; no row relies on name alone for identity. | LIST-011-US-006 | Yes | UI E2E | Smoke cadence. |
| LIST-011-US-006-TC-002 | Arabic duplicate rows are distinguishable | UI, Arabic, RTL, Data Integrity | High | `user-001` owns `list-ar-a` and `list-ar-b`, both named `قائمة العائلة`, with different visibility and place counts. | `/lists` in RTL UI. | 1. Open `/lists`. 2. Inspect row text, metadata, and route targets. | Two rows named `قائمة العائلة` render in valid UTF-8; row metadata distinguishes them; route targets are distinct IDs; no mojibake appears. | LIST-011-US-006 | Yes | UI E2E | Regression cadence. |
| LIST-011-US-006-TC-003 | Mixed-language duplicate rows preserve readable bidi order | UI, Localization, RTL, Responsive | Medium | FX-LIST-011-E is loaded. | Duplicate name `Best برجر 2026`. | 1. Open `/lists` in RTL layout. 2. Inspect row text order and containment. | Mixed Arabic/English duplicate names remain readable in logical order; numeric and English fragments do not reorder Arabic text; no horizontal overflow occurs. | LIST-011-US-006 | Yes | UI E2E | Regression cadence. Source: RESP-002-US-018. |
| LIST-011-US-006-TC-004 | Duplicate accessible row names include disambiguating context | Accessibility, UI | High | FX-LIST-011-D is loaded. | Accessibility tree for duplicate `Weekend Food` rows. | 1. Open `/lists`. 2. Inspect accessible names/descriptions for both duplicate rows. | Each duplicate row/link has a programmatically determinable accessible name or description that includes list name plus distinguishing context such as `placeCount`, visibility, or route identity; two duplicate rows are not announced identically. | LIST-011-US-006 | Yes | Accessibility | Regression cadence. Source: RESP-004-US-009 and global accessible-name requirements. |
| LIST-011-US-006-TC-005 | Keyboard navigation preserves duplicate-row focus identity | Accessibility, UI | High | FX-LIST-011-D is loaded. | Keyboard-only path through duplicate rows. | 1. Tab through duplicate rows. 2. Record focused row/link identity and route target. | Focus-visible appears on each duplicate row/action; focus order reaches both rows separately; activation of focused row opens that row's ID-specific route. | LIST-011-US-006 | Yes | Accessibility | Regression cadence. Source: RESP-001-US-007, RESP-001-US-008. |
| LIST-011-US-006-TC-006 | Duplicate-name row updates are announced through live status when list data reloads | Accessibility, UI | Medium | FX-LIST-011-D is loaded; owned-list data reloads after duplicate create or rename. | Before and after duplicate list collection. | 1. Trigger documented duplicate create or rename. 2. Refresh owned-list data. 3. Inspect live/status region. | Updated duplicate-name collection is announced through visible status text, `role=status`, `aria-live=polite`, or equivalent; stale pre-update count is not announced as current. | LIST-011-US-006 | Yes | Accessibility | Regression cadence. |

## LIST-011-US-007 - Preserve public duplicate safety

User Story Summary: As a public-list viewer, I want duplicate public names distinguishable.

Related Feature ID: `LIST-011`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-011-US-007-TC-001 | Public duplicate names are distinguishable without private owner data | UI, Privacy, Security, Integration | High | FX-LIST-011-F is loaded; public-list UI can render public lists. | Public duplicate rows `مطاعم الرياض`. | 1. Open public duplicate-name context. 2. Inspect visible UI, DOM, and accessibility tree. | Two public rows named `مطاعم الرياض` are distinguishable by owner display name `سارة` / `خالد` and route identity; owner email, internal user ID, private notes, and hidden metadata are absent. | LIST-011-US-007 | Yes | Security | Regression cadence. Public browse mechanics remain PUBLIC-owned; duplicate safety is LIST-011 requirement. |
| LIST-011-US-007-TC-002 | Public duplicate route identity opens selected public list | UI, Navigation, Privacy | Medium | FX-LIST-011-F is loaded. | Select `public-list-b`. | 1. Activate public row for owner display name `خالد`. 2. Inspect route target. | App opens the route for `public-list-b`; it does not open `public-list-a`; route identity does not depend on list name alone. | LIST-011-US-007 | Yes | UI E2E | Regression cadence. |
| LIST-011-US-007-TC-003 | Public-list browsing behavior remains PUBLIC-owned | Traceability Verification | Medium | QA traceability review is being performed. | PUBLIC list index/detail behavior. | 1. Review LIST-011 public duplicate cases. 2. Confirm they validate only duplicate-name disambiguation and privacy. | LIST-011 does not duplicate public-list browsing, public detail loading, stale public visibility, or public-list pagination; those remain PUBLIC-owned. | LIST-011-US-007 | No | Traceability Verification | Manual Review cadence. |

## LIST-011-US-008 - Keep duplicate-name behavior documented for QA

User Story Summary: As QA, I want duplicate-name allowance explicit so that tests do not expect rejection.

Related Feature ID: `LIST-011`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-011-US-008-TC-001 | QA contract forbids duplicate-name rejection expectations | Traceability Verification | High | Test package review is being performed. | LIST-003, LIST-004, LIST-011 duplicate-name tests. | 1. Review duplicate create and rename tests. 2. Search for expected `409 Conflict` or duplicate-name validation on valid duplicate names. | Valid duplicate create and rename tests expect success; no executable test expects duplicate-name rejection for a valid list name. | LIST-011-US-008 | No | Traceability Verification | Manual Review cadence. |
| LIST-011-US-008-TC-002 | Whitespace, case, and Unicode normalization policy remain undefined unless documented | Requirement Clarification | Medium | LIST-011 documents duplicate names allowed but does not define case sensitivity, Unicode normalization, or whitespace equivalence for name comparison. | Candidate names `برجر`, ` برجر `, `BURGER`, NFC/NFD variants. | 1. Review source requirements. 2. Confirm whether normalization/case/trim equivalence is part of duplicate-name policy. | No executable LIST-011 test asserts case-insensitive, normalization-insensitive, or whitespace-equivalent duplicate behavior until documented; trimming validation remains LIST-003/LIST-004-owned. | LIST-011-US-008 | No | Requirement Clarification | Manual Review cadence. |
| LIST-011-US-008-TC-003 | Feature ownership boundary remains explicit | Traceability Verification | Medium | QA traceability review is being performed. | LIST-001, LIST-003, LIST-004, LIST-006, LIST-008, LIST-010, PUBLIC. | 1. Review this package. 2. Confirm each integration case validates only duplicate-name identity/disambiguation. | LIST-011 executable tests stay within duplicate-name allowance, ID-based identity, and duplicate-name rendering; full create, rename, delete, add/remove, and public browsing behavior remain in their owning packages. | LIST-011-US-008 | No | Traceability Verification | Manual Review cadence. |

## Responsive Certification

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-011-RESP-TC-001 | Duplicate rows fit 320px, 390px, and 430px viewports | Responsive, Mobile, UI | High | FX-LIST-011-H is loaded. | Viewports `320x568`, `390x844`, `430x932`. | 1. Set each viewport. 2. Open `/lists`. 3. Inspect duplicate rows, metadata, and route controls. | At each viewport, `document.documentElement.scrollWidth <= window.innerWidth`; duplicate names and distinguishing metadata remain visible or reachable; final duplicate row/action is not obscured by bottom navigation or safe-area padding. | LIST-011-US-006 | Yes | UI E2E | Regression cadence. Source: RESP-001-US-011, RESP-002-US-001, RESP-002-US-002, RESP-002-US-005. |
| LIST-011-RESP-TC-002 | Duplicate rows remain usable at 200% zoom | Responsive, Accessibility | High | FX-LIST-011-H is loaded; 200% browser zoom active. | Duplicate list rows. | 1. Enable 200% zoom. 2. Open `/lists`. 3. Navigate duplicate rows by keyboard and pointer. | `document.documentElement.scrollWidth <= window.innerWidth`; duplicate row names, metadata, focus indicator, and route controls remain visible and operable; interactive targets remain at least `44x44` CSS pixels. | LIST-011-US-006 | Yes | Accessibility | Regression cadence. Source: RESP-003-US-001, RESP-003-US-008. |
| LIST-011-RESP-TC-003 | Duplicate create and rename dialogs remain usable under mobile keyboard pressure | Responsive, Accessibility, UI | Medium | FX-LIST-011-A and FX-LIST-011-C are loaded; create and rename dialogs are reachable. | Mobile viewport with virtual keyboard open. | 1. Open create dialog and type `برجر`. 2. Open rename dialog and type `عطلة نهاية الأسبوع`. 3. Inspect fields/actions. | Focused field, save action, cancel/close action, and validation/status text remain reachable without horizontal overflow. | LIST-011-US-005 | Yes | Accessibility | Nightly cadence. Source: RESP-002-US-009, A11Y-001-US-013. |

## Final Summary

1. User stories processed: 8
2. Total executable test cases: 34
3. Clarification / Manual / Traceability cases: 5
4. Total test cases: 39
5. Test count per user story:
   - LIST-011-US-001: 5
   - LIST-011-US-002: 3
   - LIST-011-US-003: 5
   - LIST-011-US-004: 7
   - LIST-011-US-005: 5
   - LIST-011-US-006: 8
   - LIST-011-US-007: 3
   - LIST-011-US-008: 3
6. Count by test type:
   - API: 12
   - Accessibility: 5
   - Arabic: 2
   - Contract: 2
   - Data Integrity: 17
   - Integration: 4
   - Localization: 2
   - Mobile: 1
   - Navigation: 3
   - Negative: 5
   - Positive: 2
   - Privacy: 6
   - Requirement Clarification: 1
   - Responsive: 4
   - RTL: 2
   - Security: 4
   - Traceability Verification: 4
   - UI: 20
   - UX: 1
   - Validation: 5
7. Count by priority:
   - Critical: 9
   - High: 20
   - Medium: 10
8. Count by automation layer:
   - API: 9
   - Accessibility: 5
   - Requirement Clarification: 1
   - Security: 4
   - Traceability Verification: 4
   - UI E2E: 16
9. Top automation candidates:
   - API duplicate create and rename success contracts: `201 Created` and `200 OK`, unique IDs, duplicate name preserved, no `409`.
   - UI E2E duplicate row rendering, route identity, selected-row edit/delete/add/remove entry points, and reload persistence.
   - Accessibility automation for duplicate accessible names, screen-reader disambiguation, keyboard navigation, focus-visible, and live/status announcements.
   - Responsive automation for duplicate rows and duplicate-name dialogs at mobile viewports and 200% zoom.

## Validation

- Duplicate Test IDs = 0
- Invalid Story References = 0
- Missing User Stories = 0
- Encoding/Mojibake = 0
- API Tests Missing Status Codes = 0
- Requirement Fidelity Violations = 0
- Feature Ownership Violations = 0
