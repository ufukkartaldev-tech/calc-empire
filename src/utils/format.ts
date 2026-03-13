/**
 * @file utils/format.ts
 * @description Formatting utility functions
 */

import Big from 'big.js';
import { SCIENTIFIC_NOTATION_THRESHOLD, MAX_DECIMAL_PLACES } from '@/constants';

/**
 * Format a number for display with proper precision
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Format calculation result with scientific notation for extreme values
 */
export function formatResult(value: number): string {
  if (value === 0) return "0";
  
  try {
    const b = new Big(value);
    const absValue = Math.abs(value);
    
    // Use scientific notation for very small or very large numbers
    if (absValue < SCIENTIFIC_NOTATION_THRESHOLD.MIN || absValue > SCIENTIFIC_NOTATION_THRESHOLD.MAX) {
      return b.toExponential(4);
    }
    
    // Otherwise, round to max decimal places and remove trailing zeros
    return parseFloat(b.toFixed(MAX_DECIMAL_PLACES)).toString();
  } catch {
    return value.toString();
  }
}

/**
 * Round number to specified decimal places
 */
export function roundToDecimal(num: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

/**
 * Clamp a number between min and max
 */
export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}
