'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { CATEGORY_ORDER } from '@/constants';
import type { SearchableTool } from '@/types';
import { 
  Zap, Code, Banknote, Building, Settings, 
  FlaskConical, Waves, BarChart3, Divide, 
  RefreshCw, ArrowRight, Star
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
  electrical: 'text-blue-600 bg-blue-50 border-blue-200',
  software: 'text-amber-600 bg-amber-50 border-amber-200',
  finance: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  civil: 'text-orange-600 bg-orange-50 border-orange-200',
  mechanical: 'text-purple-600 bg-purple-50 border-purple-200',
  chemistry: 'text-rose-600 bg-rose-50 border-rose-200',
  fluid: 'text-cyan-600 bg-cyan-50 border-cyan-200',
  statistics: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  mathematics: 'text-sky-600 bg-sky-50 border-sky-200',
  converters: 'text-gray-600 bg-gray-50 border-gray-200',
};

const CAT_GRADIENTS: Record<string, string> = {
  electrical: 'from-blue-500 to-blue-600',
  software: 'from-amber-500 to-amber-600',
  finance: 'from-emerald-500 to-emerald-600',
  civil: 'from-orange-500 to-orange-600',
  mechanical: 'from-purple-500 to-purple-600',
  chemistry: 'from-rose-500 to-rose-600',
  fluid: 'from-cyan-500 to-cyan-600',
  statistics: 'from-indigo-500 to-indigo-600',
  mathematics: 'from-sky-500 to-sky-600',
  converters: 'from-gray-500 to-gray-600',
};

export function ToolGrid({ toolsByCategory }: ToolGridProps) {
  const tCat = useTranslations('Categories');

  return (
    <div className="space-y-16">
      {CATEGORY_ORDER.map((catKey) => {
        const catTools = toolsByCategory[catKey];
        if (!catTools || catTools.length === 0) return null;

        return (
          <section key={catKey} className="space-y-8">
            {/* Category Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${CAT_GRADIENTS[catKey]} flex items-center justify-center text-white shadow-lg`}>
                  {ICON_MAP[catKey]}
                </div>
                <div>
                  <h2 className="heading-3">{tCat(catKey as keyof IntlMessages['Categories'])}</h2>
                  <p className="body-small text-[var(--ce-text-muted)]">
                    {catTools.length} tool{catTools.length !== 1 ? 's' : ''} available
                  </p>
                </div>
              </div>
              
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${CAT_COLORS[catKey]}`}>
                {tCat(catKey as keyof IntlMessages['Categories'])}
              </div>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {catTools.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/calculators/${tool.id}`}
                  className={`professional-card group p-6 relative overflow-hidden ${
                    tool.isPopular ? 'md:col-span-2 lg:col-span-2' : ''
                  }`}
                >
                  {/* Popular Badge */}
                  {tool.isPopular && (
                    <div className="absolute top-4 right-4">
                      <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full">
                        <Star size={12} fill="currentColor" />
                        Popular
                      </div>
                    </div>
                  )}
                  
                  {/* Tool Icon */}
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${CAT_GRADIENTS[catKey]} flex items-center justify-center text-white text-2xl font-bold mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    {tool.icon}
                  </div>
                  
                  {/* Tool Content */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--ce-text-primary)] group-hover:text-[var(--ce-primary)] transition-colors line-clamp-2">
                        {tool.translatedTitle}
                      </h3>
                      <p className="body-small text-[var(--ce-text-muted)] line-clamp-2 mt-1">
                        {tool.translatedDesc}
                      </p>
                    </div>
                    
                    {/* Tool Features */}
                    <div className="flex items-center justify-between pt-2">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${CAT_COLORS[catKey]}`}>
                        {ICON_MAP[catKey]}
                        <span>{tCat(catKey as keyof IntlMessages['Categories'])}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-[var(--ce-text-muted)] group-hover:text-[var(--ce-primary)] transition-colors">
                        <span className="text-xs font-medium">Open</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
