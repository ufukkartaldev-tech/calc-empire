/**
 * @file src/__tests__/ceo-tool-descriptions/task1.test.ts
 * @description Tests for Task 1: Extend TypeScript interfaces and update tool configuration
 */

import { describe, it, expect } from 'vitest';
import {
  TOOLS_CONFIG,
  createEnhancedToolConfig,
  ENHANCED_TOOLS_CONFIG,
} from '@/config/tools.config';
import type { ToolConfig, EnhancedToolConfig, ToolId } from '@/types';

describe('Task 1: Extend TypeScript interfaces and update tool configuration', () => {
  describe('ToolConfig interface extension', () => {
    it('should have optional ceoTitleKey and ceoDescKey fields', () => {
      // Test that ToolConfig interface accepts CEO fields
      const toolWithCeo: ToolConfig = {
        id: 'ohm' as ToolId,
        titleKey: 'testTitle',
        descKey: 'testDesc',
        ceoTitleKey: 'testCeoTitle',
        ceoDescKey: 'testCeoDesc',
        catKey: 'electrical',
        icon: '⚡',
      };

      expect(toolWithCeo.ceoTitleKey).toBe('testCeoTitle');
      expect(toolWithCeo.ceoDescKey).toBe('testCeoDesc');
    });

    it('should allow tools without CEO fields (backward compatibility)', () => {
      const toolWithoutCeo: ToolConfig = {
        id: 'ohm' as ToolId,
        titleKey: 'testTitle',
        descKey: 'testDesc',
        catKey: 'electrical',
        icon: '⚡',
      };

      expect(toolWithoutCeo.ceoTitleKey).toBeUndefined();
      expect(toolWithoutCeo.ceoDescKey).toBeUndefined();
    });
  });

  describe('TOOLS_CONFIG updates', () => {
    it('should have CEO description keys for all tools', () => {
      TOOLS_CONFIG.forEach((tool) => {
        expect(tool.ceoTitleKey).toBeDefined();
        expect(tool.ceoDescKey).toBeDefined();

        // CEO keys should follow naming convention: toolId + CeoTitle/CeoDesc
        expect(tool.ceoTitleKey).toContain('CeoTitle');
        expect(tool.ceoDescKey).toContain('CeoDesc');
      });
    });

    it('should maintain all existing tool properties', () => {
      const ohmTool = TOOLS_CONFIG.find((tool) => tool.id === 'ohm');
      expect(ohmTool).toBeDefined();
      expect(ohmTool?.titleKey).toBe('ohmTitle');
      expect(ohmTool?.descKey).toBe('ohmDesc');
      expect(ohmTool?.ceoTitleKey).toBe('ohmCeoTitle');
      expect(ohmTool?.ceoDescKey).toBe('ohmCeoDesc');
      expect(ohmTool?.catKey).toBe('electrical');
      expect(ohmTool?.icon).toBe('Ω');
      expect(ohmTool?.features?.shareableUrl).toBe(true);
      expect(ohmTool?.features?.pdfExport).toBe(true);
      expect(ohmTool?.isPopular).toBe(true);
    });
  });

  describe('EnhancedToolConfig type', () => {
    it('should have computed hasCeoDescriptions property', () => {
      const toolWithCeo: ToolConfig = {
        id: 'ohm' as ToolId,
        titleKey: 'testTitle',
        descKey: 'testDesc',
        ceoTitleKey: 'testCeoTitle',
        ceoDescKey: 'testCeoDesc',
        catKey: 'electrical',
        icon: '⚡',
      };

      const enhancedTool = createEnhancedToolConfig(toolWithCeo);
      expect(enhancedTool.hasCeoDescriptions).toBe(true);
    });

    it('should have hasCeoDescriptions false when CEO fields missing', () => {
      const toolWithoutCeo: ToolConfig = {
        id: 'ohm' as ToolId,
        titleKey: 'testTitle',
        descKey: 'testDesc',
        catKey: 'electrical',
        icon: '⚡',
      };

      const enhancedTool = createEnhancedToolConfig(toolWithoutCeo);
      expect(enhancedTool.hasCeoDescriptions).toBe(false);
    });

    it('should have hasCeoDescriptions false when only one CEO field present', () => {
      const toolPartialCeo: ToolConfig = {
        id: 'ohm' as ToolId,
        titleKey: 'testTitle',
        descKey: 'testDesc',
        ceoTitleKey: 'testCeoTitle', // Missing ceoDescKey
        catKey: 'electrical',
        icon: '⚡',
      };

      const enhancedTool = createEnhancedToolConfig(toolPartialCeo);
      expect(enhancedTool.hasCeoDescriptions).toBe(false);
    });
  });

  describe('ENHANCED_TOOLS_CONFIG', () => {
    it('should be created from TOOLS_CONFIG', () => {
      expect(ENHANCED_TOOLS_CONFIG.length).toBe(TOOLS_CONFIG.length);
    });

    it('should have hasCeoDescriptions true for all tools (since we added CEO keys to all)', () => {
      ENHANCED_TOOLS_CONFIG.forEach((tool) => {
        expect(tool.hasCeoDescriptions).toBe(true);
      });
    });

    it('should maintain all original tool properties', () => {
      const enhancedOhmTool = ENHANCED_TOOLS_CONFIG.find((tool) => tool.id === 'ohm');
      expect(enhancedOhmTool).toBeDefined();
      expect(enhancedOhmTool?.titleKey).toBe('ohmTitle');
      expect(enhancedOhmTool?.descKey).toBe('ohmDesc');
      expect(enhancedOhmTool?.ceoTitleKey).toBe('ohmCeoTitle');
      expect(enhancedOhmTool?.ceoDescKey).toBe('ohmCeoDesc');
      expect(enhancedOhmTool?.hasCeoDescriptions).toBe(true);
    });
  });
});
