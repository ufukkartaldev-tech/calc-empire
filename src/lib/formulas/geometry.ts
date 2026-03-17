import { PI } from '@/constants/physics';

// ─────────────────────────────────────────────────────────────────────────────
// Sphere
// ─────────────────────────────────────────────────────────────────────────────

interface SphereParams {
  radius: number;
}

export function sphere({ radius }: SphereParams) {
  if (radius <= 0) throw new Error('Radius must be > 0');
  const volume = (4 / 3) * PI * Math.pow(radius, 3);
  const surfaceArea = 4 * PI * Math.pow(radius, 2);
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
  const volume = PI * Math.pow(radius, 2) * height;
  const lateralArea = 2 * PI * radius * height;
  const totalSurfaceArea = lateralArea + 2 * PI * Math.pow(radius, 2);
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
  const volume = (PI * Math.pow(radius, 2) * height) / 3;
  const slantHeight = Math.sqrt(radius * radius + height * height);
  const lateralArea = PI * radius * slantHeight;
  const totalSurfaceArea = lateralArea + PI * Math.pow(radius, 2);
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
  const volume = 2 * PI * PI * R * r * r;
  const surfaceArea = 4 * PI * PI * R * r;
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
  const apothem = sideLength / (2 * Math.tan(PI / sides));
  const area = (sides * sideLength * sideLength) / (4 * Math.tan(PI / sides));

  return { area, perimeter, apothem };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2D Shapes
// ─────────────────────────────────────────────────────────────────────────────

export function circle(radius: number) {
  if (radius <= 0) throw new Error('Radius must be > 0');
  return {
    area: PI * radius * radius,
    perimeter: 2 * PI * radius
  };
}

export function rectangle(width: number, height: number) {
  if (width <= 0 || height <= 0) throw new Error('Dimensions must be > 0');
  return {
    area: width * height,
    perimeter: 2 * (width + height)
  };
}

export function triangle(base: number, height: number, a: number, b: number) {
  if (base <= 0 || height <= 0) throw new Error('Dimensions must be > 0');
  return {
    area: 0.5 * base * height,
    perimeter: base + a + b
  };
}
