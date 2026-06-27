# PROFILE-003 Test Cases - View own private notes

## Source Requirements

- Feature: `PROFILE-003 - View own private notes`
- Sources: `PROFILE_USER_STORIES.md`, `FEATURE_TRACEABILITY.md`, `RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`
- Endpoint under test: `GET /api/v1/profile`
- Documented statuses: `200 OK`, `401 Unauthorized`, `500 Error`
- User stories processed: `PROFILE-003-US-001` through `PROFILE-003-US-018`

## Deterministic Fixtures

### Fixture PROFILE-003-A - Owner Note Visible

- User: `user-notes-001`
- Authenticated state: valid bearer session `bearer-notes-001`
- Request: `GET /api/v1/profile`
- Payload: none
- Rating row: `rating-note-001`, `placeId="place-note-001"`, `placeName="قهوة المساء"`, `rating=8.0`, `notes="قهوة هادئة مناسبة للعمل"`, owner `user-notes-001`
- Expected `200 OK` response: `userRatings[0].notes="قهوة هادئة مناسبة للعمل"`
- Expected UI state: note preview is visible in the `قهوة المساء` archive row only.

### Fixture PROFILE-003-B - Missing Note

- User: `user-notes-001`
- Authenticated state: valid bearer session `bearer-notes-001`
- Request: `GET /api/v1/profile`
- Payload: none
- Rating row: `rating-note-null-001`, `placeName="Burger House"`, `rating=7.5`, `notes=null`
- Expected UI state: no note preview, blank note, fake note, or empty placeholder for the row.

### Fixture PROFILE-003-C - Long Note

- User: `user-notes-001`
- Authenticated state: valid bearer session `bearer-notes-001`
- Request: `GET /api/v1/profile`
- Payload: none
- Rating row: `rating-note-long-001`, `placeName="مطعم الرياض"`, `notes="ملاحظة طويلة عن الخدمة والجلسة والطلب والأسعار وتجربة العائلة في نهاية الأسبوع مع تفاصيل كثيرة يجب أن تبقى داخل حدود صف الأرشيف"`
- Expected UI state: compact preview is contained; full note is available only after opening the documented rating edit flow.

### Fixture PROFILE-003-D - Other User Note

- Current user: `user-notes-001`
- Other user: `user-notes-002`
- Other user rating note canary: `ملاحظة خاصة بمستخدم آخر`
- Request: `GET /api/v1/profile` as `user-notes-001`
- Payload: none
- Expected response: `200 OK`; canary is absent from all response fields and UI.

### Fixture PROFILE-003-E - Error With Private Note Canary

- User: `user-notes-001`
- Authenticated state: valid bearer session `bearer-notes-001`
- Request: `GET /api/v1/profile`
- Payload: none
- Backend error occurs while loading rating `rating-note-001`
- Expected response: `500 Error` safe payload
- Forbidden payload/log/UI values: `قهوة هادئة مناسبة للعمل` and raw rating payload values.

## Executable Test Cases

| Test Case ID | Test Title | Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| PROFILE-003-TC-001 | Owner sees own private note in archive row | Positive, Privacy | Critical | Fixture PROFILE-003-A is active. | Request `GET /api/v1/profile`; payload none; expected note `قهوة هادئة مناسبة للعمل`. | Open `/profile`. | API status is `200 OK`; `userRatings[0].notes` equals the expected note; UI row `قهوة المساء` shows that note preview once. | PROFILE-003-US-001 | Yes | API, UI E2E |
| PROFILE-003-TC-002 | Missing note returns `notes: null` | API, Boundary | High | Fixture PROFILE-003-B is active. | Request `GET /api/v1/profile`; payload none; expected `notes=null`. | Request profile and inspect row. | API status is `200 OK`; row `rating-note-null-001` has `notes:null`; no empty string or missing notes field is returned. | PROFILE-003-US-002 | Yes | API |
| PROFILE-003-TC-003 | Null note does not render placeholder UI | UI, UX | Medium | Fixture PROFILE-003-B is active. | Row `Burger House`, `notes=null`. | Open `/profile`. | The row displays place name and rating; DOM contains no blank note block, fake note text, or empty placeholder for that row. | PROFILE-003-US-003 | Yes | UI E2E |
| PROFILE-003-TC-004 | Whitespace-only saved note disappears after profile refresh | Validation, Integration | High | Documented post-edit profile fixture has `rating-note-001.notes=null` after saving note payload `"   "`. | Request `GET /api/v1/profile`; payload none. | Refresh `/profile` after the documented rating edit end state is present. | API status is `200 OK`; row notes value is `null`; UI row shows no note preview. | PROFILE-003-US-004 | Yes | API, UI E2E |
| PROFILE-003-TC-005 | Long note preview stays contained on mobile | Responsive, UI | High | Fixture PROFILE-003-C is active. | Viewport `320x568`; note canary starts `ملاحظة طويلة`. | Open `/profile`. | Note preview is clamped or wrapped inside row bounds; it does not overlap rating, edit action, or navigation; `scrollWidth <= innerWidth`. | PROFILE-003-US-005, PROFILE-003-US-017, RESP-002-US-019 | Yes | UI E2E |
| PROFILE-003-TC-006 | Full note is available through row-specific edit flow | Integration, UI | Medium | Fixture PROFILE-003-C is active. | Target `rating-note-long-001`; full note text from fixture. | Activate edit for `مطعم الرياض`. | Edit flow opens for `place-note-001`; full note text is present in the edit field; no other row's note is loaded. | PROFILE-003-US-006 | Yes | UI E2E |
| PROFILE-003-TC-007 | Edited note preview refreshes from server data | Regression, Privacy | High | Post-edit fixture sets `rating-note-001.notes="تم تحديث الملاحظة"`. | Request `GET /api/v1/profile`; payload none. | Refresh `/profile` after documented edit success. | API status is `200 OK`; archive row shows exactly `تم تحديث الملاحظة`; old note `قهوة هادئة مناسبة للعمل` no longer appears. | PROFILE-003-US-007 | Yes | API, UI E2E |
| PROFILE-003-TC-008 | Other user's note is absent from current user's profile | Security, Privacy | Critical | Fixture PROFILE-003-D is active. | Other user canary `ملاحظة خاصة بمستخدم آخر`. | Request profile as `user-notes-001` and inspect UI. | API status is `200 OK`; response and UI do not contain the other user's note canary or rating ID. | PROFILE-003-US-008, PROFILE-003-US-011 | Yes | API, Security |
| PROFILE-003-TC-009 | Private notes do not appear in logs or telemetry during profile success | Security, Manual | Critical | Fixture PROFILE-003-A is active and logging capture is enabled. | Request `GET /api/v1/profile`; payload none; expected `200 OK`; note canary `قهوة هادئة مناسبة للعمل`. | Load `/profile` once and inspect application logs, client console, analytics, and telemetry capture. | API status is `200 OK`; canary note text is absent from logs, console, analytics, telemetry, and any client-visible diagnostic payload. | PROFILE-003-US-013 | Yes | Security |
| PROFILE-003-TC-010 | Error payload excludes private notes and raw rating payloads | Error Handling, Security | Critical | Fixture PROFILE-003-E is active. | Request `GET /api/v1/profile`; payload none; expected `500 Error`; note canary `قهوة هادئة مناسبة للعمل`. | Load `/profile` and capture response/UI/logs. | API status is `500 Error`; response, UI error, console, and logs exclude the note canary and raw rating payload values. | PROFILE-003-US-014 | Yes | API, Security |
| PROFILE-003-TC-011 | Note preview is associated with correct row for screen readers | Accessibility | Medium | Fixture PROFILE-003-A is active. | Row `قهوة المساء`, rating `8.0`, note preview. | Inspect accessibility tree for the archive row. | Note preview is announced in the same row context as `قهوة المساء` and `8.0/10`; it is not announced as a detached unlabeled paragraph. | PROFILE-003-US-015 | Yes | Accessibility |
| PROFILE-003-TC-012 | Note preview contrast meets WCAG AA | Accessibility | Medium | Fixture PROFILE-003-A is active on dark UI. | Note preview text `قهوة هادئة مناسبة للعمل`. | Measure text/background contrast. | Normal text contrast is at least 4.5:1; note preview remains readable in forced-colors mode. | PROFILE-003-US-016, RESP-003-US-014 | Yes | Accessibility |
| PROFILE-003-TC-013 | Notes remain contained at 390px, 430px, and 200% zoom | Responsive | High | Fixture PROFILE-003-C is active. | Viewports `390x844`, `430x932`; zoom `200%`. | Render `/profile` at each condition. | Note preview does not overlap rating/actions/nav; no horizontal overflow; touch targets remain at least `44x44` where interactive. | PROFILE-003-US-017, RESP-002-US-001, RESP-003-US-001, RESP-003-US-008 | Yes | UI E2E |
| PROFILE-003-TC-014 | Notes are cleared after logout without private-data flash | Security, Privacy | Critical | Fixture PROFILE-003-A is rendered; logout state occurs in another tab or current tab. | Note canary `قهوة هادئة مناسبة للعمل`. | Trigger documented logout/auth-cleared state and observe `/profile`. | Note preview and previously rendered private archive rows are removed before signed-out UI appears; canary never remains visible after logout state. | PROFILE-003-US-018 | Yes | UI E2E, Security |

## Requirement Clarification, Manual, and Traceability Cases

| Test Case ID | Case Type | Priority | Title | Verification |
|---|---|---|---|---|
| PROFILE-003-TC-015 | Traceability Verification | Critical | Notes excluded from public-list surfaces | `PROFILE-003-US-009`: verify note absence on public-list response/UI in that feature's contract tests; PROFILE-003 supplies the privacy rule but not the public-list endpoint contract. |
| PROFILE-003-TC-016 | Traceability Verification | Critical | Notes excluded from place detail for non-owner | `PROFILE-003-US-010`: verify note absence on place-detail response/UI in that feature's contract tests; PROFILE-003 supplies the privacy rule but not the place-detail endpoint contract. |
| PROFILE-003-TC-017 | Traceability Verification | Critical | Public/profile data privacy boundary | `PROFILE-003-US-011`: verify other users' public/profile surfaces do not expose note canaries; PROFILE-003 keeps this as a privacy traceability requirement outside its profile endpoint executable tests. |
| PROFILE-003-TC-018 | Requirement Clarification | Medium | Approved compact note preview length | Source requires approved compact preview length but does not define exact character or line count; clarify before asserting an exact truncation threshold. |
| PROFILE-003-TC-019 | Manual Verification | Critical | Operational log and telemetry sinks | Validate server logs, browser console, analytics, and telemetry in the deployed environment because not all sinks are observable from API/UI automation. |
| PROFILE-003-TC-020 | Traceability Verification | Critical | Notes excluded from aggregate responses | `PROFILE-003-US-012`: verify aggregate response test ownership in the ratings/aggregate feature; PROFILE-003 requires note absence, but does not document the aggregate endpoint contract or status code. |

## Summary

- Executable test cases: 14
- Requirement Clarification cases: 1
- Manual cases: 1
- Traceability Verification cases: 4
- Total test cases: 20
- Priority counts: Critical 10, High 5, Medium 5, Low 0
- Automation layer counts: API 6, UI E2E 7, Accessibility 3, Security 6, Manual 1, Traceability Verification 4, Requirement Clarification 1

## Validation

- Duplicate Test IDs: 0
- Invalid Story References: 0
- Missing User Stories: 0
- Encoding/Mojibake: 0
- API Tests Missing Status Codes: 0
- Requirement Fidelity Violations: 0
- Feature Ownership Violations: 0
- Generic Executable Wording: 0
