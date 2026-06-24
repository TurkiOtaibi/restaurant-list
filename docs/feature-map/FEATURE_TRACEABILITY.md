# سجل - Feature Traceability Matrix

Updated: 2026-06-24

## Traceability By Area

| Area | Frontend Evidence | Backend Evidence | Database Evidence | Test Evidence | Docs |
|---|---|---|---|---|---|
| Authentication and display name | `frontend/app/register/page.tsx`; `frontend/app/login/page.tsx`; `frontend/src/lib/api.ts` | `backend/app/api/auth.py`; `backend/app/modules/auth/models.py`; `backend/app/modules/auth/schemas.py`; `backend/app/modules/auth/services.py` | `users.display_name`; `refresh_tokens`; `backend/migrations/versions/20260624_0007_public_owner_display_names.py` | `backend/tests/api/test_auth.py`; `frontend/tests/e2e/sprint3-real.spec.ts` | `docs/03-functional-requirements.md`; `docs/10-database-design.md` |
| Owned lists | `frontend/app/lists/page.tsx`; `frontend/app/lists/[id]/page.tsx`; `frontend/src/features/lists/CreateListDialog.tsx`; `EditListDialog.tsx`; `DeleteListDialog.tsx`; `AddPlaceDialog.tsx`; `frontend/src/components/ui/ListCard.tsx` | `backend/app/api/lists.py`; `backend/app/modules/lists/schemas.py`; `backend/app/modules/lists/services.py`; `backend/app/modules/lists/models.py` | `lists`; `list_items` | `backend/tests/api/test_places_and_lists.py`; `frontend/tests/e2e/sprint3-real.spec.ts` | `docs/05-business-rules.md`; `docs/12-api-specification.md` |
| Public lists and owner identity | `frontend/src/features/lists/PublicListsPage.tsx`; `frontend/src/features/lists/PublicListDetailPage.tsx`; `frontend/src/components/ui/ListCard.tsx` | `backend/app/api/lists.py`; `backend/app/modules/lists/schemas.py`; `backend/app/modules/lists/services.py`; `backend/app/modules/auth/models.py` | `users.display_name`; `lists.visibility`; `list_items` | `backend/tests/api/test_sprint2.py`; `frontend/tests/e2e/sprint3-real.spec.ts` | `docs/03-functional-requirements.md`; `docs/12-api-specification.md`; `docs/feature-map/FEATURE_GAPS.md` |
| Places, taxonomy, filtering, sorting | `frontend/app/places/page.tsx`; `frontend/app/places/new/page.tsx`; `frontend/app/places/[id]/page.tsx`; `frontend/src/features/places/PlaceLibraryPage.tsx`; `CreatePlaceDialog.tsx`; `PlaceDetailPage.tsx`; `taxonomy.ts`; `frontend/src/components/ui/PlaceCard.tsx` | `backend/app/api/places.py`; `backend/app/modules/places/schemas.py`; `backend/app/modules/places/services.py`; `backend/app/modules/places/models.py` | `places`; `ratings`; `list_items` | `backend/tests/api/test_places_and_lists.py`; `backend/tests/integration/test_db_constraints.py`; `frontend/tests/e2e/responsive-layout.spec.ts` | `docs/02-product-scope.md`; `docs/03-functional-requirements.md`; `docs/12-api-specification.md` |
| Legacy compatibility routes | `frontend/app/restaurants/page.tsx`; `frontend/app/cafes/page.tsx` | N/A | N/A | `frontend/tests/e2e/sprint3-real.spec.ts` as route coverage when applicable | `docs/09-information-architecture.md`; `docs/feature-map/FEATURE_GAPS.md` |
| Add Place To List search | `frontend/src/features/lists/AddPlaceDialog.tsx`; `frontend/app/lists/[id]/page.tsx` | `backend/app/api/places.py`; `backend/app/modules/places/services.py`; `backend/app/api/lists.py` | `places`; `list_items` | `frontend/tests/e2e/sprint3-real.spec.ts`; `backend/tests/api/test_places_and_lists.py` | `docs/07-user-flows.md`; `docs/feature-map/GAP_RESOLUTION_PLAN.md` |
| Ratings and tried behavior | `frontend/app/places/[id]/rate/page.tsx`; `frontend/src/features/places/RatePlaceDialog.tsx`; `frontend/src/components/ui/RatingControl.tsx`; `frontend/src/lib/numerals.ts` | `backend/app/api/ratings.py`; `backend/app/modules/ratings/schemas.py`; `backend/app/modules/ratings/services.py`; `backend/app/modules/ratings/models.py`; `backend/app/modules/places/services.py` | `ratings`; `list_items` | `backend/tests/api/test_sprint2.py`; `backend/tests/integration/test_db_constraints.py`; `frontend/tests/e2e/sprint3-real.spec.ts` | `docs/05-business-rules.md`; `docs/12-api-specification.md`; `docs/13-validation-rules.md` |
| Profile archive | `frontend/app/profile/page.tsx`; `frontend/src/features/profile/ProfileArchivePage.tsx`; `frontend/src/lib/api.ts` | `backend/app/api/profile.py`; `backend/app/modules/profile/schemas.py`; `backend/app/modules/profile/services.py` | `users`; `lists`; `ratings`; `places` | `backend/tests/api/test_sprint2.py`; `frontend/tests/e2e/responsive-layout.spec.ts`; `frontend/tests/e2e/sprint3-real.spec.ts` | `docs/03-functional-requirements.md`; `docs/08-screen-inventory.md`; `docs/feature-map/FEATURE_GAPS.md` |
| Responsive, RTL, accessibility | `frontend/app/globals.css`; `frontend/src/components/AppNav.tsx`; `frontend/src/components/ui/Dialog.tsx`; `BidiText.tsx`; `NumberText.tsx`; `frontend/src/lib/numerals.ts` | N/A | N/A | `frontend/tests/e2e/responsive-layout.spec.ts`; `frontend/tests/e2e/auth-gating.spec.ts` | `docs/feature-map/GAP_RESOLUTION_PLAN.md` |
| Operations and health | `frontend/app/health/page.tsx`; `frontend/app/api/health/route.ts` | `backend/app/api/health.py`; `backend/app/main.py`; `backend/app/core/config.py`; `backend/app/core/errors.py`; `backend/app/core/schemas.py` | All tables through readiness check | `backend/tests/api/test_health.py`; `frontend/tests/e2e/health.spec.ts` | `docs/37-render-deployment-guide.md`; `docs/38-ci-cd-and-deploy-contract.md` |

## Endpoint Traceability

| Endpoint | Capability | Auth | Frontend Consumers | Backend Service / Model | Tests |
|---|---|---|---|---|---|
| `POST /api/v1/auth/register` | Register with display name | No | `frontend/app/register/page.tsx` | `register_user_account`; `User` | `backend/tests/api/test_auth.py` |
| `POST /api/v1/auth/login` | Login | No | `frontend/app/login/page.tsx` | `login_user_account`; `User`; `RefreshToken` | `backend/tests/api/test_auth.py` |
| `POST /api/v1/auth/refresh` | Cookie refresh | Cookie | `frontend/src/lib/api.ts` | `rotate_refresh_token`; `RefreshToken` | `backend/tests/api/test_auth.py` |
| `POST /api/v1/auth/logout` | Logout | Cookie | `frontend/src/lib/api.ts`; `ProfileArchivePage.tsx` | `revoke_refresh_token`; `RefreshToken` | `backend/tests/api/test_auth.py` |
| `GET /api/v1/places` | Browse/search/filter/sort places | Bearer | `PlaceLibraryPage.tsx`; `AddPlaceDialog.tsx` | `list_place_summaries`; `Place`; `Rating`; `ListItem` | `backend/tests/api/test_places_and_lists.py` |
| `GET /api/v1/places/{id}` | Place detail/current-user context | Bearer | `PlaceDetailPage.tsx`; `RatePlaceDialog.tsx` | `get_place_summary`; `Place` | `backend/tests/api/test_sprint2.py` |
| `POST /api/v1/places` | Create place | Bearer | `CreatePlaceDialog.tsx` | `create_place_for_user`; `Place` | `backend/tests/api/test_places_and_lists.py` |
| `GET /api/v1/lists` | Owned list index | Bearer | `frontend/app/lists/page.tsx`; `ProfileArchivePage.tsx`; `PlaceDetailPage.tsx` | `list_owned_lists`; `UserList` | `backend/tests/api/test_places_and_lists.py` |
| `POST /api/v1/lists` | Create list | Bearer | `CreateListDialog.tsx` | `create_list_for_user`; `UserList` | `backend/tests/api/test_places_and_lists.py` |
| `GET /api/v1/lists/{id}` | Owned list detail | Bearer | `frontend/app/lists/[id]/page.tsx` | `get_owned_list`; `list_detail_response` | `backend/tests/api/test_places_and_lists.py` |
| `PATCH /api/v1/lists/{id}` | Rename list | Bearer | `EditListDialog.tsx` | `update_owned_list_name` | `frontend/tests/e2e/sprint3-real.spec.ts` |
| `PATCH /api/v1/lists/{id}/visibility` | Change visibility | Bearer | `EditListDialog.tsx` | `update_owned_list_visibility` | `backend/tests/api/test_sprint2.py` |
| `DELETE /api/v1/lists/{id}` | Delete list | Bearer | `DeleteListDialog.tsx` | `delete_owned_list` | `frontend/tests/e2e/sprint3-real.spec.ts` |
| `POST /api/v1/lists/{id}/items` | Add place to list | Bearer | `AddPlaceDialog.tsx`; `PlaceDetailPage.tsx` | `add_place_to_list`; `ListItem` | `backend/tests/api/test_places_and_lists.py` |
| `DELETE /api/v1/lists/{id}/items/{place_id}` | Remove place from list | Bearer | `frontend/app/lists/[id]/page.tsx` | `delete_place_from_owned_list` | `backend/tests/api/test_places_and_lists.py` |
| `GET /api/v1/lists/public` | Public list index | Bearer | `PublicListsPage.tsx` | `list_public_lists`; `PublicListResponse` | `backend/tests/api/test_sprint2.py` |
| `GET /api/v1/lists/public/{id}` | Public list detail | Bearer | `PublicListDetailPage.tsx` | `get_public_user_list`; `public_list_detail_response` | `backend/tests/api/test_sprint2.py` |
| `POST /api/v1/ratings` | Create/upsert rating | Bearer | `RatePlaceDialog.tsx` | `create_or_update_rating`; `Rating` | `backend/tests/api/test_sprint2.py` |
| `PATCH /api/v1/ratings/{place_id}` | Update existing rating | Bearer | `RatePlaceDialog.tsx` | `update_existing_rating`; `Rating` | `backend/tests/api/test_sprint2.py` |
| `GET /api/v1/profile` | Profile rating archive | Bearer | `ProfileArchivePage.tsx` | `get_profile_for_user`; `ProfileResponse` | `backend/tests/api/test_sprint2.py` |
| `GET /health/live` | Backend liveness | No | External monitor | `backend/app/api/health.py` | `backend/tests/api/test_health.py` |
| `GET /health/ready` | Backend readiness | No | External monitor | `backend/app/api/health.py`; DB session | `backend/tests/api/test_health.py` |
| `GET /api/health` | Frontend health JSON | No | External monitor | `frontend/app/api/health/route.ts` | `frontend/tests/e2e/health.spec.ts` |

## Database Traceability

| Table / Model | Product Capabilities | Key Rules | Evidence |
|---|---|---|---|
| `users` / `User` | Auth, ownership, public display name | Unique email; public-safe `display_name` | `backend/app/modules/auth/models.py`; migration `20260624_0007` |
| `refresh_tokens` / `RefreshToken` | Refresh/logout persistence | Hashed token; rotation/revocation | `backend/app/modules/auth/models.py`; `backend/app/modules/auth/services.py` |
| `places` / `Place` | Shared catalog | Normalized unique name; valid type/subtype | `backend/app/modules/places/models.py`; `backend/tests/integration/test_db_constraints.py` |
| `lists` / `UserList` | Owned lists/public lists | Owner FK; public/private; duplicate names allowed | `backend/app/modules/lists/models.py` |
| `list_items` / `ListItem` | List membership | Unique `(list_id, place_id)`; idempotent add | `backend/app/modules/lists/models.py`; `backend/tests/api/test_places_and_lists.py` |
| `ratings` / `Rating` | Ratings/tried/notes/aggregates | Unique `(user_id, place_id)`; 1-10 in 0.5 increments; notes nullable | `backend/app/modules/ratings/models.py`; `backend/tests/integration/test_db_constraints.py` |

## Resolved Conflict Traceability

| Conflict | Resolution Evidence |
|---|---|
| Rating supports 0.5 increments, not integer-only | `backend/app/modules/ratings/schemas.py`; `frontend/src/components/ui/RatingControl.tsx`; docs 05/12/13/14/19 |
| Primary nav is three items, not separate restaurant/cafe tabs | `frontend/src/components/AppNav.tsx`; `docs/03-functional-requirements.md`; `docs/09-information-architecture.md` |
| Product name is `سجل`, not `ذوق` | `frontend/app/layout.tsx`; `frontend/app/api/health/route.ts`; canonical notes in historical docs |
| API uses `limit`/`offset`, not `page`/`pageSize` | `backend/app/core/schemas.py`; `backend/app/api/places.py`; `docs/12-api-specification.md` |
| Public list owner identity requires display name | `users.display_name`; public list response schemas; public list UI/tests |
| Profile must not expose separate `triedPlaces` | `backend/app/modules/profile/schemas.py`; `frontend/src/lib/api.ts`; `backend/tests/api/test_sprint2.py` |
