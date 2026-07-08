# Mobile PWA Redesign Implementation Status

Date: 2026-07-08

## Summary

The mobile-first PWA redesign plan is substantially implemented and locally verified.

Current estimated completion:

- Implementation: 90%
- Automated verification: complete for this environment
- Manual device verification: incomplete

The remaining hard verification gap is real-device iPhone Safari install/open smoke. Playwright WebKit and the local production PWA runtime smoke are useful evidence, but they do not prove iOS Safari Add to Home Screen behavior.

## Phase Status

| Phase | Status | Evidence |
| --- | --- | --- |
| Phase 0 - Baseline | Partially complete | Existing audit report and repeated screenshots/test outputs exist. A formal before/after baseline package was not fully preserved for every requested viewport. |
| Phase 1 - PWA foundation | Complete except real-device iOS smoke | `frontend/app/manifest.ts`, `frontend/public/service-worker.js`, `frontend/public/offline.html`, `frontend/src/components/PwaServiceWorkerRegistrar.tsx`, `frontend/scripts/pwa-runtime-smoke.mjs`, `PWA_RUNTIME_VERIFICATION_REPORT.md`. |
| Phase 2 - Mobile shell / safe areas | Implemented and tested locally | Safe-area CSS, skip link, bottom-nav updates, WebKit mobile no-horizontal-overflow smoke documented in `PWA_RUNTIME_VERIFICATION_REPORT.md`. |
| Phase 3 - App-level search | Implemented | Bottom nav includes `بحث`, `/places?type=restaurant&focus=search` focuses the search input, and `auth-gating.spec.ts` covers the search nav state. |
| Phase 4 - Public discovery / auth boundary | Implemented for agreed model | Public browsing is available for home, places, place detail, public lists, and public list detail. Protected actions still route to login. |
| Phase 5 - SEO / shareability | Implemented at baseline level | Route metadata and OG/Twitter fallback metadata exist for public route groups and public detail layouts. Advanced dynamic/share images are deferred. |
| Phase 6 - Core card redesign | Implemented at first pass | Place cards and list cards have poster/preview-forward styling and no fake action affordance on plain list cards. |
| Phase 7 - Profile experience | Implemented | `/profile` now shows a capped recent ratings preview with `/profile/ratings` archive route. Profile E2E passed. |
| Phase 8 - Rating/review experience | Partially implemented | RatingControl keeps EDR-002 `aria-valuetext`, adds visible scale endpoints and stronger active feedback. Deeper rating copy/ARIA changes require EDR/product approval. |
| Phase 9 - Accessibility / semantics sweep | Partially implemented | Skip link, ActionMenu coverage, virtual list semantics, profile rating list semantics, and focused tests exist. Further screen reader/manual audit remains useful. |
| Phase 10 - Performance / Core Web Vitals | Partially verified | Virtualized lists, lazy images, Lighthouse reports, and PWA runtime smoke exist. Performance score still has room for improvement. |
| Phase 11 - Design system hardening | Partially implemented | Tokens and components are improved, but broad CSS modularization is intentionally deferred. |
| Phase 12 - Dialog / sheet consistency | Already strengthened by Base UI dialog waves | ResponsiveDialog and BottomSheet behavior remain staged; no global replacement was done. |
| Phase 13 - Final QA / acceptance | Not complete | Automated gates have passed in focused and previous broad runs. Real-device iOS Safari install/open smoke remains missing. |

## Verification Run In This Continuation

Commands run:

```text
npm run lint
npm run typecheck
npm run build
PLAYWRIGHT_PORT=3100 E2E_API_PORT=8100 npm run test:e2e -- profile-phase-1.spec.ts
PLAYWRIGHT_PORT=3100 E2E_API_PORT=8100 npm run test:e2e -- ui-polish-pr-findings.spec.ts --timeout=120000
PLAYWRIGHT_PORT=3100 E2E_API_PORT=8100 npm run test:e2e
python -m ruff format --check .
python -m ruff check .
python -m mypy app tests
python -m pytest -q
PWA_SMOKE_URL=http://localhost:3200 npm run test:pwa-runtime
```

Results:

```text
npm run lint: PASS
npm run typecheck: PASS
npm run build: PASS
profile-phase-1.spec.ts: PASS, 10 passed
ui-polish-pr-findings.spec.ts: PASS, 6 passed
full frontend E2E: PASS, 76 passed
python -m ruff format --check .: PASS
python -m ruff check .: PASS
python -m mypy app tests: PASS
python -m pytest -q: PASS, 78 passed, 1 skipped, 4 warnings
PWA runtime smoke: PASS
```

## Fixes Added In This Continuation

1. Fixed one real mojibake Arabic accessibility label in the virtualized profile ratings archive.
2. Added visible rating scale endpoints (`1/10` and `10/10`) to the rating control.
3. Added stronger active slider thumb feedback for rating interaction.
4. Preserved the EDR-002 English `aria-valuetext` contract exactly.
5. Fixed isolated E2E API port handling so `E2E_API_PORT` also drives the E2E API client and Playwright-launched frontend server.
6. Fixed E2E mock CORS origin fallback so non-default Playwright ports work.
7. Fixed real-API E2E helper fallback so non-default E2E API ports work.

## Remaining Required Evidence

Required before claiming full completion:

1. Real iPhone Safari Add to Home Screen smoke.
2. Standalone PWA launch from the iPhone home screen.
3. Offline fallback inside the installed iOS PWA.
4. Safe-area and bottom-nav check inside the installed iOS PWA.

Manual checklist:

```text
docs/qa-execution/mobile-pwa-redesign/IOS_SAFARI_INSTALL_SMOKE_CHECKLIST.md
```

## Remaining Product / Design Decisions

These are not blockers for the current implementation unless product marks them mandatory:

1. Whether to revise EDR-002 to allow Arabic localized rating `aria-valuetext`.
2. Whether to create branded OG/share image assets beyond the current icon fallback.
3. Whether to do a deeper long-form review UX pass if reviews become a larger product feature.
4. Whether to modularize the large global CSS file now or defer until visual direction stabilizes further.

## Current Verdict

Do not mark the full plan complete yet.

Reason:

```text
iOS Safari real-device install/open smoke is NOT VERIFIED.
```

The implementation is ready for final device verification and a final full-gate rerun.

Latest full local gates have passed. The remaining item is external manual device evidence, not an automated local gate.
