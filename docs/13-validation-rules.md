# 13. Validation Rules

## Validation Principles

- Validate on both client and server.
- Treat server validation as authoritative.
- Use clear, field-specific messages.
- Normalize user input before uniqueness checks.
- Do not expose private data in validation or authorization errors.

## Authentication Validation

| Field | Rule | Error Condition |
| --- | --- | --- |
| displayName | Required after trimming. | Blank or missing display name. |
| email | Required and valid email format. | Blank, missing, or invalid email. |
| email | Must be unique after normalization. | Email already registered. |
| password | Required and must meet configured strength rules. | Missing or weak password. |
| refreshToken | Required for refresh/logout. | Missing, expired, revoked, or invalid token. |

OAuth, Google login, Apple login, and social login are not valid authentication methods in MVP.

## Place Validation

| Field | Rule | Error Condition |
| --- | --- | --- |
| name | Required after trimming. | Blank or missing name. |
| name | Must be 1 to 120 characters after trimming. | Too long. |
| name | Must be globally unique by normalized name. | Duplicate place name. |
| type | Required. | Missing type. |
| type | Must be `restaurant`, `cafe`, or `ice_cream`. | Unsupported type. |
| subtype | Required and valid for `restaurant`. | Missing or unsupported restaurant subtype. |
| subtype | Required and valid for `cafe`. | Missing or unsupported cafe subtype. |
| subtype | Must be omitted for `ice_cream`. | Ice cream subtype supplied. |
| description | Optional. | No error if blank. |
| description | Maximum 1000 characters. | Too long. |

## Place Name Normalization

For uniqueness, normalize name by:

1. Trimming leading and trailing whitespace.
2. Converting to lowercase.
3. Collapsing repeated internal whitespace to a single space.

MVP uniqueness is normalized exact-name uniqueness, not fuzzy duplicate detection.

## List Validation

| Field | Rule | Error Condition |
| --- | --- | --- |
| name | Required after trimming. | Blank or missing name. |
| name | 1 to 80 characters after trimming. | Too long. |
| name | Duplicate names are allowed per user. | No duplicate-name error. |
| visibility | Required. | Missing visibility. |
| visibility | Must be `public` or `private`. | Unsupported visibility. |

## List Membership Validation

| Operation | Rule | Error Condition |
| --- | --- | --- |
| Add place to list | Current user must own the list. | Unauthorized. |
| Add place to list | Place must exist. | Place not found. |
| Add place to list | One request targets one list and one place. | Multiple target lists rejected. |
| Add place to list | Duplicate membership returns idempotent success. | No duplicate row created. |
| Add tried place to list | Allowed; Tried indicator remains. | No error. |
| Remove place from list | Current user must own the list. | Unauthorized. |
| Remove place from list | Missing membership returns idempotent success. | No duplicate side effects. |

## Rating Validation

| Field | Rule | Error Condition |
| --- | --- | --- |
| rating | Required. | Missing rating. |
| rating | Must be numeric in 0.5 increments. | Non-numeric value or unsupported decimal step such as 7.25. |
| rating | Must be between 1 and 10 inclusive. | Less than 1 or greater than 10. |
| notes | Optional. | No error if blank. |
| notes | Blank or whitespace-only notes are stored as null. | No error. |
| notes | Maximum 1000 characters. | Too long. |

## Rating Ownership Validation

| Operation | Rule | Error Condition |
| --- | --- | --- |
| Upsert rating | Current user must be authenticated. | Unauthenticated. |
| Upsert rating | Place must exist. | Place not found. |
| Upsert rating | If no rating exists, create one and remove place from all user lists. | Transaction failure if cleanup fails. |
| Upsert rating | If rating exists, update rating and notes. | No second rating row. |
| View notes | Current user must own the rating. | Notes omitted or forbidden. |

## Search Validation

| Parameter | Rule | Error Condition |
| --- | --- | --- |
| q | Optional place-name query. | Too long when over 120 characters. |
| type | Optional for place list; if present, must be `restaurant`, `cafe`, or `ice_cream`. | Unsupported type. |
| subtype | Optional; requires `type` and must be valid for the selected type. | Missing type or incompatible subtype. |
| sort | Must be `rating_desc`. | Unsupported sort. |
| limit | Positive integer up to 100. | Invalid limit. |
| offset | 0 or greater. | Invalid offset. |

Search does not accept location, neighborhood, distance, category, popularity, trending, or recommendation parameters.

## Visibility Validation

| Scenario | Rule |
| --- | --- |
| Guest views any list | Rejected with authentication required. |
| Owner views own private list | Allowed. |
| Owner views own public list | Allowed. |
| Authenticated non-owner views public list | Allowed in read-only mode. |
| Authenticated non-owner views private list | Rejected. |
| Authenticated non-owner modifies public list | Rejected. |

## API Input Hygiene

- Reject unknown enum values.
- Trim string fields before validation.
- Store display values after trimming.
- Store normalized values for uniqueness checks.
- Do not allow client-supplied owner IDs for owned resources.
- Ignore or reject client-supplied aggregate fields such as average rating and rating count.
- Do not expose another user's rating notes in any response.

## Recommended Error Messages

| Condition | User-Facing Message |
| --- | --- |
| Guest access | Sign in to continue. |
| Blank place name | Place name is required. |
| Duplicate place name | A place with this name already exists. |
| Missing place type | Choose Restaurant or Cafe. |
| Blank list name | List name is required. |
| Missing visibility | Choose Public or Private. |
| Missing rating | Rating is required. |
| Rating out of range | Choose a rating from 1 to 10. |
| Private list | This list is not available. |
| Unsupported search | Search is by place name only. |
