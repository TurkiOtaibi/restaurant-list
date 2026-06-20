# Sprint 1 Completion Report

## Status

Sprint 1 is complete.

Implemented scope only:

- Authentication persistence with database-backed users.
- JWT access tokens and refresh tokens.
- Places.
- Lists.
- Add place to list.

Explicitly not implemented:

- Ratings.
- Tried places.
- Profile.
- Public/private list visibility behavior.
- Search.
- Notifications.
- Recommendations.
- Admin features.

## Deliverables Completed

1. Migrations created: complete.
2. Database schema implemented: complete.
3. Auth persistence implemented: complete.
4. API endpoints implemented: complete.
5. Frontend screens implemented: complete.
6. Tests implemented: complete.
7. Sprint 1 completion report: complete.

## Files Created

Backend:

- `backend/app/api/lists.py`
- `backend/app/api/places.py`
- `backend/app/modules/auth/dependencies.py`
- `backend/app/modules/auth/models.py`
- `backend/app/modules/lists/__init__.py`
- `backend/app/modules/lists/models.py`
- `backend/app/modules/lists/schemas.py`
- `backend/app/modules/places/__init__.py`
- `backend/app/modules/places/models.py`
- `backend/app/modules/places/schemas.py`
- `backend/migrations/versions/20260618_0001_sprint_1_foundation.py`
- `backend/tests/conftest.py`
- `backend/tests/api/test_auth.py`
- `backend/tests/api/test_places_and_lists.py`
- `backend/tests/unit/test_security.py`

Frontend:

- `frontend/app/login/page.tsx`
- `frontend/app/register/page.tsx`
- `frontend/app/lists/page.tsx`
- `frontend/app/lists/new/page.tsx`
- `frontend/app/lists/[id]/page.tsx`
- `frontend/app/places/page.tsx`
- `frontend/app/places/new/page.tsx`
- `frontend/src/components/AppNav.tsx`
- `frontend/src/lib/api.ts`
- `frontend/tests/e2e/sprint1.spec.ts`

Documentation:

- `docs/26-sprint-1-completion-report.md`

## Files Modified

Backend:

- `backend/pyproject.toml`
- `backend/app/main.py`
- `backend/app/api/auth.py`
- `backend/app/core/security.py`
- `backend/app/db/base.py`
- `backend/app/modules/auth/schemas.py`
- `backend/tests/api/test_health.py`

Frontend:

- `frontend/app/globals.css`
- `frontend/app/layout.tsx`
- `frontend/app/page.tsx`
- `frontend/eslint.config.mjs`
- `frontend/playwright.config.ts`
- `frontend/tests/e2e/health.spec.ts`

Documentation:

- `docs/README.md`

## Migrations Added

- `20260618_0001_sprint_1_foundation.py`

Migration creates:

- `users`
- `places`
- `lists`
- `list_items`

Database constraints included:

- Unique user email.
- Unique place name.
- Place type check for `restaurant` or `cafe`.
- List ownership foreign key.
- Unique `list_id` plus `place_id` constraint to prevent duplicate list items.

## Backend Scope Implemented

Auth endpoints:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

Place endpoints:

- `GET /places`
- `GET /places/{id}`
- `POST /places`

List endpoints:

- `GET /lists`
- `GET /lists/{id}`
- `POST /lists`
- `PATCH /lists/{id}`
- `DELETE /lists/{id}`
- `POST /lists/{id}/items`
- `DELETE /lists/{id}/items/{place_id}`

Authorization implemented:

- Authenticated users can read and create places.
- Users can manage only their own lists.
- Other users' lists return not found.
- Unauthenticated access to protected resources is rejected.

## Frontend Scope Implemented

Screens implemented:

- Login.
- Register.
- Lists.
- List Detail.
- Create List.
- Places.
- Create Place.

The frontend persists JWT access and refresh tokens in browser local storage for Sprint 1 functionality.

## Tests Executed

Backend:

- `python -m pip install -e ".[dev]"`: passed.
- `pytest`: 14 passed.
- `ruff check .`: passed.
- `ruff format --check .`: passed.

Frontend:

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test:e2e`: 7 passed.

## Test Coverage Added

Backend tests cover:

- Register.
- Login.
- Refresh token.
- Logout endpoint response.
- Password hashing and token decoding.
- Create place.
- Duplicate place rejection.
- Create list.
- Add place to list.
- Duplicate list item rejection.
- Unauthorized place access rejection.
- Cross-user list access rejection.
- Delete place from list.

Frontend Playwright tests cover:

- Guest list access rejection.
- Register happy path.
- Login happy path.
- Create place.
- Duplicate place rejection.
- Create list.
- Add place to list.
- Duplicate list item rejection.

## Scope Verification

Source scan confirmed no implementation of:

- Ratings.
- Tried places.
- Profile.
- Public/private list visibility behavior.
- Search.
- Notifications.
- Recommendations.
- Admin features.

Backend registered routes are limited to:

- Health.
- Auth.
- Places.
- Lists.

## Risks

- Logout is stateless. The endpoint accepts a refresh token and returns success, but refresh tokens are not persisted or server-side revoked because Sprint 1 allowed database tables only for users, places, lists, and list items. Durable refresh-token revocation would require an additional persistence model and should be scheduled only if approved for a later sprint.
- Backend tests use SQLite for fast isolated API tests. The Alembic migration targets the configured SQLAlchemy schema, but it has not been applied to a live PostgreSQL instance in the automated test run.
- Frontend Playwright tests mock backend API responses. Full stack browser tests against a live API and database remain a later hardening activity.

## Deviations

- No product-scope deviations.
- No Sprint 2 features were implemented.
- The only technical limitation is stateless logout revocation, documented above as a risk caused by the Sprint 1 table constraints.

## Remaining Blockers

No blockers remain for Sprint 1 completion.

## Final Recommendation

Sprint 1 is complete and ready for review.

Do not start Sprint 2 until Sprint 1 is approved.
