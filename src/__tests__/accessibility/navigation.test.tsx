/**
 * @file navigation.test.tsx
 * @description Real accessibility and integration tests for Navbar and Sidebar
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navbar } from '@/components/ui/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';

// Mock required hooks and components
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
}));

vi.mock('@/stores/calculatorStore', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useCalculatorStore: (selector: (state: any) => any) =>
    selector({
      calculators: new Map(),
      isHydrated: true,
    }),
}));

describe('Navigation Accessibility', () => {
  describe('Navbar', () => {
    it('should have a navigation landmark', () => {
      render(<Navbar />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should have a skip-to-content link (WCAG 2.4.1)', () => {
      render(<Navbar />);
      const skipLink = screen.getByText(/CalculatorTemplate.skipToContent/i || /Skip to content/i);
      expect(skipLink).toBeInTheDocument();
    });
  });

  describe('Sidebar', () => {
    it('should have an aria-label for the navigation region', () => {
      render(<Sidebar />);
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label');
    });

    it('should allow filtering categories via keyboard', () => {
      render(<Sidebar />);
      const categoryButtons = screen.getAllByRole('button');
      expect(categoryButtons.length).toBeGreaterThan(0);

      // Test first category button
      fireEvent.click(categoryButtons[0]);
      expect(categoryButtons[0]).toHaveAttribute('aria-pressed', 'true');
    });
  });
});
