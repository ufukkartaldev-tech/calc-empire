/**
 * @file stores/calculusStore.ts
 * @description Zustand store for CalculusCalculator state management
 * Centralizes complex state and computed calculations
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  evaluateFunction,
  calculateDerivative,
  calculateIntegral,
  generatePlotPoints,
} from '@/lib/formulas/mathematics';
import { generateSmoothPath, normalizeToSvg } from '@/utils/svg-helpers';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ViewBox {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

interface PlotPoint {
  x: number;
  y: number;
}

interface CalculusState {
  // Input state
  expression: string;
  pointX: number;
  rangeA: number;
  rangeB: number;
  viewBox: ViewBox;

  // Computed values (derived state)
  fxAtPoint: number;
  derivativeResult: number;
  integralResult: number;
  plotPoints: PlotPoint[];
  curvePath: string;
  tangentPoints: PlotPoint[];
  integralAreaPoints: string;

  // Actions
  setExpression: (expression: string) => void;
  setPointX: (pointX: number) => void;
  setRangeA: (rangeA: number) => void;
  setRangeB: (rangeB: number) => void;
  setViewBox: (viewBox: Partial<ViewBox>) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetDefaults: () => void;
  loadExample: (example: 'parabola' | 'sine' | 'gaussian') => void;

  // Internal recalculation methods
  recalculate: () => void;
  recalculatePlot: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_STATE = {
  expression: 'sin(x)',
  pointX: 0,
  rangeA: 0,
  rangeB: Math.PI,
  viewBox: {
    xMin: -5,
    xMax: 5,
    yMin: -2,
    yMax: 2,
  },
};

const SVG_WIDTH = 500;
const SVG_HEIGHT = 250;
const PLOT_POINTS_COUNT = 150;
const INTEGRAL_POINTS_COUNT = 50;
const TANGENT_LENGTH = 2;

// ─────────────────────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────────────────────

export const useCalculusStore = create<CalculusState>()(
  devtools(
    (set, get) =>
      ({
        // Initial state
        ...DEFAULT_STATE,

        // Computed values (initialized with defaults)
        fxAtPoint: evaluateFunction(DEFAULT_STATE.expression, DEFAULT_STATE.pointX),
        derivativeResult: calculateDerivative(DEFAULT_STATE.expression, DEFAULT_STATE.pointX),
        integralResult: calculateIntegral(
          DEFAULT_STATE.expression,
          DEFAULT_STATE.rangeA,
          DEFAULT_STATE.rangeB
        ),
        plotPoints: [],
        curvePath: '',
        tangentPoints: [],
        integralAreaPoints: '',

        // Actions
        setExpression: (expression) => {
          set({ expression }, false, 'setExpression');
          get().recalculate();
        },

        setPointX: (pointX) => {
          set({ pointX }, false, 'setPointX');
          get().recalculate();
        },

        setRangeA: (rangeA) => {
          set({ rangeA }, false, 'setRangeA');
          get().recalculate();
        },

        setRangeB: (rangeB) => {
          set({ rangeB }, false, 'setRangeB');
          get().recalculate();
        },

        setViewBox: (partialViewBox) => {
          const currentViewBox = get().viewBox;
          set({ viewBox: { ...currentViewBox, ...partialViewBox } }, false, 'setViewBox');
          get().recalculatePlot();
        },

        zoomIn: () => {
          const { viewBox } = get();
          set(
            {
              viewBox: {
                ...viewBox,
                yMin: viewBox.yMin + 1,
                yMax: viewBox.yMax - 1,
              },
            },
            false,
            'zoomIn'
          );
          get().recalculatePlot();
        },

        zoomOut: () => {
          const { viewBox } = get();
          set(
            {
              viewBox: {
                ...viewBox,
                yMin: viewBox.yMin - 1,
                yMax: viewBox.yMax + 1,
              },
            },
            false,
            'zoomOut'
          );
          get().recalculatePlot();
        },

        resetDefaults: () => {
          set(
            {
              ...DEFAULT_STATE,
              fxAtPoint: evaluateFunction(DEFAULT_STATE.expression, DEFAULT_STATE.pointX),
              derivativeResult: calculateDerivative(DEFAULT_STATE.expression, DEFAULT_STATE.pointX),
              integralResult: calculateIntegral(
                DEFAULT_STATE.expression,
                DEFAULT_STATE.rangeA,
                DEFAULT_STATE.rangeB
              ),
            },
            false,
            'resetDefaults'
          );
          get().recalculatePlot();
        },

        loadExample: (example) => {
          switch (example) {
            case 'parabola':
              set(
                {
                  expression: 'x^2',
                  pointX: 1,
                  rangeA: 0,
                  rangeB: 2,
                },
                false,
                'loadExample/parabola'
              );
              break;
            case 'sine':
              set(
                {
                  expression: 'sin(x)',
                  pointX: Math.PI / 2,
                  rangeA: 0,
                  rangeB: Math.PI,
                },
                false,
                'loadExample/sine'
              );
              break;
            case 'gaussian':
              set(
                {
                  expression: 'exp(-x^2)',
                  pointX: 0,
                  rangeA: -2,
                  rangeB: 2,
                },
                false,
                'loadExample/gaussian'
              );
              break;
          }
          get().recalculate();
        },

        // ─────────────────────────────────────────────────────────────────────────
        // Internal recalculation methods (not exposed in interface)
        // ─────────────────────────────────────────────────────────────────────────

        recalculate: () => {
          const { expression, pointX, rangeA, rangeB, viewBox } = get();

          // Core calculations
          const fxAtPoint = evaluateFunction(expression, pointX);
          const derivativeResult = calculateDerivative(expression, pointX);
          const integralResult = calculateIntegral(expression, rangeA, rangeB);

          // Plot data
          const rawPlotPoints = generatePlotPoints(
            expression,
            viewBox.xMin,
            viewBox.xMax,
            PLOT_POINTS_COUNT
          );
          const plotPoints = rawPlotPoints.map((p) => ({
            x: normalizeToSvg(p.x, viewBox.xMin, viewBox.xMax, 0, SVG_WIDTH),
            y: normalizeToSvg(p.y, viewBox.yMin, viewBox.yMax, SVG_HEIGHT, 0),
          }));
          const curvePath = generateSmoothPath(plotPoints);

          // Tangent line
          let tangentPoints: PlotPoint[] = [];
          if (!isNaN(derivativeResult) && !isNaN(fxAtPoint)) {
            const x1 = pointX - TANGENT_LENGTH;
            const x2 = pointX + TANGENT_LENGTH;
            const y1 = fxAtPoint + derivativeResult * (x1 - pointX);
            const y2 = fxAtPoint + derivativeResult * (x2 - pointX);
            tangentPoints = [
              {
                x: normalizeToSvg(x1, viewBox.xMin, viewBox.xMax, 0, SVG_WIDTH),
                y: normalizeToSvg(y1, viewBox.yMin, viewBox.yMax, SVG_HEIGHT, 0),
              },
              {
                x: normalizeToSvg(x2, viewBox.xMin, viewBox.xMax, 0, SVG_WIDTH),
                y: normalizeToSvg(y2, viewBox.yMin, viewBox.yMax, SVG_HEIGHT, 0),
              },
            ];
          }

          // Integral area
          const rawIntegralPoints = generatePlotPoints(
            expression,
            rangeA,
            rangeB,
            INTEGRAL_POINTS_COUNT
          );
          const mappedIntegralPoints = rawIntegralPoints.map((p) => ({
            x: normalizeToSvg(p.x, viewBox.xMin, viewBox.xMax, 0, SVG_WIDTH),
            y: normalizeToSvg(p.y, viewBox.yMin, viewBox.yMax, SVG_HEIGHT, 0),
          }));
          let integralAreaPoints = '';
          if (mappedIntegralPoints.length >= 2) {
            const xBaseA = normalizeToSvg(rangeA, viewBox.xMin, viewBox.xMax, 0, SVG_WIDTH);
            const xBaseB = normalizeToSvg(rangeB, viewBox.xMin, viewBox.xMax, 0, SVG_WIDTH);
            const yZero = normalizeToSvg(0, viewBox.yMin, viewBox.yMax, SVG_HEIGHT, 0);
            let d = `M ${xBaseA} ${yZero}`;
            mappedIntegralPoints.forEach((p) => {
              d += ` L ${p.x} ${p.y}`;
            });
            d += ` L ${xBaseB} ${yZero} Z`;
            integralAreaPoints = d;
          }

          set(
            {
              fxAtPoint,
              derivativeResult,
              integralResult,
              plotPoints,
              curvePath,
              tangentPoints,
              integralAreaPoints,
            },
            false,
            'recalculate'
          );
        },

        recalculatePlot: () => {
          const { expression, pointX, rangeA, rangeB, viewBox } = get();

          // Plot data (viewBox değiştiğinde sadece bu kısım güncellenir)
          const rawPlotPoints = generatePlotPoints(
            expression,
            viewBox.xMin,
            viewBox.xMax,
            PLOT_POINTS_COUNT
          );
          const plotPoints = rawPlotPoints.map((p) => ({
            x: normalizeToSvg(p.x, viewBox.xMin, viewBox.xMax, 0, SVG_WIDTH),
            y: normalizeToSvg(p.y, viewBox.yMin, viewBox.yMax, SVG_HEIGHT, 0),
          }));
          const curvePath = generateSmoothPath(plotPoints);

          // Tangent line (viewBox değiştiğinde yeniden hesaplanmalı)
          const { derivativeResult } = get();
          const fxAtPoint = evaluateFunction(expression, pointX);
          let tangentPoints: PlotPoint[] = [];
          if (!isNaN(derivativeResult) && !isNaN(fxAtPoint)) {
            const x1 = pointX - TANGENT_LENGTH;
            const x2 = pointX + TANGENT_LENGTH;
            const y1 = fxAtPoint + derivativeResult * (x1 - pointX);
            const y2 = fxAtPoint + derivativeResult * (x2 - pointX);
            tangentPoints = [
              {
                x: normalizeToSvg(x1, viewBox.xMin, viewBox.xMax, 0, SVG_WIDTH),
                y: normalizeToSvg(y1, viewBox.yMin, viewBox.yMax, SVG_HEIGHT, 0),
              },
              {
                x: normalizeToSvg(x2, viewBox.xMin, viewBox.xMax, 0, SVG_WIDTH),
                y: normalizeToSvg(y2, viewBox.yMin, viewBox.yMax, SVG_HEIGHT, 0),
              },
            ];
          }

          // Integral area (viewBox değiştiğinde yeniden hesaplanmalı)
          const rawIntegralPoints = generatePlotPoints(
            expression,
            rangeA,
            rangeB,
            INTEGRAL_POINTS_COUNT
          );
          const mappedIntegralPoints = rawIntegralPoints.map((p) => ({
            x: normalizeToSvg(p.x, viewBox.xMin, viewBox.xMax, 0, SVG_WIDTH),
            y: normalizeToSvg(p.y, viewBox.yMin, viewBox.yMax, SVG_HEIGHT, 0),
          }));
          let integralAreaPoints = '';
          if (mappedIntegralPoints.length >= 2) {
            const xBaseA = normalizeToSvg(rangeA, viewBox.xMin, viewBox.xMax, 0, SVG_WIDTH);
            const xBaseB = normalizeToSvg(rangeB, viewBox.xMin, viewBox.xMax, 0, SVG_WIDTH);
            const yZero = normalizeToSvg(0, viewBox.yMin, viewBox.yMax, SVG_HEIGHT, 0);
            let d = `M ${xBaseA} ${yZero}`;
            mappedIntegralPoints.forEach((p) => {
              d += ` L ${p.x} ${p.y}`;
            });
            d += ` L ${xBaseB} ${yZero} Z`;
            integralAreaPoints = d;
          }

          set(
            {
              plotPoints,
              curvePath,
              tangentPoints,
              integralAreaPoints,
            },
            false,
            'recalculatePlot'
          );
        },
      }) as CalculusState & { recalculate: () => void; recalculatePlot: () => void },
    { name: 'calculusStore' }
  )
);

// Initialize store with calculated values
useCalculusStore.getState().recalculate();
