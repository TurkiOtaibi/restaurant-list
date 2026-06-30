# CURRENT_ARCHITECTURE_REVIEW.md

> **Type:** Independent pre-production Architecture Review (audit only — no code written, no files modified except this deliverable)
> **Reviewed at:** `main` (latest pulled), repository root `/home/user/restaurant-list`
> **Method:** Whole-repository read — backend (`backend/app/**`), frontend (`frontend/**`), database models + migrations (`backend/migrations/**`), infra (`render.yaml`, `docker-compose.yml`, `infra/`), CI (`.github/workflows/ci.yml`), config, tests, EDRs (`docs/engineering-decisions/**`).
> **Rule applied:** Every conclusion cites repository evidence. Where evidence is absent, it says **“Not enough evidence.”**

---

## Executive Summary

The system is a **modular monolith**: a FastAPI async backend (`backend/app`) and a Next.js 15 / React 19 App-Router frontend (`frontend`), deployed on Render as two web services plus a Redis instance (`render.yaml`), backed by PostgreSQL.

The **code-level architecture is genuinely strong**: clean module boundaries, a disciplined dependency direction (router → service → model, with shared `core`), centralized error/logging, an exemplary authentication design (refresh-token rotation **with reuse detection**), batched queries that avoid N+1, strict static typing on both ends (`mypy --strict`, TS `strict`), and a comprehensive CI pipeline that runs against **real PostgreSQL** plus dependency audits.

The **weaknesses are concentrated in operational/production-readiness**, not in code design: free-tier single-instance infrastructure with a documented Redis-persistence caveat, no metrics/alerting/error-tracking, a read path that recomputes rating aggregates per request (scaling concern), and a few contract drifts (pagination default, frontend CSP). None of these require redesign — they are additive hardening.

**Overall: 7/10 — “Good”.** Production-ready for a **controlled beta**; **not yet ready** for unqualified production scale without the observability and infrastructure items below.

---

## Current Architecture

- **Style:** Modular monolith, layered, async end-to-end.
- **Backend:** FastAPI; `app/api/*` routers → `app/modules/<domain>/services.py` → `app/modules/<domain>/models.py` (SQLAlchemy 2 async + asyncpg). Cross-cutting concerns in `app/core` (`config`, `errors`, `rate_limit`, `schemas`, `security`) and `app/db` (`session`, `base`, `utils`). Evidence: `backend/app/main.py`, `backend/app/modules/*`.
- **Domains:** `auth`, `places`, `lists`, `ratings`, `profile` — each self-contained with `models/schemas/services` (+ router). Evidence: `backend/app/modules/`.
- **Frontend:** Next.js App Router (`frontend/app/**` routes), feature modules (`frontend/src/features/*`), shared design-system components (`frontend/src/components/ui/*`), and a single API abstraction (`frontend/src/lib/api.ts`).
- **Auth/session:** JWT HS256 access tokens (15 min) held **in memory** on the client; refresh tokens are **HttpOnly Secure cookies** scoped to `/api/v1/auth`, hashed at rest (SHA-256), rotated on use, with reuse detection. Evidence: `backend/app/modules/auth/services.py`, `frontend/src/lib/api.ts`.
- **Data:** PostgreSQL; Alembic migrations (`backend/migrations/versions/*`), applied at deploy via `startCommand` (`render.yaml`).
- **Infra:** Render `web(python)` + `web(node)` + `redis`, all `plan: free`, `autoDeployTrigger: checksPass`, health-gated (`/health/ready`, `/api/health`). Evidence: `render.yaml`.

### Architecture Diagram (text)

```
                    ┌──────────────────────────────────────────────┐
   Browser (RTL/ar) │  Next.js 15 App Router (frontend/app)         │
   ────────────────▶│  features/* + components/ui/*                 │
                    │  lib/api.ts  (in-memory access token,         │
                    │   silent refresh, Web Locks + BroadcastChannel│
                    └───────────────┬──────────────────────────────┘
                                    │  HTTPS  (Authorization: Bearer access)
                                    │         (Cookie: HttpOnly refresh, path=/api/v1/auth)
                                    ▼
   ┌───────────────────────────────────────────────────────────────────────┐
   │ FastAPI app (backend/app/main.py)                                      │
   │  middleware: request-id + security headers + structured JSON log        │
   │  CORS (outermost) ─ exception handlers → EDR-001 {error} envelope        │
   │                                                                         │
   │  api/auth  api/places  api/lists  api/ratings  api/profile  api/health  │
   │      │         │           │          │            │                    │
   │      ▼         ▼           ▼          ▼            ▼                     │
   │   modules/<domain>/services.py   (business logic, ownership checks)      │
   │      │                                                                  │
   │      ▼                                                                  │
   │   modules/<domain>/models.py  (SQLAlchemy 2 async)                       │
   └───────────────┬───────────────────────────────┬───────────────────────┘
                   │ asyncpg                         │ redis.asyncio (rate limit)
                   ▼                                 ▼
            ┌──────────────┐                  ┌──────────────┐
            │ PostgreSQL   │                  │ Redis (free) │
            │ users/places │                  │ auth rate    │
            │ lists/items  │                  │ limit counters│
            │ ratings/rt   │                  └──────────────┘
            └──────────────┘
   Deploy: Render (render.yaml) — alembic upgrade head && uvicorn ; autoDeploy on checksPass
   CI: .github/workflows/ci.yml — backend(ruff/mypy/pytest@Postgres/pip-audit) · frontend(lint/tsc/build/npm audit) · e2e(Playwright@real stack)
```

---

## Strengths (with evidence)

1. **Exemplary auth/session design.** Rotation + reuse detection revokes the whole token family on replay; tokens hashed at rest; cookies HttpOnly/Secure/path-scoped. Evidence: `stored_refresh_token()` and `revoke_all_user_refresh_tokens()` in `backend/app/modules/auth/services.py`; `set_refresh_cookie(... path="/api/v1/auth")`.
2. **No N+1 in list/detail paths.** Relationships are batch-loaded by id and aggregates computed in one grouped query. Evidence: `get_user_place_relationships()` and `_place_summary_statement()` in `backend/app/modules/places/services.py`; `selectinload(UserList.items).selectinload(ListItem.place)` in `backend/app/modules/lists/services.py`.
3. **Centralized, contract-driven error + logging.** EDR-001 `{error:{code,message,requestId}}` envelope and EDR-004 structured JSON logs with all required fields. Evidence: `build_error_content()` and `add_operational_headers` in `backend/app/main.py`.
4. **Strict typing + strong CI.** `mypy strict` (`backend/pyproject.toml`), TS `strict` (`frontend/tsconfig.json`), and CI runs lint, format, typecheck, **migrations + pytest on real PostgreSQL**, `pip-audit`, `npm audit`, and Playwright e2e against the real stack. Evidence: `.github/workflows/ci.yml`.
5. **Defense-in-depth security headers + secret hygiene.** HSTS/CSP/X-Frame-Options/X-Content-Type-Options on API (`main.py`) and frontend (`frontend/next.config.ts`); production rejects default/identical JWT secrets and insecure cookies (`reject_default_production_secrets` in `backend/app/core/config.py`); Render generates secrets (`generateValue: true`).
6. **Data integrity at the database layer.** FKs, `UniqueConstraint`, and `CheckConstraint`s (rating range + 0.5 step, place type/subtype, list/rating uniqueness). Evidence: `backend/app/modules/{ratings,places,lists}/models.py`.
7. **Test isolation.** Schema dropped/created per test, rate-limit reset fixture, NullPool. Evidence: `backend/tests/conftest.py`.

---

## Weaknesses (with evidence)

1. **Infrastructure is all free-tier / single-instance.** Every Render service is `plan: free`; the Redis block carries an explicit comment that the free plan “may not persist on restart.” Evidence: `render.yaml`. → No HA, cold starts, rate-limit counters can reset.
2. **No metrics / alerting / error tracking / audit.** Only request logs exist; no Sentry/OTEL/metrics endpoint and no audit table. Evidence: absence across `backend/app/**` (only `request_logger` in `main.py`); `live()` payload lacks env/timestamp (`backend/app/api/health.py`).
3. **Read path recomputes aggregates per request.** `list_place_summaries` does `avg(rating)`+`count` over an outer join and `ORDER BY avg(...) DESC` on every call, with no denormalized aggregate or cache. Evidence: `backend/app/modules/places/services.py`. → Acceptable now; a scaling concern at 100×.
4. **Pagination default contradicts the approved contract.** Routers default `limit=100`; EDR-003 mandates default `20`. Evidence: `list_places`/`list_lists` (`limit ... = 100`) vs `docs/engineering-decisions/EDR-003_COLLECTION_ENVELOPE_AND_PAGINATION.md`.
5. **Frontend CSP weakens XSS protection.** `script-src 'self' 'unsafe-eval' 'unsafe-inline'`. Evidence: `frontend/next.config.ts`.
6. **Migrations auto-run at process start with no gate/rollback automation.** `startCommand: alembic upgrade head && uvicorn ...`. Evidence: `render.yaml`. Safe on a single instance; unsafe/racy once horizontally scaled, and there is no forward-fix/rollback runbook in-repo (consistent with EDR-008 being policy-only).
7. **Rate limiting covers only auth.** `enforce_auth_rate_limit` is applied to `/auth/*` only; place creation/search/list endpoints are unthrottled. Evidence: `backend/app/api/*` (no rate-limit dependency outside `auth.py`).
8. **Minor dead code / config drift.** `VisualArtwork.tsx` is no longer referenced by any surface; `.env.example` sets `AUTH_RATE_LIMIT_REQUESTS=100` while code/`render.yaml` use `10`. Evidence: `frontend/src/components/ui/VisualArtwork.tsx`, `.env.example`.

---

## Architecture Scores (1–10, with justification)

| Category | Score | Justification (evidence) |
|---|:--:|---|
| **Architecture (overall)** | 8 | Clean modular monolith; correct dependency direction; high cohesion, low coupling. `backend/app/modules/*`, `frontend/src/features/*`. |
| **Backend** | 8 | Layered router→service→model, DI via FastAPI `Depends`, centralized errors/logging. No repository abstraction, but appropriate for size. `app/api/*`, `app/modules/*/services.py`. |
| **Frontend** | 7 | Strong feature/ui split and a first-class `api.ts`. No data-fetching/cache library → manual loading/error logic repeated per page; one dead component. `frontend/src/**`. |
| **Database** | 8 | 3NF, FKs, unique + check constraints, indexed FKs/unique cols, decimal ratings. Missing composite `(type,subtype)` index and any rating-aggregate denormalization. `backend/app/modules/*/models.py`. |
| **API** | 7 | Consistent REST, `/api/v1`, `{data,meta}`, EDR-001 errors, idempotent add (200/201). Default `limit=100` violates EDR-003; no committed OpenAPI/contract test. `app/api/*`. |
| **Security** | 8 | Rotation+reuse detection, hashed tokens, bcrypt, headers, CORS, auth rate limit, secret rejection, LIKE escaping. Held back by frontend CSP `unsafe-inline/eval` and auth-only rate limiting. `auth/services.py`, `next.config.ts`. |
| **Performance** | 7 | No N+1, `pool_pre_ping`, `selectinload`. Per-request aggregate+sort and no read cache. `places/services.py`. |
| **Scalability** | 6 | Stateless API + shared Redis limiter enable horizontal scale, but free single instance, non-persistent Redis, and start-time migrations block safe scale-out today. `render.yaml`. |
| **Maintainability** | 8 | Strict typing both ends, small focused modules, EDRs as decisions of record. Doc sprawl + minor dead code. `pyproject.toml`, `tsconfig.json`, `docs/engineering-decisions/*`. |
| **Testing** | 8 | 54 backend tests on real Postgres + integration constraint tests; 38 Playwright e2e with a11y(axe)/network-fault/responsive/deterministic-data harnesses; clean isolation. `backend/tests/**`, `frontend/tests/e2e/**`. |
| **DevOps** | 7 | Comprehensive CI + IaC + health-gated autodeploy on green checks. No staging env, all free plan, no rollback/migration-gate automation. `ci.yml`, `render.yaml`. |
| **Observability** | 6 | Structured JSON logs + request IDs + live/ready. No metrics/alerts/error-tracking/audit; liveness payload thin. `main.py`, `api/health.py`. |
| **Production Readiness** | 6 | Secure, tested, deployable; blocked from full production by infra tier, observability, and Redis-persistence caveat. `render.yaml`. |
| **Overall** | **7** | Excellent engineering discipline; operational maturity is the gating factor. |

---

## Review of Every Area

**1. Overall Architecture —** Modular monolith with crisp boundaries; dependencies flow inward to `core`/`db`; no circular module coupling observed. Appropriate style for the domain size; microservices would be unjustified complexity. Evidence: `backend/app/modules/*`, import graph in routers/services.

**2. Domain Architecture —** Entities `User`, `RefreshToken`, `Place`, `UserList`, `ListItem`, `Rating`. Ownership enforced in services via `user_id` filters (`get_owned_list`, etc.). Key invariants are DB-enforced (unique `(user_id,place_id)` rating; unique `(list_id,place_id)`; rating range/step; place type/subtype). Domain rule “first rating removes place from user lists” is implemented (`remove_place_from_user_lists`). Aggregates are simple; no aggregate-root framework needed. Evidence: `modules/*/models.py`, `modules/ratings/services.py`.

**3. Backend Architecture —** Routers thin; services hold logic and own transactions (`db.commit()`); DTOs are Pydantic schemas with serialization aliases; validation in schemas + explicit query guards (`validate_single_query_value`, `validate_place_filter`). Error handling centralized to one envelope. Logging structured. No DI container beyond FastAPI `Depends` (sufficient). Evidence: `app/api/*`, `app/modules/*/services.py`, `app/main.py`.

**4. Frontend Architecture —** App Router pages delegate to `features/*` page components; shared `components/ui` design system; `lib/api.ts` centralizes fetch, auth, refresh, and cross-tab token sync. No global state library — local React state + manual fetch per page (some duplication of loading/error patterns; e.g. `PlaceLibraryPage`, `ProfileArchivePage`). Evidence: `frontend/src/lib/api.ts`, `frontend/src/features/*`.

**5. API Architecture —** REST, resource-scoped routers, `/api/v1` prefix, `{data,meta}` collections, EDR-001 error envelope, idempotent add returns 200 vs 201, deletes return `{deleted:true}`. Drift: default `limit=100` (EDR-003 → 20); no committed OpenAPI artifact/contract test. Evidence: `app/api/places.py`, `app/core/schemas.py`, `main.py`.

**6. Database Architecture —** Normalized; constraints and indexes present; Alembic chain linear and hand-written (reviewable). Gaps: no composite `(type,subtype)` index for the documented filter; rating aggregates computed live. `created_by_user_id` is `ondelete="RESTRICT"`, which will block future account deletion. Evidence: `modules/places/models.py`, `migrations/versions/*`.

**7. Security Architecture —** Strong (see Strengths). Residual: frontend CSP `unsafe-inline/eval`; rate limiting only on auth; no roles/authorization tiers (admin module intentionally absent). Secrets sourced from env with production validation. Evidence: `next.config.ts`, `core/security.py`, `core/config.py`.

**8. Performance Architecture —** Async I/O throughout; batched loads; `pool_pre_ping=True`. Frontend uses windowed `VirtualList` and bounded pagination (`PAGE_SIZE=20`). Concern: live aggregate sort and no server-side read cache. Evidence: `places/services.py`, `frontend/src/features/places/PlaceLibraryPage.tsx`.

**9. Scalability —** API is stateless (JWT) and the limiter is Redis-backed (shareable), so horizontal scale is *architecturally* possible. Blockers today: free single instance, non-persistent free Redis, and migration-at-startup (race if N>1). No background queue (none required yet). Evidence: `render.yaml`, `core/rate_limit.py`.

**10. DevOps —** CI is thorough and gates deploys (`autoDeployTrigger: checksPass`). IaC via `render.yaml`. Gaps: only a `production` env defined (no staging), no rollback/migration-gate automation, all free plan. Evidence: `.github/workflows/ci.yml`, `render.yaml`.

**11. Observability —** Request IDs (reused if supplied), structured JSON logs with EDR-004 fields, `/health/live` + `/health/ready` (DB-gated, 200/503). Missing: metrics, alerting, error tracking, audit log; `live` lacks env/timestamp; readiness has no Alembic-revision gate. Evidence: `main.py`, `api/health.py`.

**12. Testing Architecture —** Unit (`tests/unit`), integration constraint tests (`tests/integration`), API tests on real Postgres, and a rich Playwright e2e harness layer (a11y via `axe-core`, network-fault, responsive matrix, deterministic data). Good isolation. Many catalog cases remain blocked on real-device/AT labs (inherently manual, consistent with EDR-006). Evidence: `backend/tests/**`, `frontend/tests/e2e/**`, `frontend/package.json` (`axe-core`).

**13. Maintainability —** High: strict typing, consistent module shapes, EDRs as decisions of record, small files. Minor debt: dead `VisualArtwork`, `.env.example` drift, large `docs/` surface. Evidence: as cited above.

**14. Future Readiness —** *New modules/devs:* easy — the module template is obvious and uniform. *10× users:* feasible after Redis-persistence + one app instance bump + indexes. *100× users:* requires denormalized rating aggregates and/or read caching and migration-gating decoupled from process start. Evidence: `modules/*`, `render.yaml`, `places/services.py`.

---

## Verified Risks

| ID | Risk | Severity | Evidence |
|---|---|:--:|---|
| R1 | Free-tier single instance + non-persistent free Redis → no HA, limiter resets | High | `render.yaml` (`plan: free`, Redis persistence comment) |
| R2 | No metrics/alerting/error-tracking/audit → blind in production | High | absence in `backend/app/**`; `main.py` logs only |
| R3 | Per-request rating aggregate + sort, no read cache → scaling cost | Medium | `backend/app/modules/places/services.py` |
| R4 | Pagination default `limit=100` violates EDR-003 (`20`) → contract drift + payload size | Medium | `app/api/places.py`, `app/api/lists.py` vs `EDR-003` |
| R5 | Frontend CSP allows `unsafe-inline`/`unsafe-eval` → weaker XSS defense | Medium | `frontend/next.config.ts` |
| R6 | Migrations at process start, no gate/rollback automation → blocks safe scale-out | Medium | `render.yaml` `startCommand` |
| R7 | Only auth endpoints rate-limited → abuse surface on create/search | Low | `app/api/*` |
| R8 | `places.created_by_user_id` `ondelete=RESTRICT` → blocks future account deletion / GDPR erase | Low | `backend/app/modules/places/models.py` |
| R9 | No staging environment defined | Low | `render.yaml` (only `APP_ENV=production`) |

---

## Non-Issues (explicitly not problems)

- **Modular monolith instead of microservices.** Correct for this domain/scale. No change recommended.
- **No repository pattern / no DI container.** FastAPI `Depends` + service functions are sufficient; adding layers would be ceremony. No change recommended.
- **No frontend state-management library.** Justified at current size. No change recommended (revisit only if shared client state grows).
- **SQLite fallback in tests.** CI runs the suite on real PostgreSQL (`ci.yml`); the fallback is a convenience and does not weaken CI. No change recommended.
- **Hand-written (non-autogenerated) migrations.** Reviewable and intentional. No change recommended.

---

## Things Done Exceptionally Well

1. **Refresh-token rotation with reuse detection** (token-family revocation) — production-grade. `auth/services.py`.
2. **In-memory access token + silent refresh + cross-tab coordination** via Web Locks + BroadcastChannel. `frontend/src/lib/api.ts`.
3. **N+1-free data access** through batched id loads and grouped aggregates. `places/services.py`, `lists/services.py`.
4. **CI that tests on real PostgreSQL and audits dependencies** before a checks-gated deploy. `ci.yml`, `render.yaml`.
5. **Decisions captured as EDRs** and enforced in code (error envelope, request-id logging). `docs/engineering-decisions/*`, `main.py`.

---

## Production Readiness Assessment

- **Controlled beta:** **Ready.** Security, data integrity, CI, and core flows are solid; the app is deployed and health-gated.
- **Unqualified production / scale:** **Not yet.** Gating items: observability (R2), infra tier + Redis persistence (R1), read scalability (R3), and migration-gating for multi-instance (R6). The admin/moderation capability is intentionally absent (documented elsewhere) and is an operational, not architectural, gap.

---

## Overall Score: **7 / 10**

## Final Verdict: **GOOD**

Engineering quality at the code level is **Very Good→Excellent** (security, typing, testing, module design). The overall verdict is held to **Good** by operational maturity — observability, infrastructure tier, and read-scaling — all of which are **additive, low-risk improvements that require no redesign**. See `ARCHITECTURE_IMPROVEMENT_PLAN.md`.
