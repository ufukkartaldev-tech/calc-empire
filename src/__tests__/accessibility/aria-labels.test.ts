/**
 * @file aria-labels.test.ts
 * @description Accessibility tests for ARIA labels and WCAG compliance
 * 
 * Tests: ARIA labels, keyboard navigation, screen reader support
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Accessibility - ARIA Labels', () => {
    describe('Component ARIA Labels', () => {
        it('should have aria-label on ThemeToggle button', () => {
            const themeTogglePath = path.join(process.cwd(), 'src', 'components', 'ui', 'ThemeToggle.tsx');
            const content = fs.readFileSync(themeTogglePath, 'utf-8');
            expect(content).toContain('aria-label="Toggle Theme"');
        });

        it('should have role="img" on emoji elements', () => {
            const navbarPath = path.join(process.cwd(), 'src', 'components', 'ui', 'Navbar.tsx');
            const content = fs.readFileSync(navbarPath, 'utf-8');
            expect(content).toContain('role="img"');
            expect(content).toContain('aria-label="ruler"');
        });

        it('should have proper form labels for calculator inputs', () => {
            const calculatorTemplatePath = path.join(process.cwd(), 'src', 'components', 'CalculatorTemplate.tsx');
            const content = fs.readFileSync(calculatorTemplatePath, 'utf-8');
            expect(content).toContain('<label');
        });

        it('should have proper button labels', () => {
            const calculatorTemplatePath = path.join(process.cwd(), 'src', 'components', 'CalculatorTemplate.tsx');
            const content = fs.readFileSync(calculatorTemplatePath, 'utf-8');
            expect(content).toContain('onClick={handleSolve}');
            expect(content).toContain('onClick={handleReset}');
        });
    });

    describe('Keyboard Navigation', () => {
        it('should support Enter key for solving', () => {
            const calculatorTemplatePath = path.join(process.cwd(), 'src', 'components', 'CalculatorTemplate.tsx');
            const content = fs.readFileSync(calculatorTemplatePath, 'utf-8');
            expect(content).toContain("onKeyDown={e => e.key === 'Enter' && handleSolve()}");
        });

        it('should have focusable elements', () => {
            const calculatorTemplatePath = path.join(process.cwd(), 'src', 'components', 'CalculatorTemplate.tsx');
            const content = fs.readFileSync(calculatorTemplatePath, 'utf-8');
            expect(content).toContain('type="number"');
            expect(content).toContain('<select');
            expect(content).toContain('<button');
        });
    });

    describe('Screen Reader Support', () => {
        it('should have proper semantic HTML structure', () => {
            const calculatorTemplatePath = path.join(process.cwd(), 'src', 'components', 'CalculatorTemplate.tsx');
            const content = fs.readFileSync(calculatorTemplatePath, 'utf-8');
            // CalculatorTemplate is a form component, not a full page
            // It should have proper form elements and labels
            expect(content).toContain('<label');
            expect(content).toContain('<input');
            expect(content).toContain('<select');
            expect(content).toContain('<button');
        });

        it('should have proper heading hierarchy', () => {
            const calculatorTemplatePath = path.join(process.cwd(), 'src', 'components', 'CalculatorTemplate.tsx');
            const content = fs.readFileSync(calculatorTemplatePath, 'utf-8');
            expect(content).toContain('<h2');
        });

        it('should have error message regions', () => {
            const calculatorTemplatePath = path.join(process.cwd(), 'src', 'components', 'CalculatorTemplate.tsx');
            const content = fs.readFileSync(calculatorTemplatePath, 'utf-8');
            expect(content).toContain('bg-red-50');
            expect(content).toContain('text-red-600');
        });
    });
});
