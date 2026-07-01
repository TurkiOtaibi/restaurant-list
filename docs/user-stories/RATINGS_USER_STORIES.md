# Ratings User Stories

Source of truth:

- `docs/feature-map/FEATURE_MAP.md`
- `docs/feature-map/FEATURE_CATALOG.md`
- `docs/feature-map/FEATURE_TREE.md`
- `docs/feature-map/FEATURE_TRACEABILITY.md`

Scope: all `RATING-*` features from `FEATURE_CATALOG.md`.

Out of scope for this file:

- Rating deletion is not supported.
- The legacy `tried` concept is removed from active product behavior by `docs/engineering-decisions/EDR-009_RATING_LIST_DECOUPLING.md`.
- Public note sharing, comments, reactions, recommendations, moderation, and admin workflows are out of scope.
- Place browsing and list management are covered in their own module user-story files. Ratings must not create list-management side effects.

Total features processed: 9
Total user stories written: 127

## Shared Ratings Business Rules

- Ratings require authentication.
- Each user can have at most one rating per place.
- Rating values are numeric values from 1 to 10 inclusive in 0.5 increments.
- Valid representative values include `1`, `1.5`, `8.5`, and `10`.
- Invalid representative values include `0`, `0.5`, `10.5`, `8.25`, `8.3`, `null`, string values, and non-numeric values.
- Create flow uses `POST /api/v1/ratings`.
- Edit flow uses `PATCH /api/v1/ratings/{place_id}` when an existing rating is known.
- `POST /api/v1/ratings` supports upsert only as API safety behavior.
- `POST /api/v1/ratings` returns `201 Created` when a new rating is created.
- `POST /api/v1/ratings` returns `200 OK` when it updates an existing rating through upsert.
- `PATCH /api/v1/ratings/{place_id}` returns `200 OK` when it updates an existing rating.
- `PATCH /api/v1/ratings/{place_id}` must never create a new rating.
- Validation failures return `422`.
- Missing referenced place or missing existing rating returns `404`.
- Missing authentication returns `401`.
- Forbidden access, where distinguishable from not-found behavior, returns `403`.
- `RatingResponse` fields are exactly `id`, `userId`, `placeId`, `rating`, `notes`, `createdAt`, and `updatedAt`.
- Notes are optional, private, trimmed before save, limited to 1000 characters, and blank notes are stored and returned as `notes: null`.
- Notes must never appear in Places list, Place Detail for non-owner, Public Lists, other users' profile/public data, aggregate responses, logs, or error payloads.
- Creating a rating records a score only; it must not derive tried status and must not add or remove list membership.
- Updating an existing rating records rating changes only; it must not add or remove list membership.
- After successful rating create or update, the UI navigates back to Place Detail and refreshes place context, current-user context, and aggregate rating data.
- Average rating is calculated from the ratings table using full internal precision and displayed with one decimal place.
- Display rounding examples: `8.44 -> 8.4`, `8.45 -> 8.5`, `8.46 -> 8.5`.
- Ratings and counts use Western digits, period decimals, and LTR-safe numeric isolation in RTL UI.
- Rating controls must support keyboard navigation, screen-reader announcements, selected-state announcements, reduced motion, and touch targets of approximately 44px or larger.
- Rating UI must remain usable at 320px, 390px, and 200% zoom.

## Ratings Module

### RATING-001 - Create rating

Feature Description: Authenticated users can create a rating for a place from the rating dialog/page.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| RATING-001-US-001 | Open create rating flow | Critical | As an authenticated user, I want to open the rating flow from a place so that I can log my experience. | Given I am authenticated and viewing a place I have not rated, when I choose the rate action, then the create rating flow opens with no preselected persisted rating. |
| RATING-001-US-002 | Require authentication to create rating | Critical | As the system, I want ratings tied to authenticated users so that logs have an owner. | Given I am not authenticated, when I open or submit create rating, then the UI prompts sign-in and `POST /api/v1/ratings` returns `401` with no rating created. |
| RATING-001-US-003 | Require valid place ID | Critical | As the system, I want rating creation tied to an existing place so that orphan ratings are impossible. | Given `placeId` is missing or empty, when `POST /api/v1/ratings` is submitted, then the API returns `422` and no rating is created. |
| RATING-001-US-004 | Reject nonexistent place | Critical | As the system, I want nonexistent places rejected so that ratings cannot reference invalid catalog records. | Given `placeId` does not exist, when `POST /api/v1/ratings` is submitted, then the API returns `404` and no rating is created. |
| RATING-001-US-005 | Require rating value | Critical | As the system, I want a rating value required so that empty ratings are not stored. | Given `rating` is missing or `null`, when I save, then API validation returns `422` and no rating row is created. |
| RATING-001-US-006 | Create rating successfully | Critical | As an authenticated user, I want to save a rating so that the place is recorded in my archive. | Given valid `placeId`, valid `rating`, and optional `notes`, when `POST /api/v1/ratings` creates a new row, then response status is `201 Created`. |
| RATING-001-US-007 | Return RatingResponse on create | Critical | As an API consumer, I want the created rating response complete so that the UI can refresh state. | Given a rating is created, then response includes `id`, `userId`, `placeId`, `rating`, `notes`, `createdAt`, and `updatedAt`. |
| RATING-001-US-008 | Create rating with optional note | High | As a user, I want to add an optional private note while rating so that I can remember context. | Given valid rating and note text of 1000 characters or fewer, when I save, then the trimmed note is saved only for my rating. |
| RATING-001-US-009 | Create rating without note | High | As a user, I want to rate without writing a note so that logging remains fast. | Given I enter a valid rating and no note, when I save, then rating is saved and `notes` is returned as `null`. |
| RATING-001-US-010 | Show rating-only consequence before save | High | As a user, I want to know rating will not change my lists so that list organization remains predictable. | Given I am creating my first rating for a place, when the rating flow renders, then it communicates that saving records only my rating and does not add or remove the place from lists. |
| RATING-001-US-011 | Prevent duplicate submit during create | High | As a user, I want save protected during submission so that duplicate requests are not sent by repeated taps. | Given save is in progress, when I press save again, then the save action is disabled or busy and no additional client submission is sent. |
| RATING-001-US-012 | Preserve input after create failure | High | As a user, I want to retry after save failure without re-entering data. | Given network or 5xx failure occurs, when the error appears, then selected rating and note draft remain visible and no false success appears. |
| RATING-001-US-013 | Navigate back after create success | Critical | As a user, I want to return to Place Detail after rating so that I can see updated context. | Given rating creation succeeds, when the flow completes, then the app navigates back to Place Detail and refreshes place context, current-user context, and aggregate rating data. |
| RATING-001-US-014 | Cancel create without mutation | Medium | As a user, I want to cancel rating creation without saving. | Given the create rating flow is open with unsaved input, when I cancel, then no `POST /api/v1/ratings` request is sent. |
| RATING-001-US-015 | Keep create dialog accessible | High | As a keyboard or screen-reader user, I want the create rating flow accessible. | Given the rating dialog/sheet opens, then focus moves into it, labels are announced, Escape/cancel closes it, and focus restores to the triggering control. |
| RATING-001-US-016 | Keep mobile create flow usable | High | As a mobile user, I want rating creation usable on small screens. | Given 320px and 390px viewports, when the rating flow opens, then rating controls, notes, save, and cancel remain visible/reachable without horizontal overflow. |
| RATING-001-US-017 | Support 200% zoom on create | High | As a low-vision user, I want rating creation usable at high zoom. | Given 200% browser zoom, when create rating flow opens, then controls reflow without clipping and the focused control is not hidden behind fixed navigation. |
| RATING-001-US-018 | Respect reduced motion | Medium | As a motion-sensitive user, I want rating feedback not to cause discomfort. | Given `prefers-reduced-motion` is enabled, when selecting or saving a rating, then animations are reduced without removing state feedback. |

Story Count: 18

Coverage Assessment: Covers opening, auth, place validation, rating requirement, create success, response schema, optional/null notes, consequence warning, duplicate-submit prevention, failures, navigation/refresh, cancel, accessibility, mobile, zoom, and reduced motion.

Missing Assumptions: None.

Risks: Critical business risk if rating creation changes list membership, reintroduces tried state, corrupts aggregates, or misrepresents the profile archive.

### RATING-002 - Edit existing rating

Feature Description: Rating owners can edit an existing rating using `PATCH /api/v1/ratings/{place_id}`.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| RATING-002-US-001 | Open edit rating flow | Critical | As a rating owner, I want to open my existing rating so that I can update it. | Given I have rated a place, when I choose edit rating, then the flow opens with my current rating and private note loaded. |
| RATING-002-US-002 | Prefer PATCH for known edits | Critical | As Product, I want edit flows to use PATCH so that create and edit semantics stay clear. | Given the frontend knows a current-user rating exists, when saving an edit, then it calls `PATCH /api/v1/ratings/{place_id}` rather than relying on POST upsert. |
| RATING-002-US-003 | Require authentication to edit | Critical | As the system, I want only authenticated users editing ratings. | Given I am not authenticated, when I call `PATCH /api/v1/ratings/{place_id}`, then response is `401` and no rating changes. |
| RATING-002-US-004 | Owner-only edit | Critical | As the system, I want only the rating owner to edit a rating so that users cannot change others' logs. | Given a rating belongs to another user, when I attempt edit, then access is denied with `403` or privacy-preserving not-found behavior and no rating changes. |
| RATING-002-US-005 | PATCH missing existing rating | Critical | As an API consumer, I want PATCH to fail if no current-user rating exists so that edits never create rows. | Given no existing rating exists for current user and place, when `PATCH /api/v1/ratings/{place_id}` is called, then API returns `404` and does not create a rating. |
| RATING-002-US-006 | Update rating value | Critical | As a rating owner, I want to change my rating so that it reflects my current opinion. | Given I select a different valid rating, when PATCH succeeds, then the existing rating row is updated and response status is `200 OK`. |
| RATING-002-US-007 | Return RatingResponse on update | Critical | As an API consumer, I want the update response complete so that UI state is consistent. | Given PATCH succeeds, then response includes `id`, `userId`, `placeId`, `rating`, `notes`, `createdAt`, and `updatedAt`. |
| RATING-002-US-008 | Preserve createdAt on edit | High | As the system, I want original rating creation history preserved. | Given an existing rating is edited, when response returns, then `createdAt` remains the original creation timestamp. |
| RATING-002-US-009 | Update updatedAt on edit | High | As the system, I want rating update history visible. | Given an existing rating is edited, when response returns, then `updatedAt` reflects the edit time. |
| RATING-002-US-010 | Update note | High | As a rating owner, I want to edit my private note so that the archive stays accurate. | Given I change my note to nonblank text of 1000 characters or fewer, when PATCH succeeds, then the trimmed note appears only to me. |
| RATING-002-US-011 | Clear note | High | As a rating owner, I want to remove my note so that blank notes are not stored as text. | Given I clear the note field or enter whitespace only, when PATCH succeeds, then response returns `notes: null`. |
| RATING-002-US-012 | Prevent duplicate submit during edit | Medium | As a user, I want edit save protected during submission. | Given PATCH is in progress, when I press save again, then the save action is disabled or busy and no additional client submission is sent. |
| RATING-002-US-013 | Preserve input after edit failure | High | As a user, I want update failures recoverable without losing changes. | Given network or 5xx failure occurs, when the error appears, then attempted rating/note remain in the form and persisted displayed data is not falsely changed. |
| RATING-002-US-014 | Navigate back after edit success | Critical | As a user, I want to return to Place Detail after editing so that I can see updated context. | Given PATCH succeeds, then the app navigates back to Place Detail and refreshes place context, current-user context, and aggregate rating data. |
| RATING-002-US-015 | Cancel edit without mutation | Medium | As a user, I want to cancel edit without saving. | Given the edit flow is open with unsaved changes, when I cancel, then no PATCH request is sent and persisted rating remains unchanged. |
| RATING-002-US-016 | Keep edit flow accessible and mobile-safe | High | As a keyboard, screen-reader, or mobile user, I want edit rating usable. | Given 320px/390px viewport, 200% zoom, or keyboard navigation, when edit flow opens, then focus, controls, selected state, notes, save/cancel, and errors remain usable without clipping. |

Story Count: 16

Coverage Assessment: Covers edit opening, PATCH preference, auth, owner-only access, not-found, update success, response schema, timestamps, notes, duplicate-submit prevention, failure recovery, navigation/refresh, cancel, accessibility, mobile, and zoom.

Missing Assumptions: None.

Risks: High integrity risk if PATCH creates ratings, mutates wrong-owner data, or changes list membership.

### RATING-003 - Support 1-10 in 0.5 increments

Feature Description: Ratings support values from 1 through 10 in 0.5 increments across UI, API, and database.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| RATING-003-US-001 | Accept rating 1 | Critical | As a user, I want to choose the minimum valid rating so that low experiences can be logged. | Given I submit `rating=1`, when validation runs, then the rating is accepted. |
| RATING-003-US-002 | Accept rating 1.5 | Critical | As a user, I want to choose low half-step ratings. | Given I submit `rating=1.5`, when validation runs, then the rating is accepted. |
| RATING-003-US-003 | Accept rating 8.5 | Critical | As a user, I want to choose common half-step ratings. | Given I submit `rating=8.5`, when validation runs, then the rating is accepted and displayed as `8.5/10`. |
| RATING-003-US-004 | Accept rating 10 | Critical | As a user, I want to choose the maximum valid rating. | Given I submit `rating=10`, when validation runs, then the rating is accepted. |
| RATING-003-US-005 | Reject rating 0 | Critical | As the system, I want ratings below range rejected. | Given `rating=0`, when submitted to POST or PATCH, then API returns `422` and no rating changes. |
| RATING-003-US-006 | Reject rating 0.5 | Critical | As the system, I want below-min half-step ratings rejected. | Given `rating=0.5`, when submitted, then API returns `422` and no rating changes. |
| RATING-003-US-007 | Reject rating 10.5 | Critical | As the system, I want ratings above range rejected. | Given `rating=10.5`, when submitted, then API returns `422` and no rating changes. |
| RATING-003-US-008 | Reject rating 8.25 | Critical | As the system, I want quarter-step values rejected. | Given `rating=8.25`, when submitted, then API returns `422` and no rating changes. |
| RATING-003-US-009 | Reject rating 8.3 | Critical | As the system, I want non-half decimal values rejected. | Given `rating=8.3`, when submitted, then API returns `422` and no rating changes. |
| RATING-003-US-010 | Reject null rating | Critical | As the system, I want null ratings rejected. | Given `rating=null`, when submitted, then API returns `422` and no rating changes. |
| RATING-003-US-011 | Reject string rating | Critical | As the system, I want string ratings rejected. | Given `rating="8.5"`, when submitted, then API returns `422` unless the framework explicitly parses it as a JSON number; tests must assert accepted payloads are numeric. |
| RATING-003-US-012 | Reject nonnumeric rating | Critical | As the system, I want nonnumeric ratings rejected. | Given `rating="bad"`, `NaN`, or infinity-like payloads where representable, when submitted, then API returns validation error and no rating changes. |
| RATING-003-US-013 | Enforce database rating constraint | Critical | As the system, I want DB constraints to match API validation. | Given direct persistence attempts bypass API with out-of-range or non-half-step values, then database constraint prevents invalid rating rows. |
| RATING-003-US-014 | Display ratings consistently | High | As a user, I want ratings formatted consistently in RTL UI. | Given rating value exists, when displayed, then it uses Western digits, period decimal separator, and LTR-safe isolation, such as `8.5/10`. |
| RATING-003-US-015 | Keyboard rating selection | High | As a keyboard user, I want to select valid rating values without a mouse. | Given focus is on the rating control, when I use supported keyboard controls, then I can select only valid 0.5-step values from 1 to 10. |
| RATING-003-US-016 | Announce selected rating state | High | As a screen-reader user, I want selected rating state announced. | Given a rating value is selected, when the control is focused, then the selected value and total scale are announced clearly. |
| RATING-003-US-017 | Maintain touch target size | High | As a mobile user, I want rating controls easy to tap. | Given rating options render on mobile, then each interactive target is approximately 44px or larger without causing horizontal overflow. |

Story Count: 17

Coverage Assessment: Covers valid matrix, invalid matrix, API validation, DB constraint, display formatting, keyboard support, screen-reader selected state, and touch targets.

Missing Assumptions: None.

Risks: High if UI/API/DB disagree on allowed values.

### RATING-004 - Add/view own private note

Feature Description: Users can add and view their own private rating notes; notes are never exposed to other users or non-private surfaces.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| RATING-004-US-001 | Add private note | High | As a rating owner, I want to add a private note so that I can remember context. | Given I enter a note with 1000 characters or fewer while rating, when I save, then the note is stored with my rating only. |
| RATING-004-US-002 | Trim nonblank note | High | As a user, I want accidental spaces removed from notes. | Given I enter `  good visit  `, when saved, then persisted `notes` is `good visit`. |
| RATING-004-US-003 | Store omitted note as null | High | As the system, I want omitted notes normalized. | Given `notes` is omitted, when rating is saved, then response returns `notes: null`. |
| RATING-004-US-004 | Store empty note as null | High | As the system, I want empty strings not stored as note content. | Given `notes=""`, when rating is saved, then response returns `notes: null`. |
| RATING-004-US-005 | Store whitespace-only note as null | High | As the system, I want whitespace-only notes normalized. | Given `notes` contains only whitespace, when rating is saved, then response returns `notes: null`. |
| RATING-004-US-006 | Enforce note length | Critical | As the system, I want note length constrained so that oversized private payloads are rejected. | Given trimmed note exceeds 1000 characters, when submitted to POST or PATCH, then API returns `422` and no note/rating change is persisted. |
| RATING-004-US-007 | View own note in profile archive | High | As a rating owner, I want to view my note in my profile archive so that I can review it later. | Given I saved a note, when I open my profile rating archive, then my note is visible only to me. |
| RATING-004-US-008 | View own note in rating edit | High | As a rating owner, I want my existing note loaded when editing so that I can update it. | Given my rating has a note, when I open edit rating, then the note field contains my note. |
| RATING-004-US-009 | Never expose notes in Places list | Critical | As the system, I want notes private from catalog browsing. | Given a place has my or another user's note, when Places list data is returned, then no `notes` field or note content is included. |
| RATING-004-US-010 | Never expose notes in Place Detail for non-owner | Critical | As the system, I want other users unable to see private notes on details. | Given another user views Place Detail, then they never receive my note content. |
| RATING-004-US-011 | Never expose notes in Public Lists | Critical | As the system, I want public lists safe for private note data. | Given a public list includes a rated place, when public list data is returned, then no rating note content is included. |
| RATING-004-US-012 | Never expose notes in other users' profile/public data | Critical | As the system, I want user profile/public data not to leak notes. | Given any user accesses another user's public-facing data, then private note content is never included. |
| RATING-004-US-013 | Never expose notes in aggregates | Critical | As the system, I want aggregate responses free of private note content. | Given average rating or rating count is returned, then note content is not included or derivable. |
| RATING-004-US-014 | Never expose notes in logs | Critical | As the system, I want private notes excluded from operational logs. | Given rating requests or errors are logged, then note content is redacted or omitted. |
| RATING-004-US-015 | Never expose notes in error payloads | Critical | As the system, I want validation and server errors not to leak note content. | Given note validation or server error occurs, then response does not echo private note content. |
| RATING-004-US-016 | Show private-note copy | Medium | As a user, I want the UI to state that my note is private so that I understand visibility. | Given the note field is shown, then the UI communicates `ملاحظتك خاصة` or equivalent. |
| RATING-004-US-017 | Support multiline plain text notes | Medium | As a user, I want simple private notes without rich-text risk. | Given I enter multiline plain text within 1000 characters, when saved, then it is stored as text and later rendered as non-executable text. |
| RATING-004-US-018 | Keep long-note UI usable | Medium | As a mobile user, I want long note entry manageable. | Given note text approaches 1000 characters, then the field remains usable on 320px/390px screens, shows validation before/at submit, and does not overflow horizontally. |

Story Count: 18

Coverage Assessment: Covers note add/view/edit/null/trim/max-length rules, explicit privacy exclusions across all surfaces, log/error privacy, UI copy, multiline text, and mobile long-note usability.

Missing Assumptions: None.

Risks: Critical privacy risk if notes leak through any non-owner or operational surface.

### RATING-005 - Tried concept removed from active product model

Feature Description: `tried` is a superseded legacy concept. Ratings expose rating context only; no active API or UI should expose tried state.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| RATING-005-US-001 | Rating does not create tried state | Critical | As Product, I want ratings to remain independent scores without creating tried product state. | Given I create a rating, when place data reloads, then `currentUserRating` reflects the score and `currentUserTried` is absent. |
| RATING-005-US-002 | No tried UI or manual tried control | High | As a user, I should see rating language only, not tried language or controls. | Given Places, Place Detail, rating flow, or Profile renders, then no `جربته`, `tried`, `مجرب`, or `مجربة` label/control appears. |
| RATING-005-US-003 | Rating update stays rating-only | High | As a user, editing my score should update only rating data. | Given I already rated a place, when I update the rating, then no tried context is created or exposed. |
| RATING-005-US-004 | Profile rated counts replace tried counts | High | As a user, I want profile type counts to describe rated places, not tried places. | Given ratings exist by place type, when profile loads, then `ratedRestaurantCount`, `ratedCafeCount`, and `ratedIceCreamCount` are returned and tried count fields are absent. |
| RATING-005-US-005 | Places list exposes rating context only | Medium | As an API consumer, I want place context to expose rating state without a tried duplicate. | Given I rated a place, when places data loads, then `currentUserRating` is available where appropriate and `currentUserTried` is absent. |

Story Count: 5

Coverage Assessment: Covers tried removal, no tried UI/control, rating-only update behavior, profile rated counts, Places/Detail rating context, and absence of legacy tried fields.

Missing Assumptions: None.

Risks: Medium-high if legacy tried state or UI is reintroduced through rating/profile changes.

### RATING-006 - Rating does not affect list membership

Feature Description: Creating or editing a rating never removes a place from a list and never adds a place to a list.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| RATING-006-US-001 | Rating listed place preserves list membership | Critical | As a user, I want a place to remain in my lists after I rate it. | Given the place is in one or more of my lists, when I rate it, then every list membership remains. |
| RATING-006-US-002 | Rating unlisted place creates no membership | Critical | As the system, I want rating creation not to add a place to any list. | Given the place is in none of my lists, when I rate it, then no list membership is created. |
| RATING-006-US-003 | Rated place can be added to a list | Critical | As a user, I can organize rated places in lists without changing my rating. | Given I rated a place, when I add it to an owned list, then the list item is created and the existing rating remains unchanged. |
| RATING-006-US-004 | Editing rating preserves list membership | High | As a user, I want rating edits not to remove or add list items. | Given a rated place is in a list, when I edit the rating through PATCH or POST upsert, then list membership remains unchanged. |
| RATING-006-US-005 | List membership changes do not mutate ratings | High | As the system, I want list operations not to create, edit, or delete ratings. | Given a rated place is added to or removed from a list, then the rating row remains unchanged. |
| RATING-006-US-006 | UI flow confirms rating/list independence | Critical | As a user, I can add, rate, and return to my list without losing the place. | Given I create a list, add a place, and rate that place, when I return to the list, then the place is still present. |

Story Count: 6

Coverage Assessment: Covers listed and unlisted rating behavior, adding rated places to lists, rating edit/upsert behavior, list operation independence, and full UI flow persistence.

Missing Assumptions: None.

Risks: Very high business-rule and data-integrity risk if ratings and lists become coupled again.

### RATING-007 - Add rated place to list later

Feature Description: Users can add rated places to lists at any time; doing so does not create another rating or change the existing rating.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| RATING-007-US-001 | Add rated place to list | High | As a user, I want to add a rated place to a list so that I can organize it after rating. | Given a place is rated, when I add it to one of my lists, then the list item is created if it does not already exist. |
| RATING-007-US-002 | Preserve rating after add | High | As a user, I want rating data preserved when I organize places. | Given I add a rated place to a list, when place data reloads, then `currentUserRating` remains unchanged. |
| RATING-007-US-003 | Do not create second rating | Critical | As the system, I want adding to lists not to create ratings so that one rating per user/place is preserved. | Given I add a rated place to a list, when the list item is created, then no new rating row is created. |
| RATING-007-US-004 | Preserve existing rating value and note | Critical | As a user, I want list organization not to alter my rating archive. | Given I add a rated place to a list, then existing rating value and private note remain unchanged. |
| RATING-007-US-005 | Duplicate add remains idempotent | High | As a user, I want repeated add to the same list harmless so that accidental taps do not duplicate rows. | Given a place is already in the list, when I add it again, then no duplicate list item is created. |
| RATING-007-US-006 | Rating update does not remove listed place | High | As a user, I want a listed rated place to remain in lists when I edit my rating. | Given a rated place is in a list, when I update the rating, then the list item remains. |
| RATING-007-US-007 | Owner-only add | Critical | As the system, I want add-to-list constrained to owned lists so that users cannot modify others' lists. | Given I do not own a list, when I try to add a place to it, then the request is denied. |
| RATING-007-US-008 | Show rating context during add when available | Medium | As a user, I want to recognize rated places during add-to-list when useful. | Given a rated place appears in add-to-list selection, then UI may show rating context without creating tried state. |

Story Count: 8

Coverage Assessment: Covers adding rated places, rating preservation, no second rating, rating/note preservation, duplicate item prevention, update behavior, authorization, and optional rating context.

Missing Assumptions: None.

Risks: High if list organization mutates rating records or rating edits mutate list membership.

### RATING-008 - Average rating and rating count

Feature Description: Community rating average and rating count are calculated from the ratings table and shown in places/detail/list contexts.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| RATING-008-US-001 | Calculate average from ratings table | High | As a user, I want community average rating so that I can understand general quality. | Given a place has ratings, when place data is returned, then average rating is calculated from current rating rows. |
| RATING-008-US-002 | Calculate rating count from ratings table | High | As a user, I want rating count so that I understand confidence in the average. | Given a place has ratings, when place data is returned, then rating count equals number of rating rows. |
| RATING-008-US-003 | Store aggregate internally with full precision | High | As the system, I want aggregate calculation not to lose precision before display. | Given average is calculated, then internal calculation uses available database precision rather than pre-rounded display text. |
| RATING-008-US-004 | Display one decimal place | High | As a user, I want rating averages formatted consistently. | Given average rating is displayed, then it shows one decimal place. |
| RATING-008-US-005 | Round 8.44 to 8.4 | Medium | As QA, I want rounding examples testable. | Given internal average is `8.44`, when displayed, then it appears as `8.4`. |
| RATING-008-US-006 | Round 8.45 to 8.5 | Medium | As QA, I want midpoint rounding testable. | Given internal average is `8.45`, when displayed, then it appears as `8.5`. |
| RATING-008-US-007 | Round 8.46 to 8.5 | Medium | As QA, I want rounding above midpoint testable. | Given internal average is `8.46`, when displayed, then it appears as `8.5`. |
| RATING-008-US-008 | Hide aggregate when unrated | Medium | As a user, I do not want fake community ratings. | Given a place has no ratings, when displayed, then no fake average is shown and count is zero or omitted appropriately. |
| RATING-008-US-009 | Aggregate updates after create | High | As a user, I want community rating to update after a new rating so that data is current. | Given a new rating is created, when place/list/detail data reloads, then average and count reflect the new row. |
| RATING-008-US-010 | Aggregate updates after edit | High | As a user, I want community rating to update after rating edits so that aggregate remains accurate. | Given a rating is updated, when place/list/detail data reloads, then average reflects updated value and count does not increase. |
| RATING-008-US-011 | Aggregate excludes private notes | Critical | As the system, I want aggregates free from note data. | Given aggregate data is returned, then it contains average/count only and never note content. |
| RATING-008-US-012 | No cached aggregate table required | Medium | As the system, I want MVP aggregate infrastructure simple. | Given aggregate is requested, then no separate aggregate table is required for correctness. |
| RATING-008-US-013 | Format aggregate in RTL UI | Medium | As a user, I want decimal aggregates readable in Arabic UI. | Given average rating is displayed, then it uses Western digits, period decimal separator, and LTR-safe formatting. |
| RATING-008-US-014 | Keep aggregate consistent across surfaces | High | As a user, I want the same community rating wherever the place appears. | Given the same place appears in Places, Place Detail, list detail, or public list context, then average/count reflect the same source data after refresh. |
| RATING-008-US-015 | Handle concurrent aggregate updates | Medium | As the system, I want aggregates reliable under concurrent ratings. | Given concurrent ratings are created or updated for a place, when data reloads after commits, then average/count reflect committed rows only. |

Story Count: 15

Coverage Assessment: Covers average/count source, internal precision, display rounding examples, unrated behavior, create/edit freshness, note exclusion, no aggregate table, RTL formatting, cross-surface consistency, and concurrency.

Missing Assumptions: None.

Risks: Medium trust risk if averages/counts are stale, inconsistent, or incorrectly rounded.

### RATING-009 - Repeated POST updates existing rating

Feature Description: `POST /api/v1/ratings` behaves as create-or-update API safety: new row returns `201`; existing row update returns `200`.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| RATING-009-US-001 | POST creates new rating | Critical | As an API consumer, I want POST to create when no rating exists so that first rating works. | Given no rating exists for current user/place, when `POST /api/v1/ratings` is called with valid payload, then a rating is created and status is `201 Created`. |
| RATING-009-US-002 | POST updates existing rating | Critical | As an API consumer, I want repeated POST to update existing rating so that duplicate creates are prevented. | Given a rating already exists for current user/place, when `POST /api/v1/ratings` is called with valid payload, then the existing row is updated and status is `200 OK`. |
| RATING-009-US-003 | Enforce one rating per user/place | Critical | As the system, I want uniqueness enforced so that a user cannot create multiple ratings for one place. | Given repeated create attempts, when committed, then only one rating row exists for that user/place. |
| RATING-009-US-004 | Enforce database uniqueness | Critical | As the system, I want database enforcement matching API behavior. | Given duplicate rating rows are attempted for the same `(user_id, place_id)`, then DB uniqueness prevents more than one row. |
| RATING-009-US-005 | Handle concurrent POST safely | Critical | As the system, I want concurrent rating submissions handled safely so that duplicates do not appear. | Given concurrent POST requests for same user/place, when processed, then one rating row exists after completion and no private data or stack traces leak in any response. |
| RATING-009-US-006 | Return conflict only as safe fallback | High | As an API consumer, I want race failures understandable. | Given a duplicate race cannot be resolved as update, then API may return structured conflict such as `DUPLICATE_RATING` without exposing database internals. |
| RATING-009-US-007 | Upsert preserves note rules | High | As a user, I want notes handled consistently during upsert. | Given repeated POST includes blank notes, when updated, then notes become `null`; given a valid note is provided, then it is trimmed and saved privately. |
| RATING-009-US-008 | Upsert validates rating scale | Critical | As the system, I want POST update path to enforce the same validation as create. | Given repeated POST submits invalid rating value, then API returns `422` and existing rating remains unchanged. |
| RATING-009-US-009 | Upsert remains rating-only | Critical | As the system, I want POST create and update paths not to affect list membership. | Given POST creates or updates a rating, then no list item is added or removed. |
| RATING-009-US-010 | Frontend uses POST only for create flow | High | As Product, I want frontend behavior clear even though API upsert exists. | Given frontend knows no current-user rating exists, then create flow uses POST; given frontend knows rating exists, edit flow uses PATCH. |
| RATING-009-US-011 | POST update refreshes contexts | High | As a user, I want API safety updates reflected correctly. | Given POST updates an existing rating, when the frontend receives success, then place context, user context, and aggregate data refresh. |
| RATING-009-US-012 | Status codes distinguish create/update | High | As QA, I want status codes testable. | Given POST creates, then response status is `201`; given POST updates existing, then response status is `200`. |

Story Count: 12

Coverage Assessment: Covers POST create/update semantics, uniqueness, DB enforcement, concurrency, safe conflict fallback, note rules, validation, side-effect distinction, frontend contract, context refresh, and status-code testability.

Missing Assumptions: None.

Risks: High data-integrity risk if uniqueness, side effects, or status semantics drift.

## Module Summary

Total Features Processed: 9

Total User Stories Generated: 127

Features With Highest Complexity:

- `RATING-003` - 1-10 rating scale with 0.5 increments across UI/API/DB.
- `RATING-004` - private notes across API, UI, logs, errors, and public surfaces.
- `RATING-006` - rating/list independence across create, update, add, remove, and UI flows.
- `RATING-008` - aggregate calculation, precision, rounding, and cross-surface consistency.
- `RATING-009` - POST upsert safety and frontend PATCH preference.

Features With Highest Business Risk:

- `RATING-004` - private notes and privacy boundaries.
- `RATING-006` - preventing rating/list coupling and accidental membership mutation.
- `RATING-009` - one rating per user/place and upsert semantics.
- `RATING-003` - validation consistency across UI/API/DB.
- `RATING-008` - aggregate correctness and trust.

Recommended QA Priority Order:

1. `RATING-004`
2. `RATING-006`
3. `RATING-009`
4. `RATING-003`
5. `RATING-001`
6. `RATING-002`
7. `RATING-008`
8. `RATING-005`
9. `RATING-007`

Coverage Assessment:

- Covered: rating creation, rating editing, API versioned paths, 201/200/422/404/401/403 behavior, exact `RatingResponse`, rating validation matrix, 0.5 increments, private notes, note trimming/null/max length, notes privacy across all surfaces, current-user-only visibility, community average, rating count, aggregate precision/rounding/freshness, create/update success, failures, duplicate prevention, upsert behavior, tried removal, rating/list independence, adding rated places to lists, mobile UX, accessibility, keyboard behavior, decimal display, formatting, loading states, cancel behavior, retry behavior, and error privacy.
- Not included: deleting ratings, public note sharing, social reactions, comments, recommendations, moderation, or admin workflows because they are not current `RATING-*` catalog features.

Resolved Product Decisions:

- After successful rating creation or update, navigate back to Place Detail and refresh place/current-user/aggregate context.
- Frontend create flow uses POST.
- Frontend edit flow uses PATCH when an existing rating is known.
- POST upsert remains API safety behavior only.
- Notes max length is 1000.
- Notes are trimmed before save.
- Blank notes become and return `notes: null`.
- Rating deletion is unsupported.
- The legacy tried model is superseded by `EDR-009`; rating deletion remains unsupported.
- Average rating display uses one decimal place with examples `8.44 -> 8.4`, `8.45 -> 8.5`, `8.46 -> 8.5`.
