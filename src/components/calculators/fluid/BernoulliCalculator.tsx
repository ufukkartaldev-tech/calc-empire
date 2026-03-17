'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { GRAVITY } from '@/constants/physics';
import { calculateBernoulli, type BernoulliParams } from '@/lib/formulas/fluid';

export function BernoulliCalculator() {
  const t = useTranslations('Bernoulli');

  const [params, setParams] = useState<Record<string, string>>({
    rho: '1000',
    g: GRAVITY.toString(),
    p1: '101325',
    v1: '2',
    h1: '10',
    p2: '',
    v2: '3',
    h2: '5',
  });

  const [error, setError] = useState<string | null>(null);

  const updateParam = (key: string, val: string) => {
    setParams((prev) => ({ ...prev, [key]: val }));
    setError(null);
  };

  const result = useMemo(() => {
    const rho = parseFloat(params.rho);
    const g = parseFloat(params.g);

    if (isNaN(rho) || rho <= 0) return null;

    const numericParams: BernoulliParams = { rho, g };
    const keys = ['p1', 'v1', 'h1', 'p2', 'v2', 'h2'] as const;

    let unknownKey: (typeof keys)[number] | null = null;

    for (const k of keys) {
      const val = params[k];
      if (val === '') {
        if (unknownKey) return null; // Too many unknowns
        unknownKey = k;
      } else {
        const num = parseFloat(val);
        if (isNaN(num)) return null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (numericParams as any)[k] = num;
      }
    }

    if (!unknownKey) return null;

    try {
      const solved = calculateBernoulli(numericParams);
      return { key: unknownKey, value: solved };
    } catch (e) {
      setError(
        e instanceof Error &&
          e.message === 'Equation results in imaginary velocity (square root of negative)'
          ? t('errorImaginary')
          : e instanceof Error
            ? e.message
            : String(e)
      );
      return null;
    }
  }, [params, t]);

  const InputField = ({ label, id, unit }: { label: string, id: string, unit: string }) => (
    <div className="space-y-1">
      <div className="flex justify-between items-center px-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
        <span className="text-[9px] text-slate-300 font-bold">{unit}</span>
      </div>
      <div className="relative group">
        <input
          type="number"
          value={params[id]}
          placeholder={t('solveFor')}
          onChange={e => updateParam(id, e.target.value)}
          className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border-2 rounded-2xl font-mono text-sm transition-all focus:outline-none ${
            params[id] === '' 
              ? 'border-dashed border-blue-200 dark:border-blue-900/50 bg-blue-50/10' 
              : 'border-slate-100 dark:border-slate-800 focus:border-blue-500'
          }`}
        />
        {params[id] === '' && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1 pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse delay-75"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse delay-150"></span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 bg-blue-50 dark:bg-blue-950/50 rounded-2xl flex items-center justify-center text-3xl border border-blue-100 dark:border-blue-800 text-blue-600 shadow-inner">
            🌊
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('title')}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic">{t('subtitle')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Side: Inputs */}
          <div className="space-y-8">
            {/* Fluid Global Params */}
            <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4 shadow-inner">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{t('fluidParams')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <InputField label={t('density')} id="rho" unit="kg/m³" />
                <InputField label={t('gravity')} id="g" unit="m/s²" />
              </div>
            </div>

            {/* Points Control */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 pt-10 relative">
                 <span className="absolute top-0 left-0 text-[10px] font-black bg-blue-600 text-white px-3 py-1 rounded-full uppercase z-10">{t('point1')}</span>
                 <InputField label={t('pressure')} id="p1" unit="Pa" />
                 <InputField label={t('velocity')} id="v1" unit="m/s" />
                 <InputField label={t('height')} id="h1" unit="m" />
              </div>
              <div className="space-y-4 pt-10 relative">
                 <span className="absolute top-0 left-0 text-[10px] font-black bg-emerald-600 text-white px-3 py-1 rounded-full uppercase z-10">{t('point2')}</span>
                 <InputField label={t('pressure')} id="p2" unit="Pa" />
                 <InputField label={t('velocity')} id="v2" unit="m/s" />
                 <InputField label={t('height')} id="h2" unit="m" />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-2xl text-red-600 dark:text-red-400 text-xs font-bold animate-in shake flex gap-2 items-center">
                <span>⚠️</span> {error}
              </div>
            )}
          </div>

          {/* Right Side: Visualizer & Result */}
          <div className="space-y-8 flex flex-col">
            <div className="flex-1 min-h-[300px] bg-slate-50 dark:bg-slate-950 rounded-[40px] border-4 border-slate-100 dark:border-slate-800 relative overflow-hidden flex flex-col justify-center items-center group p-8 shadow-inner">
               {/* Pipe Visualization */}
               <svg viewBox="0 0 400 300" className="w-full max-w-[400px]">
                 <defs>
                   <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                     <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                     <stop offset="50%" stopColor="#2563eb" stopOpacity="0.6" />
                     <stop offset="100%" stopColor="#1e40af" stopOpacity="0.4" />
                   </linearGradient>
                   <filter id="glow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                 </defs>

                 {/* Height Reference Lines */}
                 <line x1="50" y1="280" x2="350" y2="280" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
                 
                 {/* The Pipe Path */}
                 <path 
                    d="M 50 150 Q 200 150 350 150" 
                    fill="none" stroke="url(#waterGrad)" strokeWidth="40" strokeLinecap="round" 
                    className="opacity-50 transition-all duration-700"
                    style={{ 
                      transform: `translateY(${(parseFloat(params.h1) || 0) * -2}px)`,
                      d: `M 50 200 L 200 200 L 350 200`
                    }}
                  />

                  {/* Flow Animation Dots */}
                  {[...Array(6)].map((_, i) => (
                    <circle key={i} r="2" fill="#3b82f6">
                      <animateMotion 
                        dur={`${3 / (parseFloat(params.v1) || 1)}s`} 
                        repeatCount="indefinite" 
                        path="M 60 180 L 340 180" 
                        begin={`${i * 0.5}s`}
                      />
                    </circle>
                  ))}

                  {/* Point Labels */}
                  <g className="transition-transform duration-500" style={{ transform: `translate(60px, 180px)` }}>
                    <circle r="6" fill="#3b82f6" filter="url(#glow)" />
                    <text y="-15" textAnchor="middle" className="text-[12px] font-black fill-blue-600">P1</text>
                  </g>
                  <g className="transition-transform duration-500" style={{ transform: `translate(340px, 180px)` }}>
                    <circle r="6" fill="#10b981" filter="url(#glow)" />
                    <text y="-15" textAnchor="middle" className="text-[12px] font-black fill-emerald-600">P2</text>
                  </g>

                  {/* Height lines */}
                  <line x1="60" y1="180" x2="60" y2="280" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="340" y1="180" x2="340" y2="280" stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" />
               </svg>

               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Bernoulli Principle</p>
                 <p className="text-[8px] font-mono text-slate-400 opacity-50">P + ½ρv² + ρgh = constant</p>
               </div>
            </div>

            {/* Result Display */}
            <div className="p-8 bg-blue-600 rounded-[32px] shadow-2xl shadow-blue-500/20 text-white transition-all overflow-hidden relative group">
               <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl pointer-events-none select-none">
                 {result?.key.startsWith('p') ? 'P' : result?.key.startsWith('v') ? 'V' : 'H'}
               </div>
               
               {result ? (
                 <div className="relative z-10 space-y-2">
                   <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80">{t('result')}</p>
                   <div className="flex items-baseline gap-2">
                     <span className="text-5xl font-mono font-black tracking-tighter">
                       {result.value.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                     </span>
                     <span className="text-xl font-bold opacity-60">
                        {result.key.startsWith('p') ? 'Pa' : result.key.startsWith('v') ? 'm/s' : 'm'}
                     </span>
                   </div>
                   <p className="text-[10px] font-bold opacity-50 tracking-wider">
                     {t('point' + (result.key.endsWith('1') ? '1' : '2'))} {t(result.key.slice(0, -1) === 'p' ? 'pressure' : result.key.slice(0, -1) === 'v' ? 'velocity' : 'height')}
                   </p>
                 </div>
               ) : (
                 <div className="relative z-10 flex flex-col items-center justify-center text-center h-24 space-y-3">
                    <div className="flex gap-2">
                      <span className="w-2 h-2 rounded-full bg-white animate-bounce"></span>
                      <span className="w-2 h-2 rounded-full bg-white animate-bounce delay-100"></span>
                      <span className="w-2 h-2 rounded-full bg-white animate-bounce delay-200"></span>
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest opacity-80">{t('unknownField')}</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
