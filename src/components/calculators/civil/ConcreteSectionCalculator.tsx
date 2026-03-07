'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { concreteSectionCapacity } from '@/lib/formulas/civil';

export function ConcreteSectionCalculator() {
  const t = useTranslations('ConcreteSection');

  // Input states
  const [bw, setBw] = useState<number>(300);
  const [d, setD] = useState<number>(500);
  const [fck, setFck] = useState<number>(25); // C25
  const [fyk, setFyk] = useState<number>(420); // B420C
  const [As, setAs] = useState<number>(1500); // 1500 mm^2

  // Calculations
  const calcCapacity = () => {
    try {
      if (!bw || !d || !fck || !fyk || !As) return null;
      return concreteSectionCapacity({ bw, d, fck, fyk, As });
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const results = calcCapacity();

  // SVG Drawing variables
  const svgH = 260;
  const svgW = 340;
  // Map drawing scale
  const totalH = d + 50;
  const scale = (val: number) => (val / totalH) * (svgH - 40);

  const drawD = scale(d);
  const drawA = results ? scale(results.a) : 0;
  // Ensure we don't draw outside bounds if something is wrong
  const safeDrawA = Math.min(drawA, drawD);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      <div className="text-center mb-4">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-blue-200 dark:border-blue-800">
          <span className="text-3xl">🏗️</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('title')}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Controls */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('width')}</label>
              <input type="number" value={bw} onChange={(e) => setBw(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-mono focus:ring-2 focus:ring-blue-100 outline-none text-slate-900 dark:text-slate-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('height')}</label>
              <input type="number" value={d} onChange={(e) => setD(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-mono focus:ring-2 focus:ring-blue-100 outline-none text-slate-900 dark:text-slate-100" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('concreteGrade')}</label>
              <select value={fck} onChange={(e) => setFck(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-mono focus:ring-2 focus:ring-blue-100 outline-none text-slate-900 dark:text-slate-100 cursor-pointer">
                {[20, 25, 30, 35, 40, 45, 50].map(val => (
                  <option key={val} value={val}>C{val}/{val + 5}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('steelGrade')}</label>
              <select value={fyk} onChange={(e) => setFyk(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-mono focus:ring-2 focus:ring-blue-100 outline-none text-slate-900 dark:text-slate-100 cursor-pointer">
                <option value={420}>B420C (420 MPa)</option>
                <option value={500}>B500B (500 MPa)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('rebarArea')}</label>
            <input type="number" value={As} onChange={(e) => setAs(Number(e.target.value))} step={100} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-mono focus:ring-2 focus:ring-blue-100 outline-none text-slate-900 dark:text-slate-100" />
            <input type="range" min={200} max={6000} step={100} value={As} onChange={(e) => setAs(Number(e.target.value))} className="w-full mt-2 accent-blue-600" />
          </div>

        </div>

        {/* Visualizer & Results */}
        <div className="lg:col-span-7 flex flex-col gap-6 h-full">

          <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">

            <h3 className="absolute top-4 left-5 text-sm font-semibold text-slate-500 dark:text-slate-400">{t('visualizer')}</h3>

            {results && (
              <svg width={svgW} height={svgH} className="mt-4 drop-shadow-sm">
                {/* Cross Section Outline */}
                <rect x="50" y="20" width="100" height={scale(totalH)} fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" className="dark:fill-slate-800 dark:stroke-slate-600" />
                <text x="100" y="15" textAnchor="middle" fontSize="10" className="fill-slate-500 dark:fill-slate-400 font-mono">bw ({bw})</text>

                {/* Compression Block (a) */}
                <rect x="50" y="20" width="100" height={safeDrawA} fill="url(#comp-pattern)" opacity="0.6" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" />

                {/* Rebars */}
                <circle cx="70" cy={20 + drawD} r="6" fill="#334155" stroke="#fff" strokeWidth="1" />
                <circle cx="100" cy={20 + drawD} r="6" fill="#334155" stroke="#fff" strokeWidth="1" />
                <circle cx="130" cy={20 + drawD} r="6" fill="#334155" stroke="#fff" strokeWidth="1" />

                {/* Depth Guidelines & Labels */}
                <line x1="20" y1={20 + drawD} x2="40" y2={20 + drawD} stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="20" y1="20" x2="40" y2="20" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
                <path d={`M 30 20 L 30 ${20 + drawD}`} stroke="#94a3b8" strokeWidth="1" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
                <text x="15" y={20 + drawD / 2} textAnchor="end" fontSize="10" className="fill-slate-500 font-mono">d</text>

                {/* Side Stress Diagram */}
                <line x1="200" y1="20" x2="200" y2={20 + drawD} stroke="#cbd5e1" strokeWidth="2" className="dark:stroke-slate-700" />
                {!results.isOverReinforced && (
                  <>
                    <path d={`M 200 20 L 260 20 L 260 ${20 + safeDrawA} L 200 ${20 + safeDrawA}`} fill="none" stroke="#ef4444" strokeWidth="2" />
                    <line x1="260" y1={20 + safeDrawA / 2} x2="280" y2={20 + safeDrawA / 2} stroke="#ef4444" strokeWidth="2" markerEnd="url(#force-arrow)" />
                    <text x="290" y={25 + safeDrawA / 2} fontSize="12" fontWeight="bold" className="fill-red-500 font-mono">Cc</text>

                    <line x1="140" y1={20 + drawD} x2="200" y2={20 + drawD} stroke="#3b82f6" strokeWidth="2" markerStart="url(#force-arrow-left)" />
                    <text x="110" y={25 + drawD} fontSize="12" fontWeight="bold" className="fill-blue-500 font-mono">Fs</text>
                  </>
                )}

                <defs>
                  <pattern id="comp-pattern" patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(45)">
                    <line x1="0" y="0" x2="0" y2="10" stroke="#ef4444" strokeWidth="2" />
                  </pattern>
                  <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
                  </marker>
                  <marker id="force-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
                  </marker>
                  <marker id="force-arrow-left" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                  </marker>
                </defs>
              </svg>
            )}
          </div>

          {/* Results Badge Board */}
          {results && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-1">{t('momentCapacity')}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white flex items-baseline gap-1">
                  {results.Md.toFixed(1)} <span className="text-xs font-normal text-slate-400">kN.m</span>
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-1">{t('compressionZone')}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white flex items-baseline gap-1">
                  {results.a.toFixed(1)} <span className="text-xs font-normal text-slate-400">mm</span>
                </p>
              </div>
              <div className={`col-span-2 lg:col-span-1 rounded-xl p-4 shadow-sm border ${results.isDuctile ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'}`}>
                <p className={`text-[11px] font-semibold uppercase tracking-wider mb-1 ${results.isDuctile ? 'text-emerald-700 dark:text-emerald-500' : 'text-red-700 dark:text-red-500'}`}>
                  {t('ductility')}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xl">
                    {results.isDuctile ? '✅' : '⚠️'}
                  </span>
                  <p className={`text-sm font-bold ${results.isDuctile ? 'text-emerald-800 dark:text-emerald-400' : 'text-red-800 dark:text-red-400'}`}>
                    {results.isDuctile ? t('safe') : t('unsafe')}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
