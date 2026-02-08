'use client';

/**
 * useAuth Hook
 *
 * Custom hook to access authentication context.
 * Re-exports the hook from AuthContext for cleaner imports.
 * Provides access to JWT token for API authorization.
 *
 * @example
 * ```tsx
 * import { useAuth } from '@/hooks/useAuth';
 *
 * function MyComponent() {
 *   const {
 *     user,
 *     isAuthenticated,
 *     isLoading,
 *     token,
 *     error,
 *     login,
 *     register,
 *     logout,
 *     clearError
 *   } = useAuth();
 *
 *   if (isLoading) {
 *     return <LoadingSpinner />;
 *   }
 *
 *   if (!isAuthenticated) {
 *     return <LoginPrompt />;
 *   }
 *
 *   // Use token for API calls
 *   const headers = { Authorization: `Bearer ${token}` };
 *
 *   return <Dashboard user={user} onLogout={logout} />;
 * }
 * ```
 */

import { useContext } from 'react';
import { AuthContext, AuthContextType } from '@/contexts/AuthContext';
import { getToken, getSession } from '@/lib/auth';

/**
 * Hook to access authentication context
 *
 * State properties:
 * - user: Current authenticated user (User | null)
 * - token: Current JWT token (string | null)
 * - isAuthenticated: Boolean indicating if user is authenticated
 * - isLoading: Boolean indicating if auth check is in progress
 * - error: Current error message (string | null)
 *
 * Methods:
 * - login: (email: string, password: string) => Promise<void>
 * - register: (email: string, password: string) => Promise<void>
 * - logout: () => void
 * - clearError: () => void
 *
 * @throws Error if used outside of AuthProvider
 * @returns AuthContextType - The authentication context value
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      'useAuth must be used within an AuthProvider. ' +
        'Make sure your component is wrapped with <AuthProvider>.'
    );
  }

  return context;
}

/**
 * Get the current JWT token directly (without context)
 * Useful for API calls outside of React components
 *
 * @returns The JWT token string or null if not authenticated
 */
export function useToken(): string | null {
  const { token } = useAuth();
  return token;
}

/**
 * Get current session info (token + user)
 * Returns null if not authenticated
 */
export function useSession() {
  const { token, user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !token || !user) {
    return null;
  }

  return {
    token,
    user,
  };
}

// Re-export auth module functions for convenience
export { getToken, getSession } from '@/lib/auth';

// Re-export types for convenience
export type { AuthContextType, AuthState, User } from '@/contexts/AuthContext';
export type { AuthUser } from '@/lib/auth';

export default useAuth;
