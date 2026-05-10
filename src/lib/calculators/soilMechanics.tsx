/**
 * @file soilMechanics.ts
 * @description Config and Solver for Soil Mechanics Calculator
 */

import React from 'react';
import type { CalculatorConfig, FieldValues, SolveResult } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Solve Function
// ─────────────────────────────────────────────────────────────────────────────

export const solve = (values: FieldValues): SolveResult => {
  const cohesion = values.cohesion?.value;
  const frictionAngle = values.frictionAngle?.value;
  const normalStress = values.normalStress?.value;

  if (cohesion === null || frictionAngle === null || normalStress === null) {
    throw new Error('All parameters (Cohesion, Friction Angle, Normal Stress) are required');
  }

  // Mohr-Coulomb failure criterion: τ = c + σ * tan(φ)
  const frictionAngleRad = (frictionAngle * Math.PI) / 180;
  const shearStrength = cohesion + normalStress * Math.tan(frictionAngleRad);

  return { shearStrength };
};

// ─────────────────────────────────────────────────────────────────────────────
// Config Export
// ─────────────────────────────────────────────────────────────────────────────

export const soilMechanicsConfig: CalculatorConfig = {
  id: 'SoilMechanics',
  titleKey: 'SoilMechanics.title',
  descriptionKey: 'SoilMechanics.subtitle',
  visual: <div className="text-6xl">🌱</div>,
  fields: [
    {
      key: 'cohesion',
      labelKey: 'SoilMechanics.cohesion',
      units: [{ label: 'kPa', symbol: '' }],
    },
    {
      key: 'frictionAngle',
      labelKey: 'SoilMechanics.frictionAngle',
      units: [{ label: '°', symbol: '' }],
    },
    {
      key: 'normalStress',
      labelKey: 'SoilMechanics.normalStress',
      units: [{ label: 'kPa', symbol: '' }],
    },
  ],
  solverKey: 'soilMechanics',
  calculationMode: 'calculateAll',
};
