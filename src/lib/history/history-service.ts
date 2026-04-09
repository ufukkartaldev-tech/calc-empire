/**
 * @file history-service.ts
 * @description Service for managing user calculation history
 */

import type {
  CalculationHistory,
  HistoryFilter,
  HistorySortOptions,
  HistoryStats,
} from './types';

/**
 * Service class for managing calculation history
 * This will be integrated with Supabase/Firebase in the future
 */
export class HistoryService {
  private static instance: HistoryService;
  private history: CalculationHistory[] = [];
  private readonly STORAGE_KEY = 'calc_history';

  private constructor() {
    this.loadHistory();
  }

  static getInstance(): HistoryService {
    if (!HistoryService.instance) {
      HistoryService.instance = new HistoryService();
    }
    return HistoryService.instance;
  }

  /**
   * Load history from localStorage
   */
  private loadHistory(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.history = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
      this.history = [];
    }
  }

  /**
   * Save history to localStorage
   */
  private saveHistory(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.history));
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  }

  /**
   * Add a calculation to history
   */
  addCalculation(entry: Omit<CalculationHistory, 'id' | 'timestamp'>): CalculationHistory {
    const newEntry: CalculationHistory = {
      ...entry,
      id: `calc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    this.history.unshift(newEntry);
    
    // Limit history to 1000 entries
    if (this.history.length > 1000) {
      this.history = this.history.slice(0, 1000);
    }

    this.saveHistory();
    return newEntry;
  }

  /**
   * Get calculation history with optional filtering and sorting
   */
  getHistory(filter?: HistoryFilter, sort?: HistorySortOptions): CalculationHistory[] {
    let filtered = [...this.history];

    // Apply filters
    if (filter) {
      if (filter.calculatorId) {
        filtered = filtered.filter(h => h.calculatorId === filter.calculatorId);
      }
      if (filter.dateFrom) {
        filtered = filtered.filter(h => h.timestamp >= filter.dateFrom!);
      }
      if (filter.dateTo) {
        filtered = filtered.filter(h => h.timestamp <= filter.dateTo!);
      }
      if (filter.isFavorite !== undefined) {
        filtered = filtered.filter(h => h.isFavorite === filter.isFavorite);
      }
      if (filter.tags && filter.tags.length > 0) {
        filtered = filtered.filter(h =>
          h.tags?.some(tag => filter.tags!.includes(tag))
        );
      }
      if (filter.searchTerm) {
        const term = filter.searchTerm.toLowerCase();
        filtered = filtered.filter(h =>
          h.calculatorName.toLowerCase().includes(term) ||
          h.notes?.toLowerCase().includes(term)
        );
      }
    }

    // Apply sorting
    if (sort) {
      filtered.sort((a, b) => {
        let comparison = 0;
        
        switch (sort.sortBy) {
          case 'timestamp':
            comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
            break;
          case 'calculatorId':
            comparison = a.calculatorId.localeCompare(b.calculatorId);
            break;
          case 'frequency':
            // This would require counting frequency, for now use timestamp
            comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
            break;
        }

        return sort.order === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }

  /**
   * Get a specific calculation by ID
   */
  getCalculationById(id: string): CalculationHistory | null {
    return this.history.find(h => h.id === id) || null;
  }

  /**
   * Update a calculation entry
   */
  updateCalculation(id: string, updates: Partial<CalculationHistory>): CalculationHistory | null {
    const index = this.history.findIndex(h => h.id === id);
    if (index === -1) return null;

    this.history[index] = { ...this.history[index], ...updates };
    this.saveHistory();
    return this.history[index];
  }

  /**
   * Delete a calculation from history
   */
  deleteCalculation(id: string): boolean {
    const index = this.history.findIndex(h => h.id === id);
    if (index === -1) return false;

    this.history.splice(index, 1);
    this.saveHistory();
    return true;
  }

  /**
   * Clear all history
   */
  clearHistory(): void {
    this.history = [];
    this.saveHistory();
  }

  /**
   * Get history statistics
   */
  getStats(): HistoryStats {
    const calculationsByCalculator: Record<string, number> = {};
    const calculationsByDate: Record<string, number> = {};

    this.history.forEach(entry => {
      // Count by calculator
      calculationsByCalculator[entry.calculatorId] =
        (calculationsByCalculator[entry.calculatorId] || 0) + 1;

      // Count by date (YYYY-MM-DD)
      const date = entry.timestamp.split('T')[0];
      calculationsByDate[date] = (calculationsByDate[date] || 0) + 1;
    });

    // Find most used calculator
    const mostUsedCalculator = Object.entries(calculationsByCalculator)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || '';

    return {
      totalCalculations: this.history.length,
      favoriteCalculations: this.history.filter(h => h.isFavorite).length,
      mostUsedCalculator,
      calculationsByCalculator,
      calculationsByDate,
    };
  }

  /**
   * Toggle favorite status
   */
  toggleFavorite(id: string): CalculationHistory | null {
    const entry = this.getCalculationById(id);
    if (!entry) return null;

    return this.updateCalculation(id, { isFavorite: !entry.isFavorite });
  }
}

// Export singleton instance
export const historyService = HistoryService.getInstance();
