/**
 * @file components/dashboard/EmptyState.tsx
 * @description Empty state when no tools match search
 */

'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { CONTACT_EMAIL } from '@/constants';

export function EmptyState() {
  const tDash = useTranslations('Dashboard');

  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
      <div className="text-7xl mb-6">🔭</div>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
        {tDash('noResults' as any)}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
        {tDash('requestTool' as any)}
      </p>
      <a
        href={`mailto:${CONTACT_EMAIL}`}
        className="inline-flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-lg hover:shadow-blue-500/25 active:scale-95"
      >
        <span>📧</span> {tDash('contactUs' as any)}
      </a>
    </div>
  );
}
