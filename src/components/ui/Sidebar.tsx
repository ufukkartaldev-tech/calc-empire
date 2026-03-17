'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { SidebarProps } from '@/types';
import { CATEGORY_ORDER } from '@/constants';
import { 
  Zap, Code, Banknote, Building, Settings, 
  FlaskConical, Waves, BarChart3, Divide, 
  RefreshCw, Home, Search 
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

export function Sidebar({
  activeCategory,
  onCategorySelect,
  searchQuery,
  onSearchChange,
}: SidebarProps) {
  const tCat = useTranslations('Categories');
  const tDash = useTranslations('Dashboard');

  return (
    <aside className="w-64 hidden md:flex flex-col border-r border-slate-800 bg-slate-900 sticky top-16 h-[calc(100vh-4rem)]">
      {/* Search Input */}
      <div className="p-4 border-b border-slate-800">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" strokeWidth={1.5} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={tDash('searchPlaceholder' as any) || 'Search...'}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-xs font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all placeholder:text-slate-600 text-slate-300"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar py-4">
        <nav className="space-y-0.5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-6 mb-3">
            {tDash('categoriesTitle' as any) || 'HESAPLAYICI ARAÇLARI'}
          </p>
          <button
            onClick={() => onCategorySelect(null)}
            className={`w-full flex items-center gap-3 px-6 py-2.5 text-xs font-semibold transition-all ${
              activeCategory === null ? 'nav-active' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Home size={18} strokeWidth={1.5} />
            <span>{tDash('allTools' as any) || 'Tüm Araçlar'}</span>
          </button>

          {CATEGORY_ORDER.map((catKey) => (
            <button
              key={catKey}
              onClick={() => onCategorySelect(catKey)}
              className={`w-full flex items-center gap-3 px-6 py-2.5 text-xs font-semibold transition-all ${
                activeCategory === catKey ? 'nav-active' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {ICON_MAP[catKey]}
              <span>{tCat(catKey as any)}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6 border-t border-slate-800 mt-auto bg-slate-950/30">
        <p className="text-[10px] text-slate-500 leading-relaxed font-medium italic">
          "En iyi mühendis, en az hesapla en sağlam işi çıkarandır."
        </p>
      </div>
    </aside>
  );
}
