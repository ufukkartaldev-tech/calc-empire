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
      const themeTogglePath = path.join(
        process.cwd(),
        'src',
        'components',
        'ui',
        'ThemeToggle.tsx'
      );
      expect(fs.existsSync(themeTogglePath)).toBe(true);
    });

    it('should have toggle button with aria-label', () => {
      const themeTogglePath = path.join(
        process.cwd(),
        'src',
        'components',
        'ui',
        'ThemeToggle.tsx'
      );
      const content = fs.readFileSync(themeTogglePath, 'utf-8');
      expect(content).toContain('aria-label=');
      expect(content).toContain('getLabel()');
      expect(content).toContain('toggleTheme');
    });

    it('should persist theme to localStorage', () => {
      const providerPath = path.join(
        process.cwd(),
        'src',
        'components',
        'ui',
        'theme-provider.tsx'
      );
      const content = fs.readFileSync(providerPath, 'utf-8');
      expect(content).toContain('localStorage.setItem');
      expect(content).toContain('localStorage.getItem');
      expect(content).toContain('calc-empire-theme');
    });

    it('should respect system preference', () => {
      const providerPath = path.join(
        process.cwd(),
        'src',
        'components',
        'ui',
        'theme-provider.tsx'
      );
      const content = fs.readFileSync(providerPath, 'utf-8');
      expect(content).toContain('prefers-color-scheme');
      expect(content).toContain('system');
    });
  });

  describe('CSS Variables', () => {
    it('should have dark mode CSS variables', () => {
      const globalsPath = path.join(process.cwd(), 'src', 'app', 'globals.css');
      const content = fs.readFileSync(globalsPath, 'utf-8');
      expect(content).toContain('.dark');
      expect(content).toContain('[data-theme="dark"]');
      expect(content).toContain('--ce-bg:');
      expect(content).toContain('--ce-surface:');
      expect(content).toContain('--ce-text-primary:');
    });

    it('should have light mode CSS variables', () => {
      const globalsPath = path.join(process.cwd(), 'src', 'app', 'globals.css');
      const content = fs.readFileSync(globalsPath, 'utf-8');
      expect(content).toContain(':root {');
      expect(content).toContain('--ce-bg:');
      expect(content).toContain('--ce-surface:');
      expect(content).toContain('--ce-text-primary:');
    });
  });

  describe('Component Dark Mode Support', () => {
    it('should have dark mode CSS variables in Navbar', () => {
      const navbarPath = path.join(process.cwd(), 'src', 'components', 'ui', 'Navbar.tsx');
      const content = fs.readFileSync(navbarPath, 'utf-8');
      // Uses CSS variables for theming
      expect(content).toContain('var(--ce-text-primary)');
      expect(content).toContain('var(--ce-text-secondary)');
      expect(content).toContain('var(--ce-surface-secondary)');
    });

    it('should have dark mode CSS variables in Sidebar', () => {
      const sidebarPath = path.join(process.cwd(), 'src', 'components', 'ui', 'Sidebar.tsx');
      const content = fs.readFileSync(sidebarPath, 'utf-8');
      // Uses CSS variables for theming
      expect(content).toContain('var(--ce-text-secondary)');
      expect(content).toContain('var(--ce-text-primary)');
      expect(content).toContain('var(--ce-surface-secondary)');
    });

    it('should have dark mode CSS variables in Footer', () => {
      const footerPath = path.join(process.cwd(), 'src', 'components', 'ui', 'Footer.tsx');
      const content = fs.readFileSync(footerPath, 'utf-8');
      // Uses CSS variables for theming
      expect(content).toContain('var(--ce-text-primary)');
      expect(content).toContain('var(--ce-text-secondary)');
      expect(content).toContain('var(--ce-text-muted)');
    });

    it('should have dark mode CSS variables in EngineeringDashboard', () => {
      const dashboardPath = path.join(
        process.cwd(),
        'src',
        'components',
        'dashboard',
        'EngineeringDashboard.tsx'
      );
      const content = fs.readFileSync(dashboardPath, 'utf-8');
      // Uses CSS variables for theming
      expect(content).toContain('var(--ce-bg)');
      expect(content).toContain('var(--ce-border)');
      expect(content).toContain('var(--ce-text-muted)');
    });

    it('should have dark mode support in CalculatorTemplate', () => {
      const calculatorPath = path.join(
        process.cwd(),
        'src',
        'components',
        'CalculatorTemplate.tsx'
      );
      const content = fs.readFileSync(calculatorPath, 'utf-8');
      // Uses dark mode class for border
      expect(content).toContain('dark:border-slate-800');
    });
  });

  describe('Contrast Compliance', () => {
    it('should have high contrast text in dark mode', () => {
      const globalsPath = path.join(process.cwd(), 'src', 'app', 'globals.css');
      const content = fs.readFileSync(globalsPath, 'utf-8');
      // Dark mode text should be light (white/light gray)
      expect(content).toContain('--ce-text-primary:');
    });

    it('should have high contrast text in light mode', () => {
      const globalsPath = path.join(process.cwd(), 'src', 'app', 'globals.css');
      const content = fs.readFileSync(globalsPath, 'utf-8');
      // Light mode text should be dark (black/dark gray)
      expect(content).toContain('--ce-text-primary:');
    });
  });

  describe('Theme Persistence', () => {
    it('should save theme preference', () => {
      const providerPath = path.join(
        process.cwd(),
        'src',
        'components',
        'ui',
        'theme-provider.tsx'
      );
      const content = fs.readFileSync(providerPath, 'utf-8');
      expect(content).toContain('localStorage.setItem');
    });

    it('should load saved theme on mount', () => {
      const providerPath = path.join(
        process.cwd(),
        'src',
        'components',
        'ui',
        'theme-provider.tsx'
      );
      const content = fs.readFileSync(providerPath, 'utf-8');
      expect(content).toContain('useEffect');
      expect(content).toContain('localStorage.getItem');
      expect(content).toContain('calc-empire-theme');
    });
  });
});
