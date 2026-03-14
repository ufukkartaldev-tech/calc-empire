/**
 * @file periodicTable.ts
 * @description Solver for Periodic Table Visualizer
 */

import type { SolveFn, FieldValues, SolveResult } from '@/types';

export const solve: SolveFn = (values: FieldValues): SolveResult => {
  const atomicNumber = values.atomicNumber?.value;

  if (atomicNumber === null) {
    throw new Error('Atomic number is required');
  }

  // This is a visualizer, return the input for display purposes
  return { atomicNumber };
};
