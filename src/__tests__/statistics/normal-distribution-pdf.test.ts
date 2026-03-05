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

