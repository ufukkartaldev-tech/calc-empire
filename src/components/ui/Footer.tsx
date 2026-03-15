'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

export function Footer() {
  const tDash = useTranslations('Dashboard');

  return (
    <footer className="w-full mt-auto py-12 px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
        <div className="flex flex-col gap-3 max-w-sm">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📏</span>
            <span className="font-bold text-lg text-slate-800 dark:text-slate-100 tracking-tight">
              CalcEmpire
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Mühendislik hesaplamalarında hassasiyet ve hız arayan profesyoneller için tasarlanmış
            bir araç seti. Türkiye'de geliştirilmiştir.
          </p>
        </div>

        <div className="flex flex-col gap-4 p-5 bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-500 rounded-r-2xl max-w-2xl">
          <h3 className="text-sm font-bold text-amber-900 dark:text-amber-400 flex items-center gap-2">
            <span>⚠️</span> {tDash('consentTitle' as any) || 'SORUMLULUK REDDİ'}
          </h3>
          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed italic">
            {tDash('disclaimer' as any) ||
              'Bu uygulamadaki hesaplamalar yalnızca bilgilendirme amaçlıdır. Nihai mühendislik kararları için kullanılmamalıdır. Sonuçların doğruluğu için Yetkili bir mühendise danışın.'}
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-400">
        <p>
          © {new Date().getFullYear()} CalcEmpire.{' '}
          {tDash('footerCopyright' as any) || 'Tüm hakları saklıdır.'}
        </p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-blue-500 transition-colors">
            Twitter
          </a>
          <a href="#" className="hover:text-blue-500 transition-colors">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
