# 14. Edge Cases

## Authentication

| Edge Case | Expected Handling |
| --- | --- |
| Guest opens any MVP data route. | Reject with authentication required. |
| Guest opens public list URL. | Reject with authentication required. |
| Refresh token is expired or revoked. | Reject refresh and require login. |
| User attempts Google, Apple, or social login. | No such option exists in MVP. |

## Place Creation

| Edge Case | Expected Handling |
| --- | --- |
| Two users create the same place at the same time. | One succeeds. The other receives duplicate-place conflict based on unique normalized name. |
| User enters place name with extra spaces. | Trim and normalize before validation. |
| User creates `Example Cafe` as restaurant, then another user creates `Example Cafe` as cafe. | Reject second create because place name is globally unique in MVP. |
| User tries to create a place without type. | Reject and ask user to choose Restaurant or Cafe. |
| User enters a very long description. | Reject based on maximum length. |
| User tries to edit a place. | No user-facing edit path or update endpoint exists. |

## List Management

| Edge Case | Expected Handling |
| --- | --- |
| User creates two lists with the same name. | Allow both lists. |
| User deletes a list that contains places. | Delete list memberships, not places. |
| User opens a list that was deleted in another tab. | Show not found state and return to My Lists. |
| User edits visibility while another user is viewing the public list. | Subsequent non-owner requests follow latest visibility. If changed to private, non-owner access is rejected. |
| User attempts to modify another user's public list. | Reject server-side. |

## Adding Places To Lists

| Edge Case | Expected Handling |
| --- | --- |
| User adds the same place twice to the same list. | Return idempotent success and create no duplicate list item. |
| User adds a place to multiple lists. | Allow only through separate Add To List actions, one list per action. |
| User submits one request with multiple list IDs. | Reject request. |
| User re-adds a tried place to a list. | Allow, preserve existing rating, and show Tried indicator. |
| User re-adds a tried place already in that list. | Return idempotent success with one list item. |
| Place is deleted operationally before add completes. | Reject as place not found. |
| List is deleted before add completes. | Reject as list not found. |

## Mark As Tried and Rating Upsert

| Edge Case | Expected Handling |
| --- | --- |
| User submits Mark As Tried without rating. | Reject with rating required. |
| User submits rating 0, 11, 7.25, or text. | Reject with rating range/half-step validation. |
| User rates a place that exists in several of their lists for the first time. | Create rating and remove the place from all of their lists in one transaction. |
| User rates a place that is not in any of their lists. | Allow rating and mark as tried. |
| User double-clicks Save while rating. | Unique constraint and upsert behavior produce one rating row. |
| User submits rating for an already-rated place. | Update existing rating and notes. Do not create a second rating. |
| User updates a rating after re-adding the tried place to a list. | Preserve the list membership. |
| Aggregate calculation fails during response rendering. | Rating persists; API returns server error only if response cannot be completed. Aggregates remain derivable from ratings table. |
| User removes notes while editing. | Store notes as null. |
| User tries to view another user's notes. | Notes are omitted or access is rejected. |

## Community Ratings

| Edge Case | Expected Handling |
| --- | --- |
| Place has no ratings. | Show unrated state and rating count 0. |
| Place has one rating. | Average equals that rating and count is 1. |
| Average is 8.333. | Display as 8.3. |
| Two users rate the same place. | Count is 2 and average is calculated from both ratings. |
| User updates rating from 4 to 9. | Average recalculates from ratings table. Count remains unchanged. |

## Public and Private Lists

| Edge Case | Expected Handling |
| --- | --- |
| Guest opens public list URL. | Reject with authentication required. |
| Authenticated non-owner opens private list URL. | Return not found or forbidden without exposing list content. |
| Authenticated public viewer sees a place they have tried. | Show Tried indicator for the viewer's own tried state. Do not expose owner notes. |
| Owner changes public list to private. | Authenticated non-owner access stops immediately. |
| Public list owner has rated a listed place with notes. | Notes are not exposed to viewers. |

## Search

| Edge Case | Expected Handling |
| --- | --- |
| User searches by place name. | Return matching places sorted by name ascending. |
| User attempts location search. | Reject unsupported parameter or ignore with no location behavior. |
| User attempts popularity/trending sort. | Reject unsupported sort. |
| User searches with a long query. | Reject based on maximum query length. |
| Search returns no matches. | Show no-results state without recommendations. |

## Profile

| Edge Case | Expected Handling |
| --- | --- |
| User has no lists. | Show lists count 0 and an empty state. |
| User has no ratings. | Show tried counts 0 and an empty tried places state. |
| User has only cafe ratings. | Restaurants tried count 0, cafes tried count reflects ratings. |
| User has only restaurant ratings. | Cafes tried count 0, restaurants tried count reflects ratings. |
| Tried place has been re-added to a list. | Profile still shows it once as tried. |

## Security and Privacy

| Edge Case | Expected Handling |
| --- | --- |
| User guesses another user's private list ID. | Do not return private list details. |
| Client submits a different `userId` in request body. | Ignore or reject; use authenticated user context. |
| Client submits average rating or rating count when creating place. | Ignore or reject; aggregates are system-calculated from ratings. |
| Client attempts to create unsupported place type. | Reject. |
