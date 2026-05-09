'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';

export function StressStrainCalculator() {
  const t = useTranslations('StressStrain');

  const [params, setParams] = useState<Record<string, string>>({
    force: '5000',
    area: '0.001',
    deltaL: '0.002',
    L0: '2',
    E: '210000000000', // Young's Modulus for Steel (Pa)
  });

  const updateParam = (key: string, val: string) => {
    setParams((prev) => ({ ...prev, [key]: val }));
  };

  const results = useMemo(() => {
    const F = parseFloat(params.force);
    const A = parseFloat(params.area);
    const dL = parseFloat(params.deltaL);
    const L0 = parseFloat(params.L0);
    const E = parseFloat(params.E);

    if (isNaN(F) || isNaN(A) || isNaN(dL) || isNaN(L0) || isNaN(E)) return null;
    if (A <= 0 || L0 <= 0) return null;

    const stress = F / A;
    const strain = dL / L0;
    const hookeStress = E * strain;

    return { stress, strain, hookeStress };
  }, [params]);

  const InputField = ({ label, id, unit }: { label: string; id: string; unit: string }) => (
    <div className="space-y-1">
      <div className="flex justify-between items-center px-1">
        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          {label}
        </label>
        <span className="text-[9px] text-slate-300 dark:text-slate-600 font-bold">{unit}</span>
      </div>
      <input
        type="number"
        step="any"
        value={params[id]}
        onChange={(e) => updateParam(id, e.target.value)}
        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-mono text-sm transition-all focus:outline-none focus:border-red-500 dark:focus:border-red-400"
      />
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-700">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[40px] shadow-sm overflow-hidden p-6 md:p-10">
        {/* Header */}
        <div className="flex items-center gap-5 mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-red-500/20 text-white">
            💥
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {t('title')}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic">
              {t('subtitle')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Inputs */}
          <div className="space-y-8">
            <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-[32px] border border-slate-100 dark:border-slate-800 space-y-6 shadow-inner">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label={t('force')} id="force" unit="N" />
                <InputField label={t('area')} id="area" unit="m²" />
                <InputField label={t('deltaL')} id="deltaL" unit="m" />
                <InputField label={t('L0')} id="L0" unit="m" />
                <div className="md:col-span-2">
                  <InputField label={t('youngModulus')} id="E" unit="Pa" />
                </div>
              </div>
            </div>

            <div className="p-6 bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-3xl">
              <p className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-[0.2em] mb-2">
                Mechanical Theory
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Stress is measure of internal forces, while strain is measure of deformation.
                Hooke&apos;s Law connects them via Young&apos;s Modulus:
                <code className="block mt-2 font-mono text-red-600 dark:text-red-400 bg-white dark:bg-slate-900 p-2 rounded-lg border border-red-100 dark:border-red-900">
                  σ = E · ε
                </code>
              </p>
            </div>
          </div>

          {/* Right: Visualizer & Results */}
          <div className="space-y-8 flex flex-col">
            {/* Visualizer: Tensile Test */}
            <div className="flex-1 min-h-[300px] bg-slate-50 dark:bg-slate-950 rounded-[48px] border-4 border-slate-100 dark:border-slate-800 relative overflow-hidden flex flex-col items-center justify-center p-8 shadow-inner">
              <svg viewBox="0 0 200 200" className="w-full max-w-[200px]">
                <defs>
                  <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#94a3b8" />
                    <stop offset="50%" stopColor="#f1f5f9" />
                    <stop offset="100%" stopColor="#94a3b8" />
                  </linearGradient>
                </defs>

                {/* Grips */}
                <rect x="60" y="20" width="80" height="20" rx="2" fill="#475569" />
                <rect x="60" y="160" width="80" height="20" rx="2" fill="#475569" />

                {/* Material Specimen */}
                <rect
                  x={100 - 15 / (1 + (results?.strain || 0) * 0.5)}
                  y="40"
                  width={30 / (1 + (results?.strain || 0) * 0.5)}
                  height={120 * (1 + (results?.strain || 0))}
                  fill="url(#metalGrad)"
                  className="transition-all duration-500"
                  style={{ transformOrigin: 'center top' }}
                />

                {/* Force Arrows */}
                <path
                  d="M 100 15 L 100 5 M 95 10 L 100 5 L 105 10"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M 100 185 L 100 195 M 95 190 L 100 195 L 105 190"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>

              <div className="absolute bottom-6 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Tensile Simulation
                </p>
                <p className="text-[8px] font-mono text-slate-300 dark:text-slate-600">
                  Necked geometry visualized
                </p>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-slate-900 dark:bg-slate-800 rounded-[32px] shadow-xl text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 text-6xl font-black select-none">
                  σ
                </div>
                <div className="relative z-10 space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                    {t('stress')}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-mono font-black tracking-tighter">
                      {results ? results.stress.toExponential(4) : '---'}
                    </span>
                    <span className="text-xs font-bold opacity-40">{t('unitPa')}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-red-600 dark:bg-red-500 rounded-[32px] shadow-xl shadow-red-500/20 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 text-6xl font-black select-none">
                  ε
                </div>
                <div className="relative z-10 space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                    {t('strain')}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-mono font-black tracking-tighter">
                      {results
                        ? results.strain.toLocaleString(undefined, { maximumFractionDigits: 6 })
                        : '---'}
                    </span>
                    <span className="text-xs font-bold opacity-40">-</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
