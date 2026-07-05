# ResponsiveDialog Accessibility and Behavior Contract

## 1. Purpose

This contract defines the required behavior for the current custom `Modal`, `BottomSheet`, and `ResponsiveDialog` primitives before any future Base UI Dialog or Drawer migration.

Base UI Dialog migration remains deferred until this contract is met, tested, and a single pilot target is explicitly approved.

## 2. Current Risk Summary

`ResponsiveDialog` is used across core product workflows:

- profile edit
- favorites edit
- place rating
- save place to list
- create place
- place image upload
- create list
- edit list
- delete list
- add place to list
- places subtype filtering

These surfaces include validation, mutation, upload, confirmation, search, list membership, rating, route-mounted dialogs, and mobile bottom-sheet behavior. Replacing the dialog primitive without a contract would create high focus, scroll, mobile, RTL, and product-regression risk.

## 3. Primitive Responsibilities

The custom dialog system currently exports:

- `Modal`
- `BottomSheet`
- `ResponsiveDialog`

Required responsibilities:

- render dialog content in a portal.
- isolate background content.
- lock document scrolling while open.
- provide accessible dialog naming.
- move focus into the dialog on open.
- trap Tab focus inside the dialog.
- close on Escape according to the close contract.
- restore focus on close.
- support unsaved-change confirmation.
- support `dialog` and `alertdialog` roles.
- preserve Arabic/RTL layout and mobile-first bottom-sheet behavior.

## 4. Responsive Behavior Contract

`ResponsiveDialog` must:

- render `Modal` at desktop widths using the current `(min-width: 768px)` media query.
- render `BottomSheet` below that width.
- preserve the same content, labels, handlers, and validation behavior across both variants.
- avoid changing route, API, auth, or product behavior based on viewport.
- fit at 320x568 and 390x844.
- preserve iOS safe-area spacing.
- avoid fixed bottom navigation collision.

Any future Base UI migration must either preserve this modal/bottom-sheet split or explicitly receive product/design approval to change it.

## 5. Portal / Layer Contract

The current implementation:

- creates a per-open portal root appended to `document.body`.
- marks the portal root with `data-ds-dialog-root="true"`.
- removes the portal root on close/unmount.
- renders backdrop and dialog surface into that portal root.

Required behavior:

- exactly one portal root per open dialog instance unless nested dialogs are explicitly introduced.
- portal root is cleaned up after close.
- dialog appears above page content, ActionMenu, Tooltip, and normal page surfaces.
- dialog layering follows `BASE_UI_LAYERING_POLICY.md`.
- future migrations must not introduce Radix or a second overlay primitive system.

## 6. Background Isolation Contract

While the dialog is open:

- body siblings outside the portal root must be inert or equivalently non-interactive.
- body siblings outside the portal root must be hidden from assistive technology or equivalently isolated.
- previous sibling `inert` and `aria-hidden` states must be restored exactly on close.
- background pointer/keyboard interaction must not reach page content.

## 7. Scroll Lock Contract

While the dialog is open:

- body vertical scrolling must be locked.
- previous `document.body.style.overflowY` must be restored exactly on close.
- dialog content must remain scrollable when content exceeds available height.
- mobile bottom sheet must not cause document horizontal overflow.

## 8. Accessible Name Contract

Every dialog surface must:

- have `role="dialog"` or `role="alertdialog"`.
- have `aria-modal="true"`.
- have `aria-labelledby` pointing to the visible `h2`.
- expose an Arabic accessible name through that heading.
- render a close button with an Arabic accessible name.

`alertdialog` must be reserved for destructive or urgent confirmation flows such as delete confirmation.

## 9. Initial Focus Contract

On open:

- if `initialFocusSelector` is provided and resolves within the dialog, focus moves there.
- otherwise focus moves to the first focusable element.
- if no focusable element exists, focus moves to the dialog surface.
- focus must not remain behind the dialog.

Route-mounted dialogs must also meet this contract when they open immediately after navigation.

## 10. Focus Trap Contract

While open:

- Tab from the last focusable element wraps to the first.
- Shift+Tab from the first focusable element wraps to the last.
- if no focusable elements exist, Tab must not escape the dialog.
- focus indicators must remain visible.
- focus must not move to inert background content.

## 11. Escape Contract

Escape must:

- close the dialog when there are no unsaved changes.
- show confirmation UI when `hasUnsavedChanges` is true.
- not leak to background page handlers.
- preserve focus inside the dialog while confirmation is visible.

If a future dialog target needs non-dismissible behavior, that must be documented as a separate product decision and covered by tests.

## 12. Close Button Contract

The close button must:

- be a real button.
- have an Arabic accessible name, defaulting to `إغلاق`.
- use the same close path as Escape.
- show confirmation UI when `hasUnsavedChanges` is true.
- not discard unsaved changes silently.

## 13. Confirm-Close Contract

When `hasUnsavedChanges` is true:

- close attempts must display a confirmation notice.
- the notice must use assertive semantics.
- cancel keeps the dialog open.
- confirm closes the dialog and runs the original `onClose`.
- focus must remain within the dialog or confirmation UI.
- confirmation copy must remain Arabic.

## 14. Focus Restore Contract

On close:

- focus should return to the element that was active before the dialog opened, when that element still exists.
- if the invoked menu/action opens a dialog, the dialog owns focus and the menu must not restore focus over it.
- route-mounted dialogs may restore focus to a route fallback or allow route navigation to own focus.
- selecting a dialog action that navigates or mutates may own focus according to that action's behavior.

## 15. Outside-Click Contract

The current shared `Dialog` implementation does not define backdrop/outside-click close as a public contract.

Future migrations must not add outside-click close implicitly unless:

- product/design explicitly approves it.
- unsaved-change confirmation is respected.
- tests prove no accidental data loss.

## 16. Mobile Bottom-Sheet Contract

`BottomSheet` must:

- render below desktop breakpoint.
- include the existing grabber affordance.
- fit within the visual viewport.
- avoid bottom navigation collision.
- preserve safe-area padding.
- avoid horizontal overflow.
- keep close and primary actions reachable.
- avoid gesture behavior changes unless explicitly approved.

Base UI Dialog alone is not sufficient if a future migration must preserve bottom-sheet behavior. Base UI Drawer or a custom positioned Dialog strategy must be audited separately before use.

## 17. Desktop Modal Contract

`Modal` must:

- render at desktop/tablet widths.
- center or position according to current design.
- remain within viewport bounds.
- keep content scrollable if needed.
- preserve dark theme and current token usage.

## 18. RTL / Arabic Contract

Dialogs must:

- preserve Arabic copy.
- preserve RTL layout.
- use Arabic accessible names.
- keep mixed Arabic/English place names wrapped by existing `BidiText` where applicable.
- avoid clipped Arabic glyphs.
- avoid horizontal overflow at 320px, 390px, and 430px.

## 19. Destructive and Mutation Flow Rules

Dialogs that mutate data must:

- preserve current validation behavior.
- preserve API payloads.
- preserve server error rendering.
- preserve success behavior.
- preserve cleanup behavior.
- not change confirmation requirements.

Destructive dialogs must:

- use `alertdialog` where currently expected.
- require the existing confirmation path.
- not make destructive actions easier to trigger.

## 20. Testing Requirements

Before any Base UI Dialog migration, add focused tests for the current contract:

- accessible name via `aria-labelledby`.
- `dialog` and `alertdialog` roles where applicable.
- initial focus selector.
- Tab focus trap.
- Shift+Tab focus trap.
- Escape close.
- close button behavior.
- unsaved-change confirm-close flow.
- cancel confirm-close.
- confirm close.
- focus restore.
- body scroll lock restore.
- inert / `aria-hidden` restore.
- mobile bottom-sheet fit at 320x568 and 390x844.
- no horizontal overflow.
- Radix absence.

## 21. Screenshot Requirements

Future dialog contract or migration PRs must include screenshots under a target-specific folder:

- desktop modal open state.
- mobile bottom-sheet open state at 320x568.
- mobile bottom-sheet open state at 390x844.
- focused initial control state.
- confirm-close notice state when applicable.
- alertdialog state for destructive confirmation when applicable.

## 22. Production Smoke Requirements

For docs/test-only contract work:

- production smoke is not required.

For future implementation:

- authenticated smoke is required.
- open the migrated dialog.
- verify Arabic accessible name if practical.
- verify focus/close behavior if practical.
- verify 390x844 RTL and no horizontal overflow.
- avoid production mutation unless explicitly approved.
- if production mutation is required, use the approved smoke account and cleanup strategy.
- if cleanup is incomplete, final release verdict must be NOT RELEASED.

## 23. Rollback Strategy

For this contract:

- remove `RESPONSIVEDIALOG_ACCESSIBILITY_CONTRACT.md`.

For future implementation:

1. Restore the target to current `ResponsiveDialog`.
2. Remove any unused Base UI Dialog/Drawer wrapper.
3. Remove dialog/drawer imports from dependency-policy allow-list if no longer used.
4. Keep `@base-ui/react` for released primitives.
5. Re-run full gates.

No backend, API, auth, or database rollback should be required if product behavior is preserved.

## 24. Future Base UI Dialog Migration Prerequisites

Before any Base UI Dialog or Drawer pilot:

- this contract must be reviewed and accepted.
- current behavior must be covered by focused tests.
- one target must be selected.
- no global `ResponsiveDialog` replacement.
- no Menu, Popover, Select, Combobox, Toast, Field/Form, or Radio migration in the same PR.
- mobile bottom-sheet behavior must be explicitly preserved or explicitly approved to change.
- Radix must remain absent.

