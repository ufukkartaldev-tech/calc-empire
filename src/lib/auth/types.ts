/**
 * @file types.ts
 * @description Type definitions for authentication and user management
 */

/**
 * User authentication status
 */
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

/**
 * User profile information
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
    shareHistory: boolean;
    publicProfile: boolean;
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
