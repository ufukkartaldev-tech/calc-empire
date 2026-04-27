/**
 * @file lib/security/utils/monitoring.ts
 * @description Monitoring and logging utilities for security services
 */

import { SecurityEvent, SecurityEventType, SecuritySeverity } from '../types';
import { maskEmail, maskIPAddress, maskGenericString } from './crypto';

// ─────────────────────────────────────────────────────────────────────────────
// Data Masking for Privacy
// ─────────────────────────────────────────────────────────────────────────────

export function maskSensitiveData(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    return maskSensitiveString(data);
  }

  if (Array.isArray(data)) {
    return data.map((item) => maskSensitiveData(item));
  }

  if (typeof data === 'object') {
    const masked: Record<string, unknown> = {};

    Object.entries(data as Record<string, unknown>).forEach(([key, value]) => {
      const lowerKey = key.toLowerCase();

      // Mask sensitive fields
      if (isSensitiveField(lowerKey)) {
        masked[key] = maskFieldValue(lowerKey, value);
      } else {
        masked[key] = maskSensitiveData(value);
      }
    });

    return masked;
  }

  return data;
}

function isSensitiveField(fieldName: string): boolean {
  const sensitiveFields = [
    'password',
    'secret',
    'token',
    'key',
    'email',
    'phone',
    'ssn',
    'credit',
    'card',
    'ip',
    'address',
    'authorization',
    'cookie',
    'session',
  ];

  return sensitiveFields.some((field) => fieldName.includes(field));
}

function maskFieldValue(fieldName: string, value: unknown): string {
  if (typeof value !== 'string') {
    return '***';
  }

  if (fieldName.includes('email')) {
    return maskEmail(value);
  }

  if (fieldName.includes('ip')) {
    return maskIPAddress(value);
  }

  if (
    fieldName.includes('password') ||
    fieldName.includes('secret') ||
    fieldName.includes('token')
  ) {
    return '***';
  }

  return maskGenericString(value);
}

function maskSensitiveString(str: string): string {
  // Check if string looks like an email
  if (str.includes('@') && str.includes('.')) {
    return maskEmail(str);
  }

  // Check if string looks like an IP address
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(str)) {
    return maskIPAddress(str);
  }

  // Check if string looks like a JWT token
  if (str.split('.').length === 3) {
    return 'jwt.***.***.***';
  }

  // Check if string looks like a UUID
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str)) {
    return `${str.slice(0, 8)}-****-****-****-************`;
  }

  return str;
}

// ─────────────────────────────────────────────────────────────────────────────
// Security Event Creation
// ─────────────────────────────────────────────────────────────────────────────

export function createSecurityEvent(
  type: SecurityEventType,
  severity: SecuritySeverity,
  source: string,
  details: Record<string, unknown>,
  userId?: string,
  ipAddress?: string,
  userAgent?: string
): SecurityEvent {
  return {
    id: generateEventId(),
    timestamp: new Date(),
    type,
    severity,
    source,
    details: maskSensitiveData(details) as Record<string, unknown>,
    userId,
    ipAddress: ipAddress ? maskIPAddress(ipAddress) : undefined,
    userAgent: userAgent ? maskUserAgent(userAgent) : undefined,
  };
}

function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function maskUserAgent(userAgent: string): string {
  // Keep browser and version info, mask other details
  const browserMatch = userAgent.match(/(Chrome|Firefox|Safari|Edge)\/[\d.]+/);
  if (browserMatch) {
    return browserMatch[0] + ' ***';
  }

  return 'Unknown Browser ***';
}

// ─────────────────────────────────────────────────────────────────────────────
// Structured Logging
// ─────────────────────────────────────────────────────────────────────────────

export interface LogContext {
  requestId?: string;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  operation?: string;
  secretKey?: string;
}

export function createStructuredLog(
  level: 'debug' | 'info' | 'warn' | 'error',
  message: string,
  context: LogContext = {},
  metadata: Record<string, unknown> = {}
): Record<string, unknown> {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    context: maskSensitiveData(context),
    metadata: maskSensitiveData(metadata),
    service: 'security',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Performance Monitoring
// ─────────────────────────────────────────────────────────────────────────────

export class PerformanceMonitor {
  private startTime: number;
  private checkpoints: Map<string, number> = new Map();

  constructor() {
    this.startTime = performance.now();
  }

  checkpoint(name: string): void {
    this.checkpoints.set(name, performance.now());
  }

  getDuration(checkpointName?: string): number {
    const endTime = checkpointName
      ? this.checkpoints.get(checkpointName) || performance.now()
      : performance.now();

    return endTime - this.startTime;
  }

  getCheckpointDuration(checkpointName: string): number | null {
    const checkpointTime = this.checkpoints.get(checkpointName);
    return checkpointTime ? checkpointTime - this.startTime : null;
  }

  getAllDurations(): Record<string, number> {
    const durations: Record<string, number> = {
      total: this.getDuration(),
    };

    this.checkpoints.forEach((time, name) => {
      durations[name] = time - this.startTime;
    });

    return durations;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Security Metrics Collection
// ─────────────────────────────────────────────────────────────────────────────

export interface SecurityMetrics {
  authFailures: number;
  rateLimitViolations: number;
  cspViolations: number;
  inputValidationFailures: number;
  unauthorizedAccess: number;
  totalSecurityEvents: number;
  averageResponseTime: number;
  activeIncidents: number;
}

export class SecurityMetricsCollector {
  private metrics: SecurityMetrics = {
    authFailures: 0,
    rateLimitViolations: 0,
    cspViolations: 0,
    inputValidationFailures: 0,
    unauthorizedAccess: 0,
    totalSecurityEvents: 0,
    averageResponseTime: 0,
    activeIncidents: 0,
  };

  private responseTimes: number[] = [];

  recordSecurityEvent(type: SecurityEventType): void {
    this.metrics.totalSecurityEvents++;

    switch (type) {
      case SecurityEventType.AUTH_FAILURE:
        this.metrics.authFailures++;
        break;
      case SecurityEventType.RATE_LIMIT_EXCEEDED:
        this.metrics.rateLimitViolations++;
        break;
      case SecurityEventType.CSP_VIOLATION:
        this.metrics.cspViolations++;
        break;
      case SecurityEventType.INVALID_INPUT:
        this.metrics.inputValidationFailures++;
        break;
      case SecurityEventType.UNAUTHORIZED_ACCESS:
        this.metrics.unauthorizedAccess++;
        break;
    }
  }

  recordResponseTime(duration: number): void {
    this.responseTimes.push(duration);

    // Keep only last 1000 response times for average calculation
    if (this.responseTimes.length > 1000) {
      this.responseTimes.shift();
    }

    this.metrics.averageResponseTime =
      this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length;
  }

  setActiveIncidents(count: number): void {
    this.metrics.activeIncidents = count;
  }

  getMetrics(): SecurityMetrics {
    return { ...this.metrics };
  }

  reset(): void {
    this.metrics = {
      authFailures: 0,
      rateLimitViolations: 0,
      cspViolations: 0,
      inputValidationFailures: 0,
      unauthorizedAccess: 0,
      totalSecurityEvents: 0,
      averageResponseTime: 0,
      activeIncidents: 0,
    };
    this.responseTimes = [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Alert Generation
// ─────────────────────────────────────────────────────────────────────────────

export interface SecurityAlert {
  id: string;
  timestamp: Date;
  severity: SecuritySeverity;
  title: string;
  description: string;
  source: string;
  metadata: Record<string, unknown>;
  acknowledged: boolean;
}

export function createSecurityAlert(
  severity: SecuritySeverity,
  title: string,
  description: string,
  source: string,
  metadata: Record<string, unknown> = {}
): SecurityAlert {
  return {
    id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    severity,
    title,
    description,
    source,
    metadata: maskSensitiveData(metadata) as Record<string, unknown>,
    acknowledged: false,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Incident Correlation
// ─────────────────────────────────────────────────────────────────────────────

export function correlateSecurityEvents(
  events: SecurityEvent[],
  timeWindowMs: number = 300000 // 5 minutes
): SecurityEvent[][] {
  const correlatedGroups: SecurityEvent[][] = [];
  const processed = new Set<string>();

  events.forEach((event) => {
    if (processed.has(event.id)) return;

    const relatedEvents = events.filter((otherEvent) => {
      if (processed.has(otherEvent.id) || otherEvent.id === event.id) {
        return false;
      }

      // Check if events are within time window
      const timeDiff = Math.abs(event.timestamp.getTime() - otherEvent.timestamp.getTime());
      if (timeDiff > timeWindowMs) return false;

      // Check if events are related (same IP, user, or type)
      return (
        event.ipAddress === otherEvent.ipAddress ||
        event.userId === otherEvent.userId ||
        event.type === otherEvent.type
      );
    });

    if (relatedEvents.length > 0) {
      const group = [event, ...relatedEvents];
      correlatedGroups.push(group);

      // Mark all events in group as processed
      group.forEach((e) => processed.add(e.id));
    }
  });

  return correlatedGroups;
}

// ─────────────────────────────────────────────────────────────────────────────
// Export singleton instances
// ─────────────────────────────────────────────────────────────────────────────

export const securityMetricsCollector = new SecurityMetricsCollector();
