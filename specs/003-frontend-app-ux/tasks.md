# Tasks: Frontend Application & UX (Next.js)

**Input**: Design documents from `/specs/003-frontend-app-ux/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/components.md

**Tests**: Not explicitly requested - test tasks omitted per template guidelines.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US8)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `frontend/src/` at repository root
- Based on existing structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Fix critical type mismatches and establish type foundation

- [X] T001 Create centralized TypeScript types in frontend/src/types/index.ts matching backend API exactly (UUID strings, `completed` field)
- [X] T002 [P] Update API client types in frontend/src/lib/api.ts to use correct Todo interface (id: string, completed: boolean)
- [X] T003 [P] Create error message mapping utility in frontend/src/lib/errors.ts for actionable error messages (SC-008)

**Checkpoint**: Type foundation ready - all components will use correct types

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Update AuthContext in frontend/src/contexts/AuthContext.tsx with correct User type and session persistence (FR-008)
- [X] T005 [P] Update useAuth hook in frontend/src/hooks/useAuth.ts to expose login, register, logout, clearError methods
- [X] T006 [P] Update useTodos hook in frontend/src/hooks/useTodos.ts with correct Todo types and optimistic update support (FR-020)
- [X] T007 [P] Create Button component in frontend/src/components/UI/Button.tsx with variants and loading state (FR-017)
- [X] T008 [P] Create LoadingSpinner component in frontend/src/components/UI/LoadingSpinner.tsx with sm/md/lg sizes (FR-011)
- [X] T009 [P] Create Alert component in frontend/src/components/UI/Alert.tsx with success/error/warning/info variants (FR-018, FR-019)
- [X] T010 Update ProtectedRoute in frontend/src/components/Auth/ProtectedRoute.tsx to redirect unauthenticated users (FR-006, FR-007)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - New User Onboarding (Priority: P1) 🎯 MVP

**Goal**: New visitors can create an account and reach the dashboard

**Independent Test**: Complete signup flow and verify dashboard access

### Implementation for User Story 1

- [ ] T011 [P] [US1] Update landing page in frontend/src/app/page.tsx with hero section and Sign Up CTA (FR-001)
- [ ] T012 [P] [US1] Create register page in frontend/src/app/auth/register/page.tsx with RegisterForm and login link
- [ ] T013 [US1] Update RegisterForm in frontend/src/components/Auth/RegisterForm.tsx with email/password validation, inline errors (FR-002, FR-004)
- [ ] T014 [US1] Implement auto-signin after registration in RegisterForm (User Story 1.2: auto-redirect to dashboard)
- [ ] T015 [US1] Handle duplicate email error in RegisterForm showing "sign in instead" suggestion (User Story 1.4)

**Checkpoint**: User Story 1 complete - new users can sign up and reach dashboard

---

## Phase 4: User Story 2 - Returning User Sign In (Priority: P1)

**Goal**: Returning users can sign in and access their tasks

**Independent Test**: Sign in with valid credentials and see tasks

### Implementation for User Story 2

- [ ] T016 [P] [US2] Create login page in frontend/src/app/auth/login/page.tsx with LoginForm and register link
- [ ] T017 [US2] Update LoginForm in frontend/src/components/Auth/LoginForm.tsx with email/password validation, inline errors (FR-003, FR-004)
- [ ] T018 [US2] Show generic "Invalid credentials" message on auth failure (User Story 2.2)
- [ ] T019 [US2] Implement session persistence check on app load in frontend/src/app/layout.tsx (User Story 2.3: session persists across browser close)

**Checkpoint**: User Story 2 complete - returning users can sign in

---

## Phase 5: User Story 3 - Task Dashboard Overview (Priority: P1)

**Goal**: Authenticated users see organized task list with visual distinction

**Independent Test**: View dashboard with tasks showing completed/active distinction

### Implementation for User Story 3

- [ ] T020 [P] [US3] Create EmptyState component in frontend/src/components/UI/EmptyState.tsx with title, description, action button (FR-012)
- [ ] T021 [US3] Update dashboard page in frontend/src/app/dashboard/page.tsx to fetch todos on mount with loading state (FR-009, FR-011)
- [ ] T022 [US3] Integrate EmptyState in dashboard when user has no tasks with "Create your first task" guidance (User Story 3.3)
- [ ] T023 [US3] Update TodoList in frontend/src/components/Todo/TodoList.tsx to visually separate completed from active tasks (FR-010)
- [ ] T024 [US3] Add responsive layout to TodoList for mobile single-column view (FR-023)

**Checkpoint**: User Story 3 complete - dashboard shows tasks with visual organization

---

## Phase 6: User Story 4 - Task Creation (Priority: P1)

**Goal**: Users can create new tasks with title and optional description

**Independent Test**: Create a task and see it appear in list immediately

### Implementation for User Story 4

- [ ] T025 [P] [US4] Update TodoForm in frontend/src/components/Todo/TodoForm.tsx with title (required), description (optional) fields (FR-013)
- [ ] T026 [US4] Add title validation to TodoForm showing error when empty (User Story 4.3)
- [ ] T027 [US4] Add loading state to TodoForm submit button during save (User Story 4.4, FR-017)
- [ ] T028 [US4] Add "Add Task" button to dashboard that shows TodoForm (User Story 4.1)
- [ ] T029 [US4] Integrate createTodo from useTodos hook in dashboard, show new task immediately (User Story 4.2)

**Checkpoint**: User Story 4 complete - users can create tasks

---

## Phase 7: User Story 6 - Task Completion Toggle (Priority: P1)

**Goal**: Users can toggle task completion with immediate visual feedback

**Independent Test**: Toggle a task and see visual change within 200ms

### Implementation for User Story 6

- [ ] T030 [P] [US6] Update TodoItem in frontend/src/components/Todo/TodoItem.tsx with checkbox for completion toggle (FR-015)
- [ ] T031 [US6] Add visual styling to TodoItem for completed state (strikethrough, muted colors) (FR-010)
- [ ] T032 [US6] Implement optimistic update in useTodos toggleComplete with rollback on error (FR-020, SC-004)
- [ ] T033 [US6] Integrate toggle callback from dashboard to TodoItem through TodoList

**Checkpoint**: User Story 6 complete - task toggle works with immediate feedback

---

## Phase 8: User Story 5 - Task Editing (Priority: P2)

**Goal**: Users can edit existing task title and description

**Independent Test**: Edit a task and verify changes persist

### Implementation for User Story 5

- [ ] T034 [P] [US5] Add edit mode support to TodoForm with pre-filled values (User Story 5.1)
- [ ] T035 [US5] Add Edit button to TodoItem that opens TodoForm in edit mode (FR-014)
- [ ] T036 [US5] Implement cancel in TodoForm preserving original values (User Story 5.3)
- [ ] T037 [US5] Integrate updateTodo from useTodos hook, show updated task immediately (User Story 5.2)

**Checkpoint**: User Story 5 complete - users can edit tasks

---

## Phase 9: User Story 7 - Task Deletion (Priority: P2)

**Goal**: Users can delete tasks with confirmation prompt

**Independent Test**: Delete a task after confirmation, verify removal from list

### Implementation for User Story 7

- [ ] T038 [P] [US7] Create ConfirmDialog component in frontend/src/components/UI/ConfirmDialog.tsx with danger variant (FR-016)
- [ ] T039 [US7] Add Delete button to TodoItem that triggers ConfirmDialog (User Story 7.1)
- [ ] T040 [US7] Implement confirm action in ConfirmDialog calling deleteTodo (User Story 7.2)
- [ ] T041 [US7] Implement cancel action in ConfirmDialog preserving task (User Story 7.3)

**Checkpoint**: User Story 7 complete - users can delete tasks with confirmation

---

## Phase 10: User Story 8 - User Sign Out (Priority: P2)

**Goal**: Users can sign out and session is cleared

**Independent Test**: Sign out and verify redirect to landing, session cleared

### Implementation for User Story 8

- [ ] T042 [P] [US8] Add user email display to dashboard header/navigation (FR-024)
- [ ] T043 [US8] Add Sign Out button to navigation accessible from all authenticated pages (FR-025)
- [ ] T044 [US8] Implement sign out clearing localStorage and redirecting to landing (User Story 8.1)
- [ ] T045 [US8] Verify unauthenticated access to dashboard redirects to sign in (User Story 8.2)

**Checkpoint**: User Story 8 complete - users can sign out securely

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T046 [P] Create Toast component in frontend/src/components/UI/Toast.tsx for success/error notifications (FR-018, FR-019)
- [ ] T047 [P] Add Toast integration for task operations (create, update, delete success/error)
- [ ] T048 Apply responsive styles to all pages for tablet breakpoint 768px-1023px (FR-022)
- [ ] T049 Apply responsive styles to all pages for desktop breakpoint 1024px+ (FR-021)
- [ ] T050 Add error boundary and network error handling with retry option (Edge Cases)
- [ ] T051 Validate all authenticated API calls include Authorization header (SC-007)
- [ ] T052 Run quickstart.md validation to verify setup instructions work

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) - BLOCKS all user stories
- **User Stories (Phases 3-10)**: All depend on Foundational (Phase 2) completion
  - P1 stories (US1, US2, US3, US4, US6) can proceed in parallel or sequentially
  - P2 stories (US5, US7, US8) can proceed after Foundational
- **Polish (Phase 11)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (New User Onboarding)**: Foundational only - no other story deps
- **US2 (Returning User Sign In)**: Foundational only - no other story deps
- **US3 (Dashboard Overview)**: Foundational only - no other story deps
- **US4 (Task Creation)**: Depends on US3 (dashboard must exist)
- **US5 (Task Editing)**: Depends on US4 (need tasks to edit)
- **US6 (Task Toggle)**: Depends on US3 (dashboard with task items)
- **US7 (Task Deletion)**: Depends on US4 (need tasks to delete)
- **US8 (Sign Out)**: Depends on US2 (need sign in to sign out)

### Within Each User Story

- Models/types before components
- Components before page integration
- Core functionality before error handling

### Parallel Opportunities

- **Phase 1**: T002, T003 can run in parallel
- **Phase 2**: T005, T006, T007, T008, T009 can run in parallel
- **Phase 3 (US1)**: T011, T012 can run in parallel
- **Phase 5 (US3)**: T020 can run parallel to dashboard work
- **Phase 7 (US6)**: T030 can run parallel
- **Phase 8 (US5)**: T034 can run parallel
- **Phase 9 (US7)**: T038 can run parallel
- **Phase 10 (US8)**: T042 can run parallel
- **Phase 11**: T046, T047 can run in parallel

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Launch all parallel foundational tasks together:
Task: "Update useAuth hook in frontend/src/hooks/useAuth.ts"
Task: "Update useTodos hook in frontend/src/hooks/useTodos.ts"
Task: "Create Button component in frontend/src/components/UI/Button.tsx"
Task: "Create LoadingSpinner component in frontend/src/components/UI/LoadingSpinner.tsx"
Task: "Create Alert component in frontend/src/components/UI/Alert.tsx"
```

---

## Implementation Strategy

### MVP First (P1 Stories Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T010)
3. Complete Phase 3: US1 New User Onboarding (T011-T015)
4. **STOP and VALIDATE**: Test signup flow independently
5. Complete Phase 4: US2 Returning User Sign In (T016-T019)
6. Complete Phase 5: US3 Dashboard Overview (T020-T024)
7. Complete Phase 6: US4 Task Creation (T025-T029)
8. Complete Phase 7: US6 Task Toggle (T030-T033)
9. **STOP and VALIDATE**: Full P1 MVP functional

### Incremental Delivery After MVP

1. Add US5 (Task Editing) → Test independently
2. Add US7 (Task Deletion) → Test independently
3. Add US8 (Sign Out) → Test independently
4. Polish phase for cross-cutting concerns

---

## Summary

| Phase | User Story | Priority | Task Count |
|-------|------------|----------|------------|
| 1 | Setup | - | 3 |
| 2 | Foundational | - | 7 |
| 3 | US1 - Onboarding | P1 | 5 |
| 4 | US2 - Sign In | P1 | 4 |
| 5 | US3 - Dashboard | P1 | 5 |
| 6 | US4 - Create Task | P1 | 5 |
| 7 | US6 - Toggle | P1 | 4 |
| 8 | US5 - Edit Task | P2 | 4 |
| 9 | US7 - Delete Task | P2 | 4 |
| 10 | US8 - Sign Out | P2 | 4 |
| 11 | Polish | - | 7 |
| **Total** | | | **52** |

**Parallel Opportunities**: 15 tasks marked [P]
**MVP Scope**: Phases 1-7 (33 tasks) - full P1 functionality
**Independent Test Criteria**: Each user story has explicit test instructions

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Priority: Fix type mismatches (T001-T002) FIRST to prevent runtime errors
