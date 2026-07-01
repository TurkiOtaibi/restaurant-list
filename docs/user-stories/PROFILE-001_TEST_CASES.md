# PROFILE-001 Test Cases - View list/rating/rated counts

## Source Requirements

- Feature: `PROFILE-001 - View list/rating/rated counts`
- Sources: `PROFILE_USER_STORIES.md`, `FEATURE_TRACEABILITY.md`, `RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`
- Endpoint under test: `GET /api/v1/profile`
- Documented statuses: `200 OK`, `401 Unauthorized`, `500 Error`
- User stories processed: `PROFILE-001-US-001` through `PROFILE-001-US-024`

## Deterministic Fixtures

### Fixture PROFILE-001-A - Authenticated Summary

- User: `user-profile-001`
- Authenticated state: valid bearer session `bearer-profile-001`
- Request: `GET /api/v1/profile`
- Payload: none
- Initial database state:
  - Lists owned by `user-profile-001`: `list-001`, `list-002`, `list-003`
  - Rating rows owned by `user-profile-001`: `rating-001`, `rating-002`, `rating-003`, `rating-004`
  - Rated restaurant places: `place-rest-001`, `place-rest-002`
  - Rated cafe places: `place-cafe-001`
  - Rated ice cream places: `place-ice-001`
  - Unrated list-only place: `place-rest-unrated-001`
- Expected `200 OK` response assertions:
  - `ratingsCount=4`
  - `listsCount=3`
  - `ratedRestaurantCount=2`
  - `ratedCafeCount=1`
  - `ratedIceCreamCount=1`
  - `Array.isArray(userRatings)=true`
  - `Array.isArray(publicListsSummary)=true`
  - `userRatings.length=4`
  - `publicListsSummary.length=1`
- Forbidden response field documented for this feature: `triedPlaces`.
- Nested `userRatings` item schema belongs to archive/note coverage and is not asserted by PROFILE-001 summary tests.
- Nested `publicListsSummary` item schema belongs to public-list summary coverage and is not asserted by PROFILE-001 summary tests.
- Expected UI state: `/profile` shows summary counts `3`, `4`, `2`, `1`, `1` using Western digits; no Arabic-Indic digits appear.

### Fixture PROFILE-001-B - Empty Profile

- User: `user-profile-empty-001`
- Authenticated state: valid bearer session `bearer-profile-empty-001`
- Initial database state: 0 owned lists, 0 ratings, 0 public lists
- Request: `GET /api/v1/profile`
- Payload: none
- Expected `200 OK` response body:

```json
{
  "ratingsCount": 0,
  "listsCount": 0,
  "ratedRestaurantCount": 0,
  "ratedCafeCount": 0,
  "ratedIceCreamCount": 0,
  "userRatings": [],
  "publicListsSummary": []
}
```

- Expected UI state: all summary counters display `0`; empty collections render intentional empty states and no fake rows.

### Fixture PROFILE-001-C - Unauthorized Profile Request

- User: none
- Authenticated state: guest or expired session
- Request: `GET /api/v1/profile`
- Payload: none
- Expected response: `401 Unauthorized`
- Forbidden response fields: `ratingsCount`, `listsCount`, `ratedRestaurantCount`, `ratedCafeCount`, `ratedIceCreamCount`, `userRatings`, `publicListsSummary`, `triedPlaces`, `notes`.
- Expected UI state: signed-out prompt/state only; no previous summary count, archive row, note, or public-list summary is visible.

### Fixture PROFILE-001-D - Server Failure

- User: `user-profile-001`
- Authenticated state: valid bearer session `bearer-profile-001`
- Request: `GET /api/v1/profile`
- Payload: none
- Expected response: `500 Error` with safe error payload
- Forbidden response fields: all profile fields, private note canary `private-note-profile-001`, `triedPlaces`, and raw profile/rating payload values.
- Expected UI state: profile-level error state with one retry control and no fake counts.

## Executable Test Cases

| Test Case ID | Test Title | Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| PROFILE-001-TC-001 | Authenticated profile summary fetch returns documented counts | Positive, API, UI | Critical | Fixture PROFILE-001-A is seeded and `user-profile-001` is authenticated. | Request `GET /api/v1/profile`; payload none; expected counts `ratingsCount=4`, `listsCount=3`, `ratedRestaurantCount=2`, `ratedCafeCount=1`, `ratedIceCreamCount=1`; expected arrays `userRatings` and `publicListsSummary`. | Open `/profile`; capture the network request and response. | API status is `200 OK`; response includes all seven required top-level fields; all five count fields have exact values; `userRatings` and `publicListsSummary` are arrays; UI shows the exact `ratingsCount=4`, `listsCount=3`, and rated counters `2`, `1`, `1`; `triedPlaces` is absent. | PROFILE-001-US-001, PROFILE-001-US-002, PROFILE-001-US-005, PROFILE-001-US-007 | Yes | API, UI E2E |
| PROFILE-001-TC-002 | Guest profile access returns no profile data | Negative, Security, API | Critical | Fixture PROFILE-001-C is active with no valid session. | Request `GET /api/v1/profile`; payload none. | Request the endpoint as guest and render `/profile`. | API status is `401 Unauthorized`; none of the profile fields are present; UI displays signed-out state and zero private profile elements. | PROFILE-001-US-003 | Yes | API, Security |
| PROFILE-001-TC-003 | Expired session during profile load clears private summary | Negative, Security, UI | Critical | Browser initially contains rendered Fixture PROFILE-001-A data, then session becomes expired before revalidation. | Revalidation request `GET /api/v1/profile`; payload none; expected `401 Unauthorized`; stale private canaries are count `4` and note `private-note-profile-001`. | Trigger profile revalidation. | API status is `401 Unauthorized`; before signed-out UI appears, DOM never contains stale summary count `4`, archive row content, note canary `private-note-profile-001`, or public-list summary content. | PROFILE-001-US-004, PROFILE-001-US-020 | Yes | UI E2E, Security |
| PROFILE-001-TC-004 | Empty profile returns zero counts and empty arrays | Boundary, API, UI | High | Fixture PROFILE-001-B is seeded and authenticated. | Request `GET /api/v1/profile`; payload none; expected empty arrays. | Open `/profile` and inspect response. | API status is `200 OK`; `userRatings=[]` and `publicListsSummary=[]`; all count values are `0`; UI shows all counts as `0` with no fake data or broken layout. | PROFILE-001-US-014, PROFILE-001-US-015 | Yes | API, UI E2E |
| PROFILE-001-TC-005 | List count excludes deleted owned list after profile refresh | Regression, Integration | High | `user-profile-001` had 3 lists; profile refresh fixture after documented deletion contains `list-001`, `list-002` only. | Request `GET /api/v1/profile`; payload none; expected `listsCount=2`. | Refresh `/profile` after the documented list deletion end state is present. | API status is `200 OK`; `listsCount` is `2`; UI list-count card displays `2`; deleted list id `list-003` is absent from `publicListsSummary`. | PROFILE-001-US-006 | Yes | API, UI E2E |
| PROFILE-001-TC-006 | Rating update does not increase ratings count | Regression, Data Integrity | Critical | `rating-001` exists for `user-profile-001`; profile refresh fixture contains the same four rating row IDs after update. | Request `GET /api/v1/profile`; payload none; expected `ratingsCount=4`. | Refresh `/profile` after the documented rating update end state is present. | API status is `200 OK`; `ratingsCount` remains `4`; `userRatings` contains exactly four unique rating IDs; UI rating-count card displays `4`. | PROFILE-001-US-008 | Yes | API, UI E2E |
| PROFILE-001-TC-007 | First rating creation increases ratings count by one | Regression, Data Integrity | High | Before state has `ratingsCount=4`; after documented first-rating end state adds `rating-005` for `place-rest-003`. | Request `GET /api/v1/profile`; payload none; expected `ratingsCount=5`. | Refresh `/profile` after the documented new-rating end state is present. | API status is `200 OK`; `ratingsCount=5`; `userRatings` includes `rating-005`; UI rating-count card displays `5`. | PROFILE-001-US-009 | Yes | API, UI E2E |
| PROFILE-001-TC-008 | Rated counts derive only from rating rows | Data Integrity, API | Critical | Fixture PROFILE-001-A includes one unrated restaurant place in a list. | Request `GET /api/v1/profile`; payload none; expected rated restaurant count `2`. | Request the endpoint and inspect counts. | API status is `200 OK`; `ratedRestaurantCount=2`, not `3`; unrated `place-rest-unrated-001` does not appear in `userRatings`; UI restaurant rated count displays `2`. | PROFILE-001-US-010, PROFILE-001-US-013 | Yes | API |
| PROFILE-001-TC-009 | Cafe rated count is derived from current-user rating rows | Positive, API, UI | High | Fixture PROFILE-001-A contains exactly one cafe rating row, `rating-003`. | Request `GET /api/v1/profile`; payload none. | Open `/profile`. | API status is `200 OK`; `ratedCafeCount=1`; UI cafe rated count displays `1` with Western digit `1`. | PROFILE-001-US-011 | Yes | API, UI E2E |
| PROFILE-001-TC-010 | Ice cream rated count is derived from current-user rating rows | Positive, API, UI | High | Fixture PROFILE-001-A contains exactly one ice cream rating row, `rating-004`. | Request `GET /api/v1/profile`; payload none. | Open `/profile`. | API status is `200 OK`; `ratedIceCreamCount=1`; UI ice cream rated count displays `1` with Western digit `1`. | PROFILE-001-US-012 | Yes | API, UI E2E |
| PROFILE-001-TC-011 | Loading state does not display fake counts | Loading, UX | Medium | Intercept `GET /api/v1/profile` and hold it pending for 2 seconds. | Pending request, payload none. | Navigate to `/profile` while request is pending. | Summary skeleton/loading UI is visible; DOM contains no count values from Fixture PROFILE-001-A until the `200 OK` response resolves. | PROFILE-001-US-016 | Yes | UI E2E |
| PROFILE-001-TC-012 | Server error shows retry without fake stats | Error Handling, API, UI | High | Fixture PROFILE-001-D is active. | Request `GET /api/v1/profile`; payload none; expected `500 Error`. | Open `/profile`. | API status is `500 Error`; safe error payload excludes profile fields, `triedPlaces`, private note canary `private-note-profile-001`, and raw profile/rating payload values; UI shows one retry control; no count cards with fake values are rendered. | PROFILE-001-US-017 | Yes | API, UI E2E |
| PROFILE-001-TC-013 | Retry refetches profile and replaces error state after success | Error Handling, UI | Medium | First `GET /api/v1/profile` returns Fixture PROFILE-001-D; second request returns Fixture PROFILE-001-A. | First response `500 Error`; second response `200 OK`. | Open `/profile`, then activate retry once. | Exactly two `GET /api/v1/profile` requests are made; after second response, error state is removed and UI shows count values `4`, `3`, `2`, `1`, `1`. | PROFILE-001-US-018 | Yes | UI E2E |
| PROFILE-001-TC-014 | Offline profile load shows network-safe error without stale private data | Negative, Privacy | Medium | Browser session is `user-profile-001`; network for `GET /api/v1/profile` fails before response. | Request `GET /api/v1/profile`; network failure; no HTTP status; stale other-session canary `private-note-other-user-001`. | Load `/profile` while offline. | UI shows a network-safe error and retry control; DOM does not contain stale profile data from another session, including canary `private-note-other-user-001`. | PROFILE-001-US-019 | Yes | UI E2E, Security |
| PROFILE-001-TC-015 | Western digits are used for all profile counts | Accessibility, Formatting | Medium | Fixture PROFILE-001-A is active. | Expected visible digits: `4`, `3`, `2`, `1`, `1`; forbidden Arabic-Indic digits: `٠١٢٣٤٥٦٧٨٩`. | Open `/profile` and inspect rendered text. | All summary numeric fragments use Western digits only; no Arabic-Indic digit appears in count text. | PROFILE-001-US-021, RESP-004-US-001, RESP-004-US-002 | Yes | UI E2E, Accessibility |
| PROFILE-001-TC-016 | Arabic labels with numeric counts remain bidi-safe | Accessibility, UI | Medium | Fixture PROFILE-001-A is active with Arabic profile labels. | Count fragments `4`, `3`, `2`, `1`, `1`. | Render `/profile` in RTL and inspect computed text order/accessibility tree. | Count fragments remain adjacent to their intended labels, are isolated from surrounding Arabic text, and screen reader names pair each label with the correct number. | PROFILE-001-US-022, RESP-004-US-005, RESP-004-US-009 | Yes | Accessibility |
| PROFILE-001-TC-017 | Summary is usable at 320px, 390px, 430px, and phone landscape | Responsive, Mobile | High | Fixture PROFILE-001-A is active. | Viewports: `320x568`, `390x844`, `430x932`, `844x390`. | Render `/profile` at each viewport. | `document.documentElement.scrollWidth <= window.innerWidth`; all five count cards are readable; no count overlaps another label or bottom navigation. | PROFILE-001-US-023, RESP-002-US-001, RESP-002-US-002, RESP-002-US-012 | Yes | UI E2E |
| PROFILE-001-TC-018 | Summary supports 200% zoom and touch target baseline | Responsive, Accessibility | High | Fixture PROFILE-001-A is active; browser zoom is `200%`. | Viewport `390x844`; zoom `200%`. | Render `/profile` and navigate focusable summary controls if present. | No horizontal overflow; readable summary labels and counts; retry or navigation controls present in summary area are at least `44x44` CSS pixels. | PROFILE-001-US-023, RESP-003-US-001, RESP-003-US-002, RESP-003-US-008 | Yes | Accessibility, UI E2E |
| PROFILE-001-TC-019 | Summary respects top and bottom safe areas | Responsive, Mobile | High | Fixture PROFILE-001-A is active. | Emulated safe-area insets top `24px`, bottom `34px`. | Render `/profile` on a mobile viewport with safe-area insets. | Header content is not hidden behind top inset; final summary or page content remains above bottom navigation/safe area; no horizontal overflow. | PROFILE-001-US-023, RESP-002-US-004, RESP-002-US-005 | Yes | UI E2E |
| PROFILE-001-TC-020 | Summary stats have screen-reader labels and heading structure | Accessibility | High | Fixture PROFILE-001-A is active. | Expected accessible labels include counts for lists, ratings, restaurants, cafes, and ice cream. | Navigate `/profile` with screen-reader accessibility tree inspection. | Page has a profile heading; each count has a unique accessible name that includes its category and exact value; no unlabeled count-only control exists. | PROFILE-001-US-024 | Yes | Accessibility |
| PROFILE-001-TC-021 | Forced-colors mode preserves summary text and state visibility | Accessibility | Medium | Fixture PROFILE-001-A is active; forced-colors mode is enabled. | Request `GET /api/v1/profile`; payload none; expected `200 OK`. | Render `/profile` in forced-colors mode. | Count labels and values remain visible; focus indicators for any summary actions remain visible; no count is represented by color alone. | PROFILE-001-US-024, RESP-003-US-014, RESP-003-US-015 | Yes | Accessibility |

## Requirement Clarification, Manual, and Traceability Cases

| Test Case ID | Case Type | Priority | Title | Verification |
|---|---|---|---|---|
| PROFILE-001-TC-022 | Requirement Clarification | Medium | Exact `500 Error` payload schema and non-profile sensitive-field policy | Source requires safe error payload but does not define exact error keys or token/password/cookie leakage checks for PROFILE-001; clarify before asserting those field names executably. |
| PROFILE-001-TC-023 | Traceability Verification | Medium | List deletion ownership boundary | Verify PROFILE-001 only asserts refreshed `listsCount` end state; deletion mechanics remain owned by the list deletion feature. |
| PROFILE-001-TC-024 | Traceability Verification | Medium | Rating create/update ownership boundary | Verify PROFILE-001 only asserts refreshed count end states; rating create/update mechanics remain owned by rating features. |

## Summary

- Executable test cases: 21
- Requirement Clarification cases: 1
- Manual cases: 0
- Traceability Verification cases: 2
- Total test cases: 24
- Priority counts: Critical 7, High 9, Medium 8, Low 0
- Automation layer counts: API 9, UI E2E 14, Accessibility 5, Security 4, Manual 0, Traceability Verification 2, Requirement Clarification 1

## Validation

- Duplicate Test IDs: 0
- Invalid Story References: 0
- Missing User Stories: 0
- Encoding/Mojibake: 0
- API Tests Missing Status Codes: 0
- Requirement Fidelity Violations: 0
- Feature Ownership Violations: 0
- Generic Executable Wording: 0
