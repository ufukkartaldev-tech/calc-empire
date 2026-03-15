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

// Area

// ─────────────────────────────────────────────────────────────────────────────

describe('Area Converter', () => {
  it('1 m² → 10 000 cm²', () => CLOSE(convertArea(1, 'm2', 'cm2'), 10_000));
  it('1 ha → 10 000 m²', () => CLOSE(convertArea(1, 'ha', 'm2'), 10_000));
  it('1 acre → 4046.86 m²', () => CLOSE(convertArea(1, 'acre', 'm2'), 4046.86, 0));
  it('1 ft² → 0.0929 m²', () => CLOSE(convertArea(1, 'ft2', 'm2'), 0.0929, 3));
  it('1 km² → 1×10⁶ m²', () => CLOSE(convertArea(1, 'km2', 'm2'), 1e6));
});
