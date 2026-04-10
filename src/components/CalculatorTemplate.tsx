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

import React, { useCallback, useId, useReducer, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Big from 'big.js';
import type { CalculatorConfig, FieldValue, FieldValues, TranslationKey } from '@/types';
import { SOLVER_REGISTRY, ASYNC_SOLVER_REGISTRY } from '@/lib/calculators/registry';
import { solverWorkerManager } from '@/lib/workers/solverWorkerManager';
import { ReferenceCard } from './ui/ReferenceCard';
import { CalculatorError } from './ui/CalculatorError';
import { ErrorHandler, type ErrorDisplayInfo, ErrorSeverity } from '@/lib/errors/errorHandler';
import { Zap, Loader2 } from 'lucide-react';
import { debounce } from '@/lib/utils/debounce';

// ─────────────────────────────────────────────────────────────────────────────
// Internal State
// ─────────────────────────────────────────────────────────────────────────────

interface FieldState {
  raw: string;
  unit: string;
}

type FormState = Record<string, FieldState>;
type ResultState = Record<string, unknown> | null;

interface State {
  fields: FormState;
  result: ResultState;
  error: ErrorDisplayInfo | null;
}

type Action =
  | { type: 'SET_VALUE'; key: string; raw: string }
  | { type: 'SET_UNIT'; key: string; unit: string }
  | { type: 'SET_RESULT'; result: ResultState; error: ErrorDisplayInfo | null }
  | { type: 'HYDRATE'; payload: State }
  | { type: 'RESET'; fields: FormState };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'HYDRATE':
      return {
        ...state,
        ...action.payload,
        fields: {
          ...state.fields,
          ...action.payload.fields,
        },
      };
    case 'SET_VALUE':
      return {
        ...state,
        fields: {
          ...state.fields,
          [action.key]: { ...state.fields[action.key], raw: action.raw },
        },
        result: null,
        error: null,
      };
    case 'SET_UNIT':
      return {
        ...state,
        fields: {
          ...state.fields,
          [action.key]: { ...state.fields[action.key], unit: action.unit },
        },
        result: null,
        error: null,
      };
    case 'SET_RESULT':
      return { ...state, result: action.result, error: action.error };
    case 'RESET':
      return { fields: action.fields, result: null, error: null };
    default:
      return state;
  }
}

function buildInitialState(config: CalculatorConfig): State {
  const fields: FormState = {};
  for (const field of config.fields) {
    fields[field.key] = { raw: '', unit: field.units[0].symbol };
  }
  return { fields, result: null, error: null };
}

const STORAGE_PREFIX = 'calc-state-';

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

interface CalculatorTemplateProps {
  config: CalculatorConfig;
}

export default function CalculatorTemplate({ config }: CalculatorTemplateProps) {
  const t = useTranslations();
  const uid = useId();

  const [state, dispatch] = useReducer(reducer, config, buildInitialState);
  const [isHydrated, setIsHydrated] = React.useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load state from localStorage on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}${config.solverKey}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'HYDRATE', payload: parsed });
      }
    } catch (err) {
      console.error('Failed to load calculator state', err);
    } finally {
      setIsHydrated(true);
    }
  }, [config.solverKey]);

  // Save state to localStorage on changes (debounced to prevent excessive writes)
  useEffect(() => {
    if (!isHydrated) return;

    // Create debounced save function (500ms delay)
    const debouncedSave = debounce(() => {
      localStorage.setItem(`${STORAGE_PREFIX}${config.solverKey}`, JSON.stringify(state));
    }, 500);

    debouncedSave();

    // Cleanup function to cancel pending saves on unmount
    return () => {
      debouncedSave();
    };
  }, [state, config.solverKey, isHydrated]);

  const handleSolve = useCallback(async () => {
    const values: FieldValues = {};
    for (const field of config.fields) {
      const fs = state.fields[field.key];
      const val = fs.raw.trim();

      if (val === '') {
        values[field.key] = { value: null, unit: fs.unit };
      } else {
        try {
          const parsed = new Big(val).toNumber();
          values[field.key] = { value: parsed, unit: fs.unit };
        } catch {
          values[field.key] = { value: null, unit: fs.unit };
        }
      }
    }

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
      dispatch({ type: 'SET_RESULT', result: null, error: errorInfo });
      return;
    }

    try {
      // Check if this solver should use Web Worker (async execution)
      const isAsync = solverWorkerManager.isAsyncSolver(config.solverKey);
      
      if (isAsync) {
        // Use async solver with Web Worker
        setIsLoading(true);
        const asyncSolve = ASYNC_SOLVER_REGISTRY[config.solverKey];
        if (!asyncSolve) throw new Error(`Async solver not found: ${config.solverKey}`);
        
        const result = await asyncSolve(values);
        dispatch({ type: 'SET_RESULT', result, error: null });
      } else {
        // Use synchronous solver
        const solve = SOLVER_REGISTRY[config.solverKey];
        if (!solve) throw new Error(`Solver not found: ${config.solverKey}`);

        const result = solve(values);
        dispatch({ type: 'SET_RESULT', result, error: null });
      }
    } catch (err) {
      // Use ErrorHandler to process the error and get display info
      const errorInfo = ErrorHandler.handleFormulaError(err, {
        calculatorId: config.solverKey,
        inputValues: values,
      });
      dispatch({
        type: 'SET_RESULT',
        result: null,
        error: errorInfo,
      });
    } finally {
      setIsLoading(false);
    }
  }, [config, state.fields, t]);

  const handleReset = useCallback(() => {
    dispatch({ type: 'RESET', fields: buildInitialState(config).fields });
  }, [config]);

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
            {config.fields.map((field) => {
              const fs = state.fields[field.key];
              const isResult = state.result?.[field.key] !== undefined;

              return (
                <div key={field.key} className="space-y-2">
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
                      value={isResult ? formatResult(state.result![field.key]) : fs.raw}
                      onChange={(e) =>
                        dispatch({ type: 'SET_VALUE', key: field.key, raw: e.target.value })
                      }
                      onKeyDown={(e) => e.key === 'Enter' && handleSolve()}
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
                        onChange={(e) =>
                          dispatch({ type: 'SET_UNIT', key: field.key, unit: e.target.value })
                        }
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
            })}
          </div>

          <CalculatorError 
            errorInfo={state.error} 
            onDismiss={() => dispatch({ type: 'SET_RESULT', result: null, error: null })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={handleSolve}
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
              onClick={handleReset}
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
