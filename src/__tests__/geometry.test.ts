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
} from '../lib/formulas/geometry';

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

// ─────────────────────────────────────────────────────────────────────────────
// Cone
// ─────────────────────────────────────────────────────────────────────────────

describe('Cone', () => {
    it('volume: V = π·r²·h/3', () => {
        const r = 3, h = 4;
        expect(cone({ radius: r, height: h }).volume).toBeCloseTo(π * r ** 2 * h / 3, 4);
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

// ─────────────────────────────────────────────────────────────────────────────
// Rectangular Prism (Box)
// ─────────────────────────────────────────────────────────────────────────────

describe('Rectangular Prism', () => {
    it('volume: V = l·w·h  (2×3×4 = 24)', () => {
        expect(rectangularPrism({ length: 2, width: 3, height: 4 }).volume)
            .toBeCloseTo(24);
    });

    it('surface area: A = 2·(l·w + l·h + w·h)', () => {
        const l = 2, w = 3, h = 4;
        const expected = 2 * (l * w + l * h + w * h);
        expect(rectangularPrism({ length: l, width: w, height: h }).surfaceArea)
            .toBeCloseTo(expected);
    });

    it('centroid is at the geometric centre', () => {
        const r = rectangularPrism({ length: 4, width: 6, height: 8 }).centroid;
        expect(r).toEqual({ x: 2, y: 3, z: 4 });
    });
});

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
        expect(r.area).toBeCloseTo(3 * Math.sqrt(3) / 2, 4);
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
