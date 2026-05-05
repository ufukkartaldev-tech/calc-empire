/**
 * @file calculus.test.ts
 * @description Unit tests for calculus operations (differentiation, integration)
 */

import { describe, it, expect } from 'vitest';
import {
  evaluateFunction,
  calculateDerivative,
  calculateIntegral,
  generatePlotPoints,
} from '@/lib/formulas/mathematics';

describe('Calculus - Function Evaluation', () => {
  it('evaluates polynomial functions correctly', () => {
    expect(evaluateFunction('x^2', 3)).toBeCloseTo(9);
    expect(evaluateFunction('x^3', 2)).toBeCloseTo(8);
    expect(evaluateFunction('2*x + 1', 5)).toBeCloseTo(11);
  });

  it('evaluates trigonometric functions', () => {
    expect(evaluateFunction('sin(x)', 0)).toBeCloseTo(0);
    expect(evaluateFunction('sin(x)', Math.PI / 2)).toBeCloseTo(1);
    expect(evaluateFunction('cos(x)', 0)).toBeCloseTo(1);
    expect(evaluateFunction('cos(x)', Math.PI)).toBeCloseTo(-1);
  });

  it('evaluates exponential and logarithmic functions', () => {
    expect(evaluateFunction('exp(x)', 0)).toBeCloseTo(1);
    expect(evaluateFunction('exp(x)', 1)).toBeCloseTo(Math.E, 5);
    expect(evaluateFunction('log(x)', 1)).toBeCloseTo(0);
    expect(evaluateFunction('log(x)', Math.E)).toBeCloseTo(1, 5);
  });

  it('evaluates square root and absolute value', () => {
    expect(evaluateFunction('sqrt(x)', 4)).toBeCloseTo(2);
    expect(evaluateFunction('sqrt(x)', 9)).toBeCloseTo(3);
    expect(evaluateFunction('abs(x)', -5)).toBeCloseTo(5);
    expect(evaluateFunction('abs(x)', 5)).toBeCloseTo(5);
  });

  it('handles complex expressions', () => {
    expect(evaluateFunction('sin(x) * x', Math.PI / 2)).toBeCloseTo(Math.PI / 2, 5);
    expect(evaluateFunction('x^2 + 2*x + 1', 3)).toBeCloseTo(16);
  });

  it('returns NaN for invalid expressions', () => {
    expect(evaluateFunction('invalid', 1)).toBeNaN();
    expect(evaluateFunction('sqrt(-1)', 1)).toBeNaN();
  });
});

describe('Calculus - Differentiation', () => {
  it('calculates derivative of polynomial correctly', () => {
    // f(x) = x^2, f'(x) = 2x, f'(3) = 6
    expect(calculateDerivative('x^2', 3)).toBeCloseTo(6, 4);
    // f(x) = x^3, f'(x) = 3x^2, f'(2) = 12
    expect(calculateDerivative('x^3', 2)).toBeCloseTo(12, 4);
  });

  it('calculates derivative of trigonometric functions', () => {
    // f(x) = sin(x), f'(x) = cos(x), f'(0) = 1
    expect(calculateDerivative('sin(x)', 0)).toBeCloseTo(1, 4);
    // f(x) = cos(x), f'(x) = -sin(x), f'(0) = 0
    expect(calculateDerivative('cos(x)', 0)).toBeCloseTo(0, 4);
  });

  it('calculates derivative of exponential functions', () => {
    // f(x) = exp(x), f'(x) = exp(x), f'(0) = 1
    expect(calculateDerivative('exp(x)', 0)).toBeCloseTo(1, 4);
  });
});

describe('Calculus - Integration', () => {
  it('calculates definite integral of constant function', () => {
    // ∫(1 dx) from 0 to 5 = 5
    expect(calculateIntegral('1', 0, 5)).toBeCloseTo(5, 2);
  });

  it('calculates definite integral of linear function', () => {
    // ∫(x dx) from 0 to 4 = 8
    expect(calculateIntegral('x', 0, 4)).toBeCloseTo(8, 2);
    // ∫(2*x dx) from 0 to 3 = 9
    expect(calculateIntegral('2*x', 0, 3)).toBeCloseTo(9, 2);
  });

  it('calculates definite integral of polynomial', () => {
    // ∫(x^2 dx) from 0 to 3 = 9
    expect(calculateIntegral('x^2', 0, 3)).toBeCloseTo(9, 2);
  });

  it('calculates definite integral of trigonometric functions', () => {
    // ∫(sin(x) dx) from 0 to π = 2
    expect(calculateIntegral('sin(x)', 0, Math.PI)).toBeCloseTo(2, 2);
  });
});

describe('Calculus - Plot Point Generation', () => {
  it('generates correct number of points', () => {
    const points = generatePlotPoints('x^2', -5, 5, 50);
    expect(points.length).toBe(51); // n+1 points
  });

  it('generates points with correct x values', () => {
    const points = generatePlotPoints('x', 0, 10, 10);
    expect(points[0].x).toBeCloseTo(0);
    expect(points[10].x).toBeCloseTo(10);
    expect(points[5].x).toBeCloseTo(5);
  });

  it('generates points with correct y values for identity function', () => {
    const points = generatePlotPoints('x', 0, 5, 5);
    points.forEach((point) => {
      expect(point.y).toBeCloseTo(point.x);
    });
  });

  it('filters out invalid points', () => {
    const points = generatePlotPoints('sqrt(x)', -5, 5, 50);
    // Should only include points where x >= 0
    expect(points.every((p) => p.x >= 0)).toBe(true);
  });
});
