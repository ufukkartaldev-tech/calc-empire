'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ReferenceCard } from '../../ui/ReferenceCard';
import { KirchhoffDiagram } from './KirchhoffDiagram';
import { KirchhoffInputs } from './KirchhoffInputs';

export function KirchhoffCalculator() {
  const t = useTranslations('Kirchhoff');

  const [V1, setV1] = useState<number>(10);
  const [V2, setV2] = useState<number>(10);
  const [R1, setR1] = useState<number>(10);
  const [R2, setR2] = useState<number>(10);
  const [R3, setR3] = useState<number>(10);

  const [results, setResults] = useState<{ I1: number; I2: number; I3: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL('./kirchhoff.worker.ts', import.meta.url));
    workerRef.current.onmessage = (event) => {
      if (event.data.success) {
        setResults(event.data.result);
        setErrorMsg(null);
      } else {
        setResults(null);
        setErrorMsg(event.data.error || 'Unknown error');
      }
    };
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ V1, V2, R1, R2, R3 });
    }
  }, [V1, V2, R1, R2, R3]);

  const formatCurrent = (val: number) => {
    if (val === 0) return '0.00 A';
    const UNITS = ['fA', 'pA', 'nA', 'µA', 'mA', 'A', 'kA', 'MA', 'GA'];
    const BASE_INDEX = 5; // index of 'A'

    const power = Math.floor(Math.log10(Math.abs(val)) / 3);
    const unitIndex = Math.min(UNITS.length - 1, Math.max(0, power + BASE_INDEX));

    const multiplier = Math.pow(10, -(unitIndex - BASE_INDEX) * 3);
    const convertedVal = val * multiplier;

    return convertedVal.toFixed(2) + ' ' + UNITS[unitIndex];
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/40 rounded-xl flex items-center justify-center shadow-sm border border-orange-200 dark:border-orange-800">
          <span className="text-2xl">⚡</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('title')}</h2>
      </div>

      <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">{t('description')}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Visualizer & Schematic */}
        <KirchhoffDiagram hasResults={!!results} />

        {/* Controls & Results */}
        <div className="flex flex-col gap-6">
          <KirchhoffInputs
            V1={V1}
            setV1={setV1}
            V2={V2}
            setV2={setV2}
            R1={R1}
            setR1={setR1}
            R2={R2}
            setR2={setR2}
            R3={R3}
            setR3={setR3}
          />

          {/* Output */}
          {results ? (
            <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-semibold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-4">
                {t('calculatedTitle')}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-white dark:bg-slate-950 px-4 py-2 border border-emerald-100 dark:border-emerald-900 rounded-lg">
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                    {t('mesh1')}
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {formatCurrent(results.I1)}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-white dark:bg-slate-950 px-4 py-2 border border-emerald-100 dark:border-emerald-900 rounded-lg">
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                    {t('mesh2')}
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {formatCurrent(results.I2)}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-white dark:bg-slate-950 px-4 py-2 border border-emerald-100 dark:border-emerald-900 rounded-lg shadow-sm">
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                    {t('middle')}
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {formatCurrent(results.I3)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-xl p-5 text-center">
              <p className="text-red-600 dark:text-red-400 font-semibold">{t('errorInvalid')}</p>
              <p className="text-xs text-red-500 flex justify-center mt-1 text-balance">
                {errorMsg || t('errorZero')}
              </p>
            </div>
          )}
        </div>
      </div>
      <ReferenceCard referenceKey="ToolReference.kirchhoff" />
    </div>
  );
}
