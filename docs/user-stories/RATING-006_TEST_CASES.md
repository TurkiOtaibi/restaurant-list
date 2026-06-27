# RATING-006 Test Cases

Feature: `RATING-006 - First rating removes place from all user lists`

Feature Description: Creating the first rating removes the place from all lists owned by that user.

Primary Source: `docs/user-stories/RATINGS_USER_STORIES.md`

Supporting Sources:

- `docs/feature-map/FEATURE_TRACEABILITY.md`
- `docs/user-stories/RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`

Allowed Requirement Sources:

- `RATING-006-US-001` through `RATING-006-US-013`
- Shared Ratings Business Rules in `RATINGS_USER_STORIES.md`
- Rating endpoint, database, and module traceability in `FEATURE_TRACEABILITY.md`
- Approved global responsive/accessibility requirements explicitly cited as `RESP-*` or `A11Y-*`

Out of Scope:

- Rating scale validation except where a valid rating value is needed to trigger cleanup.
- Notes validation except where a valid optional note is part of the request fixture.
- General list management, list creation, list deletion, or list visibility behavior.
- Rating deletion, public notes, recommendations, moderation, retry policy, cache behavior, browser history, and undocumented synchronization timing.

## Documented API Contract Used By These Tests

- Create flow endpoint: `POST /api/v1/ratings`.
- Known edit endpoint: `PATCH /api/v1/ratings/{place_id}`.
- `POST /api/v1/ratings` returns `201 Created` when a new rating is created.
- `POST /api/v1/ratings` returns `200 OK` when it updates an existing rating through upsert.
- `PATCH /api/v1/ratings/{place_id}` returns `200 OK` when it updates an existing rating.
- `RatingResponse` fields are exactly `id`, `userId`, `placeId`, `rating`, `notes`, `createdAt`, and `updatedAt`.
- Error payloads and logs must not expose private list names, user IDs, notes, SQL, stack traces, hidden metadata, audit/debug fields, tokens, or other users' data.
- Exact HTTP status codes for injected cleanup failure, rating-insert failure, and commit failure are not specified by `RATING-006`; those status-code decisions are tracked as Requirement Clarification cases.

## Deterministic Fixture Matrix

| Fixture ID | Purpose | Authenticated User | Initial Ratings | Initial Lists And Memberships | Places | Expected Baseline |
|---|---|---|---|---|---|---|
| `FX-R006-ONE-LIST` | One owned-list cleanup | `user-001` | No rating for `(user-001, place-001)` | `list-101` owner `user-001`, name `قائمة العائلة`, members `[place-001, place-002]`; `list-201` owner `user-002`, name `قهوة`, members `[place-001]` | `place-001` name `مطعم الرياض`, type `restaurant`; `place-002` name `برجر`, type `restaurant` | Before action: user-001 owned membership count for `place-001` is `1`; user-002 membership count for `place-001` is `1`; rating count for `(user-001, place-001)` is `0`. |
| `FX-R006-MULTI-LIST` | All owned-list cleanup | `user-001` | No rating for `(user-001, place-001)` | `list-101` owner `user-001`, members `[place-001, place-002]`; `list-102` owner `user-001`, members `[place-001, place-003]`; `list-103` owner `user-001`, members `[place-004]`; `list-201` owner `user-002`, members `[place-001]` | `place-001` `مطعم الرياض`; `place-002` `برجر`; `place-003` `آيس كريم`; `place-004` `قهوة` | Before action: user-001 owned membership count for `place-001` is `2`; unrelated user-001 memberships are `3`; user-002 membership count for `place-001` is `1`; rating count is `0`. |
| `FX-R006-UPDATE-NO-CLEANUP` | Existing rating update must not repeat cleanup | `user-001` | `rating-301`: `userId=user-001`, `placeId=place-001`, `rating=7.5`, `notes=null`, `createdAt=2026-06-01T10:00:00Z`, `updatedAt=2026-06-01T10:00:00Z` | `list-104` owner `user-001`, name `مطاعم الرياض`, members `[place-001, place-003]`; this membership was added after the original first rating | `place-001` `مطعم الرياض`; `place-003` `آيس كريم` | Before action: one rating exists; user-001 owned membership count for `place-001` is `1`; no first-rating cleanup is pending. |
| `FX-R006-ROLLBACK-CLEANUP-FAIL` | Cleanup failure before commit | `user-001` | No rating for `(user-001, place-005)` | `list-105` owner `user-001`, name `عطلة نهاية الأسبوع`, members `[place-005, place-006]`; cleanup fault injection causes removal of `place-005` memberships to fail before commit | `place-005` `قهوة المساء`; `place-006` `برجر` | Before action: rating count is `0`; user-001 owned membership count for `place-005` is `1`. |
| `FX-R006-ROLLBACK-INSERT-FAIL` | Rating insert failure | `user-001` | No rating for `(user-001, place-007)`; insert fault injection rejects the new rating row before commit | `list-106` owner `user-001`, name `قائمة العائلة`, members `[place-007, place-006]` | `place-007` `آيس كريم الحي`; `place-006` `برجر` | Before action: rating count is `0`; user-001 owned membership count for `place-007` is `1`. |
| `FX-R006-COMMIT-FAIL` | Commit failure after prepared rating and cleanup | `user-001` | No rating for `(user-001, place-008)`; commit fault injection fails after rating insert and list cleanup are prepared | `list-107` owner `user-001`, name `مطاعم الرياض`, members `[place-008, place-006]` | `place-008` `قهوة`; `place-006` `برجر` | Before action: rating count is `0`; user-001 owned membership count for `place-008` is `1`. |
| `FX-R006-CONCURRENT-FIRST` | Concurrent first-rating safety | `user-001` | No rating for `(user-001, place-009)` | `list-108` owner `user-001`, members `[place-009]`; `list-109` owner `user-001`, members `[place-009, place-006]`; `list-202` owner `user-002`, members `[place-009]` | `place-009` `مطعم الرياض`; `place-006` `برجر` | Before action: user-001 owned membership count for `place-009` is `2`; user-002 membership count for `place-009` is `1`; rating count is `0`. |

## Common Assertions

Executable API assertions:

- Success `RatingResponse` contains exactly `id`, `userId`, `placeId`, `rating`, `notes`, `createdAt`, and `updatedAt`.
- Success response contains no `listId`, `listName`, `privateListName`, `debug`, `trace`, `sql`, `stack`, `token`, `password`, `audit`, `moderation`, or other users' data.
- Persisted-state checks use the test harness/database assertions listed in each case; they do not rely on cache behavior or browser history.

Executable UI assertions:

- Visible counts use Western digits and no Arabic-Indic digits, per `RESP-004-US-001` and `RESP-004-US-002`.
- Decimal rating values use a period and LTR-safe formatting when displayed, per `RESP-004-US-003` and `RESP-004-US-004`.
- Rating screens and dialogs must satisfy the cited `RESP-*` and `A11Y-*` requirements.

## RATING-006-US-001 - Remove from one list after first rating

User Story ID: `RATING-006-US-001`

User Story Title: Remove from one list after first rating

User Story Summary: As a user, I want a rated place removed from my list so that lists remain for untried places.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-006-US-001-TC-001 | First rating removes place from the user's one owned list | Positive, API, Data Integrity | Critical | Load `FX-R006-ONE-LIST`; authenticate as `user-001`; verify before-action counts: user-001 membership count for `place-001` is `1`, user-002 membership count for `place-001` is `1`, rating count is `0`. | Endpoint `POST /api/v1/ratings`; payload `{ "placeId": "place-001", "rating": 8.5, "notes": "قهوة ممتازة" }`. | 1. Send the POST request as `user-001`. 2. Assert HTTP status. 3. Assert response fields. 4. Query ratings for `(user-001, place-001)`. 5. Query `list_items` for `place-001` grouped by owner. | Status is `201 Created`; response has exactly `RatingResponse` fields with `userId=user-001`, `placeId=place-001`, `rating=8.5`, `notes="قهوة ممتازة"`; exactly `1` rating row exists for `(user-001, place-001)`; `list-101` no longer contains `place-001`; `list-101` still contains `place-002`; user-001 owned membership count for `place-001` is `0`; user-002 membership count for `place-001` remains `1`; forbidden fields are absent. | RATING-006-US-001 | Yes | API |

## RATING-006-US-002 - Remove from all owned lists

User Story ID: `RATING-006-US-002`

User Story Title: Remove from all owned lists

User Story Summary: As a user, I want first rating to remove the place from all my lists so that tried status is consistent.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-006-US-002-TC-001 | First rating removes the place from two owned lists and preserves unrelated memberships | Positive, API, Data Integrity | Critical | Load `FX-R006-MULTI-LIST`; authenticate as `user-001`; verify before-action counts: user-001 membership count for `place-001` is `2`, unrelated user-001 memberships are `3`, user-002 membership count for `place-001` is `1`, rating count is `0`. | Endpoint `POST /api/v1/ratings`; payload `{ "placeId": "place-001", "rating": 9, "notes": null }`. | 1. Send the POST request as `user-001`. 2. Assert HTTP status and `RatingResponse`. 3. Query memberships in `list-101`, `list-102`, `list-103`, and `list-201`. 4. Query rating rows. | Status is `201 Created`; exactly `1` rating row exists for `(user-001, place-001)`; `list-101` and `list-102` no longer contain `place-001`; `list-101` still contains `place-002`; `list-102` still contains `place-003`; `list-103` still contains `place-004`; user-001 owned membership count for `place-001` is `0`; user-002 membership count for `place-001` remains `1`; forbidden fields are absent. | RATING-006-US-002 | Yes | API |

## RATING-006-US-003 - Do not remove from other users' lists

User Story ID: `RATING-006-US-003`

User Story Title: Do not remove from other users' lists

User Story Summary: As the system, I want list cleanup scoped to the rating owner so that other users' lists are not changed.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-006-US-003-TC-001 | First rating by user-001 leaves user-002 list item unchanged | Privacy, Security, API, Data Integrity | Critical | Load `FX-R006-MULTI-LIST`; authenticate as `user-001`; verify `list-201` owner is `user-002` and contains `place-001`. | Endpoint `POST /api/v1/ratings`; payload `{ "placeId": "place-001", "rating": 8, "notes": "تمت التجربة" }`. | 1. Send the POST request as `user-001`. 2. Query `list-201` membership for `place-001`. 3. Query all memberships for owner `user-002`. 4. Inspect response JSON recursively. | Status is `201 Created`; exactly `1` rating row exists for `(user-001, place-001)`; `list-201` still contains `place-001`; total memberships for owner `user-002` are unchanged; response contains no `user-002`, `list-201`, other-user list names, private notes, debug, SQL, or stack fields. | RATING-006-US-003 | Yes | Security |

## RATING-006-US-004 - Commit rating and cleanup atomically

User Story ID: `RATING-006-US-004`

User Story Title: Commit rating and cleanup atomically

User Story Summary: As the system, I want rating and list cleanup consistent so that partial updates do not corrupt state.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-006-US-004-TC-001 | Successful transaction commits rating and all matching cleanup together | Positive, API, Data Integrity, Integration | Critical | Load `FX-R006-MULTI-LIST`; authenticate as `user-001`; capture before snapshot: rating count `0`, user-001 memberships for `place-001` `2`, user-002 memberships for `place-001` `1`. | Endpoint `POST /api/v1/ratings`; payload `{ "placeId": "place-001", "rating": 8.5, "notes": "ممتاز" }`. | 1. Send POST as `user-001`. 2. Read the committed state in one post-request transaction snapshot. 3. Assert rating and membership counts from the same snapshot. | Status is `201 Created`; the post-request snapshot contains rating count `1` for `(user-001, place-001)` and user-001 owned membership count `0` for `place-001`; no post-request snapshot may contain rating count `1` while any user-001 owned `place-001` membership remains; user-002 membership count remains `1`; forbidden fields are absent. | RATING-006-US-004 | Yes | API |

## RATING-006-US-005 - Roll back rating if cleanup fails

User Story ID: `RATING-006-US-005`

User Story Title: Roll back rating if cleanup fails

User Story Summary: As the system, I want failed cleanup to avoid inconsistent tried/list state.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-006-US-005-TC-001 | Cleanup failure rolls back rating creation and leaves memberships unchanged | Negative, API, Data Integrity, Error Handling | Critical | Load `FX-R006-ROLLBACK-CLEANUP-FAIL`; authenticate as `user-001`; enable cleanup fault injection for `place-005`; verify before counts: rating count `0`, user-001 membership count for `place-005` `1`. | Endpoint `POST /api/v1/ratings`; payload `{ "placeId": "place-005", "rating": 8.5, "notes": "اختبار فشل التنظيف" }`. | 1. Send POST as `user-001`. 2. Capture the failure response without asserting an undocumented exact status. 3. Query rating rows for `(user-001, place-005)`. 4. Query `list-105` memberships. 5. Inspect response JSON and captured server error text available to the client. | No `201 Created` success response is returned; no `RatingResponse` success body is returned; rating count remains `0`; `list-105` still contains `place-005` and `place-006`; user-001 membership count for `place-005` remains `1`; no partial cleanup is persisted; failure text contains none of `عطلة نهاية الأسبوع`, `user-001`, `notes`, `SQL`, `Traceback`, `stack`, or `list-105`. | RATING-006-US-005 | Yes | API |

## RATING-006-US-006 - Roll back cleanup if rating insert fails

User Story ID: `RATING-006-US-006`

User Story Title: Roll back cleanup if rating insert fails

User Story Summary: As the system, I want failed rating insert not to remove list items.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-006-US-006-TC-001 | Rating insert failure leaves owned list items unchanged | Negative, API, Data Integrity, Error Handling | Critical | Load `FX-R006-ROLLBACK-INSERT-FAIL`; authenticate as `user-001`; enable rating-insert fault injection for `(user-001, place-007)`; verify before counts: rating count `0`, user-001 membership count for `place-007` `1`. | Endpoint `POST /api/v1/ratings`; payload `{ "placeId": "place-007", "rating": 7.5, "notes": null }`. | 1. Send POST as `user-001`. 2. Capture the failure response without asserting an undocumented exact status. 3. Query rating rows and memberships. 4. Inspect response JSON and client-visible error text. | No `201 Created` success response is returned; no `RatingResponse` success body is returned; rating count remains `0`; `list-106` still contains `place-007` and `place-006`; user-001 membership count for `place-007` remains `1`; no cleanup is persisted; failure text contains no private list name, user ID, note, SQL, stack trace, debug field, or audit field. | RATING-006-US-006 | Yes | API |

## RATING-006-US-007 - Handle commit failure consistently

User Story ID: `RATING-006-US-007`

User Story Title: Handle commit failure consistently

User Story Summary: As the system, I want commit failure to leave no half-applied state.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-006-US-007-TC-001 | Commit failure restores previous rating and list membership state | Negative, API, Data Integrity, Error Handling | Critical | Load `FX-R006-COMMIT-FAIL`; authenticate as `user-001`; enable commit-failure fault injection after rating insert and cleanup are prepared; capture before snapshot: rating count `0`, user-001 membership count for `place-008` `1`. | Endpoint `POST /api/v1/ratings`; payload `{ "placeId": "place-008", "rating": 8, "notes": "فشل الالتزام" }`. | 1. Send POST as `user-001`. 2. Capture the failure response without asserting an undocumented exact status. 3. Query the post-failure transaction snapshot. 4. Inspect client-visible failure text. | No `201 Created` success response is returned; no `RatingResponse` success body is returned; post-failure rating count for `(user-001, place-008)` is `0`; `list-107` still contains `place-008` and `place-006`; user-001 membership count for `place-008` remains `1`; no half-applied state is visible; failure text contains no private list name, user ID, note, SQL, stack trace, debug field, or audit field. | RATING-006-US-007 | Yes | API |

## RATING-006-US-008 - Handle concurrent first ratings safely

User Story ID: `RATING-006-US-008`

User Story Title: Handle concurrent first ratings safely

User Story Summary: As the system, I want concurrent creates for same user/place safe.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-006-US-008-TC-001 | Two simultaneous first-rating POSTs persist one rating and clean owned lists once | Concurrency, API, Data Integrity | Critical | Load `FX-R006-CONCURRENT-FIRST`; authenticate both requests as `user-001`; verify before counts: rating count `0`, user-001 membership count for `place-009` `2`, user-002 membership count for `place-009` `1`. | Request A: `POST /api/v1/ratings` payload `{ "placeId": "place-009", "rating": 8.5, "notes": "طلب أ" }`; Request B: same endpoint payload `{ "placeId": "place-009", "rating": 8.5, "notes": "طلب ب" }`. | 1. Dispatch Request A and Request B simultaneously using a concurrency barrier. 2. Wait for both responses. 3. Query rating rows for `(user-001, place-009)`. 4. Query memberships for `place-009` by owner. 5. Inspect both responses for forbidden fields. | After both requests complete, exactly `1` rating row exists for `(user-001, place-009)`; user-001 owned membership count for `place-009` is `0`; user-002 membership count for `place-009` remains `1`; no duplicate rating row exists; no owned `place-009` membership is removed more than once because final user-001 count is `0` and unrelated `place-006` membership remains; each response uses a documented success or documented safe update outcome for `POST` (`201 Created` for new row or `200 OK` for upsert) and contains only `RatingResponse` fields when successful. | RATING-006-US-008 | Yes | API |

## RATING-006-US-009 - Rating update does not repeat cleanup

User Story ID: `RATING-006-US-009`

User Story Title: Rating update does not repeat cleanup

User Story Summary: As a user, I want later rating edits not to remove re-added list items.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-006-US-009-TC-001 | PATCH update preserves re-added list membership | Regression, API, Data Integrity | High | Load `FX-R006-UPDATE-NO-CLEANUP`; authenticate as `user-001`; verify existing rating `rating-301` and `list-104` contains `place-001`. | Endpoint `PATCH /api/v1/ratings/place-001`; payload `{ "rating": 9, "notes": "تحديث التقييم" }`. | 1. Send PATCH as `user-001`. 2. Assert HTTP status and response fields. 3. Query ratings for `(user-001, place-001)`. 4. Query `list-104` memberships. | Status is `200 OK`; response has exactly `RatingResponse` fields with `id=rating-301`, `userId=user-001`, `placeId=place-001`, `rating=9`, `notes="تحديث التقييم"`; exactly `1` rating row exists for `(user-001, place-001)`; `list-104` still contains `place-001` and `place-003`; user-001 membership count for `place-001` remains `1`; no cleanup side effect runs on update. | RATING-006-US-009 | Yes | API |

## RATING-006-US-010 - POST upsert update does not repeat cleanup

User Story ID: `RATING-006-US-010`

User Story Title: POST upsert update does not repeat cleanup

User Story Summary: As the system, I want POST update path to avoid first-rating side effects.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-006-US-010-TC-001 | POST upsert returns 200 and preserves re-added list membership | Regression, API, Data Integrity | High | Load `FX-R006-UPDATE-NO-CLEANUP`; authenticate as `user-001`; verify existing rating `rating-301` and `list-104` contains `place-001`. | Endpoint `POST /api/v1/ratings`; payload `{ "placeId": "place-001", "rating": 8, "notes": "تحديث عبر POST" }`. | 1. Send POST as `user-001`. 2. Assert HTTP status and response fields. 3. Query ratings for `(user-001, place-001)`. 4. Query `list-104` memberships. | Status is `200 OK`; response has exactly `RatingResponse` fields with `id=rating-301`, `userId=user-001`, `placeId=place-001`, `rating=8`, `notes="تحديث عبر POST"`; exactly `1` rating row exists for `(user-001, place-001)`; `list-104` still contains `place-001`; user-001 membership count for `place-001` remains `1`; no first-rating cleanup side effect runs on POST upsert. | RATING-006-US-010 | Yes | API |

## RATING-006-US-011 - Refresh UI after cleanup

User Story ID: `RATING-006-US-011`

User Story Title: Refresh UI after cleanup

User Story Summary: As a user, I want the UI to reflect list removal after rating.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-006-US-011-TC-001 | Place, list, and profile reloads show cleaned memberships after first rating | UI, Integration, Data Integrity | High | Load `FX-R006-MULTI-LIST`; sign in as `user-001`; Place Detail for `place-001` shows the rating entry action; List Detail `list-101` and `list-102` each show `place-001`; profile/list count baseline is captured as user-001 owned `place-001` memberships `2`. | UI rating value `8.5`; note `ممتاز`; network request `POST /api/v1/ratings` payload `{ "placeId": "place-001", "rating": 8.5, "notes": "ممتاز" }`. | 1. Open the rating flow from Place Detail. 2. Select `8.5`. 3. Save. 4. Wait for the documented return to Place Detail and data reload. 5. Reload Place Detail, List Detail for `list-101`, List Detail for `list-102`, and Profile/list summary data through documented app navigation or API-backed reload. | Save response is `201 Created`; Place Detail displays the current-user rating value `8.5/10` using Western digits and period decimal; `list-101` and `list-102` no longer render a row for `place-001`; each list still renders its unrelated place row; reloaded membership count for user-001 owned `place-001` entries is `0`; reloaded profile/list count that includes these memberships decreases by `2` where the count is displayed; no stale private list data for `place-001` remains in the DOM or accessibility tree. | RATING-006-US-011 | Yes | UI E2E |

## RATING-006-US-012 - Preserve places and ratings after cleanup

User Story ID: `RATING-006-US-012`

User Story Title: Preserve places and ratings after cleanup

User Story Summary: As the system, I want list cleanup to affect memberships only.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-006-US-012-TC-001 | Cleanup removes only list memberships and preserves place plus rating archive | Data Integrity, API, Integration | High | Load `FX-R006-MULTI-LIST`; authenticate as `user-001`; verify `place-001` exists in catalog and rating count for `(user-001, place-001)` is `0`. | Endpoint `POST /api/v1/ratings`; payload `{ "placeId": "place-001", "rating": 8.5, "notes": "تمت التجربة" }`. | 1. Send POST as `user-001`. 2. Query place catalog for `place-001`. 3. Query rating archive/profile rating data for `user-001`. 4. Query list memberships for `place-001`. | Status is `201 Created`; `place-001` remains present with name `مطعم الرياض` and type `restaurant`; rating archive/profile rating data contains exactly one rating for `user-001` and `place-001` with `rating=8.5`; user-001 owned list memberships for `place-001` are `0`; unrelated places, unrelated memberships, and user-002 memberships are unchanged; response contains no list names, hidden metadata, audit/debug fields, SQL, or stack traces. | RATING-006-US-012 | Yes | API |

## RATING-006-US-013 - Avoid cleanup data leaks

User Story ID: `RATING-006-US-013`

User Story Title: Avoid cleanup data leaks

User Story Summary: As the system, I want cleanup errors safe.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-006-US-013-TC-001 | Cleanup failure response hides private list and internal details | Security, Privacy, Negative, API | High | Load `FX-R006-ROLLBACK-CLEANUP-FAIL`; authenticate as `user-001`; cleanup fault injection is enabled for `place-005`; private list name is `عطلة نهاية الأسبوع`. | Endpoint `POST /api/v1/ratings`; payload `{ "placeId": "place-005", "rating": 8.5, "notes": "ملاحظة خاصة" }`. | 1. Send POST as `user-001`. 2. Capture response body, response headers visible to client, and client-visible error text. 3. Query persisted rating and membership state. 4. Search captured values for forbidden strings and fields. | No `201 Created` success response is returned; rating count remains `0`; `list-105` still contains `place-005`; response and client-visible error text do not contain `عطلة نهاية الأسبوع`, `user-001`, `ملاحظة خاصة`, `list-105`, `SQL`, `Traceback`, `stack`, `debug`, `audit`, `token`, or other users' data. | RATING-006-US-013 | Yes | Security |

## Supplemental Requirement-Supported Coverage

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-006-API-TC-001 | Successful first-rating cleanup response uses exact RatingResponse contract | API, Contract | Critical | Load `FX-R006-ONE-LIST`; authenticate as `user-001`. | Endpoint `POST /api/v1/ratings`; payload `{ "placeId": "place-001", "rating": 8.5, "notes": null }`. | 1. Send POST. 2. Assert status. 3. Recursively compare top-level response keys. 4. Assert absence of forbidden fields. | Status is `201 Created`; response top-level keys are exactly `id`, `userId`, `placeId`, `rating`, `notes`, `createdAt`, and `updatedAt`; `notes` is `null`; no list membership fields, private list names, hidden metadata, audit/debug fields, SQL, stack traces, tokens, or other users' data are present. | RATING-006-US-004 | Yes | API |
| RATING-006-RESP-TC-001 | Rating cleanup flow passes required viewport and overflow matrix | Responsive, UI | High | Load `FX-R006-ONE-LIST`; sign in as `user-001`; open Rating screen/dialog for `place-001`. | Viewports `320x568`, `390x844`, `430x932`, `768x1024`, `1024x768`, `1440x900`; rating value `8.5`. | 1. For each viewport, open the rating flow. 2. Select `8.5`. 3. Verify save/cancel actions before submit. 4. Measure `document.documentElement.scrollWidth` and `window.innerWidth`. | At every viewport, the rating control and save action are visible or reachable; `document.documentElement.scrollWidth <= window.innerWidth`; no bottom navigation or safe-area padding obscures the final action; the rating flow remains usable. | RATING-006-US-011 | Yes | UI E2E | Source: `RESP-002-US-001`, `RESP-002-US-002`, `RESP-002-US-005`, `RESP-002-US-010`, `RESP-002-US-011`, `RESP-002-US-012`. |
| RATING-006-RESP-TC-002 | Rating cleanup flow remains usable at 200% zoom and adaptive pressure | Responsive, Accessibility, UI | High | Load `FX-R006-ONE-LIST`; sign in as `user-001`; open Rating screen/dialog for `place-001`. | Browser zoom `200%`; effective narrow width; rating value `8.5`; note field focused if present. | 1. Set browser zoom to `200%`. 2. Open the rating flow. 3. Select and save `8.5`. 4. Measure overflow and target sizes. | No horizontal overflow occurs; rating control remains keyboard and pointer operable; save action remains reachable; interactive rating and action targets are at least `44x44` CSS pixels; no rating values are clipped. | RATING-006-US-011 | Yes | Accessibility | Source: `RESP-003-US-001`, `RESP-003-US-002`, `RESP-003-US-003`, `RESP-003-US-008`, `RESP-003-US-011`, `A11Y-002-US-010`, `A11Y-002-US-012`. |
| RATING-006-A11Y-TC-001 | Keyboard-only first rating completes cleanup flow accessibly | Accessibility, UI | High | Load `FX-R006-ONE-LIST`; sign in as `user-001`; open Rating screen/dialog from a visible trigger. | Keyboard only; select rating `8.5`; save action. | 1. Tab to the rating control. 2. Use the documented rating keyboard model to select `8.5`. 3. Tab to save. 4. Activate save. 5. Observe focus after close/navigation. | Rating control receives visible `focus-visible`; `8.5` is reachable by keyboard; selected value is programmatically determinable as `8.5/10`; loading is announced with accessible status while save is pending; after success, focus moves to Place Detail heading, updated rating context, or another documented logical fallback if the trigger unmounts. | RATING-006-US-011 | Yes | Accessibility | Source: `A11Y-001-US-003`, `A11Y-001-US-006`, `A11Y-001-US-007`, `A11Y-001-US-016`, `A11Y-002-US-001`, `A11Y-002-US-003`, `A11Y-002-US-006`, `A11Y-002-US-015`. |
| RATING-006-A11Y-TC-002 | Cleanup failure error is announced without leaking private details | Accessibility, Security, Privacy | High | Load `FX-R006-ROLLBACK-CLEANUP-FAIL`; sign in as `user-001`; open Rating screen/dialog for `place-005`; cleanup fault injection is enabled. | Rating value `8.5`; note `ملاحظة خاصة`. | 1. Save the rating. 2. Observe accessible status/error region. 3. Inspect DOM and accessibility tree text for forbidden values. 4. Verify focus remains on or returns to a correction/retry-safe control. | Failure is announced through accessible error text or live region; focus remains recoverable inside the rating flow or moves to a documented safe target; DOM and accessibility tree contain none of `عطلة نهاية الأسبوع`, `user-001`, `ملاحظة خاصة`, `SQL`, `Traceback`, `stack`, `debug`, or `audit`. | RATING-006-US-013 | Yes | Accessibility | Source: `A11Y-001-US-014`, `A11Y-001-US-015`, `A11Y-002-US-014`, `A11Y-002-US-015`. |
| RATING-006-SEC-TC-001 | Other-user data remains absent from success and failure responses | Security, Privacy | High | Run `RATING-006-US-003-TC-001` and `RATING-006-US-013-TC-001`; capture response JSON, client-visible error text, and rendered DOM after each flow. | Forbidden values: `user-002`, `list-201`, `قهوة`, other-user memberships, private list names, notes, SQL, stack, debug, audit, token. | 1. Execute the success owner-scoping case. 2. Execute the cleanup failure privacy case. 3. Recursively scan JSON, DOM text, and accessibility tree text. | Success and failure surfaces contain no other-user private list data, no private list names beyond documented current-user UI context, no notes in errors, no SQL, no stack traces, no audit/debug fields, no tokens, and no hidden metadata. | RATING-006-US-003 | Yes | Security |

## Requirement Clarification, Manual Verification, And Traceability Cases

These cases are intentionally not executable pass/fail assertions until Product/API requirements define the missing contract.

| Case ID | Title | Type | Priority | Related User Story ID | Clarification Needed | Risk If Ignored | Recommended Owner |
|---|---|---|---|---|---|---|---|
| RATING-006-RC-001 | Exact HTTP status for cleanup failure rollback | Requirement Clarification | Critical | RATING-006-US-005 | Define the exact non-success status and error schema when list cleanup fails before commit. | API clients may handle rollback failures inconsistently. | Product + Backend |
| RATING-006-RC-002 | Exact HTTP status for rating insert failure rollback | Requirement Clarification | Critical | RATING-006-US-006 | Define the exact non-success status and error schema when rating insert fails before cleanup. | Automated API tests may overfit implementation-specific errors. | Product + Backend |
| RATING-006-RC-003 | Exact HTTP status for commit failure rollback | Requirement Clarification | Critical | RATING-006-US-007 | Define the exact non-success status and error schema when final transaction commit fails. | Release criteria cannot distinguish acceptable failure handling from accidental 500 leakage. | Product + Backend |
| RATING-006-RC-004 | Observable cleanup-once evidence beyond final state | Requirement Clarification | High | RATING-006-US-008 | Define whether cleanup execution count is exposed through logs, events, metrics, or only through final membership state. | Tests may incorrectly depend on private implementation details. | Product + Backend |
| RATING-006-TV-001 | Place, list, and profile reload ownership boundary | Traceability Verification | High | RATING-006-US-011 | Verify that RATING-006 owns only the documented post-cleanup end state; detailed rendering of list/profile screens remains owned by their modules. | Cross-feature tests may duplicate list/profile feature ownership. | QA Architect |
| RATING-006-MV-001 | Transaction fault-injection harness availability | Manual Verification | Critical | RATING-006-US-005 | Confirm lower environments provide deterministic cleanup, insert, and commit fault injection without modifying production behavior. | Rollback cases may be skipped or tested manually late. | SDET + Backend |

## Coverage Summary

| User Story | Executable Tests | Clarification / Manual / Traceability Cases | Coverage Notes |
|---|---:|---:|---|
| RATING-006-US-001 | 1 | 0 | One-list cleanup covered with exact before/after membership counts. |
| RATING-006-US-002 | 1 | 0 | Multi-list cleanup covered with unrelated membership preservation. |
| RATING-006-US-003 | 2 | 0 | Other-user membership and response privacy covered. |
| RATING-006-US-004 | 2 | 0 | Atomic success and exact response contract covered. |
| RATING-006-US-005 | 1 | 2 | Rollback state executable; exact HTTP status clarified. |
| RATING-006-US-006 | 1 | 1 | Insert-failure rollback executable; exact HTTP status clarified. |
| RATING-006-US-007 | 1 | 1 | Commit-failure rollback executable; exact HTTP status clarified. |
| RATING-006-US-008 | 1 | 1 | Concurrent final state executable; cleanup event observability clarified. |
| RATING-006-US-009 | 1 | 0 | PATCH update no-repeat cleanup covered. |
| RATING-006-US-010 | 1 | 0 | POST upsert no-repeat cleanup covered. |
| RATING-006-US-011 | 4 | 1 | UI reload plus responsive/accessibility coverage included. |
| RATING-006-US-012 | 1 | 0 | Membership-only cleanup preservation covered. |
| RATING-006-US-013 | 2 | 0 | Cleanup failure privacy and accessible error safety covered. |

## Final Summary

- User Stories Processed: 13
- Executable Test Cases: 19
- Requirement Clarification Cases: 4
- Manual Verification Cases: 1
- Traceability Verification Cases: 1
- Total Cases: 25

### Count By Test Type

- Accessibility: 3
- API: 14
- Contract: 1
- Concurrency: 1
- Data Integrity: 13
- Error Handling: 3
- Integration: 3
- Negative: 4
- Positive: 4
- Privacy: 5
- Regression: 2
- Responsive: 2
- Security: 5
- UI: 5

### Count By Priority

- Critical: 14
- High: 11

### Count By Automation Layer

- API: 12
- UI E2E: 2
- Accessibility: 3
- Security: 2
- Requirement Clarification: 4
- Manual Verification: 1
- Traceability Verification: 1

### Top Automation Candidates

1. `RATING-006-US-002-TC-001` - all owned-list cleanup with exact membership counts.
2. `RATING-006-US-004-TC-001` - atomic success snapshot.
3. `RATING-006-US-005-TC-001` - cleanup failure rollback.
4. `RATING-006-US-008-TC-001` - concurrent first-rating safety.
5. `RATING-006-US-009-TC-001` - PATCH update no-repeat cleanup.
6. `RATING-006-US-010-TC-001` - POST upsert no-repeat cleanup.
7. `RATING-006-US-011-TC-001` - UI refresh after cleanup.
8. `RATING-006-US-013-TC-001` - cleanup failure privacy.

## Validation

- Duplicate Test IDs = 0
- Invalid Story References = 0
- Missing User Stories = 0
- Encoding/Mojibake = 0
- API Tests Missing Status Codes = 0 for documented success paths; rollback failure exact statuses are classified as Requirement Clarification
- Generic Executable Wording = 0
- Contradictory Expected Results = 0
- Requirement Fidelity Violations = 0
- Feature Ownership Violations = 0
