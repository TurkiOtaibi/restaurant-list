# سجل - Gap Resolution Plan

Updated: 2026-06-24
Scope: current remediation outcome and remaining roadmap sequencing.

## Executive Summary

Seventeen gaps were analyzed. Fourteen objectively fixable gaps are now closed or closed for beta. Three gaps remain intentionally out of scope as future roadmap items.

The public-beta blocking issues from the original plan have been addressed:

- Add Place To List search no longer depends on one loaded catalog page.
- Public-list owner identity has a safe display-name model.
- Rating API semantics are explicit: create returns 201; upsert update returns 200.
- Profile uses one canonical archive: `تقييماتك`.
- Legacy `/restaurants` and `/cafes` routes are compatibility redirects only.
- Canonical docs now reflect `سجل`, one Places page, 0.5 ratings, and `limit`/`offset` pagination.

## Resolution Summary

| Priority | Open Count | Closed Count | Notes |
|---|---:|---:|---|
| P0 | 0 | 0 | No emergency gaps existed. |
| P1 | 0 | 8 | All public-beta gaps closed. |
| P2 | 0 | 6 | GA cleanup gaps either fixed or intentionally classified. |
| P3 | 3 | 0 | Future roadmap only: anonymous public lists, admin, place editing. |

## Closed Gap Outcomes

| Gap ID | Category | Original Priority | Outcome | Complexity | Owner |
|---|---|---:|---|---|---|
| GAP-001 | Documentation mismatch | P1 | Closed. Decimal half-step rating documented across canonical docs. | Small | Docs + QA |
| GAP-002 | Documentation mismatch | P1 | Closed. Navigation docs aligned to `قوائمي`, `الأماكن`, `صفحتي`. | Small | Product + Docs |
| GAP-003 | Documentation mismatch | P1 | Closed. Current product name is `سجل`; historical docs marked accordingly. | Small | Product + Docs |
| GAP-004 | Product/API/Data model | P1 | Closed. `users.display_name` added; public lists expose `ownerDisplayName` only. | Medium | Mixed |
| GAP-005 | UX/API inconsistency | P2 | Closed. Profile response no longer returns separate `triedPlaces`; `userRatings` is canonical. | Small | Product + Backend + Frontend |
| GAP-006 | Frontend/UX issue | P1 | Closed. Add Place dialog uses server-side place search with pagination. | Medium | Frontend + QA |
| GAP-007 | Frontend contract drift | P2 | Closed. Obsolete duplicate-add `409` handling removed. | Small | Frontend |
| GAP-008 | Product/API inconsistency | P2 | Closed for beta. `description` is documented as reserved backend metadata. | Small | Product + Docs |
| GAP-009 | API inconsistency | P1 | Closed. `POST /ratings` returns 201 on create, 200 on update/upsert. | Medium | Backend + QA |
| GAP-010 | Documentation mismatch | P1 | Closed. API docs use `limit`, `offset`, `total`, and `sort`. | Small | Docs |
| GAP-011 | Technical debt | P2 | Closed for beta. Profile public-list filtering is acceptable at current scale; GA optimization noted. | Small | Product + Frontend |
| GAP-012 | Technical debt | P2 | Closed. Legacy restaurant/cafe routes kept as documented compatibility redirects. | Small | Product + Docs |
| GAP-013 | Technical debt | P2 | Closed. Frontend health service identifier updated to `sijil-frontend`. | Small | Frontend + Ops |
| GAP-017 | Testing gap | P1 | Closed as release gate. Responsive validation remains part of release verification. | Small | QA |

## Remaining Future Roadmap

### GAP-014 - Anonymous Public-List Browsing

| Field | Decision |
|---|---|
| Category | Future enhancement |
| Priority | P3 |
| Current behavior | Public lists require authentication. |
| Expected future behavior | Anonymous access only if separately approved. |
| User impact | None for current beta. |
| Risk if ignored | Low; do not accidentally open public data. |
| Recommended solution | Keep guests rejected. Revisit with privacy/security review. |
| Owner | Product + Security + Backend |

### GAP-015 - Admin Console/API

| Field | Decision |
|---|---|
| Category | Future enhancement |
| Priority | P3 |
| Current behavior | No admin UI or API exists. |
| Expected future behavior | Only add if moderation/support workflows require it. |
| User impact | None for current beta. |
| Risk if ignored | Low until shared catalog quality requires moderation. |
| Recommended solution | Define roles, audit logs, and moderation rules before implementation. |
| Owner | Product + Backend + Frontend + QA |

### GAP-016 - Place Editing / Correction Workflow

| Field | Decision |
|---|---|
| Category | Future enhancement |
| Priority | P3 |
| Current behavior | Users can create places but cannot edit them. |
| Expected future behavior | Correction workflow only after shared-catalog ownership/moderation rules are approved. |
| User impact | Users cannot self-correct typos today. |
| Risk if ignored | Low for beta; may rise with catalog growth. |
| Recommended solution | Keep out of scope until moderation policy exists. |
| Owner | Product + Backend + Frontend + QA |

## Public Beta Readiness

No remaining P0/P1 feature-map blockers. Public beta is ready from a feature-gap perspective after validation passes.

Required release checks:

- Backend ruff, format check, mypy, pytest.
- Frontend lint, typecheck, build.
- Affected Playwright tests for auth/profile/public lists/responsive/add-to-list.
- Migration review for `20260624_0007_public_owner_display_names.py`.

## GA Readiness

GA should revisit:

1. Whether profile public-list summary needs a dedicated backend filter.
2. Whether `places.description` should remain in API/model but hidden from UI.
3. Whether anonymous public-list browsing is desired.
4. Whether admin/moderation and place correction are needed after beta data volume grows.

## Recommended Execution Order From Here

1. Finish validation.
2. Commit this remediation.
3. Run CI.
4. Deploy only after green CI and explicit approval.
5. Track P3 items in roadmap, not MVP/GA bug backlog.
