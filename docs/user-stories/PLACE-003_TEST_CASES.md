# PLACE-003 Test Cases

Feature: `PLACE-003 - Filter restaurant subtype`

Source: `docs/user-stories/PLACES_USER_STORIES.md`

Scope: All user stories under `PLACE-003`.

## QA Execution Standards

- Arabic test data must remain valid UTF-8 Arabic, for example `الكل`, `برجر`, `إيطالي`, `أمريكي`, `ستيك`, `مشويات`, `شاورما`, `سعودي`, `خليجي`, `هندي`, `آسيوي`, `بحري`, `فطور`, `صحي`, `أخرى`, and `لا توجد نتائج`.
- Restaurant subtype values are exactly `burger`, `italian`, `american`, `steak`, `grill`, `shawarma`, `saudi`, `gulf`, `indian`, `asian`, `seafood`, `breakfast`, `healthy`, and `other`.
- Restaurant subtype filtering is valid only with `type=restaurant`.
- `subtype` without `type` must return `422` with code `PLACE_TYPE_REQUIRED_FOR_SUBTYPE_FILTER`.
- Invalid, blank, malformed, removed, duplicate, or incompatible restaurant subtype values must return `422` with code `INVALID_PLACE_SUBTYPE_FILTER`, unless the request is missing `type`, which must return `PLACE_TYPE_REQUIRED_FOR_SUBTYPE_FILTER`.
- Successful `GET /api/v1/places?type=restaurant&subtype=<value>` responses must follow `{ data, meta }`; each row must include only the approved place summary fields and `meta` must include `limit`, `offset`, `total`, and `sort`.
- Valid filtered responses must not leak rows from other primary types or other restaurant subtypes.
- Places list privacy baseline applies to subtype-filtered results: no private notes, private list membership, creator identity, tokens, stack traces, SQL, or internal moderation fields in success or error responses.
- Responsive certification points for this feature are `320x568`, `390x844`, `430x932`, landscape `844x390`, and 200% zoom/adaptive pressure.
- Responsive UI tests must assert `document.documentElement.scrollWidth <= window.innerWidth`.
- Minimum interactive touch target for subtype trigger, subtype options, clear action, and retry controls is `44x44` CSS pixels.
- Subtype sheet/popover accessibility baseline: accessible name, keyboard open/close, selected-state announcement, focus containment while open, Escape/backdrop dismissal where supported, and focus restoration to the trigger.
- Automation cadence values used in Notes: Smoke, Regression, Nightly, and Manual Review.

## PLACE-003-US-001 - Open restaurant subtype filter

User Story Summary: As a user, I want to choose a restaurant subtype so that I can narrow restaurant results.

Related Feature ID: `PLACE-003`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-003-US-001-TC-001 | Restaurant subtype trigger appears only for restaurant type | UI, Positive, Regression | High | Valid session. Places page loaded. | `/places?type=restaurant`. | 1. Open URL. 2. Inspect filter area. | A compact restaurant subtype trigger is visible and reachable. | PLACE-003-US-001 | Yes | UI E2E | Smoke cadence. |
| PLACE-003-US-001-TC-002 | Opening subtype control shows all approved options | UI, Data Integrity | Critical | Valid session. `type=restaurant` active. | Labels: `الكل`, `برجر`, `إيطالي`, `أمريكي`, `ستيك`, `مشويات`, `شاورما`, `سعودي`, `خليجي`, `هندي`, `آسيوي`, `بحري`, `فطور`, `صحي`, `أخرى`. | 1. Open `/places?type=restaurant`. 2. Activate subtype trigger. 3. Collect visible option labels. | All approved options are present exactly once; no cafe-only subtype such as `قهوة` or `شاهي` appears. | PLACE-003-US-001 | Yes | UI E2E | Smoke cadence. |
| PLACE-003-US-001-TC-003 | Subtype options use approved taxonomy order | UI, Regression | Medium | Valid session. Subtype control open. | Expected order: `الكل`, `برجر`, `إيطالي`, `أمريكي`, `ستيك`, `مشويات`, `شاورما`, `سعودي`, `خليجي`, `هندي`, `آسيوي`, `بحري`, `فطور`, `صحي`, `أخرى`. | 1. Open subtype control. 2. Read option order. | Options appear in the exact approved source order. | PLACE-003-US-001 | Yes | UI E2E | Regression cadence. |
| PLACE-003-US-001-TC-004 | Opening subtype control does not create horizontal overflow | Responsive, Mobile | High | Valid session. Mobile viewport. | `320x568`, `type=restaurant`. | 1. Set viewport. 2. Open subtype control. 3. Evaluate no-overflow assertion. | `document.documentElement.scrollWidth <= window.innerWidth`; all options remain reachable through sheet/popover scrolling. | PLACE-003-US-001 | Yes | UI E2E | Regression cadence. |
| PLACE-003-US-001-TC-005 | Subtype trigger opens by keyboard | Accessibility, Keyboard | High | Valid session. Keyboard only. | `type=restaurant`. | 1. Tab to subtype trigger. 2. Press Enter or Space. | Subtype sheet/popover opens; focus moves to the option list or first meaningful control. | PLACE-003-US-001 | Yes | Accessibility | Smoke cadence. |
| PLACE-003-US-001-TC-006 | Subtype sheet closes with Escape and restores focus | Accessibility, Keyboard, Regression | High | Valid session. Subtype sheet/popover open. | Escape key. | 1. Open subtype control by keyboard. 2. Press Escape. | Sheet/popover closes; focus returns to subtype trigger; page scroll position is not lost. | PLACE-003-US-001 | Yes | Accessibility | Regression cadence. |
| PLACE-003-US-001-TC-007 | Subtype trigger is hidden for cafe type | Negative, UI, Regression | High | Valid session. Cafe type active. | `/places?type=cafe`. | 1. Open URL. 2. Inspect filter area. | Restaurant subtype trigger/options are not shown while `type=cafe` is active. | PLACE-003-US-001 | Yes | UI E2E | Regression cadence. |
| PLACE-003-US-001-TC-008 | Subtype trigger is hidden for ice cream type | Negative, UI, Regression | High | Valid session. Ice cream type active. | `/places?type=ice_cream`. | 1. Open URL. 2. Inspect filter area. | Restaurant subtype trigger/options are not shown while `type=ice_cream` is active. | PLACE-003-US-001 | Yes | UI E2E | Regression cadence. |
| PLACE-003-US-001-TC-009 | Subtype options meet touch target size | Accessibility, Mobile | High | Valid session. Subtype options visible. | `320x568`, option list open. | 1. Measure each visible option. | Each option has at least `44x44` CSS pixel hit target or equivalent accessible hit area. | PLACE-003-US-001 | Yes | Accessibility | Regression cadence. |
| PLACE-003-US-001-TC-010 | Manual review confirms Arabic labels are readable | Accessibility, Arabic, Localization | Medium | Valid session. Real device or visual review available. | All Arabic subtype labels. | 1. Open subtype control. 2. Review Arabic labels visually and with screen reader where practical. | Labels are correct Arabic, understandable, and contain no mojibake or Unicode escape sequences. | PLACE-003-US-001 | No | Manual | Manual Review cadence. |

## PLACE-003-US-002 - Apply restaurant subtype

User Story Summary: As a user, I want to filter by restaurant subtype so that results are relevant.

Related Feature ID: `PLACE-003`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-003-US-002-TC-001 | Applying burger subtype updates URL and request | Positive, UI, API, Integration | Critical | Valid session. `type=restaurant` active. | Select `برجر` / `subtype=burger`. | 1. Open `/places?type=restaurant`. 2. Open subtype control. 3. Select `برجر`. 4. Inspect URL/request. | URL contains `type=restaurant&subtype=burger`; request includes both params. | PLACE-003-US-002 | Yes | UI E2E | Smoke cadence. |
| PLACE-003-US-002-TC-002 | Burger API returns only burger restaurants | API, Data Integrity | Critical | Authenticated request. Mixed restaurant subtypes exist. | `GET /api/v1/places?type=restaurant&subtype=burger`. | 1. Send request. 2. Inspect every row. | Status `200`; every row has `type=restaurant` and `subtype=burger`; no cross-subtype or non-restaurant rows appear. | PLACE-003-US-002 | Yes | API | Smoke cadence. |
| PLACE-003-US-002-TC-003 | Each approved subtype filters correctly via API | API, Data Integrity, Regression | Critical | Authenticated request. Fixture includes at least one row per supported subtype. | Matrix: `burger`, `italian`, `american`, `steak`, `grill`, `shawarma`, `saudi`, `gulf`, `indian`, `asian`, `seafood`, `breakfast`, `healthy`, `other`. | 1. For each subtype, request `GET /api/v1/places?type=restaurant&subtype=<value>`. 2. Inspect rows. | Each response is `200`; every row has `type=restaurant` and the requested `subtype`; no duplicate IDs within the page. | PLACE-003-US-002 | Yes | API | Regression cadence. Data-driven case. |
| PLACE-003-US-002-TC-004 | Each approved subtype can be selected in UI | UI, Regression, Arabic | High | Valid session. `type=restaurant` active. | Arabic/value matrix for all approved subtypes. | 1. For each subtype label, open control and select it. 2. Inspect URL/request. | Each label maps to its expected `subtype` query value and triggers a filtered request. | PLACE-003-US-002 | Yes | UI E2E | Nightly cadence. Data-driven case. |
| PLACE-003-US-002-TC-005 | Selected subtype is visibly indicated | UX, UI | High | Valid session. Burger selected. | `subtype=burger`. | 1. Select `برجر`. 2. Inspect trigger/control. | Trigger or selected option visibly indicates `برجر`; active state is not color-only. | PLACE-003-US-002 | Yes | UI E2E | Regression cadence. |
| PLACE-003-US-002-TC-006 | Subtype filtering preserves search query | Integration, Regression | Medium | Valid session. Search query active. | `/places?type=restaurant&q=Malfa`, select `italian`. | 1. Open URL. 2. Select `إيطالي`. 3. Inspect URL/request. | URL/request include `type=restaurant`, `subtype=italian`, and `q=Malfa`. | PLACE-003-US-002 | Yes | UI E2E | Regression cadence. |
| PLACE-003-US-002-TC-007 | Subtype pagination metadata is filtered | API, Contract | High | Authenticated request. More than one burger page exists. | `type=restaurant&subtype=burger&limit=10&offset=10`. | 1. Request page 1 and page 2. 2. Inspect metadata. | `meta.limit=10`, `meta.offset=10`, `meta.total` reflects burger restaurants only, and rows remain burger restaurants. | PLACE-003-US-002 | Yes | API | Regression cadence. |
| PLACE-003-US-002-TC-008 | Subtype response includes sort metadata | API, Contract | Medium | Authenticated request. | `type=restaurant&subtype=burger`. | 1. Send request. 2. Inspect `meta.sort`. | Status `200`; `meta.sort` equals `rating_desc`, matching the Places default sort contract. | PLACE-003-US-002 | Yes | API | Regression cadence. |
| PLACE-003-US-002-TC-009 | Subtype filtered response excludes private fields | Privacy, Security, API | Critical | Authenticated request. Internal private data exists. | `type=restaurant&subtype=burger`. | 1. Send request. 2. Recursively scan JSON. | Response contains no private notes, private list membership, creator identity, internal moderation fields, tokens, SQL, or stack traces. | PLACE-003-US-002 | Yes | API | Smoke cadence. |
| PLACE-003-US-002-TC-010 | Guest subtype filter returns 401 | Authentication, Authorization, Security, API | Critical | No valid session. | `GET /api/v1/places?type=restaurant&subtype=burger`. | 1. Clear auth. 2. Send request. | Status `401 Unauthorized`; no place rows or metadata totals are returned. | PLACE-003-US-002 | Yes | API | Smoke cadence. |
| PLACE-003-US-002-TC-011 | Subtype switch shows loading without stale final rows | Loading State, UI, Regression | High | Valid session. Burger rows visible. Italian request delayed. | Switch `burger` to `italian`. | 1. Select `إيطالي`. 2. Observe pending state. | Loading state is visible; burger rows are not presented as final Italian results while the Italian request is pending. | PLACE-003-US-002 | Yes | UI E2E | Regression cadence. |
| PLACE-003-US-002-TC-012 | Delayed old subtype response cannot overwrite latest subtype | Concurrency, Data Integrity, UI | High | Valid session. Burger request delayed, Italian selected last. | Delayed burger response, fast Italian response. | 1. Trigger burger request. 2. Quickly select Italian. 3. Return Italian response first, then burger response. | Final URL, selected subtype, and rows remain Italian; delayed burger response is ignored for current state. | PLACE-003-US-002 | Yes | UI E2E | Nightly cadence. |
| PLACE-003-US-002-TC-013 | Subtype response row schema is complete | API, Contract | High | Authenticated request. At least one burger restaurant exists. | `GET /api/v1/places?type=restaurant&subtype=burger&limit=1&offset=0`. | 1. Send request. 2. Inspect the first row in `data`. | Status `200`; row includes `id`, `name`, `type`, `subtype`, `averageRating`, `ratingCount`, `createdAt`, and `updatedAt`; `type=restaurant`; `subtype=burger`. | PLACE-003-US-002 | Yes | API | Regression cadence. |
| PLACE-003-US-002-TC-014 | Subtype response excludes forbidden row fields | Privacy, Security, API, Contract | Critical | Authenticated request. Internal/private fields exist in database fixtures. | `GET /api/v1/places?type=restaurant&subtype=burger`. | 1. Send request. 2. Recursively inspect `data` and `meta`. | Response excludes `notes`, `privateNotes`, `listMembership`, `creatorId`, `creatorEmail`, `moderationState`, tokens, cookies, SQL, and stack traces. | PLACE-003-US-002 | Yes | API | Smoke cadence. |
| PLACE-003-US-002-TC-015 | Paginated subtype pages have no duplicate IDs and stable ordering | API, Data Integrity, Regression | High | Authenticated request. At least 25 burger restaurants exist. | `limit=10`, offsets `0`, `10`, `20`. | 1. Request three consecutive burger pages. 2. Concatenate returned IDs. 3. Compare row ordering against `rating_desc`. | Status `200` for each page; no duplicate `id` values appear across pages; combined rows preserve `averageRating DESC NULLS LAST`, `ratingCount DESC`, normalized name ASC. | PLACE-003-US-002 | Yes | API | Regression cadence. |
| PLACE-003-US-002-TC-016 | Offset beyond subtype total returns empty page with valid metadata | API, Boundary, Contract | Medium | Authenticated request. Burger total is known. | `GET /api/v1/places?type=restaurant&subtype=burger&limit=10&offset=<total+10>`. | 1. Send request. 2. Inspect envelope. | Status `200`; `data=[]`; `meta.total` remains the burger-only total; `meta.limit=10`; `meta.offset` equals requested offset; no error is returned. | PLACE-003-US-002 | Yes | API | Regression cadence. |
| PLACE-003-US-002-TC-017 | Repeated identical subtype requests are idempotent | API, Regression, Data Integrity | Medium | Authenticated request. Stable fixture data. | Same `GET /api/v1/places?type=restaurant&subtype=burger&limit=20&offset=0` repeated three times. | 1. Send the same request three times. 2. Compare status, IDs, and metadata. | All responses return `200`; row IDs, `meta.total`, and `meta.sort` are identical while fixture data is unchanged. | PLACE-003-US-002 | Yes | API | Regression cadence. |
| PLACE-003-US-002-TC-018 | Active subtype load failure preserves URL and supports retry | Error Handling, UI, Regression | High | Valid session. `type=restaurant&subtype=burger` active. Next request fails with `500`. | Failed `GET /api/v1/places?type=restaurant&subtype=burger`. | 1. Open burger subtype URL. 2. Force API `500`. 3. Activate retry. | Error state is shown with retry; URL remains `type=restaurant&subtype=burger`; retry sends the same request and renders burger rows on success. | PLACE-003-US-002 | Yes | UI E2E | Regression cadence. |

## PLACE-003-US-003 - Clear restaurant subtype

User Story Summary: As a user, I want to return to all restaurants so that I can broaden results.

Related Feature ID: `PLACE-003`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-003-US-003-TC-001 | Selecting all clears subtype from URL | Positive, UI, Integration | High | Valid session. Burger subtype active. | `/places?type=restaurant&subtype=burger`. | 1. Open URL. 2. Open subtype control. 3. Select `الكل`. | URL contains `type=restaurant` and no `subtype`; request omits `subtype`. | PLACE-003-US-003 | Yes | UI E2E | Smoke cadence. |
| PLACE-003-US-003-TC-002 | Clear subtype makes all restaurant subtypes eligible | API, Data Integrity | High | Authenticated request. Multiple restaurant subtypes exist. | `GET /api/v1/places?type=restaurant`. | 1. Clear subtype. 2. Inspect returned rows. | Rows may include any approved restaurant subtype but no cafe or ice cream rows. | PLACE-003-US-003 | Yes | API | Regression cadence. |
| PLACE-003-US-003-TC-003 | Clear subtype preserves primary restaurant type | UI, Regression | High | Valid session. Any subtype active. | `subtype=italian`. | 1. Select `الكل`. 2. Inspect selected primary type. | Primary type remains restaurant; cafe and ice cream are not selected. | PLACE-003-US-003 | Yes | UI E2E | Regression cadence. |
| PLACE-003-US-003-TC-004 | Clear subtype preserves search query | Integration, Regression | Medium | Valid session. Search query active. | `/places?type=restaurant&subtype=burger&q=Malfa`. | 1. Select `الكل`. 2. Inspect URL/request. | `q=Malfa` remains; `subtype` is removed; request includes `type=restaurant&q=Malfa`. | PLACE-003-US-003 | Yes | UI E2E | Regression cadence. |
| PLACE-003-US-003-TC-005 | Clear subtype updates accessible name | Accessibility, UI | Medium | Valid session. Burger active. | Trigger accessible name. | 1. Select `الكل`. 2. Focus subtype trigger. | Trigger accessible name indicates all restaurant subtypes or no active subtype, not stale `برجر`. | PLACE-003-US-003 | Yes | Accessibility | Regression cadence. |
| PLACE-003-US-003-TC-006 | Clear subtype has 44x44 touch target | Accessibility, Mobile | Medium | Valid session. Subtype sheet open. | Option `الكل`. | 1. Open subtype sheet on mobile. 2. Measure `الكل` option. | Clear option hit target is at least `44x44` CSS pixels. | PLACE-003-US-003 | Yes | Accessibility | Regression cadence. |
| PLACE-003-US-003-TC-007 | Clear subtype does not duplicate rows | Data Integrity, Regression | Medium | Valid session. Subtype rows loaded. | Clear from `burger` to all restaurants. | 1. Clear subtype. 2. Collect visible row IDs. | No duplicate IDs appear after clear; stale subtype-only rows are not appended twice. | PLACE-003-US-003 | Yes | UI E2E | Regression cadence. |
| PLACE-003-US-003-TC-008 | Clear subtype request failure is recoverable | Error Handling, UI | Medium | Valid session. Clear action request fails. | Clear from `seafood`, API returns `500`. | 1. Select `الكل`. 2. Force request failure. 3. Inspect controls. | UI keeps `type=restaurant`, removes pending `subtype`, shows an error with a retry action, and retry requests `GET /api/v1/places?type=restaurant` without disabling the subtype trigger permanently. | PLACE-003-US-003 | Yes | UI E2E | Regression cadence. |
| PLACE-003-US-003-TC-009 | Clearing subtype while previous subtype request is pending ignores stale response | Concurrency, UI, Data Integrity | High | Valid session. Seafood subtype request is delayed. | Delayed `subtype=seafood`, then clear to all restaurants. | 1. Trigger delayed seafood request. 2. Select `الكل` before it completes. 3. Return all-restaurant response first, then seafood response. | Final URL has no `subtype`; selected subtype is `الكل`; final rows are all eligible restaurants; delayed seafood response is ignored. | PLACE-003-US-003 | Yes | UI E2E | Nightly cadence. |

## PLACE-003-US-004 - Preserve subtype on refresh

User Story Summary: As a user, I want subtype state preserved so that refresh keeps my filtered view.

Related Feature ID: `PLACE-003`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-003-US-004-TC-001 | Refresh preserves Italian subtype before results render | Regression, UI, Integration | Medium | Valid session. URL includes Italian subtype. | `/places?type=restaurant&subtype=italian`. | 1. Open URL. 2. Reload browser. 3. Observe selected filters before rows render. | Restaurant and Italian subtype are selected before results render; request includes both params. | PLACE-003-US-004 | Yes | UI E2E | Smoke cadence. |
| PLACE-003-US-004-TC-002 | Direct shared subtype URL initializes correct state | Regression, UI | Medium | Valid session. New browser context. | `/places?type=restaurant&subtype=burger`. | 1. Open URL directly. | Restaurant primary type and burger subtype are selected; no other subtype flashes as active. | PLACE-003-US-004 | Yes | UI E2E | Regression cadence. |
| PLACE-003-US-004-TC-003 | Refresh does not flash all-restaurant rows as final filtered results | Regression, UI, Privacy | High | User previously viewed all restaurants. Current URL has subtype. | `/places?type=restaurant&subtype=italian`. | 1. Reload URL. 2. Inspect first render and final rows. | All-restaurant rows do not render as current Italian results during initialization. | PLACE-003-US-004 | Yes | UI E2E | Regression cadence. |
| PLACE-003-US-004-TC-004 | Refresh preserves subtype pagination metadata | API, Contract | Medium | Valid session. Subtype URL with pagination. | `/places?type=restaurant&subtype=italian&limit=10&offset=0`. | 1. Reload URL. 2. Inspect request/response. | Request includes `type=restaurant&subtype=italian`; metadata and rows match Italian restaurants only. | PLACE-003-US-004 | Yes | API | Regression cadence. |
| PLACE-003-US-004-TC-005 | Browser back restores previous subtype | Regression, UI | Medium | Valid session. History has burger then Italian. | `/places?type=restaurant&subtype=burger` to `italian`. | 1. Open burger URL. 2. Select Italian. 3. Press Back. | URL and selected subtype return to burger; burger rows are restored. | PLACE-003-US-004 | Yes | UI E2E | Regression cadence. |
| PLACE-003-US-004-TC-006 | Browser forward restores next subtype | Regression, UI | Medium | Same history as previous case after Back. | Browser Forward. | 1. Press browser Forward. | URL and selected subtype return to Italian; Italian rows are restored. | PLACE-003-US-004 | Yes | UI E2E | Regression cadence. |
| PLACE-003-US-004-TC-007 | Refresh with subtype has no horizontal overflow | Responsive, Mobile | Medium | Valid session. Mobile viewport. | `/places?type=restaurant&subtype=italian`, `390x844`. | 1. Set viewport. 2. Open URL. 3. Reload. 4. Evaluate no-overflow assertion. | `document.documentElement.scrollWidth <= window.innerWidth`; subtype state remains selected. | PLACE-003-US-004 | Yes | UI E2E | Regression cadence. |
| PLACE-003-US-004-TC-008 | Browser back from invalid subtype restores last valid subtype | Regression, UI, Error Handling | Medium | Valid session. Browser history contains valid burger URL followed by invalid subtype URL. | `/places?type=restaurant&subtype=burger` then `/places?type=restaurant&subtype=coffee`. | 1. Open burger URL. 2. Navigate to invalid subtype URL. 3. Press Back. | URL returns to `type=restaurant&subtype=burger`; selected subtype is burger; valid burger rows render after request completion. | PLACE-003-US-004 | Yes | UI E2E | Regression cadence. |
| PLACE-003-US-004-TC-009 | Refresh after invalid subtype preserves safe error state | Regression, UI, Error Handling | High | Valid session. Invalid subtype URL is loaded. | `/places?type=restaurant&subtype=coffee`. | 1. Open URL. 2. Reload browser. | API returns `422`; UI shows validation recovery/reset state; no stale valid rows are rendered as coffee subtype results. | PLACE-003-US-004 | Yes | UI E2E | Regression cadence. |
| PLACE-003-US-004-TC-010 | Restored history keeps subtype with search query | Regression, UI, Integration | Medium | Valid session. History contains subtype plus search. | `/places?type=restaurant&subtype=burger&q=Malfa`. | 1. Open URL. 2. Navigate to another subtype. 3. Press Back. | URL restores `type=restaurant&subtype=burger&q=Malfa`; request includes all three params; rendered rows satisfy restaurant, burger, and search constraints. | PLACE-003-US-004 | Yes | UI E2E | Regression cadence. |

## PLACE-003-US-005 - Reject restaurant filter without type

User Story Summary: As the system, I want subtype filtering tied to primary type so that subtype values are not ambiguous.

Related Feature ID: `PLACE-003`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-003-US-005-TC-001 | API rejects subtype without type | Negative, Validation, API | Critical | Authenticated request. | `GET /api/v1/places?subtype=burger`. | 1. Send request. 2. Inspect response. | Status `422`; error code `PLACE_TYPE_REQUIRED_FOR_SUBTYPE_FILTER`; no place data returned. | PLACE-003-US-005 | Yes | API | Smoke cadence. |
| PLACE-003-US-005-TC-002 | API rejects subtype without type for every restaurant subtype | Negative, Validation, API | High | Authenticated request. | Matrix of all approved restaurant subtype values without `type`. | 1. For each subtype, send `GET /api/v1/places?subtype=<value>`. | Each request returns `422` with code `PLACE_TYPE_REQUIRED_FOR_SUBTYPE_FILTER`. | PLACE-003-US-005 | Yes | API | Regression cadence. Data-driven case. |
| PLACE-003-US-005-TC-003 | Subtype without type cannot bypass authentication | Authentication, Authorization, API | Critical | No valid session. | `GET /api/v1/places?subtype=burger`. | 1. Clear auth. 2. Send request. | Status `401 Unauthorized` or auth failure is enforced before protected data; no catalog rows returned. | PLACE-003-US-005 | Yes | API | Smoke cadence. |
| PLACE-003-US-005-TC-004 | UI direct subtype-only URL shows safe recovery | Error Handling, UI, Regression | High | Valid session. Browser can open arbitrary URL. | `/places?subtype=burger`. | 1. Open URL. 2. Observe request and UI. | Request fails with `422`; UI does not show stale rows as subtype-only results and offers safe recovery/reset. | PLACE-003-US-005 | Yes | UI E2E | Regression cadence. |
| PLACE-003-US-005-TC-005 | Subtype-only error payload excludes private data | Privacy, Security, API | Critical | Authenticated request. Internal private data exists. | `subtype=burger` without type. | 1. Send invalid request. 2. Recursively scan error response. | Error body contains no private notes, private list membership, creator identity, internal moderation fields, SQL, stack traces, tokens, or cookies. | PLACE-003-US-005 | Yes | API | Smoke cadence. |
| PLACE-003-US-005-TC-006 | Subtype-only URL does not render protected data before validation | Security, UI | High | Valid session or stale client cache exists. | `/places?subtype=burger`. | 1. Open URL with stale cached restaurant rows. 2. Observe first render. | UI does not render cached rows as valid subtype-only results before validation resolves. | PLACE-003-US-005 | Yes | UI E2E | Regression cadence. |
| PLACE-003-US-005-TC-007 | Missing type validation preserves structured error schema | API, Contract | Medium | Authenticated request. | `GET /api/v1/places?subtype=burger`. | 1. Send request. 2. Inspect error shape. | Response follows structured error contract and includes machine-readable code `PLACE_TYPE_REQUIRED_FOR_SUBTYPE_FILTER`. | PLACE-003-US-005 | Yes | API | Regression cadence. |

## PLACE-003-US-006 - Reject invalid restaurant subtype

User Story Summary: As the system, I want non-restaurant subtypes rejected for restaurants so that taxonomy stays valid.

Related Feature ID: `PLACE-003`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-003-US-006-TC-001 | API rejects cafe subtype coffee for restaurant | Negative, Validation, API | Critical | Authenticated request. | `GET /api/v1/places?type=restaurant&subtype=coffee`. | 1. Send request. 2. Inspect response. | Status `422`; error code `INVALID_PLACE_SUBTYPE_FILTER`; no place data returned. | PLACE-003-US-006 | Yes | API | Smoke cadence. |
| PLACE-003-US-006-TC-002 | API rejects cafe subtype tea for restaurant | Negative, Validation, API | High | Authenticated request. | `type=restaurant&subtype=tea`. | 1. Send request. | Status `422`; error code `INVALID_PLACE_SUBTYPE_FILTER`; no place data returned. | PLACE-003-US-006 | Yes | API | Regression cadence. |
| PLACE-003-US-006-TC-003 | API rejects unknown restaurant subtype | Negative, Validation, API | High | Authenticated request. | `type=restaurant&subtype=tacos`. | 1. Send request. | Status `422`; error code `INVALID_PLACE_SUBTYPE_FILTER`; no place data returned. | PLACE-003-US-006 | Yes | API | Regression cadence. |
| PLACE-003-US-006-TC-004 | API rejects blank restaurant subtype | Negative, Validation, API | High | Authenticated request. | `type=restaurant&subtype=`. | 1. Send request. | Status `422`; error code `INVALID_PLACE_SUBTYPE_FILTER`; no place data returned. | PLACE-003-US-006 | Yes | API | Regression cadence. |
| PLACE-003-US-006-TC-005 | API rejects repeated subtype params | Negative, Validation, API | Medium | Authenticated request. | `type=restaurant&subtype=burger&subtype=italian`. | 1. Send request. | Status `422`; API does not silently choose an arbitrary subtype; no place data returned. | PLACE-003-US-006 | Yes | API | Regression cadence. |
| PLACE-003-US-006-TC-006 | API rejects injected subtype value safely | Security, Validation, API | Critical | Authenticated request. | `type=restaurant&subtype=burger%27%20OR%201=1`. | 1. Send request. 2. Inspect response. | Status `422`; no SQL, stack trace, private data, or partial data returned. | PLACE-003-US-006 | Yes | Security | Smoke cadence. |
| PLACE-003-US-006-TC-007 | API rejects whitespace-padded subtype | Negative, Validation, API | Medium | Authenticated request. | `type=restaurant&subtype=%20burger%20`. | 1. Send request. | Status `422`; only canonical subtype values are accepted. | PLACE-003-US-006 | Yes | API | Regression cadence. |
| PLACE-003-US-006-TC-008 | API rejects case-mismatched subtype | Negative, Validation, API | Medium | Authenticated request. | `type=restaurant&subtype=Burger`. | 1. Send request. | Status `422`; API does not accept non-canonical case. | PLACE-003-US-006 | Yes | API | Regression cadence. |
| PLACE-003-US-006-TC-009 | Invalid subtype error excludes private data | Privacy, Security, API | Critical | Authenticated request. Internal private data exists. | `type=restaurant&subtype=coffee`. | 1. Send request. 2. Scan error body. | Error contains no private notes, private list membership, creator identity, internal moderation fields, SQL, stack traces, tokens, or cookies. | PLACE-003-US-006 | Yes | API | Smoke cadence. |
| PLACE-003-US-006-TC-010 | UI invalid subtype URL recovers safely | Error Handling, UI | High | Valid session. Browser can open arbitrary URL. | `/places?type=restaurant&subtype=coffee`. | 1. Open URL. 2. Observe UI. | UI shows a validation recovery state with a reset/clear-filter action; stale rows are not rendered as valid coffee restaurant results; reset navigates to `/places?type=restaurant`. | PLACE-003-US-006 | Yes | UI E2E | Regression cadence. |
| PLACE-003-US-006-TC-011 | API rejects removed restaurant subtype value | Negative, Validation, API | High | Authenticated request. `tacos` is treated as a removed/deprecated restaurant subtype fixture value. | `GET /api/v1/places?type=restaurant&subtype=tacos`. | 1. Send request. 2. Inspect response. | Status `422`; error code `INVALID_PLACE_SUBTYPE_FILTER`; no place data returned. | PLACE-003-US-006 | Yes | API | Regression cadence. |
| PLACE-003-US-006-TC-012 | API rejects malformed encoded subtype | Negative, Validation, API | High | Authenticated request. | `GET /api/v1/places?type=restaurant&subtype=%E0%A4%A`. | 1. Send malformed request. 2. Inspect response. | Request is rejected with `422` or a framework-level `400`; no place data, SQL, stack trace, or private data is returned. | PLACE-003-US-006 | Yes | API | Regression cadence. |
| PLACE-003-US-006-TC-013 | API rejects duplicate type params with subtype | Negative, Validation, API | Medium | Authenticated request. | `GET /api/v1/places?type=restaurant&type=cafe&subtype=burger`. | 1. Send request. 2. Inspect response. | Status `422`; API does not silently choose one `type`; no place data returned. | PLACE-003-US-006 | Yes | API | Regression cadence. |
| PLACE-003-US-006-TC-014 | Invalid subtype response keeps structured error schema | API, Contract, Validation | Medium | Authenticated request. | `type=restaurant&subtype=coffee`. | 1. Send request. 2. Inspect error envelope. | Status `422`; response includes a machine-readable error code `INVALID_PLACE_SUBTYPE_FILTER`, a user-safe message, and no `data` array. | PLACE-003-US-006 | Yes | API | Regression cadence. |

## PLACE-003-US-007 - Keep subtype UI compact on mobile

User Story Summary: As a mobile user, I want many restaurant subtypes available without large chip rows.

Related Feature ID: `PLACE-003`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-003-US-007-TC-001 | Mobile shows one compact subtype trigger | Responsive, Mobile, UI | High | Valid session. Mobile viewport. | `320x568`, `type=restaurant`. | 1. Set viewport. 2. Open `/places?type=restaurant`. | Page shows one compact subtype trigger; all subtype chips are not permanently rendered as large rows. | PLACE-003-US-007 | Yes | UI E2E | Smoke cadence. |
| PLACE-003-US-007-TC-002 | Subtype sheet opens on mobile | UI, Mobile, Accessibility | High | Valid session. Mobile viewport. | `390x844`. | 1. Open restaurant page. 2. Activate subtype trigger. | Accessible sheet/popover opens with options and does not cause horizontal overflow. | PLACE-003-US-007 | Yes | UI E2E | Regression cadence. |
| PLACE-003-US-007-TC-003 | Mobile subtype UI has no horizontal overflow at 320px | Responsive, Mobile | High | Valid session. Mobile viewport. | `320x568`, sheet open. | 1. Open subtype sheet. 2. Evaluate no-overflow assertion. | `document.documentElement.scrollWidth <= window.innerWidth`. | PLACE-003-US-007 | Yes | UI E2E | Smoke cadence. |
| PLACE-003-US-007-TC-004 | Mobile subtype UI works at 390px | Responsive, Mobile | Medium | Valid session. | `390x844`. | 1. Open subtype sheet. 2. Select `شاورما`. | Selection succeeds; URL/request include `subtype=shawarma`; no overflow occurs. | PLACE-003-US-007 | Yes | UI E2E | Regression cadence. |
| PLACE-003-US-007-TC-005 | Mobile subtype UI works at 430px | Responsive, Mobile | Medium | Valid session. | `430x932`. | 1. Open subtype sheet. 2. Select `هندي`. | Selection succeeds; no horizontal overflow occurs. | PLACE-003-US-007 | Yes | UI E2E | Regression cadence. |
| PLACE-003-US-007-TC-006 | Subtype UI works at 200% zoom | Accessibility, Responsive | High | Valid session. 200% zoom/adaptive pressure available. | Effective width around 195-215 px. | 1. Apply 200% zoom/adaptive pressure. 2. Open subtype control. 3. Evaluate no-overflow assertion. 4. Measure trigger and visible options. | `document.documentElement.scrollWidth <= window.innerWidth`; trigger and options remain reachable; selected state remains visible; interactive targets remain at least `44x44` CSS pixels. | PLACE-003-US-007 | Yes | UI E2E | Nightly cadence. |
| PLACE-003-US-007-TC-007 | Subtype UI works in landscape | Responsive, Mobile | Medium | Valid session. Landscape viewport. | `844x390`. | 1. Set viewport. 2. Open subtype control. | Sheet/popover fits viewport, options are scrollable/reachable, and no content is clipped behind bottom navigation. | PLACE-003-US-007 | Yes | UI E2E | Regression cadence. |
| PLACE-003-US-007-TC-008 | Safe areas do not obscure subtype sheet | Responsive, Mobile | High | Valid session. WebKit/safe-area emulation available. | Safe-area top/bottom. | 1. Open subtype sheet on mobile. 2. Inspect trigger, sheet, and final option. | Sheet content is not hidden under notch/browser chrome/bottom nav; final option remains reachable. | PLACE-003-US-007 | Yes | UI E2E | Nightly cadence. |
| PLACE-003-US-007-TC-009 | Subtype sheet focus is contained while open | Accessibility, Keyboard | High | Valid session. Subtype sheet open. | Keyboard Tab/Shift+Tab. | 1. Open sheet. 2. Press Tab through controls. | Focus stays inside sheet/popover until it is closed; no background controls are reached. | PLACE-003-US-007 | Yes | Accessibility | Regression cadence. |
| PLACE-003-US-007-TC-010 | Bottom navigation does not cover subtype options or filtered rows | Responsive, Mobile | High | Valid session. Mobile viewport. | `390x844`, long restaurant list. | 1. Open subtype sheet and scroll to final option. 2. Select subtype. 3. Scroll filtered rows to bottom. | Final option and final filtered row remain visible above bottom nav/safe area. | PLACE-003-US-007 | Yes | UI E2E | Regression cadence. |
| PLACE-003-US-007-TC-011 | Reduced-motion mode keeps subtype sheet functional | Accessibility, Responsive | Medium | Valid session. `prefers-reduced-motion: reduce` is active. | `390x844`, restaurant subtype sheet. | 1. Enable reduced-motion emulation. 2. Open subtype sheet. 3. Select `برجر`. | Sheet opens and closes without relying on animation for critical information; selection succeeds; URL includes `subtype=burger`. | PLACE-003-US-007 | Yes | Accessibility | Regression cadence. |
| PLACE-003-US-007-TC-012 | Forced-colors mode preserves selected subtype visibility | Accessibility, Responsive | Medium | Valid session. Forced-colors/high-contrast mode available. | Active `subtype=burger`. | 1. Enable forced-colors where supported. 2. Open subtype sheet. 3. Inspect active option and focus. | Active subtype and keyboard focus remain perceivable without relying on color alone. | PLACE-003-US-007 | Yes | Accessibility | Nightly cadence. |
| PLACE-003-US-007-TC-013 | Subtype sheet remains usable with dynamic viewport changes | Responsive, Mobile | Medium | Valid session. Mobile browser viewport can resize. | `390x844` to shorter viewport while sheet is open. | 1. Open subtype sheet. 2. Reduce viewport height to simulate browser chrome change. 3. Scroll to final option. | Sheet recomputes available height; final option remains reachable; no content is hidden behind bottom navigation or safe-area padding. | PLACE-003-US-007 | Yes | UI E2E | Nightly cadence. |

## PLACE-003-US-008 - Announce current subtype

User Story Summary: As a screen-reader user, I want the active subtype announced so that I know the current filter.

Related Feature ID: `PLACE-003`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-003-US-008-TC-001 | Trigger accessible name includes active burger subtype | Accessibility, Screen Reader | Medium | Valid session. Burger subtype active. | `/places?type=restaurant&subtype=burger`. | 1. Focus subtype trigger. 2. Inspect accessible name. | Accessible name includes current subtype label `برجر` and indicates it is the active restaurant subtype filter. | PLACE-003-US-008 | Yes | Accessibility | Smoke cadence. |
| PLACE-003-US-008-TC-002 | Trigger accessible name updates after subtype change | Accessibility, Regression | Medium | Valid session. Burger active. | Change to `إيطالي`. | 1. Focus trigger. 2. Change subtype to Italian. 3. Focus trigger again. | Accessible name changes from `برجر` to `إيطالي`; stale label is not announced. | PLACE-003-US-008 | Yes | Accessibility | Regression cadence. |
| PLACE-003-US-008-TC-003 | All subtype options expose selected state | Accessibility, Screen Reader | High | Valid session. Subtype sheet open with active subtype. | `subtype=burger`. | 1. Open subtype sheet. 2. Inspect active option semantics. | Active option exposes one approved semantic selected state such as `aria-selected=true`, `aria-current`, `aria-checked=true`, or `aria-pressed=true`; color alone is insufficient. | PLACE-003-US-008 | Yes | Accessibility | Regression cadence. |
| PLACE-003-US-008-TC-004 | Keyboard navigation reaches subtype trigger and options | Accessibility, Keyboard | High | Valid session. Keyboard only. | Restaurant page. | 1. Tab to trigger. 2. Open sheet. 3. Navigate options. | Trigger and all options are keyboard reachable in logical order with visible focus. | PLACE-003-US-008 | Yes | Accessibility | Smoke cadence. |
| PLACE-003-US-008-TC-005 | Subtype loading state is announced | Accessibility, Loading State | Medium | Valid session. Subtype request delayed. | Select `بحري`. | 1. Select subtype. 2. Inspect live region/status. | A live region or `role=status` announces loading; focus remains on the triggering control or selected option; no unexpected focus jump occurs. | PLACE-003-US-008 | Yes | Accessibility | Regression cadence. |
| PLACE-003-US-008-TC-006 | Subtype no-results state is announced | Accessibility, Empty State | Medium | Valid session. Subtype returns zero rows. | `type=restaurant&subtype=seafood`, zero rows. | 1. Open URL. 2. Inspect announcement/accessible tree. | `لا توجد نتائج` is accessible and recovery action is keyboard reachable. | PLACE-003-US-008 | Yes | Accessibility | Regression cadence. |
| PLACE-003-US-008-TC-007 | Manual screen-reader review confirms Arabic subtype labels | Accessibility, Arabic, Localization | Medium | Valid session. Real screen reader available. | All subtype labels. | 1. Navigate trigger and options with screen reader. | Arabic labels are understandable, selected state is announced, and no mojibake or Unicode escapes are spoken. | PLACE-003-US-008 | No | Manual | Manual Review cadence. |
| PLACE-003-US-008-TC-008 | Focus-visible remains clear at 200% zoom | Accessibility, Responsive | Medium | Valid session. 200% zoom/adaptive pressure available. | Subtype trigger and options. | 1. Apply 200% zoom. 2. Keyboard navigate subtype UI. | Focus-visible remains visible and not clipped for trigger/options. | PLACE-003-US-008 | Yes | Accessibility | Nightly cadence. |
| PLACE-003-US-008-TC-009 | Subtype trigger exposes expanded state | Accessibility, Keyboard, Screen Reader | High | Valid session. Restaurant subtype trigger is closed. | Trigger accessible tree. | 1. Focus subtype trigger. 2. Inspect accessibility attributes. 3. Open trigger. 4. Inspect again. | Closed trigger exposes an accessible name and `aria-expanded=false` or platform equivalent; open trigger exposes `aria-expanded=true` and references the sheet/popover when supported. | PLACE-003-US-008 | Yes | Accessibility | Regression cadence. |
| PLACE-003-US-008-TC-010 | Screen-reader announcement changes after clear filter | Accessibility, Screen Reader | Medium | Valid session. Burger subtype active. | Clear to `الكل`. | 1. Focus trigger with burger active. 2. Clear subtype. 3. Focus trigger again. | Announcement changes from burger-specific label to all-subtypes/no-subtype label; stale `برجر` is not announced. | PLACE-003-US-008 | Yes | Accessibility | Regression cadence. |

## PLACE-003-US-009 - Show no-results for subtype

User Story Summary: As a user, I want clear feedback when a subtype has no matches.

Related Feature ID: `PLACE-003`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-003-US-009-TC-001 | Subtype empty state shows no-results copy | Empty State, UI, UX | Medium | Valid session. Seafood subtype has zero rows while other restaurant subtypes exist. | `/places?type=restaurant&subtype=seafood`, `data: []`, `meta.total: 0`. | 1. Open URL or select `بحري`. | UI shows exactly `لا توجد نتائج`, not full catalog-empty copy. | PLACE-003-US-009 | Yes | UI E2E | Smoke cadence. |
| PLACE-003-US-009-TC-002 | Subtype empty state offers clear-filter action | Empty State, UI | Medium | Valid session. Empty subtype state visible. | Active `subtype=seafood`. | 1. Inspect empty state action. | UI provides one clear-filter action that returns to all restaurants. | PLACE-003-US-009 | Yes | UI E2E | Regression cadence. |
| PLACE-003-US-009-TC-003 | Clear-filter action removes subtype only | UI, Integration | Medium | Valid session. Empty subtype state visible. | `/places?type=restaurant&subtype=seafood`. | 1. Activate clear-filter action. 2. Inspect URL/request. | URL retains `type=restaurant`, removes `subtype`, and reloads restaurant results. | PLACE-003-US-009 | Yes | UI E2E | Regression cadence. |
| PLACE-003-US-009-TC-004 | Empty state is not shown while request is loading | Loading State, UI | Medium | Valid session. Subtype request delayed. | `subtype=seafood`. | 1. Select subtype. 2. Observe pending state before response. | Loading state appears first; `لا توجد نتائج` appears only after successful empty response. | PLACE-003-US-009 | Yes | UI E2E | Regression cadence. |
| PLACE-003-US-009-TC-005 | Subtype empty state is accessible | Accessibility, Empty State | Medium | Valid session. Empty subtype state visible. | `لا توجد نتائج`. | 1. Inspect accessibility tree. 2. Navigate to clear-filter action. | Empty-state message is readable by assistive tech; clear-filter action has accessible name and visible focus. | PLACE-003-US-009 | Yes | Accessibility | Regression cadence. |
| PLACE-003-US-009-TC-006 | Subtype empty state has no horizontal overflow | Responsive, Mobile | Medium | Valid session. Mobile viewport. | `320x568`, empty subtype state. | 1. Set viewport. 2. Open empty subtype URL. 3. Evaluate no-overflow assertion. | `document.documentElement.scrollWidth <= window.innerWidth`; empty message and clear action remain visible. | PLACE-003-US-009 | Yes | UI E2E | Regression cadence. |
| PLACE-003-US-009-TC-007 | Empty subtype response preserves privacy | Privacy, Security, API | High | Valid session. Empty subtype result. Internal private data exists for other rows. | `GET /api/v1/places?type=restaurant&subtype=seafood` returns empty. | 1. Request endpoint. 2. Inspect response and UI. | No private notes, private list membership, creator identity, or internal fields are exposed. | PLACE-003-US-009 | Yes | API | Regression cadence. |
| PLACE-003-US-009-TC-008 | Empty subtype clear action failure is recoverable | Error Handling, UI | Medium | Valid session. Empty state visible. Clear action request fails. | Clear action triggers failed restaurant request. | 1. Activate clear-filter. 2. Force next request to fail. 3. Inspect URL and controls. | URL has no `subtype`; UI shows an error with retry; clear/filter controls remain enabled; retry requests `GET /api/v1/places?type=restaurant`. | PLACE-003-US-009 | Yes | UI E2E | Regression cadence. |
| PLACE-003-US-009-TC-009 | Empty subtype retry preserves active subtype after failed subtype load | Error Handling, UI, Regression | Medium | Valid session. `type=restaurant&subtype=seafood` active. First request fails, retry succeeds empty. | Failed then successful seafood request with `data=[]`. | 1. Open seafood subtype URL. 2. Force first request to fail. 3. Activate retry. | URL remains `type=restaurant&subtype=seafood`; retry sends the same subtype request; successful empty response shows `لا توجد نتائج`. | PLACE-003-US-009 | Yes | UI E2E | Regression cadence. |
| PLACE-003-US-009-TC-010 | Empty subtype state remains contained at 430px and landscape | Responsive, Mobile | Medium | Valid session. Empty subtype state available. | `430x932` and `844x390`. | 1. Set each viewport. 2. Open empty subtype URL. 3. Evaluate no-overflow assertion and bottom navigation overlap. | For both viewports, `document.documentElement.scrollWidth <= window.innerWidth`; message and clear action remain visible above bottom navigation/safe area. | PLACE-003-US-009 | Yes | UI E2E | Regression cadence. |

## Final Summary

Total user stories processed: 9

Total test cases generated: 101

Duplicate test case IDs: 0

### Test Cases Count Per User Story

| User Story ID | Test Case Count |
|---|---:|
| PLACE-003-US-001 | 10 |
| PLACE-003-US-002 | 18 |
| PLACE-003-US-003 | 9 |
| PLACE-003-US-004 | 10 |
| PLACE-003-US-005 | 7 |
| PLACE-003-US-006 | 14 |
| PLACE-003-US-007 | 13 |
| PLACE-003-US-008 | 10 |
| PLACE-003-US-009 | 10 |

### Count By Test Type

| Test Type | Count |
|---|---:|
| API | 33 |
| Accessibility | 22 |
| Arabic | 3 |
| Authentication | 2 |
| Authorization | 2 |
| Boundary | 1 |
| Concurrency | 2 |
| Contract | 8 |
| Data Integrity | 9 |
| Empty State | 4 |
| Error Handling | 8 |
| Integration | 7 |
| Keyboard | 5 |
| Loading State | 3 |
| Localization | 2 |
| Mobile | 15 |
| Negative | 14 |
| Positive | 3 |
| Privacy | 6 |
| Regression | 26 |
| Responsive | 16 |
| Screen Reader | 4 |
| Security | 8 |
| UI | 35 |
| UX | 2 |
| Validation | 14 |

Note: Counts by test type are multi-label counts; one test case may count under more than one type.

### Count By Priority

| Priority | Count |
|---|---:|
| Critical | 13 |
| High | 41 |
| Medium | 47 |
| Low | 0 |

### Count By Automation Layer

| Automation Layer | Count |
|---|---:|
| API | 31 |
| Accessibility | 18 |
| Manual | 2 |
| Security | 1 |
| UI E2E | 49 |

### Count By Automation Cadence

| Cadence | Count |
|---|---:|
| Smoke | 21 |
| Regression | 70 |
| Nightly | 8 |
| Manual Review | 2 |

### Top Automation Candidates

- `PLACE-003-US-001-TC-002` - all approved subtype options are present.
- `PLACE-003-US-002-TC-001` - applying burger updates URL/request.
- `PLACE-003-US-002-TC-003` - every approved subtype filters correctly via API.
- `PLACE-003-US-002-TC-013` - subtype response row schema is complete.
- `PLACE-003-US-002-TC-014` - subtype responses exclude forbidden/private fields.
- `PLACE-003-US-002-TC-015` - paginated subtype pages have no duplicate IDs and stable ordering.
- `PLACE-003-US-002-TC-010` - guest subtype filter returns `401`.
- `PLACE-003-US-003-TC-001` - selecting `الكل` clears subtype.
- `PLACE-003-US-005-TC-001` - subtype without type returns `422` with `PLACE_TYPE_REQUIRED_FOR_SUBTYPE_FILTER`.
- `PLACE-003-US-006-TC-001` - invalid cafe subtype returns `422` with `INVALID_PLACE_SUBTYPE_FILTER`.
- `PLACE-003-US-006-TC-006` - injected subtype value is rejected safely.
- `PLACE-003-US-006-TC-011` - removed/deprecated subtype value is rejected.
- `PLACE-003-US-007-TC-003` - mobile subtype sheet has no horizontal overflow at 320px.
- `PLACE-003-US-008-TC-001` - trigger accessible name includes active subtype.
- `PLACE-003-US-008-TC-009` - subtype trigger exposes expanded state.
- `PLACE-003-US-009-TC-001` - empty subtype state.

### Manual-Only Test Cases

- `PLACE-003-US-001-TC-010` - Manual review confirms Arabic labels are readable.
- `PLACE-003-US-008-TC-007` - Manual screen-reader review confirms Arabic subtype labels.

Supplemental manual review is recommended for mobile Safari safe-area behavior if automated WebKit coverage is unavailable.

### Remaining Assumptions Or Questions

- Subtype option order is treated as fixed taxonomy order from `PLACES_USER_STORIES.md`.
- Performance budgets for subtype sheet animation/large option lists are not defined because the subtype list is bounded and small.
- Exact visual presentation of sheet vs popover may vary by viewport, but accessibility, reachability, and no-overflow requirements remain mandatory.

## Re-Audit Result

Findings fixed:

- All `PLACE-003` user stories have dedicated test cases.
- All test-case IDs are unique and every test references a valid `PLACE-003` user story.
- Arabic content in the stored file is valid UTF-8 Arabic; no mojibake or Unicode escape sequences are present in titles, test data, steps, expected results, summaries, or assumptions.
- Final summary counts were recalculated from actual table rows and now match the file contents.
- All supported restaurant subtype values are covered through explicit data-driven API and UI tests.
- Valid subtype selection, clear subtype, refresh, deep-link URLs, browser back/forward, restored history state, subtype reset, mobile compact trigger, accessible sheet/popover, and no-results behavior are covered.
- API coverage includes valid subtype, invalid subtype, missing type, blank subtype, removed subtype, malformed subtype, duplicate subtype params, duplicate type params, injected subtype values, repeated identical requests, pagination under subtype, boundary offset, metadata, response schema, and structured error codes.
- Data integrity coverage includes matching subtype only, no cross-subtype leakage, no duplicate rows within and across pages, stable ordering, stale response protection, race-condition protection, and idempotent repeated requests.
- Accessibility coverage includes keyboard navigation, focus-visible, current subtype announcement, selected-state semantics, expanded state, live-region behavior, focus containment, Escape close, reduced motion, forced-colors visibility, and manual screen-reader review.
- Responsive coverage includes 320px, 390px, 430px, landscape, 200% zoom/adaptive pressure, dynamic viewport changes, safe areas, bottom navigation, and no horizontal overflow.
- Privacy/security coverage includes no private notes, no private list membership, no creator identity, no internal moderation data, safe invalid-subtype errors, and protected API behavior.
- Traceability is complete at user-story level and substantially complete at acceptance-criteria level.

Findings remaining:

- No blocking findings remain.
- Manual screen-reader confirmation remains recommended for Arabic subtype pronunciation quality across assistive technologies.

Updated scorecard:

| Area | Score |
|---|---:|
| User Story Coverage | 10/10 |
| Acceptance Criteria Coverage | 9.8/10 |
| Functional Coverage | 9.8/10 |
| Negative Coverage | 9.7/10 |
| API Coverage | 9.8/10 |
| UI Coverage | 9.7/10 |
| Accessibility Coverage | 9.6/10 |
| Responsive Coverage | 9.7/10 |
| Security/Privacy Coverage | 9.7/10 |
| Automation Readiness | 9.6/10 |
| Traceability | 10/10 |
| Production QA Readiness | 9.7/10 |

Final verdict: Production Grade
