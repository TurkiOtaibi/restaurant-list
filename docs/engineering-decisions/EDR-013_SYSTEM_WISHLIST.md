# EDR-013: System Wishlist

Date: 2026-07-03

Status: Approved

## Context

The profile rebuild needs a protected wishlist surface named `رغباتي`. Product direction is that wishlist is not a separate social feature and not a parallel storage model. It must reuse the existing user-list infrastructure so list detail, item add/remove, visibility, and place membership indicators behave consistently.

Likes / `الإعجابات` are permanently cut from the product and are not part of this contract.

## Decision

Wishlist is a per-user system list:

- Name: `رغباتي`
- Storage: existing `lists` table
- Creation: lazy on first wishlist add
- Default visibility: `private`
- Visibility changes: allowed
- Rename: blocked
- Delete: blocked

The `lists.is_system` flag identifies protected system lists. Users cannot set this flag through list creation payloads.

Lazy creation is guarded by a database uniqueness rule so each user can have at most one system list.

## API Contract

Additive fields:

- `ListResponse.isSystem: boolean`
- `ListDetailResponse.isSystem: boolean`
- `PublicListResponse.isSystem: boolean`
- `PublicListDetailResponse.isSystem: boolean`
- `ProfileResponse.wishlist: { id: string, placeCount: number } | null`

Existing fields and legacy aliases remain unchanged.

New endpoints:

- `POST /api/v1/wishlist/places`
  - Body: `{ placeId: string }`
  - Auth required.
  - Lazily creates the user's system list if absent.
  - Adds the place idempotently using existing list-item semantics.
  - Returns the updated existing `ListDetailResponse` shape.
- `DELETE /api/v1/wishlist/places/{placeId}`
  - Auth required.
  - Removes the place from the wishlist.
  - Returns the updated existing `ListDetailResponse` shape.

Error behavior:

- 401 unauthenticated: `UNAUTHENTICATED`
- 404 unknown place on add: `PLACE_NOT_FOUND`
- 404 missing wishlist or missing wishlist item on remove: existing not-found envelope
- 422 rename/delete system list: `SYSTEM_LIST_PROTECTED`

## UI Impact

Place detail adds a quick wishlist action:

- `أضف إلى رغباتي`
- `في رغباتي`

The action toggles list membership through the wishlist endpoints and updates the page in place.

Profile adds a `رغباتي` section row after `قوائمي`. When the wishlist exists and has places, the row links to `/lists/{wishlist.id}` and shows the place count. When absent or empty, it renders a muted hint without a broken link.

List cards and list detail show a small `نظامية` badge for system lists. Rename/delete affordances are hidden for system lists; visibility controls remain available.

## CORS

Wishlist endpoints require browser `POST` and `DELETE`. These methods already exist in the CORS allowlist. Tests pin preflight behavior for both wishlist routes.

## Consequences

Wishlist becomes a protected list without changing ratings, place write endpoints, profile favorites, auth/session behavior, or existing normal-list behavior. System-list protection is enforced by the backend regardless of UI affordance visibility.
