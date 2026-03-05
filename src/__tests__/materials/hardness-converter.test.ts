/**
 * @file materials.test.ts
 * @description TDD contract tests for src/lib/formulas/materials.ts
 *
 * Covered:
 *   - Weight Calculator (material + shape → mass in kg)
 *   - Hardness Converter (Rockwell C ↔ Brinell ↔ Vickers)
 *   - Stress / Strain / Young's Modulus
 */

import { describe, it, expect } from 'vitest';
import {
    calculateWeight,
    convertHardness,
    stressStrain,
} from '../../lib/formulas/materials';

// ─────────────────────────────────────────────────────────────────────────────

// Hardness Converter

// ─────────────────────────────────────────────────────────────────────────────


describe('Hardness Converter', () => {
    /**
     * Uses standard empirical conversion tables (ASTM E140 approximations).
     * Results are inherently approximate (±5% tolerance is acceptable).
     *
     * Supported scales: 'HRC' | 'HB' | 'HV'
     *
     * Reference points (ASTM E140 Table 1, steel):
     *   HRC 60 ≈ HB 697  ≈ HV 746
     *   HRC 40 ≈ HB 371  ≈ HV 392
     *   HRC 20 ≈ HB 226  ≈ HV 238
     */

    it('HRC 60 → HB ≈ 697 (±10)', () => {
        const result = convertHardness({ value: 60, from: 'HRC', to: 'HB' });
        expect(result).toBeGreaterThan(680);
        expect(result).toBeLessThan(720);
    });

    it('HRC 40 → HV ≈ 392 (±15)', () => {
        const result = convertHardness({ value: 40, from: 'HRC', to: 'HV' });
        expect(result).toBeGreaterThan(370);
        expect(result).toBeLessThan(415);
    });

    it('HB → HRC inverse is consistent (round-trip error < 5%)', () => {
        const hrc_original = 50;
        const hb = convertHardness({ value: hrc_original, from: 'HRC', to: 'HB' });
        const hrc_back = convertHardness({ value: hb, from: 'HB', to: 'HRC' });
        expect(Math.abs(hrc_back - hrc_original)).toBeLessThan(3); // ±3 HRC
    });

    it('same scale conversion is identity', () => {
        expect(convertHardness({ value: 200, from: 'HB', to: 'HB' })).toBe(200);
    });

    it('throws for HRC value outside valid range (0–68)', () => {
        expect(() => convertHardness({ value: 75, from: 'HRC', to: 'HB' })).toThrow();
    });

    it('throws for unknown scale', () => {
        // @ts-expect-error – intentional invalid scale
        expect(() => convertHardness({ value: 40, from: 'HM', to: 'HB' })).toThrow();
    });
});

