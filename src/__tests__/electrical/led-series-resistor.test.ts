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

// LED Series Resistor  R = (Vsupply - Vled) / Iled

// ─────────────────────────────────────────────────────────────────────────────


describe('LED Series Resistor', () => {
    it('calculates series resistor for a standard red LED', () => {
        // Vsupply=5V, Vled=2V, Iled=20mA → R=(5-2)/0.02=150Ω
        expect(ledResistor({ Vsupply: 5, Vled: 2, IledA: 0.02 })).toBeCloseTo(150);
    });

    it('calculates for a blue LED on 12V supply', () => {
        // Vsupply=12V, Vled=3.2V, Iled=20mA → R=(12-3.2)/0.02=440Ω
        expect(ledResistor({ Vsupply: 12, Vled: 3.2, IledA: 0.02 })).toBeCloseTo(440);
    });

    it('throws when supply voltage is less than or equal to LED voltage', () => {
        expect(() => ledResistor({ Vsupply: 2, Vled: 3.2, IledA: 0.02 })).toThrow();
    });

    it('throws when LED current is zero or negative', () => {
        expect(() => ledResistor({ Vsupply: 5, Vled: 2, IledA: 0 })).toThrow();
    });
});
