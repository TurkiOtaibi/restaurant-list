# PROFILE-004 Test Cases - View own public list summary

## Source Requirements

- Feature: `PROFILE-004 - View own public list summary`
- Sources: `PROFILE_USER_STORIES.md`, `FEATURE_TRACEABILITY.md`, `RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`
- Endpoint under test: `GET /api/v1/profile`
- Documented statuses: `200 OK`, `401 Unauthorized`, `500 Error`
- User stories processed: `PROFILE-004-US-001` through `PROFILE-004-US-016`

## Deterministic Fixtures

### Fixture PROFILE-004-A - Own Public Lists

- User: `user-lists-001`
- Authenticated state: valid bearer session `bearer-lists-001`
- Request: `GET /api/v1/profile`
- Payload: none
- Owned public lists:
  - `list-public-001`: `name="قائمة العائلة"`, `placeCount=2`, `ownerDisplayName="Sara"`
  - `list-public-002`: `name="Burger Weekend"`, `placeCount=5`, `ownerDisplayName="Sara"`
- Owned private lists:
  - `list-private-001`: `name="مطاعم خاصة"`, `placeCount=4`
- Other user's public list:
  - `list-other-public-001`: `name="Other Public"`, owner `user-lists-002`
- Expected `200 OK` response: `publicListsSummary` contains only `list-public-001` and `list-public-002`.
- Forbidden response/UI fields in public summary: `list-private-001`, `مطاعم خاصة`, `list-other-public-001`, owner email, and internal owner id.

### Fixture PROFILE-004-B - No Public Lists

- User: `user-lists-empty-001`
- Authenticated state: valid bearer session `bearer-lists-empty-001`
- Request: `GET /api/v1/profile`
- Payload: none
- Owned lists: two private lists, zero public lists
- Expected `200 OK` response: `publicListsSummary=[]`
- Expected UI state: section remains visible with compact empty state and no fake public list.

### Fixture PROFILE-004-C - Visibility and Deletion End States

- User: `user-lists-001`
- Authenticated state: valid bearer session `bearer-lists-001`
- Profile post-public end state: `list-private-002` now appears with `name="مطاعم الرياض"`, `placeCount=3`
- Profile post-private end state: `list-public-001` no longer appears
- Profile post-delete end state: `list-public-002` absent and `listsCount` decremented from `3` to `2`

### Fixture PROFILE-004-D - Long Names

- User: `user-lists-001`
- Authenticated state: valid bearer session `bearer-lists-001`
- Public list names:
  - Arabic: `قائمة مطاعم العائلة لعطلة نهاية الأسبوع في الرياض`
  - English: `Very Long Weekend Food Collection For Family Visits`
  - Mixed: `قائمة Burger House و آيس كريم`

## Executable Test Cases

| Test Case ID | Test Title | Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| PROFILE-004-TC-001 | Own public-list summary renders compact items | Positive, API, UI | Medium | Fixture PROFILE-004-A is active. | Request `GET /api/v1/profile`; payload none; expected list IDs `list-public-001`, `list-public-002`. | Open `/profile`. | API status is `200 OK`; `publicListsSummary` has exactly 2 items; UI renders compact items `قائمة العائلة` and `Burger Weekend`. | PROFILE-004-US-001 | Yes | API, UI E2E |
| PROFILE-004-TC-002 | Private lists are excluded from public summary | Privacy, API | High | Fixture PROFILE-004-A is active. | Private list `list-private-001`, name `مطاعم خاصة`. | Request profile and inspect response/UI. | API status is `200 OK`; `publicListsSummary` excludes `list-private-001`; UI does not contain `مطاعم خاصة`. | PROFILE-004-US-002 | Yes | API, Security |
| PROFILE-004-TC-003 | Empty public-list summary uses empty array and compact empty state | Boundary, API, UI | Medium | Fixture PROFILE-004-B is active. | Request `GET /api/v1/profile`; payload none; expected `publicListsSummary=[]`. | Open `/profile`. | API status is `200 OK`; `publicListsSummary` is `[]`, not `null`; section remains visible with compact empty state and 0 fake list items. | PROFILE-004-US-003, PROFILE-004-US-004 | Yes | API, UI E2E |
| PROFILE-004-TC-004 | Visibility change to public appears after profile refresh | Integration, UI | High | Fixture PROFILE-004-C post-public end state is active. | Request `GET /api/v1/profile`; expected list `list-private-002`. | Refresh `/profile` after documented visibility change end state. | API status is `200 OK`; `publicListsSummary` includes `list-private-002`; UI shows `مطاعم الرياض` once. | PROFILE-004-US-005 | Yes | API, UI E2E |
| PROFILE-004-TC-005 | Visibility change to private removes list after profile refresh | Privacy, Integration | Critical | Fixture PROFILE-004-C post-private end state is active. | Former public list `list-public-001`. | Refresh `/profile` after documented visibility change end state. | API status is `200 OK`; `publicListsSummary` excludes `list-public-001`; UI does not display `قائمة العائلة`; no stale private-list flash appears. | PROFILE-004-US-006 | Yes | API, UI E2E |
| PROFILE-004-TC-006 | Deleted public list is absent and list count updates | Regression, Integration | High | Fixture PROFILE-004-C post-delete end state is active. | Expected `listsCount=2`; deleted `list-public-002`. | Refresh `/profile` after documented delete end state. | API status is `200 OK`; `list-public-002` is absent; `listsCount=2`; UI list count displays `2`. | PROFILE-004-US-007 | Yes | API, UI E2E |
| PROFILE-004-TC-007 | Public-list place count displays exact Western digit count | UI, Formatting | Medium | Fixture PROFILE-004-A is active. | `list-public-002.placeCount=5`. | Open `/profile`. | UI summary item `Burger Weekend` shows place count `5` using Western digit `5`; no Arabic-Indic digit appears. | PROFILE-004-US-008, RESP-004-US-001, RESP-004-US-002 | Yes | UI E2E |
| PROFILE-004-TC-008 | Public-list item opens public list detail by list identity | Integration, UI | Medium | Fixture PROFILE-004-A is active. | Target `list-public-001`, name `قائمة العائلة`. | Activate the `قائمة العائلة` summary item. | Public list detail opens for `list-public-001`; it does not open `list-public-002` or private list `list-private-001`. | PROFILE-004-US-009 | Yes | UI E2E |
| PROFILE-004-TC-009 | Public-safe owner display is consistent and excludes private identity | Privacy, UI | Medium | Fixture PROFILE-004-A is active. | Request `GET /api/v1/profile`; payload none; owner display name `Sara`; forbidden fields `ownerEmail`, `internal owner id`. | Open `/profile` and inspect response/UI. | API status is `200 OK`; each public summary item uses `Sara` where owner display appears; response/UI excludes email and internal owner id. | PROFILE-004-US-010 | Yes | API, Security |
| PROFILE-004-TC-010 | Public summary contains only current user's public lists | Security, Privacy | High | Fixture PROFILE-004-A includes `list-other-public-001` owned by `user-lists-002`. | Request `GET /api/v1/profile` as `user-lists-001`. | Request profile and inspect UI. | API status is `200 OK`; `publicListsSummary` excludes `list-other-public-001`; UI does not display `Other Public`. | PROFILE-004-US-011 | Yes | API, Security |
| PROFILE-004-TC-011 | Public summary pending state has no fake list names | Loading, UX | Medium | Intercept `GET /api/v1/profile` and hold pending. | Pending request, payload none. | Open `/profile`. | Public-list section shows compact loading state; DOM contains no `قائمة العائلة`, `Burger Weekend`, or fake list names before response. | PROFILE-004-US-012 | Yes | UI E2E |
| PROFILE-004-TC-012 | Public summary failure uses documented profile-level fallback | Error Handling | Medium | Single `GET /api/v1/profile` returns `500 Error`. | Request `GET /api/v1/profile`; payload none; forbidden list canaries `قائمة العائلة` and `مطاعم خاصة`. | Open `/profile`. | API status is `500 Error`; safe error payload and UI error exclude public/private list canaries; page shows profile-level retry state; public-summary section does not render stale or fake public-list names. | PROFILE-004-US-013 | Yes | API, UI E2E |
| PROFILE-004-TC-013 | Long public-list names are contained on mobile and zoom | Responsive, UI | Medium | Fixture PROFILE-004-D is active. | Viewports `320x568`, `390x844`; zoom `200%`. | Render `/profile` at each size. | Arabic, English, and mixed names wrap or clamp within item bounds; no horizontal overflow; place counts remain visible. | PROFILE-004-US-014, RESP-002-US-016, RESP-003-US-001 | Yes | UI E2E |
| PROFILE-004-TC-014 | Public-summary items are keyboard reachable and labeled | Accessibility | Medium | Fixture PROFILE-004-A is active. | Items `قائمة العائلة`, `Burger Weekend`. | Navigate with keyboard and inspect accessibility tree. | Each item is reachable by Tab, has visible `focus-visible`, and accessible name includes list name and place count. | PROFILE-004-US-015 | Yes | Accessibility |
| PROFILE-004-TC-015 | Public-list summary is reachable above bottom safe area | Responsive, Mobile | Medium | Fixture PROFILE-004-A is active; public-summary section is near page bottom. | Viewport `390x844`; bottom safe area `34px`; zoom `200%`. | Scroll to public-list summary. | Section and final item are fully visible above bottom navigation/safe area; no horizontal overflow occurs. | PROFILE-004-US-016, RESP-002-US-005, RESP-003-US-002 | Yes | UI E2E |
| PROFILE-004-TC-016 | Guest profile request returns no public-list summary | Negative, Security, API | Critical | Fixture PROFILE-004-A data exists, but no valid session is present. | Request `GET /api/v1/profile`; payload none. | Request the endpoint as guest and render `/profile`. | API status is `401 Unauthorized`; response contains no `publicListsSummary`, `listsCount`, public list IDs, private list IDs, owner display name, owner email, or internal owner id; UI renders signed-out state with 0 public-summary items. | PROFILE-004-US-011 | Yes | API, Security |

## Requirement Clarification, Manual, and Traceability Cases

| Test Case ID | Case Type | Priority | Title | Verification |
|---|---|---|---|---|
| PROFILE-004-TC-017 | Traceability Verification | High | Visibility and deletion mechanics remain out of scope | PROFILE-004 asserts refreshed public-summary end states only; list visibility and deletion API behavior remain owned by list features. |
| PROFILE-004-TC-018 | Requirement Clarification | Medium | Separable public-summary failure path | Source allows a separable fetch path but documents a single profile endpoint; clarify whether public-list summary can fail independently. |
| PROFILE-004-TC-019 | Manual Verification | Medium | Public list detail navigation target contract | Verify the public-list detail route path with routing documentation before hard-coding route assertions beyond list identity. |

## Summary

- Executable test cases: 16
- Requirement Clarification cases: 1
- Manual cases: 1
- Traceability Verification cases: 1
- Total test cases: 19
- Priority counts: Critical 2, High 5, Medium 12, Low 0
- Automation layer counts: API 11, UI E2E 12, Accessibility 1, Security 5, Manual 1, Traceability Verification 1, Requirement Clarification 1

## Validation

- Duplicate Test IDs: 0
- Invalid Story References: 0
- Missing User Stories: 0
- Encoding/Mojibake: 0
- API Tests Missing Status Codes: 0
- Requirement Fidelity Violations: 0
- Feature Ownership Violations: 0
- Generic Executable Wording: 0
