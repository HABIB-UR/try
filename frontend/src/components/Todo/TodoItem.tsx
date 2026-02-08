'use client';

import React from 'react';
import type { Todo, TodoItemProps } from '@/types';

/**
 * TodoItem component displays a single todo with controls for
 * toggling completion, editing, and deleting.
 */
const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  const handleToggle = () => {
    onToggleComplete(todo.id, !todo.completed);
  };

  const handleEdit = () => {
    onEdit(todo);
  };

  const handleDelete = () => {
    onDelete(todo.id);
  };

  const formattedDate = new Date(todo.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article
      className={`card flex flex-col sm:flex-row sm:items-start gap-4 transition-all duration-200 ${
        todo.completed ? 'bg-gray-50 opacity-75' : 'bg-white'
      }`}
      aria-label={`Todo: ${todo.title}`}
    >
      {/* Checkbox */}
      <div className="flex items-start pt-1">
        <input
          type="checkbox"
          id={`todo-checkbox-${todo.id}`}
          checked={todo.completed}
          onChange={handleToggle}
          className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          aria-describedby={`todo-title-${todo.id}`}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <label
            id={`todo-title-${todo.id}`}
            htmlFor={`todo-checkbox-${todo.id}`}
            className={`text-lg font-medium cursor-pointer ${
              todo.completed
                ? 'line-through text-gray-400'
                : 'text-gray-900'
            }`}
          >
            {todo.title}
          </label>

          {/* Status Badge */}
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
              todo.completed
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
            aria-label={todo.completed ? 'Completed' : 'In progress'}
          >
            {todo.completed ? 'Completed' : 'Active'}
          </span>
        </div>

        {/* Description */}
        {todo.description && (
          <p
            className={`mt-1 text-sm ${
              todo.completed ? 'text-gray-400 line-through' : 'text-gray-600'
            }`}
          >
            {todo.description}
          </p>
        )}

        {/* Metadata */}
        <p className="mt-2 text-xs text-gray-400">
          Created: {formattedDate}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:flex-shrink-0">
        <button
          type="button"
          onClick={handleEdit}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          aria-label={`Edit ${todo.title}`}
        >
          <svg
            className="h-4 w-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Edit
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          aria-label={`Delete ${todo.title}`}
        >
          <svg
            className="h-4 w-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Delete
        </button>
      </div>
    </article>
  );
};

export default TodoItem;
