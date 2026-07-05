# ActionMenu Accessibility Contract

## 1. Purpose

This contract defines the required accessibility and keyboard behavior for the existing custom `ActionMenu` before any future Base UI Menu migration.

Base UI Menu migration remains deferred until this contract is met and protected by E2E coverage.

## 2. Current ActionMenu Risk Summary

`ActionMenu` is used in important product surfaces:

- profile actions
- place detail actions
- list detail actions
- list item actions

Those surfaces include session-affecting, state-changing, and destructive actions. The existing custom primitive must be hardened before any replacement is attempted.

## 3. Required Trigger Semantics

The trigger must:

- be a real `button`
- have an Arabic accessible name through `aria-label`
- expose `aria-haspopup="menu"`
- expose `aria-expanded`
- expose `aria-controls`
- keep a visible focus state
- remain at least 44px where practical

## 4. Required Menu Semantics

The menu must:

- expose `role="menu"`
- be labelled by the trigger
- render only when open
- close when Escape is pressed
- close when clicking outside the menu
- preserve RTL layout and Arabic alignment

## 5. Required Menu Item Semantics

Menu items must:

- be real `button` elements
- expose `role="menuitem"`
- keep their Arabic visible label as the accessible name
- preserve destructive styling when `destructive` is set
- keep current action handlers and ordering unchanged

Disabled item behavior is not currently part of `ActionMenu`; if disabled items are needed later, they require a separate contract update and tests.

## 6. Keyboard Contract

Required behavior:

- `Enter` opens the menu from the trigger.
- `Space` opens the menu from the trigger.
- Click/tap opens and closes the menu from the trigger.
- `Escape` closes the menu from the trigger.
- `Escape` from item focus closes the menu.
- `ArrowDown` opens the menu from the trigger and focuses the first item.
- `ArrowUp` opens the menu from the trigger and focuses the last item.
- `ArrowDown` from an item moves to the next item, wrapping at the end.
- `ArrowUp` from an item moves to the previous item, wrapping at the start.
- `Home` moves to the first item.
- `End` moves to the last item.
- `Tab` closes the menu without forcing focus back to the trigger so normal tab navigation can continue.

Typeahead is not currently required. If added later, it must be covered by tests.

## 7. Focus Contract

Required behavior:

- Opening the menu moves focus predictably to a menu item.
- Closing with Escape restores focus to the trigger.
- Closing by outside click restores focus to the trigger when the outside target is not taking focus.
- Selecting an item closes the menu and lets the invoked action own focus.
- If the invoked action opens a dialog, dialog focus rules take over.
- Focus outlines must remain visible.

## 8. Outside-Click Behavior

Clicking outside the menu must close it.

Outside-click behavior must not trigger any menu action.

## 9. RTL / Arabic Behavior

The menu must:

- preserve Arabic labels
- use natural RTL alignment
- align menu content with the existing trigger placement
- avoid clipping Arabic glyphs
- avoid horizontal overflow on mobile

## 10. Mobile Behavior

The menu must:

- keep touch targets comfortable
- remain usable at 320px and 390px widths
- avoid bottom-navigation collision where the menu can appear near the bottom
- avoid large Safari-specific offsets

## 11. Destructive Action Rules

Destructive actions must:

- keep their existing label and styling
- keep existing confirmation behavior, if any
- not become easier to trigger accidentally
- not run during non-mutating smoke tests

## 12. Confirmation Dialog Interaction Rules

If a menu item opens a confirmation or edit dialog:

- selecting the item closes the menu
- the dialog owns focus after it opens
- the menu must not restore focus over the dialog
- closing the dialog follows the existing dialog focus contract

## 13. E2E Coverage Requirements

At least one representative safe surface must cover:

- trigger accessible name
- `aria-haspopup`
- `aria-expanded`
- open with click
- open with Enter or Space
- item focus after open
- ArrowDown / ArrowUp behavior
- Home / End behavior
- Escape close from item focus
- outside-click close
- focus returns to trigger on close
- current action visibility remains correct
- no Radix dependency

Critical/destructive surfaces must remain covered by their existing flow tests.

## 14. Rollback Strategy

Rollback is limited to:

- reverting `frontend/src/components/ui/ActionMenu.tsx`
- removing the focused E2E test additions
- removing this contract and the implementation report if needed

No backend, API, auth, database, or product data rollback is required.

## 15. Future Base UI Menu Migration Prerequisites

Before any Base UI Menu pilot:

- this contract must remain passing
- one isolated target must be selected
- destructive-action risk must be explicitly accepted or avoided
- screenshot evidence must cover open and focused states
- mobile RTL behavior must be verified
- Radix must remain absent
- no Dialog/Popover/Select/Combobox migration may be mixed into the same PR
