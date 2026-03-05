/**
 * @file calculator.ts
 * @description
 * Core type definitions for the CalcEmpire calculator template system.
 * Every calculator in the application is driven by a `CalculatorConfig` object,
 * which declaratively describes its fields, units, and solve function.
 *
 * Adding a new calculator = writing a config object. No extra UI code required.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Field & Unit Definitions
// ─────────────────────────────────────────────────────────────────────────────

/** A selectable unit option shown in the field's dropdown. */
export interface UnitOption {
    /** Human-readable label displayed in the dropdown (e.g. "kΩ", "mA"). */
    label: string;
    /** Short symbol used as the unit identifier in calculations (e.g. "k", "m"). */
    symbol: string;
}

/**
 * Describes a single input field in the calculator.
 *
 * A field can be left empty by the user, in which case it becomes
 * the "unknown" quantity that the calculator solves for.
 */
export interface CalculatorField {
    /** Stable machine key used as the HTML `id` and internal state key. */
    key: string;
    /** i18n translation key resolved via `useTranslations`. */
    labelKey: string;
    /** Ordered list of selectable units. The first entry is the default. */
    units: UnitOption[];
    /** Optional placeholder shown inside the empty input. */
    placeholderKey?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Solve Function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Value submitted to the solve function for each field.
 * `null` means the user left the field blank (i.e. this is the unknown).
 */
export interface FieldValue {
    value: number | null;
    unit: string;
}

/**
 * A map from field key → submitted value.
 * The solve function consumes this and returns the computed results.
 */
export type FieldValues = Record<string, FieldValue>;

/**
 * A map from field key → computed result (always a plain SI number).
 * Return only the fields you have computed; leave unknown fields absent.
 */
export type SolveResult = Record<string, number>;

/**
 * The pure calculation function provided by each calculator config.
 *
 * @param values - Current field values (null = user-left-blank / unknown).
 * @returns       Computed values keyed by field key, or throws on invalid input.
 */
export type SolveFn = (values: FieldValues) => SolveResult;

// ─────────────────────────────────────────────────────────────────────────────
// Calculator Configuration
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The single source of truth for a calculator's identity and behaviour.
 * Pass this to `<CalculatorTemplate>` to render a fully functional calculator.
 *
 * @example
 * ```ts
 * const ohmConfig: CalculatorConfig = {
 *   id: 'ohm-law',
 *   titleKey: 'OhmCalculator.title',
 *   descriptionKey: 'OhmCalculator.description',
 *   fields: [ voltageField, currentField, resistanceField ],
 *   solve: ohmSolveFn,
 * };
 * ```
 */
export interface CalculatorConfig {
    /** Unique slug used for analytics, routing, and HTML landmark ids. */
    id: string;
    /** i18n key for the calculator's display title. */
    titleKey: string;
    /** i18n key for the short description shown below the title. */
    descriptionKey: string;
    /** Ordered list of input fields rendered by the template. */
    fields: CalculatorField[];
    /**
     * Pure solve function.
     * Must throw an `Error` with a human-readable message on invalid input.
     */
    solve: SolveFn;
}
