'use client';

import React from 'react';
import type { CalculatorConfig, TranslationKey } from '@/types';
import type { ResultState } from '@/stores/calculatorStore';
import Big from 'big.js';

interface CalculatorResultsProps {
  config: CalculatorConfig;
  result: ResultState;
  t: (key: string) => string;
}

export function CalculatorResults({ config, result, t }: CalculatorResultsProps) {
  if (!result) return null;

  return (
    <div className="mb-8 space-y-4">
      {Object.entries(result)
        .filter(([key]) => !config.fields.some((f) => f.key === key))
        .map(([key, value]) => (
          <div
            key={key}
            className="p-4 bg-blue-600/5 border border-blue-600/20 rounded-lg flex justify-between items-center"
          >
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t(`${config.id}.${key}` as TranslationKey) || key}
            </span>
            <span className="font-geist-mono font-bold text-blue-500">{formatResult(value)}</span>
          </div>
        ))}
    </div>
  );
}

/** Precision formatting using Big.js */
function formatResult(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;

  if (typeof value === 'number') {
    if (value === 0) return '0';
    try {
      const b = new Big(value);
      // If it's very small or very large, use scientific notation
      if (Math.abs(value) < 0.0001 || Math.abs(value) > 1000000) {
        return b.toExponential(4);
      }
      // Otherwise, round to 6 decimal places and remove trailing zeros
      return parseFloat(b.toFixed(6)).toString();
    } catch {
      return value.toString();
    }
  }

  return String(value);
}
