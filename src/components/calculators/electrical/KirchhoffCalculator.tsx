'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { solveKirchhoff2Loop } from '@/lib/formulas/electrical';

export function KirchhoffCalculator() {
  // Optional fallback technique if translations are incomplete
  let t: any;
  try {
    t = useTranslations('Kirchhoff');
  } catch {
    t = (key: string) => key; // fallback if missing
  }

  const [V1, setV1] = useState<number>(10);
  const [V2, setV2] = useState<number>(10);
  const [R1, setR1] = useState<number>(10);
  const [R2, setR2] = useState<number>(10);
  const [R3, setR3] = useState<number>(10);

  const results = useMemo(() => {
    try {
      return solveKirchhoff2Loop({ V1, V2, R1, R2, R3 });
    } catch (error) {
      return null;
    }
  }, [V1, V2, R1, R2, R3]);

  const formatCurrent = (val: number) => {
    const absVal = Math.abs(val);
    if (absVal < 0.001 && absVal > 0) return (val * 1000).toFixed(2) + ' mA';
    return val.toFixed(3) + ' A';
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/40 rounded-xl flex items-center justify-center shadow-sm border border-orange-200 dark:border-orange-800">
          <span className="text-2xl">⚡</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Kirchhoff's Laws (2-Loop)</h2>
      </div>

      <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
        Calculate the branch currents for a standard 2-mesh circuit. Enter voltages and resistances to solve for I₁, I₂, and I₃.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Visualizer & Schematic */}
        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center relative">
          <h3 className="absolute top-4 left-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">Circuit Diagram</h3>

          <svg width="300" height="240" viewBox="0 0 300 240" className="mt-6 drop-shadow-sm">

            {/* Wires */}
            <path d="M 50 180 L 50 60 L 150 60 L 150 180 Z" fill="none" stroke="#94a3b8" strokeWidth="3" />
            <path d="M 150 180 L 150 60 L 250 60 L 250 180 Z" fill="none" stroke="#94a3b8" strokeWidth="3" />

            {/* V1 Source */}
            <circle cx="50" cy="120" r="15" fill="white" stroke="#3b82f6" strokeWidth="3" className="dark:fill-slate-900" />
            <text x="50" y="117" textAnchor="middle" fontSize="14" fill="#3b82f6" fontWeight="bold">+</text>
            <text x="50" y="128" textAnchor="middle" fontSize="14" fill="#3b82f6" fontWeight="bold">-</text>
            <text x="20" y="124" textAnchor="end" fontSize="12" fill="currentColor" className="text-slate-600 dark:text-slate-300 font-bold">V₁</text>

            {/* V2 Source */}
            <circle cx="250" cy="120" r="15" fill="white" stroke="#3b82f6" strokeWidth="3" className="dark:fill-slate-900" />
            <text x="250" y="117" textAnchor="middle" fontSize="14" fill="#3b82f6" fontWeight="bold">+</text>
            <text x="250" y="128" textAnchor="middle" fontSize="14" fill="#3b82f6" fontWeight="bold">-</text>
            <text x="280" y="124" textAnchor="start" fontSize="12" fill="currentColor" className="text-slate-600 dark:text-slate-300 font-bold">V₂</text>

            {/* R1 Resistor */}
            <rect x="85" y="52" width="30" height="16" fill="white" stroke="#ef4444" strokeWidth="3" className="dark:fill-slate-900" />
            <text x="100" y="45" textAnchor="middle" fontSize="12" fill="currentColor" className="text-slate-600 dark:text-slate-300 font-bold">R₁</text>
            <path d="M 85 60 L 115 60" stroke="#ef4444" strokeWidth="2" strokeDasharray="3 3" />

            {/* R2 Resistor */}
            <rect x="185" y="52" width="30" height="16" fill="white" stroke="#ef4444" strokeWidth="3" className="dark:fill-slate-900" />
            <text x="200" y="45" textAnchor="middle" fontSize="12" fill="currentColor" className="text-slate-600 dark:text-slate-300 font-bold">R₂</text>
            <path d="M 185 60 L 215 60" stroke="#ef4444" strokeWidth="2" strokeDasharray="3 3" />

            {/* R3 Resistor (Middle branch) */}
            <rect x="142" y="105" width="16" height="30" fill="white" stroke="#ef4444" strokeWidth="3" className="dark:fill-slate-900" />
            <text x="170" y="124" textAnchor="start" fontSize="12" fill="currentColor" className="text-slate-600 dark:text-slate-300 font-bold">R₃</text>
            <path d="M 150 105 L 150 135" stroke="#ef4444" strokeWidth="2" strokeDasharray="3 3" />

            {/* Current Arrows */}
            <g opacity={results ? 1 : 0.3}>
              <path d="M 70 85 Q 100 85 130 150" fill="none" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow-green)" strokeDasharray="4 2" />
              <text x="90" y="80" textAnchor="middle" fontSize="11" fill="#10b981" fontWeight="bold">I₁</text>

              <path d="M 230 85 Q 200 85 170 150" fill="none" stroke="#f59e0b" strokeWidth="2" markerEnd="url(#arrow-orange)" strokeDasharray="4 2" />
              <text x="210" y="80" textAnchor="middle" fontSize="11" fill="#f59e0b" fontWeight="bold">I₂</text>

              <path d="M 150 150 L 150 170" fill="none" stroke="#8b5cf6" strokeWidth="2.5" markerEnd="url(#arrow-purple)" />
              <text x="160" y="170" textAnchor="start" fontSize="11" fill="#8b5cf6" fontWeight="bold">I₃ (I₁+I₂)</text>
            </g>

            <defs>
              <marker id="arrow-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
              </marker>
              <marker id="arrow-orange" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
              </marker>
              <marker id="arrow-purple" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#8b5cf6" />
              </marker>
            </defs>
          </svg>
        </div>

        {/* Controls & Results */}
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <label className="text-xs font-semibold text-slate-500 block mb-1">V₁ (Left Source)</label>
              <div className="flex items-center gap-2">
                <input type="number" value={V1} onChange={e => setV1(Number(e.target.value))} className="w-full bg-transparent font-mono font-bold text-lg text-slate-900 dark:text-white outline-none" />
                <span className="text-slate-400 font-medium">V</span>
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <label className="text-xs font-semibold text-slate-500 block mb-1">V₂ (Right Source)</label>
              <div className="flex items-center gap-2">
                <input type="number" value={V2} onChange={e => setV2(Number(e.target.value))} className="w-full bg-transparent font-mono font-bold text-lg text-slate-900 dark:text-white outline-none" />
                <span className="text-slate-400 font-medium">V</span>
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <label className="text-xs font-semibold text-slate-500 block mb-1">R₁ (Left Resistor)</label>
              <div className="flex items-center gap-2">
                <input type="number" min="0" value={R1} onChange={e => setR1(Number(e.target.value))} className="w-full bg-transparent font-mono font-bold text-lg text-slate-900 dark:text-white outline-none" />
                <span className="text-slate-400 font-medium">Ω</span>
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <label className="text-xs font-semibold text-slate-500 block mb-1">R₂ (Right Resistor)</label>
              <div className="flex items-center gap-2">
                <input type="number" min="0" value={R2} onChange={e => setR2(Number(e.target.value))} className="w-full bg-transparent font-mono font-bold text-lg text-slate-900 dark:text-white outline-none" />
                <span className="text-slate-400 font-medium">Ω</span>
              </div>
            </div>
            <div className="col-span-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <label className="text-xs font-semibold text-slate-500 block mb-1">R₃ (Middle Branch)</label>
              <div className="flex items-center gap-2">
                <input type="number" min="0" value={R3} onChange={e => setR3(Number(e.target.value))} className="w-full bg-transparent font-mono font-bold text-lg text-slate-900 dark:text-white outline-none" />
                <span className="text-slate-400 font-medium">Ω</span>
              </div>
            </div>
          </div>

          {/* Output */}
          {results ? (
            <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-semibold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-4">Calculated Currents</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-white dark:bg-slate-950 px-4 py-2 border border-emerald-100 dark:border-emerald-900 rounded-lg">
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">I₁ (Mesh 1)</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{formatCurrent(results.I1)}</span>
                </div>
                <div className="flex justify-between items-center bg-white dark:bg-slate-950 px-4 py-2 border border-emerald-100 dark:border-emerald-900 rounded-lg">
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">I₂ (Mesh 2)</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{formatCurrent(results.I2)}</span>
                </div>
                <div className="flex justify-between items-center bg-white dark:bg-slate-950 px-4 py-2 border border-emerald-100 dark:border-emerald-900 rounded-lg shadow-sm">
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">I₃ (Middle)</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{formatCurrent(results.I3)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-xl p-5 text-center">
              <p className="text-red-600 dark:text-red-400 font-semibold">Invalid inputs or no unique solution</p>
              <p className="text-xs text-red-500 flex justify-center mt-1">Check for zero resistances in critical paths.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
