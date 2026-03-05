'use client';

import React from 'react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  className?: string;
}

const RESISTOR_COLORS = [
  { name: 'black', hex: '#000000' },
  { name: 'brown', hex: '#8B4513' },
  { name: 'red', hex: '#FF0000' },
  { name: 'orange', hex: '#FFA500' },
  { name: 'yellow', hex: '#FFFF00' },
  { name: 'green', hex: '#00FF00' },
  { name: 'blue', hex: '#0000FF' },
  { name: 'violet', hex: '#8B008B' },
  { name: 'gray', hex: '#808080' },
  { name: 'white', hex: '#FFFFFF' },
  { name: 'gold', hex: '#FFD700' },
  { name: 'silver', hex: '#C0C0C0' }
];

export function ColorPicker({ value, onChange, label, className = '' }: ColorPickerProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <div className="grid grid-cols-6 gap-1">
        {RESISTOR_COLORS.map((color) => (
          <button
            key={color.name}
            onClick={() => onChange(color.name)}
            className={`w-8 h-8 rounded border-2 transition-all ${
              value === color.name
                ? 'border-blue-500 scale-110 shadow-lg'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            style={{ backgroundColor: color.hex }}
            title={color.name}
          />
        ))}
      </div>
    </div>
  );
}
