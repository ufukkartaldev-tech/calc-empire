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
import type { CalculatorConfig, FieldValues, TranslationKey, ToolId } from '@/types';
import { SOLVER_REGISTRY, ASYNC_SOLVER_REGISTRY } from '@/lib/calculators/registry';
import { solverWorkerManager } from '@/lib/workers/solverWorkerManager';
import { ReferenceCard } from './ui/ReferenceCard';
import { CalculatorError } from './ui/CalculatorError';
import { ErrorHandler, type ErrorDisplayInfo, ErrorSeverity } from '@/lib/errors/errorHandler';
import { Zap, Loader2 } from 'lucide-react';
import { CalculatorHeader } from './calculators/layout/CalculatorHeader';
import { CalculatorActions } from './calculators/layout/CalculatorActions';
import { CalculatorResults } from './calculators/layout/CalculatorResults';
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
  const calculatorKey = config.solverKey as ToolId;

  // Zustand store integration
  const isHydrated = useCalculatorHydrated();
  const calculatorData = useCalculatorData(calculatorKey);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorDisplayInfo | null>(null);

  // Initialize calculator in store on mount
  useEffect(() => {
    const store = useCalculatorStore.getState();
    store.initializeCalculator(calculatorKey, config);
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

    const calculationMode = config.calculationMode || 'solveUnknown';
    const filledCount = Object.values(values).filter((v) => v.value !== null).length;
    const totalFields = config.fields.length;
    const unknownCount = totalFields - filledCount;

    if (calculationMode === 'solveUnknown' && unknownCount !== 1) {
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

    if (calculationMode === 'calculateAll' && unknownCount > 0) {
      const errorInfo: ErrorDisplayInfo = {
        message: t('CalculatorTemplate.errorMissingInputs'),
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
  calculatorKey: ToolId;
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
        <CalculatorHeader config={config} state={state} t={t} />

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

          {/* Separate Results Display */}
          <CalculatorResults config={config} result={state.result} t={t} />

          <CalculatorError errorInfo={error} onDismiss={onDismissError} />

          <CalculatorActions isLoading={isLoading} onSolve={onSolve} onReset={onReset} t={t} />
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
  calculatorKey: ToolId;
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

  const handleSelectChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
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

  const isSelect = field.type === 'select';

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
        {isSelect ? (
          <select
            value={fs.raw}
            onChange={handleSelectChange}
            className={`eng-input !font-geist-mono w-full ${
              isResult ? 'border-blue-600 bg-blue-600/5 text-blue-400 font-bold' : ''
            }`}
            disabled={isResult}
          >
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-slate-900">
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
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
        )}
        {field.units.length > 0 && (
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
        )}
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
