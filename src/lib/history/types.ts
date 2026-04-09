/**
 * @file types.ts
 * @description Type definitions for user history and calculation tracking
 */

import type { LocaleCode } from '@/types';

/**
 * Calculation history entry
 */
export interface CalculationHistory {
  id: string;
  userId: string;
  calculatorId: string;
  calculatorName: string;
  inputs: Record<string, { value: number | null; unit: string }>;
  outputs: Record<string, unknown>;
  timestamp: string;
  locale: LocaleCode;
  isFavorite: boolean;
  tags?: string[];
  notes?: string;
}

/**
 * History filter options
 */
export interface HistoryFilter {
  calculatorId?: string;
  dateFrom?: string;
  dateTo?: string;
  isFavorite?: boolean;
  tags?: string[];
  searchTerm?: string;
}

/**
 * History sort options
 */
export type HistorySort = 'timestamp' | 'calculatorId' | 'frequency';
export type SortOrder = 'asc' | 'desc';

export interface HistorySortOptions {
  sortBy: HistorySort;
  order: SortOrder;
}

/**
 * History statistics
 */
export interface HistoryStats {
  totalCalculations: number;
  favoriteCalculations: number;
  mostUsedCalculator: string;
  calculationsByCalculator: Record<string, number>;
  calculationsByDate: Record<string, number>;
}
