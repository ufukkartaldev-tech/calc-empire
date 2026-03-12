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
} from '@/lib/formulas/electrical';

// ─────────────────────────────────────────────────────────────────────────────

// Ohm's Law — Power Extension  (P = V · I)

// ─────────────────────────────────────────────────────────────────────────────


describe("Ohm's Law – Power", () => {
    it('calculates power from voltage and current (P = V·I)', () => {
        expect(ohmPower({ voltage: 12, current: 2 }).power).toBeCloseTo(24);
    });

    it('calculates current from power and voltage (I = P/V)', () => {
        expect(ohmPower({ voltage: 240, power: 1200 }).current).toBeCloseTo(5);
    });

    it('calculates voltage from power and current (V = P/I)', () => {
        expect(ohmPower({ power: 60, current: 0.5 }).voltage).toBeCloseTo(120);
    });

    it('calculates power from current and resistance (P = I²·R)', () => {
        expect(ohmPower({ current: 3, resistance: 4 }).power).toBeCloseTo(36);
    });

    it('calculates power from voltage and resistance (P = V²/R)', () => {
        expect(ohmPower({ voltage: 10, resistance: 5 }).power).toBeCloseTo(20);
    });

    it('throws when fewer than 2 parameters are given', () => {
        expect(() => ohmPower({ voltage: 10 })).toThrow("At least two parameters are required.");
    });

    it('throws when string or invalid types are provided', () => {
        // Simulating JS runtime bypass of TS types
        expect(() => ohmPower({ voltage: "12V" as any, current: 2 })).toThrow("[big.js] Invalid number");
        expect(() => ohmPower({ resistance: NaN, power: 5 })).toThrow("[big.js] Invalid number");
    });

    it('throws when negative resistance is given', () => {
        expect(() => ohmPower({ voltage: 10, resistance: -5 })).toThrow("Resistance (R) cannot be negative.");
    });

    it('throws when negative power is given', () => {
        expect(() => ohmPower({ voltage: 10, power: -50 })).toThrow("Power (P) cannot be negative in passive systems.");
    });
});
