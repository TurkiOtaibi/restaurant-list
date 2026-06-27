# PLACE-001 Test Cases

Feature: `PLACE-001 - View places list`

Source: `docs/user-stories/PLACES_USER_STORIES.md`

Scope: All user stories under `PLACE-001`.

## QA Execution Standards

- Arabic test data must remain valid UTF-8 Arabic, for example `قهوة`, `الأماكن`, `لا توجد أماكن`, and `أضف مكانًا`.
- Responsive certification points for this feature are `320x568`, `390x844`, `430x932`, landscape `844x390`, and 200% zoom/adaptive pressure.
- Responsive UI tests must assert `document.documentElement.scrollWidth <= window.innerWidth`.
- Minimum interactive touch target is `44x44` CSS pixels for row links, retry actions, create-place CTA, and navigation controls.
- Row accessibility baseline: each row is a semantic link or equivalent, has an accessible name containing the place name, supports keyboard focus, and activates with Enter.
- Privacy baseline: success and error responses must not expose private notes, private list membership, creator identity, tokens, stack traces, SQL, or internal moderation fields.
- Automation cadence values used in Notes: Smoke, Regression, Nightly, and Manual Review.

## PLACE-001-US-001 - View authenticated places list

User Story Summary: As an authenticated user, I want to view the places list so that I can browse the catalog.

Related Feature ID: `PLACE-001`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-001-US-001-TC-001 | Authenticated user sees returned places | Positive, UI, API, Integration | Critical | User has valid session. API contains at least 3 places. | Places: restaurant rated `8.5`, cafe rated `9`, ice cream unrated. | 1. Login. 2. Open `/places`. 3. Observe network request. | Frontend calls `GET /api/v1/places`; returned `data` rows render in the places list. | PLACE-001-US-001 | Yes | UI E2E | Verify no duplicate request loop. |
| PLACE-001-US-001-TC-002 | API returns places for valid session | API, Authentication | Critical | Valid access token or refresh-backed session exists. | `GET /api/v1/places` with no query params. | 1. Send authenticated request. 2. Inspect response. | Status `200`; response includes `data` array and `meta`; each row is a place object. | PLACE-001-US-001 | Yes | API | Also verifies route is protected but accessible when authenticated. |
| PLACE-001-US-001-TC-003 | UI handles mixed catalog rows | UI, Localization / RTL | High | Valid session. API returns Arabic, English, and mixed names. | `مطعم Five Guys`, `The Original Cheesecake Factory Restaurant & Bakery`, `قهوة`. | 1. Open `/places`. 2. Inspect visible rows. | All names render in RTL layout without mojibake, clipping, or horizontal overflow. | PLACE-001-US-001 | Yes | UI E2E | Reuse long-content fixtures. |
| PLACE-001-US-001-TC-004 | Places list remains available after token refresh | Authentication, Integration, Regression | High | Access token expired; refresh cookie valid. | Existing authenticated account. | 1. Expire/mock access token. 2. Open `/places`. 3. Allow refresh flow. | Token refresh succeeds; `GET /api/v1/places` succeeds; rows render without forcing logout. | PLACE-001-US-001 | Yes | UI E2E | Covers auth integration with catalog browsing. |

## PLACE-001-US-002 - Reject guest access

User Story Summary: As the system, I want guests blocked from places data so that the catalog is not anonymously exposed.

Related Feature ID: `PLACE-001`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-001-US-002-TC-001 | Guest API request returns 401 | Negative, API, Authentication, Security | Critical | No access token and no valid refresh cookie. | `GET /api/v1/places`. | 1. Clear auth storage/cookies. 2. Send request. | Status `401 Unauthorized`; response contains no catalog `data`. | PLACE-001-US-002 | Yes | API | Must not return partial rows. |
| PLACE-001-US-002-TC-002 | Guest UI does not render protected rows | Negative, UI, Security | Critical | Browser has no valid session. | Direct URL `/places`. | 1. Clear auth. 2. Open `/places`. | UI shows authentication prompt/redirect state; no place rows, ratings, or catalog metadata render. | PLACE-001-US-002 | Yes | UI E2E | Verify before and after auth resolution. |
| PLACE-001-US-002-TC-003 | Expired refresh token does not expose catalog | Security, Regression | Critical | Expired/invalid refresh cookie exists. | Direct URL `/places`. | 1. Set expired refresh cookie in test context. 2. Open `/places`. | Refresh fails safely; no catalog data renders; user is treated as unauthenticated. | PLACE-001-US-002 | Yes | Security | Confirms no stale private content. |
| PLACE-001-US-002-TC-004 | Guest response has safe error payload | Security, Privacy, API | High | No valid session. | `GET /api/v1/places`. | 1. Send unauthenticated request. 2. Inspect body. | Error response contains no place rows, creator IDs, private list data, notes, tokens, stack traces, or SQL details. | PLACE-001-US-002 | Yes | API | Exact error schema should match API error contract. |

## PLACE-001-US-003 - Render compact row fields

User Story Summary: As a user, I want each place row to show only scannable core data so that browsing is fast.

Related Feature ID: `PLACE-001`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-001-US-003-TC-001 | Rated restaurant row shows required fields | Positive, UI | Critical | Valid session. API returns rated restaurant. | `{ name: "Malfa", type: "restaurant", subtype: "italian", averageRating: 8.5 }`. | 1. Open `/places`. 2. Locate row. | Row shows artwork, `Malfa`, restaurant label, Italian subtype label, and rating `8.5`; no extra actions clutter row. | PLACE-001-US-003 | Yes | UI E2E | Arabic labels may be localized in UI. |
| PLACE-001-US-003-TC-002 | Cafe row shows cafe subtype | UI, Localization / RTL | High | Valid session. API returns cafe. | `{ name: "قهوة", type: "cafe", subtype: "coffee", averageRating: 9 }`. | 1. Open `/places`. 2. Inspect cafe row. | Row shows artwork, name, cafe type, coffee subtype, and rating using Western digits. | PLACE-001-US-003 | Yes | UI E2E | Confirms Arabic label rendering. |
| PLACE-001-US-003-TC-003 | Unrated row omits fake rating label | Negative, UI, Data Integrity | High | Valid session. API returns `averageRating: null`. | Unrated place. | 1. Open `/places`. 2. Inspect unrated row. | No fake rating, `0`, `0.0`, `لا تقييم`, `جديد`, or placeholder chip appears. | PLACE-001-US-003 | Yes | UI E2E | Overlaps with US-004 but verifies row core rendering. |
| PLACE-001-US-003-TC-004 | Row exposes semantic link with accessible name | Accessibility, UI | Critical | Valid session. API returns at least one place. | Place name `Malfa`. | 1. Open `/places`. 2. Inspect first row role and accessible name. | Row is a semantic link or equivalent control; accessible name includes `Malfa`; activation target is not an unlabeled generic container. | PLACE-001-US-003 | Yes | Accessibility | Smoke cadence. |
| PLACE-001-US-003-TC-005 | Row activates with keyboard Enter | Accessibility, Keyboard, UI | High | Valid session. First row is focusable. | Place ID `place-1`. | 1. Open `/places`. 2. Tab to first row. 3. Press Enter. | App navigates to `/places/place-1` or the equivalent detail route for that row. | PLACE-001-US-003 | Yes | UI E2E | Regression cadence. |
| PLACE-001-US-003-TC-006 | Keyboard focus-visible appears and touch focus does not persist | Accessibility, Regression, UI | High | Valid session. At least one row visible. | Any visible row. | 1. Tab to row. 2. Confirm visible focus indicator. 3. Click/tap row and return. | Keyboard focus indicator is visible; pointer/touch interaction does not leave a persistent selected outline. | PLACE-001-US-003 | Yes | UI E2E | Regression cadence. |
| PLACE-001-US-003-TC-007 | Artwork is visible for each rendered row | UI, Regression | High | Valid session. API returns multiple places. | 3 visible places. | 1. Open `/places`. 2. Inspect each visible row. | Every rendered row has a visible artwork/thumbnail slot with non-empty rendered pixels or deterministic visual content. | PLACE-001-US-003 | Yes | UI E2E | Regression cadence. |
| PLACE-001-US-003-TC-008 | Artwork is stable across reloads | UI, Regression | Medium | Valid session. Same place ID rendered twice. | Place ID `place-1`. | 1. Open `/places`. 2. Capture artwork signature or stable style for `place-1`. 3. Reload. 4. Compare. | Artwork for the same place ID remains stable across reloads. | PLACE-001-US-003 | Yes | UI E2E | Nightly cadence. |
| PLACE-001-US-003-TC-009 | Artwork does not replace textual identification | Accessibility, UI | High | Valid session. Place row visible. | Place name `Malfa`. | 1. Open `/places`. 2. Inspect row text and accessibility tree. | Place name text remains visible and present in accessible name; artwork is decorative or non-duplicative for screen readers. | PLACE-001-US-003 | Yes | Accessibility | Regression cadence. |
| PLACE-001-US-003-TC-010 | No unsupported inline actions render on row | UI, Regression, UX | High | Valid session. Place rows visible. | Rated and unrated rows. | 1. Open `/places`. 2. Inspect row controls and visible text. | Row does not show inline actions such as `حفظ`, `أضف إلى قائمة`, `قيّم المكان`, delete, edit, or large CRUD controls. | PLACE-001-US-003 | Yes | UI E2E | Regression cadence. |
| PLACE-001-US-003-TC-011 | Rating uses Western digits and LTR isolation | Localization / RTL, Accessibility | High | Valid session. Rated rows visible. | Ratings `8.5`, `10`, `9`. | 1. Open `/places`. 2. Inspect rendered rating text and computed direction/isolation where available. | Ratings use Western digits `0-9`, period decimal separator, no Arabic-Indic digits, and do not reorder incorrectly in RTL layout. | PLACE-001-US-003 | Yes | UI E2E | Regression cadence. |

## PLACE-001-US-004 - Hide absent optional row data

User Story Summary: As a user, I do not want placeholders for missing data so that rows stay clean.

Related Feature ID: `PLACE-001`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-001-US-004-TC-001 | Ice cream row omits subtype punctuation | UI, Negative | High | Valid session. API returns ice cream with `subtype: null`. | `{ type: "ice_cream", subtype: null }`. | 1. Open `/places?type=ice_cream`. 2. Inspect row metadata. | Metadata shows ice cream type only; no dangling separator, empty chip, or blank subtype. | PLACE-001-US-004 | Yes | UI E2E | Use exact Arabic label if exposed. |
| PLACE-001-US-004-TC-002 | Missing rating has no invented text or empty rating chip | UX / Usability, UI | Medium | Valid session. API returns rated and unrated rows. | One rated place, one unrated place. | 1. Open `/places`. 2. Inspect unrated row rating area. | Unrated row contains no rating chip, no placeholder label, no empty punctuation, and no banned copy such as `لا تقييم`, `جديد`, or `غير محفوظ`. | PLACE-001-US-004 | Yes | UI E2E | Regression cadence. |
| PLACE-001-US-004-TC-003 | Null optional fields do not break row rendering | Edge, Regression | High | Valid session. API returns valid place with nullable optional fields. | `subtype: null`, `averageRating: null`, `description: null`. | 1. Mock/API seed row. 2. Open `/places`. | Row renders without runtime errors, `undefined`, `null`, blank punctuation, or broken layout. | PLACE-001-US-004 | Yes | UI E2E | Important regression case. |

## PLACE-001-US-005 - Use collection envelope

User Story Summary: As an API consumer, I want list responses enveloped so that pagination is testable.

Related Feature ID: `PLACE-001`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-001-US-005-TC-001 | Places API returns envelope | API, Contract | Critical | Authenticated request. | `GET /api/v1/places`. | 1. Send request. 2. Validate response schema. | Response is `{ data: Place[], meta: { limit, offset, total, sort } }`. | PLACE-001-US-005 | Yes | API | Should be schema-tested. |
| PLACE-001-US-005-TC-002 | Data is always an array | API, Boundary | High | Authenticated request. Catalog may be empty. | Empty catalog fixture. | 1. Send request. 2. Inspect `data`. | `data` is `[]`, not `null`, object, or missing. | PLACE-001-US-005 | Yes | API | Prevents frontend branching bugs. |
| PLACE-001-US-005-TC-003 | Meta fields are numeric and consistent | API, Data Integrity | High | Authenticated request. | `limit=10&offset=0`. | 1. Send request. 2. Validate `meta`. | `meta.limit` and `meta.offset` match effective request; `meta.total` is integer >= `data.length`; `meta.sort` is populated. | PLACE-001-US-005 | Yes | API | Exact `sort` expected by PLACE-007. |
| PLACE-001-US-005-TC-004 | Place row schema has required public fields | API, Contract | High | Authenticated request returns at least one row. | `GET /api/v1/places?limit=1`. | 1. Send request. 2. Validate first `data` item. | Row includes public fields required by UI: `id`, `name`, `type`, `subtype`, `averageRating`, and `ratingCount`; nullable fields are explicit where applicable. | PLACE-001-US-005 | Yes | API | Regression cadence. |
| PLACE-001-US-005-TC-005 | Collection envelope excludes forbidden fields | API, Privacy, Contract | Critical | Authenticated request. Dataset includes places with private notes/list membership internally. | `GET /api/v1/places`. | 1. Send request. 2. Recursively scan JSON keys and values. | Response contains no `notes`, `privateNotes`, `listItems`, `privateListIds`, `creatorId`, `creatorEmail`, `moderationState`, stack trace, or SQL details. | PLACE-001-US-005 | Yes | API | Smoke cadence for privacy. |
| PLACE-001-US-005-TC-006 | Sort metadata is exact | API, Contract | Medium | Authenticated request. | `GET /api/v1/places`. | 1. Send request. 2. Inspect `meta.sort`. | `meta.sort` equals `rating_desc` unless a documented future sort parameter is explicitly supplied. | PLACE-001-US-005 | Yes | API | Regression cadence. |

## PLACE-001-US-006 - Respect default page bounds

User Story Summary: As the system, I want bounded place listing so that large catalogs do not overload the client.

Related Feature ID: `PLACE-001`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-001-US-006-TC-001 | Default request is bounded | API, Performance | High | Authenticated request. Catalog has more rows than default page size. | No `limit`, no `offset`. | 1. Send `GET /api/v1/places`. 2. Count returned rows. | Returned `data.length` is no greater than configured default and no greater than max `100`. | PLACE-001-US-006 | Yes | API | Default value is implementation-owned but bounded. |
| PLACE-001-US-006-TC-002 | Default meta reports effective bounds | API, Contract | High | Authenticated request. | No query params. | 1. Send request. 2. Inspect `meta.limit` and `meta.offset`. | `meta.limit` reports effective default; `meta.offset = 0`. | PLACE-001-US-006 | Yes | API | Enables client paging. |
| PLACE-001-US-006-TC-003 | UI does not request unbounded full catalog on initial load | Performance, UI, Regression | High | Valid session. Large catalog fixture. | 500 places. | 1. Open `/places`. 2. Inspect first network request. | Initial request includes bounded effective paging or API defaults to bounded response; UI does not download all 500 rows at once. | PLACE-001-US-006 | Yes | UI E2E | Browser network assertion. |

## PLACE-001-US-007 - Support explicit pagination params

User Story Summary: As a user with a large catalog, I want additional places available without loading everything at once.

Related Feature ID: `PLACE-001`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-001-US-007-TC-001 | Limit lower boundary accepted | Boundary, API | High | Authenticated request. | `limit=1&offset=0`. | 1. Send request. | Status `200`; `data.length <= 1`; `meta.limit = 1`; `meta.offset = 0`. | PLACE-001-US-007 | Yes | API | Boundary value. |
| PLACE-001-US-007-TC-002 | Limit upper boundary accepted | Boundary, API | High | Authenticated request. | `limit=100&offset=0`. | 1. Send request. | Status `200`; `data.length <= 100`; `meta.limit = 100`. | PLACE-001-US-007 | Yes | API | Max allowed by story. |
| PLACE-001-US-007-TC-003 | Offset returns requested slice | API, Data Integrity | High | Authenticated request. Stable seeded catalog with > 20 rows. | `limit=10&offset=10`. | 1. Request page 1. 2. Request page 2. 3. Compare IDs. | Page 2 returns the next slice according to server sort; `meta.total` is correct; no overlap unless catalog changed. | PLACE-001-US-007 | Yes | API | Use stable fixtures. |
| PLACE-001-US-007-TC-004 | Pagination combines with auth | Authentication, API | High | No valid session. | `limit=10&offset=10`. | 1. Send unauthenticated request. | Status `401`; pagination params do not bypass auth. | PLACE-001-US-007 | Yes | Security | Security regression. |

## PLACE-001-US-008 - Reject invalid pagination params

User Story Summary: As the system, I want invalid pagination rejected so that API behavior is predictable.

Related Feature ID: `PLACE-001`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-001-US-008-TC-001 | Reject limit below minimum | Validation, API, Negative | High | Authenticated request. | `limit=0&offset=0`. | 1. Send request. | Status `422`; structured validation error; no partial `data` returned. | PLACE-001-US-008 | Yes | API | Boundary negative. |
| PLACE-001-US-008-TC-002 | Reject limit above maximum | Validation, API, Negative | High | Authenticated request. | `limit=101&offset=0`. | 1. Send request. | Status `422`; no places returned. | PLACE-001-US-008 | Yes | API | Boundary negative. |
| PLACE-001-US-008-TC-003 | Reject negative offset | Validation, API, Negative | High | Authenticated request. | `limit=10&offset=-1`. | 1. Send request. | Status `422`; no partial `data` returned. | PLACE-001-US-008 | Yes | API | Offset min is 0. |
| PLACE-001-US-008-TC-004 | Reject non-numeric pagination | Validation, Security, API | Medium | Authenticated request. | `limit=abc&offset=x`. | 1. Send request. | Status `422`; safe validation error; no stack trace or SQL details. | PLACE-001-US-008 | Yes | API | Prevents coercion bugs. |
| PLACE-001-US-008-TC-005 | Reject decimal pagination values | Validation, API, Negative | Medium | Authenticated request. | `limit=10.5&offset=0.5`. | 1. Send request. | Status `422`; response follows structured validation contract; no partial `data` returned. | PLACE-001-US-008 | Yes | API | Regression cadence. |
| PLACE-001-US-008-TC-006 | Reject extremely large offset safely | Boundary, Security, API | Medium | Authenticated request. | `limit=10&offset=999999999999`. | 1. Send request. | API responds with either `422` for invalid bound or safe `200` empty page according to documented backend contract; it must not timeout, crash, or expose internals. | PLACE-001-US-008 | Yes | API | Nightly cadence if heavy. |

## PLACE-001-US-009 - Show empty catalog state

User Story Summary: As a user, I want a clear empty state when the catalog has no places so that I understand the next action.

Related Feature ID: `PLACE-001`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-001-US-009-TC-001 | Empty catalog shows concise empty state | Empty State, UI, UX | High | Valid session. Catalog has zero places. | API response `{ data: [], meta: { total: 0 } }`. | 1. Open `/places`. | UI shows copy equivalent to `لا توجد أماكن` and no fake rows. | PLACE-001-US-009 | Yes | UI E2E | Smoke cadence. Exact copy may vary only by approved Arabic UX copy. |
| PLACE-001-US-009-TC-002 | Empty catalog shows one create-place action | Empty State, UI | High | Valid session. Catalog empty. | Empty response. | 1. Open `/places`. 2. Count primary actions. | Exactly one clear create-place action is available; no duplicate CTAs compete. | PLACE-001-US-009 | Yes | UI E2E | Smoke cadence. Action label may be `أضف مكانًا`. |
| PLACE-001-US-009-TC-003 | Empty state is not used for filtered no-results | Regression, UX | Medium | Valid session. Catalog has places, but active filter/search returns none. | Search query with no matches. | 1. Open `/places?q=zzznomatch`. | UI shows no-results state, not full empty-catalog copy. | PLACE-001-US-009 | Yes | UI E2E | Ensures state differentiation. |
| PLACE-001-US-009-TC-004 | Empty-state CTA has accessible name and touch target | Accessibility, Empty State, Mobile | High | Valid session. Catalog empty. | Empty response. | 1. Open `/places`. 2. Inspect create-place CTA. | CTA has accessible name equivalent to `أضف مكانًا`, is keyboard reachable, and has bounding box at least `44x44` CSS pixels. | PLACE-001-US-009 | Yes | Accessibility | Regression cadence. |
| PLACE-001-US-009-TC-005 | Empty state has no horizontal overflow at 320px | Responsive, Empty State | Medium | Valid session. Catalog empty. | Viewport `320x568`. | 1. Set viewport. 2. Open `/places`. 3. Evaluate no-overflow assertion. | `document.documentElement.scrollWidth <= window.innerWidth`; empty copy and CTA remain visible. | PLACE-001-US-009 | Yes | UI E2E | Regression cadence. |

## PLACE-001-US-010 - Show loading skeletons

User Story Summary: As a user, I want layout-matching loading feedback so that the page does not jump.

Related Feature ID: `PLACE-001`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-001-US-010-TC-001 | Initial loading shows row skeletons | Loading State, UI | Medium | Valid session. API response is delayed. | Delay `GET /api/v1/places` by 2 seconds. | 1. Open `/places`. 2. Observe before response. | Compact row skeletons matching final row dimensions appear. | PLACE-001-US-010 | Yes | UI E2E | Avoids layout jump. |
| PLACE-001-US-010-TC-002 | Skeletons do not show fake content | Loading State, Privacy | High | Valid session. API delayed. | Delayed response. | 1. Open `/places`. 2. Inspect skeleton text. | Skeletons do not contain fake place names, ratings, notes, or user data. | PLACE-001-US-010 | Yes | UI E2E | Privacy and trust. |
| PLACE-001-US-010-TC-003 | Reduced motion loading remains usable | Accessibility, Loading State | Medium | `prefers-reduced-motion` enabled. API delayed. | Delayed response. | 1. Enable reduced motion. 2. Open `/places`. | Loading indication remains visible without distracting shimmer/animation dependency. | PLACE-001-US-010 | Yes | Accessibility | Can be automated with media emulation. |

## PLACE-001-US-011 - Show recoverable API error

User Story Summary: As a user, I want a recovery path when places fail to load so that I am not stuck.

Related Feature ID: `PLACE-001`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-001-US-011-TC-001 | 500 error shows concise recovery state | Error Handling, UI, API | High | Valid session. API mocked to `500`. | `GET /api/v1/places` returns `500`. | 1. Open `/places`. | UI shows concise error, retry action, and no fake data. | PLACE-001-US-011 | Yes | UI E2E | Do not expose stack trace. |
| PLACE-001-US-011-TC-002 | Network failure shows retry | Error Handling, Offline | High | Valid session. Network blocked for places endpoint. | Network abort. | 1. Open `/places`. | UI shows recoverable network error and retry action. | PLACE-001-US-011 | Yes | UI E2E | Use route abort. |
| PLACE-001-US-011-TC-003 | Retry after failure reloads places | Error Handling, Integration | High | First request fails, second succeeds. | First `500`, second `200`. | 1. Open `/places`. 2. Click retry. | Second request runs; rows render from successful response. | PLACE-001-US-011 | Yes | UI E2E | Confirms recovery path. |
| PLACE-001-US-011-TC-004 | Error state does not show stale fake data | Privacy, Regression | High | Previous session/page had places cached; new request fails. | Cached rows plus API `500`. | 1. Navigate to `/places`. 2. Force API failure. | UI does not render stale fake/unauthorized rows as current data. | PLACE-001-US-011 | Yes | UI E2E | Important with client cache. |
| PLACE-001-US-011-TC-005 | Retry action is accessible and touch-safe | Accessibility, Error Handling, Mobile | High | Valid session. Places API returns `500`. | Error state with retry. | 1. Open `/places`. 2. Inspect retry action. | Retry control has accessible name, is keyboard reachable, activates with Enter/Space, and has bounding box at least `44x44` CSS pixels. | PLACE-001-US-011 | Yes | Accessibility | Regression cadence. |
| PLACE-001-US-011-TC-006 | 401 during places fetch uses auth recovery path | Authentication, Error Handling, Security | High | Session expires before places fetch completes. | `GET /api/v1/places` returns `401`. | 1. Open `/places` as expired session. 2. Force places response `401`. | UI moves to safe unauthenticated/auth recovery state and does not show generic 5xx retry as if data were public. | PLACE-001-US-011 | Yes | UI E2E | Regression cadence. |
| PLACE-001-US-011-TC-007 | Error payload does not expose private fields | Privacy, Security, API | Critical | Authenticated request hits server error path. | Forced `500` response from places endpoint. | 1. Send/request failing places call. 2. Inspect error body and UI text where available. | Error response/UI contains no private notes, private list membership, creator identity, internal moderation data, stack traces, SQL, or token values. | PLACE-001-US-011 | Yes | API | Smoke cadence for security if API can be forced deterministically. |

## PLACE-001-US-012 - Maintain mobile containment

User Story Summary: As a mobile user, I want places to fit without zooming out so that the app is usable on small screens.

Related Feature ID: `PLACE-001`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-001-US-012-TC-001 | 320px viewport has no horizontal overflow | Responsive, Mobile | Critical | Valid session. Mixed long-name rows available. | Viewport `320x568`. | 1. Set viewport. 2. Open `/places`. 3. Evaluate `document.documentElement.scrollWidth <= window.innerWidth`. | Assertion is true; no horizontal scrolling. | PLACE-001-US-012 | Yes | UI E2E | Required explicit assertion. |
| PLACE-001-US-012-TC-002 | 390px viewport has no rating clipping | Responsive, Mobile | Critical | Valid session. Rated rows include `10`, `8.5`, `9`. | Viewport `390x844`. | 1. Open `/places`. 2. Inspect rating boxes. | Ratings are fully visible and not clipped by viewport edge. | PLACE-001-US-012 | Yes | UI E2E | Include RTL layout. |
| PLACE-001-US-012-TC-003 | 430px viewport final row is above bottom nav | Responsive, Mobile, UX | Critical | Valid session. Long list enough to scroll. | Viewport `430x932`. | 1. Scroll to bottom. 2. Inspect final row. | Final row is fully visible above bottom navigation and safe-area inset. | PLACE-001-US-012 | Yes | UI E2E | Avoid hidden last item. |
| PLACE-001-US-012-TC-004 | 200% zoom pressure does not break layout | Accessibility, Responsive | Critical | Valid session. Browser zoom or synthetic pressure equivalent. | Effective narrow width around 195-215 px. | 1. Apply 200% zoom/synthetic pressure. 2. Open `/places`. | No horizontal overflow; rows reflow; controls remain reachable. | PLACE-001-US-012 | Yes | UI E2E | Chromium plus WebKit where practical. |
| PLACE-001-US-012-TC-005 | Long mixed-language names remain contained | Localization / RTL, Responsive | High | Valid session. Long mixed names available. | `مطعم Five Guys فرع King Abdullah Financial District`. | 1. Open `/places` at 320px. 2. Inspect row. | Text wraps/clamps predictably and does not collide with artwork or rating. | PLACE-001-US-012 | Yes | UI E2E | Also covers bidi isolation. |
| PLACE-001-US-012-TC-006 | Long mixed-language names assert no overflow | Localization / RTL, Responsive | High | Valid session. Long mixed names available. | `مطعم Five Guys فرع King Abdullah Financial District`. | 1. Open `/places` at `320x568`. 2. Inspect row. 3. Evaluate no-overflow assertion. | Text wraps/clamps predictably, bidi order is correct, and `document.documentElement.scrollWidth <= window.innerWidth`. | PLACE-001-US-012 | Yes | UI E2E | Regression cadence. |
| PLACE-001-US-012-TC-007 | Landscape viewport has no horizontal overflow | Responsive, Mobile | High | Valid session. Places rows visible. | Viewport `844x390`. | 1. Set landscape viewport. 2. Open `/places`. 3. Evaluate no-overflow assertion. | No horizontal overflow; header, filters, rows, and bottom navigation remain reachable. | PLACE-001-US-012 | Yes | UI E2E | Regression cadence. |
| PLACE-001-US-012-TC-008 | iOS safe-area bottom does not obscure final row | Responsive, Mobile, UX | High | Valid session. WebKit/mobile-safe-area emulation available. | Long list; WebKit or safe-area emulation. | 1. Open `/places`. 2. Scroll to final row. 3. Inspect final interactive row. | Final row bottom is above bottom nav plus safe-area inset; final row can be tapped without browser UI obstruction. | PLACE-001-US-012 | Yes | UI E2E | Nightly cadence on WebKit. |
| PLACE-001-US-012-TC-009 | All visible interactive controls meet 44x44 | Accessibility, Mobile, Responsive | High | Valid session. Places page visible. | Viewports `320x568`, `390x844`, `430x932`. | 1. Open `/places` for each viewport. 2. Measure row links, retry/create controls if visible, and bottom nav controls. | Every interactive control has bounding box at least `44x44` CSS pixels or an equivalent hit target. | PLACE-001-US-012 | Yes | Accessibility | Regression cadence. |

## PLACE-001-US-013 - Prevent private-data flash during auth resolution

User Story Summary: As the system, I want protected catalog data hidden until authentication is resolved so that guests never briefly see private app content.

Related Feature ID: `PLACE-001`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-001-US-013-TC-001 | Unknown session shows neutral state | Security, UI, Loading State | Critical | Browser opens app with auth state unresolved. | Delay auth/session endpoint. | 1. Open `/places`. 2. Observe first render before auth completes. | Neutral loading/auth state appears; no cached place rows render. | PLACE-001-US-013 | Yes | UI E2E | Prevents flash of protected content. |
| PLACE-001-US-013-TC-002 | Guest after auth resolution still sees no rows | Security, Negative | Critical | Auth resolution completes as guest. | No valid cookies/tokens. | 1. Delay auth. 2. Complete as unauthenticated. | UI remains guest/auth prompt; protected rows never appear at any point. | PLACE-001-US-013 | Yes | Security | Needs trace/video or DOM polling. |
| PLACE-001-US-013-TC-003 | Cached browser state is not rendered before validation | Privacy, Regression | Critical | Local browser previously viewed places; session now invalid. | Existing stale client cache. | 1. Invalidate session. 2. Reload `/places`. | Stale rows are not rendered before session validation. | PLACE-001-US-013 | Yes | UI E2E | Cache-sensitive regression. |
| PLACE-001-US-013-TC-004 | Auth failure clears protected loading path | Error Handling, Security | High | Auth refresh endpoint fails. | Refresh returns `401` or network failure. | 1. Open `/places`. 2. Force refresh failure. | UI does not show protected data; user is moved to safe unauthenticated state. | PLACE-001-US-013 | Yes | UI E2E | Distinguish network from valid auth. |

## PLACE-001-US-014 - Exclude private user data from place rows

User Story Summary: As a user, I want the shared catalog to protect private context so that browsing does not expose personal data.

Related Feature ID: `PLACE-001`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-001-US-014-TC-001 | API excludes private notes | Privacy, API, Security | Critical | Authenticated user. Places have ratings/notes by multiple users. | Other user note: `private note`. | 1. Send `GET /api/v1/places`. 2. Inspect JSON recursively. | Response contains no `notes`, private note text, or other users' note fields. | PLACE-001-US-014 | Yes | API | Recursive key/value scan. |
| PLACE-001-US-014-TC-002 | API excludes private list membership | Privacy, API | Critical | Places exist in private lists. | Private list names and IDs. | 1. Request places list. 2. Inspect response. | No private list membership, private list names, or private list IDs are included. | PLACE-001-US-014 | Yes | API | Public list context belongs elsewhere. |
| PLACE-001-US-014-TC-003 | API excludes creator identity | Privacy, API | Critical | Place has creator/internal audit data. | Creator email/id/display name. | 1. Request places list. 2. Inspect row fields. | No creator email, user ID, display name, or creator metadata appears. | PLACE-001-US-014 | Yes | API | Places are shared catalog records. |
| PLACE-001-US-014-TC-004 | UI does not render private fields even if accidentally present | Defense-in-depth, UI, Privacy | High | Mocked API row includes forbidden fields. | `notes`, `creatorEmail`, `privateListIds`. | 1. Mock response with forbidden fields. 2. Open `/places`. | UI ignores forbidden fields and does not render them. | PLACE-001-US-014 | Yes | UI E2E | API should also prevent this. |
| PLACE-001-US-014-TC-005 | Error payload excludes private fields | Privacy, Security, API | Critical | Places API error path can be exercised. Internal data exists. | Forced validation/server error. | 1. Trigger a places API error. 2. Inspect response body recursively. | Error payload contains no private notes, private list membership, creator identity, internal moderation fields, stack traces, SQL, or token/cookie values. | PLACE-001-US-014 | Yes | API | Smoke cadence for security. |

## PLACE-001-US-015 - Browse large catalog with continuous scrolling

User Story Summary: As a user, I want large catalogs to continue loading as I scroll so that browsing feels continuous.

Related Feature ID: `PLACE-001`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-001-US-015-TC-001 | Next page loads near end | Positive, UI, Integration | High | Valid session. API has more results than first page. | `meta.total = 60`, first page `20`. | 1. Open `/places`. 2. Scroll near bottom. | Client requests next bounded page and appends returned rows. | PLACE-001-US-015 | Yes | UI E2E | Assert network `offset` changes. |
| PLACE-001-US-015-TC-002 | No manual Load More required | UX / Usability, Regression | Medium | Valid session. More pages exist. | Large catalog. | 1. Open `/places`. 2. Scroll. | Browsing continues via scrolling; no required manual Load More button blocks progress. | PLACE-001-US-015 | Yes | UI E2E | A non-blocking retry button is allowed after failure. |
| PLACE-001-US-015-TC-003 | Loading indicator appears during next-page fetch | Loading State, Accessibility | Medium | First page visible. Next page delayed. | Delay second page. | 1. Scroll near end. 2. Observe loading state. | Incremental loading indicator appears without clearing existing rows. | PLACE-001-US-015 | Yes | UI E2E | Live announcement covered in US-019. |
| PLACE-001-US-015-TC-004 | End-of-results stops further fetches | Boundary, Performance | High | API returns final page. | `meta.total = dataLoadedCount`. | 1. Scroll to end. 2. Continue scrolling. | UI shows or internally tracks end state and does not repeatedly request beyond total. | PLACE-001-US-015 | Yes | UI E2E | Prevent request storm. |
| PLACE-001-US-015-TC-005 | Rapid scrolling does not create duplicate in-flight requests | Concurrency, Performance, UI | High | Valid session. Large catalog. Next page delayed. | Page size `20`, total `100`. | 1. Open `/places`. 2. Rapidly scroll near the end multiple times before next-page response. | Only one in-flight request per `limit`/`offset` exists; no request storm occurs. | PLACE-001-US-015 | Yes | UI E2E | Nightly cadence. |
| PLACE-001-US-015-TC-006 | Out-of-order page responses do not corrupt list | Concurrency, Data Integrity, UI | High | Valid session. Mock page 3 returns before page 2. | Page 2 delayed, page 3 fast. | 1. Trigger two page loads if supported. 2. Return page 3 before page 2. | UI either serializes requests or appends rows in correct offset order; no duplicated, missing, or out-of-order rows are displayed. | PLACE-001-US-015 | Yes | UI E2E | Nightly cadence. |
| PLACE-001-US-015-TC-007 | Next-page requests preserve active filter and search | Integration, Regression | High | Valid session. Search/filter active. | `/places?type=restaurant&q=Malfa`, total > first page. | 1. Open URL. 2. Scroll near end. 3. Inspect next-page request. | Next-page request preserves `type=restaurant`, `q=Malfa`, same `limit`, and correct next `offset`. | PLACE-001-US-015 | Yes | UI E2E | Regression cadence. |

## PLACE-001-US-016 - Virtualize large result sets

User Story Summary: As a mobile user, I want large catalogs to remain fast so that scrolling does not degrade.

Related Feature ID: `PLACE-001`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-001-US-016-TC-001 | Large list renders limited DOM rows | Performance, UI | High | Valid session. Large mocked catalog. | 1000 places. | 1. Open `/places`. 2. Count rendered row elements. | Rendered row count is limited to visible rows plus buffer, not all 1000. | PLACE-001-US-016 | Yes | Performance | Threshold depends on viewport/buffer. |
| PLACE-001-US-016-TC-002 | Virtualized scroll remains stable | Performance, UX | High | Large catalog visible. | 1000 places. | 1. Scroll from top to middle. 2. Continue scrolling. | No major jump, blank viewport, or broken row recycling appears. | PLACE-001-US-016 | Yes | UI E2E | Include screenshots on failure. |
| PLACE-001-US-016-TC-003 | Keyboard navigation works with virtualization | Accessibility, Keyboard | High | Large catalog rendered with virtualized rows. | 200 places. | 1. Tab through rows/actions. 2. Scroll via keyboard if supported. | Focus remains visible and reachable; virtualized rows do not trap or lose focus. | PLACE-001-US-016 | Yes | Accessibility | Critical for virtualized UI. |
| PLACE-001-US-016-TC-004 | Mobile performance remains within measurable budget | Performance, Mobile | Medium | Mobile viewport. Large dataset. | `390x844`, 1000 places. | 1. Open `/places`. 2. Scroll continuously for 10 seconds. 3. Record DOM row count and long tasks where tooling supports it. | Rendered place-row DOM count stays within visible rows plus configured buffer; no single interaction-blocking task exceeds the team-defined performance budget; no blank viewport appears. | PLACE-001-US-016 | Yes | Performance | Nightly cadence. Budget must be defined before execution. |
| PLACE-001-US-016-TC-005 | Virtualized list keeps list semantics | Accessibility, UI | High | Large catalog rendered with virtualized rows. | 200 places. | 1. Open `/places`. 2. Inspect accessibility tree/list semantics. | Rows remain exposed as navigable links/items with accessible names; virtualization does not remove semantic context for visible rows. | PLACE-001-US-016 | Yes | Accessibility | Regression cadence. |

## PLACE-001-US-017 - Prevent duplicate rows across pages

User Story Summary: As a user, I do not want repeated places during continuous scrolling.

Related Feature ID: `PLACE-001`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-001-US-017-TC-001 | Overlapping pages de-duplicate by ID | Data Integrity, UI | High | Valid session. Mock page 2 overlaps page 1 by one ID. | Page 1 IDs `1-20`; page 2 IDs `20-39`. | 1. Load page 1. 2. Scroll to load page 2. | Place ID `20` appears only once in UI. | PLACE-001-US-017 | Yes | UI E2E | Client defensive behavior. |
| PLACE-001-US-017-TC-002 | Retry does not duplicate already appended page | Regression, UI | High | Page request succeeds after retry/replay. | Same page returned twice. | 1. Trigger next-page request. 2. Repeat same response. | Rows are not duplicated; list remains unique by stable `id`. | PLACE-001-US-017 | Yes | UI E2E | Covers retry race. |
| PLACE-001-US-017-TC-003 | API page IDs are stable and unique within response | API, Data Integrity | High | Authenticated request. | `limit=100`. | 1. Request one page. 2. Collect IDs. | No duplicate IDs within single `data` array. | PLACE-001-US-017 | Yes | API | Backend integrity check. |

## PLACE-001-US-018 - Recover from incremental load failure

User Story Summary: As a user, I want a failed next-page load to be recoverable without losing current results.

Related Feature ID: `PLACE-001`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-001-US-018-TC-001 | Existing rows remain after next-page failure | Error Handling, UI | High | First page loaded. Next page returns `500`. | Page 1 data, page 2 error. | 1. Open `/places`. 2. Scroll to trigger page 2. | Page 1 rows remain visible; error appears for incremental load only. | PLACE-001-US-018 | Yes | UI E2E | Avoid full-page failure. |
| PLACE-001-US-018-TC-002 | Retry requests same failed page | Error Handling, Integration | High | Next-page request failed. | Failed `offset=20`, then success. | 1. Trigger failure. 2. Click retry. | Retry calls same `limit`/`offset`; successful rows append once. | PLACE-001-US-018 | Yes | UI E2E | Exact query assertion. |
| PLACE-001-US-018-TC-003 | Incremental network failure is announced | Accessibility, Error Handling | Medium | Screen reader/live region available. Next-page network fails. | Network abort. | 1. Scroll to next page. 2. Observe accessibility tree/live text. | Error is discoverable to assistive tech and retry is keyboard reachable. | PLACE-001-US-018 | Yes | Accessibility | Can use axe plus role assertions. |
| PLACE-001-US-018-TC-004 | Repeated retry failures do not duplicate controls | Regression, UX | Medium | Next-page endpoint repeatedly fails. | Three failed retries. | 1. Trigger failure. 2. Retry three times. | UI remains stable with one retry path and no duplicated error blocks. | PLACE-001-US-018 | Yes | UI E2E | Prevent noisy UI. |
| PLACE-001-US-018-TC-005 | Incremental retry preserves filter and search params | Integration, Regression | High | Filter/search active. Next-page request fails. | `/places?type=restaurant&q=Malfa`, failed `offset=20`. | 1. Open filtered search. 2. Trigger next-page failure. 3. Click retry. | Retry request uses same `type`, `q`, `limit`, and failed `offset`; already loaded rows remain visible. | PLACE-001-US-018 | Yes | UI E2E | Regression cadence. |

## PLACE-001-US-019 - Announce incremental loading and end of results

User Story Summary: As a screen-reader user, I want list loading state announced so that continuous scrolling is understandable.

Related Feature ID: `PLACE-001`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-001-US-019-TC-001 | Next-page loading uses live region | Accessibility, Loading State | Medium | Valid session. Next-page response delayed. | Large catalog. | 1. Scroll near end. 2. Inspect accessibility attributes/text. | Loading state is announced through `aria-live`, `role=status`, or approved equivalent with Arabic user-facing text and without moving focus. | PLACE-001-US-019 | Yes | Accessibility | Regression cadence. |
| PLACE-001-US-019-TC-002 | End-of-results is announced without focus theft | Accessibility, UX | Medium | Final page available. | End after second page. | 1. Scroll to final page. 2. Observe focus and announcement. | End-of-results is conveyed; keyboard focus remains where user expects and is not moved unexpectedly. | PLACE-001-US-019 | Yes | Accessibility | Manual screen-reader confirmation recommended. |
| PLACE-001-US-019-TC-003 | Loading announcement is not repeated excessively | Accessibility, Regression | Low | Continuous scrolling through several pages. | 4 pages. | 1. Scroll through pages. 2. Monitor live region changes. | Announcements occur on state changes only and do not spam repeated identical messages. | PLACE-001-US-019 | Yes | Accessibility | Avoid noisy SR experience. |
| PLACE-001-US-019-TC-004 | End-of-results announcement uses Arabic text | Accessibility, Localization / RTL | Medium | Final page loaded. | End state visible/announced. | 1. Scroll to end. 2. Inspect live-region text or perform screen-reader review. | End-of-results message is understandable in Arabic and contains no mojibake or Unicode escape sequences. | PLACE-001-US-019 | Yes | Accessibility | Manual Review supplement recommended. |

## PLACE-001-US-020 - Preserve scroll position across detail navigation

User Story Summary: As a user browsing a long catalog, I want to return to the same point after opening a place.

Related Feature ID: `PLACE-001`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-001-US-020-TC-001 | Back returns to same filter/search context | Integration, UI | High | Valid session. Filter/search active. | `/places?type=restaurant&q=Malfa`. | 1. Open URL. 2. Scroll. 3. Open a row. 4. Browser Back. | URL query, selected filters, search text, and loaded context are restored. | PLACE-001-US-020 | Yes | UI E2E | Related to PLACE-008 but owned here for list state. |
| PLACE-001-US-020-TC-002 | Back restores opened row visibility | UX, Regression | High | Valid session. Long loaded list. | 60 places. | 1. Scroll until row around index 40 is visible. 2. Record row ID and bounding box. 3. Open detail. 4. Browser Back. | The previously opened row is visible in viewport after return or scroll position is restored within one viewport height; app does not force top reset. | PLACE-001-US-020 | Yes | UI E2E | Regression cadence. |
| PLACE-001-US-020-TC-003 | Virtualized list restores opened row | UI, Performance | Medium | Virtualized list with many rows. | 1000 places. | 1. Scroll to virtualized row. 2. Open detail. 3. Back. | Virtualized list restores enough state for opened row area to be reachable without reloading from top. | PLACE-001-US-020 | Yes | UI E2E | Important with virtualization. |
| PLACE-001-US-020-TC-004 | Return after auth expiry does not expose stale rows | Security, Edge | High | User opens detail, session expires before Back. | Expired session. | 1. Open row detail. 2. Expire session. 3. Browser Back. | `/places` does not render stale protected rows; auth state is revalidated and guest behavior applies. | PLACE-001-US-020 | Yes | Security | Prevents cached data flash. |
| PLACE-001-US-020-TC-005 | Back navigation does not duplicate loaded rows | Regression, Data Integrity | Medium | Valid session. Multiple pages loaded before opening detail. | Loaded pages 1-3. | 1. Load several pages. 2. Open a row. 3. Browser Back. 4. Collect visible/loaded IDs. | Previously loaded rows are restored without duplicate IDs and without appending the same page twice. | PLACE-001-US-020 | Yes | UI E2E | Regression cadence. |

## Final Summary

Total user stories processed: 20

Total test cases generated: 103

### Test Cases Count Per User Story

| User Story ID | Test Case Count |
|---|---:|
| PLACE-001-US-001 | 4 |
| PLACE-001-US-002 | 4 |
| PLACE-001-US-003 | 11 |
| PLACE-001-US-004 | 3 |
| PLACE-001-US-005 | 6 |
| PLACE-001-US-006 | 3 |
| PLACE-001-US-007 | 4 |
| PLACE-001-US-008 | 6 |
| PLACE-001-US-009 | 5 |
| PLACE-001-US-010 | 3 |
| PLACE-001-US-011 | 7 |
| PLACE-001-US-012 | 9 |
| PLACE-001-US-013 | 4 |
| PLACE-001-US-014 | 5 |
| PLACE-001-US-015 | 7 |
| PLACE-001-US-016 | 5 |
| PLACE-001-US-017 | 3 |
| PLACE-001-US-018 | 5 |
| PLACE-001-US-019 | 4 |
| PLACE-001-US-020 | 5 |

### Count By Test Type

| Test Type | Count |
|---|---:|
| API | 29 |
| Accessibility | 18 |
| Authentication | 5 |
| Boundary | 5 |
| Concurrency | 2 |
| Contract | 5 |
| Data Integrity | 7 |
| Defense-in-depth | 1 |
| Edge | 2 |
| Empty State | 4 |
| Error Handling | 9 |
| Integration | 8 |
| Keyboard | 2 |
| Loading State | 6 |
| Localization / RTL | 6 |
| Mobile | 9 |
| Negative | 8 |
| Offline | 1 |
| Performance | 8 |
| Positive | 3 |
| Privacy | 11 |
| Regression | 19 |
| Responsive | 10 |
| Security | 14 |
| UI | 32 |
| UX | 9 |
| UX / Usability | 2 |
| Validation | 5 |

Note: Counts by test type are multi-label counts; one test case may count under more than one type.

### Count By Priority

| Priority | Count |
|---|---:|
| Critical | 21 |
| High | 61 |
| Medium | 20 |
| Low | 1 |

### Count By Automation Layer

| Automation Layer | Count |
|---|---:|
| API | 26 |
| Accessibility | 13 |
| Performance | 2 |
| Security | 4 |
| UI E2E | 58 |
| Unit | 0 |
| Manual | 0 |

### Top Automation Candidates

- `PLACE-001-US-002-TC-001` - Guest API request returns `401`.
- `PLACE-001-US-005-TC-001` - Places API returns collection envelope.
- `PLACE-001-US-003-TC-004` - Row exposes semantic link with accessible name.
- `PLACE-001-US-003-TC-005` - Row activates with keyboard Enter.
- `PLACE-001-US-003-TC-011` - Rating uses Western digits and LTR isolation.
- `PLACE-001-US-007-TC-001` and `PLACE-001-US-007-TC-002` - pagination boundaries.
- `PLACE-001-US-008-TC-001` through `PLACE-001-US-008-TC-006` - invalid pagination validation.
- `PLACE-001-US-009-TC-004` - empty-state CTA accessibility and touch target.
- `PLACE-001-US-011-TC-005` - retry action accessibility and touch target.
- `PLACE-001-US-012-TC-001` - explicit no-horizontal-overflow assertion at 320px.
- `PLACE-001-US-012-TC-009` - 44x44 touch target validation.
- `PLACE-001-US-014-TC-001` through `PLACE-001-US-014-TC-005` - privacy exclusions in API and error responses.
- `PLACE-001-US-015-TC-005` and `PLACE-001-US-015-TC-006` - rapid scroll and out-of-order response protection.
- `PLACE-001-US-017-TC-001` - de-duplication across overlapping pages.

### Manual-Only Test Cases

None are strictly manual-only. Some accessibility tests should still receive supplemental manual screen-reader review:

- `PLACE-001-US-019-TC-001`
- `PLACE-001-US-019-TC-002`
- `PLACE-001-US-019-TC-004`
- `PLACE-001-US-016-TC-003`

### Remaining Assumptions Or Questions

- The exact default page size is implementation-owned, but it must remain bounded and no greater than `100`.
- Exact Arabic UI copy may vary, but required meanings such as `لا توجد أماكن`, `أضف مكانًا`, and no-results recovery must be preserved.
- Performance budgets for virtualization should be finalized by engineering/QA if not already defined.
- Scroll restoration may vary by browser, but application code must not intentionally reset list state or scroll context.

## Re-Audit Result

Findings fixed:

- Added explicit QA execution standards for Arabic integrity, responsive certification, no-overflow assertions, 44x44 touch targets, row accessibility, privacy, and automation cadence.
- Added accessibility coverage for row names, semantic links, keyboard Enter activation, focus-visible behavior, retry controls, empty-state CTA, live regions, and screen-reader announcements.
- Added responsive/mobile coverage for 320px, 390px, 430px, landscape, 200% zoom/adaptive pressure, safe-area behavior, bottom navigation overlap, no horizontal overflow, and touch targets.
- Added deterministic artwork coverage for visibility, reload stability, and accessibility behavior.
- Added privacy coverage for private notes, private list membership, creator identity, forbidden fields, and error payloads.
- Added continuous-scroll coverage for rapid scrolling, duplicate request prevention, out-of-order responses, filter/search preservation, incremental failure, retry, and duplicate-page prevention.
- Strengthened `GET /api/v1/places` API contract coverage for required row fields, forbidden fields, status codes, metadata, sort metadata, and pagination metadata.
- Replaced weak wording with measurable assertions where the requirement allows exact measurement.
- Expanded automation candidates and execution cadence guidance.

Findings remaining:

- No blocking findings remain.
- Performance budgets for long-task thresholds and virtualization row-buffer limits must be supplied by engineering before execution.
- Real screen-reader validation remains recommended as supplemental Manual Review even where automated accessibility checks exist.

Updated scorecard:

| Area | Score |
|---|---:|
| User Story Coverage | 10/10 |
| Acceptance Criteria Coverage | 9.8/10 |
| Functional Coverage | 9.8/10 |
| Negative Coverage | 9.6/10 |
| API Coverage | 9.8/10 |
| UI Coverage | 9.8/10 |
| Accessibility Coverage | 9.7/10 |
| Responsive Coverage | 9.8/10 |
| Security/Privacy Coverage | 9.8/10 |
| Automation Readiness | 9.7/10 |
| Traceability | 10/10 |
| Production QA Readiness | 9.8/10 |

Final verdict: Production Grade
