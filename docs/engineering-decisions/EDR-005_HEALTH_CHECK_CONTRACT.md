# EDR-005: Health Check Contract

## Status

Approved

## Decision

Liveness:

- Purpose: process alive only
- Does not check database, Redis, queues, or external services
- Healthy process returns `200`
- Dead process has no response because the process is unavailable

Readiness:

- Purpose: traffic readiness
- Ready state returns `200`
- Not-ready state returns `503`
- No degraded readiness mode exists in the MVP

## Applies To

System Operations liveness and readiness user stories, health check test cases, RTM health mappings, smoke coverage, regression coverage, and operations automation.

