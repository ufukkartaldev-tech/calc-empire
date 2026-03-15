import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
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
