/**
 * @file discreteDist.ts
 * @description Solver for Discrete Distribution Visualizer
 */

import type { SolveFn, FieldValues, SolveResult } from '@/types';

export const solve: SolveFn = (values: FieldValues): SolveResult => {
  const distribution = values.distribution?.value as any;
  const n = values.n?.value;
  const p = values.p?.value;

  if (!distribution) {
    throw new Error('Distribution type is required');
  }

  // Binomial distribution example
  if (distribution === 'binomial' && n !== null && p !== null) {
    if (n <= 0 || p < 0 || p > 1) {
      throw new Error('Invalid parameters for binomial distribution');
    }

    const mean = n * p;
    const variance = n * p * (1 - p);
    const stdDev = Math.sqrt(variance);

    return { mean, variance, stdDev };
  }

  return {};
};
