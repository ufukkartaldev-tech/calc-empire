import Big from 'big.js';

interface OhmPowerParams {
  voltage?: number;
  current?: number;
  resistance?: number;
  power?: number;
}

interface OhmPowerContext {
  V?: Big;
  I?: Big;
  R?: Big;
  P?: Big;
}

type SolverFunction = (ctx: OhmPowerContext) => OhmPowerContext;

const ohmSolvers: Record<string, SolverFunction> = {
  VI: ({ V, I }) => ({ V, I, R: V!.div(I!), P: V!.times(I!) }),
  VR: ({ V, R }) => {
    if (R!.eq(0)) throw new Error('Resistance cannot be zero.');
    return { V, R, I: V!.div(R!), P: V!.times(V!).div(R!) };
  },
  VP: ({ V, P }) => {
    if (V!.eq(0)) throw new Error('Voltage cannot be zero.');
    return { V, P, I: P!.div(V!), R: V!.times(V!).div(P!) };
  },
  IR: ({ I, R }) => ({ I, R, V: I!.times(R!), P: I!.times(I!).times(R!) }),
  IP: ({ I, P }) => {
    if (I!.eq(0)) throw new Error('Current cannot be zero.');
    return { I, P, V: P!.div(I!), R: P!.div(I!.times(I!)) };
  },
  RP: ({ R, P }) => {
    if (R!.eq(0)) throw new Error('Resistance cannot be zero.');
    return { R, P, V: P!.times(R!).sqrt(), I: P!.div(R!).sqrt() };
  },
};

export function ohmPower(params: OhmPowerParams): OhmPowerParams {
  const ctx: OhmPowerContext = {
    V: params.voltage !== undefined ? new Big(params.voltage) : undefined,
    I: params.current !== undefined ? new Big(params.current) : undefined,
    R: params.resistance !== undefined ? new Big(params.resistance) : undefined,
    P: params.power !== undefined ? new Big(params.power) : undefined,
  };

  const providedKeys = (['V', 'I', 'R', 'P'] as const).filter((key) => ctx[key] !== undefined);

  if (providedKeys.length < 2) throw new Error('At least two parameters are required.');

  if (ctx.R !== undefined && ctx.R.lt(0)) throw new Error('Resistance (R) cannot be negative.');
  if (ctx.P !== undefined && ctx.P.lt(0))
    throw new Error('Power (P) cannot be negative in passive systems.');

  const strategyKey = providedKeys.slice(0, 2).join('');
  const solver = ohmSolvers[strategyKey];

  if (!solver) throw new Error('Invalid parameter combination provided.');

  const result = solver(ctx);

  return {
    voltage: result.V?.toNumber(),
    current: result.I?.toNumber(),
    resistance: result.R?.toNumber(),
    power: result.P?.toNumber(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Resistor Color Codes
// ─────────────────────────────────────────────────────────────────────────────

const COLOR_VALUES: Record<string, number> = {
  black: 0,
  brown: 1,
  red: 2,
  orange: 3,
  yellow: 4,
  green: 5,
  blue: 6,
  violet: 7,
  gray: 8,
  white: 9,
};

const MULTIPLIERS: Record<string, number> = {
  ...COLOR_VALUES,
  gold: -1,
  silver: -2,
};

const TOLERANCES: Record<string, number> = {
  brown: 1,
  red: 2,
  green: 0.5,
  blue: 0.25,
  violet: 0.1,
  gray: 0.05,
  gold: 5,
  silver: 10,
};

const TEMP_COEFFS: Record<string, number> = {
  brown: 100,
  red: 50,
  orange: 15,
  yellow: 25,
  blue: 10,
  violet: 5,
};

export function resistorColorCode(bands: string[]) {
  bands = bands.map((b) => b.toLowerCase());

  // Validate bands
  for (const b of bands) {
    if (
      COLOR_VALUES[b] === undefined &&
      MULTIPLIERS[b] === undefined &&
      TOLERANCES[b] === undefined
    ) {
      throw new Error(`Unknown color name: ${b}`);
    }
  }

  let resistance = new Big(0);
  let tolerance = 20; // Default 20%
  let tempCoeff: number | undefined;

  if (bands.length === 4) {
    const value = COLOR_VALUES[bands[0]] * 10 + COLOR_VALUES[bands[1]];
    resistance = new Big(value).times(new Big(10).pow(MULTIPLIERS[bands[2]] || 0));
    tolerance = TOLERANCES[bands[3]] || 20;
  } else if (bands.length === 5) {
    const value =
      COLOR_VALUES[bands[0]] * 100 + COLOR_VALUES[bands[1]] * 10 + COLOR_VALUES[bands[2]];
    resistance = new Big(value).times(new Big(10).pow(MULTIPLIERS[bands[3]] || 0));
    tolerance = TOLERANCES[bands[4]] || 20;
  } else if (bands.length === 6) {
    const value =
      COLOR_VALUES[bands[0]] * 100 + COLOR_VALUES[bands[1]] * 10 + COLOR_VALUES[bands[2]];
    resistance = new Big(value).times(new Big(10).pow(MULTIPLIERS[bands[3]] || 0));
    tolerance = TOLERANCES[bands[4]] || 20;
    tempCoeff = TEMP_COEFFS[bands[5]];
  } else {
    throw new Error('Invalid band count. Only 4, 5, or 6 bands are supported.');
  }

  return { resistance: resistance.toNumber(), tolerance, tempCoeff };
}

// ─────────────────────────────────────────────────────────────────────────────
// Series / Parallel
// ─────────────────────────────────────────────────────────────────────────────

export function seriesResistance(resistors: number[]): number {
  if (resistors.length === 0) throw new Error('Empty array');
  return resistors
    .reduce((acc, r) => {
      if (r <= 0) throw new Error('Values must be > 0');
      return acc.plus(r);
    }, new Big(0))
    .toNumber();
}

export function parallelResistance(resistors: number[]): number {
  if (resistors.length === 0) throw new Error('Empty array');
  const sum = resistors.reduce((acc, r) => {
    if (r <= 0) throw new Error('Values must be > 0');
    return acc.plus(new Big(1).div(r));
  }, new Big(0));
  return new Big(1).div(sum).toNumber();
}

export function seriesCapacitance(capacitors: number[]): number {
  if (capacitors.length === 0) throw new Error('Empty array');
  const sum = capacitors.reduce((acc, c) => {
    if (c <= 0) throw new Error('Values must be > 0');
    return acc.plus(new Big(1).div(c));
  }, new Big(0));
  return new Big(1).div(sum).toNumber();
}

export function parallelCapacitance(capacitors: number[]): number {
  if (capacitors.length === 0) throw new Error('Empty array');
  return capacitors
    .reduce((acc, c) => {
      if (c <= 0) throw new Error('Values must be > 0');
      return acc.plus(c);
    }, new Big(0))
    .toNumber();
}

export function seriesInductance(inductors: number[]): number {
  return seriesResistance(inductors);
}

export function parallelInductance(inductors: number[]): number {
  return parallelResistance(inductors);
}

// ─────────────────────────────────────────────────────────────────────────────
// Time Constant τ = R·C
// ─────────────────────────────────────────────────────────────────────────────

export function timeConstantRC(R: number, C: number): number {
  if (R <= 0 || C <= 0) throw new Error('Resistance and capacitance must be positive');
  return new Big(R).times(C).toNumber();
}

// ─────────────────────────────────────────────────────────────────────────────
// AC Power Analysis
// ─────────────────────────────────────────────────────────────────────────────

interface AcPowerParams {
  voltage: number;
  current: number;
  phiDeg: number;
}

export function acPower({ voltage, current, phiDeg }: AcPowerParams) {
  const v = new Big(voltage);
  const i = new Big(current);
  const apparentPower = v.times(i);

  const phiRad = (phiDeg * Math.PI) / 180;
  const powerFactor = Math.cos(phiRad);
  const activePower = apparentPower.times(powerFactor);
  const reactivePower = apparentPower.times(Math.sin(phiRad));

  return {
    apparentPower: apparentPower.toNumber(),
    activePower: activePower.toNumber(),
    reactivePower: reactivePower.toNumber(),
    powerFactor,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Voltage Divider
// ─────────────────────────────────────────────────────────────────────────────

export function voltageDivider({ Vin, R1, R2 }: { Vin: number; R1: number; R2: number }): number {
  if (R1 <= 0 || R2 <= 0) throw new Error('Resistances must be positive');
  const r1 = new Big(R1);
  const r2 = new Big(R2);
  return new Big(Vin).times(r2.div(r1.plus(r2))).toNumber();
}

// ─────────────────────────────────────────────────────────────────────────────
// LED Series Resistor
// ─────────────────────────────────────────────────────────────────────────────

export function ledResistor({
  Vsupply,
  Vled,
  IledA,
}: {
  Vsupply: number;
  Vled: number;
  IledA: number;
}): number {
  if (Vsupply <= Vled) throw new Error('Supply voltage must be > LED voltage');
  if (IledA <= 0) throw new Error('LED current must be > 0');
  return new Big(Vsupply).minus(Vled).div(IledA).toNumber();
}

// ─────────────────────────────────────────────────────────────────────────────
// Bode Plot Calculation
// ─────────────────────────────────────────────────────────────────────────────

interface BodePlotParams {
  type: 'low-pass' | 'high-pass';
  R: number;
  C?: number;
  L?: number;
  points?: number;
}

export function calculateBodePlot({ type, R, C, L, points = 100 }: BodePlotParams) {
  if (R <= 0) throw new Error('Resistance must be positive');

  let fcValue: Big;
  if (C !== undefined && C > 0) {
    fcValue = new Big(1).div(new Big(2).times(Math.PI).times(R).times(C));
  } else if (L !== undefined && L > 0) {
    fcValue = new Big(R).div(new Big(2).times(Math.PI).times(L));
  } else {
    if (C !== undefined && C <= 0) throw new Error('Capacitance or Inductance must be positive');
    if (L !== undefined && L <= 0) throw new Error('Capacitance or Inductance must be positive');
    throw new Error('Either valid C or L must be provided');
  }

  const fc = fcValue.toNumber();
  const fMin = fc / 100;
  const fMax = fc * 100;

  const frequencies: number[] = [];
  const logMin = Math.log10(fMin);
  const logMax = Math.log10(fMax);
  const step = (logMax - logMin) / (points - 1 || 1);

  for (let i = 0; i < points; i++) {
    frequencies.push(Math.pow(10, logMin + i * step));
  }

  const magnitudes = frequencies.map((f) => {
    const ratio = f / fc;
    if (type === 'low-pass') {
      return -10 * Math.log10(1 + ratio * ratio);
    } else {
      return 20 * Math.log10(ratio) - 10 * Math.log10(1 + ratio * ratio);
    }
  });

  const phases = frequencies.map((f) => {
    const ratio = f / fc;
    if (type === 'low-pass') {
      return -(180 / Math.PI) * Math.atan(ratio);
    } else {
      return 90 - (180 / Math.PI) * Math.atan(ratio);
    }
  });

  return {
    fc,
    frequencies,
    magnitudes,
    phases,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Kirchhoff's Laws (2-Loop Mesh Analysis)
// ─────────────────────────────────────────────────────────────────────────────

function gaussianElimination(matrix: Big[][], constants: Big[]): Big[] {
  const n = matrix.length;
  const A = matrix.map((row, i) => [...row, constants[i]]);

  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (A[k][i].abs().gt(A[maxRow][i].abs())) {
        maxRow = k;
      }
    }

    if (A[maxRow][i].eq(0)) {
      throw new Error('Circuit has no unique valid solution (determinant is zero or near zero)');
    }

    const temp = A[i];
    A[i] = A[maxRow];
    A[maxRow] = temp;

    for (let k = i + 1; k < n; k++) {
      const factor = A[k][i].div(A[i][i]);
      for (let j = i; j <= n; j++) {
        A[k][j] = A[k][j].minus(factor.times(A[i][j]));
      }
    }
  }

  const result: Big[] = new Array(n).fill(new Big(0));
  for (let i = n - 1; i >= 0; i--) {
    let sum = new Big(0);
    for (let j = i + 1; j < n; j++) {
      sum = sum.plus(A[i][j].times(result[j]));
    }
    result[i] = A[i][n].minus(sum).div(A[i][i]);
  }

  return result;
}

/**
 * Calculates capacitor charge/discharge voltage
 * V(t) = V0 * (1 - e^(-t/RC)) for charging
 * V(t) = V0 * e^(-t/RC) for discharging
 */
export function capacitorTransient(params: {
  v0: number;
  r: number;
  c: number;
  t: number;
  mode: 'charging' | 'discharging';
}): number {
  const rc = params.r * params.c;
  if (rc === 0) return params.mode === 'charging' ? params.v0 : 0;

  if (params.mode === 'charging') {
    return params.v0 * (1 - Math.exp(-params.t / rc));
  } else {
    return params.v0 * Math.exp(-params.t / rc);
  }
}

interface Kirchhoff2LoopParams {
  V1: number;
  V2: number;
  R1: number;
  R2: number;
  R3: number;
}

export function solveKirchhoff2Loop({ V1, V2, R1, R2, R3 }: Kirchhoff2LoopParams) {
  if (R1 < 0 || R2 < 0 || R3 < 0) {
    throw new Error('Resistances cannot be negative');
  }

  const v1 = new Big(V1);
  const v2 = new Big(V2);
  const r1 = new Big(R1);
  const r2 = new Big(R2);
  const r3 = new Big(R3);

  const matrix: Big[][] = [
    [r1.plus(r3), r3],
    [r3, r2.plus(r3)],
  ];
  const constants: Big[] = [v1, v2];

  const solution = gaussianElimination(matrix, constants);

  const I1 = solution[0];
  const I2 = solution[1];
  const I3 = I1.plus(I2); // Current down through the middle branch

  return {
    I1: I1.toNumber(),
    I2: I2.toNumber(),
    I3: I3.toNumber(),
  };
}
