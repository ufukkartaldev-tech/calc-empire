'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';

const R = 8.314; // Universal gas constant (J/(mol·K))

export function IdealGasCalculator() {
  const t = useTranslations('IdealGas');

  const [params, setParams] = useState<Record<string, string>>({
    P: '101325',
    V: '0.0224',
    n: '1',
    T: '' // Solve for T by default if blank
  });

  const [error, setError] = useState<string | null>(null);

  const updateParam = (key: string, val: string) => {
    setParams(prev => ({ ...prev, [key]: val }));
    setError(null);
  };

  const result = useMemo(() => {
    const numericParams: Record<string, number> = {};
    const keys = ['P', 'V', 'n', 'T'];
    let unknownKey: string | null = null;

    for (const k of keys) {
      const val = params[k];
      if (val === '') {
        if (unknownKey) return null; // Too many unknowns
        unknownKey = k;
      } else {
        const num = parseFloat(val);
        if (isNaN(num)) return null;
        if (num <= 0 && k !== 'T') return null; // P, V, n must be positive
        numericParams[k] = num;
      }
    }

    if (!unknownKey) return null;

    const { P, V, n, T } = numericParams;

    try {
      let solvedValue = 0;
      if (unknownKey === 'P') solvedValue = (n * R * T) / V;
      if (unknownKey === 'V') solvedValue = (n * R * T) / P;
      if (unknownKey === 'n') solvedValue = (P * V) / (R * T);
      if (unknownKey === 'T') solvedValue = (P * V) / (n * R);

      if (unknownKey === 'T' && solvedValue < 0) {
        setError(t('errorTemperature'));
        return null;
      }

      return { key: unknownKey, value: solvedValue };
    } catch (e) {
      return null;
    }
  }, [params, t]);

  const InputField = ({ label, id, unit }: { label: string, id: string, unit: string }) => (
    <div className="space-y-1">
      <div className="flex justify-between items-center px-1">
        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</label>
        <span className="text-[9px] text-slate-300 dark:text-slate-600 font-bold">{unit}</span>
      </div>
      <div className="relative group">
        <input
          type="number"
          step="any"
          value={params[id]}
          placeholder={t('solveFor')}
          onChange={e => updateParam(id, e.target.value)}
          className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border-2 rounded-2xl font-mono text-sm transition-all focus:outline-none ${params[id] === ''
            ? 'border-dashed border-blue-200 dark:border-blue-900/50 bg-blue-50/10'
            : 'border-slate-100 dark:border-slate-800 focus:border-blue-500 dark:focus:border-blue-400'
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
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-700">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[40px] shadow-sm overflow-hidden p-6 md:p-10">
        {/* Header */}
        <div className="flex items-center gap-5 mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-indigo-500/20 text-white">
            💨
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('title')}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic">{t('subtitle')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Inputs */}
          <div className="space-y-8">
            <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-[32px] border border-slate-100 dark:border-slate-800 space-y-6 shadow-inner">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label={t('pressure')} id="P" unit="Pa" />
                <InputField label={t('volume')} id="V" unit="m³" />
                <InputField label={t('amount')} id="n" unit="mol" />
                <InputField label={t('temperature')} id="T" unit="K" />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-2xl text-red-600 dark:text-red-400 text-xs font-bold flex gap-2 items-center animate-in shake">
                <span>⚠️</span> {error}
              </div>
            )}

            <div className="p-6 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-3xl">
              <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] mb-2">Scientific Basis</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                The ideal gas law is the equation of state of a hypothetical ideal gas. It is a good approximation of the behavior of many gases under many conditions.
                <code className="block mt-2 font-mono text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 p-2 rounded-lg border border-indigo-100 dark:border-indigo-900">PV = nRT</code>
              </p>
            </div>
          </div>

          {/* Right: Visualizer & Results */}
          <div className="space-y-8 flex flex-col">
            {/* Particle Visualizer */}
            <div className="flex-1 min-h-[300px] bg-slate-50 dark:bg-slate-950 rounded-[48px] border-4 border-slate-100 dark:border-slate-800 relative overflow-hidden flex items-center justify-center p-8 shadow-inner group">
              <div
                className="w-full h-full max-w-[280px] max-h-[280px] border-4 border-slate-200 dark:border-slate-800 rounded-3xl relative transition-all duration-500 overflow-hidden bg-white dark:bg-slate-900 shadow-2xl"
                style={{
                  transform: `scale(${Math.min(1.2, 0.5 + (parseFloat(params.V) || 0.02) * 20)})`,
                  opacity: params.P ? Math.min(1, 0.3 + (parseFloat(params.P) || 100000) / 200000) : 0.5
                }}
              >
                {/* Particles Animation */}
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                    style={{
                      left: `${Math.random() * 90}%`,
                      top: `${Math.random() * 90}%`,
                      animation: `float ${2 / (Math.sqrt(parseFloat(params.T) || 300) / 10)}s infinite alternate ease-in-out ${Math.random() * 2}s`
                    }}
                  />
                ))}

                {/* Internal Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-5 dark:opacity-10 select-none">
                  <span className="text-8xl font-black">GAS</span>
                </div>
              </div>

              <div className="absolute bottom-6 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kinetic Molecular Theory</p>
                <p className="text-[8px] font-mono text-slate-300 dark:text-slate-600">Dynamic particle visualization</p>
              </div>

              <style jsx>{`
                @keyframes float {
                  from { transform: translate(0, 0); }
                  to { transform: translate(${Math.random() * 50 - 25}px, ${Math.random() * 50 - 25}px); }
                }
              `}</style>
            </div>

            {/* Result Card */}
            <div className="p-8 bg-indigo-600 dark:bg-indigo-500 rounded-[36px] shadow-2xl shadow-indigo-500/20 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl pointer-events-none font-black select-none">
                {result?.key || '?'}
              </div>

              {result ? (
                <div className="relative z-10 space-y-2">
                  <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80">{t('result')}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-mono font-black tracking-tighter">
                      {result.value.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                    </span>
                    <span className="text-xl font-bold opacity-60">
                      {t('unit' + (result.key === 'V' ? 'M3' : result.key))}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold opacity-50 tracking-wider">
                    {t(result.key === 'P' ? 'pressure' : result.key === 'V' ? 'volume' : result.key === 'n' ? 'amount' : 'temperature')}
                  </p>
                </div>
              ) : (
                <div className="relative z-10 flex flex-col items-center justify-center text-center h-24 space-y-3">
                  <div className="flex gap-2">
                    <span className="w-2 h-2 rounded-full bg-white animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-white animate-bounce delay-100"></span>
                    <span className="w-2 h-2 rounded-full bg-white animate-bounce delay-200"></span>
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest opacity-80">{t('solveFor')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
