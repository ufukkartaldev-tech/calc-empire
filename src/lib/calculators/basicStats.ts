/**
 * @file basicStats.ts
 * @description Solver for Basic Statistics Calculator
 */

import type { SolveFn, FieldValues, SolveResult } from '@/types';
import { mean, median, mode, variance, standardDeviation } from '@/lib/formulas/statistics';

export const solve: SolveFn = (values: FieldValues): SolveResult => {
  const data = values.data?.value;

  if (!data || !Array.isArray(data) || data.length === 0) {
    throw new Error('Data array is required');
  }

  const meanVal = mean(data);
  const medianVal = median(data);
  const modeVal = mode(data);
  const varianceVal = variance(data);
  const stdDevVal = standardDeviation(data);

  return {
    mean: meanVal,
    median: medianVal,
    mode: modeVal,
    variance: varianceVal,
    stdDev: stdDevVal,
  };
};
