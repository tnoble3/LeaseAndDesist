# Quick Start Guide - Lease and Desist

## Prerequisites

Make sure you have installed:
- Node.js 18+ 
- Docker and Docker Desktop
- Git

## Starting the Program

### Option 1: Automated Start (Recommended)

Open PowerShell and run:

```powershell
cd "c:\Users\User\Desktop\LeaseAndDesist\LeaseAndDesist"

# Start all services
./start-all.ps1
```

### Option 2: Manual Start (Step by Step)

#### Step 1: Start MongoDB
```powershell
cd "c:\Users\User\Desktop\LeaseAndDesist\LeaseAndDesist"
docker-compose up -d
```
Wait 10 seconds for MongoDB to be ready.

#### Step 2: Start Backend Server
Open a new PowerShell window:
```powershell
cd "c:\Users\User\Desktop\LeaseAndDesist\LeaseAndDesist\Backend"
npm start
```
Wait until you see: `Server running on http://localhost:5050`

#### Step 3: Start Frontend Dev Server
Open another PowerShell window:
```powershell
cd "c:\Users\User\Desktop\LeaseAndDesist\LeaseAndDesist\client"
npm run dev
```
Wait until you see the Vite server URL (usually `http://localhost:3001` or `http://localhost:3000`)

#### Step 4: Open the Application
Open your browser and go to:
```
http://localhost:3001
```
(or the URL shown in the Vite output)

---

## Accessing the Application

- **Frontend URL**: http://localhost:3001
- **Backend API**: http://localhost:5050
- **Default Login**: 
  - Email: `test@example.com`
  - Password: `password123`

---

## Running Tests

### Unit & Snapshot Tests
```powershell
cd "c:\Users\User\Desktop\LeaseAndDesist\LeaseAndDesist\Backend"
npm test
```

### E2E Tests (Cypress)
```powershell
cd "c:\Users\User\Desktop\LeaseAndDesist\LeaseAndDesist\Backend"
npm run cy:run
```

Or open Cypress Test Runner:
```powershell
npm run cy:open
```

---

## Environment Variables

The `.env` files are already configured in:
- `Backend/.env` - Backend configuration
- `client/.env` - Frontend configuration

Key variables:
- `MONGODB_URI`: MongoDB connection string
- `OPENAI_API_KEY`: OpenAI API key (optional, templates work without it)
- `SENTRY_DSN`: Sentry error tracking (optional)

---

## Stopping Services

### Stop Everything
```powershell
docker-compose down
# Then close all Node processes (Ctrl+C in each terminal)
```

### Stop Only MongoDB
```powershell
docker-compose down
```

### Stop Only Servers
Press `Ctrl+C` in Backend and Frontend terminals.

---

## Troubleshooting

### "Port 5050 already in use"
```powershell
# Kill the process on port 5050
netstat -ano | findstr :5050
taskkill /PID [PID] /F
```

### "Port 3001 already in use"
Vite will automatically try port 3002, 3003, etc.

### "MongoDB connection refused"
```powershell
# Check Docker status
docker ps

# Restart MongoDB
docker-compose down
docker-compose up -d
```

### "npm install fails"
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# Reinstall
npm install
```

---

## Features to Test

### AI Challenge Generation
1. Login to the app
2. Go to Goals section
3. Click "Generate with AI" button
4. Select a goal and occasion
5. View the AI-generated challenge

### AI Feedback
1. Navigate to a goal
2. Click "Submit for Feedback"
3. Enter your work or upload a file
4. Submit and view AI feedback

### Error Tracking (Sentry)
1. Backend: `curl http://localhost:5050/api/debug-sentry`
2. Frontend: Check browser console for test error
3. Errors appear in Sentry dashboard (if configured)

---

## File Structure

```
LeaseAndDesist/
├── Backend/              # Express.js API server
│   ├── app.js           # Express app setup
│   ├── server.js        # Server entry point
│   ├── routes/          # API routes
│   ├── models/          # MongoDB schemas
│   ├── services/        # Business logic
│   ├── middleware/      # Auth middleware
│   └── tests/           # Unit & integration tests
│
├── client/              # React frontend
│   ├── src/
│   │   ├── App.jsx     # Main component
│   │   ├── main.jsx    # Entry point
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   └── api/        # API client
│   └── package.json
│
├── frontend/            # Alternative frontend
├── docker-compose.yml   # MongoDB service
└── package.json
```

---

## Development Tips

### Hot Reload
- Frontend automatically reloads on file changes (Vite)
- Backend requires manual restart

### Debugging Backend
```powershell
# Run with debug logging
$env:DEBUG='*'; npm start
```

### Debugging Frontend
1. Open DevTools (F12)
2. Check Console and Network tabs
3. Use React DevTools extension

---

## Need Help?

- Check `TESTING_CHECKLIST.md` for detailed testing procedures
- Check `AI_FEATURES_DOCUMENTATION.md` for feature details
- Check `IMPLEMENTATION_SUMMARY.md` for overview
- Check `VERIFICATION_REPORT.md` for implementation status

