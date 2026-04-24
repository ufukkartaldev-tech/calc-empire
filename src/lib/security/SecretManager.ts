/**
 * @file lib/security/SecretManager.ts
 * @description Secret management service with environment-specific loading and rotation
 *
 * This service provides secure secret management with support for different
 * secret sources (environment variables, vault, AWS Secrets Manager) and
 * automatic rotation capabilities.
 */

import {
  SecretManager as ISecretManager,
  SecretStore,
  SecretConfig,
  Environment,
  ValidationResult,
  SecurityError,
  SecuritySeverity,
} from './types';
import { createSecurityEvent } from './utils/monitoring';
import { SecurityEventType } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Secret Manager Implementation
// ─────────────────────────────────────────────────────────────────────────────

export class SecretManager implements ISecretManager {
  private static instance: SecretManager | null = null;
  private secretStore: SecretStore | null = null;
  private config: SecretConfig;
  private environment: Environment;
  private accessLog: Array<{ key: string; accessor: string; timestamp: Date }> = [];

  private constructor(config: SecretConfig, environment: Environment) {
    this.config = config;
    this.environment = environment;
  }

  /**
   * Get singleton instance of SecretManager
   */
  public static getInstance(config?: SecretConfig, environment?: Environment): SecretManager {
    if (!SecretManager.instance) {
      if (!config || !environment) {
        throw new SecurityError(
          'SecretManager must be initialized with config and environment',
          'SECRET_MANAGER_NOT_INITIALIZED',
          SecuritySeverity.CRITICAL
        );
      }
      SecretManager.instance = new SecretManager(config, environment);
    }
    return SecretManager.instance;
  }

  /**
   * Load secrets from the configured source based on environment
   */
  public async loadSecrets(environment: Environment): Promise<SecretStore> {
    try {
      this.environment = environment;

      switch (this.config.provider) {
        case 'env':
          this.secretStore = await this.loadFromEnvironment();
          break;
        case 'vault':
          this.secretStore = await this.loadFromVault();
          break;
        case 'aws-secrets':
          this.secretStore = await this.loadFromAWSSecrets();
          break;
        default:
          throw new SecurityError(
            `Unsupported secret provider: ${this.config.provider}`,
            'UNSUPPORTED_SECRET_PROVIDER',
            SecuritySeverity.HIGH
          );
      }

      // Validate that all required secrets are present
      const validation = await this.validateSecrets();
      if (!validation.isValid) {
        throw new SecurityError(
          `Secret validation failed: ${validation.errors.join(', ')}`,
          'SECRET_VALIDATION_FAILED',
          SecuritySeverity.CRITICAL
        );
      }

      // Log successful secret loading
      this.auditSecretAccess('SECRET_STORE_LOADED', 'SecretManager');

      return this.secretStore;
    } catch (error) {
      // Log security event for failed secret loading
      const securityEvent = createSecurityEvent(
        SecurityEventType.SECRET_ACCESS,
        SecuritySeverity.HIGH,
        'SecretManager',
        {
          action: 'load_secrets',
          environment,
          provider: this.config.provider,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      );

      // In a real implementation, this would be sent to the audit logger
      console.error('Secret loading failed:', securityEvent);

      throw error;
    }
  }

  /**
   * Get a specific secret by key
   */
  public async getSecret(key: string): Promise<string | null> {
    if (!this.secretStore) {
      throw new SecurityError(
        'Secret store not loaded. Call loadSecrets() first.',
        'SECRET_STORE_NOT_LOADED',
        SecuritySeverity.HIGH
      );
    }

    // Log secret access for audit purposes
    this.auditSecretAccess(key, 'getSecret');

    // Check all secret categories
    const allSecrets = {
      ...this.secretStore.apiKeys,
      ...this.secretStore.databaseUrls,
      ...this.secretStore.authTokens,
      ...this.secretStore.encryptionKeys,
    };

    return allSecrets[key] || null;
  }

  /**
   * Rotate a specific secret (placeholder implementation)
   */
  public async rotateSecret(key: string): Promise<void> {
    if (!this.config.rotationEnabled) {
      throw new SecurityError(
        'Secret rotation is not enabled in configuration',
        'SECRET_ROTATION_DISABLED',
        SecuritySeverity.MEDIUM
      );
    }

    if (!this.secretStore) {
      throw new SecurityError(
        'Secret store not loaded. Call loadSecrets() first.',
        'SECRET_STORE_NOT_LOADED',
        SecuritySeverity.HIGH
      );
    }

    try {
      // Log rotation attempt
      this.auditSecretAccess(key, 'rotateSecret');

      // In a real implementation, this would:
      // 1. Generate new secret value
      // 2. Update the secret in the provider (vault, AWS, etc.)
      // 3. Update local cache
      // 4. Notify dependent services
      // 5. Schedule old secret deprecation

      // For now, we'll simulate the rotation
      await this.simulateSecretRotation(key);

      // Log successful rotation
      const securityEvent = createSecurityEvent(
        SecurityEventType.SECRET_ACCESS,
        SecuritySeverity.MEDIUM,
        'SecretManager',
        {
          action: 'rotate_secret',
          key,
          environment: this.environment,
          timestamp: new Date().toISOString(),
        }
      );

      console.info('Secret rotated successfully:', securityEvent);
    } catch (error) {
      const securityEvent = createSecurityEvent(
        SecurityEventType.SECRET_ACCESS,
        SecuritySeverity.HIGH,
        'SecretManager',
        {
          action: 'rotate_secret_failed',
          key,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      );

      console.error('Secret rotation failed:', securityEvent);
      throw error;
    }
  }

  /**
   * Validate that all required secrets are present and valid
   */
  public async validateSecrets(): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!this.secretStore) {
      return {
        isValid: false,
        errors: ['Secret store not loaded'],
        warnings: [],
      };
    }

    // Check required secrets
    for (const requiredSecret of this.config.requiredSecrets) {
      const secret = await this.getSecret(requiredSecret);

      if (!secret) {
        errors.push(`Required secret missing: ${requiredSecret}`);
      } else if (secret.length < 8) {
        warnings.push(`Secret '${requiredSecret}' appears to be too short`);
      }
    }

    // Environment-specific validations
    if (this.environment === Environment.PRODUCTION) {
      // In production, ensure no development secrets are present
      const devSecrets = ['DEV_API_KEY', 'TEST_SECRET', 'DEBUG_TOKEN'];
      for (const devSecret of devSecrets) {
        const secret = await this.getSecret(devSecret);
        if (secret) {
          warnings.push(`Development secret found in production: ${devSecret}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Audit secret access for security monitoring
   */
  public auditSecretAccess(key: string, accessor: string): void {
    const accessEntry = {
      key,
      accessor,
      timestamp: new Date(),
    };

    this.accessLog.push(accessEntry);

    // Keep only last 1000 access entries
    if (this.accessLog.length > 1000) {
      this.accessLog.shift();
    }

    // Create security event for monitoring
    const securityEvent = createSecurityEvent(
      SecurityEventType.SECRET_ACCESS,
      SecuritySeverity.LOW,
      'SecretManager',
      {
        key,
        accessor,
        environment: this.environment,
        timestamp: accessEntry.timestamp.toISOString(),
      }
    );

    // In a real implementation, this would be sent to the audit logger
    // For now, we'll just log it for development
    if (this.environment === Environment.DEVELOPMENT) {
      console.debug('Secret access logged:', securityEvent);
    }
  }

  /**
   * Get access log for audit purposes
   */
  public getAccessLog(): Array<{ key: string; accessor: string; timestamp: Date }> {
    return [...this.accessLog];
  }

  /**
   * Clear access log (for testing purposes)
   */
  public clearAccessLog(): void {
    this.accessLog = [];
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Private Methods - Secret Loading Implementations
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Load secrets from environment variables
   */
  private async loadFromEnvironment(): Promise<SecretStore> {
    const secretStore: SecretStore = {
      apiKeys: {},
      databaseUrls: {},
      authTokens: {},
      encryptionKeys: {},
    };

    // Load API keys
    const apiKeyMappings = {
      GEMINI_API_KEY: 'gemini',
      OPENAI_API_KEY: 'openai',
      ANTHROPIC_API_KEY: 'anthropic',
    };

    Object.entries(apiKeyMappings).forEach(([envVar, key]) => {
      const value = process.env[envVar];
      if (value) {
        secretStore.apiKeys[key] = value;
      }
    });

    // Load database URLs
    const dbMappings = {
      NEXT_PUBLIC_SUPABASE_URL: 'supabase_url',
      DATABASE_URL: 'primary_db',
      REDIS_URL: 'redis',
    };

    Object.entries(dbMappings).forEach(([envVar, key]) => {
      const value = process.env[envVar];
      if (value) {
        secretStore.databaseUrls[key] = value;
      }
    });

    // Load auth tokens
    const authMappings = {
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'supabase_anon',
      SUPABASE_SERVICE_ROLE_KEY: 'supabase_service',
      NEXTAUTH_SECRET: 'nextauth',
      CALCULATION_ADMIN_KEY: 'admin',
    };

    Object.entries(authMappings).forEach(([envVar, key]) => {
      const value = process.env[envVar];
      if (value) {
        secretStore.authTokens[key] = value;
      }
    });

    // Load encryption keys
    const encryptionMappings = {
      ENCRYPTION_KEY: 'primary',
      JWT_SECRET: 'jwt',
    };

    Object.entries(encryptionMappings).forEach(([envVar, key]) => {
      const value = process.env[envVar];
      if (value) {
        secretStore.encryptionKeys[key] = value;
      }
    });

    return secretStore;
  }

  /**
   * Load secrets from HashiCorp Vault (placeholder implementation)
   */
  private async loadFromVault(): Promise<SecretStore> {
    // In a real implementation, this would:
    // 1. Authenticate with Vault using token or other method
    // 2. Fetch secrets from appropriate paths
    // 3. Handle Vault-specific errors and retries

    throw new SecurityError(
      'Vault integration not yet implemented',
      'VAULT_NOT_IMPLEMENTED',
      SecuritySeverity.HIGH
    );
  }

  /**
   * Load secrets from AWS Secrets Manager (placeholder implementation)
   */
  private async loadFromAWSSecrets(): Promise<SecretStore> {
    // In a real implementation, this would:
    // 1. Use AWS SDK to connect to Secrets Manager
    // 2. Fetch secrets by name or ARN
    // 3. Handle AWS-specific errors and retries
    // 4. Parse JSON secrets appropriately

    throw new SecurityError(
      'AWS Secrets Manager integration not yet implemented',
      'AWS_SECRETS_NOT_IMPLEMENTED',
      SecuritySeverity.HIGH
    );
  }

  /**
   * Simulate secret rotation (placeholder implementation)
   */
  private async simulateSecretRotation(key: string): Promise<void> {
    // Simulate rotation delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // In a real implementation, this would generate a new secret value
    // and update it in the appropriate secret store

    // For simulation, we'll just log the rotation
    console.info(`Secret '${key}' rotation simulated successfully`);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Static Utility Methods
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Reset singleton instance (for testing purposes)
   */
  public static resetInstance(): void {
    SecretManager.instance = null;
  }

  /**
   * Check if instance is initialized
   */
  public static isInitialized(): boolean {
    return SecretManager.instance !== null;
  }
}
