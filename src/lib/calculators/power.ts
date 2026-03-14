/**
 * @file power.ts
 * @description Solver for Electrical Power Calculator
 */

import type { SolveFn, FieldValues, SolveResult } from '@/types';
import { ohmPower } from '@/lib/formulas/electrical';

export const solve: SolveFn = (values: FieldValues): SolveResult => {
  const voltage = values.voltage?.value ?? undefined;
  const current = values.current?.value ?? undefined;
  const resistance = values.resistance?.value ?? undefined;
  const power = values.power?.value ?? undefined;

  const result = ohmPower({ voltage, current, resistance, power });

  const output: SolveResult = {};
  if (result.voltage !== undefined) output.voltage = result.voltage;
  if (result.current !== undefined) output.current = result.current;
  if (result.resistance !== undefined) output.resistance = result.resistance;
  if (result.power !== undefined) output.power = result.power;

  return output;
};
