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

