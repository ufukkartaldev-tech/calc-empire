/**
 * @file springConstant.ts
 * @description Hooke's Law calculator (F = k * x)
 */

import type { CalculatorConfig, FieldValues, SolveResult } from '@/types';
import { hookesLaw } from '@/lib/formulas/mechanical';

export function solve(values: FieldValues): SolveResult {
  const f = values['force']?.value;
  const k = values['k']?.value;
  const x = values['displacement']?.value;

  const result = hookesLaw({
    force: f === null ? undefined : f,
    k: k === null ? undefined : k,
    displacement: x === null ? undefined : x,
  });

  return {
    force: result.force,
    k: result.k,
    displacement: result.displacement,
  };
}

export const springConstantConfig: CalculatorConfig = {
  id: 'spring-constant',
  titleKey: 'SpringConstant.title',
  descriptionKey: 'SpringConstant.description',
  fields: [
    { key: 'force', labelKey: 'SpringConstant.force', units: [{ label: 'N', symbol: '' }] },
    { key: 'k', labelKey: 'SpringConstant.k', units: [{ label: 'N/m', symbol: '' }] },
    {
      key: 'displacement',
      labelKey: 'SpringConstant.displacement',
      units: [
        { label: 'm', symbol: '' },
        { label: 'mm', symbol: 'm' },
      ],
    },
  ],
  solverKey: 'springConstant',
};
