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

// AC Power Analysis  S, P, Q, cos φ

// ─────────────────────────────────────────────────────────────────────────────


describe('AC Power Analysis', () => {
    it('computes apparent power S = V·I', () => {
        const res = acPower({ voltage: 230, current: 10, phiDeg: 30 });
        expect(res.apparentPower).toBeCloseTo(2300);
    });

    it('computes active power P = S·cos(φ)', () => {
        const res = acPower({ voltage: 230, current: 10, phiDeg: 30 });
        expect(res.activePower).toBeCloseTo(2300 * Math.cos(Math.PI / 6), 1);
    });

    it('computes reactive power Q = S·sin(φ)', () => {
        const res = acPower({ voltage: 230, current: 10, phiDeg: 30 });
        expect(res.reactivePower).toBeCloseTo(2300 * Math.sin(Math.PI / 6), 1);
    });

    it('computes power factor cos(φ)', () => {
        const res = acPower({ voltage: 230, current: 10, phiDeg: 30 });
        expect(res.powerFactor).toBeCloseTo(Math.cos(Math.PI / 6), 4);
    });

    it('unity power factor at φ = 0° → Q = 0, P = S', () => {
        const res = acPower({ voltage: 100, current: 5, phiDeg: 0 });
        expect(res.powerFactor).toBeCloseTo(1);
        expect(res.reactivePower).toBeCloseTo(0, 5);
        expect(res.activePower).toBeCloseTo(500);
    });

    it('purely reactive load at φ = 90° → P = 0', () => {
        const res = acPower({ voltage: 100, current: 5, phiDeg: 90 });
        expect(res.activePower).toBeCloseTo(0, 5);
        expect(res.powerFactor).toBeCloseTo(0, 5);
    });
});

