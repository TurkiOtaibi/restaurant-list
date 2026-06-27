# EDR-006: Operational Monitoring And Evidence Policy

## Status

Approved

## Decision

Operational topics that depend on production infrastructure design are not product requirements unless explicitly defined in a user story or EDR.

This applies to:

- metric names
- metric dimensions
- alert sinks
- monitoring backends
- log sinks
- backup evidence
- deployment evidence

Until production infrastructure design defines those surfaces, affected checks are represented as Engineering Decision, Operational Policy, Manual Verification, or Traceability Verification. Executable product tests must not invent monitoring backends, alert sinks, evidence paths, or production retention rules.

## Applies To

System Operations test cases, operational RTM entries, QA automation catalog entries, smoke coverage, regression coverage, and deployment evidence documentation.

