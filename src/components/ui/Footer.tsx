'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

export function Footer() {
  const tDash = useTranslations('Dashboard');

  return (
    <footer className="w-full mt-16 py-8 px-4 border-t border-[var(--ce-border)] bg-[var(--ce-surface)]">
      <div className="container-max">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="flex flex-col gap-3 max-w-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[var(--ce-primary)] rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">CE</span>
              </div>
              <span className="font-semibold text-[var(--ce-text-primary)]">CalcEmpire</span>
            </div>
            <p className="body-small text-[var(--ce-text-secondary)]">
              Professional engineering calculation tools for technical workflows.
            </p>
          </div>

          <div className="professional-card p-4 max-w-md">
            <h3 className="text-xs font-medium text-[var(--ce-text-primary)] mb-2 uppercase tracking-wide">
              Disclaimer
            </h3>
            <p className="text-xs text-[var(--ce-text-muted)] leading-relaxed">
              {tDash('disclaimer' as string) ||
                'These calculations are for informational purposes only. Professional verification required for critical applications.'}
            </p>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-[var(--ce-border)] flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[var(--ce-text-muted)]">
          <p>© {new Date().getFullYear()} CalcEmpire. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-[var(--ce-primary)] transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-[var(--ce-primary)] transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-[var(--ce-primary)] transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
