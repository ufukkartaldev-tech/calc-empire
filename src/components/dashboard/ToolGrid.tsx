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

export function ToolGrid({ toolsByCategory }: ToolGridProps) {
  const tCat = useTranslations('Categories');
  const tDash = useTranslations('Dashboard');

  return (
    <div className="space-y-12 pb-20">
      {CATEGORY_ORDER.map((catKey) => {
        const catTools = toolsByCategory[catKey];
        if (!catTools || catTools.length === 0) return null;

        return (
          <div key={catKey}>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-slate-400 group-hover:text-blue-500 transition-colors">
                {ICON_MAP[catKey]}
              </span>
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-[0.15em]">
                {tCat(catKey as any)}
              </h2>
              <div className="flex-1 h-[1px] bg-slate-800 ml-4"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {catTools.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/calculators/${tool.id}`}
                  className="bento-card group p-3 flex items-center gap-4"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 group-hover:bg-blue-600/20 group-hover:text-blue-500 transition-all border border-slate-700">
                    <span className="text-lg">{tool.icon}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-100 tracking-tight group-hover:text-blue-500 transition-colors truncate">
                      {tool.translatedTitle}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 leading-tight">
                      {tool.translatedDesc}
                    </p>
                  </div>

                  <ArrowRight size={14} className="text-slate-700 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
