# PLACES_PWA_UI_UX_PROGRAM_STATUS.md

> Live status of the Places + Standalone PWA UI/UX Excellence Program.
> Baseline: `origin/main` = `543ef39` (authoritative SHA confirmed). Phase 0 revalidation complete → see `PLACES_PWA_UI_UX_REVALIDATION.md`.
> Statuses: TODO · IN PROGRESS · BLOCKED · NEEDS DECISION · APPROVED · RELEASED · DEFERRED · NOT APPLICABLE.

## Program blockers (must clear before executor can run the program as written)
1. **Audit inputs not on main** — `PLACES_UI_UX_BRUTAL_AUDIT.md` + `STANDALONE_PWA_AUDIT_ADDENDUM.md` are local-only; the program's Step 3 existence check fails until they are committed to `main` or carried into the program branch.
2. **Independent visual approval owner unspecified** — the program says "merge when approved" but names no approver distinct from the implementer. Assigned to: **the user** (you) for all `visual approval required` waves, until stated otherwise.

## Phase 0
| Item | Status | Notes |
|---|---|---|
| Baseline SHA verified `543ef39` | RELEASED | matches program |
| Referenced records present on main | RELEASED | 5/7 present; 2 audit docs missing (blocker 1) |
| `PLACES_PWA_UI_UX_REVALIDATION.md` | IN PROGRESS | written; pending commit |
| `PLACES_PWA_UI_UX_PROGRAM_STATUS.md` | IN PROGRESS | this file |

## Waves
| # | Wave | Status | Branch | PR | Verdict | CI | Prod verify | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | Skip link | **NOT APPLICABLE** | — | — | — | — | — | ALREADY FIXED on main (globals.css L124–143) |
| 2 | Bottom clearance | **NOT APPLICABLE** (shell) | — | — | — | — | — | Token system already present; only virtualized-archive container to re-confirm |
| 3 | Loading skeleton | **IN PROGRESS (PR open)** | `polish/place-card-loading-skeleton` | [#67](https://github.com/TurkiOtaibi/restaurant-list/pull/67) | pending your review | pending | pending | STILL VALID; card-shaped skeleton scoped to PlaceLibraryLoading (shared LoadingState untouched); lint/typecheck/build ✅; screenshot verified @390px |
| 4 | Card RTL anatomy | **TODO (verify-first)** | — | — | — | — | — | PARTIALLY FIXED; needs fresh screenshot to confirm/close |
| 5 | Search/filter | TODO | — | — | — | — | — | characterize behavior first; presentation-only likely |
| 6 | Add-place sheet | TODO (low) | — | — | — | — | — | mostly disciplined already |
| 7 | Rating input | **NEEDS DECISION** | — | — | — | — | — | "-/10" + slider+stars still present; blocked on rating-model decision (A/B/C) |
| 8 | Identity bidi | TODO (verify-first) | — | — | — | — | — | PARTIALLY FIXED; grouped in `__copy`; confirm CSS anchoring |
| 9 | Stats/favorites | TODO | — | — | — | — | — | «؟» is intentional aria-hidden; compress favorites empty state |
| 10 | Place detail final | **NOT APPLICABLE (verify)** | — | — | — | — | — | mostly covered by released Place Detail work |
| 11 | A11y/RTL sweep | DEFERRED | — | — | — | — | — | run after 3/4/8/9 land |
| 12 | Physical QA | BLOCKED (device) | — | — | — | — | — | needs your iPhone at 320/390/430; program verdict can't be READY without it |

## Remaining risks
- Executing beyond Wave 3 requires **fresh screenshot evidence** on current `main` (deploy or your device) to close the PARTIALLY-FIXED waves honestly — the current screenshots are stale.
- Autonomous merge is not possible here: merges need your approval gate + CI + (for the final verdict) physical-device evidence.
