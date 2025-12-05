# AI Features Implementation - Testing Checklist

## Pre-Testing Setup

- [ ] MongoDB is running: `docker-compose up mongo -d`
- [ ] Backend dependencies installed: `cd Backend && npm install`
- [ ] Frontend dependencies installed: `cd frontend && npm install`
- [ ] Environment variables configured in `Backend/.env`:
  - `MONGO_URI=mongodb://mongo:27017/leaseanddesist`
  - `JWT_SECRET=your_secret_key`
  - `OPENAI_API_KEY` (optional, tests work with empty)
  - `OPENAI_MODEL=gpt-4o-mini`
  - `SENTRY_DSN` (optional for tests)
  - `PORT=5050`

## Unit & Integration Tests

### Backend Tests
```bash
cd Backend
npm test
```

Expected results:
- [ ] aiRoute.test.js: 2 tests pass
  - [ ] POST /api/ai/generateChallenge returns challenge and logs
  - [ ] POST /api/ai/submitForFeedback returns feedback and stores submission
- [ ] aiService.test.js: 15+ tests pass
  - [ ] buildPrompt fills placeholders
  - [ ] generateChallenge falls back to templates
  - [ ] buildFeedbackPrompt handles all parameters
  - [ ] Deterministic template generation
  - [ ] Integration scenarios
- [ ] aiSnapshots.test.js: 15+ tests pass
  - [ ] Challenge snapshots stable without OpenAI
  - [ ] Feedback snapshots stable without OpenAI
  - [ ] Challenge titles never contain banned words
  - [ ] Feedback is supportive and actionable
  - [ ] Error handling works correctly

### Test Coverage
- [ ] All tests pass with 100% success rate
- [ ] No errors or warnings
- [ ] Snapshots are generated in `Backend/tests/__snapshots__/`

## E2E Tests (Cypress)

### Run All E2E Tests
```bash
cd Backend
npm run cy:run
```

### Or Run Interactive Mode
```bash
cd Backend
npx cypress open
# Then select ai_features.cy.js
```

Expected results:
- [ ] **Story 3.1-3.2 Tests** (10+ tests)
  - [ ] Generate challenge via POST /api/ai/generateChallenge
  - [ ] Logs prompt and response to AiLog
  - [ ] Supports occasion parameter to theme events
  - [ ] Rejects invalid goalId
  - [ ] Rejects occasion that is too long
  - [ ] Works without authentication (fails appropriately)
  
- [ ] **Story 3.4-3.6 Tests** (5+ tests)
  - [ ] Submit content for feedback via POST /api/ai/submitForFeedback
  - [ ] Store feedback in AiFeedback table
  - [ ] Rejects empty content
  - [ ] Rejects invalid goalId
  - [ ] Works without goalId (general feedback)

- [ ] **Story 3.3 Tests** (1+ tests)
  - [ ] Use consistent templates for generation

- [ ] **Story 3.7 Tests** (2+ tests)
  - [ ] Return stable challenge snapshots
  - [ ] Return stable feedback snapshots

- [ ] **Story 3.8 Tests** (3+ tests)
  - [ ] Log backend errors to Sentry
  - [ ] Handle missing authentication gracefully
  - [ ] Provide meaningful error messages

## API Endpoint Testing (Manual)

### Test Challenge Generation
```bash
# 1. Register
curl -X POST http://localhost:5050/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123",
    "confirmPassword": "testpass123"
  }'

# 2. Login (save the token)
curl -X POST http://localhost:5050/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass123"}'

# 3. Create a goal (use the token)
curl -X POST http://localhost:5050/api/goals \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Community Building",
    "description": "Connect neighbors"
  }'

# 4. Generate challenge (use goal ID from step 3)
curl -X POST http://localhost:5050/api/ai/generateChallenge \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "goalId": "GOAL_ID_FROM_STEP_3",
    "focus": "neighborhood engagement",
    "occasion": "christmas"
  }'

# Expected: 200 response with title, description, provider, etc.
```

### Test Feedback Submission
```bash
# Using same token from login
curl -X POST http://localhost:5050/api/ai/submitForFeedback \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Dear neighbors, let'\''s organize a monthly potluck...",
    "goalId": "GOAL_ID_FROM_STEP_3",
    "fileName": "letter.txt"
  }'

# Expected: 200 response with feedback, submissionId, provider, etc.
```

## Frontend Component Testing

### Test AI Challenge Generator
- [ ] Navigate to dashboard after login
- [ ] Scroll to "Generate a community event" section
- [ ] Select a goal from dropdown
- [ ] Enter custom event theme (optional)
- [ ] Select an occasion (e.g., Christmas)
- [ ] Click "Generate with AI" button
- [ ] Verify modal appears with generated challenge
- [ ] Verify modal shows title, description, occasion
- [ ] Verify modal closes with "Close" button
- [ ] Verify modal closes with Escape key
- [ ] Verify modal closes when clicking outside

### Test AI Feedback Form
- [ ] Scroll to "Review my post or petition" section
- [ ] Type content in text area
- [ ] Click "Request feedback" button
- [ ] Verify feedback appears in the response section
- [ ] Upload a text file and verify content is appended
- [ ] Try submitting empty form (should show error)
- [ ] Verify form clears after successful submission

## Error Handling Testing

### Test Error Scenarios
- [ ] **Invalid Authentication**: Call endpoints without token (should 401)
- [ ] **Invalid Goal ID**: Use malformed MongoDB ID (should 400)
- [ ] **Missing Content**: Submit empty feedback (should 400)
- [ ] **Non-existent Goal**: Use valid ID of non-owned goal (should 404)
- [ ] **Occasion Too Long**: Send >80 character occasion (should 400)

### Test Sentry Integration
- [ ] Backend: Check for `/api/debug-sentry` endpoint
- [ ] Frontend: In dev mode, check for "Test Sentry error" button
- [ ] Click button and verify error is captured (in dev console)

## Performance Testing

### Response Times
- [ ] Challenge generation responds within 2-5 seconds
- [ ] Feedback generation responds within 2-5 seconds
- [ ] No timeout errors with typical inputs

### Load Testing (Optional)
- [ ] Submit 10 challenges in quick succession
- [ ] Submit 10 feedback requests in quick succession
- [ ] Verify all succeed and database records are created

## Database Verification

### Check Created Records
```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017/leaseanddesist

# Check AI logs
db.ailogs.find().pretty()

# Check AI feedback
db.aifeedbacks.find().pretty()

# Check challenges
db.challenges.find().pretty()
```

Expected:
- [ ] AiLog records exist with prompt and response
- [ ] AiFeedback records exist with content and feedback
- [ ] Challenge records optionally have isAiGenerated flag

## Deployment Checklist

- [ ] All tests pass locally
- [ ] No console errors or warnings
- [ ] Environment variables configured for deployment
- [ ] Sentry DSN configured (if using)
- [ ] OpenAI API key configured (if using)
- [ ] Database backup created
- [ ] Code committed to repository

## Final Verification

Run this comprehensive test suite:
```bash
# Terminal 1: MongoDB
docker-compose up mongo -d

# Terminal 2: Backend
cd Backend
npm run dev

# Terminal 3: Run all tests
cd Backend
npm test && npm run cy:run
```

Expected outcome:
- [ ] All unit tests pass
- [ ] All snapshot tests pass
- [ ] All E2E tests pass
- [ ] No failures or skipped tests
- [ ] All components render correctly
- [ ] No console errors

## Sign-Off

- [ ] All tests passing
- [ ] All features working as specified
- [ ] Documentation complete
- [ ] Code review completed
- [ ] Ready for deployment

---

## Troubleshooting

### Tests Failing?
1. Check MongoDB is running: `docker-compose ps`
2. Check environment variables: `cat Backend/.env`
3. Check port 5050 is available: `lsof -i :5050`
4. Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### API Endpoints Returning 500?
1. Check backend server logs for errors
2. Verify MONGO_URI is correct
3. Check JWT_SECRET is set
4. Verify user is authenticated (has token)

### Sentry Not Capturing Errors?
1. Verify SENTRY_DSN is set
2. Check Sentry project settings
3. Verify environment name matches configuration
4. Check browser console for Sentry errors

### Tests Timing Out?
1. Increase Jest timeout: `jest.setTimeout(10000)`
2. Check MongoDB is responsive
3. Check backend server is running
4. Verify network connectivity

---

**Last Updated**: December 4, 2025
**Status**: ✅ Ready for Testing
