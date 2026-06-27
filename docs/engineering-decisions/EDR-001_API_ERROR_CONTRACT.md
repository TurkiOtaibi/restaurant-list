# EDR-001: API Error Contract

## Status

Approved

## Decision

All API error responses use one standardized error envelope:

```json
{
  "error": {
    "code": "LIST_NOT_FOUND",
    "message": "The requested list was not found.",
    "details": {},
    "requestId": "req_xxxxx"
  }
}
```

Required fields:

- `error.code`
- `error.message`
- `error.requestId`

Optional fields:

- `error.details`

Forbidden fields and values:

- stack traces
- SQL errors
- internal exceptions
- debug payloads
- secrets

Error codes use `UPPER_SNAKE_CASE`. Frontend logic and automation must branch on `error.code`; they must not parse `error.message`.

## Applies To

All documented API error contracts, executable API error tests, RTM error mappings, smoke coverage, regression coverage, and automation catalog entries.

