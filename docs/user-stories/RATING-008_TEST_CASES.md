# RATING-008 Test Cases

Feature: `RATING-008 - Average rating and rating count`

Feature Description: Community rating average and rating count are calculated from the ratings table and shown in places/detail/list contexts.

Primary Source: `docs/user-stories/RATINGS_USER_STORIES.md`

Supporting Sources:

- `docs/feature-map/FEATURE_TRACEABILITY.md`
- `docs/user-stories/RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`

Allowed Requirement Sources:

- `RATING-008-US-001` through `RATING-008-US-015`
- Shared Ratings Business Rules in `RATINGS_USER_STORIES.md`
- Endpoint/database traceability in `FEATURE_TRACEABILITY.md`
- Approved global responsive/accessibility requirements explicitly cited as `RESP-*` or `A11Y-*`

Out of Scope:

- Rating deletion, recommendations, browser history, cache behavior, undocumented propagation timing, and implementation-specific aggregate storage.
- General rating validation except where valid `POST` or `PATCH` requests are needed to create documented aggregate freshness fixtures.
- Exact GET response status and endpoint-specific envelope for aggregate-bearing place/list surfaces; the allowed sources document the endpoints and aggregate fields, but not the exact success status/envelope.

## Documented Contracts Used By These Tests

- Average rating is calculated from the `ratings` table using full internal precision and displayed with one decimal place.
- Rating count equals the number of committed rating rows for the place.
- Rounding examples are documented: `8.44 -> 8.4`, `8.45 -> 8.5`, `8.46 -> 8.5`.
- Aggregate data contains average/count only and never note content.
- Aggregate surfaces include Places, Place Detail, list detail, and public list context.
- `POST /api/v1/ratings` returns `201 Created` when a new rating is created.
- `PATCH /api/v1/ratings/{place_id}` returns `200 OK` when updating an existing rating.
- `RatingResponse` fields are exactly `id`, `userId`, `placeId`, `rating`, `notes`, `createdAt`, and `updatedAt`.
- Documented aggregate-bearing endpoints in `FEATURE_TRACEABILITY.md` include `GET /api/v1/places`, `GET /api/v1/places/{id}`, `GET /api/v1/lists/{id}`, and `GET /api/v1/lists/public/{id}`.

## Deterministic Fixture Matrix

| Fixture ID | Purpose | Ratings Table State | Related List/Surface State | Expected Aggregate |
|---|---|---|---|---|
| `FX-R008-AVG-9` | Basic average and count | `place-801`: `rating-801=user-001:8.0`, `rating-802=user-002:10.0` | `place-801` appears in Places, Place Detail, owned list `list-801`, public list `list-public-801` | Internal average `9.0`; displayed average `9.0`; `ratingCount=2`. |
| `FX-R008-AVG-8` | Many-row count | `place-802`: `user-001:7.0`, `user-002:8.0`, `user-003:9.0` | `place-802` appears in aggregate-bearing surfaces | Internal average `8.0`; displayed average `8.0`; `ratingCount=3`. |
| `FX-R008-ROUND-844` | Rounding below midpoint | `place-844`: 24 ratings of `8.5` and 1 rating of `7.0`; total `211.0` across `25` rows | Place Detail renders community aggregate | Internal average `8.44`; displayed average `8.4`; `ratingCount=25`. |
| `FX-R008-ROUND-845` | Midpoint rounding | `place-845`: 18 ratings of `8.5` and 2 ratings of `8.0`; total `169.0` across `20` rows | Place Detail renders community aggregate | Internal average `8.45`; displayed average `8.5`; `ratingCount=20`. |
| `FX-R008-ROUND-846` | Rounding above midpoint | `place-846`: 24 ratings of `8.5` and 1 rating of `7.5`; total `211.5` across `25` rows | Place Detail renders community aggregate | Internal average `8.46`; displayed average `8.5`; `ratingCount=25`. |
| `FX-R008-UNRATED` | No fake aggregate | `place-803`: no rating rows | Place appears in aggregate-bearing surfaces | No fake average is displayed; exact count representation is tracked as clarification because the story allows count zero or omitted. |
| `FX-R008-CREATE-FRESHNESS` | Aggregate after new rating | `place-804` before: `user-001:8.0`, `user-002:10.0`; no rating for `user-003` | Place appears in Places, Place Detail, owned list, public list | Before: internal/display average `9.0`, count `2`; after `user-003` creates `6.0`: internal average `8.0`, displayed average `8.0`, count `3`. |
| `FX-R008-EDIT-FRESHNESS` | Aggregate after edit | `place-805` before: `rating-805-1=user-001:8.0`, `rating-805-2=user-002:10.0`, `rating-805-3=user-003:6.0` | Place appears in aggregate-bearing surfaces | Before: average `8.0`, count `3`; after `user-003` edits `6.0 -> 9.0`: internal/display average `9.0`, count `3`. |
| `FX-R008-NOTE-PRIVACY` | Note exclusion | `place-806`: `user-001:8.0 notes="ملاحظة خاصة"`, `user-002:10.0 notes="private note"` | Aggregate-bearing responses render community average/count | Internal/display average `9.0`, count `2`; no note fields or note text in aggregate response/surfaces. |
| `FX-R008-CONCURRENT` | Concurrent committed rows | `place-807` before: `user-001:8.0`, `user-002:8.0` | Place data reloads after concurrent rating commits | Before: average `8.0`, count `2`; after concurrent committed creates `user-003:10.0` and `user-004:6.0`: average `8.0`, count `4`. |

## Common Executable Assertions

- Aggregate response or rendered aggregate context must expose the documented average/count values for the fixture.
- Aggregate responses and aggregate UI must not expose `notes`, note text, `privateNotes`, hidden metadata, audit/debug fields, SQL, stack traces, tokens, or other users' private data.
- Displayed numeric values use Western digits, period decimal separator, and LTR-safe formatting when rendered in RTL UI.
- Tests do not assert undocumented GET success statuses or undocumented response envelopes; those are tracked as Requirement Clarification.

## RATING-008-US-001 - Calculate average from ratings table

User Story ID: `RATING-008-US-001`

User Story Title: Calculate average from ratings table

User Story Summary: As a user, I want community average rating so that I can understand general quality.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-008-US-001-TC-001 | Average is calculated from committed rating rows | API, Data Integrity | High | Load `FX-R008-AVG-9`; verify ratings table has exactly two rows for `place-801`: `8.0` and `10.0`. | Request documented aggregate-bearing place data for `place-801`, for example `GET /api/v1/places/{id}` with `{id}=place-801`; do not assert undocumented GET status. | 1. Request place data for `place-801`. 2. Query ratings for `place-801`. 3. Compare response aggregate to calculated value. 4. Scan aggregate response for forbidden fields. | Ratings table sum is `18.0`; rating row count is `2`; internal average is `9.0`; aggregate response or returned place data exposes `averageRating=9.0`; aggregate data contains no note fields, note text, SQL, stack, debug, audit, or hidden metadata. | RATING-008-US-001 | Yes | API |

## RATING-008-US-002 - Calculate rating count from ratings table

User Story ID: `RATING-008-US-002`

User Story Title: Calculate rating count from ratings table

User Story Summary: As a user, I want rating count so that I understand confidence in the average.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-008-US-002-TC-001 | Rating count equals number of committed rows | API, Data Integrity | High | Load `FX-R008-AVG-8`; verify ratings table has exactly three rows for `place-802`: `7.0`, `8.0`, `9.0`. | Request documented aggregate-bearing place data for `place-802`. | 1. Request place data for `place-802`. 2. Query ratings for `place-802`. 3. Compare response count to committed row count. | Ratings table row count is `3`; aggregate response or returned place data exposes `ratingCount=3`; internal/display average is `8.0`; no note content is present in aggregate data. | RATING-008-US-002 | Yes | API |

## RATING-008-US-003 - Store aggregate internally with full precision

User Story ID: `RATING-008-US-003`

User Story Title: Store aggregate internally with full precision

User Story Summary: As the system, I want aggregate calculation not to lose precision before display.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-008-US-003-TC-001 | Internal calculation uses full precision before display rounding | Data Integrity, Boundary | High | Load `FX-R008-ROUND-846`; ratings table total is `211.5` across `25` committed rows. | Request aggregate-bearing data for `place-846`; inspect displayed value where rendered. | 1. Calculate internal average from persisted rows: `211.5 / 25`. 2. Request aggregate data for `place-846`. 3. Inspect rendered community average on Place Detail. | Internal calculation is `8.46`; displayed average is `8.5`; result proves display uses full internal precision rather than pre-rounded input rows or integer-only math; `ratingCount=25`. | RATING-008-US-003 | Yes | API / UI |

## RATING-008-US-004 - Display one decimal place

User Story ID: `RATING-008-US-004`

User Story Title: Display one decimal place

User Story Summary: As a user, I want rating averages formatted consistently.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-008-US-004-TC-001 | Average displays exactly one decimal place including trailing zero | UI, Formatting | High | Load `FX-R008-AVG-9`; place data average is `9.0`. | Open Place Detail or another documented aggregate surface for `place-801`. | 1. Render the aggregate UI for `place-801`. 2. Read the visible community average text. 3. Inspect accessible text for the same numeric value. | Visible average is exactly `9.0` or `9.0/10` where scale is shown; it is not `9`, `9.00`, or `9,0`; accessible text includes the same one-decimal value; `ratingCount=2` is displayed or exposed where count is shown. | RATING-008-US-004 | Yes | UI E2E |

## RATING-008-US-005 - Round 8.44 to 8.4

User Story ID: `RATING-008-US-005`

User Story Title: Round 8.44 to 8.4

User Story Summary: As QA, I want rounding examples testable.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-008-US-005-TC-001 | Internal average 8.44 displays as 8.4 | Boundary, UI, API | Medium | Load `FX-R008-ROUND-844`; verify persisted total `211.0` across `25` rows. | Request/render aggregate data for `place-844`. | 1. Calculate `211.0 / 25 = 8.44`. 2. Request aggregate-bearing data. 3. Render aggregate UI. | Internal average is `8.44`; displayed average is exactly `8.4`; displayed value is not `8.44` and not `8.5`; `ratingCount=25`. | RATING-008-US-005 | Yes | API / UI |

## RATING-008-US-006 - Round 8.45 to 8.5

User Story ID: `RATING-008-US-006`

User Story Title: Round 8.45 to 8.5

User Story Summary: As QA, I want midpoint rounding testable.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-008-US-006-TC-001 | Internal average 8.45 displays as 8.5 | Boundary, UI, API | Medium | Load `FX-R008-ROUND-845`; verify persisted total `169.0` across `20` rows. | Request/render aggregate data for `place-845`. | 1. Calculate `169.0 / 20 = 8.45`. 2. Request aggregate-bearing data. 3. Render aggregate UI. | Internal average is `8.45`; displayed average is exactly `8.5`; displayed value is not `8.4` and not `8.45`; `ratingCount=20`. | RATING-008-US-006 | Yes | API / UI |

## RATING-008-US-007 - Round 8.46 to 8.5

User Story ID: `RATING-008-US-007`

User Story Title: Round 8.46 to 8.5

User Story Summary: As QA, I want rounding above midpoint testable.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-008-US-007-TC-001 | Internal average 8.46 displays as 8.5 | Boundary, UI, API | Medium | Load `FX-R008-ROUND-846`; verify persisted total `211.5` across `25` rows. | Request/render aggregate data for `place-846`. | 1. Calculate `211.5 / 25 = 8.46`. 2. Request aggregate-bearing data. 3. Render aggregate UI. | Internal average is `8.46`; displayed average is exactly `8.5`; displayed value is not `8.4` and not `8.46`; `ratingCount=25`. | RATING-008-US-007 | Yes | API / UI |

## RATING-008-US-008 - Hide aggregate when unrated

User Story ID: `RATING-008-US-008`

User Story Title: Hide aggregate when unrated

User Story Summary: As a user, I do not want fake community ratings.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-008-US-008-TC-001 | Unrated place shows no fake average | Negative, UI, API | Medium | Load `FX-R008-UNRATED`; verify ratings table has `0` rows for `place-803`. | Request/render aggregate-bearing data for `place-803`. | 1. Query ratings for `place-803`. 2. Request place/list/detail aggregate data. 3. Render aggregate UI. 4. Inspect visible and accessible aggregate text. | Ratings table row count is `0`; no fake average such as `0.0`, `5.0`, or `10.0` is displayed; aggregate response/DOM does not expose a nonzero average; exact count representation is handled by `RATING-008-RC-002`. | RATING-008-US-008 | Yes | API / UI |

## RATING-008-US-009 - Aggregate updates after create

User Story ID: `RATING-008-US-009`

User Story Title: Aggregate updates after create

User Story Summary: As a user, I want community rating to update after a new rating so that data is current.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-008-US-009-TC-001 | New committed rating updates average and count after reload | Integration, API, Data Integrity | High | Load `FX-R008-CREATE-FRESHNESS`; authenticate as `user-003`; before create, `place-804` has ratings `8.0` and `10.0`. | `POST /api/v1/ratings` payload `{ "placeId": "place-804", "rating": 6.0, "notes": null }`; then reload documented aggregate-bearing place/list/detail data. | 1. Verify before aggregate: average `9.0`, count `2`. 2. Send POST as `user-003`. 3. Assert POST status. 4. Reload aggregate-bearing data. 5. Query ratings for `place-804`. | POST returns `201 Created`; ratings table rows for `place-804` become `8.0`, `10.0`, `6.0`; row count is `3`; internal/display average after reload is `8.0`; aggregate count after reload is `3`; private notes are absent from aggregate data. | RATING-008-US-009 | Yes | API / Integration |

## RATING-008-US-010 - Aggregate updates after edit

User Story ID: `RATING-008-US-010`

User Story Title: Aggregate updates after edit

User Story Summary: As a user, I want community rating to update after rating edits so that aggregate remains accurate.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-008-US-010-TC-001 | Rating edit updates average and does not increase count | Integration, API, Data Integrity | High | Load `FX-R008-EDIT-FRESHNESS`; authenticate as `user-003`; before edit ratings are `8.0`, `10.0`, `6.0`. | `PATCH /api/v1/ratings/place-805` payload `{ "rating": 9.0, "notes": "تحديث" }`; then reload documented aggregate-bearing data. | 1. Verify before aggregate: average `8.0`, count `3`. 2. Send PATCH as `user-003`. 3. Assert PATCH status. 4. Reload aggregate-bearing data. 5. Query ratings for `place-805`. | PATCH returns `200 OK`; ratings table rows become `8.0`, `10.0`, `9.0`; row count remains `3`; internal/display average after reload is `9.0`; aggregate count remains `3`; aggregate data does not expose note `تحديث`. | RATING-008-US-010 | Yes | API / Integration |

## RATING-008-US-011 - Aggregate excludes private notes

User Story ID: `RATING-008-US-011`

User Story Title: Aggregate excludes private notes

User Story Summary: As the system, I want aggregates free from note data.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-008-US-011-TC-001 | Aggregate schema excludes private note content | Security, Privacy, API | Critical | Load `FX-R008-NOTE-PRIVACY`; ratings for `place-806` include private notes `ملاحظة خاصة` and `private note`. | Request aggregate-bearing data for `place-806` from Places, Place Detail, list detail, and public list context where available. | 1. Request/render each aggregate surface. 2. Recursively scan JSON for note keys and note values. 3. Scan rendered DOM/accessibility text for note values. | Aggregate values are `averageRating=9.0` and `ratingCount=2`; aggregate JSON/DOM/accessibility text contains no `notes`, `note`, `privateNote`, `ملاحظة خاصة`, `private note`, hidden metadata, SQL, stack, debug, audit, or token fields. | RATING-008-US-011 | Yes | Security |

## RATING-008-US-012 - No cached aggregate table required

User Story ID: `RATING-008-US-012`

User Story Title: No cached aggregate table required

User Story Summary: As the system, I want MVP aggregate infrastructure simple.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-008-US-012-TV-001 | Verify no separate aggregate table is required for correctness | Traceability Verification, Data Integrity | Medium | Access to schema/traceability review artifacts for the release candidate. | Source traceability: `ratings` table is source for ratings/tried/notes/aggregates; no documented aggregate table is required for RATING-008 correctness. | 1. Review release schema/traceability. 2. Verify aggregate tests derive expected values from `ratings` rows. 3. Confirm no test requires a separate aggregate table to pass. | RATING-008 correctness is traceable to committed `ratings` rows; no executable product assertion depends on a separate aggregate table; if an aggregate cache/table is later introduced, it remains an implementation detail and must match the ratings-table source of truth. | RATING-008-US-012 | No | Traceability Verification |

## RATING-008-US-013 - Format aggregate in RTL UI

User Story ID: `RATING-008-US-013`

User Story Title: Format aggregate in RTL UI

User Story Summary: As a user, I want decimal aggregates readable in Arabic UI.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-008-US-013-TC-001 | RTL aggregate uses Western digits, period decimal, and LTR-safe formatting | UI, Accessibility, Localization | Medium | Load `FX-R008-ROUND-845`; app locale/layout is Arabic RTL. | Render aggregate for `place-845`, displayed average `8.5`, count `20`. | 1. Open Place Detail or another documented aggregate surface. 2. Inspect visible aggregate text. 3. Inspect accessibility text/name for the aggregate. 4. Search rendered text for Arabic-Indic digits and Arabic decimal separator. | Visible average uses Western digits `8.5`; decimal separator is period `.`; Arabic-Indic digits `٠١٢٣٤٥٦٧٨٩` are absent; numeric fragment is LTR-safe and does not reorder surrounding Arabic text; accessible text gives rating/count context. | RATING-008-US-013 | Yes | Accessibility |

## RATING-008-US-014 - Keep aggregate consistent across surfaces

User Story ID: `RATING-008-US-014`

User Story Title: Keep aggregate consistent across surfaces

User Story Summary: As a user, I want the same community rating wherever the place appears.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-008-US-014-TC-001 | Places, Place Detail, list detail, and public list show the same aggregate after refresh | UI, Integration, Data Integrity | High | Load `FX-R008-AVG-9`; `place-801` appears in Places, Place Detail, owned list `list-801`, and public list `list-public-801`. | Aggregate source for `place-801`: ratings `8.0` and `10.0`, expected display `9.0`, count `2`. | 1. Refresh Places. 2. Refresh Place Detail for `place-801`. 3. Refresh owned list detail containing `place-801`. 4. Refresh public list detail containing `place-801`. 5. Compare visible and response aggregate values. | Each refreshed surface shows or returns the same average `9.0` and count `2` for `place-801`; no surface shows stale or conflicting average/count; private notes are absent from all aggregate surfaces. | RATING-008-US-014 | Yes | UI E2E |

## RATING-008-US-015 - Handle concurrent aggregate updates

User Story ID: `RATING-008-US-015`

User Story Title: Handle concurrent aggregate updates

User Story Summary: As the system, I want aggregates reliable under concurrent ratings.

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| RATING-008-US-015-TC-001 | Concurrent committed rating creates are reflected in final average and count | Concurrency, API, Data Integrity | Medium | Load `FX-R008-CONCURRENT`; authenticate concurrent requests as `user-003` and `user-004`; before aggregate for `place-807` is average `8.0`, count `2`. | Request A: `POST /api/v1/ratings` payload `{ "placeId": "place-807", "rating": 10.0, "notes": null }`; Request B: `POST /api/v1/ratings` payload `{ "placeId": "place-807", "rating": 6.0, "notes": null }`. | 1. Dispatch Request A and Request B concurrently. 2. Wait for both commits. 3. Reload aggregate-bearing data for `place-807`. 4. Query committed ratings for `place-807`. | Each successful create returns documented `201 Created`; after both commits, ratings table rows are `8.0`, `8.0`, `10.0`, and `6.0`; final average is `8.0`; final count is `4`; aggregate data reflects committed rows only and exposes no private notes. | RATING-008-US-015 | Yes | API |

## Supplemental Requirement-Supported Coverage

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RATING-008-API-TC-001 | Aggregate-bearing responses expose required average/count and omit forbidden fields | API, Contract, Security | High | Load `FX-R008-AVG-9` and `FX-R008-NOTE-PRIVACY`. | Request documented aggregate-bearing endpoints for `place-801` and `place-806`. | 1. Request each documented aggregate surface. 2. Assert average/count values. 3. Recursively scan response keys and values. | Aggregate-bearing place/list responses expose average/count values for the place; responses contain no note content, hidden metadata, audit/debug fields, SQL, stack traces, tokens, or other users' private data. | RATING-008-US-011 | Yes | API | Source: RATING-008-US-001, RATING-008-US-002, RATING-008-US-011. |
| RATING-008-RESP-TC-001 | Aggregate values fit required responsive matrix | Responsive, UI | High | Load `FX-R008-ROUND-845`; aggregate display value is `8.5`, count `20`. | Viewports `320x568`, `390x844`, `430x932`, `768x1024`, `1024x768`, `1440x900`. | 1. Render aggregate-bearing surfaces at each viewport. 2. Inspect average/count text. 3. Measure `document.documentElement.scrollWidth` and `window.innerWidth`. | Average/count remain visible or reachable at every viewport; `document.documentElement.scrollWidth <= window.innerWidth`; aggregate text does not collide with place/list row content; bottom navigation and safe areas do not obscure aggregate controls/content. | RATING-008-US-013 | Yes | UI E2E | Source: `RESP-002-US-001`, `RESP-002-US-002`, `RESP-002-US-005`, `RESP-002-US-016`, `RESP-002-US-020`. |
| RATING-008-RESP-TC-002 | Aggregate values remain readable at 200% zoom | Responsive, Accessibility, UI | High | Load `FX-R008-ROUND-845`; aggregate display value is `8.5`, count `20`. | Browser zoom `200%`; aggregate surfaces for Places, Place Detail, and list detail. | 1. Set 200% zoom. 2. Render aggregate surfaces. 3. Inspect visible and accessible numeric text. 4. Measure overflow. | No horizontal overflow occurs; average `8.5` and count `20` remain readable and accessible; interactive row targets remain at least `44x44` CSS pixels where rows are interactive; no aggregate value is clipped. | RATING-008-US-013 | Yes | Accessibility | Source: `RESP-003-US-001`, `RESP-003-US-002`, `RESP-003-US-003`, `RESP-003-US-008`, `RESP-003-US-013`, `RESP-004-US-009`. |
| RATING-008-A11Y-TC-001 | Aggregate average and count have accessible numeric context | Accessibility, UI | High | Load `FX-R008-AVG-9`; aggregate display value is `9.0`, count `2`. | Screen-reader inspection for aggregate-bearing surfaces. | 1. Navigate to aggregate text with assistive technology. 2. Inspect accessible names/descriptions. 3. Verify numeric context. | Assistive technology can determine that `9.0` is the community average rating and `2` is the rating count; selected/focus states are not used as the only way to communicate aggregate values; visible focus remains clear on interactive rows or links. | RATING-008-US-013 | Yes | Accessibility | Source: `RESP-004-US-001`, `RESP-004-US-003`, `RESP-004-US-004`, `RESP-004-US-009`, `RESP-001-US-008`. |

## Requirement Clarification, Manual Verification, And Traceability Cases

These cases are intentionally separated from executable tests because the allowed sources do not define one deterministic executable assertion.

| Case ID | Title | Type | Priority | Related User Story ID | Clarification Needed | Risk If Ignored | Recommended Owner |
|---|---|---|---|---|---|---|---|
| RATING-008-RC-001 | Exact GET success status and aggregate response envelope | Requirement Clarification | High | RATING-008-US-001 | Define exact HTTP status and response envelope for aggregate-bearing `GET` endpoints. | API tests may overfit implementation-specific envelopes. | Product + Backend |
| RATING-008-RC-002 | Exact unrated count representation | Requirement Clarification | Medium | RATING-008-US-008 | Define whether unrated aggregate count must be returned/displayed as `0` or omitted on each surface. | Tests may incorrectly fail an allowed representation. | Product + Design |
| RATING-008-TV-001 | No separate aggregate table required | Traceability Verification | Medium | RATING-008-US-012 | Verify schema/traceability confirms correctness derives from `ratings` rows without requiring a separate aggregate table. | QA may test implementation details rather than product correctness. | QA Architect |
| RATING-008-TV-002 | Cross-surface ownership boundary | Traceability Verification | High | RATING-008-US-014 | Verify RATING-008 owns aggregate value consistency, while full Places/List/Public List rendering remains owned by those modules. | Cross-feature tests may duplicate unrelated UI ownership. | QA Architect |

## Coverage Summary

| User Story | Executable Tests | Clarification / Manual / Traceability Cases | Coverage Notes |
|---|---:|---:|---|
| RATING-008-US-001 | 2 | 1 | Exact average and aggregate contract covered; GET envelope/status clarified. |
| RATING-008-US-002 | 2 | 0 | Exact count fixtures covered. |
| RATING-008-US-003 | 1 | 0 | Full precision before display rounding covered. |
| RATING-008-US-004 | 1 | 0 | One decimal and trailing zero handling covered. |
| RATING-008-US-005 | 1 | 0 | `8.44 -> 8.4` covered. |
| RATING-008-US-006 | 1 | 0 | `8.45 -> 8.5` covered. |
| RATING-008-US-007 | 2 | 0 | `8.46 -> 8.5` and full precision covered. |
| RATING-008-US-008 | 1 | 1 | No fake average covered; count representation clarified. |
| RATING-008-US-009 | 1 | 0 | Create freshness covered with exact new average/count. |
| RATING-008-US-010 | 1 | 0 | Edit freshness covered with exact average/count and unchanged count. |
| RATING-008-US-011 | 2 | 0 | Note exclusion and forbidden-field scanning covered. |
| RATING-008-US-012 | 0 | 1 | Correctly tracked as traceability rather than implementation assertion. |
| RATING-008-US-013 | 4 | 0 | RTL formatting, responsive, zoom, and accessible numeric context covered. |
| RATING-008-US-014 | 1 | 1 | Cross-surface aggregate consistency covered; ownership boundary tracked. |
| RATING-008-US-015 | 1 | 0 | Concurrent final observable aggregate covered. |

## Final Summary

- User Stories Processed: 15
- Executable Test Cases: 18
- Requirement Clarification Cases: 2
- Manual Verification Cases: 0
- Traceability Verification Cases: 2
- Total Cases: 23

### Count By Test Type

- Accessibility: 3
- API: 11
- Boundary: 4
- Concurrency: 1
- Contract: 1
- Data Integrity: 8
- Formatting: 1
- Integration: 3
- Localization: 1
- Negative: 1
- Privacy: 1
- Responsive: 2
- Security: 2
- Traceability Verification: 3
- UI: 10

### Count By Priority

- Critical: 1
- High: 13
- Medium: 9

### Count By Automation Layer

- API: 4
- API / UI: 5
- API / Integration: 2
- Security: 1
- UI E2E: 3
- Accessibility: 3
- Requirement Clarification: 2
- Traceability Verification: 3

### Top Automation Candidates

1. `RATING-008-US-001-TC-001` - exact average `9.0` from two rows.
2. `RATING-008-US-002-TC-001` - exact count `3`.
3. `RATING-008-US-005-TC-001` - rounding `8.44 -> 8.4`.
4. `RATING-008-US-006-TC-001` - rounding `8.45 -> 8.5`.
5. `RATING-008-US-007-TC-001` - rounding `8.46 -> 8.5`.
6. `RATING-008-US-009-TC-001` - aggregate freshness after create.
7. `RATING-008-US-010-TC-001` - aggregate freshness after edit.
8. `RATING-008-US-015-TC-001` - concurrent committed rows.

## Validation

- Duplicate Test IDs = 0
- Invalid Story References = 0
- Missing User Stories = 0
- Encoding/Mojibake = 0
- Generic Executable Wording = 0
- Requirement Fidelity Violations = 0
- Feature Ownership Violations = 0
- Mathematical Expectation Mismatches = 0
- Disallowed Source References = 0
- Undocumented HTTP Status Assumptions = 0
