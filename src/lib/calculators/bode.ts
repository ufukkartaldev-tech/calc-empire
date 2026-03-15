/**
 * @file bode.ts
 * @description Solver for Bode Plot Calculator
 */

import type { SolveFn, FieldValues, SolveResult } from '@/types';
import { calculateBodePlot } from '@/lib/formulas/electrical';

export const solve: SolveFn = (values: FieldValues): SolveResult => {
  const type = (values.type?.value as any) as 'low-pass' | 'high-pass';
  const R = values.R?.value;
  const C = values.C?.value ?? undefined;
  const L = values.L?.value ?? undefined;
  const points = values.points?.value ?? 100;

  if (!type || R === null) {
    throw new Error('Type and resistance are required');
  }

  const result = calculateBodePlot({ type, R, C, L, points });

  return {
    fc: result.fc,
    frequencies: result.frequencies,
    magnitudes: result.magnitudes,
    phases: result.phases,
  };
};
