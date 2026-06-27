# PLACE-007 Test Cases

Feature: `PLACE-007 - Highest average rating first, unrated last`

Source: `docs/user-stories/PLACES_USER_STORIES.md`

Scope: All user stories under `PLACE-007`.

## QA Execution Standards

- Default Places ordering is server-side `rating_desc`: `averageRating DESC`, then `ratingCount DESC`, then `normalized_name ASC`.
- Places with `averageRating = null` are unrated and must appear after all rated places. Do not treat `0`, `0.0`, or missing UI text as a real unrated display value.
- Valid `GET /api/v1/places` responses must follow `{ data, meta }`; `meta.sort` must equal `rating_desc`; `meta.limit`, `meta.offset`, and `meta.total` must describe the sliced result set.
- Sorting must be applied before pagination/offset slicing and must remain stable across refresh, back/forward navigation, continuous scrolling, filtering, and search.
- Rating aggregate changes are reflected after reload/refetch. Rating deletion is unsupported in current product scope and must not be required to update ordering.
- Search ranking, when active, remains primary for PLACE-006; default rating sort is used as the tie-breaker within the same search-rank group.
- Responses and error payloads must never expose private notes, private list membership, creator identity, internal moderation data, tokens, cookies, SQL, or stack traces.
- Arabic test data must remain valid UTF-8 Arabic, including `مطعم ألف`, `مطعم باء`, `قهوة الرياض`, and `لا توجد نتائج`. No mojibake, escaped Arabic code points, or replacement characters are permitted.
- Rating display uses Western digits, period decimal separator, at most one decimal place, and LTR isolation in RTL UI.
- Responsive certification points for this feature are `320x568`, `390x844`, `430x932`, landscape `844x390`, and 200% zoom/adaptive pressure.
- Responsive UI tests must assert `document.documentElement.scrollWidth <= window.innerWidth`.
- Minimum interactive touch target for result rows and retry/recovery controls is `44x44` CSS pixels.
- Accessibility baseline: semantic row links, keyboard navigation, visible focus, screen-reader-readable rating text, live-region updates for reload/error states, and no focus loss during continuous scrolling.
- Automation cadence values used in Notes: Smoke, Regression, Nightly, and Manual Review.

## PLACE-007-US-001 - Sort by average rating descending

User Story Summary: As a user, I want highest-rated places first so that quality is easy to scan.

Related Feature ID: `PLACE-007`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-007-US-001-TC-001 | API default sort returns highest average rating first | API, Positive, Data Integrity | Critical | Authenticated request. Places exist with averages `9.5`, `9.0`, `8.5`, and `8.0`. | `GET /api/v1/places?limit=20&offset=0`. | 1. Send request. 2. Inspect returned `averageRating` sequence. | Status `200 OK`; rated rows appear in descending `averageRating` order before any lower-rated row. | PLACE-007-US-001 | Yes | API | Smoke cadence. |
| PLACE-007-US-001-TC-002 | UI renders highest-rated row first | UI, Regression | Critical | Valid session. Same fixture as API test. | `/places`. | 1. Open Places page. 2. Inspect first visible rows and displayed ratings. | First visible rated row has highest `averageRating`; subsequent rated rows do not increase in rating value. | PLACE-007-US-001 | Yes | UI E2E | Smoke cadence. |
| PLACE-007-US-001-TC-003 | Decimal averages sort correctly | API, Boundary, Data Integrity | High | Authenticated request. Places exist with `9.5`, `9.4`, `9.0`, `8.5`. | `GET /api/v1/places`. | 1. Send request. 2. Inspect rated order. | Status `200 OK`; order is `9.5`, `9.4`, `9.0`, `8.5` before lower or unrated rows. | PLACE-007-US-001 | Yes | API | Regression cadence. |
| PLACE-007-US-001-TC-004 | Single rated place appears before all unrated places | API, Edge, Data Integrity | High | Authenticated request. One rated place and multiple unrated places exist. | Rated `8.0`, others `averageRating=null`. | 1. Send `GET /api/v1/places`. 2. Inspect order. | Status `200 OK`; the single rated place appears before every unrated place. | PLACE-007-US-001 | Yes | API | Regression cadence. |
| PLACE-007-US-001-TC-005 | Many rated places preserve descending order | API, Data Integrity, Performance | Medium | Authenticated request. At least 100 rated places exist. | `limit=100&offset=0`. | 1. Send request. 2. Validate every adjacent rated pair. | Status `200 OK`; for each adjacent rated pair, previous `averageRating >=` next `averageRating`. | PLACE-007-US-001 | Yes | API | Nightly cadence. |
| PLACE-007-US-001-TC-006 | Frontend does not client-resort server response | UI, Integration, Regression | High | Valid session. API response order is controlled by fixture. | Mock/fixture response already sorted by server. | 1. Load Places page with controlled response. 2. Capture rendered IDs. | Rendered row IDs preserve API order exactly; frontend does not apply a conflicting client-side sort. | PLACE-007-US-001 | Yes | UI E2E | Regression cadence. |
| PLACE-007-US-001-TC-007 | Guest default sort request returns 401 | API, Authentication, Authorization | Critical | No valid session. | `GET /api/v1/places`. | 1. Clear auth. 2. Send request. | Status `401 Unauthorized`; no place rows, sorting metadata, private fields, or counts are returned. | PLACE-007-US-001 | Yes | API | Smoke cadence. |
| PLACE-007-US-001-TC-008 | Default sort response excludes forbidden fields | API, Privacy, Security, Contract | Critical | Authenticated request. Internal/private data exists. | `GET /api/v1/places?limit=20&offset=0`. | 1. Send request. 2. Recursively inspect response. | Status `200 OK`; response excludes private notes, private list membership, creator identity, moderation fields, tokens, cookies, SQL, and stack traces. | PLACE-007-US-001 | Yes | API | Smoke cadence. |
| PLACE-007-US-001-TC-009 | Sorted response schema includes required row fields | API, Contract | Critical | Authenticated request. At least one rated and one unrated place exist. | `GET /api/v1/places?limit=20&offset=0`. | 1. Send request. 2. Inspect every row in `data`. | Status `200 OK`; each row includes `id`, `name`, `type`, `subtype`, `averageRating`, `ratingCount`, `createdAt`, and `updatedAt`; no required field is missing. | PLACE-007-US-001 | Yes | API | Smoke cadence. |
| PLACE-007-US-001-TC-010 | Guest sorted page has no private-data flash | Authentication, Authorization, Privacy, UI | Critical | No valid session. Browser may contain cached Places UI from a prior authenticated session. | `/places`. | 1. Clear auth tokens/cookies. 2. Open `/places`. 3. Observe first render through auth resolution. | UI shows neutral auth/loading or login state; no cached sorted rows, ratings context, private notes, private list membership, creator identity, or protected metadata render before denial/redirect completes. | PLACE-007-US-001 | Yes | UI E2E | Smoke cadence. |
| PLACE-007-US-001-TC-011 | Maximum valid rating sorts before lower ratings | API, Boundary, Data Integrity | High | Authenticated request. Places exist with `averageRating=10.0`, `9.9`, and `9.5`. | `GET /api/v1/places`. | 1. Send request. 2. Inspect rated order. | Status `200 OK`; place with `10.0` appears before `9.9`, and `9.9` appears before `9.5`. | PLACE-007-US-001 | Yes | API | Regression cadence. |

## PLACE-007-US-002 - Keep unrated places last

User Story Summary: As a user, I want unrated places after rated places so that ratings remain meaningful.

Related Feature ID: `PLACE-007`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-007-US-002-TC-001 | API places all unrated rows after rated rows | API, Data Integrity | Critical | Authenticated request. Mixed rated and unrated places exist. | Rated `9.0`, `7.5`; unrated `averageRating=null`. | 1. Send `GET /api/v1/places`. 2. Inspect transition point. | Status `200 OK`; once an unrated row appears, no later row has non-null `averageRating`. | PLACE-007-US-002 | Yes | API | Smoke cadence. |
| PLACE-007-US-002-TC-002 | UI does not show unrated row before rated row | UI, Regression | High | Valid session. Mixed rated/unrated catalog exists across at least two loaded pages. | `/places`. | 1. Open page. 2. Scroll until two pages are loaded. 3. Inspect visible rows. | Every visible rated row appears before visible unrated rows; no unrated row precedes a later loaded rated row. | PLACE-007-US-002 | Yes | UI E2E | Regression cadence. |
| PLACE-007-US-002-TC-003 | All-unrated catalog sorts by normalized name | API, Edge, Data Integrity | Medium | Authenticated request. All places have `averageRating=null` and `ratingCount=0`. | Names `Beta`, `Alpha`, `Gamma`. | 1. Send request. 2. Inspect order. | Status `200 OK`; all rows are unrated and sorted by `normalized_name ASC`. | PLACE-007-US-002 | Yes | API | Regression cadence. |
| PLACE-007-US-002-TC-004 | Unrated API value remains null | API, Contract, Data Integrity | High | Authenticated request. Unrated place exists. | `GET /api/v1/places`. | 1. Send request. 2. Inspect unrated row. | Status `200 OK`; unrated row has `averageRating=null` and `ratingCount=0`, not `0` or `0.0`. | PLACE-007-US-002 | Yes | API | Smoke cadence. |
| PLACE-007-US-002-TC-005 | Unrated row does not display fake rating | UI, Privacy, Regression | High | Valid session. Unrated place exists. | Unrated row. | 1. Open `/places`. 2. Inspect unrated row. | Row does not display `0`, `0.0`, `لا تقييم`, `null`, `undefined`, or any fake rating. | PLACE-007-US-002 | Yes | UI E2E | Smoke cadence. |
| PLACE-007-US-002-TC-006 | Unrated last rule holds across pagination boundary | API, Pagination, Data Integrity | Critical | Authenticated request. Last rated row is near page boundary. | `limit=10`, offsets around rated/unrated transition. | 1. Request page before and after transition. 2. Combine rows. | Status `200 OK`; combined rows keep all rated places before all unrated places and no duplicates appear. | PLACE-007-US-002 | Yes | API | Regression cadence. |
| PLACE-007-US-002-TC-007 | Unrated rows remain accessible and openable | Accessibility, UI, Keyboard | Medium | Valid session. Unrated rows visible. | Keyboard navigation. | 1. Tab to an unrated row. 2. Activate with Enter. | Row has accessible name based on place name/type; focus-visible is present; Enter opens place detail despite missing rating. | PLACE-007-US-002 | Yes | Accessibility | Regression cadence. |

## PLACE-007-US-003 - Tie-break by rating count

User Story Summary: As a user, I want more reliable ratings ranked higher when averages tie.

Related Feature ID: `PLACE-007`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-007-US-003-TC-001 | Higher rating count wins average tie | API, Data Integrity | High | Authenticated request. Two places have `averageRating=8.5`; counts are `42` and `7`. | `GET /api/v1/places`. | 1. Send request. 2. Locate tied rows. | Status `200 OK`; row with `ratingCount=42` appears before row with `ratingCount=7`. | PLACE-007-US-003 | Yes | API | Smoke cadence. |
| PLACE-007-US-003-TC-002 | UI tie-break displays higher count first | UI, Regression | Medium | Valid session. Same tied fixture exists. | `/places`. | 1. Open page. 2. Inspect tied rating rows. | Both rows display `8.5`; the row with higher count appears first and count display is readable. | PLACE-007-US-003 | Yes | UI E2E | Regression cadence. |
| PLACE-007-US-003-TC-003 | Rating count tie-break applies within filtered results | API, Integration | Medium | Authenticated request. Tied burger places exist. | `GET /api/v1/places?type=restaurant&subtype=burger`. | 1. Send request. 2. Inspect tied rows. | Status `200 OK`; within matching burger subset, higher `ratingCount` appears first when averages tie. | PLACE-007-US-003 | Yes | API | Regression cadence. |
| PLACE-007-US-003-TC-004 | Rating count tie-break applies across pagination | API, Pagination, Data Integrity | High | Authenticated request. Tied average group spans two pages. | `limit=2`, offsets `0`, `2`. | 1. Request pages. 2. Combine tied group. | Status `200 OK`; combined tied group is ordered by `ratingCount DESC` without duplicates or missing rows. | PLACE-007-US-003 | Yes | API | Regression cadence. |
| PLACE-007-US-003-TC-005 | Equal average and count falls through to name tie-break | API, Data Integrity | Medium | Authenticated request. Two places have same `averageRating` and `ratingCount`. | Names `Alpha`, `Beta`, both `8.5`, count `10`. | 1. Send request. 2. Inspect order. | Status `200 OK`; `Alpha` appears before `Beta` by normalized name ascending. | PLACE-007-US-003 | Yes | API | Regression cadence. |

## PLACE-007-US-004 - Tie-break by normalized name

User Story Summary: As the system, I want stable ordering so that pagination does not jump.

Related Feature ID: `PLACE-007`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-007-US-004-TC-001 | Normalized name ascending resolves full tie | API, Data Integrity | High | Authenticated request. Places have identical `averageRating=8.0` and `ratingCount=5`. | Names `Beta`, `Alpha`, `Gamma`. | 1. Send request. 2. Inspect tied group. | Status `200 OK`; tied group order is `Alpha`, `Beta`, `Gamma` by normalized name ASC. | PLACE-007-US-004 | Yes | API | Smoke cadence. |
| PLACE-007-US-004-TC-002 | Identical visible names use deterministic normalized tie | API, Edge, Data Integrity | Medium | Authenticated request. Two distinct places have visually identical names after display normalization but distinct IDs. | Same display name, same rating/count. | 1. Send request twice. 2. Compare order. | Status `200 OK`; order is identical across repeated calls and pagination does not duplicate or drop either row. | PLACE-007-US-004 | Yes | API | Regression cadence. |
| PLACE-007-US-004-TC-003 | Name tie-break is case-insensitive | API, Validation, Data Integrity | Medium | Authenticated request. Tied places named `alpha` and `Alpha Bistro` exist. | Same rating/count. | 1. Send request. 2. Inspect order. | Status `200 OK`; ordering follows normalized lowercase name, not raw case-sensitive ordering. | PLACE-007-US-004 | Yes | API | Regression cadence. |
| PLACE-007-US-004-TC-004 | Name tie-break ignores leading/trailing whitespace normalization | API, Validation | Medium | Authenticated request. Tied places include normalized names with trimmed whitespace. | Names normalize to `alpha` and `beta`. | 1. Send request. 2. Inspect order. | Status `200 OK`; normalized name ASC is used after trimming/collapsing whitespace. | PLACE-007-US-004 | Yes | API | Regression cadence. |
| PLACE-007-US-004-TC-005 | UI preserves server order for name tie-breaks | UI, Regression | Medium | Valid session. Fully tied group visible. | `/places`. | 1. Open page. 2. Capture API ID order and rendered ID order. | Rendered order matches API order exactly for tied rows. | PLACE-007-US-004 | Yes | UI E2E | Regression cadence. |
| PLACE-007-US-004-TC-006 | Name tie-break has no horizontal overflow in long names | Responsive, UI, Mobile | Medium | Valid session. Tied group includes long English and Arabic names. | `320x568`. | 1. Set viewport. 2. Open `/places`. 3. Inspect tied rows. | Long names are contained; ratings remain visible; `document.documentElement.scrollWidth <= window.innerWidth`. | PLACE-007-US-004 | Yes | UI E2E | Regression cadence. |

## PLACE-007-US-005 - Preserve sort across pagination

User Story Summary: As a user, I want pagination to continue the same global order so that places are not duplicated or skipped.

Related Feature ID: `PLACE-007`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-007-US-005-TC-001 | API applies global sort before offset slicing | API, Pagination, Data Integrity | Critical | Authenticated request. At least 30 places exist with mixed ratings. | `limit=10`, offsets `0`, `10`, `20`. | 1. Request three pages. 2. Combine IDs and ratings. | Each response returns `200 OK`; combined rows match the first 30 items of the global `rating_desc` order. | PLACE-007-US-005 | Yes | API | Smoke cadence. |
| PLACE-007-US-005-TC-002 | Pagination has no duplicate place IDs | API, Data Integrity, Regression | Critical | Authenticated request. Multi-page catalog exists. | `limit=10`, offsets `0`, `10`, `20`. | 1. Request pages. 2. Collect IDs. | Status `200 OK` for each page; no duplicate IDs appear across requested pages. | PLACE-007-US-005 | Yes | API | Smoke cadence. |
| PLACE-007-US-005-TC-003 | Pagination has no missing rows in combined range | API, Data Integrity | High | Authenticated request. Expected global sorted ID list is known in fixture. | First 30 expected IDs. | 1. Request three pages. 2. Compare combined IDs to expected first 30. | Each page returns `200 OK`; combined IDs exactly equal expected global sorted first 30 IDs. | PLACE-007-US-005 | Yes | API | Regression cadence. |
| PLACE-007-US-005-TC-004 | Offset beyond total returns empty sorted page metadata | API, Boundary, Contract | Medium | Authenticated request. Total count known. | `limit=10&offset=<total+10>`. | 1. Send request. 2. Inspect envelope. | Status `200 OK`; `data=[]`; `meta.total` remains full catalog total; `meta.sort=rating_desc`; `meta.offset` equals requested offset. | PLACE-007-US-005 | Yes | API | Regression cadence. |
| PLACE-007-US-005-TC-005 | Invalid negative offset is rejected | API, Boundary, Validation | High | Authenticated request. | `GET /api/v1/places?limit=10&offset=-1`. | 1. Send request. 2. Inspect response. | Status `422 Validation Error`; no place data or private fields are returned. | PLACE-007-US-005 | Yes | API | Regression cadence. |
| PLACE-007-US-005-TC-006 | Invalid zero limit is rejected | API, Boundary, Validation | High | Authenticated request. | `GET /api/v1/places?limit=0&offset=0`. | 1. Send request. 2. Inspect response. | Status `422 Validation Error`; no place data or private fields are returned. | PLACE-007-US-005 | Yes | API | Regression cadence. |
| PLACE-007-US-005-TC-007 | UI continuous pagination appends server order | UI, Integration, Regression | High | Valid session. More than two pages exist. | `/places`. | 1. Open page. 2. Scroll until at least three pages load. 3. Collect rendered IDs. | Rendered IDs match API page order, append without duplication, and preserve global `rating_desc` order. | PLACE-007-US-005 | Yes | UI E2E | Regression cadence. |
| PLACE-007-US-005-TC-008 | Pagination performance remains within budget | Performance, API | Medium | Authenticated request. Catalog fixture has at least 1,000 places. | `limit=20&offset=500`. | 1. Send request under controlled test environment. 2. Measure server response time. | Status `200 OK`; p95 server response time for sorted page is at or below 500 ms and order remains correct. | PLACE-007-US-005 | Yes | Performance | Nightly cadence. |
| PLACE-007-US-005-TC-009 | Refresh preserves default sorted order | UI, Regression | High | Valid session. Multi-page sorted fixture is stable. | `/places`. | 1. Open page. 2. Record first 10 rendered IDs. 3. Refresh browser. 4. Record first 10 rendered IDs again. | After refresh, first 10 IDs match the same server-side `rating_desc` order while fixture data is unchanged. | PLACE-007-US-005 | Yes | UI E2E | Regression cadence. |
| PLACE-007-US-005-TC-010 | Initial sorted request failure shows retry without leaking data | Error Handling, Privacy, UI | Critical | Valid session. Initial `GET /api/v1/places` fails with `500`. | `/places`, first request returns `500`. | 1. Open page. 2. Force initial sorted request to fail. 3. Inspect error state. | UI shows a retry action with no sorted rows rendered; error text exposes no private notes, list membership, creator identity, SQL, stack traces, tokens, or cookies. | PLACE-007-US-005 | Yes | UI E2E | Smoke cadence. |
| PLACE-007-US-005-TC-011 | Initial sorted retry reloads rating_desc order | Error Handling, UI, API | High | Valid session. Initial request failed and retry is visible. | Retry after `500`. | 1. Activate retry. 2. Inspect request and rendered rows. | Retry sends `GET /api/v1/places`; response returns `200 OK`; rows render in `rating_desc` order with `meta.sort=rating_desc`. | PLACE-007-US-005 | Yes | UI E2E | Regression cadence. |
| PLACE-007-US-005-TC-012 | Repeated refresh under large catalog preserves order | Performance, UI, Regression | Medium | Valid session. Catalog fixture has at least 1,000 places and stable aggregates. | `/places`, repeated refresh 5 times. | 1. Open page. 2. Refresh five times. 3. Record first 20 IDs after each refresh. | Each refresh completes without duplicate rows; first 20 IDs remain identical while fixture data is unchanged; p95 first-page render is at or below 1,000 ms in controlled browser fixture. | PLACE-007-US-005 | Yes | Performance | Nightly cadence. |

## PLACE-007-US-006 - Preserve sort with filters

User Story Summary: As a user, I want filtered results still ranked consistently.

Related Feature ID: `PLACE-007`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-007-US-006-TC-001 | Restaurant filter preserves rating sort | API, Integration, Data Integrity | High | Authenticated request. Restaurant and non-restaurant places exist. | `GET /api/v1/places?type=restaurant`. | 1. Send request. 2. Inspect rows. | Status `200 OK`; every row has `type=restaurant`; restaurant subset follows `rating_desc` order. | PLACE-007-US-006 | Yes | API | Smoke cadence. |
| PLACE-007-US-006-TC-002 | Cafe filter preserves rating sort | API, Integration, Data Integrity | High | Authenticated request. Cafe places exist. | `GET /api/v1/places?type=cafe`. | 1. Send request. 2. Inspect rows. | Status `200 OK`; every row has `type=cafe`; cafe subset follows `rating_desc` order. | PLACE-007-US-006 | Yes | API | Regression cadence. |
| PLACE-007-US-006-TC-003 | Ice cream filter preserves rating sort and unrated last | API, Integration | High | Authenticated request. Ice cream rated and unrated places exist. | `GET /api/v1/places?type=ice_cream`. | 1. Send request. 2. Inspect rows. | Status `200 OK`; every row has `type=ice_cream`; rated rows sort descending and unrated rows are last. | PLACE-007-US-006 | Yes | API | Regression cadence. |
| PLACE-007-US-006-TC-004 | Restaurant subtype filter preserves rating sort | API, Integration | High | Authenticated request. Burger subtype has mixed ratings. | `GET /api/v1/places?type=restaurant&subtype=burger`. | 1. Send request. 2. Inspect rows. | Status `200 OK`; every row has `subtype=burger`; subset follows rating, count, name tie-break order. | PLACE-007-US-006 | Yes | API | Regression cadence. |
| PLACE-007-US-006-TC-005 | Search results use rating sort within same search rank group | API, Integration, Data Integrity | High | Authenticated request. Query has multiple exact matches with different ratings. | `GET /api/v1/places?q=Malfa`. | 1. Send request. 2. Inspect exact-match group. | Status `200 OK`; within the same search rank group, higher average rating appears first, then rating count, then normalized name. | PLACE-007-US-006 | Yes | API | Smoke cadence. |
| PLACE-007-US-006-TC-006 | UI filtered sort preserves active filter state | UI, Integration, Regression | Medium | Valid session. Restaurant filter active. | `/places?type=restaurant`. | 1. Open URL. 2. Inspect selected filter and row order. | Restaurant filter remains selected; rows are restaurant-only and ordered by rating-desc rules. | PLACE-007-US-006 | Yes | UI E2E | Regression cadence. |
| PLACE-007-US-006-TC-007 | Invalid filter with sort returns validation error | API, Negative, Validation | Medium | Authenticated request. | `GET /api/v1/places?type=invalid`. | 1. Send request. 2. Inspect response. | Status `422 Validation Error`; no place data, private fields, SQL, or stack traces are returned. | PLACE-007-US-006 | Yes | API | Regression cadence. |
| PLACE-007-US-006-TC-008 | Filtered sorted results remain responsive | Responsive, UI, Mobile | Medium | Valid session. Filtered rows visible. | `390x844`, `/places?type=restaurant&subtype=burger`. | 1. Set viewport. 2. Open URL. 3. Evaluate layout. | Rating values, names, filters, and rows remain inside viewport; `document.documentElement.scrollWidth <= window.innerWidth`. | PLACE-007-US-006 | Yes | UI E2E | Regression cadence. |
| PLACE-007-US-006-TC-009 | Deep-link filtered URL initializes sorted results | UI, Integration, Regression | High | Valid session. Restaurant burger places have mixed ratings. | `/places?type=restaurant&subtype=burger`. | 1. Open URL directly in a new tab. 2. Inspect request, selected filters, and row order. | Request returns `200 OK`; type and subtype filters initialize selected; rows match the filter and follow rating-desc rules. | PLACE-007-US-006 | Yes | UI E2E | Smoke cadence. |
| PLACE-007-US-006-TC-010 | Browser back restores previous sorted filter state | UI, Regression | High | Valid session. Browser history contains restaurant then cafe filter states. | `/places?type=restaurant`, `/places?type=cafe`. | 1. Open restaurant URL. 2. Switch to cafe. 3. Press Back. | URL restores restaurant filter; restaurant rows render in rating-desc order; no stale cafe rows remain. | PLACE-007-US-006 | Yes | UI E2E | Regression cadence. |
| PLACE-007-US-006-TC-011 | Browser forward restores later sorted filter state | UI, Regression | High | Valid session. After TC-010, browser can move forward. | Forward to cafe state. | 1. Press Forward. 2. Inspect URL, selected filter, and rows. | URL restores cafe filter; cafe rows render in rating-desc order; no stale restaurant rows remain. | PLACE-007-US-006 | Yes | UI E2E | Regression cadence. |
| PLACE-007-US-006-TC-012 | Invalid sort parameter is rejected or ignored by explicit contract | API, Negative, Contract | Medium | Authenticated request. API accepts query parameters. | `GET /api/v1/places?sort=name_asc`. | 1. Send request. 2. Inspect response. | Status `422 Validation Error`; unsupported visible sort values are not silently applied and no place data or private fields are returned. | PLACE-007-US-006 | Yes | API | Regression cadence. |

## PLACE-007-US-007 - Return sort metadata

User Story Summary: As an API consumer, I want the active sort visible so that clients can verify behavior.

Related Feature ID: `PLACE-007`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-007-US-007-TC-001 | Default places response includes rating_desc sort metadata | API, Contract | High | Authenticated request. | `GET /api/v1/places`. | 1. Send request. 2. Inspect `meta.sort`. | Status `200 OK`; `meta.sort` equals `rating_desc`. | PLACE-007-US-007 | Yes | API | Smoke cadence. |
| PLACE-007-US-007-TC-002 | Filtered response includes rating_desc sort metadata | API, Contract, Integration | Medium | Authenticated request. | `GET /api/v1/places?type=cafe`. | 1. Send request. 2. Inspect metadata. | Status `200 OK`; `meta.sort=rating_desc`, with filter-scoped `meta.total`. | PLACE-007-US-007 | Yes | API | Regression cadence. |
| PLACE-007-US-007-TC-003 | Search response includes sort metadata | API, Contract, Integration | Medium | Authenticated request. | `GET /api/v1/places?q=Malfa`. | 1. Send request. 2. Inspect metadata. | Status `200 OK`; `meta.sort=rating_desc`; search results still follow search rank with rating sort as tie-breaker. | PLACE-007-US-007 | Yes | API | Regression cadence. |
| PLACE-007-US-007-TC-004 | Empty response includes sort metadata | API, Contract, Empty State | Medium | Authenticated request. Query/filter returns no rows. | `GET /api/v1/places?q=zzzz-no-match`. | 1. Send request. 2. Inspect envelope. | Status `200 OK`; `data=[]`; `meta.sort=rating_desc`; `meta.total=0`. | PLACE-007-US-007 | Yes | API | Regression cadence. |
| PLACE-007-US-007-TC-005 | Unauthorized response does not leak sort metadata | API, Security, Authorization | High | No valid session. | `GET /api/v1/places`. | 1. Clear auth. 2. Send request. | Status `401 Unauthorized`; response does not include catalog data, totals, sorted IDs, or private metadata. | PLACE-007-US-007 | Yes | API | Smoke cadence. |
| PLACE-007-US-007-TC-006 | Sorted response metadata contains pagination fields | API, Contract | High | Authenticated request. | `GET /api/v1/places?limit=10&offset=20`. | 1. Send request. 2. Inspect `meta`. | Status `200 OK`; `meta.limit=10`, `meta.offset=20`, `meta.total` is numeric, and `meta.sort=rating_desc`. | PLACE-007-US-007 | Yes | API | Smoke cadence. |

## PLACE-007-US-008 - Format ratings consistently

User Story Summary: As a user, I want ratings readable in RTL UI so that numbers are not confusing.

Related Feature ID: `PLACE-007`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-007-US-008-TC-001 | Rating displays Western digits and period decimal | UI, Localization, RTL | High | Valid session. Rated place has `averageRating=8.5`. | `/places`. | 1. Open page. 2. Inspect rating text. | Rating displays as `8.5` using Western digits and period decimal separator. | PLACE-007-US-008 | Yes | UI E2E | Smoke cadence. |
| PLACE-007-US-008-TC-002 | Rating display uses at most one decimal place | UI, Regression | Medium | Valid session. Aggregates include `8.44`, `8.45`, `8.46`. | Rounded display examples. | 1. Open page. 2. Inspect rating text. | Ratings display as `8.4`, `8.5`, and `8.5`; no value shows more than one decimal place. | PLACE-007-US-008 | Yes | UI E2E | Regression cadence. |
| PLACE-007-US-008-TC-003 | Rating text is LTR isolated in RTL row | UI, RTL, Accessibility | High | Valid session. RTL page and rated row visible. | Arabic place name with rating `9.5`. | 1. Open `/places`. 2. Inspect visual and accessibility text. | Rating appears in correct LTR order as `9.5`; it does not reorder around Arabic text. | PLACE-007-US-008 | Yes | Accessibility | Regression cadence. |
| PLACE-007-US-008-TC-004 | Rating and count spacing remains readable | UI, UX, Mobile | Medium | Valid session. Place has `averageRating=9.5`, `ratingCount=42`. | Viewport `320x568`. | 1. Set viewport. 2. Open page. 3. Inspect row. | Rating and count are visually separated, not clipped, and do not collide with title, metadata, or artwork. | PLACE-007-US-008 | Yes | UI E2E | Regression cadence. |
| PLACE-007-US-008-TC-005 | Rating display remains accessible to screen readers | Accessibility, Screen Reader | Medium | Valid session. Rated row visible. | Rating `8.5`, count `42`. | 1. Inspect accessibility tree. 2. Navigate to row. | Row accessible name or description communicates rating and count without ambiguous ordering or decorative noise. | PLACE-007-US-008 | Yes | Accessibility | Regression cadence. |
| PLACE-007-US-008-TC-006 | Rating does not clip at 200 percent zoom | Responsive, Accessibility, UI | High | Valid session. Rated rows visible. | 200% zoom/adaptive pressure. | 1. Apply zoom/pressure. 2. Inspect rows. | Rating text remains fully visible; no horizontal overflow; row remains operable. | PLACE-007-US-008 | Yes | UI E2E | Smoke cadence. |
| PLACE-007-US-008-TC-007 | Rating formatting contains no mojibake or localized digit drift | Localization, Arabic, UI | Medium | Valid session. Rated rows visible in Arabic UI. | Arabic page context. | 1. Open page. 2. Scan rating and metadata text. | Rating uses valid Western digits and Arabic UI text contains no mojibake, replacement character, or escaped Unicode. | PLACE-007-US-008 | Yes | UI E2E | Regression cadence. |
| PLACE-007-US-008-TC-008 | Rating does not clip at 430px viewport | Responsive, Mobile, UI | High | Valid session. Rated rows with `9.5` and count `42` are visible. | `430x932`. | 1. Set viewport. 2. Open `/places`. 3. Inspect rated rows. | Rating and count are fully visible, do not collide with names/artwork, and `document.documentElement.scrollWidth <= window.innerWidth`. | PLACE-007-US-008 | Yes | UI E2E | Regression cadence. |
| PLACE-007-US-008-TC-009 | Rating does not clip in landscape viewport | Responsive, Mobile, UI | High | Valid session. Rated rows visible. | `844x390`. | 1. Set landscape viewport. 2. Open `/places`. 3. Inspect top rows and bottom navigation. | Rating and count remain fully visible; rows do not overlap bottom navigation; no horizontal overflow occurs. | PLACE-007-US-008 | Yes | UI E2E | Regression cadence. |
| PLACE-007-US-008-TC-010 | Focus-visible is measurable on sorted rows | Accessibility, Keyboard, UI | High | Valid session. Keyboard-only navigation. | Sorted rows. | 1. Tab through sorted result rows. 2. Inspect focused row. | Focus indicator is visible with at least 2 CSS pixel outline, contrast ratio at least 3:1 against adjacent colors, and no clipping. | PLACE-007-US-008 | Yes | Accessibility | Regression cadence. |
| PLACE-007-US-008-TC-011 | Forced-colors mode preserves rating visibility | Accessibility, UI | Medium | Valid session. Browser supports forced-colors/high-contrast mode. | `/places`. | 1. Enable forced-colors mode. 2. Inspect rating text, focus state, and row links. | Rating text, row links, and focus indicators remain visible; rating state does not rely on color alone. | PLACE-007-US-008 | Yes | Accessibility | Nightly cadence. |
| PLACE-007-US-008-TC-012 | Reduced-motion mode keeps sorted updates understandable | Accessibility, UI, Regression | Medium | Valid session. `prefers-reduced-motion: reduce` is active. | Reload sorted list. | 1. Enable reduced motion. 2. Refresh `/places`. 3. Inspect loading/result transition. | Sorting, loading, and result updates remain understandable; no critical ordering information depends on animation. | PLACE-007-US-008 | Yes | Accessibility | Regression cadence. |

## PLACE-007-US-009 - Update ordering after rating changes

User Story Summary: As a user, I want newly rated places to rank correctly after data changes.

Related Feature ID: `PLACE-007`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-007-US-009-TC-001 | New rating moves place into rated section after reload | Integration, API, Data Integrity | High | Authenticated user can rate an unrated place. | Create rating `9.5` for previously unrated place. | 1. Confirm place is unrated near bottom. 2. Create rating. 3. Reload places list. | `POST /api/v1/ratings` returns `201 Created`; after reload, place has updated aggregate and appears among rated places based on `averageRating=9.5`. | PLACE-007-US-009 | Yes | UI E2E | Regression cadence. |
| PLACE-007-US-009-TC-002 | Updated rating changes order after reload | Integration, API, Regression | High | Authenticated user has existing rating. Aggregate can change. | Update rating from `6.0` to `9.0`. | 1. Capture original order. 2. Update rating. 3. Reload places list. | `PATCH /api/v1/ratings/{place_id}` returns `200 OK`; updated aggregate affects server-side order after reload. | PLACE-007-US-009 | Yes | UI E2E | Smoke cadence. |
| PLACE-007-US-009-TC-003 | Rating deletion unsupported and not required for ordering | API, Negative, Regression | Medium | Authenticated request. Existing rating exists. | `DELETE /api/v1/ratings/{place_id}`. | 1. Verify UI has no delete-rating action. 2. Send unsupported delete request directly. 3. Reload Places list. | Unsupported delete request returns `405 Method Not Allowed`; rating is not deleted, aggregate does not change, and no ordering change occurs through deletion. | PLACE-007-US-009 | Yes | API | Regression cadence. |
| PLACE-007-US-009-TC-004 | Stale list does not silently reorder without refetch | UI, Data Integrity | Medium | Valid session. Places list loaded. Aggregate changes in background. | External rating update. | 1. Load Places list. 2. Apply external rating update. 3. Observe current rows before refetch. | Existing rendered order remains stable until explicit reload/refetch; no partial client-side resort corrupts visible rows. | PLACE-007-US-009 | Yes | UI E2E | Regression cadence. |
| PLACE-007-US-009-TC-005 | Refresh reconciles updated rating order | UI, Regression | Medium | Valid session. Aggregate changed since current page loaded. | Browser refresh. | 1. Refresh page. 2. Inspect row order. | Refetched rows reflect latest server-side aggregates and `rating_desc` order. | PLACE-007-US-009 | Yes | UI E2E | Regression cadence. |
| PLACE-007-US-009-TC-006 | Concurrent rating updates produce deterministic final order | Concurrency, API, Data Integrity | High | Two users update ratings for places in same rating range. | Concurrent updates affecting averages. | 1. Apply concurrent rating changes. 2. Request Places list after commits. | Status `200 OK`; order reflects committed aggregate state with rating, count, and name tie-breaks; no duplicate or missing rows. | PLACE-007-US-009 | Yes | API | Nightly cadence. |
| PLACE-007-US-009-TC-007 | Rating update error does not corrupt sort order | Error Handling, UI, Data Integrity | Medium | Valid session. Rating update fails with `500`. | Failed rating update. | 1. Attempt update. 2. Return to Places list. | Failed update shows error; Places order remains based on last successful aggregate and no optimistic incorrect order persists after reload. | PLACE-007-US-009 | Yes | UI E2E | Regression cadence. |
| PLACE-007-US-009-TC-008 | Reorder after rating update is announced | Accessibility, Screen Reader, UI | Medium | Valid session. Rating update causes place to move after reload/refetch. | Update rating from `6.0` to `9.0`. | 1. Save rating update. 2. Return to/reload Places list. 3. Inspect live region or status announcement. | Updated list state is announced through polite status text; focus is not lost and the updated row can be reached by keyboard. | PLACE-007-US-009 | Yes | Accessibility | Regression cadence. |

## PLACE-007-US-010 - Do not expose fake zero rating

User Story Summary: As a user, I do not want unrated places shown as zero-rated.

Related Feature ID: `PLACE-007`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-007-US-010-TC-001 | API does not serialize unrated average as zero | API, Contract, Data Integrity | Critical | Authenticated request. Unrated place exists. | `GET /api/v1/places`. | 1. Send request. 2. Inspect unrated row. | Status `200 OK`; `averageRating=null` and `ratingCount=0`; no `averageRating=0` appears for unrated place. | PLACE-007-US-010 | Yes | API | Smoke cadence. |
| PLACE-007-US-010-TC-002 | UI omits fake zero rating | UI, Regression | Critical | Valid session. Unrated place visible. | Unrated row. | 1. Open `/places`. 2. Inspect unrated row. | Row shows no `0`, `0.0`, `لا تقييم`, `null`, `undefined`, or placeholder rating. | PLACE-007-US-010 | Yes | UI E2E | Smoke cadence. |
| PLACE-007-US-010-TC-003 | Unrated accessible name omits fake rating | Accessibility, Screen Reader | High | Valid session. Unrated row visible. | Accessibility tree. | 1. Inspect unrated row accessible name/description. | Accessible text includes place name/type but does not announce zero rating or fake unrated label. | PLACE-007-US-010 | Yes | Accessibility | Regression cadence. |
| PLACE-007-US-010-TC-004 | Unrated row has consistent rating column spacing | UI, Responsive, Mobile | Medium | Valid session. Rated and unrated rows visible. | `320x568`. | 1. Set viewport. 2. Inspect row alignment. | Unrated row layout remains aligned without clipped title, dead rating placeholder, or horizontal overflow. | PLACE-007-US-010 | Yes | UI E2E | Regression cadence. |
| PLACE-007-US-010-TC-005 | Fake zero is not used for sorting | API, Data Integrity | High | Authenticated request. Rated place has actual average `1.0`; unrated place exists. | `averageRating=1.0` and `null`. | 1. Send request. 2. Inspect order. | Status `200 OK`; actual `1.0` rated place appears before unrated place; unrated is not treated as numeric zero. | PLACE-007-US-010 | Yes | API | Regression cadence. |
| PLACE-007-US-010-TC-006 | Empty or unrated-only list does not show fake aggregate copy | Empty State, UI, Regression | Medium | Valid session. Filtered subset has only unrated places. | Filter producing unrated-only rows. | 1. Open filter URL. 2. Inspect rows and metadata. | Rows are shown without fake ratings; no empty state appears if unrated rows exist. | PLACE-007-US-010 | Yes | UI E2E | Regression cadence. |

## PLACE-007-US-011 - Keep sort stable during continuous scrolling

User Story Summary: As a user, I want scrolling pages to preserve the global ranking so that the same place is not skipped or repeated.

Related Feature ID: `PLACE-007`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-007-US-011-TC-001 | Backend sorts before slicing page 2 | API, Pagination, Data Integrity | Critical | Authenticated request. Global sorted fixture known. | `limit=10&offset=10`. | 1. Send request. 2. Compare IDs to expected global positions 11-20. | Status `200 OK`; page 2 contains exactly global sorted positions 11-20. | PLACE-007-US-011 | Yes | API | Smoke cadence. |
| PLACE-007-US-011-TC-002 | Frontend appends page 2 without resorting | UI, Integration, Regression | High | Valid session. More than two pages exist. | Continuous scroll. | 1. Open page. 2. Scroll to load page 2. 3. Capture rendered IDs. | Page 2 rows append after page 1 in API order; frontend does not resort combined rows client-side. | PLACE-007-US-011 | Yes | UI E2E | Regression cadence. |
| PLACE-007-US-011-TC-003 | Continuous scroll has no duplicate IDs | UI, Data Integrity | Critical | Valid session. More than three pages exist. | `/places`. | 1. Scroll through three pages. 2. Collect row IDs. | No duplicate IDs appear in rendered rows. | PLACE-007-US-011 | Yes | UI E2E | Smoke cadence. |
| PLACE-007-US-011-TC-004 | Out-of-order page responses do not corrupt sort | Concurrency, UI, Data Integrity | High | Valid session. Network interception can delay pages. | Delayed offset `10`, faster offset `20`. | 1. Trigger page 2 and page 3 requests. 2. Return page 3 before page 2. | Final rendered order follows offset order and global rating sort, not response arrival order. | PLACE-007-US-011 | Yes | UI E2E | Nightly cadence. |
| PLACE-007-US-011-TC-005 | Continuous scroll loading state is accessible | Accessibility, Loading State, UI | Medium | Valid session. Page 2 loading is delayed. | Scroll near bottom. | 1. Scroll to trigger load. 2. Inspect accessibility tree/live region. | Loading more rows is announced politely; keyboard focus is not stolen or lost. | PLACE-007-US-011 | Yes | Accessibility | Regression cadence. |
| PLACE-007-US-011-TC-006 | Continuous scroll bottom is not hidden by navigation | Responsive, Mobile, UI | High | Valid session. Long list exists. | `390x844`, scroll to bottom. | 1. Set viewport. 2. Scroll to final loaded row. | Final row and any retry/end marker remain above bottom navigation and safe-area padding; no horizontal overflow. | PLACE-007-US-011 | Yes | UI E2E | Regression cadence. |
| PLACE-007-US-011-TC-007 | Continuous scroll performance remains within budget | Performance, UI | Medium | Valid session. At least 1,000 sorted rows exist. | Long scroll fixture. | 1. Scroll through multiple pages. 2. Measure long tasks and row rendering. | No long task over 500 ms occurs during page append; visible rows remain interactive and sorted. | PLACE-007-US-011 | Yes | Performance | Nightly cadence. |
| PLACE-007-US-011-TC-008 | Final row is safe above bottom navigation at 320px | Responsive, Mobile, UI | High | Valid session. Long sorted list exists. | `320x568`, scroll to bottom. | 1. Set viewport. 2. Scroll to final loaded row. 3. Inspect bottom navigation overlap. | Final row is fully visible above bottom navigation and safe-area padding; row action target remains at least `44x44`; no horizontal overflow occurs. | PLACE-007-US-011 | Yes | UI E2E | Smoke cadence. |
| PLACE-007-US-011-TC-009 | Keyboard traversal remains stable through sorted continuous list | Accessibility, Keyboard, UI | High | Valid session. Multiple pages are loaded. | Keyboard-only navigation. | 1. Load two pages. 2. Tab through rows across page boundary. | Focus order follows visual sorted row order; no duplicate focus stops appear; focus-visible remains present across appended rows. | PLACE-007-US-011 | Yes | Accessibility | Regression cadence. |

## PLACE-007-US-012 - Handle catalog updates between page loads

User Story Summary: As the system, I want scrolling to tolerate rating changes during browsing so that users do not see corrupt ordering.

Related Feature ID: `PLACE-007`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-007-US-012-TC-001 | Client filters duplicate IDs after rating change between pages | Concurrency, UI, Data Integrity | High | Valid session. Controlled fixture returns page 1 containing place `A`; rating update moves `A` so page 2 response also contains `A`. | Page 1 IDs `[A,B,C]`; page 2 IDs `[A,D,E]`. | 1. Load page 1. 2. Apply aggregate change. 3. Load page 2 with duplicate `A`. | Frontend renders `A` only once and appends `D` and `E`; current list contains no duplicate IDs. | PLACE-007-US-012 | Yes | UI E2E | Nightly cadence. |
| PLACE-007-US-012-TC-002 | Catalog update does not drop existing visible rows | Concurrency, UI | Medium | Valid session. Page 1 loaded. Rating update occurs before page 2. | External aggregate update. | 1. Load page 1. 2. Apply update. 3. Load page 2. | Already visible rows remain visible; page 2 appends non-duplicate rows; current browsing list is not corrupted. | PLACE-007-US-012 | Yes | UI E2E | Regression cadence. |
| PLACE-007-US-012-TC-003 | Full refresh reconciles final ordering after catalog update | UI, Regression | High | Valid session. Catalog changed while user was browsing. | Browser refresh. | 1. Browse two pages. 2. Apply aggregate change. 3. Refresh page. | Refreshed list reflects current server-side global `rating_desc` order from the first page. | PLACE-007-US-012 | Yes | UI E2E | Regression cadence. |
| PLACE-007-US-012-TC-004 | API remains internally ordered after concurrent update commit | API, Concurrency, Data Integrity | High | Aggregate update has committed before request. | `GET /api/v1/places`. | 1. Commit rating update. 2. Send request. | Status `200 OK`; response order reflects committed aggregate state and remains sorted. | PLACE-007-US-012 | Yes | API | Regression cadence. |
| PLACE-007-US-012-TC-005 | Incremental load failure after catalog update is recoverable | Error Handling, UI | Medium | Valid session. Page 1 loaded; page 2 fails after update. | Page 2 returns `500`. | 1. Load page 1. 2. Apply update. 3. Trigger page 2 failure. 4. Retry. | Existing rows remain visible; retry requests same offset/filter; successful retry appends non-duplicate sorted rows. | PLACE-007-US-012 | Yes | UI E2E | Regression cadence. |
| PLACE-007-US-012-TC-006 | Privacy preserved during catalog update errors | Security, Privacy, API | High | Authenticated request. Incremental page fails. | `GET /api/v1/places?offset=10` returns `500`. | 1. Trigger failure. 2. Inspect error response and UI. | Status `500`; error payload and UI expose no private notes, list membership, creator identity, SQL, stack traces, tokens, or cookies. | PLACE-007-US-012 | Yes | API | Smoke cadence. |

## PLACE-007-US-013 - Sort ties consistently across locales

User Story Summary: As the system, I want name tie-breaks deterministic so that Arabic and English mixed names remain stable.

Related Feature ID: `PLACE-007`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-007-US-013-TC-001 | Arabic tied names sort deterministically | API, Arabic, Data Integrity | Medium | Authenticated request. Tied Arabic names exist. | `مطعم ألف`, `مطعم باء`, same rating/count. | 1. Send request twice. 2. Inspect tied group. | Status `200 OK`; Arabic tied names appear in the same normalized-name order across both calls. | PLACE-007-US-013 | Yes | API | Regression cadence. |
| PLACE-007-US-013-TC-002 | English tied names sort deterministically | API, Data Integrity | Medium | Authenticated request. Tied English names exist. | `Alpha`, `Beta`, same rating/count. | 1. Send request twice. 2. Inspect order. | Status `200 OK`; English tied names appear in the same normalized-name order across calls. | PLACE-007-US-013 | Yes | API | Regression cadence. |
| PLACE-007-US-013-TC-003 | Mixed Arabic/English tied names sort deterministically | API, Arabic, RTL, Data Integrity | High | Authenticated request. Tied mixed names exist. | `مطعم Five Guys`, `Five Guys مطعم`, same rating/count. | 1. Send request twice. 2. Inspect tied group. | Status `200 OK`; mixed-language tied names have deterministic order across calls and pagination. | PLACE-007-US-013 | Yes | API | Regression cadence. |
| PLACE-007-US-013-TC-004 | Locale-stable tie order holds across pagination | API, Pagination, Data Integrity | High | Authenticated request. Locale-mixed tied group spans page boundary. | `limit=2`, offsets around tied group. | 1. Request adjacent pages. 2. Combine tied rows. | Status `200 OK`; combined tied rows preserve deterministic normalized-name order with no duplicates or missing rows. | PLACE-007-US-013 | Yes | API | Regression cadence. |
| PLACE-007-US-013-TC-005 | Mixed-language tied rows remain visually contained | UI, RTL, Responsive | Medium | Valid session. Mixed-language tied rows visible. | `320x568`, `مطعم Five Guys فرع King Abdullah Financial District`. | 1. Set viewport. 2. Open `/places`. 3. Inspect rows. | Mixed Arabic/English names render in readable order, clamp safely, and do not collide with rating or artwork. | PLACE-007-US-013 | Yes | UI E2E | Regression cadence. |
| PLACE-007-US-013-TC-006 | Locale-stable sorting has no mojibake | Localization, Arabic, UI | Medium | Valid session. Arabic and mixed names visible. | Arabic/mixed tied rows. | 1. Open `/places`. 2. Scan visible text and API response. | Arabic and mixed names contain no mojibake, replacement character, or escaped Unicode sequences. | PLACE-007-US-013 | Yes | UI E2E | Smoke cadence. |

## Final Summary

1. User stories processed: 13
2. Total test cases generated: 106
3. Duplicate test case IDs: 0
4. Invalid story references: 0
5. Missing user stories: 0
6. Encoding/mojibake findings: 0
7. API tests missing status codes: 0

### Test Count Per User Story

| User Story ID | Test Case Count |
|---|---:|
| PLACE-007-US-001 | 11 |
| PLACE-007-US-002 | 7 |
| PLACE-007-US-003 | 5 |
| PLACE-007-US-004 | 6 |
| PLACE-007-US-005 | 12 |
| PLACE-007-US-006 | 12 |
| PLACE-007-US-007 | 6 |
| PLACE-007-US-008 | 12 |
| PLACE-007-US-009 | 8 |
| PLACE-007-US-010 | 6 |
| PLACE-007-US-011 | 9 |
| PLACE-007-US-012 | 6 |
| PLACE-007-US-013 | 6 |

### Count By Test Type

| Test Type | Count |
|---|---:|
| API | 54 |
| Accessibility | 11 |
| Arabic | 4 |
| Authentication | 2 |
| Authorization | 3 |
| Boundary | 5 |
| Concurrency | 5 |
| Contract | 11 |
| Data Integrity | 36 |
| Edge | 3 |
| Empty State | 2 |
| Error Handling | 4 |
| Integration | 15 |
| Keyboard | 3 |
| Loading State | 1 |
| Localization | 3 |
| Mobile | 8 |
| Negative | 3 |
| Pagination | 5 |
| Performance | 4 |
| Positive | 1 |
| Privacy | 5 |
| Regression | 23 |
| Responsive | 9 |
| RTL | 4 |
| Screen Reader | 3 |
| Security | 3 |
| UI | 51 |
| UX | 1 |
| Validation | 5 |

### Count By Priority

| Priority | Count |
|---|---:|
| Critical | 15 |
| High | 49 |
| Medium | 42 |
| Low | 0 |

### Count By Automation Layer

| Automation Layer | Count |
|---|---:|
| API | 50 |
| Accessibility | 10 |
| Performance | 3 |
| UI E2E | 43 |

### Count By Automation Cadence

| Cadence | Count |
|---|---:|
| Smoke | 30 |
| Regression | 68 |
| Nightly | 8 |
| Manual Review | 0 |

### Top Automation Candidates

| Test Case ID | Reason |
|---|---|
| PLACE-007-US-001-TC-001 | Core rating-desc server ordering contract. |
| PLACE-007-US-002-TC-001 | Unrated-last rule is product-critical. |
| PLACE-007-US-003-TC-001 | Rating-count tie-break prevents unstable trust signals. |
| PLACE-007-US-004-TC-001 | Normalized-name tie-break prevents pagination jumps. |
| PLACE-007-US-005-TC-001 | Global sort before pagination is the highest data-integrity risk. |
| PLACE-007-US-005-TC-010 | Initial sorted load failure must recover without data leakage. |
| PLACE-007-US-006-TC-005 | Search plus sorting interaction can regress across modules. |
| PLACE-007-US-006-TC-009 | Deep-link filtered sorted URLs must initialize correctly. |
| PLACE-007-US-008-TC-006 | Rating clipping at 200% zoom is a known UI risk. |
| PLACE-007-US-008-TC-010 | Keyboard focus visibility on sorted rows is an accessibility gate. |
| PLACE-007-US-009-TC-002 | Updated ratings must reorder after reload. |
| PLACE-007-US-011-TC-003 | Continuous scroll duplicate prevention protects browsing trust. |
| PLACE-007-US-012-TC-001 | Catalog update drift can duplicate rows without client filtering. |

### Manual-Only Tests

No manual-only tests are required for PLACE-007. Accessibility, responsive, and RTL checks are represented as automation candidates through accessibility tree inspection, browser viewport assertions, and deterministic fixture validation.

### Remaining Assumptions Or Questions

- Rating deletion is unsupported by current product scope; sorting tests verify that no delete-rating flow is required for ordering.
- Rating aggregate calculations are tested in Ratings module packages; this file validates Places ordering after aggregate values are present.
- Search ranking remains primary for search results; `rating_desc` is asserted as tie-break behavior within the same search-rank group.
