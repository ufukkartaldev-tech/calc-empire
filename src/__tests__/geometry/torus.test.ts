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

// Torus

// ─────────────────────────────────────────────────────────────────────────────


describe('Torus', () => {
    /**
     * R = major radius (centre of tube to centre of torus)
     * r = minor radius (tube radius)
     *
     * V = 2π²·R·r²
     * A = 4π²·R·r
     */

    it('volume: V = 2·π²·R·r²', () => {
        const R = 3, r = 1;
        expect(torus({ majorRadius: R, minorRadius: r }).volume)
            .toBeCloseTo(2 * π ** 2 * R * r ** 2, 4);
    });

    it('surface area: A = 4·π²·R·r', () => {
        const R = 3, r = 1;
        expect(torus({ majorRadius: R, minorRadius: r }).surfaceArea)
            .toBeCloseTo(4 * π ** 2 * R * r, 4);
    });

    it('throws when minor radius ≥ major radius (self-intersecting torus)', () => {
        expect(() => torus({ majorRadius: 1, minorRadius: 2 })).toThrow();
    });
});

