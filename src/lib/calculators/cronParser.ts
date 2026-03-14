/**
 * @file cronParser.ts
 * @description Solver for Cron Expression Parser
 */

import type { SolveFn, FieldValues, SolveResult } from '@/types';

export const solve: SolveFn = (values: FieldValues): SolveResult => {
  const cronExpression = values.cronExpression?.value;

  if (!cronExpression || typeof cronExpression !== 'string') {
    throw new Error('Cron expression is required');
  }

  const parts = cronExpression.trim().split(/\s+/);

  if (parts.length < 5 || parts.length > 7) {
    throw new Error('Invalid cron expression format');
  }

  // Basic parsing (simplified)
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  return {
    minute,
    hour,
    dayOfMonth,
    month,
    dayOfWeek,
    description: `Runs at ${hour}:${minute}`,
  };
};
