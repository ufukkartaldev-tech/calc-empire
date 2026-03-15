/**
 * @file components/ui/CalculatorGuide.tsx
 * @description Calculator guide component with LaTeX support
 */

'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { useTranslations } from 'next-intl';

interface CalculatorGuideProps {
  content: string;
}

export function CalculatorGuide({ content }: CalculatorGuideProps) {
  const t = useTranslations('CalculatorGuide');

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      <div className="p-8 md:p-12">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">{t('title')}</h2>
          <div className="h-1 w-20 bg-blue-600 dark:bg-blue-500 rounded-full"></div>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              h1: ({ node, ...props }) => (
                <h1
                  className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4"
                  {...props}
                />
              ),
              h2: ({ node, ...props }) => (
                <h2
                  className="text-xl font-bold text-slate-900 dark:text-white mt-6 mb-3"
                  {...props}
                />
              ),
              h3: ({ node, ...props }) => (
                <h3
                  className="text-lg font-semibold text-slate-900 dark:text-white mt-4 mb-2"
                  {...props}
                />
              ),
              p: ({ node, ...props }) => (
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul
                  className="list-disc list-inside text-slate-700 dark:text-slate-300 mb-4 space-y-2"
                  {...props}
                />
              ),
              ol: ({ node, ...props }) => (
                <ol
                  className="list-decimal list-inside text-slate-700 dark:text-slate-300 mb-4 space-y-2"
                  {...props}
                />
              ),
              li: ({ node, ...props }) => <li className="pl-2" {...props} />,
              code: ({ node, inline, className, children, ...props }: any) => {
                const match = /language-(\w+)/.exec(className || '');
                return inline ? (
                  <code
                    className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm font-mono text-slate-800 dark:text-slate-200"
                    {...props}
                  >
                    {children}
                  </code>
                ) : (
                  <pre
                    className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto mb-4"
                    {...props}
                  >
                    <code
                      className="font-mono text-sm text-slate-800 dark:text-slate-200"
                      {...props}
                    >
                      {children}
                    </code>
                  </pre>
                );
              },
              pre: ({ node, ...props }: any) => <div {...props} />,
              blockquote: ({ node, ...props }) => (
                <blockquote
                  className="border-l-4 border-blue-500 pl-4 italic text-slate-600 dark:text-slate-400 mb-4"
                  {...props}
                />
              ),
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto mb-4">
                  <table
                    className="w-full border-collapse border border-slate-200 dark:border-slate-700"
                    {...props}
                  />
                </div>
              ),
              th: ({ node, ...props }) => (
                <th
                  className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 text-left font-semibold text-slate-900 dark:text-white"
                  {...props}
                />
              ),
              td: ({ node, ...props }) => (
                <td
                  className="border border-slate-200 dark:border-slate-700 px-4 py-2 text-slate-700 dark:text-slate-300"
                  {...props}
                />
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>

        <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl">
          <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
            {t('disclaimer')}
          </p>
        </div>
      </div>
    </div>
  );
}
