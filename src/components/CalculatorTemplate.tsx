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

import React, { useCallback, useId, useReducer } from 'react';
import { useTranslations } from 'next-intl';
import Big from 'big.js';
import type { CalculatorConfig, FieldValue, FieldValues } from '@/types';
import { SOLVER_REGISTRY } from '@/lib/calculators/registry';

// ─────────────────────────────────────────────────────────────────────────────
// Internal State
// ─────────────────────────────────────────────────────────────────────────────

interface FieldState {
  raw: string;
  unit: string;
}

type FormState = Record<string, FieldState>;
type ResultState = Record<string, any> | null;

interface State {
  fields: FormState;
  result: ResultState;
  error: string | null;
}

type Action =
  | { type: 'SET_VALUE'; key: string; raw: string }
  | { type: 'SET_UNIT'; key: string; unit: string }
  | { type: 'SET_RESULT'; result: ResultState; error: string | null }
  | { type: 'RESET'; fields: FormState };

function reducer(state: State, action: Action): State {
  switch (action.type) {
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

  const handleSolve = useCallback(() => {
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
      dispatch({ type: 'SET_RESULT', result: null, error: msg });
      return;
    }

    try {
      const solve = SOLVER_REGISTRY[config.solverKey];
      if (!solve) throw new Error(`Solver not found: ${config.solverKey}`);

      const result = solve(values);
      dispatch({ type: 'SET_RESULT', result, error: null });
    } catch (err) {
      dispatch({
        type: 'SET_RESULT',
        result: null,
        error: err instanceof Error ? err.message : t('CalculatorTemplate.errorGeneric'),
      });
    }
  }, [config, state.fields, t]);

  const handleReset = useCallback(() => {
    dispatch({ type: 'RESET', fields: buildInitialState(config).fields });
  }, [config]);

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col lg:flex-row">
        {/* Visual Section & Info */}
        <div className="lg:w-1/3 bg-slate-50 dark:bg-slate-950 p-8 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-8">
          <div className="text-center">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
              {t(config.titleKey as any)}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed italic">
              {t(config.descriptionKey as any)}
            </p>
          </div>

          {config.visual ? (
            <div className="w-full max-w-[200px] aspect-square flex items-center justify-center p-4 bg-white dark:bg-slate-900 rounded-3xl shadow-inner border border-slate-200 dark:border-slate-800">
              {config.visual}
            </div>
          ) : (
            <div className="w-full max-w-[200px] aspect-square flex items-center justify-center p-4 bg-white dark:bg-slate-900 rounded-3xl shadow-inner border border-slate-200 dark:border-slate-800 text-6xl">
              📐
            </div>
          )}
        </div>

        {/* Form Section */}
        <div className="lg:w-2/3 p-8 md:p-12">
          <div className="grid grid-cols-1 gap-8 mb-10">
            {config.fields.map((field) => {
              const fs = state.fields[field.key];
              const isResult = state.result?.[field.key] !== undefined;

              return (
                <div key={field.key} className="space-y-2 group">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      {t(field.labelKey as any)}
                    </label>
                    {isResult && (
                      <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold">
                        {t('CalculatorTemplate.calculatedBadge')}
                      </span>
                    )}
                  </div>

                  <div
                    className={`relative flex items-center transition-all ${isResult ? 'ring-4 ring-blue-500/10' : ''}`}
                  >
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
                            ? t(field.placeholderKey as any)
                            : t('CalculatorTemplate.leaveBlankHint')
                      }
                      className={`eng-input pr-24 ${isResult ? 'border-blue-500/50 bg-blue-50/30 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-black' : ''}`}
                      readOnly={isResult}
                    />
                    <div className="absolute right-0 flex items-center h-full">
                      <select
                        value={fs.unit}
                        onChange={(e) =>
                          dispatch({ type: 'SET_UNIT', key: field.key, unit: e.target.value })
                        }
                        className="eng-select h-full rounded-r-2xl pr-4 pl-3"
                      >
                        {field.units.map((u) => (
                          <option key={u.symbol} value={u.symbol}>
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

          {state.error && (
            <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-3 animate-in shake">
              <span>❌</span> {state.error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleSolve}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>⚡</span> {t('CalculatorTemplate.solveButton')}
            </button>
            <button
              onClick={handleReset}
              className="px-8 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-2xl transition-all"
            >
              {t('CalculatorTemplate.resetButton')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Precision formatting using Big.js */
function formatResult(value: any): string {
  if (typeof value === 'string') return value;
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
