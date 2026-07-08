# iOS Safari PWA Install Smoke Checklist

Date created: 2026-07-08

## Purpose

This checklist closes the remaining manual verification gap for the mobile-first PWA plan.

Automated evidence already verifies:

- Manifest route and manifest link.
- Service worker runtime registration.
- Offline fallback on a production build.
- WebKit mobile route smoke at a 390px iPhone-like viewport.

This checklist must be run on a real iPhone because Playwright WebKit is not a complete substitute for iOS Safari install/open behavior.

## Required Inputs

- Production or release-candidate frontend URL.
- iPhone with Safari.
- Network connection that can be turned off or switched to Airplane Mode.
- Optional approved smoke account credentials if authenticated pages are included.

Do not use personal accounts for authenticated release smoke. Use only the approved smoke account policy.

## Preconditions

Before running this checklist:

1. Confirm the release candidate build has passed:
   - `npm run lint`
   - `npm run typecheck`
   - `npm run build`
   - `npm run test:e2e`
   - backend gates when backend is included
2. Confirm local or CI PWA runtime verification passed:
   - `npm run test:pwa-runtime`
3. Confirm the root HTML exposes:
   - `<link rel="manifest" href="/manifest.webmanifest">`
4. Confirm `/manifest.webmanifest` returns `application/manifest+json`.

## Test Device Matrix

Minimum required:

- One modern iPhone Safari run.

Preferred:

- Small iPhone viewport.
- Large iPhone viewport.
- One run with low battery mode disabled.

## Install Flow

1. Open Safari on iPhone.
2. Navigate to the frontend URL.
3. Confirm the root page loads.
4. Confirm the page direction is RTL visually.
5. Tap Safari Share.
6. Choose `Add to Home Screen`.
7. Confirm:
   - App name is shown as `سجل`.
   - Icon is visible and not blank.
   - The preview does not show a broken icon.
8. Add the app to the home screen.
9. Launch the app from the home screen icon.

Expected result:

- App opens in standalone display mode, not as a normal Safari tab.
- Status bar and theme color feel consistent with the dark app shell.
- Root page loads without horizontal overflow.

## App Shell Smoke

From the installed PWA:

1. Open `/`.
2. Open `/places?type=restaurant`.
3. Open `/lists/public`.
4. Open `/health`.
5. Open `/profile`.

Expected result for each route:

- Page renders in RTL.
- No horizontal overflow.
- Bottom navigation does not cover content.
- Safe-area/home-indicator spacing is acceptable.
- Tap targets remain reachable.
- Text does not overlap controls.

## Offline Smoke

1. Open the installed PWA while online.
2. Let the first page finish loading.
3. Enable Airplane Mode or disable network.
4. Navigate to a new route that was not intentionally loaded during this run.

Expected result:

- The branded offline fallback appears.
- Heading reads: `أنت غير متصل`.
- The page remains RTL.
- The fallback has no horizontal overflow.
- The fallback action back to the app is visible and tappable.

## Reopen Smoke

1. Force-close the installed PWA.
2. Reopen it from the home screen.
3. Confirm the app opens to a valid page.
4. Toggle network off/on and reopen again.

Expected result:

- App does not show a blank white screen.
- App shell remains stable.
- No permanent loading state is shown.

## Authenticated Optional Smoke

Run only if approved credentials are available.

1. Log in with the approved smoke account.
2. Open `/profile`.
3. Open `/lists`.
4. Open `/places`.
5. Open a place detail if available.

Expected result:

- Session works inside standalone PWA.
- Private data belongs only to the approved smoke account.
- No real user data is mutated.

## Failure Criteria

Mark the iOS Safari PWA smoke as failed if any of these occur:

- App cannot be added to the home screen.
- Home screen icon is missing or broken.
- Installed launch opens as a normal Safari tab instead of standalone.
- Root page or primary public routes show horizontal overflow.
- Bottom navigation covers core content.
- Offline fallback does not appear after service worker registration.
- Offline fallback is not Arabic/RTL.
- App reopens to a blank page or unrecoverable loading state.
- Authenticated smoke mutates real user data.

## Evidence To Capture

Capture screenshots or short screen recordings for:

- Add to Home Screen preview.
- Installed home screen icon.
- Standalone app root page.
- `/places?type=restaurant`.
- `/lists/public`.
- Offline fallback.
- Any failure state.

## Release Decision

PWA release can be considered verified on iOS only when:

- Automated PWA runtime smoke passed.
- This real-device checklist passed.
- Any failures are documented and either fixed or explicitly accepted as non-blocking by product/release owner.

If the checklist cannot be run because no iPhone is available, the release state should say:

```text
iOS Safari install/open smoke: NOT VERIFIED
```

Do not claim real-device iOS verification from Playwright WebKit alone.
