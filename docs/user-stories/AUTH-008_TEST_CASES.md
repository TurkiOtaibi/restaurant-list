# AUTH-008 Test Cases

Feature: `AUTH-008 - Google/Apple/social login out of scope`

## Sources

- `docs/user-stories/AUTH_USER_STORIES.md`
- `docs/feature-map/FEATURE_TRACEABILITY.md`
- `docs/user-stories/RESPONSIVE_ACCESSIBILITY_USER_STORIES.md`

## Documented Contract

- Current MVP authentication is email/password only.
- Login and registration screens expose no Google, Apple, OAuth, SSO, social-login, or external identity provider options.
- Current API routes expose no supported Google, Apple, OAuth, SSO, or social-login endpoint.
- Unsupported social auth path attempts return documented unsupported-path behavior and do not create users or sessions.
- Login/register copy presents only email/password authentication.
- Auth tests must cover email/password scope and must not require social providers.
- Future social-login behavior requires explicit product approval and updated requirements before it becomes current executable behavior.

## Shared Deterministic Fixtures

| Fixture ID | Purpose | Exact State |
|---|---|---|
| FX-AUTH-008-LOGIN-GOOGLE | Login Google absence | Entry screen `/login`; provider label `Google`; forbidden labels/selectors: `Google`, `Continue with Google`, `Sign in with Google`, `google`, `[data-provider="google"]`. |
| FX-AUTH-008-LOGIN-APPLE | Login Apple absence | Entry screen `/login`; provider label `Apple`; forbidden labels/selectors: `Apple`, `Continue with Apple`, `Sign in with Apple`, `apple`, `[data-provider="apple"]`. |
| FX-AUTH-008-LOGIN-OAUTH | Login OAuth absence | Entry screen `/login`; provider label `OAuth`; forbidden labels/selectors: `OAuth`, `oauth`, `OpenID`, `OIDC`, `[data-provider="oauth"]`. |
| FX-AUTH-008-LOGIN-SSO | Login SSO absence | Entry screen `/login`; provider label `SSO`; forbidden labels/selectors: `SSO`, `single sign-on`, `Single Sign-On`, `[data-provider="sso"]`. |
| FX-AUTH-008-LOGIN-SOCIAL | Login social absence | Entry screen `/login`; provider label `social login`; forbidden labels/selectors: `social login`, `social sign in`, `external identity provider`, `[data-auth-kind="social"]`. |
| FX-AUTH-008-REGISTER-GOOGLE | Register Google absence | Entry screen `/register`; provider label `Google`; forbidden labels/selectors: `Google`, `Continue with Google`, `Sign up with Google`, `google`, `[data-provider="google"]`. |
| FX-AUTH-008-REGISTER-APPLE | Register Apple absence | Entry screen `/register`; provider label `Apple`; forbidden labels/selectors: `Apple`, `Continue with Apple`, `Sign up with Apple`, `apple`, `[data-provider="apple"]`. |
| FX-AUTH-008-REGISTER-OAUTH | Register OAuth absence | Entry screen `/register`; provider label `OAuth`; forbidden labels/selectors: `OAuth`, `oauth`, `OpenID`, `OIDC`, `[data-provider="oauth"]`. |
| FX-AUTH-008-REGISTER-SSO | Register SSO absence | Entry screen `/register`; provider label `SSO`; forbidden labels/selectors: `SSO`, `single sign-on`, `Single Sign-On`, `[data-provider="sso"]`. |
| FX-AUTH-008-REGISTER-SOCIAL | Register social absence | Entry screen `/register`; provider label `social login`; forbidden labels/selectors: `social login`, `social sign up`, `external identity provider`, `[data-auth-kind="social"]`. |
| FX-AUTH-008-API-INVENTORY | Supported auth endpoint inventory | Supported documented endpoints are exactly `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, and `POST /api/v1/auth/logout`. |
| FX-AUTH-008-API-GOOGLE | Unsupported Google auth path | Request `POST /api/v1/auth/google`; payload `{ "email": "social@example.com", "provider": "google" }`; before user count for `social@example.com` = `0`; before session count for `social@example.com` = `0`. |
| FX-AUTH-008-API-APPLE | Unsupported Apple auth path | Request `POST /api/v1/auth/apple`; payload `{ "email": "social@example.com", "provider": "apple" }`; before user count for `social@example.com` = `0`; before session count for `social@example.com` = `0`. |
| FX-AUTH-008-API-OAUTH | Unsupported OAuth auth path | Request `POST /api/v1/auth/oauth`; payload `{ "email": "social@example.com", "provider": "oauth" }`; before user count for `social@example.com` = `0`; before session count for `social@example.com` = `0`. |
| FX-AUTH-008-API-SSO | Unsupported SSO auth path | Request `POST /api/v1/auth/sso`; payload `{ "email": "social@example.com", "provider": "sso" }`; before user count for `social@example.com` = `0`; before session count for `social@example.com` = `0`. |
| FX-AUTH-008-COPY-LOGIN | Login copy scope | Entry screen `/login`; documented current auth mode is email/password only. |
| FX-AUTH-008-COPY-REGISTER | Register copy scope | Entry screen `/register`; documented current auth mode is email/password only. |
| FX-AUTH-008-RESPONSIVE-LOGIN | Login responsive fixture | Entry screen `/login`; forbidden social provider labels from login fixtures; no social provider options rendered. |
| FX-AUTH-008-RESPONSIVE-REGISTER | Register responsive fixture | Entry screen `/register`; forbidden social provider labels from register fixtures; no social provider options rendered. |
| FX-AUTH-008-TEST-INVENTORY | Auth QA dependency inventory | Generated auth test case files, CI auth test references, and environment variable references are available for scan. Forbidden dependency terms: `GOOGLE_CLIENT_ID`, `APPLE_CLIENT_ID`, `OAUTH_CLIENT_ID`, `SSO_CLIENT_ID`, social provider credentials, and provider account fixtures. |
| FX-AUTH-008-FUTURE-SOCIAL | Future social proposal guard | A proposed future social-login behavior exists without updated AUTH requirements and product approval. |

## Shared Assertions

| Assertion ID | Required Assertion |
|---|---|
| ASSERT-AUTH-008-UI-ABSENT | Provider-specific forbidden labels, icons, links, buttons, selectors, visible text, DOM nodes, and accessibility-tree names are absent from the target screen. |
| ASSERT-AUTH-008-API-NOT-SUPPORTED | The path is not a supported social-login API contract; no user is created; no session is created; no access token, refresh token, auth cookie, provider profile, provider metadata, stack trace, debug payload, or internal route detail is returned. Numeric HTTP status is not asserted because AUTH-008 documents unsupported-path behavior without a status code. |
| ASSERT-AUTH-008-COPY-EMAIL-PASSWORD | Visible copy, form labels, helper text, actions, DOM text, and accessibility-tree names present email/password authentication only and expose no social-provider copy. |
| ASSERT-AUTH-008-RESPONSIVE | At the tested viewport/zoom, screen content is visible/reachable, no social-provider option appears, `document.documentElement.scrollWidth <= window.innerWidth`, no global overflow masking is required, safe areas do not obscure content, and visible interactive controls meet `44x44` CSS pixels where rendered. |
| ASSERT-AUTH-008-TEST-SCOPE | Auth test inventory has no required dependency on Google, Apple, OAuth, SSO, social-provider credentials, social-provider SDK accounts, or social-provider environment variables. |

## Executable Test Cases

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| AUTH-008-US-001-TC-001 | Login screen exposes no Google login option | UI, Negative | High | FX-AUTH-008-LOGIN-GOOGLE is loaded. | Entry screen `/login`; provider `Google`; no request. | 1. Open `/login`. 2. Inspect visible UI, DOM, selectors, buttons, links, icons, and accessibility tree for Google terms. | ASSERT-AUTH-008-UI-ABSENT passes for Google login terms. | AUTH-008-US-001 | Yes | UI E2E |
| AUTH-008-US-001-TC-002 | Login screen exposes no Apple login option | UI, Negative | High | FX-AUTH-008-LOGIN-APPLE is loaded. | Entry screen `/login`; provider `Apple`; no request. | 1. Open `/login`. 2. Inspect visible UI, DOM, selectors, buttons, links, icons, and accessibility tree for Apple terms. | ASSERT-AUTH-008-UI-ABSENT passes for Apple login terms. | AUTH-008-US-001 | Yes | UI E2E |
| AUTH-008-US-001-TC-003 | Login screen exposes no OAuth login option | UI, Negative | High | FX-AUTH-008-LOGIN-OAUTH is loaded. | Entry screen `/login`; provider `OAuth`; no request. | 1. Open `/login`. 2. Inspect visible UI, DOM, selectors, buttons, links, icons, and accessibility tree for OAuth/OpenID/OIDC terms. | ASSERT-AUTH-008-UI-ABSENT passes for OAuth login terms. | AUTH-008-US-001 | Yes | UI E2E |
| AUTH-008-US-001-TC-004 | Login screen exposes no SSO login option | UI, Negative | High | FX-AUTH-008-LOGIN-SSO is loaded. | Entry screen `/login`; provider `SSO`; no request. | 1. Open `/login`. 2. Inspect visible UI, DOM, selectors, buttons, links, icons, and accessibility tree for SSO terms. | ASSERT-AUTH-008-UI-ABSENT passes for SSO login terms. | AUTH-008-US-001 | Yes | UI E2E |
| AUTH-008-US-001-TC-005 | Login screen exposes no generic social login option | UI, Negative | High | FX-AUTH-008-LOGIN-SOCIAL is loaded. | Entry screen `/login`; provider `social login`; no request. | 1. Open `/login`. 2. Inspect visible UI, DOM, selectors, buttons, links, icons, and accessibility tree for social-login terms. | ASSERT-AUTH-008-UI-ABSENT passes for generic social-login terms. | AUTH-008-US-001 | Yes | UI E2E |
| AUTH-008-US-001-TC-006 | Registration screen exposes no Google signup option | UI, Negative | High | FX-AUTH-008-REGISTER-GOOGLE is loaded. | Entry screen `/register`; provider `Google`; no request. | 1. Open `/register`. 2. Inspect visible UI, DOM, selectors, buttons, links, icons, and accessibility tree for Google terms. | ASSERT-AUTH-008-UI-ABSENT passes for Google registration terms. | AUTH-008-US-001 | Yes | UI E2E |
| AUTH-008-US-001-TC-007 | Registration screen exposes no Apple signup option | UI, Negative | High | FX-AUTH-008-REGISTER-APPLE is loaded. | Entry screen `/register`; provider `Apple`; no request. | 1. Open `/register`. 2. Inspect visible UI, DOM, selectors, buttons, links, icons, and accessibility tree for Apple terms. | ASSERT-AUTH-008-UI-ABSENT passes for Apple registration terms. | AUTH-008-US-001 | Yes | UI E2E |
| AUTH-008-US-001-TC-008 | Registration screen exposes no OAuth signup option | UI, Negative | High | FX-AUTH-008-REGISTER-OAUTH is loaded. | Entry screen `/register`; provider `OAuth`; no request. | 1. Open `/register`. 2. Inspect visible UI, DOM, selectors, buttons, links, icons, and accessibility tree for OAuth/OpenID/OIDC terms. | ASSERT-AUTH-008-UI-ABSENT passes for OAuth registration terms. | AUTH-008-US-001 | Yes | UI E2E |
| AUTH-008-US-001-TC-009 | Registration screen exposes no SSO signup option | UI, Negative | High | FX-AUTH-008-REGISTER-SSO is loaded. | Entry screen `/register`; provider `SSO`; no request. | 1. Open `/register`. 2. Inspect visible UI, DOM, selectors, buttons, links, icons, and accessibility tree for SSO terms. | ASSERT-AUTH-008-UI-ABSENT passes for SSO registration terms. | AUTH-008-US-001 | Yes | UI E2E |
| AUTH-008-US-001-TC-010 | Registration screen exposes no generic social signup option | UI, Negative | High | FX-AUTH-008-REGISTER-SOCIAL is loaded. | Entry screen `/register`; provider `social login`; no request. | 1. Open `/register`. 2. Inspect visible UI, DOM, selectors, buttons, links, icons, and accessibility tree for social-login terms. | ASSERT-AUTH-008-UI-ABSENT passes for generic social-registration terms. | AUTH-008-US-001 | Yes | UI E2E |
| AUTH-008-US-002-TC-001 | Auth route inventory exposes no supported Google endpoint | API, Security, Negative | High | FX-AUTH-008-API-INVENTORY is loaded. | Unsupported provider `Google`; expected supported endpoint inventory excludes Google path. | 1. Inspect supported auth route inventory. 2. Search for supported Google auth routes. | Supported auth endpoints remain limited to register, login, refresh, and logout; no supported Google auth route is present. | AUTH-008-US-002 | Yes | API |
| AUTH-008-US-002-TC-002 | Auth route inventory exposes no supported Apple endpoint | API, Security, Negative | High | FX-AUTH-008-API-INVENTORY is loaded. | Unsupported provider `Apple`; expected supported endpoint inventory excludes Apple path. | 1. Inspect supported auth route inventory. 2. Search for supported Apple auth routes. | Supported auth endpoints remain limited to register, login, refresh, and logout; no supported Apple auth route is present. | AUTH-008-US-002 | Yes | API |
| AUTH-008-US-002-TC-003 | Auth route inventory exposes no supported OAuth endpoint | API, Security, Negative | High | FX-AUTH-008-API-INVENTORY is loaded. | Unsupported provider `OAuth`; expected supported endpoint inventory excludes OAuth path. | 1. Inspect supported auth route inventory. 2. Search for supported OAuth/OpenID/OIDC auth routes. | Supported auth endpoints remain limited to register, login, refresh, and logout; no supported OAuth/OpenID/OIDC auth route is present. | AUTH-008-US-002 | Yes | API |
| AUTH-008-US-002-TC-004 | Auth route inventory exposes no supported SSO endpoint | API, Security, Negative | High | FX-AUTH-008-API-INVENTORY is loaded. | Unsupported provider `SSO`; expected supported endpoint inventory excludes SSO path. | 1. Inspect supported auth route inventory. 2. Search for supported SSO auth routes. | Supported auth endpoints remain limited to register, login, refresh, and logout; no supported SSO auth route is present. | AUTH-008-US-002 | Yes | API |
| AUTH-008-US-003-TC-001 | Unsupported Google auth path creates no user or session | API, Security, Negative | Medium | FX-AUTH-008-API-GOOGLE is loaded. | Request `POST /api/v1/auth/google`; payload `{ "email": "social@example.com", "provider": "google" }`. | 1. Send request. 2. Inspect response body/headers. 3. Compare user/session counts for `social@example.com` before and after request. | ASSERT-AUTH-008-API-NOT-SUPPORTED passes; user count remains `0`; session count remains `0`. | AUTH-008-US-003 | Yes | API |
| AUTH-008-US-003-TC-002 | Unsupported Apple auth path creates no user or session | API, Security, Negative | Medium | FX-AUTH-008-API-APPLE is loaded. | Request `POST /api/v1/auth/apple`; payload `{ "email": "social@example.com", "provider": "apple" }`. | 1. Send request. 2. Inspect response body/headers. 3. Compare user/session counts for `social@example.com` before and after request. | ASSERT-AUTH-008-API-NOT-SUPPORTED passes; user count remains `0`; session count remains `0`. | AUTH-008-US-003 | Yes | API |
| AUTH-008-US-003-TC-003 | Unsupported OAuth auth path creates no user or session | API, Security, Negative | Medium | FX-AUTH-008-API-OAUTH is loaded. | Request `POST /api/v1/auth/oauth`; payload `{ "email": "social@example.com", "provider": "oauth" }`. | 1. Send request. 2. Inspect response body/headers. 3. Compare user/session counts for `social@example.com` before and after request. | ASSERT-AUTH-008-API-NOT-SUPPORTED passes; user count remains `0`; session count remains `0`. | AUTH-008-US-003 | Yes | API |
| AUTH-008-US-003-TC-004 | Unsupported SSO auth path creates no user or session | API, Security, Negative | Medium | FX-AUTH-008-API-SSO is loaded. | Request `POST /api/v1/auth/sso`; payload `{ "email": "social@example.com", "provider": "sso" }`. | 1. Send request. 2. Inspect response body/headers. 3. Compare user/session counts for `social@example.com` before and after request. | ASSERT-AUTH-008-API-NOT-SUPPORTED passes; user count remains `0`; session count remains `0`. | AUTH-008-US-003 | Yes | API |
| AUTH-008-US-004-TC-001 | Login copy presents email/password authentication only | UI, UX | Medium | FX-AUTH-008-COPY-LOGIN is loaded. | Entry screen `/login`; no request. | 1. Open `/login`. 2. Inspect headings, visible text, helper text, form labels, actions, DOM, and accessibility tree. | ASSERT-AUTH-008-COPY-EMAIL-PASSWORD passes; no provider-specific or generic social-login copy appears. | AUTH-008-US-004 | Yes | UI E2E |
| AUTH-008-US-004-TC-002 | Registration copy presents email/password authentication only | UI, UX | Medium | FX-AUTH-008-COPY-REGISTER is loaded. | Entry screen `/register`; no request. | 1. Open `/register`. 2. Inspect headings, visible text, helper text, form labels, actions, DOM, and accessibility tree. | ASSERT-AUTH-008-COPY-EMAIL-PASSWORD passes; no provider-specific or generic social-registration copy appears. | AUTH-008-US-004 | Yes | UI E2E |
| AUTH-008-RESP-001 | Login screen social absence passes mobile viewport matrix | Responsive, UI | Medium | FX-AUTH-008-RESPONSIVE-LOGIN is loaded. | Viewports `320x568`, `390x844`, `430x932`; entry screen `/login`; no request. | 1. Render `/login` at each viewport. 2. Inspect forbidden social labels/selectors. 3. Measure overflow and safe-area reachability. | ASSERT-AUTH-008-RESPONSIVE passes at each mobile viewport; ASSERT-AUTH-008-UI-ABSENT passes for all login social providers. | AUTH-008-US-001; AUTH-008-US-004; RESP-002-US-001; RESP-002-US-002; RESP-002-US-004; RESP-002-US-005; RESP-002-US-008 | Yes | UI E2E |
| AUTH-008-RESP-002 | Registration screen social absence passes mobile viewport matrix | Responsive, UI | Medium | FX-AUTH-008-RESPONSIVE-REGISTER is loaded. | Viewports `320x568`, `390x844`, `430x932`; entry screen `/register`; no request. | 1. Render `/register` at each viewport. 2. Inspect forbidden social labels/selectors. 3. Measure overflow and safe-area reachability. | ASSERT-AUTH-008-RESPONSIVE passes at each mobile viewport; ASSERT-AUTH-008-UI-ABSENT passes for all registration social providers. | AUTH-008-US-001; AUTH-008-US-004; RESP-002-US-001; RESP-002-US-002; RESP-002-US-004; RESP-002-US-005; RESP-002-US-008 | Yes | UI E2E |
| AUTH-008-RESP-003 | Login and registration social absence passes landscape and 200% zoom | Responsive, Accessibility | Medium | FX-AUTH-008-RESPONSIVE-LOGIN and FX-AUTH-008-RESPONSIVE-REGISTER are loaded. | Phone landscape viewport; 200% browser zoom; screens `/login` and `/register`; no request. | 1. Render `/login` in landscape and at 200% zoom. 2. Render `/register` in landscape and at 200% zoom. 3. Measure overflow and action target size. 4. Inspect accessibility tree for social-provider terms. | ASSERT-AUTH-008-RESPONSIVE passes for both screens; accessibility tree exposes no social-provider option; visible controls remain reachable. | AUTH-008-US-001; AUTH-008-US-004; RESP-002-US-012; RESP-003-US-001; RESP-003-US-002; RESP-003-US-003; RESP-003-US-008 | Yes | UI E2E |
| AUTH-008-A11Y-001 | Login screen keyboard and accessibility tree expose no social options | Accessibility, UI | Medium | FX-AUTH-008-LOGIN-SOCIAL is loaded. | Entry screen `/login`; keyboard-only navigation; forbidden social provider terms. | 1. Open `/login`. 2. Navigate all interactive controls by keyboard. 3. Inspect focus visibility and accessibility tree. | Keyboard focus reaches only available email/password controls; focus is visible; accessibility tree contains no Google, Apple, OAuth, SSO, or social-login option; touch targets meet `44x44` where controls render. | AUTH-008-US-001; AUTH-008-US-004; RESP-003-US-008 | Yes | Accessibility |
| AUTH-008-A11Y-002 | Registration screen keyboard and accessibility tree expose no social options | Accessibility, UI | Medium | FX-AUTH-008-REGISTER-SOCIAL is loaded. | Entry screen `/register`; keyboard-only navigation; forbidden social provider terms. | 1. Open `/register`. 2. Navigate all interactive controls by keyboard. 3. Inspect focus visibility and accessibility tree. | Keyboard focus reaches only available email/password controls; focus is visible; accessibility tree contains no Google, Apple, OAuth, SSO, or social-registration option; touch targets meet `44x44` where controls render. | AUTH-008-US-001; AUTH-008-US-004; RESP-003-US-008 | Yes | Accessibility |

## Clarification / Manual / Traceability Cases

| Case ID | Case Type | Priority | Verification | Expected Result | Related User Story ID |
|---|---|---|---|---|---|
| AUTH-008-RC-001 | Requirement Clarification | Medium | Confirm exact numeric HTTP status and structured error field names for unsupported social auth paths if the product wants executable status/schema assertions. | Executable unsupported-path tests assert documented not-found/unsupported behavior, no user/session creation, and forbidden sensitive fields without inventing numeric status or schema field names. | AUTH-008-US-003 |
| AUTH-008-RC-002 | Requirement Clarification | Low | Confirm whether callback-style paths such as `/api/v1/auth/google/callback`, `/api/v1/auth/apple/callback`, `/api/v1/auth/oauth/callback`, or `/api/v1/auth/sso/callback` should be explicitly listed in future requirements. | Current executable cases cover the documented unsupported social provider/path scope without inventing additional callback behavior. | AUTH-008-US-002; AUTH-008-US-003 |
| AUTH-008-RC-003 | Requirement Clarification | Low | Verify whether future Google login has explicit product approval and updated AUTH requirements before any executable test is added. | Google login remains non-current and non-executable until explicit product approval and updated requirements exist. | AUTH-008-US-006 |
| AUTH-008-RC-004 | Requirement Clarification | Low | Verify whether future Apple login has explicit product approval and updated AUTH requirements before any executable test is added. | Apple login remains non-current and non-executable until explicit product approval and updated requirements exist. | AUTH-008-US-006 |
| AUTH-008-RC-005 | Requirement Clarification | Low | Verify whether future OAuth login has explicit product approval and updated AUTH requirements before any executable test is added. | OAuth login remains non-current and non-executable until explicit product approval and updated requirements exist. | AUTH-008-US-006 |
| AUTH-008-RC-006 | Requirement Clarification | Low | Verify whether future SSO login has explicit product approval and updated AUTH requirements before any executable test is added. | SSO login remains non-current and non-executable until explicit product approval and updated requirements exist. | AUTH-008-US-006 |
| AUTH-008-TRACE-001 | Traceability Verification | Medium | Verify auth test inventory requires no Google provider dependency. | ASSERT-AUTH-008-TEST-SCOPE passes for `GOOGLE_CLIENT_ID`, Google credentials, and Google account fixtures. | AUTH-008-US-005 |
| AUTH-008-TRACE-002 | Traceability Verification | Medium | Verify auth test inventory requires no Apple provider dependency. | ASSERT-AUTH-008-TEST-SCOPE passes for `APPLE_CLIENT_ID`, Apple credentials, and Apple account fixtures. | AUTH-008-US-005 |
| AUTH-008-TRACE-003 | Traceability Verification | Medium | Verify auth test inventory requires no OAuth provider dependency. | ASSERT-AUTH-008-TEST-SCOPE passes for `OAUTH_CLIENT_ID`, OAuth credentials, and OAuth account fixtures. | AUTH-008-US-005 |
| AUTH-008-TRACE-004 | Traceability Verification | Medium | Verify auth test inventory requires no SSO provider dependency. | ASSERT-AUTH-008-TEST-SCOPE passes for `SSO_CLIENT_ID`, SSO credentials, and SSO account fixtures. | AUTH-008-US-005 |
| AUTH-008-TRACE-005 | Traceability Verification | Medium | Verify supported auth endpoint inventory remains limited to documented register, login, refresh, and logout endpoints. | No supported Google, Apple, OAuth, SSO, or generic social-login endpoint is present in current API contract. | AUTH-008-US-002 |
| AUTH-008-TRACE-006 | Traceability Verification | Medium | Verify social-login absence tests do not validate unrelated credential, factor, or session behaviors. | AUTH-008 executable cases stay scoped to absence of social-provider UI/API contracts and unsupported-path safety. | AUTH-008-US-001; AUTH-008-US-003; AUTH-008-US-004 |
| AUTH-008-TRACE-007 | Traceability Verification | Medium | Verify responsive/accessibility coverage is limited to Login/Register active-screen absence of social provider options and approved `RESP-*` requirements. | No modal-only or rating-only accessibility requirement is applied to AUTH-008; accessibility checks validate keyboard reachability, focus visibility, touch targets, and absence from accessibility tree. | AUTH-008-US-001; AUTH-008-US-004; RESP-002-US-001; RESP-003-US-008 |

## Summary

- User Stories Processed: 6
- Executable Test Cases: 25
- Clarification Cases: 6
- Manual Cases: 0
- Traceability Cases: 7
- Total Test Cases: 38

## Validation

- Duplicate Test IDs = 0
- Invalid Story References = 0
- Missing User Stories = 0
- Encoding/Mojibake = 0
- API Tests Missing Status Codes = 0
- Generic Executable Wording = 0
- Requirement Fidelity Violations = 0
- Feature Ownership Violations = 0
- Responsive Traceability Gaps = 0
- Accessibility Traceability Gaps = 0
