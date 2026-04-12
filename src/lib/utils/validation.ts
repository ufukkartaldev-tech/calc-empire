/**
 * @file validation.ts
 * @description Centralized input validation layer with XSS and injection protection
 * Provides utilities for sanitizing and validating user inputs across the application
 */

import { z } from 'zod';
import { ValidationError } from '../errors/CalculatorError';

/**
 * XSS prevention patterns
 */
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
  /data:text\/html/gi,
  /data:.*?base64/gi,
];

/**
 * SQL/NoSQL injection patterns
 */
const INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|WHERE|AND|OR)\b)/gi,
  /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\s*\()/gi,
  /(\$where|\$gt|\$lt|\$gte|\$lte|\$ne|\$nin|\$regex|\$options)/gi,
  /(\{\s*\$)/g,
  /;\s*--/g,
  /\/\*.*?\*\//g,
];

/**
 * Command injection patterns
 */
const COMMAND_INJECTION_PATTERNS = [/[;&|`$]/g, /\$\(/g, /`[^`]*`/g, /\|\|/g, /&&/g];

/**
 * Sanitize string input to prevent XSS attacks
 * Removes dangerous HTML tags and JavaScript protocols
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  let sanitized = input;

  // Remove XSS patterns
  XSS_PATTERNS.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, '');
  });

  // Escape HTML entities
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  return sanitized;
}

/**
 * Check if input contains XSS attempts
 * Returns true if XSS detected
 */
export function containsXSS(input: string): boolean {
  if (typeof input !== 'string') {
    return false;
  }

  return XSS_PATTERNS.some((pattern) => pattern.test(input));
}

/**
 * Check if input contains injection attempts
 * Returns true if injection detected
 */
export function containsInjection(input: string): boolean {
  if (typeof input !== 'string') {
    return false;
  }

  return (
    INJECTION_PATTERNS.some((pattern) => pattern.test(input)) ||
    COMMAND_INJECTION_PATTERNS.some((pattern) => pattern.test(input))
  );
}

/**
 * Validate and sanitize calculator numeric input
 * Ensures the value is a safe number for calculations
 */
export function validateNumericInput(
  value: unknown,
  fieldName: string,
  options?: {
    min?: number;
    max?: number;
    allowZero?: boolean;
    allowNegative?: boolean;
    allowDecimal?: boolean;
  }
): number {
  const config = {
    allowZero: true,
    allowNegative: true,
    allowDecimal: true,
    ...options,
  };

  // Check if value is a valid number
  if (value === null || value === undefined || value === '') {
    throw new ValidationError(`${fieldName} is required`, { field: fieldName, value });
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);

  if (Number.isNaN(numValue)) {
    throw new ValidationError(`${fieldName} must be a valid number`, { field: fieldName, value });
  }

  // Check for Infinity
  if (!Number.isFinite(numValue)) {
    throw new ValidationError(`${fieldName} must be a finite number`, { field: fieldName, value });
  }

  // Check zero
  if (!config.allowZero && numValue === 0) {
    throw new ValidationError(`${fieldName} cannot be zero`, { field: fieldName, value });
  }

  // Check negative
  if (!config.allowNegative && numValue < 0) {
    throw new ValidationError(`${fieldName} cannot be negative`, { field: fieldName, value });
  }

  // Check decimal
  if (!config.allowDecimal && !Number.isInteger(numValue)) {
    throw new ValidationError(`${fieldName} must be a whole number`, { field: fieldName, value });
  }

  // Check range
  if (config.min !== undefined && numValue < config.min) {
    throw new ValidationError(`${fieldName} must be at least ${config.min}`, {
      field: fieldName,
      value,
      min: config.min,
    });
  }

  if (config.max !== undefined && numValue > config.max) {
    throw new ValidationError(`${fieldName} must be at most ${config.max}`, {
      field: fieldName,
      value,
      max: config.max,
    });
  }

  return numValue;
}

/**
 * Validate string input with security checks
 */
export function validateStringInput(
  value: unknown,
  fieldName: string,
  options?: {
    minLength?: number;
    maxLength?: number;
    allowEmpty?: boolean;
    pattern?: RegExp;
  }
): string {
  const config = {
    allowEmpty: false,
    maxLength: 1000,
    ...options,
  };

  // Check if value exists
  if (value === null || value === undefined) {
    throw new ValidationError(`${fieldName} is required`, { field: fieldName, value });
  }

  const strValue = String(value).trim();

  // Check empty
  if (!config.allowEmpty && strValue.length === 0) {
    throw new ValidationError(`${fieldName} cannot be empty`, { field: fieldName, value });
  }

  // Check XSS
  if (containsXSS(strValue)) {
    throw new ValidationError(`${fieldName} contains invalid characters`, {
      field: fieldName,
      value: '[REDACTED]',
    });
  }

  // Check injection
  if (containsInjection(strValue)) {
    throw new ValidationError(`${fieldName} contains invalid patterns`, {
      field: fieldName,
      value: '[REDACTED]',
    });
  }

  // Check min length
  if (config.minLength !== undefined && strValue.length < config.minLength) {
    throw new ValidationError(`${fieldName} must be at least ${config.minLength} characters`, {
      field: fieldName,
      value: strValue,
      minLength: config.minLength,
    });
  }

  // Check max length
  if (config.maxLength !== undefined && strValue.length > config.maxLength) {
    throw new ValidationError(`${fieldName} must be at most ${config.maxLength} characters`, {
      field: fieldName,
      value: strValue.substring(0, 20) + '...',
      maxLength: config.maxLength,
    });
  }

  // Check pattern
  if (config.pattern && !config.pattern.test(strValue)) {
    throw new ValidationError(`${fieldName} format is invalid`, {
      field: fieldName,
      value: strValue,
    });
  }

  // Return sanitized value
  return sanitizeString(strValue);
}

/**
 * Safe JSON parse with security validation
 */
export function safeJsonParse<T>(jsonString: string): T {
  if (typeof jsonString !== 'string') {
    throw new ValidationError('Input must be a string', { field: 'json', value: jsonString });
  }

  // Check for prototype pollution patterns
  if (
    jsonString.includes('__proto__') ||
    jsonString.includes('constructor') ||
    jsonString.includes('prototype')
  ) {
    throw new ValidationError('Invalid JSON: contains forbidden patterns', {
      field: 'json',
      value: '[REDACTED]',
    });
  }

  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    throw new ValidationError('Invalid JSON format', {
      field: 'json',
      value: jsonString.substring(0, 50),
    });
  }
}

/**
 * Zod schemas for common calculator inputs
 */
export const CalculatorInputSchemas = {
  /**
   * Schema for positive numeric input
   */
  positiveNumber: z
    .number()
    .finite()
    .refine((val) => !Number.isNaN(val), {
      message: 'Value must be a valid number',
    }),

  /**
   * Schema for non-negative numeric input
   */
  nonNegativeNumber: z.number().finite().min(0, 'Value cannot be negative'),

  /**
   * Schema for angle input (0-360 degrees or 0-2π radians)
   */
  angle: z
    .number()
    .finite()
    .refine((val) => Math.abs(val) <= 360 || Math.abs(val) <= 2 * Math.PI, {
      message: 'Angle must be within valid range',
    }),

  /**
   * Schema for percentage input (0-100)
   */
  percentage: z
    .number()
    .finite()
    .min(0, 'Percentage cannot be negative')
    .max(100, 'Percentage cannot exceed 100'),

  /**
   * Schema for safe string input
   */
  safeString: z
    .string()
    .max(1000, 'String too long')
    .refine((val) => !containsXSS(val), {
      message: 'Input contains invalid characters',
    })
    .refine((val) => !containsInjection(val), {
      message: 'Input contains invalid patterns',
    }),

  /**
   * Schema for unit selection
   */
  unit: z
    .string()
    .max(50)
    .regex(/^[a-zA-Z0-9_\-\/°²³]+$/),

  /**
   * Schema for calculator ID
   */
  calculatorId: z
    .string()
    .max(100)
    .regex(/^[a-zA-Z0-9_-]+$/),
};

/**
 * Validate calculator inputs against schema
 */
export function validateCalculatorInputs<T>(inputs: unknown, schema: z.ZodSchema<T>): T {
  try {
    return schema.parse(inputs);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map(
        (issue: z.ZodIssue) => `${issue.path.join('.')}: ${issue.message}`
      );
      throw new ValidationError(`Validation failed: ${messages.join(', ')}`, {
        field: 'inputs',
        value: '[REDACTED]',
        issues: error.issues,
      });
    }
    throw error;
  }
}

/**
 * Rate limiting helper for input validation
 * Simple in-memory rate limiter for preventing abuse
 */
export class InputRateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts = 100, windowMs = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  /**
   * Check if rate limit is exceeded for a key
   */
  isRateLimited(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];

    // Clean old attempts
    const validAttempts = attempts.filter((time) => now - time < this.windowMs);

    if (validAttempts.length >= this.maxAttempts) {
      return true;
    }

    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    return false;
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.attempts.delete(key);
  }

  /**
   * Get remaining attempts for a key
   */
  getRemainingAttempts(key: string): number {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    const validAttempts = attempts.filter((time) => now - time < this.windowMs);
    return Math.max(0, this.maxAttempts - validAttempts.length);
  }
}

/**
 * Global rate limiter instance
 */
export const globalRateLimiter = new InputRateLimiter(100, 60000);
