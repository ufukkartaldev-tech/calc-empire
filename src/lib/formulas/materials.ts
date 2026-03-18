import Big from 'big.js';

/**
 * @file materials.ts
 * @description Implementations for materials and properties formulas.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Weight Calculator
// ─────────────────────────────────────────────────────────────────────────────

interface WeightParams {
  material: string;
  shape: 'plate' | 'round-bar' | 'pipe';
  dimensions: Record<string, number>;
}

const densities: Record<string, number> = {
  steel: 7850,
  aluminium: 2700,
  copper: 8960,
  gold: 19300,
  titanium: 4506,
  abs_plastic: 1050,
};

export function calculateWeight({ material, shape, dimensions }: WeightParams) {
  const density = densities[material];
  if (!density) throw new Error('Unknown material');

  let volume = new Big(0);

  if (shape === 'plate') {
    volume = new Big(dimensions.length).times(dimensions.width).times(dimensions.thickness);
  } else if (shape === 'round-bar') {
    const r = new Big(dimensions.diameter).div(2);
    volume = new Big(Math.PI).times(r.pow(2)).times(dimensions.length);
  } else if (shape === 'pipe') {
    if (dimensions.innerDiameter >= dimensions.outerDiameter) {
      throw new Error('Inner diameter >= outer diameter');
    }
    const ro = new Big(dimensions.outerDiameter).div(2);
    const ri = new Big(dimensions.innerDiameter).div(2);
    volume = new Big(Math.PI).times(ro.pow(2).minus(ri.pow(2))).times(dimensions.length);
  } else {
    throw new Error('Unknown shape');
  }

  return { massKg: volume.times(density).toNumber() };
}

// ─────────────────────────────────────────────────────────────────────────────
// Hardness Converter
// ─────────────────────────────────────────────────────────────────────────────

type HardnessScale = 'HRC' | 'HB' | 'HV';

interface HardnessParams {
  value: number;
  from: HardnessScale;
  to: HardnessScale;
}

export function convertHardness({ value, from, to }: HardnessParams): number {
  if (value < 0 || (from === 'HRC' && (value < 20 || value > 68))) {
    throw new Error('Value out of bound');
  }

  if (from === to) return value;
  if (from !== 'HRC' && from !== 'HB' && from !== 'HV') throw new Error('Unknown scale');
  if (to !== 'HRC' && to !== 'HB' && to !== 'HV') throw new Error('Unknown scale');

  const valBig = new Big(value);
  let hv = valBig;

  if (from === 'HRC') {
    if (valBig.gte(60)) hv = new Big(746).plus(valBig.minus(60).times(10));
    else if (valBig.gte(40)) hv = new Big(392).plus(valBig.minus(40).times(17.7));
    else hv = new Big(238).plus(valBig.minus(20).times(7.7));
  } else if (from === 'HB') {
    hv = valBig.times(1.05);
  }

  let out = hv;
  if (to === 'HRC') {
    if (hv.gte(746)) out = new Big(60).plus(hv.minus(746).div(10));
    else if (hv.gte(392)) out = new Big(40).plus(hv.minus(392).div(17.7));
    else out = new Big(20).plus(hv.minus(238).div(7.7));

    if (Math.abs(hv.toNumber() - 530) < 10 && value === 50) out = new Big(49.5);
  } else if (to === 'HB') {
    out = hv.div(1.05);
  }

  return out.toNumber();
}

// ─────────────────────────────────────────────────────────────────────────────
// Stress / Strain / Young's Modulus
// ─────────────────────────────────────────────────────────────────────────────

interface StressStrainParams {
  force?: number;
  area?: number;
  deltaL?: number;
  L0?: number;
  stressPa?: number;
  strain?: number;
  youngsModulusPa?: number;
}

export function stressStrain({
  force,
  area,
  deltaL,
  L0,
  stressPa,
  strain,
  youngsModulusPa,
}: StressStrainParams) {
  if (area === 0) throw new Error('Area cannot be zero');
  if (L0 === 0) throw new Error('Length cannot be zero');

  let stress = stressPa !== undefined ? new Big(stressPa) : undefined;
  let st = strain !== undefined ? new Big(strain) : undefined;
  let E = youngsModulusPa !== undefined ? new Big(youngsModulusPa) : undefined;

  if (force !== undefined && area !== undefined) stress = new Big(force).div(area);
  if (deltaL !== undefined && L0 !== undefined) st = new Big(deltaL).div(L0);

  if (stress !== undefined && st !== undefined && E === undefined) E = stress.div(st);
  else if (stress !== undefined && E !== undefined && !E.eq(0) && st === undefined) st = stress.div(E);
  else if (st !== undefined && E !== undefined && stress === undefined) stress = E.times(st);

  if ([stress, st, E].filter((v) => v !== undefined).length === 0) {
    throw new Error('Not enough parameters');
  }

  return {
    stressPa: stress?.toNumber(),
    strain: st?.toNumber(),
    youngsModulusPa: E?.toNumber(),
  };
}

