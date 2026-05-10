'use client';

import React from 'react';
import CalculatorTemplate from '../../CalculatorTemplate';
import { kirchhoffConfig } from '@/lib/calculators/kirchhoff';

export function KirchhoffCalculator() {
  return <CalculatorTemplate config={kirchhoffConfig} />;
}
