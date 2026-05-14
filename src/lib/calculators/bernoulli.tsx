/**
 * @file bernoulli.ts
 * @description Config and Solver for Bernoulli's Equation Calculator
 */

import React from 'react';
import type { CalculatorConfig, FieldValues, SolveResult } from '@/types';
import { calculateBernoulli, type BernoulliParams } from '@/lib/formulas/fluid';
import {
  DENSITY_UNITS,
  ACCELERATION_UNITS,
  PRESSURE_UNITS,
  VELOCITY_UNITS,
  LENGTH_UNITS,
} from '@/constants';

// ─────────────────────────────────────────────────────────────────────────────
// Solve Function
// ─────────────────────────────────────────────────────────────────────────────

export const solve = (values: FieldValues): SolveResult => {
  const rho = values.rho?.value ?? 1000;
  const g = values.g?.value ?? 9.80665;

  const params: BernoulliParams = { rho, g };
  const keys = ['p1', 'v1', 'h1', 'p2', 'v2', 'h2'] as const;

  keys.forEach((k) => {
    const val = values[k]?.value;
    if (val !== null) {
      params[k] = val;
    }
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
      units: DENSITY_UNITS,
    },
    {
      key: 'g',
      labelKey: 'Bernoulli.gravity',
      units: ACCELERATION_UNITS,
    },
    {
      key: 'p1',
      labelKey: 'Bernoulli.pressure',
      units: PRESSURE_UNITS,
    },
    {
      key: 'v1',
      labelKey: 'Bernoulli.velocity',
      units: VELOCITY_UNITS,
    },
    {
      key: 'h1',
      labelKey: 'Bernoulli.height',
      units: LENGTH_UNITS,
    },
    {
      key: 'p2',
      labelKey: 'Bernoulli.pressure',
      units: PRESSURE_UNITS,
    },
    {
      key: 'v2',
      labelKey: 'Bernoulli.velocity',
      units: VELOCITY_UNITS,
    },
    {
      key: 'h2',
      labelKey: 'Bernoulli.height',
      units: LENGTH_UNITS,
    },
  ],
  solverKey: 'bernoulli',
  calculationMode: 'solveUnknown',
};
