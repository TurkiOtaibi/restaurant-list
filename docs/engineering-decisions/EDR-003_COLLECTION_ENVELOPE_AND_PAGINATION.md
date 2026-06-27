# EDR-003: Collection Envelope And Pagination

## Status

Approved

## Decision

Collection API responses use:

- `data`
- `meta`

`meta` contains only:

- `limit`
- `offset`
- `total`
- `sort`

Pagination:

- Default `limit`: `20`
- Maximum `limit`: `100`
- Requests above maximum return `422` with `error.code = "VALIDATION_ERROR"`
- Requests above maximum are not silently clamped

No undocumented metadata fields are allowed in collection response envelopes.

## Applies To

Documented collection API user stories, collection pagination tests, RTM collection mappings, smoke coverage, regression coverage, and API automation.

