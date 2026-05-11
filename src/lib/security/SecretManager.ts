/**
 * @file lib/security/SecretManager.ts
 * @description Simplified secret management service focusing on environment variables
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
   * Load secrets from environment variables
   */
  public async loadSecrets(environment: Environment): Promise<SecretStore> {
    try {
      this.environment = environment;

      // Load secrets from environment
      this.secretStore = await this.loadFromEnvironment();

      // Validate that all required secrets are present
      const validation = await this.validateSecrets();
      if (!validation.isValid) {
        throw new SecurityError(
          `Secret validation failed: ${validation.errors.join(', ')}`,
          'SECRET_VALIDATION_FAILED',
          SecuritySeverity.CRITICAL
        );
      }

      return this.secretStore;
    } catch (error) {
      console.error('Secret loading failed:', error);
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

    // Check all secret categories
    const allSecrets = {
      ...this.secretStore.apiKeys,
      ...this.secretStore.databaseUrls,
      ...this.secretStore.authTokens,
      ...this.secretStore.encryptionKeys,
    };

    const value = allSecrets[key] || null;
    if (value) {
      this.auditSecretAccess(key, 'getSecret');
    }

    return value;
  }

  /**
   * Reload secrets from environment
   */
  public async rotateSecret(_key: string): Promise<void> {
    // For environment variables, "rotation" just means reloading
    await this.loadSecrets(this.environment);
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
      } else {
        const trimmed = secret.trim();
        if (trimmed.length === 0) {
          errors.push(`Secret '${requiredSecret}' is empty`);
        } else if (trimmed.length < 8) {
          warnings.push(`Secret '${requiredSecret}' is very short`);
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
   * Simple audit logging
   */
  public auditSecretAccess(key: string, accessor: string): void {
    this.accessLog.push({
      key,
      accessor,
      timestamp: new Date(),
    });

    if (this.accessLog.length > 100) {
      this.accessLog.shift();
    }
  }

  public getAccessLog() {
    return [...this.accessLog];
  }

  public clearAccessLog(): void {
    this.accessLog = [];
  }

  private async loadFromEnvironment(): Promise<SecretStore> {
    const secretStore: SecretStore = {
      apiKeys: {},
      databaseUrls: {},
      authTokens: {},
      encryptionKeys: {},
    };

    const mappings = {
      apiKeys: {
        GEMINI_API_KEY: 'gemini',
        OPENAI_API_KEY: 'openai',
        ANTHROPIC_API_KEY: 'anthropic',
      },
      databaseUrls: {
        NEXT_PUBLIC_SUPABASE_URL: 'supabase_url',
        DATABASE_URL: 'primary_db',
        REDIS_URL: 'redis',
      },
      authTokens: {
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'supabase_anon',
        SUPABASE_SERVICE_ROLE_KEY: 'supabase_service',
        NEXTAUTH_SECRET: 'nextauth',
        CALCULATION_ADMIN_KEY: 'admin',
      },
      encryptionKeys: {
        ENCRYPTION_KEY: 'primary',
        JWT_SECRET: 'jwt',
      },
    };

    Object.entries(mappings).forEach(([category, map]) => {
      Object.entries(map).forEach(([envVar, key]) => {
        const value = process.env[envVar];
        if (value) {
          (secretStore[category as keyof SecretStore] as Record<string, string>)[key] = value;
        }
      });
    });

    return secretStore;
  }

  public static resetInstance(): void {
    SecretManager.instance = null;
  }

  public static isInitialized(): boolean {
    return SecretManager.instance !== null;
  }
}
