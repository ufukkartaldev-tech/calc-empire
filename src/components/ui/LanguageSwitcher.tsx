'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import Image from 'next/image';
import Fuse from 'fuse.js';

const LOCALES = [
    { code: 'en', label: 'English', country: 'gb' },
    { code: 'tr', label: 'Türkçe', country: 'tr' },
    { code: 'es', label: 'Español', country: 'es' },
    { code: 'fr', label: 'Français', country: 'fr' },
    { code: 'de', label: 'Deutsch', country: 'de' },
    { code: 'it', label: 'Italiano', country: 'it' },
    { code: 'pt', label: 'Português', country: 'pt' },
    { code: 'nl', label: 'Nederlands', country: 'nl' },
    { code: 'pl', label: 'Polski', country: 'pl' },
    { code: 'ru', label: 'Русский', country: 'ru' },
    { code: 'zh', label: '中文', country: 'cn' },
    { code: 'ja', label: '日本語', country: 'jp' },
    { code: 'ko', label: '한국어', country: 'kr' },
    { code: 'hi', label: 'हिन्दी', country: 'in' },
    { code: 'ar', label: 'العربية', country: 'sa' },
    { code: 'id', label: 'Indonesia', country: 'id' },
];

export function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentLocale = LOCALES.find((l) => l.code === locale) || LOCALES[0];
    const isRtl = locale === 'ar';

    const fuse = useMemo(() => new Fuse(LOCALES, {
        keys: ['label', 'code'],
        threshold: 0.3,
    }), []);

    const filteredLocales = useMemo(() => {
        if (!searchQuery.trim()) return LOCALES;
        return fuse.search(searchQuery).map(res => res.item);
    }, [searchQuery, fuse]);

    const handleLocaleChange = (nextLocale: string) => {
        setIsOpen(false);
        setSearchQuery('');
        router.replace(pathname, { locale: nextLocale });
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div
            className={`relative inline-block ${isRtl ? 'text-right' : 'text-left'}`}
            ref={dropdownRef}
            dir={isRtl ? 'rtl' : 'ltr'}
        >
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-label="Dil Seçimi / Select Language"
                className="flex items-center space-x-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 shadow-sm transition-colors hover:border-blue-300 dark:hover:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900"
            >
                <Image
                    src={`https://flagcdn.com/${currentLocale.country}.svg`}
                    alt={`${currentLocale.label} flag`}
                    width={20}
                    height={15}
                    className="w-5 h-auto rounded-[2px] shadow-sm border border-slate-100 dark:border-slate-700 object-cover"
                    aria-hidden="true"
                    unoptimized
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden sm:block mx-1">
                    {currentLocale.label}
                </span>
                <svg
                    className="w-3.5 h-3.5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>

            {isOpen && (
                <div
                    role="listbox"
                    aria-orientation="vertical"
                    className={`absolute ${isRtl ? 'left-0 origin-top-left' : 'right-0 origin-top-right'} mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden transition-all`}
                >
                    <div className="p-2 border-b border-slate-100 dark:border-slate-700/50">
                        <input
                            type="text"
                            placeholder="Dil ara / Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-200 placeholder-slate-400"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    <div className="py-1 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                        {filteredLocales.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-center text-slate-500 dark:text-slate-400">
                                Bulunamadı / Not found
                            </div>
                        ) : (
                            filteredLocales.map((l) => {
                                const takesRtl = l.code === 'ar';
                                return (
                                    <button
                                        key={l.code}
                                        role="option"
                                        aria-selected={locale === l.code}
                                        onClick={() => handleLocaleChange(l.code)}
                                        dir={takesRtl ? 'rtl' : 'ltr'}
                                        className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors ${locale === l.code
                                            ? 'bg-blue-50/80 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                            : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Image
                                                src={`https://flagcdn.com/${l.country}.svg`}
                                                alt=""
                                                width={20}
                                                height={15}
                                                className="w-5 h-auto rounded-[2px] shadow-sm border border-slate-100 dark:border-slate-700 object-cover"
                                                aria-hidden="true"
                                                unoptimized
                                            />
                                            <span className="font-medium">{l.label}</span>
                                        </div>
                                        {locale === l.code && (
                                            <svg
                                                className="w-4 h-4"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                                aria-hidden="true"
                                            >
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
