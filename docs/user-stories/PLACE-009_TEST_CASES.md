# PLACE-009 Test Cases

Feature: `PLACE-009 - Create restaurant with subtype`

Source: `docs/user-stories/PLACES_USER_STORIES.md`

Scope: All user stories under `PLACE-009`.

## QA Execution Standards

- `POST /api/v1/places` creates shared catalog places only for authenticated users.
- Restaurant create payload requires `name`, `type=restaurant`, and an approved restaurant `subtype`.
- Restaurant subtypes are exactly `burger`, `italian`, `american`, `steak`, `grill`, `shawarma`, `saudi`, `gulf`, `indian`, `asian`, `seafood`, `breakfast`, `healthy`, and `other`.
- Canonical `name` is trimmed, internal whitespace is collapsed, maximum length is 120 characters, and normalized uniqueness is global across place types.
- Optional `description` is API-supported, not required by current UI, blank values return `description: null`, and valid descriptions are limited to 1000 characters.
- Success returns `201 Created` with `id`, `name`, `normalizedName`, `type`, `subtype`, `description`, `averageRating`, `ratingCount`, `createdAt`, and `updatedAt`.
- Guests receive `401 Unauthorized`; invalid payloads receive `422 Validation Error`; duplicates receive `409 Conflict` with `DUPLICATE_PLACE_NAME`; rate limits receive `429 Too Many Requests`.
- Created places are shared catalog records. Creator identity, private account data, owner-only edit/delete rights, private notes, private list membership, internal moderation fields, tokens, cookies, SQL, and stack traces must not be exposed.
- After successful create, the UI navigates directly to `/places/{newPlaceId}` and does not return to `/places` as the success destination.
- Create UI must remain accessible, keyboard usable, screen-reader understandable, and responsive at `320x568`, `390x844`, `430x932`, landscape `844x390`, and 200% zoom/adaptive pressure.
- Responsive UI tests must assert `document.documentElement.scrollWidth <= window.innerWidth` and controls must meet `44x44` CSS pixel touch target minimum.
- Arabic test data must remain valid UTF-8 Arabic, including `مطعم`, `برجر`, `الأماكن`, and `إضافة مكان جديد`. No mojibake, escaped Arabic code points, or replacement characters are permitted.
- Automation cadence values used in Notes: Smoke, Regression, Nightly, and Manual Review.

## PLACE-009-US-001 - Open create restaurant flow

User Story Summary: As an authenticated user, I want to add a restaurant so that it exists in the catalog.

Related Feature ID: `PLACE-009`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-009-US-001-TC-001 | Authenticated user opens add-place flow | UI, Positive, Authentication | Critical | Valid session. User is on `/places`. | Add place action. | 1. Open `/places`. 2. Activate `إضافة مكان جديد`. | Create dialog or sheet opens and focus moves inside it. | PLACE-009-US-001 | Yes | UI E2E | Smoke cadence. |
| PLACE-009-US-001-TC-002 | Restaurant selection shows required fields | UI, Positive, Integration | Critical | Create flow is open. | Select `restaurant`. | 1. Choose restaurant type. 2. Inspect form fields. | Form shows name, type, and restaurant subtype fields; subtype is visibly required. | PLACE-009-US-001 | Yes | UI E2E | Smoke cadence. |
| PLACE-009-US-001-TC-003 | Restaurant subtype options match approved taxonomy | UI, Contract, Arabic | High | Restaurant type selected. | Subtype control. | 1. Open subtype options. 2. Compare labels and values. | Options map exactly to `burger`, `italian`, `american`, `steak`, `grill`, `shawarma`, `saudi`, `gulf`, `indian`, `asian`, `seafood`, `breakfast`, `healthy`, `other`. | PLACE-009-US-001 | Yes | UI E2E | Regression cadence. |
| PLACE-009-US-001-TC-004 | Switching type resets incompatible subtype | UI, Regression, Data Integrity | High | Cafe subtype `coffee` is selected in create flow. | Switch to restaurant. | 1. Select cafe and coffee. 2. Switch type to restaurant. | Cafe subtype is cleared; restaurant subtype is empty and required. | PLACE-009-US-001 | Yes | UI E2E | Regression cadence. |
| PLACE-009-US-001-TC-005 | Cancel closes create flow without mutation | UI, UX, API | Medium | Create flow has unsaved restaurant data. | Name `مطعم مؤقت`, subtype `burger`. | 1. Enter data. 2. Activate cancel. 3. Inspect network. | Flow closes; no `POST /api/v1/places` request is sent, no `201 Created` response occurs, and no place row is created. | PLACE-009-US-001 | Yes | UI E2E | Regression cadence. |
| PLACE-009-US-001-TC-006 | Create flow shows initial loading state before form readiness | Loading State, UI, Accessibility | Medium | Valid session. Add-place assets or taxonomy load slowly. | Open add-place flow with delayed taxonomy/options. | 1. Activate `إضافة مكان جديد`. 2. Delay create-flow data. 3. Inspect UI and accessibility tree. | Loading state is visible and announced through status text or live region; no incomplete restaurant form is submitted before fields are ready. | PLACE-009-US-001 | Yes | Accessibility | Regression cadence. |
| PLACE-009-US-001-TC-007 | Closing create flow restores focus to opener | Accessibility, Keyboard, UX | High | Valid session. Create flow opened from `إضافة مكان جديد`. | Cancel button or close control. | 1. Open create flow by keyboard. 2. Activate close/cancel. 3. Inspect active element. | Focus returns to the add-place trigger or nearest stable opener control with visible focus; focus is not lost to body. | PLACE-009-US-001 | Yes | Accessibility | Regression cadence. |

## PLACE-009-US-002 - Require authenticated creation

User Story Summary: As the system, I want only authenticated users to create places so that mutations are protected.

Related Feature ID: `PLACE-009`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-009-US-002-TC-001 | Guest API create is rejected | API, Authentication, Authorization, Negative | Critical | No valid session. | Valid restaurant payload. | 1. Send `POST /api/v1/places` without credentials. 2. Inspect response. | Status `401 Unauthorized`; no place is created and response contains no private data. | PLACE-009-US-002 | Yes | API | Smoke cadence. |
| PLACE-009-US-002-TC-002 | Guest UI cannot submit protected create result | UI, Authentication, Privacy | Critical | No valid session. | Open create route or action. | 1. Clear auth. 2. Open create flow. 3. Observe first render. | UI shows auth recovery/login; no protected form result, created place, or private-data flash appears. | PLACE-009-US-002 | Yes | UI E2E | Smoke cadence. |
| PLACE-009-US-002-TC-003 | Expired session during submit returns 401 | API, Authentication, Error Handling | Critical | Form is valid but token refresh fails. | Name `مطعم الجلسة`, subtype `saudi`. | 1. Submit form. 2. Force auth failure. | `POST /api/v1/places` returns `401 Unauthorized`; no place is created; no success navigation occurs. | PLACE-009-US-002 | Yes | UI E2E | Smoke cadence. |
| PLACE-009-US-002-TC-004 | Unauthorized error excludes sensitive details | API, Security, Privacy | High | No valid session. | Payload includes `<script>alert(1)</script>`. | 1. Send unauthenticated request. 2. Inspect body. | Status `401 Unauthorized`; response excludes raw sensitive payload, tokens, cookies, SQL, and stack traces. | PLACE-009-US-002 | Yes | API | Regression cadence. |

## PLACE-009-US-003 - Require restaurant name

User Story Summary: As the system, I want restaurant name required so that records are usable.

Related Feature ID: `PLACE-009`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-009-US-003-TC-001 | Missing name returns 422 | API, Validation, Negative | Critical | Authenticated request. | Payload omits `name`. | 1. Submit `type=restaurant`, `subtype=burger`. 2. Inspect response. | Status `422 Validation Error`; no place is created. | PLACE-009-US-003 | Yes | API | Smoke cadence. |
| PLACE-009-US-003-TC-002 | Empty name returns 422 | API, Validation, Boundary | Critical | Authenticated request. | `name=""`. | 1. Submit payload. 2. Inspect response. | Status `422 Validation Error`; response identifies `name`; place count is unchanged. | PLACE-009-US-003 | Yes | API | Smoke cadence. |
| PLACE-009-US-003-TC-003 | Whitespace-only name returns 422 | API, Validation, Boundary | Critical | Authenticated request. | `name="     "`. | 1. Submit payload. 2. Inspect response. | Status `422 Validation Error`; trimmed name is empty and no place is created. | PLACE-009-US-003 | Yes | API | Smoke cadence. |
| PLACE-009-US-003-TC-004 | UI blocks blank restaurant name | UI, Validation, Accessibility | High | Create restaurant form open. | Spaces-only name, subtype `burger`. | 1. Enter spaces. 2. Attempt save. | Inline name error appears, save does not create a place, and error is associated with the name field. | PLACE-009-US-003 | Yes | UI E2E | Regression cadence. |
| PLACE-009-US-003-TC-005 | Trimmed valid name is accepted | API, Validation, Data Integrity | High | Authenticated request. | `name="   مطعم ألف   "`, subtype `burger`. | 1. Submit payload. 2. Inspect response. | Status `201 Created`; response `name` is `مطعم ألف` and `normalizedName` is non-empty. | PLACE-009-US-003 | Yes | API | Regression cadence. |
| PLACE-009-US-003-TC-006 | Null name returns 422 | API, Validation, Negative | High | Authenticated request. | `name=null`. | 1. Submit payload. 2. Inspect response. | Status `422 Validation Error`; no place is created and response contains no stack trace. | PLACE-009-US-003 | Yes | API | Regression cadence. |

## PLACE-009-US-004 - Enforce restaurant name length

User Story Summary: As the system, I want restaurant names bounded so that UI and storage remain safe.

Related Feature ID: `PLACE-009`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-009-US-004-TC-001 | Name with 120 characters is accepted | API, Boundary, Positive | High | Authenticated request. | Canonical name length exactly 120. | 1. Submit payload. 2. Inspect response. | Status `201 Created`; response name length is 120 characters and row is created once. | PLACE-009-US-004 | Yes | API | Regression cadence. |
| PLACE-009-US-004-TC-002 | Name with 121 characters is rejected | API, Boundary, Validation | Critical | Authenticated request. | Canonical name length 121. | 1. Submit payload. 2. Inspect response. | Status `422 Validation Error`; no place is created. | PLACE-009-US-004 | Yes | API | Smoke cadence. |
| PLACE-009-US-004-TC-003 | Whitespace is trimmed before length check | API, Boundary, Validation | High | Authenticated request. | 120 character name with leading and trailing spaces. | 1. Submit payload. 2. Inspect response. | Status `201 Created`; stored name is trimmed to 120 characters. | PLACE-009-US-004 | Yes | API | Regression cadence. |
| PLACE-009-US-004-TC-004 | UI shows max length error accessibly | UI, Validation, Accessibility | High | Create restaurant form open. | 121 character Arabic name. | 1. Paste long name. 2. Select subtype. 3. Submit. | Name error is announced and tied to the field; no `201 Created` success state appears. | PLACE-009-US-004 | Yes | Accessibility | Regression cadence. |
| PLACE-009-US-004-TC-005 | Long valid name stays contained on mobile | Responsive, UI, Arabic | Medium | Create form open on `390x844`. | 120 character mixed Arabic English name. | 1. Enter max name. 2. Inspect layout. | Input text remains contained; no horizontal overflow occurs and save controls remain reachable. | PLACE-009-US-004 | Yes | UI E2E | Regression cadence. |

## PLACE-009-US-005 - Canonicalize restaurant name

User Story Summary: As a user, I want accidental spacing cleaned so that duplicates are not created.

Related Feature ID: `PLACE-009`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-009-US-005-TC-001 | Multiple spaces collapse in stored name | API, Data Integrity, Positive | High | Authenticated request. | `name="  Burger   House  "`, subtype `burger`. | 1. Submit payload. 2. Inspect response. | Status `201 Created`; response `name` is `Burger House` and `normalizedName` is `burger house`. | PLACE-009-US-005 | Yes | API | Smoke cadence. |
| PLACE-009-US-005-TC-002 | Arabic spaces are trimmed | API, Arabic, Data Integrity | High | Authenticated request. | `name="  مطعم الرياض  "`, subtype `saudi`. | 1. Submit payload. 2. Inspect response. | Status `201 Created`; response `name` is `مطعم الرياض`. | PLACE-009-US-005 | Yes | API | Regression cadence. |
| PLACE-009-US-005-TC-003 | Duplicate after spacing normalization returns 409 | API, Duplicate, Data Integrity | Critical | Existing place normalized as `burger house`. | Submit `Burger   House`. | 1. Submit duplicate payload. 2. Inspect response. | Status `409 Conflict`; error code `DUPLICATE_PLACE_NAME`; no second row is created. | PLACE-009-US-005 | Yes | API | Smoke cadence. |
| PLACE-009-US-005-TC-004 | Case normalization prevents English duplicate | API, Duplicate, Data Integrity | High | Existing `Burger House`. | Submit `burger house`. | 1. Submit payload. 2. Inspect response. | Status `409 Conflict`; error code `DUPLICATE_PLACE_NAME`; existing record remains unchanged. | PLACE-009-US-005 | Yes | API | Regression cadence. |
| PLACE-009-US-005-TC-005 | Arabic diacritics normalization prevents duplicate | API, Arabic, Duplicate | High | Existing normalized place equivalent to `قهوة`. | Submit name with Arabic diacritics. | 1. Submit payload. 2. Inspect response. | Status `409 Conflict`; error code `DUPLICATE_PLACE_NAME`; no duplicate normalized row is created. | PLACE-009-US-005 | Yes | API | Regression cadence. |
| PLACE-009-US-005-TC-006 | UI displays canonicalized created name | UI, Data Integrity | Medium | Valid session. Create flow open. | Name `  Burger   House  `, subtype `burger`. | 1. Submit form. 2. Inspect detail heading after navigation. | New detail heading displays `Burger House`, not raw spaced input. | PLACE-009-US-005 | Yes | UI E2E | Regression cadence. |
| PLACE-009-US-005-TC-007 | Unicode composed and decomposed forms normalize to one name | API, Unicode, Duplicate, Data Integrity | High | Existing restaurant normalized from composed Unicode name. | Submit canonically equivalent decomposed Unicode name. | 1. Submit equivalent payload. 2. Inspect response and row count. | Status `409 Conflict`; error code `DUPLICATE_PLACE_NAME`; only the existing canonical row remains. | PLACE-009-US-005 | Yes | API | Regression cadence. |
| PLACE-009-US-005-TC-008 | Arabic tatweel does not bypass duplicate detection | API, Arabic, Duplicate, Data Integrity | High | Existing restaurant `مطعم الرياض`. | Submit `مطــــعم الرياض`, subtype `saudi`. | 1. Submit payload. 2. Inspect response. | Status `409 Conflict`; error code `DUPLICATE_PLACE_NAME`; no duplicate row is created. | PLACE-009-US-005 | Yes | API | Regression cadence. |
| PLACE-009-US-005-TC-009 | Zero-width characters do not bypass duplicate detection | API, Unicode, Security, Duplicate | High | Existing restaurant `Burger House`. | Submit `Burger\u200b House`, subtype `burger`. | 1. Submit payload. 2. Inspect response. | Status `409 Conflict`; error code `DUPLICATE_PLACE_NAME`; invisible characters do not create a second normalized row. | PLACE-009-US-005 | Yes | API | Regression cadence. |
| PLACE-009-US-005-TC-010 | Punctuation-normalized duplicate is rejected | API, Duplicate, Data Integrity | High | Existing restaurant normalized as `burger house`. | Submit `Burger-House`, subtype `burger`. | 1. Submit payload. 2. Inspect response. | Status `409 Conflict`; error code `DUPLICATE_PLACE_NAME`; punctuation normalization does not allow duplicate creation. | PLACE-009-US-005 | Yes | API | Regression cadence. |
| PLACE-009-US-005-TC-011 | Mixed Arabic English spacing normalizes predictably | API, Localization, Data Integrity | Medium | Authenticated request. Unique name. | `name="  Burger   بيت  "`, subtype `burger`. | 1. Submit payload. 2. Inspect response. | Status `201 Created`; response `name` is `Burger بيت` and `normalizedName` is non-empty and stable. | PLACE-009-US-005 | Yes | API | Regression cadence. |

## PLACE-009-US-006 - Require restaurant subtype

User Story Summary: As the system, I want restaurant subtype required so that taxonomy is usable.

Related Feature ID: `PLACE-009`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-009-US-006-TC-001 | Missing subtype returns 422 | API, Validation, Negative | Critical | Authenticated request. | `type=restaurant`, no subtype. | 1. Submit payload. 2. Inspect response. | Status `422 Validation Error`; no place is created. | PLACE-009-US-006 | Yes | API | Smoke cadence. |
| PLACE-009-US-006-TC-002 | Null subtype returns 422 | API, Validation, Negative | Critical | Authenticated request. | `subtype=null`. | 1. Submit payload. 2. Inspect response. | Status `422 Validation Error`; no place is created. | PLACE-009-US-006 | Yes | API | Regression cadence. |
| PLACE-009-US-006-TC-003 | Blank subtype returns 422 | API, Validation, Boundary | High | Authenticated request. | `subtype=""`. | 1. Submit payload. 2. Inspect response. | Status `422 Validation Error`; no place is created. | PLACE-009-US-006 | Yes | API | Regression cadence. |
| PLACE-009-US-006-TC-004 | UI blocks save until subtype selected | UI, Validation | Critical | Create restaurant form open with valid name. | Name `مطعم البرجر`, no subtype. | 1. Enter name. 2. Attempt save. | Save is disabled or submit is blocked; subtype error is shown and no success occurs. | PLACE-009-US-006 | Yes | UI E2E | Smoke cadence. |
| PLACE-009-US-006-TC-005 | Subtype remains required after type reset | UI, Data Integrity, Regression | Medium | Create flow open. | Restaurant to cafe to restaurant. | 1. Select restaurant. 2. Switch to cafe. 3. Switch back. 4. Save without subtype. | Restaurant subtype is empty and required; submit fails with validation feedback. | PLACE-009-US-006 | Yes | UI E2E | Regression cadence. |

## PLACE-009-US-007 - Accept only approved restaurant subtype

User Story Summary: As the system, I want restaurant subtype values constrained so that taxonomy stays clean.

Related Feature ID: `PLACE-009`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-009-US-007-TC-001 | All approved restaurant subtypes are accepted | API, Contract, Validation | Critical | Authenticated request. Unique name per subtype. | Subtype matrix: burger, italian, american, steak, grill, shawarma, saudi, gulf, indian, asian, seafood, breakfast, healthy, other. | 1. Submit one restaurant per subtype. 2. Inspect each response. | Every approved subtype request returns `201 Created`; response `type=restaurant` and `subtype` equals submitted value. | PLACE-009-US-007 | Yes | API | Smoke cadence. |
| PLACE-009-US-007-TC-002 | Cafe subtype is rejected for restaurant | API, Validation, Negative | Critical | Authenticated request. | `type=restaurant`, `subtype=coffee`. | 1. Submit payload. 2. Inspect response. | Status `422 Validation Error`; no place is created. | PLACE-009-US-007 | Yes | API | Smoke cadence. |
| PLACE-009-US-007-TC-003 | Unsupported subtype is rejected | API, Validation, Negative | High | Authenticated request. | `subtype=gelato`. | 1. Submit payload. 2. Inspect response. | Status `422 Validation Error`; no place is created. | PLACE-009-US-007 | Yes | API | Regression cadence. |
| PLACE-009-US-007-TC-004 | Removed subtype is rejected | API, Validation, Regression | High | Authenticated request. | `subtype=bbq_old`. | 1. Submit payload. 2. Inspect response. | Status `422 Validation Error`; no place is created. | PLACE-009-US-007 | Yes | API | Regression cadence. |
| PLACE-009-US-007-TC-005 | Subtype casing is rejected | API, Validation, Boundary | Medium | Authenticated request. | `subtype=Burger`. | 1. Submit payload. 2. Inspect response. | Status `422 Validation Error`; unsupported casing is rejected. | PLACE-009-US-007 | Yes | API | Regression cadence. |
| PLACE-009-US-007-TC-006 | Subtype injection attempt is rejected | API, Security, Validation | High | Authenticated request. | `subtype="burger;DROP TABLE places"`. | 1. Submit payload. 2. Inspect response. | Status `422 Validation Error`; response contains no SQL, stack trace, or parser details. | PLACE-009-US-007 | Yes | API | Regression cadence. |
| PLACE-009-US-007-TC-007 | UI label maps to API subtype value | UI, Integration, Arabic | High | Create restaurant form open. | Choose Arabic label `برجر`. | 1. Select `برجر`. 2. Submit valid form. 3. Inspect request body. | Request sends `subtype=burger`; API returns `201 Created`. | PLACE-009-US-007 | Yes | UI E2E | Regression cadence. |

## PLACE-009-US-008 - Reject duplicate restaurant name

User Story Summary: As the system, I want duplicate normalized names rejected so that the catalog has one global place record per name.

Related Feature ID: `PLACE-009`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-009-US-008-TC-001 | Exact duplicate returns 409 | API, Duplicate, Data Integrity | Critical | Existing place normalized as `malfa`. | Submit restaurant `Malfa`. | 1. Submit duplicate payload. 2. Inspect response. | Status `409 Conflict`; error code `DUPLICATE_PLACE_NAME`; no second row is created. | PLACE-009-US-008 | Yes | API | Smoke cadence. |
| PLACE-009-US-008-TC-002 | Duplicate after trimming returns 409 | API, Duplicate, Boundary | Critical | Existing `Burger House`. | Submit `  Burger House  `. | 1. Submit payload. 2. Inspect response. | Status `409 Conflict`; error code `DUPLICATE_PLACE_NAME`; existing place remains unchanged. | PLACE-009-US-008 | Yes | API | Smoke cadence. |
| PLACE-009-US-008-TC-003 | Duplicate across place types is rejected globally | API, Duplicate, Data Integrity | High | Existing cafe named `Malfa`. | Submit restaurant `Malfa`. | 1. Submit payload. 2. Inspect response. | Status `409 Conflict`; error code `DUPLICATE_PLACE_NAME`; no restaurant duplicate is created. | PLACE-009-US-008 | Yes | API | Regression cadence. |
| PLACE-009-US-008-TC-004 | Concurrent duplicate creation creates one row only | API, Concurrency, Data Integrity | Critical | Two authenticated users submit same normalized name concurrently. | Two `POST /api/v1/places` requests for `مطعم متزامن`. | 1. Send requests concurrently. 2. Inspect statuses and database rows. | Exactly one request returns `201 Created`; competing request returns `409 Conflict`; only one row exists. | PLACE-009-US-008 | Yes | API | Smoke cadence. |
| PLACE-009-US-008-TC-005 | UI duplicate error preserves editable input | UI, Duplicate, UX | High | Create form open. Existing duplicate name. | Name `Malfa`, subtype `burger`. | 1. Submit duplicate. 2. Inspect form. | Duplicate message appears; name and subtype remain editable; no success navigation occurs. | PLACE-009-US-008 | Yes | UI E2E | Regression cadence. |
| PLACE-009-US-008-TC-006 | Duplicate response excludes internals | API, Security, Privacy | High | Existing duplicate. | Duplicate payload. | 1. Submit payload. 2. Inspect response body. | Status `409 Conflict`; response includes `DUPLICATE_PLACE_NAME` and excludes SQL, constraint names, stack traces, tokens, and cookies. | PLACE-009-US-008 | Yes | API | Smoke cadence. |

## PLACE-009-US-009 - Save valid restaurant

User Story Summary: As a user, I want to save a valid restaurant so that it appears in the catalog.

Related Feature ID: `PLACE-009`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-009-US-009-TC-001 | Valid restaurant create returns 201 schema | API, Positive, Contract | Critical | Authenticated request. Unique name. | `name=مطعم ألف`, `type=restaurant`, `subtype=burger`. | 1. Send `POST /api/v1/places`. 2. Inspect response. | Status `201 Created`; response includes `id`, `name`, `normalizedName`, `type`, `subtype`, `description`, `averageRating`, `ratingCount`, `createdAt`, `updatedAt`. | PLACE-009-US-009 | Yes | API | Smoke cadence. |
| PLACE-009-US-009-TC-002 | New restaurant starts unrated | API, Data Integrity, Contract | High | Authenticated request. Unique valid restaurant. | Subtype `grill`. | 1. Create restaurant. 2. Inspect response. | Status `201 Created`; `averageRating=null` and `ratingCount=0`. | PLACE-009-US-009 | Yes | API | Smoke cadence. |
| PLACE-009-US-009-TC-003 | Arabic restaurant is saved | API, Arabic, Positive | High | Authenticated request. | `مطعم الرياض`, subtype `saudi`. | 1. Submit payload. 2. Inspect response. | Status `201 Created`; response `name=مطعم الرياض`, `type=restaurant`, `subtype=saudi`. | PLACE-009-US-009 | Yes | API | Regression cadence. |
| PLACE-009-US-009-TC-004 | Mixed-language restaurant is saved | API, Localization, RTL | Medium | Authenticated request. | `Burger بيت`, subtype `burger`. | 1. Submit payload. 2. Inspect response. | Status `201 Created`; mixed-language name is preserved safely in response. | PLACE-009-US-009 | Yes | API | Regression cadence. |
| PLACE-009-US-009-TC-005 | Success response excludes forbidden fields | API, Security, Privacy | Critical | Authenticated request. | Valid payload. | 1. Submit payload. 2. Recursively inspect response. | Status `201 Created`; response excludes creator identity, owner permissions, private notes, private list membership, moderation fields, tokens, cookies, SQL, and stack traces. | PLACE-009-US-009 | Yes | API | Smoke cadence. |
| PLACE-009-US-009-TC-006 | Created restaurant appears once in Places list | UI, Integration, Regression | High | Valid restaurant created. | New place ID from `201 Created`. | 1. Create restaurant. 2. Search by name in Places. | Created restaurant appears once with type restaurant and correct subtype label. | PLACE-009-US-009 | Yes | UI E2E | Regression cadence. |
| PLACE-009-US-009-TC-007 | Submit button prevents double submit | UI, Concurrency, Data Integrity | High | Create form has valid data. API response delayed. | Name `مطعم منع التكرار`. | 1. Click save twice rapidly. 2. Inspect requests and result. | Only one active create request is sent, or duplicate request receives safe `409 Conflict`; no duplicate row is created. | PLACE-009-US-009 | Yes | UI E2E | Smoke cadence. |
| PLACE-009-US-009-TC-008 | Submit loading disables repeated save action | Loading State, UI, Concurrency | Critical | Create form contains valid restaurant data and API response is delayed. | Name `مطعم التحميل`, subtype `burger`. | 1. Submit form. 2. Inspect save button while request is in flight. | Save button is disabled or guarded, loading state is visible, and no second active `POST /api/v1/places` request is sent. | PLACE-009-US-009 | Yes | UI E2E | Smoke cadence. |
| PLACE-009-US-009-TC-009 | Slow successful create shows loading then navigates | Loading State, Performance, UI | High | Valid restaurant form. API response delayed by 2 seconds. | Name `مطعم بطيء`, subtype `grill`. | 1. Submit form. 2. Delay response. 3. Return `201 Created`. | Loading feedback appears within 300 ms; after `201 Created`, loading ends and app navigates to `/places/{newPlaceId}`. | PLACE-009-US-009 | Yes | UI E2E | Regression cadence. |
| PLACE-009-US-009-TC-010 | Successful create announces completion accessibly | Accessibility, Screen Reader, UI | High | Valid restaurant form. Screen-reader status capture available. | Name `مطعم النجاح`, subtype `saudi`. | 1. Submit form. 2. Return `201 Created`. 3. Inspect status announcement and focus. | Success/navigation is announced through page title, heading, or live region; focus lands on the new detail page heading or main region. | PLACE-009-US-009 | Yes | Accessibility | Regression cadence. |

## PLACE-009-US-010 - Navigate to restaurant detail after create

User Story Summary: As a user, I want to land on the new place immediately so that I can add it to lists or rate it.

Related Feature ID: `PLACE-009`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-009-US-010-TC-001 | Successful create navigates to new detail | UI, Routing, Positive | Critical | Valid session. Create form open with unique restaurant. | Name `مطعم التفاصيل`, subtype `burger`. | 1. Submit form. 2. Capture `201 Created` ID. 3. Inspect URL. | Create flow closes and URL becomes `/places/{newPlaceId}`; detail heading shows created name. | PLACE-009-US-010 | Yes | UI E2E | Smoke cadence. |
| PLACE-009-US-010-TC-002 | App does not return to Places list after create | UI, Routing, Regression | Critical | Valid session. Create succeeds. | Valid payload. | 1. Submit create form. 2. Inspect final route. | Final route is `/places/{newPlaceId}`, not `/places`; list page is not the success destination. | PLACE-009-US-010 | Yes | UI E2E | Smoke cadence. |
| PLACE-009-US-010-TC-003 | New detail context is refreshed after create | UI, Integration, Data Integrity | High | Create succeeds. | New place ID. | 1. Submit form. 2. Inspect detail API request. | App requests `GET /api/v1/places/{newPlaceId}` and renders data matching the create response. | PLACE-009-US-010 | Yes | UI E2E | Regression cadence. |
| PLACE-009-US-010-TC-004 | No navigation occurs on failed create | UI, Error Handling, Routing | High | Create form valid. API returns `500`. | Valid payload with forced failure. | 1. Submit form. 2. Force `500`. 3. Inspect route. | No navigation occurs; form remains open with retry state and entered data preserved. | PLACE-009-US-010 | Yes | UI E2E | Regression cadence. |
| PLACE-009-US-010-TC-005 | Created detail URL is bookmarkable | UI, Routing, Regression | Medium | Create succeeds and detail route is visible. | New detail URL. | 1. Copy final URL. 2. Open it in a new authenticated tab. | Copied URL opens the created restaurant detail with `200 OK`. | PLACE-009-US-010 | Yes | UI E2E | Regression cadence. |

## PLACE-009-US-011 - Treat created restaurant as shared catalog record

User Story Summary: As Product, I want created restaurants to become shared catalog entries so that no user receives private ownership rights over public catalog data.

Related Feature ID: `PLACE-009`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-009-US-011-TC-001 | Creator does not receive edit controls | UI, Authorization, Product Rule | Critical | Authenticated creator created restaurant. | New detail page. | 1. Inspect detail page as creator. | No edit or delete place controls appear because places are shared catalog records. | PLACE-009-US-011 | Yes | UI E2E | Smoke cadence. |
| PLACE-009-US-011-TC-002 | Create response does not expose creator identity | API, Privacy, Security | Critical | Authenticated create request. | Valid payload. | 1. Submit create. 2. Inspect response. | Status `201 Created`; response has no creator email, internal user ID, owner role, or private account data. | PLACE-009-US-011 | Yes | API | Smoke cadence. |
| PLACE-009-US-011-TC-003 | Another user can view shared catalog place | API, Authorization, Product Rule | High | User A creates restaurant. User B is authenticated. | `GET /api/v1/places/{newPlaceId}` as User B. | 1. Request detail as User B. 2. Inspect response. | Status `200 OK`; public place fields are visible and private creator data is absent. | PLACE-009-US-011 | Yes | API | Regression cadence. |
| PLACE-009-US-011-TC-004 | Creator cannot delete place through unsupported endpoint | API, Authorization, Security | High | Creator is authenticated. | Attempt `DELETE /api/v1/places/{id}` if route exists. | 1. Send delete request. 2. Inspect response and place existence. | Status `404 Not Found` or `405 Method Not Allowed`; place remains available and no destructive action succeeds. | PLACE-009-US-011 | Yes | API | Regression cadence. |
| PLACE-009-US-011-TC-005 | Correction path is moderation not owner edit | UI, Product Rule | Medium | Creator views created place. | Detail page. | 1. Inspect available actions. | UI does not imply private ownership; any correction path references moderation/admin workflow if surfaced. | PLACE-009-US-011 | No | Manual | Manual Review cadence. |

## PLACE-009-US-012 - Show validation errors accessibly

User Story Summary: As a user, I want form errors announced and tied to fields so that I can fix them.

Related Feature ID: `PLACE-009`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-009-US-012-TC-001 | Name validation error is field-associated | Accessibility, Validation, UI | High | Create restaurant form open. | Blank name, subtype `burger`. | 1. Submit form. 2. Inspect name field attributes. | Name field has accessible error association and invalid state; error identifies required name. | PLACE-009-US-012 | Yes | Accessibility | Smoke cadence. |
| PLACE-009-US-012-TC-002 | Subtype validation error is field-associated | Accessibility, Validation, UI | High | Create restaurant form open. | Valid name, missing subtype. | 1. Submit form. 2. Inspect subtype control. | Subtype control has accessible error association and invalid state; error identifies required subtype. | PLACE-009-US-012 | Yes | Accessibility | Smoke cadence. |
| PLACE-009-US-012-TC-003 | Validation errors are announced | Accessibility, Screen Reader, Error Handling | High | Create form open. | Invalid name and subtype. | 1. Submit invalid form. 2. Inspect live region or announcement. | Error summary or field errors are announced without moving focus outside the dialog or sheet. | PLACE-009-US-012 | Yes | Accessibility | Regression cadence. |
| PLACE-009-US-012-TC-004 | Focus remains inside dialog after validation failure | Accessibility, Keyboard, UI | High | Create form open. | Invalid form. | 1. Submit invalid form. 2. Press Tab repeatedly. | Focus remains trapped inside create dialog/sheet and reaches invalid fields and close/cancel controls. | PLACE-009-US-012 | Yes | Accessibility | Regression cadence. |
| PLACE-009-US-012-TC-005 | Focus moves to first invalid field | Accessibility, UX, Validation | Medium | Create form open with multiple invalid fields. | Blank name and missing subtype. | 1. Submit form. 2. Inspect active element. | Focus moves to name field or error summary with path to first invalid field. | PLACE-009-US-012 | Yes | Accessibility | Regression cadence. |
| PLACE-009-US-012-TC-006 | Errors remain visible at 200 percent zoom | Accessibility, Responsive, Validation | Medium | Create form open at 200 percent zoom. | Invalid fields. | 1. Submit invalid form. 2. Inspect layout. | Error messages are readable, not clipped, and no horizontal overflow occurs. | PLACE-009-US-012 | Yes | UI E2E | Regression cadence. |
| PLACE-009-US-012-TC-007 | Keyboard-only user can complete valid restaurant form | Accessibility, Keyboard, UI | Critical | Valid session. Create flow closed. | Name `مطعم لوحة المفاتيح`, subtype `burger`. | 1. Open create flow using keyboard. 2. Complete name, type, and subtype without pointer. 3. Submit with keyboard. | `POST /api/v1/places` returns `201 Created`; app navigates to new detail and keyboard focus remains visible. | PLACE-009-US-012 | Yes | Accessibility | Smoke cadence. |
| PLACE-009-US-012-TC-008 | Create dialog exposes modal semantics | Accessibility, UI, Contract | High | Create flow is open. | Dialog or sheet container. | 1. Inspect accessibility tree. 2. Inspect focus behavior. | Container exposes dialog/sheet semantics with accessible name, modal behavior, initial focus, focus trap, and close control. | PLACE-009-US-012 | Yes | Accessibility | Regression cadence. |
| PLACE-009-US-012-TC-009 | Form fields have accessible labels | Accessibility, UI, Contract | High | Restaurant create form is open. | Name, type, subtype controls. | 1. Inspect accessible names and label associations. | Name, type, and subtype controls each have programmatic labels matching their visible purpose and no unlabeled required field exists. | PLACE-009-US-012 | Yes | Accessibility | Regression cadence. |
| PLACE-009-US-012-TC-010 | Submit loading state is announced accessibly | Accessibility, Loading State, Screen Reader | High | Valid restaurant form. API response delayed. | Name `مطعم إعلان التحميل`, subtype `burger`. | 1. Submit form. 2. Inspect live region/status while request is in flight. | Loading/submitting state is announced once, controls remain understandable, and no validation error is announced during valid submit. | PLACE-009-US-012 | Yes | Accessibility | Regression cadence. |
| PLACE-009-US-012-TC-011 | Focus indicator remains visible in forced colors | Accessibility, Keyboard, UI | Medium | Forced-colors mode enabled. Create form open. | Keyboard tab sequence. | 1. Tab through fields and actions. 2. Inspect focus indicator. | Every focused field/action has visible system-color focus indication and readable text. | PLACE-009-US-012 | Yes | Accessibility | Nightly cadence. |
| PLACE-009-US-012-TC-012 | Reduced motion preserves validation and loading feedback | Accessibility, Reduced Motion, UI | Medium | `prefers-reduced-motion: reduce` enabled. | Invalid submit then valid submit. | 1. Submit invalid form. 2. Correct fields. 3. Submit valid form. | Error and loading feedback remain perceivable without animation; no critical information depends on motion. | PLACE-009-US-012 | Yes | Accessibility | Nightly cadence. |

## PLACE-009-US-013 - Keep mobile create flow usable

User Story Summary: As a mobile user, I want the create flow to fit on small screens.

Related Feature ID: `PLACE-009`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-009-US-013-TC-001 | Create form fits 320px viewport | Responsive, Mobile, UI | High | Valid session. Viewport `320x568`. | Open restaurant create form. | 1. Set viewport. 2. Open form. 3. Inspect layout. | Fields and close/cancel/save controls are reachable; `scrollWidth <= innerWidth`; touch targets are at least `44x44`. | PLACE-009-US-013 | Yes | UI E2E | Smoke cadence. |
| PLACE-009-US-013-TC-002 | Create form fits 390px viewport | Responsive, Mobile, UI | Medium | Valid session. Viewport `390x844`. | Open form. | 1. Set viewport. 2. Open form. | No horizontal overflow; controls remain reachable above bottom navigation and safe area. | PLACE-009-US-013 | Yes | UI E2E | Regression cadence. |
| PLACE-009-US-013-TC-003 | Create form fits 430px viewport | Responsive, Mobile, UI | Medium | Valid session. Viewport `430x932`. | Open form. | 1. Set viewport. 2. Open form. | No horizontal overflow; save and cancel controls remain visible or reachable by vertical scrolling. | PLACE-009-US-013 | Yes | UI E2E | Regression cadence. |
| PLACE-009-US-013-TC-004 | Software keyboard does not hide save controls | Mobile, UX, Responsive | High | Mobile viewport. Name input focused. | Software keyboard pressure simulated. | 1. Focus name field. 2. Simulate keyboard viewport reduction. | Focused field remains visible and save/cancel controls can be reached without horizontal scroll. | PLACE-009-US-013 | Yes | UI E2E | Regression cadence. |
| PLACE-009-US-013-TC-005 | Landscape mobile create flow remains usable | Responsive, Mobile, Landscape | Medium | Viewport `844x390`. | Open form. | 1. Set landscape viewport. 2. Open restaurant form. | Form supports vertical scrolling; close, cancel, subtype, and save controls remain reachable and are not hidden behind browser UI or safe area. | PLACE-009-US-013 | Yes | UI E2E | Regression cadence. |
| PLACE-009-US-013-TC-006 | Subtype sheet is keyboard and touch usable on mobile | Accessibility, Mobile, UI | High | Mobile viewport. Restaurant form open. | Subtype control. | 1. Open subtype control. 2. Navigate options. 3. Select `برجر`. | Subtype options are reachable, focus remains contained, selected value is announced, and touch targets are at least `44x44`. | PLACE-009-US-013 | Yes | Accessibility | Regression cadence. |
| PLACE-009-US-013-TC-007 | Full create flow works at 200 percent zoom | Responsive, Accessibility, UI | High | Valid session. Browser zoom is set to 200 percent. | Name `مطعم التكبير`, subtype `burger`. | 1. Open create flow. 2. Complete form. 3. Submit. | No horizontal overflow occurs; all fields/actions are reachable; request returns `201 Created` and navigates to detail. | PLACE-009-US-013 | Yes | UI E2E | Smoke cadence. |
| PLACE-009-US-013-TC-008 | Safe-area padding protects final actions | Responsive, Mobile, Safe Area | Medium | iOS-style safe-area viewport. Create form open. | Bottom action bar or final save/cancel controls. | 1. Emulate notch/safe-area viewport. 2. Scroll to final actions. | Save and cancel controls are not obscured by bottom navigation, browser chrome, or safe-area inset and remain at least `44x44`. | PLACE-009-US-013 | Yes | UI E2E | Regression cadence. |
| PLACE-009-US-013-TC-009 | Mobile validation errors do not cause horizontal overflow | Responsive, Mobile, Validation | Medium | Viewport `320x568`. Invalid form. | Long Arabic validation message. | 1. Submit invalid form. 2. Measure layout. | Error text wraps within viewport; `document.documentElement.scrollWidth <= window.innerWidth`; invalid fields remain reachable. | PLACE-009-US-013 | Yes | UI E2E | Regression cadence. |

## PLACE-009-US-014 - Recover from create failure

User Story Summary: As a user, I want to retry after a server or network failure without losing input.

Related Feature ID: `PLACE-009`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-009-US-014-TC-001 | Server 500 preserves form input | UI, Error Handling, Recovery | High | Create form has valid data. | Force `POST /api/v1/places` to return `500`. | 1. Submit form. 2. Inspect form after error. | Error appears; name, type, subtype, and description remain unchanged; no place is created. | PLACE-009-US-014 | Yes | UI E2E | Smoke cadence. |
| PLACE-009-US-014-TC-002 | Network failure preserves form input | UI, Error Handling, Recovery | High | Create form has valid data. | Network offline during submit. | 1. Submit form while offline. 2. Inspect UI. | Network error appears with retry path; entered fields remain in the form. | PLACE-009-US-014 | Yes | UI E2E | Regression cadence. |
| PLACE-009-US-014-TC-003 | Retry after 500 succeeds | UI, API, Recovery | High | Create form shows server error. | Same valid payload. | 1. Activate retry. 2. Return `201 Created`. | Retry sends `POST /api/v1/places`; status `201 Created`; app navigates to new detail. | PLACE-009-US-014 | Yes | UI E2E | Regression cadence. |
| PLACE-009-US-014-TC-004 | Cancelled request does not create stale success state | Concurrency, Error Handling, UI | Medium | Submit request is in flight. | Delayed create request. | 1. Submit form. 2. Cancel or navigate away. 3. Complete response. | No stale success toast or wrong navigation occurs after cancellation. | PLACE-009-US-014 | Yes | UI E2E | Regression cadence. |
| PLACE-009-US-014-TC-005 | Failure response hides sensitive details | API, Security, Privacy | High | Authenticated request. Backend returns `500`. | Valid payload. | 1. Submit request. 2. Inspect error body and UI. | Status `500`; error payload and UI exclude SQL, stack traces, tokens, cookies, private notes, and internal hostnames. | PLACE-009-US-014 | Yes | API | Smoke cadence. |
| PLACE-009-US-014-TC-006 | Retry loading state prevents duplicate retry | Loading State, UI, Recovery | High | Server error is visible and retry is available. | Retry request delayed. | 1. Activate retry twice rapidly. 2. Inspect network. | Retry control enters loading state; only one active retry request is sent; form input remains preserved. | PLACE-009-US-014 | Yes | UI E2E | Regression cadence. |
| PLACE-009-US-014-TC-007 | Browser refresh during submit does not create duplicate | Concurrency, Browser, Data Integrity | High | Submit request is in flight and browser refreshes. | Delayed valid create request. | 1. Submit form. 2. Refresh browser before response. 3. Inspect catalog by name. | At most one restaurant row is created; UI does not replay the same create request automatically after refresh. | PLACE-009-US-014 | Yes | UI E2E | Regression cadence. |
| PLACE-009-US-014-TC-008 | Out-of-order retry response does not navigate to stale result | Concurrency, Error Handling, UI | High | First create request is delayed; retry is triggered after visible failure. | Request A delayed, request B returns `201 Created`. | 1. Submit form. 2. Show retry after failure. 3. Retry and return `201 Created`. 4. Complete stale request A. | Final route points to the retry-created place; stale response does not overwrite current route or show duplicate success. | PLACE-009-US-014 | Yes | UI E2E | Regression cadence. |

## PLACE-009-US-015 - Rate-limit restaurant creation

User Story Summary: As the system, I want abusive creation attempts limited so that catalog quality is protected.

Related Feature ID: `PLACE-009`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-009-US-015-TC-001 | Create rate limit returns 429 | API, Rate Limit, Security | Critical | Authenticated user exceeds configured create-place limit. | Additional valid restaurant payload. | 1. Submit after threshold. 2. Inspect response. | Status `429 Too Many Requests`; no place is created and retry guidance is safe. | PLACE-009-US-015 | Yes | API | Smoke cadence. |
| PLACE-009-US-015-TC-002 | Rate-limit response excludes internals | API, Security, Privacy | High | Rate limit exceeded. | Valid payload. | 1. Submit request. 2. Inspect body and headers. | Status `429 Too Many Requests`; response exposes no Redis keys, internal counters, tokens, cookies, SQL, or stack traces. | PLACE-009-US-015 | Yes | API | Regression cadence. |
| PLACE-009-US-015-TC-003 | UI shows safe rate-limit message | UI, Error Handling, UX | High | Rate limit exceeded on submit. | Valid form. | 1. Submit form. 2. Inspect UI. | UI shows safe retry message; form input remains editable and no success navigation occurs. | PLACE-009-US-015 | Yes | UI E2E | Regression cadence. |
| PLACE-009-US-015-TC-004 | Rate limit does not create partial record | API, Data Integrity, Rate Limit | Critical | Rate limit exceeded. | Unique name. | 1. Submit request. 2. Query catalog by name. | Status `429 Too Many Requests`; subsequent search returns no created row for blocked payload. | PLACE-009-US-015 | Yes | API | Smoke cadence. |
| PLACE-009-US-015-TC-005 | Rate-limit recovery after window expiry | API, Rate Limit, Recovery | Medium | Rate limit exceeded, then configured window expires. | New unique restaurant payload. | 1. Wait until allowed window. 2. Submit valid payload. | Request returns `201 Created` after limit window expiry if payload is otherwise valid. | PLACE-009-US-015 | Yes | API | Nightly cadence. |

## PLACE-009-US-016 - Suppress repeated duplicate submissions

User Story Summary: As the system, I want repeated duplicate submissions handled safely so that spam does not create noise or load.

Related Feature ID: `PLACE-009`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-009-US-016-TC-001 | Repeated duplicate submissions always return 409 | API, Duplicate, Abuse Prevention | High | Existing duplicate name. | Submit same duplicate five times. | 1. Send repeated duplicate requests. 2. Inspect statuses. | Each request returns `409 Conflict` with `DUPLICATE_PLACE_NAME`; no additional rows are created. | PLACE-009-US-016 | Yes | API | Smoke cadence. |
| PLACE-009-US-016-TC-002 | Repeated duplicate attempts do not leak monitoring data | API, Security, Observability | Medium | Abuse monitoring enabled. Existing duplicate. | Repeated duplicate payload. | 1. Submit repeated duplicates. 2. Inspect responses. | Responses remain `409 Conflict`; payload exposes no internal monitoring identifiers or private data. | PLACE-009-US-016 | Yes | API | Regression cadence. |
| PLACE-009-US-016-TC-003 | UI suppresses duplicate double-click spam | UI, Duplicate, Concurrency | High | Duplicate name entered. | Double click save. | 1. Double click save. 2. Inspect network and UI. | UI sends at most one active request at a time or handles both as safe `409 Conflict`; no duplicate appears. | PLACE-009-US-016 | Yes | UI E2E | Regression cadence. |
| PLACE-009-US-016-TC-004 | Duplicate retry keeps recovery editable | UI, UX, Duplicate | Medium | Duplicate error visible after repeated attempts. | Existing duplicate name. | 1. Repeat duplicate submit. 2. Edit name. | Form remains editable; user can change name and submit a unique value. | PLACE-009-US-016 | Yes | UI E2E | Regression cadence. |
| PLACE-009-US-016-TC-005 | Duplicate spam does not degrade API latency | Performance, API, Abuse Prevention | Medium | Safe test environment allows repeated duplicates. | 50 duplicate requests. | 1. Send controlled duplicate requests. 2. Measure responses. | Every response is `409 Conflict` or documented `429 Too Many Requests`; service remains within configured threshold. | PLACE-009-US-016 | Yes | Performance | Nightly cadence. |

## PLACE-009-US-017 - Route suspicious restaurant entries to moderation path

User Story Summary: As Product, I want low-quality or abusive catalog entries reviewable so that the shared catalog remains trustworthy.

Related Feature ID: `PLACE-009`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-009-US-017-TC-001 | Spammy restaurant name is blocked | API, Moderation, Security | High | Authenticated request. Moderation rules enabled. | Name `aaaaa spam spam spam`. | 1. Submit payload. 2. Inspect response. | Status `422 Validation Error`; request does not create catalog data and response exposes no moderation internals. | PLACE-009-US-017 | Yes | API | Regression cadence. |
| PLACE-009-US-017-TC-002 | Offensive name is blocked | API, Moderation, Trust Safety | High | Authenticated request. Offensive fixture configured. | Offensive restaurant name fixture. | 1. Submit payload. 2. Inspect response and catalog. | Status `422 Validation Error`; place does not appear as normal public catalog data. | PLACE-009-US-017 | Yes | API | Regression cadence. |
| PLACE-009-US-017-TC-003 | Suspicious HTML name is rejected | API, Security, Validation | High | Authenticated request. | `<script>alert(1)</script>`, subtype `burger`. | 1. Submit payload. 2. Inspect response. | Status `422 Validation Error`; script is never executed or reflected unsafely. | PLACE-009-US-017 | Yes | API | Smoke cadence. |
| PLACE-009-US-017-TC-004 | Moderation response preserves recovery | UI, Moderation, UX | Medium | Create form open with suspicious name. | Suspicious payload. | 1. Submit form. 2. Inspect UI. | UI explains safe next step, preserves editable input, and does not navigate to misleading detail. | PLACE-009-US-017 | Yes | UI E2E | Regression cadence. |
| PLACE-009-US-017-TC-005 | Moderation path hides admin-only fields | API, Privacy, Security | High | Suspicious request triggers moderation. | Flagged payload. | 1. Submit request. 2. Inspect body. | Status `422 Validation Error`; response exposes no moderation rule IDs, reviewer data, internal scores, SQL, stack traces, tokens, or cookies. | PLACE-009-US-017 | Yes | API | Regression cadence. |

## PLACE-009-US-018 - Preserve optional description contract

User Story Summary: As an API consumer, I want restaurant description behavior explicit even though the UI does not require it.

Related Feature ID: `PLACE-009`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-009-US-018-TC-001 | Omitted description returns null | API, Contract, Positive | High | Authenticated request. | Valid payload without `description`. | 1. Submit request. 2. Inspect response. | Status `201 Created`; response contains `description: null`. | PLACE-009-US-018 | Yes | API | Smoke cadence. |
| PLACE-009-US-018-TC-002 | Blank description returns null | API, Validation, Boundary | High | Authenticated request. | `description="   "`. | 1. Submit payload. 2. Inspect response. | Status `201 Created`; blank description is trimmed and returned as `null`. | PLACE-009-US-018 | Yes | API | Regression cadence. |
| PLACE-009-US-018-TC-003 | Description up to 1000 characters is accepted | API, Boundary, Positive | Medium | Authenticated request. | Description length exactly 1000. | 1. Submit payload. 2. Inspect response. | Status `201 Created`; description is stored and returned without truncation. | PLACE-009-US-018 | Yes | API | Regression cadence. |
| PLACE-009-US-018-TC-004 | Description over 1000 characters is rejected | API, Boundary, Validation | High | Authenticated request. | Description length 1001. | 1. Submit payload. 2. Inspect response. | Status `422 Validation Error`; no place is created. | PLACE-009-US-018 | Yes | API | Regression cadence. |
| PLACE-009-US-018-TC-005 | Current UI does not require description | UI, UX, Contract | Medium | Create restaurant form open. | Name and subtype valid, no description. | 1. Submit without description. 2. Inspect result. | Create succeeds with `201 Created`; UI does not block for missing description. | PLACE-009-US-018 | Yes | UI E2E | Regression cadence. |
| PLACE-009-US-018-TC-006 | Description HTML is rejected | Security, API, Privacy, Validation | High | Authenticated request. | Description `<img src=x onerror=alert(1)>`. | 1. Submit payload. 2. Inspect response. | Status `422 Validation Error`; no place is created, no script executes, and no sensitive error details appear. | PLACE-009-US-018 | Yes | API | Regression cadence. |

## PLACE-009-US-019 - Reject invalid restaurant create payload shape

User Story Summary: As the system, I want malformed create payloads rejected safely so that data integrity is preserved.

Related Feature ID: `PLACE-009`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-009-US-019-TC-001 | Invalid name type returns 422 | API, Validation, Negative | High | Authenticated request. | `name=123`. | 1. Submit payload. 2. Inspect response. | Status `422 Validation Error`; no place is created. | PLACE-009-US-019 | Yes | API | Smoke cadence. |
| PLACE-009-US-019-TC-002 | Invalid type value returns 422 | API, Validation, Negative | Critical | Authenticated request. | `type=restaurant_old`, subtype `burger`. | 1. Submit payload. 2. Inspect response. | Status `422 Validation Error`; no place is created. | PLACE-009-US-019 | Yes | API | Smoke cadence. |
| PLACE-009-US-019-TC-003 | Missing type returns 422 | API, Validation, Negative | High | Authenticated request. | No `type`, subtype `burger`. | 1. Submit payload. 2. Inspect response. | Status `422 Validation Error`; no place is created. | PLACE-009-US-019 | Yes | API | Regression cadence. |
| PLACE-009-US-019-TC-004 | Invalid description type returns 422 | API, Validation, Negative | High | Authenticated request. | `description={}`. | 1. Submit payload. 2. Inspect response. | Status `422 Validation Error`; no place is created. | PLACE-009-US-019 | Yes | API | Regression cadence. |
| PLACE-009-US-019-TC-005 | Array payload is rejected safely | API, Security, Validation | High | Authenticated request. | Body is JSON array instead of object. | 1. Send request. 2. Inspect response. | Status `422 Validation Error`; response contains no stack trace, SQL, tokens, or cookies. | PLACE-009-US-019 | Yes | API | Regression cadence. |
| PLACE-009-US-019-TC-006 | SQL-like name is rejected safely | API, Security, Validation | High | Authenticated request. | Name `Robert DROP TABLE places`, subtype `burger`. | 1. Submit payload. 2. Inspect response and database availability. | Status `422 Validation Error`; database remains intact, no place is created, and no SQL appears in response. | PLACE-009-US-019 | Yes | API | Smoke cadence. |
| PLACE-009-US-019-TC-007 | XSS-like name is not executed in UI | Security, UI, Regression | Critical | Valid session. Payload is accepted or rejected safely. | Name `<script>alert(1)</script>`, subtype `burger`. | 1. Submit through UI or API fixture. 2. Render any resulting error or detail. | No script executes; UI escapes user input; no sensitive error details appear. | PLACE-009-US-019 | Yes | UI E2E | Smoke cadence. |
| PLACE-009-US-019-TC-008 | Unsupported extra fields are rejected safely | API, Security, Contract | Medium | Authenticated request. | Payload includes `creatorId`, `averageRating`, `ratingCount`, `isAdminApproved`. | 1. Submit payload. 2. Inspect response and created row. | Status `422 Validation Error`; no place is created and client-supplied protected fields are not trusted. | PLACE-009-US-019 | Yes | API | Regression cadence. |
| PLACE-009-US-019-TC-009 | Malformed JSON returns safe validation response | API, Error Handling, Security | High | Authenticated request. | Invalid JSON body. | 1. Send malformed JSON. 2. Inspect response. | Status `422 Validation Error`; no place is created and response excludes stack traces and parser internals. | PLACE-009-US-019 | Yes | API | Regression cadence. |
| PLACE-009-US-019-TC-010 | Emoji restaurant name is rejected by catalog-quality validation | API, Validation, Emoji | Medium | Authenticated request. | Name `مطعم 🍔`, subtype `burger`. | 1. Submit payload. 2. Inspect response. | Status `422 Validation Error`; no place is created and response contains no stack trace or unsafe echo. | PLACE-009-US-019 | Yes | API | Regression cadence. |
| PLACE-009-US-019-TC-011 | Validation error payload excludes sensitive internals | API, Security, Privacy | High | Authenticated request. Invalid payload triggers `422`. | Invalid `type`, invalid `subtype`, and invalid `description`. | 1. Submit payload. 2. Recursively inspect response. | Status `422 Validation Error`; response excludes SQL, stack traces, tokens, cookies, private notes, creator identity, and internal validation class names. | PLACE-009-US-019 | Yes | API | Smoke cadence. |

## Final Summary

1. User stories processed: 19
2. Total test cases generated: 132
3. Duplicate test case IDs: 0
4. Invalid story references: 0
5. Missing user stories: 0
6. Encoding/mojibake findings: 0
7. API tests missing exact status codes: 0

### Test Count Per User Story

| User Story ID | Test Cases |
|---|---:|
| PLACE-009-US-001 | 7 |
| PLACE-009-US-002 | 4 |
| PLACE-009-US-003 | 6 |
| PLACE-009-US-004 | 5 |
| PLACE-009-US-005 | 11 |
| PLACE-009-US-006 | 5 |
| PLACE-009-US-007 | 7 |
| PLACE-009-US-008 | 6 |
| PLACE-009-US-009 | 10 |
| PLACE-009-US-010 | 5 |
| PLACE-009-US-011 | 5 |
| PLACE-009-US-012 | 12 |
| PLACE-009-US-013 | 9 |
| PLACE-009-US-014 | 8 |
| PLACE-009-US-015 | 5 |
| PLACE-009-US-016 | 5 |
| PLACE-009-US-017 | 5 |
| PLACE-009-US-018 | 6 |
| PLACE-009-US-019 | 11 |

### Count By Test Type

| Test Type | Count |
|---|---:|
| API | 72 |
| Abuse Prevention | 2 |
| Accessibility | 19 |
| Arabic | 7 |
| Authentication | 4 |
| Authorization | 4 |
| Boundary | 11 |
| Browser | 1 |
| Concurrency | 7 |
| Contract | 9 |
| Data Integrity | 20 |
| Duplicate | 14 |
| Emoji | 1 |
| Error Handling | 9 |
| Integration | 4 |
| Keyboard | 4 |
| Landscape | 1 |
| Loading State | 5 |
| Localization | 2 |
| Mobile | 8 |
| Moderation | 3 |
| Negative | 11 |
| Observability | 1 |
| Performance | 2 |
| Positive | 9 |
| Privacy | 10 |
| Product Rule | 3 |
| RTL | 1 |
| Rate Limit | 3 |
| Recovery | 5 |
| Reduced Motion | 1 |
| Regression | 7 |
| Responsive | 10 |
| Routing | 4 |
| Safe Area | 1 |
| Screen Reader | 3 |
| Security | 21 |
| Trust Safety | 1 |
| UI | 52 |
| UX | 9 |
| Unicode | 2 |
| Validation | 35 |

### Count By Priority

| Priority | Count |
|---|---:|
| Critical | 30 |
| High | 73 |
| Medium | 29 |
| Low | 0 |

### Count By Automation Layer

| Automation Layer | Count |
|---|---:|
| API | 68 |
| Accessibility | 16 |
| Manual | 1 |
| Performance | 1 |
| UI E2E | 46 |

### Count By Automation Cadence

| Cadence | Count |
|---|---:|
| Manual Review | 1 |
| Nightly | 4 |
| Regression | 82 |
| Smoke | 45 |

### Top Automation Candidates

- Smoke API: valid restaurant create returns `201 Created` with required response schema.
- Smoke API: guest create returns `401 Unauthorized` and no row is created.
- Smoke API: required-name, required-subtype, invalid-subtype, duplicate-name, malformed-payload, rate-limit, and security-input checks return exact status codes.
- Smoke UI E2E: successful restaurant create navigates directly to `/places/{newPlaceId}` with loading and duplicate-submit protection.
- Regression API: Unicode, Arabic, punctuation, whitespace, and zero-width normalization do not bypass duplicate detection.
- Regression accessibility: keyboard-only form completion, modal semantics, error announcements, loading announcements, forced colors, and reduced motion remain usable.
- Regression responsive: 320px, 390px, 430px, landscape, safe-area, software-keyboard, and 200 percent zoom flows remain usable without horizontal overflow.
- Nightly performance/concurrency: rate-limit recovery, duplicate spam, browser refresh during submit, stale retry responses, and abuse-prevention behavior remain safe under load.

### Manual-Only Tests

- `PLACE-009-US-011-TC-005`: Requires product review evidence for moderation/admin correction wording if surfaced in UI.

### Remaining Assumptions Or Questions

- Rate-limit threshold and moderation block rules are environment-configured; tests assert deterministic contract behavior after the configured condition is reached.
