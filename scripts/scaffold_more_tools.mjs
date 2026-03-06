import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basePath = path.resolve(__dirname, '../src/components/calculators');

const files = {
    // Civil
    'civil/ConcreteSectionCalculator.tsx': 'ConcreteSectionCalculator',
    'civil/SoilMechanicsCalculator.tsx': 'SoilMechanicsCalculator',

    // Software
    'software/BaseConverter.tsx': 'BaseConverter',
    'software/CronParser.tsx': 'CronParser',
    'software/JsonFormatter.tsx': 'JsonFormatter',

    // Chemistry
    'chemistry/PeriodicTableVisualizer.tsx': 'PeriodicTableVisualizer',
    'chemistry/IdealGasCalculator.tsx': 'IdealGasCalculator',

    // Finance
    'finance/CompoundInterestCalculator.tsx': 'CompoundInterestCalculator',
    'finance/CryptoPnlCalculator.tsx': 'CryptoPnlCalculator',
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
    if (!fs.existsSync(fullPath)) {
        fs.writeFileSync(fullPath, template(name));
    }
});

console.log('Created placeholder components for new categories.');

let exportsContent = fs.readFileSync(path.join(basePath, 'index.ts'), 'utf8');

const newExports = `
// Civil
export * from './civil/ConcreteSectionCalculator';
export * from './civil/SoilMechanicsCalculator';

// Software
export * from './software/BaseConverter';
export * from './software/CronParser';
export * from './software/JsonFormatter';

// Chemistry
export * from './chemistry/PeriodicTableVisualizer';
export * from './chemistry/IdealGasCalculator';

// Finance
export * from './finance/CompoundInterestCalculator';
export * from './finance/CryptoPnlCalculator';
`;

if (!exportsContent.includes('ConcreteSectionCalculator')) {
    fs.appendFileSync(path.join(basePath, 'index.ts'), newExports);
    console.log('Updated index.ts with new exports.');
}
