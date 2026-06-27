# LIST-002 Test Cases

Feature: `LIST-002 - View list count and place count`

Source: `docs/user-stories/LISTS_USER_STORIES.md`

Supporting Sources:

- `docs/feature-map/FEATURE_TRACEABILITY.md`
- `docs/user-stories/LIST-001_TEST_CASES.md`
- `docs/user-stories/RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`
- `docs/user-stories/PROFILE_USER_STORIES.md`
- `docs/user-stories/PLACE_DETAILS_USER_STORIES.md`

Scope: All user stories under `LIST-002`.

## QA Execution Standards

- Test cases validate documented requirements only. Undefined behavior is captured as Requirement Clarification, Manual Verification, or Traceability Verification.
- `LIST-002` owns displaying owned-list summary counts derived from the current user's owned-list data.
- `LIST-002` does not own list creation, deletion, add-place, remove-place, profile summary implementation, public-list browsing, cache strategy, or browser history behavior.
- Mutation-related tests verify only the refreshed LIST-002 count result after documented LIST-* mutation success.
- Count source endpoint from traceability: `GET /api/v1/lists` with Bearer authentication.
- Owned list collection contract is inherited from `LIST-001-US-003`: `{ data: ListResponse[], meta: { limit, offset, total, sort } }`.
- `placeCount` is a membership count, not a unique-place count across all lists.
- Executable responsive/accessibility tests cite approved global requirements and do not invent LIST-002-specific behavior.
- Automation cadence values used in Notes: Smoke, Regression, Nightly, Manual Review.

## Deterministic Count Fixtures

| Fixture ID | Owner Context | Owned Lists Returned By `GET /api/v1/lists` | Other Users' Lists | Expected List Count | Expected Total Place Membership Count |
|---|---|---|---|---:|---:|
| Fixture A | `u_owner` authenticated | `list_a` name `برجر الرياض`, visibility `private`, `placeCount=2`; `list_b` name `قهوة العمل`, visibility `public`, `placeCount=5`; `list_c` name `آيس كريم`, visibility `private`, `placeCount=1` | `other_private` `placeCount=9`; `other_public` `placeCount=4` | 3 | 8 |
| Fixture B | `u_new` authenticated | none; API returns `data=[]`, `meta.total=0` | none | 0 | 0 |
| Fixture C | `u_single` authenticated | `list_one` name `قائمتي`, visibility `private`, `placeCount=1` | none | 1 | 1 |
| Fixture D | `u_many` authenticated | 100 owned lists in first page, each `placeCount=1` | none | 100 | 100 |
| Fixture E | `u_duplicate_names` authenticated | `dup_1` name `برجر`, `placeCount=2`; `dup_2` name `برجر`, `placeCount=3` | none | 2 | 5 |
| Fixture F | `u_shared_place` authenticated | `list_x` contains place `place_shared`, `placeCount=1`; `list_y` also contains place `place_shared`, `placeCount=1` | none | 2 | 2 |

## LIST-002-US-001 - Show owned list count

User Story Summary: As a user, I want to see how many lists I own so that I understand my archive size.

Related Feature ID: `LIST-002`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-002-US-001-TC-001 | API returns owned-list count source for Fixture A | API, Contract, Positive, Data Integrity | Critical | `u_owner` is authenticated; Fixture A exists. | `GET /api/v1/lists?limit=100&offset=0` as `u_owner`. | 1. Send authenticated request. 2. Inspect status, top-level envelope, `data`, and `meta`. 3. Compute `data.length` and read `meta.total`. | Response status is `200 OK`; response has top-level `data` array and `meta` object; `data.length=3`; `meta.total=3`; `meta.limit=100`; `meta.offset=0`; `meta.sort=created_at_desc`; `data` contains only `list_a`, `list_b`, and `list_c`. | LIST-002-US-001 | Yes | API | Smoke cadence. Source: LIST-002-US-001, LIST-001-US-003, FEATURE_TRACEABILITY. |
| LIST-002-US-001-TC-002 | UI renders owned list count of 3 from Fixture A | UI, Positive, Data Integrity | Critical | Fixture A response is returned to `/lists`. | Summary count expected `3`. | 1. Sign in as `u_owner`. 2. Open `/lists`. 3. Wait for `GET /api/v1/lists` to return Fixture A. 4. Inspect the owned-list summary count. | The visible owned-list count is exactly `3`; no count derived from `other_private` or `other_public` appears; DOM and accessibility tree expose the owned-list count as `3`. | LIST-002-US-001 | Yes | UI E2E | Smoke cadence. |
| LIST-002-US-001-TC-003 | Other users' public and private lists are excluded from list count | API, UI, Privacy, Security | Critical | Fixture A exists with `other_private` and `other_public`. | `u_owner` session; other users' lists have combined count `2`. | 1. Request `GET /api/v1/lists` as `u_owner`. 2. Open `/lists`. 3. Search response, DOM, and accessibility tree for other-user list IDs and names. | Response status is `200 OK`; response, DOM, and accessibility tree contain no `other_private` or `other_public`; visible owned-list count remains `3`, not `5`. | LIST-002-US-001 | Yes | Security | Smoke cadence. |
| LIST-002-US-001-TC-004 | Owned public and owned private lists both contribute to owned list count | API, UI, Privacy | High | Fixture A exists. | `list_a` private, `list_b` public, `list_c` private. | 1. Sign in as `u_owner`. 2. Open `/lists`. 3. Inspect returned list visibility values and summary count. | Response status is `200 OK`; `list_a`, `list_b`, and `list_c` all contribute to the summary because they are owned by `u_owner`; visible owned-list count is exactly `3`. | LIST-002-US-001 | Yes | UI E2E | Regression cadence. |
| LIST-002-US-001-TC-005 | One owned list renders list count 1 | UI, Boundary | High | `u_single` is authenticated; Fixture C exists. | `GET /api/v1/lists` returns one list. | 1. Sign in as `u_single`. 2. Open `/lists`. 3. Inspect summary count and list rows. | Response status is `200 OK`; `meta.total=1`; exactly one owned-list row renders; visible owned-list count is exactly `1`. | LIST-002-US-001 | Yes | UI E2E | Regression cadence. |
| LIST-002-US-001-TC-006 | Many owned lists render list count 100 | API, UI, Boundary | High | `u_many` is authenticated; Fixture D exists. | `GET /api/v1/lists?limit=100&offset=0`. | 1. Send authenticated request. 2. Open `/lists`. 3. Inspect summary count. | Response status is `200 OK`; `data.length=100`; `meta.total=100`; visible owned-list count is exactly `100` using Western digits. | LIST-002-US-001 | Yes | API | Regression cadence. Source: LIST-001-US-005. |
| LIST-002-US-001-TC-007 | Duplicate list names are counted as separate owned lists | API, UI, Edge Case, Data Integrity | High | `u_duplicate_names` is authenticated; Fixture E exists. | Two owned lists both named `برجر`. | 1. Sign in as `u_duplicate_names`. 2. Open `/lists`. 3. Inspect response list IDs and visible count. | Response status is `200 OK`; response contains distinct IDs `dup_1` and `dup_2`; visible owned-list count is exactly `2`; duplicate names are not collapsed into one count. | LIST-002-US-001 | Yes | UI E2E | Regression cadence. Source: duplicate list names allowed; list identity is ID, not name. |
| LIST-002-US-001-TC-008 | List count does not require undocumented `listCount` API field | Requirement Clarification, Manual | Medium | API contract review is being performed. | `GET /api/v1/lists`; documented envelope from LIST-001. | 1. Review LIST-001 and LIST-002 source requirements. 2. Confirm whether a dedicated top-level `listCount` field is documented outside the owned-list envelope. | Until a source explicitly documents top-level `listCount`, LIST-002 executable tests derive list count from `meta.total` and the returned owned `data` collection only. | LIST-002-US-001 | No | Manual | Manual Review cadence. |
| LIST-002-US-001-TC-009 | API response excludes forbidden fields while count is present | API, Privacy, Security | Critical | Fixture A exists; another user owns private and public lists. | `GET /api/v1/lists` as `u_owner`. | 1. Send authenticated request. 2. Recursively inspect response JSON. 3. Verify count source fields are still present. | Response status is `200 OK`; `data` and `meta.total=3` are present; response contains no other users' private lists, private notes, owner email, internal user ID, refresh token, session token, hidden metadata, moderation fields, audit/debug fields, stack traces, or SQL details. | LIST-002-US-001 | Yes | Security | Smoke cadence. |
| LIST-002-US-001-TC-010 | Guest API request receives 401 without count data | API, Authentication, Security, Negative | Critical | No Bearer token is supplied. | `GET /api/v1/lists`. | 1. Clear authentication. 2. Send request without Bearer token. 3. Inspect status and payload recursively. | Response status is `401 Unauthorized`; payload contains no `data` array, `meta.total`, list names, list IDs, visibility values, `placeCount`, owner identifiers, private notes, tokens, stack traces, SQL details, or debug fields. | LIST-002-US-001 | Yes | API | Smoke cadence. Source: LIST-001-US-002. |
| LIST-002-US-001-TC-011 | Expired session blocks count summary without private-data flash | UI, Authentication, Privacy, Security | Critical | Browser has expired token; previous session cached Fixture A summary. | Expired token; cached visible values `3` and `8`. | 1. Load `/lists` with expired token. 2. Capture first paint, DOM, and accessibility tree until auth denial completes. 3. Inspect network status. | `GET /api/v1/lists` returns `401 Unauthorized`; no owned-list count, total place count, list names, list IDs, or `placeCount` values from the expired session appear in visible UI, DOM, or accessibility tree before or after denial. | LIST-002-US-001 | Yes | Security | Smoke cadence. |
| LIST-002-US-001-TC-012 | Auth recovery reloads count source after successful sign-in | UI, Authentication, Integration | High | User starts unauthenticated, then signs in as `u_owner`; Fixture A exists. | Initial `401 Unauthorized`, then authenticated `GET /api/v1/lists`. | 1. Open `/lists` without auth and observe denial. 2. Sign in as `u_owner`. 3. Return to `/lists`. 4. Inspect network and summary counts. | After valid authentication, a fresh `GET /api/v1/lists` returns `200 OK`; visible owned-list count is exactly `3`; no count from the denied/guest state remains. | LIST-002-US-001 | Yes | UI E2E | Regression cadence. |

## LIST-002-US-002 - Show total place membership count

User Story Summary: As a user, I want to see how many saved list memberships I have so that collection size is clear.

Related Feature ID: `LIST-002`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-002-US-002-TC-001 | API exposes numeric `placeCount` for each owned list | API, Contract, Data Integrity | Critical | `u_owner` is authenticated; Fixture A exists. | `GET /api/v1/lists?limit=100&offset=0`. | 1. Send authenticated request. 2. Inspect each item in `data`. 3. Sum all `placeCount` values. | Response status is `200 OK`; each list item has numeric `placeCount`; `list_a.placeCount=2`; `list_b.placeCount=5`; `list_c.placeCount=1`; sum is exactly `8`. | LIST-002-US-002 | Yes | API | Smoke cadence. Source: LIST-001-US-007 and LIST-002-US-002. |
| LIST-002-US-002-TC-002 | UI renders total place membership count of 8 from Fixture A | UI, Positive, Data Integrity | Critical | Fixture A response is returned to `/lists`. | Expected total `2 + 5 + 1 = 8`. | 1. Sign in as `u_owner`. 2. Open `/lists`. 3. Wait for Fixture A response. 4. Inspect total place membership summary. | Visible total place membership count is exactly `8`; DOM and accessibility tree expose the total as `8`; other users' `placeCount` values `9` and `4` are not included. | LIST-002-US-002 | Yes | UI E2E | Smoke cadence. |
| LIST-002-US-002-TC-003 | Same place saved in two lists counts as two memberships | API, UI, Edge Case, Data Integrity | Critical | `u_shared_place` is authenticated; Fixture F exists; same place ID is in two owned lists. | `list_x.placeCount=1`; `list_y.placeCount=1`; shared place ID `place_shared`. | 1. Send `GET /api/v1/lists` as `u_shared_place`. 2. Open `/lists`. 3. Inspect summary total. | Response status is `200 OK`; `meta.total=2`; total place membership count is exactly `2`, not `1`; summary follows membership-count semantics rather than unique-place semantics. | LIST-002-US-002 | Yes | UI E2E | Regression cadence. |
| LIST-002-US-002-TC-004 | One list with one place renders total membership count 1 | UI, Boundary | High | `u_single` is authenticated; Fixture C exists. | One owned list with `placeCount=1`. | 1. Sign in as `u_single`. 2. Open `/lists`. 3. Inspect summary counts. | Visible owned-list count is `1`; visible total place membership count is exactly `1`; both values use Western digits. | LIST-002-US-002 | Yes | UI E2E | Regression cadence. |
| LIST-002-US-002-TC-005 | Many lists with many places render total membership count 100 | API, UI, Boundary | High | `u_many` is authenticated; Fixture D exists. | 100 owned lists, each `placeCount=1`. | 1. Request `GET /api/v1/lists?limit=100&offset=0`. 2. Open `/lists`. 3. Inspect total place membership summary. | Response status is `200 OK`; computed sum of returned `placeCount` values is `100`; visible total place membership count is exactly `100`. | LIST-002-US-002 | Yes | API | Regression cadence. |
| LIST-002-US-002-TC-006 | Duplicate list names do not affect total place membership count | UI, Edge Case, Data Integrity | High | Fixture E exists. | `dup_1.placeCount=2`; `dup_2.placeCount=3`; both named `برجر`. | 1. Sign in as `u_duplicate_names`. 2. Open `/lists`. 3. Inspect summary counts. | Visible owned-list count is `2`; visible total place membership count is exactly `5`; duplicate names are not merged before summing `placeCount`. | LIST-002-US-002 | Yes | UI E2E | Regression cadence. |

## LIST-002-US-003 - Show zero counts safely

User Story Summary: As a new user, I want zero states to be clear so that the UI is not misleading.

Related Feature ID: `LIST-002`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-002-US-003-TC-001 | API returns empty count source for user with no lists | API, Contract, Empty State | High | `u_new` is authenticated; Fixture B exists. | `GET /api/v1/lists` as `u_new`. | 1. Send authenticated request. 2. Inspect response body. | Response status is `200 OK`; `data=[]`; `meta.total=0`; no list item or `placeCount` value is returned. | LIST-002-US-003 | Yes | API | Smoke cadence. |
| LIST-002-US-003-TC-002 | Empty owner state never shows stale nonzero summary values | UI, Empty State, Privacy | Critical | Previous session rendered Fixture A; current user `u_new` owns no lists. | Previous values `3` and `8`; current Fixture B. | 1. Sign out from `u_owner`. 2. Sign in as `u_new`. 3. Open `/lists`. 4. Inspect visible UI, DOM, and accessibility tree. | No visible, hidden, or announced summary value contains stale counts `3` or `8`; any rendered count value is `0`; if the summary is omitted, no count element is present. | LIST-002-US-003 | Yes | Security | Smoke cadence. |
| LIST-002-US-003-TC-003 | Loading state before empty response does not show fake counts | UI, Loading, Empty State | High | `u_new` is authenticated; `GET /api/v1/lists` is delayed then returns Fixture B. | Delayed response with `data=[]`, `meta.total=0`. | 1. Open `/lists`. 2. Hold the response pending. 3. Inspect loading state. 4. Release Fixture B response. | Pending state shows no fake list count or fake place count; after response resolves, no nonzero summary value is visible, present in DOM, or announced. | LIST-002-US-003 | Yes | UI E2E | Regression cadence. Source: LIST-001-US-009. |
| LIST-002-US-003-TC-004 | Product mode for zero-count display remains traceable | Requirement Clarification, Manual | Medium | QA requirements review is being performed. | Source wording permits zero display or intentional omission. | 1. Review LIST-002-US-003 and UI design decision. 2. Record whether the product displays `0` values or omits summary values for empty owners. | LIST-002 executable tests require no stale nonzero values. Exact choice between visible `0` and omitted summary remains documented before adding stricter product-copy assertions. | LIST-002-US-003 | No | Manual | Manual Review cadence. |

## LIST-002-US-004 - Update count after create

User Story Summary: As a user, I want counts updated after creating a list so that the page remains accurate.

Related Feature ID: `LIST-002`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-002-US-004-TC-001 | Refreshed summary increments after successful list creation | UI, Integration, Data Integrity | High | `u_owner` starts with Fixture A; create-list success is covered by LIST-003. | Before: list count `3`, total place count `8`; new list `list_new`, `placeCount=0`. | 1. Sign in as `u_owner`. 2. Open `/lists` and confirm initial counts `3` and `8`. 3. Complete documented LIST-003 create-list success for `list_new`. 4. Return to or refresh owned-list data for LIST-002. | After owned lists refresh, visible list count is exactly `4`; visible total place membership count remains exactly `8`; returned new list has `placeCount=0`. | LIST-002-US-004 | Yes | UI E2E | Regression cadence. Mutation flow ownership: LIST-003. |
| LIST-002-US-004-TC-002 | API count source reflects new list after create refresh | API, Integration | High | `u_owner` starts with Fixture A; `list_new` was created successfully. | `GET /api/v1/lists?limit=100&offset=0`. | 1. Complete LIST-003 create success. 2. Request owned lists. 3. Inspect response. | Response status is `200 OK`; `meta.total=4`; response contains `list_new`; `list_new.placeCount=0`; sum of all `placeCount` values is `8`. | LIST-002-US-004 | Yes | API | Regression cadence. |
| LIST-002-US-004-TC-003 | Create mutation details remain LIST-003-owned | Traceability Verification, Manual | Medium | QA traceability review is being performed. | LIST-003 and LIST-002 requirements. | 1. Review create-list tests in LIST-003. 2. Review LIST-002 count-refresh tests. | LIST-002 validates only the refreshed count result after a documented successful create; create dialog validation, payload rules, default visibility, and navigation remain LIST-003-owned. | LIST-002-US-004 | No | Manual | Manual Review cadence. |

## LIST-002-US-005 - Update count after delete

User Story Summary: As a user, I want counts updated after deleting a list so that removed memberships are no longer counted.

Related Feature ID: `LIST-002`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-002-US-005-TC-001 | Refreshed summary decrements after deleting list with memberships | UI, Integration, Data Integrity | High | `u_owner` starts with Fixture A; delete-list success is covered by LIST-006. | Delete `list_b` with `placeCount=5`. Before: list count `3`, total `8`. | 1. Sign in as `u_owner`. 2. Confirm counts `3` and `8`. 3. Complete documented LIST-006 delete success for `list_b`. 4. Refresh owned-list data. | Visible list count is exactly `2`; visible total place membership count is exactly `3`; `list_b` is absent from response, DOM, and accessibility tree. | LIST-002-US-005 | Yes | UI E2E | Regression cadence. Mutation ownership: LIST-006. |
| LIST-002-US-005-TC-002 | API count source removes deleted list memberships | API, Integration | High | `list_b` was deleted successfully for `u_owner`. | Remaining lists: `list_a.placeCount=2`, `list_c.placeCount=1`. | 1. Request `GET /api/v1/lists` after deletion. 2. Inspect response and compute sum. | Response status is `200 OK`; `meta.total=2`; response does not contain `list_b`; computed total `placeCount` is exactly `3`. | LIST-002-US-005 | Yes | API | Regression cadence. |
| LIST-002-US-005-TC-003 | Rename does not change count values after refresh | UI, Integration, Regression | Medium | `u_duplicate_names` starts with Fixture E; rename success is covered by LIST-004. | Rename `dup_1` from `برجر` to `برجر جديد`. | 1. Confirm initial counts `2` and `5`. 2. Complete documented LIST-004 rename success for `dup_1`. 3. Refresh owned-list data. | Visible owned-list count remains exactly `2`; visible total place membership count remains exactly `5`; renamed list identity remains `dup_1`. | LIST-002-US-005 | Yes | UI E2E | Regression cadence. Source: list identity is ID, not name; mutation ownership: LIST-004. |
| LIST-002-US-005-TC-004 | Delete mutation details remain LIST-006-owned | Traceability Verification, Manual | Medium | QA traceability review is being performed. | LIST-006 and LIST-002 requirements. | 1. Review delete-list tests in LIST-006. 2. Review LIST-002 refreshed count tests. | LIST-002 validates only post-delete count accuracy; confirmation dialog, delete endpoint payload, rollback, and destructive-state behavior remain LIST-006-owned. | LIST-002-US-005 | No | Manual | Manual Review cadence. |

## LIST-002-US-006 - Update count after add item

User Story Summary: As a user, I want place counts updated after adding a place so that list metadata is reliable.

Related Feature ID: `LIST-002`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-002-US-006-TC-001 | New membership increments target list and total count | UI, Integration, Data Integrity | High | `u_owner` starts with Fixture A; add-to-list success is documented by LIST-008/LIST-009. | Add new place `place_new` to `list_a`; before `list_a.placeCount=2`, total `8`. | 1. Confirm initial summary counts `3` and `8`. 2. Complete documented successful add of `place_new` to `list_a`. 3. Refresh owned-list data. | Visible owned-list count remains `3`; `list_a.placeCount` becomes exactly `3`; visible total place membership count becomes exactly `9`. | LIST-002-US-006 | Yes | UI E2E | Regression cadence. Mutation ownership: LIST-008/LIST-009. |
| LIST-002-US-006-TC-002 | API count source reflects new membership after add refresh | API, Integration | High | New membership was added to `list_a`. | Updated Fixture A: `list_a.placeCount=3`, `list_b=5`, `list_c=1`. | 1. Request `GET /api/v1/lists` after add success. 2. Inspect `list_a.placeCount`. 3. Sum counts. | Response status is `200 OK`; `meta.total=3`; `list_a.placeCount=3`; computed total `placeCount` is exactly `9`. | LIST-002-US-006 | Yes | API | Regression cadence. |
| LIST-002-US-006-TC-003 | Add mutation details remain LIST-008/LIST-009-owned | Traceability Verification, Manual | Medium | QA traceability review is being performed. | LIST-008 add-place flow and LIST-009 duplicate-idempotency requirements. | 1. Review add-to-list tests in LIST-008 and LIST-009. 2. Confirm LIST-002 covers only refreshed counts. | LIST-002 does not duplicate place search, list picker, add authorization, or membership creation validation; it verifies count results after documented add success. | LIST-002-US-006 | No | Manual | Manual Review cadence. |

## LIST-002-US-007 - Keep count unchanged after idempotent add

User Story Summary: As a user, I want duplicate adds not to inflate counts.

Related Feature ID: `LIST-002`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-002-US-007-TC-001 | Duplicate add returns 200 and summary count remains unchanged | API, UI, Data Integrity, Regression | Critical | `u_owner` starts with Fixture A; `place_existing` already belongs to `list_a`; LIST-009 idempotency applies. | Before: list count `3`, total `8`, `list_a.placeCount=2`; duplicate add response `200`. | 1. Confirm initial counts. 2. Submit duplicate add for `place_existing` to `list_a`. 3. Confirm add response status. 4. Refresh owned-list data. | Duplicate add response status is `200 OK`; visible owned-list count remains `3`; `list_a.placeCount` remains exactly `2`; visible total place membership count remains exactly `8`. | LIST-002-US-007 | Yes | API | Smoke cadence. Source: LIST-009-US-003, LIST-009-US-007. |
| LIST-002-US-007-TC-002 | Concurrent duplicate add does not inflate LIST-002 counts after refresh | API, Integration, Data Integrity | High | `place_existing` is already in `list_a`; concurrent duplicate behavior is covered by LIST-009. | Two duplicate add requests for same `(list_a, place_existing)`. | 1. Trigger concurrent duplicate add requests. 2. Wait for both to complete per LIST-009 behavior. 3. Request `GET /api/v1/lists`. | Final owned-list response status is `200 OK`; `list_a.placeCount=2`; total place membership count is exactly `8`; no duplicate membership contributes to count. | LIST-002-US-007 | Yes | API | Nightly cadence. Source: LIST-009-US-004, LIST-009-US-005, LIST-009-US-007. |
| LIST-002-US-007-TC-003 | Duplicate-add UI does not announce inflated count | UI, Accessibility, Data Integrity | High | Fixture A; duplicate add attempted from supported UI integration. | Before total `8`; duplicate add to `list_a`. | 1. Confirm current total `8`. 2. Attempt duplicate add. 3. Inspect visible summary and live/status output after refresh. | Visible and announced total place membership count remains exactly `8`; no temporary or final announcement exposes an inflated count such as `9`. | LIST-002-US-007 | Yes | Accessibility | Regression cadence. |

## LIST-002-US-008 - Update count after removal

User Story Summary: As a user, I want place counts updated after removal so that metadata is current.

Related Feature ID: `LIST-002`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-002-US-008-TC-001 | Removal decrements target list and total count | UI, Integration, Data Integrity | High | `u_owner` starts with Fixture A; remove-place success is documented by LIST-010. | Remove one place from `list_b`; before `list_b.placeCount=5`, total `8`. | 1. Confirm initial counts `3` and `8`. 2. Complete documented remove-place success for one item in `list_b`. 3. Refresh owned-list data. | Visible owned-list count remains `3`; `list_b.placeCount` becomes exactly `4`; visible total place membership count becomes exactly `7`. | LIST-002-US-008 | Yes | UI E2E | Regression cadence. Mutation ownership: LIST-010. |
| LIST-002-US-008-TC-002 | Removing final item leaves list count unchanged and place count zero | API, UI, Edge Case, Data Integrity | High | `list_c` has `placeCount=1` in Fixture A. | Remove final place from `list_c`. | 1. Remove the only membership from `list_c` per LIST-010. 2. Request `GET /api/v1/lists`. 3. Inspect summary counts. | Response status is `200 OK`; `meta.total=3`; `list_c.placeCount=0`; visible owned-list count remains `3`; visible total place membership count becomes exactly `7`. | LIST-002-US-008 | Yes | API | Regression cadence. |
| LIST-002-US-008-TC-003 | Remove mutation details remain LIST-010-owned | Traceability Verification, Manual | Medium | QA traceability review is being performed. | LIST-010 and LIST-002 requirements. | 1. Review remove-place tests in LIST-010. 2. Confirm LIST-002 covers only refreshed count values. | LIST-002 does not duplicate remove authorization, undo, rollback, or not-found behavior; it verifies count results after documented remove success. | LIST-002-US-008 | No | Manual | Manual Review cadence. |

## LIST-002-US-009 - Format counts for RTL

User Story Summary: As an Arabic user, I want numeric counts readable in RTL UI.

Related Feature ID: `LIST-002`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-002-US-009-TC-001 | Count digits use Western numerals and bidi-safe fragments | UI, Localization, Arabic, RTL | High | Fixture A renders in Arabic RTL UI. | Expected visible values `3` and `8`. | 1. Sign in as `u_owner`. 2. Open `/lists`. 3. Inspect text nodes for the count summary. | Count values render as Western digits `3` and `8`; Arabic-Indic digits `٣` and `٨` are absent; numeric fragments are isolated so Arabic labels remain in correct RTL order. | LIST-002-US-009 | Yes | UI E2E | Smoke cadence. Source: LIST-002-US-009, RESP-004-US-001, RESP-004-US-002. |
| LIST-002-US-009-TC-002 | Count labels do not overlap at 320px | Responsive, Mobile, RTL | High | Fixture A renders; viewport is `320x568`. | Count labels plus values `3` and `8`. | 1. Set viewport to `320x568`. 2. Open `/lists`. 3. Inspect count summary bounding boxes and page width. | Owned-list count label and total-place count label do not overlap each other or their values; `document.documentElement.scrollWidth <= window.innerWidth`. | LIST-002-US-009 | Yes | UI E2E | Smoke cadence. Source: LIST-002-US-009, RESP-002-US-001, RESP-002-US-002. |
| LIST-002-US-009-TC-003 | Count summary fits 390px and 430px mobile widths | Responsive, Mobile | High | Fixture A renders. | Viewports `390x844` and `430x932`. | 1. Open `/lists` at `390x844`. 2. Inspect count labels and values. 3. Repeat at `430x932`. | At both widths, count labels and values remain readable and contained; no horizontal overflow occurs; no summary value is clipped. | LIST-002-US-009 | Yes | UI E2E | Regression cadence. Source: RESP-002-US-001, RESP-002-US-002, RESP-002-US-020. |
| LIST-002-US-009-TC-004 | Count summary supports phone landscape | Responsive, Mobile, Landscape | High | Fixture A renders; phone landscape viewport is active. | Viewport `844x390`. | 1. Set phone landscape viewport. 2. Open `/lists`. 3. Inspect summary and bottom navigation. | Count summary remains visible or reachable without horizontal overflow; bottom navigation and safe-area padding do not cover count values. | LIST-002-US-009 | Yes | UI E2E | Regression cadence. Source: RESP-002-US-012. |
| LIST-002-US-009-TC-005 | Count summary supports 200% zoom | Responsive, Accessibility, Low Vision | High | Fixture A renders at `200%` browser zoom. | Count values `3` and `8`. | 1. Set browser zoom to `200%`. 2. Open `/lists`. 3. Inspect summary width, text clipping, and action reachability. | `document.documentElement.scrollWidth <= window.innerWidth`; count labels and values remain readable; primary controls remain reachable; interactive targets are at least `44x44` CSS pixels where applicable. | LIST-002-US-009 | Yes | Accessibility | Regression cadence. Source: RESP-003-US-001, RESP-003-US-002, RESP-003-US-008. |
| LIST-002-US-009-TC-006 | Count summary has semantic grouping and accessible names | Accessibility, Screen Reader | High | Fixture A renders. | Summary labels for owned-list count and total place membership count. | 1. Open `/lists`. 2. Inspect accessibility tree around the summary. 3. Read accessible names and values. | Count summary is exposed as a coherent group, region, heading-associated section, or equivalent semantic structure; owned-list count accessible name includes its purpose and value `3`; total place membership count accessible name includes its purpose and value `8`. | LIST-002-US-009 | Yes | Accessibility | Regression cadence. Source: RESPONSIVE_ACCESSIBILITY global labels and semantic certification. |
| LIST-002-US-009-TC-007 | Count changes are announced after refresh | Accessibility, Integration | High | Fixture A is visible; a documented add or remove success triggers count refresh. | Before total `8`; after add total `9`. | 1. Open `/lists` with Fixture A. 2. Trigger documented new add success for `list_a`. 3. Refresh owned-list data. 4. Inspect live/status output. | Updated total place membership count `9` is exposed through visible text and programmatic status such as `role=status`, `aria-live=polite`, or equivalent; stale value `8` is no longer announced as current. | LIST-002-US-009 | Yes | Accessibility | Regression cadence. Source: RESPONSIVE_ACCESSIBILITY global live/status certification. |
| LIST-002-US-009-TC-008 | Keyboard path reaches count-adjacent controls without losing focus-visible | Accessibility, Keyboard | Medium | `/lists` renders with count summary and at least one owned-list row/action. | Keyboard-only navigation. | 1. Open `/lists`. 2. Navigate with Tab and Shift+Tab through summary-adjacent controls and list rows. 3. Activate reachable controls with Enter or Space where applicable. | Keyboard focus order remains logical; visible `focus-visible` indicator appears on focused controls; count text is not incorrectly focusable unless it is an interactive control. | LIST-002-US-009 | Yes | Accessibility | Regression cadence. Source: RESP-001-US-007, RESP-001-US-008. |
| LIST-002-US-009-TC-009 | Count summary remains visible in forced-colors mode | Accessibility, Responsive | Medium | Fixture A renders; forced-colors mode is active. | Forced-colors/high-contrast environment. | 1. Enable forced-colors mode. 2. Open `/lists`. 3. Inspect summary text, borders, and focus indicators. | Count labels and values remain distinguishable from background; no required count text disappears; focus indicators remain visible for nearby controls. | LIST-002-US-009 | Yes | Accessibility | Nightly cadence. Source: RESP-003-US-014, RESP-003-US-015. |
| LIST-002-US-009-TC-010 | Reduced motion does not hide count updates | Accessibility, Responsive | Medium | Fixture A renders; reduced motion is active; a documented count-changing refresh occurs. | `prefers-reduced-motion: reduce`; before total `8`, after total `9`. | 1. Enable reduced motion. 2. Open `/lists`. 3. Trigger documented count refresh. 4. Inspect visible and accessible updated count. | Updated count value is visible and announced without relying on animation; nonessential transitions are removed or minimized; final visible total is exactly `9`. | LIST-002-US-009 | Yes | Accessibility | Nightly cadence. Source: RESP-003-US-016, RESP-003-US-017. |

## Cross-Feature Traceability Cases

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-002-TRACE-TC-001 | Profile count consistency remains profile-owned | Traceability Verification, Manual | Medium | QA traceability review is being performed. | `PROFILE-001-US-005`, `PROFILE-001-US-006`, LIST-002. | 1. Review LIST-002 count ownership. 2. Review Profile `listsCount` requirements. 3. Confirm Profile test package validates profile summary rendering. | LIST-002 verifies `/lists` summary counts; Profile `listsCount` rendering and synchronization remain PROFILE-owned with traceability to the same owned-list data. | LIST-002-US-001 | No | Manual | Manual Review cadence. |
| LIST-002-TRACE-TC-002 | Place Details list context remains PLACE-owned | Traceability Verification, Manual | Medium | QA traceability review is being performed. | PLACE_DETAILS_USER_STORIES.md and LIST-002. | 1. Review Place Detail list context requirements. 2. Confirm containing-list display is covered in PLACE-* packages. 3. Confirm LIST-002 only verifies list summary counts on `/lists`. | LIST-002 does not duplicate Place Detail containing-list rendering; consistency with place detail remains traceable to PLACE-* features. | LIST-002-US-002 | No | Manual | Manual Review cadence. |

## Final Summary

1. User stories processed: 9
2. Total executable test cases: 42
3. Clarification / Manual / Traceability cases: 8
4. Test count per user story:
   - LIST-002-US-001: 13
   - LIST-002-US-002: 7
   - LIST-002-US-003: 4
   - LIST-002-US-004: 3
   - LIST-002-US-005: 4
   - LIST-002-US-006: 3
   - LIST-002-US-007: 3
   - LIST-002-US-008: 3
   - LIST-002-US-009: 10
5. Count by test type:
   - API: 17
   - Accessibility: 7
   - Arabic: 1
   - Authentication: 3
   - Boundary: 4
   - Contract: 3
   - Data Integrity: 15
   - Edge Case: 4
   - Empty State: 3
   - Integration: 11
   - Keyboard: 1
   - Landscape: 1
   - Loading: 1
   - Localization: 1
   - Low Vision: 1
   - Manual: 8
   - Mobile: 3
   - Negative: 1
   - Positive: 3
   - Privacy: 5
   - Regression: 2
   - Requirement Clarification: 2
   - Responsive: 6
   - RTL: 2
   - Screen Reader: 1
   - Security: 4
   - Traceability Verification: 6
   - UI: 24
6. Count by priority:
   - Critical: 11
   - High: 27
   - Medium: 12
7. Count by automation layer:
   - API: 12
   - Accessibility: 7
   - Security: 4
   - UI E2E: 19
   - Manual: 8
8. Top automation candidates:
   - `GET /api/v1/lists` success, envelope, `meta.total`, `placeCount`, owner isolation, and `401 Unauthorized` privacy-safe error assertions.
   - UI E2E for owned-list count, total membership count, zero state, duplicate names, duplicate place membership, and refreshed counts after documented mutation success.
   - Security automation for guest/expired-session denial, no private-data flash, forbidden-field absence, and other-user list exclusion.
   - Accessibility automation for semantic summary grouping, count accessible names, live announcements after count changes, keyboard/focus-visible behavior, forced-colors, and reduced-motion.
   - Responsive automation for count labels and values at `320x568`, `390x844`, `430x932`, phone landscape, `200%` zoom, safe areas, and no horizontal overflow.

## Validation

- Duplicate Test IDs = 0
- Invalid Story References = 0
- Missing User Stories = 0
- Encoding/Mojibake = 0
- API Tests Missing Status Codes = 0
- Requirement Fidelity Violations = 0
- Feature Ownership Violations = 0
