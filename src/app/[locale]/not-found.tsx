/**
 * @file app/[locale]/not-found.tsx
 * @description Custom 404 page for CalcEmpire
 */

import Link from 'next/link';
import { Calculator, ArrowLeft, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Icon */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl animate-pulse" />
          <div className="relative w-full h-full bg-slate-900 dark:bg-slate-800 rounded-3xl border border-slate-800 dark:border-slate-700 flex items-center justify-center">
            <Calculator className="w-12 h-12 text-slate-400" />
          </div>
          {/* Floating elements */}
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center border border-red-500/20">
            <span className="text-red-400 font-bold text-sm">404</span>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Page Not Found
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            The calculator or page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all hover:scale-105 active:scale-95"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        {/* Suggestions */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-500 mb-4 flex items-center justify-center gap-2">
            <Search className="w-4 h-4" />
            Popular Calculators
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['ohm', 'matrix', 'baseConverter', 'beam', 'unitConverter'].map((tool) => (
              <Link
                key={tool}
                href={`/calculators/${tool}`}
                className="px-4 py-2 bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium rounded-lg transition-colors capitalize"
              >
                {tool.replace(/([A-Z])/g, ' $1').trim()}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
