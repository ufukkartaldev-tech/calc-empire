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
  const gammaC = 1.5;
  const gammaS = 1.15;

  const fcd = fck / gammaC;
  const fyd = fyk / gammaS;

  // Depth of equivalent rectangular stress block (a)
  // 0.85 * fcd * bw * a = As * fyd  => a = (As * fyd) / (0.85 * fcd * bw)
  const a = (As * fyd) / (0.85 * fcd * bw);

  // Depth of neutral axis (c)
  // assuming concrete C50 or less, beta1 = 0.85
  let beta1 = 0.85;
  if (fck > 50) {
    beta1 = Math.max(0.65, 0.85 - 0.008 * (fck - 50));
  }
  const c = a / beta1;

  // Design moment capacity Md
  const Md = As * fyd * (d - a / 2); // N·mm
  const Md_kNm = Md / 1e6;

  // Strain in steel (epsS) assuming max concrete strain of 0.003
  let epsS = 0;
  if (c < d) {
    epsS = 0.003 * ((d - c) / c);
  } else {
    // Over-reinforced or special case
    epsS = 0;
  }

  // Ductility check (epsS >= 0.005 for ductile failure)
  const isDuctile = epsS >= 0.005;
  const isOverReinforced = c >= d;

  return {
    a,
    c,
    Md: Md_kNm,
    epsS,
    isDuctile,
    isOverReinforced,
  };
}
