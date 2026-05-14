'use client';

import React from 'react';
import type { CalculatorVisualProps } from '@/types';

export function OhmVisualizer({ result }: CalculatorVisualProps) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full text-slate-800 dark:text-slate-200">
      {/* Simple Circuit */}
      <rect
        x="10"
        y="30"
        width="80"
        height="40"
        rx="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* Battery/Voltage Source */}
      <line x1="10" y1="45" x2="10" y2="55" stroke="currentColor" strokeWidth="4" />
      <line x1="5" y1="48" x2="15" y2="48" stroke="currentColor" strokeWidth="2" />
      {/* Resistor zig-zag */}
      <path
        d="M40 30 L45 20 L55 40 L60 30"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        transform="translate(0, 40) rotate(-90, 50, 30)"
      />
      {/* Labels */}
      <text x="50" y="75" textAnchor="middle" fontSize="10" fontWeight="bold" fill="currentColor">
        V = I × R
      </text>
      <text x="5" y="52" textAnchor="end" fontSize="8" fill="currentColor">
        V
      </text>
      <text x="50" y="25" textAnchor="middle" fontSize="8" fill="currentColor">
        R (Ω)
      </text>
      <text x="95" y="52" textAnchor="start" fontSize="8" fill="currentColor">
        I (A)
      </text>
    </svg>
  );
}
