'use client';

import React from 'react';

interface ArrowMarkerProps {
  id: string;
  color?: string;
}

export function ArrowMarker({ id, color = '#FF0000' }: ArrowMarkerProps) {
  return (
    <defs>
      <marker id={id} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill={color} />
      </marker>
    </defs>
  );
}
