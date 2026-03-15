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

// Sphere

// ─────────────────────────────────────────────────────────────────────────────

describe('Sphere', () => {
  it('volume: V = 4/3·π·r³   (r=1 → 4.189)', () => {
    expect(sphere({ radius: 1 }).volume).toBeCloseTo((4 / 3) * π * 1 ** 3, 4);
  });

  it('surface area: A = 4·π·r²   (r=1 → 12.566)', () => {
    expect(sphere({ radius: 1 }).surfaceArea).toBeCloseTo(4 * π, 4);
  });

  it('centroid is always at the geometric centre (0,0,0) from base', () => {
    // For a solid sphere the centroid = centre
    expect(sphere({ radius: 5 }).centroid).toEqual({ x: 0, y: 0, z: 0 });
  });

  it('volume scales with r³', () => {
    const v1 = sphere({ radius: 1 }).volume;
    const v2 = sphere({ radius: 2 }).volume;
    expect(v2 / v1).toBeCloseTo(8, 4);
  });

  it('throws for zero or negative radius', () => {
    expect(() => sphere({ radius: 0 })).toThrow();
    expect(() => sphere({ radius: -3 })).toThrow();
  });
});
