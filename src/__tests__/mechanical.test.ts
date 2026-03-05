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
} from '../lib/formulas/mechanical';

// ─────────────────────────────────────────────────────────────────────────────
// Beam Deflection
// ─────────────────────────────────────────────────────────────────────────────

describe('Beam Deflection', () => {
    /**
     * Cantilever with point load at free end:
     *   δ = W·L³ / (3·E·I)
     *
     * Simply supported with central point load:
     *   δ = W·L³ / (48·E·I)
     */

    const W = 1000;          // N
    const L = 2;             // m
    const E = 200e9;         // Pa (steel)
    const I = 8.33e-6;      // m⁴ (HEA 100 flange approximate)

    it('cantilever: δ = W·L³ / (3·E·I)', () => {
        const expected = (W * L ** 3) / (3 * E * I);
        expect(beamDeflection({ W, L, E, I, type: 'cantilever' }))
            .toBeCloseTo(expected, 6);
    });

    it('simply-supported (centre load): δ = W·L³ / (48·E·I)', () => {
        const expected = (W * L ** 3) / (48 * E * I);
        expect(beamDeflection({ W, L, E, I, type: 'simply-supported' }))
            .toBeCloseTo(expected, 6);
    });

    it('cantilever deflection is 16× greater than simply-supported for same load', () => {
        const dc = beamDeflection({ W, L, E, I, type: 'cantilever' });
        const ds = beamDeflection({ W, L, E, I, type: 'simply-supported' });
        expect(dc / ds).toBeCloseTo(16, 2);
    });

    it('throws for zero span length', () => {
        expect(() => beamDeflection({ W, L: 0, E, I, type: 'cantilever' })).toThrow();
    });

    it('throws for zero modulus of elasticity', () => {
        expect(() => beamDeflection({ W, L, E: 0, I, type: 'cantilever' })).toThrow();
    });

    it('throws for unknown beam type', () => {
        // @ts-expect-error – intentional invalid type for runtime test
        expect(() => beamDeflection({ W, L, E, I, type: 'fixed-fixed' })).toThrow();
    });
});

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

// ─────────────────────────────────────────────────────────────────────────────
// Torque and Power  P = T · ω
// ─────────────────────────────────────────────────────────────────────────────

describe('Torque and Power', () => {
    /**
     * P = T · ω          where ω is angular velocity in rad/s
     * ω = 2π · n / 60   where n is speed in RPM
     */

    it('P = T·ω: 10 N·m at 100 rad/s = 1000 W', () => {
        const res = torquePower({ torqueNm: 10, omegaRadS: 100 });
        expect(res.powerW).toBeCloseTo(1000);
    });

    it('derives torque from power and omega: T = P/ω', () => {
        const res = torquePower({ powerW: 1000, omegaRadS: 100 });
        expect(res.torqueNm).toBeCloseTo(10);
    });

    it('derives omega from power and torque: ω = P/T', () => {
        const res = torquePower({ powerW: 1000, torqueNm: 10 });
        expect(res.omegaRadS).toBeCloseTo(100);
    });

    it('converts RPM to rad/s correctly: 1500 RPM ≈ 157.08 rad/s', () => {
        const res = torquePower({ torqueNm: 10, speedRpm: 1500 });
        expect(res.omegaRadS).toBeCloseTo((2 * Math.PI * 1500) / 60, 2);
        expect(res.powerW).toBeCloseTo(10 * (2 * Math.PI * 1500) / 60, 1);
    });

    it('throws when insufficient parameters', () => {
        expect(() => torquePower({ torqueNm: 10 })).toThrow();
    });
});

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
