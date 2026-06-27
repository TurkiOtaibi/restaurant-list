# EDR-004: Request ID And Structured Logging

## Status

Approved

## Decision

Request identifier behavior:

- Header name: `X-Request-ID`
- If supplied by the caller, reuse it
- If absent, generate it
- Return it in responses
- Use the same identifier for request correlation in the MVP
- Do not introduce a separate correlation ID in the MVP

Structured logging:

- Logs are JSON only
- Required log fields:
  - `timestamp`
  - `level`
  - `requestId`
  - `userId`
  - `path`
  - `method`
  - `status`
  - `durationMs`
  - `errorCode`

## Applies To

Request correlation tests, structured logging tests, system operations RTM mappings, automation catalog entries, smoke coverage, and regression coverage.

