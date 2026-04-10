'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { CATEGORY_ORDER } from '@/constants';
import type { SearchableTool } from '@/types';
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
} from 'lucide-react';

interface ToolGridProps {
  toolsByCategory: Partial<Record<string, SearchableTool[]>>;
}

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

export function ToolGrid({ toolsByCategory }: ToolGridProps) {
  const tCat = useTranslations('Categories');

  return (
    <div className="space-y-8">
      {CATEGORY_ORDER.map((catKey) => {
        const catTools = toolsByCategory[catKey];
        if (!catTools || catTools.length === 0) return null;

        return (
          <section key={catKey} className="space-y-4">
            {/* Category Header */}
            <div className="flex items-center gap-2 pb-2 border-b border-[var(--ce-border)]">
              <span className="text-[var(--ce-text-muted)]">{ICON_MAP[catKey]}</span>
              <h2 className="text-sm font-medium text-[var(--ce-text-primary)]">
                {tCat(catKey as string)}
              </h2>
              <span className="text-xs text-[var(--ce-text-muted)]">({catTools.length})</span>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {catTools.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/calculators/${tool.id}`}
                  className="professional-card p-4 block hover:border-[var(--ce-primary)] transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[var(--ce-surface-secondary)] rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">{tool.icon}</span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-medium text-[var(--ce-text-primary)] line-clamp-1 mb-1">
                        {tool.translatedTitle}
                      </h3>
                      <p className="text-xs text-[var(--ce-text-muted)] line-clamp-2">
                        {tool.translatedDesc}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
