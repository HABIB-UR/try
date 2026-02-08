'use client';

import React from 'react';
import type { Todo, TodoListProps } from '@/types';
import TodoItem from './TodoItem';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

/**
 * Skeleton loading component for todo items
 */
const TodoSkeleton: React.FC = () => (
  <div className="card animate-pulse">
    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
      <div className="flex items-start pt-1">
        <div className="h-5 w-5 rounded bg-gray-200" />
      </div>
      <div className="flex-1 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="h-6 bg-gray-200 rounded w-3/4" />
          <div className="h-5 w-16 bg-gray-200 rounded-full" />
        </div>
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-24" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-8 w-16 bg-gray-200 rounded" />
        <div className="h-8 w-20 bg-gray-200 rounded" />
      </div>
    </div>
  </div>
);

/**
 * Empty state component when no todos exist
 */
const EmptyState: React.FC<{ hasCompletedTodos?: boolean }> = ({ hasCompletedTodos }) => (
  <div className="text-center py-12 px-4">
    <div className="mx-auto h-24 w-24 text-gray-300" aria-hidden="true">
      <svg
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        className="h-full w-full"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
    </div>
    <h3 className="mt-4 text-lg font-medium text-gray-900">
      {hasCompletedTodos ? 'No active todos' : 'No todos yet'}
    </h3>
    <p className="mt-2 text-sm text-gray-500">
      {hasCompletedTodos
        ? 'All tasks are complete! Add a new todo to keep being productive.'
        : 'Get started by adding your first todo above.'}
    </p>
  </div>
);

/**
 * Section header component for separating active/completed todos
 */
const SectionHeader: React.FC<{ title: string; count: number }> = ({ title, count }) => (
  <div className="flex items-center gap-2 mb-3">
    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
      {title}
    </h3>
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
      {count}
    </span>
  </div>
);

/**
 * TodoList component displays a list of todos with optional section separation.
 * Handles loading states, empty states, and separates completed from active todos.
 */
const TodoList: React.FC<TodoListProps> = ({
  todos,
  onToggleComplete,
  onEdit,
  onDelete,
  isLoading = false,
  separateSections = true,
}) => {
  // Show loading skeleton
  if (isLoading) {
    return (
      <div
        className="space-y-4"
        role="status"
        aria-label="Loading todos"
      >
        <LoadingSpinner className="mx-auto mb-4" />
        {[1, 2, 3].map((i) => (
          <TodoSkeleton key={i} />
        ))}
        <span className="sr-only">Loading todos...</span>
      </div>
    );
  }

  // Show empty state
  if (todos.length === 0) {
    return <EmptyState />;
  }

  // Separate todos into active and completed
  const activeTodos = todos.filter((todo) => !todo.completed);
  const completedTodos = todos.filter((todo) => todo.completed);

  // Render without sections
  if (!separateSections) {
    return (
      <div
        className="space-y-4"
        role="list"
        aria-label="Todo list"
      >
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggleComplete={onToggleComplete}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    );
  }

  // Render with sections
  return (
    <div className="space-y-8" aria-label="Todo list">
      {/* Active Todos Section */}
      <section aria-labelledby="active-todos-heading">
        <SectionHeader title="Active" count={activeTodos.length} />
        {activeTodos.length === 0 ? (
          <EmptyState hasCompletedTodos={completedTodos.length > 0} />
        ) : (
          <div className="space-y-4" role="list" aria-label="Active todos">
            {activeTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggleComplete={onToggleComplete}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </section>

      {/* Completed Todos Section */}
      {completedTodos.length > 0 && (
        <section aria-labelledby="completed-todos-heading">
          <SectionHeader title="Completed" count={completedTodos.length} />
          <div className="space-y-4" role="list" aria-label="Completed todos">
            {completedTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggleComplete={onToggleComplete}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default TodoList;
