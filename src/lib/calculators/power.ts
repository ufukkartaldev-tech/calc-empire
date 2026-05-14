/**
 * @file power.ts
 * @description Config and Solver for AC Power Calculator
 */

import type { CalculatorConfig, FieldValues, SolveResult } from '@/types';
import { acPower } from '@/lib/formulas/electrical';
import { VOLTAGE_UNITS, CURRENT_UNITS, ANGLE_UNITS } from '@/constants';
import { PowerVisualizer } from '@/components/visualizers/PowerVisualizer';

// ─────────────────────────────────────────────────────────────────────────────
// Solve Function
// ─────────────────────────────────────────────────────────────────────────────

export const solve = (values: FieldValues): SolveResult => {
  const voltage = values.voltage?.value;
  const current = values.current?.value;
  const phiDeg = values.phiDeg?.value;

  if (voltage === null || current === null || phiDeg === null) {
    throw new Error('All parameters (Voltage, Current, Phase Angle) are required');
  }

  const result = acPower({ voltage, current, phiDeg });

  return {
    apparentPower: result.apparentPower,
    activePower: result.activePower,
    reactivePower: result.reactivePower,
    powerFactor: result.powerFactor,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Config Export
// ─────────────────────────────────────────────────────────────────────────────

export const powerConfig: CalculatorConfig = {
  id: 'power',
  titleKey: 'PowerCalculator.title',
  descriptionKey: 'PowerCalculator.description',
  visual: PowerVisualizer,
  fields: [
    {
      key: 'voltage',
      labelKey: 'PowerCalculator.voltage',
      units: VOLTAGE_UNITS,
    },
    {
      key: 'current',
      labelKey: 'PowerCalculator.current',
      units: CURRENT_UNITS,
    },
    {
      key: 'phiDeg',
      labelKey: 'PowerCalculator.phaseAngle',
      units: ANGLE_UNITS,
    },
  ],
  solverKey: 'power',
  referenceKey: 'ToolReference.power',
  calculationMode: 'calculateAll',
};
