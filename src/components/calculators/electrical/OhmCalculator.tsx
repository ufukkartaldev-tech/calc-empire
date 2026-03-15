'use client';

import React from 'react';
import CalculatorTemplate from '../../CalculatorTemplate';
import { ohmConfig } from '@/lib/calculators/ohm';

export function OhmCalculator() {
  return <CalculatorTemplate config={ohmConfig} />;
}
