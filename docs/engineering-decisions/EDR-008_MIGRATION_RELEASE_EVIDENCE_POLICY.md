# EDR-008: Migration And Release Evidence Policy

## Status

Approved

## Decision

Migration, backup, restore, deployment, and release evidence requirements are operational evidence policies unless a product user story explicitly defines executable product behavior.

Covered evidence areas:

- migration execution evidence
- migration timeout and failure evidence
- backup evidence
- restore validation evidence
- deployment marker evidence
- migration SLI evidence
- evidence retention

Executable product tests must not invent artifact paths, backend systems, queries, approval workflows, or retention periods. Until production infrastructure design defines those details, verification remains Manual Verification or Traceability Verification.

## Applies To

OPS-007 test cases, operational RTM entries, QA automation catalog entries, smoke coverage, regression coverage, and release evidence documentation.

