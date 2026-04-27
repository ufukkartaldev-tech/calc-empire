/**
 * @file lib/security/config/security.config.ts
 * @description Security configuration management system
 *
 * This file provides centralized configuration management for all security
 * services with environment-specific settings and validation.
 */

import {
  SecurityConfig,
  Environment,
  SecurityEventType,
  RateLimitConfig,
  CSPConfig,
  CORSConfig,
  MonitoringConfig,
  ValidationConfig,
  SecretConfig,
} from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Environment Detection
// ─────────────────────────────────────────────────────────────────────────────

export function getCurrentEnvironment(): Environment {
  const nodeEnv = process.env.NODE_ENV;
  const vercelEnv = process.env.VERCEL_ENV;

  if (vercelEnv === 'production' || nodeEnv === 'production') {
    return Environment.PRODUCTION;
  }

  if (vercelEnv === 'preview') {
    return Environment.STAGING;
  }

  return Environment.DEVELOPMENT;
}

// ─────────────────────────────────────────────────────────────────────────────
// Default Configurations by Environment
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_SECRET_CONFIG: SecretConfig = {
  provider: 'env',
  rotationEnabled: false,
  rotationIntervalDays: 90,
  requiredSecrets: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXTAUTH_SECRET',
    'NEXT_PUBLIC_SENTRY_DSN',
  ],
};

const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  windowSizeMs: 60000, // 1 minute
  maxRequests: 100,
  burstLimit: 20,
  penaltyMultiplier: 2,
};

const DEFAULT_CSP_CONFIG: CSPConfig = {
  enabled: true,
  reportOnly: false,
  reportUri: '/api/security/csp-report',
  policies: {
    default: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'nonce-{nonce}'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Will be replaced with hashes
      imgSrc: ["'self'", 'blob:', 'data:', 'https://flagcdn.com'],
      connectSrc: ["'self'", 'https://*.sentry.io'],
      fontSrc: ["'self'"],
      reportUri: '/api/security/csp-report',
    },
  },
};

const DEFAULT_CORS_CONFIG: CORSConfig = {
  allowedOrigins: ['http://localhost:3000'],
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400, // 24 hours
  credentials: true,
};

const DEFAULT_MONITORING_CONFIG: MonitoringConfig = {
  enabledEvents: [
    SecurityEventType.AUTH_FAILURE,
    SecurityEventType.RATE_LIMIT_EXCEEDED,
    SecurityEventType.CSP_VIOLATION,
    SecurityEventType.INVALID_INPUT,
    SecurityEventType.UNAUTHORIZED_ACCESS,
  ],
  logLevel: 'info',
  retentionDays: 30,
  alertingEnabled: true,
  privacyMode: true,
  sessionReplaySampleRate: 0.1,
};

const DEFAULT_VALIDATION_CONFIG: ValidationConfig = {
  maxRequestSize: 10 * 1024 * 1024, // 10MB
  maxParameterCount: 100,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedFileTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'text/csv',
  ],
  requestTimeout: 30000, // 30 seconds
};

// ─────────────────────────────────────────────────────────────────────────────
// Environment-Specific Configurations
// ─────────────────────────────────────────────────────────────────────────────

const DEVELOPMENT_CONFIG: Partial<SecurityConfig> = {
  secrets: {
    ...DEFAULT_SECRET_CONFIG,
    provider: 'env',
    rotationEnabled: false,
  },
  rateLimiting: {
    ...DEFAULT_RATE_LIMIT_CONFIG,
    maxRequests: 1000, // More lenient for development
    windowSizeMs: 60000,
  },
  csp: {
    ...DEFAULT_CSP_CONFIG,
    reportOnly: true, // Non-blocking in development
    policies: {
      default: {
        ...DEFAULT_CSP_CONFIG.policies.default,
        scriptSrc: ["'self'", "'unsafe-eval'", "'unsafe-inline'"], // Allow for dev tools
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  },
  cors: {
    ...DEFAULT_CORS_CONFIG,
    allowedOrigins: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  },
  monitoring: {
    ...DEFAULT_MONITORING_CONFIG,
    logLevel: 'debug',
    alertingEnabled: false,
    sessionReplaySampleRate: 0,
  },
};

const STAGING_CONFIG: Partial<SecurityConfig> = {
  secrets: {
    ...DEFAULT_SECRET_CONFIG,
    provider: 'env',
    rotationEnabled: true,
    rotationIntervalDays: 30,
  },
  rateLimiting: {
    ...DEFAULT_RATE_LIMIT_CONFIG,
    maxRequests: 200,
    penaltyMultiplier: 1.5,
  },
  csp: {
    ...DEFAULT_CSP_CONFIG,
    reportOnly: false,
    policies: {
      default: {
        ...DEFAULT_CSP_CONFIG.policies.default,
        scriptSrc: ["'self'", "'nonce-{nonce}'"],
        styleSrc: ["'self'", "'sha256-{hash}'"],
      },
    },
  },
  cors: {
    ...DEFAULT_CORS_CONFIG,
    allowedOrigins: ['https://staging.calcempire.com', 'https://*.vercel.app'],
  },
  monitoring: {
    ...DEFAULT_MONITORING_CONFIG,
    logLevel: 'info',
    alertingEnabled: true,
    sessionReplaySampleRate: 0.05,
  },
};

const PRODUCTION_CONFIG: Partial<SecurityConfig> = {
  secrets: {
    ...DEFAULT_SECRET_CONFIG,
    provider: 'vault', // Use secure vault in production
    rotationEnabled: true,
    rotationIntervalDays: 90,
    requiredSecrets: [
      ...DEFAULT_SECRET_CONFIG.requiredSecrets,
      'CALCULATION_ADMIN_KEY',
      'REDIS_URL',
      'VAULT_TOKEN',
    ],
  },
  rateLimiting: {
    ...DEFAULT_RATE_LIMIT_CONFIG,
    maxRequests: 100,
    penaltyMultiplier: 3,
  },
  csp: {
    ...DEFAULT_CSP_CONFIG,
    reportOnly: false,
    policies: {
      default: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'nonce-{nonce}'"],
        styleSrc: ["'self'", "'sha256-{hash}'"],
        imgSrc: ["'self'", 'blob:', 'data:', 'https://flagcdn.com'],
        connectSrc: ["'self'", 'https://*.sentry.io'],
        fontSrc: ["'self'"],
        reportUri: '/api/security/csp-report',
      },
    },
  },
  cors: {
    ...DEFAULT_CORS_CONFIG,
    allowedOrigins: ['https://calcempire.com', 'https://www.calcempire.com'],
    credentials: true,
  },
  monitoring: {
    ...DEFAULT_MONITORING_CONFIG,
    enabledEvents: Object.values(SecurityEventType),
    logLevel: 'warn',
    alertingEnabled: true,
    privacyMode: true,
    sessionReplaySampleRate: 0.01, // Very low in production for privacy
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Configuration Builder
// ─────────────────────────────────────────────────────────────────────────────

export function buildSecurityConfig(environment?: Environment): SecurityConfig {
  const env = environment || getCurrentEnvironment();

  let envConfig: Partial<SecurityConfig>;

  switch (env) {
    case Environment.PRODUCTION:
      envConfig = PRODUCTION_CONFIG;
      break;
    case Environment.STAGING:
      envConfig = STAGING_CONFIG;
      break;
    case Environment.DEVELOPMENT:
    default:
      envConfig = DEVELOPMENT_CONFIG;
      break;
  }

  return {
    environment: env,
    secrets: envConfig.secrets || DEFAULT_SECRET_CONFIG,
    rateLimiting: envConfig.rateLimiting || DEFAULT_RATE_LIMIT_CONFIG,
    csp: envConfig.csp || DEFAULT_CSP_CONFIG,
    cors: envConfig.cors || DEFAULT_CORS_CONFIG,
    monitoring: envConfig.monitoring || DEFAULT_MONITORING_CONFIG,
    validation: envConfig.validation || DEFAULT_VALIDATION_CONFIG,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Configuration Validation
// ─────────────────────────────────────────────────────────────────────────────

export function validateSecurityConfig(config: SecurityConfig): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate secrets configuration
  if (!config.secrets.requiredSecrets.length) {
    errors.push('No required secrets specified');
  }

  // Validate rate limiting
  if (config.rateLimiting.maxRequests <= 0) {
    errors.push('Rate limit maxRequests must be positive');
  }

  if (config.rateLimiting.windowSizeMs <= 0) {
    errors.push('Rate limit windowSizeMs must be positive');
  }

  // Validate CSP configuration
  if (config.csp.enabled && !config.csp.policies.default) {
    errors.push('CSP enabled but no default policy specified');
  }

  // Validate CORS configuration
  if (!config.cors.allowedOrigins.length) {
    warnings.push('No CORS origins specified - API will reject all cross-origin requests');
  }

  // Validate monitoring configuration
  if (!config.monitoring.enabledEvents.length) {
    warnings.push('No security events enabled for monitoring');
  }

  // Environment-specific validations
  if (config.environment === Environment.PRODUCTION) {
    if (config.csp.reportOnly) {
      warnings.push('CSP is in report-only mode in production');
    }

    if (config.monitoring.logLevel === 'debug') {
      warnings.push('Debug logging enabled in production');
    }

    if (config.monitoring.sessionReplaySampleRate > 0.1) {
      warnings.push('High session replay sample rate in production may impact privacy');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Configuration Utilities
// ─────────────────────────────────────────────────────────────────────────────

export function getEndpointRateLimit(endpoint: string, config: SecurityConfig): RateLimitConfig {
  // Special rate limits for specific endpoints
  const endpointLimits: Record<string, Partial<RateLimitConfig>> = {
    '/api/calculate': {
      maxRequests: config.rateLimiting.maxRequests * 2, // More lenient for calculations
      burstLimit: config.rateLimiting.burstLimit * 2,
    },
    '/api/auth': {
      maxRequests: Math.floor(config.rateLimiting.maxRequests * 0.1), // Strict for auth
      penaltyMultiplier: config.rateLimiting.penaltyMultiplier * 2,
    },
    '/api/admin': {
      maxRequests: Math.floor(config.rateLimiting.maxRequests * 0.05), // Very strict for admin
      penaltyMultiplier: config.rateLimiting.penaltyMultiplier * 5,
    },
  };

  const endpointConfig = endpointLimits[endpoint];
  if (!endpointConfig) {
    return config.rateLimiting;
  }

  return {
    ...config.rateLimiting,
    ...endpointConfig,
  };
}

export function getCSPPolicyForEndpoint(endpoint: string, config: SecurityConfig) {
  // Different CSP policies for different endpoints
  if (endpoint.startsWith('/admin')) {
    return {
      ...config.csp.policies.default,
      scriptSrc: ["'self'"], // No inline scripts for admin
      styleSrc: ["'self'"], // No inline styles for admin
    };
  }

  return config.csp.policies.default;
}

export function getCORSConfigForEndpoint(endpoint: string, config: SecurityConfig) {
  // API endpoints may have different CORS policies
  if (endpoint.startsWith('/api/public')) {
    return {
      ...config.cors,
      allowedOrigins: ['*'], // Public APIs allow all origins
      credentials: false,
    };
  }

  return config.cors;
}

// ─────────────────────────────────────────────────────────────────────────────
// Export default configuration
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_SECURITY_CONFIG = buildSecurityConfig();
