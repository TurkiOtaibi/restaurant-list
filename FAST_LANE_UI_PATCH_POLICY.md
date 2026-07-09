# Fast-Lane UI Patch Policy

## Purpose

Fast-lane is a scoped release path for small frontend-only UI fixes. It reduces waiting time for low-risk changes while preserving test coverage, visual evidence, accessibility checks, and production verification.

Fast-lane does not skip E2E. It does not bypass CI. It does not weaken required checks.

## When Fast-Lane Is Allowed

Fast-lane may be used only when all of these are true:

- The change is frontend-only.
- The changed files are narrowly scoped to one page, component, stylesheet, test, or report area.
- There are no backend, API, database, migration, auth, or session changes.
- There are no service worker, PWA cache, manifest, offline, or installability changes.
- There is no public/private route access or authorization boundary change.
- The change does not create, update, delete, or migrate user data.
- There is no dependency change.
- Radix remains absent.
- Targeted E2E coverage for the affected surface passes.
- Existing relevant regression tests still pass.
- Screenshots are attached for visual changes.
- The production verification target is clear and can be checked without mutating real user data.

## When Full Release Workflow Is Required

Use the full release workflow for any of these:

- Auth or session behavior.
- Backend, API, database, migration, or data contract changes.
- PWA, service worker, cache strategy, offline behavior, or installability changes.
- Public/private route access, authorization, or permission boundary changes.
- Base UI Dialog or Menu core behavior changes.
- ResponsiveDialog, ActionMenu, or other global interaction primitive changes.
- Broad redesign or app-shell changes.
- Data mutation flows, destructive actions, or production smoke baseline changes.
- Dependency changes, including any Radix-related change.
- Any change where targeted verification cannot prove the affected risk.

## Required Gates For Small Frontend-Only UI Fixes

Fast-lane PRs must pass:

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- Targeted E2E specs for the changed surface.
- Full `npm run test:e2e` when the changed surface is shared, the selectors are reused, or the risk is not fully isolated.
- GitHub Actions CI.

Backend gates are not required for true frontend-only fast-lane patches unless backend files changed or the release owner explicitly requires repository-wide verification.

## Required Screenshots

Visual fast-lane PRs must include screenshots for:

- The affected page or component after the change.
- Mobile width `390x844`.
- `320x568` when the change affects mobile layout, overflow, bottom navigation, or action placement.
- `430x932` when practical for mobile UI changes.
- Open/active/focused states when the change affects menus, dialogs, controls, or keyboard state.

Screenshots should be saved under `docs/qa-execution/<change-name>/screenshots/`.

## Required Targeted Production Verification

After merge and CI success, fast-lane release verification should check only the affected production surface plus basic safety checks:

- The affected route loads.
- The changed UI is visible and correct.
- The affected interaction still works.
- No horizontal overflow on the relevant mobile viewport.
- Private actions still require login when applicable.
- No destructive action is executed.
- Radix remains absent when dependency policy is relevant.

## What Must Still Trigger Full Smoke

Run full production smoke when the change touches:

- Login, logout, auth gating, cookies, or session restoration.
- Public/private route access.
- Backend API behavior or data contracts.
- PWA cache, service worker, offline behavior, or manifest.
- App shell, bottom navigation, safe-area behavior, or global layout.
- Base UI Dialog/Menu core behavior or global primitives.
- Production smoke account baseline data.
- Any mutation flow that cannot be verified read-only.

## Examples

Fast-lane allowed:

- Fixing a single Place Detail button alignment issue with screenshots and targeted E2E.
- Removing an incorrect menu item from one scoped component.
- Correcting a non-global CSS spacing issue on one page.
- Updating a visual regression test for a scoped UI surface.

Full workflow required:

- Changing service worker caching.
- Changing login redirects or protected route behavior.
- Migrating a shared Dialog or Menu primitive.
- Adding or changing backend endpoints.
- Changing public browsing access.
- Changing bottom navigation safe-area logic.
- Introducing or removing package dependencies.

## Review Expectations

Fast-lane review must still verify:

- Scope is narrow.
- No unrelated files are included.
- No product behavior changed outside the target surface.
- Tests are meaningful and not weakened.
- Visual evidence matches the requested change.
- Production verification can be completed without real user data mutation.
