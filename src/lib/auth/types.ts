/**
 * @file types.ts
 * @description Type definitions for authentication and user management
 */

/**
 * User authentication status
 */
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

/**
 * Database profile row shape (snake_case from Supabase)
 */
export interface DatabaseProfile {
  id: string;
  display_name?: string | null;
  avatar_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  preferences?: UserPreferences | null;
}

/**
 * User profile information (camelCase for frontend)
 */
export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  preferences: UserPreferences;
}

/**
 * User preferences and settings
 */
export interface UserPreferences {
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
}

/**
 * Authentication credentials
 */
export interface AuthCredentials {
  email: string;
  password: string;
}

/**
 * Registration credentials
 */
export interface RegisterCredentials extends AuthCredentials {
  displayName?: string;
}

/**
 * Authentication session
 */
export interface AuthSession {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

/**
 * Authentication error
 */
export interface AuthError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
