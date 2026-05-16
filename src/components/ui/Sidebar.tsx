'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { SidebarProps, CategoryKey } from '@/types';
import { CATEGORY_ORDER } from '@/constants';
import {
  Zap,
  Code,
  Banknote,
  Building,
  Settings,
  FlaskConical,
  Waves,
  BarChart3,
  Divide,
  RefreshCw,
  Home,
  Search,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  electrical: <Zap size={16} strokeWidth={1.5} />,
  software: <Code size={16} strokeWidth={1.5} />,
  finance: <Banknote size={16} strokeWidth={1.5} />,
  civil: <Building size={16} strokeWidth={1.5} />,
  mechanical: <Settings size={16} strokeWidth={1.5} />,
  chemistry: <FlaskConical size={16} strokeWidth={1.5} />,
  fluid: <Waves size={16} strokeWidth={1.5} />,
  statistics: <BarChart3 size={16} strokeWidth={1.5} />,
  mathematics: <Divide size={16} strokeWidth={1.5} />,
  converters: <RefreshCw size={16} strokeWidth={1.5} />,
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
      <div className="p-4 border-b border-[var(--ce-border)]">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ce-text-muted)]"
            strokeWidth={1.5}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={tDash('searchPlaceholder' as string) || 'Search...'}
            className="professional-input w-full pl-9 pr-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Categories Section */}
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-1" aria-label="Tool Categories">
          <button
            onClick={() => onCategorySelect(null)}
            aria-pressed={activeCategory === null}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
              activeCategory === null
                ? 'bg-[var(--ce-primary)] text-white'
                : 'text-[var(--ce-text-secondary)] hover:text-[var(--ce-text-primary)] hover:bg-[var(--ce-surface-secondary)]'
            }`}
          >
            <Home size={16} strokeWidth={1.5} />
            <span>{tDash('allTools' as string) || 'All Tools'}</span>
          </button>

          {CATEGORY_ORDER.map((catKey) => (
            <button
              key={catKey}
              onClick={() => onCategorySelect(catKey)}
              aria-pressed={activeCategory === catKey}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                activeCategory === catKey
                  ? 'bg-[var(--ce-primary)] text-white'
                  : 'text-[var(--ce-text-secondary)] hover:text-[var(--ce-text-primary)] hover:bg-[var(--ce-surface-secondary)]'
              }`}
            >
              <span
                className={activeCategory === catKey ? 'text-white' : 'text-[var(--ce-text-muted)]'}
              >
                {ICON_MAP[catKey]}
              </span>
              <span>{tCat(catKey as CategoryKey)}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
