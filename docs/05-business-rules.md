# 5. Business Rules

## Rule Conventions

Business rules use the prefix `BR`.

## Authentication Rules

| ID | Rule | Enforcement |
| --- | --- | --- |
| BR-001 | MVP authentication uses email and password only. | Auth service and UI entry points. |
| BR-002 | Successful login returns a JWT access token and refresh token. | Auth API. |
| BR-003 | Refresh tokens must be revocable and stored hashed. | Database and auth service. |
| BR-004 | Google login, Apple login, and social login are out of scope. | No OAuth routes, UI actions, or provider configuration. |
| BR-005 | Anonymous users cannot access MVP data. | Authentication middleware on all `/api/v1` resource endpoints. |

## Place Rules

| ID | Rule | Enforcement |
| --- | --- | --- |
| BR-010 | A place must be either Restaurant or Cafe. | API validation and database enum/check constraint. |
| BR-011 | A place must have a name. | API validation and database not-null constraint. |
| BR-012 | Place name must be globally unique. | Normalized unique index. |
| BR-013 | Duplicate place names are not allowed, regardless of case or surrounding spaces. | Normalize name before uniqueness check. |
| BR-014 | Description is optional when creating a place. | Description may be null or empty after trimming. |
| BR-015 | Users can create places but cannot edit places in MVP. | No place update endpoint or edit UI. |
| BR-016 | Operational correction workflows for places are out of scope. | No admin correction workflow in MVP. |
| BR-017 | Branches are out of scope. | No branch table, branch field, address field, or location field. |
| BR-018 | Location, maps, GPS, and neighborhoods are out of scope. | No fields, screens, or API parameters for location. |

## List Rules

| ID | Rule | Enforcement |
| --- | --- | --- |
| BR-020 | A list must belong to exactly one owner. | Required user foreign key. |
| BR-021 | A list must have a name. | API validation and database not-null constraint. |
| BR-022 | Duplicate list names are allowed for the same user. | No unique constraint on list names. |
| BR-023 | A list visibility must be Public or Private. | API validation and database enum/check constraint. |
| BR-024 | Public lists are visible only to authenticated users. | Authentication and authorization policy. |
| BR-025 | Private lists are visible only to the owner. | Authorization policy. |
| BR-026 | Only the owner can create, edit, delete, or modify places in a list. | Authorization policy. |
| BR-027 | The same place cannot appear twice in the same list. | Unique list-place constraint. |
| BR-028 | Adding the same place to the same list again returns idempotent success. | Add-to-list service returns existing membership. |
| BR-029 | One Add To List action targets one list only. | API route shape and UI flow. |

## Tried Place Rules

| ID | Rule | Enforcement |
| --- | --- | --- |
| BR-030 | A place is considered tried by a user when that user has a rating for the place. | Tried state derived from ratings table. |
| BR-031 | When a user rates a place for the first time, the place must be removed from all lists owned by that user. | Transactional rating create service. |
| BR-032 | Tried places may be intentionally re-added to lists after first rating. | Add-to-list service allows rated places. |
| BR-033 | Re-added tried places keep Tried status. | UI state from current user's rating. |
| BR-034 | Re-adding a tried place does not create a second rating. | Add-to-list service never writes ratings. |
| BR-035 | Updating an existing rating does not remove later re-added list memberships. | Rating upsert service distinguishes create from update. |

## Rating Rules

| ID | Rule | Enforcement |
| --- | --- | --- |
| BR-040 | Rating is required when marking a place as tried. | API validation. |
| BR-041 | Rating must be an integer from 1 to 10. | API validation and database check constraint. |
| BR-042 | Notes are optional. | Notes may be null. |
| BR-043 | Blank or whitespace-only notes are stored as null. | API normalization. |
| BR-044 | Rating notes are private to the rating owner. | Authorization and response shaping. |
| BR-045 | Public list, place list, and other-user APIs must never expose another user's notes. | API response contract. |
| BR-046 | A user may have only one rating per place. | Unique user-place rating constraint. |
| BR-047 | Repeated rating submission for the same user/place updates the existing rating. | Rating upsert endpoint. |
| BR-048 | A user may edit their rating later. | Rating update/upsert endpoint. |

## Community Rating Rules

| ID | Rule | Enforcement |
| --- | --- | --- |
| BR-050 | Average rating is calculated from all user ratings for a place. | Query from ratings table. |
| BR-051 | Rating count is calculated from all user ratings for a place. | Query from ratings table. |
| BR-052 | No cached or advanced aggregation infrastructure is required for MVP. | Database design does not rely on aggregate columns. |
| BR-053 | Average rating displays with one decimal place. | API/UI formatting rule. |
| BR-054 | A place with no ratings has rating count 0 and no average rating. | Display and API response convention. |
| BR-055 | A user's rating contributes equally to the community average. | No weighting or moderation in MVP. |

## Search Rules

| ID | Rule | Enforcement |
| --- | --- | --- |
| BR-060 | Search remains in MVP. | Place list API supports name query. |
| BR-061 | Search is by place name only. | API validation and query design. |
| BR-062 | Search must not support recommendations, trending, popularity sorting, location search, or category exploration. | API contract and QA boundary tests. |
| BR-063 | Place results use deterministic rating-first sorting. | Default sort is average rating descending, rating count descending, then normalized place name ascending. Unrated places are last. |

## Permission Rules

| ID | Rule | Enforcement |
| --- | --- | --- |
| BR-070 | Unauthenticated users cannot view, create, or modify MVP data. | Authentication middleware. |
| BR-071 | A user cannot edit another user's rating. | Authorization policy. |
| BR-072 | A user cannot view another user's rating notes. | Authorization and response shaping. |
| BR-073 | A user cannot modify another user's list. | Authorization policy. |
| BR-074 | An authenticated user can view another user's public list in read-only mode. | Authorization policy. |
| BR-075 | A user cannot view another user's private list. | Authorization policy. |
| BR-076 | Public list responses may expose owner display name only. | Public list response schema. |
