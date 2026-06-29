# E2E Release Gate Fix Report

## Root Cause

GitHub Actions run `28399350152` failed in job `e2e`, step `Run Playwright tests`.

Failing test:

`tests/e2e/sprint3-real.spec.ts:207` - `real places library covers subtype filters sorting layout bidi and errors`

Failure:

`locator.press("Enter")` timed out after 240000 ms while waiting on the Places searchbox. The CI log showed the locator resolved, then the element was detached from the DOM while Playwright attempted `elementHandle.press("Enter")`.

This was a Playwright interaction race against a controlled React search input re-render. It was not an application behavior defect: the same search form and API behavior were already valid, and the full local e2e suite passed once the interaction was made deterministic.

## Evidence

CI environment:

- GitHub Actions runner: Ubuntu 24.04
- Node: 22.23.0
- Python: 3.12.13
- Database: PostgreSQL 16 service
- E2E command: `npm run test:e2e`

CI failure excerpt:

- `Test timeout of 240000ms exceeded`
- `Error: locator.press: Test timeout of 240000ms exceeded`
- Waiting for `getByRole('searchbox', { name: 'بحث' })`
- Locator resolved to the expected search input
- `elementHandle.press("Enter")`
- `element was detached from the DOM, retrying`

Artifacts:

- The failed workflow run had no uploaded artifacts.
- No Playwright trace or screenshot artifact was available from the failed run.

## Files Modified

- `frontend/tests/e2e/sprint3-real.spec.ts`

## Fix

Added a test helper that:

1. Locates the searchbox.
2. Fills the search value when required.
3. Asserts the value is present.
4. Focuses a fresh locator.
5. Sends Enter through `page.keyboard.press("Enter")`.

This preserves Enter-key form submission coverage while avoiding Playwright holding an element handle across a React-controlled input re-render.

## Why The Fix Is Correct

The root cause was the test automation binding the keyboard action to a DOM node that can be replaced during controlled input updates. The fix keeps the same user-level behavior, but sends the Enter key after focus is established through the page keyboard, which is stable across the input re-render boundary.

The fix does not:

- Change application behavior.
- Weaken assertions.
- Skip any test.
- Increase timeouts.
- Change product logic.

## Quality Gate Results

Passed:

- `npm run test:e2e -- tests/e2e/sprint3-real.spec.ts --grep "real places library covers subtype filters sorting layout bidi and errors"`
- `npm run test:e2e -- tests/e2e/sprint3-real.spec.ts --grep "real places library covers subtype filters sorting layout bidi and errors" --repeat-each=3`
- `npm run test:e2e` - 30 passed
- `python -m pytest -q` - 53 passed, 1 skipped
- `python -m ruff check .`
- `python -m ruff format --check .`
- `python -m mypy app tests`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

## Remaining Risks

- The failed CI run did not upload Playwright artifacts, so historical trace/screenshot inspection was not possible for that run.
- CI re-run is still required after pushing the fix to confirm the GitHub-hosted Ubuntu/PostgreSQL path passes.
