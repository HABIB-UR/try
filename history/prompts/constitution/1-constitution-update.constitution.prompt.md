---
id: 1
title: constitution-update
stage: constitution
date: 2026-02-06
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: user
command: /sp.constitution
labels: [constitution,update,spec-driven]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
---

## Prompt

/sp.constitution

Project: Phase II – Todo Full-Stack Web Application (Agentic Dev Stack)

Core principles:
- Spec-driven development (spec → plan → tasks → implementation)
- Security-first architecture (auth before trust)
- User data isolation and correctness
- Deterministic, reproducible agent output
- Zero manual coding (all implementation via Claude Code)

Key standards:
- All functionality must trace directly to written specs
- Every API endpoint must enforce authenticated user ownership
- JWT-based authentication must be verified server-side
- Frontend, backend, and auth boundaries must be explicit
- Errors must be handled deterministically (401, 403, 404, 500)

Technology constraints:
- Frontend: Next.js 16+ (App Router only)
- Backend: Python FastAPI
- ORM: SQLModel
- Database: Neon Serverless PostgreSQL
- Authentication: Better Auth with JWT
- Secrets managed via environment variables only

Architecture rules:
- RESTful API design with clear resource boundaries
- Stateless backend authentication using JWT tokens
- No shared session storage between frontend and backend
- All task operations scoped to authenticated user ID
- Database persistence required (no in-memory storage)

Agent execution rules:
- Claude Code must generate all code (no manual edits)
- Each implementation step must be derived from a plan
- Plans must be derived strictly from specs
- No feature implementation outside defined specs
- Iterative refinement allowed only through spec updates

Security requirements:
- All API endpoints require valid JWT after authentication
- Requests without token must return 401 Unauthorized
- Token signature must be verified using shared secret
- Token expiration must be enforced
- User must never access or modify another user's data

Constraints:
- Multi-user support required
- Responsive frontend required
- REST API must implement all 5 basic-level features
- Must function as a real web application end-to-end

Success criteria:
- All specs fully implemented without deviation
- Authentication correctly enforced at all layers

## Response snapshot

Created the project constitution file at .specify/memory/constitution.md with the following sections:

1. Core Principles:
   - Spec-driven development
   - Security-first architecture
   - User data isolation and correctness
   - Deterministic, reproducible agent output
   - Zero manual coding

2. Technology Constraints:
   - Frontend: Next.js 16+ (App Router only)
   - Backend: Python FastAPI
   - ORM: SQLModel
   - Database: Neon Serverless PostgreSQL
   - Authentication: Better Auth with JWT

3. Architecture Rules:
   - REST API implementation of 5 basic-level features
   - End-to-end functionality requirements
   - JWT authentication verification
   - User ownership enforcement

4. Governance:
   - Compliance with all specs and technology constraints

## Outcome

- ✅ Impact: Created new constitution file at .specify/memory/constitution.md with project principles
- 🧪 Tests: No tests needed for constitution creation
- 📁 Files: Modified .specify/memory/constitution.md
- 🔁 Next prompts: Proceed with spec creation using /sp.specify
- 🧠 Reflection: Constitution properly established with all required principles and constraints

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Create feature specification