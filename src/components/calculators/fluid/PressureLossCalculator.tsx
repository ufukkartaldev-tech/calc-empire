'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { darcyWeisbach } from '@/lib/formulas/fluid';

export function PressureLossCalculator() {
  const t = useTranslations('PressureLoss');

  const [params, setParams] = useState<Record<string, string>>({
    f: '0.02',
    L: '100',
    D: '0.1',
    rho: '1000',
    v: '2',
  });

  const updateParam = (key: string, val: string) => {
    setParams((prev) => ({ ...prev, [key]: val }));
  };

  const results = useMemo(() => {
    const f = parseFloat(params.f);
    const L = parseFloat(params.L);
    const D = parseFloat(params.D);
    const rho = parseFloat(params.rho);
    const v = parseFloat(params.v);

    if (isNaN(f) || isNaN(L) || isNaN(D) || isNaN(rho) || isNaN(v)) return null;
    if (D <= 0 || f < 0 || L < 0 || rho <= 0 || v < 0) return null;

    try {
      return darcyWeisbach({ f, L, D, rho, v });
    } catch (e) {
      return null;
    }
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
        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-mono text-sm transition-all focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
      />
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-blue-500/20 text-white">
            🧪
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {t('title')}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic">
              {t('subtitle')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Side: Inputs */}
          <div className="space-y-6">
            <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-[32px] border border-slate-100 dark:border-slate-800 space-y-6 shadow-inner">
              <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                {t('params')}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label={t('frictionFactor')} id="f" unit="-" />
                <InputField label={t('fluidDensity')} id="rho" unit="kg/m³" />
                <InputField label={t('pipeLength')} id="L" unit="m" />
                <InputField label={t('pipeDiameter')} id="D" unit="m" />
                <div className="md:col-span-2">
                  <InputField label={t('velocity')} id="v" unit="m/s" />
                </div>
              </div>
            </div>

            {/* Hint Box */}
            <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-800/30 rounded-2xl">
              <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-1">
                💡 Formula
              </p>
              <p className="text-xs font-mono text-blue-800/70 dark:text-blue-300/50">
                ΔP = f · (L/D) · (ρv²/2)
              </p>
            </div>
          </div>

          {/* Right Side: Visualizer & Results */}
          <div className="space-y-8 flex flex-col">
            {/* Visualizer */}
            <div className="flex-1 min-h-[280px] bg-slate-50 dark:bg-slate-950 rounded-[40px] border border-slate-100 dark:border-slate-800 relative overflow-hidden flex flex-col justify-center items-center p-8 shadow-inner">
              <svg viewBox="0 0 400 200" className="w-full max-w-[360px]">
                <defs>
                  <linearGradient id="pipeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#94a3b8" />
                    <stop offset="50%" stopColor="#cbd5e1" />
                    <stop offset="100%" stopColor="#94a3b8" />
                  </linearGradient>
                  <linearGradient id="fluidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                    <stop offset="50%" stopColor="#2563eb" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#1e40af" stopOpacity="0.4" />
                  </linearGradient>
                </defs>

                {/* Pipe Body */}
                <rect
                  x="50"
                  y="80"
                  width="300"
                  height="40"
                  rx="4"
                  fill="url(#pipeGrad)"
                  className="opacity-30 dark:opacity-20"
                />
                <rect x="50" y="85" width="300" height="30" fill="url(#fluidGrad)" />

                {/* Pressure Gauges */}
                <g transform="translate(80, 80)">
                  <circle
                    r="15"
                    fill="white"
                    className="dark:fill-slate-800 shadow-sm"
                    stroke="#3b82f6"
                    strokeWidth="2"
                  />
                  <path d="M 0 0 L 0 -10" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round">
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0"
                      to="45"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </path>
                  <text
                    y="25"
                    textAnchor="middle"
                    className="text-[8px] font-bold fill-slate-400 uppercase"
                  >
                    P In
                  </text>
                </g>

                <g transform="translate(320, 80)">
                  <circle
                    r="15"
                    fill="white"
                    className="dark:fill-slate-800 shadow-sm"
                    stroke="#ef4444"
                    strokeWidth="2"
                  />
                  <path d="M 0 0 L 0 -10" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0"
                      to="-20"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </path>
                  <text
                    y="25"
                    textAnchor="middle"
                    className="text-[8px] font-bold fill-slate-400 uppercase"
                  >
                    P Out
                  </text>
                </g>

                {/* Symbols */}
                <text
                  x="200"
                  y="105"
                  textAnchor="middle"
                  fill="white"
                  className="text-[10px] font-mono opacity-50"
                >
                  L = {params.L}m
                </text>

                {/* Flow lines */}
                {[...Array(5)].map((_, i) => (
                  <line
                    key={i}
                    x1="70"
                    y1={90 + i * 5}
                    x2="330"
                    y2={90 + i * 5}
                    stroke="white"
                    strokeWidth="0.5"
                    strokeDasharray="4 4"
                    className="opacity-30"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="20"
                      to="0"
                      dur={`${2 / (parseFloat(params.v) || 1)}s`}
                      repeatCount="indefinite"
                    />
                  </line>
                ))}
              </svg>

              <div className="absolute bottom-6 text-center">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                  Darcy-Weisbach Model
                </p>
                <p className="text-[8px] font-mono text-slate-300 dark:text-slate-600 mt-1">
                  Flow visualization active
                </p>
              </div>
            </div>

            {/* Results Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-blue-600 dark:bg-blue-500 rounded-[32px] shadow-xl shadow-blue-500/20 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 text-6xl pointer-events-none font-black">
                  ΔP
                </div>
                <div className="relative z-10 space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70">
                    {t('pressureDrop')}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-mono font-black tracking-tighter">
                      {results
                        ? results.pressureDropPa.toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })
                        : '---'}
                    </span>
                    <span className="text-sm font-bold opacity-60">{t('unitPa')}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-900 dark:bg-slate-800 rounded-[32px] shadow-xl shadow-slate-900/20 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 text-6xl pointer-events-none font-black">
                  HL
                </div>
                <div className="relative z-10 space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70">
                    {t('headLoss')}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-mono font-black tracking-tighter">
                      {results
                        ? results.headLossM.toLocaleString(undefined, { maximumFractionDigits: 4 })
                        : '---'}
                    </span>
                    <span className="text-sm font-bold opacity-60">{t('unitM')}</span>
                  </div>
                </div>
              </div>
            </div>

            {!results && (
              <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30 rounded-2xl text-red-600 dark:text-red-400 text-[10px] font-bold uppercase text-center tracking-wider">
                ⚠️ Lütfen geçerli sistem parametreleri girin
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
