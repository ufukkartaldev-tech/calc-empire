import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCalculatorStore } from '../calculatorStore';
import type { CalculatorConfig, ToolId } from '@/types';

const mockConfig: CalculatorConfig = {
  id: 'test-calc',
  solverKey: 'test-calc',
  fields: [
    { key: 'f1', labelKey: 'f1', units: [{ label: 'u1', symbol: 'u1' }] },
    { key: 'f2', labelKey: 'f2', units: [{ label: 'u2', symbol: 'u2' }] },
  ],
} as unknown as CalculatorConfig;

describe('calculatorStore', () => {
  beforeEach(() => {
    useCalculatorStore.setState({ calculators: new Map(), isHydrated: true });
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('initializes a calculator with initial form state', () => {
    const store = useCalculatorStore.getState();
    const calcId = 'ohm' as ToolId;
    store.initializeCalculator(calcId, mockConfig);

    const data = store.getCalculatorData(calcId);
    expect(data).toBeDefined();
    expect(data?.fields['f1']).toEqual({ raw: '', unit: 'u1' });
    expect(data?.fields['f2']).toEqual({ raw: '', unit: 'u2' });
  });

  it('sets field value and clears result', () => {
    const store = useCalculatorStore.getState();
    const calcId = 'ohm' as ToolId;
    store.initializeCalculator(calcId, mockConfig);

    // Pre-set a result
    store.setResult(calcId, { res: 100 });
    expect(store.getCalculatorData(calcId)?.result).toEqual({ res: 100 });

    // Update a field
    store.setFieldValue(calcId, 'f1', '10');

    const data = store.getCalculatorData(calcId);
    expect(data?.fields['f1'].raw).toBe('10');
    expect(data?.result).toBeNull();
  });

  it('sets field unit and clears result', () => {
    const store = useCalculatorStore.getState();
    const calcId = 'ohm' as ToolId;
    store.initializeCalculator(calcId, mockConfig);

    store.setResult(calcId, { res: 100 });

    // Update a unit
    store.setFieldUnit(calcId, 'f1', 'u2');

    const data = store.getCalculatorData(calcId);
    expect(data?.fields['f1'].unit).toBe('u2');
    expect(data?.result).toBeNull();
  });

  it('performs LRU eviction when limit (10) is reached', () => {
    vi.useFakeTimers();
    const store = useCalculatorStore.getState();

    // Fill up to 10 calculators with incrementing timestamps
    for (let i = 0; i < 10; i++) {
      vi.setSystemTime(new Date(2024, 1, 1, 0, 0, i));
      const id = `calc-${i}` as ToolId;
      store.initializeCalculator(id, { ...mockConfig, id } as unknown as CalculatorConfig);
    }

    expect(useCalculatorStore.getState().calculators.size).toBe(10);
    expect(useCalculatorStore.getState().calculators.has('calc-0' as ToolId)).toBe(true);

    // Add 11th calculator - should evict the oldest ('calc-0')
    vi.setSystemTime(new Date(2024, 1, 1, 0, 1, 0));
    const newId = 'calc-new' as ToolId;
    store.initializeCalculator(newId, { ...mockConfig, id: newId } as unknown as CalculatorConfig);

    expect(useCalculatorStore.getState().calculators.size).toBe(10);
    expect(useCalculatorStore.getState().calculators.has('calc-0' as ToolId)).toBe(false);
    expect(useCalculatorStore.getState().calculators.has(newId)).toBe(true);

    vi.useRealTimers();
  });

  it('persists state to localStorage', () => {
    const store = useCalculatorStore.getState();
    const calcId = 'ohm' as ToolId;

    store.initializeCalculator(calcId, mockConfig);
    store.setFieldValue(calcId, 'f1', '42');

    // Check localStorage (Zustand uses 'calculator-storage' key as defined in the store)
    const storedValue = localStorage.getItem('calculator-storage');
    expect(storedValue).toBeDefined();

    const parsed = JSON.parse(storedValue!);
    // Note: customStorage in the store converts Map to object for storage
    expect(parsed.state.calculators[calcId].fields['f1'].raw).toBe('42');
  });
});
