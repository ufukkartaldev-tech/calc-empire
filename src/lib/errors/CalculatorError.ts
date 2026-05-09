/**
 * @file CalculatorError.ts
 * @description Custom error classes for calculator formula layer
 * Provides structured error handling with user-friendly messages and Sentry context
 */

/**
 * Base class for all calculator-related errors
 */
export class CalculatorError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'CalculatorError';
    Object.setPrototypeOf(this, CalculatorError.prototype);
  }

  /**
   * Get Sentry-friendly error context
   */
  toSentryContext(): Record<string, unknown> {
    return {
      errorType: this.name,
      errorCode: this.code,
      ...this.context,
    };
  }
}

/**
 * Validation error for invalid input values
 * Example: "Resistance cannot be zero", "Voltage must be positive"
 */
export class ValidationError extends CalculatorError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', context);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Calculation error for mathematical/physics errors
 * Example: "Division by zero", "Square root of negative number"
 */
export class CalculationError extends CalculatorError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'CALCULATION_ERROR', context);
    this.name = 'CalculationError';
    Object.setPrototypeOf(this, CalculationError.prototype);
  }
}

/**
 * Configuration error for missing or invalid configuration
 * Example: "Solver not found", "Invalid parameter combination"
 */
export class ConfigurationError extends CalculatorError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'CONFIGURATION_ERROR', context);
    this.name = 'ConfigurationError';
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}

/**
 * Utility function to convert generic Error to appropriate CalculatorError
 * Maintains backward compatibility with existing code
 */
export function toCalculatorError(error: unknown): CalculatorError {
  if (error instanceof CalculatorError) {
    return error;
  }

  if (error instanceof Error) {
    // Try to categorize based on error message patterns
    const message = error.message.toLowerCase();

    if (
      message.includes('cannot be zero') ||
      message.includes('must be positive') ||
      message.includes('must be >') ||
      message.includes('empty array') ||
      message.includes('invalid')
    ) {
      return new ValidationError(error.message);
    }

    if (
      message.includes('division by zero') ||
      message.includes('square root') ||
      message.includes('imaginary')
    ) {
      return new CalculationError(error.message);
    }

    if (
      message.includes('not found') ||
      message.includes('unknown') ||
      message.includes('invalid parameter')
    ) {
      return new ConfigurationError(error.message);
    }

    // Default to CalculationError for unknown errors
    return new CalculationError(error.message);
  }

  // Fallback for non-Error objects
  return new CalculationError(String(error));
}
