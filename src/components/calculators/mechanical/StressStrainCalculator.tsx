'use client';

import React from 'react';
import CalculatorTemplate from '../../CalculatorTemplate';
import { stressStrainConfig } from '@/lib/calculators/stressStrain';

export function StressStrainCalculator() {
  return <CalculatorTemplate config={stressStrainConfig} />;
}
