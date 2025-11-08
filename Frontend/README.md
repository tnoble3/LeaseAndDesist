# Frontend for Lease and Desist

This is a minimal Vite + React frontend scaffold for the Lease and Desist project.

Features included:
- Login / Register pages (uses `/api/users/login` and `/api/users/register`)
- Auth context with token stored in `localStorage`
- Protected routes (Dashboard, Challenges)
- Challenges page with create / toggle-complete / delete UI that calls `/api/challenges` endpoints
- Dashboard with a progress bar that reflects completed challenges

How to run

1. From this folder run:

```powershell
cd Frontend; npm install
npm run dev
```

2. The app will pick up an API base URL from `VITE_API_BASE` environment variable (example: `http://localhost:5000`). If not set, requests are made relative to the current origin.

Notes and next steps
- The backend in this repository currently does not include `/api/challenges` endpoints. To fully enable the Goals/Challenges UI you should add the `Challenge` model and CRUD routes on the backend (protected with auth). I can implement those backend endpoints as well if you want.
- I intentionally kept UI and logic minimal so it’s easy to adapt to backend changes and to add tests.
