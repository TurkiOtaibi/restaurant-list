# EDR-011: Profile Manual Favorites Contract

Date: 2026-07-03

Status: Approved

## Context

The profile page needs a small curated identity signal without adding social features or deriving preferences automatically. The approved product model is manual favorites: the user chooses up to four places from places they have already rated.

Favorites must not be inferred from ratings, lists, recency, or community scores.

## Decision

Profile favorites are manually curated, limited to four, and restricted to places rated by the authenticated user.

`GET /api/v1/profile` adds an additive field:

- `favoritePlaces`: ordered by favorite position, each item containing:
  - `id`: place id
  - `name`
  - `type`
  - `subtype`
  - `rating`: the authenticated user's own rating for that place

Existing profile fields and legacy aliases remain unchanged.

`PUT /api/v1/profile/favorites` replaces the entire favorites set idempotently:

- Request: `{ "placeIds": string[] }`
- Array order defines positions `1..N`.
- Empty array clears favorites.
- Requires authentication.
- Returns the updated `ProfileResponse`.

Validation errors use the EDR-001 API error envelope with HTTP 422:

- More than four ids: `PROFILE_FAVORITES_LIMIT_EXCEEDED`
- Duplicate ids: `PROFILE_FAVORITES_DUPLICATE_PLACE`
- Unknown place id: `PROFILE_FAVORITE_PLACE_NOT_FOUND`
- Place not rated by the authenticated user: `PROFILE_FAVORITE_PLACE_NOT_RATED`

The unknown-place case intentionally uses 422 because the request payload as a set is invalid for this profile operation.

## Database Impact

A new `user_favorite_places` table stores manual favorite positions:

- `id VARCHAR(36)` primary key
- `user_id` references `users.id` with `ON DELETE CASCADE`
- `place_id` references `places.id` with `ON DELETE RESTRICT`
- `position` constrained to `1..4`
- `created_at`
- `updated_at`
- unique `(user_id, position)`
- unique `(user_id, place_id)`

No place images, wishlist, likes, followers, following, histogram, or social tables are added.

## UI Impact

The profile frontend renders a `المفضلة` section after profile stats and before `الأماكن التي قيّمتها`.

The owner can open a picker dialog, search rated places, select up to four, reorder them with explicit controls, and save. The returned `ProfileResponse` updates the visible strip in place.

When there are no favorites, the UI shows four placeholder slots. If there are no rated places, the UI directs the user to rate places first instead of opening an empty picker.

## Consequences

Favorites remain a deliberate identity choice. Rating a place does not automatically favorite it, and changing favorites does not affect ratings, lists, places, or profile identity fields.
