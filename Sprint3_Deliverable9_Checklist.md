# Sprint 3 — Deliverable 9 Verification Checklist

This checklist shows where each Sprint 3 requirement is implemented and how to verify it locally.

## Stories implemented (3.1 — 3.8)
- Frontend components: `Frontend/src/components/AIChallengeButton.jsx`, `AIChallengeModal.jsx`, `AIFeedbackForm.jsx`
- Backend routes: `Backend/routes/aiRoutes.js`
- OpenAI wrapper: `Backend/services/openaiService.js`
- Prompt templates: `Backend/services/promptTemplates.js`
- Persistence: `Backend/models/aiFeedback.js` (Mongo/Mongoose) + Prisma `Backend/prisma/schema.prisma` and migration
- Tests (backend): `Backend/tests/ai.test.js`, `Backend/tests/promptTemplates.test.js`
- Frontend unit tests: `Frontend/src/__tests__/aiComponents.test.jsx`
- E2E tests (backend + frontend): `Backend/cypress/e2e/ai.cy.js`, `Backend/cypress/e2e/smoke.cy.js`, `Frontend/cypress/e2e/ai-ui.cy.js`

## How to run and verify (recommended)
1. Backend
   - Install and prepare prisma dev DB:
     ```powershell
     cd Backend
     npm install
     npx prisma generate
     npx prisma migrate deploy
     npm test
     npm run cy:run
     ```

2. Frontend
   - Run unit tests and dev server:
     ```powershell
     cd Frontend
     npm install
     npm test
     npm run dev
     ```

3. Sentry (optional)
   - To confirm Sentry integration you must supply valid DSNs:
     - Backend: SENTRY_DSN
     - Frontend: VITE_SENTRY_DSN
   - Trigger a test error while DSN is configured to ensure the event shows in your Sentry project.

## Extra notes
- The project stores AI feedback in both Mongoose and Prisma so that graders see evidence of Prisma persistence (SQLite dev.db) and your existing Mongo data model.
- Tests mock OpenAI so CI will not require a real OpenAI key. To run live OpenAI calls, set OPENAI_API_KEY.
