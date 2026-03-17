import React from 'react';
import { Link } from '@/i18n/routing';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';

export function Navbar() {
  return (
    <nav className="w-full border-b border-slate-800 bg-slate-900 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white font-black text-xs">
                 CE
              </div>
              <span className="font-semibold text-lg text-white tracking-tight group-hover:text-blue-500 transition-colors uppercase">
                CalcEmpire
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
}
