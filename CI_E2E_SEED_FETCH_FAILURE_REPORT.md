# CI E2E Seed Fetch Failure Report

## 1. Executive Summary

Fixed the CI-only E2E release-gate failure on `main` for commit `eef2883036f8c6cb9c408fd0988c31159c2865ea` without changing product behavior.

The failure was in E2E infrastructure. The Places acceptance harness and the real sprint E2E suite had separate API server lifecycle patterns. In the full CI ordering, this made the API/session setup vulnerable to readiness and auth-refresh pressure. The original CI failure surfaced as a Node `fetch failed` while seeding Places data. Local full-suite reproduction further exposed the same harness area failing session restoration after enough `/auth/refresh` calls had accumulated against the E2E API rate limiter.

The fix centralizes the sprint E2E API lifecycle on the shared helper, makes API shutdown await process exit, resets the browser page before installing a fresh harness session, raises the auth rate-limit only for the E2E API process, and splits one UI polish test into independent mobile and desktop cases.

## 2. Failed CI Run

- GitHub Actions run: `28529152874`
- URL: https://github.com/TurkiOtaibi/restaurant-list/actions/runs/28529152874
- Failed job: `e2e`
- Failed job ID: `84573686390`
- Failed test: `tests/e2e/ui-polish-pr-findings.spec.ts:18`
- Original failure: `TypeError: fetch failed`
- Failure path: `frontend/tests/e2e/support/places-acceptance-harness.ts:387`
- Operation: `seedPlacesDataset` -> `createPlace` -> `apiRequest("/places", accessToken, { method: "POST" })`
- CI result: backend PASS, frontend PASS, e2e FAIL, overall failure

## 3. Root Cause Classification

Primary classification: `TEST_HARNESS_READINESS`

Supporting factors:

- The sprint real E2E file owned a separate FastAPI process while the Places acceptance harness owned another helper-based lifecycle.
- API process shutdown was not awaited, so a following test could observe readiness from a process in transition.
- The E2E API used production-like auth rate-limit defaults even though the full local/CI E2E suite intentionally performs many session restores from the same localhost client in one run.
- A UI polish test recycled authenticated fixture state mid-test while a rate dialog route was already mounted.

This was not a product defect and did not require changing application behavior.

## 4. Exact Failing URL / Operation

Original CI failing operation:

- URL: `http://localhost:8000/api/v1/places`
- Method: `POST`
- Caller: `apiRequest` in `frontend/tests/e2e/support/places-acceptance-harness.ts`
- Higher-level operation: `seedPlacesDataset`

Local full-suite reproduction after improving lifecycle diagnostics also failed in the same harness file when loading:

- URL: `/places/{placeId}/rate`
- Browser session recovery operation: `POST http://localhost:8000/api/v1/auth/refresh`
- Observed UI state: `تعذر استعادة الجلسة. حاول مرة أخرى.`

## 5. Why It Passed Locally But Failed in CI

The failing test passed when run alone and also passed in shorter focused subsets. It failed under full-suite ordering where the same worker had already run Places harness tests, responsive tests, and sprint real tests.

CI made the issue visible because startup/shutdown timing and the number of auth refreshes in a single run were tighter and more deterministic. Local reproduction confirmed the issue by running the relevant preceding files before `ui-polish-pr-findings.spec.ts`.

## 6. Files Changed

- `backend/scripts/start_e2e_api.py`
- `frontend/tests/e2e/support/e2e-api-server.ts`
- `frontend/tests/e2e/support/places-acceptance-harness.ts`
- `frontend/tests/e2e/sprint3-real.spec.ts`
- `frontend/tests/e2e/ui-polish-pr-findings.spec.ts`
- `CI_E2E_SEED_FETCH_FAILURE_REPORT.md`

## 7. Fix Implemented

- Raised `AUTH_RATE_LIMIT_REQUESTS` to `200` only inside `backend/scripts/start_e2e_api.py`, the E2E-only API launcher.
- Reused the shared `ensureE2eApiServer` helper from `sprint3-real.spec.ts` instead of spawning a second API server implementation.
- Made `stopE2eApiServer` async and awaited process exit to avoid tests observing a soon-to-die API process as ready.
- Made readiness checks respect `E2E_API_BASE_URL` instead of hardcoding the health URL separately.
- Reset the page to `about:blank` before swapping harness cookies/session state to clear in-memory app auth state between deterministic fixtures.
- Improved API setup failure errors to include the exact URL when Node fetch cannot reach the API.
- Split the bottom-sheet/mobile and desktop modal checks into separate tests so each uses a clean fixture while preserving both assertions.

## 8. Why the Fix Is Low Risk

- Changes are limited to E2E support code, one E2E-only backend launcher, and the affected E2E test.
- No production API code changed.
- No product UI code changed.
- No remove-tried product logic changed.
- Auth rate-limit override applies only when launching the local E2E API through `backend/scripts/start_e2e_api.py`.
- Test assertions were preserved; coverage increased from 39 to 40 E2E tests because mobile and desktop assertions now run independently.

## 9. Why Product Behavior Did Not Change

The hotfix does not touch runtime frontend components, backend application services, database models, migrations, API contracts, user stories, RTM, or EDRs. It only changes the test runner support path used by Playwright and local/CI E2E execution.

## 10. Quality Gate Results

Focused:

- `npx playwright test tests/e2e/ui-polish-pr-findings.spec.ts`: PASS, 5 passed
- `npx playwright test tests/e2e/sprint3-real.spec.ts tests/e2e/ui-polish-pr-findings.spec.ts`: PASS, 8 passed
- Reproduction set with Places harness, responsive, sprint real, and UI polish specs: PASS after final fix through full-suite confirmation

Backend:

- `python -m pytest -q`: PASS, 54 passed, 1 skipped
- `python -m ruff check .`: PASS
- `python -m ruff format --check .`: PASS
- `python -m mypy app tests`: PASS

Frontend:

- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run build`: PASS
- `npm run test:e2e`: PASS, 40 passed

## 11. Remaining Risks

- The previous CI run had no downloadable artifacts through the GitHub Actions artifact API, so root-cause evidence is based on job logs plus local reproduction.
- GitHub Actions must still be rerun after this hotfix branch is merged or tested in CI.
- Deployment remains blocked until CI passes on `main` or the release branch per policy.

## 12. Release Recommendation

Approve this hotfix for merge/release-gate retry after CI validates it. Do not deploy until GitHub Actions backend, frontend, and e2e jobs all pass.

## Findings Table

| Area | Finding | Evidence | Fix | Risk |
|---|---|---|---|---|
| CI e2e seed | Original failure occurred in Places seed API request. | Run `28529152874`, job `84573686390`, `apiRequest` at harness line 387, `TypeError: fetch failed`. | Improved shared API lifecycle and failure diagnostics. | Low; E2E-only. |
| API lifecycle | `sprint3-real.spec.ts` spawned its own backend process separate from shared harness lifecycle. | File-level duplicate `spawn` and `waitForApi` implementation. | Replaced with shared `ensureE2eApiServer`. | Low; test infrastructure only. |
| API shutdown | API process kill was not awaited. | `stopE2eApiServer()` called `kill()` synchronously. | Made shutdown async and awaited exit. | Low; reduces race. |
| Auth refresh pressure | Full E2E suite uses many refreshes from localhost, exceeding product-like E2E defaults. | Local full-suite reproduction showed session recovery alert after preceding specs. | Raised auth rate limit only in `start_e2e_api.py`. | Low; not production config. |
| Fixture state | Harness reset changed cookies while app page could still hold in-memory auth state. | Local failure occurred after repeated fixture resets and rate route loads. | Navigate to `about:blank` before installing a new harness session. | Low; E2E-only state isolation. |
| UI polish test | One test combined mobile and desktop dialog modes with mid-test fixture recycling. | Failure consistently occurred in second dialog load under full ordering. | Split mobile and desktop assertions into separate tests. | Low; assertions preserved. |
