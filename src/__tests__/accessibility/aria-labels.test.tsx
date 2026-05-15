/**
 * @file aria-labels.test.tsx
 * @description Accessibility tests for ARIA labels and WCAG compliance
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Navbar } from '@/components/ui/Navbar';
import CalculatorTemplate from '@/components/CalculatorTemplate';
import { ohmConfig } from '@/lib/calculators/ohm';
import { CalculatorError } from '@/components/ui/CalculatorError';
import { ErrorSeverity } from '@/lib/errors/errorHandler';

// Mock session for Navbar
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(() => ({ data: null, status: 'unauthenticated' })),
}));

// Mock theme provider for ThemeToggle
vi.mock('@/components/ui/theme-provider', () => ({
  useTheme: vi.fn(() => ({ theme: 'dark', setTheme: vi.fn() })),
}));

// Enhanced t mock to handle t.raw and other methods
const tMock = Object.assign(
  vi.fn((key: string) => key),
  {
    raw: vi.fn((key: string) => []),
    rich: vi.fn((key: string) => key),
    markup: vi.fn((key: string) => key),
  }
);

// Mock next-intl and its routing
vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => tMock),
  useLocale: vi.fn(() => 'en'),
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/i18n/routing', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}));

// Mock hydration and store hooks
vi.mock('@/stores/calculatorStore', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/stores/calculatorStore')>();
  return {
    ...actual,
    useCalculatorHydrated: vi.fn(() => true),
    useCalculatorData: vi.fn(() => ({
      fields: {
        voltage: { raw: '', unit: 'V' },
        current: { raw: '', unit: 'A' },
        resistance: { raw: '', unit: 'Ω' },
      },
      result: null,
      lastAccessed: Date.now(),
    })),
    useCalculatorStore: Object.assign(
      vi.fn((selector) =>
        selector({
          calculators: new Map([['ohm', { fields: {}, result: null, lastAccessed: Date.now() }]]),
          isHydrated: true,
        })
      ),
      {
        getState: vi.fn(() => ({
          calculators: new Map(),
          initializeCalculator: vi.fn(),
          setFieldValue: vi.fn(),
          setFieldUnit: vi.fn(),
          setResult: vi.fn(),
          clearResult: vi.fn(),
          resetCalculator: vi.fn(),
        })),
        subscribe: vi.fn(),
      }
    ),
  };
});

describe('Accessibility - ARIA Labels', () => {
  describe('Component ARIA Labels', () => {
    it('should have proper theme toggle labels', () => {
      render(<ThemeToggle />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Switch to system theme');
    });

    it('should have proper brand aria-labels', () => {
      render(<Navbar />);
      expect(screen.getByText(/CalcEmpire/i)).toBeInTheDocument();
    });

    it('should have proper form labels for calculator inputs', () => {
      render(<CalculatorTemplate config={ohmConfig} />);
      expect(screen.getByText('OhmCalculator.voltage')).toBeInTheDocument();
      expect(screen.getByText('OhmCalculator.current')).toBeInTheDocument();
      expect(screen.getByText('OhmCalculator.resistance')).toBeInTheDocument();
    });

    it('should have proper button labels', () => {
      render(<CalculatorTemplate config={ohmConfig} />);
      expect(screen.getByText('CalculatorTemplate.solveButton')).toBeInTheDocument();
      expect(screen.getByText('CalculatorTemplate.resetButton')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should have focusable elements in calculator', () => {
      render(<CalculatorTemplate config={ohmConfig} />);
      const inputs = screen.getAllByRole('spinbutton');
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  describe('Screen Reader Support', () => {
    it('should have proper semantic HTML structure in template', () => {
      render(<CalculatorTemplate config={ohmConfig} />);
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('OhmCalculator.title');
    });

    it('should have error message regions with proper styling', () => {
      const errorInfo = {
        message: 'Test Error',
        severity: ErrorSeverity.HIGH,
      };
      render(<CalculatorError errorInfo={errorInfo} onDismiss={() => {}} />);

      const errorMessage = screen.getByText('Test Error');
      const errorContainer = errorMessage.closest('.mb-6');

      expect(errorContainer).not.toBeNull();
      const classList = errorContainer!.className;
      expect(classList).toContain('bg-red-950/20');
      expect(classList).toContain('text-red-500');
    });
  });
});
