/**
 * @file lib/security/__tests__/SecretManager.test.ts
 * @description Simplified unit tests for SecretManager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SecretManager } from '../SecretManager';
import { Environment, SecretConfig, SecurityError, SecuritySeverity } from '../types';

describe('SecretManager', () => {
  beforeEach(() => {
    SecretManager.resetInstance();
    delete process.env.GEMINI_API_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.NEXTAUTH_SECRET;
  });

  afterEach(() => {
    SecretManager.resetInstance();
  });

  it('should create singleton instance correctly', () => {
    const config: SecretConfig = {
      rotationEnabled: false,
      rotationIntervalDays: 90,
      requiredSecrets: [],
    };

    const instance1 = SecretManager.getInstance(config, Environment.DEVELOPMENT);
    const instance2 = SecretManager.getInstance();

    expect(instance1).toBe(instance2);
    expect(SecretManager.isInitialized()).toBe(true);
  });

  it('should load secrets from environment variables', async () => {
    process.env.GEMINI_API_KEY = 'test-gemini-key';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';

    const config: SecretConfig = {
      rotationEnabled: false,
      rotationIntervalDays: 90,
      requiredSecrets: [],
    };

    const secretManager = SecretManager.getInstance(config, Environment.DEVELOPMENT);
    const secretStore = await secretManager.loadSecrets(Environment.DEVELOPMENT);

    expect(secretStore.apiKeys.gemini).toBe('test-gemini-key');
    expect(secretStore.databaseUrls.supabase_url).toBe('https://test.supabase.co');
  });

  it('should validate required secrets correctly', async () => {
    process.env.GEMINI_API_KEY = 'test-key';

    const config: SecretConfig = {
      rotationEnabled: false,
      rotationIntervalDays: 90,
      requiredSecrets: ['gemini', 'missing'],
    };

    const secretManager = SecretManager.getInstance(config, Environment.DEVELOPMENT);

    try {
      await secretManager.loadSecrets(Environment.DEVELOPMENT);
      expect.fail('Should have thrown validation error');
    } catch (error) {
      expect(error).toBeInstanceOf(SecurityError);
      expect((error as SecurityError).code).toBe('SECRET_VALIDATION_FAILED');
    }
  });

  it('should get specific secrets correctly', async () => {
    process.env.GEMINI_API_KEY = 'test-gemini-key';

    const config: SecretConfig = {
      rotationEnabled: false,
      rotationIntervalDays: 90,
      requiredSecrets: [],
    };

    const secretManager = SecretManager.getInstance(config, Environment.DEVELOPMENT);
    await secretManager.loadSecrets(Environment.DEVELOPMENT);

    const secret = await secretManager.getSecret('gemini');
    expect(secret).toBe('test-gemini-key');

    const nonExistentSecret = await secretManager.getSecret('non-existent');
    expect(nonExistentSecret).toBeNull();
  });

  it('should maintain access log correctly', () => {
    const config: SecretConfig = {
      rotationEnabled: false,
      rotationIntervalDays: 90,
      requiredSecrets: [],
    };

    const secretManager = SecretManager.getInstance(config, Environment.DEVELOPMENT);
    secretManager.clearAccessLog();

    secretManager.auditSecretAccess('key1', 'accessor1');
    secretManager.auditSecretAccess('key2', 'accessor2');

    const accessLog = secretManager.getAccessLog();
    expect(accessLog).toHaveLength(2);
    expect(accessLog[0].key).toBe('key1');
    expect(accessLog[1].key).toBe('key2');
  });
});
