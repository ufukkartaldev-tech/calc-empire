/**
 * @file CalculatorError.tsx
 * @description Error display component for calculator errors with toast-like styling
 */

'use client';

import React from 'react';
import { XCircle, AlertTriangle, Info } from 'lucide-react';
import type { ErrorDisplayInfo, ErrorSeverity } from '@/lib/errors/errorHandler';

interface CalculatorErrorProps {
  errorInfo: ErrorDisplayInfo | null;
  onDismiss?: () => void;
}

const severityStyles: Record<ErrorSeverity, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
  low: {
    bg: 'bg-amber-950/20',
    border: 'border-amber-900/50',
    text: 'text-amber-500',
    icon: <Info size={16} />,
  },
  medium: {
    bg: 'bg-orange-950/20',
    border: 'border-orange-900/50',
    text: 'text-orange-500',
    icon: <AlertTriangle size={16} />,
  },
  high: {
    bg: 'bg-red-950/20',
    border: 'border-red-900/50',
    text: 'text-red-500',
    icon: <XCircle size={16} />,
  },
};

export function CalculatorError({ errorInfo, onDismiss }: CalculatorErrorProps) {
  if (!errorInfo) return null;

  const style = severityStyles[errorInfo.severity];

  return (
    <div className={`mb-6 p-4 ${style.bg} border ${style.border} rounded-lg ${style.text} text-xs font-bold flex items-start gap-3 animate-in slide-in-from-top-2 duration-300`}>
      <span className="flex-shrink-0 mt-0.5">{style.icon}</span>
      <div className="flex-1">
        <p className="font-semibold">{errorInfo.message}</p>
        {errorInfo.details && (
          <p className="mt-1 font-normal opacity-90 text-[11px]">{errorInfo.details}</p>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Dismiss error"
        >
          <XCircle size={14} />
        </button>
      )}
    </div>
  );
}
