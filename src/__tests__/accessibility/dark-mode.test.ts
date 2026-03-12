/**
 * @file dark-mode.test.ts
 * @description Dark mode accessibility and functionality tests
 * 
 * Tests: Dark mode toggle, contrast, theme persistence
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Dark Mode', () => {
    describe('Theme Toggle', () => {
        it('should have ThemeToggle component', () => {
            const themeTogglePath = path.join(process.cwd(), 'src', 'components', 'ui', 'ThemeToggle.tsx');
            expect(fs.existsSync(themeTogglePath)).toBe(true);
        });

        it('should have toggle button with aria-label', () => {
            const themeTogglePath = path.join(process.cwd(), 'src', 'components', 'ui', 'ThemeToggle.tsx');
            const content = fs.readFileSync(themeTogglePath, 'utf-8');
            expect(content).toContain('aria-label="Toggle Theme"');
            expect(content).toContain('toggleTheme');
        });

        it('should persist theme to localStorage', () => {
            const themeTogglePath = path.join(process.cwd(), 'src', 'components', 'ui', 'ThemeToggle.tsx');
            const content = fs.readFileSync(themeTogglePath, 'utf-8');
            expect(content).toContain('localStorage.setItem(\'theme\'');
            expect(content).toContain('localStorage.getItem(\'theme\'');
        });

        it('should respect system preference', () => {
            const themeTogglePath = path.join(process.cwd(), 'src', 'components', 'ui', 'ThemeToggle.tsx');
            const content = fs.readFileSync(themeTogglePath, 'utf-8');
            expect(content).toContain('prefers-color-scheme');
        });
    });

    describe('CSS Variables', () => {
        it('should have dark mode CSS variables', () => {
            const globalsPath = path.join(process.cwd(), 'src', 'app', 'globals.css');
            const content = fs.readFileSync(globalsPath, 'utf-8');
            expect(content).toContain('.dark {');
            expect(content).toContain('--ce-bg: #020617');
            expect(content).toContain('--ce-surface: #0f172a');
            expect(content).toContain('--ce-text: #f8fafc');
        });

        it('should have light mode CSS variables', () => {
            const globalsPath = path.join(process.cwd(), 'src', 'app', 'globals.css');
            const content = fs.readFileSync(globalsPath, 'utf-8');
            expect(content).toContain(':root {');
            expect(content).toContain('--ce-bg: #f8fafc');
            expect(content).toContain('--ce-surface: #ffffff');
            expect(content).toContain('--ce-text: #0f172a');
        });
    });

    describe('Component Dark Mode Support', () => {
        it('should have dark mode classes in Navbar', () => {
            const navbarPath = path.join(process.cwd(), 'src', 'components', 'ui', 'Navbar.tsx');
            const content = fs.readFileSync(navbarPath, 'utf-8');
            expect(content).toContain('dark:bg-slate-900');
            expect(content).toContain('dark:text-slate-100');
        });

        it('should have dark mode classes in Sidebar', () => {
            const sidebarPath = path.join(process.cwd(), 'src', 'components', 'ui', 'Sidebar.tsx');
            const content = fs.readFileSync(sidebarPath, 'utf-8');
            expect(content).toContain('dark:bg-slate-900');
            expect(content).toContain('dark:text-slate-400');
        });

        it('should have dark mode classes in Footer', () => {
            const footerPath = path.join(process.cwd(), 'src', 'components', 'ui', 'Footer.tsx');
            const content = fs.readFileSync(footerPath, 'utf-8');
            expect(content).toContain('dark:bg-slate-900');
            expect(content).toContain('dark:text-slate-400');
        });

        it('should have dark mode classes in EngineeringDashboard', () => {
            const dashboardPath = path.join(process.cwd(), 'src', 'components', 'dashboard', 'EngineeringDashboard.tsx');
            const content = fs.readFileSync(dashboardPath, 'utf-8');
            expect(content).toContain('dark:bg-slate-950');
            expect(content).toContain('dark:text-white');
            expect(content).toContain('dark:border-slate-800');
        });

        it('should have dark mode classes in CalculatorTemplate', () => {
            const calculatorPath = path.join(process.cwd(), 'src', 'components', 'CalculatorTemplate.tsx');
            const content = fs.readFileSync(calculatorPath, 'utf-8');
            expect(content).toContain('dark:bg-slate-900');
            expect(content).toContain('dark:text-white');
            expect(content).toContain('dark:border-slate-800');
        });
    });

    describe('Contrast Compliance', () => {
        it('should have high contrast text in dark mode', () => {
            const globalsPath = path.join(process.cwd(), 'src', 'app', 'globals.css');
            const content = fs.readFileSync(globalsPath, 'utf-8');
            // Dark mode text should be light (white/light gray)
            expect(content).toContain('--ce-text: #f8fafc');
        });

        it('should have high contrast text in light mode', () => {
            const globalsPath = path.join(process.cwd(), 'src', 'app', 'globals.css');
            const content = fs.readFileSync(globalsPath, 'utf-8');
            // Light mode text should be dark (black/dark gray)
            expect(content).toContain('--ce-text: #0f172a');
        });
    });

    describe('Theme Persistence', () => {
        it('should save theme preference', () => {
            const themeTogglePath = path.join(process.cwd(), 'src', 'components', 'ui', 'ThemeToggle.tsx');
            const content = fs.readFileSync(themeTogglePath, 'utf-8');
            expect(content).toContain('localStorage');
        });

        it('should load saved theme on mount', () => {
            const themeTogglePath = path.join(process.cwd(), 'src', 'components', 'ui', 'ThemeToggle.tsx');
            const content = fs.readFileSync(themeTogglePath, 'utf-8');
            expect(content).toContain('useEffect');
            expect(content).toContain('savedTheme');
        });
    });
});
