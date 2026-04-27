/**
 * @file supabase-client.ts
 * @description Supabase client configuration for authentication and database
 *
 * This file provides the structure for Supabase integration.
 * To enable Supabase:
 * 1. Install @supabase/supabase-js: npm install @supabase/supabase-js
 * 2. Set environment variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
 * 3. Uncomment the client initialization code
 * 4. Update the AuthContext to use Supabase methods
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client initialization
 * Environment variables should be set in .env.local
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Supabase environment variables not set
}

// Supabase disabled for build - re-enable when env variables are configured
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockChainable: any = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  select: (_cols?: string) => mockChainable,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  insert: (_values?: unknown) => mockChainable,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update: (_values?: unknown) => mockChainable,

  delete: () => mockChainable,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  eq: (_col?: string, _val?: unknown) => Promise.resolve({ data: null, error: null }),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  order: (_col?: string) => mockChainable,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  limit: (_n?: number) => mockChainable,
  single: () => Promise.resolve({ data: null, error: null }),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase: any = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    signInWithOAuth: async () => ({ data: null, error: null }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
    signUp: async () => ({ data: { user: null, session: null }, error: null }),
    signOut: async () => ({ error: null }),
    resetPasswordForEmail: async () => ({ error: null }),
    refreshSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  from: () => mockChainable,
};

/**
 * Database schema types for Supabase
 * These types should match your Supabase database schema
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          preferences: {
            theme: 'light' | 'dark' | 'system';
            language: string;
            notifications: {
              email: boolean;
              push: boolean;
            };
            privacy: {
              share_history: boolean;
              public_profile: boolean;
            };
          };
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
          preferences?: {
            theme?: 'light' | 'dark' | 'system';
            language?: string;
            notifications?: {
              email?: boolean;
              push?: boolean;
            };
            privacy?: {
              share_history?: boolean;
              public_profile?: boolean;
            };
          };
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string;
          avatar_url?: string;
          updated_at?: string;
          preferences?: {
            theme?: 'light' | 'dark' | 'system';
            language?: string;
            notifications?: {
              email?: boolean;
              push?: boolean;
            };
            privacy?: {
              share_history?: boolean;
              public_profile?: boolean;
            };
          };
        };
      };
      calculation_history: {
        Row: {
          id: string;
          user_id: string;
          calculator_id: string;
          calculator_name: string;
          inputs: Record<string, { value: number | null; unit: string }>;
          outputs: Record<string, unknown>;
          timestamp: string;
          locale: string;
          is_favorite: boolean;
          tags: string[];
          notes: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          calculator_id: string;
          calculator_name: string;
          inputs: Record<string, { value: number | null; unit: string }>;
          outputs: Record<string, unknown>;
          timestamp?: string;
          locale: string;
          is_favorite?: boolean;
          tags?: string[];
          notes?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          calculator_id?: string;
          calculator_name?: string;
          inputs?: Record<string, { value: number | null; unit: string }>;
          outputs?: Record<string, unknown>;
          timestamp?: string;
          locale?: string;
          is_favorite?: boolean;
          tags?: string[];
          notes?: string;
        };
      };
    };
  };
}
