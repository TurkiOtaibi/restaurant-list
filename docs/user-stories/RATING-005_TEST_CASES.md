# RATING-005 Test Cases

Feature: `RATING-005 - Tried concept removed from active product model`

Feature Description: `tried` is a superseded legacy concept. Ratings are independent user scores and do not create, expose, or update any `tried` state. This file supersedes the previous `RATING-005 - Tried derived from rating row` test package per `docs/engineering-decisions/EDR-009_RATING_LIST_DECOUPLING.md`.

Primary Source: `docs/user-stories/RATINGS_USER_STORIES.md`

Supporting Sources:

- `docs/engineering-decisions/EDR-009_RATING_LIST_DECOUPLING.md`
- `docs/user-stories/RTM_MASTER.md`
- `docs/user-stories/PROFILE_USER_STORIES.md`
- `docs/user-stories/RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`

## QA Execution Standards

- Executable tests validate that no active API response, UI surface, or profile summary exposes `tried` as a product state.
- Rating creation and editing remain rating-only mutations.
- List membership assertions are owned by `RATING-006`.
- Profile count renaming is asserted here only where it proves the removed tried contract does not leak through rating-facing flows.
- `RatingResponse` fields remain exactly `id`, `userId`, `placeId`, `rating`, `notes`, `createdAt`, and `updatedAt`.

## Deterministic Fixtures

| Fixture ID | User / Permissions | Database State | API / UI Context | Expected Baseline |
|---|---|---|---|---|
| FX-R005-A | `user-001` authenticated | `place-new-001` has no rating for `user-001`. | Create rating with `POST /api/v1/ratings`, then reload Place Detail and Places list. | Rating row exists after save; `currentUserRating` is populated; no `currentUserTried` field or `جربته` UI appears. |
| FX-R005-B | `user-001` authenticated | Existing rating `rating-001` for `place-rated-001`. | Update rating with `PATCH /api/v1/ratings/place-rated-001`, then reload Place Detail/Profile. | Rating value updates; no tried state is created or preserved because tried is not active. |
| FX-R005-C | `user-001` authenticated | Ratings by place type: restaurant `2`, cafe `1`, ice_cream `1`; one unrated restaurant is present in a list. | Profile summary and archive. | Profile exposes `ratedRestaurantCount=2`, `ratedCafeCount=1`, `ratedIceCreamCount=1`; no `tried*Count` or `triedPlaces` field appears. |
| FX-R005-D | `user-002` authenticated | `user-001` rated `place-rated-001`; `user-002` has no rating row for that place. | Places list and Place Detail as `user-002`. | Other-user rating context and private notes remain hidden; no tried context is exposed. |

## Response Contract

Successful rating create/update responses are the documented single `RatingResponse` object:

```json
{
  "id": "rating-generated-id",
  "userId": "user-001",
  "placeId": "place-new-001",
  "rating": 8.5,
  "notes": null,
  "createdAt": "2026-06-26T10:00:00Z",
  "updatedAt": "2026-06-26T10:00:00Z"
}
```

Place responses must not include `currentUserTried`. Profile responses must not include `triedRestaurantCount`, `triedCafeCount`, `triedIceCreamCount`, or `triedPlaces`.

## Superseded Legacy Behavior

The following legacy expectations are superseded by `EDR-009` and must not be used as active acceptance criteria:

- A rating derives `currentUserTried`.
- Places list or Place Detail exposes tried context.
- Profile summary exposes tried counts.
- Rating deletion semantics are required to remove tried state.
- Tried indicators or `جربته` chips appear in UI.

## RATING-005-US-001 - Rating does not create tried state

User Story ID: `RATING-005-US-001`

User Story Title: Rating does not create tried state

User Story Summary: As Product, I want ratings to remain independent scores without creating a tried product state.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-005-US-001-TC-001 | Create rating exposes rating context but no tried field | API, UI, Data Integrity, Positive | Critical | FX-R005-A is loaded; no rating row exists for `(user-001, place-new-001)`. | `POST /api/v1/ratings` body `{ "placeId": "place-new-001", "rating": 8.5 }`; reloaded Place Detail data. | 1. Send POST as `user-001`. 2. Verify `RatingResponse`. 3. Reload Place Detail. 4. Inspect response and UI. | POST returns `201 Created`; one rating row exists; Place Detail exposes `currentUserRating=8.5`; response does not include `currentUserTried`; UI does not render `جربته` or tried status. | RATING-005-US-001 | Yes | API, UI E2E | Inverts legacy tried derivation. |

## RATING-005-US-002 - No tried UI or manual tried control

User Story ID: `RATING-005-US-002`

User Story Title: No tried UI or manual tried control

User Story Summary: As a user, I should see rating language only, not tried language or controls.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-005-US-002-TC-001 | Places and Place Detail omit tried labels | UI, Accessibility, Negative | High | FX-R005-B is loaded. | Places list and Place Detail for `place-rated-001`. | 1. Open Places list. 2. Open Place Detail. 3. Inspect visible text and accessibility tree. | No visible or accessible text equals `جربته`, `tried`, `مجرب`, or `مجربة`; rating controls and rating summaries remain available. | RATING-005-US-002 | Yes | UI E2E | Active UI must use rating language only. |

## RATING-005-US-003 - Rating update stays rating-only

User Story ID: `RATING-005-US-003`

User Story Title: Rating update stays rating-only

User Story Summary: As a user, editing my score updates only rating data.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-005-US-003-TC-001 | PATCH update does not create tried context | API, UI, Data Integrity, Positive | High | FX-R005-B is loaded. | `PATCH /api/v1/ratings/place-rated-001` body `{ "rating": 9, "notes": null }`. | 1. Send PATCH as `user-001`. 2. Reload Place Detail/Profile. 3. Inspect API and UI. | PATCH returns `200 OK`; rating value updates; no `currentUserTried`, tried labels, or tried counters appear. | RATING-005-US-003 | Yes | API, UI E2E | Rating edit remains independent. |

## RATING-005-US-004 - Profile rated counts replace tried counts

User Story ID: `RATING-005-US-004`

User Story Title: Profile rated counts replace tried counts

User Story Summary: As a user, I want profile type counts to describe rated places, not tried places.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-005-US-004-TC-001 | Profile returns rated counts and omits tried counts | API, UI, Contract, Positive | Critical | FX-R005-C is loaded for `user-001`. | `GET /api/v1/profile`; ratings by type restaurant `2`, cafe `1`, ice_cream `1`. | 1. Load Profile. 2. Inspect profile response. 3. Inspect summary labels. | Profile response includes `ratedRestaurantCount=2`, `ratedCafeCount=1`, `ratedIceCreamCount=1`; does not include `triedRestaurantCount`, `triedCafeCount`, `triedIceCreamCount`, or `triedPlaces`; UI labels use rating language. | RATING-005-US-004 | Yes | API, UI E2E | Contract rename required by D2. |

## RATING-005-US-005 - Current-user rating remains the only per-user place signal

User Story ID: `RATING-005-US-005`

User Story Title: Current-user rating remains the only per-user place signal

User Story Summary: As an API consumer, I want place context to expose rating state without a tried duplicate.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-005-US-005-TC-001 | Places list includes currentUserRating but not currentUserTried | API, UI, Positive | High | FX-R005-C is loaded. | `GET /api/v1/places?limit=20&offset=0`. | 1. Load Places as `user-001`. 2. Inspect response rows. 3. Inspect place rows. | Rated rows expose `currentUserRating` where applicable; no row includes `currentUserTried`; rows render community average rating and no tried chip. | RATING-005-US-005 | Yes | API, UI E2E | Preserves D3 card number semantics. |

## Supplemental Production Coverage

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-005-SEC-TC-001 | Other-user rating context remains private without tried fallback | API, UI, Privacy, Security, Negative | Critical | FX-R005-D is loaded. | Places list and Place Detail as `user-002`. | 1. Load surfaces as `user-002`. 2. Recursively inspect response JSON, DOM, and accessibility tree. | No `user-001` current-user context, private note, hidden metadata, `currentUserTried`, or tried label appears. | RATING-005-US-005 | Yes | Security | Privacy smoke. |
| RATING-005-TRACE-TC-001 | No tried database artifact exists | Traceability Verification | High | Source tree and migrations are available. | Backend models and migrations. | 1. Search backend models/migrations for tried table/column. 2. Confirm EDR-009. | No tried table, tried column, or migration exists; removed behavior was derived from ratings only. | RATING-005-US-001 | No | Traceability Verification | Database safety guardrail. |

## Final Summary

- User Stories Processed: 5
- Executable Test Cases: 6
- Traceability Cases: 1
- Total Test Cases: 7

## Validation

- Duplicate Test IDs = 0
- Invalid Story References = 0
- Missing User Stories = 0
- Requirement Fidelity Violations = 0
- Superseded legacy behavior is explicitly documented and inactive.
