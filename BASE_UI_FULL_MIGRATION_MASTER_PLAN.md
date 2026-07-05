# Base UI Full Migration Master Plan

## 1. Executive Summary

This repository can continue adopting Base UI, but a full conversion is not safe as one broad effort. The app has already proved Base UI compatibility through released Tooltip, Switch, Checkbox, and Tabs pilots. The remaining candidates are materially riskier because they affect menus, dialogs, bottom sheets, feedback, forms, search, and rating workflows.

The recommended strategy is a staged migration with one small PR per wave. Each wave must preserve product behavior, Arabic/RTL layout, mobile-first ergonomics, iOS Safari safe-area behavior, and the no-Radix dependency policy.

Current recommendation:

- Continue Base UI migration only as small, reversible waves.
- Start with dependency/policy verification and low-risk form/field primitives.
- Keep `ActionMenu`, `ResponsiveDialog`, `Modal`, `BottomSheet`, `RatingControl`, search, and navigation custom until dedicated audits approve a migration target.
- Do not migrate Dialog/Menu/Select/Combobox in the same PR as any other primitive.
- Do not introduce Radix.

## 2. Current Base UI Adoption Status

### Migrated / Released Components

| Component | Current location | Base UI primitive | Status |
| --- | --- | --- | --- |
| Tooltip | `frontend/src/components/ui/BaseTooltip.tsx` | `@base-ui/react/tooltip` | Released |
| Switch | `frontend/src/components/ui/BaseSwitchPilot.tsx`, `/health` | `@base-ui/react/switch` | Released pilot |
| Checkbox | `frontend/src/features/profile/ProfileArchivePage.tsx` favorites picker | `@base-ui/react/checkbox` | Released pilot |
| Tabs | `frontend/src/features/places/PlaceLibraryPage.tsx` places type control | `@base-ui/react/tabs` | Released pilot |

### Components Still Custom

- `ActionMenu`
- `ResponsiveDialog`
- `Modal`
- `BottomSheet`
- `Toast`
- `StatusMessage`
- `Field`, `TextInput`, `TextArea`
- `SearchField`
- `VisibilitySelector`
- `RatingControl`
- `RatingDisplay`
- `Button`, `ButtonLink`
- `Badge`, `Chip`
- `Card`, `CardLink`, `PlaceCard`, `ListCard`
- `PlaceImage`, `PlaceTypeIcon`
- `VirtualList`
- fixed bottom navigation and app shell behavior

### Dependencies Status

Frontend stack:

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS 4 infrastructure
- shadcn infrastructure via `frontend/components.json`
- `@base-ui/react` installed
- `clsx` and `tailwind-merge` installed for local UI utilities

### Radix Status

Radix must remain absent. The repository has an E2E dependency policy test in `frontend/tests/e2e/ui-dependency-policy.spec.ts` that checks `package.json` and `package-lock.json` for Radix strings. No Base UI wave may weaken this test.

## 3. Full Component Inventory

| Component / Surface | File path | Current implementation | Base UI equivalent exists | Current risk | Recommended action |
| --- | --- | --- | --- | --- | --- |
| Tooltip | `frontend/src/components/ui/BaseTooltip.tsx` | Base UI Tooltip wrapper | Yes | Low | Already migrated. Keep scoped and supplementary. |
| Health Switch | `frontend/src/components/ui/BaseSwitchPilot.tsx` | Base UI Switch pilot | Yes | Low | Already migrated. Keep as compatibility proof. |
| Favorites picker checkbox | `frontend/src/features/profile/ProfileArchivePage.tsx` | Base UI Checkbox in edit favorites dialog | Yes | Low-Medium | Already migrated. Keep covered by E2E. |
| Places type control | `frontend/src/features/places/PlaceLibraryPage.tsx` | Base UI Tabs | Yes | Low-Medium | Already migrated. Keep query behavior tests. |
| ActionMenu | `frontend/src/components/ui/ActionMenu.tsx` | Custom button/menu/menuitem implementation | Yes, Menu | High | Audit first before any Base UI Menu pilot. |
| Profile ActionMenu | `frontend/src/features/profile/ProfileArchivePage.tsx` | Custom `ActionMenu` | Yes, Menu | High | Candidate for future isolated Menu pilot only after dedicated approval. |
| Place detail ActionMenu | `frontend/src/features/places/PlaceDetailPage.tsx` | Custom `ActionMenu` with place actions | Yes, Menu | High | Defer. Owner-only and state-changing actions increase risk. |
| List detail ActionMenu | `frontend/app/lists/[id]/page.tsx` | Custom `ActionMenu` with edit/delete/list item actions | Yes, Menu | High | Defer. Destructive actions and dialogs are involved. |
| Modal | `frontend/src/components/ui/Dialog.tsx` | Custom portal, inert siblings, focus restore, Escape handling | Yes, Dialog | High | Dedicated audit first. Do not migrate yet. |
| BottomSheet | `frontend/src/components/ui/Dialog.tsx` | Custom mobile sheet | Not directly equivalent without design work | High | Keep custom until dialog/sheet strategy is approved. |
| ResponsiveDialog | `frontend/src/components/ui/Dialog.tsx` | Switches Modal/BottomSheet by media query | Partial | High | Dedicated audit first. Do not migrate yet. |
| Edit profile dialog | `frontend/src/features/profile/ProfileArchivePage.tsx` | `ResponsiveDialog` + form fields | Yes, Dialog/Field | High | Defer. Mutates profile data. |
| Edit favorites dialog | `frontend/src/features/profile/ProfileArchivePage.tsx` | `ResponsiveDialog`, search, checkbox, reorder, save | Yes, Dialog/Field | High | Keep custom dialog. Checkbox already migrated. |
| Save-to-list dialog | `frontend/src/features/places/SavePlaceToListDialog.tsx` | `ResponsiveDialog` | Yes, Dialog | High | Defer. Core list mutation. |
| Rate place dialog | `frontend/src/features/places/RatePlaceDialog.tsx` | `ResponsiveDialog` + `RatingControl` | Yes, Dialog | High | Defer. Rating behavior and EDR-002 risk. |
| Place image dialog | `frontend/src/features/places/PlaceDetailPage.tsx` | `ResponsiveDialog` + file upload | Yes, Dialog | High | Defer. Upload and preview behavior. |
| Create place dialog | `frontend/src/features/places/CreatePlaceDialog.tsx` | `ResponsiveDialog` + fields | Yes, Dialog/Field | High | Defer. Core data creation flow. |
| Create/edit/delete list dialogs | `frontend/src/features/lists/*Dialog.tsx` | `ResponsiveDialog` | Yes, Dialog/Field | High | Defer. Mutations and delete confirmation involved. |
| Add place to list dialog | `frontend/src/features/lists/AddPlaceDialog.tsx` | `ResponsiveDialog` + search | Yes, Dialog/Combobox | High | Defer. Search and mutation flow. |
| StatusMessage | `frontend/src/components/ui/StatusMessage.tsx` | Custom semantic status/error paragraph | Maybe Toast/Alert depending API | Medium | Audit first. Current semantics are simple and stable. |
| Toast | `frontend/src/components/ui/Toast.tsx` | Custom live region/status toast | Maybe Toast | Medium | Audit first. Preserve undo/status behavior. |
| Field/TextInput/TextArea | `frontend/src/components/ui/Input.tsx` | Custom label/error/helper/aria-describedby wiring | Maybe Field/Form | Medium | Migrate next only as one-field pilot if Base UI Field adds value. |
| SearchField | `frontend/src/components/ui/SearchField.tsx` | Native searchbox with clear button and result status | Maybe Field, not Combobox | Medium | Keep custom for now. Do not force Combobox. |
| VisibilitySelector | `frontend/src/features/lists/VisibilitySelector.tsx` | Native radio fieldset | Maybe RadioGroup | Medium | Migrate later only after form primitive pilot succeeds. |
| RatingControl | `frontend/src/components/ui/RatingControl.tsx` | Native range with custom visual stars and EDR-002 `aria-valuetext` | No direct equivalent | High | Keep custom for now. Dedicated rating audit required for any change. |
| RatingDisplay | `frontend/src/components/ui/RatingDisplay.tsx` | Display-only rating | No meaningful Base UI equivalent | Low | Keep custom. |
| Button/ButtonLink | `frontend/src/components/ui/Button.tsx` | Native button/link styling primitive | No Base UI need | Low | Keep custom. Tailwind/style refactors only if needed. |
| Badge/Chip | `frontend/src/components/ui/Badge.tsx`, `Chip.tsx` | Presentational | No Base UI need | Low | Keep custom. |
| Card/ListCard/PlaceCard | `frontend/src/components/ui/Card.tsx`, `ListCard.tsx`, `PlaceCard.tsx` | Presentational cards/links | No Base UI need | Low | Keep custom. |
| PlaceImage/PlaceTypeIcon | `frontend/src/components/ui/PlaceImage.tsx`, `PlaceTypeIcon.tsx` | Image/fallback/icon visuals | No Base UI need | Low | Keep custom. |
| VirtualList | `frontend/src/components/ui/VirtualList.tsx` | Custom virtualization | No | Medium | Keep custom. |
| Places subtype filter | `frontend/src/features/places/PlaceLibraryPage.tsx` | Custom BottomSheet/radiogroup-like filter | Popover/RadioGroup possible | High | Audit first. Mobile-essential filtering makes Popover risky. |
| App shell / bottom nav | `frontend/app/*`, global CSS | Custom fixed navigation and safe-area behavior | No Base UI need | High | Keep custom. Do not migrate. |

## 4. Migration Classification

### Already Migrated

- Tooltip
- Switch
- Checkbox
- Tabs

### Migrate Next

- Wave 0 dependency and policy verification.
- One low-risk field/form primitive pilot, limited to a single non-critical surface.

### Migrate Later

- `VisibilitySelector` to a Base UI radio primitive, only after field/form pilot success.
- `StatusMessage` / `Toast` only after a feedback semantics audit.
- One isolated `ActionMenu` surface to Base UI Menu after dedicated approval.

### Audit First

- `ActionMenu` global migration.
- `ResponsiveDialog`, `Modal`, `BottomSheet`.
- Places subtype filter.
- Search/Combobox-like behavior.
- Select/dropdown-like behavior.
- Rating controls.
- Toast/status feedback if replacing live region behavior.

### Keep Custom For Now

- `RatingControl`
- bottom navigation/app shell
- `VirtualList`
- `Button`, `Badge`, `Chip`, `Card`
- `PlaceImage`, `PlaceTypeIcon`
- `RatingDisplay`
- `BidiText`, `NumberText`
- `LoadingState`, `EmptyState`

### Should Not Be Migrated Unless A Future Feature Requires It

- Combobox. The current app has searchboxes, not a true suggestion combobox.
- Select. Current selectors are either tabs, radios, or bottom-sheet filters.
- Navigation. Base UI should not replace app routing or bottom navigation.

## 5. Recommended Migration Waves

### Wave 0: Dependency And Policy Verification

Scope:

- Confirm `@base-ui/react` stays installed.
- Confirm Radix remains absent.
- Confirm Base UI imports are only expected primitives.
- Update migration inventory if new UI primitives were added.

Likely files affected:

- E2E dependency policy tests
- migration reports only

Base UI primitive involved:

- None

Acceptance criteria:

- Radix dependency test passes.
- No new primitive migration.
- Inventory matches current code.

Required tests:

- `npm run test:e2e`
- dependency policy test

Required screenshots:

- None unless UI changes are introduced. UI changes should not be introduced in this wave.

Production smoke requirements:

- Not required beyond normal CI for docs/tests-only changes.

Rollback plan:

- Revert the single docs/tests PR.

Risk level:

- Low

### Wave 1: Field/Form Primitive Pilot

Scope:

- Evaluate Base UI field/form primitives against the existing `Field`, `TextInput`, and `TextArea` contract.
- If the Base UI primitive improves semantics without behavior drift, migrate exactly one low-risk field.
- Do not migrate auth forms first.

Likely files affected:

- `frontend/src/components/ui/Input.tsx` or a new `BaseField` wrapper
- one low-risk usage site, selected during the wave
- E2E test for label/error/helper semantics

Base UI primitive involved:

- Field/Form primitive if supported and appropriate

Acceptance criteria:

- Label association preserved.
- `aria-describedby` composition preserved.
- Error `role="alert"` behavior preserved.
- Arabic labels preserved.
- No validation rule changes.

Required tests:

- focused E2E for accessible name, helper text, error text
- no Radix dependency test

Required screenshots:

- target form before/after
- 320x568
- 390x844
- focused/error state if applicable

Production smoke requirements:

- read-only if possible
- if the chosen field requires mutation, defer or use an isolated test account with cleanup

Rollback plan:

- Restore the previous field usage and remove the wrapper.

Risk level:

- Low-Medium

### Wave 2: Radio/Visibility Selector Pilot

Scope:

- Consider migrating `VisibilitySelector` from native radio fieldset to a Base UI radio primitive.
- Keep list visibility behavior unchanged.
- Do not mix with dialog migration.

Likely files affected:

- `frontend/src/features/lists/VisibilitySelector.tsx`
- list create/edit E2E specs

Base UI primitive involved:

- RadioGroup or equivalent, if Base UI API is suitable

Acceptance criteria:

- Public/private values unchanged.
- Native form semantics or equivalent screen-reader semantics preserved.
- Keyboard radio behavior works.
- Visibility update remains allowed for system lists.

Required tests:

- create list visibility selection
- edit list visibility selection
- system-list visibility update remains available
- no Radix dependency test

Required screenshots:

- create/edit list dialog with selector
- focused radio state
- 320x568 and 390x844

Production smoke requirements:

- avoid production mutation unless approved; otherwise verify in staging/local only

Rollback plan:

- Restore native radio implementation.

Risk level:

- Medium

### Wave 3: Feedback Surface Audit Or Migration

Scope:

- Audit `StatusMessage` and `Toast`.
- Decide whether Base UI Toast/Alert primitives add value.
- If migration is approved, migrate one non-critical feedback surface only.

Likely files affected:

- `frontend/src/components/ui/StatusMessage.tsx`
- `frontend/src/components/ui/Toast.tsx`
- one usage site

Base UI primitive involved:

- Toast or Alert-like primitive if appropriate

Acceptance criteria:

- `role="status"` and `role="alert"` parity.
- `aria-live` parity.
- Undo action behavior unchanged.
- No duplicate announcements.

Required tests:

- status/error announcements
- toast with action where applicable
- no Radix dependency test

Required screenshots:

- success/error/notice states
- toast with action
- mobile after state

Production smoke requirements:

- verify a read-only status if possible; mutation surfaces require cleanup.

Rollback plan:

- Restore custom feedback component.

Risk level:

- Medium

### Wave 4: Popover Audit And Optional Pilot

Scope:

- Find a genuinely supplementary, non-essential Popover target.
- Do not use Popover for mobile-essential actions.
- Do not replace places subtype filtering unless separately approved.

Likely files affected:

- target-specific component only
- E2E for open/close/focus/RTL placement

Base UI primitive involved:

- Popover

Acceptance criteria:

- Supplementary content only.
- Keyboard open/close works.
- Escape/outside click works.
- No bottom-nav collision.
- Tooltip remains supplementary; Popover must not become a hidden required action path.

Required tests:

- trigger accessible name
- open/close
- Escape
- outside click
- focus return
- no Radix dependency test

Required screenshots:

- 320x568 open state
- 390x844 open state
- focused trigger/content state
- collision-sensitive placement if near viewport edge

Production smoke requirements:

- read-only verification only.

Rollback plan:

- Restore previous inline/helper UI.

Risk level:

- Medium-High

### Wave 5: Base UI Menu Pilot

Scope:

- Migrate exactly one isolated `ActionMenu` surface to Base UI Menu.
- Do not migrate all menus.
- Do not mix with Dialog migration.

Likely files affected:

- `frontend/src/components/ui/ActionMenu.tsx` only if wrapper-level migration is selected, or a new `BaseActionMenu` wrapper and one usage site
- one representative E2E spec

Base UI primitive involved:

- Menu

Acceptance criteria:

- Existing action labels/order preserved.
- Destructive styling preserved.
- Enter/Space/Escape/Arrow/Home/End behavior meets `ACTIONMENU_ACCESSIBILITY_CONTRACT.md`.
- Focus returns to trigger.
- No action fires during navigation tests.

Required tests:

- trigger accessible name
- open with click/keyboard
- arrow navigation
- Escape
- outside click
- focus return
- no Radix dependency test

Required screenshots:

- closed state
- open state
- focused item
- 320x568 and 390x844

Production smoke requirements:

- safe representative surface only
- no destructive action execution

Rollback plan:

- Restore custom `ActionMenu` usage for that surface.

Risk level:

- High

### Wave 6: Menu Rollout By Surface

Scope:

- After Wave 5 succeeds, migrate remaining menus one surface per PR.
- Suggested order: profile, place detail, list detail, list item actions.

Likely files affected:

- `ProfileArchivePage.tsx`
- `PlaceDetailPage.tsx`
- `frontend/app/lists/[id]/page.tsx`
- `ActionMenu.tsx` if shared wrapper is already stable

Base UI primitive involved:

- Menu

Acceptance criteria:

- Surface-specific actions unchanged.
- Ownership visibility unchanged.
- Confirmation/dialog handoff unchanged.
- Destructive actions still require existing confirmation where applicable.

Required tests:

- one focused E2E per migrated surface
- existing product flow tests unchanged
- no Radix dependency test

Required screenshots:

- each surface open/focus/mobile state

Production smoke requirements:

- safe open/close/keyboard smoke only
- no destructive action execution

Rollback plan:

- Revert the surface-specific PR.

Risk level:

- High

### Wave 7: Dialog / ResponsiveDialog Audit

Scope:

- Audit custom `Modal`, `BottomSheet`, `ResponsiveDialog` behavior before migration.
- No implementation migration in this wave.
- Document focus trap, inert handling, scroll lock, confirm-close, mobile sheet behavior, and iOS Safari behavior.

Likely files affected:

- audit report
- optional tests for current dialog contract

Base UI primitive involved:

- None, or Dialog only for API comparison without use

Acceptance criteria:

- Every dialog usage inventoried.
- Mobile sheet requirements documented.
- Focus trap and restore contract documented.
- Stop/go decision made for Base UI Dialog.

Required tests:

- current dialog contract tests if gaps exist
- no Radix dependency test

Required screenshots:

- existing modal and bottom-sheet states at mobile and desktop

Production smoke requirements:

- read-only dialog open/close where possible
- no mutation unless approved and cleaned up

Rollback plan:

- Revert audit/test-only PR.

Risk level:

- Medium for audit, high for any migration

### Wave 8: Dialog / ResponsiveDialog Pilot If Approved

Scope:

- Migrate one low-risk dialog only if Wave 7 approves a target.
- If no low-risk target exists, skip this wave.
- Do not migrate bottom-sheet behavior unless explicitly covered.

Likely files affected:

- one dialog component
- `Dialog.tsx` or new Base UI dialog wrapper
- E2E tests for that dialog

Base UI primitive involved:

- Dialog

Acceptance criteria:

- Focus trap parity.
- Initial focus parity.
- Escape close parity.
- unsaved-change/confirm-close behavior preserved where applicable.
- Mobile bottom-sheet behavior preserved or explicitly not changed for the target.

Required tests:

- keyboard open/close
- focus trap
- focus restore
- Escape
- close button accessible name
- no Radix dependency test

Required screenshots:

- dialog open mobile/desktop
- focused control
- bottom-sheet state if applicable

Production smoke requirements:

- target-specific open/close smoke
- mutation only with approved smoke cleanup

Rollback plan:

- Restore previous custom dialog for that target.

Risk level:

- High

### Wave 9: Select / Combobox Future Decision

Scope:

- Do not implement Select or Combobox unless a real product need appears.
- Current app mostly uses tabs, radios, searchboxes, and bottom-sheet filters.
- Any future Select/Combobox work requires dedicated audit first.

Likely files affected:

- future feature-specific files only

Base UI primitive involved:

- Select or Combobox only if justified

Acceptance criteria:

- Product need documented.
- Native or existing simpler controls are insufficient.
- Mobile behavior validated.
- Search suggestions do not alter API/product behavior unexpectedly.

Required tests:

- complete keyboard and screen-reader behavior
- mobile interaction tests
- no Radix dependency test

Required screenshots:

- open state
- keyboard focus state
- mobile collision state

Production smoke requirements:

- depends on future feature

Rollback plan:

- Revert feature-specific PR.

Risk level:

- High

## 6. Proposed Order

Recommended order:

1. Wave 0: dependency and policy verification.
2. Wave 1: one low-risk field/form primitive pilot.
3. Wave 2: radio/visibility selector pilot if Wave 1 proves stable.
4. Wave 3: feedback surface audit or one feedback migration.
5. Wave 4: Popover only if a safe non-critical target exists.
6. Wave 5: one Base UI Menu pilot.
7. Wave 6: menu rollout by surface, one PR per surface.
8. Wave 7: Dialog/ResponsiveDialog audit.
9. Wave 8: one Dialog/ResponsiveDialog pilot only if approved.
10. Wave 9: Select/Combobox only if future product need exists.

This order keeps non-portaled, lower-risk primitives ahead of overlay, focus-trap, and complex mobile interaction primitives.

## 7. Components NOT To Migrate Yet

Do not migrate these in the next implementation PR:

- `ResponsiveDialog`
- `Modal`
- `BottomSheet`
- global `ActionMenu`
- places subtype filter bottom sheet
- `RatingControl`
- `SearchField` to Combobox
- app shell / bottom navigation
- file upload image management dialog
- auth forms
- create/edit/delete mutation dialogs

Rationale:

- These surfaces are core workflows or mutation paths.
- They carry focus management, scroll-lock, iOS Safari, or bottom-navigation risk.
- Several require production smoke with mutation cleanup.
- Current custom implementations are already tested and production-proven.

## 8. Risk Register

| Risk | Impact | Mitigation |
| --- | --- | --- |
| RTL regression | Arabic alignment, arrow behavior, or mixed text can break. | Use logical properties, screenshots at 320/390/430, and Arabic accessible labels. |
| iOS Safari visual viewport | Overlays can be clipped or positioned under browser chrome/bottom nav. | Require mobile Safari or documented equivalent checks for overlay PRs. |
| Portal/z-index collision | Menus, tooltips, dialogs, and toasts can overlap incorrectly. | Follow `BASE_UI_LAYERING_POLICY.md` numeric layer scale. |
| Bottom nav collision | Overlay content can block fixed navigation. | Require open-state mobile screenshots near bottom viewport. |
| Focus trap regression | Dialog migration can trap or lose focus. | Audit first; E2E focus trap and focus restore tests required. |
| Product behavior regression | Component swaps can accidentally alter filtering, selection, or mutation rules. | Preserve API calls and state transitions; write parity tests. |
| Test brittleness | Keyboard/focus tests can become flaky if selectors are fragile. | Prefer role/name locators and deterministic mock data. |
| Dependency drift | Radix or duplicate primitive systems can enter via package updates. | Keep dependency policy E2E test and package-lock review. |
| Screenshot blind spots | Visual regressions can pass functional tests. | Require screenshot evidence for every visual migration. |
| Release smoke gaps | Authenticated or mutation smoke may be blocked by smoke data. | Use `PRODUCTION_SMOKE_RUNBOOK.md` and approved cleanup strategy. |

## 9. Accessibility Requirements

Every Base UI migration must preserve or improve:

- Arabic accessible names.
- correct roles and states.
- keyboard operation.
- visible focus states.
- focus return after close.
- screen-reader-safe live regions.
- touch targets of at least 44px where practical.
- no hidden keyboard traps.
- no required information available only by hover.
- existing EDR-002 rating `aria-valuetext` behavior.

For Menu/Dialog/Popover:

- Escape behavior must be tested.
- outside-click behavior must be tested.
- focus return must be tested.
- destructive action behavior must remain unchanged.

## 10. Arabic / RTL Requirements

Every migration must verify:

- Arabic copy remains Arabic-only unless product data is mixed-language.
- `dir="rtl"` behavior is preserved.
- Arabic labels are accessible names.
- arrows and alignment feel natural in RTL.
- mixed Arabic/English place names continue to use existing `BidiText` where applicable.
- Arabic numerals continue to use existing `NumberText` / numeral helpers where applicable.
- no horizontal overflow at 320px, 390px, and 430px.
- no clipped Arabic glyphs.

## 11. Mobile / iOS Safari Requirements

Every visual or interactive migration must verify:

- 320x568 viewport.
- 390x844 viewport.
- 430x932 viewport when the component can affect layout.
- safe-area padding is not broken.
- fixed bottom navigation remains reachable.
- overlays do not collide with bottom navigation.
- focus and keyboard states remain visible.
- no body scroll lock regression.
- no visual viewport clipping on iOS Safari or documented equivalent.

## 12. Testing Strategy

### E2E

Use Playwright role/name locators where possible:

- accessible names in Arabic.
- keyboard open/close/navigation.
- selected/checked/expanded states.
- URL/query behavior for route-like controls.
- no Radix dependency.
- no product behavior changes.

### Accessibility Checks

Each migration should include:

- role/name/state assertions.
- keyboard path assertions.
- focus restoration assertions for overlays.
- screen-reader live-region parity for feedback components.

### Screenshot Evidence

Every visual migration requires screenshots under `docs/qa-execution/<feature>/screenshots/`:

- before/after when practical.
- 320x568.
- 390x844.
- focused state.
- open overlay state if applicable.
- selected/checked state if applicable.

### Dependency Policy Checks

Keep:

- no `@radix-ui/`.
- no `radix-ui`.
- Base UI imports limited to approved primitives for each wave.

### Production Smoke

Production smoke must match wave risk:

- docs/tests-only waves: CI-only is acceptable.
- read-only UI waves: authenticated read-only smoke.
- mutation UI waves: approved smoke account only, with cleanup documented.
- overlay waves: include mobile RTL and no-horizontal-overflow checks.

## 13. Release Strategy

Release policy:

- one PR per wave.
- no broad rewrite.
- no Radix.
- no product behavior changes.
- no backend/API/database changes unless separately approved.
- every PR must pass frontend gates and backend repository gates.
- every visual PR must include screenshots.
- every overlay PR must follow `BASE_UI_LAYERING_POLICY.md`.
- every high-risk PR must include production smoke criteria before merge.

Required gates:

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run test:e2e`
- `python -m ruff format --check .`
- `python -m ruff check .`
- `python -m mypy app tests`
- `python -m pytest -q`

## 14. Stop / Go Criteria

### Go Criteria

Proceed with a wave only when:

- the target is isolated.
- the rollback is a single PR revert.
- product behavior parity is testable.
- Arabic/RTL behavior is covered.
- mobile screenshots are available.
- Radix remains absent.
- the target does not mix multiple complex primitives.

### Stop Criteria

Stop migration and keep the custom component when:

- Base UI would require changing product behavior.
- mobile/iOS Safari behavior cannot be verified.
- focus management becomes less predictable.
- a migration requires broad dialog/menu/select rewrites.
- production smoke cannot verify the changed surface.
- tests become brittle or must be weakened.
- Radix would be introduced as a dependency.
- the existing custom component is stable and Base UI does not provide a clear accessibility or maintenance benefit.

## 15. Final Recommendation

The full Base UI conversion is not safe to start as a single conversion effort. It is safe to continue only as a staged migration.

Recommended next action:

1. Run Wave 0 dependency and policy verification.
2. Then implement Wave 1 as a single low-risk field/form primitive pilot, only if Base UI Field/Form semantics improve or preserve the existing `Input.tsx` contract.
3. Keep Dialog, Menu, Select, Combobox, RatingControl, search, and bottom navigation out of the next implementation wave.

Final decision:

- Recommended total waves: 10.
- First implementation wave: Wave 0 dependency and policy verification, followed by Wave 1 field/form primitive pilot.
- Full conversion safe to start now: No, not as a full conversion. Safe only as the staged plan above.
