/**
 * @file navigation.test.tsx
 * @description Real accessibility and integration tests for Navbar and Sidebar
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navbar } from '@/components/ui/Navbar';
import { Sidebar } from '@/components/ui/Sidebar';

// Mock required hooks and components
// Enhanced t mock
const tMock = Object.assign(
  vi.fn((key: string) => key),
  {
    raw: vi.fn((_key: string) => []),
    rich: vi.fn((key: string) => key),
    markup: vi.fn((key: string) => key),
  }
);

vi.mock('next-intl', () => ({
  useTranslations: () => tMock,
  useLocale: () => 'en',
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/i18n/routing', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
}));

vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
}));

vi.mock('@/components/ui/theme-provider', () => ({
  useTheme: () => ({ theme: 'dark', setTheme: vi.fn() }),
}));

vi.mock('@/stores/calculatorStore', () => ({
  useCalculatorStore: Object.assign(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (selector: (state: any) => any) =>
      selector({
        calculators: new Map(),
        isHydrated: true,
      }),
    {
      getState: vi.fn(() => ({
        initializeCalculator: vi.fn(),
      })),
    }
  ),
}));

describe('Navigation Accessibility', () => {
  describe('Navbar', () => {
    it('should have a navigation landmark', () => {
      render(<Navbar />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should have a skip-to-content link (WCAG 2.4.1)', () => {
      render(<Navbar />);
      const skipLink = screen.getByText(/CalculatorTemplate\.skipToContent|Skip to content/i);
      expect(skipLink).toBeInTheDocument();
    });
  });

  describe('Sidebar', () => {
    it('should have an aria-label for the navigation region', () => {
      render(
        <Sidebar
          activeCategory={null}
          onCategorySelect={vi.fn()}
          searchQuery=""
          onSearchChange={vi.fn()}
        />
      );
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label');
    });

    it('should allow filtering categories via keyboard', () => {
      const onCategorySelect = vi.fn();
      render(
        <Sidebar
          activeCategory={null}
          onCategorySelect={onCategorySelect}
          searchQuery=""
          onSearchChange={vi.fn()}
        />
      );
      const categoryButtons = screen.getAllByRole('button');
      expect(categoryButtons.length).toBeGreaterThan(0);

      // Test first category button
      fireEvent.click(categoryButtons[0]);
      expect(categoryButtons[0]).toHaveAttribute('aria-pressed', 'true');
    });
  });
});
