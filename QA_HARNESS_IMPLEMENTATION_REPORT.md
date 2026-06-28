# QA Harness Implementation Report

## Architecture

Implemented only the highest-ROI P0 capability from `QA_INFRASTRUCTURE_IMPROVEMENT_PLAN.md`:

Focused authenticated Places UI acceptance harness.

The harness is Playwright-owned QA infrastructure. It does not change application behavior, backend business logic, user stories, RTM, test case documents, or EDRs.

The architecture has three pieces:

1. E2E API server bootstrap.
   - Starts the existing backend E2E API script when no ready API is already available.
   - Waits on `/health/ready`.
   - Reuses an already-running API when present.

2. Authenticated browser session setup.
   - Creates a QA user through the Auth API.
   - Extracts the HttpOnly refresh cookie from the API response.
   - Injects that cookie into the Playwright browser context.
   - Allows the frontend to establish the in-memory access token through the documented refresh flow.
   - Avoids login and registration UI flows.

3. Places feature-state loader.
   - Seeds deterministic Places, Lists, and Ratings data through documented APIs.
   - Loads Places feature states directly by route.
   - Supports stable assertions using route state, deterministic entity names, roles, and stable app classes.

## Files Added

- `frontend/tests/e2e/support/e2e-api-server.ts`
  - Reusable E2E API bootstrap and teardown helper.

- `frontend/tests/e2e/support/places-acceptance-harness.ts`
  - Reusable authenticated Places acceptance harness.
  - Deterministic dataset creation.
  - Feature-state loaders.
  - API seed helpers.

- `frontend/tests/e2e/places-acceptance-harness.spec.ts`
  - Proof test that exercises the harness against list, filter, detail, create, rating, and add-to-list states.

- `QA_HARNESS_IMPLEMENTATION_REPORT.md`
  - This implementation report.

## Files Changed

- `frontend/tests/e2e/sprint3-real.spec.ts`
  - Updated the real Places E2E test to use `PlacesAcceptanceHarness`.
  - Removed dependency on registration UI redirect behavior from the Places-specific test.
  - Preserved the real API Places assertions.

## Reusable Fixtures Created

The harness creates a deterministic authenticated fixture per feature execution:

- Fresh QA browser context cookies.
- Fresh API-created QA user.
- Deterministic run ID.
- Deterministic Places dataset.
- Deterministic owned private list.
- Deterministic owned public list.
- Deterministic ratings for selected Places.
- Deterministic list membership.

## Supported Feature States

The harness supports direct loading of:

- Places list: `/places?type=...`
- Place detail: `/places/{placeId}`
- Create Place: `/places/new?type=...`
- Filter state: `/places?type=...&subtype=...&q=...`
- Rating state: `/places/{placeId}/rate`
- Add-to-list state from Place Detail

## Supported Datasets

Each seeded dataset includes:

- Restaurant with burger subtype.
- Restaurant with Italian subtype.
- Unrated restaurant.
- Mixed English name restaurant.
- Cafe with coffee subtype.
- Cafe with tea subtype.
- Ice cream place.
- Private owned list.
- Public owned list.
- Current-user ratings.
- Place-to-list relationships.

## Explicitly Out of Scope

Not implemented:

- Accessibility automation.
- Real-device execution lab.
- Responsive viewport matrix expansion.
- Network fault injection.
- Performance harness.
- Future roadmap infrastructure.

## Quality Gate Results

| Gate | Result | Evidence |
| --- | --- | --- |
| Existing Places API tests | PASS | `python -m pytest tests/api/test_places_and_lists.py tests/api/test_sprint2.py -q` -> 22 passed |
| Backend lint | PASS | `python -m ruff check .` -> All checks passed |
| Backend typecheck | PASS | `python -m mypy app tests` -> Success |
| New Places harness E2E | PASS | `npm run test:e2e -- tests/e2e/places-acceptance-harness.spec.ts` -> 1 passed |
| Existing Places unauthenticated E2E | PASS | `npm run test:e2e -- tests/e2e/auth-gating.spec.ts -g "places library prompts unauthenticated users to sign in"` -> 1 passed |
| Existing Places responsive/UI E2E | PASS | `npm run test:e2e -- tests/e2e/responsive-layout.spec.ts` -> 5 passed |
| Existing real Places E2E | PASS | `npm run test:e2e -- tests/e2e/sprint3-real.spec.ts -g "real places library covers subtype filters sorting layout bidi and errors"` -> 1 passed |
| Frontend lint | PASS | `npm run lint` |
| Frontend typecheck | PASS | `npm run typecheck` |
| Frontend build | PASS | `npm run build` |

## Remaining Known Risks

- The harness provides the foundation for deterministic Places feature execution, but it does not implement the later hardening phases.
- Accessibility, real-device, responsive matrix, and network fault blockers remain intentionally out of scope.
- The harness uses API-created data and browser-context cookie injection; it does not verify login/register UI behavior, which belongs to Auth QA.

## Completion Statement

The Focused Authenticated Places UI Acceptance Harness is implemented and verified.

Future Places QA cycles can now start each feature from:

Feature ID -> deterministic fixture -> authenticated browser context -> direct feature-state loader -> execution

without replaying unrelated login or registration UI flows.
