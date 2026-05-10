'use client';

import React from 'react';
import CalculatorTemplate from '../../CalculatorTemplate';
import { powerConfig } from '@/lib/calculators/power';

export function PowerCalculator() {
  return <CalculatorTemplate config={powerConfig} />;
}
