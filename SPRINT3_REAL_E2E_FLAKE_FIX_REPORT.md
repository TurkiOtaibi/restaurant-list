# SPRINT3 Real E2E Flake Fix Report

## Failure Summary

Main CI for a recent release failed in `frontend/tests/e2e/sprint3-real.spec.ts` inside:

- `real frontend and api complete list edit add remove delete and profile flow`

The CI timeout was waiting for the create-list field labelled `اسم القائمة` after navigating to `/lists/new`.

During local reproduction, the same long flow exposed a second timing race later in the test: `page.waitForURL(/\/profile$/)` timed out after clicking the profile navigation link.

## Root Cause

The test depended on implicit readiness and navigation timing in a long real-browser flow:

- `/lists/new` opens `CreateListDialog` only after client-side `ensureSession()` confirms the authenticated session.
- The test navigated to `/lists/new` and immediately filled `اسم القائمة`, so a slow or delayed session recovery could leave the locator waiting until the whole test timed out.
- Some Next.js client-side link transitions used `Promise.all([page.waitForURL(...), link.click()])`. That pattern can still be brittle when the click completes but the client transition/load timing does not line up exactly with the navigation waiter.

This was not caused by the recent RTL menu change. The failure was in an unrelated long end-to-end flow and reproduced locally as a navigation timing race.

## Files Changed

- `frontend/tests/e2e/sprint3-real.spec.ts`

## Fix Implemented

- Added `openCreateListDialog(page)` helper.
- The helper now explicitly waits for:
  - `/lists/new` URL
  - the create-list dialog role/name
  - the `اسم القائمة` field visibility
- Replaced brittle `Promise.all([page.waitForURL(...), click])` client-navigation waits with:
  - click the link
  - assert the final URL with `expect(page).toHaveURL(...)`

## Why The Fix Is Deterministic

The test no longer assumes `/lists/new` is ready just because navigation started. It waits for the authenticated dialog state before filling the field.

The Next.js client-side navigation checks now assert the final URL after the click, which avoids losing or mis-timing a route transition event while preserving the same user-visible behavior coverage.

## Coverage Was Not Weakened

No assertions were removed. The test still covers:

- registration
- place creation
- list creation
- visibility updates
- list edit/add/remove/delete
- rating creation
- profile preview
- ratings archive
- anti-regression checks for removed `جربته`

The added helper increases coverage by verifying the create-list dialog is actually visible and accessible before interaction.

## Targeted Test Results

Command:

```bash
npm exec -- playwright test tests/e2e/sprint3-real.spec.ts --reporter=line
```

Result:

- PASS, 4 passed

## Repeat Test Results

Command:

```bash
npm exec -- playwright test tests/e2e/sprint3-real.spec.ts --repeat-each=3 --reporter=line
```

Result:

- PASS, 12 passed

## Full E2E Result

Command:

```bash
npm run test:e2e -- --reporter=line
```

Result:

- PASS, 80 passed

## Frontend Gates

- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run build`: PASS
- `npm run test:e2e`: PASS, 80 passed

Backend gates were not run because this task changed only frontend E2E test code and this report.

## Remaining Risk

This is still a long integration-style E2E flow and can be affected by broad infrastructure failures, but the specific `/lists/new` field wait and client navigation timing races have been removed.
