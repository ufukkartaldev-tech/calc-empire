'use client';

import React from 'react';
import { Zap, Loader2 } from 'lucide-react';

interface CalculatorActionsProps {
  isLoading: boolean;
  onSolve: () => void;
  onReset: () => void;
  t: (key: string) => string;
}

export function CalculatorActions({ isLoading, onSolve, onReset, t }: CalculatorActionsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <button
        onClick={onSolve}
        disabled={isLoading}
        className="sm:col-span-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
      >
        {isLoading ? (
          <Loader2 size={14} strokeWidth={2.5} className="animate-spin" />
        ) : (
          <Zap size={14} strokeWidth={2.5} />
        )}
        {isLoading ? 'Calculating...' : t('CalculatorTemplate.solveButton')}
      </button>
      <button
        onClick={onReset}
        disabled={isLoading}
        className="bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:cursor-not-allowed text-slate-300 font-bold py-3.5 rounded-md transition-all active:scale-[0.98] uppercase tracking-widest text-xs"
      >
        {t('CalculatorTemplate.resetButton')}
      </button>
    </div>
  );
}
