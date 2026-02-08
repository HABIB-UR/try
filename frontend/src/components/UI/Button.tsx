'use client';

import React, { forwardRef } from 'react';
import LoadingSpinner from './LoadingSpinner';
import type { ButtonProps, ButtonVariant, ButtonSize } from '@/types';

/**
 * Tailwind class mappings for button variants
 */
const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 disabled:bg-indigo-400',
  secondary:
    'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 disabled:bg-gray-100 disabled:text-gray-400',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400',
  ghost:
    'bg-transparent text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500 disabled:text-indigo-300',
};

/**
 * Tailwind class mappings for button sizes
 */
const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

/**
 * Spinner size mapping based on button size
 */
const spinnerSizes: Record<ButtonSize, 'sm' | 'md' | 'lg'> = {
  sm: 'sm',
  md: 'sm',
  lg: 'md',
};

/**
 * Button component with multiple variants, sizes, and loading state support.
 * Forwards all standard button HTML attributes and supports ref forwarding.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click me
 * </Button>
 *
 * <Button variant="danger" isLoading>
 *   Deleting...
 * </Button>
 * ```
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      disabled = false,
      isLoading = false,
      type = 'button',
      onClick,
      className = '',
      'aria-label': ariaLabel,
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    const baseClasses =
      'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed';

    const combinedClasses = [
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        onClick={onClick}
        className={combinedClasses}
        aria-label={ariaLabel}
        aria-busy={isLoading}
        {...rest}
      >
        {isLoading && (
          <LoadingSpinner
            size={spinnerSizes[size]}
            className="mr-2"
            label="Loading"
          />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
