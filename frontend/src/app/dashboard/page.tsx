'use client';

import { useState, useEffect } from 'react';
import { useTodos } from '@/hooks/useTodos';
import { TodoForm, TodoList } from '@/components/Todo';
import { ConfirmDialog } from '@/components/UI';
import type { Todo, CreateTodoRequest, UpdateTodoRequest } from '@/types';

/**
 * Dashboard Page
 * Main todo management interface with full CRUD operations.
 * Uses useTodos hook for state management and reusable components for UI.
 */
export default function DashboardPage() {
  // Todo state management via hook
  const {
    todos,
    isLoading,
    error,
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
  } = useTodos();

  // Local UI state for editing
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Delete confirmation state
  const [todoToDelete, setTodoToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter state
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Fetch todos on mount
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // Handle creating a new todo
  const handleAddTodo = async (data: { title: string; description: string }) => {
    setIsSubmitting(true);
    setLocalError(null);
    try {
      const input: CreateTodoRequest = {
        title: data.title,
        description: data.description || undefined,
      };
      await createTodo(input);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create todo';
      setLocalError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle editing an existing todo
  const handleEditTodo = async (data: { title: string; description: string }) => {
    if (!editingTodo) return;

    setIsSubmitting(true);
    setLocalError(null);
    try {
      const input: UpdateTodoRequest = {
        title: data.title,
        description: data.description || undefined,
      };
      await updateTodo(editingTodo.id, input);
      setEditingTodo(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update todo';
      setLocalError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle toggling todo completion
  const handleToggleComplete = async (id: string, _completed: boolean) => {
    setLocalError(null);
    try {
      await toggleComplete(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update todo';
      setLocalError(message);
    }
  };

  // Handle requesting delete (shows confirmation dialog)
  const handleDeleteRequest = (id: string) => {
    setTodoToDelete(id);
  };

  // Handle confirming delete
  const handleConfirmDelete = async () => {
    if (!todoToDelete) return;

    setIsDeleting(true);
    setLocalError(null);
    try {
      await deleteTodo(todoToDelete);
      setTodoToDelete(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete todo';
      setLocalError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle canceling delete
  const handleCancelDelete = () => {
    setTodoToDelete(null);
  };

  // Handle starting edit mode
  const handleStartEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setLocalError(null);
  };

  // Handle canceling edit mode
  const handleCancelEdit = () => {
    setEditingTodo(null);
    setLocalError(null);
  };

  // Filter todos based on selected filter
  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  // Calculate stats
  const totalTodos = todos.length;
  const completedTodosCount = todos.filter((t) => t.completed).length;
  const activeTodos = totalTodos - completedTodosCount;

  // Combined error from hook or local operations
  const displayError = localError || error;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Todos</h1>
          <p className="mt-1 text-sm text-gray-600">
            {activeTodos} active, {completedTodosCount} completed
          </p>
        </div>
        {/* Refresh button */}
        <button
          onClick={() => fetchTodos()}
          disabled={isLoading}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          aria-label="Refresh todos"
        >
          <svg
            className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {displayError && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{displayError}</span>
          </div>
          <button
            onClick={() => setLocalError(null)}
            className="text-red-700 hover:text-red-900 font-bold ml-4"
            aria-label="Dismiss error"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Todo Form - Create or Edit Mode */}
      <TodoForm
        onSubmit={editingTodo ? handleEditTodo : handleAddTodo}
        initialData={editingTodo || undefined}
        onCancel={editingTodo ? handleCancelEdit : undefined}
        isLoading={isSubmitting}
      />

      {/* Filter Tabs */}
      <div
        className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit"
        role="tablist"
        aria-label="Filter todos"
      >
        {(['all', 'active', 'completed'] as const).map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            aria-controls="todo-list"
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === f
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'all' && ` (${totalTodos})`}
            {f === 'active' && ` (${activeTodos})`}
            {f === 'completed' && ` (${completedTodosCount})`}
          </button>
        ))}
      </div>

      {/* Todo List */}
      <div id="todo-list" role="tabpanel">
        <TodoList
          todos={filteredTodos}
          onToggleComplete={handleToggleComplete}
          onEdit={handleStartEdit}
          onDelete={handleDeleteRequest}
          isLoading={isLoading}
          separateSections={filter === 'all'}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={todoToDelete !== null}
        title="Delete Todo"
        message="Are you sure you want to delete this todo? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
}
