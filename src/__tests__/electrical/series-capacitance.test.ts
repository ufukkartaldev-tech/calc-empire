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

// Series / Parallel — Capacitance

// ─────────────────────────────────────────────────────────────────────────────


describe('Series Capacitance', () => {
    it('two equal caps in series → half: 100μF || 100μF = 50μF', () => {
        expect(seriesCapacitance([100e-6, 100e-6])).toBeCloseTo(50e-6);
    });

    it('1/C = 1/C1 + 1/C2 + 1/C3', () => {
        // 1/(1/6 + 1/3 + 1/2) = 1/1 = 1
        expect(seriesCapacitance([6, 3, 2])).toBeCloseTo(1);
    });
});

describe('Parallel Capacitance', () => {
    it('sums capacitors: C = C1 + C2', () => {
        expect(parallelCapacitance([47e-6, 33e-6])).toBeCloseTo(80e-6);
    });
});

