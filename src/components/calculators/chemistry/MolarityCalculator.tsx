'use client';

import React from 'react';
import CalculatorTemplate from '../../CalculatorTemplate';
import { molarityConfig } from '@/lib/calculators/molarity';

/**
 * Molarity Calculator component
 * Uses the standard CalculatorTemplate with molarity configuration
 */
export function MolarityCalculator() {
  return <CalculatorTemplate config={molarityConfig} />;
}
