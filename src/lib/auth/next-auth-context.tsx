/**
 * @file next-auth-context.tsx
 * @description React Context wrapper for NextAuth.js
 */

'use client';

import React, { createContext, useContext } from 'react';
import { SessionProvider, useSession, signIn, signOut } from 'next-auth/react';
import type { Session } from 'next-auth';

interface NextAuthContextType {
  session: Session | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  signIn: (
    provider?: string,
    credentials?: { email: string; password: string }
  ) => Promise<boolean>;
  signOut: () => Promise<void>;
  user: Session['user'] | null;
}

const NextAuthContext = createContext<NextAuthContextType | undefined>(undefined);

function NextAuthProviderInner({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  const handleSignIn = async (
    provider?: string,
    credentials?: { email: string; password: string }
  ) => {
    try {
      if (credentials) {
        const result = await signIn('credentials', {
          email: credentials.email,
          password: credentials.password,
          redirect: false,
        });
        return result !== null && result !== undefined;
      } else if (provider) {
        const result = await signIn(provider, { redirect: false });
        return result !== null && result !== undefined;
      } else {
        const result = await signIn();
        return result !== null && result !== undefined;
      }
    } catch {
      return false;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch {
      // Silently ignore sign out errors
    }
  };

  const value: NextAuthContextType = {
    session,
    status,
    signIn: handleSignIn,
    signOut: handleSignOut,
    user: session?.user || null,
  };

  return <NextAuthContext.Provider value={value}>{children}</NextAuthContext.Provider>;
}

export function NextAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NextAuthProviderInner>{children}</NextAuthProviderInner>
    </SessionProvider>
  );
}

export function useNextAuth() {
  const context = useContext(NextAuthContext);
  if (context === undefined) {
    throw new Error('useNextAuth must be used within a NextAuthProvider');
  }
  return context;
}
