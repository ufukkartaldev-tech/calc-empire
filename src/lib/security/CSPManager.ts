/**
 * @file lib/security/CSPManager.ts
 * @description Content Security Policy manager with nonce and hash support
 *
 * This service provides comprehensive CSP management including nonce generation,
 * hash calculation, policy building, violation reporting, and policy testing.
 * It replaces unsafe CSP directives with secure nonce and hash-based policies.
 */

import {
  CSPManager as ICSPManager,
  CSPPolicy,
  CSPContext,
  CSPViolation,
  CSPTestResult,
  SecurityError,
  SecuritySeverity,
  SecurityEventType,
  Environment,
} from './types';
import { generateCSPNonce, generateCSPHash } from './utils/crypto';
import { createSecurityEvent } from './utils/monitoring';
import {
  generateCSPHeader,
  validateCSPPolicy,
  DEVELOPMENT_CSP_POLICY,
  STAGING_CSP_POLICY,
  PRODUCTION_CSP_POLICY,
  PAGE_CSP_POLICIES,
} from './config/csp.config';

// ─────────────────────────────────────────────────────────────────────────────
// CSP Manager Implementation
// ─────────────────────────────────────────────────────────────────────────────

export class CSPManager implements ICSPManager {
  private static instance: CSPManager | null = null;
  private environment: Environment;
  private violationLog: CSPViolation[] = [];
  private nonceCache: Map<string, { nonce: string; timestamp: number }> = new Map();
  private hashCache: Map<string, string> = new Map();
  private policyCache: Map<string, { policy: string; timestamp: number }> = new Map();

  // Cache TTL in milliseconds (5 minutes for nonces, 1 hour for policies)
  private readonly NONCE_TTL = 5 * 60 * 1000;
  private readonly POLICY_TTL = 60 * 60 * 1000;

  private constructor(environment: Environment) {
    this.environment = environment;
  }

  /**
   * Get singleton instance of CSPManager
   */
  public static getInstance(environment?: Environment): CSPManager {
    if (!CSPManager.instance) {
      if (!environment) {
        throw new SecurityError(
          'CSPManager must be initialized with environment',
          'CSP_MANAGER_NOT_INITIALIZED',
          SecuritySeverity.HIGH
        );
      }
      CSPManager.instance = new CSPManager(environment);
    }
    return CSPManager.instance;
  }

  /**
   * Generate cryptographically secure nonce for CSP
   */
  public generateNonce(): string {
    const nonce = generateCSPNonce();

    // Cache nonce with timestamp for validation
    const cacheKey = `nonce_${Date.now()}_${Math.random()}`;
    this.nonceCache.set(cacheKey, {
      nonce,
      timestamp: Date.now(),
    });

    // Clean up old nonces
    this.cleanupNonceCache();

    // Log nonce generation for audit
    const securityEvent = createSecurityEvent(
      SecurityEventType.CSP_VIOLATION, // Using CSP_VIOLATION for CSP-related events
      SecuritySeverity.LOW,
      'CSPManager',
      {
        action: 'generate_nonce',
        nonceLength: nonce.length,
        environment: this.environment,
      }
    );

    if (this.environment === Environment.DEVELOPMENT) {
      console.debug('CSP nonce generated:', securityEvent);
    }

    return nonce;
  }

  /**
   * Calculate hash for inline content
   */
  public calculateHash(content: string): string {
    // Check cache first
    const cacheKey = this.generateContentCacheKey(content);
    const cachedHash = this.hashCache.get(cacheKey);

    if (cachedHash) {
      return cachedHash;
    }

    // Generate new hash
    const hash = generateCSPHash(content, 'sha256');

    // Cache the hash
    this.hashCache.set(cacheKey, hash);

    // Log hash calculation
    const securityEvent = createSecurityEvent(
      SecurityEventType.CSP_VIOLATION,
      SecuritySeverity.LOW,
      'CSPManager',
      {
        action: 'calculate_hash',
        contentLength: content.length,
        hashAlgorithm: 'sha256',
        environment: this.environment,
      }
    );

    if (this.environment === Environment.DEVELOPMENT) {
      console.debug('CSP hash calculated:', securityEvent);
    }

    return hash;
  }

  /**
   * Build CSP header string for given context
   */
  public buildCSPHeader(context: CSPContext): string {
    try {
      // Generate cache key for policy
      const cacheKey = this.generatePolicyCacheKey(context);

      // Check policy cache
      const cachedPolicy = this.policyCache.get(cacheKey);
      if (cachedPolicy && Date.now() - cachedPolicy.timestamp < this.POLICY_TTL) {
        return cachedPolicy.policy;
      }

      // Get base policy for environment
      const basePolicy = this.getBasePolicyForEnvironment();

      // Get page-specific policy if applicable
      const pagePolicy = this.getPageSpecificPolicy(context.endpoint);

      // Merge policies
      const mergedPolicy = this.mergePolicies(basePolicy, pagePolicy);

      // Generate CSP header with nonce and hashes
      const cspHeader = generateCSPHeader(mergedPolicy, context.nonce, context.hashes);

      // Cache the generated policy
      this.policyCache.set(cacheKey, {
        policy: cspHeader,
        timestamp: Date.now(),
      });

      // Log policy generation
      const securityEvent = createSecurityEvent(
        SecurityEventType.CSP_VIOLATION,
        SecuritySeverity.LOW,
        'CSPManager',
        {
          action: 'build_csp_header',
          endpoint: context.endpoint,
          environment: this.environment,
          hasNonce: !!context.nonce,
          hashCount: context.hashes?.length || 0,
        }
      );

      if (this.environment === Environment.DEVELOPMENT) {
        console.debug('CSP header built:', securityEvent);
      }

      return cspHeader;
    } catch (error) {
      // Log CSP building error
      const securityEvent = createSecurityEvent(
        SecurityEventType.CSP_VIOLATION,
        SecuritySeverity.HIGH,
        'CSPManager',
        {
          action: 'build_csp_header_failed',
          endpoint: context.endpoint,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      );

      console.error('CSP header building failed:', securityEvent);

      // Return a safe fallback policy
      return this.getFallbackCSPHeader();
    }
  }

  /**
   * Report CSP violation for analysis and monitoring
   */
  public reportViolation(violation: CSPViolation): void {
    // Add to violation log
    this.violationLog.push(violation);

    // Limit violation log size
    if (this.violationLog.length > 1000) {
      this.violationLog.shift();
    }

    // Determine violation severity
    const severity = this.determineViolationSeverity(violation);

    // Create security event
    const securityEvent = createSecurityEvent(
      SecurityEventType.CSP_VIOLATION,
      severity,
      'CSPManager',
      {
        action: 'csp_violation_reported',
        violatedDirective: violation.violatedDirective,
        blockedUri: violation.blockedUri,
        documentUri: violation.documentUri,
        sourceFile: violation.sourceFile,
        lineNumber: violation.lineNumber,
        environment: this.environment,
      }
    );

    // Log violation based on severity
    if (severity === SecuritySeverity.HIGH || severity === SecuritySeverity.CRITICAL) {
      console.error('CSP Violation (High/Critical):', securityEvent);
    } else if (severity === SecuritySeverity.MEDIUM) {
      console.warn('CSP Violation (Medium):', securityEvent);
    } else {
      console.info('CSP Violation (Low):', securityEvent);
    }

    // Check for violation patterns that might indicate attacks
    this.analyzeViolationPatterns(violation);
  }

  /**
   * Test CSP policy effectiveness
   */
  public async testCSPPolicy(policy: CSPPolicy): Promise<CSPTestResult> {
    const violations: CSPViolation[] = [];
    const recommendations: string[] = [];

    try {
      // Validate policy structure
      const validation = validateCSPPolicy(policy);

      if (!validation.isValid) {
        violations.push({
          documentUri: 'policy-test',
          violatedDirective: 'policy-validation',
          blockedUri: 'validation-error',
          timestamp: new Date(),
        });

        recommendations.push(...validation.errors);
      }

      // Add warnings as recommendations
      recommendations.push(...validation.warnings);

      // Test for common security issues
      await this.performSecurityTests(policy, violations, recommendations);

      // Log policy test
      const securityEvent = createSecurityEvent(
        SecurityEventType.CSP_VIOLATION,
        violations.length > 0 ? SecuritySeverity.MEDIUM : SecuritySeverity.LOW,
        'CSPManager',
        {
          action: 'test_csp_policy',
          violationCount: violations.length,
          recommendationCount: recommendations.length,
          environment: this.environment,
        }
      );

      console.info('CSP policy tested:', securityEvent);

      return {
        isValid: violations.length === 0,
        violations,
        recommendations,
      };
    } catch (error) {
      // Log test failure
      const securityEvent = createSecurityEvent(
        SecurityEventType.CSP_VIOLATION,
        SecuritySeverity.HIGH,
        'CSPManager',
        {
          action: 'test_csp_policy_failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      );

      console.error('CSP policy test failed:', securityEvent);

      return {
        isValid: false,
        violations: [
          {
            documentUri: 'policy-test',
            violatedDirective: 'test-error',
            blockedUri: 'test-failure',
            timestamp: new Date(),
          },
        ],
        recommendations: ['Policy testing failed - manual review required'],
      };
    }
  }

  /**
   * Get violation statistics
   */
  public getViolationStatistics(): {
    totalViolations: number;
    violationsByDirective: Record<string, number>;
    violationsBySource: Record<string, number>;
    recentViolations: CSPViolation[];
  } {
    const violationsByDirective: Record<string, number> = {};
    const violationsBySource: Record<string, number> = {};

    this.violationLog.forEach((violation) => {
      // Count by directive
      const directive = violation.violatedDirective;
      violationsByDirective[directive] = (violationsByDirective[directive] || 0) + 1;

      // Count by source
      const source = violation.sourceFile || 'unknown';
      violationsBySource[source] = (violationsBySource[source] || 0) + 1;
    });

    // Get recent violations (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentViolations = this.violationLog.filter(
      (violation) => violation.timestamp >= oneDayAgo
    );

    return {
      totalViolations: this.violationLog.length,
      violationsByDirective,
      violationsBySource,
      recentViolations,
    };
  }

  /**
   * Clear violation log (for testing or maintenance)
   */
  public clearViolationLog(): void {
    this.violationLog = [];
  }

  /**
   * Get cached nonces (for testing)
   */
  public getCachedNonces(): string[] {
    return Array.from(this.nonceCache.values()).map((entry) => entry.nonce);
  }

  /**
   * Clear all caches
   */
  public clearCaches(): void {
    this.nonceCache.clear();
    this.hashCache.clear();
    this.policyCache.clear();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Private Methods
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Get base CSP policy for current environment
   */
  private getBasePolicyForEnvironment(): CSPPolicy {
    switch (this.environment) {
      case Environment.PRODUCTION:
        return PRODUCTION_CSP_POLICY;
      case Environment.STAGING:
        return STAGING_CSP_POLICY;
      case Environment.DEVELOPMENT:
      default:
        return DEVELOPMENT_CSP_POLICY;
    }
  }

  /**
   * Get page-specific CSP policy
   */
  private getPageSpecificPolicy(endpoint: string): Partial<CSPPolicy> | null {
    // Find matching page policy
    for (const [pattern, policy] of Object.entries(PAGE_CSP_POLICIES)) {
      if (endpoint.startsWith(pattern)) {
        return policy;
      }
    }
    return null;
  }

  /**
   * Merge base policy with page-specific policy
   */
  private mergePolicies(basePolicy: CSPPolicy, pagePolicy: Partial<CSPPolicy> | null): CSPPolicy {
    if (!pagePolicy) {
      return basePolicy;
    }

    const merged: CSPPolicy = { ...basePolicy };

    // Merge each directive
    Object.entries(pagePolicy).forEach(([directive, sources]) => {
      if (Array.isArray(sources) && directive in merged) {
        // Merge arrays, removing duplicates
        const existingSources = (merged as unknown as Record<string, string[]>)[directive] || [];
        const mergedSources = [...new Set([...existingSources, ...sources])];
        (merged as unknown as Record<string, string[]>)[directive] = mergedSources;
      } else if (sources !== undefined) {
        (merged as unknown as Record<string, unknown>)[directive] = sources;
      }
    });

    return merged;
  }

  /**
   * Generate cache key for content
   */
  private generateContentCacheKey(content: string): string {
    // Use a simple hash of the content for caching
    return `content_${content.length}_${content.slice(0, 50)}`;
  }

  /**
   * Generate cache key for policy
   */
  private generatePolicyCacheKey(context: CSPContext): string {
    return `policy_${this.environment}_${context.endpoint}_${!!context.nonce}_${context.hashes?.length || 0}`;
  }

  /**
   * Clean up expired nonces from cache
   */
  private cleanupNonceCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.nonceCache.entries()) {
      if (now - entry.timestamp > this.NONCE_TTL) {
        this.nonceCache.delete(key);
      }
    }
  }

  /**
   * Get fallback CSP header for error cases
   */
  private getFallbackCSPHeader(): string {
    return "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self';";
  }

  /**
   * Determine severity of CSP violation
   */
  private determineViolationSeverity(violation: CSPViolation): SecuritySeverity {
    const directive = violation.violatedDirective.toLowerCase();
    const blockedUri = violation.blockedUri.toLowerCase();

    // High severity for script violations
    if (directive.includes('script') || directive.includes('unsafe')) {
      return SecuritySeverity.HIGH;
    }

    // Medium severity for external resources
    if (blockedUri.startsWith('http') && !blockedUri.includes('localhost')) {
      return SecuritySeverity.MEDIUM;
    }

    // High severity for data: URIs in scripts
    if (directive.includes('script') && blockedUri.startsWith('data:')) {
      return SecuritySeverity.HIGH;
    }

    // Low severity for style and image violations
    if (directive.includes('style') || directive.includes('img')) {
      return SecuritySeverity.LOW;
    }

    return SecuritySeverity.MEDIUM;
  }

  /**
   * Analyze violation patterns for potential attacks
   */
  private analyzeViolationPatterns(violation: CSPViolation): void {
    // Check for rapid successive violations (potential attack)
    const recentViolations = this.violationLog.filter(
      (v) =>
        Date.now() - v.timestamp.getTime() < 60000 && // Last minute
        v.documentUri === violation.documentUri
    );

    if (recentViolations.length >= 10) {
      const securityEvent = createSecurityEvent(
        SecurityEventType.CSP_VIOLATION,
        SecuritySeverity.HIGH,
        'CSPManager',
        {
          action: 'potential_csp_attack_detected',
          violationCount: recentViolations.length,
          documentUri: violation.documentUri,
          violatedDirective: violation.violatedDirective,
        }
      );

      console.error('Potential CSP attack detected:', securityEvent);
    }

    // Check for suspicious blocked URIs
    const suspiciousPatterns = [/javascript:/i, /data:.*script/i, /eval\(/i, /document\.write/i];

    if (suspiciousPatterns.some((pattern) => pattern.test(violation.blockedUri))) {
      const securityEvent = createSecurityEvent(
        SecurityEventType.CSP_VIOLATION,
        SecuritySeverity.HIGH,
        'CSPManager',
        {
          action: 'suspicious_csp_violation',
          blockedUri: violation.blockedUri,
          violatedDirective: violation.violatedDirective,
          pattern: 'suspicious_uri_pattern',
        }
      );

      console.error('Suspicious CSP violation detected:', securityEvent);
    }
  }

  /**
   * Perform security tests on CSP policy
   */
  private async performSecurityTests(
    policy: CSPPolicy,
    violations: CSPViolation[],
    recommendations: string[]
  ): Promise<void> {
    // Test 1: Check for unsafe directives
    const unsafeDirectives = ['unsafe-inline', 'unsafe-eval', 'unsafe-hashes'];

    Object.entries(policy).forEach(([directive, sources]) => {
      if (Array.isArray(sources)) {
        sources.forEach((source) => {
          if (unsafeDirectives.some((unsafe) => source.includes(unsafe))) {
            violations.push({
              documentUri: 'security-test',
              violatedDirective: directive,
              blockedUri: source,
              timestamp: new Date(),
            });
            recommendations.push(`Remove unsafe directive '${source}' from ${directive}`);
          }
        });
      }
    });

    // Test 2: Check for wildcard usage
    Object.entries(policy).forEach(([directive, sources]) => {
      if (Array.isArray(sources) && sources.includes('*')) {
        recommendations.push(
          `Consider restricting wildcard '*' in ${directive} to specific domains`
        );
      }
    });

    // Test 3: Check for missing important directives
    const importantDirectives = ['default-src', 'script-src', 'style-src'];
    importantDirectives.forEach((directive) => {
      if (!(directive in policy) || !policy[directive as keyof CSPPolicy]) {
        recommendations.push(`Consider adding ${directive} directive for better security`);
      }
    });

    // Test 4: Check for report-uri in production
    if (this.environment === Environment.PRODUCTION && !policy.reportUri) {
      recommendations.push('Consider adding report-uri for CSP violation monitoring in production');
    }
  }

  /**
   * Reset singleton instance (for testing)
   */
  public static resetInstance(): void {
    CSPManager.instance = null;
  }

  /**
   * Check if instance is initialized
   */
  public static isInitialized(): boolean {
    return CSPManager.instance !== null;
  }
}
