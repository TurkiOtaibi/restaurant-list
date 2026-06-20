# 35. Engineering Code Quality, Architecture, and Performance Audit

Date: 2026-06-20

Scope: backend, frontend, database models, migrations, API routes, auth, tests, CI, and configuration.

Out of scope: product strategy, UI taste, and visual design.

## 1. Executive Engineering Audit Summary

The codebase is functional and much cleaner than a throwaway MVP, but it is not production-grade engineering yet.

The strongest parts are the small backend surface, typed FastAPI/Pydantic schemas, explicit database constraints for ratings/list items, hashed refresh tokens on the backend, strict backend typing configuration, and meaningful end-to-end flow coverage. The weak parts are more serious: browser auth stores long-lived tokens in `localStorage`, frontend session refresh is not implemented, API contracts are inconsistent and unversioned, relationship context creates repeated fan-out requests, PostgreSQL is not actually exercised in CI, backend services are thin while route handlers carry business logic, and repository/tooling hygiene is not mature.

Passing tests do not prove engineering quality here. Backend tests mostly run against SQLite metadata-created schemas, frontend tests mostly mock the API, CI omits backend mypy, and dependency/security audit is not a stable isolated gate.

Engineering score: **6.7 / 10**.

Final verdict: **Average**.

## Evidence Reviewed

- Backend source under `backend/app`.
- Frontend source under `frontend/app` and `frontend/src`.
- Migrations under `backend/migrations`.
- Backend tests under `backend/tests`.
- Playwright tests under `frontend/tests/e2e`.
- CI workflow at `.github/workflows/ci.yml`.
- Runtime/config files: `backend/pyproject.toml`, `frontend/package.json`, `frontend/next.config.ts`, `docker-compose.yml`, `.env.example`, `.gitignore`.

Commands executed:

| Command | Result |
| --- | --- |
| `python -m ruff check .` | Passed |
| `python -m ruff format --check .` | Passed |
| `python -m mypy app tests` | Passed |
| `python -m pytest` | 27 passed, 1 skipped |
| `npm run lint` | Passed |
| `npm run typecheck` | Passed |
| `npm run build` | Passed |
| `npm run test:e2e` | 32 passed |
| `npm audit --omit=dev --audit-level=moderate` | 0 vulnerabilities |
| `pip-audit` in current Python environment | Failed with 18 vulnerabilities in 10 packages, but included unrelated environment packages, so it is not accepted as project-only evidence |

## 2. Critical Findings

### C1. Browser Auth Storage Enables Account Takeover After Any XSS

| Field | Detail |
| --- | --- |
| File or area affected | `frontend/src/lib/api.ts:4`, `frontend/src/lib/api.ts:98`, `frontend/src/lib/api.ts:105`, `frontend/src/lib/api.ts:126`; `frontend/next.config.ts:1`; `backend/app/main.py:23` |
| Why it matters | Access and refresh tokens are stored in `localStorage`. The refresh token is long-lived and is sent back to the backend for rotation. Any XSS, malicious dependency, compromised browser extension, or injected script can steal both tokens and persist account access. The app also lacks a Content Security Policy, so the frontend does not meaningfully reduce script injection blast radius. |
| Risk level | Critical |
| Recommended fix | Move refresh tokens to `HttpOnly`, `Secure`, `SameSite=Lax/Strict` cookies; keep access tokens in memory or use a short-lived cookie strategy; add a strict CSP with nonces/hashes; add logout/session revocation coverage; avoid exposing refresh tokens to JavaScript. |
| Acceptance criteria | Refresh token is never readable via `window.localStorage`, `sessionStorage`, or JavaScript; auth flow still supports register/login/refresh/logout; CSP header exists on all frontend pages; E2E verifies refresh and logout behavior without direct token access; security tests prove localStorage has no auth secrets. |

## 3. High Findings

### H1. Frontend Does Not Use Refresh Tokens

| Field | Detail |
| --- | --- |
| File or area affected | `frontend/src/lib/api.ts:4`, `frontend/src/lib/api.ts:105`, `frontend/src/lib/api.ts:115`, `frontend/src/lib/api.ts:132`; `frontend/app/login/page.tsx:48`; `frontend/app/register/page.tsx:48` |
| Why it matters | The backend implements refresh token rotation, but the frontend API client only attaches the access token and never retries 401 responses with `/auth/refresh`. Users will be logged out after access token expiry even though the backend has refresh persistence. This is hidden by tests that seed fixed localStorage tokens. |
| Risk level | High |
| Recommended fix | Implement a single refresh path in the API client with request replay, refresh de-duplication, failure cleanup, and logout on refresh failure. |
| Acceptance criteria | Expired access token triggers exactly one refresh request; original request is retried once; concurrent 401s share one refresh operation; refresh failure clears session and redirects/auth-prompts consistently; tests cover expiry and rotation. |

### H2. Relationship Context Creates N+1 / Fan-Out API Calls

| Field | Detail |
| --- | --- |
| File or area affected | `frontend/app/lists/page.tsx:36`; `frontend/src/features/places/PlaceLibraryPage.tsx:59`, `frontend/src/features/places/PlaceLibraryPage.tsx:63`; `frontend/src/features/places/PlaceDetailPage.tsx:44`, `frontend/src/features/places/PlaceDetailPage.tsx:48`; `frontend/src/features/profile/ProfileArchivePage.tsx:70`; `frontend/src/features/lists/PublicListsPage.tsx:42` |
| Why it matters | Multiple pages fetch list summaries, then fetch every list detail with `Promise.all` to compute counts or place relationships. With 50 lists, a single page can trigger 51 API calls. Under real latency or mobile networks this becomes slow, expensive, and brittle. |
| Risk level | High |
| Recommended fix | Add backend-supported summary fields and relationship context: list item count on list summaries, place relationship summary on place listing/detail, and public list summary counts. |
| Acceptance criteria | My Lists, Restaurants, Cafes, Place Detail, Profile, and Public Lists render required relationship/count context with O(1) or bounded requests per screen; tests assert request counts; no page fans out one request per list. |

### H3. Normalized Place Name Uniqueness Is Not Enforced By The Database

| Field | Detail |
| --- | --- |
| File or area affected | `backend/app/api/places.py:54`; `backend/app/modules/places/models.py:23`; `backend/migrations/versions/20260618_0001_sprint_1_foundation.py:48`; `docs/04-non-functional-requirements.md:36` |
| Why it matters | The route checks `func.lower(Place.name) == name.lower()` before insert, but the database only has a raw unique index on `places.name`. Whitespace/case normalization is an app-level precheck and can race under concurrent writes. The documented invariant says the database must enforce trimmed, lowercased, whitespace-normalized uniqueness. |
| Risk level | High |
| Recommended fix | Add a normalized name column or PostgreSQL functional unique index using the exact canonicalization rule; write through the canonical value transactionally; test concurrent inserts on PostgreSQL. |
| Acceptance criteria | Database rejects normalized duplicates without relying on a pre-query; concurrent duplicate creates produce one success and one deterministic 409; migration backfills existing data; SQLite tests are supplemented by PostgreSQL tests. |

### H4. CI Does Not Exercise The Target Database

| Field | Detail |
| --- | --- |
| File or area affected | `.github/workflows/ci.yml:1`; `backend/tests/conftest.py:20`; `backend/tests/integration/test_postgresql_validation.py:22`; `backend/scripts/start_e2e_api.py:16` |
| Why it matters | The production database target is PostgreSQL, but backend tests create schemas directly on SQLite and the live PostgreSQL test is skipped unless `POSTGRES_TEST_DATABASE_URL` is manually set. E2E real API also uses SQLite and `Base.metadata.create_all`, bypassing Alembic. PostgreSQL-only failures, migration drift, indexes, constraints, locking, and concurrency behavior can pass CI unnoticed. |
| Risk level | High |
| Recommended fix | Add a PostgreSQL service to CI, run Alembic migrations against it, run API tests against migrated PostgreSQL, and keep SQLite only for fast unit-level checks. |
| Acceptance criteria | CI fails if migrations do not apply to PostgreSQL; `test_live_postgresql_connection_when_configured` is not skipped in CI; API tests use PostgreSQL at least once; concurrent invariant tests run against PostgreSQL. |

### H5. API Error Contract Is Inconsistent

| Field | Detail |
| --- | --- |
| File or area affected | `backend/app/api/places.py:43`, `backend/app/api/places.py:58`; `backend/app/api/lists.py:38`, `backend/app/api/lists.py:201`, `backend/app/api/lists.py:248`; `backend/app/api/ratings.py:52`, `backend/app/api/ratings.py:82`; `frontend/src/lib/api.ts:77` |
| Why it matters | Some errors return `detail` as a string and others return `{code,message}`. The frontend compensates with generic parsing. Contract drift makes client behavior hard to reason about and weakens testability. |
| Risk level | High |
| Recommended fix | Standardize every error response through one schema and one helper. |
| Acceptance criteria | Every `HTTPException` detail uses `{code,message}`; validation errors are mapped or documented consistently; frontend no longer handles multiple ad hoc shapes; contract tests assert representative 400/401/404/409/422/500 shapes. |

### H6. Business Logic Lives In Route Handlers

| Field | Detail |
| --- | --- |
| File or area affected | `backend/app/api/lists.py:31`, `backend/app/api/lists.py:42`, `backend/app/api/lists.py:191`; `backend/app/api/ratings.py:29`, `backend/app/api/ratings.py:45`; `backend/app/api/auth.py:77`; `backend/app/api/places.py:45` |
| Why it matters | Route handlers perform ownership loading, duplicate handling, idempotency, rating upsert, list cleanup, token rotation, and response composition. This is acceptable early, but maintainability degrades as rules expand because business behavior cannot be unit-tested without HTTP/API setup. |
| Risk level | High |
| Recommended fix | Move domain operations into service/use-case functions with explicit inputs/outputs and keep routers thin. |
| Acceptance criteria | Routers mostly validate/authorize/delegate; rating upsert, add-list-item idempotency, list visibility, and token rotation have direct service-level tests; no route file exceeds roughly 150 lines of business logic. |

### H7. API Pagination And Sorting Are Under-Engineered

| Field | Detail |
| --- | --- |
| File or area affected | `backend/app/api/places.py:24`, `backend/app/api/places.py:29`; `backend/app/api/lists.py:83`, `backend/app/api/lists.py:96`; `backend/app/modules/places/services.py:79`; `docs/12-api-specification.md:52`, `docs/12-api-specification.md:444` |
| Why it matters | Places have offset/limit but no metadata, deterministic secondary sort, or page envelope. Lists/public lists return unbounded arrays. Offset pagination becomes slow and unstable as data grows. |
| Risk level | High |
| Recommended fix | Introduce consistent bounded pagination for all collection endpoints, with metadata and deterministic ordering. |
| Acceptance criteria | Collection endpoints return bounded pages with `limit/pageSize`, next/previous or total metadata as approved; list endpoints cannot return unlimited rows; sort behavior is explicit and tested. |

### H8. Security And Dependency Scanning Are Not Reliable Gates

| Field | Detail |
| --- | --- |
| File or area affected | `.github/workflows/ci.yml:1`; `backend/pyproject.toml:1`; `frontend/package.json:1`; current `pip-audit` execution |
| Why it matters | `npm audit` passed for production dependencies, but Python dependency scanning is not part of CI and the current local `pip-audit` scans a polluted environment rather than a reproducible project lock. It reported vulnerabilities from unrelated packages, which proves the audit path is not trustworthy. |
| Risk level | High |
| Recommended fix | Create a locked backend dependency artifact and audit exactly that environment in CI. Add frontend and backend dependency audit gates. |
| Acceptance criteria | CI runs backend dependency audit from a lockfile or isolated venv; audit output contains only project dependencies; known vulnerabilities fail builds by policy; frontend audit remains in CI. |

## 4. Medium Findings

### M1. Backend Type Checking Is Configured But Missing From CI

| Field | Detail |
| --- | --- |
| File or area affected | `backend/pyproject.toml:53`; `.github/workflows/ci.yml:23`, `.github/workflows/ci.yml:29` |
| Why it matters | `mypy` strict mode passes locally, but CI only runs ruff/format/pytest. The highest-value backend maintainability gate is optional. |
| Risk level | Medium |
| Recommended fix | Add `python -m mypy app tests` to CI. |
| Acceptance criteria | CI fails on backend type regressions; local and CI quality gates match. |

### M2. Frontend Accessibility Test Uses An Undeclared Transitive Dependency

| Field | Detail |
| --- | --- |
| File or area affected | `frontend/tests/e2e/launch-readiness.spec.ts:8`; `frontend/package.json:1` |
| Why it matters | The test reads `node_modules/axe-core/axe.min.js`, but `axe-core` is not declared directly. It currently exists through `eslint-plugin-jsx-a11y`. A dependency tree change can break accessibility tests without any intentional test change. |
| Risk level | Medium |
| Recommended fix | Add `axe-core` as an explicit devDependency or use a maintained Playwright axe integration. |
| Acceptance criteria | `npm ls axe-core --depth=0` succeeds; accessibility tests do not depend on unrelated eslint transitive packages. |

### M3. Large Frontend Files Mix Data Loading, State, Copy, And Rendering

| Field | Detail |
| --- | --- |
| File or area affected | `frontend/src/features/places/PlaceLibraryPage.tsx` has 608 lines; `frontend/src/features/places/PlaceDetailPage.tsx` has 309 lines; `frontend/src/features/profile/ProfileArchivePage.tsx` has 284 lines; `frontend/app/lists/[id]/page.tsx` has 250 lines |
| Why it matters | These files combine API orchestration, local state transitions, relationship derivation, Arabic copy helpers, labels, and JSX. The coupling makes behavior hard to test without full pages and encourages duplication. |
| Risk level | Medium |
| Recommended fix | Extract typed query hooks/services, copy dictionaries, and small presentational subcomponents. |
| Acceptance criteria | Feature pages delegate data fetching and label generation; relationship labels are reused from one module; page files shrink materially without losing behavior; tests can target extracted pure helpers. |

### M4. Global CSS Is A Monolith

| Field | Detail |
| --- | --- |
| File or area affected | `frontend/app/globals.css` has 2,196 lines |
| Why it matters | Tokens, layout, components, routes, responsive behavior, and legacy classes live in one file. This raises accidental regression risk and makes component ownership unclear. |
| Risk level | Medium |
| Recommended fix | Split CSS into tokens, base, component, and feature modules or adopt a formal design-token/CSS-module boundary. |
| Acceptance criteria | Tokens are isolated; component styles live near components or in named component layers; route-specific CSS is not mixed with global primitives; dead legacy classes are removed. |

### M5. Repeated Backend Timestamp/ID Helpers Are Low-Grade Duplication

| Field | Detail |
| --- | --- |
| File or area affected | `backend/app/modules/auth/models.py:11`; `backend/app/modules/places/models.py:10`; `backend/app/modules/lists/models.py:10`; `backend/app/modules/ratings/models.py:18` |
| Why it matters | `new_id` and `utc_now` are duplicated across model modules. This is not dangerous now, but it is a signal that model conventions are copied manually instead of centralized. |
| Risk level | Medium |
| Recommended fix | Move ID/time helpers or a timestamp mixin to a shared db/model utility. |
| Acceptance criteria | One implementation exists for ID and timestamp defaults; new models use the shared convention. |

### M6. E2E Coverage Is Broad But Mock-Heavy

| Field | Detail |
| --- | --- |
| File or area affected | `frontend/tests/e2e/*.spec.ts`; `frontend/tests/e2e/sprint3-real.spec.ts:43`; `backend/scripts/start_e2e_api.py:34` |
| Why it matters | 31 of 32 Playwright tests use mocked API routes or localStorage token seeding. The one real API test uses SQLite and metadata create/drop, not migrated PostgreSQL. Tests can pass while API contract, DB behavior, auth refresh, and migration behavior regress. |
| Risk level | Medium |
| Recommended fix | Keep mocks for UI states, but add a smaller set of contract/real-stack E2E tests against a migrated backend database. |
| Acceptance criteria | Real-stack tests cover register/login/refresh, create place duplicate, list add idempotency, rating list cleanup, and public/private authorization; mocks are labeled as UI-state tests. |

### M7. Auth Has No Rate Limiting Or Abuse Protection

| Field | Detail |
| --- | --- |
| File or area affected | `backend/app/api/auth.py:114`, `backend/app/api/auth.py:134`; `backend/app/main.py:28`; `backend/pyproject.toml:1` |
| Why it matters | Login/register/refresh endpoints have no rate limiting, lockout, anomaly detection, or throttling dependency. This invites credential stuffing and token brute-force attempts. |
| Risk level | Medium |
| Recommended fix | Add IP/user keyed throttling at API or gateway level. |
| Acceptance criteria | Auth endpoints enforce documented limits; tests verify 429 behavior; limits can be configured per environment. |

### M8. API Versioning Is Absent

| Field | Detail |
| --- | --- |
| File or area affected | `backend/app/api/auth.py:35`; `backend/app/api/places.py:15`; `backend/app/api/lists.py:26`; `backend/app/api/ratings.py:16`; `backend/app/api/profile.py:16` |
| Why it matters | Routers expose unversioned paths. Any future API contract change affects existing clients directly. |
| Risk level | Medium |
| Recommended fix | Mount routers under a versioned prefix or explicitly formalize unversioned API policy. |
| Acceptance criteria | API paths are versioned or policy is documented and contract-tested; frontend base paths are centrally configured. |

### M9. Dialog Accessibility Implementation Is Good But Uses Native Confirm For Unsaved Changes

| Field | Detail |
| --- | --- |
| File or area affected | `frontend/src/components/ui/Dialog.tsx:220` |
| Why it matters | `window.confirm` is blocking, browser-controlled, hard to style/test consistently, and can behave poorly with assistive tech compared with the app's own dialog system. |
| Risk level | Medium |
| Recommended fix | Replace native confirm with an accessible app-owned confirmation dialog that preserves focus management. |
| Acceptance criteria | Unsaved-change confirmation is keyboard/screen-reader testable; no browser confirm is used; focus returns correctly after cancel/confirm. |

### M10. Collection Endpoints Expose Direct Arrays Instead Of Stable Response Envelopes

| Field | Detail |
| --- | --- |
| File or area affected | `backend/app/api/places.py:24`; `backend/app/api/lists.py:83`; `backend/app/api/lists.py:96`; `frontend/src/lib/api.ts:115` |
| Why it matters | Direct arrays are simple but leave no stable place for pagination metadata, request IDs, warnings, or future compatibility flags. |
| Risk level | Medium |
| Recommended fix | Adopt a consistent response envelope for collections before more clients exist. |
| Acceptance criteria | Collection responses include data and metadata; frontend types enforce the envelope; tests verify metadata. |

## 5. Low Findings

### L1. Repository/Workspace Hygiene Is Noisy

| Field | Detail |
| --- | --- |
| File or area affected | Workspace root; `.gitignore`; observed `frontend/node_modules`, `frontend/.next`, `backend/.e2e`, `frontend/test-results`, `frontend/playwright-report`, `__pycache__`, `audit-ui.db`, `frontend/tsconfig.tsbuildinfo` |
| Why it matters | The `.gitignore` excludes most generated artifacts, but the current workspace contains them and there is no `.git` directory to prove what is tracked. This increases review noise and handoff ambiguity. |
| Risk level | Low |
| Recommended fix | Use a real VCS checkout for delivery review and clean generated artifacts before handoff. |
| Acceptance criteria | `git status --short` is available and clean except intended files; generated artifacts are not present in deliverable workspace unless explicitly required. |

### L2. README Is Stale

| Field | Detail |
| --- | --- |
| File or area affected | `README.md:1` |
| Why it matters | README still describes Sprint 0 guardrails and says business features are not implemented, while the code includes lists, places, ratings, profile, and search-by-name. Stale docs waste engineering time. |
| Risk level | Low |
| Recommended fix | Update README to current architecture and run commands. |
| Acceptance criteria | README accurately describes current implemented features, setup, migrations, tests, and known limitations. |

### L3. Legacy Route Still Exists As Redirect

| Field | Detail |
| --- | --- |
| File or area affected | `frontend/app/places/page.tsx:4` |
| Why it matters | `/places` redirects to `/restaurants`, while the approved frontend navigation split uses Restaurants and Cafes. This is not currently harmful, but stale compatibility routes can hide old assumptions. |
| Risk level | Low |
| Recommended fix | Keep only if explicitly part of compatibility policy; otherwise remove once callers are migrated. |
| Acceptance criteria | Route inventory distinguishes canonical routes from redirects; tests assert canonical navigation only. |

### L4. Home/Health Pages Still Use Legacy Panel Classes

| Field | Detail |
| --- | --- |
| File or area affected | `frontend/app/page.tsx:5`; `frontend/app/health/page.tsx:3`; `frontend/app/globals.css` legacy `.panel` styles |
| Why it matters | This is not a visual-design finding. It is code hygiene: old class systems remain active beside design-system classes, increasing CSS surface and future drift risk. |
| Risk level | Low |
| Recommended fix | Either isolate legacy utility classes or replace them with current primitives. |
| Acceptance criteria | No unused legacy class patterns remain; CSS dead-code scan or route coverage proves class ownership. |

### L5. Frontend Build Uses Broad Dependency Ranges

| Field | Detail |
| --- | --- |
| File or area affected | `frontend/package.json:1`; `frontend/package-lock.json:1` |
| Why it matters | The lockfile pins actual install, but `package.json` uses broad `^` ranges. This is normal for apps, but production hardening should define update policy and CI should use `npm ci`, not `npm install`. |
| Risk level | Low |
| Recommended fix | Use `npm ci` in CI and document dependency update cadence. |
| Acceptance criteria | CI installs from lockfile only; lockfile drift fails builds. |

## 6. Backend Code Review

Clean:

- FastAPI app factory is small and testable in `backend/app/main.py`.
- Pydantic schemas use aliases for frontend camelCase.
- Password hashing, token creation, and token decoding are centralized in `backend/app/core/security.py`.
- Refresh tokens are hashed at rest in `backend/app/modules/auth/models.py`.
- Database constraints exist for rating range, one rating per user/place, one list item per list/place, and list visibility.

Messy:

- Route files are doing domain work instead of delegating to services.
- Error response shapes are inconsistent.
- Place uniqueness is not a true database-normalized invariant.
- Query composition and response mapping are only partially extracted into `places/services.py`.
- Repeated `new_id`/`utc_now` helpers indicate weak shared model conventions.

## 7. Frontend Code Review

Clean:

- Core UI primitives exist and are reused: `Button`, `Dialog`, `Input`, `ListCard`, `PlaceCard`, `RatingControl`, `SearchField`.
- Dialog implementation includes focus trap, inert background, escape handling, and focus restoration.
- `BidiText` correctly isolates mixed-direction names.
- TypeScript strict build passes.

Messy:

- API state, relationship derivation, copy, and rendering are mixed inside large page files.
- Auth/session lifecycle is too primitive for the backend capabilities.
- Repeated list-detail fan-out exists across multiple screens.
- Large monolithic CSS file creates weak ownership.
- E2E tests directly seed localStorage, normalizing a security smell.

## 8. Database / Migration Review

Clean:

- Alembic migrations exist and are ordered.
- Foreign keys have explicit delete behavior.
- List item and rating uniqueness are enforced in database schema.
- Rating range and enum-like fields are checked.

Messy:

- Normalized place-name uniqueness is not enforced by the database.
- CI does not apply migrations to PostgreSQL.
- E2E API startup uses `Base.metadata.create_all`, bypassing migration reality.
- There are no migration rollback/upgrade tests.

## 9. API Review

Clean:

- API surface is small and understandable.
- Authorization checks for owned lists are centralized through `_get_owned_list`.
- Public list access requires authentication through the same dependency chain.
- Place responses include community and current-user rating context.

Messy:

- API paths are unversioned.
- Collection responses are direct arrays.
- Pagination is inconsistent and incomplete.
- Error envelopes are inconsistent.
- Relationship context required by the frontend is not supported directly by the API, pushing expensive logic to the client.

## 10. Auth Review

Clean:

- Backend refresh tokens are persisted, hashed, revocable, and rotated.
- Access and refresh tokens use separate secrets.
- Production config rejects default JWT secrets.
- Invalid credentials return 401 without exposing which field failed.

Messy:

- Frontend stores access and refresh tokens in localStorage.
- Frontend does not refresh expired access tokens.
- No rate limiting exists on auth endpoints.
- No CSP exists to reduce token theft blast radius.
- No test proves browser token storage is absent because it is currently present.

## 11. Performance Review

Biggest bottlenecks:

- Frontend fan-out requests for list details.
- `%LIKE%` name search in `backend/app/modules/places/services.py:76`, which will not use ordinary B-tree indexes efficiently.
- Rating aggregate query does `avg`/`count` on every place list/detail request.
- Lists/public lists are unbounded.
- Profile loads every rating and computes counts in Python in `backend/app/api/profile.py:29`.

The current app is fine at toy scale. It is not fine at the documented NFR scale without query redesign, pagination, and relationship summary APIs.

## 12. Security Review

Key risks:

- Critical token storage risk in localStorage.
- No CSP.
- No auth rate limiting.
- Backend docs remain enabled at `/docs` and `/redoc` for all environments in `backend/app/main.py:23`.
- Dependency scanning is not reliable or in CI for backend.
- CORS allows configured origins with credentials and wildcard methods/headers; this is acceptable only if production origins are tightly configured.

Security positives:

- Passwords are hashed with bcrypt through passlib.
- Refresh tokens are hashed in the database.
- Basic security headers exist on backend and frontend.
- Production default JWT secrets are rejected.

## 13. Test Quality Review

Meaningful coverage:

- Backend API tests cover register/login/refresh/logout, duplicate email, duplicate place, add-to-list idempotency, list authorization, ratings, notes privacy, public/private list access, profile stats, and rating validation.
- Playwright tests cover major screens, accessibility smoke checks, RTL/Arabic rendering, and one real frontend/API flow.
- Backend mypy, ruff, pytest pass locally.

Weak coverage:

- PostgreSQL test is skipped by default.
- Migrations are not tested in CI.
- No backend concurrency tests.
- No API contract tests.
- No load/performance tests.
- No frontend token refresh tests.
- No unit tests for complex frontend helper logic.
- Accessibility coverage checks only serious/critical automated axe findings, not keyboard paths on every modal/sheet state.

## 14. CI / Tooling Review

Clean:

- CI has backend and frontend jobs.
- Backend runs lint, format, pytest.
- Frontend runs lint, typecheck, Playwright.

Messy:

- CI uses `npm install` instead of `npm ci`.
- CI does not run backend mypy.
- CI does not run backend dependency audit.
- CI does not run npm audit.
- CI does not run PostgreSQL service/migrations.
- CI does not archive useful test artifacts explicitly.
- No evidence of coverage thresholds.
- No `.git` directory exists in the current workspace, so source-control cleanliness cannot be verified.

## 15. Technical Debt List

1. LocalStorage auth tokens.
2. No frontend refresh-token use.
3. N+1/fan-out frontend relationship loading.
4. DB-normalized uniqueness missing for place names.
5. SQLite-dominant backend tests.
6. Migration bypass in E2E API startup.
7. Inconsistent error contracts.
8. Unversioned API.
9. Route-heavy backend business logic.
10. Large frontend feature/page files.
11. Monolithic global CSS.
12. Missing backend mypy in CI.
13. Missing dependency audit gates.
14. Missing rate limiting.
15. Unbounded list endpoints.
16. No load tests.
17. No contract tests.
18. Stale README.
19. Generated artifacts in workspace.
20. Undeclared direct `axe-core` dependency.

## 16. Refactoring Opportunities

1. Create backend service/use-case modules for auth token rotation, place creation, list item idempotency, rating upsert, and list visibility.
2. Add repository/query helpers for relationship context and list counts.
3. Extract frontend API hooks or query services for places/lists/profile.
4. Extract relationship-label and Arabic count-label helpers into shared pure modules with unit tests.
5. Split global CSS into token/base/component/feature layers.
6. Introduce a response/error envelope helper for FastAPI.
7. Add a shared SQLAlchemy timestamp/UUID convention.
8. Replace frontend localStorage session management with a secure session abstraction.
9. Replace direct Playwright route mocks with fixture builders plus a smaller contract-backed suite.
10. Convert E2E API startup to migrated PostgreSQL for at least one CI job.

## 17. What Will Break First Under Load

1. Place-library pages due to `/places` plus `/lists` plus one `/lists/{id}` request per list.
2. My Lists page due to one detail request per list for counts.
3. Public Lists page due to one public detail request per public list.
4. `%LIKE%` search on lowercased place names.
5. Rating aggregate queries on large `ratings` table.
6. Profile endpoint loading all ratings and all summarized places at once.
7. Unbounded `/lists` and `/lists/public`.
8. Concurrent place creation with normalized duplicate names.
9. Auth endpoints under brute-force traffic because rate limiting is absent.
10. CI confidence, because PostgreSQL/migration/concurrency issues are currently weakly tested.

## 18. What Is Clean

- Small backend module count.
- Strict backend mypy config.
- Passing backend mypy locally.
- Clear Pydantic schemas.
- Hashed refresh tokens.
- Database constraints for ratings and list items.
- FastAPI dependency-based auth.
- Design-system primitive components.
- Dialog focus/inert implementation.
- Bidi isolation component.
- Playwright coverage across major workflows.
- Basic security headers.

## 19. What Is Messy

- Browser token storage.
- Session refresh gap.
- Route handlers with embedded business logic.
- Inconsistent API errors.
- N+1 frontend request patterns.
- Monolithic CSS.
- Large feature page files.
- Mock-heavy tests.
- SQLite-dominant backend validation.
- Stale docs/README.
- Non-isolated security audit path.
- Generated artifacts in the working directory.

## 20. Engineering Score

| Area | Score | Rationale |
| --- | ---: | --- |
| Backend quality | 7.1 | Typed, small, functional; route-heavy and DB invariant gaps remain. |
| Frontend quality | 6.5 | Reusable primitives and passing typecheck; large coupled pages and weak session handling. |
| Architecture | 6.6 | Reasonable modular monolith start; boundaries are still informal. |
| Performance | 5.8 | Works at small scale; N+1/fan-out and unbounded endpoints are real scale blockers. |
| Security | 5.9 | Backend refresh handling is decent; browser token storage/no CSP/no rate limiting pull score down hard. |
| Tests | 7.0 | Broad happy-path and state coverage; weak PostgreSQL, migration, contract, concurrency, and refresh coverage. |
| Maintainability | 6.7 | Clean enough to continue, not clean enough to scale without refactoring. |
| Overall engineering quality | 6.7 | Average. Credible foundation, not production-grade engineering. |

Final verdict: **Average**.

