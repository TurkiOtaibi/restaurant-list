# سجل - Main Sections Feature Map

Source branch inspected: `main`  
Source SHA inspected: `db4fceab4ba271d3b35a4f1491e8dffeace1869b`  
Date: 2026-07-01  
Scope: product feature map for the three primary navigation sections: `قوائمي`, `الأماكن`, `صفحتي`.

This document is based on repository evidence only: frontend routes/components, FastAPI routes, TypeScript API models, backend API tests, Playwright E2E tests, and existing product documentation.

## 1. Executive Summary

The current product model is clear and compact:

- `قوائمي` is the user's owned list workspace. It owns list creation, editing, deletion, visibility, list detail, adding places to lists, removing places, and the entry point to public lists.
- `الأماكن` is the catalog and place memory workspace. It owns browsing places, category segmentation, search, subtype filtering, place detail, creating places, adding a place to a list, and rating a place.
- `صفحتي` is the personal archive workspace. It owns profile statistics, personal rating history, private notes, public-list summary, and logout.

Current product maturity: the core MVP is implemented and covered by API/E2E tests. The product is mostly production-ready as a three-section Arabic-first RTL PWA, with a few minor information-architecture gaps:

- Public Lists are implemented as a secondary flow under `قوائمي`, not as a fourth primary section. This matches the requested product model but should remain explicitly documented.
- Ratings are implemented as a cross-section capability, surfaced from `الأماكن` and summarized in `صفحتي`, not as a primary section.
- Some backend capabilities are intentionally not exposed directly in UI, such as description metadata and explicit sort selection.
- Public profile behavior is not implemented as a standalone user-facing feature.
- PWA install metadata exists; true offline app behavior is limited to network-safe error states, not offline cached usage.

Final product interpretation: the three main sections are sufficient. No additional primary navigation section is justified by current code or tests.

## 2. Navigation Model

Primary navigation evidence: `frontend/src/components/AppNav.tsx`.

| Section | Route | Purpose | Primary user intent | Main entry points | Related secondary flows |
|---|---|---|---|---|---|
| `قوائمي` | `/lists` | Owned lists and list management | Organize places into personal/public lists | Bottom nav, post-create/list return routes | `/lists/new`, `/lists/{id}`, `/lists/public`, `/lists/public/{id}` |
| `الأماكن` | `/places` | Place catalog, discovery, detail, create, rating entry | Find, create, inspect, save, and rate places | Bottom nav, login/register default destination, legacy redirects | `/places/new`, `/places/{id}`, `/places/{id}/rate`, `/restaurants`, `/cafes` |
| `صفحتي` | `/profile` | Personal archive and account summary | Review personal ratings, stats, public-list summary, and logout | Bottom nav | `/places/{id}/rate` from archive edit, `/lists/public` from public-list summary |

Secondary navigation notes:

- `/restaurants` redirects to `/places?type=restaurant`; `/cafes` redirects to `/places?type=cafe`. Evidence: `frontend/app/restaurants/page.tsx`, `frontend/app/cafes/page.tsx`, `frontend/tests/e2e/sprint3-real.spec.ts`.
- Auth screens (`/login`, `/register`) are outside the three-section product model and hide the primary nav. Evidence: `frontend/src/components/AppNav.tsx`, `frontend/app/login/page.tsx`, `frontend/app/register/page.tsx`.
- Public Lists are not a primary nav tab. They are surfaced from `قوائمي` and `صفحتي`. Evidence: `frontend/app/lists/page.tsx`, `frontend/src/features/profile/ProfileArchivePage.tsx`.

## 3. Feature Map by Section

### 3.1 قوائمي

| Feature group | Feature | Description | User value | Current status | Evidence | Related route/page/component | Related API | Related tests | Notes / gaps |
|---|---|---|---|---|---|---|---|---|---|
| Lists index | View owned lists | Shows current user's lists, list count, and total place count. | Gives fast access to personal collections. | IMPLEMENTED | `frontend/app/lists/page.tsx`; `backend/app/api/lists.py` | `/lists`; `ListCard`; `ListLoadingState` | `GET /api/v1/lists` | `backend/tests/api/test_places_and_lists.py`; `frontend/tests/e2e/sprint3-real.spec.ts` | Requires authentication. |
| Lists index | Public lists entry point | Shows a quiet link to public lists from `قوائمي`. | Lets users browse shared lists without adding a primary nav item. | IMPLEMENTED | `frontend/app/lists/page.tsx`; `frontend/src/features/lists/PublicListsPage.tsx` | `/lists`; `/lists/public` | `GET /api/v1/lists/public` | `backend/tests/api/test_sprint2.py`; `frontend/tests/e2e/sprint3-real.spec.ts` | Public Lists remain secondary under Lists. |
| Lists index | Empty state | Shows create-first-list and public-list exploration actions when no owned lists exist. | Helps new users start without clutter. | IMPLEMENTED | `frontend/app/lists/page.tsx`; `EmptyState` | `/lists` | `GET /api/v1/lists` | User stories `LIST-001`; responsive tests | Empty state is authenticated-only. |
| List creation | Create list | Creates a list with name and visibility. | Allows users to organize places. | IMPLEMENTED | `frontend/app/lists/new/page.tsx`; `CreateListDialog`; `backend/app/api/lists.py` | `/lists/new`; bottom sheet/modal | `POST /api/v1/lists` | `frontend/tests/e2e/sprint3-real.spec.ts`; `backend/tests/api/test_places_and_lists.py` | Validation occurs in UI and API. |
| List creation | Create-list validation | Requires list name and shows Arabic validation copy after submit. | Prevents accidental blank lists. | IMPLEMENTED | `CreateListDialog`; `frontend/tests/e2e/sprint3-real.spec.ts` | `/lists/new` | `POST /api/v1/lists` | E2E list flow | Uses existing design-system input error patterns. |
| List detail | View owned list detail | Shows list name, visibility, place count, and place rows. | Lets owners manage one list. | IMPLEMENTED | `frontend/app/lists/[id]/page.tsx`; `PlaceCard` | `/lists/{id}` | `GET /api/v1/lists/{id}` | `frontend/tests/e2e/sprint3-real.spec.ts` | Owner-only. Non-owner access returns not found. |
| List detail | Add place to list | Search existing places and add selected place. | Lets users populate a list from catalog data. | IMPLEMENTED | `AddPlaceDialog`; `backend/app/api/lists.py`; `backend/app/api/places.py` | `/lists/{id}` | `GET /api/v1/places?q=...`; `POST /api/v1/lists/{id}/items` | `backend/tests/api/test_places_and_lists.py`; E2E list flow | If no result, dialog links to create place. |
| List detail | Remove place from list | Removes a place through row overflow menu and shows undo. | Prevents accidental destructive taps and supports recovery. | IMPLEMENTED | `frontend/app/lists/[id]/page.tsx`; `ActionMenu`; `Toast` | `/lists/{id}` | `DELETE /api/v1/lists/{id}/items/{place_id}`; undo uses `POST /items` | `frontend/tests/e2e/sprint3-real.spec.ts`; `backend/tests/api/test_places_and_lists.py` | Undo window is frontend-owned; final removal persists server-side. |
| List detail | Edit list | Edit name and visibility in a dialog/sheet. | Keeps list metadata current. | IMPLEMENTED | `EditListDialog`; `VisibilitySelector` | `/lists/{id}` | `PATCH /api/v1/lists/{id}`; `PATCH /api/v1/lists/{id}/visibility` | `frontend/tests/e2e/sprint3-real.spec.ts`; `backend/tests/api/test_sprint2.py` | Visibility response uses `data` envelope. |
| List detail | Delete list | Deletes owned list after confirmation. | Lets users clean up obsolete lists. | IMPLEMENTED | `DeleteListDialog`; `frontend/app/lists/[id]/page.tsx` | `/lists/{id}` | `DELETE /api/v1/lists/{id}` | `frontend/tests/e2e/sprint3-real.spec.ts`; `backend/tests/api/test_places_and_lists.py` | Deletes list/memberships, not places or ratings. |
| Visibility | Public/private behavior | Public lists are visible through public-list routes; private lists are hidden from others. | Enables selective sharing without exposing private data. | IMPLEMENTED | `backend/app/api/lists.py`; `PublicListsPage`; `PublicListDetailPage` | `/lists/public`; `/lists/public/{id}` | `GET /api/v1/lists/public`; `GET /api/v1/lists/public/{id}` | `backend/tests/api/test_sprint2.py` | Guests are still denied public-list access. |
| Permissions | Ownership rules | Only owner can view/manage owned list route and mutations. | Protects private collections. | IMPLEMENTED | `backend/app/api/lists.py`; list services | `/lists/{id}` | Owned list endpoints | `backend/tests/api/test_places_and_lists.py` | Non-owner owned detail/update/delete returns 404. |
| Public lists | Authenticated public-list browsing | Authenticated users can browse public lists and public list details. | Supports lightweight sharing/discovery. | IMPLEMENTED | `PublicListsPage`; `PublicListDetailPage`; `ListCard` | `/lists/public`; `/lists/public/{id}` | Public list endpoints | `backend/tests/api/test_sprint2.py`; user stories `PUBLIC-*` | Public list detail is read-only. |

### 3.2 الأماكن

| Feature group | Feature | Description | User value | Current status | Evidence | Related route/page/component | Related API | Related tests | Notes / gaps |
|---|---|---|---|---|---|---|---|---|---|
| Catalog | Places list | Authenticated place catalog with virtualized/incremental loading. | Lets users browse all saved places. | IMPLEMENTED | `PlaceLibraryPage`; `VirtualList`; `backend/app/api/places.py` | `/places` | `GET /api/v1/places` | `frontend/tests/e2e/places-acceptance-harness.spec.ts`; `backend/tests/api/test_places_and_lists.py` | Uses page size 20 in UI. |
| Catalog | Category segmentation | Segments places by restaurant, cafe, and ice cream. | Matches mental model of food-place categories. | IMPLEMENTED | `taxonomy.ts`; `PlaceLibraryPage` | `/places?type=restaurant|cafe|ice_cream` | `GET /api/v1/places?type=` | `frontend/tests/e2e/sprint3-real.spec.ts`; `PLACE-*` docs | Legacy `/restaurants` and `/cafes` redirect here. |
| Filtering | Restaurant subtype filter | Filters restaurant places by approved subtype. | Helps narrow large restaurant catalogs. | IMPLEMENTED | `taxonomy.ts`; `PlaceLibraryPage`; `backend/app/api/places.py` | `/places?type=restaurant&subtype=...` | `GET /api/v1/places` | `backend/tests/api/test_places_and_lists.py`; `frontend/tests/e2e/sprint3-real.spec.ts` | Invalid subtype returns 422. |
| Filtering | Cafe subtype filter | Filters cafes by coffee/tea subtype. | Helps narrow cafe catalog. | IMPLEMENTED | `taxonomy.ts`; `backend/app/api/places.py` | `/places?type=cafe&subtype=coffee|tea` | `GET /api/v1/places` | `backend/tests/api/test_places_and_lists.py` | Duplicate subtype query rejected by backend. |
| Filtering | Ice cream no-subtype behavior | Ice cream category has no subtype selector. | Keeps category simple. | IMPLEMENTED | `taxonomy.ts`; `PlaceLibraryPage`; `CreatePlaceDialog` | `/places?type=ice_cream` | `GET/POST /api/v1/places` | `frontend/tests/e2e/sprint3-real.spec.ts`; API tests | Subtype for ice cream is rejected. |
| Search | Name search | Searches by place name only. | Finds known places quickly. | IMPLEMENTED | `PlaceLibraryPage`; `SearchField`; places service | `/places?q=` | `GET /api/v1/places?q=` | `backend/tests/api/test_places_and_lists.py`; E2E library flow | Search does not match type labels. |
| Sorting | Default rating sort | Catalog uses `rating_desc` order. | Shows strongest places first. | IMPLEMENTED / NOT EXPOSED | `PlaceLibraryPage` sets `sort=rating_desc`; backend sort validation | `/places` | `GET /api/v1/places?sort=rating_desc` | `backend/tests/api/test_places_and_lists.py` | No user-facing sort selector exists. |
| Place rows | Place row/card display | Shows name, taxonomy, tried state, rating, and type icon. | Makes each place scannable. | IMPLEMENTED | `PlaceCard`; `PlaceTypeIcon`; `RatingDisplay` | `/places`; `/lists/{id}`; `/lists/public/{id}`; `/profile` | Place/list/profile response fields | E2E responsive and UI polish tests | Shared component affects multiple sections. |
| Place detail | View place detail | Shows hero, taxonomy chips, current rating context, community rating, and place information. | Gives one canonical place page. | IMPLEMENTED | `PlaceDetailPage`; `backend/app/api/places.py` | `/places/{id}` | `GET /api/v1/places/{id}` | `frontend/tests/e2e/sprint3-real.spec.ts`; acceptance harness | Requires auth. |
| Place detail | Add place to list | Detail page opens list picker and saves place to a list. | Lets users save a place while viewing it. | IMPLEMENTED | `PlaceDetailPage` save dialog | `/places/{id}` | `GET /api/v1/lists`; `POST /api/v1/lists/{id}/items` | `places-acceptance-harness.spec.ts`; E2E list flow | Existing saved lists are disabled. |
| Place detail | Rate/edit place | Opens rating flow for current place. | Captures personal taste and tried status. | IMPLEMENTED | `PlaceDetailPage`; `/places/[id]/rate/page.tsx`; `RatePlaceDialog` | `/places/{id}/rate` | `POST /api/v1/ratings`; `PATCH /api/v1/ratings/{place_id}` | `frontend/tests/e2e/sprint3-real.spec.ts`; `backend/tests/api/test_sprint2.py` | Rating also updates tried state. |
| Place creation | Create place | Creates restaurant/cafe/ice cream with validation. | Lets users add missing places. | IMPLEMENTED | `CreatePlaceDialog`; `frontend/app/places/new/page.tsx`; `backend/app/api/places.py` | `/places/new` | `POST /api/v1/places` | E2E auth/create/search/detail flow; API duplicate tests | Duplicate normalized names rejected. |
| Place creation | Description metadata | Backend model/API includes optional description metadata. | Enables future richer detail content. | IMPLEMENTED / NOT EXPOSED | `frontend/src/lib/api.ts` type has `description`; existing feature catalog notes reserved metadata | API/model | `POST /api/v1/places` payload/model | Existing docs/feature catalog | No current UI field. |
| Auth state | Unauthenticated prompt | Shows login-required prompt instead of data. | Protects catalog/private context. | IMPLEMENTED | `PlaceLibraryPage`; `PlaceDetailPage`; `auth-gating.spec.ts` | `/places`; `/places/{id}` | Protected endpoints | `frontend/tests/e2e/auth-gating.spec.ts` | Session restoration attempts happen before prompt. |
| Empty/loading/error | Catalog states | Loading skeletons, no-result empty state, clear filters, retry panel, pagination error. | Makes network/catalog failures recoverable. | IMPLEMENTED | `PlaceLibraryPage`; `LoadingState`; `EmptyState`; `StatusMessage` | `/places` | `GET /api/v1/places` | Responsive and E2E tests | Page-level and load-more errors are distinct. |
| Favorites | Heart/favorite action | Reference UI may show heart, but no current feature is exposed or backed by API. | Would support quick bookmarking if approved later. | PLANNED / NOT IMPLEMENTED | No favorite API/route found in `backend/app/api`; `PlaceCard` has no favorite action | N/A | N/A | No tests found | Do not add without product approval. |

### 3.3 صفحتي

| Feature group | Feature | Description | User value | Current status | Evidence | Related route/page/component | Related API | Related tests | Notes / gaps |
|---|---|---|---|---|---|---|---|---|---|
| Profile summary | Profile stats | Shows lists count, tried restaurants/cafes/ice cream, and ratings count. | Summarizes personal activity. | IMPLEMENTED | `ProfileArchivePage`; `backend/app/api/profile.py`; `backend/app/modules/profile/schemas.py` | `/profile` | `GET /api/v1/profile` | `backend/tests/api/test_sprint2.py`; `PROFILE_USER_STORIES.md` | Uses `listsCount`, `ratingsCount`, and tried counts. |
| Rating archive | View user ratings | Shows `تقييماتك` archive from `userRatings`. | Gives personal memory/history. | IMPLEMENTED | `ProfileArchivePage`; `RatingArchiveList` | `/profile` | `GET /api/v1/profile` | `frontend/tests/e2e/sprint3-real.spec.ts`; profile stories | Canonical tried archive; no separate tried-place list. |
| Rating archive | Large archive virtualization | Uses virtualization above threshold. | Keeps profile responsive for heavy users. | IMPLEMENTED | `ProfileArchivePage` constants `ARCHIVE_VIRTUALIZATION_THRESHOLD`, `RatingArchiveList` | `/profile` | `GET /api/v1/profile` | `PROFILE_USER_STORIES.md`; responsive tests | Threshold is 80 rows. |
| Rating archive | Private notes | Shows own private notes only; hides null notes. | Preserves personal context without leaking. | IMPLEMENTED | `ProfileArchivePage`; `backend/tests/api/test_sprint2.py` | `/profile` | `GET /api/v1/profile` | `test_notes_privacy_and_community_rating_aggregates`; profile stories | Notes are not exposed on public lists or other profiles. |
| Rating archive | Edit rating from profile | Edit action opens rating flow for the place. | Lets user correct/update memory. | IMPLEMENTED | `ProfileArchivePage`; `RatePlaceDialog`; `/places/[id]/rate/page.tsx` | `/profile` -> `/places/{id}/rate` | `PATCH /api/v1/ratings/{place_id}` | `frontend/tests/e2e/sprint3-real.spec.ts` | Session storage is used to carry current private note draft into edit flow. |
| Public summary | Own public-list summary | Profile shows current user's public lists summary. | Provides quick access to shared lists. | IMPLEMENTED | `ProfileArchivePage`; `ProfilePublicListSummary` type; backend profile schema | `/profile` | `GET /api/v1/profile` | `PROFILE_USER_STORIES.md`; profile QA docs | Public list details still live under `/lists/public/{id}`. |
| Logout | Logout from profile | Calls auth logout and returns to entry shell. | Gives account/session control. | IMPLEMENTED | `ProfileArchivePage`; `logout()` in `frontend/src/lib/api.ts`; `backend/app/api/auth.py` | `/profile` | `POST /api/v1/auth/logout` | `backend/tests/api/test_auth.py` | Refresh token revoked where possible; local state cleared regardless. |
| Auth state | Unauthenticated profile prompt | Guests see sign-in prompt instead of private profile data. | Prevents private data exposure. | IMPLEMENTED | `ProfileArchivePage`; `auth-gating.spec.ts` | `/profile` | Protected `GET /profile` | `frontend/tests/e2e/auth-gating.spec.ts` | Also clears tokens on 401. |
| Empty/loading/error | Profile states | Shows loading skeletons, empty ratings/public lists, and retry on error. | Keeps profile usable in normal and failure states. | IMPLEMENTED | `ProfileArchivePage`; `EmptyState`; `LoadingState`; `StatusMessage` | `/profile` | `GET /api/v1/profile` | Profile stories and responsive tests | Single API response means many failures render as one retry panel. |
| Public profile | View another user's public profile | Standalone public profile route is absent. | Would let users browse another user's profile if approved. | PLANNED / NOT IMPLEMENTED | No `/users/{id}`, `/profile/{id}`, or public-profile API route found | N/A | N/A | No tests found | Current sharing model is public lists only. |

## 4. Section-by-Section Details

### 4.1 قوائمي Details

Core features:

- Owned list index.
- Create list.
- Owned list detail.
- Edit list name/visibility.
- Delete list.
- Add existing place to a list.
- Remove place with undo.
- Public/private visibility.

Secondary features:

- Public list index and public list detail under `/lists/public`.
- Public list owner display name.
- Read-only public-list detail.
- Empty list and empty public-list states.

Actions:

- Open list.
- Create list.
- Rename list.
- Change visibility.
- Delete list.
- Add place.
- Remove place.
- Undo removal.
- Navigate to public lists.
- Navigate from list place row to place detail.

States:

- Authenticated: full list/list-detail/public-list behavior.
- Unauthenticated: sign-in prompt or redirect on dialog routes.
- Empty: no owned lists; no places in list; no public lists.
- Loading: list skeletons and list-detail loading state.
- Error: retry panels for index/detail/public-list failures.

Permissions / ownership rules:

- Owned list routes and mutations require the owner.
- Non-owner owned list access returns not found.
- Public-list detail exposes only public lists.
- Guest public-list access is rejected.
- Public response exposes display name, not email or internal user id.

UX notes:

- `قوائمي` is the correct home for Public Lists because public lists are a list browsing mode, not a separate top-level product area.
- Delete is intentionally behind overflow in list detail, reducing accidental destructive action.
- Undo is frontend recovery after a confirmed server removal.

QA notes:

- API coverage exists in `backend/tests/api/test_places_and_lists.py` and `backend/tests/api/test_sprint2.py`.
- Full E2E list create/edit/add/remove/delete/profile flow exists in `frontend/tests/e2e/sprint3-real.spec.ts`.
- Responsive and accessibility harnesses cover shared mobile/dialog/list behavior.

### 4.2 الأماكن Details

Core features:

- Places catalog.
- Category segmentation by restaurant/cafe/ice cream.
- Search by name.
- Restaurant/cafe subtype filters.
- Rating-based default sort.
- Place detail.
- Create place.
- Add place to list.
- Rate/edit place.

Secondary features:

- Legacy redirects from `/restaurants` and `/cafes`.
- Place row/card reuse across lists, public lists, profile, and dialogs.
- Empty-state create-place entry.
- Load-more/pagination behavior.

Actions:

- Select category.
- Search.
- Open subtype filter.
- Clear filters.
- Open place detail.
- Add new place.
- Add current place to list.
- Rate/edit current place.

States:

- Authenticated: catalog/detail/create/rate features available.
- Unauthenticated: sign-in prompt or redirect.
- Empty: no catalog results or no filtered search results.
- Loading: catalog skeleton and detail skeleton.
- Error: retry panel for catalog/detail; load-more retry for pagination failure.

Permissions / ownership rules:

- Places are authenticated-only in the current MVP.
- Place creation requires authentication.
- Place names are globally unique by normalized name.
- Other users' private rating notes are not exposed through places or public-list surfaces.

UX notes:

- `الأماكن` is the product's canonical catalog and place-memory workspace.
- Ratings are surfaced as actions and context, but remain a cross-section capability rather than a nav section.
- Explicit sort selection is not exposed; default sort is implementation-backed.

QA notes:

- Place acceptance harness covers list/filter/detail/create/rating/add-to-list states.
- API tests cover auth, search, pagination, sorting, taxonomy, invalid filters, duplicate creation, and rating aggregates.
- E2E tests cover real app create/search/detail/rating flows and legacy redirects.

### 4.3 صفحتي Details

Core features:

- Profile summary stats.
- Rating archive.
- Private rating note display.
- Edit rating from archive.
- Public-list summary.
- Logout.

Secondary features:

- Large archive virtualization.
- Empty ratings/public-list states.
- Public-list navigation from profile.

Actions:

- View stats.
- Review rating archive.
- Edit rating.
- Open public list.
- Go to places from empty rating state.
- Logout.

States:

- Authenticated: profile stats, archive, public-list summary, logout.
- Unauthenticated: sign-in prompt.
- Empty: no ratings; no public lists.
- Loading: profile loading skeletons.
- Error: retry panel; no stale private data should remain visible.

Permissions / ownership rules:

- Profile is current-user-only.
- `userRatings` are scoped to current user.
- Private notes are current-user-only.
- Public-list summary contains public-safe list metadata.

UX notes:

- `صفحتي` is a personal archive, not a social profile.
- Tried status is derived from ratings and summarized here.
- Public profiles are not implemented and should not be implied by UI copy.

QA notes:

- Backend profile tests cover statistics, notes privacy, public/private list visibility, and rating update semantics.
- E2E tests cover profile archive after rating creation and note display.
- Profile user stories specify archive ordering, virtualization, privacy, and no-placeholder null-note behavior.

## 5. Cross-Section Feature Map

| Feature | Description | Current status | Evidence | Affected sections | Notes |
|---|---|---|---|---|---|
| Authentication/session | Login, registration, refresh-token cookie, in-memory access token, logout, protected UI states. | IMPLEMENTED | `frontend/src/lib/api.ts`; `backend/app/api/auth.py`; `backend/tests/api/test_auth.py`; `ios-safari-session-restoration.spec.ts` | All three | Session marker stores only session presence, not tokens. |
| Bottom navigation | Three-section RTL nav with active state. | IMPLEMENTED | `frontend/src/components/AppNav.tsx`; `frontend/app/globals.css`; `auth-gating.spec.ts` | All three | Hidden on auth screens. |
| RTL and bidi handling | Arabic-first layout with bidi isolation for mixed names. | IMPLEMENTED | `BidiText`; `PlaceCard`; `ListCard`; responsive tests | All three | Important for mixed Arabic/English place and list names. |
| Responsive mobile layout | Safe-area-aware mobile layout, bottom nav, dialogs/sheets, no horizontal overflow tests. | IMPLEMENTED | `frontend/app/globals.css`; `responsive-layout.spec.ts`; `responsive-viewport-harness.spec.ts` | All three | Real-device Safari still needs periodic manual verification for session/browser quirks. |
| Accessibility automation | Focus, roles, dialog/sheet behavior, rating control, accessibility harness. | PARTIALLY IMPLEMENTED | `Dialog.tsx`; `RatingControl.tsx`; `accessibility-harness.spec.ts`; `ui-polish-pr-findings.spec.ts` | All three | Automated checks exist; no claim of full screen-reader certification. |
| Design system components | Shared cards, buttons, chips, badges, status, loading, empty, dialogs, action menu. | IMPLEMENTED | `frontend/src/components/ui/*` | All three | Shared components drive consistency and regression risk. |
| Rating system | Create/update rating, average rating, count, tried status, private notes. | IMPLEMENTED | `backend/app/api/ratings.py`; `RatePlaceDialog`; `ProfileArchivePage`; `test_sprint2.py` | `الأماكن`, `صفحتي`, `قوائمي` indirectly | First rating removes place from owned lists. |
| Public/private visibility | List visibility controls public-list exposure. | IMPLEMENTED | `VisibilitySelector`; `backend/app/api/lists.py`; `test_sprint2.py` | `قوائمي`, `صفحتي` | Public Lists remain authenticated-only. |
| Place taxonomy | Restaurant/cafe/ice cream and approved subtypes. | IMPLEMENTED | `taxonomy.ts`; `backend/app/modules/places/schemas.py`; API tests | `الأماكن`, `قوائمي`, `صفحتي` | Taxonomy labels reused across place rows/profile. |
| Structured API envelopes | Collection responses use `{data, meta}`; mutation/data envelopes where documented. | IMPLEMENTED | `backend/app/core/schemas.py`; API tests | All API-backed sections | Important for contract stability. |
| Empty/loading/error states | Standardized UI for loading, empty, retry, auth-required, and errors. | IMPLEMENTED | `EmptyState`; `LoadingState`; `StatusMessage`; feature pages | All three | Offline is handled as error/retry, not offline cached mode. |
| PWA install metadata | Manifest and install prompt exist. | IMPLEMENTED | `frontend/app/manifest.ts`; `InstallAppPrompt.tsx`; E2E manifest test | App shell | Offline service-worker caching not found. |
| Offline cached operation | App usable with cached data while offline. | PLANNED / NOT IMPLEMENTED | No service worker registration found; docs mention offline as error handling | All three | Current implementation shows network-safe errors/retry. |

## 6. User Flow Map

| Flow | Start section | Steps | End state | Dependencies | Known risks / gaps |
|---|---|---|---|---|---|
| Browse places | `الأماكن` | Open `/places`; ensure session; fetch catalog; scroll virtualized list. | User sees place rows. | Auth session; `GET /api/v1/places`; `PlaceCard`. | Catalog is authenticated-only; no anonymous browse. |
| Search/filter places | `الأماكن` | Enter search; submit; choose type/subtype filter; URL query updates; list refetches. | Filtered catalog or empty state. | `PlaceLibraryPage`; `GET /places?q/type/subtype`. | No explicit sort selector. |
| Open place detail | `الأماكن` | Activate place row; route to `/places/{id}`; fetch detail. | Detail hero, ratings, metadata, actions. | `PlaceDetailPage`; `GET /api/v1/places/{id}`. | Requires auth; not found/error state shown on failure. |
| Add place to list from detail | `الأماكن` | Open add-to-list sheet; fetch owned lists; select target list. | Place is saved to selected list or disabled if already saved. | `GET /lists`; `POST /lists/{id}/items`. | Requires existing list or user must create one. |
| Create place | `الأماكن` | Open `/places/new`; enter name/type/subtype; submit. | Place created; success state in dialog. | `CreatePlaceDialog`; `POST /api/v1/places`. | No edit/correction flow after creation. |
| Rate place | `الأماكن` | Open `/places/{id}/rate`; set 1-10 half-step rating; optional note; submit. | Rating saved; tried state updated; place detail/profile reflect rating. | `RatePlaceDialog`; rating APIs. | First rating removes place from all current owned lists by design. |
| Create list | `قوائمي` | Open `/lists/new`; enter name; choose visibility; save. | New list detail opens. | `CreateListDialog`; `POST /lists`. | Duplicate list names are allowed. |
| Edit list | `قوائمي` | Open list detail; open list action menu; choose edit; change name/visibility; save. | List metadata updated. | `EditListDialog`; PATCH endpoints. | Public/private behavior must remain privacy-safe. |
| Remove place from list | `قوائمي` | Open list detail; open row action menu; choose remove; optionally undo. | Place removed or restored. | `DELETE /lists/{id}/items/{place_id}`; undo `POST /items`. | Undo is time-limited. |
| Delete list | `قوائمي` | Open list detail; open list actions; choose delete; confirm. | Returns to `/lists`; list gone. | `DeleteListDialog`; `DELETE /lists/{id}`. | Destructive but confirmed. |
| Browse public lists | `قوائمي` | Open public-list link; fetch public summaries; open detail. | Read-only public list detail. | Public list endpoints; `ListCard`; `PlaceCard`. | Authenticated-only; no anonymous public sharing. |
| View profile | `صفحتي` | Open `/profile`; ensure session; fetch profile. | Stats, ratings archive, public list summary. | `GET /api/v1/profile`; `ProfileArchivePage`. | Public profile route absent. |
| Edit rating from profile | `صفحتي` | Select edit on archive row; open rating route; save; return/refresh. | Rating archive updates. | `ProfileArchivePage`; `RatePlaceDialog`. | Long note transfer uses session storage for draft note context. |
| Logout | `صفحتي` | Press logout; call logout API; clear local auth state; route to entry. | User signed out. | `POST /api/v1/auth/logout`; `logout()` helper. | Network failure still clears local state; server revocation may be unconfirmed. |

## 7. Feature Coverage Matrix

| Section | Feature | Status | Route/Page | Component/API | Test Coverage | Notes |
|---|---|---|---|---|---|---|
| `قوائمي` | Owned lists index | IMPLEMENTED | `/lists` | `frontend/app/lists/page.tsx`; `GET /api/v1/lists` | API + E2E | Core feature. |
| `قوائمي` | Create list | IMPLEMENTED | `/lists/new` | `CreateListDialog`; `POST /api/v1/lists` | API + E2E | Includes visibility. |
| `قوائمي` | List detail | IMPLEMENTED | `/lists/{id}` | `frontend/app/lists/[id]/page.tsx`; `GET /lists/{id}` | API + E2E | Owner-only. |
| `قوائمي` | Edit list | IMPLEMENTED | `/lists/{id}` | `EditListDialog`; PATCH list APIs | API + E2E | Name and visibility. |
| `قوائمي` | Delete list | IMPLEMENTED | `/lists/{id}` | `DeleteListDialog`; `DELETE /lists/{id}` | API + E2E | Confirmation required. |
| `قوائمي` | Add place to list | IMPLEMENTED | `/lists/{id}` | `AddPlaceDialog`; places search; list item POST | API + E2E | Search existing places. |
| `قوائمي` | Remove place with undo | IMPLEMENTED | `/lists/{id}` | `ActionMenu`; `Toast`; DELETE/POST list item APIs | API + E2E | Destructive action behind overflow. |
| `قوائمي` | Public lists | IMPLEMENTED | `/lists/public`, `/lists/public/{id}` | `PublicListsPage`; `PublicListDetailPage`; public list APIs | API + E2E/user stories | Secondary flow under Lists. |
| `الأماكن` | Places catalog | IMPLEMENTED | `/places` | `PlaceLibraryPage`; `GET /api/v1/places` | API + E2E + harness | Authenticated-only. |
| `الأماكن` | Type segmentation | IMPLEMENTED | `/places?type=` | `taxonomy.ts`; places API | API + E2E | Restaurant/cafe/ice cream. |
| `الأماكن` | Subtype filtering | IMPLEMENTED | `/places?type=&subtype=` | `PlaceLibraryPage`; `validate_place_filter` | API + E2E | Restaurant/cafe only. |
| `الأماكن` | Name search | IMPLEMENTED | `/places?q=` | `SearchField`; places API | API + E2E | Name-only search. |
| `الأماكن` | Rating sort | IMPLEMENTED / NOT EXPOSED | `/places?sort=rating_desc` | Places service/API | API | Default only; no UI selector. |
| `الأماكن` | Place detail | IMPLEMENTED | `/places/{id}` | `PlaceDetailPage`; `GET /places/{id}` | API + E2E + harness | Shows rating context and actions. |
| `الأماكن` | Create place | IMPLEMENTED | `/places/new` | `CreatePlaceDialog`; `POST /places` | API + E2E + harness | No place edit UI. |
| `الأماكن` | Rate place | IMPLEMENTED | `/places/{id}/rate` | `RatePlaceDialog`; rating APIs | API + E2E + harness | Cross-section rating capability. |
| `الأماكن` | Add to list from detail | IMPLEMENTED | `/places/{id}` | Save-to-list dialog; list APIs | E2E + harness | Requires owned list. |
| `الأماكن` | Favorite/heart | PLANNED / NOT IMPLEMENTED | N/A | No route/API/component action found | None | Do not expose without approval. |
| `صفحتي` | Profile stats | IMPLEMENTED | `/profile` | `ProfileArchivePage`; `GET /profile` | API + E2E/user stories | Current-user-only. |
| `صفحتي` | Ratings archive | IMPLEMENTED | `/profile` | `RatingArchiveList`; profile API | API + E2E/user stories | Canonical tried archive. |
| `صفحتي` | Private notes | IMPLEMENTED | `/profile` | `RatingArchiveCard`; profile API | API + E2E/user stories | Own notes only. |
| `صفحتي` | Edit rating from archive | IMPLEMENTED | `/profile` -> `/places/{id}/rate` | `ButtonLink`; `RatePlaceDialog` | E2E/user stories | Uses current place rating flow. |
| `صفحتي` | Public-list summary | IMPLEMENTED | `/profile` | `publicListsSummary`; `ListCard` | User stories/profile schema | Links to public-list detail. |
| `صفحتي` | Logout | IMPLEMENTED | `/profile` | `logout()`; `POST /auth/logout` | Auth API tests | Clears local state. |
| `صفحتي` | Public profile | PLANNED / NOT IMPLEMENTED | N/A | No public profile route/API found | None | Sharing model is public lists, not public profiles. |
| Cross-section | Auth/session restoration | IMPLEMENTED | Protected pages | `ensureSession`; `/auth/refresh` | Auth API + iOS Safari E2E | Real device should remain release smoke item. |
| Cross-section | RTL/mobile/accessibility | PARTIALLY IMPLEMENTED | All primary sections | UI components + harnesses | Responsive/accessibility E2E | Automated coverage exists; manual AT certification not claimed. |
| Cross-section | Offline cached app use | PLANNED / NOT IMPLEMENTED | N/A | Manifest exists; no service-worker registration found | Manifest test only | Network-safe error handling exists. |

## 8. Gaps and Recommendations

1. Public Lists ownership in IA
   - Finding: Public Lists are implemented under `/lists/public`, linked from `قوائمي` and `صفحتي`.
   - Recommendation: Keep Public Lists as a secondary flow under `قوائمي`. Do not add a fourth primary section.

2. Ratings are cross-section, not primary navigation
   - Finding: Rating is accessed through Place Detail and Profile Archive.
   - Recommendation: Keep rating as an action/history capability. Do not add a standalone rating tab unless the product grows into a review-heavy app.

3. Public profile is absent
   - Finding: No public user profile route/API found.
   - Recommendation: Keep as not implemented. If needed later, decide whether it belongs under `صفحتي` or Public Lists before building.

4. Explicit sort selection is hidden
   - Finding: `rating_desc` is API-supported and always used by the UI, but users cannot choose sort.
   - Recommendation: Keep hidden for MVP unless users need recency/name sorting. Current behavior is simpler.

5. Place description metadata is not exposed
   - Finding: TypeScript/API model includes `description`, but create/detail UI does not surface it.
   - Recommendation: Keep not exposed until content strategy exists. Avoid adding empty detail fields.

6. Offline/PWA expectations need clearer product language
   - Finding: Manifest/install prompt exist; service-worker offline cache was not found.
   - Recommendation: Describe the app as installable PWA with network-safe error states, not offline-capable.

7. Admin/System Operations are documented elsewhere but not part of three-section product IA
   - Finding: Admin docs/test cases exist, but no current primary section or UI route evidence in the inspected app shell.
   - Recommendation: Keep outside this feature map unless product explicitly adds an admin surface.

8. Auth/session is cross-cutting and should not be presented as a user section
   - Finding: Auth supports all three primary sections.
   - Recommendation: Keep auth outside primary nav; continue using protected-state prompts and return-to routing.

## 9. Product Simplification Notes

| Feature / area | Recommendation | Reason |
|---|---|---|
| `قوائمي` | Keep | It is the core organization workspace and owns public-list entry naturally. |
| `الأماكن` | Keep | It is the core catalog and action hub for create/save/rate flows. |
| `صفحتي` | Keep | It is the personal archive and account-control surface. |
| Public Lists | Keep as secondary under `قوائمي` | It is list browsing, not a separate daily primary intent. |
| Ratings | Keep as cross-section capability | Rating is an action and archive item, not a standalone section. |
| Legacy `/restaurants` and `/cafes` | Keep hidden | They preserve old links without complicating nav. |
| Place description | Defer | Data field exists, but UI value proposition is not proven. |
| Favorite/heart action | Defer | No implementation evidence; may duplicate list saving. |
| Public profile | Defer | Sharing currently works through public lists. |
| Offline cached mode | Defer or explicitly scope | Current evidence supports installable app and error recovery, not offline cached usage. |
| Admin/system operations | Hide from primary product IA | They are not part of the three-section user model. |

## 10. Final Feature Map Verdict

MOSTLY CLEAR WITH MINOR GAPS

Justification:

- The primary navigation model is clear and evidenced by `AppNav`: `قوائمي`, `الأماكن`, `صفحتي`.
- Each section has a coherent responsibility and is backed by routes, APIs, shared components, and tests.
- Public Lists, Ratings, Auth, Accessibility, and Responsive behavior are correctly cross-section or secondary capabilities, not additional primary sections.
- The main gaps are not blockers: public profile is absent, explicit sort is not exposed, place description is backend-only, favorite/heart is not implemented, and offline behavior is limited to error recovery.
- The product should remain a three-section app unless future user evidence proves a new primary daily intent.
