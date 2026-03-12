/**
 * @file math.ts
 * @description Utility functions for mathematical operations
 */

/**
 * Add two numbers
 * @param a First number
 * @param b Second number
 * @returns Sum of a and b
 */
export const add = (a: number, b: number): number => {
    return a + b;
};

/**
 * Format number with commas for thousands separator
 * @param num Number to format
 * @returns Formatted string
 */
export const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US');
};

/**
 * Round number to specified decimal places
 * @param num Number to round
 * @param decimals Number of decimal places
 * @returns Rounded number
 */
export const roundToDecimal = (num: number, decimals: number = 2): number => {
    const factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
};

/**
 * Clamp number between min and max
 * @param num Number to clamp
 * @param min Minimum value
 * @param max Maximum value
 * @returns Clamped number
 */
export const clamp = (num: number, min: number, max: number): number => {
    return Math.min(Math.max(num, min), max);
};

/**
 * Calculate percentage change
 * @param oldVal Original value
 * @param newVal New value
 * @returns Percentage change (positive = increase, negative = decrease)
 */
export const percentageChange = (oldVal: number, newVal: number): number => {
    if (oldVal === 0) return 0;
    return ((newVal - oldVal) / Math.abs(oldVal)) * 100;
};

/**
 * Generate random integer between min and max (inclusive)
 * @param min Minimum value
 * @param max Maximum value
 * @returns Random integer
 */
export const randomInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Calculate factorial of a number
 * @param n Non-negative integer
 * @returns Factorial of n
 */
export const factorial = (n: number): number => {
    if (n < 0) throw new Error('Factorial not defined for negative numbers');
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
};

/**
 * Calculate nCr (combinations)
 * @param n Total items
 * @param r Items to choose
 * @returns Number of combinations
 */
export const nCr = (n: number, r: number): number => {
    if (r < 0 || r > n) return 0;
    if (r === 0 || r === n) return 1;
    return factorial(n) / (factorial(r) * factorial(n - r));
};

/**
 * Calculate nPr (permutations)
 * @param n Total items
 * @param r Items to arrange
 * @returns Number of permutations
 */
export const nPr = (n: number, r: number): number => {
    if (r < 0 || r > n) return 0;
    return factorial(n) / factorial(n - r);
};
