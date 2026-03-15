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

// Reynolds Number

// ─────────────────────────────────────────────────────────────────────────────

describe('Reynolds Number', () => {
  /**
   * Re = ρ · v · D / μ
   *
   * Regimes:
   *   Re < 2300        → laminar
   *   2300 ≤ Re ≤ 4000 → transitional
   *   Re > 4000        → turbulent
   */

  it('calculates Re for water in a pipe', () => {
    // Water at 20°C: ρ=998 kg/m³, μ=1.002×10⁻³ Pa·s
    // D=0.05m (5cm), v=0.1 m/s
    // Re = 998 × 0.1 × 0.05 / 0.001002 ≈ 4980
    const result = reynoldsNumber({
      density: 998,
      velocity: 0.1,
      diameter: 0.05,
      dynamicViscosity: 1.002e-3,
    });
    expect(result.Re).toBeCloseTo(4980, 0);
    expect(result.regime).toBe('turbulent');
  });

  it('classifies low-velocity flow as laminar (Re < 2300)', () => {
    // Re ≈ 200
    const result = reynoldsNumber({
      density: 998,
      velocity: 0.004,
      diameter: 0.05,
      dynamicViscosity: 1.002e-3,
    });
    expect(result.Re).toBeLessThan(2300);
    expect(result.regime).toBe('laminar');
  });

  it('classifies transitional flow (2300 ≤ Re ≤ 4000)', () => {
    // Re ≈ 3000
    const result = reynoldsNumber({
      density: 998,
      velocity: 0.0601,
      diameter: 0.05,
      dynamicViscosity: 1.002e-3,
    });
    expect(result.Re).toBeGreaterThanOrEqual(2300);
    expect(result.Re).toBeLessThanOrEqual(4000);
    expect(result.regime).toBe('transitional');
  });

  it('accepts kinematic viscosity as an alternative to μ and ρ', () => {
    // ν = μ/ρ = 1.002e-3 / 998 ≈ 1.004e-6 m²/s
    // Re = v·D/ν = 0.1×0.05 / 1.004e-6 ≈ 4980
    const result = reynoldsNumber({
      velocity: 0.1,
      diameter: 0.05,
      kinematicViscosity: 1.004e-6,
    });
    expect(result.Re).toBeCloseTo(4980, 0);
  });

  it('throws when neither (μ + ρ) nor kinematic viscosity is supplied', () => {
    expect(() => reynoldsNumber({ velocity: 0.1, diameter: 0.05 })).toThrow();
  });

  it('throws for zero velocity', () => {
    expect(() =>
      reynoldsNumber({ density: 998, velocity: 0, diameter: 0.05, dynamicViscosity: 1e-3 })
    ).toThrow();
  });

  it('throws for zero diameter', () => {
    expect(() =>
      reynoldsNumber({ density: 998, velocity: 0.1, diameter: 0, dynamicViscosity: 1e-3 })
    ).toThrow();
  });
});
