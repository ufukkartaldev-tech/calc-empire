/**
 * @file materials.test.ts
 * @description TDD contract tests for src/lib/formulas/materials.ts
 *
 * Covered:
 *   - Weight Calculator (material + shape → mass in kg)
 *   - Hardness Converter (Rockwell C ↔ Brinell ↔ Vickers)
 *   - Stress / Strain / Young's Modulus
 */

import { describe, it, expect } from 'vitest';
import { calculateWeight, convertHardness, stressStrain } from '../../lib/formulas/materials';

// ─────────────────────────────────────────────────────────────────────────────

// Stress / Strain / Young's Modulus

// ─────────────────────────────────────────────────────────────────────────────

describe("Stress / Strain / Young's Modulus", () => {
  /**
   * σ = F / A          (stress, Pa)
   * ε = ΔL / L₀        (strain, dimensionless)
   * E = σ / ε          (Young's Modulus, Pa)
   *
   * Steel:     E ≈ 200 GPa
   * Aluminium: E ≈ 70 GPa
   */

  it('calculates stress: σ = F / A', () => {
    // F=10 000N, A=0.001m² → σ=10 MPa
    const result = stressStrain({ force: 10_000, area: 0.001 });
    expect(result.stressPa).toBeCloseTo(10e6);
  });

  it('calculates strain: ε = ΔL / L₀', () => {
    // ΔL=0.001m, L₀=1m → ε=0.001
    const result = stressStrain({ deltaL: 0.001, L0: 1 });
    expect(result.strain).toBeCloseTo(0.001);
  });

  it("calculates Young's Modulus: E = σ / ε", () => {
    // σ=200 MPa, ε=0.001 → E=200 GPa
    const result = stressStrain({
      force: 200_000,
      area: 0.001,
      deltaL: 0.001,
      L0: 1,
    });
    expect(result.stressPa).toBeCloseTo(200e6);
    expect(result.strain).toBeCloseTo(0.001);
    expect(result.youngsModulusPa).toBeCloseTo(200e9, -6); // within 1 MPa
  });

  it('derives missing quantity when two of (stress, strain, E) are known', () => {
    // Know E and strain, derive stress
    const result = stressStrain({ youngsModulusPa: 200e9, strain: 0.001 });
    expect(result.stressPa).toBeCloseTo(200e6);
  });

  it('throws for zero cross-sectional area', () => {
    expect(() => stressStrain({ force: 10_000, area: 0 })).toThrow();
  });

  it('throws for zero initial length', () => {
    expect(() => stressStrain({ deltaL: 0.001, L0: 0 })).toThrow();
  });

  it('throws when not enough parameters to calculate anything', () => {
    expect(() => stressStrain({})).toThrow();
  });
});
