import { describe, it, expect } from 'vitest';
import { calculateBodePlot } from '../../lib/formulas/electrical';

describe('Bode Plot Calculator', () => {
    it('calculates cutoff frequency for RC low-pass', () => {
        // R = 1kΩ, C = 1µF
        // fc = 1 / (2π * 1000 * 1e-6) ≈ 159.15 Hz
        const res = calculateBodePlot({ type: 'low-pass', R: 1000, C: 1e-6, points: 10 });
        expect(res.fc).toBeCloseTo(159.155, 3);
    });

    it('calculates cutoff frequency for RL high-pass', () => {
        // R = 1kΩ, L = 10mH
        // fc = 1000 / (2π * 10e-3) ≈ 15915 Hz
        const res = calculateBodePlot({ type: 'high-pass', R: 1000, L: 10e-3, points: 10 });
        expect(res.fc).toBeCloseTo(15915.494, 3);
    });

    it('generates magnitude and phase correctly at fc for low-pass', () => {
        const res = calculateBodePlot({ type: 'low-pass', R: 1000, C: 1e-6, points: 101 });
        // At fc, f/fc = 1
        // mag = -10 * log10(2) ≈ -3.01 dB
        // phase = -atan(1) = -45 deg

        // Let's directly compute for a frequency explicitly equal to fc
        // We can just extract the math from the function later, 
        // but let's test the array generation. 
        // We know that at least we generate proper arrays:
        expect(res.frequencies.length).toBe(101);
        expect(res.magnitudes.length).toBe(101);
        expect(res.phases.length).toBe(101);

        // Find the index closest to fc
        let minDiff = Infinity;
        let indexAtFc = 0;
        for (let i = 0; i < res.frequencies.length; i++) {
            const diff = Math.abs(res.frequencies[i] - res.fc);
            if (diff < minDiff) {
                minDiff = diff;
                indexAtFc = i;
            }
        }

        // It should be roughly -3dB and -45deg
        expect(res.magnitudes[indexAtFc]).toBeCloseTo(-3.01, 1);
        expect(res.phases[indexAtFc]).toBeCloseTo(-45, 1);
    });

    it('generates magnitude and phase correctly at fc for high-pass', () => {
        const res = calculateBodePlot({ type: 'high-pass', R: 1000, C: 1e-6, points: 3 });
        // Instead of searching, we can just replace the middle point with fc logic internally
        // The midpoint of log range from fc/100 to fc*100 is exactly fc.
        // If points=3, indices are 0, 1, 2. Index 1 should be exactly fc.
        expect(res.frequencies[1]).toBeCloseTo(res.fc, 3);
        expect(res.magnitudes[1]).toBeCloseTo(-3.01, 1);
        expect(res.phases[1]).toBeCloseTo(45, 1); // 90 - 45 = 45 deg
    });

    it('throws if neither C nor L is provided', () => {
        expect(() => calculateBodePlot({ type: 'low-pass', R: 1000 })).toThrow("Either valid C or L must be provided");
    });

    it('throws if R is negative or zero', () => {
        expect(() => calculateBodePlot({ type: 'low-pass', R: 0, C: 1e-6 })).toThrow("Resistance must be positive");
        expect(() => calculateBodePlot({ type: 'low-pass', R: -10, C: 1e-6 })).toThrow("Resistance must be positive");
    });

    it('throws if C or L is negative', () => {
        expect(() => calculateBodePlot({ type: 'low-pass', R: 1000, C: -1e-6 })).toThrow("Capacitance or Inductance must be positive");
        expect(() => calculateBodePlot({ type: 'low-pass', R: 1000, L: -10e-3 })).toThrow("Capacitance or Inductance must be positive");
    });
});
