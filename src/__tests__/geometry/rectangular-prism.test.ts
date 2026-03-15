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

// Rectangular Prism (Box)

// ─────────────────────────────────────────────────────────────────────────────

describe('Rectangular Prism', () => {
  it('volume: V = l·w·h  (2×3×4 = 24)', () => {
    expect(rectangularPrism({ length: 2, width: 3, height: 4 }).volume).toBeCloseTo(24);
  });

  it('surface area: A = 2·(l·w + l·h + w·h)', () => {
    const l = 2,
      w = 3,
      h = 4;
    const expected = 2 * (l * w + l * h + w * h);
    expect(rectangularPrism({ length: l, width: w, height: h }).surfaceArea).toBeCloseTo(expected);
  });

  it('centroid is at the geometric centre', () => {
    const r = rectangularPrism({ length: 4, width: 6, height: 8 }).centroid;
    expect(r).toEqual({ x: 2, y: 3, z: 4 });
  });
});
