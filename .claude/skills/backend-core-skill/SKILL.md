---
name: backend-core-skill
description: Generate backend routes, handle requests/responses, and connect to databases. Use for building APIs and server-side logic.
---

# Backend Skill – Routes, Requests & DB

## Instructions

1. **Route Handling**
   - Create RESTful or GraphQL endpoints
   - Handle GET, POST, PUT, DELETE requests
   - Use route parameters and query strings effectively

2. **Request & Response Management**
   - Validate incoming requests (body, params, headers)
   - Structure consistent API responses
   - Handle errors gracefully with proper status codes

3. **Database Integration**
   - Connect to SQL or NoSQL databases
   - Perform CRUD operations efficiently
   - Use ORM/ODM tools where appropriate
   - Ensure secure database access (prevent injections)

4. **Middleware & Security**
   - Implement authentication/authorization checks
   - Apply logging, rate-limiting, and input sanitization
   - Handle CORS and other HTTP security headers

## Best Practices
- Keep endpoints RESTful and predictable
- Return meaningful status codes and messages
- Validate all user inputs before DB operations
- Use async/await for DB queries to prevent blocking
- Modularize routes and controllers for maintainability

## Example Structure
```javascript
// Example using Express.js
import express from 'express';
import { getUser, createUser } from './controllers/userController.js';

const router = express.Router();

// GET user by ID
router.get('/user/:id', getUser);

// POST create new user
router.post('/user', createUser);

export default router;
