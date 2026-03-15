/**
 * @file geometry.test.ts
 * @description TDD contract tests for src/lib/formulas/geometry.ts
 *
 * Covered:
 *   - Sphere  (volume, surface area, centroid)
 *   - Cylinder (volume, lateral area, total surface area)
 *   - Cone    (volume, slant height, lateral area, total surface area)
 *   - Rectangular Prism / Box
 *   - Torus
 *   - Regular Polygon (area, perimeter, apothem)
 *   - Composite: L-section (volume, centroid)
 */

import { describe, it, expect } from 'vitest';
import {
  sphere,
  cylinder,
  cone,
  rectangularPrism,
  torus,
  regularPolygon,
} from '../../lib/formulas/geometry';

const π = Math.PI;

// ─────────────────────────────────────────────────────────────────────────────

// Regular Polygon

// ─────────────────────────────────────────────────────────────────────────────

describe('Regular Polygon', () => {
  /**
   * n = number of sides, s = side length
   *
   * Perimeter: P = n·s
   * Apothem:   a = s / (2·tan(π/n))
   * Area:      A = (n·s²) / (4·tan(π/n))
   */

  it('square (n=4, s=2): area=4, perimeter=8', () => {
    const r = regularPolygon({ sides: 4, sideLength: 2 });
    expect(r.area).toBeCloseTo(4, 4);
    expect(r.perimeter).toBeCloseTo(8, 4);
  });

  it('equilateral triangle (n=3, s=2): area=√3 ≈ 1.732', () => {
    const r = regularPolygon({ sides: 3, sideLength: 2 });
    expect(r.area).toBeCloseTo(Math.sqrt(3), 4);
  });

  it('hexagon (n=6, s=1): area = 3√3/2 ≈ 2.598', () => {
    const r = regularPolygon({ sides: 6, sideLength: 1 });
    expect(r.area).toBeCloseTo((3 * Math.sqrt(3)) / 2, 4);
  });

  it('apothem of a square with s=2 → a=1', () => {
    const r = regularPolygon({ sides: 4, sideLength: 2 });
    expect(r.apothem).toBeCloseTo(1, 4);
  });

  it('throws for fewer than 3 sides', () => {
    expect(() => regularPolygon({ sides: 2, sideLength: 1 })).toThrow();
  });

  it('throws for zero or negative side length', () => {
    expect(() => regularPolygon({ sides: 6, sideLength: 0 })).toThrow();
  });
});
