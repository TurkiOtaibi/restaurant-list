# 6. User Roles & Permissions

## Role Model

The MVP has no admin moderation, business owner, social, or anonymous browsing role. Permissions are based on authentication state and ownership.

## Roles

| Role | Description |
| --- | --- |
| Guest | An unauthenticated visitor. Can access registration and login only. Cannot view lists, places, ratings, restaurants, cafes, profile, search, or public lists. |
| Authenticated User | A signed-in user using email/password with a valid JWT access token. Can create places, manage owned lists, add places to owned lists, search places by name, and rate places. |
| List Owner | The authenticated user who owns a specific list. Has full control over that list. |
| Rating Owner | The authenticated user who created a specific rating. Can view private notes and update the rating. |
| Authenticated Public Viewer | An authenticated non-owner viewing another user's public list in read-only mode. |
| System | Backend services enforcing validation, tokens, authorization, transactions, and response shaping. |

## Permission Matrix

| Capability | Guest | Authenticated User | Owner Required |
| --- | --- | --- | --- |
| Register with email/password | Yes | No | No |
| Login with email/password | Yes | No | No |
| Refresh token | No | Yes | Current user token |
| View own lists | No | Yes | Current user |
| Create list | No | Yes | Current user |
| Edit list | No | Yes | List owner |
| Delete list | No | Yes | List owner |
| View public list | No | Yes | No, but must be authenticated |
| View private list | No | Yes | List owner |
| Add place to own list | No | Yes | List owner |
| Remove place from own list | No | Yes | List owner |
| Create place | No | Yes | No owner; place becomes shared catalog record |
| Edit place | No | No | Not in MVP |
| View restaurants | No | Yes | No |
| View cafes | No | Yes | No |
| Search places by name | No | Yes | No |
| View place detail | No | Yes | No |
| Mark place as tried | No | Yes | Current user |
| Update own rating | No | Yes | Rating owner |
| View own rating notes | No | Yes | Rating owner |
| View another user's rating notes | No | No | Not allowed |
| View own profile | No | Yes | Current user |
| View another user's private list | No | No | Not allowed |
| Modify another user's public list | No | No | Not allowed |

## Authorization Principles

- Every `/api/v1` MVP resource endpoint requires authentication.
- JWT access tokens identify the current user.
- Refresh tokens are used only to issue new access tokens and can be revoked.
- Ownership is checked server-side for every write operation.
- Client-side hiding of actions improves usability but is not a security control.
- Private list contents must not be returned in API responses to non-owners.
- Public list views are read-only to authenticated non-owners.
- Public list views may expose owner display name only.
- Rating notes are private and visible only to the rating owner.
- Place records are shared and not owned by the user who created them.
- Users can create places but cannot edit places in MVP.

## MVP Role Exclusions

The following roles and login methods are intentionally excluded:

- Admin moderator.
- Restaurant owner.
- Cafe owner.
- Content editor.
- Social follower.
- Reviewer hierarchy or expert user.
- Google login.
- Apple login.
- Social login.
