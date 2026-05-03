/**
 * @file stores/calculatorStore.ts
 * @description Centralized Zustand store for calculator state management
 * Replaces useReducer + manual localStorage hydration with automatic persist
 * Optimized for re-render performance with selective subscriptions
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import type { CalculatorConfig, FieldValues } from '@/types';
import Big from 'big.js';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface FieldState {
  raw: string;
  unit: string;
}

export type FormState = Record<string, FieldState>;
export type ResultState = Record<string, unknown> | null;

export interface CalculatorData {
  fields: FormState;
  result: ResultState;
  lastAccessed: number;
}

export interface CalculatorStoreState {
  // Map of calculatorKey -> calculator data
  calculators: Map<string, CalculatorData>;

  // Loading state for hydration
  isHydrated: boolean;
}

export interface CalculatorStoreActions {
  // Field operations
  setFieldValue: (calculatorKey: string, fieldKey: string, raw: string) => void;
  setFieldUnit: (calculatorKey: string, fieldKey: string, unit: string) => void;

  // Result operations
  setResult: (calculatorKey: string, result: ResultState) => void;
  clearResult: (calculatorKey: string) => void;

  // Calculator lifecycle
  initializeCalculator: (calculatorKey: string, config: CalculatorConfig) => void;
  resetCalculator: (calculatorKey: string, config: CalculatorConfig) => void;
  cleanupCalculator: (calculatorKey: string) => void;

  // Utility
  getCalculatorData: (calculatorKey: string) => CalculatorData | undefined;
  getFieldState: (calculatorKey: string, fieldKey: string) => FieldState | undefined;

  // Hydration
  setHydrated: (value: boolean) => void;
}

export type CalculatorStore = CalculatorStoreState & CalculatorStoreActions;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const MAX_CALCULATORS = 10;

function buildInitialFormState(config: CalculatorConfig): FormState {
  const fields: FormState = {};
  for (const field of config.fields) {
    fields[field.key] = { raw: '', unit: field.units[0].symbol };
  }
  return fields;
}

// Custom storage wrapper to handle Map serialization
const customStorage = {
  getItem: (name: string): string | null => {
    const str = localStorage.getItem(name);
    if (!str) return null;

    try {
      const parsed = JSON.parse(str);
      // Convert plain objects back to Maps
      if (parsed.state?.calculators && !(parsed.state.calculators instanceof Map)) {
        parsed.state.calculators = new Map(Object.entries(parsed.state.calculators));
      }
      return JSON.stringify(parsed);
    } catch {
      return str;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      const parsed = JSON.parse(value);
      // Convert Maps to plain objects for serialization
      if (parsed.state?.calculators instanceof Map) {
        parsed.state.calculators = Object.fromEntries(parsed.state.calculators);
      }
      localStorage.setItem(name, JSON.stringify(parsed));
    } catch {
      localStorage.setItem(name, value);
    }
  },
  removeItem: (name: string): void => {
    localStorage.removeItem(name);
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────────────────────

export const useCalculatorStore = create<CalculatorStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        calculators: new Map(),
        isHydrated: false,

        // Set field value
        setFieldValue: (calculatorKey, fieldKey, raw) => {
          set(
            (state) => {
              const calcData = state.calculators.get(calculatorKey);
              if (!calcData) return state;

              const newCalculators = new Map(state.calculators);
              newCalculators.set(calculatorKey, {
                ...calcData,
                fields: {
                  ...calcData.fields,
                  [fieldKey]: { ...calcData.fields[fieldKey], raw },
                },
                result: null, // Clear result when input changes
                lastAccessed: Date.now(),
              });

              return { calculators: newCalculators };
            },
            false,
            `setFieldValue/${calculatorKey}/${fieldKey}`
          );
        },

        // Set field unit
        setFieldUnit: (calculatorKey, fieldKey, unit) => {
          set(
            (state) => {
              const calcData = state.calculators.get(calculatorKey);
              if (!calcData) return state;

              const newCalculators = new Map(state.calculators);
              newCalculators.set(calculatorKey, {
                ...calcData,
                fields: {
                  ...calcData.fields,
                  [fieldKey]: { ...calcData.fields[fieldKey], unit },
                },
                result: null, // Clear result when unit changes
                lastAccessed: Date.now(),
              });

              return { calculators: newCalculators };
            },
            false,
            `setFieldUnit/${calculatorKey}/${fieldKey}`
          );
        },

        // Set calculation result
        setResult: (calculatorKey, result) => {
          set(
            (state) => {
              const calcData = state.calculators.get(calculatorKey);
              if (!calcData) return state;

              const newCalculators = new Map(state.calculators);
              newCalculators.set(calculatorKey, {
                ...calcData,
                result,
                lastAccessed: Date.now(),
              });

              return { calculators: newCalculators };
            },
            false,
            `setResult/${calculatorKey}`
          );
        },

        // Clear result only
        clearResult: (calculatorKey) => {
          set(
            (state) => {
              const calcData = state.calculators.get(calculatorKey);
              if (!calcData) return state;

              const newCalculators = new Map(state.calculators);
              newCalculators.set(calculatorKey, {
                ...calcData,
                result: null,
                lastAccessed: Date.now(),
              });

              return { calculators: newCalculators };
            },
            false,
            `clearResult/${calculatorKey}`
          );
        },

        // Initialize calculator state from config
        initializeCalculator: (calculatorKey, config) => {
          set(
            (state) => {
              // Skip if already initialized, just update lastAccessed
              if (state.calculators.has(calculatorKey)) {
                const newCalculators = new Map(state.calculators);
                const existing = newCalculators.get(calculatorKey)!;
                newCalculators.set(calculatorKey, {
                  ...existing,
                  lastAccessed: Date.now(),
                });
                return { calculators: newCalculators };
              }

              const newCalculators = new Map(state.calculators);

              // LRU eviction: remove oldest calculator if at limit
              if (newCalculators.size >= MAX_CALCULATORS) {
                let oldestKey: string | null = null;
                let oldestTime = Infinity;
                for (const [key, data] of newCalculators) {
                  if (data.lastAccessed < oldestTime) {
                    oldestTime = data.lastAccessed;
                    oldestKey = key;
                  }
                }
                if (oldestKey) {
                  newCalculators.delete(oldestKey);
                }
              }

              newCalculators.set(calculatorKey, {
                fields: buildInitialFormState(config),
                result: null,
                lastAccessed: Date.now(),
              });

              return { calculators: newCalculators };
            },
            false,
            `initializeCalculator/${calculatorKey}`
          );
        },

        // Reset calculator to initial state
        resetCalculator: (calculatorKey, config) => {
          set(
            (state) => {
              const newCalculators = new Map(state.calculators);
              newCalculators.set(calculatorKey, {
                fields: buildInitialFormState(config),
                result: null,
                lastAccessed: Date.now(),
              });

              return { calculators: newCalculators };
            },
            false,
            `resetCalculator/${calculatorKey}`
          );
        },

        // Cleanup calculator from store (called on unmount)
        cleanupCalculator: (calculatorKey) => {
          set(
            (state) => {
              if (!state.calculators.has(calculatorKey)) return state;

              const newCalculators = new Map(state.calculators);
              newCalculators.delete(calculatorKey);

              return { calculators: newCalculators };
            },
            false,
            `cleanupCalculator/${calculatorKey}`
          );
        },

        // Get calculator data (for use in selectors)
        getCalculatorData: (calculatorKey) => {
          return get().calculators.get(calculatorKey);
        },

        // Get specific field state
        getFieldState: (calculatorKey, fieldKey) => {
          const calcData = get().calculators.get(calculatorKey);
          return calcData?.fields[fieldKey];
        },

        // Set hydration state
        setHydrated: (value) => {
          set({ isHydrated: value }, false, 'setHydrated');
        },
      }),
      {
        name: 'calculator-storage',
        storage: createJSONStorage(() => customStorage),
        partialize: (state) => ({
          calculators: Object.fromEntries(state.calculators),
          isHydrated: false, // Don't persist hydration state
        }),
        onRehydrateStorage: () => (state) => {
          // Restore Map from plain object after rehydration
          if (state && state.calculators) {
            const entries = Object.entries(state.calculators) as [string, CalculatorData][];
            // Migration: add lastAccessed for old data without it
            const migratedEntries: [string, CalculatorData][] = entries.map(([key, data]) => [
              key,
              {
                ...data,
                lastAccessed: data.lastAccessed || Date.now(),
              },
            ]);
            state.calculators = new Map(migratedEntries);
          }
          // Set hydrated flag after rehydration completes
          if (state) {
            state.isHydrated = true;
          }
        },
        version: 1,
      }
    ),
    { name: 'calculatorStore' }
  )
);

// ─────────────────────────────────────────────────────────────────────────────
// Selectors (for optimized re-renders)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook to get calculator data
 * Use this for components that need the full calculator state
 */
export function useCalculatorData(calculatorKey: string): CalculatorData | undefined {
  return useCalculatorStore((state: CalculatorStore) => state.calculators.get(calculatorKey));
}

/**
 * Hook to get specific field state
 */
export function useFieldState(calculatorKey: string, fieldKey: string): FieldState | undefined {
  return useCalculatorStore(
    (state: CalculatorStore) => state.calculators.get(calculatorKey)?.fields[fieldKey]
  );
}

/**
 * Hook to get calculator result
 */
export function useCalculatorResult(calculatorKey: string): ResultState {
  return useCalculatorStore(
    (state: CalculatorStore) => state.calculators.get(calculatorKey)?.result ?? null
  );
}

/**
 * Hook to get hydration status
 */
export function useCalculatorHydrated(): boolean {
  return useCalculatorStore((state: CalculatorStore) => state.isHydrated);
}

// ─────────────────────────────────────────────────────────────────────────────
// Field Values Parser (for solver)
// ─────────────────────────────────────────────────────────────────────────────

export function parseFieldValues(fields: FormState, config: CalculatorConfig): FieldValues {
  const values: FieldValues = {};

  for (const field of config.fields) {
    const fs = fields[field.key];
    const val = fs?.raw?.trim() ?? '';

    if (val === '') {
      values[field.key] = { value: null, unit: fs?.unit ?? field.units[0].symbol };
    } else {
      try {
        const parsed = new Big(val).toNumber();
        values[field.key] = { value: parsed, unit: fs?.unit ?? field.units[0].symbol };
      } catch {
        values[field.key] = { value: null, unit: fs?.unit ?? field.units[0].symbol };
      }
    }
  }

  return values;
}
