/**
 * @file base-converter.test.ts
 * @description Unit tests for number base conversion functions
 */

import { describe, it, expect } from 'vitest';
import { convertBase, subnetMask, dataTransferTime } from '@/lib/formulas/digital';

describe('Digital - Base Conversion', () => {
  it('converts binary to decimal', () => {
    expect(convertBase('1010', 2, 10)).toBe('10');
    expect(convertBase('1111', 2, 10)).toBe('15');
    expect(convertBase('100000000', 2, 10)).toBe('256');
  });

  it('converts decimal to binary', () => {
    expect(convertBase('10', 10, 2)).toBe('1010');
    expect(convertBase('255', 10, 2)).toBe('11111111');
    expect(convertBase('256', 10, 2)).toBe('100000000');
  });

  it('converts hexadecimal to decimal', () => {
    expect(convertBase('FF', 16, 10)).toBe('255');
    expect(convertBase('A', 16, 10)).toBe('10');
    expect(convertBase('100', 16, 10)).toBe('256');
  });

  it('converts decimal to hexadecimal', () => {
    expect(convertBase('255', 10, 16)).toBe('ff');
    expect(convertBase('10', 10, 16)).toBe('a');
    expect(convertBase('4096', 10, 16)).toBe('1000');
  });

  it('converts octal to decimal', () => {
    expect(convertBase('77', 8, 10)).toBe('63');
    expect(convertBase('10', 8, 10)).toBe('8');
  });

  it('converts binary to hexadecimal', () => {
    expect(convertBase('11111111', 2, 16)).toBe('ff');
    expect(convertBase('1010', 2, 16)).toBe('a');
  });

  it('handles case insensitivity', () => {
    expect(convertBase('FF', 16, 10)).toBe('255');
    expect(convertBase('ff', 16, 10)).toBe('255');
    expect(convertBase('Ff', 16, 10)).toBe('255');
  });

  it('throws for empty input', () => {
    expect(() => convertBase('', 2, 10)).toThrow('Empty input string');
  });

  it('throws for unsupported bases', () => {
    expect(() => convertBase('10', 3, 10)).toThrow('Base from not supported');
    expect(() => convertBase('10', 10, 3)).toThrow('Base to not supported');
  });

  it('throws for invalid digits', () => {
    expect(() => convertBase('2', 2, 10)).toThrow('Invalid digit 2 for base 2');
    expect(() => convertBase('G', 16, 10)).toThrow('Invalid digit G for base 16');
  });
});

describe('Digital - Subnet Mask', () => {
  it('calculates /24 subnet mask', () => {
    const result = subnetMask(24);
    expect(result.mask).toBe('255.255.255.0');
    expect(result.networkBits).toBe(24);
    expect(result.hostBits).toBe(8);
    expect(result.totalHosts).toBe(256);
    expect(result.usableHosts).toBe(254);
  });

  it('calculates /16 subnet mask', () => {
    const result = subnetMask(16);
    expect(result.mask).toBe('255.255.0.0');
    expect(result.totalHosts).toBe(65536);
    expect(result.usableHosts).toBe(65534);
  });

  it('calculates /8 subnet mask', () => {
    const result = subnetMask(8);
    expect(result.mask).toBe('255.0.0.0');
    expect(result.hostBits).toBe(24);
  });

  it('calculates /30 subnet mask (point-to-point)', () => {
    const result = subnetMask(30);
    expect(result.mask).toBe('255.255.255.252');
    expect(result.totalHosts).toBe(4);
    expect(result.usableHosts).toBe(2);
  });

  it('calculates /32 subnet mask (single host)', () => {
    const result = subnetMask(32);
    expect(result.mask).toBe('255.255.255.255');
    expect(result.totalHosts).toBe(1);
    expect(result.usableHosts).toBe(0);
  });

  it('calculates wildcard mask', () => {
    const result = subnetMask(24);
    expect(result.wildcardMask).toBe('0.0.0.255');
  });

  it('throws for invalid CIDR', () => {
    expect(() => subnetMask(-1)).toThrow('CIDR must be between 0 and 32');
    expect(() => subnetMask(33)).toThrow('CIDR must be between 0 and 32');
  });
});

describe('Digital - Data Transfer Time', () => {
  it('calculates transfer time correctly', () => {
    // 1 MB file at 1 Mbps = 8 seconds
    const result = dataTransferTime({
      fileSizeBytes: 1024 * 1024,
      speedBitsPerSecond: 1000000,
    });
    expect(result.seconds).toBeCloseTo(8.38, 1);
  });

  it('handles 1 GB file at 100 Mbps', () => {
    const result = dataTransferTime({
      fileSizeBytes: 1024 * 1024 * 1024,
      speedBitsPerSecond: 100000000,
    });
    expect(result.seconds).toBeCloseTo(81.92, 1);
  });

  it('provides human-readable format', () => {
    const result = dataTransferTime({
      fileSizeBytes: 1024 * 1024,
      speedBitsPerSecond: 1000000,
    });
    expect(result.formatted).toContain('second');
  });

  it('throws for negative file size', () => {
    expect(() =>
      dataTransferTime({
        fileSizeBytes: -100,
        speedBitsPerSecond: 1000000,
      })
    ).toThrow('File size cannot be negative');
  });

  it('throws for non-positive speed', () => {
    expect(() =>
      dataTransferTime({
        fileSizeBytes: 1000,
        speedBitsPerSecond: 0,
      })
    ).toThrow('Speed must be positive');

    expect(() =>
      dataTransferTime({
        fileSizeBytes: 1000,
        speedBitsPerSecond: -1000000,
      })
    ).toThrow('Speed must be positive');
  });
});
