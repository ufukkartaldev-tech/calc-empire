'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

export function Footer() {
  const tDash = useTranslations('Dashboard');

  return (
    <footer className="w-full mt-24 py-12 px-8 border-t border-slate-800 bg-slate-900/50">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start gap-12">
        <div className="flex flex-col gap-4 max-w-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-slate-800 flex items-center justify-center text-white font-black text-xs">
              CE
            </div>
            <span className="font-semibold text-lg text-white tracking-tight uppercase">
              CalcEmpire
            </span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Mühendislik hesaplamalarında hassasiyet ve hız arayan profesyoneller için tasarlanmış
            bir araç seti.
          </p>
        </div>

        <div className="flex flex-col gap-4 p-6 bg-slate-950 border border-slate-800 rounded-xl max-w-2xl">
          <h3 className="text-[10px] font-bold text-amber-500 flex items-center gap-2 uppercase tracking-widest">
            <span>⚠️</span> {tDash('consentTitle' as any) || 'SORUMLULUK REDDİ'}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed italic font-medium">
            {tDash('disclaimer' as any) ||
              'Bu uygulamadaki hesaplamalar yalnızca bilgilendirme amaçlıdır. Nihai mühendislik kararları için kullanılmamalıdır.'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
        <p>
          © {new Date().getFullYear()} CalcEmpire.{' '}
          {tDash('footerCopyright' as any) || 'Tüm hakları saklıdır.'}
        </p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-blue-500 transition-colors">Twitter</a>
          <a href="#" className="hover:text-blue-500 transition-colors">GitHub</a>
        </div>
      </div>
    </footer>
  );
}
