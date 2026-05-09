'use client';

import React from 'react';
import type { CalculatorVisualProps } from '@/types';

export const ShearMomentVisual: React.FC<CalculatorVisualProps> = ({ result }) => {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center text-slate-400 gap-2 opacity-50">
        <span className="text-4xl">🏗️</span>
        <p className="text-[10px] font-black uppercase tracking-widest">
          Enter values to see diagram
        </p>
      </div>
    );
  }

  // Extract results from the solver output
  const R1 = result.R1 as number;
  const R2 = result.R2 as number;
  const maxShear = result.maxShear as number;
  const maxMoment = result.maxMoment as number;

  // We need the input values too, which are in result as well if the solver returns them
  // or we can extract them from fields. But for some diagrams, we need P, L, a.
  // In shearMoment.ts solver, we only returned R1, R2, maxShear, maxMoment.
  // I should update the solver to return enough info for drawing.

  // Let's assume we have P, L, a in the result (I'll update the solver)
  const P = (result.P as number) || 1000;
  const L = (result.L as number) || 10;
  const a = (result.a as number) || 5;

  return (
    <div className="w-full h-full flex flex-col gap-2 p-1">
      {/* SFD Thumbnail */}
      <div className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800 relative overflow-hidden flex flex-col">
        <div className="flex justify-between items-center px-1 pt-1">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">
            SFD
          </span>
          <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400">
            {maxShear.toFixed(1)}N
          </span>
        </div>
        <svg viewBox="0 0 100 40" className="w-full h-full">
          <line
            x1="0"
            y1="20"
            x2="100"
            y2="20"
            stroke="currentColor"
            className="text-slate-300 dark:text-slate-700"
            strokeWidth="0.5"
          />
          <path
            d={`M 0 20 L 0 ${20 - R1 / (P / 10)} L ${(a / L) * 100} ${20 - R1 / (P / 10)} L ${(a / L) * 100} ${20 + R2 / (P / 10)} L 100 ${20 + R2 / (P / 10)} L 100 20 Z`}
            fill="rgba(16, 185, 129, 0.2)"
            stroke="rgb(16, 185, 129)"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* BMD Thumbnail */}
      <div className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800 relative overflow-hidden flex flex-col">
        <div className="flex justify-between items-center px-1 pt-1">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">
            BMD
          </span>
          <span className="text-[8px] font-bold text-blue-600 dark:text-blue-400">
            {maxMoment.toFixed(1)}Nm
          </span>
        </div>
        <svg viewBox="0 0 100 40" className="w-full h-full">
          <line
            x1="0"
            y1="5"
            x2="100"
            y2="5"
            stroke="currentColor"
            className="text-slate-300 dark:text-slate-700"
            strokeWidth="0.5"
          />
          <path
            d={`M 0 5 L ${(a / L) * 100} ${5 + maxMoment / (maxMoment / 25)} L 100 5 Z`}
            fill="rgba(59, 130, 246, 0.2)"
            stroke="rgb(59, 130, 246)"
            strokeWidth="1"
          />
        </svg>
      </div>
    </div>
  );
};
