/**
 * @file lib/security/utils/validation.ts
 * @description Validation utilities for security services
 */

import { ValidationSchema, ValidationError, SecuritySeverity } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Input Sanitization
// ─────────────────────────────────────────────────────────────────────────────

export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .replace(/[&]/g, '&amp;') // Escape ampersands
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .trim();
}

export function sanitizeHTML(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function sanitizeSQL(input: string): string {
  return input
    .replace(/[';--]/g, '') // Remove SQL injection patterns
    .replace(/\b(DROP|DELETE|INSERT|UPDATE|SELECT|UNION|ALTER|CREATE)\b/gi, '') // Remove SQL keywords
    .trim();
}

export function sanitizeXSS(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/expression\s*\(/gi, '') // Remove CSS expressions
    .trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// Schema Validation
// ─────────────────────────────────────────────────────────────────────────────

export function validateAgainstSchema(
  data: unknown,
  schema: ValidationSchema,
  path: string = ''
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check if required field is missing
  if (schema.required && (data === null || data === undefined)) {
    errors.push({
      field: path || 'root',
      message: 'Required field is missing',
      code: 'REQUIRED_FIELD_MISSING',
      severity: SecuritySeverity.MEDIUM,
    });
    return errors;
  }

  // Skip validation if data is null/undefined and not required
  if (data === null || data === undefined) {
    return errors;
  }

  // Type validation
  switch (schema.type) {
    case 'string':
      if (typeof data !== 'string') {
        errors.push({
          field: path,
          message: `Expected string, got ${typeof data}`,
          code: 'INVALID_TYPE',
          severity: SecuritySeverity.LOW,
        });
        break;
      }

      // String-specific validations
      if (schema.minLength !== undefined && data.length < schema.minLength) {
        errors.push({
          field: path,
          message: `String too short. Minimum length: ${schema.minLength}`,
          code: 'STRING_TOO_SHORT',
          severity: SecuritySeverity.LOW,
        });
      }

      if (schema.maxLength !== undefined && data.length > schema.maxLength) {
        errors.push({
          field: path,
          message: `String too long. Maximum length: ${schema.maxLength}`,
          code: 'STRING_TOO_LONG',
          severity: SecuritySeverity.MEDIUM,
        });
      }

      if (schema.pattern && !schema.pattern.test(data)) {
        errors.push({
          field: path,
          message: 'String does not match required pattern',
          code: 'PATTERN_MISMATCH',
          severity: SecuritySeverity.MEDIUM,
        });
      }
      break;

    case 'number':
      if (typeof data !== 'number' || isNaN(data)) {
        errors.push({
          field: path,
          message: `Expected number, got ${typeof data}`,
          code: 'INVALID_TYPE',
          severity: SecuritySeverity.LOW,
        });
        break;
      }

      if (schema.min !== undefined && data < schema.min) {
        errors.push({
          field: path,
          message: `Number too small. Minimum: ${schema.min}`,
          code: 'NUMBER_TOO_SMALL',
          severity: SecuritySeverity.LOW,
        });
      }

      if (schema.max !== undefined && data > schema.max) {
        errors.push({
          field: path,
          message: `Number too large. Maximum: ${schema.max}`,
          code: 'NUMBER_TOO_LARGE',
          severity: SecuritySeverity.MEDIUM,
        });
      }
      break;

    case 'boolean':
      if (typeof data !== 'boolean') {
        errors.push({
          field: path,
          message: `Expected boolean, got ${typeof data}`,
          code: 'INVALID_TYPE',
          severity: SecuritySeverity.LOW,
        });
      }
      break;

    case 'array':
      if (!Array.isArray(data)) {
        errors.push({
          field: path,
          message: `Expected array, got ${typeof data}`,
          code: 'INVALID_TYPE',
          severity: SecuritySeverity.LOW,
        });
        break;
      }

      // Validate array items if schema provided
      if (schema.items) {
        data.forEach((item, index) => {
          const itemErrors = validateAgainstSchema(item, schema.items!, `${path}[${index}]`);
          errors.push(...itemErrors);
        });
      }
      break;

    case 'object':
      if (typeof data !== 'object' || Array.isArray(data)) {
        errors.push({
          field: path,
          message: `Expected object, got ${typeof data}`,
          code: 'INVALID_TYPE',
          severity: SecuritySeverity.LOW,
        });
        break;
      }

      // Validate object properties if schema provided
      if (schema.properties) {
        const dataObj = data as Record<string, unknown>;

        Object.entries(schema.properties).forEach(([key, propSchema]) => {
          const propPath = path ? `${path}.${key}` : key;
          const propErrors = validateAgainstSchema(dataObj[key], propSchema, propPath);
          errors.push(...propErrors);
        });
      }
      break;
  }

  return errors;
}

// ─────────────────────────────────────────────────────────────────────────────
// Common Validation Patterns
// ─────────────────────────────────────────────────────────────────────────────

export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  ipv6: /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
  url: /^https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?$/,
  jwt: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/,
  base64: /^[A-Za-z0-9+/]*={0,2}$/,
  hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
};

// ─────────────────────────────────────────────────────────────────────────────
// Specific Validators
// ─────────────────────────────────────────────────────────────────────────────

export function validateEmail(email: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!ValidationPatterns.email.test(email)) {
    errors.push({
      field: 'email',
      message: 'Invalid email format',
      code: 'INVALID_EMAIL',
      severity: SecuritySeverity.LOW,
    });
  }

  if (email.length > 254) {
    errors.push({
      field: 'email',
      message: 'Email too long',
      code: 'EMAIL_TOO_LONG',
      severity: SecuritySeverity.LOW,
    });
  }

  return errors;
}

export function validatePassword(password: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (password.length < 8) {
    errors.push({
      field: 'password',
      message: 'Password must be at least 8 characters long',
      code: 'PASSWORD_TOO_SHORT',
      severity: SecuritySeverity.HIGH,
    });
  }

  if (password.length > 128) {
    errors.push({
      field: 'password',
      message: 'Password too long',
      code: 'PASSWORD_TOO_LONG',
      severity: SecuritySeverity.LOW,
    });
  }

  if (!ValidationPatterns.strongPassword.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password must contain uppercase, lowercase, number, and special character',
      code: 'PASSWORD_TOO_WEAK',
      severity: SecuritySeverity.HIGH,
    });
  }

  return errors;
}

export function validateURL(url: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!ValidationPatterns.url.test(url)) {
    errors.push({
      field: 'url',
      message: 'Invalid URL format',
      code: 'INVALID_URL',
      severity: SecuritySeverity.MEDIUM,
    });
  }

  // Check for suspicious protocols
  const suspiciousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  if (suspiciousProtocols.some((protocol) => url.toLowerCase().startsWith(protocol))) {
    errors.push({
      field: 'url',
      message: 'Suspicious URL protocol detected',
      code: 'SUSPICIOUS_URL_PROTOCOL',
      severity: SecuritySeverity.HIGH,
    });
  }

  return errors;
}

export function validateJWT(token: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!ValidationPatterns.jwt.test(token)) {
    errors.push({
      field: 'token',
      message: 'Invalid JWT format',
      code: 'INVALID_JWT_FORMAT',
      severity: SecuritySeverity.HIGH,
    });
    return errors;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    errors.push({
      field: 'token',
      message: 'JWT must have exactly 3 parts',
      code: 'INVALID_JWT_STRUCTURE',
      severity: SecuritySeverity.HIGH,
    });
  }

  return errors;
}

// ─────────────────────────────────────────────────────────────────────────────
// File Validation
// ─────────────────────────────────────────────────────────────────────────────

export function validateFileType(filename: string, allowedTypes: string[]): ValidationError[] {
  const errors: ValidationError[] = [];

  const extension = filename.toLowerCase().split('.').pop();
  if (!extension) {
    errors.push({
      field: 'filename',
      message: 'File must have an extension',
      code: 'MISSING_FILE_EXTENSION',
      severity: SecuritySeverity.MEDIUM,
    });
    return errors;
  }

  if (!allowedTypes.includes(extension)) {
    errors.push({
      field: 'filename',
      message: `File type .${extension} not allowed`,
      code: 'INVALID_FILE_TYPE',
      severity: SecuritySeverity.MEDIUM,
    });
  }

  return errors;
}

export function validateFileSize(size: number, maxSize: number): ValidationError[] {
  const errors: ValidationError[] = [];

  if (size > maxSize) {
    errors.push({
      field: 'fileSize',
      message: `File size ${size} exceeds maximum ${maxSize}`,
      code: 'FILE_TOO_LARGE',
      severity: SecuritySeverity.MEDIUM,
    });
  }

  if (size <= 0) {
    errors.push({
      field: 'fileSize',
      message: 'File size must be greater than 0',
      code: 'INVALID_FILE_SIZE',
      severity: SecuritySeverity.LOW,
    });
  }

  return errors;
}

// ─────────────────────────────────────────────────────────────────────────────
// Request Validation
// ─────────────────────────────────────────────────────────────────────────────

export function validateRequestHeaders(headers: Record<string, string>): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check for suspicious headers
  const suspiciousHeaders = ['x-forwarded-host', 'x-real-ip'];
  suspiciousHeaders.forEach((header) => {
    if (headers[header]) {
      errors.push({
        field: header,
        message: `Suspicious header detected: ${header}`,
        code: 'SUSPICIOUS_HEADER',
        severity: SecuritySeverity.MEDIUM,
      });
    }
  });

  // Validate User-Agent
  if (headers['user-agent']) {
    const userAgent = headers['user-agent'];
    if (userAgent.length > 1000) {
      errors.push({
        field: 'user-agent',
        message: 'User-Agent header too long',
        code: 'USER_AGENT_TOO_LONG',
        severity: SecuritySeverity.LOW,
      });
    }

    // Check for bot patterns
    const botPatterns = /bot|crawler|spider|scraper/i;
    if (botPatterns.test(userAgent)) {
      errors.push({
        field: 'user-agent',
        message: 'Bot detected in User-Agent',
        code: 'BOT_DETECTED',
        severity: SecuritySeverity.LOW,
      });
    }
  }

  return errors;
}

export function validateIPAddress(ip: string): ValidationError[] {
  const errors: ValidationError[] = [];

  const isValidIPv4 = ValidationPatterns.ipv4.test(ip);
  const isValidIPv6 = ValidationPatterns.ipv6.test(ip);

  if (!isValidIPv4 && !isValidIPv6) {
    errors.push({
      field: 'ipAddress',
      message: 'Invalid IP address format',
      code: 'INVALID_IP_ADDRESS',
      severity: SecuritySeverity.LOW,
    });
  }

  // Check for private/local IP ranges
  const privateRanges = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^127\./,
    /^::1$/,
    /^fc00:/,
    /^fe80:/,
  ];

  if (privateRanges.some((range) => range.test(ip))) {
    errors.push({
      field: 'ipAddress',
      message: 'Private IP address detected',
      code: 'PRIVATE_IP_ADDRESS',
      severity: SecuritySeverity.LOW,
    });
  }

  return errors;
}
