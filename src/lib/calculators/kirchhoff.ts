/**
 * @file kirchhoff.ts
 * @description Solver for Kirchhoff's Laws (2-Loop Mesh Analysis)
 */

import type { SolveFn, FieldValues, SolveResult } from '@/types';
import { solveKirchhoff2Loop } from '@/lib/formulas/electrical';

export const solve: SolveFn = (values: FieldValues): SolveResult => {
  const V1 = values.V1?.value;
  const V2 = values.V2?.value;
  const R1 = values.R1?.value;
  const R2 = values.R2?.value;
  const R3 = values.R3?.value;

  if (V1 === null || V2 === null || R1 === null || R2 === null || R3 === null) {
    throw new Error('All parameters are required');
  }

  const result = solveKirchhoff2Loop({ V1, V2, R1, R2, R3 });

  return {
    I1: result.I1,
    I2: result.I2,
    I3: result.I3,
  };
};
