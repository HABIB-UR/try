# Feature Specification: Authentication & API Security (Better Auth + JWT)

**Feature Branch**: `2-auth-api-security`
**Created**: 2026-02-07
**Status**: Draft
**Input**: User description: "Spec 2 – Authentication & API Security (Better Auth + JWT)"

## Overview

This specification defines the secure authentication system spanning the Next.js frontend and FastAPI backend. The system uses Better Auth for user management with JWT tokens for stateless API authentication, ensuring strict user isolation at the API level.

**Target Audience**:
- Hackathon judges evaluating security and cross-stack auth design
- Developers reviewing stateless authentication architectures

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Registration (Priority: P1)

A new user visits the application and creates an account with their email and password. Upon successful registration, they receive a JWT token that grants them access to protected features.

**Why this priority**: Registration is the entry point to the application. Without it, no other features are accessible.

**Independent Test**: Can be fully tested by attempting to register with valid credentials and verifying the user can immediately access their dashboard.

**Acceptance Scenarios**:

1. **Given** a visitor on the registration page, **When** they submit valid email and password, **Then** the system creates their account and issues a JWT token
2. **Given** a visitor on the registration page, **When** they submit an email already in use, **Then** the system displays an error message without creating a duplicate account
3. **Given** a visitor on the registration page, **When** they submit an invalid email format, **Then** the system displays a validation error

---

### User Story 2 - User Sign In (Priority: P1)

An existing user returns to the application and signs in with their credentials. Upon successful authentication, they receive a JWT token that allows them to access their personal data.

**Why this priority**: Sign in is required for returning users to access the application. Equal priority with registration as both enable core access.

**Independent Test**: Can be fully tested by signing in with valid credentials and verifying access to protected resources.

**Acceptance Scenarios**:

1. **Given** an existing user on the sign-in page, **When** they submit correct credentials, **Then** the system issues a JWT token and redirects to their dashboard
2. **Given** a user on the sign-in page, **When** they submit incorrect password, **Then** the system displays "Invalid credentials" without revealing which field was wrong
3. **Given** a user on the sign-in page, **When** they submit a non-existent email, **Then** the system displays "Invalid credentials" (same message as wrong password)

---

### User Story 3 - Authenticated API Access (Priority: P1)

A signed-in user makes requests to the API to manage their tasks. Every request includes their JWT token, which the backend verifies independently before processing the request.

**Why this priority**: Core functionality depends on secure API access. Users cannot interact with their data without this.

**Independent Test**: Can be fully tested by making API requests with valid/invalid tokens and verifying appropriate responses.

**Acceptance Scenarios**:

1. **Given** a user with a valid JWT token, **When** they request their tasks, **Then** the API returns only their tasks
2. **Given** a user with an expired JWT token, **When** they make any API request, **Then** the API returns 401 Unauthorized
3. **Given** a request without any token, **When** sent to a protected endpoint, **Then** the API returns 401 Unauthorized

---

### User Story 4 - User Data Isolation (Priority: P1)

The system ensures that authenticated users can only access and modify their own data. Any attempt to access another user's resources is blocked.

**Why this priority**: Data isolation is a security requirement. Without it, the multi-user system is fundamentally broken.

**Independent Test**: Can be fully tested by attempting to access another user's tasks with a valid token and verifying denial.

**Acceptance Scenarios**:

1. **Given** User A is authenticated, **When** they attempt to view User B's tasks, **Then** the system returns 404 Not Found (not revealing the resource exists)
2. **Given** User A is authenticated, **When** they attempt to modify User B's task, **Then** the system returns 404 Not Found
3. **Given** User A is authenticated, **When** they attempt to delete User B's task, **Then** the system returns 404 Not Found

---

### Edge Cases

- What happens when a JWT token is malformed? System returns 401 Unauthorized
- What happens when the JWT signature is invalid? System returns 401 Unauthorized
- What happens when a user's session is active but their account is deleted? API requests fail with 401 Unauthorized
- What happens when the shared secret changes? All existing tokens become invalid
- What happens during concurrent requests with the same token? All requests are processed independently (stateless)

## Requirements *(mandatory)*

### Functional Requirements

**Authentication Flow**:
- **FR-001**: System MUST allow users to register with email and password via Better Auth
- **FR-002**: System MUST allow users to sign in with email and password via Better Auth
- **FR-003**: System MUST issue a signed JWT token upon successful authentication
- **FR-004**: System MUST include user identity (user ID, email) in the JWT payload

**Token Management**:
- **FR-005**: System MUST sign JWT tokens using a shared secret from BETTER_AUTH_SECRET environment variable
- **FR-006**: System MUST set token expiration time (default: 24 hours)
- **FR-007**: System MUST NOT store session state on the backend (stateless authentication)

**API Security**:
- **FR-008**: Frontend MUST include JWT token in Authorization header as "Bearer <token>" for all API requests
- **FR-009**: Backend MUST extract and verify JWT signature on every protected request
- **FR-010**: Backend MUST decode token to obtain user ID and email
- **FR-011**: Backend MUST reject requests with missing, expired, or invalid tokens with 401 Unauthorized
- **FR-012**: Backend MUST filter all data queries by the authenticated user's ID

**User Isolation**:
- **FR-013**: System MUST ensure users can only access resources they own
- **FR-014**: System MUST return 404 Not Found when accessing non-owned resources (not 403 Forbidden)
- **FR-015**: System MUST match authenticated user ID against resource ownership before any operation

**Security Requirements**:
- **FR-016**: System MUST NOT hardcode secrets in source code
- **FR-017**: System MUST verify JWT signature on every request (no caching of verification results)
- **FR-018**: System MUST enforce token expiration

### Key Entities

- **User**: Represents an authenticated account holder with unique email, hashed password, and system-assigned ID
- **JWT Token**: Self-contained credential containing user identity, issued timestamp, and expiration; signed with shared secret
- **Session**: Conceptual only - no server-side session storage; authentication state lives entirely in the JWT token

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete registration in under 30 seconds
- **SC-002**: Users can sign in and reach their dashboard in under 10 seconds
- **SC-003**: 100% of API requests without valid tokens are rejected with 401 status
- **SC-004**: 100% of attempts to access another user's data are blocked
- **SC-005**: System operates statelessly - no backend session storage required
- **SC-006**: Token verification adds less than 50ms overhead to API requests
- **SC-007**: All secrets are loaded from environment variables, never from source code

## Assumptions

- Better Auth is configured with JWT plugin enabled
- A secure random BETTER_AUTH_SECRET (minimum 32 characters) is configured in environment
- The frontend and backend share the same JWT secret for verification
- Token expiration is set to 24 hours by default (configurable via environment)
- Email addresses are used as unique user identifiers
- Password requirements follow Better Auth defaults (minimum 8 characters)

## Out of Scope

- OAuth providers (Google, GitHub, etc.)
- Role-based access control (RBAC)
- Refresh token rotation
- Password reset flows
- Multi-factor authentication (MFA)
- Account lockout after failed attempts
- Rate limiting on authentication endpoints

## Dependencies

- Better Auth library configured on Next.js frontend
- Shared JWT secret accessible to both frontend (Better Auth) and backend (FastAPI)
- Environment variable management for secrets
