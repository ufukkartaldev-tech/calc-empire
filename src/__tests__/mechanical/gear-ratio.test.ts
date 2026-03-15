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

// Gear Ratio

// ─────────────────────────────────────────────────────────────────────────────

describe('Gear Ratio', () => {
  /**
   * ratio = drivenTeeth / driverTeeth
   *
   * For a single stage:
   *   outputSpeed  = inputSpeed  / ratio
   *   outputTorque = inputTorque * ratio   (ideal, no losses)
   */

  it('computes ratio: 40-tooth driven / 20-tooth driver = 2', () => {
    const g = gearRatio({ driverTeeth: 20, drivenTeeth: 40 });
    expect(g.ratio).toBeCloseTo(2);
  });

  it('output speed is halved when ratio = 2', () => {
    const g = gearRatio({ driverTeeth: 20, drivenTeeth: 40, inputSpeedRpm: 1000 });
    expect(g.outputSpeedRpm).toBeCloseTo(500);
  });

  it('output torque is doubled when ratio = 2 (torque multiplication)', () => {
    const g = gearRatio({ driverTeeth: 20, drivenTeeth: 40, inputTorqueNm: 10 });
    expect(g.outputTorqueNm).toBeCloseTo(20);
  });

  it('overdrive (ratio < 1): 20-tooth driven / 40-tooth driver = 0.5', () => {
    const g = gearRatio({ driverTeeth: 40, drivenTeeth: 20 });
    expect(g.ratio).toBeCloseTo(0.5);
  });

  it('throws when either tooth count is zero or negative', () => {
    expect(() => gearRatio({ driverTeeth: 0, drivenTeeth: 40 })).toThrow();
    expect(() => gearRatio({ driverTeeth: 20, drivenTeeth: -1 })).toThrow();
  });
});
