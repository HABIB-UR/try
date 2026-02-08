/**
 * Hooks Index
 *
 * Central export point for all custom hooks
 */

export { useAuth, default as useAuthDefault } from './useAuth';
export type { AuthContextType, AuthState } from './useAuth';

export { useTodos, default as useTodosDefault } from './useTodos';
export type { UseTodosReturn } from './useTodos';
