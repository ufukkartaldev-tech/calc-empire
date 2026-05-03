/**
 * @file lib/ceo-descriptions/UserPreference.ts
 * @description Service for managing user preferences for description mode persistence
 *
 * Implements localStorage persistence, URL parameter support, and preference conflict resolution
 * with priority: URL param > localStorage > default
 *
 * **Validates: Requirements 2.3**
 * - Requirement 2.3: THE Dashboard SHALL provide a toggle to switch between CEO and technical descriptions
 */

import type { DescriptionMode } from './DescriptionSelector';

/**
 * Source of a preference setting
 */
export type PreferenceSource = 'url-param' | 'local-storage' | 'default';

/**
 * User preference for description mode
 */
export interface UserPreference {
  mode: DescriptionMode;
  timestamp: Date;
  source: PreferenceSource;
  sessionId?: string; // For anonymous session tracking
  userId?: string; // For logged-in users (future enhancement)
}

/**
 * Storage strategy for preferences
 */
export interface PreferenceStorage {
  localStorage: UserPreference | null; // For browser persistence
  urlParam: DescriptionMode | null; // For shareable URLs
  defaultMode: DescriptionMode; // System default
}

/**
 * URL parameter key for description mode
 */
export const URL_PARAM_KEY = 'mode';

/**
 * Local storage key for user preference
 */
export const LOCAL_STORAGE_KEY = 'calc-empire-description-mode';

/**
 * Default description mode
 */
export const DEFAULT_MODE: DescriptionMode = 'technical';

/**
 * Error types for user preference management
 */
export class UserPreferenceError extends Error {
  constructor(
    message: string,
    public readonly source: PreferenceSource
  ) {
    super(message);
    this.name = 'UserPreferenceError';
  }
}

export class StorageError extends UserPreferenceError {
  constructor(
    message: string,
    source: PreferenceSource,
    public readonly storageType: 'localStorage' | 'url'
  ) {
    super(message, source);
    this.name = 'StorageError';
  }
}

export class ConflictResolutionError extends UserPreferenceError {
  constructor(
    message: string,
    source: PreferenceSource,
    public readonly conflictingSources: PreferenceSource[]
  ) {
    super(message, source);
    this.name = 'ConflictResolutionError';
  }
}

/**
 * Service for managing user preferences for description mode
 */
export class UserPreferenceService {
  /**
   * Gets the current user preference with conflict resolution
   * Priority: URL param > localStorage > default
   *
   * @returns The resolved user preference
   *
   * @throws {StorageError} When storage operations fail
   * @throws {ConflictResolutionError} When conflicts cannot be resolved
   */
  static getPreference(): UserPreference {
    try {
      // Get preferences from all sources
      const storage = this.getPreferenceStorage();

      // Resolve conflicts using priority: URL param > localStorage > default
      return this.resolvePreferenceConflict(storage);
    } catch (error) {
      // If any error occurs, fall back to default mode
      console.error('Error getting user preference:', error);
      return this.createDefaultPreference();
    }
  }

  /**
   * Sets the user preference and persists it to appropriate storage
   *
   * @param mode - The description mode to set
   * @param source - The source of the preference change
   * @param persist - Whether to persist to localStorage (default: true)
   *
   * @returns The updated user preference
   *
   * @throws {StorageError} When localStorage operations fail
   */
  static setPreference(
    mode: DescriptionMode,
    source: PreferenceSource,
    persist: boolean = true
  ): UserPreference {
    const preference: UserPreference = {
      mode,
      timestamp: new Date(),
      source,
      sessionId: this.getSessionId(),
    };

    try {
      // Persist to localStorage if requested and source is not URL param
      if (persist && source !== 'url-param') {
        this.saveToLocalStorage(preference);
      }

      // Update URL parameter if source is URL param
      if (source === 'url-param') {
        this.updateUrlParameter(mode);
      }

      return preference;
    } catch (error) {
      console.error('Error setting user preference:', error);
      // Return preference anyway - persistence failure shouldn't prevent UI from working
      return preference;
    }
  }

  /**
   * Clears all user preferences (localStorage only)
   * URL parameters are not cleared as they are part of the URL
   */
  static clearPreferences(): void {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error clearing preferences:', error);
      // Don't throw - clearing is best effort
    }
  }

  /**
   * Gets the current URL parameter for description mode
   *
   * @returns The description mode from URL parameter, or null if not present/invalid
   */
  static getUrlParameter(): DescriptionMode | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const params = new URLSearchParams(window.location.search);
      const modeParam = params.get(URL_PARAM_KEY);

      if (modeParam === 'ceo' || modeParam === 'technical') {
        return modeParam as DescriptionMode;
      }

      return null;
    } catch (error) {
      console.error('Error reading URL parameter:', error);
      return null;
    }
  }

  /**
   * Updates the URL parameter for description mode
   * Uses history.replaceState to avoid page reload
   *
   * @param mode - The description mode to set in URL
   */
  static updateUrlParameter(mode: DescriptionMode): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const url = new URL(window.location.href);
      const params = new URLSearchParams(url.search);

      if (mode === DEFAULT_MODE) {
        // Remove parameter if it's the default
        params.delete(URL_PARAM_KEY);
      } else {
        params.set(URL_PARAM_KEY, mode);
      }

      // Update URL without reloading page
      const newUrl = `${url.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
      window.history.replaceState({}, '', newUrl);
    } catch (error) {
      console.error('Error updating URL parameter:', error);
      // Don't throw - URL updates are best effort
    }
  }

  /**
   * Creates a shareable URL with the specified description mode
   *
   * @param mode - The description mode to include in URL
   * @param baseUrl - The base URL (defaults to current URL without params)
   * @returns Shareable URL with mode parameter
   */
  static createShareableUrl(mode: DescriptionMode, baseUrl?: string): string {
    try {
      const url = new URL(baseUrl || window.location.href);
      const params = new URLSearchParams(url.search);

      if (mode === DEFAULT_MODE) {
        params.delete(URL_PARAM_KEY);
      } else {
        params.set(URL_PARAM_KEY, mode);
      }

      url.search = params.toString();
      return url.toString();
    } catch (error) {
      console.error('Error creating shareable URL:', error);
      // Fallback to current URL
      return window.location.href;
    }
  }

  /**
   * Gets preferences from all storage sources
   *
   * @returns Object containing preferences from all sources
   */
  private static getPreferenceStorage(): PreferenceStorage {
    return {
      localStorage: this.getLocalStoragePreference(),
      urlParam: this.getUrlParameter(),
      defaultMode: DEFAULT_MODE,
    };
  }

  /**
   * Gets preference from localStorage
   *
   * @returns User preference from localStorage, or null if not present/invalid
   */
  private static getLocalStoragePreference(): UserPreference | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!stored) {
        return null;
      }

      const parsed = JSON.parse(stored);

      // Validate the parsed object
      if (
        parsed &&
        typeof parsed === 'object' &&
        (parsed.mode === 'ceo' || parsed.mode === 'technical') &&
        parsed.timestamp &&
        parsed.source
      ) {
        return {
          ...parsed,
          timestamp: new Date(parsed.timestamp),
        };
      }

      // Invalid data - clear it
      window.localStorage.removeItem(LOCAL_STORAGE_KEY);
      return null;
    } catch (error) {
      console.error('Error reading localStorage preference:', error);
      // Clear corrupted data
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
      return null;
    }
  }

  /**
   * Saves preference to localStorage
   *
   * @param preference - The preference to save
   *
   * @throws {StorageError} When localStorage operations fail
   */
  private static saveToLocalStorage(preference: UserPreference): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const serialized = JSON.stringify({
        ...preference,
        timestamp: preference.timestamp.toISOString(),
      });
      window.localStorage.setItem(LOCAL_STORAGE_KEY, serialized);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      throw new StorageError(
        `Failed to save to localStorage: ${error}`,
        preference.source,
        'localStorage'
      );
    }
  }

  /**
   * Resolves conflicts between preference sources
   * Priority: URL param > localStorage > default
   *
   * @param storage - Preferences from all sources
   * @returns The resolved user preference
   *
   * @throws {ConflictResolutionError} When conflicts cannot be resolved
   */
  private static resolvePreferenceConflict(storage: PreferenceStorage): UserPreference {
    const conflicts: PreferenceSource[] = [];

    // Check URL parameter first (highest priority)
    if (storage.urlParam !== null) {
      return {
        mode: storage.urlParam,
        timestamp: new Date(),
        source: 'url-param',
        sessionId: this.getSessionId(),
      };
    }

    // Check localStorage next
    if (storage.localStorage !== null) {
      // Check if localStorage preference is stale (older than 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      if (storage.localStorage.timestamp > thirtyDaysAgo) {
        return storage.localStorage;
      } else {
        // Stale preference - clear it and use default
        this.clearPreferences();
        conflicts.push('local-storage');
      }
    }

    // Use default mode
    return this.createDefaultPreference();
  }

  /**
   * Creates a default preference object
   */
  private static createDefaultPreference(): UserPreference {
    return {
      mode: DEFAULT_MODE,
      timestamp: new Date(),
      source: 'default',
      sessionId: this.getSessionId(),
    };
  }

  /**
   * Generates a session ID for anonymous session tracking
   * Uses localStorage to persist session ID across page refreshes
   */
  private static getSessionId(): string {
    if (typeof window === 'undefined') {
      return 'server-session';
    }

    try {
      const sessionKey = 'calc-empire-session-id';
      let sessionId = window.localStorage.getItem(sessionKey);

      if (!sessionId) {
        // Generate a new session ID
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        window.localStorage.setItem(sessionKey, sessionId);
      }

      return sessionId;
    } catch (error) {
      console.error('Error generating session ID:', error);
      return `fallback_${Date.now()}`;
    }
  }

  /**
   * Gets statistics about preference usage
   * Useful for analytics and debugging
   */
  static getPreferenceStats(): {
    currentMode: DescriptionMode;
    source: PreferenceSource;
    hasLocalStorage: boolean;
    hasUrlParam: boolean;
    localStorageAge: number | null; // Days since localStorage was updated
  } {
    const preference = this.getPreference();
    const storage = this.getPreferenceStorage();

    let localStorageAge: number | null = null;
    if (storage.localStorage) {
      const ageMs = Date.now() - storage.localStorage.timestamp.getTime();
      localStorageAge = Math.floor(ageMs / (1000 * 60 * 60 * 24)); // Convert to days
    }

    return {
      currentMode: preference.mode,
      source: preference.source,
      hasLocalStorage: storage.localStorage !== null,
      hasUrlParam: storage.urlParam !== null,
      localStorageAge,
    };
  }

  /**
   * Validates a description mode string
   *
   * @param mode - The mode string to validate
   * @returns True if valid description mode
   */
  static isValidMode(mode: string): mode is DescriptionMode {
    return mode === 'ceo' || mode === 'technical';
  }

  /**
   * Migrates old preference formats to new format
   * Handles backward compatibility
   */
  static migrateOldPreferences(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      // Check for old format (just mode string)
      const oldKey = 'description-mode';
      const oldValue = window.localStorage.getItem(oldKey);

      if (oldValue && (oldValue === 'ceo' || oldValue === 'technical')) {
        // Migrate to new format
        const newPreference: UserPreference = {
          mode: oldValue as DescriptionMode,
          timestamp: new Date(),
          source: 'local-storage',
          sessionId: this.getSessionId(),
        };

        this.saveToLocalStorage(newPreference);
        window.localStorage.removeItem(oldKey);
      }
    } catch (error) {
      console.error('Error migrating old preferences:', error);
      // Don't throw - migration is best effort
    }
  }

  /**
   * Initializes the preference service
   * Should be called on app startup
   */
  static initialize(): void {
    // Migrate any old preferences
    this.migrateOldPreferences();

    // Get initial preference to ensure localStorage is populated if needed
    const preference = this.getPreference();

    // If preference came from default source and we're not in a URL param context,
    // save it to localStorage for future sessions
    if (preference.source === 'default' && this.getUrlParameter() === null) {
      this.saveToLocalStorage(preference);
    }
  }
}
