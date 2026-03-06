import React from 'react';
import { Link } from '@/i18n/routing';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Navbar() {
    return (
        <nav className="w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="shrink-0 flex items-center">
                        <Link href="/" className="flex items-center gap-2 group">
                            <span className="text-2xl" role="img" aria-label="ruler">📏</span>
                            <span className="font-bold text-xl text-slate-800 dark:text-slate-100 tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                CalcEmpire
                            </span>
                        </Link>
                    </div>
                    <div className="flex items-center">
                        <LanguageSwitcher />
                    </div>
                </div>
            </div>
        </nav>
    );
}
