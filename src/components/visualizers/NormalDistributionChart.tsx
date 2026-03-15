'use client';

import React, { useState, useMemo } from 'react';
import { normalPdf } from '@/lib/formulas/statistics';
import { Input } from '../ui/Input';
import {
  generateNormalDistributionPoints,
  generateSmoothPath,
  normalizeToSvg,
} from '@/utils/svg-helpers';

interface NormalDistributionChartProps {
  className?: string;
}

export function NormalDistributionChart({ className = '' }: NormalDistributionChartProps) {
  const [mean, setMean] = useState<number>(0);
  const [stdDev, setStdDev] = useState<number>(1);

  // Generate bell curve path using utility functions
  const bellCurvePath = useMemo(() => {
    const points = generateNormalDistributionPoints(mean, stdDev, 100, 4);
    return generateSmoothPath(points);
  }, [mean, stdDev]);

  // Generate filled area path
  const fillAreaPath = useMemo(() => {
    const points = generateNormalDistributionPoints(mean, stdDev, 100, 4);
    const smoothPath = generateSmoothPath(points);
    // Close the path by adding bottom line
    return `${smoothPath} L 400 200 L 0 200 Z`;
  }, [mean, stdDev]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const peakHeight = normalPdf(mean, mean, stdDev);
    const range = 4;
    const xMin = mean - range * stdDev;
    const xMax = mean + range * stdDev;

    return {
      peakHeight,
      xMin,
      xMax,
      meanX: normalizeToSvg(mean, xMin, xMax, 0, 400),
    };
  }, [mean, stdDev]);

  // Generate grid lines and labels
  const generateGridAndLabels = () => {
    const range = 4;
    const xMin = mean - range * stdDev;
    const xMax = mean + range * stdDev;

    const elements: React.ReactNode[] = [];

    // Vertical grid lines and x-axis labels
    for (let i = 0; i <= 8; i++) {
      const x = (i / 8) * 400;
      const value = xMin + (i / 8) * (xMax - xMin);

      elements.push(
        <g key={`grid-${i}`}>
          <line x1={x} y1="0" x2={x} y2="200" stroke="#E5E7EB" strokeWidth="1" />
          <text x={x} y="220" textAnchor="middle" fontSize="12" fill="#6B7280">
            {value.toFixed(1)}
          </text>
        </g>
      );
    }

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = (i / 5) * 200;
      elements.push(
        <line key={`hgrid-${i}`} x1="0" y1={y} x2="400" y2={y} stroke="#E5E7EB" strokeWidth="1" />
      );
    }

    // Mean line (dashed)
    elements.push(
      <line
        key="mean-line"
        x1={statistics.meanX}
        y1="0"
        x2={statistics.meanX}
        y2="200"
        stroke="#EF4444"
        strokeWidth="2"
        strokeDasharray="8,4"
      />
    );

    // Mean label
    elements.push(
      <text
        key="mean-label"
        x={statistics.meanX}
        y="15"
        textAnchor="middle"
        fontSize="12"
        fill="#EF4444"
        fontWeight="bold"
      >
        μ = {mean}
      </text>
    );

    return elements;
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Normal Distribution (Bell Curve)</h2>

      {/* Input Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Input
          value={mean}
          onChange={setMean}
          label="Ortalama (Mean)"
          step={0.1}
          className="w-full"
        />

        <Input
          value={stdDev}
          onChange={setStdDev}
          label="Standart Sapma (StdDev)"
          step={0.1}
          min={0.1}
          className="w-full"
        />
      </div>

      {/* SVG Chart */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg overflow-x-auto">
        <svg width="400" height="250" viewBox="0 0 400 250" className="w-full h-auto">
          {/* Grid and labels */}
          {generateGridAndLabels()}

          {/* Filled area under curve */}
          <path d={fillAreaPath} fill="#3B82F6" fillOpacity="0.3" />

          {/* Bell curve */}
          <path d={bellCurvePath} fill="none" stroke="#3B82F6" strokeWidth="3" />

          {/* Axes */}
          <line x1="0" y1="200" x2="400" y2="200" stroke="#374151" strokeWidth="2" />
          <line x1="0" y1="0" x2="0" y2="200" stroke="#374151" strokeWidth="2" />

          {/* Axis labels */}
          <text x="200" y="245" textAnchor="middle" fontSize="14" fill="#374151" fontWeight="bold">
            X Değerleri
          </text>
          <text x="15" y="15" fontSize="14" fill="#374151" fontWeight="bold">
            P(X)
          </text>
        </svg>
      </div>

      {/* Statistics */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Dağılım İstatistikleri</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-blue-700">Ortalama (μ)</p>
            <p className="text-xl font-bold text-blue-800">{mean}</p>
          </div>
          <div>
            <p className="text-sm text-blue-700">Std Sapma (σ)</p>
            <p className="text-xl font-bold text-blue-800">{stdDev}</p>
          </div>
          <div>
            <p className="text-sm text-blue-700">Tepe Yüksekliği</p>
            <p className="text-xl font-bold text-blue-800">{statistics.peakHeight.toFixed(4)}</p>
          </div>
          <div>
            <p className="text-sm text-blue-700">Gösterilen Aralık</p>
            <p className="text-xl font-bold text-blue-800">
              [{statistics.xMin.toFixed(1)}, {statistics.xMax.toFixed(1)}]
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-blue-300">
          <p className="text-sm font-semibold text-blue-800 mb-2">Empirik Kural (68-95-99.7)</p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <p className="text-blue-700">±1σ</p>
              <p className="font-bold text-blue-800">68.27%</p>
            </div>
            <div className="text-center">
              <p className="text-blue-700">±2σ</p>
              <p className="font-bold text-blue-800">95.45%</p>
            </div>
            <div className="text-center">
              <p className="text-blue-700">±3σ</p>
              <p className="font-bold text-blue-800">99.73%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
