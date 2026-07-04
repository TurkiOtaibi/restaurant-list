# Base UI Checkbox Pilot Report

## Why Checkbox Was Chosen

`BASE_UI_PHASE_3_CANDIDATE_AUDIT.md` selected Checkbox as the safest high-value Phase 3 candidate.

The profile favorites picker already behaves like a multi-select checklist, but it used `button` plus `aria-pressed`. Base UI Checkbox gives the selection controls a more accurate `checkbox` role and checked state while avoiding portal, z-index, bottom-navigation, and iOS Safari overlay risk.

## Where It Was Used

Used exactly once in one surface:

- `frontend/src/features/profile/ProfileArchivePage.tsx`
- Surface: profile favorites picker selection controls inside the existing `ResponsiveDialog`

No Dialog, Menu, Popover, Tabs, ActionMenu, ResponsiveDialog, or other UI primitive was migrated.

## Files Changed

- `BASE_UI_PHASE_3_CANDIDATE_AUDIT.md`
- `BASE_UI_CHECKBOX_PILOT_REPORT.md`
- `frontend/src/features/profile/ProfileArchivePage.tsx`
- `frontend/app/globals.css`
- `frontend/tests/e2e/profile-phase-1.spec.ts`
- `frontend/tests/e2e/ui-dependency-policy.spec.ts`
- `docs/qa-execution/base-ui-checkbox-pilot/screenshots/favorites-picker-390x844-after.png`
- `docs/qa-execution/base-ui-checkbox-pilot/screenshots/favorites-picker-checkbox-checked-390x844-after.png`
- `docs/qa-execution/base-ui-checkbox-pilot/screenshots/favorites-picker-checkbox-focused-390x844-after.png`
- `docs/qa-execution/base-ui-checkbox-pilot/screenshots/favorites-picker-320x568-after.png`

## Accessibility Notes

- Each picker item now exposes a Base UI `checkbox` control.
- The checkbox accessible name is tied to the visible place name via `aria-labelledby`.
- Checked state is exposed through Base UI's checkbox state.
- Keyboard Space toggling is covered by E2E.
- Mouse click toggling is covered by E2E.
- Focus state remains visible with the existing global focus token.
- The checkbox target is 44px by 44px.

## RTL / Mobile Notes

- Arabic labels and existing copy were preserved.
- Existing RTL row order and spacing were preserved.
- The picker still uses the existing dialog/bottom-sheet behavior.
- No portal, overlay, or bottom-navigation behavior was introduced.
- Screenshot evidence covers 390x844 and 320x568 mobile widths.

## Screenshots

- `docs/qa-execution/base-ui-checkbox-pilot/screenshots/favorites-picker-390x844-after.png`
- `docs/qa-execution/base-ui-checkbox-pilot/screenshots/favorites-picker-checkbox-checked-390x844-after.png`
- `docs/qa-execution/base-ui-checkbox-pilot/screenshots/favorites-picker-checkbox-focused-390x844-after.png`
- `docs/qa-execution/base-ui-checkbox-pilot/screenshots/favorites-picker-320x568-after.png`

## Tests Updated

- `frontend/tests/e2e/profile-phase-1.spec.ts`
  - verifies picker opens
  - verifies search still filters candidates
  - verifies checkbox role/name discovery
  - verifies keyboard Space toggle
  - verifies mouse click toggle on and off
  - verifies selecting up to four still works
  - verifies fifth selection remains blocked
  - verifies reorder still works
  - verifies save updates the favorites strip in place
- `frontend/tests/e2e/ui-dependency-policy.spec.ts`
  - verifies Radix remains absent from frontend dependency files

## Quality Gate Results

- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run build`: PASS
- `npm run test:e2e`: PASS, 54 passed
- `python -m ruff format --check .`: PASS
- `python -m ruff check .`: PASS
- `python -m mypy app tests`: PASS
- `python -m pytest -q`: PASS, 78 passed, 1 skipped

## Radix Dependency Added

No.

## Remaining Risks

- The picker is inside an existing `ResponsiveDialog`, so future dialog migration must be handled separately.
- This pilot improves checkbox semantics only; it does not validate Base UI portals or overlay primitives.
- Existing backend test warnings for deprecated HTTP status constants remain unrelated to this frontend-only change.

## Recommended Next Base UI Candidate

Do not move directly to Dialog or Menu.

Recommended next candidate: Tabs evaluation only if a real tab-like surface is explicitly approved. Otherwise pause Base UI migration until a concrete low-risk target is selected.
