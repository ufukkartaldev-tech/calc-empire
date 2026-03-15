/**
 * @file i18n/config.ts
 * @description Shared i18n configuration to avoid circular dependencies
 */

import type { LocaleCode } from '@/types';

export const locales: LocaleCode[] = [
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
];

export const defaultLocale: LocaleCode = 'en';
