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
} from '../../lib/formulas/materials';

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

