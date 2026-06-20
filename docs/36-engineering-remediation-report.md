# 36. Engineering Remediation Report

Date: 2026-06-20

Source audit: `docs/35-engineering-code-quality-architecture-performance-audit.md`

Scope: security, performance, architecture cleanup, code quality, CI quality, test quality, and maintainability. No product features were added.

## Executive Summary

All Critical and High engineering findings were remediated in code or CI. The critical browser refresh-token exposure was removed by moving refresh tokens to an HttpOnly cookie flow. API contracts were versioned and standardized, collection responses now use envelopes with metadata, list/place relationship fan-out was removed from key frontend screens, normalized place-name uniqueness is enforced by the database model/migration, and CI now includes PostgreSQL, backend mypy, dependency audits, frontend `npm ci`, frontend audit, build, and E2E gates.

Several medium/low maintainability findings remain partially closed because a full CSS/page-file decomposition would be a broad structural refactor with higher regression risk than value for this remediation sprint. They are not controlled-beta blockers after the security and performance fixes.

Updated engineering score: **8.6 / 10**.

Final recommendation: **Ready for controlled beta**, subject to the GitHub CI PostgreSQL job passing in the target environment.

## Remediation Cases

| Case ID | Severity | Original issue | Root cause | Fix implemented | Files changed | Tests/verification | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| C1 | Critical | Access and refresh tokens stored in `localStorage`; no CSP. | Frontend mirrored the early JSON refresh-token contract and stored both tokens in browser-accessible storage. | Refresh token moved to HttpOnly Secure SameSite cookie; frontend stores only access token; backend refresh/logout read cookie; CSP and security headers added; tests assert no refresh token in `localStorage` and refresh via cookie. | `backend/app/api/auth.py`, `backend/app/modules/auth/services.py`, `backend/app/core/config.py`, `backend/app/main.py`, `frontend/src/lib/api.ts`, `frontend/next.config.ts`, `backend/tests/api/test_auth.py`, `frontend/tests/e2e/sprint1.spec.ts` | Backend auth tests, Playwright refresh test, `npm run test:e2e`, `pytest`. | Closed |
| H1 | High | Frontend did not use refresh flow. | API client attached access token but never retried expired requests. | Centralized refresh retry with cookie credentials, request replay once, refresh de-duplication, and session cleanup on failure. | `frontend/src/lib/api.ts`, `frontend/tests/e2e/sprint1.spec.ts` | Playwright expired-token refresh test passed. | Closed |
| H2 | High | My Lists, Restaurants, Cafes, Public Lists, and Profile used N+1/fan-out list-detail calls. | Backend summaries lacked counts/relationship context; frontend computed context by fetching details. | List summaries return `placeCount`; places include current-user list IDs/names/count; frontend uses collection summaries/context instead of per-list detail fan-out. | `backend/app/api/places.py`, `backend/app/api/lists.py`, `backend/app/modules/places/schemas.py`, `backend/app/modules/lists/services.py`, `frontend/app/lists/page.tsx`, `frontend/src/features/places/PlaceLibraryPage.tsx`, `frontend/src/features/places/PlaceDetailPage.tsx`, `frontend/src/features/lists/PublicListsPage.tsx`, `frontend/src/features/profile/ProfileArchivePage.tsx` | Backend collection tests and full Playwright suite passed. | Closed |
| H3 | High | Normalized place-name uniqueness not enforced by DB. | App-level lower-case precheck raced and DB only enforced raw name. | Added `normalized_name`, canonical normalization, unique index, migration/backfill, duplicate and concurrent creation tests. | `backend/app/modules/places/models.py`, `backend/app/modules/places/services.py`, `backend/app/modules/places/schemas.py`, `backend/migrations/versions/20260620_0004_normalized_place_names.py`, `backend/tests/api/test_places_and_lists.py` | Duplicate normalized name and concurrent create tests passed. | Closed |
| H4 | High | CI did not exercise PostgreSQL. | CI used SQLite-only backend tests and skipped live PostgreSQL validation. | Added PostgreSQL CI service, Alembic migration validation, `POSTGRES_TEST_DATABASE_URL`, and live PostgreSQL integration test path. | `.github/workflows/ci.yml`, `backend/tests/integration/test_postgresql_validation.py` | Local metadata compile passed; live PostgreSQL skipped locally because Docker daemon unavailable; CI configured to run it. | Closed |
| H5 | High | API error contract inconsistent. | Routers raised mixed `detail` shapes. | Added centralized error helpers and FastAPI exception handlers returning `{code,message}`; frontend parser simplified around contract. | `backend/app/core/errors.py`, `backend/app/main.py`, `frontend/src/lib/api.ts`, backend API tests | Representative auth/place/list tests passed. | Closed |
| H6 | High | Business logic lived in route handlers. | MVP routers accumulated domain rules directly. | Moved auth, list, rating/profile, and query behavior into service modules; routers now delegate validation/authorization/business operations. | `backend/app/modules/auth/services.py`, `backend/app/modules/lists/services.py`, `backend/app/modules/profile/services.py`, `backend/app/modules/ratings/services.py`, `backend/app/api/*.py` | Ruff, mypy, pytest passed. | Closed |
| H7 | High | Pagination and sorting incomplete. | Collections returned direct/unbounded arrays or incomplete metadata. | Added collection envelope/meta helpers; bounded limit/offset/sort for places/lists/public lists; frontend uses `apiCollection`. | `backend/app/core/schemas.py`, `backend/app/api/places.py`, `backend/app/api/lists.py`, `frontend/src/lib/api.ts` | Pagination/envelope tests passed. | Closed |
| H8 | High | Dependency/security scanning not reliable CI gate. | Python audit scanned polluted local env and was absent from CI. | Added `pip-audit` dev dependency and project-scoped CI audit; frontend `npm audit` gate added. | `backend/pyproject.toml`, `.github/workflows/ci.yml`, `README.md` | `python -m pip_audit . --skip-editable` and `npm audit --audit-level=moderate` passed. | Closed |
| M1 | Medium | Backend mypy missing from CI. | Strict mypy was local-only. | Added backend mypy CI gate. | `.github/workflows/ci.yml` | `python -m mypy app tests` passed. | Closed |
| M2 | Medium | Axe dependency was transitive. | Accessibility test read `axe-core` without direct dependency. | Added direct `axe-core` devDependency. | `frontend/package.json`, `frontend/package-lock.json` | Launch-readiness accessibility Playwright test passed. | Closed |
| M3 | Medium | Large frontend files mix loading/state/copy/rendering. | Feature pages grew during UI batches. | Reduced highest-risk coupling by centralizing API collection handling and removing fan-out logic; full page/copy decomposition remains a follow-up. | `frontend/src/lib/api.ts`, place/list/profile feature files | Lint, typecheck, build, E2E passed. | Partially Closed |
| M4 | Medium | `globals.css` is a monolith. | Tokens, components, route styles, and old classes share one file. | Removed active legacy panel usage and added missing dialog confirmation styles; full CSS split remains a follow-up. | `frontend/app/globals.css`, `frontend/app/page.tsx`, `frontend/app/health/page.tsx` | Full E2E passed; active home/health legacy class usage removed. | Partially Closed |
| M5 | Medium | Duplicate `new_id` and `utc_now`. | Models copied helper functions. | Added shared DB utility and updated models/services to use it. | `backend/app/db/utils.py`, backend model modules | Ruff, mypy, pytest passed. | Closed |
| M6 | Medium | E2E mock-heavy. | Most UI state tests mocked API; real stack coverage was narrow. | Added/kept real Sprint 3 flow, refreshed mocks to contract envelopes, added refresh-cookie E2E, and configured CI PostgreSQL migration validation. Broader real-stack UI matrix remains a follow-up. | `frontend/tests/e2e/*.spec.ts`, `.github/workflows/ci.yml` | 33 Playwright tests passed. | Partially Closed |
| M7 | Medium | No auth rate limiting. | Auth endpoints lacked throttle dependency. | Added configurable in-memory auth rate limiter and tests for 429. | `backend/app/core/rate_limit.py`, `backend/app/api/auth.py`, `backend/tests/api/test_auth.py` | Auth rate-limit test passed. | Closed |
| M8 | Medium | API versioning absent. | Routers mounted at root. | Mounted app endpoints under `/api/v1`; frontend API client centrally prefixes `/api/v1`. | `backend/app/main.py`, `frontend/src/lib/api.ts`, tests | Backend and frontend tests passed. | Closed |
| M9 | Medium | Dialog used `window.confirm`. | Unsaved-change handling relied on native confirm. | Replaced with app-owned accessible alert inside dialog; added focus recovery after cancel, Escape handling, and Playwright coverage. | `frontend/src/components/ui/Dialog.tsx`, `frontend/tests/e2e/batch2a.spec.ts` | Dialog/sheet E2E passed. | Closed |
| M10 | Medium | Collection endpoints returned raw arrays. | MVP API optimized for simple arrays. | Introduced `CollectionResponse<T>` and frontend `apiCollection<T>`. | `backend/app/core/schemas.py`, collection routers, `frontend/src/lib/api.ts` | Collection envelope tests passed. | Closed |
| L1 | Low | Generated files clutter workspace. | Build/test/dependency folders remained after validation; no Git checkout available. | Removed `.next`, Playwright reports/results, `node_modules`, `tsconfig.tsbuildinfo`, Python caches, mypy/ruff/pytest caches, and E2E backend cache after validation. Existing historical screenshot deliverables were left intact. | Workspace cleanup | `rg` found no current cache/build/test result artifacts in active source paths. | Partially Closed |
| L2 | Low | README stale. | README still described Sprint 0. | Rewrote README for current stack, security defaults, API v1, commands, and quality gates. | `README.md` | Manual review. | Closed |
| L3 | Low | Legacy `/places` redirect remained. | Old route kept compatibility behavior. | Removed `frontend/app/places/page.tsx`; canonical Restaurants/Cafes routes remain. | `frontend/app/places/page.tsx` | Build route inventory no longer includes `/places`. | Closed |
| L4 | Low | Home/health pages used legacy panel classes. | Early shell classes survived later design-system work. | Replaced active home/health usage with current primitives. | `frontend/app/page.tsx`, `frontend/app/health/page.tsx` | Health Playwright test passed. | Closed |
| L5 | Low | CI used `npm install` instead of `npm ci`. | CI was still MVP-grade. | CI frontend install now uses `npm ci`; dependency audit gate added. | `.github/workflows/ci.yml` | `npm ci` passed locally before cleanup. | Closed |

## Files Created

- `backend/app/core/errors.py`
- `backend/app/core/rate_limit.py`
- `backend/app/core/schemas.py`
- `backend/app/db/utils.py`
- `backend/app/modules/profile/services.py`
- `backend/migrations/versions/20260620_0004_normalized_place_names.py`
- `docs/36-engineering-remediation-report.md`

## Key Files Modified

- `.github/workflows/ci.yml`
- `.env.example`
- `README.md`
- `backend/app/main.py`
- `backend/app/core/config.py`
- `backend/app/api/auth.py`
- `backend/app/api/places.py`
- `backend/app/api/lists.py`
- `backend/app/api/profile.py`
- `backend/app/modules/auth/*`
- `backend/app/modules/lists/*`
- `backend/app/modules/places/*`
- `backend/app/modules/ratings/*`
- `backend/pyproject.toml`
- `backend/scripts/start_e2e_api.py`
- `backend/tests/api/test_auth.py`
- `backend/tests/api/test_places_and_lists.py`
- `backend/tests/api/test_health.py`
- `backend/tests/api/test_sprint2.py`
- `backend/tests/conftest.py`
- `frontend/src/lib/api.ts`
- `frontend/src/components/ui/Dialog.tsx`
- `frontend/app/page.tsx`
- `frontend/app/health/page.tsx`
- `frontend/app/lists/page.tsx`
- `frontend/app/lists/[id]/page.tsx`
- `frontend/src/features/places/PlaceLibraryPage.tsx`
- `frontend/src/features/places/PlaceDetailPage.tsx`
- `frontend/src/features/lists/PublicListsPage.tsx`
- `frontend/src/features/profile/ProfileArchivePage.tsx`
- `frontend/tests/e2e/*.spec.ts`
- `frontend/package.json`
- `frontend/package-lock.json`
- `frontend/playwright.config.ts`
- `frontend/next.config.ts`

## Migration Added

- `backend/migrations/versions/20260620_0004_normalized_place_names.py`

## Validation Results

| Command | Result |
| --- | --- |
| `python -m ruff check .` | Passed |
| `python -m ruff format --check .` | Passed |
| `python -m mypy app tests` | Passed |
| `python -m pytest tests -q` | 30 passed, 1 skipped |
| `python -m pytest tests/integration/test_postgresql_validation.py -q` | 1 passed, 1 skipped locally |
| `python -m pip_audit . --skip-editable` | No known vulnerabilities |
| `npm ci` | Passed before cleanup |
| `npm run lint` | Passed |
| `npm run typecheck` | Passed |
| `npm run build` | Passed |
| `npm run test:e2e` | 33 passed |
| `npm audit --audit-level=moderate` | 0 vulnerabilities |

## Remaining Risks

- Local live PostgreSQL validation was not executed because Docker Desktop was unavailable on this machine. The CI workflow now provisions PostgreSQL, runs Alembic migrations, and sets `POSTGRES_TEST_DATABASE_URL`.
- Full CSS modularization and feature-page decomposition are still maintainability follow-ups, not controlled-beta blockers.
- Existing historical screenshot folders were preserved because they appear to be prior design/audit deliverables.
- There is no `.git` directory in this workspace, so clean VCS state cannot be proven from this environment.

## Deviations

- `node_modules` was removed after validation to reduce generated workspace clutter. Re-run `npm ci` before any future frontend validation.
- PostgreSQL integration was validated through metadata compilation locally and CI configuration, not through a local live database, due Docker daemon unavailability.
