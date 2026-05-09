'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ReferenceCard } from '../../ui/ReferenceCard';
import type { BodeWorkerInput, BodeWorkerResponse, BodeWorkerOutput } from './bodeplot.worker';
import { BodePlotChart } from './BodePlotChart';
import { Loader2, AlertCircle } from 'lucide-react';

const bodeSchema = z
  .object({
    filterType: z.enum(['low-pass', 'high-pass']),
    systemType: z.enum(['rc', 'rl']),
    R: z.number({ message: 'Required' }).positive('R must be > 0'),
    C: z.number().positive('C must be > 0').optional(),
    L: z.number().positive('L must be > 0').optional(),
  })
  .refine((data) => (data.systemType === 'rc' ? !!data.C : !!data.L), {
    message: 'Component value is missing for the selected system',
    path: ['systemType'],
  });

type BodeFormValues = z.infer<typeof bodeSchema>;

interface BodePlotVisualizerProps {
  className?: string;
}

export function BodePlotVisualizer({ className = '' }: BodePlotVisualizerProps) {
  // SSR Hydration Safety
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Next-intl
  const t = useTranslations('BodePlot');

  const {
    register,
    watch,
    formState: { errors },
  } = useForm<BodeFormValues>({
    resolver: zodResolver(bodeSchema),
    defaultValues: {
      filterType: 'low-pass',
      systemType: 'rc',
      R: 1000,
      C: 1e-6,
      L: 1,
    },
    mode: 'all',
  });

  const formValues = watch();
  const filterType = formValues.filterType || 'low-pass';
  const systemType = formValues.systemType || 'rc';

  const [plotData, setPlotData] = useState<BodeWorkerOutput | null>(null);
  const [isComputing, setIsComputing] = useState(false);
  const [workerError, setWorkerError] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    if (!isHydrated) return;

    // Initialize worker only on the client
    try {
      workerRef.current = new Worker(new URL('./bodeplot.worker.ts', import.meta.url));

      workerRef.current.onmessage = (e: MessageEvent<BodeWorkerResponse>) => {
        const response = e.data;
        if (response.success) {
          setPlotData(response.data);
          setWorkerError(null);
        } else {
          setPlotData(null);
          setWorkerError(response.error || 'Computation failed');
        }
        setIsComputing(false);
      };

      workerRef.current.onerror = (e) => {
        setPlotData(null);
        setWorkerError('Failed to initialize Web Worker: ' + e.message);
        setIsComputing(false);
      };
    } catch (e: any) {
      setWorkerError('Web Worker not supported or failed to load: ' + e.message);
      setIsComputing(false);
    }

    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, [isHydrated]);

  // Memoize form values to prevent infinite useEffect loops
  const formValuesStr = JSON.stringify(formValues);

  useEffect(() => {
    if (isHydrated && workerRef.current) {
      const parsed = bodeSchema.safeParse(JSON.parse(formValuesStr));
      if (parsed.success) {
        setIsComputing(true);
        setWorkerError(null);
        workerRef.current.postMessage({
          type: parsed.data.filterType,
          R: parsed.data.R,
          C: parsed.data.C,
          L: parsed.data.L,
          points: 500, // Safe point generation dynamically in worker thread
        } as BodeWorkerInput);
      } else {
        setPlotData(null);
      }
    }
  }, [formValuesStr, isHydrated]);

  if (!isHydrated) {
    return (
      <div
        className={`w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex justify-center items-center h-64 ${className}`}
      >
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div
      className={`w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm ${className}`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center shadow-sm border border-blue-200 dark:border-blue-800">
          <span className="text-2xl">📈</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('title')}</h2>
      </div>

      {/* Input Configuration */}
      <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
        <div className="ce-field__control col-span-1 md:col-span-2 lg:col-span-4 flex flex-wrap gap-4 mb-2">
          <select
            {...register('filterType')}
            className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-mono focus:ring-2 focus:ring-blue-100 outline-none text-slate-900 dark:text-slate-100 cursor-pointer"
          >
            <option value="low-pass">{t('lowPass')}</option>
            <option value="high-pass">{t('highPass')}</option>
          </select>

          <select
            {...register('systemType')}
            className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-mono focus:ring-2 focus:ring-blue-100 outline-none text-slate-900 dark:text-slate-100 cursor-pointer"
          >
            <option value="rc">{t('rcCircuit')}</option>
            <option value="rl">{t('rlCircuit')}</option>
          </select>
          {errors.systemType && (
            <span className="text-xs text-red-500 font-medium ml-2 self-center">
              {errors.systemType.message}
            </span>
          )}
        </div>

        <div className="ce-field__control">
          <label className="text-xs font-semibold text-slate-500 mb-1 block">
            {t('resistance')}{' '}
            {errors.R && <span className="text-red-500">- {errors.R.message}</span>}
          </label>
          <input
            type="number"
            step="any"
            {...register('R', { valueAsNumber: true })}
            className={`w-full px-3 py-2 bg-white dark:bg-slate-950 border rounded-lg font-mono focus:ring-2 outline-none text-slate-900 dark:text-slate-100 ${errors.R ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 dark:border-slate-700 focus:ring-blue-100'}`}
          />
        </div>

        {systemType === 'rc' ? (
          <div className="ce-field__control">
            <label className="text-xs font-semibold text-slate-500 mb-1 block">
              {t('capacitance')}{' '}
              {errors.C && <span className="text-red-500">- {errors.C.message}</span>}
            </label>
            <input
              type="number"
              step="any"
              {...register('C', { valueAsNumber: true })}
              className={`w-full px-3 py-2 bg-white dark:bg-slate-950 border rounded-lg font-mono focus:ring-2 outline-none text-slate-900 dark:text-slate-100 ${errors.C ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 dark:border-slate-700 focus:ring-blue-100'}`}
            />
          </div>
        ) : (
          <div className="ce-field__control">
            <label className="text-xs font-semibold text-slate-500 mb-1 block">
              {t('inductance')}{' '}
              {errors.L && <span className="text-red-500">- {errors.L.message}</span>}
            </label>
            <input
              type="number"
              step="any"
              {...register('L', { valueAsNumber: true })}
              className={`w-full px-3 py-2 bg-white dark:bg-slate-950 border rounded-lg font-mono focus:ring-2 outline-none text-slate-900 dark:text-slate-100 ${errors.L ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 dark:border-slate-700 focus:ring-blue-100'}`}
            />
          </div>
        )}

        <div className="ce-field__control flex flex-col justify-end">
          {isComputing ? (
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm py-2">
              <Loader2 className="animate-spin w-4 h-4" />
              <span>{t('computing', { defaultMessage: 'Computing...' })}</span>
            </div>
          ) : plotData && !Object.keys(errors).length ? (
            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-3 py-2 rounded-lg font-mono text-sm border border-blue-100 dark:border-blue-800/50">
              {t('fcLabel')} = {plotData.fc.toFixed(1)} Hz
            </div>
          ) : null}
        </div>
      </form>

      {workerError && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6 border border-red-200 dark:border-red-800/50">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">{workerError}</span>
        </div>
      )}

      {plotData && !isComputing && !workerError && (
        <div className="grid grid-cols-1 gap-6">
          {/* Magnitude Plot */}
          <BodePlotChart
            title={t('magTitle')}
            data={plotData.magnitudes}
            frequencies={plotData.frequencies}
            minY={-40}
            maxY={5}
            ticks={5}
            lineColor="#3b82f6"
            cutoffLabel="-3dB"
          />

          {/* Phase Plot */}
          <BodePlotChart
            title={t('phaseTitle')}
            data={plotData.phases}
            frequencies={plotData.frequencies}
            minY={filterType === 'low-pass' ? -90 : 0}
            maxY={filterType === 'low-pass' ? 0 : 90}
            ticks={4}
            lineColor="#ec4899"
            isPhase={true}
            cutoffLabel="±45°"
          />
        </div>
      )}
      <ReferenceCard referenceKey="ToolReference.bode" />
    </div>
  );
}
