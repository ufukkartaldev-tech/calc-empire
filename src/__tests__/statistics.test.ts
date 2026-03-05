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
} from '../lib/formulas/statistics';

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

// ─────────────────────────────────────────────────────────────────────────────
// Normal Distribution
// ─────────────────────────────────────────────────────────────────────────────

describe('Normal Distribution PDF', () => {
    /**
     * Standard normal: μ=0, σ=1
     * f(0) = 1/√(2π) ≈ 0.3989
     */

    it('standard normal PDF at x=0 ≈ 0.3989', () => {
        expect(normalPdf(0, 0, 1)).toBeCloseTo(0.39894, 4);
    });

    it('PDF is symmetric: f(-x) = f(x)', () => {
        expect(normalPdf(-1, 0, 1)).toBeCloseTo(normalPdf(1, 0, 1), 8);
    });

    it('PDF decreases as |x| increases', () => {
        expect(normalPdf(0, 0, 1)).toBeGreaterThan(normalPdf(1, 0, 1));
    });

    it('throws for σ ≤ 0', () => {
        expect(() => normalPdf(0, 0, -1)).toThrow();
        expect(() => normalPdf(0, 0, 0)).toThrow();
    });
});

describe('Normal Distribution CDF', () => {
    /**
     * Standard normal CDF:
     *   Φ(0)  = 0.5
     *   Φ(1)  ≈ 0.8413 (68-95-99.7 rule)
     *   Φ(-1) ≈ 0.1587
     */

    it('Φ(0) = 0.5 (symmetric about 0)', () => {
        expect(normalCdf(0, 0, 1)).toBeCloseTo(0.5, 4);
    });

    it('Φ(1) ≈ 0.8413', () => {
        expect(normalCdf(1, 0, 1)).toBeCloseTo(0.8413, 3);
    });

    it('Φ(-1) ≈ 0.1587', () => {
        expect(normalCdf(-1, 0, 1)).toBeCloseTo(0.1587, 3);
    });

    it('P(-1 < X < 1) ≈ 68.27% (empirical rule)', () => {
        const p = normalCdf(1, 0, 1) - normalCdf(-1, 0, 1);
        expect(p).toBeCloseTo(0.6827, 3);
    });

    it('approaches 1 for very large x', () => {
        expect(normalCdf(10, 0, 1)).toBeCloseTo(1, 4);
    });
});

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

// ─────────────────────────────────────────────────────────────────────────────
// Confidence Interval (z-based, known σ)
// ─────────────────────────────────────────────────────────────────────────────

describe('Confidence Interval', () => {
    /**
     * CI = x̄ ± z* · (σ / √n)
     *
     * Common z* values:
     *   90% CI → z* ≈ 1.645
     *   95% CI → z* ≈ 1.960
     *   99% CI → z* ≈ 2.576
     */

    it('95% CI: [x̄ - 1.96·σ/√n,  x̄ + 1.96·σ/√n]', () => {
        const result = confidenceInterval({ mean: 100, stdDev: 15, n: 100, confidence: 0.95 });
        const margin = 1.96 * 15 / Math.sqrt(100);
        expect(result.lower).toBeCloseTo(100 - margin, 2);
        expect(result.upper).toBeCloseTo(100 + margin, 2);
        expect(result.marginOfError).toBeCloseTo(margin, 2);
    });

    it('wider CI for lower confidence level (90% narrower than 99%)', () => {
        const ci90 = confidenceInterval({ mean: 100, stdDev: 15, n: 100, confidence: 0.90 });
        const ci99 = confidenceInterval({ mean: 100, stdDev: 15, n: 100, confidence: 0.99 });
        expect(ci90.marginOfError).toBeLessThan(ci99.marginOfError);
    });

    it('larger n → narrower CI', () => {
        const ci_small = confidenceInterval({ mean: 100, stdDev: 15, n: 10, confidence: 0.95 });
        const ci_large = confidenceInterval({ mean: 100, stdDev: 15, n: 100, confidence: 0.95 });
        expect(ci_large.marginOfError).toBeLessThan(ci_small.marginOfError);
    });

    it('throws for n < 1', () => {
        expect(() =>
            confidenceInterval({ mean: 100, stdDev: 15, n: 0, confidence: 0.95 })
        ).toThrow();
    });

    it('throws for confidence outside (0, 1)', () => {
        expect(() =>
            confidenceInterval({ mean: 100, stdDev: 15, n: 30, confidence: 1.5 })
        ).toThrow();
    });
});
