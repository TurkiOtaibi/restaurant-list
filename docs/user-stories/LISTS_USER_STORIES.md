# Lists User Stories

Source of truth:

- `docs/feature-map/FEATURE_MAP.md`
- `docs/feature-map/FEATURE_CATALOG.md`
- `docs/feature-map/FEATURE_TREE.md`
- `docs/feature-map/FEATURE_TRACEABILITY.md`

Scope: all `LIST-*` features from `FEATURE_CATALOG.md`.

Out of scope for this file:

- Public-list browsing and public-list detail behavior are covered in `docs/user-stories/PUBLIC_LISTS_USER_STORIES.md`.
- Place creation/search taxonomy behavior is covered in `docs/user-stories/PLACES_USER_STORIES.md`.
- Rating/list independence and rating side effects are covered in `docs/user-stories/RATINGS_USER_STORIES.md`.

Total features processed: 11
Total user stories written: 140

## Shared Lists Business Rules

- Lists require authentication for owner views, create, edit, delete, add item, and remove item.
- Owned list APIs must never expose another user's private list data through `/api/v1/lists` or `/api/v1/lists/{id}`.
- List visibility values are exactly `private` and `public`.
- New lists default to `private` when visibility is omitted.
- List name is required, trimmed before persistence, and limited to 80 characters.
- Duplicate list names are allowed for the same user and across users.
- List identity is the list ID, not the list name.
- Owned list collections return `{ data, meta }` with `meta.limit`, `meta.offset`, `meta.total`, and `meta.sort`.
- `limit` must be between 1 and 100. `offset` must be 0 or greater.
- Owned lists sort by `created_at_desc` with stable `id` descending tie-break.
- `placeCount` is list membership count, not unique-place count across all lists.
- After successful list creation, the user navigates directly to the newly created List Detail page.
- Add-to-list targets exactly one owned list.
- Duplicate add is idempotent: new membership returns `201`, existing membership returns `200`, and no duplicate `list_items` row is created.
- Deleting a list deletes list memberships only; it does not delete places or ratings.
- Deleting a list uses a standard destructive confirmation dialog, not typed confirmation.
- Removing a place from a list deletes only that list membership; it does not delete the place or ratings.
- Removing a place from a list is immediate and should provide an undo toast/snackbar for short-window recovery.
- Add-place search no-results state provides a path to Create Place with the search query prefilled where appropriate.
- Large list detail views should use virtualization as the preferred UX strategy: a single continuous list with only visible rows plus buffer rows rendered.
- Public visibility makes a list eligible for public-list endpoints; private visibility removes that eligibility.
- Public list responses may expose `ownerDisplayName` only; they must not expose owner email, refresh-token data, or private account data.
- Public list read-only browsing is owned by the Public Lists module.

## Lists Module

### LIST-001 - View owned lists

Feature Description: Authenticated users can view their owned lists on `/lists`.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| LIST-001-US-001 | View owned lists | Critical | As an authenticated user, I want to view my owned lists so that I can access my collections. | Given I have a valid session, when I open `/lists`, then the frontend requests `GET /api/v1/lists` and renders only lists where I am the owner. |
| LIST-001-US-002 | Reject guest access | Critical | As the system, I want guests blocked from owned list data so that private collections are protected. | Given I have no valid session, when I open `/lists` or call `GET /api/v1/lists`, then no owned list data is returned and the UI shows an authentication prompt. |
| LIST-001-US-003 | Return collection envelope | Critical | As an API consumer, I want owned lists returned in an envelope so that pagination is reliable. | Given `GET /api/v1/lists` succeeds, then response shape is `{ data: ListResponse[], meta: { limit, offset, total, sort } }`. |
| LIST-001-US-004 | Enforce pagination bounds | Critical | As the system, I want bounded list queries so that large accounts do not overload the client. | Given `limit < 1`, `limit > 100`, or `offset < 0`, when the API validates the request, then it returns `422` and no partial list data. |
| LIST-001-US-005 | Support paginated owned lists | High | As a user with many lists, I want additional lists available without loading everything at once. | Given valid `limit` and `offset`, when lists are requested, then the API returns that slice and accurate `meta.total`. |
| LIST-001-US-006 | Sort owned lists consistently | High | As a user, I want my newest lists first so that recent work is easy to access. | Given owned lists exist, when `GET /api/v1/lists` returns, then lists are ordered by `created_at DESC`, then `id DESC`, and `meta.sort` is `created_at_desc`. |
| LIST-001-US-007 | Render owned list row data | High | As a user, I want each list row to show useful metadata so that I can scan quickly. | Given a list is returned, when it renders, then it shows list name, `placeCount`, visibility, and no private account data beyond my own context. |
| LIST-001-US-008 | Show empty owned-list state | High | As a new user, I want a clear empty state so that I know how to start. | Given `meta.total = 0`, when `/lists` loads, then the UI shows concise copy equivalent to "لا توجد قوائم" and one create-list action. |
| LIST-001-US-009 | Show loading state | Medium | As a user, I want layout feedback while lists load so that the screen does not look broken. | Given the list request is pending, when `/lists` renders, then compact list-row skeletons appear and no fake list data is shown. |
| LIST-001-US-010 | Show recoverable error state | High | As a user, I want a recovery action when lists fail to load so that I can retry. | Given the API returns 5xx or a network failure occurs, when `/lists` renders, then a concise error state appears with retry and no false data. |
| LIST-001-US-011 | Open list detail from row | Critical | As a user, I want to open a list from the index so that I can view its places. | Given an owned list row is visible, when I activate it by pointer or keyboard, then `/lists/{id}` opens for that list ID. |
| LIST-001-US-012 | Keep mobile list index usable | High | As a mobile user, I want list rows to fit naturally so that I do not zoom out. | Given 320 px, 390 px, and 200% zoom pressure, when `/lists` renders, then there is no horizontal overflow and bottom navigation does not cover the final row. |

Story Count: 12

Coverage Assessment: Covers authenticated listing, guest denial, envelope, pagination, sorting, row data, empty/loading/error states, row navigation, and mobile containment.

Missing Assumptions: None.

Risks: Large accounts remain performance-sensitive if frontend does not expose incremental loading when needed.

### LIST-002 - View list count and place count

Feature Description: The Lists page summarizes owned list count and total place membership count.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| LIST-002-US-001 | Show owned list count | High | As a user, I want to see how many lists I own so that I understand my archive size. | Given owned lists load, when summary renders, then list count equals the current user's owned list total, not public lists or another user's lists. |
| LIST-002-US-002 | Show total place membership count | High | As a user, I want to see how many saved list memberships I have so that collection size is clear. | Given my lists contain places, when summary renders, then total place count equals the sum of `placeCount` across owned lists, including the same place if saved in multiple lists. |
| LIST-002-US-003 | Show zero counts safely | Medium | As a new user, I want zero states to be clear so that the UI is not misleading. | Given I own no lists, when summary renders, then it shows zero counts or intentionally omits summary values without showing stale nonzero data. |
| LIST-002-US-004 | Update count after create | High | As a user, I want counts updated after creating a list so that the page remains accurate. | Given a create-list request succeeds, when owned lists refresh, then list count increments and new list `placeCount` is 0. |
| LIST-002-US-005 | Update count after delete | High | As a user, I want counts updated after deleting a list so that removed memberships are no longer counted. | Given a delete-list request succeeds, when owned lists refresh, then list count decrements and total place membership count removes that list's memberships. |
| LIST-002-US-006 | Update count after add item | High | As a user, I want place counts updated after adding a place so that list metadata is reliable. | Given add-to-list succeeds with new membership, when data refreshes, then the target list `placeCount` increments by 1. |
| LIST-002-US-007 | Keep count unchanged after idempotent add | High | As a user, I want duplicate adds not to inflate counts. | Given a place is already in the list, when add-to-list returns idempotent success, then `placeCount` remains unchanged. |
| LIST-002-US-008 | Update count after removal | High | As a user, I want place counts updated after removal so that metadata is current. | Given remove-place succeeds, when list data refreshes, then the target list `placeCount` decrements by 1. |
| LIST-002-US-009 | Format counts for RTL | Medium | As an Arabic user, I want numeric counts readable in RTL UI. | Given counts render, then digits use Western `0-9`, numeric fragments are bidi-isolated, and labels do not overlap at 320 px width. |

Story Count: 9

Coverage Assessment: Covers list count, membership-count definition, zero states, mutation updates, idempotent add behavior, removal updates, and numeral formatting.

Missing Assumptions: None; count semantics are defined as memberships, not globally unique places.

Risks: Count trust degrades quickly if client-side cache does not refresh after mutations.

### LIST-003 - Create list with visibility

Feature Description: Users can create a list with a name and private/public visibility.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| LIST-003-US-001 | Open create list flow | Critical | As an authenticated user, I want to open create list so that I can start a collection. | Given I am authenticated, when I choose create list, then an accessible dialog or mobile sheet opens with name and visibility controls. |
| LIST-003-US-002 | Require authentication to create | Critical | As the system, I want only authenticated users creating lists so that ownership is valid. | Given I am a guest, when I call `POST /api/v1/lists`, then the API denies the request and no list row is created. |
| LIST-003-US-003 | Require list name | Critical | As the system, I want list name required so that lists have usable metadata. | Given `name` is missing or empty, when I save, then validation fails and no list is created. |
| LIST-003-US-004 | Reject whitespace-only name | Critical | As the system, I want whitespace-only names rejected so that blank-looking lists are impossible. | Given `name` contains only spaces, when saved, then the effective trimmed name is invalid and no list is created. |
| LIST-003-US-005 | Trim list name on create | High | As a user, I want accidental spacing cleaned so that list names look intentional. | Given `name = "  برجر الرياض  "`, when created, then the persisted/displayed name is `برجر الرياض`. |
| LIST-003-US-006 | Enforce list name max length | Critical | As the system, I want list names bounded so that UI and storage remain safe. | Given trimmed `name` exceeds 80 characters, when submitted, then API returns `422` and no list is created. |
| LIST-003-US-007 | Default new list to private | Critical | As a user, I want safe privacy defaults so that a list is not accidentally public. | Given visibility is omitted, when the list is created, then `visibility = private`. |
| LIST-003-US-008 | Create private list | Critical | As a user, I want to create a private list so that only I can access it through owned routes. | Given valid name and `visibility=private`, when `POST /api/v1/lists` succeeds, then response returns `201` and a `ListResponse` with `visibility=private`. |
| LIST-003-US-009 | Create public list | High | As a user, I want to create a public list so that authenticated users can view it through public-list routes. | Given valid name and `visibility=public`, when creation succeeds, then response returns `201`, owner can manage it, and it is eligible for public-list endpoints. |
| LIST-003-US-010 | Reject invalid visibility | Critical | As the system, I want only approved visibility values so that privacy cannot drift. | Given visibility is not `private` or `public`, when submitted, then API returns `422` and no list is created. |
| LIST-003-US-011 | Allow duplicate list names | Medium | As a user, I want duplicate list names allowed so that I can organize flexibly. | Given I already own a list with the same name, when I create another valid list with that name, then creation succeeds with a different list ID. |
| LIST-003-US-012 | Navigate to new list detail after create | Critical | As a user, I want to land in the new list immediately so that I can add places next. | Given list creation succeeds, when the API returns the new list ID, then the dialog/sheet closes and the app navigates directly to `/lists/{newListId}` rather than returning to My Lists or remaining in the dialog. |
| LIST-003-US-013 | Preserve input after create failure | High | As a user, I want to retry after failure without retyping. | Given network or 5xx failure occurs, when the error is shown, then entered name and visibility selection remain in the dialog/sheet. |
| LIST-003-US-014 | Cancel create without mutation | Medium | As a user, I want cancel to leave data unchanged. | Given the create flow is open with unsaved input, when I cancel and confirm any unsaved-change guard if shown, then no API mutation occurs. |
| LIST-003-US-015 | Announce create validation errors | High | As a screen-reader user, I want validation errors announced so that I can fix the form. | Given name or visibility validation fails, then the invalid control has an accessible error message and focus remains within the dialog/sheet. |
| LIST-003-US-016 | Keep create flow mobile-safe | High | As a mobile user, I want list creation usable without zooming. | Given 320 px width and keyboard pressure, when the create sheet opens, then all controls remain reachable, touch targets are at least approximately 44 px, and no horizontal overflow occurs. |

Story Count: 16

Coverage Assessment: Covers auth, required/trim/max-length validation, private default, public/private creation, invalid visibility, duplicate names, direct navigation to new detail, retry, cancel, accessibility, and mobile behavior.

Missing Assumptions: None.

Risks: Privacy default and invalid visibility are critical trust risks.

### LIST-004 - Rename owned list

Feature Description: Owners can rename their own lists.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| LIST-004-US-001 | Open rename flow | High | As a list owner, I want to open edit list so that I can rename a list. | Given I own a list, when I choose edit, then the dialog/sheet opens with the current name prefilled. |
| LIST-004-US-002 | Require owner to rename | Critical | As the system, I want only owners to rename lists so that users cannot modify others' collections. | Given I do not own a list, when I call `PATCH /api/v1/lists/{id}`, then the API denies access without exposing private list data. |
| LIST-004-US-003 | Rename with valid name | Critical | As a list owner, I want to rename a list so that its title stays accurate. | Given I submit a valid trimmed name, when the API succeeds, then response returns updated `name` and `updatedAt` changes. |
| LIST-004-US-004 | Reject empty rename | Critical | As the system, I want empty rename values rejected so that list metadata remains valid. | Given `name` is missing or empty, when submitted, then API returns validation error and old name remains unchanged. |
| LIST-004-US-005 | Reject whitespace-only rename | Critical | As the system, I want whitespace-only rename values rejected. | Given `name` contains only spaces, when submitted, then validation fails and old name remains unchanged. |
| LIST-004-US-006 | Trim rename value | High | As a user, I want accidental spacing cleaned when renaming. | Given `name = "  قهوة  "`, when rename succeeds, then stored/displayed name is `قهوة`. |
| LIST-004-US-007 | Enforce rename max length | Critical | As the system, I want renamed list names bounded. | Given trimmed `name` exceeds 80 characters, when submitted, then API returns `422` and old name remains unchanged. |
| LIST-004-US-008 | Allow rename to duplicate name | Medium | As a user, I want duplicate names allowed during rename. | Given I own another list with the target name, when I rename this list to that same name, then update succeeds for the selected list ID. |
| LIST-004-US-009 | Save unchanged name harmlessly | Low | As a user, I want accidental saves to be harmless. | Given I submit the current valid name, when save succeeds, then list remains valid and no duplicate-name error appears. |
| LIST-004-US-010 | Handle stale deleted list | High | As a user, I want clear recovery if the list was deleted elsewhere. | Given the list no longer exists when I save, then the API returns not found, the UI shows a recoverable error, and no false success appears. |
| LIST-004-US-011 | Preserve input after rename failure | Medium | As a user, I want retry without retyping. | Given network or 5xx failure occurs, when error appears, then the attempted name remains in the form and old persisted name remains on the page. |
| LIST-004-US-012 | Cancel rename without mutation | Medium | As a user, I want cancel to discard unsaved rename changes. | Given edit flow is open, when I cancel, then no `PATCH` is sent and displayed persisted name remains unchanged. |
| LIST-004-US-013 | Keep rename dialog accessible | High | As a keyboard or screen-reader user, I want rename accessible. | Given edit dialog is open, then labels, focus trap, Escape handling, validation announcements, and focus restoration work. |

Story Count: 13

Coverage Assessment: Covers owner-only rename, validation, trimming, max length, duplicate names, unchanged save, stale data, retry, cancel, and accessibility.

Missing Assumptions: Privacy-preserving denial may be `404` or equivalent; the contract must not reveal another user's private list.

Risks: Unauthorized rename and weak validation are high-risk ownership/data-quality defects.

### LIST-005 - Change public/private visibility

Feature Description: Owners can change a list's visibility between private and public.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| LIST-005-US-001 | Show current visibility | High | As a list owner, I want to see current visibility so that I know who can view the list. | Given edit flow opens, then current `visibility` is selected and announced accessibly. |
| LIST-005-US-002 | Require owner for visibility change | Critical | As the system, I want only owners changing visibility so that privacy cannot be bypassed. | Given I do not own a list, when I call `PATCH /api/v1/lists/{id}/visibility`, then the API denies access without exposing private list data. |
| LIST-005-US-003 | Change private to public | Critical | As a list owner, I want to make a list public so that authenticated users can view it through public routes. | Given my list is private, when I save `visibility=public`, then response returns `visibility=public` and the list becomes eligible for public-list index/detail. |
| LIST-005-US-004 | Change public to private | Critical | As a list owner, I want to make a list private so that non-owners can no longer view it. | Given my list is public, when I save `visibility=private`, then response returns `visibility=private` and the list is removed from public-list eligibility. |
| LIST-005-US-005 | Reject invalid visibility update | Critical | As the system, I want only valid visibility values accepted. | Given visibility is not `private` or `public`, when submitted, then API returns `422` and existing visibility remains unchanged. |
| LIST-005-US-006 | Preserve owner access after private change | Critical | As a list owner, I want to keep managing my list after making it private. | Given I change public to private, when I open `/lists/{id}`, then I can still view and manage the owned list. |
| LIST-005-US-007 | Remove public discoverability after private change | High | As a user, I want privacy changes to take effect immediately. | Given a public list is changed to private, when an authenticated non-owner queries public-list endpoints, then that list is not returned. |
| LIST-005-US-008 | Add public discoverability after public change | High | As a user, I want published lists discoverable by authenticated users. | Given a private list is changed to public, when authenticated users query public-list endpoints, then the list can appear with safe owner display name. |
| LIST-005-US-009 | Avoid exposing sensitive owner data | Critical | As the system, I want public visibility to expose only public-safe owner metadata. | Given a list is public, when public responses include owner identity, then they include `ownerDisplayName` only and never email, refresh token data, or private account data. |
| LIST-005-US-010 | Preserve selection after visibility failure | Medium | As a user, I want to retry visibility changes without confusion. | Given network or 5xx failure occurs, when error appears, then persisted visibility remains unchanged and the attempted selection is still visible for retry. |
| LIST-005-US-011 | Cancel visibility edit without mutation | Medium | As a user, I want cancel to leave privacy unchanged. | Given visibility is changed in the edit UI but not saved, when I cancel, then no visibility API call is sent. |
| LIST-005-US-012 | Make visibility control accessible | High | As a keyboard or screen-reader user, I want private/public controls understandable. | Given visibility control renders, then selected state is announced, both options are keyboard reachable, and state is not communicated by color alone. |

Story Count: 12

Coverage Assessment: Covers current state, owner-only mutation, both transitions, invalid value, owner access, public discoverability, sensitive-data protection, retry, cancel, and accessibility.

Missing Assumptions: Any extra warning before making public is product-owned and not required by current scope.

Risks: Visibility is the highest privacy-risk area in Lists.

### LIST-006 - Delete owned list

Feature Description: Owners can delete their lists after confirmation; places and ratings remain.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| LIST-006-US-001 | Open delete confirmation | Critical | As a list owner, I want confirmation before deletion so that I do not delete accidentally. | Given I own a list, when I choose delete, then an accessible confirmation dialog opens before any delete request is sent. |
| LIST-006-US-002 | Use clear destructive copy | High | As a user, I want delete consequences clear so that I know what will happen. | Given confirmation opens, then copy states the list will be deleted and places/ratings will not be deleted. |
| LIST-006-US-003 | Cancel deletion | High | As a user, I want to cancel delete so that I can recover from accidental action. | Given confirmation is open, when I cancel or press Escape, then no `DELETE` request is sent and the list remains unchanged. |
| LIST-006-US-004 | Require owner to delete | Critical | As the system, I want only owners deleting lists so that users cannot destroy others' data. | Given I do not own a list, when I call `DELETE /api/v1/lists/{id}`, then the API denies access without exposing private list data. |
| LIST-006-US-005 | Delete list successfully | Critical | As a list owner, I want to delete a list so that obsolete collections are removed. | Given I confirm deletion, when `DELETE /api/v1/lists/{id}` succeeds, then response is `{ deleted: true }` and the list no longer appears in my owned lists. |
| LIST-006-US-006 | Delete list items with list | Critical | As the system, I want list memberships removed when deleting a list so that no orphaned list items remain. | Given a list has `list_items`, when the list is deleted, then its list item rows are deleted in the same successful operation. |
| LIST-006-US-007 | Preserve places on list delete | Critical | As the system, I want deleting a list not to delete catalog places. | Given a deleted list contained places, when deletion completes, then those places still exist in the Places catalog. |
| LIST-006-US-008 | Preserve ratings on list delete | Critical | As the system, I want deleting a list not to delete ratings. | Given places in the deleted list have ratings, when deletion completes, then rating rows and aggregates remain unchanged. |
| LIST-006-US-009 | Roll back failed deletion | Critical | As the system, I want failed deletes not to leave partial data. | Given a delete operation fails before commit, then the list and its memberships remain unchanged and no false success is shown. |
| LIST-006-US-010 | Handle stale deleted list | High | As a user, I want clear feedback if the list was already deleted elsewhere. | Given the list no longer exists, when I confirm delete, then the API returns not found and the UI routes or refreshes without showing stale controls. |
| LIST-006-US-011 | Keep destructive dialog accessible | High | As a keyboard or screen-reader user, I want destructive actions clear and safe. | Given confirmation opens, then focus moves into the dialog, cancel and delete are labeled, destructive action is distinguishable, and focus restores after close. |
| LIST-006-US-012 | Do not require typed confirmation | Medium | As a user, I want list deletion confirmation clear but not unnecessarily slow. | Given any list deletion is initiated, then the UI uses a standard destructive confirmation dialog with explicit warning, confirm button, and cancel button, and does not require typed confirmation. |

Story Count: 12

Coverage Assessment: Covers standard confirmation, destructive copy, no typed confirmation, cancel, owner-only access, success response, cascade memberships, preserving places/ratings, rollback, stale data, accessibility, and large-list safety.

Missing Assumptions: None.

Risks: High trust risk if users think deleting a list deletes places/ratings or if partial deletion occurs.

### LIST-007 - View owned list detail

Feature Description: Owners can view list detail, metadata, and contained places.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| LIST-007-US-001 | View owned list detail | Critical | As a list owner, I want to view list detail so that I can see places in a collection. | Given I own a list, when I open `/lists/{id}`, then the app requests `GET /api/v1/lists/{id}` and renders list name, visibility, `placeCount`, and items. |
| LIST-007-US-002 | Deny non-owner detail | Critical | As the system, I want owned detail routes protected so that private collections are not exposed. | Given I do not own the list, when I open `/lists/{id}` or call the endpoint, then the system returns not found or equivalent privacy-preserving denial and exposes no list data. |
| LIST-007-US-003 | Reject guest detail access | Critical | As the system, I want guests denied from owned list detail. | Given I am not authenticated, when I open `/lists/{id}`, then I see an authentication prompt and no list data is returned. |
| LIST-007-US-004 | Show private list metadata | High | As a list owner, I want private state visible so that I understand the list's privacy. | Given the list is private, when detail renders, then visibility is shown as private and no public-read-only controls are implied. |
| LIST-007-US-005 | Show public list metadata for owner | High | As a list owner, I want public state visible while retaining management controls. | Given the list is public and I own it, when detail renders, then visibility is shown as public and owner edit/delete/add/remove controls remain available. |
| LIST-007-US-006 | Show list item rows | High | As a user, I want places in the list visible and scannable. | Given the list has items, when detail renders, then each item shows place name, type, subtype when present, rating when present, and no fake missing data. |
| LIST-007-US-007 | Open place from list item | High | As a user, I want list items to open place detail. | Given a place row is visible in list detail, when activated by pointer or keyboard, then `/places/{id}` opens. |
| LIST-007-US-008 | Show empty list state | High | As a user, I want a clear empty state when a list has no places. | Given `items` is empty, when detail loads, then a concise empty state appears with an add-place action for the owner. |
| LIST-007-US-009 | Show detail loading state | Medium | As a user, I want feedback while list detail loads. | Given detail request is pending, then compact skeleton rows appear and no fake list items are shown. |
| LIST-007-US-010 | Show detail API error with retry | High | As a user, I want a recovery path when detail fails. | Given network or 5xx failure occurs, then a concise error state and retry action appear without false data. |
| LIST-007-US-011 | Keep detail counts accurate | High | As a user, I want `placeCount` to match visible memberships. | Given detail response contains `items`, when rendered, then `placeCount` equals membership count represented by the response after refresh. |
| LIST-007-US-012 | Virtualize large list detail | Critical | As a user with many saved places, I want list detail to behave like a continuous archive without pagination friction. | Given a list contains many items, when detail renders, then the user experiences one continuous list while rendering is limited to visible rows plus buffer rows as an engineering implementation detail. |
| LIST-007-US-013 | Preserve behavior under virtualization | High | As a user, I want large and small lists to behave consistently. | Given virtualization is active, when I scroll, open a place, remove an item, or return from detail, then item order, `placeCount`, focus behavior, and visible row content remain consistent. |
| LIST-007-US-014 | Keep list detail mobile-safe | High | As a mobile user, I want detail usable without zooming. | Given 320 px, 390 px, and 200% zoom pressure, when detail renders, then item rows, menus, and metadata remain contained and final content is not hidden by navigation. |

Story Count: 14

Coverage Assessment: Covers owner detail, privacy denial, guest denial, metadata, item rows, place navigation, empty/loading/error states, count accuracy, virtualization for large lists, and mobile behavior.

Missing Assumptions: None.

Risks: Unauthorized detail access and large-list performance are the primary risks.

### LIST-008 - Search and add existing place

Feature Description: Owners can search the server-side catalog and add one existing place to one owned list.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| LIST-008-US-001 | Open add-place flow | Critical | As a list owner, I want to open add place so that I can add an existing place to my list. | Given I own a list, when I choose add place, then an accessible dialog/sheet opens for the current list ID only. |
| LIST-008-US-002 | Require owner to add | Critical | As the system, I want users adding only to owned lists so that others' lists cannot be modified. | Given I do not own the list, when I call `POST /api/v1/lists/{id}/items`, then the API denies access without exposing private list data. |
| LIST-008-US-003 | Search server-side catalog | Critical | As a user, I want search to query the full catalog so that places outside the current page can be found. | Given I type a query, when search runs, then the dialog requests `GET /api/v1/places?q=...` server-side rather than filtering only already-loaded client rows. |
| LIST-008-US-004 | Use paginated search results | Critical | As a user with a large catalog, I want add-place search to remain complete and performant. | Given search returns many matches, then results use the Places collection envelope with `limit`, `offset`, `total`, and bounded page size. |
| LIST-008-US-005 | Preserve active search query while loading | Medium | As a user, I want to understand what search result is loading. | Given a query is entered and request is pending, then loading state is tied to that query and does not show stale results as final. |
| LIST-008-US-006 | Show no search results | Medium | As a user, I want clear feedback when no matching place exists. | Given server search returns zero results, then the dialog shows a concise no-results state and does not show fake places. |
| LIST-008-US-007 | Handle search API error | High | As a user, I want search failures recoverable. | Given search API fails, then an error state appears with retry and the typed query remains. |
| LIST-008-US-008 | Handle blank search query | Medium | As a user, I want blank search behavior predictable. | Given the search field is empty or whitespace-only, then the dialog either shows an initial bounded catalog page or asks for search input, but must not send unbounded catalog requests. |
| LIST-008-US-009 | Enforce place search length | High | As the system, I want long search text bounded. | Given `q` exceeds 120 characters, when search is sent, then Places API returns `422` and the dialog shows a validation/error state. |
| LIST-008-US-010 | Support special-character search safely | High | As the system, I want search characters handled safely. | Given query contains `%`, `_`, backslash, Arabic text, English text, or mixed text, then server search treats them safely and UI remains contained. |
| LIST-008-US-011 | Select exactly one place | High | As Product, I want one add action to target one place and one list so that scope stays simple. | Given results render, when I add a place, then the request includes only the selected `placeId` and current `list_id`. |
| LIST-008-US-012 | Reject missing place ID | High | As the system, I want invalid add payloads rejected. | Given `placeId` is missing or empty, when submitted, then API returns validation error and no list item is created. |
| LIST-008-US-013 | Reject nonexistent place ID | High | As the system, I want adding nonexistent places rejected. | Given `placeId` does not exist, when add is submitted, then API returns not found and no list item is created. |
| LIST-008-US-014 | Mark already-added places | High | As a user, I want to know if a result is already in the list so that I do not repeat work. | Given search result is already in the current list, when displayed, then UI indicates it is already added or disables duplicate add while preserving idempotent backend safety. |
| LIST-008-US-015 | Add selected place successfully | Critical | As a user, I want to add a selected place so that the list gains that item. | Given I select a place not already in the list, when add succeeds, then API returns `201`, list detail refreshes, and the new place appears once. |
| LIST-008-US-016 | Preserve dialog state after add failure | Medium | As a user, I want to retry add failures without repeating search. | Given add request fails due to network or 5xx, then current query/results remain and error is shown without adding the item optimistically. |
| LIST-008-US-017 | Offer create-place fallback on no results | High | As a user, I want to add a new place when search cannot find it so that I can continue my task. | Given server search returns zero results, when no-results state renders, then it shows "لم تجد المكان؟" and an "إضافة مكان جديد" action. |
| LIST-008-US-018 | Prefill create-place from search where appropriate | Medium | As a user, I want my search text reused so that creating the missing place is faster. | Given I choose "إضافة مكان جديد" from no-results and the query is valid as a place-name draft, then Create Place opens with the existing search query prefilled where supported. |
| LIST-008-US-019 | Keep no-results fallback honest | High | As Product, I want no fake search results so that catalog trust is preserved. | Given search returns no results, then the UI must not display fake or placeholder place rows; it only offers create-place navigation as a separate action. |
| LIST-008-US-020 | Keep add-place dialog accessible and mobile-safe | High | As a mobile keyboard or screen-reader user, I want add-place usable. | Given 320 px width or keyboard navigation, then search input, results, add controls, close/cancel, no-results fallback, loading/errors, and focus restoration remain usable without horizontal overflow. |

Story Count: 20

Coverage Assessment: Covers owner-only add, full server-side search, pagination, blank/no-results/loading/error states, create-place fallback from no-results, long/special queries, one-list/one-place rule, invalid payloads, already-added state, success, retry, accessibility, and mobile.

Missing Assumptions: None.

Risks: Search completeness is critical; client-only filtering would miss valid places.

### LIST-009 - Duplicate add returns idempotent success

Feature Description: Adding the same place to the same list again succeeds without creating duplicate rows.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| LIST-009-US-001 | Prevent duplicate membership row | Critical | As the system, I want duplicate list items prevented so that list data remains clean. | Given `(list_id, place_id)` already exists, when add is requested again, then no second `list_items` row is created. |
| LIST-009-US-002 | Return 201 for new add | Critical | As an API consumer, I want creation status accurate so that clients can react correctly. | Given membership does not exist, when `POST /api/v1/lists/{id}/items` succeeds, then response status is `201` and the item is returned. |
| LIST-009-US-003 | Return 200 for idempotent existing add | High | As an API consumer, I want repeat add status accurate so that duplicate taps are harmless. | Given membership already exists, when add is submitted again, then response status is `200`, existing membership is returned, and count does not increase. |
| LIST-009-US-004 | Enforce database uniqueness | Critical | As the system, I want database protection so that concurrent requests cannot create duplicates. | Given two concurrent add requests use the same `(list_id, place_id)`, when both complete, then exactly one row exists. |
| LIST-009-US-005 | Recover from duplicate race | Critical | As the system, I want duplicate races handled as idempotent success. | Given an `IntegrityError` occurs because another request created the row first, then the service rolls back, loads the existing item, and returns idempotent success. |
| LIST-009-US-006 | Keep UI item display unique | High | As a user, I want the list detail to show one row per membership. | Given duplicate add is attempted, when list detail refreshes, then the place appears exactly once. |
| LIST-009-US-007 | Keep counts stable on duplicate add | High | As a user, I want counts not inflated by duplicate taps. | Given duplicate add returns `200`, then `placeCount` remains unchanged after refresh. |
| LIST-009-US-008 | Keep rating state unchanged | High | As the system, I want duplicate add not to affect ratings. | Given a rated place is added again to the same list, then no rating is created, edited, deleted, or duplicated. |
| LIST-009-US-009 | Avoid duplicate error for normal users | Medium | As a user, I want accidental duplicate taps to feel harmless. | Given duplicate add happens through UI, then the UI should show success/already-added state, not a blocking duplicate error. |
| LIST-009-US-010 | Preserve owner authorization before idempotency | Critical | As the system, I want idempotency not to bypass ownership. | Given the list belongs to another user, when duplicate or non-duplicate add is attempted, then access is denied before returning membership data. |

Story Count: 10

Coverage Assessment: Covers DB uniqueness, 201/200 semantics, race handling, UI uniqueness, count stability, rating safety, user experience, and authorization precedence.

Missing Assumptions: None.

Risks: Critical data-integrity risk if uniqueness or race handling fails.

### LIST-010 - Remove place from owned list

Feature Description: Owners can remove a place membership from an owned list without deleting the place.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| LIST-010-US-001 | Remove place membership immediately | Critical | As a list owner, I want to remove a place quickly so that collection maintenance stays lightweight. | Given a place is in my owned list, when I choose remove, then no confirmation dialog is required and `DELETE /api/v1/lists/{id}/items/{place_id}` is sent. |
| LIST-010-US-002 | Require owner to remove | Critical | As the system, I want only owners removing list items so that other users cannot modify lists. | Given I do not own the list, when I attempt removal, then access is denied without exposing private list data. |
| LIST-010-US-003 | Reject removal from nonexistent list | High | As the system, I want invalid list removals handled predictably. | Given `list_id` does not exist for the current user, when removal is attempted, then API returns not found and no data changes. |
| LIST-010-US-004 | Reject removal of absent item | High | As the system, I want repeated or invalid removals handled clearly. | Given the place is not in the list, when removal is attempted, then API returns not found and no unrelated data changes. |
| LIST-010-US-005 | Return delete response on success | Medium | As an API consumer, I want a predictable removal response. | Given removal succeeds, then response includes `{ deleted: true }`. |
| LIST-010-US-006 | Preserve place record | Critical | As the system, I want removing from a list not to delete the place. | Given a membership is removed, when Places is queried, then the place still exists. |
| LIST-010-US-007 | Preserve ratings | High | As the system, I want removing from a list not to delete ratings. | Given the removed place has ratings, when membership is removed, then ratings and community aggregates remain unchanged. |
| LIST-010-US-008 | Update list detail after removal | High | As a user, I want removed places gone from the current list. | Given removal succeeds, when detail refreshes, then the place row is absent and `placeCount` decrements by 1. |
| LIST-010-US-009 | Show empty state after last removal | Medium | As a user, I want the list state clear after removing the final item. | Given the removed item was the last membership, when detail refreshes, then empty-list state appears. |
| LIST-010-US-010 | Recover from removal failure | High | As a user, I want failed removals not to silently change the list. | Given network or 5xx failure occurs, then an error is shown and the item remains visible or is restored if an optimistic update was attempted. |
| LIST-010-US-011 | Show undo after removal | High | As a user, I want quick recovery after removing a place so that accidental removals are reversible. | Given removal succeeds, then an undo toast/snackbar appears for a short period and activating undo re-adds the same place to the same list if ownership still permits it. |
| LIST-010-US-012 | Expire undo safely | Medium | As the system, I want undo to be time-limited so that state remains predictable. | Given the undo window expires, when the user does not activate undo, then the removal remains final and no automatic re-add occurs. |
| LIST-010-US-013 | Handle undo failure | Medium | As a user, I want undo failures explained so that recovery state is clear. | Given undo is activated but re-add fails due to network, authorization, or missing place/list, then the UI shows an error and does not display false restored state. |
| LIST-010-US-014 | Keep remove action accessible and non-destructive-looking | Medium | As a keyboard or screen-reader user, I want removal understandable. | Given remove action is available, then it has accessible name "إزالة من القائمة" or equivalent, is keyboard reachable, announces undo availability after success, and does not imply deleting the place itself. |

Story Count: 14

Coverage Assessment: Covers immediate removal without confirmation, owner-only access, not-found cases, response shape, place/rating preservation, count updates, empty-after-removal, undo recovery, undo expiry/failure, and accessibility.

Missing Assumptions: None.

Risks: User trust risk if remove is confused with deleting a place or rating.

### LIST-011 - Duplicate list names allowed

Feature Description: Users may create or rename multiple lists with the same name; no unique list-name constraint exists.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| LIST-011-US-001 | Allow duplicate owned list names on create | Medium | As a user, I want duplicate list names allowed so that I can organize flexibly. | Given I already own a list named `برجر`, when I create another valid list named `برجر`, then creation succeeds with a different list ID. |
| LIST-011-US-002 | Allow duplicate names across users | Medium | As the system, I want list-name uniqueness not enforced globally. | Given another user owns a list with the same name, when I create my own list with that name, then creation succeeds. |
| LIST-011-US-003 | Allow rename to duplicate owned name | Medium | As a user, I want to rename a list to an existing name so that naming stays flexible. | Given I own two lists, when I rename one to the other's valid name, then update succeeds for the selected list ID. |
| LIST-011-US-004 | Distinguish duplicate lists by ID | High | As the system, I want duplicate names distinguished by ID so that actions target the correct list. | Given two lists share the same name, when I open, edit, delete, add to, or remove from one, then the operation uses the selected list ID only. |
| LIST-011-US-005 | Avoid duplicate-name validation error | Medium | As a user, I do not want false duplicate-name errors. | Given duplicate names are allowed, when create or rename uses an existing valid name, then no duplicate-name validation error appears. |
| LIST-011-US-006 | Provide visual disambiguation for duplicates | Medium | As a user, I want duplicate names still understandable in the UI. | Given multiple owned lists share a name, when rendered, then metadata such as place count, visibility, date/order, or route identity helps distinguish them. |
| LIST-011-US-007 | Preserve public duplicate safety | Medium | As a public-list viewer, I want duplicate public names distinguishable. | Given two public lists share a name, then public UI can distinguish them with owner display name and list route identity without exposing email or internal user ID. |
| LIST-011-US-008 | Keep duplicate-name behavior documented for QA | Low | As QA, I want duplicate-name allowance explicit so that tests do not expect rejection. | Given test cases are generated from this file, then duplicate list names are expected to succeed for create and rename. |

Story Count: 8

Coverage Assessment: Covers duplicate create, cross-user duplicate, duplicate rename, ID-based targeting, no false errors, UI disambiguation, public-safe duplicate display, and QA clarity.

Missing Assumptions: None.

Risks: Duplicate names can confuse users if row metadata is too sparse.

## Module Summary

Total Features Processed: 11

Total User Stories Generated: 140

Features With Highest Complexity:

- `LIST-008` - server-side search, no-results create-place fallback, pagination, already-added state, and add mutation.
- `LIST-003` - create validation, privacy default, dialog/sheet accessibility, and mobile behavior.
- `LIST-007` - owner-only detail, virtualization, large-list performance, and item rendering.
- `LIST-005` - visibility/privacy transitions and discoverability effects.
- `LIST-009` - idempotency, status semantics, race handling, and DB uniqueness.

Features With Highest Business Risk:

- `LIST-005` - public/private visibility and sensitive owner metadata.
- `LIST-007` - private list exposure through owned detail routes.
- `LIST-006` - destructive deletion and data preservation.
- `LIST-009` - duplicate membership and race conditions.
- `LIST-008` - incomplete search or missing create-place fallback causing users to lose task continuity.

Recommended QA Priority Order:

1. `LIST-005`
2. `LIST-007`
3. `LIST-009`
4. `LIST-008`
5. `LIST-006`
6. `LIST-003`
7. `LIST-010`
8. `LIST-004`
9. `LIST-001`
10. `LIST-002`
11. `LIST-011`

Coverage Assessment:

- Covered: owned list browsing, collection envelope, pagination, sorting, counts, create, direct navigation to new list detail, rename, visibility, standard delete confirmation without typed confirmation, owned detail, virtualization for large list detail, add place search, create-place fallback from no-results, duplicate membership idempotency, immediate removal with undo, duplicate list names, validation, authorization, privacy, accessibility, mobile behavior, loading states, empty states, error/retry behavior, rollback expectations, and data-integrity rules.
- Not included: anonymous public-list browsing, follows/social behavior, admin moderation, and bulk list actions because those are not approved `LIST-*` scope.
