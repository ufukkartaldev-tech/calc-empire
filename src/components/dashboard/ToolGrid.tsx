/**
 * @file components/dashboard/ToolGrid.tsx
 * @description Tool grid display component
 */

'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { SearchableTool, ToolId } from '@/types';
import { CATEGORY_ORDER, CATEGORY_ICONS } from '@/constants';

interface ToolGridProps {
  toolsByCategory: Partial<Record<string, SearchableTool[]>>;
  onToolSelect: (id: ToolId) => void;
}

export function ToolGrid({ toolsByCategory, onToolSelect }: ToolGridProps) {
  const tCat = useTranslations('Categories');
  const tDash = useTranslations('Dashboard');

  return (
    <div className="space-y-16">
      {CATEGORY_ORDER.map((catKey) => {
        const catTools = toolsByCategory[catKey];
        if (!catTools || catTools.length === 0) return null;

        return (
          <div key={catKey} className="animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-4 mb-8">
              <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-2xl shadow-sm">
                {CATEGORY_ICONS[catKey]}
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {tCat(catKey as any)}
              </h2>
              <div className="flex-1 h-[2px] bg-slate-100 dark:bg-slate-800/50 rounded-full ml-2"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {catTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => onToolSelect(tool.id)}
                  className="group w-full flex flex-col items-start p-6 rounded-3xl bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 text-left relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>

                  <div className="flex items-center gap-4 mb-4 relative z-10">
                    <span className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 text-2xl shadow-inner">
                      {tool.icon}
                    </span>
                    <span className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                      {tool.translatedTitle}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 relative z-10">
                    {tool.translatedDesc}
                  </p>

                  <div className="mt-6 flex items-center text-xs font-bold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity translate-x-1 group-hover:translate-x-0">
                    {tDash('openTool' as any) || 'ARACI AÇ'} <span className="ml-1">→</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
