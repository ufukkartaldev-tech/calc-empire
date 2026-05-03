'use client';

import React, { useState, useMemo } from 'react';
import { generatePlotPoints } from '@/lib/formulas/mathematics';
import { generateSmoothPath, normalizeToSvg } from '@/utils/svg-helpers';

export function FunctionPlotVisualizer() {
  // State for functions
  const [expr1, setExpr1] = useState('sin(x)');
  const [expr2, setExpr2] = useState('cos(x)');
  const [showExpr2, setShowExpr2] = useState(false);

  // Range State
  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);
  const [yMin, setYMin] = useState(-5);
  const [yMax, setYMax] = useState(5);

  const plotPoints1 = useMemo(() => {
    const raw = generatePlotPoints(expr1, xMin, xMax, 200);
    return raw.map((p) => ({
      x: normalizeToSvg(p.x, xMin, xMax, 0, 600),
      y: normalizeToSvg(p.y, yMin, yMax, 400, 0),
    }));
  }, [expr1, xMin, xMax, yMin, yMax]);

  const plotPoints2 = useMemo(() => {
    if (!showExpr2) return [];
    const raw = generatePlotPoints(expr2, xMin, xMax, 200);
    return raw.map((p) => ({
      x: normalizeToSvg(p.x, xMin, xMax, 0, 600),
      y: normalizeToSvg(p.y, yMin, yMax, 400, 0),
    }));
  }, [expr2, showExpr2, xMin, xMax, yMin, yMax]);

  const path1 = useMemo(
    () => (plotPoints1.length > 0 ? generateSmoothPath(plotPoints1) : ''),
    [plotPoints1]
  );
  const path2 = useMemo(
    () => (plotPoints2.length > 0 ? generateSmoothPath(plotPoints2) : ''),
    [plotPoints2]
  );

  // Grid Lines
  const gridLines = useMemo(() => {
    const lines: React.ReactNode[] = [];
    // Vertical lines
    for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x++) {
      if (x === 0) continue;
      const svgX = normalizeToSvg(x, xMin, xMax, 0, 600);
      lines.push(
        <line
          key={`vx-${x}`}
          x1={svgX}
          y1="0"
          x2={svgX}
          y2="400"
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-800"
          strokeWidth="0.5"
        />
      );
    }
    // Horizontal lines
    for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y++) {
      if (y === 0) continue;
      const svgY = normalizeToSvg(y, yMin, yMax, 400, 0);
      lines.push(
        <line
          key={`hy-${y}`}
          x1="0"
          y1={svgY}
          x2="600"
          y2={svgY}
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-800"
          strokeWidth="0.5"
        />
      );
    }
    return lines;
  }, [xMin, xMax, yMin, yMax]);

  const axisX = normalizeToSvg(0, yMin, yMax, 400, 0);
  const axisY = normalizeToSvg(0, xMin, xMax, 0, 600);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 rounded-xl flex items-center justify-center text-2xl border border-rose-100 dark:border-rose-800 text-rose-600">
            📊
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Graph Lab</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Interactive function visualization
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Main Chart Area */}
          <div className="space-y-6">
            <div className="relative aspect-[3/2] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
              <svg viewBox="0 0 600 400" className="w-full h-full">
                {gridLines}

                {/* Axes */}
                <line
                  x1="0"
                  y1={axisX}
                  x2="600"
                  y2={axisX}
                  stroke="currentColor"
                  className="text-slate-400 dark:text-slate-600"
                  strokeWidth="1.5"
                />
                <line
                  x1={axisY}
                  y1="0"
                  x2={axisY}
                  y2="400"
                  stroke="currentColor"
                  className="text-slate-400 dark:text-slate-600"
                  strokeWidth="1.5"
                />

                {/* Path 1 */}
                <path
                  d={path1}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Path 2 */}
                {showExpr2 && (
                  <path
                    d={path2}
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </svg>

              {/* Legend Overlay */}
              <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] font-bold">
                  <span className="w-3 h-3 rounded-full bg-indigo-500" />
                  <span className="text-slate-600 dark:text-slate-300 italic">f₁(x) = {expr1}</span>
                </div>
                {showExpr2 && (
                  <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] font-bold">
                    <span className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="text-slate-600 dark:text-slate-300 italic">
                      f₂(x) = {expr2}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Function Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                    Main Function f₁(x)
                  </label>
                </div>
                <input
                  type="text"
                  value={expr1}
                  onChange={(e) => setExpr1(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl font-mono text-indigo-600 dark:text-indigo-400 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">
                    Second Function f₂(x)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showExpr2}
                      onChange={(e) => setShowExpr2(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-7 h-4 bg-slate-200 dark:bg-slate-800 peer-checked:bg-rose-500 rounded-full transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-3 relative" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Enable</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={expr2}
                  disabled={!showExpr2}
                  onChange={(e) => setExpr2(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl font-mono text-rose-600 dark:text-rose-400 focus:outline-none focus:border-rose-500 transition-all disabled:opacity-30"
                />
              </div>
            </div>
          </div>

          {/* Controls Side */}
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Viewport Settings
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">X Min</label>
                    <input
                      type="number"
                      value={xMin}
                      onChange={(e) => setXMin(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">X Max</label>
                    <input
                      type="number"
                      value={xMax}
                      onChange={(e) => setXMax(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Y Min</label>
                    <input
                      type="number"
                      value={yMin}
                      onChange={(e) => setYMin(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Y Max</label>
                    <input
                      type="number"
                      value={yMax}
                      onChange={(e) => setYMax(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-3">
                  Quick Presets
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => {
                      setXMin(-10);
                      setXMax(10);
                      setYMin(-1);
                      setYMax(1);
                    }}
                    className="text-left px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-600 hover:border-indigo-400 transition-all"
                  >
                    Trigonometric Scope (±1)
                  </button>
                  <button
                    onClick={() => {
                      setXMin(-5);
                      setXMax(5);
                      setYMin(-5);
                      setYMax(5);
                    }}
                    className="text-left px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-600 hover:border-indigo-400 transition-all"
                  >
                    Standard View (±5)
                  </button>
                  <button
                    onClick={() => {
                      setXMin(-100);
                      setXMax(100);
                      setYMin(-100);
                      setYMax(100);
                    }}
                    className="text-left px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-600 hover:border-indigo-400 transition-all"
                  >
                    Wide View (±100)
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
              <h4 className="text-[10px] font-bold text-indigo-400 uppercase mb-2">
                Expression Tips
              </h4>
              <ul className="text-[10px] text-indigo-700/60 font-medium space-y-1">
                <li>
                  • Use <code className="bg-white/50 px-1 rounded">x^2</code> for powers
                </li>
                <li>
                  • <code className="bg-white/50 px-1 rounded">sin(x)</code>,{' '}
                  <code className="bg-white/50 px-1 rounded">cos(pi*x)</code>
                </li>
                <li>
                  • <code className="bg-white/50 px-1 rounded">sqrt(x)</code>,{' '}
                  <code className="bg-white/50 px-1 rounded">log(x)</code>
                </li>
                <li>
                  • <code className="bg-white/50 px-1 rounded">exp(x)</code> for e^x
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
