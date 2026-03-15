'use client';

import React, { useState, useMemo } from 'react';
import { resistorColorCode } from '@/lib/formulas/electrical';
import { ColorPicker } from '../ui/ColorPicker';

interface ResistorVisualizerProps {
  className?: string;
}

export function ResistorVisualizer({ className = '' }: ResistorVisualizerProps) {
  const [bandCount, setBandCount] = useState<4 | 5 | 6>(4);
  const [bands, setBands] = useState<string[]>(['brown', 'black', 'red', 'gold']);

  const result = useMemo(() => {
    try {
      return resistorColorCode(bands);
    } catch (error) {
      return null;
    }
  }, [bands]);

  const handleBandChange = (index: number, color: string) => {
    const newBands = [...bands];
    newBands[index] = color;
    setBands(newBands);
  };

  const handleBandCountChange = (count: 4 | 5 | 6) => {
    setBandCount(count);
    if (count === 4) {
      setBands(['brown', 'black', 'red', 'gold']);
    } else if (count === 5) {
      setBands(['brown', 'black', 'red', 'brown', 'gold']);
    } else {
      setBands(['brown', 'black', 'red', 'brown', 'gold', 'red']);
    }
  };

  const formatResistance = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)} MΩ`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(2)} kΩ`;
    } else {
      return `${value.toFixed(2)} Ω`;
    }
  };

  const getBandColor = (colorName: string) => {
    const colorMap: Record<string, string> = {
      black: '#000000',
      brown: '#8B4513',
      red: '#FF0000',
      orange: '#FFA500',
      yellow: '#FFFF00',
      green: '#00FF00',
      blue: '#0000FF',
      violet: '#8B008B',
      gray: '#808080',
      white: '#FFFFFF',
      gold: '#FFD700',
      silver: '#C0C0C0',
    };
    return colorMap[colorName] || '#CCCCCC';
  };

  const getBandPositions = () => {
    if (bandCount === 4) return [15, 25, 35, 45];
    if (bandCount === 5) return [12, 22, 32, 42, 52];
    return [10, 18, 26, 34, 42, 50];
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Resistor Color Code Calculator</h2>

      {/* Band Count Selection */}
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 mb-2 block">Number of Bands</label>
        <div className="flex space-x-2">
          {[4, 5, 6].map((count) => (
            <button
              key={count}
              onClick={() => handleBandCountChange(count as 4 | 5 | 6)}
              className={`px-4 py-2 rounded-md transition-colors ${
                bandCount === count
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {count} Bands
            </button>
          ))}
        </div>
      </div>

      {/* Color Pickers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {bands.map((band, index) => (
          <ColorPicker
            key={index}
            value={band}
            onChange={(color: string) => handleBandChange(index, color)}
            label={`Band ${index + 1}`}
          />
        ))}
      </div>

      {/* SVG Resistor Visualization */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <svg width="100%" height="120" viewBox="0 0 100 120" className="w-full max-w-md mx-auto">
          {/* Resistor Body */}
          <rect
            x="10"
            y="40"
            width="80"
            height="40"
            fill="#D2B48C"
            stroke="#8B7355"
            strokeWidth="2"
            rx="4"
          />

          {/* Left Lead */}
          <line x1="0" y1="60" x2="10" y2="60" stroke="#666666" strokeWidth="3" />

          {/* Right Lead */}
          <line x1="90" y1="60" x2="100" y2="60" stroke="#666666" strokeWidth="3" />

          {/* Color Bands */}
          {getBandPositions().map((position, index) => (
            <rect
              key={index}
              x={position}
              y="42"
              width="4"
              height="36"
              fill={getBandColor(bands[index] || 'black')}
              stroke="#333"
              strokeWidth="0.5"
            />
          ))}
        </svg>
      </div>

      {/* Result Display */}
      {result && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Calculated Resistance</h3>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-blue-800">
              {formatResistance(result.resistance)}
            </p>
            <p className="text-sm text-blue-700">Tolerance: ±{result.tolerance}%</p>
            {result.tempCoeff && (
              <p className="text-sm text-blue-700">
                Temperature Coefficient: {result.tempCoeff} ppm/K
              </p>
            )}
          </div>
        </div>
      )}

      {!result && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Invalid color combination. Please check your selections.</p>
        </div>
      )}
    </div>
  );
}
