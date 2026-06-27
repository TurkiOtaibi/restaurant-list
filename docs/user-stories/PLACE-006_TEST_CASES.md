# PLACE-006 Test Cases

Feature: `PLACE-006 - Search place name only`

Source: `docs/user-stories/PLACES_USER_STORIES.md`

Scope: All user stories under `PLACE-006`.

## QA Execution Standards

- Search applies to place names only. Location text, subtype labels, recommendation concepts, ratings, private notes, list membership, creator identity, and moderation metadata must not expand search results.
- `GET /api/v1/places` search uses `q` with authenticated access. Guest requests must return `401 Unauthorized` and no catalog data.
- Search normalization must trim leading/trailing whitespace, collapse repeated internal whitespace, fold Arabic diacritics, normalize safe punctuation differences, and treat `%`, `_`, and backslash as literal characters.
- Search query length limit is 120 characters after normalization. Values over the limit, malformed values, duplicate ambiguous parameters, and non-string query values must return `422 Validation Error`.
- Valid search responses must follow `{ data, meta }`; `meta` must include `limit`, `offset`, `total`, and `sort`; ranking metadata must be deterministic through continuous scrolling.
- Search result ranking order is exact normalized name matches first, then starts-with matches, then contains matches. Default rating sort is used only as a tie-breaker within the same rank group.
- Search responses and error payloads must never expose private notes, private list membership, creator identity, internal moderation data, tokens, cookies, SQL, or stack traces.
- Arabic test data must remain valid UTF-8 Arabic, including `الأماكن`, `قهوة`, `قَهْوَة`, `لا توجد نتائج`, and `ابحث عن مكان`. No mojibake, escaped Arabic code points, or replacement characters are permitted.
- Responsive certification points for this feature are `320x568`, `390x844`, `430x932`, landscape `844x390`, and 200% zoom/adaptive pressure.
- Responsive UI tests must assert `document.documentElement.scrollWidth <= window.innerWidth`.
- Minimum interactive touch target for search input, clear search, retry action, result rows, and empty-state actions is `44x44` CSS pixels.
- Search accessibility baseline: programmatic label, keyboard operation, focus-visible, live-region updates for loading/result changes, screen-reader announcement for no-results/error states, and no focus loss when clearing search.
- Automation cadence values used in Notes: Smoke, Regression, Nightly, and Manual Review.

## PLACE-006-US-001 - Search by place name

User Story Summary: As a user, I want to search by place name so that I can find a known place quickly.

Related Feature ID: `PLACE-006`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-006-US-001-TC-001 | Search input sends q parameter | Positive, UI, API, Integration | Critical | Valid session. Places page loaded. | Search text `Malfa`. | 1. Open `/places`. 2. Type `Malfa` in search. 3. Wait for results. 4. Inspect request and URL. | Request is `GET /api/v1/places?q=Malfa`; response status is `200 OK`; URL contains `q=Malfa`; visible rows match place-name search. | PLACE-006-US-001 | Yes | UI E2E | Smoke cadence. |
| PLACE-006-US-001-TC-002 | API search returns only name matches | API, Data Integrity | Critical | Authenticated request. Fixture includes one place named `Malfa` and another with `Malfa` only in non-name metadata. | `GET /api/v1/places?q=Malfa`. | 1. Send request. 2. Inspect every returned row. | Status `200 OK`; every returned row has normalized place name matching `Malfa`; rows matching only non-name fields are excluded. | PLACE-006-US-001 | Yes | API | Smoke cadence. |
| PLACE-006-US-001-TC-003 | Search result row content is complete | UI, Contract, Regression | High | Valid session. At least one matching restaurant place named `Malfa` exists with subtype `burger` and average rating `8.5`. | `q=Malfa`. | 1. Open `/places?q=Malfa`. 2. Inspect first visible row. | Row shows place name `Malfa`, restaurant type, `burger` subtype metadata, generated artwork, rating `8.5`, and semantic row link without clipped text. | PLACE-006-US-001 | Yes | UI E2E | Regression cadence. |
| PLACE-006-US-001-TC-004 | Search response schema is complete | API, Contract | High | Authenticated request. At least one matching place exists. | `GET /api/v1/places?q=Malfa&limit=10&offset=0`. | 1. Send request. 2. Inspect response. | Status `200 OK`; response has `data` array and `meta`; each row includes `id`, `name`, `type`, `subtype`, `averageRating`, `ratingCount`, `createdAt`, and `updatedAt`; `meta.limit=10`, `meta.offset=0`, `meta.total` is search-scoped, and `meta.sort` is present. | PLACE-006-US-001 | Yes | API | Regression cadence. |
| PLACE-006-US-001-TC-005 | Search response excludes forbidden fields | Privacy, Security, API, Contract | Critical | Authenticated request. Internal/private fixture data exists. | `GET /api/v1/places?q=Malfa`. | 1. Send request. 2. Recursively inspect response. | Status `200 OK`; response excludes `notes`, `privateNotes`, `listMembership`, `creatorId`, `creatorEmail`, `moderationState`, tokens, cookies, SQL, and stack traces. | PLACE-006-US-001 | Yes | API | Smoke cadence. |
| PLACE-006-US-001-TC-006 | Guest search API request returns 401 | Authentication, Authorization, Security, API | Critical | No valid session. | `GET /api/v1/places?q=Malfa`. | 1. Clear auth. 2. Send request. | Status `401 Unauthorized`; no place rows, counts, private fields, or search metadata are returned. | PLACE-006-US-001 | Yes | API | Smoke cadence. |
| PLACE-006-US-001-TC-007 | Guest search page has no private data flash | Authentication, Authorization, Privacy, UI | Critical | No valid session. Browser may have cached Places UI from previous session. | `/places?q=Malfa`. | 1. Clear auth tokens/cookies. 2. Open URL. 3. Observe first render through auth resolution. | UI shows neutral auth/loading or login state; no cached rows, private notes, list membership, creator identity, or protected metadata render before denial/redirect completes. | PLACE-006-US-001 | Yes | UI E2E | Smoke cadence. |
| PLACE-006-US-001-TC-008 | Search pagination has no duplicate IDs | API, Data Integrity, Regression | High | Authenticated request. More than two pages match query. | `q=a`, `limit=10`, offsets `0`, `10`, `20`. | 1. Request three consecutive pages. 2. Concatenate returned IDs. | Each response returns `200 OK`; no duplicate IDs appear across pages; combined order follows search rank and tie-break order. | PLACE-006-US-001 | Yes | API | Regression cadence. |
| PLACE-006-US-001-TC-009 | Search loading state does not show stale final rows | Loading State, UI, Regression | High | Valid session. Existing list rows visible. Search request delayed. | Query `Malfa`. | 1. Type query. 2. Hold network response. 3. Observe pending state. | Loading state is visible; previous unsearched rows are not presented as final search results while the request is pending. | PLACE-006-US-001 | Yes | UI E2E | Regression cadence. |
| PLACE-006-US-001-TC-010 | One-character search query is valid | API, Boundary, Validation | Medium | Authenticated request. Places with names containing `a` exist. | `GET /api/v1/places?q=a&limit=10&offset=0`. | 1. Send request. 2. Inspect response. | Status `200 OK`; request is processed as a valid name search; every returned row matches normalized query `a`; metadata is search-scoped. | PLACE-006-US-001 | Yes | API | Regression cadence. |
| PLACE-006-US-001-TC-011 | Numeric place-name search is supported | API, UI, Regression | Medium | Authenticated request. Place named `99 Grill` exists. | `q=99`. | 1. Send API request. 2. Open `/places?q=99`. 3. Inspect rows. | API returns `200 OK`; `99 Grill` appears in results; UI renders Western numerals LTR without clipping or private-data leakage. | PLACE-006-US-001 | Yes | UI E2E | Regression cadence. |

## PLACE-006-US-002 - Limit search scope

User Story Summary: As Product, I want search limited to place names so that MVP scope remains controlled.

Related Feature ID: `PLACE-006`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-006-US-002-TC-001 | Subtype-only matches do not appear | API, Negative, Data Integrity | Critical | Authenticated request. Fixture has burger restaurant whose name does not contain `برجر`. | `GET /api/v1/places?q=برجر`. | 1. Send request. 2. Inspect results. | Status `200 OK`; rows are returned only when the place name matches `برجر`; subtype-only matches are excluded. | PLACE-006-US-002 | Yes | API | Smoke cadence. |
| PLACE-006-US-002-TC-002 | Description-only matches do not appear | API, Negative, Data Integrity | High | Authenticated request. Place description contains `sea view`; name does not. | `GET /api/v1/places?q=sea%20view`. | 1. Send request. 2. Inspect results. | Status `200 OK`; no row is included solely because description contains the query. | PLACE-006-US-002 | Yes | API | Regression cadence. |
| PLACE-006-US-002-TC-003 | Rating and popularity concepts do not expand results | API, Negative, Data Integrity | High | Authenticated request. Rated places exist. | `q=best`, `q=9.5`, `q=popular`. | 1. Send each query. 2. Inspect results. | Each request returns `200 OK`; rows appear only if the place name itself matches the query text. | PLACE-006-US-002 | Yes | API | Regression cadence. |
| PLACE-006-US-002-TC-004 | Private notes never influence search results | Privacy, Security, API | Critical | Authenticated user has private rating note containing `secretword`; no place name contains it. | `GET /api/v1/places?q=secretword`. | 1. Send request. 2. Inspect results and payload. | Status `200 OK`; `data=[]`; response contains no private note text or private-note-derived match. | PLACE-006-US-002 | Yes | API | Smoke cadence. |
| PLACE-006-US-002-TC-005 | UI no-results appears for non-name-only match | UI, Empty State, Regression | Medium | Valid session. Query exists only in subtype/description/private note, not names. | Query `secretword`. | 1. Open `/places`. 2. Search `secretword`. | UI shows `لا توجد نتائج`; it does not show rows that match only non-name fields. | PLACE-006-US-002 | Yes | UI E2E | Regression cadence. |

## PLACE-006-US-003 - Trim and collapse search whitespace

User Story Summary: As a user, I want accidental spacing handled so that search behaves predictably.

Related Feature ID: `PLACE-006`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-006-US-003-TC-001 | Search trims leading and trailing whitespace | API, Validation, Regression | High | Authenticated request. Place named `Casa Nonna` exists. | `q=%20%20Casa%20Nonna%20%20`. | 1. Send request. 2. Compare with normalized query result. | Status `200 OK`; returned IDs match `q=Casa%20Nonna`; no extra-space-only mismatch occurs. | PLACE-006-US-003 | Yes | API | Regression cadence. |
| PLACE-006-US-003-TC-002 | Search collapses repeated internal spaces | API, Validation, Regression | High | Authenticated request. Place named `Casa Nonna` exists. | `q=Casa%20%20%20Nonna`. | 1. Send request. 2. Compare with `q=Casa%20Nonna`. | Status `200 OK`; effective query is `Casa Nonna`; result IDs and metadata totals match normalized query. | PLACE-006-US-003 | Yes | API | Smoke cadence. |
| PLACE-006-US-003-TC-003 | UI displays normalized search value after applying search | UI, UX, Regression | Medium | Valid session. | Input `  Casa   Nonna  `. | 1. Type value. 2. Wait for search. 3. Inspect input and URL. | Request uses normalized `q=Casa%20Nonna`; input displays `Casa Nonna`; results and URL use the same normalized query. | PLACE-006-US-003 | Yes | UI E2E | Regression cadence. |
| PLACE-006-US-003-TC-004 | Normalized whitespace preserves active filters | Integration, UI, Regression | Medium | Valid session. Restaurant filter active. | `/places?type=restaurant`, input `  Casa   Nonna  `. | 1. Open URL. 2. Search value. 3. Inspect request. | Request returns `200 OK` and includes `type=restaurant&q=Casa%20Nonna`; restaurant filter remains active. | PLACE-006-US-003 | Yes | UI E2E | Regression cadence. |

## PLACE-006-US-004 - Treat blank search as no query

User Story Summary: As a user, I want clearing the search field to return to the filtered list.

Related Feature ID: `PLACE-006`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-006-US-004-TC-001 | Whitespace-only search removes q | UI, Validation, Integration | High | Valid session. Type filter active. | `/places?type=restaurant`, search spaces. | 1. Open URL. 2. Enter three spaces. 3. Wait for request. | URL contains `type=restaurant` and no `q`; request returns `200 OK` for current filter without search. | PLACE-006-US-004 | Yes | UI E2E | Smoke cadence. |
| PLACE-006-US-004-TC-002 | API treats blank q as absent query | API, Validation | High | Authenticated request. | `GET /api/v1/places?q=%20%20&limit=10&offset=0`. | 1. Send blank query request. 2. Compare with request without `q`. | Status `200 OK`; effective result set and `meta.total` match `GET /api/v1/places?limit=10&offset=0`. | PLACE-006-US-004 | Yes | API | Regression cadence. |
| PLACE-006-US-004-TC-003 | Clear button removes search while preserving filters | UI, UX, Integration | High | Valid session. Search and subtype filter active. | `/places?type=restaurant&subtype=burger&q=Malfa`. | 1. Open URL. 2. Activate clear search control. | URL becomes `/places?type=restaurant&subtype=burger`; request returns `200 OK`; filter state remains active. | PLACE-006-US-004 | Yes | UI E2E | Regression cadence. |
| PLACE-006-US-004-TC-004 | Clear control appears only when text exists | UI, Accessibility, Regression | Medium | Valid session. Search input is initially empty. | Empty input then `Malfa`. | 1. Open `/places`. 2. Inspect search field. 3. Type `Malfa`. 4. Clear it. | Clear control is absent when input is empty, appears inside input when text exists, has accessible name, and disappears after clearing. | PLACE-006-US-004 | Yes | Accessibility | Regression cadence. |
| PLACE-006-US-004-TC-005 | Blank search does not show search no-results | UI, Empty State, Regression | Medium | Valid session. Current filter has rows. | Spaces-only search. | 1. Enter spaces in search field. 2. Wait for results. | UI shows filtered browsing results, not `لا توجد نتائج` for a blank query. | PLACE-006-US-004 | Yes | UI E2E | Regression cadence. |

## PLACE-006-US-005 - Enforce search length limit

User Story Summary: As the system, I want long searches rejected so that the API is protected.

Related Feature ID: `PLACE-006`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-006-US-005-TC-001 | Search accepts exactly 120 characters | API, Boundary, Validation | High | Authenticated request. | `q` with exactly 120 `a` characters. | 1. Send request. 2. Inspect response. | Status `200 OK`; request is processed as a valid search; no validation error is returned. | PLACE-006-US-005 | Yes | API | Regression cadence. |
| PLACE-006-US-005-TC-002 | Search rejects 121 characters | API, Boundary, Validation, Negative | Critical | Authenticated request. | `q` with 121 `a` characters. | 1. Send request. 2. Inspect response. | Status `422 Validation Error`; no results are returned; error identifies `q` length violation. | PLACE-006-US-005 | Yes | API | Smoke cadence. |
| PLACE-006-US-005-TC-003 | Length limit applies after whitespace normalization | API, Boundary, Validation | High | Authenticated request. | Query with spaces that normalizes to 121 characters. | 1. Send request. 2. Inspect response. | Status `422 Validation Error`; validation uses normalized query length; no data array is returned. | PLACE-006-US-005 | Yes | API | Regression cadence. |
| PLACE-006-US-005-TC-004 | UI handles too-long query without stale results | UI, Validation, Error Handling | High | Valid session. Search field visible. | 121-character query. | 1. Type 121-character query. 2. Wait for validation handling. 3. Inspect rows and network behavior. | Search request returns `422 Validation Error`; UI shows a validation message, `q` is not applied as a successful search, and stale previous rows are not presented as matching the invalid query. | PLACE-006-US-005 | Yes | UI E2E | Regression cadence. |
| PLACE-006-US-005-TC-005 | Length validation error excludes sensitive data | Security, Privacy, API | Critical | Authenticated request. Internal data exists. | 121-character query. | 1. Send request. 2. Inspect error payload. | Status `422 Validation Error`; payload contains no private notes, private list membership, creator identity, tokens, cookies, SQL, or stack traces. | PLACE-006-US-005 | Yes | API | Smoke cadence. |
| PLACE-006-US-005-TC-006 | Search rejects 121 Arabic characters after normalization | API, Boundary, Arabic, Validation | High | Authenticated request. | `q` with 121 Arabic letters after diacritic and whitespace normalization. | 1. Send request. 2. Inspect response. | Status `422 Validation Error`; validation counts normalized Unicode characters correctly; no result rows or private data are returned. | PLACE-006-US-005 | Yes | API | Regression cadence. |

## PLACE-006-US-006 - Escape wildcard characters

User Story Summary: As the system, I want `%`, `_`, and backslash treated safely so that search cannot alter SQL pattern behavior.

Related Feature ID: `PLACE-006`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-006-US-006-TC-001 | Percent sign is treated as literal search text | API, Security, Validation | Critical | Authenticated request. Fixture has place named `100% Coffee`; unrelated places exist. | `GET /api/v1/places?q=100%25`. | 1. Send request. 2. Inspect results. | Status `200 OK`; only names containing literal `%` or normalized literal text match; `%` does not behave as wildcard. | PLACE-006-US-006 | Yes | API | Smoke cadence. |
| PLACE-006-US-006-TC-002 | Underscore is treated as literal search text | API, Security, Validation | High | Authenticated request. Fixture has place named `Cafe_A`. | `GET /api/v1/places?q=Cafe_A`. | 1. Send request. 2. Inspect results. | Status `200 OK`; `_` does not match arbitrary single characters; only literal or normalized name matches appear. | PLACE-006-US-006 | Yes | API | Regression cadence. |
| PLACE-006-US-006-TC-003 | Backslash is treated as literal search text | API, Security, Validation | High | Authenticated request. Fixture has place named `Cafe\\Lab`; unrelated `CafeXLab` exists. | `GET /api/v1/places?q=Cafe%5CLab`. | 1. Send request. 2. Inspect response. | Status `200 OK`; only place names containing literal backslash-normalized text match; no SQL error, stack trace, or wildcard expansion occurs. | PLACE-006-US-006 | Yes | API | Regression cadence. |
| PLACE-006-US-006-TC-004 | Wildcard-only query does not return full catalog | API, Security, Negative | Critical | Authenticated request. Catalog has many places and no place name equals literal `%%%` or `___`. | `q=%25%25%25` and `q=___`. | 1. Send each request. 2. Compare result count to full catalog. | Each request returns `200 OK` with `data=[]` and search-scoped `meta.total=0`; it never returns the full catalog through wildcard expansion. | PLACE-006-US-006 | Yes | API | Smoke cadence. |
| PLACE-006-US-006-TC-005 | SQL-like search text is treated literally | Security, API, Negative | Critical | Authenticated request. Catalog has many places and no place name contains the literal SQL-like text. | `q=%25%27%20OR%201=1--`. | 1. Send request. 2. Inspect response and logs available to test harness. | Status `200 OK`; `data=[]`; no unauthorized rows, SQL error, stack trace, tokens, cookies, or private data is exposed. | PLACE-006-US-006 | Yes | Security | Smoke cadence. |

## PLACE-006-US-007 - Support Arabic search text

User Story Summary: As an Arabic user, I want Arabic names searchable so that local catalog entries are findable.

Related Feature ID: `PLACE-006`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-006-US-007-TC-001 | Arabic exact name search returns matching place | API, Arabic, Localization | Critical | Authenticated request. Place named `قهوة الرياض` exists. | `GET /api/v1/places?q=قهوة%20الرياض`. | 1. Send request. 2. Inspect results. | Status `200 OK`; matching Arabic place is returned; response text is valid UTF-8 with no mojibake. | PLACE-006-US-007 | Yes | API | Smoke cadence. |
| PLACE-006-US-007-TC-002 | Arabic partial search returns name matches | API, Arabic, Regression | High | Authenticated request. Multiple Arabic names contain `قهوة`. | `q=قهوة`. | 1. Send request. 2. Inspect results. | Status `200 OK`; every returned row has normalized Arabic place name containing `قهوة` or diacritic-folded equivalent. | PLACE-006-US-007 | Yes | API | Regression cadence. |
| PLACE-006-US-007-TC-003 | Arabic search UI renders RTL correctly | UI, Arabic, RTL, Accessibility | High | Valid session. Arabic result exists. | Search `قهوة`. | 1. Open `/places`. 2. Type `قهوة`. 3. Inspect field and rows. | Search input aligns text RTL; Arabic result names render without clipping, mojibake, or reversed character order. | PLACE-006-US-007 | Yes | UI E2E | Regression cadence. |
| PLACE-006-US-007-TC-004 | Arabic search no-mojibake regression | UI, Arabic, Localization | Critical | Valid session. Arabic fixtures exist. | Visible text after `q=قهوة`. | 1. Open `/places?q=قهوة`. 2. Scan visible text and response body. | No Unicode replacement character, mojibake sequence, or escaped Arabic code points appear in UI or API response. | PLACE-006-US-007 | Yes | UI E2E | Smoke cadence. |

## PLACE-006-US-008 - Support English search text

User Story Summary: As a user, I want English names searchable so that mixed catalog entries are findable.

Related Feature ID: `PLACE-006`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-006-US-008-TC-001 | English exact search returns matching place | API, Positive, Localization | High | Authenticated request. Place named `Malfa` exists. | `q=Malfa`. | 1. Send request. 2. Inspect results. | Status `200 OK`; `Malfa` appears in returned rows. | PLACE-006-US-008 | Yes | API | Smoke cadence. |
| PLACE-006-US-008-TC-002 | English search is case-insensitive | API, Validation, Regression | High | Authenticated request. Place named `Malfa` exists. | `q=malfa`, `q=MALFA`, `q=MaLfA`. | 1. Send each request. 2. Compare returned IDs. | Each response returns `200 OK`; returned IDs and `meta.total` are equivalent for case variants. | PLACE-006-US-008 | Yes | API | Regression cadence. |
| PLACE-006-US-008-TC-003 | English partial search returns name matches | API, Regression | Medium | Authenticated request. Place named `The Original Cheesecake Factory Restaurant & Bakery` exists. | `q=Cheesecake`. | 1. Send request. 2. Inspect results. | Status `200 OK`; matching English place appears; rows not matching by name are excluded. | PLACE-006-US-008 | Yes | API | Regression cadence. |
| PLACE-006-US-008-TC-004 | Long English search results remain contained | UI, Responsive, Mobile | High | Valid session. Long English result exists. | `q=Cheesecake`, viewport `320x568`. | 1. Set viewport. 2. Open `/places?q=Cheesecake`. 3. Inspect row. | Long English name wraps or clamps to allowed lines without horizontal overflow; `document.documentElement.scrollWidth <= window.innerWidth`. | PLACE-006-US-008 | Yes | UI E2E | Regression cadence. |

## PLACE-006-US-009 - Ignore Arabic diacritics in search

User Story Summary: As an Arabic user, I want search to ignore diacritics so that equivalent Arabic spellings return the same place.

Related Feature ID: `PLACE-006`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-006-US-009-TC-001 | Undiacritized query matches diacritized name | API, Arabic, Validation | Critical | Authenticated request. Place named `قَهْوَة` exists. | `q=قهوة`. | 1. Send request. 2. Inspect results. | Status `200 OK`; place named `قَهْوَة` is returned through diacritic folding. | PLACE-006-US-009 | Yes | API | Smoke cadence. |
| PLACE-006-US-009-TC-002 | Diacritized query matches undiacritized name | API, Arabic, Validation | Critical | Authenticated request. Place named `قهوة` exists. | `q=قَهْوَة`. | 1. Send request. 2. Inspect results. | Status `200 OK`; place named `قهوة` is returned through diacritic folding. | PLACE-006-US-009 | Yes | API | Smoke cadence. |
| PLACE-006-US-009-TC-003 | Diacritic folding preserves ranking | API, Arabic, Data Integrity | High | Authenticated request. Exact folded and contains folded matches exist. | `q=قَهْوَة`. | 1. Send request. 2. Inspect order. | Status `200 OK`; folded exact matches appear before folded starts-with and contains matches. | PLACE-006-US-009 | Yes | API | Regression cadence. |
| PLACE-006-US-009-TC-004 | Diacritic folding works with whitespace normalization | API, Arabic, Validation | Medium | Authenticated request. Place named `قهوة الرياض` exists. | `q=%20%20قَهْوَة%20%20الرياض%20`. | 1. Send request. 2. Inspect results. | Status `200 OK`; effective query matches `قهوة الرياض`; returned IDs match normalized undiacritized query. | PLACE-006-US-009 | Yes | API | Regression cadence. |
| PLACE-006-US-009-TC-005 | Diacritic search UI preserves readable Arabic | UI, Arabic, Accessibility | Medium | Valid session. Arabic result exists. | `قَهْوَة`. | 1. Type diacritized query. 2. Inspect input, URL, and result rows. | Input and URL retain valid encoded Arabic; UI displays readable Arabic text; no mojibake appears. | PLACE-006-US-009 | Yes | UI E2E | Regression cadence. |

## PLACE-006-US-010 - Support mixed Arabic/English search

User Story Summary: As a user, I want mixed-language names searchable so that real place names work.

Related Feature ID: `PLACE-006`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-006-US-010-TC-001 | English segment finds mixed-language place | API, Localization, Regression | High | Authenticated request. Place named `مطعم Five Guys` exists. | `q=Five%20Guys`. | 1. Send request. 2. Inspect results. | Status `200 OK`; `مطعم Five Guys` appears and every returned row matches by name. | PLACE-006-US-010 | Yes | API | Smoke cadence. |
| PLACE-006-US-010-TC-002 | Arabic segment finds mixed-language place | API, Arabic, Localization | High | Authenticated request. Place named `مطعم Five Guys` exists. | `q=مطعم`. | 1. Send request. 2. Inspect results. | Status `200 OK`; `مطعم Five Guys` appears when Arabic segment matches the name. | PLACE-006-US-010 | Yes | API | Regression cadence. |
| PLACE-006-US-010-TC-003 | Mixed-language row remains bidi-contained | UI, RTL, Responsive | High | Valid session. Mixed-language result exists. | `مطعم Five Guys فرع King Abdullah Financial District`, viewport `320x568`. | 1. Set viewport. 2. Search `Five Guys`. 3. Inspect row. | Arabic and English segments render in correct reading order; title is contained; no collision with artwork, metadata, or rating; no horizontal overflow. | PLACE-006-US-010 | Yes | UI E2E | Regression cadence. |
| PLACE-006-US-010-TC-004 | Mixed-language search is screen-reader readable | Accessibility, Screen Reader, RTL | Medium | Valid session. Mixed-language result exists. | Row accessible name. | 1. Search `Five Guys`. 2. Inspect accessibility tree. | Row link accessible name includes the mixed-language place name in a readable order and does not include decorative artwork text. | PLACE-006-US-010 | Yes | Accessibility | Regression cadence. |
| PLACE-006-US-010-TC-005 | Mixed-language query preserves active filters | Integration, UI, Regression | Medium | Valid session. Restaurant type active. | `/places?type=restaurant&q=Five%20Guys`. | 1. Open URL. 2. Inspect selected filter and rows. | Response status is `200 OK`; restaurant filter remains selected; returned rows match both mixed-language query and restaurant type. | PLACE-006-US-010 | Yes | UI E2E | Regression cadence. |

## PLACE-006-US-011 - Combine search with type filter

User Story Summary: As a user, I want search to respect the active type so that results stay relevant.

Related Feature ID: `PLACE-006`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-006-US-011-TC-001 | Restaurant search returns restaurant name matches only | API, Integration, Data Integrity | High | Authenticated request. Same query matches multiple types. | `GET /api/v1/places?type=restaurant&q=Casa`. | 1. Send request. 2. Inspect rows. | Status `200 OK`; every row has `type=restaurant` and name matches `Casa`; cafe and ice cream rows are excluded. | PLACE-006-US-011 | Yes | API | Smoke cadence. |
| PLACE-006-US-011-TC-002 | Cafe search returns cafe name matches only | API, Integration, Data Integrity | High | Authenticated request. Same query matches multiple types. | `GET /api/v1/places?type=cafe&q=Casa`. | 1. Send request. 2. Inspect rows. | Status `200 OK`; every row has `type=cafe` and name matches `Casa`; restaurant and ice cream rows are excluded. | PLACE-006-US-011 | Yes | API | Regression cadence. |
| PLACE-006-US-011-TC-003 | Ice cream search returns ice cream name matches only | API, Integration, Data Integrity | High | Authenticated request. Same query matches multiple types. | `GET /api/v1/places?type=ice_cream&q=Gelato`. | 1. Send request. 2. Inspect rows. | Status `200 OK`; every row has `type=ice_cream`, name matches `Gelato`, and `subtype=null`. | PLACE-006-US-011 | Yes | API | Regression cadence. |
| PLACE-006-US-011-TC-004 | Type-filtered search empty state is scoped | UI, Empty State, Regression | Medium | Valid session. Query matches cafe but restaurant filter is active. | `/places?type=restaurant&q=CafeOnly`. | 1. Open URL. 2. Inspect rows and empty state. | UI shows `لا توجد نتائج` for the active restaurant search and does not show cafe rows. | PLACE-006-US-011 | Yes | UI E2E | Regression cadence. |

## PLACE-006-US-012 - Combine search with subtype filter

User Story Summary: As a user, I want search to respect subtype so that filtered searches work.

Related Feature ID: `PLACE-006`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-006-US-012-TC-001 | Restaurant subtype search returns matching subtype only | API, Integration, Data Integrity | High | Authenticated request. Burger and non-burger restaurant names match query. | `GET /api/v1/places?type=restaurant&subtype=burger&q=House`. | 1. Send request. 2. Inspect rows. | Status `200 OK`; every row matches name query, `type=restaurant`, and `subtype=burger`. | PLACE-006-US-012 | Yes | API | Smoke cadence. |
| PLACE-006-US-012-TC-002 | Cafe subtype search returns matching subtype only | API, Integration, Data Integrity | High | Authenticated request. Coffee and tea names match query. | `GET /api/v1/places?type=cafe&subtype=coffee&q=Roast`. | 1. Send request. 2. Inspect rows. | Status `200 OK`; every row matches name query, `type=cafe`, and `subtype=coffee`; tea rows are excluded. | PLACE-006-US-012 | Yes | API | Regression cadence. |
| PLACE-006-US-012-TC-003 | UI preserves subtype while searching | UI, Integration, Regression | High | Valid session. Burger subtype selected. | `/places?type=restaurant&subtype=burger`, query `House`. | 1. Open URL. 2. Type query. 3. Inspect URL and active filters. | URL contains `type=restaurant&subtype=burger&q=House`; subtype remains visibly selected; response status is `200 OK`. | PLACE-006-US-012 | Yes | UI E2E | Regression cadence. |
| PLACE-006-US-012-TC-004 | Search with subtype pagination stays scoped | API, Data Integrity, Regression | Medium | Authenticated request. More than one page of burger matches exists. | `type=restaurant&subtype=burger&q=a&limit=10`. | 1. Request offsets `0` and `10`. 2. Inspect combined rows. | Each response returns `200 OK`; no duplicate IDs; every row matches query and selected subtype across pages. | PLACE-006-US-012 | Yes | API | Regression cadence. |
| PLACE-006-US-012-TC-005 | Invalid subtype with search returns validation error | API, Validation, Negative | High | Authenticated request. | `GET /api/v1/places?type=cafe&subtype=burger&q=House`. | 1. Send request. 2. Inspect error. | Status `422 Validation Error`; no place data returned; error payload contains no private data or stack trace. | PLACE-006-US-012 | Yes | API | Regression cadence. |

## PLACE-006-US-013 - Preserve search in URL

User Story Summary: As a user, I want search state preserved so that refresh/back keeps my context.

Related Feature ID: `PLACE-006`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-006-US-013-TC-001 | Search writes encoded q to URL | UI, Integration, Regression | High | Valid session. Places page loaded. | `Malfa`. | 1. Type `Malfa`. 2. Inspect URL. | URL contains `q=Malfa`; visible search input contains `Malfa`; request returns `200 OK`. | PLACE-006-US-013 | Yes | UI E2E | Smoke cadence. |
| PLACE-006-US-013-TC-002 | Refresh restores search query | UI, Regression | High | Valid session. Search URL loaded. | `/places?q=Malfa`. | 1. Open URL. 2. Refresh browser. | Search input contains `Malfa`; request includes `q=Malfa`; results match the query after refresh. | PLACE-006-US-013 | Yes | UI E2E | Regression cadence. |
| PLACE-006-US-013-TC-003 | Browser back restores previous search state | UI, Regression | Medium | Valid session. Browser history available. | Search `Malfa`, then `Casa`. | 1. Search `Malfa`. 2. Search `Casa`. 3. Press Back. | URL and input restore `q=Malfa`; visible rows match `Malfa`; no stale `Casa` rows remain. | PLACE-006-US-013 | Yes | UI E2E | Regression cadence. |
| PLACE-006-US-013-TC-004 | Browser forward restores later search state | UI, Regression | Medium | Valid session. Browser history contains two searches. | Back from `Casa` to `Malfa`. | 1. After TC-003 state, press Forward. | URL and input restore `q=Casa`; visible rows match `Casa`; no stale `Malfa` rows remain. | PLACE-006-US-013 | Yes | UI E2E | Regression cadence. |
| PLACE-006-US-013-TC-005 | Arabic search URL is encoded and restored | UI, Arabic, Integration | High | Valid session. Arabic result exists. | `/places?q=قهوة`. | 1. Open encoded Arabic search URL. 2. Refresh. 3. Inspect input and rows. | Input displays `قهوة`; request uses valid URL-encoded `q`; Arabic results render without mojibake. | PLACE-006-US-013 | Yes | UI E2E | Regression cadence. |

## PLACE-006-US-014 - Show search no-results

User Story Summary: As a user, I want a clear no-results state so that I can recover.

Related Feature ID: `PLACE-006`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-006-US-014-TC-001 | Search no-results shows deterministic copy | Empty State, UI, UX | Medium | Valid session. Query matches no place names. | `q=zzzz-no-match`. | 1. Open `/places?q=zzzz-no-match`. 2. Wait for response. | Response status is `200 OK` with `data=[]`; UI shows exactly `لا توجد نتائج`. | PLACE-006-US-014 | Yes | UI E2E | Smoke cadence. |
| PLACE-006-US-014-TC-002 | Search no-results offers clear-search action | Empty State, UI, Accessibility | Medium | Valid session. No-results state visible. | `q=zzzz-no-match`. | 1. Inspect empty-state action. 2. Measure target size. | A clear-search action is present with accessible name `مسح البحث` and at least `44x44` CSS pixel target. | PLACE-006-US-014 | Yes | Accessibility | Regression cadence. |
| PLACE-006-US-014-TC-003 | Clear-search action removes q and preserves filters | UI, Integration | Medium | Valid session. Search no-results with restaurant filter. | `/places?type=restaurant&q=zzzz-no-match`. | 1. Activate clear-search action. 2. Inspect URL/request. | URL becomes `/places?type=restaurant`; request returns `200 OK`; restaurant filter remains active. | PLACE-006-US-014 | Yes | UI E2E | Regression cadence. |
| PLACE-006-US-014-TC-004 | No-results is not shown during loading | Loading State, UI, Regression | Medium | Valid session. Delayed search request. | `q=zzzz-no-match`. | 1. Type query. 2. Hold response. 3. Observe pending state. | Loading state appears first; `لا توجد نتائج` appears only after successful empty response. | PLACE-006-US-014 | Yes | UI E2E | Regression cadence. |
| PLACE-006-US-014-TC-005 | No-results state is announced accessibly | Accessibility, Screen Reader, Empty State | Medium | Valid session. No-results state visible. | `لا توجد نتائج`. | 1. Trigger no-results search. 2. Inspect live region/status behavior. | No-results transition is announced through a status region with `role=status` and `aria-live=polite`; focus remains on the search input. | PLACE-006-US-014 | Yes | Accessibility | Regression cadence. |
| PLACE-006-US-014-TC-006 | No-results state remains responsive | Responsive, Mobile, Empty State | Medium | Valid session. No-results state visible. | Viewports `320x568`, `390x844`, `430x932`, landscape `844x390`. | 1. Open no-results URL in each viewport. 2. Evaluate layout. | For each viewport, message and action are visible above bottom navigation/safe area and `document.documentElement.scrollWidth <= window.innerWidth`. | PLACE-006-US-014 | Yes | UI E2E | Regression cadence. |

## PLACE-006-US-015 - Keep search control accessible and compact

User Story Summary: As a mobile and keyboard user, I want search usable without layout overflow.

Related Feature ID: `PLACE-006`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-006-US-015-TC-001 | Search input has accessible label | Accessibility, UI | Critical | Valid session. Places page loaded. | Search input. | 1. Inspect accessibility tree. | Search input has programmatic accessible name equivalent to `ابحث عن مكان`; placeholder text is not the only accessible name source. | PLACE-006-US-015 | Yes | Accessibility | Smoke cadence. |
| PLACE-006-US-015-TC-002 | Search input target is at least 44 by 44 | Accessibility, Mobile, UI | High | Valid session. | Search input at mobile viewport. | 1. Set viewport `320x568`. 2. Measure input bounding box. | Search input interactive target is at least `44x44` CSS pixels. | PLACE-006-US-015 | Yes | Accessibility | Regression cadence. |
| PLACE-006-US-015-TC-003 | Keyboard user can type search without pointer input | Keyboard, Accessibility, UI | High | Valid session. Keyboard only. | Query `Malfa`. | 1. Tab to search input. 2. Type query. 3. Wait for the same search trigger used by pointer users. | Search runs without pointer input; focus remains visible; results update for `q=Malfa`. | PLACE-006-US-015 | Yes | Accessibility | Regression cadence. |
| PLACE-006-US-015-TC-004 | Clear search is keyboard accessible | Keyboard, Accessibility, UI | High | Valid session. Search text exists. | `q=Malfa`. | 1. Tab to clear control. 2. Press Enter or Space. | Search text clears; `q` is removed from URL; focus remains on or returns to search input with visible focus. | PLACE-006-US-015 | Yes | Accessibility | Regression cadence. |
| PLACE-006-US-015-TC-005 | Search has no horizontal overflow on mobile matrix | Responsive, Mobile, UI | Critical | Valid session. | Viewports `320x568`, `390x844`, `430x932`. | 1. Open `/places?q=Cheesecake` in each viewport. 2. Evaluate no-overflow assertion. | For each viewport, `document.documentElement.scrollWidth <= window.innerWidth`; input, clear control, rows, and bottom navigation remain contained. | PLACE-006-US-015 | Yes | UI E2E | Smoke cadence. |
| PLACE-006-US-015-TC-006 | Search works at 200 percent zoom | Responsive, Accessibility, UI | High | Valid session. Browser zoom or synthetic pressure represents 200% zoom. | `/places?q=Malfa`. | 1. Apply 200% zoom/adaptive pressure. 2. Type and clear search. 3. Evaluate layout. | Search remains operable; no input, clear control, row, or bottom navigation overlap occurs; no horizontal overflow. | PLACE-006-US-015 | Yes | UI E2E | Regression cadence. |
| PLACE-006-US-015-TC-007 | Focus-visible is measurable on search controls | Accessibility, Keyboard, UI | High | Valid session. Keyboard only. | Search input and clear control. | 1. Tab to search input. 2. Type query. 3. Tab to clear control. | Focus indicator is visible with at least 2 CSS pixel outline, contrast ratio at least 3:1 against adjacent colors, and no clipping. | PLACE-006-US-015 | Yes | Accessibility | Regression cadence. |
| PLACE-006-US-015-TC-008 | Search result count update is announced | Accessibility, Screen Reader, UI | High | Valid session. Search returns multiple rows. | `q=Malfa`. | 1. Type query. 2. Inspect live region or status announcement after results load. | Assistive technology receives a polite status update indicating search results changed; focus remains in the search input unless the user moves it. | PLACE-006-US-015 | Yes | Accessibility | Regression cadence. |
| PLACE-006-US-015-TC-009 | Search controls remain visible in forced-colors mode | Accessibility, UI | Medium | Valid session. Browser supports forced-colors/high-contrast mode. | `/places?q=Malfa`. | 1. Enable forced-colors mode. 2. Inspect search input, clear control, focused state, and rows. | Search input boundary, text, clear control, focus indicator, and row links remain visible; selected/active states do not rely on color alone. | PLACE-006-US-015 | Yes | Accessibility | Nightly cadence. |
| PLACE-006-US-015-TC-010 | Search remains functional with reduced motion | Accessibility, UI, Regression | Medium | Valid session. `prefers-reduced-motion: reduce` is active. | `/places?q=Malfa`. | 1. Enable reduced-motion mode. 2. Type and clear search. 3. Observe state changes. | Search, loading, empty, and result transitions remain understandable; no critical information depends on animation. | PLACE-006-US-015 | Yes | Accessibility | Regression cadence. |
| PLACE-006-US-015-TC-011 | Landscape search layout remains contained | Responsive, Mobile, UI | High | Valid session. Landscape mobile viewport. | `844x390`, `/places?q=Cheesecake`. | 1. Set viewport. 2. Open URL. 3. Inspect search, rows, and bottom navigation. | Search input and rows remain visible above bottom navigation/safe area; no horizontal overflow; final visible row is not obscured. | PLACE-006-US-015 | Yes | UI E2E | Regression cadence. |
| PLACE-006-US-015-TC-012 | Mobile keyboard does not obscure search recovery controls | Responsive, Mobile, Accessibility | High | Valid session on mobile viewport. Search input focused and no-results state visible. | `390x844`, query `zzzz-no-match`. | 1. Focus search input. 2. Trigger virtual keyboard. 3. Inspect empty-state action and clear control. | Search input, clear control, and no-results recovery action remain reachable without horizontal scrolling; bottom navigation and safe-area padding do not obscure final interactive element. | PLACE-006-US-015 | Yes | UI E2E | Nightly cadence. |
| PLACE-006-US-015-TC-013 | Manual Arabic RTL screen-reader review | Accessibility, Arabic, RTL, Screen Reader | Medium | Valid session. Real assistive technology available. | Arabic query `قهوة`, mixed row `مطعم Five Guys`. | 1. Search Arabic query. 2. Navigate rows using VoiceOver/WebKit and NVDA/Firefox or NVDA/Chromium. 3. Review pronunciation and reading order. | Search field label, result updates, and mixed Arabic/English row names are understandable; no mojibake or reversed reading order is heard. | PLACE-006-US-015 | No | Manual | Manual Review cadence. |

## PLACE-006-US-016 - Rank exact matches first

User Story Summary: As a user, I want exact name matches first so that known-place search is fast.

Related Feature ID: `PLACE-006`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-006-US-016-TC-001 | Exact normalized match appears before starts-with | API, Data Integrity, Regression | High | Authenticated request. Names `Malfa` and `Malfa Bakery` exist. | `GET /api/v1/places?q=Malfa`. | 1. Send request. 2. Inspect order. | Status `200 OK`; normalized exact `Malfa` appears before `Malfa Bakery`. | PLACE-006-US-016 | Yes | API | Smoke cadence. |
| PLACE-006-US-016-TC-002 | Exact match appears before contains match | API, Data Integrity, Regression | High | Authenticated request. Names `Malfa` and `Cafe Malfa` exist. | `q=Malfa`. | 1. Send request. 2. Inspect order. | Status `200 OK`; exact match appears before contains match. | PLACE-006-US-016 | Yes | API | Regression cadence. |
| PLACE-006-US-016-TC-003 | Exact-match group uses rating tie-breaks | API, Data Integrity | Medium | Authenticated request. Multiple exact normalized duplicate names exist with different ratings/counts. | `q=Malfa`. | 1. Send request. 2. Inspect exact-match group order. | Status `200 OK`; within exact-match rank group, rows sort by `averageRating DESC NULLS LAST`, then `ratingCount DESC`, then normalized name ASC. | PLACE-006-US-016 | Yes | API | Regression cadence. |
| PLACE-006-US-016-TC-004 | UI displays exact match before weaker matches | UI, Regression | Medium | Valid session. Exact and weaker matches exist. | `/places?q=Malfa`. | 1. Open URL. 2. Inspect first rows. | First visible result is normalized exact match before starts-with and contains matches. | PLACE-006-US-016 | Yes | UI E2E | Regression cadence. |

## PLACE-006-US-017 - Rank starts-with before contains

User Story Summary: As a user, I want stronger textual matches ranked higher so that results feel predictable.

Related Feature ID: `PLACE-006`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-006-US-017-TC-001 | Starts-with match appears before contains match | API, Data Integrity, Regression | High | Authenticated request. Names `Malfa House` and `Cafe Malfa` exist. | `q=Malfa`. | 1. Send request. 2. Inspect order. | Status `200 OK`; starts-with match appears before contains match. | PLACE-006-US-017 | Yes | API | Smoke cadence. |
| PLACE-006-US-017-TC-002 | Starts-with group uses rating tie-breaks | API, Data Integrity | Medium | Authenticated request. Multiple starts-with names exist with different ratings/counts. | `q=Malfa`. | 1. Send request. 2. Inspect starts-with group. | Status `200 OK`; within starts-with group, rows sort by rating, rating count, then normalized name. | PLACE-006-US-017 | Yes | API | Regression cadence. |
| PLACE-006-US-017-TC-003 | Contains group does not jump ahead due to rating | API, Data Integrity | High | Authenticated request. Contains match has higher rating than starts-with match. | `q=Malfa`. | 1. Send request. 2. Inspect order. | Status `200 OK`; starts-with match remains before higher-rated contains match; rating is only tie-breaker within same rank group. | PLACE-006-US-017 | Yes | API | Regression cadence. |
| PLACE-006-US-017-TC-004 | Ranking remains stable after refresh | UI, Regression | Medium | Valid session. Starts-with and contains matches exist. | `/places?q=Malfa`. | 1. Open URL. 2. Record first five IDs. 3. Refresh. | After refresh, first five IDs remain in the same order while fixture data is unchanged. | PLACE-006-US-017 | Yes | UI E2E | Regression cadence. |

## PLACE-006-US-018 - Normalize punctuation in search

User Story Summary: As a user, I want punctuation differences ignored where safe so that names remain findable.

Related Feature ID: `PLACE-006`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-006-US-018-TC-001 | Hyphen differences are normalized | API, Validation, Regression | High | Authenticated request. Place named `Shake-Shack` exists. | `q=Shake%20Shack`. | 1. Send request. 2. Inspect results. | Status `200 OK`; `Shake-Shack` is returned through safe punctuation normalization. | PLACE-006-US-018 | Yes | API | Regression cadence. |
| PLACE-006-US-018-TC-002 | Apostrophe differences are normalized | API, Validation, Regression | High | Authenticated request. Place named `Joe's Cafe` exists. | `q=Joes%20Cafe`. | 1. Send request. 2. Inspect results. | Status `200 OK`; `Joe's Cafe` is returned; apostrophe does not cause SQL or escaping errors. | PLACE-006-US-018 | Yes | API | Regression cadence. |
| PLACE-006-US-018-TC-003 | Period differences are normalized | API, Validation, Regression | Medium | Authenticated request. Place named `Dr. Coffee` exists. | `q=Dr%20Coffee`. | 1. Send request. 2. Inspect results. | Status `200 OK`; `Dr. Coffee` is returned through punctuation normalization. | PLACE-006-US-018 | Yes | API | Regression cadence. |
| PLACE-006-US-018-TC-004 | Repeated separators normalize safely | API, Validation | Medium | Authenticated request. Place named `Casa - Nonna` exists. | `q=Casa%20Nonna`. | 1. Send request. 2. Inspect results. | Status `200 OK`; repeated separators do not prevent matching and do not expand beyond name matches. | PLACE-006-US-018 | Yes | API | Regression cadence. |
| PLACE-006-US-018-TC-005 | Punctuation normalization does not enable wildcard expansion | Security, API, Validation | Critical | Authenticated request. Catalog has many names and no literal name match for the query. | `q=.%25_%27`. | 1. Send request. 2. Inspect result count and errors. | Status `200 OK`; `data=[]`; response never returns full catalog through wildcard or injection behavior and exposes no SQL, stack trace, tokens, cookies, or private fields. | PLACE-006-US-018 | Yes | Security | Smoke cadence. |

## PLACE-006-US-019 - Reject invalid search query payloads

User Story Summary: As the system, I want invalid query values rejected predictably so that search remains safe.

Related Feature ID: `PLACE-006`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-006-US-019-TC-001 | Duplicate q parameters are rejected | API, Validation, Negative | High | Authenticated request. | `GET /api/v1/places?q=Malfa&q=Casa`. | 1. Send request. 2. Inspect response. | Status `422 Validation Error`; API does not silently choose one query; no place data returned. | PLACE-006-US-019 | Yes | API | Regression cadence. |
| PLACE-006-US-019-TC-002 | Malformed encoded query is rejected safely | API, Validation, Negative | High | Authenticated request. | `GET /api/v1/places?q=%E0%A4%A`. | 1. Send malformed request. 2. Inspect response. | Status `422 Validation Error`; no place data, SQL, stack trace, tokens, cookies, or private fields are returned. | PLACE-006-US-019 | Yes | API | Regression cadence. |
| PLACE-006-US-019-TC-003 | Non-string structured q is rejected | API, Validation, Negative | High | Authenticated request. Test client can send array/object style query. | `q[]=Malfa` and repeated bracket query syntax. | 1. Send request. 2. Inspect response. | Status `422 Validation Error`; no data array is returned; error points to invalid `q`. | PLACE-006-US-019 | Yes | API | Regression cadence. |
| PLACE-006-US-019-TC-004 | Emoji-only query is treated as literal name search | API, Edge, Validation | Medium | Authenticated request. No place name contains `🍔`. | `q=🍔`. | 1. Send request. 2. Inspect response. | Status `200 OK`; `data=[]`; behavior is deterministic and no internal errors, stack traces, or private data are exposed. | PLACE-006-US-019 | Yes | API | Regression cadence. |
| PLACE-006-US-019-TC-005 | Invalid search UI renders exact validation recovery state | UI, Error Handling, Security | Medium | Valid session. Browser can open invalid URL. | `/places?q=%E0%A4%A`. | 1. Open URL. 2. Observe UI. | UI shows a validation error state with a clear-search or reset action; no stale rows are presented as valid results; URL can recover to `/places`; no debug details or private data appear. | PLACE-006-US-019 | Yes | UI E2E | Regression cadence. |
| PLACE-006-US-019-TC-006 | XSS-like search string is escaped in UI and API | Security, API, UI, Negative | Critical | Authenticated request. No place name contains literal `<script>alert(1)</script>`. | `q=%3Cscript%3Ealert(1)%3C%2Fscript%3E`. | 1. Send API request. 2. Open `/places?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E`. 3. Inspect DOM and response. | API returns `200 OK` with literal name-search behavior and no private data; UI renders query as text only, no script executes, and no unsafe HTML is inserted. | PLACE-006-US-019 | Yes | Security | Smoke cadence. |
| PLACE-006-US-019-TC-007 | Every 422 search error excludes sensitive fields | Security, Privacy, API, Regression | Critical | Authenticated request. Internal private data exists. | Invalid query matrix: 121 chars, malformed encoding, duplicate `q`, structured `q[]`. | 1. Send each invalid request. 2. Recursively inspect each error payload. | Each invalid request returns `422 Validation Error`; no payload includes private notes, private list membership, creator identity, moderation fields, SQL, stack traces, tokens, cookies, or environment values. | PLACE-006-US-019 | Yes | API | Smoke cadence. |

## PLACE-006-US-020 - Preserve search rank across continuous scrolling

User Story Summary: As a user, I want later search pages to continue the same ordering so that scrolling does not reshuffle results.

Related Feature ID: `PLACE-006`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-006-US-020-TC-001 | Search rank is stable across API offsets | API, Data Integrity, Regression | High | Authenticated request. More than three pages match query. | `q=a`, `limit=10`, offsets `0`, `10`, `20`. | 1. Request pages. 2. Concatenate IDs. 3. Compare against full expected rank. | Each response returns `200 OK`; combined order preserves exact, starts-with, contains, then rating/name tie-break order across offsets. | PLACE-006-US-020 | Yes | API | Smoke cadence. |
| PLACE-006-US-020-TC-002 | Continuous scroll appends without reshuffling existing rows | UI, Regression, Data Integrity | High | Valid session. More than two pages match query. | `/places?q=a`. | 1. Open URL. 2. Record initial visible IDs. 3. Scroll to load next page. | Initial IDs remain in the same relative order; new page appends without duplicate IDs or reshuffling. | PLACE-006-US-020 | Yes | UI E2E | Regression cadence. |
| PLACE-006-US-020-TC-003 | Out-of-order search page responses do not corrupt order | Concurrency, Data Integrity, UI | High | Valid session. Test can delay network responses. | Delayed offset `10`, faster offset `20`. | 1. Trigger loading of pages. 2. Return later offset before earlier offset. 3. Observe final list. | Final rendered list order follows server offset order, not response arrival order; no duplicate or missing IDs appear. | PLACE-006-US-020 | Yes | UI E2E | Nightly cadence. |
| PLACE-006-US-020-TC-004 | Incremental search load failure preserves loaded results | Error Handling, UI, Regression | Medium | Valid session. First page loaded. Next page fails with `500`. | `/places?q=a`, second page `500`. | 1. Scroll to load next page. 2. Force failure. 3. Inspect UI. | Existing search results remain visible; inline retry for next page appears; query and filters remain unchanged. | PLACE-006-US-020 | Yes | UI E2E | Regression cadence. |
| PLACE-006-US-020-TC-005 | Retrying incremental search load uses same query and offset | Error Handling, API, UI | Medium | Valid session. Incremental load failed. | Retry after failed offset `10`. | 1. Activate retry. 2. Inspect request. | Retry request returns `200 OK` and uses same normalized `q`, same filters, and failed `offset`; appended rows preserve order. | PLACE-006-US-020 | Yes | UI E2E | Regression cadence. |
| PLACE-006-US-020-TC-006 | Virtualized search list keeps accessible row links | Accessibility, Performance, UI | Medium | Valid session. Large search result set uses virtualization. | `/places?q=a`, more than 100 results. | 1. Scroll through virtualized list. 2. Inspect focused/visible rows. | Visible rows have semantic links and accessible names; virtualization does not create duplicate focus stops or remove focused row unexpectedly. | PLACE-006-US-020 | Yes | Accessibility | Nightly cadence. |
| PLACE-006-US-020-TC-007 | Large search API returns within performance budget | Performance, API, Regression | High | Authenticated request. Catalog fixture has at least 1,000 places and indexed normalized names. | `GET /api/v1/places?q=a&limit=20&offset=0`. | 1. Send request under controlled test environment. 2. Measure server response time excluding network latency. | Status `200 OK`; p95 server response time for the fixture is at or below 500 ms; response preserves search rank and metadata. | PLACE-006-US-020 | Yes | Performance | Nightly cadence. |
| PLACE-006-US-020-TC-008 | Search input remains responsive during large result rendering | Performance, UI, Regression | High | Valid session. Large search result set and virtualization enabled. | `/places?q=a`, more than 1,000 matches. | 1. Type in search input while results render. 2. Measure input-to-paint delay in test harness. | Search input remains editable; p95 input-to-visible-update delay is at or below 200 ms in the controlled browser fixture; no long task over 500 ms blocks typing. | PLACE-006-US-020 | Yes | Performance | Nightly cadence. |
| PLACE-006-US-020-TC-009 | Similar names keep deterministic order across pages | API, Data Integrity, Regression | High | Authenticated request. Similar names exist: `Malfa`, `Malfa Riyadh`, `Al Malfa`, `Malfa-2`. | `q=Malfa`, `limit=2`, offsets `0`, `2`. | 1. Request both pages. 2. Concatenate IDs. 3. Repeat request sequence. | Each response returns `200 OK`; combined order is deterministic across repeated runs and follows exact, starts-with, contains, then rating/name tie-breaks. | PLACE-006-US-020 | Yes | API | Regression cadence. |

## PLACE-006-US-021 - Recover from search request failure

User Story Summary: As a user, I want to retry failed searches without losing the query.

Related Feature ID: `PLACE-006`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-006-US-021-TC-001 | Search 500 error preserves query and filters | Error Handling, UI, Regression | High | Valid session. Search request fails with `500`. | `/places?type=restaurant&q=Malfa`. | 1. Open URL. 2. Force API `500`. 3. Inspect UI. | Error state appears; search input still contains `Malfa`; restaurant filter remains active; no stale rows are shown as current results. | PLACE-006-US-021 | Yes | UI E2E | Smoke cadence. |
| PLACE-006-US-021-TC-002 | Retry resubmits same normalized search | Error Handling, UI, API | High | Valid session. Error state visible. | Query `  Casa   Nonna  ` normalized to `Casa Nonna`. | 1. Activate retry. 2. Inspect request. | Retry request returns `200 OK` and uses `q=Casa%20Nonna` with the same active filters and pagination reset to first page. | PLACE-006-US-021 | Yes | UI E2E | Regression cadence. |
| PLACE-006-US-021-TC-003 | Network failure search state is announced | Accessibility, Error Handling, Screen Reader | Medium | Valid session. Network request fails. | Search `Malfa`. | 1. Trigger network failure. 2. Inspect live region/status announcement. | Error transition is announced through accessible status/alert behavior; retry action has accessible name and visible focus. | PLACE-006-US-021 | Yes | Accessibility | Regression cadence. |
| PLACE-006-US-021-TC-004 | Session expiry during search clears protected data | Authentication, Authorization, Privacy, UI | Critical | Valid session begins search, then auth expires before completion. | Search request returns `401 Unauthorized`. | 1. Start search. 2. Expire session. 3. Observe UI. | UI removes protected rows, shows auth recovery/login state, and never leaves stale private or protected search data visible. | PLACE-006-US-021 | Yes | UI E2E | Smoke cadence. |
| PLACE-006-US-021-TC-005 | Search error state remains responsive | Responsive, Mobile, Error Handling | Medium | Valid session. Search error state visible. | `320x568`, `390x844`, 200% zoom. | 1. Render error state in each viewport/zoom. 2. Evaluate layout and retry action. | Error message and retry action remain visible above bottom navigation/safe area; retry target is at least `44x44`; no horizontal overflow. | PLACE-006-US-021 | Yes | UI E2E | Regression cadence. |
| PLACE-006-US-021-TC-006 | Rapid typing renders only the latest query | Concurrency, UI, Regression | High | Valid session. Network interception can delay responses. | Type sequence `M`, `Ma`, `Mal`, `Malf`, `Malfa`. | 1. Type the sequence rapidly. 2. Delay earlier responses. 3. Return latest response first and older responses later. | Final input, URL, and rendered rows correspond to `q=Malfa`; stale responses for earlier queries do not overwrite current results. | PLACE-006-US-021 | Yes | UI E2E | Smoke cadence. |
| PLACE-006-US-021-TC-007 | Cancelled search request does not show an error | Concurrency, Error Handling, UI | High | Valid session. Search request can be aborted by new query. | Start `q=Mal`, then immediately change to `q=Malfa`. | 1. Type `Mal`. 2. Type `Malfa` before first request completes. 3. Abort or cancel first request. | UI does not show an error for the cancelled `Mal` request; latest `Malfa` results render after successful response. | PLACE-006-US-021 | Yes | UI E2E | Regression cadence. |
| PLACE-006-US-021-TC-008 | Debounced search sends bounded request count | Concurrency, Performance, UI | Medium | Valid session. Implementation uses debounced or live search trigger. | Rapidly type `Malfa` within one second. | 1. Clear network log. 2. Type `Malfa` rapidly. 3. Count search requests. | No more than one request is sent per distinct typed value, no more than one final `q=Malfa` request is sent, only the final completed query is rendered, and no duplicate identical final request is sent. | PLACE-006-US-021 | Yes | UI E2E | Nightly cadence. |

## Final Summary

1. User stories processed: 21
2. Total test cases generated: 124
3. Duplicate test case IDs: 0
4. Invalid story references: 0
5. Missing user stories: 0
6. Encoding/mojibake findings: 0
7. API tests missing status codes: 0

### Test Count Per User Story

| User Story ID | Test Case Count |
|---|---:|
| PLACE-006-US-001 | 11 |
| PLACE-006-US-002 | 5 |
| PLACE-006-US-003 | 4 |
| PLACE-006-US-004 | 5 |
| PLACE-006-US-005 | 6 |
| PLACE-006-US-006 | 5 |
| PLACE-006-US-007 | 4 |
| PLACE-006-US-008 | 4 |
| PLACE-006-US-009 | 5 |
| PLACE-006-US-010 | 5 |
| PLACE-006-US-011 | 4 |
| PLACE-006-US-012 | 5 |
| PLACE-006-US-013 | 5 |
| PLACE-006-US-014 | 6 |
| PLACE-006-US-015 | 13 |
| PLACE-006-US-016 | 4 |
| PLACE-006-US-017 | 4 |
| PLACE-006-US-018 | 5 |
| PLACE-006-US-019 | 7 |
| PLACE-006-US-020 | 9 |
| PLACE-006-US-021 | 8 |

### Count By Test Type

| Test Type | Count |
|---|---:|
| API | 65 |
| Accessibility | 19 |
| Arabic | 13 |
| Authentication | 3 |
| Authorization | 3 |
| Boundary | 5 |
| Concurrency | 4 |
| Contract | 3 |
| Data Integrity | 22 |
| Edge | 1 |
| Empty State | 7 |
| Error Handling | 9 |
| Integration | 14 |
| Keyboard | 3 |
| Loading State | 2 |
| Localization | 5 |
| Mobile | 7 |
| Negative | 11 |
| Performance | 4 |
| Positive | 2 |
| Privacy | 6 |
| Regression | 42 |
| Responsive | 8 |
| RTL | 4 |
| Screen Reader | 5 |
| Security | 13 |
| UI | 57 |
| UX | 3 |
| Validation | 27 |

### Count By Priority

| Priority | Count |
|---|---:|
| Critical | 22 |
| High | 63 |
| Medium | 39 |
| Low | 0 |

### Count By Automation Layer

| Automation Layer | Count |
|---|---:|
| API | 57 |
| Accessibility | 14 |
| Manual | 1 |
| Performance | 2 |
| Security | 3 |
| UI E2E | 47 |

### Count By Automation Cadence

| Cadence | Count |
|---|---:|
| Smoke | 35 |
| Regression | 81 |
| Nightly | 7 |
| Manual Review | 1 |

### Top Automation Candidates

| Test Case ID | Reason |
|---|---|
| PLACE-006-US-001-TC-002 | Core name-only search contract and data integrity. |
| PLACE-006-US-002-TC-004 | Private notes must never influence search. |
| PLACE-006-US-005-TC-002 | Search length protection is an API guardrail. |
| PLACE-006-US-006-TC-005 | SQL-like search text safety. |
| PLACE-006-US-009-TC-001 | Arabic diacritic folding is product-critical. |
| PLACE-006-US-019-TC-006 | XSS-like search text must be escaped in UI and API. |
| PLACE-006-US-011-TC-001 | Search and primary type filter combination. |
| PLACE-006-US-012-TC-001 | Search and subtype filter combination. |
| PLACE-006-US-015-TC-005 | Mobile no-overflow certification. |
| PLACE-006-US-015-TC-008 | Search result count live-region announcement. |
| PLACE-006-US-020-TC-001 | Rank stability across offsets. |
| PLACE-006-US-020-TC-007 | Large search API performance budget. |
| PLACE-006-US-021-TC-004 | Session expiry privacy behavior during search. |
| PLACE-006-US-021-TC-006 | Rapid typing latest-query-wins behavior. |

### Manual-Only Tests

| Test Case ID | Reason |
|---|---|
| PLACE-006-US-015-TC-013 | Real Arabic RTL screen-reader pronunciation and mixed-language reading order require human assistive-technology review before major releases. |

### Remaining Assumptions Or Questions

- Query maximum length is 120 characters after normalization, per `PLACES_USER_STORIES.md`.
- Emoji-only, backslash-containing, wildcard-like, SQL-like, and XSS-like string queries are treated as literal name searches and return `200 OK` unless they exceed validation limits or are malformed at the URL encoding layer.
- The exact debounce duration is not specified in the user stories; tests assert observable behavior: latest query wins, cancelled requests do not show errors, and stale responses do not overwrite current results.
