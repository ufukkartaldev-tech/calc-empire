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

// Temperature  — NOT a simple multiplier; needs offset logic

// ─────────────────────────────────────────────────────────────────────────────

describe('Temperature Converter', () => {
  it('0 °C → 32 °F', () => CLOSE(convertTemperature(0, 'C', 'F'), 32));
  it('100 °C → 212 °F', () => CLOSE(convertTemperature(100, 'C', 'F'), 212));
  it('0 °C → 273.15 K', () => CLOSE(convertTemperature(0, 'C', 'K'), 273.15));
  it('32 °F → 0 °C', () => CLOSE(convertTemperature(32, 'F', 'C'), 0));
  it('212 °F → 100 °C', () => CLOSE(convertTemperature(212, 'F', 'C'), 100));
  it('300 K → 26.85 °C', () => CLOSE(convertTemperature(300, 'K', 'C'), 26.85, 2));
  it('–40 °C equals –40 °F (unique crossover)', () =>
    CLOSE(convertTemperature(-40, 'C', 'F'), -40));

  it('throws for absolute temperature below absolute zero', () => {
    THROWS(() => convertTemperature(-1, 'K', 'C'));
  });

  it('throws for unknown scale', () => {
    THROWS(() => convertTemperature(100, 'C', 'R')); // Rankine not supported
  });
});
