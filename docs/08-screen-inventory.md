# 8. Screen Inventory

## Navigation Shell

**Purpose:** Provide persistent access to the three required product areas.

**Navigation Items:**

- قوائمي / My Lists.
- الأماكن / Places.
- صفحتي / My Profile.

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
- Primary type: Restaurant, Cafe, or Ice Cream.
- Restaurant subtype when type is Restaurant.
- Cafe subtype when type is Cafe.

**Actions:**

- Create Place.
- Create and Add to List when opened from list context.
- Cancel.

**Validation:**

- Name required.
- Type required.
- Restaurant subtype required for restaurants.
- Cafe subtype required for cafes.
- Ice cream must not include subtype.
- Name must be globally unique.

**Excluded:**

- Place editing.
- Branches.
- Location.
- Neighborhood.

## Screen 8: Places

**Purpose:** Browse/search places through one canonical Places screen.

**Primary Content:**

- Primary type filters: restaurants, cafes, ice cream.
- Restaurant/cafe subtype filter.
- Place name search.
- Place name.
- Place type and subtype.
- Average rating displayed with one decimal place.
- Rating count when useful.

**Actions:**

- Open Place Detail.
- Search by place name.

## Screen 9: Place Detail

**Purpose:** Show details for one place.

**Primary Content:**

- Name.
- Type.
- Subtype when applicable.
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

## Screen 10: Rate Place

**Purpose:** Capture a user's rating and optional private notes.

**Fields:**

- Rating from 1 to 10 in 0.5 increments.
- Notes optional.

**Actions:**

- Save.
- Cancel.

**Validation:**

- Rating required.
- Rating must be from 1 to 10 in 0.5 increments.
- Blank notes are stored as null.

**Post-Save Behavior:**

- First rating removes place from all user lists.
- Existing rating update preserves later re-added list memberships.
- Place shows Tried indicator.

## Screen 11: My Profile

**Purpose:** Show personal summary and rating archive.

**Primary Content:**

- Lists count.
- Restaurants tried count.
- Cafes tried count.
- Ice cream tried count.
- `تقييماتك` rating archive.
- User's rating.
- User's private notes if present.
- Last updated date.

**Actions:**

- Edit Rating from rating archive row.
- Open Place Detail.

## Screen 12: Public List View

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
