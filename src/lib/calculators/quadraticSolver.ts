/**
 * @file quadraticSolver.ts
 * @description Solver for quadratic equations ax^2 + bx + c = 0
 */

import type { CalculatorConfig, FieldValues, SolveResult } from '@/types';
import { solveQuadratic } from '@/lib/formulas/mathematics';

export function solve(values: FieldValues): SolveResult {
  const a = values['a']?.value;
  const b = values['b']?.value;
  const c = values['c']?.value;

  if (a === null || b === null || c === null || a === 0) {
    return { error: 'Invalid coefficients' };
  }

  const { x1, x2, discriminant } = solveQuadratic(a, b, c);

  return {
    x1: x1,
    x2: x2,
    discriminant: discriminant,
  };
}

export const quadraticSolverConfig: CalculatorConfig = {
  id: 'quadratic-solver',
  titleKey: 'Dashboard.quadraticSolverTitle',
  descriptionKey: 'Dashboard.quadraticSolverDesc',
  fields: [
    { key: 'a', labelKey: 'QuadraticSolver.a', placeholderKey: 'QuadraticSolver.aPlaceholder', units: [{ label: '', symbol: '' }] },
    { key: 'b', labelKey: 'QuadraticSolver.b', placeholderKey: 'QuadraticSolver.bPlaceholder', units: [{ label: '', symbol: '' }] },
    { key: 'c', labelKey: 'QuadraticSolver.c', placeholderKey: 'QuadraticSolver.cPlaceholder', units: [{ label: '', symbol: '' }] },
  ],
  solverKey: 'quadraticSolver',
};
