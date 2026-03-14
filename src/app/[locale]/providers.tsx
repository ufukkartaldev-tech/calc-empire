/**
 * @file app/[locale]/providers.tsx
 * @description Client-side providers for monitoring and analytics
 */

'use client';

import { useEffect } from 'react';
import { initPerformanceMonitoring } from '@/lib/monitoring';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize performance monitoring on client side
    initPerformanceMonitoring();
  }, []);

  return <>{children}</>;
}
