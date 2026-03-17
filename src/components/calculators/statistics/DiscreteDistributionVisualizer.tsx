'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import * as Stats from '@/lib/formulas/statistics';

type DistType = 'binomial' | 'poisson';

export function DiscreteDistributionVisualizer() {
  const t = useTranslations('DiscreteDistribution');
  const [distType, setDistType] = useState<DistType>('binomial');
  
  // Binomial params
  const [n, setN] = useState(10);
  const [p, setP] = useState(0.5);
  
  // Poisson params
  const [lambda, setLambda] = useState(5);

  const data = useMemo(() => {
    const points: { k: number; prob: number }[] = [];
    if (distType === 'binomial') {
      for (let k = 0; k <= n; k++) {
        points.push({ k, prob: Stats.binomialPdf(k, n, p) });
      }
    } else {
      // Poisson is infinite, but we'll show up to lambda + 4*sqrt(lambda) or at least 15
      const limit = Math.max(15, Math.ceil(lambda + 4 * Math.sqrt(lambda)));
      for (let k = 0; k <= limit; k++) {
        points.push({ k, prob: Stats.poissonPdf(k, lambda) });
      }
    }
    return points;
  }, [distType, n, p, lambda]);

  const maxProb = Math.max(...data.map(d => d.prob), 0.1);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-2xl border border-purple-100 dark:border-purple-800 text-purple-600">
            📊
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('title')}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('subtitle')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
          {/* Controls */}
          <div className="space-y-6">
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                onClick={() => setDistType('binomial')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  distType === 'binomial' 
                    ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t('binomial')}
              </button>
              <button
                onClick={() => setDistType('poisson')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  distType === 'poisson' 
                    ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t('poisson')}
              </button>
            </div>

            <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
              {distType === 'binomial' ? (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-[10px] font-black text-slate-400 uppercase">Trials (n)</label>
                      <span className="text-xs font-mono font-bold text-purple-600">{n}</span>
                    </div>
                    <input
                      type="range" min="1" max="50" step="1"
                      value={n} onChange={e => setN(parseInt(e.target.value))}
                      className="w-full accent-purple-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-[10px] font-black text-slate-400 uppercase">Probability (p)</label>
                      <span className="text-xs font-mono font-bold text-purple-600">{p.toFixed(2)}</span>
                    </div>
                    <input
                      type="range" min="0" max="1" step="0.01"
                      value={p} onChange={e => setP(parseFloat(e.target.value))}
                      className="w-full accent-purple-600"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Lambda (λ)</label>
                    <span className="text-xs font-mono font-bold text-purple-600">{lambda}</span>
                  </div>
                  <input
                    type="range" min="0.1" max="30" step="0.1"
                    value={lambda} onChange={e => setLambda(parseFloat(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                </div>
              )}
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 rounded-2xl">
              <h4 className="text-[10px] font-black text-purple-400 uppercase mb-2">{t('stats')}</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{t('mean')}</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                    {(distType === 'binomial' ? n * p : lambda).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{t('variance')}</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                    {(distType === 'binomial' ? n * p * (1 - p) : lambda).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Visualizer */}
          <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
            <div className="relative h-[300px] flex items-end gap-1 px-4">
              {/* Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 pt-4">
                {[0, 0.25, 0.5, 0.75, 1].map(tick => (
                  <div key={tick} className="border-t border-slate-200 dark:border-slate-800 flex items-center">
                    <span className="text-[8px] text-slate-400 -mt-3 ml-1">{(tick * maxProb).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end pb-8">
                  <div 
                    className="w-full bg-purple-500/80 hover:bg-purple-600 transition-all rounded-t-sm relative cursor-help"
                    style={{ height: `${(d.prob / maxProb) * 100}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      P(X={d.k}) = {d.prob.toFixed(4)}
                    </div>
                  </div>
                  <span className="absolute bottom-2 text-[10px] font-mono text-slate-400">{d.k}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
