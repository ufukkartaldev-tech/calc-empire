'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { SidebarProps } from '@/types';
import { CATEGORY_ORDER } from '@/constants';
import { 
  Zap, Code, Banknote, Building, Settings, 
  FlaskConical, Waves, BarChart3, Divide, 
  RefreshCw, Home, Search, Filter 
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  electrical: <Zap size={18} strokeWidth={1.5} />,
  software: <Code size={18} strokeWidth={1.5} />,
  finance: <Banknote size={18} strokeWidth={1.5} />,
  civil: <Building size={18} strokeWidth={1.5} />,
  mechanical: <Settings size={18} strokeWidth={1.5} />,
  chemistry: <FlaskConical size={18} strokeWidth={1.5} />,
  fluid: <Waves size={18} strokeWidth={1.5} />,
  statistics: <BarChart3 size={18} strokeWidth={1.5} />,
  mathematics: <Divide size={18} strokeWidth={1.5} />,
  converters: <RefreshCw size={18} strokeWidth={1.5} />,
};

const CATEGORY_COLORS: Record<string, string> = {
  electrical: 'text-blue-600',
  software: 'text-amber-600',
  finance: 'text-emerald-600',
  civil: 'text-orange-600',
  mechanical: 'text-purple-600',
  chemistry: 'text-rose-600',
  fluid: 'text-cyan-600',
  statistics: 'text-indigo-600',
  mathematics: 'text-sky-600',
  converters: 'text-gray-600',
};

export function Sidebar({
  activeCategory,
  onCategorySelect,
  searchQuery,
  onSearchChange,
}: SidebarProps) {
  const tCat = useTranslations('Categories');
  const tDash = useTranslations('Dashboard');

  return (
    <aside className="sidebar-professional">
      {/* Search Section */}
      <div className="p-6 border-b border-[var(--ce-border)]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ce-text-muted)]" strokeWidth={1.5} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={tDash('searchPlaceholder' as keyof IntlMessages['Dashboard']) || 'Search calculators...'}
            className="professional-input w-full pl-10 pr-4 py-3"
          />
        </div>
      </div>

      {/* Categories Section */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={16} className="text-[var(--ce-text-muted)]" />
            <h3 className="text-sm font-semibold text-[var(--ce-text-primary)] uppercase tracking-wide">
              Categories
            </h3>
          </div>
          
          <nav className="space-y-1">
            <button
              onClick={() => onCategorySelect(null)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeCategory === null 
                  ? 'bg-[var(--ce-primary)] text-white shadow-md' 
                  : 'text-[var(--ce-text-secondary)] hover:text-[var(--ce-text-primary)] hover:bg-[var(--ce-surface-secondary)]'
              }`}
            >
              <Home size={18} strokeWidth={1.5} />
              <span>{tDash('allTools' as keyof IntlMessages['Dashboard']) || 'All Tools'}</span>
            </button>

            {CATEGORY_ORDER.map((catKey) => (
              <button
                key={catKey}
                onClick={() => onCategorySelect(catKey)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeCategory === catKey 
                    ? 'bg-[var(--ce-primary)] text-white shadow-md' 
                    : 'text-[var(--ce-text-secondary)] hover:text-[var(--ce-text-primary)] hover:bg-[var(--ce-surface-secondary)]'
                }`}
              >
                <span className={activeCategory === catKey ? 'text-white' : CATEGORY_COLORS[catKey]}>
                  {ICON_MAP[catKey]}
                </span>
                <span>{tCat(catKey as keyof IntlMessages['Categories'])}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Quick Stats */}
        <div className="professional-card p-4">
          <h4 className="text-sm font-semibold text-[var(--ce-text-primary)] mb-3">Quick Stats</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--ce-text-muted)]">Total Tools</span>
              <span className="font-medium text-[var(--ce-text-primary)]">30+</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--ce-text-muted)]">Categories</span>
              <span className="font-medium text-[var(--ce-text-primary)]">8</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--ce-text-muted)]">Languages</span>
              <span className="font-medium text-[var(--ce-text-primary)]">5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Quote */}
      <div className="p-6 border-t border-[var(--ce-border)] bg-[var(--ce-surface-secondary)]">
        <blockquote className="text-xs text-[var(--ce-text-muted)] italic leading-relaxed">
          &quot;Precision in calculation leads to excellence in engineering.&quot;
        </blockquote>
      </div>
    </aside>
  );
}
