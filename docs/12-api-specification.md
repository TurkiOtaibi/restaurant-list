# 12. API Specification

## API Principles

- API prefix: `/api/v1` for product resources.
- Auth endpoints use `/auth`.
- JSON request and response bodies.
- Email/password authentication only.
- JWT access token required for every `/api/v1` endpoint.
- Refresh tokens are used only for token refresh and logout.
- No Google, Apple, or social login endpoints exist.
- Server enforces validation, permissions, uniqueness, rating upsert, tried-state behavior, and note privacy.

## Common Headers

| Header | Required | Notes |
| --- | --- | --- |
| `Authorization: Bearer <accessToken>` | Yes for `/api/v1` | JWT access token. |
| `Content-Type: application/json` | Yes for request bodies | JSON only. |

## Common Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Rating is required.",
    "fields": {
      "rating": "Required"
    }
  }
}
```

## Common Error Codes

| HTTP Status | Code | Meaning |
| --- | --- | --- |
| 400 | VALIDATION_ERROR | Input is malformed or fails validation. |
| 401 | UNAUTHENTICATED | Access token is missing, expired, or invalid. |
| 403 | FORBIDDEN | User is authenticated but not allowed. |
| 404 | NOT_FOUND | Resource does not exist or should not be exposed. |
| 409 | CONFLICT | Unique constraint or state conflict. |
| 500 | INTERNAL_ERROR | Unexpected server error. |

## Pagination Contract

Used by list endpoints unless otherwise stated.

| Parameter | Default | Max | Notes |
| --- | --- | --- | --- |
| `page` | 1 | N/A | Positive integer. |
| `pageSize` | 20 | 50 | Positive integer. |

Response metadata:

```json
{
  "meta": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 42,
    "totalPages": 3
  }
}
```

## Resource Shapes

### User

```json
{
  "id": "user_123",
  "displayName": "Sara",
  "email": "sara@example.com"
}
```

Email is returned only to the current user.

### Public Owner

```json
{
  "id": "user_123",
  "displayName": "Sara"
}
```

Public list responses never expose owner email.

### List

```json
{
  "id": "list_123",
  "name": "Burgers",
  "visibility": "private",
  "placeCount": 3,
  "createdAt": "2026-06-18T10:00:00Z",
  "updatedAt": "2026-06-18T10:00:00Z"
}
```

### Place Summary

```json
{
  "id": "place_123",
  "name": "Example Cafe",
  "type": "cafe",
  "averageRating": 8.3,
  "ratingCount": 12,
  "currentUserTried": true
}
```

### Place Detail

```json
{
  "id": "place_123",
  "name": "Example Cafe",
  "type": "cafe",
  "description": "Quiet cafe.",
  "averageRating": 8.3,
  "ratingCount": 12,
  "currentUserTried": true,
  "currentUserRating": {
    "rating": 9,
    "notes": "Private note.",
    "updatedAt": "2026-06-18T10:00:00Z"
  }
}
```

`currentUserRating.notes` is returned only for the authenticated current user's own rating.

### Tried Place

```json
{
  "place": {
    "id": "place_123",
    "name": "Example Cafe",
    "type": "cafe",
    "averageRating": 8.3,
    "ratingCount": 12,
    "currentUserTried": true
  },
  "rating": 9,
  "notes": "Private note.",
  "createdAt": "2026-06-18T10:00:00Z",
  "updatedAt": "2026-06-18T10:00:00Z"
}
```

## Authentication Endpoints

### Register

| Item | Contract |
| --- | --- |
| Endpoint | `POST /auth/register` |
| Authentication | Guest only |
| Authorization | Not applicable |
| Pagination | None |
| Sorting | None |
| Idempotency | Not idempotent. Duplicate email returns conflict. |

**Request schema:**

```json
{
  "displayName": "Sara",
  "email": "sara@example.com",
  "password": "password value",
  "passwordConfirmation": "password value"
}
```

**Response schema:**

```json
{
  "data": {
    "user": {
      "id": "user_123",
      "displayName": "Sara",
      "email": "sara@example.com"
    },
    "accessToken": "jwt-access-token",
    "refreshToken": "refresh-token"
  }
}
```

**Validation rules:**

- Display name required.
- Email required, valid, and unique.
- Password required.
- Password confirmation must match password.

**Error responses:**

- `400 VALIDATION_ERROR`.
- `409 EMAIL_ALREADY_EXISTS`.

### Login

| Item | Contract |
| --- | --- |
| Endpoint | `POST /auth/login` |
| Authentication | Guest only |
| Authorization | Not applicable |
| Pagination | None |
| Sorting | None |
| Idempotency | Not idempotent. Each successful login issues a new refresh token. |

**Request schema:**

```json
{
  "email": "sara@example.com",
  "password": "password value"
}
```

**Response schema:** Same as Register.

**Validation rules:**

- Email required.
- Password required.

**Error responses:**

- `400 VALIDATION_ERROR`.
- `401 INVALID_CREDENTIALS`.

### Refresh Token

| Item | Contract |
| --- | --- |
| Endpoint | `POST /auth/refresh` |
| Authentication | Refresh token required |
| Authorization | Token must be valid, unexpired, and not revoked |
| Pagination | None |
| Sorting | None |
| Idempotency | Not idempotent if refresh-token rotation is used. |

**Request schema:**

```json
{
  "refreshToken": "refresh-token"
}
```

**Response schema:**

```json
{
  "data": {
    "accessToken": "new-jwt-access-token",
    "refreshToken": "new-refresh-token"
  }
}
```

**Validation rules:**

- Refresh token required.

**Error responses:**

- `400 VALIDATION_ERROR`.
- `401 INVALID_REFRESH_TOKEN`.

### Logout

| Item | Contract |
| --- | --- |
| Endpoint | `POST /auth/logout` |
| Authentication | Refresh token required |
| Authorization | Token must belong to current session if access token is also provided |
| Pagination | None |
| Sorting | None |
| Idempotency | Idempotent success if token is already revoked. |

**Request schema:**

```json
{
  "refreshToken": "refresh-token"
}
```

**Response schema:**

```json
{
  "data": {
    "revoked": true
  }
}
```

**Error responses:**

- `400 VALIDATION_ERROR`.

### Get Current User

| Item | Contract |
| --- | --- |
| Endpoint | `GET /api/v1/me` |
| Authentication | JWT required |
| Authorization | Current user only |
| Pagination | None |
| Sorting | None |
| Idempotency | Safe read |

**Response schema:**

```json
{
  "data": {
    "id": "user_123",
    "displayName": "Sara",
    "email": "sara@example.com"
  }
}
```

**Error responses:**

- `401 UNAUTHENTICATED`.

## List Endpoints

### Get My Lists

| Item | Contract |
| --- | --- |
| Endpoint | `GET /api/v1/lists` |
| Authentication | JWT required |
| Authorization | Current user's lists only |
| Pagination | Yes |
| Sorting | `updated_at_desc` default; `name_asc` allowed |
| Idempotency | Safe read |

**Request schema:** No body.

**Response schema:**

```json
{
  "data": [
    {
      "id": "list_123",
      "name": "Burgers",
      "visibility": "private",
      "placeCount": 3,
      "createdAt": "2026-06-18T10:00:00Z",
      "updatedAt": "2026-06-18T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

**Validation rules:**

- `page` positive integer.
- `pageSize` 1 to 50.
- `sort` must be `updated_at_desc` or `name_asc`.

**Error responses:**

- `401 UNAUTHENTICATED`.
- `400 VALIDATION_ERROR`.

### Create List

| Item | Contract |
| --- | --- |
| Endpoint | `POST /api/v1/lists` |
| Authentication | JWT required |
| Authorization | Current user becomes owner |
| Pagination | None |
| Sorting | None |
| Idempotency | Not idempotent. Duplicate list names are allowed and create separate lists. |

**Request schema:**

```json
{
  "name": "Burgers",
  "visibility": "private"
}
```

**Response schema:**

```json
{
  "data": {
    "id": "list_123",
    "name": "Burgers",
    "visibility": "private",
    "placeCount": 0,
    "createdAt": "2026-06-18T10:00:00Z",
    "updatedAt": "2026-06-18T10:00:00Z"
  }
}
```

**Validation rules:**

- Name required, 1 to 80 characters after trimming.
- Visibility must be `public` or `private`.
- Client-supplied owner ID is ignored or rejected.

**Error responses:**

- `401 UNAUTHENTICATED`.
- `400 VALIDATION_ERROR`.

### Get List Detail

| Item | Contract |
| --- | --- |
| Endpoint | `GET /api/v1/lists/{listId}` |
| Authentication | JWT required |
| Authorization | Owner can view any owned list; authenticated non-owner can view only public list |
| Pagination | Places may be paginated with `page` and `pageSize` |
| Sorting | Places sorted by `name_asc` |
| Idempotency | Safe read |

**Response schema:**

```json
{
  "data": {
    "id": "list_123",
    "name": "Burgers",
    "visibility": "public",
    "owner": {
      "id": "user_123",
      "displayName": "Sara"
    },
    "permissions": {
      "canEdit": false,
      "canDelete": false,
      "canModifyPlaces": false
    },
    "places": [
      {
        "id": "place_123",
        "name": "Example Restaurant",
        "type": "restaurant",
        "averageRating": 8.3,
        "ratingCount": 12,
        "currentUserTried": true
      }
    ]
  },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

**Validation rules:**

- `listId` must identify an existing accessible list.

**Error responses:**

- `401 UNAUTHENTICATED`.
- `403 FORBIDDEN` or `404 NOT_FOUND` for private non-owned list. Prefer `404` to avoid exposing existence.
- `404 NOT_FOUND`.

**Privacy:**

- Owner email is not returned.
- Rating notes are not returned.

### Update List

| Item | Contract |
| --- | --- |
| Endpoint | `PATCH /api/v1/lists/{listId}` |
| Authentication | JWT required |
| Authorization | List owner only |
| Pagination | None |
| Sorting | None |
| Idempotency | Idempotent when repeated with the same values. |

**Request schema:**

```json
{
  "name": "Must Try",
  "visibility": "public"
}
```

**Response schema:** List resource.

**Validation rules:**

- Name required if supplied, 1 to 80 characters after trimming.
- Visibility must be `public` or `private` if supplied.
- Duplicate list names are allowed.

**Error responses:**

- `401 UNAUTHENTICATED`.
- `403 FORBIDDEN`.
- `404 NOT_FOUND`.
- `400 VALIDATION_ERROR`.

### Delete List

| Item | Contract |
| --- | --- |
| Endpoint | `DELETE /api/v1/lists/{listId}` |
| Authentication | JWT required |
| Authorization | List owner only |
| Pagination | None |
| Sorting | None |
| Idempotency | Deleting an already-deleted list returns `404 NOT_FOUND`. |

**Response schema:**

```json
{
  "data": {
    "deleted": true
  }
}
```

**Behavior:**

- Deletes list and list-place memberships.
- Does not delete places.
- Does not delete ratings.

**Error responses:**

- `401 UNAUTHENTICATED`.
- `403 FORBIDDEN`.
- `404 NOT_FOUND`.

## List Place Endpoints

### Add Place To List

| Item | Contract |
| --- | --- |
| Endpoint | `POST /api/v1/lists/{listId}/places` |
| Authentication | JWT required |
| Authorization | List owner only |
| Pagination | None |
| Sorting | None |
| Idempotency | Idempotent for the same list/place. Existing membership returns success and creates no duplicate. |

**Request schema for existing place:**

```json
{
  "placeId": "place_123"
}
```

**Request schema for create-place-and-add:**

```json
{
  "place": {
    "name": "Example Cafe",
    "type": "cafe",
    "description": "Quiet cafe."
  }
}
```

Exactly one of `placeId` or `place` is required. One request targets one list only.

**Response schema:**

```json
{
  "data": {
    "listId": "list_123",
    "place": {
      "id": "place_123",
      "name": "Example Cafe",
      "type": "cafe",
      "averageRating": null,
      "ratingCount": 0,
      "currentUserTried": false
    },
    "alreadyExisted": false
  }
}
```

**Validation rules:**

- List must exist and be owned by current user.
- Existing place must exist.
- New place requires unique name and valid type.
- Multiple list IDs are rejected.
- Tried places may be added; tried status is preserved.

**Error responses:**

- `401 UNAUTHENTICATED`.
- `403 FORBIDDEN`.
- `404 NOT_FOUND`.
- `400 VALIDATION_ERROR`.
- `409 DUPLICATE_PLACE_NAME` when creating a duplicate place.

### Remove Place From List

| Item | Contract |
| --- | --- |
| Endpoint | `DELETE /api/v1/lists/{listId}/places/{placeId}` |
| Authentication | JWT required |
| Authorization | List owner only |
| Pagination | None |
| Sorting | None |
| Idempotency | Idempotent success if membership is already absent. |

**Response schema:**

```json
{
  "data": {
    "removed": true
  }
}
```

**Behavior:**

- Removes membership only.
- Does not delete place.
- Does not delete rating or tried status.

**Error responses:**

- `401 UNAUTHENTICATED`.
- `403 FORBIDDEN`.
- `404 NOT_FOUND` for missing list or place.

## Place Endpoints

### List Places

| Item | Contract |
| --- | --- |
| Endpoint | `GET /api/v1/places` |
| Authentication | JWT required |
| Authorization | Any authenticated user |
| Pagination | Yes |
| Sorting | `rating_desc` only |
| Idempotency | Safe read |

**Query parameters:**

| Parameter | Required | Notes |
| --- | --- | --- |
| `type` | No | `restaurant`, `cafe`, or `ice_cream`. Required when `subtype` is supplied. |
| `subtype` | No | Restaurant subtypes: `burger`, `italian`, `american`, `steak`, `grill`, `shawarma`, `saudi`, `gulf`, `indian`, `asian`, `seafood`, `breakfast`, `healthy`, `other`. Cafe subtypes: `coffee`, `tea`. Not valid for `ice_cream`. |
| `q` | No | Place-name search only. |
| `limit` | No | 1 to 100. |
| `offset` | No | 0 or greater. |
| `sort` | No | Only `rating_desc`. |

**Response schema:**

```json
{
  "data": [
    {
      "id": "place_123",
      "name": "Example Cafe",
      "type": "cafe",
      "subtype": "coffee",
      "description": null,
      "createdByUserId": "user_123",
      "createdAt": "2026-06-23T10:00:00Z",
      "updatedAt": "2026-06-23T10:00:00Z",
      "averageRating": 8.3,
      "ratingCount": 12,
      "currentUserRating": null,
      "currentUserTried": true,
      "currentUserListIds": [],
      "currentUserListNames": [],
      "currentUserListCount": 0
    }
  ],
  "meta": {
    "limit": 100,
    "offset": 0,
    "total": 1,
    "sort": "rating_desc"
  }
}
```

**Validation rules:**

- `type` must be `restaurant`, `cafe`, or `ice_cream` when supplied.
- `subtype` requires `type`.
- Restaurant subtypes are valid only when `type=restaurant`.
- Cafe subtypes are valid only when `type=cafe`.
- `ice_cream` does not accept `subtype`.
- `q` searches place name only and must be 120 characters or fewer.
- Default sorting is highest average rating first, then rating count descending, then normalized place name ascending. Unrated places are last.
- Location, neighborhood, distance, popularity, trending, and recommendation parameters are rejected.

**Error responses:**

- `401 UNAUTHENTICATED`.
- `400 VALIDATION_ERROR`.

### Create Place

| Item | Contract |
| --- | --- |
| Endpoint | `POST /api/v1/places` |
| Authentication | JWT required |
| Authorization | Any authenticated user |
| Pagination | None |
| Sorting | None |
| Idempotency | Not idempotent. Duplicate normalized name returns conflict. |

**Request schema:**

```json
{
  "name": "Example Restaurant",
  "type": "restaurant",
  "subtype": "burger",
  "description": "Optional description."
}
```

**Response schema:** Place Detail with `currentUserRating: null`.

**Validation rules:**

- Name required and globally unique after normalization.
- Type required and must be `restaurant`, `cafe`, or `ice_cream`.
- Restaurant subtype is required and must be valid for restaurants.
- Cafe subtype is required and must be valid for cafes.
- Ice cream places must omit subtype.
- Description optional and max 1000 characters.
- Client-supplied aggregate fields are ignored or rejected.

**Error responses:**

- `401 UNAUTHENTICATED`.
- `400 VALIDATION_ERROR`.
- `409 DUPLICATE_PLACE_NAME`.

### Get Place Detail

| Item | Contract |
| --- | --- |
| Endpoint | `GET /api/v1/places/{placeId}` |
| Authentication | JWT required |
| Authorization | Any authenticated user |
| Pagination | None |
| Sorting | None |
| Idempotency | Safe read |

**Response schema:** Place Detail.

**Validation rules:**

- `placeId` must exist.

**Error responses:**

- `401 UNAUTHENTICATED`.
- `404 NOT_FOUND`.

**Privacy:**

- Returns current user's own rating notes if present.
- Never returns another user's notes.

## Rating Endpoints

### Upsert Rating / Mark As Tried

| Item | Contract |
| --- | --- |
| Endpoint | `POST /api/v1/places/{placeId}/rating` |
| Authentication | JWT required |
| Authorization | Current user only |
| Pagination | None |
| Sorting | None |
| Idempotency | Upsert behavior. Same user/place never creates more than one rating row. |

**Request schema:**

```json
{
  "rating": 8,
  "notes": "Private note."
}
```

**Response schema:**

```json
{
  "data": {
    "placeId": "place_123",
    "rating": 8,
    "notes": "Private note.",
    "created": true,
    "removedFromListCount": 3,
    "averageRating": 8.3,
    "ratingCount": 12,
    "updatedAt": "2026-06-18T10:00:00Z"
  }
}
```

**Validation rules:**

- Rating required.
- Rating integer from 1 to 10.
- Notes optional, max 2000 characters.
- Blank or whitespace-only notes stored as null.
- Place must exist.

**Behavior:**

- If no rating exists for current user/place, create rating and remove the place from all current user's lists transactionally.
- If a rating already exists for current user/place, update rating and notes.
- Updating an existing rating does not remove later re-added list memberships.
- Recalculates average rating and rating count from ratings table for response.

**Error responses:**

- `401 UNAUTHENTICATED`.
- `404 NOT_FOUND`.
- `400 VALIDATION_ERROR`.

### Get My Rating For Place

| Item | Contract |
| --- | --- |
| Endpoint | `GET /api/v1/places/{placeId}/rating` |
| Authentication | JWT required |
| Authorization | Current user's own rating only |
| Pagination | None |
| Sorting | None |
| Idempotency | Safe read |

**Response schema when rating exists:**

```json
{
  "data": {
    "placeId": "place_123",
    "rating": 8,
    "notes": "Private note.",
    "createdAt": "2026-06-18T10:00:00Z",
    "updatedAt": "2026-06-18T10:00:00Z"
  }
}
```

**Response schema when rating does not exist:**

```json
{
  "data": null
}
```

**Error responses:**

- `401 UNAUTHENTICATED`.
- `404 NOT_FOUND` for missing place.

## Profile Endpoints

### Get My Profile Summary

| Item | Contract |
| --- | --- |
| Endpoint | `GET /api/v1/profile` |
| Authentication | JWT required |
| Authorization | Current user only |
| Pagination | None |
| Sorting | None |
| Idempotency | Safe read |

**Response schema:**

```json
{
  "data": {
    "listsCount": 4,
    "restaurantsTriedCount": 12,
    "cafesTriedCount": 7
  }
}
```

**Error responses:**

- `401 UNAUTHENTICATED`.

### Get My Tried Places

| Item | Contract |
| --- | --- |
| Endpoint | `GET /api/v1/profile/tried-places` |
| Authentication | JWT required |
| Authorization | Current user only |
| Pagination | Yes |
| Sorting | `updated_at_desc` default; `name_asc` allowed |
| Idempotency | Safe read |

**Query parameters:**

- `type`: optional `restaurant` or `cafe`.
- `page`.
- `pageSize`.
- `sort`: `updated_at_desc` or `name_asc`.

**Response schema:**

```json
{
  "data": [
    {
      "place": {
        "id": "place_123",
        "name": "Example Cafe",
        "type": "cafe",
        "averageRating": 8.3,
        "ratingCount": 12,
        "currentUserTried": true
      },
      "rating": 9,
      "notes": "Private note.",
      "createdAt": "2026-06-18T10:00:00Z",
      "updatedAt": "2026-06-18T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

**Validation rules:**

- Type must be `restaurant` or `cafe` when supplied.
- Pagination and sort values must be valid.

**Privacy:**

- Returns only current user's own notes.

**Error responses:**

- `401 UNAUTHENTICATED`.
- `400 VALIDATION_ERROR`.

## Public List Endpoint

### Get Public List

| Item | Contract |
| --- | --- |
| Endpoint | `GET /api/v1/public/lists/{listId}` |
| Authentication | JWT required |
| Authorization | Authenticated users only; list must be public or owned by current user |
| Pagination | Places may be paginated with `page` and `pageSize` |
| Sorting | Places sorted by `name_asc` |
| Idempotency | Safe read |

**Response schema:**

```json
{
  "data": {
    "id": "list_123",
    "name": "Burgers",
    "visibility": "public",
    "owner": {
      "id": "user_123",
      "displayName": "Sara"
    },
    "places": [
      {
        "id": "place_123",
        "name": "Example Restaurant",
        "type": "restaurant",
        "averageRating": 8.3,
        "ratingCount": 12,
        "currentUserTried": false
      }
    ]
  },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

**Validation rules:**

- `listId` must exist and be public unless owned by current user.
- Guest access is rejected.

**Privacy:**

- Owner email is not returned.
- Rating notes are not returned.
- Current viewer's tried indicator may be returned.

**Error responses:**

- `401 UNAUTHENTICATED`.
- `404 NOT_FOUND` for private or missing list.

## Unsupported Endpoints

The following endpoint types must not exist in MVP:

- Place update, patch, or delete endpoints.
- Google, Apple, or social login endpoints.
- Location, nearby, map, GPS, branch, neighborhood, trending, popularity, recommendation, comment, photo, follow, notification, or moderation endpoints.
