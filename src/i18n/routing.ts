import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

/**
 * Locale list is kept in sync with src/i18n/strings.json → _meta.targetLocales
 * Run `npm run translate` to generate/update src/messages/<locale>.json files.
 */
export const routing = defineRouting({
    locales: ['en', 'tr', 'ru', 'de', 'fr', 'es', 'pt', 'zh', 'ar', 'ko', 'hi', 'ja', 'it', 'nl', 'pl', 'id'],
    defaultLocale: 'en',
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter, getPathname } =
    createNavigation(routing);
