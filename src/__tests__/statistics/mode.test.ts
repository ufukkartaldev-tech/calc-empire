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

// Mode

// ─────────────────────────────────────────────────────────────────────────────

describe('Mode', () => {
  it('returns single mode: [1, 2, 2, 3] → [2]', () => {
    expect(mode([1, 2, 2, 3])).toEqual([2]);
  });

  it('returns multiple modes for bimodal data', () => {
    const result = mode([1, 1, 2, 2, 3]);
    expect(result).toContain(1);
    expect(result).toContain(2);
    expect(result).toHaveLength(2);
  });

  it('all elements unique → all are modes', () => {
    const result = mode([1, 2, 3]);
    expect(result.sort()).toEqual([1, 2, 3]);
  });

  it('throws for an empty array', () => {
    expect(() => mode([])).toThrow();
  });
});
