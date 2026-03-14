# Monitoring and Analytics Documentation

This document describes the monitoring, analytics, and error tracking infrastructure for CalcEmpire.

## Overview

CalcEmpire uses a comprehensive monitoring stack:

- **Sentry**: Error tracking and performance monitoring
- **Vercel Analytics**: User analytics and insights
- **Vercel Speed Insights**: Real-time performance metrics
- **Web Vitals**: Core web vitals tracking

## 1. Error Tracking (Sentry)

### Configuration

Sentry is configured in three environments:

- `sentry.client.config.ts` - Client-side error tracking
- `sentry.server.config.ts` - Server-side error tracking
- `sentry.edge.config.ts` - Edge runtime error tracking

### Features

- **Automatic Error Capture**: All unhandled errors are automatically captured
- **Session Replay**: 10% of sessions recorded, 100% on errors
- **Performance Monitoring**: 100% transaction sampling
- **Error Boundary**: React error boundary with fallback UI
- **Source Maps**: Automatic source map upload for better stack traces

### Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
NEXT_PUBLIC_APP_VERSION=0.1.0
```

### Usage

```typescript
import * as Sentry from '@sentry/nextjs';

// Capture exception
try {
  // risky operation
} catch (error) {
  Sentry.captureException(error);
}

// Add context
Sentry.setContext('calculator', {
  id: 'ohm',
  action: 'calculate',
});

// Set user
Sentry.setUser({
  id: userId,
  locale: 'en',
});
```

### Error Boundary

Wrap components with ErrorBoundary:

```tsx
import { ErrorBoundary } from '@/lib/monitoring';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>;
```

## 2. Analytics (Vercel Analytics)

### Features

- **Page Views**: Automatic tracking
- **Custom Events**: Track user interactions
- **User Journey**: Understand user flow
- **Conversion Tracking**: Track goal completions

### Usage

```typescript
import { trackEvent, trackCalculatorUsage } from '@/lib/monitoring';

// Track calculator usage
trackCalculatorUsage('ohm', 'opened');
trackCalculatorUsage('ohm', 'calculated');

// Track search
trackSearch('voltage', 5);

// Track category selection
trackCategorySelection('electrical');

// Track language change
trackLanguageChange('tr');

// Track theme toggle
trackThemeToggle('dark');

// Track custom events
trackEvent('calculator_calculated', {
  calculator_id: 'ohm',
  voltage: 12,
  current: 2,
});
```

### Tracked Events

- `calculator_opened` - When a calculator is opened
- `calculator_calculated` - When a calculation is performed
- `category_selected` - When a category is selected
- `search_performed` - When a search is performed
- `language_changed` - When language is changed
- `theme_toggled` - When theme is toggled
- `disclaimer_acknowledged` - When disclaimer is acknowledged
- `error_occurred` - When an error occurs

## 3. Performance Monitoring

### Web Vitals

Core Web Vitals are automatically tracked:

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **FCP** (First Contentful Paint): < 1.8s
- **INP** (Interaction to Next Paint): < 200ms
- **TTFB** (Time to First Byte): < 600ms

### Custom Performance Metrics

```typescript
import { measurePerformance, markPerformance, measureBetweenMarks } from '@/lib/monitoring';

// Measure operation duration
const startTime = performance.now();
// ... operation
measurePerformance('calculation_time', startTime);

// Use performance marks
markPerformance('calculation_start');
// ... operation
markPerformance('calculation_end');
measureBetweenMarks('calculation_duration', 'calculation_start', 'calculation_end');
```

### Long Task Monitoring

Long tasks (>50ms) are automatically detected and reported to Sentry.

## 4. Speed Insights (Vercel)

Real-time performance metrics visible in Vercel dashboard:

- Real User Monitoring (RUM)
- Performance Score
- Core Web Vitals
- Geographic distribution

## 5. Monitoring Dashboard

### Sentry Dashboard

Access at: https://sentry.io/organizations/your-org/projects/calc-empire/

Features:

- Error trends and frequency
- Performance metrics
- Session replays
- Release tracking
- User feedback

### Vercel Analytics Dashboard

Access at: https://vercel.com/your-team/calc-empire/analytics

Features:

- Page views and unique visitors
- Top pages and referrers
- Geographic distribution
- Device and browser breakdown
- Custom events

## 6. Alerts and Notifications

### Sentry Alerts

Configure alerts for:

- Error rate spikes
- Performance degradation
- New error types
- Release health issues

### Recommended Alert Rules

1. **High Error Rate**: > 10 errors/minute
2. **Performance Degradation**: LCP > 4s
3. **New Error Type**: First occurrence of new error
4. **Release Issues**: Error rate increase after deployment

## 7. Privacy and Compliance

### Data Collection

- No PII (Personally Identifiable Information) collected
- All text in session replays is masked
- All media in session replays is blocked
- IP addresses are anonymized
- GDPR compliant

### User Consent

Analytics run automatically but respect:

- Do Not Track (DNT) browser settings
- Cookie preferences
- Privacy regulations

## 8. Development vs Production

### Development Mode

- Errors logged to console
- No data sent to Sentry
- Analytics events logged to console
- Performance metrics logged to console

### Production Mode

- Full error tracking enabled
- Analytics data sent to Vercel
- Performance metrics sent to Sentry
- Session replays enabled

## 9. Troubleshooting

### Sentry Not Capturing Errors

1. Check DSN is set correctly
2. Verify environment is not 'development'
3. Check network requests in DevTools
4. Verify source maps are uploaded

### Analytics Not Tracking

1. Check Vercel Analytics is enabled in project settings
2. Verify @vercel/analytics is installed
3. Check browser console for errors
4. Verify events are being called

### Performance Metrics Missing

1. Check Web Vitals API support in browser
2. Verify performance.now() is available
3. Check Sentry metrics are enabled
4. Verify network connectivity

## 10. Best Practices

### Error Handling

```typescript
// ✅ Good: Specific error handling
try {
  const result = calculateOhm(voltage, resistance);
} catch (error) {
  Sentry.captureException(error, {
    tags: { calculator: 'ohm' },
    contexts: { inputs: { voltage, resistance } },
  });
  trackError('Calculation failed', { calculator: 'ohm' });
}

// ❌ Bad: Silent failures
try {
  calculateOhm(voltage, resistance);
} catch (error) {
  // Nothing
}
```

### Performance Tracking

```typescript
// ✅ Good: Track meaningful operations
const start = performance.now();
const result = complexCalculation();
measurePerformance('complex_calculation', start);

// ❌ Bad: Track everything
const start = performance.now();
const x = 1 + 1;
measurePerformance('addition', start);
```

### Analytics Events

```typescript
// ✅ Good: Meaningful events with context
trackEvent('calculator_calculated', {
  calculator_id: 'ohm',
  input_count: 2,
  has_error: false,
});

// ❌ Bad: Generic events without context
trackEvent('button_clicked', {});
```

## 11. Maintenance

### Regular Tasks

- Review error trends weekly
- Check performance metrics monthly
- Update alert thresholds quarterly
- Review and clean up old releases
- Audit tracked events semi-annually

### Monitoring Health Checks

- Verify Sentry is receiving events
- Check analytics data is flowing
- Validate performance metrics
- Test error boundary fallbacks
- Review session replays

## 12. Resources

- [Sentry Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Vercel Analytics](https://vercel.com/docs/analytics)
- [Web Vitals](https://web.dev/vitals/)
- [Next.js Instrumentation](https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation)
