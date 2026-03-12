'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CATEGORY_ORDER, CATEGORY_ICONS } from '../dashboard/tools.config';

interface SidebarProps {
    activeCategory: string | null;
    onCategorySelect: (category: string | null) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export function Sidebar({ activeCategory, onCategorySelect, searchQuery, onSearchChange }: SidebarProps) {
    const tCat = useTranslations('Categories');
    const tDash = useTranslations('Dashboard');

    return (
        <aside className="w-72 hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl sticky top-16 h-[calc(100vh-4rem)] p-4 overflow-y-auto">
            {/* Search Input */}
            <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-400 text-sm">🔍</span>
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={tDash('searchPlaceholder' as any) || "Ara..."}
                    className="w-full pl-9 pr-3 py-2 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
            </div>

            <nav className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-2">
                    {tDash('categoriesTitle' as any) || "KATEGORİLER"}
                </p>
                <button
                    onClick={() => onCategorySelect(null)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeCategory === null
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-900/30'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                >
                    <span className="text-lg">🏠</span>
                    {tDash('allTools' as any) || "Tüm Araçlar"}
                </button>

                {CATEGORY_ORDER.map((catKey) => (
                    <button
                        key={catKey}
                        onClick={() => onCategorySelect(catKey)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeCategory === catKey
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-900/30'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                    >
                        <span className="text-lg">{CATEGORY_ICONS[catKey]}</span>
                        {tCat(catKey as any)}
                    </button>
                ))}
            </nav>

            <div className="mt-auto pt-6">
                <div className="p-4 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
                        "En iyi mühendis, en az hesapla en sağlam işi çıkarandır."
                    </p>
                </div>
            </div>
        </aside>
    );
}
