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

// Cone

// ─────────────────────────────────────────────────────────────────────────────

describe('Cone', () => {
  it('volume: V = π·r²·h/3', () => {
    const r = 3,
      h = 4;
    expect(cone({ radius: r, height: h }).volume).toBeCloseTo((π * r ** 2 * h) / 3, 4);
  });

  it('slant height: l = √(r² + h²)  (3-4-5 triangle → 5)', () => {
    expect(cone({ radius: 3, height: 4 }).slantHeight).toBeCloseTo(5, 4);
  });

  it('lateral area: A_lat = π·r·l', () => {
    const { lateralArea, slantHeight } = cone({ radius: 3, height: 4 });
    expect(lateralArea).toBeCloseTo(π * 3 * slantHeight, 4);
  });

  it('centroid height = h/4 from the base', () => {
    expect(cone({ radius: 3, height: 12 }).centroid.z).toBeCloseTo(3, 4);
  });
});
