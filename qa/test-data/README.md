# Deterministic Test Data Platform

This directory is QA-only infrastructure. It is not imported by production application code and must not change runtime behavior.

The platform provides deterministic dataset recipes for automated and manual QA:

- Empty catalog
- 20 / 60 / 100 / 200 / 500 / 1000 places
- Restaurant-only, cafe-only, and mixed categories
- Duplicate names and duplicate-place scenarios
- Hidden, private, deleted, owned, shared, and favorite metadata scenarios
- Long Arabic names
- Long English names
- Mixed RTL/LTR names
- High, low, and no-rating scenarios
- Large lists, multiple pages, and pagination overlap
- Malformed responses and private-field response scenarios for QA-only mocks
- Feature-specific Places fixtures

Implementations:

- Playwright/TypeScript: `frontend/tests/e2e/support/deterministic-test-data-platform.ts`
- Backend/Python tests: `backend/tests/support/deterministic_test_data.py`

Reset strategy:

- Backend tests rely on the existing test database fixture reset.
- Playwright E2E API seeding uses deterministic namespaces and test-only users.
- Cleanup uses public APIs where available. Unsupported product states remain synthetic QA metadata only.
