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

export const RTL_LOCALES = new Set<string>(['ar']);

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

export const PRESSURE_UNITS = [
  { label: 'Pa', symbol: '' },
  { label: 'kPa', symbol: 'k' },
  { label: 'MPa', symbol: 'M' },
  { label: 'bar', symbol: 'bar' },
] as const;

export const FORCE_UNITS = [
  { label: 'N', symbol: '' },
  { label: 'kN', symbol: 'k' },
  { label: 'MN', symbol: 'M' },
] as const;

export const AREA_UNITS = [
  { label: 'm²', symbol: '' },
  { label: 'mm²', symbol: 'mm2' },
  { label: 'cm²', symbol: 'cm2' },
] as const;

export const LENGTH_UNITS = [
  { label: 'm', symbol: '' },
  { label: 'mm', symbol: 'm' },
  { label: 'cm', symbol: 'c' },
  { label: 'km', symbol: 'k' },
] as const;

export const DENSITY_UNITS = [
  { label: 'kg/m³', symbol: '' },
  { label: 'g/cm³', symbol: 'gcm3' },
] as const;

export const ACCELERATION_UNITS = [{ label: 'm/s²', symbol: '' }] as const;

export const VELOCITY_UNITS = [
  { label: 'm/s', symbol: '' },
  { label: 'km/h', symbol: 'kmh' },
] as const;

export const TIME_UNITS = [
  { label: 's', symbol: '' },
  { label: 'ms', symbol: 'm' },
  { label: 'μs', symbol: 'u' },
  { label: 'min', symbol: 'min' },
  { label: 'h', symbol: 'h' },
] as const;

export const CAPACITANCE_UNITS = [
  { label: 'F', symbol: '' },
  { label: 'mF', symbol: 'm' },
  { label: 'μF', symbol: 'u' },
  { label: 'nF', symbol: 'n' },
  { label: 'pF', symbol: 'p' },
] as const;

export const ANGLE_UNITS = [
  { label: '°', symbol: '' },
  { label: 'rad', symbol: 'rad' },
] as const;

export const MASS_UNITS = [
  { label: 'kg', symbol: '' },
  { label: 'g', symbol: 'g' },
  { label: 'mg', symbol: 'mg' },
  { label: 't', symbol: 't' },
] as const;

export const SPRING_K_UNITS = [
  { label: 'N/m', symbol: '' },
  { label: 'kN/m', symbol: 'k' },
] as const;

export const VOLUME_UNITS = [
  { label: 'L', symbol: '' },
  { label: 'mL', symbol: 'm' },
  { label: 'm³', symbol: 'm3' },
] as const;

export const MOLARITY_UNITS = [{ label: 'M (mol/L)', symbol: '' }] as const;

export const MOLE_UNITS = [
  { label: 'mol', symbol: '' },
  { label: 'mmol', symbol: 'm' },
] as const;

export const NO_UNIT = [{ label: '', symbol: '' }] as const;

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
