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
import type { CalculatorConfig, FieldValue, FieldValues } from '@/types/calculator';
import { SOLVER_REGISTRY } from '@/lib/calculators/registry';

// ─────────────────────────────────────────────────────────────────────────────
// Internal State
// ─────────────────────────────────────────────────────────────────────────────

interface FieldState {
    raw: string;       // raw string in the <input>
    unit: string;      // currently selected unit symbol
}

type FormState = Record<string, FieldState>;
type ResultState = Record<string, number> | null;

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

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

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
    const uid = useId();                        // collision-safe HTML id namespace

    const [state, dispatch] = useReducer(reducer, config, buildInitialState);

    // ── Solve ─────────────────────────────────────────────────────────────────

    const handleSolve = useCallback(() => {
        // Build the values map; blank fields become null (= unknown)
        const values: FieldValues = {};
        for (const field of config.fields) {
            const fs = state.fields[field.key];
            const parsed = parseFloat(fs.raw);
            values[field.key] = {
                value: fs.raw.trim() === '' ? null : isNaN(parsed) ? null : parsed,
                unit: fs.unit,
            };
        }

        // Count knowns — need exactly (n-1) filled for 1 unknown
        const filledCount = Object.values(values).filter(v => v.value !== null).length;
        const totalFields = config.fields.length;
        const unknownCount = totalFields - filledCount;

        if (unknownCount !== 1) {
            const msgKey =
                unknownCount === 0 ? 'CalculatorTemplate.errorAllFilled'
                    : 'CalculatorTemplate.errorTooManyUnknowns';
            dispatch({ type: 'SET_RESULT', result: null, error: t(msgKey) });
            return;
        }

        try {
            const solve = SOLVER_REGISTRY[config.solverKey];
            if (!solve) {
                throw new Error(`Solver not found for key: ${config.solverKey}`);
            }
            const result = solve(values);
            dispatch({ type: 'SET_RESULT', result, error: null });
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            dispatch({ type: 'SET_RESULT', result: null, error: message });
        }
    }, [config, state.fields, t]);

    // ── Reset ─────────────────────────────────────────────────────────────────

    const handleReset = useCallback(() => {
        const fields: FormState = {};
        for (const field of config.fields) {
            fields[field.key] = { raw: '', unit: field.units[0].symbol };
        }
        dispatch({ type: 'RESET', fields });
    }, [config]);

    // ── Keyboard shortcut: Enter → Solve ─────────────────────────────────────

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') handleSolve();
        },
        [handleSolve],
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────

    const sectionId = `calc-${uid}-section`;

    return (
        <section
            id={sectionId}
            className="ce-calculator"
            aria-label={t(config.titleKey)}
        >
            {/* ── Header ── */}
            <header className="ce-calculator__header">
                <h2 className="ce-calculator__title">{t(config.titleKey)}</h2>
                <p className="ce-calculator__description">{t(config.descriptionKey)}</p>
            </header>

            {/* ── Fields ── */}
            <div className="ce-calculator__fields" role="group" aria-label={t('CalculatorTemplate.fieldsLabel')}>
                {config.fields.map(field => {
                    const inputId = `${uid}-${field.key}-input`;
                    const selectId = `${uid}-${field.key}-unit`;
                    const fs = state.fields[field.key];
                    const isResult = state.result !== null && state.result[field.key] !== undefined;

                    return (
                        <div key={field.key} className={`ce-field${isResult ? ' ce-field--result' : ''}`}>
                            <label htmlFor={inputId} className="ce-field__label">
                                {t(field.labelKey)}
                            </label>

                            <div className="ce-field__control">
                                <input
                                    id={inputId}
                                    type="number"
                                    className="ce-field__input"
                                    value={
                                        isResult
                                            ? formatResult(state.result![field.key])
                                            : fs.raw
                                    }
                                    onChange={e =>
                                        dispatch({ type: 'SET_VALUE', key: field.key, raw: e.target.value })
                                    }
                                    onKeyDown={handleKeyDown}
                                    placeholder={
                                        field.placeholderKey
                                            ? t(field.placeholderKey)
                                            : t('CalculatorTemplate.leaveBlankHint')
                                    }
                                    aria-label={t(field.labelKey)}
                                    readOnly={isResult}
                                />

                                <select
                                    id={selectId}
                                    className="ce-field__unit"
                                    value={fs.unit}
                                    onChange={e =>
                                        dispatch({ type: 'SET_UNIT', key: field.key, unit: e.target.value })
                                    }
                                    aria-label={`${t(field.labelKey)} ${t('CalculatorTemplate.unitLabel')}`}
                                >
                                    {field.units.map(u => (
                                        <option key={u.symbol} value={u.symbol}>
                                            {u.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {isResult && (
                                <span className="ce-field__badge" aria-live="polite">
                                    {t('CalculatorTemplate.calculatedBadge')}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ── Error ── */}
            {state.error && (
                <div className="ce-calculator__error" role="alert">
                    {state.error}
                </div>
            )}

            {/* ── Actions ── */}
            <div className="ce-calculator__actions">
                <button
                    id={`${uid}-solve-btn`}
                    className="ce-btn ce-btn--primary"
                    onClick={handleSolve}
                    aria-describedby={sectionId}
                >
                    {t('CalculatorTemplate.solveButton')}
                </button>
                <button
                    id={`${uid}-reset-btn`}
                    className="ce-btn ce-btn--ghost"
                    onClick={handleReset}
                >
                    {t('CalculatorTemplate.resetButton')}
                </button>
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Formats a raw SI number for display, using up to 6 significant digits.
 * e.g. 0.002 → "0.002", 1000000 → "1000000"
 */
function formatResult(value: number): string {
    return parseFloat(value.toPrecision(6)).toString();
}
