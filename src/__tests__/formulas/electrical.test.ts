/**
 * @file electrical.test.ts
 * @description Unit tests for electrical formulas
 * 
 * Tests: ohmPower, resistorColorCode, series/parallel resistance,
 *        AC power, voltage divider, LED resistor, Bode plot, Kirchhoff
 */

import { describe, it, expect } from 'vitest';
import { 
    ohmPower, 
    resistorColorCode, 
    seriesResistance, 
    parallelResistance,
    seriesCapacitance,
    parallelCapacitance,
    seriesInductance,
    parallelInductance,
    timeConstantRC,
    acPower,
    voltageDivider,
    ledResistor,
    calculateBodePlot,
    solveKirchhoff2Loop
} from '@/lib/formulas/electrical';

describe('Electrical Formulas', () => {
    describe('ohmPower', () => {
        it('should calculate resistance and power from voltage and current', () => {
            const result = ohmPower({ voltage: 12, current: 0.5 });
            expect(result.resistance).toBeCloseTo(24);
            expect(result.power).toBeCloseTo(6);
        });

        it('should calculate voltage and power from current and resistance', () => {
            const result = ohmPower({ current: 2, resistance: 10 });
            expect(result.voltage).toBeCloseTo(20);
            expect(result.power).toBeCloseTo(40);
        });

        it('should throw error for invalid inputs', () => {
            expect(() => ohmPower({})).toThrow();
            expect(() => ohmPower({ voltage: 12, resistance: 0 })).toThrow();
        });
    });

    describe('resistorColorCode', () => {
        it('should calculate 4-band resistor value', () => {
            const result = resistorColorCode(['brown', 'black', 'red', 'gold']);
            expect(result.resistance).toBe(1000);
            expect(result.tolerance).toBe(5);
        });

        it('should calculate 5-band resistor value', () => {
            const result = resistorColorCode(['red', 'violet', 'black', 'brown', 'brown']);
            expect(result.resistance).toBe(2700);
            expect(result.tolerance).toBe(1);
        });

        it('should throw error for invalid bands', () => {
            expect(() => resistorColorCode(['invalid', 'color'])).toThrow();
        });
    });

    describe('seriesResistance', () => {
        it('should sum resistors in series', () => {
            expect(seriesResistance([100, 200, 300])).toBe(600);
        });

        it('should throw error for empty array', () => {
            expect(() => seriesResistance([])).toThrow();
        });

        it('should throw error for non-positive values', () => {
            expect(() => seriesResistance([100, -50])).toThrow();
        });
    });

    describe('parallelResistance', () => {
        it('should calculate parallel resistance', () => {
            // 100 || 100 = 50
            expect(parallelResistance([100, 100])).toBeCloseTo(50);
        });

        it('should throw error for non-positive values', () => {
            expect(() => parallelResistance([100, 0])).toThrow();
        });
    });

    describe('seriesCapacitance', () => {
        it('should calculate series capacitance', () => {
            // 10uF + 10uF in series = 5uF
            expect(seriesCapacitance([10, 10])).toBeCloseTo(5);
        });
    });

    describe('parallelCapacitance', () => {
        it('should sum capacitors in parallel', () => {
            expect(parallelCapacitance([10, 20, 30])).toBe(60);
        });
    });

    describe('seriesInductance', () => {
        it('should sum inductors in series', () => {
            expect(seriesInductance([1, 2, 3])).toBe(6);
        });
    });

    describe('parallelInductance', () => {
        it('should calculate parallel inductance', () => {
            expect(parallelInductance([10, 10])).toBeCloseTo(5);
        });
    });

    describe('timeConstantRC', () => {
        it('should calculate RC time constant', () => {
            expect(timeConstantRC(1000, 0.001)).toBe(1);
        });

        it('should throw error for invalid values', () => {
            expect(() => timeConstantRC(0, 1)).toThrow();
        });
    });

    describe('acPower', () => {
        it('should calculate AC power values', () => {
            const result = acPower({ voltage: 120, current: 1, phiDeg: 30 });
            expect(result.apparentPower).toBeCloseTo(120);
            expect(result.activePower).toBeCloseTo(103.92, 2);
            expect(result.reactivePower).toBeCloseTo(60, 2);
            expect(result.powerFactor).toBeCloseTo(0.866, 2);
        });
    });

    describe('voltageDivider', () => {
        it('should calculate voltage divider output', () => {
            expect(voltageDivider({ Vin: 12, R1: 100, R2: 100 })).toBe(6);
        });

        it('should throw error for invalid resistances', () => {
            expect(() => voltageDivider({ Vin: 12, R1: 0, R2: 100 })).toThrow();
        });
    });

    describe('ledResistor', () => {
        it('should calculate LED series resistor', () => {
            expect(ledResistor({ Vsupply: 5, Vled: 2, IledA: 0.02 })).toBe(150);
        });

        it('should throw error for invalid inputs', () => {
            expect(() => ledResistor({ Vsupply: 3, Vled: 5, IledA: 0.02 })).toThrow();
        });
    });

    describe('calculateBodePlot', () => {
        it('should calculate low-pass Bode plot', () => {
            const result = calculateBodePlot({ type: 'low-pass', R: 1000, C: 0.000001, points: 10 });
            expect(result.fc).toBeCloseTo(159.15, 2);
            expect(result.frequencies.length).toBe(10);
            expect(result.magnitudes.length).toBe(10);
        });

        it('should calculate high-pass Bode plot', () => {
            const result = calculateBodePlot({ type: 'high-pass', R: 1000, C: 0.000001, points: 10 });
            expect(result.fc).toBeCloseTo(159.15, 2);
        });

        it('should throw error for invalid resistance', () => {
            expect(() => calculateBodePlot({ type: 'low-pass', R: 0, C: 1 })).toThrow();
        });
    });

    describe('solveKirchhoff2Loop', () => {
        it('should solve 2-loop mesh analysis', () => {
            // V1=10V, V2=5V, R1=100Ω, R2=200Ω, R3=50Ω
            // Mesh 1: I1(R1+R3) + I2(R3) = V1 => I1*150 + I2*50 = 10
            // Mesh 2: I1(R3) + I2(R2+R3) = V2 => I1*50 + I2*250 = 5
            // Solving: I1 = 0.064286, I2 = 0.007143, I3 = I1+I2 = 0.071429
            const result = solveKirchhoff2Loop({ V1: 10, V2: 5, R1: 100, R2: 200, R3: 50 });
            expect(result.I1).toBeCloseTo(0.064286, 4);
            expect(result.I2).toBeCloseTo(0.007143, 4);
            expect(result.I3).toBeCloseTo(0.071429, 4);
        });

        it('should throw error for negative resistances', () => {
            expect(() => solveKirchhoff2Loop({ V1: 10, V2: 5, R1: -100, R2: 200, R3: 50 })).toThrow();
        });

        it('should throw error for singular matrix', () => {
            expect(() => solveKirchhoff2Loop({ V1: 10, V2: 5, R1: 0, R2: 0, R3: 0 })).toThrow();
        });
    });
});
