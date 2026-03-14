/**
 * @file resistor.ts
 * @description Solver for Resistor Color Code Calculator
 */

import type { SolveFn, FieldValues, SolveResult } from '@/types';
import { resistorColorCode } from '@/lib/formulas/electrical';

export const solve: SolveFn = (values: FieldValues): SolveResult => {
  const bands = values.bands?.value;

  if (!bands || !Array.isArray(bands)) {
    throw new Error('Color bands are required');
  }

  const result = resistorColorCode(bands as string[]);

  return {
    resistance: result.resistance,
    tolerance: result.tolerance,
    tempCoeff: result.tempCoeff,
  };
};
