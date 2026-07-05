# Base UI Wave 0 Policy Verification Report

## Purpose

Wave 0 implements the first step from `BASE_UI_FULL_MIGRATION_MASTER_PLAN.md`: verify the dependency and migration policy before adding any new Base UI primitive or migrating any UI.

This is a tests/report-only wave.

## Scope

Included:

- Strengthened the existing UI dependency policy E2E test.
- Confirmed Radix remains prohibited.
- Pinned active Base UI source imports to the released primitives:
  - Tooltip
  - Switch
  - Checkbox
  - Tabs

Excluded:

- No application code changes.
- No package installation.
- No new Base UI primitive.
- No component migration.
- No visual change.
- No backend, API, auth, database, or routing change.

## Files Changed

- `frontend/tests/e2e/ui-dependency-policy.spec.ts`
- `BASE_UI_WAVE_0_POLICY_VERIFICATION_REPORT.md`

## Policy Verification Added

The E2E dependency policy now checks:

1. `package.json` and `package-lock.json` do not contain Radix dependencies.
2. Source imports from `@base-ui/react/*` are limited to the released and approved primitives:
   - `@base-ui/react/checkbox`
   - `@base-ui/react/switch`
   - `@base-ui/react/tabs`
   - `@base-ui/react/tooltip`

Any future Base UI primitive must update this test intentionally in the same PR as the reviewed migration.

## Behavior Preservation

No runtime component, route, state, CSS, API client, backend code, package, or data contract changed. This wave only adds policy coverage and documentation.

## RTL / Accessibility Impact

No UI changed. Existing Arabic/RTL and accessibility behavior is preserved. The new test supports future accessibility governance by preventing unreviewed primitive adoption.

## Radix Status

Radix dependency added: no.

The existing Radix absence policy remains in place and was not weakened.

## Quality Gate Results

- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run build`: PASS
- `npm run test:e2e`: PASS, 59 passed
- `python -m ruff format --check .`: PASS
- `python -m ruff check .`: PASS
- `python -m mypy app tests`: PASS
- `python -m pytest -q`: PASS, 78 passed, 1 skipped

## Remaining Risks

- This wave does not migrate UI; it only protects the migration path.
- Future waves still need screenshots, focused E2E coverage, accessibility review, and production smoke where required.
- Dialog, Menu, Select, Combobox, RatingControl, search, and bottom navigation remain deferred.

## Recommendation

Proceed to Wave 1 only after this policy verification PR passes all gates and review.

Recommended Wave 1 target: one low-risk Field/Form primitive pilot, selected through a narrow pre-implementation audit.
