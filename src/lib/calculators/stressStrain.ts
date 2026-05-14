/**
 * @file stressStrain.ts
 * @description Config and Solver for Stress-Strain Calculator
 */

import type { CalculatorConfig, FieldValues, SolveResult } from '@/types';
import { FORCE_UNITS, AREA_UNITS, LENGTH_UNITS, PRESSURE_UNITS } from '@/constants';
import { StressStrainVisualizer } from '@/components/visualizers/StressStrainVisualizer';

// ─────────────────────────────────────────────────────────────────────────────
// Solve Function
// ─────────────────────────────────────────────────────────────────────────────

export const solve = (values: FieldValues): SolveResult => {
  const force = values.force?.value;
  const area = values.area?.value;
  const deltaL = values.deltaL?.value;
  const L0 = values.L0?.value;
  const E = values.E?.value;

  if (force === null || area === null || deltaL === null || L0 === null || E === null) {
    throw new Error('All parameters are required for full analysis');
  }

  if (area <= 0 || L0 <= 0) {
    throw new Error('Area and Original Length must be greater than zero');
  }

  const stress = force / area;
  const strain = deltaL / L0;

  return {
    stress,
    strain,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Config Export
// ─────────────────────────────────────────────────────────────────────────────

export const stressStrainConfig: CalculatorConfig = {
  id: 'StressStrain',
  titleKey: 'StressStrain.title',
  descriptionKey: 'StressStrain.subtitle',
  visual: StressStrainVisualizer,
  fields: [
    {
      key: 'force',
      labelKey: 'StressStrain.force',
      units: FORCE_UNITS,
    },
    {
      key: 'area',
      labelKey: 'StressStrain.area',
      units: AREA_UNITS,
    },
    {
      key: 'deltaL',
      labelKey: 'StressStrain.deltaL',
      units: LENGTH_UNITS,
    },
    {
      key: 'L0',
      labelKey: 'StressStrain.L0',
      units: LENGTH_UNITS,
    },
    {
      key: 'E',
      labelKey: 'StressStrain.youngModulus',
      units: PRESSURE_UNITS,
    },
  ],
  solverKey: 'stressStrain',
  calculationMode: 'calculateAll',
};
