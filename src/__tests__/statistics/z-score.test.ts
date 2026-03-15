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

// Z-Score

// ─────────────────────────────────────────────────────────────────────────────

describe('Z-Score', () => {
  /**
   * z = (x - μ) / σ
   */

  it('z = (x - μ) / σ', () => {
    expect(zScore({ x: 85, mean: 75, stdDev: 10 })).toBeCloseTo(1, 4);
  });

  it('z = 0 when x equals mean', () => {
    expect(zScore({ x: 50, mean: 50, stdDev: 5 })).toBe(0);
  });

  it('negative z when x is below mean', () => {
    expect(zScore({ x: 60, mean: 75, stdDev: 10 })).toBeCloseTo(-1.5, 4);
  });

  it('throws for zero standard deviation', () => {
    expect(() => zScore({ x: 5, mean: 5, stdDev: 0 })).toThrow();
  });
});
