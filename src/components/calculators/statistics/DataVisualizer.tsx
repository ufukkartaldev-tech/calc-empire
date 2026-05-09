'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import * as Stats from '@/lib/formulas/statistics';

export function DataVisualizer() {
  const t = useTranslations('DataVisualizer');
  const [input, setInput] = useState(
    '12, 15, 14, 16, 18, 20, 22, 21, 25, 24, 28, 30, 32, 35, 38, 40, 42, 45, 48, 50'
  );
  const [binCount, setBinCount] = useState(10);

  const numbers = useMemo(() => {
    return input
      .split(/[\s,]+/)
      .map((v) => parseFloat(v))
      .filter((v) => !isNaN(v));
  }, [input]);

  const histogramData = useMemo(() => {
    return Stats.generateHistogram(numbers, binCount);
  }, [numbers, binCount]);

  const maxCount = Math.max(...histogramData.map((d) => d.count), 1);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-2xl border border-emerald-100 dark:border-emerald-800 text-emerald-600">
            📊
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('title')}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('subtitle')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
          {/* Controls */}
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {t('inputLabel')}
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Örn: 10, 20, 20, 30..."
                className="w-full h-48 px-4 py-3 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-mono text-sm focus:outline-none focus:border-emerald-500 transition-all resize-none shadow-inner"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {t('bins')}
                </label>
                <span className="text-emerald-600 font-mono font-bold">{binCount}</span>
              </div>
              <input
                type="range"
                min="3"
                max="30"
                value={binCount}
                onChange={(e) => setBinCount(parseInt(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl space-y-3">
              <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">
                {t('summary')}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-2 bg-white dark:bg-slate-900 rounded-lg border border-emerald-100 dark:border-emerald-800/50">
                  <p className="text-[9px] text-slate-400 font-bold uppercase">{t('count')}</p>
                  <p className="text-sm font-black text-slate-700 dark:text-slate-200">
                    {numbers.length}
                  </p>
                </div>
                <div className="text-center p-2 bg-white dark:bg-slate-900 rounded-lg border border-emerald-100 dark:border-emerald-800/50">
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Mean</p>
                  <p className="text-sm font-black text-slate-700 dark:text-slate-200">
                    {numbers.length > 0 ? Stats.mean(numbers).toFixed(1) : '0'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Area */}
          <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                {t('histogram')}
              </h3>
            </div>

            {numbers.length > 0 ? (
              <div className="flex-1 min-h-[400px] flex items-end gap-1 px-4 relative">
                {/* Horizontal Guide Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-12 pt-4 pr-4">
                  {[0, 0.25, 0.5, 0.75, 1].map((lvl) => (
                    <div
                      key={lvl}
                      className="w-full border-t border-slate-200 dark:border-slate-800 flex items-center"
                    >
                      <span className="text-[8px] text-slate-400 -mt-2 ml-1">
                        {Math.round(lvl * maxCount)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Bars */}
                <div className="flex-1 flex items-end gap-1 h-full pb-10">
                  {histogramData.map((d, i) => (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center group relative h-full justify-end"
                    >
                      <div
                        className="w-full bg-emerald-500/80 hover:bg-emerald-600 transition-all rounded-t-lg relative group-hover:shadow-lg group-hover:shadow-emerald-500/20"
                        style={{ height: `${(d.count / maxCount) * 100}%` }}
                      >
                        {/* Tooltip */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 font-bold whitespace-nowrap">
                          {d.binLabel}: {d.count} items
                        </div>
                      </div>
                      {/* Label - rotated if too many bins */}
                      <span
                        className={`absolute bottom-2 text-[9px] font-mono font-bold text-slate-400 ${histogramData.length > 12 ? '-rotate-45 -translate-x-1 translate-y-2' : ''}`}
                      >
                        {d.binLabel}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-300 space-y-4">
                <span className="text-6xl opacity-10">📉</span>
                <p className="text-sm italic">{t('noData')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
