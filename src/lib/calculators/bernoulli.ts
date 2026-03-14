/**
 * @file bernoulli.ts
 * @description Solver for Bernoulli's Equation Calculator
 */

import type { SolveFn, FieldValues, SolveResult } from '@/types';

const g = 9.80665; // Gravity (m/s²)

export const solve: SolveFn = (values: FieldValues): SolveResult => {
  const P1 = values.P1?.value;
  const v1 = values.v1?.value;
  const z1 = values.z1?.value;
  const P2 = values.P2?.value;
  const v2 = values.v2?.value;
  const z2 = values.z2?.value;
  const rho = values.rho?.value ?? 1000; // Default water density

  if (rho === null || rho <= 0) {
    throw new Error('Density must be positive');
  }

  // Bernoulli: P1 + 0.5*rho*v1² + rho*g*z1 = P2 + 0.5*rho*v2² + rho*g*z2
  const known = [P1, v1, z1, P2, v2, z2].filter((v) => v !== null).length;

  if (known < 5) {
    throw new Error('At least 5 parameters are required');
  }

  const output: SolveResult = {};

  // Calculate total head at point 1
  let H1 = 0;
  if (P1 !== null) H1 += P1 / (rho * g);
  if (v1 !== null) H1 += (v1 * v1) / (2 * g);
  if (z1 !== null) H1 += z1;

  // Calculate total head at point 2
  let H2 = 0;
  if (P2 !== null) H2 += P2 / (rho * g);
  if (v2 !== null) H2 += (v2 * v2) / (2 * g);
  if (z2 !== null) H2 += z2;

  output.H1 = H1;
  output.H2 = H2;
  output.headLoss = Math.abs(H1 - H2);

  return output;
};
