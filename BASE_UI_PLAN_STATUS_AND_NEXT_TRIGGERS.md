# Base UI Plan Status And Next Triggers

## 1. Purpose

This document records the current state of the Base UI migration plan after the staged audits, pilots, releases, and closure decisions.

It defines what is complete, what remains custom by decision, and what must happen before any future Base UI migration work starts.

## 2. Current Status

Current status:

**No additional Base UI implementation wave is approved right now.**

The repository should continue using the released Base UI primitives and keep the remaining high-risk or product-specific primitives custom until a new documented trigger exists.

## 3. Released Base UI Primitives

Released and accepted:

- Tooltip
- Switch
- Checkbox
- Tabs
- Field/Input
- Radio / RadioGroup
- Menu, limited to the approved system-list action-menu pilot

These primitives remain valid parts of the design-system direction.

## 4. Infrastructure Status

Current UI infrastructure:

- Next.js
- React
- TypeScript
- existing CSS tokens and custom primitives
- Tailwind infrastructure
- shadcn infrastructure
- `@base-ui/react`

Dependency policy:

- Radix remains disallowed.
- Do not add Radix without explicit approval.
- Do not use shadcn components that introduce Radix unless explicitly approved.

## 5. Completed Plan Artifacts

Key planning and policy artifacts now exist:

- `DESIGN_SYSTEM_DECISION_RECORD.md`
- `BASE_UI_FULL_MIGRATION_MASTER_PLAN.md`
- `BASE_UI_LAYERING_POLICY.md`
- `ACTIONMENU_ACCESSIBILITY_CONTRACT.md`
- `RESPONSIVEDIALOG_ACCESSIBILITY_CONTRACT.md`
- `CREATE_LIST_SMOKE_CLEANUP_POLICY.md`
- `SMOKE_ACCOUNT_BASELINE.md`
- `BASE_UI_DIALOG_DRAWER_STRATEGY_DECISION.md`
- `BASE_UI_CREATE_LIST_DIALOG_PILOT_REAUDIT.md`
- `BASE_UI_DIALOG_WAVE_CLOSURE_DECISION.md`

## 6. Closed Or Deferred Waves

### Dialog / Drawer

Status:

Closed with no implementation.

Current decision:

- Keep `ResponsiveDialog`, `Modal`, and `BottomSheet` custom.
- Do not add Base UI Dialog.
- Do not add Base UI Drawer.
- Do not add Base UI Alert Dialog.

Trigger to reopen:

- explicit approval for one responsive strategy and one exact target.

### Select / Combobox

Status:

Deferred.

Reason:

- Native selects are currently adequate.
- Search fields are not true comboboxes.
- The closest combobox-like surfaces are inside dialogs or mutation flows.

Trigger to reopen:

- a real product requirement for suggestion-list selection or custom select behavior.

### Keep-Custom Components

Status:

Intentionally custom.

Includes:

- `RatingControl`
- `RatingDisplay`
- `VirtualList`
- `PlaceImage`
- `PlaceTypeIcon`
- `BidiText`
- `NumberText`
- app shell / bottom navigation
- presentational buttons, badges, chips, and cards

Trigger to reopen:

- dedicated audit showing Base UI provides clear behavior or accessibility value without product behavior change.

## 7. Not Approved Without New Decision

Do not start these without a new reviewed decision:

- global `ActionMenu` migration.
- global `ResponsiveDialog` migration.
- Dialog / Drawer implementation.
- Alert Dialog implementation.
- Select implementation.
- Combobox / Autocomplete implementation.
- `RatingControl` changes.
- search-to-combobox conversion.
- bottom navigation migration.

## 8. Future Work Triggers

A future Base UI PR may start only when one of these triggers exists:

1. Product approves a specific new interaction need.
2. Accessibility audit finds a specific current primitive defect.
3. A custom primitive becomes hard to maintain and Base UI has a direct equivalent.
4. A small, isolated target can be migrated with no product behavior change.
5. Release smoke can verify the changed surface safely.

Without one of these triggers, do not migrate more components.

## 9. Required Future PR Shape

Every future Base UI PR must be:

- one primitive.
- one surface or one narrowly scoped shared wrapper.
- screenshot-backed if visible.
- Arabic / RTL safe.
- mobile and safe-area verified.
- accessibility reviewed.
- fully gated.
- no Radix.
- no backend/API/auth/database changes unless separately approved.

## 10. Required Gates

Future implementation gates:

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run test:e2e`
- `python -m ruff format --check .`
- `python -m ruff check .`
- `python -m mypy app tests`
- `python -m pytest -q`

Docs-only gates may use scope validation instead of full runtime gates when no code changes exist.

## 11. Production Smoke Rules

Read-only UI changes:

- authenticated read-only smoke where relevant.

Mutation UI changes:

- approved smoke account only.
- documented cleanup strategy.
- cleanup completed before final release verdict.

Create-list future work:

- follow `CREATE_LIST_SMOKE_CLEANUP_POLICY.md`.

System wishlist baseline:

- follow `SMOKE_ACCOUNT_BASELINE.md`.

## 12. Current Next Action

Current next action:

**Wait for a new product or engineering trigger before implementing another Base UI wave.**

Useful non-implementation work may still continue:

- review this status.
- maintain policy docs.
- update dependency-policy tests if dependencies change.
- add tests for existing custom primitives only when a concrete gap is found.

## 13. Final Recommendation

Final recommendation:

**Pause Base UI implementation work at the current migration boundary.**

The plan has been followed through the safe released pilots and the documented high-risk audits. Continuing without a new trigger would increase risk without a clear product or accessibility benefit.

Implementation safe to start right now:

**No.**
