# 8. Screen Inventory

## Navigation Shell

**Purpose:** Provide persistent access to the four required product areas.

**Navigation Items:**

- My Lists.
- Restaurants.
- Cafes.
- My Profile.

**Common Elements:**

- Current user session indicator.
- Logout.
- Main content area.
- Loading, empty, and error states.

## Screen 1: Register

**Purpose:** Create an email/password account.

**Fields:**

- Display name.
- Email.
- Password.
- Password confirmation.

**Actions:**

- Register.
- Go to Login.

## Screen 2: Login

**Purpose:** Authenticate an existing user.

**Fields:**

- Email.
- Password.

**Actions:**

- Login.
- Go to Register.

## Screen 3: My Lists

**Purpose:** Let users manage their lists.

**Primary Content:**

- List rows.
- List name.
- Visibility status.
- Count of places in each list.

**Actions:**

- Create List.
- Open List.
- Edit List.
- Delete List.

## Screen 4: Create/Edit List

**Purpose:** Capture list metadata.

**Fields:**

- Name.
- Visibility: Public or Private.

**Actions:**

- Save.
- Cancel.

**Validation:**

- Name required.
- Visibility required.
- Duplicate list names are allowed.

## Screen 5: List Detail

**Purpose:** Display places saved in a user list.

**Primary Content:**

- List name.
- Visibility.
- Owner display name when viewing another user's public list.
- Places in list.
- Place name.
- Place type.
- Average rating displayed with one decimal place.
- Rating count.
- Tried indicator for places rated by the current user.

**Owner Actions:**

- Edit List.
- Delete List.
- Add Existing Place.
- Create New Place.
- Remove Place.
- Mark As Tried.
- Edit Rating when tried.
- Open Place Detail.

**Authenticated Public Viewer Actions:**

- View only.
- Open Place Detail.
- Add the listed place to one of the viewer's own lists from place context.

**States:**

- Empty list.
- Private access denied or not found.
- Public read-only view.
- Guest authentication required.

## Screen 6: Add Existing Place To List

**Purpose:** Add one known place to one owned list.

**Primary Content:**

- Place-name search.
- Place type indicator.
- Average rating.
- Rating count.
- Tried indicator when current user has rated the place.
- One target list selection.

**Actions:**

- Add selected place to selected list.
- Cancel.

**Validation:**

- Place must exist.
- User must own list.
- Duplicate add returns idempotent success.

## Screen 7: Create New Place

**Purpose:** Create a shared place record.

**Fields:**

- Name.
- Type: Restaurant or Cafe.
- Description optional.

**Actions:**

- Create Place.
- Create and Add to List when opened from list context.
- Cancel.

**Validation:**

- Name required.
- Type required.
- Name must be globally unique.

**Excluded:**

- Place editing.
- Branches.
- Location.
- Neighborhood.

## Screen 8: Restaurants

**Purpose:** Show all restaurant places.

**Primary Content:**

- Restaurant name.
- Average rating displayed with one decimal place.
- Rating count.
- Tried indicator when current user has rated the place.

**Actions:**

- Add To List.
- Mark As Tried.
- Edit Rating when already tried.
- Open Place Detail.
- Search by place name.

## Screen 9: Cafes

**Purpose:** Show all cafe places.

**Primary Content:**

- Cafe name.
- Average rating displayed with one decimal place.
- Rating count.
- Tried indicator when current user has rated the place.

**Actions:**

- Add To List.
- Mark As Tried.
- Edit Rating when already tried.
- Open Place Detail.
- Search by place name.

## Screen 10: Place Detail

**Purpose:** Show details for one restaurant or cafe.

**Primary Content:**

- Name.
- Type.
- Description if present.
- Average rating displayed with one decimal place.
- Rating count.
- Tried indicator for current user.
- Current user's rating and private notes if the current user rated the place.

**Actions:**

- Add To List.
- Mark As Tried.
- Edit Rating when already tried.

**Privacy:**

- Never display another user's rating notes.

## Screen 11: Mark As Tried

**Purpose:** Capture a user's rating and optional private notes.

**Fields:**

- Rating from 1 to 10.
- Notes optional.

**Actions:**

- Save.
- Cancel.

**Validation:**

- Rating required.
- Rating must be an integer from 1 to 10.
- Blank notes are stored as null.

**Post-Save Behavior:**

- First rating removes place from all user lists.
- Existing rating update preserves later re-added list memberships.
- Place shows Tried indicator.

## Screen 12: My Profile

**Purpose:** Show personal summary and tried places.

**Primary Content:**

- Lists count.
- Restaurants tried count.
- Cafes tried count.
- Tried places list.
- User's rating.
- User's private notes if present.
- Last updated date.

**Actions:**

- Edit Rating from tried place row.
- Open Place Detail.

## Screen 13: Public List View

**Purpose:** Let authenticated non-owners view a public list in read-only mode.

**Primary Content:**

- List name.
- Owner display name.
- Visibility indicator.
- Places in the list.
- Place rating aggregates.
- Tried indicator for places rated by the current viewer.

**Actions:**

- Open Place Detail.
- Add a listed place to one owned list from place context.

**States:**

- Public list available.
- Private list inaccessible.
- List not found.
- Guest authentication required.
