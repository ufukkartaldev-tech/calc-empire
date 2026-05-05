/**
 * @file descriptive.test.ts
 * @description Unit tests for descriptive statistics functions
 */

import { describe, it, expect } from 'vitest';
import {
  mean,
  median,
  mode,
  variance,
  standardDeviation,
  normalPdf,
  normalCdf,
} from '@/lib/formulas/statistics';

describe('Statistics - Mean', () => {
  it('calculates mean of array correctly', () => {
    expect(mean([1, 2, 3, 4, 5])).toBe(3);
    expect(mean([10, 20, 30])).toBe(20);
  });

  it('handles single element array', () => {
    expect(mean([42])).toBe(42);
  });

  it('handles negative numbers', () => {
    expect(mean([-5, 5])).toBe(0);
    expect(mean([-10, -20, -30])).toBe(-20);
  });

  it('handles decimal numbers', () => {
    expect(mean([1.5, 2.5, 3.5])).toBe(2.5);
  });

  it('throws for empty array', () => {
    expect(() => mean([])).toThrow('Empty array');
  });
});

describe('Statistics - Median', () => {
  it('calculates median for odd-length array', () => {
    expect(median([1, 2, 3, 4, 5])).toBe(3);
    expect(median([5, 3, 1, 2, 4])).toBe(3);
  });

  it('calculates median for even-length array', () => {
    expect(median([1, 2, 3, 4])).toBe(2.5);
    expect(median([10, 20, 30, 40])).toBe(25);
  });

  it('handles single element array', () => {
    expect(median([42])).toBe(42);
  });

  it('handles unsorted array', () => {
    expect(median([5, 1, 3, 2, 4])).toBe(3);
  });

  it('throws for empty array', () => {
    expect(() => median([])).toThrow('Empty array');
  });
});

describe('Statistics - Mode', () => {
  it('calculates mode for single mode', () => {
    expect(mode([1, 2, 2, 3, 4])).toEqual([2]);
  });

  it('calculates mode for multiple modes', () => {
    const result = mode([1, 1, 2, 2, 3]);
    expect(result).toContain(1);
    expect(result).toContain(2);
    expect(result).toHaveLength(2);
  });

  it('handles all unique values (all are modes)', () => {
    const result = mode([1, 2, 3]);
    expect(result).toHaveLength(3);
  });

  it('handles single element array', () => {
    expect(mode([42])).toEqual([42]);
  });

  it('throws for empty array', () => {
    expect(() => mode([])).toThrow('Empty array');
  });
});

describe('Statistics - Variance', () => {
  it('calculates sample variance correctly', () => {
    // Sample variance: divide by n-1
    const data = [2, 4, 4, 4, 5, 5, 7, 9];
    const result = variance(data, 'sample');
    expect(result).toBeCloseTo(4.571, 2);
  });

  it('calculates population variance correctly', () => {
    // Population variance: divide by n
    const data = [2, 4, 4, 4, 5, 5, 7, 9];
    const result = variance(data, 'population');
    expect(result).toBeCloseTo(4.0, 2);
  });

  it('defaults to sample variance', () => {
    const data = [1, 2, 3, 4, 5];
    expect(variance(data)).toBe(variance(data, 'sample'));
  });

  it('handles uniform data (zero variance)', () => {
    expect(variance([5, 5, 5, 5])).toBe(0);
  });

  it('throws for empty array', () => {
    expect(() => variance([])).toThrow('Empty array');
  });

  it('throws for single element sample variance', () => {
    expect(() => variance([5], 'sample')).toThrow('Sample variance requires n > 1');
  });
});

describe('Statistics - Standard Deviation', () => {
  it('calculates sample standard deviation correctly', () => {
    const data = [2, 4, 4, 4, 5, 5, 7, 9];
    const result = standardDeviation(data, 'sample');
    expect(result).toBeCloseTo(Math.sqrt(4.571), 2);
  });

  it('calculates population standard deviation correctly', () => {
    const data = [2, 4, 4, 4, 5, 5, 7, 9];
    const result = standardDeviation(data, 'population');
    expect(result).toBeCloseTo(2.0, 2);
  });

  it('handles uniform data (zero std dev)', () => {
    expect(standardDeviation([5, 5, 5, 5])).toBe(0);
  });

  it('defaults to sample standard deviation', () => {
    const data = [1, 2, 3, 4, 5];
    expect(standardDeviation(data)).toBe(standardDeviation(data, 'sample'));
  });
});

describe('Statistics - Normal Distribution PDF', () => {
  it('calculates PDF at mean', () => {
    // PDF at mean should be 1/(σ√(2π))
    const result = normalPdf(0, 0, 1);
    expect(result).toBeCloseTo(1 / Math.sqrt(2 * Math.PI), 5);
  });

  it('calculates PDF for standard normal', () => {
    // Standard normal: N(0, 1)
    expect(normalPdf(0, 0, 1)).toBeCloseTo(0.3989, 3);
    expect(normalPdf(1, 0, 1)).toBeCloseTo(0.242, 3);
    expect(normalPdf(-1, 0, 1)).toBeCloseTo(0.242, 3);
  });

  it('is symmetric around mean', () => {
    const mean = 5;
    const stdDev = 2;
    expect(normalPdf(mean - 2, mean, stdDev)).toBeCloseTo(normalPdf(mean + 2, mean, stdDev), 10);
  });

  it('throws for non-positive standard deviation', () => {
    expect(() => normalPdf(0, 0, 0)).toThrow('Standard deviation must be positive');
    expect(() => normalPdf(0, 0, -1)).toThrow('Standard deviation must be positive');
  });
});

describe('Statistics - Normal Distribution CDF', () => {
  it('calculates CDF at mean (should be 0.5)', () => {
    expect(normalCdf(0, 0, 1)).toBeCloseTo(0.5, 5);
    expect(normalCdf(5, 5, 2)).toBeCloseTo(0.5, 5);
  });

  it('calculates CDF for standard normal', () => {
    // Standard normal CDF values
    expect(normalCdf(0, 0, 1)).toBeCloseTo(0.5, 5);
    expect(normalCdf(1.96, 0, 1)).toBeCloseTo(0.975, 2);
    expect(normalCdf(-1.96, 0, 1)).toBeCloseTo(0.025, 2);
  });

  it('approaches 1 for large positive values', () => {
    expect(normalCdf(5, 0, 1)).toBeGreaterThan(0.9999);
  });

  it('approaches 0 for large negative values', () => {
    expect(normalCdf(-5, 0, 1)).toBeLessThan(0.0001);
  });

  it('is non-decreasing', () => {
    const mean = 0;
    const stdDev = 1;
    expect(normalCdf(-2, mean, stdDev)).toBeLessThan(normalCdf(-1, mean, stdDev));
    expect(normalCdf(-1, mean, stdDev)).toBeLessThan(normalCdf(0, mean, stdDev));
    expect(normalCdf(0, mean, stdDev)).toBeLessThan(normalCdf(1, mean, stdDev));
  });

  it('throws for non-positive standard deviation', () => {
    expect(() => normalCdf(0, 0, 0)).toThrow('Standard deviation must be positive');
    expect(() => normalCdf(0, 0, -1)).toThrow('Standard deviation must be positive');
  });
});
