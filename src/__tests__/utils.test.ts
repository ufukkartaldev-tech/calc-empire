/**
 * @file utils.test.ts
 * @description Unit tests for utility functions
 * 
 * Tests: Math utilities, formatting helpers
 */

import { describe, it, expect } from 'vitest';
import { formatNumber, roundToDecimal } from '@/lib/math';

describe('Utility Functions', () => {
    describe('formatNumber', () => {
        it('should format large numbers with commas', () => {
            expect(formatNumber(1000000)).toBe('1,000,000');
        });

        it('should format decimal numbers', () => {
            expect(formatNumber(1234.567)).toBe('1,234.567');
        });
    });

    describe('roundToDecimal', () => {
        it('should round to 2 decimal places', () => {
            expect(roundToDecimal(3.14159, 2)).toBe(3.14);
        });

        it('should round to 4 decimal places', () => {
            expect(roundToDecimal(3.14159, 4)).toBe(3.1416);
        });
    });
});
