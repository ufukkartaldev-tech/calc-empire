/**
 * @file stressStrain.ts
 * @description Config and Solver for Stress-Strain Calculator
 */

import React from 'react';
import type { CalculatorConfig, FieldValues, SolveResult } from '@/types';

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
  visual: <div className="text-6xl">💥</div>,
  fields: [
    {
      key: 'force',
      labelKey: 'StressStrain.force',
      units: [{ label: 'N', symbol: '' }],
    },
    {
      key: 'area',
      labelKey: 'StressStrain.area',
      units: [{ label: 'm²', symbol: '' }],
    },
    {
      key: 'deltaL',
      labelKey: 'StressStrain.deltaL',
      units: [{ label: 'm', symbol: '' }],
    },
    {
      key: 'L0',
      labelKey: 'StressStrain.L0',
      units: [{ label: 'm', symbol: '' }],
    },
    {
      key: 'E',
      labelKey: 'StressStrain.youngModulus',
      units: [{ label: 'Pa', symbol: '' }],
    },
  ],
  solverKey: 'stressStrain',
  calculationMode: 'calculateAll',
};
