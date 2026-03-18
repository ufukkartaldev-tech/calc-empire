'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="nav-professional">
      <div className="container-max">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-6 h-6 bg-[var(--ce-primary)] rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">CE</span>
              </div>
              <span className="font-semibold text-[var(--ce-text-primary)] tracking-tight">
                CalcEmpire
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              <Link 
                href="/calculators" 
                className="text-sm text-[var(--ce-text-secondary)] hover:text-[var(--ce-primary)] transition-colors"
              >
                Calculators
              </Link>
              <Link 
                href="/guides" 
                className="text-sm text-[var(--ce-text-secondary)] hover:text-[var(--ce-primary)] transition-colors"
              >
                Guides
              </Link>
              <Link 
                href="/about" 
                className="text-sm text-[var(--ce-text-secondary)] hover:text-[var(--ce-primary)] transition-colors"
              >
                About
              </Link>
            </div>
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1 rounded hover:bg-[var(--ce-surface-secondary)] transition-colors"
            >
              {isMobileMenuOpen ? (
                <X size={18} className="text-[var(--ce-text-primary)]" />
              ) : (
                <Menu size={18} className="text-[var(--ce-text-primary)]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--ce-border)] py-3">
            <div className="flex flex-col gap-2">
              <Link 
                href="/calculators" 
                className="text-sm text-[var(--ce-text-secondary)] hover:text-[var(--ce-primary)] transition-colors py-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Calculators
              </Link>
              <Link 
                href="/guides" 
                className="text-sm text-[var(--ce-text-secondary)] hover:text-[var(--ce-primary)] transition-colors py-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Guides
              </Link>
              <Link 
                href="/about" 
                className="text-sm text-[var(--ce-text-secondary)] hover:text-[var(--ce-primary)] transition-colors py-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <div className="pt-2 border-t border-[var(--ce-border)] mt-2">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
