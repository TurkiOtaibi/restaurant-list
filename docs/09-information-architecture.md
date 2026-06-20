# 9. Information Architecture

## IA Principles

- Keep the application organized around the four required main sections.
- Separate list membership from tried status.
- Treat tried status as derived from the current user's rating.
- Treat places as shared catalog records.
- Treat lists and ratings as user-owned.
- Avoid maps, location, discovery ranking, social feeds, comments, photos, and recommendations.

## Top-Level Navigation

```text
Restaurant & Cafe Wishlist Tracker
|-- My Lists
|-- Restaurants
|-- Cafes
|-- My Profile
```

## Application Structure

```text
Auth
|-- Register
|-- Login

My Lists
|-- List Index
|-- Create List
|-- List Detail
|   |-- Edit List
|   |-- Add Existing Place
|   |-- Create New Place
|   |-- Place Detail
|   |-- Mark As Tried
|   |-- Edit Rating

Restaurants
|-- Restaurant Index
|   |-- Place Name Search
|   |-- Place Detail
|   |-- Add To List
|   |-- Mark As Tried
|   |-- Edit Rating

Cafes
|-- Cafe Index
|   |-- Place Name Search
|   |-- Place Detail
|   |-- Add To List
|   |-- Mark As Tried
|   |-- Edit Rating

My Profile
|-- Summary Counts
|-- Tried Places
|   |-- Place Detail
|   |-- Edit Rating

Public Lists
|-- Authenticated Public List Detail
```

## Conceptual Objects

| Object | Ownership | Purpose |
| --- | --- | --- |
| User | System account | Identifies owner of lists and ratings. |
| Refresh Token | User-owned session credential | Allows access token refresh and logout revocation. |
| List | User-owned | Groups places selected by the user. |
| Place | Shared catalog | Represents a restaurant or cafe. |
| List Place | User-owned through list | Connects a place to a list. |
| Rating | User-owned | Marks a place as tried and stores rating/private notes. |

## Route Model

Routes are illustrative and should be adjusted to the final frontend framework.

| Route | Screen | Access |
| --- | --- | --- |
| `/register` | Register | Guest only |
| `/login` | Login | Guest only |
| `/lists` | My Lists | Authenticated user |
| `/lists/new` | Create List | Authenticated user |
| `/lists/:listId` | List Detail or Public List View | Owner or authenticated public viewer if list is public |
| `/lists/:listId/edit` | Edit List | List owner |
| `/places/:placeId` | Place Detail | Authenticated user |
| `/restaurants` | Restaurants | Authenticated user |
| `/cafes` | Cafes | Authenticated user |
| `/profile` | My Profile | Authenticated user |

## Content Relationships

- A user owns many lists.
- A user owns many ratings.
- A user owns many refresh tokens.
- A list contains many places.
- A place can appear in many lists.
- A place has many ratings.
- A user has at most one rating per place.
- A tried place for a user is any place where that user has a rating.
- A tried place may appear in a list if the user re-added it after rating.

## State Definitions

| State | Definition |
| --- | --- |
| Listed | Place is in at least one list owned by the user. |
| Tried | Place has a rating by the user. |
| Listed And Tried | Place is in a user's list and has a rating by that user; display Tried indicator. |
| Public List | List has visibility Public and can be viewed by authenticated non-owners. |
| Private List | List has visibility Private and can be viewed only by owner. |
| Unrated Place | Place has no ratings from any user. |
| Community Rated Place | Place has at least one rating from any user. |

## Search and Filtering

Search remains in MVP but is deliberately narrow.

Allowed:

- Place-name search only.
- Type filter for required Restaurants and Cafes sections.
- Deterministic `name_asc` sorting.

Excluded:

- Location.
- Neighborhood.
- Distance.
- Cuisine/category exploration.
- Price.
- Opening hours.
- Popularity sorting.
- Trending.
- Recommendations.
- Social popularity.
