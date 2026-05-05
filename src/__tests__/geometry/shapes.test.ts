/**
 * @file shapes.test.ts
 * @description Unit tests for 2D and 3D geometry calculations
 */

import { describe, it, expect } from 'vitest';
import {
  sphere,
  cylinder,
  cone,
  rectangularPrism,
  torus,
  regularPolygon,
  circle,
  rectangle,
  triangle,
} from '@/lib/formulas/geometry';
import { PI } from '@/constants/physics';

describe('Geometry - Circle', () => {
  it('calculates area and perimeter correctly', () => {
    const result = circle(5);
    expect(result.area).toBeCloseTo(PI * 25, 5);
    expect(result.perimeter).toBeCloseTo(2 * PI * 5, 5);
  });

  it('handles unit circle', () => {
    const result = circle(1);
    expect(result.area).toBeCloseTo(PI, 5);
    expect(result.perimeter).toBeCloseTo(2 * PI, 5);
  });

  it('throws for non-positive radius', () => {
    expect(() => circle(0)).toThrow('Radius must be > 0');
    expect(() => circle(-5)).toThrow('Radius must be > 0');
  });
});

describe('Geometry - Rectangle', () => {
  it('calculates area and perimeter correctly', () => {
    const result = rectangle(10, 5);
    expect(result.area).toBe(50);
    expect(result.perimeter).toBe(30);
  });

  it('handles square', () => {
    const result = rectangle(5, 5);
    expect(result.area).toBe(25);
    expect(result.perimeter).toBe(20);
  });

  it('throws for non-positive dimensions', () => {
    expect(() => rectangle(0, 5)).toThrow('Dimensions must be > 0');
    expect(() => rectangle(5, 0)).toThrow('Dimensions must be > 0');
    expect(() => rectangle(-5, 5)).toThrow('Dimensions must be > 0');
  });
});

describe('Geometry - Triangle', () => {
  it('calculates area correctly', () => {
    const result = triangle(10, 5, 8, 6);
    expect(result.area).toBe(25);
  });

  it('calculates perimeter correctly', () => {
    const result = triangle(10, 5, 8, 6);
    expect(result.perimeter).toBe(24); // 10 + 8 + 6
  });

  it('throws for non-positive dimensions', () => {
    expect(() => triangle(0, 5, 5, 5)).toThrow('Dimensions must be > 0');
    expect(() => triangle(5, 0, 5, 5)).toThrow('Dimensions must be > 0');
  });
});

describe('Geometry - Sphere', () => {
  it('calculates volume correctly', () => {
    const result = sphere({ radius: 3 });
    // V = 4/3 * π * r³
    expect(result.volume).toBeCloseTo((4 / 3) * PI * 27, 4);
  });

  it('calculates surface area correctly', () => {
    const result = sphere({ radius: 3 });
    // A = 4 * π * r²
    expect(result.surfaceArea).toBeCloseTo(4 * PI * 9, 4);
  });

  it('has centroid at origin', () => {
    const result = sphere({ radius: 5 });
    expect(result.centroid).toEqual({ x: 0, y: 0, z: 0 });
  });

  it('throws for non-positive radius', () => {
    expect(() => sphere({ radius: 0 })).toThrow('Radius must be > 0');
    expect(() => sphere({ radius: -5 })).toThrow('Radius must be > 0');
  });
});

describe('Geometry - Cylinder', () => {
  it('calculates volume correctly', () => {
    const result = cylinder({ radius: 3, height: 10 });
    // V = π * r² * h
    expect(result.volume).toBeCloseTo(PI * 9 * 10, 4);
  });

  it('calculates lateral area correctly', () => {
    const result = cylinder({ radius: 3, height: 10 });
    // A_lateral = 2 * π * r * h
    expect(result.lateralArea).toBeCloseTo(2 * PI * 3 * 10, 4);
  });

  it('calculates total surface area correctly', () => {
    const result = cylinder({ radius: 3, height: 10 });
    // A_total = 2 * π * r * h + 2 * π * r²
    const expected = 2 * PI * 3 * 10 + 2 * PI * 9;
    expect(result.totalSurfaceArea).toBeCloseTo(expected, 4);
  });

  it('has centroid at half height', () => {
    const result = cylinder({ radius: 3, height: 10 });
    expect(result.centroid.z).toBe(5);
  });

  it('throws for non-positive dimensions', () => {
    expect(() => cylinder({ radius: 0, height: 10 })).toThrow('Dimensions must be > 0');
    expect(() => cylinder({ radius: 3, height: 0 })).toThrow('Dimensions must be > 0');
  });
});

describe('Geometry - Cone', () => {
  it('calculates volume correctly', () => {
    const result = cone({ radius: 3, height: 9 });
    // V = 1/3 * π * r² * h
    expect(result.volume).toBeCloseTo((1 / 3) * PI * 9 * 9, 4);
  });

  it('calculates slant height correctly', () => {
    const result = cone({ radius: 3, height: 4 });
    // L = √(r² + h²) = √(9 + 16) = 5
    expect(result.slantHeight).toBeCloseTo(5, 5);
  });

  it('calculates lateral area correctly', () => {
    const result = cone({ radius: 3, height: 4 });
    // A_lateral = π * r * L = π * 3 * 5 = 15π
    expect(result.lateralArea).toBeCloseTo(15 * PI, 4);
  });

  it('has centroid at quarter height', () => {
    const result = cone({ radius: 3, height: 8 });
    expect(result.centroid.z).toBe(2);
  });

  it('throws for non-positive dimensions', () => {
    expect(() => cone({ radius: 0, height: 10 })).toThrow('Dimensions must be > 0');
    expect(() => cone({ radius: 3, height: 0 })).toThrow('Dimensions must be > 0');
  });
});

describe('Geometry - Rectangular Prism', () => {
  it('calculates volume correctly', () => {
    const result = rectangularPrism({ length: 4, width: 3, height: 5 });
    expect(result.volume).toBe(60);
  });

  it('calculates surface area correctly', () => {
    const result = rectangularPrism({ length: 4, width: 3, height: 5 });
    // A = 2(lw + lh + wh) = 2(12 + 20 + 15) = 94
    expect(result.surfaceArea).toBe(94);
  });

  it('calculates centroid correctly', () => {
    const result = rectangularPrism({ length: 4, width: 6, height: 10 });
    expect(result.centroid).toEqual({ x: 2, y: 3, z: 5 });
  });

  it('handles cube', () => {
    const result = rectangularPrism({ length: 5, width: 5, height: 5 });
    expect(result.volume).toBe(125);
    expect(result.surfaceArea).toBe(150);
  });

  it('throws for non-positive dimensions', () => {
    expect(() => rectangularPrism({ length: 0, width: 3, height: 5 })).toThrow(
      'Dimensions must be > 0'
    );
    expect(() => rectangularPrism({ length: 4, width: 0, height: 5 })).toThrow(
      'Dimensions must be > 0'
    );
    expect(() => rectangularPrism({ length: 4, width: 3, height: 0 })).toThrow(
      'Dimensions must be > 0'
    );
  });
});

describe('Geometry - Torus', () => {
  it('calculates volume correctly', () => {
    const result = torus({ majorRadius: 10, minorRadius: 3 });
    // V = 2 * π² * R * r²
    expect(result.volume).toBeCloseTo(2 * PI * PI * 10 * 9, 4);
  });

  it('calculates surface area correctly', () => {
    const result = torus({ majorRadius: 10, minorRadius: 3 });
    // A = 4 * π² * R * r
    expect(result.surfaceArea).toBeCloseTo(4 * PI * PI * 10 * 3, 4);
  });

  it('has centroid at origin', () => {
    const result = torus({ majorRadius: 10, minorRadius: 3 });
    expect(result.centroid).toEqual({ x: 0, y: 0, z: 0 });
  });

  it('throws for invalid dimensions', () => {
    expect(() => torus({ majorRadius: 5, minorRadius: 0 })).toThrow(
      'Minor radius must be > 0 and strictly less than Major radius'
    );
    expect(() => torus({ majorRadius: 5, minorRadius: 5 })).toThrow(
      'Minor radius must be > 0 and strictly less than Major radius'
    );
    expect(() => torus({ majorRadius: 3, minorRadius: 5 })).toThrow(
      'Minor radius must be > 0 and strictly less than Major radius'
    );
  });
});

describe('Geometry - Regular Polygon', () => {
  it('calculates triangle (3 sides) correctly', () => {
    const result = regularPolygon({ sides: 3, sideLength: 6 });
    // Equilateral triangle: A = (√3/4) * s² ≈ 15.588
    expect(result.area).toBeCloseTo(15.588, 2);
    expect(result.perimeter).toBe(18);
  });

  it('calculates square (4 sides) correctly', () => {
    const result = regularPolygon({ sides: 4, sideLength: 5 });
    expect(result.area).toBeCloseTo(25, 5);
    expect(result.perimeter).toBe(20);
    expect(result.apothem).toBeCloseTo(2.5, 5);
  });

  it('calculates hexagon (6 sides) correctly', () => {
    const result = regularPolygon({ sides: 6, sideLength: 4 });
    // Regular hexagon: A = (3√3/2) * s² ≈ 41.569
    expect(result.area).toBeCloseTo(41.569, 2);
    expect(result.perimeter).toBe(24);
  });

  it('throws for invalid number of sides', () => {
    expect(() => regularPolygon({ sides: 2, sideLength: 5 })).toThrow(
      'Number of sides must be >= 3'
    );
    expect(() => regularPolygon({ sides: 0, sideLength: 5 })).toThrow(
      'Number of sides must be >= 3'
    );
  });

  it('throws for non-positive side length', () => {
    expect(() => regularPolygon({ sides: 5, sideLength: 0 })).toThrow('Side length must be > 0');
    expect(() => regularPolygon({ sides: 5, sideLength: -3 })).toThrow('Side length must be > 0');
  });
});
