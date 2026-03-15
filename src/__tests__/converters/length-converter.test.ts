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

// Length

// ─────────────────────────────────────────────────────────────────────────────

describe('Length Converter', () => {
  it('identity: 1 m → 1 m', () => CLOSE(convertLength(1, 'm', 'm'), 1));

  it('1 m → 100 cm', () => CLOSE(convertLength(1, 'm', 'cm'), 100));
  it('1 m → 1000 mm', () => CLOSE(convertLength(1, 'm', 'mm'), 1000));
  it('1 km → 1000 m', () => CLOSE(convertLength(1, 'km', 'm'), 1000));
  it('1 in → 2.54 cm', () => CLOSE(convertLength(1, 'in', 'cm'), 2.54, 4));
  it('1 ft → 0.3048 m', () => CLOSE(convertLength(1, 'ft', 'm'), 0.3048, 4));
  it('1 mi → 1.60934 km', () => CLOSE(convertLength(1, 'mi', 'km'), 1.60934, 3));
  it('1 yd  → 3 ft', () => CLOSE(convertLength(1, 'yd', 'ft'), 3, 4));

  it('round-trip: 5 mi → ft → mi stays 5', () => {
    const ft = convertLength(5, 'mi', 'ft');
    CLOSE(convertLength(ft, 'ft', 'mi'), 5, 3);
  });

  it('throws for unknown unit', () => THROWS(() => convertLength(1, 'parsec', 'm')));
});
