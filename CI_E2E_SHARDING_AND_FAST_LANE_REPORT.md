# CI E2E Sharding And Fast-Lane Report

## Summary

This change reduces future release waiting time by running Playwright E2E in four GitHub Actions shards and documenting a fast-lane policy for scoped frontend-only UI patches.

No product behavior, app UI, backend, API, database, or dependency behavior was changed.

## Files Changed

- `.github/workflows/ci.yml`
- `FAST_LANE_UI_PATCH_POLICY.md`
- `CI_E2E_SHARDING_AND_FAST_LANE_REPORT.md`

## Old CI Behavior

The `e2e` GitHub Actions job ran the full Playwright suite in one runner:

- One PostgreSQL service.
- One backend test app environment.
- One frontend install.
- One `npm run test:e2e` execution.
- E2E wall-clock time was limited by the slowest single full-suite run.

## New CI Behavior

The workflow now runs Playwright in four parallel shards:

- `e2e shard 1/4`
- `e2e shard 2/4`
- `e2e shard 3/4`
- `e2e shard 4/4`

Each shard uses Playwright's native sharding:

- `--shard=1/4`
- `--shard=2/4`
- `--shard=3/4`
- `--shard=4/4`

A final `e2e` aggregate job depends on all shard jobs and fails if any shard fails. This preserves a single legacy `e2e` check while making every shard required for CI success.

Local `npm run test:e2e` remains unchanged.

## Shard Count

Shard count: 4.

Four shards are a pragmatic first step because the suite has enough E2E files to distribute work while avoiding excessive runner overhead.

## Reports And Artifacts

Each shard uploads:

- Playwright HTML report artifact.
- Playwright `test-results` artifact.

Artifact names include the shard number so failed shard evidence can be inspected independently.

## Expected Time Savings

Expected E2E CI wall-clock improvement: approximately 40-65% for the E2E phase, depending on shard balance, GitHub runner startup time, and backend/frontend boot time per shard.

This does not reduce backend or frontend CI job duration. It only reduces the longest Playwright wait by parallelizing the E2E suite.

## Coverage Confirmation

Coverage is not reduced:

- No E2E spec is skipped.
- No Playwright project is removed.
- Local `npm run test:e2e` still runs the full suite.
- CI shards partition the same test suite with Playwright's native `--shard` option.
- Any shard failure fails the final `e2e` aggregate job.

## Fast-Lane Policy Summary

`FAST_LANE_UI_PATCH_POLICY.md` defines when a scoped frontend-only UI fix may use a shorter release path:

- Frontend-only.
- Narrow file scope.
- No auth/API/backend/database changes.
- No PWA/service worker/cache changes.
- No public/private boundary changes.
- No data mutation.
- No dependency or Radix changes.
- Targeted E2E and screenshots for visual changes.
- Targeted production verification after merge.

Full release workflow remains required for auth, backend/API/database, PWA/cache, route boundary, Base UI Dialog/Menu core, broad redesign, data mutation, dependency, or smoke baseline changes.

## Risks

- Shard balance may be uneven because some specs are slower than others.
- Each shard starts its own backend/frontend environment, so runner boot overhead remains.
- Branch protection may need to recognize the final aggregate `e2e` check if it does not already.
- Individual shard artifacts must be inspected by shard name when diagnosing failures.

## Rollback Plan

Rollback is straightforward:

1. Revert `.github/workflows/ci.yml` to the single `e2e` job running `npm run test:e2e`.
2. Keep or remove the fast-lane policy independently.
3. Re-run CI and confirm backend, frontend, and E2E checks pass.

## Validation

Local validation required:

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run test:e2e`

Workflow sharding itself must be validated by GitHub Actions because matrix job scheduling and artifact upload behavior are CI-environment concerns.
