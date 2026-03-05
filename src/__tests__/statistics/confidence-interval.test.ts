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
