# Data Model: Frontend Application & UX

**Feature**: 003-frontend-app-ux
**Date**: 2026-02-07
**Status**: Complete

## Overview

This document defines the TypeScript interfaces and types for the frontend application. These types are designed to match the backend API contracts exactly.

---

## Core Domain Types

### User

```typescript
/**
 * User entity matching backend User model
 * Source: src/app/models/user.py
 */
interface User {
  id: string;          // UUID serialized as string
  email: string;
  created_at: string;  // ISO 8601 datetime
  updated_at: string;  // ISO 8601 datetime
}

/**
 * User data available in JWT token payload
 */
interface TokenPayload {
  sub: string;         // User ID
  email: string;
  iat: number;         // Issued at (Unix timestamp)
  exp: number;         // Expiration (Unix timestamp)
}
```

### Todo

```typescript
/**
 * Todo entity matching backend Todo model
 * Source: src/app/models/todo.py
 *
 * IMPORTANT: Field names match backend exactly
 * - Use "completed" not "is_completed"
 * - IDs are string (UUID), not number
 */
interface Todo {
  id: string;                    // UUID serialized as string
  title: string;                 // Required, max 200 chars
  description: string | null;    // Optional
  completed: boolean;            // Default: false
  due_date: string | null;       // ISO 8601 datetime or null
  user_id: string;               // UUID serialized as string
  created_at: string;            // ISO 8601 datetime
  updated_at: string;            // ISO 8601 datetime
}

/**
 * Request payload for creating a new todo
 */
interface CreateTodoRequest {
  title: string;                 // Required
  description?: string;          // Optional
}

/**
 * Request payload for updating an existing todo
 */
interface UpdateTodoRequest {
  title?: string;
  description?: string;
  completed?: boolean;
  due_date?: string | null;
}
```

---

## API Response Types

### Authentication Responses

```typescript
/**
 * Response from POST /api/auth/register
 */
interface RegisterResponse {
  message: string;
  user: {
    id: string;
    email: string;
    created_at: string;
    updated_at: string;
  };
}

/**
 * Response from POST /api/auth/login
 */
interface LoginResponse {
  access_token: string;
  token_type: 'bearer';
}
```

### Todo Responses

```typescript
/**
 * Response from GET /api/todos
 */
type GetTodosResponse = Todo[];

/**
 * Response from POST /api/todos
 */
type CreateTodoResponse = Todo;

/**
 * Response from PUT /api/todos/{id}
 */
type UpdateTodoResponse = Todo;

/**
 * Response from PATCH /api/todos/{id}/complete
 */
type ToggleCompleteResponse = Todo;

/**
 * Response from DELETE /api/todos/{id}
 * Note: Returns 204 No Content
 */
type DeleteTodoResponse = void;
```

### Error Response

```typescript
/**
 * Standard error response from backend
 */
interface ApiError {
  detail: string | ValidationError[];
}

interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}
```

---

## Application State Types

### Authentication State

```typescript
/**
 * Global authentication state managed by AuthContext
 */
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Authentication context value including actions
 */
interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}
```

### Todo State

```typescript
/**
 * Todo list state managed by useTodos hook
 */
interface TodosState {
  todos: Todo[];
  isLoading: boolean;
  error: string | null;
  operationInProgress: string | null;  // 'create' | 'update' | 'delete' | 'toggle' | null
}

/**
 * Todo operations returned by useTodos hook
 */
interface TodoOperations {
  fetchTodos: () => Promise<void>;
  createTodo: (data: CreateTodoRequest) => Promise<Todo>;
  updateTodo: (id: string, data: UpdateTodoRequest) => Promise<Todo>;
  deleteTodo: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  clearError: () => void;
}
```

---

## Component Props Types

### Form Components

```typescript
/**
 * Props for LoginForm component
 */
interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

/**
 * Props for RegisterForm component
 */
interface RegisterFormProps {
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

/**
 * Props for TodoForm component
 */
interface TodoFormProps {
  todo?: Todo;                           // For edit mode
  onSubmit: (data: CreateTodoRequest) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}
```

### List Components

```typescript
/**
 * Props for TodoList component
 */
interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

/**
 * Props for TodoItem component
 */
interface TodoItemProps {
  todo: Todo;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isUpdating?: boolean;
}
```

### UI Components

```typescript
/**
 * Props for Button component
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

/**
 * Props for Alert component
 */
interface AlertProps {
  variant: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onDismiss?: () => void;
}

/**
 * Props for ConfirmDialog component
 */
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

/**
 * Props for EmptyState component
 */
interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

/**
 * Props for LoadingSpinner component
 */
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Props for Toast component
 */
interface ToastProps {
  message: string;
  variant: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}
```

### Layout Components

```typescript
/**
 * Props for ProtectedRoute component
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
}
```

---

## Form State Types

```typescript
/**
 * Generic form field state
 */
interface FormField<T = string> {
  value: T;
  error: string | null;
  touched: boolean;
}

/**
 * Login form state
 */
interface LoginFormState {
  email: FormField;
  password: FormField;
}

/**
 * Register form state
 */
interface RegisterFormState {
  email: FormField;
  password: FormField;
  confirmPassword: FormField;
}

/**
 * Todo form state
 */
interface TodoFormState {
  title: FormField;
  description: FormField;
}
```

---

## Utility Types

```typescript
/**
 * API request options
 */
interface ApiRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

/**
 * Error message mapping
 */
interface ErrorMessage {
  message: string;
  action?: string;
}

type ErrorMessageMap = Record<number, ErrorMessage>;
```

---

## Type Exports

All types should be exported from `frontend/src/types/index.ts`:

```typescript
// Domain types
export type { User, TokenPayload, Todo, CreateTodoRequest, UpdateTodoRequest };

// API response types
export type {
  RegisterResponse,
  LoginResponse,
  GetTodosResponse,
  CreateTodoResponse,
  UpdateTodoResponse,
  ToggleCompleteResponse,
  DeleteTodoResponse,
  ApiError,
  ValidationError,
};

// State types
export type { AuthState, AuthContextValue, TodosState, TodoOperations };

// Component prop types
export type {
  LoginFormProps,
  RegisterFormProps,
  TodoFormProps,
  TodoListProps,
  TodoItemProps,
  ButtonProps,
  AlertProps,
  ConfirmDialogProps,
  EmptyStateProps,
  LoadingSpinnerProps,
  ToastProps,
  ProtectedRouteProps,
};

// Form state types
export type {
  FormField,
  LoginFormState,
  RegisterFormState,
  TodoFormState,
};

// Utility types
export type { ApiRequestOptions, ErrorMessage, ErrorMessageMap };
```
