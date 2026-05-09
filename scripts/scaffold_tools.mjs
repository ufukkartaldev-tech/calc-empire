import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basePath = path.resolve(__dirname, '../src/components/calculators');

const files = {
  'electrical/KirchhoffCalculator.tsx': 'KirchhoffCalculator',
  'electrical/PowerCalculator.tsx': 'PowerCalculator',
  'electrical/BodePlotVisualizer.tsx': 'BodePlotVisualizer',
  'mechanical/StressStrainCalculator.tsx': 'StressStrainCalculator',
  'mechanical/ShearMomentVisualizer.tsx': 'ShearMomentVisualizer',
  'fluid/BernoulliCalculator.tsx': 'BernoulliCalculator',
  'fluid/PressureLossCalculator.tsx': 'PressureLossCalculator',
  'statistics/BasicStatisticsCalculator.tsx': 'BasicStatisticsCalculator',
  'statistics/DiscreteDistributionVisualizer.tsx': 'DiscreteDistributionVisualizer',
  'statistics/DataVisualizer.tsx': 'DataVisualizer',
  'mathematics/CalculusCalculator.tsx': 'CalculusCalculator',
  'mathematics/MatrixCalculator.tsx': 'MatrixCalculator',
  'mathematics/GeometryCalculator.tsx': 'GeometryCalculator',
  'mathematics/FunctionPlotVisualizer.tsx': 'FunctionPlotVisualizer',
  'converters/UnitConverter.tsx': 'UnitConverter',
};

const template = (name) => `'use client';

import React from 'react';

export function ${name}() {
  return (
    <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm flex flex-col items-center justify-center min-h-[300px] text-center">
      <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
        <span className="text-3xl">🚧</span>
      </div>
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">${name}</h2>
      <p className="text-slate-500 dark:text-slate-400">Bu araç araştırma & geliştirme (Ar-Ge) aşamasındadır. Çok yakında eklenecek!</p>
    </div>
  );
}
`;

Object.entries(files).forEach(([filepath, name]) => {
  const fullPath = path.join(basePath, filepath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, template(name));
});

console.log('Created placeholder components.');

const exportsContent = `// Electrical
export * from './electrical/OhmCalculator';
export * from './electrical/ResistorVisualizer';
export * from './electrical/KirchhoffCalculator';
export * from './electrical/PowerCalculator';
export * from './electrical/BodePlotVisualizer';

// Mechanical
export * from './mechanical/BeamDeflectionVisualizer';
export * from './mechanical/StressStrainCalculator';
export * from './mechanical/ShearMomentVisualizer';

// Fluid
export * from './fluid/BernoulliCalculator';
export * from './fluid/PressureLossCalculator';

// Statistics
export * from './statistics/NormalDistributionChart';
export * from './statistics/BasicStatisticsCalculator';
export * from './statistics/DiscreteDistributionVisualizer';
export * from './statistics/DataVisualizer';

// Mathematics
export * from './mathematics/CalculusCalculator';
export * from './mathematics/MatrixCalculator';
export * from './mathematics/GeometryCalculator';
export * from './mathematics/FunctionPlotVisualizer';

// Converters
export * from './converters/UnitConverter';
`;

fs.writeFileSync(path.join(basePath, 'index.ts'), exportsContent);
console.log('Updated index.ts');
