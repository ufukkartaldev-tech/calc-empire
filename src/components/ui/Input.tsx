'use client';

import React from 'react';

interface InputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  unit?: string;
  step?: number;
  min?: number;
  max?: number;
  className?: string;
}

export function Input({
  value,
  onChange,
  label,
  unit = '',
  step = 1,
  min,
  max,
  className = '',
}: InputProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <div className="flex items-center space-x-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          step={step}
          min={min}
          max={max}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {unit && <span className="text-sm text-gray-600">{unit}</span>}
      </div>
    </div>
  );
}
