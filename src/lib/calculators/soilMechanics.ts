/**
 * @file soilMechanics.ts
 * @description Solver for Soil Mechanics Calculator
 */

import type { SolveFn, FieldValues, SolveResult } from '@/types';

import { PI } from '@/constants/physics';

export const solve: SolveFn = (values: FieldValues): SolveResult => {
  const cohesion = values.cohesion?.value;
  const frictionAngle = values.frictionAngle?.value;
  const normalStress = values.normalStress?.value;

  if (cohesion === null || frictionAngle === null || normalStress === null) {
    throw new Error('All parameters are required');
  }

  // Mohr-Coulomb failure criterion: τ = c + σ * tan(φ)
  const frictionAngleRad = (frictionAngle * PI) / 180;
  const shearStrength = cohesion + normalStress * Math.tan(frictionAngleRad);

  return { shearStrength };
};
