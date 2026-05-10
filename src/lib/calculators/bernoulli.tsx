/**
 * @file bernoulli.ts
 * @description Config and Solver for Bernoulli's Equation Calculator
 */

import React from 'react';
import type { CalculatorConfig, FieldValues, SolveResult } from '@/types';
import { calculateBernoulli } from '@/lib/formulas/fluid';

// ─────────────────────────────────────────────────────────────────────────────
// Solve Function
// ─────────────────────────────────────────────────────────────────────────────

export const solve = (values: FieldValues): SolveResult => {
  const rho = values.rho?.value ?? 1000;
  const g = values.g?.value ?? 9.80665;

  const params: Record<string, number> = { rho, g };
  const keys = ['p1', 'v1', 'h1', 'p2', 'v2', 'h2'];

  keys.forEach((k) => {
    const val = values[k]?.value;
    if (val !== null) params[k] = val;
  });

  const result = calculateBernoulli(params);

  // We need to identify which one was unknown to return it in the result
  const missing = keys.find((k) => values[k]?.value === null);
  if (!missing) throw new Error('One field must be blank to solve');

  return { [missing]: result };
};

// ─────────────────────────────────────────────────────────────────────────────
// Config Export
// ─────────────────────────────────────────────────────────────────────────────

export const bernoulliConfig: CalculatorConfig = {
  id: 'Bernoulli',
  titleKey: 'Bernoulli.title',
  descriptionKey: 'Bernoulli.subtitle',
  visual: <div className="text-6xl">🌊</div>,
  fields: [
    {
      key: 'rho',
      labelKey: 'Bernoulli.density',
      units: [{ label: 'kg/m³', symbol: '' }],
    },
    {
      key: 'g',
      labelKey: 'Bernoulli.gravity',
      units: [{ label: 'm/s²', symbol: '' }],
    },
    {
      key: 'p1',
      labelKey: 'Bernoulli.pressure',
      units: [{ label: 'Pa (P1)', symbol: '' }],
    },
    {
      key: 'v1',
      labelKey: 'Bernoulli.velocity',
      units: [{ label: 'm/s (v1)', symbol: '' }],
    },
    {
      key: 'h1',
      labelKey: 'Bernoulli.height',
      units: [{ label: 'm (h1)', symbol: '' }],
    },
    {
      key: 'p2',
      labelKey: 'Bernoulli.pressure',
      units: [{ label: 'Pa (P2)', symbol: '' }],
    },
    {
      key: 'v2',
      labelKey: 'Bernoulli.velocity',
      units: [{ label: 'm/s (v2)', symbol: '' }],
    },
    {
      key: 'h2',
      labelKey: 'Bernoulli.height',
      units: [{ label: 'm (h2)', symbol: '' }],
    },
  ],
  solverKey: 'bernoulli',
  calculationMode: 'solveUnknown',
};
