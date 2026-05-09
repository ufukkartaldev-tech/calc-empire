'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import * as Stats from '@/lib/formulas/statistics';

export function BasicStatisticsCalculator() {
  const t = useTranslations('BasicStatistics');
  const [input, setInput] = useState('');
  const [type, setType] = useState<'sample' | 'population'>('sample');

  const numbers = useMemo(() => {
    return input
      .split(/[\s,]+/)
      .map((v) => parseFloat(v))
      .filter((v) => !isNaN(v));
  }, [input]);

  const results = useMemo(() => {
    if (numbers.length === 0) return null;
    try {
      const mn = Stats.mean(numbers);
      const varVal = Stats.variance(numbers, type);
      const sd = Stats.standardDeviation(numbers, type);
      const med = Stats.median(numbers);
      const mod = Stats.mode(numbers);

      return {
        mean: mn,
        median: med,
        mode: mod.join(', '),
        variance: varVal,
        stdDev: sd,
        min: Math.min(...numbers),
        max: Math.max(...numbers),
        sum: numbers.reduce((a, b) => a + b, 0),
        count: numbers.length,
      };
    } catch {
      return null;
    }
  }, [numbers, type]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-2xl border border-amber-100 dark:border-amber-800 text-amber-600">
            📊
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('title')}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Professional data set analysis
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {t('inputLabel')}
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('inputPlaceholder')}
                className="w-full h-32 px-4 py-3 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-mono text-sm focus:outline-none focus:border-amber-500 transition-all resize-none"
              />
            </div>

            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
              <button
                onClick={() => setType('sample')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  type === 'sample'
                    ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t('sample')} (n-1)
              </button>
              <button
                onClick={() => setType('population')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  type === 'population'
                    ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t('population')} (N)
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {t('results')}
            </h3>

            {results ? (
              <div className="grid grid-cols-1 gap-3">
                {[
                  { key: 'mean', icon: 'μ' },
                  { key: 'median', icon: 'M' },
                  { key: 'mode', icon: 'Mo' },
                  { key: 'stdDev', icon: 'σ' },
                  { key: 'variance', icon: 's²' },
                  { key: 'sum', icon: 'Σ' },
                  { key: 'count', icon: 'n' },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-100 dark:border-slate-800">
                        {item.icon}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        {t(item.key)}
                      </span>
                    </div>
                    <span className="text-sm font-mono font-bold text-amber-600">
                      {typeof results[item.key as keyof typeof results] === 'number'
                        ? (results[item.key as keyof typeof results] as number).toLocaleString(
                            undefined,
                            { maximumFractionDigits: 4 }
                          )
                        : results[item.key as keyof typeof results]}
                    </span>
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl">
                    <p className="text-[9px] font-bold text-emerald-600 uppercase mb-1">
                      {t('min')}
                    </p>
                    <p className="text-lg font-mono font-black text-emerald-700 dark:text-emerald-400">
                      {results.min}
                    </p>
                  </div>
                  <div className="p-3 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-xl">
                    <p className="text-[9px] font-bold text-rose-600 uppercase mb-1">{t('max')}</p>
                    <p className="text-lg font-mono font-black text-rose-700 dark:text-rose-400">
                      {results.max}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
                <span className="text-2xl opacity-20">📊</span>
                <p className="text-xs text-slate-400 italic px-4">{t('inputPlaceholder')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
