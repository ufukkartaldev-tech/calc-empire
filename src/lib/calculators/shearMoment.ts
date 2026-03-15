/**
 * @file shearMoment.ts
 * @description Solver for Shear and Moment Diagram Calculator
 */

import type { SolveFn, FieldValues, SolveResult } from '@/types';

export const solve: SolveFn = (values: FieldValues): SolveResult => {
  const load = values.load?.value;
  const length = values.length?.value;

  if (load === null || length === null || length === undefined) {
    throw new Error('Load and length are required');
  }

  const defaultPosition = length / 2;
  const position = values.position?.value ?? defaultPosition;

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
