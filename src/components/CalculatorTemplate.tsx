'use client';

/**
 * @file CalculatorTemplate.tsx
 * @description
 * The universal calculator UI shell for CalcEmpire.
 *
 * Renders any `CalculatorConfig` as a fully functional, accessible
 * input-dropdown-result panel. Business logic lives entirely in the config's
 * `solve` function — this component is purely presentational + stateful UI.
 *
 * Uses Zustand calculatorStore for state management with automatic localStorage
 * persistence via persist middleware.
 *
 * Usage:
 * ```tsx
 * import CalculatorTemplate from '@/components/CalculatorTemplate';
 * import { ohmConfig } from '@/lib/calculators/ohm';
 *
 * export default function OhmPage() {
 *   return <CalculatorTemplate config={ohmConfig} />;
 * }
 * ```
 */

import React, { useCallback, useId, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Big from 'big.js';
import type { CalculatorConfig, FieldValues, TranslationKey } from '@/types';
import { SOLVER_REGISTRY, ASYNC_SOLVER_REGISTRY } from '@/lib/calculators/registry';
import { solverWorkerManager } from '@/lib/workers/solverWorkerManager';
import { ReferenceCard } from './ui/ReferenceCard';
import { CalculatorError } from './ui/CalculatorError';
import { ErrorHandler, type ErrorDisplayInfo, ErrorSeverity } from '@/lib/errors/errorHandler';
import { Zap, Loader2 } from 'lucide-react';
import {
  useCalculatorStore,
  useCalculatorData,
  useCalculatorHydrated,
  parseFieldValues,
  type CalculatorData,
} from '@/stores/calculatorStore';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface CalculatorTemplateState extends Omit<CalculatorData, 'lastAccessed'> {
  error: ErrorDisplayInfo | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

interface CalculatorTemplateProps {
  config: CalculatorConfig;
}

export default function CalculatorTemplate({ config }: CalculatorTemplateProps) {
  const t = useTranslations();
  const uid = useId();
  const calculatorKey = config.solverKey;

  // Zustand store integration
  const isHydrated = useCalculatorHydrated();
  const calculatorData = useCalculatorData(calculatorKey);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorDisplayInfo | null>(null);

  // Initialize calculator in store on mount, cleanup on unmount
  useEffect(() => {
    const store = useCalculatorStore.getState();
    store.initializeCalculator(calculatorKey, config);

    return () => {
      store.cleanupCalculator(calculatorKey);
    };
  }, [calculatorKey, config]);

  // Get state with fallback
  const state: CalculatorTemplateState = calculatorData
    ? { ...calculatorData, error }
    : {
        fields: {},
        result: null,
        error,
      };

  const handleSolve = useCallback(async () => {
    if (!calculatorData) return;

    const values: FieldValues = parseFieldValues(calculatorData.fields, config);

    const filledCount = Object.values(values).filter((v) => v.value !== null).length;
    const totalFields = config.fields.length;
    const unknownCount = totalFields - filledCount;

    if (unknownCount !== 1) {
      const msg =
        unknownCount === 0
          ? t('CalculatorTemplate.errorAllFilled')
          : t('CalculatorTemplate.errorTooManyUnknowns');
      const errorInfo: ErrorDisplayInfo = {
        message: msg,
        severity: ErrorSeverity.LOW,
        isUserError: true,
      };
      setError(errorInfo);
      useCalculatorStore.getState().clearResult(calculatorKey);
      return;
    }

    setError(null);

    try {
      // Check if this solver should use Web Worker (async execution)
      const isAsync = solverWorkerManager.isAsyncSolver(calculatorKey);

      if (isAsync) {
        // Use async solver with Web Worker
        setIsLoading(true);
        const asyncSolve = ASYNC_SOLVER_REGISTRY[calculatorKey];
        if (!asyncSolve) throw new Error(`Async solver not found: ${calculatorKey}`);

        const result = await asyncSolve(values);
        useCalculatorStore.getState().setResult(calculatorKey, result);
      } else {
        // Use synchronous solver
        const solve = SOLVER_REGISTRY[calculatorKey];
        if (!solve) throw new Error(`Solver not found: ${calculatorKey}`);

        const result = solve(values);
        useCalculatorStore.getState().setResult(calculatorKey, result);
      }
    } catch (err) {
      // Use ErrorHandler to process the error and get display info
      const errorInfo = ErrorHandler.handleFormulaError(err, {
        calculatorId: calculatorKey,
        inputValues: values,
      });
      setError(errorInfo);
      useCalculatorStore.getState().clearResult(calculatorKey);
    } finally {
      setIsLoading(false);
    }
  }, [config, calculatorData, calculatorKey, t]);

  const handleReset = useCallback(() => {
    useCalculatorStore.getState().resetCalculator(calculatorKey, config);
    setError(null);
  }, [calculatorKey, config]);

  // Prevent hydration mismatch
  if (!isHydrated) {
    return (
      <div className="w-full bento-card overflow-hidden">
        <div className="flex items-center justify-center p-16">
          <Loader2 size={24} className="animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <CalculatorTemplateContent
      config={config}
      calculatorKey={calculatorKey}
      state={state}
      isLoading={isLoading}
      error={error}
      uid={uid}
      t={t}
      onSolve={handleSolve}
      onReset={handleReset}
      onDismissError={() => setError(null)}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components (for render optimization)
// ─────────────────────────────────────────────────────────────────────────────

interface CalculatorTemplateContentProps {
  config: CalculatorConfig;
  calculatorKey: string;
  state: CalculatorTemplateState;
  isLoading: boolean;
  error: ErrorDisplayInfo | null;
  uid: string;
  t: (key: string) => string;
  onSolve: () => void;
  onReset: () => void;
  onDismissError: () => void;
}

function CalculatorTemplateContent({
  config,
  calculatorKey,
  state,
  isLoading,
  error,
  t,
  onSolve,
  onReset,
  onDismissError,
}: CalculatorTemplateContentProps) {
  return (
    <div className="w-full bento-card overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        {/* Visual Section & Info */}
        <div className="lg:w-1/3 bg-slate-900/50 p-8 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col items-center justify-center gap-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-white mb-2 tracking-tight">
              {t(config.titleKey as TranslationKey)}
            </h2>
            <div className="h-[1px] w-8 bg-blue-600 mx-auto mb-4"></div>
            <p className="text-xs text-slate-400 leading-relaxed font-medium px-4">
              {t(config.descriptionKey as TranslationKey)}
            </p>
          </div>

          <div className="w-full max-w-[200px] aspect-square flex items-center justify-center p-4 bg-slate-950 rounded-xl border border-slate-800/50 relative overflow-hidden group">
            {config.visual ? (
              <div className="relative z-10 w-full h-full flex items-center justify-center">
                {typeof config.visual === 'function' ? (
                  <config.visual fields={state.fields} result={state.result} />
                ) : (
                  <div className="text-6xl">{config.visual}</div>
                )}
              </div>
            ) : (
              <div className="text-6xl">📐</div>
            )}
          </div>
        </div>

        {/* Form Section */}
        <div className="lg:w-2/3 p-8">
          <div className="grid grid-cols-1 gap-6 mb-8">
            {config.fields.map((field) => (
              <CalculatorField
                key={field.key}
                calculatorKey={calculatorKey}
                field={field}
                t={t}
                onSolve={onSolve}
              />
            ))}
          </div>

          <CalculatorError errorInfo={error} onDismiss={onDismissError} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={onSolve}
              disabled={isLoading}
              className="sm:col-span-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
            >
              {isLoading ? (
                <Loader2 size={14} strokeWidth={2.5} className="animate-spin" />
              ) : (
                <Zap size={14} strokeWidth={2.5} />
              )}
              {isLoading ? 'Calculating...' : t('CalculatorTemplate.solveButton')}
            </button>
            <button
              onClick={onReset}
              disabled={isLoading}
              className="bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:cursor-not-allowed text-slate-300 font-bold py-3.5 rounded-md transition-all active:scale-[0.98] uppercase tracking-widest text-xs"
            >
              {t('CalculatorTemplate.resetButton')}
            </button>
          </div>
        </div>
      </div>

      {config.referenceKey && (
        <div className="px-10 md:px-14 pb-10 md:pb-14 border-t border-slate-200/50 dark:border-slate-800/50 pt-10">
          <ReferenceCard referenceKey={config.referenceKey} />
        </div>
      )}
    </div>
  );
}

// Individual field component - only re-renders when its own state changes
interface CalculatorFieldProps {
  calculatorKey: string;
  field: CalculatorConfig['fields'][number];
  t: (key: string) => string;
  onSolve: () => void;
}

function CalculatorField({ calculatorKey, field, t, onSolve }: CalculatorFieldProps) {
  const fieldState = useCalculatorStore(
    (state) => state.calculators.get(calculatorKey)?.fields[field.key]
  );
  const result = useCalculatorStore((state) => state.calculators.get(calculatorKey)?.result);

  const fs = fieldState ?? { raw: '', unit: field.units[0].symbol };
  const isResult = result?.[field.key] !== undefined;

  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      useCalculatorStore.getState().setFieldValue(calculatorKey, field.key, e.target.value);
    },
    [calculatorKey, field.key]
  );

  const handleUnitChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      useCalculatorStore.getState().setFieldUnit(calculatorKey, field.key, e.target.value);
    },
    [calculatorKey, field.key]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') onSolve();
    },
    [onSolve]
  );

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-1">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          {t(field.labelKey as TranslationKey)}
        </label>
        {isResult && (
          <span className="text-[9px] text-blue-500 font-bold uppercase tracking-wider">
            {t('CalculatorTemplate.calculatedBadge')}
          </span>
        )}
      </div>

      <div className="relative flex items-center">
        <input
          type="number"
          step="any"
          value={isResult ? formatResult(result![field.key]) : fs.raw}
          onChange={handleValueChange}
          onKeyDown={handleKeyDown}
          placeholder={
            isResult
              ? ''
              : field.placeholderKey
                ? t(field.placeholderKey as TranslationKey)
                : t('CalculatorTemplate.leaveBlankHint')
          }
          className={`eng-input !font-geist-mono ${
            isResult ? 'border-blue-600 bg-blue-600/5 text-blue-400 font-bold' : ''
          }`}
          readOnly={isResult}
        />
        <div className="absolute right-0 flex items-center h-full">
          <select
            value={fs.unit}
            onChange={handleUnitChange}
            className="eng-select h-full rounded-r-lg pr-4 pl-3"
          >
            {field.units.map((u) => (
              <option key={u.symbol} value={u.symbol} className="bg-slate-900">
                {u.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

/** Precision formatting using Big.js */
function formatResult(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;

  if (typeof value === 'number') {
    if (value === 0) return '0';
    try {
      const b = new Big(value);
      // If it's very small or very large, use scientific notation
      if (Math.abs(value) < 0.0001 || Math.abs(value) > 1000000) {
        return b.toExponential(4);
      }
      // Otherwise, round to 6 decimal places and remove trailing zeros
      return parseFloat(b.toFixed(6)).toString();
    } catch {
      return value.toString();
    }
  }

  return String(value);
}
