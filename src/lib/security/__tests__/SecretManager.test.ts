/**
 * @file lib/security/__tests__/SecretManager.test.ts
 * @description Property-based and unit tests for SecretManager
 *
 * Tests both specific scenarios and universal properties of secret management
 * including loading, validation, rotation, and audit logging.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { fc, SecurityArbitraries, PROPERTY_TEST_CONFIG } from './setup';
import { SecretManager } from '../SecretManager';
import { Environment, SecretConfig, SecurityError } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Test Setup
// ─────────────────────────────────────────────────────────────────────────────

describe('SecretManager', () => {
  beforeEach(() => {
    // Reset singleton before each test
    SecretManager.resetInstance();

    // Clear environment variables
    delete process.env.GEMINI_API_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.NEXTAUTH_SECRET;
  });

  afterEach(() => {
    SecretManager.resetInstance();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Property-Based Tests
  // ─────────────────────────────────────────────────────────────────────────────

  describe('Property Tests', () => {
    // Feature: security-hardening, Property 1: Secret Management Security
    it('should load secrets from appropriate source and validate presence', () => {
      fc.assert(
        fc.asyncProperty(
          fc.record({
            environment: SecurityArbitraries.environment,
            provider: fc.constantFrom('env', 'vault', 'aws-secrets'),
            rotationEnabled: fc.boolean(),
            requiredSecrets: fc.array(fc.string({ minLength: 1, maxLength: 50 }), {
              maxLength: 10,
            }),
          }),
          async (configData) => {
            // Reset singleton for each test case
            SecretManager.resetInstance();

            const config: SecretConfig = {
              provider: configData.provider as 'env' | 'vault' | 'aws-secrets',
              rotationEnabled: configData.rotationEnabled,
              rotationIntervalDays: 90,
              requiredSecrets: configData.requiredSecrets,
            };

            const environment = configData.environment as Environment;

            // Only test environment provider for now (others throw not implemented)
            if (config.provider !== 'env') {
              const secretManager = SecretManager.getInstance(config, environment);

              try {
                await secretManager.loadSecrets(environment);
                return false; // Should have thrown for unimplemented providers
              } catch (error) {
                return (
                  error instanceof SecurityError &&
                  (error.code === 'VAULT_NOT_IMPLEMENTED' ||
                    error.code === 'AWS_SECRETS_NOT_IMPLEMENTED')
                );
              }
            }

            // Test environment provider
            const secretManager = SecretManager.getInstance(config, environment);

            try {
              const secretStore = await secretManager.loadSecrets(environment);

              // Property: Secret store should be loaded successfully
              expect(secretStore).toBeDefined();
              expect(secretStore.apiKeys).toBeDefined();
              expect(secretStore.databaseUrls).toBeDefined();
              expect(secretStore.authTokens).toBeDefined();
              expect(secretStore.encryptionKeys).toBeDefined();

              // Property: Validation should work correctly
              const validation = await secretManager.validateSecrets();
              expect(validation).toBeDefined();
              expect(typeof validation.isValid).toBe('boolean');
              expect(Array.isArray(validation.errors)).toBe(true);
              expect(Array.isArray(validation.warnings)).toBe(true);

              return true;
            } catch (error) {
              // If required secrets are missing, validation should fail appropriately
              return error instanceof SecurityError && error.code === 'SECRET_VALIDATION_FAILED';
            }
          }
        ),
        PROPERTY_TEST_CONFIG
      );
    });

    it('should audit all secret access attempts', () => {
      fc.assert(
        fc.asyncProperty(
          fc.record({
            environment: SecurityArbitraries.environment,
            secretKey: fc.string({ minLength: 1, maxLength: 50 }),
            accessor: fc.string({ minLength: 1, maxLength: 50 }),
          }),
          async (data) => {
            const config: SecretConfig = {
              provider: 'env',
              rotationEnabled: false,
              rotationIntervalDays: 90,
              requiredSecrets: [],
            };

            const secretManager = SecretManager.getInstance(
              config,
              data.environment as Environment
            );

            // Clear access log
            secretManager.clearAccessLog();

            // Audit a secret access
            secretManager.auditSecretAccess(data.secretKey, data.accessor);

            // Property: Access should be logged
            const accessLog = secretManager.getAccessLog();
            expect(accessLog.length).toBe(1);
            expect(accessLog[0].key).toBe(data.secretKey);
            expect(accessLog[0].accessor).toBe(data.accessor);
            expect(accessLog[0].timestamp).toBeInstanceOf(Date);

            return true;
          }
        ),
        PROPERTY_TEST_CONFIG
      );
    });

    it('should handle secret validation correctly for any configuration', () => {
      fc.assert(
        fc.asyncProperty(
          fc.record({
            environment: SecurityArbitraries.environment,
            requiredSecrets: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 5 }),
          }),
          async (data) => {
            const config: SecretConfig = {
              provider: 'env',
              rotationEnabled: false,
              rotationIntervalDays: 90,
              requiredSecrets: data.requiredSecrets,
            };

            const secretManager = SecretManager.getInstance(
              config,
              data.environment as Environment
            );

            try {
              await secretManager.loadSecrets(data.environment as Environment);
              const validation = await secretManager.validateSecrets();

              // Property: Validation result should always have correct structure
              expect(typeof validation.isValid).toBe('boolean');
              expect(Array.isArray(validation.errors)).toBe(true);
              expect(Array.isArray(validation.warnings)).toBe(true);

              // Property: If there are errors, isValid should be false
              if (validation.errors.length > 0) {
                expect(validation.isValid).toBe(false);
              }

              return true;
            } catch (error) {
              // If validation fails during loading, it should be a SecurityError
              return error instanceof SecurityError;
            }
          }
        ),
        PROPERTY_TEST_CONFIG
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Unit Tests
  // ─────────────────────────────────────────────────────────────────────────────

  describe('Unit Tests', () => {
    it('should create singleton instance correctly', () => {
      const config: SecretConfig = {
        provider: 'env',
        rotationEnabled: false,
        rotationIntervalDays: 90,
        requiredSecrets: [],
      };

      const instance1 = SecretManager.getInstance(config, Environment.DEVELOPMENT);
      const instance2 = SecretManager.getInstance();

      expect(instance1).toBe(instance2);
      expect(SecretManager.isInitialized()).toBe(true);
    });

    it('should throw error when accessing uninitialized instance', () => {
      expect(() => {
        SecretManager.getInstance();
      }).toThrow(SecurityError);
    });

    it('should load secrets from environment variables', async () => {
      // Set up test environment variables
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      const config: SecretConfig = {
        provider: 'env',
        rotationEnabled: false,
        rotationIntervalDays: 90,
        requiredSecrets: [],
      };

      const secretManager = SecretManager.getInstance(config, Environment.DEVELOPMENT);
      const secretStore = await secretManager.loadSecrets(Environment.DEVELOPMENT);

      expect(secretStore.apiKeys.gemini).toBe('test-gemini-key');
      expect(secretStore.databaseUrls.supabase_url).toBe('https://test.supabase.co');
      expect(secretStore.authTokens.supabase_anon).toBe('test-anon-key');
    });

    it('should validate required secrets correctly', async () => {
      process.env.GEMINI_API_KEY = 'test-key';

      const config: SecretConfig = {
        provider: 'env',
        rotationEnabled: false,
        rotationIntervalDays: 90,
        requiredSecrets: ['GEMINI_API_KEY', 'MISSING_SECRET'],
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
        provider: 'env',
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

    it('should throw error when getting secret before loading', async () => {
      const config: SecretConfig = {
        provider: 'env',
        rotationEnabled: false,
        rotationIntervalDays: 90,
        requiredSecrets: [],
      };

      const secretManager = SecretManager.getInstance(config, Environment.DEVELOPMENT);

      try {
        await secretManager.getSecret('test');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(SecurityError);
        expect((error as SecurityError).code).toBe('SECRET_STORE_NOT_LOADED');
      }
    });

    it('should handle rotation when disabled', async () => {
      const config: SecretConfig = {
        provider: 'env',
        rotationEnabled: false,
        rotationIntervalDays: 90,
        requiredSecrets: [],
      };

      const secretManager = SecretManager.getInstance(config, Environment.DEVELOPMENT);
      await secretManager.loadSecrets(Environment.DEVELOPMENT);

      try {
        await secretManager.rotateSecret('test-key');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(SecurityError);
        expect((error as SecurityError).code).toBe('SECRET_ROTATION_DISABLED');
      }
    });

    it('should maintain access log correctly', () => {
      const config: SecretConfig = {
        provider: 'env',
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

    it('should limit access log size', () => {
      const config: SecretConfig = {
        provider: 'env',
        rotationEnabled: false,
        rotationIntervalDays: 90,
        requiredSecrets: [],
      };

      const secretManager = SecretManager.getInstance(config, Environment.DEVELOPMENT);
      secretManager.clearAccessLog();

      // Add more than 1000 entries
      for (let i = 0; i < 1005; i++) {
        secretManager.auditSecretAccess(`key${i}`, 'accessor');
      }

      const accessLog = secretManager.getAccessLog();
      expect(accessLog).toHaveLength(1000);
      expect(accessLog[0].key).toBe('key5'); // First 5 should be removed
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Integration Tests
  // ─────────────────────────────────────────────────────────────────────────────

  describe('Integration Tests', () => {
    it('should work with production environment validation', async () => {
      // Set a development secret to trigger warning
      process.env.DEV_API_KEY = 'test-dev-key';
      process.env.GEMINI_API_KEY = 'test-gemini-key';

      const config: SecretConfig = {
        provider: 'env',
        rotationEnabled: false,
        rotationIntervalDays: 90,
        requiredSecrets: [],
      };

      const secretManager = SecretManager.getInstance(config, Environment.PRODUCTION);
      await secretManager.loadSecrets(Environment.PRODUCTION);

      const validation = await secretManager.validateSecrets();
      expect(validation.isValid).toBe(true);
      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(
        validation.warnings.some((w) => w.includes('Development secret found in production'))
      ).toBe(true);
    });

    it('should handle complete secret management workflow', async () => {
      // Reset singleton to ensure clean state with rotation enabled
      SecretManager.resetInstance();

      // Clear and set environment variables (beforeEach clears them)
      process.env.GEMINI_API_KEY = 'test-key-12345678';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';

      const config: SecretConfig = {
        provider: 'env',
        rotationEnabled: true,
        rotationIntervalDays: 30,
        requiredSecrets: ['gemini'], // Use mapped key 'gemini' instead of 'GEMINI_API_KEY'
      };

      const secretManager = SecretManager.getInstance(config, Environment.STAGING);

      // Load secrets
      const secretStore = await secretManager.loadSecrets(Environment.STAGING);
      expect(secretStore).toBeDefined();

      // Validate secrets
      const validation = await secretManager.validateSecrets();
      expect(validation.isValid).toBe(true);

      // Get specific secret
      const secret = await secretManager.getSecret('gemini');
      expect(secret).toBe('test-key-12345678');

      // Check access log
      const accessLog = secretManager.getAccessLog();
      expect(accessLog.length).toBeGreaterThan(0);

      // Test rotation (should work since enabled)
      await expect(secretManager.rotateSecret('gemini')).resolves.not.toThrow();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Secret Rotation Manager Tests
// ─────────────────────────────────────────────────────────────────────────────

import { SecretRotationManager } from '../SecretRotationManager';

describe('SecretRotationManager', () => {
  let secretManager: SecretManager;
  let rotationManager: SecretRotationManager;

  beforeEach(async () => {
    SecretManager.resetInstance();

    // Setup test environment
    process.env.GEMINI_API_KEY = 'test-key-12345678';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';

    const config: SecretConfig = {
      provider: 'env',
      rotationEnabled: true,
      rotationIntervalDays: 30,
      requiredSecrets: [],
    };

    secretManager = SecretManager.getInstance(config, Environment.DEVELOPMENT);
    await secretManager.loadSecrets(Environment.DEVELOPMENT);

    rotationManager = new SecretRotationManager(secretManager);
  });

  afterEach(() => {
    rotationManager.stopAutomaticRotation();
    SecretManager.resetInstance();
  });

  describe('Property Tests', () => {
    // Feature: security-hardening, Property 2: Secret Rotation Capability
    it('should successfully rotate any valid secret and maintain system functionality', () => {
      fc.assert(
        fc.asyncProperty(
          fc.record({
            secretKey: fc.string({ minLength: 1, maxLength: 50 }),
            intervalDays: fc.integer({ min: 7, max: 365 }),
            autoRotate: fc.boolean(),
            newValue: fc.option(fc.string({ minLength: 16, maxLength: 64 })),
          }),
          async (data) => {
            try {
              // Schedule rotation
              rotationManager.scheduleRotation(data.secretKey, data.intervalDays, data.autoRotate);

              // Property: Schedule should be created successfully
              const schedule = rotationManager.getRotationSchedule(data.secretKey);
              expect(schedule).toBeDefined();
              expect(schedule!.secretKey).toBe(data.secretKey);
              expect(schedule!.intervalDays).toBe(data.intervalDays);
              expect(schedule!.autoRotate).toBe(data.autoRotate);

              // Property: Next rotation should be scheduled correctly
              const expectedNextRotation = new Date(
                Date.now() + data.intervalDays * 24 * 60 * 60 * 1000
              );
              const actualNextRotation = schedule!.nextRotation;
              const timeDiff = Math.abs(
                expectedNextRotation.getTime() - actualNextRotation.getTime()
              );
              expect(timeDiff).toBeLessThan(1000); // Within 1 second

              return true;
            } catch (error) {
              // Property: Invalid intervals should throw appropriate errors
              if (error instanceof SecurityError) {
                return (
                  error.code === 'ROTATION_INTERVAL_TOO_SHORT' ||
                  error.code === 'ROTATION_INTERVAL_TOO_LONG'
                );
              }
              return false;
            }
          }
        ),
        PROPERTY_TEST_CONFIG
      );
    });

    it('should maintain rotation history correctly for any rotation operation', () => {
      fc.assert(
        fc.asyncProperty(
          fc.record({
            secretKey: fc.string({ minLength: 1, maxLength: 50 }),
            operations: fc.array(fc.constantFrom('rotate', 'schedule', 'remove'), {
              minLength: 1,
              maxLength: 5,
            }),
          }),
          async (data) => {
            // Reset instances for each run to ensure isolation and prevent state leakage
            SecretManager.resetInstance();
            const localConfig: SecretConfig = {
              provider: 'env',
              rotationEnabled: true,
              rotationIntervalDays: 30,
              requiredSecrets: ['gemini'],
            };
            const localSecretManager = SecretManager.getInstance(
              localConfig,
              Environment.DEVELOPMENT
            );
            await localSecretManager.loadSecrets(Environment.DEVELOPMENT);
            const localRotationManager = new SecretRotationManager(localSecretManager);

            const initialHistoryLength = localRotationManager.getRotationHistory().length;
            let expectedRotations = 0;

            for (const operation of data.operations) {
              try {
                switch (operation) {
                  case 'schedule':
                    localRotationManager.scheduleRotation(data.secretKey, 30, false);
                    break;
                  case 'rotate':
                    // Only attempt rotation if secret exists
                    const keyToRotate = 'gemini';
                    const secret = await localSecretManager.getSecret(keyToRotate);
                    if (secret) {
                      // rotationManager adds to history regardless of success/failure
                      expectedRotations++;
                      await localRotationManager.rotateSecretWithZeroDowntime(keyToRotate);
                    }
                    break;
                  case 'remove':
                    localRotationManager.removeRotationSchedule(data.secretKey);
                    break;
                }
              } catch (_error) {
                // Some operations may fail, which is expected
              }
            }

            // Property: Rotation history should reflect actual rotations performed
            const finalHistory = localRotationManager.getRotationHistory();
            const actualRotations = finalHistory.length - initialHistoryLength;
            expect(actualRotations).toBe(expectedRotations);

            return true;
          }
        ),
        { ...PROPERTY_TEST_CONFIG, numRuns: 20 }
      ); // Fewer runs for complex operations
    });

    it('should validate rotation intervals according to policy', () => {
      fc.assert(
        fc.property(
          fc.record({
            minDays: fc.integer({ min: 1, max: 30 }),
            maxDays: fc.integer({ min: 31, max: 1000 }),
            intervalDays: fc.integer({ min: 1, max: 1000 }),
          }),
          (data) => {
            // Create rotation manager with custom policy
            const customRotationManager = new SecretRotationManager(secretManager, {
              minRotationIntervalDays: data.minDays,
              maxRotationIntervalDays: data.maxDays,
            });

            try {
              customRotationManager.scheduleRotation('test-key', data.intervalDays);

              // Property: Should succeed only if interval is within policy bounds
              return data.intervalDays >= data.minDays && data.intervalDays <= data.maxDays;
            } catch (error) {
              // Property: Should fail only if interval is outside policy bounds
              return (
                error instanceof SecurityError &&
                (data.intervalDays < data.minDays || data.intervalDays > data.maxDays)
              );
            }
          }
        ),
        PROPERTY_TEST_CONFIG
      );
    });
  });

  describe('Unit Tests', () => {
    it('should schedule rotation correctly', () => {
      rotationManager.scheduleRotation('test-key', 30, true, ['admin@test.com']);

      const schedule = rotationManager.getRotationSchedule('test-key');
      expect(schedule).toBeDefined();
      expect(schedule!.secretKey).toBe('test-key');
      expect(schedule!.intervalDays).toBe(30);
      expect(schedule!.autoRotate).toBe(true);
      expect(schedule!.notificationEmails).toEqual(['admin@test.com']);
    });

    it('should reject invalid rotation intervals', () => {
      expect(() => {
        rotationManager.scheduleRotation('test-key', 1); // Too short
      }).toThrow(SecurityError);

      expect(() => {
        rotationManager.scheduleRotation('test-key', 1000); // Too long
      }).toThrow(SecurityError);
    });

    it('should perform manual rotation successfully', async () => {
      // Ensure rotation is enabled in config
      expect(secretManager['config'].rotationEnabled).toBe(true);

      const result = await rotationManager.rotateSecretWithZeroDowntime('gemini');

      expect(result.success).toBe(true);
      expect(result.secretKey).toBe('gemini');
      expect(result.rotatedAt).toBeInstanceOf(Date);
      expect(result.oldValue).toBeDefined();
      expect(result.newValue).toBeDefined();
    });

    it('should handle rotation failure gracefully', async () => {
      try {
        await rotationManager.rotateSecretWithZeroDowntime('non-existent-key');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(SecurityError);
      }

      const history = rotationManager.getRotationHistory('non-existent-key');
      expect(history.length).toBe(1);
      expect(history[0].success).toBe(false);
      expect(history[0].error).toBeDefined();
    });

    it('should manage rotation schedules correctly', () => {
      rotationManager.scheduleRotation('key1', 30);
      rotationManager.scheduleRotation('key2', 60);

      const allSchedules = rotationManager.getAllRotationSchedules();
      expect(allSchedules).toHaveLength(2);

      const removed = rotationManager.removeRotationSchedule('key1');
      expect(removed).toBe(true);

      const remainingSchedules = rotationManager.getAllRotationSchedules();
      expect(remainingSchedules).toHaveLength(1);
      expect(remainingSchedules[0].secretKey).toBe('key2');
    });

    it('should identify secrets needing rotation', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);

      // Manually create a schedule that needs rotation
      rotationManager.scheduleRotation('urgent-key', 30);
      const schedule = rotationManager.getRotationSchedule('urgent-key')!;
      schedule.nextRotation = pastDate;

      const needingRotation = rotationManager.getSecretsNeedingRotation(0);
      expect(needingRotation).toHaveLength(1);
      expect(needingRotation[0].secretKey).toBe('urgent-key');
    });

    it('should update rotation policy correctly', () => {
      const newPolicy = {
        minRotationIntervalDays: 14,
        requireManualApproval: true,
      };

      rotationManager.updateRotationPolicy(newPolicy);

      const currentPolicy = rotationManager.getRotationPolicy();
      expect(currentPolicy.minRotationIntervalDays).toBe(14);
      expect(currentPolicy.requireManualApproval).toBe(true);
    });

    it('should export and import rotation configuration', () => {
      rotationManager.scheduleRotation('key1', 30);
      rotationManager.scheduleRotation('key2', 60);

      const exported = rotationManager.exportRotationConfiguration();
      expect(exported.schedules).toHaveLength(2);
      expect(exported.policy).toBeDefined();
      expect(exported.exportedAt).toBeInstanceOf(Date);

      // Create new rotation manager and import
      const newRotationManager = new SecretRotationManager(secretManager);
      newRotationManager.importRotationConfiguration(exported);

      const importedSchedules = newRotationManager.getAllRotationSchedules();
      expect(importedSchedules).toHaveLength(2);
    });

    it('should cleanup old rotation history', () => {
      // Add some rotation history entries
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 100);

      // Manually add old entries to history (accessing private property for testing)
      const _history = rotationManager.getRotationHistory();
      (rotationManager as unknown as { rotationHistory: unknown[] }).rotationHistory.push({
        success: true,
        secretKey: 'old-key',
        rotatedAt: oldDate,
      });

      rotationManager.cleanupRotationHistory(30);

      const cleanedHistory = rotationManager.getRotationHistory();
      expect(
        cleanedHistory.every((entry) => {
          const daysDiff = (Date.now() - entry.rotatedAt.getTime()) / (1000 * 60 * 60 * 24);
          return daysDiff <= 30;
        })
      ).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete rotation workflow', async () => {
      // Schedule rotation
      rotationManager.scheduleRotation('gemini', 30, true);

      // Perform rotation
      const result = await rotationManager.rotateSecretWithZeroDowntime('gemini');
      expect(result.success).toBe(true);

      // Check history
      const history = rotationManager.getRotationHistory('gemini');
      expect(history).toHaveLength(1);
      expect(history[0].success).toBe(true);

      // Check schedule was updated
      const schedule = rotationManager.getRotationSchedule('gemini');
      expect(schedule!.lastRotated).toBeInstanceOf(Date);
    });

    it('should handle automatic rotation monitoring', async () => {
      // Create a schedule that needs immediate rotation
      rotationManager.scheduleRotation('gemini', 30, true);
      const schedule = rotationManager.getRotationSchedule('gemini')!;
      schedule.nextRotation = new Date(Date.now() - 1000); // Past due

      // Check and perform scheduled rotations
      await rotationManager.checkAndPerformScheduledRotations();

      // Verify rotation was performed
      const history = rotationManager.getRotationHistory('gemini');
      expect(history.length).toBeGreaterThan(0);
      expect(history[history.length - 1].success).toBe(true);
    });
  });
});
