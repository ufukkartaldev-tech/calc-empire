/**
 * @file lib/monitoring/performance.ts
 * @description Performance monitoring utilities using Web Vitals
 */

import { onCLS, onFCP, onFID, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';
import * as Sentry from '@sentry/nextjs';

/**
 * Report Web Vitals to monitoring services
 */
function reportWebVitals(metric: Metric): void {
  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vitals]', metric);
  }

  // Send to Sentry
  Sentry.metrics.distribution(metric.name, metric.value, {
    unit: 'millisecond',
    tags: {
      rating: metric.rating,
    },
  });

  // Send to analytics
  if (typeof window !== 'undefined') {
    const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
    if (gtag) {
      gtag('event', metric.name, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_category: 'Web Vitals',
        event_label: metric.id,
        non_interaction: true,
      });
    }
  }
}

/**
 * Initialize Web Vitals monitoring
 */
export function initPerformanceMonitoring(): void {
  if (typeof window === 'undefined') return;

  try {
    // Core Web Vitals
    onCLS(reportWebVitals); // Cumulative Layout Shift
    onFID(reportWebVitals); // First Input Delay
    onLCP(reportWebVitals); // Largest Contentful Paint

    // Additional metrics
    onFCP(reportWebVitals); // First Contentful Paint
    onINP(reportWebVitals); // Interaction to Next Paint
    onTTFB(reportWebVitals); // Time to First Byte
  } catch (error) {
    console.error('Failed to initialize performance monitoring:', error);
  }
}

/**
 * Measure custom performance metrics
 */
export function measurePerformance(name: string, startTime: number): void {
  const duration = performance.now() - startTime;

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
  }

  Sentry.metrics.distribution(name, duration, {
    unit: 'millisecond',
  });
}

/**
 * Create a performance mark
 */
export function markPerformance(name: string): void {
  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark(name);
  }
}

/**
 * Measure between two performance marks
 */
export function measureBetweenMarks(name: string, startMark: string, endMark: string): void {
  if (typeof performance !== 'undefined' && performance.measure) {
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];

      if (measure) {
        Sentry.metrics.distribution(name, measure.duration, {
          unit: 'millisecond',
        });
      }
    } catch (error) {
      console.error('Failed to measure performance:', error);
    }
  }
}

/**
 * Monitor long tasks (tasks taking more than 50ms)
 */
export function monitorLongTasks(): void {
  if (typeof window === 'undefined') return;

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          Sentry.metrics.distribution('long_task', entry.duration, {
            unit: 'millisecond',
          });

          if (process.env.NODE_ENV === 'development') {
            console.warn('[Long Task]', entry.duration.toFixed(2), 'ms');
          }
        }
      }
    });

    observer.observe({ entryTypes: ['longtask'] });
  } catch {
    // PerformanceObserver not supported
    console.warn('Long task monitoring not supported');
  }
}
