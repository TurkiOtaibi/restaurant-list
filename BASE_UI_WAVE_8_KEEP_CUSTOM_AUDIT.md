# Base UI Wave 8 Keep-Custom Audit

## 1. Executive Summary

Wave 8 should not migrate additional primitives. It should explicitly preserve stable custom components that either have no meaningful Base UI equivalent or carry product-specific behavior that Base UI should not replace.

This audit closes a gap in the migration roadmap: not every UI primitive should migrate. Some components should remain custom because they encode domain behavior, Arabic/RTL handling, app-shell layout, image fallback behavior, virtualization, or simple presentational styling.

Final recommendation:

- Keep the audited components custom.
- Do not create Base UI wrappers for presentational components.
- Do not migrate `RatingControl` without a dedicated rating accessibility/product audit.
- Do not migrate app navigation or safe-area layout to Base UI.
- Continue Base UI adoption only for primitives where Base UI provides clear behavior/accessibility value.

Implementation safe to start:

- No implementation is recommended from this audit.

## 2. Current Base UI Adoption Status

Released Base UI primitives:

| Primitive | Current location | Status |
| --- | --- | --- |
| Tooltip | `frontend/src/components/ui/BaseTooltip.tsx` | Released |
| Switch | `frontend/src/components/ui/BaseSwitchPilot.tsx` | Released pilot |
| Checkbox | `frontend/src/features/profile/ProfileArchivePage.tsx` favorites picker | Released pilot |
| Tabs | `frontend/src/features/places/PlaceLibraryPage.tsx` places type control | Released pilot |

Audited as deferred or future-only:

- Field/Form
- Radio/Visibility
- Feedback/Toast
- Popover
- Menu
- Dialog/ResponsiveDialog
- Select/Combobox

Policy:

- Radix must remain absent.
- No broad rewrite.
- No component migration without clear behavior/accessibility benefit.
- Existing custom components remain authoritative unless a dedicated audit approves replacement.

## 3. Evidence Reviewed

Repository evidence:

- `frontend/src/components/ui/RatingControl.tsx`
- `frontend/src/components/ui/RatingDisplay.tsx`
- `frontend/src/components/ui/VirtualList.tsx`
- `frontend/src/components/ui/Button.tsx`
- `frontend/src/components/ui/Card.tsx`
- `frontend/src/components/ui/PlaceCard.tsx`
- `frontend/src/components/ui/ListCard.tsx`
- `frontend/src/components/ui/PlaceImage.tsx`
- `frontend/src/components/ui/PlaceTypeIcon.tsx`
- `frontend/src/components/ui/BidiText.tsx`
- `frontend/src/components/ui/NumberText.tsx`
- `frontend/src/components/ui/LoadingState.tsx`
- `frontend/src/components/ui/EmptyState.tsx`
- `frontend/src/components/ui/Badge.tsx`
- `frontend/src/components/ui/Chip.tsx`
- `frontend/src/components/AppNav.tsx`
- `frontend/app/globals.css`
- `BASE_UI_FULL_MIGRATION_MASTER_PLAN.md`

## 4. Keep-Custom Inventory

| Component / Surface | File path | Current role | Base UI equivalent | Recommendation |
| --- | --- | --- | --- | --- |
| `RatingControl` | `frontend/src/components/ui/RatingControl.tsx` | Domain-specific range rating control | No direct equivalent | Keep custom. Dedicated audit required for any change. |
| `RatingDisplay` | `frontend/src/components/ui/RatingDisplay.tsx` | Display-only rating formatter | No meaningful equivalent | Keep custom. |
| `VirtualList` | `frontend/src/components/ui/VirtualList.tsx` | Document-scroll virtualization | No equivalent | Keep custom. |
| `Button` / `ButtonLink` | `frontend/src/components/ui/Button.tsx` | Native button/link styling primitive | No need | Keep custom. |
| `Card` / `CardLink` | `frontend/src/components/ui/Card.tsx` | Presentational surfaces | No need | Keep custom. |
| `PlaceCard` | `frontend/src/components/ui/PlaceCard.tsx` | Domain card using image, rating, BidiText | No direct equivalent | Keep custom. |
| `ListCard` | `frontend/src/components/ui/ListCard.tsx` | Domain list summary card | No direct equivalent | Keep custom. |
| `PlaceImage` | `frontend/src/components/ui/PlaceImage.tsx` | Image with required type-icon fallback | No equivalent | Keep custom. |
| `PlaceTypeIcon` | `frontend/src/components/ui/PlaceTypeIcon.tsx` | Product visual identity by place type | No equivalent | Keep custom. |
| `BidiText` | `frontend/src/components/ui/BidiText.tsx` | Mixed Arabic/English isolation | No equivalent | Keep custom. |
| `NumberText` | `frontend/src/components/ui/NumberText.tsx` | Arabic/local numeral display wrapper | No equivalent | Keep custom. |
| `LoadingState` | `frontend/src/components/ui/LoadingState.tsx` | App-specific skeleton/loading pattern | No need | Keep custom. |
| `EmptyState` | `frontend/src/components/ui/EmptyState.tsx` | App-specific empty-state pattern | No need | Keep custom. |
| `Badge` / `Chip` | `frontend/src/components/ui/Badge.tsx`, `Chip.tsx` | Presentational labels | No need | Keep custom. |
| App navigation | `frontend/src/components/AppNav.tsx`, `frontend/app/globals.css` | Fixed nav, routing, safe-area handling | No Base UI target | Keep custom. |

## 5. Component-by-Component Rationale

### RatingControl

Current behavior:

- Native `input type="range"`.
- Values from 1 to 10 with 0.5 step.
- Product-specific star visualization.
- `aria-valuetext` follows existing rating accessibility behavior.
- Shows live value, helper/consequence message, and validation error.

Why keep custom:

- Base UI has no direct rating primitive.
- Replacing it would risk EDR-002 rating accessibility behavior.
- Rating behavior is product-critical.

Future rule:

- Do not modify without a dedicated rating accessibility/product audit.

### RatingDisplay

Current behavior:

- Display-only formatter.
- Uses `NumberText`.
- Supports average and out-of-ten variants.

Why keep custom:

- It is not interactive.
- Base UI has no useful equivalent.

### VirtualList

Current behavior:

- Custom document-scroll virtualization.
- Renders full list below threshold.
- Measures variable row heights.
- Preserves scroll height with spacer blocks.

Why keep custom:

- Base UI has no virtualization primitive.
- It is performance infrastructure, not a design-system interaction primitive.
- Replacing it risks scroll behavior regressions.

### Button / ButtonLink

Current behavior:

- Native button/link elements.
- App-specific variants.
- Loading state with `aria-busy` and polite screen-reader status.

Why keep custom:

- Base UI is not needed for basic native button/link styling.
- Replacing would add no accessibility value.

### Cards, PlaceCard, ListCard

Current behavior:

- Presentational cards and links.
- Domain-specific place/list metadata.
- Uses `BidiText`, `PlaceImage`, and `RatingDisplay`.

Why keep custom:

- These are not Base UI behavior primitives.
- They encode product presentation and routing.

### PlaceImage / PlaceTypeIcon

Current behavior:

- `PlaceImage` renders uploaded image when present.
- Falls back to `PlaceTypeIcon` when missing or image load fails.
- Uses direct `<img>` intentionally for deploy-time storage URLs and `onError` fallback.

Why keep custom:

- Mandatory fallback behavior is product-specific.
- Base UI has no equivalent.

### BidiText / NumberText

Current behavior:

- `BidiText` uses `<bdi dir="auto">` for mixed Arabic/English names.
- `NumberText` centralizes numeric display behavior.

Why keep custom:

- These are Arabic/RTL infrastructure components.
- Base UI should not replace locale/text-direction helpers.

### LoadingState / EmptyState

Current behavior:

- App-specific loading and empty-state patterns.
- Arabic copy and visual layout are product-level UI.

Why keep custom:

- No Base UI behavior benefit.
- Migration would be visual redesign, not primitive adoption.

### Badge / Chip

Current behavior:

- Presentational status/label elements.

Why keep custom:

- No interaction semantics need Base UI.
- Future styling changes can happen through CSS/Tailwind without Base UI.

### AppNav / App Shell

Current behavior:

- Next.js links.
- Fixed bottom navigation on mobile.
- Safe-area padding through CSS variables and `env(safe-area-inset-*)`.
- `aria-current="page"` for active route.

Why keep custom:

- Base UI should not own routing or app-shell navigation.
- Bottom navigation and safe-area behavior are high-risk and product-specific.

## 6. Migration Classification

| Classification | Components |
| --- | --- |
| Keep custom permanently unless product changes | `BidiText`, `NumberText`, `PlaceImage`, `PlaceTypeIcon`, `RatingDisplay`, `VirtualList` |
| Keep custom; styling may evolve | `Button`, `ButtonLink`, `Badge`, `Chip`, `Card`, `CardLink`, `PlaceCard`, `ListCard`, `LoadingState`, `EmptyState` |
| Keep custom until dedicated audit | `RatingControl`, app navigation / bottom nav |
| Already covered by other audits | `StatusMessage`, `Toast`, `SearchField`, `VisibilitySelector`, Dialog/Menu/Popover/Select/Combobox surfaces |

## 7. Stop / Go Rules

### Stop Rules

Do not migrate a component to Base UI when:

- there is no Base UI equivalent.
- the component is presentational only.
- the component is product-domain rendering, not interaction behavior.
- the component handles Arabic/RTL text isolation or numerals.
- the component protects product-specific accessibility behavior.
- migration would be a redesign rather than a behavior/accessibility improvement.
- migration would weaken existing tests or production-proven behavior.

### Go Rules

Only consider migration when:

- Base UI provides a clear behavior or accessibility primitive.
- a dedicated audit identifies a target.
- migration is one PR and one surface.
- product behavior parity can be tested.
- screenshot evidence is required if visual output changes.
- Radix remains absent.

## 8. Required Tests If Any Future Change Touches These Components

If future work changes any keep-custom component, require:

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run test:e2e`
- backend repository gates if repository policy requires them

Additional targeted checks:

- `RatingControl`: role/name/value tests, `aria-valuetext`, keyboard/range behavior.
- `BidiText`: mixed Arabic/English containment.
- `NumberText`: numeral rendering.
- `PlaceImage`: image success, null fallback, broken-image fallback.
- `VirtualList`: small-list full render and large-list virtualization behavior.
- `AppNav`: active route, mobile safe-area, no horizontal overflow.

## 9. Screenshot Requirements

If future work visually changes these components:

- 320x568.
- 390x844.
- 430x932 where safe-area/bottom nav is involved.
- focused state if interactive.
- loading/empty/error states where relevant.
- RTL Arabic text examples.
- mixed Arabic/English examples for place/list cards.

## 10. Accessibility Requirements

Preserve:

- native button/link semantics.
- rating `aria-valuetext`.
- status/live-region semantics where used.
- `bdi dir="auto"` behavior.
- Arabic accessible names.
- focus visibility.
- touch target size where practical.
- `aria-current` in navigation.

## 11. RTL / Arabic Requirements

Preserve:

- Arabic copy.
- `BidiText` isolation.
- `NumberText` formatting.
- logical spacing.
- no clipped Arabic glyphs.
- no horizontal overflow.
- mobile-first layout.

## 12. Production Smoke Requirements

For this audit:

- no production smoke required.

For future changes:

- presentational-only changes require visual smoke.
- rating changes require authenticated smoke only if mutation is approved and cleanup is defined.
- navigation changes require mobile RTL smoke and no-horizontal-overflow checks.
- image/fallback changes require read-only image/null/broken fallback verification.

## 13. Rollback Strategy

For this audit:

- remove `BASE_UI_WAVE_8_KEEP_CUSTOM_AUDIT.md`.

For future accidental migration:

1. Revert the component to the current custom implementation.
2. Remove any unused Base UI imports.
3. Remove the primitive from dependency-policy allow-list if no longer used.
4. Keep `@base-ui/react` for released primitives.
5. Re-run full gates.

## 14. Final Recommendation

Final recommendation:

KEEP THESE COMPONENTS CUSTOM

Reason:

These components are stable app-specific primitives, product-domain renderers, or Arabic/RTL infrastructure. Base UI does not provide clear value for them today. Migrating them would increase risk without improving behavior.

Recommended next Base UI work:

1. Merge/release Wave 0 dependency and policy verification.
2. Continue with the approved staged waves only.
3. Keep this audit as a stop/go reference for future migration reviews.

Implementation safe to start from this audit:

- No.

