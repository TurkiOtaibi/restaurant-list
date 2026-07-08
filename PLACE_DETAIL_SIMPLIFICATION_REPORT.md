# Place Detail Simplification Report

## Summary

Applied the approved Place Detail visual simplification by removing the main-layout information card from the Place Detail page. The removed card showed the duplicated place type/subtype information under the heading "معلومات المكان". The core Place Detail data contract and backend behavior were left unchanged.

## What Was Removed

- Removed the `place-detail-info` panel from `frontend/src/features/places/PlaceDetailPage.tsx`.
- The removed panel displayed:
  - "معلومات المكان"
  - "نوع المكان"
  - "النوع الفرعي"

The requested labels "العنوان", "ساعات العمل", "المسافة", and "رابط الخرائط" are not present in the current Place Detail implementation or API response on this branch. The closest existing information card was the `place-detail-info` card, so only that main-layout card was removed.

## Why It Was Removed

The approved target layout is shorter and cleaner:

1. Hero card
2. Rating summary cards
3. Bottom navigation

Removing the duplicated information card tightens the page and avoids a secondary details block between the hero and rating summary.

## Files Changed

- `frontend/src/features/places/PlaceDetailPage.tsx`
- `frontend/tests/e2e/place-detail-simplification.spec.ts`
- `docs/qa-execution/place-detail-simplification/screenshots/place-detail-390x844.png`
- `docs/qa-execution/place-detail-simplification/screenshots/place-detail-320x568.png`
- `docs/qa-execution/place-detail-simplification/screenshots/place-detail-430x932.png`
- `PLACE_DETAIL_SIMPLIFICATION_REPORT.md`

## Behavior Preserved

- Public `/places/{id}` detail loading remains available without login.
- Hero card remains visible.
- Place title/category chips remain visible.
- Add-to-list and wishlist affordances remain present.
- Private actions still redirect unauthenticated users to login.
- Current-user rating card remains visible.
- Community rating card remains visible when rating data exists.
- Bottom navigation remains visible and usable.
- No backend, API, database, auth, rating, wishlist, list, or PWA caching behavior was changed.

## Screenshots

- `docs/qa-execution/place-detail-simplification/screenshots/place-detail-390x844.png`
- `docs/qa-execution/place-detail-simplification/screenshots/place-detail-320x568.png`
- `docs/qa-execution/place-detail-simplification/screenshots/place-detail-430x932.png`

Screenshots show the hero card, rating summary cards, bottom navigation, and no `place-detail-info` card.

## Tests Updated

Added `frontend/tests/e2e/place-detail-simplification.spec.ts`.

Coverage:

- Public Place Detail route loads without login.
- Hero card renders.
- Rating summary cards render.
- `place-detail-info` card is absent.
- Requested removed labels are absent:
  - "العنوان"
  - "ساعات العمل"
  - "المسافة"
  - "رابط الخرائط"
- Private actions still require login.
- Bottom navigation remains visible.
- Mobile viewports have no horizontal overflow.
- Screenshots captured at 320x568, 390x844, and 430x932.

## Quality Gate Results

- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run build`: PASS
- `PLAYWRIGHT_PORT=3107 E2E_API_PORT=8107 E2E_API_BASE_URL=http://localhost:8107 NEXT_PUBLIC_API_BASE_URL=http://localhost:8107 npm run test:e2e -- --reporter=line`: PASS, 78 passed
- `python -m ruff format --check .`: PASS
- `python -m ruff check .`: PASS
- `python -m mypy app tests`: PASS
- `python -m pytest -q`: PASS, 78 passed, 1 skipped

Focused precheck:

- `PLAYWRIGHT_PORT=3107 npm run test:e2e -- place-detail-simplification.spec.ts`: PASS, 2 passed

Local note: the default Playwright/API ports are occupied by unrelated local processes in this environment, so the full E2E gate was run with isolated frontend/API ports. No test behavior was changed.

## Dependency / Platform Impact

- Radix dependency added: no
- Backend changed: no
- API contract changed: no
- Database changed: no
- PWA/service worker changed: no

## Known Limitations

- The current Place Detail API response does not include a place-specific latest ratings/reviews feed. This PR does not invent or mock production UI for data that is not available in the current contract.
- The page now follows the approved simplification by removing the info card, but a true "آخر التقييمات" section would require a separate product/API decision if it is not already available in a future contract.

## Out of Scope

- RTL menu clipping
- Safari/PWA bottom safe-area tuning
- Data cleanup/test names
- Map/address product decisions
- Backend/API additions for place-specific latest ratings
