import Big from 'big.js';

/**
 * @file math.ts
 * @description Utility functions for mathematical operations
 */

/**
 * Add two numbers
 */
export const add = (a: number, b: number): number => {
  return new Big(a).plus(b).toNumber();
};

/**
 * Format number with commas for thousands separator
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US');
};

/**
 * Round number to specified decimal places
 */
export const roundToDecimal = (num: number, decimals: number = 2): number => {
  return new Big(num).round(decimals).toNumber();
};

/**
 * Clamp number between min and max
 */
export const clamp = (num: number, min: number, max: number): number => {
  return Math.min(Math.max(num, min), max);
};

/**
 * Calculate percentage change
 */
export const percentageChange = (oldVal: number, newVal: number): number => {
  if (oldVal === 0) return 0;
  return new Big(newVal).minus(oldVal).div(Math.abs(oldVal)).times(100).toNumber();
};

/**
 * Generate random integer between min and max (inclusive)
 */
export const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Calculate factorial of a number
 */
export const factorial = (n: number): number => {
  if (n < 0) throw new Error('Factorial not defined for negative numbers');
  if (n === 0 || n === 1) return 1;
  let result = new Big(1);
  for (let i = 2; i <= n; i++) {
    result = result.times(i);
  }
  return result.toNumber();
};

/**
 * Calculate nCr (combinations)
 */
export const nCr = (n: number, r: number): number => {
  if (r < 0 || r > n) return 0;
  if (r === 0 || r === n) return 1;
  // Use more efficient way to avoid huge factorials if possible
  let res = new Big(1);
  const k = r > n / 2 ? n - r : r;
  for (let i = 1; i <= k; i++) {
    res = res.times(n - i + 1).div(i);
  }
  return res.toNumber();
};

/**
 * Calculate nPr (permutations)
 */
export const nPr = (n: number, r: number): number => {
  if (r < 0 || r > n) return 0;
  let res = new Big(1);
  for (let i = 0; i < r; i++) {
    res = res.times(n - i);
  }
  return res.toNumber();
};
