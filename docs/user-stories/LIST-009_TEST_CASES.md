# LIST-009 Test Cases

Feature: `LIST-009 - Duplicate add returns idempotent success`

Primary Source: `docs/user-stories/LISTS_USER_STORIES.md`

Supporting Sources:

- `docs/feature-map/FEATURE_TRACEABILITY.md`
- `docs/user-stories/LIST-008_TEST_CASES.md`
- `docs/user-stories/RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`

Endpoint Under Test: `POST /api/v1/lists/{id}/items`

Traceability:

- `FEATURE_TRACEABILITY.md` maps `POST /api/v1/lists/{id}/items` to add place to list, bearer authentication, frontend surfaces `AddPlaceDialog.tsx` and `PlaceDetailPage.tsx`, backend operation `add_place_to_list`, model `ListItem`, and existing backend coverage `backend/tests/api/test_places_and_lists.py`.
- `FEATURE_TRACEABILITY.md` maps `list_items` / `ListItem` to list membership with unique `(list_id, place_id)` and idempotent add semantics.

## QA Execution Standards

- Executable tests validate documented `LIST-009` requirements, explicitly linked `LIST-008` add-flow integration, `LIST-002`/`LIST-007` count/detail integration, `FEATURE_TRACEABILITY.md` endpoint ownership, or approved global responsive/accessibility requirements.
- Undefined behavior is captured as Requirement Clarification, Manual Verification, or Traceability Verification.
- `LIST-009` owns duplicate add behavior, idempotent success, duplicate membership prevention, `201`/`200` add status semantics, duplicate race recovery, count stability, rating-state safety, and authorization precedence before idempotency.
- `LIST-009` does not own server-side search, place creation, list creation, list deletion, place detail rendering, rating creation/editing/deletion, transaction isolation strategy, locking strategy, cache behavior, or retry policy outside the documented duplicate-add outcome.
- API executable tests assert exact status codes only where documented by provided sources or by endpoint authentication contract.
- Automation cadence values used in Notes: Smoke, Regression, Nightly, Manual Review.

## Deterministic Fixtures

| Fixture ID | User State | List State | Places / Rating State | Expected Baseline |
|---|---|---|---|---|
| FX-LIST-009-A | Authenticated owner `user-001` | `list-001`, name `Weekend Food`, owner `user-001`, visibility `private`, existing placeIds [`place-001`], `placeCount=1`, membership rows [`list-001:place-001`] | `place-001` name `مطعم الرياض`, type `restaurant`; `place-002` name `قهوة المساء`, type `cafe` | Duplicate add of `place-001` returns idempotent success and keeps one membership row. |
| FX-LIST-009-B | Authenticated owner `user-001` | `list-002`, name `Empty Saves`, owner `user-001`, visibility `private`, existing placeIds [], `placeCount=0` | `place-002` exists and is not in `list-002` | First add of `place-002` returns `201 Created` and creates one membership. |
| FX-LIST-009-C | Authenticated owner `user-001` | `list-003`, name `Rapid Tap`, owner `user-001`, visibility `private`, existing placeIds [`place-001`], `placeCount=1` | `place-001` exists | Repeated UI activation for already-added `place-001` remains harmless. |
| FX-LIST-009-D | Authenticated owner `user-001` | `list-004`, name `Race Case`, owner `user-001`, visibility `private`, existing placeIds [], `placeCount=0` | `place-002` exists and is not in `list-004` | Two concurrent add requests for `(list-004, place-002)` leave exactly one membership. |
| FX-LIST-009-E | Authenticated owner `user-001` | `list-005`, name `Rated Picks`, owner `user-001`, visibility `private`, existing placeIds [`place-010`], `placeCount=1` | `place-010` has current-user rating `8.5`, rating state `true`, note `Private rating note` | Duplicate add must not create, edit, delete, or duplicate rating data. |
| FX-LIST-009-F | Authenticated non-owner `user-002` | Target `list-001` belongs to `user-001` and already contains `place-001` | `place-001` exists | Non-owner duplicate or non-duplicate add is denied before membership data is returned. |
| FX-LIST-009-G | Guest session | Target `list-001` exists for `user-001` | `place-001` exists | No bearer token is supplied; protected mutation must not return list or membership data. |
| FX-LIST-009-H | Expired session for `user-001` | Browser may contain cached add-flow state for `list-001` | `place-001` already-added state may be cached | Expired auth is denied and protected duplicate-add context is not rendered before auth resolution. |
| FX-LIST-009-I | Authenticated owner `user-001` | `list-006`, name `Retry Case`, owner `user-001`, visibility `private`, existing placeIds [`place-001`], `placeCount=1` | First network attempt fails before response; retry submits same duplicate add | Duplicate retry returns idempotent success and keeps one membership. |
| FX-LIST-009-J | Authenticated owner `user-001` | `list-007`, name `Mobile Duplicate`, owner `user-001`, visibility `private`, existing placeIds [`place-001`], `placeCount=1` | `place-001` result appears in add-place dialog | Used for mobile, accessibility, and responsive duplicate feedback. |

## LIST-009-US-001 - Prevent duplicate membership row

User Story Summary: As the system, I want duplicate list items prevented so that list data remains clean.

Related Feature ID: `LIST-009`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-009-US-001-TC-001 | Duplicate add keeps one membership row | API, Data Integrity, Idempotency | Critical | FX-LIST-009-A is loaded; `user-001` is authenticated. | `POST /api/v1/lists/list-001/items`; payload `{ "placeId": "place-001" }`. | 1. Query baseline membership count for `(list-001, place-001)`. 2. Send duplicate add request. 3. Query membership count again. | Baseline membership count is `1`; response status is `200 OK`; final membership count for `(list-001, place-001)` remains `1`; `placeCount` remains `1`. | LIST-009-US-001 | Yes | API | Smoke cadence. Source: LIST-009-US-001 and LIST-009-US-003. |
| LIST-009-US-001-TC-002 | Duplicate add response returns existing membership identity | API, Contract, Idempotency | Critical | FX-LIST-009-A is loaded. | Duplicate add for `place-001`. | 1. Send duplicate add request. 2. Inspect response body. | Response status is `200 OK`; response body identifies existing membership for `listId=list-001` and `placeId=place-001`; it does not create or return a second membership identity for the same pair. | LIST-009-US-001 | Yes | API | Smoke cadence. |
| LIST-009-US-001-TC-003 | Repeated duplicate add remains stable | API, Boundary, Idempotency | High | FX-LIST-009-A is loaded. | Five sequential duplicate `POST /api/v1/lists/list-001/items` requests with payload `{ "placeId": "place-001" }`. | 1. Send duplicate add request five times in sequence. 2. Record statuses. 3. Query list detail. | Each duplicate response status is `200 OK`; final membership count for `(list-001, place-001)` is `1`; list detail has `placeCount=1` and one row for `place-001`. | LIST-009-US-001 | Yes | API | Regression cadence. |
| LIST-009-US-001-TC-004 | Duplicate add success payload excludes forbidden fields | API, Security, Privacy | Critical | FX-LIST-009-A is loaded. | Duplicate add response for `place-001`. | 1. Send duplicate add request. 2. Recursively inspect response JSON. | Response status is `200 OK`; payload contains no private notes, current-user rating note, other users' memberships, creator identity, owner email, internal auth IDs, session tokens, audit/debug fields, stack traces, SQL details, or transaction diagnostics. | LIST-009-US-001 | Yes | Security | Smoke cadence. |
| LIST-009-US-001-TC-005 | Feature ownership boundary is traceable | Traceability Verification | Medium | QA traceability review is being performed. | LIST-008, LIST-009, Rating, Place creation, List creation/deletion requirements. | 1. Review LIST-009 executable cases. 2. Confirm out-of-scope behaviors are classified outside executable LIST-009 coverage. | LIST-009 executable tests cover duplicate add behavior, idempotent success, and duplicate membership prevention only; search, place creation, list creation/deletion, rating persistence, and transaction implementation strategy are not asserted here. | LIST-009-US-001 | No | Traceability Verification | Manual Review cadence. |

## LIST-009-US-002 - Return 201 for new add

User Story Summary: As an API consumer, I want creation status accurate so that clients can react correctly.

Related Feature ID: `LIST-009`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-009-US-002-TC-001 | New add returns 201 and creates membership | API, Positive, Contract | Critical | FX-LIST-009-B is loaded; `place-002` is not in `list-002`. | `POST /api/v1/lists/list-002/items`; payload `{ "placeId": "place-002" }`. | 1. Send add request as `user-001`. 2. Inspect status and response body. 3. Query list detail. | Response status is `201 Created`; response body identifies membership for `listId=list-002` and `placeId=place-002`; final membership count for `(list-002, place-002)` is `1`; `placeCount` changes from `0` to `1`. | LIST-009-US-002 | Yes | API | Smoke cadence. |
| LIST-009-US-002-TC-002 | New add response has deterministic safe schema | API, Contract, Privacy | Critical | FX-LIST-009-B is loaded. | Successful new add response. | 1. Send add request. 2. Validate response JSON keys. | Response status is `201 Created`; membership response contains documented `ListItem` identity fields for the list/place pair and no private notes, rating notes, owner email, internal auth IDs, session tokens, audit/debug fields, stack traces, SQL details, or lock/transaction metadata. | LIST-009-US-002 | Yes | API | Smoke cadence. |
| LIST-009-US-002-TC-003 | New add updates LIST-007 detail once | API, UI, Integration | High | FX-LIST-009-B is loaded; LIST-007 detail for `list-002` initially has `placeCount=0` and `items=[]`. | Add `place-002` to `list-002`. | 1. Send new add request. 2. Refresh or request `GET /api/v1/lists/list-002`. 3. Inspect detail. | Add response status is `201 Created`; refreshed detail has `placeCount=1`, `items.length=1`, and exactly one item for `place-002`. | LIST-009-US-002 | Yes | UI E2E | Regression cadence. Integration with LIST-007 detail state. |
| LIST-009-US-002-TC-004 | New add increments LIST-002 place membership count once | Integration, Data Integrity | High | FX-LIST-009-B is loaded; owned-list summary total membership count is `0`. | Add `place-002` to `list-002`. | 1. Capture baseline LIST-002 total place membership count. 2. Send new add request. 3. Refresh owned-list summary. | Add response status is `201 Created`; total place membership count increases from `0` to `1`; the increment occurs exactly once. | LIST-009-US-002 | Yes | UI E2E | Regression cadence. Source: LIST-002-US-006. |

## LIST-009-US-003 - Return 200 for idempotent existing add

User Story Summary: As an API consumer, I want repeat add status accurate so that duplicate taps are harmless.

Related Feature ID: `LIST-009`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-009-US-003-TC-001 | Existing membership add returns 200 OK | API, Idempotency, Positive | Critical | FX-LIST-009-A is loaded; membership `(list-001, place-001)` exists. | `POST /api/v1/lists/list-001/items`; payload `{ "placeId": "place-001" }`. | 1. Send duplicate add request. 2. Inspect response. | Response status is `200 OK`; response identifies existing `listId=list-001` and `placeId=place-001`; no duplicate row is created. | LIST-009-US-003 | Yes | API | Smoke cadence. |
| LIST-009-US-003-TC-002 | Existing membership add keeps count unchanged | API, Data Integrity, Idempotency | Critical | FX-LIST-009-A is loaded; `placeCount=1`. | Duplicate add for `place-001`. | 1. Capture baseline `placeCount`. 2. Send duplicate request. 3. Query list detail. | Response status is `200 OK`; `placeCount` remains `1`; `items.length` remains `1`; row for `place-001` appears once. | LIST-009-US-003 | Yes | API | Smoke cadence. |
| LIST-009-US-003-TC-003 | Duplicate after page refresh remains idempotent | UI, Regression, Idempotency | High | FX-LIST-009-A is loaded; browser is refreshed after rendering already-added state. | Add flow for `list-001`, `place-001`. | 1. Open add-place flow. 2. Confirm `place-001` is already in the list. 3. Refresh page. 4. Submit duplicate add through UI/API hook. | Duplicate request returns `200 OK`; refreshed list detail still has one row for `place-001` and `placeCount=1`. | LIST-009-US-003 | Yes | UI E2E | Regression cadence. |
| LIST-009-US-003-TC-004 | Duplicate after retry remains idempotent | UI, Error Handling, Idempotency | High | FX-LIST-009-I is loaded; first network attempt fails before response. | Retry duplicate add for `place-001`. | 1. Trigger duplicate add. 2. Simulate network failure before response. 3. Retry the same duplicate add. 4. Inspect final state. | Retry response status is `200 OK`; list detail has exactly one `place-001` row and `placeCount=1`; no blocking duplicate error is shown. | LIST-009-US-003 | Yes | UI E2E | Regression cadence. |

## LIST-009-US-004 - Enforce database uniqueness

User Story Summary: As the system, I want database protection so that concurrent requests cannot create duplicates.

Related Feature ID: `LIST-009`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-009-US-004-TC-001 | Two concurrent first-add requests leave exactly one membership | API, Concurrency, Data Integrity | Critical | FX-LIST-009-D is loaded; `(list-004, place-002)` does not exist. | Two simultaneous `POST /api/v1/lists/list-004/items` requests; both payloads `{ "placeId": "place-002" }`. | 1. Start both requests at the same time. 2. Wait for both responses. 3. Query list detail and membership count. | Exactly one response is `201 Created` and the other is `200 OK`; final membership count for `(list-004, place-002)` is `1`; `placeCount=1`. | LIST-009-US-004 | Yes | API | Smoke cadence. |
| LIST-009-US-004-TC-002 | Ten concurrent duplicate requests keep one membership | API, Concurrency, Boundary | Critical | FX-LIST-009-A is loaded; `(list-001, place-001)` exists. | Ten simultaneous duplicate add requests with payload `{ "placeId": "place-001" }`. | 1. Start ten duplicate requests concurrently. 2. Wait for all responses. 3. Query membership count and list detail. | Each completed response status is `200 OK`; final membership count for `(list-001, place-001)` remains `1`; `placeCount=1`. | LIST-009-US-004 | Yes | API | Regression cadence. |
| LIST-009-US-004-TC-003 | Database uniqueness observable state is verified without asserting locking strategy | API, Data Integrity, Requirement Fidelity | High | FX-LIST-009-D is loaded. | Concurrent add pair for `list-004` and `place-002`. | 1. Run concurrent add pair. 2. Query observable membership state. 3. Avoid inspecting lock or transaction isolation internals. | Responses are one `201 Created` and one `200 OK`; observable final state has exactly one `(list-004, place-002)` membership and `placeCount=1`; test does not assert lock type, isolation level, retry count, or database implementation details. | LIST-009-US-004 | Yes | API | Regression cadence. |
| LIST-009-US-004-TC-004 | Transaction isolation strategy remains implementation-owned | Requirement Clarification | Medium | LIST-009 requires uniqueness outcome but not a specific locking or isolation strategy. | Database lock, isolation, retry implementation. | 1. Review backend design. 2. Confirm no QA executable asserts transaction internals. | Test package validates documented observable behavior only: one membership row and idempotent responses; lock strategy remains implementation detail. | LIST-009-US-004 | No | Requirement Clarification | Manual Review cadence. |

## LIST-009-US-005 - Recover from duplicate race

User Story Summary: As the system, I want duplicate races handled as idempotent success.

Related Feature ID: `LIST-009`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-009-US-005-TC-001 | IntegrityError race returns idempotent success | API, Concurrency, Error Handling | Critical | FX-LIST-009-D is loaded; test harness can force second request to hit unique constraint after first creates row. | Two add requests for `(list-004, place-002)`. | 1. Start request A and request B. 2. Let request A create the membership. 3. Force request B through duplicate-row recovery path. 4. Inspect response and final state. | Request A returns `201 Created`; request B returns `200 OK` with existing membership for `list-004` and `place-002`; final membership count is `1`; no server error reaches the client. | LIST-009-US-005 | Yes | API | Smoke cadence. |
| LIST-009-US-005-TC-002 | Duplicate race recovery payload excludes implementation internals | API, Security, Privacy | Critical | FX-LIST-009-D race recovery path is triggered. | Response from recovered duplicate race. | 1. Trigger duplicate race recovery. 2. Recursively inspect recovered response JSON. | Recovered response status is `200 OK`; payload contains no raw `IntegrityError`, SQL details, transaction ID, retry count, stack trace, debug field, private notes, rating notes, or owner email. | LIST-009-US-005 | Yes | Security | Smoke cadence. |
| LIST-009-US-005-TC-003 | Race recovery keeps add flow success state | UI, Error Handling, Data Integrity | High | FX-LIST-009-D is loaded; UI add action triggers race recovery response. | UI add for `place-002`; recovered response `200 OK`. | 1. Open add-place flow from LIST-008. 2. Trigger add while concurrent request creates same row. 3. Return recovered `200 OK`. 4. Inspect UI and detail refresh. | UI shows success/already-added state, not a blocking duplicate or server error; refreshed detail shows one row for `place-002` and `placeCount=1`. | LIST-009-US-005 | Yes | UI E2E | Regression cadence. |
| LIST-009-US-005-TC-004 | Retry policy details remain out of scope | Requirement Clarification | Medium | LIST-009 documents rollback/load-existing/idempotent success, not number of retries or retry delays. | Retry count, delay, backoff, lock wait. | 1. Review implementation and product contract. 2. Confirm executable tests avoid retry-policy assertions. | QA validates recovered client-visible success and final membership state; retry count/backoff/locking timing are not executable LIST-009 expectations unless documented. | LIST-009-US-005 | No | Requirement Clarification | Manual Review cadence. |

## LIST-009-US-006 - Keep UI item display unique

User Story Summary: As a user, I want the list detail to show one row per membership.

Related Feature ID: `LIST-009`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-009-US-006-TC-001 | Duplicate UI add refreshes detail with one row | UI, Data Integrity, Integration | High | FX-LIST-009-A is loaded; LIST-007 detail baseline has one row for `place-001`. | Duplicate add for `place-001`. | 1. Open list detail. 2. Trigger duplicate add through add-place UI. 3. Refresh/list detail after idempotent response. | Idempotent response status is `200 OK`; detail shows exactly one row for `مطعم الرياض`; there is no second row, duplicate card, or duplicate accessible row for `place-001`. | LIST-009-US-006 | Yes | UI E2E | Regression cadence. Integration with LIST-007. |
| LIST-009-US-006-TC-002 | Rapid repeated clicks do not duplicate displayed item | UI, Regression, Data Integrity | High | FX-LIST-009-C is loaded; already-added row is actionable or visible in add-place flow. | Five rapid clicks/activations on add control for `place-001`. | 1. Open add-place flow. 2. Rapidly activate duplicate add control five times. 3. Inspect refreshed list detail. | UI ends in success/already-added state; detail contains exactly one row for `place-001`; `placeCount=1`; no duplicate-error blocker is displayed. | LIST-009-US-006 | Yes | UI E2E | Regression cadence. |
| LIST-009-US-006-TC-003 | Duplicate displayed row has one accessible representation | Accessibility, Data Integrity | Medium | FX-LIST-009-C is loaded after rapid duplicate attempts. | Detail row for `مطعم الرياض`. | 1. Refresh detail. 2. Inspect accessibility tree for place rows. | Accessibility tree exposes exactly one row/link for `مطعم الرياض` / `place-001`; no hidden duplicate row remains accessible. | LIST-009-US-006 | Yes | Accessibility | Nightly cadence. |

## LIST-009-US-007 - Keep counts stable on duplicate add

User Story Summary: As a user, I want counts not inflated by duplicate taps.

Related Feature ID: `LIST-009`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-009-US-007-TC-001 | Duplicate add keeps list placeCount unchanged | API, Data Integrity, Idempotency | Critical | FX-LIST-009-A is loaded with `placeCount=1`. | Duplicate add for `place-001`. | 1. Capture baseline detail. 2. Send duplicate add. 3. Refresh detail. | Duplicate response status is `200 OK`; `placeCount` remains `1`; `items.length` remains `1`; membership count remains `1`. | LIST-009-US-007 | Yes | API | Smoke cadence. |
| LIST-009-US-007-TC-002 | Duplicate add keeps LIST-002 total membership count unchanged | Integration, Data Integrity | High | FX-LIST-009-A is loaded; total owned place membership count is `1`. | Duplicate add for `place-001`. | 1. Capture LIST-002 total place membership count. 2. Send duplicate add. 3. Refresh list count summary. | Duplicate response status is `200 OK`; total place membership count remains `1`; no increment occurs. | LIST-009-US-007 | Yes | UI E2E | Regression cadence. Source: LIST-002-US-007. |
| LIST-009-US-007-TC-003 | Duplicate count remains stable after browser refresh | UI, Regression, Data Integrity | Medium | FX-LIST-009-A is loaded; duplicate add already returned `200 OK`. | Refresh `/lists/list-001`. | 1. Perform duplicate add. 2. Refresh list detail. 3. Inspect count and rows. | After refresh, `placeCount=1`; exactly one row for `place-001` appears; no stale duplicate row is displayed. | LIST-009-US-007 | Yes | UI E2E | Regression cadence. |

## LIST-009-US-008 - Keep rating state unchanged

User Story Summary: As the system, I want duplicate add not to affect ratings.

Related Feature ID: `LIST-009`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-009-US-008-TC-001 | Duplicate add preserves current-user rating state | API, Data Integrity, Privacy | High | FX-LIST-009-E is loaded; `place-010` has rating `8.5`, rated, note `Private rating note`. | Duplicate add for `place-010`. | 1. Capture rating state. 2. Send duplicate add. 3. Query rating context using existing rating test helper/API. | Duplicate response status is `200 OK`; rating remains `8.5`; rating remains unchanged; no new rating row is created; private note value is unchanged and is not returned in add response. | LIST-009-US-008 | Yes | API | Regression cadence. |
| LIST-009-US-008-TC-002 | Duplicate add does not create rating side effects | API, Data Integrity | High | FX-LIST-009-E is loaded. | Duplicate add for rated place `place-010`. | 1. Count rating rows for `user-001` and `place-010`. 2. Send duplicate add. 3. Count rating rows again. | Duplicate response status is `200 OK`; rating row count remains `1`; no rating create/edit/delete API is called by duplicate add. | LIST-009-US-008 | Yes | API | Regression cadence. |
| LIST-009-US-008-TC-003 | Full rating behavior remains RATING-owned | Traceability Verification | Medium | LIST-009 requires no side effects on rating state but does not own rating creation/edit/delete behavior. | Rating feature requirements. | 1. Review duplicate-add tests. 2. Confirm rating lifecycle tests live in rating package. | LIST-009 verifies duplicate add does not mutate rating state; rating validation, persistence, and editing behavior remain rating-feature owned. | LIST-009-US-008 | No | Traceability Verification | Manual Review cadence. |

## LIST-009-US-009 - Avoid duplicate error for normal users

User Story Summary: As a user, I want accidental duplicate taps to feel harmless.

Related Feature ID: `LIST-009`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-009-US-009-TC-001 | Duplicate UI add shows success or already-added state | UI, UX, Idempotency | High | FX-LIST-009-J is loaded; `place-001` already in `list-007`. | Add-place dialog result for `place-001`. | 1. Open add-place flow from LIST-008. 2. Activate add for already-added `place-001`. 3. Inspect visible UI state. | UI shows success or already-added state; no blocking duplicate-error message appears; list detail remains at `placeCount=1`. | LIST-009-US-009 | Yes | UI E2E | Smoke cadence. |
| LIST-009-US-009-TC-002 | Duplicate success is announced to screen readers | Accessibility, UI | High | FX-LIST-009-J is loaded; duplicate add returns `200 OK`. | `A11Y-001-US-016`; live status region. | 1. Trigger duplicate add via UI. 2. Inspect accessibility tree and live-region announcement. | Success/already-added state is announced through visible status text in a status container with `role=status` and `aria-live=polite`; no alert-style duplicate error is announced. | LIST-009-US-009 | Yes | Accessibility | Regression cadence. |
| LIST-009-US-009-TC-003 | Keyboard repeated add remains harmless | Accessibility, UI, Regression | High | FX-LIST-009-J is loaded. | Keyboard activation of add control for already-added `place-001`. | 1. Tab to add control. 2. Activate with Enter or Space three times. 3. Inspect final UI and detail. | Focus-visible appears on the control; final UI shows success/already-added state; detail has one `place-001` row and `placeCount=1`. | LIST-009-US-009 | Yes | Accessibility | Regression cadence. Source: RESP-003-US-003. |
| LIST-009-US-009-TC-004 | Touch targets remain usable for duplicate feedback | Accessibility, Mobile | Medium | FX-LIST-009-J is loaded at `390x844`. | Already-added/add controls and status region. | 1. Open add-place dialog. 2. Measure add/close controls. 3. Trigger duplicate add. | Interactive duplicate-add controls and close controls have at least `44x44` CSS pixel hit targets; duplicate feedback remains visible without covering the control. | LIST-009-US-009 | Yes | Accessibility | Nightly cadence. Source: RESP-003-US-008. |

## LIST-009-US-010 - Preserve owner authorization before idempotency

User Story Summary: As the system, I want idempotency not to bypass ownership.

Related Feature ID: `LIST-009`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-009-US-010-TC-001 | Non-owner duplicate add is denied before existing membership is returned | API, Security, Privacy | Critical | FX-LIST-009-F is loaded; `user-002` is authenticated. | `POST /api/v1/lists/list-001/items`; payload `{ "placeId": "place-001" }`. | 1. Send duplicate add request as non-owner. 2. Inspect response recursively. 3. Query owner list as `user-001`. | Request is denied before idempotency lookup is exposed; response does not return existing membership, list name, `placeCount`, private membership data, owner identity, private notes, stack trace, SQL, or debug fields; owner list remains unchanged. | LIST-009-US-010 | Yes | Security | Smoke cadence. Exact non-owner status is clarified in LIST-009-XC-001. |
| LIST-009-US-010-TC-002 | Non-owner non-duplicate add is denied before membership creation | API, Security, Privacy | Critical | FX-LIST-009-F is loaded; `place-002` is not in `list-001`. | `POST /api/v1/lists/list-001/items`; payload `{ "placeId": "place-002" }`. | 1. Send add request as `user-002`. 2. Inspect response. 3. Query owner list. | Request is denied; no `(list-001, place-002)` membership is created; response contains no private list data, owner identity, stack trace, SQL, or debug fields. | LIST-009-US-010 | Yes | Security | Smoke cadence. |
| LIST-009-US-010-TC-003 | Guest duplicate add returns authentication denial with no protected payload | API, Security, Privacy | Critical | FX-LIST-009-G is loaded; no bearer token is supplied. | `POST /api/v1/lists/list-001/items`; payload `{ "placeId": "place-001" }`. | 1. Send request without bearer token. 2. Inspect status/body. | Response status is `401 Unauthorized`; response contains no list name, no existing membership, no `placeCount`, no private notes, no owner identity, no token, no stack trace, and no debug field. | LIST-009-US-010 | Yes | API | Smoke cadence. |
| LIST-009-US-010-TC-004 | Expired session does not flash protected duplicate-add context | UI, Security, Privacy | Critical | FX-LIST-009-H is loaded; cached already-added state exists locally. | Expired token; cached row `مطعم الرياض`. | 1. Open add-place flow with expired session. 2. Capture first paint, DOM, and accessibility tree. 3. Resolve auth as denied. | Protected list name, item names, already-added status, membership data, private notes, and mutation controls are not rendered before valid authorization is confirmed. | LIST-009-US-010 | Yes | Security | Smoke cadence. |
| LIST-009-US-010-TC-005 | Exact non-owner denial status requires contract confirmation | Requirement Clarification | High | Source requires denial before returning membership data but does not define exact numeric status for authenticated non-owner add. | Candidate privacy-preserving denial status. | 1. Review API contract. 2. Confirm exact status for non-owner duplicate and non-duplicate add attempts. | Executable LIST-009 security tests assert denial, no mutation, and no data leakage; exact numeric status is not asserted until documented. | LIST-009-US-010 | No | Requirement Clarification | Manual Review cadence. |

## Responsive and Accessibility Certification

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-009-US-009-TC-005 | Duplicate feedback fits required mobile viewports | Responsive, Mobile, UI | High | FX-LIST-009-J is loaded; add-place dialog can render already-added state. | Viewports `320x568`, `390x844`, `430x932`; duplicate add result. | 1. Set each viewport. 2. Open add-place dialog. 3. Trigger duplicate add. 4. Inspect scroll width and visible controls. | At each viewport, `document.documentElement.scrollWidth <= window.innerWidth`; already-added/success state, add/close controls, and final action remain visible or reachable without horizontal scrolling. | LIST-009-US-009 | Yes | UI E2E | Regression cadence. Source: RESP-002-US-001, RESP-002-US-002, RESP-002-US-010, RESP-002-US-011. |
| LIST-009-US-009-TC-006 | Duplicate feedback works at 200% zoom | Responsive, Accessibility | High | FX-LIST-009-J is loaded; 200% browser zoom active. | Duplicate add result in dialog/sheet. | 1. Enable 200% zoom. 2. Open add-place dialog. 3. Trigger duplicate add. 4. Inspect layout and controls. | `document.documentElement.scrollWidth <= window.innerWidth`; duplicate feedback text, controls, and focus indicator remain visible and operable. | LIST-009-US-009 | Yes | Accessibility | Regression cadence. Source: RESP-003-US-001, RESP-003-US-002, RESP-003-US-009. |
| LIST-009-US-009-TC-007 | Focus returns after duplicate add dialog closes | Accessibility | Medium | FX-LIST-009-J is loaded; dialog opened from add-place trigger. | `A11Y-001-US-006`. | 1. Trigger duplicate add. 2. Close the dialog. 3. Inspect active element. | Focus returns to the add-place trigger or documented safe fallback; focus is not lost to the page body. | LIST-009-US-009 | Yes | Accessibility | Nightly cadence. |

## Cross-Feature Clarification and Traceability Cases

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LIST-009-XC-001 | Add-place search remains LIST-008-owned | Traceability Verification | High | Duplicate add can be initiated from LIST-008 add-place dialog. | LIST-008 search tests. | 1. Review LIST-009 cases. 2. Review LIST-008 search package. | LIST-009 validates duplicate/idempotent add outcomes only; server-side search, no-results fallback, and result pagination remain LIST-008-owned. | LIST-009-US-009 | No | Traceability Verification | Manual Review cadence. |
| LIST-009-XC-002 | Rating lifecycle remains rating-feature-owned | Traceability Verification | Medium | LIST-009 checks duplicate add has no rating side effects. | Rating creation/edit/delete behavior. | 1. Review LIST-009 rating-safety cases. 2. Confirm rating lifecycle cases exist in rating package. | LIST-009 does not test rating validation, calculation, save, edit, or delete behavior; it only verifies duplicate add leaves rating state unchanged. | LIST-009-US-008 | No | Traceability Verification | Manual Review cadence. |
| LIST-009-XC-003 | Cache and browser-history behavior remain undefined | Requirement Clarification | Low | LIST-009 does not define cache invalidation, browser back/forward, or history restoration behavior. | Browser history and cache behavior. | 1. Review source requirements. 2. Confirm no executable cache/history assertions are present. | No executable LIST-009 test asserts cache invalidation timing, browser history behavior, or restored scroll state until documented. | LIST-009-US-003 | No | Requirement Clarification | Manual Review cadence. |

## Final Summary

1. User stories processed: 10
2. Total executable test cases: 37
3. Clarification / Manual / Traceability cases: 8
4. Total test cases: 45
5. Test count per user story:
   - LIST-009-US-001: 5
   - LIST-009-US-002: 4
   - LIST-009-US-003: 5
   - LIST-009-US-004: 4
   - LIST-009-US-005: 4
   - LIST-009-US-006: 3
   - LIST-009-US-007: 3
   - LIST-009-US-008: 4
   - LIST-009-US-009: 8
   - LIST-009-US-010: 5
6. Count by test type:
   - Accessibility: 7
   - API: 20
   - Boundary: 2
   - Concurrency: 3
   - Contract: 3
   - Data Integrity: 14
   - Error Handling: 3
   - Idempotency: 9
   - Integration: 4
   - Mobile: 2
   - Positive: 2
   - Privacy: 8
   - Regression: 4
   - Requirement Clarification: 4
   - Requirement Fidelity: 1
   - Responsive: 2
   - Security: 6
   - Traceability Verification: 4
   - UI: 12
   - UX: 1
7. Count by priority:
   - Critical: 16
   - High: 19
   - Medium: 9
   - Low: 1
8. Count by automation layer:
   - Accessibility: 6
   - API: 15
   - Requirement Clarification: 4
   - Security: 5
   - Traceability Verification: 4
   - UI E2E: 11
9. Top automation candidates:
   - API contract tests for new add `201 Created`, duplicate add `200 OK`, required membership fields, forbidden fields, and stable counts.
   - Concurrency tests for simultaneous duplicate and first-add race cases.
   - UI E2E tests for rapid repeated activation, already-added/success feedback, row uniqueness, and count stability after refresh.
   - Accessibility tests for keyboard duplicate add, live-region status, focus restoration, 200% zoom, and touch targets.

## Validation

- Duplicate Test IDs = 0
- Invalid Story References = 0
- Missing User Stories = 0
- Encoding/Mojibake = 0
- API Tests Missing Status Codes = 0
- Requirement Fidelity Violations = 0
- Feature Ownership Violations = 0
