'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useLocaleManager } from '@/hooks';
import { RTL_LOCALES } from '@/constants';

export function LanguageSwitcher() {
  const {
    locale,
    currentLocale,
    isOpen,
    setIsOpen,
    searchQuery,
    setSearchQuery,
    filteredLocales,
    handleLocaleChange,
    dropdownRef,
  } = useLocaleManager();

  const isRtl = RTL_LOCALES.has(locale as any);

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
                            autoFocus
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
