/**
 * @file mechanical.ts
 * @description Implementations for mechanical engineering formulas.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Beam Deflection
// ─────────────────────────────────────────────────────────────────────────────

interface BeamDeflectionParams {
  W: number;
  L: number;
  E: number;
  I: number;
  type: 'cantilever' | 'simply-supported';
}

export function beamDeflection({ W, L, E, I, type }: BeamDeflectionParams): number {
  if (L <= 0) throw new Error('Span length must be positive');
  if (E <= 0 || I <= 0) throw new Error('E and I must be positive');

  if (type === 'cantilever') {
    return (W * Math.pow(L, 3)) / (3 * E * I);
  } else if (type === 'simply-supported') {
    return (W * Math.pow(L, 3)) / (48 * E * I);
  } else {
    throw new Error('Unknown beam type');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Gear Ratio
// ─────────────────────────────────────────────────────────────────────────────

interface GearRatioParams {
  driverTeeth: number;
  drivenTeeth: number;
  inputSpeedRpm?: number;
  inputTorqueNm?: number;
}

export function gearRatio({
  driverTeeth,
  drivenTeeth,
  inputSpeedRpm,
  inputTorqueNm,
}: GearRatioParams) {
  if (driverTeeth <= 0 || drivenTeeth <= 0) throw new Error('Teeth must be > 0');

  const ratio = drivenTeeth / driverTeeth;
  const outputSpeedRpm = inputSpeedRpm !== undefined ? inputSpeedRpm / ratio : undefined;
  const outputTorqueNm = inputTorqueNm !== undefined ? inputTorqueNm * ratio : undefined;

  return { ratio, outputSpeedRpm, outputTorqueNm };
}

// ─────────────────────────────────────────────────────────────────────────────
// Torque and Power
// ─────────────────────────────────────────────────────────────────────────────

interface TorquePowerParams {
  torqueNm?: number;
  speedRpm?: number;
  omegaRadS?: number;
  powerW?: number;
}

export function torquePower({
  torqueNm,
  speedRpm,
  omegaRadS,
  powerW,
}: TorquePowerParams): TorquePowerParams {
  let T = torqueNm;
  let w = omegaRadS;
  let P = powerW;

  if (speedRpm !== undefined) {
    w = (2 * Math.PI * speedRpm) / 60;
  }

  const count = [T, w, P].filter((v) => v !== undefined).length;
  if (count < 2) throw new Error('Not enough parameters');

  if (T !== undefined && w !== undefined) {
    P = T * w;
  } else if (P !== undefined && w !== undefined && w !== 0) {
    T = P / w;
  } else if (P !== undefined && T !== undefined && T !== 0) {
    w = P / T;
  }

  return { torqueNm: T, omegaRadS: w, powerW: P };
}

// ─────────────────────────────────────────────────────────────────────────────
// Thermal Expansion
// ─────────────────────────────────────────────────────────────────────────────

interface ThermalExpansionParams {
  L0: number;
  alpha: number;
  deltaT: number;
}

export function thermalExpansion({ L0, alpha, deltaT }: ThermalExpansionParams) {
  if (L0 <= 0) throw new Error('Initial length must be > 0');
  if (alpha <= 0) throw new Error('Thermal expansion coefficient must be > 0');

  const deltaL = L0 * alpha * deltaT;
  const Lfinal = L0 + deltaL;

  return { deltaL, Lfinal };
}
