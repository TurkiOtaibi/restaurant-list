# 7. User Flows

## Flow 1: Register

**Actor:** Guest

**Entry Point:** Registration

**Steps:**

1. Guest enters display name, email, password, and password confirmation.
2. System validates email uniqueness and password rules.
3. System creates the user account.
4. System returns a JWT access token and refresh token.
5. User enters the authenticated app shell.

**Success State:** User can access My Lists, Places, and My Profile.

**Failure States:**

- Email is invalid.
- Email already exists.
- Password fails validation.

## Flow 2: Login

**Actor:** Guest

**Entry Point:** Login

**Steps:**

1. Guest enters email and password.
2. System validates credentials.
3. System returns a JWT access token and refresh token.
4. User enters the authenticated app shell.

**Success State:** User is authenticated.

**Failure States:**

- Credentials are invalid.
- Account does not exist.

## Flow 3: Create A List

**Actor:** Authenticated User

**Entry Point:** My Lists

**Steps:**

1. User opens My Lists.
2. User selects Create List.
3. System displays list form.
4. User enters list name.
5. User selects Public or Private visibility.
6. User submits.
7. System validates name and visibility.
8. System creates the list.
9. System returns the user to list detail or My Lists.

**Success State:** New list appears in My Lists.

**Failure States:**

- Name is blank.
- Visibility is missing or invalid.
- User is not authenticated.

## Flow 4: Edit A List

**Actor:** List Owner

**Entry Point:** List Detail

**Steps:**

1. User opens an owned list.
2. User selects Edit.
3. System displays current name and visibility.
4. User updates fields.
5. User submits.
6. System validates ownership and input.
7. System saves changes.

**Success State:** Updated list metadata is displayed.

**Failure States:**

- User is not the owner.
- List no longer exists.
- Name is blank.

## Flow 5: Delete A List

**Actor:** List Owner

**Entry Point:** List Detail or My Lists

**Steps:**

1. User selects Delete List.
2. System asks for confirmation.
3. User confirms.
4. System validates ownership.
5. System deletes the list and its list-place memberships.
6. System returns the user to My Lists.

**Success State:** List no longer appears.

**Failure States:**

- User cancels confirmation.
- User is not the owner.
- List no longer exists.

## Flow 6: Add Existing Place To One List

**Actor:** List Owner

**Entry Point:** List Detail, Place Detail, or Places

**Steps:**

1. User selects Add Place from an owned list or Add To List from Place Detail.
2. System displays a search dialog/sheet.
3. User searches existing places by name.
4. System searches the server-side catalog using bounded pagination.
5. User selects one place.
6. System validates list ownership.
7. System validates the place exists.
8. System checks whether the place is already in the list.
9. If already present, system returns idempotent success and creates no duplicate.
10. If not present, system adds the place to the selected list.
11. If the place is already tried by the user, system preserves tried status and displays Tried indicator where applicable.

**Success State:** Place appears once in the selected list.

**Failure States:**

- User does not own the list.
- Place no longer exists.
- List no longer exists.

## Flow 7: Create New Place While Adding To A List

**Actor:** List Owner

**Entry Point:** List Detail

**Steps:**

1. User opens a list they own.
2. User selects Add Place.
3. User chooses Create New Place.
4. User enters name, primary type, and required subtype when applicable.
5. System validates required fields and duplicate place name.
6. System creates the place.
7. System adds the new place to the current list.

**Success State:** New place appears in the list and in Places under the correct type filter.

**Failure States:**

- Name is blank.
- Type or required subtype is missing or invalid.
- Duplicate place name exists.
- List no longer exists.

## Flow 8: Browse Places

**Actor:** Authenticated User

**Entry Point:** Places main navigation

**Steps:**

1. User opens Places.
2. System retrieves places with bounded pagination.
3. System defaults to the restaurant filter unless a saved URL parameter selects another type.
4. User may filter by restaurants, cafes, or ice cream.
5. User may filter restaurant/cafe subtype when applicable.
6. System displays compact rows with name, type, subtype, and community rating when available.
7. User opens Place Detail from a row.

**Success State:** User can scan places and open a place detail.

**Failure States:**

- No places exist.
- No places match the selected filters.
- Place list request fails.

## Flow 9: Browse Legacy Restaurant/Cafe URLs

**Actor:** Authenticated User

**Entry Point:** Existing `/restaurants` or `/cafes` link

**Steps:**

1. User opens `/restaurants` or `/cafes`.
2. System redirects to `/places?type=restaurant` or `/places?type=cafe`.
3. Places page applies the appropriate filter.

**Success State:** Old links remain usable without restoring separate primary navigation tabs.

**Failure States:**

- User is not authenticated and is redirected through the protected-route flow.

## Flow 10: Search Places By Name

**Actor:** Authenticated User

**Entry Point:** Places, Add Existing Place, or Place Search UI

**Steps:**

1. User enters a place-name search query.
2. System searches place names only.
3. System returns bounded results sorted by rating-desc behavior, with unrated places last.
4. System excludes recommendations, trending, popularity sorting, location results, and category exploration.

**Success State:** User sees matching existing places by name.

**Failure States:**

- Search query is too long.
- No matching places exist.

## Flow 11: View Place Detail

**Actor:** Authenticated User

**Entry Point:** Place row in list, Places, search, or profile

**Steps:**

1. User opens a place.
2. System retrieves place detail.
3. System displays name, type, optional description, average rating, rating count, and Tried indicator if applicable.
4. If the current user has rated the place, system displays the current user's rating and private notes.
5. System never displays another user's notes.

**Success State:** User sees place detail and allowed actions.

**Failure States:**

- Place no longer exists.
- User is not authenticated.

## Flow 12: Mark Place As Tried

**Actor:** Authenticated User

**Entry Point:** Restaurant item, cafe item, list item, place detail, or profile

**Steps:**

1. User selects Mark As Tried or submits a rating for an unrated place.
2. System displays rating form.
3. User selects rating from 1 to 10 in 0.5 increments.
4. User optionally enters notes.
5. User submits.
6. System validates rating and normalizes blank notes to null.
7. System creates the user's first rating for the place.
8. System removes the place from all lists owned by the user in the same transaction.
9. System recalculates average rating and rating count from the ratings table.
10. System confirms success.

**Success State:** Place no longer appears in the user's lists, appears in `تقييماتك`, and shows Tried indicator.

**Failure States:**

- Rating is missing.
- Rating is outside 1 to 10 or not aligned to a 0.5 step.
- Place no longer exists.

## Flow 13: Update Existing Rating

**Actor:** Rating Owner

**Entry Point:** My Profile, place item, or Place Detail

**Steps:**

1. User selects Edit Rating or submits a rating for an already-rated place.
2. System displays existing rating and private notes.
3. User updates rating and/or notes.
4. User submits.
5. System validates ownership and input.
6. System updates the existing rating.
7. System stores blank notes as null.
8. System recalculates average rating and rating count from the ratings table.
9. System preserves any list memberships created after the first rating.

**Success State:** User's updated rating appears and the place remains tried.

**Failure States:**

- User is not rating owner.
- Rating value is invalid.
- Rating no longer exists.

## Flow 14: Re-Add Tried Place To A List

**Actor:** Authenticated User

**Entry Point:** Place Detail, Places, or My Profile

**Steps:**

1. User selects Add To List for a place they already tried.
2. User selects one owned target list.
3. System adds the place if it is not already in that list.
4. System returns idempotent success if it is already in that list.
5. System preserves the existing rating and Tried status.

**Success State:** Tried place appears in the selected list with a Tried indicator.

**Failure States:**

- User does not own the list.
- Place or list no longer exists.

## Flow 15: View My Profile

**Actor:** Authenticated User

**Entry Point:** My Profile main navigation

**Steps:**

1. User opens My Profile.
2. System calculates lists count.
3. System calculates restaurants tried count.
4. System calculates cafes tried count.
5. System retrieves rating archive entries with current user's rating and private notes.
6. System displays profile summary and `تقييماتك`.

**Success State:** User sees their counts, ratings archive, and private notes.

**Failure States:**

- User is not authenticated.
- Profile data request fails.

## Flow 16: View Public List

**Actor:** Authenticated Public Viewer

**Entry Point:** Public list route

**Steps:**

1. Authenticated viewer opens a public list.
2. System validates authentication.
3. System validates list visibility.
4. System displays list name, owner display name, and places.
5. System suppresses owner-only edit controls.
6. System never displays rating notes from the list owner or any other user.

**Success State:** Viewer can read the public list in read-only mode.

**Failure States:**

- Viewer is a guest.
- List is private.
- List no longer exists.
