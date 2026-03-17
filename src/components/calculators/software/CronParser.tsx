'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ReferenceCard } from '../../ui/ReferenceCard';

export function CronParser() {
  const t = useTranslations('CronParser');
  const [expression, setExpression] = useState('*/15 * * * *');

  const parts = useMemo(() => {
    const p = expression.trim().split(/\s+/);
    if (p.length < 5) return null;
    return {
      minute: p[0],
      hour: p[1],
      dom: p[2],
      month: p[3],
      dow: p[4]
    };
  }, [expression]);

  const getDescription = (part: string, type: 'minute' | 'hour' | 'dom' | 'month' | 'dow') => {
    if (part === '*') return `${t('every')} ${t(type).toLowerCase()}`;
    if (part.includes('/')) {
      const [, interval] = part.split('/');
      return `${t('every')} ${interval} ${t(type).toLowerCase()}`;
    }
    if (part.includes('-')) {
      const [start, end] = part.split('-');
      return `${t('between')} ${start} - ${end}`;
    }
    if (part.includes(',')) {
      return `${t('at')} ${part}`;
    }
    return `${t('at')} ${part}`;
  };

  const PartCard = ({
    label,
    value,
    type,
  }: {
    label: string;
    value: string;
    type: 'minute' | 'hour' | 'dom' | 'month' | 'dow';
  }) => (
    <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center space-y-3 transition-all hover:scale-105 group">
      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</span>
      <div className="text-2xl font-mono font-black text-blue-600 dark:text-blue-400 group-hover:animate-pulse">{value}</div>
      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 text-center leading-tight">
        {getDescription(value, type)}
      </p>
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[40px] shadow-sm overflow-hidden p-6 md:p-10">
        {/* Header */}
        <div className="flex items-center gap-5 mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-blue-500/20 text-white">
            ⏱️
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('title')}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic">{t('subtitle')}</p>
          </div>
        </div>

        {/* Input Area */}
        <div className="max-w-2xl mx-auto mb-16 space-y-4">
          <div className="relative group">
            <input
              type="text"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              placeholder={t('placeholder')}
              className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-[32px] font-mono text-xl text-center transition-all focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 text-slate-800 dark:text-white"
            />
            {!parts && (
              <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-red-500 text-[10px] font-black uppercase tracking-widest">
                {t('invalid')}
              </p>
            )}
          </div>
        </div>

        {parts ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <PartCard label={t('minute')} value={parts.minute} type="minute" />
            <PartCard label={t('hour')} value={parts.hour} type="hour" />
            <PartCard label={t('dom')} value={parts.dom} type="dom" />
            <PartCard label={t('month')} value={parts.month} type="month" />
            <PartCard label={t('dow')} value={parts.dow} type="dow" />
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-slate-300 dark:text-slate-700">
             <span className="text-6xl font-black select-none opacity-20 uppercase tracking-[0.5em]">CLI WAIT</span>
          </div>
        )}

        {/* Legend / Info */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="p-8 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-[36px] space-y-4">
              <h3 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em]">{t('result')}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                Your cron schedule is configured to trigger based on the five components above. 
                Commonly used in Unix-like operating systems for task scheduling.
              </p>
              <div className="flex flex-wrap gap-2">
                 {['*', '*/', '-', ','].map(op => (
                   <span key={op} className="px-3 py-1 bg-white dark:bg-slate-900 rounded-full border border-blue-100 dark:border-blue-900/50 text-[10px] font-mono font-bold text-blue-500">
                     {op}
                   </span>
                 ))}
              </div>
           </div>

           <div className="p-8 bg-slate-900 rounded-[36px] shadow-2xl relative overflow-hidden flex flex-col justify-center">
              <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl font-black text-white select-none">NEXT</div>
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4">{t('nextRun')}</h3>
              <div className="space-y-3 relative z-10">
                 {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-4 text-white opacity-80 group">
                       <span className="w-1.5 h-1.5 rounded-full bg-blue-400 group-hover:scale-150 transition-transform"></span>
                       <span className="font-mono text-xs italic">
                         Simulation @ T+{i*15}m - {new Date(Date.now() + i * 15 * 60000).toLocaleTimeString()}
                       </span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
      <ReferenceCard referenceKey="ToolReference.cronParser" />
    </div>
  );
}
