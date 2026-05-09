/**
 * @file chemistry.ts
 * @description Chemistry formulas and calculations
 */

/**
 * Calculates Molarity (M = n / V)
 */
export function calculateMolarity(params: { molarity?: number; moles?: number; volume?: number }): {
  molarity?: number;
  moles?: number;
  volume?: number;
} {
  const { molarity, moles, volume } = params;

  if (molarity === undefined && moles !== undefined && volume !== undefined && volume !== 0) {
    return { molarity: moles / volume };
  }
  if (moles === undefined && molarity !== undefined && volume !== undefined) {
    return { moles: molarity * volume };
  }
  if (volume === undefined && molarity !== undefined && moles !== undefined && molarity !== 0) {
    return { volume: moles / molarity };
  }
  return {};
}

/**
 * Calculates Moles from mass and molar mass (n = m / MW)
 */
export function calculateMoles(params: { moles?: number; mass?: number; molarMass?: number }): {
  moles?: number;
  mass?: number;
  molarMass?: number;
} {
  const { moles, mass, molarMass } = params;

  if (moles === undefined && mass !== undefined && molarMass !== undefined && molarMass !== 0) {
    return { moles: mass / molarMass };
  }
  if (mass === undefined && moles !== undefined && molarMass !== undefined) {
    return { mass: moles * molarMass };
  }
  if (molarMass === undefined && mass !== undefined && moles !== undefined && moles !== 0) {
    return { molarMass: mass / moles };
  }
  return {};
}
