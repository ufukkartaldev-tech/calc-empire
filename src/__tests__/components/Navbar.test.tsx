/**
 * @file Navbar.test.tsx
 * @description Comprehensive tests for Navbar component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Navbar } from '@/components/ui/Navbar';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock routing
vi.mock('@/i18n/routing', () => ({
  Link: ({ children, href, ...props }: React.ComponentProps<'a'>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock components
vi.mock('@/components/ui/LanguageSwitcher', () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher">Language Switcher</div>,
}));

vi.mock('@/components/ui/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}));

describe('Navbar', () => {
  it('renders the logo and brand name', () => {
    render(<Navbar />);
    
    expect(screen.getByText('CalcEmpire')).toBeInTheDocument();
    expect(screen.getByText('Engineering Tools')).toBeInTheDocument();
  });

  it('renders desktop navigation links', () => {
    render(<Navbar />);
    
    expect(screen.getByText('Calculators')).toBeInTheDocument();
    expect(screen.getByText('Guides')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('renders theme toggle and language switcher', () => {
    render(<Navbar />);
    
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
  });

  it('has correct accessibility attributes', () => {
    render(<Navbar />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
    
    const logoLink = screen.getByRole('link', { name: /CalcEmpire Engineering Tools/i });
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('applies correct CSS classes for styling', () => {
    render(<Navbar />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('nav-professional');
  });
});
