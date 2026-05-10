'use client';

import React from 'react';
import CalculatorTemplate from '../../CalculatorTemplate';
import { bernoulliConfig } from '@/lib/calculators/bernoulli';

export function BernoulliCalculator() {
  return <CalculatorTemplate config={bernoulliConfig} />;
}
