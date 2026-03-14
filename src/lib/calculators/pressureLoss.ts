/**
 * @file pressureLoss.ts
 * @description Solver for Pressure Loss Calculator (Darcy-Weisbach)
 */

import type { SolveFn, FieldValues, SolveResult } from '@/types';
import { darcyWeisbach } from '@/lib/formulas/fluid';

export const solve: SolveFn = (values: FieldValues): SolveResult => {
  const f = values.f?.value;
  const L = values.L?.value;
  const D = values.D?.value;
  const rho = values.rho?.value ?? 1000;
  const v = values.v?.value;

  if (f === null || L === null || D === null || rho === null || v === null) {
    throw new Error('All parameters are required');
  }

  const result = darcyWeisbach({ f, L, D, rho, v });

  return {
    pressureDropPa: result.pressureDropPa,
    headLossM: result.headLossM,
  };
};
