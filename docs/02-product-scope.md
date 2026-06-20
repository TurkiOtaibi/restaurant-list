# 2. Product Scope

## Scope Summary

The MVP includes a user-owned wishlist and rating system for restaurants and cafes. Places are shared catalog records, while lists and ratings are user-specific.

## In Scope

### Account Context

- Users have authenticated accounts.
- Authentication uses email and password.
- Sessions use JWT access tokens and refresh tokens.
- Google login, Apple login, and social login are out of scope.
- Each list belongs to one user.
- Each rating belongs to one user and one place.
- Public list visibility depends on list ownership and visibility status.
- Anonymous users cannot access any list.

### Main Navigation

- My Lists.
- Restaurants.
- Cafes.
- My Profile.

### My Lists

Users can:

- Create a list.
- Edit a list.
- Delete a list.
- Set list visibility to Public or Private.
- Add an existing place to a list.
- Create a new place while adding to a list.
- Remove a place from a list.
- Re-add a tried place to a list later; the place remains tried and displays a Tried indicator.

Examples of list names:

- Burgers.
- Italian Restaurants.
- Must Try.
- Breakfast Places.

### Places

A place can be one of:

- Restaurant.
- Cafe.

Required fields:

- Name.
- Type.

Optional fields:

- Description.

Place names are globally unique across all place types in the MVP.

Users can create places. Users cannot edit places in MVP. Operational correction workflows are out of scope.

### Restaurants Section

Displays all places where `type = restaurant`.

Each place displays:

- Name.
- Average rating.
- Rating count.

Each place supports:

- Add To List.
- Mark As Tried.

If the current user already rated the place, the Mark As Tried action becomes Edit Rating and the place displays a Tried indicator.

### Cafes Section

Displays all places where `type = cafe`.

The behavior matches the Restaurants section.

### Mark As Tried

When a user marks a place as tried, the system requires:

- Rating from 1 to 10.
- Optional notes.

After a successful first rating for a user/place:

- The place is removed from all of that user's lists.
- The place appears in that user's tried places.
- The place contributes to community average rating and rating count.

If the user later re-adds the tried place to a list, the place keeps its Tried status and no second rating is created.

### My Profile

The profile displays:

- Lists count.
- Restaurants tried count.
- Cafes tried count.
- User ratings.
- Tried places.

### Public and Private Lists

Public lists:

- Visible only to authenticated users.
- Read-only to non-owners.

Private lists:

- Visible only to the owner.

Guest users cannot view public or private lists.

## Out of Scope

The MVP excludes:

- Maps.
- GPS.
- Branch management.
- Location fields.
- Neighborhood fields.
- Restaurant discovery workflows.
- Social feed.
- Following users.
- Comments.
- Photos.
- AI recommendations.
- Notifications.
- Admin moderation workflows.
- Google login.
- Apple login.
- Social login.
- User-facing place editing.
- Operational correction workflows.
- Public share URLs.
- Reservation links.
- Menu management.
- Opening hours.
- Price range.
- Dietary tags.
- Cuisine taxonomy.
- Multi-branch chains.
- Business owner accounts.

## Assumptions

- Authentication is email and password with JWT access tokens and refresh tokens.
- A place is a single canonical record with a unique name.
- Lists are primarily for organizing places the user wants to try. A place is removed from all of the user's lists when first marked tried, but the user may intentionally re-add it later. Re-added tried places must show a Tried indicator.
- Tried status is derived from the existence of a user rating.
- Community ratings are aggregated from all user ratings.
- Other authenticated users can view public lists but cannot modify them.
- Rating notes are private to the rating owner.
- Average rating and rating count are calculated from the ratings table.

## MVP Boundary

The MVP must remain small enough for a first release while still production-ready. Production-ready means the app must include correct permissions, reliable data integrity, validation, traceable requirements, edge-case handling, and test strategy. It does not mean the MVP must include broad product expansion features.

## Primary Success Metrics

- Number of lists created per active user.
- Number of places added to lists.
- Percentage of listed places eventually marked as tried.
- Number of ratings created.
- Number of rating edits.
- Ratio of private to public lists.
- Repeat usage rate for returning to My Lists and My Profile.
