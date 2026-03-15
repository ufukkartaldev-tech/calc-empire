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
} from '../lib/formulas/converters';

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

  it('throws for invalid types or NaN', () => {
    THROWS(() => convertTemperature('100' as any, 'C', 'F'));
    THROWS(() => convertTemperature(NaN, 'C', 'F'));
  });

  it('throws for unknown scale', () => {
    THROWS(() => convertTemperature(100, 'C', 'R')); // Rankine not supported
  });
});

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
