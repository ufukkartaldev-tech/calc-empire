/**
 * @file fluid.test.ts
 * @description TDD contract tests for src/lib/formulas/fluid.ts
 *
 * Covered:
 *   - Reynolds Number (Re = ρ·v·D / μ) with flow-regime classification
 *   - Darcy-Weisbach Pressure Loss (ΔP = f·(L/D)·(ρ·v²/2))
 */

import { describe, it, expect } from 'vitest';
import { reynoldsNumber, darcyWeisbach } from '../../lib/formulas/fluid';

// ─────────────────────────────────────────────────────────────────────────────

// Darcy-Weisbach Pressure Loss

// ─────────────────────────────────────────────────────────────────────────────

describe('Darcy-Weisbach Pressure Loss', () => {
  /**
   * ΔP = f · (L / D) · (ρ · v² / 2)
   *
   * where:
   *   f   = Darcy friction factor (dimensionless)
   *   L   = pipe length (m)
   *   D   = internal diameter (m)
   *   ρ   = fluid density (kg/m³)
   *   v   = mean flow velocity (m/s)
   */

  it('calculates pressure drop for water in a horizontal pipe', () => {
    // f=0.02, L=100m, D=0.05m, ρ=998kg/m³, v=1m/s
    // ΔP = 0.02 × (100/0.05) × (998 × 1² / 2)
    //     = 0.02 × 2000 × 499  = 19 960 Pa
    const result = darcyWeisbach({ f: 0.02, L: 100, D: 0.05, rho: 998, v: 1 });
    expect(result.pressureDropPa).toBeCloseTo(19_960, 0);
  });

  it('also returns head loss in metres: h = ΔP / (ρ·g)', () => {
    const result = darcyWeisbach({ f: 0.02, L: 100, D: 0.05, rho: 998, v: 1 });
    const expected_h = 19_960 / (998 * 9.80665);
    expect(result.headLossM).toBeCloseTo(expected_h, 2);
  });

  it('pressure drop scales with v² (double speed → 4× drop)', () => {
    const r1 = darcyWeisbach({ f: 0.02, L: 100, D: 0.05, rho: 998, v: 1 });
    const r2 = darcyWeisbach({ f: 0.02, L: 100, D: 0.05, rho: 998, v: 2 });
    expect(r2.pressureDropPa / r1.pressureDropPa).toBeCloseTo(4, 3);
  });

  it('pressure drop scales linearly with length', () => {
    const r1 = darcyWeisbach({ f: 0.02, L: 100, D: 0.05, rho: 998, v: 1 });
    const r2 = darcyWeisbach({ f: 0.02, L: 1000, D: 0.05, rho: 998, v: 1 });
    expect(r2.pressureDropPa / r1.pressureDropPa).toBeCloseTo(10, 3);
  });

  it('throws for zero diameter', () => {
    expect(() => darcyWeisbach({ f: 0.02, L: 100, D: 0, rho: 998, v: 1 })).toThrow();
  });

  it('throws for negative friction factor', () => {
    expect(() => darcyWeisbach({ f: -0.02, L: 100, D: 0.05, rho: 998, v: 1 })).toThrow();
  });
});
