# EDR-009: Rating/List Decoupling And Tried Concept Removal

Date: 2026-07-01

Status: Approved

## Context

Earlier Ratings and Profile specifications encoded `tried` as a derived state from rating rows. They also specified that the first rating removed a place from all lists owned by the rating user. That model conflated two separate user intents:

- Rating: the user gave a place a score.
- Lists: the user organized a place in a collection.

The current product correction separates those intents.

## Decision

Ratings and lists are independent.

- Creating a rating must never add a place to any list.
- Creating a rating must never remove a place from any list.
- Editing a rating must never change list membership.
- Adding or removing list membership must never create, edit, or delete a rating.
- A rated place can be added to a list.
- An unrated place can be added to a list.
- A rated place remains in a list until the user explicitly removes it from that list.

The `tried` concept is removed from active product behavior, API contracts, frontend types, and UI.

## Superseded Requirements

This EDR supersedes the previous active meaning of:

- `RATING-005 - Tried derived from rating row`
- `RATING-006 - First rating removes place from all user lists`
- Profile `triedRestaurantCount`, `triedCafeCount`, and `triedIceCreamCount`
- Place response `currentUserTried`
- UI labels/chips such as `جربته`, `tried`, `مجرب`, or `مجربة`

The replacement requirements are:

- `RATING-005 - Tried concept removed from active product model`
- `RATING-006 - Rating does not affect list membership`
- Profile summary fields `ratedRestaurantCount`, `ratedCafeCount`, and `ratedIceCreamCount`
- Place response keeps `currentUserRating` and removes `currentUserTried`

## API Contract Impact

`RatingResponse` is unchanged:

- `id`
- `userId`
- `placeId`
- `rating`
- `notes`
- `createdAt`
- `updatedAt`

Place responses remove `currentUserTried`.

Profile responses rename:

- `triedRestaurantCount` -> `ratedRestaurantCount`
- `triedCafeCount` -> `ratedCafeCount`
- `triedIceCreamCount` -> `ratedIceCreamCount`

No backward-compatible tried aliases are part of the approved contract.

## Database Impact

No tried database table or column exists. The removed behavior was fully derived from rating rows and rating-side list cleanup. No database migration is required.

## UI Impact

Active UI must use rating language only:

- `تقييماتي`
- `الأماكن التي قيّمتها`
- `تقييماتك`
- rating values and rating counts

Active UI must not show `جربته` chips, tried badges, tried counters, or tried archive labels.

## QA Impact

Tests must prove rating/list independence:

- Rating a listed place keeps it in the list.
- Rating an unlisted place creates no list membership.
- Adding a rated place to a list works.
- Editing a rating does not change list membership.
- Profile returns `rated*Count` fields and never tried count fields.
- Places and Place Detail never return `currentUserTried`.

## Consequences

This decision removes an implicit destructive side effect from rating creation. It preserves user organization and reduces surprise while keeping ratings useful as independent preference data.
