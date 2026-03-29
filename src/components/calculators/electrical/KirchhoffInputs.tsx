import React from 'react';
import { useTranslations } from 'next-intl';

interface KirchhoffInputsProps {
  V1: number;
  setV1: (v: number) => void;
  V2: number;
  setV2: (v: number) => void;
  R1: number;
  setR1: (v: number) => void;
  R2: number;
  setR2: (v: number) => void;
  R3: number;
  setR3: (v: number) => void;
}

export function KirchhoffInputs({
  V1,
  setV1,
  V2,
  setV2,
  R1,
  setR1,
  R2,
  setR2,
  R3,
  setR3,
}: KirchhoffInputsProps) {
  const t = useTranslations('Kirchhoff');

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
        <label className="text-xs font-semibold text-slate-500 block mb-1">{t('v1Label')}</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={V1}
            onChange={(e) => setV1(Number(e.target.value))}
            className="w-full bg-transparent font-mono font-bold text-lg text-slate-900 dark:text-white outline-none"
          />
          <span className="text-slate-400 font-medium">V</span>
        </div>
      </div>
      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
        <label className="text-xs font-semibold text-slate-500 block mb-1">{t('v2Label')}</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={V2}
            onChange={(e) => setV2(Number(e.target.value))}
            className="w-full bg-transparent font-mono font-bold text-lg text-slate-900 dark:text-white outline-none"
          />
          <span className="text-slate-400 font-medium">V</span>
        </div>
      </div>
      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
        <label className="text-xs font-semibold text-slate-500 block mb-1">{t('r1Label')}</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            value={R1}
            onChange={(e) => setR1(Number(e.target.value))}
            className="w-full bg-transparent font-mono font-bold text-lg text-slate-900 dark:text-white outline-none"
          />
          <span className="text-slate-400 font-medium">Ω</span>
        </div>
      </div>
      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
        <label className="text-xs font-semibold text-slate-500 block mb-1">{t('r2Label')}</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            value={R2}
            onChange={(e) => setR2(Number(e.target.value))}
            className="w-full bg-transparent font-mono font-bold text-lg text-slate-900 dark:text-white outline-none"
          />
          <span className="text-slate-400 font-medium">Ω</span>
        </div>
      </div>
      <div className="col-span-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
        <label className="text-xs font-semibold text-slate-500 block mb-1">{t('r3Label')}</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            value={R3}
            onChange={(e) => setR3(Number(e.target.value))}
            className="w-full bg-transparent font-mono font-bold text-lg text-slate-900 dark:text-white outline-none"
          />
          <span className="text-slate-400 font-medium">Ω</span>
        </div>
      </div>
    </div>
  );
}
