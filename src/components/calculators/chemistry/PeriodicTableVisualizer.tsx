'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { elements, ElementData } from '@/lib/data/elements';

const categoryColors: Record<string, string> = {
  alkali: 'from-red-500/80 to-red-600/80 shadow-red-500/20 border-red-400/30',
  alkalineEarth: 'from-orange-500/80 to-orange-600/80 shadow-orange-500/20 border-orange-400/30',
  transition: 'from-amber-400/80 to-amber-500/80 shadow-amber-500/20 border-amber-300/30',
  postTransition: 'from-emerald-500/80 to-emerald-600/80 shadow-emerald-500/20 border-emerald-400/30',
  metalloid: 'from-teal-500/80 to-teal-600/80 shadow-teal-500/20 border-teal-400/30',
  nonmetal: 'from-blue-500/80 to-blue-600/80 shadow-blue-500/20 border-blue-400/30',
  halogen: 'from-indigo-500/80 to-indigo-600/80 shadow-indigo-500/20 border-indigo-400/30',
  nobleGas: 'from-purple-500/80 to-purple-600/80 shadow-purple-500/20 border-purple-400/30',
  lanthanide: 'from-pink-500/80 to-pink-600/80 shadow-pink-500/20 border-pink-400/30',
  actinide: 'from-rose-500/80 to-rose-600/80 shadow-rose-500/20 border-rose-400/30',
};

export function PeriodicTableVisualizer() {
  const t = useTranslations('PeriodicTable');
  const [selectedElement, setSelectedElement] = useState<ElementData | null>(elements[0]);
  const [hoveredElement, setHoveredElement] = useState<ElementData | null>(null);

  const activeElement = hoveredElement || selectedElement;

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header & Hero Info */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[40px] p-8 md:p-12 shadow-sm overflow-hidden relative">
        <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center lg:items-start">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-blue-500/20 text-white">
                ⚛️
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{t('title')}</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium italic">{t('subtitle')}</p>
              </div>
            </div>

            {/* Periodic Table Grid */}
            <div className="overflow-x-auto pb-4 scrollbar-hide">
              <div 
                className="grid gap-1.5 min-w-[900px]" 
                style={{ 
                  gridTemplateColumns: 'repeat(18, minmax(0, 1fr))',
                  gridTemplateRows: 'repeat(7, minmax(0, 55px))'
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
                      gridRow: el.period 
                    }}
                    className={`
                      relative group flex flex-col items-center justify-center rounded-lg border transition-all duration-300
                      ${activeElement?.number === el.number ? 'scale-110 z-20 shadow-2xl ring-2 ring-white/50' : 'hover:scale-105 z-10'}
                      bg-gradient-to-br ${categoryColors[el.category]}
                    `}
                  >
                    <span className="text-[9px] font-black text-white/60 absolute top-1 left-1.5">{el.number}</span>
                    <span className="text-lg font-black text-white group-hover:drop-shadow-md">{el.symbol}</span>
                    <span className="text-[7px] font-bold text-white/80 hidden group-hover:block transition-all">{el.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              {Object.keys(categoryColors).map(cat => (
                <div key={cat} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${categoryColors[cat]}`} />
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    {t(`categories.${cat}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Info Card */}
          <div className="w-full lg:w-[350px] shrink-0">
            {activeElement && (
              <div className="bg-slate-50 dark:bg-slate-950 rounded-[32px] border-4 border-white dark:border-slate-800 p-8 shadow-2xl sticky top-8 animate-in slide-in-from-right-8 duration-500">
                <div className="space-y-8">
                  {/* Large Symbol */}
                  <div className={`w-full aspect-square rounded-[24px] bg-gradient-to-br ${categoryColors[activeElement.category]} flex flex-col items-center justify-center text-white relative shadow-inner`}>
                    <span className="text-2xl font-black opacity-40 absolute top-6 right-8">{activeElement.number}</span>
                    <h3 className="text-8xl font-black tracking-tighter drop-shadow-2xl">{activeElement.symbol}</h3>
                    <p className="text-xl font-bold opacity-80 mt-2">{activeElement.name}</p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('atomicMass')}</p>
                      <p className="font-mono text-lg font-black text-slate-800 dark:text-white">{activeElement.weight}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('category')}</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-white capitalize">{t(`categories.${activeElement.category}`)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('group')}</p>
                      <p className="font-mono text-lg font-black text-slate-800 dark:text-white">{activeElement.group}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('period')}</p>
                      <p className="font-mono text-lg font-black text-slate-800 dark:text-white">{activeElement.period}</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 opacity-50">Element Details</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      {activeElement.name} is a {t(`categories.${activeElement.category}`)} with atomic number {activeElement.number}. 
                      It is located in period {activeElement.period} and group {activeElement.group} of the periodic table.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
