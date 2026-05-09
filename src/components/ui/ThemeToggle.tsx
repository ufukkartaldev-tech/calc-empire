'use client';

import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from './theme-provider';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light');
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun size={16} className="text-[var(--ce-text-primary)]" />;
      case 'dark':
        return <Moon size={16} className="text-[var(--ce-text-primary)]" />;
      default:
        return <Monitor size={16} className="text-[var(--ce-text-primary)]" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Switch to dark mode';
      case 'dark':
        return 'Switch to system theme';
      default:
        return 'Switch to light mode';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-1 rounded hover:bg-[var(--ce-surface-secondary)] transition-colors"
      aria-label={getLabel()}
      title={`Current theme: ${theme}`}
    >
      {getIcon()}
    </button>
  );
}
