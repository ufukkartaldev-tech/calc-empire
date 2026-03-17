'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { calculateBodePlot } from '@/lib/formulas/electrical';
import { ReferenceCard } from '../../ui/ReferenceCard';

interface BodePlotVisualizerProps {
  className?: string;
}

export function BodePlotVisualizer({ className = '' }: BodePlotVisualizerProps) {
  // Next-intl
  // Use an optional fallback technique if translations are incomplete
  const t = useTranslations('BodePlot');

  const [filterType, setFilterType] = useState<'low-pass' | 'high-pass'>('low-pass');
  const [systemType, setSystemType] = useState<'rc' | 'rl'>('rc');

  // Components (defaults give fc ~ 159 Hz)
  const [R, setR] = useState<number>(1000); // 1k
  const [C, setC] = useState<number>(1e-6); // 1uF
  const [L, setL] = useState<number>(1); // 1H (fc = 159 Hz)

  const plotData = useMemo(() => {
    try {
      return calculateBodePlot({
        type: filterType,
        R,
        C: systemType === 'rc' ? C : undefined,
        L: systemType === 'rl' ? L : undefined,
        points: 100,
      });
    } catch (error) {
      return null;
    }
  }, [filterType, systemType, R, C, L]);

  // Plotting dimensions
  const svgW = 400;
  const svgH = 180;
  const padX = 40;
  const padY = 20;

  const generatePath = (data: number[], freqs: number[], min: number, max: number) => {
    if (!data || data.length === 0) return '';
    const fMin = freqs[0];
    const fMax = freqs[freqs.length - 1];
    const logFMin = Math.log10(fMin);
    const logFMax = Math.log10(fMax);

    const range = max - min;
    if (range === 0) return '';

    return data
      .map((val, i) => {
        const f = freqs[i];
        const x = padX + ((Math.log10(f) - logFMin) / (logFMax - logFMin)) * (svgW - 2 * padX);
        // Cap visual y to prevent rendering outside if dynamic scaling is loose
        const clampedVal = Math.max(min, Math.min(max, val));
        const y = padY + (1 - (clampedVal - min) / range) * (svgH - 2 * padY);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(' ');
  };

  const drawGrid = (minY: number, maxY: number, ticks: number, isPhase: boolean = false) => {
    const lines = [];
    // X grid: log decades
    if (plotData) {
      const fMin = plotData.frequencies[0];
      const fMax = plotData.frequencies[plotData.frequencies.length - 1];
      const logMin = Math.floor(Math.log10(fMin));
      const logMax = Math.ceil(Math.log10(fMax));

      for (let log = logMin; log <= logMax; log++) {
        const x =
          padX +
          ((log - Math.log10(fMin)) / (Math.log10(fMax) - Math.log10(fMin))) * (svgW - 2 * padX);
        if (x >= padX && x <= svgW - padX) {
          lines.push(
            <line
              key={`x-${log}`}
              x1={x}
              y1={padY}
              x2={x}
              y2={svgH - padY}
              stroke="#94a3b8"
              strokeDasharray="2,2"
              strokeWidth="0.5"
              className="dark:stroke-slate-700"
            />
          );
          if (
            log === logMin ||
            log === logMax ||
            log === Math.round(logMin + (logMax - logMin) / 2)
          ) {
            lines.push(
              <text
                key={`tx-${log}`}
                x={x}
                y={svgH - 5}
                fontSize="9"
                textAnchor="middle"
                className="fill-slate-500 font-mono"
              >
                10^{log}
              </text>
            );
          }
        }
      }
    }

    // Y grid
    for (let i = 0; i <= ticks; i++) {
      const val = minY + (i / ticks) * (maxY - minY);
      const y = padY + (1 - i / ticks) * (svgH - 2 * padY);
      lines.push(
        <line
          key={`y-${i}`}
          x1={padX}
          y1={y}
          x2={svgW - padX}
          y2={y}
          stroke="#94a3b8"
          strokeDasharray="2,2"
          strokeWidth="0.5"
          className="dark:stroke-slate-700"
        />
      );
      lines.push(
        <text
          key={`ty-${i}`}
          x={padX - 5}
          y={y + 3}
          fontSize="9"
          textAnchor="end"
          className="fill-slate-500 font-mono"
        >
          {val.toFixed(0)}
          {isPhase ? '°' : ''}
        </text>
      );
    }

    return lines;
  };

  return (
    <div
      className={`w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm ${className}`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center shadow-sm border border-blue-200 dark:border-blue-800">
          <span className="text-2xl">📈</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('title')}</h2>
      </div>

      {/* Input Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
        <div className="ce-field__control col-span-1 md:col-span-2 lg:col-span-4 flex flex-wrap gap-4 mb-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-mono focus:ring-2 focus:ring-blue-100 outline-none text-slate-900 dark:text-slate-100 cursor-pointer"
          >
            <option value="low-pass">{t('lowPass')}</option>
            <option value="high-pass">{t('highPass')}</option>
          </select>

          <select
            value={systemType}
            onChange={(e) => setSystemType(e.target.value as any)}
            className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-mono focus:ring-2 focus:ring-blue-100 outline-none text-slate-900 dark:text-slate-100 cursor-pointer"
          >
            <option value="rc">{t('rcCircuit')}</option>
            <option value="rl">{t('rlCircuit')}</option>
          </select>
        </div>

        <div className="ce-field__control">
          <label className="text-xs font-semibold text-slate-500 mb-1 block">
            {t('resistance')}
          </label>
          <input
            type="number"
            value={R}
            onChange={(e) => setR(Number(e.target.value))}
            className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-mono focus:ring-2 focus:ring-blue-100 outline-none text-slate-900 dark:text-slate-100"
          />
        </div>

        {systemType === 'rc' ? (
          <div className="ce-field__control">
            <label className="text-xs font-semibold text-slate-500 mb-1 block">
              {t('capacitance')}
            </label>
            <input
              type="number"
              value={C}
              step={0.000001}
              onChange={(e) => setC(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-mono focus:ring-2 focus:ring-blue-100 outline-none text-slate-900 dark:text-slate-100"
            />
          </div>
        ) : (
          <div className="ce-field__control">
            <label className="text-xs font-semibold text-slate-500 mb-1 block">
              {t('inductance')}
            </label>
            <input
              type="number"
              value={L}
              step={0.001}
              onChange={(e) => setL(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-mono focus:ring-2 focus:ring-blue-100 outline-none text-slate-900 dark:text-slate-100"
            />
          </div>
        )}

        <div className="ce-field__control flex flex-col justify-end">
          {plotData && (
            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-3 py-2 rounded-lg font-mono text-sm border border-blue-100 dark:border-blue-800/50">
              {t('fcLabel')} = {plotData.fc.toFixed(1)} Hz
            </div>
          )}
        </div>
      </div>

      {plotData && (
        <div className="grid grid-cols-1 gap-6">
          {/* Magnitude Plot */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t('magTitle')}
              </h3>
            </div>
            <div className="p-4 bg-white dark:bg-slate-950 flex justify-center">
              <svg
                width="100%"
                height="auto"
                viewBox={`0 0 ${svgW} ${svgH}`}
                preserveAspectRatio="xMidYMid meet"
                className="max-w-2xl"
              >
                <rect width={svgW} height={svgH} fill="none" />
                {drawGrid(-40, 5, 5)}
                <path
                  d={generatePath(plotData.magnitudes, plotData.frequencies, -40, 5)}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                />
                {/* Cutoff freq indicator */}
                <line
                  x1={padX + 0.5 * (svgW - 2 * padX)}
                  y1={padY}
                  x2={padX + 0.5 * (svgW - 2 * padX)}
                  y2={svgH - padY}
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  strokeDasharray="4,4"
                />
                <text
                  x={padX + 0.5 * (svgW - 2 * padX) + 5}
                  y={padY + 15}
                  fontSize="9"
                  fill="#ef4444"
                  fontWeight="bold"
                >
                  -3dB
                </text>
              </svg>
            </div>
          </div>

          {/* Phase Plot */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t('phaseTitle')}
              </h3>
            </div>
            <div className="p-4 bg-white dark:bg-slate-950 flex justify-center">
              <svg
                width="100%"
                height="auto"
                viewBox={`0 0 ${svgW} ${svgH}`}
                preserveAspectRatio="xMidYMid meet"
                className="max-w-2xl"
              >
                <rect width={svgW} height={svgH} fill="none" />
                {drawGrid(
                  filterType === 'low-pass' ? -90 : 0,
                  filterType === 'low-pass' ? 0 : 90,
                  4,
                  true
                )}
                <path
                  d={generatePath(
                    plotData.phases,
                    plotData.frequencies,
                    filterType === 'low-pass' ? -90 : 0,
                    filterType === 'low-pass' ? 0 : 90
                  )}
                  fill="none"
                  stroke="#ec4899"
                  strokeWidth="2"
                />
                <line
                  x1={padX + 0.5 * (svgW - 2 * padX)}
                  y1={padY}
                  x2={padX + 0.5 * (svgW - 2 * padX)}
                  y2={svgH - padY}
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  strokeDasharray="4,4"
                />
                <text
                  x={padX + 0.5 * (svgW - 2 * padX) + 5}
                  y={padY + 15}
                  fontSize="9"
                  fill="#ef4444"
                  fontWeight="bold"
                >
                  ±45°
                </text>
              </svg>
            </div>
          </div>
        </div>
      )}
      <ReferenceCard referenceKey="ToolReference.bode" />
    </div>
  );
}
