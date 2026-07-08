# PWA Runtime Verification Report

Date: 2026-07-08

## Scope

This report verifies the mobile PWA foundation for the current local production build.

Verified areas:

- Manifest link exposure from the root HTML.
- Manifest route availability and content type.
- Service worker registration in production mode.
- Offline navigation fallback.
- WebKit mobile RTL/no-horizontal-overflow smoke.
- Lighthouse evidence and known tool limitation.

## Local Production Setup

Build command:

```text
npm run build
```

Production server:

```text
npm run start -- --hostname localhost --port 3200
```

Runtime PWA smoke command:

```text
PWA_SMOKE_URL=http://localhost:3200 npm run test:pwa-runtime
```

## Results

### Manifest Link

Root HTML contains:

```html
<link rel="manifest" href="/manifest.webmanifest"/>
```

Manifest response:

- URL: `http://localhost:3200/manifest.webmanifest`
- Content-Type: `application/manifest+json`
- Includes app name, short name, `display: "standalone"`, `scope`, `start_url`, theme/background colors, icons, maskable icon, screenshots, and shortcuts.

### Service Worker And Offline Fallback

`npm run test:pwa-runtime` passed.

Observed result:

```json
{
  "baseUrl": "http://localhost:3200",
  "offlineHeading": "أنت غير متصل",
  "serviceWorker": {
    "ready": true,
    "registrations": 1,
    "supported": true
  },
  "status": "pass"
}
```

This proves:

- Service worker APIs are available.
- The service worker becomes ready in production mode.
- At least one service worker registration exists.
- A new navigation while offline receives the branded Arabic offline fallback.

### WebKit Mobile Smoke

WebKit mobile smoke passed with an iPhone 13 profile.

Routes checked:

- `/`
- `/places?type=restaurant`
- `/lists/public`
- `/health`
- `/profile`

For each route:

- HTTP status was `200`.
- `document.documentElement.dir` was `rtl`.
- No horizontal overflow was detected at `390px` viewport width.

### Lighthouse

Lighthouse v13 generated reports under:

- `docs/qa-execution/mobile-pwa-redesign/lighthouse/home-lighthouse.report.json`
- `docs/qa-execution/mobile-pwa-redesign/lighthouse/home-lighthouse.report.html`
- `docs/qa-execution/mobile-pwa-redesign/lighthouse/home-seo-lighthouse.report.json`

Extracted category scores from the generated Lighthouse v13 report:

- Performance: `73`
- Accessibility: `100`
- Best Practices: `100`
- SEO: `90`

Lighthouse v11 PWA report was also generated:

- `docs/qa-execution/mobile-pwa-redesign/lighthouse/home-pwa-lighthouse-v11.report.json`

Known Lighthouse CLI limitation in this environment:

- Lighthouse reports were generated, but the CLI exited with `EPERM` while deleting its temporary Chrome profile directory.
- Lighthouse v11 reported `Page has no manifest <link> URL` even after direct HTML, DOM, and manifest fetch verification proved the manifest link exists and is reachable.
- Because of that contradiction, the repeatable `test:pwa-runtime` script is the authoritative automated PWA runtime proof for service worker/offline behavior in this workspace.

## Remaining Verification Gap

This report does not replace a real-device iOS Safari install/open smoke.

Remaining manual verification:

- Install/open from iPhone Safari.
- Confirm standalone launch behavior.
- Confirm safe-area and bottom-nav behavior on the installed PWA.

Manual checklist:

- `docs/qa-execution/mobile-pwa-redesign/IOS_SAFARI_INSTALL_SMOKE_CHECKLIST.md`

## Verdict

PWA runtime behavior is verified locally on a production build.

The remaining PWA gap is real-device iOS Safari install/open verification.
