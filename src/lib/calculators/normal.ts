/**
 * @file normal.ts
 * @description Solver for Normal Distribution Calculator
 */

import type { SolveFn, FieldValues, SolveResult } from '@/types';
import { normalPdf, normalCdf } from '@/lib/formulas/statistics';

export const solve: SolveFn = (values: FieldValues): SolveResult => {
  const x = values.x?.value;
  const mean = values.mean?.value ?? 0;
  const stdDev = values.stdDev?.value ?? 1;

  if (x === null) {
    throw new Error('X value is required');
  }

  if (stdDev <= 0) {
    throw new Error('Standard deviation must be positive');
  }

  const pdf = normalPdf(x, mean, stdDev);
  const cdf = normalCdf(x, mean, stdDev);

  return { pdf, cdf };
};
