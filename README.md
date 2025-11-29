# LeaseAndDesist

## Backend Quickstart

1. Copy `Backend/.env.example` to `Backend/.env` (adjust secrets if needed). The default `MONGO_URI` points to the `mongo` service from `docker-compose.yml`.
2. Start MongoDB locally. The easiest path is `docker compose up mongo -d`, which exposes port `27017` to your host.
3. Install dependencies and boot the API:
   ```bash
   cd Backend
   npm install
   npm run start
   ```

The server now waits for a successful Mongo connection before it listens. When the configured `MONGO_URI` host cannot be resolved (for example, when you run the backend outside Docker), it automatically retries using `mongodb://127.0.0.1:27017/<db>` so you can keep using the same `.env`.

## Frontend Quickstart

1. Copy `frontend/.env.example` to `frontend/.env` and update `VITE_API_BASE_URL` if your backend is not on `http://localhost:5000/api`. 
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. Visit `http://localhost:5173` and use the login page to create an account or log in (registration collects first/last name, username, email, and password + confirmation; sign-in uses your username + password). Once authenticated, you’ll land on the dashboard with navigation links to the Goals and Challenges sections, plus the live progress visualization.

## Testing & Tooling

| Command | Where | Purpose |
| --- | --- | --- |
| `npm test` | `Backend/` | Runs Jest against an in-memory MongoDB instance (Story 2.7 unit coverage). |
| `npm run cy:run` | `Backend/` | Starts the API on port 5050 and executes the Cypress smoke test (login → goal → challenge → mark complete). Requires a running MongoDB (e.g., `docker compose up mongo -d`). |
| `npm run build` | `frontend/` | Ensures the React dashboard (goal form, challenge cards, progress chart) compiles. |

The Cypress workflow relies on the protected endpoints, so make sure `JWT_SECRET` and `MONGO_URI` are configured before running it locally.

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
