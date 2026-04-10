/**
 * @file components/ui/ReferenceCard.tsx
 * @description A shared component for displaying tool reference/info content
 */

'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { TranslationKey } from '@/types';

interface ReferenceCardProps {
  referenceKey: string;
}

interface Link {
  url: string;
  label: string;
}

export function ReferenceCard({ referenceKey }: ReferenceCardProps) {
  const t = useTranslations();

  const content = t(`${referenceKey}.content` as TranslationKey);
  const links = t.raw(`${referenceKey}.links` as TranslationKey) as Link[];
  const hasLinks = Array.isArray(links) && links.length > 0;

  return (
    <div className="mt-12 border-t border-slate-200 dark:border-slate-800 pt-12">
      <div className="max-w-3xl">
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-lg shadow-sm">
            📚
          </span>
          {t('ToolReference.title')}
        </h3>

        <div className="p-8 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-3xl">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap text-base mb-6">
              {content}
            </p>
          </div>

          {hasLinks && (
            <div className="border-t border-slate-200 dark:border-slate-800 mt-6 pt-6">
              <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                🔗 {t('ToolReference.sources')}
              </h4>
              <ul className="space-y-3">
                {links.map((link: Link, index: number) => (
                  <li key={index}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600/30 group-hover:bg-blue-600 transition-colors" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
