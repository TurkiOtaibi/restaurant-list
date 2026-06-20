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

**Success State:** User can access My Lists, Restaurants, Cafes, and My Profile.

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

**Entry Point:** List Detail, Place Detail, Restaurants, or Cafes

**Steps:**

1. User selects Add To List for one place.
2. System displays owned target lists.
3. User selects exactly one target list.
4. System validates list ownership.
5. System validates the place exists.
6. System checks whether the place is already in the list.
7. If already present, system returns idempotent success and creates no duplicate.
8. If not present, system adds the place to the selected list.
9. If the place is already tried by the user, system preserves tried status and displays Tried indicator.

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
4. User enters name, type, and optional description.
5. System validates required fields and duplicate place name.
6. System creates the place.
7. System adds the new place to the current list.

**Success State:** New place appears in the list and in Restaurants or Cafes according to type.

**Failure States:**

- Name is blank.
- Type is missing or invalid.
- Duplicate place name exists.
- List no longer exists.

## Flow 8: Browse Restaurants

**Actor:** Authenticated User

**Entry Point:** Restaurants main navigation

**Steps:**

1. User opens Restaurants.
2. System retrieves places where type is restaurant.
3. System displays name, average rating, rating count, and Tried indicator when applicable.
4. User may add a place to one list.
5. User may open Place Detail.
6. User may mark a place as tried or edit rating.

**Success State:** User can scan restaurants and take allowed actions.

**Failure States:**

- No restaurants exist.
- Place list request fails.

## Flow 9: Browse Cafes

**Actor:** Authenticated User

**Entry Point:** Cafes main navigation

**Steps:**

1. User opens Cafes.
2. System retrieves places where type is cafe.
3. System displays name, average rating, rating count, and Tried indicator when applicable.
4. User may add a place to one list.
5. User may open Place Detail.
6. User may mark a place as tried or edit rating.

**Success State:** User can scan cafes and take allowed actions.

**Failure States:**

- No cafes exist.
- Place list request fails.

## Flow 10: Search Places By Name

**Actor:** Authenticated User

**Entry Point:** Restaurants, Cafes, Add Existing Place, or Place Search UI

**Steps:**

1. User enters a place-name search query.
2. System searches place names only.
3. System returns deterministic name-sorted results.
4. System excludes recommendations, trending, popularity sorting, location results, and category exploration.

**Success State:** User sees matching existing places by name.

**Failure States:**

- Search query is too long.
- No matching places exist.

## Flow 11: View Place Detail

**Actor:** Authenticated User

**Entry Point:** Place row in list, Restaurants, Cafes, search, or profile

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
3. User selects rating from 1 to 10.
4. User optionally enters notes.
5. User submits.
6. System validates rating and normalizes blank notes to null.
7. System creates the user's first rating for the place.
8. System removes the place from all lists owned by the user in the same transaction.
9. System recalculates average rating and rating count from the ratings table.
10. System confirms success.

**Success State:** Place no longer appears in the user's lists, appears in Tried Places, and shows Tried indicator.

**Failure States:**

- Rating is missing.
- Rating is outside 1 to 10.
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

**Entry Point:** Place Detail, Restaurants, Cafes, or My Profile

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
5. System retrieves tried places with current user's rating and private notes.
6. System displays profile summary and tried places.

**Success State:** User sees their counts, tried places, ratings, and private notes.

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
