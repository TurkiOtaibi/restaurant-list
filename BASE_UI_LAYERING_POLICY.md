# Base UI Layering Policy

## 1. Purpose

This policy defines how Base UI primitives may be introduced into the application without destabilizing the existing Arabic-first, RTL, mobile-first interface. Base UI is the future behavior and accessibility layer for complex interactive primitives, but migrations must remain incremental, reversible, and independently reviewable.

## 2. Current Overlay Risks

The application already has custom overlays and fixed UI surfaces:

- fixed bottom navigation with safe-area handling
- custom responsive dialogs and bottom sheets
- action menus
- toast/status feedback
- Base UI tooltip pilot

The main risks are layer collisions, focus conflicts, visual viewport issues on iOS Safari, and accidental replacement of established app behavior.

## 3. Base UI Portal Behavior

Base UI overlay primitives may portal outside their local DOM subtree. Any Base UI primitive that renders a portal must be reviewed for:

- stacking order against existing dialogs, menus, toasts, and bottom navigation
- focus management and focus restoration
- scroll locking behavior
- RTL placement and collision handling
- iOS Safari visual viewport behavior

Tooltip remains supplementary only. It must not be the only way to access required information or complete a task.

## 4. z-index / Layer Scale

Use the existing app scale as the reference:

- normal content: default stacking
- fixed bottom navigation: app navigation layer
- tooltips and lightweight help: above page content, below blocking dialogs
- toasts/status prompts: above page content and non-blocking overlays
- dialogs/bottom sheets: highest interactive blocking layer

Current numeric references from `frontend/app/globals.css`:

| Layer | Current value | Notes |
| --- | ---: | --- |
| local decorative/content layering | 1-20 | Used for local surfaces and content effects only. |
| app chrome / fixed navigation | 40-60 | Fixed app controls must remain reachable above page content. |
| tooltip positioner / lightweight overlay positioning | 80 | Tooltip positioning layer. |
| prompt/dialog/active overlay content | 90-100 | Highest current interactive overlay range. |

Future migrations must document any new z-index value and why the existing scale was insufficient. Arbitrary z-index escalation is not allowed.

## 5. Bottom Navigation Collision Rules

Future Base UI overlays must not collide with the fixed bottom navigation.

Required checks:

- 320x568 mobile viewport
- 390x844 mobile viewport
- 430x932 mobile viewport
- iOS Safari or a documented equivalent visual-viewport check
- open overlay state screenshot when the primitive can render near the bottom of the viewport

Overlays that anchor near the bottom must either shift, flip, or constrain within the visible viewport without covering navigation-critical targets.

## 6. Toast / Prompt / Dialog / Tooltip Priority

Priority order from lowest to highest:

1. static page content
2. supplementary tooltip/help
3. inline status message
4. toast/prompt feedback
5. non-blocking menu/popover
6. modal dialog or bottom sheet

Blocking dialogs must not be visually or interactively hidden under tooltips, toasts, or page-fixed controls. Tooltips must close or become irrelevant when a blocking dialog opens.

## 7. iOS Safari Visual Viewport Considerations

Future Base UI overlay migrations must verify mobile Safari behavior. Browser chrome, visual viewport resizing, safe-area insets, and keyboard display can all affect overlay placement.

Rules:

- do not add large hardcoded offsets to compensate for Safari chrome
- respect `env(safe-area-inset-*)` only where needed
- keep bottom navigation close to the app viewport bottom
- ensure overlays remain reachable after visual viewport resize
- avoid scroll-lock behavior that traps users above or below the active control

## 8. RTL / Arabic Overlay Rules

All overlay copy must be Arabic unless the product explicitly requires otherwise. Overlay layout must use logical properties where practical.

Required checks:

- `dir="rtl"` behavior for popup content
- Arabic text alignment
- mixed Arabic/English labels
- arrow/placement expectations in RTL
- no clipped Arabic glyphs

## 9. Accessibility Rules

Every Base UI migration must preserve or improve accessibility:

- keyboard operation
- visible focus state
- correct accessible name and description
- appropriate ARIA semantics from the primitive
- focus restoration after close
- no hidden focus traps
- no required information available only on hover
- touch targets at least 44px where practical

EDR-002 rating accessibility behavior must remain unchanged.

## 10. Screenshot Requirements for Future Overlay PRs

Every visual or overlay migration must include screenshots for:

- target page before and after when visual output changes
- 320x568 after
- 390x844 after
- open overlay state
- focused state where practical
- any bottom-navigation collision scenario

Screenshots must be stored under `docs/qa-execution/` in a feature-specific folder.

## 11. Rollback Strategy

Each Base UI migration must be isolated so it can be reverted without removing unrelated infrastructure. A rollback should restore the previous custom primitive or previous non-Base UI implementation without changing backend contracts, routes, or product behavior.

## 12. Rules for Future Base UI Migrations

- Radix must not be introduced unless explicitly approved.
- Dialog migration requires a dedicated PR.
- Menu migration requires a dedicated PR.
- Select migration requires a dedicated PR.
- Combobox migration requires a dedicated PR.
- Popover/drawer/sheet migrations require dedicated PRs.
- Do not migrate multiple complex primitives in one PR.
- Do not migrate a component without screenshot evidence.
- Do not use Base UI to redesign flows.
- Do not weaken existing E2E or accessibility coverage.
- Every migration must pass frontend and relevant backend gates.
