import { describe, it, expect } from 'vitest';
import { calculateWeight } from '../../lib/formulas/materials';

describe('Weight Calculator', () => {
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
            const result = calculateWeight({
                material: 'steel',
                shape: 'round-bar',
                dimensions: { diameter: 0.02, length: 1 },
            });
            expect(result.massKg).toBeCloseTo(2.466, 1);
        });
    });

    describe('Hollow Pipe  (outerDia, innerDia, length)', () => {
        it('steel pipe OD=60mm, ID=50mm, L=1m → ~6.79 kg', () => {
            const result = calculateWeight({
                material: 'steel',
                shape: 'pipe',
                dimensions: { outerDiameter: 0.06, innerDiameter: 0.05, length: 1 },
            });
            expect(result.massKg).toBeCloseTo(6.786, 2);
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
                    // @ts-expect-error
                    shape: 'sphere',
                    dimensions: { radius: 0.1 },
                })
            ).toThrow();
        });
    });
});
