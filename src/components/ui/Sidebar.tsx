'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { SidebarProps } from '@/types';
import { CATEGORY_ORDER, CATEGORY_ICONS } from '@/constants';

export function Sidebar({
  activeCategory,
  onCategorySelect,
  searchQuery,
  onSearchChange,
}: SidebarProps) {
  const tCat = useTranslations('Categories');
  const tDash = useTranslations('Dashboard');

  return (
    <aside className="w-80 hidden md:flex flex-col border-r border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-950/40 backdrop-blur-2xl sticky top-20 h-[calc(100vh-5rem)] m-4 rounded-[40px] p-6 overflow-hidden shadow-2xl shadow-blue-500/5 group">
      {/* Search Input */}
      <div className="relative mb-8 px-2">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none transition-transform group-focus-within:scale-110">
          <span className="text-slate-400 text-lg">🔍</span>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={tDash('searchPlaceholder' as any) || 'Ara...'}
          className="w-full pl-12 pr-4 py-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all placeholder:text-slate-400"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-2 custom-scrollbar">
        <nav className="space-y-2">
          <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-4 mb-4">
            {tDash('categoriesTitle' as any) || 'KATEGORİLER'}
          </p>
          <button
            onClick={() => onCategorySelect(null)}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-[24px] text-sm font-bold transition-all duration-300 ${
              activeCategory === null
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:shadow-lg'
            }`}
          >
            <span className="text-xl">🏠</span>
            <span className="tracking-wide">{tDash('allTools' as any) || 'Tüm Araçlar'}</span>
          </button>

          {CATEGORY_ORDER.map((catKey) => (
            <button
              key={catKey}
              onClick={() => onCategorySelect(catKey)}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-[24px] text-sm font-bold transition-all duration-300 ${
                activeCategory === catKey
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:shadow-lg'
              }`}
            >
              <span className="text-xl">{CATEGORY_ICONS[catKey]}</span>
              <span className="tracking-wide">{tCat(catKey as any)}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto pt-8 px-2">
        <div className="p-6 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 rounded-[32px] border border-blue-500/10 relative overflow-hidden group/quote">
          <div className="absolute -right-4 -bottom-4 text-6xl opacity-10 group-hover/quote:rotate-12 transition-transform duration-700">
            ⚙️
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-bold italic relative z-10">
            "En iyi mühendis, en az hesapla en sağlam işi çıkarandır."
          </p>
        </div>
      </div>
    </aside>
  );
}
