# Implementation Plan: Frontend Application & UX (Next.js)

**Branch**: `003-frontend-app-ux` | **Date**: 2026-02-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-frontend-app-ux/spec.md`

## Summary

Build a complete responsive frontend application using Next.js 16+ App Router that provides user authentication flows, task management dashboard, and CRUD operations for todos. The frontend integrates with the existing FastAPI backend via JWT-authenticated REST API calls.

**Execution Strategy**:
- Build on existing frontend scaffolding in `frontend/` directory
- Fix identified API integration issues (UUID types, field name mismatches)
- Implement all 8 user stories from P1 (core flows) to P2 (supporting features)
- Use optimistic UI updates for better perceived performance

## Technical Context

**Language/Version**: TypeScript 5.x, Next.js 14.0.3 (App Router)
**Primary Dependencies**: React 18, Tailwind CSS 3.3, better-auth 1.2.0
**Storage**: N/A (frontend connects to FastAPI backend with Neon PostgreSQL)
**Testing**: Jest, React Testing Library
**Target Platform**: Web (desktop 1024px+, tablet 768-1023px, mobile 320-767px)
**Project Type**: Web application (frontend only - backend exists)
**Performance Goals**: Initial load < 3s, toggle feedback < 200ms perceived, operations < 15s
**Constraints**: Must integrate with existing backend API contracts, JWT auth via Better Auth
**Scale/Scope**: Multi-user todo application with user data isolation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| Spec-driven development | PASS | Plan derived from spec.md with 25 functional requirements |
| Security-first architecture | PASS | All API calls require JWT, protected routes implemented |
| User data isolation | PASS | Backend enforces ownership, frontend shows only user's data |
| Deterministic agent output | PASS | All error states defined in spec edge cases |
| Zero manual coding | PASS | Implementation via Claude Code agents only |

**Technology Compliance**:
- Frontend: Next.js 14+ (App Router) ✅
- Backend: Python FastAPI ✅ (existing)
- Authentication: Better Auth with JWT ✅ (existing)
- Secrets via environment variables ✅

**GATE STATUS: PASS** - Proceeding to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/003-frontend-app-ux/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (frontend state/types)
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (component contracts)
└── tasks.md             # Phase 2 output (via /sp.tasks)
```

### Source Code (repository root)

```text
# Web application structure - Frontend focus
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout with AuthProvider (UPDATE)
│   │   ├── page.tsx            # Landing page (UPDATE)
│   │   ├── globals.css         # Tailwind + custom styles
│   │   ├── api/auth/[...all]/  # Better Auth API route
│   │   ├── auth/
│   │   │   ├── login/page.tsx  # Sign-in page (UPDATE)
│   │   │   └── register/page.tsx # Sign-up page (UPDATE)
│   │   └── dashboard/
│   │       ├── layout.tsx      # Dashboard layout (UPDATE)
│   │       └── page.tsx        # Main dashboard (UPDATE)
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── LoginForm.tsx   # Login form with validation (UPDATE)
│   │   │   ├── RegisterForm.tsx # Register form with validation (UPDATE)
│   │   │   └── ProtectedRoute.tsx # Auth guard (UPDATE)
│   │   ├── Todo/
│   │   │   ├── TodoItem.tsx    # Single todo display/edit (UPDATE)
│   │   │   ├── TodoForm.tsx    # Create/edit form (UPDATE)
│   │   │   └── TodoList.tsx    # Todo list container (UPDATE)
│   │   └── UI/
│   │       ├── LoadingSpinner.tsx # Loading indicator (UPDATE)
│   │       ├── Alert.tsx       # Error/success messages (UPDATE)
│   │       ├── Toast.tsx       # Toast notifications (UPDATE)
│   │       ├── EmptyState.tsx  # Empty state component (NEW)
│   │       ├── ConfirmDialog.tsx # Deletion confirmation (NEW)
│   │       └── Button.tsx      # Button with loading state (NEW)
│   ├── contexts/
│   │   └── AuthContext.tsx     # Auth state management (UPDATE)
│   ├── hooks/
│   │   ├── useAuth.ts          # Auth hook (UPDATE)
│   │   └── useTodos.ts         # CRUD operations hook (UPDATE - fix types)
│   ├── lib/
│   │   ├── auth.ts             # Better Auth client (UPDATE)
│   │   └── api.ts              # API client (UPDATE - fix types/fields)
│   └── types/
│       └── index.ts            # TypeScript types (NEW - centralized)
├── public/                     # Static assets
└── .env.local                  # Environment variables

# Backend (existing - no changes needed)
src/app/                        # FastAPI Backend
├── routes/
│   ├── auth.py                 # Auth endpoints
│   └── todos.py                # Todo endpoints
└── models/
    ├── user.py                 # User model
    └── todo.py                 # Todo model
```

**Structure Decision**: Existing frontend structure maintained with updates to fix API integration issues and implement remaining UI features per spec requirements.

## Complexity Tracking

> No constitution violations requiring justification.

## Phase 0: Research & Unknown Resolution

### Research Tasks

#### 0.1: API Integration Type Mismatches
**Task**: Research and document the exact API contract discrepancies between frontend and backend
- **Decision**: Update frontend types to match backend response
  - IDs: Change from `number` to `string` (UUID format)
  - Completion field: Change from `is_completed` to `completed`
- **Rationale**: Frontend must adapt to backend's established contract
- **Alternatives**: Modify backend (rejected - backend is stable and used by other features)

#### 0.2: Optimistic UI Update Patterns
**Task**: Research best practices for optimistic updates in React with rollback
- **Decision**: Use local state update before API call, rollback on error
- **Rationale**: Provides < 200ms perceived feedback per SC-004
- **Alternatives**: Wait for server response (rejected - poor UX for toggle operations)

#### 0.3: Form Validation Strategy
**Task**: Research inline form validation approach for auth and todo forms
- **Decision**: Client-side validation before submission with inline error display
- **Rationale**: FR-004 requires inline validation errors, reduces server round trips
- **Alternatives**: Server-side only validation (rejected - poor UX, unnecessary latency)

#### 0.4: Responsive Design Breakpoints
**Task**: Research breakpoint strategy for FR-021 to FR-023 requirements
- **Decision**: Three-tier breakpoint system
  - Desktop: 1024px+ (multi-column layout)
  - Tablet: 768px-1023px (compressed layout)
  - Mobile: 320px-767px (single-column layout)
- **Rationale**: Covers all required screen sizes from spec
- **Alternatives**: Fluid-only design (harder to test discrete requirements)

#### 0.5: Session Persistence Strategy
**Task**: Research session persistence per User Story 2.3
- **Decision**: Store JWT in localStorage, check expiration on app load
- **Rationale**: Browser close/reopen should maintain session until token expires
- **Alternatives**: Session storage (rejected - clears on browser close, violates requirement)

#### 0.6: Error Handling Patterns
**Task**: Research actionable error messages per SC-008
- **Decision**: Map API error codes to user-friendly messages with retry actions
- **Rationale**: "Error occurred" is not actionable; users need guidance
- **Alternatives**: Display raw API errors (rejected - poor UX, potential info leak)

## Phase 1: Design & Contracts

### Frontend State Model

#### Authentication State
```typescript
interface AuthState {
  user: { id: string; email: string } | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

#### Todo State (Corrected Types)
```typescript
interface Todo {
  id: string;                  // UUID from backend
  title: string;
  description: string | null;
  completed: boolean;          // Matches backend field name
  due_date: string | null;
  user_id: string;             // UUID from backend
  created_at: string;
  updated_at: string;
}

interface TodosState {
  todos: Todo[];
  isLoading: boolean;
  error: string | null;
  operationInProgress: string | null; // Track specific operation
}
```

#### UI State
```typescript
interface FormState {
  values: Record<string, string>;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isValid: boolean;
}
```

### Component Contracts

#### Landing Page (`app/page.tsx`)
- **Inputs**: None
- **Outputs**: Renders hero, CTA buttons for sign-in/sign-up
- **Behavior**: Redirect to dashboard if already authenticated

#### Auth Forms (`components/Auth/LoginForm.tsx`, `RegisterForm.tsx`)
- **Inputs**: `onSuccess: () => void`, `onError: (error: string) => void`
- **Outputs**: Form with email, password fields
- **Behavior**:
  - Validate email format before submission (FR-003, FR-004)
  - Show inline errors (FR-004)
  - Disable submit during loading
  - Call auth context methods

#### Protected Route (`components/Auth/ProtectedRoute.tsx`)
- **Inputs**: `children: ReactNode`
- **Outputs**: Children if authenticated, redirect to login if not
- **Behavior**: Check auth state, show loading during check (FR-006, FR-007)

#### Dashboard (`app/dashboard/page.tsx`)
- **Inputs**: None (uses context/hooks)
- **Outputs**: Task list, add button, user info
- **Behavior**:
  - Fetch todos on mount (FR-009)
  - Show loading indicator (FR-011)
  - Show empty state if no tasks (FR-012)
  - Handle errors with retry option

#### Todo List (`components/Todo/TodoList.tsx`)
- **Inputs**: `todos: Todo[]`, `onToggle`, `onEdit`, `onDelete`
- **Outputs**: List of TodoItem components
- **Behavior**:
  - Visually distinguish completed vs active (FR-010)
  - Pass callbacks to items

#### Todo Item (`components/Todo/TodoItem.tsx`)
- **Inputs**: `todo: Todo`, `onToggle`, `onEdit`, `onDelete`
- **Outputs**: Single task with checkbox, title, actions
- **Behavior**:
  - Toggle completion on checkbox click (FR-015)
  - Show edit/delete buttons
  - Optimistic update on toggle (FR-020)

#### Todo Form (`components/Todo/TodoForm.tsx`)
- **Inputs**: `todo?: Todo`, `onSubmit`, `onCancel`
- **Outputs**: Form for create/edit
- **Behavior**:
  - Require title (FR-013)
  - Optional description (FR-013)
  - Show loading on submit (FR-017)
  - Clear form on success

#### Confirm Dialog (`components/UI/ConfirmDialog.tsx`)
- **Inputs**: `open: boolean`, `onConfirm`, `onCancel`, `message`
- **Outputs**: Modal dialog
- **Behavior**: Confirm before delete (FR-016)

#### Empty State (`components/UI/EmptyState.tsx`)
- **Inputs**: `message: string`, `actionLabel?: string`, `onAction?: () => void`
- **Outputs**: Centered message with optional CTA
- **Behavior**: Guide user to create first task (FR-012)

### API Client Contract

```typescript
// lib/api.ts - Corrected interface
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ApiClient {
  // Auth
  register(email: string, password: string): Promise<{ user: User }>;
  login(email: string, password: string): Promise<{ access_token: string }>;

  // Todos (all require token)
  getTodos(): Promise<Todo[]>;
  createTodo(data: { title: string; description?: string }): Promise<Todo>;
  updateTodo(id: string, data: Partial<Todo>): Promise<Todo>;
  deleteTodo(id: string): Promise<void>;
  toggleComplete(id: string): Promise<Todo>;
}
```

### Page Routes

| Route | Component | Auth Required | Description |
|-------|-----------|---------------|-------------|
| `/` | Landing | No | Public landing with sign-in/sign-up |
| `/auth/login` | LoginForm | No | Sign-in page |
| `/auth/register` | RegisterForm | No | Sign-up page |
| `/dashboard` | Dashboard | Yes | Main task view |

## Risk Analysis

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| API type mismatch causes runtime errors | High | High | Fix types before any UI work |
| Session expires during use | Medium | Medium | Detect 401, redirect with state preservation |
| Slow API responses | Medium | Low | Loading indicators, optimistic updates |
| Mobile layout issues | Low | Medium | Test at 320px minimum width |

## Next Steps

1. Generate `research.md` documenting all resolved unknowns
2. Generate `data-model.md` with TypeScript interfaces
3. Generate `contracts/` with component specifications
4. Generate `quickstart.md` for developer onboarding
5. Run `/sp.tasks` to generate implementation tasks
6. Execute tasks using `nextjs-frontend-dev` agent

## Artifacts Generated

- [x] plan.md (this file)
- [x] research.md (Phase 0 consolidation)
- [x] data-model.md (frontend state types)
- [x] contracts/components.md (component contracts)
- [x] quickstart.md (setup guide)
