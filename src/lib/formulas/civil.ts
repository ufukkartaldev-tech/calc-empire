import Big from 'big.js';

/**
 * @file civil.ts
 * @description Implementations for civil and structural engineering formulas.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Concrete Section Analysis (Simplified Eurocode 2 / TS500)
// ─────────────────────────────────────────────────────────────────────────────

interface ConcreteSectionParams {
  bw: number; // Section width (mm)
  d: number; // Effective depth (mm)
  fck: number; // Concrete characteristic strength (MPa)
  fyk: number; // Steel characteristic strength (MPa)
  As: number; // Area of tension reinforcement (mm^2)
}

export function concreteSectionCapacity({ bw, d, fck, fyk, As }: ConcreteSectionParams) {
  if (bw <= 0 || d <= 0 || As <= 0) {
    throw new Error('Dimensions and rebar area must be positive');
  }
  if (fck <= 0 || fyk <= 0) {
    throw new Error('Material strengths must be positive');
  }

  // Safety factors
  const gammaC = new Big(1.5);
  const gammaS = new Big(1.15);

  const fcd = new Big(fck).div(gammaC);
  const fyd = new Big(fyk).div(gammaS);

  // Depth of equivalent rectangular stress block (a)
  // 0.85 * fcd * bw * a = As * fyd  => a = (As * fyd) / (0.85 * fcd * bw)
  const a = new Big(As).times(fyd).div(new Big(0.85).times(fcd).times(bw));

  // Depth of neutral axis (c)
  // assuming concrete C50 or less, beta1 = 0.85
  let beta1 = new Big(0.85);
  if (fck > 50) {
    const calculatedBeta1 = new Big(0.85).minus(new Big(0.008).times(fck - 50));
    beta1 = calculatedBeta1.lt(0.65) ? new Big(0.65) : calculatedBeta1;
  }
  const c = a.div(beta1);

  // Design moment capacity Md
  const Md = new Big(As).times(fyd).times(new Big(d).minus(a.div(2))); // N·mm
  const Md_kNm = Md.div(1e6);

  // Strain in steel (epsS) assuming max concrete strain of 0.003
  let epsS = new Big(0);
  if (c.lt(d)) {
    epsS = new Big(0.003).times(new Big(d).minus(c).div(c));
  } else {
    // Over-reinforced or special case
    epsS = new Big(0);
  }

  // Ductility check (epsS >= 0.005 for ductile failure)
  const isDuctile = epsS.gte(0.005);
  const isOverReinforced = c.gte(d);

  return {
    a: a.toNumber(),
    c: c.toNumber(),
    Md: Md_kNm.toNumber(),
    epsS: epsS.toNumber(),
    isDuctile,
    isOverReinforced,
  };
}
