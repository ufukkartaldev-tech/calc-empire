/**
 * @file idealGas.ts
 * @description Solver for Ideal Gas Law Calculator (PV = nRT)
 */

import type { SolveFn, FieldValues, SolveResult } from '@/types';
import { GAS_CONSTANT as R } from '@/constants/physics';

export const solve: SolveFn = (values: FieldValues): SolveResult => {
  const P = values.P?.value;
  const V = values.V?.value;
  const n = values.n?.value;
  const T = values.T?.value;

  const params = [P, V, n, T].filter((v) => v !== null);

  if (params.length < 3) {
    throw new Error('At least 3 parameters are required');
  }

  const output: SolveResult = {};

  if (P !== null) output.P = P;
  if (V !== null) output.V = V;
  if (n !== null) output.n = n;
  if (T !== null) output.T = T;

  // PV = nRT, solve for missing parameter
  if (P === null && V !== null && n !== null && T !== null) {
    output.P = (n * R * T) / V;
  } else if (V === null && P !== null && n !== null && T !== null) {
    output.V = (n * R * T) / P;
  } else if (n === null && P !== null && V !== null && T !== null) {
    output.n = (P * V) / (R * T);
  } else if (T === null && P !== null && V !== null && n !== null) {
    output.T = (P * V) / (n * R);
  }

  return output;
};
