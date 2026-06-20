# Render Deployment Guide

Date: 2026-06-20

This project is a monorepo with:

- Backend: FastAPI in `backend/`
- Frontend: Next.js in `frontend/`
- Database: Supabase PostgreSQL
- Infrastructure-as-code entry point: `render.yaml`

Do not deploy until the deployment checklist in this document is complete.

## Readiness Summary

| Area | Status | Notes |
| --- | --- | --- |
| Backend production readiness | Ready with required env vars | Production rejects default JWT secrets and requires secure refresh cookies. |
| Frontend production readiness | Ready with required env vars | Next.js must be deployed as a Node web service, not a static site, because the app has runtime routes. |
| PostgreSQL configuration | Ready | Supabase `postgresql://` URLs are normalized to `postgresql+asyncpg://` for the app runtime. |
| Environment variables | Manual values required | `CORS_ORIGINS` and `NEXT_PUBLIC_API_BASE_URL` must be set to the actual Render service URLs. |
| CORS | Ready if exact origin is configured | Credentials are enabled, so do not use wildcard origins. |
| Cookie/auth under HTTPS | Ready | Refresh token is HttpOnly, Secure, SameSite, and scoped to `/api/v1/auth`. |
| Migrations | Ready | Backend startup command runs `alembic upgrade head` before `uvicorn` on the free Render instance. |
| Health endpoints | Ready | Backend uses `/health/ready`; frontend uses `/api/health`. |
| Startup commands | Ready | Defined in `render.yaml`. |

## Backend Render Configuration

The backend service is defined in `render.yaml`:

```yaml
type: web
name: restaurant-list-api
runtime: python
rootDir: backend
plan: free
region: singapore
buildCommand: python -m pip install --upgrade pip && pip install -e .
startCommand: alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
healthCheckPath: /health/ready
autoDeployTrigger: checksPass
```

Manual Render settings, if not using the Blueprint:

- Service type: Web Service
- Runtime: Python
- Root directory: `backend`
- Build command: `python -m pip install --upgrade pip && pip install -e .`
- Pre-deploy command: leave empty on the free Render service.
- Start command: `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Health check path: `/health/ready`

## Frontend Render Configuration

The frontend service is defined in `render.yaml`:

```yaml
type: web
name: restaurant-list-web
runtime: node
rootDir: frontend
plan: free
region: singapore
buildCommand: npm ci && npm run build
startCommand: npm run start -- -H 0.0.0.0 -p $PORT
healthCheckPath: /api/health
autoDeployTrigger: checksPass
```

Manual Render settings, if not using the Blueprint:

- Service type: Web Service
- Runtime: Node
- Root directory: `frontend`
- Build command: `npm ci && npm run build`
- Start command: `npm run start -- -H 0.0.0.0 -p $PORT`
- Health check path: `/api/health`

Do not deploy the frontend as a Static Site. The app uses a Next.js route handler at `/api/health`, so it should run as a Node web service.

## PostgreSQL Setup

Use the existing Supabase PostgreSQL project.

Notes:

- Do not create a Render PostgreSQL database for this deployment.
- Set `DATABASE_URL` manually in the backend service from the Supabase connection string.
- Use the direct Supabase PostgreSQL connection string for migrations when possible.
- If Supabase provides a pooler URL, prefer session pooling for long-lived app connections.
- The backend accepts Supabase `postgresql://...` URLs and normalizes them for async SQLAlchemy.
- Alembic migrations use `postgresql+psycopg://...` through the sync migration path.

## Required Environment Variables

### Backend

| Key | Required | Value |
| --- | --- | --- |
| `PYTHON_VERSION` | Yes | `3.12.7` |
| `APP_NAME` | Yes | `Restaurant Wishlist API` |
| `APP_ENV` | Yes | `production` |
| `DATABASE_URL` | Yes | Supabase PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Yes | Generated secret |
| `JWT_REFRESH_SECRET` | Yes | Generated secret, different from access secret |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Yes | `15` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Yes | `30` |
| `REFRESH_COOKIE_NAME` | Yes | `restaurant_refresh_token` |
| `REFRESH_COOKIE_SECURE` | Yes | `true` |
| `REFRESH_COOKIE_SAMESITE` | Yes | `none` for cross-origin frontend/backend HTTPS auth |
| `AUTH_RATE_LIMIT_REQUESTS` | Yes | `100` |
| `AUTH_RATE_LIMIT_WINDOW_SECONDS` | Yes | `60` |
| `ENABLE_API_DOCS` | Yes | `false` |
| `CORS_ORIGINS` | Yes | JSON array containing the exact frontend origin |

Example backend `CORS_ORIGINS`:

```text
["https://restaurant-list-web.onrender.com"]
```

If the deployed frontend URL differs, use the actual URL from the Render dashboard.

### Frontend

| Key | Required | Value |
| --- | --- | --- |
| `NODE_VERSION` | Yes | `22` |
| `NEXT_PUBLIC_API_BASE_URL` | Yes | Backend public origin, no trailing slash |

Example frontend `NEXT_PUBLIC_API_BASE_URL`:

```text
https://restaurant-list-api.onrender.com
```

Important: `NEXT_PUBLIC_API_BASE_URL` is used at frontend build time. If it changes, rebuild and redeploy the frontend.

## CORS Configuration

Backend CORS requirements:

- `allow_credentials=True` is enabled.
- `CORS_ORIGINS` must list exact frontend origins.
- Do not use `*` with credentialed requests.
- Include production frontend origin only unless staging URLs are intentionally supported.

Required production shape:

```text
CORS_ORIGINS=["https://<frontend-service>.onrender.com"]
```

## Cookie And Auth Configuration Under HTTPS

Current backend behavior:

- Refresh token is stored in an HttpOnly cookie.
- Cookie is Secure in production.
- Cookie path is `/api/v1/auth`.
- Frontend fetch requests use `credentials: "include"`.
- Access token remains in browser storage; refresh token is not exposed to JavaScript.

Recommended Render values:

```text
REFRESH_COOKIE_SECURE=true
REFRESH_COOKIE_SAMESITE=none
```

Use `REFRESH_COOKIE_SAMESITE=none` only if frontend and backend are on genuinely cross-site domains. If using `none`, keep `REFRESH_COOKIE_SECURE=true`.

## Migration Execution Strategy

On the free Render service, run migrations through the backend service start command:

```text
alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

This runs after dependencies install and immediately before the backend process starts.

Operational rules:

- Do not run migrations from the frontend service.
- If moving to a paid Render instance later, prefer moving `alembic upgrade head` back to Render's pre-deploy command and returning the start command to only `uvicorn`.
- For destructive migrations in the future, use an explicit migration review before deploy.
- Verify `/health/ready` after deployment because it checks database connectivity.

## Health Endpoints

Backend:

- Liveness: `/health/live`
- Readiness: `/health/ready`
- Render health check path: `/health/ready`

Frontend:

- Health: `/api/health`
- Render health check path: `/api/health`

## Deployment Checklist

- Commit and push the latest local deployment changes.
- Create the Render Blueprint from `render.yaml`, or create services manually with the settings above.
- Confirm all services use the same region.
- Confirm Supabase database is available before backend deploy.
- Set backend `CORS_ORIGINS` to the exact frontend origin.
- Set frontend `NEXT_PUBLIC_API_BASE_URL` to the exact backend origin.
- Confirm `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are generated and different.
- Confirm `APP_ENV=production`.
- Confirm `REFRESH_COOKIE_SECURE=true`.
- Confirm `ENABLE_API_DOCS=false`.
- Confirm backend start command begins with `alembic upgrade head &&`.
- Confirm frontend is a Node web service, not a static site.

## Post-Deployment Verification Checklist

Run these checks after deployment:

1. Backend liveness:

   ```text
   GET https://<backend-service>.onrender.com/health/live
   ```

2. Backend readiness:

   ```text
   GET https://<backend-service>.onrender.com/health/ready
   ```

3. Frontend health:

   ```text
   GET https://<frontend-service>.onrender.com/api/health
   ```

4. Browser smoke test:

   - Open frontend URL.
   - Register a new user.
   - Confirm the refresh cookie is HttpOnly and Secure in browser devtools.
   - Confirm `localStorage` does not contain a refresh token.
   - Create a place.
   - Create a list.
   - Add place to list.
   - Refresh the page and confirm auth persists through refresh-cookie flow.

5. API/CORS smoke test:

   - Confirm frontend requests to backend do not fail with CORS errors.
   - Confirm failed validation returns unified API errors.

6. Migration verification:

   - Confirm backend deploy logs show `alembic upgrade head` completed before `uvicorn` starts.
   - Confirm `/health/ready` reports database `ok`.

## Deployment Blockers

No code-level Render blockers remain after this preparation.

Manual blockers that must be resolved before deployment:

- `DATABASE_URL` must be set to the real Supabase PostgreSQL connection string.
- `CORS_ORIGINS` must be set to the real frontend origin.
- `NEXT_PUBLIC_API_BASE_URL` must be set to the real backend origin before the frontend build.
- Latest local changes must be committed and pushed to GitHub before Render builds from the repository.

## Official Render References

- Blueprint YAML reference: https://render.com/docs/blueprint-spec
- Next.js deployment: https://render.com/docs/deploy-nextjs-app
- Environment variables and secrets: https://render.com/docs/configure-environment-variables
- Health checks: https://render.com/docs/health-checks
- Render Postgres connection: https://render.com/docs/postgresql-creating-connecting
