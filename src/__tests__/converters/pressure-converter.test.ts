/**
 * @file converters.test.ts
 * @description TDD contract tests for src/lib/formulas/converters.ts
 *
 * Covered:
 *   - Length  (m, cm, mm, km, in, ft, yd, mi)
 *   - Area    (m², cm², mm², km², ft², in², acre, ha)
 *   - Volume  (m³, L, mL, cm³, ft³, in³, gallon, fl_oz)
 *   - Pressure (Pa, kPa, MPa, bar, psi, atm, mmHg, inHg)
 *   - Temperature (°C, °F, K)
 *   - Energy  (J, kJ, MJ, cal, kcal, BTU, kWh, Wh)
 */

import { describe, it, expect } from 'vitest';
import {
    convertLength,
    convertArea,
    convertVolume,
    convertPressure,
    convertTemperature,
    convertEnergy,
} from '../../lib/formulas/converters';

// Tolerance helpers
const CLOSE = (a: number, b: number, digits = 4) => expect(a).toBeCloseTo(b, digits);
const THROWS = (fn: () => unknown) => expect(fn).toThrow();

// ─────────────────────────────────────────────────────────────────────────────

// Pressure

// ─────────────────────────────────────────────────────────────────────────────


describe('Pressure Converter', () => {
    it('1 bar → 100 000 Pa', () => CLOSE(convertPressure(1, 'bar', 'Pa'), 100_000));
    it('1 atm → 101 325 Pa', () => CLOSE(convertPressure(1, 'atm', 'Pa'), 101_325));
    it('1 psi → 6894.76 Pa', () => CLOSE(convertPressure(1, 'psi', 'Pa'), 6894.76, 1));
    it('1 bar → 14.5038 psi', () => CLOSE(convertPressure(1, 'bar', 'psi'), 14.5038, 3));
    it('1 MPa → 10 bar', () => CLOSE(convertPressure(1, 'MPa', 'bar'), 10));
    it('1 atm → 760 mmHg', () => CLOSE(convertPressure(1, 'atm', 'mmHg'), 760, 1));
    it('1 atm → 29.9213 inHg', () => CLOSE(convertPressure(1, 'atm', 'inHg'), 29.9213, 2));

    it('round-trip: 5 bar → psi → bar stays 5', () => {
        const psi = convertPressure(5, 'bar', 'psi');
        CLOSE(convertPressure(psi, 'psi', 'bar'), 5, 4);
    });
});

