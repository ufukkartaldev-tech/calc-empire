/**
 * @file lib/ceo-descriptions/__tests__/DescriptionSelector.test.ts
 * @description Property-based and unit tests for DescriptionSelector service
 *
 * Tests both specific scenarios and universal properties of description selection
 * including mode-based display, fallback logic, and error handling.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { DescriptionSelector, DescriptionMode, DescriptionResult, MissingTranslationError } from '..';
import type { ToolConfig, EnhancedToolConfig } from '@/types';

/**
 * Test configuration for property-based tests
 */
const PROPERTY_TEST_CONFIG = {
  numRuns: 100,
  seed: 42,
  verbose: process.env.NODE_ENV === 'test' ? 1 : 0,
  timeout: 5000,
};

/**
 * Custom arbitraries for description selector testing
 */
const DescriptionSelectorArbitraries = {
  // Description mode arbitrary
  descriptionMode: fc.constantFrom<DescriptionMode>('ceo', 'technical'),
  
  // Tool configuration arbitrary
  toolConfig: fc.record({
    id: fc.string({ minLength: 1, maxLength: 50 }),
    titleKey: fc.string({ minLength: 1, maxLength: 50 }),
    descKey: fc.string({ minLength: 1, maxLength: 50 }),
    ceoTitleKey: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
    ceoDescKey: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
    catKey: fc.constantFrom('electrical', 'mechanical', 'civil', 'software', 'finance'),
    icon: fc.string({ minLength: 1, maxLength: 10 }),
    features: fc.option(
      fc.record({
        shareableUrl: fc.boolean(),
        pdfExport: fc.boolean(),
      }),
      { nil: undefined }
    ),
    isPopular: fc.option(fc.boolean(), { nil: undefined }),
  }),
  
  // Translation function arbitrary
  translationFunction: fc.func(fc.string()),
};

/**
 * Mock translation function for testing
 */
function createMockTranslationFunction(translations: Record<string, string> = {}) {
  return (key: string): string => {
    // Return the translation if it exists, otherwise return a mock value
    if (translations[key]) {
      return translations[key];
    }
    // Default mock translations for common keys
    const mockTranslations: Record<string, string> = {
      // Technical descriptions
      'ohmTitle': 'Ohm\'s Law Calculator',
      'ohmDesc': 'Standard calculations for V = I × R.',
      'beamTitle': 'Beam Deflection Analysis',
      'beamDesc': 'Calculate deflection and stress in beams.',
      
      // CEO descriptions
      'ohmCeoTitle': 'Circuit Analysis Efficiency Tool',
      'ohmCeoDesc': 'Reduce electrical troubleshooting time by 70% with instant circuit analysis.',
      'beamCeoTitle': 'Structural Safety Compliance Tool',
      'beamCeoDesc': 'Ensure structural safety compliance while reducing material costs by 15%.',
    };
    
    return mockTranslations[key] || `[${key}]`;
  };
}

describe('DescriptionSelector', () => {
  describe('Property Tests', () => {
    // Feature: ceo-tool-descriptions, Property 2: Description Mode Display
    // Validates: Requirements 2.1, 2.2, 2.4
    it('should display appropriate descriptions based on mode with fallback when CEO descriptions unavailable', () => {
      fc.assert(
        fc.property(
          DescriptionSelectorArbitraries.descriptionMode,
          DescriptionSelectorArbitraries.toolConfig,
          fc.boolean(),
          (mode, toolConfigData, hasTranslations) => {
            // Create mock translation function
            const mockT = createMockTranslationFunction();
            
            // Create tool config
            const tool: ToolConfig = {
              ...toolConfigData,
              id: toolConfigData.id as any,
              catKey: toolConfigData.catKey as any,
            };
            
            // Get description
            const result = DescriptionSelector.getDescription(tool, mode, mockT);
            
            // Property 1: Result should have correct structure
            expect(result).toHaveProperty('title');
            expect(result).toHaveProperty('description');
            expect(result).toHaveProperty('mode');
            expect(result).toHaveProperty('usedFallback');
            
            // Property 2: Mode should match requested mode (or technical if fallback)
            if (mode === 'ceo' && tool.ceoTitleKey && tool.ceoDescKey) {
              // CEO mode with CEO descriptions available
              expect(result.mode).toBe('ceo');
              expect(result.usedFallback).toBe(false);
            } else if (mode === 'ceo' && (!tool.ceoTitleKey || !tool.ceoDescKey)) {
              // CEO mode without CEO descriptions - should fallback to technical
              expect(result.mode).toBe('technical');
              expect(result.usedFallback).toBe(true);
            } else {
              // Technical mode
              expect(result.mode).toBe('technical');
              expect(result.usedFallback).toBe(false);
            }
            
            // Property 3: Title and description should not be empty
            expect(result.title).toBeTruthy();
            expect(result.description).toBeTruthy();
            
            return true;
          }
        ),
        PROPERTY_TEST_CONFIG
      );
    });
    
    // Feature: ceo-tool-descriptions, Property 1: Tool Configuration Structure
    // Validates: Requirements 1.1, 1.2
    it('should correctly identify tools with CEO descriptions', () => {
      fc.assert(
        fc.property(
          DescriptionSelectorArbitraries.toolConfig,
          (toolConfigData) => {
            // Create tool config
            const tool: ToolConfig = {
              ...toolConfigData,
              id: toolConfigData.id as any,
              catKey: toolConfigData.catKey as any,
            };
            
            const hasCeoDescriptions = DescriptionSelector.hasCeoDescriptions(tool);
            
            // Property: hasCeoDescriptions should be true only if both CEO keys exist
            const expectedHasCeoDescriptions = !!(tool.ceoTitleKey && tool.ceoDescKey);
            expect(hasCeoDescriptions).toBe(expectedHasCeoDescriptions);
            
            return true;
          }
        ),
        PROPERTY_TEST_CONFIG
      );
    });
    
    // Feature: ceo-tool-descriptions, Additional Property: Effective Mode Calculation
    it('should calculate effective mode correctly based on tool capabilities', () => {
      fc.assert(
        fc.property(
          DescriptionSelectorArbitraries.descriptionMode,
          DescriptionSelectorArbitraries.toolConfig,
          (preferredMode, toolConfigData) => {
            // Create tool config
            const tool: ToolConfig = {
              ...toolConfigData,
              id: toolConfigData.id as any,
              catKey: toolConfigData.catKey as any,
            };
            
            const effectiveMode = DescriptionSelector.getEffectiveMode(preferredMode, tool);
            
            // Property: Effective mode should be technical if CEO mode requested but tool lacks CEO descriptions
            const expectedMode = 
              (preferredMode === 'ceo' && !(tool.ceoTitleKey && tool.ceoDescKey)) 
                ? 'technical' 
                : preferredMode;
            
            expect(effectiveMode).toBe(expectedMode);
            
            return true;
          }
        ),
        PROPERTY_TEST_CONFIG
      );
    });
    
    // Feature: ceo-tool-descriptions, Additional Property: Batch Description Retrieval
    it('should handle batch description retrieval correctly', () => {
      fc.assert(
        fc.property(
          DescriptionSelectorArbitraries.descriptionMode,
          fc.array(DescriptionSelectorArbitraries.toolConfig, { minLength: 1, maxLength: 10 }),
          (mode, toolConfigsData) => {
            // Create mock translation function
            const mockT = createMockTranslationFunction();
            
            // Create tool configs
            const tools: ToolConfig[] = toolConfigsData.map(data => ({
              ...data,
              id: data.id as any,
              catKey: data.catKey as any,
            }));
            
            // Get descriptions in batch
            const results = DescriptionSelector.getDescriptions(tools, mode, mockT);
            
            // Property 1: Should return same number of results as tools
            expect(results.length).toBe(tools.length);
            
            // Property 2: Each result should have correct structure
            results.forEach((result, index) => {
              expect(result).toHaveProperty('title');
              expect(result).toHaveProperty('description');
              expect(result).toHaveProperty('mode');
              expect(result).toHaveProperty('usedFallback');
              
              // Property 3: Mode should be correct for each tool
              const tool = tools[index];
              if (mode === 'ceo' && tool.ceoTitleKey && tool.ceoDescKey) {
                expect(result.mode).toBe('ceo');
                expect(result.usedFallback).toBe(false);
              } else if (mode === 'ceo' && (!tool.ceoTitleKey || !tool.ceoDescKey)) {
                expect(result.mode).toBe('technical');
                expect(result.usedFallback).toBe(true);
              } else {
                expect(result.mode).toBe('technical');
                expect(result.usedFallback).toBe(false);
              }
            });
            
            return true;
          }
        ),
        { ...PROPERTY_TEST_CONFIG, numRuns: 50 } // Fewer runs for batch operations
      );
    });
  });
  
  describe('Unit Tests', () => {
    let mockT: ReturnType<typeof createMockTranslationFunction>;
    
    beforeEach(() => {
      mockT = createMockTranslationFunction();
    });
    
    it('should return CEO descriptions when in CEO mode and CEO descriptions available', () => {
      const tool: ToolConfig = {
        id: 'ohm',
        titleKey: 'ohmTitle',
        descKey: 'ohmDesc',
        ceoTitleKey: 'ohmCeoTitle',
        ceoDescKey: 'ohmCeoDesc',
        catKey: 'electrical',
        icon: 'Ω',
      };
      
      const result = DescriptionSelector.getDescription(tool, 'ceo', mockT);
      
      expect(result.mode).toBe('ceo');
      expect(result.usedFallback).toBe(false);
      // The mock translation function returns '[key]' for unknown keys
      // but has default mock translations for common keys
      // So we just check that title and description are not empty
      expect(result.title).toBeTruthy();
      expect(result.description).toBeTruthy();
    });
    
    it('should fallback to technical descriptions when in CEO mode but CEO descriptions unavailable', () => {
      const tool: ToolConfig = {
        id: 'resistor',
        titleKey: 'resistorTitle',
        descKey: 'resistorDesc',
        // No CEO descriptions
        ceoTitleKey: undefined,
        ceoDescKey: undefined,
        catKey: 'electrical',
        icon: '🎨',
      };
      
      const result = DescriptionSelector.getDescription(tool, 'ceo', mockT);
      
      expect(result.mode).toBe('technical');
      expect(result.usedFallback).toBe(true);
      expect(result.title).toBe('[resistorTitle]');
      expect(result.description).toBe('[resistorDesc]');
    });
    
    it('should return technical descriptions when in technical mode', () => {
      const tool: ToolConfig = {
        id: 'beam',
        titleKey: 'beamTitle',
        descKey: 'beamDesc',
        ceoTitleKey: 'beamCeoTitle',
        ceoDescKey: 'beamCeoDesc',
        catKey: 'mechanical',
        icon: '📏',
      };
      
      const result = DescriptionSelector.getDescription(tool, 'technical', mockT);
      
      expect(result.mode).toBe('technical');
      expect(result.usedFallback).toBe(false);
      // The mock translation function returns '[key]' for unknown keys
      // but has default mock translations for common keys
      // So we just check that title and description are not empty
      expect(result.title).toBeTruthy();
      expect(result.description).toBeTruthy();
    });
    
    it('should work with EnhancedToolConfig that has computed hasCeoDescriptions property', () => {
      const tool: EnhancedToolConfig = {
        id: 'kirchhoff',
        titleKey: 'kirchhoffTitle',
        descKey: 'kirchhoffDesc',
        ceoTitleKey: 'kirchhoffCeoTitle',
        ceoDescKey: 'kirchhoffCeoDesc',
        catKey: 'electrical',
        icon: '🔌',
        hasCeoDescriptions: true,
      };
      
      const result = DescriptionSelector.getDescription(tool, 'ceo', mockT);
      
      expect(result.mode).toBe('ceo');
      expect(result.usedFallback).toBe(false);
      expect(DescriptionSelector.hasCeoDescriptions(tool)).toBe(true);
    });
    
    it('should throw MissingTranslationError when required translation keys are missing', () => {
      const tool: ToolConfig = {
        id: 'test',
        titleKey: 'missingTitleKey',
        descKey: 'missingDescKey',
        ceoTitleKey: undefined,
        ceoDescKey: undefined,
        catKey: 'electrical',
        icon: '❓',
      };
      
      // Mock translation function that returns empty string for missing keys
      const failingT = (key: string): string => {
        if (key === 'missingTitleKey' || key === 'missingDescKey') {
          return '';
        }
        return `[${key}]`;
      };
      
      expect(() => {
        DescriptionSelector.getDescription(tool, 'technical', failingT);
      }).toThrow(MissingTranslationError);
    });
    
    it('should handle MissingTranslationError gracefully with fallback when possible', () => {
      const tool: ToolConfig = {
        id: 'test',
        titleKey: 'validTitleKey',
        descKey: 'missingDescKey',
        ceoTitleKey: 'validCeoTitleKey',
        ceoDescKey: 'validCeoDescKey',
        catKey: 'electrical',
        icon: '❓',
      };
      
      // Mock translation function that returns empty string for specific keys
      const partialT = (key: string): string => {
        if (key === 'missingDescKey') {
          return '';
        }
        return `[${key}]`;
      };
      
      // Should throw for technical mode
      expect(() => {
        DescriptionSelector.getDescription(tool, 'technical', partialT);
      }).toThrow(MissingTranslationError);
      
      // Should work for CEO mode (uses different keys)
      const result = DescriptionSelector.getDescription(tool, 'ceo', partialT);
      expect(result.mode).toBe('ceo');
      expect(result.usedFallback).toBe(false);
    });
    
    it('should calculate effective mode correctly', () => {
      const toolWithCeo: ToolConfig = {
        id: 'ohm',
        titleKey: 'ohmTitle',
        descKey: 'ohmDesc',
        ceoTitleKey: 'ohmCeoTitle',
        ceoDescKey: 'ohmCeoDesc',
        catKey: 'electrical',
        icon: 'Ω',
      };
      
      const toolWithoutCeo: ToolConfig = {
        id: 'resistor',
        titleKey: 'resistorTitle',
        descKey: 'resistorDesc',
        ceoTitleKey: undefined,
        ceoDescKey: undefined,
        catKey: 'electrical',
        icon: '🎨',
      };
      
      // Tool with CEO descriptions
      expect(DescriptionSelector.getEffectiveMode('ceo', toolWithCeo)).toBe('ceo');
      expect(DescriptionSelector.getEffectiveMode('technical', toolWithCeo)).toBe('technical');
      
      // Tool without CEO descriptions
      expect(DescriptionSelector.getEffectiveMode('ceo', toolWithoutCeo)).toBe('technical');
      expect(DescriptionSelector.getEffectiveMode('technical', toolWithoutCeo)).toBe('technical');
    });
    
    it('should get description statistics correctly', () => {
      const tools: ToolConfig[] = [
        {
          id: 'ohm',
          titleKey: 'ohmTitle',
          descKey: 'ohmDesc',
          ceoTitleKey: 'ohmCeoTitle',
          ceoDescKey: 'ohmCeoDesc',
          catKey: 'electrical',
          icon: 'Ω',
        },
        {
          id: 'resistor',
          titleKey: 'resistorTitle',
          descKey: 'resistorDesc',
          ceoTitleKey: undefined,
          ceoDescKey: undefined,
          catKey: 'electrical',
          icon: '🎨',
        },
        {
          id: 'beam',
          titleKey: 'beamTitle',
          descKey: 'beamDesc',
          ceoTitleKey: 'beamCeoTitle',
          ceoDescKey: 'beamCeoDesc',
          catKey: 'mechanical',
          icon: '📏',
        },
      ];
      
      const stats = DescriptionSelector.getDescriptionStats(tools, 'ceo', mockT);
      
      expect(stats.totalTools).toBe(3);
      expect(stats.ceoDescriptionsAvailable).toBe(2); // ohm and beam have CEO descriptions
      expect(stats.fallbacksUsed).toBe(1); // resistor falls back to technical
      expect(stats.missingTranslations).toBe(0); // All translations available in mock
    });
    
    it('should handle empty tool array gracefully', () => {
      const tools: ToolConfig[] = [];
      
      const results = DescriptionSelector.getDescriptions(tools, 'ceo', mockT);
      expect(results).toEqual([]);
      
      const stats = DescriptionSelector.getDescriptionStats(tools, 'ceo', mockT);
      expect(stats.totalTools).toBe(0);
      expect(stats.ceoDescriptionsAvailable).toBe(0);
      expect(stats.fallbacksUsed).toBe(0);
      expect(stats.missingTranslations).toBe(0);
    });
    
    it('should validate input parameters', () => {
      const tool: ToolConfig = {
        id: 'test',
        titleKey: 'testTitle',
        descKey: 'testDesc',
        ceoTitleKey: undefined,
        ceoDescKey: undefined,
        catKey: 'electrical',
        icon: '❓',
      };
      
      // Should throw when tool is null
      expect(() => {
        DescriptionSelector.getDescription(null as any, 'technical', mockT);
      }).toThrow('Tool configuration is required');
      
      // Should throw when translation function is null
      expect(() => {
        DescriptionSelector.getDescription(tool, 'technical', null as any);
      }).toThrow('Translation function is required');
    });
  });
  
  describe('Integration Tests', () => {
    it('should integrate with real translation function from i18n system', () => {
      // Simulate a real translation function from next-intl
      const realTranslationFunction = (key: string): string => {
        const translations: Record<string, string> = {
          'ohmTitle': 'Ohm\'s Law Calculator',
          'ohmDesc': 'Calculate voltage, current, and resistance relationships.',
          'ohmCeoTitle': 'Circuit Analysis Efficiency Tool',
          'ohmCeoDesc': 'Reduce electrical troubleshooting time by 70% with instant circuit analysis.',
        };
        return translations[key] || key;
      };
      
      const tool: ToolConfig = {
        id: 'ohm',
        titleKey: 'ohmTitle',
        descKey: 'ohmDesc',
        ceoTitleKey: 'ohmCeoTitle',
        ceoDescKey: 'ohmCeoDesc',
        catKey: 'electrical',
        icon: 'Ω',
      };
      
      // Test CEO mode
      const ceoResult = DescriptionSelector.getDescription(tool, 'ceo', realTranslationFunction);
      expect(ceoResult.mode).toBe('ceo');
      expect(ceoResult.usedFallback).toBe(false);
      expect(ceoResult.title).toBe('Circuit Analysis Efficiency Tool');
      expect(ceoResult.description).toBe('Reduce electrical troubleshooting time by 70% with instant circuit analysis.');
      
      // Test technical mode
      const technicalResult = DescriptionSelector.getDescription(tool, 'technical', realTranslationFunction);
      expect(technicalResult.mode).toBe('technical');
      expect(technicalResult.usedFallback).toBe(false);
      expect(technicalResult.title).toBe('Ohm\'s Law Calculator');
      expect(technicalResult.description).toBe('Calculate voltage, current, and resistance relationships.');
    });
    
    it('should handle complete workflow with multiple tools and modes', () => {
      const tools: ToolConfig[] = [
        {
          id: 'ohm',
          titleKey: 'ohmTitle',
          descKey: 'ohmDesc',
          ceoTitleKey: 'ohmCeoTitle',
          ceoDescKey: 'ohmCeoDesc',
          catKey: 'electrical',
          icon: 'Ω',
        },
        {
          id: 'resistor',
          titleKey: 'resistorTitle',
          descKey: 'resistorDesc',
          ceoTitleKey: undefined,
          ceoDescKey: undefined,
          catKey: 'electrical',
          icon: '🎨',
        },
        {
          id: 'beam',
          titleKey: 'beamTitle',
          descKey: 'beamDesc',
          ceoTitleKey: 'beamCeoTitle',
          ceoDescKey: 'beamCeoDesc',
          catKey: 'mechanical',
          icon: '📏',
        },
      ];
      
      const mockT = createMockTranslationFunction();
      
      // Test CEO mode
      const ceoResults = DescriptionSelector.getDescriptions(tools, 'ceo', mockT);
      expect(ceoResults).toHaveLength(3);
      expect(ceoResults[0].mode).toBe('ceo'); // ohm
      expect(ceoResults[0].usedFallback).toBe(false);
      expect(ceoResults[1].mode).toBe('technical'); // resistor (fallback)
      expect(ceoResults[1].usedFallback).toBe(true);
      expect(ceoResults[2].mode).toBe('ceo'); // beam
      expect(ceoResults[2].usedFallback).toBe(false);
      
      // Test technical mode
      const technicalResults = DescriptionSelector.getDescriptions(tools, 'technical', mockT);
      expect(technicalResults).toHaveLength(3);
      technicalResults.forEach(result => {
        expect(result.mode).toBe('technical');
        expect(result.usedFallback).toBe(false);
      });
      
      // Test statistics
      const ceoStats = DescriptionSelector.getDescriptionStats(tools, 'ceo', mockT);
      expect(ceoStats.totalTools).toBe(3);
      expect(ceoStats.ceoDescriptionsAvailable).toBe(2);
      expect(ceoStats.fallbacksUsed).toBe(1);
      
      const technicalStats = DescriptionSelector.getDescriptionStats(tools, 'technical', mockT);
      expect(technicalStats.totalTools).toBe(3);
      expect(technicalStats.ceoDescriptionsAvailable).toBe(2);
      expect(technicalStats.fallbacksUsed).toBe(0);
    });
  });
});