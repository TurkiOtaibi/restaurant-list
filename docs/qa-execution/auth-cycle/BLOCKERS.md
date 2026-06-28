# Authentication QA Blockers

Branch: `feature/sprint-1-user-facing-completion`  
SHA: `4b99b43d9a58082c8f0c47ecadd30bef2ee22fdc`

## AUTH-QA-BLOCK-001

- Blocking category: BLOCKED_TEST_DATA
- Owner: QA
- Affected test cases: AUTH-002-US-016-TC-001
- Exact reason: The approved case requires an observable password-hash invocation counter; current test environment exposes API behavior but not deterministic hash-call instrumentation.
- Missing prerequisite: Instrumented auth service test fixture exposing hash invocation count.
- Required action to unblock: Add QA harness/instrumentation for hash invocation count without changing product behavior.

## AUTH-QA-BLOCK-002

- Blocking category: BLOCKED_CONFIGURATION
- Owner: QA
- Affected test cases: AUTH-004-US-021-TC-001, AUTH-004-US-022-TC-001
- Exact reason: Default access/refresh expiry cases require deterministic time control or waiting the configured production durations.
- Missing prerequisite: Time-travel/short-lifetime execution configuration approved for QA.
- Required action to unblock: Provide test configuration to override lifetimes or expose deterministic clock control.

## AUTH-QA-BLOCK-003

- Blocking category: BLOCKED_EXTERNAL_SERVICE
- Owner: DevOps
- Affected test cases: AUTH-007-US-008-TC-001, AUTH-007-US-010-TC-001
- Exact reason: Redis-specific limiter sharing and Redis-failure fallback cannot be executed without a Redis service/failure-injection harness.
- Missing prerequisite: Redis test service and controlled failure injection.
- Required action to unblock: Provide Redis-backed auth rate-limit test environment with failure toggle.

## AUTH-QA-BLOCK-004

- Blocking category: BLOCKED_CONFIGURATION
- Owner: QA
- Affected test cases: AUTH-007-US-006-TC-001, AUTH-007-US-006-TC-002
- Exact reason: Rate-limit override/window-recovery tests require runtime override of AUTH_RATE_LIMIT_REQUESTS and AUTH_RATE_LIMIT_WINDOW_SECONDS or time control.
- Missing prerequisite: Config override harness for limiter thresholds/windows.
- Required action to unblock: Provide isolated auth limiter test profile with short window and configurable threshold.

