# Todo API Documentation

This document provides comprehensive documentation for all endpoints in the Todo API. The API is built with FastAPI and provides endpoints for user authentication, todo management, and health monitoring.

**Interactive API Documentation:** When running the backend server, visit `/docs` for interactive Swagger UI documentation.

---

## Table of Contents

- [Authentication Endpoints](#authentication-endpoints)
- [Todo Endpoints](#todo-endpoints)
- [Health Endpoints](#health-endpoints)
- [Error Handling](#error-handling)
- [Authentication Flow](#authentication-flow)

---

## Authentication Endpoints

### POST /api/auth/register

Register a new user account.

**Description:** Creates a new user account with the provided credentials. Passwords are securely hashed before storage.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response Body (201 Created):**
```json
{
  "id": "user-uuid-1234",
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2026-02-07T10:30:00Z"
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | `InvalidEmailFormat` | Email format is invalid |
| 400 | `PasswordTooWeak` | Password does not meet security requirements |
| 409 | `EmailAlreadyExists` | Email is already registered |
| 422 | `ValidationError` | Invalid request body format |

**Example cURL:**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "name": "John Doe"
  }'
```

---

### POST /api/auth/login

Authenticate a user and receive an access token.

**Description:** Validates user credentials and returns a JWT access token for authenticated requests.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response Body (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "user-uuid-1234",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | `InvalidCredentials` | Email or password is incorrect |
| 422 | `ValidationError` | Invalid request body format |

**Notes:**
- The returned `access_token` should be included in the `Authorization` header for authenticated requests
- Token type is always `"bearer"`
- `expires_in` is the token validity duration in seconds (typically 3600 = 1 hour)

**Example cURL:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

---

## Todo Endpoints

All todo endpoints require authentication. Include the JWT token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

### GET /api/todos

Retrieve all todos for the authenticated user.

**Description:** Returns a paginated list of todos belonging to the authenticated user, filtered by status if specified.

**Request Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Query Parameters:**
- `skip` (optional, default: 0): Number of todos to skip
- `limit` (optional, default: 50): Maximum number of todos to return
- `status` (optional): Filter by status (`pending`, `completed`, or `archived`)

**Response Body (200 OK):**
```json
{
  "items": [
    {
      "id": "todo-uuid-1",
      "user_id": "user-uuid-1234",
      "title": "Complete project documentation",
      "description": "Write comprehensive API documentation",
      "status": "pending",
      "priority": "high",
      "created_at": "2026-02-07T10:30:00Z",
      "updated_at": "2026-02-07T10:30:00Z",
      "completed_at": null
    },
    {
      "id": "todo-uuid-2",
      "user_id": "user-uuid-1234",
      "title": "Review pull requests",
      "description": "Review and approve pending PRs",
      "status": "completed",
      "priority": "medium",
      "created_at": "2026-02-06T15:20:00Z",
      "updated_at": "2026-02-07T09:15:00Z",
      "completed_at": "2026-02-07T09:15:00Z"
    }
  ],
  "total": 2,
  "skip": 0,
  "limit": 50
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | `Unauthorized` | Missing or invalid authentication token |
| 403 | `Forbidden` | Token is expired or revoked |
| 422 | `ValidationError` | Invalid query parameters |

**Example cURL:**
```bash
curl -X GET "http://localhost:8000/api/todos?status=pending&limit=10" \
  -H "Authorization: Bearer <access_token>"
```

---

### POST /api/todos

Create a new todo.

**Description:** Creates a new todo item for the authenticated user.

**Request Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation",
  "priority": "high"
}
```

**Response Body (201 Created):**
```json
{
  "id": "todo-uuid-3",
  "user_id": "user-uuid-1234",
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation",
  "status": "pending",
  "priority": "high",
  "created_at": "2026-02-07T10:30:00Z",
  "updated_at": "2026-02-07T10:30:00Z",
  "completed_at": null
}
```

**Field Constraints:**
- `title` (required): 1-200 characters
- `description` (optional): 0-1000 characters
- `priority` (optional): `low`, `medium`, `high` (default: `medium`)

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | `InvalidTitle` | Title is empty or exceeds 200 characters |
| 401 | `Unauthorized` | Missing or invalid authentication token |
| 403 | `Forbidden` | Token is expired or revoked |
| 422 | `ValidationError` | Invalid request body format |

**Example cURL:**
```bash
curl -X POST http://localhost:8000/api/todos \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation",
    "priority": "high"
  }'
```

---

### PUT /api/todos/{id}

Update an entire todo item.

**Description:** Replaces the entire todo item with the provided data. All required fields must be included.

**Request Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (required): UUID of the todo to update

**Request Body:**
```json
{
  "title": "Updated todo title",
  "description": "Updated description",
  "priority": "medium",
  "status": "pending"
}
```

**Response Body (200 OK):**
```json
{
  "id": "todo-uuid-1",
  "user_id": "user-uuid-1234",
  "title": "Updated todo title",
  "description": "Updated description",
  "status": "pending",
  "priority": "medium",
  "created_at": "2026-02-07T10:30:00Z",
  "updated_at": "2026-02-07T11:45:00Z",
  "completed_at": null
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | `InvalidTitle` | Title is empty or exceeds 200 characters |
| 401 | `Unauthorized` | Missing or invalid authentication token |
| 403 | `Forbidden` | User does not own this todo |
| 404 | `NotFound` | Todo with specified ID does not exist |
| 422 | `ValidationError` | Invalid request body format |

**Example cURL:**
```bash
curl -X PUT http://localhost:8000/api/todos/todo-uuid-1 \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated todo title",
    "description": "Updated description",
    "priority": "medium",
    "status": "pending"
  }'
```

---

### DELETE /api/todos/{id}

Delete a todo item.

**Description:** Permanently removes a todo item and all associated data.

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `id` (required): UUID of the todo to delete

**Response Body (204 No Content):**
```
(no body)
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | `Unauthorized` | Missing or invalid authentication token |
| 403 | `Forbidden` | User does not own this todo |
| 404 | `NotFound` | Todo with specified ID does not exist |

**Example cURL:**
```bash
curl -X DELETE http://localhost:8000/api/todos/todo-uuid-1 \
  -H "Authorization: Bearer <access_token>"
```

---

### PATCH /api/todos/{id}/complete

Mark a todo as complete.

**Description:** Updates the todo status to `completed` and sets the `completed_at` timestamp.

**Request Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (required): UUID of the todo to complete

**Request Body:**
```json
{}
```

**Response Body (200 OK):**
```json
{
  "id": "todo-uuid-1",
  "user_id": "user-uuid-1234",
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation",
  "status": "completed",
  "priority": "high",
  "created_at": "2026-02-07T10:30:00Z",
  "updated_at": "2026-02-07T11:45:00Z",
  "completed_at": "2026-02-07T11:45:00Z"
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | `Unauthorized` | Missing or invalid authentication token |
| 403 | `Forbidden` | User does not own this todo |
| 404 | `NotFound` | Todo with specified ID does not exist |
| 409 | `AlreadyCompleted` | Todo is already marked as completed |

**Example cURL:**
```bash
curl -X PATCH http://localhost:8000/api/todos/todo-uuid-1/complete \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## Health Endpoints

### GET /health

Check API server health status.

**Description:** Simple health check endpoint that does not require authentication. Returns immediately if the server is running.

**Request Headers:**
```
(none required)
```

**Response Body (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-07T11:45:00Z",
  "version": "1.0.0"
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 503 | `ServiceUnavailable` | Server is not operational |

**Example cURL:**
```bash
curl -X GET http://localhost:8000/health
```

---

## Error Handling

### Error Response Format

All error responses follow a consistent format:

```json
{
  "detail": "Error description",
  "error_code": "ERROR_CODE",
  "timestamp": "2026-02-07T11:45:00Z",
  "path": "/api/todos/invalid-id"
}
```

### Common HTTP Status Codes

| Status | Description |
|--------|-------------|
| 200 | Success - Request completed successfully |
| 201 | Created - Resource created successfully |
| 204 | No Content - Success with no response body |
| 400 | Bad Request - Invalid request format or constraints |
| 401 | Unauthorized - Missing or invalid authentication |
| 403 | Forbidden - Authenticated but insufficient permissions |
| 404 | Not Found - Resource does not exist |
| 409 | Conflict - Request conflicts with current state |
| 422 | Unprocessable Entity - Validation error in request data |
| 500 | Internal Server Error - Server error |
| 503 | Service Unavailable - Server is down or unreachable |

### Retry Strategy

Implement exponential backoff for the following status codes:
- `429` (Too Many Requests) - Service rate limiting
- `500` (Internal Server Error) - Temporary server issues
- `503` (Service Unavailable) - Server maintenance

---

## Authentication Flow

The API uses JWT (JSON Web Token) based authentication via Better Auth:

### Token-Based Authentication Workflow

1. **User Registration:**
   - Client calls `POST /api/auth/register` with email, password, and name
   - Backend creates user account and hashes password
   - Response includes user details

2. **User Login:**
   - Client calls `POST /api/auth/login` with email and password
   - Backend validates credentials
   - Backend generates JWT token signed with secret key
   - Response includes access token and user details

3. **Authenticated Requests:**
   - Client includes token in `Authorization: Bearer <token>` header
   - Backend validates token signature
   - Backend identifies user from token claims
   - Backend processes request scoped to authenticated user

4. **Token Validation:**
   - Each protected endpoint verifies the token signature
   - Token claims are decoded to extract user ID
   - User ownership is verified before returning data

### Security Considerations

- **HTTPS Only:** Always use HTTPS in production to protect tokens in transit
- **Token Storage:** Store tokens securely on the client (e.g., HttpOnly cookies)
- **Token Expiration:** Tokens expire after a set duration; use refresh tokens for extended sessions
- **Secret Key:** Backend uses a secure secret key to sign and verify tokens
- **User Isolation:** All user data is filtered by user ID extracted from token

---

## Getting Started

### Prerequisites

- Python 3.9+
- FastAPI
- SQLModel
- Neon Serverless PostgreSQL account
- Better Auth credentials

### Running the Backend

```bash
# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your database and auth credentials

# Run the server
uvicorn main:app --reload
```

### Accessing API Documentation

Once the server is running:
- **Swagger UI (Interactive):** http://localhost:8000/docs
- **ReDoc (Alternative UI):** http://localhost:8000/redoc
- **OpenAPI Schema (JSON):** http://localhost:8000/openapi.json

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Limit:** 100 requests per minute per user
- **Headers:** Response includes rate limit info:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining in current window
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

---

## Support and Feedback

For issues, bugs, or feature requests, please create an issue in the project repository.
