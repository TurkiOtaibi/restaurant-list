# ذوق

Arabic-first personal taste library for restaurants and cafes.

The current MVP includes authentication, places, lists, list items, ratings, tried-place derivation, list visibility, profile basics, and the implemented frontend batches. The API is versioned under `/api/v1`.

## Stack

- Backend: Python 3.12, FastAPI, SQLAlchemy, Alembic
- Database: PostgreSQL
- Frontend: Next.js, React, TypeScript
- Tests: Pytest, Playwright
- Quality gates: Ruff, mypy, ESLint, TypeScript, npm audit, pip-audit

## Repository

```text
backend/          FastAPI app, service layer, migrations, backend tests
frontend/         Next.js app, design-system components, Playwright tests
docs/             Product, design, audit, and remediation documents
infra/            Infrastructure notes
.github/          CI workflow
docker-compose.yml
.env.example
```

## Local Setup

Copy the environment template:

```bash
cp .env.example .env
```

Start PostgreSQL:

```bash
docker compose up -d postgres
```

Backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e ".[dev]"
alembic upgrade head
uvicorn app.main:app --reload
```

Windows PowerShell activation:

```powershell
.\.venv\Scripts\Activate.ps1
```

Frontend:

```bash
cd frontend
npm ci
npm run dev
```

## Security Defaults

- Access tokens are short-lived JWTs stored by the frontend.
- Refresh tokens are stored only in HttpOnly cookies.
- Refresh cookies are `Secure` by default and scoped to `/api/v1/auth`.
- Production rejects default JWT secrets and insecure refresh-cookie settings.
- CSP and standard security headers are applied by both backend and frontend.
- Authentication endpoints are rate limited.

For local HTTP-only E2E runs, set `REFRESH_COOKIE_SECURE=false` through the E2E launcher only.

## Useful Commands

Backend:

```bash
cd backend
python -m ruff check .
python -m ruff format --check .
python -m mypy app tests
python -m pytest tests -q
alembic upgrade head
python -m pip_audit . --skip-editable
```

Frontend:

```bash
cd frontend
npm ci
npm run lint
npm run typecheck
npm run build
npm run test:e2e
npm audit --audit-level=moderate
```

Health checks:

- Backend live: `GET http://localhost:8000/health/live`
- Backend ready: `GET http://localhost:8000/health/ready`
- Frontend: `GET http://localhost:3000/api/health`

## API Notes

- Use `/api/v1` for application endpoints.
- Collection endpoints return `{ data, meta }`.
- API errors use `{ code, message }`.
- Places enforce normalized global name uniqueness.
- List collection endpoints include `placeCount` to avoid frontend fan-out requests.
