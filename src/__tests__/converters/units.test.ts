/**
 * @file units.test.ts
 * @description Unit tests for unit conversion functions
 */

import { describe, it, expect } from 'vitest';
import {
  convertLength,
  convertArea,
  convertVolume,
  convertPressure,
  convertTemperature,
} from '@/lib/formulas/converters';

describe('Converters - Length', () => {
  it('converts meters to centimeters', () => {
    expect(convertLength(1, 'm', 'cm')).toBe(100);
    expect(convertLength(2.5, 'm', 'cm')).toBe(250);
  });

  it('converts centimeters to meters', () => {
    expect(convertLength(100, 'cm', 'm')).toBe(1);
    expect(convertLength(50, 'cm', 'm')).toBe(0.5);
  });

  it('converts kilometers to meters', () => {
    expect(convertLength(1, 'km', 'm')).toBe(1000);
    expect(convertLength(0.5, 'km', 'm')).toBe(500);
  });

  it('converts inches to centimeters', () => {
    expect(convertLength(1, 'in', 'cm')).toBeCloseTo(2.54, 5);
  });

  it('converts feet to meters', () => {
    expect(convertLength(1, 'ft', 'm')).toBeCloseTo(0.3048, 5);
    expect(convertLength(3.28084, 'ft', 'm')).toBeCloseTo(1, 3);
  });

  it('handles same unit conversion', () => {
    expect(convertLength(5, 'm', 'm')).toBe(5);
    expect(convertLength(100, 'cm', 'cm')).toBe(100);
  });

  it('throws for unknown units', () => {
    expect(() => convertLength(1, 'unknown', 'm')).toThrow('Unknown unit');
    expect(() => convertLength(1, 'm', 'unknown')).toThrow('Unknown unit');
  });
});

describe('Converters - Area', () => {
  it('converts square meters to square centimeters', () => {
    expect(convertArea(1, 'm2', 'cm2')).toBe(10000);
  });

  it('converts square kilometers to square meters', () => {
    expect(convertArea(1, 'km2', 'm2')).toBe(1000000);
  });

  it('converts hectares to square meters', () => {
    expect(convertArea(1, 'ha', 'm2')).toBe(10000);
  });

  it('converts acres to square meters', () => {
    expect(convertArea(1, 'acre', 'm2')).toBeCloseTo(4046.856, 2);
  });

  it('converts square feet to square meters', () => {
    expect(convertArea(1, 'ft2', 'm2')).toBeCloseTo(0.0929, 3);
  });

  it('handles same unit conversion', () => {
    expect(convertArea(50, 'm2', 'm2')).toBe(50);
  });

  it('throws for unknown units', () => {
    expect(() => convertArea(1, 'unknown', 'm2')).toThrow('Unknown unit');
  });
});

describe('Converters - Volume', () => {
  it('converts liters to milliliters', () => {
    expect(convertVolume(1, 'L', 'mL')).toBe(1000);
    expect(convertVolume(2.5, 'L', 'mL')).toBe(2500);
  });

  it('converts cubic meters to liters', () => {
    expect(convertVolume(1, 'm3', 'L')).toBe(1000);
  });

  it('converts gallons to liters', () => {
    expect(convertVolume(1, 'gal', 'L')).toBeCloseTo(3.785, 2);
  });

  it('converts cubic feet to liters', () => {
    expect(convertVolume(1, 'ft3', 'L')).toBeCloseTo(28.317, 2);
  });

  it('handles same unit conversion', () => {
    expect(convertVolume(5, 'L', 'L')).toBe(5);
  });

  it('throws for unknown units', () => {
    expect(() => convertVolume(1, 'unknown', 'L')).toThrow('Unknown unit');
  });
});

describe('Converters - Pressure', () => {
  it('converts pascals to kilopascals', () => {
    expect(convertPressure(1000, 'Pa', 'kPa')).toBe(1);
  });

  it('converts atmospheres to pascals', () => {
    expect(convertPressure(1, 'atm', 'Pa')).toBeCloseTo(101325, 0);
  });

  it('converts bar to pascals', () => {
    expect(convertPressure(1, 'bar', 'Pa')).toBe(100000);
  });

  it('converts psi to pascals', () => {
    expect(convertPressure(1, 'psi', 'Pa')).toBeCloseTo(6894.757, 2);
  });

  it('converts mmHg to pascals', () => {
    expect(convertPressure(760, 'mmHg', 'Pa')).toBeCloseTo(101325, 0);
  });

  it('handles same unit conversion', () => {
    expect(convertPressure(5, 'kPa', 'kPa')).toBe(5);
  });

  it('throws for unknown units', () => {
    expect(() => convertPressure(1, 'unknown', 'Pa')).toThrow('Unknown unit');
  });
});

describe('Converters - Temperature', () => {
  it('converts Celsius to Fahrenheit', () => {
    expect(convertTemperature(0, 'C', 'F')).toBe(32);
    expect(convertTemperature(100, 'C', 'F')).toBe(212);
    expect(convertTemperature(-40, 'C', 'F')).toBe(-40);
  });

  it('converts Fahrenheit to Celsius', () => {
    expect(convertTemperature(32, 'F', 'C')).toBe(0);
    expect(convertTemperature(212, 'F', 'C')).toBe(100);
    expect(convertTemperature(-40, 'F', 'C')).toBe(-40);
  });

  it('converts Celsius to Kelvin', () => {
    expect(convertTemperature(0, 'C', 'K')).toBe(273.15);
    expect(convertTemperature(100, 'C', 'K')).toBe(373.15);
    expect(convertTemperature(-273.15, 'C', 'K')).toBe(0);
  });

  it('converts Kelvin to Celsius', () => {
    expect(convertTemperature(273.15, 'K', 'C')).toBe(0);
    expect(convertTemperature(373.15, 'K', 'C')).toBe(100);
    expect(convertTemperature(0, 'K', 'C')).toBe(-273.15);
  });

  it('converts Fahrenheit to Kelvin', () => {
    expect(convertTemperature(32, 'F', 'K')).toBeCloseTo(273.15, 2);
  });

  it('handles same unit conversion', () => {
    expect(convertTemperature(25, 'C', 'C')).toBe(25);
    expect(convertTemperature(77, 'F', 'F')).toBe(77);
    expect(convertTemperature(300, 'K', 'K')).toBe(300);
  });

  it('throws for unknown units', () => {
    expect(() => convertTemperature(25, 'unknown', 'C')).toThrow('Unknown unit');
    expect(() => convertTemperature(25, 'C', 'unknown')).toThrow('Unknown unit');
  });

  it('throws for invalid numeric input', () => {
    expect(() => convertTemperature(NaN, 'C', 'F')).toThrow('Input must be a valid numeric value');
  });
});
