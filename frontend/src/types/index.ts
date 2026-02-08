/**
 * Centralized TypeScript Types for Todo Application
 *
 * This file contains all shared types matching the FastAPI backend API exactly.
 * All IDs are UUIDs represented as strings to match backend format.
 */

import { ReactNode } from 'react';

// =============================================================================
// Domain Models - Match Backend API Exactly
// =============================================================================

/**
 * User model - matches backend User schema
 * All IDs are string UUIDs
 */
export interface User {
  /** UUID string identifier */
  id: string;
  /** User's email address */
  email: string;
  /** ISO 8601 timestamp */
  created_at: string;
  /** ISO 8601 timestamp */
  updated_at: string;
}

/**
 * Todo model - matches backend Todo schema
 * Note: Uses 'completed' NOT 'is_completed' to match backend
 */
export interface Todo {
  /** UUID string identifier */
  id: string;
  /** Todo title */
  title: string;
  /** Optional description */
  description: string | null;
  /** Completion status - matches backend 'completed' field */
  completed: boolean;
  /** Optional due date as ISO 8601 string */
  due_date: string | null;
  /** UUID of the owning user */
  user_id: string;
  /** ISO 8601 timestamp */
  created_at: string;
  /** ISO 8601 timestamp */
  updated_at: string;
}

// =============================================================================
// JWT Token Types
// =============================================================================

/**
 * JWT Token payload structure
 * Decoded from Better Auth JWT tokens
 */
export interface TokenPayload {
  /** Subject - User ID as string */
  sub: string;
  /** User's email address */
  email: string;
  /** Issued at timestamp (Unix epoch seconds) */
  iat: number;
  /** Expiration timestamp (Unix epoch seconds) */
  exp: number;
}

// =============================================================================
// API Request Types
// =============================================================================

/**
 * Request body for creating a new todo
 */
export interface CreateTodoRequest {
  /** Todo title (required) */
  title: string;
  /** Optional description */
  description?: string;
}

/**
 * Request body for updating an existing todo
 * All fields are optional - only provided fields will be updated
 */
export interface UpdateTodoRequest {
  /** Updated title */
  title?: string;
  /** Updated description */
  description?: string;
  /** Updated completion status */
  completed?: boolean;
  /** Updated due date as ISO 8601 string or null to clear */
  due_date?: string | null;
}

/**
 * Request body for user registration
 */
export interface RegisterRequest {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
}

/**
 * Request body for user login
 */
export interface LoginRequest {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
}

// =============================================================================
// API Response Types
// =============================================================================

/**
 * Response from user registration endpoint
 */
export interface RegisterResponse {
  /** Success message */
  message: string;
  /** Created user object */
  user: User;
}

/**
 * Response from user login endpoint
 * Contains JWT access token for authenticated requests
 */
export interface LoginResponse {
  /** JWT access token */
  access_token: string;
  /** Token type (typically "bearer") */
  token_type: string;
}

/**
 * Generic message response
 */
export interface MessageResponse {
  /** Response message */
  message: string;
}

/**
 * Standard API error response
 */
export interface ApiError {
  /** Error detail message */
  detail: string;
  /** HTTP status code */
  status: number;
}

/**
 * Validation error detail for a single field
 */
export interface ValidationErrorDetail {
  /** Location of the error (e.g., ["body", "email"]) */
  loc: (string | number)[];
  /** Error message */
  msg: string;
  /** Error type identifier */
  type: string;
}

/**
 * Validation error response (422 Unprocessable Entity)
 * FastAPI returns this format for request validation failures
 */
export interface ValidationError {
  /** Array of validation error details */
  detail: ValidationErrorDetail[];
}

// =============================================================================
// State Types
// =============================================================================

/**
 * Authentication state for AuthContext
 */
export interface AuthState {
  /** Currently authenticated user or null */
  user: User | null;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Whether auth state is being loaded/checked */
  isLoading: boolean;
  /** Current JWT token or null */
  token: string | null;
}

/**
 * Todos state for useTodos hook
 */
export interface TodosState {
  /** Array of todos */
  todos: Todo[];
  /** Whether todos are being loaded */
  isLoading: boolean;
  /** Error message or null */
  error: string | null;
}

// =============================================================================
// Component Prop Types
// =============================================================================

/**
 * Props for LoginForm component
 */
export interface LoginFormProps {
  /** Callback when login form is submitted */
  onLogin: (email: string, password: string) => void;
  /** Whether login is in progress */
  isLoading?: boolean;
  /** Error message to display */
  error?: string | null;
}

/**
 * Props for RegisterForm component
 */
export interface RegisterFormProps {
  /** Callback when registration form is submitted */
  onRegister: (email: string, password: string) => void;
  /** Whether registration is in progress */
  isLoading?: boolean;
  /** Error message to display */
  error?: string | null;
}

/**
 * Form data for todo creation/editing
 */
export interface TodoFormData {
  /** Todo title */
  title: string;
  /** Todo description */
  description: string;
}

/**
 * Props for TodoForm component
 */
export interface TodoFormProps {
  /** Callback when form is submitted with valid data */
  onSubmit: (data: TodoFormData) => void;
  /** Initial data for edit mode */
  initialData?: Todo;
  /** Callback when cancel is clicked (only shown in edit mode) */
  onCancel?: () => void;
  /** Whether form submission is in progress */
  isLoading?: boolean;
}

/**
 * Props for TodoList component
 */
export interface TodoListProps {
  /** Array of todos to display */
  todos: Todo[];
  /** Callback when todo completion is toggled */
  onToggleComplete: (id: string, completed: boolean) => void;
  /** Callback when edit is requested for a todo */
  onEdit: (todo: Todo) => void;
  /** Callback when delete is requested for a todo */
  onDelete: (id: string) => void;
  /** Whether todos are being loaded */
  isLoading?: boolean;
  /** Whether to separate completed and active todos into sections */
  separateSections?: boolean;
}

/**
 * Props for TodoItem component
 */
export interface TodoItemProps {
  /** The todo item to display */
  todo: Todo;
  /** Callback when the completion status is toggled */
  onToggleComplete: (id: string, completed: boolean) => void;
  /** Callback when edit is requested */
  onEdit: (todo: Todo) => void;
  /** Callback when delete is requested */
  onDelete: (id: string) => void;
}

/**
 * Button variant types
 */
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

/**
 * Button size types
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Props for Button component
 */
export interface ButtonProps {
  /** Button content */
  children: ReactNode;
  /** Button variant/style */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Whether button is disabled */
  disabled?: boolean;
  /** Whether button shows loading state */
  isLoading?: boolean;
  /** Button type attribute */
  type?: 'button' | 'submit' | 'reset';
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Accessible label */
  'aria-label'?: string;
}

/**
 * Alert type variants
 */
export type AlertType = 'success' | 'error' | 'warning' | 'info';

/**
 * Props for Alert component
 */
export interface AlertProps {
  /** The type/variant of the alert */
  type: AlertType;
  /** The message to display */
  message: string;
  /** Optional title/heading */
  title?: string;
  /** Optional callback when close button is clicked */
  onClose?: () => void;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Props for ConfirmDialog component
 */
export interface ConfirmDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Dialog title */
  title: string;
  /** Dialog message/description */
  message: string;
  /** Text for confirm button */
  confirmText?: string;
  /** Text for cancel button */
  cancelText?: string;
  /** Callback when confirmed */
  onConfirm: () => void;
  /** Callback when cancelled or dismissed */
  onCancel: () => void;
  /** Whether the action is destructive (styles confirm button red) */
  isDestructive?: boolean;
  /** Whether confirmation is in progress */
  isLoading?: boolean;
}

/**
 * Props for EmptyState component
 */
export interface EmptyStateProps {
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Optional icon element */
  icon?: ReactNode;
  /** Optional action button/link */
  action?: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Loading spinner size variants
 */
export type SpinnerSize = 'sm' | 'md' | 'lg';

/**
 * Props for LoadingSpinner component
 */
export interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: SpinnerSize;
  /** Optional additional CSS classes */
  className?: string;
  /** Accessible label for screen readers */
  label?: string;
}

/**
 * Toast type variants
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Props for Toast component
 */
export interface ToastProps {
  /** The type/variant of the toast */
  type: ToastType;
  /** The message to display */
  message: string;
  /** Duration in milliseconds before auto-dismiss (default: 5000) */
  duration?: number;
  /** Callback when toast is dismissed */
  onClose: () => void;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Props for ProtectedRoute component
 */
export interface ProtectedRouteProps {
  /** Content to render when authenticated */
  children: ReactNode;
  /** Custom redirect path (default: /auth/login) */
  redirectTo?: string;
  /** Custom loading component */
  loadingComponent?: ReactNode;
  /** Callback when redirect occurs */
  onRedirect?: () => void;
}

// =============================================================================
// Utility Types
// =============================================================================

/**
 * Type for async operation state
 */
export interface AsyncState<T> {
  /** The data when loaded successfully */
  data: T | null;
  /** Whether the operation is in progress */
  isLoading: boolean;
  /** Error message if operation failed */
  error: string | null;
}

/**
 * Type for paginated API responses
 */
export interface PaginatedResponse<T> {
  /** Array of items */
  items: T[];
  /** Total count of items */
  total: number;
  /** Current page number */
  page: number;
  /** Items per page */
  per_page: number;
  /** Total number of pages */
  total_pages: number;
}

/**
 * Type for sort configuration
 */
export interface SortConfig {
  /** Field to sort by */
  field: string;
  /** Sort direction */
  direction: 'asc' | 'desc';
}

/**
 * Type for filter configuration
 */
export interface FilterConfig {
  /** Filter by completion status */
  completed?: boolean;
  /** Search query string */
  search?: string;
}
