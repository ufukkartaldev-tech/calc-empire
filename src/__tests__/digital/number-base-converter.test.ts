/**
 * @file digital.test.ts
 * @description TDD contract tests for src/lib/formulas/digital.ts
 *
 * Covered:
 *   - Number Base Converter (Binary, Hexadecimal, Decimal, Octal)
 *   - Subnet Mask Calculator (IPv4, CIDR notation)
 *   - Data Rate / Transfer Time Calculator
 *   - Cron Expression Parser
 */

import { describe, it, expect } from 'vitest';
import { convertBase, subnetMask, dataTransferTime, parseCron } from '../../lib/formulas/digital';

// ─────────────────────────────────────────────────────────────────────────────

// Number Base Converter

// ─────────────────────────────────────────────────────────────────────────────

describe('Number Base Converter', () => {
  /**
   * convertBase(value, fromBase, toBase): string
   *
   * Supported bases: 2 (binary), 8 (octal), 10 (decimal), 16 (hex)
   */

  describe('Decimal → Binary', () => {
    it('255 → "11111111"', () => expect(convertBase('255', 10, 2)).toBe('11111111'));
    it('0   → "0"', () => expect(convertBase('0', 10, 2)).toBe('0'));
    it('1   → "1"', () => expect(convertBase('1', 10, 2)).toBe('1'));
    it('10  → "1010"', () => expect(convertBase('10', 10, 2)).toBe('1010'));
    it('42  → "101010"', () => expect(convertBase('42', 10, 2)).toBe('101010'));
  });

  describe('Decimal → Hex', () => {
    it('255  → "FF"', () => expect(convertBase('255', 10, 16).toUpperCase()).toBe('FF'));
    it('16   → "10"', () => expect(convertBase('16', 10, 16).toUpperCase()).toBe('10'));
    it('4095 → "FFF"', () => expect(convertBase('4095', 10, 16).toUpperCase()).toBe('FFF'));
  });

  describe('Binary → Decimal', () => {
    it('"1010" → "10"', () => expect(convertBase('1010', 2, 10)).toBe('10'));
    it('"11111111" → "255"', () => expect(convertBase('11111111', 2, 10)).toBe('255'));
  });

  describe('Hex → Binary', () => {
    it('"FF" → "11111111"', () => expect(convertBase('FF', 16, 2)).toBe('11111111'));
    it('"1"  → "1"', () => expect(convertBase('1', 16, 2)).toBe('1'));
  });

  describe('Octal', () => {
    it('Decimal 8 → Octal "10"', () => expect(convertBase('8', 10, 8)).toBe('10'));
    it('Octal "77" → Decimal "63"', () => expect(convertBase('77', 8, 10)).toBe('63'));
  });

  describe('Round-trips', () => {
    it('Dec 1000 →(bin)→ dec stays 1000', () => {
      const bin = convertBase('1000', 10, 2);
      expect(convertBase(bin, 2, 10)).toBe('1000');
    });

    it('Dec 65535 →(hex)→ dec stays 65535', () => {
      const hex = convertBase('65535', 10, 16);
      expect(convertBase(hex, 16, 10)).toBe('65535');
    });
  });

  describe('Error handling', () => {
    it('throws for digit that does not belong to the specified base', () => {
      expect(() => convertBase('2', 2, 10)).toThrow(); // '2' is invalid binary
    });

    it('throws for unsupported base', () => {
      expect(() => convertBase('5', 10, 3)).toThrow(); // base 3 not supported
    });

    it('throws for empty input string', () => {
      expect(() => convertBase('', 10, 2)).toThrow();
    });
  });
});
