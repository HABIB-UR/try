'use client';

import React, { useState, useEffect, useId } from 'react';
import type { Todo } from '@/lib/api';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

interface TodoFormData {
  title: string;
  description: string;
}

interface TodoFormProps {
  /** Callback when form is submitted with valid data */
  onSubmit: (data: TodoFormData) => void;
  /** Initial data for edit mode */
  initialData?: Todo;
  /** Callback when cancel is clicked (only shown in edit mode) */
  onCancel?: () => void;
  /** Whether form submission is in progress */
  isLoading?: boolean;
}

interface FormErrors {
  title?: string;
  description?: string;
}

/**
 * TodoForm component for creating and editing todos.
 * Handles form validation and provides accessible form controls.
 */
const TodoForm: React.FC<TodoFormProps> = ({
  onSubmit,
  initialData,
  onCancel,
  isLoading = false,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ title: boolean; description: boolean }>({
    title: false,
    description: false,
  });

  // Generate unique IDs for form elements
  const formId = useId();
  const titleId = `${formId}-title`;
  const descriptionId = `${formId}-description`;
  const titleErrorId = `${formId}-title-error`;

  const isEditMode = !!initialData;

  // Populate form with initial data when editing
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
    }
  }, [initialData]);

  // Validate form data
  const validate = (data: TodoFormData): FormErrors => {
    const newErrors: FormErrors = {};

    if (!data.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (data.title.trim().length < 2) {
      newErrors.title = 'Title must be at least 2 characters';
    } else if (data.title.trim().length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (data.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    return newErrors;
  };

  // Handle field blur for validation
  const handleBlur = (field: 'title' | 'description') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const validationErrors = validate({ title, description });
    setErrors(validationErrors);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({ title: true, description: true });

    const formData: TodoFormData = {
      title: title.trim(),
      description: description.trim(),
    };

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      onSubmit(formData);

      // Clear form only in create mode
      if (!isEditMode) {
        setTitle('');
        setDescription('');
        setTouched({ title: false, description: false });
      }
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setTitle(initialData?.title || '');
    setDescription(initialData?.description || '');
    setErrors({});
    setTouched({ title: false, description: false });
    onCancel?.();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="card space-y-4"
      aria-label={isEditMode ? 'Edit todo form' : 'Create todo form'}
      noValidate
    >
      <h2 className="text-xl font-semibold text-gray-900">
        {isEditMode ? 'Edit Todo' : 'Add New Todo'}
      </h2>

      {/* Title Field */}
      <div>
        <label
          htmlFor={titleId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Title <span className="text-red-500" aria-hidden="true">*</span>
          <span className="sr-only">(required)</span>
        </label>
        <input
          type="text"
          id={titleId}
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => handleBlur('title')}
          disabled={isLoading}
          className={`input-field ${
            touched.title && errors.title
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : ''
          }`}
          placeholder="What needs to be done?"
          aria-required="true"
          aria-invalid={touched.title && !!errors.title}
          aria-describedby={touched.title && errors.title ? titleErrorId : undefined}
          autoComplete="off"
        />
        {touched.title && errors.title && (
          <p
            id={titleErrorId}
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {errors.title}
          </p>
        )}
      </div>

      {/* Description Field */}
      <div>
        <label
          htmlFor={descriptionId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description
          <span className="text-gray-400 text-xs ml-1">(optional)</span>
        </label>
        <textarea
          id={descriptionId}
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => handleBlur('description')}
          disabled={isLoading}
          rows={3}
          className={`input-field resize-none ${
            touched.description && errors.description
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : ''
          }`}
          placeholder="Add more details..."
          aria-invalid={touched.description && !!errors.description}
        />
        {touched.description && errors.description && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.description}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-400">
          {description.length}/1000 characters
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
        {isEditMode && onCancel && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="btn-secondary w-full sm:w-auto"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full sm:w-auto inline-flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              {isEditMode ? 'Saving...' : 'Adding...'}
            </>
          ) : (
            <>
              {isEditMode ? 'Save Changes' : 'Add Todo'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default TodoForm;
