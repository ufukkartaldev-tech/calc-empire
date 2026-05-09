/**
 * @file lib/ceo-descriptions/DescriptionSelector.ts
 * @description Service for selecting appropriate tool descriptions based on mode (CEO vs Technical)
 */

import type { ToolConfig, EnhancedToolConfig } from '@/types';

/**
 * Translation function type for i18n
 */
export type TranslationFunction = (key: string) => string;

/**
 * Description mode type
 */
export type DescriptionMode = 'ceo' | 'technical';

/**
 * Description result containing title and description
 */
export interface DescriptionResult {
  title: string;
  description: string;
  mode: DescriptionMode;
  usedFallback: boolean;
}

/**
 * Error types for description selection
 */
export class DescriptionSelectorError extends Error {
  constructor(
    message: string,
    public readonly toolId: string,
    public readonly mode: DescriptionMode
  ) {
    super(message);
    this.name = 'DescriptionSelectorError';
  }
}

export class MissingTranslationError extends DescriptionSelectorError {
  constructor(
    toolId: string,
    mode: DescriptionMode,
    public readonly missingKey: string
  ) {
    super(`Missing translation key: ${missingKey}`, toolId, mode);
    this.name = 'MissingTranslationError';
  }
}

/**
 * Service for selecting appropriate tool descriptions based on mode
 */
export class DescriptionSelector {
  /**
   * Selects appropriate description based on mode and availability
   *
   * @param tool - The tool configuration
   * @param mode - Description mode ('ceo' or 'technical')
   * @param t - Translation function for i18n
   * @returns Description result with title, description, mode, and fallback indicator
   *
   * @throws {MissingTranslationError} When required translation keys are missing
   *
   * **Validates: Requirements 2.1, 2.2, 2.4**
   * - Requirement 2.1: WHEN viewing the dashboard in CEO mode, THE ToolGrid SHALL display CEO titles and descriptions
   * - Requirement 2.2: WHEN viewing the dashboard in technical mode, THE ToolGrid SHALL display technical titles and descriptions
   * - Requirement 2.4: WHERE CEO descriptions are unavailable, THE Dashboard SHALL display technical descriptions with a fallback indicator
   */
  static getDescription(
    tool: ToolConfig | EnhancedToolConfig,
    mode: DescriptionMode,
    t: TranslationFunction
  ): DescriptionResult {
    try {
      // Validate input
      if (!tool) {
        throw new DescriptionSelectorError('Tool configuration is required', 'unknown', mode);
      }

      if (!t) {
        throw new DescriptionSelectorError('Translation function is required', tool.id, mode);
      }

      // CEO mode logic with fallback
      if (mode === 'ceo') {
        const hasCeoDescriptions =
          'hasCeoDescriptions' in tool
            ? tool.hasCeoDescriptions
            : !!(tool.ceoTitleKey && tool.ceoDescKey);

        if (hasCeoDescriptions && tool.ceoTitleKey && tool.ceoDescKey) {
          // Try to get CEO descriptions
          const ceoTitle = t(tool.ceoTitleKey);
          const ceoDesc = t(tool.ceoDescKey);

          // Validate CEO translations are not empty
          if (!ceoTitle || !ceoDesc) {
            throw new MissingTranslationError(
              tool.id,
              mode,
              !ceoTitle ? tool.ceoTitleKey : tool.ceoDescKey
            );
          }

          return {
            title: ceoTitle,
            description: ceoDesc,
            mode,
            usedFallback: false,
          };
        }

        // Fallback to technical descriptions when CEO descriptions unavailable
        return this.getTechnicalDescription(tool, t, true);
      }

      // Technical mode - always use technical descriptions
      return this.getTechnicalDescription(tool, t, false);
    } catch (error) {
      // Handle errors gracefully with fallback to technical descriptions
      if (error instanceof MissingTranslationError) {
        // Log missing translation but continue with fallback
        console.warn(`Missing translation for tool ${tool.id}: ${error.missingKey}`);
        return this.getTechnicalDescription(tool, t, true);
      }

      // Re-throw other errors
      throw error;
    }
  }

  /**
   * Gets technical description for a tool
   *
   * @param tool - The tool configuration
   * @param t - Translation function
   * @param usedFallback - Whether this is a fallback from CEO mode
   * @returns Technical description result
   *
   * @throws {MissingTranslationError} When required technical translation keys are missing
   */
  private static getTechnicalDescription(
    tool: ToolConfig | EnhancedToolConfig,
    t: TranslationFunction,
    usedFallback: boolean
  ): DescriptionResult {
    // Validate technical translation keys exist
    if (!tool.titleKey || !tool.descKey) {
      throw new MissingTranslationError(
        tool.id,
        'technical',
        !tool.titleKey ? 'titleKey' : 'descKey'
      );
    }

    const technicalTitle = t(tool.titleKey);
    const technicalDesc = t(tool.descKey);

    // Validate technical translations are not empty
    if (!technicalTitle || !technicalDesc) {
      throw new MissingTranslationError(
        tool.id,
        'technical',
        !technicalTitle ? tool.titleKey : tool.descKey
      );
    }

    return {
      title: technicalTitle,
      description: technicalDesc,
      mode: 'technical',
      usedFallback,
    };
  }

  /**
   * Checks if a tool has CEO descriptions available
   *
   * @param tool - The tool configuration
   * @returns True if tool has both CEO title and description keys
   */
  static hasCeoDescriptions(tool: ToolConfig | EnhancedToolConfig): boolean {
    if ('hasCeoDescriptions' in tool) {
      return tool.hasCeoDescriptions;
    }
    return !!(tool.ceoTitleKey && tool.ceoDescKey);
  }

  /**
   * Gets the appropriate mode for a tool based on availability
   *
   * @param preferredMode - User's preferred mode
   * @param tool - The tool configuration
   * @returns The mode to use (may differ from preferred if CEO descriptions unavailable)
   */
  static getEffectiveMode(
    preferredMode: DescriptionMode,
    tool: ToolConfig | EnhancedToolConfig
  ): DescriptionMode {
    if (preferredMode === 'ceo' && !this.hasCeoDescriptions(tool)) {
      return 'technical';
    }
    return preferredMode;
  }

  /**
   * Gets description for multiple tools efficiently
   *
   * @param tools - Array of tool configurations
   * @param mode - Description mode
   * @param t - Translation function
   * @returns Array of description results
   */
  static getDescriptions(
    tools: Array<ToolConfig | EnhancedToolConfig>,
    mode: DescriptionMode,
    t: TranslationFunction
  ): DescriptionResult[] {
    return tools.map((tool) => this.getDescription(tool, mode, t));
  }

  /**
   * Gets statistics about description usage
   *
   * @param tools - Array of tool configurations
   * @param mode - Description mode
   * @param t - Translation function
   * @returns Statistics object
   */
  static getDescriptionStats(
    tools: Array<ToolConfig | EnhancedToolConfig>,
    mode: DescriptionMode,
    t: TranslationFunction
  ): {
    totalTools: number;
    ceoDescriptionsAvailable: number;
    fallbacksUsed: number;
    missingTranslations: number;
  } {
    const results = this.getDescriptions(tools, mode, t);

    const ceoDescriptionsAvailable = tools.filter((tool) => this.hasCeoDescriptions(tool)).length;
    const fallbacksUsed = results.filter((result) => result.usedFallback).length;

    // Count missing translations (tools that caused errors)
    const missingTranslations = tools.reduce((count, tool) => {
      try {
        this.getDescription(tool, mode, t);
        return count;
      } catch (error) {
        if (error instanceof MissingTranslationError) {
          return count + 1;
        }
        return count;
      }
    }, 0);

    return {
      totalTools: tools.length,
      ceoDescriptionsAvailable,
      fallbacksUsed,
      missingTranslations,
    };
  }
}
