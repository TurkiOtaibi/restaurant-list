# PLACE-020 Test Cases

Feature: `PLACE-020 - Open rating flow`

Source: `docs/user-stories/PLACE_DETAILS_USER_STORIES.md`

Supporting Sources:

- `docs/user-stories/RATINGS_USER_STORIES.md`
- `docs/feature-map/FEATURE_TRACEABILITY.md`
- `docs/user-stories/RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`

Scope: All user stories under `PLACE-020`.

## QA Execution Standards

- Test cases validate documented requirements only. Undefined rating-entry behavior must be captured as Requirement Clarification, Manual Verification, or Traceability Verification.
- `PLACE-020` owns opening the rating flow from Place Detail, passing the current place context, navigating to the rating feature, blocking unauthenticated entry, returning to the related place detail context, and refreshing detail context after a rating flow completes.
- `PLACE-020` does not own rating creation, rating editing, rating deletion, rating value validation, note validation, rating calculations, rating persistence, first-rating list cleanup, or rating API save semantics. Those belong to `RATING-*`.
- Direct `/places/{id}/rate` entry, browser Back/Forward, browser refresh while inside the flow, and restored-history behavior are not executable `PLACE-020` assertions unless explicitly documented; this file records those as clarification or traceability cases.
- Rating route traceability: `frontend/app/places/[id]/rate/page.tsx` and `frontend/src/features/places/RatePlaceDialog.tsx`.
- Place detail context endpoint from traceability: `GET /api/v1/places/{id}` with Bearer authentication.
- Rating save endpoints from traceability are referenced only for ownership boundaries: `POST /api/v1/ratings` and `PATCH /api/v1/ratings/{place_id}`.
- Executable responsive tests cite `RESP-001-US-011`, `RESP-001-US-012`, `RESP-002-US-001`, `RESP-002-US-002`, `RESP-002-US-005`, `RESP-002-US-010`, `RESP-002-US-011`, `RESP-002-US-012`, `RESP-003-US-001`, `RESP-003-US-008`, `RESP-003-US-016`, `RESP-003-US-017`, and rating-specific global accessibility requirements where applicable.
- Executable accessibility tests cite `PLACE-020-US-008`, `A11Y-001`, and `A11Y-002` where the rating flow surface is a dialog/sheet or rating control.
- Automation cadence values used in Notes: Smoke, Regression, Nightly, Manual Review.

## PLACE-020-US-001 - Open create-rating flow

User Story Summary: As an authenticated user, I want to open rating from place detail so that I can log my experience.

Related Feature ID: `PLACE-020`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-020-US-001-TC-001 | Open create-rating flow from unrated place detail | UI, Positive, Regression | Critical | Authenticated user exists; place `p_rate_new` exists; current user has no rating for the place. | `/places/p_rate_new`; action label `قيم المكان`. | 1. Sign in. 2. Open `/places/p_rate_new`. 3. Activate `قيم المكان`. | Rating flow opens for `p_rate_new` in create mode; no persisted current-user rating is shown as preselected. | PLACE-020-US-001 | Yes | UI E2E | Smoke cadence. Source: PLACE-020-US-001 and RATING-001-US-001. |
| PLACE-020-US-001-TC-002 | Create-rating navigation uses current place ID | UI, Integration, Data Integrity | Critical | Authenticated user has no rating for place `p_context_create`. | `/places/p_context_create`. | 1. Open place detail. 2. Activate rating action. 3. Inspect rating route, dialog context, or outgoing context props. | Rating flow context uses `p_context_create`; no UI text, route parameter, or rating context references a different place ID. | PLACE-020-US-001 | Yes | UI E2E | Smoke cadence. |
| PLACE-020-US-001-TC-003 | Create-rating destination matches traced rating surface | UI, Routing, Integration | High | Authenticated user has no rating for target place. | `/places/p_rate_route`. | 1. Open place detail. 2. Activate rating action. 3. Inspect the active route, dialog, or sheet identity. | The active rating surface is one of the traced Rating module consumers and its place context is `p_rate_route`; no destination context references another place. | PLACE-020-US-001 | Yes | UI E2E | Regression cadence. Source: FEATURE_TRACEABILITY rating route consumers. |
| PLACE-020-US-001-TC-004 | Create-rating flow waits for place detail context | UI, Loading, Security | High | Authenticated session exists; `GET /api/v1/places/{id}` is delayed. | `/places/p_rate_loading`. | 1. Open delayed place detail. 2. Inspect rating action before place context resolves. | Rating action is not actionable for an unresolved or unknown place context; no rating flow opens with a placeholder place ID. | PLACE-020-US-001 | Yes | UI E2E | Regression cadence. |
| PLACE-020-US-001-TC-005 | Create-rating context API returns documented response envelope | API, Contract | High | Authenticated user opens an unrated place detail. | `GET /api/v1/places/p_rate_api`. | 1. Send authenticated request. 2. Inspect status, top-level response shape, and place-detail payload. | Response status is `200 OK`; payload uses the documented single-place detail response shape, represents exactly `p_rate_api`, is not a collection response, and includes required place-context fields `id`, `name`, `type`, `subtype`, `description`, `averageRating`, `ratingCount`, `currentUserRating`, `currentUserListIds`, `currentUserListNames`, and `currentUserListCount`. | PLACE-020-US-001 | Yes | API | Regression cadence. Source: GET place detail traceability, PLACE-017 current-user context, and frontend place contract. |
| PLACE-020-US-001-TC-006 | Create-rating context response excludes forbidden fields | API, Privacy, Security | High | Authenticated user opens an unrated place detail. | `GET /api/v1/places/p_rate_privacy`. | 1. Send authenticated request. 2. Inspect response JSON recursively. | Response status is `200 OK`; response contains no other users' private notes, other users' private rating data, internal moderation fields, creator identity, session tokens, stack traces, or debug fields. | PLACE-020-US-001 | Yes | Security | Regression cadence. |
| PLACE-020-US-001-TC-007 | Direct create-rating deep link support requires clarification | Requirement Clarification, Manual | Medium | Requirements review is being performed. | `/places/{id}/rate` direct navigation. | 1. Review PLACE-020 and routing requirements. 2. Confirm whether direct navigation to the rating route is a supported user entry point or only an internal destination. | No executable direct-deep-link assertion is made until direct rating route behavior is documented. | PLACE-020-US-001 | No | Manual | Manual Review cadence. |
| PLACE-020-US-001-TC-008 | Unrated API context exposes create-mode decision fields | API, Contract, Data Integrity | High | Authenticated user opens an unrated place detail. | `GET /api/v1/places/p_unrated_contract`. | 1. Send authenticated request. 2. Inspect place identity and current-user rating context fields used by Place Detail. | Response status is `200 OK`; `id` equals `p_unrated_contract`; `currentUserRating` is `null`; response does not contain a `RatingResponse` save payload, `notes`, `userId`, `placeId`, or rating mutation timestamps. | PLACE-020-US-001 | Yes | API | Regression cadence. |

## PLACE-020-US-002 - Open edit-rating flow

User Story Summary: As a rating owner, I want place detail to open edit rating when I already rated the place so that I can update my log.

Related Feature ID: `PLACE-020`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-020-US-002-TC-001 | Open edit-rating flow for already-rated place | UI, Positive, Regression | Critical | Authenticated user has an existing rating for place `p_rate_existing`. | Existing current-user rating for `p_rate_existing`. | 1. Open `/places/p_rate_existing`. 2. Activate rating action. | Rating flow opens in edit mode for `p_rate_existing` with current-user rating context loaded. | PLACE-020-US-002 | Yes | UI E2E | Smoke cadence. Source: PLACE-020-US-002 and RATING-002-US-001. |
| PLACE-020-US-002-TC-002 | Edit-rating flow uses current place ID | UI, Integration, Data Integrity | Critical | Authenticated user has ratings for `p_rate_a` and `p_rate_b`. | Open `p_rate_b`. | 1. Open `/places/p_rate_b`. 2. Activate rating action. 3. Inspect rating flow context. | Rating flow context uses `p_rate_b`; no rating data or destination from `p_rate_a` is used. | PLACE-020-US-002 | Yes | UI E2E | Smoke cadence. |
| PLACE-020-US-002-TC-003 | Existing private note loading remains Ratings scope | Traceability Verification, Manual | Medium | QA traceability review is being performed. | RATING-004 private note requirements. | 1. Review PLACE-020 and RATING-004. 2. Confirm private-note loading in edit fields is covered by rating test packages. | PLACE-020 verifies that edit flow opens with existing context; executable tests for loading, editing, and saving note field content remain in RATING-004 coverage. | PLACE-020-US-002 | No | Manual | Manual Review cadence. |
| PLACE-020-US-002-TC-004 | Edit flow does not create rating before save | UI, Feature Ownership, Regression | High | Authenticated user has existing rating; rating action is opened but no save occurs. | Existing rating for `p_edit_no_save`. | 1. Open place detail. 2. Open edit-rating flow. 3. Close/cancel without saving. 4. Inspect rating API calls. | Opening the edit-rating flow sends no `POST /api/v1/ratings` or `PATCH /api/v1/ratings/{place_id}` save request. | PLACE-020-US-002 | Yes | UI E2E | Regression cadence. Save behavior belongs to RATING-002. |
| PLACE-020-US-002-TC-005 | PATCH-vs-POST save ownership remains Ratings scope | Traceability Verification, Manual | Medium | QA traceability review is being performed. | RATING-002 and RATING-009 requirements. | 1. Review PLACE-020 and RATING-002/RATING-009. 2. Confirm save endpoint selection is covered by rating test packages. | PLACE-020 tests verify edit flow opens with existing context; they do not duplicate rating save endpoint tests. | PLACE-020-US-002 | No | Manual | Manual Review cadence. |
| PLACE-020-US-002-TC-006 | Existing rating context response excludes forbidden fields | API, Privacy, Security | High | Authenticated user has an existing rating for place. | `GET /api/v1/places/p_existing_privacy`. | 1. Send authenticated place-detail request. 2. Inspect current-user rating context. | Response status is `200 OK`; current-user rating context contains only fields documented for the current user and excludes other users' private notes, raw user records, internal audit fields, stack traces, and debug fields. | PLACE-020-US-002 | Yes | Security | Regression cadence. |
| PLACE-020-US-002-TC-007 | Rated API context exposes edit-mode decision fields | API, Contract, Data Integrity | High | Authenticated user has an existing rating for place `p_rated_contract`. | `GET /api/v1/places/p_rated_contract`. | 1. Send authenticated request. 2. Inspect place identity and current-user rating context fields used by Place Detail. | Response status is `200 OK`; `id` equals `p_rated_contract`; `currentUserRating` is populated for the authenticated user; `currentUserRating` is `true`; response excludes other users' private rating data, raw user records, and rating save mutation payloads. | PLACE-020-US-002 | Yes | API | Regression cadence. |

## PLACE-020-US-003 - Rating action reflects current state

User Story Summary: As a user, I want the rating action label/state to match whether I have rated the place so that I understand what will happen.

Related Feature ID: `PLACE-020`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-020-US-003-TC-001 | Unrated place shows create-rating action | UI, Positive | High | Authenticated user has no rating for place. | `/places/p_unrated_action`; label `قيم المكان`. | 1. Open place detail. 2. Inspect rating action. | Rating action presents the documented create-rating label `قيم المكان` for the unrated place. | PLACE-020-US-003 | Yes | UI E2E | Smoke cadence. |
| PLACE-020-US-003-TC-002 | Rated place shows edit or current-rating context | UI, Positive | High | Authenticated user has rated place with value `8.5`. | `/places/p_rated_action`. | 1. Open place detail. 2. Inspect rating action and personal rating context. | Rating action indicates editing or displays current-user rating context; it does not present the place as unrated. | PLACE-020-US-003 | Yes | UI E2E | Smoke cadence. |
| PLACE-020-US-003-TC-003 | Rating action state is not rendered from stale previous place | UI, Data Integrity, Regression | High | Authenticated user rated `p_state_a` but not `p_state_b`. | Navigate from `p_state_a` to `p_state_b`. | 1. Open rated place `p_state_a`. 2. Navigate to unrated place `p_state_b`. 3. Inspect rating action after `p_state_b` detail loads. | `p_state_b` shows create-rating action; edit state from `p_state_a` is not shown. | PLACE-020-US-003 | Yes | UI E2E | Regression cadence. |
| PLACE-020-US-003-TC-004 | Loading state does not expose wrong rating action | UI, Loading, Data Integrity | Medium | Detail request is delayed after route change. | Rated source place, unrated target place. | 1. Navigate between places while target detail loads. 2. Inspect rating action during loading. | During unresolved target detail state, activating the rating action is impossible and no rating flow opens with stale source-place context. | PLACE-020-US-003 | Yes | UI E2E | Regression cadence. |
| PLACE-020-US-003-TC-005 | Rating action does not expose private note text | UI, Privacy, Security | High | Current user has rating with private note. | Private note `private family dinner`. | 1. Open place detail. 2. Inspect rating action visible text, DOM, and accessibility name. | Rating action indicates rated/edit state and the private note text is absent from action visible text, hidden text, and accessibility name. | PLACE-020-US-003 | Yes | Security | Regression cadence. |
| PLACE-020-US-003-TC-006 | Exact edit-action copy requires clarification | Requirement Clarification, Manual | Low | Requirements review is being performed. | Edit action label/state. | 1. Review PLACE-020-US-003 and Arabic UX copy requirements. 2. Confirm approved edit-rating label. | Executable tests assert create/edit state correctness; exact edit label copy is not asserted until documented. | PLACE-020-US-003 | No | Manual | Manual Review cadence. |

## PLACE-020-US-004 - Unauthorized rating action blocked

User Story Summary: As the system, I want guests blocked from rating so that ratings are tied to authenticated users.

Related Feature ID: `PLACE-020`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-020-US-004-TC-001 | Guest cannot open rating flow from place detail | UI, Authentication, Security | Critical | No valid session exists. | `/places/p_guest_rate`. | 1. Open place detail as guest or simulate guest detail denial. 2. Attempt to activate rating entry if visible. | Guest sees an auth-required state and no rating flow opens; no protected place/rating context appears in visible UI, DOM, or accessibility tree. | PLACE-020-US-004 | Yes | UI E2E | Smoke cadence. |
| PLACE-020-US-004-TC-002 | Guest place-detail API request is unauthorized | API, Authentication, Security | Critical | No valid session exists. | `GET /api/v1/places/p_guest_rate`. | 1. Send request without Bearer token. 2. Inspect response. | Response status is `401 Unauthorized`; no place detail, current-user rating context, private note, or rating flow context is returned. | PLACE-020-US-004 | Yes | API | Smoke cadence. |
| PLACE-020-US-004-TC-003 | Guest direct rating route behavior requires clarification | Requirement Clarification, Manual | Medium | Requirements review is being performed. | `/places/{id}/rate` direct navigation as guest. | 1. Review PLACE-020 direct-route requirements. 2. Confirm whether guest direct-route entry is a supported executable route. | No executable guest direct-route assertion is made until direct rating route behavior is documented. | PLACE-020-US-004 | No | Manual | Manual Review cadence. |
| PLACE-020-US-004-TC-004 | Expired session cannot open rating flow | UI, Authentication, Security | Critical | User token is expired before rating action opens. | `/places/p_expired_rate`. | 1. Open place detail with expired token. 2. Attempt to open rating flow. 3. Inspect UI and network. | Rating flow does not open with protected context; request requiring auth returns `401 Unauthorized`; no private rating data remains visible. | PLACE-020-US-004 | Yes | Security | Regression cadence. |
| PLACE-020-US-004-TC-005 | Auth resolution does not flash private rating data | UI, Privacy, Security | Critical | Auth state is unresolved; prior authenticated user had a private note. | Private note `Anniversary dinner`; delayed auth resolution. | 1. Load place detail while auth is unresolved. 2. Observe first paint through auth-denial or auth-success state. 3. Inspect DOM and accessibility snapshots. | Before valid auth resolution, no private note, current-user rating context, or rating form fields render in visible UI, DOM, or accessibility tree. | PLACE-020-US-004 | Yes | Security | Smoke cadence. |
| PLACE-020-US-004-TC-006 | Auth recovery preserves place context after valid sign-in | UI, Authentication, Integration | High | Guest attempts rating and is shown an auth-required state. | `/places/p_auth_recover`. | 1. Attempt rating as guest from place detail. 2. Complete sign-in. 3. Inspect the next accessible rating entry point or opened rating surface. | Rating entry is unavailable before authentication; after valid sign-in, the available rating entry or opened rating surface is associated only with `p_auth_recover`. | PLACE-020-US-004 | Yes | UI E2E | Regression cadence. |
| PLACE-020-US-004-TC-007 | Rating submit auth errors remain Ratings scope | Traceability Verification, Manual | Medium | QA traceability review is being performed. | `POST /api/v1/ratings`, `PATCH /api/v1/ratings/{place_id}`. | 1. Review PLACE-020 and RATING-001/RATING-002. 2. Confirm rating submit auth tests are covered in rating packages. | PLACE-020 covers opening authorization; rating submit authorization is not duplicated as executable PLACE-020 coverage. | PLACE-020-US-004 | No | Manual | Manual Review cadence. |
| PLACE-020-US-004-TC-008 | Unauthorized place-detail API error schema is privacy-safe | API, Authentication, Security, Contract | Critical | No valid session exists. | `GET /api/v1/places/p_guest_schema`. | 1. Send request without Bearer token. 2. Inspect status and error payload recursively. | Response status is `401 Unauthorized`; error payload follows the documented error schema and contains no place fields, current-user rating fields, private notes, tokens, stack traces, debug fields, or internal IDs. | PLACE-020-US-004 | Yes | API | Smoke cadence. |

## PLACE-020-US-005 - Return from rating flow

User Story Summary: As a user, I want to return to place detail after rating so that I can confirm the updated context.

Related Feature ID: `PLACE-020`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-020-US-005-TC-001 | Cancel create-rating flow returns to same place detail | UI, Navigation, Regression | High | Authenticated user has no rating for place `p_cancel_create`. | `/places/p_cancel_create`. | 1. Open rating flow. 2. Cancel without saving. | The related place detail context for `p_cancel_create` is active after cancel; no `POST /api/v1/ratings` save request is sent. | PLACE-020-US-005 | Yes | UI E2E | Regression cadence. |
| PLACE-020-US-005-TC-002 | Cancel edit-rating flow returns to same place detail | UI, Navigation, Regression | High | Authenticated user has existing rating for place `p_cancel_edit`. | `/places/p_cancel_edit`. | 1. Open edit-rating flow. 2. Cancel without saving. | The related place detail context for `p_cancel_edit` is active after cancel; no `PATCH /api/v1/ratings/{place_id}` save request is sent. | PLACE-020-US-005 | Yes | UI E2E | Regression cadence. |
| PLACE-020-US-005-TC-003 | Successful rating completion returns to related place detail | UI, Integration, Navigation | High | Rating package fixture can complete a successful create or edit. | Place `p_rating_complete`. | 1. Open rating flow from `/places/p_rating_complete`. 2. Complete rating save through rating fixture. 3. Observe navigation after completion. | After rating package reports successful completion, app returns to the related place detail context for `p_rating_complete`. | PLACE-020-US-005 | Yes | UI E2E | Regression cadence. Save internals remain RATING-* scope. |
| PLACE-020-US-005-TC-004 | Return navigation does not duplicate rating surfaces | UI, Navigation, Regression | Medium | Authenticated user opens rating flow from detail. | Place `p_no_duplicate_nav`. | 1. Open rating flow. 2. Cancel or complete through fixture. 3. Inspect active UI surfaces. | Exactly one related place detail context is active after return; no duplicate rating route, dialog, or sheet remains mounted in the DOM or accessibility tree. | PLACE-020-US-005 | Yes | UI E2E | Regression cadence. |
| PLACE-020-US-005-TC-005 | Browser navigation and refresh behavior require clarification | Requirement Clarification, Manual | Medium | Requirements review is being performed. | Rating flow as route, dialog, or sheet. | 1. Review PLACE-020 navigation requirements. 2. Confirm expected browser Back, Forward, refresh, and restored-history behavior for the rating flow. | No executable browser Back, Forward, refresh, or restored-history assertion is made until rating-flow history behavior is documented. | PLACE-020-US-005 | No | Manual | Manual Review cadence. |
| PLACE-020-US-005-TC-006 | Return destination after deep link requires clarification | Requirement Clarification, Manual | Low | Requirements review is being performed. | Direct `/places/{id}/rate` entry. | 1. Review routing requirements. 2. Confirm return destination when rating flow was opened directly. | No executable return-destination assertion is made for direct rating route entry until documented. | PLACE-020-US-005 | No | Manual | Manual Review cadence. |

## PLACE-020-US-006 - Detail refresh after rating

User Story Summary: As a user, I want place detail updated after rating so that my rating and community data are current.

Related Feature ID: `PLACE-020`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-020-US-006-TC-001 | Detail context refreshes after create-rating completion signal | UI, Integration, Regression | High | Authenticated user has no rating; Ratings module fixture reports successful create completion. | Place `p_refresh_create`. | 1. Open rating flow from detail. 2. Complete successful create through the Ratings fixture. 3. Observe place detail after return. | Place detail requests or revalidates `GET /api/v1/places/p_refresh_create`; final current-user rating context is not the stale pre-open absence state. | PLACE-020-US-006 | Yes | UI E2E | Regression cadence. Does not validate rating value rules or persistence. |
| PLACE-020-US-006-TC-002 | Detail context refreshes after edit-rating completion signal | UI, Integration, Regression | High | Authenticated user has existing rating; Ratings module fixture reports successful edit completion. | Place `p_refresh_edit`. | 1. Open edit flow. 2. Complete successful edit through the Ratings fixture. 3. Observe place detail after return. | Place detail requests or revalidates `GET /api/v1/places/p_refresh_edit`; final current-user rating context is loaded for `p_refresh_edit` after the completion signal. | PLACE-020-US-006 | Yes | UI E2E | Regression cadence. |
| PLACE-020-US-006-TC-003 | Community rating context refresh is triggered after rating completion | UI, Integration, Data Integrity | High | Rating package fixture completes create or edit and aggregate context is available from place detail. | Place `p_refresh_aggregate`. | 1. Open rating flow. 2. Complete successful rating fixture. 3. Observe follow-up place detail request or refreshed context. | App requests or revalidates place detail/current-user context for `p_refresh_aggregate`; stale pre-rating aggregate context is not kept as final data. | PLACE-020-US-006 | Yes | UI E2E | Regression cadence. Aggregate math belongs to RATING-008. |
| PLACE-020-US-006-TC-004 | Failed rating flow does not show false refreshed detail | UI, Error Handling, Integration | Medium | Ratings module fixture reports failed completion. | Place `p_refresh_fail`. | 1. Open rating flow. 2. Trigger rating package failure. 3. Inspect place detail state after the failure signal. | Place detail does not replace current-user rating or aggregate context with a false success state after failed rating completion. | PLACE-020-US-006 | Yes | UI E2E | Regression cadence. |
| PLACE-020-US-006-TC-005 | Rating value and aggregate calculation tests remain Ratings scope | Traceability Verification, Manual | Medium | QA traceability review is being performed. | RATING-003 and RATING-008. | 1. Review PLACE-020 and Ratings requirements. 2. Confirm rating scale, rounding, averages, counts, and precision are covered by rating packages. | PLACE-020 tests verify refresh orchestration only; they do not duplicate rating calculation or validation tests. | PLACE-020-US-006 | No | Manual | Manual Review cadence. |

## PLACE-020-US-007 - Mobile rating entry

User Story Summary: As a mobile user, I want the rating entry point and flow usable without layout issues.

Related Feature ID: `PLACE-020`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-020-US-007-TC-001 | Rating entry is reachable at 320x568 | Responsive, Mobile | High | Authenticated user opens place detail. | Viewport `320x568`; place `p_mobile_320`. | 1. Set viewport to `320x568`. 2. Open place detail. 3. Locate rating action. | Rating action is visible or reachable without horizontal scrolling; final action is not obscured by bottom navigation or safe-area padding. | PLACE-020-US-007 | Yes | UI E2E | Smoke cadence. Source: RESP-001-US-011, RESP-001-US-012, RESP-002-US-001, RESP-002-US-002. |
| PLACE-020-US-007-TC-002 | Rating entry is reachable at 390x844 | Responsive, Mobile | High | Authenticated user opens place detail. | Viewport `390x844`. | 1. Set viewport to `390x844`. 2. Open place detail. 3. Locate and activate rating action. | Rating action is reachable; rating flow opens for current place; `document.documentElement.scrollWidth <= window.innerWidth`. | PLACE-020-US-007 | Yes | UI E2E | Regression cadence. Source: RESP-002-US-001 and RESP-002-US-002. |
| PLACE-020-US-007-TC-003 | Rating entry is reachable at 430x932 | Responsive, Mobile | High | Authenticated user opens place detail. | Viewport `430x932`. | 1. Set viewport to `430x932`. 2. Open place detail. 3. Locate and activate rating action. | Rating action is reachable; rating flow opens for current place; no horizontal overflow occurs. | PLACE-020-US-007 | Yes | UI E2E | Regression cadence. |
| PLACE-020-US-007-TC-004 | Rating flow supports phone landscape | Responsive, Mobile, Landscape | High | Authenticated user opens rating flow from detail. | Viewport `844x390`. | 1. Set phone landscape viewport. 2. Open place detail. 3. Activate rating action. | Rating flow title, close/cancel, rating entry controls, and primary action are visible or reachable through internal scrolling; no horizontal overflow occurs. | PLACE-020-US-007 | Yes | UI E2E | Regression cadence. Source: RESP-002-US-012. |
| PLACE-020-US-007-TC-005 | Rating flow supports 200% zoom | Responsive, Accessibility, Low Vision | High | Authenticated user opens rating flow. | Browser zoom `200%`. | 1. Set browser zoom to `200%`. 2. Open rating flow from detail. 3. Navigate through rating entry controls. | Rating flow remains operable; core controls remain reachable; `document.documentElement.scrollWidth <= window.innerWidth`; interactive controls retain at least `44x44` CSS pixel hit area. | PLACE-020-US-007 | Yes | Accessibility | Regression cadence. Source: RESP-003-US-001, RESP-003-US-008, A11Y-002-US-012. |
| PLACE-020-US-007-TC-006 | Rating flow respects safe areas and bottom navigation | Responsive, Mobile | High | Mobile viewport has bottom navigation and safe-area inset. | `320x568` with safe-area simulation. | 1. Open place detail. 2. Open rating flow. 3. Scroll to final action. | Final rating-flow action and close/cancel controls are not obscured by bottom navigation, browser UI, or safe-area padding. | PLACE-020-US-007 | Yes | UI E2E | Regression cadence. Source: RESP-001-US-011, RESP-001-US-012, RESP-002-US-005, A11Y-001-US-013. |
| PLACE-020-US-007-TC-007 | Rating flow forced-colors mode remains distinguishable | Accessibility, Responsive | Medium | Rating flow is open; forced-colors/high-contrast mode is active. | Selected/unselected rating states. | 1. Enable forced-colors mode. 2. Open rating flow. 3. Inspect text, controls, selected state, and focus indicators. | Text, controls, selected state, disabled state if present, and focus indicators remain distinguishable without color-only meaning. | PLACE-020-US-007 | Yes | Accessibility | Regression cadence. Source: RESP-003-US-014, RESP-003-US-015, A11Y-002-US-017. |
| PLACE-020-US-007-TC-008 | Rating flow honors reduced motion | Accessibility, Responsive | Medium | Rating flow has transitions or rating selection feedback. | `prefers-reduced-motion: reduce`. | 1. Enable reduced motion. 2. Open rating flow. 3. Interact with rating entry controls. | Nonessential transitions and rating animations are removed or minimized; rating entry remains operable through documented controls. | PLACE-020-US-007 | Yes | Accessibility | Regression cadence. Source: RESP-003-US-016, RESP-003-US-017, A11Y-002-US-016. |

## PLACE-020-US-008 - Accessible rating entry

User Story Summary: As a keyboard or screen-reader user, I want the rating action accessible.

Related Feature ID: `PLACE-020`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-020-US-008-TC-001 | Rating action has accessible name | Accessibility, Screen Reader | High | Place detail renders for authenticated user. | Action `قيم المكان` or edit equivalent. | 1. Open place detail. 2. Inspect rating action accessibility name. | Rating action has a non-empty accessible name that communicates rating the current place. | PLACE-020-US-008 | Yes | Accessibility | Smoke cadence. |
| PLACE-020-US-008-TC-002 | Rating action is keyboard reachable and activates with Enter | Accessibility, Keyboard | Critical | Place detail renders for authenticated user. | Keyboard only. | 1. Tab to rating action. 2. Press Enter. | Focus reaches the rating action with visible focus; Enter opens the rating flow for the current place. | PLACE-020-US-008 | Yes | Accessibility | Smoke cadence. |
| PLACE-020-US-008-TC-003 | Rating action Space behavior requires clarification | Requirement Clarification, Manual | Low | Requirements review is being performed. | Button vs link implementation. | 1. Review semantic element for rating action. 2. Confirm whether Space activation is required by chosen element semantics. | Enter activation is executable; Space activation is not asserted until the control semantics are documented. | PLACE-020-US-008 | No | Manual | Manual Review cadence. |
| PLACE-020-US-008-TC-004 | Focus-visible is shown on rating action | Accessibility, Keyboard, UI | High | Place detail renders for authenticated user. | Keyboard navigation. | 1. Tab to rating action. 2. Inspect focus indicator. | Rating action shows visible `focus-visible` indicator that is not confused with selected/rated state. | PLACE-020-US-008 | Yes | Accessibility | Regression cadence. |
| PLACE-020-US-008-TC-005 | Rating flow receives initial focus after opening | Accessibility, Keyboard | High | Rating flow opens from the place detail rating action. | Open from rating action. | 1. Focus rating action. 2. Open rating flow. 3. Inspect active element. | Initial focus moves to the rating-flow heading, first rating control, or another safe initial focus target inside the active rating surface. | PLACE-020-US-008 | Yes | Accessibility | Regression cadence. Source: A11Y-001-US-003. |
| PLACE-020-US-008-TC-006 | Modal rating flow traps focus when rendered as dialog or sheet | Accessibility, Keyboard | High | Rating flow is rendered as modal dialog or modal sheet. | Open rating flow. | 1. Open rating flow. 2. Press Tab and Shift+Tab repeatedly. | Focus remains inside the active modal rating flow until the modal is closed. | PLACE-020-US-008 | Yes | Accessibility | Regression cadence. Source: A11Y-001-US-004 and A11Y-001-US-005. |
| PLACE-020-US-008-TC-007 | Focus restores after cancel | Accessibility, Keyboard | High | Rating flow opened from place detail action; the triggering rating action remains mounted after cancel. | Cancel rating flow. | 1. Focus rating action. 2. Open rating flow. 3. Cancel without saving. | Focus returns to the triggering rating action on the related place detail. | PLACE-020-US-008 | Yes | Accessibility | Regression cadence. Source: A11Y-001-US-006. |
| PLACE-020-US-008-TC-008 | Rating flow loading state is announced | Accessibility, Loading | Medium | Rating route or context load is delayed. | Delayed rating context. | 1. Open rating flow. 2. Inspect accessibility tree/status output while loading. | Loading state is communicated with `aria-busy`, status text, or equivalent accessible status without relying only on animation. | PLACE-020-US-008 | Yes | Accessibility | Regression cadence. Source: A11Y-001-US-016. |
| PLACE-020-US-008-TC-009 | Rating flow error is announced | Accessibility, Error Handling | High | Rating flow context fails to load. | Failed context request. | 1. Open rating flow. 2. Simulate load failure. 3. Inspect accessibility tree/status output. | Error feedback is programmatically available to assistive technology; retry or close/recovery control is keyboard reachable. | PLACE-020-US-008 | Yes | Accessibility | Regression cadence. |
| PLACE-020-US-008-TC-010 | Background is inert while modal rating flow is open | Accessibility, Security | High | Rating flow renders as modal dialog or sheet. | Background place detail controls. | 1. Open rating flow. 2. Attempt keyboard, pointer, and screen-reader navigation to background content. | Background place detail controls are not reachable or actionable while modal rating flow is open. | PLACE-020-US-008 | Yes | Accessibility | Regression cadence. Source: A11Y-001-US-010. |
| PLACE-020-US-008-TC-011 | Rating flow touch targets meet minimum size | Accessibility, Mobile, Touch | High | Rating flow is open on mobile. | Viewport `320x568`. | 1. Measure rating entry action, rating controls, cancel/close controls, retry controls, and primary action targets. | Every interactive control has at least `44x44` CSS pixel hit area. | PLACE-020-US-008 | Yes | Accessibility | Regression cadence. Source: RESP-003-US-008 and A11Y-002-US-010. |

## PLACE-020-US-009 - Rating flow open error

User Story Summary: As a user, I want a clear error if the rating flow cannot load so that I understand the action failed.

Related Feature ID: `PLACE-020`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-020-US-009-TC-001 | Invalid place context prevents rating flow | UI, Error Handling, Negative | High | Authenticated user exists; rating flow receives invalid or malformed place context from the supported entry point. | Invalid place-context fixture. | 1. Attempt to open rating flow for invalid place context. 2. Inspect UI state. | Rating form does not render with fake place data; a visible error state tied to the invalid place context is shown. | PLACE-020-US-009 | Yes | UI E2E | Regression cadence. Malformed direct-route status is not asserted. |
| PLACE-020-US-009-TC-002 | Nonexistent place detail API returns 404 | API, Negative, Error Handling | High | Authenticated user exists; place ID does not exist. | `GET /api/v1/places/p_missing_rate`. | 1. Send authenticated request. 2. Inspect response. | Response status is `404 Not Found`; no rating flow context, private data, or fake place data is returned. | PLACE-020-US-009 | Yes | API | Regression cadence. |
| PLACE-020-US-009-TC-003 | Deleted place cannot open rating flow | UI, Error Handling, Negative | High | Place was deleted or unavailable before rating flow opens. | Place `p_deleted_rate`. | 1. Attempt to open rating flow from a stale detail context or supported entry point for `p_deleted_rate`. 2. Inspect UI and network. | Rating form does not render; a visible unavailable-place error state is shown without fake place context. | PLACE-020-US-009 | Yes | UI E2E | Regression cadence. |
| PLACE-020-US-009-TC-004 | Rating flow context load failure preserves place detail context | UI, Error Handling, Regression | Medium | Place detail is visible; rating context load fails with network or 5xx error. | Place `p_rate_open_fail`. | 1. Open place detail. 2. Activate rating action. 3. Simulate rating-flow context load failure. | Error state appears for the failed rating-open attempt; the related place detail context for `p_rate_open_fail` remains recoverable through the visible close, cancel, or retry path; no false rating form is shown. | PLACE-020-US-009 | Yes | UI E2E | Regression cadence. |
| PLACE-020-US-009-TC-005 | Retry after rating flow open failure reloads same place context | UI, Error Handling, Regression | Medium | First rating-flow open attempt fails; second attempt succeeds. | Place `p_rate_retry`. | 1. Open rating flow and simulate context failure. 2. Activate retry. 3. Allow context load to succeed. | Retry requests context for `p_rate_retry`; rating flow opens for `p_rate_retry`; stale failed state is removed. | PLACE-020-US-009 | Yes | UI E2E | Regression cadence. |
| PLACE-020-US-009-TC-006 | Rating flow error response excludes sensitive fields | API, Privacy, Security | High | Authenticated user requests missing place or failing context endpoint. | `GET /api/v1/places/p_missing_rate`. | 1. Send request that returns `404 Not Found`. 2. Inspect error response JSON. | Response status is `404 Not Found`; error payload contains no private notes, other users' rating data, creator identity, SQL details, stack traces, tokens, or debug fields. | PLACE-020-US-009 | Yes | Security | Regression cadence. |
| PLACE-020-US-009-TC-007 | Rating save validation errors remain Ratings scope | Traceability Verification, Manual | Medium | QA traceability review is being performed. | RATING-003, RATING-004, RATING-009. | 1. Review PLACE-020 and Ratings requirements. 2. Confirm save validation, note validation, persistence, and aggregate correctness are covered by rating test files. | PLACE-020 covers rating flow open errors only; rating save errors are not duplicated as executable PLACE-020 tests. | PLACE-020-US-009 | No | Manual | Manual Review cadence. |
| PLACE-020-US-009-TC-008 | Not-found API error schema is deterministic and privacy-safe | API, Contract, Privacy, Security | High | Authenticated user requests a nonexistent place. | `GET /api/v1/places/p_missing_schema`. | 1. Send authenticated request. 2. Inspect status and error payload recursively. | Response status is `404 Not Found`; error payload follows the documented error schema and contains no fake place object, current-user rating context, private notes, creator identity, stack traces, debug fields, tokens, or internal IDs. | PLACE-020-US-009 | Yes | API | Regression cadence. |

## Final Summary

1. User stories processed: 9
2. Total executable test cases: 56
3. Clarification / Manual / Traceability cases: 11
4. Test count per user story:
   - `PLACE-020-US-001`: 8
   - `PLACE-020-US-002`: 7
   - `PLACE-020-US-003`: 6
   - `PLACE-020-US-004`: 8
   - `PLACE-020-US-005`: 6
   - `PLACE-020-US-006`: 5
   - `PLACE-020-US-007`: 8
   - `PLACE-020-US-008`: 11
   - `PLACE-020-US-009`: 8
5. Count by test type:
   - API: 10
   - UI: 29
   - Accessibility: 13
   - Responsive: 8
   - Mobile: 6
   - Security: 12
   - Privacy: 6
   - Integration: 9
   - Data Integrity: 7
   - Error Handling: 7
   - Loading: 3
   - Navigation: 4
   - Routing: 1
   - Regression: 11
   - Authentication: 5
   - Negative: 3
   - Positive: 4
   - Contract: 5
   - Feature Ownership: 1
   - Keyboard: 5
   - Landscape: 1
   - Low Vision: 1
   - Screen Reader: 1
   - Touch: 1
   - Requirement Clarification: 6
   - Traceability Verification: 5
   - Manual: 11
6. Count by priority:
   - Critical: 10
   - High: 38
   - Medium: 16
   - Low: 3
7. Count by automation layer:
   - API: 7
   - UI E2E: 30
   - Accessibility: 13
   - Security: 6
   - Manual: 11
8. Top automation candidates:
   - `PLACE-020-US-001-TC-001` - Open create-rating flow from unrated place detail
   - `PLACE-020-US-001-TC-002` - Create-rating navigation uses current place ID
   - `PLACE-020-US-001-TC-005` - Create-rating context API returns documented response envelope
   - `PLACE-020-US-001-TC-008` - Unrated API context exposes create-mode decision fields
   - `PLACE-020-US-002-TC-001` - Open edit-rating flow for already-rated place
   - `PLACE-020-US-002-TC-007` - Rated API context exposes edit-mode decision fields
   - `PLACE-020-US-004-TC-002` - Guest place-detail API request is unauthorized
   - `PLACE-020-US-004-TC-008` - Unauthorized place-detail API error schema is privacy-safe
   - `PLACE-020-US-004-TC-005` - Auth resolution does not flash private rating data
   - `PLACE-020-US-006-TC-001` - Detail context refreshes after create-rating completion signal
   - `PLACE-020-US-007-TC-001` - Rating entry is reachable at 320x568
   - `PLACE-020-US-008-TC-002` - Rating action is keyboard reachable and activates with Enter
   - `PLACE-020-US-009-TC-002` - Nonexistent place detail API returns 404
   - `PLACE-020-US-009-TC-008` - Not-found API error schema is deterministic and privacy-safe

## Validation

- Duplicate Test IDs = 0
- Invalid Story References = 0
- Missing User Stories = 0
- Encoding/Mojibake = 0
- API Tests Missing Status Codes = 0
- Requirement Fidelity Violations = 0
- Feature Ownership Violations = 0
