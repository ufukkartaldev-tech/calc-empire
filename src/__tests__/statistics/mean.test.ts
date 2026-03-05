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

// Mean

// ─────────────────────────────────────────────────────────────────────────────


describe('Mean', () => {
    it('arithmetic mean of [1, 2, 3, 4, 5] = 3', () => {
        expect(mean([1, 2, 3, 4, 5])).toBeCloseTo(3);
    });

    it('handles a single-element array', () => {
        expect(mean([42])).toBe(42);
    });

    it('handles negative numbers', () => {
        expect(mean([-5, 0, 5])).toBeCloseTo(0);
    });

    it('throws for an empty array', () => {
        expect(() => mean([])).toThrow();
    });
});

