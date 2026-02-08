# Implementation Plan: Authentication & API Security (Better Auth + JWT)

**Branch**: `002-auth-api-security` | **Date**: 2026-02-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-auth-api-security/spec.md`

## Summary

Implement secure cross-stack authentication using Better Auth on the Next.js frontend with JWT tokens verified independently by the FastAPI backend. The system enforces stateless authentication with strict user data isolation at the API level.

**Execution Strategy** (from user input):
- Implement authentication before expanding frontend features
- Treat security failures as blocking issues
- Validate auth behavior with negative test cases

## Technical Context

**Language/Version**: Python 3.11+ (Backend), TypeScript 5.x (Frontend)
**Primary Dependencies**: FastAPI, Better Auth, python-jose, SQLModel
**Storage**: Neon Serverless PostgreSQL
**Testing**: pytest (Backend), Jest (Frontend)
**Target Platform**: Web (Next.js 16+ App Router + FastAPI)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: Token verification < 50ms overhead, Auth flows < 30 seconds
**Constraints**: Stateless authentication, no backend session storage, shared JWT secret
**Scale/Scope**: Multi-user application with user data isolation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| Spec-driven development | PASS | Plan derived from spec.md with 18 functional requirements |
| Security-first architecture | PASS | Authentication implemented before core features per FR-001 to FR-018 |
| User data isolation | PASS | FR-012 to FR-015 enforce user ownership on all operations |
| Deterministic agent output | PASS | All error codes defined (401, 404) per edge cases |
| Zero manual coding | PASS | Implementation via Claude Code agents only |

**Technology Compliance**:
- Frontend: Next.js 16+ (App Router) ✅
- Backend: Python FastAPI ✅
- ORM: SQLModel ✅
- Database: Neon Serverless PostgreSQL ✅
- Authentication: Better Auth with JWT ✅
- Secrets via environment variables ✅

**GATE STATUS: PASS** - Proceeding to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/002-auth-api-security/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── auth-api-openapi.yaml
└── tasks.md             # Phase 2 output (via /sp.tasks)
```

### Source Code (repository root)

```text
# Web application structure (frontend + backend)
src/app/                    # FastAPI Backend
├── main.py                 # Application entry, CORS, middleware
├── config.py               # Environment configuration
├── database.py             # SQLModel engine setup
├── auth.py                 # JWT verification utilities (UPDATE)
├── models/
│   └── user.py             # User SQLModel
├── schemas/
│   └── user.py             # Pydantic schemas
└── routes/
    ├── auth.py             # Auth endpoints (UPDATE for Better Auth)
    └── todos.py            # Protected todo endpoints

frontend/                   # Next.js Frontend
├── src/
│   ├── app/                # App Router pages
│   │   ├── auth/           # Login/Register pages
│   │   └── dashboard/      # Protected pages
│   ├── lib/
│   │   ├── api.ts          # API client with JWT (UPDATE)
│   │   └── auth.ts         # Better Auth configuration (NEW)
│   ├── contexts/
│   │   └── AuthContext.tsx # Auth state (UPDATE for Better Auth)
│   ├── hooks/
│   │   └── useAuth.ts      # Auth hook (UPDATE)
│   └── components/
│       └── Auth/           # Auth UI components
└── .env.local              # BETTER_AUTH_SECRET

tests/                      # Backend tests
├── test_auth.py            # Auth endpoint tests (UPDATE)
└── test_todos.py           # Protected route tests
```

**Structure Decision**: Existing web application structure maintained. Updates focused on integrating Better Auth and ensuring JWT verification alignment between frontend and backend.

## Phase 0: Research & Unknown Resolution

### Research Tasks

#### 0.1: Better Auth JWT Plugin Configuration
**Task**: Research how to configure Better Auth with JWT plugin for Next.js App Router
- Decision: Use Better Auth's built-in JWT plugin with custom payload configuration
- Rationale: Official plugin provides secure defaults and integrates with App Router
- Alternatives: Custom JWT implementation (rejected - violates "use established libraries")

#### 0.2: Shared Secret Configuration
**Task**: Research best practices for sharing JWT secret between Better Auth and FastAPI
- Decision: Use BETTER_AUTH_SECRET environment variable, accessible to both systems
- Rationale: Single source of truth prevents secret mismatch issues
- Alternatives: Separate secrets with key exchange (rejected - adds complexity)

#### 0.3: JWT Payload Structure
**Task**: Research optimal JWT payload fields for user identification
- Decision: Include `sub` (user ID), `email`, `iat` (issued at), `exp` (expiration)
- Rationale: Minimal payload with essential identity claims per JWT best practices
- Alternatives: Include roles/permissions (rejected - out of scope per spec)

#### 0.4: FastAPI JWT Verification
**Task**: Research FastAPI middleware for JWT verification with Better Auth tokens
- Decision: Use python-jose for JWT decoding with shared secret verification
- Rationale: Compatible with Better Auth's HS256 signing, widely used in FastAPI
- Alternatives: PyJWT (similar capability, python-jose has better async support)

## Phase 1: Design & Contracts

### Authentication Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js       │     │   Better Auth   │     │   FastAPI       │
│   Frontend      │     │   (Frontend)    │     │   Backend       │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │ 1. Register/Login     │                       │
         │──────────────────────>│                       │
         │                       │                       │
         │ 2. JWT Token          │                       │
         │<──────────────────────│                       │
         │                       │                       │
         │ 3. API Request + JWT  │                       │
         │───────────────────────────────────────────────>│
         │                       │                       │
         │                       │    4. Verify JWT      │
         │                       │    (shared secret)    │
         │                       │                       │
         │ 5. Response (user's data only)                │
         │<───────────────────────────────────────────────│
```

### JWT Token Structure

```json
{
  "sub": "user-uuid-here",
  "email": "user@example.com",
  "iat": 1707350400,
  "exp": 1707436800
}
```

### Environment Variables

```bash
# Shared between Frontend and Backend
BETTER_AUTH_SECRET=your-secure-random-secret-min-32-chars

# Frontend only
NEXT_PUBLIC_API_URL=http://localhost:8000

# Backend only
DATABASE_URL=postgresql://...
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=1440
```

## Implementation Phases

### Step 1: Better Auth Configuration (Frontend)
- Install `better-auth` and `@better-auth/jwt` packages
- Configure Better Auth with JWT plugin in `lib/auth.ts`
- Define JWT payload fields (user ID, email)
- Set token expiration to 24 hours
- Read BETTER_AUTH_SECRET from environment

### Step 2: Frontend API Client Integration
- Update `lib/api.ts` to get token from Better Auth session
- Automatically attach JWT to Authorization header
- Handle 401 responses by redirecting to login
- Surface authentication errors in UI

### Step 3: FastAPI JWT Verification Middleware
- Update `auth.py` to use BETTER_AUTH_SECRET
- Verify JWT signature using python-jose
- Validate token expiration
- Extract user ID and email from payload
- Attach authenticated user to request state

### Step 4: API Route Protection
- Ensure all todo routes use `get_current_user` dependency
- Return 401 for missing/invalid tokens
- Return 404 for non-owned resources
- Add negative test cases for auth failures

## Risk Analysis

| Risk | Mitigation |
|------|------------|
| Secret mismatch between systems | Single BETTER_AUTH_SECRET env var |
| Token expiration sync issues | Backend validates exp claim independently |
| User enumeration via error messages | Generic "Invalid credentials" for all auth failures |
| JWT algorithm confusion | Explicitly set HS256 in both systems |

## Next Steps

1. Run `/sp.tasks` to generate implementation tasks
2. Implement Step 1-4 sequentially (auth before features)
3. Validate with negative test cases (security failures blocking)
