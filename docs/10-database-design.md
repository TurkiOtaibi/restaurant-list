# 10. Database Design

## Database Design Goals

- Preserve data integrity with database constraints.
- Support email/password authentication with JWT access tokens and refresh tokens.
- Keep places shared and user-neutral.
- Keep lists and ratings user-owned.
- Calculate community rating aggregates from the ratings table.
- Enforce business rules without relying only on client behavior.

## Recommended Database

A relational database is recommended for the MVP. PostgreSQL is a strong fit, but the logical design can be implemented in any relational database with equivalent constraints.

## Entity Summary

| Entity | Purpose |
| --- | --- |
| users | Authenticated product users. |
| refresh_tokens | Hashed refresh tokens for session refresh and logout revocation. |
| places | Shared restaurant, cafe, and ice cream catalog. |
| lists | User-owned lists. |
| list_items | Join table connecting lists and places. |
| ratings | User-owned ratings that mark places as tried and store private notes. |

## Table: users

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| id | UUID or big integer | Yes | Primary key. |
| display_name | String | Yes | Public-safe display name. |
| email | String | Yes | Unique normalized email. |
| password_hash | String | Yes | Hashed password. |
| created_at | Timestamp | Yes | Creation time. |
| updated_at | Timestamp | Yes | Last update time. |

**Indexes and Constraints:**

- Primary key on `id`.
- Unique index on normalized `email`.

## Table: refresh_tokens

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| id | UUID or big integer | Yes | Primary key. |
| user_id | UUID or big integer | Yes | Token owner. |
| token_hash | String | Yes | Hash of refresh token. |
| expires_at | Timestamp | Yes | Expiration time. |
| revoked_at | Timestamp | No | Set when logged out or revoked. |
| created_at | Timestamp | Yes | Creation time. |

**Indexes and Constraints:**

- Primary key on `id`.
- Foreign key `user_id` references `users.id`.
- Unique index on `token_hash`.
- Index on `user_id`.

## Table: places

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| id | UUID or big integer | Yes | Primary key. |
| name | String | Yes | Display name. |
| normalized_name | String | Yes | Lowercase, trimmed, whitespace-normalized value for uniqueness. |
| type | Enum/String | Yes | `restaurant`, `cafe`, or `ice_cream`. |
| subtype | Enum/String | Conditional | Restaurant/cafe subtype; null for ice cream. |
| description | Text | No | Optional. |
| created_at | Timestamp | Yes | Creation time. |
| updated_at | Timestamp | Yes | Last update time; changed only by operational processes outside user-facing MVP. |

**Indexes and Constraints:**

- Primary key on `id`.
- Unique index on `normalized_name`.
- Index on `(type, normalized_name)`.
- Check constraint for valid type/subtype combinations.

**MVP Editing Rule:**

- Users can create places.
- Users cannot edit places.
- Operational correction workflows are out of scope.

## Table: lists

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| id | UUID or big integer | Yes | Primary key. |
| user_id | UUID or big integer | Yes | Owner foreign key. |
| name | String | Yes | List name. Duplicate names are allowed per user. |
| visibility | Enum/String | Yes | `public` or `private`. |
| created_at | Timestamp | Yes | Creation time. |
| updated_at | Timestamp | Yes | Last update time. |

**Indexes and Constraints:**

- Primary key on `id`.
- Foreign key `user_id` references `users.id`.
- Index on `user_id`.
- Index on `visibility`.
- No unique constraint on list name.

## Table: list_items

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| id | UUID or big integer | Yes | Primary key. |
| list_id | UUID or big integer | Yes | Parent list. |
| place_id | UUID or big integer | Yes | Saved place. |
| created_at | Timestamp | Yes | Add time. |

**Indexes and Constraints:**

- Primary key on `id`.
- Foreign key `list_id` references `lists.id`.
- Foreign key `place_id` references `places.id`.
- Unique index on `(list_id, place_id)`.
- Index on `place_id`.
- Cascade delete when a list is deleted.
- Do not cascade delete a place when a list membership is deleted.

## Table: ratings

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| id | UUID or big integer | Yes | Primary key. |
| user_id | UUID or big integer | Yes | Rating owner. |
| place_id | UUID or big integer | Yes | Rated place. |
| rating | Numeric/Float | Yes | Required value from 1 to 10 in 0.5 increments. |
| notes | Text | No | Optional private notes. Blank notes stored as null. |
| created_at | Timestamp | Yes | First rating time. |
| updated_at | Timestamp | Yes | Last edit time. |

**Indexes and Constraints:**

- Primary key on `id`.
- Foreign key `user_id` references `users.id`.
- Foreign key `place_id` references `places.id`.
- Unique index on `(user_id, place_id)`.
- Check constraint for `rating between 1 and 10` and half-step increments.
- Index on `user_id`.
- Index on `place_id`.

## Aggregate Strategy

The authoritative and only required source for community ratings is the `ratings` table.

For MVP:

- `average_rating` is calculated as `AVG(ratings.rating)` for a place.
- `rating_count` is calculated as `COUNT(ratings.id)` for a place.
- Display average rating with one decimal place.
- A place with no ratings returns average rating as null and rating count as 0.
- No cached aggregate columns, trigger infrastructure, materialized views, or advanced aggregation system is required.

## Transactional Invariants

### First Rating

The following operations must be atomic:

1. Insert the user's first rating for a place.
2. Remove that place from all lists owned by the user.

If any step fails, all steps roll back.

### Existing Rating Update

The following operation is atomic:

1. Update the existing rating and private notes for the user/place pair.

Updating an existing rating must not remove list memberships created after the first rating.

### Add To List

Adding a place to a list is idempotent:

1. If `(list_id, place_id)` does not exist, create it.
2. If `(list_id, place_id)` already exists, return success without creating a duplicate.

## Deletion Rules

| Delete Action | Behavior |
| --- | --- |
| Delete list | Delete rows from `list_items` for that list. Do not delete places or ratings. |
| Delete place | No user-facing delete in MVP. |
| Delete rating | Not included in MVP. |
| Delete user | No self-service deletion in MVP. Operational deletion policy is outside MVP implementation scope but must not be improvised in product flows. |

## Query Patterns

### My Lists

- Query lists where `lists.user_id = current_user.id`.
- Include count of list places.

### List Detail

- Query list by id.
- Authorize owner or authenticated public viewer if visibility is public.
- Join list places to places.
- Include current user's tried state from ratings.
- Do not expose rating notes except for current user's own rating where the endpoint explicitly returns them.

### Places

- Query places by optional primary type and subtype filters.
- Optional name search by normalized place name.
- Default sort is average rating descending, rating count descending, then normalized name ascending; unrated places are last.
- Return average rating and rating count from ratings table.
- Include current user's tried state and owned-list membership context.

### Place Detail

- Query place by id.
- Return place metadata.
- Return average rating and rating count from ratings table.
- Return current user's rating and private notes only for the current user.

### My Profile

- Count lists by current user.
- Count ratings joined to places where type is restaurant.
- Count ratings joined to places where type is cafe.
- Count ratings joined to places where type is ice cream.
- Fetch rating archive rows joined to current user's ratings. This archive is the canonical tried-place history.

## Data Integrity Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Duplicate place names due to case or spaces | Store and enforce `normalized_name`. |
| Two concurrent users create same place | Unique index catches conflict; API returns duplicate-place response. |
| Duplicate list items | Unique `(list_id, place_id)` constraint and idempotent add behavior. |
| Duplicate rating rows | Unique `(user_id, place_id)` constraint and rating upsert behavior. |
| Rating created but place remains in user lists | Use one transaction for first rating and list cleanup. |
| Rating notes leak | Response shaping and authorization tests. |
| User edits another user's list or rating | Server-side authorization on every write. |
