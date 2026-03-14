/**
 * @file concreteSection.ts
 * @description Solver for Concrete Section Calculator
 */

import type { SolveFn, FieldValues, SolveResult } from '@/types';
import { concreteSectionCapacity } from '@/lib/formulas/civil';

export const solve: SolveFn = (values: FieldValues): SolveResult => {
  const bw = values.bw?.value;
  const d = values.d?.value;
  const fck = values.fck?.value;
  const fyk = values.fyk?.value;
  const As = values.As?.value;

  if (bw === null || d === null || fck === null || fyk === null || As === null) {
    throw new Error('All parameters are required');
  }

  const result = concreteSectionCapacity({ bw, d, fck, fyk, As });

  return {
    a: result.a,
    c: result.c,
    Md: result.Md,
    epsS: result.epsS,
    isDuctile: result.isDuctile ? 1 : 0,
    isOverReinforced: result.isOverReinforced ? 1 : 0,
  };
};
