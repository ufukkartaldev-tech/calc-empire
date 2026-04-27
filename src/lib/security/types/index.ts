/**
 * @file types/index.ts
 * @description Security types for CSP and other security features
 */

export interface CSPPolicy {
  defaultSrc: string[];
  scriptSrc?: string[];
  styleSrc?: string[];
  imgSrc?: string[];
  connectSrc?: string[];
  fontSrc?: string[];
  reportUri?: string;
  reportOnly?: boolean;
}

export interface RateLimitConfig {
  windowSizeMs: number;
  maxRequests: number;
  burstLimit: number;
  penaltyMultiplier: number;
}

export interface PenaltyEscalation {
  violations: number;
  penaltyMultiplier: number;
  blockDurationMs: number;
}

export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

export enum SecurityEventType {
  AUTH_FAILURE = 'AUTH_FAILURE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  CSP_VIOLATION = 'CSP_VIOLATION',
  INVALID_INPUT = 'INVALID_INPUT',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  API_ERROR = 'API_ERROR',
  SECRET_ACCESS = 'SECRET_ACCESS',
}

export interface SecretConfig {
  provider: 'env' | 'vault' | 'aws-secrets';
  rotationEnabled: boolean;
  rotationIntervalDays: number;
  requiredSecrets: string[];
}

export interface CSPConfig {
  enabled: boolean;
  reportOnly: boolean;
  reportUri: string;
  policies: {
    default: CSPPolicy;
  };
}

export interface CORSConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  maxAge: number;
  credentials: boolean;
}

export interface MonitoringConfig {
  enabledEvents: SecurityEventType[];
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  retentionDays: number;
  alertingEnabled: boolean;
  privacyMode: boolean;
  sessionReplaySampleRate: number;
}

export interface ValidationConfig {
  maxRequestSize: number;
  maxParameterCount: number;
  maxFileSize: number;
  allowedFileTypes: string[];
  requestTimeout: number;
}

export interface SecurityConfig {
  environment: Environment;
  secrets: SecretConfig;
  rateLimiting: RateLimitConfig;
  csp: CSPConfig;
  cors: CORSConfig;
  monitoring: MonitoringConfig;
  validation: ValidationConfig;
}

export interface SecurityEvent {
  id: string;
  timestamp: Date;
  type: SecurityEventType;
  severity: SecuritySeverity;
  source: string;
  details: Record<string, unknown>;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export enum SecuritySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export type SecurityErrorCode =
  | 'CSP_MANAGER_NOT_INITIALIZED'
  | 'CSP_VIOLATION'
  | 'RATE_LIMIT_EXCEEDED'
  | 'AUTH_FAILURE'
  | 'INVALID_INPUT'
  | 'UNAUTHORIZED_ACCESS'
  | 'CONFIG_ERROR'
  | 'SECRET_MANAGER_NOT_INITIALIZED'
  | 'SECRET_VALIDATION_FAILED'
  | 'SECRET_STORE_NOT_LOADED'
  | 'SECRET_ROTATION_DISABLED'
  | 'UNSUPPORTED_SECRET_PROVIDER'
  | 'VAULT_NOT_IMPLEMENTED'
  | 'AWS_SECRETS_NOT_IMPLEMENTED'
  | 'ROTATION_INTERVAL_TOO_SHORT'
  | 'ROTATION_INTERVAL_TOO_LONG'
  | 'SECRET_NOT_FOUND'
  | 'SECRET_VALUE_TOO_SHORT'
  | 'SECRET_VALUE_TOO_LONG'
  | 'SECRET_VALUE_WEAK_PATTERN';

export class SecurityError extends Error {
  public code: SecurityErrorCode;
  public severity: SecuritySeverity;

  constructor(message: string, code: SecurityErrorCode, severity: SecuritySeverity) {
    super(message);
    this.name = 'SecurityError';
    this.code = code;
    this.severity = severity;
  }
}

export interface CSPContext {
  endpoint: string;
  nonce?: string;
  hashes?: string[];
}

export interface CSPViolation {
  documentUri: string;
  violatedDirective: string;
  blockedUri: string;
  sourceFile?: string;
  lineNumber?: number;
  columnNumber?: number;
  timestamp: Date;
}

export interface CSPTestResult {
  isValid: boolean;
  violations: CSPViolation[];
  recommendations: string[];
}

export interface CSPManager {
  generateNonce(): string;
  calculateHash(content: string): string;
  buildCSPHeader(context: CSPContext): string;
  reportViolation(violation: CSPViolation): void;
  testCSPPolicy(policy: CSPPolicy): Promise<CSPTestResult>;
  getViolationStatistics(): {
    totalViolations: number;
    violationsByDirective: Record<string, number>;
    violationsBySource: Record<string, number>;
    recentViolations: CSPViolation[];
  };
  clearViolationLog(): void;
}

export interface SecretStore {
  apiKeys: Record<string, string>;
  databaseUrls: Record<string, string>;
  authTokens: Record<string, string>;
  encryptionKeys: Record<string, string>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ValidationSchema {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  items?: ValidationSchema;
  properties?: Record<string, ValidationSchema>;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: SecuritySeverity;
}

export interface SecretManager {
  loadSecrets(environment: Environment): Promise<SecretStore>;
  getSecret(key: string): Promise<string | null>;
  rotateSecret(key: string): Promise<void>;
  validateSecrets(): Promise<ValidationResult>;
}
