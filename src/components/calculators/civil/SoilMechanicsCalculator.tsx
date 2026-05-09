'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';

export function SoilMechanicsCalculator() {
  const t = useTranslations('SoilMechanics');

  const [params, setParams] = useState({
    cohesion: '20',
    frictionAngle: '30',
    normalStress: '100',
  });

  const updateParam = (key: string, val: string) => {
    setParams((prev) => ({ ...prev, [key]: val }));
  };

  const results = useMemo(() => {
    const c = parseFloat(params.cohesion);
    const phi = parseFloat(params.frictionAngle);
    const sigma = parseFloat(params.normalStress);

    if (isNaN(c) || isNaN(phi) || isNaN(sigma)) return null;
    if (c < 0 || phi < 0 || phi >= 90 || sigma < 0) return null;

    const phiRad = (phi * Math.PI) / 180;
    const shearStrength = c + sigma * Math.tan(phiRad);

    return { c, phi, sigma, shearStrength };
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
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-emerald-500/20 text-white">
            🌱
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
              <InputField label={t('cohesion')} id="cohesion" unit="kPa" />
              <InputField label={t('frictionAngle')} id="frictionAngle" unit="°" />
              <InputField label={t('normalStress')} id="normalStress" unit="kPa" />
            </div>

            <div className="p-6 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-3xl">
              <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] mb-2">
                Scientific Basis
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                The Mohr-Coulomb failure criterion represents the linear envelope that is obtained
                from a plot of the shear strength of a material versus the applied normal stress.
                <code className="block mt-2 font-mono text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900">
                  τ = c + σ · tan(φ)
                </code>
              </p>
            </div>
          </div>

          {/* Right: Visualizer & Result */}
          <div className="space-y-8 flex flex-col">
            {/* Failure Envelope Visualizer */}
            <div className="flex-1 min-h-[300px] bg-slate-50 dark:bg-slate-950 rounded-[48px] border border-slate-100 dark:border-slate-800 relative overflow-hidden flex flex-col items-center justify-center p-8 shadow-inner">
              <svg viewBox="0 0 400 300" className="w-full max-w-[360px]">
                {/* Axes */}
                <line
                  x1="40"
                  y1="260"
                  x2="380"
                  y2="260"
                  stroke="currentColor"
                  className="text-slate-300 dark:text-slate-700"
                  strokeWidth="2"
                />
                <line
                  x1="40"
                  y1="20"
                  x2="40"
                  y2="260"
                  stroke="currentColor"
                  className="text-slate-300 dark:text-slate-700"
                  strokeWidth="2"
                />

                {/* Labels */}
                <text
                  x="380"
                  y="280"
                  textAnchor="end"
                  className="text-[10px] font-bold fill-slate-400 uppercase"
                >
                  σ (Normal)
                </text>
                <text
                  x="30"
                  y="20"
                  textAnchor="end"
                  transform="rotate(-90, 30, 20)"
                  className="text-[10px] font-bold fill-slate-400 uppercase"
                >
                  τ (Shear)
                </text>

                {results && (
                  <>
                    {/* Mohr-Coulomb Line */}
                    <path
                      d={`M 40 ${260 - results.c} L 360 ${260 - (results.c + 320 * Math.tan((results.phi * Math.PI) / 180))}`}
                      stroke="#10b981"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray="0"
                      className="transition-all duration-500"
                    />
                    {/* Shaded Stable Region */}
                    <path
                      d={`M 40 260 L 40 ${260 - results.c} L 360 ${260 - (results.c + 320 * Math.tan((results.phi * Math.PI) / 180))} L 360 260 Z`}
                      fill="rgba(16, 185, 129, 0.05)"
                      className="transition-all duration-500"
                    />

                    {/* Current Stress State Point */}
                    <circle
                      cx={40 + (results.sigma / (results.sigma + 50)) * 300}
                      cy={200} // Mocked Y for visualization of point
                      r="5"
                      fill={
                        200 >
                        260 -
                          (results.c +
                            (results.sigma / (results.sigma + 50)) *
                              300 *
                              Math.tan((results.phi * Math.PI) / 180))
                          ? '#ef4444'
                          : '#3b82f6'
                      }
                      className="transition-all duration-500"
                    />

                    {/* Cohesion Intercept Label */}
                    <text
                      x="35"
                      y={260 - results.c}
                      textAnchor="end"
                      className="text-[9px] font-bold fill-emerald-600"
                    >
                      c
                    </text>
                  </>
                )}
              </svg>

              <div className="absolute bottom-6 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  {t('failureEnv')}
                </p>
                <p className="text-[8px] font-mono text-slate-300 dark:text-slate-600">
                  Geometric stability analysis
                </p>
              </div>
            </div>

            {/* Result Card */}
            <div className="p-8 bg-emerald-600 rounded-[36px] shadow-2xl shadow-emerald-500/20 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl pointer-events-none font-black select-none">
                τ
              </div>

              {results ? (
                <div className="relative z-10 space-y-2">
                  <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80">
                    {t('result')}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-mono font-black tracking-tighter">
                      {results.shearStrength.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span className="text-xl font-bold opacity-60">{t('unitKpa')}</span>
                  </div>
                  <p className="text-[10px] font-bold opacity-50 tracking-wider">
                    {t('shearStrength')} @ σ = {results.sigma} kPa
                  </p>
                </div>
              ) : (
                <div className="relative z-10 flex flex-col items-center justify-center text-center h-24 space-y-3">
                  <div className="flex gap-2">
                    <span className="w-2 h-2 rounded-full bg-white animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-white animate-bounce delay-100"></span>
                    <span className="w-2 h-2 rounded-full bg-white animate-bounce delay-200"></span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
