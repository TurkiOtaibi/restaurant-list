# PLACE-002 Test Cases

Feature: `PLACE-002 - Filter restaurant/cafe/ice cream`

Source: `docs/user-stories/PLACES_USER_STORIES.md`

Scope: All user stories under `PLACE-002`.

## QA Execution Standards

- Arabic test data must remain valid UTF-8 Arabic, for example `المطاعم`, `المقاهي`, `الآيس كريم`, and `لا توجد نتائج`.
- Primary type values are exactly `restaurant`, `cafe`, and `ice_cream`.
- Invalid type values must be rejected by `GET /api/v1/places` with `422` structured validation error and no place data.
- Filtered responses must not leak rows from other primary types.
- Places list privacy baseline applies to filtered results: no private notes, private list membership, creator identity, tokens, stack traces, SQL, or internal moderation fields in success or error responses.
- Responsive certification points for this feature are `320x568`, `390x844`, `430x932`, landscape `844x390`, and 200% zoom/adaptive pressure.
- Responsive UI tests must assert `document.documentElement.scrollWidth <= window.innerWidth`.
- Minimum interactive touch target for primary filter options is `44x44` CSS pixels.
- Filter accessibility baseline: each filter option is keyboard reachable, has an accessible name, exposes selected state without relying on color only, and has visible `focus-visible`.
- Automation cadence values used in Notes: Smoke, Regression, Nightly, and Manual Review.

## PLACE-002-US-001 - Filter restaurants

User Story Summary: As a user, I want to filter restaurants so that I see only restaurant places.

Related Feature ID: `PLACE-002`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-002-US-001-TC-001 | Restaurant filter updates URL and request | Positive, UI, API, Integration | Critical | Valid session. Places page loaded. | Type `restaurant`. | 1. Open `/places`. 2. Select `المطاعم`. 3. Inspect URL and network request. | URL contains `type=restaurant`; `GET /api/v1/places` includes `type=restaurant`. | PLACE-002-US-001 | Yes | UI E2E | Smoke cadence. |
| PLACE-002-US-001-TC-002 | Restaurant API returns only restaurants | API, Data Integrity | Critical | Authenticated request. Catalog contains restaurants, cafes, and ice cream. | `GET /api/v1/places?type=restaurant`. | 1. Send request. 2. Inspect every `data` row. | Status `200`; every returned row has `type = restaurant`; no cafe or ice cream rows appear. | PLACE-002-US-001 | Yes | API | Smoke cadence. |
| PLACE-002-US-001-TC-003 | Restaurant UI renders only restaurant rows | UI, Data Integrity | Critical | Valid session. Mixed catalog fixture. | Restaurant `Malfa`, cafe `قهوة`, ice cream `Cone`. | 1. Open `/places`. 2. Select `المطاعم`. 3. Inspect visible rows. | Only restaurant rows are visible; cafe and ice cream fixture rows are absent. | PLACE-002-US-001 | Yes | UI E2E | Regression cadence. |
| PLACE-002-US-001-TC-004 | Restaurant filter keeps compact active indication | UX, UI | High | Valid session. Places page loaded. | `المطاعم` filter. | 1. Select `المطاعم`. 2. Inspect filter control. | Restaurant option is visibly selected; other options are not selected; selected state is not color-only. | PLACE-002-US-001 | Yes | UI E2E | Regression cadence. |
| PLACE-002-US-001-TC-005 | Restaurant filter result preserves pagination envelope | API, Contract | High | Authenticated request. Restaurant count > page size. | `type=restaurant&limit=10&offset=0`. | 1. Send request. 2. Inspect response. | Response is `{ data, meta }`; `meta.limit = 10`, `meta.offset = 0`, `meta.total` reflects restaurant-only total. | PLACE-002-US-001 | Yes | API | Regression cadence. |
| PLACE-002-US-001-TC-006 | Restaurant filtered response excludes private fields | Privacy, Security, API | Critical | Authenticated request. Internal private data exists. | `GET /api/v1/places?type=restaurant`. | 1. Send request. 2. Recursively scan response. | Response contains no private notes, private list membership, creator identity, internal moderation fields, tokens, SQL, or stack traces. | PLACE-002-US-001 | Yes | API | Smoke cadence for privacy. |
| PLACE-002-US-001-TC-007 | Re-selecting restaurant does not duplicate requests unnecessarily | Regression, Performance, UI | Medium | Valid session. Restaurant filter already selected. | `/places?type=restaurant`. | 1. Open filtered URL. 2. Select `المطاعم` again. 3. Monitor network. | UI remains selected; no duplicate rows appear; no more than one idempotent refresh request occurs. | PLACE-002-US-001 | Yes | UI E2E | Regression cadence. |
| PLACE-002-US-001-TC-008 | Restaurant filter supports keyboard selection | Accessibility, Keyboard | High | Valid session. Focus is before filter control. | Keyboard only. | 1. Tab to primary filter. 2. Move to `المطاعم`. 3. Activate with Enter or Space. | Restaurant filter is selected, URL/request update, and focus remains visible. | PLACE-002-US-001 | Yes | Accessibility | Regression cadence. |
| PLACE-002-US-001-TC-009 | Guest restaurant filter returns 401 | Authentication, Authorization, Security, API | Critical | No valid session. | `GET /api/v1/places?type=restaurant`. | 1. Clear auth cookies/tokens. 2. Send request. | Status `401 Unauthorized`; no catalog rows, metadata totals, private fields, or partial place data are returned. | PLACE-002-US-001 | Yes | API | Smoke cadence. |
| PLACE-002-US-001-TC-010 | Restaurant filtered row schema is valid | API, Contract | High | Authenticated request. At least one restaurant exists. | `GET /api/v1/places?type=restaurant&limit=1`. | 1. Send request. 2. Validate first row. | Row includes `id`, `name`, `type`, `subtype`, `averageRating`, and `ratingCount`; `type` equals `restaurant`; forbidden private fields are absent. | PLACE-002-US-001 | Yes | API | Regression cadence. |
| PLACE-002-US-001-TC-011 | Restaurant filtered page 2 preserves type and sort metadata | API, Contract, Data Integrity | High | Authenticated request. More than one restaurant page exists. | `type=restaurant&limit=10&offset=10`. | 1. Request first restaurant page. 2. Request second restaurant page. 3. Compare rows and metadata. | Page 2 rows all have `type=restaurant`; no duplicate IDs across page 1/page 2; `meta.limit=10`, `meta.offset=10`, and `meta.sort` is populated consistently. | PLACE-002-US-001 | Yes | API | Regression cadence. |

## PLACE-002-US-002 - Filter cafes

User Story Summary: As a user, I want to filter cafes so that I see only cafe places.

Related Feature ID: `PLACE-002`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-002-US-002-TC-001 | Cafe filter updates URL and request | Positive, UI, API, Integration | Critical | Valid session. Places page loaded. | Type `cafe`. | 1. Open `/places`. 2. Select `المقاهي`. 3. Inspect URL and network request. | URL contains `type=cafe`; `GET /api/v1/places` includes `type=cafe`. | PLACE-002-US-002 | Yes | UI E2E | Smoke cadence. |
| PLACE-002-US-002-TC-002 | Cafe API returns only cafes | API, Data Integrity | Critical | Authenticated request. Mixed catalog exists. | `GET /api/v1/places?type=cafe`. | 1. Send request. 2. Inspect every row. | Status `200`; every returned row has `type = cafe`; no restaurant or ice cream rows appear. | PLACE-002-US-002 | Yes | API | Smoke cadence. |
| PLACE-002-US-002-TC-003 | Cafe UI renders only cafe rows | UI, Data Integrity | Critical | Valid session. Mixed catalog fixture. | Cafe `قهوة`, restaurant `Malfa`, ice cream `Cone`. | 1. Select `المقاهي`. 2. Inspect visible rows. | Only cafe rows are visible; restaurant and ice cream fixture rows are absent. | PLACE-002-US-002 | Yes | UI E2E | Regression cadence. |
| PLACE-002-US-002-TC-004 | Cafe active state is visible and exclusive | UX, UI | High | Valid session. Places page loaded. | `المقاهي` filter. | 1. Select `المقاهي`. 2. Inspect filter options. | Cafe is selected; restaurant and ice cream are not selected; one primary type is active. | PLACE-002-US-002 | Yes | UI E2E | Regression cadence. |
| PLACE-002-US-002-TC-005 | Cafe pagination metadata uses cafe-only total | API, Contract | High | Authenticated request. Cafe count differs from total catalog count. | `type=cafe&limit=10&offset=0`. | 1. Send request. 2. Inspect `meta.total`. | `meta.total` equals number of cafes matching filter, not total places across all types. | PLACE-002-US-002 | Yes | API | Regression cadence. |
| PLACE-002-US-002-TC-006 | Cafe filtered rows preserve Arabic text | Localization / RTL, UI | High | Valid session. Cafe rows include Arabic names. | Cafe name `قهوة مختصة`. | 1. Select `المقاهي`. 2. Inspect row text. | Arabic name renders correctly with no mojibake, Unicode escapes, or clipping. | PLACE-002-US-002 | Yes | UI E2E | Regression cadence. |
| PLACE-002-US-002-TC-007 | Cafe filter does not expose private data | Privacy, Security, API | Critical | Authenticated request. Private list membership exists internally. | `GET /api/v1/places?type=cafe`. | 1. Send request. 2. Scan JSON. | No private notes, private list membership, creator identity, or internal moderation fields appear. | PLACE-002-US-002 | Yes | API | Smoke cadence. |
| PLACE-002-US-002-TC-008 | Guest cafe filter returns 401 | Authentication, Authorization, Security, API | Critical | No valid session. | `GET /api/v1/places?type=cafe`. | 1. Clear auth cookies/tokens. 2. Send request. | Status `401 Unauthorized`; no cafe rows, private fields, or partial catalog data are returned. | PLACE-002-US-002 | Yes | API | Smoke cadence. |
| PLACE-002-US-002-TC-009 | Cafe filtered page 2 has no cross-type leakage | API, Data Integrity | High | Authenticated request. More than one cafe page exists. | `type=cafe&limit=10&offset=10`. | 1. Request page 1 and page 2. 2. Inspect rows. | Every row on both pages has `type=cafe`; no duplicate IDs appear across pages. | PLACE-002-US-002 | Yes | API | Regression cadence. |

## PLACE-002-US-003 - Filter ice cream

User Story Summary: As a user, I want to filter ice cream places so that I can browse them separately.

Related Feature ID: `PLACE-002`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-002-US-003-TC-001 | Ice cream filter updates URL and request | Positive, UI, API, Integration | High | Valid session. Places page loaded. | Type `ice_cream`. | 1. Open `/places`. 2. Select `الآيس كريم`. 3. Inspect URL and network request. | URL contains `type=ice_cream`; `GET /api/v1/places` includes `type=ice_cream`. | PLACE-002-US-003 | Yes | UI E2E | Smoke cadence. |
| PLACE-002-US-003-TC-002 | Ice cream API returns only ice cream rows | API, Data Integrity | High | Authenticated request. Mixed catalog exists. | `GET /api/v1/places?type=ice_cream`. | 1. Send request. 2. Inspect every row. | Status `200`; every row has `type = ice_cream`; no restaurant or cafe rows appear. | PLACE-002-US-003 | Yes | API | Smoke cadence. |
| PLACE-002-US-003-TC-003 | Ice cream UI renders only ice cream rows | UI, Data Integrity | High | Valid session. Mixed catalog fixture. | Ice cream `Cone`, restaurant `Malfa`, cafe `قهوة`. | 1. Select `الآيس كريم`. 2. Inspect visible rows. | Only ice cream rows are visible; restaurant and cafe fixture rows are absent. | PLACE-002-US-003 | Yes | UI E2E | Regression cadence. |
| PLACE-002-US-003-TC-004 | Ice cream active state is visible and exclusive | UX, UI | High | Valid session. Places page loaded. | `الآيس كريم` filter. | 1. Select `الآيس كريم`. 2. Inspect filter options. | Ice cream is selected; restaurant and cafe are not selected; selected state is clear without relying on color only. | PLACE-002-US-003 | Yes | UI E2E | Regression cadence. |
| PLACE-002-US-003-TC-005 | Ice cream filter hides irrelevant subtype state | Regression, UI | High | Valid session. Restaurant subtype previously active. | Start at `/places?type=restaurant&subtype=burger`. | 1. Select `الآيس كريم`. 2. Inspect URL and controls. | URL changes to `type=ice_cream`; `subtype` is removed; subtype control is hidden or inactive. | PLACE-002-US-003 | Yes | UI E2E | Regression cadence. |
| PLACE-002-US-003-TC-006 | Ice cream pagination metadata uses ice-cream-only total | API, Contract | Medium | Authenticated request. Ice cream count differs from total catalog count. | `type=ice_cream&limit=10&offset=0`. | 1. Send request. 2. Inspect `meta.total`. | `meta.total` equals number of ice cream places matching filter. | PLACE-002-US-003 | Yes | API | Regression cadence. |
| PLACE-002-US-003-TC-007 | Ice cream filter preserves privacy exclusions | Privacy, Security, API | Critical | Authenticated request. Internal private data exists. | `GET /api/v1/places?type=ice_cream`. | 1. Send request. 2. Scan response. | No private notes, private list membership, creator identity, or internal moderation fields appear. | PLACE-002-US-003 | Yes | API | Smoke cadence. |
| PLACE-002-US-003-TC-008 | Guest ice cream filter returns 401 | Authentication, Authorization, Security, API | Critical | No valid session. | `GET /api/v1/places?type=ice_cream`. | 1. Clear auth cookies/tokens. 2. Send request. | Status `401 Unauthorized`; no ice cream rows, private fields, or partial catalog data are returned. | PLACE-002-US-003 | Yes | API | Smoke cadence. |
| PLACE-002-US-003-TC-009 | Ice cream filtered page 2 has no cross-type leakage | API, Data Integrity | Medium | Authenticated request. More than one ice cream page exists. | `type=ice_cream&limit=10&offset=10`. | 1. Request page 1 and page 2. 2. Inspect rows. | Every row on both pages has `type=ice_cream`; no duplicate IDs appear across pages. | PLACE-002-US-003 | Yes | API | Regression cadence. |

## PLACE-002-US-004 - Preserve type filter on refresh

User Story Summary: As a user, I want active filters preserved so that refresh and sharing do not reset context.

Related Feature ID: `PLACE-002`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-002-US-004-TC-001 | Refresh preserves cafe filter before results render | Regression, UI, Integration | High | Valid session. URL contains cafe filter. | `/places?type=cafe`. | 1. Open `/places?type=cafe`. 2. Reload browser. 3. Observe selected filter before rows render. | Cafe filter is selected before results render; API request includes `type=cafe`. | PLACE-002-US-004 | Yes | UI E2E | Smoke cadence. |
| PLACE-002-US-004-TC-002 | Shared restaurant URL initializes restaurant filter | Regression, UI | High | Valid session. Direct URL entry. | `/places?type=restaurant`. | 1. Open URL directly in new context. | Restaurant filter is selected and request includes `type=restaurant` without briefly rendering another type. | PLACE-002-US-004 | Yes | UI E2E | Regression cadence. |
| PLACE-002-US-004-TC-003 | Shared ice cream URL initializes ice cream filter | Regression, UI | Medium | Valid session. Direct URL entry. | `/places?type=ice_cream`. | 1. Open URL directly. | Ice cream filter is selected and request includes `type=ice_cream`. | PLACE-002-US-004 | Yes | UI E2E | Regression cadence. |
| PLACE-002-US-004-TC-004 | Refresh does not flash stale previous type rows | Privacy, Regression, UI | High | User previously viewed restaurants. URL now cafe. | Previous state restaurant; current URL `/places?type=cafe`. | 1. Navigate from restaurant filter to cafe. 2. Reload. 3. Inspect first render and final rows. | Restaurant rows do not render as current cafe results during initialization. | PLACE-002-US-004 | Yes | UI E2E | Regression cadence. |
| PLACE-002-US-004-TC-005 | Refresh preserves filtered pagination metadata | API, Integration | Medium | Valid session. Cafe filter URL. | `/places?type=cafe&limit=10&offset=0`. | 1. Reload URL. 2. Inspect request and response. | Request includes `type=cafe`; response `meta.total` and rows match cafe-only filter. | PLACE-002-US-004 | Yes | API | Regression cadence. |
| PLACE-002-US-004-TC-006 | Refresh with valid type preserves no horizontal overflow | Responsive, Mobile | Medium | Valid session. Mobile viewport. | `/places?type=cafe`, viewport `390x844`. | 1. Set viewport. 2. Open URL. 3. Reload. 4. Evaluate no-overflow assertion. | Filter remains selected and `document.documentElement.scrollWidth <= window.innerWidth`. | PLACE-002-US-004 | Yes | UI E2E | Regression cadence. |
| PLACE-002-US-004-TC-007 | Default no-type URL initializes documented default state | UI, API, Contract | High | Valid session. No type query is present. | `/places`. | 1. Open `/places`. 2. Inspect selected filter and network request. | UI initializes the documented default/all-types state; request omits `type`; no invalid taxonomy value is sent. | PLACE-002-US-004 | Yes | UI E2E | Smoke cadence. |
| PLACE-002-US-004-TC-008 | Refresh preserves default no-type state | Regression, UI | Medium | Valid session. User is on `/places` without `type`. | `/places`. | 1. Open `/places`. 2. Reload. 3. Inspect URL, filter control, and rows. | URL remains without invalid `type`; default/all-types state is restored consistently after refresh. | PLACE-002-US-004 | Yes | UI E2E | Regression cadence. |
| PLACE-002-US-004-TC-009 | Default state does not flash stale filtered rows | Privacy, Regression, UI | High | User previously viewed cafe filter. Current URL has no `type`. | Previous `/places?type=cafe`, current `/places`. | 1. Navigate from cafe filter to `/places`. 2. Reload. 3. Inspect first render. | Stale cafe-only rows do not render as the current default state before default data resolves. | PLACE-002-US-004 | Yes | UI E2E | Regression cadence. |

## PLACE-002-US-005 - Preserve type filter on back navigation

User Story Summary: As a user, I want browser back to restore the previous filter so that exploration feels stable.

Related Feature ID: `PLACE-002`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-002-US-005-TC-001 | Back restores restaurant after cafe switch | Regression, UI, Integration | Medium | Valid session. Start at `/places?type=restaurant`. | Restaurant then cafe. | 1. Open `/places?type=restaurant`. 2. Select `المقاهي`. 3. Press browser Back. | URL and selected filter return to `type=restaurant`; restaurant results are restored. | PLACE-002-US-005 | Yes | UI E2E | Smoke cadence. |
| PLACE-002-US-005-TC-002 | Forward restores cafe after back | Regression, UI | Medium | Same history as previous case. | Browser history. | 1. Complete back restore. 2. Press browser Forward. | URL and selected filter return to `type=cafe`; cafe results are restored. | PLACE-002-US-005 | Yes | UI E2E | Regression cadence. |
| PLACE-002-US-005-TC-003 | Back navigation does not duplicate rows | Data Integrity, Regression | High | Valid session. Multiple filters visited. | Restaurant IDs and cafe IDs distinct. | 1. Switch restaurant to cafe. 2. Press Back. 3. Collect visible row IDs. | Returned restaurant list contains no duplicate IDs and no cafe rows. | PLACE-002-US-005 | Yes | UI E2E | Regression cadence. |
| PLACE-002-US-005-TC-004 | Back navigation restores loading state safely | Loading State, Regression | Medium | Cafe request delayed. | Delayed cafe response. | 1. Open restaurant filter. 2. Select cafe. 3. Press Back before cafe response resolves. | Restaurant state is restored; delayed cafe response does not overwrite restaurant results. | PLACE-002-US-005 | Yes | UI E2E | Nightly cadence. |
| PLACE-002-US-005-TC-005 | Back navigation after detail preserves filter | Integration, UI | Medium | Valid session. Filtered list visible. | `/places?type=restaurant`. | 1. Open restaurant filter. 2. Open a row detail. 3. Browser Back. | Returns to restaurant-filtered Places state, not unfiltered or cafe state. | PLACE-002-US-005 | Yes | UI E2E | Regression cadence. |
| PLACE-002-US-005-TC-006 | Back navigation remains keyboard/screen-reader understandable | Accessibility, UX | Medium | Valid session. Screen-reader-accessible filter state available. | Restaurant to cafe history. | 1. Switch filters with keyboard. 2. Press browser Back. 3. Focus filter group. | Restored selected state is exposed accessibly and matches visible URL/results. | PLACE-002-US-005 | Yes | Accessibility | Regression cadence. |
| PLACE-002-US-005-TC-007 | Back restores default no-type state | Regression, UI | Medium | Valid session. Browser history contains default and filtered state. | `/places` then `/places?type=cafe`. | 1. Open `/places`. 2. Select cafe. 3. Press Back. | URL returns to `/places`; default/all-types state is restored and cafe-only state is no longer selected. | PLACE-002-US-005 | Yes | UI E2E | Regression cadence. |
| PLACE-002-US-005-TC-008 | Forward restores filtered state from default | Regression, UI | Medium | Same history as previous case after Back. | Browser Forward. | 1. Press browser Forward after default restore. | URL returns to `type=cafe`; cafe selected state and cafe results are restored. | PLACE-002-US-005 | Yes | UI E2E | Regression cadence. |

## PLACE-002-US-006 - Reset incompatible subtype on type change

User Story Summary: As a user, I want invalid subtype state cleared so that results remain meaningful.

Related Feature ID: `PLACE-002`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-002-US-006-TC-001 | Restaurant subtype clears when switching to cafe | UI, Regression, Validation | High | Valid session. Restaurant burger subtype active. | `/places?type=restaurant&subtype=burger`. | 1. Open URL. 2. Select `المقاهي`. | URL contains `type=cafe` and removes `subtype=burger`; API request has no invalid subtype. | PLACE-002-US-006 | Yes | UI E2E | Smoke cadence. |
| PLACE-002-US-006-TC-002 | Restaurant subtype clears when switching to ice cream | UI, Regression, Validation | High | Valid session. Restaurant burger subtype active. | `/places?type=restaurant&subtype=burger`. | 1. Open URL. 2. Select `الآيس كريم`. | URL contains `type=ice_cream`; `subtype` is removed; no subtype UI remains active. | PLACE-002-US-006 | Yes | UI E2E | Smoke cadence. |
| PLACE-002-US-006-TC-003 | Cafe subtype clears when switching to restaurant | UI, Regression, Validation | High | Valid session. Cafe subtype active. | `/places?type=cafe&subtype=coffee`. | 1. Open URL. 2. Select `المطاعم`. | URL contains `type=restaurant`; incompatible `subtype=coffee` is removed unless explicitly valid for restaurant by taxonomy. | PLACE-002-US-006 | Yes | UI E2E | Regression cadence. |
| PLACE-002-US-006-TC-004 | Cafe subtype clears when switching to ice cream | UI, Regression, Validation | High | Valid session. Cafe subtype active. | `/places?type=cafe&subtype=tea`. | 1. Open URL. 2. Select `الآيس كريم`. | URL contains `type=ice_cream`; `subtype` is removed. | PLACE-002-US-006 | Yes | UI E2E | Regression cadence. |
| PLACE-002-US-006-TC-005 | Type switch request excludes incompatible subtype | API, Integration | High | Valid session. App starts at invalid future state. | From `type=restaurant&subtype=burger` to cafe. | 1. Select cafe. 2. Inspect outgoing request. | Request is `GET /api/v1/places?type=cafe` and does not include `subtype=burger`. | PLACE-002-US-006 | Yes | UI E2E | Regression cadence. |
| PLACE-002-US-006-TC-006 | Rapid type switching leaves only final valid state | Concurrency, Regression, UI | High | Valid session. Places page loaded. | Switch restaurant -> cafe -> ice cream quickly. | 1. Rapidly activate filters in sequence. 2. Wait for requests to settle. | Final URL, selected filter, and rows match the last selected type only; stale responses do not overwrite final state. | PLACE-002-US-006 | Yes | UI E2E | Nightly cadence. |
| PLACE-002-US-006-TC-007 | Type reset preserves search query | Integration, Regression | Medium | Valid session. Search query active with restaurant subtype. | `/places?type=restaurant&subtype=burger&q=Malfa`. | 1. Select cafe. 2. Inspect URL/request. | `q=Malfa` remains; incompatible `subtype` is removed; request includes `type=cafe&q=Malfa`. | PLACE-002-US-006 | Yes | UI E2E | Regression cadence. |
| PLACE-002-US-006-TC-008 | Type reset does not leak old subtype results | Data Integrity, Regression | High | Valid session. Restaurant burger rows visible. | Switch to cafe. | 1. Select cafe. 2. Inspect final visible rows. | Final rows are cafes only; no burger restaurant rows remain as current results. | PLACE-002-US-006 | Yes | UI E2E | Regression cadence. |
| PLACE-002-US-006-TC-009 | Filter switch shows loading state without stale current rows | Loading State, UI, Regression | High | Valid session. Restaurant rows visible. Cafe request delayed. | Switch restaurant to cafe. | 1. Select cafe. 2. Observe UI while cafe request is pending. | Loading state is visible; UI does not present restaurant rows as final cafe results while the cafe request is pending. | PLACE-002-US-006 | Yes | UI E2E | Regression cadence. |
| PLACE-002-US-006-TC-010 | Delayed old response cannot overwrite latest filter | Concurrency, Data Integrity, UI | High | Valid session. Restaurant request delayed, cafe request fast. | Restaurant response delayed; cafe selected last. | 1. Trigger restaurant request. 2. Quickly select cafe. 3. Return cafe response first, then restaurant response. | Final URL, selected state, and rows remain cafe-only; delayed restaurant response is ignored for current state. | PLACE-002-US-006 | Yes | UI E2E | Nightly cadence. |
| PLACE-002-US-006-TC-011 | Filter request 500 shows recoverable error | Error Handling, UI | High | Valid session. Filter request returns server error. | `GET /api/v1/places?type=cafe` returns `500`. | 1. Select cafe. 2. Observe error state. | UI shows a recoverable error for the filtered request, does not show stale rows as final results, and provides retry. | PLACE-002-US-006 | Yes | UI E2E | Regression cadence. |
| PLACE-002-US-006-TC-012 | Filter request network failure preserves selected filter and retry | Error Handling, Offline, UI | High | Valid session. Network aborts filtered request. | Select `type=ice_cream`; request aborts. | 1. Select ice cream. 2. Abort request. 3. Inspect UI. | Selected filter remains ice cream; retry is available and no stale rows are presented as final ice cream results. | PLACE-002-US-006 | Yes | UI E2E | Regression cadence. |
| PLACE-002-US-006-TC-013 | Retry after filter failure requests same selected type | Error Handling, Integration | High | Filter request failed with retry visible. | Failed `type=cafe`, then success. | 1. Trigger cafe request failure. 2. Activate retry. 3. Inspect network and results. | Retry calls `GET /api/v1/places?type=cafe`; successful response renders cafe rows only. | PLACE-002-US-006 | Yes | UI E2E | Regression cadence. |

## PLACE-002-US-007 - Reject invalid type value

User Story Summary: As the system, I want invalid type values rejected so that taxonomy cannot drift.

Related Feature ID: `PLACE-002`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-002-US-007-TC-001 | API rejects unknown type hotel | Negative, Validation, API | Critical | Authenticated request. | `GET /api/v1/places?type=hotel`. | 1. Send request. 2. Inspect response. | Status `422`; structured validation error; no place `data` returned. | PLACE-002-US-007 | Yes | API | Smoke cadence. |
| PLACE-002-US-007-TC-002 | API rejects blank type value | Negative, Validation, API | High | Authenticated request. | `GET /api/v1/places?type=`. | 1. Send request. | Status `422`; structured validation error; no invalid taxonomy value is accepted and no place `data` is returned. | PLACE-002-US-007 | Yes | API | Regression cadence. |
| PLACE-002-US-007-TC-003 | API rejects case-mismatched type | Negative, Validation, API | High | Authenticated request. | `GET /api/v1/places?type=Restaurant`. | 1. Send request. | Status `422`; API does not silently create or accept non-canonical taxonomy values. | PLACE-002-US-007 | Yes | API | Regression cadence. |
| PLACE-002-US-007-TC-004 | API rejects injected type value safely | Security, Validation, API | Critical | Authenticated request. | `type=restaurant%27%20OR%201=1`. | 1. Send request. 2. Inspect response body. | Status `422`; no SQL, stack trace, private data, or partial `data` is returned. | PLACE-002-US-007 | Yes | Security | Smoke cadence for security. |
| PLACE-002-US-007-TC-005 | Invalid type cannot bypass authentication | Authentication, Security, API | Critical | No valid session. | `GET /api/v1/places?type=hotel`. | 1. Send unauthenticated request. | Status is `401 Unauthorized` or auth failure is enforced before protected data; no catalog rows returned. | PLACE-002-US-007 | Yes | API | Smoke cadence. |
| PLACE-002-US-007-TC-006 | UI direct invalid type URL shows safe validation error | Error Handling, UI, Regression | High | Valid session. Browser can open arbitrary URL. | `/places?type=hotel`. | 1. Open URL. 2. Observe UI and request. | UI does not show stale valid rows as hotel results; request fails with `422`; UI shows safe recovery or reset action without rendering protected data as hotel results. | PLACE-002-US-007 | Yes | UI E2E | Regression cadence. |
| PLACE-002-US-007-TC-007 | Invalid type error payload excludes private data | Privacy, Security, API | Critical | Authenticated request. Internal private data exists. | `type=hotel`. | 1. Send invalid request. 2. Recursively scan error body. | Error body contains no private notes, list membership, creator identity, internal moderation fields, stack traces, SQL, tokens, or cookies. | PLACE-002-US-007 | Yes | API | Smoke cadence. |
| PLACE-002-US-007-TC-008 | Missing type uses documented default all-types state | API, Contract | Medium | Authenticated request. Mixed catalog exists. | `GET /api/v1/places` without `type`. | 1. Send request. 2. Inspect response. | Status `200`; request is treated as unfiltered/default Places list; no invalid type error occurs; returned rows may include any supported primary type. | PLACE-002-US-007 | Yes | API | Regression cadence. |
| PLACE-002-US-007-TC-009 | API rejects repeated type params | Negative, Validation, API | Medium | Authenticated request. | `GET /api/v1/places?type=restaurant&type=cafe`. | 1. Send request. | Status `422`; API does not choose an arbitrary type silently and returns no place `data`. | PLACE-002-US-007 | Yes | API | Regression cadence. |
| PLACE-002-US-007-TC-010 | API rejects whitespace-padded type | Negative, Validation, API | Medium | Authenticated request. | `GET /api/v1/places?type=%20restaurant%20`. | 1. Send request. | Status `422`; only canonical `restaurant`, `cafe`, or `ice_cream` values are accepted. | PLACE-002-US-007 | Yes | API | Regression cadence. |
| PLACE-002-US-007-TC-011 | API rejects null-like type strings | Negative, Validation, API | Medium | Authenticated request. | `type=null`, `type=undefined`. | 1. Send request for each value. | Each request returns `422` structured validation error and no place `data`. | PLACE-002-US-007 | Yes | API | Regression cadence. |

## PLACE-002-US-008 - Announce selected type accessibly

User Story Summary: As a screen-reader user, I want to know which primary filter is selected so that filtering is understandable.

Related Feature ID: `PLACE-002`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-002-US-008-TC-001 | Filter group has accessible name | Accessibility, UI | High | Valid session. Places page loaded. | Primary filter control. | 1. Inspect accessibility tree. | Filter group exposes an accessible name describing place type filtering. | PLACE-002-US-008 | Yes | Accessibility | Regression cadence. |
| PLACE-002-US-008-TC-002 | Selected restaurant state is announced | Accessibility, Screen Reader | High | Valid session. Restaurant selected. | `type=restaurant`. | 1. Focus restaurant option. 2. Inspect selected state. | Assistive tech can identify `المطاعم` as selected through an explicit semantic state such as `aria-selected=true`, `aria-pressed=true`, `aria-current`, checked radio state, or equivalent native selected state; color alone is insufficient. | PLACE-002-US-008 | Yes | Accessibility | Regression cadence. |
| PLACE-002-US-008-TC-003 | Selected cafe state is announced | Accessibility, Screen Reader | High | Valid session. Cafe selected. | `type=cafe`. | 1. Focus cafe option. 2. Inspect selected state. | Assistive tech can identify `المقاهي` as selected through an explicit semantic selected/current/pressed/checked state. | PLACE-002-US-008 | Yes | Accessibility | Regression cadence. |
| PLACE-002-US-008-TC-004 | Selected ice cream state is announced | Accessibility, Screen Reader | High | Valid session. Ice cream selected. | `type=ice_cream`. | 1. Focus ice cream option. 2. Inspect selected state. | Assistive tech can identify `الآيس كريم` as selected through an explicit semantic selected/current/pressed/checked state. | PLACE-002-US-008 | Yes | Accessibility | Regression cadence. |
| PLACE-002-US-008-TC-005 | Keyboard navigation reaches every primary filter | Accessibility, Keyboard | High | Valid session. Keyboard only. | Filter options. | 1. Tab to filter group. 2. Navigate across all options. | All three options are reachable in logical RTL order and focus-visible is present. | PLACE-002-US-008 | Yes | Accessibility | Smoke cadence. |
| PLACE-002-US-008-TC-006 | Filter activation announces result loading | Accessibility, Loading State | Medium | Valid session. API response delayed. | Select cafe. | 1. Activate a different filter. 2. Inspect live/loading state. | Loading state is communicated accessibly without moving focus unexpectedly. | PLACE-002-US-008 | Yes | Accessibility | Regression cadence. |
| PLACE-002-US-008-TC-007 | Selected state does not rely on color only | Accessibility, UX | High | Valid session. Any selected filter. | Selected and unselected options. | 1. Inspect styles and accessibility attributes. | Selected option has non-color visual/semantic indicator such as ARIA selected/current, text weight, shape, or state attribute. | PLACE-002-US-008 | Yes | Accessibility | Regression cadence. |
| PLACE-002-US-008-TC-008 | Manual screen-reader review confirms Arabic labels | Accessibility, Arabic Localization | Medium | Valid session. Real screen reader available. | Arabic labels. | 1. Navigate filters with screen reader. 2. Listen to labels and selected state. | Labels are understandable Arabic, selected state is announced, and no mojibake or Unicode escapes are spoken. | PLACE-002-US-008 | No | Manual | Manual Review cadence. |
| PLACE-002-US-008-TC-009 | Focus-visible remains clear at 200% zoom | Accessibility, Responsive, Keyboard | High | Valid session. 200% zoom/adaptive pressure available. | Filter options at effective narrow width. | 1. Apply 200% zoom/adaptive pressure. 2. Keyboard-tab through filter options. | Each focused filter option has visible `focus-visible`, does not clip, and selected state remains perceivable. | PLACE-002-US-008 | Yes | Accessibility | Nightly cadence. |
| PLACE-002-US-008-TC-010 | Filter loading state uses live region | Accessibility, Loading State | Medium | Valid session. Filter request delayed. | Select `المقاهي`. | 1. Activate cafe filter. 2. Inspect accessibility tree/live region. | Loading state for filtered results is announced through `aria-live`, `role=status`, or approved equivalent without moving focus unexpectedly. | PLACE-002-US-008 | Yes | Accessibility | Regression cadence. |

## PLACE-002-US-009 - Keep filter control compact on mobile

User Story Summary: As a mobile user, I want primary filters usable without consuming excessive screen height.

Related Feature ID: `PLACE-002`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-002-US-009-TC-001 | Filter control fits at 320px | Responsive, Mobile | High | Valid session. Places page loaded. | Viewport `320x568`. | 1. Set viewport. 2. Open `/places`. 3. Evaluate no-overflow assertion. | All three primary options are reachable and readable; `document.documentElement.scrollWidth <= window.innerWidth`. | PLACE-002-US-009 | Yes | UI E2E | Smoke cadence. |
| PLACE-002-US-009-TC-002 | Filter control fits at 390px | Responsive, Mobile | Medium | Valid session. Places page loaded. | Viewport `390x844`. | 1. Set viewport. 2. Open `/places`. 3. Evaluate no-overflow assertion. | Filter control remains compact and no horizontal overflow occurs. | PLACE-002-US-009 | Yes | UI E2E | Regression cadence. |
| PLACE-002-US-009-TC-003 | Filter control fits at 430px | Responsive, Mobile | Medium | Valid session. Places page loaded. | Viewport `430x932`. | 1. Set viewport. 2. Open `/places`. 3. Evaluate no-overflow assertion. | Filter control remains readable and no horizontal overflow occurs. | PLACE-002-US-009 | Yes | UI E2E | Regression cadence. |
| PLACE-002-US-009-TC-004 | Filter control works under 200% zoom pressure | Accessibility, Responsive | High | Valid session. 200% zoom or synthetic pressure available. | Effective narrow width around 195-215 px. | 1. Apply 200% zoom/adaptive pressure. 2. Open `/places`. 3. Navigate filters. | Filters remain reachable, selected state visible, and no horizontal page overflow occurs. | PLACE-002-US-009 | Yes | UI E2E | Nightly cadence. |
| PLACE-002-US-009-TC-005 | Filter control fits in landscape | Responsive, Mobile | Medium | Valid session. Landscape viewport. | `844x390`. | 1. Set viewport. 2. Open `/places`. | Filter control does not overlap header/search/rows and remains keyboard/touch reachable. | PLACE-002-US-009 | Yes | UI E2E | Regression cadence. |
| PLACE-002-US-009-TC-006 | Filter options meet 44x44 touch target | Accessibility, Mobile | High | Valid session. Mobile viewport. | `320x568`, `390x844`, `430x932`. | 1. Open `/places` at each viewport. 2. Measure filter option hit targets. | Each primary filter option has at least `44x44` CSS pixel hit target or equivalent accessible hit area. | PLACE-002-US-009 | Yes | Accessibility | Regression cadence. |
| PLACE-002-US-009-TC-007 | Filter labels do not truncate essential Arabic text | Arabic Localization, Responsive | High | Valid session. Mobile viewport. | Labels `المطاعم`, `المقاهي`, `الآيس كريم`. | 1. Open `/places` at `320x568`. 2. Inspect labels. | All labels are readable Arabic with no mojibake, no Unicode escapes, and no critical clipping. | PLACE-002-US-009 | Yes | UI E2E | Regression cadence. |
| PLACE-002-US-009-TC-008 | Filter compactness does not hide first row | UX, Responsive | Medium | Valid session. Places rows available. | `320x568`. | 1. Open `/places`. 2. Inspect first viewport. | Header/filter area remains compact enough that at least part of the first result row is visible without browser zoom-out. | PLACE-002-US-009 | Yes | UI E2E | Regression cadence. |
| PLACE-002-US-009-TC-009 | Bottom navigation does not cover filtered final row | Responsive, Mobile, UX | High | Valid session. Filtered list has enough rows to scroll. | `390x844`, `type=restaurant`. | 1. Open `/places?type=restaurant`. 2. Scroll to final row. | Final row remains fully visible above bottom navigation and can be tapped. | PLACE-002-US-009 | Yes | UI E2E | Regression cadence. |
| PLACE-002-US-009-TC-010 | iOS safe area does not obscure filter or final rows | Responsive, Mobile | High | Valid session. WebKit/mobile-safe-area emulation available. | `type=cafe`, safe-area bottom/top. | 1. Open `/places?type=cafe` in WebKit or safe-area emulation. 2. Inspect filter control and final row. | Filter control is not under status/browser chrome; final row is above bottom nav plus safe-area inset. | PLACE-002-US-009 | Yes | UI E2E | Nightly cadence. |

## PLACE-002-US-010 - Show filtered empty state

User Story Summary: As a user, I want to distinguish no places for a type from an empty catalog.

Related Feature ID: `PLACE-002`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-002-US-010-TC-001 | Filtered empty state shows no-results copy | Empty State, UI, UX | Medium | Valid session. Catalog has cafes but no ice cream. | `type=ice_cream`, API returns `data: []`, `meta.total: 0`. | 1. Select `الآيس كريم`. | UI shows `لا توجد نتائج` or approved equivalent, not full catalog-empty copy. | PLACE-002-US-010 | Yes | UI E2E | Smoke cadence. |
| PLACE-002-US-010-TC-002 | Filtered empty state offers clear/show-all action | Empty State, UI | Medium | Valid session. Filter active with zero rows. | `type=restaurant`, no restaurants. | 1. Select empty type. 2. Inspect action. | UI provides one clear-filter or show-all action. | PLACE-002-US-010 | Yes | UI E2E | Regression cadence. |
| PLACE-002-US-010-TC-003 | Clear action removes active type filter | UI, Integration | Medium | Valid session. Filtered empty state visible. | `/places?type=ice_cream`. | 1. Activate clear/show-all action. 2. Inspect URL and request. | `type` is removed or all-types state is restored according to documented behavior; results reload without stale empty state. | PLACE-002-US-010 | Yes | UI E2E | Regression cadence. |
| PLACE-002-US-010-TC-004 | Filtered empty state differs from catalog empty state | UX, Regression | Medium | Catalog contains at least one other type. Active type has zero rows. | Cafes exist; restaurants zero. | 1. Select restaurants. | UI communicates no results for current filter and does not imply the entire catalog is empty. | PLACE-002-US-010 | Yes | UI E2E | Regression cadence. |
| PLACE-002-US-010-TC-005 | Filtered empty state is accessible | Accessibility, Empty State | Medium | Valid session. Filtered empty state visible. | `لا توجد نتائج`. | 1. Inspect accessibility tree. 2. Navigate by keyboard to recovery action. | Empty-state message is readable by assistive tech; recovery action has accessible name and visible focus. | PLACE-002-US-010 | Yes | Accessibility | Regression cadence. |
| PLACE-002-US-010-TC-006 | Filtered empty state has no horizontal overflow | Responsive, Mobile | Medium | Valid session. Mobile viewport. | `320x568`, empty filtered state. | 1. Set viewport. 2. Open empty filtered URL. 3. Evaluate no-overflow assertion. | `document.documentElement.scrollWidth <= window.innerWidth`; empty message and recovery action remain visible. | PLACE-002-US-010 | Yes | UI E2E | Regression cadence. |
| PLACE-002-US-010-TC-007 | Filtered empty state preserves privacy | Privacy, Security, API | High | Valid session. Empty filtered result. Internal private data exists for other types. | `GET /api/v1/places?type=restaurant` returns empty. | 1. Request empty filtered endpoint. 2. Inspect response and UI. | No private notes, private list membership, creator identity, or internal fields are exposed while showing empty state. | PLACE-002-US-010 | Yes | API | Regression cadence. |
| PLACE-002-US-010-TC-008 | Filtered empty recovery action has 44x44 target | Accessibility, Mobile, Empty State | Medium | Valid session. Filtered empty state visible. | Empty `type=ice_cream` state. | 1. Open empty filtered state. 2. Measure clear/show-all action. | Recovery action has accessible name, visible focus, and at least `44x44` CSS pixel hit target. | PLACE-002-US-010 | Yes | Accessibility | Regression cadence. |
| PLACE-002-US-010-TC-009 | Filtered empty clear action failure remains recoverable | Error Handling, UI | Medium | Valid session. Empty state visible. Clear/show-all request fails. | Clear action triggers failed reload. | 1. Activate clear/show-all action. 2. Force next request to fail. | UI shows recoverable error or retains empty-state recovery; user is not left with disabled controls or stale loading state. | PLACE-002-US-010 | Yes | UI E2E | Regression cadence. |

## Final Summary

Total user stories processed: 10

Total test cases generated: 99

### Test Cases Count Per User Story

| User Story ID | Test Case Count |
|---|---:|
| PLACE-002-US-001 | 11 |
| PLACE-002-US-002 | 9 |
| PLACE-002-US-003 | 9 |
| PLACE-002-US-004 | 9 |
| PLACE-002-US-005 | 8 |
| PLACE-002-US-006 | 13 |
| PLACE-002-US-007 | 11 |
| PLACE-002-US-008 | 10 |
| PLACE-002-US-009 | 10 |
| PLACE-002-US-010 | 9 |

### Count By Test Type

| Test Type | Count |
|---|---:|
| Accessibility | 16 |
| API | 33 |
| Arabic Localization | 2 |
| Authentication | 4 |
| Authorization | 3 |
| Concurrency | 2 |
| Contract | 7 |
| Data Integrity | 12 |
| Empty State | 4 |
| Error Handling | 5 |
| Integration | 11 |
| Keyboard | 3 |
| Loading State | 4 |
| Localization / RTL | 1 |
| Mobile | 10 |
| Negative | 6 |
| Performance | 1 |
| Positive | 3 |
| Privacy | 7 |
| Regression | 24 |
| Responsive | 12 |
| Screen Reader | 3 |
| Security | 10 |
| UI | 39 |
| UX | 9 |
| Validation | 11 |

Note: Counts by test type are multi-label counts; one test case may count under more than one type.

### Count By Priority

| Priority | Count |
|---|---:|
| Critical | 16 |
| High | 49 |
| Medium | 34 |
| Low | 0 |

### Count By Automation Layer

| Automation Layer | Count |
|---|---:|
| API | 27 |
| Accessibility | 14 |
| Manual | 1 |
| Security | 1 |
| UI E2E | 56 |
| Unit | 0 |
| Performance | 0 |

### Top Automation Candidates

- `PLACE-002-US-001-TC-001` - restaurant filter URL/request.
- `PLACE-002-US-001-TC-009` - guest restaurant filter returns `401`.
- `PLACE-002-US-001-TC-002` - restaurant API type integrity.
- `PLACE-002-US-002-TC-008` - guest cafe filter returns `401`.
- `PLACE-002-US-002-TC-002` - cafe API type integrity.
- `PLACE-002-US-003-TC-008` - guest ice cream filter returns `401`.
- `PLACE-002-US-003-TC-002` - ice cream API type integrity.
- `PLACE-002-US-004-TC-007` - default no-type URL initializes documented default state.
- `PLACE-002-US-006-TC-001` and `PLACE-002-US-006-TC-002` - incompatible subtype reset.
- `PLACE-002-US-006-TC-010` - delayed old response cannot overwrite latest filter.
- `PLACE-002-US-006-TC-011` through `PLACE-002-US-006-TC-013` - filtered request error and retry behavior.
- `PLACE-002-US-007-TC-001` through `PLACE-002-US-007-TC-011` - invalid, missing, malformed, repeated, and injected type validation.
- `PLACE-002-US-008-TC-001` through `PLACE-002-US-008-TC-010` - selected-state accessibility and live-region behavior.
- `PLACE-002-US-009-TC-001` and `PLACE-002-US-009-TC-006` - mobile no-overflow and touch targets.
- `PLACE-002-US-009-TC-009` and `PLACE-002-US-009-TC-010` - bottom navigation and safe-area behavior.
- `PLACE-002-US-010-TC-001` - filtered empty state.

### Manual-Only Test Cases

- `PLACE-002-US-008-TC-008` - Manual screen-reader review confirms Arabic labels.

Supplemental manual review is also recommended for visual compactness and mobile Safari safe-area behavior if automated WebKit coverage is unavailable.

### Remaining Assumptions Or Questions

- Missing `type` behavior is defined here as the documented default/unfiltered Places state and must remain synchronized with API documentation.
- Exact Arabic labels may vary only if approved product copy changes; meanings must remain `المطاعم`, `المقاهي`, `الآيس كريم`, and `لا توجد نتائج`.
- Performance budgets for rapid switching and request storms should be finalized if this suite is promoted to a nightly performance gate.

## Re-Audit Result

Findings fixed:

- All `PLACE-002` user stories have dedicated test cases.
- Primary type filter coverage includes restaurant, cafe, and ice cream.
- Filter selection coverage includes default/direct URL state, first page load, refresh, browser back/forward, switching, repeated selection, rapid switching, persistence, reset, and browser history.
- Data integrity coverage includes correct rows, no cross-category leakage, no duplicate rows, stale response protection, stale delayed response rejection, and filtered pagination metadata.
- API coverage includes authenticated `200`, unauthenticated `401`, invalid `422`, valid type values, invalid values, missing type behavior, malformed type values, repeated type params, pagination while filtered, metadata, and structured validation.
- UX coverage includes active indication, loading behavior, error state, retry, empty state, clear/show-all recovery, compactness, and no stale rows.
- Accessibility coverage includes keyboard navigation, accessible names, selected-state announcement, semantic selected state, color-independent state, focus-visible, live-region behavior, and manual screen-reader review.
- Responsive coverage includes 320px, 390px, 430px, 200% zoom/adaptive pressure, landscape, no horizontal overflow, bottom navigation overlap, safe areas, and 44x44 touch targets.
- Privacy/security coverage includes no private notes, no private list membership, no creator identity, no internal moderation data, safe invalid-type errors, and protected API behavior.
- Traceability is complete at user-story level.

Findings remaining:

- No blocking findings remain.
- Missing-type default behavior should remain synchronized with API documentation.
- Manual screen-reader confirmation remains recommended for Arabic selected-state announcement quality.

Updated scorecard:

| Area | Score |
|---|---:|
| User Story Coverage | 10/10 |
| Acceptance Criteria Coverage | 9.8/10 |
| Functional Coverage | 9.8/10 |
| Negative Coverage | 9.7/10 |
| API Coverage | 9.8/10 |
| UI Coverage | 9.8/10 |
| Accessibility Coverage | 9.7/10 |
| Responsive Coverage | 9.8/10 |
| Security/Privacy Coverage | 9.7/10 |
| Automation Readiness | 9.7/10 |
| Traceability | 10/10 |
| Production QA Readiness | 9.8/10 |

Final verdict: Production Grade
