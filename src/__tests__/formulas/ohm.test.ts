/**
 * @file ohm.test.ts
 * @description Unit tests for Ohm's Law formula
 *
 * Tests: ohm function with various combinations of V, I, R
 */

import { describe, it, expect } from 'vitest';
import { ohm } from '@/lib/formulas';

describe('Ohm Law', () => {
  describe('Calculate Resistance', () => {
    it('should calculate R from V and I', () => {
      const result = ohm({ voltage: 12, current: 0.5 });
      expect(result.resistance).toBe(24);
    });

    it('should calculate R from V (with unit) and I', () => {
      const result = ohm({ voltage: { value: 12, unit: 'V' }, current: 0.5 });
      expect(result.resistance).toBe(24);
    });

    it('should calculate R from V (kV) and I (mA)', () => {
      // V = 12 kV = 12000 V, I = 500 mA = 0.5 A
      // R = V/I = 12000/0.5 = 24000 Ω
      const result = ohm({
        voltage: { value: 12, unit: 'k' },
        current: { value: 500, unit: 'm' },
      });
      expect(result.resistance).toBe(24000);
    });
  });

  describe('Calculate Voltage', () => {
    it('should calculate V from I and R', () => {
      const result = ohm({ current: 2, resistance: 10 });
      expect(result.voltage).toBe(20);
    });

    it('should calculate V from I (mA) and R (kΩ)', () => {
      // I = 100 mA = 0.1 A, R = 10 kΩ = 10000 Ω
      // V = I*R = 0.1*10000 = 1000 V
      const result = ohm({
        current: { value: 100, unit: 'm' },
        resistance: { value: 10, unit: 'k' },
      });
      expect(result.voltage).toBe(1000);
    });
  });

  describe('Calculate Current', () => {
    it('should calculate I from V and R', () => {
      const result = ohm({ voltage: 12, resistance: 4 });
      expect(result.current).toBe(3);
    });

    it('should calculate I from V (kV) and R (MΩ)', () => {
      // V = 12 kV = 12000 V, R = 4 MΩ = 4000000 Ω
      // I = V/R = 12000/4000000 = 0.003 A
      const result = ohm({
        voltage: { value: 12, unit: 'k' },
        resistance: { value: 4, unit: 'M' },
      });
      expect(result.current).toBe(0.003);
    });
  });

  describe('Error Cases', () => {
    it('should throw error when less than 2 parameters provided', () => {
      expect(() => ohm({ voltage: 12 })).toThrow();
      expect(() => ohm({})).toThrow();
    });

    it('should throw error for invalid values (zero or negative)', () => {
      expect(() => ohm({ voltage: 0, current: 1 })).toThrow();
      expect(() => ohm({ voltage: 12, resistance: -10 })).toThrow();
    });

    it('should throw error for zero resistance', () => {
      expect(() => ohm({ voltage: 12, resistance: 0 })).toThrow();
    });
  });

  describe('Unit Multipliers', () => {
    it('should handle k (kilo) multiplier', () => {
      // V = 12 kV = 12000 V, I = 0.001 A
      // R = V/I = 12000/0.001 = 12000000 Ω
      const result = ohm({
        voltage: { value: 12, unit: 'k' },
        current: 0.001,
      });
      expect(result.resistance).toBe(12000000);
    });

    it('should handle M (mega) multiplier', () => {
      // V = 12 MV = 12000000 V, I = 1 mA = 0.001 A
      // R = V/I = 12000000/0.001 = 12000000000 Ω
      const result = ohm({
        voltage: { value: 12, unit: 'M' },
        current: { value: 1, unit: 'm' },
      });
      expect(result.resistance).toBe(12000000000);
    });

    it('should handle m (milli) multiplier', () => {
      const result = ohm({
        voltage: 12,
        current: { value: 500, unit: 'm' },
      });
      expect(result.resistance).toBe(24);
    });

    it('should handle u (micro) multiplier', () => {
      const result = ohm({
        voltage: { value: 12, unit: 'V' },
        current: { value: 500, unit: 'u' },
      });
      expect(result.resistance).toBe(24000);
    });
  });
});
