import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 1.0,

  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Environment
  environment: process.env.NODE_ENV,

  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION,

  // Filter out non-error events
  beforeSend(event, hint) {
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      return null;
    }

    // Don't send validation errors to Sentry (user input errors)
    // These are expected and not system bugs
    if (event.tags?.errorType === 'ValidationError') {
      return null;
    }

    // Add calculator context if available
    const calculatorId = event.tags?.calculatorId;
    if (calculatorId) {
      event.contexts = event.contexts || {};
      event.contexts.calculator = {
        calculatorId,
      };
    }

    return event;
  },

  // Ignore specific errors
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    // Ignore common user input errors that are handled gracefully
    'Resistance cannot be zero',
    'Voltage cannot be zero',
    'Current cannot be zero',
    'Empty array',
    'must be positive',
  ],

  // Custom error categorization
  beforeBreadcrumb(breadcrumb) {
    // Filter out sensitive breadcrumbs
    if (breadcrumb.category === 'console' && breadcrumb.level === 'log') {
      return null;
    }
    return breadcrumb;
  },
});
