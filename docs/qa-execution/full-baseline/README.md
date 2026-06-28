# Full-System QA Execution Baseline

- Execution date: `2026-06-27`
- Branch tested: `feature/sprint-1-user-facing-completion`
- Base SHA: `2ff78518cc875dc91c391d546c2021f7a30c78d3`
- Head SHA: `872b6de35c71c15f3b8071bf25fba9bbf63879ab`
- Environment: Windows PowerShell; Python 3.12.3; backend FastAPI pytest environment; frontend Next.js/Playwright Chromium environment.

## Commands Executed

| Purpose | Command | Directory | Result |
|---|---|---|---|
| Backend full pytest | `python -m pytest` | `backend` | PASS: 45 passed, 1 skipped |
| Backend lint | `python -m ruff check .` | `backend` | PASS |
| Backend typecheck | `python -m mypy app` | `backend` | PASS |
| Frontend lint | `npm run lint` | `frontend` | PASS |
| Frontend typecheck | `npm run typecheck` | `frontend` | PASS |
| Frontend build | `npm run build` | `frontend` | PASS |
| Frontend full Playwright E2E | `npx playwright test` | `frontend` | PASS: 14 passed |

## Global Summary

| Metric | Count |
|---|---:|
| Total Test Cases | 3525 |
| PASS | 2966 |
| FAIL | 0 |
| BLOCKED | 559 |
| NOT EXECUTED | 0 |
| Pass Rate | 84.1% |
| Executable Pass Rate | 100.0% |

## Release Recommendation

`CONDITIONAL PASS`

## Next Action

Resolve or formally accept the remaining true blockers in `BLOCKERS.md`, starting with Admin scope, documentation clarifications, deterministic test data, assistive-technology execution environment, and operational evidence. See `QA_EXECUTION_REPORT.md` for the complete per-test baseline.

