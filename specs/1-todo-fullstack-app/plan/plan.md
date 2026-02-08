# Implementation Plan: Phase II – Todo Full-Stack Web Application

**Created**: 2026-02-06
**Status**: Draft
**Branch**: 1-todo-fullstack-app
**Spec**: specs/1-todo-fullstack-app/spec.md

## Technical Context

### Architecture Overview
- **Frontend**: Next.js 16+ with App Router
- **Backend**: Python FastAPI
- **ORM**: SQLModel
- **Database**: Neon Serverless PostgreSQL
- **Authentication**: Better Auth with JWT

### Dependencies
- **Frontend**: React, Next.js, Better Auth client
- **Backend**: FastAPI, SQLModel, Pydantic, JWT libraries
- **Database**: Neon PostgreSQL driver
- **DevOps**: Environment configuration, secret management

### Known Constraints
- No manual coding - all via Claude Code agents
- Strict adherence to spec → plan → tasks → implementation workflow
- All API endpoints must enforce user authentication
- Data isolation between users required
- Stateless authentication using JWT tokens

## Constitution Check

### Spec Compliance
- ✅ All functionality traces to written specs (spec.md)
- ✅ Multi-user support implemented per requirements
- ✅ JWT-based authentication enforced per requirements

### Technology Compliance
- ✅ Frontend uses Next.js 16+ (App Router only) per constitution
- ✅ Backend uses Python FastAPI per constitution
- ✅ ORM uses SQLModel per constitution
- ✅ Database uses Neon Serverless PostgreSQL per constitution
- ✅ Authentication uses Better Auth with JWT per constitution
- ✅ Secrets managed via environment variables per constitution

### Security Compliance
- ✅ All API endpoints require valid JWT after authentication
- ✅ Requests without token return 401 Unauthorized per constitution
- ✅ Token signature verified using shared secret per constitution
- ✅ Token expiration enforced per constitution
- ✅ Users cannot access other users' data per constitution
- ✅ All task operations scoped to authenticated user ID per constitution

### Architecture Compliance
- ✅ RESTful API design with clear resource boundaries
- ✅ Stateless backend authentication using JWT tokens
- ✅ No shared session storage between frontend and backend
- ✅ Database persistence required (no in-memory storage)

## Phase 0: Research & Unknown Resolution

### Research Tasks

#### 0.1: Next.js 16+ App Router Setup
**Task**: Research the proper project structure for Next.js 16+ with App Router
- Decision: Use standard app directory structure with layout.js and page.js files
- Rationale: Standard Next.js 16+ convention with clear route organization
- Alternatives: Pages router, static site generation (not suitable for dynamic todo app)

#### 0.2: Better Auth Integration with Next.js
**Task**: Research how to properly integrate Better Auth with Next.js App Router
- Decision: Use Better Auth's Next.js integration with middleware for route protection
- Rationale: Official integration that handles JWT generation and session management
- Alternatives: Custom auth solution (violates constitution principle of using established libraries)

#### 0.3: FastAPI Project Structure for Todo API
**Task**: Research optimal FastAPI project structure for todo application
- Decision: Use standard FastAPI structure with models, schemas, routes, and database modules
- Rationale: Promotes separation of concerns and maintainability
- Alternatives: Monolithic approach (doesn't scale with application needs)

#### 0.4: SQLModel Data Modeling for User-Todo Relationship
**Task**: Research best practices for modeling user-todo relationship with SQLModel
- Decision: Use foreign key relationship between User and Todo models with proper constraints
- Rationale: Ensures data integrity and enables efficient querying
- Alternatives: Denormalized approach (violates database normalization principles)

#### 0.5: JWT Authentication Middleware in FastAPI
**Task**: Research implementation of JWT authentication middleware in FastAPI
- Decision: Use custom dependency with jwt.decode() to verify tokens and extract user ID
- Rationale: Standard approach that integrates well with FastAPI's dependency injection
- Alternatives: Third-party auth libraries (may not align with Better Auth integration)

## Phase 1: Data Model & API Design

### 1.1: Data Model Design (`data-model.md`)

#### User Model
- id: UUID (primary key)
- email: String (unique, required)
- hashed_password: String (required)
- created_at: DateTime (default now)
- updated_at: DateTime (auto-update)

#### Todo Model
- id: UUID (primary key)
- title: String (required, max length 200)
- description: String (optional)
- completed: Boolean (default False)
- user_id: UUID (foreign key to User)
- created_at: DateTime (default now)
- updated_at: DateTime (auto-update)
- due_date: DateTime (optional)

### 1.2: API Contracts

#### Authentication Endpoints
- `POST /api/auth/register` - Register new user
  - Request: {email, password}
  - Response: JWT token on success
  - Errors: 400 (invalid data), 409 (email exists)

- `POST /api/auth/login` - Authenticate user
  - Request: {email, password}
  - Response: JWT token on success
  - Errors: 400 (invalid data), 401 (credentials invalid)

#### Todo Endpoints
- `GET /api/todos` - Get user's todos
  - Headers: Authorization: Bearer {token}
  - Response: Array of Todo objects
  - Errors: 401 (unauthorized), 500 (server error)

- `POST /api/todos` - Create new todo
  - Headers: Authorization: Bearer {token}
  - Request: {title, description?, completed?, due_date?}
  - Response: Created Todo object
  - Errors: 401 (unauthorized), 400 (validation error)

- `PUT /api/todos/{id}` - Update todo
  - Headers: Authorization: Bearer {token}
  - Request: {title?, description?, completed?, due_date?}
  - Response: Updated Todo object
  - Errors: 401 (unauthorized), 400 (validation error), 404 (not found)

- `DELETE /api/todos/{id}` - Delete todo
  - Headers: Authorization: Bearer {token}
  - Response: Empty (204)
  - Errors: 401 (unauthorized), 404 (not found)

- `PATCH /api/todos/{id}/complete` - Toggle completion
  - Headers: Authorization: Bearer {token}
  - Request: {completed: boolean}
  - Response: Updated Todo object
  - Errors: 401 (unauthorized), 400 (invalid data), 404 (not found)

### 1.3: Quickstart Guide

1. **Environment Setup**:
   - Install Node.js and Python
   - Set up Neon PostgreSQL instance
   - Configure environment variables (database URL, auth secret)

2. **Frontend Setup**:
   - Initialize Next.js project
   - Configure Better Auth
   - Set up API client with JWT token handling

3. **Backend Setup**:
   - Initialize FastAPI project
   - Configure SQLModel with Neon database
   - Implement JWT authentication middleware
   - Create models, schemas, and routes

4. **Integration**:
   - Connect frontend to backend API
   - Test authentication flow
   - Verify data isolation between users

## Phase 2: Implementation Strategy

### 2.1: Phase Order
1. Backend Core & Data Layer (as specified in user input)
2. Authentication & API Security (as specified in user input)
3. Frontend Application (as specified in user input)

### 2.2: Agent Coordination
- Use `neon-postgres-optimizer` agent for database design and operations
- Use `fastapi-backend-validator` agent for backend API development
- Use `auth-auditor` agent for authentication implementation
- Use `nextjs-frontend-dev` agent for frontend development

### 2.3: Validation Points
- Database schema validation with SQLModel
- API contract compliance verification
- Authentication flow testing
- Cross-user data isolation testing
- JWT token validation at all endpoints