/**
 * @file lib/ceo-descriptions/index.ts
 * @description Exports for CEO Description Selector service
 */

export * from './DescriptionSelector';
export type {
  DescriptionMode,
  DescriptionResult,
  TranslationFunction,
} from './DescriptionSelector';
export { DescriptionSelectorError, MissingTranslationError } from './DescriptionSelector';

export * from './UserPreference';
export type { PreferenceSource, UserPreference, PreferenceStorage } from './UserPreference';
export { UserPreferenceError, StorageError, ConflictResolutionError } from './UserPreference';
export { URL_PARAM_KEY, LOCAL_STORAGE_KEY, DEFAULT_MODE } from './UserPreference';
