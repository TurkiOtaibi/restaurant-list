# Remove Tried Concept Report

## 1. Executive Summary

Implemented the product-logic correction that decouples ratings from lists and removes the active "tried" concept from API, UI, and current source-of-truth documentation.

Rating a place now means only that the user gave the place a score. It no longer derives a tried state, removes a place from a list, adds a place to a list, or changes list membership in any way.

## 2. Product Decision

The new product model is:

- Ratings are independent user scores.
- Lists are independent saved collections.
- A place can be rated and still remain in any list.
- A rated place can be added to a list.
- An unrated place can be added to a list.
- The active product no longer exposes "tried" / "جربته" as a behavior, count, chip, API field, or profile concept.

## 3. Old vs New Behavior

| Area | Old Behavior | New Behavior | Files Changed | Test Evidence |
|---|---|---|---|---|
| Rating side effects | First rating removed the place from user lists. | Rating create/update never changes list membership. | `backend/app/modules/ratings/services.py`, `backend/tests/api/test_sprint2.py` | `python -m pytest -q`: PASS, focused backend list/rating tests PASS |
| Place API | Place responses exposed derived `currentUserTried`. | Place responses keep `currentUserRating`; `currentUserTried` removed. | `backend/app/modules/places/schemas.py`, `backend/app/modules/places/services.py`, `frontend/src/lib/api.ts` | API tests assert `currentUserTried` is absent |
| Place card UI | Place cards showed `جربته` chip when user had a rating. | Place cards show community average only and no tried chip. | `frontend/src/components/ui/PlaceCard.tsx`, `frontend/app/globals.css` | E2E asserts body does not contain `جربته` |
| Rating dialog | Rating dialog included tried consequence language/badge. | Rating dialog states rating does not change lists. | `frontend/src/features/places/RatePlaceDialog.tsx` | Full E2E PASS |
| Profile taxonomy counts | Profile API/UI exposed `triedRestaurantCount`, `triedCafeCount`, `triedIceCreamCount`. | Profile API/UI exposes `ratedRestaurantCount`, `ratedCafeCount`, `ratedIceCreamCount`. | `backend/app/modules/profile/schemas.py`, `backend/app/modules/profile/services.py`, `frontend/src/features/profile/ProfileArchivePage.tsx`, `frontend/src/lib/api.ts` | Backend profile tests assert rated fields and old tried fields absent |
| Source-of-truth docs | RATING-005/RATING-006 and profile docs encoded tried-derived behavior. | EDR-009 supersedes tried-derived behavior; stories/test cases/RTM align to rating/list independence. | `docs/engineering-decisions/EDR-009_RATING_LIST_DECOUPLING.md`, `docs/user-stories/*` | Documentation updated in same branch |

## 4. Files Changed

Backend implementation:

- `backend/app/modules/ratings/services.py`
- `backend/app/modules/places/schemas.py`
- `backend/app/modules/places/services.py`
- `backend/app/modules/profile/schemas.py`
- `backend/app/modules/profile/services.py`

Backend tests:

- `backend/tests/api/test_sprint2.py`

Frontend implementation:

- `frontend/src/lib/api.ts`
- `frontend/src/components/ui/Badge.tsx`
- `frontend/src/components/ui/PlaceCard.tsx`
- `frontend/src/features/places/RatePlaceDialog.tsx`
- `frontend/src/features/profile/ProfileArchivePage.tsx`
- `frontend/app/globals.css`

Frontend E2E tests:

- `frontend/tests/e2e/sprint3-real.spec.ts`
- `frontend/tests/e2e/responsive-layout.spec.ts`
- `frontend/tests/e2e/ios-safari-session-restoration.spec.ts`

Source-of-truth documentation:

- `docs/engineering-decisions/EDR-009_RATING_LIST_DECOUPLING.md`
- `docs/user-stories/RATINGS_USER_STORIES.md`
- `docs/user-stories/RATING-005_TEST_CASES.md`
- `docs/user-stories/RATING-006_TEST_CASES.md`
- `docs/user-stories/RATING-001_TEST_CASES.md`
- `docs/user-stories/RATING-002_TEST_CASES.md`
- `docs/user-stories/RATING-007_TEST_CASES.md`
- `docs/user-stories/PROFILE_USER_STORIES.md`
- `docs/user-stories/PROFILE-001_TEST_CASES.md`
- `docs/user-stories/PROFILE-005_TEST_CASES.md`
- `docs/user-stories/RTM_MASTER.md`
- `docs/user-stories/RTM_COVERAGE_REPORT.md`
- Related active user-story/test-case references for Lists, Places, and System Operations where they conflicted with rating/list independence.

## 5. Backend Changes

- Removed the rating-created list cleanup side effect from `create_or_update_rating`.
- Deleted the unused `remove_place_from_user_lists` helper.
- Removed now-unused SQLAlchemy delete/list imports from ratings service.
- Removed `current_user_tried` from place response schemas and service mapping.
- Renamed profile schema/service fields from tried counts to rated counts.
- Kept rating create/update API behavior otherwise stable.
- Kept `currentUserRating` intact as the real user-specific rating signal.

## 6. Frontend Changes

- Removed the `جربته` place-card chip and its CSS.
- Removed the `currentUserTried` property from the frontend Place type and consumers.
- Kept the place-card numeric chip as community average rating, not user's own score.
- Removed tried wording from the rating dialog.
- Updated profile labels and fields to rating language.
- Kept layout changes minimal and limited to removing the tried element while preserving spacing.

## 7. Spec / RTM / EDR Changes

- Added `EDR-009_RATING_LIST_DECOUPLING.md`.
- EDR-009 supersedes legacy RATING-005/RATING-006 behavior and profile tried counts.
- Updated RATING-005 and RATING-006 test-case packages to the new product model.
- Updated Ratings and Profile user stories to remove active tried behavior.
- Updated RTM entries to align traceability with rating/list independence and rated profile counts.
- Updated related active user-story/test-case files where old tried language conflicted with the new approved model.

## 8. Tests Updated

- Inverted the old RATING-006 removal behavior test into `test_rating_a_listed_place_keeps_it_in_all_user_lists`.
- Added/kept backend coverage for:
  - Rating a listed place keeps it in lists.
  - Rating an unlisted place creates no list membership.
  - Adding a rated place to a list works.
  - Editing a rating does not change list membership.
  - Profile returns rated count fields and not tried count fields.
- Updated E2E coverage for:
  - No `جربته` text in active UI.
  - Profile rating language.
  - Create list -> add place -> rate place -> return to list -> place remains present.
- Updated responsive/session E2E mocks to remove `currentUserTried`.

## 9. Database Tried-Artifact Status

No tried database table, column, index, or migration exists in the current implementation. The removed tried behavior was derived from ratings. No database migration was created or required.

## 10. Remaining Cleanup Recommendations

- Historical QA execution reports may still mention tried behavior as past evidence. They were intentionally left unchanged.
- Future product copy should consistently use rating language: `تقييماتي`, `الأماكن التي قيّمتها`, and `تقييماتك`.
- Any future analytics or reporting should avoid reintroducing tried-derived state unless a new approved EDR explicitly restores it.

## 11. Quality Gate Results

Backend:

- `python -m pytest -q`: PASS, 54 passed, 1 skipped.
- `python -m ruff check .`: PASS.
- `python -m ruff format --check .`: PASS.
- `python -m mypy app tests`: PASS.

Frontend:

- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm run build`: PASS.
- `npm run test:e2e`: PASS, 39 passed.

Focused verification:

- Rating does not remove place from list: PASS.
- Rated place can be added to a list: PASS.
- No `جربته` / active tried UI: PASS.
- Profile rating language and rated counts: PASS.
- List/rating regression flow: PASS.
