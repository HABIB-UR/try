# Tasks: Authentication & API Security (Better Auth + JWT)

**Feature**: 002-auth-api-security
**Branch**: 002-auth-api-security
**Created**: 2026-02-07
**Status**: Ready for implementation

**Input**: Design documents from `/specs/002-auth-api-security/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Configure Better Auth and update environment for shared JWT secret

### Tasks
- [X] T001 Install Better Auth packages in frontend (npm install better-auth @better-auth/jwt) in frontend/package.json
- [X] T002 [P] Update backend .env.example with BETTER_AUTH_SECRET configuration in .env.example
- [X] T003 [P] Update frontend .env.local.example with BETTER_AUTH_SECRET in frontend/.env.local.example
- [X] T004 Update backend config.py to use BETTER_AUTH_SECRET instead of JWT_SECRET in src/app/config.py

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core authentication infrastructure that MUST be complete before user stories

**CRITICAL**: No user story work can begin until this phase is complete

### Tasks
- [X] T005 Create Better Auth configuration file with JWT plugin in frontend/src/lib/auth.ts
- [X] T006 [P] Create Better Auth API route handler in frontend/src/app/api/auth/[...all]/route.ts
- [X] T007 Update backend auth.py to read BETTER_AUTH_SECRET and use HS256 algorithm in src/app/auth.py
- [X] T008 Create JWT token verification utility function in src/app/auth.py
- [X] T009 Update get_current_user dependency to use new JWT verification in src/app/auth.py

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - User Registration (Priority: P1)

**Goal**: Enable new users to register with email and password via Better Auth

**Independent Test**: Register a new user and verify JWT token is issued and can access dashboard

### Tasks
- [X] T010 [P] [US1] Create Better Auth signup handler in frontend/src/lib/auth.ts
- [X] T011 [P] [US1] Update RegisterForm component to use Better Auth in frontend/src/components/Auth/RegisterForm.tsx
- [X] T012 [US1] Update register page to integrate with Better Auth in frontend/src/app/auth/register/page.tsx
- [X] T013 [US1] Update backend registration endpoint to align JWT format with Better Auth in src/app/routes/auth.py
- [X] T014 [US1] Add email uniqueness validation error handling (409 response) in src/app/routes/auth.py
- [X] T015 [US1] Add email format validation with proper error messages in src/app/routes/auth.py

**Checkpoint**: User Story 1 complete - users can register and receive JWT token

---

## Phase 4: User Story 2 - User Sign In (Priority: P1)

**Goal**: Enable existing users to sign in and receive JWT token via Better Auth

**Independent Test**: Sign in with valid credentials and verify JWT token grants API access

### Tasks
- [X] T016 [P] [US2] Create Better Auth signin handler in frontend/src/lib/auth.ts
- [X] T017 [P] [US2] Update LoginForm component to use Better Auth in frontend/src/components/Auth/LoginForm.tsx
- [X] T018 [US2] Update login page to integrate with Better Auth in frontend/src/app/auth/login/page.tsx
- [X] T019 [US2] Update backend login endpoint to return JWT in Better Auth format in src/app/routes/auth.py
- [X] T020 [US2] Implement generic "Invalid credentials" error message (no field revelation) in src/app/routes/auth.py
- [X] T021 [US2] Add redirect to dashboard on successful login in frontend/src/app/auth/login/page.tsx

**Checkpoint**: User Story 2 complete - users can sign in and receive JWT token

---

## Phase 5: User Story 3 - Authenticated API Access (Priority: P1)

**Goal**: Frontend automatically attaches JWT to API requests, backend verifies independently

**Independent Test**: Make API request with valid/invalid/missing tokens and verify correct responses

### Tasks
- [X] T022 [P] [US3] Update AuthContext to get JWT from Better Auth session in frontend/src/contexts/AuthContext.tsx
- [X] T023 [P] [US3] Update useAuth hook to expose JWT token in frontend/src/hooks/useAuth.ts
- [X] T024 [US3] Update API client to automatically attach Bearer token from Better Auth in frontend/src/lib/api.ts
- [X] T025 [US3] Add 401 response handling with redirect to login in frontend/src/lib/api.ts
- [X] T026 [US3] Verify JWT signature verification in backend auth dependency in src/app/auth.py
- [X] T027 [US3] Add token expiration validation in backend in src/app/auth.py
- [X] T028 [US3] Add malformed token error handling (401 response) in src/app/auth.py

**Checkpoint**: User Story 3 complete - API requests authenticated via JWT

---

## Phase 6: User Story 4 - User Data Isolation (Priority: P1)

**Goal**: Users can only access their own data, attempts to access others' data return 404

**Independent Test**: Create two users, attempt cross-user data access, verify 404 responses

### Tasks
- [X] T029 [P] [US4] Verify all todo endpoints filter by authenticated user_id in src/app/routes/todos.py
- [X] T030 [P] [US4] Ensure GET /api/todos returns only current user's todos in src/app/routes/todos.py
- [X] T031 [US4] Ensure PUT /api/todos/{id} returns 404 for non-owned todos in src/app/routes/todos.py
- [X] T032 [US4] Ensure DELETE /api/todos/{id} returns 404 for non-owned todos in src/app/routes/todos.py
- [X] T033 [US4] Ensure PATCH /api/todos/{id}/complete returns 404 for non-owned todos in src/app/routes/todos.py
- [X] T034 [US4] Add user_id extraction from JWT payload for ownership checks in src/app/auth.py

**Checkpoint**: User Story 4 complete - full user data isolation enforced

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Security hardening, error handling, and verification

### Tasks
- [X] T035 [P] Add backend tests for registration with valid/invalid/duplicate email in tests/test_auth.py
- [X] T036 [P] Add backend tests for login with valid/invalid credentials in tests/test_auth.py
- [X] T037 [P] Add backend tests for JWT verification (valid/expired/malformed) in tests/test_auth.py
- [X] T038 [P] Add backend tests for user data isolation (cross-user access denied) in tests/test_todos.py
- [X] T039 [P] Update API documentation with Better Auth integration in docs/API.md
- [X] T040 Verify CORS configuration allows frontend origin in src/app/main.py
- [X] T041 Add security headers middleware (X-Content-Type-Options, etc.) in src/app/main.py
- [X] T042 Final integration test: full auth flow from registration to protected API access

---

## Dependencies

### User Story Completion Order
- **Phase 2 (Foundation)** MUST complete before any user story
- **US1 (Registration)** and **US2 (Sign In)** can run in parallel after foundation
- **US3 (API Access)** depends on US1 or US2 (need token to test)
- **US4 (Data Isolation)** depends on US3 (need authenticated requests)

### Blocking Dependencies
- T001-T004 (Setup) → blocks T005-T009 (Foundation)
- T005-T009 (Foundation) → blocks all user story phases
- T007-T009 (Backend JWT) → blocks T026-T028 (US3 backend verification)

## Parallel Execution Opportunities

### Within Setup Phase
- T002 and T003 can run in parallel (different env files)

### Within Foundation Phase
- T006 can run parallel to T007-T009 (frontend vs backend)

### Across User Stories
- US1 (T010-T015) and US2 (T016-T021) can run in parallel
- US3 frontend tasks (T022-T025) can run parallel to US3 backend tasks (T026-T028)

### Within Polish Phase
- All test tasks (T035-T038) can run in parallel

## Implementation Strategy

### MVP Scope
- **Minimum Viable**: Phase 1-2 (Setup + Foundation) + US1 (Registration) + US3 (API Access)
- This delivers: New user registration with working JWT authentication

### Incremental Delivery
1. Complete Phase 1-2 (Setup + Foundation)
2. Complete US1 (Registration) - users can create accounts
3. Complete US2 (Sign In) - returning users can authenticate
4. Complete US3 (API Access) - frontend-backend JWT flow working
5. Complete US4 (Data Isolation) - security hardening
6. Complete Phase 7 (Polish) - tests and documentation

### Agent Utilization
- Use `auth-auditor` agent for T005-T009, T026-T028, T035-T038 (authentication tasks)
- Use `nextjs-frontend-dev` agent for T010-T012, T016-T018, T022-T025 (frontend tasks)
- Use `fastapi-backend-validator` agent for T013-T015, T019-T020, T029-T034 (backend tasks)
