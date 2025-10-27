# Authentication Flow

## User Registration Flow
1. Client sends POST request to `/api/users/register` with:
   ```json
   {
     "name": "User Name",
     "email": "user@example.com",
     "password": "userPassword123"
   }
   ```
2. Server validates input
3. Checks if email already exists
4. If email is unique:
   - Hashes password using bcrypt
   - Creates new user in MongoDB
   - Generates JWT token
   - Returns token and user data

## Login Flow
1. Client sends POST request to `/api/users/login` with:
   ```json
   {
     "email": "user@example.com",
     "password": "userPassword123"
   }
   ```
2. Server finds user by email
3. Compares password hash using bcrypt
4. If credentials are valid:
   - Generates new JWT token
   - Returns token and user data

## Protected Route Access
1. Client includes token in request header:
   ```
   Authorization: Bearer <jwt_token>
   ```
2. Server middleware:
   - Extracts token from header
   - Verifies token signature using JWT_SECRET
   - If valid, adds userId to request object
   - If invalid, returns 401 Unauthorized
3. Protected route handler:
   - Uses userId from request
   - Returns requested data

## Security Features
- Passwords are hashed using bcrypt with salt rounds of 10
- JWTs expire after 24 hours
- Sensitive routes are protected with authentication middleware
- User passwords are never returned in API responses
- MongoDB Atlas provides secure database hosting
- Environment variables used for sensitive configuration