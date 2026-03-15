import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from './config';
import type { LocaleCode } from '@/types';

// Can be imported from a shared config
export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !locales.includes(locale as LocaleCode)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
