'use client';

import { useMemo } from 'react';

interface CanvasTransformOptions {
  viewBox?: string;
  padding?: number;
  scale?: number;
}

export function useCanvasTransform(options: CanvasTransformOptions = {}) {
  const { viewBox = '0 0 120 120', padding = 10, scale = 1 } = options;

  const transform = useMemo(() => {
    return `translate(${padding}, 0) scale(${scale})`;
  }, [padding, scale]);

  return {
    viewBox,
    transform,
    padding,
    scale,
  };
}
