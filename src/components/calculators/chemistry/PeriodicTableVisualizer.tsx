'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Fuse from 'fuse.js';
import { elements, lanthanides, actinides, allElements, ElementData } from '@/lib/data/elements';
import {
  Search,
  Filter,
  Atom,
  Thermometer,
  FlaskConical,
  User,
  Calendar,
  Info,
  Beaker,
  X,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

const categoryColors: Record<string, string> = {
  alkali: 'from-red-500/80 to-red-600/80 shadow-red-500/20 border-red-400/30',
  alkalineEarth: 'from-orange-500/80 to-orange-600/80 shadow-orange-500/20 border-orange-400/30',
  transition: 'from-amber-400/80 to-amber-500/80 shadow-amber-500/20 border-amber-300/30',
  postTransition:
    'from-emerald-500/80 to-emerald-600/80 shadow-emerald-500/20 border-emerald-400/30',
  metalloid: 'from-teal-500/80 to-teal-600/80 shadow-teal-500/20 border-teal-400/30',
  nonmetal: 'from-blue-500/80 to-blue-600/80 shadow-blue-500/20 border-blue-400/30',
  halogen: 'from-indigo-500/80 to-indigo-600/80 shadow-indigo-500/20 border-indigo-400/30',
  nobleGas: 'from-purple-500/80 to-purple-600/80 shadow-purple-500/20 border-purple-400/30',
  lanthanide: 'from-pink-500/80 to-pink-600/80 shadow-pink-500/20 border-pink-400/30',
  actinide: 'from-rose-500/80 to-rose-600/80 shadow-rose-500/20 border-rose-400/30',
  unknown: 'from-slate-500/80 to-slate-600/80 shadow-slate-500/20 border-slate-400/30',
};

const phaseIcons: Record<string, string> = {
  solid: '●',
  liquid: '○',
  gas: '◐',
  unknown: '?',
};

export function PeriodicTableVisualizer() {
  const t = useTranslations('PeriodicTable');
  const tDesc = useTranslations('ElementDescriptions');
  const tElements = useTranslations('Elements');
  const [selectedElement, setSelectedElement] = useState<ElementData | null>(elements[0]);
  const [hoveredElement, setHoveredElement] = useState<ElementData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showLanthanides, setShowLanthanides] = useState(false);
  const [showActinides, setShowActinides] = useState(false);

  // Only show selected element in details panel, hover only affects visual highlighting
  const activeElement = selectedElement;

  // Create elements with localized names for current locale
  const elementsWithLocaleNames = useMemo(() => {
    return allElements.map((el) => {
      const localizedName = tElements(el.symbol);
      return {
        ...el,
        nameLocalized: localizedName !== el.symbol ? localizedName : el.name,
      };
    });
  }, [tElements]);

  // Fuse.js fuzzy search setup with localized names
  const fuse = useMemo(() => {
    return new Fuse(elementsWithLocaleNames, {
      keys: [
        { name: 'name', weight: 0.35 },
        { name: 'nameLocalized', weight: 0.35 },
        { name: 'symbol', weight: 0.2 },
        { name: 'number', weight: 0.05 },
        { name: 'category', weight: 0.05 },
      ],
      threshold: 0.3,
      includeScore: true,
      includeMatches: true,
    });
  }, [elementsWithLocaleNames]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const results = fuse.search(searchQuery, { limit: 8 });
    return results.map((r) => r.item);
  }, [searchQuery, fuse]);

  // Get display name for element (localized if available)
  const getElementDisplayName = (el: ElementData) => {
    const localized = tElements(el.symbol);
    return localized !== el.symbol ? localized : el.name;
  };

  // Check if element is highlighted (search or category filter)
  const isHighlighted = (el: ElementData) => {
    if (searchQuery.trim()) {
      return searchResults.some((r) => r.number === el.number);
    }
    if (selectedCategory) {
      return el.category === selectedCategory;
    }
    return false;
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
  };

  // Handle element selection from search
  const handleElementSelect = (el: ElementData) => {
    setSelectedElement(el);
    setSearchQuery('');
    // Auto-expand series if needed
    if (el.period === 8) setShowLanthanides(true);
    if (el.period === 9) setShowActinides(true);
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-3xl backdrop-blur">
            <Atom className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight">{t('title')}</h2>
            <p className="text-blue-100 text-sm">Interactive Periodic Table with 118 Elements</p>
          </div>
        </div>
      </div>

      {/* Modern Search Bar with Fuzzy Search */}
      <div className="relative">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-1 shadow-xl">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Enhanced Search Input */}
              <div className="relative flex-1 group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search elements (e.g., 'Gold', 'Au', 79, 'transition')..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-24 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-transparent focus:border-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-all text-base"
                />
                <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  )}
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      FUZZY
                    </span>
                  </div>
                </div>

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && searchQuery.trim() && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                    <div className="max-h-72 overflow-y-auto">
                      {searchResults.map((el, idx) => (
                        <button
                          key={el.number}
                          onClick={() => handleElementSelect(el)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-slate-700/50 last:border-0"
                        >
                          <div
                            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${categoryColors[el.category] || categoryColors.unknown} flex items-center justify-center text-white font-bold text-sm`}
                          >
                            {el.symbol}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-bold text-slate-900 dark:text-white">
                              {getElementDisplayName(el)}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {el.name !== getElementDisplayName(el) && (
                                <span className="opacity-60">{el.name} • </span>
                              )}
                              {t(`categories.${el.category}`)} • #{el.number}
                            </p>
                          </div>
                          <ChevronDown className="w-4 h-4 text-slate-400 -rotate-90" />
                        </button>
                      ))}
                    </div>
                    <div className="px-4 py-2 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                        {searchResults.length} results • Click to select element
                      </p>
                    </div>
                  </div>
                )}

                {/* No Results */}
                {searchQuery.trim() && searchResults.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 text-center z-50">
                    <Atom className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                      No elements found
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try searching by name, symbol, or atomic number
                    </p>
                  </div>
                )}
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2 min-w-fit">
                <Filter className="w-5 h-5 text-slate-400" />
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="px-4 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-transparent focus:border-blue-500 text-slate-900 dark:text-white focus:outline-none cursor-pointer min-w-[180px]"
                >
                  <option value="">All Categories</option>
                  {Object.keys(categoryColors).map((cat) => (
                    <option key={cat} value={cat}>
                      {t(`categories.${cat}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Category Chips */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              {Object.keys(categoryColors).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${categoryColors[cat]}`}
                  />
                  {t(`categories.${cat}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Periodic Table */}
        <div className="xl:col-span-2 space-y-4">
          {/* Main Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 overflow-x-auto">
            <div
              className="grid gap-1 min-w-[800px]"
              style={{
                gridTemplateColumns: 'repeat(18, minmax(0, 1fr))',
                gridTemplateRows: 'repeat(7, minmax(0, 50px))',
              }}
            >
              {elements.map((el) => (
                <button
                  key={el.number}
                  onClick={() => setSelectedElement(el)}
                  onMouseEnter={() => setHoveredElement(el)}
                  onMouseLeave={() => setHoveredElement(null)}
                  style={{
                    gridColumn: el.group,
                    gridRow: el.period,
                  }}
                  className={`
                    relative group flex flex-col items-center justify-center rounded-md border transition-all duration-200
                    ${activeElement?.number === el.number ? 'scale-110 z-20 shadow-xl ring-2 ring-white' : 'hover:scale-105 z-10'}
                    ${isHighlighted(el) ? 'ring-2 ring-yellow-400 ring-offset-1' : ''}
                    bg-gradient-to-br ${categoryColors[el.category] || categoryColors.unknown}
                  `}
                >
                  <span className="text-[8px] font-bold text-white/70 absolute top-0.5 left-1">
                    {el.number}
                  </span>
                  <span className="text-base font-bold text-white">{el.symbol}</span>
                  <span className="text-[6px] font-medium text-white/80 hidden group-hover:block truncate max-w-full px-1">
                    {getElementDisplayName(el)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Lanthanides & Actinides Toggles */}
          <div className="flex gap-4">
            <button
              onClick={() => setShowLanthanides(!showLanthanides)}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
                showLanthanides
                  ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/25'
                  : 'bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400'
              }`}
            >
              Lanthanides (57-71) {showLanthanides ? '▼' : '▶'}
            </button>
            <button
              onClick={() => setShowActinides(!showActinides)}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
                showActinides
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                  : 'bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400'
              }`}
            >
              Actinides (89-103) {showActinides ? '▼' : '▶'}
            </button>
          </div>

          {/* Lanthanides Series */}
          {showLanthanides && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-3">
                Lanthanide Series
              </h3>
              <div className="grid grid-cols-15 gap-1">
                {lanthanides.map((el) => (
                  <button
                    key={el.number}
                    onClick={() => setSelectedElement(el)}
                    onMouseEnter={() => setHoveredElement(el)}
                    onMouseLeave={() => setHoveredElement(null)}
                    className={`
                      relative flex flex-col items-center justify-center p-2 rounded-md border transition-all
                      ${activeElement?.number === el.number ? 'scale-105 shadow-lg ring-2 ring-white' : 'hover:scale-103'}
                      bg-gradient-to-br ${categoryColors.lanthanide}
                    `}
                  >
                    <span className="text-[7px] font-bold text-white/70">{el.number}</span>
                    <span className="text-sm font-bold text-white">{el.symbol}</span>
                    <span className="text-[6px] text-white/80 truncate max-w-full">
                      {getElementDisplayName(el)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actinides Series */}
          {showActinides && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-3">
                Actinide Series
              </h3>
              <div className="grid grid-cols-15 gap-1">
                {actinides.map((el) => (
                  <button
                    key={el.number}
                    onClick={() => setSelectedElement(el)}
                    onMouseEnter={() => setHoveredElement(el)}
                    onMouseLeave={() => setHoveredElement(null)}
                    className={`
                      relative flex flex-col items-center justify-center p-2 rounded-md border transition-all
                      ${activeElement?.number === el.number ? 'scale-105 shadow-lg ring-2 ring-white' : 'hover:scale-103'}
                      bg-gradient-to-br ${categoryColors.actinide}
                    `}
                  >
                    <span className="text-[7px] font-bold text-white/70">{el.number}</span>
                    <span className="text-sm font-bold text-white">{el.symbol}</span>
                    <span className="text-[6px] text-white/80 truncate max-w-full">
                      {getElementDisplayName(el)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Element Details Panel */}
        <div className="xl:col-span-1">
          {activeElement ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl sticky top-4">
              {/* Header */}
              <div
                className={`p-6 rounded-t-2xl bg-gradient-to-br ${categoryColors[activeElement.category] || categoryColors.unknown}`}
              >
                <div className="flex items-start justify-between text-white">
                  <div>
                    <p className="text-5xl font-black">{activeElement.symbol}</p>
                    <p className="text-lg font-bold mt-1">{getElementDisplayName(activeElement)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black opacity-60">{activeElement.number}</p>
                    <p className="text-xs font-medium opacity-80">{activeElement.weight} u</p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="p-6 space-y-4">
                {/* Description */}
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {(() => {
                    const desc = tDesc(activeElement.symbol);
                    return desc === activeElement.symbol ? activeElement.description : desc;
                  })()}
                </p>

                {/* Properties Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                      <Beaker className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase">{t('category')}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white capitalize">
                      {t(`categories.${activeElement.category}`)}
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                      <span className="text-lg">
                        {phaseIcons[activeElement.phase || 'unknown']}
                      </span>
                      <span className="text-xs font-bold uppercase">{t('phase')}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white capitalize">
                      {activeElement.phase
                        ? t(`phases.${activeElement.phase}`)
                        : t('phases.unknown')}
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                      <Thermometer className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase">{t('melting')}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">
                      {activeElement.meltingPoint || 'N/A'}
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                      <FlaskConical className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase">{t('boiling')}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">
                      {activeElement.boilingPoint || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Electron Configuration */}
                {activeElement.electronConfig && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-1">
                      {t('electronConfig')}
                    </p>
                    <p className="text-sm font-mono font-bold text-blue-800 dark:text-blue-300">
                      {activeElement.electronConfig}
                    </p>
                  </div>
                )}

                {/* Discovery Info */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                    <Info className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">{t('discovery')}</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    {activeElement.discoveredBy && (
                      <p className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <User className="w-3 h-3" />
                        {activeElement.discoveredBy}
                      </p>
                    )}
                    {activeElement.yearDiscovered && (
                      <p className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Calendar className="w-3 h-3" />
                        {activeElement.yearDiscovered}
                      </p>
                    )}
                  </div>
                </div>

                {/* Position */}
                <div className="flex gap-4 text-sm">
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 font-medium">
                    {t('group')} {activeElement.group}
                  </span>
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 font-medium">
                    {t('period')} {activeElement.period}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center">
              <Atom className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">
                Select an element to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
