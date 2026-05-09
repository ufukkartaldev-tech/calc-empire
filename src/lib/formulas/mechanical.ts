import Big from 'big.js';

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

  const w = new Big(W);
  const l = new Big(L);
  const e = new Big(E);
  const iVal = new Big(I);

  if (type === 'cantilever') {
    return w.times(l.pow(3)).div(new Big(3).times(e).times(iVal)).toNumber();
  } else if (type === 'simply-supported') {
    return w.times(l.pow(3)).div(new Big(48).times(e).times(iVal)).toNumber();
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

  const ratio = new Big(drivenTeeth).div(driverTeeth);
  const outputSpeedRpm =
    inputSpeedRpm !== undefined ? new Big(inputSpeedRpm).div(ratio).toNumber() : undefined;
  const outputTorqueNm =
    inputTorqueNm !== undefined ? new Big(inputTorqueNm).times(ratio).toNumber() : undefined;

  return { ratio: ratio.toNumber(), outputSpeedRpm, outputTorqueNm };
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
  let T: Big | undefined = torqueNm !== undefined ? new Big(torqueNm) : undefined;
  let w: Big | undefined = omegaRadS !== undefined ? new Big(omegaRadS) : undefined;
  let P: Big | undefined = powerW !== undefined ? new Big(powerW) : undefined;

  if (speedRpm !== undefined) {
    w = new Big(2).times(Math.PI).times(speedRpm).div(60);
  }

  const count = [T, w, P].filter((v) => v !== undefined).length;
  if (count < 2) throw new Error('Not enough parameters');

  if (T !== undefined && w !== undefined) {
    P = T.times(w);
  } else if (P !== undefined && w !== undefined && !w.eq(0)) {
    T = P.div(w);
  } else if (P !== undefined && T !== undefined && !T.eq(0)) {
    w = P.div(T);
  }

  return {
    torqueNm: T?.toNumber(),
    omegaRadS: w?.toNumber(),
    powerW: P?.toNumber(),
  };
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

  const l0 = new Big(L0);
  const deltaL = l0.times(alpha).times(deltaT);
  const Lfinal = l0.plus(deltaL);

  return { deltaL: deltaL.toNumber(), Lfinal: Lfinal.toNumber() };
}

/**
 * Calculates Hooke's Law (F = k * x)
 */
export function hookesLaw(params: { force?: number; k?: number; displacement?: number }): {
  force?: number;
  k?: number;
  displacement?: number;
} {
  const { force, k, displacement } = params;

  if (force === undefined && k !== undefined && displacement !== undefined) {
    return { force: k * displacement };
  }
  if (k === undefined && force !== undefined && displacement !== undefined && displacement !== 0) {
    return { k: force / displacement };
  }
  if (displacement === undefined && force !== undefined && k !== undefined && k !== 0) {
    return { displacement: force / k };
  }
  return {};
}
