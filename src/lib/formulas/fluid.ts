import { GRAVITY } from '@/constants/physics';

// ─────────────────────────────────────────────────────────────────────────────
// Reynolds Number
// ─────────────────────────────────────────────────────────────────────────────

interface ReynoldsParams {
  density?: number;
  velocity: number;
  diameter: number;
  dynamicViscosity?: number;
  kinematicViscosity?: number;
}

export function reynoldsNumber({
  density,
  velocity,
  diameter,
  dynamicViscosity,
  kinematicViscosity,
}: ReynoldsParams) {
  if (velocity <= 0) throw new Error('Velocity must be positive');
  if (diameter <= 0) throw new Error('Diameter must be positive');

  let Re = 0;

  if (kinematicViscosity) {
    Re = (velocity * diameter) / kinematicViscosity;
  } else if (density && dynamicViscosity) {
    Re = (density * velocity * diameter) / dynamicViscosity;
  } else {
    throw new Error('Missing parameters for calculating Reynolds Number');
  }

  let regime = 'turbulent';
  if (Re < 2300) regime = 'laminar';
  else if (Re <= 4000) regime = 'transitional';

  return { Re, regime };
}

// ─────────────────────────────────────────────────────────────────────────────
// Darcy-Weisbach Pressure Loss
// ─────────────────────────────────────────────────────────────────────────────

interface DarcyWeisbachParams {
  f: number;
  L: number;
  D: number;
  rho: number;
  v: number;
}

export function darcyWeisbach({ f, L, D, rho, v }: DarcyWeisbachParams) {
  if (D <= 0) throw new Error('Diameter must be positive');
  if (f < 0) throw new Error('Friction factor cannot be negative');

  const pressureDropPa = f * (L / D) * (0.5 * rho * v * v);
  const headLossM = pressureDropPa / (rho * GRAVITY);

  return { pressureDropPa, headLossM };
}
// ─────────────────────────────────────────────────────────────────────────────
// Bernoulli's Equation
// ─────────────────────────────────────────────────────────────────────────────

export interface BernoulliParams {
  p1?: number;
  v1?: number;
  h1?: number;
  p2?: number;
  v2?: number;
  h2?: number;
  rho: number;
  g?: number;
}

export function calculateBernoulli(params: BernoulliParams) {
  const { p1, v1, h1, p2, v2, h2, rho, g = GRAVITY } = params;

  // Total energy at point 1: P1 + 0.5*rho*v1^2 + rho*g*h1
  // Total energy at point 2: P2 + 0.5*rho*v2^2 + rho*g*h2

  const keys = ['p1', 'v1', 'h1', 'p2', 'v2', 'h2'];
  const missing = keys.filter(k => params[k as keyof BernoulliParams] === undefined || isNaN(params[k as keyof BernoulliParams] as number));

  if (missing.length !== 1) {
    throw new Error('Bernoulli equation requires exactly one unknown variable');
  }

  const target = missing[0];
  
  // Helper to get value or 0 if missing (we already know which one is missing)
  const val = (k: string) => params[k as keyof BernoulliParams] ?? 0;

  if (target === 'p2') {
    return p1! + 0.5 * rho * (v1! ** 2 - v2! ** 2) + rho * g * (h1! - h2!);
  }
  if (target === 'p1') {
    return p2! + 0.5 * rho * (v2! ** 2 - v1! ** 2) + rho * g * (h2! - h1!);
  }
  if (target === 'v2') {
    const term = (p1! - p2!) / (0.5 * rho) + v1! ** 2 + (2 * g * (h1! - h2!));
    if (term < 0) throw new Error('Equation results in imaginary velocity (square root of negative)');
    return Math.sqrt(term);
  }
  if (target === 'v1') {
    const term = (p2! - p1!) / (0.5 * rho) + v2! ** 2 + (2 * g * (h2! - h1!));
    if (term < 0) throw new Error('Equation results in imaginary velocity (square root of negative)');
    return Math.sqrt(term);
  }
  if (target === 'h2') {
    return (p1! - p2!) / (rho * g) + (v1! ** 2 - v2! ** 2) / (2 * g) + h1!;
  }
  if (target === 'h1') {
    return (p2! - p1!) / (rho * g) + (v2! ** 2 - v1! ** 2) / (2 * g) + h2!;
  }

  return 0;
}
