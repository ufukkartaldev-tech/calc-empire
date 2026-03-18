'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Calculator } from 'lucide-react';

export function Footer() {
  const tDash = useTranslations('Dashboard');

  return (
    <footer className="w-full mt-24 py-12 px-8 border-t border-[var(--ce-border)] bg-[var(--ce-surface)]">
      <div className="container-max flex flex-col lg:flex-row justify-between items-start gap-12">
        <div className="flex flex-col gap-4 max-w-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white shadow-md">
              <Calculator size={20} strokeWidth={2} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-[var(--ce-text-primary)] tracking-tight">
                CalcEmpire
              </span>
              <span className="text-xs text-[var(--ce-text-muted)] font-medium">
                Engineering Tools
              </span>
            </div>
          </div>
          <p className="body-regular text-[var(--ce-text-secondary)] leading-relaxed">
            Professional engineering calculation tools designed for accuracy and efficiency in technical workflows.
          </p>
        </div>

        <div className="professional-card p-6 max-w-2xl">
          <h3 className="text-sm font-bold text-[var(--ce-warning)] flex items-center gap-2 uppercase tracking-widest mb-3">
            <span>⚠️</span> {tDash('consentTitle' as keyof IntlMessages['Dashboard']) || 'DISCLAIMER'}
          </h3>
          <p className="body-small text-[var(--ce-text-muted)] leading-relaxed italic">
            {tDash('disclaimer' as keyof IntlMessages['Dashboard']) ||
              'These calculations are for informational purposes only. Should not be used for final engineering decisions without professional verification.'}
          </p>
        </div>
      </div>

      <div className="container-max mt-12 pt-8 border-t border-[var(--ce-border)] flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[var(--ce-text-muted)]">
        <p>
          © {new Date().getFullYear()} CalcEmpire.{' '}
          {tDash('footerCopyright' as keyof IntlMessages['Dashboard']) || 'All rights reserved.'}
        </p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-[var(--ce-primary)] transition-colors">Twitter</a>
          <a href="#" className="hover:text-[var(--ce-primary)] transition-colors">GitHub</a>
          <a href="#" className="hover:text-[var(--ce-primary)] transition-colors">Documentation</a>
        </div>
      </div>
    </footer>
  );
}
