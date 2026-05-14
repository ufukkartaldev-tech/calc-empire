/**
 * @file power.ts
 * @description Config and Solver for AC Power Calculator
 */

import React from 'react';
import type { CalculatorConfig, FieldValues, SolveResult } from '@/types';
import { acPower } from '@/lib/formulas/electrical';
import { VOLTAGE_UNITS, CURRENT_UNITS, ANGLE_UNITS } from '@/constants';

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
  id: 'PowerCalculator',
  titleKey: 'PowerCalculator.title',
  descriptionKey: 'PowerCalculator.description',
  visual: () => {
    // If we want to keep the triangle visual, we might need to adapt it

    // or just use a placeholder for now if it's too complex to move here.
    // For now, let's use a simple SVG or a specialized component.
    return <div className="text-6xl">⚡</div>;
  },
  fields: [
    {
      key: 'voltage',
      labelKey: 'PowerCalculator.voltage',
      units: [...VOLTAGE_UNITS],
    },
    {
      key: 'current',
      labelKey: 'PowerCalculator.current',
      units: [...CURRENT_UNITS],
    },
    {
      key: 'phiDeg',
      labelKey: 'PowerCalculator.phaseAngle',
      units: [...ANGLE_UNITS],
    },
  ],
  solverKey: 'power',
  referenceKey: 'ToolReference.power',
  calculationMode: 'calculateAll',
};
