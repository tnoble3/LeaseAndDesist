# LeaseAndDesist

## Backend Quickstart

1. Copy `Backend/.env.example` to `Backend/.env` (adjust secrets if needed). The default `MONGO_URI` points to the `mongo` service from `docker-compose.yml`.
2. Start MongoDB locally. The easiest path is `docker compose up mongo -d`, which exposes port `27017` to your host.
3. Install dependencies and boot the API (runs on port `5050` by default):
   ```bash
   cd Backend
   npm install
   npm run start
   ```
   If you want AI-generated challenges, add `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`) to `Backend/.env`.

The server now waits for a successful Mongo connection before it listens. When the configured `MONGO_URI` host cannot be resolved (for example, when you run the backend outside Docker), it automatically retries using `mongodb://127.0.0.1:27017/<db>` so you can keep using the same `.env`.

## Frontend Quickstart

1. Copy `frontend/.env.example` to `frontend/.env` and update `VITE_API_BASE_URL` if your backend is not on `http://localhost:5050/api`. 
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. Visit `http://localhost:5173` and use the login page to create an account or log in (registration collects first/last name, username, email, and password + confirmation; sign-in uses your username + password). Once authenticated, you’ll land on the dashboard with navigation links to the Goals and Challenges sections, plus the live progress visualization.

### Sentry (optional)

- Backend: set `SENTRY_DSN`, `SENTRY_ENVIRONMENT`, and `SENTRY_TRACES_SAMPLE_RATE` in `Backend/.env`. A debug route `/api/debug-sentry` intentionally throws to verify ingestion.
- Frontend: set `VITE_SENTRY_DSN` (and optionally `VITE_SENTRY_TRACES_SAMPLE_RATE`) in `frontend/.env`. Use the “Test Sentry error” button on the dashboard hero to emit a client-side event.

## Testing & Tooling

| Command | Where | Purpose |
| --- | --- | --- |
| `npm test` | `Backend/` | Runs Jest against an in-memory MongoDB instance (Story 2.7 unit coverage). |
| `npm run cy:run` | `Backend/` | Starts the API on port 5050 and executes the Cypress smoke test (login → goal → challenge → mark complete). Requires a running MongoDB (e.g., `docker compose up mongo -d`). |
| `npm run build` | `frontend/` | Ensures the React dashboard (goal form, challenge cards, progress chart) compiles. |

The Cypress workflow relies on the protected endpoints, so make sure `JWT_SECRET` and `MONGO_URI` are configured before running it locally.

### Status checks (latest session)

- Backend unit tests: ✅ `npm test`
- Cypress e2e: ⚠️ `npm run cy:run` failed locally because the Cypress binary exited early (`bad option: --no-sandbox/--smoke-test` on macOS). Try clearing cache and reinstalling (done), or run with a different browser binary (`cypress run --browser chrome`) to resolve locally.
- Frontend unit tests: none in repo; current smoke is `npm run build` + manual UI checks.
- Sentry: wiring present; set `SENTRY_DSN`/`VITE_SENTRY_DSN` and use `/api/debug-sentry` or the “Test Sentry error” button to verify ingestion in your org.
- Responsiveness: layout uses grid/flex and was smoke-checked at desktop and narrow widths; nav squares wrap on small screens.

## Continuous Integration

`.github/workflows/ci.yml` installs backend/frontend dependencies, runs Jest, builds the frontend, and executes the Cypress smoke test against a MongoDB service container on every push and pull request (Stories 2.7 & 2.8). The default branch matrix watches `main` and `TrinitySprint2`. Provide `MONGO_URI`/`JWT_SECRET` secrets if you fork the repo.

### Environment Variables

| Variable | Purpose |
| --- | --- |
| `MONGO_URI` | Preferred Mongo connection string (first attempt). |
| `MONGO_FALLBACK_URI` | Optional explicit fallback URI. |
| `MONGO_HOST` / `MONGO_PORT` / `MONGO_DB` | Pieces used to build the default fallback (`127.0.0.1`, `27017`, `leaseanddesist`). |
| `JWT_SECRET` | Secret used to sign JWTs. |
| `PORT` | Express listening port (defaults to `5000`). |
