/**
 * @file types/calculator.ts
 * @description Calculator type definitions for CalcEmpire
 */

// ─────────────────────────────────────────────────────────────────────────────
// Unit Types
// ─────────────────────────────────────────────────────────────────────────────

/** A selectable unit option shown in the field's dropdown. */
export interface UnitOption {
  /** Human-readable label displayed in the dropdown (e.g. "kΩ", "mA"). */
  label: string;
  /** Symbol used internally (e.g. "k", "m"). */
  symbol: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Field Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single input field in the calculator.
 * The user fills in all but one field; the "unknown" quantity that
 * the calculator solves for.
 */
export interface CalculatorField {
  /** Stable machine key used as the HTML `id` and internal state key. */
  key: string;
  /** i18n key for the field label. */
  labelKey: string;
  /** i18n key for the placeholder text. Optional. */
  placeholderKey?: string;
  /** Available unit options for this field. */
  units: UnitOption[];
}

/**
 * The value a user enters for a field, including the selected unit.
 * `null` means the user left the field blank (i.e. this is the unknown).
 */
export interface FieldValue {
  value: number | null;
  unit: string;
}

/** The complete set of field values submitted for calculation. */
export type FieldValues = Record<string, FieldValue>;

/** The computed results returned by a solver function. */
export type SolveResult = Record<string, number>;

/** A solver function that takes field values and returns computed results. */
export type SolveFn = (values: FieldValues) => SolveResult;

// ─────────────────────────────────────────────────────────────────────────────
// Calculator Config
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A calculator configuration object that defines:
 * - The UI structure (fields, visual)
 * - The calculation logic (solverKey)
 * - Metadata (title, description)
 * - Optional guide content (guideKey)
 */
export interface CalculatorConfig {
  /** Unique slug used for analytics, routing, and HTML landmark ids. */
  id: string;
  /** i18n key for the calculator title. */
  titleKey: string;
  /** i18n key for the calculator description. */
  descriptionKey: string;
  /** Optional SVG or React element to visualize the calculator. */
  visual?: React.ReactNode;
  /** Input fields the user must fill. */
  fields: CalculatorField[];
  /** Key to look up the solver function in SOLVER_REGISTRY. */
  solverKey: string;
  /** Optional i18n key for the guide content. */
  guideKey?: string;
}
