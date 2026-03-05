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

