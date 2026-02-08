# Quickstart: Authentication & API Security

**Feature**: 002-auth-api-security
**Date**: 2026-02-07

## Prerequisites

- Node.js 18+ installed
- Python 3.11+ installed
- Neon PostgreSQL database configured
- Git repository cloned

## Environment Setup

### 1. Generate Shared Secret

```bash
# Generate a secure 32+ character secret
openssl rand -hex 32
# Example output: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

### 2. Backend Environment (.env)

```bash
# D:\hack2-ii\.env
DATABASE_URL=postgresql://neondb_owner:xxx@ep-xxx.neon.tech/neondb?sslmode=require
BETTER_AUTH_SECRET=your-generated-secret-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=1440
```

### 3. Frontend Environment (frontend/.env.local)

```bash
# D:\hack2-ii\frontend\.env.local
BETTER_AUTH_SECRET=your-generated-secret-here
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Important**: Both files must use the **same** BETTER_AUTH_SECRET value.

## Installation

### Backend

```bash
cd D:\hack2-ii
pip install -r requirements.txt
```

### Frontend

```bash
cd D:\hack2-ii\frontend
npm install better-auth @better-auth/jwt
npm install
```

## Running the Application

### Terminal 1: Backend

```bash
cd D:\hack2-ii
python -m uvicorn src.app.main:app --reload --port 8000
```

### Terminal 2: Frontend

```bash
cd D:\hack2-ii\frontend
npm run dev
```

## Verification Steps

### 1. Test Registration

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

Expected response:
```json
{
  "message": "User registered successfully",
  "user": {"id": "uuid", "email": "test@example.com"}
}
```

### 2. Test Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

Expected response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

### 3. Test Protected Endpoint

```bash
# Replace <token> with the access_token from login
curl http://localhost:8000/api/todos \
  -H "Authorization: Bearer <token>"
```

Expected response: `[]` (empty array for new user)

### 4. Test Unauthorized Access

```bash
# Without token
curl http://localhost:8000/api/todos
```

Expected response:
```json
{"detail": "Not authenticated"}
```

### 5. Test Invalid Token

```bash
curl http://localhost:8000/api/todos \
  -H "Authorization: Bearer invalid-token"
```

Expected response:
```json
{"detail": "Could not validate credentials"}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Invalid token" on all requests | Verify BETTER_AUTH_SECRET matches in both .env files |
| "Could not validate credentials" | Check token hasn't expired (24 hour limit) |
| CORS errors in browser | Ensure backend CORS allows http://localhost:3000 |
| Database connection failed | Verify DATABASE_URL is correct in .env |

## Security Checklist

- [ ] BETTER_AUTH_SECRET is at least 32 characters
- [ ] Secret is not committed to version control
- [ ] Frontend and backend use identical secrets
- [ ] All API endpoints require authentication (except /auth/*)
- [ ] 401 returned for missing/invalid tokens
- [ ] 404 returned for accessing other users' resources
