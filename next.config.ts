import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { withSentryConfig } from '@sentry/nextjs';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/**
 * OWASP-compliant security headers
 * @see https://owasp.org/www-project-secure-headers/
 */
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin',
  },
  {
    key: 'Cross-Origin-Resource-Policy',
    value: 'same-origin',
  },
];

/**
 * SSR caching headers for improved performance
 */
const cacheHeaders = [
  {
    key: 'Cache-Control',
    value: 'public, s-maxage=60, stale-while-revalidate=300',
  },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    // dangerouslyAllowSVG is required for flag images from flagcdn.com.
    // Security impact: SVG content is sandboxed via CSP below.
    // Recommendation: For inline SVGs in components, use optimized SVG
    // files in public/ folder or import as React components to minimize
    // bundle size impact.
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
      },
    ],
  },
  // Security headers configuration
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // Cache static assets aggressively
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache images
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },
  // Compression for better performance
  compress: true,
  // Powered by header disabled for security
  poweredByHeader: false,
  // ETags for caching
  generateEtags: true,
};

// Sentry configuration
const sentryConfig = {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  widenClientFileUpload: true,
  hideSourceMaps: true,
};

export default withSentryConfig(withNextIntl(nextConfig), sentryConfig);
