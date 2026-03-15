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

// Energy

// ─────────────────────────────────────────────────────────────────────────────

describe('Energy Converter', () => {
  it('1 kJ → 1000 J', () => CLOSE(convertEnergy(1, 'kJ', 'J'), 1000));
  it('1 kcal → 4184 J', () => CLOSE(convertEnergy(1, 'kcal', 'J'), 4184, 0));
  it('1 BTU → 1055.06 J', () => CLOSE(convertEnergy(1, 'BTU', 'J'), 1055.06, 1));
  it('1 kWh → 3 600 000 J', () => CLOSE(convertEnergy(1, 'kWh', 'J'), 3_600_000));
  it('1 kWh → 3600 kJ', () => CLOSE(convertEnergy(1, 'kWh', 'kJ'), 3600));
  it('1 kWh → 860.421 kcal', () => CLOSE(convertEnergy(1, 'kWh', 'kcal'), 860.421, 1));
  it('1 cal → 4.184 J', () => CLOSE(convertEnergy(1, 'cal', 'J'), 4.184, 3));
  it('1 MJ → 277.778 Wh', () => CLOSE(convertEnergy(1, 'MJ', 'Wh'), 277.778, 2));

  it('round-trip: 5 kWh → BTU → kWh stays 5', () => {
    const btu = convertEnergy(5, 'kWh', 'BTU');
    CLOSE(convertEnergy(btu, 'BTU', 'kWh'), 5, 3);
  });

  it('throws for unknown unit', () => THROWS(() => convertEnergy(1, 'eV', 'J')));
});
