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
} from '../../lib/formulas/digital';

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

