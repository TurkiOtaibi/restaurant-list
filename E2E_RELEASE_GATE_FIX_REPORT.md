# E2E Release Gate Fix Report

## Root Cause

The failing release gate was caused by QA E2E harness/test structure, not by application business logic.

The original `places-acceptance-harness.spec.ts` executed fixture seeding plus five independent Places UI state loads inside one 60 second Playwright test:

- Places list
- Filter state
- Place detail
- Create place dialog
- Rating dialog
- Add-to-list dialog

The harness also performed an automatic `resetFeature("PLACE-HARNESS")` before the test explicitly called `resetFeature("PLACE-001")`, duplicating deterministic user/data setup.

This made the scenario vulnerable to release-gate timeout during normal Next.js dev-server page compilation and repeated document navigations.

## Evidence

Observed failure before the fix:

```text
tests/e2e/places-acceptance-harness.spec.ts
Test timeout of 60000ms exceeded.
page.goto: net::ERR_ABORTED; maybe frame was detached?
```

Trace evidence showed:

- The previous state was still on `/places/new?...` with `create-place-dialog` open.
- The next document navigation to `/places/{id}/rate` started but did not complete before the test timeout.
- Authentication refresh requests succeeded with HTTP 200.
- No application API error, redirect-to-login failure, fixture cleanup, or missing place data was observed.

After removing duplicate fixture setup but before splitting the scenario, repeated execution still showed the first run near the 60 second test timeout. This confirmed the root cause was a long composite E2E scenario and harness sequencing, not a proven product defect.

## Files Modified

- `frontend/tests/e2e/support/places-acceptance-harness.ts`
- `frontend/tests/e2e/places-acceptance-harness.spec.ts`

## Fix Applied

1. Removed the automatic unused `resetFeature("PLACE-HARNESS")` from the fixture.
2. Added `gotoFeatureState()` in the harness to use `waitUntil: "domcontentloaded"` and rely on the existing deterministic UI assertions for readiness.
3. Split the long composite scenario into three focused E2E tests:
   - list and filter state loading
   - detail and create state loading
   - rating and add-to-list state loading

No application code or business logic was changed.

## Why the Fix Is Correct

The acceptance harness is intended to load feature states directly and deterministically. Each state has its own measurable assertion after navigation, so waiting for browser `load` on every Next.js page was unnecessary and slower than the actual readiness condition.

Splitting independent state checks avoids one test timing out because unrelated state loads share the same 60 second budget. The assertions were preserved; no coverage was removed or weakened.

## Quality Gate Results

| Gate | Result | Evidence |
|---|---|---|
| Failing E2E repeated | PASS | `npx playwright test tests/e2e/places-acceptance-harness.spec.ts --workers=1 --reporter=list --repeat-each=3` -> `9 passed` |
| Full E2E suite | PASS | `npm run test:e2e` -> `30 passed` |
| Backend tests | PASS | `python -m pytest -q` -> `53 passed, 1 skipped` |
| Backend lint | PASS | `python -m ruff check .` -> `All checks passed!` |
| Backend format check | PASS | `python -m ruff format --check .` -> `67 files already formatted` |
| Backend typecheck | PASS | `python -m mypy app tests` -> `Success: no issues found in 58 source files` |
| Frontend lint | PASS | `npm run lint` |
| Frontend typecheck | PASS | `npm run typecheck` |
| Frontend build | PASS | `npm run build` |

## Remaining Risks

- The E2E suite still runs against the Next.js dev server, so first-run page compilation adds runtime variance.
- The fixed acceptance harness no longer relies on full browser `load`; it relies on deterministic page and dialog selectors, which is the intended readiness signal for these feature states.

