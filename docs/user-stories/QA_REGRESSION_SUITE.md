# Developer / QA Regression Suite

## Purpose

This regression suite groups existing feature-owned test-case packages into release regression areas. It does not rewrite the underlying test cases and does not create `QA-*_TEST_CASES.md` files.

## Regression Groups

### Authentication

| Scope | Feature-Owned Test-Case Files | Automated Evidence | QA Suite IDs | Notes |
|---|---|---|---|---|
| Entry, registration, login, refresh, logout, protected access, rate limiting, social-login exclusion | `AUTH-001_TEST_CASES.md`; `AUTH-002_TEST_CASES.md`; `AUTH-003_TEST_CASES.md`; `AUTH-004_TEST_CASES.md`; `AUTH-005_TEST_CASES.md`; `AUTH-006_TEST_CASES.md`; `AUTH-007_TEST_CASES.md`; `AUTH-008_TEST_CASES.md` | `backend/tests/api/test_auth.py`; `frontend/tests/e2e/auth-gating.spec.ts`; `frontend/tests/e2e/sprint3-real.spec.ts` | QA-001, QA-004 | Auth behavior remains AUTH-owned. |

### Places

| Scope | Feature-Owned Test-Case Files | Automated Evidence | QA Suite IDs | Notes |
|---|---|---|---|---|
| Browse, filter, search, sort, detail, create, taxonomy, duplicate rules, legacy routes, artwork, description metadata | `PLACE-001_TEST_CASES.md` through `PLACE-020_TEST_CASES.md` | `backend/tests/api/test_places_and_lists.py`; `backend/tests/integration/test_db_constraints.py`; `frontend/tests/e2e/sprint3-real.spec.ts`; `frontend/tests/e2e/responsive-layout.spec.ts` | QA-002, QA-004 | Places behavior remains PLACE-owned. |

### Lists

| Scope | Feature-Owned Test-Case Files | Automated Evidence | QA Suite IDs | Notes |
|---|---|---|---|---|
| Owned list index, summary, create, edit, visibility, delete, detail, add/remove place, duplicate membership, duplicate list names | `LIST-001_TEST_CASES.md` through `LIST-011_TEST_CASES.md` | `backend/tests/api/test_places_and_lists.py`; `frontend/tests/e2e/sprint3-real.spec.ts` | QA-002, QA-004 | Lists behavior remains LIST-owned. |

### Ratings

| Scope | Feature-Owned Test-Case Files | Automated Evidence | QA Suite IDs | Notes |
|---|---|---|---|---|
| Create/update, half-step validation, private notes, tried derivation, list cleanup, re-add, aggregates, upsert | `RATING-001_TEST_CASES.md` through `RATING-009_TEST_CASES.md`; `A11Y-002_TEST_CASES.md` for keyboard rating accessibility | `backend/tests/api/test_sprint2.py`; `backend/tests/integration/test_db_constraints.py`; `frontend/tests/e2e/sprint3-real.spec.ts` | QA-003, QA-004 | Ratings behavior remains RATING-owned; accessibility remains A11Y-owned. |

### Profile

| Scope | Feature-Owned Test-Case Files | Automated Evidence | QA Suite IDs | Notes |
|---|---|---|---|---|
| Summary, rating archive, private notes, own public-list summary, deprecated triedPlaces absence | `PROFILE-001_TEST_CASES.md` through `PROFILE-005_TEST_CASES.md` | `backend/tests/api/test_sprint2.py`; `frontend/tests/e2e/responsive-layout.spec.ts`; `frontend/tests/e2e/sprint3-real.spec.ts` | QA-003, QA-004 | Profile behavior remains PROFILE-owned. |

### Public Lists

| Scope | Feature-Owned Test-Case Files | Automated Evidence | QA Suite IDs | Notes |
|---|---|---|---|---|
| Authenticated public index, read-only detail, private denial, safe owner display | `PUBLIC-001_TEST_CASES.md` through `PUBLIC-004_TEST_CASES.md` | `backend/tests/api/test_sprint2.py`; `frontend/tests/e2e/sprint3-real.spec.ts` | QA-003, QA-004 | Public-list behavior remains PUBLIC-owned. |

### Admin

| Scope | Feature-Owned Test-Case Files | Automated Evidence | QA Suite IDs | Notes |
|---|---|---|---|---|
| Admin foundation, user/list/place/review/dashboard concepts | `ADMIN-001_TEST_CASES.md` through `ADMIN-007_TEST_CASES.md` | No admin route/API automated evidence is documented in `FEATURE_CATALOG.md`; Admin is marked `Missing`/future roadmap. | QA-004 when admin scope is explicitly activated | Do not run as release-blocking product regression until Admin scope is approved and implementation evidence exists. |

### System Operations

| Scope | Feature-Owned Test-Case Files | Automated Evidence | QA Suite IDs | Notes |
|---|---|---|---|---|
| API versioning, collection envelope, structured errors, liveness, readiness, frontend health, migrations | `OPS-001_TEST_CASES.md` through `OPS-007_TEST_CASES.md` | `backend/tests/api/test_health.py`; `frontend/tests/e2e/health.spec.ts`; backend/frontend CI gates documented in `SYSTEM_OPERATIONS_USER_STORIES.md` | QA-004; QA-002 for envelope; QA-001/QA-003 where safe errors/redaction apply | OPS behavior remains OPS-owned. |

### Responsive

| Scope | Feature-Owned Test-Case Files | Automated Evidence | QA Suite IDs | Notes |
|---|---|---|---|---|
| RTL nav, safe areas, 200% zoom/adaptive behavior, numerals | `RESP-001_TEST_CASES.md`; `RESP-002_TEST_CASES.md`; `RESP-003_TEST_CASES.md`; `RESP-004_TEST_CASES.md` | `frontend/tests/e2e/responsive-layout.spec.ts` | QA-004 | Responsive behavior remains RESP-owned. |

### Accessibility

| Scope | Feature-Owned Test-Case Files | Automated Evidence | QA Suite IDs | Notes |
|---|---|---|---|---|
| Dialog/sheet focus behavior and keyboard-operable rating control | `A11Y-001_TEST_CASES.md`; `A11Y-002_TEST_CASES.md` | `frontend/tests/e2e/responsive-layout.spec.ts`; `frontend/tests/e2e/sprint3-real.spec.ts` where applicable | QA-004; QA-003 for rating accessibility relation | Accessibility behavior remains A11Y-owned. |

## Release Regression Policy

| Policy ID | Requirement | Source Mapping |
|---|---|---|
| REG-POL-001 | Required release gates include backend `ruff`, `mypy`, `pytest`; frontend `lint`, `typecheck`, `build`; required Playwright suite; migration validation; operational smoke. | `QA-004-US-001`; `SYSTEM_OPERATIONS_USER_STORIES.md` Release Gates. |
| REG-POL-002 | Critical auth/list/place/rating/profile/public-list flows must use real API behavior where required by the release gate. | `QA-004-US-006`. |
| REG-POL-003 | Beta/production verification must not create persistent test users, lists, places, ratings, or list items unless explicitly approved. | `SYSTEM_OPERATIONS_USER_STORIES.md` Shared Operational Requirements; `QA-004-US-014`; `QA-004-US-015`. |
| REG-POL-004 | Required flaky tests are not silently ignored; owner, evidence, retry policy, and fix/waiver decision must be documented. | `QA-004-US-016`. |
| REG-POL-005 | Release evidence must retain commit SHA, branch, check statuses, migration result, health result, smoke result, and approver/release owner. | `QA-004-US-017`. |

## Validation

- Regression suite references existing feature-owned packages: Pass.
- No duplicate QA ownership: Pass.
- Admin status preserved as documented missing/future scope: Pass.
- No invented automated test files: Pass.
- No generated `QA-*_TEST_CASES.md` files: Pass.

