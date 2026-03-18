/**
 * @file types/calculator.ts
 * @description Re-export shim — all calculator types have been consolidated into `@/types`.
 *
 * @deprecated Import directly from `@/types` instead:
 *   import type { CalculatorConfig, FieldValues, SolveResult } from '@/types';
 *
 * This file exists solely for backward compatibility and will be removed in a future cleanup.
 */

export type {
  UnitOption,
  CalculatorField,
  FieldConfig,
  FieldValue,
  FieldValues,
  SolveResult,
  SolveFn,
  CalculatorConfig,
  CalculatorVisualProps,
} from '@/types';
