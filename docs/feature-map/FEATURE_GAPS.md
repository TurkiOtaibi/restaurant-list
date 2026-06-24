# سجل - Feature Gaps, Conflicts, and Ambiguities

Updated: 2026-06-24
Source of truth: current repository implementation, tests, and canonical docs after gap remediation.

## Summary

The objectively fixable gaps identified in the feature-map audit have been remediated or reclassified. The current open items are intentionally future roadmap items only.

Closed in this remediation:

- `GAP-001` decimal rating documentation alignment.
- `GAP-002` navigation documentation alignment to one Places page.
- `GAP-003` product-name drift handled through canonical notes and current docs.
- `GAP-004` public-list owner display name implemented.
- `GAP-005` profile archive clarified as `تقييماتك` only; no separate `triedPlaces` payload.
- `GAP-006` Add Place To List search now uses server-side `/places?q=...`.
- `GAP-007` obsolete duplicate-add `409` handling removed.
- `GAP-008` place description classified as reserved backend metadata.
- `GAP-009` `POST /ratings` now returns `201` on create and `200` on update/upsert.
- `GAP-010` API pagination docs aligned to `limit`/`offset`.
- `GAP-011` profile public-list summary remains acceptable beta behavior and is documented as a GA optimization candidate.
- `GAP-012` `/restaurants` and `/cafes` remain documented compatibility redirects.
- `GAP-013` frontend health service name updated.
- `GAP-017` validation is tracked as a release gate, not a product gap.

## Resolved Gaps

| Gap ID | Status | Resolution Evidence | Notes |
|---|---|---|---|
| GAP-001 | Closed | `docs/03-functional-requirements.md`; `docs/05-business-rules.md`; `docs/12-api-specification.md`; `docs/13-validation-rules.md`; `docs/14-edge-cases.md`; `docs/19-qa-strategy.md` | Rating is 1-10 in 0.5 increments. |
| GAP-002 | Closed | `docs/01-executive-summary.md`; `docs/03-functional-requirements.md`; `docs/07-user-flows.md`; `docs/08-screen-inventory.md`; `docs/09-information-architecture.md` | Primary nav is `قوائمي`, `الأماكن`, `صفحتي`. |
| GAP-003 | Closed | `frontend/app/layout.tsx`; `frontend/app/api/health/route.ts`; canonical notes in historical docs | Active product name is `سجل`; older reports are historical. |
| GAP-004 | Closed | `backend/app/modules/auth/models.py`; `backend/migrations/versions/20260624_0007_public_owner_display_names.py`; `backend/app/modules/lists/schemas.py`; `frontend/src/components/ui/ListCard.tsx`; `frontend/src/features/lists/PublicListDetailPage.tsx`; `backend/tests/api/test_sprint2.py`; `frontend/tests/e2e/sprint3-real.spec.ts` | Public list APIs expose `ownerDisplayName` only; no owner email or internal user id in public responses. |
| GAP-005 | Closed | `backend/app/modules/profile/schemas.py`; `backend/app/modules/profile/services.py`; `frontend/src/lib/api.ts`; `backend/tests/api/test_sprint2.py` | `userRatings` is canonical; `triedPlaces` removed from profile response. |
| GAP-006 | Closed | `frontend/app/lists/[id]/page.tsx`; `frontend/src/features/lists/AddPlaceDialog.tsx` | Dialog searches server-side with `/places?q=&limit=20&sort=rating_desc`. |
| GAP-007 | Closed | `frontend/src/features/lists/AddPlaceDialog.tsx`; `backend/tests/api/test_places_and_lists.py` | Duplicate list item remains backend-idempotent; frontend no longer expects conflict status. |
| GAP-008 | Closed | `docs/02-product-scope.md`; `docs/03-functional-requirements.md`; `docs/10-database-design.md`; `docs/feature-map/FEATURE_CATALOG.md` | Description is reserved backend metadata, not current create-place UI. |
| GAP-009 | Closed | `backend/app/api/ratings.py`; `backend/app/modules/ratings/services.py`; `backend/tests/api/test_sprint2.py`; `docs/12-api-specification.md` | Create path returns 201; repeated POST update path returns 200. |
| GAP-010 | Closed | `docs/12-api-specification.md`; `backend/app/core/schemas.py`; backend collection endpoints | Collections use `{data, meta}` with `limit`, `offset`, `total`, and `sort`. |
| GAP-011 | Closed for beta | `frontend/src/features/profile/ProfileArchivePage.tsx`; `docs/feature-map/GAP_RESOLUTION_PLAN.md` | Current client filtering is acceptable for beta; backend-owned visibility filter remains a GA optimization candidate. |
| GAP-012 | Closed | `frontend/app/restaurants/page.tsx`; `frontend/app/cafes/page.tsx`; `docs/09-information-architecture.md`; `docs/feature-map/FEATURE_CATALOG.md` | Compatibility redirects stay hidden from primary navigation. |
| GAP-013 | Closed | `frontend/app/api/health/route.ts`; `frontend/tests/e2e/health.spec.ts` | Service name is `sijil-frontend`. |
| GAP-017 | Closed as release gate | `frontend/tests/e2e/responsive-layout.spec.ts`; validation checklist in this task | Responsive validation remains required before release. |

## Remaining Roadmap Gaps

| Gap ID | Type | Priority | Area | Current Position | Recommended Future Action |
|---|---|---:|---|---|---|
| GAP-014 | Future enhancement | P3 | Public lists | Anonymous public-list browsing is not current behavior. Guests remain rejected. | Revisit only with privacy/security review and product approval. |
| GAP-015 | Future enhancement | P3 | Admin | No admin console/API exists. | Add only after moderation/operations policy is approved. |
| GAP-016 | Future enhancement | P3 | Place editing | Users can create places but cannot edit them. | Add a correction workflow only after shared-catalog ownership/moderation rules are defined. |

## Current Conflict Status

- Public list identity: resolved through `users.display_name` and public-safe `ownerDisplayName`.
- Profile archive: resolved; `تقييماتك` is the single tried/rating archive.
- Legacy routes: resolved; `/restaurants` and `/cafes` are compatibility redirects only.
- Rating precision: resolved; decimal half-step behavior is canonical.
- Pagination docs: resolved; no active API docs should instruct `page/pageSize`.

## Notes For Future Agents

- Historical design/audit docs may still quote older navigation or product-name decisions. They now include canonical status notes where most likely to mislead.
- Implementation should be treated as authoritative when a historical report conflicts with current feature-map docs.
- Do not implement `GAP-014`, `GAP-015`, or `GAP-016` without new product approval.
