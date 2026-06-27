# Public Lists User Stories

Source of truth:

- `docs/feature-map/FEATURE_MAP.md`
- `docs/feature-map/FEATURE_CATALOG.md`
- `docs/feature-map/FEATURE_TREE.md`
- `docs/feature-map/FEATURE_TRACEABILITY.md`

Scope: all `PUBLIC-*` features from `FEATURE_CATALOG.md`.

Total features processed: 4
Total user stories written: 88

## Shared Public Lists Requirements

### API Contract

- Public list index endpoint: `GET /api/v1/lists/public`.
- Public list detail endpoint: `GET /api/v1/lists/public/{id}`.
- Public Lists requires authentication.
- Guest access returns `401 Unauthorized`.
- Private list access through public routes returns `404 Not Found`.
- Non-existent public list access returns `404 Not Found`.
- Server failure returns `500 Error` with a safe error payload.
- Successful list index response returns `200 OK` with a response envelope.
- Successful detail response returns `200 OK`.
- Collection response envelope includes:
  - `items`
  - `meta.limit`
  - `meta.offset`
  - `meta.total`
  - `meta.hasMore`
- `items` is an empty array when no public lists exist.
- Empty arrays are used instead of `null` for collections.

### Ordering

Public list index ordering is:

1. `updatedAt DESC`
2. `createdAt DESC`
3. `listName ASC`

Ordering must be stable across pagination, refresh, retry, and equivalent data sets.

### Visibility and Privacy

- Only lists with `visibility = public` appear in public list index and detail.
- Private lists never appear in public list index.
- Private lists requested through public detail route return `404 Not Found`.
- Denial responses must not include private list name, owner metadata, place count, places, visibility, or any other private fields.
- Private notes must never appear in:
  - Public Lists
  - Public List Detail
  - Public Place Rows
  - Public Metadata
  - API responses
  - Logs
  - Error payloads
- Public responses may expose only public-safe owner identity through `ownerDisplayName`.
- Public responses must not expose owner email, internal owner user id, auth/session data, or private account metadata.

### Read-Only Rules

- Public list routes are read-only, including when the owner opens their own public list through `/lists/public/{id}`.
- The public route does not redirect owners to the owned-list detail route.
- Public route UI must not show edit, delete, add-place, remove-place, or visibility-change controls.
- API-level authorization must also prevent non-owner mutation through owned-list mutation endpoints.
- UI hiding alone is not sufficient.

### Mobile and Accessibility Baseline

- Public list index and detail must work at `320px`, `390px`, and `200%` browser zoom.
- No horizontal overflow is allowed.
- Fixed bottom navigation must not hide final rows.
- Safe-area insets must be respected.
- Long Arabic, English, and mixed-language list names, owner names, and place names must be contained.
- Interactive targets should be at least approximately `44px`.
- Keyboard navigation, visible `focus-visible`, screen-reader labels, heading structure, touch targets, reduced motion, and error announcements are required.

## Public Lists Module

### PUBLIC-001 - Browse authenticated public lists

Feature Description: Authenticated users can browse public list summaries through a bounded, ordered public-list index.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| PUBLIC-001-US-001 | Fetch public list index | Critical | As an authenticated user, I want to browse public lists so that I can discover shared collections. | Given I am authenticated, when I open `/lists/public`, then the frontend calls `GET /api/v1/lists/public` and receives `200 OK` when successful. |
| PUBLIC-001-US-002 | Enforce index response envelope | Critical | As QA, I want public list responses predictable so that frontend and backend cannot drift. | Given `GET /api/v1/lists/public` returns `200 OK`, then response contains `items`, `meta.limit`, `meta.offset`, `meta.total`, and `meta.hasMore`. |
| PUBLIC-001-US-003 | Guest index returns 401 | Critical | As the system, I want anonymous public-list browsing blocked. | Given no valid session exists, when `GET /api/v1/lists/public` is requested, then API returns `401 Unauthorized` and no public-list data. |
| PUBLIC-001-US-004 | Show public list summaries | High | As a user, I want summary rows so that I can choose a list to open. | Given public lists exist, when the index renders, then each item shows list name, `ownerDisplayName`, place count, and public-safe metadata only. |
| PUBLIC-001-US-005 | Exclude private lists from index | Critical | As the system, I want private lists hidden from discovery. | Given public and private lists exist, when public index loads, then only lists with `visibility = public` appear. |
| PUBLIC-001-US-006 | Stable public list ordering | High | As a user, I want public lists ordered predictably. | Given multiple public lists exist, when the index renders, then lists are ordered by `updatedAt DESC`, then `createdAt DESC`, then `listName ASC`. |
| PUBLIC-001-US-007 | Stable tie-break across refresh | Medium | As QA, I want repeatable public list ordering. | Given public lists have equal `updatedAt` and `createdAt`, when the index is refreshed, then `listName ASC` produces the same order every time. |
| PUBLIC-001-US-008 | Bounded pagination metadata | High | As a user, I want public lists performant as the catalog grows. | Given public lists exceed one response page, when the API responds, then `meta.limit`, `meta.offset`, `meta.total`, and `meta.hasMore` correctly describe the page. |
| PUBLIC-001-US-009 | Pagination preserves ordering | High | As QA, I want pagination not to duplicate or skip lists. | Given I request consecutive pages with the same filters and data state, then items preserve approved ordering and do not duplicate across pages. |
| PUBLIC-001-US-010 | Empty index state | Medium | As a user, I want the empty state to be clear. | Given no public lists exist, when `/lists/public` loads, then an informational empty state appears, no fake lists appear, and no create-list CTA is shown. |
| PUBLIC-001-US-011 | Index loading state | Medium | As a user, I want loading feedback while public lists load. | Given the public-list request is pending, when the page renders, then compact layout-matching loading rows appear and do not imply real list data. |
| PUBLIC-001-US-012 | Index server error | High | As a user, I want recovery if public lists fail to load. | Given `GET /api/v1/lists/public` returns `500 Error`, when the page renders, then a concise error appears, no fake data appears, and a retry action is available. |
| PUBLIC-001-US-013 | Index retry behavior | Medium | As a user, I want to retry failed public-list loading. | Given the index request failed, when I activate retry, then `GET /api/v1/lists/public` is called again and successful data replaces the error state. |
| PUBLIC-001-US-014 | Offline index behavior | Medium | As a mobile user, I want public-list failure clear offline. | Given the device is offline or network fails, when public lists load, then a network-safe error appears with retry and no stale private data. |
| PUBLIC-001-US-015 | Private-to-public appears in index | High | As a list owner, I want sharing a list to make it discoverable. | Given an owned list changes from private to public, when public index refreshes, then the list appears according to approved ordering. |
| PUBLIC-001-US-016 | Public-to-private disappears from index | Critical | As a list owner, I want making a list private to remove it from discovery. | Given a public list changes to private, when public index refreshes, then the list no longer appears. |
| PUBLIC-001-US-017 | Stale index recovery after visibility change | High | As the system, I want stale public-list data corrected. | Given cached index data contains a list that is now private, when the index revalidates or row is opened, then stale public data is removed or access returns `404 Not Found`. |
| PUBLIC-001-US-018 | No private notes in index | Critical | As the system, I want index responses privacy-safe. | Given public lists contain places with private rating notes, when index API/UI renders, then no note content appears in response, metadata, logs, errors, or UI. |
| PUBLIC-001-US-019 | No unsupported discovery features | Medium | As Product, I want discovery limited to current scope. | Given the index renders, then it does not expose follows, feeds, recommendations, comments, anonymous browsing, or external sharing. |
| PUBLIC-001-US-020 | Mobile index at 320px and 390px | High | As a mobile user, I want public lists readable without zoom. | Given `320px` or `390px` viewport, when index renders, then rows fit, no horizontal overflow occurs, and the final row is not covered by bottom navigation. |
| PUBLIC-001-US-021 | Index at 200% zoom | High | As a low-vision user, I want public lists usable at high zoom. | Given `200%` browser zoom, when index renders, then list names, owner names, counts, and actions remain readable and reachable without horizontal scrolling. |
| PUBLIC-001-US-022 | Long list names in index | Medium | As a user, I want long list names contained. | Given a long Arabic, English, or mixed-language list name appears, then it wraps or clamps predictably without overlapping owner name or count. |
| PUBLIC-001-US-023 | Long owner names in index | Medium | As a user, I want owner names contained. | Given a long or mixed-language `ownerDisplayName`, then it wraps or clamps without horizontal overflow. |
| PUBLIC-001-US-024 | Index keyboard navigation | High | As a keyboard user, I want to browse public lists. | Given index rows render, when I use Tab/Shift+Tab/Enter, then each row is reachable in logical order with visible `focus-visible`. |
| PUBLIC-001-US-025 | Index screen-reader metadata | High | As a screen-reader user, I want list metadata announced clearly. | Given a row renders, then assistive technology can identify list name, owner display name, place count, and activation purpose. |
| PUBLIC-001-US-026 | Index reduced motion | Medium | As a motion-sensitive user, I want restrained transitions. | Given `prefers-reduced-motion` is active, then loading, row entry, and pagination transitions avoid non-essential motion. |

Story Count: 26

Coverage Assessment: Covers authenticated browsing, exact endpoint, response envelope, `401`, ordering, pagination metadata, empty/loading/error/retry/offline states, visibility transitions, stale data recovery, privacy, scope boundaries, mobile, accessibility, long names, and reduced motion.

Missing Assumptions: None.

Risks: Critical privacy and scalability risk if private lists leak or if pagination/order behavior is unstable.

### PUBLIC-002 - View public list detail

Feature Description: Authenticated users can open public list detail in read-only mode and inspect public-safe places.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| PUBLIC-002-US-001 | Fetch public list detail | Critical | As an authenticated user, I want to open a public list so that I can view its places. | Given a public list exists, when I open `/lists/public/{id}`, then frontend calls `GET /api/v1/lists/public/{id}` and receives `200 OK`. |
| PUBLIC-002-US-002 | Guest detail returns 401 | Critical | As the system, I want public list detail protected from guests. | Given no valid session exists, when `GET /api/v1/lists/public/{id}` is requested, then API returns `401 Unauthorized` and no list data. |
| PUBLIC-002-US-003 | Non-existent detail returns 404 | High | As a user, I want clear behavior for invalid links. | Given the list id does not exist, when public detail is requested, then API returns `404 Not Found` and no private fields. |
| PUBLIC-002-US-004 | Private detail returns 404 | Critical | As the system, I want private list existence protected. | Given the list exists but `visibility = private`, when requested through `/lists/public/{id}`, then API returns `404 Not Found`. |
| PUBLIC-002-US-005 | Detail response shape | Critical | As QA, I want detail payloads predictable. | Given public detail returns `200 OK`, then response includes public-safe list id, list name, `ownerDisplayName`, place count, visibility `public`, and place items; it excludes owner email, owner internal id, notes, and private metadata. |
| PUBLIC-002-US-006 | View public list metadata | High | As a user, I want metadata so that I understand the shared collection. | Given detail loads, then list name, owner display name, place count, and public visibility context are shown. |
| PUBLIC-002-US-007 | View places in public list | High | As a user, I want to inspect places in a public list. | Given the public list has places, when detail loads, then public-safe place rows are displayed. |
| PUBLIC-002-US-008 | Place row allowed fields | Critical | As the system, I want place rows public-safe. | Given place rows render in public detail, then they include only public-safe place fields such as name, type, subtype, artwork, and community rating/count where available. |
| PUBLIC-002-US-009 | No private notes in detail | Critical | As the system, I want private notes excluded from shared detail. | Given any place in the public list has private rating notes from any user, when detail API/UI/log/error output is inspected, then note content is absent. |
| PUBLIC-002-US-010 | No user-specific private context in public rows | Critical | As the system, I want public rows not to leak private context. | Given another user views a public list, then rows do not expose list membership from private lists, private rating notes, auth/session data, or private owner/user metadata. |
| PUBLIC-002-US-011 | Open place detail from public list | High | As a user, I want to inspect a place from a public list. | Given a place row appears, when I activate it, then `/places/{id}` opens. |
| PUBLIC-002-US-012 | Read-only public detail for non-owner | Critical | As the system, I want non-owners unable to modify shared lists. | Given I am not the owner, when I view public detail, then edit, delete, add-place, remove-place, and visibility controls are not shown. |
| PUBLIC-002-US-013 | Read-only public detail for owner | High | As a list owner, I want the public route to show what others see. | Given I own the public list, when I open `/lists/public/{id}`, then the page remains read-only, does not redirect, and shows no owner controls. |
| PUBLIC-002-US-014 | Empty public list detail | Medium | As a user, I want empty public lists understandable. | Given a public list has zero places, when detail loads, then a concise empty state appears and no fake places appear. |
| PUBLIC-002-US-015 | Detail loading state | Medium | As a user, I want loading feedback while public detail loads. | Given the detail request is pending, when the page renders, then compact layout-matching loading rows appear. |
| PUBLIC-002-US-016 | Detail server error | High | As a user, I want recovery if detail fails. | Given `GET /api/v1/lists/public/{id}` returns `500 Error`, then a concise error state appears with retry and no fake list/place data. |
| PUBLIC-002-US-017 | Detail retry behavior | Medium | As a user, I want retry after detail failure. | Given detail loading failed, when I activate retry, then the detail endpoint is called again and successful data replaces the error. |
| PUBLIC-002-US-018 | Already-open public detail becomes private | Critical | As the system, I want stale public detail removed when visibility changes. | Given I have a public detail page open and the list becomes private, when the page revalidates or is refreshed, then the response is `404 Not Found` and public detail content is removed. |
| PUBLIC-002-US-019 | Deleted public list behavior | High | As a user, I want deleted list links handled safely. | Given a public list is deleted, when its public detail URL is opened or refreshed, then API returns `404 Not Found` and no stale list data is shown. |
| PUBLIC-002-US-020 | Deleted place behavior | Medium | As a user, I want public list detail not broken by deleted places. | Given a place previously in a public list is deleted or unavailable, when detail loads, then the row is omitted or a safe unavailable state appears without exposing internal errors. |
| PUBLIC-002-US-021 | Large public list detail | High | As a user, I want long public lists usable. | Given a public list contains many places, when detail renders, then browsing remains performant, final rows remain reachable, and rendering avoids excessive offscreen rows where applicable. |
| PUBLIC-002-US-022 | Long public list name in detail | Medium | As a mobile user, I want long titles readable. | Given a long Arabic, English, or mixed-language list name, when detail renders, then it wraps or clamps without horizontal overflow. |
| PUBLIC-002-US-023 | Large place count formatting | Medium | As a user, I want large counts readable. | Given a public list has a large place count, when detail renders, then count uses Western digits and does not collide with owner or title text. |
| PUBLIC-002-US-024 | Detail mobile at 320px and 390px | High | As a mobile user, I want public detail usable on small screens. | Given `320px` or `390px` viewport, when detail renders, then metadata, rows, and navigation fit without horizontal overflow or bottom-nav overlap. |
| PUBLIC-002-US-025 | Detail at 200% zoom | High | As a low-vision user, I want detail usable at high zoom. | Given `200%` browser zoom, when detail renders, then content remains readable and actions/links remain reachable without horizontal scrolling. |
| PUBLIC-002-US-026 | Detail keyboard navigation | High | As a keyboard user, I want to navigate public detail. | Given detail renders, when I use keyboard navigation, then headings, place rows, back link, and retry controls are reachable in logical order with visible `focus-visible`. |
| PUBLIC-002-US-027 | Detail screen-reader metadata | High | As a screen-reader user, I want public detail announced clearly. | Given detail renders, then assistive technology identifies page heading, owner display name, place count, empty/error states, and each place row purpose. |
| PUBLIC-002-US-028 | Detail reduced motion | Medium | As a motion-sensitive user, I want public detail transitions restrained. | Given `prefers-reduced-motion` is active, then loading, row entry, and route transitions avoid non-essential motion. |
| PUBLIC-002-US-029 | Hide edit action in public route | Critical | As the system, I want public list routes read-only. | Given `/lists/public/{id}` renders for any authenticated user, including the owner, then no edit action is shown. |
| PUBLIC-002-US-030 | Hide delete action in public route | Critical | As the system, I want public list deletion blocked from public route. | Given public detail renders, then no delete action is shown. |
| PUBLIC-002-US-031 | Hide add-place action in public route | Critical | As the system, I want public route not to mutate list contents. | Given public detail renders, then no add-place action is shown. |
| PUBLIC-002-US-032 | Hide remove-place action in public route | Critical | As the system, I want public route not to remove places. | Given public detail renders with place rows, then no remove-place action is shown. |
| PUBLIC-002-US-033 | Hide visibility-change action in public route | Critical | As the system, I want visibility changes restricted to owned route. | Given public detail renders, then no public/private visibility control is shown. |
| PUBLIC-002-US-034 | Owner remains read-only on public route | High | As a list owner, I want the public route to show the viewer experience. | Given I own the public list, when I open `/lists/public/{id}`, then the page remains read-only and does not redirect to `/lists/{id}`. |
| PUBLIC-002-US-035 | Non-owner cannot edit through API | Critical | As the system, I want edit attempts blocked even if a client calls mutation APIs directly. | Given I am not the owner, when I attempt to edit a public list through owned-list mutation endpoints, then API denies the request and the list remains unchanged. |
| PUBLIC-002-US-036 | Non-owner cannot delete through API | Critical | As the system, I want deletion blocked for non-owners. | Given I am not the owner, when I attempt to delete a public list through mutation endpoints, then API denies the request and the list remains unchanged. |
| PUBLIC-002-US-037 | Non-owner cannot add place through API | Critical | As the system, I want list membership protected. | Given I am not the owner, when I attempt to add a place to a public list through mutation endpoints, then API denies the request and no list item is created. |
| PUBLIC-002-US-038 | Non-owner cannot remove place through API | Critical | As the system, I want public list contents protected. | Given I am not the owner, when I attempt to remove a place from a public list through mutation endpoints, then API denies the request and list items remain unchanged. |
| PUBLIC-002-US-039 | Non-owner cannot change visibility through API | Critical | As the system, I want visibility protected. | Given I am not the owner, when I attempt to change public/private visibility through mutation endpoints, then API denies the request and visibility remains unchanged. |
| PUBLIC-002-US-040 | UI hiding alone is insufficient | High | As QA, I want read-only enforced beyond the UI. | Given public route UI hides owner controls, when direct API mutation attempts are tested, then authorization still prevents mutation. |
| PUBLIC-002-US-041 | Read-only errors are safe | Medium | As the system, I want mutation denial errors safe. | Given a non-owner mutation is denied, then response does not expose private owner/list metadata, stack traces, or internal policy details. |
| PUBLIC-002-US-042 | Read-only tests cover owner public route | High | As QA, I want owner public route behavior stable. | Given the owner opens `/lists/public/{id}`, then automated tests verify no edit/delete/add/remove/visibility controls are present. |

Story Count: 42

Coverage Assessment: Covers exact detail endpoint, `200`, `401`, `404`, `500`, response shape, metadata, public-safe place rows, note/privacy exclusions, navigation to place detail, read-only owner and non-owner behavior, UI hiding, API-level mutation denial for edit/delete/add/remove/visibility, empty/loading/error/retry states, visibility/deletion stale-state handling, large lists, mobile, accessibility, and reduced motion.

Missing Assumptions: None.

Risks: Critical privacy and authorization risk if stale public detail, private notes, or mutation controls leak.

### PUBLIC-003 - Hide private lists from non-owners

Feature Description: Private lists are not visible to non-owners through public-list routes or APIs, and public-list routes must not reveal private resource existence.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| PUBLIC-003-US-001 | Exclude private lists from public index | Critical | As the system, I want private lists excluded from discovery. | Given a list has `visibility = private`, when `GET /api/v1/lists/public` is requested, then that list is absent from `items`. |
| PUBLIC-003-US-002 | Private public-detail access returns 404 | Critical | As the system, I want private list existence hidden. | Given a private list id is requested via `GET /api/v1/lists/public/{id}`, then API returns `404 Not Found`. |
| PUBLIC-003-US-003 | 404 response contains no private metadata | Critical | As the system, I want denial responses privacy-safe. | Given private list access returns `404`, then response does not include list name, owner, place count, visibility, places, or any private metadata. |
| PUBLIC-003-US-004 | Owner private list accessible only through owned route | High | As a list owner, I want my private list manageable only in my own area. | Given I own a private list, when I open `/lists/{id}`, then I can view/manage it; when any user opens `/lists/public/{id}`, then public route returns `404`. |
| PUBLIC-003-US-005 | Public-to-private removes public access immediately | Critical | As a list owner, I want privacy changes enforced quickly. | Given a list changes from public to private, then subsequent public index requests omit it and public detail returns `404`. |
| PUBLIC-003-US-006 | Private-to-public adds public access | High | As a list owner, I want public visibility to make a list discoverable. | Given a list changes from private to public, then public index and detail include it after refresh according to approved ordering. |
| PUBLIC-003-US-007 | Back navigation does not reveal stale private list | Critical | As the system, I want browser history safe after visibility changes. | Given a user navigates back to a cached public detail after the list became private, then revalidation removes detail content or shows `404` without private-data flash. |
| PUBLIC-003-US-008 | Guest denial precedes visibility exposure | Critical | As the system, I want guests denied before any visibility details leak. | Given a guest requests public index or detail, then API returns `401 Unauthorized` and does not reveal whether a list id exists or is private. |
| PUBLIC-003-US-009 | Public route cannot expose private place membership | Critical | As the system, I want private list membership hidden. | Given a private list contains places, when requested through public APIs, then no place ids, names, counts, or membership records are exposed. |
| PUBLIC-003-US-010 | Public route cannot expose private owner metadata | Critical | As the system, I want private owner metadata hidden. | Given a private list is requested through a public route, then no owner display name, email, internal id, or account metadata appears. |
| PUBLIC-003-US-011 | Consistent private and non-existent behavior | High | As a security reviewer, I want private and missing resources indistinguishable. | Given one request targets a private list and another targets a non-existent list, then both public-detail responses use `404 Not Found` with the same safe response shape. |
| PUBLIC-003-US-012 | Tests cover private-list denial | High | As QA, I want private-list regressions caught. | Given public-list authorization tests run, then they fail if private list names, counts, owner metadata, places, or notes appear through public routes. |

Story Count: 12

Coverage Assessment: Covers private exclusion, `404`, safe denial payloads, owned-route separation, visibility transitions both directions, stale cache/back navigation, guest denial, private membership/owner metadata protection, indistinguishable missing/private behavior, and QA regression tests.

Missing Assumptions: None.

Risks: Critical privacy risk if private list existence, metadata, or membership leaks.

### PUBLIC-004 - Show owner display name safely

Feature Description: Public list responses and UI show only public-safe owner display name, never email, internal user id, or private account data.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| PUBLIC-004-US-001 | Show owner display name in index | High | As a user browsing public lists, I want owner identity so that shared lists have context. | Given a public list summary renders, then it displays `ownerDisplayName`. |
| PUBLIC-004-US-002 | Show owner display name in detail | High | As a user viewing public list detail, I want owner identity visible. | Given public list detail loads, then the owner's `ownerDisplayName` appears. |
| PUBLIC-004-US-003 | Owner metadata allowlist | Critical | As the system, I want public owner data tightly controlled. | Given public index or detail API responds, then the only owner identity field exposed is `ownerDisplayName`. |
| PUBLIC-004-US-004 | Do not expose owner email | Critical | As the system, I want owner email hidden. | Given public list index or detail API responds, then owner email is absent from response payload, UI, logs, and error payloads. |
| PUBLIC-004-US-005 | Do not expose internal owner id | Critical | As the system, I want internal identifiers hidden. | Given public list index or detail API responds, then internal owner user id is absent from response payload and UI. |
| PUBLIC-004-US-006 | Do not expose private account metadata | Critical | As the system, I want account data private. | Given public list index or detail API responds, then auth/session fields, created account metadata, private profile fields, and internal account state are absent. |
| PUBLIC-004-US-007 | Safe fallback display name | High | As the system, I want legacy users handled without exposing email. | Given a legacy user has missing or blank display name, when a public list is rendered, then a public-safe fallback display name is used and email/internal id is not exposed. |
| PUBLIC-004-US-008 | Long owner display name containment | Medium | As a mobile user, I want long owner names readable. | Given `ownerDisplayName` is long or mixed-language, when rendered at `320px`, `390px`, or `200%` zoom, then it wraps or clamps without horizontal overflow. |
| PUBLIC-004-US-009 | Bidi-safe owner names | Medium | As an Arabic user, I want Arabic, English, and mixed owner names displayed correctly. | Given owner display name contains Arabic, English, or mixed text, then bidi isolation prevents visual reordering or corruption. |
| PUBLIC-004-US-010 | Owner display consistency across surfaces | Medium | As a user, I want identity consistent. | Given the same public list appears in index and detail, then the same `ownerDisplayName` is shown in both. |
| PUBLIC-004-US-011 | Owner rename consistency after refresh | Medium | As a user, I want changed display names reflected consistently. | Given an owner's display name changes, when public index/detail refreshes, then both surfaces show the updated display name and no stale email/id fallback. |
| PUBLIC-004-US-012 | Accessible owner identity | Medium | As a screen-reader user, I want owner identity announced clearly. | Given a public list row or detail appears, then assistive technology associates `ownerDisplayName` with the correct list. |
| PUBLIC-004-US-013 | Owner identity in error/log safety | Critical | As the system, I want failures privacy-safe. | Given an error occurs while loading owner identity, then logs and error payloads do not include email, internal id, auth/session data, or private account metadata. |
| PUBLIC-004-US-014 | Owner identity tests | High | As QA, I want public owner privacy protected by tests. | Given public-list API/UI tests run, then they fail if email, internal owner id, or private account metadata appears in public responses or rendered UI. |

Story Count: 14

Coverage Assessment: Covers owner display in index/detail, owner metadata allowlist, email/user-id/private-account-data suppression, fallback display name, long and mixed names, consistency, rename refresh, accessibility, error/log safety, and QA regression tests.

Missing Assumptions: None.

Risks: Critical privacy and trust risk if public responses expose email, internal id, or private owner metadata.

## Module Summary

Total Features Processed: 4

Total User Stories Generated: 94

Features With Highest Complexity:

- `PUBLIC-002` - public detail response, public-safe place rows, read-only enforcement, stale visibility, large lists, and accessibility.
- `PUBLIC-001` - ordered/paginated index, empty/loading/error states, stale data, and mobile browsing.
- `PUBLIC-003` - private-list denial and existence protection.
- `PUBLIC-004` - safe owner identity display.

Features With Highest Business Risk:

- `PUBLIC-003` - private list protection and existence hiding.
- `PUBLIC-002` - public route mutation prevention and note/private metadata leakage in detail.
- `PUBLIC-004` - owner identity privacy.
- `PUBLIC-001` - authenticated-only discovery and stale visibility data.

Recommended QA Priority Order:

1. `PUBLIC-003`
2. `PUBLIC-002`
3. `PUBLIC-004`
4. `PUBLIC-001`

Coverage Assessment:

- Covered: authenticated public-list browsing, `GET /api/v1/lists/public`, `GET /api/v1/lists/public/{id}`, `200`, `401`, `404`, `500`, response envelopes, pagination metadata, approved ordering, empty/loading/error/retry/offline states, private-list exclusion, public/private visibility transitions, stale cache/back-navigation safety, public detail, public-safe place rows, open place detail, read-only behavior for owner and non-owner, API-level mutation denial, owner display name, owner metadata allowlist, no email/user id/private account data, private note exclusion, mobile UX, accessibility, long names, safe areas, reduced motion, and QA regression expectations.
- Not included: anonymous public browsing, follows, social feeds, recommendations, public comments, external sharing, likes, saving another user's list, cloning lists, or public-list search because they are not current approved `PUBLIC-*` features.

Resolved Product Decisions:

- Public Lists requires authentication; guest access returns `401 Unauthorized`.
- Private list access through public route returns `404 Not Found`.
- Owner can open their own public list through public route; it remains read-only with no redirect and no owner controls.
- Public list ordering is `updatedAt DESC`, then `createdAt DESC`, then `listName ASC`.
- Public Lists empty state is informational and has no create-list CTA.
- UI hiding alone is insufficient; public-route mutation prevention requires API-level authorization.

Open Product Questions:

- None.
