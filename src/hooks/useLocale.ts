/**
 * @file hooks/useLocale.ts
 * @description Locale management hook
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { useLocale as useNextIntlLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import Fuse from 'fuse.js';
import type { LocaleOption } from '@/types';
import { LOCALE_OPTIONS } from '@/config/locale.config';

export function useLocaleManager() {
  const locale = useNextIntlLocale();
  const router = useRouter();
  const pathname = usePathname();
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLocale = LOCALE_OPTIONS.find((l) => l.code === locale) || LOCALE_OPTIONS[0];

  const fuse = useMemo(() => new Fuse(LOCALE_OPTIONS, {
    keys: ['label', 'code'],
    threshold: 0.3,
  }), []);

  const filteredLocales = useMemo(() => {
    if (!searchQuery.trim()) return LOCALE_OPTIONS;
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

  return {
    locale,
    currentLocale,
    isOpen,
    setIsOpen,
    searchQuery,
    setSearchQuery,
    filteredLocales,
    handleLocaleChange,
    dropdownRef,
  };
}
