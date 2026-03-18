import Big from 'big.js';
import { PI } from '@/constants/physics';

// ─────────────────────────────────────────────────────────────────────────────
// Sphere
// ─────────────────────────────────────────────────────────────────────────────

interface SphereParams {
  radius: number;
}

export function sphere({ radius }: SphereParams) {
  if (radius <= 0) throw new Error('Radius must be > 0');
  const rBig = new Big(radius);
  const volume = new Big(4).div(3).times(PI).times(rBig.pow(3));
  const surfaceArea = new Big(4).times(PI).times(rBig.pow(2));
  return {
    volume: volume.toNumber(),
    surfaceArea: surfaceArea.toNumber(),
    centroid: { x: 0, y: 0, z: 0 },
  };
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
  const rBig = new Big(radius);
  const hBig = new Big(height);

  const volume = new Big(PI).times(rBig.pow(2)).times(hBig);
  const lateralArea = new Big(2).times(PI).times(rBig).times(hBig);
  const totalSurfaceArea = lateralArea.plus(new Big(2).times(PI).times(rBig.pow(2)));

  return {
    volume: volume.toNumber(),
    lateralArea: lateralArea.toNumber(),
    totalSurfaceArea: totalSurfaceArea.toNumber(),
    centroid: { x: 0, y: 0, z: hBig.div(2).toNumber() },
  };
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
  const rBig = new Big(radius);
  const hBig = new Big(height);

  const volume = new Big(PI).times(rBig.pow(2)).times(hBig).div(3);
  const slantHeight = rBig.pow(2).plus(hBig.pow(2)).sqrt();
  const lateralArea = new Big(PI).times(rBig).times(slantHeight);
  const totalSurfaceArea = lateralArea.plus(new Big(PI).times(rBig.pow(2)));

  return {
    volume: volume.toNumber(),
    slantHeight: slantHeight.toNumber(),
    lateralArea: lateralArea.toNumber(),
    totalSurfaceArea: totalSurfaceArea.toNumber(),
    centroid: { x: 0, y: 0, z: hBig.div(4).toNumber() },
  };
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
  const l = new Big(length);
  const w = new Big(width);
  const h = new Big(height);

  const volume = l.times(w).times(h);
  const surfaceArea = new Big(2).times(l.times(w).plus(l.times(h)).plus(w.times(h)));

  return {
    volume: volume.toNumber(),
    surfaceArea: surfaceArea.toNumber(),
    centroid: { x: l.div(2).toNumber(), y: w.div(2).toNumber(), z: h.div(2).toNumber() },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Torus
// ─────────────────────────────────────────────────────────────────────────────

interface TorusParams {
  majorRadius: number;
  minorRadius: number;
}

export function torus({ majorRadius, minorRadius }: TorusParams) {
  if (minorRadius <= 0 || majorRadius <= minorRadius) {
    throw new Error('Minor radius must be > 0 and strictly less than Major radius');
  }
  const R = new Big(majorRadius);
  const r = new Big(minorRadius);

  const volume = new Big(2).times(PI).times(PI).times(R).times(r.pow(2));
  const surfaceArea = new Big(4).times(PI).times(PI).times(R).times(r);

  return {
    volume: volume.toNumber(),
    surfaceArea: surfaceArea.toNumber(),
    centroid: { x: 0, y: 0, z: 0 },
  };
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

  const sBig = new Big(sides);
  const lBig = new Big(sideLength);
  const tanVal = Math.tan(PI / sides);

  const perimeter = sBig.times(lBig);
  const apothem = lBig.div(new Big(2).times(tanVal));
  const area = sBig.times(lBig.pow(2)).div(new Big(4).times(tanVal));

  return {
    area: area.toNumber(),
    perimeter: perimeter.toNumber(),
    apothem: apothem.toNumber(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2D Shapes
// ─────────────────────────────────────────────────────────────────────────────

export function circle(radius: number) {
  if (radius <= 0) throw new Error('Radius must be > 0');
  const r = new Big(radius);
  return {
    area: new Big(PI).times(r.pow(2)).toNumber(),
    perimeter: new Big(2).times(PI).times(r).toNumber(),
  };
}

export function rectangle(width: number, height: number) {
  if (width <= 0 || height <= 0) throw new Error('Dimensions must be > 0');
  const w = new Big(width);
  const h = new Big(height);
  return {
    area: w.times(h).toNumber(),
    perimeter: new Big(2).times(w.plus(h)).toNumber(),
  };
}

export function triangle(base: number, height: number, a: number, b: number) {
  if (base <= 0 || height <= 0) throw new Error('Dimensions must be > 0');
  const bBig = new Big(base);
  const hBig = new Big(height);
  return {
    area: new Big(0.5).times(bBig).times(hBig).toNumber(),
    perimeter: bBig.plus(a).plus(b).toNumber(),
  };
}

