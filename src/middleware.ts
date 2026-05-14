import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest } from 'next/server';
import { CSPManager } from './lib/security/CSPManager';
import { Environment } from './lib/security/types';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // Determine environment
  const nodeEnv = process.env.NODE_ENV;
  const environment =
    nodeEnv === 'production'
      ? Environment.PRODUCTION
      : nodeEnv === 'test'
        ? Environment.STAGING
        : Environment.DEVELOPMENT;

  // Initialize CSPManager and generate nonce
  const cspManager = CSPManager.getInstance(environment);
  const nonce = cspManager.generateNonce();

  // Build CSP Header
  const cspHeader = cspManager.buildCSPHeader({
    endpoint: request.nextUrl.pathname,
    nonce,
  });

  // Get response from next-intl middleware
  const response = intlMiddleware(request);

  // Inject CSP and nonce headers
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('x-nonce', nonce);

  return response;
}

export const config = {
  runtime: 'nodejs',
  // Match both internationalized pathnames and the root
  matcher: [
    // Match all pathnames except for
    // - API routes
    // - Static files (_next, images, favicon, etc.)
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // Optional: Match the root
    '/',
  ],
};
