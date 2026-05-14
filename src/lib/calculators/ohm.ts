/**
 * @file ohm.ts
 * @description
 * CalculatorConfig implementation for Ohm's Law (V = I × R).
 */

import type { CalculatorConfig, FieldValues, SolveResult } from '@/types';
import { ohm as ohmFormula } from '@/lib/formulas';
import { VOLTAGE_UNITS, CURRENT_UNITS, RESISTANCE_UNITS } from '@/constants';
import { OhmVisualizer } from '@/components/visualizers/OhmVisualizer';

// ─────────────────────────────────────────────────────────────────────────────
// Solve Function
// ─────────────────────────────────────────────────────────────────────────────

export function solve(values: FieldValues): SolveResult {
  const toUnitValue = (key: string) => {
    const fv = values[key];
    if (fv.value === null) return undefined;
    return fv.unit ? { value: fv.value, unit: fv.unit } : fv.value;
  };

  const result = ohmFormula({
    voltage: toUnitValue('voltage'),
    current: toUnitValue('current'),
    resistance: toUnitValue('resistance'),
  });

  const out: SolveResult = {};
  if (result.voltage !== undefined) out['voltage'] = result.voltage;
  if (result.current !== undefined) out['current'] = result.current;
  if (result.resistance !== undefined) out['resistance'] = result.resistance;
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Config Export
// ─────────────────────────────────────────────────────────────────────────────

export const ohmConfig: CalculatorConfig = {
  id: 'ohm',
  titleKey: 'OhmCalculator.title',
  descriptionKey: 'OhmCalculator.description',
  visual: OhmVisualizer,
  fields: [
    {
      key: 'voltage',
      labelKey: 'OhmCalculator.voltage',
      placeholderKey: 'OhmCalculator.voltagePlaceholder',
      units: VOLTAGE_UNITS,
    },
    {
      key: 'current',
      labelKey: 'OhmCalculator.current',
      placeholderKey: 'OhmCalculator.currentPlaceholder',
      units: CURRENT_UNITS,
    },
    {
      key: 'resistance',
      labelKey: 'OhmCalculator.resistance',
      placeholderKey: 'OhmCalculator.resistancePlaceholder',
      units: RESISTANCE_UNITS,
    },
  ],
  solverKey: 'ohm',
  referenceKey: 'ToolReference.ohm',
};
