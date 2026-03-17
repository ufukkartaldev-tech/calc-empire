'use client';

import React, { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ReferenceCard } from '../../ui/ReferenceCard';

export function JsonFormatter() {
  const t = useTranslations('JsonFormatter');
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFormat = useCallback((minify: boolean = false) => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      const output = minify ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2);
      setInput(output);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('invalid'));
    }
  }, [input, t]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [input]);

  const handleClear = useCallback(() => {
    setInput('');
    setError(null);
  }, []);

  const stats = React.useMemo(() => {
    if (!input) return null;
    const size = new Blob([input]).size;
    const lines = input.split('\n').length;
    return { size, lines };
  }, [input]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[40px] shadow-sm overflow-hidden p-6 md:p-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-amber-500/20 text-white">
              ｛
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('title')}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic">{t('subtitle')}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleFormat(false)}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20"
            >
              {t('format')}
            </button>
            <button
              onClick={() => handleFormat(true)}
              className="px-6 py-2.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 active:scale-95 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
            >
              {t('minify')}
            </button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('placeholder')}
            className={`w-full h-[450px] p-8 bg-slate-50 dark:bg-slate-950 border-2 rounded-[32px] font-mono text-sm transition-all focus:outline-none resize-none ${
              error ? 'border-red-500/50 focus:border-red-500' : 'border-slate-100 dark:border-slate-800 focus:border-amber-500'
            } text-slate-800 dark:text-slate-200`}
            spellCheck={false}
          />
          
          {/* Action Bar Overlay */}
          <div className="absolute top-6 right-6 flex gap-2">
            <button
               onClick={handleCopy}
               disabled={!input}
               className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 group relative"
            >
              <span className="text-lg">{copied ? '✅' : '📋'}</span>
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {copied ? t('copied') : t('copy')}
              </span>
            </button>
            <button
               onClick={handleClear}
               disabled={!input}
               className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50 group relative"
            >
              <span className="text-lg">🧹</span>
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {t('clear')}
              </span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3 animate-in slide-in-from-bottom-2">
              <span className="text-xl">⚠️</span>
              <p className="text-xs font-bold text-red-600 dark:text-red-400 font-mono leading-tight">{error}</p>
            </div>
          )}

          {/* Validation Status */}
          {input && !error && (
             <div className="absolute bottom-6 right-8 px-4 py-1.5 bg-emerald-500/20 rounded-full flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{t('valid')}</span>
             </div>
          )}
        </div>

        {/* Footer Info */}
        {stats && (
          <div className="mt-8 flex flex-wrap gap-8">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('size')}</span>
              <span className="font-mono text-xl font-black text-slate-800 dark:text-slate-200">
                {(stats.size / 1024).toFixed(2)} <span className="text-xs font-bold opacity-40 uppercase">KB</span>
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('lines')}</span>
              <span className="font-mono text-xl font-black text-slate-800 dark:text-slate-200">
                {stats.lines}
              </span>
            </div>
            <div className="flex flex-col ml-auto">
               <div className="p-4 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl">
                  <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 leading-none">
                    Security Tip: JSON processing happens entirely on your browser. Your data never leaves your computer.
                  </p>
               </div>
            </div>
          </div>
        )}
      </div>
      <ReferenceCard referenceKey="ToolReference.jsonFormatter" />
    </div>
  );
}
