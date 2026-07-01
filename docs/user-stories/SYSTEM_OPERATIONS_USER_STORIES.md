# System Operations & QA User Stories

Source of truth:

- `docs/feature-map/FEATURE_MAP.md`
- `docs/feature-map/FEATURE_CATALOG.md`
- `docs/feature-map/FEATURE_TREE.md`
- `docs/feature-map/FEATURE_TRACEABILITY.md`

Scope: uncategorized `OPS-*` and `QA-*` features from `FEATURE_CATALOG.md`.

Total features processed: 11
Total user stories written: 152

## Engineering Decision Records

Approved EDRs that resolve operational clarifications:

- `docs/engineering-decisions/EDR-001_API_ERROR_CONTRACT.md`
- `docs/engineering-decisions/EDR-003_COLLECTION_ENVELOPE_AND_PAGINATION.md`
- `docs/engineering-decisions/EDR-004_REQUEST_ID_AND_STRUCTURED_LOGGING.md`
- `docs/engineering-decisions/EDR-005_HEALTH_CHECK_CONTRACT.md`
- `docs/engineering-decisions/EDR-006_OPERATIONAL_MONITORING_AND_EVIDENCE_POLICY.md`
- `docs/engineering-decisions/EDR-007_FRONTEND_API_VERSIONING_CONTRACT.md`
- `docs/engineering-decisions/EDR-008_MIGRATION_RELEASE_EVIDENCE_POLICY.md`

## Shared Operational Requirements

### Environments

- `local`: developer machine, local services, safe test data only.
- `test`: CI/test execution, deterministic fixtures, no production credentials.
- `beta`: live beta deployment, real infrastructure, controlled users, no unapproved test data left behind.
- `production`: real users/data, strict release gates, backups, monitoring, alerting, and rollback/forward-fix controls.
- Production and beta verification must not create persistent test users, lists, places, ratings, or list items unless explicitly approved.

### Observability Baseline

Production observability requires:

- Structured logging.
- Request IDs.
- Correlation IDs.
- Metrics.
- Health metrics.
- Error metrics.
- Deployment markers.
- Security-safe redaction.
- Auditability for releases, migrations, and destructive operations.

### Alerting Baseline

Mandatory alert categories:

- Readiness failures.
- Elevated `5xx` responses.
- Authentication failure spikes.
- Rate-limit spikes.
- Database connectivity failures.
- Migration failures.
- Deployment failures.

### Release Gates

Production release gates:

- Backend:
  - `ruff`
  - `mypy`
  - `pytest`
- Frontend:
  - `lint`
  - `typecheck`
  - `build`
- Playwright:
  - required suite
- Database:
  - migration validation
- Operational:
  - smoke test

### Baseline SLIs and SLOs

Minimum SLIs:

- Availability.
- Readiness success.
- Error rate.
- Latency.
- Deployment success.
- Migration success.

Baseline SLO targets:

- Backend liveness availability: `99.9%` measured over rolling 30 days.
- Backend readiness success during normal operation: `99.5%` measured over rolling 30 days.
- API `5xx` rate: below `1%` over rolling 15 minutes.
- Health endpoint p95 latency: below `250ms`.
- Readiness endpoint p95 latency: below `500ms` when dependencies are healthy.
- Standard API p95 latency: below `1000ms` for non-bulk endpoints under expected beta load.
- Migration success: `100%` for approved production migrations.
- Deployment success: failed deployments must not replace the last known healthy release.

## System / Operations

### OPS-001 - `/api/v1` prefix

Feature Description: Backend API endpoints use the `/api/v1` version prefix, and the frontend API client applies the versioned path convention.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| OPS-001-US-001 | Use versioned API paths | Critical | As an API consumer, I want product APIs versioned so contracts can evolve safely. | Given a product API endpoint is called, then the request path uses `/api/v1` unless the endpoint is explicitly documented as unversioned. |
| OPS-001-US-002 | Frontend auto-prefixes API calls | High | As a frontend developer, I want the API client to apply versioning consistently. | Given frontend code calls an API path without `/api/v1`, when the request is sent, then the client sends it to the versioned endpoint. |
| OPS-001-US-003 | Avoid double-prefixing | High | As a frontend developer, I want already-versioned paths handled safely. | Given frontend code passes a path already starting with `/api/v1`, then the client does not add a second prefix. |
| OPS-001-US-004 | Keep health endpoints unversioned | High | As an operator, I want health endpoints stable for infrastructure checks. | Given `/health/live` or `/health/ready` is called, then it works without `/api/v1`. |
| OPS-001-US-005 | Versioned routes produce traceable logs | Medium | As an operator, I want API version visible in logs. | Given a versioned API request is handled, then structured logs include method, route template, status, duration, request id, and API version without secrets. |
| OPS-001-US-006 | Unknown API versions fail safely | Medium | As an API consumer, I want unsupported versions handled predictably. | Given a request targets an unsupported API version, then the API returns a structured `404` or documented unsupported-version error without stack traces. |
| OPS-001-US-007 | Version prefix covered by regression tests | High | As QA, I want versioning regressions caught. | Given backend/frontend tests run, then representative API calls verify `/api/v1` behavior and no double-prefixing. |
| OPS-001-US-008 | Future version deprecation policy | Low | As an architect, I want future versioning governed. | Given a future `/api/v2` is introduced, then deprecation timelines, compatibility rules, and migration guidance must be documented before release. |

Story Count: 8

Coverage Assessment: Covers versioned API contract, frontend client behavior, double-prefix prevention, health exceptions, log traceability, unsupported versions, tests, and future deprecation governance.

Missing Assumptions: None.

Risks: Medium integration and observability risk if frontend/backend paths drift.

### OPS-002 - `{data, meta}` collections

Feature Description: Collection endpoints return a standard envelope containing `data` and `meta`.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| OPS-002-US-001 | Return collection envelope | Critical | As an API consumer, I want collection responses wrapped consistently. | Given a collection endpoint succeeds, then response contains top-level `data` and `meta`. |
| OPS-002-US-002 | Include pagination metadata | High | As a frontend developer, I want pagination metadata for bounded lists. | Given a collection endpoint responds, then `meta` includes `limit`, `offset`, `total`, and `sort`. |
| OPS-002-US-003 | Bound collection limits | High | As an operator, I want collection requests bounded. | Given a collection request includes `limit` above the maximum, then validation rejects or clamps according to documented API rules. |
| OPS-002-US-004 | Preserve empty envelope | Medium | As a frontend developer, I want empty states simple. | Given no rows match, then `data` is `[]` and `meta.total` is `0`. |
| OPS-002-US-005 | Preserve sort metadata | Medium | As QA, I want ordering behavior verifiable. | Given sorting is applied, then `meta.sort` identifies the applied sort. |
| OPS-002-US-006 | Stable pagination ordering | High | As QA, I want pagination deterministic. | Given consecutive pages are requested without data changes, then items are not duplicated or skipped across pages. |
| OPS-002-US-007 | Invalid pagination rejected | Medium | As an API consumer, I want bad pagination rejected safely. | Given invalid `limit` or `offset` is supplied, then API returns structured validation error without internal details. |
| OPS-002-US-008 | Pagination logs include safe query metadata | Medium | As an operator, I want slow collection requests diagnosable. | Given a collection request is logged, then logs include route, request id, limit, offset, sort, duration, and status without user secrets or private payloads. |
| OPS-002-US-009 | Collection performance threshold | High | As an operator, I want bounded lists to stay performant. | Given a collection endpoint runs under expected beta load, then p95 response time is below `1000ms` unless documented as a known exception. |
| OPS-002-US-010 | Slow collection query visibility | Medium | As an SRE, I want slow queries detectable. | Given a collection request exceeds the slow-query threshold, then structured logs or metrics identify route, duration, and request id without sensitive data. |
| OPS-002-US-011 | Envelope contract tests | High | As QA, I want envelope regressions caught. | Given API contract tests run, then collection endpoints validate `data`, `meta.limit`, `meta.offset`, `meta.total`, and `meta.sort`. |
| OPS-002-US-012 | Envelope naming consistency | High | As an architect, I want collection naming consistent. | Given API docs and story packages reference collection envelopes, then any `items/meta` wording must be reconciled to the backend standard `{data, meta}` or documented as a deliberate exception. |

Story Count: 12

Coverage Assessment: Covers envelope shape, pagination, bounds, empty responses, sorting, deterministic pages, invalid input, safe logging, performance, slow-query visibility, contract tests, and naming consistency.

Missing Assumptions: None.

Risks: High performance and contract risk if collection endpoints return raw or inconsistent unbounded arrays.

### OPS-003 - Structured error contract

Feature Description: Backend APIs return structured errors, safe logs, request correlation, and security-safe error behavior.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| OPS-003-US-001 | Return structured API errors | Critical | As a frontend developer, I want consistent error responses. | Given an API request fails, then response includes structured fields `code`, `message`, `details`, and `requestId` where applicable. |
| OPS-003-US-002 | Map validation errors | High | As a user, I want validation errors understandable. | Given invalid input is submitted, then API returns validation status with safe field-level details and no stack trace. |
| OPS-003-US-003 | Preserve HTTP status semantics | High | As an API consumer, I want status codes meaningful. | Given validation, auth, forbidden, not-found, conflict, or server errors occur, then HTTP status matches the documented error class. |
| OPS-003-US-004 | Avoid sensitive error leakage | Critical | As a security reviewer, I want errors safe. | Given any failure occurs, then responses never include secrets, passwords, tokens, cookies, refresh tokens, database URLs, stack traces, private notes, or raw private payloads. |
| OPS-003-US-005 | Frontend fallback messages | Medium | As a user, I want unknown errors understandable. | Given the frontend receives an unexpected error shape, then a safe fallback message appears and no raw exception is shown. |
| OPS-003-US-006 | Generate request ID | Critical | As an operator, I want every request traceable. | Given a request enters the backend, then a request id is created or propagated and included in logs and error responses where safe. |
| OPS-003-US-007 | Propagate correlation ID | High | As an SRE, I want cross-service correlation. | Given a client supplies an approved correlation id header, then backend propagates it to structured logs and safe response metadata where appropriate. |
| OPS-003-US-008 | Structured logging format | Critical | As an SRE, I want machine-readable logs. | Given the backend logs a request or error, then logs are structured and include timestamp, level, service, environment, request id, route, status, duration, and error code where applicable. |
| OPS-003-US-009 | Redact secrets from logs | Critical | As a security architect, I want logs free of credentials. | Given logs are produced, then passwords, access tokens, refresh tokens, cookies, API keys, database URLs, auth headers, and private notes are redacted or omitted. |
| OPS-003-US-010 | PII handling in logs | Critical | As a security architect, I want personal data minimized. | Given logs are produced, then emails and display names are omitted, hashed, or minimized unless explicitly required for an approved audit event. |
| OPS-003-US-011 | Error metrics emitted | High | As an SRE, I want error rate observable. | Given API responses return `4xx` or `5xx`, then metrics count responses by route, method, status class, and error code without sensitive labels. |
| OPS-003-US-012 | Elevated 5xx alert | Critical | As an operator, I want server error spikes detected. | Given `5xx` rate exceeds `1%` over 15 minutes, then an alert is triggered for investigation. |
| OPS-003-US-013 | Authentication failure spike alert | High | As a security operator, I want auth abuse visible. | Given authentication failures spike above baseline or configured threshold, then a security/operations alert is triggered. |
| OPS-003-US-014 | Rate-limit spike alert | High | As a security operator, I want rate-limit abuse visible. | Given auth rate-limit responses spike above configured threshold, then an alert is triggered without exposing user credentials. |
| OPS-003-US-015 | Trace slow requests | Medium | As an SRE, I want latency issues diagnosable. | Given a request exceeds the slow-request threshold, then logs or traces capture route, duration, request id, and dependency timing without sensitive data. |
| OPS-003-US-016 | Error taxonomy documented | High | As QA, I want testable error codes. | Given error contract tests run, then expected error codes for validation, unauthorized, forbidden, not found, conflict, rate-limited, and internal errors are verified. |
| OPS-003-US-017 | Client error display safe | Medium | As a user, I want useful but safe errors. | Given frontend displays an API error, then user-facing copy is concise and never renders raw server internals. |
| OPS-003-US-018 | Audit security-sensitive events | High | As a security architect, I want sensitive events auditable. | Given login failure spikes, token reuse detection, rate-limit spikes, migration actions, or destructive operations occur, then an audit event is recorded with safe metadata. |

Story Count: 18

Coverage Assessment: Covers structured error schema, validation/status mapping, safe responses, request/correlation ids, structured logging, redaction, PII handling, error metrics, 5xx/auth/rate-limit alerts, slow request traces, taxonomy tests, safe frontend display, and audit logging.

Missing Assumptions: None.

Risks: Critical observability and security risk if errors/logs cannot be correlated or leak secrets.

### OPS-004 - Backend liveness check

Feature Description: Backend exposes `/health/live` for lightweight liveness monitoring.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| OPS-004-US-001 | Expose liveness endpoint | Critical | As an operator, I want liveness monitoring. | Given the API process is running, when `GET /health/live` is called, then it returns `200 OK`. |
| OPS-004-US-002 | Keep liveness lightweight | High | As an operator, I want liveness cheap. | Given `/health/live` is called, then it does not perform database, migration, or external dependency checks. |
| OPS-004-US-003 | Define live response schema | High | As an operator, I want monitors to parse liveness. | Given `/health/live` returns `200 OK`, then payload includes `status`, `service`, `environment`, `timestamp`, and `requestId` where available. |
| OPS-004-US-004 | Liveness status value | Medium | As an operator, I want consistent status. | Given the process is live, then `status` is `ok`. |
| OPS-004-US-005 | No auth required for liveness | High | As infrastructure, I want unauthenticated health checks. | Given no credentials are provided, when `/health/live` is called, then it responds without user auth. |
| OPS-004-US-006 | No private data in liveness | Critical | As a security reviewer, I want health safe. | Given `/health/live` responds, then it does not include user data, tokens, cookies, secrets, database URLs, or private environment values. |
| OPS-004-US-007 | Liveness latency threshold | High | As an SRE, I want health checks fast. | Given `/health/live` is called under normal operation, then p95 latency is below `250ms`. |
| OPS-004-US-008 | Liveness metrics emitted | Medium | As an SRE, I want liveness observable. | Given `/health/live` is called, then health metrics record status, latency, and service without sensitive labels. |
| OPS-004-US-009 | Liveness failure alert | High | As an operator, I want dead process detected. | Given liveness fails repeatedly according to hosting/monitoring policy, then a deployment/service alert is triggered. |
| OPS-004-US-010 | Liveness does not mask readiness failure | High | As an operator, I want live and ready distinct. | Given database is unavailable but process is running, then `/health/live` may return `200 OK` while `/health/ready` fails or reports not ready. |
| OPS-004-US-011 | Liveness deployment marker correlation | Medium | As an SRE, I want health tied to deployments. | Given a new deployment starts serving, then health logs/metrics include a deployment marker or version identifier when available. |
| OPS-004-US-012 | Liveness tests | High | As QA, I want liveness regressions caught. | Given health tests run, then `/health/live` response status, schema, no-auth behavior, and private-data exclusion are verified. |

Story Count: 12

Coverage Assessment: Covers endpoint, lightweight behavior, schema, auth, private-data exclusion, latency, metrics, alerts, live-vs-ready distinction, deployment markers, and tests.

Missing Assumptions: None.

Risks: High deployment risk if liveness is slow, protected, or conflated with readiness.

### OPS-005 - Backend readiness check

Feature Description: Backend exposes `/health/ready` to verify API, database, migration revision, and schema compatibility readiness.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| OPS-005-US-001 | Expose readiness endpoint | Critical | As an operator, I want readiness monitoring. | Given API, database, and schema are ready, when `GET /health/ready` is called, then it returns `200 OK`. |
| OPS-005-US-002 | Define ready response schema | Critical | As an operator, I want readiness parseable. | Given `/health/ready` responds, then payload includes `status`, `service`, `environment`, `timestamp`, `requestId`, and `checks`. |
| OPS-005-US-003 | Report database dependency | Critical | As an operator, I want DB readiness visible. | Given readiness runs, then `checks.database.status` reports `ok`, `degraded`, or `fail`. |
| OPS-005-US-004 | Check database connectivity | Critical | As an operator, I want broken DB connections detected. | Given the database is unavailable, when `/health/ready` is called, then readiness does not return healthy `ok` and does not expose credentials. |
| OPS-005-US-005 | Validate expected migration revision | Critical | As an operator, I want schema readiness verified. | Given the app has an expected Alembic revision, when readiness runs, then it verifies the live database revision matches the expected revision. |
| OPS-005-US-006 | Validate schema compatibility | Critical | As an operator, I want incompatible schema detected. | Given schema compatibility check fails, then readiness reports not ready and traffic should not be considered safe. |
| OPS-005-US-007 | Migration mismatch behavior | Critical | As an operator, I want migration mismatch safe. | Given live migration revision differs from expected revision, then readiness returns a non-ready status and includes safe mismatch status without exposing connection details. |
| OPS-005-US-008 | Degraded readiness state | High | As an operator, I want partial failures visible. | Given a dependency is slow or partially failing, then readiness reports `degraded` where supported and does not claim full readiness. |
| OPS-005-US-009 | Readiness latency threshold | High | As an SRE, I want readiness fast enough for deploy checks. | Given dependencies are healthy, then `/health/ready` p95 latency is below `500ms`. |
| OPS-005-US-010 | Readiness timeout | High | As an operator, I want readiness checks not to hang. | Given database check exceeds configured timeout, then readiness fails fast with safe error status. |
| OPS-005-US-011 | No auth required for readiness | High | As infrastructure, I want readiness checks unauthenticated. | Given no credentials are provided, when `/health/ready` is called, then it responds without user auth. |
| OPS-005-US-012 | Safe readiness failure payload | Critical | As a security reviewer, I want dependency failures safe. | Given readiness fails, then response does not include database credentials, connection strings, secrets, stack traces, tokens, or private data. |
| OPS-005-US-013 | Readiness metrics emitted | High | As an SRE, I want readiness observable. | Given readiness is called, then metrics record status, latency, dependency status, and migration status without sensitive labels. |
| OPS-005-US-014 | Readiness failure alert | Critical | As an operator, I want readiness outages detected. | Given readiness fails or reports degraded beyond configured threshold, then an alert is triggered. |
| OPS-005-US-015 | Database connectivity alert | Critical | As an operator, I want DB outages detected. | Given database connectivity fails in readiness, then a database connectivity alert is triggered. |
| OPS-005-US-016 | Readiness deployment gate | Critical | As a release owner, I want deploys blocked until ready. | Given a deployment completes, then release validation must not pass until `/health/ready` returns ready for the deployed revision. |
| OPS-005-US-017 | Readiness tests | High | As QA, I want readiness regressions caught. | Given health tests run, then database success, database failure, migration mismatch, safe payload, and no-auth behavior are verified. |
| OPS-005-US-018 | Live and ready semantics documented | Medium | As an operator, I want health semantics clear. | Given runbooks/docs are reviewed, then `/health/live` means process liveness and `/health/ready` means dependency/schema readiness. |

Story Count: 18

Coverage Assessment: Covers readiness endpoint, schema, DB dependency, migration revision, schema compatibility, mismatch behavior, degraded state, latency, timeout, no-auth, safe payload, metrics, alerts, deploy gate, tests, and semantics.

Missing Assumptions: None.

Risks: Critical deployment risk if readiness passes with broken database or mismatched schema.

### OPS-006 - Frontend health page/JSON

Feature Description: Frontend exposes `/health` and `/api/health` for frontend health verification.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| OPS-006-US-001 | Expose frontend health page | High | As an operator, I want a frontend health page. | Given the frontend is running, when `/health` is requested, then it returns `200 OK` and a human-readable frontend health status without private data. |
| OPS-006-US-002 | Expose frontend health JSON | High | As an operator, I want JSON frontend health. | Given the frontend is running, when `/api/health` is requested, then it returns JSON health data. |
| OPS-006-US-003 | Define frontend health schema | High | As an operator, I want health parseable. | Given `/api/health` returns success, then payload includes `status`, `service`, `environment`, `timestamp`, and deployment marker/version when available. |
| OPS-006-US-004 | Include frontend service id | Medium | As an operator, I want the frontend service identified. | Given `/api/health` responds, then it includes service identity `sijil-frontend`. |
| OPS-006-US-005 | No auth required for frontend health | High | As infrastructure, I want frontend health unauthenticated. | Given no credentials are provided, when frontend health endpoints are called, then they respond. |
| OPS-006-US-006 | Avoid private data in health | Critical | As a security reviewer, I want health safe. | Given frontend health responds, then it does not include user data, tokens, cookies, auth state, environment secrets, or private configuration. |
| OPS-006-US-007 | Frontend health independence | Medium | As an operator, I want frontend liveness independent from backend readiness. | Given backend API is unavailable, then frontend `/api/health` may still report frontend process health while optionally reporting backend dependency separately if implemented. |
| OPS-006-US-008 | Frontend health latency | Medium | As an SRE, I want frontend health fast. | Given `/api/health` is called under normal operation, then p95 latency is below `250ms`. |
| OPS-006-US-009 | Frontend health deployment gate | High | As a release owner, I want web deploys validated. | Given frontend deploy completes, then release validation checks frontend health before declaring deploy successful. |
| OPS-006-US-010 | Frontend health tests | High | As QA, I want frontend health regressions caught. | Given health E2E tests run, then `/health` and `/api/health` status, schema, service id, and private-data exclusion are verified. |

Story Count: 10

Coverage Assessment: Covers frontend page/JSON health, schema, service id, unauthenticated access, private-data exclusion, backend dependency policy, latency, deployment gate, and tests.

Missing Assumptions: None.

Risks: Medium deployment verification risk if frontend health does not prove the web service is serving the expected build.

### OPS-007 - Alembic schema evolution

Feature Description: Backend database schema evolves through Alembic migrations with backup, validation, deployment safety, and rollback/forward-fix controls.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| OPS-007-US-001 | Apply schema migrations | Critical | As an operator, I want repeatable schema changes. | Given a new migration exists, when deployment migration step runs, then the database reaches the expected Alembic revision. |
| OPS-007-US-002 | Preserve existing data | Critical | As a data owner, I want migrations to preserve data. | Given production data exists, when a non-destructive migration runs, then user, list, place, rating, and list item data remain intact unless an explicitly approved destructive task exists. |
| OPS-007-US-003 | Production backup before migration | Critical | As an operator, I want a backup before production migration. | Given a production migration is planned, then a current production backup exists before migration starts. |
| OPS-007-US-004 | Backup metadata captured | High | As an operator, I want backups auditable. | Given a pre-migration backup is created, then backup id/location, timestamp, environment, database identifier, and migration target revision are recorded without exposing credentials. |
| OPS-007-US-005 | Restore validation required | Critical | As an operator, I want backups proven. | Given a backup is created, then it is not considered valid until restore validation succeeds in an approved non-production restore target or equivalent verified restore process. |
| OPS-007-US-006 | Restore validation checks data integrity | Critical | As a data owner, I want restored data verified. | Given restore validation runs, then table existence, migration revision, row-count sanity, and representative data integrity checks pass. |
| OPS-007-US-007 | Validate migration order | High | As a backend engineer, I want clean upgrades. | Given migrations are applied from a clean database, then Alembic upgrades to head without revision gaps. |
| OPS-007-US-008 | Validate migration on PostgreSQL | High | As QA, I want migration validation realistic. | Given CI migration validation runs, then migrations are applied against PostgreSQL or a production-compatible database engine. |
| OPS-007-US-009 | Validate downgrade path when provided | Medium | As a backend engineer, I want rollback behavior understood. | Given a migration includes downgrade logic, then downgrade is syntactically valid and reviewed for data-loss risk. |
| OPS-007-US-010 | No destructive deployment reset | Critical | As an operator, I want live data protected. | Given deployment runs migrations, then it does not drop tables, truncate data, reset schema, or wipe rows unless an explicitly approved destructive operation exists. |
| OPS-007-US-011 | Migration timeout | High | As an operator, I want migrations not to hang. | Given a migration exceeds the configured deployment timeout, then deployment fails safely and does not proceed as successful. |
| OPS-007-US-012 | Migration failure alert | Critical | As an operator, I want migration failures detected. | Given a migration fails in beta or production, then an alert is triggered and release is marked failed. |
| OPS-007-US-013 | Migration deployment marker | Medium | As an SRE, I want migration events traceable. | Given a migration starts/completes/fails, then structured logs include environment, target revision, previous revision, request/job id, and deployment marker without secrets. |
| OPS-007-US-014 | Migration readiness integration | Critical | As an operator, I want readiness tied to schema. | Given migration completes, then `/health/ready` validates expected revision before deployment is accepted. |
| OPS-007-US-015 | Rollback criteria | Critical | As a release owner, I want rollback criteria explicit. | Given deployment causes health failure, elevated `5xx`, migration mismatch, auth breakage, or core flow outage, then rollback or forward-fix decision is required. |
| OPS-007-US-016 | Rollback restrictions | Critical | As a data owner, I want rollback not to corrupt data. | Given a migration changed schema/data, then application rollback is allowed only if schema compatibility is confirmed; destructive database downgrade is prohibited unless explicitly approved. |
| OPS-007-US-017 | Forward-fix policy | High | As an operator, I want safe recovery when rollback is unsafe. | Given rollback is unsafe due to schema/data changes, then forward-fix is the default recovery path with targeted validation. |
| OPS-007-US-018 | Rollback verification | High | As QA, I want rollback proven. | Given rollback or forward-fix completes, then health, readiness, migration revision, and core smoke tests pass before incident is closed. |
| OPS-007-US-019 | Environment separation for migrations | High | As an operator, I want environment behavior explicit. | Given migrations run in local/test/beta/production, then local/test may use fixtures, beta/production use real DB safeguards, and production requires backup plus release approval. |
| OPS-007-US-020 | Live test data policy | High | As an operator, I want production verification clean. | Given beta/production verification creates data with explicit approval, then records are documented, cleaned up when safe, and cleanup is auditable. |
| OPS-007-US-021 | Destructive operation approval | Critical | As a data owner, I want destructive operations controlled. | Given any operation can delete production data, then explicit approval, backup, scope statement, and post-operation validation are required. |
| OPS-007-US-022 | Migration success SLI | High | As an SRE, I want migration reliability measured. | Given migrations run, then success/failure, duration, target revision, and environment are tracked as migration SLIs. |
| OPS-007-US-023 | Migration CI gate | Critical | As a release owner, I want broken migrations blocked. | Given CI runs, then migration validation must pass before release can proceed. |
| OPS-007-US-024 | Migration evidence retained | Medium | As an auditor, I want release evidence. | Given a production migration runs, then backup proof, validation result, target revision, deployment id, and operator/release owner are retained. |

Story Count: 24

Coverage Assessment: Covers migration application, data preservation, backups, restore validation, PostgreSQL validation, no destructive resets, timeouts, alerts, deployment markers, readiness integration, rollback criteria/restrictions, forward-fix, rollback verification, environment separation, live test data, destructive approvals, SLIs, CI gates, and evidence retention.

Missing Assumptions: None.

Risks: Critical data-loss and release risk if migrations run without backup, restore validation, readiness revision checks, or rollback/forward-fix policy.

## Developer / QA Capabilities

### QA-001 - Auth lifecycle coverage

Feature Description: Backend tests cover authentication lifecycle behavior.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| QA-001-US-001 | Test registration | Critical | As QA, I want registration covered. | Given backend tests run, then valid registration, display-name validation, email normalization, duplicate email, and password validation are covered. |
| QA-001-US-002 | Test login | Critical | As QA, I want login covered. | Given auth tests run, then valid credentials, invalid credentials, safe errors, and rate-limit behavior are tested. |
| QA-001-US-003 | Test refresh token flow | Critical | As QA, I want refresh secure. | Given auth tests run, then HttpOnly cookie refresh, rotation, expiry, reuse detection, and no localStorage refresh-token behavior are covered. |
| QA-001-US-004 | Test logout and revocation | High | As QA, I want logout reliable. | Given auth tests run, then token revocation, cookie clearing, and refresh rejection after logout are verified. |
| QA-001-US-005 | Test auth rate limiting | High | As QA, I want brute-force protection covered. | Given repeated auth requests exceed threshold, then API returns `429` and `RATE_LIMITED`. |
| QA-001-US-006 | Test protected routes/APIs | Critical | As QA, I want unauthorized access blocked. | Given unauthenticated requests target protected APIs, then `401` behavior and no private data exposure are verified. |
| QA-001-US-007 | Test token redaction | Critical | As security QA, I want tokens absent from logs/errors. | Given auth tests exercise failures, then response payloads and captured logs do not include passwords, tokens, cookies, or secrets. |
| QA-001-US-008 | Test multi-tab/session behavior where applicable | Medium | As QA, I want session coordination stable. | Given frontend auth E2E runs, then multi-tab logout/refresh coordination is covered where implemented. |
| QA-001-US-009 | Auth tests are CI gates | Critical | As a release owner, I want auth regressions blocked. | Given CI runs, then auth lifecycle tests must pass before merge/release. |
| QA-001-US-010 | Auth test evidence retained | Medium | As an auditor, I want auth validation evidence. | Given release validation runs, then auth test status and commit SHA are retained in CI/release records. |

Story Count: 10

Coverage Assessment: Covers registration, login, refresh, logout, rate limiting, protected access, redaction, session behavior, CI gating, and evidence retention.

Missing Assumptions: None.

Risks: Critical security risk if auth lifecycle tests are weakened, skipped, or not release-gated.

### QA-002 - Places/lists API coverage

Feature Description: Backend tests cover Places and Lists API behavior.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| QA-002-US-001 | Test place creation and duplicates | Critical | As QA, I want catalog integrity tested. | Given place tests run, then valid creation, duplicate normalized-name rejection, and concurrent duplicate behavior are covered. |
| QA-002-US-002 | Test place taxonomy | High | As QA, I want taxonomy rules enforced. | Given place tests run, then restaurant, cafe, and ice cream subtype requirements and invalid combinations are verified. |
| QA-002-US-003 | Test places search/filter/sort | High | As QA, I want browsing correctness tested. | Given place API tests run, then search, diacritic folding, primary type filters, subtype filters, rating sort, tie-breaks, and pagination are covered. |
| QA-002-US-004 | Test list CRUD | Critical | As QA, I want list management reliable. | Given list API tests run, then create, detail, update, visibility, and delete flows are covered. |
| QA-002-US-005 | Test add/remove list items | Critical | As QA, I want membership rules tested. | Given list item tests run, then add, duplicate prevention, idempotent behavior, server-side search, and removal are covered. |
| QA-002-US-006 | Test list authorization | Critical | As QA, I want owner-only list access protected. | Given list API tests run, then non-owner access and mutation attempts are denied. |
| QA-002-US-007 | Test list data integrity | High | As QA, I want deletes safe. | Given list deletion tests run, then list items are removed while places, ratings, and users remain intact. |
| QA-002-US-008 | Test collection envelope | High | As QA, I want collection contracts stable. | Given places/lists collection tests run, then `{data, meta}` shape and pagination metadata are verified. |
| QA-002-US-009 | Places/lists tests are CI gates | Critical | As a release owner, I want core data regressions blocked. | Given CI runs, then places/lists API tests must pass before merge/release. |
| QA-002-US-010 | Places/lists test evidence retained | Medium | As an auditor, I want validation evidence. | Given release validation runs, then places/lists test status and commit SHA are retained. |

Story Count: 10

Coverage Assessment: Covers places, duplicates, taxonomy, search/filter/sort/pagination, list CRUD, list items, authorization, integrity, envelope, CI gate, and evidence.

Missing Assumptions: None.

Risks: High product and data-integrity risk if places/lists tests are missing, flaky, or advisory only.

### QA-003 - Ratings/profile/public-list coverage

Feature Description: Backend tests cover ratings, profile, and public-list authorization.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| QA-003-US-001 | Test rating create/update semantics | Critical | As QA, I want rating lifecycle tested. | Given rating tests run, then `POST` create/upsert status semantics and `PATCH` update semantics are verified. |
| QA-003-US-002 | Test rating validation | Critical | As QA, I want rating values constrained. | Given rating tests run, then valid `0.5` increments and invalid values are verified. |
| QA-003-US-003 | Test rating/list independence | Critical | As QA, I want rating/list independence correct. | Given rating tests run, then rating create/edit does not add or remove list membership. |
| QA-003-US-004 | Test notes privacy | Critical | As QA, I want private notes protected. | Given profile/public place/list tests run, then only the rating owner can see notes and public surfaces never expose notes. |
| QA-003-US-005 | Test profile statistics | High | As QA, I want profile stats accurate. | Given profile tests run, then list count, ratings count, and tried counts by type are verified. |
| QA-003-US-006 | Test profile canonical archive | High | As QA, I want no duplicate tried archive. | Given profile tests run, then `userRatings` is canonical and `triedPlaces` does not appear. |
| QA-003-US-007 | Test public list owner display | High | As QA, I want public identity safe. | Given public-list tests run, then `ownerDisplayName` appears and email/internal user ID are not exposed. |
| QA-003-US-008 | Test public/private authorization | Critical | As QA, I want public/private list privacy protected. | Given public-list tests run, then guests receive `401`, private public-route access returns safe `404`, and non-owner mutations are denied. |
| QA-003-US-009 | Ratings/profile/public tests are CI gates | Critical | As a release owner, I want privacy regressions blocked. | Given CI runs, then ratings/profile/public-list tests must pass before merge/release. |
| QA-003-US-010 | Ratings/profile/public evidence retained | Medium | As an auditor, I want validation evidence. | Given release validation runs, then test status and commit SHA are retained. |

Story Count: 10

Coverage Assessment: Covers rating status semantics, validation, tried side effects, notes privacy, profile stats/archive, public owner identity, public/private authorization, CI gating, and evidence.

Missing Assumptions: None.

Risks: Critical privacy and business-rule risk if these tests fail, are skipped, or do not gate release.

### QA-004 - App regression flow

Feature Description: Frontend E2E tests, release gates, operational smoke tests, and release evidence cover real application regression flows.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| QA-004-US-001 | Define required CI gates | Critical | As a release owner, I want required checks explicit. | Given a release candidate is prepared, then backend `ruff`, `mypy`, `pytest`, frontend `lint`, `typecheck`, `build`, required Playwright suite, migration validation, and operational smoke test must pass. |
| QA-004-US-002 | Test auth gating E2E | Critical | As QA, I want browser auth gating tested. | Given required E2E runs, then protected pages show sign-in prompts for guests and do not flash private data. |
| QA-004-US-003 | Test real app smoke flow | Critical | As QA, I want core frontend/API integration tested. | Given required E2E runs, then register, login/session, create place, create list, add/remove, rating, profile, and public list flows are covered when they are part of the release gate. |
| QA-004-US-004 | Test responsive layout | High | As QA, I want responsive regressions caught. | Given responsive E2E runs, then required viewports, 200% pressure, no-overflow assertions, and bottom-nav safety pass. |
| QA-004-US-005 | Test frontend health | Medium | As QA, I want frontend health verified. | Given health tests run, then frontend shell, `/health`, and `/api/health` respond with expected schema. |
| QA-004-US-006 | Avoid mock-only confidence for critical flows | High | As QA, I want contract drift caught. | Given regression E2E runs, then critical auth/list/place/rating/profile/public-list flows use real API behavior where required by the release gate. |
| QA-004-US-007 | Keep CI host alignment stable | High | As QA, I want cookie auth stable in CI. | Given CI E2E runs, then frontend and API use the same host family, specifically `localhost` alignment where cookie/refresh flows require it. |
| QA-004-US-008 | PostgreSQL-backed migration validation | Critical | As QA, I want database validation realistic. | Given CI runs, then migrations are validated against PostgreSQL or a production-compatible configured database service. |
| QA-004-US-009 | Security/dependency scanning gate | High | As a security owner, I want vulnerable dependencies blocked. | Given CI runs, then npm and Python dependency/security scans execute and fail release on configured high/critical findings unless explicitly waived. |
| QA-004-US-010 | Production configuration validation | Critical | As an operator, I want insecure config blocked. | Given release validation runs, then required env vars, CORS, HTTPS cookie settings, refresh-cookie settings, API base URL, and database URL presence are validated without printing secrets. |
| QA-004-US-011 | Deployment marker recorded | High | As an SRE, I want deployments traceable. | Given deployment starts and completes, then logs/metrics record deployment id, commit SHA, service, environment, start/end status, and timestamp. |
| QA-004-US-012 | Deployment failure alert | Critical | As an operator, I want failed deploys detected. | Given a deployment fails or does not become ready within the deployment validation window, then a deployment failure alert is triggered. |
| QA-004-US-013 | Post-deploy smoke test | Critical | As a release owner, I want live deploy verified. | Given deployment completes, then read-only health, readiness, frontend load, login-safe checks, and approved smoke checks pass before release is accepted. |
| QA-004-US-014 | Live test data cleanup | Critical | As a data owner, I want production clean after verification. | Given production verification creates data with approval, then test records are named/traceable, backed up if needed, deleted when safe, and cleanup evidence is retained. |
| QA-004-US-015 | No unapproved live mutations | Critical | As an operator, I want production data protected. | Given a release validation does not have explicit mutation approval, then it performs read-only checks only and creates no users, lists, places, ratings, or list items. |
| QA-004-US-016 | Flaky-test policy | High | As QA, I want CI reliability. | Given a required test is flaky, then it is not ignored silently; owner, failure evidence, retry policy, and fix/waiver decision are documented before release. |
| QA-004-US-017 | Evidence retention | High | As an auditor, I want release sign-off traceable. | Given release gates run, then commit SHA, branch, check statuses, migration result, health result, smoke result, and approver/release owner are retained. |
| QA-004-US-018 | Traceability to requirements | Medium | As QA, I want coverage mapped to requirements. | Given release evidence is reviewed, then required checks map to feature IDs or story packages where applicable. |
| QA-004-US-019 | Incident severity classification | High | As an operator, I want incidents triaged consistently. | Given a production issue is detected, then severity is assigned based on user impact, data risk, auth/security risk, and availability. |
| QA-004-US-020 | Incident response workflow | High | As an SRE, I want incidents handled consistently. | Given an incident is declared, then owner, timeline, mitigation, customer/data impact, rollback/forward-fix decision, and post-incident review are documented. |

Story Count: 20

Coverage Assessment: Covers explicit CI gates, E2E/auth/responsive/health tests, real API coverage, CI host alignment, PostgreSQL migration validation, dependency/security scanning, config validation, deployment markers, deploy alerts, post-deploy smoke, live data cleanup/no mutation policy, flaky-test policy, evidence retention, traceability, and incident handling.

Missing Assumptions: None.

Risks: Critical release risk if required checks, deployment validation, live data policy, or incident workflow are not enforced.

## Module Summary

Total Features Processed: 11

Total User Stories Generated: 152

Features With Highest Complexity:

- `OPS-007` - migration safety, backups, restore validation, rollback/forward-fix, environment separation, live data controls.
- `QA-004` - release gates, CI evidence, deployment validation, security scanning, smoke tests, incident workflow.
- `OPS-005` - readiness, database, migration revision, schema compatibility, degraded state, alerts.
- `OPS-003` - structured errors, logging, request/correlation IDs, redaction, metrics, alerts, auditability.
- `OPS-002` - collection envelope, pagination, sorting, performance, contract consistency.

Features With Highest Business Risk:

- `OPS-007` - data-loss and migration failure risk.
- `QA-004` - unsafe release/deployment risk.
- `OPS-005` - readiness false-positive risk.
- `OPS-003` - secret leakage and observability failure risk.
- `QA-001` - authentication regression risk.
- `QA-003` - privacy and ratings/profile/public-list regression risk.

Recommended QA Priority Order:

1. `OPS-007`
2. `QA-004`
3. `OPS-005`
4. `OPS-003`
5. `QA-001`
6. `QA-003`
7. `QA-002`
8. `OPS-002`
9. `OPS-004`
10. `OPS-006`
11. `OPS-001`

Coverage Assessment:

- Covered: API versioning, collection envelopes, pagination, structured errors, request IDs, correlation IDs, structured logging, log redaction, PII handling, metrics, health metrics, error metrics, deployment markers, auditability, alerting categories, backend liveness/readiness, readiness migration revision and schema compatibility, frontend health, Alembic migrations, production backup before migration, restore validation, rollback criteria/restrictions, forward-fix policy, environment separation, live test data policy, required CI checks, dependency/security scanning, production config validation, post-deploy smoke, flaky-test policy, evidence retention, incident handling, backend auth tests, places/lists tests, ratings/profile/public-list tests, and frontend E2E regression flow.
- Not included: paid external observability vendor selection, on-call staffing schedule, billing operations, enterprise compliance certifications, public status page, or non-current admin tooling because they are outside current `OPS-*` and `QA-*` feature catalog scope.

Resolved Operational Decisions:

- Production observability requires structured logging, request IDs, correlation IDs, metrics, health metrics, error metrics, and deployment markers.
- Mandatory alerts cover readiness failures, elevated `5xx`, authentication failure spikes, rate-limit spikes, database connectivity failures, migration failures, and deployment failures.
- A production backup must exist before any production migration.
- Backups are not valid until restore validation succeeds.
- Production release gates are mandatory and include backend, frontend, Playwright, database, and operational checks.
- Rollback policy defines criteria, restrictions, forward-fix policy, and verification.
- Production verification must not leave test data behind unless explicitly approved, traceable, and cleaned up.
- `/health/live` and `/health/ready` require explicit response contracts, dependency reporting, readiness behavior, and degraded behavior.
- Readiness validates expected migration revision, schema compatibility, and migration mismatch handling.
- Environment separation is explicit for local, test, beta, and production.

Open Product / Engineering Questions:

- None.
