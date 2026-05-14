/**
 * @file kirchhoff.ts
 * @description Solver for Kirchhoff's Laws (2-Loop Mesh Analysis)
 */

import type { CalculatorConfig, FieldValues, SolveResult } from '@/types';
import { solveKirchhoff2Loop } from '@/lib/formulas/electrical';
import { VOLTAGE_UNITS, RESISTANCE_UNITS } from '@/constants';
import { KirchhoffVisualizer } from '@/components/visualizers/KirchhoffVisualizer';

// ─────────────────────────────────────────────────────────────────────────────
// Solve Function
// ─────────────────────────────────────────────────────────────────────────────

export const solve = (values: FieldValues): SolveResult => {
  const V1 = values.V1?.value;
  const V2 = values.V2?.value;
  const R1 = values.R1?.value;
  const R2 = values.R2?.value;
  const R3 = values.R3?.value;

  if (V1 === null || V2 === null || R1 === null || R2 === null || R3 === null) {
    throw new Error('All parameters (V1, V2, R1, R2, R3) are required');
  }

  const result = solveKirchhoff2Loop({ V1, V2, R1, R2, R3 });

  return {
    I1: result.I1,
    I2: result.I2,
    I3: result.I3,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Config Export
// ─────────────────────────────────────────────────────────────────────────────

export const kirchhoffConfig: CalculatorConfig = {
  id: 'kirchhoff-laws',
  titleKey: 'Kirchhoff.title',
  descriptionKey: 'Kirchhoff.description',
  visual: KirchhoffVisualizer,
  fields: [
    {
      key: 'V1',
      labelKey: 'Kirchhoff.v1Label',
      units: VOLTAGE_UNITS,
    },
    {
      key: 'V2',
      labelKey: 'Kirchhoff.v2Label',
      units: VOLTAGE_UNITS,
    },
    {
      key: 'R1',
      labelKey: 'Kirchhoff.r1Label',
      units: RESISTANCE_UNITS,
    },
    {
      key: 'R2',
      labelKey: 'Kirchhoff.r2Label',
      units: RESISTANCE_UNITS,
    },
    {
      key: 'R3',
      labelKey: 'Kirchhoff.r3Label',
      units: RESISTANCE_UNITS,
    },
  ],
  solverKey: 'kirchhoff',
  referenceKey: 'ToolReference.kirchhoff',
  calculationMode: 'calculateAll',
};
