/**
 * @file geometry.ts
 * @description Implementations for 3D and complex geometry formulas.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Sphere
// ─────────────────────────────────────────────────────────────────────────────

interface SphereParams {
  radius: number;
}

export function sphere({ radius }: SphereParams) {
  if (radius <= 0) throw new Error('Radius must be > 0');
  const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
  const surfaceArea = 4 * Math.PI * Math.pow(radius, 2);
  const centroid = { x: 0, y: 0, z: 0 };
  return { volume, surfaceArea, centroid };
}

// ─────────────────────────────────────────────────────────────────────────────
// Cylinder
// ─────────────────────────────────────────────────────────────────────────────

interface CylinderParams {
  radius: number;
  height: number;
}

export function cylinder({ radius, height }: CylinderParams) {
  if (radius <= 0 || height <= 0) throw new Error('Dimensions must be > 0');
  const volume = Math.PI * Math.pow(radius, 2) * height;
  const lateralArea = 2 * Math.PI * radius * height;
  const totalSurfaceArea = lateralArea + 2 * Math.PI * Math.pow(radius, 2);
  const centroid = { x: 0, y: 0, z: height / 2 };
  return { volume, lateralArea, totalSurfaceArea, centroid };
}

// ─────────────────────────────────────────────────────────────────────────────
// Cone
// ─────────────────────────────────────────────────────────────────────────────

interface ConeParams {
  radius: number;
  height: number;
}

export function cone({ radius, height }: ConeParams) {
  if (radius <= 0 || height <= 0) throw new Error('Dimensions must be > 0');
  const volume = (Math.PI * Math.pow(radius, 2) * height) / 3;
  const slantHeight = Math.sqrt(radius * radius + height * height);
  const lateralArea = Math.PI * radius * slantHeight;
  const totalSurfaceArea = lateralArea + Math.PI * Math.pow(radius, 2);
  const centroid = { x: 0, y: 0, z: height / 4 };
  return { volume, slantHeight, lateralArea, totalSurfaceArea, centroid };
}

// ─────────────────────────────────────────────────────────────────────────────
// Rectangular Prism
// ─────────────────────────────────────────────────────────────────────────────

interface RectangularPrismParams {
  length: number;
  width: number;
  height: number;
}

export function rectangularPrism({ length, width, height }: RectangularPrismParams) {
  if (length <= 0 || width <= 0 || height <= 0) throw new Error('Dimensions must be > 0');
  const volume = length * width * height;
  const surfaceArea = 2 * (length * width + length * height + width * height);
  const centroid = { x: length / 2, y: width / 2, z: height / 2 };
  return { volume, surfaceArea, centroid };
}

// ─────────────────────────────────────────────────────────────────────────────
// Torus
// ─────────────────────────────────────────────────────────────────────────────

interface TorusParams {
  majorRadius: number; // R
  minorRadius: number; // r
}

export function torus({ majorRadius, minorRadius }: TorusParams) {
  if (minorRadius <= 0 || majorRadius <= minorRadius) {
    throw new Error('Minor radius must be > 0 and strictly less than Major radius');
  }
  const R = majorRadius;
  const r = minorRadius;
  const volume = 2 * Math.PI * Math.PI * R * r * r;
  const surfaceArea = 4 * Math.PI * Math.PI * R * r;
  const centroid = { x: 0, y: 0, z: 0 };
  return { volume, surfaceArea, centroid };
}

// ─────────────────────────────────────────────────────────────────────────────
// Regular Polygon
// ─────────────────────────────────────────────────────────────────────────────

interface RegularPolygonParams {
  sides: number;
  sideLength: number;
}

export function regularPolygon({ sides, sideLength }: RegularPolygonParams) {
  if (sides < 3) throw new Error('Number of sides must be >= 3');
  if (sideLength <= 0) throw new Error('Side length must be > 0');

  const perimeter = sides * sideLength;
  const apothem = sideLength / (2 * Math.tan(Math.PI / sides));
  const area = (sides * sideLength * sideLength) / (4 * Math.tan(Math.PI / sides));

  return { area, perimeter, apothem };
}
