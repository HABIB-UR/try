'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import RegisterForm from '@/components/Auth/RegisterForm';
import { auth, AuthError } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check if already authenticated on mount
  useEffect(() => {
    if (auth.isAuthenticated()) {
      router.push('/dashboard');
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  const handleRegister = async (email: string, password: string) => {
    setRegisterError(null);
    setIsSubmitting(true);
    try {
      await auth.signUp(email, password);
      // Redirect to login with success message after successful registration
      router.push('/auth/login?registered=true');
    } catch (err) {
      if (err instanceof AuthError) {
        // Handle specific error codes
        if (err.status === 409) {
          setRegisterError('An account with this email already exists');
        } else {
          setRegisterError(err.message);
        }
      } else {
        setRegisterError('Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking initial auth state
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, show redirecting message
  if (auth.isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {registerError && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <span>{registerError}</span>
            <button
              onClick={() => setRegisterError(null)}
              className="text-red-700 hover:text-red-900 font-bold"
              aria-label="Dismiss error"
            >
              x
            </button>
          </div>
        </div>
      )}
      <RegisterForm onRegister={handleRegister} isLoading={isSubmitting} />
    </div>
  );
}
