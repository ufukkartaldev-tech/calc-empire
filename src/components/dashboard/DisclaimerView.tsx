/**
 * @file components/dashboard/DisclaimerView.tsx
 * @description Critical tool disclaimer component
 */

'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { ToolId, TranslationKey } from '@/types';

interface DisclaimerViewProps {
  activeTool: ToolId;
  onBack: () => void;
  onAcknowledge: () => void;
}

export function DisclaimerView({ activeTool, onBack, onAcknowledge }: DisclaimerViewProps) {
  const tDash = useTranslations('Dashboard');

  return (
    <div className="w-full max-w-3xl mx-auto py-16 px-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <button
        onClick={onBack}
        className="mb-12 px-6 py-3 flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 hover:bg-white dark:hover:bg-slate-900 hover:text-blue-600 dark:hover:text-blue-400 rounded-2xl transition-all shadow-xl shadow-blue-500/5 group"
      >
        <span className="group-hover:-translate-x-1 transition-transform">←</span>{' '}
        {tDash('backButton')}
      </button>

      <div className="p-10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border border-slate-200/50 dark:border-slate-800/50 rounded-[40px] shadow-2xl shadow-blue-500/5">
        <h3 className="text-amber-600 dark:text-amber-500 font-black text-2xl mb-6 flex items-center gap-4 uppercase tracking-tight">
          <span className="text-3xl">⚠️</span>{' '}
          {tDash('consentTitle' as TranslationKey) || 'Kullanım Öncesi Onay'}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-base mb-10 leading-relaxed italic font-medium">
          {tDash('disclaimer' as TranslationKey)}
        </p>
        <label className="flex items-center gap-6 cursor-pointer p-8 bg-white/60 dark:bg-slate-950/60 rounded-[32px] border border-amber-200/50 dark:border-amber-800/50 group hover:border-blue-500 transition-all shadow-xl shadow-blue-500/5">
          <input
            type="checkbox"
            className="w-6 h-6 rounded-lg accent-blue-600 cursor-pointer scale-125 transition-transform group-hover:scale-150"
            onChange={(e) => {
              if (e.target.checked) {
                setTimeout(onAcknowledge, 300);
              }
            }}
          />
          <span className="text-sm text-slate-700 dark:text-slate-300 font-black uppercase tracking-wider group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {tDash('acknowledgeDisclaimer' as TranslationKey)}
          </span>
        </label>
      </div>
    </div>
  );
}
