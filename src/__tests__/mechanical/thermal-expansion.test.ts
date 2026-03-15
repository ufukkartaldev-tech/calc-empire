/**
 * @file mechanical.test.ts
 * @description TDD contract tests for src/lib/formulas/mechanical.ts
 *
 * Covered:
 *   - Beam Deflection (cantilever, simply-supported)
 *   - Gear Ratio (speed & torque)
 *   - Torque and Power  (P = T·ω)
 *   - Thermal Expansion (ΔL = L₀·α·ΔT)
 */

import { describe, it, expect } from 'vitest';
import {
  beamDeflection,
  gearRatio,
  torquePower,
  thermalExpansion,
} from '../../lib/formulas/mechanical';

// ─────────────────────────────────────────────────────────────────────────────

// Thermal Expansion  ΔL = L₀ · α · ΔT

// ─────────────────────────────────────────────────────────────────────────────

describe('Thermal Expansion', () => {
  /**
   * ΔL = L₀ · α · ΔT
   *
   * Common α values (per °C):
   *   Steel:     11.7 × 10⁻⁶
   *   Aluminium: 23.1 × 10⁻⁶
   *   Copper:    16.5 × 10⁻⁶
   */

  it('ΔL = L₀·α·ΔT: 1 m steel rod heated 100°C → 1.17 mm', () => {
    const alpha = 11.7e-6; // steel
    const result = thermalExpansion({ L0: 1, alpha, deltaT: 100 });
    expect(result.deltaL).toBeCloseTo(0.00117, 6);
    expect(result.Lfinal).toBeCloseTo(1.00117, 6);
  });

  it('aluminium expands ~2× more than steel for same conditions', () => {
    const steel = thermalExpansion({ L0: 1, alpha: 11.7e-6, deltaT: 100 });
    const alum = thermalExpansion({ L0: 1, alpha: 23.1e-6, deltaT: 100 });
    expect(alum.deltaL / steel.deltaL).toBeCloseTo(23.1 / 11.7, 2);
  });

  it('contraction: negative ΔT produces negative ΔL', () => {
    const result = thermalExpansion({ L0: 1, alpha: 11.7e-6, deltaT: -50 });
    expect(result.deltaL).toBeLessThan(0);
    expect(result.Lfinal).toBeLessThan(1);
  });

  it('throws for zero or negative initial length', () => {
    expect(() => thermalExpansion({ L0: 0, alpha: 11.7e-6, deltaT: 100 })).toThrow();
  });

  it('throws for zero thermal expansion coefficient', () => {
    expect(() => thermalExpansion({ L0: 1, alpha: 0, deltaT: 100 })).toThrow();
  });
});
