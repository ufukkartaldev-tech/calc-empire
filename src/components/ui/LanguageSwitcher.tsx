'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useLocaleManager } from '@/hooks';
import { RTL_LOCALES } from '@/constants';
import type { LocaleCode } from '@/types';

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

  const isRtl = RTL_LOCALES.has(locale as LocaleCode);

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
        className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 transition-colors hover:border-blue-600 focus:outline-none"
      >
        <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
          {locale.toUpperCase()}
        </span>
        <svg
          className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-orientation="vertical"
          className={`absolute ${isRtl ? 'left-0' : 'right-0'} mt-2 w-44 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl z-50 overflow-hidden outline-none`}
        >
          <div className="p-2 border-b border-slate-800">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-[10px] uppercase font-bold tracking-widest rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-600 text-slate-300 placeholder-slate-600"
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          <div className="py-1 max-h-60 overflow-y-auto custom-scrollbar">
            {filteredLocales.length === 0 ? (
              <div className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                Not found
              </div>
            ) : (
              filteredLocales.map((l) => (
                <button
                  key={l.code}
                  role="option"
                  aria-selected={locale === l.code}
                  onClick={() => handleLocaleChange(l.code)}
                  className={`w-full flex items-center justify-between px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-colors ${
                    locale === l.code
                      ? 'bg-blue-600/10 text-blue-500 border-l-2 border-blue-600'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <span>{l.label}</span>
                  <span className="text-[9px] opacity-40">{l.code.toUpperCase()}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
