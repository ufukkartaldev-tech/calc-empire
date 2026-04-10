'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import type { TranslationKey } from '@/types';

/* ─────────────────── Types ─────────────────── */
interface UnitDef {
  key: string;
  label: string;
  symbol: string;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
}

interface Category {
  key: string;
  icon: string;
  units: UnitDef[];
}

/* ─────────────────── Unit Data ─────────────────── */
const CATEGORIES: Category[] = [
  {
    key: 'length',
    icon: '📏',
    units: [
      { key: 'mm',  label: 'Millimeter',  symbol: 'mm',  toBase: v => v / 1000,     fromBase: v => v * 1000 },
      { key: 'cm',  label: 'Centimeter',  symbol: 'cm',  toBase: v => v / 100,      fromBase: v => v * 100 },
      { key: 'm',   label: 'Meter',       symbol: 'm',   toBase: v => v,             fromBase: v => v },
      { key: 'km',  label: 'Kilometer',   symbol: 'km',  toBase: v => v * 1000,     fromBase: v => v / 1000 },
      { key: 'in',  label: 'Inch',        symbol: 'in',  toBase: v => v * 0.0254,   fromBase: v => v / 0.0254 },
      { key: 'ft',  label: 'Foot',        symbol: 'ft',  toBase: v => v * 0.3048,   fromBase: v => v / 0.3048 },
      { key: 'yd',  label: 'Yard',        symbol: 'yd',  toBase: v => v * 0.9144,   fromBase: v => v / 0.9144 },
      { key: 'mi',  label: 'Mile',        symbol: 'mi',  toBase: v => v * 1609.344, fromBase: v => v / 1609.344 },
      { key: 'nmi', label: 'Nautical Mile', symbol: 'nmi', toBase: v => v * 1852,   fromBase: v => v / 1852 },
    ],
  },
  {
    key: 'mass',
    icon: '⚖️',
    units: [
      { key: 'mg',  label: 'Milligram', symbol: 'mg',  toBase: v => v / 1e6,    fromBase: v => v * 1e6 },
      { key: 'g',   label: 'Gram',      symbol: 'g',   toBase: v => v / 1000,   fromBase: v => v * 1000 },
      { key: 'kg',  label: 'Kilogram',  symbol: 'kg',  toBase: v => v,          fromBase: v => v },
      { key: 't',   label: 'Tonne',     symbol: 't',   toBase: v => v * 1000,   fromBase: v => v / 1000 },
      { key: 'lb',  label: 'Pound',     symbol: 'lb',  toBase: v => v * 0.453592, fromBase: v => v / 0.453592 },
      { key: 'oz',  label: 'Ounce',     symbol: 'oz',  toBase: v => v * 0.028350, fromBase: v => v / 0.028350 },
      { key: 'st',  label: 'Stone',     symbol: 'st',  toBase: v => v * 6.35029, fromBase: v => v / 6.35029 },
    ],
  },
  {
    key: 'temperature',
    icon: '🌡️',
    units: [
      { key: 'C', label: 'Celsius',    symbol: '°C', toBase: v => v,                    fromBase: v => v },
      { key: 'F', label: 'Fahrenheit', symbol: '°F', toBase: v => (v - 32) * 5/9,       fromBase: v => v * 9/5 + 32 },
      { key: 'K', label: 'Kelvin',     symbol: 'K',  toBase: v => v - 273.15,            fromBase: v => v + 273.15 },
      { key: 'R', label: 'Rankine',    symbol: '°R', toBase: v => (v - 491.67) * 5/9,   fromBase: v => v * 9/5 + 491.67 },
    ],
  },
  {
    key: 'area',
    icon: '⬛',
    units: [
      { key: 'mm2', label: 'mm²',       symbol: 'mm²',  toBase: v => v / 1e6,    fromBase: v => v * 1e6 },
      { key: 'cm2', label: 'cm²',       symbol: 'cm²',  toBase: v => v / 1e4,    fromBase: v => v * 1e4 },
      { key: 'm2',  label: 'm²',        symbol: 'm²',   toBase: v => v,          fromBase: v => v },
      { key: 'km2', label: 'km²',       symbol: 'km²',  toBase: v => v * 1e6,    fromBase: v => v / 1e6 },
      { key: 'ha',  label: 'Hectare',   symbol: 'ha',   toBase: v => v * 1e4,    fromBase: v => v / 1e4 },
      { key: 'ac',  label: 'Acre',      symbol: 'ac',   toBase: v => v * 4046.86, fromBase: v => v / 4046.86 },
      { key: 'ft2', label: 'ft²',       symbol: 'ft²',  toBase: v => v * 0.092903, fromBase: v => v / 0.092903 },
      { key: 'in2', label: 'in²',       symbol: 'in²',  toBase: v => v * 6.4516e-4, fromBase: v => v / 6.4516e-4 },
    ],
  },
  {
    key: 'volume',
    icon: '🧊',
    units: [
      { key: 'ml',  label: 'Milliliter', symbol: 'mL',  toBase: v => v / 1000,   fromBase: v => v * 1000 },
      { key: 'l',   label: 'Liter',      symbol: 'L',   toBase: v => v,          fromBase: v => v },
      { key: 'm3',  label: 'm³',         symbol: 'm³',  toBase: v => v * 1000,   fromBase: v => v / 1000 },
      { key: 'gal', label: 'Gallon (US)', symbol: 'gal', toBase: v => v * 3.78541, fromBase: v => v / 3.78541 },
      { key: 'qt',  label: 'Quart',      symbol: 'qt',  toBase: v => v * 0.946353, fromBase: v => v / 0.946353 },
      { key: 'pt',  label: 'Pint',       symbol: 'pt',  toBase: v => v * 0.473176, fromBase: v => v / 0.473176 },
      { key: 'cup', label: 'Cup',        symbol: 'cup', toBase: v => v * 0.236588, fromBase: v => v / 0.236588 },
      { key: 'fl_oz', label: 'Fl. Oz.', symbol: 'fl oz', toBase: v => v * 0.029574, fromBase: v => v / 0.029574 },
      { key: 'ft3', label: 'ft³',        symbol: 'ft³', toBase: v => v * 28.3168, fromBase: v => v / 28.3168 },
    ],
  },
  {
    key: 'speed',
    icon: '💨',
    units: [
      { key: 'ms',  label: 'm/s',   symbol: 'm/s',   toBase: v => v,          fromBase: v => v },
      { key: 'kmh', label: 'km/h',  symbol: 'km/h',  toBase: v => v / 3.6,   fromBase: v => v * 3.6 },
      { key: 'mph', label: 'mph',   symbol: 'mph',   toBase: v => v * 0.44704, fromBase: v => v / 0.44704 },
      { key: 'kn',  label: 'Knot',  symbol: 'kn',   toBase: v => v * 0.514444, fromBase: v => v / 0.514444 },
      { key: 'fts', label: 'ft/s',  symbol: 'ft/s',  toBase: v => v * 0.3048,  fromBase: v => v / 0.3048 },
    ],
  },
  {
    key: 'pressure',
    icon: '🔵',
    units: [
      { key: 'pa',   label: 'Pascal',    symbol: 'Pa',   toBase: v => v,          fromBase: v => v },
      { key: 'kpa',  label: 'Kilopascal',symbol: 'kPa',  toBase: v => v * 1000,   fromBase: v => v / 1000 },
      { key: 'mpa',  label: 'Megapascal',symbol: 'MPa',  toBase: v => v * 1e6,    fromBase: v => v / 1e6 },
      { key: 'bar',  label: 'Bar',       symbol: 'bar',  toBase: v => v * 100000, fromBase: v => v / 100000 },
      { key: 'atm',  label: 'Atmosphere',symbol: 'atm',  toBase: v => v * 101325, fromBase: v => v / 101325 },
      { key: 'psi',  label: 'PSI',       symbol: 'psi',  toBase: v => v * 6894.76, fromBase: v => v / 6894.76 },
      { key: 'mmhg', label: 'mmHg',      symbol: 'mmHg', toBase: v => v * 133.322, fromBase: v => v / 133.322 },
    ],
  },
  {
    key: 'energy',
    icon: '⚡',
    units: [
      { key: 'j',    label: 'Joule',      symbol: 'J',    toBase: v => v,           fromBase: v => v },
      { key: 'kj',   label: 'Kilojoule',  symbol: 'kJ',   toBase: v => v * 1000,    fromBase: v => v / 1000 },
      { key: 'cal',  label: 'Calorie',    symbol: 'cal',  toBase: v => v * 4.184,   fromBase: v => v / 4.184 },
      { key: 'kcal', label: 'Kilocalorie',symbol: 'kcal', toBase: v => v * 4184,    fromBase: v => v / 4184 },
      { key: 'wh',   label: 'Watt-hour',  symbol: 'Wh',   toBase: v => v * 3600,    fromBase: v => v / 3600 },
      { key: 'kwh',  label: 'Kilowatt-hour', symbol: 'kWh', toBase: v => v * 3.6e6, fromBase: v => v / 3.6e6 },
      { key: 'btu',  label: 'BTU',        symbol: 'BTU',  toBase: v => v * 1055.06, fromBase: v => v / 1055.06 },
      { key: 'ev',   label: 'Electronvolt',symbol: 'eV',  toBase: v => v * 1.602e-19, fromBase: v => v / 1.602e-19 },
    ],
  },
  {
    key: 'power',
    icon: '💡',
    units: [
      { key: 'w',   label: 'Watt',       symbol: 'W',   toBase: v => v,          fromBase: v => v },
      { key: 'kw',  label: 'Kilowatt',   symbol: 'kW',  toBase: v => v * 1000,   fromBase: v => v / 1000 },
      { key: 'mw',  label: 'Megawatt',   symbol: 'MW',  toBase: v => v * 1e6,    fromBase: v => v / 1e6 },
      { key: 'hp',  label: 'Horsepower', symbol: 'hp',  toBase: v => v * 745.7,  fromBase: v => v / 745.7 },
      { key: 'btu_h', label: 'BTU/h',   symbol: 'BTU/h', toBase: v => v * 0.293071, fromBase: v => v / 0.293071 },
    ],
  },
  {
    key: 'frequency',
    icon: '〰️',
    units: [
      { key: 'hz',  label: 'Hertz',     symbol: 'Hz',  toBase: v => v,       fromBase: v => v },
      { key: 'khz', label: 'Kilohertz', symbol: 'kHz', toBase: v => v * 1e3, fromBase: v => v / 1e3 },
      { key: 'mhz', label: 'Megahertz', symbol: 'MHz', toBase: v => v * 1e6, fromBase: v => v / 1e6 },
      { key: 'ghz', label: 'Gigahertz', symbol: 'GHz', toBase: v => v * 1e9, fromBase: v => v / 1e9 },
      { key: 'rpm', label: 'RPM',        symbol: 'rpm', toBase: v => v / 60, fromBase: v => v * 60 },
    ],
  },
  {
    key: 'angle',
    icon: '📐',
    units: [
      { key: 'deg', label: 'Degree',  symbol: '°',   toBase: v => v,                   fromBase: v => v },
      { key: 'rad', label: 'Radian',  symbol: 'rad', toBase: v => v * 180 / Math.PI,   fromBase: v => v * Math.PI / 180 },
      { key: 'grad', label: 'Gradian', symbol: 'grad', toBase: v => v * 0.9,            fromBase: v => v / 0.9 },
      { key: 'mrad', label: 'Miliradian', symbol: 'mrad', toBase: v => v * 0.18 / Math.PI, fromBase: v => v * Math.PI / 0.18 },
    ],
  },
  {
    key: 'data',
    icon: '💾',
    units: [
      { key: 'bit',  label: 'Bit',       symbol: 'bit',  toBase: v => v,          fromBase: v => v },
      { key: 'byte', label: 'Byte',      symbol: 'B',    toBase: v => v * 8,      fromBase: v => v / 8 },
      { key: 'kb',   label: 'Kilobyte',  symbol: 'KB',   toBase: v => v * 8192,   fromBase: v => v / 8192 },
      { key: 'mb',   label: 'Megabyte',  symbol: 'MB',   toBase: v => v * 8388608, fromBase: v => v / 8388608 },
      { key: 'gb',   label: 'Gigabyte',  symbol: 'GB',   toBase: v => v * 8589934592, fromBase: v => v / 8589934592 },
      { key: 'tb',   label: 'Terabyte',  symbol: 'TB',   toBase: v => v * 8796093022208, fromBase: v => v / 8796093022208 },
    ],
  },
];

/* ─────────────────── Helpers ─────────────────── */
function convert(value: number, from: UnitDef, to: UnitDef): number {
  const base = from.toBase(value);
  return to.fromBase(base);
}

function formatResult(v: number): string {
  if (!isFinite(v)) return '—';
  if (v === 0) return '0';
  const abs = Math.abs(v);
  if (abs >= 1e12 || (abs < 0.0001 && abs > 0)) return v.toExponential(6);
  if (abs >= 1000) return v.toLocaleString(undefined, { maximumFractionDigits: 4 });
  return v.toPrecision(8).replace(/\.?0+$/, '');
}

/* ─────────────────── Component ─────────────────── */
export function UnitConverter() {
  const t = useTranslations('UnitConverter');

  const [catKey, setCatKey]     = useState<string>('length');
  const [fromKey, setFromKey]   = useState<string>('m');
  const [toKey, setToKey]       = useState<string>('ft');
  const [inputVal, setInputVal] = useState<string>('1');
  const [copied, setCopied]     = useState(false);

  const category = useMemo(() => CATEGORIES.find(c => c.key === catKey)!, [catKey]);

  // When category changes, reset units to first two in that category
  const handleCatChange = useCallback((key: string) => {
    const cat = CATEGORIES.find(c => c.key === key)!;
    setCatKey(key);
    setFromKey(cat.units[0].key);
    setToKey(cat.units[1]?.key ?? cat.units[0].key);
    setInputVal('1');
  }, []);

  const fromUnit = useMemo(() => category.units.find(u => u.key === fromKey) ?? category.units[0], [category, fromKey]);
  const toUnit   = useMemo(() => category.units.find(u => u.key === toKey)   ?? category.units[1], [category, toKey]);

  const numericInput = parseFloat(inputVal);
  const resultVal = useMemo(() => {
    if (isNaN(numericInput)) return NaN;
    return convert(numericInput, fromUnit, toUnit);
  }, [numericInput, fromUnit, toUnit]);

  const resultStr = isNaN(resultVal) ? '—' : formatResult(resultVal);

  const handleSwap = () => {
    setFromKey(toKey);
    setToKey(fromKey);
    if (!isNaN(resultVal)) setInputVal(formatResult(resultVal));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(resultStr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-2xl border border-blue-100 dark:border-blue-800">
          ⚖️
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('title')}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('description')}</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto gap-1.5 p-4 pb-0 scrollbar-hide border-b border-slate-100 dark:border-slate-800">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => handleCatChange(cat.key)}
            className={`flex-none flex items-center gap-1.5 px-3 py-2 rounded-t-xl text-xs font-semibold transition-all whitespace-nowrap border-b-2 ${
              catKey === cat.key
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-500'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border-transparent'
            }`}
          >
            <span>{cat.icon}</span>
            {t(`categories.${cat.key}` as TranslationKey)}
          </button>
        ))}
      </div>

      {/* Converter Body */}
      <div className="p-6 space-y-6">
        {/* Input side */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
          {/* FROM */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              {t('fromLabel')}
            </label>
            <select
              value={fromKey}
              onChange={e => setFromKey(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
            >
              {category.units.map(u => (
                <option key={u.key} value={u.key}>
                  {u.label} ({u.symbol})
                </option>
              ))}
            </select>
            <div className="relative">
              <input
                type="number"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                placeholder={t('inputPlaceholder')}
                className="w-full px-4 py-3 pr-16 bg-white dark:bg-slate-950 border-2 border-blue-500 rounded-xl font-mono font-bold text-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-blue-500 select-none">
                {fromUnit.symbol}
              </span>
            </div>
          </div>

          {/* SWAP button */}
          <div className="flex justify-center pb-1">
            <button
              onClick={handleSwap}
              title={t('swapButton')}
              className="group w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 dark:hover:bg-blue-600 border border-slate-200 dark:border-slate-700 hover:border-blue-500 flex items-center justify-center transition-all shadow-sm hover:shadow-blue-500/20 hover:shadow-lg"
            >
              <span className="text-lg group-hover:scale-110 transition-transform">⇄</span>
            </button>
          </div>

          {/* TO */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              {t('toLabel')}
            </label>
            <select
              value={toKey}
              onChange={e => setToKey(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
            >
              {category.units.map(u => (
                <option key={u.key} value={u.key}>
                  {u.label} ({u.symbol})
                </option>
              ))}
            </select>

            {/* Result box */}
            <div className="relative">
              <div className={`w-full px-4 py-3 pr-20 bg-emerald-50 dark:bg-emerald-900/10 border-2 rounded-xl font-mono font-bold text-2xl min-h-[58px] flex items-center transition-all ${
                isNaN(resultVal)
                  ? 'border-red-300 dark:border-red-700 text-red-500'
                  : 'border-emerald-400 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300'
              }`}>
                {resultStr}
              </div>
              <span className="absolute right-16 top-1/2 -translate-y-1/2 text-sm font-bold text-emerald-500 select-none pointer-events-none">
                {toUnit.symbol}
              </span>
              <button
                onClick={handleCopy}
                disabled={isNaN(resultVal)}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-bold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 hover:text-emerald-600 transition-all disabled:opacity-30"
              >
                {copied ? '✓' : '⎘'}
              </button>
            </div>
          </div>
        </div>

        {/* All-units grid */}
        <div>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
            {t('result')} — {category.units.find(u => u.key === fromKey)?.label}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {category.units.map(unit => {
              const val = isNaN(numericInput) ? NaN : convert(numericInput, fromUnit, unit);
              const isFrom = unit.key === fromKey;
              const isTo   = unit.key === toKey;
              return (
                <button
                  key={unit.key}
                  onClick={() => setToKey(unit.key)}
                  className={`group flex flex-col p-3 rounded-xl border transition-all text-left ${
                    isTo
                      ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-400 dark:border-emerald-600 shadow-sm'
                      : isFrom
                      ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-400 dark:border-blue-600'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                    {unit.symbol}
                  </span>
                  <span className={`font-mono font-bold text-sm truncate ${
                    isTo ? 'text-emerald-700 dark:text-emerald-300' :
                    isFrom ? 'text-blue-700 dark:text-blue-300' :
                    'text-slate-800 dark:text-slate-200'
                  }`}>
                    {isNaN(val) ? '—' : formatResult(val)}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                    {unit.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
