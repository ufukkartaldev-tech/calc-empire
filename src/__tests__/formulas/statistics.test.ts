/**
 * @file statistics.test.ts
 * @description Unit tests for statistics formulas
 *
 * Tests: Basic statistics calculations
 */

import { describe, it, expect } from 'vitest';
import {
  mean,
  median,
  variance,
  standardDeviation,
  mode,
  normalPdf,
  zScore,
  confidenceInterval,
} from '@/lib/formulas/statistics';

describe('Statistics Formulas', () => {
  describe('mean', () => {
    it('should calculate mean of array', () => {
      expect(mean([1, 2, 3, 4, 5])).toBeCloseTo(3);
    });

    it('should handle single value', () => {
      expect(mean([42])).toBe(42);
    });

    it('should throw error for empty array', () => {
      expect(() => mean([])).toThrow();
    });
  });

  describe('median', () => {
    it('should calculate median of odd-length array', () => {
      expect(median([1, 2, 3, 4, 5])).toBe(3);
    });

    it('should calculate median of even-length array', () => {
      expect(median([1, 2, 3, 4])).toBeCloseTo(2.5);
    });

    it('should handle unsorted array', () => {
      expect(median([5, 1, 3, 2, 4])).toBe(3);
    });

    it('should throw error for empty array', () => {
      expect(() => median([])).toThrow();
    });
  });

  describe('mode', () => {
    it('should find single mode', () => {
      expect(mode([1, 2, 2, 3, 4])).toEqual([2]);
    });

    it('should find multiple modes', () => {
      expect(mode([1, 1, 2, 2, 3])).toEqual([1, 2]);
    });

    it('should throw error for empty array', () => {
      expect(() => mode([])).toThrow();
    });
  });

  describe('variance', () => {
    it('should calculate sample variance', () => {
      // Sample variance of [1,2,3,4,5] = 2.5
      expect(variance([1, 2, 3, 4, 5], 'sample')).toBeCloseTo(2.5);
    });

    it('should calculate population variance', () => {
      // Population variance of [1,2,3,4,5] = 2
      expect(variance([1, 2, 3, 4, 5], 'population')).toBeCloseTo(2);
    });

    it('should throw error for empty array', () => {
      expect(() => variance([])).toThrow();
    });

    it('should throw error for sample variance with single value', () => {
      expect(() => variance([5], 'sample')).toThrow();
    });
  });

  describe('standardDeviation', () => {
    it('should calculate sample std dev', () => {
      expect(standardDeviation([1, 2, 3, 4, 5], 'sample')).toBeCloseTo(1.581, 2);
    });

    it('should calculate population std dev', () => {
      expect(standardDeviation([1, 2, 3, 4, 5], 'population')).toBeCloseTo(1.414, 2);
    });
  });

  describe('normalPdf', () => {
    it('should calculate PDF at mean', () => {
      // At x=μ, PDF should be maximum
      const result = normalPdf(0, 0, 1);
      expect(result).toBeCloseTo(0.3989, 3);
    });

    it('should throw error for zero std dev', () => {
      expect(() => normalPdf(0, 0, 0)).toThrow();
    });
  });

  describe('zScore', () => {
    it('should calculate z-score', () => {
      expect(zScore({ x: 115, mean: 100, stdDev: 15 })).toBeCloseTo(1);
    });

    it('should throw error for zero std dev', () => {
      expect(() => zScore({ x: 100, mean: 100, stdDev: 0 })).toThrow();
    });
  });

  describe('confidenceInterval', () => {
    it('should calculate 95% CI', () => {
      const result = confidenceInterval({
        mean: 100,
        stdDev: 15,
        n: 100,
        confidence: 0.95,
      });
      expect(result.lower).toBeCloseTo(97.06, 2);
      expect(result.upper).toBeCloseTo(102.94, 2);
    });

    it('should throw error for invalid n', () => {
      expect(() =>
        confidenceInterval({
          mean: 100,
          stdDev: 15,
          n: 0,
          confidence: 0.95,
        })
      ).toThrow();
    });

    it('should throw error for invalid confidence', () => {
      expect(() =>
        confidenceInterval({
          mean: 100,
          stdDev: 15,
          n: 100,
          confidence: 1.5,
        })
      ).toThrow();
    });
  });
});
