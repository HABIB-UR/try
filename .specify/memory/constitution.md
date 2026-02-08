<!-- SYNC IMPACT REPORT
Version change: N/A (initial version) → 1.0.0
Modified principles: None (new document)
Added sections: All sections as initial constitution
Removed sections: None
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ updated
  - .specify/templates/spec-template.md ✅ updated
  - .specify/templates/tasks-template.md ✅ updated
  - .specify/templates/commands/*.md ⚠ pending
Follow-up TODOs: None
-->
# Phase II – Todo Full-Stack Web Application Constitution

## Core Principles

### Spec-driven development
All implementation must follow the spec → plan → tasks → implementation workflow. No feature implementation outside defined specs. Each implementation step must be derived from a plan, which must be derived strictly from specs.

### Security-first architecture
Authentication and authorization must be implemented before core functionality. All API endpoints require valid JWT after authentication. Requests without token must return 401 Unauthorized. Token signature must be verified using shared secret. User must never access or modify another user's data.

### User data isolation and correctness
Every API endpoint must enforce authenticated user ownership. All task operations must be scoped to authenticated user ID. Database persistence required (no in-memory storage). Multi-user support required with proper data separation.

### Deterministic, reproducible agent output
Claude Code must generate all code (no manual edits). Errors must be handled deterministically (401, 403, 404, 500). All functionality must trace directly to written specs. No shared session storage between frontend and backend.

### Zero manual coding
All implementation via Claude Code agents only. No manual coding allowed. Every implementation step must be derived from a plan. Iterative refinement allowed only through spec updates.

## Technology Constraints

- Frontend: Next.js 16+ (App Router only)
- Backend: Python FastAPI
- ORM: SQLModel
- Database: Neon Serverless PostgreSQL
- Authentication: Better Auth with JWT
- Secrets managed via environment variables only
- All task operations scoped to authenticated user ID
- RESTful API design with clear resource boundaries
- Stateless backend authentication using JWT tokens

## Architecture Rules

- REST API must implement all 5 basic-level features
- Must function as a real web application end-to-end
- Responsive frontend required
- JWT-based authentication must be verified server-side
- Frontend, backend, and auth boundaries must be explicit
- Token expiration must be enforced
- All API endpoints must implement authenticated user ownership enforcement

## Governance

All specs fully implemented without deviation. Authentication correctly enforced at all layers. Success criteria include end-to-end functionality with proper authentication, multi-user support, and responsive frontend. Every API endpoint enforces authenticated user ownership. Technology constraints must be followed strictly.

**Version**: 1.0.0 | **Ratified**: 2026-02-06 | **Last Amended**: 2026-02-06