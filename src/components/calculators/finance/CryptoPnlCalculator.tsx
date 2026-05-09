'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ReferenceCard } from '../../ui/ReferenceCard';

export function CryptoPnlCalculator() {
  const t = useTranslations('CryptoPnl');

  const [params, setParams] = useState({
    entryPrice: '50000',
    exitPrice: '55000',
    quantity: '0.1',
    leverage: '1',
  });

  const updateParam = (key: string, val: string) => {
    setParams((prev) => ({ ...prev, [key]: val }));
  };

  const results = useMemo(() => {
    const entry = parseFloat(params.entryPrice);
    const exit = parseFloat(params.exitPrice);
    const qty = parseFloat(params.quantity);
    const lev = parseFloat(params.leverage);

    if (isNaN(entry) || isNaN(exit) || isNaN(qty) || isNaN(lev)) return null;
    if (entry <= 0 || exit <= 0 || qty <= 0 || lev < 1) return null;

    const initialMargin = (entry * qty) / lev;
    const priceDiff = exit - entry;
    const pnl = priceDiff * qty;
    const pnlWithLev = pnl * lev; // Note: In most platforms, PnL is simplified or already includes leverage in effective qty
    // Standard calc: PnL = (Exit - Entry) * Quantity. Leverage just reduces margin needed.
    // However, users often think PnL % = (Price % * Leverage).

    const pnlPercent = (priceDiff / entry) * 100 * lev;
    const totalPnl = priceDiff * qty; // Total absolute USD gain/loss

    return { entry, exit, qty, lev, totalPnl, pnlPercent, initialMargin };
  }, [params]);

  const InputField = ({ label, id, unit }: { label: string; id: string; unit: string }) => (
    <div className="space-y-1">
      <div className="flex justify-between items-center px-1">
        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          {label}
        </label>
        <span className="text-[9px] text-slate-300 dark:text-slate-600 font-bold">{unit}</span>
      </div>
      <input
        type="number"
        step="any"
        value={params[id as keyof typeof params]}
        onChange={(e) => updateParam(id, e.target.value)}
        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-mono text-sm transition-all focus:outline-none focus:border-amber-500 dark:focus:border-amber-400"
      />
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[40px] shadow-sm overflow-hidden p-6 md:p-10">
        {/* Header */}
        <div className="flex items-center gap-5 mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-amber-500/20 text-white">
            🪙
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {t('title')}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic">
              {t('subtitle')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Inputs */}
          <div className="space-y-8">
            <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-[32px] border border-slate-100 dark:border-slate-800 space-y-6 shadow-inner">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label={t('entryPrice')} id="entryPrice" unit="USD" />
                <InputField label={t('exitPrice')} id="exitPrice" unit="USD" />
                <InputField label={t('quantity')} id="quantity" unit="COIN" />
                <InputField label={t('leverage')} id="leverage" unit="X" />
              </div>
            </div>

            <div className="p-6 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-3xl">
              <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-[0.2em] mb-2">
                Profit Logic
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                P&L is calculated as the difference between exit and entry price multiplied by
                quantity. Leverage amplifies the percentage return relative to initial margin.
              </p>
            </div>
          </div>

          {/* Right: Visualization & Results */}
          <div className="space-y-8 flex flex-col">
            {/* Visualizer: P&L Chart Mockup */}
            <div className="flex-1 min-h-[250px] bg-slate-950 rounded-[48px] border-4 border-slate-900 relative overflow-hidden p-8 shadow-2xl flex flex-col justify-end">
              {results && (
                <div className="absolute inset-x-0 bottom-0 h-full flex items-end px-4 gap-1 opacity-20">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-t-lg transition-all duration-1000 ${results.totalPnl >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                      style={{ height: `${20 + Math.random() * 60}%` }}
                    ></div>
                  ))}
                </div>
              )}

              <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-center text-white">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {t('breakEven')}
                  </span>
                  <span className="font-mono text-sm">{results?.entry.toLocaleString()} USD</span>
                </div>

                <div className="h-px bg-slate-800 w-full relative">
                  {results && (
                    <div
                      className={`absolute left-0 -top-1 w-2 h-2 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all duration-500 ${results.totalPnl >= 0 ? 'bg-emerald-400' : 'bg-red-400'}`}
                      style={{
                        left: `${Math.min(100, Math.max(0, 50 + results.pnlPercent / 2))}%`,
                      }}
                    ></div>
                  )}
                </div>

                <div className="flex justify-between items-center text-white">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Live Target
                  </span>
                  <span className="font-mono text-sm">{results?.exit.toLocaleString()} USD</span>
                </div>
              </div>

              <div className="absolute top-6 right-8">
                <div
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${results && results.totalPnl >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}
                >
                  {results && results.totalPnl >= 0 ? t('profit') : t('loss')}
                </div>
              </div>
            </div>

            {/* Result Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`p-8 rounded-[36px] shadow-2xl relative overflow-hidden transition-colors duration-500 ${results && results.totalPnl >= 0 ? 'bg-emerald-600' : 'bg-red-600'} text-white`}
              >
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">
                  {t('totalPnl')}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-mono font-black tracking-tighter">
                    {results
                      ? (results.totalPnl >= 0 ? '+' : '') +
                        results.totalPnl.toLocaleString(undefined, { maximumFractionDigits: 2 })
                      : '---'}
                  </span>
                  <span className="text-sm font-bold opacity-60">USD</span>
                </div>
              </div>

              <div className="p-8 bg-slate-900 rounded-[36px] shadow-2xl text-white relative overflow-hidden">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">
                  {t('roi')}
                </p>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-4xl font-mono font-black tracking-tighter ${results && results.pnlPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
                  >
                    {results
                      ? (results.pnlPercent >= 0 ? '+' : '') + results.pnlPercent.toFixed(2)
                      : '---'}
                    %
                  </span>
                </div>
                <div className="mt-4 flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                    Init. Margin
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-300">
                    {results ? results.initialMargin.toFixed(2) : '---'} USD
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
