# RATING-006 Test Cases

Feature: `RATING-006 - Rating does not affect list membership`

Feature Description: Creating or editing a rating never removes a place from a list and never adds a place to a list. Lists and ratings are independent product concepts. This file supersedes the previous `RATING-006 - First rating removes place from all user lists` test package per `docs/engineering-decisions/EDR-009_RATING_LIST_DECOUPLING.md`.

Primary Source: `docs/user-stories/RATINGS_USER_STORIES.md`

Supporting Sources:

- `docs/engineering-decisions/EDR-009_RATING_LIST_DECOUPLING.md`
- `docs/user-stories/RTM_MASTER.md`
- `docs/user-stories/LISTS_USER_STORIES.md`
- `docs/user-stories/RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`

## QA Execution Standards

- Executable tests assert rating/list independence, not cleanup.
- Rating responses remain `RatingResponse` only.
- List membership responses remain list-owned contracts.
- No test may expect rating creation, rating edit, or rating upsert to add or remove a list item.
- No fault-injection cleanup cases remain because there is no rating-triggered cleanup operation.

## Documented API Contract Used By These Tests

- Create flow endpoint: `POST /api/v1/ratings`.
- Edit endpoint: `PATCH /api/v1/ratings/{place_id}`.
- `POST /api/v1/ratings` returns `201 Created` when a new rating is created.
- `POST /api/v1/ratings` returns `200 OK` when it updates an existing rating through upsert.
- `PATCH /api/v1/ratings/{place_id}` returns `200 OK` when it updates an existing rating.
- `RatingResponse` fields are exactly `id`, `userId`, `placeId`, `rating`, `notes`, `createdAt`, and `updatedAt`.
- Add/remove list membership behavior remains owned by Lists and Place Detail add-to-list requirements.

## Deterministic Fixture Matrix

| Fixture ID | Purpose | Authenticated User | Initial Ratings | Initial Lists And Memberships | Places | Expected Baseline |
|---|---|---|---|---|---|---|
| `FX-R006-LISTED` | Rating listed place | `user-001` | No rating for `(user-001, place-001)` | `list-101` and `list-102` owned by `user-001`, both contain `place-001`; `list-201` owned by `user-002`, contains `place-001`. | `place-001` restaurant | Before action: user-001 owned membership count for `place-001` is `2`; user-002 membership count is `1`; rating count is `0`. |
| `FX-R006-UNLISTED` | Rating unlisted place | `user-001` | No rating for `(user-001, place-002)` | `list-103` owned by `user-001`, empty. | `place-002` cafe | Before action: no membership exists for `place-002`; rating count is `0`. |
| `FX-R006-RATED-ADD` | Add rated place to list | `user-001` | Existing rating for `(user-001, place-003)`. | `list-104` owned by `user-001`, empty. | `place-003` ice_cream | Before action: rating exists; list membership does not. |
| `FX-R006-EDIT` | Edit rating with list membership | `user-001` | Existing rating for `(user-001, place-004)`. | `list-105` owned by `user-001`, contains `place-004`. | `place-004` restaurant | Before action: rating exists; list membership exists. |

## Superseded Legacy Behavior

The following legacy expectations are superseded by `EDR-009` and must not be used as active acceptance criteria:

- First rating removes a place from one or all owned lists.
- Rating and list cleanup are a single transaction.
- Rating cleanup rollback/fault-injection behavior exists.
- Rating update avoids repeated cleanup.
- UI refresh after rating shows list removal.
- Re-add exists because rating removed membership.

## RATING-006-US-001 - Rating listed place preserves list membership

User Story ID: `RATING-006-US-001`

User Story Title: Rating listed place preserves list membership

User Story Summary: As a user, I want a place to remain in my lists after I rate it.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-006-US-001-TC-001 | Rating a place in one or more owned lists keeps all memberships | Positive, API, Data Integrity | Critical | Load `FX-R006-LISTED`; authenticate as `user-001`. | `POST /api/v1/ratings` payload `{ "placeId": "place-001", "rating": 8.5, "notes": null }`. | 1. Capture list memberships. 2. Send POST. 3. Query rating row. 4. Re-fetch all affected list details. | Status is `201 Created`; one rating row exists; `list-101` and `list-102` still contain `place-001`; unrelated memberships remain unchanged; `list-201` owned by another user remains unchanged. | RATING-006-US-001 | Yes | API |

## RATING-006-US-002 - Rating unlisted place creates no membership

User Story ID: `RATING-006-US-002`

User Story Title: Rating unlisted place creates no membership

User Story Summary: As the system, I want rating creation not to add a place to any list.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-006-US-002-TC-001 | Rating unlisted place leaves owned lists unchanged | Negative, API, Data Integrity | Critical | Load `FX-R006-UNLISTED`; authenticate as `user-001`. | `POST /api/v1/ratings` payload `{ "placeId": "place-002", "rating": 7.5 }`. | 1. Capture list state. 2. Send POST. 3. Query rating row. 4. Re-fetch `list-103`. | Status is `201 Created`; one rating row exists; no `list_items` row is created for `place-002`; `list-103` remains empty. | RATING-006-US-002 | Yes | API |

## RATING-006-US-003 - Rated place can be added to a list

User Story ID: `RATING-006-US-003`

User Story Title: Rated place can be added to a list

User Story Summary: As a user, I can organize rated places in lists without changing my rating.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-006-US-003-TC-001 | Add rated place to list preserves existing rating | API, Integration, Data Integrity | Critical | Load `FX-R006-RATED-ADD`; authenticate as `user-001`. | Add `place-003` to `list-104`. | 1. Capture rating row. 2. Add place to owned list through list membership API/UI. 3. Re-fetch list detail and rating context. | List membership is created; existing rating value, note, and row id are unchanged; no second rating row is created. | RATING-006-US-003 | Yes | API, UI E2E |

## RATING-006-US-004 - Editing rating preserves list membership

User Story ID: `RATING-006-US-004`

User Story Title: Editing rating preserves list membership

User Story Summary: As a user, I want rating edits not to remove or add list items.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-006-US-004-TC-001 | PATCH rating update leaves list membership unchanged | Regression, API, Data Integrity | High | Load `FX-R006-EDIT`; authenticate as `user-001`; verify `list-105` contains `place-004`. | `PATCH /api/v1/ratings/place-004` payload `{ "rating": 9, "notes": "updated" }`. | 1. Capture list membership. 2. Send PATCH. 3. Query rating row. 4. Re-fetch `list-105`. | Status is `200 OK`; rating value/note update; `list-105` still contains `place-004`; no membership count changes. | RATING-006-US-004 | Yes | API |
| RATING-006-US-004-TC-002 | POST upsert rating update leaves list membership unchanged | Regression, API, Data Integrity | High | Load `FX-R006-EDIT`; authenticate as `user-001`; verify existing rating and membership. | `POST /api/v1/ratings` payload `{ "placeId": "place-004", "rating": 8, "notes": null }`. | 1. Capture list membership. 2. Send POST. 3. Query rating row count. 4. Re-fetch `list-105`. | Status is `200 OK`; one rating row remains; `list-105` still contains `place-004`; no cleanup side effect runs. | RATING-006-US-004 | Yes | API |

## RATING-006-US-005 - List membership changes do not mutate ratings

User Story ID: `RATING-006-US-005`

User Story Title: List membership changes do not mutate ratings

User Story Summary: As the system, I want list operations not to create, edit, or delete ratings.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-006-US-005-TC-001 | Remove listed rated place preserves rating row | API, Integration, Data Integrity | High | A rated place is present in an owned list. | Remove membership through list detail overflow/remove flow. | 1. Capture rating row. 2. Remove place from list. 3. Re-fetch rating context/profile archive. | Membership is removed; rating row, rating value, and private note remain unchanged; profile archive still includes the rating. | RATING-006-US-005 | Yes | API, UI E2E |

## RATING-006-US-006 - UI flow confirms rating/list independence

User Story ID: `RATING-006-US-006`

User Story Title: UI flow confirms rating/list independence

User Story Summary: As a user, I can add, rate, and return to my list without losing the place.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-006-US-006-TC-001 | Create list, add place, rate place, return to list, place remains | UI, Integration, Data Integrity | Critical | Authenticated user; deterministic place exists. | New list name and rating value `8.5`. | 1. Create a list. 2. Add place to the list. 3. Open place detail and save rating. 4. Return to list detail. | The rated place remains visible in the list; rating is visible in rating contexts; no `جربته` UI appears. | RATING-006-US-006 | Yes | UI E2E |

## Final Summary

- User Stories Processed: 6
- Executable Test Cases: 7
- Requirement Clarification Cases: 0
- Manual Verification Cases: 0
- Total Cases: 7

## Validation

- Duplicate Test IDs = 0
- Invalid Story References = 0
- Missing User Stories = 0
- Superseded cleanup expectations are explicitly documented and inactive.
