'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { CATEGORY_ORDER } from '@/constants';
import type { SearchableTool } from '@/types';
import { 
  Zap, Code, Banknote, Building, Settings, 
  FlaskConical, Waves, BarChart3, Divide, 
  RefreshCw, ArrowRight
} from 'lucide-react';

interface ToolGridProps {
  toolsByCategory: Partial<Record<string, SearchableTool[]>>;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  electrical: <Zap size={20} strokeWidth={1.5} />,
  software: <Code size={20} strokeWidth={1.5} />,
  finance: <Banknote size={20} strokeWidth={1.5} />,
  civil: <Building size={20} strokeWidth={1.5} />,
  mechanical: <Settings size={20} strokeWidth={1.5} />,
  chemistry: <FlaskConical size={20} strokeWidth={1.5} />,
  fluid: <Waves size={20} strokeWidth={1.5} />,
  statistics: <BarChart3 size={20} strokeWidth={1.5} />,
  mathematics: <Divide size={20} strokeWidth={1.5} />,
  converters: <RefreshCw size={20} strokeWidth={1.5} />,
};

const CAT_COLORS: Record<string, string> = {
  electrical: 'text-blue-400',
  software: 'text-amber-400',
  finance: 'text-emerald-400',
  civil: 'text-orange-400',
  mechanical: 'text-purple-400',
  chemistry: 'text-rose-400',
  fluid: 'text-cyan-400',
  statistics: 'text-indigo-400',
  mathematics: 'text-sky-400',
  converters: 'text-slate-400',
};

export function ToolGrid({ toolsByCategory }: ToolGridProps) {
  const tCat = useTranslations('Categories');
  const tDash = useTranslations('Dashboard');

  return (
    <div className="space-y-16 pb-24">
      {CATEGORY_ORDER.map((catKey) => {
        const catTools = toolsByCategory[catKey];
        if (!catTools || catTools.length === 0) return null;

        return (
          <div key={catKey}>
            <div className="flex items-center gap-3 mb-8">
              <span className={`transition-colors ${CAT_COLORS[catKey]}`}>
                {ICON_MAP[catKey]}
              </span>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {tCat(catKey as any)}
              </h2>
              <div className="flex-1 h-[1px] bg-slate-800/50 ml-4"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {catTools.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/calculators/${tool.id}`}
                  className={`bento-card group p-5 flex items-center gap-5 ${
                    tool.isPopular ? 'md:col-span-2 lg:col-span-2' : ''
                  }`}
                >
                  <div className={`flex-shrink-0 w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700 transition-all group-hover:bg-slate-750 ${CAT_COLORS[catKey]}`}>
                    <span className="text-2xl">{tool.icon}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white tracking-tight group-hover:text-blue-400 transition-colors truncate">
                      {tool.translatedTitle}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-1 font-medium italic opacity-80">
                      {tool.translatedDesc}
                    </p>
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
