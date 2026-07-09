# Place Detail Actions / CTA Hierarchy Fix Report

## Root Cause

The Place Detail top-right `ActionMenu` mixed normal user actions with management actions:

- `أضف إلى قائمة`
- `قيّم المكان`
- image management actions for creators

This made the action hierarchy unclear and placed ordinary save/rate actions in a menu that should be reserved for management. The hero CTA styling also applied the same green treatment to every hero button, so the wishlist and add-to-list actions did not have a clear primary/secondary hierarchy.

The hero button content was wrapped by the shared `Button` component in an inner `span`; without a scoped rule for that span, the icon/text group could stack vertically instead of staying centered on one line.

## Files Changed

- `frontend/src/features/places/PlaceDetailPage.tsx`
- `frontend/app/globals.css`
- `frontend/tests/e2e/place-detail-actions-cta-hierarchy.spec.ts`
- `frontend/tests/e2e/place-images.spec.ts`
- `frontend/tests/e2e/rtl-menu-viewport-collision.spec.ts`
- `frontend/tests/e2e/support/places-acceptance-harness.ts`
- `docs/qa-execution/place-detail-actions-cta-hierarchy/screenshots/place-detail-actions-hero-390x844.png`
- `docs/qa-execution/place-detail-actions-cta-hierarchy/screenshots/place-detail-actions-hero-320x568.png`
- `docs/qa-execution/place-detail-actions-cta-hierarchy/screenshots/place-detail-actions-hero-430x932.png`
- `docs/qa-execution/place-detail-actions-cta-hierarchy/screenshots/place-detail-actions-menu-open-390x844.png`

## Top-Right Menu Changes

- Removed normal user actions from the Place Detail top-right menu:
  - `أضف إلى قائمة`
  - `قيّم المكان`
- The top-right menu is now rendered only when existing management actions are available.
- For non-creator/public states, the top-right menu trigger is hidden.
- For creator states, the existing image management actions remain available:
  - `أضف صورة` / `تغيير الصورة`
  - `إزالة الصورة` when an image exists

Current limitation: the frontend/API currently do not expose general place edit/delete actions. This PR does not invent new permissions, routes, or backend behavior. If product wants true `تعديل` / `حذف` place management, that requires a separate backend/API/product task.

## Hero CTA Hierarchy Changes

- Wishlist is now the primary hero CTA:
  - `أضف إلى رغباتي`
  - green filled treatment
- Add-to-list is now the secondary hero CTA:
  - `أضف إلى قائمة`
  - dark/outline treatment
- The rating action is not shown in the hero card.

## CTA Alignment Changes

- Scoped hero CTA styles keep the icon/text group centered.
- The inner `Button` span now uses inline-flex alignment only inside `.place-detail-hero__cta`.
- Icons and labels stay on the same line.
- No global button styles were changed.

## Rating Action Placement

- The rating action remains inside the `تقييمك` card.
- Empty state copy now matches the approved wording:
  - `لم تضف تقييمًا لهذا المكان بعد.`
- The rating CTA remains:
  - `قيّم المكان`
  - existing rated-state copy remains supported by current logic.

## Screenshots

- `docs/qa-execution/place-detail-actions-cta-hierarchy/screenshots/place-detail-actions-hero-390x844.png`
- `docs/qa-execution/place-detail-actions-cta-hierarchy/screenshots/place-detail-actions-hero-320x568.png`
- `docs/qa-execution/place-detail-actions-cta-hierarchy/screenshots/place-detail-actions-hero-430x932.png`
- `docs/qa-execution/place-detail-actions-cta-hierarchy/screenshots/place-detail-actions-menu-open-390x844.png`

## Tests Updated

- Added `place-detail-actions-cta-hierarchy.spec.ts` covering:
  - public detail hero actions
  - no user actions in top-right menu
  - rating action inside `تقييمك`
  - owner management-only menu
  - add-to-list, wishlist, and rating flows
  - CTA centering CSS
  - no horizontal overflow
- Updated `place-images.spec.ts` for the new management menu accessible name and hidden non-creator menu.
- Updated `rtl-menu-viewport-collision.spec.ts` to use a creator/management menu state because public users no longer see the top-right menu.
- Updated `places-acceptance-harness.ts` to open add-to-list by accessible name rather than depending on hero button order.

## Quality Gate Results

- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run build`: PASS
- `npm run test:e2e -- --reporter=line`: PASS, 83 passed

Backend gates were not run because no backend files, API contracts, database files, migrations, or auth/session logic changed.

## Dependency / Scope

- Radix dependency added: no
- New Base UI component migration: no
- Backend/API/database changed: no
- Product behavior changed: no

## Known Out-of-Scope Items

- smoke/test data cleanup
- Safari/PWA bottom safe-area
- broader redesign
- public catalog cleanup
- new backend permissions
- true place edit/delete management actions
