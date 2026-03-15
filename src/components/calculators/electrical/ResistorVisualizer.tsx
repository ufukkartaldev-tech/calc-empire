'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { resistorColorCode } from '@/lib/formulas/electrical';
import { ColorPicker } from '../../ui/ColorPicker';

interface ResistorVisualizerProps {
  className?: string;
}

export function ResistorVisualizer({ className = '' }: ResistorVisualizerProps) {
  const t = useTranslations('ResistorVisualizer');
  const [bandCount, setBandCount] = useState<4 | 5 | 6>(4);
  const [bands, setBands] = useState<string[]>(['brown', 'black', 'red', 'gold']);

  const result = useMemo(() => {
    try {
      return resistorColorCode(bands);
    } catch (error) {
      return null;
    }
  }, [bands]);

  const handleBandChange = (index: number, color: string) => {
    const newBands = [...bands];
    newBands[index] = color;
    setBands(newBands);
  };

  const handleBandCountChange = (count: 4 | 5 | 6) => {
    setBandCount(count);
    if (count === 4) {
      setBands(['brown', 'black', 'red', 'gold']);
    } else if (count === 5) {
      setBands(['brown', 'black', 'red', 'brown', 'gold']);
    } else {
      setBands(['brown', 'black', 'red', 'brown', 'gold', 'red']);
    }
  };

  const formatResistance = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)} MΩ`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(2)} kΩ`;
    } else {
      return `${value.toFixed(2)} Ω`;
    }
  };

  const getBandColor = (colorName: string) => {
    const colorMap: Record<string, string> = {
      black: '#000000',
      brown: '#8B4513',
      red: '#ef4444',
      orange: '#f97316',
      yellow: '#eab308',
      green: '#22c55e',
      blue: '#3b82f6',
      violet: '#8b5cf6',
      gray: '#6b7280',
      white: '#ffffff',
      gold: '#fbbf24',
      silver: '#94a3b8',
    };
    return colorMap[colorName] || '#64748b';
  };

  const getBandPositions = () => {
    if (bandCount === 4) return [15, 25, 35, 45];
    if (bandCount === 5) return [12, 22, 32, 42, 52];
    return [10, 18, 26, 34, 42, 50];
  };

  return (
    <div
      className={`w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm ${className}`}
    >
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
        <span>🔌</span> {t('title')}
      </h2>

      {/* Band Count Selection */}
      <div className="mb-6">
        <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block">
          {t('bandCount')}
        </label>
        <div className="flex space-x-2">
          {[4, 5, 6].map((count) => (
            <button
              key={count}
              onClick={() => handleBandCountChange(count as 4 | 5 | 6)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                bandCount === count
                  ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700'
              }`}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      {/* Color Pickers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {bands.map((band, index) => (
          <ColorPicker
            key={index}
            value={band}
            onChange={(color: string) => handleBandChange(index, color)}
            label={`${t('bandLabel')} ${index + 1}`}
          />
        ))}
      </div>

      {/* SVG Resistor Visualization */}
      <div className="mb-6 p-6 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-lg flex justify-center items-center">
        <svg width="100%" height="120" viewBox="0 0 100 120" className="w-full max-w-sm">
          <line x1="0" y1="60" x2="15" y2="60" stroke="#94a3b8" strokeWidth="3" />
          <line x1="85" y1="60" x2="100" y2="60" stroke="#94a3b8" strokeWidth="3" />
          <rect
            x="12"
            y="42"
            width="76"
            height="36"
            fill="#fde68a"
            stroke="#d97706"
            strokeWidth="1"
            rx="6"
          />
          <rect x="14" y="44" width="72" height="10" fill="rgba(255,255,255,0.4)" rx="4" />

          {getBandPositions().map((position, index) => (
            <rect
              key={index}
              x={position}
              y="42"
              width="6"
              height="36"
              fill={getBandColor(bands[index] || 'black')}
            />
          ))}

          <path
            d="M 12 48 C 12 42, 16 42, 16 42 L 16 78 C 16 78, 12 78, 12 72 Z"
            fill="rgba(0,0,0,0.05)"
          />
          <path
            d="M 88 48 C 88 42, 84 42, 84 42 L 84 78 C 84 78, 88 78, 88 72 Z"
            fill="rgba(0,0,0,0.05)"
          />
        </svg>
      </div>

      {/* Result Display */}
      {result ? (
        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 rounded-lg p-5">
          <h3 className="text-sm font-medium text-emerald-800 dark:text-emerald-400 mb-2 p-0 m-0 leading-none">
            {t('result')}
          </h3>
          <div className="mt-3 flex items-baseline gap-3">
            <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-300 leading-none">
              {formatResistance(result.resistance)}
            </p>
            <div className="flex gap-2">
              <span className="text-sm text-emerald-700 dark:text-emerald-500 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded">
                ±{result.tolerance}%
              </span>
              {result.tempCoeff && (
                <span className="text-sm text-emerald-700 dark:text-emerald-500 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded">
                  {result.tempCoeff} ppm/K
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/50 rounded-lg p-4 flex items-center text-red-700 dark:text-red-400">
          {t('invalid')}
        </div>
      )}
    </div>
  );
}
