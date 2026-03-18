import React from 'react';
import { Link } from '@/i18n/routing';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { Calculator, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="nav-professional">
      <div className="container-max">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white shadow-md group-hover:shadow-lg transition-all">
                <Calculator size={20} strokeWidth={2} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-[var(--ce-text-primary)] tracking-tight group-hover:text-[var(--ce-primary)] transition-colors">
                  CalcEmpire
                </span>
                <span className="text-xs text-[var(--ce-text-muted)] font-medium">
                  Engineering Tools
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              <Link 
                href="/calculators" 
                className="text-sm font-medium text-[var(--ce-text-secondary)] hover:text-[var(--ce-primary)] transition-colors"
              >
                Calculators
              </Link>
              <Link 
                href="/guides" 
                className="text-sm font-medium text-[var(--ce-text-secondary)] hover:text-[var(--ce-primary)] transition-colors"
              >
                Guides
              </Link>
              <Link 
                href="/about" 
                className="text-sm font-medium text-[var(--ce-text-secondary)] hover:text-[var(--ce-primary)] transition-colors"
              >
                About
              </Link>
            </div>
            
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-[var(--ce-surface-secondary)] transition-colors"
            >
              {isMobileMenuOpen ? (
                <X size={20} className="text-[var(--ce-text-primary)]" />
              ) : (
                <Menu size={20} className="text-[var(--ce-text-primary)]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--ce-border)] py-4">
            <div className="flex flex-col gap-4">
              <Link 
                href="/calculators" 
                className="text-sm font-medium text-[var(--ce-text-secondary)] hover:text-[var(--ce-primary)] transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Calculators
              </Link>
              <Link 
                href="/guides" 
                className="text-sm font-medium text-[var(--ce-text-secondary)] hover:text-[var(--ce-primary)] transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Guides
              </Link>
              <Link 
                href="/about" 
                className="text-sm font-medium text-[var(--ce-text-secondary)] hover:text-[var(--ce-primary)] transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <div className="pt-4 border-t border-[var(--ce-border)]">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
