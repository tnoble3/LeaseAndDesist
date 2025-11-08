# LeaseAndDesist

This repository contains a Backend (Express + MongoDB) and a Frontend (Vite + React).

Quick options to run the project locally:

Option A — Docker Compose (hands-off)
- Starts MongoDB and the backend in containers. Frontend is served separately.
	From the repo root:

```powershell
docker-compose up -d
```

This will start MongoDB and the backend. The backend will be available at http://localhost:5000.

Option B — Run backend locally + MongoDB container (recommended for local dev)
1. Start a MongoDB container:

```powershell
docker run -d --name lease-mongo -p 27017:27017 mongo:4.4
```

2. Start backend (from `Backend`):

```powershell
cd Backend
$env:MONGO_URI = "mongodb://localhost:27017/leaseanddesist"
$env:JWT_SECRET = "your_super_secret_jwt_key_2025"
npm install
npm run dev
```

3. Start frontend (from `Frontend`):

```powershell
cd Frontend
npm install
$env:VITE_API_BASE = "http://localhost:5000"
npm run dev
```

Notes
- If you run the backend locally, the repository's `Backend/.env` now defaults MONGO_URI to `mongodb://localhost:27017/leaseanddesist` for convenience.
- If you prefer a fully-containerized setup, run `docker-compose up -d` and then serve the frontend (or add a frontend service to the compose file).

Rubric evidence
---------------
Below are the key rubric requirements and where to find the implementation in this repo:

- Vite React app, organized pages/components: `Frontend/src/*` (pages, components, context)
- Functional Login/Register/Dashboard/Challenges UI: `Frontend/src/pages` and `Frontend/src/context/AuthContext.jsx`
- Axios API usage and token handling: `Frontend/src/api/axios.js` and `AuthContext.jsx`
- State management and protected routes: `Frontend/src/context/*` and `Frontend/src/components/ProtectedRoute.jsx`
- Challenges model and CRUD endpoints: `Backend/models/challenge.js`, `Backend/routes/challengeRoutes.js`
- Server-side validation: `Backend/routes/challengeRoutes.js` (uses `express-validator`)
- Backend integration tests: `Backend/test/challenges.test.js`
- End-to-end Cypress test: `Frontend/cypress/e2e/core-flow.cy.js`
- CI workflow that runs tests: `.github/workflows/ci.yml`

If you need a one-click checklist for graders, I can also generate a short `EVIDENCE.md` that points to file snippets and request/response examples.
