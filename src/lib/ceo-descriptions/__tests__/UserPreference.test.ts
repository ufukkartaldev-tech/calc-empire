/**
 * @file lib/ceo-descriptions/__tests__/UserPreference.test.ts
 * @description Property-based and unit tests for UserPreference service
 * 
 * Tests localStorage persistence, URL parameter support, and conflict resolution logic
 * with priority: URL param > localStorage > default
 * 
 * **Validates: Requirements 2.3**
 * - Requirement 2.3: THE Dashboard SHALL provide a toggle to switch between CEO and technical descriptions
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { 
  UserPreferenceService, 
  UserPreference, 
  PreferenceSource,
  DEFAULT_MODE,
  URL_PARAM_KEY,
  LOCAL_STORAGE_KEY,
  UserPreferenceError,
  StorageError,
  ConflictResolutionError
} from '..';
import type { DescriptionMode } from './DescriptionSelector';

/**
 * Test configuration for property-based tests
 */
const PROPERTY_TEST_CONFIG = {
  numRuns: 50,
  seed: 42,
  verbose: process.env.NODE_ENV === 'test' ? 1 : 0,
  timeout: 5000,
};

/**
 * Custom arbitraries for user preference testing
 */
const UserPreferenceArbitraries = {
  // Description mode arbitrary
  descriptionMode: fc.constantFrom<DescriptionMode>('ceo', 'technical'),
  
  // Preference source arbitrary
  preferenceSource: fc.constantFrom<PreferenceSource>('url-param', 'local-storage', 'default'),
  
  // User preference arbitrary
  userPreference: fc.record({
    mode: fc.constantFrom<DescriptionMode>('ceo', 'technical'),
    timestamp: fc.date(),
    source: fc.constantFrom<PreferenceSource>('url-param', 'local-storage', 'default'),
    sessionId: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
    userId: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  }),
};

describe('UserPreferenceService', () => {
  // Mock window object for localStorage and URL tests
  let mockLocalStorage: Record<string, string>;
  let originalWindow: typeof globalThis.window;
  let originalLocation: Location;
  let originalHistory: History;

  beforeEach(() => {
    // Store original globals
    originalWindow = globalThis.window;
    originalLocation = globalThis.window?.location;
    originalHistory = globalThis.window?.history;

    // Setup mock localStorage
    mockLocalStorage = {};
    Object.defineProperty(globalThis, 'window', {
      value: {
        localStorage: {
          getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
          setItem: vi.fn((key: string, value: string) => {
            mockLocalStorage[key] = value;
          }),
          removeItem: vi.fn((key: string) => {
            delete mockLocalStorage[key];
          }),
          clear: vi.fn(() => {
            mockLocalStorage = {};
          }),
        },
        location: {
          href: 'http://localhost:3000/',
          search: '',
          pathname: '/',
        },
        history: {
          replaceState: vi.fn(),
        },
      },
      writable: true,
    });
  });

  afterEach(() => {
    // Restore original globals
    Object.defineProperty(globalThis, 'window', {
      value: originalWindow,
      writable: true,
    });
    
    if (originalLocation) {
      globalThis.window.location = originalLocation;
    }
    
    if (originalHistory) {
      globalThis.window.history = originalHistory;
    }

    // Clear mocks
    vi.clearAllMocks();
    mockLocalStorage = {};
  });

  describe('Property Tests', () => {
    // Feature: ceo-tool-descriptions, Property: Preference Conflict Resolution
    // Validates: Requirements 2.3 (conflict resolution part)
    it('should resolve preference conflicts with correct priority: URL param > localStorage > default', () => {
      fc.assert(
        fc.property(
          fc.option(UserPreferenceArbitraries.descriptionMode, { nil: null }),
          fc.option(UserPreferenceArbitraries.userPreference, { nil: null }),
          (urlMode, localStoragePref) => {
            // Setup URL parameter
            if (urlMode !== null) {
              const mockSearch = `?${URL_PARAM_KEY}=${urlMode}`;
              (globalThis.window.location.search as any) = mockSearch;
            } else {
              (globalThis.window.location.search as any) = '';
            }

            // Setup localStorage
            if (localStoragePref !== null) {
              mockLocalStorage[LOCAL_STORAGE_KEY] = JSON.stringify({
                ...localStoragePref,
                timestamp: localStoragePref.timestamp.toISOString(),
              });
            } else {
              delete mockLocalStorage[LOCAL_STORAGE_KEY];
            }

            // Get preference
            const preference = UserPreferenceService.getPreference();

            // Property 1: Should always return a valid preference
            expect(preference).toBeDefined();
            expect(preference.mode === 'ceo' || preference.mode === 'technical').toBe(true);
            expect(preference.timestamp).toBeInstanceOf(Date);
            expect(preference.source).toBeDefined();

            // Property 2: Priority resolution
            if (urlMode !== null) {
              // URL param should have highest priority
              expect(preference.mode).toBe(urlMode);
              expect(preference.source).toBe('url-param');
            } else if (localStoragePref !== null) {
              // localStorage should be next priority
              expect(preference.mode).toBe(localStoragePref.mode);
              expect(preference.source).toBe('local-storage');
            } else {
              // Default should be used
              expect(preference.mode).toBe(DEFAULT_MODE);
              expect(preference.source).toBe('default');
            }

            return true;
          }
        ),
        { ...PROPERTY_TEST_CONFIG, numRuns: 30 } // Fewer runs due to setup complexity
      );
    });

    // Feature: ceo-tool-descriptions, Property: Preference Persistence
    // Validates: Requirements 2.3 (persistence part)
    it('should persist preferences to localStorage when requested', () => {
      fc.assert(
        fc.property(
          UserPreferenceArbitraries.descriptionMode,
          UserPreferenceArbitraries.preferenceSource,
          fc.boolean(),
          (mode, source, persist) => {
            // Clear localStorage
            mockLocalStorage = {};

            // Set preference
            const preference = UserPreferenceService.setPreference(mode, source, persist);

            // Property 1: Should return correct preference
            expect(preference.mode).toBe(mode);
            expect(preference.source).toBe(source);
            expect(preference.timestamp).toBeInstanceOf(Date);

            // Property 2: Should persist to localStorage only when requested and source is not URL param
            if (persist && source !== 'url-param') {
              expect(mockLocalStorage[LOCAL_STORAGE_KEY]).toBeDefined();
              
              const stored = JSON.parse(mockLocalStorage[LOCAL_STORAGE_KEY]);
              expect(stored.mode).toBe(mode);
              expect(stored.source).toBe(source);
            } else {
              expect(mockLocalStorage[LOCAL_STORAGE_KEY]).toBeUndefined();
            }

            // Property 3: Should update URL parameter when source is URL param
            if (source === 'url-param') {
              expect(globalThis.window.history.replaceState).toHaveBeenCalled();
            }

            return true;
          }
        ),
        PROPERTY_TEST_CONFIG
      );
    });

    // Feature: ceo-tool-descriptions, Property: URL Parameter Handling
    it('should correctly handle URL parameters for shareable URLs', () => {
      fc.assert(
        fc.property(
          UserPreferenceArbitraries.descriptionMode,
          fc.boolean(),
          (mode, includeInUrl) => {
            // Setup
            const baseUrl = 'http://localhost:3000/dashboard';
            
            // Create shareable URL
            const shareableUrl = UserPreferenceService.createShareableUrl(mode, baseUrl);

            // Property 1: Should return a valid URL
            expect(shareableUrl).toBeDefined();
            expect(typeof shareableUrl).toBe('string');
            expect(shareableUrl).toContain(baseUrl);

            // Property 2: Should include mode parameter when not default
            if (mode === DEFAULT_MODE) {
              expect(shareableUrl).not.toContain(`${URL_PARAM_KEY}=`);
            } else {
              expect(shareableUrl).toContain(`${URL_PARAM_KEY}=${mode}`);
            }

            // Property 3: Should handle invalid base URLs gracefully
            const invalidResult = UserPreferenceService.createShareableUrl(mode, 'not-a-valid-url');
            expect(typeof invalidResult).toBe('string');

            return true;
          }
        ),
        PROPERTY_TEST_CONFIG
      );
    });

    // Feature: ceo-tool-descriptions, Property: Validation and Error Handling
    it('should validate description modes and handle errors gracefully', () => {
      fc.assert(
        fc.property(
          fc.string(),
          (modeString) => {
            // Property 1: isValidMode should correctly identify valid modes
            const isValid = UserPreferenceService.isValidMode(modeString);
            const expectedValid = modeString === 'ceo' || modeString === 'technical';
            expect(isValid).toBe(expectedValid);

            // Property 2: Should handle invalid localStorage data gracefully
            if (Math.random() < 0.5) { // Randomly test with invalid data
              mockLocalStorage[LOCAL_STORAGE_KEY] = 'invalid-json';
              const preference = UserPreferenceService.getPreference();
              
              // Should still return a valid preference (default fallback)
              expect(preference).toBeDefined();
              expect(preference.mode === 'ceo' || preference.mode === 'technical').toBe(true);
              
              // Invalid data should be cleared
              expect(mockLocalStorage[LOCAL_STORAGE_KEY]).toBeUndefined();
            }

            return true;
          }
        ),
        { ...PROPERTY_TEST_CONFIG, numRuns: 30 }
      );
    });
  });

  describe('Unit Tests', () => {
    beforeEach(() => {
      // Clear localStorage before each test
      mockLocalStorage = {};
      (globalThis.window.location.search as any) = '';
    });

    it('should get default preference when no sources have data', () => {
      const preference = UserPreferenceService.getPreference();

      expect(preference.mode).toBe(DEFAULT_MODE);
      expect(preference.source).toBe('default');
      expect(preference.timestamp).toBeInstanceOf(Date);
      expect(preference.sessionId).toBeDefined();
    });

    it('should prioritize URL parameter over localStorage', () => {
      // Setup localStorage preference
      const localStoragePref: UserPreference = {
        mode: 'technical',
        timestamp: new Date(),
        source: 'local-storage',
        sessionId: 'test-session',
      };
      mockLocalStorage[LOCAL_STORAGE_KEY] = JSON.stringify({
        ...localStoragePref,
        timestamp: localStoragePref.timestamp.toISOString(),
      });

      // Setup URL parameter
      (globalThis.window.location.search as any) = `?${URL_PARAM_KEY}=ceo`;

      const preference = UserPreferenceService.getPreference();

      expect(preference.mode).toBe('ceo');
      expect(preference.source).toBe('url-param');
    });

    it('should use localStorage when URL parameter is not present', () => {
      // Setup localStorage preference
      const localStoragePref: UserPreference = {
        mode: 'ceo',
        timestamp: new Date(),
        source: 'local-storage',
        sessionId: 'test-session',
      };
      mockLocalStorage[LOCAL_STORAGE_KEY] = JSON.stringify({
        ...localStoragePref,
        timestamp: localStoragePref.timestamp.toISOString(),
      });

      // No URL parameter
      (globalThis.window.location.search as any) = '';

      const preference = UserPreferenceService.getPreference();

      expect(preference.mode).toBe('ceo');
      expect(preference.source).toBe('local-storage');
    });

    it('should handle invalid URL parameters gracefully', () => {
      // Setup invalid URL parameter
      (globalThis.window.location.search as any) = `?${URL_PARAM_KEY}=invalid`;

      const preference = UserPreferenceService.getPreference();

      expect(preference.mode).toBe(DEFAULT_MODE);
      expect(preference.source).toBe('default');
    });

    it('should set preference and persist to localStorage', () => {
      const mode: DescriptionMode = 'ceo';
      const source: PreferenceSource = 'local-storage';

      const preference = UserPreferenceService.setPreference(mode, source, true);

      expect(preference.mode).toBe(mode);
      expect(preference.source).toBe(source);
      expect(preference.timestamp).toBeInstanceOf(Date);

      // Check localStorage
      expect(mockLocalStorage[LOCAL_STORAGE_KEY]).toBeDefined();
      const stored = JSON.parse(mockLocalStorage[LOCAL_STORAGE_KEY]);
      expect(stored.mode).toBe(mode);
      expect(stored.source).toBe(source);
    });

    it('should set preference without persisting to localStorage when persist=false', () => {
      const mode: DescriptionMode = 'technical';
      const source: PreferenceSource = 'default';

      const preference = UserPreferenceService.setPreference(mode, source, false);

      expect(preference.mode).toBe(mode);
      expect(preference.source).toBe(source);

      // Should not be in localStorage
      expect(mockLocalStorage[LOCAL_STORAGE_KEY]).toBeUndefined();
    });

    it('should update URL parameter when source is url-param', () => {
      const mode: DescriptionMode = 'ceo';
      const source: PreferenceSource = 'url-param';

      UserPreferenceService.setPreference(mode, source, true);

      // Should call history.replaceState
      expect(globalThis.window.history.replaceState).toHaveBeenCalled();
    });

    it('should clear preferences from localStorage', () => {
      // Setup localStorage
      mockLocalStorage[LOCAL_STORAGE_KEY] = 'test-data';
      mockLocalStorage['other-key'] = 'other-data';

      UserPreferenceService.clearPreferences();

      // Should remove only the preference key
      expect(mockLocalStorage[LOCAL_STORAGE_KEY]).toBeUndefined();
      expect(mockLocalStorage['other-key']).toBe('other-data');
    });

    it('should create shareable URLs correctly', () => {
      // Test with CEO mode (not default)
      const ceoUrl = UserPreferenceService.createShareableUrl('ceo');
      expect(ceoUrl).toContain(`${URL_PARAM_KEY}=ceo`);

      // Test with technical mode (default)
      const technicalUrl = UserPreferenceService.createShareableUrl('technical');
      expect(technicalUrl).not.toContain(`${URL_PARAM_KEY}=`);

      // Test with custom base URL
      const customUrl = UserPreferenceService.createShareableUrl('ceo', 'http://example.com/dashboard');
      expect(customUrl).toBe('http://example.com/dashboard?mode=ceo');
    });

    it('should get URL parameter correctly', () => {
      // Test valid parameter
      (globalThis.window.location.search as any) = `?${URL_PARAM_KEY}=ceo`;
      expect(UserPreferenceService.getUrlParameter()).toBe('ceo');

      // Test invalid parameter
      (globalThis.window.location.search as any) = `?${URL_PARAM_KEY}=invalid`;
      expect(UserPreferenceService.getUrlParameter()).toBeNull();

      // Test no parameter
      (globalThis.window.location.search as any) = '';
      expect(UserPreferenceService.getUrlParameter()).toBeNull();

      // Test multiple parameters
      (globalThis.window.location.search as any) = `?other=value&${URL_PARAM_KEY}=technical&another=test`;
      expect(UserPreferenceService.getUrlParameter()).toBe('technical');
    });

    it('should update URL parameter correctly', () => {
      // Set CEO mode
      UserPreferenceService.updateUrlParameter('ceo');
      expect(globalThis.window.history.replaceState).toHaveBeenCalledWith(
        {},
        '',
        expect.stringContaining('mode=ceo')
      );

      // Set technical mode (default) - should remove parameter
      vi.clearAllMocks();
      UserPreferenceService.updateUrlParameter('technical');
      expect(globalThis.window.history.replaceState).toHaveBeenCalledWith(
        {},
        '',
        expect.not.stringContaining('mode=')
      );
    });

    it('should handle stale localStorage preferences', () => {
      // Create stale preference (31 days old)
      const staleDate = new Date();
      staleDate.setDate(staleDate.getDate() - 31);

      const stalePref: UserPreference = {
        mode: 'ceo',
        timestamp: staleDate,
        source: 'local-storage',
        sessionId: 'stale-session',
      };

      mockLocalStorage[LOCAL_STORAGE_KEY] = JSON.stringify({
        ...stalePref,
        timestamp: stalePref.timestamp.toISOString(),
      });

      const preference = UserPreferenceService.getPreference();

      // Should use default (stale preference cleared)
      expect(preference.mode).toBe(DEFAULT_MODE);
      expect(preference.source).toBe('default');
      
      // Stale preference should be cleared
      expect(mockLocalStorage[LOCAL_STORAGE_KEY]).toBeUndefined();
    });

    it('should get preference statistics', () => {
      // Setup
      const localStoragePref: UserPreference = {
        mode: 'ceo',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        source: 'local-storage',
        sessionId: 'test-session',
      };
      mockLocalStorage[LOCAL_STORAGE_KEY] = JSON.stringify({
        ...localStoragePref,
        timestamp: localStoragePref.timestamp.toISOString(),
      });

      (globalThis.window.location.search as any) = `?${URL_PARAM_KEY}=technical`;

      const stats = UserPreferenceService.getPreferenceStats();

      expect(stats.currentMode).toBe('technical'); // URL param has priority
      expect(stats.source).toBe('url-param');
      expect(stats.hasLocalStorage).toBe(true);
      expect(stats.hasUrlParam).toBe(true);
      expect(stats.localStorageAge).toBe(2); // 2 days old
    });

    it('should validate mode strings correctly', () => {
      expect(UserPreferenceService.isValidMode('ceo')).toBe(true);
      expect(UserPreferenceService.isValidMode('technical')).toBe(true);
      expect(UserPreferenceService.isValidMode('CEO')).toBe(false);
      expect(UserPreferenceService.isValidMode('')).toBe(false);
      expect(UserPreferenceService.isValidMode('invalid')).toBe(false);
    });

    it('should migrate old preference format', () => {
      // Setup old format
      mockLocalStorage['description-mode'] = 'ceo';

      UserPreferenceService.migrateOldPreferences();

      // Should migrate to new format
      expect(mockLocalStorage['description-mode']).toBeUndefined();
      expect(mockLocalStorage[LOCAL_STORAGE_KEY]).toBeDefined();
      
      const stored = JSON.parse(mockLocalStorage[LOCAL_STORAGE_KEY]);
      expect(stored.mode).toBe('ceo');
      expect(stored.source).toBe('local-storage');
    });

    it('should initialize and populate localStorage with default if needed', () => {
      // No URL parameter, no localStorage
      (globalThis.window.location.search as any) = '';
      mockLocalStorage = {};

      UserPreferenceService.initialize();

      // Should create default preference in localStorage
      expect(mockLocalStorage[LOCAL_STORAGE_KEY]).toBeDefined();
      
      const stored = JSON.parse(mockLocalStorage[LOCAL_STORAGE_KEY]);
      expect(stored.mode).toBe(DEFAULT_MODE);
      expect(stored.source).toBe('default');
    });

    it('should not overwrite existing preferences during initialization', () => {
      // Setup existing preference
      const existingPref: UserPreference = {
        mode: 'ceo',
        timestamp: new Date(),
        source: 'local-storage',
        sessionId: 'existing-session',
      };
      mockLocalStorage[LOCAL_STORAGE_KEY] = JSON.stringify({
        ...existingPref,
        timestamp: existingPref.timestamp.toISOString(),
      });

      UserPreferenceService.initialize();

      // Should not change existing preference
      const stored = JSON.parse(mockLocalStorage[LOCAL_STORAGE_KEY]);
      expect(stored.mode).toBe('ceo');
      expect(stored.source).toBe('local-storage');
    });

    it('should handle server-side rendering (no window object)', () => {
      // Temporarily remove window
      const tempWindow = globalThis.window;
      delete (globalThis as any).window;

      // Should not throw
      const preference = UserPreferenceService.getPreference();
      expect(preference.mode).toBe(DEFAULT_MODE);
      expect(preference.source).toBe('default');
      expect(preference.sessionId).toBe('server-session');

      // Restore window
      (globalThis as any).window = tempWindow;
    });

    it('should generate session IDs consistently', () => {
      // First call
      const sessionId1 = (UserPreferenceService as any).getSessionId();
      expect(sessionId1).toBeDefined();
      expect(typeof sessionId1).toBe('string');

      // Second call should return same ID (from localStorage)
      const sessionId2 = (UserPreferenceService as any).getSessionId();
      expect(sessionId2).toBe(sessionId1);

      // Clear localStorage and get new ID
      mockLocalStorage = {};
      const sessionId3 = (UserPreferenceService as any).getSessionId();
      expect(sessionId3).toBeDefined();
      expect(sessionId3).not.toBe(sessionId1);
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw
      (globalThis.window.localStorage.setItem as any) = vi.fn(() => {
        throw new Error('Storage quota exceeded');
      });

      // Should not throw, should return preference anyway
      const preference = UserPreferenceService.setPreference('ceo', 'local-storage', true);
      expect(preference.mode).toBe('ceo');
      expect(preference.source).toBe('local-storage');
    });
  });

  describe('Integration Tests', () => {
    it('should integrate with real browser environment', () => {
      // This test would run in a real browser environment
      // For now, we test the integration logic
      
      // Simulate a complete workflow
      const initialPref = UserPreferenceService.getPreference();
      expect(initialPref).toBeDefined();

      // Set a preference
      const setPref = UserPreferenceService.setPreference('ceo', 'local-storage', true);
      expect(setPref.mode).toBe('ceo');

      // Get it back
      const retrievedPref = UserPreferenceService.getPreference();
      expect(retrievedPref.mode).toBe('ceo');
      expect(retrievedPref.source).toBe('local-storage');

      // Create shareable URL
      const shareableUrl = UserPreferenceService.createShareableUrl('ceo');
      expect(shareableUrl).toContain('mode=ceo');

      // Update URL parameter
      UserPreferenceService.updateUrlParameter('technical');
      expect(globalThis.window.history.replaceState).toHaveBeenCalled();

      // Clear preferences
      UserPreferenceService.clearPreferences();
      expect(mockLocalStorage[LOCAL_STORAGE_KEY]).toBeUndefined();
    });

    it('should handle complete conflict resolution scenarios', () => {
      // Scenario 1: URL param conflicts with localStorage
      mockLocalStorage[LOCAL_STORAGE_KEY] = JSON.stringify({
        mode: 'technical',
        timestamp: new Date().toISOString(),
        source: 'local-storage',
        sessionId: 'test-1',
      });
      (globalThis.window.location.search as any) = `?${URL_PARAM_KEY}=ceo`;

      let pref = UserPreferenceService.getPreference();
      expect(pref.mode).toBe('ceo'); // URL param wins
      expect(pref.source).toBe('url-param');

      // Scenario 2: Only localStorage
      (globalThis.window.location.search as any) = '';
      pref = UserPreferenceService.getPreference();
      expect(pref.mode).toBe('technical');
      expect(pref.source).toBe('local-storage');

      // Scenario 3: Neither URL nor localStorage
      mockLocalStorage = {};
      pref = UserPreferenceService.getPreference();
      expect(pref.mode).toBe(DEFAULT_MODE);
      expect(pref.source).toBe('default');
    });

    it('should work with DescriptionSelector integration', () => {
      // This would test integration with the DescriptionSelector service
      // For now, we verify the types and interfaces are compatible
      
      const userPreference: UserPreference = {
        mode: 'ceo',
        timestamp: new Date(),
        source: 'local-storage',
        sessionId: 'test-integration',
      };

      // The mode should be compatible with DescriptionSelector
      const mode: DescriptionMode = userPreference.mode;
      expect(mode).toBe('ceo');

      // Should be able to use with DescriptionSelector
      // (actual integration would be tested in component tests)
      expect(typeof mode).toBe('string');
      expect(mode === 'ceo' || mode === 'technical').toBe(true);
    });
  });
});
