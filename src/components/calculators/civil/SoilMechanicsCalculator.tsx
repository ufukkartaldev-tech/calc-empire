'use client';

import React from 'react';
import CalculatorTemplate from '../../CalculatorTemplate';
import { soilMechanicsConfig } from '@/lib/calculators/soilMechanics';

export function SoilMechanicsCalculator() {
  return <CalculatorTemplate config={soilMechanicsConfig} />;
}
