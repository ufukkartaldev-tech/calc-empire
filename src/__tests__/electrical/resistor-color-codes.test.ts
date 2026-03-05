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

// Resistor Color Codes

// ─────────────────────────────────────────────────────────────────────────────


describe('Resistor Color Codes', () => {
    describe('4-band', () => {
        it('decodes Brown-Black-Red-Gold → 1 kΩ ±5%', () => {
            const r = resistorColorCode(['brown', 'black', 'red', 'gold']);
            expect(r.resistance).toBe(1000);
            expect(r.tolerance).toBe(5);
        });

        it('decodes Red-Red-Orange-Silver → 22 kΩ ±10%', () => {
            const r = resistorColorCode(['red', 'red', 'orange', 'silver']);
            expect(r.resistance).toBe(22_000);
            expect(r.tolerance).toBe(10);
        });

        it('decodes Yellow-Violet-Black-Gold → 47 Ω ±5%', () => {
            const r = resistorColorCode(['yellow', 'violet', 'black', 'gold']);
            expect(r.resistance).toBe(47);
            expect(r.tolerance).toBe(5);
        });
    });

    describe('5-band', () => {
        it('decodes Brown-Black-Black-Red-Brown → 10 kΩ ±1%', () => {
            const r = resistorColorCode(['brown', 'black', 'black', 'red', 'brown']);
            expect(r.resistance).toBe(10_000);
            expect(r.tolerance).toBe(1);
        });

        it('decodes Red-Red-Black-Black-Brown → 220 Ω ±1%', () => {
            const r = resistorColorCode(['red', 'red', 'black', 'black', 'brown']);
            expect(r.resistance).toBe(220);
            expect(r.tolerance).toBe(1);
        });
    });

    describe('6-band', () => {
        it('decodes Brown-Black-Black-Red-Brown-Red → 10 kΩ ±1%, 50 ppm/°C', () => {
            const r = resistorColorCode(['brown', 'black', 'black', 'red', 'brown', 'red']);
            expect(r.resistance).toBe(10_000);
            expect(r.tolerance).toBe(1);
            expect(r.tempCoeff).toBe(50); // ppm/°C — red band
        });
    });

    describe('Error handling', () => {
        it('throws for invalid band count (3 bands)', () => {
            expect(() => resistorColorCode(['red', 'red', 'gold'])).toThrow();
        });

        it('throws for unknown color name', () => {
            expect(() => resistorColorCode(['brown', 'pink', 'red', 'gold'])).toThrow();
        });
    });
});

