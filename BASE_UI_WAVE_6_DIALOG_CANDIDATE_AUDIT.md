# Base UI Wave 6 Dialog / ResponsiveDialog Candidate Audit

## 1. Executive Summary

Wave 6 should remain an audit-only step. A Base UI Dialog migration is not safe to implement yet.

The repository has a custom dialog system that is central to core product workflows. `ResponsiveDialog` switches between desktop `Modal` and mobile `BottomSheet`, while several dialogs perform mutations, uploads, rating changes, list changes, profile edits, and confirmation flows. Base UI Dialog can eventually improve maintainability and focus semantics, but replacing the current system now would create high focus-trap, mobile, bottom-sheet, iOS Safari, and product-regression risk.

Final recommendation:

- Do not implement Base UI Dialog in Wave 6.
- Do not migrate `ResponsiveDialog`, `Modal`, or `BottomSheet` yet.
- Add a future dialog-contract hardening/test pass before selecting any Dialog pilot.
- If implementation is later approved, start with one non-destructive route-mounted dialog, not a global primitive replacement.

Implementation safe to start now:

- No.

## 2. Current Base UI Adoption Status

Released Base UI primitives:

| Primitive | Current location | Status |
| --- | --- | --- |
| Tooltip | `frontend/src/components/ui/BaseTooltip.tsx` | Released |
| Switch | `frontend/src/components/ui/BaseSwitchPilot.tsx` | Released pilot |
| Checkbox | `frontend/src/features/profile/ProfileArchivePage.tsx` favorites picker | Released pilot |
| Tabs | `frontend/src/features/places/PlaceLibraryPage.tsx` places type control | Released pilot |

Planned / audited but not implemented:

- Field/Form
- Radio/Visibility
- Toast/Feedback
- Popover
- Menu

Not migrated:

- Dialog
- Drawer / BottomSheet
- Select
- Combobox

Policy:

- Radix must remain absent.
- Dialog migration must not be mixed with Menu, Popover, Select, Combobox, or form migration.
- Every overlay migration must follow `BASE_UI_LAYERING_POLICY.md`.

## 3. Evidence Reviewed

Repository evidence:

- `frontend/src/components/ui/Dialog.tsx`
- `frontend/src/features/profile/ProfileArchivePage.tsx`
- `frontend/src/features/places/PlaceDetailPage.tsx`
- `frontend/src/features/places/RatePlaceDialog.tsx`
- `frontend/src/features/places/CreatePlaceDialog.tsx`
- `frontend/src/features/places/SavePlaceToListDialog.tsx`
- `frontend/src/features/lists/CreateListDialog.tsx`
- `frontend/src/features/lists/EditListDialog.tsx`
- `frontend/src/features/lists/DeleteListDialog.tsx`
- `frontend/src/features/lists/AddPlaceDialog.tsx`
- `frontend/src/features/places/PlaceLibraryPage.tsx`
- `frontend/app/lists/[id]/page.tsx`
- `frontend/app/lists/new/page.tsx`
- `frontend/app/places/new/page.tsx`
- `frontend/app/places/[id]/rate/page.tsx`
- `frontend/tests/e2e/accessibility-harness.spec.ts`
- `frontend/tests/e2e/responsive-layout.spec.ts`

Official Base UI docs reviewed:

- Dialog: https://base-ui.com/react/components/dialog
- Drawer: https://base-ui.com/react/components/drawer
- Alert Dialog: https://base-ui.com/react/components/alert-dialog

Relevant docs implications:

- Base UI Dialog is the correct primitive for modal dialogs.
- Base UI Dialog does not support gestures; Base UI Drawer extends Dialog for gesture/snap-point behavior.
- The current app uses a custom mobile bottom sheet, so a pure Dialog migration is not enough to cover current responsive behavior.
- Confirmation-on-close behavior should be controlled deliberately, not added implicitly during a component swap.

## 4. Current Dialog Architecture

Shared primitive:

- `frontend/src/components/ui/Dialog.tsx`

Exports:

- `Modal`
- `BottomSheet`
- `ResponsiveDialog`

Current behavior:

- `ResponsiveDialog` uses `useMediaQuery("(min-width: 768px)")`.
- Desktop renders `Modal`.
- Mobile renders `BottomSheet`.
- Dialogs are portaled into a per-open `div` appended to `document.body`.
- Siblings are made inert and `aria-hidden`.
- Body `overflowY` is set to `hidden`.
- Initial focus uses `initialFocusSelector`, then first focusable, then the dialog surface.
- Focus is trapped with Tab / Shift+Tab.
- Escape closes via both document listener and surface key handler.
- Close can be confirmable through `hasUnsavedChanges` and `confirmCloseMessage`.
- Focus is restored to the previous element on unmount.
- `dialogRole` supports `dialog` and `alertdialog`.

This is production-specific behavior and must not be replaced broadly without a parity test matrix.

## 5. Dialog Surface Inventory

| Surface | File | Dialog primitive | Behavior | Mutation risk | Mobile risk | Pilot suitability |
| --- | --- | --- | --- | --- | --- | --- |
| Edit profile | `frontend/src/features/profile/ProfileArchivePage.tsx` | `ResponsiveDialog` | Edit display name/bio | High | Medium-High | Defer. |
| Edit favorites | `frontend/src/features/profile/ProfileArchivePage.tsx` | `ResponsiveDialog` | Search, select, reorder, save favorites | High | High | Defer. |
| Save place to list | `frontend/src/features/places/SavePlaceToListDialog.tsx` | `ResponsiveDialog` | Add place to list | High | High | Defer. |
| Rate place | `frontend/src/features/places/RatePlaceDialog.tsx` | `ResponsiveDialog` | Rating form and notes | High | High | Defer. |
| Place image management | `frontend/src/features/places/PlaceDetailPage.tsx` | `ResponsiveDialog` | File upload/remove preview flow | High | High | Defer. |
| Create place | `frontend/src/features/places/CreatePlaceDialog.tsx` | `ResponsiveDialog` | Create new place | High | High | Possible later only after audit tests. |
| Create list | `frontend/src/features/lists/CreateListDialog.tsx` | `ResponsiveDialog` | Create list | High | High | Possible later only after audit tests. |
| Edit list | `frontend/src/features/lists/EditListDialog.tsx` | `ResponsiveDialog` | Edit name/visibility, system-list branch | High | High | Defer. |
| Delete list | `frontend/src/features/lists/DeleteListDialog.tsx` | `ResponsiveDialog`, likely `alertdialog` class risk | Very high | Medium | Defer. |
| Add place to list detail | `frontend/src/features/lists/AddPlaceDialog.tsx` | `ResponsiveDialog` | Search/select/add list item | High | High | Defer. |
| Places subtype filter | `frontend/src/features/places/PlaceLibraryPage.tsx` | `BottomSheet` | Essential mobile filter | Medium | High | Defer. |
| Route-mounted create list | `frontend/app/lists/new/page.tsx` | `CreateListDialog` | Route opens dialog immediately | High | High | Possible first pilot later. |
| Route-mounted create place | `frontend/app/places/new/page.tsx` | `CreatePlaceDialog` | Route opens dialog immediately | High | High | Possible later. |
| Route-mounted rate place | `frontend/app/places/[id]/rate/page.tsx` | `RatePlaceDialog` | Route opens dialog immediately | High | High | Defer. |

## 6. Existing Test Coverage

Current useful coverage:

- `accessibility-harness.spec.ts` includes a synthetic dialog focus-trap check.
- `responsive-layout.spec.ts` checks dialogs/sheets fit on small mobile for create list, edit list, and add place.
- Multiple feature E2E specs exercise dialogs in profile, lists, places, ratings, favorites, wishlist, and image flows.

Known gaps before any migration:

- No dedicated shared `ResponsiveDialog` contract test file.
- No comprehensive test for inert sibling restore.
- No direct body scroll-lock restore test.
- No direct focus-restore test for every close path.
- No confirm-close interaction test across Escape, close button, and unsaved changes.
- No Base UI Dialog composition spike in a non-production route.
- No explicit mobile Safari visual viewport verification for bottom sheet replacement.
- No screenshot matrix for every dialog class.

## 7. Base UI Dialog / Drawer Fit Analysis

### Base UI Dialog

Potential value:

- standard modal/focus behavior.
- built-in dialog anatomy.
- controlled state support.
- built-in title/description semantics when composed correctly.

Risks:

- current mobile bottom-sheet behavior may not map directly.
- current confirm-close notice is inline, not a nested Base UI Alert Dialog.
- current custom inert/scroll/focus restore behavior must be matched exactly.
- route-mounted dialogs depend on immediate open and navigation close behavior.
- mutation flows need smoke cleanup if tested in production.

### Base UI Drawer

Potential value:

- closer fit for bottom-sheet/drawer behavior.
- official docs say Drawer extends Dialog.
- gesture/snap-point behavior could support future mobile polish.

Risks:

- adding gestures or snap points would be a product/UI behavior change.
- mobile Safari behavior requires device-level verification.
- replacing the current simple bottom sheet with Drawer could change scroll and close affordances.

### Base UI Alert Dialog

Potential value:

- better fit for delete/confirmation dialogs.

Risks:

- should not be mixed with general Dialog migration.
- destructive delete flows are not safe first targets.

## 8. Candidate Ranking

| Rank | Candidate | Risk | Reason |
| --- | --- | --- | --- |
| 1 | Dialog contract hardening / test-only pass | Low-Medium | Improves migration safety without changing UI. |
| 2 | Route-mounted create list dialog pilot | Medium-High | Isolated route, existing mobile fit tests, but creates data. |
| 3 | Route-mounted create place dialog pilot | High | Isolated route, but more fields and place creation behavior. |
| 4 | Places subtype bottom sheet | High | Essential mobile filter, currently custom bottom sheet. |
| 5 | Edit profile dialog | High | Profile mutation and unsaved state. |
| 6 | Edit favorites dialog | High | Complex search/checkbox/reorder/save flow. |
| 7 | Rate place dialog | High | Rating EDR/accessibility and mutation behavior. |
| 8 | Delete list dialog | Very high | Destructive alertdialog behavior. |
| 9 | Global `ResponsiveDialog` replacement | Very high | Broad cross-product regression surface. |

## 9. Recommended Wave 6 Decision

Recommended decision:

DO NOT IMPLEMENT DIALOG YET

Recommended next work:

- Create a Dialog / ResponsiveDialog accessibility and behavior contract.
- Add focused E2E tests for current custom dialog behavior.
- Only after that, choose one route-mounted, non-destructive-as-possible pilot.

Recommended future pilot target after contract hardening:

- `CreateListDialog` on `/lists/new`, only if mutation-capable local/E2E and production smoke cleanup are explicitly defined.

Why not now:

- Current open Base UI wave queue is not merged.
- Dialog is the first high-risk focus-trap primitive class.
- The current custom system has significant behavior that must be preserved.
- A component swap could affect many mutation flows.

## 10. Required Contract Before Any Dialog Migration

Create a future `RESPONSIVEDIALOG_ACCESSIBILITY_CONTRACT.md` covering:

- trigger/open contract.
- route-mounted dialog behavior.
- title/labeling contract.
- `dialog` vs `alertdialog` contract.
- initial focus contract.
- focus trap contract.
- Escape behavior.
- close button behavior.
- outside-click policy.
- focus restore behavior.
- inert sibling behavior.
- body scroll-lock behavior.
- unsaved-change confirmation behavior.
- mobile bottom-sheet behavior.
- desktop modal behavior.
- safe-area and bottom-navigation behavior.
- RTL/Arabic layout rules.
- production smoke and cleanup policy.

## 11. Acceptance Criteria For Future Contract/Test Pass

Before any Base UI Dialog pilot, prove:

- every exported primitive has documented behavior.
- at least one representative dialog covers focus trap.
- Escape close restores focus.
- close button restores focus.
- confirm-close appears when unsaved changes exist.
- canceling confirm-close keeps dialog open.
- confirming close closes dialog and restores state.
- body scroll lock is restored after close.
- siblings inert/aria-hidden are restored after close.
- mobile bottom sheet fits 320x568 and 390x844.
- desktop modal fits tablet/desktop.
- no horizontal overflow.
- no Radix dependency.
- no product behavior change.

## 12. Acceptance Criteria For A Future Dialog Pilot

A future Base UI Dialog pilot must:

- use exactly one target dialog.
- not replace global `ResponsiveDialog`.
- not migrate Menu, Popover, Select, Combobox, Field/Form, or Toast in the same PR.
- preserve current Arabic copy.
- preserve route/navigation behavior.
- preserve mutation payloads.
- preserve validation and server error display.
- preserve initial focus.
- preserve focus trap.
- preserve Escape and close behavior.
- preserve confirm-close behavior if the target has it.
- preserve mobile/desktop responsive behavior.
- include screenshot evidence.
- update Base UI dependency policy allow-list only for approved dialog imports.
- keep Radix absent.

## 13. Required E2E Tests For A Future Dialog Pilot

Required:

- target route/page loads.
- dialog has Arabic accessible name.
- initial focus lands on expected element.
- Tab / Shift+Tab remain trapped.
- Escape behavior matches contract.
- close button behavior matches contract.
- focus restores to trigger or route fallback.
- mobile 320x568 fits.
- mobile 390x844 fits.
- desktop/tablet fits.
- no horizontal overflow.
- mutation path works only in E2E/local test data.
- no Radix dependency.
- existing feature tests remain unchanged.

If the target opens from a menu:

- verify menu closes.
- verify dialog owns focus.
- verify menu does not restore focus over the dialog.

## 14. Required Screenshots

For contract hardening:

- current modal desktop.
- current bottom sheet 320x568.
- current bottom sheet 390x844.
- focused control state.
- confirm-close notice state.

For future pilot:

Save under:

`docs/qa-execution/base-ui-dialog-pilot/screenshots/`

Required:

- target dialog 320x568.
- target dialog 390x844.
- target dialog tablet/desktop.
- focused first control.
- close/confirm state if applicable.
- route-mounted open state if applicable.

## 15. Accessibility Checklist

Verify:

- dialog has accessible name.
- title id and `aria-labelledby` are correct.
- `alertdialog` is only used for destructive/urgent confirmations.
- focus enters predictably.
- focus cannot escape with Tab.
- Escape behavior is documented.
- close control has Arabic accessible name.
- errors/status messages remain announced correctly.
- no hidden required information.
- screen-reader background isolation remains correct.

## 16. RTL / Mobile Checklist

Verify:

- Arabic labels remain unchanged.
- RTL layout is preserved.
- bottom sheet aligns naturally in Arabic UI.
- no clipped Arabic glyphs.
- no horizontal overflow at 320px, 390px, and 430px.
- safe-area padding remains correct.
- bottom navigation is not blocked incorrectly.
- iOS Safari visual viewport behavior is verified or explicitly documented.

## 17. Layering / Portal Checklist

Verify:

- z-index follows `BASE_UI_LAYERING_POLICY.md`.
- dialog appears above ActionMenu, Tooltip, Popover, and Toast where expected.
- nested confirmation behavior is deterministic.
- backdrop blocks background interaction.
- siblings are hidden/inert or Base UI equivalent behavior is verified.
- scroll lock is restored.
- portal root cleanup works.

## 18. Rollback Strategy

For this audit:

- remove `BASE_UI_WAVE_6_DIALOG_CANDIDATE_AUDIT.md`.

For a future contract/test pass:

- revert the docs/tests-only PR.

For a future implementation pilot:

1. Restore the target dialog to current `ResponsiveDialog`.
2. Remove any unused Base UI Dialog wrapper.
3. Remove dialog imports from dependency policy allow-list if no longer used.
4. Keep `@base-ui/react` because released primitives still require it.
5. Re-run full frontend and backend gates.

No backend, API, auth, or database rollback should be required.

## 19. Production Smoke Requirements

For this audit:

- no production smoke required.

For future contract/test-only pass:

- CI only is acceptable unless screenshots are required.

For future Dialog pilot:

- authenticated smoke.
- open target dialog.
- verify Arabic accessible name if practical.
- verify focus and close behavior if practical.
- verify mobile RTL at 390x844.
- verify no horizontal overflow.
- do not mutate production data unless explicitly approved.
- if mutation is required, use dedicated smoke account and cleanup.
- if cleanup cannot be completed, final release verdict must be NOT RELEASED.

## 20. Final Recommendation

Final recommendation:

DO NOT IMPLEMENT BASE UI DIALOG YET

Recommended next action:

- Add a dedicated ResponsiveDialog accessibility/behavior contract and focused E2E coverage.

Recommended future pilot after contract hardening:

- Route-mounted `CreateListDialog` only if mutation cleanup is approved.

Risk level:

- High.

Implementation safe to start:

- No.

