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

// Voltage Divider  Vout = Vin · R2 / (R1 + R2)

// ─────────────────────────────────────────────────────────────────────────────


describe('Voltage Divider', () => {
    it('divides 12V in half with equal resistors', () => {
        expect(voltageDivider({ Vin: 12, R1: 1000, R2: 1000 })).toBeCloseTo(6);
    });

    it('Vout = Vin · R2 / (R1 + R2)', () => {
        // 5V, R1=1kΩ, R2=3kΩ → 5 × 3/4 = 3.75V
        expect(voltageDivider({ Vin: 5, R1: 1000, R2: 3000 })).toBeCloseTo(3.75);
    });

    it('throws when any resistance is zero or negative', () => {
        expect(() => voltageDivider({ Vin: 12, R1: 0, R2: 1000 })).toThrow();
    });
});

