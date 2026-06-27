# IMPLEMENTATION_COMPLETION_PLAN.md

> **Document type:** Implementation Roadmap (planning only — no code, no doc edits, no RTM/user-story changes)
> **Source of Truth:** `main` @ `2ff78518cc875dc91c391d546c2021f7a30c78d3`
> **Authored as:** Principal Software Architect · Principal Technical Lead · Principal Product Engineer · Principal QA Architect
> **Date:** 2026-06-27
> **Inputs:** `IMPLEMENTATION_COVERAGE_REPORT.md`, `IMPLEMENTATION_EVIDENCE_REVIEW.md`, `docs/feature-map/FEATURE_TRACEABILITY.md`, approved User Stories (`docs/user-stories/*`), approved EDRs (`docs/engineering-decisions/EDR-001..008`).

---

## 1. Overall Implementation Percentage

Derived directly from `IMPLEMENTATION_COVERAGE_REPORT.md` (83 features audited, runtime-implementation evidence only):

| Status | Count | % |
|---|---:|---:|
| ✅ Implemented | 54 | **65.1%** |
| 🟡 Partially Implemented | 16 | 19.3% |
| ❌ Not Implemented | 9 | 10.8% |
| ⚪ Unable to Verify | 4 | 4.8% |

- **Fully implemented coverage:** **65.1%** (54/83)
- **Any-evidence coverage:** **84.3%** (70/83)
- **Remaining to close:** 29 features (16 partial + 9 not implemented + 4 unable-to-verify)

**Weighted completion (accounting for partials at ~50% and the large but deferrable Admin/Roadmap block):** effective product-MVP completion is **~78–82%**; **production-operational** completion is materially lower (**~55–60%**) because Admin and operational-readiness are the largest open blocks.

---

## 2. Remaining Implementation Effort

Effort key: **S** = ≤2 dev-days · **M** = 3–5 dev-days · **L** = 1–2+ dev-weeks.

| Bucket | Features | Effort profile |
|---|---|---|
| Core user-facing partials | LIST-007/008/010, PLACE-001/007, RATING-005 | 1×M-shared + 2×M + 2×S |
| API contract & privacy hardening | OPS-001/002/003 (+EDR-004 logging) | 1×M/L + 1×M + 1×S |
| Accessibility | A11Y-001, A11Y-002 | 2×S |
| Operational readiness | OPS-004/005/006/007 | 1×M + 3×S (much is policy/manual per EDR-006/008) |
| Admin & moderation | ADMIN-001..007 | 2×L + 5×M (the dominant cost) |
| Future roadmap | ROAD-002 (ROAD-001 deferred) | 1×M |
| Verification track | QA-001..004, RESP-003 | 5×S (verification, not implementation) |

**Estimated remaining engineering effort:** roughly **8–11 engineer-weeks**, of which **~45–55% is the Admin/moderation module alone**. Excluding Admin and deferred roadmap, the remaining MVP-hardening surface is **~3.5–4.5 engineer-weeks**.

---

## 3. Feature Completion Detail

> Scope below = every feature classified **Partially Implemented**, **Not Implemented**, or **Unable to Verify**. Implemented features are intentionally excluded (per the evidence review).

### 3.1 Core Business Flows — Lists

#### LIST-007 — View owned list detail
- **Current status:** 🟡 Partially Implemented
- **Missing implementation:** Large-list virtualization / bounded-DOM responsive handling described in the approved stories.
- **Why missing:** Detail API + page render exist (`GET /api/v1/lists/{id}`, `/lists/[id]/page.tsx`), but no virtualization/large-list component was found.
- **Backend:** None (API sufficient; ensure pagination params are honored if list-items endpoint is paginated).
- **Frontend:** Add windowed/virtualized rendering for list items; bounded DOM for very large lists.
- **Database:** None.
- **API:** None (optionally consume `limit`/`offset` for list items).
- **Test impact:** Extend `responsive-layout.spec.ts` large-list cases; perf assertion on DOM node count.
- **Dependencies:** Shares the pagination/windowing primitive with PLACE-001/007.
- **Effort:** **M** · **Risk:** Medium (UX/perf degradation on large lists) · **Sprint:** 1

#### LIST-008 — Search and add existing place
- **Current status:** 🟡 Partially Implemented
- **Missing implementation:** No "search-to-create" continuity — the failed-search term is not carried into the create-place flow.
- **Why missing:** `AddPlaceDialog` searches + adds; no-result links to `/places/new` without prefilling the query.
- **Backend:** None.
- **Frontend:** Pass the active query into the create-place navigation (prefill name field) from the no-result state.
- **Database:** None.
- **API:** None.
- **Test impact:** E2E: no-result → create dialog prefilled with query.
- **Dependencies:** None.
- **Effort:** **S** · **Risk:** Low/Medium · **Sprint:** 1

#### LIST-010 — Remove place from owned list
- **Current status:** 🟡 Partially Implemented
- **Missing implementation:** Undo/restore-after-removal (undo window + restore) from the approved stories.
- **Why missing:** Permanent delete exists (`DELETE /.../items/{place_id}`); no undo state/toast or restore action found.
- **Backend:** None (restore reuses existing `POST /lists/{id}/items`, which is idempotent).
- **Frontend:** Undo toast with timed window; on undo, re-add via existing items endpoint; manage optimistic state.
- **Database:** None.
- **API:** None.
- **Test impact:** E2E: remove → undo restores item; undo expiry finalizes removal.
- **Dependencies:** Shared toast/undo primitive (reusable by future destructive actions).
- **Effort:** **M** · **Risk:** Medium (destructive-action recovery) · **Sprint:** 1

### 3.2 Core Business Flows — Places

#### PLACE-001 — View places list
- **Current status:** 🟡 Partially Implemented
- **Missing implementation:** UI pagination / infinite scroll / next-page loading (backend already supports `limit`/`offset`).
- **Why missing:** No paging controls or continuous-scroll component in the places page path.
- **Backend:** None.
- **Frontend:** Shared pagination/infinite-scroll component consuming `limit`/`offset` + `meta.total`.
- **Database:** None.
- **API:** None (note: default `limit` corrected under OPS-002).
- **Test impact:** E2E: load-more / scroll loads next page; end-of-list state.
- **Dependencies:** Same primitive as PLACE-007 and LIST-007.
- **Effort:** **M** (shared) · **Risk:** Medium · **Sprint:** 1

#### PLACE-007 — Highest average rating first, unrated last
- **Current status:** 🟡 Partially Implemented
- **Missing implementation:** Sorted **paging/continuous** behavior on the UI (sort itself is correct in SQL).
- **Why missing:** Backend ordering `avg(rating) desc nulls_last` exists; UI continuous browsing absent.
- **Backend:** None.
- **Frontend:** Same pagination component as PLACE-001, preserving `sort=rating_desc` across pages.
- **Database:** None.
- **API:** None.
- **Test impact:** E2E: paging maintains sort order; unrated remain last across pages.
- **Dependencies:** **Folds into PLACE-001** (one implementation).
- **Effort:** **S** (incremental on PLACE-001) · **Risk:** Medium · **Sprint:** 1

### 3.3 Core Business Flows — Ratings

#### RATING-005 — Tried derived from rating row
- **Current status:** 🟡 Partially Implemented
- **Missing implementation:** Live cross-tab synchronization of derived `tried`/rating state.
- **Why missing:** Derived state is correct on API refresh; no rating-specific cross-tab event/subscription found (a `BroadcastChannel` exists only for auth).
- **Backend:** None.
- **Frontend:** Broadcast rating create/update across tabs (reuse the `BroadcastChannel` pattern) and revalidate affected views.
- **Database:** None.
- **API:** None.
- **Test impact:** Multi-tab E2E: rating in tab A updates tried/rating context in tab B.
- **Dependencies:** Reuses existing cross-tab infrastructure in `frontend/src/lib/api.ts`.
- **Effort:** **S** · **Risk:** Low/Medium · **Sprint:** 1

### 3.4 Operations & API Contract

> **De-scoping note (authoritative):** Per **EDR-006** and **EDR-008**, metric names/dimensions, alert sinks, monitoring/log sinks, backup evidence, restore validation, deployment markers, migration SLIs, and retention rules are **Operational Policy / Manual Verification / Traceability Verification — not product code** until production-infrastructure design defines them. The "missing" items below are therefore split into **(a) executable product behavior** (in scope for sprints) and **(b) policy/manual verification** (documented, not coded).

#### OPS-001 — `/api/v1` prefix & version handling
- **Current status:** 🟡 Partially Implemented
- **Missing implementation (executable):** Unsupported version path must return **HTTP 404, `error.code = NOT_FOUND`** using the EDR-001 envelope (EDR-007).
- **Why missing:** Versioned routing + client prefixing exist; unsupported version currently falls through framework 404, not the approved structured envelope.
- **Backend:** Add catch-all/unsupported-version handler returning EDR-001 envelope; reuse request-id.
- **Frontend:** None (client prefixing already compliant).
- **Database:** None.
- **API:** Unsupported-version 404 contract.
- **Test impact:** API test: `/api/v9/...` → 404 `NOT_FOUND` envelope.
- **Dependencies:** **EDR-001 envelope (OPS-003) should land first or together.**
- **Effort:** **S** · **Risk:** Medium · **Sprint:** 2

#### OPS-002 — `{data, meta}` collections & pagination
- **Current status:** 🟡 Partially Implemented
- **Missing implementation (executable):** Default `limit` must be **20** (currently 100); `limit > 100` must return **422 `VALIDATION_ERROR`** (EDR-001 envelope), **not silently clamped** (EDR-003).
- **Why missing:** Envelope shape exists; endpoint defaults and invalid-pagination error shape diverge from EDR-003.
- **Backend:** Change default `limit` to 20 on places/lists/public endpoints; enforce max 100 with 422 + error envelope; keep `meta` to exactly `{limit, offset, total, sort}`.
- **Frontend:** Confirm UI tolerates `limit=20` default (ties to PLACE-001 paging); branch on `error.code` for validation.
- **Database:** None.
- **API:** Pagination defaults + validation contract.
- **Test impact:** API tests: default limit, over-max 422, no extra meta fields.
- **Dependencies:** EDR-001 envelope (OPS-003); pagination UI (PLACE-001).
- **Effort:** **M** · **Risk:** Medium/High (contract drift) · **Sprint:** 2

#### OPS-003 — Structured error contract (+ structured logging)
- **Current status:** 🟡 Partially Implemented
- **Missing implementation (executable):** Migrate from FastAPI `detail` to the approved **top-level `error` envelope** `{code, message, details?, requestId}` (EDR-001); `requestId` inside the body; **no SQL/stack/internal leakage** (security/privacy). JSON structured logging with EDR-004 required fields.
- **Missing implementation (policy/manual per EDR-006):** metrics, alert sinks, audit pipelines, log sinks — documented, not coded.
- **Why missing:** Helpers exist but use `detail` shape; `requestId` is header-only; no JSON logging found.
- **Backend:** Rewrite exception/validation handlers to emit EDR-001 envelope with `requestId`; UPPER_SNAKE_CASE codes; JSON logger emitting `timestamp, level, requestId, userId, path, method, status, durationMs, errorCode`.
- **Frontend:** **Breaking change** — update `frontend/src/lib/api.ts` to branch on `error.code` (not `error.message`, not `detail`).
- **Database:** None.
- **API:** All error responses conform to EDR-001.
- **Test impact:** API tests for every error path → envelope shape + code; negative test that no SQL/stack leaks.
- **Dependencies:** **Must ship with frontend parser update in the same release.** Gateway for OPS-001/002 error shapes.
- **Effort:** **M/L** · **Risk:** **High** (security/privacy + breaking) · **Sprint:** 2

#### OPS-004 — Backend liveness check
- **Current status:** 🟡 Partially Implemented
- **Missing implementation (executable):** Documented body fields (e.g., `environment`, `timestamp`, `requestId`) on `/health/live`. Per **EDR-005**, liveness stays DB-free and returns 200 — no degraded mode.
- **Backend:** Enrich liveness payload; keep no-dependency contract.
- **Frontend / DB / API:** None / None / liveness body shape.
- **Test impact:** Health test asserts fields + no DB dependency.
- **Dependencies:** Request-id middleware (EDR-004).
- **Effort:** **S** · **Risk:** Medium · **Sprint:** 4

#### OPS-005 — Backend readiness check
- **Current status:** 🟡 Partially Implemented
- **Missing implementation (executable):** Alembic revision / schema-compatibility gate; documented `checks.database.status` shape; 200 ready / 503 not-ready (EDR-005, no degraded mode); body `environment/timestamp/requestId`.
- **Missing (policy/manual per EDR-006/008):** timeout SLOs, metrics, alerts.
- **Backend:** Extend `/health/ready` to verify current Alembic head vs expected and report structured `checks`.
- **Frontend / DB / API:** None / None / readiness contract.
- **Test impact:** Readiness 200/503 + revision-mismatch → 503.
- **Dependencies:** Alembic migration mechanism (exists); OPS-007 readiness-gate overlap.
- **Effort:** **M** · **Risk:** **High** (traffic gate) · **Sprint:** 4

#### OPS-006 — Frontend health page/JSON
- **Current status:** 🟡 Partially Implemented
- **Missing implementation (executable):** Documented JSON fields (`timestamp`, `environment`) on `/api/health`; richer `/health` page status.
- **Missing (policy/manual):** deployment marker/version, latency evidence.
- **Frontend:** Extend `/api/health/route.ts` payload + `/health` page.
- **Backend / DB / API:** None / None / frontend health JSON shape.
- **Test impact:** `health.spec.ts` field assertions.
- **Dependencies:** None.
- **Effort:** **S** · **Risk:** Medium · **Sprint:** 4

#### OPS-007 — Alembic schema evolution
- **Current status:** 🟡 Partially Implemented
- **Missing implementation (executable):** Readiness revision gate (shared with OPS-005).
- **Missing (policy/manual per EDR-008):** backup/restore evidence, migration timeout policy, SLI metrics, rollback/forward-fix workflow, release gates, retention — **documentation/operational policy, not product code.**
- **Backend:** Only the readiness revision gate (folds into OPS-005).
- **Frontend / DB:** None / migrations already present and model-imported.
- **API:** None.
- **Test impact:** Covered by OPS-005 readiness tests; remainder = manual/traceability verification.
- **Dependencies:** OPS-005.
- **Effort:** **S** (code) + policy docs · **Risk:** High (production migration safety, largely policy) · **Sprint:** 4

### 3.5 Accessibility

#### A11Y-002 — Keyboard-operable rating control
- **Current status:** 🟡 Partially Implemented
- **Missing implementation:** Exact screen-reader announcement **`Rating, X.X out of 10`** (EDR-002); slider semantics with `Tab/Shift+Tab/Arrow/Home/End`; fix corrupted Arabic/star glyphs.
- **Why missing:** `input type=range` (min 1, max 10, step 0.5) exists but `aria-valuetext`/label do not match the EDR-002 contract; glyph corruption risk.
- **Backend / DB / API:** None.
- **Frontend:** Set `aria-valuetext` to the exact string; verify role=slider semantics; repair glyphs in `RatingControl.tsx`.
- **Test impact:** A11Y-002 assertions on `aria-valuetext`; keyboard step test.
- **Dependencies:** None.
- **Effort:** **S** · **Risk:** **High** (accessibility contract not met) · **Sprint:** 3

#### A11Y-001 — Focus trap and restoration
- **Current status:** 🟡 Partially Implemented
- **Missing implementation:** Reliable, non-corrupted default Arabic accessible names/labels/messages in `Dialog.tsx` (focus mechanics already implemented).
- **Why missing:** Default labels/messages appear corrupted in source output, harming accessible names.
- **Backend / DB / API:** None.
- **Frontend:** Repair default dialog labels/close/status strings; verify focus trap + restoration end-to-end.
- **Test impact:** A11Y dialog tests for accessible name + focus return.
- **Dependencies:** None.
- **Effort:** **S** · **Risk:** Medium/High · **Sprint:** 3

### 3.6 Responsive

#### RESP-003 — 200% zoom / adaptive pressure
- **Current status:** 🟡 Partially Implemented (**Manual Review Required** per evidence review)
- **Missing implementation:** Not a code gap per se — static evidence cannot prove 200% zoom behavior; needs runtime verification across documented screens.
- **Backend / DB / API:** None.
- **Frontend:** Only fixes that runtime verification surfaces (clipping/overlap/overflow).
- **Test impact:** Existing `responsive-layout.spec.ts` covers zoom/large-text/forced-colors — execute and confirm green; add any uncovered screens.
- **Dependencies:** Browser/runtime test execution.
- **Effort:** **S** (verification-led) · **Risk:** Medium · **Sprint:** 3 (verification track)

### 3.7 QA Coverage (Unable to Verify)

#### QA-001 / QA-002 / QA-003 / QA-004
- **Current status:** ⚪ Unable to Verify (the coverage audit excluded test files as evidence; tests **do** exist per `FEATURE_TRACEABILITY.md`).
- **Missing implementation:** Verification only — confirm the existing automated suites (`backend/tests/*`, `frontend/tests/e2e/*`) actually map to QA-001..004 and run green in CI.
- **Backend / Frontend / DB / API:** None (no product code).
- **Test impact:** Run suites; map results to `QA_AUTOMATION_CATALOG.md` / `QA_COVERAGE_MATRIX.md`; close any real coverage holes found.
- **Dependencies:** CI execution.
- **Effort:** **S** each (verification) · **Risk:** Medium · **Sprint:** cross-cutting (exit criteria of each sprint)

### 3.8 Admin & Moderation (Not Implemented)

> Entire module absent: no `frontend/app/admin`, no admin API router, no roles/permissions model, no audit model/service, no router registration.

#### ADMIN-001 — Admin access control & audit foundation
- **Current status:** ❌ Not Implemented
- **Missing implementation:** Admin authz (role/permission), admin router registration, audit-log foundation.
- **Backend:** Role/permission enforcement dependency; admin router; audit-log service.
- **Frontend:** `/admin` shell gated by role.
- **Database:** Admin role/flag on `users`; `audit_log` table.
- **API:** Admin-guarded base + audit write path.
- **Test impact:** Authz tests (non-admin denied), audit-write tests.
- **Dependencies:** **Foundation for ADMIN-002..007.**
- **Effort:** **L** · **Risk:** **Critical** · **Sprint:** 5 (Phase 5a)

#### ADMIN-002 — User lookup & account status review
- ❌ Not Implemented · **Backend:** user lookup/status endpoints + service · **Frontend:** admin user search/status UI · **DB:** account status field(s) · **API:** admin user endpoints · **Tests:** lookup/status authz + behavior · **Deps:** ADMIN-001 · **Effort:** M · **Risk:** Critical · **Sprint:** 5 (5b)

#### ADMIN-003 — Public list moderation
- ❌ Not Implemented · **Backend:** moderation (hide/restore) endpoints + audit · **Frontend:** moderation UI · **DB:** moderation status on `lists` · **API:** admin list-moderation endpoints · **Tests:** moderation + audit · **Deps:** ADMIN-001 · **Effort:** M · **Risk:** Critical · **Sprint:** 5 (5b)

#### ADMIN-004 — Place moderation & correction
- ❌ Not Implemented · **Backend:** place edit/correction endpoint (`PATCH /places/{id}`) + audit · **Frontend:** admin place-correction UI · **DB:** none beyond audit · **API:** admin place-moderation/correction · **Tests:** correction + audit · **Deps:** ADMIN-001; **shares PATCH with ROAD-002** · **Effort:** M · **Risk:** Critical · **Sprint:** 5 (5b)

#### ADMIN-005 — Duplicate place resolution
- ❌ Not Implemented · **Backend:** duplicate detection + **merge** workflow (re-point `list_items`/`ratings`, preserve aggregates) · **Frontend:** duplicate queue/merge UI · **DB:** merge-safe FK handling · **API:** admin merge endpoint · **Tests:** merge integrity (no orphan ratings/items) · **Deps:** ADMIN-001 · **Effort:** **L** (data-integrity heavy) · **Risk:** Critical · **Sprint:** 5 (5b)

#### ADMIN-006 — Abuse & content review queue
- ❌ Not Implemented · **Backend:** report intake + review-queue service + audit · **Frontend:** report action + admin review queue UI · **DB:** `abuse_reports` table · **API:** report + queue endpoints · **Tests:** intake/queue/resolve + authz · **Deps:** ADMIN-001 · **Effort:** M · **Risk:** Critical · **Sprint:** 5 (5b)

#### ADMIN-007 — Beta operational dashboard
- ❌ Not Implemented · **Backend:** operational summary endpoint (counts/health rollup) · **Frontend:** admin dashboard · **DB:** none (read aggregates) · **API:** admin dashboard summary · **Tests:** summary authz/shape · **Deps:** ADMIN-001 (and useful after OPS readiness work) · **Effort:** M · **Risk:** Critical · **Sprint:** 5 (5b)

### 3.9 Future Roadmap (Not Implemented)

#### ROAD-002 — User-facing place editing
- ❌ Not Implemented · **Backend:** `PATCH /api/v1/places/{id}` + service (re-validate normalized-name uniqueness) · **Frontend:** edit-place dialog/page · **DB:** none · **API:** place update · **Tests:** edit + duplicate-name conflict · **Deps:** **Shares endpoint with ADMIN-004 — build once** · **Effort:** M · **Risk:** Medium · **Sprint:** 6

#### ROAD-001 — Guest public-list browsing
- ❌ Not Implemented · **Status decision: DEFERRED.** Public endpoints intentionally remain auth-gated during controlled beta (prior product decision: login-only). Documented as a **pre-public-beta** requirement, not built now.
- **If un-deferred:** **Backend:** relax `CurrentUser` to optional on public endpoints + rate-limit anonymous · **Frontend:** guest routes/session-optional pages · **Effort:** M · **Risk:** Low (MVP) / High (if it becomes release scope) · **Sprint:** 6+ (deferred)

---

## 4. Sprint Roadmap

Every sprint is **independently releasable** and carries its own objective, effort, risks, and dependencies. A **QA & Verification track** (QA-001..004, RESP-003) runs as **exit criteria within each sprint**, not as a separate release.

### Sprint 1 — Core User-Facing MVP Completion
- **Objective:** Close all documented user-facing gaps in Places/Lists/Ratings so the core product matches the approved stories.
- **Scope:** PLACE-001 + PLACE-007 (shared pagination/infinite scroll), LIST-007 (virtualization, shared primitive), LIST-008 (search→create prefill), LIST-010 (undo remove), RATING-005 (cross-tab sync).
- **Effort:** ~1×M(shared paging/windowing) + 1×M(undo) + 2×S + 1×S ≈ **1.5–2 weeks**.
- **Risks:** Pagination/virtualization regressions on RTL/long-name layouts; undo state races. Mitigate via `responsive-layout` E2E + multi-tab E2E.
- **Dependencies:** None external. Pagination default interacts with OPS-002 (ship UI tolerant of `limit=20`).
- **Releasable as:** Frontend-led release (minimal/no backend change).

### Sprint 2 — API Contract, Error Envelope & Privacy Hardening
- **Objective:** Bring all API responses into conformance with EDR-001/003/004/007; eliminate internal-detail leakage.
- **Scope:** OPS-003 (EDR-001 error envelope + EDR-004 JSON logging) **with** frontend `error.code` parser update; OPS-002 (default limit 20, max-100 → 422); OPS-001 (unsupported version → 404 `NOT_FOUND`).
- **Effort:** ~1×M/L + 1×M + 1×S ≈ **1–1.5 weeks**.
- **Risks:** **High & breaking** — error shape change must land backend+frontend together or it breaks error handling. No SQL/stack leakage (security). Coordinated deploy required.
- **Dependencies:** Frontend and backend release atomically; OPS-001/002 reuse the OPS-003 envelope.
- **Releasable as:** Coordinated backend+frontend release.

### Sprint 3 — Accessibility Compliance + Responsive Verification
- **Objective:** Meet EDR-002 rating contract and dialog accessible-name quality; confirm responsive/zoom behavior.
- **Scope:** A11Y-002 (exact `Rating, X.X out of 10`, slider keyboard, glyph repair), A11Y-001 (dialog label repair + focus-trap verification), RESP-003 (runtime 200%-zoom verification + any fixes).
- **Effort:** 2×S + verification ≈ **0.5–1 week**.
- **Risks:** High user-impact if shipped wrong; mitigate with screen-reader + keyboard E2E.
- **Dependencies:** None.
- **Releasable as:** Frontend-only release.
- **Note:** Both A11Y items are **High risk / low effort** — see §7 recommendation to optionally pull A11Y-002 into Sprint 1.

### Sprint 4 — Operational Readiness & Observability
- **Objective:** Make the service safe to gate production traffic; conform health contracts (EDR-005); document operational policy (EDR-006/008).
- **Scope:** OPS-005 (readiness Alembic-revision/schema gate, `checks.database.status`, 200/503), OPS-007 (readiness revision gate — code; backup/restore/SLI/retention = **policy docs only**), OPS-004 (liveness body fields, no DB), OPS-006 (frontend health JSON fields).
- **Effort:** ~1×M + 3×S + policy docs ≈ **1 week**.
- **Risks:** High (traffic gate correctness). Much of OPS-007 is intentionally **policy/manual** per EDR-008 — do **not** invent infra in code.
- **Dependencies:** EDR-004 request-id (Sprint 2 ideally first for body `requestId`).
- **Releasable as:** Backend + ops-docs release.

### Sprint 5 — Admin & Moderation Module
- **Objective:** Provide beta operational moderation, user management, and oversight behind admin authz.
- **Phase 5a (foundation):** ADMIN-001 (authz + admin router + audit-log foundation, role/flag, `audit_log` table).
- **Phase 5b (capabilities):** ADMIN-002, ADMIN-003, ADMIN-004, ADMIN-005, ADMIN-006, ADMIN-007.
- **Effort:** 2×L + 5×M ≈ **3.5–5 weeks** (the dominant cost; can be split into two releases at the 5a/5b boundary).
- **Risks:** **Critical & broad** — new privilege boundary (authz mistakes are security-critical); ADMIN-005 merge has data-integrity risk (orphaned ratings/list-items). Strong authz tests + merge-integrity tests required.
- **Dependencies:** ADMIN-001 gates everything; ADMIN-004 shares `PATCH /places/{id}` with ROAD-002; ADMIN-007 benefits from Sprint 4 readiness.
- **Releasable as:** 5a (gated empty admin shell + authz + audit) is independently releasable; 5b adds capabilities incrementally.

### Sprint 6 — Future Roadmap
- **Objective:** Post-MVP catalog correction; revisit anonymous access if product decides.
- **Scope:** ROAD-002 (user place editing via shared `PATCH /places/{id}`). ROAD-001 (guest browsing) **remains deferred** pending product decision.
- **Effort:** ~1×M ≈ **0.5–1 week** (ROAD-002 cheap if ADMIN-004 already shipped the endpoint).
- **Risks:** Medium (edit re-validation of unique normalized name). ROAD-001 if un-deferred is a larger anonymous-access/security change.
- **Dependencies:** ADMIN-004 (shared endpoint).
- **Releasable as:** Incremental feature release.

---

## 5. Recommended First Sprint

**Sprint 1 — Core User-Facing MVP Completion.**

Rationale (matches the mandated prioritization: *critical user-facing MVP first*): these six items complete the documented core experience (Places/Lists/Ratings), are predominantly frontend with little/no backend risk, and are **independently releasable without coordinated deploys**. They deliver immediate, visible product value and de-risk the remaining roadmap by establishing the shared pagination/virtualization and undo primitives reused later.

**Principal recommendation / exception:** **A11Y-002** (rating announcement) and **OPS-003** (error envelope + no-leakage) are the two **High-risk** items with outsized impact. If the program prefers a single hardening release, pull **A11Y-002** (S, frontend-only, no coupling) into Sprint 1. Keep **OPS-003** in Sprint 2 because it is breaking and requires a coordinated backend+frontend deploy.

---

## 6. Highest-Risk Features

| Rank | Feature | Status | Risk | Why |
|---|---|---|---|---|
| 1 | **ADMIN-001..007** | ❌ Not Implemented | **Critical** | Entire moderation/oversight + new privilege boundary absent; blocks controlled-beta operations; ADMIN-005 carries data-merge integrity risk. |
| 2 | **OPS-003** Structured error contract | 🟡 Partial | **High** | Security/privacy (SQL/stack leakage), observability gap, and breaking client change. |
| 3 | **OPS-005** Readiness check | 🟡 Partial | **High** | Traffic-gating without a real schema/migration readiness gate risks serving against an incompatible DB. |
| 4 | **A11Y-002** Rating control | 🟡 Partial | **High** | Approved accessibility contract (EDR-002) unmet; excludes assistive-tech users. |
| 5 | **OPS-007** Migration safety | 🟡 Partial | High | Production migration safety — though largely **policy/manual** per EDR-008; the executable piece overlaps OPS-005. |
| 6 | **OPS-002** Pagination contract | 🟡 Partial | Med/High | API contract drift (default limit, invalid-page error shape). |
| 7 | **A11Y-001** Dialog labels | 🟡 Partial | Med/High | Corrupted default accessible names impair AT users. |

---

## 7. Suggested Implementation Order

Ordered to honor the mandated prioritization (user-facing MVP → security/privacy → core flows → operations → accessibility → responsive → admin → future), tuned for risk and dependencies:

1. **Sprint 1** — PLACE-001 → PLACE-007 → LIST-007 (shared paging/windowing) → LIST-008 → LIST-010 → RATING-005. *(+ optionally A11Y-002 pulled forward.)*
2. **Sprint 2** — OPS-003 (envelope + logging + frontend `error.code`) → OPS-002 (pagination defaults/422) → OPS-001 (version 404). *(Security/privacy + contract.)*
3. **Sprint 3** — A11Y-002 → A11Y-001 → RESP-003 verification.
4. **Sprint 4** — OPS-005 (readiness gate) → OPS-007 (revision gate code + policy docs) → OPS-004 (liveness) → OPS-006 (frontend health).
5. **Sprint 5** — ADMIN-001 (5a foundation) → ADMIN-002 → ADMIN-003 → ADMIN-004 → ADMIN-006 → ADMIN-007 → ADMIN-005 (last; highest data-integrity risk, build on a stable admin base).
6. **Sprint 6** — ROAD-002 (reusing ADMIN-004's `PATCH /places/{id}`). ROAD-001 deferred.

**Cross-cutting (every sprint):** execute and map QA-001..004 to the existing automated suites; keep CI green; treat as sprint exit criteria.

---

## 8. Estimated Remaining Effort (Summary)

| Sprint | Theme | Effort |
|---|---|---|
| 1 | Core user-facing completion | ~1.5–2 wks |
| 2 | API contract & privacy hardening | ~1–1.5 wks |
| 3 | Accessibility + responsive verify | ~0.5–1 wk |
| 4 | Operational readiness | ~1 wk |
| 5 | Admin & moderation | ~3.5–5 wks |
| 6 | Future roadmap (ROAD-002) | ~0.5–1 wk |
| **Total** | | **~8–11.5 engineer-weeks** |

Excluding Admin (Sprint 5) and deferred roadmap: **~3.5–4.5 engineer-weeks** to a hardened MVP-beta posture.

---

## 9. Ready for Implementation

**YES — ready for implementation planning sign-off.**

- Source of Truth verified at `main` @ `2ff78518cc875dc91c391d546c2021f7a30c78d3`; working tree clean.
- All 29 open features (16 partial + 9 not-implemented + 4 unable-to-verify) are scoped with status, missing behavior, layer-by-layer work, dependencies, effort, risk, and sprint.
- Sprints are independently releasable with explicit objectives, risks, and dependencies.

**Gating recommendations before declaring production-ready (not just plan-ready):**
1. Close **OPS-003** + **OPS-005** + **A11Y-002** (High-risk, mostly small) — Sprints 2–4.
2. Make a formal **Admin scope decision** (full Sprint 5 vs. minimal 5a for controlled beta).
3. Confirm **ROAD-001** stays deferred for the beta window.
4. Honor **EDR-006/EDR-008**: do not implement monitoring/backup/deploy/SLI surfaces in product code — track them as operational policy/manual verification.

> **Constraints honored:** No code written. No existing documentation modified. No RTM or User Story changes. No refactoring. This file is the only new artifact (planning deliverable).
