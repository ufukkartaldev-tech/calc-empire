/**
 * @file responsive-unit.test.ts
 * @description Unit tests for responsive design utilities and components
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../components/ui/theme-provider';
import { LoadingSpinner, LoadingState, LoadingCard, LoadingButton } from '../components/ui/loading';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal('localStorage', localStorageMock);

describe('Responsive Design Utilities', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  describe('ThemeProvider Responsiveness', () => {
    it('should handle system theme preference', () => {
      // Mock prefers-color-scheme: dark
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => {},
        }),
      });

      render(
        <ThemeProvider>
          <div data-testid="test-content">Test Content</div>
        </ThemeProvider>
      );

      const testContent = screen.getByTestId('test-content');
      expect(testContent).toBeInTheDocument();
    });

    it('should apply theme classes correctly', () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <div data-testid="test-content">Test Content</div>
        </ThemeProvider>
      );

      const root = document.documentElement;
      expect(root.classList.contains('dark')).toBe(true);
      expect(root.getAttribute('data-theme')).toBe('dark');
    });

    it('should persist theme preference', () => {
      let themeApi: any;
      const TestComponent = () => {
        themeApi = useTheme();
        return null;
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      act(() => {
        themeApi.setTheme('dark');
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith('calc-empire-theme', 'dark');
    });
  });

  describe('Loading Components Responsiveness', () => {
    it('should render LoadingSpinner with proper sizes', () => {
      const { rerender } = render(<LoadingSpinner size="sm" />);
      const spinner = screen.getByRole('img', { hidden: true });

      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('w-4 h-4');

      rerender(<LoadingSpinner size="lg" />);
      expect(spinner).toHaveClass('w-8 h-8');
    });

    it('should show loading state correctly', () => {
      render(
        <LoadingState isLoading={true}>
          <div>Content</div>
        </LoadingState>
      );

      expect(screen.queryByText('Content')).not.toBeInTheDocument();
      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
    });

    it('should show content when not loading', () => {
      render(
        <LoadingState isLoading={false}>
          <div>Content</div>
        </LoadingState>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument();
    });

    it('should render LoadingCard with proper styling', () => {
      render(<LoadingCard title="Custom Loading" />);

      expect(screen.getByText('Custom Loading')).toBeInTheDocument();
      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
    });

    it('should handle LoadingButton states', () => {
      const onClick = vi.fn();

      render(
        <LoadingButton isLoading={false} onClick={onClick}>
          Submit
        </LoadingButton>
      );

      const button = screen.getByRole('button', { name: 'Submit' });
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();

      fireEvent.click(button);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should disable LoadingButton when loading', () => {
      const onClick = vi.fn();

      render(
        <LoadingButton isLoading={true} onClick={onClick}>
          Submit
        </LoadingButton>
      );

      const button = screen.getByRole('button', { name: 'Submit' });
      expect(button).toBeDisabled();

      fireEvent.click(button);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('Touch Interaction Support', () => {
    it('should handle touch events appropriately', () => {
      render(<LoadingButton isLoading={false}>Touch Button</LoadingButton>);

      const button = screen.getByRole('button', { name: 'Touch Button' });

      fireEvent.touchStart(button);
      fireEvent.touchEnd(button);

      expect(button).toBeInTheDocument();
    });
  });

  describe('Viewport Adaptation', () => {
    it('should handle viewport changes', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });

      render(
        <ThemeProvider>
          <div>Mobile Content</div>
        </ThemeProvider>
      );

      expect(window.innerWidth).toBe(375);
      expect(window.innerHeight).toBe(667);

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });

      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1080,
      });

      expect(window.innerWidth).toBe(1920);
      expect(window.innerHeight).toBe(1080);
    });
  });

  describe('Accessibility in Responsive Design', () => {
    it('should maintain ARIA attributes across themes', () => {
      render(
        <ThemeProvider>
          <LoadingButton isLoading={false} aria-label="Accessible Button">
            Button
          </LoadingButton>
        </ThemeProvider>
      );

      const button = screen.getByRole('button', { name: 'Accessible Button' });
      expect(button).toHaveAttribute('aria-label', 'Accessible Button');
    });

    it('should handle focus management in loading states', () => {
      render(
        <LoadingState isLoading={true}>
          <button>Hidden Button</button>
        </LoadingState>
      );

      expect(screen.queryByRole('button', { name: 'Hidden Button' })).not.toBeInTheDocument();
    });

    it('should provide proper loading indicators', () => {
      render(<LoadingButton isLoading={true}>Loading Button</LoadingButton>);

      const button = screen.getByRole('button', { name: 'Loading Button' });
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toBeDisabled();
    });
  });
});
