/**
 * @file compoundInterest.ts
 * @description Solver for Compound Interest Calculator
 */

import type { SolveFn, FieldValues, SolveResult } from '@/types';

export const solve: SolveFn = (values: FieldValues): SolveResult => {
  const principal = values.principal?.value;
  const rate = values.rate?.value;
  const time = values.time?.value;
  const frequency = values.frequency?.value ?? 1; // Annual by default

  if (principal === null || rate === null || time === null) {
    throw new Error('Principal, rate, and time are required');
  }

  if (principal <= 0 || rate < 0 || time < 0 || frequency <= 0) {
    throw new Error('Invalid parameter values');
  }

  // A = P(1 + r/n)^(nt)
  const rateDecimal = rate / 100;
  const amount = principal * Math.pow(1 + rateDecimal / frequency, frequency * time);
  const interest = amount - principal;

  return {
    amount,
    interest,
  };
};
