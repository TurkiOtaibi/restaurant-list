# EDR-014: Anonymous Discovery Access

## Status

Approved

## Decision

**RATIFY** anonymous, read-only discovery for the four approved endpoints below.
The approval identity is **Operator** and the approval date is **2026-07-10**.

## Applies To

- `GET /api/v1/places`
- `GET /api/v1/places/{place_id}`
- `GET /api/v1/lists/public`
- `GET /api/v1/lists/public/{list_id}`

Anonymous requests may read only records that are already public in the shared
place catalog or explicitly marked public by the list owner. This decision does
not grant permission to index, bulk export, or discover private profiles.

## Public Response Boundary

Place responses may contain the place id, name, type, subtype, description,
image URL, timestamps, aggregate rating, rating count, and neutral anonymous
relationship fields. Anonymous place detail must not contain the creator user
id. Public list responses may contain the list id, name, public visibility,
system flag, place count, timestamps, public owner display name, and public
place summaries. They must not contain owner email, owner user id, private
notes, private membership, or personal rating context.

For anonymous requests, personal context fields are empty or neutral:
`currentUserRating` is `null`, list ids and names are empty, list count is `0`,
and `currentUserIsCreator` is `false`.

## Protected Boundary

Authentication remains required for creating places, creating or changing
lists, changing list visibility, adding or removing list items, creating or
editing ratings, profile reads and writes, favorites, owned lists, private list
details, notes, and every other personal or mutating action.

## Abuse And Privacy Controls

Only anonymous requests to the four endpoints in scope use the resilient Plan
004 limiter. Each counter uses the trusted client identity and a stable public
endpoint scope; query text and place/list resource ids are never included in a
key. Redis is used when configured, with the Plan 004 process-local fallback
when Redis is unavailable. Limits are bounded positive settings and are wired
through development examples and production configuration.

## Consequences

Active controlled-beta, feature-gap, product-scope, AUTH-006, API tests, and
browser tests must describe anonymous discovery as read-only and guarded.
Privacy tests must assert neutral guest context, public owner-safe fields, no
private-list disclosure, and no private notes or owner identifiers. Rate-limit
tests must assert guest `429` after the configured threshold and that
authenticated reads are not charged to the anonymous counter.

The login-only rollback branch was not selected, so no guest sign-in wall or
protected-destination return behavior is introduced for these four reads.

## Revisit Trigger

Amend this decision and repeat product, privacy, and security review before
adding any anonymous surface, public profile or owner identity field, bulk
export, indexing behavior, or a change from read-only discovery to a mutation.
