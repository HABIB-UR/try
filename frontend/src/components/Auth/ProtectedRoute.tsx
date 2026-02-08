'use client';

/**
 * ProtectedRoute Component
 *
 * A wrapper component that protects routes requiring authentication.
 * Redirects unauthenticated users to the login page and shows a loading
 * state while checking authentication status.
 *
 * @example
 * ```tsx
 * // In a page component
 * import { ProtectedRoute } from '@/components/Auth/ProtectedRoute';
 *
 * export default function DashboardPage() {
 *   return (
 *     <ProtectedRoute>
 *       <DashboardContent />
 *     </ProtectedRoute>
 *   );
 * }
 * ```
 */

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

// =============================================================================
// Types
// =============================================================================

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
// Loading Component
// =============================================================================

/**
 * Default loading spinner component
 */
function DefaultLoadingComponent(): JSX.Element {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50"
      role="status"
      aria-label="Checking authentication"
    >
      <div className="flex flex-col items-center space-y-4">
        {/* Spinner */}
        <div
          className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"
          aria-hidden="true"
        />
        {/* Loading text */}
        <p className="text-gray-600 text-sm font-medium">
          Checking authentication...
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// ProtectedRoute Component
// =============================================================================

/**
 * ProtectedRoute Component
 *
 * Wraps children and ensures user is authenticated before rendering.
 * Shows loading state during auth check and redirects to login if not authenticated.
 *
 * @param props - Component props
 * @returns Protected content or loading/redirect state
 */
export function ProtectedRoute({
  children,
  redirectTo = '/auth/login',
  loadingComponent,
  onRedirect,
}: ProtectedRouteProps): JSX.Element {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Handle redirect when not authenticated
  useEffect(() => {
    // Skip if still loading or already authenticated
    if (isLoading) {
      return;
    }

    // Redirect if not authenticated
    if (!isAuthenticated) {
      onRedirect?.();
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo, onRedirect]);

  // Show loading state while checking authentication
  if (isLoading) {
    return loadingComponent ? (
      <>{loadingComponent}</>
    ) : (
      <DefaultLoadingComponent />
    );
  }

  // Show nothing while redirecting (prevents flash of protected content)
  if (!isAuthenticated) {
    return loadingComponent ? (
      <>{loadingComponent}</>
    ) : (
      <DefaultLoadingComponent />
    );
  }

  // User is authenticated - render children
  return <>{children}</>;
}

// =============================================================================
// Higher-Order Component (Alternative API)
// =============================================================================

/**
 * Higher-order component version of ProtectedRoute
 *
 * @example
 * ```tsx
 * import { withProtectedRoute } from '@/components/Auth/ProtectedRoute';
 *
 * function DashboardPage() {
 *   return <div>Dashboard Content</div>;
 * }
 *
 * export default withProtectedRoute(DashboardPage);
 * ```
 *
 * @param Component - Component to wrap with protection
 * @param options - Optional configuration
 * @returns Protected component
 */
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, 'children'>
): React.FC<P> {
  const displayName = Component.displayName || Component.name || 'Component';

  const WrappedComponent: React.FC<P> = (props) => {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };

  WrappedComponent.displayName = `withProtectedRoute(${displayName})`;

  return WrappedComponent;
}

// =============================================================================
// Exports
// =============================================================================

export default ProtectedRoute;
