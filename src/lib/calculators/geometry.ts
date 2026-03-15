/**
 * @file geometry.ts
 * @description Solver for Geometry Calculator
 */

import type { SolveFn, FieldValues, SolveResult } from '@/types';

export const solve: SolveFn = (values: FieldValues): SolveResult => {
  const shape = values.shape?.value as any;

  if (!shape) {
    throw new Error('Shape type is required');
  }

  const output: SolveResult = {};

  switch (shape) {
    case 'circle': {
      const radius = values.radius?.value;
      if (radius === null || radius <= 0) {
        throw new Error('Valid radius is required');
      }
      output.area = Math.PI * radius * radius;
      output.circumference = 2 * Math.PI * radius;
      break;
    }
    case 'rectangle': {
      const length = values.length?.value;
      const width = values.width?.value;
      if (length === null || width === null || length <= 0 || width <= 0) {
        throw new Error('Valid length and width are required');
      }
      output.area = length * width;
      output.perimeter = 2 * (length + width);
      break;
    }
    case 'triangle': {
      const base = values.base?.value;
      const height = values.height?.value;
      if (base === null || height === null || base <= 0 || height <= 0) {
        throw new Error('Valid base and height are required');
      }
      output.area = 0.5 * base * height;
      break;
    }
    default:
      throw new Error('Unknown shape type');
  }

  return output;
};
