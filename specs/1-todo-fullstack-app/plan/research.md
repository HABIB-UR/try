# Research Summary: Phase II – Todo Full-Stack Web Application

## 0.1: Next.js 16+ App Router Setup

**Decision**: Use standard Next.js 16+ App Router project structure with `app` directory, `layout.js`, `page.js`, and route segments.

**Rationale**: This follows Next.js 16+ conventions and provides the best developer experience with server components, streaming, and built-in routing capabilities. The App Router offers better performance and bundle splitting compared to the legacy Pages router.

**Alternatives considered**:
- Pages router: Legacy approach, less performant, no server components
- Static site generation: Not suitable for dynamic todo application requiring real-time user data

**Resources referenced**:
- Next.js 16+ App Router documentation
- Official Next.js file convention guide

## 0.2: Better Auth Integration with Next.js

**Decision**: Implement Better Auth using their official Next.js adapter with middleware for route protection.

**Rationale**: Better Auth provides a complete authentication solution with built-in JWT handling, session management, and database integration. The Next.js middleware ensures proper authentication checks on protected routes while maintaining optimal performance.

**Alternatives considered**:
- Custom JWT solution: Would require reinventing authentication security best practices
- Third-party providers only: Limits flexibility and doesn't address basic username/password auth

**Resources referenced**:
- Better Auth Next.js integration documentation
- JWT security best practices
- Next.js middleware documentation

## 0.3: FastAPI Project Structure for Todo API

**Decision**: Implement modular FastAPI structure with separate modules for models, schemas, routes, and database configuration.

**Rationale**: Modular structure promotes maintainability, testing, and separation of concerns. This organization follows FastAPI best practices and scales well as the application grows.

Structure:
```
backend/
├── app/
│   ├── models/          # SQLModel models
│   ├── schemas/         # Pydantic schemas
│   ├── routes/          # API route handlers
│   ├── database.py      # Database session setup
│   └── auth.py          # Authentication utilities
```

**Alternatives considered**:
- Monolithic approach: Difficult to maintain as application grows
- Django-like structure: Not idiomatic for FastAPI applications

**Resources referenced**:
- FastAPI tutorial and documentation
- SQLModel integration guides
- Production-ready FastAPI application structures

## 0.4: SQLModel Data Modeling for User-Todo Relationship

**Decision**: Create a relational model with User and Todo classes linked by foreign key, enforcing referential integrity.

**Rationale**: Foreign key relationships ensure data consistency and enable efficient queries. This normalized approach prevents data duplication and maintains referential integrity.

**Model definitions**:
- User model with UUID primary key, email uniqueness constraint
- Todo model with foreign key to User, ensuring each todo belongs to exactly one user
- Proper indexing for efficient queries by user_id

**Alternatives considered**:
- Denormalized approach: Could lead to data inconsistency
- No foreign key constraints: Would allow orphaned todos without associated users

**Resources referenced**:
- SQLModel documentation and examples
- PostgreSQL foreign key constraints
- Database normalization principles

## 0.5: JWT Authentication Middleware in FastAPI

**Decision**: Create custom dependency using `python-jose` library to decode and validate JWT tokens, extracting user identity.

**Rationale**: FastAPI's dependency injection system works well with JWT validation. The custom dependency approach allows reusable authentication logic across all protected endpoints while maintaining type safety.

Implementation pattern:
- Extract `Authorization: Bearer <token>` header
- Decode and validate JWT using secret
- Extract user ID and verify token hasn't expired
- Return user identity for use in route handlers

**Alternatives considered**:
- Third-party auth libraries: May not integrate well with Better Auth's JWT format
- Custom session management: Would require server-side state, violating stateless requirement

**Resources referenced**:
- FastAPI security documentation
- JWT RFC standards
- python-jose library documentation
- Authentication best practices