/**
 * @file history-service.ts
 * @description Service for managing user calculation history with Supabase integration
 */

import { supabase } from '@/lib/auth/supabase-client';
import type { CalculationHistory, HistoryFilter, HistorySortOptions, HistoryStats } from './types';

/**
 * Service class for managing calculation history
 * Integrated with Supabase for cloud persistence
 * Falls back to localStorage when user is not authenticated or Supabase unavailable
 */
export class HistoryService {
  private static instance: HistoryService;
  private localHistory: CalculationHistory[] = [];
  private readonly STORAGE_KEY = 'calc_history';
  private currentUserId: string | null = null;

  private constructor() {
    this.loadLocalHistory();
    this.setupAuthListener();
  }

  static getInstance(): HistoryService {
    if (!HistoryService.instance) {
      HistoryService.instance = new HistoryService();
    }
    return HistoryService.instance;
  }

  /**
   * Set up Supabase auth state change listener
   */
  private setupAuthListener(): void {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        this.currentUserId = session.user.id;
      } else {
        this.currentUserId = null;
      }
    });
  }

  /**
   * Load history from localStorage (fallback for unauthenticated users)
   */
  private loadLocalHistory(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.localHistory = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load local history:', error);
      this.localHistory = [];
    }
  }

  /**
   * Save history to localStorage (fallback for unauthenticated users)
   */
  private saveLocalHistory(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.localHistory));
    } catch (error) {
      console.error('Failed to save local history:', error);
    }
  }

  /**
   * Check if user is authenticated with Supabase
   */
  private async isAuthenticated(): Promise<boolean> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return !!session?.user;
  }

  /**
   * Get current user ID
   */
  private async getCurrentUserId(): Promise<string | null> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.user?.id || null;
  }

  /**
   * Add a calculation to history
   */
  async addCalculation(
    entry: Omit<CalculationHistory, 'id' | 'timestamp'>
  ): Promise<CalculationHistory> {
    const newEntry: CalculationHistory = {
      ...entry,
      id: `calc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    const userId = await this.getCurrentUserId();

    if (userId) {
      // Save to Supabase
      const { error } = await supabase.from('calculation_history').insert({
        id: newEntry.id,
        user_id: userId,
        calculator_id: entry.calculatorId,
        calculator_name: entry.calculatorName,
        inputs: entry.inputs,
        outputs: entry.outputs,
        timestamp: newEntry.timestamp,
        locale: entry.locale,
        is_favorite: entry.isFavorite,
        tags: entry.tags || [],
        notes: entry.notes || null,
      });

      if (error) {
        console.error('Failed to save to Supabase, falling back to localStorage:', error);
        this.localHistory.unshift(newEntry);
        this.saveLocalHistory();
      }
    } else {
      // Save to localStorage for unauthenticated users
      this.localHistory.unshift(newEntry);

      // Limit local history to 100 entries
      if (this.localHistory.length > 100) {
        this.localHistory = this.localHistory.slice(0, 100);
      }

      this.saveLocalHistory();
    }

    return newEntry;
  }

  /**
   * Get calculation history with optional filtering and sorting
   */
  async getHistory(
    filter?: HistoryFilter,
    sort?: HistorySortOptions
  ): Promise<CalculationHistory[]> {
    const userId = await this.getCurrentUserId();

    let filtered: CalculationHistory[];

    if (userId) {
      // Fetch from Supabase
      let query = supabase.from('calculation_history').select('*').eq('user_id', userId);

      // Apply filters
      if (filter?.calculatorId) {
        query = query.eq('calculator_id', filter.calculatorId);
      }
      if (filter?.dateFrom) {
        query = query.gte('timestamp', filter.dateFrom);
      }
      if (filter?.dateTo) {
        query = query.lte('timestamp', filter.dateTo);
      }
      if (filter?.isFavorite !== undefined) {
        query = query.eq('is_favorite', filter.isFavorite);
      }

      // Order by timestamp by default
      query = query.order('timestamp', { ascending: sort?.order === 'asc' });

      const { data, error } = await query;

      if (error) {
        console.error('Failed to fetch from Supabase:', error);
        filtered = [...this.localHistory];
      } else {
        filtered = (data || []).map((item) => ({
          id: item.id,
          userId: item.user_id,
          calculatorId: item.calculator_id,
          calculatorName: item.calculator_name,
          inputs: item.inputs as Record<string, { value: number | null; unit: string }>,
          outputs: item.outputs as Record<string, unknown>,
          timestamp: item.timestamp,
          locale: item.locale as 'en' | 'tr' | 'de',
          isFavorite: item.is_favorite,
          tags: item.tags,
          notes: item.notes || undefined,
        }));
      }
    } else {
      // Use localStorage for unauthenticated users
      filtered = [...this.localHistory];
    }

    // Apply additional client-side filters
    if (filter) {
      if (filter.tags && filter.tags.length > 0) {
        filtered = filtered.filter((h) => h.tags?.some((tag) => filter.tags!.includes(tag)));
      }
      if (filter.searchTerm) {
        const term = filter.searchTerm.toLowerCase();
        filtered = filtered.filter(
          (h) =>
            h.calculatorName.toLowerCase().includes(term) || h.notes?.toLowerCase().includes(term)
        );
      }
    }

    // Apply sorting
    if (sort && sort.sortBy !== 'timestamp') {
      filtered.sort((a, b) => {
        let comparison = 0;

        switch (sort.sortBy) {
          case 'calculatorId':
            comparison = a.calculatorId.localeCompare(b.calculatorId);
            break;
          case 'frequency':
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
  async getCalculationById(id: string): Promise<CalculationHistory | null> {
    const userId = await this.getCurrentUserId();

    if (userId) {
      const { data, error } = await supabase
        .from('calculation_history')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return this.localHistory.find((h) => h.id === id) || null;
      }

      return {
        id: data.id,
        userId: data.user_id,
        calculatorId: data.calculator_id,
        calculatorName: data.calculator_name,
        inputs: data.inputs as Record<string, { value: number | null; unit: string }>,
        outputs: data.outputs as Record<string, unknown>,
        timestamp: data.timestamp,
        locale: data.locale as 'en' | 'tr' | 'de',
        isFavorite: data.is_favorite,
        tags: data.tags,
        notes: data.notes || undefined,
      };
    }

    return this.localHistory.find((h) => h.id === id) || null;
  }

  /**
   * Update a calculation entry
   */
  async updateCalculation(
    id: string,
    updates: Partial<CalculationHistory>
  ): Promise<CalculationHistory | null> {
    const userId = await this.getCurrentUserId();

    if (userId) {
      const dbUpdates: Partial<{
        is_favorite: boolean;
        tags: string[];
        notes: string | null;
        outputs: Record<string, unknown>;
      }> = {};

      if (updates.isFavorite !== undefined) dbUpdates.is_favorite = updates.isFavorite;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null;
      if (updates.outputs !== undefined) dbUpdates.outputs = updates.outputs;

      const { data, error } = await supabase
        .from('calculation_history')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Failed to update in Supabase:', error);
      } else if (data) {
        return {
          id: data.id,
          userId: data.user_id,
          calculatorId: data.calculator_id,
          calculatorName: data.calculator_name,
          inputs: data.inputs as Record<string, { value: number | null; unit: string }>,
          outputs: data.outputs as Record<string, unknown>,
          timestamp: data.timestamp,
          locale: data.locale as 'en' | 'tr' | 'de',
          isFavorite: data.is_favorite,
          tags: data.tags,
          notes: data.notes || undefined,
        };
      }
    }

    // Fallback to localStorage
    const index = this.localHistory.findIndex((h) => h.id === id);
    if (index === -1) return null;

    this.localHistory[index] = { ...this.localHistory[index], ...updates };
    this.saveLocalHistory();
    return this.localHistory[index];
  }

  /**
   * Delete a calculation from history
   */
  async deleteCalculation(id: string): Promise<boolean> {
    const userId = await this.getCurrentUserId();

    if (userId) {
      const { error } = await supabase
        .from('calculation_history')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Failed to delete from Supabase:', error);
      } else {
        return true;
      }
    }

    // Fallback to localStorage
    const index = this.localHistory.findIndex((h) => h.id === id);
    if (index === -1) return false;

    this.localHistory.splice(index, 1);
    this.saveLocalHistory();
    return true;
  }

  /**
   * Clear all history
   */
  async clearHistory(): Promise<void> {
    const userId = await this.getCurrentUserId();

    if (userId) {
      const { error } = await supabase.from('calculation_history').delete().eq('user_id', userId);

      if (error) {
        console.error('Failed to clear Supabase history:', error);
      }
    }

    // Always clear local history
    this.localHistory = [];
    this.saveLocalHistory();
  }

  /**
   * Get history statistics
   */
  async getStats(): Promise<HistoryStats> {
    const history = await this.getHistory();
    const calculationsByCalculator: Record<string, number> = {};
    const calculationsByDate: Record<string, number> = {};

    history.forEach((entry) => {
      // Count by calculator
      calculationsByCalculator[entry.calculatorId] =
        (calculationsByCalculator[entry.calculatorId] || 0) + 1;

      // Count by date (YYYY-MM-DD)
      const date = entry.timestamp.split('T')[0];
      calculationsByDate[date] = (calculationsByDate[date] || 0) + 1;
    });

    // Find most used calculator
    const mostUsedCalculator =
      Object.entries(calculationsByCalculator).sort(([, a], [, b]) => b - a)[0]?.[0] || '';

    return {
      totalCalculations: history.length,
      favoriteCalculations: history.filter((h) => h.isFavorite).length,
      mostUsedCalculator,
      calculationsByCalculator,
      calculationsByDate,
    };
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(id: string): Promise<CalculationHistory | null> {
    const entry = await this.getCalculationById(id);
    if (!entry) return null;

    return this.updateCalculation(id, { isFavorite: !entry.isFavorite });
  }

  /**
   * Migrate local history to Supabase (call after user signs in)
   */
  async migrateLocalHistoryToSupabase(): Promise<number> {
    const userId = await this.getCurrentUserId();
    if (!userId || this.localHistory.length === 0) return 0;

    let migratedCount = 0;

    for (const entry of this.localHistory) {
      const { error } = await supabase.from('calculation_history').insert({
        id: entry.id,
        user_id: userId,
        calculator_id: entry.calculatorId,
        calculator_name: entry.calculatorName,
        inputs: entry.inputs,
        outputs: entry.outputs,
        timestamp: entry.timestamp,
        locale: entry.locale,
        is_favorite: entry.isFavorite,
        tags: entry.tags || [],
        notes: entry.notes || null,
      });

      if (!error) {
        migratedCount++;
      }
    }

    if (migratedCount > 0) {
      this.localHistory = [];
      this.saveLocalHistory();
    }

    return migratedCount;
  }
}

// Export singleton instance
export const historyService = HistoryService.getInstance();
