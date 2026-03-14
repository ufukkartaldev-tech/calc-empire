/**
 * @file lib/monitoring/analytics.ts
 * @description Analytics tracking utilities
 */

import { track } from '@vercel/analytics';

export type AnalyticsEvent =
  | 'calculator_opened'
  | 'calculator_calculated'
  | 'category_selected'
  | 'search_performed'
  | 'language_changed'
  | 'theme_toggled'
  | 'disclaimer_acknowledged'
  | 'error_occurred';

interface AnalyticsProperties {
  calculator_id?: string;
  category?: string;
  search_query?: string;
  language?: string;
  theme?: string;
  error_message?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Track custom analytics events
 */
export function trackEvent(event: AnalyticsEvent, properties?: AnalyticsProperties): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', event, properties);
    return;
  }

  try {
    track(event, properties);
  } catch (error) {
    console.error('Analytics tracking failed:', error);
  }
}

/**
 * Track calculator usage
 */
export function trackCalculatorUsage(calculatorId: string, action: 'opened' | 'calculated'): void {
  trackEvent(action === 'opened' ? 'calculator_opened' : 'calculator_calculated', {
    calculator_id: calculatorId,
  });
}

/**
 * Track search queries
 */
export function trackSearch(query: string, resultsCount: number): void {
  trackEvent('search_performed', {
    search_query: query,
    results_count: resultsCount,
  });
}

/**
 * Track category navigation
 */
export function trackCategorySelection(category: string): void {
  trackEvent('category_selected', {
    category,
  });
}

/**
 * Track language changes
 */
export function trackLanguageChange(language: string): void {
  trackEvent('language_changed', {
    language,
  });
}

/**
 * Track theme changes
 */
export function trackThemeToggle(theme: 'light' | 'dark'): void {
  trackEvent('theme_toggled', {
    theme,
  });
}

/**
 * Track disclaimer acknowledgments
 */
export function trackDisclaimerAcknowledged(calculatorId: string): void {
  trackEvent('disclaimer_acknowledged', {
    calculator_id: calculatorId,
  });
}

/**
 * Track errors
 */
export function trackError(errorMessage: string, context?: Record<string, unknown>): void {
  trackEvent('error_occurred', {
    error_message: errorMessage,
    ...context,
  });
}
