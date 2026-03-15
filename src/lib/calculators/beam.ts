/**
 * @file beam.ts
 * @description Solver for Beam Deflection Calculator
 */

import type { SolveFn, FieldValues, SolveResult } from '@/types';
import { beamDeflection } from '@/lib/formulas/mechanical';

export const solve: SolveFn = (values: FieldValues): SolveResult => {
  const W = values.W?.value;
  const L = values.L?.value;
  const E = values.E?.value;
  const I = values.I?.value;
  const type = (values.type?.value as any) as 'cantilever' | 'simply-supported';

  if (W === null || L === null || E === null || I === null || !type) {
    throw new Error('All parameters are required');
  }

  const deflection = beamDeflection({ W, L, E, I, type });

  return { deflection };
};
