/**
 * @file hooks/useUrlState.test.ts
 * @description Unit tests for useUrlState hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUrlState } from './useUrlState';
import type { FieldValues, FieldConfig } from '@/types';

// Mock Next.js routing
const mockReplace = vi.fn();
const mockPathname = '/en/tools/ohm';
const mockLocale = 'en';

vi.mock('@/i18n/routing', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => mockPathname,
}));

vi.mock('next-intl', () => ({
  useLocale: () => mockLocale,
}));

describe('useUrlState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window.location.search
    delete (window as any).location;
    (window as any).location = { search: '' };
  });

  describe('encodeToUrl', () => {
    it('should encode field values to URL parameters', async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useUrlState());

      const fields: FieldValues = {
        voltage: { value: 12, unit: 'V' },
        current: { value: 2.5, unit: 'A' },
      };

      act(() => {
        result.current.encodeToUrl(fields);
      });

      // Fast-forward debounce timer
      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining('voltage=12'), {
        scroll: false,
      });
      expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining('voltage_unit=V'), {
        scroll: false,
      });
      expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining('current=2.5'), {
        scroll: false,
      });

      vi.useRealTimers();
    });

    it('should apply precision limit to numeric values', async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useUrlState({ precision: 3 }));

      const fields: FieldValues = {
        voltage: { value: 12.123456789, unit: 'V' },
      };

      act(() => {
        result.current.encodeToUrl(fields);
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining('voltage=12.123'), {
        scroll: false,
      });

      vi.useRealTimers();
    });

    it('should skip null values', async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useUrlState());

      const fields: FieldValues = {
        voltage: { value: 12, unit: 'V' },
        current: { value: null, unit: 'A' },
      };

      act(() => {
        result.current.encodeToUrl(fields);
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      const callArg = mockReplace.mock.calls[0][0];
      expect(callArg).toContain('voltage=12');
      expect(callArg).not.toContain('current=');
      expect(callArg).toContain('current_unit=A');

      vi.useRealTimers();
    });

    it('should debounce rapid updates', async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useUrlState({ debounceMs: 100 }));

      const fields1: FieldValues = { voltage: { value: 10, unit: 'V' } };
      const fields2: FieldValues = { voltage: { value: 20, unit: 'V' } };
      const fields3: FieldValues = { voltage: { value: 30, unit: 'V' } };

      act(() => {
        result.current.encodeToUrl(fields1);
        result.current.encodeToUrl(fields2);
        result.current.encodeToUrl(fields3);
      });

      // Should not call replace yet
      expect(mockReplace).not.toHaveBeenCalled();

      // Fast-forward debounce timer
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Should only call once with the last value
      expect(mockReplace).toHaveBeenCalledTimes(1);
      expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining('voltage=30'), {
        scroll: false,
      });

      vi.useRealTimers();
    });
  });

  describe('decodeFromUrl', () => {
    it('should decode URL parameters to field values', () => {
      (window as any).location.search = '?voltage=12&voltage_unit=V&current=2.5&current_unit=A';

      const { result } = renderHook(() => useUrlState());

      const decoded = result.current.decodeFromUrl();

      expect(decoded).toEqual({
        voltage: { value: 12, unit: 'V' },
        current: { value: 2.5, unit: 'A' },
      });
    });

    it('should handle missing unit parameters', () => {
      (window as any).location.search = '?voltage=12';

      const { result } = renderHook(() => useUrlState());

      const decoded = result.current.decodeFromUrl();

      expect(decoded).toEqual({
        voltage: { value: 12, unit: '' },
      });
    });

    it('should return null for empty URL', () => {
      (window as any).location.search = '';

      const { result } = renderHook(() => useUrlState());

      const decoded = result.current.decodeFromUrl();

      expect(decoded).toBeNull();
    });

    it('should skip invalid numeric values', () => {
      (window as any).location.search = '?voltage=invalid&current=2.5&current_unit=A';

      const { result } = renderHook(() => useUrlState());

      const decoded = result.current.decodeFromUrl();

      expect(decoded).toEqual({
        current: { value: 2.5, unit: 'A' },
      });
    });

    it('should skip non-finite values', () => {
      (window as any).location.search = '?voltage=Infinity&current=2.5&current_unit=A';

      const { result } = renderHook(() => useUrlState());

      const decoded = result.current.decodeFromUrl();

      expect(decoded).toEqual({
        current: { value: 2.5, unit: 'A' },
      });
    });
  });

  describe('validateUrl', () => {
    it('should validate URL parameters', () => {
      const { result } = renderHook(() => useUrlState());

      const params = new URLSearchParams('?voltage=12&current=2.5');
      const validation = result.current.validateUrl(params);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.warnings).toHaveLength(0);
    });

    it('should detect invalid numeric values', () => {
      const { result } = renderHook(() => useUrlState());

      const params = new URLSearchParams('?voltage=invalid');
      const validation = result.current.validateUrl(params);

      expect(validation.isValid).toBe(true); // No errors, just warnings
      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.warnings[0]).toContain('invalid numeric value');
    });

    it('should detect URL length violations', () => {
      const { result } = renderHook(() => useUrlState({ maxLength: 50 }));

      const longParams = new URLSearchParams();
      for (let i = 0; i < 20; i++) {
        longParams.set(`field${i}`, '123456789');
      }

      const validation = result.current.validateUrl(longParams);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors[0]).toContain('exceeds maximum');
    });
  });

  describe('round-trip consistency', () => {
    it('should maintain non-null values through encode-decode cycle', async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useUrlState());

      const originalFields: FieldValues = {
        voltage: { value: 12.345, unit: 'V' },
        current: { value: 2.5, unit: 'A' },
      };

      // Encode to URL
      act(() => {
        result.current.encodeToUrl(originalFields);
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Extract the query string from the mock call
      const encodedUrl = mockReplace.mock.calls[0][0];
      const queryString = encodedUrl.split('?')[1];
      (window as any).location.search = `?${queryString}`;

      // Decode from URL
      const decoded = result.current.decodeFromUrl();

      // Null values aren't encoded to URL, so they won't be in decoded result
      // Only non-null values and their units should round-trip successfully
      expect(decoded).toEqual({
        voltage: { value: 12.345, unit: 'V' },
        current: { value: 2.5, unit: 'A' },
      });

      // Verify non-null values match exactly
      expect(decoded?.voltage).toEqual(originalFields.voltage);
      expect(decoded?.current).toEqual(originalFields.current);

      vi.useRealTimers();
    });
  });
});

describe('constraint validation', () => {
  const fieldConfigs: FieldConfig[] = [
    {
      key: 'voltage',
      labelKey: 'voltage',
      units: [{ label: 'V', symbol: 'V' }],
      constraints: {
        min: 0,
        max: 1000,
        allowNegative: false,
      },
    },
    {
      key: 'current',
      labelKey: 'current',
      units: [{ label: 'A', symbol: 'A' }],
      constraints: {
        min: 0.1,
        allowZero: false,
      },
    },
  ];

  it('should reject values below minimum constraint', () => {
    (window as any).location.search = '?voltage=-5&voltage_unit=V';

    const { result } = renderHook(() => useUrlState({ fieldConfigs }));

    const decoded = result.current.decodeFromUrl();

    // Voltage should be rejected due to negative value
    expect(decoded).toBeNull();
  });

  it('should reject values above maximum constraint', () => {
    (window as any).location.search = '?voltage=2000&voltage_unit=V';

    const { result } = renderHook(() => useUrlState({ fieldConfigs }));

    const decoded = result.current.decodeFromUrl();

    // Voltage should be rejected due to exceeding max
    expect(decoded).toBeNull();
  });

  it('should reject zero when allowZero is false', () => {
    (window as any).location.search = '?current=0&current_unit=A';

    const { result } = renderHook(() => useUrlState({ fieldConfigs }));

    const decoded = result.current.decodeFromUrl();

    // Current should be rejected due to zero value
    expect(decoded).toBeNull();
  });

  it('should accept valid values within constraints', () => {
    (window as any).location.search = '?voltage=12&voltage_unit=V&current=2.5&current_unit=A';

    const { result } = renderHook(() => useUrlState({ fieldConfigs }));

    const decoded = result.current.decodeFromUrl();

    expect(decoded).toEqual({
      voltage: { value: 12, unit: 'V' },
      current: { value: 2.5, unit: 'A' },
    });
  });

  it('should accept valid field and reject invalid field', () => {
    (window as any).location.search = '?voltage=12&voltage_unit=V&current=0&current_unit=A';

    const { result } = renderHook(() => useUrlState({ fieldConfigs }));

    const decoded = result.current.decodeFromUrl();

    // Should only include voltage, current rejected due to zero
    expect(decoded).toEqual({
      voltage: { value: 12, unit: 'V' },
    });
  });

  it('should validate constraints in validateUrl', () => {
    const { result } = renderHook(() => useUrlState({ fieldConfigs }));

    const params = new URLSearchParams('?voltage=-5&current=0');
    const validation = result.current.validateUrl(params);

    expect(validation.isValid).toBe(true); // No errors, just warnings
    expect(validation.warnings.length).toBeGreaterThan(0);
    expect(validation.warnings.some((w) => w.includes('negative'))).toBe(true);
    expect(validation.warnings.some((w) => w.includes('zero'))).toBe(true);
  });

  it('should work without field configs', () => {
    (window as any).location.search = '?voltage=-5&voltage_unit=V';

    const { result } = renderHook(() => useUrlState());

    const decoded = result.current.decodeFromUrl();

    // Without constraints, negative values should be accepted
    expect(decoded).toEqual({
      voltage: { value: -5, unit: 'V' },
    });
  });
});
