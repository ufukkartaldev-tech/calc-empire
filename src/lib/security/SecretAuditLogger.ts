/**
 * @file lib/security/SecretAuditLogger.ts
 * @description Simplified audit logging for secret access and management operations
 */

import { SecuritySeverity, Environment } from './types';

export enum SecretOperation {
  READ = 'read',
  WRITE = 'write',
  ROTATE = 'rotate',
  DELETE = 'delete',
  VALIDATE = 'validate',
}

export interface SecretAccessEvent {
  timestamp: Date;
  secretKey: string;
  operation: SecretOperation;
  accessor: string;
  success: boolean;
  errorMessage?: string;
}

export class SecretAuditLogger {
  private auditLog: SecretAccessEvent[] = [];
  private environment: Environment;

  constructor(environment: Environment = Environment.DEVELOPMENT) {
    this.environment = environment;
  }

  /**
   * Log secret access event
   */
  public logSecretAccess(
    secretKey: string,
    operation: SecretOperation,
    accessor: string,
    success: boolean = true,
    errorMessage?: string
  ): void {
    const auditEvent: SecretAccessEvent = {
      timestamp: new Date(),
      secretKey: this.maskSecretKey(secretKey),
      operation,
      accessor,
      success,
      errorMessage,
    };

    this.auditLog.push(auditEvent);

    // Keep only last 1000 entries
    if (this.auditLog.length > 1000) {
      this.auditLog.shift();
    }

    // Log to console for observability
    const level = success ? 'info' : 'error';
    const message = `[SecretAudit] ${operation.toUpperCase()} ${success ? 'SUCCESS' : 'FAILED'} - Key: ${auditEvent.secretKey}, Accessor: ${accessor}`;

    if (level === 'error' || this.environment !== Environment.PRODUCTION) {
      console[level](message, errorMessage || '');
    }
  }

  private maskSecretKey(secretKey: string): string {
    if (this.environment === Environment.PRODUCTION) {
      return secretKey.length > 4 ? secretKey.slice(0, 2) + '***' + secretKey.slice(-2) : '***';
    }
    return secretKey;
  }

  public getAuditLog(): SecretAccessEvent[] {
    return [...this.auditLog];
  }

  public clearAuditLog(): void {
    this.auditLog = [];
  }
}
