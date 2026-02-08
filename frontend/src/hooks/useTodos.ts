'use client';

/**
 * useTodos Hook
 *
 * Custom hook for managing todo state with optimistic updates.
 * Provides CRUD operations with loading, error, and operation tracking states.
 *
 * @example
 * ```tsx
 * import { useTodos } from '@/hooks/useTodos';
 *
 * function TodosPage() {
 *   const {
 *     todos,
 *     isLoading,
 *     error,
 *     operationInProgress,
 *     fetchTodos,
 *     createTodo,
 *     updateTodo,
 *     deleteTodo,
 *     toggleComplete,
 *     clearError
 *   } = useTodos();
 *
 *   useEffect(() => {
 *     fetchTodos();
 *   }, [fetchTodos]);
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   if (error) return <Alert variant="error" message={error} onDismiss={clearError} />;
 *
 *   return <TodoList todos={todos} />;
 * }
 * ```
 */

import { useState, useCallback } from 'react';
import {
  getTodos,
  createTodo as apiCreateTodo,
  updateTodo as apiUpdateTodo,
  deleteTodo as apiDeleteTodo,
  toggleTodoComplete,
} from '@/lib/api';
import type {
  Todo,
  CreateTodoRequest,
  UpdateTodoRequest,
  ApiError,
} from '@/types';

// =============================================================================
// Types
// =============================================================================

/**
 * Operation types for tracking in-progress operations
 */
export type TodoOperation =
  | 'fetch'
  | 'create'
  | 'update'
  | 'delete'
  | 'toggle'
  | null;

/**
 * Return type for useTodos hook
 */
export interface UseTodosReturn {
  /** Array of todos */
  todos: Todo[];
  /** Whether initial fetch is loading */
  isLoading: boolean;
  /** Current error message or null */
  error: string | null;
  /** Current operation in progress or null */
  operationInProgress: TodoOperation;
  /** Fetch all todos from API */
  fetchTodos: () => Promise<void>;
  /** Create a new todo */
  createTodo: (input: CreateTodoRequest) => Promise<Todo>;
  /** Update an existing todo */
  updateTodo: (id: string, input: UpdateTodoRequest) => Promise<Todo>;
  /** Delete a todo */
  deleteTodo: (id: string) => Promise<void>;
  /** Toggle completion status (optimistic update) */
  toggleComplete: (id: string) => Promise<void>;
  /** Clear current error */
  clearError: () => void;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Extract error message from an error object
 */
function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'detail' in error) {
    return (error as ApiError).detail;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

// =============================================================================
// useTodos Hook
// =============================================================================

/**
 * Custom hook for managing todo state with optimistic updates
 * Provides CRUD operations with loading, error, and operation tracking states
 */
export function useTodos(): UseTodosReturn {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [operationInProgress, setOperationInProgress] =
    useState<TodoOperation>(null);

  /**
   * Clear current error state
   */
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  /**
   * Fetch all todos from the API
   */
  const fetchTodos = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setOperationInProgress('fetch');
    setError(null);

    try {
      const data = await getTodos();
      setTodos(data);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
    } finally {
      setIsLoading(false);
      setOperationInProgress(null);
    }
  }, []);

  /**
   * Create a new todo
   * Adds the created todo to local state after successful API call
   */
  const createTodo = useCallback(
    async (input: CreateTodoRequest): Promise<Todo> => {
      setOperationInProgress('create');
      setError(null);

      try {
        const newTodo = await apiCreateTodo(input);
        setTodos((prev) => [...prev, newTodo]);
        return newTodo;
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        throw err;
      } finally {
        setOperationInProgress(null);
      }
    },
    []
  );

  /**
   * Update an existing todo
   * Uses optimistic update - updates local state immediately, reverts on error
   */
  const updateTodo = useCallback(
    async (id: string, input: UpdateTodoRequest): Promise<Todo> => {
      setOperationInProgress('update');
      setError(null);

      // Store previous state for rollback
      const previousTodos = todos;

      // Optimistic update
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id
            ? {
                ...todo,
                ...input,
                updated_at: new Date().toISOString(),
              }
            : todo
        )
      );

      try {
        const updatedTodo = await apiUpdateTodo(id, input);
        // Replace with actual server response
        setTodos((prev) =>
          prev.map((todo) => (todo.id === id ? updatedTodo : todo))
        );
        return updatedTodo;
      } catch (err) {
        // Rollback on error
        setTodos(previousTodos);
        const message = getErrorMessage(err);
        setError(message);
        throw err;
      } finally {
        setOperationInProgress(null);
      }
    },
    [todos]
  );

  /**
   * Delete a todo
   * Uses optimistic update - removes from local state immediately, reverts on error
   */
  const deleteTodo = useCallback(
    async (id: string): Promise<void> => {
      setOperationInProgress('delete');
      setError(null);

      // Store previous state for rollback
      const previousTodos = todos;

      // Optimistic update
      setTodos((prev) => prev.filter((todo) => todo.id !== id));

      try {
        await apiDeleteTodo(id);
      } catch (err) {
        // Rollback on error
        setTodos(previousTodos);
        const message = getErrorMessage(err);
        setError(message);
        throw err;
      } finally {
        setOperationInProgress(null);
      }
    },
    [todos]
  );

  /**
   * Toggle the completion status of a todo
   * Uses optimistic update - toggles local state immediately, reverts on error
   */
  const toggleComplete = useCallback(
    async (id: string): Promise<void> => {
      setOperationInProgress('toggle');
      setError(null);

      // Store previous state for rollback
      const previousTodos = todos;

      // Optimistic update - toggle completed status immediately
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id
            ? {
                ...todo,
                completed: !todo.completed,
                updated_at: new Date().toISOString(),
              }
            : todo
        )
      );

      try {
        const updatedTodo = await toggleTodoComplete(id);
        // Replace with actual server response
        setTodos((prev) =>
          prev.map((todo) => (todo.id === id ? updatedTodo : todo))
        );
      } catch (err) {
        // Rollback on error
        setTodos(previousTodos);
        const message = getErrorMessage(err);
        setError(message);
        throw err;
      } finally {
        setOperationInProgress(null);
      }
    },
    [todos]
  );

  return {
    todos,
    isLoading,
    error,
    operationInProgress,
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
    clearError,
  };
}

export default useTodos;
