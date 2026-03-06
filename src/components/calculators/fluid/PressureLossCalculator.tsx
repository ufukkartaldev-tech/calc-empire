'use client';

import React from 'react';

export function PressureLossCalculator() {
  return (
    <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm flex flex-col items-center justify-center min-h-[300px] text-center">
      <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
        <span className="text-3xl">🚧</span>
      </div>
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">PressureLossCalculator</h2>
      <p className="text-slate-500 dark:text-slate-400">Bu araç araştırma & geliştirme (Ar-Ge) aşamasındadır. Çok yakında eklenecek!</p>
    </div>
  );
}
