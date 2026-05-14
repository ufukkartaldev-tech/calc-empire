/**
 * @file molarity.ts
 * @description Molarity calculator (M = n / V)
 */

import type { CalculatorConfig, FieldValues, SolveResult } from '@/types';
import { calculateMolarity } from '@/lib/formulas/chemistry';
import { MOLARITY_UNITS, MOLE_UNITS, VOLUME_UNITS } from '@/constants';

export function solve(values: FieldValues): SolveResult {
  const m = values['molarity']?.value;
  const n = values['moles']?.value;
  const v = values['volume']?.value;

  const result = calculateMolarity({
    molarity: m === null ? undefined : m,
    moles: n === null ? undefined : n,
    volume: v === null ? undefined : v,
  });

  return {
    molarity: result.molarity,
    moles: result.moles,
    volume: result.volume,
  };
}

export const molarityConfig: CalculatorConfig = {
  id: 'molarity-calc',
  titleKey: 'Molarity.title',
  descriptionKey: 'Molarity.description',
  fields: [
    { key: 'molarity', labelKey: 'Molarity.molarity', units: MOLARITY_UNITS },
    { key: 'moles', labelKey: 'Molarity.moles', units: MOLE_UNITS },
    {
      key: 'volume',
      labelKey: 'Molarity.volume',
      units: VOLUME_UNITS,
    },
  ],
  solverKey: 'molarity',
};
