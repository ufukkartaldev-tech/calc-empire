'use client';

import React from 'react';

interface ResistorBandProps {
  x: number;
  y?: number;
  width?: number;
  height?: number;
  color: string;
}

export function ResistorBand({ x, y = 42, width = 4, height = 36, color }: ResistorBandProps) {
  return (
    <rect x={x} y={y} width={width} height={height} fill={color} stroke="#333" strokeWidth="0.5" />
  );
}
