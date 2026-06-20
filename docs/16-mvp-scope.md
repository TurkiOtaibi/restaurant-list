# 16. MVP Scope

## MVP Goal

Deliver a production-ready first version that supports personal restaurant and cafe lists, tried-place tracking through ratings, authenticated public/private list visibility, and place-name search.

## MVP Must-Haves

### Authentication

- Email and password registration.
- Email and password login.
- JWT access token.
- Refresh token.
- Logout/revoke refresh token.
- No Google login.
- No Apple login.
- No social login.

### Core Navigation

- My Lists.
- Restaurants.
- Cafes.
- My Profile.

### Lists

- Create list.
- Edit list.
- Delete list.
- Duplicate list names allowed.
- Public/private visibility.
- Public lists visible only to authenticated users.
- Guest list access rejected.
- View own lists.
- View list detail.
- Add existing place to one list.
- Create new place from list context.
- Remove place from list.
- Idempotent duplicate add.
- Re-add tried place with Tried indicator.

### Places

- Create place.
- Place Detail screen.
- Place Detail API.
- Place type: Restaurant or Cafe.
- Required place name.
- Required place type.
- Optional description.
- Unique place name.
- No place editing.
- No operational correction workflow.
- No branches.
- No location.
- No neighborhoods.

### Restaurants

- List all restaurant places.
- Show name, average rating with one decimal place, rating count, and Tried indicator.
- Add To List.
- Mark As Tried or Edit Rating.
- Open Place Detail.
- Search by place name only.

### Cafes

- List all cafe places.
- Show name, average rating with one decimal place, rating count, and Tried indicator.
- Add To List.
- Mark As Tried or Edit Rating.
- Open Place Detail.
- Search by place name only.

### Ratings and Tried Places

- Mark As Tried.
- Required rating from 1 to 10.
- Optional private notes.
- Blank notes stored as null.
- One rating per user per place.
- Rating upsert behavior.
- First rating removes place from all user lists.
- Existing rating update preserves re-added list memberships.
- Tried places may be re-added later.
- Tried places show Tried indicator.
- Tried places shown in profile.
- Average rating calculated from ratings table.
- Rating count calculated from ratings table.

### Profile

- Lists count.
- Restaurants tried count.
- Cafes tried count.
- Tried places list.
- User's rating.
- User's private notes.
- Edit rating.
- Open Place Detail.

### Search

- Place-name search only.
- No recommendations.
- No trending.
- No popularity sorting.
- No discovery features.
- No location search.
- No category exploration.

### Production Readiness

- Authentication and authorization.
- Server-side validation.
- Database constraints.
- Transactional first-rating cleanup.
- Responsive UI.
- Accessibility basics.
- Error and empty states.
- Concrete QA test IDs for Must requirements.

## Explicit Non-MVP Items

Do not include:

- Maps.
- GPS.
- Address fields.
- Branch management.
- Neighborhoods.
- Social feed.
- Following.
- Comments.
- Photos.
- AI recommendations.
- Notifications.
- Admin moderation workflows.
- Public share URLs.
- Google login.
- Apple login.
- Social login.
- User-facing place editing.
- Operational place correction workflows.
- Restaurant discovery ranking.
- Distance or nearby filters.
- Popularity or trending.
- Business owner tools.

## MVP Release Criteria

The MVP is ready when:

- All Must functional requirements pass their mapped test cases.
- All critical business rules are enforced server-side.
- Guest access rejection tests pass.
- Public/private list permission tests pass.
- Rating notes privacy tests pass.
- First rating removes the place from all user lists transactionally.
- Tried place re-add behavior works as specified.
- Duplicate place names are rejected.
- Duplicate list items are prevented idempotently.
- Rating upsert works with one rating row per user/place.
- Search boundary tests pass.
- Place detail API and screen work.
- Community rating calculations are correct and display one decimal place.
- My Profile counts are correct.
- Basic accessibility checks pass.
- No out-of-scope features have been introduced.

## MVP Non-Goals

- Maximizing public content.
- Becoming a restaurant search engine.
- Replacing map applications.
- Hosting public review discussions.
- Supporting restaurant businesses.
- Optimizing for viral sharing.
