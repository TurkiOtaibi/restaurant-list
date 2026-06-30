# ARCHITECTURE_IMPROVEMENT_PLAN.md

> **Companion to:** `CURRENT_ARCHITECTURE_REVIEW.md`
> **Rule:** Only evidence-justified improvements. Where an area is already excellent, it says **“No improvement recommended.”** No stylistic-only changes. No code written here — this is a plan.
> **Effort key:** S ≤ 2 days · M 3–5 days · L 1–2+ weeks.

---

## Priority Overview

| # | Recommendation | Category | Effort | Risk to apply |
|---|---|:--:|:--:|:--:|
| C1 | Production observability: metrics + error tracking + alerting | **Critical** | M | Low |
| C2 | Infrastructure tier + persistent Redis + (eventually) ≥2 instances | **Critical** | S–M | Low |
| H1 | Align pagination default to EDR-003 (`limit=20`, enforce max) | High | S | Low (breaking-ish) |
| H2 | Decouple DB migrations from process start; add release gate | High | M | Medium |
| H3 | Tighten frontend CSP (remove `unsafe-inline`/`unsafe-eval`) | High | M | Medium |
| M1 | Read-path scalability: denormalized rating aggregate or read cache | Medium | M–L | Medium |
| M2 | Extend rate limiting beyond auth (write/search endpoints) | Medium | S | Low |
| M3 | Readiness Alembic-revision gate + enrich health payloads | Medium | S | Low |
| M4 | Add a staging environment to `render.yaml` | Medium | S | Low |
| L1 | Remove dead `VisualArtwork`; fix `.env.example` drift | Low | S | Low |
| L2 | Commit OpenAPI snapshot + contract test in CI | Low | S | Low |
| L3 | Revisit `places.created_by_user_id` ON DELETE for future account deletion | Low | S | Low |

---

## CRITICAL

### C1 — Production observability (metrics, error tracking, alerting)
- **Problem:** The system is operationally blind beyond request logs.
- **Evidence:** `backend/app/main.py` emits structured logs only; no metrics endpoint, no Sentry/OTEL, no alert config anywhere in `backend/app/**` or `render.yaml`. `live()` payload lacks env/timestamp (`backend/app/api/health.py`).
- **Impact:** Incidents are detected by users, not systems; no latency/error SLIs; no audit trail.
- **Risk (of not doing it):** High — undetected outages/regressions in production.
- **Priority:** Critical · **Effort:** M
- **Benefits:** Mean-time-to-detect drops; capacity and error trends become visible; supports the EDR-006 “operational policy” items with real surfaces.
- **Trade-offs:** Adds a dependency (e.g. error-tracking SaaS) and minor request overhead.
- **Implementation strategy:** (1) Error tracking (e.g. Sentry SDK) in FastAPI + Next.js; (2) a `/metrics` (Prometheus) or vendor metrics for request rate/latency/error-rate; (3) alerts on error-rate and `/health/ready` failures; (4) decide audit-log scope (auth events first).
- **Backward compatibility:** Fully additive; no API/schema change.
- **Expected improvement:** Observability 6 → 8; Production Readiness 6 → 7.

### C2 — Infrastructure tier + persistent Redis (and a path to ≥2 instances)
- **Problem:** All services are free-tier; Redis may not persist; single instance = no HA and cold starts.
- **Evidence:** `render.yaml` — every service `plan: free`; Redis comment: “guaranteed persistence … requires a paid plan; the free plan … may not persist on restart.”
- **Impact:** Rate-limit counters reset on restart; downtime on redeploy; latency spikes from cold starts.
- **Risk:** High for a public launch; acceptable only for closed beta.
- **Priority:** Critical · **Effort:** S–M (plan change + verify) — note: this is an account/billing action, partly outside the repo.
- **Benefits:** Durable rate limiting, availability, predictable latency.
- **Trade-offs:** Cost.
- **Implementation strategy:** Upgrade API + Redis plans; confirm persistence; keep one instance until C1/H2 land, then raise instance count.
- **Backward compatibility:** No code change.
- **Expected improvement:** Scalability 6 → 7; Production Readiness 6 → 7.

---

## HIGH

### H1 — Align pagination default with EDR-003
- **Problem:** Default `limit=100` contradicts the approved contract (default `20`).
- **Evidence:** `list_places`/`list_lists`/`list_public_lists` use `limit ... = 100` (`backend/app/api/places.py`, `backend/app/api/lists.py`); `docs/engineering-decisions/EDR-003_COLLECTION_ENVELOPE_AND_PAGINATION.md` mandates default `20`, max `100`, over-max → `422 VALIDATION_ERROR`.
- **Impact:** Contract drift; larger default payloads than specified.
- **Risk:** Low; mildly breaking for any client assuming 100. The frontend already passes explicit `limit` (`PAGE_SIZE=20` in `PlaceLibraryPage.tsx`), so client impact is minimal.
- **Priority:** High · **Effort:** S
- **Benefits:** Contract conformance; smaller default responses.
- **Trade-offs:** Clients relying on the implicit 100 must paginate.
- **Implementation strategy:** Change router defaults to 20; keep `le=100`; ensure over-max returns the EDR-001 `VALIDATION_ERROR` envelope.
- **Backward compatibility:** Coordinate with any non-frontend consumer; document in release notes.
- **Expected improvement:** API 7 → 8.

### H2 — Decouple migrations from process start; add a release/migration gate
- **Problem:** `alembic upgrade head` runs in `startCommand` before `uvicorn`, so every instance start mutates schema; there is no in-repo rollback/forward-fix runbook.
- **Evidence:** `render.yaml` `startCommand: alembic upgrade head && uvicorn ...`.
- **Impact:** Safe on one instance; a race/partial-migration hazard the moment you scale to ≥2 instances; blocks C2’s instance bump.
- **Risk:** Medium to change (deploy-process change).
- **Priority:** High · **Effort:** M
- **Benefits:** Deterministic, single-runner migrations; safe horizontal scaling.
- **Implementation strategy:** Move migrations to a dedicated pre-deploy/release step (Render pre-deploy command or CI job) that runs once; app start only serves traffic; pair with M3 readiness revision gate.
- **Backward compatibility:** Operational change only; no API/schema change.
- **Expected improvement:** Scalability 6 → 7; DevOps 7 → 8.

### H3 — Tighten frontend Content-Security-Policy
- **Problem:** `script-src` allows `'unsafe-eval'` and `'unsafe-inline'`, weakening XSS defense — the one place client-side token theft would matter most given the in-memory-token design.
- **Evidence:** `frontend/next.config.ts` CSP header.
- **Impact:** Reduced protection against injected/inline script execution.
- **Risk:** Medium — Next.js inline bootstrap historically needs care; a prior nonce attempt in this repo broke login (see project history), so this must be done carefully and verified.
- **Priority:** High · **Effort:** M
- **Benefits:** Materially stronger XSS posture; complements the in-memory access-token model.
- **Trade-offs:** Requires nonce/hash plumbing and thorough verification across pages.
- **Implementation strategy:** Adopt Next.js nonce-based CSP (per-request nonce in middleware) or strict-dynamic with hashes; remove `unsafe-inline`/`unsafe-eval`; verify login + all routes in a real browser before merge.
- **Backward compatibility:** No API change; must be behind a verified deploy given prior incident.
- **Expected improvement:** Security 8 → 9.

---

## MEDIUM

### M1 — Read-path scalability for the places ranking
- **Problem:** Every places query recomputes `avg(rating)`+`count` and `ORDER BY avg DESC`.
- **Evidence:** `_place_summary_statement` + `list_place_summaries` in `backend/app/modules/places/services.py`.
- **Impact:** Fine at current data volume; CPU/latency grow with ratings at 100×.
- **Risk:** Medium (data-denormalization or cache invalidation logic).
- **Priority:** Medium · **Effort:** M–L
- **Benefits:** Flat read latency at scale; cheaper sort.
- **Trade-offs:** Maintaining a denormalized aggregate (triggers/app-side) or cache invalidation complexity.
- **Implementation strategy:** Prefer the simplest that works: add `(rating_sum, rating_count)` columns on `places` updated transactionally in `ratings/services.py`, plus an index supporting the ranking; OR a short-TTL read cache. Add `(type, subtype)` index for filters. Measure first.
- **Backward compatibility:** Response shape unchanged; internal only.
- **Expected improvement:** Performance 7 → 8; Scalability 6 → 7.

### M2 — Extend rate limiting beyond auth
- **Problem:** Only `/auth/*` is throttled; create/search endpoints are open to abuse.
- **Evidence:** `enforce_auth_rate_limit` applied only in `backend/app/api/auth.py`.
- **Impact:** Possible spam place creation / search hammering.
- **Risk:** Low.
- **Priority:** Medium · **Effort:** S
- **Benefits:** Broader abuse protection reusing existing Redis limiter.
- **Implementation strategy:** Add a per-user/IP limiter dependency to write + search routes with sensible quotas; reuse `core/rate_limit.py`.
- **Backward compatibility:** Additive (new 429 paths under abuse only).
- **Expected improvement:** Security 8 → 8.5.

### M3 — Readiness Alembic-revision gate + richer health payloads
- **Problem:** `/health/ready` checks DB connectivity but not schema/migration head; `/health/live` lacks env/timestamp.
- **Evidence:** `backend/app/api/health.py`.
- **Impact:** A connected-but-unmigrated instance can report ready (esp. relevant once H2 separates migration from start).
- **Risk:** Low.
- **Priority:** Medium · **Effort:** S
- **Benefits:** Traffic gated on schema-correct instances; better health introspection.
- **Implementation strategy:** Compare current Alembic head vs expected in `/health/ready`; add `environment`/`timestamp`/`requestId` fields per the OPS user stories.
- **Backward compatibility:** Health responses are additive; keep `status` keys.
- **Expected improvement:** Observability 6 → 7; Scalability support for H2.

### M4 — Add a staging environment
- **Problem:** Only `production` is defined; changes go straight to prod after CI.
- **Evidence:** `render.yaml` (`APP_ENV=production` only; no staging service/env group).
- **Impact:** No production-like pre-prod validation surface.
- **Risk:** Low.
- **Priority:** Medium · **Effort:** S
- **Benefits:** Safer releases; a place to verify H3/H2 changes.
- **Implementation strategy:** Add a staging service group (or Render preview environments) with its own DB/secrets.
- **Backward compatibility:** Additive infra.
- **Expected improvement:** DevOps 7 → 8.

---

## LOW

### L1 — Remove dead code and fix config drift
- **Problem:** `VisualArtwork.tsx` is unreferenced; `.env.example` sets `AUTH_RATE_LIMIT_REQUESTS=100` while code/`render.yaml` use `10`.
- **Evidence:** no importers of `frontend/src/components/ui/VisualArtwork.tsx`; `.env.example` vs `backend/app/core/config.py`/`render.yaml`.
- **Impact:** Minor confusion/debt.
- **Priority:** Low · **Effort:** S · **Risk:** Low.
- **Benefits:** Cleaner surface, accurate onboarding config.
- **Backward compatibility:** None affected.
- **Expected improvement:** Maintainability 8 → 8.5.

### L2 — Commit OpenAPI snapshot + contract test
- **Problem:** API contract isn’t pinned by an artifact/test; docs are disabled in prod.
- **Evidence:** `enable_api_docs=False` (`config.py`); no `openapi.json` in repo.
- **Impact:** Contract drift (e.g. H1) can slip unnoticed.
- **Priority:** Low · **Effort:** S · **Risk:** Low.
- **Benefits:** Drift detection in CI; client-generation ready.
- **Implementation strategy:** Generate and commit `openapi.json`; add a CI step that fails on unexpected diff.
- **Backward compatibility:** None affected.
- **Expected improvement:** API 7 → 7.5; DevOps support.

### L3 — Reconsider `places.created_by_user_id` ON DELETE for future account deletion
- **Problem:** `ondelete="RESTRICT"` will block deleting a user who created places — a problem once account deletion / GDPR erasure exists.
- **Evidence:** `backend/app/modules/places/models.py`.
- **Impact:** None today (no deletion feature); future blocker.
- **Priority:** Low · **Effort:** S · **Risk:** Low.
- **Benefits:** Unblocks future erasure flows.
- **Implementation strategy:** When account deletion is designed, decide ownership reassignment (e.g. a system user) vs `SET NULL` + nullable column; handle via migration.
- **Backward compatibility:** Deferred; revisit with the deletion feature.
- **Expected improvement:** Future Readiness.

---

## Explicitly: No Improvement Recommended

- **Module/layering design** (`backend/app/modules/*`): already excellent — **No improvement recommended.**
- **Authentication & token lifecycle** (`auth/services.py`, `lib/api.ts`): production-grade — **No improvement recommended** (keep as the reference pattern).
- **N+1 avoidance / batched loading** (`places/services.py`, `lists/services.py`): already optimal for the access patterns — **No improvement recommended.**
- **CI structure** (`ci.yml`): comprehensive (real-Postgres tests + audits + e2e) — **No improvement recommended** beyond H2/L2 additions.
- **Database constraint design** (`*/models.py`): correct and thorough — **No structural change recommended** (only the additive indexes in M1).

---

## Sequencing (recommended)

1. **C1 + M3** (observability + health gate) — see before you scale.
2. **C2 + H2** (tier/persistence + migration decoupling) — enables safe multi-instance.
3. **H1 + M2 + L1 + L2** (contract + abuse + cleanup) — quick, low-risk hardening.
4. **H3** (CSP) — carefully, with full browser verification (prior nonce attempt broke login).
5. **M1 + M4** (read scaling + staging) — when traffic/feature growth justifies.

All recommendations are **additive and backward-compatible** except H1 (mild contract change, low client impact) and H3 (requires verified deploy). **No redesign is warranted.**
