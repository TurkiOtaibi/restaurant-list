# Test Case Generation Standard

Purpose: Define the official structure, traceability model, formatting rules, automation classification, and quality bar for all future feature-level test case files.

Reference implementation: `docs/user-stories/PLACE-001_TEST_CASES.md`

This standard is for generating test case documentation only. It does not define application test code structure.

## File Naming

Each feature test case file must be named:

```text
<FEATURE_ID>_TEST_CASES.md
```

Examples:

- `PLACE-001_TEST_CASES.md`
- `RATING-003_TEST_CASES.md`
- `AUTH-004_TEST_CASES.md`

The file must live under:

```text
docs/user-stories/
```

## Required Header

Every file must start with:

```md
# <FEATURE_ID> Test Cases

Feature: `<FEATURE_ID> - <Feature Name>`

Source: `<source user story file path>`

Scope: All user stories under `<FEATURE_ID>`.
```

Rules:

- `Feature ID` must match the source user story feature exactly.
- `Feature Name` must match the source user story feature heading.
- `Source` must point to the relevant user story file.
- Scope must state whether the file covers all stories under the feature or a defined subset. Standard expectation is all stories.

## QA Execution Standards Section

Every file must include:

```md
## QA Execution Standards
```

This section defines feature-specific execution rules. Include only standards relevant to the feature, but do not omit cross-cutting requirements when applicable.

Common standards:

- Encoding: all Arabic text must be valid UTF-8 and must not contain mojibake.
- Responsive assertions: use exact viewport expectations where relevant.
- Accessibility baseline: define keyboard, focus, accessible-name, screen-reader, touch-target, and dialog/sheet expectations where relevant.
- Security/privacy baseline: define forbidden data leakage for success and error responses.
- Automation cadence values: Smoke, Regression, Nightly, Manual Review.

Arabic integrity rule:

- Use real Arabic text, for example `قهوة`, `الأماكن`, `لا توجد أماكن`, `أضف مكانًا`.
- Do not use corrupted text such as mojibake or escaped replacement content.
- If terminal rendering corrupts Arabic visually, verify the file bytes as UTF-8 before changing content.

## User Story Sections

Each user story must have its own section.

Format:

```md
## <USER_STORY_ID> - <User Story Title>

User Story Summary: <As a... I want... So that...>

Related Feature ID: `<FEATURE_ID>`

| Test Case ID | Test Title | Test Type | Priority | Preconditions | Test Data | Steps | Expected Result | Related User Story ID | Automation Candidate | Automation Layer | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
```

Rules:

- Do not merge multiple user stories into one generic test section.
- Do not create test cases outside a user story section unless they are file-level standards or summary content.
- The user story title and summary must come from the source user story file.
- `Related Feature ID` must match the feature file.

## Test Case ID Format

Test case IDs must use:

```text
<USER_STORY_ID>-TC-<NNN>
```

Examples:

- `PLACE-001-US-001-TC-001`
- `AUTH-004-US-003-TC-002`
- `RATING-003-US-007-TC-005`

Rules:

- Numbering starts at `001` inside each user story.
- IDs must be unique within the file.
- IDs must not be reused after deletion unless the file has not been externally referenced.
- Every test case ID must trace to a valid user story ID in the same feature.

## Required Test Case Columns

Every test case table must use exactly these columns:

| Column | Requirement |
|---|---|
| Test Case ID | Stable unique ID using the standard format. |
| Test Title | Short, specific, action-oriented title. |
| Test Type | One or more meaningful type labels. |
| Priority | `Critical`, `High`, `Medium`, or `Low`. |
| Preconditions | Required user/session/data/system state before execution. |
| Test Data | Exact values, payloads, viewport sizes, URLs, accounts, or fixtures. |
| Steps | Numbered executable steps. |
| Expected Result | Concrete observable outcome. |
| Related User Story ID | Must match the current user story ID. |
| Automation Candidate | `Yes` or `No`. |
| Automation Layer | One of the approved automation layers. |
| Notes | Cadence, constraints, caveats, or ownership details. |

## Test Type Model

Use only meaningful test types. Do not force irrelevant categories.

Allowed common test types:

- Positive
- Negative
- Boundary
- Edge
- Validation
- API
- Contract
- UI
- UX
- UX / Usability
- Accessibility
- Keyboard
- Responsive
- Mobile
- Security
- Privacy
- Authentication
- Authorization
- Data Integrity
- Error Handling
- Loading State
- Empty State
- Regression
- Integration
- Performance
- Concurrency
- Localization / RTL
- Offline
- Defense-in-depth

Rules:

- A test case may have multiple test types, separated by commas.
- Avoid vague types such as `General`, `Misc`, or `Other`.
- If a new type is needed, define it in the file’s execution standards or in a future revision of this standard.

## Priority Model

Use these priority levels:

| Priority | Definition |
|---|---|
| Critical | Failure blocks core functionality, security, privacy, data integrity, accessibility access, or release readiness. |
| High | Failure causes major user impact, broken workflows, significant regression risk, or important contract drift. |
| Medium | Failure causes recoverable UX, compatibility, edge-case, or secondary workflow issues. |
| Low | Failure is minor, cosmetic, rare, or supplemental, but still testable. |

Rules:

- Do not inflate priorities.
- Security/privacy leakage is usually `Critical`.
- Broken authentication/authorization is usually `Critical`.
- Core happy-path access is usually `Critical`.
- Accessibility blockers for keyboard/screen-reader users are `Critical` or `High` depending on impact.
- Supplemental manual review can be `Medium` or `Low` unless it gates release.

## Automation Candidate Model

Use:

- `Yes`
- `No`

Rules:

- Use `Yes` if the test can be automated reliably with available tooling.
- Use `No` for tests requiring subjective visual judgment, real-device-only validation, exploratory review, or human screen-reader assessment.
- If automation is partial, use `Yes` and explain the manual supplement in `Notes`.

## Automation Layer Model

Allowed values:

- Unit
- API
- UI E2E
- Accessibility
- Performance
- Security
- Manual

Rules:

- Choose the primary execution layer, not every possible layer.
- API contract and status-code tests should usually be `API`.
- Browser workflow tests should usually be `UI E2E`.
- Axe, accessibility-tree, keyboard, focus, and screen-reader-adjacent tests should usually be `Accessibility`.
- Load, virtualization, DOM size, latency, or long-task tests should usually be `Performance`.
- Auth bypass, leakage, token, and forbidden-field tests may be `Security` or `API` depending on execution method.
- Manual screen-reader validation should be `Manual` only if it cannot be automated meaningfully.

## Automation Cadence

Use the `Notes` column to classify execution cadence.

Allowed cadence labels:

- Smoke
- Regression
- Nightly
- Manual Review

Definitions:

| Cadence | Use |
|---|---|
| Smoke | Minimal release-gate coverage for core critical behavior. |
| Regression | PR/CI or regular regression coverage. |
| Nightly | Heavier, slower, cross-browser, performance, race-condition, or large-data coverage. |
| Manual Review | Human validation required or recommended. |

Rules:

- Every test case should include a cadence note when practical.
- Heavy performance, large-catalog, and multi-browser tests should usually be `Nightly`.
- Core auth, API schema, privacy, and primary UI availability should usually be `Smoke` or `Regression`.

## Traceability Rules

Every file must satisfy:

- Every user story under the feature has at least one test case.
- Every acceptance criterion has at least one test case.
- Every test case references a valid user story ID.
- No orphan test cases exist.
- No duplicate test case IDs exist.
- Test case counts in the final summary match actual table rows.

Traceability must be at the user-story level and, where needed, acceptance-criterion level.

If one test case covers multiple acceptance criteria, note that in `Notes`. Do not use broad tests to hide missing coverage.

## Expected Result Quality

Expected results must be measurable and observable.

Avoid vague wording:

- clear message
- visually balanced
- remains usable
- works correctly
- handles gracefully
- near position

Prefer exact outcomes:

- Status `401 Unauthorized`.
- Status `422 Validation Error`.
- `document.documentElement.scrollWidth <= window.innerWidth`.
- Retry button has accessible name and `44x44` CSS pixel hit target.
- Response contains no `notes`, `creatorEmail`, `privateListIds`, stack trace, SQL, tokens, or cookies.
- Row accessible name includes the place name.
- `meta.sort` equals `rating_desc`.

## Test Data Quality

Test data must be exact enough for execution.

Required where applicable:

- API endpoint and query parameters.
- Request payload.
- Status code.
- Response schema fields.
- Arabic/English/mixed strings.
- Viewport dimensions.
- Auth/session state.
- Pagination values.
- Boundary values.
- Error payload conditions.
- Fixture size for large data tests.

Arabic and RTL data:

- Use real Arabic, not mojibake.
- Include mixed Arabic/English values where the UI supports them.
- Include Western numeral expectations where numbers render in Arabic UI.

## Required Coverage Review

For each user story, evaluate whether these categories are applicable:

- Positive path
- Negative path
- Boundary values
- Edge cases
- Validation
- Authentication
- Authorization
- API contract
- UI behavior
- UX/usability
- Accessibility
- Responsive/mobile
- Security/privacy
- Data integrity
- Error handling
- Loading state
- Empty state
- Regression
- Integration
- Performance
- Concurrency
- Localization / Arabic / RTL

Do not force categories that do not apply.

## Accessibility Requirements

Add explicit tests when a feature includes interactive UI.

Common accessibility tests:

- Accessible names.
- Semantic roles.
- Keyboard navigation.
- Enter/Space activation.
- `focus-visible`.
- Focus restoration.
- Dialog/sheet semantics.
- Error announcements.
- Loading announcements.
- Live regions.
- Screen-reader metadata.
- Touch target size: minimum `44x44` CSS pixels.
- Reduced motion behavior.

## Responsive Requirements

Add explicit responsive tests when a feature is user-facing.

Common viewport coverage:

- `320x568`
- `390x844`
- `430x932`
- landscape, for example `844x390`
- 200% zoom or synthetic adaptive pressure

Required no-overflow assertion:

```js
document.documentElement.scrollWidth <= window.innerWidth
```

Also test:

- bottom navigation overlap.
- safe-area behavior.
- first and final row visibility.
- long Arabic names.
- long English names.
- mixed Arabic/English names.

## Security And Privacy Requirements

Add explicit tests for protected or user-data-bearing features.

Common checks:

- Guest access denial.
- Protected route/API behavior.
- No private data flash.
- No sensitive fields in success responses.
- No sensitive fields in error responses.
- No stack traces, SQL, tokens, cookies, internal IDs, private notes, or private memberships.
- Authorization bypass attempts.

## API Contract Requirements

API tests must verify:

- Endpoint path.
- Method.
- Required auth state.
- Status codes.
- Response envelope.
- Required fields.
- Nullable fields.
- Forbidden fields.
- Validation failures.
- Pagination metadata where applicable.
- Sorting metadata where applicable.
- Safe error payloads.

## Final Summary Section

Every file must end with:

```md
## Final Summary

Total user stories processed: <N>

Total test cases generated: <N>

### Test Cases Count Per User Story

### Count By Test Type

### Count By Priority

### Count By Automation Layer

### Top Automation Candidates

### Manual-Only Test Cases

### Remaining Assumptions Or Questions
```

Rules:

- Counts must be computed from actual test case rows.
- Multi-label test types are counted once per label.
- Count by automation layer counts one primary layer per test case.
- Manual-only section must distinguish strict manual-only from automated tests that need supplemental manual review.
- Remaining assumptions must not contain unresolved product decisions unless explicitly called out.

## Re-Audit Section

For production-grade files, include:

```md
## Re-Audit Result
```

This section should include:

- Findings fixed.
- Findings remaining.
- Updated scorecard.
- Final verdict.

Allowed final verdicts:

- Production Grade
- Excellent
- Good
- Needs Improvement
- Significant Gaps

## Scorecard Model

Use the same scoring categories when auditing or re-auditing feature test case files:

- User Story Coverage /10
- Acceptance Criteria Coverage /10
- Functional Coverage /10
- Negative Coverage /10
- API Coverage /10
- UI Coverage /10
- Accessibility Coverage /10
- Responsive Coverage /10
- Security/Privacy Coverage /10
- Automation Readiness /10
- Traceability /10
- Production QA Readiness /10

Target for production-grade execution source:

- each category should be at least `9.5/10`.

## Pre-Completion Validation

Before finalizing a test case file:

1. Count actual test case rows.
2. Confirm declared total matches actual total.
3. Confirm every user story section has at least one test.
4. Confirm every test references a valid user story ID.
5. Confirm no duplicate test case IDs exist.
6. Confirm all Arabic text is valid UTF-8 and free of mojibake.
7. Confirm no orphan tests exist.
8. Confirm summary tables match the file.
9. Confirm no code or application test files were modified.

## Non-Goals

This standard does not:

- generate application test code.
- choose a specific testing framework.
- replace feature user stories.
- replace accessibility standards.
- replace security requirements.
- define production monitoring or deployment gates.

It defines the documentation standard for feature-level QA test case files.
