'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';

export function CompoundInterestCalculator() {
  const t = useTranslations('CompoundInterest');

  const [principal, setPrincipal] = useState<number>(100000);
  const [rate, setRate] = useState<number>(35); // Example: 35% interest
  const [inflation, setInflation] = useState<number>(20); // Example: 20% inflation
  const [years, setYears] = useState<number>(10);
  const [compFreq, setCompFreq] = useState<number>(1); // 1 = yearly, 12 = monthly, 365 = daily

  // Validate inputs
  const p = Math.max(0, principal || 0);
  const r = Math.max(0, (rate || 0) / 100);
  const iRate = Math.max(0, (inflation || 0) / 100);
  const y = Math.max(1, Math.min(50, years || 1));
  const n = compFreq;

  const dataPoints = useMemo(() => {
    const points = [];
    let maxVal = p;

    for (let currentYear = 0; currentYear <= y; currentYear++) {
      const nominal = p * Math.pow(1 + r / n, n * currentYear);
      // Real purchasing power: divide nominal by inflation factor
      const real = nominal / Math.pow(1 + iRate, currentYear);

      if (nominal > maxVal) maxVal = nominal;

      points.push({ year: currentYear, nominal, real });
    }
    return { points, maxVal };
  }, [p, r, iRate, y, n]);

  const finalData = dataPoints.points[dataPoints.points.length - 1];
  const totalInterest = finalData.nominal - p;
  const inflationLoss = finalData.nominal - finalData.real;

  // Chart coordinates mapping
  const svgWidth = 600;
  const svgHeight = 250;
  const paddingX = 40;
  const paddingY = 20;

  const xScope = y;
  const yScope = dataPoints.maxVal;

  const getX = (year: number) => paddingX + (year / xScope) * (svgWidth - paddingX * 2);
  const getY = (val: number) => svgHeight - paddingY - (val / yScope) * (svgHeight - paddingY * 2);

  // Generates PATH string for SVG line
  const nominalPath = dataPoints.points
    .map((pt, i) => (i === 0 ? 'M' : 'L') + ` ${getX(pt.year)} ${getY(pt.nominal)}`)
    .join(' ');
  const realPath = dataPoints.points
    .map((pt, i) => (i === 0 ? 'M' : 'L') + ` ${getX(pt.year)} ${getY(pt.real)}`)
    .join(' ');

  // Gradient area
  const nominalArea = `${nominalPath} L ${getX(y)} ${getY(0)} L ${getX(0)} ${getY(0)} Z`;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      <div className="text-center mb-4">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-blue-200 dark:border-blue-800">
          <span className="text-3xl">📈</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('title')}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {/* Controls */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('principal')}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t('interestRate')}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-100 outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t('inflationRate')}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={inflation}
                  onChange={(e) => setInflation(Number(e.target.value))}
                  className="w-full pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-red-100 outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('years')}
            </label>
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              max={50}
              min={1}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-100 outline-none"
            />
            <input
              type="range"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              min={1}
              max={50}
              className="w-full mt-2 accent-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('compounding')}
            </label>
            <select
              value={compFreq}
              onChange={(e) => setCompFreq(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer"
            >
              <option value={1}>{t('yearly').split(' ')[0]}</option>
              <option value={12}>{t('monthly').split(' ')[0]}</option>
              <option value={365}>{t('daily').split(' ')[0]}</option>
            </select>
          </div>
        </div>

        {/* Visualizer & Stats */}
        <div className="lg:col-span-2 flex flex-col gap-6 h-full">
          <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl relative overflow-hidden flex-1 flex flex-col items-center justify-center">
            <h3 className="absolute top-4 left-5 text-sm font-semibold text-slate-500 dark:text-slate-400">
              {t('chartTitle')}
            </h3>

            {/* Legend */}
            <div className="absolute top-4 right-5 flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>{' '}
                <span className="text-slate-600 dark:text-slate-300">Nominal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-red-500 rounded-sm"></div>{' '}
                <span className="text-slate-600 dark:text-slate-300">Real</span>
              </div>
            </div>

            <svg
              width="100%"
              height="250"
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="none"
              className="mt-8 w-full max-w-full drop-shadow-sm"
            >
              {/* Horizontal Grid */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                <line
                  key={ratio}
                  x1={paddingX}
                  y1={getY(yScope * ratio)}
                  x2={svgWidth - paddingX}
                  y2={getY(yScope * ratio)}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-800"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
              ))}

              <defs>
                <linearGradient id="nomGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"></stop>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0"></stop>
                </linearGradient>
              </defs>

              <path d={nominalArea} fill="url(#nomGrad)" />
              <path
                d={nominalPath}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={realPath}
                fill="none"
                stroke="#ef4444"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="6 6"
              />

              {/* Data point markers for Real curve start and end */}
              <circle
                cx={getX(0)}
                cy={getY(p)}
                r="4"
                fill="#3b82f6"
                className="dark:fill-slate-900"
                stroke="#3b82f6"
                strokeWidth="2"
              />
              <circle
                cx={getX(y)}
                cy={getY(finalData.nominal)}
                r="5"
                fill="#3b82f6"
                stroke="#fff"
                strokeWidth="2"
              />
              <circle
                cx={getX(y)}
                cy={getY(finalData.real)}
                r="5"
                fill="#ef4444"
                stroke="#fff"
                strokeWidth="2"
              />

              {/* Baseline */}
              <line
                x1={paddingX}
                y1={getY(0)}
                x2={svgWidth - paddingX}
                y2={getY(0)}
                stroke="currentColor"
                className="text-slate-400 dark:text-slate-600"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>

            {/* Dynamic tooltip reading value over chart (absolute center approximation overlay) */}
            <div className="absolute bottom-6 w-full flex justify-between px-10 text-[10px] font-bold text-slate-400">
              <span>Year 0</span>
              <span>Year {Math.floor(y / 2)}</span>
              <span>Year {y}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1">{t('nominalValue')}</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 0,
                }).format(finalData.nominal)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1">{t('realValue')}</p>
              <p className="text-lg font-bold text-red-500 dark:text-red-400">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 0,
                }).format(finalData.real)}
              </p>
            </div>
            <div className="md:border-l md:border-slate-200 md:dark:border-slate-800 md:pl-4">
              <p className="text-xs text-slate-500 font-medium mb-1">{t('totalInterest')}</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                +
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 0,
                }).format(totalInterest)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1">{t('inflationLoss')}</p>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                -
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 0,
                }).format(inflationLoss)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
