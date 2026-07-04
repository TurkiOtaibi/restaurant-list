# Base UI Layering and Pilot Report

## Policy Created

Created `BASE_UI_LAYERING_POLICY.md` to define overlay, portal, z-index, bottom-navigation, iOS Safari, RTL, accessibility, screenshot, rollback, and future migration rules for Base UI adoption.

## Primitive Selected

Selected Base UI `Switch`.

## Why Switch Was Selected

`Switch` is lower risk than Dialog, Menu, Select, Combobox, Popover, Drawer, Sheet, Navigation, or Form primitives. It verifies Base UI controlled state, keyboard behavior, focus styling, hidden-input semantics, RTL styling, and token-aligned visual styling without touching app workflows.

## Where It Was Used

Used exactly once on the technical `/health` page through `BaseSwitchPilot`.

The `/health` page is not a product workflow and the switch state is local-only demo state. It does not persist data, call APIs, affect authentication, change routes, or alter business behavior.

## Files Changed

- `BASE_UI_LAYERING_POLICY.md`
- `BASE_UI_LAYERING_AND_PILOT_REPORT.md`
- `frontend/app/health/page.tsx`
- `frontend/app/globals.css`
- `frontend/src/components/ui/BaseSwitchPilot.tsx`

## Screenshots

Screenshot evidence:

- `docs/qa-execution/base-ui-layering-pilot/screenshots/health-390x844-after.png`
- `docs/qa-execution/base-ui-layering-pilot/screenshots/health-320x568-after.png`
- `docs/qa-execution/base-ui-layering-pilot/screenshots/health-switch-focused-390x844-after.png`

## Accessibility Notes

- The switch is label-associated through a visible Arabic label.
- The switch uses `aria-describedby` for the technical purpose text.
- The local state message uses `aria-live="polite"`.
- Focus remains visible through the global `:focus-visible` token.
- The target size is at least 44px through the row control and 52x32 switch surface.

## RTL Notes

- The page inherits the app RTL direction.
- Arabic copy is used for all pilot UI.
- The thumb movement is RTL-aware for the current layout by moving left when checked.
- No bottom navigation or overlay behavior is changed.

## Quality Gate Results

- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run build`: PASS
- `npm run test:e2e`: PASS, 52 passed
- `python -m ruff format --check .`: PASS
- `python -m ruff check .`: PASS
- `python -m mypy app tests`: PASS
- `python -m pytest -q`: PASS, 78 passed, 1 skipped

## Radix Introduced

No.

## Known Risks

- The pilot is intentionally placed on `/health`; future production UI migrations still require screenshot-backed review on real user flows.
- `Switch` is not an overlay primitive, so the policy covers future overlay work but this pilot does not validate portal collision behavior.

## Recommended Next Base UI Migration Candidate

`Checkbox` in a non-critical settings or filter-like surface, if a real product need exists. Dialog, Menu, Select, Combobox, Popover, Drawer, Sheet, Navigation, and Form should remain dedicated PRs with focused screenshot and accessibility evidence.
