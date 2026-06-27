# Places User Stories

Source of truth:

- `docs/feature-map/FEATURE_MAP.md`
- `docs/feature-map/FEATURE_CATALOG.md`
- `docs/feature-map/FEATURE_TREE.md`
- `docs/feature-map/FEATURE_TRACEABILITY.md`

Scope: Places module features `PLACE-001` through `PLACE-016`.

Out of scope for this file:

- `PLACE-017` through `PLACE-020` belong to the Place Details module and are covered in `docs/user-stories/PLACE_DETAILS_USER_STORIES.md`.
- Rating save/edit business rules belong to `docs/user-stories/RATINGS_USER_STORIES.md`.
- Add/remove list membership business rules belong to `docs/user-stories/LISTS_USER_STORIES.md`.

Total features processed: 16
Total user stories written: 186

## Shared Places Business Rules

- Places require authentication for browse, search, filtering, creation, and detail navigation.
- Place types are exactly `restaurant`, `cafe`, and `ice_cream`.
- Restaurant subtypes are exactly `burger`, `italian`, `american`, `steak`, `grill`, `shawarma`, `saudi`, `gulf`, `indian`, `asian`, `seafood`, `breakfast`, `healthy`, and `other`.
- Cafe subtypes are exactly `coffee` and `tea`.
- Ice cream places must not have a subtype.
- Place name is required, canonicalized by trimming and collapsing internal whitespace, and limited to 120 characters.
- Place normalized name is globally unique after canonicalization, lowercase normalization, and approved Arabic diacritic folding.
- Arabic diacritics must be ignored for search and normalized-name duplicate matching; for example `قهوة` and `قَهْوَة` are equivalent.
- Description is optional backend metadata, null when omitted or blank, limited to 1000 characters, supported by API, not required in current UI, and available for future product features.
- `GET /api/v1/places` returns `{ data, meta }` with `meta.limit`, `meta.offset`, `meta.total`, and `meta.sort`.
- `POST /api/v1/places` returns `201 Created` with `id`, `name`, `normalizedName`, `type`, `subtype`, `description`, `averageRating`, `ratingCount`, `createdAt`, and `updatedAt`.
- `POST /api/v1/places` returns `401 Unauthorized` for guests, `422 Validation Error` for invalid input, and `409 Conflict` with error code `DUPLICATE_PLACE_NAME` for duplicate normalized names.
- `limit` must be between 1 and 100. `offset` must be 0 or greater.
- Places are shared catalog records. The creator does not own the place, receives no special edit/delete rights, and future correction/duplicate-resolution workflows belong to admin moderation.
- Search query `q` is place-name only, canonicalized by trimming/collapsing whitespace, Arabic diacritic folding, punctuation normalization, and mixed Arabic/English matching; it is limited to 120 characters and never expands to location, recommendation, category discovery, or popularity search.
- Search ranking order is exact normalized match, starts-with normalized match, contains normalized match, then default catalog sort as tie-breaker.
- Primary browsing uses search, filtering, continuous scrolling, and virtualization; a manual Load More control is not required.
- Continuous scrolling must load next pages incrementally, prevent duplicate rows across pages, announce loading state, preserve stable ordering, expose end-of-results state, and allow retry of failed incremental loads without clearing already loaded results.
- Default sort is `rating_desc`: `averageRating DESC NULLS LAST`, then `ratingCount DESC`, then normalized place name ascending.
- Ratings and counts use Western digits and LTR numeric isolation in RTL UI.
- Places list responses and rows must never expose private notes, other users' private notes, private list membership, creator identity, or internal moderation data unless explicitly approved in a separate module.
- Create-place abuse prevention must include rate limiting, repeated duplicate submission handling, spam prevention, catalog-quality protections, and an admin moderation path for invalid entries.

## Places Module

### PLACE-001 - View places list

Feature Description: Authenticated users can view the compact Places list at `/places`.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| PLACE-001-US-001 | View authenticated places list | Critical | As an authenticated user, I want to view the places list so that I can browse the catalog. | Given I have a valid session, when I open `/places`, then the frontend requests `GET /api/v1/places` and renders returned `data` rows. |
| PLACE-001-US-002 | Reject guest access | Critical | As the system, I want guests blocked from places data so that the catalog is not anonymously exposed. | Given I have no valid session, when I open `/places` or call `GET /api/v1/places`, then the API returns `401 Unauthorized`, no catalog data is returned, and the UI does not render protected rows. |
| PLACE-001-US-003 | Render compact row fields | Critical | As a user, I want each place row to show only scannable core data so that browsing is fast. | Given a place is returned, when the row renders, then it shows generated artwork, place name, type label, subtype label when present, `averageRating` when not null, and no fake unrated label. |
| PLACE-001-US-004 | Hide absent optional row data | High | As a user, I do not want placeholders for missing data so that rows stay clean. | Given a place has no subtype or no rating, when the row renders, then the missing field is omitted without blank punctuation, empty chips, or invented copy. |
| PLACE-001-US-005 | Use collection envelope | Critical | As an API consumer, I want list responses enveloped so that pagination is testable. | Given places are requested, when the API responds successfully, then the response is `{ data: Place[], meta: { limit, offset, total, sort } }`. |
| PLACE-001-US-006 | Respect default page bounds | High | As the system, I want bounded place listing so that large catalogs do not overload the client. | Given no `limit` is supplied, when `GET /api/v1/places` runs, then the API returns no more than the default bounded page and never returns an unbounded full catalog. |
| PLACE-001-US-007 | Support explicit pagination params | High | As a user with a large catalog, I want additional places available without loading everything at once. | Given `limit` is 1-100 and `offset` is 0 or greater, when the request is sent, then the API returns the requested slice and correct `meta.total`. |
| PLACE-001-US-008 | Reject invalid pagination params | High | As the system, I want invalid pagination rejected so that API behavior is predictable. | Given `limit < 1`, `limit > 100`, or `offset < 0`, when the request is sent, then the API returns `422` structured validation error and does not return partial data. |
| PLACE-001-US-009 | Show empty catalog state | High | As a user, I want a clear empty state when the catalog has no places so that I understand the next action. | Given `meta.total = 0` and no filters/search are active, when the page loads, then it shows concise copy equivalent to "لا توجد أماكن" and one create-place action. |
| PLACE-001-US-010 | Show loading skeletons | Medium | As a user, I want layout-matching loading feedback so that the page does not jump. | Given the places request is pending, when `/places` renders, then compact row skeletons matching final row dimensions appear and no fake place names or ratings are shown. |
| PLACE-001-US-011 | Show recoverable API error | High | As a user, I want a recovery path when places fail to load so that I am not stuck. | Given the places API returns 5xx or network failure, when the page renders, then it shows a concise error state, a retry action, and no stale fake data. |
| PLACE-001-US-012 | Maintain mobile containment | Critical | As a mobile user, I want places to fit without zooming out so that the app is usable on small screens. | Given viewport widths of 320, 390, and 430 px and 200% browser zoom pressure, when rows render, then `document.documentElement.scrollWidth <= window.innerWidth`, ratings are not clipped, and bottom navigation does not cover the final row. |
| PLACE-001-US-013 | Prevent private-data flash during auth resolution | Critical | As the system, I want protected catalog data hidden until authentication is resolved so that guests never briefly see private app content. | Given session state is unknown on first render, when `/places` loads, then the UI shows a neutral loading/auth state and does not render cached rows until a valid session is confirmed. |
| PLACE-001-US-014 | Exclude private user data from place rows | Critical | As a user, I want the shared catalog to protect private context so that browsing does not expose personal data. | Given `GET /api/v1/places` returns place rows, then each row excludes private notes, other users' private notes, private list membership, creator identity, and internal moderation fields. |
| PLACE-001-US-015 | Browse large catalog with continuous scrolling | High | As a user, I want large catalogs to continue loading as I scroll so that browsing feels continuous. | Given the current page has more results beyond `meta.offset + data.length`, when I scroll near the end, then the client requests the next bounded page and appends it without requiring a manual Load More button. |
| PLACE-001-US-016 | Virtualize large result sets | High | As a mobile user, I want large catalogs to remain fast so that scrolling does not degrade. | Given hundreds or thousands of places are available, when I browse the list, then only visible rows plus buffer rows are rendered while scroll position and keyboard navigation remain stable. |
| PLACE-001-US-017 | Prevent duplicate rows across pages | High | As a user, I do not want repeated places during continuous scrolling. | Given multiple pages are loaded incrementally, when page boundaries overlap or a retry repeats a request, then the UI de-duplicates rows by stable place `id` and never shows the same place twice. |
| PLACE-001-US-018 | Recover from incremental load failure | High | As a user, I want a failed next-page load to be recoverable without losing current results. | Given an initial page is visible and the next-page request fails, when the error appears, then already loaded rows remain visible, a retry control is available, and retry requests the same failed page. |
| PLACE-001-US-019 | Announce incremental loading and end of results | Medium | As a screen-reader user, I want list loading state announced so that continuous scrolling is understandable. | Given another page is loading or no further pages remain, when the state changes, then an accessible live region announces loading and end-of-results without moving focus unexpectedly. |
| PLACE-001-US-020 | Preserve scroll position across detail navigation | High | As a user browsing a long catalog, I want to return to the same point after opening a place. | Given I open Place Detail from a loaded list and then navigate back, when `/places` is restored, then filters/search and scroll position are preserved where the browser/app supports restoration. |

Story Count: 20

Coverage Assessment: Covers authenticated browsing, explicit `401`, no private-data flash, response envelope, bounded pagination, continuous scrolling, virtualization, privacy exclusions, compact row data, empty/loading/error states, recovery, accessibility, and mobile containment.

Missing Assumptions: Exact frontend default `limit` value is implementation-owned but must remain within API bounds.

Risks: Large catalogs remain high-risk unless virtualization, de-duplication, and next-page retry behavior are implemented consistently across browsers.

### PLACE-002 - Filter restaurant/cafe/ice cream

Feature Description: Users can filter Places by primary place type inside the single Places page.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| PLACE-002-US-001 | Filter restaurants | Critical | As a user, I want to filter restaurants so that I see only restaurant places. | Given I am on `/places`, when I select restaurants, then the URL contains `type=restaurant`, the API request includes `type=restaurant`, and every returned row has `type = restaurant`. |
| PLACE-002-US-002 | Filter cafes | Critical | As a user, I want to filter cafes so that I see only cafe places. | Given I select cafes, when results load, then the URL contains `type=cafe`, the API request includes `type=cafe`, and every returned row has `type = cafe`. |
| PLACE-002-US-003 | Filter ice cream | High | As a user, I want to filter ice cream places so that I can browse them separately. | Given I select ice cream, when results load, then the URL contains `type=ice_cream`, the API request includes `type=ice_cream`, and every returned row has `type = ice_cream`. |
| PLACE-002-US-004 | Preserve type filter on refresh | High | As a user, I want active filters preserved so that refresh and sharing do not reset context. | Given `/places?type=cafe` is loaded, when the page initializes, then the cafe filter is selected before results are rendered. |
| PLACE-002-US-005 | Preserve type filter on back navigation | Medium | As a user, I want browser back to restore the previous filter so that exploration feels stable. | Given I switch from restaurants to cafes, when I press browser Back, then the restaurant filter and its results are restored. |
| PLACE-002-US-006 | Reset incompatible subtype on type change | High | As a user, I want invalid subtype state cleared so that results remain meaningful. | Given `type=restaurant&subtype=burger`, when I switch to cafe or ice cream, then the URL removes `subtype` unless the subtype is valid for the new type. |
| PLACE-002-US-007 | Reject invalid type value | Critical | As the system, I want invalid type values rejected so that taxonomy cannot drift. | Given `type=hotel` is sent to `GET /api/v1/places`, when the API validates the request, then it returns `422` structured validation error and no place data. |
| PLACE-002-US-008 | Announce selected type accessibly | High | As a screen-reader user, I want to know which primary filter is selected so that filtering is understandable. | Given a type filter is selected, when focus enters the filter control, then the selected option exposes an accessible selected state without relying on color only. |
| PLACE-002-US-009 | Keep filter control compact on mobile | Medium | As a mobile user, I want primary filters usable without consuming excessive screen height. | Given a 320 px viewport, when filters render, then all three primary options remain reachable, readable, and do not create horizontal page overflow. |
| PLACE-002-US-010 | Show filtered empty state | Medium | As a user, I want to distinguish no places for a type from an empty catalog. | Given a type filter is active and returns zero rows while the catalog may contain other types, when results load, then the UI shows "لا توجد نتائج" with an action to clear or show all filters. |

Story Count: 10

Coverage Assessment: Covers primary filtering, URL state, invalid type handling, accessibility, mobile sizing, and filtered empty state.

Missing Assumptions: None.

Risks: If frontend normalizes invalid URLs but backend does not reject invalid API values, clients can drift.

### PLACE-003 - Filter restaurant subtype

Feature Description: Users can filter restaurant places by approved restaurant subtype.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| PLACE-003-US-001 | Open restaurant subtype filter | High | As a user, I want to choose a restaurant subtype so that I can narrow restaurant results. | Given `type=restaurant`, when I open the subtype control, then the options include `الكل`, `برجر`, `إيطالي`, `أمريكي`, `ستيك`, `مشويات`, `شاورما`, `سعودي`, `خليجي`, `هندي`, `آسيوي`, `بحري`, `فطور`, `صحي`, and `أخرى`. |
| PLACE-003-US-002 | Apply restaurant subtype | High | As a user, I want to filter by restaurant subtype so that results are relevant. | Given `type=restaurant`, when I choose `برجر`, then the URL contains `subtype=burger`, the API request includes `subtype=burger`, and every returned row has `type=restaurant` and `subtype=burger`. |
| PLACE-003-US-003 | Clear restaurant subtype | Medium | As a user, I want to return to all restaurants so that I can broaden results. | Given a restaurant subtype is active, when I select `الكل`, then `subtype` is removed from the URL and all restaurant subtypes are eligible in results. |
| PLACE-003-US-004 | Preserve subtype on refresh | Medium | As a user, I want subtype state preserved so that refresh keeps my filtered view. | Given `/places?type=restaurant&subtype=italian`, when the page initializes, then restaurants and Italian subtype are selected before results render. |
| PLACE-003-US-005 | Reject restaurant filter without type | High | As the system, I want subtype filtering tied to primary type so that subtype values are not ambiguous. | Given `subtype=burger` is sent without `type`, when the API validates the request, then it returns `422` with code `PLACE_TYPE_REQUIRED_FOR_SUBTYPE_FILTER`. |
| PLACE-003-US-006 | Reject invalid restaurant subtype | High | As the system, I want non-restaurant subtypes rejected for restaurants so that taxonomy stays valid. | Given `type=restaurant&subtype=coffee`, when the API validates the request, then it returns `422` with code `INVALID_PLACE_SUBTYPE_FILTER`. |
| PLACE-003-US-007 | Keep subtype UI compact on mobile | Medium | As a mobile user, I want many restaurant subtypes available without large chip rows. | Given a mobile viewport, when restaurant subtype is available, then the page shows one compact subtype trigger and opens options in an accessible sheet/popover instead of permanently rendering all options. |
| PLACE-003-US-008 | Announce current subtype | Medium | As a screen-reader user, I want the active subtype announced so that I know the current filter. | Given subtype `burger` is active, when focus reaches the subtype trigger, then its accessible name includes the current subtype label. |
| PLACE-003-US-009 | Show no-results for subtype | Medium | As a user, I want clear feedback when a subtype has no matches. | Given `type=restaurant&subtype=seafood` returns zero rows, when results load, then the UI shows "لا توجد نتائج" and a clear-filter action. |

Story Count: 9

Coverage Assessment: Covers full restaurant taxonomy, subtype application/clearing, URL persistence, invalid API combinations, mobile interaction, accessibility, and empty state.

Missing Assumptions: Whether subtype option order is fixed taxonomy order or future analytics-driven order; current requirement assumes fixed taxonomy order.

Risks: The subtype sheet/popover is high-risk on small viewports if focus and scroll containment are weak.

### PLACE-004 - Filter cafe subtype

Feature Description: Users can filter cafe places by approved cafe subtype.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| PLACE-004-US-001 | Open cafe subtype filter | High | As a user, I want cafe subtype options so that I can distinguish coffee and tea. | Given `type=cafe`, when I open the subtype filter, then the options are exactly `الكل`, `قهوة`, and `شاهي`. |
| PLACE-004-US-002 | Apply coffee subtype | High | As a user, I want to filter coffee cafes so that results match my intent. | Given cafes are active, when I choose `قهوة`, then the request uses `type=cafe&subtype=coffee` and every returned row has `subtype=coffee`. |
| PLACE-004-US-003 | Apply tea subtype | High | As a user, I want to filter tea cafes so that results match my intent. | Given cafes are active, when I choose `شاهي`, then the request uses `type=cafe&subtype=tea` and every returned row has `subtype=tea`. |
| PLACE-004-US-004 | Clear cafe subtype | Medium | As a user, I want to return to all cafes so that I can broaden results. | Given a cafe subtype is active, when I choose `الكل`, then `subtype` is removed and all cafes are eligible. |
| PLACE-004-US-005 | Prevent restaurant subtype leakage | High | As a user, I want cafe filters to stay valid so that I do not see irrelevant choices. | Given `type=cafe`, when subtype options render, then no restaurant subtype option is displayed. |
| PLACE-004-US-006 | Reject invalid cafe subtype | High | As the system, I want restaurant subtypes rejected for cafes so that data remains consistent. | Given `type=cafe&subtype=burger`, when the API validates the request, then it returns `422` with code `INVALID_PLACE_SUBTYPE_FILTER`. |
| PLACE-004-US-007 | Preserve cafe subtype on refresh | Medium | As a user, I want refresh to keep my cafe subtype filter. | Given `/places?type=cafe&subtype=tea`, when the page loads, then cafes and tea are selected before results render. |
| PLACE-004-US-008 | Show cafe subtype no-results | Medium | As a user, I want clear feedback when no cafes match the subtype. | Given `type=cafe&subtype=coffee` returns zero rows, when results load, then the UI shows "لا توجد نتائج" and a clear-filter action. |

Story Count: 8

Coverage Assessment: Covers cafe subtype options, application, clearing, invalid combinations, URL state, and no-results behavior.

Missing Assumptions: None.

Risks: Low taxonomy complexity, medium UX risk if filter state is not visible.

### PLACE-005 - Browse ice cream places

Feature Description: Users can browse ice cream places without subtype filtering.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| PLACE-005-US-001 | View ice cream places | High | As a user, I want an ice cream filter so that I can browse ice cream places. | Given I select ice cream, when results load, then the request uses `type=ice_cream` and every returned row has `type=ice_cream`. |
| PLACE-005-US-002 | Hide subtype filter for ice cream | High | As a user, I do not want irrelevant subtype controls so that the UI stays simple. | Given `type=ice_cream`, when the page renders, then no subtype filter trigger, subtype chip, or subtype label is shown. |
| PLACE-005-US-003 | Clear subtype when switching to ice cream | High | As a user, I want invalid subtype state removed automatically so that ice cream results are valid. | Given `type=restaurant&subtype=burger`, when I switch to ice cream, then the URL becomes `type=ice_cream` without `subtype`. |
| PLACE-005-US-004 | Reject ice cream subtype API query | High | As the system, I want ice cream subtype queries rejected so that the contract is explicit. | Given `type=ice_cream&subtype=burger`, when the API validates the request, then it returns `422` with code `INVALID_PLACE_SUBTYPE_FILTER`. |
| PLACE-005-US-005 | Show ice cream empty state | Medium | As a user, I want clear feedback if no ice cream places exist. | Given ice cream is active and returns zero rows, when results load, then a concise no-results state appears with a clear-filter or create-place action. |
| PLACE-005-US-006 | Display ice cream metadata cleanly | Medium | As a user, I want ice cream rows to avoid blank subtype punctuation. | Given an ice cream place renders, then the metadata shows `آيس كريم` only and does not render a trailing separator. |
| PLACE-005-US-007 | Preserve ice cream URL state | Medium | As a user, I want refresh and back navigation to preserve ice cream browsing. | Given `/places?type=ice_cream` is loaded, when the page initializes, then the ice cream filter is selected. |

Story Count: 7

Coverage Assessment: Covers ice cream type filtering, subtype exclusion, invalid subtype handling, empty state, metadata display, and URL state.

Missing Assumptions: None.

Risks: Future subtype expansion would require a new product decision and updated taxonomy.

### PLACE-006 - Search place name only

Feature Description: Users can search places by name only.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| PLACE-006-US-001 | Search by place name | Critical | As a user, I want to search by place name so that I can find a known place quickly. | Given I enter a non-blank query, when results load, then the API request includes `q` and returned places match `normalized_name` by place-name search only. |
| PLACE-006-US-002 | Limit search scope | Critical | As Product, I want search limited to place names so that MVP scope remains controlled. | Given a query matches only location, subtype label, recommendation text, or popularity concepts, when search runs, then those fields do not expand the result set unless the place name itself matches. |
| PLACE-006-US-003 | Trim and collapse search whitespace | High | As a user, I want accidental spacing handled so that search behaves predictably. | Given I enter `  Casa   Nonna  `, when search runs, then the effective query is `Casa Nonna`. |
| PLACE-006-US-004 | Treat blank search as no query | High | As a user, I want clearing the search field to return to the filtered list. | Given the search input contains only spaces, when the search is applied, then `q` is removed and the current type/subtype filters remain active. |
| PLACE-006-US-005 | Enforce search length limit | High | As the system, I want long searches rejected so that the API is protected. | Given `q` exceeds 120 characters, when the API validates the request, then it returns `422` structured validation error and no results are returned. |
| PLACE-006-US-006 | Escape wildcard characters | High | As the system, I want `%`, `_`, and backslash treated safely so that search cannot alter SQL pattern behavior. | Given the query contains `%`, `_`, or `\\`, when search runs, then those characters are escaped and treated as literal search text. |
| PLACE-006-US-007 | Support Arabic search text | High | As an Arabic user, I want Arabic names searchable so that local catalog entries are findable. | Given a place name contains Arabic text, when I search using matching Arabic characters, then matching places are returned without mojibake or Unicode escape display. |
| PLACE-006-US-008 | Support English search text | High | As a user, I want English names searchable so that mixed catalog entries are findable. | Given a place name contains English text, when I search with matching English text in different case, then matching places are returned case-insensitively. |
| PLACE-006-US-009 | Ignore Arabic diacritics in search | Critical | As an Arabic user, I want search to ignore diacritics so that equivalent Arabic spellings return the same place. | Given a place named `قهوة`, when I search `قَهْوَة`, then the place matches; given a place named `قَهْوَة`, when I search `قهوة`, then the place matches. |
| PLACE-006-US-010 | Support mixed Arabic/English search | Medium | As a user, I want mixed-language names searchable so that real place names work. | Given a place named `مطعم Five Guys`, when I search `Five Guys` or Arabic matching text, then the matching place can appear and the row remains contained. |
| PLACE-006-US-011 | Combine search with type filter | High | As a user, I want search to respect the active type so that results stay relevant. | Given `type=restaurant` is active, when I search, then every returned row matches both the search query and `type=restaurant`. |
| PLACE-006-US-012 | Combine search with subtype filter | High | As a user, I want search to respect subtype so that filtered searches work. | Given `type=restaurant&subtype=burger`, when I search, then every returned row matches the query and the selected subtype. |
| PLACE-006-US-013 | Preserve search in URL | Medium | As a user, I want search state preserved so that refresh/back keeps my context. | Given I search for `Malfa`, when results load, then the URL contains `q=Malfa` and refresh restores the query. |
| PLACE-006-US-014 | Show search no-results | Medium | As a user, I want a clear no-results state so that I can recover. | Given a search returns zero rows, when results load, then the UI shows "لا توجد نتائج" and offers a clear-search or show-all action. |
| PLACE-006-US-015 | Keep search control accessible and compact | Medium | As a mobile and keyboard user, I want search usable without layout overflow. | Given 320 px width and keyboard focus, when I type and clear search, then the input remains 44 px or larger as a touch target, has an accessible label, and does not cause horizontal overflow. |
| PLACE-006-US-016 | Rank exact matches first | High | As a user, I want exact name matches first so that known-place search is fast. | Given query `Malfa` and multiple matching places exist, when search results return, then normalized exact matches for `Malfa` appear before starts-with and contains matches. |
| PLACE-006-US-017 | Rank starts-with before contains | High | As a user, I want stronger textual matches ranked higher so that results feel predictable. | Given one place starts with the normalized query and another only contains it later in the name, when search results return, then the starts-with match appears before the contains match, with default rating sort used only as a tie-breaker within the same rank group. |
| PLACE-006-US-018 | Normalize punctuation in search | High | As a user, I want punctuation differences ignored where safe so that names remain findable. | Given a place name contains punctuation such as hyphen, apostrophe, period, or repeated separators, when I search the same words without that punctuation, then the normalized match can be returned without SQL wildcard expansion. |
| PLACE-006-US-019 | Reject invalid search query payloads | High | As the system, I want invalid query values rejected predictably so that search remains safe. | Given `q` is non-string, malformed, or exceeds 120 characters after normalization, when `GET /api/v1/places` validates the request, then it returns `422` and no results are returned. |
| PLACE-006-US-020 | Preserve search rank across continuous scrolling | High | As a user, I want later search pages to continue the same ordering so that scrolling does not reshuffle results. | Given a search has more than one page, when next pages load, then the server preserves exact/starts-with/contains ranking and tie-break order across all offsets. |
| PLACE-006-US-021 | Recover from search request failure | Medium | As a user, I want to retry failed searches without losing the query. | Given a search request fails with network or 5xx error, when the error state appears, then the query and active filters remain visible and retry resubmits the same normalized search. |

Story Count: 21

Coverage Assessment: Covers name-only scope, normalization, Arabic diacritic folding, punctuation handling, ranked matching, invalid query rejection, length validation, wildcard escaping, Arabic/English/mixed input, filter combinations, URL state, continuous scrolling rank stability, no-results, recovery, and accessibility.

Missing Assumptions: None.

Risks: Search quality risk remains if users expect location/category discovery; the scope boundary must remain visible in QA and docs.

### PLACE-007 - Highest average rating first, unrated last

Feature Description: Places default to highest average rating first, with unrated places last.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| PLACE-007-US-001 | Sort by average rating descending | High | As a user, I want highest-rated places first so that quality is easy to scan. | Given places have ratings, when `GET /api/v1/places` runs with default sort, then higher `averageRating` values appear before lower values. |
| PLACE-007-US-002 | Keep unrated places last | High | As a user, I want unrated places after rated places so that ratings remain meaningful. | Given rated and unrated places exist, when sorted, then all places with `averageRating = null` appear after all rated places. |
| PLACE-007-US-003 | Tie-break by rating count | Medium | As a user, I want more reliable ratings ranked higher when averages tie. | Given two places have the same `averageRating`, when sorted, then the place with higher `ratingCount` appears first. |
| PLACE-007-US-004 | Tie-break by normalized name | Medium | As the system, I want stable ordering so that pagination does not jump. | Given two places have the same `averageRating` and `ratingCount`, when sorted, then ascending `normalized_name` determines order. |
| PLACE-007-US-005 | Preserve sort across pagination | Critical | As a user, I want pagination to continue the same global order so that places are not duplicated or skipped. | Given `limit` and `offset` are used, when pages are requested, then each page reflects the same server-side global sort order. |
| PLACE-007-US-006 | Preserve sort with filters | High | As a user, I want filtered results still ranked consistently. | Given type, subtype, or search filters are active, when results load, then the filtered subset is ordered by the same rating-desc rules. |
| PLACE-007-US-007 | Return sort metadata | Medium | As an API consumer, I want the active sort visible so that clients can verify behavior. | Given the places collection returns, then `meta.sort` equals `rating_desc`. |
| PLACE-007-US-008 | Format ratings consistently | Medium | As a user, I want ratings readable in RTL UI so that numbers are not confusing. | Given a rating is displayed, then it uses Western digits, period decimal separator, at most one decimal place, and LTR isolation. |
| PLACE-007-US-009 | Update ordering after rating changes | Medium | As a user, I want newly rated places to rank correctly after data changes. | Given a place rating aggregate changes, when the places list is reloaded, then the updated aggregate affects the server-side order. |
| PLACE-007-US-010 | Do not expose fake zero rating | High | As a user, I do not want unrated places shown as zero-rated. | Given a place has no ratings, when row data renders, then `averageRating` is omitted/null and never displayed as `0`, `0.0`, or `لا تقييم`. |
| PLACE-007-US-011 | Keep sort stable during continuous scrolling | Critical | As a user, I want scrolling pages to preserve the global ranking so that the same place is not skipped or repeated. | Given the list loads pages with `limit` and `offset`, when page 2 or later is requested, then the backend applies the same `rating_desc` ordering before slicing and the frontend appends without client-only resorting. |
| PLACE-007-US-012 | Handle catalog updates between page loads | High | As the system, I want scrolling to tolerate rating changes during browsing so that users do not see corrupt ordering. | Given ratings change while a user is scrolling, when a later page loads, then duplicate place IDs are filtered client-side and a full refresh can reconcile final ordering without corrupting current rows. |
| PLACE-007-US-013 | Sort ties consistently across locales | Medium | As the system, I want name tie-breaks deterministic so that Arabic and English mixed names remain stable. | Given tied `averageRating` and `ratingCount` values include Arabic, English, and mixed names, when sorted, then the normalized-name ascending rule is deterministic across API calls and pagination. |

Story Count: 13

Coverage Assessment: Covers sort algorithm, tie-breaking, unrated handling, pagination safety, continuous scrolling stability, catalog updates during browsing, locale-stable name ordering, filter combinations, formatting, and aggregate refresh.

Missing Assumptions: No visible sort selector is in scope; `rating_desc` is the only supported sort value.

Risks: High trust risk if ranking differs between pages or between backend and UI.

### PLACE-008 - Open place detail from row

Feature Description: The entire place row opens Place Detail.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| PLACE-008-US-001 | Open detail from row tap | Critical | As a user, I want to tap a place row so that I can view place details. | Given a place row is visible, when I tap/click the row, then the app navigates to `/places/{id}` for that place. |
| PLACE-008-US-002 | Use semantic link | High | As a keyboard and assistive-tech user, I want rows to behave like links. | Given a row renders, then the interactive element is a semantic link or equivalent with the place name in its accessible name. |
| PLACE-008-US-003 | Open detail by keyboard | High | As a keyboard user, I want to open a row without a pointer. | Given focus is on a place row link, when I press Enter, then the corresponding detail page opens. |
| PLACE-008-US-004 | Avoid duplicate arrow action | Medium | As a user, I want clean rows without misleading controls. | Given a row renders, then it does not require a separate arrow button and does not show an icon that implies expand/collapse/up navigation. |
| PLACE-008-US-005 | Preserve filter and search context on return | High | As a user, I want to return to the same browsing state after viewing details. | Given I open detail from filtered/searched results, when I use browser Back, then the previous URL query, selected filters, and search text are restored. |
| PLACE-008-US-006 | Preserve scroll position where browser supports it | Medium | As a user browsing a long list, I want to return near the row I opened. | Given I open detail from a scrolled list, when I go back, then the app/browser should restore the prior scroll position or avoid forcing a top reset. |
| PLACE-008-US-007 | Keep long row text contained | High | As a user, I want long place names readable without breaking navigation. | Given a long Arabic, English, or mixed name renders inside a row link, then it is clamped predictably, does not collide with rating/artwork, and does not cause horizontal overflow. |
| PLACE-008-US-008 | Show focus-visible only for keyboard focus | Medium | As a pointer user, I do not want a persistent selected outline after tapping. | Given I tap a row, then no persistent selected/focus border remains; given I keyboard-tab to a row, then a visible focus indicator appears. |

Story Count: 8

Coverage Assessment: Covers row navigation, semantics, keyboard support, context preservation, text containment, and focus behavior.

Missing Assumptions: Exact scroll restoration depends on browser/runtime, but the app must not intentionally discard query context.

Risks: Detail navigation overlaps with Place Details, but row opening is owned by Places browse.

### PLACE-009 - Create restaurant with subtype

Feature Description: Authenticated users can create restaurant places; restaurant subtype is required.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| PLACE-009-US-001 | Open create restaurant flow | Critical | As an authenticated user, I want to add a restaurant so that it exists in the catalog. | Given I open the add-place flow and choose restaurant, then the form shows name, type, and restaurant subtype fields. |
| PLACE-009-US-002 | Require authenticated creation | Critical | As the system, I want only authenticated users to create places so that mutations are protected. | Given I have no valid session, when I submit `POST /api/v1/places`, then the API returns `401 Unauthorized`, no place row is created, and no protected form result is rendered. |
| PLACE-009-US-003 | Require restaurant name | Critical | As the system, I want restaurant name required so that records are usable. | Given `name` is missing, empty, or whitespace-only after trimming, when I save, then validation fails and no place is created. |
| PLACE-009-US-004 | Enforce restaurant name length | High | As the system, I want restaurant names bounded so that UI and storage remain safe. | Given canonical `name` exceeds 120 characters, when submitted, then API returns `422` validation error and no place is created. |
| PLACE-009-US-005 | Canonicalize restaurant name | High | As a user, I want accidental spacing cleaned so that duplicates are not created. | Given name `  Burger   House  ` is submitted, when created, then stored/displayed name is `Burger House` and normalized uniqueness uses `burger house`. |
| PLACE-009-US-006 | Require restaurant subtype | Critical | As the system, I want restaurant subtype required so that taxonomy is usable. | Given `type=restaurant` and `subtype` is null or missing, when submitted, then validation fails with no place created. |
| PLACE-009-US-007 | Accept only approved restaurant subtype | Critical | As the system, I want restaurant subtype values constrained so that taxonomy stays clean. | Given `type=restaurant`, when subtype is submitted, then it must be one of `burger`, `italian`, `american`, `steak`, `grill`, `shawarma`, `saudi`, `gulf`, `indian`, `asian`, `seafood`, `breakfast`, `healthy`, or `other`; otherwise API returns `422`. |
| PLACE-009-US-008 | Reject duplicate restaurant name | Critical | As the system, I want duplicate normalized names rejected so that the catalog has one global place record per name. | Given a place with the same normalized name already exists, when I submit a restaurant with that name, then API returns `409 Conflict` with error code `DUPLICATE_PLACE_NAME` and no second row is created. |
| PLACE-009-US-009 | Save valid restaurant | Critical | As a user, I want to save a valid restaurant so that it appears in the catalog. | Given valid name, `type=restaurant`, and valid subtype are submitted, when the API succeeds, then it returns `201 Created` with `id`, `name`, `normalizedName`, `type`, `subtype`, `description`, `averageRating`, `ratingCount`, `createdAt`, and `updatedAt`. |
| PLACE-009-US-010 | Navigate to restaurant detail after create | Critical | As a user, I want to land on the new place immediately so that I can add it to lists or rate it. | Given a restaurant is created successfully and the response includes the new place ID, then the create flow closes and the app navigates directly to `/places/{newPlaceId}` instead of returning to `/places`. |
| PLACE-009-US-011 | Treat created restaurant as shared catalog record | Critical | As Product, I want created restaurants to become shared catalog entries so that no user receives private ownership rights over public catalog data. | Given a restaurant is created, then the creator receives no special edit/delete rights, creator identity is not exposed in Places responses, and future correction requests are handled through admin/moderation workflows. |
| PLACE-009-US-012 | Show validation errors accessibly | High | As a user, I want form errors announced and tied to fields so that I can fix them. | Given name or subtype validation fails, when errors render, then each invalid field has an accessible error message and focus remains inside the dialog/sheet. |
| PLACE-009-US-013 | Keep mobile create flow usable | Medium | As a mobile user, I want the create flow to fit on small screens. | Given a 320 px viewport and software keyboard pressure, when the restaurant form opens, then fields/actions remain reachable, no horizontal overflow occurs, and close/cancel/save controls meet touch target requirements. |
| PLACE-009-US-014 | Recover from create failure | Medium | As a user, I want to retry after a server or network failure without losing input. | Given a network or 5xx error occurs on save, when the error displays, then entered name/type/subtype remain in the form and a retry is possible. |
| PLACE-009-US-015 | Rate-limit restaurant creation | High | As the system, I want abusive creation attempts limited so that catalog quality is protected. | Given an authenticated user exceeds the configured create-place rate limit, when another restaurant create request is submitted, then API returns `429 Too Many Requests`, creates no row, and returns a safe retry message. |
| PLACE-009-US-016 | Suppress repeated duplicate submissions | High | As the system, I want repeated duplicate submissions handled safely so that spam does not create noise or load. | Given the same user repeatedly submits a duplicate normalized name, when the duplicate is detected, then each request returns `409 Conflict` with `DUPLICATE_PLACE_NAME`, no additional records are created, and abuse monitoring can record the repeated attempts. |
| PLACE-009-US-017 | Route suspicious restaurant entries to moderation path | Medium | As Product, I want low-quality or abusive catalog entries reviewable so that the shared catalog remains trustworthy. | Given a submitted restaurant name appears spammy, offensive, or intentionally invalid according to moderation rules, when it is flagged, then the system blocks or queues it according to admin moderation policy and does not silently create misleading catalog data. |
| PLACE-009-US-018 | Preserve optional description contract | Medium | As an API consumer, I want restaurant description behavior explicit even though the UI does not require it. | Given `description` is omitted or blank, when the restaurant is created, then the response returns `description: null`; given a valid description up to 1000 characters, then it is stored without being required in the current UI. |
| PLACE-009-US-019 | Reject invalid restaurant create payload shape | High | As the system, I want malformed create payloads rejected safely so that data integrity is preserved. | Given `name`, `type`, `subtype`, or `description` has an invalid type or unsupported value, when `POST /api/v1/places` validates the payload, then it returns `422 Validation Error` and creates no place. |

Story Count: 19

Coverage Assessment: Covers explicit auth status, required fields, name limits, canonicalization, subtype enum, `409` duplicate conflict, `201` response schema, direct navigation to new place detail, shared catalog ownership, abuse prevention, moderation path, accessible errors, mobile form, and retry behavior.

Missing Assumptions: None.

Risks: Critical data-integrity risk if duplicate and subtype validation are not enforced in both API and database.

### PLACE-010 - Create cafe with subtype

Feature Description: Authenticated users can create cafe places; cafe subtype is required.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| PLACE-010-US-001 | Open create cafe flow | Critical | As an authenticated user, I want to add a cafe so that I can track it. | Given I open add-place and select cafe, then the form shows name, type, and cafe subtype fields. |
| PLACE-010-US-002 | Require authenticated cafe creation | Critical | As the system, I want only authenticated users to create cafes so that mutations are protected. | Given I am a guest, when I submit `POST /api/v1/places` with `type=cafe`, then API returns `401 Unauthorized`, no place is created, and no protected content is rendered. |
| PLACE-010-US-003 | Require cafe name | Critical | As the system, I want cafe name required so that records are usable. | Given `name` is missing, empty, or whitespace-only after trimming, when submitted, then validation fails and no place is created. |
| PLACE-010-US-004 | Enforce cafe name length | High | As the system, I want cafe names bounded so that UI and storage remain safe. | Given canonical `name` exceeds 120 characters, when submitted, then API returns `422`. |
| PLACE-010-US-005 | Canonicalize cafe name | High | As a user, I want accidental spacing cleaned so that duplicates are not created. | Given `  Brew   Bar  ` is submitted, when created, then stored/displayed name is `Brew Bar`. |
| PLACE-010-US-006 | Require cafe subtype | Critical | As the system, I want cafe subtype required so that taxonomy is consistent. | Given `type=cafe` and `subtype` is null or missing, when submitted, then validation fails. |
| PLACE-010-US-007 | Accept only cafe subtypes | Critical | As the system, I want cafe subtype values constrained so that restaurant taxonomy does not leak. | Given `type=cafe`, when subtype is submitted, then it must be `coffee` or `tea`; any other value returns `422`. |
| PLACE-010-US-008 | Reject duplicate cafe name | Critical | As the system, I want duplicate normalized names rejected globally. | Given any existing place has the same normalized name, when I submit a cafe with that name, then API returns `409 Conflict` with error code `DUPLICATE_PLACE_NAME` and creates no row. |
| PLACE-010-US-009 | Save valid cafe | Critical | As a user, I want to save a valid cafe so that it appears in the catalog. | Given valid name, `type=cafe`, and valid subtype are submitted, when API succeeds, then it returns `201 Created` with `id`, `name`, `normalizedName`, `type`, `subtype`, `description`, `averageRating`, `ratingCount`, `createdAt`, and `updatedAt`. |
| PLACE-010-US-010 | Navigate to cafe detail after create | Critical | As a user, I want to land on the new cafe immediately so that I can add it to lists or rate it. | Given a cafe is created successfully and the response includes the new place ID, then the create flow closes and the app navigates directly to `/places/{newPlaceId}` instead of returning to `/places`. |
| PLACE-010-US-011 | Keep cafe form accessible on mobile | Medium | As a mobile user, I want cafe creation usable without zooming. | Given 320 px width, when the cafe form opens, then all fields/actions remain reachable and no horizontal overflow occurs. |
| PLACE-010-US-012 | Preserve input after cafe create error | Medium | As a user, I want to retry after failure without retyping. | Given a network or 5xx error occurs, when the error is shown, then entered form values remain. |
| PLACE-010-US-013 | Treat created cafe as shared catalog record | Critical | As Product, I want created cafes to become shared catalog entries so that creators do not control public catalog records. | Given a cafe is created, then the creator receives no edit/delete rights, creator identity is not exposed in Places responses, and future corrections use admin/moderation workflows. |
| PLACE-010-US-014 | Rate-limit cafe creation | High | As the system, I want repeated cafe creation attempts limited so that spam does not degrade catalog quality. | Given an authenticated user exceeds the configured create-place rate limit, when another cafe create request is submitted, then API returns `429 Too Many Requests` and creates no row. |
| PLACE-010-US-015 | Preserve optional cafe description contract | Medium | As an API consumer, I want cafe description behavior explicit even though the UI does not require it. | Given `description` is omitted or blank, when the cafe is created, then the response returns `description: null`; given a valid description up to 1000 characters, then it is stored. |
| PLACE-010-US-016 | Reject malformed cafe create payload | High | As the system, I want malformed cafe payloads rejected safely. | Given `name`, `type`, `subtype`, or `description` has an invalid type or unsupported value, when `POST /api/v1/places` validates the payload, then it returns `422 Validation Error` and creates no place. |

Story Count: 16

Coverage Assessment: Covers explicit auth status, required/length/canonical name rules, cafe subtype enum, duplicate conflict, success response schema, shared catalog ownership, rate limiting, optional description, malformed payloads, mobile, and retry behavior.

Missing Assumptions: None.

Risks: Medium; subtype set is small but duplicate behavior is global and critical.

### PLACE-011 - Create ice cream without subtype

Feature Description: Authenticated users can create ice cream places without subtype.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| PLACE-011-US-001 | Open create ice cream flow | High | As an authenticated user, I want to add an ice cream place so that I can track it. | Given I select ice cream in add-place, then the form shows name and type and does not show any subtype field. |
| PLACE-011-US-002 | Require authenticated ice cream creation | Critical | As the system, I want only authenticated users to create ice cream places. | Given I am a guest, when I submit `POST /api/v1/places` with `type=ice_cream`, then API returns `401 Unauthorized`, no place is created, and no protected content is rendered. |
| PLACE-011-US-003 | Require ice cream name | Critical | As the system, I want name required so that records are usable. | Given `name` is missing, empty, or whitespace-only after trimming, when submitted, then validation fails. |
| PLACE-011-US-004 | Enforce ice cream name length | High | As the system, I want names bounded so that UI and storage remain safe. | Given canonical `name` exceeds 120 characters, when submitted, then API returns `422`. |
| PLACE-011-US-005 | Canonicalize ice cream name | High | As a user, I want accidental spacing cleaned so that duplicates are not created. | Given name with leading/trailing or repeated internal spaces, when created, then stored name is trimmed and internal spaces are collapsed. |
| PLACE-011-US-006 | Forbid ice cream subtype | Critical | As the system, I want ice cream subtype forbidden so that taxonomy remains clean. | Given `type=ice_cream` and any `subtype` is submitted, when API validates, then it returns `422` and no place is created. |
| PLACE-011-US-007 | Reject duplicate ice cream name | Critical | As the system, I want duplicate normalized names rejected globally. | Given any existing place has the same normalized name, when I submit ice cream with that name, then API returns `409 Conflict` with error code `DUPLICATE_PLACE_NAME` and creates no row. |
| PLACE-011-US-008 | Save valid ice cream place | High | As a user, I want to save ice cream without subtype so that the flow stays simple. | Given valid name and `type=ice_cream` with no subtype, when API succeeds, then it returns `201 Created` with `subtype = null` and response fields `id`, `name`, `normalizedName`, `type`, `description`, `averageRating`, `ratingCount`, `createdAt`, and `updatedAt`. |
| PLACE-011-US-009 | Navigate to ice cream detail after create | High | As a user, I want to land on the new ice cream place immediately so that I can add it to lists or rate it. | Given an ice cream place is created successfully and the response includes the new place ID, then the create flow closes and the app navigates directly to `/places/{newPlaceId}` instead of returning to `/places`. |
| PLACE-011-US-010 | Display ice cream without blank subtype | Medium | As a user, I want clean metadata after creation. | Given a created ice cream place appears in a row, then no blank subtype placeholder or dangling separator is shown. |
| PLACE-011-US-011 | Preserve input after ice cream create error | Medium | As a user, I want to retry after failure without retyping. | Given a network or 5xx error occurs, when the error is shown, then entered name and selected type remain. |
| PLACE-011-US-012 | Treat created ice cream place as shared catalog record | Critical | As Product, I want created ice cream places to become shared catalog entries so that creators do not control public catalog records. | Given an ice cream place is created, then the creator receives no edit/delete rights, creator identity is not exposed in Places responses, and future corrections use admin/moderation workflows. |
| PLACE-011-US-013 | Rate-limit ice cream creation | High | As the system, I want repeated ice cream creation attempts limited so that spam does not degrade catalog quality. | Given an authenticated user exceeds the configured create-place rate limit, when another ice cream create request is submitted, then API returns `429 Too Many Requests` and creates no row. |
| PLACE-011-US-014 | Preserve optional ice cream description contract | Medium | As an API consumer, I want description behavior explicit even though the UI does not require it. | Given `description` is omitted or blank, when the ice cream place is created, then the response returns `description: null`; given a valid description up to 1000 characters, then it is stored. |
| PLACE-011-US-015 | Reject malformed ice cream create payload | High | As the system, I want malformed ice cream payloads rejected safely. | Given `name`, `type`, `subtype`, or `description` has an invalid type or unsupported value, when `POST /api/v1/places` validates the payload, then it returns `422 Validation Error` and creates no place. |

Story Count: 15

Coverage Assessment: Covers explicit auth status, name rules, subtype prohibition, duplicate conflict, success response schema, shared catalog ownership, rate limiting, optional description, malformed payloads, display behavior, and retry.

Missing Assumptions: None.

Risks: Low current taxonomy risk, high integrity risk if subtype prohibition is not enforced.

### PLACE-012 - Reject duplicate normalized names

Feature Description: Backend rejects duplicate place names using normalized global uniqueness.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| PLACE-012-US-001 | Reject exact duplicate name | Critical | As the system, I want exact duplicate names rejected so that the catalog stays unique. | Given `Malfa` already exists, when `Malfa` is submitted again, then API returns `409 Conflict` with `DUPLICATE_PLACE_NAME` and creates no row. |
| PLACE-012-US-002 | Reject case-normalized duplicate | Critical | As the system, I want case-only differences rejected so that duplicate records cannot bypass uniqueness. | Given `Casa Nonna` exists, when `casa nonna` is submitted, then normalized name matches and the request returns `409 Conflict` with no second row. |
| PLACE-012-US-003 | Reject whitespace-normalized duplicate | Critical | As the system, I want spacing tricks rejected so that duplicates do not appear. | Given `Burger House` exists, when ` Burger   House ` is submitted, then canonicalized normalized name matches and the request returns `409 Conflict`. |
| PLACE-012-US-004 | Reject Arabic-diacritic duplicate | Critical | As the system, I want Arabic diacritic variants treated as the same place name so that Arabic duplicates are prevented. | Given `قهوة` exists, when `قَهْوَة` is submitted, then normalized name matches after diacritic folding and the request is rejected as duplicate. |
| PLACE-012-US-005 | Preserve unique original display name | Medium | As a user, I want my unique name displayed as entered after canonical spacing cleanup. | Given a unique mixed-case or Arabic name is submitted, when created, then original visible characters are preserved except trimming/collapsing whitespace. |
| PLACE-012-US-006 | Enforce database uniqueness | Critical | As the system, I want database-level protection so that concurrent requests cannot create duplicates. | Given two concurrent requests submit the same normalized name after case, whitespace, and Arabic-diacritic folding, when both complete, then exactly one succeeds and the other returns conflict after rollback. |
| PLACE-012-US-007 | Return structured duplicate error | High | As a frontend developer, I want duplicate errors machine-readable so that UI can show the correct recovery message. | Given duplicate name is rejected, then response includes error code `DUPLICATE_PLACE_NAME` and does not expose database internals. |
| PLACE-012-US-008 | Keep failed duplicate input editable | Medium | As a user, I want to fix a duplicate name without restarting the form. | Given duplicate error is shown, then the entered name remains editable and type/subtype selections are preserved. |
| PLACE-012-US-009 | Do not confuse same name across types | High | As Product, I want name uniqueness global, not per type, so that one place name maps to one catalog record. | Given `Malfa` exists as a cafe, when `Malfa` is submitted as a restaurant, then the request is rejected as duplicate. |
| PLACE-012-US-010 | Handle long normalized names safely | Medium | As the system, I want normalized names bounded consistently with display names. | Given canonical name exceeds 120 characters, when submitted, then validation rejects before uniqueness insert. |
| PLACE-012-US-011 | Avoid sensitive error leakage | High | As the system, I want duplicate failures safe for users so that schema details are not exposed. | Given a database uniqueness violation occurs, then the API returns the structured duplicate error and never returns SQL, constraint names, stack traces, or user identifiers. |
| PLACE-012-US-012 | Keep duplicate response contract stable | Critical | As a frontend and QA consumer, I want duplicate errors consistent across place types. | Given a duplicate restaurant, cafe, or ice cream name is submitted, then the API always returns status `409 Conflict`, error code `DUPLICATE_PLACE_NAME`, no `PlaceResponse`, and no created row. |
| PLACE-012-US-013 | Handle repeated duplicate submissions safely | High | As the system, I want repeated duplicate attempts controlled so that abuse does not overload the catalog service. | Given a user repeatedly submits the same duplicate normalized name, when requests are processed, then each duplicate returns `409`, no rows are created, and rate-limit/abuse monitoring can escalate repeated attempts. |
| PLACE-012-US-014 | Preserve existing canonical record after duplicate conflict | High | As a user, I want duplicate rejection to protect existing catalog data. | Given a duplicate request conflicts with an existing place, when `409` is returned, then the existing place's name, type, subtype, ratings, list memberships, and timestamps remain unchanged. |
| PLACE-012-US-015 | Route unresolved duplicate disputes to admin merge workflow | Medium | As Product, I want ambiguous duplicate cases handled safely outside user creation. | Given a user believes two existing places are duplicates or a duplicate was rejected incorrectly, then the product requirement is to use admin duplicate-resolution/moderation workflow rather than granting creator edit/delete rights. |

Story Count: 15

Coverage Assessment: Covers exact/case/whitespace/Arabic-diacritic duplicates, global uniqueness, `409` contract, repeated duplicate attempts, canonical record preservation, concurrency, database enforcement, structured errors, UX recovery, moderation handoff, and safe error handling.

Missing Assumptions: None.

Risks: Critical catalog-quality and data-integrity risk if any layer bypasses normalized uniqueness.

### PLACE-013 - Deterministic generated artwork

Feature Description: Places display stable generated artwork without external photos.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| PLACE-013-US-001 | Show generated artwork | Medium | As a user, I want visual artwork so that rows are easier to scan. | Given a place row/card renders, then generated artwork is visible in the artwork slot. |
| PLACE-013-US-002 | Keep artwork stable | Medium | As a user, I want artwork stable so that places feel recognizable. | Given the same place ID renders across reloads, then generated artwork uses the same deterministic visual variant. |
| PLACE-013-US-003 | Vary artwork across places | Low | As a user, I want different places visually distinguishable. | Given multiple different place IDs render, then generated artwork varies deterministically by seed and does not render as identical neutral placeholders for all rows. |
| PLACE-013-US-004 | Avoid fake photography | High | As Product, I want generated artwork not mistaken for real place photos. | Given artwork renders, then it uses abstract/generated visuals only and no external photo provider, stock photo, upload, or copyrighted imagery. |
| PLACE-013-US-005 | Keep artwork compact and contained | Medium | As a mobile user, I want artwork to support scanning without breaking layout. | Given 320 px width and long names, when rows render, then artwork remains fixed-size, does not shrink text to zero, and does not create horizontal overflow. |
| PLACE-013-US-006 | Expose decorative artwork accessibly | Medium | As a screen-reader user, I do not want decorative artwork to add noise. | Given artwork is decorative and adjacent place name is present, then it is hidden from assistive tech or has an accessible treatment that does not duplicate the place name. |
| PLACE-013-US-007 | Maintain contrast in dark UI | Medium | As a low-vision user, I want artwork not to reduce readability. | Given artwork appears next to text, then text contrast and focus indicators remain WCAG AA-compliant and are not obscured by artwork colors. |
| PLACE-013-US-008 | Avoid random visual changes | Medium | As a user, I want the visual catalog to feel consistent. | Given the page rerenders without place ID changes, then artwork does not randomize on every render. |

Story Count: 8

Coverage Assessment: Covers visual presence, deterministic stability, variation, no external/fake imagery, mobile containment, accessibility, and contrast.

Missing Assumptions: Exact generation algorithm is implementation-owned but must be deterministic by stable place identifier.

Risks: Medium product perception risk if artwork appears random, fake, or repetitive.

### PLACE-014 - Redirect old restaurant URL

Feature Description: Legacy `/restaurants` redirects to the Places restaurant filter.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| PLACE-014-US-001 | Redirect restaurant legacy route with 308 | Medium | As a user with an old link, I want `/restaurants` to still work. | Given I request `/restaurants`, when the route responds, then it uses HTTP `308 Permanent Redirect` to `/places?type=restaurant`. |
| PLACE-014-US-002 | Keep restaurants hidden from primary nav | Medium | As Product, I want legacy routes hidden so that navigation remains current. | Given primary navigation renders, then `/restaurants` is not shown as a primary destination. |
| PLACE-014-US-003 | Avoid duplicate restaurant UI | High | As Product, I want Places to remain canonical so that users do not see two restaurant experiences. | Given `/restaurants` is opened, then no independent restaurant page UI or separate bottom-nav tab is rendered before final destination. |
| PLACE-014-US-004 | Preserve authentication behavior after redirect | High | As the system, I want the canonical protected page to enforce auth. | Given a guest opens `/restaurants`, when redirected to `/places?type=restaurant`, then the Places page enforces the same guest denial as `/places`. |
| PLACE-014-US-005 | Test redirect compatibility | Low | As QA, I want legacy route behavior covered so that old links do not regress. | Given E2E or route tests run, when `/restaurants` is visited, then HTTP `308` and final URL/state are verified as restaurant-filtered Places. |

Story Count: 5

Coverage Assessment: Covers compatibility redirect, hidden navigation, canonical UI, auth behavior, and testability.

Missing Assumptions: None.

Risks: Low product risk; medium regression risk if legacy links are used externally.

### PLACE-015 - Redirect old cafe URL

Feature Description: Legacy `/cafes` redirects to the Places cafe filter.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| PLACE-015-US-001 | Redirect cafe legacy route with 308 | Medium | As a user with an old link, I want `/cafes` to still work. | Given I request `/cafes`, when the route responds, then it uses HTTP `308 Permanent Redirect` to `/places?type=cafe`. |
| PLACE-015-US-002 | Keep cafes hidden from primary nav | Medium | As Product, I want cafes hidden as a primary tab so that navigation remains three-item. | Given primary navigation renders, then `/cafes` is not shown as a primary destination. |
| PLACE-015-US-003 | Avoid duplicate cafe UI | High | As Product, I want Places to remain canonical so that users do not see two cafe experiences. | Given `/cafes` is opened, then no independent cafe page UI or separate bottom-nav tab is rendered before final destination. |
| PLACE-015-US-004 | Preserve authentication behavior after redirect | High | As the system, I want the canonical protected page to enforce auth. | Given a guest opens `/cafes`, when redirected to `/places?type=cafe`, then the Places page enforces the same guest denial as `/places`. |
| PLACE-015-US-005 | Test redirect compatibility | Low | As QA, I want legacy route behavior covered so that old links do not regress. | Given E2E or route tests run, when `/cafes` is visited, then HTTP `308` and final URL/state are verified as cafe-filtered Places. |

Story Count: 5

Coverage Assessment: Covers compatibility redirect, hidden navigation, canonical UI, auth behavior, and testability.

Missing Assumptions: None.

Risks: Low product risk; medium regression risk if legacy links are used externally.

### PLACE-016 - Store optional description

Feature Description: Backend supports optional place description as reserved metadata, not a current UI field.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| PLACE-016-US-001 | Store optional description through API | Low | As an API consumer, I want optional description stored so that reserved metadata can exist when supplied. | Given an authenticated create request includes `description` of 1-1000 characters, when the place is created, then the response includes the stored description. |
| PLACE-016-US-002 | Store missing description as null | Medium | As the system, I want description optional so that UI can omit it. | Given `description` is omitted, when place is created, then stored `description` is `null`. |
| PLACE-016-US-003 | Store blank description as null | Medium | As the system, I want blank description normalized so that empty strings do not pollute data. | Given `description` is empty or whitespace-only, when place is created, then stored `description` is `null`. |
| PLACE-016-US-004 | Enforce description length | Medium | As the system, I want description length constrained so that storage and UI stay safe. | Given `description` exceeds 1000 characters, when submitted, then API returns `422` validation error and no place is created. |
| PLACE-016-US-005 | Do not expose description as active UI field | Low | As Product, I want description reserved so that MVP create-place UI remains simple. | Given the current create-place UI renders, then it does not require or prominently expose description as a user-facing field. |
| PLACE-016-US-006 | Keep description available for future features | Low | As Product, I want description retained in the API so that future features can use it without schema rework. | Given a place response is returned by the API, then optional `description` remains part of the API model while current UI does not require user entry. |
| PLACE-016-US-007 | Sanitize displayed description if future UI uses it | Medium | As the system, I want reserved metadata safe if it becomes visible later. | Given description contains HTML-like text, when any future UI displays it, then it is rendered as text, not executable markup. |

Story Count: 7

Coverage Assessment: Covers optional storage, null behavior, max length, current UI omission, API support for future product features, and future-safe rendering expectation.

Missing Assumptions: None.

Risks: Low current UX risk; medium future risk if description becomes visible without sanitization.

## Summary

Total Features Processed: 16

Total User Stories Written: 186

Features Removed From This Module Scope:

- `PLACE-017` - belongs to Place Details user stories.
- `PLACE-018` - belongs to Place Details user stories.
- `PLACE-019` - belongs to Place Details and Lists user stories.
- `PLACE-020` - belongs to Place Details and Ratings user stories.

Features With Highest Complexity:

- `PLACE-006` - search normalization, Arabic diacritic folding, punctuation normalization, ranked matching, escaping, mixed-language handling, filter combinations, and scrolling rank stability.
- `PLACE-007` - server-side sorting, tie-breaks, continuous scrolling stability, catalog updates during browsing, and unrated handling.
- `PLACE-009` - restaurant creation with taxonomy, validation, duplicate conflict, shared catalog ownership, abuse prevention, moderation handoff, and mobile form behavior.
- `PLACE-012` - normalized uniqueness, Arabic diacritic folding, concurrency, database enforcement, repeated duplicate attempts, global `409` contract, and safe conflict handling.
- `PLACE-001` - authenticated catalog browsing with no private-data flash, privacy exclusions, continuous scrolling, virtualization, states, and mobile containment.

Features With Highest Business Risk:

- `PLACE-012` - duplicate normalized names and catalog quality.
- `PLACE-009` / `PLACE-010` / `PLACE-011` - invalid place creation and taxonomy drift.
- `PLACE-006` - search expectations, Arabic diacritic equivalence, and scope boundary.
- `PLACE-007` - rating-order trust and continuous scrolling correctness.
- `PLACE-001` - catalog availability, authorization, privacy exclusions, and large-catalog behavior.

Recommended QA Priority Order:

1. `PLACE-012`
2. `PLACE-009`
3. `PLACE-010`
4. `PLACE-011`
5. `PLACE-006`
6. `PLACE-007`
7. `PLACE-001`
8. `PLACE-002`
9. `PLACE-003`
10. `PLACE-004`
11. `PLACE-005`
12. `PLACE-008`
13. `PLACE-013`
14. `PLACE-016`
15. `PLACE-014`
16. `PLACE-015`

Coverage Assessment:

- Covered: authenticated browsing, explicit guest `401`, no private-data flash, response envelope, pagination bounds, continuous scrolling, virtualization, incremental load recovery, privacy exclusions, primary filters, subtype filters, search normalization, Arabic diacritic folding, punctuation normalization, search ranking, rating-desc sorting, row navigation, create-place validation, `POST /api/v1/places` response/status contract, direct navigation to new detail for all types, shared catalog ownership, creator non-ownership, abuse prevention, moderation/admin handoff, duplicate normalized names including Arabic diacritic variants, generated artwork, HTTP 308 compatibility redirects, and optional API-supported description metadata.
- Explicitly excluded: place detail content/actions, rating save/edit logic, and list membership changes because those are covered by their own module user-story files.

Open Product Questions:

- None. Approved decisions for authentication, shared catalog ownership, duplicate contract, search ranking, large catalog browsing, abuse prevention, legacy redirects, post-create destination, and optional description have been applied.
