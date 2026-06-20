# Sprint 2 Completion Report

## Status

Sprint 2 is complete.

Implemented scope only:

- Ratings.
- Tried places derived from ratings.
- Public and private list visibility.
- Profile basics.

Explicitly not implemented:

- Search.
- Recommendations.
- Notifications.
- Comments.
- Photos.
- Follows.
- Admin features.

## Deliverables Completed

1. Migrations added: complete.
2. Models added: complete.
3. API endpoints added: complete.
4. Frontend screens added: complete.
5. Tests added: complete.
6. Sprint 2 completion report: complete.

## Files Created

Backend:

- `backend/app/api/profile.py`
- `backend/app/api/ratings.py`
- `backend/app/modules/profile/__init__.py`
- `backend/app/modules/profile/schemas.py`
- `backend/app/modules/ratings/__init__.py`
- `backend/app/modules/ratings/models.py`
- `backend/app/modules/ratings/schemas.py`
- `backend/app/modules/places/services.py`
- `backend/migrations/versions/20260619_0002_sprint_2_ratings_visibility.py`
- `backend/tests/api/test_sprint2.py`

Frontend:

- `frontend/app/profile/page.tsx`
- `frontend/app/lists/public/page.tsx`
- `frontend/app/lists/public/[id]/page.tsx`
- `frontend/app/places/[id]/rate/page.tsx`
- `frontend/src/lib/format.ts`
- `frontend/tests/e2e/sprint2.spec.ts`

Documentation:

- `docs/27-sprint-2-completion-report.md`

## Files Modified

Backend:

- `backend/app/main.py`
- `backend/app/db/base.py`
- `backend/app/api/lists.py`
- `backend/app/api/places.py`
- `backend/app/modules/auth/models.py`
- `backend/app/modules/lists/models.py`
- `backend/app/modules/lists/schemas.py`
- `backend/app/modules/places/models.py`
- `backend/app/modules/places/schemas.py`

Frontend:

- `frontend/app/globals.css`
- `frontend/app/layout.tsx`
- `frontend/app/page.tsx`
- `frontend/app/lists/[id]/page.tsx`
- `frontend/app/places/page.tsx`
- `frontend/src/components/AppNav.tsx`
- `frontend/src/lib/api.ts`
- `frontend/tests/e2e/health.spec.ts`
- `frontend/tests/e2e/sprint1.spec.ts`

Documentation:

- `docs/README.md`

## Migrations Added

- `20260619_0002_sprint_2_ratings_visibility.py`

Migration changes:

- Adds `lists.visibility`.
- Adds `ck_lists_visibility`.
- Creates `ratings`.
- Adds `uq_ratings_user_id_place_id`.
- Adds `ck_ratings_rating_range`.
- Adds rating indexes for `user_id` and `place_id`.

## Backend Scope Implemented

New endpoints:

- `POST /ratings`
- `PATCH /ratings/{place_id}`
- `GET /profile`
- `GET /lists/public`
- `GET /lists/public/{id}`
- `PATCH /lists/{id}/visibility`

Updated endpoints:

- `GET /places`
- `GET /places/{id}`

Updated place responses include:

- `averageRating`
- `ratingCount`
- `currentUserRating`
- `currentUserTried`

Business rules implemented:

- One rating per user per place is enforced by database uniqueness.
- `POST /ratings` creates or upserts the current user's rating.
- `PATCH /ratings/{place_id}` updates the current user's rating.
- Blank notes are stored as `NULL`.
- Tried status is derived from ratings.
- Initial rating removes that place from all lists owned by the user.
- Tried places can be re-added later without creating another rating.
- Rating notes are returned only through owner-specific rating/profile responses.
- Public lists require authentication.
- Private lists remain owner-only.
- Guests cannot access list endpoints.
- Average rating and rating count are calculated from the ratings table.

## Frontend Scope Implemented

Screens and UI added:

- Rate Place page.
- Tried indicators.
- Profile page.
- Public Lists page.
- Public List Detail page.
- List visibility management on owner List Detail.

No search, recommendations, notifications, comments, photos, follows, or admin UI was added.

## Tests Executed

Backend:

- `pytest`: 21 passed.
- `ruff check .`: passed.
- `ruff format --check .`: passed.

Frontend:

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test:e2e`: 12 passed.

## Test Coverage Added

Backend tests cover:

- Create rating.
- Update rating.
- Rating upsert behavior.
- Notes privacy.
- Tried derivation.
- Automatic removal from all user lists after initial rating.
- Tried place re-add behavior.
- Public list visibility.
- Private list denial.
- Guest denial.
- Average rating calculation.
- Rating count calculation.
- Profile statistics.
- Rating validation.

Frontend Playwright tests cover:

- Create rating.
- Update rating.
- Tried indicator display.
- Profile view.
- Public list access.
- Visibility change.

## Scope Verification

Source scan found no implementation of:

- Search.
- Recommendations.
- Notifications.
- Comments.
- Photos.
- Follows.
- Admin features.

Backend registered routes are limited to:

- Health.
- Auth.
- Places.
- Lists.
- Ratings.
- Profile.

## Risks

- Backend API tests use SQLite for isolated execution. The migration has not been applied to a live PostgreSQL instance in this automated run.
- Frontend Playwright tests mock backend API responses. Full stack browser tests against a live backend/database remain a later hardening task.
- Logout remains stateless from Sprint 1 because durable refresh token revocation still requires a separately approved persistence model.

## Deviations

- No product-scope deviations.
- No Sprint 3 work was started.

## Remaining Blockers

No blockers remain for Sprint 2 completion.

## Final Recommendation

Sprint 2 is complete and ready for review.

Do not start Sprint 3 until Sprint 2 is approved.
