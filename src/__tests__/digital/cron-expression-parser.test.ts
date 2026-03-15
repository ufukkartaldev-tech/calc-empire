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
    expect(r.description).toMatch(/9/); // mentions the hour
    expect(r.description).toMatch(/0|00/); // mentions the minute
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
