# Place Details User Stories

Source of truth:

- `docs/feature-map/FEATURE_MAP.md`
- `docs/feature-map/FEATURE_CATALOG.md`
- `docs/feature-map/FEATURE_TREE.md`
- `docs/feature-map/FEATURE_TRACEABILITY.md`

Scope: all Place Details features from `FEATURE_CATALOG.md`.

Included features:

- `PLACE-017`
- `PLACE-018`
- `PLACE-019`
- `PLACE-020`

Total features processed: 4
Total user stories written: 47

## Place Details Module

### PLACE-017 - View place metadata and rating context

Feature Description: Authenticated users can view place detail metadata, generated artwork, community rating context, and current-user rating context.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| PLACE-017-US-001 | View place detail | Critical | As an authenticated user, I want to view a place detail page so that I can inspect the selected place and available actions. | Given I am authenticated, when I open `/places/{id}`, then the place detail screen loads. |
| PLACE-017-US-002 | View place name | Critical | As a user, I want to see the place name prominently so that I know which place I opened. | Given a place exists, when detail loads, then the place name is visible and readable. |
| PLACE-017-US-003 | View primary type | High | As a user, I want to see the place type so that I know whether it is a restaurant, cafe, or ice cream place. | Given a place has a type, when detail loads, then the localized type is shown. |
| PLACE-017-US-004 | View subtype when available | High | As a user, I want to see subtype when it exists so that the place category is clearer. | Given a restaurant or cafe has a subtype, when detail loads, then the localized subtype is shown. |
| PLACE-017-US-005 | Hide subtype when unavailable | Medium | As a user, I do not want empty subtype placeholders so that the detail page stays clean. | Given an ice cream place has no subtype, when detail loads, then no blank subtype section appears. |
| PLACE-017-US-006 | View generated artwork | Medium | As a user, I want generated artwork on detail so that the place has a recognizable visual marker. | Given a place detail loads, when artwork renders, then deterministic generated artwork is visible and not presented as real photography. |
| PLACE-017-US-007 | View community rating | High | As a user, I want to see community average rating so that I understand overall sentiment. | Given the place has ratings, when detail loads, then average rating is shown. |
| PLACE-017-US-008 | View rating count | High | As a user, I want to see rating count so that I know how much confidence to place in the average. | Given the place has ratings, when detail loads, then rating count is shown. |
| PLACE-017-US-009 | Hide community section when no data | Medium | As a user, I do not want fake or empty community rating sections. | Given the place has no ratings, when detail loads, then community rating content is hidden or shown as an intentional empty-safe state without fake values. |
| PLACE-017-US-010 | View current user rating | High | As a user, I want to see my rating on the detail page so that I know whether I have logged this place. | Given I have rated the place, when detail loads, then my rating is shown. |
| PLACE-017-US-011 | Hide current user rating when absent | Medium | As a user, I do not want empty personal rating sections when I have not rated a place. | Given I have not rated the place, when detail loads, then my rating section is hidden or replaced by the rate action. |
| PLACE-017-US-012 | Format ratings consistently | High | As a user, I want ratings formatted consistently so that numeric values are easy to read in RTL. | Given a rating such as `8.5` exists, when displayed, then it uses Western digits, a period decimal, and LTR-safe formatting. |
| PLACE-017-US-013 | Handle long Arabic names | High | As an Arabic user, I want long Arabic place names readable so that important names are not clipped. | Given a long Arabic name, when detail renders on mobile, then the name wraps or clamps predictably without horizontal overflow. |
| PLACE-017-US-014 | Handle long English and mixed names | High | As a user, I want English and mixed-language place names to render correctly so that real-world names remain readable. | Given a long English or mixed Arabic/English name, when detail renders, then bidi isolation prevents collision or offscreen text. |
| PLACE-017-US-015 | Loading state | Medium | As a user, I want loading feedback while place detail is fetched so that the page does not feel broken. | Given the place detail request is pending, when the page renders, then a compact loading state appears. |
| PLACE-017-US-016 | Not-found or API error | High | As a user, I want a clear error if the place cannot be loaded so that I understand the link is invalid or unavailable. | Given the place ID is invalid or the API fails, when detail loads, then an error or not-found state appears without fake data. |
| PLACE-017-US-017 | Unauthorized access denied | Critical | As the system, I want place detail protected so that anonymous users cannot access place data. | Given I am not authenticated, when I open `/places/{id}`, then I am denied or shown a sign-in prompt. |
| PLACE-017-US-018 | Mobile detail UX | High | As a mobile user, I want place detail to be compact and action-oriented so that I can use it without zooming. | Given a small mobile viewport, when detail renders, then content fits, actions remain reachable, and bottom navigation does not hide content. |
| PLACE-017-US-019 | Accessible detail content | High | As a screen-reader or keyboard user, I want detail content and actions accessible so that I can inspect and act on the place. | Given place detail renders, when navigating by keyboard or assistive tech, then headings, metadata, ratings, and actions have clear labels and focus order. |

Story Count: 19

Coverage Assessment: Covers detail loading, metadata, type/subtype, artwork, community rating/count, current-user rating, hidden sections, long names, unauthorized access, errors, mobile UX, accessibility, and rating formatting.

Missing Assumptions: Exact not-found UI copy and whether detail should preserve previous list/filter return state explicitly.

Risks: High UX risk because Place Detail is the primary action hub; high privacy risk if unauthenticated or wrong-user context leaks.

### PLACE-018 - Show lists containing this place

Feature Description: Place Detail shows the current user's owned lists that contain the place.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| PLACE-018-US-001 | Show containing lists | High | As a user, I want to see which of my lists contain this place so that I understand my saved context. | Given the place is in one or more of my owned lists, when detail loads, then those list names are shown under `موجود في` or equivalent. |
| PLACE-018-US-002 | Hide containing-lists section when empty | Medium | As a user, I do not want empty personal-context sections so that detail stays concise. | Given the place is not in any of my owned lists, when detail loads, then the containing-lists section is hidden. |
| PLACE-018-US-003 | Show multiple list names | Medium | As a user, I want all relevant containing lists shown so that I know every collection using the place. | Given the place is in multiple owned lists, when detail loads, then all returned list names are displayed or summarized clearly. |
| PLACE-018-US-004 | Preserve list privacy | Critical | As the system, I want only the current user's list memberships shown so that other users' private lists are not exposed. | Given another user has the place in a list, when I view detail, then that other user's list name is not shown. |
| PLACE-018-US-005 | Update after add to list | High | As a user, I want containing lists to update after adding a place so that the detail page reflects the latest state. | Given I add the place to one of my lists, when detail refreshes, then the added list appears in the containing-lists section. |
| PLACE-018-US-006 | Update after remove from list | High | As a user, I want containing lists to update after removal so that stale memberships are not shown. | Given the place is removed from a list, when detail refreshes, then that list no longer appears. |
| PLACE-018-US-007 | Long list names fit | Medium | As a mobile user, I want long list names to fit so that saved context remains readable. | Given a long Arabic, English, or mixed-language list name, when displayed in place detail, then it wraps or clamps without horizontal overflow. |
| PLACE-018-US-008 | Accessible list context | Medium | As a screen-reader user, I want the containing-lists section announced clearly. | Given the section is visible, when read by assistive tech, then the section label and list names are understandable. |

Story Count: 8

Coverage Assessment: Covers current-user list context, hidden empty section, multiple lists, privacy, refresh after add/remove, long names, and accessibility.

Missing Assumptions: Maximum number of list names to display before summarizing is not specified.

Risks: Critical privacy risk if another user's list names leak through current-user context.

### PLACE-019 - Add current place to one owned list

Feature Description: From Place Detail, users can add the current place to one owned list.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| PLACE-019-US-001 | Open add-to-list flow | Critical | As a user, I want to open Add To List from place detail so that I can save the current place to a collection. | Given I am viewing a place detail, when I select `أضف إلى قائمة`, then the add-to-list flow opens. |
| PLACE-019-US-002 | Show owned list choices | Critical | As a user, I want to see my owned lists so that I can choose where to add the place. | Given I own lists, when add-to-list opens, then my owned lists are available as choices. |
| PLACE-019-US-003 | Add to one list | Critical | As a user, I want one add action to target one list so that the action is clear and controlled. | Given I choose one owned list, when I confirm, then the current place is added only to that list. |
| PLACE-019-US-004 | No owned lists empty state | Medium | As a user without lists, I want a clear state so that I understand why I cannot add yet. | Given I own no lists, when add-to-list opens, then an empty state or clear next step appears. |
| PLACE-019-US-005 | Duplicate membership prevention | Critical | As the system, I want duplicate list memberships prevented so that the same place is not stored twice in one list. | Given the current place is already in the selected list, when I add it again, then no duplicate row is created. |
| PLACE-019-US-006 | Idempotent duplicate add success | High | As a user, I want repeat add actions to succeed harmlessly so that accidental taps do not create errors. | Given the current place already belongs to the selected list, when I add it again, then the system returns success or stable existing state. |
| PLACE-019-US-007 | Owner-only list target | Critical | As the system, I want users to add places only to lists they own so that users cannot modify others' lists. | Given a list is not owned by me, when I attempt to add the place to it, then the request is denied. |
| PLACE-019-US-008 | Add tried place later | High | As a user, I want to add a tried place back to a list so that rating history does not prevent organization. | Given I have rated the place, when I add it to a list later, then it is added without changing tried status or creating a new rating. |
| PLACE-019-US-009 | Add-to-list loading and error states | High | As a user, I want clear loading and error states while adding so that I know whether the action completed. | Given add request is pending or fails, when the flow is open, then loading or error feedback is shown and false success is not displayed. |
| PLACE-019-US-010 | Accessible add-to-list flow | High | As a keyboard or screen-reader user, I want the add-to-list flow accessible so that I can add the place without a pointer. | Given the flow opens, when navigating by keyboard, then focus is managed, list options are labeled, and close/restoration behavior works. |
| PLACE-019-US-011 | Mobile add-to-list UX | High | As a mobile user, I want add-to-list usable in a compact sheet/dialog so that I can complete it one-handed. | Given mobile viewport, when add-to-list opens, then options and actions fit without horizontal overflow or keyboard/nav overlap. |

Story Count: 11

Coverage Assessment: Covers opening, owned list choices, one-list target, empty state, duplicate prevention, idempotency, authorization, tried re-add, loading/error states, accessibility, and mobile UX.

Missing Assumptions: Whether the add-to-list flow should support searching owned lists when a user has many lists.

Risks: High data-integrity risk if duplicate membership protection fails; high authorization risk if non-owned lists can be targeted.

### PLACE-020 - Open rating flow

Feature Description: Place Detail exposes the action to open the rating flow for creating or editing the current user's rating.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| PLACE-020-US-001 | Open create-rating flow | Critical | As an authenticated user, I want to open rating from place detail so that I can log my experience. | Given I have not rated the place, when I select `قيم المكان`, then the create-rating flow opens for that place. |
| PLACE-020-US-002 | Open edit-rating flow | High | As a rating owner, I want place detail to open edit rating when I already rated the place so that I can update my log. | Given I already rated the place, when I select the rating action, then the edit-rating flow opens with existing context. |
| PLACE-020-US-003 | Rating action reflects current state | High | As a user, I want the rating action label/state to match whether I have rated the place so that I understand what will happen. | Given I have no rating, when detail renders, then the action indicates creating a rating; given I have a rating, then it indicates editing or shows current rating context. |
| PLACE-020-US-004 | Unauthorized rating action blocked | Critical | As the system, I want guests blocked from rating so that ratings are tied to authenticated users. | Given I am not authenticated, when I attempt to open rating flow, then I am prompted to sign in or denied. |
| PLACE-020-US-005 | Return from rating flow | Medium | As a user, I want to return to place detail after rating so that I can confirm the updated context. | Given I save or cancel rating, when the flow closes or navigates back, then I return to the related place detail context. |
| PLACE-020-US-006 | Detail refresh after rating | High | As a user, I want place detail updated after rating so that my rating and community data are current. | Given I create or edit a rating, when I return to detail, then current-user rating and community rating context reflect the latest data. |
| PLACE-020-US-007 | Mobile rating entry | High | As a mobile user, I want the rating entry point and flow usable without layout issues. | Given a mobile viewport, when I open rating flow from detail, then the action is reachable and the flow does not overflow. |
| PLACE-020-US-008 | Accessible rating entry | High | As a keyboard or screen-reader user, I want the rating action accessible. | Given place detail renders, when I focus the rating action, then it has a clear accessible name and opens via keyboard. |
| PLACE-020-US-009 | Rating flow open error | Medium | As a user, I want a clear error if the rating flow cannot load so that I understand the action failed. | Given rating route or place context fails to load, when I open rating flow, then an error state appears without losing context. |

Story Count: 9

Coverage Assessment: Covers create/edit entry, state-aware action, auth blocking, return navigation, detail refresh, mobile UX, accessibility, and open errors.

Missing Assumptions: Actual rating value validation and save semantics belong to `RATING-*` stories and are intentionally not duplicated here.

Risks: Medium-high UX risk because Place Detail is the user's main entry point to rating.

## Module Summary

Total Features Processed: 4

Total User Stories Generated: 47

Features With Highest Complexity:

- `PLACE-017` - place detail metadata, community/current-user context, and responsive presentation
- `PLACE-019` - add-to-list behavior, duplicate prevention, ownership, and tried-place re-add
- `PLACE-020` - rating entry state and detail refresh after rating

Features With Highest Business Risk:

- `PLACE-019` - duplicate membership prevention and owner-only list targeting
- `PLACE-018` - privacy of current-user list membership context
- `PLACE-017` - unauthorized access and current-user data visibility
- `PLACE-020` - authenticated rating entry and post-rating context accuracy

Recommended QA Priority Order:

1. `PLACE-019`
2. `PLACE-018`
3. `PLACE-017`
4. `PLACE-020`

Coverage Assessment:

- Covered: view place detail, name, type, subtype, community rating, rating count, current user rating, current user lists containing the place, generated artwork, Add To List flow, Rate flow, add to owned list, duplicate membership prevention, current-user context visibility, empty/hidden sections, loading states, error handling, unauthorized access, privacy rules, mobile UX, accessibility, long Arabic names, long English names, mixed-language names, rating visibility, rating formatting, navigation from detail, return navigation, community data display, and current-user data display.
- Not included: rating save validation, rating note persistence, rating aggregate calculation internals, or first-rating list cleanup because those are covered by `RATING-*` stories.

Open Product Questions:

1. Should Place Detail explicitly show a back action, or rely on browser/app navigation?
2. Should containing list names be capped or summarized after a threshold?
3. Should Add To List include owned-list search for users with many lists?
4. Should the rating action be a modal/sheet from detail or always navigate to `/places/{id}/rate`?
5. Should no-community-rating state be fully hidden or display a concise unrated label?
