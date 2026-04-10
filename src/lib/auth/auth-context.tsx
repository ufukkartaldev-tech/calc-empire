/**
 * @file auth-context.tsx
 * @description React Context for authentication state management with Supabase
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase-client';
import type { Database } from './supabase-client';
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

  const loadSession = useCallback(async () => {
    try {
      setStatus('loading');

      const {
        data: { session: supabaseSession },
        error,
      } = await supabase.auth.getSession();

      if (error) throw error;

      if (supabaseSession) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseSession.user.id)
          .single();

        if (profileError) throw profileError;

        const userProfile: UserProfile = {
          id: supabaseSession.user.id,
          email: supabaseSession.user.email!,
          displayName: profile?.display_name || undefined,
          avatarUrl: profile?.avatar_url || undefined,
          createdAt: profile?.created_at || new Date().toISOString(),
          updatedAt: profile?.updated_at || new Date().toISOString(),
          preferences: profile?.preferences || {
            theme: 'system',
            language: 'en',
            notifications: { email: true, push: false },
            privacy: { share_history: false, public_profile: false },
          },
        };

        const authSession: AuthSession = {
          user: userProfile,
          accessToken: supabaseSession.access_token,
          refreshToken: supabaseSession.refresh_token,
          expiresAt: new Date(supabaseSession.expires_at!).getTime(),
        };

        setSession(authSession);
        setUser(userProfile);
        setStatus('authenticated');
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

  // Load session from storage on mount
  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const signIn = useCallback(async (credentials: AuthCredentials) => {
    try {
      setStatus('loading');
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      if (data.session && data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') throw profileError;

        const userProfile: UserProfile = {
          id: data.user.id,
          email: data.user.email!,
          displayName: profile?.display_name || undefined,
          avatarUrl: profile?.avatar_url || undefined,
          createdAt: profile?.created_at || new Date().toISOString(),
          updatedAt: profile?.updated_at || new Date().toISOString(),
          preferences: profile?.preferences || {
            theme: 'system',
            language: 'en',
            notifications: { email: true, push: false },
            privacy: { share_history: false, public_profile: false },
          },
        };

        const authSession: AuthSession = {
          user: userProfile,
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: new Date(data.session.expires_at!).getTime(),
        };

        setSession(authSession);
        setUser(userProfile);
        setStatus('authenticated');
      }
    } catch (err) {
      setStatus('error');
      setError({
        code: 'SIGN_IN_ERROR',
        message: err instanceof Error ? err.message : 'Failed to sign in',
        details: err instanceof Error ? { message: err.message } : undefined,
      });
      throw err;
    }
  }, []);

  const signUp = useCallback(
    async (credentials: RegisterCredentials) => {
      try {
        setStatus('loading');
        setError(null);

        const { data, error } = await supabase.auth.signUp({
          email: credentials.email,
          password: credentials.password,
          options: {
            data: {
              display_name: credentials.displayName,
            },
          },
        });

        if (error) throw error;

        if (data.session && data.user) {
          await loadSession();
        } else {
          setStatus('unauthenticated');
        }
      } catch (err) {
        setStatus('error');
        setError({
          code: 'SIGN_UP_ERROR',
          message: err instanceof Error ? err.message : 'Failed to sign up',
          details: err instanceof Error ? { message: err.message } : undefined,
        });
        throw err;
      }
    },
    [loadSession]
  );

  const signOut = useCallback(async () => {
    try {
      setStatus('loading');

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

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

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      try {
        if (!user) throw new Error('No authenticated user');

        const dbUpdates: Partial<Database['public']['Tables']['profiles']['Update']> = {
          updated_at: new Date().toISOString(),
        };

        if (updates.displayName !== undefined) dbUpdates.display_name = updates.displayName;
        if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
        if (updates.preferences !== undefined) dbUpdates.preferences = updates.preferences;

        const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', user.id);

        if (error) throw error;

        const updatedUser = { ...user, ...updates, updatedAt: new Date().toISOString() };
        setUser(updatedUser);

        if (session) {
          const updatedSession = { ...session, user: updatedUser };
          setSession(updatedSession);
        }
      } catch (err) {
        setError({
          code: 'UPDATE_PROFILE_ERROR',
          message: 'Failed to update profile',
          details: err instanceof Error ? { message: err.message } : undefined,
        });
        throw err;
      }
    },
    [user, session]
  );

  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
    } catch (err) {
      setError({
        code: 'RESET_PASSWORD_ERROR',
        message: err instanceof Error ? err.message : 'Failed to reset password',
        details: err instanceof Error ? { message: err.message } : undefined,
      });
      throw err;
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const {
        data: { session: supabaseSession },
        error,
      } = await supabase.auth.getSession();

      if (error) throw error;

      if (supabaseSession) {
        const { data: refreshedSession, error: refreshError } =
          await supabase.auth.refreshSession();
        if (refreshError) throw refreshError;

        if (refreshedSession.session) {
          await loadSession();
        }
      }
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
