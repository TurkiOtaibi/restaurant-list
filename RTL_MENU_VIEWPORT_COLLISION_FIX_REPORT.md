# RTL Menu Viewport Collision Fix Report

## Summary

Fixed RTL mobile viewport clipping for the shared `ActionMenu` surface. The primary verified target is the Place Detail top-right action menu.

## Root Cause

`ActionMenu` previously positioned the menu with:

- `position: absolute`
- `inset-inline-end: 0`

On Place Detail, the menu content also receives `direction: rtl` so Arabic menu text aligns correctly. Because logical inset properties follow the element direction, `inset-inline-end` resolved to the left side of the menu surface in RTL. For a top-right trigger, this made the menu open outward toward the right edge, causing partial clipping on mobile viewports.

## Fix Implemented

- Changed `ActionMenu` to compute a viewport-safe fixed position when opened.
- The menu aligns its right edge to the trigger by default, then clamps within the viewport using a 12px margin.
- The menu updates position on resize and scroll while open.
- Menu content keeps RTL text behavior independently from surface positioning.
- Added max inline size and text wrapping protection to avoid viewport overflow.

## Files Changed

- `frontend/src/components/ui/ActionMenu.tsx`
- `frontend/app/globals.css`
- `frontend/tests/e2e/rtl-menu-viewport-collision.spec.ts`
- `frontend/tests/e2e/wishlist-phase-5.spec.ts`
- `docs/qa-execution/rtl-menu-viewport-collision/screenshots/place-detail-menu-open-390x844.png`
- `docs/qa-execution/rtl-menu-viewport-collision/screenshots/place-detail-menu-open-320x568.png`
- `docs/qa-execution/rtl-menu-viewport-collision/screenshots/place-detail-menu-open-430x932.png`

## Affected Menu Component

Shared custom `ActionMenu`.

No Base UI Menu migration was performed.

## RTL Behavior

- RTL menu text remains right-aligned through existing surface direction rules.
- Positioning no longer depends on logical inset resolution after the menu content direction changes.
- Top-right mobile menus open inward toward the left and remain attached to the trigger visually.

## Viewport Collision Strategy

- `ActionMenu` measures the trigger and menu surface after open.
- Preferred horizontal position: `trigger.right - menu.width`.
- Final horizontal position is clamped between:
  - `12px`
  - `viewportWidth - 12px - menuWidth`
- Vertical position opens below the trigger with an 8px gap and is clamped inside the viewport.
- CSS adds:
  - `position: fixed`
  - `z-index: 70`
  - `max-inline-size: calc(100vw - 24px)`
  - `overflow-wrap: anywhere`

## Screenshots

- `docs/qa-execution/rtl-menu-viewport-collision/screenshots/place-detail-menu-open-390x844.png`
- `docs/qa-execution/rtl-menu-viewport-collision/screenshots/place-detail-menu-open-320x568.png`
- `docs/qa-execution/rtl-menu-viewport-collision/screenshots/place-detail-menu-open-430x932.png`

## E2E Coverage

Added `frontend/tests/e2e/rtl-menu-viewport-collision.spec.ts`.

Coverage:

- Place Detail menu opens at 320x568, 390x844, and 430x932.
- Menu bounding box remains inside viewport.
- Menu text is not clipped.
- Escape closes the menu.
- Outside click closes the menu.
- Focus returns to the trigger.
- No horizontal overflow.

Updated `frontend/tests/e2e/wishlist-phase-5.spec.ts`.

Additional shared-component regression coverage:

- System-list ActionMenu remains inside the viewport at 390x844.
- Existing keyboard/focus contract remains covered.

## Quality Gate Results

- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run build`: PASS
- `PLAYWRIGHT_PORT=3107 E2E_API_PORT=8107 E2E_API_BASE_URL=http://localhost:8107 NEXT_PUBLIC_API_BASE_URL=http://localhost:8107 npm run test:e2e -- --reporter=line`: PASS, 80 passed
- `python -m ruff format --check .`: PASS
- `python -m ruff check .`: PASS
- `python -m mypy app tests`: PASS
- `python -m pytest -q`: PASS, 78 passed, 1 skipped

Focused precheck:

- `PLAYWRIGHT_PORT=3107 npm run test:e2e -- rtl-menu-viewport-collision.spec.ts wishlist-phase-5.spec.ts --reporter=line`: PASS, 6 passed

## Dependency / Product Impact

- Radix dependency added: no
- Base UI Menu used: no
- Product behavior changed: no
- Backend/API/database changed: no

## Out of Scope

- Safari/PWA bottom nav safe-area
- Smoke/test data cleanup
- Hero/card redesign
- Place Detail content changes
