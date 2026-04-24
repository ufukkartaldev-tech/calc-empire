/**
 * @file lib/security/SecretAuditLogger.ts
 * @description Comprehensive audit logging for secret access and management operations
 *
 * This service provides detailed audit logging for all secret-related operations
 * with privacy-enhanced logging, structured data, and security event correlation.
 */

import { SecurityEventType, SecuritySeverity, Environment } from './types';
import {
  createSecurityEvent,
  createStructuredLog,
  LogContext,
  securityMetricsCollector,
} from './utils/monitoring';
import { maskSensitiveData } from './utils/monitoring';

// ─────────────────────────────────────────────────────────────────────────────
// Audit Event Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SecretAccessEvent {
  id: string;
  timestamp: Date;
  secretKey: string;
  operation: SecretOperation;
  accessor: string;
  sourceIp?: string;
  userAgent?: string;
  sessionId?: string;
  success: boolean;
  errorMessage?: string;
  metadata: Record<string, unknown>;
}

export enum SecretOperation {
  READ = 'read',
  WRITE = 'write',
  ROTATE = 'rotate',
  DELETE = 'delete',
  LIST = 'list',
  VALIDATE = 'validate',
  SCHEDULE_ROTATION = 'schedule_rotation',
  CANCEL_ROTATION = 'cancel_rotation',
}

export interface AuditLogConfig {
  enabledOperations: SecretOperation[];
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  retentionDays: number;
  enableRealTimeAlerts: boolean;
  sensitiveKeyPatterns: RegExp[];
  maxLogEntries: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Secret Audit Logger Implementation
// ─────────────────────────────────────────────────────────────────────────────

export class SecretAuditLogger {
  private auditLog: SecretAccessEvent[] = [];
  private config: AuditLogConfig;
  private environment: Environment;
  private alertThresholds: Map<string, { count: number; windowMs: number }> = new Map();

  constructor(
    config: Partial<AuditLogConfig> = {},
    environment: Environment = Environment.DEVELOPMENT
  ) {
    this.environment = environment;
    this.config = {
      enabledOperations: Object.values(SecretOperation),
      logLevel: environment === Environment.PRODUCTION ? 'warn' : 'info',
      retentionDays: 90,
      enableRealTimeAlerts: environment === Environment.PRODUCTION,
      sensitiveKeyPatterns: [/password/i, /secret/i, /token/i, /key/i, /credential/i],
      maxLogEntries: 10000,
      ...config,
    };

    // Set up alert thresholds
    this.setupAlertThresholds();
  }

  /**
   * Log secret access event with comprehensive audit information
   */
  public logSecretAccess(
    secretKey: string,
    operation: SecretOperation,
    accessor: string,
    context: Partial<LogContext> = {},
    success: boolean = true,
    errorMessage?: string,
    metadata: Record<string, unknown> = {}
  ): void {
    // Check if operation should be logged
    if (!this.config.enabledOperations.includes(operation)) {
      return;
    }

    // Create audit event
    const auditEvent: SecretAccessEvent = {
      id: this.generateAuditId(),
      timestamp: new Date(),
      secretKey: this.maskSecretKey(secretKey),
      operation,
      accessor,
      sourceIp: context.ipAddress,
      userAgent: context.userAgent,
      sessionId: context.sessionId,
      success,
      errorMessage,
      metadata: maskSensitiveData(metadata) as Record<string, unknown>,
    };

    // Add to audit log
    this.addToAuditLog(auditEvent);

    // Create structured log entry
    const structuredLog = createStructuredLog(
      success ? 'info' : 'error',
      `Secret ${operation} ${success ? 'succeeded' : 'failed'}: ${secretKey}`,
      {
        ...context,
        operation,
        secretKey: auditEvent.secretKey, // Use masked version
      },
      {
        auditEventId: auditEvent.id,
        ...metadata,
      }
    );

    // Log based on environment and configuration
    this.writeLog(structuredLog);

    // Create security event for monitoring
    const securityEvent = createSecurityEvent(
      SecurityEventType.SECRET_ACCESS,
      this.determineSeverity(operation, success),
      'SecretAuditLogger',
      {
        operation,
        secretKey: auditEvent.secretKey,
        accessor,
        success,
        errorMessage,
        ...metadata,
      },
      context.userId,
      context.ipAddress,
      context.userAgent
    );

    // Record metrics
    securityMetricsCollector.recordSecurityEvent(SecurityEventType.SECRET_ACCESS);

    // Check for suspicious activity
    this.checkForSuspiciousActivity(auditEvent);

    // Send real-time alerts if enabled
    if (this.config.enableRealTimeAlerts) {
      this.checkAlertThresholds(auditEvent);
    }
  }

  /**
   * Log secret rotation event
   */
  public logSecretRotation(
    secretKey: string,
    rotationType: 'manual' | 'automatic' | 'scheduled',
    success: boolean,
    context: Partial<LogContext> = {},
    metadata: Record<string, unknown> = {}
  ): void {
    this.logSecretAccess(
      secretKey,
      SecretOperation.ROTATE,
      `rotation-${rotationType}`,
      context,
      success,
      undefined,
      {
        rotationType,
        ...metadata,
      }
    );
  }

  /**
   * Log secret validation event
   */
  public logSecretValidation(
    secretKeys: string[],
    validationResult: { isValid: boolean; errors: string[]; warnings: string[] },
    context: Partial<LogContext> = {}
  ): void {
    secretKeys.forEach((secretKey) => {
      this.logSecretAccess(
        secretKey,
        SecretOperation.VALIDATE,
        'validation-service',
        context,
        validationResult.isValid,
        validationResult.errors.join(', '),
        {
          validationErrors: validationResult.errors,
          validationWarnings: validationResult.warnings,
        }
      );
    });
  }

  /**
   * Get audit log entries with optional filtering
   */
  public getAuditLog(filter?: {
    secretKey?: string;
    operation?: SecretOperation;
    accessor?: string;
    startDate?: Date;
    endDate?: Date;
    success?: boolean;
  }): SecretAccessEvent[] {
    let filteredLog = [...this.auditLog];

    if (filter) {
      if (filter.secretKey) {
        filteredLog = filteredLog.filter((event) => event.secretKey.includes(filter.secretKey!));
      }

      if (filter.operation) {
        filteredLog = filteredLog.filter((event) => event.operation === filter.operation);
      }

      if (filter.accessor) {
        filteredLog = filteredLog.filter((event) => event.accessor.includes(filter.accessor!));
      }

      if (filter.startDate) {
        filteredLog = filteredLog.filter((event) => event.timestamp >= filter.startDate!);
      }

      if (filter.endDate) {
        filteredLog = filteredLog.filter((event) => event.timestamp <= filter.endDate!);
      }

      if (filter.success !== undefined) {
        filteredLog = filteredLog.filter((event) => event.success === filter.success);
      }
    }

    return filteredLog;
  }

  /**
   * Get audit statistics
   */
  public getAuditStatistics(): {
    totalEvents: number;
    eventsByOperation: Record<SecretOperation, number>;
    successRate: number;
    topAccessors: Array<{ accessor: string; count: number }>;
    recentFailures: SecretAccessEvent[];
  } {
    const totalEvents = this.auditLog.length;
    const eventsByOperation = {} as Record<SecretOperation, number>;
    const accessorCounts = new Map<string, number>();
    let successfulEvents = 0;

    // Initialize operation counts
    Object.values(SecretOperation).forEach((op) => {
      eventsByOperation[op] = 0;
    });

    // Process events
    this.auditLog.forEach((event) => {
      eventsByOperation[event.operation]++;

      if (event.success) {
        successfulEvents++;
      }

      const count = accessorCounts.get(event.accessor) || 0;
      accessorCounts.set(event.accessor, count + 1);
    });

    // Get top accessors
    const topAccessors = Array.from(accessorCounts.entries())
      .map(([accessor, count]) => ({ accessor, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get recent failures
    const recentFailures = this.auditLog
      .filter((event) => !event.success)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    return {
      totalEvents,
      eventsByOperation,
      successRate: totalEvents > 0 ? successfulEvents / totalEvents : 0,
      topAccessors,
      recentFailures,
    };
  }

  /**
   * Export audit log for compliance reporting
   */
  public exportAuditLog(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      return this.exportAsCSV();
    }

    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        environment: this.environment,
        totalEvents: this.auditLog.length,
        events: this.auditLog,
      },
      null,
      2
    );
  }

  /**
   * Clear audit log (for testing or maintenance)
   */
  public clearAuditLog(): void {
    this.auditLog = [];
  }

  /**
   * Update audit configuration
   */
  public updateConfig(newConfig: Partial<AuditLogConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  public getConfig(): AuditLogConfig {
    return { ...this.config };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Private Methods
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Generate unique audit ID
   */
  private generateAuditId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Mask secret key for logging
   */
  private maskSecretKey(secretKey: string): string {
    // Check if key matches sensitive patterns
    const isSensitive = this.config.sensitiveKeyPatterns.some((pattern) => pattern.test(secretKey));

    if (isSensitive && this.environment === Environment.PRODUCTION) {
      // Heavily mask sensitive keys in production
      return secretKey.length > 4 ? secretKey.slice(0, 2) + '***' + secretKey.slice(-2) : '***';
    }

    // Light masking for non-sensitive keys
    return secretKey.length > 8 ? secretKey.slice(0, 4) + '***' + secretKey.slice(-4) : secretKey;
  }

  /**
   * Add event to audit log with size management
   */
  private addToAuditLog(event: SecretAccessEvent): void {
    this.auditLog.push(event);

    // Manage log size
    if (this.auditLog.length > this.config.maxLogEntries) {
      // Remove oldest entries
      const removeCount = Math.floor(this.config.maxLogEntries * 0.1);
      this.auditLog.splice(0, removeCount);
    }

    // Clean up old entries based on retention policy
    this.cleanupOldEntries();
  }

  /**
   * Clean up old audit entries
   */
  private cleanupOldEntries(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

    this.auditLog = this.auditLog.filter((event) => event.timestamp >= cutoffDate);
  }

  /**
   * Determine severity based on operation and success
   */
  private determineSeverity(operation: SecretOperation, success: boolean): SecuritySeverity {
    if (!success) {
      return SecuritySeverity.HIGH;
    }

    switch (operation) {
      case SecretOperation.DELETE:
      case SecretOperation.ROTATE:
        return SecuritySeverity.MEDIUM;
      case SecretOperation.WRITE:
        return SecuritySeverity.MEDIUM;
      case SecretOperation.READ:
      case SecretOperation.LIST:
      case SecretOperation.VALIDATE:
        return SecuritySeverity.LOW;
      default:
        return SecuritySeverity.LOW;
    }
  }

  /**
   * Write log entry based on configuration
   */
  private writeLog(logEntry: Record<string, unknown>): void {
    // In a real implementation, this would send to:
    // - Structured logging service (e.g., Winston, Bunyan)
    // - External log aggregation (e.g., ELK stack, Splunk)
    // - Cloud logging service (e.g., CloudWatch, Stackdriver)

    switch (this.config.logLevel) {
      case 'debug':
        console.debug('Secret Audit:', logEntry);
        break;
      case 'info':
        console.info('Secret Audit:', logEntry);
        break;
      case 'warn':
        console.warn('Secret Audit:', logEntry);
        break;
      case 'error':
        console.error('Secret Audit:', logEntry);
        break;
    }
  }

  /**
   * Check for suspicious activity patterns
   */
  private checkForSuspiciousActivity(event: SecretAccessEvent): void {
    // Check for rapid successive failures
    const recentFailures = this.auditLog.filter(
      (e) =>
        !e.success && e.accessor === event.accessor && Date.now() - e.timestamp.getTime() < 300000 // 5 minutes
    );

    if (recentFailures.length >= 5) {
      this.createSecurityAlert(
        'Suspicious Activity Detected',
        `Multiple failed secret access attempts by ${event.accessor}`,
        SecuritySeverity.HIGH,
        { accessor: event.accessor, failureCount: recentFailures.length }
      );
    }

    // Check for unusual access patterns
    if (event.sourceIp && this.isUnusualAccessPattern(event)) {
      this.createSecurityAlert(
        'Unusual Access Pattern',
        `Secret access from unusual IP: ${event.sourceIp}`,
        SecuritySeverity.MEDIUM,
        { secretKey: event.secretKey, sourceIp: event.sourceIp }
      );
    }
  }

  /**
   * Check if access pattern is unusual
   */
  private isUnusualAccessPattern(_event: SecretAccessEvent): boolean {
    // Simple heuristic: check if IP has accessed secrets before
    const previousAccess = this.auditLog.some(
      (e) => e.sourceIp === _event.sourceIp && e.id !== _event.id
    );

    return !previousAccess;
  }

  /**
   * Set up alert thresholds
   */
  private setupAlertThresholds(): void {
    this.alertThresholds.set('failed_access', { count: 10, windowMs: 300000 }); // 10 failures in 5 minutes
    this.alertThresholds.set('rotation_failures', { count: 3, windowMs: 3600000 }); // 3 rotation failures in 1 hour
    this.alertThresholds.set('unusual_volume', { count: 100, windowMs: 600000 }); // 100 accesses in 10 minutes
  }

  /**
   * Check alert thresholds
   */
  private checkAlertThresholds(event: SecretAccessEvent): void {
    const now = Date.now();

    this.alertThresholds.forEach((threshold, alertType) => {
      const recentEvents = this.auditLog.filter(
        (e) => now - e.timestamp.getTime() < threshold.windowMs
      );

      let triggerAlert = false;
      let alertMessage = '';

      switch (alertType) {
        case 'failed_access':
          const failures = recentEvents.filter((e) => !e.success);
          if (failures.length >= threshold.count) {
            triggerAlert = true;
            alertMessage = `High number of failed secret access attempts: ${failures.length}`;
          }
          break;

        case 'rotation_failures':
          const rotationFailures = recentEvents.filter(
            (e) => e.operation === SecretOperation.ROTATE && !e.success
          );
          if (rotationFailures.length >= threshold.count) {
            triggerAlert = true;
            alertMessage = `Multiple secret rotation failures: ${rotationFailures.length}`;
          }
          break;

        case 'unusual_volume':
          if (recentEvents.length >= threshold.count) {
            triggerAlert = true;
            alertMessage = `Unusually high volume of secret access: ${recentEvents.length}`;
          }
          break;
      }

      if (triggerAlert) {
        this.createSecurityAlert(`Alert: ${alertType}`, alertMessage, SecuritySeverity.HIGH, {
          alertType,
          eventCount: recentEvents.length,
          threshold,
        });
      }
    });
  }

  /**
   * Create security alert
   */
  private createSecurityAlert(
    title: string,
    message: string,
    severity: SecuritySeverity,
    metadata: Record<string, unknown>
  ): void {
    const alert = {
      id: this.generateAuditId(),
      timestamp: new Date(),
      title,
      message,
      severity,
      source: 'SecretAuditLogger',
      metadata,
    };

    // In a real implementation, this would:
    // - Send to alerting system (PagerDuty, Slack, etc.)
    // - Create incident ticket
    // - Notify security team

    console.warn('Security Alert:', alert);
  }

  /**
   * Export audit log as CSV
   */
  private exportAsCSV(): string {
    const headers = [
      'ID',
      'Timestamp',
      'Secret Key',
      'Operation',
      'Accessor',
      'Source IP',
      'Success',
      'Error Message',
    ];

    const rows = this.auditLog.map((event) => [
      event.id,
      event.timestamp.toISOString(),
      event.secretKey,
      event.operation,
      event.accessor,
      event.sourceIp || '',
      event.success.toString(),
      event.errorMessage || '',
    ]);

    return [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
  }
}
