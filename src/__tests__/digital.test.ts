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
import {
    convertBase,
    subnetMask,
    dataTransferTime,
    parseCron,
} from '../lib/formulas/digital';

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

// ─────────────────────────────────────────────────────────────────────────────
// Subnet Mask Calculator
// ─────────────────────────────────────────────────────────────────────────────

describe('Subnet Mask Calculator', () => {
    /**
     * subnetMask(cidr: number): SubnetInfo
     *
     * Returns:
     *   mask        : dotted-decimal string   e.g. "255.255.255.0"
     *   networkBits : number of host-zero bits (= cidr)
     *   hostBits    : 32 - cidr
     *   totalHosts  : 2^hostBits
     *   usableHosts : 2^hostBits - 2  (subtract network & broadcast)
     *   wildcardMask: complement of subnet mask
     */

    it('/24 → "255.255.255.0", 256 total, 254 usable', () => {
        const r = subnetMask(24);
        expect(r.mask).toBe('255.255.255.0');
        expect(r.networkBits).toBe(24);
        expect(r.hostBits).toBe(8);
        expect(r.totalHosts).toBe(256);
        expect(r.usableHosts).toBe(254);
    });

    it('/16 → "255.255.0.0"', () => {
        expect(subnetMask(16).mask).toBe('255.255.0.0');
    });

    it('/8 → "255.0.0.0"', () => {
        expect(subnetMask(8).mask).toBe('255.0.0.0');
    });

    it('/30 → "255.255.255.252", 4 total, 2 usable (point-to-point links)', () => {
        const r = subnetMask(30);
        expect(r.mask).toBe('255.255.255.252');
        expect(r.usableHosts).toBe(2);
    });

    it('/32 → "255.255.255.255", 1 total, 0 usable (host route)', () => {
        const r = subnetMask(32);
        expect(r.mask).toBe('255.255.255.255');
        expect(r.usableHosts).toBe(0);
    });

    it('/0 → "0.0.0.0" (default route)', () => {
        expect(subnetMask(0).mask).toBe('0.0.0.0');
    });

    it('wildcard mask is the bitwise complement of the subnet mask', () => {
        const r = subnetMask(24);
        expect(r.wildcardMask).toBe('0.0.0.255');
    });

    it('throws for CIDR < 0 or > 32', () => {
        expect(() => subnetMask(-1)).toThrow();
        expect(() => subnetMask(33)).toThrow();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Data Transfer Time
// ─────────────────────────────────────────────────────────────────────────────

describe('Data Transfer Time', () => {
    /**
     * dataTransferTime({ fileSizeBytes, speedBitsPerSecond }): DataTransferResult
     *
     * Returns:
     *   seconds          : raw seconds
     *   formatted        : human-readable string (e.g. "4h 26m 40s")
     *   speedMbps        : speed in Mbit/s (for display)
     *   fileSizeGB       : file size in GiB (for display)
     */

    it('100 GB at 50 Mbps = 16 000 s', () => {
        const result = dataTransferTime({
            fileSizeBytes: 100 * 1e9,     // 100 GB (decimal)
            speedBitsPerSecond: 50 * 1e6, // 50 Mbps
        });
        expect(result.seconds).toBeCloseTo(16_000, 0);
    });

    it('1 GB at 1 Gbps = 8 s', () => {
        const result = dataTransferTime({
            fileSizeBytes: 1e9,
            speedBitsPerSecond: 1e9,
        });
        expect(result.seconds).toBeCloseTo(8, 0);
    });

    it('formats seconds correctly: 3661 s → "1h 1m 1s"', () => {
        const result = dataTransferTime({
            fileSizeBytes: 0, // override via pre-known seconds
            speedBitsPerSecond: 1,
            _overrideSeconds: 3661, // internal escape-hatch for testing formatting only
        });
        expect(result.formatted).toBe('1h 1m 1s');
    });

    it('formats sub-minute correctly: 45 s → "45s"', () => {
        const result = dataTransferTime({
            fileSizeBytes: 0,
            speedBitsPerSecond: 1,
            _overrideSeconds: 45,
        });
        expect(result.formatted).toBe('45s');
    });

    it('throws for zero speed', () => {
        expect(() =>
            dataTransferTime({ fileSizeBytes: 1e9, speedBitsPerSecond: 0 })
        ).toThrow();
    });

    it('throws for negative file size', () => {
        expect(() =>
            dataTransferTime({ fileSizeBytes: -1, speedBitsPerSecond: 1e6 })
        ).toThrow();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Cron Expression Parser
// ─────────────────────────────────────────────────────────────────────────────

describe('Cron Expression Parser', () => {
    /**
     * parseCron(expression: string): CronResult
     *
     * Standard 5-field cron: "min hour dom mon dow"
     *
     * Returns:
     *   description : human-readable English description
     *   fields      : parsed object { minute, hour, dom, month, dow }
     *   isValid     : boolean
     */

    it('every minute: "* * * * *"', () => {
        const r = parseCron('* * * * *');
        expect(r.isValid).toBe(true);
        expect(r.description.toLowerCase()).toContain('every minute');
    });

    it('daily at 09:00: "0 9 * * *"', () => {
        const r = parseCron('0 9 * * *');
        expect(r.isValid).toBe(true);
        expect(r.description).toMatch(/9/);      // mentions the hour
        expect(r.description).toMatch(/0|00/);   // mentions the minute
    });

    it('weekdays at 09:00: "0 9 * * 1-5"', () => {
        const r = parseCron('0 9 * * 1-5');
        expect(r.isValid).toBe(true);
        // should mention weekday range somehow
        expect(r.description.toLowerCase()).toMatch(/monday|weekday|1.*5/i);
    });

    it('every 15 minutes: "*/15 * * * *"', () => {
        const r = parseCron('*/15 * * * *');
        expect(r.isValid).toBe(true);
        expect(r.description).toMatch(/15/);
    });

    it('first day of every month at midnight: "0 0 1 * *"', () => {
        const r = parseCron('0 0 1 * *');
        expect(r.isValid).toBe(true);
        expect(r.description).toMatch(/1st|first|day 1/i);
    });

    it('returns isValid=false and description for invalid expression', () => {
        const r = parseCron('99 99 * * *'); // minutes and hours out of range
        expect(r.isValid).toBe(false);
        expect(r.description.toLowerCase()).toMatch(/invalid/);
    });

    it('rejects expression with wrong field count', () => {
        const r = parseCron('0 9 * *'); // only 4 fields
        expect(r.isValid).toBe(false);
    });

    it('parses fields correctly', () => {
        const r = parseCron('30 14 15 6 *');
        expect(r.fields.minute).toBe('30');
        expect(r.fields.hour).toBe('14');
        expect(r.fields.dom).toBe('15');
        expect(r.fields.month).toBe('6');
        expect(r.fields.dow).toBe('*');
    });
});
