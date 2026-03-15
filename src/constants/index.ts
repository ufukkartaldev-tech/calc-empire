/**
 * @file constants/index.ts
 * @description Central constants for CalcEmpire
 */

import type { CategoryKey, LocaleCode } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Category Configuration
// ─────────────────────────────────────────────────────────────────────────────

export const CATEGORY_ORDER: readonly CategoryKey[] = [
  'electrical',
  'software',
  'finance',
  'civil',
  'mechanical',
  'chemistry',
  'fluid',
  'statistics',
  'mathematics',
  'converters',
] as const;

export const CATEGORY_ICONS: Record<CategoryKey, string> = {
  electrical: '⚡',
  software: '💻',
  finance: '💰',
  civil: '🏗️',
  mechanical: '⚙️',
  chemistry: '☢️',
  fluid: '🌊',
  statistics: '📊',
  mathematics: '🧮',
  converters: '🔄',
};

// ─────────────────────────────────────────────────────────────────────────────
// Locale Configuration
// ─────────────────────────────────────────────────────────────────────────────

export const SUPPORTED_LOCALES: readonly LocaleCode[] = [
  'en',
  'tr',
  'ru',
  'hi',
  'ja',
  'es',
  'fr',
  'de',
  'it',
  'pt',
  'nl',
  'pl',
  'zh',
  'ar',
  'ko',
  'id',
] as const;

export const RTL_LOCALES = new Set<LocaleCode>(['ar']);

export const DEFAULT_LOCALE: LocaleCode = 'en';

// ─────────────────────────────────────────────────────────────────────────────
// Search Configuration
// ─────────────────────────────────────────────────────────────────────────────

export const FUSE_OPTIONS = {
  keys: ['translatedTitle', 'translatedDesc', 'translatedCat'] as const,
  threshold: 0.35,
  distance: 100,
};

// ─────────────────────────────────────────────────────────────────────────────
// Unit Multipliers
// ─────────────────────────────────────────────────────────────────────────────

export const VOLTAGE_UNITS = [
  { label: 'V', symbol: '' },
  { label: 'mV', symbol: 'm' },
  { label: 'kV', symbol: 'k' },
] as const;

export const CURRENT_UNITS = [
  { label: 'A', symbol: '' },
  { label: 'mA', symbol: 'm' },
  { label: 'μA', symbol: 'u' },
] as const;

export const RESISTANCE_UNITS = [
  { label: 'Ω', symbol: '' },
  { label: 'kΩ', symbol: 'k' },
  { label: 'MΩ', symbol: 'M' },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Application Configuration
// ─────────────────────────────────────────────────────────────────────────────

export const APP_NAME = 'CalcEmpire';
export const APP_DESCRIPTION =
  'Professional engineering calculators — precise, fast, multilingual.';
export const CONTACT_EMAIL = 'contact@calcempire.com';
export const TWITTER_HANDLE = '@calcempire';

// ─────────────────────────────────────────────────────────────────────────────
// Animation Configuration
// ─────────────────────────────────────────────────────────────────────────────

export const SCROLL_DELAY = 100;
export const ANIMATION_DURATION = 300;

// ─────────────────────────────────────────────────────────────────────────────
// Validation Configuration
// ─────────────────────────────────────────────────────────────────────────────

export const ERROR_TOLERANCE = 0.0001;
export const MAX_DECIMAL_PLACES = 6;
export const SCIENTIFIC_NOTATION_THRESHOLD = {
  MIN: 0.0001,
  MAX: 1000000,
} as const;
