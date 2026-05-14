import fs from 'fs/promises';
import path from 'path';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

const rl = readline.createInterface({ input, output });

async function generate() {
  console.log('🚀 Calculator Scaffolder\n');

  const toolId = (await rl.question('Tool ID (camelCase, e.g. stressStrain): ')).trim();
  const displayName = (await rl.question('Display Name (e.g. Stress-Strain): ')).trim();
  const category = (await rl.question('Category (electrical/mechanical/civil/math/chemistry/fluid/software): ')).trim();

  if (!toolId || !category) {
    console.error('❌ Tool ID and Category are required!');
    process.exit(1);
  }

  const pascalToolId = toolId.charAt(0).toUpperCase() + toolId.slice(1);
  const solverFileName = `${toolId}.ts`;
  const visualizerFileName = `${pascalToolId}Visualizer.tsx`;

  const solverPath = path.join('src/lib/calculators', solverFileName);
  const visualizerPath = path.join('src/components/visualizers', visualizerFileName);

  // 1. Create Solver Stub
  const solverTemplate = `/**
 * @file ${solverFileName}
 * @description Solver and Config for ${displayName}
 */

import type { CalculatorConfig, FieldValues, SolveResult } from '@/types';
import { NO_UNIT } from '@/constants';
import { ${pascalToolId}Visualizer } from '@/components/visualizers/${pascalToolId}Visualizer';

// ─────────────────────────────────────────────────────────────────────────────
// Solve Function
// ─────────────────────────────────────────────────────────────────────────────

export function solve(values: FieldValues): SolveResult {
  // TODO: Implement calculation logic
  const input1 = values.input1?.value ?? 0;
  
  return {
    result: input1 * 2, // Example
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Config Export
// ─────────────────────────────────────────────────────────────────────────────

export const ${toolId}Config: CalculatorConfig = {
  id: '${toolId}',
  titleKey: 'Dashboard.${toolId}Title',
  descriptionKey: 'Dashboard.${toolId}Desc',
  visual: ${pascalToolId}Visualizer,
  fields: [
    {
      key: 'input1',
      labelKey: 'Common.value',
      units: NO_UNIT,
    },
  ],
  solverKey: '${toolId}',
  calculationMode: 'calculateAll',
};
`;

  // 2. Create Visualizer Stub
  const visualizerTemplate = `'use client';

import React from 'react';
import type { CalculatorVisualProps } from '@/types';

/**
 * Visualizer for ${displayName}
 */
export function ${pascalToolId}Visualizer({ result }: CalculatorVisualProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="relative">
        <span className="text-4xl">📐</span>
        {result && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        )}
      </div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-3">
        ${displayName}
      </p>
    </div>
  );
}
`;

  try {
    await fs.writeFile(solverPath, solverTemplate);
    console.log(`✅ Created solver: ${solverPath}`);

    await fs.writeFile(visualizerPath, visualizerTemplate);
    console.log(`✅ Created visualizer: ${visualizerPath}`);

    // 3. Update SOLVER_MAP in src/constants/tools.ts
    const toolsPath = 'src/constants/tools.ts';
    let toolsContent = await fs.readFile(toolsPath, 'utf8');
    
    const solverMapEntry = `  ${toolId}: '${toolId}Solve',`;
    
    // Find the closing brace of SOLVER_MAP
    const closingBraceMatch = toolsContent.match(/\n\s*\}\s*as const;/);
    if (closingBraceMatch) {
      const insertionPoint = closingBraceMatch.index;
      toolsContent = toolsContent.slice(0, insertionPoint) + `\n${solverMapEntry}` + toolsContent.slice(insertionPoint);
      await fs.writeFile(toolsPath, toolsContent);
      console.log(`✅ Updated SOLVER_MAP in ${toolsPath}`);
    } else {
      console.warn(`⚠️ Could not automatically update SOLVER_MAP in ${toolsPath}. Please add manually.`);
    }

    // 4. Update src/lib/calculators/index.ts
    const indexPath = 'src/lib/calculators/index.ts';
    const indexExport = `export { solve as ${toolId}Solve } from './${toolId}';\n`;
    await fs.appendFile(indexPath, indexExport);
    console.log(`✅ Updated barrel export in ${indexPath}`);

    console.log('\n🎉 Successfully scaffolded new calculator!');
    console.log(`Next steps:
1. Add translations to src/messages/*.json under "Dashboard"
2. Update TOOLS_CONFIG in src/config/tools.config.ts
3. Implement the formula in src/lib/formulas/
4. Implement the solver logic in ${solverPath}`);

  } catch (error) {
    console.error('❌ Error generating files:', error);
  } finally {
    rl.close();
  }
}

generate();
