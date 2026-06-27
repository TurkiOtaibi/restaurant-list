# Developer / QA Smoke Suite

## Purpose

This smoke suite defines the minimum release-blocking checks for fast confidence. It references existing feature-owned test cases and approved automation evidence. It does not create new QA-owned product behavior.

## Smoke Execution Rules

- Local/test environments may use deterministic fixtures.
- Beta/production smoke is read-only unless explicit mutation approval exists.
- If beta/production mutation approval is absent, create/update/delete checks must be replaced by read-only health, auth-safe, and public-safe verification.
- Evidence must include commit SHA, branch, environment, check status, run timestamp, and approver/release owner where applicable.

## Minimum Smoke Checks

| Smoke ID | Scope | Owning Coverage | Existing Test-Case References | Automated Evidence | Required Outcome | QA Suite Mapping |
|---|---|---|---|---|---|---|
| SMOKE-001 | App starts | Frontend app shell and health | `OPS-006_TEST_CASES.md`; `AUTH-001_TEST_CASES.md` | `frontend/tests/e2e/health.spec.ts`; `frontend/tests/e2e/sprint3-real.spec.ts` | Frontend shell loads; `/health` and `/api/health` checks pass according to OPS-006 ownership. | QA-004 |
| SMOKE-002 | Auth lifecycle smoke | Registration/login/session/logout smoke | `AUTH-002_TEST_CASES.md`; `AUTH-003_TEST_CASES.md`; `AUTH-004_TEST_CASES.md`; `AUTH-005_TEST_CASES.md`; `AUTH-006_TEST_CASES.md`; `AUTH-007_TEST_CASES.md` | `backend/tests/api/test_auth.py`; `frontend/tests/e2e/auth-gating.spec.ts`; `frontend/tests/e2e/sprint3-real.spec.ts` | Auth endpoints and protected access checks pass; no private-data flash on protected routes. | QA-001, QA-004 |
| SMOKE-003 | Places list smoke | Places browse/search baseline | `PLACE-001_TEST_CASES.md`; `PLACE-006_TEST_CASES.md`; `PLACE-007_TEST_CASES.md`; `OPS-002_TEST_CASES.md` | `backend/tests/api/test_places_and_lists.py`; `frontend/tests/e2e/sprint3-real.spec.ts` | Authenticated Places list loads through documented API/envelope behavior. | QA-002, QA-004 |
| SMOKE-004 | List creation smoke | Owned list create/read baseline | `LIST-001_TEST_CASES.md`; `LIST-003_TEST_CASES.md`; `LIST-007_TEST_CASES.md`; `LIST-011_TEST_CASES.md` | `backend/tests/api/test_places_and_lists.py`; `frontend/tests/e2e/sprint3-real.spec.ts` | In local/test or approved mutation environments, owner can create and view a list through existing list-owned coverage. | QA-002, QA-004 |
| SMOKE-005 | Rating smoke | Rating create/update and rating accessibility baseline | `RATING-001_TEST_CASES.md`; `RATING-002_TEST_CASES.md`; `RATING-003_TEST_CASES.md`; `RATING-009_TEST_CASES.md`; `A11Y-002_TEST_CASES.md` | `backend/tests/api/test_sprint2.py`; `frontend/tests/e2e/sprint3-real.spec.ts` | In local/test or approved mutation environments, rating flow passes documented owner package checks. | QA-003, QA-004 |
| SMOKE-006 | Profile smoke | Profile summary/archive baseline | `PROFILE-001_TEST_CASES.md`; `PROFILE-002_TEST_CASES.md`; `PROFILE-003_TEST_CASES.md`; `PROFILE-005_TEST_CASES.md` | `backend/tests/api/test_sprint2.py`; `frontend/tests/e2e/sprint3-real.spec.ts` | Authenticated Profile loads current-user data without exposing private data to other users. | QA-003, QA-004 |
| SMOKE-007 | Public list smoke | Authenticated public-list index/detail baseline | `PUBLIC-001_TEST_CASES.md`; `PUBLIC-002_TEST_CASES.md`; `PUBLIC-003_TEST_CASES.md`; `PUBLIC-004_TEST_CASES.md` | `backend/tests/api/test_sprint2.py`; `frontend/tests/e2e/sprint3-real.spec.ts` | Authenticated public list checks pass; guest/private-denial and owner-display privacy remain feature-owned. | QA-003, QA-004 |
| SMOKE-008 | Health/readiness smoke | Backend liveness/readiness and frontend health | `OPS-004_TEST_CASES.md`; `OPS-005_TEST_CASES.md`; `OPS-006_TEST_CASES.md` | `backend/tests/api/test_health.py`; `frontend/tests/e2e/health.spec.ts` | Liveness, readiness, and frontend health checks pass according to their OPS owner packages. | QA-004 |
| SMOKE-009 | Responsive/accessibility critical smoke | No-overflow, auth gating, dialog/rating keyboard accessibility | `RESP-001_TEST_CASES.md`; `RESP-002_TEST_CASES.md`; `RESP-003_TEST_CASES.md`; `RESP-004_TEST_CASES.md`; `A11Y-001_TEST_CASES.md`; `A11Y-002_TEST_CASES.md` | `frontend/tests/e2e/responsive-layout.spec.ts`; `frontend/tests/e2e/auth-gating.spec.ts` | Critical viewport, no-overflow, focus, dialog, and rating accessibility checks pass through owner packages. | QA-004 |

## Smoke Suite Validation

- Minimum release-blocking checks only: Pass.
- No duplicate feature ownership: Pass.
- No new QA test-case files: Pass.
- All smoke checks reference existing owning test-case packages: Pass.
- Live mutation safety rule included: Pass.

