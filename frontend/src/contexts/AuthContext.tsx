'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useMemo,
} from 'react';
import {
  auth,
  getToken,
  getSession,
  isAuthenticated as authIsAuthenticated,
  getStoredUser,
  decodeToken,
  AuthUser,
  AuthError,
} from '@/lib/auth';

// Import User type from centralized types
import type { User } from '@/types';

// =============================================================================
// Types
// =============================================================================

/**
 * Authentication state interface
 */
export interface AuthState {
  /** Currently authenticated user or null */
  user: User | null;
  /** Current JWT token or null */
  token: string | null;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Whether auth state is being loaded/checked */
  isLoading: boolean;
  /** Current error message or null */
  error: string | null;
}

/**
 * Authentication context interface
 * Extends AuthState with methods for authentication operations
 */
export interface AuthContextType extends AuthState {
  /** Login user with email and password */
  login: (email: string, password: string) => Promise<void>;
  /** Register new user with email and password */
  register: (email: string, password: string) => Promise<void>;
  /** Logout current user */
  logout: () => void;
  /** Clear current error state */
  clearError: () => void;
}

// =============================================================================
// Context
// =============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Convert AuthUser to User format
 * Maps the auth library user format to the centralized User type
 * Note: User.id is a string UUID, User also has created_at and updated_at
 */
function authUserToUser(authUser: AuthUser | null): User | null {
  if (!authUser) return null;
  const now = new Date().toISOString();
  return {
    id: authUser.id,
    email: authUser.email,
    created_at: now,
    updated_at: now,
  };
}

/**
 * Check if the current token is expired
 * @returns true if token is expired or invalid, false otherwise
 */
function isTokenExpired(token: string | null): boolean {
  if (!token) return true;

  try {
    const payload = decodeToken(token);
    if (!payload) return true;

    const now = Math.floor(Date.now() / 1000);
    return payload.exp <= now;
  } catch {
    return true;
  }
}

// =============================================================================
// Provider Component
// =============================================================================

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider Component
 * Wraps the application to provide authentication state and methods
 * Uses Better Auth integration from @/lib/auth
 *
 * Session Persistence (FR-008):
 * - On mount, checks localStorage for existing token
 * - Validates token expiration before restoring session
 * - Clears invalid/expired tokens automatically
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing authentication on mount using Better Auth
  // Implements session persistence with token expiration check (FR-008)
  useEffect(() => {
    const checkAuth = () => {
      // Only run on client side
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }

      // Get stored token from localStorage
      const storedToken = getToken();

      // Check if token exists and is not expired (FR-008)
      if (storedToken && !isTokenExpired(storedToken)) {
        // Token is valid, restore session
        const session = getSession();

        if (session) {
          setUser(authUserToUser(session.user));
          setToken(session.token);
        } else {
          // Session data incomplete, clear state
          setUser(null);
          setToken(null);
        }
      } else if (storedToken) {
        // Token exists but is expired, clear it
        auth.signOut();
        setUser(null);
        setToken(null);
      } else {
        // No token found
        setUser(null);
        setToken(null);
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  /**
   * Clear authentication error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Login user with email and password using Better Auth
   */
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Use Better Auth signIn
      await auth.signIn(email, password);

      // Get session after successful login
      const session = getSession();
      if (session) {
        setUser(authUserToUser(session.user));
        setToken(session.token);
      }
    } catch (err) {
      const message =
        err instanceof AuthError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Register new user with email and password using Better Auth
   */
  const register = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Use Better Auth signUp
      await auth.signUp(email, password);

      // Registration successful - user needs to login
      // Note: signUp stores user info but user should still login
      setUser(null);
      setToken(null);

      console.log('Registration successful');
    } catch (err) {
      const message =
        err instanceof AuthError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout current user using Better Auth
   */
  const logout = useCallback(() => {
    auth.signOut();
    setUser(null);
    setToken(null);
    setError(null);
  }, []);

  // Compute isAuthenticated using Better Auth
  const isAuthenticated = useMemo(() => {
    return user !== null && authIsAuthenticated();
  }, [user]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      token,
      login,
      register,
      logout,
      error,
      clearError,
    }),
    [user, isAuthenticated, isLoading, token, login, register, logout, error, clearError]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// =============================================================================
// Hook (inline for backward compatibility)
// =============================================================================

/**
 * Hook to access authentication context
 * @throws Error if used outside of AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

// =============================================================================
// Exports
// =============================================================================

export { AuthContext };
export type { AuthUser };
// Re-export User type for convenience
export type { User } from '@/types';
