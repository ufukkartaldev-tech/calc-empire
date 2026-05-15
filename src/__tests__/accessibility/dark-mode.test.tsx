import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useTheme } from '@/components/ui/theme-provider';

// Mock the useTheme hook
vi.mock('@/components/ui/theme-provider', () => ({
  useTheme: vi.fn(),
}));

describe('Dark Mode Accessibility', () => {
  const mockSetTheme = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders theme toggle with correct aria-label for light theme', () => {
    (useTheme as Mock).mockReturnValue({ theme: 'light', setTheme: mockSetTheme });

    render(<ThemeToggle />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
  });

  it('renders theme toggle with correct aria-label for dark theme', () => {
    (useTheme as Mock).mockReturnValue({ theme: 'dark', setTheme: mockSetTheme });

    render(<ThemeToggle />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Switch to system theme');
  });

  it('cycles through themes when clicked', () => {
    (useTheme as Mock).mockReturnValue({ theme: 'light', setTheme: mockSetTheme });

    render(<ThemeToggle />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('is keyboard accessible', () => {
    (useTheme as Mock).mockReturnValue({ theme: 'light', setTheme: mockSetTheme });

    render(<ThemeToggle />);

    const button = screen.getByRole('button');
    button.focus();
    expect(button).toHaveFocus();
  });
});
