# Component Contracts: Frontend Application & UX

**Feature**: 003-frontend-app-ux
**Date**: 2026-02-07
**Status**: Complete

## Overview

This document defines the behavioral contracts for all React components in the frontend application. Each contract specifies inputs, outputs, behavior, and acceptance criteria traceable to functional requirements.

---

## Page Components

### Landing Page (`app/page.tsx`)

**Purpose**: Public entry point for unauthenticated visitors

**Requirements**: FR-001

**Contract**:
```typescript
// No props - root page component

// Behavior:
// 1. Display hero section with app description
// 2. Show "Sign In" and "Sign Up" CTA buttons
// 3. If user is already authenticated, redirect to /dashboard
// 4. Mobile: Stack buttons vertically
// 5. Desktop: Buttons side by side

// Outputs:
// - Hero section with heading and description
// - Navigation to /auth/login
// - Navigation to /auth/register
```

**Acceptance Criteria**:
- [ ] Hero heading visible on load
- [ ] "Sign In" button navigates to /auth/login
- [ ] "Sign Up" button navigates to /auth/register
- [ ] Authenticated users redirected to dashboard

---

### Login Page (`app/auth/login/page.tsx`)

**Purpose**: Sign-in page for returning users

**Requirements**: FR-003, User Story 2

**Contract**:
```typescript
// No props - route component

// Behavior:
// 1. Render LoginForm component
// 2. On successful login, redirect to /dashboard
// 3. Display link to registration page

// Outputs:
// - Page title "Sign In"
// - LoginForm component
// - Link "Don't have an account? Sign up"
```

**Acceptance Criteria**:
- [ ] Form displays email and password fields
- [ ] Successful login redirects to dashboard
- [ ] Link to register page functional

---

### Register Page (`app/auth/register/page.tsx`)

**Purpose**: Registration page for new users

**Requirements**: FR-002, User Story 1

**Contract**:
```typescript
// No props - route component

// Behavior:
// 1. Render RegisterForm component
// 2. On successful registration, redirect to /dashboard
// 3. Display link to login page

// Outputs:
// - Page title "Create Account"
// - RegisterForm component
// - Link "Already have an account? Sign in"
```

**Acceptance Criteria**:
- [ ] Form displays email and password fields
- [ ] Successful registration redirects to dashboard
- [ ] Link to login page functional

---

### Dashboard Page (`app/dashboard/page.tsx`)

**Purpose**: Main task management interface

**Requirements**: FR-009, FR-010, FR-011, FR-012, User Story 3

**Contract**:
```typescript
// No props - route component (protected)

// Behavior:
// 1. Fetch todos on mount
// 2. Display loading spinner while fetching
// 3. Display empty state if no todos
// 4. Display TodoList with todos
// 5. Provide "Add Task" button
// 6. Handle errors with retry option

// State:
// - todos: Todo[] (from useTodos hook)
// - isLoading: boolean
// - error: string | null
// - showForm: boolean (for task creation)

// Outputs:
// - Header with user email and sign out
// - Loading spinner during fetch
// - Empty state when no tasks
// - Todo list when tasks exist
// - Add task button/form
// - Error message with retry
```

**Acceptance Criteria**:
- [ ] Todos load on page mount (FR-009)
- [ ] Loading indicator shown during fetch (FR-011)
- [ ] Empty state shown when no todos (FR-012)
- [ ] Completed tasks visually distinct (FR-010)
- [ ] Error messages include retry action

---

## Auth Components

### LoginForm (`components/Auth/LoginForm.tsx`)

**Purpose**: Email/password form for authentication

**Requirements**: FR-003, FR-004, FR-005, User Story 2

**Contract**:
```typescript
interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

// Behavior:
// 1. Validate email format on blur
// 2. Validate password not empty on blur
// 3. Show inline errors below fields
// 4. Disable submit button when submitting
// 5. Show loading state on button during submission
// 6. Call auth context login method
// 7. On success, call onSuccess callback
// 8. On error, display error message

// Validation:
// - Email: Required, valid format
// - Password: Required, min 8 characters

// Outputs:
// - Email input with label
// - Password input with label
// - Inline error messages
// - Submit button with loading state
```

**Acceptance Criteria**:
- [ ] Invalid email shows error on blur (FR-004)
- [ ] Empty password shows error on blur (FR-004)
- [ ] Submit disabled during submission
- [ ] Success triggers redirect (FR-005)
- [ ] Invalid credentials show error (User Story 2.2)

---

### RegisterForm (`components/Auth/RegisterForm.tsx`)

**Purpose**: Registration form for new users

**Requirements**: FR-002, FR-004, FR-005, User Story 1

**Contract**:
```typescript
interface RegisterFormProps {
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

// Behavior:
// 1. Validate email format on blur
// 2. Validate password requirements on blur
// 3. Show inline errors below fields
// 4. Disable submit during submission
// 5. Call auth context register method
// 6. On success, automatically sign in and redirect
// 7. On error (email exists), show appropriate message

// Validation:
// - Email: Required, valid format
// - Password: Required, min 8 characters

// Outputs:
// - Email input with label
// - Password input with label
// - Inline error messages
// - Submit button with loading state
```

**Acceptance Criteria**:
- [ ] Invalid email shows error before submit (User Story 1.3)
- [ ] Email already registered shows message (User Story 1.4)
- [ ] Success auto-signs in and redirects (User Story 1.2)
- [ ] Submit button shows loading state

---

### ProtectedRoute (`components/Auth/ProtectedRoute.tsx`)

**Purpose**: Guard component for authenticated routes

**Requirements**: FR-006, FR-007, FR-008

**Contract**:
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Behavior:
// 1. Check auth state from context
// 2. If loading, show loading spinner
// 3. If not authenticated, redirect to /auth/login
// 4. If authenticated, render children

// Outputs:
// - Loading spinner during auth check
// - Children when authenticated
// - Redirect when not authenticated
```

**Acceptance Criteria**:
- [ ] Unauthenticated users redirected to login (FR-007)
- [ ] Authenticated users see protected content (FR-006)
- [ ] Auth state persists across refresh (FR-008)

---

## Todo Components

### TodoList (`components/Todo/TodoList.tsx`)

**Purpose**: Container for todo items with visual organization

**Requirements**: FR-009, FR-010

**Contract**:
```typescript
interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

// Behavior:
// 1. Render list of TodoItem components
// 2. Pass callbacks to each item
// 3. Visually separate completed from active
// 4. Responsive layout (stack on mobile)

// Outputs:
// - List container
// - TodoItem for each todo
// - Visual grouping (active vs completed)
```

**Acceptance Criteria**:
- [ ] All user todos displayed (FR-009)
- [ ] Completed todos visually distinct (FR-010)
- [ ] Single column on mobile (FR-023)

---

### TodoItem (`components/Todo/TodoItem.tsx`)

**Purpose**: Single task display with actions

**Requirements**: FR-010, FR-015, FR-017, FR-020, User Stories 5, 6, 7

**Contract**:
```typescript
interface TodoItemProps {
  todo: Todo;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isUpdating?: boolean;
}

// Behavior:
// 1. Display checkbox, title, description
// 2. Toggle checkbox calls onToggle
// 3. Edit button calls onEdit
// 4. Delete button calls onDelete
// 5. Show visual indication when completed
// 6. Show loading state during updates

// Visual States:
// - Active: Normal appearance
// - Completed: Strikethrough, muted colors
// - Updating: Opacity reduced or spinner

// Outputs:
// - Checkbox for completion toggle
// - Title (strikethrough if completed)
// - Description (if present)
// - Edit button
// - Delete button
```

**Acceptance Criteria**:
- [ ] Checkbox toggles completion (FR-015)
- [ ] Completed items have visual distinction (FR-010)
- [ ] Edit button opens edit mode (User Story 5.1)
- [ ] Delete button triggers confirmation (User Story 7.1)
- [ ] Loading indicator during operations (FR-017)

---

### TodoForm (`components/Todo/TodoForm.tsx`)

**Purpose**: Create/edit form for tasks

**Requirements**: FR-013, FR-014, FR-017, User Stories 4, 5

**Contract**:
```typescript
interface TodoFormProps {
  todo?: Todo;                           // For edit mode
  onSubmit: (data: CreateTodoRequest) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

// Behavior:
// 1. Show title input (required)
// 2. Show description textarea (optional)
// 3. Pre-fill fields if editing
// 4. Validate title not empty
// 5. Show loading on submit button
// 6. Call onSubmit with form data
// 7. Clear form on success (create mode)

// Validation:
// - Title: Required, non-empty

// Outputs:
// - Title input with label
// - Description textarea with label
// - Submit button with loading state
// - Cancel button (if onCancel provided)
// - Inline validation errors
```

**Acceptance Criteria**:
- [ ] Title required, shows error if empty (User Story 4.3)
- [ ] Description optional (FR-013)
- [ ] Submit button shows loading (User Story 4.4)
- [ ] Edit mode pre-fills values (User Story 5.1)
- [ ] Cancel preserves original values (User Story 5.3)

---

## UI Components

### Button (`components/UI/Button.tsx`)

**Purpose**: Reusable button with variants and loading state

**Requirements**: FR-017

**Contract**:
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

// Behavior:
// 1. Render button with appropriate styles
// 2. When isLoading, show spinner and disable
// 3. Forward all standard button props

// Variants:
// - primary: Blue background, white text
// - secondary: Gray background, dark text
// - danger: Red background, white text
// - ghost: Transparent, text only

// Outputs:
// - Styled button element
// - Loading spinner when isLoading
```

---

### Alert (`components/UI/Alert.tsx`)

**Purpose**: Status message display

**Requirements**: FR-018, FR-019, SC-008

**Contract**:
```typescript
interface AlertProps {
  variant: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onDismiss?: () => void;
}

// Behavior:
// 1. Display message with appropriate styling
// 2. Show dismiss button if onDismiss provided
// 3. Use appropriate icon per variant

// Outputs:
// - Colored container
// - Icon (checkmark, X, warning, info)
// - Message text
// - Dismiss button (optional)
```

---

### ConfirmDialog (`components/UI/ConfirmDialog.tsx`)

**Purpose**: Confirmation modal for destructive actions

**Requirements**: FR-016, User Story 7

**Contract**:
```typescript
interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'default';
}

// Behavior:
// 1. Show modal overlay when open
// 2. Display title and message
// 3. Confirm button calls onConfirm
// 4. Cancel button calls onCancel
// 5. Click outside closes (onCancel)
// 6. Escape key closes (onCancel)

// Outputs:
// - Modal overlay
// - Dialog box with title
// - Message text
// - Cancel button
// - Confirm button (red for danger variant)
```

**Acceptance Criteria**:
- [ ] Shows before delete action (User Story 7.1)
- [ ] Confirm proceeds with delete (User Story 7.2)
- [ ] Cancel preserves item (User Story 7.3)

---

### EmptyState (`components/UI/EmptyState.tsx`)

**Purpose**: Friendly empty state with guidance

**Requirements**: FR-012, User Story 3.3

**Contract**:
```typescript
interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

// Behavior:
// 1. Center content vertically
// 2. Display icon if provided
// 3. Display title and description
// 4. Show action button if provided

// Outputs:
// - Centered container
// - Icon (optional)
// - Title heading
// - Description text
// - Action button (optional)
```

**Acceptance Criteria**:
- [ ] Shows when user has no tasks (FR-012)
- [ ] Includes guidance to create first task (User Story 3.3)

---

### LoadingSpinner (`components/UI/LoadingSpinner.tsx`)

**Purpose**: Loading indicator for async operations

**Requirements**: FR-011, FR-017

**Contract**:
```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Behavior:
// 1. Display animated spinner
// 2. Size determines dimensions

// Sizes:
// - sm: 16px (inline, buttons)
// - md: 32px (default)
// - lg: 48px (page loading)

// Outputs:
// - Animated spinner element
```

---

### Toast (`components/UI/Toast.tsx`)

**Purpose**: Temporary notification for operation feedback

**Requirements**: FR-018, FR-019

**Contract**:
```typescript
interface ToastProps {
  message: string;
  variant: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

// Behavior:
// 1. Appear from bottom or top
// 2. Auto-dismiss after duration (default 3000ms)
// 3. Manual close via X button
// 4. Multiple toasts stack

// Outputs:
// - Toast container
// - Message text
// - Close button
```

**Acceptance Criteria**:
- [ ] Shows success after task operations (FR-018)
- [ ] Shows error when operations fail (FR-019)
- [ ] Auto-dismisses after timeout
