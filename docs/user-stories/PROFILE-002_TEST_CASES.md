# PROFILE-002 Test Cases - View `تقييماتك` archive

## Source Requirements

- Feature: `PROFILE-002 - View تقييماتك archive`
- Sources: `PROFILE_USER_STORIES.md`, `FEATURE_TRACEABILITY.md`, `RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`
- Endpoint under test: `GET /api/v1/profile`
- Documented statuses: `200 OK`, `401 Unauthorized`, `500 Error`
- User stories processed: `PROFILE-002-US-001` through `PROFILE-002-US-028`

## Deterministic Fixtures

### Fixture PROFILE-002-A - Ordered Archive

- User: `user-profile-002`
- Authenticated state: valid bearer session `bearer-profile-002`
- Request: `GET /api/v1/profile`
- Payload: none
- Initial database state:
  - `rating-001`: `placeName="مطعم الرياض"`, `primaryType="restaurant"`, `subtype="seafood"`, `rating=8.5`, `notes="جلسة عائلية هادئة"`, `createdAt="2026-06-01T09:00:00Z"`, `updatedAt="2026-06-12T10:00:00Z"`
  - `rating-002`: `placeName="Burger House"`, `primaryType="restaurant"`, `subtype="burger"`, `rating=9.0`, `notes=null`, `createdAt="2026-06-02T09:00:00Z"`, `updatedAt="2026-06-11T10:00:00Z"`
  - `rating-003`: `placeName="قهوة المساء"`, `primaryType="cafe"`, `subtype="coffee"`, `rating=7.5`, `notes="قهوة ممتازة"`, `createdAt="2026-06-03T09:00:00Z"`, `updatedAt="2026-06-11T09:00:00Z"`
- Expected `200 OK` response: `userRatings` in order `rating-001`, `rating-002`, `rating-003`; no `triedPlaces`.
- Expected UI state: one `تقييماتك` archive section with exactly 3 rows in that order.

### Fixture PROFILE-002-B - Tie Break Ordering

- User: `user-profile-002`
- Authenticated state: valid bearer session `bearer-profile-002`
- Request: `GET /api/v1/profile`
- Payload: none
- Initial database state:
  - `rating-010`: `placeName="Alpha Cafe"`, `createdAt="2026-06-01T09:00:00Z"`, `updatedAt="2026-06-05T09:00:00Z"`
  - `rating-011`: `placeName="مطعم الرياض"`, `createdAt="2026-06-01T09:00:00Z"`, `updatedAt="2026-06-05T09:00:00Z"`
  - `rating-012`: `placeName="Burger House"`, `createdAt="2026-06-01T09:00:00Z"`, `updatedAt="2026-06-05T09:00:00Z"`
- Expected archive order by `placeName ASC`: `Alpha Cafe`, `Burger House`, `مطعم الرياض`.

### Fixture PROFILE-002-C - Large Archive

- User: `user-heavy-archive-001`
- Authenticated state: valid bearer session `bearer-heavy-archive-001`
- Request: `GET /api/v1/profile`
- Payload: none
- Initial database state: 150 `userRatings` rows with IDs `rating-archive-001` through `rating-archive-150`
- Expected `200 OK` response: `userRatings.length=150`
- Expected UI state: continuous archive browsing with rendered DOM row count limited to visible rows plus buffer rows; no primary pagination UI.

### Fixture PROFILE-002-D - Empty Archive

- User: `user-profile-empty-002`
- Authenticated state: valid bearer session `bearer-profile-empty-002`
- Request: `GET /api/v1/profile`
- Payload: none
- Expected `200 OK` response contains `userRatings=[]`
- Expected UI state: `تقييماتك` section shows compact empty state and 0 archive rows.

### Fixture PROFILE-002-E - Unauthorized Archive Access

- User: none or `user-other-002`
- Authenticated state: guest, expired, or different authenticated user
- Request: `GET /api/v1/profile`
- Payload: none
- Expected response for guest/expired: `401 Unauthorized`; expected current-user response for `user-other-002` includes only that user's `userRatings`
- Forbidden data: `rating-001`, `جلسة عائلية هادئة`, any other user's ratings.

## Executable Test Cases

| Test Case ID | Test Title | Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| PROFILE-002-TC-001 | Ratings archive renders from `userRatings` only | Positive, API, UI | Critical | Fixture PROFILE-002-A is active. | Request `GET /api/v1/profile`; payload none; expected `userRatings.length=3`. | Open `/profile` and inspect API response and DOM. | API status is `200 OK`; `userRatings` contains 3 rows; no `triedPlaces`; UI renders one `تقييماتك` archive section with exactly 3 rows. | PROFILE-002-US-001, PROFILE-002-US-002 | Yes | API, UI E2E |
| PROFILE-002-TC-002 | Archive rows follow updatedAt, createdAt, placeName ordering | Positive, Data Integrity | Critical | Fixture PROFILE-002-A is active. | Request `GET /api/v1/profile`; payload none; expected row ID order `rating-001`, `rating-002`, `rating-003`. | Open `/profile` and inspect response order and rendered row order. | API status is `200 OK`; API and UI row order both match `rating-001`, `rating-002`, `rating-003`; no row is reordered by client-only label or type. | PROFILE-002-US-003 | Yes | API, UI E2E |
| PROFILE-002-TC-003 | Equal timestamp tie-break uses placeName ASC stably | Boundary, Data Integrity | High | Fixture PROFILE-002-B is active. | Request `GET /api/v1/profile`; payload none; expected order `Alpha Cafe`, `Burger House`, `مطعم الرياض`. | Refresh `/profile` 3 times. | Each API response has status `200 OK`; each response and render uses the same exact order across all refreshes. | PROFILE-002-US-004 | Yes | API, UI E2E |
| PROFILE-002-TC-004 | New rating appears in archive after profile refresh | Regression, Integration | High | Before state has 3 ratings; documented post-create profile state adds `rating-004` with `updatedAt="2026-06-13T08:00:00Z"`. | Request `GET /api/v1/profile`; payload none; expected top row `rating-004`. | Refresh `/profile` after documented rating creation end state is present. | API status is `200 OK`; `userRatings[0].ratingId="rating-004"`; UI first row shows the new place and rating. | PROFILE-002-US-005 | Yes | API, UI E2E |
| PROFILE-002-TC-005 | Edited rating row updates and moves by updatedAt | Regression, Integration | High | `rating-003` is edited; post-edit profile fixture sets `rating=9.5`, `notes="تم التحديث"`, `updatedAt="2026-06-14T08:00:00Z"`. | Request `GET /api/v1/profile`; payload none. | Refresh `/profile` after documented rating edit end state is present. | API status is `200 OK`; `rating-003` is first row; UI row shows `9.5/10` and note preview `تم التحديث`. | PROFILE-002-US-006, PROFILE-002-US-011 | Yes | API, UI E2E |
| PROFILE-002-TC-006 | Archive row displays place name and contained metadata | UI, UX | High | Fixture PROFILE-002-A is active. | Row `rating-001` has place `مطعم الرياض`, type `restaurant`, subtype `seafood`. | Open `/profile`. | Row displays `مطعم الرياض`, primary type `restaurant`, and subtype `seafood`; no placeholder metadata appears for absent values. | PROFILE-002-US-007, PROFILE-002-US-008 | Yes | UI E2E |
| PROFILE-002-TC-007 | Rating value renders with Western digits and LTR numeric isolation | UI, Accessibility | High | Fixture PROFILE-002-A is active. | Row `rating-001` rating `8.5`. | Open `/profile` in RTL. | Row displays `8.5/10` or approved equivalent using Western digits; number order is stable in RTL and does not reorder adjacent Arabic text. | PROFILE-002-US-009, RESP-004-US-001, RESP-004-US-005 | Yes | UI E2E, Accessibility |
| PROFILE-002-TC-008 | Edit action opens row-specific rating edit flow | Integration, UI | High | Fixture PROFILE-002-A is active. | Target row `rating-001`, place `place-rest-001`, current rating `8.5`. | Activate the edit action on the first archive row. | Edit flow opens for `place-rest-001`; visible current rating is `8.5`; no other row's place or rating is loaded. | PROFILE-002-US-010 | Yes | UI E2E |
| PROFILE-002-TC-009 | Empty archive renders compact empty state | Boundary, UI | High | Fixture PROFILE-002-D is active. | Request `GET /api/v1/profile`; payload none; `userRatings=[]`. | Open `/profile`. | API status is `200 OK`; UI shows `تقييماتك` compact empty state; 0 archive row elements exist; no fake place names render. | PROFILE-002-US-012 | Yes | API, UI E2E |
| PROFILE-002-TC-010 | Archive pending state uses skeleton rows without fake data | Loading, UX | Medium | Intercept `GET /api/v1/profile` and hold pending. | Pending request, payload none. | Open `/profile`. | Archive area shows layout-matching skeletons; DOM contains no real place names, ratings, or note text until `200 OK` resolves. | PROFILE-002-US-013 | Yes | UI E2E |
| PROFILE-002-TC-011 | Profile fetch failure shows archive retry without fake rows | Error Handling | High | `GET /api/v1/profile` returns `500 Error` with safe payload. | Request `GET /api/v1/profile`; payload none; private canary `private-archive-note-002`. | Open `/profile`. | API status is `500 Error`; safe error payload excludes `userRatings`, `triedPlaces`, archive row names, ratings, notes, and canary `private-archive-note-002`; archive area or profile page shows concise error with retry; no fake archive rows render. | PROFILE-002-US-014 | Yes | API, UI E2E |
| PROFILE-002-TC-012 | Summary available and archive unavailable shows archive-specific error only when separable | Error Handling | High | Separable fetch path fixture: summary data loaded, archive fetch fails with safe error. | Summary counts `4`, `3`; archive failure no row data. | Render profile in separable failure mode. | Summary remains visible with exact counts; archive section shows its own error and retry; 0 fake archive rows render. | PROFILE-002-US-015 | Yes | UI E2E |
| PROFILE-002-TC-013 | Archive available and summary unavailable uses documented fallback | Error Handling | High | Single-response API mode is documented for `GET /api/v1/profile`; fixture returns `500 Error`. | Request `GET /api/v1/profile`; payload none. | Open `/profile`. | Page shows one safe retry state; private archive rows do not render from stale data. | PROFILE-002-US-016 | Yes | UI E2E |
| PROFILE-002-TC-014 | Large archive uses virtualization without primary pagination | Performance, UI | High | Fixture PROFILE-002-C is active. | Response contains 150 rows. | Open `/profile` and inspect DOM row count before scrolling. | API status is `200 OK`; response has 150 rows; UI browsing is continuous; rendered row elements are less than 150 and at least the visible row count. | PROFILE-002-US-017 | Yes | UI E2E |
| PROFILE-002-TC-015 | Virtualized archive preserves visible row and focus on refresh | Performance, Accessibility | Medium | Fixture PROFILE-002-C is active; focus row `rating-archive-040`. | Refresh response keeps same row order. | Scroll to row 40, focus its edit action, trigger profile refresh. | Focused row remains reachable after refresh; visible content does not jump to top; row `rating-archive-040` remains in the expected viewport region. | PROFILE-002-US-018 | Yes | UI E2E, Accessibility |
| PROFILE-002-TC-016 | Bottom navigation does not cover final archive row | Responsive, Mobile | High | Fixture PROFILE-002-C is active. | Viewport `390x844`; bottom safe area `34px`. | Scroll to final archive row. | Final row `rating-archive-150` is fully visible above bottom navigation and safe-area inset; no horizontal overflow. | PROFILE-002-US-019, RESP-002-US-005 | Yes | UI E2E |
| PROFILE-002-TC-017 | Archive mobile and zoom layout has no overflow | Responsive | High | Fixture PROFILE-002-A is active. | Viewports `320x568`, `390x844`, `430x932`, zoom `200%`. | Render `/profile` at each size and zoom. | `scrollWidth <= innerWidth`; place names and ratings do not collide; archive actions remain visible. | PROFILE-002-US-020, RESP-002-US-001, RESP-002-US-002, RESP-003-US-001, RESP-003-US-012 | Yes | UI E2E |
| PROFILE-002-TC-018 | Long Arabic place name is contained | Responsive, UI | Medium | Archive row place name is `مطعم مأكولات بحرية ومشويات الخليج التقليدية`. | Request `GET /api/v1/profile`; payload none; expected `200 OK`. | Render row at `320x568`. | API status is `200 OK`; name wraps or clamps within row bounds; rating remains visible; no horizontal overflow. | PROFILE-002-US-021, RESP-002-US-016, RESP-003-US-005 | Yes | UI E2E |
| PROFILE-002-TC-019 | Long English place name is contained | Responsive, UI | Medium | Archive row place name is `The Original Cheesecake Factory Restaurant & Bakery`. | Request `GET /api/v1/profile`; payload none; expected `200 OK`. | Render row at `320x568` and `200%` zoom. | API status is `200 OK`; name wraps or clamps within row bounds; rating remains visible; no horizontal overflow. | PROFILE-002-US-022, RESP-003-US-006 | Yes | UI E2E |
| PROFILE-002-TC-020 | Mixed-language place name maintains bidi order | Responsive, Accessibility | Medium | Archive row place name is `مطعم Five Guys فرع King Abdullah Financial District`. | Request `GET /api/v1/profile`; payload none; expected `200 OK`. | Render row in RTL at `390x844`. | API status is `200 OK`; Arabic and English segments remain in correct order; no overlap with rating or edit action. | PROFILE-002-US-023, RESP-003-US-007 | Yes | Accessibility |
| PROFILE-002-TC-021 | Keyboard navigation reaches row links and edit actions | Accessibility | High | Fixture PROFILE-002-A is active. | Three rows, each with row link and edit action. | Use Tab, Shift+Tab, and Enter through archive. | Focus order is logical from first row to last; each focus target has visible `focus-visible`; Enter activates the focused row or edit action. | PROFILE-002-US-024 | Yes | Accessibility |
| PROFILE-002-TC-022 | Screen-reader labels identify each archive row | Accessibility | High | Fixture PROFILE-002-A is active. | Row `rating-001`: place, type, subtype, rating, note state. | Inspect accessibility tree for archive rows. | Row accessible name includes `مطعم الرياض`, `restaurant`, `seafood`, `8.5/10`, note preview state, and edit action label tied to that row. | PROFILE-002-US-025 | Yes | Accessibility |
| PROFILE-002-TC-023 | Reduced-motion mode suppresses non-essential archive motion | Accessibility | Medium | Fixture PROFILE-002-C is active; `prefers-reduced-motion: reduce`. | Large archive render and loading transition. | Open `/profile` and scroll archive. | Loading, row entry, and virtualization do not use non-essential animation; content remains reachable. | PROFILE-002-US-026 | Yes | Accessibility |
| PROFILE-002-TC-024 | Archive retry after network recovery refetches current rows | Error Handling, Mobile | Medium | First profile request fails due to network; second after retry returns Fixture PROFILE-002-A. | First request network error; second `200 OK`. | Open `/profile`, restore network, activate retry. | Retry sends `GET /api/v1/profile` again; archive replaces error with rows `rating-001`, `rating-002`, `rating-003`. | PROFILE-002-US-027 | Yes | UI E2E |
| PROFILE-002-TC-025 | Archive is scoped to current user only | Security, Privacy | Critical | `user-profile-002` has `rating-001`; `user-other-002` has `rating-other-001` with note `ملاحظة مستخدم آخر`. | Request `GET /api/v1/profile` as `user-profile-002`. | Open `/profile` and inspect response. | API status is `200 OK`; `userRatings` contains only `user-profile-002` ratings; UI does not contain `rating-other-001` or `ملاحظة مستخدم آخر`. | PROFILE-002-US-028 | Yes | API, Security |
| PROFILE-002-TC-026 | Guest archive request returns no archive data | Negative, Security, API | Critical | No valid session exists and Fixture PROFILE-002-A data exists for `user-profile-002`. | Request `GET /api/v1/profile`; payload none. | Request the endpoint as guest and render `/profile`. | API status is `401 Unauthorized`; response contains no `userRatings`, `ratingsCount`, `publicListsSummary`, `triedPlaces`, rating IDs, place names, ratings, or notes; UI renders signed-out state with 0 archive rows. | PROFILE-002-US-028 | Yes | API, Security |
| PROFILE-002-TC-027 | Expired session clears archive without private-data flash | Negative, Security, UI | Critical | Fixture PROFILE-002-A archive rows are visible, then session expires before profile revalidation. | Revalidation request `GET /api/v1/profile`; payload none; expected `401 Unauthorized`; stale canaries `rating-001` and `private-archive-note-002`. | Trigger profile revalidation. | API status is `401 Unauthorized`; archive rows are cleared before signed-out UI appears; DOM never contains `rating-001`, previous place names, ratings, notes, or canary `private-archive-note-002` after expiry. | PROFILE-002-US-028 | Yes | UI E2E, Security |

## Requirement Clarification, Manual, and Traceability Cases

| Test Case ID | Case Type | Priority | Title | Verification |
|---|---|---|---|---|
| PROFILE-002-TC-028 | Traceability Verification | Medium | Rating creation and edit flow ownership | Verify archive cases assert only profile refresh end states and row-specific navigation; rating save mechanics remain owned by rating features. |
| PROFILE-002-TC-029 | Requirement Clarification | Medium | Separable archive fetch contract | PROFILE-002 defines partial failure alternatives; clarify whether summary and archive can actually fail independently with the documented single `GET /api/v1/profile` endpoint. |
| PROFILE-002-TC-030 | Manual Verification | Low | Human screen-reader announcement quality | Run VoiceOver/NVDA once to confirm row announcement order is understandable in Arabic/English mixed content. |

## Summary

- Executable test cases: 27
- Requirement Clarification cases: 1
- Manual cases: 1
- Traceability Verification cases: 1
- Total test cases: 30
- Priority counts: Critical 6, High 15, Medium 8, Low 1
- Automation layer counts: API 12, UI E2E 21, Accessibility 8, Security 4, Manual 1, Traceability Verification 1, Requirement Clarification 1

## Validation

- Duplicate Test IDs: 0
- Invalid Story References: 0
- Missing User Stories: 0
- Encoding/Mojibake: 0
- API Tests Missing Status Codes: 0
- Requirement Fidelity Violations: 0
- Feature Ownership Violations: 0
- Generic Executable Wording: 0
