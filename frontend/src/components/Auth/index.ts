/**
 * Auth Components Index
 *
 * Central export point for all authentication-related components
 */

export { default as LoginForm } from './LoginForm';
export { default as RegisterForm } from './RegisterForm';
export {
  ProtectedRoute,
  withProtectedRoute,
  default as ProtectedRouteDefault,
} from './ProtectedRoute';

export type { ProtectedRouteProps } from './ProtectedRoute';
