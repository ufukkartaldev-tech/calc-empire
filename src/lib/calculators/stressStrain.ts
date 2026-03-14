/**
 * @file stressStrain.ts
 * @description Solver for Stress-Strain Calculator
 */

import type { SolveFn, FieldValues, SolveResult } from '@/types';

export const solve: SolveFn = (values: FieldValues): SolveResult => {
  const force = values.force?.value;
  const area = values.area?.value;
  const deltaL = values.deltaL?.value;
  const L0 = values.L0?.value;
  const E = values.E?.value;

  if (force === null || area === null) {
    throw new Error('Force and area are required');
  }

  const stress = force / area;

  const output: SolveResult = { stress };

  if (deltaL !== null && L0 !== null && L0 > 0) {
    const strain = deltaL / L0;
    output.strain = strain;

    if (E !== null && E > 0) {
      output.calculatedStress = E * strain;
    }
  }

  return output;
};
