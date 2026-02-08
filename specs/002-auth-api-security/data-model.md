# Data Model: Authentication & API Security

**Feature**: 002-auth-api-security
**Date**: 2026-02-07

## Entities

### User

The User entity represents an authenticated account holder in the system.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | Primary Key, Auto-generated | Unique identifier for the user |
| email | String | Unique, Required, Valid email format | User's email address (login identifier) |
| hashed_password | String | Required, Min 60 chars (bcrypt) | Bcrypt-hashed password |
| created_at | DateTime | Auto-set on creation | Account creation timestamp |
| updated_at | DateTime | Auto-updated on modification | Last update timestamp |

**Relationships**:
- One User → Many Todos (owner relationship)

**Validation Rules**:
- Email must be unique across all users
- Email must be valid format (RFC 5322)
- Password minimum 8 characters before hashing
- Password hashed with bcrypt (cost factor 12)

---

### JWT Token (Transient)

The JWT Token is not stored in the database. It exists only as a signed credential passed between systems.

| Claim | Type | Source | Description |
|-------|------|--------|-------------|
| sub | String (UUID) | User.id | Subject - the user's unique identifier |
| email | String | User.email | User's email address |
| iat | Integer (Unix timestamp) | Auto-generated | Issued At - when token was created |
| exp | Integer (Unix timestamp) | iat + 24 hours | Expiration - when token becomes invalid |

**Signing**:
- Algorithm: HS256 (HMAC with SHA-256)
- Secret: BETTER_AUTH_SECRET environment variable
- Minimum secret length: 32 characters

**Lifecycle**:
1. Created on successful login/registration
2. Included in Authorization header for API requests
3. Verified on every protected API call
4. Expires after 24 hours (requires re-authentication)

---

## State Diagram: Authentication Flow

```
┌─────────────┐
│ Unauthenti- │
│   cated     │
└──────┬──────┘
       │
       │ Register/Login (valid credentials)
       ▼
┌─────────────┐
│ Authenti-   │◄────────────────────┐
│   cated     │                     │
└──────┬──────┘                     │
       │                            │
       │ Token Expires              │ Re-authenticate
       ▼                            │
┌─────────────┐                     │
│   Expired   │─────────────────────┘
└─────────────┘
```

---

## Existing Schema (Reference)

The User model already exists in the codebase at `src/app/models/user.py`. This feature updates the authentication mechanism but does not modify the database schema.

```python
# Existing User model (no changes needed)
class User(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

---

## Data Isolation

All data access is filtered by the authenticated user's ID:

| Entity | Isolation Rule |
|--------|----------------|
| Todo | `WHERE user_id = authenticated_user.id` |

Attempting to access resources owned by another user returns 404 Not Found (not 403 Forbidden) to prevent user enumeration.
