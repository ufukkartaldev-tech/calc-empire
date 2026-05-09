import Big from 'big.js';
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

  const v = new Big(velocity);
  const d = new Big(diameter);
  let Re = new Big(0);

  if (kinematicViscosity) {
    Re = v.times(d).div(kinematicViscosity);
  } else if (density && dynamicViscosity) {
    Re = new Big(density).times(v).times(d).div(dynamicViscosity);
  } else {
    throw new Error('Missing parameters for calculating Reynolds Number');
  }

  const reNum = Re.toNumber();
  let regime = 'turbulent';
  if (reNum < 2300) regime = 'laminar';
  else if (reNum <= 4000) regime = 'transitional';

  return { Re: reNum, regime };
}

// ─────────────────────────────────────────────────────────────────────────────
// Darcy-Weisbach Pressure Loss
// ─────────────────────────────────────────────────────────────────────────────

interface DarcyWhiesbachParams {
  f: number;
  L: number;
  D: number;
  rho: number;
  v: number;
}

export function darcyWeisbach({ f, L, D, rho, v }: DarcyWhiesbachParams) {
  if (D <= 0) throw new Error('Diameter must be positive');
  if (f < 0) throw new Error('Friction factor cannot be negative');

  const fBig = new Big(f);
  const lBig = new Big(L);
  const dBig = new Big(D);
  const rhoBig = new Big(rho);
  const vBig = new Big(v);

  const pressureDropPa = fBig
    .times(lBig.div(dBig))
    .times(new Big(0.5).times(rhoBig).times(vBig.pow(2)));
  const headLossM = pressureDropPa.div(rhoBig.times(GRAVITY));

  return {
    pressureDropPa: pressureDropPa.toNumber(),
    headLossM: headLossM.toNumber(),
  };
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
  const rhoBig = new Big(rho);
  const gBig = new Big(g);

  const keys = ['p1', 'v1', 'h1', 'p2', 'v2', 'h2'];
  const missing = keys.filter(
    (k) =>
      params[k as keyof BernoulliParams] === undefined ||
      isNaN(params[k as keyof BernoulliParams] as number)
  );

  if (missing.length !== 1) {
    throw new Error('Bernoulli equation requires exactly one unknown variable');
  }

  const target = missing[0];

  if (target === 'p2') {
    const res = new Big(p1!)
      .plus(new Big(0.5).times(rhoBig).times(new Big(v1!).pow(2).minus(new Big(v2!).pow(2))))
      .plus(rhoBig.times(gBig).times(new Big(h1!).minus(h2!)));
    return res.toNumber();
  }
  if (target === 'p1') {
    const res = new Big(p2!)
      .plus(new Big(0.5).times(rhoBig).times(new Big(v2!).pow(2).minus(new Big(v1!).pow(2))))
      .plus(rhoBig.times(gBig).times(new Big(h2!).minus(h1!)));
    return res.toNumber();
  }
  if (target === 'v2') {
    const term = new Big(p1!)
      .minus(p2!)
      .div(new Big(0.5).times(rhoBig))
      .plus(new Big(v1!).pow(2))
      .plus(new Big(2).times(gBig).times(new Big(h1!).minus(h2!)));
    if (term.lt(0))
      throw new Error('Equation results in imaginary velocity (square root of negative)');
    return term.sqrt().toNumber();
  }
  if (target === 'v1') {
    const term = new Big(p2!)
      .minus(p1!)
      .div(new Big(0.5).times(rhoBig))
      .plus(new Big(v2!).pow(2))
      .plus(new Big(2).times(gBig).times(new Big(h2!).minus(h1!)));
    if (term.lt(0))
      throw new Error('Equation results in imaginary velocity (square root of negative)');
    return term.sqrt().toNumber();
  }
  if (target === 'h2') {
    const res = new Big(p1!)
      .minus(p2!)
      .div(rhoBig.times(gBig))
      .plus(new Big(v1!).pow(2).minus(new Big(v2!).pow(2)).div(new Big(2).times(gBig)))
      .plus(h1!);
    return res.toNumber();
  }
  if (target === 'h1') {
    const res = new Big(p2!)
      .minus(p1!)
      .div(rhoBig.times(gBig))
      .plus(new Big(v2!).pow(2).minus(new Big(v1!).pow(2)).div(new Big(2).times(gBig)))
      .plus(h2!);
    return res.toNumber();
  }

  return 0;
}
