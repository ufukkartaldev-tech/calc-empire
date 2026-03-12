import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

// Can be imported from a shared config
export default getRequestConfig({
    // See all locales from the 'routing' config
    locales: routing.locales,
    // The default locale if no locale is specified
    defaultLocale: routing.defaultLocale,
    // The default locale that will be used when a user visits a
    // non-translated page
    localePrefix: 'always',
    // A function to load messages for a given locale
    messages: async (locale) => {
        // Validate that the locale is supported
        if (!routing.locales.includes(locale as any)) {
            notFound();
        }

        try {
            const messages = (await import(`../messages/${locale}.json`)).default;
            return messages;
        } catch (error) {
            console.error(`Failed to load messages for locale: ${locale}`, error);
            // Fallback to English if translation is missing
            return (await import(`../messages/en.json`)).default;
        }
    }
});
