/**
 * @file app/[locale]/error.tsx
 * @description Error boundary for CalcEmpire
 */

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Error Icon */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-3xl animate-pulse" />
          <div className="relative w-full h-full bg-slate-900 dark:bg-slate-800 rounded-3xl border border-red-500/30 flex items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-red-400" />
          </div>
          {/* Error code badge */}
          <div className="absolute -bottom-2 -right-2 px-3 py-1 bg-red-500 rounded-full text-white text-xs font-bold">
            ERROR
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Something Went Wrong
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            An unexpected error occurred while loading this calculator. Please try again.
          </p>

          {/* Error details (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800 text-left overflow-hidden">
              <div className="flex items-center gap-2 mb-2 text-red-600 dark:text-red-400 font-semibold text-sm">
                <Bug className="w-4 h-4" />
                Development Error Details
              </div>
              <pre className="text-xs text-red-700 dark:text-red-300 overflow-x-auto whitespace-pre-wrap break-all font-mono">
                {error.message}
                {error.digest && `\nDigest: ${error.digest}`}
              </pre>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all hover:scale-105 active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-all"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* Support hint */}
        <p className="text-sm text-slate-500 dark:text-slate-500">
          If the problem persists, please try a different calculator or contact support.
        </p>
      </div>
    </div>
  );
}
