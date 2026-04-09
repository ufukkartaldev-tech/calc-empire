/**
 * @file auth-context.tsx
 * @description React Context for authentication state management
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  AuthStatus,
  UserProfile,
  AuthCredentials,
  RegisterCredentials,
  AuthError,
  AuthSession,
} from './types';

interface AuthContextType {
  status: AuthStatus;
  user: UserProfile | null;
  session: AuthSession | null;
  error: AuthError | null;
  signIn: (credentials: AuthCredentials) => Promise<void>;
  signUp: (credentials: RegisterCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [error, setError] = useState<AuthError | null>(null);

  // Load session from storage on mount
  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = useCallback(async () => {
    try {
      setStatus('loading');
      // TODO: Implement actual session loading from Supabase/Firebase
      const storedSession = localStorage.getItem('auth_session');
      
      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        // Validate session expiration
        if (parsed.expiresAt > Date.now()) {
          setSession(parsed);
          setUser(parsed.user);
          setStatus('authenticated');
        } else {
          // Session expired
          localStorage.removeItem('auth_session');
          setStatus('unauthenticated');
        }
      } else {
        setStatus('unauthenticated');
      }
    } catch (err) {
      setStatus('error');
      setError({
        code: 'SESSION_LOAD_ERROR',
        message: 'Failed to load authentication session',
        details: err instanceof Error ? { message: err.message } : undefined,
      });
    }
  }, []);

  const signIn = useCallback(async (credentials: AuthCredentials) => {
    try {
      setStatus('loading');
      setError(null);
      
      // TODO: Implement actual sign-in with Supabase/Firebase
      // This is a placeholder implementation
      console.log('Sign in with:', credentials.email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStatus('authenticated');
    } catch (err) {
      setStatus('error');
      setError({
        code: 'SIGN_IN_ERROR',
        message: 'Failed to sign in',
        details: err instanceof Error ? { message: err.message } : undefined,
      });
      throw err;
    }
  }, []);

  const signUp = useCallback(async (credentials: RegisterCredentials) => {
    try {
      setStatus('loading');
      setError(null);
      
      // TODO: Implement actual sign-up with Supabase/Firebase
      console.log('Sign up with:', credentials.email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStatus('authenticated');
    } catch (err) {
      setStatus('error');
      setError({
        code: 'SIGN_UP_ERROR',
        message: 'Failed to sign up',
        details: err instanceof Error ? { message: err.message } : undefined,
      });
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setStatus('loading');
      
      // TODO: Implement actual sign-out with Supabase/Firebase
      localStorage.removeItem('auth_session');
      setSession(null);
      setUser(null);
      
      setStatus('unauthenticated');
    } catch (err) {
      setStatus('error');
      setError({
        code: 'SIGN_OUT_ERROR',
        message: 'Failed to sign out',
        details: err instanceof Error ? { message: err.message } : undefined,
      });
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    try {
      if (!user) throw new Error('No authenticated user');
      
      // TODO: Implement actual profile update with Supabase/Firebase
      const updatedUser = { ...user, ...updates, updatedAt: new Date().toISOString() };
      setUser(updatedUser);
      
      // Update session if it exists
      if (session) {
        const updatedSession = { ...session, user: updatedUser };
        setSession(updatedSession);
        localStorage.setItem('auth_session', JSON.stringify(updatedSession));
      }
    } catch (err) {
      setError({
        code: 'UPDATE_PROFILE_ERROR',
        message: 'Failed to update profile',
        details: err instanceof Error ? { message: err.message } : undefined,
      });
      throw err;
    }
  }, [user, session]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      // TODO: Implement actual password reset with Supabase/Firebase
      console.log('Reset password for:', email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      setError({
        code: 'RESET_PASSWORD_ERROR',
        message: 'Failed to reset password',
        details: err instanceof Error ? { message: err.message } : undefined,
      });
      throw err;
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      // TODO: Implement actual session refresh with Supabase/Firebase
      await loadSession();
    } catch (err) {
      setError({
        code: 'REFRESH_SESSION_ERROR',
        message: 'Failed to refresh session',
        details: err instanceof Error ? { message: err.message } : undefined,
      });
    }
  }, [loadSession]);

  const value: AuthContextType = {
    status,
    user,
    session,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
