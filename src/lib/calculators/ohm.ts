/**
 * @file ohm.ts
 * @description
 * CalculatorConfig implementation for Ohm's Law (V = I × R).
 *
 * This file is the REFERENCE IMPLEMENTATION for adding new calculators.
 * To add a new calculator:
 *   1. Copy this file to `src/lib/calculators/<name>.ts`
 *   2. Define your fields and units.
 *   3. Implement a `solve` function using the project's formula library.
 *   4. Export a `<Name>Config` constant.
 *   5. Render it with `<CalculatorTemplate config={yourConfig} />`.
 */

import type { CalculatorConfig, FieldValues, SolveResult } from '@/types/calculator';
import { ohm as ohmFormula } from '@/lib/formulas';

// ─────────────────────────────────────────────────────────────────────────────
// Unit Multipliers (shared across many electrical calculators)
// ─────────────────────────────────────────────────────────────────────────────

const VOLTAGE_UNITS = [
    { label: 'V', symbol: '' },
    { label: 'mV', symbol: 'm' },
    { label: 'kV', symbol: 'k' },
];

const CURRENT_UNITS = [
    { label: 'A', symbol: '' },
    { label: 'mA', symbol: 'm' },
    { label: 'μA', symbol: 'u' },
];

const RESISTANCE_UNITS = [
    { label: 'Ω', symbol: '' },
    { label: 'kΩ', symbol: 'k' },
    { label: 'MΩ', symbol: 'M' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Solve Function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Adapts the generic `FieldValues` structure to the typed `ohmFormula` API.
 * If a field's `value` is null it is omitted, marking it as the unknown.
 */
function solve(values: FieldValues): SolveResult {
    const toUnitValue = (key: string) => {
        const fv = values[key];
        if (fv.value === null) return undefined;
        return fv.unit ? { value: fv.value, unit: fv.unit } : fv.value;
    };

    const result = ohmFormula({
        voltage: toUnitValue('voltage'),
        current: toUnitValue('current'),
        resistance: toUnitValue('resistance'),
    });

    const out: SolveResult = {};
    if (result.voltage !== undefined) out['voltage'] = result.voltage;
    if (result.current !== undefined) out['current'] = result.current;
    if (result.resistance !== undefined) out['resistance'] = result.resistance;
    return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Config Export
// ─────────────────────────────────────────────────────────────────────────────

export const ohmConfig: CalculatorConfig = {
    id: 'ohm-law',
    titleKey: 'OhmCalculator.title',
    descriptionKey: 'OhmCalculator.description',
    fields: [
        {
            key: 'voltage',
            labelKey: 'OhmCalculator.voltage',
            placeholderKey: 'OhmCalculator.voltagePlaceholder',
            units: VOLTAGE_UNITS,
        },
        {
            key: 'current',
            labelKey: 'OhmCalculator.current',
            placeholderKey: 'OhmCalculator.currentPlaceholder',
            units: CURRENT_UNITS,
        },
        {
            key: 'resistance',
            labelKey: 'OhmCalculator.resistance',
            placeholderKey: 'OhmCalculator.resistancePlaceholder',
            units: RESISTANCE_UNITS,
        },
    ],
    solve,
};
