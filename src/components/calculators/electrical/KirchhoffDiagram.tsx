import React from 'react';
import { useTranslations } from 'next-intl';

interface KirchhoffDiagramProps {
  hasResults: boolean;
}

export function KirchhoffDiagram({ hasResults }: KirchhoffDiagramProps) {
  const t = useTranslations('Kirchhoff');
  return (
    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center relative">
      <h3 className="absolute top-4 left-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">
        {t('visualizerTitle')}
      </h3>

      <svg width="300" height="240" viewBox="0 0 300 240" className="mt-6 drop-shadow-sm">
        {/* Wires */}
        <path
          d="M 50 180 L 50 60 L 150 60 L 150 180 Z"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="3"
        />
        <path
          d="M 150 180 L 150 60 L 250 60 L 250 180 Z"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="3"
        />

        {/* V1 Source */}
        <circle
          cx="50"
          cy="120"
          r="15"
          fill="white"
          stroke="#3b82f6"
          strokeWidth="3"
          className="dark:fill-slate-900"
        />
        <text x="50" y="117" textAnchor="middle" fontSize="14" fill="#3b82f6" fontWeight="bold">
          +
        </text>
        <text x="50" y="128" textAnchor="middle" fontSize="14" fill="#3b82f6" fontWeight="bold">
          -
        </text>
        <text
          x="20"
          y="124"
          textAnchor="end"
          fontSize="12"
          fill="currentColor"
          className="text-slate-600 dark:text-slate-300 font-bold"
        >
          V₁
        </text>

        {/* V2 Source */}
        <circle
          cx="250"
          cy="120"
          r="15"
          fill="white"
          stroke="#3b82f6"
          strokeWidth="3"
          className="dark:fill-slate-900"
        />
        <text x="250" y="117" textAnchor="middle" fontSize="14" fill="#3b82f6" fontWeight="bold">
          +
        </text>
        <text x="250" y="128" textAnchor="middle" fontSize="14" fill="#3b82f6" fontWeight="bold">
          -
        </text>
        <text
          x="280"
          y="124"
          textAnchor="start"
          fontSize="12"
          fill="currentColor"
          className="text-slate-600 dark:text-slate-300 font-bold"
        >
          V₂
        </text>

        {/* R1 Resistor */}
        <rect
          x="85"
          y="52"
          width="30"
          height="16"
          fill="white"
          stroke="#ef4444"
          strokeWidth="3"
          className="dark:fill-slate-900"
        />
        <text
          x="100"
          y="45"
          textAnchor="middle"
          fontSize="12"
          fill="currentColor"
          className="text-slate-600 dark:text-slate-300 font-bold"
        >
          R₁
        </text>
        <path d="M 85 60 L 115 60" stroke="#ef4444" strokeWidth="2" strokeDasharray="3 3" />

        {/* R2 Resistor */}
        <rect
          x="185"
          y="52"
          width="30"
          height="16"
          fill="white"
          stroke="#ef4444"
          strokeWidth="3"
          className="dark:fill-slate-900"
        />
        <text
          x="200"
          y="45"
          textAnchor="middle"
          fontSize="12"
          fill="currentColor"
          className="text-slate-600 dark:text-slate-300 font-bold"
        >
          R₂
        </text>
        <path d="M 185 60 L 215 60" stroke="#ef4444" strokeWidth="2" strokeDasharray="3 3" />

        {/* R3 Resistor (Middle branch) */}
        <rect
          x="142"
          y="105"
          width="16"
          height="30"
          fill="white"
          stroke="#ef4444"
          strokeWidth="3"
          className="dark:fill-slate-900"
        />
        <text
          x="170"
          y="124"
          textAnchor="start"
          fontSize="12"
          fill="currentColor"
          className="text-slate-600 dark:text-slate-300 font-bold"
        >
          R₃
        </text>
        <path d="M 150 105 L 150 135" stroke="#ef4444" strokeWidth="2" strokeDasharray="3 3" />

        {/* Current Arrows */}
        <g opacity={hasResults ? 1 : 0.3}>
          <path
            d="M 70 85 Q 100 85 130 150"
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            markerEnd="url(#arrow-green)"
            strokeDasharray="4 2"
          />
          <text x="90" y="80" textAnchor="middle" fontSize="11" fill="#10b981" fontWeight="bold">
            I₁
          </text>

          <path
            d="M 230 85 Q 200 85 170 150"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            markerEnd="url(#arrow-orange)"
            strokeDasharray="4 2"
          />
          <text x="210" y="80" textAnchor="middle" fontSize="11" fill="#f59e0b" fontWeight="bold">
            I₂
          </text>

          <path
            d="M 150 150 L 150 170"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="2.5"
            markerEnd="url(#arrow-purple)"
          />
          <text x="160" y="170" textAnchor="start" fontSize="11" fill="#8b5cf6" fontWeight="bold">
            I₃ (I₁+I₂)
          </text>
        </g>

        <defs>
          <marker
            id="arrow-green"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
          </marker>
          <marker
            id="arrow-orange"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
          </marker>
          <marker
            id="arrow-purple"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#8b5cf6" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}
