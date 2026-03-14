/**
 * @file baseConverter.ts
 * @description Solver for Number Base Converter
 */

import type { SolveFn, FieldValues, SolveResult } from '@/types';

export const solve: SolveFn = (values: FieldValues): SolveResult => {
  const inputValue = values.inputValue?.value;
  const fromBase = values.fromBase?.value ?? 10;
  const toBase = values.toBase?.value ?? 2;

  if (inputValue === null) {
    throw new Error('Input value is required');
  }

  const inputStr = String(inputValue);
  const decimal = parseInt(inputStr, fromBase);

  if (isNaN(decimal)) {
    throw new Error('Invalid input for the specified base');
  }

  const result = decimal.toString(toBase).toUpperCase();

  return {
    decimal,
    result,
  };
};
