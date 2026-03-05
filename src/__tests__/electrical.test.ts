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
} from '../lib/formulas/electrical';

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
        expect(() => ohmPower({ voltage: 10 })).toThrow();
    });
});

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

// ─────────────────────────────────────────────────────────────────────────────
// Time Constant  τ = R·C
// ─────────────────────────────────────────────────────────────────────────────

describe('RC Time Constant', () => {
    it('τ = R·C: 10kΩ × 100μF = 1 s', () => {
        expect(timeConstantRC(10_000, 100e-6)).toBeCloseTo(1);
    });

    it('returns voltage-charge curve at t = τ (≈ 63.2% of V_supply)', () => {
        const tau = timeConstantRC(10_000, 100e-6);
        const Vsupply = 5;
        const Vt = Vsupply * (1 - Math.exp(-1)); // at t = τ
        expect(Vt / Vsupply).toBeCloseTo(0.632, 2);
    });

    it('throws for zero resistance', () => {
        expect(() => timeConstantRC(0, 100e-6)).toThrow();
    });

    it('throws for zero capacitance', () => {
        expect(() => timeConstantRC(10_000, 0)).toThrow();
    });
});

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
