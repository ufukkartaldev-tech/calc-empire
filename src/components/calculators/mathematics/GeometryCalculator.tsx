'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import * as Geometry from '@/lib/formulas/geometry';

type ShapeType = 'circle' | 'rectangle' | 'triangle' | 'sphere' | 'cylinder' | 'cone' | 'prism';

export function GeometryCalculator() {
  const tDash = useTranslations('Dashboard');
  
  const [shape, setShape] = useState<ShapeType>('circle');
  
  // Parameters
  const [params, setParams] = useState<Record<string, number>>({
    radius: 5,
    width: 10,
    height: 10,
    length: 10,
    base: 10,
    sideA: 10,
    sideB: 10,
  });

  const updateParam = (key: string, val: string) => {
    const num = parseFloat(val);
    setParams(prev => ({ ...prev, [key]: isNaN(num) ? 0 : num }));
  };

  const results = useMemo(() => {
    try {
      switch (shape) {
        case 'circle': return Geometry.circle(params.radius);
        case 'rectangle': return Geometry.rectangle(params.width, params.height);
        case 'triangle': return Geometry.triangle(params.base, params.height, params.sideA, params.sideB);
        case 'sphere': return Geometry.sphere({ radius: params.radius });
        case 'cylinder': return Geometry.cylinder({ radius: params.radius, height: params.height });
        case 'cone': return Geometry.cone({ radius: params.radius, height: params.height });
        case 'prism': return Geometry.rectangularPrism({ length: params.length, width: params.width, height: params.height });
        default: return null;
      }
    } catch {
      return null;
    }
  }, [shape, params]);

  const ShapeVisualizer = () => {
    const stroke = "currentColor";
    const fill = "rgba(99, 102, 241, 0.1)";
    const highlight = "#6366f1";

    return (
      <div className="relative aspect-square bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center p-8 overflow-hidden shadow-inner">
        <svg viewBox="0 0 100 100" className="w-full h-full text-slate-400 dark:text-slate-600">
          {shape === 'circle' && (
            <g>
              <circle cx="50" cy="50" r="35" fill={fill} stroke={highlight} strokeWidth="2" />
              <line x1="50" y1="50" x2="85" y2="50" stroke={highlight} strokeWidth="1" strokeDasharray="2 1" />
              <text x="67" y="45" fontSize="5" fill={highlight} className="font-bold">R</text>
            </g>
          )}
          {shape === 'rectangle' && (
            <g>
              <rect x="20" y="30" width="60" height="40" fill={fill} stroke={highlight} strokeWidth="2" />
              <text x="50" y="78" fontSize="5" textAnchor="middle" fill={highlight}>W</text>
              <text x="12" y="50" fontSize="5" textAnchor="middle" fill={highlight} transform="rotate(-90 12 50)">H</text>
            </g>
          )}
          {shape === 'triangle' && (
            <g>
              <path d="M 20 80 L 80 80 L 50 20 Z" fill={fill} stroke={highlight} strokeWidth="2" />
              <line x1="50" y1="20" x2="50" y2="80" stroke={highlight} strokeWidth="1" strokeDasharray="2 1" />
              <text x="50" y="88" fontSize="5" textAnchor="middle" fill={highlight}>Base</text>
              <text x="45" y="50" fontSize="5" textAnchor="middle" fill={highlight} transform="rotate(-90 45 50)">H</text>
            </g>
          )}
          {shape === 'sphere' && (
            <g>
              <circle cx="50" cy="50" r="35" fill={fill} stroke={highlight} strokeWidth="2" />
              <ellipse cx="50" cy="50" rx="35" ry="10" fill="none" stroke={highlight} strokeWidth="1" strokeDasharray="4 2" />
              <line x1="50" y1="50" x2="85" y2="50" stroke={highlight} strokeWidth="2" />
              <text x="67" y="45" fontSize="5" fill={highlight}>R</text>
            </g>
          )}
          {shape === 'cylinder' && (
            <g>
              <ellipse cx="50" cy="25" rx="25" ry="8" fill={fill} stroke={highlight} strokeWidth="2" />
              <line x1="25" y1="25" x2="25" y2="75" stroke={highlight} strokeWidth="2" />
              <line x1="75" y1="25" x2="75" y2="75" stroke={highlight} strokeWidth="2" />
              <ellipse cx="50" cy="75" rx="25" ry="8" fill={fill} stroke={highlight} strokeWidth="2" />
              <text x="82" y="50" fontSize="5" fill={highlight}>H</text>
              <text x="50" y="20" fontSize="5" textAnchor="middle" fill={highlight}>R</text>
            </g>
          )}
          {shape === 'cone' && (
            <g>
              <ellipse cx="50" cy="80" rx="30" ry="10" fill={fill} stroke={highlight} strokeWidth="2" />
              <line x1="20" y1="80" x2="50" y2="20" stroke={highlight} strokeWidth="2" />
              <line x1="80" y1="80" x2="50" y2="20" stroke={highlight} strokeWidth="2" />
              <line x1="50" y1="20" x2="50" y2="80" stroke={highlight} strokeWidth="1" strokeDasharray="2 1" />
              <text x="45" y="50" fontSize="5" textAnchor="middle" fill={highlight}>H</text>
            </g>
          )}
          {shape === 'prism' && (
            <g>
              <rect x="20" y="40" width="40" height="30" fill={fill} stroke={highlight} strokeWidth="2" />
              <path d="M 20 40 L 40 20 L 80 20 L 80 50 L 60 70" fill="none" stroke={highlight} strokeWidth="2" />
              <line x1="60" y1="40" x2="80" y2="20" stroke={highlight} strokeWidth="2" />
              <text x="40" y="78" fontSize="5" textAnchor="middle" fill={highlight}>L</text>
              <text x="85" y="35" fontSize="5" textAnchor="middle" fill={highlight}>W</text>
              <text x="12" y="55" fontSize="5" textAnchor="middle" fill={highlight} transform="rotate(-90 12 55)">H</text>
            </g>
          )}
        </svg>
      </div>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-2xl border border-emerald-100 dark:border-emerald-800 text-emerald-600">
            📐
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Smart Geometry</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Perfect shapes, precise calculations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
          {/* Controls Side */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Shape</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'circle', label: 'Circle', icon: '⭕' },
                  { id: 'rectangle', label: 'Rectangle', icon: '▭' },
                  { id: 'triangle', label: 'Triangle', icon: '△' },
                  { id: 'sphere', label: 'Sphere', icon: '🌐' },
                  { id: 'cylinder', label: 'Cylinder', icon: '🥫' },
                  { id: 'cone', label: 'Cone', icon: '🍦' },
                  { id: 'prism', label: 'Prism', icon: '📦' },
                ].map(s => (
                  <button
                    key={s.id}
                    onClick={() => setShape(s.id as ShapeType)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                      shape === s.id 
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-emerald-300'
                    }`}
                  >
                    <span>{s.icon}</span>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dimensions</h3>
              
              {(shape === 'circle' || shape === 'sphere' || shape === 'cylinder' || shape === 'cone') && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Radius</label>
                  <input type="number" value={params.radius} onChange={e => updateParam('radius', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" />
                </div>
              )}
              
              {(shape === 'rectangle' || shape === 'prism') && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Width</label>
                  <input type="number" value={params.width} onChange={e => updateParam('width', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" />
                </div>
              )}

              {(shape === 'rectangle' || shape === 'cylinder' || shape === 'cone' || shape === 'prism' || shape === 'triangle') && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Height</label>
                  <input type="number" value={params.height} onChange={e => updateParam('height', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" />
                </div>
              )}

              {shape === 'prism' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Length</label>
                  <input type="number" value={params.length} onChange={e => updateParam('length', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" />
                </div>
              )}

              {shape === 'triangle' && (
                <div className="space-y-4">
                   <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Base</label>
                    <input type="number" value={params.base} onChange={e => updateParam('base', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Side A</label>
                      <input type="number" value={params.sideA} onChange={e => updateParam('sideA', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Side B</label>
                      <input type="number" value={params.sideB} onChange={e => updateParam('sideB', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Visualization & Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <ShapeVisualizer />

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Calculated Data</h3>
              
              {results ? (
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(results).map(([key, val]) => (
                    key !== 'centroid' && (
                      <div key={key} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase mb-1">{key.replace(/([A-Z])/g, ' $1')}</p>
                        <p className="text-2xl font-mono font-black text-emerald-600 dark:text-emerald-400">
                          {typeof val === 'number' ? val.toLocaleString(undefined, { maximumFractionDigits: 4 }) : '—'}
                        </p>
                      </div>
                    )
                  ))}
                </div>
              ) : (
                <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center text-slate-400 text-sm italic">
                  Enter positive dimensions
                </div>
              )}

              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                <p className="text-[10px] text-indigo-700/60 font-bold uppercase mb-2">Math Reference</p>
                <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400 leading-relaxed">
                  {shape === 'circle' && "A = πr², C = 2πr"}
                  {shape === 'rectangle' && "A = w·h, P = 2(w+h)"}
                  {shape === 'triangle' && "A = ½b·h, P = b+a+b"}
                  {shape === 'sphere' && "V = 4/3πr³, A = 4πr²"}
                  {shape === 'cylinder' && "V = πr²h, A_lat = 2πrh"}
                  {shape === 'cone' && "V = 1/3πr²h, L = √(r²+h²)"}
                  {shape === 'prism' && "V = l·w·h, A = 2(lw+lh+wh)"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

