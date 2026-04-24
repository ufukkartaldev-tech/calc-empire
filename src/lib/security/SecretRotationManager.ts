/**
 * @file lib/security/SecretRotationManager.ts
 * @description Advanced secret rotation management with scheduling and automation
 *
 * This service extends SecretManager with advanced rotation capabilities including
 * automatic scheduling, zero-downtime updates, and rotation audit logging.
 */

import { SecretManager, SecurityError, SecuritySeverity, SecurityEventType } from './types';
import { createSecurityEvent } from './utils/monitoring';
import { generateSecureToken, generateApiKey } from './utils/crypto';

// ─────────────────────────────────────────────────────────────────────────────
// Types for Secret Rotation
// ─────────────────────────────────────────────────────────────────────────────

export interface RotationSchedule {
  secretKey: string;
  intervalDays: number;
  lastRotated: Date;
  nextRotation: Date;
  autoRotate: boolean;
  notificationEmails: string[];
}

export interface RotationResult {
  success: boolean;
  secretKey: string;
  oldValue?: string;
  newValue?: string;
  rotatedAt: Date;
  error?: string;
}

export interface RotationPolicy {
  minRotationIntervalDays: number;
  maxRotationIntervalDays: number;
  requireManualApproval: boolean;
  notifyBeforeDays: number;
  retainOldVersions: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Secret Rotation Manager Implementation
// ─────────────────────────────────────────────────────────────────────────────

export class SecretRotationManager {
  private secretManager: SecretManager;
  private rotationSchedules: Map<string, RotationSchedule> = new Map();
  private rotationHistory: RotationResult[] = [];
  private rotationPolicy: RotationPolicy;
  private rotationTimer: NodeJS.Timeout | null = null;

  constructor(secretManager: SecretManager, rotationPolicy?: Partial<RotationPolicy>) {
    this.secretManager = secretManager;
    this.rotationPolicy = {
      minRotationIntervalDays: 7,
      maxRotationIntervalDays: 365,
      requireManualApproval: false,
      notifyBeforeDays: 7,
      retainOldVersions: 3,
      ...rotationPolicy,
    };
  }

  /**
   * Schedule automatic rotation for a secret
   */
  public scheduleRotation(
    secretKey: string,
    intervalDays: number,
    autoRotate: boolean = true,
    notificationEmails: string[] = []
  ): void {
    // Validate rotation interval
    if (intervalDays < this.rotationPolicy.minRotationIntervalDays) {
      throw new SecurityError(
        `Rotation interval too short. Minimum: ${this.rotationPolicy.minRotationIntervalDays} days`,
        'ROTATION_INTERVAL_TOO_SHORT',
        SecuritySeverity.MEDIUM
      );
    }

    if (intervalDays > this.rotationPolicy.maxRotationIntervalDays) {
      throw new SecurityError(
        `Rotation interval too long. Maximum: ${this.rotationPolicy.maxRotationIntervalDays} days`,
        'ROTATION_INTERVAL_TOO_LONG',
        SecuritySeverity.MEDIUM
      );
    }

    const now = new Date();
    const nextRotation = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

    const schedule: RotationSchedule = {
      secretKey,
      intervalDays,
      lastRotated: now,
      nextRotation,
      autoRotate,
      notificationEmails,
    };

    this.rotationSchedules.set(secretKey, schedule);

    // Log scheduling event
    const securityEvent = createSecurityEvent(
      SecurityEventType.SECRET_ACCESS,
      SecuritySeverity.LOW,
      'SecretRotationManager',
      {
        action: 'schedule_rotation',
        secretKey,
        intervalDays,
        autoRotate,
        nextRotation: nextRotation.toISOString(),
      }
    );

    console.info('Secret rotation scheduled:', securityEvent);
  }

  /**
   * Perform manual secret rotation with zero-downtime
   */
  public async rotateSecretWithZeroDowntime(
    secretKey: string,
    newValue?: string
  ): Promise<RotationResult> {
    const startTime = Date.now();

    try {
      // Get current secret value
      const oldValue = await this.secretManager.getSecret(secretKey);
      if (!oldValue) {
        throw new SecurityError(
          `Secret '${secretKey}' not found`,
          'SECRET_NOT_FOUND',
          SecuritySeverity.HIGH
        );
      }

      // Generate new secret value if not provided
      const generatedNewValue = newValue || this.generateNewSecretValue(secretKey);

      // Validate new secret value
      this.validateNewSecretValue(secretKey, generatedNewValue);

      // Perform zero-downtime rotation
      await this.performZeroDowntimeRotation(secretKey, oldValue, generatedNewValue);

      // Update rotation schedule
      this.updateRotationSchedule(secretKey);

      // Create rotation result
      const result: RotationResult = {
        success: true,
        secretKey,
        oldValue: this.maskSecretValue(oldValue),
        newValue: this.maskSecretValue(generatedNewValue),
        rotatedAt: new Date(),
      };

      // Add to rotation history
      this.rotationHistory.push(result);

      // Log successful rotation
      const securityEvent = createSecurityEvent(
        SecurityEventType.SECRET_ACCESS,
        SecuritySeverity.MEDIUM,
        'SecretRotationManager',
        {
          action: 'rotate_secret_success',
          secretKey,
          duration: Date.now() - startTime,
          rotatedAt: result.rotatedAt.toISOString(),
        }
      );

      console.info('Secret rotated successfully:', securityEvent);

      return result;
    } catch (error) {
      // Create failure result
      const result: RotationResult = {
        success: false,
        secretKey,
        rotatedAt: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      // Add to rotation history
      this.rotationHistory.push(result);

      // Log rotation failure
      const securityEvent = createSecurityEvent(
        SecurityEventType.SECRET_ACCESS,
        SecuritySeverity.HIGH,
        'SecretRotationManager',
        {
          action: 'rotate_secret_failure',
          secretKey,
          error: result.error,
          duration: Date.now() - startTime,
        }
      );

      console.error('Secret rotation failed:', securityEvent);

      throw error;
    }
  }

  /**
   * Start automatic rotation monitoring
   */
  public startAutomaticRotation(checkIntervalMinutes: number = 60): void {
    if (this.rotationTimer) {
      this.stopAutomaticRotation();
    }

    this.rotationTimer = setInterval(
      async () => {
        await this.checkAndPerformScheduledRotations();
      },
      checkIntervalMinutes * 60 * 1000
    );

    console.info(
      `Automatic rotation monitoring started (check interval: ${checkIntervalMinutes} minutes)`
    );
  }

  /**
   * Stop automatic rotation monitoring
   */
  public stopAutomaticRotation(): void {
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer);
      this.rotationTimer = null;
      console.info('Automatic rotation monitoring stopped');
    }
  }

  /**
   * Check for scheduled rotations and perform them
   */
  public async checkAndPerformScheduledRotations(): Promise<void> {
    const now = new Date();
    const rotationsToPerform: string[] = [];

    // Find secrets that need rotation
    for (const [secretKey, schedule] of this.rotationSchedules) {
      if (schedule.autoRotate && now >= schedule.nextRotation) {
        rotationsToPerform.push(secretKey);
      }
    }

    // Perform rotations
    for (const secretKey of rotationsToPerform) {
      try {
        if (this.rotationPolicy.requireManualApproval) {
          await this.requestRotationApproval(secretKey);
        } else {
          await this.rotateSecretWithZeroDowntime(secretKey);
        }
      } catch (error) {
        console.error(`Automatic rotation failed for secret '${secretKey}':`, error);
      }
    }
  }

  /**
   * Get rotation schedule for a secret
   */
  public getRotationSchedule(secretKey: string): RotationSchedule | null {
    return this.rotationSchedules.get(secretKey) || null;
  }

  /**
   * Get all rotation schedules
   */
  public getAllRotationSchedules(): RotationSchedule[] {
    return Array.from(this.rotationSchedules.values());
  }

  /**
   * Get rotation history
   */
  public getRotationHistory(secretKey?: string): RotationResult[] {
    if (secretKey) {
      return this.rotationHistory.filter((result) => result.secretKey === secretKey);
    }
    return [...this.rotationHistory];
  }

  /**
   * Get secrets that need rotation soon
   */
  public getSecretsNeedingRotation(daysAhead: number = 7): RotationSchedule[] {
    const checkDate = new Date();
    checkDate.setDate(checkDate.getDate() + daysAhead);

    return Array.from(this.rotationSchedules.values()).filter(
      (schedule) => schedule.nextRotation <= checkDate
    );
  }

  /**
   * Remove rotation schedule for a secret
   */
  public removeRotationSchedule(secretKey: string): boolean {
    return this.rotationSchedules.delete(secretKey);
  }

  /**
   * Update rotation policy
   */
  public updateRotationPolicy(policy: Partial<RotationPolicy>): void {
    this.rotationPolicy = { ...this.rotationPolicy, ...policy };
  }

  /**
   * Get current rotation policy
   */
  public getRotationPolicy(): RotationPolicy {
    return { ...this.rotationPolicy };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Private Methods
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Generate new secret value based on secret type
   */
  private generateNewSecretValue(secretKey: string): string {
    // Determine secret type and generate appropriate value
    if (secretKey.toLowerCase().includes('api') || secretKey.toLowerCase().includes('key')) {
      return generateApiKey();
    }

    if (secretKey.toLowerCase().includes('token') || secretKey.toLowerCase().includes('jwt')) {
      return generateSecureToken(64);
    }

    // Default to secure token
    return generateSecureToken(32);
  }

  /**
   * Validate new secret value meets security requirements
   */
  private validateNewSecretValue(secretKey: string, newValue: string): void {
    if (!newValue || newValue.length < 16) {
      throw new SecurityError(
        'New secret value too short (minimum 16 characters)',
        'SECRET_VALUE_TOO_SHORT',
        SecuritySeverity.HIGH
      );
    }

    if (newValue.length > 512) {
      throw new SecurityError(
        'New secret value too long (maximum 512 characters)',
        'SECRET_VALUE_TOO_LONG',
        SecuritySeverity.MEDIUM
      );
    }

    // Check for common weak patterns
    const weakPatterns = [
      /^(password|secret|key|token)$/i,
      /^(123|abc|test)/i,
      /(.)\1{5,}/, // Repeated characters
    ];

    for (const pattern of weakPatterns) {
      if (pattern.test(newValue)) {
        throw new SecurityError(
          'New secret value contains weak patterns',
          'SECRET_VALUE_WEAK_PATTERN',
          SecuritySeverity.HIGH
        );
      }
    }
  }

  /**
   * Perform zero-downtime rotation (placeholder implementation)
   */
  private async performZeroDowntimeRotation(
    secretKey: string,
    _oldValue: string,
    _newValue: string
  ): Promise<void> {
    // In a real implementation, this would:
    // 1. Update the secret in the secret store (vault, AWS, etc.)
    // 2. Gradually roll out the new secret to services
    // 3. Monitor for any failures
    // 4. Rollback if necessary
    // 5. Deprecate the old secret after confirmation

    // Simulate rotation process
    await new Promise((resolve) => setTimeout(resolve, 100));

    // For now, we'll use the SecretManager's rotation method
    await this.secretManager.rotateSecret(secretKey);
  }

  /**
   * Update rotation schedule after successful rotation
   */
  private updateRotationSchedule(secretKey: string): void {
    const schedule = this.rotationSchedules.get(secretKey);
    if (schedule) {
      const now = new Date();
      schedule.lastRotated = now;
      schedule.nextRotation = new Date(now.getTime() + schedule.intervalDays * 24 * 60 * 60 * 1000);
      this.rotationSchedules.set(secretKey, schedule);
    }
  }

  /**
   * Request manual approval for rotation (placeholder implementation)
   */
  private async requestRotationApproval(secretKey: string): Promise<void> {
    // In a real implementation, this would:
    // 1. Send notification to administrators
    // 2. Create approval request in system
    // 3. Wait for approval
    // 4. Perform rotation once approved

    console.info(`Manual approval requested for secret rotation: ${secretKey}`);

    // For now, we'll just log the request
    const securityEvent = createSecurityEvent(
      SecurityEventType.SECRET_ACCESS,
      SecuritySeverity.MEDIUM,
      'SecretRotationManager',
      {
        action: 'rotation_approval_requested',
        secretKey,
        timestamp: new Date().toISOString(),
      }
    );

    console.info('Rotation approval requested:', securityEvent);
  }

  /**
   * Mask secret value for logging
   */
  private maskSecretValue(value: string): string {
    if (value.length <= 8) {
      return '***';
    }
    return value.slice(0, 4) + '***' + value.slice(-4);
  }

  /**
   * Clean up old rotation history entries
   */
  public cleanupRotationHistory(retainDays: number = 90): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retainDays);

    this.rotationHistory = this.rotationHistory.filter((result) => result.rotatedAt >= cutoffDate);
  }

  /**
   * Export rotation configuration for backup
   */
  public exportRotationConfiguration(): {
    schedules: RotationSchedule[];
    policy: RotationPolicy;
    exportedAt: Date;
  } {
    return {
      schedules: Array.from(this.rotationSchedules.values()),
      policy: this.rotationPolicy,
      exportedAt: new Date(),
    };
  }

  /**
   * Import rotation configuration from backup
   */
  public importRotationConfiguration(config: {
    schedules: RotationSchedule[];
    policy: RotationPolicy;
  }): void {
    // Clear existing schedules
    this.rotationSchedules.clear();

    // Import schedules
    config.schedules.forEach((schedule) => {
      this.rotationSchedules.set(schedule.secretKey, schedule);
    });

    // Import policy
    this.rotationPolicy = config.policy;

    console.info(`Imported ${config.schedules.length} rotation schedules`);
  }
}
