/**
 * @file shearMoment.ts
 * @description Solver for Shear and Moment Diagram Calculator
 */

import type { SolveFn, FieldValues, SolveResult } from '@/types';

export const solve: SolveFn = (values: FieldValues): SolveResult => {
  const load = values.load?.value;
  const length = values.length?.value;
  const position = (values.position?.value ?? length) ? length / 2 : 0;

  if (load === null || length === null) {
    throw new Error('Load and length are required');
  }

  // Simple simply-supported beam with point load
  const R1 = (load * (length - position)) / length;
  const R2 = (load * position) / length;

  const maxShear = Math.max(Math.abs(R1), Math.abs(R2));
  const maxMoment = R1 * position;

  return {
    R1,
    R2,
    maxShear,
    maxMoment,
  };
};
