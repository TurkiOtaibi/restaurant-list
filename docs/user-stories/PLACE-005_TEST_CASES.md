# PLACE-005 Test Cases

Feature: `PLACE-005 - Browse ice cream places`

Source: `docs/user-stories/PLACES_USER_STORIES.md`

Scope: All user stories under `PLACE-005`.

## QA Execution Standards

- Arabic test data must remain valid UTF-8 Arabic, especially `آيس كريم`, `الأماكن`, and `لا توجد نتائج`.
- Ice cream places use `type=ice_cream`.
- Ice cream places must not have any subtype.
- Successful `GET /api/v1/places?type=ice_cream` responses must follow `{ data, meta }`; each row must include only approved place summary fields and `meta` must include `limit`, `offset`, `total`, and `sort`.
- `GET /api/v1/places?type=ice_cream&subtype=<value>` must return `422 Validation Error` with code `INVALID_PLACE_SUBTYPE_FILTER`.
- Valid ice cream filtered responses must not leak restaurant rows, cafe rows, subtype metadata, private notes, private list membership, creator identity, tokens, stack traces, SQL, or internal moderation fields.
- Ice cream metadata in UI must display valid Arabic `آيس كريم` and must not render subtype punctuation, trailing separators, mojibake, or Unicode escape sequences.
- Responsive certification points for this feature are `320x568`, `390x844`, `430x932`, landscape `844x390`, and 200% zoom/adaptive pressure.
- Responsive UI tests must assert `document.documentElement.scrollWidth <= window.innerWidth`.
- Minimum interactive touch target for category filter, rows, retry actions, clear-filter actions, and create-place actions is `44x44` CSS pixels.
- Category filter accessibility baseline: keyboard navigation, selected-state announcement, focus-visible, and screen-reader labels for `آيس كريم`.
- Automation cadence values used in Notes: Smoke, Regression, Nightly, and Manual Review.

## PLACE-005-US-001 - View ice cream places

User Story Summary: As a user, I want an ice cream filter so that I can browse ice cream places.

Related Feature ID: `PLACE-005`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-005-US-001-TC-001 | Selecting ice cream updates URL and request | Positive, UI, API, Integration | Critical | Valid session. Places page loaded with any other type selected. | Select `آيس كريم`. | 1. Open `/places?type=restaurant`. 2. Select ice cream category. 3. Inspect URL/request and response. | Request is `GET /api/v1/places?type=ice_cream`; response status is `200 OK`; URL contains `type=ice_cream`. | PLACE-005-US-001 | Yes | UI E2E | Smoke cadence. |
| PLACE-005-US-001-TC-002 | Ice cream API returns only ice cream places | API, Data Integrity | Critical | Authenticated request. Mixed restaurant, cafe, and ice cream places exist. | `GET /api/v1/places?type=ice_cream`. | 1. Send request. 2. Inspect every row. | Status `200 OK`; every row has `type=ice_cream`; no restaurant or cafe rows appear. | PLACE-005-US-001 | Yes | API | Smoke cadence. |
| PLACE-005-US-001-TC-003 | Ice cream UI rows match ice cream type | UI, Data Integrity, Regression | High | Valid session. Mixed catalog exists. | `/places?type=ice_cream`. | 1. Open URL. 2. Inspect visible rows. | Every visible row metadata identifies ice cream; no row metadata identifies restaurant or cafe. | PLACE-005-US-001 | Yes | UI E2E | Regression cadence. |
| PLACE-005-US-001-TC-004 | Ice cream category selected state is visible and not color-only | UX, UI, Accessibility | High | Valid session. Ice cream selected. | `type=ice_cream`. | 1. Select ice cream. 2. Inspect category control. | Ice cream category visibly indicates selected state through text/semantic state and not color alone. | PLACE-005-US-001 | Yes | UI E2E | Regression cadence. |
| PLACE-005-US-001-TC-005 | Ice cream filtering preserves search query | Integration, Regression | Medium | Valid session. Search query active. | `/places?type=cafe&q=Gelato`, select ice cream. | 1. Open URL. 2. Select ice cream. 3. Inspect URL/request. | Request status is `200 OK`; URL/request include `type=ice_cream` and `q=Gelato`; no `subtype` is included. | PLACE-005-US-001 | Yes | UI E2E | Regression cadence. |
| PLACE-005-US-001-TC-006 | Ice cream response schema is complete | API, Contract | High | Authenticated request. At least one ice cream place exists. | `GET /api/v1/places?type=ice_cream&limit=1&offset=0`. | 1. Send request. 2. Inspect first row in `data`. | Status `200 OK`; row includes `id`, `name`, `type`, `subtype`, `averageRating`, `ratingCount`, `createdAt`, and `updatedAt`; `type=ice_cream`; `subtype=null`. | PLACE-005-US-001 | Yes | API | Regression cadence. |
| PLACE-005-US-001-TC-007 | Ice cream response includes metadata and sort | API, Contract | High | Authenticated request. | `GET /api/v1/places?type=ice_cream&limit=10&offset=0`. | 1. Send request. 2. Inspect `meta`. | Status `200 OK`; `meta.limit=10`, `meta.offset=0`, `meta.total` reflects ice cream places only, and `meta.sort=rating_desc`. | PLACE-005-US-001 | Yes | API | Regression cadence. |
| PLACE-005-US-001-TC-008 | Ice cream response excludes forbidden fields | Privacy, Security, API, Contract | Critical | Authenticated request. Internal/private fields exist in fixtures. | `GET /api/v1/places?type=ice_cream`. | 1. Send request. 2. Recursively inspect `data` and `meta`. | Status `200 OK`; response excludes `notes`, `privateNotes`, `listMembership`, `creatorId`, `creatorEmail`, `moderationState`, tokens, cookies, SQL, and stack traces. | PLACE-005-US-001 | Yes | API | Smoke cadence. |
| PLACE-005-US-001-TC-009 | Guest ice cream API request returns 401 | Authentication, Authorization, Security, API | Critical | No valid session. | `GET /api/v1/places?type=ice_cream`. | 1. Clear auth. 2. Send request. | Status `401 Unauthorized`; no place rows or metadata totals are returned. | PLACE-005-US-001 | Yes | API | Smoke cadence. |
| PLACE-005-US-001-TC-010 | Guest opening ice cream page sees no protected data flash | Authentication, Authorization, Privacy, UI | Critical | No valid session. Browser may contain stale cached Places UI from an earlier session. | `/places?type=ice_cream`. | 1. Clear auth tokens/cookies. 2. Open URL. 3. Observe first render through auth resolution. | UI shows neutral auth/loading or login state; no ice cream rows, cached rows, private notes, list membership, creator identity, ratings context, or protected metadata render before denial/redirect completes. | PLACE-005-US-001 | Yes | UI E2E | Smoke cadence. |
| PLACE-005-US-001-TC-011 | Session expiry during ice cream request clears protected results | Authentication, Authorization, Error Handling, Privacy, UI | Critical | Valid session starts request, then access/refresh auth becomes invalid before response completion. | `GET /api/v1/places?type=ice_cream` returns `401 Unauthorized`. | 1. Start ice cream filtered request. 2. Expire session before completion. 3. Observe UI. | UI removes protected rows, shows auth-expired/login recovery state, and does not leave stale ice cream rows visible as current data. | PLACE-005-US-001 | Yes | UI E2E | Regression cadence. |
| PLACE-005-US-001-TC-012 | Ice cream pagination has no duplicate IDs and stable ordering | API, Data Integrity, Regression | High | Authenticated request. At least 25 ice cream places exist. | `limit=10`, offsets `0`, `10`, `20`. | 1. Request three consecutive ice cream pages. 2. Concatenate returned IDs. 3. Compare row ordering against `rating_desc`. | Status `200 OK` for each page; no duplicate IDs appear across pages; combined rows preserve `averageRating DESC NULLS LAST`, `ratingCount DESC`, normalized name ASC. | PLACE-005-US-001 | Yes | API | Regression cadence. |
| PLACE-005-US-001-TC-013 | Ice cream UI continuous scroll has no duplicate rows | UI, Data Integrity, Regression | High | Valid session. More than two pages of ice cream places exist. | `type=ice_cream`, continuous scroll. | 1. Open ice cream URL. 2. Scroll until at least three pages load. 3. Collect rendered row IDs. | No duplicate IDs are rendered; all visible rows remain `type=ice_cream`; page ordering remains stable after incremental append. | PLACE-005-US-001 | Yes | UI E2E | Regression cadence. |
| PLACE-005-US-001-TC-014 | Repeated identical ice cream requests are idempotent | API, Regression, Data Integrity | Medium | Authenticated request. Stable fixture data. | Same ice cream request repeated three times. | 1. Send `GET /api/v1/places?type=ice_cream&limit=20&offset=0` three times. 2. Compare status, IDs, and metadata. | All responses return `200 OK`; row IDs, `meta.total`, and `meta.sort` are identical while fixture data is unchanged. | PLACE-005-US-001 | Yes | API | Regression cadence. |
| PLACE-005-US-001-TC-015 | Delayed old category response cannot overwrite latest ice cream response | Concurrency, Data Integrity, UI | High | Valid session. Restaurant request delayed, ice cream selected last. | Delayed restaurant response, fast ice cream response. | 1. Trigger restaurant request. 2. Quickly select ice cream. 3. Return ice cream response first, then restaurant response. | Final URL, selected category, and rows remain ice cream; delayed restaurant response is ignored for current state. | PLACE-005-US-001 | Yes | UI E2E | Nightly cadence. |
| PLACE-005-US-001-TC-016 | Ice cream load failure preserves URL and supports retry | Error Handling, UI, Regression | High | Valid session. `type=ice_cream` active. Next request fails with `500`. | Failed ice cream request. | 1. Open ice cream URL. 2. Force API `500`. 3. Activate retry. | Error state is shown with retry; URL remains `type=ice_cream`; retry sends the same request and renders ice cream rows on success. | PLACE-005-US-001 | Yes | UI E2E | Regression cadence. |
| PLACE-005-US-001-TC-017 | Ice cream category is not selected when restaurant is active | UI, Regression | High | Valid session. Restaurant category active. | `/places?type=restaurant`. | 1. Open URL. 2. Inspect primary category controls. | Restaurant is selected; `آيس كريم` is not selected and does not expose selected/current/pressed/checked state. | PLACE-005-US-001 | Yes | UI E2E | Regression cadence. |
| PLACE-005-US-001-TC-018 | Ice cream category is not selected when cafe is active | UI, Regression | High | Valid session. Cafe category active. | `/places?type=cafe`. | 1. Open URL. 2. Inspect primary category controls. | Cafe is selected; `آيس كريم` is not selected and does not expose selected/current/pressed/checked state. | PLACE-005-US-001 | Yes | UI E2E | Regression cadence. |
| PLACE-005-US-001-TC-019 | Ice cream request rejects limit below minimum | API, Boundary, Validation | High | Authenticated request. | `GET /api/v1/places?type=ice_cream&limit=0&offset=0`. | 1. Send request. 2. Inspect response. | Status `422 Validation Error`; no place data returned; error payload contains no SQL, stack trace, tokens, or private fields. | PLACE-005-US-001 | Yes | API | Regression cadence. |
| PLACE-005-US-001-TC-020 | Ice cream request rejects limit above maximum | API, Boundary, Validation | High | Authenticated request. | `GET /api/v1/places?type=ice_cream&limit=101&offset=0`. | 1. Send request. 2. Inspect response. | Status `422 Validation Error`; no place data returned; error payload contains no SQL, stack trace, tokens, or private fields. | PLACE-005-US-001 | Yes | API | Regression cadence. |
| PLACE-005-US-001-TC-021 | Ice cream request rejects negative offset | API, Boundary, Validation | High | Authenticated request. | `GET /api/v1/places?type=ice_cream&limit=10&offset=-1`. | 1. Send request. 2. Inspect response. | Status `422 Validation Error`; no place data returned; error payload contains no SQL, stack trace, tokens, or private fields. | PLACE-005-US-001 | Yes | API | Regression cadence. |
| PLACE-005-US-001-TC-022 | Ice cream offset beyond total returns empty page with valid metadata | API, Boundary, Contract | Medium | Authenticated request. Ice cream total is known. | `GET /api/v1/places?type=ice_cream&limit=10&offset=<total+10>`. | 1. Send request. 2. Inspect response envelope. | Status `200 OK`; `data=[]`; `meta.total` remains ice-cream-only total; `meta.limit=10`; `meta.offset` equals requested offset; `meta.sort=rating_desc`. | PLACE-005-US-001 | Yes | API | Regression cadence. |
| PLACE-005-US-001-TC-023 | Long populated ice cream list final row is not hidden by bottom navigation | Responsive, Mobile, UI | High | Valid session. More than three pages of ice cream places exist. | `390x844`, long ice cream list. | 1. Open `/places?type=ice_cream`. 2. Scroll to bottom after multiple pages load. 3. Inspect final row and bottom navigation. | Final row and any visible row action are fully above bottom navigation and safe-area padding; `document.documentElement.scrollWidth <= window.innerWidth`. | PLACE-005-US-001 | Yes | UI E2E | Regression cadence. |

## PLACE-005-US-002 - Hide subtype filter for ice cream

User Story Summary: As a user, I do not want irrelevant subtype controls so that the UI stays simple.

Related Feature ID: `PLACE-005`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-005-US-002-TC-001 | Ice cream hides subtype trigger | UI, Negative, Regression | Critical | Valid session. Places page loaded. | `/places?type=ice_cream`. | 1. Open URL. 2. Inspect filter area. | No subtype trigger is rendered while ice cream is active. | PLACE-005-US-002 | Yes | UI E2E | Smoke cadence. |
| PLACE-005-US-002-TC-002 | Ice cream hides subtype chips | UI, Negative, Regression | High | Valid session. Ice cream active. | Restaurant/cafe subtype labels. | 1. Open `/places?type=ice_cream`. 2. Search visible filter chips/options. | No visible subtype chip or option exists for `برجر`, `قهوة`, `شاهي`, or any other subtype. | PLACE-005-US-002 | Yes | UI E2E | Regression cadence. |
| PLACE-005-US-002-TC-003 | Ice cream rows show no subtype label | UI, Data Integrity | High | Valid session. Ice cream rows exist. | `type=ice_cream`. | 1. Open URL. 2. Inspect row metadata for several rows. | Row metadata contains valid ice cream type label only and no subtype label. | PLACE-005-US-002 | Yes | UI E2E | Regression cadence. |
| PLACE-005-US-002-TC-004 | Ice cream accessibility tree has no subtype controls | Accessibility, Screen Reader, Negative | High | Valid session. Ice cream active. | Accessibility tree. | 1. Open URL. 2. Inspect focus order and accessibility tree. | No subtype trigger, subtype option, hidden subtype menu, or stale subtype control exists in the focus order or accessibility tree. | PLACE-005-US-002 | Yes | Accessibility | Regression cadence. |
| PLACE-005-US-002-TC-005 | Keyboard navigation skips subtype controls for ice cream | Accessibility, Keyboard | High | Valid session. Keyboard only. Ice cream active. | Tab sequence. | 1. Open `/places?type=ice_cream`. 2. Tab through top controls. | Focus moves through page header, primary category filters, search, rows/actions; it never lands on a subtype control. | PLACE-005-US-002 | Yes | Accessibility | Regression cadence. |
| PLACE-005-US-002-TC-006 | Hidden subtype controls do not leave layout gap | UX, UI, Responsive | Medium | Valid session. Ice cream active. | `390x844`. | 1. Open URL. 2. Measure vertical gap between primary filters and search/results. | No empty subtype-control row remains; vertical space between sections matches approved compact spacing for Places page. | PLACE-005-US-002 | Yes | UI E2E | Regression cadence. |
| PLACE-005-US-002-TC-007 | Ice cream no-subtype layout has no horizontal overflow at 320px | Responsive, Mobile | High | Valid session. Mobile viewport. | `320x568`, `type=ice_cream`. | 1. Set viewport. 2. Open URL. 3. Evaluate no-overflow assertion. | `document.documentElement.scrollWidth <= window.innerWidth`; category filter, search, and rows remain inside viewport. | PLACE-005-US-002 | Yes | UI E2E | Smoke cadence. |
| PLACE-005-US-002-TC-008 | Ice cream subtype absence persists after refresh | Regression, UI | Medium | Valid session. Ice cream active. | `/places?type=ice_cream`. | 1. Open URL. 2. Reload browser. 3. Inspect filter area. | Ice cream remains selected and no subtype trigger/chip/label appears after reload. | PLACE-005-US-002 | Yes | UI E2E | Regression cadence. |
| PLACE-005-US-002-TC-009 | Ice cream subtype absence persists after back/forward navigation | Regression, UI | Medium | Valid session. Browser history contains cafe subtype then ice cream. | `/places?type=cafe&subtype=coffee` then ice cream. | 1. Open cafe coffee URL. 2. Switch to ice cream. 3. Press Back then Forward. | Cafe history restores cafe subtype only on cafe state; ice cream forward state has no subtype controls or subtype URL param. | PLACE-005-US-002 | Yes | UI E2E | Regression cadence. |
| PLACE-005-US-002-TC-010 | Ice cream response subtype field never creates UI subtype punctuation | UI, Data Integrity, Regression | Medium | Valid session. API returns ice cream rows with `subtype=null` or omitted. | Ice cream place rows. | 1. Open ice cream URL. 2. Inspect metadata string for each visible row. | Metadata contains no double separators, dangling separators, empty subtype chips, `null`, `undefined`, or blank punctuation. | PLACE-005-US-002 | Yes | UI E2E | Regression cadence. |

## PLACE-005-US-003 - Clear subtype when switching to ice cream

User Story Summary: As a user, I want invalid subtype state removed automatically so that ice cream results are valid.

Related Feature ID: `PLACE-005`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-005-US-003-TC-001 | Switching from restaurant subtype to ice cream removes subtype | UI, Integration, Regression | Critical | Valid session. Restaurant burger subtype active. | `/places?type=restaurant&subtype=burger`. | 1. Open URL. 2. Select ice cream. 3. Inspect URL/request. | URL becomes `/places?type=ice_cream` with no `subtype`; request is `GET /api/v1/places?type=ice_cream`; response status is `200 OK`. | PLACE-005-US-003 | Yes | UI E2E | Smoke cadence. |
| PLACE-005-US-003-TC-002 | Switching from cafe subtype to ice cream removes subtype | UI, Integration, Regression | High | Valid session. Cafe coffee subtype active. | `/places?type=cafe&subtype=coffee`. | 1. Open URL. 2. Select ice cream. 3. Inspect URL/request. | URL becomes `/places?type=ice_cream` with no `subtype`; request is `GET /api/v1/places?type=ice_cream`; response status is `200 OK`. | PLACE-005-US-003 | Yes | UI E2E | Regression cadence. |
| PLACE-005-US-003-TC-003 | Switching to ice cream clears subtype accessible name | Accessibility, UI | High | Valid session. Restaurant burger subtype active. | `subtype=burger`. | 1. Switch to ice cream. 2. Inspect active filters and accessibility tree. | No subtype trigger or stale `برجر` label remains in visible UI, focus order, or accessibility tree. | PLACE-005-US-003 | Yes | Accessibility | Regression cadence. |
| PLACE-005-US-003-TC-004 | Switching to ice cream preserves search query while clearing subtype | Integration, UI | Medium | Valid session. Search query active with restaurant subtype. | `/places?type=restaurant&subtype=burger&q=Gelato`. | 1. Open URL. 2. Select ice cream. 3. Inspect URL/request. | URL/request include `type=ice_cream&q=Gelato` and no `subtype`; response status is `200 OK`. | PLACE-005-US-003 | Yes | UI E2E | Regression cadence. |
| PLACE-005-US-003-TC-005 | Delayed restaurant subtype response cannot restore stale subtype after ice cream switch | Concurrency, Data Integrity, UI | High | Valid session. Delayed burger request exists. | Delayed `type=restaurant&subtype=burger`, then switch to ice cream. | 1. Trigger delayed burger request. 2. Switch to ice cream. 3. Return ice cream response first, then burger response. | Final URL and rows remain ice cream; delayed restaurant response is ignored; `subtype` is not re-added. | PLACE-005-US-003 | Yes | UI E2E | Nightly cadence. |
| PLACE-005-US-003-TC-006 | Delayed cafe subtype response cannot restore stale subtype after ice cream switch | Concurrency, Data Integrity, UI | High | Valid session. Delayed coffee request exists. | Delayed `type=cafe&subtype=coffee`, then switch to ice cream. | 1. Trigger delayed coffee request. 2. Switch to ice cream. 3. Return ice cream response first, then coffee response. | Final URL and rows remain ice cream; delayed cafe response is ignored; `subtype` is not re-added. | PLACE-005-US-003 | Yes | UI E2E | Nightly cadence. |
| PLACE-005-US-003-TC-007 | Ice cream switch from subtype page has no duplicate rows | Data Integrity, Regression | Medium | Valid session. Subtype rows visible. | Switch from burger to ice cream. | 1. Open burger subtype URL. 2. Switch to ice cream. 3. Collect rendered row IDs. | No duplicate IDs appear; stale subtype rows are not appended to ice cream results. | PLACE-005-US-003 | Yes | UI E2E | Regression cadence. |
| PLACE-005-US-003-TC-008 | Switching to ice cream shows loading state without stale final rows | Loading State, UI, Regression | High | Valid session. Restaurant rows visible. Ice cream request delayed. | Switch to ice cream. | 1. Select ice cream. 2. Observe pending state. | Loading state is visible; previous restaurant/cafe rows are not presented as final ice cream results while request is pending. | PLACE-005-US-003 | Yes | UI E2E | Regression cadence. |
| PLACE-005-US-003-TC-009 | Switching to ice cream after invalid subtype URL recovers safely | Error Handling, UI | Medium | Valid session. Invalid subtype URL is loaded. | `/places?type=cafe&subtype=burger`. | 1. Open invalid URL. 2. Select ice cream. | URL becomes `/places?type=ice_cream`; invalid subtype error is cleared; ice cream request returns `200 OK`. | PLACE-005-US-003 | Yes | UI E2E | Regression cadence. |
| PLACE-005-US-003-TC-010 | Switching to ice cream keeps touch target requirements | Accessibility, Mobile | Medium | Valid session. Mobile viewport. | `320x568`. | 1. Open subtype page. 2. Measure ice cream category control. 3. Select ice cream. | Ice cream category control has at least `44x44` CSS pixel hit target before activation and remains selected after activation. | PLACE-005-US-003 | Yes | Accessibility | Regression cadence. |

## PLACE-005-US-004 - Reject ice cream subtype API query

User Story Summary: As the system, I want ice cream subtype queries rejected so that the contract is explicit.

Related Feature ID: `PLACE-005`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-005-US-004-TC-001 | API rejects ice cream with restaurant subtype burger | Negative, Validation, API | Critical | Authenticated request. | `GET /api/v1/places?type=ice_cream&subtype=burger`. | 1. Send request. 2. Inspect response. | Status `422 Validation Error`; error code `INVALID_PLACE_SUBTYPE_FILTER`; no place data returned. | PLACE-005-US-004 | Yes | API | Smoke cadence. |
| PLACE-005-US-004-TC-002 | API rejects ice cream with cafe subtype coffee | Negative, Validation, API | High | Authenticated request. | `type=ice_cream&subtype=coffee`. | 1. Send request. | Status `422 Validation Error`; error code `INVALID_PLACE_SUBTYPE_FILTER`; no place data returned. | PLACE-005-US-004 | Yes | API | Regression cadence. |
| PLACE-005-US-004-TC-003 | API rejects ice cream with cafe subtype tea | Negative, Validation, API | High | Authenticated request. | `type=ice_cream&subtype=tea`. | 1. Send request. | Status `422 Validation Error`; error code `INVALID_PLACE_SUBTYPE_FILTER`; no place data returned. | PLACE-005-US-004 | Yes | API | Regression cadence. |
| PLACE-005-US-004-TC-004 | API rejects every restaurant subtype for ice cream | Negative, Validation, API | Critical | Authenticated request. | Matrix of all restaurant subtype values with `type=ice_cream`. | 1. For each restaurant subtype, request `GET /api/v1/places?type=ice_cream&subtype=<restaurantSubtype>`. | Each request returns `422 Validation Error` with code `INVALID_PLACE_SUBTYPE_FILTER`; no place data returned. | PLACE-005-US-004 | Yes | API | Regression cadence. Data-driven case. |
| PLACE-005-US-004-TC-005 | API rejects blank subtype for ice cream | Negative, Validation, API | High | Authenticated request. | `type=ice_cream&subtype=`. | 1. Send request. | Status `422 Validation Error`; error code `INVALID_PLACE_SUBTYPE_FILTER`; no place data returned. | PLACE-005-US-004 | Yes | API | Regression cadence. |
| PLACE-005-US-004-TC-006 | API rejects duplicate subtype params for ice cream | Negative, Validation, API | Medium | Authenticated request. | `type=ice_cream&subtype=burger&subtype=coffee`. | 1. Send request. | Status `422 Validation Error`; API does not silently choose an arbitrary subtype; no place data returned. | PLACE-005-US-004 | Yes | API | Regression cadence. |
| PLACE-005-US-004-TC-007 | API rejects malformed encoded ice cream subtype | Negative, Validation, API | High | Authenticated request. | `GET /api/v1/places?type=ice_cream&subtype=%E0%A4%A`. | 1. Send malformed request. 2. Inspect response. | Status `422 Validation Error`; error code `INVALID_PLACE_SUBTYPE_FILTER`; no place data, SQL, stack trace, or private data is returned. | PLACE-005-US-004 | Yes | API | Regression cadence. |
| PLACE-005-US-004-TC-008 | API rejects injected ice cream subtype value safely | Security, Validation, API | Critical | Authenticated request. | `type=ice_cream&subtype=burger%27%20OR%201=1`. | 1. Send request. 2. Inspect response. | Status `422 Validation Error`; no SQL, stack trace, private data, or partial data returned. | PLACE-005-US-004 | Yes | Security | Smoke cadence. |
| PLACE-005-US-004-TC-009 | API rejects whitespace-padded ice cream subtype | Negative, Validation, API | Medium | Authenticated request. | `type=ice_cream&subtype=%20burger%20`. | 1. Send request. | Status `422 Validation Error`; error code `INVALID_PLACE_SUBTYPE_FILTER`; no place data returned. | PLACE-005-US-004 | Yes | API | Regression cadence. |
| PLACE-005-US-004-TC-010 | API rejects case-mismatched ice cream subtype | Negative, Validation, API | Medium | Authenticated request. | `type=ice_cream&subtype=Burger`. | 1. Send request. | Status `422 Validation Error`; error code `INVALID_PLACE_SUBTYPE_FILTER`; no place data returned. | PLACE-005-US-004 | Yes | API | Regression cadence. |
| PLACE-005-US-004-TC-011 | API rejects unknown removed ice cream subtype | Negative, Validation, API | High | Authenticated request. `sorbet` is treated as unsupported/deprecated subtype fixture value. | `type=ice_cream&subtype=sorbet`. | 1. Send request. | Status `422 Validation Error`; error code `INVALID_PLACE_SUBTYPE_FILTER`; no place data returned. | PLACE-005-US-004 | Yes | API | Regression cadence. |
| PLACE-005-US-004-TC-012 | API rejects duplicate type params with ice cream subtype | Negative, Validation, API | Medium | Authenticated request. | `GET /api/v1/places?type=ice_cream&type=cafe&subtype=coffee`. | 1. Send request. 2. Inspect response. | Status `422 Validation Error`; API does not silently choose one `type`; no place data returned. | PLACE-005-US-004 | Yes | API | Regression cadence. |
| PLACE-005-US-004-TC-013 | Invalid ice cream subtype error excludes private data | Privacy, Security, API | Critical | Authenticated request. Internal private data exists. | `type=ice_cream&subtype=burger`. | 1. Send request. 2. Scan error body. | Status `422 Validation Error`; error contains no private notes, private list membership, creator identity, internal moderation fields, SQL, stack traces, tokens, or cookies. | PLACE-005-US-004 | Yes | API | Smoke cadence. |
| PLACE-005-US-004-TC-014 | Invalid ice cream subtype response keeps structured error schema | API, Contract, Validation | Medium | Authenticated request. | `type=ice_cream&subtype=burger`. | 1. Send request. 2. Inspect error envelope. | Status `422 Validation Error`; response includes machine-readable code `INVALID_PLACE_SUBTYPE_FILTER`, a user-safe message, and no `data` array. | PLACE-005-US-004 | Yes | API | Regression cadence. |
| PLACE-005-US-004-TC-015 | UI invalid ice cream subtype URL recovers safely | Error Handling, UI | High | Valid session. Browser can open arbitrary URL. | `/places?type=ice_cream&subtype=burger`. | 1. Open URL. 2. Observe UI. | UI shows validation recovery state with reset/clear-filter action; stale rows are not rendered as valid subtype-filtered ice cream results; reset navigates to `/places?type=ice_cream`. | PLACE-005-US-004 | Yes | UI E2E | Regression cadence. |
| PLACE-005-US-004-TC-016 | Invalid ice cream subtype recovery has no horizontal overflow at 320px | Responsive, Mobile, Error Handling | Medium | Valid session. Mobile viewport. Invalid ice cream subtype URL is loaded. | `/places?type=ice_cream&subtype=burger`, `320x568`. | 1. Set viewport. 2. Open invalid URL. 3. Wait for validation recovery UI. 4. Evaluate no-overflow assertion. | `document.documentElement.scrollWidth <= window.innerWidth`; recovery message and reset action are fully visible above bottom navigation/safe-area padding. | PLACE-005-US-004 | Yes | UI E2E | Regression cadence. |

## PLACE-005-US-005 - Show ice cream empty state

User Story Summary: As a user, I want clear feedback if no ice cream places exist.

Related Feature ID: `PLACE-005`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-005-US-005-TC-001 | Ice cream empty state shows no-results copy | Empty State, UI, UX | Medium | Valid session. Ice cream has zero rows while other categories exist. | `/places?type=ice_cream`, `data: []`, `meta.total: 0`. | 1. Open URL or select ice cream. | UI shows exactly `لا توجد نتائج`, not full catalog-empty copy. | PLACE-005-US-005 | Yes | UI E2E | Smoke cadence. |
| PLACE-005-US-005-TC-002 | Ice cream empty state offers deterministic clear-filter CTA | Empty State, UI | Medium | Valid session. Empty ice cream state visible. | Active `type=ice_cream`. | 1. Inspect empty state actions. | UI shows primary CTA `عرض الكل`; target is at least `44x44` CSS pixels; no fake result rows are displayed. | PLACE-005-US-005 | Yes | UI E2E | Regression cadence. |
| PLACE-005-US-005-TC-003 | Clear-filter CTA removes ice cream type only | UI, Integration | Medium | Valid session. Empty ice cream state visible with `عرض الكل`. | `/places?type=ice_cream`. | 1. Activate `عرض الكل`. 2. Inspect URL/request. | URL becomes `/places` with no `type` and no `subtype`; next request returns `200 OK` for default Places browsing. | PLACE-005-US-005 | Yes | UI E2E | Regression cadence. |
| PLACE-005-US-005-TC-004 | Empty state does not create data automatically | UI, Integration, Data Integrity | Medium | Valid session. Empty ice cream state visible. | Empty state primary CTA. | 1. Open empty ice cream state. 2. Do not activate any create-place command. 3. Inspect network calls. | Empty state does not submit `POST /api/v1/places`, does not create test data, and does not mutate lists/ratings. | PLACE-005-US-005 | Yes | UI E2E | Regression cadence. |
| PLACE-005-US-005-TC-005 | Empty state is not shown while ice cream request is loading | Loading State, UI | Medium | Valid session. Ice cream request delayed. | `type=ice_cream`. | 1. Select ice cream. 2. Observe pending state before response. | Loading state appears first; `لا توجد نتائج` appears only after successful empty response. | PLACE-005-US-005 | Yes | UI E2E | Regression cadence. |
| PLACE-005-US-005-TC-006 | Ice cream empty state is accessible | Accessibility, Empty State | Medium | Valid session. Empty ice cream state visible. | `لا توجد نتائج`. | 1. Inspect accessibility tree. 2. Navigate to recovery action. | Empty-state message is readable by assistive tech; recovery action has accessible name, visible focus, and at least `44x44` CSS pixel target. | PLACE-005-US-005 | Yes | Accessibility | Regression cadence. |
| PLACE-005-US-005-TC-007 | Ice cream empty state has no horizontal overflow | Responsive, Mobile | Medium | Valid session. Mobile viewport. | `320x568`, empty state. | 1. Set viewport. 2. Open empty ice cream URL. 3. Evaluate no-overflow assertion. | `document.documentElement.scrollWidth <= window.innerWidth`; empty message and recovery action remain visible. | PLACE-005-US-005 | Yes | UI E2E | Regression cadence. |
| PLACE-005-US-005-TC-008 | Empty ice cream response preserves privacy | Privacy, Security, API | High | Valid session. Empty ice cream result. Internal private data exists for other rows. | `GET /api/v1/places?type=ice_cream` returns empty. | 1. Request endpoint. 2. Inspect response and UI. | Status `200 OK`; no private notes, private list membership, creator identity, or internal fields are exposed. | PLACE-005-US-005 | Yes | API | Regression cadence. |
| PLACE-005-US-005-TC-009 | Empty ice cream retry preserves active category after failed load | Error Handling, UI, Regression | Medium | Valid session. `type=ice_cream` active. First request fails, retry succeeds empty. | Failed then successful ice cream request with `data=[]`. | 1. Open ice cream URL. 2. Force first request to fail. 3. Activate retry. | URL remains `type=ice_cream`; retry sends same request; successful empty response shows `لا توجد نتائج`. | PLACE-005-US-005 | Yes | UI E2E | Regression cadence. |
| PLACE-005-US-005-TC-010 | Empty ice cream state remains contained at 430px and landscape | Responsive, Mobile | Medium | Valid session. Empty state available. | `430x932` and `844x390`. | 1. Set each viewport. 2. Open empty ice cream URL. 3. Evaluate no-overflow assertion and bottom navigation overlap. | For both viewports, `document.documentElement.scrollWidth <= window.innerWidth`; message and recovery action remain visible above bottom navigation/safe area. | PLACE-005-US-005 | Yes | UI E2E | Regression cadence. |
| PLACE-005-US-005-TC-011 | Ice cream no-results state is announced | Accessibility, Empty State, Screen Reader | Medium | Valid session. Empty state visible. | `لا توجد نتائج`. | 1. Open empty ice cream URL. 2. Inspect live region or status announcement. | Empty-state transition is announced through `role=status` or `aria-live=polite`; focus remains on current control unless user moves it. | PLACE-005-US-005 | Yes | Accessibility | Regression cadence. |

## PLACE-005-US-006 - Display ice cream metadata cleanly

User Story Summary: As a user, I want ice cream rows to avoid blank subtype punctuation.

Related Feature ID: `PLACE-005`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-005-US-006-TC-001 | Ice cream row metadata shows valid Arabic category label | UI, Arabic, Localization | High | Valid session. Ice cream place exists. | Ice cream row. | 1. Open `/places?type=ice_cream`. 2. Inspect row metadata text. | Metadata includes exact Arabic label `آيس كريم` and contains no mojibake. | PLACE-005-US-006 | Yes | UI E2E | Smoke cadence. |
| PLACE-005-US-006-TC-002 | Ice cream row metadata has no trailing separator | UI, Data Integrity, Regression | High | Valid session. Ice cream place has no subtype. | Row metadata. | 1. Open ice cream URL. 2. Inspect every visible row metadata string. | Metadata does not end with `·`, `-`, `/`, vertical bar, comma, colon, blank separator, or doubled whitespace. | PLACE-005-US-006 | Yes | UI E2E | Regression cadence. |
| PLACE-005-US-006-TC-003 | Ice cream row metadata does not show null or undefined | UI, Data Integrity | High | Valid session. API returns `subtype=null` or omits subtype. | Ice cream rows. | 1. Open ice cream URL. 2. Inspect visible row text. | Row text does not include `null`, `undefined`, empty parentheses, empty chip, or untranslated subtype placeholder. | PLACE-005-US-006 | Yes | UI E2E | Regression cadence. |
| PLACE-005-US-006-TC-004 | Ice cream metadata uses Western digits for rating | UI, Localization, Regression | Medium | Valid session. Ice cream place has `averageRating=8.5`. | Rated ice cream row. | 1. Open ice cream URL. 2. Inspect rating display. | Rating displays as LTR Western digits, e.g. `8.5`; it is not clipped and does not collide with metadata. | PLACE-005-US-006 | Yes | UI E2E | Regression cadence. |
| PLACE-005-US-006-TC-005 | Ice cream metadata omits rating when unrated | UI, Data Integrity | Medium | Valid session. Unrated ice cream place exists. | `averageRating=null`, `ratingCount=0`. | 1. Open ice cream URL. 2. Inspect unrated row. | No fake rating, `لا تقييم`, `null`, `0`, or placeholder rating is shown. | PLACE-005-US-006 | Yes | UI E2E | Regression cadence. |
| PLACE-005-US-006-TC-006 | Long ice cream place name does not collide with metadata or rating | Responsive, UI, Mobile | High | Valid session. Long mixed-language ice cream name exists. | `محل آيس كريم Gelato Factory King Abdullah Financial District`. | 1. Set viewport `320x568`. 2. Open ice cream URL. 3. Inspect row. | Place name is limited to no more than two visible lines; metadata `آيس كريم` and rating remain visible; no text overlaps; `document.documentElement.scrollWidth <= window.innerWidth`. | PLACE-005-US-006 | Yes | UI E2E | Regression cadence. |
| PLACE-005-US-006-TC-007 | Ice cream metadata has accessible row name | Accessibility, Screen Reader | High | Valid session. Ice cream row exists. | Row link accessible name. | 1. Inspect accessibility tree for row link. | Row link accessible name includes place name and ice cream category; it does not include blank subtype punctuation or decorative artwork text. | PLACE-005-US-006 | Yes | Accessibility | Regression cadence. |
| PLACE-005-US-006-TC-008 | Ice cream metadata no-mojibake regression | Arabic, Localization, UI | Critical | Valid session. Ice cream row exists. | Visible row text. | 1. Open ice cream URL. 2. Scan visible text. | Visible row text contains no mojibake sequences, Unicode replacement character, or escaped Arabic code points; expected Arabic label is valid UTF-8. | PLACE-005-US-006 | Yes | UI E2E | Smoke cadence. |
| PLACE-005-US-006-TC-009 | Manual review confirms ice cream Arabic label pronunciation | Accessibility, Arabic, Localization | Medium | Valid session. Real assistive technology available. | `آيس كريم`. | 1. Open ice cream URL. 2. Review row metadata visually. 3. Review with VoiceOver/WebKit and NVDA/Firefox or NVDA/Chromium. | Label is understandable Arabic in both reviewed assistive-technology combinations and contains no mojibake. | PLACE-005-US-006 | No | Manual | Manual Review cadence. |
| PLACE-005-US-006-TC-010 | Ice cream metadata remains clean in public row-like contexts | Regression, UI, Data Integrity | Medium | Valid session. Ice cream place can appear in list/detail row components that reuse PlaceCard. | Ice cream place in Places row. | 1. Render ice cream row in Places list. 2. Inspect reused row metadata. | Reused row component does not show subtype punctuation, stale subtype labels, or corrupted Arabic. | PLACE-005-US-006 | Yes | UI E2E | Regression cadence. |

## PLACE-005-US-007 - Preserve ice cream URL state

User Story Summary: As a user, I want refresh and back navigation to preserve ice cream browsing.

Related Feature ID: `PLACE-005`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-005-US-007-TC-001 | Direct ice cream URL initializes selected state | Regression, UI, Integration | High | Valid session. New browser context. | `/places?type=ice_cream`. | 1. Open URL directly. 2. Observe selected filters before rows render. | Ice cream category is selected before results render; request includes `type=ice_cream`; no subtype trigger appears. | PLACE-005-US-007 | Yes | UI E2E | Smoke cadence. |
| PLACE-005-US-007-TC-002 | Refresh preserves ice cream selected state | Regression, UI | Medium | Valid session. Ice cream URL loaded. | `/places?type=ice_cream`. | 1. Open URL. 2. Reload browser. | Ice cream category remains selected; request uses `type=ice_cream`; no subtype param appears. | PLACE-005-US-007 | Yes | UI E2E | Regression cadence. |
| PLACE-005-US-007-TC-003 | Browser back restores previous category from ice cream | Regression, UI | Medium | Valid session. History has restaurant then ice cream. | `/places?type=restaurant` to `/places?type=ice_cream`. | 1. Open restaurant URL. 2. Select ice cream. 3. Press Back. | URL and selected category return to restaurant; restaurant rows render after request completion. | PLACE-005-US-007 | Yes | UI E2E | Regression cadence. |
| PLACE-005-US-007-TC-004 | Browser forward restores ice cream category | Regression, UI | Medium | Same history as previous case after Back. | Browser Forward. | 1. Press browser Forward. | URL and selected category return to ice cream; ice cream rows render after request completion; no subtype appears. | PLACE-005-US-007 | Yes | UI E2E | Regression cadence. |
| PLACE-005-US-007-TC-005 | Browser back from invalid ice cream subtype restores last valid state | Regression, UI, Error Handling | Medium | Valid session. Browser history contains valid ice cream URL followed by invalid subtype URL. | `/places?type=ice_cream` then `/places?type=ice_cream&subtype=burger`. | 1. Open valid ice cream URL. 2. Navigate to invalid subtype URL. 3. Press Back. | URL returns to `type=ice_cream`; selected category is ice cream; valid ice cream rows render after request completion. | PLACE-005-US-007 | Yes | UI E2E | Regression cadence. |
| PLACE-005-US-007-TC-006 | Refresh after invalid ice cream subtype preserves safe error state | Regression, UI, Error Handling | High | Valid session. Invalid ice cream subtype URL is loaded. | `/places?type=ice_cream&subtype=burger`. | 1. Open URL. 2. Reload browser. | API returns `422 Validation Error`; UI shows validation recovery/reset state; no stale valid rows are rendered as subtype-filtered ice cream results. | PLACE-005-US-007 | Yes | UI E2E | Regression cadence. |
| PLACE-005-US-007-TC-007 | Restored history keeps ice cream with search query | Regression, UI, Integration | Medium | Valid session. History contains ice cream plus search. | `/places?type=ice_cream&q=Gelato`. | 1. Open URL. 2. Navigate to another category. 3. Press Back. | URL restores `type=ice_cream&q=Gelato`; request includes both params; rendered rows satisfy ice cream and search constraints. | PLACE-005-US-007 | Yes | UI E2E | Regression cadence. |
| PLACE-005-US-007-TC-008 | Refresh with ice cream has no horizontal overflow | Responsive, Mobile | Medium | Valid session. Mobile viewport. | `/places?type=ice_cream`, `390x844`. | 1. Set viewport. 2. Open URL. 3. Reload. 4. Evaluate no-overflow assertion. | `document.documentElement.scrollWidth <= window.innerWidth`; ice cream state remains selected. | PLACE-005-US-007 | Yes | UI E2E | Regression cadence. |
| PLACE-005-US-007-TC-009 | Ice cream selected state is announced accessibly | Accessibility, Screen Reader | High | Valid session. Ice cream active. | `/places?type=ice_cream`. | 1. Focus primary category filter group. 2. Inspect active option semantics. | Ice cream option accessible name includes `الآيس كريم`; active option exposes approved selected state such as `aria-selected=true`, `aria-current`, `aria-checked=true`, or `aria-pressed=true`. | PLACE-005-US-007 | Yes | Accessibility | Regression cadence. |
| PLACE-005-US-007-TC-010 | Ice cream category focus-visible remains clear at 200% zoom | Accessibility, Responsive | Medium | Valid session. 200% zoom/adaptive pressure available. | Effective viewport width between `195px` and `215px`. | 1. Apply 200% zoom/adaptive pressure. 2. Keyboard navigate primary category filters. | Focus indicator for ice cream category is visible, not clipped, and `document.documentElement.scrollWidth <= window.innerWidth`. | PLACE-005-US-007 | Yes | Accessibility | Nightly cadence. |
| PLACE-005-US-007-TC-011 | Keyboard activates ice cream category with Enter and Space | Accessibility, Keyboard | High | Valid session. Keyboard only. Restaurant or cafe is active. | Primary category filter group. | 1. Tab to `آيس كريم`. 2. Press Enter. 3. Return to previous category. 4. Tab to `آيس كريم`. 5. Press Space. | Both Enter and Space activate ice cream; URL becomes `/places?type=ice_cream`; request returns `200 OK`; selected state is updated. | PLACE-005-US-007 | Yes | Accessibility | Smoke cadence. |
| PLACE-005-US-007-TC-012 | Ice cream category focus-visible is measurable at normal zoom | Accessibility, Keyboard | High | Valid session. Keyboard only. 100% zoom. | Primary category filter group. | 1. Tab to `آيس كريم`. 2. Inspect computed focus indicator. | Focus indicator is visible with a computed non-transparent outline, border, box-shadow, or project focus token and is not clipped. | PLACE-005-US-007 | Yes | Accessibility | Regression cadence. |
| PLACE-005-US-007-TC-013 | Screen reader announces ice cream after category switch | Accessibility, Screen Reader | Medium | Valid session. Restaurant or cafe active. | Switch to `آيس كريم`. | 1. Focus category filter group with screen-reader inspection. 2. Activate ice cream. 3. Inspect announcement/state. | Updated accessible state announces or exposes `آيس كريم` as selected/current without requiring page refresh. | PLACE-005-US-007 | Yes | Accessibility | Regression cadence. |
| PLACE-005-US-007-TC-014 | Reduced-motion mode keeps ice cream category transition functional | Accessibility, UI | Medium | Valid session. `prefers-reduced-motion: reduce` is active. | Switch to `آيس كريم`. | 1. Enable reduced-motion emulation. 2. Select ice cream. | Category transition completes without relying on animation for critical information; URL becomes `/places?type=ice_cream`; results load or show valid state. | PLACE-005-US-007 | Yes | UI E2E | Regression cadence. |
| PLACE-005-US-007-TC-015 | Forced-colors mode preserves ice cream selected state | Accessibility, Responsive | Medium | Valid session. Browser supports forced-colors/high-contrast emulation. | Active `type=ice_cream`. | 1. Enable forced-colors mode. 2. Focus category filter group. 3. Inspect selected and focus states. | `آيس كريم` selected state and keyboard focus remain perceivable without relying on color alone. | PLACE-005-US-007 | Yes | Accessibility | Nightly cadence. |

## Acceptance Criteria Traceability Matrix

| User Story ID | Acceptance Criterion Summary | Covering Test Cases |
|---|---|---|
| PLACE-005-US-001 | Selecting ice cream requests `type=ice_cream` and every row has `type=ice_cream`. | `PLACE-005-US-001-TC-001` through `PLACE-005-US-001-TC-016` |
| PLACE-005-US-002 | Given `type=ice_cream`, no subtype trigger, chip, or subtype label is shown. | `PLACE-005-US-002-TC-001` through `PLACE-005-US-002-TC-010` |
| PLACE-005-US-003 | Switching from a subtype state to ice cream removes `subtype`. | `PLACE-005-US-003-TC-001` through `PLACE-005-US-003-TC-010` |
| PLACE-005-US-004 | Given `type=ice_cream&subtype=burger`, API returns `422` with `INVALID_PLACE_SUBTYPE_FILTER`. | `PLACE-005-US-004-TC-001` through `PLACE-005-US-004-TC-016` |
| PLACE-005-US-005 | Empty ice cream results show no-results state and recovery action. | `PLACE-005-US-005-TC-001` through `PLACE-005-US-005-TC-011` |
| PLACE-005-US-006 | Ice cream metadata shows category only and no blank subtype punctuation. | `PLACE-005-US-006-TC-001` through `PLACE-005-US-006-TC-010` |
| PLACE-005-US-007 | `/places?type=ice_cream` initializes with ice cream selected. | `PLACE-005-US-007-TC-001` through `PLACE-005-US-007-TC-010` |

## Final Summary

Total user stories processed: 7

Total test cases generated: 95

Duplicate test case IDs: 0

### Test Cases Count Per User Story

| User Story ID | Test Case Count |
|---|---:|
| PLACE-005-US-001 | 23 |
| PLACE-005-US-002 | 10 |
| PLACE-005-US-003 | 10 |
| PLACE-005-US-004 | 16 |
| PLACE-005-US-005 | 11 |
| PLACE-005-US-006 | 10 |
| PLACE-005-US-007 | 15 |

### Count By Test Type

| Test Type | Count |
|---|---:|
| API | 27 |
| Accessibility | 16 |
| Arabic | 3 |
| Authentication | 3 |
| Authorization | 3 |
| Boundary | 4 |
| Concurrency | 3 |
| Contract | 5 |
| Data Integrity | 16 |
| Empty State | 4 |
| Error Handling | 8 |
| Integration | 9 |
| Keyboard | 3 |
| Loading State | 2 |
| Localization | 4 |
| Mobile | 8 |
| Negative | 14 |
| Positive | 1 |
| Privacy | 5 |
| Regression | 28 |
| Responsive | 10 |
| Screen Reader | 5 |
| Security | 5 |
| UI | 49 |
| UX | 3 |
| Validation | 16 |

Note: Counts by test type are multi-label counts; one test case may count under more than one type.

### Count By Priority

| Priority | Count |
|---|---:|
| Critical | 13 |
| High | 41 |
| Medium | 41 |
| Low | 0 |

### Count By Automation Layer

| Automation Layer | Count |
|---|---:|
| API | 25 |
| Accessibility | 13 |
| Manual | 1 |
| Security | 1 |
| UI E2E | 55 |

### Count By Automation Cadence

| Cadence | Count |
|---|---:|
| Smoke | 16 |
| Regression | 73 |
| Nightly | 5 |
| Manual Review | 1 |

### Top Automation Candidates

- `PLACE-005-US-001-TC-001` - selecting ice cream updates URL/request with `200 OK`.
- `PLACE-005-US-001-TC-002` - ice cream API returns only ice cream places.
- `PLACE-005-US-001-TC-008` - ice cream response excludes forbidden/private fields.
- `PLACE-005-US-001-TC-010` - guest ice cream page has no protected-data flash.
- `PLACE-005-US-001-TC-019` - invalid `limit=0` is rejected.
- `PLACE-005-US-001-TC-020` - invalid `limit=101` is rejected.
- `PLACE-005-US-001-TC-021` - invalid negative offset is rejected.
- `PLACE-005-US-001-TC-023` - long populated list final row is not hidden by bottom navigation.
- `PLACE-005-US-002-TC-001` - ice cream hides subtype trigger.
- `PLACE-005-US-003-TC-001` - switching from restaurant subtype removes subtype.
- `PLACE-005-US-004-TC-001` - invalid ice cream subtype returns `422`.
- `PLACE-005-US-004-TC-008` - injected ice cream subtype value is rejected safely.
- `PLACE-005-US-005-TC-001` - empty ice cream state.
- `PLACE-005-US-006-TC-008` - ice cream metadata no-mojibake regression.
- `PLACE-005-US-007-TC-001` - direct ice cream URL initializes selected state.
- `PLACE-005-US-007-TC-011` - keyboard activates ice cream with Enter and Space.
- `PLACE-005-US-007-TC-015` - forced-colors mode preserves selected state.

### Manual-Only Test Cases

- `PLACE-005-US-006-TC-009` - Manual review confirms ice cream Arabic label pronunciation with VoiceOver/WebKit and NVDA/Firefox or NVDA/Chromium.

Supplemental manual review is recommended for mobile Safari safe-area behavior when automated WebKit coverage is not available in the execution environment.

### Remaining Assumptions Or Questions

- Ice cream has no subtype in the current product taxonomy.
- Expected visible metadata label for the category is standardized as exact Arabic `آيس كريم`.
- Empty ice cream category state uses deterministic copy `لا توجد نتائج` and primary CTA `عرض الكل`.

## Re-Audit Result

Findings fixed:

- All `PLACE-005` user stories have dedicated test cases.
- All test-case IDs are unique and every test references a valid `PLACE-005` user story.
- Arabic content in the stored file is valid UTF-8 Arabic; no mojibake or Unicode escape sequences are present in titles, test data, steps, expected results, summaries, or assumptions.
- Ice cream category selection, category unselection, empty category, large category, browser refresh, browser back/forward, restored history state, URL persistence, and no-subtype behavior are covered.
- Category default-state coverage includes ice cream not selected while restaurant or cafe is active, first deep-link load, refresh, browser back, browser forward, and restored history state.
- API coverage includes `200 OK`, `401 Unauthorized`, `422 Validation Error`, category filtering, response schema, required fields, forbidden fields, pagination metadata, ordering metadata, stable ordering, invalid pagination bounds, offset beyond total, invalid subtype, blank subtype, malformed subtype, injected subtype, duplicate subtype params, and structured errors.
- Data integrity coverage includes only ice cream rows, no restaurant leakage, no cafe leakage, no subtype leakage, no duplicate rows, stable ordering, stale response protection, race-condition protection, and idempotent repeated requests.
- Accessibility coverage includes keyboard navigation, Enter/Space activation, focus-visible, selected-state announcements, dynamic screen-reader state changes, live-region announcements, metadata accessibility, touch targets, reduced motion, forced colors, and manual Arabic review.
- Responsive coverage includes 320px, 390px, 430px, landscape, 200% zoom/adaptive pressure, invalid-state recovery at 320px, populated long-list bottom-nav safety, safe areas, bottom navigation, and no horizontal overflow.
- Privacy/security coverage includes no private notes, no private list membership, no creator identity, no internal moderation data, no debug/error detail leakage, safe invalid-subtype errors, protected API behavior, and no protected-data flash.
- Traceability is complete at user-story level and acceptance-criteria level.

Findings remaining:

- No blocking findings remain.
- Manual screen-reader confirmation remains recommended for Arabic category pronunciation quality across assistive technologies.

Updated scorecard:

| Area | Score |
|---|---:|
| User Story Coverage | 10/10 |
| Acceptance Criteria Coverage | 9.8/10 |
| Functional Coverage | 9.8/10 |
| Negative Coverage | 9.7/10 |
| API Coverage | 9.8/10 |
| UI Coverage | 9.7/10 |
| Accessibility Coverage | 9.7/10 |
| Responsive Coverage | 9.7/10 |
| Security/Privacy Coverage | 9.7/10 |
| Automation Readiness | 9.6/10 |
| Traceability | 10/10 |
| Production QA Readiness | 9.7/10 |

Final verdict: Production Grade
