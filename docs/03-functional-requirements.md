# 3. Functional Requirements

## Requirement Conventions

Functional requirements use the prefix `FR`.

Priority values:

- Must: Required for MVP.
- Should: Strongly recommended after all Must requirements are complete.
- Could: Not committed for MVP.

## Account and Session

| ID | Requirement | Priority | Acceptance Criteria |
| --- | --- | --- | --- |
| FR-001 | The system shall support email and password registration. | Must | A user can create an account with display name, email, and password. |
| FR-002 | The system shall support email and password login. | Must | A registered user receives a JWT access token and refresh token after valid login. |
| FR-003 | The system shall support token refresh. | Must | A valid refresh token can issue a new access token. |
| FR-004 | The system shall support logout. | Must | Logout revokes the submitted refresh token. |
| FR-005 | The system shall reject Google, Apple, and social login. | Must | No OAuth/social login entry points exist in MVP. |
| FR-006 | The system shall identify the current user for every authenticated request. | Must | User-owned resources are scoped to the authenticated user derived from the access token. |
| FR-007 | The system shall reject unauthenticated access to MVP data. | Must | Guests cannot view lists, places, ratings, profile, restaurants, cafes, or public lists. |

## Main Navigation

| ID | Requirement | Priority | Acceptance Criteria |
| --- | --- | --- | --- |
| FR-010 | The system shall provide main navigation for My Lists, Restaurants, Cafes, and My Profile. | Must | Each navigation item routes to the correct section. |
| FR-011 | The system shall preserve authenticated session state while navigating. | Must | A signed-in user can move between sections without re-authenticating until token expiry. |

## My Lists

| ID | Requirement | Priority | Acceptance Criteria |
| --- | --- | --- | --- |
| FR-020 | The system shall allow a user to create a list. | Must | User can enter a valid name, choose visibility, and save the list. |
| FR-021 | The system shall allow duplicate list names for the same user. | Must | A user can create two lists with the same display name. |
| FR-022 | The system shall allow a user to edit a list they own. | Must | User can update list name and visibility. |
| FR-023 | The system shall allow a user to delete a list they own. | Must | Deleted list no longer appears in My Lists and its list-place memberships are removed. |
| FR-024 | The system shall display all lists owned by the current user. | Must | My Lists shows the user's public and private lists. |
| FR-025 | The system shall display list detail including name, visibility, owner permissions, and places in the list. | Must | Opening a list shows its metadata and saved places. |
| FR-026 | The system shall allow users to remove a place from a list they own. | Must | Removed place no longer appears in that list. |
| FR-027 | The system shall prevent non-owners from editing, deleting, or modifying another user's list. | Must | Non-owner write attempts are rejected server-side. |

## Public and Private Lists

| ID | Requirement | Priority | Acceptance Criteria |
| --- | --- | --- | --- |
| FR-030 | The system shall allow a list to be Public or Private. | Must | Visibility is captured on create and edit. |
| FR-031 | The system shall allow authenticated non-owners to view public lists in read-only mode. | Must | A signed-in non-owner can open a public list and cannot modify it. |
| FR-032 | The system shall reject guest access to public lists. | Must | Anonymous requests for public lists return authentication required. |
| FR-033 | The system shall prevent non-owners from viewing private lists. | Must | A signed-in non-owner receives not found or forbidden for a private list. |
| FR-034 | The system shall expose only approved owner data on public list views. | Must | Public list responses include owner display name only and never expose owner email. |

## Adding Places To Lists

| ID | Requirement | Priority | Acceptance Criteria |
| --- | --- | --- | --- |
| FR-040 | The system shall allow a user to add one existing place to one owned list per Add To List action. | Must | User selects exactly one target list and one place is added. |
| FR-041 | The system shall allow a user to create a new place while adding it to one owned list. | Must | User enters place name, type, optional description, and the new place is added to the selected list. |
| FR-042 | The system shall handle duplicate add-to-list requests idempotently. | Must | Adding the same place to the same list again returns success and does not create a duplicate list item. |
| FR-043 | The system shall allow a tried place to be re-added to a list. | Must | Re-added tried places keep Tried status, do not create a second rating, and display a Tried indicator. |
| FR-044 | The system shall allow the same place to appear in multiple lists owned by the same user. | Must | A place can appear in Burgers and Must Try for the same user. |

## Places

| ID | Requirement | Priority | Acceptance Criteria |
| --- | --- | --- | --- |
| FR-050 | The system shall allow creation of a place with name and type. | Must | A valid restaurant or cafe can be created. |
| FR-051 | The system shall allow optional description when creating a place. | Must | Description may be omitted or populated during creation. |
| FR-052 | The system shall prevent duplicate place names globally. | Must | A second place with the same normalized name cannot be created. |
| FR-053 | The system shall not allow user-facing place editing in MVP. | Must | No place edit form or place update endpoint exists. |
| FR-054 | The system shall expose place detail. | Must | Place detail includes name, type, description, average rating, rating count, current user's tried state, and current user's rating if present. |
| FR-055 | The system shall support listing places by type. | Must | Restaurants and Cafes sections show only matching types. |
| FR-056 | The system shall support place-name search only. | Must | Search matches place names and does not use location, recommendations, trending, popularity, or category exploration. |

## Restaurants Section

| ID | Requirement | Priority | Acceptance Criteria |
| --- | --- | --- | --- |
| FR-060 | The system shall display all restaurant places in the Restaurants section. | Must | Only places with type restaurant are shown. |
| FR-061 | Each restaurant item shall display name, average rating with one decimal place, rating count, and Tried indicator when applicable. | Must | Each visible restaurant contains all required display fields. |
| FR-062 | Each restaurant item shall support Add To List. | Must | User can add the restaurant to one owned list. |
| FR-063 | Each restaurant item shall support Mark As Tried or Edit Rating depending on current user's rating state. | Must | Unrated restaurant shows Mark As Tried. Rated restaurant shows Edit Rating and Tried indicator. |

## Cafes Section

| ID | Requirement | Priority | Acceptance Criteria |
| --- | --- | --- | --- |
| FR-070 | The system shall display all cafe places in the Cafes section. | Must | Only places with type cafe are shown. |
| FR-071 | Each cafe item shall display name, average rating with one decimal place, rating count, and Tried indicator when applicable. | Must | Each visible cafe contains all required display fields. |
| FR-072 | Each cafe item shall support Add To List. | Must | User can add the cafe to one owned list. |
| FR-073 | Each cafe item shall support Mark As Tried or Edit Rating depending on current user's rating state. | Must | Unrated cafe shows Mark As Tried. Rated cafe shows Edit Rating and Tried indicator. |

## Mark As Tried and Ratings

| ID | Requirement | Priority | Acceptance Criteria |
| --- | --- | --- | --- |
| FR-080 | The system shall require a rating when a user marks a place as tried. | Must | Submission without rating fails. |
| FR-081 | The system shall allow rating values from 1 to 10 inclusive. | Must | Values outside 1 to 10 are rejected. |
| FR-082 | The system shall allow optional notes when a user marks a place as tried. | Must | User can submit a rating with or without notes. |
| FR-083 | The system shall store blank notes as null. | Must | Empty or whitespace-only notes are saved as null. |
| FR-084 | The system shall enforce one rating per user per place. | Must | Each user/place pair has at most one rating row. |
| FR-085 | The system shall use upsert behavior for repeated rating submissions. | Must | Submitting a rating for an already-rated place updates the existing rating and notes. |
| FR-086 | The system shall remove the place from all of the user's lists after the user's first rating for that place. | Must | No list owned by the user contains that place after first rating creation. |
| FR-087 | The system shall preserve list memberships when updating an existing rating. | Must | Updating a rating for a tried place does not remove it from lists if the user re-added it later. |
| FR-088 | The system shall keep rating notes private to the rating owner. | Must | No user can view another user's rating notes through any API or screen. |
| FR-089 | The system shall show rated places in the user's tried places. | Must | A rated place appears in My Profile tried places. |
| FR-090 | The system shall update current-user tried indicators after rating creation or update. | Must | Rated places show Tried indicator on list, place, restaurant, and cafe views. |

## My Profile

| ID | Requirement | Priority | Acceptance Criteria |
| --- | --- | --- | --- |
| FR-100 | The system shall display the current user's lists count. | Must | Count matches active lists owned by the user. |
| FR-101 | The system shall display the current user's restaurants tried count. | Must | Count matches ratings on restaurant places by the user. |
| FR-102 | The system shall display the current user's cafes tried count. | Must | Count matches ratings on cafe places by the user. |
| FR-103 | The system shall display tried places with the user's rating, private notes if present, and last updated date. | Must | Profile shows one tried places list with place, type, rating, notes, and updated date. |
| FR-104 | The system shall allow editing a rating from My Profile. | Must | User can update their rating and private notes from a tried place row. |

## Community Ratings

| ID | Requirement | Priority | Acceptance Criteria |
| --- | --- | --- | --- |
| FR-110 | The system shall calculate average rating from all user ratings for a place. | Must | Average equals the arithmetic mean of all ratings for the place. |
| FR-111 | The system shall calculate rating count from all user ratings for a place. | Must | Count equals number of ratings for the place. |
| FR-112 | The system shall display average rating with one decimal place. | Must | A value like 8.333 displays as 8.3. |
| FR-113 | The system shall display an unrated state when a place has zero ratings. | Must | Places with no ratings show no average and count 0. |
| FR-114 | The system shall calculate rating aggregates from the ratings table. | Must | No cached aggregate source is required for MVP correctness. |

## Error Handling and Feedback

| ID | Requirement | Priority | Acceptance Criteria |
| --- | --- | --- | --- |
| FR-120 | The system shall show clear validation messages for invalid user input. | Must | Users can understand and correct validation errors. |
| FR-121 | The system shall show a clear duplicate-place message when a name already exists. | Must | Duplicate place attempts identify the conflict without creating a new place. |
| FR-122 | The system shall show a clear permission message or not-found response for inaccessible resources. | Must | Private or unauthorized resources are not exposed. |
| FR-123 | The system shall confirm destructive list deletion before completion. | Must | User must intentionally confirm delete. |
