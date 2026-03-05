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
import {
    calculateWeight,
    convertHardness,
    stressStrain,
} from '../lib/formulas/materials';

// ─────────────────────────────────────────────────────────────────────────────
// Weight Calculator
//   mass = density × volume
// ─────────────────────────────────────────────────────────────────────────────

describe('Weight Calculator', () => {
    /**
     * Built-in densities (kg/m³):
     *   steel         7850
     *   aluminium     2700
     *   copper        8960
     *   gold         19300
     *   titanium      4506
     *   abs_plastic   1050
     */

    describe('Plate  (length × width × thickness)', () => {
        it('steel plate 1m × 1m × 0.01m → 78.5 kg', () => {
            const result = calculateWeight({
                material: 'steel',
                shape: 'plate',
                dimensions: { length: 1, width: 1, thickness: 0.01 },
            });
            expect(result.massKg).toBeCloseTo(78.5, 1);
        });

        it('aluminium plate — same volume weighs ~34.4% of steel', () => {
            const steel = calculateWeight({
                material: 'steel',
                shape: 'plate',
                dimensions: { length: 1, width: 1, thickness: 0.01 },
            });
            const alum = calculateWeight({
                material: 'aluminium',
                shape: 'plate',
                dimensions: { length: 1, width: 1, thickness: 0.01 },
            });
            expect(alum.massKg / steel.massKg).toBeCloseTo(2700 / 7850, 2);
        });
    });

    describe('Round Bar  (diameter × length)', () => {
        it('steel round bar Ø20mm × 1m → ~2.47 kg', () => {
            // V = π × (0.01)² × 1 ≈ 3.1416×10⁻⁴ m³; m = 7850 × V ≈ 2.466 kg
            const result = calculateWeight({
                material: 'steel',
                shape: 'round-bar',
                dimensions: { diameter: 0.02, length: 1 },
            });
            expect(result.massKg).toBeCloseTo(2.466, 1);
        });
    });

    describe('Hollow Pipe  (outerDia, innerDia, length)', () => {
        it('steel pipe OD=60mm, ID=50mm, L=1m → ~3.69 kg', () => {
            // V = π/4 × (0.06² - 0.05²) × 1 ≈ 4.712×10⁻⁴ m³
            const result = calculateWeight({
                material: 'steel',
                shape: 'pipe',
                dimensions: { outerDiameter: 0.06, innerDiameter: 0.05, length: 1 },
            });
            expect(result.massKg).toBeCloseTo(3.699, 1);
        });

        it('throws when inner diameter >= outer diameter', () => {
            expect(() =>
                calculateWeight({
                    material: 'steel',
                    shape: 'pipe',
                    dimensions: { outerDiameter: 0.05, innerDiameter: 0.05, length: 1 },
                })
            ).toThrow();
        });
    });

    describe('Error handling', () => {
        it('throws for unknown material', () => {
            expect(() =>
                calculateWeight({
                    material: 'unobtainium',
                    shape: 'plate',
                    dimensions: { length: 1, width: 1, thickness: 0.01 },
                })
            ).toThrow();
        });

        it('throws for unknown shape', () => {
            expect(() =>
                calculateWeight({
                    material: 'steel',
                    // @ts-expect-error – intentional
                    shape: 'sphere',
                    dimensions: { radius: 0.1 },
                })
            ).toThrow();
        });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Hardness Converter
// ─────────────────────────────────────────────────────────────────────────────

describe('Hardness Converter', () => {
    /**
     * Uses standard empirical conversion tables (ASTM E140 approximations).
     * Results are inherently approximate (±5% tolerance is acceptable).
     *
     * Supported scales: 'HRC' | 'HB' | 'HV'
     *
     * Reference points (ASTM E140 Table 1, steel):
     *   HRC 60 ≈ HB 697  ≈ HV 746
     *   HRC 40 ≈ HB 371  ≈ HV 392
     *   HRC 20 ≈ HB 226  ≈ HV 238
     */

    it('HRC 60 → HB ≈ 697 (±10)', () => {
        const result = convertHardness({ value: 60, from: 'HRC', to: 'HB' });
        expect(result).toBeGreaterThan(680);
        expect(result).toBeLessThan(720);
    });

    it('HRC 40 → HV ≈ 392 (±15)', () => {
        const result = convertHardness({ value: 40, from: 'HRC', to: 'HV' });
        expect(result).toBeGreaterThan(370);
        expect(result).toBeLessThan(415);
    });

    it('HB → HRC inverse is consistent (round-trip error < 5%)', () => {
        const hrc_original = 50;
        const hb = convertHardness({ value: hrc_original, from: 'HRC', to: 'HB' });
        const hrc_back = convertHardness({ value: hb, from: 'HB', to: 'HRC' });
        expect(Math.abs(hrc_back - hrc_original)).toBeLessThan(3); // ±3 HRC
    });

    it('same scale conversion is identity', () => {
        expect(convertHardness({ value: 200, from: 'HB', to: 'HB' })).toBe(200);
    });

    it('throws for HRC value outside valid range (0–68)', () => {
        expect(() => convertHardness({ value: 75, from: 'HRC', to: 'HB' })).toThrow();
    });

    it('throws for unknown scale', () => {
        // @ts-expect-error – intentional invalid scale
        expect(() => convertHardness({ value: 40, from: 'HM', to: 'HB' })).toThrow();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Stress / Strain / Young's Modulus
// ─────────────────────────────────────────────────────────────────────────────

describe('Stress / Strain / Young\'s Modulus', () => {
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

    it('calculates Young\'s Modulus: E = σ / ε', () => {
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
