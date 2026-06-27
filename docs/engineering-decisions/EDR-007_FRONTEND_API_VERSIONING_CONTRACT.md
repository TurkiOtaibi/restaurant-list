# EDR-007: Frontend API Versioning Contract

## Status

Approved

## Decision

Frontend API client versioning behavior:

- Unversioned application API paths are sent to `/api/v1/...`
- Already-versioned `/api/v1/...` paths are not double-prefixed
- Unsupported API version paths return an API error response using EDR-001
- Unsupported version error response uses HTTP `404`
- Unsupported version error code is `NOT_FOUND`

Future API version deprecation policy is not part of the MVP contract. It remains traceability-only until a future product decision defines `/api/v2` lifecycle behavior.

## Applies To

System Operations API base path/versioning tests, RTM mappings, automation catalog entries, smoke coverage, and regression coverage.

