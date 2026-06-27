# RATING-005 Test Cases

Feature: `RATING-005 - Tried derived from rating row`

Feature Description: Tried status is derived from the existence of a rating row; no separate tried table exists.

Primary Source: `docs/user-stories/RATINGS_USER_STORIES.md`

Supporting Sources:

- `docs/feature-map/FEATURE_TRACEABILITY.md`
- `docs/user-stories/RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`

## QA Execution Standards

- Executable tests validate only `RATING-005`, `FEATURE_TRACEABILITY.md`, or approved global `RESP-*` / `A11Y-*` requirements.
- RATING-005 owns tried derivation from rating rows, profile tried counts by place type, tried context on Places/Place Detail/Profile surfaces, rating-deletion exclusion from current scope, and refresh-after-reload behavior.
- Rating value validation, private note behavior, first-rating list cleanup, aggregate calculation, list re-add behavior, retry behavior, browser history, cache behavior, and synchronization timing are outside RATING-005 unless the RATING-005 acceptance criterion explicitly requires a refreshed surface.
- Documented rating mutation statuses used here are `201 Created` for new `POST /api/v1/ratings` and `200 OK` for `PATCH /api/v1/ratings/{place_id}`.
- GET endpoint status codes for Places/Profile surfaces are not asserted because the allowed source requirements do not document them; executable GET checks assert documented response fields and rendered UI state only.
- `RatingResponse` fields are exactly `id`, `userId`, `placeId`, `rating`, `notes`, `createdAt`, and `updatedAt`.
- Forbidden response/DOM content includes other users' rating-derived current-user context, private notes outside owner-only contexts, hidden metadata, audit/debug fields, stack traces, SQL details, tokens, undocumented internal identifiers, and raw exception text.

## Deterministic Fixtures

| Fixture ID | User / Permissions | Database State | API / UI Context | Expected Baseline |
|---|---|---|---|---|
| FX-R005-A | `user-001` authenticated | `place-new-001`, name `مطعم الرياض`, type `restaurant`; no rating exists for `(user-001, place-new-001)`. | Create rating with `POST /api/v1/ratings`, then reload Place Detail data. | Before rating, `currentUserTried=false`; after persisted rating row exists, tried derives true. |
| FX-R005-B | `user-001` authenticated | Existing `rating-001`: `userId=user-001`, `placeId=place-rated-001`, place name `قهوة المساء`, type `cafe`, `rating=6.5`, `notes=null`. | Update rating with `PATCH /api/v1/ratings/place-rated-001`, then reload Place Detail data. | Tried is already true because the current user has a rating row. |
| FX-R005-C | `user-001` authenticated | Ratings: `place-rest-001` restaurant rating `8.5`, `place-rest-002` restaurant rating `7`, `place-cafe-001` cafe rating `9`, `place-ice-001` ice_cream rating `8`; `place-unrated-001` restaurant has no `user-001` rating. | Profile, Places list, and Place Detail reloads. | Expected profile tried counts: restaurant `2`, cafe `1`, ice_cream `1`; unrated place tried false. |
| FX-R005-D | `user-002` authenticated | `user-001` rated `place-rated-001`; `user-002` has no rating row for `place-rated-001`. | Non-owner Places/Detail/Profile context. | `user-002` must not receive `user-001` current-user tried state or private rating context. |
| FX-R005-E | `user-001` authenticated | Two browser tabs start with no `user-001` rating for `place-tab-001`; place type `restaurant`. | Tab A creates rating; Tab B refreshes Place Detail/Profile data. | After refresh, Tab B derives tried from the persisted rating row. |
| FX-R005-F | `user-001` authenticated | Rating-derived tried surfaces render in Arabic RTL UI. | Accessibility and responsive certification. | Tried indicators/counts are visible, keyboard reachable where interactive, and announced when presented. |

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

RATING-005 executable tests use rating mutation endpoints only to establish or update the rating-row fixture required by the tried-derivation acceptance criterion. They do not duplicate rating-scale validation, private-note validation, list cleanup, or aggregate calculation coverage.

## RATING-005-US-001 - Mark tried after rating

User Story ID: `RATING-005-US-001`

User Story Title: Mark tried after rating

User Story Summary: As a user, I want a place marked tried after I rate it so that my archive reflects visited places.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-005-US-001-TC-001 | Create rating then reloaded place data has currentUserTried true | API, UI, Data Integrity, Positive | Critical | FX-R005-A is loaded; no rating row exists for `(user-001, place-new-001)`. | `POST /api/v1/ratings` body `{ "placeId": "place-new-001", "rating": 8.5 }`; reloaded Place Detail data for `place-new-001`. | 1. Send the POST request as `user-001`. 2. Verify the mutation response. 3. Query the ratings table for `(user-001, place-new-001)`. 4. Reload Place Detail data/UI for `place-new-001`. | POST response status is `201 Created`; response has exactly the `RatingResponse` fields; exactly one rating row exists for `(user-001, place-new-001)`; reloaded place data/UI exposes `currentUserTried=true`; no separate tried flag/table mutation is asserted. | RATING-005-US-001 | Yes | API | Smoke. |

## RATING-005-US-002 - Tried has no manual toggle

User Story ID: `RATING-005-US-002`

User Story Title: Tried has no manual toggle

User Story Summary: As Product, I want tried derived from ratings so that the model stays simple.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-005-US-002-TC-001 | Unrated place loads with currentUserTried false and no tried toggle | API, UI, Negative | High | FX-R005-C is loaded; `user-001` has no rating row for `place-unrated-001`. | Place Detail data/UI for `place-unrated-001`. | 1. Open Place Detail for `place-unrated-001` as `user-001`. 2. Inspect response body for current-user tried context. 3. Inspect visible controls and accessibility tree for a manual tried toggle/action. | Place data exposes `currentUserTried=false`; no standalone tried-toggle control/action is visible or present in the accessibility tree; no rating row is created during view. | RATING-005-US-002 | Yes | UI E2E | Regression. |
| RATING-005-US-002-TC-002 | Rating model traceability contains ratings table but no separate tried table | Traceability Verification | High | Allowed source files are available. | `FEATURE_TRACEABILITY.md` database evidence. | 1. Review RATING-005 feature description. 2. Review database evidence in `FEATURE_TRACEABILITY.md`. 3. Confirm tried derivation is traced through `ratings` and not a separate tried storage feature. | Traceability confirms RATING-005 is implemented through rating-row existence; no executable assumption is made for undocumented schema objects beyond the documented `ratings` evidence. | RATING-005-US-002 | No | Traceability Verification | Prevents schema overreach while covering the no-separate-model rule. |

## RATING-005-US-003 - Preserve tried on rating update

User Story ID: `RATING-005-US-003`

User Story Title: Preserve tried on rating update

User Story Summary: As a user, I want tried status to remain when I update a rating.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-005-US-003-TC-001 | PATCH update preserves currentUserTried true after reload | API, UI, Data Integrity, Positive | High | FX-R005-B is loaded; `rating-001` exists for `(user-001, place-rated-001)`. | `PATCH /api/v1/ratings/place-rated-001` body `{ "rating": 9, "notes": null }`; reloaded Place Detail data for `place-rated-001`. | 1. Send PATCH as `user-001`. 2. Verify mutation response. 3. Query rating row count for `(user-001, place-rated-001)`. 4. Reload Place Detail data/UI. | PATCH response status is `200 OK`; response has exactly the `RatingResponse` fields; `response.id="rating-001"`; exactly one rating row remains for `(user-001, place-rated-001)`; reloaded place data/UI exposes `currentUserTried=true`. | RATING-005-US-003 | Yes | API | Regression. PATCH endpoint/status are documented in allowed sources. |

## RATING-005-US-004 - Profile tried counts derive from ratings

User Story ID: `RATING-005-US-004`

User Story Title: Profile tried counts derive from ratings

User Story Summary: As a user, I want profile tried counts accurate so that stats reflect my ratings.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-005-US-004-TC-001 | Profile shows tried counts derived by rated place type | API, UI, Data Integrity, Positive | High | FX-R005-C is loaded for `user-001`. | `GET /api/v1/profile`; ratings by type: restaurant `2`, cafe `1`, ice_cream `1`; `place-unrated-001` has no rating. | 1. Load Profile as `user-001`. 2. Inspect profile response/count data. 3. Inspect visible profile count labels/values. 4. Compare counts to the ratings table fixture. | Profile data/UI shows tried restaurant count `2`, tried cafe count `1`, and tried ice-cream count `1`; `place-unrated-001` is not counted; no separate tried source is required for the counts. | RATING-005-US-004 | Yes | UI E2E | Smoke. Endpoint traceability: `GET /api/v1/profile`. |
| RATING-005-US-004-TC-002 | Profile tried counts are current-user scoped | API, Privacy, Security, Negative | High | FX-R005-C and FX-R005-D are loaded; `user-002` has separate ratings not owned by `user-001`. | Profile load as `user-001`. | 1. Load Profile as `user-001`. 2. Inspect profile count data/UI. 3. Recursively inspect response/DOM for other-user rating context. | Profile tried counts equal only `user-001` rated places: restaurant `2`, cafe `1`, ice_cream `1`; other users' ratings do not increment `user-001` counts; response/DOM contain no other users' private rating context. | RATING-005-US-004 | Yes | Security | Privacy regression. |

## RATING-005-US-005 - Places list tried context

User Story ID: `RATING-005-US-005`

User Story Title: Places list tried context

User Story Summary: As a user, I want place context to reflect tried status so that I can recognize places I have rated.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-005-US-005-TC-001 | Places list includes current-user tried context per row | API, UI, Positive | Medium | FX-R005-C is loaded for `user-001`. | `GET /api/v1/places?limit=20&offset=0` with `place-rest-001`, `place-cafe-001`, and `place-unrated-001`. | 1. Load Places list as `user-001`. 2. Inspect response rows for current-user tried context. 3. Inspect visible row state for rated and unrated places. | Places data/UI exposes `currentUserTried=true` for `place-rest-001` and `place-cafe-001`; exposes `currentUserTried=false` for `place-unrated-001`; visible row context distinguishes rated from unrated places without exposing private notes or other users' rating context. | RATING-005-US-005 | Yes | UI E2E | Regression. Endpoint traceability: `GET /api/v1/places`. |

## RATING-005-US-006 - Place Detail tried context

User Story ID: `RATING-005-US-006`

User Story Title: Place Detail tried context

User Story Summary: As a user, I want Place Detail to reflect tried status.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-005-US-006-TC-001 | Place Detail exposes tried and current-user rating context from rating row | API, UI, Positive | Medium | FX-R005-B is loaded for `user-001`. | Place Detail for `place-rated-001`; existing `rating-001.rating=6.5`. | 1. Load Place Detail for `place-rated-001` as `user-001`. 2. Inspect response body for tried/current-user rating context. 3. Inspect visible selected/current-user rating state. | Place Detail data/UI exposes `currentUserTried=true`; current-user rating context reflects the persisted `rating-001` value `6.5`; no other user's rating context is exposed as current-user context. | RATING-005-US-006 | Yes | UI E2E | Regression. Endpoint traceability: `GET /api/v1/places/{id}`. |

## RATING-005-US-007 - No orphan tried state

User Story ID: `RATING-005-US-007`

User Story Title: No orphan tried state

User Story Summary: As the system, I want no tried state without rating so that data cannot diverge.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-005-US-007-TC-001 | Place query returns tried false when no rating row exists | API, Data Integrity, Negative | High | FX-R005-C is loaded; no `(user-001, place-unrated-001)` rating row exists. | Place Detail data for `place-unrated-001`; Places list row for `place-unrated-001`. | 1. Query the ratings table for `(user-001, place-unrated-001)`. 2. Load Place Detail for `place-unrated-001`. 3. Load Places list row for `place-unrated-001`. | Ratings query returns zero rows; Place Detail exposes `currentUserTried=false`; Places list row exposes `currentUserTried=false`; no orphan tried state is returned without a rating row. | RATING-005-US-007 | Yes | API | Smoke. |

## RATING-005-US-008 - Rating deletion unsupported

User Story ID: `RATING-005-US-008`

User Story Title: Rating deletion unsupported

User Story Summary: As Product, I want rating deletion excluded so that tried removal semantics are not ambiguous.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-005-US-008-TC-001 | Rating UI exposes no delete-rating action in current scope | UI, Negative | Medium | FX-R005-B is loaded; rating edit/profile contexts are available to owner `user-001`. | Rating owner UI for `place-rated-001` and profile archive row for `rating-001`. | 1. Open rating edit/profile contexts as `user-001`. 2. Inspect visible actions. 3. Inspect accessibility tree for rating removal/delete controls. | No delete-rating action/control is visible or exposed in the accessibility tree; current product scope leaves tried removal via deletion out of scope. | RATING-005-US-008 | Yes | UI E2E | Executes the documented absence of a delete-rating action without inventing DELETE status codes. |
| RATING-005-US-008-TC-002 | Endpoint traceability contains no delete-rating endpoint requirement | Traceability Verification | Medium | Allowed source files are available. | Endpoint traceability table and RATING-005 source. | 1. Review allowed source endpoint traceability. 2. Verify rating endpoints documented are `POST /api/v1/ratings` and `PATCH /api/v1/ratings/{place_id}`. 3. Verify no executable DELETE request/status is introduced by this package. | RATING-005 records deletion as unsupported/out of scope; no DELETE endpoint behavior or status code is asserted as executable coverage. | RATING-005-US-008 | No | Traceability Verification | Requirement-fidelity guardrail. |

## RATING-005-US-009 - Refresh archive after tried change

User Story ID: `RATING-005-US-009`

User Story Title: Refresh archive after tried change

User Story Summary: As a user, I want profile archive updated after rating so that tried/rating history is current.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-005-US-009-TC-001 | Profile reload after rating create shows archive row and updated tried count | API, UI, Data Integrity, Positive | High | FX-R005-A is loaded and profile baseline has restaurant tried count `0` for `place-new-001` fixture scope. | `POST /api/v1/ratings` body `{ "placeId": "place-new-001", "rating": 8.5 }`; `GET /api/v1/profile` after mutation. | 1. Load Profile baseline as `user-001`. 2. Send POST rating request. 3. Reload Profile as `user-001`. 4. Inspect profile archive rows and tried counts. | POST response status is `201 Created`; reloaded profile archive includes `place-new-001` with rating `8.5`; restaurant tried count increases by `1` from the baseline; no separate tried state is required. | RATING-005-US-009 | Yes | UI E2E | Smoke. |

## RATING-005-US-010 - Keep tried derivation current across tabs

User Story ID: `RATING-005-US-010`

User Story Title: Keep tried derivation current across tabs

User Story Summary: As a user with multiple tabs, I want refreshed views to reflect rating state.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-005-US-010-TC-001 | Second tab refresh derives tried from persisted rating row | UI, Integration, Positive | Medium | FX-R005-E is loaded; Tab A and Tab B are authenticated as `user-001`; no rating row exists for `place-tab-001`. | Tab A POST body `{ "placeId": "place-tab-001", "rating": 8.5 }`; Tab B Place Detail/Profile reload. | 1. Open Tab B Place Detail/Profile for `place-tab-001` and confirm tried false baseline. 2. In Tab A, create rating. 3. In Tab B, refresh Place Detail/Profile data. 4. Inspect tried context and profile archive/counts. | Tab A POST response status is `201 Created`; after Tab B refresh, Place Detail exposes `currentUserTried=true`; Profile archive includes `place-tab-001`; profile restaurant tried count increases by `1` from Tab B baseline. | RATING-005-US-010 | Yes | UI E2E | Uses explicit refresh only; no real-time sync or timing assumption. |

## Supplemental Production Coverage

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-005-SEC-TC-001 | Current-user tried context is scoped to authenticated user | API, UI, Privacy, Security, Negative | Critical | FX-R005-D is loaded; `user-001` rated `place-rated-001`; `user-002` has no rating row for that place. | Places list and Place Detail as `user-002`. | 1. Load Places list as `user-002`. 2. Load Place Detail for `place-rated-001` as `user-002`. 3. Recursively inspect response JSON, DOM, and accessibility tree. | `user-002` sees `currentUserTried=false` for `place-rated-001`; response/DOM/accessibility tree do not expose `user-001` as current-user context, private notes, hidden metadata, audit/debug fields, stack traces, SQL details, or tokens. | RATING-005-US-007 | Yes | Security | Privacy smoke. |
| RATING-005-A11Y-TC-001 | Tried indicators and profile counts are keyboard reachable and screen-reader understandable | Accessibility, UI | High | FX-R005-C and FX-R005-F are loaded. | Places row `place-rest-001`, Place Detail `place-rated-001`, profile counts restaurant `2`, cafe `1`, ice_cream `1`. | 1. Navigate Places, Place Detail, and Profile using keyboard only. 2. Inspect focus-visible on interactive elements near tried context. 3. Inspect accessibility names/descriptions for tried indicators and counts. | Keyboard users can reach interactive rows/actions without losing focus; visible `focus-visible` appears; screen reader can determine rated/tried state for rated places and exact profile tried counts by type. | RATING-005-US-004 | Yes | Accessibility | Source: RESP-001-US-007, RESP-001-US-008, A11Y-002-US-018, QA screen-reader checklist. |
| RATING-005-RESP-TC-001 | Tried context and profile counts pass responsive matrix | Responsive, Accessibility, UI | High | FX-R005-C and FX-R005-F are loaded. | Viewports `320x568`, `390x844`, `430x932`, phone landscape, `768x1024`, `1024x768`, `1440x900`; 200% zoom. | 1. Render Places, Place Detail, and Profile count surfaces at each viewport. 2. Check tried indicators/counts, final actions, safe areas, and overflow. 3. Repeat core checks at 200% zoom. | At every viewport and 200% zoom, tried indicators and profile counts remain readable and reachable; `document.documentElement.scrollWidth <= window.innerWidth`; final interactive elements are not obscured by bottom navigation or safe areas; relevant controls keep at least `44x44` CSS pixel hit area. | RATING-005-US-004 | Yes | Accessibility | Source: RESP-002-US-001, RESP-002-US-002, RESP-002-US-005, RESP-002-US-012, RESP-003-US-001, RESP-003-US-002, RESP-003-US-008. |
| RATING-005-TRACE-TC-001 | List cleanup and re-add behavior remain outside RATING-005 executable ownership | Traceability Verification | Medium | Allowed source files are available. | RATING-006 and RATING-007 source sections in `RATINGS_USER_STORIES.md`. | 1. Confirm RATING-005 executable tests do not assert list item removal, transaction rollback, or re-add behavior. 2. Confirm those behaviors are owned by later rating features in the same source file. | RATING-005 remains scoped to tried derivation from rating row existence; list cleanup and re-add semantics are covered by their owning documented features. | RATING-005-US-001 | No | Traceability Verification | Feature ownership guardrail. |

## Final Summary

- User Stories Processed: 10
- Executable Test Cases: 14
- Clarification Cases: 0
- Manual Cases: 0
- Traceability Cases: 3
- Total Test Cases: 17

### Count By Test Type

- Accessibility: 2
- API: 10
- Data Integrity: 5
- Integration: 1
- Negative: 5
- Positive: 7
- Privacy: 2
- Responsive: 1
- Security: 2
- Traceability Verification: 3
- UI: 12

### Count By Priority

- Critical: 2
- High: 9
- Medium: 6

### Count By Automation Layer

- Accessibility: 2
- API: 3
- Security: 2
- Traceability Verification: 3
- UI E2E: 7

### Top Automation Candidates

- Create rating then reload Place Detail and Profile derivation.
- No-rating false tried context on Places and Place Detail.
- Profile counts by deterministic place type fixture.
- Cross-user tried-context privacy.
- Responsive and accessibility certification for tried indicators/counts.

## Validation

- Duplicate Test IDs = 0
- Invalid Story References = 0
- Missing User Stories = 0
- Encoding/Mojibake = 0
- Generic Executable Wording = 0
- Requirement Fidelity Violations = 0
- Feature Ownership Violations = 0
- Disallowed Source-File Assumptions = 0
