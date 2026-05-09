'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';

export function ShearMomentVisualizer() {
  const t = useTranslations('ShearMoment');

  const [params, setParams] = useState({
    load: '1000',
    length: '10',
    position: '5',
  });

  const updateParam = (key: string, val: string) => {
    setParams((prev) => ({ ...prev, [key]: val }));
  };

  const results = useMemo(() => {
    const P = parseFloat(params.load);
    const L = parseFloat(params.length);
    const a = parseFloat(params.position);

    if (isNaN(P) || isNaN(L) || isNaN(a)) return null;
    if (L <= 0 || a < 0 || a > L) return null;

    const b = L - a;
    const R1 = (P * b) / L;
    const R2 = (P * a) / L;
    const maxMoment = (P * a * b) / L;

    return { R1, R2, maxMoment, a, b, L, P };
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
        value={params[id as keyof typeof params]}
        onChange={(e) => updateParam(id, e.target.value)}
        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-mono text-sm transition-all focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400"
      />
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[40px] shadow-sm overflow-hidden p-6 md:p-10">
        {/* Header */}
        <div className="flex items-center gap-5 mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-emerald-500/20 text-white">
            ✂️
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
          {/* Left: Inputs & Reactions */}
          <div className="space-y-8">
            <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-[32px] border border-slate-100 dark:border-slate-800 space-y-6 shadow-inner">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label={t('load')} id="load" unit="N" />
                <InputField label={t('length')} id="length" unit="m" />
                <div className="md:col-span-2">
                  <InputField label={t('position')} id="position" unit="m" />
                </div>
              </div>
            </div>

            {/* Reactions Display */}
            <div className="p-6 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-3xl space-y-4">
              <h3 className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                {t('reactions')}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {t('leftReaction')}
                  </p>
                  <p className="text-xl font-mono font-black text-slate-800 dark:text-white">
                    {results ? results.R1.toFixed(2) : '---'}{' '}
                    <span className="text-[10px] opacity-40">N</span>
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {t('rightReaction')}
                  </p>
                  <p className="text-xl font-mono font-black text-slate-800 dark:text-white">
                    {results ? results.R2.toFixed(2) : '---'}{' '}
                    <span className="text-[10px] opacity-40">N</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Diagrams */}
          <div className="space-y-8 flex flex-col">
            {results && (
              <>
                {/* SFD */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end px-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {t('shearDiagram')}
                    </p>
                    <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      {t('maxShear')}: {Math.max(results.R1, results.R2).toFixed(2)} N
                    </p>
                  </div>
                  <div className="aspect-[4/1] bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden p-4">
                    <svg viewBox="0 0 400 100" className="w-full h-full preserve-3d">
                      <line
                        x1="0"
                        y1="50"
                        x2="400"
                        y2="50"
                        stroke="currentColor"
                        className="text-slate-300 dark:text-slate-700"
                        strokeWidth="1"
                      />
                      {/* SFD Shape */}
                      <path
                        d={`M 0 50 L 0 ${50 - results.R1 / (results.P / 50)} L ${(results.a / results.L) * 400} ${50 - results.R1 / (results.P / 50)} L ${(results.a / results.L) * 400} ${50 + results.R2 / (results.P / 50)} L 400 ${50 + results.R2 / (results.P / 50)} L 400 50 Z`}
                        fill="rgba(16, 185, 129, 0.1)"
                        stroke="rgb(16, 185, 129)"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                </div>

                {/* BMD */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end px-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {t('momentDiagram')}
                    </p>
                    <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      {t('maxMoment')}: {results.maxMoment.toFixed(2)} Nm
                    </p>
                  </div>
                  <div className="aspect-[4/1] bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden p-4">
                    <svg viewBox="0 0 400 100" className="w-full h-full">
                      <line
                        x1="0"
                        y1="20"
                        x2="400"
                        y2="20"
                        stroke="currentColor"
                        className="text-slate-300 dark:text-slate-700"
                        strokeWidth="1"
                      />
                      {/* BMD Shape */}
                      <path
                        d={`M 0 20 L ${(results.a / results.L) * 400} ${20 + results.maxMoment / (results.maxMoment / 60)} L 400 20 Z`}
                        fill="rgba(59, 130, 246, 0.1)"
                        stroke="rgb(59, 130, 246)"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                </div>

                {/* Physical Beam Model */}
                <div className="pt-4 mt-auto">
                  <div className="bg-slate-900 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-4 opacity-5 text-4xl font-black">
                      BEAM
                    </div>
                    <div className="relative h-12 flex items-center">
                      <div className="w-full h-3 bg-slate-700 rounded-full relative">
                        {/* Load Arrow */}
                        <div
                          className="absolute -top-10 transition-all duration-500"
                          style={{ left: `${(results.a / results.L) * 100}%` }}
                        >
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold text-red-400 mb-1">P</span>
                            <svg width="20" height="30" viewBox="0 0 20 30">
                              <path
                                d="M 10 0 L 10 25 M 5 20 L 10 25 L 15 20"
                                stroke="#f87171"
                                strokeWidth="2"
                                fill="none"
                              />
                            </svg>
                          </div>
                        </div>
                        {/* Supports */}
                        <div className="absolute -bottom-4 left-0 -translate-x-1/2 w-4 h-4 border-l-8 border-r-8 border-b-[12px] border-transparent border-b-emerald-500"></div>
                        <div className="absolute -bottom-4 right-0 translate-x-1/2 w-4 h-4 border-l-8 border-r-8 border-b-[12px] border-transparent border-b-emerald-500"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
