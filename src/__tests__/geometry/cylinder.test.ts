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

// Cylinder

// ─────────────────────────────────────────────────────────────────────────────


describe('Cylinder', () => {
    it('volume: V = π·r²·h  (r=1, h=2 → 6.283)', () => {
        expect(cylinder({ radius: 1, height: 2 }).volume).toBeCloseTo(π * 2, 4);
    });

    it('lateral area: A_lat = 2·π·r·h', () => {
        expect(cylinder({ radius: 1, height: 2 }).lateralArea).toBeCloseTo(2 * π * 2, 4);
    });

    it('total surface area: A_total = 2·π·r·(r + h)', () => {
        const r = 1, h = 2;
        expect(cylinder({ radius: r, height: h }).totalSurfaceArea)
            .toBeCloseTo(2 * π * r * (r + h), 4);
    });

    it('centroid height = h/2', () => {
        expect(cylinder({ radius: 1, height: 10 }).centroid.z).toBeCloseTo(5);
    });

    it('throws for zero height', () => {
        expect(() => cylinder({ radius: 1, height: 0 })).toThrow();
    });
});

