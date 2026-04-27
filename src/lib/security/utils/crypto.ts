/**
 * @file lib/security/utils/crypto.ts
 * @description Cryptographic utilities for security services
 */

import { createHash, randomBytes, createHmac, timingSafeEqual } from 'crypto';

// ─────────────────────────────────────────────────────────────────────────────
// Hash Generation
// ─────────────────────────────────────────────────────────────────────────────

export function generateSHA256Hash(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('base64');
}

export function generateSHA1Hash(content: string): string {
  return createHash('sha1').update(content, 'utf8').digest('hex');
}

export function generateMD5Hash(content: string): string {
  return createHash('md5').update(content, 'utf8').digest('hex');
}

// ─────────────────────────────────────────────────────────────────────────────
// Nonce Generation
// ─────────────────────────────────────────────────────────────────────────────

export function generateNonce(length: number = 16): string {
  return randomBytes(length).toString('base64url');
}

export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

export function generateCSPNonce(): string {
  return generateNonce(16);
}

// ─────────────────────────────────────────────────────────────────────────────
// HMAC Operations
// ─────────────────────────────────────────────────────────────────────────────

export function generateHMAC(data: string, secret: string, algorithm: string = 'sha256'): string {
  return createHmac(algorithm, secret).update(data, 'utf8').digest('hex');
}

export function verifyHMAC(
  data: string,
  signature: string,
  secret: string,
  algorithm: string = 'sha256'
): boolean {
  const expectedSignature = generateHMAC(data, secret, algorithm);

  // Use timing-safe comparison to prevent timing attacks
  try {
    return timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'));
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Password Hashing (using Node.js built-in crypto)
// ─────────────────────────────────────────────────────────────────────────────

export function generateSalt(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

export function hashPassword(password: string, salt: string): string {
  return createHash('sha256')
    .update(password + salt)
    .digest('hex');
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const expectedHash = hashPassword(password, salt);

  try {
    return timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(expectedHash, 'hex'));
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Rate Limiting Key Generation
// ─────────────────────────────────────────────────────────────────────────────

export function generateRateLimitKey(
  identifier: string,
  endpoint: string,
  windowStart: Date
): string {
  const windowKey = Math.floor(windowStart.getTime() / 1000);
  return `rate_limit:${identifier}:${endpoint}:${windowKey}`;
}

export function generateSessionKey(userId: string, sessionId: string): string {
  return `session:${userId}:${sessionId}`;
}

export function generateSecretKey(keyName: string, environment: string): string {
  return `secret:${environment}:${keyName}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Content Security Policy Hash Generation
// ─────────────────────────────────────────────────────────────────────────────

export function generateCSPHash(
  content: string,
  algorithm: 'sha256' | 'sha384' | 'sha512' = 'sha256'
): string {
  return createHash(algorithm).update(content, 'utf8').digest('base64');
}

export function generateStyleHash(cssContent: string): string {
  return generateCSPHash(cssContent, 'sha256');
}

export function generateScriptHash(jsContent: string): string {
  return generateCSPHash(jsContent, 'sha256');
}

// ─────────────────────────────────────────────────────────────────────────────
// JWT Token Utilities (Basic implementation)
// ─────────────────────────────────────────────────────────────────────────────

export function base64UrlEncode(data: string): string {
  return Buffer.from(data, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export function base64UrlDecode(data: string): string {
  // Add padding if needed
  const padded = data + '='.repeat((4 - (data.length % 4)) % 4);

  return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
}

export function createJWTSignature(header: string, payload: string, secret: string): string {
  const data = `${header}.${payload}`;
  return base64UrlEncode(generateHMAC(data, secret, 'sha256'));
}

export function verifyJWTSignature(
  header: string,
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = createJWTSignature(header, payload, secret);

  try {
    return timingSafeEqual(
      Buffer.from(signature, 'base64'),
      Buffer.from(expectedSignature, 'base64')
    );
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Data Masking for Privacy
// ─────────────────────────────────────────────────────────────────────────────

export function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (!domain) return '***';

  const maskedLocal =
    localPart.length > 2
      ? localPart[0] + '*'.repeat(localPart.length - 2) + localPart[localPart.length - 1]
      : '***';

  return `${maskedLocal}@${domain}`;
}

export function maskIPAddress(ip: string): string {
  const parts = ip.split('.');
  if (parts.length !== 4) return '***';

  return `${parts[0]}.${parts[1]}.***.***.`;
}

export function maskCreditCard(cardNumber: string): string {
  if (cardNumber.length < 4) return '***';

  return '*'.repeat(cardNumber.length - 4) + cardNumber.slice(-4);
}

export function maskGenericString(str: string, visibleChars: number = 2): string {
  if (str.length <= visibleChars * 2) return '***';

  const start = str.slice(0, visibleChars);
  const end = str.slice(-visibleChars);

  return `${start}${'*'.repeat(str.length - visibleChars * 2)}${end}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Secure Random Generation
// ─────────────────────────────────────────────────────────────────────────────

export function generateSecureId(): string {
  return randomBytes(16).toString('hex');
}

export function generateApiKey(): string {
  return randomBytes(32).toString('base64url');
}

export function generateRandomSecret(): string {
  return randomBytes(64).toString('hex');
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation Utilities
// ─────────────────────────────────────────────────────────────────────────────

export function isValidHash(
  hash: string,
  algorithm: 'md5' | 'sha1' | 'sha256' | 'sha512'
): boolean {
  const lengths = {
    md5: 32,
    sha1: 40,
    sha256: 64,
    sha512: 128,
  };

  const expectedLength = lengths[algorithm];
  return hash.length === expectedLength && /^[a-f0-9]+$/i.test(hash);
}

export function isValidBase64(str: string): boolean {
  try {
    return Buffer.from(str, 'base64').toString('base64') === str;
  } catch {
    return false;
  }
}

export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
