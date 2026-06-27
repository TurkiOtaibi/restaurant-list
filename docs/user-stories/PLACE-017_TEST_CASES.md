# PLACE-017 Test Cases

Feature: `PLACE-017 - View place metadata and rating context`

Source: `docs/user-stories/PLACE_DETAILS_USER_STORIES.md`

Scope: All user stories under `PLACE-017`.

## QA Execution Standards

- Test cases validate documented requirements only. Undefined place-detail behavior must be captured as Requirement Clarification, Manual Verification, or Traceability Verification.
- `PLACE-017` covers authenticated place detail metadata, generated artwork, community rating context, current-user rating context, loading/error/auth states, mobile layout, and accessibility.
- Primary route: `/places/{id}`.
- Backend endpoint from traceability: `GET /api/v1/places/{id}` with Bearer authentication.
- `GET /api/v1/places/{id}` contract tests must verify `200 OK`, `401 Unauthorized`, `404 Not Found`, response envelope, required metadata fields, rating context fields, null/empty-safe rating behavior, forbidden fields, and deterministic error schemas.
- Place detail must not expose private notes, private list membership, creator identity, or another user's current-rating context.
- Rating display must use Western digits, period decimal, and LTR-safe formatting where ratings such as `8.5` are displayed.
- Generated artwork must be deterministic generated artwork and must not be presented as real photography.
- Global responsive/accessibility requirements from `RESPONSIVE_ACCESSIBILITY_USER_STORIES.md` are executable where they explicitly cover Place Detail, active screens, no horizontal overflow, safe areas, 200% zoom, keyboard access, focus-visible, screen-reader labels, or loading/status behavior.
- Automation cadence values used in Notes: Smoke, Regression, Nightly, and Manual Review.

## PLACE-017-US-001 - View place detail

User Story Summary: As an authenticated user, I want to view a place detail page so that I can inspect the selected place and available actions.

Related Feature ID: `PLACE-017`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-017-US-001-TC-001 | Authenticated user opens place detail route | UI, Positive, Regression | Critical | Authenticated user exists; place `p_restaurant_001` exists. | URL `/places/p_restaurant_001`. | 1. Sign in. 2. Open `/places/p_restaurant_001`. 3. Wait for detail content. | Place detail screen loads for `p_restaurant_001` and does not show an auth-denied or not-found state. | PLACE-017-US-001 | Yes | UI E2E | Smoke cadence. |
| PLACE-017-US-001-TC-002 | Place detail endpoint is traceable to route | API, Traceability Verification, Manual | Medium | QA traceability review is being performed. | `GET /api/v1/places/{id}`, `/places/{id}`. | 1. Review `FEATURE_TRACEABILITY.md`. 2. Confirm endpoint and UI route mapping for place detail. | Traceability evidence links `/places/{id}` to `GET /api/v1/places/{id}`, `PlaceDetailPage.tsx`, and `get_place_summary`. | PLACE-017-US-001 | No | Manual | Manual Review cadence. |
| PLACE-017-US-001-TC-003 | Direct URL access loads selected place context | UI, Routing, Integration | High | Authenticated user exists; place `p_cafe_001` exists. | Direct URL `/places/p_cafe_001`. | 1. Open the direct URL in a new authenticated browser tab. 2. Wait for page load. | The detail page represents `p_cafe_001`; no unrelated place metadata appears. | PLACE-017-US-001 | Yes | UI E2E | Regression cadence. |
| PLACE-017-US-001-TC-004 | Existing place detail API returns 200 OK | API, Contract, Positive | Critical | Authenticated user exists; place `p_restaurant_001` exists. | `GET /api/v1/places/p_restaurant_001` with Bearer token. | 1. Send authenticated request. 2. Inspect status and response body. | Response status is `200 OK`; body represents one place detail resource for `p_restaurant_001`. | PLACE-017-US-001 | Yes | API | Smoke cadence. Source: FEATURE_TRACEABILITY `GET /api/v1/places/{id}`. |
| PLACE-017-US-001-TC-005 | Place detail API response includes required metadata fields | API, Contract | Critical | Authenticated user exists; place exists with type, subtype, artwork, and rating context. | `GET /api/v1/places/{id}`. | 1. Send authenticated request. 2. Inspect response envelope and fields. | Response status is `200 OK`; response includes fields needed by documented detail UI: place identifier, name, type, subtype or null/empty-safe subtype state, generated artwork data or reference, community average rating context, rating count context, and current-user rating context. | PLACE-017-US-001 | Yes | API | Smoke cadence. Source: PLACE-017 metadata/rating stories and FEATURE_TRACEABILITY. |
| PLACE-017-US-001-TC-006 | Place detail API response excludes forbidden private fields | API, Privacy, Security | Critical | Authenticated user exists; place has ratings and appears in at least one private list owned by another user. | `GET /api/v1/places/{id}` as authenticated non-owner of private context. | 1. Send authenticated request. 2. Inspect full response JSON. | Response status is `200 OK`; response contains no private notes, private list membership, creator identity, private user rating notes, other users' private rating data, internal moderation fields, raw audit fields, debug fields, tokens, cookies, password fields, or undocumented internal IDs. | PLACE-017-US-001 | Yes | API | Smoke cadence. |
| PLACE-017-US-001-TC-007 | Place detail API null and empty-safe rating context is deterministic | API, Contract, Data Integrity | High | Authenticated user exists; place has no community ratings and current user has not rated it. | `GET /api/v1/places/{id}` for unrated place. | 1. Send authenticated request. 2. Inspect community and current-user rating context. | Response status is `200 OK`; no fake rating value is returned for community average or current-user rating; rating count context represents no ratings without exposing private data. | PLACE-017-US-001 | Yes | API | Regression cadence. |
| PLACE-017-US-001-TC-008 | Detail metadata is consistent with Places list summary | Integration, UI, API, Data Integrity | High | Authenticated user exists; same place appears in Places list and detail. | Place `p_consistency_001`. | 1. Load Places list. 2. Record visible name, type, subtype, average rating, and rating count for the place. 3. Open detail for the same place. 4. Compare documented metadata. | Places list and detail requests complete with `200 OK`; detail metadata matches the same place's documented Places list metadata after both views finish loading. | PLACE-017-US-001 | Yes | UI E2E | Regression cadence. Source: PLACE-017 and FEATURE_TRACEABILITY list/detail endpoints. |
| PLACE-017-US-001-TC-009 | Optional description detail exposure requires clarification | Requirement Clarification, Manual | Medium | Requirements review is being performed. | Place with optional description metadata. | 1. Inspect `PLACE-017` source requirements for description display. 2. Confirm whether description belongs on Place Detail or remains outside this feature. | No executable assertion is made for description on Place Detail until documented for `PLACE-017`. | PLACE-017-US-001 | No | Manual | Manual Review cadence. |
| PLACE-017-US-001-TC-010 | Lists context ownership is traceable outside PLACE-017 | Traceability Verification, Manual | Medium | QA traceability review is being performed. | `PLACE-017`, `PLACE-018`, `FEATURE_TRACEABILITY`. | 1. Review Place Detail stories for metadata versus lists-containing-this-place behavior. 2. Confirm list-membership display tests are owned by `PLACE-018`. | Traceability evidence separates `PLACE-017` metadata/rating context from `PLACE-018` list-membership context; no list behavior is treated as a `PLACE-017` executable requirement. | PLACE-017-US-001 | No | Manual | Manual Review cadence. |

## PLACE-017-US-002 - View place name

User Story Summary: As a user, I want to see the place name prominently so that I know which place I opened.

Related Feature ID: `PLACE-017`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-017-US-002-TC-001 | Place name is visible on detail | UI, Positive | Critical | Authenticated user exists; place named `Burger House` exists. | `/places/p_burger_house`. | 1. Open detail route. 2. Inspect primary page content. | `Burger House` is visible on the detail page. | PLACE-017-US-002 | Yes | UI E2E | Smoke cadence. |
| PLACE-017-US-002-TC-002 | Place name is prominent in heading area | UI, UX, Accessibility | High | Authenticated user exists; place named `Burger House` exists. | `/places/p_burger_house`. | 1. Open detail route. 2. Inspect heading or primary title region. | The place name appears in the primary title or heading region and is not only present in metadata text. | PLACE-017-US-002 | Yes | Accessibility | Regression cadence. |
| PLACE-017-US-002-TC-003 | Wrong place name does not appear after navigation | UI, Data Integrity, Negative | High | Authenticated user exists; places `p_a` and `p_b` exist with different names. | `/places/p_a`, `/places/p_b`. | 1. Open `/places/p_a`. 2. Navigate to `/places/p_b`. 3. Inspect visible name after load. | The visible place name matches `p_b`; stale `p_a` name is not shown after detail load completes. | PLACE-017-US-002 | Yes | UI E2E | Regression cadence. |

## PLACE-017-US-003 - View primary type

User Story Summary: As a user, I want to see the place type so that I know whether it is a restaurant, cafe, or ice cream place.

Related Feature ID: `PLACE-017`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-017-US-003-TC-001 | Restaurant type is localized on detail | UI, Localization, Arabic | High | Authenticated user exists; restaurant place exists. | `type=restaurant`. | 1. Open restaurant detail. 2. Inspect type metadata. | Localized restaurant type label is shown. | PLACE-017-US-003 | Yes | UI E2E | Smoke cadence. |
| PLACE-017-US-003-TC-002 | Cafe type is localized on detail | UI, Localization, Arabic | High | Authenticated user exists; cafe place exists. | `type=cafe`. | 1. Open cafe detail. 2. Inspect type metadata. | Localized cafe type label is shown. | PLACE-017-US-003 | Yes | UI E2E | Regression cadence. |
| PLACE-017-US-003-TC-003 | Ice cream type is localized on detail | UI, Localization, Arabic | High | Authenticated user exists; ice cream place exists. | `type=ice_cream`. | 1. Open ice cream detail. 2. Inspect type metadata. | Localized ice cream type label is shown. | PLACE-017-US-003 | Yes | UI E2E | Regression cadence. |
| PLACE-017-US-003-TC-004 | Unsupported type display behavior requires clarification | Requirement Clarification, Manual | Medium | Requirements review is being performed. | Place with unsupported type value. | 1. Inspect source requirements for impossible or legacy type values. 2. Confirm expected UI/API behavior if invalid type data exists. | No executable assertion is made for unsupported persisted type values until documented. | PLACE-017-US-003 | No | Manual | Manual Review cadence. |

## PLACE-017-US-004 - View subtype when available

User Story Summary: As a user, I want to see subtype when it exists so that the place category is clearer.

Related Feature ID: `PLACE-017`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-017-US-004-TC-001 | Restaurant subtype is shown when available | UI, Positive, Localization | High | Authenticated user exists; restaurant place has subtype `burger`. | `/places/p_burger`. | 1. Open detail. 2. Inspect subtype metadata. | Localized `burger` subtype is shown. | PLACE-017-US-004 | Yes | UI E2E | Smoke cadence. |
| PLACE-017-US-004-TC-002 | Cafe subtype is shown when available | UI, Positive, Localization | High | Authenticated user exists; cafe place has subtype `coffee`. | `/places/p_coffee`. | 1. Open detail. 2. Inspect subtype metadata. | Localized `coffee` subtype is shown. | PLACE-017-US-004 | Yes | UI E2E | Regression cadence. |
| PLACE-017-US-004-TC-003 | Subtype matches selected place and not previous route | UI, Data Integrity, Regression | Medium | Authenticated user exists; restaurant and cafe places exist. | Restaurant subtype `burger`; cafe subtype `coffee`. | 1. Open restaurant detail. 2. Navigate to cafe detail. 3. Inspect subtype. | Detail shows cafe subtype only; restaurant subtype is not stale after load completes. | PLACE-017-US-004 | Yes | UI E2E | Regression cadence. |

## PLACE-017-US-005 - Hide subtype when unavailable

User Story Summary: As a user, I do not want empty subtype placeholders so that the detail page stays clean.

Related Feature ID: `PLACE-017`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-017-US-005-TC-001 | Ice cream detail hides blank subtype section | UI, Positive | High | Authenticated user exists; ice cream place exists with no subtype. | `type=ice_cream`, `subtype=null`. | 1. Open ice cream detail. 2. Inspect metadata sections. | No blank subtype section, empty subtype label, or placeholder-only subtype row appears. | PLACE-017-US-005 | Yes | UI E2E | Smoke cadence. |
| PLACE-017-US-005-TC-002 | Hidden subtype does not remove primary type | UI, Regression | Medium | Authenticated user exists; ice cream place exists with no subtype. | Ice cream detail. | 1. Open detail. 2. Inspect type and subtype metadata. | Primary localized ice cream type remains visible while subtype placeholder is absent. | PLACE-017-US-005 | Yes | UI E2E | Regression cadence. |
| PLACE-017-US-005-TC-003 | Null subtype API representation requires clarification | Requirement Clarification, API, Manual | Medium | Requirements review is being performed. | `GET /api/v1/places/{id}` for ice cream place. | 1. Inspect source requirements for detail API subtype field behavior. 2. Confirm whether subtype is omitted or returned as `null`. | No executable API assertion is made for null subtype serialization until documented. | PLACE-017-US-005 | No | Manual | Manual Review cadence. |

## PLACE-017-US-006 - View generated artwork

User Story Summary: As a user, I want generated artwork on detail so that the place has a recognizable visual marker.

Related Feature ID: `PLACE-017`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-017-US-006-TC-001 | Generated artwork is visible on detail | UI, Positive, Visual | Medium | Authenticated user exists; place detail is available. | `/places/p_artwork_001`. | 1. Open detail. 2. Inspect artwork region. | Generated artwork is visible on the detail page. | PLACE-017-US-006 | Yes | UI E2E | Regression cadence. |
| PLACE-017-US-006-TC-002 | Artwork is not presented as real photography | UI, UX, Visual | Medium | Authenticated user exists; place detail is available. | Detail artwork. | 1. Open detail. 2. Inspect artwork labels, alt text, and nearby copy. | Artwork is not labeled, described, or represented as real photography. | PLACE-017-US-006 | Yes | Accessibility | Regression cadence. |
| PLACE-017-US-006-TC-003 | Deterministic artwork remains stable after reload | UI, Regression, Visual | Medium | Authenticated user exists; place detail is available. | `/places/p_artwork_001`. | 1. Open detail and capture artwork identity. 2. Refresh page. 3. Compare rendered artwork identity for same place. | The same place renders the same generated artwork after reload. | PLACE-017-US-006 | Yes | UI E2E | Regression cadence. |
| PLACE-017-US-006-TC-004 | Artwork implementation details require clarification | Requirement Clarification, Manual | Low | Requirements review is being performed. | Generated artwork algorithm or hash. | 1. Inspect source requirements for artwork generation algorithm. 2. Confirm whether algorithm, colors, or visual hash are specified. | No executable assertion is made for artwork algorithm, palette, or pixel thresholds until documented. | PLACE-017-US-006 | No | Manual | Manual Review cadence. |

## PLACE-017-US-007 - View community rating

User Story Summary: As a user, I want to see community average rating so that I understand overall sentiment.

Related Feature ID: `PLACE-017`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-017-US-007-TC-001 | Average rating is shown for rated place | UI, Positive | High | Authenticated user exists; place has community average rating. | Average rating `8.5`. | 1. Open detail. 2. Inspect community rating context. | Average rating is shown for the place. | PLACE-017-US-007 | Yes | UI E2E | Smoke cadence. |
| PLACE-017-US-007-TC-002 | Decimal average rating is shown without fake rounding rules | UI, Boundary | Medium | Authenticated user exists; place has decimal average rating. | Average rating `8.5`. | 1. Open detail. 2. Inspect displayed average. | A community average value is visible; exact rounding precision is not asserted beyond documented rating-format tests. | PLACE-017-US-007 | Yes | UI E2E | Regression cadence. |
| PLACE-017-US-007-TC-003 | Average rating updates after backend data refresh | Integration, Regression | Medium | Authenticated user exists; test can create or update ratings through supported flows. | Place initially has average `8.0`; later average differs. | 1. Open detail and record average. 2. Update rating data through documented rating flow or fixture. 3. Reload detail. | Detail reflects the latest available community average after reload; stale previous average is not shown after load completes. | PLACE-017-US-007 | Yes | UI E2E | Nightly cadence. |
| PLACE-017-US-007-TC-004 | Exact rating aggregation formula requires clarification | Requirement Clarification, Manual | Medium | Requirements review is being performed. | Multiple ratings with mixed values. | 1. Inspect source requirements for aggregation formula and rounding. 2. Confirm exact calculation and precision rules. | No executable formula-specific assertion is made until aggregation rules are documented. | PLACE-017-US-007 | No | Manual | Manual Review cadence. |

## PLACE-017-US-008 - View rating count

User Story Summary: As a user, I want to see rating count so that I know how much confidence to place in the average.

Related Feature ID: `PLACE-017`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-017-US-008-TC-001 | Rating count is shown for rated place | UI, Positive | High | Authenticated user exists; place has ratings. | Place with `ratingCount=3`. | 1. Open detail. 2. Inspect community rating context. | Rating count is shown for the rated place. | PLACE-017-US-008 | Yes | UI E2E | Smoke cadence. |
| PLACE-017-US-008-TC-002 | Rating count matches current place context | UI, Data Integrity | High | Authenticated user exists; two places have different rating counts. | Place A count `1`; Place B count `3`. | 1. Open Place A detail. 2. Navigate to Place B detail. 3. Inspect count. | Count shown after load matches Place B, not stale Place A data. | PLACE-017-US-008 | Yes | UI E2E | Regression cadence. |
| PLACE-017-US-008-TC-003 | Rating count update after rating change is reflected on reload | Integration, Regression | Medium | Authenticated user exists; rating flow or fixture can add a rating. | Place count changes from `1` to `2`. | 1. Open detail and record count. 2. Add a rating through documented flow or fixture. 3. Reload detail. | Detail shows the latest available rating count after reload. | PLACE-017-US-008 | Yes | UI E2E | Nightly cadence. |

## PLACE-017-US-009 - Hide community section when no data

User Story Summary: As a user, I do not want fake or empty community rating sections.

Related Feature ID: `PLACE-017`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-017-US-009-TC-001 | Unrated place does not show fake average | UI, Negative, Privacy | High | Authenticated user exists; place has no ratings. | Unrated place. | 1. Open detail. 2. Inspect community rating area. | No fake average rating such as `0`, `0.0`, `10`, or placeholder score is shown. | PLACE-017-US-009 | Yes | UI E2E | Smoke cadence. |
| PLACE-017-US-009-TC-002 | Unrated place hides or safely replaces community section | UI, Empty State | Medium | Authenticated user exists; place has no ratings. | Unrated place. | 1. Open detail. 2. Inspect community rating area. | Community rating content is either hidden or shown as an intentional empty-safe state without fake values. | PLACE-017-US-009 | Yes | UI E2E | Regression cadence. |
| PLACE-017-US-009-TC-003 | Empty-safe copy exact text requires clarification | Requirement Clarification, Manual | Low | Requirements review is being performed. | Unrated community state. | 1. Inspect source requirements for exact empty-state copy. 2. Confirm whether hidden section or copy is required. | No executable assertion is made for exact empty-state copy until documented. | PLACE-017-US-009 | No | Manual | Manual Review cadence. |

## PLACE-017-US-010 - View current user rating

User Story Summary: As a user, I want to see my rating on the detail page so that I know whether I have logged this place.

Related Feature ID: `PLACE-017`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-017-US-010-TC-001 | Current user's rating is shown | UI, Positive, Privacy | High | Authenticated user has rated the place. | Current user's rating `8.5`. | 1. Sign in as rating owner. 2. Open place detail. 3. Inspect personal rating context. | The current user's rating is shown on detail. | PLACE-017-US-010 | Yes | UI E2E | Smoke cadence. |
| PLACE-017-US-010-TC-002 | Current-user rating belongs to signed-in user only | UI, Privacy, Negative | Critical | User A and User B exist; only User A rated the place. | Same place viewed by User B. | 1. Sign in as User B. 2. Open detail. 3. Inspect personal rating context. | User A's personal rating is not shown as User B's current-user rating. | PLACE-017-US-010 | Yes | UI E2E | Regression cadence. |
| PLACE-017-US-010-TC-003 | Personal rating updates after edit and reload | Integration, Regression | Medium | Authenticated user has rated the place and can edit rating through documented flow. | Rating changes from `7.5` to `9`. | 1. Open detail and record current-user rating. 2. Edit rating through documented flow. 3. Return or reload detail. | Current-user rating context reflects the latest saved rating. | PLACE-017-US-010 | Yes | UI E2E | Nightly cadence. |
| PLACE-017-US-010-TC-004 | Current-user rating API field requires clarification | Requirement Clarification, API, Manual | Medium | Requirements review is being performed. | `GET /api/v1/places/{id}` current-user context. | 1. Inspect source requirements for API field names containing current-user rating. 2. Confirm exact response schema. | No executable API field assertion is made for current-user rating until schema is documented. | PLACE-017-US-010 | No | Manual | Manual Review cadence. |

## PLACE-017-US-011 - Hide current user rating when absent

User Story Summary: As a user, I do not want empty personal rating sections when I have not rated a place.

Related Feature ID: `PLACE-017`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-017-US-011-TC-001 | Personal rating is hidden for unrated current user | UI, Positive, Privacy | High | Authenticated user has not rated the place. | Unrated-by-current-user place. | 1. Open detail. 2. Inspect personal rating area. | No empty personal rating value or fake current-user score is shown. | PLACE-017-US-011 | Yes | UI E2E | Smoke cadence. |
| PLACE-017-US-011-TC-002 | Rate action can replace absent personal rating | UI, UX | Medium | Authenticated user has not rated the place. | Place detail. | 1. Open detail. 2. Inspect personal rating/action area. | The absent current-user rating section is hidden or replaced by the rate action. | PLACE-017-US-011 | Yes | UI E2E | Regression cadence. |
| PLACE-017-US-011-TC-003 | Exact absent-rating copy requires clarification | Requirement Clarification, Manual | Low | Requirements review is being performed. | User has not rated place. | 1. Inspect source requirements for exact absent-rating copy or layout. 2. Confirm whether hidden section or rate action is required. | No executable exact-copy assertion is made until documented. | PLACE-017-US-011 | No | Manual | Manual Review cadence. |

## PLACE-017-US-012 - Format ratings consistently

User Story Summary: As a user, I want ratings formatted consistently so that numeric values are easy to read in RTL.

Related Feature ID: `PLACE-017`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-017-US-012-TC-001 | Decimal rating uses Western digits and period | UI, Localization, RTL | High | Authenticated user exists; place has displayed rating `8.5`. | Average or current-user rating `8.5`. | 1. Open detail. 2. Inspect displayed rating text. | Rating displays Western digits `8.5` with period decimal separator. | PLACE-017-US-012 | Yes | UI E2E | Smoke cadence. |
| PLACE-017-US-012-TC-002 | Integer rating uses Western digits | UI, Localization, RTL | Medium | Authenticated user exists; place has displayed rating `9`. | Rating `9`. | 1. Open detail. 2. Inspect displayed rating text. | Rating displays Western digit `9`, not Arabic-Indic numerals. | PLACE-017-US-012 | Yes | UI E2E | Regression cadence. |
| PLACE-017-US-012-TC-003 | Rating text is LTR-safe inside RTL layout | UI, Accessibility, Localization | High | Authenticated user exists; RTL layout is active; place has rating `8.5`. | Rating text near Arabic label. | 1. Open detail in RTL layout. 2. Inspect rendered rating order. | Rating value remains readable as `8.5` and is not reordered around adjacent Arabic text. | PLACE-017-US-012 | Yes | UI E2E | Regression cadence. |
| PLACE-017-US-012-TC-004 | Exact rating precision requires clarification | Requirement Clarification, Manual | Medium | Requirements review is being performed. | Ratings such as `8.25`, `8.75`, `9`. | 1. Inspect source requirements for precision and rounding. 2. Confirm allowed displayed precision. | No executable precision or rounding assertion is made beyond documented `8.5` formatting until documented. | PLACE-017-US-012 | No | Manual | Manual Review cadence. |

## PLACE-017-US-013 - Handle long Arabic names

User Story Summary: As an Arabic user, I want long Arabic place names readable so that important names are not clipped.

Related Feature ID: `PLACE-017`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-017-US-013-TC-001 | Long Arabic name does not cause horizontal overflow on mobile | UI, Responsive, Arabic | High | Authenticated user exists; long Arabic place name exists. | `مطعم الأطباق العربية التقليدية الطويل جدا`. | 1. Open detail on a small mobile viewport. 2. Inspect page width. | Name wraps or clamps predictably; page does not create horizontal overflow. | PLACE-017-US-013 | Yes | UI E2E | Regression cadence. |
| PLACE-017-US-013-TC-002 | Long Arabic name remains readable | UI, UX, Arabic | High | Authenticated user exists; long Arabic place name exists. | Long Arabic name. | 1. Open detail. 2. Inspect primary title area. | Important name text remains readable and is not clipped mid-glyph. | PLACE-017-US-013 | Yes | UI E2E | Regression cadence. |
| PLACE-017-US-013-TC-003 | Long Arabic name passes mobile viewport matrix | UI, Responsive, Arabic | High | Authenticated user exists; long Arabic place name exists; global viewport and overflow requirements `RESP-002-US-001`, `RESP-002-US-002`, and `RESP-003-US-005` apply. | Viewports `320x568`, `390x844`, `430x932`; long Arabic name. | 1. Open detail at each viewport. 2. Inspect title rendering and page width. | Long Arabic name remains contained; `document.documentElement.scrollWidth <= window.innerWidth` at each viewport. | PLACE-017-US-013 | Yes | UI E2E | Regression cadence. Source: PLACE-017-US-013, RESP-002-US-001, RESP-002-US-002, RESP-003-US-005. |

## PLACE-017-US-014 - Handle long English and mixed names

User Story Summary: As a user, I want English and mixed-language place names to render correctly so that real-world names remain readable.

Related Feature ID: `PLACE-017`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-017-US-014-TC-001 | Long English name does not overflow detail | UI, Responsive | High | Authenticated user exists; place with long English name exists. | `The Extremely Long International Burger Restaurant Name`. | 1. Open detail. 2. Inspect title and page width. | Long English name wraps or clamps without offscreen text. | PLACE-017-US-014 | Yes | UI E2E | Regression cadence. |
| PLACE-017-US-014-TC-002 | Mixed Arabic and English name uses bidi-safe rendering | UI, Localization, RTL | High | Authenticated user exists; mixed-language place name exists. | `مطعم Burger House الرياض`. | 1. Open detail. 2. Inspect title rendering. | Mixed name is readable; Arabic and English segments do not collide or move offscreen. | PLACE-017-US-014 | Yes | UI E2E | Regression cadence. |
| PLACE-017-US-014-TC-003 | Mixed name does not collide with rating metadata | UI, UX, Regression | Medium | Authenticated user exists; mixed-language name and rating metadata exist. | Mixed name plus rating `8.5`. | 1. Open detail. 2. Inspect title and nearby rating metadata. | Name rendering does not collide with rating metadata or actions. | PLACE-017-US-014 | Yes | UI E2E | Regression cadence. |
| PLACE-017-US-014-TC-004 | Exact bidi isolation implementation requires clarification | Requirement Clarification, Manual | Low | Requirements review is being performed. | Mixed Arabic/English title. | 1. Inspect source requirements for required bidi isolation mechanism. 2. Confirm whether implementation mechanism is specified. | No executable assertion is made for specific bidi implementation until documented. | PLACE-017-US-014 | No | Manual | Manual Review cadence. |
| PLACE-017-US-014-TC-005 | Long English and mixed names pass 200% zoom | UI, Responsive, Accessibility | High | Authenticated user exists; long English and mixed-language place names exist; global zoom requirements `RESP-003-US-001`, `RESP-003-US-006`, and `RESP-003-US-007` apply. | 200% browser zoom in Chromium, Firefox, or WebKit. | 1. Set browser zoom to 200%. 2. Open long English name detail. 3. Open mixed Arabic/English name detail. 4. Inspect title, rating metadata, and page width. | Names remain readable without clipping; `document.documentElement.scrollWidth <= window.innerWidth`; core actions remain available. | PLACE-017-US-014 | Yes | UI E2E | Nightly cadence. Source: PLACE-017-US-014, RESP-003-US-001, RESP-003-US-006, RESP-003-US-007. |

## PLACE-017-US-015 - Loading state

User Story Summary: As a user, I want loading feedback while place detail is fetched so that the page does not feel broken.

Related Feature ID: `PLACE-017`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-017-US-015-TC-001 | Compact loading state appears while detail is pending | UI, Loading State | Medium | Authenticated user exists; network can delay detail request. | Delayed `GET /api/v1/places/{id}`. | 1. Open detail with delayed response. 2. Observe pending state. | A compact loading state appears before detail data is shown. | PLACE-017-US-015 | Yes | UI E2E | Regression cadence. |
| PLACE-017-US-015-TC-002 | Loading state does not show fake metadata | UI, Loading State, Negative | Medium | Authenticated user exists; network can delay detail request. | Delayed detail request. | 1. Open detail. 2. Inspect loading state before response. | Loading state does not show fake place name, fake rating, or fake rating count. | PLACE-017-US-015 | Yes | UI E2E | Regression cadence. |
| PLACE-017-US-015-TC-003 | Loading state resolves to loaded detail | UI, Integration | Medium | Authenticated user exists; delayed request eventually succeeds. | Existing place ID. | 1. Open detail with delayed successful response. 2. Wait for response. | Loading state is replaced by loaded place detail. | PLACE-017-US-015 | Yes | UI E2E | Regression cadence. |
| PLACE-017-US-015-TC-004 | Loading state matches responsive layout dimensions | UI, Loading State, Responsive | Medium | Authenticated user exists; detail request can be delayed; global loading-layout requirement `RESP-002-US-021` applies. | Delayed detail request at `320x568` and `1440x900`. | 1. Open detail with delayed response at each viewport. 2. Inspect loading state dimensions. | Loading state appears compactly, matches the final detail layout dimensions closely enough to avoid layout jump, and does not create horizontal overflow. | PLACE-017-US-015 | Yes | UI E2E | Regression cadence. Source: PLACE-017-US-015, RESP-002-US-021. |
| PLACE-017-US-015-TC-005 | Detail loading status is announced accessibly | Accessibility, Loading State, Screen Reader | High | Authenticated user exists; detail request can be delayed; global accessible-status pattern `A11Y-001-US-016` applies by approved accessibility baseline. | Delayed detail request. | 1. Open detail with delayed response. 2. Inspect accessibility tree or screen-reader event output. | Loading status is exposed through `aria-busy`, `role=status`, or an equivalent accessible status mechanism and does not rely only on animation. | PLACE-017-US-015 | Yes | Accessibility | Regression cadence. Source: PLACE-017-US-015, A11Y-001-US-016. |

## PLACE-017-US-016 - Not-found or API error

User Story Summary: As a user, I want a clear error if the place cannot be loaded so that I understand the link is invalid or unavailable.

Related Feature ID: `PLACE-017`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-017-US-016-TC-001 | Invalid place ID shows error or not-found state | UI, Error Handling, Negative | High | Authenticated user exists. | URL `/places/invalid-id`. | 1. Open invalid place detail URL. 2. Wait for result state. | Detail shows an error or not-found state without fake place metadata. | PLACE-017-US-016 | Yes | UI E2E | Smoke cadence. |
| PLACE-017-US-016-TC-002 | API failure shows clear error state | UI, Error Handling, Negative | High | Authenticated user exists; detail request can be forced to fail. | Existing place ID with failed API response. | 1. Open detail while API fails. 2. Inspect state. | Error state appears and no fake place metadata is shown. | PLACE-017-US-016 | Yes | UI E2E | Regression cadence. |
| PLACE-017-US-016-TC-003 | Retry behavior requires clarification | Requirement Clarification, Manual | Medium | Requirements review is being performed. | Detail API failure. | 1. Inspect source requirements for retry control or auto-retry. 2. Confirm whether retry is required. | No executable retry assertion is made until documented. | PLACE-017-US-016 | No | Manual | Manual Review cadence. |
| PLACE-017-US-016-TC-004 | Nonexistent place detail API returns 404 Not Found | API, Error Handling, Negative | Critical | Authenticated user exists; place ID does not exist. | `GET /api/v1/places/nonexistent-place-id`. | 1. Send authenticated request for nonexistent ID. 2. Inspect status and error body. | Response status is `404 Not Found`; response uses deterministic error schema and contains no fake place metadata. | PLACE-017-US-016 | Yes | API | Smoke cadence. |
| PLACE-017-US-016-TC-005 | Deleted place behavior requires clarification | Requirement Clarification, Manual | Medium | Requirements review is being performed. | Deleted or archived place ID. | 1. Inspect source requirements for deleted place behavior. 2. Confirm whether detail shows not-found, unavailable, or another state. | No executable deleted-place assertion is made until documented. | PLACE-017-US-016 | No | Manual | Manual Review cadence. |
| PLACE-017-US-016-TC-006 | Not-found error payload excludes internals | API, Error Handling, Privacy, Security | High | Authenticated user exists; place ID does not exist. | `GET /api/v1/places/nonexistent-place-id`. | 1. Send authenticated request. 2. Inspect error response. | Response status is `404 Not Found`; error payload contains no stack trace, raw SQL, internal file path, debug context, private notes, private list membership, creator identity, tokens, cookies, or undocumented internal IDs. | PLACE-017-US-016 | Yes | Security | Regression cadence. |

## PLACE-017-US-017 - Unauthorized access denied

User Story Summary: As the system, I want place detail protected so that anonymous users cannot access place data.

Related Feature ID: `PLACE-017`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-017-US-017-TC-001 | Guest opening place detail is denied or prompted to sign in | UI, Authentication, Negative | Critical | No authenticated session exists; place ID exists. | `/places/p_restaurant_001`. | 1. Open place detail as guest. 2. Inspect rendered state. | Guest does not see place data and is denied or shown a sign-in prompt. | PLACE-017-US-017 | Yes | UI E2E | Smoke cadence. |
| PLACE-017-US-017-TC-002 | Guest receives no private-data flash | UI, Privacy, Security | Critical | No authenticated session exists; place ID exists; rendering can be observed during auth resolution. | `/places/p_restaurant_001`. | 1. Open place detail as guest. 2. Observe initial render through final denied state. | Place metadata, current-user rating, private notes, private list membership, and creator identity are never rendered for the guest. | PLACE-017-US-017 | Yes | Security | Smoke cadence. |
| PLACE-017-US-017-TC-003 | Unauthenticated place detail API returns 401 Unauthorized | API, Authentication, Negative | Critical | No authenticated session or Bearer token exists; place ID exists. | `GET /api/v1/places/p_restaurant_001` without Bearer token. | 1. Send unauthenticated request. 2. Inspect status and response body. | Response status is `401 Unauthorized`; response contains no place metadata or current-user context. | PLACE-017-US-017 | Yes | API | Smoke cadence. |
| PLACE-017-US-017-TC-004 | Authenticated user can access protected detail | UI, Authentication, Positive | Critical | Authenticated user exists; place exists. | `/places/p_restaurant_001`. | 1. Sign in. 2. Open detail. | Authenticated user can view the place detail screen. | PLACE-017-US-017 | Yes | UI E2E | Smoke cadence. |
| PLACE-017-US-017-TC-005 | Unauthorized error payload excludes private and internal data | API, Privacy, Security, Negative | High | No authenticated session or Bearer token exists; place ID exists. | Unauthenticated `GET /api/v1/places/p_restaurant_001`. | 1. Send unauthenticated request. 2. Inspect response body. | Response status is `401 Unauthorized`; error payload contains no place name, type, subtype, rating context, private notes, private list membership, creator identity, stack trace, raw debug fields, tokens, cookies, or undocumented internal IDs. | PLACE-017-US-017 | Yes | Security | Regression cadence. |
| PLACE-017-US-017-TC-006 | Expired session on detail is denied without private-data flash | UI, Authentication, Privacy, Security | Critical | User has expired session; place exists; UI render can be observed during auth recovery. | `/places/p_restaurant_001` with expired auth state. | 1. Open place detail with expired session. 2. Observe render from initial load through final auth state. | Place metadata, current-user rating, private notes, private list membership, and creator identity are never displayed before denial or sign-in prompt. | PLACE-017-US-017 | Yes | Security | Regression cadence. |

## PLACE-017-US-018 - Mobile detail UX

User Story Summary: As a mobile user, I want place detail to be compact and action-oriented so that I can use it without zooming.

Related Feature ID: `PLACE-017`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-017-US-018-TC-001 | Small mobile detail content fits without zooming | UI, Responsive, Mobile | High | Authenticated user exists; mobile viewport is available. | Small mobile viewport. | 1. Open place detail on a small mobile viewport. 2. Inspect visible content and page width. | Content fits without requiring browser zoom-out or horizontal scrolling. | PLACE-017-US-018 | Yes | UI E2E | Smoke cadence. |
| PLACE-017-US-018-TC-002 | Detail actions remain reachable on mobile | UI, Mobile, UX | High | Authenticated user exists; mobile viewport is available. | Place detail with actions. | 1. Open detail on mobile. 2. Scroll to action area. | Primary detail actions remain reachable. | PLACE-017-US-018 | Yes | UI E2E | Regression cadence. |
| PLACE-017-US-018-TC-003 | Bottom navigation does not hide detail content | UI, Responsive, Mobile | High | Authenticated user exists; bottom navigation is rendered. | Small mobile viewport. | 1. Open detail. 2. Scroll to end of content. | Bottom navigation does not hide final content or actions. | PLACE-017-US-018 | Yes | UI E2E | Regression cadence. |
| PLACE-017-US-018-TC-004 | Place Detail passes full responsive certification matrix | UI, Responsive, Mobile | Critical | Authenticated user exists; global matrix requirements `RESP-002-US-001` and `RESP-002-US-002` apply. | Viewports `320x568`, `390x844`, `430x932`, `768x1024`, `1024x768`, `1440x900`. | 1. Open detail at each viewport. 2. Inspect layout and page width. | Place Detail fits each viewport; `document.documentElement.scrollWidth <= window.innerWidth`; content and actions remain usable. | PLACE-017-US-018 | Yes | UI E2E | Smoke cadence. Source: PLACE-017-US-018, RESP-002-US-001, RESP-002-US-002. |
| PLACE-017-US-018-TC-005 | Place Detail supports safe areas | UI, Responsive, Mobile | High | Authenticated user exists; safe-area viewport is available; global safe-area requirements `RESP-002-US-004` and `RESP-002-US-005` apply. | Notch device or iOS Safari-like safe-area viewport. | 1. Open detail on safe-area viewport. 2. Inspect header/top content and final actions. | Header/top content accounts for top safe area; final content/actions remain above bottom navigation, safe-area padding, and browser UI. | PLACE-017-US-018 | Yes | UI E2E | Regression cadence. Source: PLACE-017-US-018, RESP-002-US-004, RESP-002-US-005. |
| PLACE-017-US-018-TC-006 | Place Detail supports phone landscape | UI, Responsive, Mobile | High | Authenticated user exists; global landscape requirement `RESP-002-US-012` applies. | Phone landscape viewport. | 1. Open detail in phone landscape. 2. Inspect metadata, rating context, and actions. | No horizontal overflow occurs; fixed navigation does not hide critical content or actions. | PLACE-017-US-018 | Yes | UI E2E | Regression cadence. Source: PLACE-017-US-018, RESP-002-US-012. |
| PLACE-017-US-018-TC-007 | Place Detail supports 200% zoom | UI, Responsive, Accessibility | High | Authenticated user exists; global zoom requirements `RESP-003-US-001` and `RESP-003-US-002` apply. | 200% browser zoom in Chromium, Firefox, or WebKit. | 1. Set browser zoom to 200%. 2. Open detail. 3. Inspect content, rating context, actions, and page width. | No horizontal overflow occurs; core metadata, rating context, and actions remain available. | PLACE-017-US-018 | Yes | UI E2E | Nightly cadence. Source: PLACE-017-US-018, RESP-003-US-001, RESP-003-US-002. |

## PLACE-017-US-019 - Accessible detail content

User Story Summary: As a screen-reader or keyboard user, I want detail content and actions accessible so that I can inspect and act on the place.

Related Feature ID: `PLACE-017`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-017-US-019-TC-001 | Detail has clear heading for place content | Accessibility, Screen Reader, UI | High | Authenticated user exists; place exists. | Place detail. | 1. Open detail. 2. Inspect heading structure or accessibility tree. | Detail content exposes a clear heading for the place. | PLACE-017-US-019 | Yes | Accessibility | Smoke cadence. |
| PLACE-017-US-019-TC-002 | Metadata has clear accessible labels | Accessibility, Screen Reader | High | Authenticated user exists; place with type, subtype, and ratings exists. | Place detail metadata. | 1. Open detail. 2. Inspect accessibility tree for metadata labels. | Metadata, ratings, and actions have clear labels for assistive technology. | PLACE-017-US-019 | Yes | Accessibility | Regression cadence. |
| PLACE-017-US-019-TC-003 | Keyboard navigation reaches detail actions | Accessibility, Keyboard | High | Authenticated user exists; detail actions are present. | Place detail actions. | 1. Open detail. 2. Navigate by keyboard only. | Keyboard focus can reach available detail actions in logical order. | PLACE-017-US-019 | Yes | Accessibility | Smoke cadence. |
| PLACE-017-US-019-TC-004 | Focus-visible appears on detail actions | Accessibility, Keyboard | High | Authenticated user exists; detail actions are present. | Keyboard navigation. | 1. Open detail. 2. Tab to each action. | Each focused action has visible focus indication. | PLACE-017-US-019 | Yes | Accessibility | Regression cadence. |
| PLACE-017-US-019-TC-005 | Detail loading and error status announcements are accessible | Accessibility, Screen Reader, Loading State, Error Handling | High | Authenticated user exists; loading and error states can be triggered; global accessible-status pattern `A11Y-001-US-016` applies by approved accessibility baseline. | Delayed detail request and failed detail request. | 1. Open detail with delayed response. 2. Inspect accessible status. 3. Trigger failed detail request. 4. Inspect accessible error announcement. | Loading and error status changes are exposed through accessible status text, `aria-busy`, `role=status`, live region, or equivalent mechanism and do not rely only on animation or color. | PLACE-017-US-019 | Yes | Accessibility | Regression cadence. Source: PLACE-017-US-019, A11Y-001-US-016. |
| PLACE-017-US-019-TC-006 | Screen-reader exact announcement strings require clarification | Requirement Clarification, Accessibility, Manual | Low | Requirements review is being performed. | Metadata and rating announcements. | 1. Inspect source requirements for exact accessible names or announcement text. 2. Confirm required strings if any. | No executable exact announcement-string assertion is made until documented. | PLACE-017-US-019 | No | Manual | Manual Review cadence. |
| PLACE-017-US-019-TC-007 | Rating context has screen-reader numeric context | Accessibility, Screen Reader, Localization | High | Authenticated user exists; detail displays rating value and count; global numeric context requirement `RESP-004-US-009` applies. | Rating `8.5`; rating count `3`. | 1. Open detail. 2. Inspect accessibility tree for rating value and count. | Numeric rating and count expose accessible labels that identify them as rating value and rating count, not unlabeled numbers. | PLACE-017-US-019 | Yes | Accessibility | Regression cadence. Source: PLACE-017-US-019, RESP-004-US-009. |

## Final Summary

1. User stories processed: 19
2. Total executable test cases: 72
3. Clarification / Manual / Traceability cases: 15
4. Total test cases: 87
5. Test count per user story:
   - `PLACE-017-US-001`: 10
   - `PLACE-017-US-002`: 3
   - `PLACE-017-US-003`: 4
   - `PLACE-017-US-004`: 3
   - `PLACE-017-US-005`: 3
   - `PLACE-017-US-006`: 4
   - `PLACE-017-US-007`: 4
   - `PLACE-017-US-008`: 3
   - `PLACE-017-US-009`: 3
   - `PLACE-017-US-010`: 4
   - `PLACE-017-US-011`: 3
   - `PLACE-017-US-012`: 4
   - `PLACE-017-US-013`: 3
   - `PLACE-017-US-014`: 5
   - `PLACE-017-US-015`: 5
   - `PLACE-017-US-016`: 6
   - `PLACE-017-US-017`: 6
   - `PLACE-017-US-018`: 7
   - `PLACE-017-US-019`: 7
6. Count by test type:
   - API: 12
   - Accessibility: 12
   - Arabic: 6
   - Authentication: 4
   - Boundary: 1
   - Contract: 3
   - Data Integrity: 5
   - Empty State: 1
   - Error Handling: 5
   - Integration: 6
   - Keyboard: 2
   - Loading State: 5
   - Localization: 10
   - Manual: 15
   - Mobile: 6
   - Negative: 10
   - Positive: 12
   - Privacy: 9
   - Regression: 8
   - Requirement Clarification: 13
   - Responsive: 11
   - Routing: 1
   - RTL: 3
   - Screen Reader: 5
   - Security: 5
   - Traceability Verification: 2
   - UI: 55
   - UX: 6
   - Visual: 3
7. Count by priority:
   - Critical: 13
   - High: 42
   - Medium: 27
   - Low: 5
8. Count by automation layer:
   - API: 6
   - Accessibility: 9
   - Manual: 15
   - Security: 4
   - UI E2E: 53
9. Top automation candidates:
   - `PLACE-017-US-001-TC-004` for `GET /api/v1/places/{id}` `200 OK` contract coverage.
   - `PLACE-017-US-001-TC-006` for authenticated response forbidden-field privacy coverage.
   - `PLACE-017-US-001-TC-001` for authenticated detail route smoke coverage.
   - `PLACE-017-US-002-TC-001` for visible place name.
   - `PLACE-017-US-016-TC-004` for `404 Not Found` contract coverage.
   - `PLACE-017-US-017-TC-003` for `401 Unauthorized` contract coverage.
   - `PLACE-017-US-017-TC-002` for no private-data flash.
   - `PLACE-017-US-018-TC-004` for responsive certification matrix.
   - `PLACE-017-US-019-TC-003` for keyboard access to actions.
10. Manual-only tests:
   - Requirement clarifications for optional description detail exposure, unsupported type data, null subtype serialization, artwork algorithm, rating aggregation formula, exact empty-state copy, current-user rating API field names, absent-rating copy, rating precision, deleted-place behavior, and screen-reader exact announcement strings.
   - Traceability verification for endpoint-to-route mapping and list-membership ownership by `PLACE-018`.
11. Validation:
   - Duplicate Test IDs: 0
   - Invalid Story References: 0
   - Missing User Stories: 0
   - Encoding/Mojibake: 0
   - API Tests Missing Status Codes: 0
   - Requirement Fidelity Violations: 0
