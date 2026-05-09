/**
 * @file lib/security/__tests__/setup.ts
 * @description Test setup and configuration for security module testing
 *
 * This file configures the testing environment for security services,
 * including property-based testing with fast-check and mock implementations.
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';

// ─────────────────────────────────────────────────────────────────────────────
// Test Configuration
// ─────────────────────────────────────────────────────────────────────────────

// Configure fast-check for consistent property-based testing
export const PROPERTY_TEST_CONFIG = {
  numRuns: 100, // Minimum iterations per property test
  seed: 42, // Deterministic seeding for reproducible tests
  verbose: process.env.NODE_ENV === 'test' ? 1 : 0,
  timeout: 5000, // 5 second timeout per property test
};

// ─────────────────────────────────────────────────────────────────────────────
// Custom Arbitraries for Security Testing
// ─────────────────────────────────────────────────────────────────────────────

export const SecurityArbitraries = {
  // Environment arbitrary
  environment: fc.constantFrom('development', 'staging', 'production'),

  // Security event type arbitrary
  securityEventType: fc.constantFrom(
    'auth_failure',
    'rate_limit_exceeded',
    'csp_violation',
    'invalid_input',
    'unauthorized_access',
    'cors_violation',
    'request_too_large',
    'secret_access'
  ),

  // Security severity arbitrary
  securitySeverity: fc.constantFrom('low', 'medium', 'high', 'critical'),

  // IP address arbitrary
  ipAddress: fc
    .tuple(
      fc.integer({ min: 0, max: 255 }),
      fc.integer({ min: 0, max: 255 }),
      fc.integer({ min: 0, max: 255 }),
      fc.integer({ min: 0, max: 255 })
    )
    .map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`),

  // User agent arbitrary
  userAgent: fc.constantFrom(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
  ),

  // Email arbitrary
  email: fc.emailAddress(),

  // Secret key arbitrary
  secretKey: fc.string({ minLength: 32, maxLength: 64 }),

  // JWT token arbitrary (mock structure)
  jwtToken: fc.record({
    header: fc.record({
      alg: fc.constantFrom('HS256', 'RS256'),
      typ: fc.constant('JWT'),
    }),
    payload: fc.record({
      sub: fc.uuid(),
      email: fc.emailAddress(),
      roles: fc.array(fc.constantFrom('user', 'admin', 'premium'), { maxLength: 3 }),
      iat: fc.integer({ min: 1600000000, max: 2000000000 }),
      exp: fc.integer({ min: 2000000000, max: 2100000000 }),
    }),
    signature: fc.string({ minLength: 64, maxLength: 64 }),
  }),

  // Rate limit configuration arbitrary
  rateLimitConfig: fc.record({
    windowSizeMs: fc.integer({ min: 1000, max: 3600000 }), // 1 second to 1 hour
    maxRequests: fc.integer({ min: 1, max: 10000 }),
    burstLimit: fc.integer({ min: 1, max: 1000 }),
    penaltyMultiplier: fc.float({ min: 1, max: 10 }),
  }),

  // CSP policy arbitrary
  cspPolicy: fc.record({
    defaultSrc: fc.array(fc.constantFrom("'self'", "'none'", 'https:'), { minLength: 1 }),
    scriptSrc: fc.array(fc.constantFrom("'self'", "'nonce-{nonce}'", "'unsafe-inline'"), {
      minLength: 1,
    }),
    styleSrc: fc.array(fc.constantFrom("'self'", "'sha256-{hash}'", "'unsafe-inline'"), {
      minLength: 1,
    }),
    imgSrc: fc.array(fc.constantFrom("'self'", 'data:', 'blob:', 'https:'), { minLength: 1 }),
  }),

  // HTTP request arbitrary
  httpRequest: fc.record({
    method: fc.constantFrom('GET', 'POST', 'PUT', 'DELETE', 'PATCH'),
    url: fc.webUrl(),
    headers: fc.dictionary(
      fc.constantFrom('Content-Type', 'Authorization', 'User-Agent', 'X-Forwarded-For'),
      fc.string()
    ),
    body: fc.oneof(fc.constant(null), fc.string(), fc.object()),
  }),

  // Validation schema arbitrary
  validationSchema: fc.record({
    type: fc.constantFrom('object', 'array', 'string', 'number', 'boolean'),
    required: fc.boolean(),
    maxLength: fc.option(fc.integer({ min: 1, max: 1000 })),
    minLength: fc.option(fc.integer({ min: 0, max: 100 })),
    min: fc.option(fc.integer({ min: -1000, max: 1000 })),
    max: fc.option(fc.integer({ min: -1000, max: 1000 })),
  }),
};

// ─────────────────────────────────────────────────────────────────────────────
// Mock Implementations
// ─────────────────────────────────────────────────────────────────────────────

export class MockRedisClient {
  private store = new Map<string, { value: string; expiry?: number }>();

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;

    if (item.expiry && Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }

    return item.value;
  }

  async set(key: string, value: string, options?: { EX?: number }): Promise<void> {
    const expiry = options?.EX ? Date.now() + options.EX * 1000 : undefined;
    this.store.set(key, { value, expiry });
  }

  async incr(key: string): Promise<number> {
    const current = await this.get(key);
    const newValue = (parseInt(current || '0', 10) + 1).toString();
    await this.set(key, newValue);
    return parseInt(newValue, 10);
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

export class MockLogger {
  public logs: Array<{ level: string; message: string; meta?: Record<string, unknown> }> = [];

  debug(message: string, meta?: Record<string, unknown>): void {
    this.logs.push({ level: 'debug', message, meta });
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.logs.push({ level: 'info', message, meta });
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.logs.push({ level: 'warn', message, meta });
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.logs.push({ level: 'error', message, meta });
  }

  clear(): void {
    this.logs = [];
  }

  getLogsByLevel(level: string) {
    return this.logs.filter((log) => log.level === level);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Test Utilities
// ─────────────────────────────────────────────────────────────────────────────

export function createMockRequest(overrides: Partial<Request> = {}): Request {
  const defaultRequest = {
    method: 'GET',
    url: 'http://localhost:3000/api/test',
    headers: new Headers({
      'Content-Type': 'application/json',
      'User-Agent': 'test-agent',
    }),
    body: null,
    ...overrides,
  };

  return new Request(defaultRequest.url, defaultRequest);
}

export function createMockResponse(
  body: unknown = null,
  status: number = 200,
  headers: Record<string, string> = {}
): Response {
  return new Response(body ? JSON.stringify(body) : null, {
    status,
    headers: new Headers(headers),
  });
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─────────────────────────────────────────────────────────────────────────────
// Test Environment Setup
// ─────────────────────────────────────────────────────────────────────────────

let mockRedis: MockRedisClient;
let mockLogger: MockLogger;

beforeAll(() => {
  // Set test environment
  // Set test environment

  // Initialize mocks
  mockRedis = new MockRedisClient();
  mockLogger = new MockLogger();

  // Configure fast-check
  fc.configureGlobal(PROPERTY_TEST_CONFIG);
});

beforeEach(() => {
  // Clear mocks before each test
  mockRedis.clear();
  mockLogger.clear();
});

afterEach(() => {
  // Clean up after each test
  // Clean up after each test
  // vi.clearAllMocks(); // Handled by vitest config usually
});

afterAll(() => {
  // Clean up after all tests
  // Clean up after all tests
});

// ─────────────────────────────────────────────────────────────────────────────
// Export test utilities
// ─────────────────────────────────────────────────────────────────────────────

export { mockRedis, mockLogger, fc };

// ─────────────────────────────────────────────────────────────────────────────
// Property Test Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function runPropertyTest<T>(
  name: string,
  arbitrary: fc.Arbitrary<T>,
  predicate: (value: T) => Promise<boolean | void>,
  options: Partial<fc.Parameters<T>> = {}
) {
  // @ts-expect-error: Incompatible property types between fast-check versions
  return fc.assert(fc.asyncProperty(arbitrary, predicate), {
    ...PROPERTY_TEST_CONFIG,
    ...options,
  });
}

export function createSecurityEventArbitrary() {
  return fc.record({
    id: fc.uuid(),
    timestamp: fc.date({ min: new Date('2024-01-01'), max: new Date() }),
    type: SecurityArbitraries.securityEventType,
    severity: SecurityArbitraries.securitySeverity,
    source: fc.constantFrom('api', 'middleware', 'client', 'system'),
    details: fc.object(),
    userId: fc.option(fc.uuid()),
    ipAddress: fc.option(SecurityArbitraries.ipAddress),
    userAgent: fc.option(SecurityArbitraries.userAgent),
  });
}
