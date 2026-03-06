'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { beamDeflection } from '@/lib/formulas/mechanical';
import { Input } from '../../ui/Input';
import { calculateBeamDeflectionPoints, generateSmoothPath } from '@/utils/svg-helpers';

interface BeamDeflectionVisualizerProps {
    className?: string;
}

export function BeamDeflectionVisualizer({ className = '' }: BeamDeflectionVisualizerProps) {
    const t = useTranslations('BeamVisualizer');
    const [beamType, setBeamType] = useState<'cantilever' | 'simply-supported'>('cantilever');
    const [length, setLength] = useState<number>(2);
    const [load, setLoad] = useState<number>(1000);
    const [elasticModulus, setElasticModulus] = useState<number>(200000);
    const [momentOfInertia, setMomentOfInertia] = useState<number>(8.33e-6);

    const deflection = useMemo(() => {
        try {
            return beamDeflection({
                W: load,
                L: length,
                E: elasticModulus,
                I: momentOfInertia,
                type: beamType
            });
        } catch (error) {
            return 0;
        }
    }, [load, length, elasticModulus, momentOfInertia, beamType]);

    const beamPath = useMemo(() => {
        const maxDeflection = Math.min(deflection * 1000, 100);
        const points = calculateBeamDeflectionPoints(length, maxDeflection, beamType, 100);
        return generateSmoothPath(points);
    }, [length, deflection, beamType]);

    const getSupportElements = () => {
        if (beamType === 'cantilever') {
            return (
                <>
                    <rect x="0" y="40" width="12" height="20" fill="#94a3b8" />
                    <line x1="0" y1="35" x2="12" y2="35" stroke="#94a3b8" strokeWidth="2" />
                    <line x1="0" y1="65" x2="12" y2="65" stroke="#94a3b8" strokeWidth="2" />
                    <line x1="2" y1="30" x2="2" y2="70" stroke="#cbd5e1" strokeWidth="1" />
                    <line x1="4" y1="30" x2="4" y2="70" stroke="#cbd5e1" strokeWidth="1" />
                    <line x1="6" y1="30" x2="6" y2="70" stroke="#cbd5e1" strokeWidth="1" />
                    <line x1="8" y1="30" x2="8" y2="70" stroke="#cbd5e1" strokeWidth="1" />
                    <line x1="10" y1="30" x2="10" y2="70" stroke="#cbd5e1" strokeWidth="1" />
                </>
            );
        } else {
            return (
                <>
                    <polygon points="0,50 12,45 12,55" fill="#94a3b8" />
                    <circle cx="6" cy="50" r="3" fill="#64748b" />

                    <rect x="98" y="47" width="12" height="6" fill="#94a3b8" />
                    <circle cx="104" cy="50" r="4" fill="#64748b" />
                    <circle cx="104" cy="50" r="2" fill="#cbd5e1" />
                </>
            );
        }
    };

    const getLoadArrows = () => {
        if (beamType === 'cantilever') {
            return (
                <g>
                    <defs>
                        <marker id="arrowhead-red" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
                        </marker>
                    </defs>
                    <line x1="100" y1="10" x2="100" y2="40" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrowhead-red)" />
                    <text x="105" y="15" fill="#ef4444" fontSize="12" fontWeight="500">W</text>
                </g>
            );
        } else {
            return (
                <g>
                    <defs>
                        <marker id="arrowhead-red-multi" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
                        </marker>
                    </defs>
                    {[20, 35, 50, 65, 80].map((x) => (
                        <line key={x} x1={x} y1="10" x2={x} y2="40" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrowhead-red-multi)" />
                    ))}
                    <text x="50" y="8" textAnchor="middle" fill="#ef4444" fontSize="12" fontWeight="500">w</text>
                </g>
            );
        }
    };

    return (
        <div className={`w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm ${className}`}>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                <span>🏗️</span> {t('title')}
            </h2>

            {/* Tabs */}
            <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex justify-start">
                <div className="inline-flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    <button
                        onClick={() => setBeamType('cantilever')}
                        className={`flex-1 py-1.5 px-4 rounded-md text-sm font-medium transition-colors ${beamType === 'cantilever'
                                ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400'
                                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                    >
                        {t('cantilever')}
                    </button>
                    <button
                        onClick={() => setBeamType('simply-supported')}
                        className={`flex-1 py-1.5 px-4 rounded-md text-sm font-medium transition-colors ${beamType === 'simply-supported'
                                ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400'
                                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                    >
                        {t('simplySupported')}
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Col: Inputs */}
                <div className="w-full lg:w-1/3 flex flex-col gap-4">
                    <div className="ce-field__control">
                        <Input value={length} onChange={setLength} label={t('length')} unit="m" step={0.1} min={0.1} max={10} className="w-full bg-transparent border-none text-slate-800 dark:text-slate-100 focus:ring-0" />
                    </div>
                    <div className="ce-field__control">
                        <Input value={load} onChange={setLoad} label={t('load')} unit="N" step={100} min={100} max={50000} className="w-full bg-transparent border-none text-slate-800 dark:text-slate-100 focus:ring-0" />
                    </div>
                    <div className="ce-field__control">
                        <Input value={elasticModulus} onChange={setElasticModulus} label={t('elasticModulus')} unit="MPa" step={1000} min={1000} max={500000} className="w-full bg-transparent border-none text-slate-800 dark:text-slate-100 focus:ring-0" />
                    </div>
                    <div className="ce-field__control">
                        <Input value={momentOfInertia} onChange={setMomentOfInertia} label={t('momentOfInertia')} unit="m⁴" step={0.000001} min={0.000001} max={0.01} className="w-full bg-transparent border-none text-slate-800 dark:text-slate-100 focus:ring-0" />
                    </div>
                </div>

                {/* Right Col: Viz & Result */}
                <div className="w-full lg:w-2/3 flex flex-col gap-6">
                    {/* SVG Visualization */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-lg flex justify-center items-center">
                        <svg
                            width="100%"
                            height="200"
                            viewBox="0 0 120 120"
                            className="w-full max-w-sm"
                            preserveAspectRatio="xMidYMid meet"
                        >
                            <defs>
                                <pattern id="grid-light" width="10" height="10" patternUnits="userSpaceOnUse">
                                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-200 dark:text-slate-800" />
                                </pattern>
                            </defs>
                            <rect width="120" height="120" fill="url(#grid-light)" />

                            <line x1="10" y1="60" x2="110" y2="60" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1" strokeDasharray="2,2" />

                            <g transform="translate(10, 0)">
                                {getSupportElements()}
                            </g>

                            <path
                                d={beamPath}
                                fill="none"
                                stroke="currentColor"
                                className="text-blue-500"
                                strokeWidth="4"
                                strokeLinecap="round"
                                transform="translate(10, 0)"
                            />

                            <g transform="translate(10, 0)">
                                {getLoadArrows()}
                            </g>

                            {deflection > 0.0001 && (
                                <g transform="translate(10, 0)">
                                    <line
                                        x1={beamType === 'cantilever' ? 100 : 50}
                                        y1="60"
                                        x2={beamType === 'cantilever' ? 100 : 50}
                                        y2={60 + Math.min(deflection * 1000, 48)}
                                        stroke="currentColor"
                                        className="text-slate-400"
                                        strokeWidth="1"
                                        strokeDasharray="2,2"
                                    />
                                    <text
                                        x={beamType === 'cantilever' ? 85 : 35}
                                        y={65 + Math.min(deflection * 1000, 48)}
                                        fill="currentColor"
                                        className="text-blue-600 dark:text-blue-400"
                                        fontSize="8"
                                        fontWeight="500"
                                    >
                                        δ = {(deflection * 1000).toFixed(2)}mm
                                    </text>
                                </g>
                            )}
                            <g transform="translate(10, 0)">
                                <line x1="0" y1="85" x2="100" y2="85" stroke="currentColor" className="text-slate-400" strokeWidth="1" />
                                <line x1="0" y1="82" x2="0" y2="88" stroke="currentColor" className="text-slate-400" strokeWidth="1" />
                                <line x1="100" y1="82" x2="100" y2="88" stroke="currentColor" className="text-slate-400" strokeWidth="1" />
                                <text x="50" y="94" textAnchor="middle" fontSize="7" fill="currentColor" className="text-slate-500 font-medium">
                                    L = {length}m
                                </text>
                            </g>
                        </svg>
                    </div>

                    {/* Results Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-center border border-slate-100 dark:border-slate-800">
                            <p className="text-xs text-slate-500 font-medium mb-1">{t('maxDeflection')}</p>
                            <div className="flex items-baseline justify-center gap-1">
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {(deflection * 1000).toFixed(3)}
                                </p>
                                <p className="text-xs text-blue-500 font-semibold">mm</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-center border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
                            <p className="text-xs text-slate-500 font-medium mb-1">{t('formula')}</p>
                            <p className="text-sm font-mono text-slate-700 dark:text-slate-300 font-medium tracking-tight">
                                {beamType === 'cantilever' ? 'δ = WL³ / 3EI' : 'δ = WL³ / 48EI'}
                            </p>
                        </div>

                        <div className={`rounded-lg p-3 text-center border flex flex-col justify-center ${deflection < length * 0.001
                                ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800/30'
                                : 'bg-orange-50 border-orange-100 dark:bg-orange-900/10 dark:border-orange-800/30'
                            }`}>
                            <p className="text-xs text-slate-500 font-medium mb-1 dark:text-slate-400">{t('status')}</p>
                            <p className={`text-lg font-semibold flex justify-center items-center gap-1 ${deflection < length * 0.001 ? 'text-emerald-700 dark:text-emerald-400' : 'text-orange-700 dark:text-orange-400'
                                }`}>
                                {deflection < length * 0.001 ? t('safe') : t('check')}
                            </p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                                L/{(length / (deflection * 1000)).toFixed(0)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
