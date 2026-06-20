# 23. Development Standards

## Scope Discipline

Sprint 0 is foundation only.

Do not implement:

- Lists.
- Places beyond project skeleton and future-ready contract references.
- Ratings.
- Profile.
- Search.
- Maps.
- GPS.
- Photos.
- Comments.
- Follows.
- Recommendations.
- Notifications.
- Admin features.

## Architecture

- Use a modular monolith.
- Keep shared framework/config code under backend `app/core`, `app/db`, and `app/api`.
- Add future domain modules under `app/modules/<domain>`.
- Keep business rules server-side.
- Keep frontend app code organized by route and shared utilities under `frontend/src`.

## Backend Standards

- Python 3.12.
- FastAPI for HTTP API.
- Pydantic for request/response schemas.
- SQLAlchemy 2.x for persistence.
- Alembic for migrations.
- Pytest for tests.
- Ruff for linting and formatting.
- Use typed functions.
- Do not connect to the database during app import.
- Do not leak secrets or private user data in logs or responses.

## Frontend Standards

- Next.js with TypeScript.
- Strict TypeScript.
- Playwright for e2e tests.
- Do not add business feature UI before its sprint.
- Keep Sprint 0 UI limited to application shell and health verification.

## API Standards

- Product APIs use `/api/v1`.
- Auth endpoints use `/auth`.
- Health endpoints use `/health/live` and `/health/ready`.
- Every protected API must reject missing/invalid auth once auth is implemented.
- Error responses use the documented `error.code`, `error.message`, and optional `error.fields` shape.

## Database Standards

- PostgreSQL is the target database.
- All schema changes go through Alembic migrations.
- No manual production schema changes.
- Migration files should be small, reversible when practical, and reviewed.

## Testing Standards

- Backend tests live under `backend/tests`.
- Frontend/e2e tests live under `frontend/tests/e2e`.
- Health and auth foundation tests are required in Sprint 0.
- Future business features must include tests mapped from the RTM.

## Commit/Review Standards

- Keep changes scoped to the sprint objective.
- Do not mix product scope changes with infrastructure changes unless required.
- Any new endpoint must include tests and documentation updates.
- Any new environment variable must be added to `.env.example`.
