/**
 * @file cryptoPnl.ts
 * @description Solver for Crypto P&L Calculator
 */

import type { SolveFn, FieldValues, SolveResult } from '@/types';

export const solve: SolveFn = (values: FieldValues): SolveResult => {
  const entryPrice = values.entryPrice?.value;
  const exitPrice = values.exitPrice?.value;
  const quantity = values.quantity?.value;
  const leverage = values.leverage?.value ?? 1;

  if (entryPrice === null || exitPrice === null || quantity === null) {
    throw new Error('Entry price, exit price, and quantity are required');
  }

  if (entryPrice <= 0 || exitPrice <= 0 || quantity <= 0 || leverage <= 0) {
    throw new Error('Invalid parameter values');
  }

  const priceDiff = exitPrice - entryPrice;
  const pnl = priceDiff * quantity * leverage;
  const pnlPercent = (priceDiff / entryPrice) * 100 * leverage;
  const roi = pnlPercent;

  return {
    pnl,
    pnlPercent,
    roi,
  };
};
