'use client';

import React from 'react';
import type { CalculatorConfig } from '@/types';
import CalculatorTemplate from '@/components/CalculatorTemplate';
import { ShearMomentVisual } from './ShearMomentVisual';

const shearMomentConfig: CalculatorConfig = {
  id: 'shear-moment',
  titleKey: 'ShearMoment.title',
  descriptionKey: 'ShearMoment.subtitle',
  visual: ShearMomentVisual,
  fields: [
    {
      key: 'load',
      labelKey: 'ShearMoment.load',
      units: [{ label: 'N', symbol: '' }, { label: 'kN', symbol: 'k' }],
    },
    {
      key: 'length',
      labelKey: 'ShearMoment.length',
      units: [{ label: 'm', symbol: '' }, { label: 'cm', symbol: 'c' }, { label: 'mm', symbol: 'm' }],
    },
    {
      key: 'position',
      labelKey: 'ShearMoment.position',
      units: [{ label: 'm', symbol: '' }, { label: 'cm', symbol: 'c' }, { label: 'mm', symbol: 'm' }],
    },
  ],
  solverKey: 'shearMoment',
  referenceKey: 'ToolReference.shearMoment',
};

export function ShearMomentCalculator() {
  return <CalculatorTemplate config={shearMomentConfig} />;
}
