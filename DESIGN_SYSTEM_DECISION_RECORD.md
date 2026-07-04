# Design System Decision Record

## 1. Executive Summary

The frontend will move gradually toward a Tailwind + shadcn + Base UI design-system model while preserving the existing Arabic-first, RTL-native, mobile-first application.

This is not approval for a broad rewrite. The current custom CSS tokens and custom UI primitives remain the production design system until individual components are migrated through small, reviewed PRs.

The preferred future direction is:

- Tailwind for utility composition and gradual implementation.
- shadcn infrastructure for generated, owned component source.
- Base UI for future complex interactive primitives.

Radix is not the preferred direction and must not be introduced unless explicitly approved for a specific exception.

## 2. Current UI Stack

Current frontend stack:

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS 4 infrastructure via `@tailwindcss/postcss`
- Existing plain CSS design tokens in `frontend/app/globals.css`
- Existing custom UI primitives under `frontend/src/components/ui`
- shadcn infrastructure via `frontend/components.json`
- shadcn style configured as `base-nova`
- `clsx` and `tailwind-merge` for the shadcn-compatible `cn` helper

Current exclusions:

- No Radix dependency.
- Base UI is not installed yet.
- No shadcn component is currently migrated into active UI.

## 3. Decision

Adopt a gradual design-system migration strategy:

1. Keep the existing CSS tokens and custom UI primitives stable.
2. Use Tailwind only where it improves consistency and reviewability.
3. Use shadcn as an owned-source component generation path, not as an uncontrolled component-library takeover.
4. Use Base UI for future complex interactive primitives after a dedicated pilot PR.
5. Avoid Radix as the default primitive foundation.
6. Migrate one component or small component family per PR.
7. Require screenshots, accessibility checks, RTL checks, and full gates for every UI migration.

## 4. Why Tailwind Was Introduced

Tailwind was introduced as infrastructure to support:

- Consistent utility-level styling.
- Gradual component implementation.
- Easier review of small visual changes.
- Reduced one-off CSS when building new isolated UI pieces.
- Future shadcn compatibility.

Tailwind does not replace the existing CSS token system. Existing tokens in `globals.css` remain authoritative for color, spacing, radius, safe-area behavior, bottom navigation policy, and dark theme semantics until deliberately changed.

## 5. Why shadcn Infrastructure Was Introduced

shadcn infrastructure was introduced because it supports an owned-source component model:

- Generated component code lives in this repository.
- Components can be adapted to Arabic/RTL/mobile constraints.
- The app is not locked into opaque third-party styling.
- Components can be adopted incrementally.
- The repository can enforce local accessibility and responsive behavior.

The first shadcn pilot was intentionally reduced to infrastructure only after the Radix-backed separator path was rejected.

## 6. Why Radix Is Not The Preferred Direction

Radix is not the preferred default direction because:

- The approved future stack is shadcn + Base UI.
- The project should avoid installing multiple primitive systems for the same component class.
- Interactive primitives affect accessibility, focus management, portals, mobile behavior, and RTL behavior; mixing foundations increases regression risk.
- The app already has custom dialog, menu, and action primitives that are production-proven.

Radix may only be introduced through explicit approval for a specific exception, with documented rationale, screenshots, accessibility evidence, and rollback scope.

## 7. Why Base UI Is The Future Direction For Complex Interactive Primitives

Base UI is the preferred future primitive foundation for complex interactions because:

- It aligns with the chosen shadcn + Base UI direction.
- It provides unstyled primitives that can be adapted to the existing dark Arabic-first design system.
- It supports a controlled migration where behavior, accessibility, and styling are owned in the repo.
- It avoids a large all-at-once design-system replacement.

Base UI is not installed yet. Its first use must be a dedicated pilot PR with one small, low-risk component or component family.

## 8. Migration Principles

Every UI migration must follow these principles:

- Preserve product behavior.
- Preserve Arabic copy and RTL layout.
- Preserve mobile-first interaction quality.
- Preserve iOS Safari safe-area and bottom navigation behavior.
- Preserve existing auth/session behavior.
- Preserve API contracts.
- Preserve accessibility contracts, including focus management and screen reader semantics.
- Prefer existing tokens before adding new ones.
- Use logical CSS properties where direction matters.
- Keep each PR small and reversible.
- Do not mix unrelated visual cleanup with component migration.

## 9. Allowed Migration Targets

Good early targets:

- Non-interactive visual primitives.
- Separator-like decorative primitives only if Base UI-backed or implemented without Radix.
- Badge-like presentational primitives if they can coexist with the existing `Badge`.
- Small helper utilities such as `cn`.
- Isolated cards or rows with existing behavior and strong screenshot coverage.
- Single-purpose display components with no state machine.

Allowed only after a successful Base UI pilot:

- Tooltip.
- Popover.
- Simple menu-like primitive.
- Form field wrappers.

## 10. Components To Avoid Migrating First

Do not migrate these first:

- `ResponsiveDialog`
- `ActionMenu`
- Dialogs and sheets
- Menus
- Popovers
- Selects
- Command palette
- Forms with validation
- Bottom navigation
- Auth pages
- Rating controls
- Upload/image management UI
- Wishlist/favorites mutation flows

These components carry higher regression risk because they involve focus management, mobile sheet behavior, keyboard interaction, portal behavior, API mutation, or core navigation.

## 11. Quality Gates For Every UI Migration

Every UI migration PR must pass:

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run test:e2e`
- `python -m ruff format --check .`
- `python -m ruff check .`
- `python -m mypy app tests`
- `python -m pytest -q`

Backend gates remain required even for frontend-only changes to catch repository-level regressions before release.

## 12. Screenshot Requirements

Every visual migration PR must include screenshot evidence.

Required mobile screenshots:

- 320x568
- 390x844
- 430x932

Required coverage:

- Default state.
- Empty state if applicable.
- Loading state if applicable.
- Error state if applicable.
- Focus/keyboard state if applicable.
- RTL Arabic layout.
- Mixed Arabic/English text where relevant.

Screenshots should be stored under the relevant `docs/qa-execution/.../screenshots/` directory.

## 13. RTL / Arabic Requirements

Every migration must preserve:

- `dir="rtl"` document behavior.
- Arabic-first copy.
- Natural Arabic text alignment.
- Correct mixed Arabic/English name rendering.
- Direction-aware arrows and icons.
- Logical spacing in RTL layouts.
- No horizontal overflow at mobile widths.
- No clipping of long Arabic or mixed-language names.

Use `BidiText`, `NumberText`, and existing Arabic numeral helpers where applicable.

## 14. Accessibility Requirements

Every migration must preserve or improve:

- Semantic heading order.
- Visible focus states.
- Keyboard operability.
- Touch targets of at least 44px where practical.
- Accessible button names in Arabic.
- Correct `aria-current` where applicable.
- Screen-reader-safe status/error messaging.
- Existing rating accessibility behavior.
- Dialog focus trapping and restore behavior for any future dialog work.
- Color contrast on dark surfaces.

No focus outline may be hidden without an accessible replacement.

## 15. Rollback Strategy

Each migration PR must be rollback-safe:

1. Keep the diff small.
2. Avoid cross-cutting refactors.
3. Avoid mixing dependency changes with multiple component migrations.
4. Document exact files changed.
5. If regression is found, revert the PR rather than patching unrelated screens.

For infrastructure changes:

- Revert the relevant merge commit.
- Run full gates.
- Verify public endpoints and smoke flows after redeploy.

For component migrations:

- Revert the component-specific PR.
- Confirm no shared token or global CSS change remains unless separately approved.

## 16. Future Phases

Recommended future sequence:

1. Base UI pilot PR:
   - Install Base UI only for one explicitly approved low-risk primitive.
   - Confirm no Radix dependency is introduced.
   - Include screenshots and full gates.

2. Presentational primitive pilot:
   - Candidate: Badge-like display primitive or another low-risk non-interactive component.
   - Must not replace all existing badges globally.

3. Isolated card/row migration:
   - Candidate: one repeated display-only row/card with stable behavior.
   - Include before/after screenshots at mobile widths.

4. Form field wrapper evaluation:
   - Only after presentational primitives are stable.
   - Must preserve Arabic validation copy and error semantics.

5. Interactive primitive evaluation:
   - Dialog/menu/select work is deferred until Base UI behavior is proven in simpler areas.
   - Any migration must include keyboard, focus, mobile sheet, and RTL evidence.

6. Design-token consolidation:
   - Only after multiple component migrations prove the token needs.
   - Do not remove existing tokens prematurely.

## Final Decision

Proceed with gradual Tailwind + shadcn infrastructure adoption, with Base UI as the future primitive direction and Radix excluded by default.

No broad UI rewrite is approved.

No Base UI migration is approved until a dedicated pilot PR.

Every component migration must be small, screenshot-backed, RTL-safe, accessibility-reviewed, and fully gated.
