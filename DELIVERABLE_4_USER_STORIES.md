# Deliverable 4 - User Stories & Flow Diagrams

## Sprint 2 Completed User Stories

### Story 4.1: User Account Creation & Authentication
**As a user, I need to make an account**

**Flow:**
Profile Creation / Login → Profile Screen

**Acceptance Criteria:**
- User can register with email, username, password
- User can log in with credentials
- Session is maintained with JWT token
- User is redirected to dashboard on successful login

**Status:** ✅ Implemented
- Backend: `routes/userRoutes.js` — POST `/api/users/register`, POST `/api/users/login`
- Frontend: `components/AuthGate.jsx` — Registration and login forms
- Database: `models/user.js` — User schema with bcrypt password hashing

---

### Story 4.2: User Profile Management
**As a user, I need to edit my profile**

**Flow:**
Profile Screen → Edit Profile

**Acceptance Criteria:**
- User can view their profile information
- User can update first name, last name, email, profile picture
- Changes are persisted to database
- User receives confirmation on successful update

**Status:** ✅ Implemented
- Backend: `routes/userRoutes.js` — PATCH `/api/users/:userId`
- Frontend: Profile editing component integrated in main dashboard
- Database: `models/user.js` — Profile fields stored

---

### Story 4.3: Community Messaging - Public Board
**As a user, I need to chat in a server**

**Flow:**
Dashboard → Message Board → Post Message

**Acceptance Criteria:**
- User can view all messages posted by other users
- User can post a new message to the board
- Messages display with timestamp and author
- Users can delete their own messages

**Status:** ✅ Implemented
- Backend: `routes/messageRoutes.js` — GET/POST `/api/messages`
- Frontend: Message board component with real-time display
- Database: `models/message.js` — Message schema with timestamps

---

### Story 4.4: Resident Complaint System - Anonymous Messages
**As a resident, I need to complain freely about my apartment**

**Flow:**
Dashboard → Anonymous Message Board / Direct Message → Create and post new Message

**Acceptance Criteria:**
- User can post anonymous complaints
- Complaints are stored with privacy
- Complaints can be viewed by apartment management
- User can submit feedback without identification

**Status:** ✅ Implemented (via message system)
- Backend: `routes/messageRoutes.js` — Anonymous message posting supported
- Frontend: Message form with anonymous option
- Database: `models/message.js` — Anonymous flag support

---

### Story 4.5: Resident Approval Workflow (RA Dashboard)
**As an RA, I need to approve residents**

**Flow:**
Dashboard > User's Profile Screen > Accept user into Apartment

**Acceptance Criteria:**
- RA can view pending resident applications
- RA can view applicant profile and details
- RA can approve or reject application
- Applicant receives notification of decision
- Approved resident is added to apartment roster

**Status:** ✅ Implemented (partial)
- Backend: `routes/userRoutes.js` — User approval endpoints
- Frontend: Dashboard with user management interface
- Database: User status/approval field in schema

---

## Integration Points

### Frontend Routes
- `/` — Home / Authentication Gate
- `/goals` — Goal management view
- `/challenges` — Challenge management view

### Backend API Endpoints
- `/api/users/*` — User authentication, profile, approval
- `/api/messages/*` — Message board operations
- `/api/goals/*` — Goal CRUD operations
- `/api/challenges/*` — Challenge CRUD operations

### Database Models
- `User` — Account and profile data
- `Message` — Community messages and complaints
- `Goal` — User goals
- `Challenge` — Goals challenges

---

## Testing Coverage

**Unit Tests Implemented:**
- User registration and login flows
- Message creation and retrieval
- Goal and challenge CRUD operations

**End-to-End Tests (Cypress):**
- Complete user onboarding flow
- Message posting and retrieval
- Profile editing workflow

---

**Deliverable 4 Completion Date:** Sprint 2 (November 23)
**Status:** ✅ All core stories implemented and tested
