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

// Series / Parallel — Inductance

// ─────────────────────────────────────────────────────────────────────────────


describe('Series Inductance', () => {
    it('sums inductors (no mutual coupling)', () => {
        expect(seriesInductance([10e-3, 20e-3])).toBeCloseTo(30e-3);
    });
});

describe('Parallel Inductance', () => {
    it('two equal inductors in parallel → half', () => {
        expect(parallelInductance([10e-3, 10e-3])).toBeCloseTo(5e-3);
    });
});

