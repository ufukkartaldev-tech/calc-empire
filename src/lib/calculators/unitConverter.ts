/**
 * @file unitConverter.ts
 * @description Solver for Unit Converter
 */

import type { SolveFn, FieldValues, SolveResult } from '@/types';
import {
  convertLength,
  convertArea,
  convertVolume,
  convertPressure,
  convertTemperature,
  convertEnergy,
} from '@/lib/formulas/converters';

export const solve: SolveFn = (values: FieldValues): SolveResult => {
  const category = values.category?.value;
  const value = values.value?.value;
  const fromUnit = values.fromUnit?.value;
  const toUnit = values.toUnit?.value;

  if (!category || value === null || !fromUnit || !toUnit) {
    throw new Error('All parameters are required');
  }

  let result = 0;

  switch (category) {
    case 'length':
      result = convertLength(value, fromUnit, toUnit);
      break;
    case 'area':
      result = convertArea(value, fromUnit, toUnit);
      break;
    case 'volume':
      result = convertVolume(value, fromUnit, toUnit);
      break;
    case 'pressure':
      result = convertPressure(value, fromUnit, toUnit);
      break;
    case 'temperature':
      result = convertTemperature(value, fromUnit, toUnit);
      break;
    case 'energy':
      result = convertEnergy(value, fromUnit, toUnit);
      break;
    default:
      throw new Error('Unknown conversion category');
  }

  return { result };
};
