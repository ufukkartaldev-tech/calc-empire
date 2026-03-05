/**
 * @file electrical.test.ts
 * @description TDD contract tests for src/lib/formulas/electrical.ts
 *
 * RED phase: all tests fail until the implementation is written.
 * GREEN phase: implement each formula to satisfy these tests exactly.
 *
 * Covered:
 *   - Ohm's Law extended (V, I, R, P)
 *   - Resistor Color Codes (4-band, 5-band, 6-band)
 *   - Series / Parallel: R, C, L
 *   - Capacitor time constant (τ = R·C)
 *   - AC Power Analysis (S, P, Q, cos φ)
 *   - Voltage Divider
 *   - LED Series Resistor
 */

import { describe, it, expect } from 'vitest';
import {
    ohmPower,
    resistorColorCode,
    seriesResistance,
    parallelResistance,
    seriesCapacitance,
    parallelCapacitance,
    seriesInductance,
    parallelInductance,
    timeConstantRC,
    acPower,
    voltageDivider,
    ledResistor,
} from '../../lib/formulas/electrical';

// ─────────────────────────────────────────────────────────────────────────────

// Series / Parallel — Resistance

// ─────────────────────────────────────────────────────────────────────────────


describe('Series Resistance', () => {
    it('sums all resistors: R = R1 + R2 + ...', () => {
        expect(seriesResistance([100, 200, 300])).toBeCloseTo(600);
    });

    it('works with a single resistor', () => {
        expect(seriesResistance([470])).toBeCloseTo(470);
    });

    it('throws for empty array', () => {
        expect(() => seriesResistance([])).toThrow();
    });

    it('throws for zero or negative resistor values', () => {
        expect(() => seriesResistance([100, -10])).toThrow();
    });
});

describe('Parallel Resistance', () => {
    it('two equal resistors → half: 1/R = 1/R1 + 1/R2', () => {
        expect(parallelResistance([100, 100])).toBeCloseTo(50);
    });

    it('classic R1||R2: 300Ω || 600Ω = 200Ω', () => {
        expect(parallelResistance([300, 600])).toBeCloseTo(200);
    });

    it('three resistors in parallel', () => {
        expect(parallelResistance([6, 3, 2])).toBeCloseTo(1);
    });

    it('throws for empty array', () => {
        expect(() => parallelResistance([])).toThrow();
    });
});

