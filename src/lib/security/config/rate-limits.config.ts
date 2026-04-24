/**
 * @file lib/security/config/rate-limits.config.ts
 * @description Rate limiting configuration for different endpoints and user types
 */

import { RateLimitConfig } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Endpoint-Specific Rate Limits
// ─────────────────────────────────────────────────────────────────────────────

export const ENDPOINT_RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Authentication endpoints - very strict
  '/api/auth/signin': {
    windowSizeMs: 300000, // 5 minutes
    maxRequests: 5,
    burstLimit: 2,
    penaltyMultiplier: 5,
  },

  '/api/auth/signup': {
    windowSizeMs: 3600000, // 1 hour
    maxRequests: 3,
    burstLimit: 1,
    penaltyMultiplier: 10,
  },

  '/api/auth/reset-password': {
    windowSizeMs: 3600000, // 1 hour
    maxRequests: 3,
    burstLimit: 1,
    penaltyMultiplier: 5,
  },

  // Admin endpoints - extremely strict
  '/api/admin': {
    windowSizeMs: 60000, // 1 minute
    maxRequests: 10,
    burstLimit: 3,
    penaltyMultiplier: 10,
  },

  // Calculator endpoints - moderate
  '/api/calculate': {
    windowSizeMs: 60000, // 1 minute
    maxRequests: 200,
    burstLimit: 50,
    penaltyMultiplier: 2,
  },

  // File upload endpoints - strict
  '/api/upload': {
    windowSizeMs: 300000, // 5 minutes
    maxRequests: 10,
    burstLimit: 3,
    penaltyMultiplier: 3,
  },

  // Public API endpoints - lenient
  '/api/public': {
    windowSizeMs: 60000, // 1 minute
    maxRequests: 1000,
    burstLimit: 100,
    penaltyMultiplier: 1.5,
  },

  // Security reporting endpoints - moderate
  '/api/security/csp-report': {
    windowSizeMs: 60000, // 1 minute
    maxRequests: 100,
    burstLimit: 20,
    penaltyMultiplier: 2,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// User Type Rate Limits
// ─────────────────────────────────────────────────────────────────────────────

export const USER_TYPE_RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Anonymous users - strict
  anonymous: {
    windowSizeMs: 60000, // 1 minute
    maxRequests: 50,
    burstLimit: 10,
    penaltyMultiplier: 3,
  },

  // Authenticated users - moderate
  authenticated: {
    windowSizeMs: 60000, // 1 minute
    maxRequests: 200,
    burstLimit: 30,
    penaltyMultiplier: 2,
  },

  // Premium users - lenient
  premium: {
    windowSizeMs: 60000, // 1 minute
    maxRequests: 500,
    burstLimit: 100,
    penaltyMultiplier: 1.5,
  },

  // Admin users - very lenient
  admin: {
    windowSizeMs: 60000, // 1 minute
    maxRequests: 1000,
    burstLimit: 200,
    penaltyMultiplier: 1,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// IP-Based Rate Limits
// ─────────────────────────────────────────────────────────────────────────────

export const IP_RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Default IP rate limit
  default: {
    windowSizeMs: 60000, // 1 minute
    maxRequests: 100,
    burstLimit: 20,
    penaltyMultiplier: 2,
  },

  // Trusted IPs (internal services, CDN)
  trusted: {
    windowSizeMs: 60000, // 1 minute
    maxRequests: 10000,
    burstLimit: 1000,
    penaltyMultiplier: 1,
  },

  // Suspicious IPs (known bad actors)
  suspicious: {
    windowSizeMs: 300000, // 5 minutes
    maxRequests: 5,
    burstLimit: 1,
    penaltyMultiplier: 10,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Rate Limit Resolution Logic
// ─────────────────────────────────────────────────────────────────────────────

export function getRateLimitForRequest(
  endpoint: string,
  userType: string = 'anonymous',
  ipType: string = 'default'
): RateLimitConfig {
  // Get base limits
  const endpointLimit = ENDPOINT_RATE_LIMITS[endpoint];
  const userLimit = USER_TYPE_RATE_LIMITS[userType];
  const ipLimit = IP_RATE_LIMITS[ipType];

  // If no specific endpoint limit, use user type limit
  if (!endpointLimit) {
    return userLimit || IP_RATE_LIMITS.default;
  }

  // For specific endpoints, use the most restrictive limit
  const limits = [endpointLimit, userLimit, ipLimit].filter(Boolean);

  return {
    windowSizeMs: Math.min(...limits.map((l) => l.windowSizeMs)),
    maxRequests: Math.min(...limits.map((l) => l.maxRequests)),
    burstLimit: Math.min(...limits.map((l) => l.burstLimit)),
    penaltyMultiplier: Math.max(...limits.map((l) => l.penaltyMultiplier)),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Rate Limit Patterns
// ─────────────────────────────────────────────────────────────────────────────

export const RATE_LIMIT_PATTERNS = {
  // Pattern for calculator endpoints
  calculator: /^\/api\/calculate\/[^/]+$/,

  // Pattern for auth endpoints
  auth: /^\/api\/auth\//,

  // Pattern for admin endpoints
  admin: /^\/api\/admin\//,

  // Pattern for public endpoints
  public: /^\/api\/public\//,

  // Pattern for upload endpoints
  upload: /^\/api\/upload\//,
};

export function getEndpointPattern(endpoint: string): string | null {
  for (const [pattern, regex] of Object.entries(RATE_LIMIT_PATTERNS)) {
    if (regex.test(endpoint)) {
      return pattern;
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Penalty Escalation
// ─────────────────────────────────────────────────────────────────────────────

export interface PenaltyEscalation {
  violations: number;
  penaltyMultiplier: number;
  blockDurationMs: number;
}

export const PENALTY_ESCALATION: PenaltyEscalation[] = [
  { violations: 1, penaltyMultiplier: 2, blockDurationMs: 60000 }, // 1 minute
  { violations: 3, penaltyMultiplier: 4, blockDurationMs: 300000 }, // 5 minutes
  { violations: 5, penaltyMultiplier: 8, blockDurationMs: 900000 }, // 15 minutes
  { violations: 10, penaltyMultiplier: 16, blockDurationMs: 3600000 }, // 1 hour
  { violations: 20, penaltyMultiplier: 32, blockDurationMs: 86400000 }, // 24 hours
];

export function getPenaltyForViolations(violations: number): PenaltyEscalation {
  for (let i = PENALTY_ESCALATION.length - 1; i >= 0; i--) {
    if (violations >= PENALTY_ESCALATION[i].violations) {
      return PENALTY_ESCALATION[i];
    }
  }
  return PENALTY_ESCALATION[0];
}
