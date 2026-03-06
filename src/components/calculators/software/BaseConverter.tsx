'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

type Base = 2 | 8 | 10 | 16;
type Operator = 'AND' | 'OR' | 'XOR' | 'NOT' | 'LSHIFT' | 'RSHIFT';

export function BaseConverter() {
  const t = useTranslations('BaseConverter');

  // Converter State
  const [inputValue, setInputValue] = useState<string>('');
  const [inputBase, setInputBase] = useState<Base>(10);
  const [errorStr, setErrorStr] = useState<string>('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Bitwise State
  const [operandA, setOperandA] = useState<string>('');
  const [operandB, setOperandB] = useState<string>('');
  const [operator, setOperator] = useState<Operator>('AND');

  // Calculated Values
  const [decValue, setDecValue] = useState<number | null>(null);

  useEffect(() => {
    if (!inputValue) {
      setDecValue(null);
      setErrorStr('');
      return;
    }

    try {
      // Validate input based on selected base
      let isValid = false;
      switch (inputBase) {
        case 2: isValid = /^[01]+$/.test(inputValue); break;
        case 8: isValid = /^[0-7]+$/.test(inputValue); break;
        case 10: isValid = /^-?\d+$/.test(inputValue); break;
        case 16: isValid = /^[0-9A-Fa-f]+$/.test(inputValue); break;
      }

      if (!isValid) {
        setErrorStr(t('invalidInput'));
        setDecValue(null);
        return;
      }

      const parsed = parseInt(inputValue, inputBase);
      if (isNaN(parsed)) throw new Error('Invalid');

      setDecValue(parsed);
      setErrorStr('');
    } catch (e) {
      setErrorStr(t('invalidInput'));
      setDecValue(null);
    }
  }, [inputValue, inputBase, t]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const padBinary = (bin: string, length: number = 8) => {
    if (bin.length > 32) return bin; // too large to pad strictly
    const needed = Math.ceil(bin.length / length) * length;
    return bin.padStart(needed, '0');
  };

  const getBitwiseResult = () => {
    const a = parseInt(operandA, 10);
    const b = parseInt(operandB, 10);

    if (isNaN(a)) return null;

    let res = 0;
    switch (operator) {
      case 'AND': if (!isNaN(b)) res = a & b; break;
      case 'OR': if (!isNaN(b)) res = a | b; break;
      case 'XOR': if (!isNaN(b)) res = a ^ b; break;
      case 'NOT': res = ~a; break;
      case 'LSHIFT': if (!isNaN(b)) res = a << b; break;
      case 'RSHIFT': if (!isNaN(b)) res = a >> b; break;
    }

    // Prepare visuals for binary alignment
    const bStrA = padBinary((a >>> 0).toString(2));
    const bStrB = !isNaN(b) ? padBinary((b >>> 0).toString(2)) : '';
    const bStrRes = padBinary((res >>> 0).toString(2));

    // Pad A and B to same visual length for logical operations
    const maxLen = Math.max(bStrA.length, bStrB.length, bStrRes.length);

    return {
      resultDec: res,
      binA: bStrA.padStart(maxLen, '0'),
      binB: bStrB && operator !== 'NOT' && operator !== 'LSHIFT' && operator !== 'RSHIFT' ? bStrB.padStart(maxLen, '0') : bStrB,
      binRes: bStrRes.padStart(maxLen, '0')
    };
  };

  const bitwiseData = getBitwiseResult();

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      <div className="text-center mb-4">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-blue-200 dark:border-blue-800">
          <span className="text-3xl">💻</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('title')}</h2>
        <p className="text-slate-600 dark:text-slate-400">{t('description')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* Converter Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
            Base Converter
          </h3>

          <div className="flex flex-col gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('fromBase')}</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: 2, label: 'BIN', tooltip: t('binary') },
                  { value: 8, label: 'OCT', tooltip: t('octal') },
                  { value: 10, label: 'DEC', tooltip: t('decimal') },
                  { value: 16, label: 'HEX', tooltip: t('hex') }
                ].map((baseItem) => (
                  <button
                    key={baseItem.value}
                    onClick={() => {
                      setInputBase(baseItem.value as Base);
                      setInputValue('');
                    }}
                    title={baseItem.tooltip}
                    className={`py-2 px-1 text-sm font-semibold rounded-lg transition-colors border ${inputBase === baseItem.value
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                  >
                    {baseItem.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('inputLabel')}</label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value.toUpperCase())}
                placeholder={t('inputPlaceholder')}
                className={`w-full px-4 py-3 bg-white dark:bg-slate-950 border rounded-lg focus:ring-2 focus:outline-none transition-colors font-mono text-lg ${errorStr ? 'border-red-300 focus:ring-red-100 dark:border-red-900/50' : 'border-slate-300 dark:border-slate-700 focus:ring-blue-100 focus:border-blue-400 dark:focus:ring-blue-900'
                  } text-slate-900 dark:text-slate-100`}
                spellCheck={false}
              />
              {errorStr && <p className="text-red-500 text-xs mt-2">{errorStr}</p>}
            </div>
          </div>

          <div className="space-y-3">
            {[
              { base: 10, label: 'DEC', prefix: '', color: 'blue' },
              { base: 16, label: 'HEX', prefix: '0x', color: 'purple' },
              { base: 2, label: 'BIN', prefix: '0b', color: 'emerald' },
              { base: 8, label: 'OCT', prefix: '0o', color: 'amber' }
            ].map((out, idx) => {
              const valStr = decValue !== null
                ? out.base === 16 ? decValue.toString(16).toUpperCase() : decValue.toString(out.base)
                : '---';

              const formattedVal = out.base === 2 && decValue !== null ? padBinary(valStr) : valStr;

              return (
                <div key={out.base} className="flex flex-col group relative">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    <span>{out.label}</span>
                    <button
                      onClick={() => handleCopy(formattedVal, idx)}
                      disabled={decValue === null}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 hover:text-blue-700 dark:text-blue-400 disabled:opacity-0"
                    >
                      {copiedIndex === idx ? t('copied') : t('copy')}
                    </button>
                  </div>
                  <div className={`w-full px-4 py-3 rounded-lg border font-mono break-all ${decValue !== null
                      ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-inner'
                      : 'bg-slate-100 dark:bg-slate-800/50 border-transparent text-slate-400 dark:text-slate-600'
                    }`}>
                    {decValue !== null && <span className="opacity-50 select-none mr-2">{out.prefix}</span>}
                    <span className={decValue !== null && out.base === 2 ? 'tracking-wider' : ''}>{formattedVal}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bitwise Visualizer Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col h-full">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
            {t('bitwiseOperations')}
          </h3>

          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 mb-1">{t('operandA')}</label>
              <input
                type="number"
                value={operandA}
                onChange={(e) => setOperandA(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none"
                placeholder="10"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 px-1 mb-1">{t('operator')}</label>
              <select
                value={operator}
                onChange={(e) => setOperator(e.target.value as Operator)}
                className="w-full px-2 py-2 bg-white dark:bg-slate-800 border-x-0 border-t-0 border-b-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 text-sm font-bold focus:border-blue-500 focus:ring-0 outline-none cursor-pointer"
              >
                <option value="AND">&amp; (AND)</option>
                <option value="OR">| (OR)</option>
                <option value="XOR">^ (XOR)</option>
                <option value="NOT">~ (NOT)</option>
                <option value="LSHIFT">&lt;&lt; (Left Shift)</option>
                <option value="RSHIFT">&gt;&gt; (Right Shift)</option>
              </select>
            </div>
            {operator !== 'NOT' && (
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  {operator === 'LSHIFT' || operator === 'RSHIFT' ? 'Shift Amount' : t('operandB')}
                </label>
                <input
                  type="number"
                  value={operandB}
                  onChange={(e) => setOperandB(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none"
                  placeholder="2"
                />
              </div>
            )}
          </div>

          <div className="mt-auto bg-slate-950 rounded-xl p-5 shadow-inner border border-slate-800 overflow-hidden relative">

            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

            <h4 className="text-xs font-medium text-slate-400 mb-4">{t('bitwiseExplanation')}</h4>

            {bitwiseData && (
              <div className="font-mono text-lg md:text-xl flex flex-col items-end gap-1 font-bold tracking-[0.2em]">
                {/* Operand A */}
                <div className="flex items-center text-blue-400">
                  <span className="text-xs text-slate-500 tracking-normal mr-4 font-normal">A:</span>
                  {bitwiseData.binA}
                </div>

                {/* Operand B */}
                {operator !== 'NOT' && (
                  <div className="flex items-center text-emerald-400 pb-2 border-b-2 border-slate-700 w-full justify-end">
                    <span className="text-sm text-amber-500 mr-2 opacity-80">{operator}</span>
                    {operator !== 'LSHIFT' && operator !== 'RSHIFT' ? (
                      <>
                        <span className="text-xs text-slate-500 tracking-normal mr-4 font-normal">B:</span>
                        {bitwiseData.binB}
                      </>
                    ) : (
                      <span className="text-sm font-normal tracking-normal text-slate-300 px-2 bg-slate-800 rounded">
                        Shift By: {operandB || '0'} bits
                      </span>
                    )}
                  </div>
                )}
                {operator === 'NOT' && <div className="w-full border-b-2 border-slate-700 my-1"></div>}

                {/* Result */}
                <div className="flex items-center text-amber-400 pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <span className="text-xs text-slate-500 tracking-normal mr-4 font-normal">Res:</span>
                  {bitwiseData.binRes}
                </div>

                {/* Decimal Result Badge */}
                <div className="mt-4 pt-4 border-t border-slate-800/50 w-full flex justify-between items-center group">
                  <span className="text-xs text-slate-500 uppercase tracking-widest font-sans font-semibold">Decimal</span>
                  <span className="text-2xl text-white font-sans bg-slate-800 px-4 py-1.5 rounded-lg border border-slate-700 shadow-sm group-hover:border-blue-500/50 transition-colors">
                    {bitwiseData.resultDec}
                  </span>
                </div>
              </div>
            )}

            {!bitwiseData && (
              <div className="flex h-32 items-center justify-center text-slate-600 text-sm font-medium">
                Sayı bekleniyor... (Awaiting input)
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
