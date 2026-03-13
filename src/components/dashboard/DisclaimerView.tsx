/**
 * @file components/dashboard/DisclaimerView.tsx
 * @description Critical tool disclaimer component
 */

'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { ToolId } from '@/types';

interface DisclaimerViewProps {
  activeTool: ToolId;
  onBack: () => void;
  onAcknowledge: () => void;
}

export function DisclaimerView({ activeTool, onBack, onAcknowledge }: DisclaimerViewProps) {
  const tDash = useTranslations('Dashboard');

  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4">
      <button
        onClick={onBack}
        className="mb-8 px-4 py-2 flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
      >
        ← {tDash('backButton')}
      </button>

      <div className="p-8 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-3xl shadow-sm">
        <h3 className="text-amber-900 dark:text-amber-400 font-bold text-xl mb-4 flex items-center gap-3">
          <span className="text-2xl">⚠️</span> {tDash('consentTitle' as any) || "Kullanım Öncesi Onay"}
        </h3>
        <p className="text-amber-800 dark:text-amber-300 text-sm mb-8 leading-relaxed italic">
          {tDash('disclaimer' as any)}
        </p>
        <label className="flex items-start gap-4 cursor-pointer p-6 bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-amber-800 group hover:border-blue-400 transition-all shadow-sm">
          <input
            type="checkbox"
            className="mt-1 w-5 h-5 accent-blue-600 cursor-pointer"
            onChange={(e) => {
              if (e.target.checked) {
                onAcknowledge();
              }
            }}
          />
          <span className="text-sm text-slate-700 dark:text-slate-300 font-semibold group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
            {tDash('acknowledgeDisclaimer' as any)}
          </span>
        </label>
      </div>
    </div>
  );
}
