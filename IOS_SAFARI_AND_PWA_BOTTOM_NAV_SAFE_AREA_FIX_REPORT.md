# iOS Safari And PWA Bottom Nav Safe Area Fix Report

## Root Cause

The mobile bottom navigation was double-counting bottom spacing in a way that was especially visible in installed iOS PWA standalone mode:

- The page content clearance included `env(safe-area-inset-bottom)`.
- The fixed `.app-nav` also added `padding-block-end: env(safe-area-inset-bottom)`.
- The fixed `.app-nav` was additionally offset by `bottom: var(--space-2)`.
- The desktop `.app-nav` vertical padding leaked into the mobile fixed nav, making the fixed element taller than the visual nav.

In standalone iOS PWA mode, this produced a safe area plus visual gap below the nav. The home indicator was protected, but the visible result was excessive empty space under the bottom navigation.

## Safari Browser Mode Behavior

Safari browser mode must remain protected because the bottom browser toolbar can expand and collapse. The updated formula keeps a small visual bottom gap when `env(safe-area-inset-bottom)` is `0px`:

```css
--bottom-nav-offset: max(var(--bottom-nav-gap), var(--safe-bottom));
```

For normal browser mode, this keeps the bottom nav visible and usable without forcing a large standalone-style blank area.

## Installed PWA Standalone Behavior

Installed PWA standalone mode receives a non-zero `env(safe-area-inset-bottom)` on iPhones with a home indicator. The nav now uses that inset as the visual offset instead of adding the inset below the nav as transparent internal padding.

This keeps the nav clear of the home indicator while reducing the empty space below it.

## Files Changed

- `frontend/app/globals.css`
- `IOS_SAFARI_AND_PWA_BOTTOM_NAV_SAFE_AREA_FIX_REPORT.md`
- `docs/qa-execution/ios-safari-pwa-bottom-nav-safe-area/screenshots/*`

## Safe-Area Formula Used

Single source of truth:

```css
--safe-bottom: env(safe-area-inset-bottom, 0px);
--bottom-nav-height: 64px;
--bottom-nav-gap: var(--space-2);
--bottom-nav-offset: max(var(--bottom-nav-gap), var(--safe-bottom));
--bottom-nav-clearance: calc(var(--bottom-nav-height) + var(--bottom-nav-offset));
--mobile-shell-bottom-clearance: calc(var(--bottom-nav-clearance) + var(--space-4));
--mobile-shell-bottom-clearance-roomy: calc(var(--bottom-nav-clearance) + var(--space-6));
```

Usage:

- `.app-nav` is fixed at `bottom: var(--bottom-nav-offset)`.
- `.app-nav` no longer applies bottom safe-area padding internally.
- `.app-nav__links` owns the visual height via `--bottom-nav-height`.
- Page content and floating toast/prompt offsets use `--bottom-nav-clearance`.

## Before/After Screenshots

After screenshots were captured under:

- `docs/qa-execution/ios-safari-pwa-bottom-nav-safe-area/screenshots/places-320x568-after.png`
- `docs/qa-execution/ios-safari-pwa-bottom-nav-safe-area/screenshots/profile-320x568-after.png`
- `docs/qa-execution/ios-safari-pwa-bottom-nav-safe-area/screenshots/lists-320x568-after.png`
- `docs/qa-execution/ios-safari-pwa-bottom-nav-safe-area/screenshots/places-390x844-after.png`
- `docs/qa-execution/ios-safari-pwa-bottom-nav-safe-area/screenshots/profile-390x844-after.png`
- `docs/qa-execution/ios-safari-pwa-bottom-nav-safe-area/screenshots/lists-390x844-after.png`
- `docs/qa-execution/ios-safari-pwa-bottom-nav-safe-area/screenshots/places-430x932-after.png`
- `docs/qa-execution/ios-safari-pwa-bottom-nav-safe-area/screenshots/profile-430x932-after.png`
- `docs/qa-execution/ios-safari-pwa-bottom-nav-safe-area/screenshots/lists-430x932-after.png`

Automated viewport metrics after the fix:

- 320x568: no horizontal overflow; nav visual height `64px`; bottom gap `8px` in Chromium.
- 390x844: no horizontal overflow; nav visual height `64px`; bottom gap `8px` in Chromium.
- 430x932: no horizontal overflow; nav visual height `64px`; bottom gap `8px` in Chromium.

Chromium does not emulate iOS standalone safe-area values here, so physical iPhone verification is still required.

## Manual iPhone Checks Required/Completed

Completed locally:

- Automated responsive checks at 320x568, 390x844, and 430x932.
- `/places`, `/profile`, and `/lists` rendered without horizontal overflow.
- Bottom nav remained visible and usable in automated mobile viewport checks.

Still required manually on physical iPhone:

- Safari browser mode with bottom toolbar visible.
- Safari browser mode after toolbar expands/collapses.
- Installed PWA standalone mode from Home Screen.
- Last-item reachability on `/places`, `/profile`, and `/lists`.
- Home indicator clearance in standalone mode.

## Quality Gate Results

- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run build`: PASS
- `npm run test:e2e -- --reporter=line`: PASS, 76 passed
