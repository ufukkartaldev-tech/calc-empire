/**
 * @file lib/security/config/csp.config.ts
 * @description Content Security Policy configuration for different contexts
 */

import { CSPPolicy } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Base CSP Policies
// ─────────────────────────────────────────────────────────────────────────────

export const BASE_CSP_POLICY: CSPPolicy = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'"],
  styleSrc: ["'self'"],
  imgSrc: ["'self'", 'blob:', 'data:'],
  connectSrc: ["'self'"],
  fontSrc: ["'self'"],
  reportUri: '/api/security/csp-report',
};

// ─────────────────────────────────────────────────────────────────────────────
// Environment-Specific CSP Policies
// ─────────────────────────────────────────────────────────────────────────────

export const DEVELOPMENT_CSP_POLICY: CSPPolicy = {
  ...BASE_CSP_POLICY,
  scriptSrc: [
    "'self'",
    "'unsafe-eval'", // Required for Next.js dev mode
    "'unsafe-inline'", // Required for dev tools
    'localhost:*',
    '127.0.0.1:*',
  ],
  styleSrc: [
    "'self'",
    "'unsafe-inline'", // Required for dev mode hot reloading
  ],
  connectSrc: [
    "'self'",
    'localhost:*',
    '127.0.0.1:*',
    'ws://localhost:*',
    'ws://127.0.0.1:*',
    'https://*.sentry.io',
  ],
  reportOnly: true, // Non-blocking in development
};

export const STAGING_CSP_POLICY: CSPPolicy = {
  ...BASE_CSP_POLICY,
  scriptSrc: [
    "'self'",
    "'nonce-{nonce}'", // Nonce-based scripts only
  ],
  styleSrc: [
    "'self'",
    "'sha256-{hash}'", // Hash-based styles only
  ],
  imgSrc: [
    "'self'",
    'blob:',
    'data:',
    'https://flagcdn.com', // Flag images
  ],
  connectSrc: ["'self'", 'https://*.sentry.io', 'https://*.vercel.app'],
  reportOnly: false,
};

export const PRODUCTION_CSP_POLICY: CSPPolicy = {
  ...BASE_CSP_POLICY,
  scriptSrc: [
    "'self'",
    "'nonce-{nonce}'", // Strict nonce-only policy
  ],
  styleSrc: [
    "'self'",
    "'sha256-{hash}'", // Strict hash-only policy
  ],
  imgSrc: ["'self'", 'blob:', 'data:', 'https://flagcdn.com'],
  connectSrc: ["'self'", 'https://*.sentry.io'],
  reportOnly: false,
};

// ─────────────────────────────────────────────────────────────────────────────
// Page-Specific CSP Policies
// ─────────────────────────────────────────────────────────────────────────────

export const PAGE_CSP_POLICIES: Record<string, Partial<CSPPolicy>> = {
  // Calculator pages - need math rendering
  '/calculators': {
    scriptSrc: ["'self'", "'nonce-{nonce}'"],
    styleSrc: ["'self'", "'sha256-{hash}'"],
    // KaTeX may need additional permissions for math rendering
    fontSrc: ["'self'", 'data:'],
  },

  // Admin pages - strictest policy
  '/admin': {
    scriptSrc: ["'self'"],
    styleSrc: ["'self'"],
    imgSrc: ["'self'"],
    connectSrc: ["'self'"],
    fontSrc: ["'self'"],
  },

  // API documentation pages
  '/docs': {
    scriptSrc: ["'self'", "'nonce-{nonce}'"],
    styleSrc: ["'self'", "'sha256-{hash}'"],
    imgSrc: ["'self'", 'data:', 'https://cdn.jsdelivr.net'], // For documentation assets
  },

  // Landing page - may need analytics
  '/': {
    scriptSrc: ["'self'", "'nonce-{nonce}'"],
    styleSrc: ["'self'", "'sha256-{hash}'"],
    connectSrc: ["'self'", 'https://*.sentry.io', 'https://*.vercel-analytics.com'],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// CSP Directive Builders
// ─────────────────────────────────────────────────────────────────────────────

export function buildScriptSrcWithNonce(nonce: string, additionalSources: string[] = []): string[] {
  return ["'self'", `'nonce-${nonce}'`, ...additionalSources];
}

export function buildStyleSrcWithHash(
  hashes: string[],
  additionalSources: string[] = []
): string[] {
  const hashSources = hashes.map((hash) => `'sha256-${hash}'`);
  return ["'self'", ...hashSources, ...additionalSources];
}

// ─────────────────────────────────────────────────────────────────────────────
// CSP Header Generation
// ─────────────────────────────────────────────────────────────────────────────

export function generateCSPHeader(policy: CSPPolicy, nonce?: string, hashes?: string[]): string {
  const directives: string[] = [];

  // Process each directive
  Object.entries(policy).forEach(([directive, sources]) => {
    if (directive === 'reportUri' || directive === 'reportOnly') {
      return; // Handle separately
    }

    if (Array.isArray(sources) && sources.length > 0) {
      let processedSources = [...sources];

      // Replace nonce placeholder
      if (nonce) {
        processedSources = processedSources.map((source) => source.replace('{nonce}', nonce));
      }

      // Replace hash placeholders
      if (hashes && hashes.length > 0) {
        processedSources = processedSources.flatMap((source) => {
          if (source.includes('{hash}')) {
            return hashes.map((hash) => source.replace('{hash}', hash));
          }
          return [source];
        });
      }

      // Convert camelCase to kebab-case for directive names
      const kebabDirective = directive.replace(/([A-Z])/g, '-$1').toLowerCase();
      directives.push(`${kebabDirective} ${processedSources.join(' ')}`);
    }
  });

  // Add report-uri if specified
  if (policy.reportUri) {
    directives.push(`report-uri ${policy.reportUri}`);
  }

  return directives.join('; ');
}

// ─────────────────────────────────────────────────────────────────────────────
// CSP Violation Handling
// ─────────────────────────────────────────────────────────────────────────────

export interface CSPViolationReport {
  'document-uri': string;
  'violated-directive': string;
  'blocked-uri': string;
  'source-file'?: string;
  'line-number'?: number;
  'column-number'?: number;
  'status-code'?: number;
}

export function parseCSPViolationReport(report: CSPViolationReport) {
  return {
    documentUri: report['document-uri'],
    violatedDirective: report['violated-directive'],
    blockedUri: report['blocked-uri'],
    sourceFile: report['source-file'],
    lineNumber: report['line-number'],
    columnNumber: report['column-number'],
    statusCode: report['status-code'],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CSP Policy Validation
// ─────────────────────────────────────────────────────────────────────────────

export function validateCSPPolicy(policy: CSPPolicy): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for unsafe directives
  const unsafeDirectives = ['unsafe-inline', 'unsafe-eval', 'unsafe-hashes'];

  Object.entries(policy).forEach(([directive, sources]) => {
    if (Array.isArray(sources)) {
      sources.forEach((source) => {
        if (unsafeDirectives.some((unsafe) => source.includes(unsafe))) {
          warnings.push(`Unsafe directive '${source}' found in ${directive}`);
        }

        if (source === '*') {
          warnings.push(`Wildcard '*' found in ${directive} - consider being more specific`);
        }
      });
    }
  });

  // Check for required directives
  if (!policy.defaultSrc || policy.defaultSrc.length === 0) {
    errors.push('default-src directive is required');
  }

  if (!policy.scriptSrc || policy.scriptSrc.length === 0) {
    warnings.push('script-src directive not specified - will fall back to default-src');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Common CSP Hashes for Static Content
// ─────────────────────────────────────────────────────────────────────────────

export const COMMON_STYLE_HASHES = {
  // Tailwind CSS reset styles
  tailwindReset: 'sha256-4f_GpuuzfqWZYqAqT7s2N2Ziu9vcgpQ-f0oTf2dOJmI=',

  // Next.js built-in styles
  nextjsBuiltin: 'sha256-BiLFinpqYMtWHmXfkA1NWMz2nMz5HiuVM5VfIDnfFcU=',

  // Common utility styles
  visuallyHidden: 'sha256-tG6aiTrRn5B8FtWBb0v8nKndrww9ew2WZMznp6Nq5P0=',
};

export const COMMON_SCRIPT_HASHES = {
  // Analytics initialization
  analytics: 'sha256-xyz123...',

  // Error reporting initialization
  errorReporting: 'sha256-abc456...',
};
