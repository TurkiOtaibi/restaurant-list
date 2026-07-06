# Base UI Menu System List Pilot Report

## Executive Summary

Implemented a scoped Base UI Menu pilot for exactly one surface: the system-list list-detail header action menu. The shared custom `ActionMenu` remains in place for profile, place detail, normal list header menus, and list item row menus.

This pilot follows `BASE_UI_WAVE_5_MENU_CANDIDATE_AUDIT.md`: the system-list header menu is the lowest-risk menu target because it exposes only the visibility edit action and keeps delete hidden.

## Primitive Selected

- Base UI primitive: `Menu`
- Import path: `@base-ui/react/menu`
- Target surface: `/lists/{id}` when the loaded list has `isSystem === true`
- Label preserved: `إجراءات القائمة`
- Item preserved: `تعديل`

## Why This Target Was Selected

- It is isolated to one rendered branch.
- It avoids destructive actions because system lists cannot be deleted.
- It keeps existing edit/visibility behavior unchanged.
- It already has focused E2E coverage in `wishlist-phase-5.spec.ts`.
- It does not require backend, API, routing, Dialog, Popover, Select, Combobox, or global `ActionMenu` changes.

## Files Changed

- `frontend/app/lists/[id]/page.tsx`
- `frontend/app/globals.css`
- `frontend/tests/e2e/ui-dependency-policy.spec.ts`
- `docs/qa-execution/base-ui-menu-system-list-pilot/screenshots/system-list-menu-closed-390x844-after.png`
- `docs/qa-execution/base-ui-menu-system-list-pilot/screenshots/system-list-menu-open-390x844-after.png`
- `docs/qa-execution/base-ui-menu-system-list-pilot/screenshots/system-list-menu-focused-item-390x844-after.png`
- `docs/qa-execution/base-ui-menu-system-list-pilot/screenshots/system-list-menu-open-320x568-after.png`
- `BASE_UI_MENU_SYSTEM_LIST_PILOT_REPORT.md`

## Behavior Parity

- Normal list header menus still use the existing custom `ActionMenu`.
- List item removal menus still use the existing custom `ActionMenu`.
- System-list delete remains hidden.
- The system-list `تعديل` item still opens `EditListDialog`.
- The system-list edit dialog still omits the name field and allows visibility editing.
- No product behavior, data contract, API, auth, backend, or database behavior changed.

## Accessibility Notes

- Base UI Menu supplies menu/menuitem semantics.
- The trigger keeps the Arabic accessible name `إجراءات القائمة`.
- The menu popup keeps the Arabic accessible name `إجراءات القائمة`.
- The menu item keeps the Arabic accessible name `تعديل`.
- The pilot keeps focus movement into the item on open to preserve the hardened `ActionMenu` contract.
- Escape closes the menu and returns focus to the trigger.
- Outside click closes the menu and returns focus to the trigger.
- Menu-to-dialog handoff avoids restoring menu focus over the dialog.

## RTL / Mobile Notes

- Menu placement uses inline-end alignment through Base UI positioning.
- The visual classes reuse the existing dark menu styling.
- The portaled positioner uses a constrained z-index (`70`) consistent with the existing layer policy.
- 390px and 320px screenshots show no bottom navigation collision or horizontal overflow.

## Screenshots

- `docs/qa-execution/base-ui-menu-system-list-pilot/screenshots/system-list-menu-closed-390x844-after.png`
- `docs/qa-execution/base-ui-menu-system-list-pilot/screenshots/system-list-menu-open-390x844-after.png`
- `docs/qa-execution/base-ui-menu-system-list-pilot/screenshots/system-list-menu-focused-item-390x844-after.png`
- `docs/qa-execution/base-ui-menu-system-list-pilot/screenshots/system-list-menu-open-320x568-after.png`

## Tests Updated

- `frontend/tests/e2e/ui-dependency-policy.spec.ts`
  - Added `@base-ui/react/menu` to the approved Base UI import list.

Existing `frontend/tests/e2e/wishlist-phase-5.spec.ts` coverage validates the system-list menu behavior:

- trigger accessible name
- click/keyboard open
- menuitem focus
- ArrowUp / ArrowDown / Home / End behavior
- Escape close and focus restoration
- outside click close and focus restoration
- edit dialog handoff
- system-list rename field hidden

## Quality Gate Results

- `npm run typecheck`: PASS
- `npx playwright test tests/e2e/wishlist-phase-5.spec.ts tests/e2e/ui-dependency-policy.spec.ts`: PASS, 6 passed
- `python -m ruff format --check .` from `backend/`: PASS
- `python -m ruff check .` from `backend/`: PASS
- `python -m mypy app tests` from `backend/`: PASS
- `python -m pytest -q` from `backend/`: PASS, 78 passed, 1 skipped
- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run build`: PASS
- `npm run test:e2e`: PASS, 61 passed

Note: a root-level `python -m mypy app tests` invocation was rejected by mypy because the Python project is rooted under `backend/`. The valid repository backend gate was rerun from `backend/` and passed.

## Dependency Policy

- Radix dependency added: no
- Base UI Menu used: yes, exactly one surface
- Global `ActionMenu` migration: no
- New Base UI primitives besides Menu: no

## Remaining Risks

- Base UI Menu is portaled while the existing custom menu is locally positioned; this is why the pilot is limited to one header surface.
- The focused item visual state is provided by the existing active menu background, not a new visual system.
- Future normal-list or global menu migration still needs a dedicated PR because destructive actions remain higher risk.

## Recommended Next Candidate

Do not proceed to global `ActionMenu` migration yet. The next step should be review and release of this one-surface pilot, then a separate audit for either:

- a normal list header menu pilot with destructive-action safeguards, or
- continued deferral if production smoke reveals portal/layering concerns.
