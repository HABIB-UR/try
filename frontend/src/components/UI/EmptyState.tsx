'use client';

import React from 'react';
import type { EmptyStateProps } from '@/types';

/**
 * Default clipboard icon with checkmark
 * Used when no custom icon is provided
 */
const DefaultIcon: React.FC = () => (
  <svg
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    className="h-full w-full"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
    />
  </svg>
);

/**
 * EmptyState component displays a friendly empty state with guidance.
 * Used to indicate when there is no content to display, with optional
 * customization for icon, title, description, and action.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   title="No tasks yet"
 *   description="Create your first task to get started"
 *   action={<Button onClick={handleCreate}>Add Task</Button>}
 * />
 * ```
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-12 px-4 ${className}`}
      role="status"
      aria-label={title}
    >
      {/* Icon container */}
      <div className="mx-auto h-24 w-24 text-gray-300">
        {icon ?? <DefaultIcon />}
      </div>

      {/* Title */}
      <h3 className="mt-4 text-lg font-medium text-gray-900">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="mt-2 text-sm text-gray-500 max-w-sm">
          {description}
        </p>
      )}

      {/* Action */}
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
