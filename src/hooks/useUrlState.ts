/**
 * @file hooks/useUrlState.ts
 * @description URL state management hook for shareable calculator URLs
 *
 * Encodes calculator state to URL parameters and decodes on mount.
 * Implements debouncing, locale preservation, and round-trip validation.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import type { FieldValues, UrlValidationResult, FieldConfig } from '@/types';

interface UseUrlStateOptions {
  maxLength?: number;
  debounceMs?: number;
  precision?: number;
  fieldConfigs?: FieldConfig[];
}

interface UseUrlStateReturn {
  encodeToUrl: (fields: FieldValues) => void;
  decodeFromUrl: () => FieldValues | null;
  validateUrl: (params: URLSearchParams) => UrlValidationResult;
}

const DEFAULT_OPTIONS: Required<Omit<UseUrlStateOptions, 'fieldConfigs'>> = {
  maxLength: 2000,
  debounceMs: 100,
  precision: 6,
};

/**
 * Validate a field value against its constraints
 * @param value The numeric value to validate
 * @param fieldKey The field key for logging
 * @param constraints The field constraints
 * @returns true if valid, false otherwise
 */
function validateFieldConstraints(
  value: number,
  fieldKey: string,
  constraints?: FieldConfig['constraints']
): boolean {
  if (!constraints) return true;

  // Check if zero is allowed
  if (value === 0 && constraints.allowZero === false) {
    return false;
  }

  // Check if negative is allowed
  if (value < 0 && constraints.allowNegative === false) {
    return false;
  }

  // Check minimum constraint
  if (constraints.min !== undefined && value < constraints.min) {
    return false;
  }

  // Check maximum constraint
  if (constraints.max !== undefined && value > constraints.max) {
    return false;
  }

  return true;
}

/**
 * Hook for encoding/decoding calculator state to/from URL parameters
 *
 * Features:
 * - Debounced URL updates (100ms default)
 * - Locale preservation in URL path
 * - Round-trip validation
 * - Shallow routing (no page reload)
 * - Human-readable parameter names
 *
 * @param options Configuration options
 * @returns Encode/decode functions and validation
 */
export function useUrlState(options: UseUrlStateOptions = {}): UseUrlStateReturn {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const opts = { ...DEFAULT_OPTIONS, ...options };
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastEncodedRef = useRef<string>('');

  /**
   * Encode field values to URL search parameters
   * Format: ?fieldKey=value&fieldKey_unit=symbol
   */
  const encodeToUrl = useCallback(
    (fields: FieldValues) => {
      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Debounce URL updates
      debounceTimerRef.current = setTimeout(() => {
        const params = new URLSearchParams();

        // Encode each field value and unit
        for (const [key, fieldValue] of Object.entries(fields)) {
          if (fieldValue.value !== null) {
            // Format numeric value with precision limit
            const formattedValue = Number(fieldValue.value.toFixed(opts.precision));
            params.set(key, formattedValue.toString());
          }

          // Always encode unit selection
          if (fieldValue.unit) {
            params.set(`${key}_unit`, fieldValue.unit);
          }
        }

        const queryString = params.toString();

        // Check URL length constraint
        const fullUrl = `${pathname}?${queryString}`;
        if (fullUrl.length > opts.maxLength) {
          return;
        }

        // Avoid redundant updates
        if (queryString === lastEncodedRef.current) {
          return;
        }

        lastEncodedRef.current = queryString;

        // Update URL with shallow routing (preserves scroll position, no reload)
        router.replace(`${pathname}?${queryString}`, { scroll: false });
      }, opts.debounceMs);
    },
    [router, pathname, opts.debounceMs, opts.maxLength, opts.precision]
  );

  /**
   * Decode URL search parameters to field values
   * Returns null if no valid parameters found
   * Validates against field constraints if provided
   */
  const decodeFromUrl = useCallback((): FieldValues | null => {
    if (typeof window === 'undefined') return null;

    const params = new URLSearchParams(window.location.search);
    const fields: FieldValues = {};
    let hasValidParams = false;

    // Build a map of field constraints for quick lookup
    const constraintsMap = new Map<string, FieldConfig['constraints']>();
    if (options.fieldConfigs) {
      for (const config of options.fieldConfigs) {
        if (config.constraints) {
          constraintsMap.set(config.key, config.constraints);
        }
      }
    }

    // Extract all parameter keys (excluding unit parameters)
    const fieldKeys = Array.from(params.keys()).filter((key) => !key.endsWith('_unit'));

    for (const key of fieldKeys) {
      const valueStr = params.get(key);
      const unitStr = params.get(`${key}_unit`);

      if (valueStr !== null) {
        try {
          const value = parseFloat(valueStr);

          // Validate numeric value
          if (!isNaN(value) && isFinite(value)) {
            // Validate against field constraints
            const constraints = constraintsMap.get(key);
            if (validateFieldConstraints(value, key, constraints)) {
              fields[key] = {
                value,
                unit: unitStr || '',
              };
              hasValidParams = true;
            } else {
              // Invalid parameter - skip it
            }
          } else {
            // Invalid numeric value
          }
        } catch (err) {
          // Failed to parse parameter
        }
      }
    }

    return hasValidParams ? fields : null;
  }, [options.fieldConfigs]);

  /**
   * Validate URL parameters
   * Checks for invalid values, length constraints, and field constraints
   */
  const validateUrl = useCallback(
    (params: URLSearchParams): UrlValidationResult => {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Check URL length
      const queryString = params.toString();
      const fullUrl = `${pathname}?${queryString}`;

      if (fullUrl.length > opts.maxLength) {
        errors.push(`URL length (${fullUrl.length}) exceeds maximum (${opts.maxLength})`);
      }

      // Build a map of field constraints for quick lookup
      const constraintsMap = new Map<string, FieldConfig['constraints']>();
      if (options.fieldConfigs) {
        for (const config of options.fieldConfigs) {
          if (config.constraints) {
            constraintsMap.set(config.key, config.constraints);
          }
        }
      }

      // Validate each parameter
      const fieldKeys = Array.from(params.keys()).filter((key) => !key.endsWith('_unit'));

      for (const key of fieldKeys) {
        const valueStr = params.get(key);

        if (valueStr !== null) {
          try {
            const value = parseFloat(valueStr);

            if (isNaN(value)) {
              warnings.push(`Parameter "${key}" has invalid numeric value: ${valueStr}`);
            } else if (!isFinite(value)) {
              warnings.push(`Parameter "${key}" has non-finite value: ${valueStr}`);
            } else {
              // Check field constraints
              const constraints = constraintsMap.get(key);
              if (constraints) {
                if (value === 0 && constraints.allowZero === false) {
                  warnings.push(`Parameter "${key}" has zero value which is not allowed`);
                }
                if (value < 0 && constraints.allowNegative === false) {
                  warnings.push(`Parameter "${key}" has negative value which is not allowed`);
                }
                if (constraints.min !== undefined && value < constraints.min) {
                  warnings.push(
                    `Parameter "${key}" value ${value} is below minimum ${constraints.min}`
                  );
                }
                if (constraints.max !== undefined && value > constraints.max) {
                  warnings.push(
                    `Parameter "${key}" value ${value} exceeds maximum ${constraints.max}`
                  );
                }
              }
            }
          } catch (err) {
            warnings.push(`Parameter "${key}" failed to parse: ${valueStr}`);
          }
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    },
    [pathname, opts.maxLength, options.fieldConfigs]
  );

  /**
   * Cleanup debounce timer on unmount
   */
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    encodeToUrl,
    decodeFromUrl,
    validateUrl,
  };
}
