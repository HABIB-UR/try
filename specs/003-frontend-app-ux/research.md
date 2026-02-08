# Research: Frontend Application & UX (Next.js)

**Feature**: 003-frontend-app-ux
**Date**: 2026-02-07
**Status**: Complete

## Overview

This document consolidates all research findings from Phase 0 of the frontend implementation plan. Each unknown has been resolved with a decision, rationale, and rejected alternatives.

---

## 0.1: API Integration Type Mismatches

### Problem Statement
The existing frontend code in `frontend/src/lib/api.ts` defines Todo interface with types that don't match the backend FastAPI response.

### Current Frontend Types (Incorrect)
```typescript
interface Todo {
  id: number;              // Backend returns UUID string
  title: string;
  description: string | null;
  is_completed: boolean;   // Backend returns "completed"
  user_id: number;         // Backend returns UUID string
  created_at: string;
  updated_at: string;
}
```

### Backend Response (Actual)
From `src/app/models/todo.py` and `src/app/schemas/todo.py`:
```python
class TodoPublic(BaseModel):
    id: uuid.UUID
    title: str
    description: str | None
    completed: bool          # Note: "completed", not "is_completed"
    due_date: datetime | None
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
```

### Decision
Update frontend types to match backend exactly:
- Change `id` and `user_id` from `number` to `string` (UUID serializes to string in JSON)
- Change `is_completed` to `completed`
- Add `due_date` field

### Rationale
- Backend API is stable and used by authentication feature
- Frontend must adapt to established contracts
- UUIDs are serialized as strings in JSON responses

### Alternatives Rejected
- **Modify backend schema**: Would require changes to stable API, risk breaking existing integrations
- **Transform in API client**: Adds complexity and potential bugs

---

## 0.2: Optimistic UI Update Patterns

### Problem Statement
SC-004 requires "Task completion toggle provides visual feedback within 200ms (perceived)". Network round-trips typically take 100-500ms.

### Research Findings
React patterns for optimistic updates:
1. **Immediate local state update**: Update UI before API call
2. **Background API call**: Send request after UI update
3. **Rollback on failure**: Revert to original state if API fails

### Decision
Implement optimistic updates for task toggle with rollback:

```typescript
const toggleTask = async (id: string) => {
  // 1. Capture original state
  const originalTodos = [...todos];

  // 2. Optimistically update
  setTodos(prev => prev.map(t =>
    t.id === id ? { ...t, completed: !t.completed } : t
  ));

  // 3. API call in background
  try {
    await api.toggleComplete(id);
  } catch (error) {
    // 4. Rollback on failure
    setTodos(originalTodos);
    showError("Failed to update task. Please try again.");
  }
};
```

### Rationale
- Provides immediate visual feedback (< 200ms)
- User sees responsive UI even on slow connections
- Failures are handled gracefully with clear feedback

### Alternatives Rejected
- **Wait for server response**: Violates SC-004 requirement, poor UX on slow connections
- **Disable UI during operation**: Creates blocking UX, feels unresponsive

---

## 0.3: Form Validation Strategy

### Problem Statement
FR-004 requires "Application MUST display validation errors inline with form fields". Need to determine validation timing and approach.

### Research Findings
Validation approaches:
1. **On change**: Validate as user types (can be annoying)
2. **On blur**: Validate when field loses focus (good balance)
3. **On submit**: Validate only when form submitted (delayed feedback)

### Decision
Hybrid approach:
- **On blur**: Validate individual fields when they lose focus
- **On submit**: Validate all fields before submission
- **Inline display**: Show errors below each field

Email validation regex:
```typescript
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateEmail = (email: string): string | null => {
  if (!email) return "Email is required";
  if (!EMAIL_REGEX.test(email)) return "Please enter a valid email address";
  return null;
};
```

### Rationale
- On blur provides immediate feedback without interrupting typing
- Users know about errors before attempting to submit
- Meets FR-004 inline error requirement

### Alternatives Rejected
- **Server-side only**: Creates unnecessary round-trips, poor UX
- **Real-time validation**: Too aggressive, interrupts user flow

---

## 0.4: Responsive Design Breakpoints

### Problem Statement
Need to support three screen size categories per FR-021 through FR-023:
- Desktop: 1024px and above
- Tablet: 768px to 1023px
- Mobile: 320px to 767px

### Research Findings
Tailwind CSS default breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

### Decision
Use Tailwind breakpoints with mobile-first approach:

```typescript
// Base styles apply to mobile (320px+)
// md: applies at 768px+ (tablet)
// lg: applies at 1024px+ (desktop)

const containerClasses = `
  px-4           // Mobile padding
  md:px-6        // Tablet padding
  lg:px-8        // Desktop padding
`;

const gridClasses = `
  grid-cols-1    // Mobile: single column
  md:grid-cols-2 // Tablet: two columns
  lg:grid-cols-3 // Desktop: three columns
`;
```

### Rationale
- Aligns with Tailwind defaults, no custom configuration needed
- Mobile-first ensures base case works at 320px
- Progressive enhancement for larger screens

### Alternatives Rejected
- **Custom breakpoints**: Unnecessary complexity, Tailwind defaults align well
- **CSS media queries only**: Loses Tailwind utility benefits

---

## 0.5: Session Persistence Strategy

### Problem Statement
User Story 2.3: "Given a signed-in user, When they close and reopen the browser, Then their session persists until token expiration"

### Research Findings
Browser storage options:
- **localStorage**: Persists across browser close/reopen
- **sessionStorage**: Clears when browser closes
- **Cookies**: Can persist, but more complex to manage

Current implementation uses localStorage (correct choice).

### Decision
Maintain localStorage for JWT storage with expiration check:

```typescript
// On app load
const token = localStorage.getItem('auth_token');
if (token) {
  const decoded = decodeToken(token);
  if (decoded && decoded.exp * 1000 > Date.now()) {
    // Token valid, restore session
  } else {
    // Token expired, clear storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }
}
```

### Rationale
- localStorage persists across browser sessions (requirement)
- Expiration check prevents use of stale tokens
- Matches existing implementation approach

### Alternatives Rejected
- **sessionStorage**: Clears on browser close, violates requirement
- **HTTP-only cookies**: More secure but requires backend changes

---

## 0.6: Error Handling Patterns

### Problem Statement
SC-008 requires "Error states provide actionable guidance (not just 'Error occurred')".

### Research Findings
API error responses from backend:
- 400: Validation errors with detail field
- 401: Unauthorized (token missing/invalid/expired)
- 404: Resource not found
- 409: Conflict (e.g., email already exists)
- 500: Server error

### Decision
Map error codes to user-friendly messages with actions:

```typescript
const ERROR_MESSAGES: Record<number, { message: string; action?: string }> = {
  400: {
    message: "Please check your input and try again.",
    action: "Review highlighted fields"
  },
  401: {
    message: "Your session has expired.",
    action: "Sign in again"
  },
  404: {
    message: "This item could not be found. It may have been deleted.",
    action: "Refresh the page"
  },
  409: {
    message: "This email is already registered.",
    action: "Try signing in instead"
  },
  500: {
    message: "Something went wrong on our end.",
    action: "Please try again in a moment"
  }
};
```

### Rationale
- Users understand what happened and what to do
- Generic "Error occurred" replaced with specific guidance
- Actions help users recover from error states

### Alternatives Rejected
- **Raw API errors**: Exposes implementation details, poor UX
- **Single generic message**: Violates SC-008, not actionable

---

## 0.7: Component Library Selection (Additional Research)

### Problem Statement
Need consistent UI components for buttons, forms, dialogs.

### Research Findings
Options available:
1. **Custom components**: Full control, more development time
2. **Headless UI**: Accessible primitives from Tailwind Labs
3. **shadcn/ui**: Copy-paste components with Tailwind

### Decision
Build lightweight custom components with Tailwind:
- Already have UI components scaffolded in `components/UI/`
- Small scope (Button, Alert, Toast, Dialog, Spinner)
- Full control over styling and behavior

### Rationale
- Existing scaffolding provides foundation
- Avoids additional dependencies
- Components are simple enough to build custom

### Alternatives Rejected
- **Add shadcn/ui**: Overkill for 5-6 components, adds complexity
- **Headless UI**: Good option but custom approach fits existing code

---

## Summary of Decisions

| Research Item | Decision | Key Rationale |
|---------------|----------|---------------|
| API Types | Match backend exactly | Backend is stable, frontend adapts |
| Optimistic Updates | Local update + rollback | Meet 200ms feedback requirement |
| Form Validation | On blur + on submit | Balance between UX and feedback |
| Breakpoints | Tailwind defaults | Mobile-first, aligns with spec |
| Session Storage | localStorage | Persists across browser close |
| Error Messages | Mapped to actions | SC-008 actionable guidance |
| UI Components | Custom with Tailwind | Matches existing scaffolding |

---

## Dependencies Verified

1. **Backend API**: Confirmed endpoints at `/api/auth/*` and `/api/todos/*`
2. **Authentication**: Better Auth configured with JWT, shared secret
3. **Existing Frontend**: Scaffolding in place, needs type fixes and feature completion
