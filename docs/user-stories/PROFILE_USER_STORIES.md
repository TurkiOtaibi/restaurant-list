# Profile User Stories

Source of truth:

- `docs/feature-map/FEATURE_MAP.md`
- `docs/feature-map/FEATURE_CATALOG.md`
- `docs/feature-map/FEATURE_TREE.md`
- `docs/feature-map/FEATURE_TRACEABILITY.md`

Scope: all `PROFILE-*` features from `FEATURE_CATALOG.md`.

Total features processed: 5
Total user stories written: 96

## Shared Profile Requirements

### API Contract

- Profile data is fetched with `GET /api/v1/profile`.
- Success response: `200 OK`.
- Guest or expired session response: `401 Unauthorized`.
- Server failure response: `500 Error` with a safe error payload.
- Guest users must never receive profile data.
- The profile response must include:
  - `ratingsCount`
  - `listsCount`
  - `triedRestaurantCount`
  - `triedCafeCount`
  - `triedIceCreamCount`
  - `userRatings`
  - `publicListsSummary`
- Empty collections return empty arrays, not `null`.
- Missing private notes return `notes: null`.
- Empty public-list summary returns an empty array and the UI shows a compact empty state.
- `triedPlaces` must not appear in the profile API response.

### Privacy Rules

- Profile archive data is owner-only.
- Private rating notes are returned only to the authenticated rating owner.
- Notes must never appear in:
  - Public Lists
  - Place Detail for non-owner
  - Other users' profile or public data
  - Aggregate responses
  - Logs
  - Error payloads
- The UI must never briefly expose private profile data after logout, session expiry, refresh failure, or auth recovery.

### Statistics Rules

- `ratingsCount` counts current rating rows owned by the authenticated user.
- Updating an existing rating does not increase `ratingsCount`.
- `listsCount` counts current lists owned by the authenticated user.
- Deleting a list decreases `listsCount`.
- Tried counts are derived from rated places by primary type:
  - `triedRestaurantCount`
  - `triedCafeCount`
  - `triedIceCreamCount`
- Rating archive is the canonical tried archive.
- There is no separate tried-places archive.

### Archive Ordering

Profile archive ordering is:

1. `updatedAt DESC`
2. `createdAt DESC`
3. `placeName ASC`

This ordering must be stable across refreshes, retries, and equivalent data sets.

### Mobile and Accessibility Baseline

- Profile must work at `320px`, `390px`, and `200%` browser zoom.
- Profile must not create horizontal overflow.
- Fixed bottom navigation must not cover final archive rows.
- Safe-area insets must be respected.
- Long Arabic, English, and mixed-language place/list names must be contained.
- Interactive targets should be at least approximately `44px`.
- Keyboard navigation, `focus-visible`, screen-reader labels, heading structure, error announcements, and reduced-motion behavior are required.

## Profile Module

### PROFILE-001 - View list/rating/tried counts

Feature Description: Authenticated users can view profile summary statistics including list count, rating count, and tried counts by place type.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| PROFILE-001-US-001 | Fetch profile summary from API | Critical | As an authenticated user, I want profile summary data loaded from the profile API so that my archive reflects server truth. | Given I am authenticated, when I open `/profile`, then the frontend calls `GET /api/v1/profile` and receives `200 OK`. |
| PROFILE-001-US-002 | Enforce profile response schema | Critical | As QA, I want the profile response schema explicit so that contract drift is detected. | Given `GET /api/v1/profile` returns `200 OK`, then response contains `ratingsCount`, `listsCount`, `triedRestaurantCount`, `triedCafeCount`, `triedIceCreamCount`, `userRatings`, and `publicListsSummary`. |
| PROFILE-001-US-003 | Reject guest profile access | Critical | As the system, I want profile data protected so that guests cannot access private archive data. | Given no valid session exists, when `GET /api/v1/profile` is requested, then API returns `401 Unauthorized` and no profile fields are returned. |
| PROFILE-001-US-004 | Prevent private-data flash | Critical | As a user, I want old profile data cleared when my session ends so that private data is not visible after logout or expiry. | Given logout, session expiry, refresh failure, or auth recovery occurs, when `/profile` renders or revalidates, then no previous profile summary, archive row, note, or public-list summary flashes before the signed-out state. |
| PROFILE-001-US-005 | View list count | High | As a user, I want to see my list count so that I know how many lists I own. | Given I own `N` lists, when profile summary renders, then `listsCount` displays `N` using Western digits. |
| PROFILE-001-US-006 | Update list count after deletion | High | As a user, I want list count to reflect deleted lists. | Given I delete one owned list, when profile refreshes, then `listsCount` is decremented by one and no deleted list contributes to the count. |
| PROFILE-001-US-007 | View ratings count | High | As a user, I want to see my ratings count so that I know how many ratings I have recorded. | Given I own `N` rating rows, when profile summary renders, then `ratingsCount` displays `N` using Western digits. |
| PROFILE-001-US-008 | Rating update does not increase count | Critical | As the system, I want rating counts accurate when ratings are edited. | Given I have an existing rating, when I update its rating value or note, then `ratingsCount` remains unchanged after profile refresh. |
| PROFILE-001-US-009 | Rating creation increases count | High | As a user, I want my count updated after I rate a new place. | Given I create my first rating for a place, when profile refreshes, then `ratingsCount` increases by one. |
| PROFILE-001-US-010 | View tried restaurant count | High | As a user, I want tried restaurant count visible so that restaurant history is summarized. | Given I have rated `N` restaurant places, when profile loads, then `triedRestaurantCount` equals `N`. |
| PROFILE-001-US-011 | View tried cafe count | High | As a user, I want tried cafe count visible so that cafe history is summarized. | Given I have rated `N` cafe places, when profile loads, then `triedCafeCount` equals `N`. |
| PROFILE-001-US-012 | View tried ice cream count | High | As a user, I want tried ice cream count visible so that ice cream history is included. | Given I have rated `N` ice cream places, when profile loads, then `triedIceCreamCount` equals `N`. |
| PROFILE-001-US-013 | Tried counts derive from ratings | Critical | As Product, I want tried counts derived from ratings so that there is one source of truth. | Given places exist in lists but have no current-user rating, when profile loads, then those places do not increase tried counts. |
| PROFILE-001-US-014 | Zero-state statistics | Medium | As a new user, I want empty profile stats to look intentional. | Given I have no lists or ratings, when profile loads, then all counts show `0` with no fake data and no broken layout. |
| PROFILE-001-US-015 | Handle null-free empty collections | High | As an API consumer, I want empty arrays so the UI can render predictably. | Given I have no ratings or public lists, when `GET /api/v1/profile` returns `200 OK`, then `userRatings` and `publicListsSummary` are `[]`, not `null`. |
| PROFILE-001-US-016 | Summary loading state | Medium | As a user, I want loading feedback while profile data loads. | Given `GET /api/v1/profile` is pending, when `/profile` renders, then layout-matching summary loading UI appears without fake counts. |
| PROFILE-001-US-017 | Summary server error | High | As a user, I want clear recovery when profile summary fails. | Given `GET /api/v1/profile` returns `500 Error`, when `/profile` renders, then a concise error state appears, no fake stats appear, and a retry action is available. |
| PROFILE-001-US-018 | Retry summary load | Medium | As a user, I want to retry failed profile loading. | Given profile loading failed, when I activate retry, then the frontend calls `GET /api/v1/profile` again and replaces the error state if successful. |
| PROFILE-001-US-019 | Offline profile behavior | Medium | As a mobile user, I want a clear message if profile cannot load offline. | Given the device is offline or network request fails, when profile loads, then a network-safe error is shown with retry and no stale private data from another session. |
| PROFILE-001-US-020 | Session expires during profile load | Critical | As the system, I want expired sessions handled safely. | Given `GET /api/v1/profile` returns `401 Unauthorized` during load, then private profile UI is cleared and the user is routed or prompted to sign in without private-data flash. |
| PROFILE-001-US-021 | Western numeral formatting | Medium | As an Arabic user, I want numbers readable and consistent. | Given profile counts render, then all numbers use Western digits `0-9`, not Arabic-Indic digits. |
| PROFILE-001-US-022 | Bidi-safe statistics | Medium | As an Arabic user, I want count labels and numbers visually stable. | Given Arabic labels with numeric counts render, then numeric fragments are bidi-isolated and do not reorder surrounding Arabic text. |
| PROFILE-001-US-023 | Summary mobile responsiveness | High | As a mobile user, I want profile stats usable on small screens. | Given `320px`, `390px`, and `200%` zoom, when summary renders, then no horizontal overflow occurs and all counts remain readable. |
| PROFILE-001-US-024 | Summary accessibility | High | As a screen-reader user, I want stats announced clearly. | Given summary stats render, when navigating with a screen reader, then each count has a clear accessible label and fits the page heading structure. |

Story Count: 24

Coverage Assessment: Covers API contract, `200`, `401`, `500`, response fields, summary stats, tried logic, count refresh behavior, loading/error/retry/offline/session expiry, privacy, mobile, accessibility, and number formatting.

Missing Assumptions: None.

Risks: Critical privacy and data-integrity risk if profile counts are cached, exposed to guests, or calculated from non-rating sources.

### PROFILE-002 - View `تقييماتك` archive

Feature Description: The rating archive is the canonical profile archive for tried places, rating history, and private notes.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| PROFILE-002-US-001 | View ratings archive | Critical | As an authenticated user, I want to view `تقييماتك` so that I can browse my personal rating history. | Given I have ratings, when `/profile` loads successfully, then `userRatings` renders as the `تقييماتك` archive. |
| PROFILE-002-US-002 | Archive is canonical tried history | Critical | As Product, I want the ratings archive to be the only tried archive so that profile remains clear. | Given profile renders, then no separate tried-places archive, tab, card, section, or payload-driven UI is shown. |
| PROFILE-002-US-003 | Use explicit archive ordering | Critical | As a user, I want predictable archive order so that recent activity is easy to find. | Given multiple ratings exist, when archive renders, then rows are ordered by `updatedAt DESC`, then `createdAt DESC`, then `placeName ASC`. |
| PROFILE-002-US-004 | Stable archive tie-break | High | As QA, I want deterministic order for equal timestamps. | Given two ratings have the same `updatedAt` and `createdAt`, when archive renders repeatedly, then `placeName ASC` produces the same order every time. |
| PROFILE-002-US-005 | Archive updates after rating creation | High | As a user, I want new ratings to appear in my archive. | Given I create a first rating for a place, when profile refreshes, then the new rating appears in `تقييماتك` using the approved ordering. |
| PROFILE-002-US-006 | Archive updates after rating edit | High | As a user, I want edited ratings to move and update correctly. | Given I edit a rating value or note, when profile refreshes, then the archive row shows updated data and ordering reflects updated `updatedAt`. |
| PROFILE-002-US-007 | Show place name | High | As a user, I want each archive item to identify the place. | Given archive rows exist, then each row shows the place name with long Arabic, English, and mixed-language names contained. |
| PROFILE-002-US-008 | Show place metadata | Medium | As a user, I want place type context in archive rows. | Given archive rows exist, then each row shows primary type and subtype when available without fake metadata. |
| PROFILE-002-US-009 | Show rating value | High | As a user, I want my rating visible in each row. | Given a row has rating `8.5`, when rendered, then `8.5/10` or the approved equivalent appears with Western digits and LTR numeric isolation. |
| PROFILE-002-US-010 | Open rating edit from archive | High | As a rating owner, I want to edit a rating from my archive. | Given an archive row exists, when I activate edit, then the rating edit flow opens for that row's place and current rating. |
| PROFILE-002-US-011 | Return from edit refreshes archive | High | As a user, I want profile to reflect saved edits. | Given I save a rating edit and return to profile, then profile context and archive row are refreshed from server data. |
| PROFILE-002-US-012 | Archive empty state | High | As a new user, I want a clear empty archive state. | Given `userRatings` is `[]`, when profile renders, then `تقييماتك` shows a compact empty state and no fake rows. |
| PROFILE-002-US-013 | Archive loading state | Medium | As a user, I want loading feedback while archive rows load. | Given profile data is pending, when archive area renders, then layout-matching row skeletons appear and do not imply real ratings. |
| PROFILE-002-US-014 | Archive error state | High | As a user, I want archive errors recoverable. | Given archive data cannot be loaded because `GET /api/v1/profile` fails, then the archive area shows a concise error and retry action. |
| PROFILE-002-US-015 | Partial failure: summary available, archive unavailable | High | As a user, I want partial failures handled clearly. | Given summary data is available but archive loading fails, then summary may remain visible, archive shows its own error, and no fake archive rows appear. |
| PROFILE-002-US-016 | Partial failure: archive available, summary unavailable | High | As a user, I want archive data not blocked by unrelated summary failure when separable. | Given archive data is available but summary fails in a separable fetch path, then archive remains visible and summary shows its own error; if the API is a single response, the page shows one safe retry state. |
| PROFILE-002-US-017 | Large archive uses virtualization | High | As a heavy user, I want a large archive to remain fast. | Given I have a large number of rating rows, when profile renders, then browsing is continuous, pagination is not the primary UX, and rendering is limited to visible rows plus buffer rows. |
| PROFILE-002-US-018 | Large archive scroll position stability | Medium | As a user, I want archive scrolling stable. | Given a large archive is virtualized, when rows render or refresh, then visible rows do not jump unexpectedly and focused row remains reachable. |
| PROFILE-002-US-019 | Bottom navigation does not cover archive | High | As a mobile user, I want the last archive row reachable. | Given a long archive on mobile, when I scroll to the end, then the final row is fully visible above the bottom navigation and safe-area inset. |
| PROFILE-002-US-020 | Archive mobile width support | High | As a mobile user, I want archive rows readable without zoom. | Given `320px`, `390px`, and `200%` zoom, when archive renders, then no horizontal overflow occurs and place names/ratings do not collide. |
| PROFILE-002-US-021 | Long Arabic name containment | Medium | As a user, I want long Arabic names readable. | Given an archive row has `مطعم مأكولات بحرية ومشويات الخليج التقليدية`, then the name wraps or clamps predictably without leaving the viewport. |
| PROFILE-002-US-022 | Long English name containment | Medium | As a user, I want long English names contained. | Given an archive row has `The Original Cheesecake Factory Restaurant & Bakery`, then the name wraps or clamps predictably without overlapping the rating. |
| PROFILE-002-US-023 | Mixed-language name containment | Medium | As a user, I want mixed names readable in RTL. | Given an archive row has `مطعم Five Guys فرع King Abdullah Financial District`, then Arabic/English segments maintain correct bidi order and no overflow occurs. |
| PROFILE-002-US-024 | Archive keyboard navigation | High | As a keyboard user, I want to navigate archive rows and actions. | Given archive rows render, when I use Tab/Shift+Tab/Enter, then row links and edit actions are reachable in logical order with visible `focus-visible`. |
| PROFILE-002-US-025 | Archive screen-reader labels | High | As a screen-reader user, I want archive rows announced clearly. | Given an archive row renders, then screen reader output includes place name, type/subtype when present, rating value, note preview state when present, and edit action label. |
| PROFILE-002-US-026 | Archive reduced motion | Medium | As a motion-sensitive user, I want archive transitions restrained. | Given `prefers-reduced-motion` is active, then archive loading, row entry, and virtualization transitions do not use non-essential motion. |
| PROFILE-002-US-027 | Archive retry after network recovery | Medium | As a mobile user, I want archive retry to work after reconnecting. | Given archive load failed due to network error, when network returns and I activate retry, then profile refetches and archive renders current rows. |
| PROFILE-002-US-028 | Archive does not expose other users' ratings | Critical | As the system, I want profile archive scoped to current user. | Given another user has ratings, when I load my profile, then `userRatings` contains only ratings owned by my user id. |

Story Count: 28

Coverage Assessment: Covers canonical archive, exact ordering, creation/update refresh, row contents, rating formatting, edit access, empty/loading/error/partial failure states, virtualization, mobile, safe areas, long names, keyboard/screen-reader support, reduced motion, retry, and ownership boundaries.

Missing Assumptions: None.

Risks: Critical product and privacy risk if archive ordering, ownership, or canonical tried behavior is ambiguous.

### PROFILE-003 - View own private notes

Feature Description: Users can view their own private rating notes in the profile archive; notes are sensitive owner-only data.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| PROFILE-003-US-001 | View own private note | Critical | As a rating owner, I want to view my private note in profile so that I can remember personal context. | Given my rating has a non-empty note, when I view profile archive, then the note preview is visible only to me. |
| PROFILE-003-US-002 | Return null for missing notes | High | As an API consumer, I want missing notes represented predictably. | Given a rating has no note, when `GET /api/v1/profile` returns `userRatings`, then that rating has `notes: null`. |
| PROFILE-003-US-003 | Hide empty note UI | Medium | As a user, I do not want empty note placeholders. | Given `notes: null`, when archive row renders, then no blank note, fake note, or empty placeholder appears. |
| PROFILE-003-US-004 | Trimmed blank notes disappear | High | As a user, I want cleared notes removed from profile. | Given I save a note containing only whitespace through rating edit, when profile refreshes, then API returns `notes: null` and the archive row shows no note preview. |
| PROFILE-003-US-005 | Long note preview is contained | High | As a mobile user, I want long notes previewed without breaking rows. | Given a note approaches the allowed maximum length, when archive renders, then the preview is clamped to the approved compact preview length and no horizontal overflow occurs. |
| PROFILE-003-US-006 | Full note access through edit flow | Medium | As a user, I want to review or change a long note intentionally. | Given a note is longer than the preview, when I open rating edit from the archive row, then the full note is available in the edit flow. |
| PROFILE-003-US-007 | Notes update after edit | High | As a user, I want edited notes reflected in profile. | Given I edit a note and save, when profile refreshes, then the archive row shows the updated note preview from server data. |
| PROFILE-003-US-008 | Notes owner-only API rule | Critical | As the system, I want notes returned only to owners. | Given user A has a rating note, when user B requests their own profile or any public surface, then user A's note is not present. |
| PROFILE-003-US-009 | Notes excluded from Public Lists | Critical | As the system, I want public lists safe. | Given a public list contains a place I rated with a note, when another user views that public list, then my note is not included in response payloads or UI. |
| PROFILE-003-US-010 | Notes excluded from Place Detail for non-owner | Critical | As the system, I want place details safe for non-owners. | Given I rated a place with a note, when another user views that place detail, then my note is not returned or rendered. |
| PROFILE-003-US-011 | Notes excluded from other users' profile/public data | Critical | As the system, I want profile data scoped by owner. | Given another user has notes, when I view any current public or profile surface available to me, then their notes are absent. |
| PROFILE-003-US-012 | Notes excluded from aggregate responses | Critical | As the system, I want aggregate rating data privacy-safe. | Given rating aggregates are calculated, then notes are not included in aggregate response fields or intermediate client-visible payloads. |
| PROFILE-003-US-013 | Notes excluded from logs | Critical | As the system, I want notes protected operationally. | Given profile or rating errors occur, then private note content is not written to application logs, client console logs, analytics, or telemetry. |
| PROFILE-003-US-014 | Notes excluded from error payloads | Critical | As the system, I want safe errors. | Given an error occurs while loading profile or notes, then error responses do not include note content or raw rating payloads. |
| PROFILE-003-US-015 | Note screen-reader association | Medium | As a screen-reader user, I want note previews associated with the correct rating. | Given a note preview appears, then assistive technology announces it in the context of the correct place/rating row. |
| PROFILE-003-US-016 | Note contrast and readability | Medium | As a user, I want note previews readable on dark UI. | Given a note preview appears, then text contrast meets WCAG AA for normal text where applicable. |
| PROFILE-003-US-017 | Note mobile containment | High | As a mobile user, I want notes to fit small screens. | Given `320px`, `390px`, or `200%` zoom, when a note preview renders, then it does not overlap rating, actions, or navigation. |
| PROFILE-003-US-018 | Notes cleared after logout | Critical | As the system, I want notes removed from local UI after logout. | Given I log out from any tab, when profile UI updates, then note previews and any cached private profile rows are cleared before signed-out UI appears. |

Story Count: 18

Coverage Assessment: Covers own-note visibility, null behavior, blank/cleared notes, long note previews, full note access through edit, update refresh, privacy exclusions across public lists/place detail/other profiles/aggregates/logs/errors, accessibility, contrast, mobile containment, and logout cleanup.

Missing Assumptions: None.

Risks: Critical privacy risk if note content leaks through non-profile surfaces, logs, errors, or stale UI.

### PROFILE-004 - View own public list summary

Feature Description: Profile shows a compact summary of the current user's own public lists.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| PROFILE-004-US-001 | View own public lists summary | Medium | As a user, I want to see my public lists on profile so that I know what I have shared. | Given I own public lists, when profile loads, then `publicListsSummary` renders those lists in a compact summary. |
| PROFILE-004-US-002 | Exclude private lists | High | As a user, I want private lists excluded from public summary. | Given I own private lists, when profile public-list summary renders, then private lists are not shown. |
| PROFILE-004-US-003 | Show compact empty state | Medium | As a user with no public lists, I want the section handled intentionally. | Given `publicListsSummary` is `[]`, when profile renders, then the public-list section remains visible with a compact empty state and no fake public lists. |
| PROFILE-004-US-004 | Empty summary array contract | Medium | As an API consumer, I want predictable empty public-list data. | Given I have no public lists, when `GET /api/v1/profile` returns `200 OK`, then `publicListsSummary` is `[]`, not `null`. |
| PROFILE-004-US-005 | Visibility change to public appears | High | As a user, I want public-list summary updated after sharing a list. | Given I change an owned list from private to public, when profile refreshes, then the list appears in `publicListsSummary`. |
| PROFILE-004-US-006 | Visibility change to private disappears | Critical | As a user, I want private lists removed immediately from public summary. | Given an owned list appears in public summary, when I change it to private and profile refreshes, then it no longer appears. |
| PROFILE-004-US-007 | Deleted list disappears | High | As a user, I want deleted lists removed from profile summary. | Given an owned public list is deleted, when profile refreshes, then it is absent from `publicListsSummary` and `listsCount` is updated. |
| PROFILE-004-US-008 | Place count accuracy | Medium | As a user, I want public-list summary counts accurate. | Given a public list contains `N` places, when profile renders, then that summary item shows `N` using Western digits. |
| PROFILE-004-US-009 | Open public list from profile | Medium | As a user, I want to open a public list from profile. | Given a public-list summary item appears, when I activate it, then the public list detail opens. |
| PROFILE-004-US-010 | Owner display consistency | Medium | As a user, I want public list identity consistent. | Given my public list appears in profile or public-list views, then owner display name is the same public-safe display name and no email/internal id is shown. |
| PROFILE-004-US-011 | Public summary owner-only scope | High | As the system, I want profile public summary scoped to the current user. | Given other users have public lists, when I load my profile, then `publicListsSummary` contains only my owned public lists. |
| PROFILE-004-US-012 | Public summary loading state | Medium | As a user, I want loading feedback for public-list summary. | Given profile data is pending, when the public-list section renders, then a compact loading state appears without fake list names. |
| PROFILE-004-US-013 | Public summary error handling | Medium | As a user, I want recoverable public-list summary failure. | Given public-list summary fails in a separable fetch path, then the section shows a concise error and retry; if profile is a single response, the page uses the profile-level retry state. |
| PROFILE-004-US-014 | Long list names contained | Medium | As a mobile user, I want long public-list names readable. | Given a public list has a long Arabic, English, or mixed-language name, when profile renders, then text wraps or clamps without horizontal overflow. |
| PROFILE-004-US-015 | Public summary accessibility | Medium | As a keyboard or screen-reader user, I want public list summary accessible. | Given summary items render, then each item is keyboard reachable, has a meaningful accessible name, and has visible `focus-visible`. |
| PROFILE-004-US-016 | Public summary mobile safe area | Medium | As a mobile user, I want public-list summary reachable near page bottom. | Given `320px`, `390px`, or `200%` zoom, when I scroll to public-list summary, then it is not covered by bottom navigation or browser safe area. |

Story Count: 16

Coverage Assessment: Covers own public-list summary, compact empty state, empty-array contract, private exclusion, visibility transitions, deletion, counts, navigation, owner display, owner-only scope, loading/error behavior, long names, accessibility, and mobile safe areas.

Missing Assumptions: None.

Risks: High privacy risk if private lists remain visible after visibility transitions or if other users' public lists appear in a private profile summary.

### PROFILE-005 - Separate `triedPlaces` collection deprecated

Feature Description: Separate `triedPlaces` payload is deprecated/legacy; profile archive must use `userRatings` only.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| PROFILE-005-US-001 | Do not show separate tried places archive | Critical | As Product, I want no separate tried places archive so that ratings archive remains canonical. | Given profile renders, then there is no separate `triedPlaces` section, tab, row group, card, or heading. |
| PROFILE-005-US-002 | Do not return triedPlaces in profile API | Critical | As an API consumer, I want profile response unambiguous. | Given `GET /api/v1/profile` returns `200 OK`, then the response does not include a top-level or nested `triedPlaces` collection. |
| PROFILE-005-US-003 | Frontend uses userRatings only | Critical | As the frontend, I want archive rendering driven by one field. | Given profile API response is consumed, then profile archive reads `userRatings` and does not depend on `triedPlaces`. |
| PROFILE-005-US-004 | Ignore accidental triedPlaces safely | High | As the system, I want accidental legacy fields not to reintroduce duplicate UI. | Given an accidental `triedPlaces` field appears in a mocked or future response, when frontend renders profile, then it does not render a separate tried archive. |
| PROFILE-005-US-005 | Tests fail if triedPlaces returns | High | As QA, I want regressions detected. | Given profile API contract tests run, then they fail if `triedPlaces` appears in `GET /api/v1/profile` response. |
| PROFILE-005-US-006 | Tests fail if tried archive UI appears | High | As QA, I want duplicate archive UI prevented. | Given profile UI tests run, then they fail if a separate tried-places archive appears alongside `تقييماتك`. |
| PROFILE-005-US-007 | Tried counts remain supported | High | As a user, I want tried counts without duplicate archive concepts. | Given profile summary renders, then tried restaurant/cafe/ice cream counts derive from ratings while the archive remains `تقييماتك`. |
| PROFILE-005-US-008 | Documentation marks triedPlaces legacy | Medium | As a future analyst or developer, I want legacy status clear. | Given feature documentation is reviewed, then `PROFILE-005` states separate `triedPlaces` is deprecated/legacy and `userRatings` is canonical. |
| PROFILE-005-US-009 | No migration path needed for triedPlaces UI | Low | As Product, I want scope clear. | Given no separate tried archive is implemented, then no migration, backfill, or new UI is required for `triedPlaces`. |
| PROFILE-005-US-010 | Profile refresh preserves canonical model | Medium | As QA, I want refresh behavior consistent. | Given profile is refreshed after rating create/update/list changes, then `تقييماتك` remains the only archive surface. |

Story Count: 10

Coverage Assessment: Covers removal from API, frontend dependency, accidental legacy field handling, regression tests, tried counts, documentation, no migration expectation, and profile refresh behavior.

Missing Assumptions: None.

Risks: High product confusion risk if a second tried archive returns.

## Module Summary

Total Features Processed: 5

Total User Stories Generated: 96

Features With Highest Complexity:

- `PROFILE-002` - canonical rating archive, exact ordering, virtualization, mobile containment, edit flow, partial failure behavior.
- `PROFILE-001` - summary statistics, API contract, session safety, stale-data prevention, count consistency.
- `PROFILE-003` - private note visibility, exclusion from public surfaces/logs/errors, mobile containment.
- `PROFILE-004` - public/private list transitions, owner-only scope, empty summary state.
- `PROFILE-005` - preventing legacy `triedPlaces` return and duplicate archive UI.

Features With Highest Business Risk:

- `PROFILE-003` - private notes and privacy boundaries.
- `PROFILE-001` - profile authorization and no private-data flash.
- `PROFILE-002` - canonical archive accuracy and owner-only data.
- `PROFILE-004` - public/private list summary privacy.
- `PROFILE-005` - deprecated tried archive reintroduction.

Recommended QA Priority Order:

1. `PROFILE-003`
2. `PROFILE-001`
3. `PROFILE-002`
4. `PROFILE-004`
5. `PROFILE-005`

Coverage Assessment:

- Covered: `GET /api/v1/profile`, `200`, `401`, `500`, response schema, owner-only profile access, no private-data flash, profile summary, list count, ratings count, tried restaurant/cafe/ice cream counts, count update rules, `تقييماتك` archive, exact archive ordering, archive browsing, archive refresh, rating notes, note privacy, edit rating access, public lists summary, compact public-summary empty state, empty arrays/null behavior, loading states, error states, retry, offline behavior, partial failure, mobile profile UX, accessibility, logout/session expiry safety, privacy rules, personal archive behavior, statistics accuracy, large archive virtualization, and `triedPlaces` deprecation.
- Not included: separate tried places archive, followers, activity feed, profile editing, avatar, social profile, anonymous public profile, password/account settings, or rating deletion because they are not current `PROFILE-*` features.

Resolved Product Decisions:

- Profile archive ordering is `updatedAt DESC`, then `createdAt DESC`, then `placeName ASC`.
- Users with no public lists see a compact public-list summary empty state.
- Unauthorized profile API access returns `401 Unauthorized` and no profile data.
- UI must never expose private profile data after logout, session expiry, refresh failure, or auth recovery.
- Large rating archives use virtualization as the preferred strategy with continuous browsing.
- Ratings archive is canonical; `triedPlaces` must not appear in profile API responses or UI.

Open Product Questions:

- None.
