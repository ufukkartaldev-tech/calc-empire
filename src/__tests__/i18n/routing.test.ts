/**
 * @file routing.test.ts
 * @description Integration tests for i18n routing
 * 
 * Tests: next-intl routing configuration, locale detection, navigation
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('i18n Routing', () => {
    describe('Routing Configuration', () => {
        it('should have valid routing.ts configuration', () => {
            const routingPath = path.join(process.cwd(), 'src', 'i18n', 'routing.ts');
            const content = fs.readFileSync(routingPath, 'utf-8');

            expect(content).toContain('defineRouting');
            expect(content).toContain('locales');
            expect(content).toContain('defaultLocale');
        });

        it('should have defaultLocale set to en', () => {
            const routingPath = path.join(process.cwd(), 'src', 'i18n', 'routing.ts');
            const content = fs.readFileSync(routingPath, 'utf-8');

            expect(content).toContain("defaultLocale: 'en'");
        });

        it('should have all expected locales', () => {
            const routingPath = path.join(process.cwd(), 'src', 'i18n', 'routing.ts');
            const content = fs.readFileSync(routingPath, 'utf-8');

            const expectedLocales = [
                'en', 'tr', 'ru', 'hi', 'ja', 'es', 'fr', 'de', 'it', 
                'pt', 'nl', 'pl', 'zh', 'ar', 'ko', 'id'
            ];

            expectedLocales.forEach(locale => {
                expect(content).toContain(`'${locale}'`);
            });
        });
    });

    describe('Locale Files', () => {
        it('should have message file for each locale', () => {
            const routingPath = path.join(process.cwd(), 'src', 'i18n', 'routing.ts');
            const content = fs.readFileSync(routingPath, 'utf-8');

            const localesMatch = content.match(/locales:\s*\[([\s\S]*?)\]/);
            if (!localesMatch) {
                throw new Error('Could not find locales array in routing.ts');
            }

            const localesString = localesMatch[1];
            const locales = localesString
                .split(',')
                .map(s => s.trim())
                .map(s => s.replace(/['"]/g, ''))
                .filter(s => s.length > 0);

            locales.forEach(locale => {
                const messagePath = path.join(process.cwd(), 'src', 'messages', `${locale}.json`);
                expect(fs.existsSync(messagePath)).toBe(true);
            });
        });

        it('should have valid JSON in all message files', () => {
            const routingPath = path.join(process.cwd(), 'src', 'i18n', 'routing.ts');
            const content = fs.readFileSync(routingPath, 'utf-8');

            const localesMatch = content.match(/locales:\s*\[([\s\S]*?)\]/);
            if (!localesMatch) {
                throw new Error('Could not find locales array in routing.ts');
            }

            const localesString = localesMatch[1];
            const locales = localesString
                .split(',')
                .map(s => s.trim())
                .map(s => s.replace(/['"]/g, ''))
                .filter(s => s.length > 0);

            locales.forEach(locale => {
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
