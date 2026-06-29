# E2E Release Gate Fix Report

## Root Cause

GitHub Actions run `28399350152` failed in job `e2e`, step `Run Playwright tests`.

Failing test:

`tests/e2e/sprint3-real.spec.ts:207` - `real places library covers subtype filters sorting layout bidi and errors`

Initial failure:

`locator.press("Enter")` timed out after 240000 ms while waiting on the Places searchbox. The CI log showed the locator resolved, then the element was detached from the DOM while Playwright attempted `elementHandle.press("Enter")`.

Follow-up CI attempts showed the deeper root cause: the test navigated first to the broad `/places?type=restaurant` state and then tried to drive the search UI while the Places page was still completing its initial URL-state and data-load cycle. On GitHub Actions with PostgreSQL, the broad initial collection can remain outside the expected stable result/empty selectors long enough to race the controlled input or fail the wait. The scenario's assertions are about the filtered Places state, sorting, subtype filters, layout, bidi handling, and API routing, not broad initial catalog loading.

This was a Playwright test-flow determinism defect, not an application behavior defect.

## Evidence

CI environment:

- GitHub Actions runner: Ubuntu 24.04
- Node: 22.23.0
- Python: 3.12.13
- Database: PostgreSQL 16 service
- E2E command: `npm run test:e2e`

Initial CI failure excerpt:

- `Test timeout of 240000ms exceeded`
- `Error: locator.press: Test timeout of 240000ms exceeded`
- Waiting for `getByRole('searchbox', { name: 'بحث' })`
- Locator resolved to the expected search input
- `elementHandle.press("Enter")`
- `element was detached from the DOM, retrying`

Follow-up CI verification run `28401963734` proved the same race still existed when a locator-bound `focus()` was used after filling the search field:

- `Error: locator.focus: Test timeout of 240000ms exceeded`
- Locator resolved to the expected search input with the filled search value
- `element was detached from the DOM, retrying`

CI run `28403801758` further confirmed that waiting for the spinner alone was insufficient. The searchbox can be visible during the early render before the Places library reaches a stable result state.

CI run `28406295902` confirmed that waiting for the broad pre-search `/places?type=restaurant` state was the wrong synchronization point:

- `Error: expect(locator).toBeVisible() failed`
- Locator: `.place-memory-section, .ds-empty`
- Timeout: 30000 ms
- Failing line: helper wait before the first filtered search

The failed workflow run had no uploaded Playwright trace or screenshot artifacts.

## Files Modified

- `frontend/tests/e2e/sprint3-real.spec.ts`
- `E2E_RELEASE_GATE_FIX_REPORT.md`

## Fix

Updated the failing scenario so it enters the deterministic feature state through documented URL query parameters:

- Initial state now loads `/places?type=restaurant&q=<unique>` directly.
- The repeated deterministic search check reloads the same filtered state directly.
- Cafe, ice cream, and no-results checks preserve the existing product assertions while avoiding a broad unfiltered pre-search collection load.
- Added `waitForPlaceLibraryReady()` only as a post-navigation/post-filter readiness check for the actual filtered state under test.

The assertions were preserved: result count, ordering, type glyphs, score rendering, horizontal overflow, mixed RTL/LTR text, subtype filtering, empty state, add-place affordance, and API route checks.

## Why The Fix Is Correct

The root cause was the test automation loading a broad initial collection state that was not part of the scenario's assertions, then interacting with the controlled search input while the page was still settling. Loading the filtered state directly removes the unnecessary broad query and aligns the test setup with the state actually being verified.

The fix does not:

- Change application behavior.
- Weaken result assertions.
- Skip any test.
- Increase timeouts.
- Change product logic.

## Quality Gate Results

Passed locally after the final deterministic URL-state adjustment:

- `npm run test:e2e -- tests/e2e/sprint3-real.spec.ts --grep "real places library covers subtype filters sorting layout bidi and errors" --repeat-each=5` - 5 passed
- `npm run test:e2e` - 30 passed
- `python -m pytest -q` - 53 passed, 1 skipped
- `python -m ruff check .`
- `python -m ruff format --check .`
- `python -m mypy app tests`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

## Remaining Risks

- The failed CI runs did not upload Playwright trace/screenshot artifacts, so historical visual inspection was not possible.
- CI re-run is required after pushing the final fix to confirm the GitHub-hosted Ubuntu/PostgreSQL path passes.
