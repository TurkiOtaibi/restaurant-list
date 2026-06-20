# 15. UX Recommendations

## UX Strategy

The MVP should feel like a calm personal tracker, not a discovery marketplace. The interface should make it easy to capture places quickly, manage lists, search known places by name, and close the loop after trying a place.

## Navigation

- Use the required four-item main navigation exactly: My Lists, Restaurants, Cafes, My Profile.
- Keep authentication screens outside the main app shell.
- Keep navigation persistent on desktop.
- Use a compact bottom navigation or top navigation on mobile.
- Show the active section clearly.

## Authentication UX

- Provide email/password registration and login only.
- Do not show Google, Apple, or social login buttons.
- On guest attempts to access MVP data, route to login with a short "Sign in to continue" message.

## My Lists UX

- Make Create List prominent on the My Lists screen.
- Display list visibility with a clear Public or Private label.
- Show place count for each list.
- Allow duplicate list names without warning unless later product data proves confusion.
- Confirm before deleting a list.

## List Detail UX

- Put Add Place near the list title.
- Let users choose between Add Existing Place and Create New Place.
- One Add To List action targets one list only.
- Show place type, average rating, rating count, and Tried indicator for each saved place.
- Include Mark As Tried or Edit Rating directly on each place row.
- After first rating succeeds, remove the place from the list immediately and show a short confirmation.
- If a tried place is later re-added, show the Tried indicator.

## Restaurants and Cafes UX

- Keep Restaurants and Cafes visually parallel.
- Each place row should show:
  - Name.
  - Average rating with one decimal place, or unrated state.
  - Rating count.
  - Tried indicator when applicable.
  - Add To List.
  - Mark As Tried or Edit Rating.
  - Open Place Detail.
- Avoid map-like UI, distance sorting, location filters, popularity ranking, trending, and recommendations.
- Provide simple name search only.

## Place Detail UX

- Place Detail is part of MVP.
- Show:
  - Name.
  - Type.
  - Optional description.
  - Average rating with one decimal place.
  - Rating count.
  - Tried indicator.
  - Current user's rating and private notes if rated.
- Never show another user's notes.
- Do not provide place edit actions.

## Rating UX

- Use a clear 1 to 10 control with visible numeric values.
- Do not hide the requirement that rating is mandatory.
- Keep notes visibly optional and private.
- On edit, prefill the previous rating and private notes.
- Store blank notes as null.
- After first save, confirm the result and update nearby tried indicator and aggregate data.

## Tried Places UX

- My Profile should make tried places easy to scan.
- Use one tried places list that includes:
  - Place name.
  - Type.
  - User's rating.
  - User's private notes if present.
  - Last updated date.
  - Open Place Detail.
  - Edit Rating.

## Public and Private UX

- Visibility should be selected when creating a list.
- Use plain labels: Public and Private.
- Explain visibility in concise helper text:
  - Public: Signed-in users can view this list.
  - Private: Only you can view this list.
- Public list pages should not show owner-only controls to non-owners.
- Public list pages may show owner display name only.
- Public list pages must not show rating notes from the owner or other users.

## Search UX

- Label search as place-name search.
- Do not include prompts like "Explore", "Discover", "Trending", or "Recommended".
- Empty or no-result states should not suggest unrelated places.
- Results should sort by name ascending.

## Empty States

| Screen | Empty State Direction |
| --- | --- |
| My Lists | Prompt user to create a first list. |
| List Detail | Prompt owner to add or create a place. |
| Restaurants | Explain that no restaurants have been added yet. |
| Cafes | Explain that no cafes have been added yet. |
| My Profile | Explain that tried places appear after rating a place. |
| Search | Explain that no places matched the name search. |

## Error States

- Use field-level validation where possible.
- Use non-destructive inline messages for recoverable errors.
- Use confirmation dialogs only for destructive delete actions.
- For private or inaccessible resources, use neutral messaging such as "This list is not available."
- For guest access, use "Sign in to continue."

## Accessibility Recommendations

- All form fields require labels.
- Rating control must be operable by keyboard.
- Rating values must be announced by screen readers.
- Do not rely on color alone for Public/Private, Tried, or rating states.
- Maintain sufficient text contrast.
- Ensure dialogs trap focus and return focus after closing.

## Product Tone

Use direct tracker language:

- "Add To List"
- "Mark As Tried"
- "Edit Rating"
- "Tried Places"
- "Search by place name"

Avoid discovery/review language:

- "Explore nearby"
- "Trending"
- "Popular"
- "Recommended for you"
- "Follow"
- "Review feed"
