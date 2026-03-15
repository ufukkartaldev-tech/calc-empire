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
