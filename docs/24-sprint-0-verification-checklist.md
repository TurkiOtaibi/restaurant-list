# 24. Sprint 0 Verification Checklist

## Repository Structure

- [x] Root README exists.
- [x] Backend folder exists.
- [x] Frontend folder exists.
- [x] Docs folder exists.
- [x] CI workflow exists.

## Backend

- [x] FastAPI app skeleton exists.
- [x] Health endpoints exist.
- [x] Auth skeleton routes exist.
- [x] Config module exists.
- [x] PostgreSQL database URL config exists.
- [x] SQLAlchemy base/session skeleton exists.
- [x] Alembic migration skeleton exists.
- [x] Pytest setup exists.
- [x] Ruff formatting/linting config exists.

## Frontend

- [x] Next.js TypeScript skeleton exists.
- [x] Frontend health endpoint exists.
- [x] App shell page exists.
- [x] TypeScript config exists.
- [x] ESLint config exists.
- [x] Playwright config and test skeleton exist.

## Infrastructure

- [x] PostgreSQL Docker Compose service exists.
- [x] Root `.env.example` exists.
- [x] Backend `.env.example` exists.
- [x] Frontend `.env.local.example` exists.

## Scope Guardrails

- [x] No lists implementation.
- [x] No places implementation.
- [x] No ratings implementation.
- [x] No profile implementation.
- [x] No search implementation.
- [x] No maps, photos, comments, follows, recommendations, notifications, or admin features.

## Verification Commands

To be completed after dependencies are installed:

- [x] Backend tests: `pytest`.
- [x] Backend lint: `ruff check .`.
- [x] Backend format check: `ruff format --check .`.
- [x] Frontend lint: `npm run lint`.
- [x] Frontend typecheck: `npm run typecheck`.
- [x] Frontend e2e: `npm run test:e2e`.
