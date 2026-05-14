'use client';

import React from 'react';
import type { CalculatorVisualProps } from '@/types';
import { KirchhoffDiagram } from '@/components/calculators/electrical/KirchhoffDiagram';

export function KirchhoffVisualizer({ result }: CalculatorVisualProps) {
  return <KirchhoffDiagram hasResults={!!result} />;
}
