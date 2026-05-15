'use client';

import React from 'react';

interface DimensionLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  color?: string;
  fontSize?: number;
  offset?: number;
}

export function DimensionLine({
  x1,
  y1,
  x2,
  y2,
  label,
  color = '#6B7280',
  fontSize = 10,
  offset = 10,
}: DimensionLineProps) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2 + offset;

  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1" />
      <line x1={x1} y1={y1 - 3} x2={x1} y2={y1 + 3} stroke={color} strokeWidth="1" />
      <line x1={x2} y1={y2 - 3} x2={x2} y2={y2 + 3} stroke={color} strokeWidth="1" />
      <text x={midX} y={midY} textAnchor="middle" fontSize={fontSize} fill={color}>
        {label}
      </text>
    </g>
  );
}
