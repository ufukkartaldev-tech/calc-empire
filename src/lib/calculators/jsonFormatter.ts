/**
 * @file jsonFormatter.ts
 * @description Solver for JSON Formatter
 */

import type { SolveFn, FieldValues, SolveResult } from '@/types';

export const solve: SolveFn = (values: FieldValues): SolveResult => {
  const jsonInput = values.jsonInput?.value;

  if (!jsonInput || typeof jsonInput !== 'string') {
    throw new Error('JSON input is required');
  }

  try {
    const parsed = JSON.parse(jsonInput);
    const formatted = JSON.stringify(parsed, null, 2);
    const minified = JSON.stringify(parsed);

    return {
      formatted,
      minified,
      isValid: true,
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Invalid JSON',
    };
  }
};
