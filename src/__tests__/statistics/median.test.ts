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

// Median

// ─────────────────────────────────────────────────────────────────────────────

describe('Median', () => {
  it('odd count: median of [3, 1, 4, 1, 5] = 3', () => {
    expect(median([3, 1, 4, 1, 5])).toBe(3);
  });

  it('even count: median of [1, 2, 3, 4] = 2.5', () => {
    expect(median([1, 2, 3, 4])).toBe(2.5);
  });

  it('does not mutate the original array', () => {
    const arr = [5, 3, 1];
    median(arr);
    expect(arr).toEqual([5, 3, 1]);
  });

  it('throws for an empty array', () => {
    expect(() => median([])).toThrow();
  });
});
