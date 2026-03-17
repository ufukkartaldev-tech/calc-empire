/**
 * @file types/index.ts
 * @description Central type definitions for CalcEmpire
 */

// ─────────────────────────────────────────────────────────────────────────────
// Calculator Types
// ─────────────────────────────────────────────────────────────────────────────

export interface FieldValue {
  value: number | null;
  unit: string;
}

export type FieldValues = Record<string, FieldValue>;
export type SolveResult = Record<string, unknown>;
export type SolveFn = (values: FieldValues) => SolveResult;

export interface UnitOption {
  label: string;
  symbol: string;
}

export interface FieldConfig {
  key: string;
  labelKey: string;
  placeholderKey?: string;
  units: UnitOption[];
  constraints?: {
    min?: number;
    max?: number;
    allowZero?: boolean;
    allowNegative?: boolean;
  };
}

export interface CalculatorVisualProps {
  fields: Record<string, { raw: string; unit: string }>;
  result: Record<string, unknown> | null;
}

export interface CalculatorConfig {
  id: string;
  titleKey: string;
  descriptionKey: string;
  visual?: React.ReactNode | React.ComponentType<CalculatorVisualProps>;
  fields: FieldConfig[];
  solverKey: string;
  referenceKey?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool Configuration Types
// ─────────────────────────────────────────────────────────────────────────────

export type ToolId =
  | 'ohm'
  | 'resistor'
  | 'kirchhoff'
  | 'power'
  | 'bode'
  | 'beam'
  | 'stressStrain'
  | 'shearMoment'
  | 'concreteSection'
  | 'soilMechanics'
  | 'baseConverter'
  | 'cronParser'
  | 'jsonFormatter'
  | 'periodicTable'
  | 'idealGas'
  | 'bernoulli'
  | 'pressureLoss'
  | 'normal'
  | 'basicStats'
  | 'discreteDist'
  | 'dataViz'
  | 'calculus'
  | 'matrix'
  | 'geometry'
  | 'functionPlot'
  | 'compoundInterest'
  | 'cryptoPnl'
  | 'unitConverter'
  | null;

export type CategoryKey =
  | 'electrical'
  | 'software'
  | 'finance'
  | 'civil'
  | 'mechanical'
  | 'chemistry'
  | 'fluid'
  | 'statistics'
  | 'mathematics'
  | 'converters';

export interface ToolConfig {
  id: Exclude<ToolId, null>;
  titleKey: string;
  descKey: string;
  catKey: CategoryKey;
  icon: string;
  features?: {
    shareableUrl?: boolean;
    pdfExport?: boolean;
  };
  isPopular?: boolean;
}

export interface SearchableTool extends ToolConfig {
  translatedTitle: string;
  translatedDesc: string;
  translatedCat: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// UI Component Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SidebarProps {
  activeCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export interface ToolRendererProps {
  activeTool: ToolId;
}

// ─────────────────────────────────────────────────────────────────────────────
// Locale Types
// ─────────────────────────────────────────────────────────────────────────────

export type LocaleCode =
  | 'en'
  | 'tr'
  | 'ru'
  | 'hi'
  | 'ja'
  | 'es'
  | 'fr'
  | 'de'
  | 'it'
  | 'pt'
  | 'nl'
  | 'pl'
  | 'zh'
  | 'ar'
  | 'ko'
  | 'id';

export interface LocaleOption {
  code: LocaleCode;
  label: string;
  country: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Structured Data Types
// ─────────────────────────────────────────────────────────────────────────────

export interface WebsiteSchema {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  url: string;
  inLanguage: string[];
  potentialAction: {
    '@type': string;
    target: string;
    'query-input': string;
  };
}

export interface OrganizationSchema {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  logo: string;
  sameAs: string[];
  contactPoint: {
    '@type': string;
    email: string;
    contactType: string;
  };
}

export interface WebApplicationSchema {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
  operatingSystem: string;
  offers: {
    '@type': string;
    price: string;
    priceCurrency: string;
  };
  aggregateRating?: {
    '@type': string;
    ratingValue: string;
    ratingCount: string;
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Shareable URL Types
// ─────────────────────────────────────────────────────────────────────────────

export interface UrlEncodedState {
  [key: string]: string;
}

export interface UrlStateOptions {
  maxLength?: number;
  debounceMs?: number;
  precision?: number;
}

export interface UrlValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF Export Types
// ─────────────────────────────────────────────────────────────────────────────

export interface PdfCalculatorData {
  calculatorId: string;
  calculatorName: string;
  timestamp: Date;
  locale: LocaleCode;
  inputs: PdfFieldData[];
  outputs: PdfFieldData[];
  formulas?: string[];
}

export interface PdfFieldData {
  label: string;
  value: number | string;
  unit?: string;
}

export interface PdfGenerationOptions {
  filename?: string;
  includeFormulas?: boolean;
  includeTimestamp?: boolean;
  includeDisclaimer?: boolean;
}

export interface PdfGenerationResult {
  success: boolean;
  filename?: string;
  error?: string;
  fileSizeBytes?: number;
}
