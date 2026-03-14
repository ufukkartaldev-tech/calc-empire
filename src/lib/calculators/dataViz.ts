/**
 * @file dataViz.ts
 * @description Solver for Data Visualizer
 */

import type { SolveFn, FieldValues, SolveResult } from '@/types';

export const solve: SolveFn = (values: FieldValues): SolveResult => {
  const data = values.data?.value;

  if (!data || !Array.isArray(data)) {
    throw new Error('Data array is required');
  }

  // Return data for visualization
  return { data };
};
