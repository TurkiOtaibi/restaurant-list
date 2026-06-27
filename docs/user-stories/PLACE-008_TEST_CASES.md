# PLACE-008 Test Cases

Feature: `PLACE-008 - Open place detail from row`

Source: `docs/user-stories/PLACES_USER_STORIES.md`

Scope: All user stories under `PLACE-008`.

## QA Execution Standards

- Places rows are protected content. Guests must receive `401 Unauthorized` from protected APIs and must not see catalog or detail data before authentication resolves.
- The row opens `GET /api/v1/places/{id}` through the `/places/{id}` route.
- Valid detail responses must return `200 OK` and include public place fields: `id`, `name`, `type`, `subtype`, `description`, `averageRating`, `ratingCount`, `createdAt`, and `updatedAt`.
- Not-found, deleted, or stale place IDs must return `404 Not Found` and must not leak whether a private or internal moderation state exists.
- Place rows and detail error payloads must never expose private notes, private list membership, creator identity, internal moderation fields, tokens, cookies, SQL, or stack traces.
- Row navigation must preserve browser history, back/forward behavior, search query, selected filters, sort state, and scroll position as far as the browser/runtime permits.
- Rows must be semantic link controls with an accessible name containing the place name.
- Keyboard activation uses Enter for link behavior. Space must not create a duplicate or unexpected navigation for semantic links.
- Responsive certification points for this feature are `320x568`, `390x844`, `430x932`, landscape `844x390`, and 200% zoom/adaptive pressure.
- Responsive UI tests must assert `document.documentElement.scrollWidth <= window.innerWidth`.
- Minimum interactive touch target for row links and retry controls is `44x44` CSS pixels.
- Arabic test data must remain valid UTF-8 Arabic, including `الأماكن`, `قهوة`, `مطعم ألف`, `آيس كريم`, and `لا توجد أماكن`. No mojibake, escaped Arabic code points, or replacement characters are permitted.
- Automation cadence values used in Notes: Smoke, Regression, Nightly, and Manual Review.

## PLACE-008-US-001 - Open detail from row tap

User Story Summary: As a user, I want to tap a place row so that I can view place details.

Related Feature ID: `PLACE-008`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-008-US-001-TC-001 | Mouse click row opens correct detail route | UI, Positive, Integration | Critical | Valid session. Places list contains place `place-alf` named `مطعم ألف`. | `/places`, row `place-alf`. | 1. Open `/places`. 2. Click the visible row for `مطعم ألف`. 3. Observe URL and detail request. | URL becomes `/places/place-alf`; one `GET /api/v1/places/place-alf` request is sent; detail content for `مطعم ألف` renders after `200 OK`. | PLACE-008-US-001 | Yes | UI E2E | Smoke cadence. |
| PLACE-008-US-001-TC-002 | Touch tap row opens correct detail route on mobile | Mobile, UI, Positive | Critical | Valid session. Mobile viewport `390x844`. Place row is visible. | `/places`, row `place-cafe`. | 1. Set viewport to `390x844`. 2. Open `/places`. 3. Tap row `قهوة الرياض`. | URL becomes `/places/place-cafe`; `GET /api/v1/places/place-cafe` returns `200 OK`; the detail heading contains `قهوة الرياض` and no other row detail is shown. | PLACE-008-US-001 | Yes | UI E2E | Smoke cadence. |
| PLACE-008-US-001-TC-003 | Row navigation sends detail API request with 200 status | API, UI, Contract | Critical | Valid session. Place `place-alf` exists. | `GET /api/v1/places/place-alf`. | 1. Click row `place-alf`. 2. Capture network request. 3. Inspect response. | Request returns `200 OK`; response includes `id=place-alf`, `name`, `type`, `subtype`, `averageRating`, `ratingCount`, `createdAt`, and `updatedAt`. | PLACE-008-US-001 | Yes | UI E2E | Smoke cadence. |
| PLACE-008-US-001-TC-004 | Guest row access is denied without protected content flash | Authentication, Authorization, Privacy, UI | Critical | No valid session. Browser has cached UI from prior authenticated session. | `/places`. | 1. Clear auth tokens/cookies. 2. Open `/places`. 3. Observe first render through auth resolution. | UI shows neutral auth/loading or login state; no row, detail preview, private notes, private list membership, creator identity, or protected catalog data renders before denial/redirect completes. | PLACE-008-US-001 | Yes | UI E2E | Smoke cadence. |
| PLACE-008-US-001-TC-005 | Detail API denies unauthenticated direct request | API, Authentication, Authorization | Critical | No valid session. Place ID is valid. | `GET /api/v1/places/place-alf`. | 1. Send request without credentials. 2. Inspect response. | Status `401 Unauthorized`; response contains no place fields, private fields, catalog metadata, tokens, cookies, SQL, or stack traces. | PLACE-008-US-001 | Yes | API | Smoke cadence. |
| PLACE-008-US-001-TC-006 | Nonexistent place route shows not-found state | API, Error Handling, Negative | High | Valid session. Place ID `missing-place-999` does not exist. | `/places/missing-place-999`. | 1. Navigate directly to `/places/missing-place-999`. 2. Inspect network response and UI. | `GET /api/v1/places/missing-place-999` returns `404 Not Found`; UI shows a not-found state with no private or internal details. | PLACE-008-US-001 | Yes | UI E2E | Regression cadence. |
| PLACE-008-US-001-TC-007 | Deleted or stale place bookmark returns 404 | API, Error Handling, Regression | High | Valid session. Fixture contains stale ID `deleted-place-1` that is no longer returned by Places list. | `/places/deleted-place-1`. | 1. Open the stale bookmark URL. 2. Inspect response and rendered page. | Status `404 Not Found`; page does not show deleted place data, private metadata, stack traces, or SQL. | PLACE-008-US-001 | Yes | API | Regression cadence. |
| PLACE-008-US-001-TC-008 | Double click does not create duplicate history entries | UI, Edge, Regression | Medium | Valid session. A place row is visible. | Row `place-alf`. | 1. Open `/places`. 2. Double click the same row within 300 ms. 3. Press browser Back once. | Only one detail navigation is committed; one Back action returns to `/places` instead of an intermediate duplicate detail entry. | PLACE-008-US-001 | Yes | UI E2E | Regression cadence. |
| PLACE-008-US-001-TC-009 | Repeated taps during transition do not open wrong place | UI, Concurrency, Data Integrity | High | Valid session. Two adjacent rows are visible. | Rows `place-alf`, `place-burger`. | 1. Tap `place-alf` repeatedly during navigation. 2. Inspect final URL and content. | Final URL remains `/places/place-alf`; detail content matches `place-alf`; no adjacent row detail is shown. | PLACE-008-US-001 | Yes | UI E2E | Regression cadence. |
| PLACE-008-US-001-TC-010 | Slow detail request shows deterministic loading state | Loading State, UI, Performance | Medium | Valid session. Detail request is delayed by 2 seconds. | `GET /api/v1/places/place-alf` delayed. | 1. Click row. 2. Delay detail API response. 3. Observe transition. | URL changes to `/places/place-alf`; a loading or skeleton state is visible until `200 OK`; stale list row content is not presented as loaded detail content. | PLACE-008-US-001 | Yes | UI E2E | Regression cadence. |
| PLACE-008-US-001-TC-011 | Cancelled navigation does not render stale detail | Concurrency, Error Handling, UI | Medium | Valid session. Detail request for first row is delayed. | Rows `place-alf`, `place-cafe`. | 1. Click `place-alf`. 2. Before response completes, navigate Back or open `place-cafe`. 3. Let delayed response complete. | Delayed `place-alf` response does not overwrite current route; rendered detail always matches current URL. | PLACE-008-US-001 | Yes | UI E2E | Regression cadence. |
| PLACE-008-US-001-TC-012 | Detail navigation latency meets interactive expectation | Performance, UI | Medium | Valid session. Normal network profile. | Row `place-alf`. | 1. Start timer on row activation. 2. Stop when route loading state appears. 3. Stop again when detail title appears. | Loading feedback appears within 300 ms; detail title appears after successful `200 OK` without blocking main thread for more than 100 ms. | PLACE-008-US-001 | Yes | Performance | Nightly cadence. |
| PLACE-008-US-001-TC-013 | Direct deep link opens existing place detail | UI, Routing, API | Critical | Valid session. Place `place-alf` exists. | `/places/place-alf`. | 1. Open `/places/place-alf` directly in a new browser context. 2. Inspect request and rendered content. | `GET /api/v1/places/place-alf` returns `200 OK`; URL remains `/places/place-alf`; detail heading contains `مطعم ألف`. | PLACE-008-US-001 | Yes | UI E2E | Smoke cadence. |
| PLACE-008-US-001-TC-014 | Copied detail URL opens same place | UI, Routing, Regression | High | Valid session. User copies an existing detail URL. | Copied URL `/places/place-cafe`. | 1. Paste `/places/place-cafe` into a new tab. 2. Load the URL. 3. Inspect title and request. | `GET /api/v1/places/place-cafe` returns `200 OK`; page renders `قهوة الرياض`; no list navigation is required first. | PLACE-008-US-001 | Yes | UI E2E | Regression cadence. |
| PLACE-008-US-001-TC-015 | Bookmarked detail URL remains valid after browser restart | UI, Browser History, Regression | Medium | Valid session can be restored after browser restart. Bookmark exists for a valid place. | Bookmark `/places/place-alf`. | 1. Start a fresh browser session with valid auth. 2. Open the bookmark. 3. Inspect route and content. | `GET /api/v1/places/place-alf` returns `200 OK`; detail renders the bookmarked place without requiring prior list state. | PLACE-008-US-001 | Yes | UI E2E | Regression cadence. |
| PLACE-008-US-001-TC-016 | Expired session on deep link denies protected content | Authentication, Authorization, Privacy, UI | Critical | Access token is expired and refresh cannot recover. Browser opens a valid detail URL. | `/places/place-alf`. | 1. Expire session. 2. Open `/places/place-alf` directly. 3. Observe first render and network. | API returns `401 Unauthorized`; UI shows auth recovery/login; no place detail, private notes, private list membership, creator identity, or cached protected content flashes. | PLACE-008-US-001 | Yes | UI E2E | Smoke cadence. |
| PLACE-008-US-001-TC-017 | Standalone detail API returns required schema | API, Contract, Positive | Critical | Authenticated request. Place `place-alf` exists. | `GET /api/v1/places/place-alf`. | 1. Send request with valid bearer token. 2. Inspect JSON response. | Status `200 OK`; response includes `id`, `name`, `type`, `subtype`, `description`, `averageRating`, `ratingCount`, `createdAt`, and `updatedAt`; each field has the documented type. | PLACE-008-US-001 | Yes | API | Smoke cadence. |
| PLACE-008-US-001-TC-018 | Standalone detail API excludes forbidden fields | API, Security, Privacy, Contract | Critical | Authenticated request. Internal/private data exists for the place and users. | `GET /api/v1/places/place-alf`. | 1. Send request. 2. Recursively inspect response keys and values. | Status `200 OK`; response excludes private notes, private list membership, creator identity, moderation fields, password data, tokens, cookies, SQL, and stack traces. | PLACE-008-US-001 | Yes | API | Smoke cadence. |
| PLACE-008-US-001-TC-019 | Malformed place ID returns validation error | API, Negative, Security, Validation | High | Authenticated request. Malformed path value is requested. | `GET /api/v1/places/%2F..%2Fsecret`. | 1. Send request. 2. Inspect status and body. | Status `422 Validation Error`; response contains no place data, private fields, filesystem paths, SQL, stack traces, tokens, or cookies. | PLACE-008-US-001 | Yes | API | Regression cadence. |
| PLACE-008-US-001-TC-020 | Empty place ID path does not resolve to arbitrary detail | API, Negative, Routing | Medium | Authenticated request. | `GET /api/v1/places/`. | 1. Send request to trailing-slash detail collection path. 2. Inspect response. | Status `404 Not Found`; no arbitrary place is returned and response contains no private fields, SQL, stack traces, tokens, or cookies. | PLACE-008-US-001 | Yes | API | Regression cadence. |
| PLACE-008-US-001-TC-021 | Detail API returns 404 for nonexistent ID | API, Negative, Error Handling | High | Authenticated request. ID does not exist. | `GET /api/v1/places/missing-place-999`. | 1. Send request. 2. Inspect status and payload. | Status `404 Not Found`; payload does not reveal internal lookup logic, moderation status, private notes, SQL, stack traces, tokens, or cookies. | PLACE-008-US-001 | Yes | API | Regression cadence. |
| PLACE-008-US-001-TC-022 | Detail request timeout shows retryable error state | Error Handling, Loading State, UI | High | Valid session. Detail request times out after configured client timeout. | `/places/place-alf`, timeout response. | 1. Open detail URL or click row. 2. Simulate timeout. 3. Inspect UI. | Loading state ends; retry control appears with accessible name; no stale detail or private error details are rendered. | PLACE-008-US-001 | Yes | UI E2E | Regression cadence. |
| PLACE-008-US-001-TC-023 | Detail retry succeeds after timeout | Error Handling, UI, API | High | Valid session. Timeout error state is visible. | Retry `GET /api/v1/places/place-alf`. | 1. Activate retry. 2. Return `200 OK` from detail API. 3. Inspect route and content. | Retry sends `GET /api/v1/places/place-alf`; status `200 OK`; detail heading renders `مطعم ألف`; error state is removed. | PLACE-008-US-001 | Yes | UI E2E | Regression cadence. |
| PLACE-008-US-001-TC-024 | Aborted detail request does not log runtime error | Concurrency, Error Handling, UI | Medium | Valid session. Browser console/network monitoring enabled. | Delayed `GET /api/v1/places/place-alf`. | 1. Click `place-alf`. 2. Navigate Back before response completes. 3. Inspect console and UI after abort. | Aborted request does not render stale detail and does not produce uncaught runtime errors; current route remains list or the active route. | PLACE-008-US-001 | Yes | UI E2E | Regression cadence. |
| PLACE-008-US-001-TC-025 | Rapid alternating row activation honors latest navigation | Concurrency, UI, Data Integrity | High | Valid session. Rows `place-alf` and `place-cafe` are visible; first response is delayed. | Rapid clicks on two rows. | 1. Click `place-alf`. 2. Immediately click `place-cafe`. 3. Let both responses complete out of order. | Final URL is `/places/place-cafe`; rendered heading is `قهوة الرياض`; delayed `place-alf` response does not overwrite current content. | PLACE-008-US-001 | Yes | UI E2E | Smoke cadence. |
| PLACE-008-US-001-TC-026 | Repeated navigation does not degrade latency or history | Performance, Browser History, Regression | Medium | Valid session. Three valid place rows exist. | 20 open/back cycles. | 1. Repeatedly open a row and go Back 20 times. 2. Record loading-feedback latency and history behavior. | Each cycle shows loading feedback within 300 ms; one Back returns to list; no duplicate history entries, memory warning, or uncaught console error occurs. | PLACE-008-US-001 | Yes | Performance | Nightly cadence. |

## PLACE-008-US-002 - Use semantic link

User Story Summary: As a keyboard and assistive-tech user, I want rows to behave like links.

Related Feature ID: `PLACE-008`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-008-US-002-TC-001 | Row exposes semantic link role | Accessibility, UI, Contract | Critical | Valid session. At least one row is visible. | Row `مطعم ألف`. | 1. Open `/places`. 2. Inspect DOM and accessibility tree for first row. | Interactive row element is a native anchor with `href=/places/place-alf` or an ARIA `role=link` control with equivalent Enter-key navigation; target ends in `/places/{id}`. | PLACE-008-US-002 | Yes | Accessibility | Smoke cadence. |
| PLACE-008-US-002-TC-002 | Row accessible name contains place name | Accessibility, Localization, Arabic | Critical | Valid session. Arabic place row is visible. | `مطعم ألف`. | 1. Inspect accessible name of the row link. 2. Compare with visible place name. | Accessible name includes `مطعم ألف` exactly as UTF-8 Arabic text and does not contain mojibake, `undefined`, or internal ID only. | PLACE-008-US-002 | Yes | Accessibility | Smoke cadence. |
| PLACE-008-US-002-TC-003 | Mixed-language row has readable accessible name | Accessibility, Localization, RTL | High | Valid session. Mixed Arabic/English row exists. | `Burger بيت`. | 1. Render mixed-language row. 2. Inspect accessible name and visual order. | Accessible name includes the full mixed-language place name; screen-reader text is not reversed, truncated to ID, or replaced by artwork text. | PLACE-008-US-002 | Yes | Accessibility | Regression cadence. |
| PLACE-008-US-002-TC-004 | Row has no nested interactive conflict | Accessibility, UI, Regression | High | Valid session. Row has rating and artwork. | First visible row. | 1. Inspect DOM and accessibility tree. 2. Count focusable descendants inside row. | Row exposes one primary link target; rating/artwork are not separate focusable controls and do not create nested interactive violations. | PLACE-008-US-002 | Yes | Accessibility | Regression cadence. |
| PLACE-008-US-002-TC-005 | Row link target matches visible place ID | Data Integrity, UI, Contract | High | Valid session. Place row contains known ID and name. | `id=place-alf`, `name=مطعم ألف`. | 1. Inspect row href. 2. Click row. 3. Inspect final URL and title. | Href target is `/places/place-alf`; clicked route and rendered detail title both match the same row. | PLACE-008-US-002 | Yes | UI E2E | Smoke cadence. |
| PLACE-008-US-002-TC-006 | Row touch target meets 44px minimum | Accessibility, Mobile, Responsive | High | Valid session. Viewport `320x568`. | First visible row. | 1. Set viewport to `320x568`. 2. Measure row link bounding box. | Interactive row link bounding box is at least `44x44` CSS pixels and remains tappable without relying on a smaller nested target. | PLACE-008-US-002 | Yes | Accessibility | Regression cadence. |
| PLACE-008-US-002-TC-007 | Artwork does not replace text identification | Accessibility, UI, Privacy | Medium | Valid session. Row includes deterministic artwork. | Row `قهوة الرياض`. | 1. Inspect visible row. 2. Inspect accessible name. | Visible text and accessible name include `قهوة الرياض`; artwork is decorative or separately labeled without hiding the textual place identity. | PLACE-008-US-002 | Yes | Accessibility | Regression cadence. |
| PLACE-008-US-002-TC-008 | Forced-colors mode preserves row link affordance | Accessibility, UI | Medium | Valid session. Browser supports forced-colors emulation. | `/places`. | 1. Enable forced-colors. 2. Tab to row link. 3. Inspect link and focus styling. | Row remains identifiable as interactive; focus indicator is visible with system colors and text remains readable. | PLACE-008-US-002 | Yes | Accessibility | Nightly cadence. |
| PLACE-008-US-002-TC-009 | Detail route cannot be inferred from private metadata | Privacy, Security, UI | High | Valid session. Place rows render. | First visible row. | 1. Inspect rendered attributes, accessible name, and DOM text. | Row exposes public `id` route only; it does not expose creator identity, private list membership, private notes, moderation status, tokens, or cookies. | PLACE-008-US-002 | Yes | UI E2E | Smoke cadence. |
| PLACE-008-US-002-TC-010 | Screen reader announces row as navigable | Accessibility, Manual | Medium | Valid session. Screen reader enabled. | NVDA/VoiceOver with first place row. | 1. Navigate to row using screen-reader browse/focus mode. 2. Listen to announcement. | Announcement includes place name and link/navigation role; it does not announce a misleading expand/collapse or button-only control. | PLACE-008-US-002 | No | Manual | Manual Review cadence. |
| PLACE-008-US-002-TC-011 | Accessible name excludes internal ID-only labels | Accessibility, Privacy, Security | High | Valid session. Place row has public name and internal ID. | Row `place-alf`, name `مطعم ألف`. | 1. Inspect accessible name and DOM labels. 2. Compare against visible row text. | Accessible name contains `مطعم ألف`; it does not expose only `place-alf`, database identifiers, creator identity, private notes, or moderation labels. | PLACE-008-US-002 | Yes | Accessibility | Regression cadence. |
| PLACE-008-US-002-TC-012 | Row link remains valid across browser engines | Accessibility, Cross-Browser, Regression | Medium | Valid session. Chromium, Firefox, and WebKit are available. | First visible row. | 1. Open `/places` in each browser engine. 2. Inspect first row link semantics. 3. Activate with pointer and Enter. | In each engine, row exposes link semantics, pointer activation opens `/places/{id}`, and Enter activation opens the same destination. | PLACE-008-US-002 | Yes | Accessibility | Nightly cadence. |

## PLACE-008-US-003 - Open detail by keyboard

User Story Summary: As a keyboard user, I want to open a row without a pointer.

Related Feature ID: `PLACE-008`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-008-US-003-TC-001 | Tab reaches each visible row link in order | Accessibility, Keyboard, UI | Critical | Valid session. At least three rows are visible. | `/places`. | 1. Open `/places`. 2. Press Tab until rows are reached. 3. Record focus order. | Focus reaches visible row links in the same visual top-to-bottom order without skipping or trapping focus. | PLACE-008-US-003 | Yes | Accessibility | Smoke cadence. |
| PLACE-008-US-003-TC-002 | Enter opens focused row detail | Accessibility, Keyboard, Positive | Critical | Valid session. Focus is on row link for `place-alf`. | Keyboard Enter. | 1. Focus row link. 2. Press Enter. 3. Inspect route and content. | URL becomes `/places/place-alf`; detail content for the focused row renders after `200 OK`. | PLACE-008-US-003 | Yes | Accessibility | Smoke cadence. |
| PLACE-008-US-003-TC-003 | Space preserves native link keyboard behavior | Accessibility, Keyboard, Edge | Medium | Valid session. Focus is on a native anchor row link. | Keyboard Space. | 1. Focus row link. 2. Press Space once. 3. Inspect route, scroll position, and history length. | Space does not open detail or create a history entry for a native anchor; page scroll behavior remains browser-standard; Enter remains the keyboard activation key. | PLACE-008-US-003 | Yes | Accessibility | Regression cadence. |
| PLACE-008-US-003-TC-004 | Shift Tab exits row list predictably | Accessibility, Keyboard, UI | Medium | Valid session. Focus is on second visible row. | Keyboard Shift+Tab. | 1. Focus second row. 2. Press Shift+Tab. | Focus moves to the prior focusable element in DOM order and does not disappear or jump to browser chrome. | PLACE-008-US-003 | Yes | Accessibility | Regression cadence. |
| PLACE-008-US-003-TC-005 | Keyboard-opened detail preserves focus management | Accessibility, Keyboard, UI | High | Valid session. Focus is on row link. | Row `place-alf`. | 1. Press Enter on row. 2. Wait for detail page. 3. Inspect active element or focus target. | Focus moves to a meaningful detail-page target such as main heading or main region; focus is not left on removed list DOM. | PLACE-008-US-003 | Yes | Accessibility | Regression cadence. |
| PLACE-008-US-003-TC-006 | Keyboard activation handles slow network | Accessibility, Keyboard, Loading State | Medium | Valid session. Detail response delayed by 2 seconds. | Row `place-alf`. | 1. Focus row. 2. Press Enter. 3. Observe loading announcement. | Loading state appears and is announced through an accessible status/live region; keyboard focus is not trapped on a stale row. | PLACE-008-US-003 | Yes | Accessibility | Regression cadence. |
| PLACE-008-US-003-TC-007 | Keyboard activation failure exposes retry | Accessibility, Keyboard, Error Handling | High | Valid session. Detail request returns `500`. | Row `place-alf`. | 1. Focus row. 2. Press Enter. 3. Force `GET /api/v1/places/place-alf` to return `500`. | Error state includes a keyboard-focusable retry control with accessible name; error text exposes no private fields or stack traces. | PLACE-008-US-003 | Yes | Accessibility | Regression cadence. |
| PLACE-008-US-003-TC-008 | Keyboard user can return to list with restored context | Accessibility, Keyboard, Regression | High | Valid session. Search/filter context is active. | `q=قهوة&type=cafe`. | 1. Focus a filtered row. 2. Press Enter. 3. Press Alt+Left or browser Back. | Browser returns to the same filtered Places URL; search text and selected filters are restored. | PLACE-008-US-003 | Yes | UI E2E | Regression cadence. |
| PLACE-008-US-003-TC-009 | Keyboard navigation has no private-data flash after session expiry | Authentication, Authorization, Keyboard, Privacy | Critical | Session expires while user is focused on a row. | Expired access token before Enter. | 1. Focus row. 2. Expire session. 3. Press Enter. | Detail request receives `401 Unauthorized`; UI clears protected content and shows auth recovery without rendering private row or detail data. | PLACE-008-US-003 | Yes | UI E2E | Smoke cadence. |
| PLACE-008-US-003-TC-010 | Enter activation works across browser engines | Accessibility, Keyboard, Cross-Browser | Medium | Valid session. Chromium, Firefox, and WebKit are available. | Focused row `place-alf`. | 1. In each browser engine, focus the row link. 2. Press Enter. 3. Inspect route. | Each browser opens `/places/place-alf`; no browser requires pointer interaction to open the focused row. | PLACE-008-US-003 | Yes | Accessibility | Nightly cadence. |

## PLACE-008-US-004 - Avoid duplicate arrow action

User Story Summary: As a user, I want clean rows without misleading controls.

Related Feature ID: `PLACE-008`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-008-US-004-TC-001 | Row does not require separate arrow button | UI, UX, Regression | High | Valid session. Places rows are visible. | First visible row. | 1. Inspect row UI. 2. Click non-text area within the row link. | Whole row opens detail; no separate arrow button is required to complete navigation. | PLACE-008-US-004 | Yes | UI E2E | Smoke cadence. |
| PLACE-008-US-004-TC-002 | Row does not show expand or collapse affordance | UI, UX, Accessibility | Medium | Valid session. Row contains artwork, name, type, and rating. | First visible row. | 1. Inspect visible icons. 2. Inspect accessibility tree. | Row does not show or announce expand/collapse/up/down controls; interactive role remains navigation link. | PLACE-008-US-004 | Yes | Accessibility | Regression cadence. |
| PLACE-008-US-004-TC-003 | Only one focusable navigation target per row | Accessibility, Keyboard, UI | High | Valid session. Multiple rows visible. | `/places`. | 1. Tab through visible rows. 2. Count focus stops per row. | Each row contributes one focus stop for the row link; no extra arrow or duplicate hidden link appears in tab order. | PLACE-008-US-004 | Yes | Accessibility | Regression cadence. |
| PLACE-008-US-004-TC-004 | Clicking rating area inside row still opens detail | UI, UX, Integration | Medium | Valid session. Rated row visible. | Row with `averageRating=8.5`. | 1. Click inside rating display area if it is part of the row link. 2. Inspect route. | Route becomes that row's `/places/{id}`; rating area does not act as a separate unsupported action. | PLACE-008-US-004 | Yes | UI E2E | Regression cadence. |
| PLACE-008-US-004-TC-005 | Clicking artwork area inside row opens detail | UI, UX, Integration | Medium | Valid session. Row artwork visible. | Row with deterministic artwork. | 1. Click/tap artwork area. 2. Inspect route and detail title. | The same row detail opens; artwork does not trap the click or expose a separate action. | PLACE-008-US-004 | Yes | UI E2E | Regression cadence. |
| PLACE-008-US-004-TC-006 | No hidden arrow is exposed to screen readers | Accessibility, Privacy, UI | Medium | Valid session. Screen reader or accessibility tree inspection available. | First visible row. | 1. Inspect accessible nodes for row. 2. Search for arrow, expand, collapse, or up labels. | No separate arrow/expand/collapse action is exposed; screen reader sees only the row link and noninteractive descriptive text. | PLACE-008-US-004 | Yes | Accessibility | Regression cadence. |
| PLACE-008-US-004-TC-007 | Mobile row does not depend on small arrow target | Mobile, Responsive, UX | High | Valid session. Viewport `320x568`. | First visible row. | 1. Set viewport to `320x568`. 2. Tap left, center, and right portions of the row. | Each tap region within the row link opens the same detail route; no tiny arrow target is required. | PLACE-008-US-004 | Yes | UI E2E | Regression cadence. |
| PLACE-008-US-004-TC-008 | Unsupported inline actions are not present | UI, Security, Regression | High | Valid session. Places list visible. | First three rows. | 1. Inspect row controls and DOM text. 2. Search for edit, delete, add, rate, or owner controls in row. | Row exposes navigation only; edit/delete/add/rate/owner controls are not present in the PLACE-008 row surface. | PLACE-008-US-004 | Yes | UI E2E | Smoke cadence. |

## PLACE-008-US-005 - Preserve filter and search context on return

User Story Summary: As a user, I want to return to the same browsing state after viewing details.

Related Feature ID: `PLACE-008`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-008-US-005-TC-001 | Back restores search query after detail navigation | UI, Regression, Integration | Critical | Valid session. Search for `قهوة` returns at least one row. | `/places?q=قهوة`. | 1. Open `/places?q=قهوة`. 2. Click a row. 3. Press browser Back. | URL returns to `/places?q=قهوة`; search input contains `قهوة`; results match the restored query. | PLACE-008-US-005 | Yes | UI E2E | Smoke cadence. |
| PLACE-008-US-005-TC-002 | Back restores primary type filter | UI, Regression, Integration | Critical | Valid session. Cafe filter returns rows. | `/places?type=cafe`. | 1. Open cafe-filtered list. 2. Click a row. 3. Press Back. | URL includes `type=cafe`; cafe filter remains selected; rendered rows are cafe rows only. | PLACE-008-US-005 | Yes | UI E2E | Smoke cadence. |
| PLACE-008-US-005-TC-003 | Back restores subtype filter | UI, Regression, Integration | High | Valid session. Restaurant subtype filter returns rows. | `/places?type=restaurant&subtype=burger`. | 1. Open filtered list. 2. Click row. 3. Press Back. | URL includes `type=restaurant&subtype=burger`; subtype selection and visible rows match burger restaurant results. | PLACE-008-US-005 | Yes | UI E2E | Regression cadence. |
| PLACE-008-US-005-TC-004 | Back restores combined search and filter state | UI, Regression, Integration | High | Valid session. Combined query returns rows. | `/places?q=برجر&type=restaurant&subtype=burger`. | 1. Open combined state. 2. Click a matching row. 3. Press Back. | URL, search input, primary filter, subtype filter, and result rows all match the pre-navigation state. | PLACE-008-US-005 | Yes | UI E2E | Regression cadence. |
| PLACE-008-US-005-TC-005 | Forward returns to same detail after Back | UI, Browser History, Regression | Medium | Valid session. User opened detail from filtered list and pressed Back. | Browser history. | 1. Complete Back restoration. 2. Press browser Forward. | Browser returns to the same `/places/{id}` detail route and renders the same place after `200 OK`. | PLACE-008-US-005 | Yes | UI E2E | Regression cadence. |
| PLACE-008-US-005-TC-006 | Browser refresh on detail preserves detail route | UI, Browser History, Regression | Medium | Valid session. User is on `/places/place-alf`. | Refresh. | 1. Refresh browser on detail page. 2. Inspect route and content. | URL remains `/places/place-alf`; detail API returns `200 OK`; rendered place remains `place-alf`. | PLACE-008-US-005 | Yes | UI E2E | Regression cadence. |
| PLACE-008-US-005-TC-007 | Search diacritics remain intact through Back | Localization, Arabic, Regression | Medium | Valid session. Search query uses Arabic diacritics. | `/places?q=قَهْوَة`. | 1. Open query with diacritics. 2. Click row. 3. Press Back. | Search input restores `قَهْوَة` exactly; results follow normalized diacritic-folded search behavior. | PLACE-008-US-005 | Yes | UI E2E | Regression cadence. |
| PLACE-008-US-005-TC-008 | Sort context remains default rating order after return | UI, Data Integrity, Regression | Medium | Valid session. Filtered results contain rated and unrated places. | `/places?type=ice_cream`. | 1. Open filtered list. 2. Record visible row order. 3. Open detail and press Back. | Row order after Back matches the recorded order and still follows rating-desc sorting with unrated last. | PLACE-008-US-005 | Yes | UI E2E | Regression cadence. |
| PLACE-008-US-005-TC-009 | Error on detail still permits returning to prior context | Error Handling, UI, Regression | High | Valid session. Filtered list contains link to a stale ID that returns `404`. | `/places?type=cafe`, stale row fixture. | 1. Open filtered list. 2. Activate stale row. 3. Observe `404`. 4. Press Back. | Browser returns to the original filtered list URL and UI state; error page does not clear search/filter context. | PLACE-008-US-005 | Yes | UI E2E | Regression cadence. |
| PLACE-008-US-005-TC-010 | Session expiry on detail does not leak restored list data | Authentication, Authorization, Privacy | Critical | Valid session opens detail, then session expires before Back. | Detail route with expired session. | 1. Open detail from filtered list. 2. Expire session. 3. Press Back. | App does not render protected filtered rows after session expiry; it shows auth recovery or login and no private-data flash. | PLACE-008-US-005 | Yes | UI E2E | Smoke cadence. |
| PLACE-008-US-005-TC-011 | URL query parameters remain canonical after return | UI, Contract, Regression | Medium | Valid session. Query parameters use supported filters. | `/places?type=restaurant&subtype=burger&q=مطعم`. | 1. Open URL. 2. Click row. 3. Press Back. 4. Inspect URL. | Supported query parameters are preserved without duplicate `type`, duplicate `subtype`, or malformed query strings. | PLACE-008-US-005 | Yes | UI E2E | Regression cadence. |
| PLACE-008-US-005-TC-012 | Restored state does not issue unfiltered stale request | API, Integration, Data Integrity | High | Valid session. Network capture enabled. | `/places?q=قهوة&type=cafe`. | 1. Open combined state. 2. Click row. 3. Press Back. 4. Inspect first list reload request. | Reload request includes restored `q=قهوة&type=cafe` and returns `200 OK`; UI does not briefly render unfiltered catalog rows. | PLACE-008-US-005 | Yes | UI E2E | Smoke cadence. |
| PLACE-008-US-005-TC-013 | Forward after detail refresh restores same detail | Browser History, UI, Regression | Medium | Valid session. User opened detail from filtered list, refreshed detail, and pressed Back. | `/places?q=قهوة&type=cafe` to `/places/place-cafe`. | 1. Open filtered list. 2. Open row. 3. Refresh detail. 4. Press Back. 5. Press Forward. | Forward returns to `/places/place-cafe`; `GET /api/v1/places/place-cafe` returns `200 OK`; heading contains `قهوة الرياض`. | PLACE-008-US-005 | Yes | UI E2E | Regression cadence. |
| PLACE-008-US-005-TC-014 | Restored history state survives browser reload on list | Browser History, UI, Regression | Medium | Valid session. User returns from detail to filtered list. | `/places?q=برجر&type=restaurant&subtype=burger`. | 1. Open filtered list. 2. Open row. 3. Press Back. 4. Refresh list page. | After reload, URL query, search input, filters, and rating-desc row order remain consistent with the restored state. | PLACE-008-US-005 | Yes | UI E2E | Regression cadence. |
| PLACE-008-US-005-TC-015 | Copied detail URL does not invent prior list state | UI, Routing, Browser History | Medium | Valid session. Detail URL is opened directly without previous list history. | `/places/place-alf`. | 1. Open copied detail URL in new tab. 2. Press browser Back. | Browser leaves the app or returns to the previous external page; app does not fabricate a stale `/places` query state. | PLACE-008-US-005 | Yes | UI E2E | Regression cadence. |
| PLACE-008-US-005-TC-016 | Back restoration preserves scroll and query together | UI, Browser History, Continuous Scroll | High | Valid session. Filtered search has enough rows to scroll. | `/places?q=قهوة&type=cafe`, row index 35. | 1. Open filtered search. 2. Scroll to row 35. 3. Open row. 4. Press Back. | URL and controls restore `q=قهوة&type=cafe`; scroll returns near row 35 within 150 CSS px; no unfiltered rows flash. | PLACE-008-US-005 | Yes | UI E2E | Smoke cadence. |

## PLACE-008-US-006 - Preserve scroll position where browser supports it

User Story Summary: As a user browsing a long list, I want to return near the row I opened.

Related Feature ID: `PLACE-008`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-008-US-006-TC-001 | Back restores scroll near opened row | UI, Regression, Browser History | High | Valid session. Long list has at least 60 rows. | Row at index 45. | 1. Scroll until row 45 is visible. 2. Record row bounding rectangle and `scrollY`. 3. Open row. 4. Press Back. | Returned list has `scrollY > 0`; opened row is visible or within 150 CSS px of its recorded vertical position. | PLACE-008-US-006 | Yes | UI E2E | Smoke cadence. |
| PLACE-008-US-006-TC-002 | Virtualized list restores opened row after Back | UI, Performance, Regression | High | Valid session. List uses continuous scrolling/virtualization. | Row beyond initial viewport. | 1. Scroll until an off-initial row renders. 2. Open it. 3. Press Back. | Virtualized list rehydrates enough rows to show the opened row or nearest buffered position without blank content. | PLACE-008-US-006 | Yes | UI E2E | Regression cadence. |
| PLACE-008-US-006-TC-003 | Back after detail refresh does not force top reset | UI, Browser History, Edge | Medium | Valid session. User opened detail from scrolled list. | Browser refresh on detail. | 1. Scroll list until `scrollY >= 800`. 2. Open row. 3. Refresh detail page. 4. Press Back. | Browser returns to list route with restored query context; final `scrollY` is greater than `0` or the originating row is visible within 150 CSS px. | PLACE-008-US-006 | Yes | UI E2E | Regression cadence. |
| PLACE-008-US-006-TC-004 | Loaded page range is preserved after Back | UI, Data Integrity, Continuous Scroll | Medium | Valid session. User has loaded at least three pages. | `limit=20`, offset through 40. | 1. Scroll until page 3 rows are visible. 2. Open row. 3. Press Back. | Previously loaded range is available or refetched without duplicate rows; row IDs remain unique. | PLACE-008-US-006 | Yes | UI E2E | Regression cadence. |
| PLACE-008-US-006-TC-005 | Incremental reload failure preserves recovery path | Error Handling, UI, Continuous Scroll | Medium | Valid session. Back restoration triggers incremental page refetch and one page returns `500`. | Offset page returns `500`. | 1. Open detail from a scrolled row. 2. Press Back. 3. Force incremental page failure. | UI shows retry for failed page while preserving already restored rows and context; no private fields appear in error UI. | PLACE-008-US-006 | Yes | UI E2E | Regression cadence. |
| PLACE-008-US-006-TC-006 | Scroll restoration works at mobile 390px | Mobile, Responsive, UI | Medium | Valid session. Viewport `390x844`. Long list exists. | Row at index 30. | 1. Set viewport `390x844`. 2. Scroll to row 30. 3. Open detail. 4. Press Back. | Returned page restores near row 30; bottom navigation does not cover the restored row's interactive area. | PLACE-008-US-006 | Yes | UI E2E | Regression cadence. |
| PLACE-008-US-006-TC-007 | Scroll restoration has no horizontal overflow | Responsive, UI, Regression | Medium | Valid session. Long names exist in scrolled rows. | Viewport `320x568`. | 1. Set viewport `320x568`. 2. Scroll deep. 3. Open row and Back. 4. Measure document width. | `document.documentElement.scrollWidth <= window.innerWidth`; restored row text remains contained. | PLACE-008-US-006 | Yes | UI E2E | Regression cadence. |
| PLACE-008-US-006-TC-008 | Back from 404 returns to previous scroll context | Error Handling, Browser History, UI | Medium | Valid session. Stale row fixture is visible deep in list. | Stale ID returns `404`. | 1. Scroll to stale row. 2. Open it. 3. Observe `404`. 4. Press Back. | User returns to prior list context near the stale row; not-found page does not clear list history state. | PLACE-008-US-006 | Yes | UI E2E | Regression cadence. |
| PLACE-008-US-006-TC-009 | Scroll restoration does not reveal private cached rows after logout | Privacy, Authentication, UI | Critical | User opened detail from scrolled list, then logs out in another tab. | Broadcast logout. | 1. Open detail from scrolled list. 2. Simulate logout/session invalidation. 3. Press Back. | Protected list rows are not restored from cache; auth state blocks rendering and no private-data flash occurs. | PLACE-008-US-006 | Yes | UI E2E | Smoke cadence. |
| PLACE-008-US-006-TC-010 | Restored scroll does not trap keyboard focus off-screen | Accessibility, Keyboard, UI | Medium | Valid session. Opened row was deep in list. | Keyboard Back flow. | 1. Open row by keyboard from scrolled position. 2. Press Back. 3. Press Tab. | Focus lands on or near a visible restored row/control; focus does not move to an off-screen virtualized element. | PLACE-008-US-006 | Yes | Accessibility | Regression cadence. |
| PLACE-008-US-006-TC-011 | Scroll restoration is stable across browser engines | Browser History, Cross-Browser, UI | Medium | Valid session. Chromium, Firefox, and WebKit are available. Long list exists. | Row at index 40. | 1. In each browser engine, scroll to row 40. 2. Open detail. 3. Press Back. | Each browser restores to `scrollY > 0` or displays row 40 within 150 CSS px; no engine returns to top because of app code. | PLACE-008-US-006 | Yes | UI E2E | Nightly cadence. |
| PLACE-008-US-006-TC-012 | Scroll restoration recovers after out-of-order page responses | Continuous Scroll, Concurrency, UI | High | Valid session. Scrolled list has virtualized pages and delayed page responses. | Page offsets `20` and `40` complete out of order after Back. | 1. Scroll to row loaded from offset 40. 2. Open detail. 3. Press Back. 4. Complete offset 40 before offset 20. | Restored list has unique row IDs, originating row remains visible or near viewport, and out-of-order responses do not reset scroll to top. | PLACE-008-US-006 | Yes | UI E2E | Regression cadence. |

## PLACE-008-US-007 - Keep long row text contained

User Story Summary: As a user, I want long place names readable without breaking navigation.

Related Feature ID: `PLACE-008`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-008-US-007-TC-001 | Long Arabic name is contained in row link | Responsive, Arabic, UI | Critical | Valid session. Long Arabic place name exists. | `مطعم ألف للأكلات الشعبية والمشاوي والوجبات السريعة جدًا`. | 1. Open `/places`. 2. Locate long Arabic row. 3. Measure row and viewport. | Text is clamped or wraps within row bounds; it does not collide with rating/artwork and `scrollWidth <= innerWidth`. | PLACE-008-US-007 | Yes | UI E2E | Smoke cadence. |
| PLACE-008-US-007-TC-002 | Long English token does not cause overflow | Responsive, Boundary, UI | High | Valid session. Long unbroken English name exists. | `SuperLongBurgerRestaurantNameWithoutSpacesVersionOne`. | 1. Open `/places`. 2. Locate row. 3. Measure document width. | Long token is clipped/wrapped using source-level layout rules; no horizontal overflow occurs. | PLACE-008-US-007 | Yes | UI E2E | Regression cadence. |
| PLACE-008-US-007-TC-003 | Mixed Arabic English name preserves readable layout | RTL, Localization, Responsive | High | Valid session. Mixed-language long name exists. | `Burger بيت الرياض Premium`. | 1. Open `/places`. 2. Inspect row visual order and containment. | Name remains readable in RTL context; rating and artwork remain visually separate; no text overlaps. | PLACE-008-US-007 | Yes | UI E2E | Regression cadence. |
| PLACE-008-US-007-TC-004 | 320px viewport keeps row text contained | Responsive, Mobile, Boundary | Critical | Valid session. Long row names exist. | Viewport `320x568`. | 1. Set viewport `320x568`. 2. Open `/places`. 3. Inspect long rows. | No row causes horizontal scrolling; row link remains at least `44x44` CSS px; name does not overlap rating/artwork. | PLACE-008-US-007 | Yes | UI E2E | Smoke cadence. |
| PLACE-008-US-007-TC-005 | 390px viewport keeps row text contained | Responsive, Mobile | High | Valid session. Long row names exist. | Viewport `390x844`. | 1. Set viewport `390x844`. 2. Open `/places`. 3. Inspect long rows. | `document.documentElement.scrollWidth <= window.innerWidth`; long text is contained and row navigation remains tappable. | PLACE-008-US-007 | Yes | UI E2E | Regression cadence. |
| PLACE-008-US-007-TC-006 | 430px viewport keeps row text contained | Responsive, Mobile | High | Valid session. Long row names exist. | Viewport `430x932`. | 1. Set viewport `430x932`. 2. Open `/places`. 3. Inspect long rows. | No horizontal overflow or overlap occurs; rating and artwork remain visible within row. | PLACE-008-US-007 | Yes | UI E2E | Regression cadence. |
| PLACE-008-US-007-TC-007 | 200% zoom keeps row text contained | Responsive, Accessibility, Boundary | Critical | Valid session. Browser supports 200% zoom/adaptive pressure. | Long Arabic and English rows. | 1. Apply 200% zoom. 2. Open `/places`. 3. Measure layout. | Row text remains contained; no horizontal overflow occurs; row link remains reachable by keyboard and touch. | PLACE-008-US-007 | Yes | UI E2E | Smoke cadence. |
| PLACE-008-US-007-TC-008 | Landscape layout keeps row navigation usable | Responsive, Mobile, UI | Medium | Valid session. Landscape viewport `844x390`. | Long row names. | 1. Set viewport `844x390`. 2. Open `/places`. 3. Inspect visible rows and bottom nav. | Long rows do not overlap bottom navigation or safe areas; interactive row targets remain visible and tappable. | PLACE-008-US-007 | Yes | UI E2E | Regression cadence. |
| PLACE-008-US-007-TC-009 | Accessible name retains full long place name | Accessibility, Localization, UI | High | Valid session. Long visible row is truncated/clamped visually. | Long Arabic name fixture. | 1. Inspect accessible name. 2. Compare with source place name. | Accessible name contains the full place name, not only the visually truncated text or internal ID. | PLACE-008-US-007 | Yes | Accessibility | Regression cadence. |
| PLACE-008-US-007-TC-010 | Text containment does not break navigation hit area | UI, UX, Responsive | High | Valid session. Long row text is clamped. | Long row fixture. | 1. Click/tap on visible text area and whitespace area inside same row. 2. Inspect route. | Both activations open the same `/places/{id}` route; clamping does not reduce the interactive row target below `44x44`. | PLACE-008-US-007 | Yes | UI E2E | Regression cadence. |
| PLACE-008-US-007-TC-011 | Rating does not overlap long name | UI, Data Integrity, Responsive | High | Valid session. Rated long-name row exists. | `averageRating=9.5`, long name. | 1. Render row. 2. Compare bounding boxes for name and rating. | Name and rating bounding boxes do not intersect; displayed rating remains readable with Western digits and one decimal place. | PLACE-008-US-007 | Yes | UI E2E | Regression cadence. |
| PLACE-008-US-007-TC-012 | Artwork does not overlap long name | UI, Responsive, Regression | Medium | Valid session. Long-name row has artwork. | Long mixed-language name fixture. | 1. Render row. 2. Compare bounding boxes for artwork and name. | Artwork and name bounding boxes do not intersect; artwork remains decorative/secondary and text identification remains visible. | PLACE-008-US-007 | Yes | UI E2E | Regression cadence. |

## PLACE-008-US-008 - Show focus-visible only for keyboard focus

User Story Summary: As a pointer user, I do not want a persistent selected outline after tapping.

Related Feature ID: `PLACE-008`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-008-US-008-TC-001 | Pointer tap does not leave persistent focus outline | UI, UX, Accessibility | High | Valid session. Pointer device available. | First visible row. | 1. Tap/click a row. 2. Return Back to list. 3. Inspect row styling after pointer interaction. | No persistent selected/focus outline remains due only to pointer tap; row styling returns to normal non-focused state. | PLACE-008-US-008 | Yes | UI E2E | Smoke cadence. |
| PLACE-008-US-008-TC-002 | Keyboard Tab shows visible focus indicator | Accessibility, Keyboard, UI | Critical | Valid session. Places rows are visible. | Keyboard Tab. | 1. Open `/places`. 2. Press Tab until a row is focused. 3. Inspect focus style. | Focus indicator is visible around the focused row link and meets contrast expectations in normal theme. | PLACE-008-US-008 | Yes | Accessibility | Smoke cadence. |
| PLACE-008-US-008-TC-003 | Mouse click does not suppress future keyboard focus | Accessibility, Keyboard, Regression | High | Valid session. Pointer and keyboard available. | First visible row. | 1. Click a row and go Back. 2. Press Tab to focus a row. | Pointer interaction does not disable keyboard focus-visible; focused row has a visible indicator. | PLACE-008-US-008 | Yes | Accessibility | Regression cadence. |
| PLACE-008-US-008-TC-004 | Focus indicator survives forced-colors mode | Accessibility, Keyboard, UI | Medium | Valid session. Forced-colors emulation available. | `/places`. | 1. Enable forced-colors. 2. Tab to row. 3. Inspect focus ring. | Focus indicator is visible using system colors and is not hidden by transparent or background-only styling. | PLACE-008-US-008 | Yes | Accessibility | Nightly cadence. |
| PLACE-008-US-008-TC-005 | Focus restoration after Back is visible for keyboard flow | Accessibility, Browser History, Keyboard | High | Valid session. Row was opened with Enter. | Row `place-alf`. | 1. Focus row. 2. Press Enter. 3. Press Back. | Focus returns to the originating row or a nearby visible list control with focus-visible styling; focus is not lost to body. | PLACE-008-US-008 | Yes | Accessibility | Regression cadence. |
| PLACE-008-US-008-TC-006 | Reduced motion does not remove focus feedback | Accessibility, Reduced Motion, UI | Medium | Valid session. `prefers-reduced-motion: reduce` enabled. | `/places`. | 1. Enable reduced motion. 2. Tab to row. 3. Activate and go Back. | Focus feedback remains visible without relying on animation; navigation remains functional. | PLACE-008-US-008 | Yes | Accessibility | Nightly cadence. |
| PLACE-008-US-008-TC-007 | Failed detail navigation keeps focus recoverable | Accessibility, Error Handling, Keyboard | Medium | Valid session. Detail request returns `500`. | Row `place-alf`. | 1. Focus row. 2. Press Enter. 3. Force `500` response. 4. Tab to retry. | Error state has a visible focus target and retry control; keyboard user can recover without pointer input. | PLACE-008-US-008 | Yes | Accessibility | Regression cadence. |
| PLACE-008-US-008-TC-008 | Touch focus behavior remains clean on mobile | Mobile, Accessibility, UX | Medium | Valid session. Viewport `390x844`. | Touch tap row. | 1. Tap a row. 2. Press Back. 3. Inspect row state. | Row does not show a stale selected border after touch; subsequent keyboard focus still shows visible focus when Tab is used. | PLACE-008-US-008 | Yes | UI E2E | Regression cadence. |
| PLACE-008-US-008-TC-009 | Focus restoration after Back works across browser engines | Accessibility, Browser History, Cross-Browser | Medium | Valid session. Chromium, Firefox, and WebKit are available. Row opened by keyboard. | Row `place-alf`. | 1. In each browser engine, Tab to row. 2. Press Enter. 3. Press Back. 4. Inspect active element. | Focus returns to the originating row or nearest visible list control with focus-visible styling in each browser engine. | PLACE-008-US-008 | Yes | Accessibility | Nightly cadence. |
| PLACE-008-US-008-TC-010 | Focus-visible is not replaced by hover-only styling | Accessibility, Keyboard, UI | High | Valid session. Mouse is not hovering over row. | Keyboard focus on first row. | 1. Move pointer away from rows. 2. Press Tab to focus row. 3. Inspect computed focus style. | Focus indicator is visible without requiring hover; it has measurable outline, border, or box-shadow distinct from unfocused rows. | PLACE-008-US-008 | Yes | Accessibility | Regression cadence. |
| PLACE-008-US-008-TC-011 | Retry focus returns to row flow after successful recovery | Accessibility, Error Handling, Keyboard | Medium | Valid session. Detail error retry succeeds. | `GET /api/v1/places/place-alf` first `500`, then `200 OK`. | 1. Focus row and press Enter. 2. Force `500`. 3. Focus retry and activate it. 4. Return Back to list. | Retry request returns `200 OK`; detail loads; Back restores focus to row/list flow with visible keyboard focus. | PLACE-008-US-008 | Yes | Accessibility | Regression cadence. |

## Final Summary

1. User stories processed: 8
2. Total test cases generated: 107
3. Duplicate test case IDs: 0
4. Invalid story references: 0
5. Missing user stories: 0
6. Encoding/mojibake findings: 0
7. API tests missing exact status codes: 0

### Test Count Per User Story

| User Story ID | Test Cases |
|---|---:|
| PLACE-008-US-001 | 26 |
| PLACE-008-US-002 | 12 |
| PLACE-008-US-003 | 10 |
| PLACE-008-US-004 | 8 |
| PLACE-008-US-005 | 16 |
| PLACE-008-US-006 | 12 |
| PLACE-008-US-007 | 12 |
| PLACE-008-US-008 | 11 |

### Count By Test Type

| Test Type | Count |
|---|---:|
| Accessibility | 36 |
| API | 12 |
| Arabic | 3 |
| Authentication | 6 |
| Authorization | 5 |
| Boundary | 3 |
| Browser History | 14 |
| Concurrency | 5 |
| Contract | 6 |
| Continuous Scroll | 4 |
| Cross-Browser | 4 |
| Data Integrity | 7 |
| Edge | 3 |
| Error Handling | 13 |
| Integration | 8 |
| Keyboard | 19 |
| Loading State | 3 |
| Localization | 5 |
| Manual | 1 |
| Mobile | 9 |
| Negative | 4 |
| Performance | 4 |
| Positive | 4 |
| Privacy | 10 |
| Reduced Motion | 1 |
| Regression | 27 |
| Responsive | 15 |
| Routing | 4 |
| RTL | 2 |
| Security | 5 |
| UI | 70 |
| UX | 8 |
| Validation | 1 |

### Count By Priority

| Priority | Count |
|---|---:|
| Critical | 22 |
| High | 41 |
| Medium | 44 |
| Low | 0 |

### Count By Automation Layer

| Automation Layer | Count |
|---|---:|
| Accessibility | 31 |
| API | 7 |
| Manual | 1 |
| Performance | 2 |
| UI E2E | 66 |

### Count By Automation Cadence

| Cadence | Count |
|---|---:|
| Manual Review | 1 |
| Nightly | 9 |
| Regression | 66 |
| Smoke | 31 |

### Top Automation Candidates

- Smoke UI E2E: row click/tap opens `/places/{id}` with matching detail content.
- Smoke API: `GET /api/v1/places/{id}` returns `200 OK` for authenticated users, `401 Unauthorized` for guests, and excludes forbidden fields.
- Smoke accessibility: row exposes semantic link role and accessible name containing the place name.
- Smoke privacy: no private notes, private list membership, creator identity, or internal fields appear during navigation, errors, or auth resolution.
- Regression UI E2E: Back/Forward preserve query, filters, sort, and scroll context.
- Regression API: malformed, nonexistent, deleted, and stale place IDs return safe `422 Validation Error` or `404 Not Found` responses as specified.
- Regression concurrency: rapid alternating row activation, aborted requests, and out-of-order responses render only the current route.
- Regression responsive: long row text stays contained at `320x568`, `390x844`, `430x932`, landscape, and 200% zoom.

### Manual-Only Tests

- `PLACE-008-US-002-TC-010`: Requires real screen-reader announcement validation across assistive technologies.

### Remaining Assumptions Or Questions

- Scroll restoration can vary by browser/runtime; tests use measurable tolerance and require the app not to intentionally reset to top.
- Detail response may include additional current-user context, but PLACE-008 requires that no other user's private data or creator identity is exposed.
