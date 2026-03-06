'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { normalPdf } from '@/lib/formulas/statistics';
import { Input } from '../../ui/Input';
import { generateNormalDistributionPoints, generateSmoothPath, normalizeToSvg } from '@/utils/svg-helpers';

interface NormalDistributionChartProps {
    className?: string;
}

export function NormalDistributionChart({ className = '' }: NormalDistributionChartProps) {
    const t = useTranslations('NormalDistribution');
    const [mean, setMean] = useState<number>(0);
    const [stdDev, setStdDev] = useState<number>(1);

    // Generate bell curve path using utility functions
    const bellCurvePath = useMemo(() => {
        const points = generateNormalDistributionPoints(mean, stdDev, 100, 4);
        return generateSmoothPath(points);
    }, [mean, stdDev]);

    // Generate filled area path
    const fillAreaPath = useMemo(() => {
        const points = generateNormalDistributionPoints(mean, stdDev, 100, 4);
        const smoothPath = generateSmoothPath(points);
        return `${smoothPath} L 400 200 L 0 200 Z`;
    }, [mean, stdDev]);

    // Calculate statistics
    const statistics = useMemo(() => {
        const peakHeight = normalPdf(mean, mean, stdDev);
        const range = 4;
        const xMin = mean - range * stdDev;
        const xMax = mean + range * stdDev;

        return {
            peakHeight,
            xMin,
            xMax,
            meanX: normalizeToSvg(mean, xMin, xMax, 0, 400)
        };
    }, [mean, stdDev]);

    // Generate grid lines and labels
    const generateGridAndLabels = () => {
        const range = 4;
        const xMin = mean - range * stdDev;
        const xMax = mean + range * stdDev;

        const elements: React.ReactNode[] = [];

        for (let i = 0; i <= 8; i++) {
            const x = (i / 8) * 400;
            const value = xMin + (i / 8) * (xMax - xMin);

            elements.push(
                <g key={`grid-${i}`}>
                    <line
                        x1={x}
                        y1="0"
                        x2={x}
                        y2="200"
                        stroke="currentColor"
                        className="text-slate-200 dark:text-slate-800"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                    />
                    <text
                        x={x}
                        y="215"
                        textAnchor="middle"
                        fontSize="10"
                        fill="currentColor"
                        className="text-slate-400 dark:text-slate-500"
                        fontWeight="500"
                    >
                        {value.toFixed(1)}
                    </text>
                </g>
            );
        }

        for (let i = 0; i <= 5; i++) {
            const y = (i / 5) * 200;
            elements.push(
                <line
                    key={`hgrid-${i}`}
                    x1="0"
                    y1={y}
                    x2="400"
                    y2={y}
                    stroke="currentColor"
                    className="text-slate-200 dark:text-slate-800"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                />
            );
        }

        elements.push(
            <line
                key="mean-line"
                x1={statistics.meanX}
                y1="0"
                x2={statistics.meanX}
                y2="200"
                stroke="#8b5cf6"
                strokeWidth="1.5"
                strokeDasharray="4,4"
            />
        );

        elements.push(
            <text
                key="mean-label"
                x={statistics.meanX}
                y="12"
                textAnchor="middle"
                fontSize="10"
                fill="#8b5cf6"
                fontWeight="600"
            >
                μ = {mean}
            </text>
        );

        return elements;
    };

    return (
        <div className={`w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm ${className}`}>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                <span>📊</span> {t('title')}
            </h2>

            {/* Input Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 ce-field__control">
                    <Input value={mean} onChange={setMean} label={t('mean')} step={0.1} className="w-full bg-transparent border-none text-slate-800 dark:text-slate-100 focus:ring-0" />
                </div>
                <div className="flex-1 ce-field__control">
                    <Input value={stdDev} onChange={setStdDev} label={t('stdDev')} step={0.1} min={0.1} className="w-full bg-transparent border-none text-slate-800 dark:text-slate-100 focus:ring-0" />
                </div>
            </div>

            {/* SVG Chart */}
            <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-lg flex justify-center items-center">
                <svg
                    width="400"
                    height="240"
                    viewBox="0 0 400 240"
                    className="w-full h-auto"
                >
                    {generateGridAndLabels()}

                    <path
                        d={fillAreaPath}
                        fill="url(#gradientFill)"
                        fillOpacity="1"
                    />

                    <defs>
                        <linearGradient id="gradientFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                        </linearGradient>
                    </defs>

                    <path
                        d={bellCurvePath}
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />

                    <path d="M 0 200 L 400 200" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="2" strokeLinecap="round" />
                    <path d="M 0 0 L 0 200" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1" strokeLinecap="round" />

                    <text x="200" y="235" textAnchor="middle" fontSize="11" fill="currentColor" className="text-slate-500 font-medium">
                        {t('values')}
                    </text>
                    <text x="20" y="15" fontSize="10" fill="currentColor" className="text-slate-500 font-medium">
                        P(x)
                    </text>
                </svg>
            </div>

            {/* Statistics */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-5 border border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">{t('stats')}</h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                        <p className="text-xs text-slate-500 font-medium">{t('mean')}</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{mean}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium">{t('stdDev')}</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{stdDev}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium">{t('peak')}</p>
                        <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{statistics.peakHeight.toFixed(4)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium">{t('range')}</p>
                        <p className="text-sm font-semibold text-violet-600 dark:text-violet-400 mt-1">[{statistics.xMin.toFixed(1)}, {statistics.xMax.toFixed(1)}]</p>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('empirical')}</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-white dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700 text-xs">
                            <span className="text-slate-500 font-medium block mb-0.5">±1σ</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">68.2%</span>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700 text-xs">
                            <span className="text-slate-500 font-medium block mb-0.5">±2σ</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">95.4%</span>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700 text-xs">
                            <span className="text-slate-500 font-medium block mb-0.5">±3σ</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">99.7%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
