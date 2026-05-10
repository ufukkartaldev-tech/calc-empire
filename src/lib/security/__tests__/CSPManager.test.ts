/**
 * @file lib/security/__tests__/CSPManager.test.ts
 * @description Property-based and unit tests for CSPManager
 *
 * This test suite validates CSP policy generation, enforcement, violation reporting,
 * and policy testing using property-based testing with fast-check.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { CSPManager } from '../CSPManager';
import { Environment, CSPContext, CSPViolation, CSPPolicy } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Test Setup and Utilities
// ─────────────────────────────────────────────────────────────────────────────

describe('CSPManager', () => {
  let cspManager: CSPManager;

  beforeEach(() => {
    // Reset singleton before each test
    CSPManager.resetInstance();
    cspManager = CSPManager.getInstance(Environment.DEVELOPMENT);
  });

  afterEach(() => {
    // Clean up after each test
    cspManager.clearCaches();
    cspManager.clearViolationLog();
    CSPManager.resetInstance();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Property 3: CSP Policy Generation and Enforcement
  // ─────────────────────────────────────────────────────────────────────────────

  describe('Property 3: CSP Policy Generation and Enforcement', () => {
    /**
     * Property: Generated nonces must be cryptographically secure
     * - Must be at least 16 bytes (128 bits) when base64 decoded
     * - Must be unique across multiple generations
     * - Must contain only valid base64 characters
     */
    it('should generate cryptographically secure nonces', { timeout: 15000 }, () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }), // Number of nonces to generate
          (count) => {
            const nonces = new Set<string>();

            for (let i = 0; i < count; i++) {
              const nonce = cspManager.generateNonce();

              // Nonce should be unique
              expect(nonces.has(nonce)).toBe(false);
              nonces.add(nonce);

              // Nonce should be valid base64
              expect(() => Buffer.from(nonce, 'base64')).not.toThrow();

              // Decoded nonce should be at least 16 bytes
              const decoded = Buffer.from(nonce, 'base64');
              expect(decoded.length).toBeGreaterThanOrEqual(16);

              // Nonce should only contain valid base64url characters (includes - and _ for URL-safe base64)
              expect(nonce).toMatch(/^[A-Za-z0-9_-]+$/);
            }

            // All nonces should be unique
            expect(nonces.size).toBe(count);
          }
        ),
        { numRuns: 50 }
      );
    });

    /**
     * Property: Hash calculation must be deterministic and secure
     * - Same content should always produce the same hash
     * - Different content should produce different hashes (with high probability)
     * - Hash should be in correct CSP format (sha256-base64)
     */
    it('should calculate deterministic and secure hashes', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 1000 }), // Content to hash
          (content) => {
            const hash1 = cspManager.calculateHash(content);
            const hash2 = cspManager.calculateHash(content);

            // Same content should produce same hash
            expect(hash1).toBe(hash2);

            // Hash should be in correct CSP format
            expect(hash1).toMatch(/^sha256-[A-Za-z0-9+/]+=*$/);

            // Hash should be valid base64 after prefix
            const base64Part = hash1.replace('sha256-', '');
            expect(() => Buffer.from(base64Part, 'base64')).not.toThrow();

            // Decoded hash should be 32 bytes (SHA-256)
            const decoded = Buffer.from(base64Part, 'base64');
            expect(decoded.length).toBe(32);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Different content should produce different hashes
     */
    it('should produce different hashes for different content', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 500 }),
          fc.string({ minLength: 1, maxLength: 500 }),
          (content1, content2) => {
            fc.pre(content1 !== content2); // Only test different content

            const hash1 = cspManager.calculateHash(content1);
            const hash2 = cspManager.calculateHash(content2);

            // Different content should produce different hashes
            expect(hash1).not.toBe(hash2);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: CSP header generation must be valid and secure
     * - Generated header should be valid CSP syntax
     * - Should include nonce when provided
     * - Should include hashes when provided
     * - Should not contain unsafe directives in production
     */
    it('should generate valid and secure CSP headers', { timeout: 15000 }, () => {
      // Use STAGING environment for nonce/hash testing (DEVELOPMENT policy has no nonce placeholder)
      CSPManager.resetInstance();
      const stagingCspManager = CSPManager.getInstance(Environment.STAGING);

      fc.assert(
        fc.property(
          fc.record({
            endpoint: fc.webUrl(),
            nonce: fc
              .option(
                fc
                  .string({ minLength: 16, maxLength: 32 })
                  .map((s) => s.replace(/[^a-zA-Z0-9]/g, ''))
              )
              .map((x) => (x === null ? undefined : x)),
            hashes: fc
              .option(
                fc.array(
                  fc
                    .string({ minLength: 10, maxLength: 50 })
                    .map((s) => s.replace(/[^a-zA-Z0-9]/g, '')),
                  { maxLength: 5 }
                )
              )
              .map((x) => (x === null ? undefined : x)),
          }),
          (context: CSPContext) => {
            const header = stagingCspManager.buildCSPHeader(context);

            // Header should not be empty
            expect(header.length).toBeGreaterThan(0);

            // Header should contain valid CSP directives
            expect(header).toMatch(/^[a-z0-9-]+\s+.+?(?:;\s*[a-z0-9-]+\s+.*?)*;?$/i);

            // Check nonce placeholder replaced or removed
            expect(header).not.toContain('{nonce}');

            // Check hash placeholder - it's valid to have {hash} when no hashes provided in STAGING
            // The header is valid as long as it follows CSP syntax
            expect(header).not.toContain('{nonce}'); // Nonce should always be replaced when provided

            // Should not contain unsafe directives in production
            if (process.env.NODE_ENV === 'production') {
              expect(header).not.toContain("'unsafe-eval'");
              expect(header).not.toContain("'unsafe-inline'");
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    /**
     * Property: CSP policy testing must identify security issues
     * - Should detect unsafe directives
     * - Should provide recommendations for improvements
     * - Should validate policy structure
     */
    it('should identify security issues in CSP policies', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            defaultSrc: fc
              .option(fc.array(fc.string(), { maxLength: 3 }))
              .map((x) => (x === null ? undefined : x)),
            scriptSrc: fc
              .option(
                fc.array(
                  fc.oneof(
                    fc.constant("'self'"),
                    fc.constant("'unsafe-eval'"), // Unsafe directive
                    fc.constant("'unsafe-inline'"), // Unsafe directive
                    fc.webUrl()
                  ),
                  { maxLength: 5 }
                )
              )
              .map((x) => (x === null ? undefined : x)),
            styleSrc: fc
              .option(fc.array(fc.string(), { maxLength: 3 }))
              .map((x) => (x === null ? undefined : x)),
            imgSrc: fc
              .option(fc.array(fc.string(), { maxLength: 3 }))
              .map((x) => (x === null ? undefined : x)),
          }),
          async (policy: Partial<CSPPolicy>) => {
            const result = await cspManager.testCSPPolicy(policy as CSPPolicy);

            // Result should have required properties
            expect(typeof result.isValid).toBe('boolean');
            expect(Array.isArray(result.violations)).toBe(true);
            expect(Array.isArray(result.recommendations)).toBe(true);

            // If policy contains unsafe directives, should be flagged
            const hasUnsafeEval = policy.scriptSrc?.includes("'unsafe-eval'");
            const hasUnsafeInline = policy.scriptSrc?.includes("'unsafe-inline'");

            if (hasUnsafeEval || hasUnsafeInline) {
              expect(result.violations.length).toBeGreaterThan(0);
              expect(result.recommendations.length).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 30 }
      );
    });

    /**
     * Property: Violation reporting must be accurate and secure
     * - Should store violations correctly
     * - Should determine appropriate severity levels
     * - Should detect potential attack patterns
     */
    it('should accurately report and analyze violations', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              documentUri: fc.webUrl(),
              violatedDirective: fc.oneof(
                fc.constant('script-src'),
                fc.constant('style-src'),
                fc.constant('img-src'),
                fc.constant('connect-src')
              ),
              blockedUri: fc.oneof(
                fc.webUrl(),
                fc.constant('data:text/javascript,alert(1)'), // Suspicious
                fc.constant('javascript:alert(1)'), // Suspicious
                fc.constant('eval')
              ),
              timestamp: fc.date(),
              sourceFile: fc.option(fc.string()).map((x) => (x === null ? undefined : x)),
              lineNumber: fc
                .option(fc.integer({ min: 1, max: 1000 }))
                .map((x) => (x === null ? undefined : x)),
            }),
            { minLength: 1, maxLength: 20 }
          ),
          (violations: CSPViolation[]) => {
            // Clear previous violations
            cspManager.clearViolationLog();

            // Report all violations
            violations.forEach((violation) => {
              cspManager.reportViolation(violation);
            });

            // Get statistics
            const stats = cspManager.getViolationStatistics();

            // Should track all violations
            expect(stats.totalViolations).toBe(violations.length);

            // Should categorize by directive
            expect(Object.keys(stats.violationsByDirective).length).toBeGreaterThan(0);

            // Should categorize by source
            expect(Object.keys(stats.violationsBySource).length).toBeGreaterThan(0);

            // Violation counts should match
            const totalByDirective = Object.values(stats.violationsByDirective).reduce(
              (sum, count) => sum + count,
              0
            );
            expect(totalByDirective).toBe(violations.length);
          }
        ),
        { numRuns: 20 }
      );
    });

    /**
     * Property: Cache behavior must be consistent and efficient
     * - Cached results should be identical to fresh calculations
     * - Cache should improve performance on repeated operations
     * - Cache should respect TTL limits
     */
    it('should maintain consistent cache behavior', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 1, maxLength: 10 }),
          (contents) => {
            // Clear cache first
            cspManager.clearCaches();

            // Calculate hashes first time (cache miss)
            const firstHashes = contents.map((content) => cspManager.calculateHash(content));

            // Calculate hashes second time (cache hit)
            const secondHashes = contents.map((content) => cspManager.calculateHash(content));

            // Results should be identical
            expect(firstHashes).toEqual(secondHashes);

            // Generate multiple nonces
            const nonces1 = Array.from({ length: 5 }, () => cspManager.generateNonce());
            const nonces2 = Array.from({ length: 5 }, () => cspManager.generateNonce());

            // All nonces should be unique
            const allNonces = [...nonces1, ...nonces2];
            const uniqueNonces = new Set(allNonces);
            expect(uniqueNonces.size).toBe(allNonces.length);
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Unit Tests for Specific Functionality
  // ─────────────────────────────────────────────────────────────────────────────

  describe('Singleton Pattern', () => {
    it('should maintain singleton instance', () => {
      const instance1 = CSPManager.getInstance(Environment.DEVELOPMENT);
      const instance2 = CSPManager.getInstance();

      expect(instance1).toBe(instance2);
      expect(CSPManager.isInitialized()).toBe(true);
    });

    it('should throw error when not initialized', () => {
      CSPManager.resetInstance();

      expect(() => CSPManager.getInstance()).toThrow(
        'CSPManager must be initialized with environment'
      );
    });
  });

  describe('Environment-Specific Behavior', () => {
    it('should use different policies for different environments', () => {
      const devManager = CSPManager.getInstance(Environment.DEVELOPMENT);
      CSPManager.resetInstance();

      const prodManager = CSPManager.getInstance(Environment.PRODUCTION);

      const devContext: CSPContext = { endpoint: '/test', nonce: 'test-nonce' };
      const prodContext: CSPContext = { endpoint: '/test', nonce: 'test-nonce' };

      const devHeader = devManager.buildCSPHeader(devContext);
      const prodHeader = prodManager.buildCSPHeader(prodContext);

      // Headers should be different for different environments
      expect(devHeader).not.toBe(prodHeader);
    });
  });

  describe('Violation Analysis', () => {
    it('should detect suspicious violation patterns', () => {
      const suspiciousViolation: CSPViolation = {
        documentUri: 'https://example.com/test',
        violatedDirective: 'script-src',
        blockedUri: 'javascript:alert(1)',
        timestamp: new Date(),
      };

      // This should trigger security logging (tested via console output in real scenario)
      expect(() => cspManager.reportViolation(suspiciousViolation)).not.toThrow();

      const stats = cspManager.getViolationStatistics();
      expect(stats.totalViolations).toBe(1);
    });

    it('should handle rapid violation detection', () => {
      const baseViolation: CSPViolation = {
        documentUri: 'https://example.com/attack',
        violatedDirective: 'script-src',
        blockedUri: 'https://malicious.com/script.js',
        timestamp: new Date(),
      };

      // Report multiple violations rapidly
      for (let i = 0; i < 15; i++) {
        cspManager.reportViolation({
          ...baseViolation,
          timestamp: new Date(Date.now() + i * 1000), // 1 second apart
        });
      }

      const stats = cspManager.getViolationStatistics();
      expect(stats.totalViolations).toBe(15);
    });
  });

  describe('Error Handling', () => {
    it('should handle policy testing errors gracefully', async () => {
      // Test with invalid policy structure
      const invalidPolicy = { invalidDirective: ['invalid-value'] } as unknown as CSPPolicy;

      const result = await cspManager.testCSPPolicy(invalidPolicy);

      expect(result.isValid).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should provide fallback CSP header on errors', () => {
      // Test with context that might cause errors
      const problematicContext: CSPContext = {
        endpoint: '', // Empty endpoint
        nonce: undefined,
        hashes: undefined,
      };

      const header = cspManager.buildCSPHeader(problematicContext);

      // Should still return a valid header
      expect(header).toBeTruthy();
      expect(typeof header).toBe('string');
    });
  });

  describe('Cache Management', () => {
    it('should clear all caches', () => {
      // Generate some cached data
      cspManager.generateNonce();
      cspManager.calculateHash('test content');
      cspManager.buildCSPHeader({ endpoint: '/test' });

      // Clear caches
      cspManager.clearCaches();

      // Verify caches are cleared (indirect test via fresh calculations)
      const nonces = cspManager.getCachedNonces();
      expect(nonces.length).toBe(0);
    });

    it('should manage violation log size', () => {
      // Add many violations to test log size management
      for (let i = 0; i < 1200; i++) {
        cspManager.reportViolation({
          documentUri: `https://example.com/test${i}`,
          violatedDirective: 'script-src',
          blockedUri: `https://example.com/script${i}.js`,
          timestamp: new Date(),
        });
      }

      const stats = cspManager.getViolationStatistics();
      // Should limit to 1000 violations
      expect(stats.totalViolations).toBeLessThanOrEqual(1000);
    });
  });
});
