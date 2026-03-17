/**
 * @file components/dashboard/ToolGrid.tsx
 * @description Tool grid display component
 */

'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { SearchableTool, ToolId } from '@/types';
import { CATEGORY_ORDER, CATEGORY_ICONS } from '@/constants';

import { Link } from '@/i18n/routing';

interface ToolGridProps {
  toolsByCategory: Partial<Record<string, SearchableTool[]>>;
}

export function ToolGrid({ toolsByCategory }: ToolGridProps) {
  const tCat = useTranslations('Categories');
  const tDash = useTranslations('Dashboard');

  return (
    <div className="space-y-24">
      {CATEGORY_ORDER.map((catKey) => {
        const catTools = toolsByCategory[catKey];
        if (!catTools || catTools.length === 0) return null;

        return (
          <div key={catKey} className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="flex items-center gap-6 mb-12">
              <span className="flex items-center justify-center w-16 h-16 rounded-3xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 text-3xl shadow-2xl shadow-blue-500/10 animate-float">
                {CATEGORY_ICONS[catKey]}
              </span>
              <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {tCat(catKey as any)}
                </h2>
                <div className="h-1 w-12 bg-blue-600 dark:bg-blue-500 rounded-full mt-2"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {catTools.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/calculators/${tool.id}`}
                  className="group relative flex flex-col items-start p-8 rounded-[40px] bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 hover:border-blue-500/50 transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2"
                >
                  {/* Decorative Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                  <div className="flex items-center gap-5 mb-6 relative z-10">
                    <span className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/50 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 text-3xl shadow-inner group-hover:scale-110 group-hover:rotate-3">
                      {tool.icon}
                    </span>
                    <span className="font-black text-xl text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                      {tool.translatedTitle}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium relative z-10">
                    {tool.translatedDesc}
                  </p>

                  <div className="mt-8 flex items-center gap-2 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 relative z-10">
                    {tDash('openTool' as any) || 'ARACI AÇ'} 
                    <span className="w-8 h-[2px] bg-blue-600/30 group-hover:bg-blue-600 transition-all"></span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
