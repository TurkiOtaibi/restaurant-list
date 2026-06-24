# 19. QA Strategy

## QA Objectives

- Prove the MVP satisfies all Must requirements.
- Protect authentication, list visibility, note privacy, rating upsert, first-rating cleanup, tried re-add, duplicate place, duplicate list item, search boundary, and place detail rules.
- Ensure no out-of-scope features are introduced.

## Test Levels

| Level | Purpose |
| --- | --- |
| Unit Tests | Validate normalization, validation, permissions, rating upsert, list idempotency, aggregate calculation, and response shaping. |
| API Tests | Validate endpoint contracts, schemas, auth, authorization, validation, pagination, sorting, idempotency, and errors. |
| Integration Tests | Validate database constraints, transactions, and cross-entity behavior. |
| End-to-End Tests | Validate primary user flows through the UI. |
| Accessibility Tests | Validate keyboard support, labels, focus, contrast, and rating controls. |
| Regression Tests | Re-run critical flows before release. |

## Test Case Catalog

| Test ID | Acceptance Criteria | Validation Scenario |
| --- | --- | --- |
| AUTH-001 | User can register with display name, unique email, and password. | Submit valid register request and verify user plus access/refresh tokens returned. |
| AUTH-002 | User can login with email/password. | Submit valid credentials and verify access/refresh tokens returned. |
| AUTH-003 | Refresh token issues a new access token. | Submit valid refresh token and verify new access token returned. |
| AUTH-004 | Logout revokes refresh token idempotently. | Logout twice with same refresh token and verify safe success/no active session. |
| AUTH-005 | Google, Apple, and social login do not exist. | Verify no UI actions or API routes exist for social login. |
| AUTH-006 | Guest access to MVP data is rejected. | Request lists, places, restaurants, cafes, profile, place detail, search, and public list without token; expect `401`. |
| NAV-001 | Main navigation contains My Lists, Places, My Profile. | Authenticated UI shows `قوائمي`, `الأماكن`, and `صفحتي`; legacy restaurant/cafe routes redirect only. |
| LIST-001 | User can create public and private lists. | Create one public and one private list; verify persisted visibility. |
| LIST-002 | Duplicate list names are allowed. | Create two lists with same name for same user; both succeed. |
| LIST-003 | User can edit owned list. | Update owned list name and visibility; verify changes. |
| LIST-004 | User can delete owned list without deleting places or ratings. | Delete list and verify memberships removed while place/rating remain. |
| LIST-005 | My Lists returns only current user's lists. | User A and B create lists; User A sees only User A lists. |
| LIST-006 | List detail returns metadata, permissions, and places. | Open owned list and verify response/UI fields. |
| LIST-007 | Non-owner cannot modify another user's list. | User B attempts edit/delete/add/remove on User A list; expect rejection. |
| LIST-008 | Authenticated non-owner can view public list read-only. | User B opens User A public list; verify no owner controls. |
| LIST-009 | Guest cannot view public list. | Guest opens public list endpoint/route; expect `401`. |
| LIST-010 | Authenticated non-owner cannot view private list. | User B opens User A private list; expect `404` or `403`. |
| LIST-011 | Public list exposes owner display name only. | Verify public list response has display name and no email. |
| ADD-001 | Add To List targets one list only. | Submit one place/list and verify membership. Submit multiple list IDs and expect validation error. |
| ADD-002 | Create-place-and-add creates one place and one membership. | Create new place from list context and verify it appears once. |
| ADD-003 | Duplicate add-to-list is idempotent. | Add same place to same list twice; verify success and one membership. |
| ADD-004 | Tried place can be re-added to list. | Rate place, verify removal, re-add to list, verify Tried indicator and no new rating. |
| ADD-005 | Same place can appear in multiple lists. | Add same place to two owned lists through separate actions; both memberships exist. |
| PLACE-001 | Place creation requires name and type. | Submit missing fields and verify validation errors. |
| PLACE-002 | Place description is optional. | Create place without description and with description; both valid. |
| PLACE-003 | Duplicate place names are rejected globally. | Create name variants differing by case/spacing; second create returns conflict. |
| PLACE-004 | User-facing place editing is unavailable. | Verify no edit UI and no update endpoint. |
| PLACE-005 | Place detail screen/API returns required fields. | Open place detail and verify metadata, rating aggregate, tried state, and current user's own rating. |
| PLACE-006 | Places page filters by restaurant, cafe, and ice cream type. | Verify one Places page exposes internal filters and legacy restaurant/cafe routes only redirect. |
| SEARCH-001 | Search matches place name only. | Search by name and verify results match names. |
| SEARCH-002 | Search rejects discovery parameters. | Submit location, neighborhood, distance, category, trending, popularity, recommendation params; expect validation error. |
| SEARCH-003 | Search results use rating-desc default sorting. | Create multiple matching places and verify average rating desc, rating count desc, normalized name asc, and unrated last. |
| PLACE-007 | Places list displays required row data. | Verify name, type, subtype, average rating one decimal when available, and row opens Place Detail. |
| PLACE-008 | Legacy restaurant/cafe routes remain compatibility-only. | Verify `/restaurants` and `/cafes` redirect to Places filters and are hidden from primary navigation. |
| RATING-001 | Rating is required. | Submit missing rating; expect validation error. |
| RATING-002 | Rating must be 1 to 10 in 0.5 increments. | Submit 0, 11, 7.25, and text; expect validation errors; submit 8.5 and expect success. |
| RATING-003 | Blank notes are stored as null. | Submit whitespace notes and verify stored/returned as null for owner. |
| RATING-004 | One rating per user/place is enforced. | Submit rating twice and verify one rating row. |
| RATING-005 | Rating POST performs upsert. | Rate place, submit second rating, verify existing row updated. |
| RATING-006 | First rating removes place from all user's lists. | Add place to multiple lists, rate it, verify all memberships removed. |
| RATING-007 | Existing rating update preserves re-added list memberships. | Rate place, re-add to list, update rating, verify membership remains. |
| RATING-008 | Rating notes are private. | User A adds notes; User B cannot see notes via public list, place detail, search, or profile. |
| RATING-009 | Tried indicator updates after rating and re-add. | Rate place and verify Tried indicator across list, Places, place detail, and profile. |
| PROFILE-001 | Profile summary counts are correct. | Verify lists count, restaurants tried count, and cafes tried count. |
| PROFILE-002 | Profile rating archive is the canonical tried-place archive. | Rate places and verify `تقييماتك` includes place, rating, and private notes; do not expect a separate tried-places section. |
| PROFILE-003 | Rating can be edited from profile. | Edit rating from profile and verify update. |
| AGG-001 | Average rating calculates from ratings table. | Two users rate same place and verify arithmetic average. |
| AGG-002 | Rating count calculates from ratings table. | Create/update ratings and verify count changes only on first rating per user/place. |
| AGG-003 | Average rating displays one decimal place. | Use ratings producing 8.333 and verify display as 8.3. |
| AGG-004 | Unrated state displays correctly. | Verify no average and count 0 for unrated place. |
| API-001 | Pagination contract is honored. | Request paginated lists/places/tried places and verify meta. |
| API-002 | Sorting contract is honored. | Verify supported sorts and rejection of unsupported sorts. |
| API-003 | Error envelope is consistent. | Trigger validation, auth, permission, not found, and conflict errors. |
| A11Y-001 | Core forms and rating controls are keyboard accessible. | Navigate auth, list, place, and rating forms using keyboard. |
| SCOPE-001 | Out-of-scope features are absent. | Verify no maps, GPS, branches, neighborhoods, photos, comments, follows, notifications, admin moderation, social login, public share URLs, recommendations, trending, popularity sorting, or place editing. |

## End-to-End Scenarios

| ID | Scenario |
| --- | --- |
| E2E-001 | User registers, creates a private list, creates a restaurant, adds it to the list, rates it, and sees it removed from all lists and added to profile. |
| E2E-002 | User creates a public list; authenticated User B views it read-only; guest access is rejected. |
| E2E-003 | User creates a cafe, rates it, re-adds it to a list, sees Tried indicator, updates rating, and the list item remains. |
| E2E-004 | Two users rate the same place and average/count display correctly with one decimal. |
| E2E-005 | User attempts duplicate place names with different casing and spacing; duplicate is rejected. |
| E2E-006 | User searches by place name and attempts unsupported discovery parameters; only name search succeeds. |
| E2E-007 | User A writes private rating notes; User B cannot see notes through public list, place detail, or search. |

## Release Gates

The MVP must not release unless:

- Every Must requirement maps to at least one passing test case in the RTM.
- `AUTH-006` passes for all protected resource types.
- `LIST-008`, `LIST-009`, and `LIST-010` pass.
- `RATING-006`, `RATING-007`, and `RATING-008` pass.
- `ADD-003` and `ADD-004` pass.
- `PLACE-003`, `PLACE-004`, and `PLACE-005` pass.
- `SEARCH-001`, `SEARCH-002`, and `SEARCH-003` pass.
- `AGG-001`, `AGG-002`, and `AGG-003` pass.
- `SCOPE-001` passes.
- No critical or high defects remain open.

## Defect Severity Guidelines

| Severity | Definition | Product-Specific Examples |
| --- | --- | --- |
| Critical | Blocks release or breaks core data integrity/security/privacy. | Guest views public list, private list exposed, rating notes leak, duplicate rating rows, first-rating cleanup fails. |
| High | Major MVP flow broken with no reasonable workaround. | Cannot create list, cannot rate place, place detail unavailable, search accepts discovery parameters, rating aggregates wrong. |
| Medium | Important issue with workaround or limited scope. | Validation message unclear, supported sort inconsistent, empty state misleading. |
| Low | Cosmetic or minor usability issue. | Minor spacing, non-blocking text issue. |
