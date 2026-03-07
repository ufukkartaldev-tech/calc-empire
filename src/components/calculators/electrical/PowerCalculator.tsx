'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { acPower } from '@/lib/formulas/electrical';

export function PowerCalculator() {
  const t = useTranslations('PowerCalculator');

  const [voltage, setVoltage] = useState<number>(230);
  const [current, setCurrent] = useState<number>(10);
  const [phiDeg, setPhiDeg] = useState<number>(30);

  const results = useMemo(() => {
    try {
      if (voltage < 0 || current < 0) return null;
      return acPower({ voltage, current, phiDeg });
    } catch (e) {
      return null;
    }
  }, [voltage, current, phiDeg]);

  // SVG Visualization Dimensions
  const svgW = 300;
  const svgH = 200;
  const pad = 40;

  const powerTriangle = useMemo(() => {
    if (!results) return null;

    // Scale triangle to fit SVG
    const maxVal = Math.max(Math.abs(results.activePower), Math.abs(results.reactivePower));
    const scale = (svgW - 2 * pad) / (maxVal || 1);

    const x0 = pad;
    const y0 = svgH - pad;

    // P (Active Power) is on X-axis
    const xP = x0 + Math.abs(results.activePower) * scale;
    const yP = y0;

    // Q (Reactive Power) is on Y-axis
    // Positive Q is lagging (inductive), negative Q is leading (capacitive)
    // In power triangle, lagging is often drawn upwards, leading downwards
    // SVG y-axis is inverted
    const yQ = y0 - results.reactivePower * scale;
    const xQ = xP;

    return { x0, y0, xP, yP, xQ, yQ };
  }, [results, svgW, svgH, pad]);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/40 rounded-xl flex items-center justify-center shadow-sm border border-yellow-200 dark:border-yellow-800">
          <span className="text-2xl">⚡</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('title')}</h2>
      </div>

      <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
        {t('description')}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <label className="text-xs font-semibold text-slate-500 block mb-2">{t('voltage')}</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={voltage}
                  onChange={e => setVoltage(Number(e.target.value))}
                  className="w-full bg-transparent font-mono font-bold text-xl text-slate-900 dark:text-white outline-none"
                />
                <span className="text-slate-400 font-bold">V</span>
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <label className="text-xs font-semibold text-slate-500 block mb-2">{t('current')}</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={current}
                  onChange={e => setCurrent(Number(e.target.value))}
                  className="w-full bg-transparent font-mono font-bold text-xl text-slate-900 dark:text-white outline-none"
                />
                <span className="text-slate-400 font-bold">A</span>
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 md:col-span-2">
              <label className="text-xs font-semibold text-slate-500 block mb-2">{t('phaseAngle')}</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="-90"
                  max="90"
                  value={phiDeg}
                  onChange={e => setPhiDeg(Number(e.target.value))}
                  className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                />
                <div className="flex items-center gap-2 min-w-[80px]">
                  <input
                    type="number"
                    value={phiDeg}
                    onChange={e => setPhiDeg(Number(e.target.value))}
                    className="w-full bg-transparent font-mono font-bold text-lg text-slate-900 dark:text-white outline-none text-right"
                  />
                  <span className="text-slate-400 font-bold">°</span>
                </div>
              </div>
            </div>
          </div>

          {/* Results List */}
          {results && (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">{t('results')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400 mb-1">{t('apparentPower')} (S)</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">{results.apparentPower.toFixed(1)} VA</span>
                </div>
                <div className="flex flex-col p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400 mb-1">{t('activePower')} (P)</span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{results.activePower.toFixed(1)} W</span>
                </div>
                <div className="flex flex-col p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400 mb-1">{t('reactivePower')} (Q)</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{results.reactivePower.toFixed(1)} VAR</span>
                </div>
                <div className="flex flex-col p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400 mb-1">{t('powerFactor')}</span>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{results.powerFactor.toFixed(3)}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded uppercase">
                      {results.reactivePower >= 0 ? t('lagging') : t('leading')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Legend & Visualizer */}
        <div className="flex flex-col gap-4">
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center relative min-h-[300px]">
            <h3 className="absolute top-4 left-6 text-xs font-semibold text-slate-500 uppercase tracking-widest">{t('visualizer')}</h3>

            {powerTriangle && results && (
              <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="overflow-visible">
                {/* Axes */}
                <line x1={0} y1={powerTriangle.y0} x2={svgW} y2={powerTriangle.y0} stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1" strokeDasharray="4 4" />
                <line x1={powerTriangle.x0} y1={0} x2={powerTriangle.x0} y2={svgH} stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1" strokeDasharray="4 4" />

                {/* Triangle background fill */}
                <path
                  d={`M ${powerTriangle.x0} ${powerTriangle.y0} L ${powerTriangle.xP} ${powerTriangle.yP} L ${powerTriangle.xQ} ${powerTriangle.yQ} Z`}
                  fill="currentColor"
                  className="text-yellow-500/10"
                />

                {/* Active Power (P) - Horizontal */}
                <line
                  x1={powerTriangle.x0} y1={powerTriangle.y0}
                  x2={powerTriangle.xP} y2={powerTriangle.yP}
                  stroke="#10b981" strokeWidth="3" strokeLinecap="round"
                />

                {/* Reactive Power (Q) - Vertical */}
                <line
                  x1={powerTriangle.xP} y1={powerTriangle.yP}
                  x2={powerTriangle.xQ} y2={powerTriangle.yQ}
                  stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"
                />

                {/* Apparent Power (S) - Hypotenuse */}
                <line
                  x1={powerTriangle.x0} y1={powerTriangle.y0}
                  x2={powerTriangle.xQ} y2={powerTriangle.yQ}
                  stroke="#f59e0b" strokeWidth="4" strokeLinecap="round"
                />

                {/* Angle arc */}
                <path
                  d={`M ${powerTriangle.x0 + 25} ${powerTriangle.y0} 
                     A 25 25 0 0 ${results.reactivePower > 0 ? 0 : 1} 
                     ${powerTriangle.x0 + 25 * Math.cos(phiDeg * Math.PI / 180)} 
                     ${powerTriangle.y0 - 25 * Math.sin(phiDeg * Math.PI / 180)}`}
                  fill="none" stroke="#64748b" strokeWidth="1.5"
                />
                <text x={powerTriangle.x0 + 30} y={results.reactivePower > 0 ? powerTriangle.y0 - 5 : powerTriangle.y0 + 15} fontSize="10" className="fill-slate-500 font-bold">φ</text>

                {/* Labels */}
                <text x={(powerTriangle.x0 + powerTriangle.xP) / 2} y={powerTriangle.y0 + 15} textAnchor="middle" fontSize="10" className="fill-emerald-600 dark:fill-emerald-400 font-bold">P</text>
                <text x={powerTriangle.xP + 10} y={(powerTriangle.yP + powerTriangle.yQ) / 2} textAnchor="start" fontSize="10" className="fill-blue-600 dark:fill-blue-400 font-bold">Q</text>
                <text
                  x={(powerTriangle.x0 + powerTriangle.xQ) / 2 - 10}
                  y={(powerTriangle.y0 + powerTriangle.yQ) / 2 - 10}
                  textAnchor="end" fontSize="10" className="fill-yellow-600 dark:fill-yellow-400 font-bold"
                >S</text>
              </svg>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">{t('activePower').split(' ')[0]}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">{t('reactivePower').split(' ')[0]}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">{t('apparentPower').split(' ')[0]}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
