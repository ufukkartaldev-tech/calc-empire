/**
 * @file routing.test.ts
 * @description Integration tests for i18n routing
 *
 * Tests: next-intl routing configuration, locale detection, navigation
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { locales, defaultLocale } from '@/i18n/config';

describe('i18n Routing', () => {
  describe('Routing Configuration', () => {
    it('should have valid routing.ts configuration', () => {
      const routingPath = path.join(process.cwd(), 'src', 'i18n', 'routing.ts');
      const content = fs.readFileSync(routingPath, 'utf-8');

      expect(content).toContain('defineRouting');
      expect(content).toContain('locales');
      expect(content).toContain('defaultLocale');
    });

    it('should have valid config.ts with centralized configuration', () => {
      const configPath = path.join(process.cwd(), 'src', 'i18n', 'config.ts');
      const content = fs.readFileSync(configPath, 'utf-8');

      expect(content).toContain('export const locales');
      expect(content).toContain('export const defaultLocale');
    });

    it('should have defaultLocale set to en', () => {
      expect(defaultLocale).toBe('en');
    });

    it('should have all expected locales', () => {
      const expectedLocales = [
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

      expectedLocales.forEach((locale) => {
        expect(locales).toContain(locale);
      });
    });

    it('should have correct number of locales', () => {
      expect(locales).toHaveLength(16);
    });
  });

  describe('Locale Files', () => {
    it('should have message file for each locale', () => {
      locales.forEach((locale) => {
        const messagePath = path.join(process.cwd(), 'src', 'messages', `${locale}.json`);
        expect(fs.existsSync(messagePath)).toBe(true);
      });
    });

    it('should have valid JSON in all message files', () => {
      locales.forEach((locale) => {
        const messagePath = path.join(process.cwd(), 'src', 'messages', `${locale}.json`);
        expect(fs.existsSync(messagePath)).toBe(true);

        const content = fs.readFileSync(messagePath, 'utf-8');
        expect(() => JSON.parse(content)).not.toThrow();
      });
    });
  });

  describe('Middleware Configuration', () => {
    it('should have valid middleware.ts', () => {
      const middlewarePath = path.join(process.cwd(), 'src', 'middleware.ts');
      const content = fs.readFileSync(middlewarePath, 'utf-8');

      expect(content).toContain('createMiddleware');
      expect(content).toContain('routing');
      expect(content).toContain('matcher');
    });

    it('should exclude API routes from middleware', () => {
      const middlewarePath = path.join(process.cwd(), 'src', 'middleware.ts');
      const content = fs.readFileSync(middlewarePath, 'utf-8');

      expect(content).toContain('api');
    });

    it('should exclude static files from middleware', () => {
      const middlewarePath = path.join(process.cwd(), 'src', 'middleware.ts');
      const content = fs.readFileSync(middlewarePath, 'utf-8');

      expect(content).toContain('_next');
      expect(content).toContain('_vercel');
    });
  });

  describe('Request Configuration', () => {
    it('should have valid i18n request configuration', () => {
      const requestPath = path.join(process.cwd(), 'src', 'i18n', 'request.ts');
      expect(fs.existsSync(requestPath)).toBe(true);
    });

    it('should have valid i18n routing configuration', () => {
      const routingPath = path.join(process.cwd(), 'src', 'i18n', 'routing.ts');
      expect(fs.existsSync(routingPath)).toBe(true);
    });
  });
});
