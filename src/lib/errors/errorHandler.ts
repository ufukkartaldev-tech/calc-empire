/**
 * @file errorHandler.ts
 * @description Global error handling utility for calculator errors
 * Integrates with Sentry for error tracking and provides user-friendly error messages
 */

import * as Sentry from '@sentry/nextjs';
import {
  CalculatorError,
  ValidationError,
  CalculationError,
  ConfigurationError,
  toCalculatorError,
} from './CalculatorError';

/**
 * Error severity levels for UI display
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

/**
 * Structured error information for UI display
 */
export interface ErrorDisplayInfo {
  message: string;
  severity: ErrorSeverity;
  isUserError: boolean;
  details?: string;
}

/**
 * Global error handler for calculator errors
 */
export class ErrorHandler {
  /**
   * Handle an error from the formula layer
   * Logs to Sentry and returns user-friendly display information
   */
  static handleFormulaError(error: unknown, context?: {
    calculatorId?: string;
    fieldKey?: string;
    inputValues?: Record<string, unknown>;
  }): ErrorDisplayInfo {
    const calculatorError = toCalculatorError(error);
    
    // Log to Sentry with enhanced context
    this.logToSentry(calculatorError, context);
    
    // Return user-friendly display information
    return this.toDisplayInfo(calculatorError);
  }

  /**
   * Log error to Sentry with appropriate context
   */
  private static logToSentry(error: CalculatorError, context?: {
    calculatorId?: string;
    fieldKey?: string;
    inputValues?: Record<string, unknown>;
  }): void {
    // Don't log validation errors to Sentry in production (user errors)
    // Only log calculation and configuration errors
    if (error instanceof ValidationError) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[ValidationError]', error.message, error.context);
      }
      return;
    }

    // Log calculation and configuration errors to Sentry
    Sentry.captureException(error, {
      tags: {
        errorType: error.name,
        errorCode: error.code,
        calculatorId: context?.calculatorId || 'unknown',
      },
      extra: {
        ...error.toSentryContext(),
        ...context,
      },
      level: error instanceof ConfigurationError ? 'error' : 'warning',
    });
  }

  /**
   * Convert calculator error to user-friendly display information
   */
  private static toDisplayInfo(error: CalculatorError): ErrorDisplayInfo {
    if (error instanceof ValidationError) {
      return {
        message: error.message,
        severity: ErrorSeverity.LOW,
        isUserError: true,
      };
    }

    if (error instanceof CalculationError) {
      return {
        message: error.message,
        severity: ErrorSeverity.MEDIUM,
        isUserError: true,
        details: 'Please check your input values and try again.',
      };
    }

    if (error instanceof ConfigurationError) {
      return {
        message: error.message,
        severity: ErrorSeverity.HIGH,
        isUserError: false,
        details: 'This is a system error. Please try again or contact support.',
      };
    }

    // Fallback for unknown error types
    return {
      message: error.message || 'An unexpected error occurred',
      severity: ErrorSeverity.HIGH,
      isUserError: false,
      details: 'Please try again or contact support if the problem persists.',
    };
  }

  /**
   * Create a validation error with common patterns
   */
  static createValidationError(
    field: string,
    condition: string,
    value?: unknown
  ): ValidationError {
    const message = `${field} ${condition}${value !== undefined ? ` (got: ${value})` : ''}`;
    return new ValidationError(message, { field, value });
  }

  /**
   * Create a calculation error
   */
  static createCalculationError(
    operation: string,
    reason: string
  ): CalculationError {
    const message = `${operation} failed: ${reason}`;
    return new CalculationError(message, { operation, reason });
  }
}
