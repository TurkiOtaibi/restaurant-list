# ActionMenu Accessibility Hardening Report

## Contract Created

Created `ACTIONMENU_ACCESSIBILITY_CONTRACT.md`.

The contract defines:

- trigger semantics
- menu semantics
- menu item semantics
- keyboard behavior
- focus restoration
- outside-click behavior
- RTL/mobile requirements
- destructive action rules
- dialog interaction rules
- E2E requirements
- rollback strategy
- prerequisites for any future Base UI Menu migration

## ActionMenu Implementation Found

Implementation:

- `frontend/src/components/ui/ActionMenu.tsx`

Current production surfaces:

- profile header actions
- place detail actions
- list detail header actions
- list item row actions

## Exact Behavior Changes Made

The existing `ActionMenu` was hardened without replacing it and without using Base UI Menu.

Changes:

- Added trigger `id` and labelled the menu with `aria-labelledby`.
- Kept trigger `aria-label`, `aria-haspopup="menu"`, `aria-expanded`, and `aria-controls`.
- Added keyboard open from `Enter`, `Space`, `ArrowDown`, and `ArrowUp`.
- Added focus movement into the menu on open.
- Added roving focus through menu items.
- Added `ArrowDown` / `ArrowUp` wrapping navigation.
- Added `Home` / `End` item navigation.
- Added `Escape` close from item focus.
- Added focus restoration to the trigger on Escape and outside-click close.
- Kept item selection behavior unchanged and lets invoked actions own focus, especially when opening dialogs.
- Kept destructive action styling and action handlers unchanged.

## Files Changed

- `frontend/src/components/ui/ActionMenu.tsx`
- `frontend/tests/e2e/wishlist-phase-5.spec.ts`
- `ACTIONMENU_ACCESSIBILITY_CONTRACT.md`
- `ACTIONMENU_ACCESSIBILITY_HARDENING_REPORT.md`

Screenshot evidence will be stored under:

- `docs/qa-execution/actionmenu-accessibility-hardening/screenshots/`

## E2E Tests Added

Added focused E2E coverage on the system wishlist list-detail menu because it is the safest representative surface:

- trigger has accessible name
- trigger exposes `aria-haspopup="menu"`
- trigger exposes `aria-expanded`
- menu opens with `Enter`
- menu opens with `Space`
- menu item receives focus after open
- `ArrowDown` / `ArrowUp` keep item navigation valid
- `Home` / `End` keep item navigation valid
- `Escape` closes from item focus
- outside click closes
- focus returns to the trigger
- existing action visibility remains correct

Focused test result:

- `npm exec -- playwright test tests/e2e/wishlist-phase-5.spec.ts -g "system list action menu supports keyboard"`: PASS, 1 passed

## Accessibility Notes

The hardened ActionMenu now provides a clearer keyboard and focus contract while preserving current markup shape and visual design.

Known intentional boundary:

- Selecting a menu item does not force focus back to the trigger because many existing menu actions open dialogs, navigate, or mutate state. The invoked action owns focus after selection.

## RTL / Mobile Notes

- Existing RTL CSS alignment is preserved.
- Existing 44px trigger and menu item touch targets are preserved.
- No new portal, z-index, bottom-navigation, or iOS Safari overlay behavior was introduced.

## Screenshots

Captured under `docs/qa-execution/actionmenu-accessibility-hardening/screenshots/`:

- `actionmenu-closed-390x844-after.png`
- `actionmenu-open-390x844-after.png`
- `actionmenu-focused-item-390x844-after.png`
- `actionmenu-open-320x568-after.png`

## Quality Gate Results

- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run build`: PASS
- `npm run test:e2e`: PASS, 56 passed
- `python -m ruff format --check .`: PASS, 79 files already formatted
- `python -m ruff check .`: PASS
- `python -m mypy app tests`: PASS, no issues in 66 source files
- `python -m pytest -q`: PASS, 78 passed, 1 skipped

## Radix Dependency Added

No.

## Remaining Gaps

- Typeahead is not implemented.
- Disabled menu item behavior is not modeled because no current `ActionMenu` items are disabled.
- The current `ActionMenu` remains a custom non-portaled menu. Base UI Menu migration remains deferred.

## Whether Base UI Menu Migration Is Now Safer

Partially. The existing primitive now has a stronger accessibility baseline and focused regression coverage. Base UI Menu should still not be migrated globally. A future pilot should choose exactly one isolated surface after review.

## Recommended Next Step

After this hardening is reviewed and released, reassess whether a single Base UI Menu pilot is justified for one constrained surface. Do not migrate profile, place detail, list delete, or list item removal menus first.
