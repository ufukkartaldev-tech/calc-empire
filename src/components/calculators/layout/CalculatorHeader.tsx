'use client';

import React from 'react';
import type { CalculatorConfig, TranslationKey } from '@/types';
import type { ResultState, FormState } from '@/stores/calculatorStore';

interface CalculatorHeaderProps {
  config: CalculatorConfig;
  state: {
    fields: FormState;
    result: ResultState;
  };
  t: (key: string) => string;
  id: string;
}

export function CalculatorHeader({ config, state, t, id }: CalculatorHeaderProps) {
  return (
    <div className="lg:w-1/3 bg-slate-900/50 p-8 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col items-center justify-center gap-8">
      <div className="text-center">
        <h2 id={id} className="text-2xl font-semibold text-white mb-2 tracking-tight">
          {t(config.titleKey as TranslationKey)}
        </h2>
        <div className="h-[1px] w-8 bg-blue-600 mx-auto mb-4"></div>
        <p className="text-xs text-slate-400 leading-relaxed font-medium px-4">
          {t(config.descriptionKey as TranslationKey)}
        </p>
      </div>

      <div className="w-full max-w-[200px] aspect-square flex items-center justify-center p-4 bg-slate-950 rounded-xl border border-slate-800/50 relative overflow-hidden group">
        {config.visual ? (
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            {typeof config.visual === 'function' ? (
              <config.visual fields={state.fields} result={state.result} />
            ) : (
              <div className="text-6xl">{config.visual}</div>
            )}
          </div>
        ) : (
          <div className="text-6xl">📐</div>
        )}
      </div>
    </div>
  );
}
