# سجل - Product Feature Map

Updated: 2026-06-24
Product type: Arabic-first restaurant / cafe / ice-cream logging, rating, list, and personal archive system.

Implementation is authoritative where historical docs conflict with current code and this feature map.

## System

سجل
├── Authentication & Account Access
├── قوائمي / Lists
├── الأماكن / Places
├── Place Details
├── Ratings
├── صفحتي / Profile Archive
├── Public Lists
├── Responsive / Accessibility
├── System / Operations
└── Developer / QA Capabilities

## Authentication & Account Access

### Register

- Create account with display name, email, and password.
- Store display name as public-safe metadata.
- Create refresh-token-backed session after registration.
- Reject duplicate email.
- No Google, Apple, or social login.

Rules:

- Email is required and unique.
- Password is required and constrained by backend validation.
- Display name is required in UI; backend normalizes and defaults missing legacy payloads to `مستخدم سجل`.

Evidence:

- `frontend/app/register/page.tsx`
- `backend/app/api/auth.py`
- `backend/app/modules/auth/models.py`
- `backend/tests/api/test_auth.py`

### Login, Refresh, Logout

- Login with email/password.
- Access token is held by frontend token flow.
- Refresh token is stored in HttpOnly cookie.
- Refresh rotates tokens.
- Logout revokes refresh token.

Evidence:

- `frontend/src/lib/api.ts`
- `backend/app/modules/auth/services.py`
- `backend/tests/api/test_auth.py`

### Protected Access

- Guests cannot access lists, places, ratings, profile, or public lists.
- Protected frontend routes show/redirect to auth flows.

## قوائمي / Lists

### My Lists

- View owned lists.
- Show list count and total place count.
- Open owned list detail.
- Public lists entry is secondary.

Actions:

- Create list.
- Edit list.
- Delete list.
- Open list.

Rules:

- Duplicate list names are allowed.
- Lists belong to one user.
- Visibility is `private` or `public`.

### Create / Edit / Delete List

- Create list with name.
- Create accepts `visibility`; default is private when omitted.
- Edit supports rename and visibility change.
- Delete requires confirmation and deletes list memberships only.

Authorization:

- Only owner can manage a list.

### List Detail

- Show list name, visibility, place count, and places.
- Owner can add/remove places.
- Owner can edit/delete list.
- Place rows open Place Detail.

### Add Place To List

- User searches existing places server-side.
- Search uses `GET /api/v1/places?q=...&limit=20&sort=rating_desc`.
- User adds one place to one list.
- Duplicate add is idempotent and creates no duplicate row.
- Tried place can be re-added without changing rating/tried status.

Evidence:

- `frontend/src/features/lists/AddPlaceDialog.tsx`
- `backend/app/api/lists.py`
- `backend/app/api/places.py`
- `backend/tests/api/test_places_and_lists.py`

## الأماكن / Places

### Browse Places

- One canonical Places page.
- Primary filters:
  - restaurants
  - cafes
  - ice cream
- Restaurant/cafe subtype filters.
- Ice cream has no subtype filter.
- Search by place name only.
- Default sorting is rating descending with unrated places last.

Rules:

- Public catalog requires authenticated access.
- No recommendations, trending, maps, location, or discovery ranking.
- Legacy `/restaurants` and `/cafes` redirect to Places filters and are hidden from primary navigation.

### Create Place

- Create restaurant with required restaurant subtype.
- Create cafe with required cafe subtype.
- Create ice cream with no subtype.
- Name is globally unique by normalized name.
- Users cannot edit places in MVP/beta.
- `description` is reserved backend metadata and not current user-facing create UI.

### Place Detail

- Show place name, type, subtype, community rating, rating count.
- Show current user's list membership if present.
- Show current user's rating if present.
- Actions:
  - Add to list.
  - Rate / edit rating.

Privacy:

- Another user's private rating notes are never exposed.

## Ratings

### Create / Update Rating

- Rating scale is 1 through 10 in 0.5 increments.
- Optional notes are private.
- Blank notes are stored as null.
- One rating per user/place.
- `POST /ratings` creates or upserts:
  - 201 when a new row is created.
  - 200 when an existing row is updated.
- `PATCH /ratings/{place_id}` updates an existing rating.

### Tried Status

- Tried status is derived from a rating row.
- No tried table exists.
- First rating removes the place from all lists owned by that user.
- Updating a rating preserves list memberships created after first rating.
- Tried places may be re-added later.

### Community Ratings

- Average rating is calculated from `ratings`.
- Rating count is calculated from `ratings`.
- Average displays with one decimal place.
- No cached aggregate table is required.

## صفحتي / Profile Archive

### Profile Summary

- Lists count.
- Tried restaurant count.
- Tried cafe count.
- Tried ice cream count.
- Ratings created count.

### Rating Archive

- `تقييماتك` is the only archive model.
- It is the source of truth for tried places, rating history, and private notes.
- Backend response returns `userRatings`.
- Backend does not return separate `triedPlaces`.
- User can edit a rating from the archive.

### Profile Public Lists

- Shows current user's public lists summary.
- Current implementation filters owned lists client-side; acceptable for beta.
- A dedicated backend filter may be considered for GA if needed.

## Public Lists

### Public List Index

- Authenticated users can browse public lists.
- Guests are rejected.
- Public list summaries include:
  - list name
  - owner display name
  - place count
  - visibility

### Public List Detail

- Authenticated users can view public list detail read-only.
- Private lists are not visible to non-owners.
- Public responses expose `ownerDisplayName` only.
- Public responses do not expose:
  - owner email
  - owner internal user id
  - rating notes
  - private account data

## Responsive / Accessibility

- RTL-native layout.
- Western Arabic numerals in visible UI.
- Bidi isolation for mixed Arabic/English content.
- Safe-area aware mobile layout.
- 200% zoom/adaptive pressure coverage through tests.
- Dialogs and sheets trap focus and restore focus.
- Rating control is keyboard operable.
- Touch target coverage exists in responsive tests.

## System / Operations

- API version prefix: `/api/v1`.
- Collections return `{data, meta}`.
- Pagination uses `limit` and `offset`.
- Errors use structured details.
- Backend health:
  - `/health/live`
  - `/health/ready`
- Frontend health:
  - `/health`
  - `/api/health`
- Frontend health service id: `sijil-frontend`.
- Alembic migrations manage schema, including display-name migration.

## Developer / QA Capabilities

- Backend tests cover auth, places, lists, ratings, profile, public-list authorization, DB constraints.
- Frontend tests cover auth gating, responsive layout, health, and app smoke flows.
- CI/release should run lint, typecheck, build, backend tests, and affected Playwright tests before deployment.

## Out Of Scope / Roadmap

- Anonymous public-list browsing.
- Admin console/API.
- User-facing place editing/correction workflow.
- Maps, GPS, photos, comments, follows, recommendations, notifications.
