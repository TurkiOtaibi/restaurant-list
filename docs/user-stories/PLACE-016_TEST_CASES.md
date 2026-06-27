# PLACE-016 Test Cases

Feature: `PLACE-016 - Store optional description`

Source: `docs/user-stories/PLACES_USER_STORIES.md`

Scope: All user stories under `PLACE-016`.

## QA Execution Standards

- Test cases validate documented requirements only. Undefined description behavior must be captured as Requirement Clarification, Manual Verification, or Traceability Verification.
- `description` is backend/API reserved metadata and is not a current active create-place UI field.
- `description` is optional for `POST /api/v1/places`.
- A supplied valid `description` is `1-1000` characters and is returned in the place response.
- Omitted `description`, empty string, and whitespace-only `description` are stored as `null`.
- `description` longer than `1000` characters returns `422 Validation Error` and creates no place.
- `POST /api/v1/places` requires authentication and returns `401 Unauthorized` for guests.
- `POST /api/v1/places` returns `409 Conflict` with error code `DUPLICATE_PLACE_NAME` for duplicate normalized place names.
- `POST /api/v1/places` success responses include `id`, `name`, `normalizedName`, `type`, `subtype`, `description`, `averageRating`, `ratingCount`, `createdAt`, and `updatedAt`.
- Current UI tests may verify that the create-place UI does not require or prominently expose `description`; they must not invent a current description field.
- Future display behavior for `description` is security-relevant but not current UI behavior. Future rendering tests remain Manual Verification or Traceability Verification until a visible description surface exists.
- Executable responsive and accessibility checks must explicitly cite originating global requirements from `RESP-*` or `A11Y-*` when they are not directly defined by `PLACE-016`.
- Automation cadence values used in Notes: Smoke, Regression, Nightly, Manual Review.

## PLACE-016-US-001 - Store optional description through API

User Story Summary: As an API consumer, I want optional description stored so that reserved metadata can exist when supplied.

Related Feature ID: `PLACE-016`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-016-US-001-TC-001 | Store one-character description | API, Positive, Boundary | High | Authenticated user exists; no place named `Description Min Restaurant` exists. | `POST /api/v1/places` with `name=Description Min Restaurant`, `type=restaurant`, `subtype=burger`, `description=a`. | 1. Send authenticated request. 2. Inspect status and response body. | Response status is `201 Created`; response `description` is exactly `a`; place is created once. | PLACE-016-US-001 | Yes | API | Smoke cadence. |
| PLACE-016-US-001-TC-002 | Store 1000-character description | API, Positive, Boundary | High | Authenticated user exists; no place named `Description Max Restaurant` exists. | `description` is `a` repeated exactly `1000` characters. | 1. Send authenticated `POST /api/v1/places` with valid restaurant payload. 2. Inspect response. | Response status is `201 Created`; response `description` length is exactly `1000` characters and equals the submitted value. | PLACE-016-US-001 | Yes | API | Regression cadence. |
| PLACE-016-US-001-TC-003 | Store Arabic description text | API, Localization, Arabic | Medium | Authenticated user exists; no place named `Arabic Description Cafe` exists. | `type=cafe`, `subtype=coffee`, `description=وصف عربي قصير`. | 1. Send authenticated create request. 2. Inspect response body bytes and parsed JSON. | Response status is `201 Created`; `description` is `وصف عربي قصير` with valid UTF-8 and no mojibake. | PLACE-016-US-001 | Yes | API | Regression cadence. |
| PLACE-016-US-001-TC-004 | Store English description text | API, Positive | Medium | Authenticated user exists; no place named `English Description Cafe` exists. | `description=Short English description.` | 1. Send authenticated create request. 2. Inspect response. | Response status is `201 Created`; `description` is exactly `Short English description.` | PLACE-016-US-001 | Yes | API | Regression cadence. |
| PLACE-016-US-001-TC-005 | Store mixed Arabic and English description | API, Localization, RTL | Medium | Authenticated user exists; no place named `Mixed Description Cafe` exists. | `description=قهوة specialty 24/7`. | 1. Send authenticated create request. 2. Inspect response. | Response status is `201 Created`; `description` is exactly `قهوة specialty 24/7`. | PLACE-016-US-001 | Yes | API | Regression cadence. |
| PLACE-016-US-001-TC-006 | Multiline description handling requires clarification | Requirement Clarification, Manual | Medium | Requirements review is being performed. | `description=Line one\nLine two`. | 1. Inspect source requirements for multiline description support and preservation. 2. Confirm whether newline characters are accepted, normalized, rejected, or preserved. | No executable assertion is made for multiline description behavior until documented. | PLACE-016-US-001 | No | Manual | Manual Review cadence. |
| PLACE-016-US-001-TC-007 | Emoji and punctuation description handling requires clarification | Requirement Clarification, Manual | Medium | Requirements review is being performed. | `description=Great taste! 10/10 :) 🍦`. | 1. Inspect source requirements for emoji and punctuation handling in description. 2. Confirm whether these characters are accepted, normalized, rejected, or preserved. | No executable assertion is made for emoji or punctuation-specific behavior until documented. | PLACE-016-US-001 | No | Manual | Manual Review cadence. |
| PLACE-016-US-001-TC-008 | Description appears in required create response schema | API, Contract | Critical | Authenticated user exists; unique valid restaurant payload is available. | Valid restaurant payload with `description=Schema description`. | 1. Send authenticated request. 2. Inspect response JSON keys. | Response status is `201 Created`; response includes `id`, `name`, `normalizedName`, `type`, `subtype`, `description`, `averageRating`, `ratingCount`, `createdAt`, and `updatedAt`. | PLACE-016-US-001 | Yes | API | Smoke cadence. |
| PLACE-016-US-001-TC-009 | Description create response excludes forbidden private fields | API, Privacy, Security | High | Authenticated user exists; unique valid restaurant payload is available. | Valid restaurant payload with `description=Privacy schema check`. | 1. Send authenticated request. 2. Inspect response JSON keys and nested objects. | Response status is `201 Created`; response contains no `creatorId`, `ownerId`, `privateNotes`, `privateListMembership`, `accessToken`, `refreshToken`, `password`, `passwordHash`, or internal moderation field. | PLACE-016-US-001 | Yes | API | Regression cadence. |
| PLACE-016-US-001-TC-010 | Guest cannot create place with description | API, Authentication, Negative | Critical | No authenticated session is present. | Valid restaurant payload with `description=Guest should fail`. | 1. Send unauthenticated `POST /api/v1/places`. 2. Inspect status and response. 3. Query catalog by name as an authenticated user. | Response status is `401 Unauthorized`; no place named from the payload is created; response contains no protected catalog data. | PLACE-016-US-001 | Yes | API | Smoke cadence. |
| PLACE-016-US-001-TC-011 | Duplicate name with description returns documented conflict | API, Data Integrity, Negative | High | Authenticated user exists; place named `Duplicate Description Place` already exists. | Second create payload has same normalized name and `description=Duplicate attempt`. | 1. Send authenticated duplicate create request. 2. Inspect status and error code. 3. Confirm no second row exists. | Response status is `409 Conflict`; error code is `DUPLICATE_PLACE_NAME`; no duplicate place is created. | PLACE-016-US-001 | Yes | API | Regression cadence. Source: global Places duplicate contract. |
| PLACE-016-US-001-TC-012 | Non-string description is rejected as malformed payload | API, Validation, Negative | High | Authenticated user exists; unique valid restaurant name is available. | `description` is JSON object `{}`. | 1. Send authenticated `POST /api/v1/places`. 2. Inspect response. 3. Confirm no place is created. | Response status is `422 Validation Error`; no place is created. | PLACE-016-US-001 | Yes | API | Regression cadence. Source: malformed create payload rules in create-place requirements. |
| PLACE-016-US-001-TC-013 | Nonblank leading and trailing space behavior requires clarification | Requirement Clarification, Manual | Medium | Requirements review is being performed. | `description=  valid text  `. | 1. Inspect source requirements for nonblank description trimming or preservation. 2. Confirm expected behavior with Product/API owner. | No executable assertion is made for nonblank leading/trailing space behavior until documented. | PLACE-016-US-001 | No | Manual | Manual Review cadence. |

## PLACE-016-US-002 - Store missing description as null

User Story Summary: As the system, I want description optional so that UI can omit it.

Related Feature ID: `PLACE-016`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-016-US-002-TC-001 | Omitted description stores null for restaurant | API, Positive, Boundary | Critical | Authenticated user exists; unique restaurant name is available. | Valid restaurant payload omits `description`. | 1. Send authenticated `POST /api/v1/places`. 2. Inspect response. | Response status is `201 Created`; response includes `description: null`. | PLACE-016-US-002 | Yes | API | Smoke cadence. |
| PLACE-016-US-002-TC-002 | Omitted description stores null for cafe | API, Positive | High | Authenticated user exists; unique cafe name is available. | Valid cafe payload omits `description`. | 1. Send authenticated `POST /api/v1/places`. 2. Inspect response. | Response status is `201 Created`; response includes `description: null`. | PLACE-016-US-002 | Yes | API | Regression cadence. |
| PLACE-016-US-002-TC-003 | Omitted description stores null for ice cream place | API, Positive | High | Authenticated user exists; unique ice cream name is available. | Valid `type=ice_cream` payload omits `description` and omits subtype. | 1. Send authenticated `POST /api/v1/places`. 2. Inspect response. | Response status is `201 Created`; response includes `description: null`. | PLACE-016-US-002 | Yes | API | Regression cadence. |
| PLACE-016-US-002-TC-004 | Description key remains present when omitted | API, Contract | High | Authenticated user exists; unique valid place payload omits `description`. | Valid cafe payload without `description`. | 1. Send authenticated request. 2. Inspect response keys. | Response status is `201 Created`; `description` key exists and its value is `null`; the key is not omitted. | PLACE-016-US-002 | Yes | API | Regression cadence. |
| PLACE-016-US-002-TC-005 | Omitted description still enforces required place fields | API, Validation, Negative | High | Authenticated user exists. | Payload omits both `description` and required `name`. | 1. Send authenticated `POST /api/v1/places`. 2. Inspect response. 3. Confirm no place is created. | Response status is `422 Validation Error`; no place is created. | PLACE-016-US-002 | Yes | API | Regression cadence. |
| PLACE-016-US-002-TC-006 | Null description request behavior requires clarification | Requirement Clarification, Manual | Medium | Requirements review is being performed. | Payload includes `"description": null`. | 1. Inspect source requirements for explicit null request handling. 2. Confirm whether explicit null is equivalent to omitted or invalid submitted value. | No executable assertion is made for explicit `description: null` until documented. | PLACE-016-US-002 | No | Manual | Manual Review cadence. |

## PLACE-016-US-003 - Store blank description as null

User Story Summary: As the system, I want blank description normalized so that empty strings do not pollute data.

Related Feature ID: `PLACE-016`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-016-US-003-TC-001 | Empty string description stores null | API, Positive, Boundary | Critical | Authenticated user exists; unique valid restaurant payload is available. | `description=""`. | 1. Send authenticated `POST /api/v1/places`. 2. Inspect response. | Response status is `201 Created`; response includes `description: null`. | PLACE-016-US-003 | Yes | API | Smoke cadence. |
| PLACE-016-US-003-TC-002 | Spaces-only description stores null | API, Positive, Boundary | High | Authenticated user exists; unique valid cafe payload is available. | `description="   "`. | 1. Send authenticated `POST /api/v1/places`. 2. Inspect response. | Response status is `201 Created`; response includes `description: null`. | PLACE-016-US-003 | Yes | API | Regression cadence. |
| PLACE-016-US-003-TC-003 | Tabs and newlines-only description stores null | API, Edge Case | High | Authenticated user exists; unique valid restaurant payload is available. | `description="\t\n  \r\n"`. | 1. Send authenticated request. 2. Inspect response. | Response status is `201 Created`; response includes `description: null`. | PLACE-016-US-003 | Yes | API | Regression cadence. |
| PLACE-016-US-003-TC-004 | Blank description does not create validation error | API, Validation, Regression | Medium | Authenticated user exists; unique valid place payload is available. | Valid restaurant payload with `description=""`. | 1. Send authenticated request. 2. Inspect status. | Response status is `201 Created`, not `422`; `description` is `null`. | PLACE-016-US-003 | Yes | API | Regression cadence. |
| PLACE-016-US-003-TC-005 | Blank description does not mask duplicate-name conflict | API, Data Integrity, Negative | Medium | Authenticated user exists; place named `Blank Duplicate Place` already exists. | Duplicate create payload with `description=" "`. | 1. Send authenticated duplicate request. 2. Inspect status and error code. | Response status is `409 Conflict`; error code is `DUPLICATE_PLACE_NAME`; no duplicate place is created. | PLACE-016-US-003 | Yes | API | Regression cadence. |
| PLACE-016-US-003-TC-006 | Unicode whitespace-only behavior requires clarification | Requirement Clarification, Manual | Medium | Requirements review is being performed. | Description containing non-breaking spaces only. | 1. Inspect source requirements for Unicode whitespace normalization. 2. Confirm whether non-ASCII whitespace-only strings are blank. | No executable assertion is made for Unicode whitespace-only behavior until documented. | PLACE-016-US-003 | No | Manual | Manual Review cadence. |

## PLACE-016-US-004 - Enforce description length

User Story Summary: As the system, I want description length constrained so that storage and UI stay safe.

Related Feature ID: `PLACE-016`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-016-US-004-TC-001 | Description longer than 1000 characters returns 422 | API, Validation, Boundary, Negative | Critical | Authenticated user exists; unique valid restaurant name is available. | `description` is `a` repeated exactly `1001` characters. | 1. Send authenticated `POST /api/v1/places`. 2. Inspect response. 3. Query catalog by name. | Response status is `422 Validation Error`; no place is created. | PLACE-016-US-004 | Yes | API | Smoke cadence. |
| PLACE-016-US-004-TC-002 | 1000-character description remains accepted at upper boundary | API, Validation, Boundary | High | Authenticated user exists; unique valid cafe name is available. | `description` is `b` repeated exactly `1000` characters. | 1. Send authenticated `POST /api/v1/places`. 2. Inspect response. | Response status is `201 Created`; response `description` length is exactly `1000` characters. | PLACE-016-US-004 | Yes | API | Regression cadence. |
| PLACE-016-US-004-TC-003 | Length validation error payload excludes sensitive data | API, Security, Privacy, Negative | High | Authenticated user exists; unique valid restaurant name is available. | `description` is `c` repeated exactly `1001` characters. | 1. Send authenticated request. 2. Inspect error response. | Response status is `422 Validation Error`; error payload contains no stack trace, SQL detail, token, cookie, password, password hash, internal file path, private note, or private list membership. | PLACE-016-US-004 | Yes | Security | Regression cadence. |
| PLACE-016-US-004-TC-004 | Character-count definition requires clarification for multibyte text | Requirement Clarification, Manual | Medium | Requirements review is being performed. | Arabic string and emoji string near 1000 characters. | 1. Inspect source requirements for character counting versus byte counting. 2. Confirm exact length metric. | No executable assertion is made for byte-versus-character length behavior until documented. | PLACE-016-US-004 | No | Manual | Manual Review cadence. |
| PLACE-016-US-004-TC-005 | Trim-before-length behavior requires clarification | Requirement Clarification, Manual | Medium | Requirements review is being performed. | Description with 1000 letters plus leading/trailing spaces. | 1. Inspect source requirements for trimming before length validation. 2. Confirm expected validation order. | No executable assertion is made for trim-before-length behavior until documented. | PLACE-016-US-004 | No | Manual | Manual Review cadence. |
| PLACE-016-US-004-TC-006 | Multiple validation error ordering requires clarification | Requirement Clarification, Manual | Low | Requirements review is being performed. | Payload missing `name` and has overlong `description`. | 1. Inspect source requirements for multi-error ordering and response shape. 2. Confirm whether all errors or first error should be returned. | No executable assertion is made for validation error ordering until documented. | PLACE-016-US-004 | No | Manual | Manual Review cadence. |

## PLACE-016-US-005 - Do not expose description as active UI field

User Story Summary: As Product, I want description reserved so that MVP create-place UI remains simple.

Related Feature ID: `PLACE-016`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-016-US-005-TC-001 | Create-place UI does not require description | UI, Positive, UX | High | Authenticated user can open current create-place UI. | Valid restaurant name and subtype; no description input used. | 1. Open create-place UI. 2. Complete all documented visible required fields except description. 3. Submit. | UI allows submission without any description value; successful API response has `description: null`. | PLACE-016-US-005 | Yes | UI E2E | Smoke cadence. |
| PLACE-016-US-005-TC-002 | Create-place UI does not prominently expose description field | UI, UX, Regression | Medium | Authenticated user can open current create-place UI. | Create-place dialog. | 1. Open create-place UI. 2. Inspect visible fields and labels. | No prominent user-facing field labeled `Description`, `وصف`, or equivalent active description entry appears in the current create-place UI. | PLACE-016-US-005 | Yes | UI E2E | Regression cadence. |
| PLACE-016-US-005-TC-003 | Omitted UI description does not show validation error | UI, Validation, Negative | Medium | Authenticated user can open current create-place UI. | Valid cafe name and subtype; description omitted. | 1. Open create-place UI. 2. Fill documented required fields. 3. Submit. 4. Inspect validation messages. | No validation error says description is required; place creation can proceed when all documented required visible fields are valid. | PLACE-016-US-005 | Yes | UI E2E | Regression cadence. |
| PLACE-016-US-005-TC-004 | Screen reader does not encounter required description input in current UI | Accessibility, Screen Reader, Regression | Medium | Authenticated user; accessibility tree inspection is available; global dialog labeling requirements `A11Y-001-US-003`, `A11Y-001-US-014`, and `A11Y-001-US-015` apply. | Create-place dialog. | 1. Open create-place UI. 2. Inspect accessibility tree and required field announcements. | No required description input is exposed to assistive technology; visible required fields remain labeled and validation-accessible. | PLACE-016-US-005 | Yes | Accessibility | Regression cadence. Source: PLACE-016-US-005, A11Y-001-US-003, A11Y-001-US-014, A11Y-001-US-015. |
| PLACE-016-US-005-TC-005 | Mobile create UI remains usable without description field | UI, Responsive, Regression | Medium | Authenticated user; global viewport and no-overflow requirements `RESP-002-US-001`, `RESP-002-US-002`, and create-flow keyboard requirement `RESP-002-US-009` apply. | Viewports `320x568`, `390x844`, `430x932`. | 1. Open create-place UI at each viewport. 2. Fill documented required fields without description. 3. Submit. | Create-place UI can be completed without description; `document.documentElement.scrollWidth <= window.innerWidth`; primary actions remain reachable. | PLACE-016-US-005 | Yes | UI E2E | Regression cadence. Source: PLACE-016-US-005, RESP-002-US-001, RESP-002-US-002, RESP-002-US-009. |
| PLACE-016-US-005-TC-006 | Placeholder behavior for future description field requires clarification | Requirement Clarification, Manual | Low | Requirements review is being performed. | Potential future description input placeholder. | 1. Inspect source requirements for current or future placeholder copy. 2. Confirm whether any placeholder requirement exists. | No executable placeholder assertion is made until a description UI field is documented. | PLACE-016-US-005 | No | Manual | Manual Review cadence. |
| PLACE-016-US-005-TC-007 | Current UI description editing behavior is not applicable | Traceability Verification, Manual | Low | QA traceability review is being performed. | Current create-place UI. | 1. Review source requirements and UI scope. 2. Confirm `description` is reserved metadata and not an active UI entry field. | Test evidence records that UI editing of description is out of current `PLACE-016` executable scope. | PLACE-016-US-005 | No | Manual | Manual Review cadence. |
| PLACE-016-US-005-TC-008 | Description validation-state persistence requires clarification | Requirement Clarification, Manual | Medium | Requirements review is being performed. | Potential future description validation error. | 1. Inspect source requirements for description validation state persistence after failed submit. 2. Confirm whether errors persist, reset, or clear on edit. | No executable assertion is made for description validation-state persistence until a description UI field is documented. | PLACE-016-US-005 | No | Manual | Manual Review cadence. |
| PLACE-016-US-005-TC-009 | Description dirty and touched state behavior requires clarification | Requirement Clarification, Manual | Medium | Requirements review is being performed. | Potential future description input interaction. | 1. Inspect source requirements for dirty/touched behavior. 2. Confirm whether description errors show on blur, submit, input, or another trigger. | No executable assertion is made for dirty/touched state until documented. | PLACE-016-US-005 | No | Manual | Manual Review cadence. |
| PLACE-016-US-005-TC-010 | Description character counter behavior requires clarification | Requirement Clarification, Manual | Low | Requirements review is being performed. | Potential future description input with 1000-character limit. | 1. Inspect source requirements for field counter requirements. 2. Confirm whether a visible or accessible counter is required. | No executable assertion is made for a description character counter until documented. | PLACE-016-US-005 | No | Manual | Manual Review cadence. |
| PLACE-016-US-005-TC-011 | Post-submit description validation reset requires clarification | Requirement Clarification, Manual | Medium | Requirements review is being performed. | Potential failed submit followed by successful submit. | 1. Inspect source requirements for post-submit validation reset behavior. 2. Confirm whether description errors clear after success, after input change, or after dialog close. | No executable assertion is made for post-submit validation reset until documented. | PLACE-016-US-005 | No | Manual | Manual Review cadence. |

## PLACE-016-US-006 - Keep description available for future features

User Story Summary: As Product, I want description retained in the API so that future features can use it without schema rework.

Related Feature ID: `PLACE-016`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-016-US-006-TC-001 | API model includes description when value is supplied | API, Contract, Regression | High | Authenticated user exists; unique valid restaurant payload is available. | `description=Future metadata value`. | 1. Send authenticated create request. 2. Inspect response schema. | Response status is `201 Created`; `description` key exists and equals `Future metadata value`. | PLACE-016-US-006 | Yes | API | Regression cadence. |
| PLACE-016-US-006-TC-002 | API model includes description when value is null | API, Contract, Regression | High | Authenticated user exists; unique valid cafe payload omits description. | Valid cafe payload without `description`. | 1. Send authenticated create request. 2. Inspect response schema. | Response status is `201 Created`; `description` key exists and value is `null`. | PLACE-016-US-006 | Yes | API | Regression cadence. |
| PLACE-016-US-006-TC-003 | Current UI omission and API retention coexist | Integration, UI, API | Medium | Authenticated user can open create-place UI and API responses are inspectable. | Valid restaurant created through UI without description. | 1. Create a place through current UI without any description field. 2. Inspect create response or resulting place API model. | API response status is `201 Created`; UI does not require description; resulting API model includes `description: null`. | PLACE-016-US-006 | Yes | UI E2E | Regression cadence. |
| PLACE-016-US-006-TC-004 | Description field is serialized consistently as JSON string or null | API, Contract, Data Integrity | Medium | Authenticated user exists. | One payload with `description=Serialized text`; one payload omitting description. | 1. Create place with supplied description. 2. Create place with omitted description. 3. Inspect both responses. | Both responses have status `201 Created`; supplied description serializes as JSON string; omitted description serializes as JSON `null`; neither response omits the key. | PLACE-016-US-006 | Yes | API | Regression cadence. |
| PLACE-016-US-006-TC-005 | Future update behavior requires clarification | Requirement Clarification, Manual | Medium | Requirements review is being performed. | Potential future update endpoint. | 1. Inspect source requirements for any place update endpoint affecting description. 2. Confirm whether update behavior is in scope. | No executable update-description assertion is made until an update requirement exists. | PLACE-016-US-006 | No | Manual | Manual Review cadence. |
| PLACE-016-US-006-TC-006 | Description availability in list/detail read APIs requires clarification | Requirement Clarification, Manual | Medium | Requirements review is being performed. | `GET /api/v1/places` and `GET /api/v1/places/{id}` response models. | 1. Inspect source requirements for read endpoint description exposure. 2. Confirm whether all place responses or create response only must expose description. | No executable read-endpoint assertion is made beyond documented `POST /api/v1/places` response until read exposure is documented. | PLACE-016-US-006 | No | Manual | Manual Review cadence. |
| PLACE-016-US-006-TC-007 | API schema traceability includes reserved description metadata | Traceability Verification, Manual | Low | QA traceability review is being performed. | `PLACE-016`, `FEATURE_CATALOG`, `FEATURE_TRACEABILITY`. | 1. Review feature catalog and API traceability. 2. Confirm `places.description` remains mapped to `POST /api/v1/places`. | Traceability evidence links `PLACE-016` to `places.description` and `POST /api/v1/places`. | PLACE-016-US-006 | No | Manual | Manual Review cadence. |

## PLACE-016-US-007 - Sanitize displayed description if future UI uses it

User Story Summary: As the system, I want reserved metadata safe if it becomes visible later.

Related Feature ID: `PLACE-016`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLACE-016-US-007-TC-001 | HTML-like description API acceptance requires clarification | Requirement Clarification, Security, Manual | High | Requirements review is being performed. | `description=<strong>Safe text</strong>`. | 1. Inspect source requirements for HTML-like description acceptance at `POST /api/v1/places`. 2. Confirm whether HTML-like text is accepted as data, rejected, or normalized. | No executable API acceptance assertion is made for HTML-like description payloads until documented. | PLACE-016-US-007 | No | Manual | Manual Review cadence. |
| PLACE-016-US-007-TC-002 | Current UI script-execution risk is traceability-only | Traceability Verification, Security, Manual | High | QA security review is being performed; current UI does not expose description as active field. | Potential stored description containing `<script>alert(1)</script>`. | 1. Review source requirements and current UI scope. 2. Confirm there is no current visible description surface where script-like description can execute. | Current executable UI scope has no description display field; future script rendering remains covered by future UI manual verification. | PLACE-016-US-007 | No | Manual | Manual Review cadence. |
| PLACE-016-US-007-TC-003 | Sensitive error payloads are not exposed for HTML-like overlong description | API, Security, Privacy, Negative | High | Authenticated user exists; unique valid restaurant name is available. | Over-1000-character HTML-like description. | 1. Send authenticated create request. 2. Inspect error response. | Response status is `422 Validation Error`; error payload contains no executable markup, stack trace, token, cookie, password, SQL detail, private note, or private list membership. | PLACE-016-US-007 | Yes | Security | Regression cadence. |
| PLACE-016-US-007-TC-004 | Future visible description must render markup as text | Manual Verification, Security, Accessibility | High | Future UI surface that displays description exists. | Description value `<img src=x onerror=alert(1)>`. | 1. Open future UI surface that displays description. 2. Inspect rendered output and accessibility tree. | Future UI displays the value as text and does not execute markup; this remains manual until the future UI surface exists. | PLACE-016-US-007 | No | Manual | Manual Review cadence. |
| PLACE-016-US-007-TC-005 | Future description accessible-name behavior requires clarification | Requirement Clarification, Accessibility, Manual | Medium | Requirements review is being performed for a future description display surface. | Future description content. | 1. Inspect future UI requirements for whether description is visible text, accessible description, or hidden metadata. 2. Confirm screen-reader expectations. | No executable accessible-name assertion is made until the future UI display behavior is documented. | PLACE-016-US-007 | No | Manual | Manual Review cadence. |
| PLACE-016-US-007-TC-006 | SQL-like description request behavior requires clarification | Requirement Clarification, Security, Manual | Medium | Requirements review is being performed. | `description='; DROP TABLE places; --`. | 1. Inspect source requirements for SQL-like description payload handling. 2. Confirm whether such input is accepted as data, rejected, or normalized. | No executable acceptance assertion is made for SQL-like description payloads until documented; sensitive error payload coverage remains executable through validation-error tests. | PLACE-016-US-007 | No | Manual | Manual Review cadence. |
| PLACE-016-US-007-TC-007 | Future visible description responsive behavior requires traceability | Traceability Verification, Manual, Responsive | Low | Future UI surface that displays description is being designed. | Long visible description on mobile. | 1. Inspect future UI requirements and global responsive requirements. 2. Confirm which feature owns long description layout tests. | No executable responsive assertion is made for future description display until a visible surface is documented and traceable. | PLACE-016-US-007 | No | Manual | Manual Review cadence. |
| PLACE-016-US-007-TC-008 | Future description field label and keyboard behavior requires clarification | Requirement Clarification, Accessibility, Manual | Medium | Requirements review is being performed for a future description input or display surface. | Future description field. | 1. Inspect future UI requirements and global accessibility requirements. 2. Confirm whether description has a visible label, accessible name, keyboard path, and `focus-visible` behavior. | No executable field-label or keyboard assertion is made until a future description surface is documented and traceable to `A11Y-*` requirements. | PLACE-016-US-007 | No | Manual | Manual Review cadence. |
| PLACE-016-US-007-TC-009 | Future description validation announcements require traceability | Requirement Clarification, Accessibility, Manual | Medium | Requirements review is being performed for future description validation. | Future invalid description input. | 1. Inspect future UI requirements and global validation accessibility requirements `A11Y-001-US-014`, `A11Y-001-US-015`, and `A11Y-001-US-016`. 2. Confirm whether errors use field association, first-invalid focus, and live/status announcement. | No executable validation-announcement assertion is made until a future description UI field exists and is traceable to the applicable `A11Y-*` requirements. | PLACE-016-US-007 | No | Manual | Manual Review cadence. |

## Final Summary

1. User stories processed: 7
2. Total executable test cases: 33
3. Clarification / Manual / Traceability cases: 25
4. Total test cases: 58
5. Test count per user story:
   - `PLACE-016-US-001`: 13
   - `PLACE-016-US-002`: 6
   - `PLACE-016-US-003`: 6
   - `PLACE-016-US-004`: 6
   - `PLACE-016-US-005`: 11
   - `PLACE-016-US-006`: 7
   - `PLACE-016-US-007`: 9
6. Count by test type:
   - API: 28
   - Accessibility: 5
   - Arabic: 1
   - Authentication: 1
   - Positive: 9
   - Boundary: 7
   - Negative: 9
   - Contract: 5
   - Data Integrity: 3
   - Edge Case: 1
   - Integration: 1
   - Localization: 2
   - Manual: 24
   - Validation: 6
   - Security: 7
   - Privacy: 3
   - Regression: 6
   - RTL: 1
   - UI: 5
   - UX: 2
   - Responsive: 2
   - Screen Reader: 1
   - Requirement Clarification: 20
   - Manual Verification: 1
   - Traceability Verification: 4
7. Count by priority:
   - Critical: 5
   - High: 20
   - Medium: 27
   - Low: 6
8. Count by automation layer:
   - API: 25
   - Security: 2
   - UI E2E: 5
   - Accessibility: 1
   - Manual: 25
9. Top automation candidates:
   - `PLACE-016-US-001-TC-008` for required `POST /api/v1/places` response schema coverage.
   - `PLACE-016-US-002-TC-001` for omitted-description null behavior.
   - `PLACE-016-US-003-TC-001` for blank-description null normalization.
   - `PLACE-016-US-004-TC-001` for over-1000-character validation.
   - `PLACE-016-US-005-TC-001` for current UI not requiring description.
   - `PLACE-016-US-007-TC-003` for sensitive error payload protection.
10. Manual-only tests:
   - Requirement clarifications for multiline handling, emoji/punctuation handling, explicit null, nonblank trimming, Unicode whitespace, multibyte length counting, trim-before-length ordering, multi-error ordering, future placeholder behavior, validation-state persistence, dirty/touched state, character counter behavior, post-submit validation reset, future update behavior, read-endpoint description exposure, HTML-like API acceptance, SQL-like API acceptance, future accessible-name behavior, future field label/keyboard behavior, future validation announcements, and future visible responsive behavior.
   - Manual verification for future visible HTML-like description rendering.
   - Traceability verification for current UI description editing scope, current UI script-execution scope, and reserved API schema mapping.
11. Validation:
   - Duplicate Test IDs: 0
   - Invalid Story References: 0
   - Missing User Stories: 0
   - Encoding/Mojibake: 0
   - API Tests Missing Status Codes: 0
   - Requirement Fidelity Violations: 0
