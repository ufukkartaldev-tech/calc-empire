'use client';

import React, { useState, useMemo } from 'react';
import { normalPdf } from '@/lib/formulas/statistics';
import { Input } from '../ui/Input';

interface NormalDistributionChartProps {
  className?: string;
}

export function NormalDistributionChart({ className = '' }: NormalDistributionChartProps) {
  const [mean, setMean] = useState<number>(0);
  const [stdDev, setStdDev] = useState<number>(1);

  // Generate bell curve path
  const generateBellCurve = () => {
    const points = 100;
    const range = 4; // Show ±4 standard deviations
    const xMin = mean - range * stdDev;
    const xMax = mean + range * stdDev;
    const xStep = (xMax - xMin) / points;
    
    const pathData: string[] = [];
    const maxY = normalPdf(mean, mean, stdDev);
    
    for (let i = 0; i <= points; i++) {
      const x = xMin + i * xStep;
      const y = normalPdf(x, mean, stdDev);
      
      // Normalize to SVG coordinates (0-400 width, 200 height, inverted y-axis)
      const svgX = ((x - xMin) / (xMax - xMin)) * 400;
      const svgY = 200 - (y / maxY) * 150; // Leave 50px margin at bottom
      
      if (i === 0) {
        pathData.push(`M ${svgX} ${svgY}`);
      } else {
        pathData.push(`L ${svgX} ${svgY}`);
      }
    }
    
    return pathData.join(' ');
  };

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
          <line
            x1={x}
            y1="0"
            x2={x}
            y2="200"
            stroke="#E5E7EB"
            strokeWidth="1"
          />
          <text
            x={x}
            y="220"
            textAnchor="middle"
            fontSize="12"
            fill="#6B7280"
          >
            {value.toFixed(1)}
          </text>
        </g>
      );
    }
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = (i / 5) * 200;
      elements.push(
        <line
          key={`hgrid-${i}`}
          x1="0"
          y1={y}
          x2="400"
          y2={y}
          stroke="#E5E7EB"
          strokeWidth="1"
        />
      );
    }
    
    // Mean line
    const meanX = ((mean - xMin) / (xMax - xMin)) * 400;
    elements.push(
      <line
        key="mean-line"
        x1={meanX}
        y1="0"
        x2={meanX}
        y2="200"
        stroke="#EF4444"
        strokeWidth="2"
        strokeDasharray="5,5"
      />
    );
    
    // Mean label
    elements.push(
      <text
        key="mean-label"
        x={meanX}
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

  // Calculate statistics
  const statistics = useMemo(() => {
    const range = 4;
    const xMin = mean - range * stdDev;
    const xMax = mean + range * stdDev;
    
    // Calculate percentage within 1, 2, 3 standard deviations
    const within1Std = 68.27; // Empirical rule
    const within2Std = 95.45;
    const within3Std = 99.73;
    
    return {
      xMin,
      xMax,
      within1Std,
      within2Std,
      within3Std,
      peakHeight: normalPdf(mean, mean, stdDev)
    };
  }, [mean, stdDev]);

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Normal Distribution (Bell Curve)</h2>
      
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Input
          value={mean}
          onChange={setMean}
          label="Mean (μ)"
          step={0.1}
          className="w-full"
        />
        
        <Input
          value={stdDev}
          onChange={setStdDev}
          label="Standard Deviation (σ)"
          step={0.1}
          min={0.1}
          className="w-full"
        />
      </div>

      {/* SVG Chart */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg overflow-x-auto">
        <svg
          width="400"
          height="250"
          viewBox="0 0 400 250"
          className="w-full h-auto"
        >
          {/* Grid and labels */}
          {generateGridAndLabels()}
          
          {/* Bell curve */}
          <path
            d={generateBellCurve()}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="3"
          />
          
          {/* Fill area under curve */}
          <path
            d={`${generateBellCurve()} L 400 200 L 0 200 Z`}
            fill="#3B82F6"
            fillOpacity="0.2"
          />
          
          {/* Axes */}
          <line x1="0" y1="200" x2="400" y2="200" stroke="#374151" strokeWidth="2" />
          <line x1="0" y1="0" x2="0" y2="200" stroke="#374151" strokeWidth="2" />
          
          {/* Axis labels */}
          <text x="200" y="245" textAnchor="middle" fontSize="14" fill="#374151" fontWeight="bold">
            X Values
          </text>
          <text x="15" y="15" fontSize="14" fill="#374151" fontWeight="bold">
            P(X)
          </text>
        </svg>
      </div>

      {/* Statistics */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Distribution Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-blue-700">Mean (μ)</p>
            <p className="text-xl font-bold text-blue-800">{mean}</p>
          </div>
          <div>
            <p className="text-sm text-blue-700">Std Dev (σ)</p>
            <p className="text-xl font-bold text-blue-800">{stdDev}</p>
          </div>
          <div>
            <p className="text-sm text-blue-700">Peak Height</p>
            <p className="text-xl font-bold text-blue-800">
              {statistics.peakHeight.toFixed(4)}
            </p>
          </div>
          <div>
            <p className="text-sm text-blue-700">Range Shown</p>
            <p className="text-xl font-bold text-blue-800">
              [{statistics.xMin.toFixed(1)}, {statistics.xMax.toFixed(1)}]
            </p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-blue-300">
          <p className="text-sm font-semibold text-blue-800 mb-2">Empirical Rule (68-95-99.7)</p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <p className="text-blue-700">±1σ</p>
              <p className="font-bold text-blue-800">{statistics.within1Std}%</p>
            </div>
            <div className="text-center">
              <p className="text-blue-700">±2σ</p>
              <p className="font-bold text-blue-800">{statistics.within2Std}%</p>
            </div>
            <div className="text-center">
              <p className="text-blue-700">±3σ</p>
              <p className="font-bold text-blue-800">{statistics.within3Std}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
