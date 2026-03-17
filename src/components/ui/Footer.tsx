'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

export function Footer() {
  const tDash = useTranslations('Dashboard');

  return (
    <footer className="w-full mt-24 py-20 px-10 border-t border-slate-200/50 dark:border-slate-800/50 bg-white/30 dark:bg-slate-950/30 backdrop-blur-3xl">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start gap-16">
        <div className="flex flex-col gap-6 max-w-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-white shadow-lg">
              <span className="text-xl">📏</span>
            </div>
            <span className="font-black text-2xl text-slate-900 dark:text-white tracking-tighter uppercase">
              CalcEmpire
            </span>
          </div>
          <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            Mühendislik hesaplamalarında hassasiyet ve hız arayan profesyoneller için tasarlanmış
            bir araç seti. Türkiye'de geliştirilmiştir.
          </p>
        </div>

        <div className="flex flex-col gap-6 p-10 bg-white/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 rounded-[40px] shadow-2xl shadow-blue-500/5 max-w-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
          <h3 className="text-xs font-black text-amber-600 dark:text-amber-500 flex items-center gap-3 uppercase tracking-[0.2em] relative z-10">
            <span className="text-lg">⚠️</span> {tDash('consentTitle' as any) || 'SORUMLULUK REDDİ'}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic relative z-10 font-medium">
            {tDash('disclaimer' as any) ||
              'Bu uygulamadaki hesaplamalar yalnızca bilgilendirme amaçlıdır. Nihai mühendislik kararları için kullanılmamalıdır. Sonuçların doğruluğu için Yetkili bir mühendise danışın.'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-black uppercase tracking-widest text-slate-400">
        <p>
          © {new Date().getFullYear()} CalcEmpire.{' '}
          {tDash('footerCopyright' as any) || 'Tüm hakları saklıdır.'}
        </p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-all hover:translate-y-[-2px]">
            Twitter
          </a>
          <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-all hover:translate-y-[-2px]">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
