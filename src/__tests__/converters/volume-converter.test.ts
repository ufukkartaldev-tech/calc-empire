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

// Volume

// ─────────────────────────────────────────────────────────────────────────────


describe('Volume Converter', () => {
    it('1 m³ → 1000 L', () => CLOSE(convertVolume(1, 'm3', 'L'), 1000));
    it('1 L → 1000 mL', () => CLOSE(convertVolume(1, 'L', 'mL'), 1000));
    it('1 mL → 1 cm³', () => CLOSE(convertVolume(1, 'mL', 'cm3'), 1));
    it('1 gal (US) → 3.78541 L', () => CLOSE(convertVolume(1, 'gal', 'L'), 3.78541, 3));
    it('1 ft³ → 28.3168 L', () => CLOSE(convertVolume(1, 'ft3', 'L'), 28.3168, 2));
    it('1 fl_oz (US) → 29.5735 mL', () => CLOSE(convertVolume(1, 'fl_oz', 'mL'), 29.5735, 2));
});

