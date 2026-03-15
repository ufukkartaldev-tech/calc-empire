/**
 * @file statistics.test.ts
 * @description TDD contract tests for src/lib/formulas/statistics.ts
 *
 * Covered:
 *   - Descriptive stats: mean, median, mode
 *   - Variance & standard deviation (population and sample)
 *   - Normal distribution: PDF and CDF
 *   - Z-score
 *   - Confidence interval (for mean, known σ)
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
  zScore,
  confidenceInterval,
} from '../../lib/formulas/statistics';

// ─────────────────────────────────────────────────────────────────────────────

// Variance & Standard Deviation

// ─────────────────────────────────────────────────────────────────────────────

describe('Variance', () => {
  const data = [2, 4, 4, 4, 5, 5, 7, 9]; // classic textbook example

  it('population variance = 4', () => {
    expect(variance(data, 'population')).toBeCloseTo(4, 4);
  });

  it('sample variance = 4.571 (uses n-1)', () => {
    expect(variance(data, 'sample')).toBeCloseTo(4.571, 2);
  });

  it('defaults to sample variance when type not specified', () => {
    expect(variance(data)).toBe(variance(data, 'sample'));
  });

  it('variance of identical values is 0', () => {
    expect(variance([7, 7, 7, 7])).toBe(0);
  });

  it('throws for single-element array with sample variance', () => {
    expect(() => variance([5], 'sample')).toThrow();
  });

  it('throws for empty array', () => {
    expect(() => variance([])).toThrow();
  });
});

describe('Standard Deviation', () => {
  const data = [2, 4, 4, 4, 5, 5, 7, 9];

  it('population std dev = 2', () => {
    expect(standardDeviation(data, 'population')).toBeCloseTo(2, 4);
  });

  it('sample std dev = √4.571 ≈ 2.138', () => {
    expect(standardDeviation(data, 'sample')).toBeCloseTo(2.138, 2);
  });

  it('std dev is always ≥ 0', () => {
    expect(standardDeviation([5, 10, 15])).toBeGreaterThanOrEqual(0);
  });
});
