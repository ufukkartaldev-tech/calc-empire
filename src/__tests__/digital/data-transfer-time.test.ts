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

