# EDR-010: Profile Identity Contract

Date: 2026-07-02

Status: Approved

## Context

Phase 1 of the profile rebuild rendered a personal identity page without changing the backend profile contract. Because `GET /api/v1/profile` did not expose the authenticated user's identity directly, the frontend temporarily derived the display name from `publicListsSummary[0].ownerDisplayName` and fell back to `مستخدم سجل`.

That fallback is not a valid source of truth. Public list summaries may be empty, hidden, or unrelated to identity editing. Phase 2 adds explicit profile identity fields and editing support.

## Decision

`GET /api/v1/profile` is the source of truth for the authenticated user's profile identity.

The response adds these fields:

- `displayName`: authenticated user's normalized display name.
- `bio`: authenticated user's optional biography text, or `null`.
- `averageRating`: server-computed mean of the user's own ratings, rounded to one decimal, or `null` when the user has no ratings.

Existing fields and legacy aliases remain in the response. This is an additive contract change for `GET /api/v1/profile`.

`PATCH /api/v1/profile` is introduced for authenticated partial updates:

- Accepts `displayName` and/or `bio`.
- `displayName` uses the existing display-name whitespace normalization, rejects empty-after-normalization values, and enforces the existing 80-character user model limit.
- `bio` is trimmed, limited to 280 characters, and empty string is stored as `null`.
- Returns the updated `ProfileResponse`.
- Requires authentication.
- Errors use the EDR-001 API error envelope.

## Database Impact

The `users` table gains one nullable column:

- `bio VARCHAR(280) NULL`

No avatar, image, social, favorites, follower, or rating histogram data is added.

## UI Impact

The profile frontend must:

- Use `profile.displayName` directly.
- Render `profile.bio` only when non-null.
- Use `profile.averageRating` for the average rating tile.
- Stop deriving profile identity from `publicListsSummary`.
- Offer edit profile actions for display name and bio only.

## Consequences

Profile identity becomes independent of public list visibility and list ownership summaries. The profile page can render and edit identity reliably while preserving existing profile statistics, ratings archive, public list summary data, and legacy aliases.
