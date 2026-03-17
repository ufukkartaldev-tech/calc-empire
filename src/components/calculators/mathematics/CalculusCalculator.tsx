'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  evaluateFunction,
  calculateDerivative,
  calculateIntegral,
  generatePlotPoints,
} from '@/lib/formulas/mathematics';
import { generateSmoothPath, normalizeToSvg } from '@/utils/svg-helpers';

export function CalculusCalculator() {
  const tDash = useTranslations('Dashboard');
  
  // State
  const [expression, setExpression] = useState('sin(x)');
  const [pointX, setPointX] = useState(0);
  const [rangeA, setRangeA] = useState(0);
  const [rangeB, setRangeB] = useState(Math.PI);
  
  // Bounds for visualization
  const [viewXMin, setViewXMin] = useState(-5);
  const [viewXMax, setViewXMax] = useState(5);
  const [viewYMin, setViewYMin] = useState(-2);
  const [viewYMax, setViewYMax] = useState(2);

  // Calculations
  const derivativeResult = useMemo(() => calculateDerivative(expression, pointX), [expression, pointX]);
  const integralResult = useMemo(() => calculateIntegral(expression, rangeA, rangeB), [expression, rangeA, rangeB]);
  
  // Point on curve for pointX
  const fxAtPoint = useMemo(() => evaluateFunction(expression, pointX), [expression, pointX]);

  // Plot Data
  const plotPoints = useMemo(() => {
    const rawPoints = generatePlotPoints(expression, viewXMin, viewXMax, 150);
    return rawPoints.map(p => ({
      x: normalizeToSvg(p.x, viewXMin, viewXMax, 0, 500),
      y: normalizeToSvg(p.y, viewYMin, viewYMax, 250, 0), // Inverted Y for SVG
    }));
  }, [expression, viewXMin, viewXMax, viewYMin, viewYMax]);

  const curvePath = useMemo(() => generateSmoothPath(plotPoints), [plotPoints]);

  // Tangent Line points
  const tangentPoints = useMemo(() => {
    if (isNaN(derivativeResult) || isNaN(fxAtPoint)) return [];
    const length = 2; // half-length of tangent line
    const x1 = pointX - length;
    const x2 = pointX + length;
    const y1 = fxAtPoint + derivativeResult * (x1 - pointX);
    const y2 = fxAtPoint + derivativeResult * (x2 - pointX);
    
    return [
      { x: normalizeToSvg(x1, viewXMin, viewXMax, 0, 500), y: normalizeToSvg(y1, viewYMin, viewYMax, 250, 0) },
      { x: normalizeToSvg(x2, viewXMin, viewXMax, 0, 500), y: normalizeToSvg(y2, viewYMin, viewYMax, 250, 0) }
    ];
  }, [pointX, fxAtPoint, derivativeResult, viewXMin, viewXMax, viewYMin, viewYMax]);

  // Area under curve for integral
  const integralAreaPoints = useMemo(() => {
    const rawPoints = generatePlotPoints(expression, rangeA, rangeB, 50);
    const mapped = rawPoints.map(p => ({
      x: normalizeToSvg(p.x, viewXMin, viewXMax, 0, 500),
      y: normalizeToSvg(p.y, viewYMin, viewYMax, 250, 0),
    }));
    
    if (mapped.length < 2) return '';
    
    const xBaseA = normalizeToSvg(rangeA, viewXMin, viewXMax, 0, 500);
    const xBaseB = normalizeToSvg(rangeB, viewXMin, viewXMax, 0, 500);
    const yZero = normalizeToSvg(0, viewYMin, viewYMax, 250, 0);

    let d = `M ${xBaseA} ${yZero}`;
    mapped.forEach(p => {
      d += ` L ${p.x} ${p.y}`;
    });
    d += ` L ${xBaseB} ${yZero} Z`;
    return d;
  }, [expression, rangeA, rangeB, viewXMin, viewXMax, viewYMin, viewYMax]);

  // Axes
  const axisX0 = normalizeToSvg(0, viewYMin, viewYMax, 250, 0);
  const axisY0 = normalizeToSvg(0, viewXMin, viewXMax, 0, 500);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-2xl border border-indigo-100 dark:border-indigo-800 text-indigo-600">
              ∫
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Calculus Pro</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Numerical differentiation & integration</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full uppercase tracking-wider">
              Ready
            </span>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
          {/* Main Visualizer */}
          <div className="space-y-6">
            <div className="relative aspect-[2/1] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-inner">
              <svg viewBox="0 0 500 250" className="w-full h-full">
                {/* Patterns/Grid */}
                <defs>
                  <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                    <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Axes */}
                <line x1="0" y1={axisX0} x2="500" y2={axisX0} stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="2" />
                <line x1={axisY0} y1="0" x2={axisY0} y2="250" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="2" />

                {/* Integral Area */}
                <path d={integralAreaPoints} fill="rgba(99, 102, 241, 0.2)" stroke="none" />

                {/* Function Curve */}
                <path d={curvePath} fill="none" stroke="#6366f1" strokeWidth="2.5" />

                {/* Tangent line */}
                {tangentPoints.length === 2 && (
                  <line 
                    x1={tangentPoints[0].x} y1={tangentPoints[0].y} 
                    x2={tangentPoints[1].x} y2={tangentPoints[1].y} 
                    stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2"
                  />
                )}

                {/* Point of interest */}
                {!isNaN(fxAtPoint) && (
                  <circle 
                    cx={normalizeToSvg(pointX, viewXMin, viewXMax, 0, 500)} 
                    cy={normalizeToSvg(fxAtPoint, viewYMin, viewYMax, 250, 0)} 
                    r="4" fill="#f59e0b" 
                  />
                )}
              </svg>

              {/* View Controls Overlay */}
              <div className="absolute top-2 right-2 flex gap-1">
                <button 
                  onClick={() => { setViewYMin(v => v-1); setViewYMax(v => v+1); }}
                  className="p-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-xs hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Zoom Out
                </button>
                <button 
                  onClick={() => { setViewYMin(v => v+1); setViewYMax(v => v-1); }}
                  className="p-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-xs hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Zoom In
                </button>
              </div>
            </div>

            {/* Expression Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Function f(x)</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono italic">f(x) =</span>
                <input 
                  type="text" 
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                  className="w-full pl-20 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl font-mono text-xl text-indigo-600 dark:text-indigo-400 focus:outline-none focus:border-indigo-500 transition-all shadow-sm"
                  placeholder="e.g. sin(x) * x"
                />
              </div>
              <p className="text-[10px] text-slate-400">Supports x, sin, cos, tan, exp, log, sqrt, ^, pi, e</p>
            </div>
          </div>

          {/* Sidebar Controls & Results */}
          <div className="space-y-6">
            {/* Derivative Section */}
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-amber-800 dark:text-amber-400 text-sm italic">d/dx Differentiation</h3>
                <span className="text-xs text-amber-600 font-mono">Slope</span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-amber-700/60 uppercase">Point x</label>
                  <input 
                    type="number" 
                    value={pointX}
                    onChange={(e) => setPointX(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
                <div className="pt-2 border-t border-amber-100 dark:border-amber-900/20">
                  <p className="text-[10px] text-amber-700/60 uppercase font-bold mb-1">Result f&apos;(x)</p>
                  <p className="text-2xl font-mono font-bold text-amber-900 dark:text-amber-200">
                    {isNaN(derivativeResult) ? '—' : derivativeResult.toFixed(6).replace(/\.?0+$/, '')}
                  </p>
                </div>
              </div>
            </div>

            {/* Integral Section */}
            <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-indigo-800 dark:text-indigo-400 text-sm italic">∫ Integration</h3>
                <span className="text-xs text-indigo-600 font-mono">Area</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-indigo-700/60 uppercase">Lower (a)</label>
                  <input 
                    type="number" 
                    value={rangeA}
                    step="0.1"
                    onChange={(e) => setRangeA(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-indigo-700/60 uppercase">Upper (b)</label>
                  <input 
                    type="number" 
                    value={rangeB}
                    step="0.1"
                    onChange={(e) => setRangeB(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>
              <div className="pt-2 border-t border-indigo-100 dark:border-indigo-900/20">
                <p className="text-[10px] text-indigo-700/60 uppercase font-bold mb-1">Definite Integral</p>
                <p className="text-2xl font-mono font-bold text-indigo-900 dark:text-indigo-200">
                  {isNaN(integralResult) ? '—' : integralResult.toFixed(6).replace(/\.?0+$/, '')}
                </p>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Examples</h4>
              <ul className="space-y-1 text-xs text-slate-500">
                <li>• <button onClick={() => setExpression('x^2')} className="hover:text-indigo-500 underline decoration-dotted">x^2 (Parabola)</button></li>
                <li>• <button onClick={() => { setExpression('sin(x)'); setRangeB(Math.PI); }} className="hover:text-indigo-500 underline decoration-dotted">sin(x) [0 to π]</button></li>
                <li>• <button onClick={() => setExpression('exp(-x^2)')} className="hover:text-indigo-500 underline decoration-dotted">exp(-x^2) (Gauss)</button></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

